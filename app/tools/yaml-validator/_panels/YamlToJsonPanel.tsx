"use client";

import type { WorkflowPanelProps } from "../workflow-types";
import YoryantraSelect from "@/app/components/YoryantraSelect";

import { useEffect, useMemo, useState } from "react";
import {
  isAlias,
  isMap,
  isScalar,
  isSeq,
  parseAllDocuments,
  visit,
} from "yaml";

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

export default function YamlToJsonPanel({ incoming, onSend }: WorkflowPanelProps) {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState(2);
  const [result, setResult] =
    useState<ConversionResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

  // A handoff changes the input only when another operation sends a result.
  // Merely switching tabs keeps each operation's input, options, and result intact.
  useEffect(() => {
    if (!incoming) return;
    setInput(incoming.value);
    setResult(null);
    setCopied(false);
    setCopyError("");
  }, [incoming]);

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
    <>
      <div className="min-w-0">
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

      <div className="mt-5 flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-44">
          <YoryantraSelect width="short"
            label="JSON indentation"
            value={String(indent)}
            onChange={(value: string) => {
              setIndent(Number(value));
              setResult(null);
              setCopied(false);
              setCopyError("");
            }}
            options={[
              { label: "2 spaces", value: "2" },
              { label: "4 spaces", value: "4" },
            ]}
          />
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


      {result && result.output ? (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="text-sm text-gray-600">Use this result in:</span>
          <button type="button" className="yoryantra-btn-outline text-sm" onClick={() => onSend("json-to-yaml", result.output)}>Convert to YAML</button>
        </div>
      ) : null}


    </>
  );
}
