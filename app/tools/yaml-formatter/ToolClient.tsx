"use client";

import { useState } from "react";
import {
  isAlias,
  isCollection,
  isPair,
  isScalar,
  parseAllDocuments,
  visit,
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
    <ToolShell
      title="YAML Formatter"
      description="Reformat YAML while retaining comments, anchors, aliases, directives, tags, and document boundaries where possible."
    >
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

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        The YAML text is parsed and serialized in the browser; the formatting
        code does not upload the configuration, execute template expressions,
        or fetch a product-specific schema. Configuration files often contain
        credentials, so browser extensions, the system clipboard, and site-wide
        analytics or advertising scripts remain separate privacy boundaries.
        Large or deeply nested streams are processed on the page and can briefly
        make the tab less responsive.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            YAML formatting is a rewrite, not just indentation
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JSON can be prettified by changing insignificant whitespace around
            tokens. YAML presentation is richer: indentation, block versus flow
            collections, quote style, scalar folding, comments, directives,
            anchors, aliases, and document markers all participate in the
            source text.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The input is parsed into the library&apos;s document model and serialized
            again with the chosen indentation and line width. That keeps
            YAML-specific structure available to the serializer instead of first
            collapsing the document into plain JavaScript values.
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
            formatting should not be treated as byte-for-byte preservation. The{" "}
            <a
              href="https://eemeli.org/yaml/#comments-and-blank-lines"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              yaml library documentation
            </a>{" "}
            also notes that comment attachment is not perfectly stable, especially
            around trailing comments. Review the diff when comments carry
            operational meaning.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Line Width Is a Presentation Preference, Not a Maximum-Line Guarantee
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The underlying{" "}
            <a
              href="https://eemeli.org/yaml/#options"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              yaml package
            </a>{" "}
            treats <code>lineWidth</code> as a soft maximum; setting it to 0
            disables folding. YAML cannot safely wrap every long value at an
            arbitrary column, so a long scalar may still exceed 80 or 120
            characters.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Choose 80 or 120 when your repository has a readability convention.
            Choose no wrapping preference when keeping long scalar presentation
            matters more than targeting a particular width.
          </p>
        </div>

        <div className="mt-12 self-start rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            A formatting pass can create a large diff
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
            Keep mapping order for maintainers, not application meaning
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Teams often keep metadata, image, ports, environment, resources, or
            other related configuration close together. Alphabetizing keys should
            be a separate choice because the human grouping can carry maintenance
            value.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Key sorting is intentionally left out. Reformatting and reorganizing
            a configuration are separate edits and are easier to review when
            kept separate.
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
            defines directives, tags, anchors, aliases, and the separation between
            presentation details and the representation model. When the target
            application disagrees, its own parser and schema rules still decide
            what it accepts.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            A YAML version change can change plain-scalar meaning
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Without an explicit <code>%YAML</code> directive, the parser defaults
            to YAML 1.2 and its core schema. YAML 1.1 resolves some familiar plain
            scalars differently: values such as <code>yes</code>, <code>no</code>,
            <code>on</code>, and <code>off</code> can become booleans instead of
            strings. A formatting pass cannot prove that a different runtime will
            resolve every scalar the same way.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            If the destination has a fixed parser or schema, validate the
            formatted file with that same stack before replacing production
            configuration.
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
            Running generic YAML formatting directly over the template source can
            fail or can rearrange text in a way the template engine did not expect.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            When the file is generated, format the rendered YAML unless the
            template system explicitly supports YAML-aware formatting for its
            source language.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/yaml-formatter" />
          </div>
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
