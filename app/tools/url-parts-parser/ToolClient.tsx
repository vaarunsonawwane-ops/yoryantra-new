"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "summary" | "json" | "query";
type DecodeMode = "decoded" | "serialized";
type NoteTone = "warning" | "info";

type QueryParam = {
  key: string;
  value: string;
  raw: string;
};

type URLPart = {
  label: string;
  value: string;
};

type ParsedURL = {
  href: string;
  protocol: string;
  username: string;
  password: string;
  host: string;
  hostname: string;
  port: string;
  origin: string;
  pathname: string;
  pathSegments: string[];
  search: string;
  hash: string;
  queryParams: QueryParam[];
  queryParamCount: number;
  isAbsolute: boolean;
  hasCredentials: boolean;
  sourceWasRelative: boolean;
};

type URLNote = {
  title: string;
  message: string;
  tone: NoteTone;
};

const sampleUrl =
  "https://user:pass@api.example.com:8443/v1/users/101/profile?role=admin&active=true&tag=api&tag=http#details";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [baseUrl, setBaseUrl] = useState("https://example.com/app/");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [decodeMode, setDecodeMode] = useState<DecodeMode>("decoded");
  const [allowRelativeUrls, setAllowRelativeUrls] = useState(true);
  const [hideCredentials, setHideCredentials] = useState(true);
  const [parsedUrl, setParsedUrl] = useState<ParsedURL | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (parsedUrl ? getURLNotes(parsedUrl) : []), [parsedUrl]);

  const urlParts = useMemo(() => {
    if (!parsedUrl) return [];
    return getURLParts(parsedUrl, hideCredentials);
  }, [parsedUrl, hideCredentials]);

  const parseUrl = () => {
    if (!input.trim()) {
      setError("Enter a URL or relative reference first.");
      setParsedUrl(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const nextParsed = parseURL(input, {
        baseUrl,
        decodeMode,
        allowRelativeUrls,
      });
      const nextOutput = formatParsedURL(nextParsed, {
        outputMode,
        hideCredentials,
        decodeMode,
      });

      setParsedUrl(nextParsed);
      setOutput(nextOutput);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to parse this URL.");
      setParsedUrl(null);
      setOutput("");
      setCopied(false);
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setError("");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setError("Copy failed. Select the parsed output and copy it manually.");
    }
  };

  const loadExample = () => {
    setInput(sampleUrl);
    setBaseUrl("https://example.com/app/");
    setOutputMode("summary");
    setDecodeMode("decoded");
    setAllowRelativeUrls(true);
    setHideCredentials(true);
    setParsedUrl(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setBaseUrl("https://example.com/app/");
    setOutputMode("summary");
    setDecodeMode("decoded");
    setAllowRelativeUrls(true);
    setHideCredentials(true);
    setParsedUrl(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="URL Parts Parser"
      description="Separate absolute or relative URLs into serialized components while preserving duplicate query parameters and credential boundaries."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="mb-2 block text-sm font-medium text-gray-700">URL or Relative Reference</label>
        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setParsedUrl(null);
            setOutput("");
            setError("");
            setCopied(false);
          }}
          placeholder={sampleUrl}
          className="min-h-[160px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Browser URL parsing can normalize the serialized result. The source is not fetched or contacted.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Parsing Options</h3>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value) => {
              setOutputMode(value as OutputMode);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Summary", value: "summary" },
              { label: "JSON", value: "json" },
              { label: "Query parameters", value: "query" },
            ]}
          />

          <YoryantraSelect
            label="Query & Path Segment Values"
            value={decodeMode}
            onChange={(value) => {
              setDecodeMode(value as DecodeMode);
              setParsedUrl(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Decoded", value: "decoded" },
              { label: "Serialized", value: "serialized" },
            ]}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex cursor-pointer gap-3 self-start rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={allowRelativeUrls}
              onChange={(event) => {
                setAllowRelativeUrls(event.target.checked);
                setParsedUrl(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]"
            />
            <span>
              <span className="block text-sm font-medium text-gray-900">Resolve relative references</span>
              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Use the base URL below for paths such as <span className="font-mono">../users?page=1</span> or <span className="font-mono">//cdn.example.com/a.js</span>.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer gap-3 self-start rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={hideCredentials}
              onChange={(event) => {
                setHideCredentials(event.target.checked);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]"
            />
            <span>
              <span className="block text-sm font-medium text-gray-900">Hide URL userinfo credentials</span>
              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Remove username and password from copied full-URL and JSON output. Query-string secrets are not automatically removed.
              </span>
            </span>
          </label>
        </div>

        {allowRelativeUrls && (
          <div className="mt-4 max-w-2xl">
            <label className="mb-2 block text-sm font-medium text-gray-700">Base URL for Relative References</label>
            <input
              value={baseUrl}
              onChange={(event) => {
                setBaseUrl(event.target.value);
                setParsedUrl(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              placeholder="https://example.com/app/"
              className="w-full rounded-xl border border-gray-300 p-3 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Must itself be an absolute URL. Relative resolution follows browser URL rules, including dot-segment removal.
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={parseUrl} className="yoryantra-btn whitespace-nowrap">Parse URL</button>
        <button onClick={loadExample} className="yoryantra-btn-outline whitespace-nowrap">Load Example</button>
        <button onClick={resetAll} className="yoryantra-btn-outline whitespace-nowrap">Reset</button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {parsedUrl && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Scheme" value={parsedUrl.protocol || "none"} />
          <SummaryCard label="Host" value={parsedUrl.host || "none"} />
          <SummaryCard label="Query Params" value={parsedUrl.queryParamCount.toLocaleString()} />
          <SummaryCard label="Path Segments" value={parsedUrl.pathSegments.length.toLocaleString()} />
        </div>
      )}

      {parsedUrl && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Serialized URL Parts</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            These values come from the browser URL serializer. Decoding affects the query table and individual path-segment display, not the serialized pathname itself.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {urlParts.map((part) => (
              <DetailCard key={part.label} label={part.label} value={part.value} />
            ))}
          </div>
        </div>
      )}

      {parsedUrl && parsedUrl.queryParams.length > 0 && (
        <ParsedTable
          title="Query Parameters"
          description={
            decodeMode === "decoded"
              ? "Decoded form-style names and values. A plus sign in the serialized query is interpreted as a space."
              : "Serialized query pairs preserved as they appeared after browser URL parsing."
          }
          columns={["Name", "Value"]}
          rows={parsedUrl.queryParams.map((param) => [param.key, param.value])}
        />
      )}

      {parsedUrl && parsedUrl.pathSegments.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Path Segments</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Segments are split before optional percent-decoding, so an encoded slash inside one segment does not silently become a new path boundary.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {parsedUrl.pathSegments.map((segment, index) => (
              <div key={`${segment}-${index}`} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Segment {index + 1}</div>
                <div className="mt-1 break-words font-mono text-sm text-gray-900">{segment}</div>
              </div>
            ))}
          </div>
        </div>
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
              <p className={note.tone === "warning" ? "text-sm font-semibold text-amber-900" : "text-sm font-semibold text-gray-900"}>{note.title}</p>
              <p className={note.tone === "warning" ? "mt-1 text-sm leading-relaxed text-amber-800" : "mt-1 text-sm leading-relaxed text-gray-600"}>{note.message}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Parsed Output</h3>
          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline whitespace-nowrap text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
        <pre className="yoryantra-output min-h-[240px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "Parsed URL output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
        URL parsing stays in your browser. No DNS lookup, HTTP request, redirect follow, or server validation is performed.
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Browser URL parsing is more than splitting on punctuation</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A browser URL parser resolves relative references, normalizes special-scheme URLs, handles IPv6 brackets, separates userinfo from the host, removes dot segments during resolution, and serializes the result back into a canonical form. Reading those components through the platform URL API avoids many mistakes that come from a single regular expression.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Relative references only make sense with a base</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A reference such as <span className="font-mono">../users?id=7</span> does not identify one absolute URL on its own. The selected base supplies the scheme, authority, and path context needed for resolution. Network-path references beginning with <span className="font-mono">//</span> inherit the base scheme but provide their own authority.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Serialized and decoded values answer different questions</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The serialized pathname remains percent-encoded so the displayed component does not invent new separators. Individual path segments can be decoded separately. Query decoding follows URLSearchParams form rules, where percent escapes are decoded and <span className="font-mono">+</span> represents a space. Serialized query mode keeps the browser-serialized pair text instead.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Duplicate query names are not collapsed. Each occurrence stays visible because APIs often assign meaning to repeated fields and their order.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Fragments, credentials, and secret-looking query data</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A <span className="font-mono">#fragment</span> is a separate URI component used by the client; it is not part of the HTTP request target sent to an origin server. Username/password userinfo is shown separately and can be removed from copied full-URL output. That setting does not claim to find every secret hidden in query parameters, so token-like query names are surfaced as a caution instead of silently rewritten.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Standards behind the component model</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Browser parsing and serialization follow the{" "}
            <a className="font-medium text-[var(--green)] underline underline-offset-2" href="https://url.spec.whatwg.org/" target="_blank" rel="noreferrer">WHATWG URL Standard</a>.
            The broader scheme, authority, path, query, fragment, and relative-reference model is described in{" "}
            <a className="font-medium text-[var(--green)] underline underline-offset-2" href="https://www.rfc-editor.org/rfc/rfc3986.html" target="_blank" rel="noreferrer">RFC 3986</a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/url-parts-parser" />
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
      <p className="mt-2 text-sm leading-relaxed text-gray-500">{description}</p>
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

function parseURL(
  input: string,
  options: {
    baseUrl: string;
    decodeMode: DecodeMode;
    allowRelativeUrls: boolean;
  }
): ParsedURL {
  const trimmed = input.trim();
  const hasScheme = /^[A-Za-z][A-Za-z0-9+.-]*:/.test(trimmed);
  const sourceWasRelative = !hasScheme;

  if (sourceWasRelative && !options.allowRelativeUrls) {
    throw new Error("This is a relative URL reference. Enable relative resolution or provide an absolute URL with a scheme.");
  }

  let parsed: URL;
  try {
    if (sourceWasRelative) {
      const base = parseAbsoluteBase(options.baseUrl);
      parsed = new URL(trimmed, base);
    } else {
      parsed = new URL(trimmed);
    }
  } catch {
    throw new Error("The URL could not be parsed. Check the scheme, host syntax, brackets, percent escapes, and relative base URL.");
  }

  const pathSegments = parsed.pathname
    .split("/")
    .filter((segment) => segment !== "")
    .map((segment) => options.decodeMode === "decoded" ? safePercentDecode(segment) : segment);

  const queryParams = options.decodeMode === "decoded"
    ? getDecodedQueryParams(parsed)
    : getSerializedQueryParams(parsed.search);

  return {
    href: parsed.href,
    protocol: parsed.protocol,
    username: parsed.username,
    password: parsed.password,
    host: parsed.host,
    hostname: parsed.hostname,
    port: parsed.port,
    origin: parsed.origin,
    pathname: parsed.pathname,
    pathSegments,
    search: parsed.search,
    hash: parsed.hash,
    queryParams,
    queryParamCount: queryParams.length,
    isAbsolute: hasScheme,
    hasCredentials: Boolean(parsed.username || parsed.password),
    sourceWasRelative,
  };
}

function parseAbsoluteBase(baseUrl: string) {
  const trimmed = baseUrl.trim();
  if (!trimmed) throw new Error("Enter an absolute base URL before resolving a relative reference.");
  if (!/^[A-Za-z][A-Za-z0-9+.-]*:/.test(trimmed)) throw new Error("The base URL must include an absolute scheme such as https://.");
  const base = new URL(trimmed);
  return base.href;
}

function getDecodedQueryParams(parsed: URL): QueryParam[] {
  const rawPairs = getRawQueryPairs(parsed.search);
  const params: QueryParam[] = [];
  let index = 0;
  parsed.searchParams.forEach((value, key) => {
    params.push({ key, value, raw: rawPairs[index] || "" });
    index += 1;
  });
  return params;
}

function getSerializedQueryParams(search: string): QueryParam[] {
  return getRawQueryPairs(search).map((raw) => {
    const equalsIndex = raw.indexOf("=");
    if (equalsIndex === -1) return { key: raw, value: "", raw };
    return {
      key: raw.slice(0, equalsIndex),
      value: raw.slice(equalsIndex + 1),
      raw,
    };
  });
}

function getRawQueryPairs(search: string) {
  const rawSearch = search.startsWith("?") ? search.slice(1) : search;
  if (!rawSearch) return [];
  return rawSearch.split("&").filter((part) => part !== "");
}

function getURLParts(parsed: ParsedURL, hideCredentials: boolean): URLPart[] {
  return [
    { label: "Full URL", value: sanitizeHref(parsed, hideCredentials) },
    { label: "Scheme", value: parsed.protocol },
    { label: "Origin", value: parsed.origin },
    { label: "Host", value: parsed.host },
    { label: "Hostname", value: parsed.hostname },
    { label: "Port", value: parsed.port },
    { label: "Serialized Path", value: parsed.pathname },
    { label: "Query String", value: parsed.search },
    { label: "Fragment", value: parsed.hash },
    { label: "Username", value: hideCredentials && parsed.username ? "[hidden]" : parsed.username },
    { label: "Password", value: hideCredentials && parsed.password ? "[hidden]" : parsed.password },
  ];
}

function formatParsedURL(
  parsed: ParsedURL,
  options: {
    outputMode: OutputMode;
    hideCredentials: boolean;
    decodeMode: DecodeMode;
  }
) {
  const safeHref = sanitizeHref(parsed, options.hideCredentials);

  if (options.outputMode === "json") {
    return JSON.stringify(
      {
        href: safeHref,
        protocol: parsed.protocol,
        username: options.hideCredentials && parsed.username ? "[hidden]" : parsed.username,
        password: options.hideCredentials && parsed.password ? "[hidden]" : parsed.password,
        host: parsed.host,
        hostname: parsed.hostname,
        port: parsed.port,
        origin: parsed.origin,
        pathname: parsed.pathname,
        pathSegments: parsed.pathSegments,
        search: parsed.search,
        hash: parsed.hash,
        queryParams: parsed.queryParams.map(({ key, value }) => ({ key, value })),
        queryParamCount: parsed.queryParamCount,
        sourceWasRelative: parsed.sourceWasRelative,
      },
      null,
      2
    );
  }

  if (options.outputMode === "query") {
    return parsed.queryParams
      .map((param) =>
        options.decodeMode === "serialized" ? param.raw : `${param.key} = ${param.value}`
      )
      .join("\n");
  }

  return [
    `Full URL: ${safeHref}`,
    `Scheme: ${parsed.protocol || "(none)"}`,
    `Origin: ${parsed.origin || "(none)"}`,
    `Host: ${parsed.host || "(none)"}`,
    `Hostname: ${parsed.hostname || "(none)"}`,
    `Port: ${parsed.port || "(none)"}`,
    `Serialized path: ${parsed.pathname || "(empty)"}`,
    `Query string: ${parsed.search || "(none)"}`,
    `Fragment: ${parsed.hash || "(none)"}`,
    `Query parameters: ${parsed.queryParamCount}`,
    `Path segments: ${parsed.pathSegments.length}`,
    `Source: ${parsed.sourceWasRelative ? "relative reference resolved against base" : "absolute URL"}`,
    parsed.hasCredentials
      ? `URL credentials: ${options.hideCredentials ? "[hidden]" : "present"}`
      : "URL credentials: none",
  ].join("\n");
}

function sanitizeHref(parsed: ParsedURL, hideCredentials: boolean) {
  if (!hideCredentials || !parsed.hasCredentials) return parsed.href;
  try {
    const clone = new URL(parsed.href);
    clone.username = "";
    clone.password = "";
    return clone.href;
  } catch {
    return parsed.href;
  }
}

function getURLNotes(parsed: ParsedURL): URLNote[] {
  const notes: URLNote[] = [];

  if (parsed.sourceWasRelative) {
    notes.push({
      tone: "info",
      title: "Relative reference resolved",
      message: "The displayed full URL is the browser-resolved result, not the original relative text by itself.",
    });
  }

  if (parsed.hasCredentials) {
    notes.push({
      tone: "warning",
      title: "Username or password is embedded in the URL",
      message: "Userinfo credentials can leak through logs, screenshots, browser history, and copied links. Keep credential hiding enabled before sharing output.",
    });
  }

  if (parsed.queryParams.some((param) => isSensitiveQueryKey(param.key))) {
    notes.push({
      tone: "warning",
      title: "Secret-looking query names found",
      message: "A query parameter name resembles a token, API key, password, session, or authentication field. Query values are not automatically masked by the URL-credential setting.",
    });
  }

  if (parsed.hash) {
    notes.push({
      tone: "info",
      title: "Fragment is separate from the network request target",
      message: "The #fragment is a client-side URI component. It is displayed here but is not sent as part of an HTTP request target to the origin server.",
    });
  }

  if (parsed.protocol && !["http:", "https:"].includes(parsed.protocol)) {
    notes.push({
      tone: "info",
      title: "Non-HTTP URL scheme",
      message: `The browser URL parser recognizes ${parsed.protocol}, but host, origin, path, and request behavior depend on that scheme and may differ from HTTP URLs.`,
    });
  }

  return notes;
}

function safePercentDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function isSensitiveQueryKey(name: string) {
  const decoded = safeFormDecode(name);
  return /(?:^|[-_.])(token|access_token|refresh_token|api[-_]?key|apikey|secret|password|passwd|session|sessionid|auth)(?:$|[-_.])/i.test(decoded);
}

function safeFormDecode(value: string) {
  try {
    return decodeURIComponent(value.replace(/\+/g, " "));
  } catch {
    return value;
  }
}
