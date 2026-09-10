"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "headerBlock" | "json" | "curl" | "fetch";
type AuthType = "none" | "bearer" | "basic" | "apiKey";
type HeaderRow = {
  id: number;
  name: string;
  value: string;
  enabled: boolean;
};

type HeaderProblem = {
  severity: "error" | "warning";
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
      .filter((header) => !(skipEmptyHeaders && !header.value.trim()))
      .map((header) => ({
        ...header,
        name: header.name.trim(),
        value: header.value.trim(),
      }));

    const authHeader = buildAuthHeader({
      authType,
      authValue,
      apiKeyHeaderName,
    });

    const merged = authHeader ? [authHeader, ...manualHeaders] : manualHeaders;

    return sortHeaders
      ? [...merged].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }))
      : merged;
  }, [
    headers,
    authType,
    authValue,
    apiKeyHeaderName,
    skipEmptyHeaders,
    sortHeaders,
  ]);

  const problems = useMemo(
    () =>
      getHeaderProblems({
        sourceHeaders: headers,
        activeHeaders,
        authType,
        authValue,
        apiKeyHeaderName,
        outputMode,
        curlUrl,
        hideSensitiveValues,
      }),
    [headers, activeHeaders, authType, authValue, apiKeyHeaderName, outputMode, curlUrl, hideSensitiveValues]
  );

  const blockingProblems = problems.filter((problem) => problem.severity === "error");
  const warnings = problems.filter((problem) => problem.severity === "warning");

  const output = useMemo(
    () =>
      blockingProblems.length > 0
        ? ""
        : buildOutput({
            headers: activeHeaders,
            outputMode,
            curlUrl,
            hideSensitiveValues,
          }),
    [activeHeaders, outputMode, curlUrl, hideSensitiveValues, blockingProblems.length]
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
      description="Build request header blocks, cURL flags, JSON pairs, or Fetch headers without silently dropping duplicate fields."
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

          <button onClick={addHeader} className="yoryantra-btn-outline whitespace-nowrap">
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
                className="whitespace-nowrap rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
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
              className="whitespace-nowrap rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-[var(--green)] hover:text-[var(--green)]"
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

        <div className={`mt-4 grid gap-4 ${
          authType === "apiKey"
            ? "md:grid-cols-3"
            : authType === "none"
            ? "md:max-w-sm"
            : "md:grid-cols-2"
        }`}>
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
                {authType === "basic" ? "Credentials" : authType === "bearer" ? "Token" : "API Key"}
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

              {authType === "basic" && (
                <p className="mt-2 text-xs leading-relaxed text-gray-500">
                  Enter <code>username:password</code>. The builder Base64-encodes the exact UTF-8 bytes and keeps the <code>Basic</code> scheme visible.
                </p>
              )}
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
                label: "JSON header pairs",
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

          {outputMode === "curl" && (
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
          <label className="flex self-start cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
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

          <label className="flex self-start cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
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

          <label className="flex self-start cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
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
        <button onClick={copyOutput} className="yoryantra-btn whitespace-nowrap" disabled={!output}>
          {copied ? "Copied" : "Copy Output"}
        </button>

        <button onClick={loadExample} className="yoryantra-btn-outline whitespace-nowrap">
          Load Example
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline whitespace-nowrap">
          Reset
        </button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <SummaryCard
          label="Active Headers"
          value={activeHeaders.length.toLocaleString()}
        />
        <SummaryCard label="Output Type" value={getOutputModeLabel(outputMode)} />
        <SummaryCard label="Auth" value={getAuthTypeLabel(authType)} />
        <SummaryCard label="Length" value={output.length.toLocaleString()} />
      </div>

      {blockingProblems.length > 0 && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <h3 className="text-sm font-semibold text-red-900">Fix these header problems</h3>
          <div className="mt-3 space-y-3">
            {blockingProblems.map((problem, index) => (
              <div key={`${problem.title}-${index}`}>
                <p className="text-sm font-semibold text-red-900">{problem.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-red-700">{problem.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mt-6 self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">Header cautions</h3>
          <div className="mt-3 space-y-3">
            {warnings.map((problem, index) => (
              <div key={`${problem.title}-${index}`}>
                <p className="text-sm font-semibold text-amber-900">{problem.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-amber-800">{problem.message}</p>
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
              className="yoryantra-btn-outline text-sm whitespace-nowrap"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[280px] whitespace-pre-wrap break-words">
          {output || "Header output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Header generation runs in this browser session. The page does not send entered header values to an API.
        Masking is a sharing aid, not a guarantee that every custom secret name will be recognized.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Build Fields Without Losing Their HTTP Meaning
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            HTTP field names are case-insensitive tokens, but field values are defined by each header’s specification.
            Duplicate field names are therefore preserved instead of being silently collapsed: some fields allow repeated or list-like values, while others have stricter semantics.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            RFC 9110 defines the common field-name syntax and HTTP field model. The builder blocks invalid field names and line-breaking characters before producing output.
            See <a className="font-medium text-[var(--green)] underline underline-offset-2" href="https://www.rfc-editor.org/rfc/rfc9110" target="_blank" rel="noreferrer">RFC 9110, Section 5</a> for the HTTP field rules.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Output Formats Preserve Different Things</h2>
          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li><strong>Header block:</strong> keeps each field line in order.</li>
            <li><strong>JSON header pairs:</strong> uses an array of name/value pairs so duplicate names are not lost.</li>
            <li><strong>cURL headers:</strong> uses POSIX-shell-safe single quoting for the URL and each <code>-H</code> argument.</li>
            <li><strong>Fetch headers:</strong> emits a header-pair array, but browsers can still block or control particular request headers.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Authorization Needs More Than Formatting</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Bearer tokens are copied with the <code>Bearer</code> scheme. Basic credentials are entered as <code>username:password</code> and Base64-encoded; Base64 is reversible and provides no confidentiality.
            Send credentials only over HTTPS and follow the server’s authentication requirements.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            RFC 7617 defines HTTP Basic authentication, including charset considerations for non-ASCII credentials.
            See the <a className="font-medium text-[var(--green)] underline underline-offset-2" href="https://www.rfc-editor.org/rfc/rfc7617" target="_blank" rel="noreferrer">RFC 7617 specification</a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Browser Fetch Has Its Own Boundary</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A syntactically valid HTTP header is not automatically writable from browser JavaScript. Fetch maintains a forbidden or browser-controlled request-header set for security and protocol reasons.
            The builder flags names such as <code>Cookie</code>, <code>Host</code>, <code>Content-Length</code>, and <code>Sec-*</code> when Fetch output is selected.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The <a className="font-medium text-[var(--green)] underline underline-offset-2" href="https://fetch.spec.whatwg.org/#forbidden-request-header" target="_blank" rel="noreferrer">WHATWG Fetch specification</a> is the authoritative reference for that browser boundary.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Before Sharing a Header Set</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Authorization values, cookies, API keys, session identifiers, and custom secret headers can grant access to real systems.
            Keep masking enabled for examples, then inspect the final output because no name-based detector can recognize every organization-specific secret.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/request-header-builder" />
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
  if (authType === "none") {
    return null;
  }

  if (authType === "bearer") {
    const token = authValue.trim();
    if (!token) {
      return null;
    }
    return {
      id: -1,
      name: "Authorization",
      value: `Bearer ${token}`,
      enabled: true,
    };
  }

  if (authType === "basic") {
    if (!authValue) {
      return null;
    }
    return {
      id: -2,
      name: "Authorization",
      value: `Basic ${encodeUtf8Base64(authValue)}`,
      enabled: true,
    };
  }

  const apiKeyValue = authValue.trim();
  if (!apiKeyValue) {
    return null;
  }

  return {
    id: -3,
    name: apiKeyHeaderName.trim() || "X-API-Key",
    value: apiKeyValue,
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
        ? getSafePlaceholder(header.name, header.value)
        : header.value,
  }));
  const pairs = sanitizedHeaders.map((header) => [header.name, header.value]);

  if (outputMode === "json") {
    return JSON.stringify(pairs, null, 2);
  }

  if (outputMode === "curl") {
    const url = curlUrl.trim() || "https://api.example.com/resource";
    return [
      `curl ${quotePosixShell(url)}`,
      ...sanitizedHeaders.map(
        (header) => `  -H ${quotePosixShell(`${header.name}: ${header.value}`)}`
      ),
    ].join(" \\\n");
  }

  if (outputMode === "fetch") {
    return `headers: ${JSON.stringify(pairs, null, 2)}`;
  }

  return sanitizedHeaders
    .map((header) => `${header.name}: ${header.value}`)
    .join("\n");
}

function getHeaderProblems({
  sourceHeaders,
  activeHeaders,
  authType,
  authValue,
  apiKeyHeaderName,
  outputMode,
  curlUrl,
  hideSensitiveValues,
}: {
  sourceHeaders: HeaderRow[];
  activeHeaders: HeaderRow[];
  authType: AuthType;
  authValue: string;
  apiKeyHeaderName: string;
  outputMode: OutputMode;
  curlUrl: string;
  hideSensitiveValues: boolean;
}): HeaderProblem[] {
  const problems: HeaderProblem[] = [];
  const enabledRows = sourceHeaders.filter((header) => header.enabled && header.name.trim());

  enabledRows.forEach((header, index) => {
    const name = header.name.trim();
    if (!isHttpFieldName(name)) {
      problems.push({
        severity: "error",
        title: `Invalid header name in row ${index + 1}`,
        message: `“${name}” is not a valid HTTP field-name token. Remove spaces, colons, and other disallowed characters.`,
      });
    }

    if (/[\r\n\0]/.test(header.value)) {
      problems.push({
        severity: "error",
        title: `Unsafe header value in row ${index + 1}`,
        message: "Header values cannot contain carriage returns, line feeds, or NUL characters in this builder.",
      });
    }
  });

  if (authValue && /[\r\n\0]/.test(authValue)) {
    problems.push({
      severity: "error",
      title: "Auth value contains control characters",
      message: "Authorization and API key values cannot contain carriage returns, line feeds, or NUL characters in this builder.",
    });
  }

  if (authType === "bearer" && authValue.trim() && /\s/.test(authValue.trim())) {
    problems.push({
      severity: "error",
      title: "Bearer token contains whitespace",
      message: "Bearer token credentials cannot contain spaces or line breaks. Paste only the token value, without the Bearer prefix.",
    });
  }

  if (authType === "apiKey" && authValue.trim() && !isHttpFieldName(apiKeyHeaderName.trim())) {
    problems.push({
      severity: "error",
      title: "Invalid API key header name",
      message: "The API key header name must use valid HTTP field-name characters.",
    });
  }

  if (authType === "basic" && authValue && !authValue.includes(":")) {
    problems.push({
      severity: "error",
      title: "Basic credentials need a colon",
      message: "Enter Basic credentials as username:password so the credential pair can be encoded correctly.",
    });
  }

  const autoAuthName = authType === "bearer" || authType === "basic"
    ? "authorization"
    : authType === "apiKey" && authValue
      ? apiKeyHeaderName.trim().toLowerCase()
      : "";

  if (autoAuthName && enabledRows.some((header) => header.name.trim().toLowerCase() === autoAuthName)) {
    problems.push({
      severity: "error",
      title: "Auth header is defined twice",
      message: "Remove the matching manual header or set Auth Type to None. The builder will not guess which credential should win.",
    });
  }

  const counts = new Map<string, number>();
  activeHeaders.forEach((header) => {
    const name = header.name.toLowerCase();
    counts.set(name, (counts.get(name) || 0) + 1);
  });
  const duplicateNames = [...counts.entries()].filter(([, count]) => count > 1).map(([name]) => name);

  if (duplicateNames.length > 0) {
    problems.push({
      severity: "warning",
      title: "Duplicate field names preserved",
      message: `Repeated fields (${duplicateNames.join(", ")}) are kept as separate lines/pairs. Confirm that each field's specification allows that form.`,
    });
  }

  if (activeHeaders.some((header) => isSensitiveHeader(header.name))) {
    problems.push({
      severity: "warning",
      title: "Credential-like headers present",
      message: hideSensitiveValues
        ? "Sensitive-looking values will be replaced with placeholders in generated output. Review custom header names before sharing."
        : "Sensitive-looking values are currently included in generated output. Avoid copying real credentials into tickets, chat, or public documentation.",
    });
  }

  if (authType === "basic" && authValue) {
    problems.push({
      severity: "warning",
      title: "Basic authentication is reversible",
      message: "Base64 is an encoding, not encryption. Use HTTPS, and check the server's charset expectations for non-ASCII credentials.",
    });
  }

  if (outputMode === "fetch") {
    const blocked = activeHeaders
      .map((header) => header.name)
      .filter(isBrowserControlledRequestHeader);

    if (blocked.length > 0) {
      problems.push({
        severity: "warning",
        title: "Browser-controlled Fetch headers",
        message: `Browser Fetch may reject or control: ${Array.from(new Set(blocked)).join(", ")}. A valid HTTP field is not necessarily writable from browser JavaScript.`,
      });
    }

    if (activeHeaders.some((header) => header.name.toLowerCase() === "user-agent")) {
      problems.push({
        severity: "warning",
        title: "User-Agent can be browser-controlled",
        message: "User-Agent is no longer on the Fetch forbidden-name list, but browsers can still manage or alter it. Do not assume a custom value will be sent unchanged.",
      });
    }
  }

  if (outputMode === "curl" && curlUrl.trim()) {
    try {
      const parsed = new URL(curlUrl.trim());
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        problems.push({
          severity: "error",
          title: "Unsupported request URL scheme",
          message: "For this HTTP header builder, the cURL request URL must use http:// or https://.",
        });
      }

      if (
        parsed.protocol === "http:" &&
        !hideSensitiveValues &&
        activeHeaders.some((header) => isSensitiveHeader(header.name))
      ) {
        problems.push({
          severity: "warning",
          title: "Credentials over plain HTTP",
          message: "The cURL URL uses HTTP while credential-like values are unmasked. Use HTTPS for real authentication data.",
        });
      }
    } catch {
      problems.push({
        severity: "error",
        title: "Invalid cURL request URL",
        message: "Enter an absolute http:// or https:// URL, or leave the field blank to keep the example URL.",
      });
    }
  }

  return problems;
}

function getOutputModeLabel(mode: OutputMode) {
  if (mode === "headerBlock") return "Header block";
  if (mode === "json") return "JSON pairs";
  if (mode === "curl") return "cURL headers";
  return "Fetch headers";
}

function getAuthTypeLabel(type: AuthType) {
  if (type === "none") return "None";
  if (type === "bearer") return "Bearer";
  if (type === "basic") return "Basic";
  return "API key";
}

function isHttpFieldName(value: string) {
  return /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(value);
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

function getSafePlaceholder(headerName: string, currentValue: string) {
  const normalized = headerName.toLowerCase();

  if (normalized === "authorization") {
    if (/^basic\s/i.test(currentValue)) {
      return "Basic BASE64_CREDENTIALS";
    }
    if (/^bearer\s/i.test(currentValue)) {
      return "Bearer YOUR_TOKEN";
    }
    return "YOUR_AUTHORIZATION_VALUE";
  }

  if (normalized === "cookie") {
    return "session_id=YOUR_SESSION";
  }

  if (normalized.includes("api")) {
    return "YOUR_API_KEY";
  }

  return "YOUR_VALUE";
}

function isBrowserControlledRequestHeader(name: string) {
  const normalized = name.toLowerCase();
  const exact = new Set([
    "accept-charset",
    "accept-encoding",
    "access-control-request-headers",
    "access-control-request-method",
    "connection",
    "content-length",
    "cookie",
    "cookie2",
    "date",
    "dnt",
    "expect",
    "host",
    "keep-alive",
    "origin",
    "permissions-policy",
    "referer",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    "via",
  ]);

  return exact.has(normalized) || normalized.startsWith("proxy-") || normalized.startsWith("sec-");
}

function encodeUtf8Base64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function quotePosixShell(value: string) {
  return `'${value.replace(/'/g, `'"'"'`)}'`;
}

