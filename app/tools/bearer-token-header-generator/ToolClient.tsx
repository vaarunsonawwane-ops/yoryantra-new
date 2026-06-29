"use client";

import { useMemo, useState, type ReactNode } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "header" | "curl" | "fetch" | "http" | "json" | "markdown" | "checklist";
type TokenType = "bearer" | "jwt" | "opaque" | "custom";
type HeaderCase = "authorization" | "Authorization" | "AUTHORIZATION";
type RedactionMode = "none" | "middle" | "full" | "last4";
type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type TokenInfo = {
  tokenLength: number;
  tokenShape: string;
  looksJwt: boolean;
  jwtParts: number;
  hasWhitespace: boolean;
  hasBearerPrefix: boolean;
  redactedToken: string;
};

type Result = {
  output: string;
  issues: Issue[];
  tokenInfo: TokenInfo;
  headers: Array<{ name: string; value: string }>;
  inputLength: number;
  outputLength: number;
};

const sampleToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example-payload.example-signature";

export default function ToolClient() {
  const [token, setToken] = useState("");
  const [endpointUrl, setEndpointUrl] = useState("");
  const [requestBody, setRequestBody] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("header");
  const [tokenType, setTokenType] = useState<TokenType>("bearer");
  const [headerCase, setHeaderCase] = useState<HeaderCase>("Authorization");
  const [redactionMode, setRedactionMode] = useState<RedactionMode>("middle");
  const [requestMethod, setRequestMethod] = useState<RequestMethod>("GET");
  const [trimToken, setTrimToken] = useState(true);
  const [removeExistingBearerPrefix, setRemoveExistingBearerPrefix] = useState(true);
  const [includeAcceptHeader, setIncludeAcceptHeader] = useState(true);
  const [includeContentTypeHeader, setIncludeContentTypeHeader] = useState(false);
  const [includeRequestBody, setIncludeRequestBody] = useState(false);
  const [redactTokenInOutput, setRedactTokenInOutput] = useState(false);
  const [warnWhitespace, setWarnWhitespace] = useState(true);
  const [warnBearerPrefix, setWarnBearerPrefix] = useState(true);
  const [warnJwtShape, setWarnJwtShape] = useState(true);
  const [warnSensitiveSharing, setWarnSensitiveSharing] = useState(true);
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

  const generateHeader = () => {
    if (!token.trim()) {
      setError("Please paste a token or token placeholder to generate the Authorization header.");
      setResult(null);
      setOutput("");
      return;
    }

    const next = buildResult({
      token,
      endpointUrl,
      requestBody,
      outputMode,
      tokenType,
      headerCase,
      redactionMode,
      requestMethod,
      trimToken,
      removeExistingBearerPrefix,
      includeAcceptHeader,
      includeContentTypeHeader,
      includeRequestBody,
      redactTokenInOutput,
      warnWhitespace,
      warnBearerPrefix,
      warnJwtShape,
      warnSensitiveSharing,
    });

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
    setToken(sampleToken);
    setEndpointUrl("https://api.example.com/v1/profile");
    setRequestBody(`{
  "name": "Yoryantra"
}`);
    setOutputMode("curl");
    setTokenType("jwt");
    setHeaderCase("Authorization");
    setRedactionMode("middle");
    setRequestMethod("GET");
    setTrimToken(true);
    setRemoveExistingBearerPrefix(true);
    setIncludeAcceptHeader(true);
    setIncludeContentTypeHeader(false);
    setIncludeRequestBody(false);
    setRedactTokenInOutput(true);
    setWarnWhitespace(true);
    setWarnBearerPrefix(true);
    setWarnJwtShape(true);
    setWarnSensitiveSharing(true);
    clearResult();
  };

  const resetAll = () => {
    setToken("");
    setEndpointUrl("");
    setRequestBody("");
    setOutputMode("header");
    setTokenType("bearer");
    setHeaderCase("Authorization");
    setRedactionMode("middle");
    setRequestMethod("GET");
    setTrimToken(true);
    setRemoveExistingBearerPrefix(true);
    setIncludeAcceptHeader(true);
    setIncludeContentTypeHeader(false);
    setIncludeRequestBody(false);
    setRedactTokenInOutput(false);
    setWarnWhitespace(true);
    setWarnBearerPrefix(true);
    setWarnJwtShape(true);
    setWarnSensitiveSharing(true);
    clearResult();
  };

  return (
    <ToolShell
      title="Bearer Token Header Generator"
      description="Generate Bearer token Authorization headers, cURL commands, fetch snippets, HTTP request examples, and safe redacted reports locally in your browser."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900">Token or Token Placeholder</label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Paste a token, JWT, opaque API token, or placeholder such as YOUR_TOKEN. Use redaction before sharing generated examples.
            </p>
          </div>

          <textarea
            value={token}
            onChange={(event) => {
              setToken(event.target.value);
              clearResult();
            }}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            spellCheck={false}
            className="w-full min-h-[220px] rounded-xl border border-gray-300 p-4 text-sm leading-6 font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-900">Endpoint URL</label>
            <input
              value={endpointUrl}
              onChange={(event) => {
                setEndpointUrl(event.target.value);
                clearResult();
              }}
              placeholder="https://api.example.com/v1/profile"
              className="mt-2 min-h-[48px] w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-900">Optional Request Body</label>
            <textarea
              value={requestBody}
              onChange={(event) => {
                setRequestBody(event.target.value);
                clearResult();
              }}
              placeholder={`{\n  "name": "Yoryantra"\n}`}
              spellCheck={false}
              className="mt-2 w-full min-h-[150px] rounded-xl border border-gray-300 p-4 text-sm leading-6 font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Header Settings</h3>

          <div className="mt-4 space-y-4">
            <YoryantraSelect
              label="Output"
              value={outputMode}
              onChange={(value) => {
                setOutputMode(value as OutputMode);
                clearResult();
              }}
              options={[
                { label: "Authorization header", value: "header" },
                { label: "cURL command", value: "curl" },
                { label: "fetch snippet", value: "fetch" },
                { label: "Raw HTTP request", value: "http" },
                { label: "JSON report", value: "json" },
                { label: "Markdown report", value: "markdown" },
                { label: "Review checklist", value: "checklist" },
              ]}
            />

            <YoryantraSelect
              label="Token Type"
              value={tokenType}
              onChange={(value) => {
                setTokenType(value as TokenType);
                clearResult();
              }}
              options={[
                { label: "Bearer token", value: "bearer" },
                { label: "JWT bearer token", value: "jwt" },
                { label: "Opaque access token", value: "opaque" },
                { label: "Custom token value", value: "custom" },
              ]}
            />

            <YoryantraSelect
              label="Header Name Style"
              value={headerCase}
              onChange={(value) => {
                setHeaderCase(value as HeaderCase);
                clearResult();
              }}
              options={[
                { label: "Authorization", value: "Authorization" },
                { label: "authorization", value: "authorization" },
                { label: "AUTHORIZATION", value: "AUTHORIZATION" },
              ]}
            />

            <YoryantraSelect
              label="Request Method"
              value={requestMethod}
              onChange={(value) => {
                setRequestMethod(value as RequestMethod);
                clearResult();
              }}
              options={[
                { label: "GET", value: "GET" },
                { label: "POST", value: "POST" },
                { label: "PUT", value: "PUT" },
                { label: "PATCH", value: "PATCH" },
                { label: "DELETE", value: "DELETE" },
              ]}
            />

            <YoryantraSelect
              label="Redaction Style"
              value={redactionMode}
              onChange={(value) => {
                setRedactionMode(value as RedactionMode);
                clearResult();
              }}
              options={[
                { label: "No redaction", value: "none" },
                { label: "Redact middle", value: "middle" },
                { label: "Show last 4 only", value: "last4" },
                { label: "Fully redacted", value: "full" },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>
        <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
          <Toggle checked={trimToken} onChange={setTrimToken} label="Trim outer whitespace from token" />
          <Toggle checked={removeExistingBearerPrefix} onChange={setRemoveExistingBearerPrefix} label="Remove existing Bearer prefix before generating" />
          <Toggle checked={includeAcceptHeader} onChange={setIncludeAcceptHeader} label="Include Accept: application/json" />
          <Toggle checked={includeContentTypeHeader} onChange={setIncludeContentTypeHeader} label="Include Content-Type: application/json" />
          <Toggle checked={includeRequestBody} onChange={setIncludeRequestBody} label="Include request body in snippets" />
          <Toggle checked={redactTokenInOutput} onChange={setRedactTokenInOutput} label="Redact token in generated output" />
          <Toggle checked={warnWhitespace} onChange={setWarnWhitespace} label="Warn about whitespace inside token" />
          <Toggle checked={warnBearerPrefix} onChange={setWarnBearerPrefix} label="Warn when token already includes Bearer prefix" />
          <Toggle checked={warnJwtShape} onChange={setWarnJwtShape} label="Warn about unusual JWT shape" />
          <Toggle checked={warnSensitiveSharing} onChange={setWarnSensitiveSharing} label="Warn about sharing real tokens" />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-gray-500">
          This tool only formats pasted text locally. It does not verify tokens, call APIs, decode secrets, or send token values anywhere.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={generateHeader}
          className="rounded-xl bg-[var(--green)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Generate Header
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
                <p className="mt-1 text-sm text-gray-500">Authorization header, request snippet, or safe token report.</p>
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
            <StatCard label="Token length" value={String(result.tokenInfo.tokenLength)} />
            <StatCard label="Token shape" value={result.tokenInfo.tokenShape} />
            <StatCard label="Looks like JWT" value={result.tokenInfo.looksJwt ? "yes" : "no"} />
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
          <p className="mt-1 text-sm text-gray-500">Headers included in the generated request example.</p>
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
          <h2 className="text-2xl font-semibold text-gray-900">Building Bearer Token Headers Safely</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Many APIs use Bearer tokens in the HTTP Authorization header. The final header usually looks like <code className="rounded bg-gray-100 px-1 py-0.5">Authorization: Bearer YOUR_TOKEN</code>. It is simple, but small formatting mistakes can cause authentication failures.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This tool helps format Bearer token headers and request snippets for documentation, API testing, and debugging. It can trim accidental whitespace, remove duplicate Bearer prefixes, redact token values, and generate cURL, fetch, raw HTTP, JSON, or Markdown output.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">When This Bearer Token Header Generator Helps</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p>Creating Authorization headers for API examples, documentation, issue reports, or test notes.</p>
            <p className="mt-2">Generating cURL or fetch snippets with a Bearer token placeholder instead of typing headers manually.</p>
            <p className="mt-2">Checking whether a pasted token already includes the Bearer prefix or hidden whitespace.</p>
            <p className="mt-2">Redacting token output before sharing snippets with teammates or support teams.</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">How to Use the Bearer Token Header Generator</h2>
          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste a token or token placeholder into the input box.</li>
            <li>Choose the output format: header, cURL, fetch, raw HTTP, JSON, Markdown, or checklist.</li>
            <li>Set the endpoint URL and request method if you are generating a request snippet.</li>
            <li>Enable redaction before copying output that might be shared outside your local machine.</li>
            <li>Review warnings about whitespace, duplicate prefixes, JWT shape, and token sharing.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example Bearer Header</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">{`Authorization: Bearer YOUR_TOKEN

curl -X GET "https://api.example.com/v1/profile" \\
  -H "Accept: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN"`}</pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Do Not Share Real Tokens Publicly</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Real access tokens can grant access to private APIs or accounts. Use placeholders in documentation and redact token values before sharing screenshots, logs, issue reports, or chat messages. If a real token is exposed publicly, rotate or revoke it in the system that issued it.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
          <div className="mt-5 space-y-6">
            <Faq title="What does this Bearer token header generator do?">
              It formats a pasted token into an Authorization header and can generate cURL, fetch, raw HTTP, JSON, Markdown, or checklist output.
            </Faq>
            <Faq title="Does this verify whether my token is valid?">
              No. It only formats and inspects text locally. It does not call APIs or verify token signatures, expiry, permissions, or scopes.
            </Faq>
            <Faq title="Should I paste real tokens into browser tools?">
              Only use tools you trust and avoid sharing real tokens. This tool runs locally in your browser, but placeholders are safer for examples.
            </Faq>
            <Faq title="Why remove an existing Bearer prefix?">
              If you paste “Bearer abc123” and the generator adds another prefix, the result becomes “Bearer Bearer abc123”. Removing the existing prefix prevents that.
            </Faq>
            <Faq title="Is anything uploaded while generating headers?">
              No. Tokens, URLs, and request body text stay in your browser.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/bearer-token-header-generator" />
        </div>
      </section>
    </ToolShell>
  );
}

function buildResult(options: {
  token: string;
  endpointUrl: string;
  requestBody: string;
  outputMode: OutputMode;
  tokenType: TokenType;
  headerCase: HeaderCase;
  redactionMode: RedactionMode;
  requestMethod: RequestMethod;
  trimToken: boolean;
  removeExistingBearerPrefix: boolean;
  includeAcceptHeader: boolean;
  includeContentTypeHeader: boolean;
  includeRequestBody: boolean;
  redactTokenInOutput: boolean;
  warnWhitespace: boolean;
  warnBearerPrefix: boolean;
  warnJwtShape: boolean;
  warnSensitiveSharing: boolean;
}): Result {
  const preparedToken = prepareToken(options.token, options);
  const tokenInfo = inspectToken(preparedToken.cleanedToken, options.redactionMode, options.token);
  const tokenForOutput = options.redactTokenInOutput ? tokenInfo.redactedToken : preparedToken.cleanedToken;
  const authValue = `${labelForToken(options.tokenType)} ${tokenForOutput}`;
  const headers = buildHeaders(options, authValue);
  const issues = buildIssues(options, tokenInfo, preparedToken);
  const output = formatOutput(options, headers, tokenInfo, issues);

  return {
    output,
    issues,
    tokenInfo,
    headers,
    inputLength: options.token.length + options.endpointUrl.length + options.requestBody.length,
    outputLength: output.length,
  };
}

function prepareToken(token: string, options: { trimToken: boolean; removeExistingBearerPrefix: boolean }) {
  let cleanedToken = options.trimToken ? token.trim() : token;
  const hadBearerPrefix = /^bearer\s+/i.test(cleanedToken);

  if (options.removeExistingBearerPrefix && hadBearerPrefix) {
    cleanedToken = cleanedToken.replace(/^bearer\s+/i, "");
  }

  return { cleanedToken, hadBearerPrefix };
}

function inspectToken(token: string, redactionMode: RedactionMode, originalToken: string): TokenInfo {
  const parts = token.split(".");
  const looksJwt = parts.length === 3 && parts.every(Boolean);
  const hasWhitespace = /\s/.test(token);
  const hasBearerPrefix = /^bearer\s+/i.test(originalToken.trim());

  return {
    tokenLength: token.length,
    tokenShape: looksJwt ? "JWT-like token" : token.length > 40 ? "long opaque token" : "short token / placeholder",
    looksJwt,
    jwtParts: parts.length,
    hasWhitespace,
    hasBearerPrefix,
    redactedToken: redactToken(token, redactionMode),
  };
}

function redactToken(token: string, mode: RedactionMode) {
  if (mode === "none") return token;
  if (mode === "full") return "REDACTED_TOKEN";
  if (mode === "last4") return token.length <= 4 ? "****" : `****${token.slice(-4)}`;
  if (token.length <= 12) return `${token.slice(0, 2)}••••${token.slice(-2)}`;
  return `${token.slice(0, 8)}••••••${token.slice(-6)}`;
}

function labelForToken(type: TokenType) {
  if (type === "custom") return "Bearer";
  return "Bearer";
}

function buildHeaders(options: {
  headerCase: HeaderCase;
  includeAcceptHeader: boolean;
  includeContentTypeHeader: boolean;
}, authValue: string): Array<{ name: string; value: string }> {
  const headers: Array<{ name: string; value: string }> = [
    { name: options.headerCase, value: authValue },
  ];

  if (options.includeAcceptHeader) {
    headers.push({ name: "Accept", value: "application/json" });
  }

  if (options.includeContentTypeHeader) {
    headers.push({ name: "Content-Type", value: "application/json" });
  }

  return headers;
}

function buildIssues(options: {
  token: string;
  tokenType: TokenType;
  warnWhitespace: boolean;
  warnBearerPrefix: boolean;
  warnJwtShape: boolean;
  warnSensitiveSharing: boolean;
  redactTokenInOutput: boolean;
}, tokenInfo: TokenInfo, preparedToken: { cleanedToken: string; hadBearerPrefix: boolean }) {
  const issues: Issue[] = [];

  if (options.warnWhitespace && tokenInfo.hasWhitespace) {
    issues.push({
      severity: "warning",
      title: "Whitespace inside token",
      message: "The token contains whitespace. Access tokens usually should not contain spaces or line breaks.",
    });
  }

  if (options.warnBearerPrefix && preparedToken.hadBearerPrefix) {
    issues.push({
      severity: "info",
      title: "Existing Bearer prefix detected",
      message: "The pasted value already included Bearer. The generator can remove it to avoid duplicate prefixes.",
    });
  }

  if (options.warnJwtShape && options.tokenType === "jwt" && !tokenInfo.looksJwt) {
    issues.push({
      severity: "warning",
      title: "Token does not look like a JWT",
      message: "JWTs usually have three dot-separated parts. This token may be opaque or incomplete.",
    });
  }

  if (options.warnSensitiveSharing && !options.redactTokenInOutput) {
    issues.push({
      severity: "high",
      title: "Token is visible in output",
      message: "Real tokens should not be shared in screenshots, public issues, or chat. Enable redaction before sharing.",
    });
  }

  if (preparedToken.cleanedToken.length < 8) {
    issues.push({
      severity: "info",
      title: "Short token value",
      message: "This looks like a placeholder or very short token. That is fine for documentation examples.",
    });
  }

  return issues;
}

function formatOutput(options: {
  endpointUrl: string;
  requestBody: string;
  outputMode: OutputMode;
  requestMethod: RequestMethod;
  includeRequestBody: boolean;
}, headers: Array<{ name: string; value: string }>, tokenInfo: TokenInfo, issues: Issue[]) {
  if (options.outputMode === "header") {
    return `${headers[0].name}: ${headers[0].value}`;
  }

  if (options.outputMode === "curl") {
    return buildCurl(options.endpointUrl, options.requestMethod, headers, options.includeRequestBody ? options.requestBody : "");
  }

  if (options.outputMode === "fetch") {
    return buildFetch(options.endpointUrl, options.requestMethod, headers, options.includeRequestBody ? options.requestBody : "");
  }

  if (options.outputMode === "http") {
    return buildHttpRequest(options.endpointUrl, options.requestMethod, headers, options.includeRequestBody ? options.requestBody : "");
  }

  if (options.outputMode === "json") {
    return JSON.stringify({ headers, tokenInfo, issues }, null, 2);
  }

  if (options.outputMode === "markdown") {
    const lines = [
      "# Bearer Token Header",
      "",
      "```http",
      `${headers[0].name}: ${headers[0].value}`,
      "```",
      "",
      "## Token notes",
      "",
      `- Length: ${tokenInfo.tokenLength}`,
      `- Shape: ${tokenInfo.tokenShape}`,
      `- JWT-like: ${tokenInfo.looksJwt ? "yes" : "no"}`,
    ];

    if (issues.length) {
      lines.push("", "## Review notes", "", ...issues.map((issue) => `- **${issue.title}:** ${issue.message}`));
    }

    return lines.join("\n");
  }

  const lines = [
    "# Bearer Token Header Checklist",
    "",
    `- [x] Authorization header generated.`,
    `- [${tokenInfo.hasWhitespace ? " " : "x"}] Token does not contain whitespace.`,
    `- [${tokenInfo.hasBearerPrefix ? " " : "x"}] Token value does not include a duplicate Bearer prefix.`,
    `- [${issues.every((issue) => issue.severity !== "high") ? "x" : " "}] Output is safe to share.`,
  ];

  if (issues.length) {
    lines.push("", "Notes:");
    issues.forEach((issue) => lines.push(`- ${issue.title}: ${issue.message}`));
  }

  return lines.join("\n");
}

function buildCurl(url: string, method: RequestMethod, headers: Array<{ name: string; value: string }>, body: string) {
  const endpoint = url.trim() || "https://api.example.com/v1/resource";
  const parts = [`curl -X ${method} ${shellQuote(endpoint)}`];

  headers.forEach((header) => {
    parts.push(`  -H ${shellQuote(`${header.name}: ${header.value}`)}`);
  });

  if (body.trim()) {
    parts.push(`  --data ${shellQuote(body)}`);
  }

  return parts.join(" \\\n");
}

function buildFetch(url: string, method: RequestMethod, headers: Array<{ name: string; value: string }>, body: string) {
  const endpoint = url.trim() || "https://api.example.com/v1/resource";
  const headerObject = headers.reduce<Record<string, string>>((acc, header) => {
    acc[header.name] = header.value;
    return acc;
  }, {});

  const lines = [
    `const response = await fetch(${JSON.stringify(endpoint)}, {`,
    `  method: ${JSON.stringify(method)},`,
    `  headers: ${JSON.stringify(headerObject, null, 2).replace(/\n/g, "\n  ")},`,
  ];

  if (body.trim()) {
    lines.push(`  body: ${JSON.stringify(body)},`);
  }

  lines.push("});");
  return lines.join("\n");
}

function buildHttpRequest(url: string, method: RequestMethod, headers: Array<{ name: string; value: string }>, body: string) {
  const endpoint = url.trim() || "https://api.example.com/v1/resource";
  const path = safePath(endpoint);
  const lines = [`${method} ${path} HTTP/1.1`];

  headers.forEach((header) => lines.push(`${header.name}: ${header.value}`));

  if (body.trim()) {
    lines.push("", body);
  }

  return lines.join("\n");
}

function safePath(url: string) {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url.startsWith("/") ? url : "/";
  }
}

function shellQuote(value: string) {
  return `'${value.replace(/'/g, "'\\''")}'`;
}

function getNotes(result: Result): Issue[] {
  const notes = [...result.issues];

  if (result.tokenInfo.tokenLength > 2000) {
    notes.push({
      severity: "info",
      title: "Very long token",
      message: "The token is unusually long. Generated snippets may be hard to read unless redacted.",
    });
  }

  if (result.outputLength > 10000) {
    notes.push({
      severity: "info",
      title: "Large output",
      message: "The generated request snippet is large. Consider removing the body or redacting the token.",
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
