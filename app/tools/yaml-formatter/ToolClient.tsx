"use client";

import { useState } from "react";
import YAML from "yaml";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type IndentMode = "2" | "4";
type WidthMode = "80" | "120" | "0";

type FormatResult = {
  output: string;
  documents: number;
  warnings: string[];
  comments: number;
  anchors: number;
  aliases: number;
  inputLines: number;
  outputLines: number;
};

const sampleYaml = `# Deployment settings
service: api
image: example/api:1.4
resources: &defaults
  cpu: 500m
  memory: 512Mi
workers:
  - name: queue-a
    resources: *defaults
  - name: queue-b
    resources: *defaults`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [indentMode, setIndentMode] = useState<IndentMode>("2");
  const [widthMode, setWidthMode] = useState<WidthMode>("120");
  const [result, setResult] = useState<FormatResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const clearResult = () => {
    setResult(null);
    setError("");
    setCopied(false);
  };

  const formatYAML = () => {
    if (!input.trim()) {
      setError("Paste YAML before formatting.");
      setResult(null);
      return;
    }

    try {
      const documents = YAML.parseAllDocuments(input, { prettyErrors: true, uniqueKeys: true });
      const parseErrors = documents.flatMap((document) => document.errors ?? []);
      if (parseErrors.length) {
        throw new Error(parseErrors.map((item) => item.message).join("\n"));
      }

      const lineWidth = Number(widthMode);
      const parts = documents.map((document, index) => {
        const rendered = document.toString({
          indent: Number(indentMode),
          lineWidth: lineWidth === 0 ? 0 : lineWidth,
        }).trimEnd();

        if (index > 0 && !/^---(?:\s|$)/.test(rendered)) return `---\n${rendered}`;
        return rendered;
      });

      const output = parts.join("\n") + "\n";
      const warnings = documents.flatMap((document) => (document.warnings ?? []).map((item) => item.message));

      setResult({
        output,
        documents: documents.length,
        warnings,
        comments: countComments(input),
        anchors: countMatches(input, /&[A-Za-z0-9_-]+/g),
        aliases: countMatches(input, /\*[A-Za-z0-9_-]+/g),
        inputLines: countLines(input),
        outputLines: countLines(output),
      });
      setError("");
      setCopied(false);
    } catch (caught) {
      setResult(null);
      setError(caught instanceof Error ? `Invalid YAML. ${caught.message}` : "Invalid YAML input.");
    }
  };

  const copyOutput = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.output);
    setCopied(true);
  };

  const resetAll = () => {
    setInput("");
    setIndentMode("2");
    setWidthMode("120");
    clearResult();
  };

  return (
    <ToolShell
      title="YAML Formatter"
      description="Format YAML through the parser's document model so comments, anchors, aliases, and multi-document structure are handled more faithfully than a plain object round trip."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">YAML Input</label>
        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            clearResult();
          }}
          placeholder="Paste YAML here..."
          className="w-full min-h-[300px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <YoryantraSelect
          label="Indentation"
          value={indentMode}
          onChange={(value) => {
            setIndentMode(value as IndentMode);
            clearResult();
          }}
          options={[
            { label: "2 spaces", value: "2" },
            { label: "4 spaces", value: "4" },
          ]}
        />
        <YoryantraSelect
          label="Preferred line width"
          value={widthMode}
          onChange={(value) => {
            setWidthMode(value as WidthMode);
            clearResult();
          }}
          options={[
            { label: "80 characters", value: "80" },
            { label: "120 characters", value: "120" },
            { label: "No wrapping preference", value: "0" },
          ]}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={formatYAML} className="yoryantra-btn">Format YAML</button>
        <button
          type="button"
          onClick={() => {
            setInput(sampleYaml);
            clearResult();
          }}
          className="yoryantra-btn-outline"
        >
          Load Example
        </button>
        <button type="button" onClick={resetAll} className="yoryantra-btn-outline">Reset</button>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700 whitespace-pre-wrap">{error}</div>
      ) : null}

      {result ? (
        <div className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Documents" value={result.documents.toLocaleString()} />
            <Stat label="Lines" value={`${result.inputLines} → ${result.outputLines}`} />
            <Stat label="Comments" value={result.comments.toLocaleString()} />
            <Stat label="Anchors / aliases" value={`${result.anchors} / ${result.aliases}`} />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Formatted YAML</h3>
            <button type="button" onClick={copyOutput} className="yoryantra-btn-outline text-sm">{copied ? "Copied" : "Copy"}</button>
          </div>
          <pre className="yoryantra-output mt-3 min-h-[240px] overflow-auto whitespace-pre text-sm font-mono">{result.output}</pre>

          {result.warnings.length ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
              <strong>Parser warning{result.warnings.length === 1 ? "" : "s"}:</strong>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {result.warnings.slice(0, 8).map((warning, index) => <li key={`${warning}-${index}`}>{warning}</li>)}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Formatting is not the same as converting YAML to an object</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            YAML includes comments, anchors, aliases, directives, tags, document boundaries, and other presentation or serialization details. A formatter should work with YAML documents directly where possible instead of immediately converting everything to plain JavaScript objects and recreating new YAML from those objects.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What may still be normalized</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            A parser-backed formatter can normalize quoting style, flow-vs-block presentation, whitespace, scalar layout, and some document markers. Use version control when formatting configuration where exact textual presentation matters. Application meaning should never depend on mapping key order.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Syntax validation is not platform validation</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            Successfully formatting a YAML document means its YAML syntax was accepted by the parser. It does not prove that a Kubernetes manifest, Docker Compose file, GitHub Actions workflow, or other application-specific configuration satisfies that platform&apos;s schema or runtime rules.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-relaxed text-gray-700">
          <strong>Local processing:</strong> YAML parsing and formatting happen in the browser; the pasted configuration is not uploaded by this tool.
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reference</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            YAML&apos;s representation, serialization, mappings, aliases, and loading failure points are described in the <a className="underline" href="https://yaml.org/spec/1.2.2/" target="_blank" rel="noreferrer">YAML 1.2.2 specification</a>.
          </p>
        </div>

        <YoryantraRelatedTools currentHref="/tools/yaml-formatter" />
      </section>
    </ToolShell>
  );
}

function countLines(value: string) {
  if (!value) return 0;
  return value.split(/\r?\n/).length;
}

function countComments(value: string) {
  let count = 0;
  let inSingle = false;
  let inDouble = false;
  let escaped = false;

  for (const line of value.split(/\r?\n/)) {
    inSingle = false;
    inDouble = false;
    escaped = false;

    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      if (inDouble) {
        if (escaped) escaped = false;
        else if (char === "\\") escaped = true;
        else if (char === '"') inDouble = false;
        continue;
      }
      if (inSingle) {
        if (char === "'") {
          if (line[index + 1] === "'") index += 1;
          else inSingle = false;
        }
        continue;
      }
      if (char === '"') inDouble = true;
      else if (char === "'") inSingle = true;
      else if (char === "#" && (index === 0 || /\s/.test(line[index - 1]))) {
        count += 1;
        break;
      }
    }
  }
  return count;
}

function countMatches(value: string, pattern: RegExp) {
  return value.match(pattern)?.length ?? 0;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-gray-900">{value}</div>
    </div>
  );
}
