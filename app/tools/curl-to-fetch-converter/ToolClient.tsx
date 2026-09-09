"use client";

import { useState, type ChangeEvent } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type HeaderPair = {
  name: string;
  value: string;
};

type ParsedCurl = {
  url: string;
  method: string;
  headers: HeaderPair[];
  body: string | null;
  warnings: string[];
};

type CopyState = "idle" | "copied" | "failed";

const sampleCurl = `curl -X POST https://api.example.com/users \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer token_here" \\
  --data-raw '{"name":"Sneha","role":"developer"}'`;

const forbiddenFetchHeaders = new Set([
  "accept-charset",
  "accept-encoding",
  "access-control-request-headers",
  "access-control-request-method",
  "connection",
  "content-length",
  "cookie",
  "date",
  "dnt",
  "expect",
  "host",
  "keep-alive",
  "origin",
  "set-cookie",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "via",
]);

const unsupportedValueOptions = new Set([
  "--cert",
  "--connect-to",
  "--data-urlencode",
  "--form",
  "--form-string",
  "--key",
  "--proxy",
  "--resolve",
  "--upload-file",
  "-F",
  "-T",
]);

const ignoredNoValueOptions = new Set([
  "--compressed",
  "--fail",
  "--fail-with-body",
  "--location",
  "--silent",
  "--show-error",
  "-L",
  "-s",
  "-S",
]);

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [copyState, setCopyState] = useState<CopyState>("idle");

  const convertCurl = () => {
    if (!input.trim()) {
      setError("Enter a cURL command before converting it.");
      setOutput("");
      setWarnings([]);
      return;
    }

    try {
      const parsed = parseCurlCommand(input);
      setOutput(generateFetchCode(parsed));
      setWarnings(parsed.warnings);
      setError("");
      setCopyState("idle");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "The cURL command could not be converted safely."
      );
      setOutput("");
      setWarnings([]);
      setCopyState("idle");
    }
  };

  const copyOutput = async () => {
    if (!output) {
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  };

  const loadExample = () => {
    setInput(sampleCurl);
    setOutput("");
    setWarnings([]);
    setError("");
    setCopyState("idle");
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setWarnings([]);
    setError("");
    setCopyState("idle");
  };

  return (
    <ToolShell
      title="CURL to Fetch Converter"
      description="Translate HTTP cURL requests into browser fetch() code and flag options Fetch cannot reproduce."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          cURL Command
        </label>

        <textarea
          value={input}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
            setInput(event.target.value);
            setCopyState("idle");
          }}
          placeholder={sampleCurl}
          spellCheck={false}
          className="w-full min-h-[260px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Paste one HTTP or HTTPS cURL request. Shell variables, command
          substitutions, file reads, multipart forms, client certificates, and
          proxy routing are not guessed.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={convertCurl} className="yoryantra-btn whitespace-nowrap">
          Convert to Fetch
        </button>
        <button onClick={loadExample} className="yoryantra-btn-outline whitespace-nowrap">
          Load Example
        </button>
        <button onClick={resetAll} className="yoryantra-btn-outline whitespace-nowrap">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mt-6 self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="font-semibold">Check these conversion differences</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 leading-relaxed">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            JavaScript Fetch Code
          </h3>

          {output && (
            <button
              onClick={copyOutput}
              className="yoryantra-btn-outline text-sm whitespace-nowrap"
            >
              {copyState === "copied"
                ? "Copied"
                : copyState === "failed"
                  ? "Copy Failed"
                  : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output min-h-[280px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "Converted fetch() code will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Conversion runs in your browser. The command is parsed as text and is
        never executed, so shell expansions and referenced local files are not
        evaluated.
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Moving a tested cURL request into browser JavaScript
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A cURL command describes more than an HTTP method and URL. Options
            can change where data is placed, add headers, follow redirects,
            read files, use client certificates, or alter TLS behavior. A
            browser <code>fetch()</code> request does not expose every one of
            those controls.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The converter therefore handles the request pieces that map cleanly
            to Fetch and stops when an unsupported option could change request
            semantics. It preserves body text rather than parsing and
            reformatting JSON, because changing whitespace or escaping can
            change signed requests and debugging comparisons.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            What is converted directly
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-gray-600">
            <li>HTTP and HTTPS URLs, including <code>--url</code>.</li>
            <li>Explicit methods from <code>-X</code> or <code>--request</code>.</li>
            <li>Repeated request headers from <code>-H</code> or <code>--header</code>.</li>
            <li>
              Text bodies from <code>-d</code>, <code>--data</code>,
              <code> --data-raw</code>, and literal <code>--data-binary</code> values.
            </li>
            <li>
              <code>-G</code> / <code>--get</code> data moved into the URL query string.
            </li>
            <li>
              <code>--json</code> with the Content-Type and Accept defaults that
              curl adds when those headers are absent.
            </li>
          </ul>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="font-semibold text-amber-950">
              Browser Fetch is not curl
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-amber-900">
              Browsers control headers such as Host, Content-Length, Cookie,
              Origin, and several Sec-* headers. Fetch also rejects request
              bodies on GET and HEAD. When those differences prevent an honest
              conversion, the page warns or stops instead of emitting code that
              only looks equivalent.
            </p>
          </div>

          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="font-semibold text-gray-900">
              Credentials deserve a second look
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">
              Authorization headers copied from DevTools may contain live API
              keys or bearer tokens. Generated code keeps allowed header values
              exactly as entered. Replace secrets before committing, sharing,
              or pasting the result into public code.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Options that need manual work
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Multipart forms, file uploads, <code>@file</code> data, client
            certificates, proxies, DNS overrides, and shell expansion are left
            out deliberately. Each needs extra information that is not present
            as literal browser-request data. Silently approximating them would
            create a different request.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            CORS is another boundary: a syntactically correct fetch request can
            still be blocked by the browser when the target server does not
            allow the page origin, method, or request headers.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Authoritative behavior to compare against
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            curl documents how options such as <code>--data</code>,
            <code> --request</code>, and <code>--url</code> change a transfer. The
            Fetch API defines a different browser request model, including
            RequestInit and browser-controlled request headers.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <a
              href="https://curl.se/docs/manpage.html"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              curl man page
            </a>
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/API/RequestInit"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              MDN RequestInit reference
            </a>
            <a
              href="https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_request_header"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              MDN forbidden request headers
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/curl-to-fetch-converter" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function parseCurlCommand(command: string): ParsedCurl {
  const normalized = command.replace(/\\\r?\n/g, " ").trim();
  const warnings: string[] = [];

  if (/\$\(|`|\$\{/.test(normalized)) {
    warnings.push(
      "Shell substitutions are preserved as literal text; they are not evaluated in the browser."
    );
  }

  const tokens = tokenizeCurl(normalized);
  if (tokens.length === 0 || tokens[0].toLowerCase() !== "curl") {
    throw new Error("The command must start with curl.");
  }

  let url = "";
  let method = "";
  let head = false;
  let useGet = false;
  let jsonMode = false;
  const headers: HeaderPair[] = [];
  const dataParts: Array<{ kind: "data" | "raw" | "binary" | "json"; value: string }> = [];

  for (let index = 1; index < tokens.length; index += 1) {
    const token = tokens[index];

    if (token === "--") {
      const remaining = tokens.slice(index + 1);
      if (remaining.length !== 1) {
        throw new Error("Only one URL can be converted at a time.");
      }
      url = remaining[0];
      break;
    }

    const requestValue = optionValue(token, "--request");
    if (token === "-X" || token === "--request" || requestValue !== null) {
      const value = requestValue ?? requireNext(tokens, index, token);
      method = normalizeMethod(value);
      if (requestValue === null) index += 1;
      continue;
    }

    if (token.startsWith("-X") && token.length > 2) {
      method = normalizeMethod(token.slice(2));
      continue;
    }

    const headerValue = optionValue(token, "--header");
    if (token === "-H" || token === "--header" || headerValue !== null) {
      const value = headerValue ?? requireNext(tokens, index, token);
      addHeader(headers, value);
      if (headerValue === null) index += 1;
      continue;
    }

    if (token.startsWith("-H") && token.length > 2) {
      addHeader(headers, token.slice(2));
      continue;
    }

    const urlValue = optionValue(token, "--url");
    if (token === "--url" || urlValue !== null) {
      const value = urlValue ?? requireNext(tokens, index, token);
      if (url) throw new Error("Only one URL can be converted at a time.");
      url = value;
      if (urlValue === null) index += 1;
      continue;
    }

    const jsonValue = optionValue(token, "--json");
    if (token === "--json" || jsonValue !== null) {
      const value = jsonValue ?? requireNext(tokens, index, token);
      if (value.startsWith("@")) {
        throw new Error("--json @file cannot be converted because the browser cannot read the referenced shell file.");
      }
      dataParts.push({ kind: "json", value });
      jsonMode = true;
      if (jsonValue === null) index += 1;
      continue;
    }

    const dataOption = getDataOption(token);
    if (dataOption) {
      const value = dataOption.inlineValue ?? requireNext(tokens, index, token);
      if (dataOption.kind !== "raw" && value.startsWith("@")) {
        throw new Error(
          `${dataOption.label} with @file needs the referenced file contents and cannot be converted from command text alone.`
        );
      }
      dataParts.push({ kind: dataOption.kind, value });
      if (dataOption.inlineValue === null) index += 1;
      continue;
    }

    if (token === "-G" || token === "--get") {
      useGet = true;
      continue;
    }

    if (token === "-I" || token === "--head") {
      head = true;
      continue;
    }

    if (token === "-k" || token === "--insecure") {
      warnings.push(
        "curl --insecure disables certificate verification; browser fetch() does not expose an equivalent switch."
      );
      continue;
    }

    if (token === "-b" || token === "--cookie") {
      requireNext(tokens, index, token);
      index += 1;
      warnings.push(
        "curl cookie input was not copied because browsers control the Cookie header; use the page's credential model instead."
      );
      continue;
    }

    if (token === "-A" || token === "--user-agent") {
      requireNext(tokens, index, token);
      index += 1;
      warnings.push(
        "The requested User-Agent value was not copied because browsers may control or rewrite it."
      );
      continue;
    }

    if (token === "-e" || token === "--referer") {
      requireNext(tokens, index, token);
      index += 1;
      warnings.push(
        "curl's Referer option was not copied as a header; Fetch exposes referrer through RequestInit instead."
      );
      continue;
    }

    if (token === "-u" || token === "--user") {
      requireNext(tokens, index, token);
      index += 1;
      warnings.push(
        "curl basic-auth credentials were not expanded into JavaScript. Add an Authorization header deliberately if the browser request should send one."
      );
      continue;
    }

    if (ignoredNoValueOptions.has(token)) {
      if (token === "--compressed") {
        warnings.push(
          "curl --compressed was omitted because browsers negotiate response compression themselves."
        );
      }
      continue;
    }

    if (unsupportedValueOptions.has(token)) {
      throw new Error(
        `${token} changes request behavior in a way this browser Fetch conversion does not reproduce safely.`
      );
    }

    if (token.startsWith("-")) {
      throw new Error(
        `Unsupported cURL option ${token}. Conversion stopped rather than guessing whether it consumes another argument.`
      );
    }

    if (url) {
      throw new Error("Only one URL can be converted at a time.");
    }
    url = token;
  }

  if (!url) {
    throw new Error("No request URL was found in the cURL command.");
  }

  const parsedUrl = parseHttpUrl(url);

  if (jsonMode) {
    if (!hasHeader(headers, "content-type")) {
      headers.push({ name: "Content-Type", value: "application/json" });
    }
    if (!hasHeader(headers, "accept")) {
      headers.push({ name: "Accept", value: "application/json" });
    }
  }

  let body = combineDataParts(dataParts);

  if (useGet && body !== null) {
    parsedUrl.search = appendQuery(parsedUrl.search, body);
    body = null;
    if (!method) method = head ? "HEAD" : "GET";
  }

  if (head && !method) {
    method = "HEAD";
  }

  if (!method) {
    method = body !== null ? "POST" : "GET";
  }

  method = normalizeMethod(method);

  if ((method === "GET" || method === "HEAD") && body !== null) {
    throw new Error(
      `curl can be instructed to send data with ${method}, but browser fetch() rejects a request body for ${method}. Use -G when the data belongs in the query string or adjust the request manually.`
    );
  }

  const safeHeaders: HeaderPair[] = [];
  for (const header of headers) {
    const lower = header.name.toLowerCase();
    if (isForbiddenFetchHeader(lower)) {
      warnings.push(
        `${header.name} was omitted because browsers do not let page JavaScript set that request header directly.`
      );
      continue;
    }
    safeHeaders.push(header);
  }

  if (safeHeaders.some((header) => /authorization|api[-_]key|token/i.test(header.name))) {
    warnings.push(
      "The generated code contains a credential-like header. Replace live secrets before sharing or committing it."
    );
  }

  if (parsedUrl.protocol === "http:") {
    warnings.push(
      "The request uses plain HTTP. Credentials and request content are not protected by HTTPS transport encryption."
    );
  }

  if (method === "OPTIONS") {
    warnings.push(
      "A manual OPTIONS request is not the same thing as the browser's automatic CORS preflight request."
    );
  }

  return {
    url: parsedUrl.toString(),
    method,
    headers: safeHeaders,
    body,
    warnings: uniqueStrings(warnings),
  };
}

function generateFetchCode(parsed: ParsedCurl): string {
  const lines = [
    `const response = await fetch(${JSON.stringify(parsed.url)}, {`,
    `  method: ${JSON.stringify(parsed.method)},`,
  ];

  if (parsed.headers.length > 0) {
    lines.push("  headers: {");
    parsed.headers.forEach((header) => {
      lines.push(`    ${JSON.stringify(header.name)}: ${JSON.stringify(header.value)},`);
    });
    lines.push("  },");
  }

  if (parsed.body !== null) {
    lines.push(`  body: ${JSON.stringify(parsed.body)},`);
  }

  lines.push("});");
  lines.push("");
  lines.push("// Choose response.text(), response.json(), or another reader based on the API response.");

  return lines.join("\n");
}

function tokenizeCurl(command: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let quote: "single" | "double" | null = null;
  let escaped = false;

  for (let index = 0; index < command.length; index += 1) {
    const char = command[index];

    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (quote === "single") {
      if (char === "'") {
        quote = null;
      } else {
        current += char;
      }
      continue;
    }

    if (quote === "double") {
      if (char === '"') {
        quote = null;
      } else if (char === "\\") {
        const next = command[index + 1];
        if (next === '"' || next === "\\" || next === "$" || next === "`") {
          current += next;
          index += 1;
        } else {
          current += char;
        }
      } else {
        current += char;
      }
      continue;
    }

    if (char === "'") {
      quote = "single";
      continue;
    }

    if (char === '"') {
      quote = "double";
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (/\s/.test(char)) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      continue;
    }

    current += char;
  }

  if (quote) {
    throw new Error("The cURL command contains an unterminated quoted string.");
  }

  if (escaped) {
    throw new Error("The cURL command ends with an incomplete backslash escape.");
  }

  if (current) {
    tokens.push(current);
  }

  return tokens;
}

function addHeader(headers: HeaderPair[], rawHeader: string): void {
  if (/\r|\n/.test(rawHeader)) {
    throw new Error("Header values cannot contain line breaks.");
  }

  if (rawHeader.endsWith(";") && !rawHeader.includes(":")) {
    const emptyName = rawHeader.slice(0, -1).trim();
    if (!isHttpToken(emptyName)) {
      throw new Error(`Header name ${JSON.stringify(emptyName)} is not a valid HTTP field name.`);
    }
    headers.push({ name: emptyName, value: "" });
    return;
  }

  const colonIndex = rawHeader.indexOf(":");
  if (colonIndex <= 0) {
    throw new Error(`Header ${JSON.stringify(rawHeader)} must contain a name followed by a colon.`);
  }

  const name = rawHeader.slice(0, colonIndex).trim();
  const value = rawHeader.slice(colonIndex + 1).trim();

  if (!isHttpToken(name)) {
    throw new Error(`Header name ${JSON.stringify(name)} is not a valid HTTP field name.`);
  }

  if (value === "") {
    throw new Error(
      `curl interprets ${JSON.stringify(`${name}:`)} as removing an internal header. Browser fetch() does not expose the same header-removal model, so this request needs manual adjustment.`
    );
  }

  headers.push({ name, value });
}

function combineDataParts(
  parts: Array<{ kind: "data" | "raw" | "binary" | "json"; value: string }>
): string | null {
  if (parts.length === 0) {
    return null;
  }

  if (parts.some((part) => part.kind === "binary") && parts.length > 1) {
    throw new Error(
      "Multiple data options including --data-binary are not combined automatically because curl's exact byte behavior should not be guessed from shell text."
    );
  }

  if (parts.every((part) => part.kind === "json")) {
    return parts.map((part) => part.value).join("");
  }

  if (parts.some((part) => part.kind === "json")) {
    throw new Error("Do not mix --json with other --data options in a conversion.");
  }

  if (parts.length === 1) {
    return parts[0].value;
  }

  return parts.map((part) => part.value).join("&");
}

function getDataOption(token: string): {
  kind: "data" | "raw" | "binary";
  label: string;
  inlineValue: string | null;
} | null {
  const longOptions: Array<{
    name: string;
    kind: "data" | "raw" | "binary";
  }> = [
    { name: "--data", kind: "data" },
    { name: "--data-ascii", kind: "data" },
    { name: "--data-raw", kind: "raw" },
    { name: "--data-binary", kind: "binary" },
  ];

  for (const option of longOptions) {
    const inlineValue = optionValue(token, option.name);
    if (token === option.name || inlineValue !== null) {
      return {
        kind: option.kind,
        label: option.name,
        inlineValue,
      };
    }
  }

  if (token === "-d") {
    return { kind: "data", label: "-d", inlineValue: null };
  }

  if (token.startsWith("-d") && token.length > 2) {
    return { kind: "data", label: "-d", inlineValue: token.slice(2) };
  }

  return null;
}

function requireNext(tokens: string[], index: number, option: string): string {
  const value = tokens[index + 1];
  if (value === undefined) {
    throw new Error(`${option} requires a value.`);
  }
  return value;
}

function optionValue(token: string, option: string): string | null {
  const prefix = `${option}=`;
  return token.startsWith(prefix) ? token.slice(prefix.length) : null;
}

function normalizeMethod(value: string): string {
  const method = value.trim().toUpperCase();
  if (!method || !isHttpToken(method)) {
    throw new Error(`HTTP method ${JSON.stringify(value)} is not valid.`);
  }
  if (method === "CONNECT" || method === "TRACE" || method === "TRACK") {
    throw new Error(`${method} is not allowed by the browser Fetch request model.`);
  }
  return method;
}

function parseHttpUrl(value: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("Enter a complete HTTP or HTTPS URL; curl's scheme guessing is not reproduced.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(
      `Browser fetch conversion is limited to HTTP and HTTPS URLs; ${parsed.protocol} is not converted.`
    );
  }

  if (parsed.username || parsed.password) {
    throw new Error(
      "Credentials embedded in the URL are not emitted into fetch() code. Move authentication to an explicit, reviewed mechanism."
    );
  }

  return parsed;
}

function appendQuery(existingSearch: string, data: string): string {
  if (!data) {
    return existingSearch;
  }
  const existing = existingSearch.startsWith("?") ? existingSearch.slice(1) : existingSearch;
  return `?${existing ? `${existing}&` : ""}${data}`;
}

function hasHeader(headers: HeaderPair[], name: string): boolean {
  return headers.some((header) => header.name.toLowerCase() === name.toLowerCase());
}

function isForbiddenFetchHeader(lowerName: string): boolean {
  return (
    forbiddenFetchHeaders.has(lowerName) ||
    lowerName.startsWith("proxy-") ||
    lowerName.startsWith("sec-")
  );
}

function isHttpToken(value: string): boolean {
  return /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(value);
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values));
}
