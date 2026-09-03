"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type CookieMode = "cookie" | "set-cookie";

type ParsedCookiePair = {
  name: string;
  value: string;
  rawValue: string;
  quoted: boolean;
  nameSyntax: "valid" | "invalid";
  valueSyntax: "valid" | "nonstandard";
  percentDecoded?: string;
  percentDecodeIssue?: string;
};

type ParsedAttribute = {
  name: string;
  rawName: string;
  value: string | null;
  known: boolean;
};

type CookieResult = {
  kind: string;
  cookieCount: number;
  cookies: unknown[];
  diagnostics: string[];
  note: string;
};

const TOKEN_PATTERN = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;

const KNOWN_ATTRIBUTES: Record<string, string> = {
  domain: "Domain",
  path: "Path",
  expires: "Expires",
  "max-age": "Max-Age",
  secure: "Secure",
  httponly: "HttpOnly",
  samesite: "SameSite",
  partitioned: "Partitioned",
};

const FLAG_ATTRIBUTES = ["secure", "httponly", "partitioned"];

function createStringCountMap() {
  return Object.create(null) as Record<string, number>;
}

function stripHeaderPrefix(line: string, expected: string) {
  const match = line.match(/^([^:]+):(.*)$/);
  if (!match) return line.trim();

  return match[1].trim().toLowerCase() === expected
    ? match[2].trim()
    : line.trim();
}

function isCookieValueSyntaxValid(value: string) {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    const valid =
      code === 0x21 ||
      (code >= 0x23 && code <= 0x2b) ||
      (code >= 0x2d && code <= 0x3a) ||
      (code >= 0x3c && code <= 0x5b) ||
      (code >= 0x5d && code <= 0x7e);

    if (!valid) return false;
  }

  return true;
}

function decodePercentPreview(value: string) {
  if (value.indexOf("%") === -1) return {};

  if (/%(?![0-9A-Fa-f]{2})/.test(value)) {
    return {
      percentDecodeIssue:
        "Contains a % that is not followed by two hexadecimal digits. Raw cookie syntax is preserved.",
    };
  }

  try {
    const decoded = decodeURIComponent(value);
    return decoded === value ? {} : { percentDecoded: decoded };
  } catch {
    return {
      percentDecodeIssue:
        "Percent escapes are present, but their bytes are not valid UTF-8 for decodeURIComponent(). Raw cookie syntax is preserved.",
    };
  }
}

function parsePair(segment: string): ParsedCookiePair | null {
  const equals = segment.indexOf("=");
  if (equals <= 0) return null;

  const name = segment.slice(0, equals).trim();
  const rawValue = segment.slice(equals + 1).trim();
  if (!name) return null;

  const quoted =
    rawValue.length >= 2 &&
    rawValue.charAt(0) === '"' &&
    rawValue.charAt(rawValue.length - 1) === '"';

  const value = quoted ? rawValue.slice(1, -1) : rawValue;
  const preview = decodePercentPreview(value);

  return {
    name,
    value,
    rawValue,
    quoted,
    nameSyntax: TOKEN_PATTERN.test(name) ? "valid" : "invalid",
    valueSyntax: isCookieValueSyntaxValid(value) ? "valid" : "nonstandard",
    ...preview,
  };
}

function parseRequestCookie(input: string): CookieResult {
  const lines = input
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const explicit = lines.filter((line) => /^cookie\s*:/i.test(line));
  const sourceLines = explicit.length
    ? explicit.map((line) => stripHeaderPrefix(line, "cookie"))
    : lines;

  const diagnostics: string[] = [];
  const cookies: ParsedCookiePair[] = [];
  const counts = createStringCountMap();

  if (explicit.length && explicit.length !== lines.length) {
    diagnostics.push(
      `${lines.length - explicit.length} non-Cookie header line${
        lines.length - explicit.length === 1 ? " was" : "s were"
      } ignored because explicit Cookie: lines were detected.`
    );
  }

  sourceLines.forEach((line, lineIndex) => {
    line.split(";").forEach((segment, segmentIndex) => {
      const trimmed = segment.trim();
      if (!trimmed) return;

      const pair = parsePair(trimmed);

      if (!pair) {
        diagnostics.push(
          `Cookie line ${lineIndex + 1}, segment ${
            segmentIndex + 1
          } is not a name=value pair and was not parsed.`
        );
        return;
      }

      cookies.push(pair);
      counts[pair.name] = (counts[pair.name] || 0) + 1;

      if (pair.nameSyntax === "invalid") {
        diagnostics.push(
          `Cookie name "${pair.name}" contains characters outside normal HTTP token syntax.`
        );
      }

      if (pair.valueSyntax === "nonstandard") {
        diagnostics.push(
          `Cookie "${pair.name}" contains characters outside the traditional RFC 6265 cookie-octet set. The raw value is preserved for inspection.`
        );
      }

      if (pair.percentDecodeIssue) {
        diagnostics.push(
          `Cookie "${pair.name}": ${pair.percentDecodeIssue}`
        );
      }
    });
  });

  Object.keys(counts).forEach((name) => {
    if (counts[name] > 1) {
      diagnostics.push(
        `Cookie name "${name}" appears ${counts[name]} times. Every occurrence is preserved instead of overwriting earlier values.`
      );
    }
  });

  if (sourceLines.length > 1) {
    diagnostics.push(
      "More than one Cookie header line was supplied. Line order is preserved; HTTP/2 and HTTP/3 can split Cookie across field lines and define how those values are recombined."
    );
  }

  if (!cookies.length) {
    diagnostics.push("No cookie name=value pairs were found.");
  }

  return {
    kind: "Cookie request header",
    cookieCount: cookies.length,
    cookies,
    diagnostics,
    note:
      "Percent-decoded values are convenience previews only. Percent-decoding is not part of the Cookie header grammar itself.",
  };
}

function attributeLookup(attributes: ParsedAttribute[], name: string) {
  const lower = name.toLowerCase();

  for (let index = attributes.length - 1; index >= 0; index -= 1) {
    if (attributes[index].name.toLowerCase() === lower) {
      return attributes[index];
    }
  }

  return null;
}

function hasAttribute(attributes: ParsedAttribute[], name: string) {
  return attributeLookup(attributes, name) !== null;
}

function checkCookiePrefix(
  pair: ParsedCookiePair | null,
  attributes: ParsedAttribute[],
  diagnostics: string[]
) {
  if (!pair) return;

  const secure = hasAttribute(attributes, "Secure");
  const httpOnly = hasAttribute(attributes, "HttpOnly");
  const domain = hasAttribute(attributes, "Domain");
  const path = attributeLookup(attributes, "Path");

  if (pair.name.indexOf("__Secure-") === 0 && !secure) {
    diagnostics.push(
      "The __Secure- prefix requires the Secure attribute in supporting browsers and must be set from a secure origin."
    );
  }

  if (pair.name.indexOf("__Host-") === 0) {
    if (!secure) {
      diagnostics.push(
        "The __Host- prefix requires Secure in supporting browsers."
      );
    }

    if (domain) {
      diagnostics.push(
        "The __Host- prefix must not include a Domain attribute."
      );
    }

    if (!path || path.value !== "/") {
      diagnostics.push("The __Host- prefix requires Path=/.");
    }
  }

  if (pair.name.indexOf("__Http-") === 0) {
    if (!secure) {
      diagnostics.push(
        "The __Http- prefix requires Secure in supporting browsers."
      );
    }

    if (!httpOnly) {
      diagnostics.push(
        "The __Http- prefix requires HttpOnly in supporting browsers."
      );
    }
  }

  if (pair.name.indexOf("__Host-Http-") === 0 && !httpOnly) {
    diagnostics.push(
      "The __Host-Http- prefix additionally requires HttpOnly in supporting browsers."
    );
  }
}

function parseSetCookie(input: string): CookieResult {
  const lines = input
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const explicit = lines.filter((line) => /^set-cookie\s*:/i.test(line));
  const sourceLines = explicit.length
    ? explicit.map((line) => stripHeaderPrefix(line, "set-cookie"))
    : lines;

  const diagnostics: string[] = [];
  const parsedCookies: unknown[] = [];

  if (explicit.length && explicit.length !== lines.length) {
    diagnostics.push(
      `${lines.length - explicit.length} non-Set-Cookie header line${
        lines.length - explicit.length === 1 ? " was" : "s were"
      } ignored because explicit Set-Cookie: lines were detected.`
    );
  }

  sourceLines.forEach((line, lineIndex) => {
    const segments = line.split(";");
    const pair = parsePair((segments.shift() || "").trim());
    const attributes: ParsedAttribute[] = [];
    const localDiagnostics: string[] = [];
    const seen = createStringCountMap();

    if (!pair) {
      localDiagnostics.push(
        `Line ${lineIndex + 1} does not begin with a valid cookie name=value pair.`
      );
    }

    segments.forEach((segment) => {
      const trimmed = segment.trim();
      if (!trimmed) return;

      const equals = trimmed.indexOf("=");
      const rawName = (
        equals === -1 ? trimmed : trimmed.slice(0, equals)
      ).trim();
      const value =
        equals === -1 ? null : trimmed.slice(equals + 1).trim();
      const lower = rawName.toLowerCase();
      const canonical = KNOWN_ATTRIBUTES[lower] || rawName;

      attributes.push({
        name: canonical,
        rawName,
        value,
        known: Boolean(KNOWN_ATTRIBUTES[lower]),
      });

      seen[lower] = (seen[lower] || 0) + 1;

      if (!TOKEN_PATTERN.test(rawName)) {
        localDiagnostics.push(
          `Attribute name "${rawName}" contains characters outside normal token syntax.`
        );
      }

      if (FLAG_ATTRIBUTES.indexOf(lower) !== -1 && value !== null) {
        localDiagnostics.push(
          `${canonical} is normally a flag attribute without =${value}.`
        );
      }
    });

    Object.keys(seen).forEach((name) => {
      if (seen[name] > 1) {
        localDiagnostics.push(
          `Attribute "${name}" appears ${seen[name]} times. Duplicate Set-Cookie attributes deserve review.`
        );
      }
    });

    const sameSite = attributeLookup(attributes, "SameSite");
    const secure = hasAttribute(attributes, "Secure");
    const partitioned = hasAttribute(attributes, "Partitioned");
    const maxAge = attributeLookup(attributes, "Max-Age");
    const expires = attributeLookup(attributes, "Expires");
    const domain = attributeLookup(attributes, "Domain");
    const path = attributeLookup(attributes, "Path");

    if (
      domain &&
      (domain.value === null || domain.value === "")
    ) {
      localDiagnostics.push(
        "Domain is present without a domain value. Browser acceptance depends on the full Set-Cookie processing rules and the response origin."
      );
    }

    if (
      path &&
      (path.value === null || path.value === "" || path.value.charAt(0) !== "/")
    ) {
      localDiagnostics.push(
        "Path is empty or does not begin with /. User agents fall back to a default path rather than treating that text as an ordinary absolute cookie path."
      );
    }

    if (
      sameSite &&
      (sameSite.value === null || sameSite.value === "")
    ) {
      localDiagnostics.push(
        "SameSite is present without a value. It does not express Strict, Lax, or None."
      );
    }

    if (
      maxAge &&
      (maxAge.value === null || maxAge.value === "")
    ) {
      localDiagnostics.push(
        "Max-Age is present without an integer value."
      );
    }

    if (
      expires &&
      (expires.value === null || expires.value === "")
    ) {
      localDiagnostics.push(
        "Expires is present without a date value."
      );
    }

    if (
      sameSite &&
      sameSite.value &&
      !/^(strict|lax|none)$/i.test(sameSite.value)
    ) {
      localDiagnostics.push(
        `SameSite value "${sameSite.value}" is not Strict, Lax, or None.`
      );
    }

    if (
      sameSite &&
      sameSite.value &&
      /^none$/i.test(sameSite.value) &&
      !secure
    ) {
      localDiagnostics.push(
        "SameSite=None requires Secure in modern browsers."
      );
    }

    if (partitioned && !secure) {
      localDiagnostics.push(
        "Partitioned cookies require Secure in supporting browsers."
      );
    }

    if (
      maxAge &&
      maxAge.value !== null &&
      !/^-?\d+$/.test(maxAge.value)
    ) {
      localDiagnostics.push(
        "Max-Age should be an integer number of seconds."
      );
    }

    if (maxAge && expires) {
      localDiagnostics.push(
        "Both Max-Age and Expires are present. When both are recognized, Max-Age takes precedence."
      );
    }

    if (
      expires &&
      expires.value &&
      Number.isNaN(Date.parse(expires.value))
    ) {
      localDiagnostics.push(
        "Expires could not be parsed by JavaScript Date.parse(). Treat this as a warning rather than proof a browser will reject it."
      );
    }

    if (
      domain &&
      domain.value &&
      domain.value.charAt(0) === "."
    ) {
      localDiagnostics.push(
        "Domain starts with a leading dot. Modern cookie handling ignores that leading dot."
      );
    }

    attributes.forEach((attribute) => {
      if (!attribute.known) {
        localDiagnostics.push(
          `Unrecognized attribute "${attribute.rawName}" is preserved as written. It may be an extension or newer browser feature.`
        );
      }
    });

    checkCookiePrefix(pair, attributes, localDiagnostics);

    const commaCombinedPair =
      line.match(/,\s*[!#$%&'*+\-.^_`|~0-9A-Za-z]+\s*=/);

    if (commaCombinedPair) {
      localDiagnostics.push(
        "The line looks as though more than one Set-Cookie field may have been comma-combined. Set-Cookie field lines are kept separate; a comma inside Expires is not a safe splitting boundary."
      );
    }

    if (
      pair &&
      /^(?:__Secure-|__Host-|__Http-|__Host-Http-)/.test(pair.name)
    ) {
      localDiagnostics.push(
        "A cookie-name prefix also depends on the response being accepted from an appropriate secure origin. That origin context is not present in pasted header text."
      );
    }

    parsedCookies.push({
      line: lineIndex + 1,
      cookie: pair,
      attributes,
      securitySummary: {
        secure,
        httpOnly: hasAttribute(attributes, "HttpOnly"),
        sameSite: sameSite ? sameSite.value : null,
        partitioned,
        domain: domain ? domain.value : null,
        path: path ? path.value : null,
      },
      diagnostics: localDiagnostics,
    });
  });

  if (sourceLines.length > 1) {
    diagnostics.push(
      "Multiple Set-Cookie fields are preserved separately. They should not be blindly comma-combined."
    );
  }

  if (!sourceLines.length) {
    diagnostics.push("No Set-Cookie lines were found.");
  }

  return {
    kind: "Set-Cookie response header",
    cookieCount: parsedCookies.length,
    cookies: parsedCookies,
    diagnostics,
    note:
      "This is structural inspection, not a browser cookie-store simulator. Acceptance also depends on origin, scheme, Domain/Path matching, public-suffix rules, browser policy, feature support, and current cookie-store state.",
  };
}

export default function ToolClient() {
  const [mode, setMode] = useState<CookieMode>("cookie");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const lineCount = useMemo(
    () =>
      input ? input.replace(/\r\n?/g, "\n").split("\n").length : 0,
    [input]
  );

  const run = () => {
    if (!input.trim()) {
      setError(
        mode === "cookie"
          ? "Enter a Cookie request header or cookie string."
          : "Enter one or more Set-Cookie response header lines."
      );
      setOutput("");
      return;
    }

    const result =
      mode === "cookie"
        ? parseRequestCookie(input)
        : parseSetCookie(input);

    setOutput(JSON.stringify(result, null, 2));
    setError("");
    setCopied(false);
  };

  const loadExample = () => {
    setInput(
      mode === "cookie"
        ? "Cookie: display_name=Sneha; theme=dark; filter=one; filter=two"
        : "Set-Cookie: session_id=abc123; Path=/; Secure; HttpOnly; SameSite=Lax\nSet-Cookie: display_name=Sneha; Max-Age=86400; Path=/"
    );
    setOutput("");
    setError("");
    setCopied(false);
  };

  const reset = () => {
    setInput("");
    setOutput("");
    setError("");
    setCopied(false);
  };

  const copy = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setError(
        "The parsed output could not be copied. Select and copy it manually."
      );
    }
  };

  return (
    <ToolShell
      title="Cookie Parser"
      description="Read Cookie request headers and Set-Cookie response fields without losing duplicate names, raw values, attributes, or browser-facing warnings."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <YoryantraSelect
          label="Header type"
          value={mode}
          onChange={(value) => {
            setMode(value as CookieMode);
            setOutput("");
            setError("");
            setCopied(false);
          }}
          options={[
            { label: "Cookie request header", value: "cookie" },
            { label: "Set-Cookie response header(s)", value: "set-cookie" },
          ]}
        />

        <div className="mt-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <label className="block text-sm font-semibold text-gray-900">
                {mode === "cookie"
                  ? "Cookie header or cookie string"
                  : "Set-Cookie header line(s)"}
              </label>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">
                {mode === "cookie"
                  ? "A request Cookie header carries stored name-value pairs back to a matching site."
                  : "A response Set-Cookie field asks the browser to create or update stored state."}
              </p>
            </div>
            <p className="text-xs text-gray-500">
              {lineCount.toLocaleString()} line{lineCount === 1 ? "" : "s"}
            </p>
          </div>

          <textarea
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            placeholder={
              mode === "cookie"
                ? "Cookie: display_name=Sneha; theme=dark; session_id=abc123"
                : "Set-Cookie: session_id=abc123; Path=/; Secure; HttpOnly; SameSite=Lax"
            }
            spellCheck={false}
            className="mt-4 w-full min-h-[280px] rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={run} className="yoryantra-btn">
          Parse Cookies
        </button>
        <button type="button" onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>
        <button type="button" onClick={reset} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Parsed Cookie Data
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Raw values stay visible so convenience diagnostics do not silently rewrite the source.
            </p>
          </div>
          {output ? (
            <button type="button" onClick={copy} className="yoryantra-btn-outline text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          ) : null}
        </div>

        <pre className="mt-4 yoryantra-output min-h-[260px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output ||
            "Parsed cookie values, attributes, duplicate names, security summary, and diagnostics will appear here."}
        </pre>
      </div>

      <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <h3 className="text-sm font-semibold text-gray-900">
          Cookies can contain live account credentials
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">
          Session cookies can sometimes be enough to access an account. Parsing stays in your browser and no cookie-parsing API receives the pasted text, but screenshots, copied output, or shared logs can still expose secrets. Site-wide analytics or advertising scripts, if enabled, are separate from this parsing operation.
        </p>
      </div>

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Reading a Cookie Header Without Guessing
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Cookie headers look simple because most of them are short, but they can represent several different things at once: a login session, language choice, shopping-cart identifier, experiment assignment, analytics state, or some application-specific value. The first useful question is not “what is a cookie?” but “what is this browser actually sending or being asked to store?”
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            If you copied a line from browser developer tools, first identify its direction. A server sends <code>Set-Cookie</code> in a response when it wants the browser to create or update a cookie. On a later matching request, the browser can send stored name-value pairs back in the <code>Cookie</code> request header. Those two headers are related, but they do not contain the same information.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            A Quick Walkthrough
          </h2>
          <div className="mt-4 overflow-auto rounded-xl bg-white p-4 font-mono text-sm leading-7 text-gray-800">
            Cookie: session_id=abc123; theme=dark; display_name=Sneha
          </div>
          <p className="mt-4 leading-relaxed text-gray-600">
            This request says the browser is sending three stored cookies. It does not tell you when those cookies were created, whether they were marked HttpOnly, when they expire, or which Domain and Path originally scoped them. Those policy attributes are not repeated in the Cookie request header.
          </p>
          <div className="mt-4 overflow-auto rounded-xl bg-white p-4 font-mono text-sm leading-7 text-gray-800">
            Set-Cookie: session_id=abc123; Path=/; Secure; HttpOnly; SameSite=Lax
          </div>
          <p className="mt-4 leading-relaxed text-gray-600">
            This response is different: the server is asking the browser to store a cookie and is attaching policy information. That is where Secure, HttpOnly, SameSite, Domain, Path, Max-Age, Expires, and newer attributes appear.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            What the Main Set-Cookie Attributes Actually Change
          </h2>
          <div className="mt-4 space-y-4 text-gray-600">
            <p><strong>Secure</strong> restricts sending to secure transport. It is especially important for session cookies because a login token should not normally travel over an unencrypted HTTP connection.</p>
            <p><strong>HttpOnly</strong> prevents ordinary page JavaScript from reading the cookie through APIs such as <code>document.cookie</code>. The browser can still send that cookie with matching HTTP requests.</p>
            <p><strong>SameSite</strong> affects cross-site sending. Strict, Lax, and None change when the cookie can accompany cross-site navigations or requests. SameSite=None requires Secure in modern browsers.</p>
            <p><strong>Domain</strong> and <strong>Path</strong> determine where the browser considers the cookie applicable. They are matching rules, not a general security boundary.</p>
            <p><strong>Max-Age</strong> and <strong>Expires</strong> control lifetime. When both are understood, Max-Age takes precedence.</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Duplicate Cookie Names Can Be Legitimate
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The same cookie name can exist with different Path or Domain scope, so a request can contain more than one pair with the same name. Converting everything straight into a normal object can silently overwrite one value with another.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Keeping every occurrence and its order matters here. HTTP/2 and HTTP/3 can even split a request <code>Cookie</code> field across multiple field lines for compression and define recombination with <code>; </code>; that does not make comma-combining multiple response <code>Set-Cookie</code> fields safe. The HTTP/2 rule is spelled out in{" "}
            <a href="https://www.rfc-editor.org/rfc/rfc9113" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">
              RFC 9113
            </a>. If an application appears to read the “wrong” cookie, inspect what the browser actually stores, which Domain and Path each cookie uses, and how the server framework resolves duplicate names.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why Cookie Values Sometimes Look Encoded
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Applications often place encoded text inside cookie values. You may see percent sequences, Base64, JWT-like strings, opaque random identifiers, or framework-specific serialization. The Cookie grammar itself does not say that every value should be URL-decoded.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            For that reason, the raw value remains the source of truth. If a value such as <code>Sneha%20Pune</code> can be percent-decoded cleanly, a readable preview can sit beside it without pretending that percent decoding is part of cookie semantics.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why fetch() May Not Expose Set-Cookie
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Frontend JavaScript cannot read <code>Set-Cookie</code> from a Fetch or XMLHttpRequest response the way it can read ordinary response fields. Browsers filter it from responses exposed to page code. Cross-origin requests also need the right credentials mode before a returned Set-Cookie field can affect the cookie store.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            That distinction explains a common debugging puzzle: the network panel can show a Set-Cookie field while <code>response.headers.get("set-cookie")</code> does not reveal it. The browser behavior is documented alongside the{" "}
            <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">
              Set-Cookie header rules
            </a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Cookie Prefixes Add Browser-Enforced Restrictions
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Supporting browsers attach additional rules to names beginning with <code>__Secure-</code>, <code>__Host-</code>, <code>__Http-</code>, and <code>__Host-Http-</code>. A <code>__Host-</code> cookie, for example, requires Secure, must use Path=/, and must not include Domain.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            These prefixes reduce some dangerous scoping choices, but the header alone cannot prove that the response came from the secure origin required for the prefix. Current browser behavior for these prefixes and the <code>Partitioned</code> attribute is documented in the{" "}
            <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">
              Set-Cookie reference on MDN
            </a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            When Login Works Once but the Session Disappears
          </h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 leading-relaxed text-gray-600">
            <li>Confirm that the login response actually contains the expected Set-Cookie line.</li>
            <li>Check Secure, SameSite, Domain, Path, Max-Age, and Expires against the environment where the site runs.</li>
            <li>Use browser storage tools to see whether the browser accepted the cookie.</li>
            <li>On the next matching request, verify that the Cookie request header contains the expected value.</li>
            <li>If the cookie is present but the user is still logged out, investigate server-side session lookup, expiry, signature validation, revocation, or key rotation.</li>
          </ol>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Secure + HttpOnly Does Not Mean the Whole Application Is Secure
          </h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            Cookie attributes reduce particular risks, but they do not replace secure session design. Session identifiers still need strong randomness, safe expiry and revocation, fixation defenses, appropriate CSRF protection, and application-level protection against XSS and account takeover. A pasted header contains only the cookie metadata that is visible there; it says nothing about the authentication system behind it.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Header Syntax Cannot Predict Browser Acceptance
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A Set-Cookie line can look structurally correct and still be rejected by a browser. Real acceptance can depend on the response origin, HTTPS, public-suffix rules, third-party-cookie policy, partitioning support, browser limits, current cookie-store state, and feature support. Core Cookie and Set-Cookie syntax is defined by{" "}
            <a href="https://www.rfc-editor.org/rfc/rfc6265" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">
              RFC 6265
            </a>, while newer browser behavior continues to evolve beyond that original RFC.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Follow the Session Beyond the Cookie Header
          </h2>

          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/cookie-parser" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
