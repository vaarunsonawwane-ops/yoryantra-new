"use client";

import { useState } from "react";
import {
  parseAllDocuments,
} from "yaml";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
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
    .filter((line) =>
      /^%(?:YAML|TAG)\b/.test(
        line.trim()
      )
    ).length;
}

function countReferenceTokens(
  source: string,
  token: "&" | "*"
) {
  let count = 0;
  let single = false;
  let double = false;
  let comment = false;
  let escaped = false;

  for (
    let index = 0;
    index < source.length;
    index += 1
  ) {
    const char = source[index];

    if (char === "\n") {
      comment = false;
    }

    if (comment) {
      continue;
    }

    if (double) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        double = false;
      }

      continue;
    }

    if (single) {
      if (
        char === "'" &&
        source[index + 1] === "'"
      ) {
        index += 1;
      } else if (char === "'") {
        single = false;
      }

      continue;
    }

    if (char === "#") {
      comment = true;
      continue;
    }

    if (char === '"') {
      double = true;
      continue;
    }

    if (char === "'") {
      single = true;
      continue;
    }

    if (
      char === token &&
      /[\s\[\]{},?:-]/.test(
        source[index - 1] || "\n"
      ) &&
      /[A-Za-z0-9_-]/.test(
        source[index + 1] || ""
      )
    ) {
      count += 1;
    }
  }

  return count;
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

  if (
    input.indexOf("{{") !== -1 ||
    input.indexOf("{%") !== -1
  ) {
    warnings.push(
      "Template markers were detected. Formatting template source can be misleading when the final rendered YAML has different structure."
    );
  }

  if (
    /^\s*<<\s*:/m.test(input)
  ) {
    warnings.push(
      "A << merge-key-looking entry is present. Formatting preserves the document representation, but merge semantics still depend on the parser/application schema that consumes the file."
    );
  }

  const anchors =
    countReferenceTokens(input, "&");
  const aliases =
    countReferenceTokens(input, "*");

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
      "YAML directives are present. The formatter works through parsed documents, so verify version/tag directives in the formatted output before replacing the source."
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

export default function ToolClient() {
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
      setError(
        caught instanceof Error
          ? `YAML formatting stopped.\n${caught.message}`
          : "YAML formatting stopped because the input could not be parsed."
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
    <ToolShell
      title="YAML Formatter"
      description="Reformat YAML through its parsed document model so comments, anchors, aliases, directives, tags, and multi-document structure are retained where possible instead of being discarded by an object round trip."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block text-sm font-semibold text-gray-900">
          YAML input
        </label>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">
          Multi-document streams are supported. Duplicate mapping keys are
          treated as errors rather than silently normalized.
        </p>

        <textarea
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
        <div className="mt-6 whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
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
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
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

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        YAML parsing and formatting happen on the pasted text in your browser.
        The tool does not upload the configuration or fetch a
        product-specific schema. Site-wide analytics or advertising scripts,
        if enabled, are separate from this operation.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            A YAML Formatter Is Performing a Controlled Rewrite, Not Just Adding Spaces
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JSON can be prettified by changing insignificant whitespace around
            tokens. YAML presentation is richer: indentation, block versus flow
            collections, quote style, scalar folding, comments, directives,
            anchors, aliases, and document markers all participate in the
            source text.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This formatter therefore parses YAML into the library&apos;s document
            model and serializes those documents again with your indentation
            and line-width preferences. It is intentionally different from
            loading YAML into plain JavaScript values and generating an entirely
            new YAML file from those values.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Why the Document Model Matters for Comments and Aliases
          </h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-white p-4 text-sm leading-7 text-gray-800">{`# shared limits
limits: &defaults
  cpu: 500m
  memory: 512Mi

worker:
  limits: *defaults`}</pre>
          <p className="mt-4 leading-relaxed text-gray-600">
            If that file is immediately converted to a normal JavaScript object,
            the comment has nowhere to live and the alias relationship may be
            resolved into repeated data. A YAML document/AST representation can
            carry more of the original YAML-specific information through the
            formatting operation.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            “Preserved where possible” is still the important qualifier.
            Serialization can normalize whitespace and scalar presentation, so
            formatting should not be treated as byte-for-byte preservation.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Line Width Is a Presentation Preference, Not a Maximum-Line Guarantee
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The preferred width helps the serializer decide when certain
            scalars or collections can be rendered more readably. YAML cannot
            safely wrap every long value at an arbitrary column: URLs, quoted
            strings, block scalars, flow collections, and syntax-sensitive
            content can require different treatment.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Choose 80 or 120 when your repository has a readability convention.
            Choose no wrapping preference when preserving long scalar
            presentation is more useful than aiming for a particular width.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            Formatting a Configuration File Can Create a Large Diff Without Changing Its Intended Data
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            Quote choices, block styles, blank lines, sequence indentation, and
            wrapping can all change at once. That can make a simple formatting
            pass look like a substantial configuration edit in version control.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            For production Kubernetes, Compose, CI, or application config,
            format on a clean branch and inspect the diff before committing.
            Avoid mixing broad formatting with an unrelated behavior change
            when reviewers need to understand exactly what changed.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Mapping Order Is Useful to Maintainers Even When the Data Model Does Not Depend on It
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Teams often keep metadata, image, ports, environment, resources, or
            other related configuration close together. A formatter should not
            alphabetize keys unless that is an explicit policy because the
            human grouping can carry maintenance value.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This tool does not include a “sort keys” switch. YAML formatting and
            configuration reorganization are separate operations and are easier
            to review when kept separate.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Directives, Tags, Anchors, and Merge Behavior Deserve a Diff Check
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            YAML can declare a version, define tag handles, attach tags to
            nodes, and connect nodes using anchors and aliases. Some
            applications also support merge-key conventions. These are exactly
            the kinds of files where “it still parses” is not enough reason to
            replace the original without inspecting the rendered output.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The{" "}
            <a
              href="https://yaml.org/spec/1.2.2/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              YAML 1.2.2 specification
            </a>{" "}
            is useful when a formatter and a target application disagree about
            a YAML-language feature; the application&apos;s own schema and parser
            rules remain relevant as well.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Valid and Nicely Formatted YAML Can Still Be Invalid for Its Destination
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A Kubernetes Deployment, Docker Compose file, GitHub Actions
            workflow, Ansible playbook, or application config has rules beyond
            YAML syntax. Required fields, allowed enum values, cross-references,
            API versions, and runtime constraints belong to the consuming
            product.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Use formatting to make the YAML maintainable. Use a
            product-specific validator when you need to know whether the
            configuration is actually acceptable.
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Template Source Is a Special Case
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Helm, Jinja-style templates, CI expressions, and other generators
            may insert syntax that is not ordinary YAML until after rendering.
            Running a generic YAML formatter directly over the template source
            can fail or can rearrange text in a way the template engine did not
            expect.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            When the file is generated, format the rendered YAML unless the
            template system explicitly supports a YAML-aware formatter for its
            source language.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <YoryantraRelatedTools currentHref="/tools/yaml-formatter" />
        </div>
      </section>
    </ToolShell>
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
