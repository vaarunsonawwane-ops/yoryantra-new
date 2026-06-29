"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "header" | "headersBlock" | "curl" | "fetch" | "axios" | "json" | "markdown";
type CharsetMode = "utf8" | "latin1";
type MaskMode = "masked" | "visible";

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type Result = {
  output: string;
  authorizationHeader: string;
  encodedCredentials: string;
  rawCredentialsPreview: string;
  usernameLength: number;
  passwordLength: number;
  issues: Issue[];
  authScheme: string;
};

export default function ToolClient() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("header");
  const [charsetMode, setCharsetMode] = useState<CharsetMode>("utf8");
  const [maskMode, setMaskMode] = useState<MaskMode>("masked");
  const [requestMethod, setRequestMethod] = useState("GET");
  const [includeAcceptJson, setIncludeAcceptJson] = useState(true);
  const [includeContentTypeJson, setIncludeContentTypeJson] = useState(false);
  const [warnRealSecrets, setWarnRealSecrets] = useState(true);
  const [warnEmptyPassword, setWarnEmptyPassword] = useState(true);
  const [warnColonUsername, setWarnColonUsername] = useState(true);
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
    if (!username.trim()) {
      setError("Please enter a username.");
      setResult(null);
      setOutput("");
      return;
    }

    try {
      const next = buildBasicAuth({
        username,
        password,
        endpoint,
        outputMode,
        charsetMode,
        maskMode,
        requestMethod,
        includeAcceptJson,
        includeContentTypeJson,
        warnRealSecrets,
        warnEmptyPassword,
        warnColonUsername,
      });

      setResult(next);
      setOutput(next.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate Basic Auth header.");
      setResult(null);
      setOutput("");
    }
  };

  const copyOutput = async () => {
    if (!output) return;

    await navigator.clipboard.writeText(output);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1400);
  };

  const loadExample = () => {
    setUsername("demo_user");
    setPassword("demo_password");
    setEndpoint("https://api.example.com/protected");
    setOutputMode("header");
    setCharsetMode("utf8");
    setMaskMode("masked");
    setRequestMethod("GET");
    setIncludeAcceptJson(true);
    setIncludeContentTypeJson(false);
    setWarnRealSecrets(true);
    setWarnEmptyPassword(true);
    setWarnColonUsername(true);
    clearResult();
  };

  const resetAll = () => {
    setUsername("");
    setPassword("");
    setEndpoint("");
    setOutputMode("header");
    setCharsetMode("utf8");
    setMaskMode("masked");
    setRequestMethod("GET");
    setIncludeAcceptJson(true);
    setIncludeContentTypeJson(false);
    setWarnRealSecrets(true);
    setWarnEmptyPassword(true);
    setWarnColonUsername(true);
    clearResult();
  };

  return (
    <ToolShell
      title="HTTP Basic Auth Header Generator"
      description="Generate HTTP Basic Authorization headers from username and password values. Create Basic Auth headers, cURL examples, Fetch snippets, Axios snippets, and JSON header objects in your browser."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Credentials</h3>

          <div className="mt-4 space-y-4">
            <InputField
              label="Username"
              value={username}
              onChange={(value) => {
                setUsername(value);
                clearResult();
              }}
              placeholder="demo_user"
              type="text"
            />

            <InputField
              label="Password"
              value={password}
              onChange={(value) => {
                setPassword(value);
                clearResult();
              }}
              placeholder="demo_password"
              type={maskMode === "masked" ? "password" : "text"}
            />

            <YoryantraSelect
              label="Password Display"
              value={maskMode}
              onChange={(value) => {
                setMaskMode(value as MaskMode);
                clearResult();
              }}
              options={[
                { label: "Masked", value: "masked" },
                { label: "Visible", value: "visible" },
              ]}
            />
          </div>


        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Request Output</h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <YoryantraSelect
              label="Output"
              value={outputMode}
              onChange={(value) => {
                setOutputMode(value as OutputMode);
                clearResult();
              }}
              options={[
                { label: "Authorization header", value: "header" },
                { label: "Headers block", value: "headersBlock" },
                { label: "cURL command", value: "curl" },
                { label: "Fetch snippet", value: "fetch" },
                { label: "Axios snippet", value: "axios" },
                { label: "JSON object", value: "json" },
                { label: "Markdown notes", value: "markdown" },
              ]}
            />

            <YoryantraSelect
              label="Charset"
              value={charsetMode}
              onChange={(value) => {
                setCharsetMode(value as CharsetMode);
                clearResult();
              }}
              options={[
                { label: "UTF-8", value: "utf8" },
                { label: "Latin-1 style", value: "latin1" },
              ]}
            />

            <YoryantraSelect
              label="Request Method"
              value={requestMethod}
              onChange={(value) => {
                setRequestMethod(value);
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

            <div className="md:col-span-2">
              <InputField
                label="Endpoint URL"
                value={endpoint}
                onChange={(value) => {
                  setEndpoint(value);
                  clearResult();
                }}
                placeholder="https://api.example.com/protected"
                type="text"
              />

              <p className="mt-2 text-sm text-gray-500">
                Optional. Used only for cURL, Fetch, and Axios output.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3 text-sm leading-relaxed text-amber-800">
        <span className="font-semibold text-amber-900">Safety note:</span>{" "}
        Basic Auth is Base64 encoded, not encrypted by itself. Avoid using real production passwords unless you need to.
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <CheckboxRow checked={includeAcceptJson} label="Include Accept: application/json in snippets" onChange={(checked) => { setIncludeAcceptJson(checked); clearResult(); }} />
          <CheckboxRow checked={includeContentTypeJson} label="Include Content-Type: application/json in snippets" onChange={(checked) => { setIncludeContentTypeJson(checked); clearResult(); }} />
          <CheckboxRow checked={warnRealSecrets} label="Show secret handling warning" onChange={(checked) => { setWarnRealSecrets(checked); clearResult(); }} />
          <CheckboxRow checked={warnEmptyPassword} label="Warn when password is empty" onChange={(checked) => { setWarnEmptyPassword(checked); clearResult(); }} />
          <CheckboxRow checked={warnColonUsername} label="Warn when username contains colon" onChange={(checked) => { setWarnColonUsername(checked); clearResult(); }} />
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Keep generated Authorization headers private. Basic Auth credentials can be decoded from the header value.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generateHeader} className="yoryantra-btn">
          Generate Basic Auth Header
        </button>

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

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Scheme" value={result.authScheme} />
          <SummaryCard label="Username Length" value={result.usernameLength.toLocaleString()} />
          <SummaryCard label="Password Length" value={result.passwordLength.toLocaleString()} />
          <SummaryCard label="Findings" value={result.issues.length.toLocaleString()} />
        </div>
      )}

      {result && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Header Preview</h3>

          <div className="mt-4 space-y-3">
            <InfoRow label="Authorization" value={result.authorizationHeader} />
            <InfoRow label="Encoded credentials" value={result.encodedCredentials} />
            <InfoRow label="Credential preview" value={result.rawCredentialsPreview} />
          </div>
        </div>
      )}

      {result && result.issues.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">Basic Auth findings</h3>

          <div className="mt-3 space-y-3">
            {result.issues.map((issue, index) => (
              <div key={`${issue.title}-${index}`}>
                <p className="text-sm font-semibold text-amber-900">{issue.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-amber-800">{issue.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900">Authorization header guidance</h3>

          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-blue-900">{note.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-blue-800">{note.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Output</h3>

          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">
          {output || "Generated Basic Auth output will appear here."}
        </pre>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Generating HTTP Basic Authorization Headers</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            HTTP Basic authentication sends a username and password as a Base64 encoded value inside the Authorization header. It is commonly used for quick API testing, internal tools, staging endpoints, legacy APIs, and simple protected resources.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This HTTP Basic Auth Header Generator creates the Authorization header and request snippets for cURL, Fetch, Axios, JSON, and plain header output directly in your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Using the Basic Auth Header Generator</h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter a username and password.</li>
            <li>Choose an output format such as plain header, cURL, Fetch, Axios, or JSON.</li>
            <li>Optionally add an endpoint URL and request method for request snippets.</li>
            <li>Review warnings about empty passwords, colons, and secret handling.</li>
            <li>Copy the generated output into your API client or test request.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Basic Auth Header Format</h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Authorization: Basic base64(username:password)`}
            </pre>
          </div>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The encoded part is not encryption. It is only a Base64 representation of the credential string.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Basic Auth Should Use HTTPS</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Because Basic Auth credentials can be decoded, Basic Auth should only be sent over HTTPS. Avoid logging generated headers, sharing screenshots with real credentials, or committing generated headers to code.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            For production APIs, token-based authentication or short-lived credentials may be safer depending on the system.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>

          <div className="mt-5 space-y-6">
            <Faq title="What does a Basic Auth header generator do?">
              It creates an Authorization header by joining username and password with a colon and Base64 encoding the result.
            </Faq>

            <Faq title="Is Basic Auth secure?">
              Basic Auth should only be used over HTTPS. The header value is Base64 encoded, not encrypted by itself.
            </Faq>

            <Faq title="Can I use this for cURL testing?">
              Yes. Choose cURL output to generate a ready-to-copy test command.
            </Faq>

            <Faq title="Should I paste real passwords here?">
              Avoid using real production passwords unless necessary. The tool runs locally, but careful secret handling is still a safer habit.
            </Faq>

            <Faq title="Is anything uploaded when I generate the header?">
              No. The header is generated directly in your browser.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/http-basic-auth-header-generator" />
        </div>
      </section>
    </ToolShell>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type: "text" | "password";
}) {
  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-gray-700">{label}</label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-[54px] w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
      />
    </div>
  );
}

function CheckboxRow({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[var(--light-gold)]"
      />
      {label}
    </label>
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 break-words font-mono text-sm text-gray-900">{value}</p>
    </div>
  );
}

function Faq({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600 leading-relaxed">{children}</p>
    </div>
  );
}

function buildBasicAuth(options: {
  username: string;
  password: string;
  endpoint: string;
  outputMode: OutputMode;
  charsetMode: CharsetMode;
  maskMode: MaskMode;
  requestMethod: string;
  includeAcceptJson: boolean;
  includeContentTypeJson: boolean;
  warnRealSecrets: boolean;
  warnEmptyPassword: boolean;
  warnColonUsername: boolean;
}): Result {
  const username = options.username.trim();
  const password = options.password;
  const rawCredentials = `${username}:${password}`;
  const encodedCredentials = encodeBasicAuth(rawCredentials, options.charsetMode);
  const authorizationHeader = `Authorization: Basic ${encodedCredentials}`;
  const issues = buildIssues(username, password, options);
  const base = {
    authorizationHeader,
    encodedCredentials,
    rawCredentialsPreview: `${username}:${password ? maskValue(password, options.maskMode) : ""}`,
    usernameLength: username.length,
    passwordLength: password.length,
    issues,
    authScheme: "Basic",
  };
  const output = formatOutput(base, options);

  return {
    ...base,
    output,
  };
}

function encodeBasicAuth(value: string, charsetMode: CharsetMode) {
  if (charsetMode === "latin1") {
    return btoa(value);
  }

  const bytes = new TextEncoder().encode(value);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

function maskValue(value: string, mode: MaskMode) {
  if (mode === "visible") return value;
  if (!value) return "";
  return "•".repeat(Math.min(value.length, 12));
}

function buildIssues(username: string, password: string, options: {
  warnRealSecrets: boolean;
  warnEmptyPassword: boolean;
  warnColonUsername: boolean;
}) {
  const issues: Issue[] = [];

  if (options.warnRealSecrets) {
    issues.push({
      severity: "info",
      title: "Basic Auth is not encryption",
      message: "The credential string is Base64 encoded. Send it only over HTTPS and avoid sharing real generated headers.",
    });
  }

  if (options.warnEmptyPassword && !password) {
    issues.push({
      severity: "warning",
      title: "Empty password",
      message: "The password is empty. Some systems allow this, but it is usually accidental.",
    });
  }

  if (options.warnColonUsername && username.includes(":")) {
    issues.push({
      severity: "warning",
      title: "Username contains colon",
      message: "Basic Auth separates username and password with a colon. A colon in the username can be ambiguous.",
    });
  }

  if (issues.length === 0) {
    issues.push({
      severity: "info",
      title: "Header generated",
      message: "The Basic Auth header is ready for the selected output format.",
    });
  }

  return issues;
}

function formatOutput(result: Omit<Result, "output">, options: {
  endpoint: string;
  outputMode: OutputMode;
  requestMethod: string;
  includeAcceptJson: boolean;
  includeContentTypeJson: boolean;
}) {
  const endpoint = options.endpoint.trim() || "https://api.example.com/protected";
  const extraHeaders = buildExtraHeaders(options.includeAcceptJson, options.includeContentTypeJson);
  const allHeaders = [result.authorizationHeader, ...extraHeaders];

  if (options.outputMode === "headersBlock") {
    return allHeaders.join("\n");
  }

  if (options.outputMode === "json") {
    const headerObject = Object.fromEntries(allHeaders.map((line) => {
      const separatorIndex = line.indexOf(":");
      return [line.slice(0, separatorIndex), line.slice(separatorIndex + 1).trim()];
    }));

    return JSON.stringify(headerObject, null, 2);
  }

  if (options.outputMode === "curl") {
    const headerFlags = allHeaders.map((line) => `  -H "${escapeShellDouble(line)}"`).join(" \\\n");
    return [`curl -X ${options.requestMethod} "${escapeShellDouble(endpoint)}"`, headerFlags].join(" \\\n");
  }

  if (options.outputMode === "fetch") {
    return [
      `fetch("${escapeJs(endpoint)}", {`,
      `  method: "${options.requestMethod}",`,
      "  headers: {",
      ...allHeaders.map((line) => {
        const separatorIndex = line.indexOf(":");
        const name = line.slice(0, separatorIndex);
        const value = line.slice(separatorIndex + 1).trim();
        return `    "${name}": "${escapeJs(value)}",`;
      }),
      "  },",
      "});",
    ].join("\n");
  }

  if (options.outputMode === "axios") {
    return [
      "axios({",
      `  method: "${options.requestMethod.toLowerCase()}",`,
      `  url: "${escapeJs(endpoint)}",`,
      "  headers: {",
      ...allHeaders.map((line) => {
        const separatorIndex = line.indexOf(":");
        const name = line.slice(0, separatorIndex);
        const value = line.slice(separatorIndex + 1).trim();
        return `    "${name}": "${escapeJs(value)}",`;
      }),
      "  },",
      "});",
    ].join("\n");
  }

  if (options.outputMode === "markdown") {
    return [
      "| Field | Value |",
      "| --- | --- |",
      `| Authorization | ${escapeMarkdown(result.authorizationHeader)} |`,
      `| Encoded credentials | ${escapeMarkdown(result.encodedCredentials)} |`,
      `| Credential preview | ${escapeMarkdown(result.rawCredentialsPreview)} |`,
      "",
      "## Findings",
      ...result.issues.map((issue) => `- **${issue.title}:** ${issue.message}`),
    ].join("\n");
  }

  return result.authorizationHeader;
}

function buildExtraHeaders(includeAcceptJson: boolean, includeContentTypeJson: boolean) {
  const headers: string[] = [];

  if (includeAcceptJson) {
    headers.push("Accept: application/json");
  }

  if (includeContentTypeJson) {
    headers.push("Content-Type: application/json");
  }

  return headers;
}

function escapeJs(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
}

function escapeShellDouble(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, "\\n");
}

function getNotes(result: Result) {
  const notes: { title: string; message: string }[] = [];

  notes.push({
    title: "Use HTTPS",
    message: "Basic Auth credentials should only be sent over HTTPS because the header value can be decoded.",
  });

  if (result.passwordLength > 0) {
    notes.push({
      title: "Do not log real headers",
      message: "Avoid saving generated Authorization headers in logs, screenshots, tickets, or source code.",
    });
  }

  notes.push({
    title: "Base64 is reversible",
    message: "Anyone with the header value can decode the username and password, so treat the generated output like a secret.",
  });

  return notes;
}
