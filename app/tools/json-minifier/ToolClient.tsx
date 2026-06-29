"use client";

import { useMemo, useState, type ReactNode } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "minified" | "escapedString" | "validationReport" | "sizeReport";
type TrimMode = "trim" | "preserve";

type Result = {
  output: string;
  originalSize: number;
  minifiedSize: number;
  savedBytes: number;
  savedPercent: string;
  keyCount: number;
  arrayCount: number;
  objectCount: number;
  rootType: string;
};

const sampleJson = `{
  "name": "Yoryantra",
  "type": "utility-site",
  "tools": [
    "JSON Formatter",
    "JSON Minifier",
    "YAML Formatter"
  ],
  "settings": {
    "browserOnly": true,
    "cleanOutput": true
  }
}`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("minified");
  const [trimMode, setTrimMode] = useState<TrimMode>("trim");
  const [sortKeys, setSortKeys] = useState(false);
  const [copyAsOneLine, setCopyAsOneLine] = useState(true);
  const [includeSizeStats, setIncludeSizeStats] = useState(true);
  const [result, setResult] = useState<Result | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const hasOutput = output.length > 0;

  const sizeRows = useMemo(() => {
    if (!result) return [];

    return [
      { label: "Original size", value: `${result.originalSize.toLocaleString()} bytes` },
      { label: "Minified size", value: `${result.minifiedSize.toLocaleString()} bytes` },
      { label: "Saved", value: `${result.savedBytes.toLocaleString()} bytes` },
      { label: "Reduction", value: `${result.savedPercent}%` },
    ];
  }, [result]);

  const clearResult = () => {
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const minifyJSON = () => {
    if (!input.trim()) {
      setError("Please paste JSON content to minify.");
      setOutput("");
      setResult(null);
      setCopied(false);
      return;
    }

    try {
      const source = trimMode === "trim" ? input.trim() : input;
      const parsed = JSON.parse(source);
      const prepared = sortKeys ? sortObjectKeys(parsed) : parsed;
      const minified = JSON.stringify(prepared);
      const originalSize = getByteSize(source);
      const minifiedSize = getByteSize(minified);
      const savedBytes = Math.max(originalSize - minifiedSize, 0);
      const savedPercent =
        originalSize > 0 ? ((savedBytes / originalSize) * 100).toFixed(2) : "0.00";

      const nextResult: Result = {
        output: minified,
        originalSize,
        minifiedSize,
        savedBytes,
        savedPercent,
        keyCount: countKeys(prepared),
        arrayCount: countArrays(prepared),
        objectCount: countObjects(prepared),
        rootType: detectRoot(prepared),
      };

      const nextOutput = buildOutput({
        outputMode,
        minified,
        parsed: prepared,
        result: nextResult,
        includeSizeStats,
        copyAsOneLine,
      });

      setResult(nextResult);
      setOutput(nextOutput);
      setError("");
      setCopied(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid JSON input.";
      setError(`Invalid JSON. ${message}`);
      setOutput("");
      setResult(null);
      setCopied(false);
    }
  };

  const copyOutput = async () => {
    if (!hasOutput) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const loadExample = () => {
    setInput(sampleJson);
    setOutputMode("minified");
    setTrimMode("trim");
    setSortKeys(false);
    setCopyAsOneLine(true);
    setIncludeSizeStats(true);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setOutputMode("minified");
    setTrimMode("trim");
    setSortKeys(false);
    setCopyAsOneLine(true);
    setIncludeSizeStats(true);
    clearResult();
  };

  return (
    <ToolShell
      title="JSON Minifier"
      description="Minify JSON online, compress JSON payloads, remove whitespace, validate syntax, and copy compact JSON for APIs, apps, logs, and development workflows."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-900">
            JSON Input
          </label>

          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            Paste formatted JSON, API responses, configuration data, logs, or test payloads that you want to compress into compact JSON.
          </p>
        </div>

        <textarea
          className="w-full min-h-[380px] rounded-xl border border-gray-300 p-4 text-sm leading-6 font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          placeholder={sampleJson}
          value={input}
          spellCheck={false}
          onChange={(event) => {
            setInput(event.target.value);
            clearResult();
          }}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">Minifier Settings</h3>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value) => {
              setOutputMode(value as OutputMode);
              clearResult();
            }}
            options={[
              { label: "Minified JSON", value: "minified" },
              { label: "Escaped JSON string", value: "escapedString" },
              { label: "Validation report", value: "validationReport" },
              { label: "Size report", value: "sizeReport" },
            ]}
          />

          <YoryantraSelect
            label="Input handling"
            value={trimMode}
            onChange={(value) => {
              setTrimMode(value as TrimMode);
              clearResult();
            }}
            options={[
              { label: "Trim outer whitespace", value: "trim" },
              { label: "Preserve outer whitespace for stats", value: "preserve" },
            ]}
          />

          <YoryantraSelect
            label="Copy style"
            value={copyAsOneLine ? "oneLine" : "normal"}
            onChange={(value) => {
              setCopyAsOneLine(value === "oneLine");
              clearResult();
            }}
            options={[
              { label: "One-line output", value: "oneLine" },
              { label: "Normal text output", value: "normal" },
            ]}
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>

        <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
          <Toggle
            checked={sortKeys}
            onChange={(value) => {
              setSortKeys(value);
              clearResult();
            }}
            label="Sort object keys alphabetically before minifying"
          />

          <Toggle
            checked={includeSizeStats}
            onChange={(value) => {
              setIncludeSizeStats(value);
              clearResult();
            }}
            label="Include size stats in reports"
          />
        </div>

        <p className="mt-4 text-sm leading-relaxed text-gray-500">
          JSON minification removes formatting whitespace while keeping the parsed data structure the same.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={minifyJSON} className="yoryantra-btn">
          Minify JSON
        </button>

        <button type="button" onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>

        <button type="button" onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 overflow-auto">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Minified Output</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Copy compact JSON for APIs, requests, storage, logs, or documentation.
                </p>
              </div>

              <button
                type="button"
                onClick={copyOutput}
                disabled={!hasOutput}
                className="yoryantra-btn-outline text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copied ? "Copied" : "Copy Output"}
              </button>
            </div>

            <pre className="mt-4 yoryantra-output min-h-[220px] overflow-auto whitespace-pre-wrap break-words text-sm">
              {output}
            </pre>
          </div>

          <div className="space-y-4">
            {sizeRows.map((row) => (
              <StatCard key={row.label} label={row.label} value={row.value} />
            ))}

            <StatCard label="Root type" value={result.rootType} />
            <StatCard label="Keys" value={result.keyCount.toLocaleString()} />
          </div>
        </div>
      ) : null}

      {result ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">JSON Review Notes</h3>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <ReviewNote title="Objects" value={result.objectCount.toLocaleString()} />
            <ReviewNote title="Arrays" value={result.arrayCount.toLocaleString()} />
            <ReviewNote title="Compression" value={`${result.savedPercent}% smaller`} />
          </div>

          <p className="mt-4 text-sm leading-relaxed text-gray-500">
            The output is generated from parsed JSON, so invalid JSON is caught before compact output is created.
          </p>
        </div>
      ) : null}

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Minifying JSON Before Using It in APIs and Apps
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON minification removes unnecessary whitespace, indentation, and line breaks from valid JSON. The data stays the same, but the output becomes compact and easier to send through APIs, save in configuration files, paste into headers, or store in logs.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Developers often work with formatted JSON while debugging because it is easier to read. For production payloads, test requests, API examples, embedded values, and storage fields, compact JSON is sometimes more practical.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This JSON Minifier validates the input first, then creates compact JSON directly in your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">When This JSON Minifier Helps</h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p>Compressing API request or response examples before sharing them.</p>
            <p className="mt-2">Removing whitespace from JSON before storing it in a field, config value, script, or test case.</p>
            <p className="mt-2">Checking whether copied JSON is valid before using it in development workflows.</p>
            <p className="mt-2">Creating compact JSON from formatted logs, mocks, sample data, or documentation examples.</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">How to Use the JSON Minifier</h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste valid JSON into the input box.</li>
            <li>Choose whether you want minified JSON, an escaped JSON string, a validation report, or a size report.</li>
            <li>Turn on sorting if you want object keys arranged alphabetically before minifying.</li>
            <li>Click <strong>Minify JSON</strong>.</li>
            <li>Copy the compact output for your API, app, documentation, or workflow.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example JSON Minification</h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <p className="font-medium text-gray-900">Before minifying:</p>

            <pre className="mt-2 whitespace-pre-wrap break-words">{`{
  "name": "Yoryantra",
  "active": true,
  "tools": ["JSON Formatter", "JSON Minifier"]
}`}</pre>

            <p className="mt-4 font-medium text-gray-900">After minifying:</p>

            <pre className="mt-2 whitespace-pre-wrap break-words">{`{"name":"Yoryantra","active":true,"tools":["JSON Formatter","JSON Minifier"]}`}</pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Minified JSON Is Compact, Not Encrypted
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Minifying JSON only removes formatting whitespace. It does not hide, encrypt, or protect the values inside the JSON. If your JSON contains secrets, tokens, passwords, or private data, review it carefully before sharing it anywhere.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>

          <div className="mt-5 space-y-6">
            <Faq title="What does a JSON Minifier do?">
              A JSON Minifier removes unnecessary spaces, indentation, and line breaks from JSON while keeping the same data structure.
            </Faq>

            <Faq title="Is minified JSON different from formatted JSON?">
              The values and structure are the same when the JSON is valid. Minified JSON is compact, while formatted JSON is easier for humans to read.
            </Faq>

            <Faq title="Can this tool validate JSON before minifying it?">
              Yes. The tool parses the JSON first. If the input is invalid, it shows an error instead of creating compact output.
            </Faq>

            <Faq title="Can I minify JSON online without uploading it?">
              Yes. JSON minification happens locally inside your browser, so pasted JSON is not sent to a server.
            </Faq>

            <Faq title="When should I use compact JSON?">
              Compact JSON is useful for API requests, embedded examples, storage fields, logs, test payloads, and places where whitespace is not needed.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/json-minifier" />
        </div>
      </section>
    </ToolShell>
  );
}

function buildOutput(options: {
  outputMode: OutputMode;
  minified: string;
  parsed: unknown;
  result: Result;
  includeSizeStats: boolean;
  copyAsOneLine: boolean;
}) {
  if (options.outputMode === "escapedString") {
    return JSON.stringify(options.minified);
  }

  if (options.outputMode === "validationReport") {
    const lines = [
      "JSON validation report",
      "",
      "Status: valid JSON",
      `Root type: ${options.result.rootType}`,
      `Keys: ${options.result.keyCount}`,
      `Objects: ${options.result.objectCount}`,
      `Arrays: ${options.result.arrayCount}`,
    ];

    if (options.includeSizeStats) {
      lines.push(
        "",
        "Size:",
        `Original: ${options.result.originalSize} bytes`,
        `Minified: ${options.result.minifiedSize} bytes`,
        `Saved: ${options.result.savedBytes} bytes (${options.result.savedPercent}%)`
      );
    }

    return lines.join("\n");
  }

  if (options.outputMode === "sizeReport") {
    return [
      "JSON size report",
      "",
      `Original size: ${options.result.originalSize} bytes`,
      `Minified size: ${options.result.minifiedSize} bytes`,
      `Saved: ${options.result.savedBytes} bytes`,
      `Reduction: ${options.result.savedPercent}%`,
      "",
      `Root type: ${options.result.rootType}`,
      `Keys: ${options.result.keyCount}`,
      `Objects: ${options.result.objectCount}`,
      `Arrays: ${options.result.arrayCount}`,
    ].join("\n");
  }

  return options.copyAsOneLine ? options.minified : options.minified;
}

function sortObjectKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObjectKeys);
  }

  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort((a, b) => a.localeCompare(b))
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortObjectKeys((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }

  return value;
}

function countKeys(value: unknown): number {
  if (Array.isArray(value)) {
    return value.reduce((total, item) => total + countKeys(item), 0);
  }

  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).reduce(
      (total, [, item]) => total + 1 + countKeys(item),
      0
    );
  }

  return 0;
}

function countArrays(value: unknown): number {
  if (Array.isArray(value)) {
    return 1 + value.reduce((total, item) => total + countArrays(item), 0);
  }

  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).reduce<number>(
      (total, item) => total + countArrays(item),
      0
    );
  }

  return 0;
}

function countObjects(value: unknown): number {
  if (Array.isArray(value)) {
    return value.reduce((total, item) => total + countObjects(item), 0);
  }

  if (value && typeof value === "object" && value !== null) {
    return (
      1 +
      Object.values(value as Record<string, unknown>).reduce<number>(
        (total, item) => total + countObjects(item),
        0
      )
    );
  }

  return 0;
}

function detectRoot(value: unknown) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  if (typeof value === "object") return "object";
  return typeof value;
}

function getByteSize(value: string) {
  return new Blob([value]).size;
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
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
      <p className="mt-2 break-words font-mono text-lg font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function ReviewNote({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="mt-2 font-mono text-sm text-gray-700">{value}</p>
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
