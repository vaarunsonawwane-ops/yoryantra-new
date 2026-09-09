"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

type HeaderItem = {
  name: string;
  value: string;
};

const methods: Method[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

const exampleHeaders = `Authorization: Bearer eyJhbGciOi...
Content-Type: application/json`;

const exampleBody = `{
  "name": "Sneha",
  "role": "developer"
}`;

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'"'"'`)}'`;
}

function parseHeaders(input: string): { headers: HeaderItem[]; error: string } {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const parsed: HeaderItem[] = [];
  const tokenPattern = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;

  for (const line of lines) {
    const separator = line.indexOf(":");

    if (separator < 1) {
      return {
        headers: [],
        error: `Header line must contain a field name followed by a colon: ${line}`,
      };
    }

    const name = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();

    if (!tokenPattern.test(name)) {
      return {
        headers: [],
        error: `Header field name contains characters that are not valid in an HTTP field name: ${name}`,
      };
    }

    if (/\u0000|[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value)) {
      return {
        headers: [],
        error: `Header ${name} contains a control character that should not be placed in an HTTP field value.`,
      };
    }

    parsed.push({ name, value });
  }

  return { headers: parsed, error: "" };
}

function validateRequestUrl(input: string): { parsed: URL | null; error: string } {
  const trimmed = input.trim();
  if (!trimmed) return { parsed: null, error: "" };

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return {
        parsed: null,
        error: "This API-request builder accepts HTTP or HTTPS URLs.",
      };
    }
    return { parsed, error: "" };
  } catch {
    return {
      parsed: null,
      error: "Enter a complete HTTP or HTTPS URL, including the scheme.",
    };
  }
}

export default function ToolClient() {
  const [method, setMethod] = useState<Method>("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState("");
  const [body, setBody] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  const request = useMemo(() => {
    const urlCheck = validateRequestUrl(url);
    const headerCheck = parseHeaders(headers);

    if (urlCheck.error) {
      return { command: "", error: urlCheck.error, warnings: [] as string[] };
    }

    if (headerCheck.error) {
      return { command: "", error: headerCheck.error, warnings: [] as string[] };
    }

    if (!urlCheck.parsed) {
      return { command: "", error: "", warnings: [] as string[] };
    }

    if (body.includes("\u0000")) {
      return {
        command: "",
        error: "A shell command-line argument cannot contain a NUL character.",
        warnings: [] as string[],
      };
    }

    if (method === "HEAD" && body.length > 0) {
      return {
        command: "",
        error: "HEAD is generated with curl --head and cannot be combined with --data-raw in this builder.",
        warnings: [] as string[],
      };
    }

    const warnings: string[] = [];
    const sensitiveNames = new Set([
      "authorization",
      "cookie",
      "proxy-authorization",
      "x-api-key",
      "api-key",
    ]);

    if (headerCheck.headers.some((item) => sensitiveNames.has(item.name.toLowerCase()))) {
      warnings.push(
        "The command contains a credential-like header. Treat copied commands, shell history, screenshots, and chat messages as sensitive."
      );
    }

    if (urlCheck.parsed.protocol === "http:") {
      warnings.push(
        "The URL uses HTTP. Credentials and request data are not protected by TLS while travelling over the network."
      );
    }

    if (urlCheck.parsed.username || urlCheck.parsed.password) {
      warnings.push(
        "The URL contains user-info credentials. URLs are commonly logged, so header-based authentication is usually safer."
      );
    }

    if (method === "GET" && body.length > 0) {
      warnings.push(
        "A GET request body is unusual and is not consistently defined or handled across HTTP implementations."
      );
    }

    const urlArg = shellQuote(urlCheck.parsed.toString());
    const commandLines: string[] = ["curl"];

    if (method === "HEAD") {
      commandLines.push("  --head");
    } else if (!(method === "GET" && body.length === 0)) {
      commandLines.push(`  --request ${shellQuote(method)}`);
    }

    for (const header of headerCheck.headers) {
      commandLines.push(`  --header ${shellQuote(`${header.name}: ${header.value}`)}`);
    }

    if (body.length > 0) {
      commandLines.push(`  --data-raw ${shellQuote(body)}`);
    }

    commandLines.push(`  ${urlArg}`);

    return {
      command: commandLines.join(" \\\n"),
      error: "",
      warnings,
    };
  }, [method, url, headers, body]);

  const loadExample = () => {
    setMethod("POST");
    setUrl("https://api.example.com/users");
    setHeaders(exampleHeaders);
    setBody(exampleBody);
    setCopyStatus("");
  };

  const resetAll = () => {
    setMethod("GET");
    setUrl("");
    setHeaders("");
    setBody("");
    setCopyStatus("");
  };

  const copyCommand = async () => {
    if (!request.command) return;
    try {
      await navigator.clipboard.writeText(request.command);
      setCopyStatus("Copied");
    } catch {
      setCopyStatus("Copy failed");
    }
  };

  return (
    <ToolShell
      title="CURL Command Builder"
      description="Build POSIX-shell-safe curl commands from an HTTP method, URL, headers, and optional request body."
    >
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">HTTP Method</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="HTTP method">
          {methods.map((item) => {
            const active = method === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setMethod(item);
                  setCopyStatus("");
                }}
                aria-pressed={active}
                className={`min-h-10 rounded-lg border px-3 py-2 text-sm font-medium whitespace-nowrap transition ${
                  active
                    ? "border-[var(--green)] bg-[var(--green)] text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="curl-url">
          Request URL
        </label>
        <input
          id="curl-url"
          type="url"
          value={url}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setUrl(event.target.value);
            setCopyStatus("");
          }}
          placeholder="https://api.example.com/users"
          spellCheck={false}
          className="w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2 items-start">
        <div className="self-start">
          <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="curl-headers">
            Request Headers
          </label>
          <textarea
            id="curl-headers"
            value={headers}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
              setHeaders(event.target.value);
              setCopyStatus("");
            }}
            placeholder={exampleHeaders}
            spellCheck={false}
            className="min-h-[190px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Enter one HTTP field per line as <code>Name: value</code>. Header names are checked before output is generated.
          </p>
        </div>

        <div className="self-start">
          <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="curl-body">
            Request Body
          </label>
          <textarea
            id="curl-body"
            value={body}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
              setBody(event.target.value);
              setCopyStatus("");
            }}
            placeholder={exampleBody}
            spellCheck={false}
            className="min-h-[190px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Body text is passed with <code>--data-raw</code>. Add the intended Content-Type header yourself when the server expects one.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={copyCommand}
          disabled={!request.command}
          className="yoryantra-btn whitespace-nowrap"
        >
          Copy CURL Command
        </button>
        <button type="button" onClick={loadExample} className="yoryantra-btn-outline whitespace-nowrap">
          Load Example
        </button>
        <button type="button" onClick={resetAll} className="yoryantra-btn-outline whitespace-nowrap">
          Reset
        </button>
        {copyStatus && <span className="self-center text-sm text-gray-600">{copyStatus}</span>}
      </div>

      {request.error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {request.error}
        </div>
      )}

      {request.warnings.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-2 items-start">
          {request.warnings.map((warning) => (
            <div
              key={warning}
              className="self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900"
            >
              {warning}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <h3 className="mb-3 text-lg font-semibold text-gray-900">Generated POSIX-shell command</h3>
        <pre className="yoryantra-output min-h-[220px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {request.command || "Enter a valid HTTP or HTTPS URL to build the command."}
        </pre>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 items-start">
        <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">What the quoting protects</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            URL, header, method, and body arguments are single-quoted for POSIX shells. Embedded apostrophes are escaped so spaces, dollar signs, backticks, quotes, and shell metacharacters stay inside the argument instead of becoming shell syntax.
          </p>
        </div>
        <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">What it does not execute</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            The browser only builds text. It does not send the request, contact the endpoint, verify credentials, or confirm that the server accepts the method, headers, or body.
          </p>
        </div>
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">A curl command is also a shell command</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A request can be perfectly valid HTTP and still become unsafe or broken when pasted into a shell. Characters such as spaces, apostrophes, dollar signs, backticks, semicolons, and command substitutions have meaning to the shell before curl receives them. The generated command therefore quotes every user-controlled argument rather than interpolating raw text into double quotes.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The output targets POSIX-style shells such as sh, bash, and zsh. PowerShell and Windows Command Prompt use different quoting rules, so the same text should not be assumed to behave identically there.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Method selection changes curl behavior</h2>
          <div className="mt-4 space-y-3 text-gray-600 leading-relaxed">
            <p>
              A plain GET needs no explicit <code>--request GET</code>. HEAD is generated with <code>--head</code> because curl documents that <code>--request HEAD</code> changes only the verb and does not enable the normal HEAD response handling.
            </p>
            <p>
              When a body is present, the builder uses <code>--data-raw</code> so a leading <code>@</code> stays literal instead of being treated as a filename. curl does not infer JSON from the body; if the endpoint expects JSON, include an appropriate <code>Content-Type</code> header.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Credentials deserve a separate check before sharing</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Authorization headers, cookies, API keys, and credentials embedded in URLs can end up in terminal history, ticket systems, screenshots, logs, or chat messages. The builder warns when it sees several common credential-bearing header names, but it cannot recognize every proprietary secret format. Redact sensitive values before sharing a generated command.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Request limits worth knowing</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-600 leading-relaxed">
            <li>GET request bodies are unusual and may be ignored or rejected by intermediaries or servers.</li>
            <li>HEAD bodies are not generated because this builder uses curl&apos;s dedicated <code>--head</code> behavior.</li>
            <li>The browser does not test DNS, TLS, redirects, CORS, authentication, or the endpoint response.</li>
            <li>Multiline text can be represented in a POSIX single-quoted argument, but binary data containing NUL bytes cannot be passed as a normal shell argument.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Authoritative references</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            curl&apos;s own manual defines <code>--request</code>, <code>--head</code>, <code>--header</code>, and <code>--data-raw</code>, including the important differences between them. HTTP field-name syntax and request semantics are defined by the HTTP specifications.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <a className="font-medium text-[var(--green)] underline underline-offset-4" href="https://curl.se/docs/manpage.html" target="_blank" rel="noreferrer">curl manual</a>
            <a className="font-medium text-[var(--green)] underline underline-offset-4" href="https://www.rfc-editor.org/rfc/rfc9110.html" target="_blank" rel="noreferrer">RFC 9110: HTTP Semantics</a>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/curl-command-builder" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
