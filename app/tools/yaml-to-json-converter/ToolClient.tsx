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

type ConversionResult = {
  output: string;
  warnings: string[];
  notes: string[];
  documentCount: number;
  error: string;
};

const MAX_INPUT_CHARACTERS = 2_000_000;
const MAX_EXPANDED_VALUES = 100_000;
const MAX_RESOLVED_DEPTH = 512;

function hasUnpairedSurrogate(value: string) {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);

    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) {
        return true;
      }
      index += 1;
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      return true;
    }
  }

  return false;
}

function inspectJsonCompatibility(value: unknown) {
  type Frame = {
    value: unknown;
    depth: number;
    exit?: boolean;
  };

  const stack: Frame[] = [{ value, depth: 0 }];
  const active = new Set<object>();
  let visited = 0;

  while (stack.length) {
    const frame = stack.pop() as Frame;
    const current = frame.value;

    if (frame.exit) {
      if (current && typeof current === "object") {
        active.delete(current as object);
      }
      continue;
    }

    visited += 1;

    if (visited > MAX_EXPANDED_VALUES) {
      return `The resolved YAML would expand beyond ${MAX_EXPANDED_VALUES.toLocaleString()} JSON values. Conversion was stopped to keep alias expansion and browser-side serialization bounded.`;
    }

    if (frame.depth > MAX_RESOLVED_DEPTH) {
      return `The resolved YAML is nested more than ${MAX_RESOLVED_DEPTH} levels deep. Conversion was stopped before JSON serialization could exhaust the browser call stack.`;
    }

    if (typeof current === "number" && !Number.isFinite(current)) {
      return "The resolved YAML data contains a non-finite numeric value, which JSON cannot represent as a number.";
    }

    if (typeof current === "string") {
      if (hasUnpairedSurrogate(current)) {
        return "The resolved YAML contains an unpaired UTF-16 surrogate. JSON interoperability is not reliable for text that does not represent a Unicode scalar value.";
      }
      continue;
    }

    if (
      current === null ||
      typeof current === "boolean" ||
      typeof current === "number"
    ) {
      continue;
    }

    if (
      typeof current === "undefined" ||
      typeof current === "bigint" ||
      typeof current === "function" ||
      typeof current === "symbol"
    ) {
      return `The resolved YAML contains a JavaScript ${typeof current} value that ordinary JSON cannot represent.`;
    }

    if (!current || typeof current !== "object") {
      continue;
    }

    const object = current as object;

    if (active.has(object)) {
      return "The resolved YAML graph contains a circular alias relationship. Ordinary JSON cannot represent cycles.";
    }

    active.add(object);
    stack.push({
      value: current,
      depth: frame.depth,
      exit: true,
    });

    if (Array.isArray(current)) {
      for (let index = current.length - 1; index >= 0; index -= 1) {
        stack.push({
          value: current[index],
          depth: frame.depth + 1,
        });
      }
      continue;
    }

    const prototype = Object.getPrototypeOf(current);

    if (
      prototype !== Object.prototype &&
      prototype !== null
    ) {
      return "The resolved YAML contains a non-plain JavaScript object. Converting it with JSON.stringify could silently change its meaning.";
    }

    const record = current as Record<string, unknown>;
    const keys = Object.keys(record);

    for (let index = keys.length - 1; index >= 0; index -= 1) {
      const key = keys[index];

      if (hasUnpairedSurrogate(key)) {
        return "A resolved YAML mapping key contains an unpaired UTF-16 surrogate, which is not portable JSON text.";
      }

      stack.push({
        value: record[key],
        depth: frame.depth + 1,
      });
    }
  }

  return "";
}

function formatYamlDiagnostic(
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

function inspectYamlDocument(
  document: ReturnType<typeof parseAllDocuments>[number]
) {
  let anchors = 0;
  let aliases = 0;
  let explicitTags = 0;

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
        node !== null &&
        typeof node === "object" &&
        "tag" in node &&
        typeof node.tag === "string" &&
        node.tag
      ) {
        explicitTags += 1;
      }
    });
  } catch {
    // Parser diagnostics and the bounded toJS conversion below remain the
    // source of truth if a partially composed document cannot be traversed.
  }

  return { anchors, aliases, explicitTags };
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

  if (source.length > MAX_INPUT_CHARACTERS) {
    return {
      output: "",
      warnings: [],
      notes: [],
      documentCount: 0,
      error:
        "The YAML input is larger than 2,000,000 characters. Conversion was stopped before parsing to avoid freezing the browser on unusually large pasted data.",
    };
  }

  let parsedDocuments: ReturnType<typeof parseAllDocuments>;

  try {
    parsedDocuments = parseAllDocuments(source, {
      prettyErrors: true,
      strict: true,
      uniqueKeys: true,
      version: "1.2",
      schema: "core",
      merge: false,
      resolveKnownTags: false,
      stringKeys: true,
    });
  } catch (error) {
    return {
      output: "",
      warnings: [],
      notes: [],
      documentCount: 0,
      error:
        error instanceof Error
          ? `YAML parsing stopped unexpectedly: ${error.message}`
          : "YAML parsing stopped unexpectedly.",
    };
  }

  const warnings: string[] = [];
  const notes: string[] = [];
  const parserErrors: string[] = [];
  let anchors = 0;
  let aliases = 0;
  let explicitTags = 0;

  parsedDocuments.forEach((document, index) => {
    document.errors.forEach((diagnostic) => {
      parserErrors.push(formatYamlDiagnostic(diagnostic, index));
    });

    document.warnings.forEach((diagnostic) => {
      warnings.push(formatYamlDiagnostic(diagnostic, index));
    });

    const nodeInfo = inspectYamlDocument(document);
    anchors += nodeInfo.anchors;
    aliases += nodeInfo.aliases;
    explicitTags += nodeInfo.explicitTags;
  });

  if (parserErrors.length) {
    return {
      output: "",
      warnings,
      notes,
      documentCount: parsedDocuments.length,
      error: parserErrors.join("\n"),
    };
  }

  if (anchors || aliases) {
    warnings.push(
      `YAML anchors/aliases are present (${anchors} anchored node${
        anchors === 1 ? "" : "s"
      }, ${aliases} alias node${
        aliases === 1 ? "" : "s"
      }). Alias expansion is capped while resolving each document; JSON cannot preserve anchor names or shared-reference identity.`
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
      "A << merge-key-looking entry was detected. Merge-key semantics are intentionally not applied under the YAML 1.2 core schema; review the output instead of assuming inheritance occurred."
    );
  }

  if (
    explicitTags ||
    /(?:^|[\s\[\]{},?:-])![!A-Za-z][^\s\[\]{},]*/m.test(
      source
    )
  ) {
    warnings.push(
      "Explicit YAML tag syntax is present. Core YAML scalar handling is used without application-specific tag extensions, so tagged values can produce parser diagnostics instead of silently becoming custom JavaScript objects."
    );
  }

  if (/^%YAML\s+1\.1\s*$/m.test(source)) {
    warnings.push(
      "The stream declares YAML 1.1, but conversion is intentionally parsed with YAML 1.2 core scalar rules. Legacy YAML 1.1 booleans, timestamps, and merge behavior may therefore differ from an application that explicitly uses a YAML 1.1 schema."
    );
  }

  if (parsedDocuments.length > 1) {
    warnings.push(
      `The stream contains ${parsedDocuments.length} YAML documents. A JSON text has one top-level value, so the documents are wrapped in one JSON array.`
    );
  }

  if (parsedDocuments.length === 0) {
    return {
      output: "",
      warnings,
      notes,
      documentCount: 0,
      error: "The YAML stream contains no documents.",
    };
  }

  const documents: unknown[] = [];

  for (let index = 0; index < parsedDocuments.length; index += 1) {
    const document = parsedDocuments[index];

    try {
      documents.push(
        document.contents === null
          ? null
          : document.toJS({ maxAliasCount: 100 })
      );
    } catch (error) {
      return {
        output: "",
        warnings,
        notes,
        documentCount: parsedDocuments.length,
        error:
          error instanceof Error
            ? `Document ${index + 1} could not be resolved safely: ${error.message}`
            : `Document ${index + 1} could not be resolved safely.`,
      };
    }
  }

  const value =
    documents.length === 1 ? documents[0] : documents;

  const compatibilityProblem = inspectJsonCompatibility(value);

  if (compatibilityProblem) {
    return {
      output: "",
      warnings,
      notes,
      documentCount: documents.length,
      error: compatibilityProblem,
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
      error: `${message} The resolved YAML value could not be represented as ordinary JSON.`,
    };
  }
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState(2);
  const [result, setResult] =
    useState<ConversionResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

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
    setCopyError("");
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
    setCopyError("");
  };

  const reset = () => {
    setInput("");
    setIndent(2);
    setResult(null);
    setCopied(false);
    setCopyError("");
  };

  const copyOutput = async () => {
    if (!result || !result.output) return;

    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setCopyError("");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setCopyError(
        "Clipboard access was blocked by the browser. Select the JSON output and copy it manually."
      );
    }
  };

  return (
    <ToolShell
      title="YAML to JSON Converter"
      description="Convert one or more YAML documents to JSON with YAML 1.2 core scalar rules, while keeping aliases, mapping-key limits, and conversion loss visible."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <label htmlFor="yaml-json-input" className="block text-sm font-semibold text-gray-900">
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
          id="yaml-json-input"
          value={input}
          onChange={(event: { target: { value: string } }) => {
            setInput(event.target.value);
            setResult(null);
            setCopied(false);
            setCopyError("");
          }}
          placeholder={`profile:\n  name: Sneha\n  active: true\n  roles:\n    - editor\n    - reviewer`}
          spellCheck={false}
          className="mt-4 w-full min-h-[340px] rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="yaml-json-indent" className="mb-2 block text-sm font-medium text-gray-700">
            JSON indentation
          </label>
          <select
            id="yaml-json-indent"
            value={indent}
            onChange={(event: { target: { value: string } }) => {
              setIndent(Number(event.target.value));
              setResult(null);
              setCopied(false);
              setCopyError("");
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
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-gray-900">
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
                : "YAML data is resolved before JSON serialization."}
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

      {copyError ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {copyError}
        </div>
      ) : null}

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
        Conversion happens on the pasted YAML in your browser. No conversion
        API receives the text, and no application schema is fetched. Site-wide
        analytics or advertising scripts, if enabled, are separate from the
        conversion operation.
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
              multiple documents, and multiple scalar styles. The{" "}
              <a
                href="https://yaml.org/spec/1.2.2/"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--green)] underline underline-offset-4"
              >
                YAML 1.2.2 specification
              </a>{" "}
              separates the representation graph from presentation details such
              as comments, scalar style, directives, and anchor names.
            </p>
            <p className="mt-4 leading-relaxed text-gray-600">
              Conversion is therefore not merely replacing indentation with
              braces. YAML is resolved into JavaScript data first, then checked
              for values and graph relationships that ordinary JSON cannot
              carry before serialization begins.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h3 className="font-semibold text-gray-900">
              Predictable scalar types over ecosystem guessing
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">
              YAML 1.2 core scalar rules are used deliberately. An unquoted
              date such as <code>2026-09-01</code> remains text rather than
              becoming a JavaScript Date, while ordinary YAML 1.2 booleans,
              numbers and null values keep their scalar types. Application-specific
              tags are not guessed during conversion.
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
            When the input contains several YAML documents, the JSON result is
            one array with one element per document. That is an intentional
            transformation, not something implied by the original YAML hierarchy.
            An empty YAML document is represented as <code>null</code> rather than
            disappearing from that array.
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
          <p className="mt-4 leading-relaxed text-gray-600">
            Alias expansion also has a resource cost: a small YAML source can
            describe a much larger resolved structure. Before serialization,
            the resolved graph is walked with depth and expanded-value limits so
            a pasted alias pattern cannot grow without bound in the browser.
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
            Several obvious key-risk patterns are flagged before output, but
            YAML is expressive enough that a source-text check cannot prove every
            key conversion is lossless. If key identity matters, inspect the
            generated JSON rather than treating successful serialization as
            equivalence.
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
            schema used here. Merge-key-looking syntax is surfaced instead of
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
            proves only that the YAML values resolved under these rules can become
            JSON. It does not prove that required fields exist, API versions are
            current, environment variables are valid, or the destination
            application accepts the structure.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Use the generated JSON when another API or tool requires JSON; use
            the application's own validator when you need configuration
            correctness.{" "}
            <a
              href="https://www.rfc-editor.org/rfc/rfc8259"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              RFC 8259
            </a>{" "}
            is the boundary on the JSON side: one JSON text carries one
            serialized value, object names are strings, and non-finite numbers
            are outside the JSON number grammar.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Check What the JSON Lost—or Validate the YAML First
          </h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/yaml-to-json-converter" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
