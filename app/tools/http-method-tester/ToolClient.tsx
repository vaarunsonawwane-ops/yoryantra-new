"use client";

import { useMemo, useState, type ReactNode } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
type OutputMode = "summary" | "curl" | "fetch" | "markdown" | "json" | "checklist";
type BodyMode = "none" | "json" | "form" | "text";
type AuthMode = "none" | "bearer" | "basic" | "apiKey";
type SafetyLevel = "reference" | "safeExample" | "destructiveReview";

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type HeaderRow = {
  name: string;
  value: string;
};

type Result = {
  output: string;
  issues: Issue[];
  headers: HeaderRow[];
  inputLength: number;
  method: HttpMethod;
  methodPurpose: string;
  bodyAllowed: boolean;
  cacheNote: string;
  idempotencyNote: string;
  outputLength: number;
};

const sampleUrl = "https://api.example.com/v1/tools/123";
const sampleBody = `{
  "title": "JSON Formatter",
  "category": "Developer Tools",
  "enabled": true
}`;

export default function ToolClient() {
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [bodyMode, setBodyMode] = useState<BodyMode>("none");
  const [authMode, setAuthMode] = useState<AuthMode>("none");
  const [safetyLevel, setSafetyLevel] = useState<SafetyLevel>("safeExample");
  const [requestBody, setRequestBody] = useState("");
  const [customHeaders, setCustomHeaders] = useState("");
  const [includeContentType, setIncludeContentType] = useState(true);
  const [includeAcceptHeader, setIncludeAcceptHeader] = useState(true);
  const [includeAuthPlaceholder, setIncludeAuthPlaceholder] = useState(false);
  const [includeRequestBody, setIncludeRequestBody] = useState(true);
  const [prettyPrintBody, setPrettyPrintBody] = useState(true);
  const [warnDestructiveMethods, setWarnDestructiveMethods] = useState(true);
  const [warnBodyMismatch, setWarnBodyMismatch] = useState(true);
  const [warnCachingBehavior, setWarnCachingBehavior] = useState(true);
  const [warnCorsPreflight, setWarnCorsPreflight] = useState(true);
  const [result, setResult] = useState<Result | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getNotes(result) : []), [result]);

  const clearResult = () => {
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const processMethod = () => {
    if (!url.trim()) {
      setError("Please enter an endpoint URL or path to build the method check.");
      setResult(null);
      setOutput("");
      return;
    }

    const next = buildResult({
      url,
      method,
      outputMode,
      bodyMode,
      authMode,
      safetyLevel,
      requestBody,
      customHeaders,
      includeContentType,
      includeAcceptHeader,
      includeAuthPlaceholder,
      includeRequestBody,
      prettyPrintBody,
      warnDestructiveMethods,
      warnBodyMismatch,
      warnCachingBehavior,
      warnCorsPreflight,
    });

    if (next.output.startsWith("__ERROR__:")) {
      setError(next.output.replace("__ERROR__:", ""));
      setResult(next);
      setOutput("");
      setCopied(false);
      return;
    }

    setResult(next);
    setOutput(next.output);
    setError("");
    setCopied(false);
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const loadExample = () => {
    setUrl(sampleUrl);
    setMethod("PATCH");
    setOutputMode("curl");
    setBodyMode("json");
    setAuthMode("bearer");
    setSafetyLevel("safeExample");
    setRequestBody(sampleBody);
    setCustomHeaders("X-Request-ID: example-request-id");
    setIncludeContentType(true);
    setIncludeAcceptHeader(true);
    setIncludeAuthPlaceholder(true);
    setIncludeRequestBody(true);
    setPrettyPrintBody(true);
    setWarnDestructiveMethods(true);
    setWarnBodyMismatch(true);
    setWarnCachingBehavior(true);
    setWarnCorsPreflight(true);
    clearResult();
  };

  const resetAll = () => {
    setUrl("");
    setMethod("GET");
    setOutputMode("summary");
    setBodyMode("none");
    setAuthMode("none");
    setSafetyLevel("safeExample");
    setRequestBody("");
    setCustomHeaders("");
    setIncludeContentType(true);
    setIncludeAcceptHeader(true);
    setIncludeAuthPlaceholder(false);
    setIncludeRequestBody(true);
    setPrettyPrintBody(true);
    setWarnDestructiveMethods(true);
    setWarnBodyMismatch(true);
    setWarnCachingBehavior(true);
    setWarnCorsPreflight(true);
    clearResult();
  };

  return (
    <ToolShell
      title="HTTP Method Tester"
      description="Check HTTP method behavior, review REST usage, and generate safe cURL or fetch examples for GET, POST, PUT, PATCH, DELETE, HEAD, and OPTIONS without sending requests."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900">Endpoint URL or Path</label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Enter an API endpoint, route, or example URL. This tool builds examples and checks method behavior locally; it does not send the request.
            </p>
          </div>

          <input
            value={url}
            onChange={(event) => {
              setUrl(event.target.value);
              clearResult();
            }}
            placeholder="https://api.example.com/v1/tools/123"
            className="w-full min-h-[52px] rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-900">Request Body</label>
            <textarea
              value={requestBody}
              onChange={(event) => {
                setRequestBody(event.target.value);
                clearResult();
              }}
              placeholder={sampleBody}
              spellCheck={false}
              className="mt-2 w-full min-h-[240px] rounded-xl border border-gray-300 p-4 text-sm leading-6 font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-900">Custom Headers</label>
            <textarea
              value={customHeaders}
              onChange={(event) => {
                setCustomHeaders(event.target.value);
                clearResult();
              }}
              placeholder={"Accept: application/json\nX-Request-ID: example-request-id"}
              spellCheck={false}
              className="mt-2 w-full min-h-[130px] rounded-xl border border-gray-300 p-4 text-sm leading-6 font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Method Settings</h3>

          <div className="mt-4 space-y-4">
            <YoryantraSelect
              label="HTTP Method"
              value={method}
              onChange={(value) => {
                const next = value as HttpMethod;
                setMethod(next);
                if ((next === "GET" || next === "HEAD" || next === "OPTIONS") && bodyMode !== "none") {
                  setBodyMode("none");
                }
                clearResult();
              }}
              options={[
                { label: "GET - read a resource", value: "GET" },
                { label: "POST - create or submit", value: "POST" },
                { label: "PUT - replace a resource", value: "PUT" },
                { label: "PATCH - partially update", value: "PATCH" },
                { label: "DELETE - remove a resource", value: "DELETE" },
                { label: "HEAD - headers only", value: "HEAD" },
                { label: "OPTIONS - allowed methods", value: "OPTIONS" },
              ]}
            />

            <YoryantraSelect
              label="Output"
              value={outputMode}
              onChange={(value) => {
                setOutputMode(value as OutputMode);
                clearResult();
              }}
              options={[
                { label: "Method summary", value: "summary" },
                { label: "cURL command", value: "curl" },
                { label: "fetch snippet", value: "fetch" },
                { label: "Markdown report", value: "markdown" },
                { label: "JSON report", value: "json" },
                { label: "Review checklist", value: "checklist" },
              ]}
            />

            <YoryantraSelect
              label="Body Type"
              value={bodyMode}
              onChange={(value) => {
                setBodyMode(value as BodyMode);
                clearResult();
              }}
              options={[
                { label: "No request body", value: "none" },
                { label: "JSON body", value: "json" },
                { label: "Form URL encoded", value: "form" },
                { label: "Plain text body", value: "text" },
              ]}
            />

            <YoryantraSelect
              label="Auth Example"
              value={authMode}
              onChange={(value) => {
                setAuthMode(value as AuthMode);
                clearResult();
              }}
              options={[
                { label: "No auth header", value: "none" },
                { label: "Bearer token placeholder", value: "bearer" },
                { label: "Basic auth placeholder", value: "basic" },
                { label: "API key header placeholder", value: "apiKey" },
              ]}
            />

            <YoryantraSelect
              label="Safety Review"
              value={safetyLevel}
              onChange={(value) => {
                setSafetyLevel(value as SafetyLevel);
                clearResult();
              }}
              options={[
                { label: "Reference only", value: "reference" },
                { label: "Safe example review", value: "safeExample" },
                { label: "Destructive method review", value: "destructiveReview" },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>
        <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
          <Toggle checked={includeContentType} onChange={setIncludeContentType} label="Include Content-Type header when body is used" />
          <Toggle checked={includeAcceptHeader} onChange={setIncludeAcceptHeader} label="Include Accept: application/json" />
          <Toggle checked={includeAuthPlaceholder} onChange={setIncludeAuthPlaceholder} label="Include auth placeholder header" />
          <Toggle checked={includeRequestBody} onChange={setIncludeRequestBody} label="Include request body in generated snippets" />
          <Toggle checked={prettyPrintBody} onChange={setPrettyPrintBody} label="Pretty print JSON body when possible" />
          <Toggle checked={warnDestructiveMethods} onChange={setWarnDestructiveMethods} label="Warn about destructive methods" />
          <Toggle checked={warnBodyMismatch} onChange={setWarnBodyMismatch} label="Warn when method and body do not match" />
          <Toggle checked={warnCachingBehavior} onChange={setWarnCachingBehavior} label="Warn about caching and idempotency behavior" />
          <Toggle checked={warnCorsPreflight} onChange={setWarnCorsPreflight} label="Warn when request may trigger CORS preflight" />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-gray-500">
          These options keep request examples safe and readable while helping you review method intent, headers, body usage, CORS, and idempotency.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={processMethod}
          className="rounded-xl bg-[var(--green)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Check HTTP Method
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="rounded-xl border border-[var(--green)] px-5 py-3 text-sm font-semibold text-[var(--green)] transition hover:bg-green-50"
        >
          Load Example
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
        >
          Reset
        </button>
      </div>

      {error ? <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      {result ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Output</h3>
                <p className="mt-1 text-sm text-gray-500">Method review, cURL command, fetch snippet, or report output.</p>
              </div>
              <button
                type="button"
                onClick={copyOutput}
                disabled={!output}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copied ? "Copied" : "Copy Output"}
              </button>
            </div>

            <pre className="mt-4 max-h-[520px] overflow-auto rounded-xl bg-gray-950 p-4 text-sm leading-6 text-gray-100 whitespace-pre-wrap break-words">
              {output}
            </pre>
          </div>

          <div className="space-y-4">
            <StatCard label="Method" value={result.method} />
            <StatCard label="Body allowed" value={result.bodyAllowed ? "usually yes" : "usually no"} />
            <StatCard label="Purpose" value={result.methodPurpose} />
            <StatCard label="Output size" value={`${result.outputLength.toLocaleString()} chars`} />
          </div>
        </div>
      ) : null}

      {notes.length ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Review Notes</h3>
          <div className="mt-4 space-y-3">
            {notes.map((note) => (
              <div key={`${note.title}-${note.message}`} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">{note.title}</p>
                <p className="mt-1 text-sm leading-6 text-gray-600">{note.message}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {result?.headers.length ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Header Preview</h3>
          <p className="mt-1 text-sm text-gray-500">Headers included in the generated method example.</p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Header</th>
                  <th className="px-4 py-3 font-semibold">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {result.headers.map((header) => (
                  <tr key={`${header.name}-${header.value}`}>
                    <td className="px-4 py-3 font-mono">{header.name}</td>
                    <td className="px-4 py-3 break-words font-mono">{header.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Checking HTTP Method Choices Before Building Requests</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            HTTP methods describe the intent of a request. GET is usually for reading, POST is often for creating or submitting, PUT replaces, PATCH updates part of a resource, and DELETE removes. Choosing the wrong method can lead to confusing API behavior, caching problems, or unsafe examples.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This tool helps review method intent and generate safe request examples. It does not call the endpoint, so you can use it while writing documentation, debugging API clients, or preparing examples without accidentally sending a request.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">When This HTTP Method Tester Helps</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p>Checking whether an API example should use GET, POST, PUT, PATCH, DELETE, HEAD, or OPTIONS.</p>
            <p className="mt-2">Generating cURL or fetch snippets for docs, test notes, code examples, or issue reports.</p>
            <p className="mt-2">Reviewing whether a request body, Content-Type header, or auth placeholder belongs in the example.</p>
            <p className="mt-2">Spotting risky method choices before writing scripts that could modify or delete resources.</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">How to Use the HTTP Method Tester</h2>
          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter an endpoint URL or API path.</li>
            <li>Select the HTTP method and choose whether the request should include a body.</li>
            <li>Add optional headers, auth placeholders, and request body text.</li>
            <li>Choose a summary, cURL command, fetch snippet, Markdown report, JSON report, or checklist output.</li>
            <li>Review warnings about destructive methods, body mismatch, caching, and CORS behavior before copying.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example Generated cURL Request</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">{`curl -X PATCH "https://api.example.com/v1/tools/123" \\
  -H "Accept: application/json" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  --data '{"title":"JSON Formatter"}'`}</pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">This Tool Does Not Send HTTP Requests</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool is intentionally local-only. It builds request examples and method reviews, but it does not contact endpoints, bypass CORS, verify authentication, or test live server responses. Use it to prepare request examples before running them in your API client, terminal, or test environment.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
          <div className="mt-5 space-y-6">
            <Faq title="Does this HTTP method tester send the request?">
              No. It only builds and reviews request examples locally in your browser. It does not contact the endpoint.
            </Faq>
            <Faq title="Which HTTP method should I use to read data?">
              GET is normally used for reading resources. HEAD can be used when you only need response headers.
            </Faq>
            <Faq title="What is the difference between PUT and PATCH?">
              PUT usually replaces the target resource, while PATCH usually updates only part of it. The exact behavior still depends on the API.
            </Faq>
            <Faq title="Why does the tool warn about DELETE or PATCH?">
              Those methods can modify or remove data. The warning is a reminder to review examples carefully before running generated commands.
            </Faq>
            <Faq title="Is anything uploaded while using this tool?">
              No. Endpoint text, headers, and request bodies stay in your browser.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/http-method-tester" />
        </div>
      </section>
    </ToolShell>
  );
}

function buildResult(options: {
  url: string;
  method: HttpMethod;
  outputMode: OutputMode;
  bodyMode: BodyMode;
  authMode: AuthMode;
  safetyLevel: SafetyLevel;
  requestBody: string;
  customHeaders: string;
  includeContentType: boolean;
  includeAcceptHeader: boolean;
  includeAuthPlaceholder: boolean;
  includeRequestBody: boolean;
  prettyPrintBody: boolean;
  warnDestructiveMethods: boolean;
  warnBodyMismatch: boolean;
  warnCachingBehavior: boolean;
  warnCorsPreflight: boolean;
}): Result {
  const methodInfo = getMethodInfo(options.method);
  const headers = buildHeaders(options);
  const body = prepareBody(options);
  const issues = buildIssues(options, methodInfo, headers, body);
  const output = formatOutput(options, methodInfo, headers, body, issues);

  return {
    output,
    issues,
    headers,
    inputLength: options.url.length + options.requestBody.length + options.customHeaders.length,
    method: options.method,
    methodPurpose: methodInfo.purpose,
    bodyAllowed: methodInfo.bodyAllowed,
    cacheNote: methodInfo.cacheNote,
    idempotencyNote: methodInfo.idempotencyNote,
    outputLength: output.length,
  };
}

function getMethodInfo(method: HttpMethod) {
  const map = {
    GET: {
      purpose: "read",
      bodyAllowed: false,
      cacheNote: "GET responses may be cached depending on headers.",
      idempotencyNote: "GET should be safe and idempotent.",
    },
    POST: {
      purpose: "create / submit",
      bodyAllowed: true,
      cacheNote: "POST is usually not cached unless explicitly configured.",
      idempotencyNote: "POST is usually not idempotent.",
    },
    PUT: {
      purpose: "replace",
      bodyAllowed: true,
      cacheNote: "PUT responses are usually not cached by default.",
      idempotencyNote: "PUT is generally idempotent when replacing the same resource.",
    },
    PATCH: {
      purpose: "partial update",
      bodyAllowed: true,
      cacheNote: "PATCH responses are usually not cached by default.",
      idempotencyNote: "PATCH may or may not be idempotent depending on the patch operation.",
    },
    DELETE: {
      purpose: "delete",
      bodyAllowed: false,
      cacheNote: "DELETE responses are usually not cached.",
      idempotencyNote: "DELETE is often treated as idempotent, but side effects depend on the API.",
    },
    HEAD: {
      purpose: "headers only",
      bodyAllowed: false,
      cacheNote: "HEAD can be cached similarly to GET metadata.",
      idempotencyNote: "HEAD should be safe and idempotent.",
    },
    OPTIONS: {
      purpose: "method discovery / preflight",
      bodyAllowed: false,
      cacheNote: "OPTIONS may be cached for CORS preflight according to server headers.",
      idempotencyNote: "OPTIONS should be safe and idempotent.",
    },
  } satisfies Record<HttpMethod, { purpose: string; bodyAllowed: boolean; cacheNote: string; idempotencyNote: string }>;

  return map[method];
}

function buildHeaders(options: {
  customHeaders: string;
  bodyMode: BodyMode;
  authMode: AuthMode;
  includeContentType: boolean;
  includeAcceptHeader: boolean;
  includeAuthPlaceholder: boolean;
}) {
  const headers: HeaderRow[] = [];

  if (options.includeAcceptHeader) {
    headers.push({ name: "Accept", value: "application/json" });
  }

  if (options.includeContentType && options.bodyMode !== "none") {
    headers.push({ name: "Content-Type", value: contentTypeFor(options.bodyMode) });
  }

  if (options.includeAuthPlaceholder && options.authMode !== "none") {
    if (options.authMode === "bearer") headers.push({ name: "Authorization", value: "Bearer YOUR_TOKEN" });
    if (options.authMode === "basic") headers.push({ name: "Authorization", value: "Basic BASE64_USERNAME_PASSWORD" });
    if (options.authMode === "apiKey") headers.push({ name: "X-API-Key", value: "YOUR_API_KEY" });
  }

  parseHeaders(options.customHeaders).forEach((header) => {
    if (!headers.some((existing) => existing.name.toLowerCase() === header.name.toLowerCase())) {
      headers.push(header);
    }
  });

  return headers;
}

function parseHeaders(input: string): HeaderRow[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const index = line.indexOf(":");
      if (index === -1) return null;
      return {
        name: line.slice(0, index).trim(),
        value: line.slice(index + 1).trim(),
      };
    })
    .filter((header): header is HeaderRow => Boolean(header?.name));
}

function contentTypeFor(bodyMode: BodyMode) {
  if (bodyMode === "json") return "application/json";
  if (bodyMode === "form") return "application/x-www-form-urlencoded";
  if (bodyMode === "text") return "text/plain";
  return "";
}

function prepareBody(options: {
  bodyMode: BodyMode;
  requestBody: string;
  includeRequestBody: boolean;
  prettyPrintBody: boolean;
}) {
  if (!options.includeRequestBody || options.bodyMode === "none") return "";

  if (options.bodyMode === "json" && options.prettyPrintBody) {
    try {
      return JSON.stringify(JSON.parse(options.requestBody || "{}"), null, 2);
    } catch {
      return options.requestBody;
    }
  }

  return options.requestBody;
}

function buildIssues(options: {
  method: HttpMethod;
  bodyMode: BodyMode;
  requestBody: string;
  safetyLevel: SafetyLevel;
  warnDestructiveMethods: boolean;
  warnBodyMismatch: boolean;
  warnCachingBehavior: boolean;
  warnCorsPreflight: boolean;
}, methodInfo: ReturnType<typeof getMethodInfo>, headers: HeaderRow[], body: string): Issue[] {
  const issues: Issue[] = [];

  if (options.warnDestructiveMethods && ["DELETE", "PATCH", "PUT"].includes(options.method)) {
    issues.push({
      severity: options.method === "DELETE" ? "high" : "warning",
      title: "Method can change resources",
      message: `${options.method} requests can modify server state. Review the endpoint and environment before running generated examples.`,
    });
  }

  if (options.warnBodyMismatch && !methodInfo.bodyAllowed && options.bodyMode !== "none") {
    issues.push({
      severity: "warning",
      title: "Body is unusual for this method",
      message: `${options.method} requests usually do not include a body. Some servers ignore it or reject it.`,
    });
  }

  if (options.warnBodyMismatch && methodInfo.bodyAllowed && options.bodyMode === "none" && ["POST", "PUT", "PATCH"].includes(options.method)) {
    issues.push({
      severity: "info",
      title: "No request body selected",
      message: `${options.method} often includes a request body. Confirm whether this endpoint expects one.`,
    });
  }

  if (options.warnCachingBehavior) {
    issues.push({
      severity: "info",
      title: "Caching and idempotency",
      message: `${methodInfo.cacheNote} ${methodInfo.idempotencyNote}`,
    });
  }

  if (options.warnCorsPreflight && mayTriggerPreflight(options.method, headers, body)) {
    issues.push({
      severity: "info",
      title: "Possible CORS preflight",
      message: "This request shape may trigger a browser CORS preflight when sent from frontend code.",
    });
  }

  if (options.safetyLevel === "destructiveReview" && options.method === "DELETE") {
    issues.push({
      severity: "high",
      title: "Destructive review selected",
      message: "DELETE examples should be tested only against safe environments or disposable resources.",
    });
  }

  return issues;
}

function mayTriggerPreflight(method: HttpMethod, headers: HeaderRow[], body: string) {
  if (!["GET", "HEAD", "POST"].includes(method)) return true;
  const simpleHeaders = new Set(["accept", "accept-language", "content-language", "content-type"]);
  const hasNonSimpleHeader = headers.some((header) => !simpleHeaders.has(header.name.toLowerCase()));
  const contentType = headers.find((header) => header.name.toLowerCase() === "content-type")?.value.toLowerCase() ?? "";
  const simpleContentTypes = ["application/x-www-form-urlencoded", "multipart/form-data", "text/plain", ""];
  return hasNonSimpleHeader || (Boolean(body) && !simpleContentTypes.includes(contentType));
}

function formatOutput(options: {
  url: string;
  method: HttpMethod;
  outputMode: OutputMode;
}, methodInfo: ReturnType<typeof getMethodInfo>, headers: HeaderRow[], body: string, issues: Issue[]) {
  if (options.outputMode === "curl") {
    return buildCurl(options.url, options.method, headers, body);
  }

  if (options.outputMode === "fetch") {
    return buildFetch(options.url, options.method, headers, body);
  }

  if (options.outputMode === "json") {
    return JSON.stringify({
      method: options.method,
      url: options.url,
      purpose: methodInfo.purpose,
      bodyAllowed: methodInfo.bodyAllowed,
      headers,
      body: body || undefined,
      notes: {
        cache: methodInfo.cacheNote,
        idempotency: methodInfo.idempotencyNote,
      },
      issues,
    }, null, 2);
  }

  if (options.outputMode === "markdown") {
    const lines = [
      `# HTTP ${options.method} Method Review`,
      "",
      `Endpoint: \`${options.url}\``,
      `Purpose: ${methodInfo.purpose}`,
      `Body usually allowed: ${methodInfo.bodyAllowed ? "yes" : "no"}`,
      "",
      "## Headers",
      "",
      ...headers.map((header) => `- \`${header.name}: ${header.value}\``),
      "",
      "## Notes",
      "",
      `- ${methodInfo.cacheNote}`,
      `- ${methodInfo.idempotencyNote}`,
    ];

    if (issues.length) {
      lines.push("", "## Review warnings", "", ...issues.map((issue) => `- **${issue.title}:** ${issue.message}`));
    }

    return lines.join("\n");
  }

  if (options.outputMode === "checklist") {
    const lines = [
      "# HTTP Method Checklist",
      "",
      `- [x] Method selected: ${options.method}`,
      `- [x] Endpoint reviewed: ${options.url}`,
      `- [${headers.length ? "x" : " "}] Headers reviewed.`,
      `- [${methodInfo.bodyAllowed || !body ? "x" : " "}] Body usage matches typical method behavior.`,
      `- [${issues.every((issue) => issue.severity !== "high") ? "x" : " "}] No high-severity method warnings.`,
    ];

    if (issues.length) {
      lines.push("", "Notes:");
      issues.forEach((issue) => lines.push(`- ${issue.title}: ${issue.message}`));
    }

    return lines.join("\n");
  }

  return [
    `HTTP method: ${options.method}`,
    `Endpoint: ${options.url}`,
    `Purpose: ${methodInfo.purpose}`,
    `Body usually allowed: ${methodInfo.bodyAllowed ? "yes" : "no"}`,
    `Caching: ${methodInfo.cacheNote}`,
    `Idempotency: ${methodInfo.idempotencyNote}`,
    "",
    "Headers:",
    headers.length ? headers.map((header) => `- ${header.name}: ${header.value}`).join("\n") : "- No headers included",
    "",
    issues.length ? "Review notes:" : "Review notes: none",
    ...issues.map((issue) => `- ${issue.title}: ${issue.message}`),
  ].join("\n");
}

function buildCurl(url: string, method: HttpMethod, headers: HeaderRow[], body: string) {
  const parts = [`curl -X ${method} ${shellQuote(url)}`];
  headers.forEach((header) => {
    parts.push(`  -H ${shellQuote(`${header.name}: ${header.value}`)}`);
  });
  if (body) {
    parts.push(`  --data ${shellQuote(body)}`);
  }
  return parts.join(" \\\n");
}

function buildFetch(url: string, method: HttpMethod, headers: HeaderRow[], body: string) {
  const headerObject = headers.reduce<Record<string, string>>((acc, header) => {
    acc[header.name] = header.value;
    return acc;
  }, {});

  const lines = [
    `const response = await fetch(${JSON.stringify(url)}, {`,
    `  method: ${JSON.stringify(method)},`,
    `  headers: ${JSON.stringify(headerObject, null, 2).replace(/\n/g, "\n  ")},`,
  ];

  if (body) {
    lines.push(`  body: ${JSON.stringify(body)},`);
  }

  lines.push("});", "", "const data = await response.json();");
  return lines.join("\n");
}

function shellQuote(value: string) {
  return `'${value.replace(/'/g, "'\\''")}'`;
}

function getNotes(result: Result): Issue[] {
  const notes = [...result.issues];

  if (result.headers.length > 8) {
    notes.push({
      severity: "info",
      title: "Many headers",
      message: "This example contains many headers. Remove unnecessary headers before sharing documentation examples.",
    });
  }

  if (result.outputLength > 10000) {
    notes.push({
      severity: "info",
      title: "Large output",
      message: "The generated request example is long. Check whether the body or headers can be simplified.",
    });
  }

  return notes;
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-gray-300 accent-[#d9a928]"
      />
      <span>{label}</span>
    </label>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 break-words font-mono text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function Faq({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600 leading-relaxed">{children}</p>
    </div>
  );
}
