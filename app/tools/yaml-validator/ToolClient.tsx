"use client";

import { useMemo, useState } from "react";
import {
  isMap,
  isScalar,
  isSeq,
  parseAllDocuments,
} from "yaml";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type ValidationResult = {
  valid: boolean;
  output: string;
  warnings: string[];
  errors: string[];
  documentCount: number;
};

function countReferenceTokens(
  source: string,
  token: "&" | "*"
) {
  let count = 0;
  let single = false;
  let double = false;
  let comment = false;
  let escaped = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];

    if (char === "\n") {
      comment = false;
    }

    if (comment) continue;

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
      if (char === "'" && source[index + 1] === "'") {
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
      /[\s\[\]{},?:-]/.test(source[index - 1] || "\n") &&
      /[A-Za-z0-9_-]/.test(source[index + 1] || "")
    ) {
      count += 1;
    }
  }

  return count;
}

function rootType(contents: unknown) {
  if (contents === null) return "empty document";
  if (isMap(contents)) {
    return `mapping (${contents.items.length} pair${
      contents.items.length === 1 ? "" : "s"
    })`;
  }

  if (isSeq(contents)) {
    return `sequence (${contents.items.length} item${
      contents.items.length === 1 ? "" : "s"
    })`;
  }

  if (isScalar(contents)) {
    const value = contents.value;

    if (value === null) return "null scalar";
    if (typeof value === "string") return "string scalar";
    if (typeof value === "number") return "number scalar";
    if (typeof value === "boolean") return "boolean scalar";

    return "scalar";
  }

  return "unknown root";
}

function formatParserDiagnostic(
  diagnostic: {
    code?: string;
    message?: string;
    linePos?: Array<{ line: number; col: number }>;
  },
  documentIndex: number
) {
  const position =
    diagnostic.linePos && diagnostic.linePos.length
      ? diagnostic.linePos[0]
      : null;

  const location = position
    ? `line ${position.line}, column ${position.col}`
    : "location unavailable";
  const code = diagnostic.code
    ? ` [${diagnostic.code}]`
    : "";

  return `Document ${documentIndex + 1}, ${location}${code}: ${
    diagnostic.message || "YAML parser diagnostic."
  }`;
}

function findYaml11BooleanWords(source: string) {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const hits: string[] = [];

  lines.forEach((line, index) => {
    const withoutComment = line.split("#")[0];

    if (
      /(?:^|:\s+|-\s+)(?:yes|no|on|off|y|n)(?:\s*$|\s*,|\s*\]|\s*\})/i.test(
        withoutComment
      )
    ) {
      hits.push(`line ${index + 1}`);
    }
  });

  return hits;
}

function validateYaml(source: string): ValidationResult {
  if (!source.trim()) {
    return {
      valid: false,
      output: "",
      warnings: [],
      errors: ["YAML content is empty."],
      documentCount: 0,
    };
  }

  let documents;

  try {
    documents = parseAllDocuments(source, {
      prettyErrors: true,
      strict: true,
      uniqueKeys: true,
      version: "1.2",
    });
  } catch (error) {
    return {
      valid: false,
      output: "",
      warnings: [],
      errors: [
        error instanceof Error
          ? `Parser stopped unexpectedly: ${error.message}`
          : "Parser stopped unexpectedly while reading the YAML.",
      ],
      documentCount: 0,
    };
  }

  const errors: string[] = [];
  const warnings: string[] = [];
  const documentLines: string[] = [];

  documents.forEach((document, index) => {
    document.errors.forEach((diagnostic) => {
      errors.push(
        formatParserDiagnostic(diagnostic, index)
      );
    });

    document.warnings.forEach((diagnostic) => {
      warnings.push(
        formatParserDiagnostic(diagnostic, index)
      );
    });

    documentLines.push(
      `Document ${index + 1}: ${rootType(document.contents)}`
    );
  });

  const anchors = countReferenceTokens(source, "&");
  const aliases = countReferenceTokens(source, "*");

  if (anchors || aliases) {
    warnings.push(
      `Anchors/aliases detected: ${anchors} anchor token${
        anchors === 1 ? "" : "s"
      }, ${aliases} alias token${
        aliases === 1 ? "" : "s"
      }. Valid syntax does not prove that alias expansion is safe or appropriate for the application consuming the file.`
    );
  }

  if (/^%YAML\s+1\.1\s*$/m.test(source)) {
    warnings.push(
      "This stream explicitly declares YAML 1.1. Scalar resolution and legacy types can differ from YAML 1.2; validate against the same version/schema used by the target application."
    );
  }

  if (/^\s*<<\s*:/m.test(source)) {
    warnings.push(
      "A << merge-key-looking entry is present. Merge-key behavior is schema/application dependent and is not a YAML 1.2 core-language guarantee."
    );
  }

  const yaml11Words = findYaml11BooleanWords(source);

  if (
    yaml11Words.length &&
    !/^%YAML\s+1\.1\s*$/m.test(source)
  ) {
    warnings.push(
      `Plain words such as yes/no/on/off appear on ${yaml11Words
        .slice(0, 6)
        .join(", ")}${
        yaml11Words.length > 6 ? " …" : ""
      }. YAML 1.2 core treats these as strings, while some YAML 1.1-oriented consumers historically resolve them as booleans.`
    );
  }

  if (/\t/.test(source)) {
    warnings.push(
      "Tab characters are present. Tabs are not allowed for YAML indentation, although they can occur inside some scalar content. Parser errors above determine whether the tabs actually broke this stream."
    );
  }

  if (
    source.indexOf("{{") !== -1 ||
    source.indexOf("{%") !== -1
  ) {
    warnings.push(
      "Template markers were detected. Helm/Jinja-style template source may not itself be the final YAML; render the template before treating syntax validation as validation of the deployed document."
    );
  }

  const valid = errors.length === 0;
  const summary = [
    valid
      ? "YAML syntax is valid under strict YAML 1.2 parsing."
      : "YAML syntax / composition problems were found.",
    `Documents parsed: ${documents.length}`,
    `Parser errors: ${errors.length}`,
    `Parser warnings: ${documents.reduce(
      (count, document) =>
        count + document.warnings.length,
      0
    )}`,
    "",
    ...documentLines,
  ].join("\n");

  return {
    valid,
    output: summary,
    warnings,
    errors,
    documentCount: documents.length,
  };
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [result, setResult] =
    useState<ValidationResult | null>(null);
  const [copied, setCopied] = useState(false);

  const lineCount = useMemo(
    () =>
      input
        ? input.replace(/\r\n?/g, "\n").split("\n").length
        : 0,
    [input]
  );

  const validate = () => {
    setResult(validateYaml(input));
    setCopied(false);
  };

  const loadBrokenExample = () => {
    const example = `profile:
  name: Sneha
  roles:
    - editor
    - reviewer
  settings:
    theme: dark
   notifications: true`;

    setInput(example);
    setResult(validateYaml(example));
    setCopied(false);
  };

  const loadValidExample = () => {
    const example = `---
profile:
  name: Sneha
  active: true
  roles:
    - editor
    - reviewer
---
service:
  enabled: true
  retries: 3`;

    setInput(example);
    setResult(validateYaml(example));
    setCopied(false);
  };

  const reset = () => {
    setInput("");
    setResult(null);
    setCopied(false);
  };

  const copyResult = async () => {
    if (!result) return;

    const text = [
      result.output,
      result.errors.length
        ? `\nErrors\n------\n${result.errors.join("\n\n")}`
        : "",
      result.warnings.length
        ? `\nWarnings / review notes\n-----------------------\n${result.warnings.join(
            "\n\n"
          )}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <ToolShell
      title="YAML Validator"
      description="Validate YAML with a strict YAML 1.2 parser, get document-level syntax diagnostics, and separate real parser failures from schema or application-specific configuration rules."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <label className="block text-sm font-semibold text-gray-900">
              YAML input
            </label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Multi-document streams are supported. Duplicate mapping keys are treated as parser errors.
            </p>
          </div>
          <p className="text-xs text-gray-500">
            {lineCount.toLocaleString()} line
            {lineCount === 1 ? "" : "s"}
          </p>
        </div>

        <textarea
          value={input}
          onChange={(event: { target: { value: string } }) => {
            setInput(event.target.value);
            setResult(null);
            setCopied(false);
          }}
          placeholder={`profile:\n  name: Sneha\n  roles:\n    - editor\n    - reviewer`}
          spellCheck={false}
          className="mt-4 w-full min-h-[360px] rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={validate} className="yoryantra-btn">
          Validate YAML
        </button>
        <button type="button" onClick={loadBrokenExample} className="yoryantra-btn-outline">
          Load Broken Example
        </button>
        <button type="button" onClick={loadValidExample} className="yoryantra-btn-outline">
          Load Valid Stream
        </button>
        <button type="button" onClick={reset} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Validation result
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Strict YAML 1.2 syntax/composition is checked here; application schemas are not.
            </p>
          </div>

          {result ? (
            <button
              type="button"
              onClick={copyResult}
              className="yoryantra-btn-outline text-sm"
            >
              {copied ? "Copied" : "Copy diagnostics"}
            </button>
          ) : null}
        </div>

        <pre
          className={`mt-4 yoryantra-output min-h-[210px] overflow-auto whitespace-pre-wrap break-words text-sm ${
            result && !result.valid ? "text-red-700" : ""
          }`}
        >
          {result
            ? result.output
            : "YAML parser summary will appear here."}
        </pre>
      </div>

      {result && result.errors.length ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-800">
          <strong>Parser errors:</strong>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            {result.errors.map((error) => (
              <li key={error} className="whitespace-pre-wrap">
                {error}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {result && result.warnings.length ? (
        <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-900">
          <strong>Warnings / compatibility notes:</strong>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            {result.warnings.map((warning) => (
              <li key={warning} className="whitespace-pre-wrap">
                {warning}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Validation is performed on the pasted text in your browser using the
        bundled YAML parser. The tool does not upload the YAML or fetch a
        product-specific schema. Site-wide analytics or advertising scripts,
        if enabled, are separate from this validation operation.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            When YAML Breaks, the Error Is Often One Character Away From the Real Cause
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            YAML uses indentation and punctuation to express structure, so a
            parser error reported on line 12 may have been caused by a missing
            quote, colon, closing bracket, or indentation change on line 11.
            The validator reports the parser's line and column instead of trying
            to diagnose YAML with quote counts or indentation heuristics alone.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Read the highlighted location as the place where the parser could no
            longer continue confidently—not always as the exact character you
            should edit.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900">
              Indentation changes structure
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Sibling mapping keys need the same indentation level. A single
              extra or missing space can move a value into another mapping or
              make the stream invalid.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900">
              Tabs are not indentation
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              YAML indentation uses spaces. A tab may appear inside some scalar
              content, but using tabs to create indentation is a parser error.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900">
              : and # are context-sensitive
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              A colon followed by separation can introduce a mapping value, and
              # can start a comment in plain-scalar contexts. Quote text when
              punctuation would otherwise be interpreted as YAML structure.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900">
              Flow collections still follow YAML rules
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Bracketed sequences and brace-style mappings look JSON-like but
              are still parsed as YAML and have their own indicator and
              separation rules.
            </p>
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-xl font-semibold text-red-900">
            Duplicate Mapping Keys Are Not a Harmless “Last One Wins” Style
          </h2>
          <p className="mt-4 leading-relaxed text-red-900/90">
            YAML mappings require unique keys. Silently keeping the last value
            can hide configuration mistakes—especially when a long deployment
            file contains two copies of <code>image</code>,{" "}
            <code>environment</code>, or another important setting. This
            validator keeps unique-key checking enabled and reports duplicates
            as errors.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Valid YAML Is Not the Same Thing as a Valid Kubernetes, Compose, or CI File
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A parser can confirm that your stream obeys YAML syntax and
            composition rules. It cannot know that a Kubernetes Deployment has
            the required fields, a Docker Compose service references a real
            volume, or a CI workflow uses supported action keys.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            That is why Yoryantra has separate Kubernetes and Docker Compose
            validators. Use this generic YAML validator when your first question
            is “does this parse as YAML?” and a product-specific validator when
            your question is “will this configuration work?”
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            YAML Version and Schema Affect What an Unquoted Word Means
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Syntax and scalar resolution are related but different. YAML 1.2
            core treats familiar words such as <code>yes</code>,{" "}
            <code>no</code>, <code>on</code>, and <code>off</code> as strings,
            while YAML 1.1-oriented software has historically treated some of
            them as booleans. Application-specific schemas can add their own
            tags and conversions.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The validator defaults documents without a version directive to
            YAML 1.2 and warns about several common compatibility patterns. A
            clean result still does not promise that another application's YAML
            library resolves every scalar in exactly the same way.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Anchors and Aliases Are Valid YAML, but They Add a Graph Layer
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Anchors such as <code>&amp;defaults</code> name a node and aliases
            such as <code>*defaults</code> refer back to it. They can reduce
            repetition, but downstream applications differ in whether they
            accept aliases, impose expansion limits, or transform them into
            ordinary values.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The validator reports their presence as a review note rather than
            an error. For untrusted YAML, the consuming parser should also have
            sensible resource limits so deliberately large alias graphs cannot
            exhaust memory or processing time.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Multi-Document Streams Are Normal YAML
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A stream can contain several YAML documents, commonly separated by{" "}
            <code>---</code>. Kubernetes files often use this to keep several
            resources together. A validator that assumes one document can
            wrongly reject perfectly valid YAML or inspect only the first
            resource.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This page parses the complete stream and reports each document's
            root type so you can tell whether you actually supplied one mapping,
            several objects, a sequence, a scalar, or an empty document.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            Validate Rendered YAML, Not Only the Template Source
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            Helm, Jinja-style templates, CI substitutions, and other generators
            may contain <code>{"{{ ... }}"}</code> or other syntax that is not
            the final YAML sent to the application. The template can be
            internally correct while the rendered output is broken for one set
            of values—or the template source can fail a generic YAML parser even
            though rendering would remove the placeholders.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            For deployment confidence, render with representative production
            values and validate the resulting YAML as a separate step.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            The YAML Specification Is Useful When a Parser Disagreement Matters
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Most everyday errors can be fixed from the parser message alone.
            The YAML 1.2.2 specification becomes valuable when two tools
            disagree about directives, scalar syntax, mappings, anchors, or
            another edge case and you need the language rule rather than a
            framework convention.
          </p>
          <p className="mt-4 text-sm">
            <a
              href="https://yaml.org/spec/1.2.2/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              YAML 1.2.2 specification
            </a>
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <YoryantraRelatedTools currentHref="/tools/yaml-validator" />
        </div>
      </section>
    </ToolShell>
  );
}
