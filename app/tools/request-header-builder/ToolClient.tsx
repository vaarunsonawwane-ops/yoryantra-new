"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "headerBlock" | "json" | "curl" | "fetch";
type AuthType = "none" | "bearer" | "basic" | "apiKey";
type HeaderRow = {
  id: number;
  name: string;
  value: string;
  enabled: boolean;
};

type HeaderNote = {
  title: string;
  message: string;
};

const commonHeaders = [
  {
    name: "Accept",
    value: "application/json",
  },
  {
    name: "Content-Type",
    value: "application/json",
  },
  {
    name: "User-Agent",
    value: "Yoryantra-Test-Client/1.0",
  },
  {
    name: "Cache-Control",
    value: "no-cache",
  },
  {
    name: "X-Request-ID",
    value: "req_12345",
  },
];

export default function ToolClient() {
  const [headers, setHeaders] = useState<HeaderRow[]>([
    {
      id: 1,
      name: "",
      value: "",
      enabled: true,
    },
  ]);
  const [outputMode, setOutputMode] = useState<OutputMode>("headerBlock");
  const [authType, setAuthType] = useState<AuthType>("none");
  const [authValue, setAuthValue] = useState("");
  const [apiKeyHeaderName, setApiKeyHeaderName] = useState("X-API-Key");
  const [curlUrl, setCurlUrl] = useState("");
  const [hideSensitiveValues, setHideSensitiveValues] = useState(true);
  const [sortHeaders, setSortHeaders] = useState(false);
  const [skipEmptyHeaders, setSkipEmptyHeaders] = useState(true);
  const [copied, setCopied] = useState(false);

  const activeHeaders = useMemo(() => {
    const manualHeaders = headers
      .filter((header) => header.enabled)
      .filter((header) => header.name.trim())
      .filter((header) => !(skipEmptyHeaders && !header.value.trim()));

    const authHeader = buildAuthHeader({
      authType,
      authValue,
      apiKeyHeaderName,
    });

    const merged = authHeader ? [authHeader, ...manualHeaders] : manualHeaders;
    const deduped = dedupeHeaders(merged);

    return sortHeaders
      ? [...deduped].sort((a, b) => a.name.localeCompare(b.name))
      : deduped;
  }, [
    headers,
    authType,
    authValue,
    apiKeyHeaderName,
    skipEmptyHeaders,
    sortHeaders,
  ]);

  const output = useMemo(
    () =>
      buildOutput({
        headers: activeHeaders,
        outputMode,
        curlUrl,
        hideSensitiveValues,
      }),
    [activeHeaders, outputMode, curlUrl, hideSensitiveValues]
  );

  const notes = useMemo(
    () =>
      getHeaderNotes({
        headers: activeHeaders,
        authType,
        curlUrl,
      }),
    [activeHeaders, authType, curlUrl]
  );

  const addHeader = () => {
    setHeaders((current) => [
      ...current,
      {
        id: Date.now(),
        name: "",
        value: "",
        enabled: true,
      },
    ]);
    setCopied(false);
  };

  const addCommonHeader = (name: string, value: string) => {
    setHeaders((current) => [
      ...current,
      {
        id: Date.now(),
        name,
        value,
        enabled: true,
      },
    ]);
    setCopied(false);
  };

  const updateHeader = (
    id: number,
    field: keyof Omit<HeaderRow, "id">,
    value: string | boolean
  ) => {
    setHeaders((current) =>
      current.map((header) =>
        header.id === id
          ? {
              ...header,
              [field]: value,
            }
          : header
      )
    );
    setCopied(false);
  };

  const removeHeader = (id: number) => {
    setHeaders((current) => {
      const next = current.filter((header) => header.id !== id);

      return next.length > 0
        ? next
        : [
            {
              id: Date.now(),
              name: "",
              value: "",
              enabled: true,
            },
          ];
    });
    setCopied(false);
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
    setHeaders([
      {
        id: 1,
        name: "Accept",
        value: "application/json",
        enabled: true,
      },
      {
        id: 2,
        name: "Content-Type",
        value: "application/json",
        enabled: true,
      },
      {
        id: 3,
        name: "X-Request-ID",
        value: "req_12345",
        enabled: true,
      },
    ]);
    setOutputMode("headerBlock");
    setAuthType("bearer");
    setAuthValue("example-token");
    setApiKeyHeaderName("X-API-Key");
    setCurlUrl("https://api.example.com/resource");
    setHideSensitiveValues(true);
    setSortHeaders(false);
    setSkipEmptyHeaders(true);
    setCopied(false);
  };

  const resetAll = () => {
    setHeaders([
      {
        id: 1,
        name: "",
        value: "",
        enabled: true,
      },
    ]);
    setOutputMode("headerBlock");
    setAuthType("none");
    setAuthValue("");
    setApiKeyHeaderName("X-API-Key");
    setCurlUrl("");
    setHideSensitiveValues(true);
    setSortHeaders(false);
    setSkipEmptyHeaders(true);
    setCopied(false);
  };

  return (
    <ToolShell
      title="Request Header Builder"
      description="Build HTTP request headers, add common API headers, format header blocks, and copy clean header output directly in your browser."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Header Rows
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Add request headers as normal name and value pairs.
            </p>
          </div>

          <button onClick={addHeader} className="yoryantra-btn-outline">
            Add Header
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {headers.map((header, index) => (
            <div
              key={header.id}
              className="grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 md:grid-cols-[auto_1fr_1fr_auto]"
            >
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={header.enabled}
                  onChange={(event) =>
                    updateHeader(header.id, "enabled", event.target.checked)
                  }
                  className="h-4 w-4 accent-[var(--light-gold)]"
                />

                <span>{index + 1}</span>
              </label>

              <input
                value={header.name}
                onChange={(event) =>
                  updateHeader(header.id, "name", event.target.value)
                }
                placeholder="Header name"
                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />

              <input
                value={header.value}
                onChange={(event) =>
                  updateHeader(header.id, "value", event.target.value)
                }
                placeholder="Header value"
                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />

              <button
                onClick={() => removeHeader(header.id)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Common Headers
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Add common headers quickly, then edit the values if needed.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          {commonHeaders.map((header) => (
            <button
              key={header.name}
              onClick={() => addCommonHeader(header.name, header.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-[var(--green)] hover:text-[var(--green)]"
            >
              {header.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Auth Header
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <YoryantraSelect
            label="Auth Type"
            value={authType}
            onChange={(value) => {
              setAuthType(value as AuthType);
              setCopied(false);
            }}
            options={[
              {
                label: "None",
                value: "none",
              },
              {
                label: "Bearer token",
                value: "bearer",
              },
              {
                label: "Basic auth",
                value: "basic",
              },
              {
                label: "API key header",
                value: "apiKey",
              },
            ]}
          />

          {authType === "apiKey" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                API Key Header
              </label>

              <input
                value={apiKeyHeaderName}
                onChange={(event) => {
                  setApiKeyHeaderName(event.target.value);
                  setCopied(false);
                }}
                placeholder="X-API-Key"
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />
            </div>
          )}

          {authType !== "none" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Auth Value
              </label>

              <input
                value={authValue}
                onChange={(event) => {
                  setAuthValue(event.target.value);
                  setCopied(false);
                }}
                placeholder={
                  authType === "basic"
                    ? "username:password"
                    : authType === "apiKey"
                    ? "your-api-key"
                    : "your-token"
                }
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Output Options
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value) => {
              setOutputMode(value as OutputMode);
              setCopied(false);
            }}
            options={[
              {
                label: "Header block",
                value: "headerBlock",
              },
              {
                label: "JSON object",
                value: "json",
              },
              {
                label: "cURL headers",
                value: "curl",
              },
              {
                label: "Fetch headers",
                value: "fetch",
              },
            ]}
          />

          {(outputMode === "curl" || outputMode === "fetch") && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Request URL
              </label>

              <input
                value={curlUrl}
                onChange={(event) => {
                  setCurlUrl(event.target.value);
                  setCopied(false);
                }}
                placeholder="https://api.example.com/resource"
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={hideSensitiveValues}
              onChange={(event) => {
                setHideSensitiveValues(event.target.checked);
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Hide sensitive values
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Replace Authorization, Cookie, API key, and token-like values
                with placeholders.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={skipEmptyHeaders}
              onChange={(event) => {
                setSkipEmptyHeaders(event.target.checked);
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Skip empty values
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Leave out headers with no value.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={sortHeaders}
              onChange={(event) => {
                setSortHeaders(event.target.checked);
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Sort headers
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Sort output alphabetically by header name.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={copyOutput} className="yoryantra-btn" disabled={!output}>
          {copied ? "Copied" : "Copy Output"}
        </button>

        <button onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <SummaryCard
          label="Active Headers"
          value={activeHeaders.length.toLocaleString()}
        />
        <SummaryCard label="Output Type" value={outputMode} />
        <SummaryCard label="Auth" value={authType} />
        <SummaryCard label="Length" value={output.length.toLocaleString()} />
      </div>

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Header notes
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
            Header Output
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
          {output || "Header output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Header building happens directly in your browser. The headers you enter
        are not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Building HTTP Request Headers for API Testing
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Request headers tell an API what kind of response you want, how the
            request body is formatted, how authentication should work, and how a
            client identifies itself. They are easy to mistype when you are
            building requests by hand.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Request Header Builder helps you create clean header blocks for
            API testing, cURL commands, fetch snippets, support notes, and
            documentation. Add common headers, choose an auth header, hide
            sensitive values, and copy the output in the format you need.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Creating Headers Without Rewriting the Same Lines
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Add header names and values in the rows above.</li>
            <li>Use common header buttons for Accept, Content-Type, and more.</li>
            <li>Add Bearer, Basic, or API key auth when needed.</li>
            <li>Choose header block, JSON, cURL, or fetch output.</li>
            <li>Copy the output and review sensitive values before sharing.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Request Header Builder Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Building headers for API debugging and endpoint testing.</li>
            <li>Preparing Authorization and Content-Type headers quickly.</li>
            <li>Creating cURL header flags from normal key-value rows.</li>
            <li>Writing fetch headers for JavaScript examples.</li>
            <li>Replacing real API keys and tokens before sharing snippets.</li>
            <li>Documenting request headers in support notes or API docs.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Headers
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Accept: application/json
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN
X-Request-ID: req_12345`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Be Careful With Auth and Cookie Headers
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Headers often contain tokens, API keys, cookies, session IDs, and
            other values that should not be shared publicly. The tool hides
            sensitive-looking values by default in copied output.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Before pasting headers into a ticket, chat message, or documentation,
            replace real secrets with safe placeholder values.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is a request header builder?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It helps you create HTTP request headers from key-value rows and
                copy them as a header block, JSON object, cURL flags, or fetch
                headers.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I build Authorization headers?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. You can create Bearer token, Basic auth, or API key headers
                from the auth section.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this generate cURL headers?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Choose cURL headers output to get -H lines that can be used
                in a cURL command.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why are some values hidden?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Authorization, Cookie, API key, and token-like headers can
                contain secrets. They are hidden by default so copied output is
                safer to share.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are my headers uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Header building happens directly in your browser, and your
                header values are not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/http-request-parser" className="yoryantra-btn-outline">
              HTTP Request Parser
            </Link>

            <Link href="/tools/curl-command-builder" className="yoryantra-btn-outline">
              cURL Command Builder
            </Link>

            <Link href="/tools/curl-command-parser" className="yoryantra-btn-outline">
              cURL Command Parser
            </Link>

            <Link href="/tools/query-string-builder" className="yoryantra-btn-outline">
              Query String Builder
            </Link>

            <Link href="/tools/security-headers-checker" className="yoryantra-btn-outline">
              Security Headers Checker
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

function buildAuthHeader({
  authType,
  authValue,
  apiKeyHeaderName,
}: {
  authType: AuthType;
  authValue: string;
  apiKeyHeaderName: string;
}): HeaderRow | null {
  if (authType === "none" || !authValue.trim()) {
    return null;
  }

  if (authType === "bearer") {
    return {
      id: -1,
      name: "Authorization",
      value: `Bearer ${authValue.trim()}`,
      enabled: true,
    };
  }

  if (authType === "basic") {
    return {
      id: -2,
      name: "Authorization",
      value: `Basic ${authValue.trim()}`,
      enabled: true,
    };
  }

  return {
    id: -3,
    name: apiKeyHeaderName.trim() || "X-API-Key",
    value: authValue.trim(),
    enabled: true,
  };
}

function buildOutput({
  headers,
  outputMode,
  curlUrl,
  hideSensitiveValues,
}: {
  headers: HeaderRow[];
  outputMode: OutputMode;
  curlUrl: string;
  hideSensitiveValues: boolean;
}) {
  if (headers.length === 0) {
    return "";
  }

  const sanitizedHeaders = headers.map((header) => ({
    ...header,
    value:
      hideSensitiveValues && isSensitiveHeader(header.name)
        ? getSafePlaceholder(header.name)
        : header.value,
  }));

  if (outputMode === "json") {
    return JSON.stringify(
      sanitizedHeaders.reduce<Record<string, string>>((acc, header) => {
        acc[header.name] = header.value;
        return acc;
      }, {}),
      null,
      2
    );
  }

  if (outputMode === "curl") {
    const url = curlUrl.trim() || "https://api.example.com/resource";
    return [
      `curl "${url}"`,
      ...sanitizedHeaders.map(
        (header) => `  -H "${escapeForDoubleQuotes(`${header.name}: ${header.value}`)}"`
      ),
    ].join(" \\\n");
  }

  if (outputMode === "fetch") {
    return `headers: ${JSON.stringify(
      sanitizedHeaders.reduce<Record<string, string>>((acc, header) => {
        acc[header.name] = header.value;
        return acc;
      }, {}),
      null,
      2
    )}`;
  }

  return sanitizedHeaders
    .map((header) => `${header.name}: ${header.value}`)
    .join("\n");
}

function dedupeHeaders(headers: HeaderRow[]) {
  const seen = new Set<string>();
  const result: HeaderRow[] = [];

  headers.forEach((header) => {
    const normalized = header.name.trim().toLowerCase();

    if (!normalized) {
      return;
    }

    if (!seen.has(normalized)) {
      result.push({
        ...header,
        name: header.name.trim(),
        value: header.value.trim(),
      });
      seen.add(normalized);
    }
  });

  return result;
}

function getHeaderNotes({
  headers,
  authType,
  curlUrl,
}: {
  headers: HeaderRow[];
  authType: AuthType;
  curlUrl: string;
}): HeaderNote[] {
  const notes: HeaderNote[] = [];

  if (headers.some((header) => isSensitiveHeader(header.name))) {
    notes.push({
      title: "Sensitive headers found",
      message:
        "Some headers may contain tokens, cookies, API keys, or session values. Keep placeholders if you plan to share the output.",
    });
  }

  const hasContentType = headers.some(
    (header) => header.name.toLowerCase() === "content-type"
  );

  if (!hasContentType) {
    notes.push({
      title: "No Content-Type header",
      message:
        "If your request has a body, add a Content-Type header so the server knows how to read it.",
    });
  }

  const hasAccept = headers.some(
    (header) => header.name.toLowerCase() === "accept"
  );

  if (!hasAccept) {
    notes.push({
      title: "No Accept header",
      message:
        "Some APIs respond differently when an Accept header is missing.",
    });
  }

  if (authType === "basic") {
    notes.push({
      title: "Basic auth value",
      message:
        "Basic auth normally uses a base64 encoded username:password value. Check what your API expects before using it.",
    });
  }

  if (curlUrl && !/^https?:\/\//i.test(curlUrl.trim())) {
    notes.push({
      title: "Request URL has no protocol",
      message:
        "The request URL does not start with http:// or https://. That may be fine for a relative URL, but check it before running the cURL output.",
    });
  }

  return notes;
}

function isSensitiveHeader(name: string) {
  const normalized = name.toLowerCase();

  return (
    normalized === "authorization" ||
    normalized === "cookie" ||
    normalized === "set-cookie" ||
    normalized.includes("token") ||
    normalized.includes("secret") ||
    normalized.includes("api-key") ||
    normalized.includes("apikey") ||
    normalized.includes("x-api-key")
  );
}

function getSafePlaceholder(headerName: string) {
  const normalized = headerName.toLowerCase();

  if (normalized === "authorization") {
    return "Bearer YOUR_TOKEN";
  }

  if (normalized === "cookie") {
    return "session_id=YOUR_SESSION";
  }

  if (normalized.includes("api")) {
    return "YOUR_API_KEY";
  }

  return "YOUR_VALUE";
}

function escapeForDoubleQuotes(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
