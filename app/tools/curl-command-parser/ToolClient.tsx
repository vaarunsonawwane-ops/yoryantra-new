"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputFormat = "summary" | "json" | "http";

type ParsedPair = {
  key: string;
  value: string;
};

type ParsedHeader = {
  name: string;
  value: string;
  behavior: "set" | "remove" | "empty";
};

type ParsedCurlCommand = {
  method: string;
  url: string;
  urlPath: string;
  queryParams: ParsedPair[];
  headers: ParsedHeader[];
  cookies: ParsedPair[];
  body: string;
  bodyPreview: string;
  bodyKind: "none" | "data" | "json" | "multipart-form";
  formParts: string[];
  userAgent: string;
  username: string;
  password: string;
  usernameOnly: boolean;
  followRedirects: boolean;
  insecure: boolean;
  compressed: boolean;
  headOnly: boolean;
  outputFile: string;
  connectTimeout: string;
  maxTime: string;
  shellExpansionPossible: boolean;
};

type CurlWarning = {
  title: string;
  message: string;
};

const sampleCurl = `curl -X POST "https://api.example.com/users?role=admin&active=true" \\
  -H "Accept: application/json" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer example-token" \\
  -b "session_id=abc123; theme=light" \\
  --data-raw '{"name":"Yoryantra User","email":"user@example.com","active":true}'`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("summary");
  const [hideSensitiveValues, setHideSensitiveValues] = useState(true);
  const [decodeQueryParams, setDecodeQueryParams] = useState(true);
  const [prettyPrintBody, setPrettyPrintBody] = useState(true);
  const [parsedCommand, setParsedCommand] = useState<ParsedCurlCommand | null>(
    null
  );
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const warnings = useMemo(
    () => (parsedCommand ? getCurlWarnings(parsedCommand) : []),
    [parsedCommand]
  );

  const parseCurl = () => {
    if (!input.trim()) {
      setError("Please paste a cURL command.");
      setParsedCommand(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const nextParsed = parseCurlCommand(input, {
        decodeQueryParams,
        prettyPrintBody,
      });

      const nextOutput = formatParsedCurl(nextParsed, {
        outputFormat,
        hideSensitiveValues,
      });

      setParsedCommand(nextParsed);
      setOutput(nextOutput);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to parse this cURL command."
      );
      setParsedCommand(null);
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
    setInput(sampleCurl);
    setOutputFormat("summary");
    setHideSensitiveValues(true);
    setDecodeQueryParams(true);
    setPrettyPrintBody(true);
    setParsedCommand(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setOutputFormat("summary");
    setHideSensitiveValues(true);
    setDecodeQueryParams(true);
    setPrettyPrintBody(true);
    setParsedCommand(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="cURL Command Parser"
      description="Break an HTTP(S) cURL command into method, URL, headers, cookies, body data, and supported transfer flags."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          cURL Command
        </label>

        <textarea
          value={input}
          onChange={(event: { target: { value: string } }) => {
            setInput(event.target.value);
            setParsedCommand(null);
            setOutput("");
            setError("");
            setCopied(false);
          }}
          placeholder={sampleCurl}
          className="w-full min-h-[340px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste a cURL command copied from browser DevTools, API docs, terminal
          history, Postman, Insomnia, logs, or a debugging note.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Parsing Options
        </h3>

        <div className="mt-4 max-w-xl">
          <YoryantraSelect
            label="Output Format"
            value={outputFormat}
            onChange={(value: string) => {
              setOutputFormat(value as OutputFormat);
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
                label: "Raw HTTP Request",
                value: "http",
              },
            ]}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="self-start flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={hideSensitiveValues}
              onChange={(event: { target: { checked: boolean } }) => {
                setHideSensitiveValues(event.target.checked);
                setOutput("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Mask recognized secrets
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Mask recognized sensitive headers, cookies, query keys, URL credentials, and --user passwords in copied output. Body text is left unchanged.
              </span>
            </span>
          </label>

          <label className="self-start flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={decodeQueryParams}
              onChange={(event: { target: { checked: boolean } }) => {
                setDecodeQueryParams(event.target.checked);
                setParsedCommand(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Decode query values
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Percent-decode query names and values. A literal + stays + because URI queries do not universally treat it as a space.
              </span>
            </span>
          </label>

          <label className="self-start flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={prettyPrintBody}
              onChange={(event: { target: { checked: boolean } }) => {
                setPrettyPrintBody(event.target.checked);
                setParsedCommand(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Pretty print JSON body
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Format valid JSON for the on-page preview only; copied raw HTTP keeps the original body text.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={parseCurl} className="yoryantra-btn whitespace-nowrap">
          Parse cURL Command
        </button>

        <button onClick={loadExample} className="yoryantra-btn-outline whitespace-nowrap">
          Load Example
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline whitespace-nowrap">
          Reset
        </button>

        <Link href="/tools/curl-command-builder" className="yoryantra-btn-outline whitespace-nowrap">
          cURL Command Builder
        </Link>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {parsedCommand && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Method" value={parsedCommand.method} />
          <SummaryCard
            label="Headers"
            value={parsedCommand.headers.length.toLocaleString()}
          />
          <SummaryCard
            label="Query Params"
            value={parsedCommand.queryParams.length.toLocaleString()}
          />
          <SummaryCard
            label="Body Size"
            value={`${parsedCommand.body.length.toLocaleString()} chars`}
          />
        </div>
      )}

      {parsedCommand && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Request Overview
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            The parsed request details below help you quickly see what the cURL
            command is sending.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <DetailCard label="Method" value={parsedCommand.method} />
            <DetailCard
              label="URL"
              value={hideSensitiveValues ? redactUrl(parsedCommand.url) : parsedCommand.url}
            />
            <DetailCard label="Path" value={parsedCommand.urlPath || "(not found)"} />
            <DetailCard
              label="Follow Redirects"
              value={parsedCommand.followRedirects ? "Yes" : "No"}
            />
            <DetailCard
              label="Insecure TLS"
              value={parsedCommand.insecure ? "Yes" : "No"}
            />
            <DetailCard
              label="Compressed"
              value={parsedCommand.compressed ? "Yes" : "No"}
            />
          </div>
        </div>
      )}

      {parsedCommand && parsedCommand.queryParams.length > 0 && (
        <ParsedTable
          title="Query Parameters"
          description="Query string values parsed from the request URL."
          columns={["Name", "Value"]}
          rows={parsedCommand.queryParams.map((param) => [
            param.key,
            hideSensitiveValues && isSensitiveName(param.key)
              ? "[hidden]"
              : param.value,
          ])}
        />
      )}

      {parsedCommand && parsedCommand.headers.length > 0 && (
        <ParsedTable
          title="Headers"
          description="Headers parsed from -H, --header, user-agent, cookie, and referer options. curl header suppression and forced-empty values stay distinct."
          columns={["Header", "Behavior", "Value"]}
          rows={parsedCommand.headers.map((header) => [
            header.name,
            header.behavior === "remove" ? "Suppress" : header.behavior === "empty" ? "Send empty" : "Set",
            hideSensitiveValues && isSensitiveHeader(header.name) && header.behavior === "set"
              ? "[hidden]"
              : header.value || "—",
          ])}
        />
      )}

      {parsedCommand && parsedCommand.cookies.length > 0 && (
        <ParsedTable
          title="Cookies"
          description="Cookie values parsed from -b, --cookie, or Cookie headers."
          columns={["Cookie", "Value"]}
          rows={parsedCommand.cookies.map((cookie) => [
            cookie.key,
            hideSensitiveValues ? "[hidden]" : cookie.value,
          ])}
        />
      )}

      {parsedCommand && parsedCommand.body && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Request Body
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            {parsedCommand.bodyKind === "multipart-form"
              ? "Multipart form expressions are listed as entered. curl creates the MIME boundary and encoded body when it runs."
              : "Body data is preserved as request text. JSON pretty printing changes only this preview."}
          </p>

          <pre className="mt-4 yoryantra-output overflow-auto text-sm min-h-[220px] whitespace-pre-wrap break-words">
            {parsedCommand.bodyPreview}
          </pre>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mt-6 self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            cURL review notes
          </h3>

          <div className="mt-3 space-y-3">
            {warnings.map((warning) => (
              <div key={warning.title}>
                <p className="text-sm font-semibold text-amber-900">
                  {warning.title}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-amber-800">
                  {warning.message}
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
              className="yoryantra-btn-outline whitespace-nowrap text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">
          {output || "Parsed cURL output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Parsing runs in your browser and does not send the command to the target URL. Masking is intended for copied output; body text is not automatically scrubbed for secrets.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Reading the Request Hidden Inside a cURL Command
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A copied cURL command mixes shell quoting with curl options and HTTP details. Separating those layers matters: <code className="font-mono text-sm">-H</code> adds a header, <code className="font-mono text-sm">-d</code> contributes request data, <code className="font-mono text-sm">-L</code> changes redirect behavior, and <code className="font-mono text-sm">-k</code> changes TLS verification rather than the HTTP message itself.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The parser handles one HTTP or HTTPS transfer written with ordinary POSIX-style shell quoting. It deliberately stops on options whose request semantics cannot be reconstructed safely, instead of silently inventing a request.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What Is Parsed Exactly</h2>
          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Method selection from <code className="font-mono text-sm">-X</code>, body options, <code className="font-mono text-sm">-G</code>, and <code className="font-mono text-sm">-I</code>.</li>
            <li>HTTP(S) URL, raw path, query pairs, request headers, Cookie values, user agent, redirect and TLS flags.</li>
            <li><code className="font-mono text-sm">--data</code>, <code className="font-mono text-sm">--data-raw</code>, <code className="font-mono text-sm">--data-binary</code>, simple <code className="font-mono text-sm">--data-urlencode</code>, <code className="font-mono text-sm">--json</code>, and multipart form expressions.</li>
            <li>Separate connect and total timeout values when those options are present.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Where Text Parsing Has to Stop</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            curl can read request data from files, expand its own variables, perform several transfers in one command, negotiate authentication, and build multipart MIME bodies at runtime. A browser parser cannot reproduce those effects from command text alone. File-backed bodies, multiple URLs, <code className="font-mono text-sm">--next</code>, and unsupported transfer-changing options therefore produce an error rather than a plausible-looking but wrong result.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Shell variables, command substitution, globbing, PowerShell escaping, and Windows CMD quoting are not executed. If a command depends on them, the parsed text is not necessarily the request that a shell would eventually give curl.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Data Flags Are Not Interchangeable</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            curl joins repeated data options with an ampersand. <code className="font-mono text-sm">--data-raw</code> differs from <code className="font-mono text-sm">--data</code> because a leading <code className="font-mono text-sm">@</code> is literal instead of a file reference. <code className="font-mono text-sm">--json</code> is a curl shortcut that also supplies JSON Accept and Content-Type headers when you have not overridden them. Multipart <code className="font-mono text-sm">--form</code> is different again because curl generates a MIME boundary while sending the request.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Credentials Need Context</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            An explicit Authorization header can be shown as a header. <code className="font-mono text-sm">--user user:password</code> is different: it supplies credentials to curl's authentication machinery, so this page does not fabricate a Basic Authorization header from the plain <code className="font-mono text-sm">user:password</code> text.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Masking covers recognized header names, cookies, credential fields, URL user information, and sensitive-looking query keys. It cannot reliably discover secrets hidden in arbitrary request-body text. Replace real credentials before sharing the original command.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Empty and Suppressed Headers Are Different in curl</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            curl gives <code className="font-mono text-sm">-H "Name:"</code> and <code className="font-mono text-sm">-H "Name;"</code> different meanings. The colon form suppresses an internal header; the semicolon form sends that header with an empty value. The parsed header table keeps that distinction because collapsing both to an empty string would change the request model.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Primary References</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            curl's current option behavior is documented in the <a href="https://curl.se/docs/manpage.html" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-2">official curl man page</a>. HTTP method and field semantics are defined by <a href="https://www.rfc-editor.org/rfc/rfc9110.html" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-2">RFC 9110</a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/curl-command-parser" />
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

function parseCurlCommand(
  input: string,
  options: {
    decodeQueryParams: boolean;
    prettyPrintBody: boolean;
  }
): ParsedCurlCommand {
  const tokenized = tokenizeShellCommand(cleanCurlLineContinuations(input));
  const tokens = tokenized.tokens;

  if (tokens.length === 0) {
    throw new Error("The cURL command is empty.");
  }

  if (tokens[0].toLowerCase() !== "curl") {
    throw new Error("Command should start with curl.");
  }

  let method = "";
  let url = "";
  let userAgent = "";
  let username = "";
  let password = "";
  let usernameOnly = false;
  let followRedirects = false;
  let insecure = false;
  let compressed = false;
  let headOnly = false;
  let useGet = false;
  let outputFile = "";
  let connectTimeout = "";
  let maxTime = "";
  const headers: ParsedHeader[] = [];
  const cookies: ParsedPair[] = [];
  const dataParts: string[] = [];
  const formParts: string[] = [];
  let jsonMode = false;

  const setUrl = (nextUrl: string) => {
    if (!/^https?:\/\//i.test(nextUrl)) {
      throw new Error("This parser accepts one HTTP or HTTPS URL.");
    }
    if (url && url !== nextUrl) {
      throw new Error("Multiple URLs are not supported in one parse. Split the curl transfers first.");
    }
    url = nextUrl;
  };

  const addData = (flag: string, value: string) => {
    if ((flag === "-d" || flag === "--data" || flag === "--data-binary") && value.startsWith("@")) {
      throw new Error(`${flag} refers to a local file. File contents cannot be reconstructed from command text.`);
    }
    if (flag === "--data-urlencode") {
      dataParts.push(encodeCurlDataUrlencode(value));
      return;
    }
    dataParts.push(value);
  };

  const ignoredNoRequestEffect = new Set([
    "-s", "--silent", "-S", "--show-error", "-v", "--verbose", "-f", "--fail",
    "--fail-with-body", "--no-progress-meter", "-#", "--progress-bar", "-i", "--show-headers",
  ]);

  for (let index = 1; index < tokens.length; index += 1) {
    const token = tokens[index];

    if (ignoredNoRequestEffect.has(token)) continue;
    if (token === "--next") {
      throw new Error("--next starts another transfer. Parse each transfer separately.");
    }

    if (token === "-X" || token === "--request") {
      method = readRequiredValue(tokens, index, token);
      validateMethodToken(method);
      index += 1;
      continue;
    }
    if (token.startsWith("--request=")) {
      method = token.slice("--request=".length);
      validateMethodToken(method);
      continue;
    }
    if (token.startsWith("-X") && token.length > 2) {
      method = token.slice(2);
      validateMethodToken(method);
      continue;
    }

    if (token === "--url") {
      setUrl(readRequiredValue(tokens, index, token));
      index += 1;
      continue;
    }
    if (token.startsWith("--url=")) {
      setUrl(token.slice("--url=".length));
      continue;
    }

    if (token === "-H" || token === "--header") {
      const headerValue = readRequiredValue(tokens, index, token);
      const parsedHeader = parseHeaderValue(headerValue);
      headers.push(parsedHeader);
      if (parsedHeader.name.toLowerCase() === "cookie") cookies.push(...parseCookieString(parsedHeader.value));
      index += 1;
      continue;
    }
    if (token.startsWith("-H") && token.length > 2) {
      const parsedHeader = parseHeaderValue(token.slice(2));
      headers.push(parsedHeader);
      if (parsedHeader.name.toLowerCase() === "cookie") cookies.push(...parseCookieString(parsedHeader.value));
      continue;
    }
    if (token.startsWith("--header=")) {
      const parsedHeader = parseHeaderValue(token.slice("--header=".length));
      headers.push(parsedHeader);
      if (parsedHeader.name.toLowerCase() === "cookie") cookies.push(...parseCookieString(parsedHeader.value));
      continue;
    }

    const bodyFlag = normalizedBodyFlag(token);
    if (bodyFlag) {
      const value = readRequiredValue(tokens, index, token);
      addData(bodyFlag, value);
      index += 1;
      continue;
    }
    const attachedBody = readAttachedBodyFlag(token);
    if (attachedBody) {
      addData(attachedBody.flag, attachedBody.value);
      continue;
    }

    if (token === "--json") {
      const value = readRequiredValue(tokens, index, token);
      if (value.startsWith("@")) throw new Error("--json refers to a local file. File contents are not available to the browser parser.");
      dataParts.push(value);
      jsonMode = true;
      index += 1;
      continue;
    }
    if (token.startsWith("--json=")) {
      const value = token.slice("--json=".length);
      if (value.startsWith("@")) throw new Error("--json refers to a local file. File contents are not available to the browser parser.");
      dataParts.push(value);
      jsonMode = true;
      continue;
    }

    if (token === "-F" || token === "--form") {
      formParts.push(readRequiredValue(tokens, index, token));
      index += 1;
      continue;
    }
    if (token.startsWith("-F") && token.length > 2) {
      formParts.push(token.slice(2));
      continue;
    }
    if (token.startsWith("--form=")) {
      formParts.push(token.slice("--form=".length));
      continue;
    }

    if (token === "-G" || token === "--get") {
      useGet = true;
      continue;
    }

    if (token === "-b" || token === "--cookie") {
      const cookieValue = readRequiredValue(tokens, index, token);
      if (cookieValue.startsWith("@")) throw new Error("Cookie files are not supported because their contents are not present in the command text.");
      cookies.push(...parseCookieString(cookieValue));
      headers.push({ name: "Cookie", value: cookieValue, behavior: "set" });
      index += 1;
      continue;
    }
    if (token.startsWith("--cookie=")) {
      const cookieValue = token.slice("--cookie=".length);
      if (cookieValue.startsWith("@")) throw new Error("Cookie files are not supported because their contents are not present in the command text.");
      cookies.push(...parseCookieString(cookieValue));
      headers.push({ name: "Cookie", value: cookieValue, behavior: "set" });
      continue;
    }
    if (token.startsWith("-b") && token.length > 2) {
      const cookieValue = token.slice(2);
      cookies.push(...parseCookieString(cookieValue));
      headers.push({ name: "Cookie", value: cookieValue, behavior: "set" });
      continue;
    }

    if (token === "-A" || token === "--user-agent") {
      userAgent = readRequiredValue(tokens, index, token);
      replaceSingletonHeader(headers, { name: "User-Agent", value: userAgent, behavior: "set" });
      index += 1;
      continue;
    }
    if (token.startsWith("--user-agent=")) {
      userAgent = token.slice("--user-agent=".length);
      replaceSingletonHeader(headers, { name: "User-Agent", value: userAgent, behavior: "set" });
      continue;
    }
    if (token.startsWith("-A") && token.length > 2) {
      userAgent = token.slice(2);
      replaceSingletonHeader(headers, { name: "User-Agent", value: userAgent, behavior: "set" });
      continue;
    }

    if (token === "-u" || token === "--user") {
      const authValue = readRequiredValue(tokens, index, token);
      ({ username, password, usernameOnly } = splitCurlUser(authValue));
      index += 1;
      continue;
    }
    if (token.startsWith("--user=")) {
      ({ username, password, usernameOnly } = splitCurlUser(token.slice("--user=".length)));
      continue;
    }
    if (token.startsWith("-u") && token.length > 2) {
      ({ username, password, usernameOnly } = splitCurlUser(token.slice(2)));
      continue;
    }

    if (token === "-e" || token === "--referer") {
      replaceSingletonHeader(headers, { name: "Referer", value: readRequiredValue(tokens, index, token), behavior: "set" });
      index += 1;
      continue;
    }
    if (token.startsWith("--referer=")) {
      replaceSingletonHeader(headers, { name: "Referer", value: token.slice("--referer=".length), behavior: "set" });
      continue;
    }

    if (token === "-L" || token === "--location") { followRedirects = true; continue; }
    if (token === "-k" || token === "--insecure") { insecure = true; continue; }
    if (token === "--compressed") { compressed = true; continue; }
    if (token === "-I" || token === "--head") { headOnly = true; continue; }

    if (token === "-o" || token === "--output") {
      outputFile = readRequiredValue(tokens, index, token);
      index += 1;
      continue;
    }
    if (token.startsWith("--output=")) { outputFile = token.slice("--output=".length); continue; }

    if (token === "--connect-timeout") {
      connectTimeout = readRequiredValue(tokens, index, token);
      index += 1;
      continue;
    }
    if (token.startsWith("--connect-timeout=")) { connectTimeout = token.slice("--connect-timeout=".length); continue; }
    if (token === "-m" || token === "--max-time") {
      maxTime = readRequiredValue(tokens, index, token);
      index += 1;
      continue;
    }
    if (token.startsWith("--max-time=")) { maxTime = token.slice("--max-time=".length); continue; }

    if (/^https?:\/\//i.test(token)) {
      setUrl(token);
      continue;
    }

    if (token.startsWith("-")) {
      throw new Error(`Unsupported cURL option: ${token}. The parser stops instead of guessing its request semantics.`);
    }

    throw new Error(`Unexpected cURL argument: ${token}`);
  }

  if (!url) throw new Error("Could not find an HTTP or HTTPS URL in the cURL command.");
  if (dataParts.length > 0 && formParts.length > 0) throw new Error("curl data options and --form are different body modes and should not be combined here.");
  if (headOnly && (dataParts.length > 0 || formParts.length > 0)) throw new Error("--head cannot be combined with request body options in this parser.");

  let bodyKind: ParsedCurlCommand["bodyKind"] = "none";
  let body = "";
  if (formParts.length > 0) {
    bodyKind = "multipart-form";
    body = formParts.join("\n");
  } else if (dataParts.length > 0) {
    bodyKind = jsonMode ? "json" : "data";
    body = dataParts.join("&");
  }

  if (jsonMode) {
    addHeaderIfMissing(headers, "Content-Type", "application/json");
    addHeaderIfMissing(headers, "Accept", "application/json");
  } else if (dataParts.length > 0) {
    addHeaderIfMissing(headers, "Content-Type", "application/x-www-form-urlencoded");
  }

  if (useGet && dataParts.length > 0) {
    url = appendQueryString(url, body);
    body = "";
    bodyKind = "none";
  }

  const finalMethod = method || (headOnly ? "HEAD" : useGet ? "GET" : body || formParts.length > 0 ? "POST" : "GET");
  const urlDetails = parseUrlDetails(url, options.decodeQueryParams);

  return {
    method: finalMethod,
    url,
    urlPath: urlDetails.path,
    queryParams: urlDetails.queryParams,
    headers,
    cookies,
    body,
    bodyPreview: bodyKind === "json" && options.prettyPrintBody ? prettyJson(body) : body,
    bodyKind,
    formParts,
    userAgent,
    username,
    password,
    usernameOnly,
    followRedirects,
    insecure,
    compressed,
    headOnly,
    outputFile,
    connectTimeout,
    maxTime,
    shellExpansionPossible: tokenized.shellExpansionPossible,
  };
}

function cleanCurlLineContinuations(input: string) {
  return input.replace(/\\\r?\n/g, " ").replace(/\r\n/g, "\n").trim();
}

function tokenizeShellCommand(input: string) {
  const tokens: string[] = [];
  let current = "";
  let quote: "'" | '"' | null = null;
  let shellExpansionPossible = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (quote === "'") {
      if (char === "'") quote = null;
      else current += char;
      continue;
    }

    if (quote === '"') {
      if (char === '"') { quote = null; continue; }
      if (char === "\\") {
        const next = input[index + 1];
        if (next === '"' || next === "\\" || next === "$" || next === "`" || next === "\n") {
          if (next !== "\n") current += next;
          index += 1;
          continue;
        }
        current += "\\";
        continue;
      }
      if (char === "$" || char === "`") shellExpansionPossible = true;
      current += char;
      continue;
    }

    if (char === "'") { quote = "'"; continue; }
    if (char === '"') { quote = '"'; continue; }
    if (char === "\\") {
      if (index + 1 >= input.length) { current += "\\"; continue; }
      current += input[index + 1];
      index += 1;
      continue;
    }
    if (char === "$" || char === "`" || char === "*" || char === "?") shellExpansionPossible = true;
    if (/\s/.test(char)) {
      if (current) { tokens.push(current); current = ""; }
      continue;
    }
    current += char;
  }

  if (quote) throw new Error("The cURL command has an unclosed quote.");
  if (current) tokens.push(current);
  return { tokens, shellExpansionPossible };
}

function readRequiredValue(tokens: string[], index: number, flag: string) {
  const value = tokens[index + 1];
  if (value === undefined) throw new Error(`${flag} needs a value.`);
  return value;
}

function validateMethodToken(value: string) {
  if (!value || !/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(value)) {
    throw new Error("The custom HTTP method contains characters that are not valid in an HTTP token.");
  }
}

function parseHeaderValue(value: string): ParsedHeader {
  if (/\r|\n/.test(value)) throw new Error("Header values cannot contain CR or LF characters.");
  if (value.startsWith("@")) throw new Error("Header files are not supported because their contents are not present in the command text.");

  const colonIndex = value.indexOf(":");
  if (colonIndex >= 0) {
    const name = value.slice(0, colonIndex);
    const headerValue = value.slice(colonIndex + 1).trim();
    validateHeaderName(name);
    return { name, value: headerValue, behavior: headerValue ? "set" : "remove" };
  }

  if (value.endsWith(";")) {
    const name = value.slice(0, -1);
    validateHeaderName(name);
    return { name, value: "", behavior: "empty" };
  }

  throw new Error(`Header must use name:value, name: to suppress an internal header, or name; to send an empty value: ${value}`);
}

function validateHeaderName(name: string) {
  if (!/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(name)) throw new Error(`Invalid HTTP header name: ${name || "(empty)"}`);
}

function normalizedBodyFlag(token: string) {
  if (token === "-d") return "-d";
  if (["--data", "--data-raw", "--data-binary", "--data-urlencode"].includes(token)) return token;
  return "";
}

function readAttachedBodyFlag(token: string): { flag: string; value: string } | null {
  if (token.startsWith("--data=")) return { flag: "--data", value: token.slice(7) };
  if (token.startsWith("--data-raw=")) return { flag: "--data-raw", value: token.slice(11) };
  if (token.startsWith("--data-binary=")) return { flag: "--data-binary", value: token.slice(14) };
  if (token.startsWith("--data-urlencode=")) return { flag: "--data-urlencode", value: token.slice(17) };
  if (token.startsWith("-d") && token.length > 2) return { flag: "-d", value: token.slice(2) };
  return null;
}

function encodeCurlDataUrlencode(value: string) {
  if (value.startsWith("@") || (/^[^=]+@/.test(value) && !value.includes("="))) {
    throw new Error("File-backed --data-urlencode values are not supported because the file contents are unavailable.");
  }
  if (value.startsWith("=")) return encodeURIComponent(value.slice(1));
  const equalsIndex = value.indexOf("=");
  if (equalsIndex >= 0) {
    const name = value.slice(0, equalsIndex);
    return `${name}=${encodeURIComponent(value.slice(equalsIndex + 1))}`;
  }
  return encodeURIComponent(value);
}

function splitCurlUser(value: string) {
  const colonIndex = value.indexOf(":");
  if (colonIndex === -1) return { username: value, password: "", usernameOnly: true };
  return { username: value.slice(0, colonIndex), password: value.slice(colonIndex + 1), usernameOnly: false };
}

function parseCookieString(value: string): ParsedPair[] {
  return value.split(";").map((part) => part.trim()).filter(Boolean).map((part) => {
    const equalsIndex = part.indexOf("=");
    return equalsIndex === -1
      ? { key: part, value: "" }
      : { key: part.slice(0, equalsIndex).trim(), value: part.slice(equalsIndex + 1).trim() };
  });
}

function parseUrlDetails(url: string, decodeQueryParams: boolean) {
  const parsedUrl = new URL(url);
  const rawQuery = parsedUrl.search.startsWith("?") ? parsedUrl.search.slice(1) : "";
  const queryParams = rawQuery ? rawQuery.split("&").map((part) => {
    const equalsIndex = part.indexOf("=");
    const rawKey = equalsIndex === -1 ? part : part.slice(0, equalsIndex);
    const rawValue = equalsIndex === -1 ? "" : part.slice(equalsIndex + 1);
    return {
      key: decodeQueryParams ? safePercentDecode(rawKey) : rawKey,
      value: decodeQueryParams ? safePercentDecode(rawValue) : rawValue,
    };
  }) : [];
  return { path: `${parsedUrl.pathname}${parsedUrl.search}`, queryParams };
}

function appendQueryString(url: string, query: string) {
  if (!query) return url;
  const hashIndex = url.indexOf("#");
  const beforeHash = hashIndex === -1 ? url : url.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : url.slice(hashIndex);
  return `${beforeHash}${beforeHash.includes("?") ? "&" : "?"}${query}${hash}`;
}

function prettyJson(body: string) {
  try { return JSON.stringify(JSON.parse(body), null, 2); } catch { return body; }
}

function addHeaderIfMissing(headers: ParsedHeader[], name: string, value: string) {
  if (!headers.some((header) => header.name.toLowerCase() === name.toLowerCase())) {
    headers.push({ name, value, behavior: "set" });
  }
}

function replaceSingletonHeader(headers: ParsedHeader[], nextHeader: ParsedHeader) {
  const normalized = nextHeader.name.toLowerCase();
  for (let index = headers.length - 1; index >= 0; index -= 1) {
    if (headers[index].name.toLowerCase() === normalized) headers.splice(index, 1);
  }
  headers.push(nextHeader);
}

function formatParsedCurl(
  parsed: ParsedCurlCommand,
  options: { outputFormat: OutputFormat; hideSensitiveValues: boolean }
) {
  const visibleUrl = options.hideSensitiveValues ? redactUrl(parsed.url) : parsed.url;
  const visibleQuery = parsed.queryParams.map((pair) => ({
    ...pair,
    value: options.hideSensitiveValues && isSensitiveName(pair.key) ? "[hidden]" : pair.value,
  }));
  const visibleHeaders = parsed.headers.map((header) => ({
    ...header,
    value: options.hideSensitiveValues && isSensitiveHeader(header.name) ? "[hidden]" : header.value,
  }));
  const visibleCookies = parsed.cookies.map((cookie) => ({
    ...cookie,
    value: options.hideSensitiveValues ? "[hidden]" : cookie.value,
  }));

  if (options.outputFormat === "json") {
    return JSON.stringify({
      method: parsed.method,
      url: visibleUrl,
      path: parsed.urlPath,
      queryParams: visibleQuery,
      headers: visibleHeaders,
      cookies: visibleCookies,
      body: parsed.body,
      bodyKind: parsed.bodyKind,
      formParts: parsed.formParts,
      username: parsed.username,
      password: options.hideSensitiveValues && parsed.password ? "[hidden]" : parsed.password,
      followRedirects: parsed.followRedirects,
      insecure: parsed.insecure,
      compressed: parsed.compressed,
      headOnly: parsed.headOnly,
      outputFile: parsed.outputFile,
      connectTimeout: parsed.connectTimeout,
      maxTime: parsed.maxTime,
    }, null, 2);
  }

  if (options.outputFormat === "http") return toRawHTTPRequest(parsed, options.hideSensitiveValues);

  return [
    `Method: ${parsed.method}`,
    `URL: ${visibleUrl}`,
    `Path: ${parsed.urlPath}`,
    `Headers: ${parsed.headers.length}`,
    `Query parameters: ${parsed.queryParams.length}`,
    `Cookies: ${parsed.cookies.length}`,
    `Body mode: ${parsed.bodyKind}`,
    `Body size: ${parsed.body.length.toLocaleString()} characters`,
    `Follow redirects: ${parsed.followRedirects ? "yes" : "no"}`,
    `Insecure TLS: ${parsed.insecure ? "yes" : "no"}`,
    parsed.connectTimeout ? `Connect timeout: ${parsed.connectTimeout}` : "",
    parsed.maxTime ? `Maximum transfer time: ${parsed.maxTime}` : "",
    parsed.outputFile ? `Output file: ${parsed.outputFile}` : "",
    parsed.username ? `curl --user name: ${parsed.username}` : "",
    "",
    "Headers:",
    ...visibleHeaders.map((header) => formatHeaderForSummary(header)),
    visibleQuery.length ? "\nQuery Parameters:" : "",
    ...visibleQuery.map((param) => `${param.key}=${param.value}`),
    parsed.body ? "\nBody:" : "",
    parsed.body || "",
  ].filter(Boolean).join("\n");
}

function toRawHTTPRequest(parsed: ParsedCurlCommand, hideSensitiveValues: boolean) {
  if (parsed.bodyKind === "multipart-form") {
    throw new Error("Raw HTTP output is unavailable for --form because curl generates the multipart boundary and encoded MIME body at runtime.");
  }
  const url = new URL(parsed.url);
  const requestLine = `${parsed.method} ${url.pathname}${url.search} HTTP/1.1`;
  const hostHeaders = parsed.headers.filter((header) => header.name.toLowerCase() === "host");
  if (hostHeaders.length > 1) {
    throw new Error("Raw HTTP output stops when multiple custom Host directives are present because curl's internal-header replacement cannot be reconstructed safely from a simplified request preview.");
  }
  const hostHeader = hostHeaders[0];
  const visibleHeaders = parsed.headers
    .filter((header) => header.name.toLowerCase() !== "host" && header.behavior !== "remove")
    .map((header) => {
      const value = hideSensitiveValues && isSensitiveHeader(header.name) && header.behavior === "set" ? "[hidden]" : header.value;
      return `${header.name}:${header.behavior === "empty" ? "" : ` ${value}`}`;
    });
  const hostLine = !hostHeader
    ? [`Host: ${url.host}`]
    : hostHeader.behavior === "remove"
      ? []
      : hostHeader.behavior === "empty"
        ? ["Host:"]
        : [`Host: ${hostHeader.value}`];
  return [requestLine, ...hostLine, ...visibleHeaders, ...(parsed.body ? ["", parsed.body] : [""])].join("\r\n");
}

function formatHeaderForSummary(header: ParsedHeader) {
  if (header.behavior === "remove") return `${header.name}: [suppressed by curl]`;
  if (header.behavior === "empty") return `${header.name}: [empty value]`;
  return `${header.name}: ${header.value}`;
}

function getCurlWarnings(parsed: ParsedCurlCommand): CurlWarning[] {
  const warnings: CurlWarning[] = [];
  if (parsed.headers.some((header) => isSensitiveHeader(header.name) && header.behavior === "set") || parsed.cookies.length || parsed.password) {
    warnings.push({ title: "Credentials or session data found", message: "Masking can hide recognized headers, cookies, query keys, and --user passwords in copied output. Arbitrary body text is not inspected for secrets." });
  }
  if (parsed.username) {
    warnings.push({ title: "--user is not an Authorization header", message: parsed.usernameOnly ? "Only a username was supplied. curl can prompt for the password when it runs, so no password can be reconstructed here." : "curl uses --user as authentication credentials. The actual Authorization exchange depends on the selected authentication method and server behavior, so no Basic header is fabricated." });
  }
  if (parsed.headers.some((header) => header.behavior !== "set")) {
    warnings.push({ title: "Custom header suppression is significant", message: `With -H, "Name:" suppresses curl\'s internal header while "Name;" forces an empty header value. Those are kept distinct instead of being treated as the same header.` });
  }
  if (parsed.insecure) warnings.push({ title: "TLS verification disabled", message: "-k / --insecure tells curl not to verify the peer certificate. That weakens identity checks and should not be copied into production requests without a specific reason." });
  if (parsed.method.toUpperCase() === "GET" && parsed.body) warnings.push({ title: "GET request carries a body", message: "HTTP does not assign generally applicable semantics to content in a GET request, and some implementations reject or ignore it." });
  if (parsed.bodyKind === "multipart-form") warnings.push({ title: "Multipart bytes are runtime-generated", message: "The listed form expressions describe curl input. The exact Content-Type boundary and MIME body do not exist until curl builds the transfer." });
  if (parsed.shellExpansionPossible) warnings.push({ title: "Shell expansion may change the command", message: "Variables, command substitution, globbing, and shell-specific escaping are not executed here. Parse the fully expanded command when exact request text matters." });
  return warnings;
}

function isSensitiveHeader(name: string) {
  const normalized = name.toLowerCase();
  return normalized === "authorization" || normalized === "cookie" || normalized === "proxy-authorization" || isSensitiveName(normalized);
}

function isSensitiveName(name: string) {
  return /(?:^|[-_.])(token|secret|api[-_]?key|key|password|passwd|session|credential|auth)(?:$|[-_.])/i.test(name) || /authorization/i.test(name);
}

function redactUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.username) url.username = "hidden";
    if (url.password) url.password = "hidden";
    const keys = Array.from(url.searchParams.keys());
    keys.forEach((key) => {
      if (isSensitiveName(key)) url.searchParams.set(key, "[hidden]");
    });
    return url.toString();
  } catch {
    return value;
  }
}

function safePercentDecode(value: string) {
  try { return decodeURIComponent(value); } catch { return value; }
}

