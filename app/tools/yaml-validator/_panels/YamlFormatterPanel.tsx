"use client";

import type { WorkflowPanelProps } from "../workflow-types";

import { useEffect, useState } from "react";
import {
  isAlias,
  isCollection,
  isPair,
  isScalar,
  parseAllDocuments,
  visit,
} from "yaml";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type IndentMode = "2" | "4";
type WidthMode = "80" | "120" | "0";

type FormatResult = {
  output: string;
  documents: number;
  warnings: string[];
  anchors: number;
  aliases: number;
  directives: number;
  inputLines: number;
  outputLines: number;
};

const SAMPLE_YAML = `# Deployment settings
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

function stripTrailingWhitespace(
  value: string
) {
  return value.replace(/\s+$/, "");
}

function countLines(value: string) {
  if (!value) return 0;

  return value
    .replace(/\r\n?/g, "\n")
    .split("\n").length;
}

function countDirectives(value: string) {
  return value
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .filter((line) => /^%(?:YAML|TAG)\b/.test(line)).length;
}

function hasTemplateMarkers(value: string) {
  return value.indexOf("{{") !== -1 || value.indexOf("{%") !== -1;
}

function inspectYamlStructure(
  documents: ReturnType<typeof parseAllDocuments>
) {
  let anchors = 0;
  let aliases = 0;
  let mergeKeys = 0;
  let inspectionFailed = false;

  documents.forEach((document) => {
    try {
      visit(document, (_key, node) => {
        if (isAlias(node)) {
          aliases += 1;
          return;
        }

        if (
          (isCollection(node) || isScalar(node)) &&
          typeof node.anchor === "string" &&
          node.anchor
        ) {
          anchors += 1;
        }

        if (
          isPair(node) &&
          isScalar(node.key) &&
          node.key.value === "<<" &&
          node.key.type === "PLAIN"
        ) {
          mergeKeys += 1;
        }
      });
    } catch {
      inspectionFailed = true;
    }
  });

  return { anchors, aliases, mergeKeys, inspectionFailed };
}

function formatDiagnostic(
  diagnostic: {
    code?: string;
    message?: string;
    linePos?: Array<{
      line: number;
      col: number;
    }>;
  },
  documentIndex: number
) {
  const position =
    diagnostic.linePos &&
    diagnostic.linePos.length
      ? diagnostic.linePos[0]
      : null;
  const location = position
    ? `line ${position.line}, column ${position.col}`
    : "location unavailable";
  const code = diagnostic.code
    ? ` [${diagnostic.code}]`
    : "";

  return `Document ${
    documentIndex + 1
  }, ${location}${code}: ${
    diagnostic.message ||
    "YAML parser diagnostic."
  }`;
}

function formatYaml(
  input: string,
  indent: number,
  lineWidth: number
): FormatResult {
  const documents =
    parseAllDocuments(input, {
      prettyErrors: true,
      uniqueKeys: true,
    });

  const errors: string[] = [];
  const warnings: string[] = [];

  documents.forEach(
    (document, documentIndex) => {
      document.errors.forEach(
        (diagnostic) => {
          errors.push(
            formatDiagnostic(
              diagnostic,
              documentIndex
            )
          );
        }
      );

      document.warnings.forEach(
        (diagnostic) => {
          warnings.push(
            formatDiagnostic(
              diagnostic,
              documentIndex
            )
          );
        }
      );
    }
  );

  if (errors.length) {
    throw new Error(
      errors.slice(0, 10).join("\n\n")
    );
  }

  const parts = documents.map(
    (document, index) => {
      const rendered =
        stripTrailingWhitespace(
          document.toString({
            indent,
            lineWidth,
          })
        );

      if (
        index > 0 &&
        !/^---(?:\s|$)/.test(
          rendered
        )
      ) {
        return `---\n${rendered}`;
      }

      return rendered;
    }
  );

  const output = `${parts.join(
    "\n"
  )}\n`;

  if (hasTemplateMarkers(input)) {
    warnings.push(
      "Template markers were detected. Formatting template source can be misleading when the final rendered YAML has different structure."
    );
  }

  const structure = inspectYamlStructure(documents);

  if (structure.mergeKeys) {
    warnings.push(
      "A plain << mapping key is present. Merge-key behavior is a YAML 1.1-era feature and is not part of YAML 1.2; confirm how the destination parser treats it before relying on inheritance."
    );
  }

  if (structure.inspectionFailed) {
    warnings.push(
      "Some parsed nodes could not be traversed for the anchor, alias, and merge-key counters. The formatted output still comes from the parsed document model; review the diff if those features matter."
    );
  }

  const { anchors, aliases } = structure;

  if (anchors || aliases) {
    warnings.push(
      `Anchor/alias syntax was detected (${anchors} anchor token${
        anchors === 1 ? "" : "s"
      }, ${aliases} alias token${
        aliases === 1 ? "" : "s"
      }). Review the formatted diff when aliases are important to the configuration graph.`
    );
  }

  if (countDirectives(input)) {
    warnings.push(
      "YAML directives are present. Formatting works through parsed documents, so verify version/tag directives in the formatted output before replacing the source."
    );
  }

  return {
    output,
    documents: documents.length,
    warnings,
    anchors,
    aliases,
    directives:
      countDirectives(input),
    inputLines: countLines(input),
    outputLines: countLines(output),
  };
}

export default function YamlFormatterPanel({ incoming, onSend }: WorkflowPanelProps) {
  const [input, setInput] =
    useState("");
  const [indentMode, setIndentMode] =
    useState<IndentMode>("2");
  const [widthMode, setWidthMode] =
    useState<WidthMode>("120");
  const [result, setResult] =
    useState<FormatResult | null>(null);
  const [error, setError] =
    useState("");
  const [copied, setCopied] =
    useState(false);

  // A handoff changes the input only when another operation sends a result.
  // Merely switching tabs keeps each operation's input, options, and result intact.
  useEffect(() => {
    if (!incoming) return;
    setInput(incoming.value);
    setResult(null);
    setError("");
    setCopied(false);
  }, [incoming]);

  const clearResult = () => {
    setResult(null);
    setError("");
    setCopied(false);
  };

  const formatYAML = () => {
    if (!input.trim()) {
      setError(
        "Paste YAML before formatting."
      );
      setResult(null);
      return;
    }

    try {
      const resultValue = formatYaml(
        input,
        Number(indentMode),
        Number(widthMode)
      );

      setResult(resultValue);
      setError("");
      setCopied(false);
    } catch (caught) {
      setResult(null);
      const templateNote = hasTemplateMarkers(input)
        ? "\n\nTemplate-like markers are present. If this is Helm, Jinja, or another generator, format the rendered YAML unless that template system has its own YAML-aware formatter."
        : "";

      setError(
        caught instanceof Error
          ? `YAML formatting stopped.\n${caught.message}${templateNote}`
          : `YAML formatting stopped because the input could not be parsed.${templateNote}`
      );
      setCopied(false);
    }
  };

  const loadExample = () => {
    setInput(SAMPLE_YAML);
    setResult(null);
    setError("");
    setCopied(false);
  };

  const copyOutput = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(
        result.output
      );
      setCopied(true);
      window.setTimeout(
        () => setCopied(false),
        1400
      );
    } catch {
      setCopied(false);
      setError(
        "The formatted YAML could not be copied. Select and copy it manually."
      );
    }
  };

  const resetAll = () => {
    setInput("");
    setIndentMode("2");
    setWidthMode("120");
    clearResult();
  };

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label
          htmlFor="yaml-formatter-input"
          className="block text-sm font-semibold text-gray-900"
        >
          YAML input
        </label>
        <p
          id="yaml-formatter-input-help"
          className="mt-1 text-sm leading-relaxed text-gray-500"
        >
          Multi-document streams are supported. Duplicate mapping keys are
          treated as errors rather than silently normalized.
        </p>

        <textarea
          id="yaml-formatter-input"
          aria-describedby="yaml-formatter-input-help"
          value={input}
          onChange={(event: {
            target: { value: string };
          }) => {
            setInput(event.target.value);
            clearResult();
          }}
          placeholder={`# Service configuration
profile:
  name: Sneha
  enabled: true`}
          spellCheck={false}
          className="mt-4 w-full min-h-[360px] rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <YoryantraSelect
          label="Indentation"
          value={indentMode}
          onChange={(value: string) => {
            setIndentMode(
              value as IndentMode
            );
            clearResult();
          }}
          options={[
            {
              label: "2 spaces",
              value: "2",
            },
            {
              label: "4 spaces",
              value: "4",
            },
          ]}
        />

        <YoryantraSelect
          label="Preferred line width"
          value={widthMode}
          onChange={(value: string) => {
            setWidthMode(
              value as WidthMode
            );
            clearResult();
          }}
          options={[
            {
              label: "80 characters",
              value: "80",
            },
            {
              label: "120 characters",
              value: "120",
            },
            {
              label:
                "No wrapping preference",
              value: "0",
            },
          ]}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={formatYAML}
          className="yoryantra-btn"
        >
          Format YAML
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="yoryantra-btn-outline"
        >
          Load Example
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {error ? (
        <div
          role="alert"
          className="mt-6 whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700"
        >
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Documents"
              value={result.documents.toLocaleString()}
            />
            <Stat
              label="Lines"
              value={`${result.inputLines} → ${result.outputLines}`}
            />
            <Stat
              label="Anchor / alias hints"
              value={`${result.anchors} / ${result.aliases}`}
            />
            <Stat
              label="Directives"
              value={result.directives.toLocaleString()}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Formatted YAML
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">
                  Formatting can normalize presentation even when the parsed
                  YAML meaning stays the same. Review important configuration
                  changes as a diff.
                </p>
              </div>

              <button
                type="button"
                onClick={copyOutput}
                className="yoryantra-btn-outline text-sm"
              >
                {copied
                  ? "Copied"
                  : "Copy"}
              </button>
            </div>

            <pre className="yoryantra-output mt-4 min-h-[280px] overflow-auto whitespace-pre font-mono text-sm">
              {result.output}
            </pre>
          </div>

          {result.warnings.length ? (
            <div
              role="status"
              className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900"
            >
              <strong>
                Review after formatting:
              </strong>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                {result.warnings
                  .slice(0, 10)
                  .map(
                    (
                      warning,
                      index
                    ) => (
                      <li
                        key={`${warning}-${index}`}
                      >
                        {warning}
                      </li>
                    )
                  )}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}


      {result && result.output ? (
        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <span className="text-sm text-gray-600">Use this result in:</span>
          <button type="button" className="yoryantra-btn-outline text-sm" onClick={() => onSend("validate", result.output)}>Validate YAML</button>
          <button type="button" className="yoryantra-btn-outline text-sm" onClick={() => onSend("yaml-to-json", result.output)}>Convert to JSON</button>
        </div>
      ) : null}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        The YAML text is parsed and serialized in the browser; the formatting
        code does not upload the configuration, execute template expressions,
        or fetch a product-specific schema. Configuration files often contain
        credentials, so browser extensions, the system clipboard, and site-wide
        analytics or advertising scripts remain separate privacy boundaries.
        Large or deeply nested streams are processed on the page and can briefly
        make the tab less responsive.
      </div>


    </>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}
