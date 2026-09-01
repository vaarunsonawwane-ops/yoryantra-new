"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type Operator =
  | "equals"
  | "notEquals"
  | "contains"
  | "notContains"
  | "startsWith"
  | "endsWith"
  | "greaterThan"
  | "greaterOrEqual"
  | "lessThan"
  | "lessOrEqual"
  | "between"
  | "exists"
  | "missing"
  | "truthy"
  | "falsy"
  | "regex";

type ValueMode =
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "json";

type MatchMode =
  | "keep"
  | "exclude";

type OutputMode =
  | "records"
  | "matchedValues"
  | "rejectedRecords"
  | "markdown"
  | "csv"
  | "diagnostic"
  | "checklist";

type SortMode =
  | "original"
  | "pathAsc"
  | "pathDesc";

type Row = {
  index: number;
  record: unknown;
  found: boolean;
  actualValue: unknown;
  matched: boolean;
  reason: string;
};

type Issue = {
  severity: "warning" | "note";
  title: string;
  message: string;
};

type FilterResult = {
  rows: Row[];
  selected: Row[];
  output: string;
  issues: Issue[];
  inputCount: number;
  matchedCount: number;
  missingCount: number;
  sourceBytes: number;
};

const SAMPLE = `[
  {
    "id": 17,
    "user": {
      "name": "Sneha",
      "role": "admin"
    },
    "active": true,
    "score": 91
  },
  {
    "id": 18,
    "user": {
      "name": "Varoun",
      "role": "editor"
    },
    "active": false,
    "score": 72
  },
  {
    "id": 19,
    "user.role": "admin",
    "active": true,
    "score": 84
  }
]`;

function own(record: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(record, key);
}

function getByPath(record: unknown, path: string) {
  if (!path) {
    return {
      found: true,
      value: record,
      resolution: "whole record",
    };
  }

  if (record && typeof record === "object" && !Array.isArray(record)) {
    const objectRecord = record as Record<string, unknown>;

    if (own(objectRecord, path)) {
      return {
        found: true,
        value: objectRecord[path],
        resolution: "literal key",
      };
    }
  }

  const parts = path.split(".");
  let current: unknown = record;

  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index];

    if (part === "") {
      return {
        found: false,
        value: undefined,
        resolution: "invalid empty path segment",
      };
    }

    if (Array.isArray(current) && /^\d+$/.test(part)) {
      const arrayIndex = Number(part);

      if (arrayIndex >= current.length) {
        return {
          found: false,
          value: undefined,
          resolution: "nested path",
        };
      }

      current = current[arrayIndex];
      continue;
    }

    if (
      !current ||
      typeof current !== "object" ||
      Array.isArray(current)
    ) {
      return {
        found: false,
        value: undefined,
        resolution: "nested path",
      };
    }

    const objectCurrent = current as Record<string, unknown>;

    if (!own(objectCurrent, part)) {
      return {
        found: false,
        value: undefined,
        resolution: "nested path",
      };
    }

    current = objectCurrent[part];
  }

  return {
    found: true,
    value: current,
    resolution: "nested path",
  };
}

function parseFilterValue(text: string, mode: ValueMode) {
  if (mode === "string") {
    return text;
  }

  if (mode === "number") {
    const trimmed = text.trim();

    if (!trimmed || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(trimmed)) {
      throw new Error("Enter a finite numeric filter value.");
    }

    const number = Number(trimmed);

    if (!Number.isFinite(number)) {
      throw new Error("Numeric filter value must be finite.");
    }

    return number;
  }

  if (mode === "boolean") {
    const lower = text.trim().toLowerCase();

    if (lower !== "true" && lower !== "false") {
      throw new Error('Boolean filter value must be "true" or "false".');
    }

    return lower === "true";
  }

  if (mode === "null") {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (caught) {
    throw new Error(
      caught instanceof Error
        ? `JSON filter value is invalid: ${caught.message}`
        : "JSON filter value is invalid."
    );
  }
}

function normalizeText(value: unknown, caseSensitive: boolean, trim: boolean) {
  let text =
    typeof value === "string"
      ? value
      : value === null
      ? "null"
      : typeof value === "undefined"
      ? ""
      : String(value);

  if (trim) text = text.trim();
  if (!caseSensitive) text = text.toLowerCase();

  return text;
}

function deepEqual(left: unknown, right: unknown) {
  if (left === right) return true;

  if (
    typeof left !== typeof right ||
    left === null ||
    right === null
  ) {
    return false;
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) return false;

    for (let index = 0; index < left.length; index += 1) {
      if (!deepEqual(left[index], right[index])) return false;
    }

    return true;
  }

  if (
    typeof left === "object" &&
    typeof right === "object" &&
    !Array.isArray(left) &&
    !Array.isArray(right)
  ) {
    const leftRecord = left as Record<string, unknown>;
    const rightRecord = right as Record<string, unknown>;
    const leftKeys = Object.keys(leftRecord);
    const rightKeys = Object.keys(rightRecord);

    if (leftKeys.length !== rightKeys.length) return false;

    for (let index = 0; index < leftKeys.length; index += 1) {
      const key = leftKeys[index];

      if (!own(rightRecord, key) || !deepEqual(leftRecord[key], rightRecord[key])) {
        return false;
      }
    }

    return true;
  }

  return false;
}

function numericActual(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  return null;
}

function evaluate(options: {
  actual: unknown;
  found: boolean;
  operator: Operator;
  expected: unknown;
  secondExpected: unknown;
  caseSensitive: boolean;
  trimStrings: boolean;
  regexFlags: string;
}) {
  if (options.operator === "exists") {
    return {
      matched: options.found,
      reason: options.found ? "field exists" : "field is missing",
    };
  }

  if (options.operator === "missing") {
    return {
      matched: !options.found,
      reason: options.found ? "field exists" : "field is missing",
    };
  }

  if (!options.found) {
    return {
      matched: false,
      reason: "field is missing",
    };
  }

  if (options.operator === "truthy") {
    return {
      matched: Boolean(options.actual),
      reason: `Boolean(actual) is ${String(Boolean(options.actual))}`,
    };
  }

  if (options.operator === "falsy") {
    return {
      matched: !Boolean(options.actual),
      reason: `Boolean(actual) is ${String(Boolean(options.actual))}`,
    };
  }

  if (
    options.operator === "greaterThan" ||
    options.operator === "greaterOrEqual" ||
    options.operator === "lessThan" ||
    options.operator === "lessOrEqual" ||
    options.operator === "between"
  ) {
    const actualNumber = numericActual(options.actual);

    if (actualNumber === null || typeof options.expected !== "number") {
      return {
        matched: false,
        reason:
          "numeric comparison requires the record field and filter value to be finite JSON numbers; strings are not auto-coerced",
      };
    }

    if (options.operator === "greaterThan") {
      return {
        matched: actualNumber > options.expected,
        reason: `${actualNumber} > ${options.expected}`,
      };
    }

    if (options.operator === "greaterOrEqual") {
      return {
        matched: actualNumber >= options.expected,
        reason: `${actualNumber} >= ${options.expected}`,
      };
    }

    if (options.operator === "lessThan") {
      return {
        matched: actualNumber < options.expected,
        reason: `${actualNumber} < ${options.expected}`,
      };
    }

    if (options.operator === "lessOrEqual") {
      return {
        matched: actualNumber <= options.expected,
        reason: `${actualNumber} <= ${options.expected}`,
      };
    }

    if (typeof options.secondExpected !== "number") {
      return {
        matched: false,
        reason: "between requires two numeric filter values",
      };
    }

    const min = Math.min(options.expected, options.secondExpected);
    const max = Math.max(options.expected, options.secondExpected);

    return {
      matched: actualNumber >= min && actualNumber <= max,
      reason: `${actualNumber} is between ${min} and ${max} inclusive`,
    };
  }

  if (options.operator === "regex") {
    if (typeof options.actual !== "string") {
      return {
        matched: false,
        reason: "regex operator only evaluates JSON string fields",
      };
    }

    if (typeof options.expected !== "string") {
      return {
        matched: false,
        reason: "regex pattern must be text",
      };
    }

    let regex: RegExp;

    try {
      regex = new RegExp(options.expected, options.regexFlags);
    } catch (caught) {
      throw new Error(
        caught instanceof Error
          ? `Invalid regular expression: ${caught.message}`
          : "Invalid regular expression."
      );
    }

    return {
      matched: regex.test(options.actual),
      reason: `regex /${options.expected}/${options.regexFlags} tested against string value`,
    };
  }

  if (
    options.operator === "contains" ||
    options.operator === "notContains" ||
    options.operator === "startsWith" ||
    options.operator === "endsWith"
  ) {
    if (typeof options.actual !== "string" || typeof options.expected !== "string") {
      return {
        matched: false,
        reason:
          "text operator requires both the record field and filter value to be strings; objects/numbers are not auto-stringified for matching",
      };
    }

    const actualText = normalizeText(
      options.actual,
      options.caseSensitive,
      options.trimStrings
    );
    const expectedText = normalizeText(
      options.expected,
      options.caseSensitive,
      options.trimStrings
    );

    if (
      options.operator === "contains" ||
      options.operator === "notContains"
    ) {
      const contains =
        actualText.indexOf(
          expectedText
        ) !== -1;

      return {
        matched:
          options.operator ===
          "contains"
            ? contains
            : !contains,
        reason:
          options.operator ===
          "contains"
            ? "string contains comparison"
            : "string does-not-contain comparison",
      };
    }

    if (options.operator === "startsWith") {
      return {
        matched: actualText.indexOf(expectedText) === 0,
        reason: "string prefix comparison",
      };
    }

    return {
      matched:
        expectedText.length <= actualText.length &&
        actualText.slice(actualText.length - expectedText.length) === expectedText,
      reason: "string suffix comparison",
    };
  }

  let equal = false;

  if (typeof options.actual === "string" && typeof options.expected === "string") {
    equal =
      normalizeText(
        options.actual,
        options.caseSensitive,
        options.trimStrings
      ) ===
      normalizeText(
        options.expected,
        options.caseSensitive,
        options.trimStrings
      );
  } else {
    equal = deepEqual(options.actual, options.expected);
  }

  return {
    matched: options.operator === "equals" ? equal : !equal,
    reason:
      options.operator === "equals"
        ? "strict/type-aware equality comparison"
        : "strict/type-aware inequality comparison",
  };
}

function duplicateKeysInJsonSource(source: string) {
  const duplicates: string[] = [];
  const stack: Array<{ type: "object" | "array"; keys?: string[] }> = [];
  let index = 0;

  const endString = (start: number) => {
    let escaped = false;

    for (let cursor = start + 1; cursor < source.length; cursor += 1) {
      const char = source.charAt(cursor);

      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') return cursor;
    }

    return source.length - 1;
  };

  while (index < source.length) {
    const char = source.charAt(index);

    if (char === "{") {
      stack.push({ type: "object", keys: [] });
      index += 1;
      continue;
    }

    if (char === "[") {
      stack.push({ type: "array" });
      index += 1;
      continue;
    }

    if (char === "}" || char === "]") {
      stack.pop();
      index += 1;
      continue;
    }

    if (char === '"') {
      const end = endString(index);
      const current = stack[stack.length - 1];
      let cursor = end + 1;

      while (cursor < source.length && /\s/.test(source.charAt(cursor))) {
        cursor += 1;
      }

      if (
        current &&
        current.type === "object" &&
        current.keys &&
        source.charAt(cursor) === ":"
      ) {
        try {
          const key = JSON.parse(source.slice(index, end + 1)) as string;

          if (current.keys.indexOf(key) !== -1 && duplicates.indexOf(key) === -1) {
            duplicates.push(key);
          } else {
            current.keys.push(key);
          }
        } catch {
          // JSON.parse below reports syntax errors.
        }
      }

      index = end + 1;
      continue;
    }

    index += 1;
  }

  return duplicates;
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function displayValue(value: unknown) {
  if (typeof value === "undefined") return "(missing)";
  if (typeof value === "string") return value;

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function buildOutput(
  selected: Row[],
  allRows: Row[],
  outputMode: OutputMode
) {
  if (outputMode === "records") {
    return JSON.stringify(
      selected.map(
        (row) => row.record
      ),
      null,
      2
    );
  }

  if (
    outputMode ===
    "matchedValues"
  ) {
    return JSON.stringify(
      selected.map(
        (row) =>
          row.found
            ? row.actualValue
            : null
      ),
      null,
      2
    );
  }

  if (
    outputMode ===
    "rejectedRecords"
  ) {
    return JSON.stringify(
      allRows
        .filter(
          (row) =>
            !row.matched
        )
        .map(
          (row) =>
            row.record
        ),
      null,
      2
    );
  }

  if (
    outputMode ===
    "markdown"
  ) {
    const lines = [
      "| Source index | Matched | Value | Reason | Record |",
      "| ---: | :---: | --- | --- | --- |",
    ];

    selected.forEach(
      (row) => {
        const clean = (
          value: string
        ) =>
          value.replace(
            /\|/g,
            "\\|"
          ).replace(
            /\r?\n/g,
            " "
          );

        lines.push(
          `| ${row.index} | ${
            row.matched
              ? "Yes"
              : "No"
          } | ${clean(
            displayValue(
              row.found
                ? row.actualValue
                : undefined
            )
          )} | ${clean(
            row.reason
          )} | ${clean(
            displayValue(
              row.record
            )
          )} |`
        );
      }
    );

    return lines.join("\n");
  }

  if (outputMode === "csv") {
    const lines = [
      [
        "source_index",
        "matched",
        "value",
        "reason",
        "record_json",
      ]
        .map(csvCell)
        .join(","),
    ];

    selected.forEach(
      (row) => {
        lines.push(
          [
            String(row.index),
            String(row.matched),
            displayValue(
              row.found
                ? row.actualValue
                : undefined
            ),
            row.reason,
            displayValue(
              row.record
            ),
          ]
            .map(csvCell)
            .join(",")
        );
      }
    );

    return lines.join("\n");
  }

  if (
    outputMode ===
    "checklist"
  ) {
    return selected
      .map(
        (row) =>
          `${row.matched ? "[x]" : "[ ]"} #${row.index} · ${displayValue(
            row.found
              ? row.actualValue
              : undefined
          )} · ${row.reason}`
      )
      .join("\n");
  }

  return JSON.stringify(
    selected.map((row) => ({
      sourceIndex:
        row.index,
      matched:
        row.matched,
      reason:
        row.reason,
      actualValue:
        row.found
          ? row.actualValue
          : null,
      record:
        row.record,
    })),
    null,
    2
  );
}

function sortableValue(
  value: unknown
) {
  if (
    typeof value ===
    "number" &&
    Number.isFinite(value)
  ) {
    return {
      type: "number",
      value,
    };
  }

  if (typeof value === "string") {
    return {
      type: "string",
      value:
        value.toLowerCase(),
    };
  }

  if (typeof value === "boolean") {
    return {
      type: "boolean",
      value:
        value ? 1 : 0,
    };
  }

  if (value === null) {
    return {
      type: "null",
      value: 0,
    };
  }

  return {
    type: "other",
    value:
      displayValue(value),
  };
}

function sortRows(
  rows: Row[],
  sortMode: SortMode
) {
  if (sortMode === "original") {
    return rows.slice();
  }

  const direction =
    sortMode === "pathAsc"
      ? 1
      : -1;

  return rows
    .slice()
    .sort(
      (left, right) => {
        if (
          !left.found &&
          !right.found
        ) {
          return (
            left.index -
            right.index
          );
        }

        if (!left.found) {
          return 1;
        }

        if (!right.found) {
          return -1;
        }

        const leftValue =
          sortableValue(
            left.actualValue
          );
        const rightValue =
          sortableValue(
            right.actualValue
          );

        if (
          leftValue.type !==
          rightValue.type
        ) {
          const typeOrder = [
            "number",
            "string",
            "boolean",
            "null",
            "other",
          ];

          return (
            typeOrder.indexOf(
              leftValue.type
            ) -
            typeOrder.indexOf(
              rightValue.type
            )
          ) * direction;
        }

        if (
          typeof leftValue.value ===
            "number" &&
          typeof rightValue.value ===
            "number"
        ) {
          return (
            leftValue.value -
            rightValue.value
          ) * direction;
        }

        return String(
          leftValue.value
        ).localeCompare(
          String(
            rightValue.value
          )
        ) * direction;
      }
    );
}

function runFilter(options: {
  input: string;
  path: string;
  operator: Operator;
  filterValue: string;
  secondValue: string;
  valueMode: ValueMode;
  matchMode: MatchMode;
  outputMode: OutputMode;
  sortMode: SortMode;
  caseSensitive: boolean;
  trimStrings: boolean;
  regexFlags: string;
  limit100: boolean;
}): FilterResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(options.input);
  } catch (caught) {
    throw new Error(
      caught instanceof Error
        ? `Invalid JSON: ${caught.message}`
        : "Invalid JSON."
    );
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Top-level JSON value must be an array.");
  }

  const noValueOperators = [
    "exists",
    "missing",
    "truthy",
    "falsy",
  ];
  const expected =
    noValueOperators.indexOf(options.operator) !== -1
      ? null
      : parseFilterValue(options.filterValue, options.valueMode);
  const secondExpected =
    options.operator === "between"
      ? parseFilterValue(options.secondValue, "number")
      : null;
  const rows = parsed.map((record, index) => {
    const lookup = getByPath(record, options.path);
    const evaluation = evaluate({
      actual: lookup.value,
      found: lookup.found,
      operator: options.operator,
      expected,
      secondExpected,
      caseSensitive: options.caseSensitive,
      trimStrings: options.trimStrings,
      regexFlags: options.regexFlags,
    });

    return {
      index,
      record,
      found: lookup.found,
      actualValue: lookup.value,
      matched: evaluation.matched,
      reason: `${evaluation.reason}; path resolved as ${lookup.resolution}`,
    };
  });

  let selected =
    options.matchMode === "keep"
      ? rows.filter(
          (row) =>
            row.matched
        )
      : rows.filter(
          (row) =>
            !row.matched
        );

  selected = sortRows(
    selected,
    options.sortMode
  );

  const issues: Issue[] = [];
  const duplicateKeys = duplicateKeysInJsonSource(options.input);

  if (duplicateKeys.length) {
    issues.push({
      severity: "warning",
      title: "Duplicate JSON member names were present in the source",
      message:
        `JSON.parse keeps only the last occurrence of a duplicate member name. Earlier values for ${duplicateKeys
          .slice(0, 8)
          .join(", ")}${
          duplicateKeys.length > 8 ? "…" : ""
        } cannot participate in filtering after parsing.`,
    });
  }

  const missingCount = rows.filter((row) => !row.found).length;

  if (missingCount) {
    issues.push({
      severity: "note",
      title: "Some records do not contain the selected path",
      message:
        `${missingCount} of ${rows.length} records are missing "${options.path}". Missing is distinct from a present value of null, false, 0 or an empty string.`,
    });
  }

  if (
    rows.some(
      (row) =>
        row.found &&
        typeof row.actualValue === "number" &&
        Number.isInteger(row.actualValue) &&
        !Number.isSafeInteger(row.actualValue)
    )
  ) {
    issues.push({
      severity: "warning",
      title: "Unsafe JavaScript integer precision",
      message:
        "At least one matched-path integer is outside JavaScript's safe-integer range. JSON.parse may already have rounded it; use JSON strings for identifiers where every digit matters.",
    });
  }

  if (
    options.operator === "truthy" ||
    options.operator === "falsy"
  ) {
    issues.push({
      severity: "note",
      title: "Truthy/falsy uses JavaScript Boolean semantics",
      message:
        "false, null, 0, empty string and NaN-like runtime values are falsy; arrays and objects are truthy even when empty.",
    });
  }

  if (options.operator === "regex") {
    issues.push({
      severity: "note",
      title: "Regex is a JavaScript regular expression",
      message:
        "Pattern syntax and flags follow the current browser's JavaScript RegExp engine. Regex matching is only applied to JSON string fields.",
    });
  }

  if (options.limit100 && selected.length > 100) {
    issues.push({
      severity: "note",
      title: "Output limited to first 100 selected rows",
      message:
        `The filter selected ${selected.length} rows; only the first 100 are included in generated output. Counts still reflect the full input.`,
    });
    selected = selected.slice(0, 100);
  }

  if (options.outputMode === "diagnostic") {
    issues.push({
      severity: "note",
      title: "Diagnostic metadata is wrapped outside original records",
      message:
        "sourceIndex, matched and reason are stored in wrapper objects rather than injected as _index/_match/_reason fields. Original user records are not overwritten even if they already use those property names.",
    });
  }

  return {
    rows,
    selected,
    output: buildOutput(
      selected,
      rows,
      options.outputMode
    ),
    issues,
    inputCount: parsed.length,
    matchedCount: rows.filter((row) => row.matched).length,
    missingCount,
    sourceBytes: new TextEncoder().encode(options.input).length,
  };
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [path, setPath] = useState("user.role");
  const [operator, setOperator] = useState<Operator>("equals");
  const [filterValue, setFilterValue] = useState("admin");
  const [secondValue, setSecondValue] = useState("");
  const [valueMode, setValueMode] = useState<ValueMode>("string");
  const [matchMode, setMatchMode] = useState<MatchMode>("keep");
  const [outputMode, setOutputMode] = useState<OutputMode>("records");
  const [sortMode, setSortMode] = useState<SortMode>("original");
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [trimStrings, setTrimStrings] = useState(false);
  const [regexFlags, setRegexFlags] = useState("");
  const [limit100, setLimit100] = useState(false);
  const [result, setResult] = useState<FilterResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const noValue = ["exists", "missing", "truthy", "falsy"].indexOf(operator) !== -1;

  const output = useMemo(
    () => (result ? result.output : ""),
    [result]
  );

  const clear = () => {
    setResult(null);
    setError("");
    setCopied(false);
  };

  const run = () => {
    if (!input.trim()) {
      setError("Paste a JSON array to filter.");
      setResult(null);
      return;
    }

    if (!path.trim() && operator !== "truthy" && operator !== "falsy") {
      setError("Enter a field path, or use the whole-record behavior deliberately.");
    }

    try {
      setResult(
        runFilter({
          input,
          path: path.trim(),
          operator,
          filterValue,
          secondValue,
          valueMode,
          matchMode,
          outputMode,
          sortMode,
          caseSensitive,
          trimStrings,
          regexFlags,
          limit100,
        })
      );
      setError("");
      setCopied(false);
    } catch (caught) {
      setResult(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to filter this JSON array."
      );
    }
  };

  const loadExample = () => {
    setInput(SAMPLE);
    setPath("user.role");
    setOperator("equals");
    setFilterValue("admin");
    setSecondValue("");
    setValueMode("string");
    setMatchMode("keep");
    setOutputMode("records");
    setSortMode("original");
    setCaseSensitive(true);
    setTrimStrings(false);
    setRegexFlags("");
    setLimit100(false);
    clear();
  };

  const reset = () => {
    setInput("");
    setPath("");
    setFilterValue("");
    setSecondValue("");
    setOperator("equals");
    setValueMode("string");
    setMatchMode("keep");
    setOutputMode("records");
    setSortMode("original");
    setCaseSensitive(true);
    setTrimStrings(false);
    setRegexFlags("");
    setLimit100(false);
    clear();
  };

  const copy = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("The filtered output could not be copied. Select and copy it manually.");
    }
  };

  return (
    <ToolShell
      title="JSON Array Filter Tool"
      description="Filter arrays of JSON values by a literal or dot-path field using type-aware text, number, boolean, null, JSON, regex, existence and range conditions without mutating original records."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block text-sm font-semibold text-gray-900">
          JSON array
        </label>
        <textarea
          value={input}
          onChange={(event: { target: { value: string } }) => {
            setInput(event.target.value);
            clear();
          }}
          rows={20}
          placeholder={SAMPLE}
          spellCheck={false}
          className="mt-3 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Field path
          </label>
          <input
            value={path}
            onChange={(event: { target: { value: string } }) => {
              setPath(event.target.value);
              clear();
            }}
            placeholder="user.role"
            spellCheck={false}
            className="mt-2 w-full rounded-xl border border-gray-300 p-3 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
          <p className="mt-2 text-xs leading-relaxed text-gray-500">
            A literal key matching the full text wins before dot traversal. Array
            indexes such as <code>items.0.id</code> are supported.
          </p>
        </div>

        <YoryantraSelect
          label="Condition"
          value={operator}
          onChange={(value: string) => {
            setOperator(value as Operator);
            clear();
          }}
          options={[
            { label: "Equals", value: "equals" },
            { label: "Not equals", value: "notEquals" },
            { label: "Contains", value: "contains" },
            { label: "Does not contain", value: "notContains" },
            { label: "Starts with", value: "startsWith" },
            { label: "Ends with", value: "endsWith" },
            { label: "Greater than", value: "greaterThan" },
            { label: "Greater or equal", value: "greaterOrEqual" },
            { label: "Less than", value: "lessThan" },
            { label: "Less or equal", value: "lessOrEqual" },
            { label: "Between (inclusive)", value: "between" },
            { label: "Exists", value: "exists" },
            { label: "Missing", value: "missing" },
            { label: "Truthy", value: "truthy" },
            { label: "Falsy", value: "falsy" },
            { label: "Regex", value: "regex" },
          ]}
        />

        <YoryantraSelect
          label="Filter value type"
          value={valueMode}
          onChange={(value: string) => {
            setValueMode(value as ValueMode);
            clear();
          }}
          options={[
            { label: "String", value: "string" },
            { label: "Number", value: "number" },
            { label: "Boolean", value: "boolean" },
            { label: "null", value: "null" },
            { label: "JSON value/object/array", value: "json" },
          ]}
        />

        {!noValue ? (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Filter value
            </label>
            <input
              value={filterValue}
              onChange={(event: { target: { value: string } }) => {
                setFilterValue(event.target.value);
                clear();
              }}
              spellCheck={false}
              className="mt-2 w-full rounded-xl border border-gray-300 p-3 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
          </div>
        ) : null}

        {operator === "between" ? (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Second number
            </label>
            <input
              value={secondValue}
              onChange={(event: { target: { value: string } }) => {
                setSecondValue(event.target.value);
                clear();
              }}
              spellCheck={false}
              className="mt-2 w-full rounded-xl border border-gray-300 p-3 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
          </div>
        ) : null}

        {operator === "regex" ? (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Regex flags
            </label>
            <input
              value={regexFlags}
              onChange={(event: { target: { value: string } }) => {
                setRegexFlags(event.target.value);
                clear();
              }}
              placeholder="i"
              spellCheck={false}
              className="mt-2 w-full rounded-xl border border-gray-300 p-3 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
          </div>
        ) : null}

        <YoryantraSelect
          label="Selection"
          value={matchMode}
          onChange={(value: string) => {
            setMatchMode(value as MatchMode);
            clear();
          }}
          options={[
            { label: "Keep matching records", value: "keep" },
            { label: "Exclude matching records", value: "exclude" },
          ]}
        />

        <YoryantraSelect
          label="Output"
          value={outputMode}
          onChange={(value: string) => {
            setOutputMode(value as OutputMode);
            clear();
          }}
          options={[
            { label: "Filtered original records", value: "records" },
            { label: "Selected field values only", value: "matchedValues" },
            { label: "All non-matching records", value: "rejectedRecords" },
            { label: "Markdown table", value: "markdown" },
            { label: "CSV review", value: "csv" },
            { label: "Diagnostic wrapper objects", value: "diagnostic" },
            { label: "Review checklist", value: "checklist" },
          ]}
        />

        <YoryantraSelect
          label="Sort selected output"
          value={sortMode}
          onChange={(value: string) => {
            setSortMode(value as SortMode);
            clear();
          }}
          options={[
            { label: "Original array order", value: "original" },
            { label: "Selected path ascending", value: "pathAsc" },
            { label: "Selected path descending", value: "pathDesc" },
          ]}
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Toggle
          checked={caseSensitive}
          onChange={(checked) => {
            setCaseSensitive(checked);
            clear();
          }}
          title="Case-sensitive strings"
          text="Only affects string equality/contains/prefix/suffix checks."
        />
        <Toggle
          checked={trimStrings}
          onChange={(checked) => {
            setTrimStrings(checked);
            clear();
          }}
          title="Trim strings for comparison"
          text="Off by default so leading/trailing spaces remain meaningful data."
        />
        <Toggle
          checked={limit100}
          onChange={(checked) => {
            setLimit100(checked);
            clear();
          }}
          title="Limit generated output to 100 rows"
          text="Counts still inspect the full array; useful for large pasted samples."
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={run} className="yoryantra-btn">
          Filter Array
        </button>
        <button type="button" onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>
        <button type="button" onClick={reset} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error ? (
        <div className="mt-5 whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Stat label="Input rows" value={String(result.inputCount)} />
            <Stat label="Matched" value={String(result.matchedCount)} />
            <Stat label="Selected output" value={String(result.selected.length)} />
            <Stat label="Missing path" value={String(result.missingCount)} />
            <Stat label="UTF-8 bytes" value={result.sourceBytes.toLocaleString()} />
          </div>

          {result.issues.length ? (
            <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
              <h3 className="font-semibold text-yellow-900">Filter review</h3>
              <div className="mt-4 space-y-3">
                {result.issues.map((issue, index) => (
                  <div
                    key={`${issue.title}-${index}`}
                    className="rounded-xl border border-yellow-200 bg-white/60 p-4 text-sm leading-relaxed text-yellow-900"
                  >
                    <strong>{issue.title}</strong>
                    <p className="mt-1">{issue.message}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Filtered output
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Records mode returns original records unchanged; diagnostic
                  metadata is kept outside each record.
                </p>
              </div>
              <button
                type="button"
                onClick={copy}
                className="yoryantra-btn-outline whitespace-nowrap"
              >
                {copied ? "Copied" : "Copy Output"}
              </button>
            </div>

            <pre className="yoryantra-output mt-4 min-h-[340px] max-h-[720px] overflow-auto whitespace-pre-wrap break-words font-mono text-sm">
              {output}
            </pre>
          </div>
        </div>
      ) : (
        <pre className="yoryantra-output mt-8 min-h-[300px] whitespace-pre-wrap break-words text-sm">
          Matched counts, missing-path information, diagnostics and filtered JSON
          output will appear here.
        </pre>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        JSON parsing and filtering happen on the pasted array in your browser.
        The tool does not upload the dataset or modify the original input.
        Site-wide analytics or advertising scripts, if enabled, are separate
        from this filtering operation.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Filtering Is Easier to Trust When Missing Is Not Quietly Turned Into null
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            These records are different: one has{" "}
            <code>{"{ \"status\": null }"}</code>, another has{" "}
            <code>{"{ \"status\": \"\" }"}</code>, and a third has no status
            member at all. Converting all three to one falsy value hides useful
            information.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The path resolver tracks whether a property actually exists, which
            lets Exists/Missing filters and diagnostics distinguish absence from
            an explicitly present value.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            user.role Is a Convenience Path, Not JSONPath
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            The field path syntax on this page is intentionally small.{" "}
            <code>user.role</code> walks object properties and{" "}
            <code>items.0.id</code> can walk an array index. It does not
            implement JSONPath filters, recursive descent or JSON Pointer
            escaping.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            If an object literally has a key named <code>user.role</code>, that
            direct key wins before nested traversal. The sample includes that
            case so the rule is visible rather than hidden.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Numeric Comparisons Do Not Auto-Coerce "10" Into 10
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A JSON string <code>"10"</code> and JSON number <code>10</code> are
            different values. Automatic numeric coercion can make messy exports
            appear cleaner than they are and can silently accept malformed
            records.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Greater/less/between conditions therefore require an actual finite
            JSON number in the record. If the API returns numbers as strings,
            that is useful information to fix or normalize deliberately.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            String Operations Stay String Operations
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Contains, starts-with, ends-with and regex are only applied to JSON
            string fields. An object is not quietly converted to{" "}
            <code>[object Object]</code>, and the number 123 is not treated like
            the text "123".
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Case-insensitivity and trimming are optional because both can change
            data semantics. A customer code with a leading space may be bad data,
            not something a filter should hide.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-xl font-semibold text-red-900">
            Diagnostic Metadata Must Not Overwrite User Fields
          </h2>
          <p className="mt-4 leading-relaxed text-red-900/90">
            Earlier filter designs often annotated matching objects with fields
            such as <code>_index</code>, <code>_match</code> or{" "}
            <code>_reason</code>. If the source record already used one of those
            names, diagnostic output could overwrite real application data.
          </p>
          <p className="mt-4 leading-relaxed text-red-900/90">
            This version never injects metadata into original records.
            Diagnostic mode wraps each record inside a separate object containing
            sourceIndex, matched, reason and actualValue.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Duplicate JSON Keys Are Already Lost by the Time Normal Filtering Starts
          </h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-gray-50 p-4 text-sm leading-7 text-gray-800">{`{
  "role": "editor",
  "role": "admin"
}`}</pre>
          <p className="mt-4 leading-relaxed text-gray-600">
            JavaScript JSON parsing keeps the later member. A filter cannot
            recover the earlier value from the parsed object. The tool scans the
            source before filtering and warns when duplicate member names appear,
            so a match is not mistaken for evidence that the original source was
            unambiguous.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Browser Filtering Is Best for Review-Sized Data
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Pasted arrays are useful for API samples, fixtures, exported
            records, debugging and one-off investigation. Large production
            datasets are usually better handled with jq, a local script,
            database query or application-level pipeline where memory use and
            filter logic can be versioned and reproduced.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The 100-row output limit can keep a browser result manageable while
            still evaluating full counts. It is an output convenience, not
            pagination or streaming processing.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/json-array-filter-tool" />
        </div>
      </section>
    </ToolShell>
  );
}

function Toggle({
  checked,
  onChange,
  title,
  text,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  text: string;
}) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event: { target: { checked: boolean } }) =>
          onChange(event.target.checked)
        }
        className="mt-1"
      />
      <span>
        <strong className="text-gray-900">{title}</strong>
        <span className="mt-1 block text-gray-500">{text}</span>
      </span>
    </label>
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
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-2 break-words text-lg font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}
