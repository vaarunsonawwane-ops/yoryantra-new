"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputFormat = "summary" | "json" | "http";

type ParsedPair = {
  key: string;
  value: string;
};

type ParsedHeader = {
  name: string;
  value: string;
};

type ParsedCurlCommand = {
  method: string;
  url: string;
  urlPath: string;
  queryParams: ParsedPair[];
  headers: ParsedHeader[];
  cookies: ParsedPair[];
  body: string;
  userAgent: string;
  username: string;
  password: string;
  followRedirects: boolean;
  insecure: boolean;
  compressed: boolean;
  headOnly: boolean;
  outputFile: string;
  timeout: string;
  rawTokens: string[];
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
      description="Parse cURL commands into method, URL, headers, cookies, query parameters, body, and readable request details directly in your browser."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          cURL Command
        </label>

        <textarea
          value={input}
          onChange={(event) => {
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
            onChange={(value) => {
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
          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={hideSensitiveValues}
              onChange={(event) => {
                setHideSensitiveValues(event.target.checked);
                setOutput("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Hide sensitive values
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Hide Authorization, cookies, tokens, API keys, and password-like
                values in copied output.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={decodeQueryParams}
              onChange={(event) => {
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
                Convert URL-encoded query text like %20 into readable text.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={prettyPrintBody}
              onChange={(event) => {
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
                Format JSON-looking request bodies when possible.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={parseCurl} className="yoryantra-btn">
          Parse cURL Command
        </button>

        <button onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>

        <Link href="/tools/curl-command-builder" className="yoryantra-btn-outline">
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
            <DetailCard label="URL" value={parsedCommand.url || "(not found)"} />
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
            param.value,
          ])}
        />
      )}

      {parsedCommand && parsedCommand.headers.length > 0 && (
        <ParsedTable
          title="Headers"
          description="Headers parsed from -H, --header, user-agent, cookie, and auth options."
          columns={["Header", "Value"]}
          rows={parsedCommand.headers.map((header) => [
            header.name,
            hideSensitiveValues && isSensitiveHeader(header.name)
              ? "[hidden]"
              : header.value,
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
            Body data parsed from --data, --data-raw, --data-binary, -d, or
            similar cURL body flags.
          </p>

          <pre className="mt-4 yoryantra-output overflow-auto text-sm min-h-[220px] whitespace-pre-wrap break-words">
            {parsedCommand.body}
          </pre>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
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
              className="yoryantra-btn-outline text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">
          {output || "Parsed cURL output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        cURL parsing happens directly in your browser. Your command, headers,
        cookies, and body are not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Parsing cURL Commands for API Debugging
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            cURL commands are copied from browser DevTools, API docs, terminals,
            logs, Postman, Insomnia, and support tickets all the time. They are
            useful, but long commands can be hard to read when headers, cookies,
            body data, and URLs are packed into one line.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This cURL Command Parser breaks a command into readable request
            details. You can inspect the method, URL, query parameters, headers,
            cookies, body, and common cURL flags before using the request for
            debugging or documentation.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reading a cURL Command Without Manually Splitting It
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste a cURL command into the input box.</li>
            <li>Choose whether sensitive values should be hidden in output.</li>
            <li>Pick summary, JSON, or raw HTTP request output.</li>
            <li>Review the parsed URL, headers, cookies, query values, and body.</li>
            <li>Copy the parsed output when you need to share or document it.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common cURL Parser Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Reading long cURL commands copied from browser DevTools.</li>
            <li>Checking which headers and cookies are being sent.</li>
            <li>Inspecting JSON request bodies before replaying an API call.</li>
            <li>Hiding sensitive Authorization or Cookie values before sharing.</li>
            <li>Turning a cURL command into a readable raw HTTP request.</li>
            <li>Documenting API examples in a cleaner format.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example cURL Command
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`curl -X POST "https://api.example.com/users?role=admin" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer token" \\
  --data-raw '{"name":"Yoryantra User"}'`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Handling Tokens and Cookies Carefully
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            cURL commands often contain Authorization headers, cookies, session
            IDs, API keys, or bearer tokens. The parser can hide sensitive values
            in copied output so it is safer to paste into tickets, notes, or chat
            messages.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Even then, it is better to remove real secrets before sharing a
            command with anyone else. Use fake test values when you are writing
            documentation or asking for help.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is a cURL command parser?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A cURL command parser reads a cURL request and separates it into
                method, URL, headers, cookies, body data, and request options.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this parse headers from cURL?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Headers passed with -H or --header are parsed and shown in a
                separate table.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this parse JSON request bodies?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Body values from --data, --data-raw, -d, and similar flags
                are extracted, and JSON-looking bodies can be pretty printed.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this make the API request?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. This tool only parses the command text. It does not send the
                request or contact the API endpoint.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are my cURL commands uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Parsing happens directly in your browser, and your cURL
                command is not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/curl-command-builder" className="yoryantra-btn-outline">
              cURL Command Builder
            </Link>

            <Link href="/tools/http-request-parser" className="yoryantra-btn-outline">
              HTTP Request Parser
            </Link>

            <Link href="/tools/json-formatter" className="yoryantra-btn-outline">
              JSON Formatter
            </Link>

            <Link href="/tools/json-validator" className="yoryantra-btn-outline">
              JSON Validator
            </Link>

            <Link href="/tools/http-status-code-checker" className="yoryantra-btn-outline">
              HTTP Status Code Checker
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

function parseCurlCommand(
  input: string,
  options: {
    decodeQueryParams: boolean;
    prettyPrintBody: boolean;
  }
): ParsedCurlCommand {
  const tokens = tokenizeShellCommand(cleanCurlLineContinuations(input));

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
  let followRedirects = false;
  let insecure = false;
  let compressed = false;
  let headOnly = false;
  let outputFile = "";
  let timeout = "";
  const headers: ParsedHeader[] = [];
  const cookies: ParsedPair[] = [];
  const bodyParts: string[] = [];

  for (let index = 1; index < tokens.length; index += 1) {
    const token = tokens[index];

    if (token === "-X" || token === "--request") {
      method = readRequiredValue(tokens, index, token);
      index += 1;
      continue;
    }

    if (token.startsWith("--request=")) {
      method = token.slice("--request=".length);
      continue;
    }

    if (token === "-H" || token === "--header") {
      const headerValue = readRequiredValue(tokens, index, token);
      const parsedHeader = parseHeaderValue(headerValue);
      headers.push(parsedHeader);

      if (parsedHeader.name.toLowerCase() === "cookie") {
        cookies.push(...parseCookieString(parsedHeader.value));
      }

      index += 1;
      continue;
    }

    if (token.startsWith("-H") && token.length > 2) {
      const parsedHeader = parseHeaderValue(token.slice(2));
      headers.push(parsedHeader);

      if (parsedHeader.name.toLowerCase() === "cookie") {
        cookies.push(...parseCookieString(parsedHeader.value));
      }

      continue;
    }

    if (token.startsWith("--header=")) {
      const parsedHeader = parseHeaderValue(token.slice("--header=".length));
      headers.push(parsedHeader);

      if (parsedHeader.name.toLowerCase() === "cookie") {
        cookies.push(...parseCookieString(parsedHeader.value));
      }

      continue;
    }

    if (isBodyFlag(token)) {
      bodyParts.push(readRequiredValue(tokens, index, token));
      index += 1;
      continue;
    }

    if (token.startsWith("--data=")) {
      bodyParts.push(token.slice("--data=".length));
      continue;
    }

    if (token.startsWith("--data-raw=")) {
      bodyParts.push(token.slice("--data-raw=".length));
      continue;
    }

    if (token.startsWith("--data-binary=")) {
      bodyParts.push(token.slice("--data-binary=".length));
      continue;
    }

    if (token === "-b" || token === "--cookie") {
      const cookieValue = readRequiredValue(tokens, index, token);
      cookies.push(...parseCookieString(cookieValue));
      headers.push({
        name: "Cookie",
        value: cookieValue,
      });
      index += 1;
      continue;
    }

    if (token.startsWith("--cookie=")) {
      const cookieValue = token.slice("--cookie=".length);
      cookies.push(...parseCookieString(cookieValue));
      headers.push({
        name: "Cookie",
        value: cookieValue,
      });
      continue;
    }

    if (token === "-A" || token === "--user-agent") {
      userAgent = readRequiredValue(tokens, index, token);
      headers.push({
        name: "User-Agent",
        value: userAgent,
      });
      index += 1;
      continue;
    }

    if (token.startsWith("--user-agent=")) {
      userAgent = token.slice("--user-agent=".length);
      headers.push({
        name: "User-Agent",
        value: userAgent,
      });
      continue;
    }

    if (token === "-u" || token === "--user") {
      const authValue = readRequiredValue(tokens, index, token);
      const [nextUsername, nextPassword = ""] = authValue.split(":");
      username = nextUsername;
      password = nextPassword;
      headers.push({
        name: "Authorization",
        value: `Basic ${authValue}`,
      });
      index += 1;
      continue;
    }

    if (token.startsWith("--user=")) {
      const authValue = token.slice("--user=".length);
      const [nextUsername, nextPassword = ""] = authValue.split(":");
      username = nextUsername;
      password = nextPassword;
      headers.push({
        name: "Authorization",
        value: `Basic ${authValue}`,
      });
      continue;
    }

    if (token === "-L" || token === "--location") {
      followRedirects = true;
      continue;
    }

    if (token === "-k" || token === "--insecure") {
      insecure = true;
      continue;
    }

    if (token === "--compressed") {
      compressed = true;
      continue;
    }

    if (token === "-I" || token === "--head") {
      headOnly = true;
      method = method || "HEAD";
      continue;
    }

    if (token === "-o" || token === "--output") {
      outputFile = readRequiredValue(tokens, index, token);
      index += 1;
      continue;
    }

    if (token.startsWith("--output=")) {
      outputFile = token.slice("--output=".length);
      continue;
    }

    if (token === "--connect-timeout" || token === "-m" || token === "--max-time") {
      timeout = readRequiredValue(tokens, index, token);
      index += 1;
      continue;
    }

    if (token.startsWith("--connect-timeout=")) {
      timeout = token.slice("--connect-timeout=".length);
      continue;
    }

    if (token.startsWith("http://") || token.startsWith("https://")) {
      url = token;
      continue;
    }
  }

  if (!url) {
    const possibleUrl = tokens.find(
      (token) => token.startsWith("http://") || token.startsWith("https://")
    );

    if (possibleUrl) {
      url = possibleUrl;
    }
  }

  if (!url) {
    throw new Error("Could not find a URL in the cURL command.");
  }

  const hasBody = bodyParts.length > 0;
  const finalMethod = method || (hasBody ? "POST" : "GET");
  const body = formatBody(bodyParts.join("&"), options.prettyPrintBody);
  const urlDetails = parseUrlDetails(url, options.decodeQueryParams);

  if (
    hasBody &&
    !headers.some((header) => header.name.toLowerCase() === "content-type")
  ) {
    headers.push({
      name: "Content-Type",
      value: guessContentType(body),
    });
  }

  return {
    method: finalMethod.toUpperCase(),
    url,
    urlPath: urlDetails.path,
    queryParams: urlDetails.queryParams,
    headers: dedupeHeaders(headers),
    cookies: dedupePairs(cookies),
    body,
    userAgent,
    username,
    password,
    followRedirects,
    insecure,
    compressed,
    headOnly,
    outputFile,
    timeout,
    rawTokens: tokens,
  };
}

function cleanCurlLineContinuations(input: string) {
  return input
    .replace(/\\\r?\n/g, " ")
    .replace(/\r\n/g, "\n")
    .trim();
}

function tokenizeShellCommand(input: string) {
  const tokens: string[] = [];
  let current = "";
  let quote: "'" | '"' | null = null;
  let escaped = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (quote) {
      if (char === quote) {
        quote = null;
        continue;
      }

      current += char;
      continue;
    }

    if (char === "'" || char === '"') {
      quote = char;
      continue;
    }

    if (/\s/.test(char)) {
      if (current) {
        tokens.push(current);
        current = "";
      }

      continue;
    }

    current += char;
  }

  if (escaped) {
    current += "\\";
  }

  if (quote) {
    throw new Error("The cURL command has an unclosed quote.");
  }

  if (current) {
    tokens.push(current);
  }

  return tokens;
}

function readRequiredValue(tokens: string[], index: number, flag: string) {
  const value = tokens[index + 1];

  if (!value || value.startsWith("-")) {
    throw new Error(`${flag} needs a value.`);
  }

  return value;
}

function parseHeaderValue(value: string): ParsedHeader {
  const colonIndex = value.indexOf(":");

  if (colonIndex === -1) {
    throw new Error(`Header is missing a colon: ${value}`);
  }

  const name = value.slice(0, colonIndex).trim();
  const headerValue = value.slice(colonIndex + 1).trim();

  if (!name) {
    throw new Error("Header name cannot be empty.");
  }

  return {
    name,
    value: headerValue,
  };
}

function isBodyFlag(token: string) {
  return [
    "-d",
    "--data",
    "--data-raw",
    "--data-binary",
    "--data-urlencode",
    "--form",
    "-F",
  ].includes(token);
}

function parseCookieString(value: string): ParsedPair[] {
  return value
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const equalsIndex = part.indexOf("=");

      if (equalsIndex === -1) {
        return {
          key: part,
          value: "",
        };
      }

      return {
        key: part.slice(0, equalsIndex).trim(),
        value: part.slice(equalsIndex + 1).trim(),
      };
    });
}

function parseUrlDetails(url: string, decodeQueryParams: boolean) {
  const parsedUrl = new URL(url);
  const queryParams: ParsedPair[] = [];

  parsedUrl.searchParams.forEach((value, key) => {
    queryParams.push({
      key: decodeQueryParams ? safeDecode(key) : key,
      value: decodeQueryParams ? safeDecode(value) : value,
    });
  });

  return {
    path: `${parsedUrl.pathname}${parsedUrl.search}`,
    queryParams,
  };
}

function formatBody(body: string, prettyPrintBody: boolean) {
  if (!body) {
    return "";
  }

  if (!prettyPrintBody) {
    return body;
  }

  const trimmed = body.trim();

  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      return JSON.stringify(JSON.parse(trimmed), null, 2);
    } catch {
      return body;
    }
  }

  return body;
}

function guessContentType(body: string) {
  const trimmed = body.trim();

  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    return "application/json";
  }

  if (trimmed.includes("=") && trimmed.includes("&")) {
    return "application/x-www-form-urlencoded";
  }

  return "text/plain";
}

function dedupeHeaders(headers: ParsedHeader[]) {
  const seen = new Set<string>();
  const result: ParsedHeader[] = [];

  headers.forEach((header) => {
    const key = `${header.name.toLowerCase()}:${header.value}`;

    if (!seen.has(key)) {
      result.push(header);
      seen.add(key);
    }
  });

  return result;
}

function dedupePairs(pairs: ParsedPair[]) {
  const seen = new Set<string>();
  const result: ParsedPair[] = [];

  pairs.forEach((pair) => {
    const key = `${pair.key}:${pair.value}`;

    if (!seen.has(key)) {
      result.push(pair);
      seen.add(key);
    }
  });

  return result;
}

function formatParsedCurl(
  parsed: ParsedCurlCommand,
  options: {
    outputFormat: OutputFormat;
    hideSensitiveValues: boolean;
  }
) {
  if (options.outputFormat === "json") {
    return JSON.stringify(
      {
        ...parsed,
        headers: parsed.headers.map((header) => ({
          ...header,
          value:
            options.hideSensitiveValues && isSensitiveHeader(header.name)
              ? "[hidden]"
              : header.value,
        })),
        cookies: parsed.cookies.map((cookie) => ({
          ...cookie,
          value: options.hideSensitiveValues ? "[hidden]" : cookie.value,
        })),
        password:
          options.hideSensitiveValues && parsed.password
            ? "[hidden]"
            : parsed.password,
      },
      null,
      2
    );
  }

  if (options.outputFormat === "http") {
    return toRawHTTPRequest(parsed, options.hideSensitiveValues);
  }

  return [
    `Method: ${parsed.method}`,
    `URL: ${parsed.url}`,
    `Path: ${parsed.urlPath}`,
    `Headers: ${parsed.headers.length}`,
    `Query parameters: ${parsed.queryParams.length}`,
    `Cookies: ${parsed.cookies.length}`,
    `Body size: ${parsed.body.length.toLocaleString()} characters`,
    `Follow redirects: ${parsed.followRedirects ? "yes" : "no"}`,
    `Insecure TLS: ${parsed.insecure ? "yes" : "no"}`,
    parsed.timeout ? `Timeout: ${parsed.timeout}` : "",
    parsed.outputFile ? `Output file: ${parsed.outputFile}` : "",
    "",
    "Headers:",
    ...parsed.headers.map(
      (header) =>
        `${header.name}: ${
          options.hideSensitiveValues && isSensitiveHeader(header.name)
            ? "[hidden]"
            : header.value
        }`
    ),
    parsed.queryParams.length > 0 ? "" : "",
    parsed.queryParams.length > 0 ? "Query Parameters:" : "",
    ...parsed.queryParams.map((param) => `${param.key}=${param.value}`),
    parsed.body ? "" : "",
    parsed.body ? "Body:" : "",
    parsed.body || "",
  ]
    .filter((line) => line !== undefined && line !== "")
    .join("\n");
}

function toRawHTTPRequest(parsed: ParsedCurlCommand, hideSensitiveValues: boolean) {
  const url = new URL(parsed.url);
  const requestLine = `${parsed.method} ${url.pathname}${url.search} HTTP/1.1`;
  const hostHeader = `Host: ${url.host}`;
  const headers = parsed.headers.map((header) => {
    const value =
      hideSensitiveValues && isSensitiveHeader(header.name)
        ? "[hidden]"
        : header.value;

    return `${header.name}: ${value}`;
  });

  return [
    requestLine,
    hostHeader,
    ...headers,
    parsed.body ? "" : "",
    parsed.body || "",
  ].join("\n");
}

function getCurlWarnings(parsed: ParsedCurlCommand): CurlWarning[] {
  const warnings: CurlWarning[] = [];

  if (parsed.headers.some((header) => isSensitiveHeader(header.name))) {
    warnings.push({
      title: "Sensitive values found",
      message:
        "This command includes headers or cookies that may contain tokens, sessions, API keys, or passwords. Hide or replace them before sharing.",
    });
  }

  if (parsed.insecure) {
    warnings.push({
      title: "Insecure TLS flag used",
      message:
        "The command uses -k or --insecure, which skips TLS certificate verification.",
    });
  }

  if (parsed.method === "GET" && parsed.body) {
    warnings.push({
      title: "GET request has a body",
      message:
        "GET requests with bodies can behave differently across clients, servers, and proxies.",
    });
  }

  if (!parsed.headers.some((header) => header.name.toLowerCase() === "accept")) {
    warnings.push({
      title: "No Accept header found",
      message:
        "Some APIs behave differently when an Accept header is missing.",
    });
  }

  return warnings;
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

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value.replace(/\+/g, " "));
  } catch {
    return value;
  }
}
