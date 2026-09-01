"use client";

import { useMemo, useState } from "react";
import * as yaml from "js-yaml";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type ConversionResult = {
  output: string;
  warnings: string[];
  notes: string[];
  documentCount: number;
  error: string;
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

function hasNonFinite(
  value: unknown,
  seen = new Set<object>()
): boolean {
  if (typeof value === "number") {
    return !Number.isFinite(value);
  }

  if (!value || typeof value !== "object") {
    return false;
  }

  if (seen.has(value as object)) {
    return false;
  }

  seen.add(value as object);

  if (Array.isArray(value)) {
    return value.some((item) =>
      hasNonFinite(item, seen)
    );
  }

  return Object.keys(
    value as Record<string, unknown>
  ).some((key) =>
    hasNonFinite(
      (value as Record<string, unknown>)[key],
      seen
    )
  );
}

function findJsonKeyRiskLines(source: string) {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const matches: string[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.replace(/^\s+/, "");

    if (
      /^(?:-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null)\s*:/.test(
        trimmed
      )
    ) {
      matches.push(`line ${index + 1}`);
    }
  });

  return matches;
}

function rootType(value: unknown) {
  if (value === null) return "null";

  if (Array.isArray(value)) {
    return `array (${value.length} item${
      value.length === 1 ? "" : "s"
    })`;
  }

  if (typeof value === "object") {
    const count = Object.keys(
      value as Record<string, unknown>
    ).length;

    return `object (${count} key${count === 1 ? "" : "s"})`;
  }

  return typeof value;
}

function parserErrorMessage(error: unknown) {
  const candidate = error as Error & {
    mark?: {
      line?: number;
      column?: number;
      snippet?: string;
    };
  };

  const line =
    candidate.mark &&
    typeof candidate.mark.line === "number"
      ? candidate.mark.line + 1
      : null;
  const column =
    candidate.mark &&
    typeof candidate.mark.column === "number"
      ? candidate.mark.column + 1
      : null;

  const location = line
    ? `Line ${line}${
        column ? `, column ${column}` : ""
      }: `
    : "";

  return `${location}${
    candidate.message || "Invalid YAML."
  }`;
}

function convertYamlToJson(
  source: string,
  indent: number
): ConversionResult {
  if (!source.trim()) {
    return {
      output: "",
      warnings: [],
      notes: [],
      documentCount: 0,
      error: "Enter YAML to convert.",
    };
  }

  const documents: unknown[] = [];

  try {
    yaml.loadAll(
      source,
      (document) => documents.push(document),
      { schema: yaml.JSON_SCHEMA }
    );
  } catch (error) {
    return {
      output: "",
      warnings: [],
      notes: [],
      documentCount: 0,
      error: parserErrorMessage(error),
    };
  }

  const warnings: string[] = [];
  const notes: string[] = [];
  const anchors = countReferenceTokens(source, "&");
  const aliases = countReferenceTokens(source, "*");

  if (anchors || aliases) {
    warnings.push(
      `YAML anchor/alias syntax detected (${anchors} anchor token${
        anchors === 1 ? "" : "s"
      }, ${aliases} alias token${
        aliases === 1 ? "" : "s"
      }). Anchors are resolved while loading; JSON cannot preserve anchor names or shared-reference identity.`
    );
  }

  if (/^\s*\?\s+/m.test(source)) {
    warnings.push(
      "An explicit complex mapping key was detected. JSON object names are strings, so complex YAML key semantics cannot be represented faithfully."
    );
  }

  const keyRisks = findJsonKeyRiskLines(source);

  if (keyRisks.length) {
    warnings.push(
      `A mapping key that looks like a YAML number/boolean/null appears on ${keyRisks
        .slice(0, 5)
        .join(", ")}${
        keyRisks.length > 5 ? " …" : ""
      }. JSON object names are strings, so key type information is not preserved.`
    );
  }

  if (/^\s*<<\s*:/m.test(source)) {
    warnings.push(
      "A << merge-key-looking entry was detected. This converter intentionally uses a JSON-compatible YAML schema and does not apply YAML 1.1 merge-key semantics; review the output instead of assuming inheritance occurred."
    );
  }

  if (
    /(?:^|[\s\[\]{},?:-])![!A-Za-z][^\s\[\]{},]*/m.test(
      source
    )
  ) {
    warnings.push(
      "Explicit YAML tag syntax is present. The JSON-compatible schema accepts only values it can resolve without application-specific tag handling; unsupported tags may fail parsing."
    );
  }

  if (/^%YAML\s+1\.1\s*$/m.test(source)) {
    warnings.push(
      "The stream declares YAML 1.1, but this converter deliberately uses JSON-compatible scalar resolution. Values such as legacy booleans or timestamps may therefore remain strings instead of following a YAML 1.1 application's type rules."
    );
  }

  if (documents.length > 1) {
    warnings.push(
      `The stream contains ${documents.length} YAML documents. A JSON text has one top-level value, so the converter wraps the documents in one JSON array.`
    );
  }

  if (documents.length === 0) {
    return {
      output: "",
      warnings,
      notes,
      documentCount: 0,
      error: "The YAML stream contains no documents.",
    };
  }

  const value =
    documents.length === 1 ? documents[0] : documents;

  if (hasNonFinite(value)) {
    return {
      output: "",
      warnings,
      notes,
      documentCount: documents.length,
      error:
        "The resolved YAML data contains a non-finite numeric value, which JSON cannot represent as a number.",
    };
  }

  documents.forEach((document, index) => {
    notes.push(
      `Document ${index + 1} root: ${rootType(document)}.`
    );
  });

  notes.push(
    "Comments, YAML directives, scalar presentation style, document markers, anchor names, and aliases are presentation/graph features that JSON output cannot retain."
  );

  try {
    return {
      output: JSON.stringify(value, null, indent),
      warnings,
      notes,
      documentCount: documents.length,
      error: "",
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to serialize the resolved YAML graph as JSON.";

    return {
      output: "",
      warnings,
      notes,
      documentCount: documents.length,
      error: `${message} YAML aliases can create graph relationships, including cycles, that ordinary JSON cannot serialize.`,
    };
  }
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState(2);
  const [result, setResult] =
    useState<ConversionResult | null>(null);
  const [copied, setCopied] = useState(false);

  const lineCount = useMemo(
    () =>
      input
        ? input.replace(/\r\n?/g, "\n").split("\n").length
        : 0,
    [input]
  );

  const convert = () => {
    setResult(convertYamlToJson(input, indent));
    setCopied(false);
  };

  const loadExample = () => {
    const example = `---
profile:
  name: Sneha
  active: true
  launch_date: 2026-09-01
  roles: [editor, reviewer]
---
environment:
  name: production
  replicas: 3`;

    setInput(example);
    setResult(convertYamlToJson(example, indent));
    setCopied(false);
  };

  const reset = () => {
    setInput("");
    setIndent(2);
    setResult(null);
    setCopied(false);
  };

  const copyOutput = async () => {
    if (!result || !result.output) return;

    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <ToolShell
      title="YAML to JSON Converter"
      description="Convert one or more YAML documents to JSON using JSON-compatible scalar resolution, while making YAML-only features and conversion loss visible."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <label className="block text-sm font-semibold text-gray-900">
              YAML input
            </label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Multi-document streams separated with --- are supported.
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
          placeholder={`profile:\n  name: Sneha\n  active: true\n  roles:\n    - editor\n    - reviewer`}
          spellCheck={false}
          className="mt-4 w-full min-h-[340px] rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            JSON indentation
          </label>
          <select
            value={indent}
            onChange={(event: { target: { value: string } }) => {
              setIndent(Number(event.target.value));
              setResult(null);
              setCopied(false);
            }}
            className="rounded-xl border border-gray-300 bg-white p-3 text-sm"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
          </select>
        </div>

        <button type="button" onClick={convert} className="yoryantra-btn">
          Convert to JSON
        </button>
        <button type="button" onClick={loadExample} className="yoryantra-btn-outline">
          Load Multi-Document Example
        </button>
        <button type="button" onClick={reset} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {result && result.error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700 whitespace-pre-wrap">
          {result.error}
        </div>
      ) : null}

      {result && result.warnings.length ? (
        <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-900">
          <strong>Conversion-loss checks:</strong>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              JSON output
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              {result
                ? `${result.documentCount} YAML document${
                    result.documentCount === 1 ? "" : "s"
                  } resolved.`
                : "The converter resolves YAML data before serializing JSON."}
            </p>
          </div>

          {result && result.output ? (
            <button
              type="button"
              onClick={copyOutput}
              className="yoryantra-btn-outline text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          ) : null}
        </div>

        <pre className="mt-4 yoryantra-output min-h-[280px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {result && result.output
            ? result.output
            : "Converted JSON will appear here."}
        </pre>
      </div>

      {result && result.notes.length ? (
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
          <ul className="list-disc space-y-1 pl-5">
            {result.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Conversion happens on the pasted YAML in your browser. The tool does
        not send it to a conversion API or fetch an application schema.
        Site-wide analytics or advertising scripts, if enabled, are separate
        from this conversion operation.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              YAML Has More Ways to Express Data Than JSON Can Carry
            </h2>
            <p className="mt-4 leading-relaxed text-gray-600">
              JSON gives you objects with string names, arrays, strings, finite
              numbers, booleans, and null. YAML adds a richer representation
              model plus features such as anchors, aliases, tags, directives,
              multiple documents, and multiple scalar styles.
            </p>
            <p className="mt-4 leading-relaxed text-gray-600">
              Conversion is therefore not merely replacing indentation with
              braces. The tool first resolves YAML into JavaScript data and
              then asks whether that resolved value can be serialized as JSON.
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
            <h3 className="font-semibold text-yellow-900">
              Predictable scalar types over ecosystem guessing
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-yellow-900/90">
              This converter deliberately uses a JSON-compatible YAML schema.
              An unquoted date such as <code>2026-09-01</code> remains text
              rather than becoming a JavaScript Date, and YAML 1.1-style words
              are not silently reinterpreted through an application's custom
              schema.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Multiple YAML Documents Need a New Container in JSON
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            YAML is a stream format and can contain several documents separated
            by <code>---</code>. JSON has no equivalent stream syntax inside one
            JSON text: it has one top-level value.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            When the input contains several YAML documents, this converter
            returns one JSON array with one element per document. That is an
            intentional transformation, not something implied by the original
            YAML hierarchy.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Anchors and Aliases Show Where “Equivalent Values” Are Not the Whole Story
          </h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-white p-4 text-sm leading-7 text-gray-800">{`defaults: &defaults
  retries: 3
  enabled: true

service:
  settings: *defaults`}</pre>
          <p className="mt-4 leading-relaxed text-gray-600">
            YAML can express graph relationships through anchors and aliases.
            After loading, JSON can contain the repeated resolved values, but it
            cannot record the anchor name or say that two locations originated
            from the same alias relationship. A circular alias graph cannot be
            serialized by ordinary <code>JSON.stringify()</code> at all.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Mapping Keys Are a Hidden Compatibility Boundary
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JSON object names are strings. YAML mappings can use scalar keys
            with other resolved types and can even express complex keys. A YAML
            key such as <code>1:</code> may end up represented as the JSON object
            name <code>"1"</code>, which loses the original key type. A complex
            sequence or mapping key has no faithful JSON object-key equivalent.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The browser checks flag several obvious key-risk patterns, but YAML
            is expressive enough that no regex can prove every key conversion
            is lossless. If key identity matters, inspect the generated JSON
            rather than treating successful serialization as equivalence.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Comments and Human Formatting Disappear by Design
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            YAML comments often explain why a value exists, record deployment
            caveats, or guide the next person editing a configuration file.
            JSON data has no comment member, so those notes disappear in a
            normal data conversion. Folded versus literal block styles,
            explicit quoting, flow-style collections, directives, and document
            markers disappear for the same reason: they describe YAML
            presentation rather than JSON data members.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            If you need a round trip that preserves comments and formatting,
            use an AST/CST-aware YAML editor rather than a value converter.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            The &lt;&lt; Merge Key Is Not a Safe Assumption Across YAML Consumers
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The familiar <code>&lt;&lt;:</code> merge-key feature comes from
            YAML 1.1-era type conventions and is not part of the YAML 1.2 core
            schema used for predictable JSON-oriented conversion here. This
            converter warns when merge-key-looking syntax appears instead of
            pretending that inheritance has definitely been applied.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            If the source belongs to Docker Compose, CI tooling, a framework, or
            another product with its own YAML loader, validate how that product
            resolves merges before comparing its runtime configuration with
            this generic JSON output.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            A Successful Conversion Does Not Validate the Original Configuration
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Converting a Kubernetes manifest or application config into JSON
            proves only that the YAML values used by this parser can become
            JSON. It does not prove that required fields exist, API versions are
            current, environment variables are valid, or the destination
            application accepts the structure.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Use the generated JSON when another API or tool requires JSON; use
            the application's own validator when you need configuration
            correctness.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <YoryantraRelatedTools currentHref="/tools/yaml-to-json-converter" />
        </div>
      </section>
    </ToolShell>
  );
}
