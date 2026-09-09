"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputStyle = "multiline" | "single";
type QuoteStyle = "single" | "double";
type NoteTone = "warning" | "info";

type ParsedHeader = {
  name: string;
  value: string;
};

type ParsedPair = {
  key: string;
  value: string;
};

type ParsedFetchRequest = {
  url: string;
  urlPath: string;
  method: string;
  headers: ParsedHeader[];
  ignoredForbiddenHeaders: string[];
  body: string;
  credentials: string;
  mode: string;
  cache: string;
  redirect: string;
  queryParams: ParsedPair[];
  unsupportedOptions: string[];
  fragmentRemoved: boolean;
};

type ConversionNote = {
  title: string;
  message: string;
  tone: NoteTone;
};

type ObjectEntry = {
  key: string;
  rawValue: string;
};

const sampleFetch = `const response = await fetch("https://api.example.com/users?role=admin", {
  method: "POST",
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": "Bearer example-token"
  },
  body: JSON.stringify({
    name: "Sneha",
    active: true
  })
});`;

const FETCH_OPTION_KEYS = new Set([
  "method",
  "headers",
  "body",
  "credentials",
  "mode",
  "cache",
  "redirect",
  "referrer",
  "referrerPolicy",
  "integrity",
  "keepalive",
  "signal",
  "priority",
  "duplex",
  "window",
]);

const UNSUPPORTED_BROWSER_OPTIONS = [
  "referrer",
  "referrerPolicy",
  "integrity",
  "keepalive",
  "signal",
  "priority",
  "duplex",
  "window",
];

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [parsedRequest, setParsedRequest] = useState<ParsedFetchRequest | null>(null);
  const [error, setError] = useState("");
  const [outputStyle, setOutputStyle] = useState<OutputStyle>("multiline");
  const [quoteStyle, setQuoteStyle] = useState<QuoteStyle>("single");
  const [hideSensitiveValues, setHideSensitiveValues] = useState(true);
  const [includeCompressed, setIncludeCompressed] = useState(false);
  const [copied, setCopied] = useState(false);

  const notes = useMemo(
    () => (parsedRequest ? getConversionNotes(parsedRequest) : []),
    [parsedRequest]
  );

  const visibleUrl = useMemo(() => {
    if (!parsedRequest) return "";
    return hideSensitiveValues ? maskSensitiveUrl(parsedRequest.url) : parsedRequest.url;
  }, [parsedRequest, hideSensitiveValues]);

  const convertFetchToCurl = () => {
    if (!input.trim()) {
      setError("Paste a JavaScript fetch() request first.");
      setOutput("");
      setParsedRequest(null);
      setCopied(false);
      return;
    }

    try {
      const nextParsed = parseFetchRequest(input);
      const curlCommand = buildCurlCommand(nextParsed, {
        outputStyle,
        quoteStyle,
        hideSensitiveValues,
        includeCompressed,
      });

      setParsedRequest(nextParsed);
      setOutput(curlCommand);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to convert this fetch() request.");
      setOutput("");
      setParsedRequest(null);
      setCopied(false);
    }
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("Copy failed. Select the cURL command and copy it manually.");
    }
  };

  const loadExample = () => {
    setInput(sampleFetch);
    setOutput("");
    setParsedRequest(null);
    setError("");
    setOutputStyle("multiline");
    setQuoteStyle("single");
    setHideSensitiveValues(true);
    setIncludeCompressed(false);
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setParsedRequest(null);
    setError("");
    setOutputStyle("multiline");
    setQuoteStyle("single");
    setHideSensitiveValues(true);
    setIncludeCompressed(false);
    setCopied(false);
  };

  return (
    <ToolShell
      title="Fetch to cURL Converter"
      description="Convert literal JavaScript fetch() requests into POSIX-shell cURL commands without executing the source."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          JavaScript Fetch Request
        </label>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setOutput("");
            setParsedRequest(null);
            setError("");
            setCopied(false);
          }}
          placeholder={sampleFetch}
          className="min-h-[320px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Supported input uses a literal HTTP(S) URL and a literal RequestInit object. Dynamic variables,
          computed headers, Request objects, FormData, streams, and executable expressions stop with an error
          instead of being guessed.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">cURL Output</h3>

        <div className="mt-4 grid max-w-3xl gap-4 sm:grid-cols-2">
          <YoryantraSelect
            label="Layout"
            value={outputStyle}
            onChange={(value) => {
              setOutputStyle(value as OutputStyle);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Multi-line", value: "multiline" },
              { label: "Single line", value: "single" },
            ]}
          />

          <YoryantraSelect
            label="POSIX Shell Quoting"
            value={quoteStyle}
            onChange={(value) => {
              setQuoteStyle(value as QuoteStyle);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Single quotes", value: "single" },
              { label: "Double quotes", value: "double" },
            ]}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex cursor-pointer gap-3 self-start rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={hideSensitiveValues}
              onChange={(event) => {
                setHideSensitiveValues(event.target.checked);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]"
            />
            <span>
              <span className="block text-sm font-medium text-gray-900">Mask share-sensitive values</span>
              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Replace credential-like headers and secret-looking URL query values. Request bodies are left unchanged.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer gap-3 self-start rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={includeCompressed}
              onChange={(event) => {
                setIncludeCompressed(event.target.checked);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]"
            />
            <span>
              <span className="block text-sm font-medium text-gray-900">Request compressed responses</span>
              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Add <span className="font-mono">--compressed</span>, which asks cURL to negotiate and decode supported content encodings.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={convertFetchToCurl} className="yoryantra-btn whitespace-nowrap">
          Convert Fetch to cURL
        </button>
        <button onClick={loadExample} className="yoryantra-btn-outline whitespace-nowrap">
          Load Example
        </button>
        <button onClick={resetAll} className="yoryantra-btn-outline whitespace-nowrap">
          Reset
        </button>
        <Link href="/tools/curl-to-fetch-converter" className="yoryantra-btn-outline whitespace-nowrap">
          cURL to Fetch Converter
        </Link>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {parsedRequest && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Method" value={parsedRequest.method} />
          <SummaryCard label="Headers" value={parsedRequest.headers.length.toLocaleString()} />
          <SummaryCard label="Query Params" value={parsedRequest.queryParams.length.toLocaleString()} />
          <SummaryCard label="Body Bytes" value={utf8ByteLength(parsedRequest.body).toLocaleString()} />
        </div>
      )}

      {parsedRequest && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Parsed Request</h3>
          <p className="mt-2 text-sm text-gray-500">
            Check the network-level pieces that can be represented in the generated command.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <DetailCard label="Method" value={parsedRequest.method} />
            <DetailCard label="URL" value={visibleUrl} />
            <DetailCard label="Path + Query" value={parsedRequest.urlPath || "/"} />
            <DetailCard label="Fetch Redirect Mode" value={parsedRequest.redirect || "follow (default)"} />
          </div>
        </div>
      )}

      {parsedRequest && parsedRequest.headers.length > 0 && (
        <ParsedTable
          title="Headers"
          description="Literal headers carried into the cURL command. Sensitive-looking values can be masked in the output."
          columns={["Header", "Value"]}
          rows={parsedRequest.headers.map((header) => [
            header.name,
            hideSensitiveValues && isSensitiveHeader(header.name)
              ? getSafeHeaderPlaceholder(header.name, header.value)
              : header.value,
          ])}
        />
      )}

      {parsedRequest && parsedRequest.queryParams.length > 0 && (
        <ParsedTable
          title="Query Parameters"
          description="Decoded query names and values from the normalized request URL. Duplicate keys stay as separate rows."
          columns={["Name", "Value"]}
          rows={parsedRequest.queryParams.map((param) => [
            param.key,
            hideSensitiveValues && isSensitiveQueryKey(param.key) ? "[masked]" : param.value,
          ])}
        />
      )}

      {notes.length > 0 && (
        <div className="mt-6 space-y-3">
          {notes.map((note) => (
            <div
              key={`${note.tone}-${note.title}`}
              className={
                note.tone === "warning"
                  ? "self-start rounded-xl border border-amber-200 bg-amber-50 p-4"
                  : "self-start rounded-xl border border-gray-200 bg-gray-50 p-4"
              }
            >
              <p className={note.tone === "warning" ? "text-sm font-semibold text-amber-900" : "text-sm font-semibold text-gray-900"}>
                {note.title}
              </p>
              <p className={note.tone === "warning" ? "mt-1 text-sm leading-relaxed text-amber-800" : "mt-1 text-sm leading-relaxed text-gray-600"}>
                {note.message}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">cURL Command</h3>
          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline whitespace-nowrap text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
        <pre className="yoryantra-output min-h-[260px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "Generated cURL command will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
        Parsing and conversion stay in your browser. Nothing here runs the pasted JavaScript or sends the generated request.
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Where a fetch() request maps cleanly to cURL</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            An HTTP method, absolute URL, literal headers, and a literal body have direct command-line equivalents. The parser deliberately stays inside that boundary. A URL stored in a variable, a computed header object, FormData, a stream, or an arbitrary expression may depend on runtime state, so converting it without executing code would be guesswork.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            String bodies are preserved as text. <span className="font-mono">JSON.stringify(...)</span> is accepted only when its argument is a JSON-compatible literal object or array. GET and HEAD bodies are rejected because Fetch does not allow them.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Browser behavior that a terminal command cannot copy</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Fetch carries browser rules around CORS, credentials, cache mode, referrer policy, integrity checks, abort signals, and other RequestInit fields. cURL is not running inside the browser security model, so those settings are surfaced as notes rather than turned into misleading flags. Redirects are the main exception: Fetch follows redirects by default, so supported follow-mode requests include <span className="font-mono">--location --max-redirs 20</span>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Shell quoting is part of request safety</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The generated command targets a POSIX-style shell. Single quotes are the default because they prevent normal shell expansion; embedded single quotes are escaped using the standard close-escape-reopen pattern. Double-quote mode also escapes backslashes, double quotes, dollar signs, and backticks before the value is placed on the command line.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Masking covers credential-like headers and query keys such as tokens, API keys, passwords, and session identifiers. It does not rewrite the request body, because changing arbitrary body data could silently change the request itself. Replace private body fields before sharing a command.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">References for the behavior above</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Fetch request semantics come from the{" "}
            <a className="font-medium text-[var(--green)] underline underline-offset-2" href="https://fetch.spec.whatwg.org/" target="_blank" rel="noreferrer">WHATWG Fetch Standard</a>.
            The{" "}
            <a className="font-medium text-[var(--green)] underline underline-offset-2" href="https://curl.se/docs/manpage.html" target="_blank" rel="noreferrer">official cURL man page</a>{" "}
            documents <span className="font-mono">--request</span>, <span className="font-mono">--data-raw</span>, <span className="font-mono">--location</span>, and <span className="font-mono">--compressed</span>. MDN's{" "}
            <a className="font-medium text-[var(--green)] underline underline-offset-2" href="https://developer.mozilla.org/en-US/docs/Web/API/Request/Request" target="_blank" rel="noreferrer">Request constructor reference</a>{" "}
            is useful when checking relative URLs and browser-side RequestInit behavior.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/fetch-to-curl-converter" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 break-words font-mono text-sm text-gray-900">{value || "(none)"}</div>
    </div>
  );
}

function ParsedTable({
  title,
  description,
  columns,
  rows,
}: {
  title: string;
  description: string;
  columns: string[];
  rows: string[][];
}) {
  return (
    <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
      <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 font-semibold">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row, rowIndex) => (
              <tr key={`${title}-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <td key={`${title}-${rowIndex}-${cellIndex}`} className="px-4 py-3 font-mono text-xs text-gray-700">
                    <span className="block max-w-[520px] break-words">{cell}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function parseFetchRequest(input: string): ParsedFetchRequest {
  const fetchCall = extractFetchCall(stripJavaScriptComments(input.trim()));
  if (!fetchCall) throw new Error("Could not find a complete fetch(...) call.");

  const openIndex = fetchCall.indexOf("(");
  const args = splitTopLevel(fetchCall.slice(openIndex + 1, -1), ",");
  if (args.length === 0 || !args[0]) throw new Error("fetch(...) is missing its URL argument.");
  if (args.length > 2) throw new Error("fetch() accepts a resource and an optional RequestInit object; extra arguments are not supported.");

  const rawUrl = parseJavaScriptStringLiteral(args[0], "Fetch URL");
  if (rawUrl.includes("\0")) throw new Error("The fetch URL contains a NUL character, which cannot be represented safely in a shell command.");

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    throw new Error("Use an absolute http:// or https:// URL. Relative fetch URLs depend on the page or worker base URL and cannot be reconstructed safely here.");
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error("Only HTTP and HTTPS fetch URLs are converted because other URL schemes do not map reliably to an HTTP cURL request.");
  }

  if (parsedUrl.username || parsedUrl.password) {
    throw new Error("Fetch Request URLs cannot contain embedded username/password credentials. Move authentication into an appropriate header instead.");
  }

  const fragmentRemoved = Boolean(parsedUrl.hash);
  parsedUrl.hash = "";
  const normalizedUrl = parsedUrl.toString();

  const optionEntries = parseRequestInitEntries(args[1] || "");
  const method = readStringOption(optionEntries, "method") || "GET";
  const normalizedMethod = method.toUpperCase();

  if (!isHttpToken(normalizedMethod)) throw new Error("The fetch method is not a valid HTTP token.");
  if (["CONNECT", "TRACE", "TRACK"].includes(normalizedMethod)) {
    throw new Error(`${normalizedMethod} is a forbidden Fetch method and is not converted.`);
  }

  const headerResult = extractHeaders(optionEntries);
  const headers = headerResult.headers;
  const body = extractBody(optionEntries);
  if ((normalizedMethod === "GET" || normalizedMethod === "HEAD") && body !== "") {
    throw new Error(`${normalizedMethod} requests cannot carry a body in Fetch. Remove the body or choose the method used by the original request.`);
  }

  const credentials = readValidatedStringOption(optionEntries, "credentials", ["omit", "same-origin", "include"]);
  const mode = readValidatedStringOption(optionEntries, "mode", ["cors", "same-origin", "no-cors"]);
  if (mode === "no-cors") {
    throw new Error('mode: "no-cors" is a browser-only restricted request mode and cannot be represented faithfully as a cURL command.');
  }
  const cache = readValidatedStringOption(optionEntries, "cache", ["default", "no-store", "reload", "no-cache", "force-cache", "only-if-cached"]);
  const redirect = readValidatedStringOption(optionEntries, "redirect", ["follow", "error", "manual"]);

  if (cache === "only-if-cached" && mode && mode !== "same-origin") {
    throw new Error('Fetch only allows cache: "only-if-cached" with mode: "same-origin".');
  }

  const unsupportedOptions = optionEntries
    .map((entry) => entry.key)
    .filter((key) => UNSUPPORTED_BROWSER_OPTIONS.includes(key) || !FETCH_OPTION_KEYS.has(key));

  const queryParams: ParsedPair[] = [];
  parsedUrl.searchParams.forEach((value, key) => queryParams.push({ key, value }));

  return {
    url: normalizedUrl,
    urlPath: `${parsedUrl.pathname}${parsedUrl.search}`,
    method: normalizedMethod,
    headers,
    ignoredForbiddenHeaders: headerResult.ignoredForbiddenHeaders,
    body,
    credentials,
    mode,
    cache,
    redirect,
    queryParams,
    unsupportedOptions: Array.from(new Set(unsupportedOptions)),
    fragmentRemoved,
  };
}

function extractFetchCall(input: string) {
  const match = /\bfetch\s*\(/.exec(input);
  if (!match || match.index === undefined) return "";

  const openIndex = input.indexOf("(", match.index);
  const balanced = readBalanced(input, openIndex, "(", ")");
  return balanced ? `fetch${balanced}` : "";
}

function parseRequestInitEntries(rawOptions: string): ObjectEntry[] {
  const trimmed = rawOptions.trim();
  if (!trimmed) return [];
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) {
    throw new Error("The second fetch() argument must be a literal RequestInit object. Variables and computed options are not executed.");
  }

  const balanced = readBalanced(trimmed, 0, "{", "}");
  if (balanced !== trimmed) throw new Error("The RequestInit object could not be read safely.");

  return parseObjectEntries(trimmed);
}

function parseObjectEntries(objectText: string): ObjectEntry[] {
  const inner = objectText.slice(1, -1).trim();
  if (!inner) return [];

  return splitTopLevel(inner, ",").map((entry) => {
    if (entry.trim().startsWith("...")) throw new Error("Object spread syntax depends on runtime values and is not converted.");
    const colonIndex = findTopLevelColon(entry);
    if (colonIndex === -1) throw new Error(`Could not read object property: ${entry.trim().slice(0, 60)}`);
    const key = parsePropertyKey(entry.slice(0, colonIndex));
    const rawValue = entry.slice(colonIndex + 1).trim();
    if (!rawValue) throw new Error(`Property ${key} has no value.`);
    return { key, rawValue };
  });
}

function parsePropertyKey(raw: string) {
  const trimmed = raw.trim();
  if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(trimmed)) return trimmed;
  if (isQuotedLiteral(trimmed)) return parseJavaScriptStringLiteral(trimmed, "Object property name");
  throw new Error(`Computed or unsupported property name: ${trimmed.slice(0, 60)}`);
}

function readStringOption(entries: ObjectEntry[], key: string) {
  const entry = getLastEntry(entries, key);
  if (!entry) return "";
  return parseJavaScriptStringLiteral(entry.rawValue, `${key} option`);
}

function readValidatedStringOption(entries: ObjectEntry[], key: string, allowed: string[]) {
  const value = readStringOption(entries, key);
  if (!value) return "";
  if (!allowed.includes(value)) throw new Error(`${key} has unsupported value ${JSON.stringify(value)}.`);
  return value;
}

function extractHeaders(entries: ObjectEntry[]) {
  const entry = getLastEntry(entries, "headers");
  if (!entry) return { headers: [] as ParsedHeader[], ignoredForbiddenHeaders: [] as string[] };
  const raw = entry.rawValue.trim();
  if (!raw.startsWith("{") || !raw.endsWith("}")) {
    throw new Error("headers must be a literal object. Headers instances, arrays, spreads, and variables depend on runtime state and are not guessed.");
  }

  const propertyEntries = parseObjectEntries(raw);
  const exactProperties = new Map<string, string>();
  propertyEntries.forEach((headerEntry) => {
    if (headerEntry.key === "__proto__") {
      throw new Error("headers uses __proto__, whose JavaScript object-literal behavior is not treated as an ordinary header property.");
    }
    exactProperties.set(headerEntry.key, headerEntry.rawValue);
  });

  const merged = new Map<string, ParsedHeader>();
  const ignoredForbiddenHeaders: string[] = [];

  exactProperties.forEach((rawValue, name) => {
    let value = parsePrimitiveHeaderValue(rawValue, name);
    if (!isHttpToken(name)) throw new Error(`Invalid HTTP header name: ${name}`);
    if (/[\0\r\n]/.test(value)) throw new Error(`Header ${name} contains a control or line-break character that Fetch rejects.`);
    value = value.replace(/^[\t ]+|[\t ]+$/g, "");

    if (isForbiddenFetchHeader(name, value)) {
      ignoredForbiddenHeaders.push(name);
      return;
    }

    const normalizedName = name.toLowerCase();
    const current = merged.get(normalizedName);
    if (current) current.value = `${current.value}, ${value}`;
    else merged.set(normalizedName, { name, value });
  });

  return { headers: Array.from(merged.values()), ignoredForbiddenHeaders };
}

function isForbiddenFetchHeader(name: string, value: string) {
  const normalized = name.toLowerCase();
  const forbidden = new Set([
    "accept-charset", "accept-encoding", "access-control-request-headers",
    "access-control-request-method", "connection", "content-length", "cookie",
    "cookie2", "date", "dnt", "expect", "host", "keep-alive", "origin",
    "referer", "set-cookie", "te", "trailer", "transfer-encoding", "upgrade", "via",
  ]);
  if (forbidden.has(normalized) || normalized.startsWith("proxy-") || normalized.startsWith("sec-")) return true;
  if (["x-http-method", "x-http-method-override", "x-method-override"].includes(normalized)) {
    return value.split(",").some((method) => ["CONNECT", "TRACE", "TRACK"].includes(method.trim().toUpperCase()));
  }
  return false;
}

function parsePrimitiveHeaderValue(raw: string, name: string) {
  const trimmed = raw.trim();
  if (isQuotedLiteral(trimmed)) return parseJavaScriptStringLiteral(trimmed, `Header ${name}`);
  if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(trimmed)) return trimmed;
  if (["true", "false", "null"].includes(trimmed)) return trimmed;
  throw new Error(`Header ${name} must have a literal string or primitive value. Dynamic header expressions are not executed.`);
}

function extractBody(entries: ObjectEntry[]) {
  const entry = getLastEntry(entries, "body");
  if (!entry) return "";
  const raw = entry.rawValue.trim();

  if (isQuotedLiteral(raw)) {
    const value = parseJavaScriptStringLiteral(raw, "Request body");
    if (value.includes("\0")) throw new Error("The request body contains a NUL character, which cannot be represented in a shell argument.");
    return value;
  }

  if (/^JSON\.stringify\s*\(/.test(raw)) {
    const openIndex = raw.indexOf("(");
    const call = readBalanced(raw, openIndex, "(", ")");
    if (!call || raw.slice(openIndex + call.length).trim()) {
      throw new Error("Could not read the JSON.stringify(...) body safely.");
    }
    const argument = call.slice(1, -1).trim();
    const value = parseJsonLikeLiteral(argument);
    return JSON.stringify(value);
  }

  throw new Error("The body must be a string literal or JSON.stringify() around a JSON-compatible literal object or array. FormData, URLSearchParams, streams, variables, and function calls are not guessed.");
}

function getLastEntry(entries: ObjectEntry[], key: string) {
  for (let index = entries.length - 1; index >= 0; index -= 1) {
    if (entries[index].key === key) return entries[index];
  }
  return undefined;
}

function buildCurlCommand(
  parsed: ParsedFetchRequest,
  options: {
    outputStyle: OutputStyle;
    quoteStyle: QuoteStyle;
    hideSensitiveValues: boolean;
    includeCompressed: boolean;
  }
) {
  const quote = options.quoteStyle === "single" ? "'" : '"';
  const targetUrl = options.hideSensitiveValues ? maskSensitiveUrl(parsed.url) : parsed.url;
  const quotedUrl = shellQuote(targetUrl, quote);
  const firstSegment = parsed.method === "GET"
    ? `curl ${quotedUrl}`
    : parsed.method === "HEAD"
      ? `curl --head ${quotedUrl}`
      : parsed.method === "POST" && parsed.body !== ""
        ? `curl ${quotedUrl}`
        : `curl --request ${parsed.method} ${quotedUrl}`;
  const segments = [firstSegment];

  parsed.headers.forEach((header) => {
    const value = options.hideSensitiveValues && isSensitiveHeader(header.name)
      ? getSafeHeaderPlaceholder(header.name, header.value)
      : header.value;
    segments.push(`--header ${shellQuote(`${header.name}: ${value}`, quote)}`);
  });

  if (parsed.body !== "") segments.push(`--data-raw ${shellQuote(parsed.body, quote)}`);

  const effectiveRedirect = parsed.redirect || "follow";
  if (effectiveRedirect === "follow") {
    segments.push("--location");
    segments.push("--max-redirs 20");
  }
  if (options.includeCompressed) segments.push("--compressed");

  if (options.outputStyle === "single") return segments.join(" ");
  return segments.join(" \\\n  ");
}

function shellQuote(value: string, quote: string) {
  if (value.includes("\0")) throw new Error("A value contains NUL, which cannot be represented as a normal shell command argument.");
  if (quote === "'") return `'${value.replace(/'/g, `'\\''`)}'`;
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\$/g, "\\$").replace(/`/g, "\\`")}"`;
}

function getConversionNotes(parsed: ParsedFetchRequest): ConversionNote[] {
  const notes: ConversionNote[] = [];

  if (parsed.fragmentRemoved) {
    notes.push({
      tone: "info",
      title: "URL fragment removed",
      message: "A #fragment identifies client-side state and is not part of the HTTP request target, so it is left out of the generated command.",
    });
  }

  if (parsed.ignoredForbiddenHeaders.length > 0) {
    notes.push({
      tone: "warning",
      title: "Browser-controlled request headers were left out",
      message: `Fetch does not let page JavaScript set these request headers directly, so the cURL command omits them instead of pretending the browser sends the literal values: ${parsed.ignoredForbiddenHeaders.join(", ")}.`,
    });
  }

  if (parsed.headers.some((header) => isSensitiveHeader(header.name)) || parsed.queryParams.some((param) => isSensitiveQueryKey(param.key))) {
    notes.push({
      tone: "warning",
      title: "Share-sensitive values detected",
      message: "Credential-like headers or query parameters are present. Keep masking enabled before copying the command into tickets, chat, logs, or documentation.",
    });
  }

  if (parsed.credentials) {
    notes.push({
      tone: "warning",
      title: "Fetch credentials mode stays browser-specific",
      message: `credentials: ${parsed.credentials} controls browser-managed cookies and authentication state. cURL does not inherit that browser credential store.`,
    });
  }

  if (parsed.mode) {
    notes.push({
      tone: "warning",
      title: "CORS mode has no cURL equivalent",
      message: `mode: ${parsed.mode} belongs to the browser Fetch security model. The terminal request is not subject to browser CORS enforcement.`,
    });
  }

  if (parsed.cache) {
    notes.push({
      tone: "info",
      title: "Fetch cache mode is not translated",
      message: `cache: ${parsed.cache} controls browser cache interaction. No cURL flag is added because the semantics are not equivalent.`,
    });
  }

  if ((parsed.redirect || "follow") === "follow" && !["GET", "HEAD", "POST"].includes(parsed.method)) {
    notes.push({
      tone: "warning",
      title: "Redirect method rewriting can differ",
      message: `The command needs --request ${parsed.method}. On redirects such as HTTP 303, cURL's explicit custom-method behavior can differ from Fetch's method rewriting rules.`,
    });
  }

  if (parsed.redirect === "manual") {
    notes.push({
      tone: "warning",
      title: "Manual redirect handling differs",
      message: "Fetch manual mode can expose an opaque redirect response in browser contexts. cURL without --location simply returns the redirect response, which is not the same abstraction.",
    });
  }

  if (parsed.redirect === "error") {
    notes.push({
      tone: "warning",
      title: "redirect: error is not reproduced exactly",
      message: "The command does not follow redirects, but plain cURL does not fail on every 3xx response the same way Fetch redirect:error does.",
    });
  }

  if (parsed.unsupportedOptions.length > 0) {
    notes.push({
      tone: "warning",
      title: "Browser-only or unsupported options were not converted",
      message: `Review these RequestInit fields separately: ${parsed.unsupportedOptions.join(", ")}. Their runtime behavior cannot be represented safely by a simple cURL flag mapping.`,
    });
  }

  return notes;
}

function isSensitiveHeader(name: string) {
  const normalized = name.toLowerCase();
  return normalized === "authorization" || normalized === "cookie" || normalized === "proxy-authorization" || /(?:^|[-_])(token|secret|api[-_]?key|password|passwd|session)(?:$|[-_])/i.test(normalized);
}

function isSensitiveQueryKey(name: string) {
  return /(?:^|[-_.])(token|access_token|refresh_token|api[-_]?key|apikey|secret|password|passwd|session|sessionid|auth)(?:$|[-_.])/i.test(name);
}

function getSafeHeaderPlaceholder(headerName: string, originalValue: string) {
  const normalized = headerName.toLowerCase();
  if (normalized === "authorization" || normalized === "proxy-authorization") {
    const scheme = originalValue.trim().split(/\s+/, 1)[0] || "";
    if (/^[A-Za-z][A-Za-z0-9+.-]*$/.test(scheme)) return `${scheme} YOUR_CREDENTIALS`;
    return "YOUR_CREDENTIALS";
  }
  if (normalized === "cookie") return "session=YOUR_VALUE";
  if (normalized.includes("api")) return "YOUR_API_KEY";
  return "YOUR_VALUE";
}

function maskSensitiveUrl(url: string) {
  const queryIndex = url.indexOf("?");
  if (queryIndex === -1) return url;

  const prefix = url.slice(0, queryIndex + 1);
  const rawQuery = url.slice(queryIndex + 1);
  let changed = false;

  const masked = rawQuery.split("&").map((pair) => {
    if (!pair) return pair;
    const equalsIndex = pair.indexOf("=");
    const rawKey = equalsIndex === -1 ? pair : pair.slice(0, equalsIndex);
    const decodedKey = safeFormDecode(rawKey);
    if (!isSensitiveQueryKey(decodedKey)) return pair;
    changed = true;
    return `${rawKey}=YOUR_VALUE`;
  });

  return changed ? `${prefix}${masked.join("&")}` : url;
}

function safeFormDecode(value: string) {
  try {
    return decodeURIComponent(value.replace(/\+/g, " "));
  } catch {
    return value;
  }
}

function utf8ByteLength(value: string) {
  return new TextEncoder().encode(value).length;
}

function isHttpToken(value: string) {
  return /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/.test(value);
}

function isQuotedLiteral(value: string) {
  const trimmed = value.trim();
  if (trimmed.length < 2) return false;
  const first = trimmed[0];
  return (first === '"' || first === "'" || first === "`") && trimmed[trimmed.length - 1] === first;
}

function parseJavaScriptStringLiteral(raw: string, label: string) {
  const trimmed = raw.trim();
  if (!isQuotedLiteral(trimmed)) throw new Error(`${label} must be a literal quoted string. Runtime expressions are not executed.`);
  const quote = trimmed[0];
  const inner = trimmed.slice(1, -1);
  if (quote === "`" && inner.includes("${")) throw new Error(`${label} uses template interpolation, which depends on runtime values and is not converted.`);

  let result = "";
  for (let index = 0; index < inner.length; index += 1) {
    const char = inner[index];
    if (char !== "\\") {
      result += char;
      continue;
    }

    index += 1;
    if (index >= inner.length) throw new Error(`${label} ends with an incomplete escape sequence.`);
    const escaped = inner[index];

    if (escaped === "\n") continue;
    if (escaped === "\r") {
      if (inner[index + 1] === "\n") index += 1;
      continue;
    }

    const simple: Record<string, string> = {
      n: "\n", r: "\r", t: "\t", b: "\b", f: "\f", v: "\v", "0": "\0",
      "\\": "\\", "\"": "\"", "'": "'", "`": "`",
    };
    if (Object.prototype.hasOwnProperty.call(simple, escaped)) {
      if (escaped === "0" && /[0-9]/.test(inner[index + 1] || "")) throw new Error(`${label} contains an unsupported legacy octal escape.`);
      result += simple[escaped];
      continue;
    }

    if (escaped === "x") {
      const hex = inner.slice(index + 1, index + 3);
      if (!/^[0-9A-Fa-f]{2}$/.test(hex)) throw new Error(`${label} contains an invalid hexadecimal escape.`);
      result += String.fromCharCode(parseInt(hex, 16));
      index += 2;
      continue;
    }

    if (escaped === "u") {
      if (inner[index + 1] === "{") {
        const close = inner.indexOf("}", index + 2);
        if (close === -1) throw new Error(`${label} contains an incomplete Unicode escape.`);
        const hex = inner.slice(index + 2, close);
        if (!/^[0-9A-Fa-f]{1,6}$/.test(hex)) throw new Error(`${label} contains an invalid Unicode code point escape.`);
        const codePoint = parseInt(hex, 16);
        if (codePoint > 0x10ffff) throw new Error(`${label} contains a Unicode code point above U+10FFFF.`);
        result += String.fromCodePoint(codePoint);
        index = close;
        continue;
      }
      const hex = inner.slice(index + 1, index + 5);
      if (!/^[0-9A-Fa-f]{4}$/.test(hex)) throw new Error(`${label} contains an invalid Unicode escape.`);
      result += String.fromCharCode(parseInt(hex, 16));
      index += 4;
      continue;
    }

    result += escaped;
  }

  return result;
}

function stripJavaScriptComments(source: string) {
  let result = "";
  let quote: "'" | '"' | "`" | null = null;
  let escaped = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (quote) {
      result += char;
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === "'" || char === '"' || char === "`") {
      quote = char;
      result += char;
      continue;
    }

    if (char === "/" && next === "/") {
      index += 2;
      while (index < source.length && source[index] !== "\n" && source[index] !== "\r") index += 1;
      result += "\n";
      continue;
    }

    if (char === "/" && next === "*") {
      index += 2;
      while (index < source.length && !(source[index] === "*" && source[index + 1] === "/")) index += 1;
      index += 1;
      result += " ";
      continue;
    }

    result += char;
  }

  return result;
}

function readBalanced(source: string, startIndex: number, openChar: string, closeChar: string) {
  let depth = 0;
  let quote: "'" | '"' | "`" | null = null;
  let escaped = false;

  for (let index = startIndex; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === "'" || char === '"' || char === "`") {
      quote = char;
      continue;
    }
    if (char === openChar) depth += 1;
    else if (char === closeChar) {
      depth -= 1;
      if (depth === 0) return source.slice(startIndex, index + 1);
    }
  }
  return "";
}

function splitTopLevel(value: string, separator: string) {
  const parts: string[] = [];
  let current = "";
  let depth = 0;
  let quote: "'" | '"' | "`" | null = null;
  let escaped = false;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (quote) {
      current += char;
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === "'" || char === '"' || char === "`") {
      quote = char;
      current += char;
      continue;
    }
    if (char === "{" || char === "[" || char === "(") depth += 1;
    else if (char === "}" || char === "]" || char === ")") depth = Math.max(0, depth - 1);
    if (char === separator && depth === 0) {
      if (current.trim()) parts.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function findTopLevelColon(value: string) {
  let depth = 0;
  let quote: "'" | '"' | "`" | null = null;
  let escaped = false;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === "'" || char === '"' || char === "`") {
      quote = char;
      continue;
    }
    if (char === "{" || char === "[" || char === "(") depth += 1;
    else if (char === "}" || char === "]" || char === ")") depth = Math.max(0, depth - 1);
    else if (char === ":" && depth === 0) return index;
  }
  return -1;
}

function parseJsonLikeLiteral(source: string): unknown {
  let index = 0;

  const skipSpace = () => {
    while (/\s/.test(source[index] || "")) index += 1;
  };

  const parseValue = (): unknown => {
    skipSpace();
    const char = source[index];
    if (char === "{" ) return parseObject();
    if (char === "[") return parseArray();
    if (char === '"' || char === "'") return parseString();

    const rest = source.slice(index);
    const literal = /^(true|false|null)\b/.exec(rest);
    if (literal) {
      index += literal[0].length;
      if (literal[1] === "true") return true;
      if (literal[1] === "false") return false;
      return null;
    }

    const number = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(rest);
    if (number) {
      index += number[0].length;
      const value = Number(number[0]);
      if (!Number.isFinite(value)) throw new Error("JSON.stringify literal contains a non-finite number.");
      return value;
    }

    throw new Error(`JSON.stringify argument contains an unsupported expression near ${JSON.stringify(rest.slice(0, 24))}.`);
  };

  const parseString = () => {
    const quote = source[index];
    let raw = quote;
    index += 1;
    let escaped = false;
    while (index < source.length) {
      const char = source[index];
      raw += char;
      index += 1;
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) return parseJavaScriptStringLiteral(raw, "JSON.stringify string");
    }
    throw new Error("JSON.stringify argument contains an unterminated string.");
  };

  const parseKey = () => {
    skipSpace();
    if (source[index] === '"' || source[index] === "'") return parseString();
    const match = /^[A-Za-z_$][A-Za-z0-9_$]*/.exec(source.slice(index));
    if (!match) throw new Error("JSON.stringify object contains a computed or unsupported property name.");
    index += match[0].length;
    return match[0];
  };

  const parseObject = () => {
    const result: Record<string, unknown> = {};
    index += 1;
    skipSpace();
    if (source[index] === "}") {
      index += 1;
      return result;
    }
    while (index < source.length) {
      const key = parseKey();
      if (key === "__proto__") throw new Error("JSON.stringify object uses __proto__, whose JavaScript object-literal semantics are not treated as ordinary JSON data here.");
      skipSpace();
      if (source[index] !== ":") throw new Error("JSON.stringify object property is missing a colon.");
      index += 1;
      result[key] = parseValue();
      skipSpace();
      if (source[index] === "}") {
        index += 1;
        return result;
      }
      if (source[index] !== ",") throw new Error("JSON.stringify object properties must be separated by commas.");
      index += 1;
      skipSpace();
      if (source[index] === "}") {
        index += 1;
        return result;
      }
    }
    throw new Error("JSON.stringify object is not closed.");
  };

  const parseArray = () => {
    const result: unknown[] = [];
    index += 1;
    skipSpace();
    if (source[index] === "]") {
      index += 1;
      return result;
    }
    while (index < source.length) {
      result.push(parseValue());
      skipSpace();
      if (source[index] === "]") {
        index += 1;
        return result;
      }
      if (source[index] !== ",") throw new Error("JSON.stringify array items must be separated by commas.");
      index += 1;
      skipSpace();
      if (source[index] === "]") {
        index += 1;
        return result;
      }
    }
    throw new Error("JSON.stringify array is not closed.");
  };

  const value = parseValue();
  skipSpace();
  if (index !== source.length) throw new Error("JSON.stringify argument contains extra syntax after the literal value.");
  return value;
}
