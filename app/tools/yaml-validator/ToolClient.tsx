"use client";

import { useMemo, useState } from "react";
import {
  isAlias,
  isMap,
  isScalar,
  isSeq,
  parseAllDocuments,
  visit,
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

const MAX_INPUT_CHARACTERS = 2_000_000;

function lineNumberAt(source: string, offset: number) {
  let line = 1;

  for (
    let index = 0;
    index < offset && index < source.length;
    index += 1
  ) {
    if (source.charCodeAt(index) === 10) {
      line += 1;
    }
  }

  return line;
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

function inspectDocumentNodes(
  document: ReturnType<typeof parseAllDocuments>[number],
  source: string
) {
  let anchors = 0;
  let aliases = 0;
  const yaml11PlainWords: string[] = [];

  try {
    visit(document, (_key, node) => {
      if (isAlias(node)) {
        aliases += 1;
        return;
      }

      if (
        (isMap(node) || isSeq(node) || isScalar(node)) &&
        typeof node.anchor === "string" &&
        node.anchor
      ) {
        anchors += 1;
      }

      if (
        isScalar(node) &&
        node.type === "PLAIN" &&
        typeof node.source === "string" &&
        /^(?:yes|no|on|off|y|n)$/i.test(node.source.trim())
      ) {
        const offset =
          node.range && typeof node.range[0] === "number"
            ? node.range[0]
            : 0;

        yaml11PlainWords.push(
          `${JSON.stringify(node.source.trim())} on line ${lineNumberAt(
            source,
            offset
          )}`
        );
      }
    });
  } catch {
    // Parser diagnostics remain authoritative if a partially composed
    // document cannot be traversed safely.
  }

  return {
    anchors,
    aliases,
    yaml11PlainWords,
  };
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

  if (source.length > MAX_INPUT_CHARACTERS) {
    return {
      valid: false,
      output: "",
      warnings: [],
      errors: [
        "The YAML input is larger than 2,000,000 characters. Validation was stopped before parsing to avoid freezing the browser on unusually large pasted data.",
      ],
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

  let anchors = 0;
  let aliases = 0;
  const yaml11PlainWords: string[] = [];
  let explicitYaml11 = false;

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

    const version =
      document.directives &&
      document.directives.yaml &&
      document.directives.yaml.version
        ? document.directives.yaml.version
        : "1.2";
    const versionIsExplicit = Boolean(
      document.directives &&
        document.directives.yaml &&
        document.directives.yaml.explicit
    );

    if (versionIsExplicit && version === "1.1") {
      explicitYaml11 = true;
    }

    documentLines.push(
      `Document ${index + 1}: ${rootType(
        document.contents
      )}; YAML ${version}${
        versionIsExplicit ? " directive" : " default"
      }.`
    );

    const nodeInfo = inspectDocumentNodes(
      document,
      source
    );
    anchors += nodeInfo.anchors;
    aliases += nodeInfo.aliases;
    yaml11PlainWords.push(
      ...nodeInfo.yaml11PlainWords
    );
  });

  if (anchors || aliases) {
    warnings.push(
      `Anchors/aliases present: ${anchors} anchored node${
        anchors === 1 ? "" : "s"
      }, ${aliases} alias node${
        aliases === 1 ? "" : "s"
      }. Valid syntax does not prove that alias expansion is safe or appropriate for the application consuming the file.`
    );
  }

  if (explicitYaml11) {
    warnings.push(
      "At least one document explicitly declares YAML 1.1. Its scalar resolution and legacy types can differ from YAML 1.2; compare the result with the version and schema used by the target application."
    );
  }

  if (yaml11PlainWords.length && !explicitYaml11) {
    warnings.push(
      `YAML 1.1-style boolean words appear as plain scalars: ${yaml11PlainWords
        .slice(0, 6)
        .join(", ")}${
        yaml11PlainWords.length > 6 ? " …" : ""
      }. Under the YAML 1.2 core schema they are strings; older 1.1-oriented consumers may interpret them differently.`
    );
  }

  if (/^\s*<<\s*:/m.test(source)) {
    warnings.push(
      "A << merge-key-looking entry is present. Merge-key behavior is schema/application dependent and is not a YAML 1.2 core-language guarantee."
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
      ? "YAML syntax is valid under strict parsing. YAML 1.2 is the default when a document has no explicit version directive."
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
  const [copyError, setCopyError] = useState("");

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
    setCopyError("");
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
    setCopyError("");
    setCopyError("");
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
    setCopyError("");
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
      setCopyError("");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setCopyError(
        "Clipboard access was blocked by the browser. Select the diagnostics and copy them manually."
      );
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
            <label htmlFor="yaml-validator-input" className="block text-sm font-semibold text-gray-900">
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
          id="yaml-validator-input"
          value={input}
          onChange={(event: { target: { value: string } }) => {
            setInput(event.target.value);
            setResult(null);
            setCopied(false);
            setCopyError("");
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

      {copyError ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {copyError}
        </div>
      ) : null}

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
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-gray-900">
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
        bundled YAML parser. No validation API receives the YAML, and no
        product-specific schema is fetched. Site-wide analytics or advertising
        scripts, if enabled, are separate from the validation operation.
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
            Parser diagnostics include the line and column where composition
            failed instead of guessing from quote counts or indentation
            heuristics alone.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Read the highlighted location as the point where parsing could no
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

        <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Duplicate Mapping Keys Are Not a Harmless “Last One Wins” Style
          </h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            YAML mappings require unique keys. Silently keeping the last value
            can hide configuration mistakes—especially when a long deployment
            file contains two copies of <code>image</code>,{" "}
            <code>environment</code>, or another important setting. This
            strict parsing keeps unique-key checking enabled and reports
            duplicates as errors. YAML 1.2 defines a mapping as a set of
            key/value pairs whose keys are unique.
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
            Syntax validation answers “does this parse as YAML?” A second,
            product-specific pass is still needed for questions such as “does
            this Kubernetes resource satisfy its API schema?” or “does this
            Compose service reference something that actually exists?”
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
            Documents without a version directive use YAML 1.2 as the default;
            an explicit <code>%YAML 1.1</code> directive is reported separately.
            The{" "}
            <a
              href="https://yaml.org/spec/1.2.2/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              YAML 1.2.2 specification
            </a>{" "}
            defines the core schema in which <code>true</code> and{" "}
            <code>false</code> are booleans while words such as{" "}
            <code>yes</code> and <code>on</code> remain strings. A clean parse
            still does not promise that another application's YAML library uses
            the same version, schema, or custom tags.
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
            Their presence is reported as a review note rather than an error.
            For untrusted YAML, the consuming parser should also have sensible
            alias and resource limits so deliberately expansive graphs cannot
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
            The complete stream is parsed and each document's root type and
            effective YAML version are reported, making it clear whether the
            input contains one mapping, several documents, a sequence, a scalar,
            or an empty document.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Validate Rendered YAML, Not Only the Template Source
          </h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            Helm, Jinja-style templates, CI substitutions, and other generators
            may contain <code>{"{{ ... }}"}</code> or other syntax that is not
            the final YAML sent to the application. The template can be
            internally correct while the rendered output is broken for one set
            of values—or the template source can fail a generic YAML parser even
            though rendering would remove the placeholders.
          </p>
          <p className="mt-4 leading-relaxed text-gray-700">
            For deployment confidence, render with representative production
            values and validate the resulting YAML as a separate step.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Move From YAML Syntax to the Configuration It Represents
          </h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/yaml-validator" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
