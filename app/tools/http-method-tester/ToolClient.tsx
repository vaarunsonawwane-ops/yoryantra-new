"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
type OutputMode = "summary" | "curl" | "fetch" | "markdown" | "json" | "checklist";
type BodyMode = "none" | "json" | "form" | "text";
type AuthMode = "none" | "bearer" | "basic" | "apiKey";

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
  const [requestBody, setRequestBody] = useState("");
  const [customHeaders, setCustomHeaders] = useState("");
  const [includeContentType, setIncludeContentType] = useState(true);
  const [includeAcceptHeader, setIncludeAcceptHeader] = useState(true);
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
      setError("Enter an endpoint URL or path before building the method review.");
      setResult(null);
      setOutput("");
      return;
    }

    const headerError = validateHeaderInput(customHeaders);
    if (headerError) {
      setError(headerError);
      setResult(null);
      setOutput("");
      return;
    }

    if (bodyMode === "json" && includeRequestBody && requestBody.trim()) {
      try {
        JSON.parse(requestBody);
      } catch {
        setError("The body is marked as JSON but is not valid JSON. Correct it or choose another body type.");
        setResult(null);
        setOutput("");
        return;
      }
    }

    if (
      method === "OPTIONS" &&
      includeRequestBody &&
      bodyMode !== "none" &&
      requestBody.trim() &&
      !includeContentType &&
      !parseHeaders(customHeaders).some((header) => header.name.toLowerCase() === "content-type")
    ) {
      setError("OPTIONS request content needs a valid Content-Type header. Enable Content-Type or provide one in Custom Headers.");
      setResult(null);
      setOutput("");
      return;
    }

    if (outputMode === "fetch" && includeRequestBody && requestBody.trim() && (method === "GET" || method === "HEAD")) {
      setError(`The Fetch API does not allow a request body with ${method}. Remove the body or choose another output.`);
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
      requestBody,
      customHeaders,
      includeContentType,
      includeAcceptHeader,
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
    setRequestBody(sampleBody);
    setCustomHeaders("X-Request-ID: example-request-id");
    setIncludeContentType(true);
    setIncludeAcceptHeader(true);
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
    setRequestBody("");
    setCustomHeaders("");
    setIncludeContentType(true);
    setIncludeAcceptHeader(true);
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
      description="Compare HTTP method semantics and build request examples without sending anything to an endpoint."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900">Endpoint URL or Path</label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Enter an API endpoint, route, or example URL. The review stays in your browser and does not send a request.
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
                if ((next === "GET" || next === "HEAD") && bodyMode !== "none") {
                  setBodyMode("none");
                }
                clearResult();
              }}
              options={[
                { label: "GET - read a resource", value: "GET" },
                { label: "POST - resource-specific processing", value: "POST" },
                { label: "PUT - replace a resource", value: "PUT" },
                { label: "PATCH - apply a patch document", value: "PATCH" },
                { label: "DELETE - remove target association", value: "DELETE" },
                { label: "HEAD - headers only", value: "HEAD" },
                { label: "OPTIONS - communication options", value: "OPTIONS" },
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
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>
        <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
          <Toggle checked={includeContentType} onChange={setIncludeContentType} label="Include Content-Type header when body is used" />
          <Toggle checked={includeAcceptHeader} onChange={setIncludeAcceptHeader} label="Include Accept: application/json" />
          <Toggle checked={includeRequestBody} onChange={setIncludeRequestBody} label="Include request body in generated snippets" />
          <Toggle checked={prettyPrintBody} onChange={setPrettyPrintBody} label="Pretty print JSON body when possible" />
          <Toggle checked={warnDestructiveMethods} onChange={setWarnDestructiveMethods} label="Warn about state-changing methods" />
          <Toggle checked={warnBodyMismatch} onChange={setWarnBodyMismatch} label="Warn when method and body do not match" />
          <Toggle checked={warnCachingBehavior} onChange={setWarnCachingBehavior} label="Warn about caching and idempotency behavior" />
          <Toggle checked={warnCorsPreflight} onChange={setWarnCorsPreflight} label="Warn when request may trigger CORS preflight" />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-gray-500">
          Keep only the headers and checks that belong in the example you are preparing. Warnings describe protocol-level concerns; the endpoint contract still decides what the server accepts.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={processMethod}
          className="min-h-[44px] whitespace-nowrap rounded-xl bg-[var(--green)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Check HTTP Method
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="min-h-[44px] whitespace-nowrap rounded-xl border border-[var(--green)] px-5 py-2.5 text-sm font-semibold text-[var(--green)] transition hover:bg-green-50"
        >
          Load Example
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="min-h-[44px] whitespace-nowrap rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
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
                className="min-h-[44px] whitespace-nowrap rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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
            <StatCard label="Request content" value={result.bodyAllowed ? "defined / common" : "unusual / contract-dependent"} />
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
              <div key={`${note.title}-${note.message}`} className={issueCardClass(note.severity)}>
                <p className="text-sm font-semibold text-gray-900">{note.title}</p>
                <p className="mt-1 text-sm leading-6 text-gray-700">{note.message}</p>
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
          <h2 className="text-2xl font-semibold text-gray-900">Method semantics matter more than CRUD labels</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            GET, POST, PUT, PATCH, DELETE, HEAD, and OPTIONS are protocol methods, not a fixed CRUD vocabulary. An API can give a POST endpoint resource-specific processing semantics without creating anything, and DELETE expresses removal of the target resource association rather than promising that every underlying record or file is physically erased. Treat the API contract as authoritative when it narrows or extends the general HTTP meaning.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            RFC 9110 defines GET, HEAD, and OPTIONS as safe methods. PUT and DELETE are not safe, but they are idempotent by definition: repeating the same intended request should have the same intended effect as sending it once. POST is not inherently idempotent, and RFC 5789 makes the same point for PATCH, although an API can design a particular POST or PATCH operation to be idempotent.
          </p>
          <p className="mt-3 text-sm text-gray-500">
            Standards: <a className="font-medium text-[var(--green)] underline underline-offset-2" href="https://www.rfc-editor.org/rfc/rfc9110.html#section-9" target="_blank" rel="noreferrer">RFC 9110, HTTP methods</a> and <a className="font-medium text-[var(--green)] underline underline-offset-2" href="https://www.rfc-editor.org/rfc/rfc5789.html" target="_blank" rel="noreferrer">RFC 5789, PATCH</a>.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2 items-start">
          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-xl font-semibold text-gray-900">Request content is not simply allowed or forbidden</h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              POST and PUT define clear semantics for request content, and PATCH carries a patch document whose media type tells the server how to apply the change. GET, HEAD, and DELETE are different: RFC 9110 says request content has no generally defined semantics for them and clients should not generate it unless the origin server has explicitly indicated support. OPTIONS can contain content, but HTTP itself assigns no meaning to it and requires a valid Content-Type when it is present.
            </p>
            <p className="mt-3 text-sm text-gray-500">
              A warning here means “unusual or contract-dependent,” not “HTTP syntax makes this impossible.”
            </p>
          </div>

          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-xl font-semibold text-gray-900">Retry decisions belong to idempotency</h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              A network timeout creates an awkward question: did the server apply the request before the connection failed? Idempotent methods give clients more room to retry automatically because repeating the same intended operation should not multiply its intended effect. That does not make PUT or DELETE harmless, and it does not mean every library should blindly retry them. Preconditions such as If-Match can matter when concurrent updates are possible.
            </p>
            <p className="mt-3 text-sm text-gray-500">
              PATCH deserves extra care when the patch depends on a known base version; RFC 5789 specifically discusses conditional requests for collision-sensitive patch formats.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Caching rules differ by method</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            GET and HEAD have normal cache semantics. POST responses can be cached only under specific conditions, including explicit freshness information and a matching Content-Location. PUT and DELETE responses are not cacheable under RFC 9110, and successful requests can invalidate stored responses for the target URI. OPTIONS responses are also not cacheable. PATCH has its own narrower cache rules in RFC 5789.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The generated summary is a protocol reference, not a prediction of what a particular CDN, framework, reverse proxy, or application cache will do. Cache-Control, validators, authorization, intermediary configuration, and application behavior still decide what happens in a real deployment.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] items-start">
          <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="text-xl font-semibold text-gray-900">Generated commands are examples, not live verification</h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              Nothing entered here is sent to the endpoint. That protects you from accidentally executing a destructive example, but it also means the page cannot confirm whether a route exists, which methods the server actually allows, whether credentials work, whether a request will pass CORS, or what status code and response body will come back. Run copied commands only against an environment where the operation is safe.
            </p>
          </div>

          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-xl font-semibold text-gray-900">Browser CORS warnings describe request shape only</h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              Frontend requests can require a CORS preflight when the method is not CORS-safelisted or when headers and Content-Type fall outside the safelisted request-header rules. Authorization and application/json commonly lead to preflight. The warning is intentionally conservative because the browser also considers header values and the server&apos;s CORS response.
            </p>
            <p className="mt-3 text-sm text-gray-500">
              Reference: <a className="font-medium text-[var(--green)] underline underline-offset-2" href="https://fetch.spec.whatwg.org/#cors-protocol" target="_blank" rel="noreferrer">WHATWG Fetch CORS protocol</a>.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Read the generated fetch snippet before using it</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The fetch output builds the request only. It does not assume that every response contains JSON, because HEAD responses have no response content and successful APIs can return text, binary data, 204 No Content, or another media type. Response parsing belongs to the caller after checking status and Content-Type. Custom headers are treated as example input; verify required names, values, authentication schemes, and content types against the API documentation before running the request.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/http-method-tester" />
          </div>
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
  requestBody: string;
  customHeaders: string;
  includeContentType: boolean;
  includeAcceptHeader: boolean;
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
      purpose: "retrieve a representation",
      bodyAllowed: false,
      cacheNote: "GET responses are cacheable unless cache controls say otherwise.",
      idempotencyNote: "GET is safe and idempotent.",
    },
    POST: {
      purpose: "resource-specific processing",
      bodyAllowed: true,
      cacheNote: "POST responses are cacheable only under specific explicit conditions.",
      idempotencyNote: "POST is not inherently idempotent.",
    },
    PUT: {
      purpose: "replace target resource state",
      bodyAllowed: true,
      cacheNote: "PUT responses are not cacheable and can invalidate stored responses for the target URI.",
      idempotencyNote: "PUT is idempotent, but not safe.",
    },
    PATCH: {
      purpose: "apply a patch document",
      bodyAllowed: true,
      cacheNote: "PATCH has narrow cacheability rules defined by RFC 5789.",
      idempotencyNote: "PATCH is not inherently idempotent; a specific patch operation can be designed to be idempotent.",
    },
    DELETE: {
      purpose: "remove the target resource association",
      bodyAllowed: false,
      cacheNote: "DELETE responses are not cacheable and can invalidate stored responses for the target URI.",
      idempotencyNote: "DELETE is idempotent, but not safe.",
    },
    HEAD: {
      purpose: "retrieve response metadata without response content",
      bodyAllowed: false,
      cacheNote: "HEAD responses are cacheable and can affect cached GET metadata.",
      idempotencyNote: "HEAD is safe and idempotent.",
    },
    OPTIONS: {
      purpose: "describe communication options",
      bodyAllowed: false,
      cacheNote: "OPTIONS responses are not cacheable.",
      idempotencyNote: "OPTIONS is safe and idempotent.",
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
}) {
  const headers = parseHeaders(options.customHeaders);
  const hasHeader = (name: string) => headers.some((header) => header.name.toLowerCase() === name.toLowerCase());
  const addDefault = (name: string, value: string) => {
    if (!hasHeader(name)) headers.push({ name, value });
  };

  if (options.includeAcceptHeader) addDefault("Accept", "application/json");
  if (options.includeContentType && options.bodyMode !== "none") {
    addDefault("Content-Type", contentTypeFor(options.bodyMode));
  }
  if (options.authMode === "bearer") addDefault("Authorization", "Bearer YOUR_TOKEN");
  if (options.authMode === "basic") addDefault("Authorization", "Basic BASE64_USERNAME_PASSWORD");
  if (options.authMode === "apiKey") addDefault("X-API-Key", "YOUR_API_KEY");

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

function validateHeaderInput(input: string) {
  const token = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;
  const lines = input.split(/\r?\n/);
  const seen = new Set<string>();

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) continue;
    const colon = line.indexOf(":");
    if (colon <= 0) return `Custom header line ${index + 1} needs a field name followed by a colon.`;
    const name = line.slice(0, colon).trim();
    const value = line.slice(colon + 1);
    if (!token.test(name)) return `Custom header line ${index + 1} contains an invalid HTTP field name.`;
    const lowerName = name.toLowerCase();
    if (seen.has(lowerName)) return `Custom header ${name} appears more than once. Keep one value so generated cURL and fetch examples stay consistent.`;
    seen.add(lowerName);
    if (/[^\t\x20-\x7E\x80-\xFF]/.test(value)) return `Custom header line ${index + 1} contains a control character that should not appear in a generated field value.`;
  }

  return "";
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
  warnDestructiveMethods: boolean;
  warnBodyMismatch: boolean;
  warnCachingBehavior: boolean;
  warnCorsPreflight: boolean;
}, methodInfo: ReturnType<typeof getMethodInfo>, headers: HeaderRow[], body: string): Issue[] {
  const issues: Issue[] = [];

  if (options.warnDestructiveMethods && ["POST", "PUT", "PATCH", "DELETE"].includes(options.method)) {
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
      message: `${options.method} request content has no generally defined semantics here. Use it only when the endpoint explicitly documents support.`,
    });
  }

  if (options.warnBodyMismatch && methodInfo.bodyAllowed && options.bodyMode === "none" && ["POST", "PUT", "PATCH"].includes(options.method)) {
    issues.push({
      severity: "info",
      title: "No request body selected",
      message: `${options.method} often includes a request body. Confirm whether this endpoint expects one.`,
    });
  }

  if (options.method === "PATCH" && options.bodyMode === "json") {
    const contentType = headers.find((header) => header.name.toLowerCase() === "content-type")?.value.toLowerCase() ?? "";
    if (contentType === "application/json") {
      issues.push({
        severity: "info",
        title: "Check the patch media type",
        message: "PATCH formats define their own media types. An endpoint using JSON Patch or JSON Merge Patch can require a more specific Content-Type than application/json.",
      });
    }
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

  return issues;
}

function mayTriggerPreflight(method: HttpMethod, headers: HeaderRow[], body: string) {
  if (!["GET", "HEAD", "POST"].includes(method)) return true;
  const simpleHeaders = new Set(["accept", "accept-language", "content-language", "content-type"]);
  const hasNonSimpleHeader = headers.some((header) => !simpleHeaders.has(header.name.toLowerCase()));
  const contentType = headers.find((header) => header.name.toLowerCase() === "content-type")?.value.toLowerCase() ?? "";
  const contentTypeEssence = contentType.split(";", 1)[0].trim();
  const simpleContentTypes = ["application/x-www-form-urlencoded", "multipart/form-data", "text/plain", ""];
  return hasNonSimpleHeader || (Boolean(body) && !simpleContentTypes.includes(contentTypeEssence));
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
      `Request content: ${methodInfo.bodyAllowed ? "defined / common" : "unusual / contract-dependent"}`,
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
      `- [${methodInfo.bodyAllowed || !body ? "x" : " "}] Request content matches the method's general HTTP semantics.`,
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
    `Request content: ${methodInfo.bodyAllowed ? "defined / common" : "unusual / contract-dependent"}`,
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
  const command = method === "HEAD" && !body ? `curl --head ${shellQuote(url)}` : `curl -X ${method} ${shellQuote(url)}`;
  const parts = [command];
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

  lines.push(
    "});",
    "",
    "if (!response.ok) {",
    "  throw new Error(`HTTP ${response.status}`);",
    "}",
    "",
    "// Parse the response according to its status and Content-Type.",
  );
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


function issueCardClass(severity: Issue["severity"]) {
  if (severity === "high") return "rounded-xl border border-red-200 bg-red-50 p-4";
  if (severity === "warning") return "rounded-xl border border-amber-200 bg-amber-50 p-4";
  return "rounded-xl border border-gray-200 bg-gray-50 p-4";
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 break-words font-mono text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}
