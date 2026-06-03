"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "summary" | "json" | "query";
type DecodeMode = "decoded" | "raw";

type QueryParam = {
  key: string;
  value: string;
};

type URLPart = {
  label: string;
  value: string;
};

type ParsedURL = {
  input: string;
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
};

type URLNote = {
  title: string;
  message: string;
};

const sampleUrl =
  "https://user:pass@api.example.com:8443/v1/users/101/profile?role=admin&active=true&tag=api&tag=http#details";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [baseUrl, setBaseUrl] = useState("https://example.com");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [decodeMode, setDecodeMode] = useState<DecodeMode>("decoded");
  const [allowRelativeUrls, setAllowRelativeUrls] = useState(true);
  const [hideCredentials, setHideCredentials] = useState(true);
  const [parsedUrl, setParsedUrl] = useState<ParsedURL | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(
    () => (parsedUrl ? getURLNotes(parsedUrl) : []),
    [parsedUrl]
  );

  const urlParts = useMemo(() => {
    if (!parsedUrl) {
      return [];
    }

    return getURLParts(parsedUrl, hideCredentials);
  }, [parsedUrl, hideCredentials]);

  const parseUrl = () => {
    if (!input.trim()) {
      setError("Please enter a URL to parse.");
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
    if (!output) {
      return;
    }

    await navigator.clipboard.writeText(output);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1400);
  };

  const loadExample = () => {
    setInput(sampleUrl);
    setBaseUrl("https://example.com");
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
    setBaseUrl("https://example.com");
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
      description="Parse URLs into protocol, hostname, port, path, query parameters, hash, origin, and readable URL parts directly in your browser."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          URL Input
        </label>

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
          className="w-full min-h-[180px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste a full URL, API endpoint, redirect URL, tracking URL, or relative
          URL path to break it into readable parts.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Parser Options
        </h3>

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
              {
                label: "Summary",
                value: "summary",
              },
              {
                label: "JSON",
                value: "json",
              },
              {
                label: "Query params",
                value: "query",
              },
            ]}
          />

          <YoryantraSelect
            label="Query Values"
            value={decodeMode}
            onChange={(value) => {
              setDecodeMode(value as DecodeMode);
              setParsedUrl(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              {
                label: "Decoded",
                value: "decoded",
              },
              {
                label: "Raw",
                value: "raw",
              },
            ]}
          />


        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
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
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Allow relative URLs
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Parse paths like /api/users by using the base URL above.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={hideCredentials}
              onChange={(event) => {
                setHideCredentials(event.target.checked);
                setOutput("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Hide URL credentials
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Hide username and password values in copied output.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={parseUrl} className="yoryantra-btn">
          Parse URL
        </button>

        <button onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {parsedUrl && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Protocol" value={parsedUrl.protocol || "none"} />
          <SummaryCard label="Host" value={parsedUrl.host || "none"} />
          <SummaryCard
            label="Query Params"
            value={parsedUrl.queryParamCount.toLocaleString()}
          />
          <SummaryCard
            label="Path Segments"
            value={parsedUrl.pathSegments.length.toLocaleString()}
          />
        </div>
      )}

      {parsedUrl && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            URL Parts
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            The URL split into the parts browsers and servers use.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {urlParts.map((part) => (
              <DetailCard
                key={part.label}
                label={part.label}
                value={part.value || "(empty)"}
              />
            ))}
          </div>
        </div>
      )}

      {parsedUrl && parsedUrl.queryParams.length > 0 && (
        <ParsedTable
          title="Query Parameters"
          description="Query string values found after the ? character."
          columns={["Name", "Value"]}
          rows={parsedUrl.queryParams.map((param) => [
            param.key,
            param.value,
          ])}
        />
      )}

      {parsedUrl && parsedUrl.pathSegments.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Path Segments
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Path segments split by slash characters.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {parsedUrl.pathSegments.map((segment, index) => (
              <div
                key={`${segment}-${index}`}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4"
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Segment {index + 1}
                </div>

                <div className="mt-1 break-words font-mono text-sm text-gray-900">
                  {segment}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            URL notes
          </h3>

          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-amber-900">
                  {note.title}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-amber-800">
                  {note.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Parsed Output
          </h3>

          {output && (
            <button
              onClick={copyOutput}
              className="yoryantra-btn-outline text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[280px] whitespace-pre-wrap break-words">
          {output || "Parsed URL output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        URL parsing happens directly in your browser. The URLs you enter are not
        uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Breaking a URL Into Readable Parts
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            URLs can contain many pieces: protocol, hostname, port, path, query
            parameters, hash fragments, and sometimes credentials. When you are
            debugging redirects, API calls, tracking links, or encoded query
            values, it helps to see each part clearly.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This URL Parts Parser splits a URL into readable fields so you can
            check what the browser will send and what the server will receive. It
            is useful for API debugging, link checks, redirect reviews, and
            query parameter cleanup.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Parsing a URL for Debugging
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste a URL or relative path into the input box.</li>
            <li>Choose decoded or raw query value output.</li>
            <li>Use a base URL if you are parsing a relative path.</li>
            <li>Review the protocol, host, path, query parameters, and hash.</li>
            <li>Copy the parsed summary, JSON, or query parameter output.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common URL Parser Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Checking query parameters in API URLs.</li>
            <li>Reading long tracking links without manually splitting them.</li>
            <li>Debugging redirect URLs and hash fragments.</li>
            <li>Checking whether a port, protocol, or hostname is correct.</li>
            <li>Inspecting relative paths before using them in code.</li>
            <li>Copying query parameters into notes, tickets, or API tests.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example URL Parts
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`URL:
https://api.example.com:8443/v1/users?role=admin&active=true#details

Parts:
Protocol: https:
Host: api.example.com:8443
Path: /v1/users
Query: role=admin&active=true
Hash: #details`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Credentials Inside URLs
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Some URLs contain username and password values before the hostname.
            That is uncommon in normal web links and can be risky to share. This
            tool hides URL credentials by default in copied output.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            If a URL contains real credentials, tokens, session IDs, or private
            customer data, replace those values before sharing the URL with
            anyone else.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What does a URL parts parser do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It breaks a URL into pieces such as protocol, hostname, port,
                path, query parameters, and hash fragment.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this parse query parameters?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Query parameters are shown in a table and can also be copied
                as query-only output.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this parse relative URLs?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Enable relative URL parsing and set a base URL to parse
                paths like /api/users?page=1.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are my URLs uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. URL parsing happens directly in your browser, and your URLs
                are not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/query-string-builder" className="yoryantra-btn-outline">
              Query String Builder
            </Link>

            <Link href="/tools/url-encoder-decoder" className="yoryantra-btn-outline">
              URL Encoder Decoder
            </Link>

            <Link href="/tools/http-request-parser" className="yoryantra-btn-outline">
              HTTP Request Parser
            </Link>

            <Link href="/tools/curl-command-parser" className="yoryantra-btn-outline">
              cURL Command Parser
            </Link>

            <Link href="/tools/redirect-checker" className="yoryantra-btn-outline">
              Redirect Checker
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>

      <div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>

      <div className="mt-1 break-words font-mono text-sm text-gray-900">
        {value}
      </div>
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
                <th key={column} className="px-4 py-3 font-semibold">
                  {column}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {rows.map((row, rowIndex) => (
              <tr key={`${title}-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={`${title}-${rowIndex}-${cellIndex}`}
                    className="px-4 py-3 font-mono text-xs text-gray-700"
                  >
                    <span className="block max-w-[520px] break-words">
                      {cell}
                    </span>
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
  const isAbsolute = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed);

  if (!isAbsolute && !options.allowRelativeUrls) {
    throw new Error("This is not an absolute URL. Enable relative URL parsing or add a protocol.");
  }

  let parsed: URL;

  try {
    parsed = isAbsolute
      ? new URL(trimmed)
      : new URL(trimmed, options.baseUrl || "https://example.com");
  } catch {
    throw new Error("This URL could not be parsed. Check the protocol, slashes, and special characters.");
  }

  const pathSegments = parsed.pathname
    .split("/")
    .map((segment) =>
      options.decodeMode === "decoded" ? safeDecode(segment) : segment
    )
    .filter(Boolean);

  const queryParams: QueryParam[] = [];

  if (options.decodeMode === "raw") {
    const rawSearch = parsed.search.startsWith("?")
      ? parsed.search.slice(1)
      : parsed.search;

    rawSearch
      .split("&")
      .filter(Boolean)
      .forEach((part) => {
        const equalsIndex = part.indexOf("=");

        if (equalsIndex === -1) {
          queryParams.push({
            key: part,
            value: "",
          });
          return;
        }

        queryParams.push({
          key: part.slice(0, equalsIndex),
          value: part.slice(equalsIndex + 1),
        });
      });
  } else {
    parsed.searchParams.forEach((value, key) => {
      queryParams.push({
        key,
        value,
      });
    });
  }

  return {
    input: trimmed,
    href: parsed.href,
    protocol: parsed.protocol,
    username: parsed.username,
    password: parsed.password,
    host: parsed.host,
    hostname: parsed.hostname,
    port: parsed.port,
    origin: parsed.origin,
    pathname:
      options.decodeMode === "decoded" ? safeDecode(parsed.pathname) : parsed.pathname,
    pathSegments,
    search: parsed.search,
    hash: parsed.hash,
    queryParams,
    queryParamCount: queryParams.length,
    isAbsolute,
    hasCredentials: Boolean(parsed.username || parsed.password),
  };
}

function getURLParts(parsed: ParsedURL, hideCredentials: boolean): URLPart[] {
  return [
    {
      label: "Full URL",
      value: sanitizeHref(parsed, hideCredentials),
    },
    {
      label: "Protocol",
      value: parsed.protocol,
    },
    {
      label: "Origin",
      value: parsed.origin,
    },
    {
      label: "Host",
      value: parsed.host,
    },
    {
      label: "Hostname",
      value: parsed.hostname,
    },
    {
      label: "Port",
      value: parsed.port,
    },
    {
      label: "Path",
      value: parsed.pathname,
    },
    {
      label: "Query String",
      value: parsed.search,
    },
    {
      label: "Hash",
      value: parsed.hash,
    },
    {
      label: "Username",
      value: hideCredentials && parsed.username ? "[hidden]" : parsed.username,
    },
    {
      label: "Password",
      value: hideCredentials && parsed.password ? "[hidden]" : parsed.password,
    },
  ];
}

function formatParsedURL(
  parsed: ParsedURL,
  options: {
    outputMode: OutputMode;
    hideCredentials: boolean;
  }
) {
  if (options.outputMode === "json") {
    return JSON.stringify(
      {
        ...parsed,
        href: sanitizeHref(parsed, options.hideCredentials),
        username:
          options.hideCredentials && parsed.username ? "[hidden]" : parsed.username,
        password:
          options.hideCredentials && parsed.password ? "[hidden]" : parsed.password,
      },
      null,
      2
    );
  }

  if (options.outputMode === "query") {
    return parsed.queryParams
      .map((param) => `${param.key}=${param.value}`)
      .join("\n");
  }

  return [
    `Full URL: ${sanitizeHref(parsed, options.hideCredentials)}`,
    `Protocol: ${parsed.protocol}`,
    `Origin: ${parsed.origin}`,
    `Host: ${parsed.host}`,
    `Hostname: ${parsed.hostname}`,
    `Port: ${parsed.port || "(none)"}`,
    `Path: ${parsed.pathname || "/"}`,
    `Query string: ${parsed.search || "(none)"}`,
    `Hash: ${parsed.hash || "(none)"}`,
    `Query parameters: ${parsed.queryParamCount}`,
    `Path segments: ${parsed.pathSegments.length}`,
    parsed.hasCredentials ? `Credentials: ${options.hideCredentials ? "[hidden]" : "present"}` : "Credentials: none",
  ].join("\n");
}

function sanitizeHref(parsed: ParsedURL, hideCredentials: boolean) {
  if (!hideCredentials || !parsed.hasCredentials) {
    return parsed.href;
  }

  try {
    const clone = new URL(parsed.href);
    clone.username = parsed.username ? "hidden" : "";
    clone.password = parsed.password ? "hidden" : "";
    return clone.href;
  } catch {
    return parsed.href;
  }
}

function getURLNotes(parsed: ParsedURL): URLNote[] {
  const notes: URLNote[] = [];

  if (!parsed.isAbsolute) {
    notes.push({
      title: "Relative URL parsed",
      message:
        "This input was parsed as a relative URL using the base URL from the options.",
    });
  }

  if (parsed.hasCredentials) {
    notes.push({
      title: "Credentials found in URL",
      message:
        "The URL contains username or password values. Avoid sharing real credentials in URLs.",
    });
  }

  if (parsed.queryParamCount > 10) {
    notes.push({
      title: "Many query parameters",
      message:
        "This URL has many query parameters. Check tracking values, duplicate keys, and unnecessary fields.",
    });
  }

  if (parsed.href.length > 2000) {
    notes.push({
      title: "Long URL",
      message:
        "This URL is long. Some tools, browsers, and servers may have URL length limits.",
    });
  }

  if (parsed.protocol && !["http:", "https:"].includes(parsed.protocol)) {
    notes.push({
      title: "Non-HTTP protocol",
      message:
        "This URL does not use http or https. That may be fine, but check the protocol for your use case.",
    });
  }

  return notes;
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value.replace(/\+/g, " "));
  } catch {
    return value;
  }
}
