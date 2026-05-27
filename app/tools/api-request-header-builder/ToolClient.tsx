"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

type HeaderRow = {
  id: number;
  name: string;
  value: string;
  enabled: boolean;
};

type OutputMode = "plain" | "fetch" | "curl" | "json";

const starterHeaders: HeaderRow[] = [
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
    name: "Authorization",
    value: "Bearer YOUR_TOKEN_HERE",
    enabled: false,
  },
];

const presetHeaders = [
  {
    label: "Authorization Bearer",
    name: "Authorization",
    value: "Bearer YOUR_TOKEN_HERE",
  },
  {
    label: "JSON Content-Type",
    name: "Content-Type",
    value: "application/json",
  },
  {
    label: "Accept JSON",
    name: "Accept",
    value: "application/json",
  },
  {
    label: "User Agent",
    name: "User-Agent",
    value: "Yoryantra-API-Client/1.0",
  },
  {
    label: "API Key",
    name: "X-API-Key",
    value: "YOUR_API_KEY_HERE",
  },
  {
    label: "No Cache",
    name: "Cache-Control",
    value: "no-cache",
  },
];

export default function ToolClient() {
  const [headers, setHeaders] = useState<HeaderRow[]>(starterHeaders);
  const [outputMode, setOutputMode] = useState<OutputMode>("plain");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const enabledHeaders = useMemo(
    () =>
      headers.filter(
        (header) => header.enabled && header.name.trim() && header.value.trim()
      ),
    [headers]
  );

  const buildHeaders = () => {
    const validationError = validateHeaders(enabledHeaders);

    if (validationError) {
      setError(validationError);
      setOutput("");
      return;
    }

    setOutput(formatHeaders(enabledHeaders, outputMode));
    setError("");
  };

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

    setOutput("");
    setError("");
  };

  const addPreset = (name: string, value: string) => {
    setHeaders((current) => [
      ...current,
      {
        id: Date.now(),
        name,
        value,
        enabled: true,
      },
    ]);

    setOutput("");
    setError("");
  };

  const updateHeader = (
    id: number,
    field: "name" | "value" | "enabled",
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

    setOutput("");
    setError("");
  };

  const removeHeader = (id: number) => {
    setHeaders((current) => current.filter((header) => header.id !== id));
    setOutput("");
    setError("");
  };

  const resetAll = () => {
    setHeaders(starterHeaders);
    setOutputMode("plain");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="API Request Header Builder"
      description="Build API request headers, prepare Authorization, Content-Type, Accept, cache, and custom HTTP header blocks."
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Header Rows
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          Add common API request headers, enable or disable rows, and generate a
          clean header block for testing or documentation.
        </p>

        <div className="mt-5 space-y-4">
          {headers.map((header) => (
            <div
              key={header.id}
              className="grid gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 md:grid-cols-[auto_1fr_1fr_auto]"
            >
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={header.enabled}
                  onChange={(event) =>
                    updateHeader(header.id, "enabled", event.target.checked)
                  }
                />
                Use
              </label>

              <input
                value={header.name}
                onChange={(event) =>
                  updateHeader(header.id, "name", event.target.value)
                }
                placeholder="Header name"
                className="rounded-xl border border-gray-300 p-3 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
              />

              <input
                value={header.value}
                onChange={(event) =>
                  updateHeader(header.id, "value", event.target.value)
                }
                placeholder="Header value"
                className="rounded-xl border border-gray-300 p-3 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
              />

              <button
                onClick={() => removeHeader(header.id)}
                className="yoryantra-btn-outline text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={addHeader} className="yoryantra-btn-outline">
          Add Header
        </button>

        {presetHeaders.map((preset) => (
          <button
            key={preset.label}
            onClick={() => addPreset(preset.name, preset.value)}
            className="yoryantra-btn-outline text-sm"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Output Format
        </label>

        <select
          value={outputMode}
          onChange={(event) => {
            setOutputMode(event.target.value as OutputMode);
            setOutput("");
            setError("");
          }}
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        >
          <option value="plain">Plain header block</option>
          <option value="fetch">JavaScript fetch headers</option>
          <option value="curl">cURL header flags</option>
          <option value="json">JSON object</option>
        </select>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={buildHeaders} className="yoryantra-btn">
          Build Headers
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

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Generated Headers
          </h3>

          {output && (
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[260px] whitespace-pre-wrap break-words">
          {output || "Generated API request headers will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Avoid pasting real production API keys, bearer tokens, or private
        credentials into shared screens, screenshots, logs, or documentation.
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Building API Request Headers Before Testing Endpoints
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            API requests often need carefully prepared headers such as
            Authorization, Content-Type, Accept, Cache-Control, User-Agent, and
            custom API key headers. A small typo in a header name or value can
            cause authentication errors, wrong response formats, failed API
            calls, or confusing debugging sessions.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This API Request Header Builder helps you prepare clean HTTP request
            headers, generate plain header blocks, create fetch header objects,
            build cURL header flags, and review custom API headers directly in
            your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Preparing Authorization, Content-Type, and Custom Headers
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Add the request headers you want to use.</li>
            <li>Enable or disable header rows as needed.</li>
            <li>Select the output format for your workflow.</li>
            <li>
              Click <strong>Build Headers</strong> and copy the generated output.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common API Header Builder Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Preparing bearer token headers for API testing.</li>
            <li>Building JSON request headers for fetch or cURL examples.</li>
            <li>Creating custom X-API-Key or service-specific headers.</li>
            <li>Checking header names before adding them to documentation.</li>
            <li>Generating reusable header blocks for debugging API requests.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example API Request Headers
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Accept: application/json
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
X-API-Key: YOUR_API_KEY_HERE`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What does an API Request Header Builder do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It helps you create clean HTTP request headers for API testing,
                JavaScript fetch calls, cURL examples, and documentation.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I generate Authorization headers?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. You can add a bearer token Authorization header or any
                custom authentication header needed for your API workflow.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this tool send API requests?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. This tool only builds header text. It does not send network
                requests or contact API endpoints.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are my headers uploaded to a server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Header generation happens directly in your browser. Your
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
            <Link
              href="/tools/curl-command-builder"
              className="yoryantra-btn-outline"
            >
              CURL Command Builder
            </Link>

            <Link
              href="/tools/curl-to-fetch-converter"
              className="yoryantra-btn-outline"
            >
              CURL to Fetch Converter
            </Link>

            <Link
              href="/tools/http-request-formatter"
              className="yoryantra-btn-outline"
            >
              HTTP Request Formatter
            </Link>

            <Link
              href="/tools/api-key-generator"
              className="yoryantra-btn-outline"
            >
              API Key Generator
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function validateHeaders(headers: HeaderRow[]) {
  if (!headers.length) {
    return "Please enable at least one header with a name and value.";
  }

  const names = new Set<string>();

  for (const header of headers) {
    const name = header.name.trim();

    if (!/^[A-Za-z0-9!#$%&'*+.^_`|~-]+$/.test(name)) {
      return `Invalid header name: ${name}`;
    }

    const normalized = name.toLowerCase();

    if (names.has(normalized)) {
      return `Duplicate header found: ${name}`;
    }

    names.add(normalized);
  }

  return "";
}

function formatHeaders(headers: HeaderRow[], mode: OutputMode) {
  if (mode === "plain") {
    return headers
      .map((header) => `${header.name.trim()}: ${header.value.trim()}`)
      .join("\\n");
  }

  if (mode === "json") {
    return JSON.stringify(
      Object.fromEntries(
        headers.map((header) => [header.name.trim(), header.value.trim()])
      ),
      null,
      2
    );
  }

  if (mode === "fetch") {
    const json = JSON.stringify(
      Object.fromEntries(
        headers.map((header) => [header.name.trim(), header.value.trim()])
      ),
      null,
      2
    );

    return `headers: ${json}`;
  }

  return headers
    .map(
      (header) =>
        `-H ${JSON.stringify(`${header.name.trim()}: ${header.value.trim()}`)}`
    )
    .join(" \\\\\\n  ");
}
