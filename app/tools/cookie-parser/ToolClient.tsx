"use client";

import { useState, type ChangeEvent } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type CookieMode = "cookie" | "set-cookie";

type ParsedCookiePair = {
  name: string;
  value: string;
  rawValue: string;
  quoted: boolean;
  percentDecoded?: string;
  percentDecodeError?: string;
};

type ParsedAttribute = {
  name: string;
  value: string | null;
};

const knownAttributes: Record<string, string> = {
  domain: "Domain",
  path: "Path",
  expires: "Expires",
  "max-age": "Max-Age",
  secure: "Secure",
  httponly: "HttpOnly",
  samesite: "SameSite",
  partitioned: "Partitioned",
};

function stripHeaderPrefix(line: string, expected: string): string {
  const match = line.match(/^([^:]+):(.*)$/);
  if (!match) return line.trim();
  return match[1].trim().toLowerCase() === expected
    ? match[2].trim()
    : line.trim();
}

function parsePair(segment: string): ParsedCookiePair | null {
  const index = segment.indexOf("=");
  if (index <= 0) return null;

  const name = segment.slice(0, index).trim();
  const rawValue = segment.slice(index + 1).trim();
  if (!name) return null;

  const quoted = rawValue.length >= 2 && rawValue[0] === '"' && rawValue[rawValue.length - 1] === '"';
  const value = quoted ? rawValue.slice(1, -1) : rawValue;
  const pair: ParsedCookiePair = { name, value, rawValue, quoted };

  if (value.indexOf("%") !== -1) {
    try {
      const decoded = decodeURIComponent(value);
      if (decoded !== value) pair.percentDecoded = decoded;
    } catch {
      pair.percentDecodeError = "Value contains percent escapes that decodeURIComponent() cannot decode as valid UTF-8.";
    }
  }

  return pair;
}

function parseRequestCookie(input: string) {
  const diagnostics: string[] = [];
  const normalized = stripHeaderPrefix(input.trim(), "cookie");
  const segments = normalized.split(";");
  const cookies: ParsedCookiePair[] = [];
  const counts: Record<string, number> = {};

  segments.forEach((segment, index) => {
    const trimmed = segment.trim();
    if (!trimmed) return;
    const pair = parsePair(trimmed);
    if (!pair) {
      diagnostics.push(`Segment ${index + 1} is not a valid name=value cookie pair and was not parsed.`);
      return;
    }
    cookies.push(pair);
    counts[pair.name] = (counts[pair.name] || 0) + 1;
  });

  Object.keys(counts).forEach((name) => {
    if (counts[name] > 1) {
      diagnostics.push(`Cookie name "${name}" appears ${counts[name]} times. Order is preserved instead of overwriting earlier values.`);
    }
  });

  if (!cookies.length) diagnostics.push("No cookie name=value pairs were found.");

  return {
    kind: "Cookie request header",
    cookieCount: cookies.length,
    cookies,
    diagnostics,
    note: "Cookie header values are kept raw. Percent-decoded values are previews only; percent-decoding is not part of HTTP cookie syntax.",
  };
}

function normalizeSetCookieLines(input: string): string[] {
  const lines = input.replace(/\r\n?/g, "\n").split("\n");
  const usable = lines.map((line) => line.trim()).filter(Boolean);
  const prefixed = usable.filter((line) => /^set-cookie\s*:/i.test(line));
  if (prefixed.length) return prefixed.map((line) => stripHeaderPrefix(line, "set-cookie"));
  return usable;
}

function parseSetCookie(input: string) {
  const lines = normalizeSetCookieLines(input);
  const diagnostics: string[] = [];
  const cookies = lines.map((line, lineIndex) => {
    const segments = line.split(";");
    const pair = parsePair((segments.shift() || "").trim());
    const attributes: ParsedAttribute[] = [];
    const seenAttributes: Record<string, number> = {};
    const localDiagnostics: string[] = [];

    if (!pair) {
      localDiagnostics.push(`Line ${lineIndex + 1} does not start with a valid cookie name=value pair.`);
    }

    segments.forEach((segment) => {
      const trimmed = segment.trim();
      if (!trimmed) return;
      const index = trimmed.indexOf("=");
      const rawName = (index === -1 ? trimmed : trimmed.slice(0, index)).trim();
      const value = index === -1 ? null : trimmed.slice(index + 1).trim();
      const lower = rawName.toLowerCase();
      const name = knownAttributes[lower] || rawName;
      attributes.push({ name, value });
      seenAttributes[lower] = (seenAttributes[lower] || 0) + 1;
    });

    Object.keys(seenAttributes).forEach((name) => {
      if (seenAttributes[name] > 1) {
        localDiagnostics.push(`Attribute "${name}" appears more than once; user-agent handling can be surprising, so inspect the source header.`);
      }
    });

    const has = (name: string) => attributes.some((attribute) => attribute.name.toLowerCase() === name.toLowerCase());
    const get = (name: string) => {
      const found = attributes.find((attribute) => attribute.name.toLowerCase() === name.toLowerCase());
      return found ? found.value : null;
    };

    const sameSite = get("SameSite");
    if (sameSite && !/^(strict|lax|none)$/i.test(sameSite)) {
      localDiagnostics.push(`SameSite value "${sameSite}" is not Strict, Lax, or None.`);
    }
    if (sameSite && /^none$/i.test(sameSite) && !has("Secure")) {
      localDiagnostics.push("SameSite=None is normally required to be paired with Secure by modern browsers.");
    }
    if (has("Partitioned") && !has("Secure")) {
      localDiagnostics.push("Partitioned cookies require Secure in supporting browsers.");
    }

    if (pair && pair.name.indexOf("__Secure-") === 0 && !has("Secure")) {
      localDiagnostics.push("A __Secure- cookie should be set with Secure from a secure origin.");
    }
    if (pair && pair.name.indexOf("__Host-") === 0) {
      if (!has("Secure")) localDiagnostics.push("A __Host- cookie should include Secure.");
      if (has("Domain")) localDiagnostics.push("A __Host- cookie should not include Domain.");
      if (get("Path") !== "/") localDiagnostics.push("A __Host- cookie should use Path=/.");
    }

    const maxAge = get("Max-Age");
    if (maxAge !== null && !/^-?\d+$/.test(maxAge || "")) {
      localDiagnostics.push("Max-Age should be an integer number of seconds.");
    }

    const expires = get("Expires");
    if (expires && Number.isNaN(Date.parse(expires))) {
      localDiagnostics.push("Expires could not be parsed as a date by this browser. User-agent cookie date parsing can be more permissive than Date.parse().");
    }

    attributes.forEach((attribute) => {
      if (!knownAttributes[attribute.name.toLowerCase()]) {
        localDiagnostics.push(`Unrecognized attribute "${attribute.name}" is preserved as written.`);
      }
    });

    return {
      line: lineIndex + 1,
      cookie: pair,
      attributes,
      diagnostics: localDiagnostics,
    };
  });

  if (!lines.length) diagnostics.push("No Set-Cookie lines were found.");
  if (lines.length > 1) diagnostics.push("Multiple Set-Cookie lines are preserved separately; they must not be comma-combined.");

  return {
    kind: "Set-Cookie response header",
    setCookieCount: cookies.length,
    cookies,
    diagnostics,
    note: "This is structural inspection, not a browser policy simulator. Acceptance can also depend on origin, scheme, domain matching, browser policy, and cookie-store state.",
  };
}

export default function ToolClient() {
  const [mode, setMode] = useState<CookieMode>("cookie");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const parseCookies = () => {
    if (!input.trim()) {
      setError(mode === "cookie" ? "Enter a Cookie request header or cookie string." : "Enter one or more Set-Cookie response header lines.");
      setOutput("");
      return;
    }

    const result = mode === "cookie" ? parseRequestCookie(input) : parseSetCookie(input);
    setOutput(JSON.stringify(result, null, 2));
    setError("");
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="Cookie Parser"
      description="Inspect Cookie request headers and Set-Cookie response headers without losing repeated names, attributes, or raw values."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Header type</label>
        <select
          value={mode}
          onChange={(event: ChangeEvent<HTMLSelectElement>) => {
            setMode(event.target.value as CookieMode);
            setOutput("");
            setError("");
          }}
          className="w-full rounded-xl border border-gray-300 bg-white p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        >
          <option value="cookie">Cookie request header</option>
          <option value="set-cookie">Set-Cookie response header(s)</option>
        </select>
      </div>

      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          {mode === "cookie" ? "Cookie header" : "Set-Cookie header lines"}
        </label>
        <textarea
          value={input}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)}
          placeholder={
            mode === "cookie"
              ? "Cookie: session_id=abc123; theme=dark; feature=one; feature=two"
              : "Set-Cookie: session_id=abc123; Path=/; Secure; HttpOnly; SameSite=Lax\nSet-Cookie: theme=dark; Max-Age=86400; Path=/"
          }
          className="w-full min-h-[240px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={parseCookies} className="yoryantra-btn">Parse Cookies</button>
        <button onClick={resetAll} className="yoryantra-btn-outline">Reset</button>
      </div>

      {error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Parsed Cookie Data</h3>
          {output && (
            <button onClick={() => navigator.clipboard.writeText(output)} className="yoryantra-btn-outline text-sm">Copy</button>
          )}
        </div>
        <pre className="yoryantra-output min-h-[240px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {output || "Parsed cookie data and diagnostics will appear here."}
        </pre>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Cookie and Set-Cookie are different headers</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A browser sends stored cookies to a server in a <code>Cookie</code> request header. A server creates or updates cookies with one or more <code>Set-Cookie</code> response headers. The request form is mainly an ordered list of name-value pairs; the response form adds attributes such as Path, Domain, Expires, Max-Age, Secure, HttpOnly, SameSite, and Partitioned.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This distinction matters when debugging. Treating Set-Cookie attributes as ordinary request cookies, or combining multiple Set-Cookie lines with commas, changes the meaning of the header.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Raw values stay authoritative</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Cookie syntax does not define URL percent-decoding. Some applications choose to encode cookie values with percent escapes, so the parser shows a decoded preview when <code>decodeURIComponent()</code> can decode the value, but it keeps the original value alongside it. One malformed percent sequence does not make unrelated cookies disappear.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What the Set-Cookie checks can and cannot tell you</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The response mode flags common structural problems such as SameSite=None without Secure, Partitioned without Secure, suspicious Max-Age values, and common cookie-prefix requirements. It does not simulate a browser cookie store or prove that a cookie will be accepted: the result can also depend on the response origin, HTTPS, domain and path matching, browser policy, and existing cookie state.
          </p>
        </div>

        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <h3 className="text-sm font-semibold text-yellow-900">Sensitive data</h3>
          <p className="mt-2 text-sm leading-relaxed text-yellow-800">
            Session cookies and authentication cookies can grant account access. Parsing is local to this browser, but copying or sharing the parsed output can still expose the secret values it contains.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">References</h2>
          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li><a href="https://www.rfc-editor.org/rfc/rfc6265" target="_blank" rel="noreferrer" className="underline underline-offset-2">RFC 6265</a> — HTTP State Management Mechanism.</li>
            <li><a href="https://www.rfc-editor.org/rfc/rfc9110" target="_blank" rel="noreferrer" className="underline underline-offset-2">RFC 9110</a> — HTTP field-line handling and the Set-Cookie exception.</li>
            <li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie" target="_blank" rel="noreferrer" className="underline underline-offset-2">MDN Set-Cookie reference</a> — current browser-facing guidance for SameSite, Partitioned, Secure, HttpOnly, and cookie prefixes.</li>
          </ul>
        </div>
      </section>

      <YoryantraRelatedTools currentHref="/tools/cookie-parser" />
    </ToolShell>
  );
}
