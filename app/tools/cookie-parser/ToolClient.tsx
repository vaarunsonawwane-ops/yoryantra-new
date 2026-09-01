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

function createGroupMap<T>() {
  return Object.create(null) as Record<string, T>;
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
  if (value.indexOf("%") === -1) {
    return {};
  }

  const malformed = /%(?![0-9A-Fa-f]{2})/.test(value);

  if (malformed) {
    return {
      percentDecodeIssue:
        "Contains a % that is not followed by two hexadecimal digits. Raw cookie syntax is preserved.",
    };
  }

  try {
    const decoded = decodeURIComponent(value);

    return decoded === value
      ? {}
      : { percentDecoded: decoded };
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

  const value = quoted
    ? rawValue.slice(1, -1)
    : rawValue;

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

function normalizeRequestCookieLines(input: string) {
  const lines = input
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const prefixed = lines.filter((line) => /^cookie\s*:/i.test(line));

  if (prefixed.length > 0) {
    return {
      lines: prefixed.map((line) => stripHeaderPrefix(line, "cookie")),
      ignoredLines: lines.length - prefixed.length,
    };
  }

  return {
    lines,
    ignoredLines: 0,
  };
}

function parseRequestCookie(input: string): CookieResult {
  const normalized = normalizeRequestCookieLines(input);
  const diagnostics: string[] = [];
  const cookies: ParsedCookiePair[] = [];
  const counts = createStringCountMap();

  if (normalized.ignoredLines > 0) {
    diagnostics.push(
      `${normalized.ignoredLines} non-Cookie header line${
        normalized.ignoredLines === 1 ? " was" : "s were"
      } ignored because explicit Cookie: lines were detected.`
    );
  }

  normalized.lines.forEach((line, lineIndex) => {
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
          `Cookie name "${pair.name}" contains characters outside the HTTP token syntax used for cookie names.`
        );
      }

      if (pair.valueSyntax === "nonstandard") {
        diagnostics.push(
          `Cookie "${pair.name}" contains characters outside the traditional RFC 6265 cookie-octet set. Browsers and frameworks can be more tolerant, so the raw value is preserved for inspection.`
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
        `Cookie name "${name}" appears ${counts[name]} times. The parser preserves every occurrence and its order instead of overwriting earlier values.`
      );
    }
  });

  if (normalized.lines.length > 1) {
    diagnostics.push(
      "More than one Cookie header line was supplied. The parser preserves the line order; protocol-specific combination behavior should be checked when debugging HTTP/2 or HTTP/3 captures."
    );
  }

  if (cookies.length === 0) {
    diagnostics.push("No cookie name=value pairs were found.");
  }

  return {
    kind: "Cookie request header",
    cookieCount: cookies.length,
    cookies,
    diagnostics,
    note:
      "Cookie request values are treated as raw cookie syntax. Percent-decoded text is only a convenience preview because percent-decoding is not part of the Cookie header grammar.",
  };
}

function normalizeSetCookieLines(input: string) {
  const lines = input
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const prefixed = lines.filter((line) => /^set-cookie\s*:/i.test(line));

  if (prefixed.length > 0) {
    return {
      lines: prefixed.map((line) => stripHeaderPrefix(line, "set-cookie")),
      ignoredLines: lines.length - prefixed.length,
    };
  }

  return {
    lines,
    ignoredLines: 0,
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
  const name = pair.name;

  if (name.indexOf("__Secure-") === 0 && !secure) {
    diagnostics.push(
      'The __Secure- prefix requires the Secure attribute in supporting browsers and must be set from a secure origin.'
    );
  }

  if (name.indexOf("__Host-") === 0) {
    if (!secure) {
      diagnostics.push(
        'The __Host- prefix requires the Secure attribute in supporting browsers.'
      );
    }

    if (domain) {
      diagnostics.push(
        'The __Host- prefix must not include a Domain attribute.'
      );
    }

    if (!path || path.value !== "/") {
      diagnostics.push(
        'The __Host- prefix requires Path=/.'
      );
    }
  }

  if (name.indexOf("__Http-") === 0) {
    if (!secure) {
      diagnostics.push(
        'The __Http- prefix requires the Secure attribute in supporting browsers.'
      );
    }

    if (!httpOnly) {
      diagnostics.push(
        'The __Http- prefix requires HttpOnly in supporting browsers.'
      );
    }
  }

  if (name.indexOf("__Host-Http-") === 0 && !httpOnly) {
    diagnostics.push(
      'The __Host-Http- prefix additionally requires HttpOnly in supporting browsers.'
    );
  }
}

function parseSetCookie(input: string): CookieResult {
  const normalized = normalizeSetCookieLines(input);
  const diagnostics: string[] = [];
  const parsedCookies: unknown[] = [];

  if (normalized.ignoredLines > 0) {
    diagnostics.push(
      `${normalized.ignoredLines} non-Set-Cookie header line${
        normalized.ignoredLines === 1 ? " was" : "s were"
      } ignored because explicit Set-Cookie: lines were detected.`
    );
  }

  normalized.lines.forEach((line, lineIndex) => {
    const segments = line.split(";");
    const pair = parsePair((segments.shift() || "").trim());
    const attributes: ParsedAttribute[] = [];
    const localDiagnostics: string[] = [];
    const seenAttributes = createStringCountMap();

    if (!pair) {
      localDiagnostics.push(
        `Line ${lineIndex + 1} does not start with a valid cookie name=value pair.`
      );
    } else {
      if (pair.nameSyntax === "invalid") {
        localDiagnostics.push(
          `Cookie name "${pair.name}" contains characters outside token syntax.`
        );
      }

      if (pair.valueSyntax === "nonstandard") {
        localDiagnostics.push(
          `Cookie "${pair.name}" contains characters outside the traditional RFC 6265 cookie-octet set.`
        );
      }

      if (pair.percentDecodeIssue) {
        localDiagnostics.push(
          `Cookie "${pair.name}": ${pair.percentDecodeIssue}`
        );
      }
    }

    segments.forEach((segment) => {
      const trimmed = segment.trim();

      if (!trimmed) return;

      const equals = trimmed.indexOf("=");
      const rawName = (
        equals === -1 ? trimmed : trimmed.slice(0, equals)
      ).trim();
      const value =
        equals === -1
          ? null
          : trimmed.slice(equals + 1).trim();
      const lower = rawName.toLowerCase();
      const canonical = KNOWN_ATTRIBUTES[lower] || rawName;

      attributes.push({
        name: canonical,
        rawName,
        value,
        known: Boolean(KNOWN_ATTRIBUTES[lower]),
      });

      seenAttributes[lower] = (seenAttributes[lower] || 0) + 1;

      if (!TOKEN_PATTERN.test(rawName)) {
        localDiagnostics.push(
          `Attribute name "${rawName}" contains characters outside token syntax.`
        );
      }

      if (FLAG_ATTRIBUTES.indexOf(lower) !== -1 && value !== null) {
        localDiagnostics.push(
          `${canonical} is a flag attribute and normally appears without =${value}.`
        );
      }
    });

    Object.keys(seenAttributes).forEach((name) => {
      if (seenAttributes[name] > 1) {
        localDiagnostics.push(
          `Attribute "${name}" appears ${seenAttributes[name]} times. Duplicate Set-Cookie attributes are discouraged and browser processing can be surprising.`
        );
      }
    });

    const sameSite = attributeLookup(attributes, "SameSite");
    const secure = hasAttribute(attributes, "Secure");
    const partitioned = hasAttribute(attributes, "Partitioned");
    const maxAge = attributeLookup(attributes, "Max-Age");
    const expires = attributeLookup(attributes, "Expires");
    const domain = attributeLookup(attributes, "Domain");

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
        "Both Max-Age and Expires are present. When both are recognized, Max-Age takes precedence for cookie lifetime."
      );
    }

    if (
      expires &&
      expires.value &&
      Number.isNaN(Date.parse(expires.value))
    ) {
      localDiagnostics.push(
        "Expires could not be parsed by JavaScript Date.parse(). Browser cookie-date parsing has its own rules, so treat this as a warning rather than proof of rejection."
      );
    }

    if (
      domain &&
      domain.value &&
      domain.value.charAt(0) === "."
    ) {
      localDiagnostics.push(
        "Domain starts with a leading dot. Modern cookie handling ignores the leading dot; it does not create different subdomain semantics."
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
        path: attributeLookup(attributes, "Path")?.value || null,
      },
      diagnostics: localDiagnostics,
    });
  });

  if (normalized.lines.length === 0) {
    diagnostics.push("No Set-Cookie lines were found.");
  }

  if (normalized.lines.length > 1) {
    diagnostics.push(
      "Multiple Set-Cookie fields are preserved separately. They must not be blindly comma-combined into one field value."
    );
  }

  return {
    kind: "Set-Cookie response header",
    cookieCount: parsedCookies.length,
    cookies: parsedCookies,
    diagnostics,
    note:
      "This is structural inspection, not a browser cookie-store simulator. Acceptance also depends on the response origin, scheme, domain/path matching, browser policy, public-suffix rules, cookie-store state, and feature support.",
  };
}

export default function ToolClient() {
  const [mode, setMode] = useState<CookieMode>("cookie");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const inputLines = useMemo(
    () =>
      input
        ? input.replace(/\r\n?/g, "\n").split("\n").length
        : 0,
    [input]
  );

  const parseCookies = () => {
    if (!input.trim()) {
      setError(
        mode === "cookie"
          ? "Enter a Cookie request header or cookie string."
          : "Enter one or more Set-Cookie response header lines."
      );
      setOutput("");
      setCopied(false);
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
    if (mode === "cookie") {
      setInput(
        "Cookie: display_name=Sneha; theme=dark; filter=one; filter=two"
      );
    } else {
      setInput(
        "Set-Cookie: session_id=abc123; Path=/; Secure; HttpOnly; SameSite=Lax\nSet-Cookie: display_name=Sneha; Max-Age=86400; Path=/"
      );
    }

    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setCopied(false);
  };

  const copyOutput = async () => {
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
      description="Paste a Cookie request header or Set-Cookie response header to see the names, values, attributes, duplicates, and common browser-facing warnings in a readable structured form."
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
            {
              label: "Cookie request header",
              value: "cookie",
            },
            {
              label: "Set-Cookie response header(s)",
              value: "set-cookie",
            },
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
                  ? "Use this for cookies a browser sends to a website."
                  : "Use this for cookies a server asks a browser to store."}
              </p>
            </div>
            <p className="text-xs text-gray-500">
              {inputLines.toLocaleString()} line
              {inputLines === 1 ? "" : "s"}
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
        <button
          type="button"
          onClick={parseCookies}
          className="yoryantra-btn"
        >
          Parse Cookies
        </button>

        <button
          type="button"
          onClick={loadExample}
          className="yoryantra-btn-outline"
        >
          Load Example
        </button>

        <button
          type="button"
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
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
              Raw values are kept alongside convenience diagnostics so the
              parser does not silently rewrite the source.
            </p>
          </div>

          {output ? (
            <button
              type="button"
              onClick={copyOutput}
              className="yoryantra-btn-outline text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          ) : null}
        </div>

        <pre className="mt-4 yoryantra-output min-h-[260px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output ||
            "Parsed cookie values, attributes, security summary, and diagnostics will appear here."}
        </pre>
      </div>

      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Cookies can contain account credentials
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          Session cookies can sometimes be enough to access an account. The
          parser operates on the pasted text in your browser and does not send
          it to a cookie-parsing API, but copying, saving, or sharing the
          result can still expose live secrets. Site-wide analytics or
          advertising scripts, if enabled, are separate from this parsing
          operation.
        </p>
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What a Browser Cookie Is
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A cookie is a small name-value item a website can use to remember
            something between HTTP requests. A cookie might hold a session
            identifier after you sign in, a language preference, a shopping
            cart identifier, or another piece of application state.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The important distinction is direction. A server sends{" "}
            <code>Set-Cookie</code> in a response when it wants the browser to
            create or update a cookie. On later matching requests, the browser
            can send stored cookie name-value pairs back in the{" "}
            <code>Cookie</code> request header.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Set-Cookie Attributes in Plain Language
          </h2>
          <div className="mt-4 overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-7 text-gray-700">
            <p>
              <strong>Secure:</strong> send the cookie only over secure
              connections, with browser-specific localhost handling.
            </p>
            <p>
              <strong>HttpOnly:</strong> prevents ordinary page JavaScript from
              reading the cookie through APIs such as{" "}
              <code>document.cookie</code>. The browser can still send it with
              matching HTTP requests.
            </p>
            <p>
              <strong>SameSite:</strong> controls when a cookie is sent in
              cross-site situations and is useful as part of CSRF defenses.
            </p>
            <p>
              <strong>Domain and Path:</strong> limit the hosts and URL paths
              for which the browser considers the cookie applicable.
            </p>
            <p>
              <strong>Max-Age / Expires:</strong> control lifetime. When both
              are recognized, <code>Max-Age</code> takes precedence.
            </p>
            <p>
              <strong>Partitioned:</strong> requests partitioned cookie
              storage in supporting browsers and requires{" "}
              <code>Secure</code>.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why the Same Cookie Name Can Appear More Than Once
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Cookie names are not guaranteed to be unique inside every request
            header. A browser can have cookies with the same name but
            different Path or Domain scope. That is why this parser keeps an
            ordered list instead of converting everything into an object where
            the last value silently overwrites the first.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Percent-Encoding in Cookie Values Is an Application Choice
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A value such as <code>Sneha%20Pune</code> may have been
            percent-encoded by an application, but the Cookie header itself
            does not define URL decoding. The parser therefore keeps the raw
            value and shows a decoded preview only when{" "}
            <code>decodeURIComponent()</code> can decode it cleanly.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Cookie Prefixes Add Browser-Enforced Restrictions
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Supporting browsers attach extra rules to names beginning with{" "}
            <code>__Secure-</code>, <code>__Host-</code>,{" "}
            <code>__Http-</code>, and <code>__Host-Http-</code>. For example,
            a <code>__Host-</code> cookie requires <code>Secure</code>, cannot
            specify <code>Domain</code>, and uses <code>Path=/</code>. The
            parser checks the visible attributes, but it cannot prove that the
            response came from the secure origin required for the prefix.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            What This Parser Cannot Prove
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A structurally sensible Set-Cookie line is not proof that a
            browser will store it. Browser acceptance can also depend on the
            current origin, HTTPS, public-suffix rules, Domain and Path
            matching, third-party cookie policy, partitioning support,
            SameSite context, cookie limits, and existing cookie-store state.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Likewise, <code>Secure</code>, <code>HttpOnly</code>, and{" "}
            <code>SameSite</code> are useful protections, not a guarantee that
            the application is secure. Session identifiers still need
            unpredictable values, careful server-side validation, safe
            lifetime management, and appropriate CSRF/XSS defenses.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Useful Cookie References
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Cookie behavior changes at the browser-policy layer, so these
            references add practical value when a production browser accepts or
            rejects something differently from what a pasted header suggests.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              MDN Set-Cookie reference
            </a>
            <a
              href="https://www.rfc-editor.org/rfc/rfc6265"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              RFC 6265 — HTTP State Management
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <YoryantraRelatedTools currentHref="/tools/cookie-parser" />
        </div>
      </section>
    </ToolShell>
  );
}
