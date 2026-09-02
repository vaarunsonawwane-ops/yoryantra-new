"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode =
  | "pairs"
  | "formdata"
  | "fetch"
  | "urlencoded"
  | "curl"
  | "multipart"
  | "json";

type KeyStyle =
  | "dot"
  | "bracket";

type ArrayMode =
  | "repeat"
  | "brackets"
  | "indexed"
  | "json";

type NullMode =
  | "empty"
  | "null"
  | "omit";

type FieldRow = {
  key: string;
  value: string;
  sourceType: string;
  depth: number;
  fromArray: boolean;
};

type ReviewIssue = {
  severity: "warning" | "note";
  title: string;
  message: string;
};

type ConversionResult = {
  fields: FieldRow[];
  output: string;
  issues: ReviewIssue[];
  duplicateJsonKeys: string[];
  unsafeNumberPaths: string[];
};

const SAMPLE_INPUT = `{
  "name": "Asha",
  "active": true,
  "tags": ["api", "forms", "debugging"],
  "profile": {
    "role": "developer",
    "city": "Pune"
  },
  "limit": 25,
  "note": null
}`;

function detectDuplicateJsonKeys(source: string) {
  const duplicates: string[] = [];
  const stack: Array<{
    type: "object" | "array";
    keys?: string[];
  }> = [];
  let index = 0;

  const stringEnd = (start: number) => {
    let escaped = false;

    for (let cursor = start + 1; cursor < source.length; cursor += 1) {
      const char = source.charAt(cursor);

      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        return cursor;
      }
    }

    return source.length - 1;
  };

  while (index < source.length) {
    const char = source.charAt(index);

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    if (char === "{") {
      stack.push({
        type: "object",
        keys: [],
      });
      index += 1;
      continue;
    }

    if (char === "[") {
      stack.push({
        type: "array",
      });
      index += 1;
      continue;
    }

    if (char === "}" || char === "]") {
      stack.pop();
      index += 1;
      continue;
    }

    if (char === '"') {
      const end = stringEnd(index);
      const raw = source.slice(index, end + 1);
      let cursor = end + 1;

      while (
        cursor < source.length &&
        /\s/.test(source.charAt(cursor))
      ) {
        cursor += 1;
      }

      const current = stack[stack.length - 1];

      if (
        current &&
        current.type === "object" &&
        current.keys &&
        source.charAt(cursor) === ":"
      ) {
        try {
          const key = JSON.parse(raw) as string;

          if (current.keys.indexOf(key) !== -1) {
            if (duplicates.indexOf(key) === -1) {
              duplicates.push(key);
            }
          } else {
            current.keys.push(key);
          }
        } catch {
          // Main JSON.parse reports invalid source syntax.
        }
      }

      index = end + 1;
      continue;
    }

    index += 1;
  }

  return duplicates;
}

function appendObjectKey(
  base: string,
  key: string,
  keyStyle: KeyStyle
) {
  if (!base) {
    return key;
  }

  return keyStyle === "dot"
    ? `${base}.${key}`
    : `${base}[${key}]`;
}

function appendArrayIndex(
  base: string,
  index: number,
  arrayMode: ArrayMode
) {
  if (arrayMode === "repeat") {
    return base;
  }

  if (arrayMode === "brackets") {
    return `${base}[]`;
  }

  return `${base}[${index}]`;
}

function scalarToString(
  value: string | number | boolean,
  trimStrings: boolean
) {
  if (typeof value === "string") {
    return trimStrings ? value.trim() : value;
  }

  return String(value);
}

function flattenJson(
  value: Record<string, unknown>,
  options: {
    keyStyle: KeyStyle;
    arrayMode: ArrayMode;
    nullMode: NullMode;
    trimStrings: boolean;
    includeEmptyStrings: boolean;
  }
) {
  const fields: FieldRow[] = [];
  const unsafeNumberPaths: string[] = [];

  const addScalar = (
    path: string,
    value: string | number | boolean,
    depth: number,
    fromArray: boolean
  ) => {
    const fieldValue = scalarToString(value, options.trimStrings);

    if (!options.includeEmptyStrings && fieldValue === "") {
      return;
    }

    if (
      typeof value === "number" &&
      Number.isInteger(value) &&
      !Number.isSafeInteger(value)
    ) {
      unsafeNumberPaths.push(path || "(empty field name)");
    }

    fields.push({
      key: path,
      value: fieldValue,
      sourceType: typeof value,
      depth,
      fromArray,
    });
  };

  const walk = (
    current: unknown,
    path: string,
    depth: number,
    fromArray: boolean
  ) => {
    if (current === null) {
      if (options.nullMode === "omit") {
        return;
      }

      fields.push({
        key: path,
        value: options.nullMode === "null" ? "null" : "",
        sourceType: "null",
        depth,
        fromArray,
      });
      return;
    }

    if (Array.isArray(current)) {
      if (options.arrayMode === "json") {
        fields.push({
          key: path,
          value: JSON.stringify(current),
          sourceType: "array",
          depth,
          fromArray: true,
        });
        return;
      }

      current.forEach((item, index) => {
        walk(
          item,
          appendArrayIndex(path, index, options.arrayMode),
          depth + 1,
          true
        );
      });

      return;
    }

    if (typeof current === "object") {
      const objectValue = current as Record<string, unknown>;

      Object.keys(objectValue).forEach((key) => {
        walk(
          objectValue[key],
          appendObjectKey(path, key, options.keyStyle),
          depth + 1,
          fromArray
        );
      });

      return;
    }

    if (
      typeof current === "string" ||
      typeof current === "number" ||
      typeof current === "boolean"
    ) {
      addScalar(path, current, depth, fromArray);
    }
  };

  Object.keys(value).forEach((key) => {
    walk(value[key], key, 0, false);
  });

  return {
    fields,
    unsafeNumberPaths,
  };
}

function hasNestedObject(value: unknown): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }

  if (Array.isArray(value)) {
    return value.some((item) => hasNestedObject(item));
  }

  const objectValue = value as Record<string, unknown>;

  return Object.keys(objectValue).some((key) => {
    const item = objectValue[key];

    return Boolean(item && typeof item === "object" && !Array.isArray(item));
  });
}

function hasArray(value: unknown): boolean {
  if (Array.isArray(value)) {
    return true;
  }

  if (!value || typeof value !== "object") {
    return false;
  }

  const objectValue = value as Record<string, unknown>;

  return Object.keys(objectValue).some((key) => hasArray(objectValue[key]));
}

function hasArrayOfObjects(value: unknown): boolean {
  if (Array.isArray(value)) {
    if (
      value.some(
        (item) => Boolean(item && typeof item === "object" && !Array.isArray(item))
      )
    ) {
      return true;
    }

    return value.some((item) => hasArrayOfObjects(item));
  }

  if (!value || typeof value !== "object") {
    return false;
  }

  const objectValue = value as Record<string, unknown>;
  return Object.keys(objectValue).some((key) => hasArrayOfObjects(objectValue[key]));
}

function findAmbiguousKeys(
  value: unknown,
  keyStyle: KeyStyle,
  path: string = ""
): string[] {
  if (!value || typeof value !== "object") {
    return [];
  }

  if (Array.isArray(value)) {
    let arrayIssues: string[] = [];
    value.forEach((item, index) => {
      arrayIssues = arrayIssues.concat(
        findAmbiguousKeys(item, keyStyle, `${path}[${index}]`)
      );
    });
    return arrayIssues;
  }

  const objectValue = value as Record<string, unknown>;
  let issues: string[] = [];

  Object.keys(objectValue).forEach((key) => {
    const ambiguous =
      keyStyle === "dot"
        ? key.indexOf(".") !== -1
        : key.indexOf("[") !== -1 || key.indexOf("]") !== -1;
    const nextPath = path ? `${path}.${key}` : key;

    if (ambiguous) {
      issues.push(nextPath);
    }

    issues = issues.concat(findAmbiguousKeys(objectValue[key], keyStyle, nextPath));
  });

  return issues;
}

function hasControl(value: string) {
  return /[\u0000-\u001F\u007F]/.test(value);
}

function validateFieldNames(fields: FieldRow[]) {
  const bad = fields.filter((field) => hasControl(field.key));

  if (bad.length) {
    throw new Error(
      `${bad.length} generated field name${
        bad.length === 1 ? " contains" : "s contain"
      } a control character. Remove line breaks/control characters from JSON object keys before generating form fields.`
    );
  }
}

function quotePosix(value: string) {
  return `'${value.replace(/'/g, "'\\''")}'`;
}

function validateCurlUrl(raw: string) {
  const trimmed = raw.trim();

  if (!trimmed) {
    return "";
  }

  let url: URL;

  try {
    url = new URL(trimmed);
  } catch {
    throw new Error("cURL URL must be an absolute HTTP or HTTPS URL.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("cURL URL must use HTTP or HTTPS.");
  }

  if (url.username || url.password) {
    throw new Error(
      "cURL URL must not contain embedded credentials. Put authentication in a deliberate header or client option instead."
    );
  }

  return url.href;
}

function jsStringLiteral(value: string) {
  return JSON.stringify(value)
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function buildFormDataCode(fields: FieldRow[]) {
  const lines = ["const formData = new FormData();"];

  fields.forEach((field) => {
    lines.push(
      `formData.append(${jsStringLiteral(field.key)}, ${jsStringLiteral(field.value)});`
    );
  });

  return lines.join("\n");
}

function buildFetchCode(fields: FieldRow[]) {
  return [
    buildFormDataCode(fields),
    "",
    "fetch(url, {",
    '  method: "POST",',
    "  body: formData,",
    "});",
    "",
    "// Do not manually set Content-Type for browser FormData.",
    "// The browser adds multipart/form-data with the generated boundary.",
  ].join("\n");
}

function buildUrlEncoded(fields: FieldRow[]) {
  const params = new URLSearchParams();

  fields.forEach((field) => {
    params.append(field.key, field.value);
  });

  return params.toString();
}

function buildCurl(fields: FieldRow[], rawUrl: string) {
  const url = validateCurlUrl(rawUrl);
  const parts = ["curl"];

  if (url) {
    parts.push(quotePosix(url));
  } else {
    parts.push("URL");
  }

  fields.forEach((field) => {
    parts.push(
      `--form-string ${quotePosix(`${field.key}=${field.value}`)}`
    );
  });

  return parts.join(" \\\n  ");
}

function escapeDispositionName(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');
}

function buildMultipartPreview(fields: FieldRow[]) {
  const boundary = "----FormDataPreviewBoundary";
  const lines = [
    `Content-Type: multipart/form-data; boundary=${boundary}`,
    "",
  ];

  fields.forEach((field) => {
    lines.push(
      `--${boundary}`,
      `Content-Disposition: form-data; name="${escapeDispositionName(field.key)}"`,
      "",
      field.value
    );
  });

  lines.push(`--${boundary}--`, "");

  return lines.join("\r\n");
}

function buildPairs(fields: FieldRow[]) {
  return fields
    .map((field, index) => `${index + 1}. ${field.key} = ${field.value}`)
    .join("\n");
}

function buildJsonReport(
  fields: FieldRow[],
  issues: ReviewIssue[]
) {
  return JSON.stringify(
    {
      fieldCount: fields.length,
      fields,
      issues,
    },
    null,
    2
  );
}

function buildIssues(
  parsed: Record<string, unknown>,
  fields: FieldRow[],
  options: {
    arrayMode: ArrayMode;
    keyStyle: KeyStyle;
    nullMode: NullMode;
    trimStrings: boolean;
    duplicateJsonKeys: string[];
    unsafeNumberPaths: string[];
    outputMode: OutputMode;
    ambiguousKeys: string[];
    hasArrayOfObjects: boolean;
  }
) {
  const issues: ReviewIssue[] = [];

  if (hasNestedObject(parsed)) {
    issues.push({
      severity: "warning",
      title: "Nested JSON has no universal form encoding",
      message:
        `Nested objects were flattened with the selected ${options.keyStyle} key style. Your server framework must interpret those field names the same way.`,
    });
  }

  if (hasArray(parsed)) {
    issues.push({
      severity: "warning",
      title: "Array representation is API-specific",
      message:
        `Arrays use "${options.arrayMode}" mode. Repeated keys, [] suffixes, numeric indexes and JSON-string arrays are all used by real APIs, but none is universal.`,
    });
  }


  if (options.ambiguousKeys.length) {
    issues.push({
      severity: "warning",
      title: "A source key collides with the flattening syntax",
      message:
        `${options.ambiguousKeys.length} JSON key${
          options.ambiguousKeys.length === 1 ? "" : "s"
        } contain characters used by the selected ${options.keyStyle} path convention: ${options.ambiguousKeys
          .slice(0, 6)
          .join(", ")}${options.ambiguousKeys.length > 6 ? "…" : ""}. Confirm how the server distinguishes literal key characters from nested paths.`,
    });
  }

  if (options.hasArrayOfObjects && options.arrayMode === "repeat") {
    issues.push({
      severity: "warning",
      title: "Repeated names can lose array-item grouping",
      message:
        "An array contains objects while array mode is set to repeat field names. Multiple object items can flatten into repeated child names without a reliable boundary between one item and the next.",
    });
  }

  if (options.duplicateJsonKeys.length) {
    issues.push({
      severity: "warning",
      title: "Duplicate JSON member names",
      message:
        `The source repeats ${options.duplicateJsonKeys.join(
          ", "
        )}. JSON.parse keeps only the last value for a duplicate name, so earlier source values cannot become form fields.`,
    });
  }

  if (options.unsafeNumberPaths.length) {
    issues.push({
      severity: "warning",
      title: "Unsafe JavaScript integer precision",
      message:
        `${options.unsafeNumberPaths.length} integer field${
          options.unsafeNumberPaths.length === 1 ? "" : "s"
        } exceed JavaScript's safe-integer range after JSON parsing: ${options.unsafeNumberPaths
          .slice(0, 6)
          .join(", ")}${
          options.unsafeNumberPaths.length > 6 ? "…" : ""
        }. If every digit matters, represent the value as a JSON string before conversion.`,
    });
  }

  if (options.trimStrings) {
    issues.push({
      severity: "note",
      title: "String trimming is enabled",
      message:
        "Leading and trailing whitespace in JSON strings was removed before form output. Keep trimming off when spaces are meaningful data.",
    });
  }

  if (options.nullMode === "omit") {
    issues.push({
      severity: "note",
      title: "Null fields are omitted",
      message:
        "JSON null values do not appear in the generated form field set. Some APIs distinguish a missing field from an explicitly empty/null-like field.",
    });
  }

  if (!fields.length) {
    issues.push({
      severity: "warning",
      title: "No form fields generated",
      message:
        "The JSON object produced no scalar form fields under the selected null/array/empty-string rules.",
    });
  }

  const fileLike = fields.filter(
    (field) =>
      /(?:file|filename|upload|avatar|image|document|attachment)/i.test(
        field.key
      ) ||
      /^data:[^;,]+[;,]/i.test(field.value)
  );

  if (fileLike.length) {
    issues.push({
      severity: "warning",
      title: "File-like fields are still strings",
      message:
        `${fileLike.length} generated field${
          fileLike.length === 1 ? " looks" : "s look"
        } file-related. JSON text cannot create a browser File/Blob upload automatically.`,
    });
  }

  if (
    options.outputMode === "formdata" ||
    options.outputMode === "fetch"
  ) {
    issues.push({
      severity: "note",
      title: "FormData values become strings unless they are Blob/File",
      message:
        "Numbers and booleans are serialized here as text intentionally. Browser FormData.append() converts non-Blob values to strings.",
    });
  }

  if (options.outputMode === "urlencoded") {
    issues.push({
      severity: "note",
      title: "URL-encoded output uses form encoding",
      message:
        "application/x-www-form-urlencoded represents field pairs as text and encodes spaces as +. It cannot represent binary file parts like multipart/form-data can.",
    });
  }

  if (options.outputMode === "multipart") {
    issues.push({
      severity: "note",
      title: "Multipart output is a preview",
      message:
        "The boundary/body preview demonstrates multipart field framing. Browser FormData chooses its own boundary, and real file parts need filename/content-type plus actual bytes.",
    });
  }

  return issues;
}

function convertJson(options: {
  input: string;
  outputMode: OutputMode;
  keyStyle: KeyStyle;
  arrayMode: ArrayMode;
  nullMode: NullMode;
  trimStrings: boolean;
  includeEmptyStrings: boolean;
  curlUrl: string;
}): ConversionResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(options.input);
  } catch (caught) {
    throw new Error(
      caught instanceof Error
        ? `Invalid JSON: ${caught.message}`
        : "Invalid JSON input."
    );
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    Array.isArray(parsed)
  ) {
    throw new Error(
      "The top-level JSON value must be an object. Form field names are generated from object properties."
    );
  }

  const duplicateJsonKeys = detectDuplicateJsonKeys(options.input);
  const flattened = flattenJson(parsed as Record<string, unknown>, {
    keyStyle: options.keyStyle,
    arrayMode: options.arrayMode,
    nullMode: options.nullMode,
    trimStrings: options.trimStrings,
    includeEmptyStrings: options.includeEmptyStrings,
  });

  validateFieldNames(flattened.fields);

  const issues = buildIssues(
    parsed as Record<string, unknown>,
    flattened.fields,
    {
      arrayMode: options.arrayMode,
      keyStyle: options.keyStyle,
      nullMode: options.nullMode,
      trimStrings: options.trimStrings,
      duplicateJsonKeys,
      unsafeNumberPaths: flattened.unsafeNumberPaths,
      outputMode: options.outputMode,
      ambiguousKeys: findAmbiguousKeys(parsed, options.keyStyle),
      hasArrayOfObjects: hasArrayOfObjects(parsed),
    }
  );

  let output = "";

  if (options.outputMode === "pairs") {
    output = buildPairs(flattened.fields);
  } else if (options.outputMode === "formdata") {
    output = buildFormDataCode(flattened.fields);
  } else if (options.outputMode === "fetch") {
    output = buildFetchCode(flattened.fields);
  } else if (options.outputMode === "urlencoded") {
    output = buildUrlEncoded(flattened.fields);
  } else if (options.outputMode === "curl") {
    output = buildCurl(flattened.fields, options.curlUrl);
  } else if (options.outputMode === "multipart") {
    output = buildMultipartPreview(flattened.fields);
  } else {
    output = buildJsonReport(flattened.fields, issues);
  }

  return {
    fields: flattened.fields,
    output,
    issues,
    duplicateJsonKeys,
    unsafeNumberPaths: flattened.unsafeNumberPaths,
  };
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("pairs");
  const [keyStyle, setKeyStyle] = useState<KeyStyle>("dot");
  const [arrayMode, setArrayMode] = useState<ArrayMode>("repeat");
  const [nullMode, setNullMode] = useState<NullMode>("empty");
  const [trimStrings, setTrimStrings] = useState(false);
  const [includeEmptyStrings, setIncludeEmptyStrings] = useState(true);
  const [curlUrl, setCurlUrl] = useState("https://api.example.com/submit");
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(
    () => (result ? result.issues : []),
    [result]
  );

  const clearResult = () => {
    setResult(null);
    setError("");
    setCopied(false);
  };

  const convert = () => {
    if (!input.trim()) {
      setError("Paste a JSON object to convert.");
      setResult(null);
      return;
    }

    try {
      setResult(
        convertJson({
          input,
          outputMode,
          keyStyle,
          arrayMode,
          nullMode,
          trimStrings,
          includeEmptyStrings,
          curlUrl,
        })
      );
      setError("");
      setCopied(false);
    } catch (caught) {
      setResult(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to convert this JSON object."
      );
      setCopied(false);
    }
  };

  const loadExample = () => {
    setInput(SAMPLE_INPUT);
    setOutputMode("pairs");
    setKeyStyle("dot");
    setArrayMode("repeat");
    setNullMode("empty");
    setTrimStrings(false);
    setIncludeEmptyStrings(true);
    setCurlUrl("https://api.example.com/submit");
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setOutputMode("pairs");
    setKeyStyle("dot");
    setArrayMode("repeat");
    setNullMode("empty");
    setTrimStrings(false);
    setIncludeEmptyStrings(true);
    setCurlUrl("https://api.example.com/submit");
    clearResult();
  };

  const copyOutput = async () => {
    if (!result || !result.output) return;

    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setError(
        "The generated output could not be copied. Select and copy it manually."
      );
    }
  };

  return (
    <ToolShell
      title="JSON to FormData Converter"
      description="JSON and form submissions use different data models. Choose how nested objects, arrays, nulls, and scalar values should become form fields."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block text-sm font-semibold text-gray-900">
            JSON object
          </label>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            Paste a request model, frontend state object or API example. The
            top-level value must be an object so property names can become form
            field names.
          </p>
          <textarea
            value={input}
            onChange={(event: { target: { value: string } }) => {
              setInput(event.target.value);
              clearResult();
            }}
            placeholder={SAMPLE_INPUT}
            spellCheck={false}
            className="mt-4 min-h-[430px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
        </div>

        <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5">
          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value: string) => {
              setOutputMode(value as OutputMode);
              clearResult();
            }}
            options={[
              { label: "Readable field pairs", value: "pairs" },
              { label: "JavaScript FormData code", value: "formdata" },
              { label: "Fetch + FormData example", value: "fetch" },
              { label: "application/x-www-form-urlencoded", value: "urlencoded" },
              { label: "cURL --form-string", value: "curl" },
              { label: "Multipart framing preview", value: "multipart" },
              { label: "JSON field report", value: "json" },
            ]}
          />

          <YoryantraSelect
            label="Nested object keys"
            value={keyStyle}
            onChange={(value: string) => {
              setKeyStyle(value as KeyStyle);
              clearResult();
            }}
            options={[
              { label: "Dot paths: profile.role", value: "dot" },
              { label: "Bracket paths: profile[role]", value: "bracket" },
            ]}
          />

          <YoryantraSelect
            label="Arrays"
            value={arrayMode}
            onChange={(value: string) => {
              setArrayMode(value as ArrayMode);
              clearResult();
            }}
            options={[
              { label: "Repeat field name", value: "repeat" },
              { label: "Empty brackets: tags[]", value: "brackets" },
              { label: "Indexes: tags[0]", value: "indexed" },
              { label: "Keep whole array as JSON text", value: "json" },
            ]}
          />

          <YoryantraSelect
            label="JSON null"
            value={nullMode}
            onChange={(value: string) => {
              setNullMode(value as NullMode);
              clearResult();
            }}
            options={[
              { label: "Empty string", value: "empty" },
              { label: 'Literal "null" text', value: "null" },
              { label: "Omit field", value: "omit" },
            ]}
          />

          {outputMode === "curl" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Request URL
              </label>
              <input
                value={curlUrl}
                onChange={(event: { target: { value: string } }) => {
                  setCurlUrl(event.target.value);
                  clearResult();
                }}
                spellCheck={false}
                className="mt-2 w-full rounded-xl border border-gray-300 p-3 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="font-semibold text-gray-900">Value handling</h3>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Toggle
            checked={trimStrings}
            onChange={(checked) => {
              setTrimStrings(checked);
              clearResult();
            }}
            title="Trim leading/trailing spaces"
            text="Off by default because whitespace can be meaningful form data."
          />
          <Toggle
            checked={includeEmptyStrings}
            onChange={(checked) => {
              setIncludeEmptyStrings(checked);
              clearResult();
            }}
            title="Keep empty string fields"
            text="Turn this off only if the target API treats an empty field the same as a missing field."
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={convert} className="yoryantra-btn">
          Convert JSON
        </button>
        <button type="button" onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>
        <button type="button" onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Fields" value={String(result.fields.length)} />
            <Stat
              label="Warnings"
              value={String(
                result.issues.filter((issue) => issue.severity === "warning").length
              )}
            />
            <Stat
              label="Duplicate JSON keys"
              value={String(result.duplicateJsonKeys.length)}
            />
            <Stat
              label="Unsafe integers"
              value={String(result.unsafeNumberPaths.length)}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Generated output
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  The representation follows the selected flattening rules; it
                  is not an assertion that your server uses those rules.
                </p>
              </div>

              <button
                type="button"
                onClick={copyOutput}
                className="yoryantra-btn-outline whitespace-nowrap"
              >
                {copied ? "Copied" : "Copy Output"}
              </button>
            </div>

            <pre className="yoryantra-output mt-4 min-h-[320px] max-h-[680px] overflow-auto whitespace-pre-wrap break-words font-mono text-sm">
              {result.output || "(no fields generated)"}
            </pre>
          </div>

          {notes.length ? (
            <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
              <h3 className="font-semibold text-yellow-900">Encoding review</h3>
              <div className="mt-4 space-y-3">
                {notes.map((issue, index) => (
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

          {result.fields.length ? (
            <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-left text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Field</th>
                    <th className="px-4 py-3 font-semibold">Value</th>
                    <th className="px-4 py-3 font-semibold">JSON type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {result.fields.slice(0, 80).map((field, index) => (
                    <tr key={`${field.key}-${index}`}>
                      <td className="px-4 py-3 font-mono">{field.key}</td>
                      <td className="px-4 py-3 break-words">{field.value}</td>
                      <td className="px-4 py-3">{field.sourceType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      ) : (
        <pre className="yoryantra-output mt-8 min-h-[300px] whitespace-pre-wrap break-words text-sm">
          Flattened fields, FormData code, form-encoded output or multipart
          preview will appear here.
        </pre>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        The pasted JSON is converted in your browser. No form submission, Fetch
        request, or cURL command is run. Site-wide analytics or advertising
        scripts, if enabled, are separate from the conversion step.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            JSON and Form Data Do Not Describe the Same Shapes
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JSON has objects, arrays, numbers, booleans, strings, and null.
            Browser FormData is an ordered list of names whose values are
            strings or Blob/File objects. There is no built-in FormData type for
            a nested object and no universal rule that says how an array should
            be flattened.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            That gap is where most integration bugs happen. Decide the field
            naming convention from the server contract first, then generate the
            request body to match it.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Pick a Field Naming Convention the Server Actually Parses
          </h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            Names such as <code>profile.role</code> and
            <code>profile[role]</code> are conventions used by frameworks and
            form parsers. HTTP does not assign nesting semantics to either one.
            A server can just as easily treat the brackets or dot as literal
            characters in the field name.
          </p>
          <p className="mt-4 leading-relaxed text-gray-700">
            Literal JSON keys can also collide with a flattening convention. A
            source key named <code>profile.role</code> becomes ambiguous when a
            dot is also being used to mean “nested property.” Rename the field,
            choose a different contract, or confirm how the receiving parser
            resolves that ambiguity.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Arrays Can Lose Structure When They Are Flattened
          </h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-gray-50 p-4 text-sm leading-7 text-gray-800">{`Repeated:
tags=api
tags=forms

Brackets:
tags[]=api
tags[]=forms

Indexed:
tags[0]=api
tags[1]=forms

JSON text:
tags=["api","forms"]`}</pre>
          <p className="mt-4 leading-relaxed text-gray-600">
            All four patterns exist in production APIs. Repeated names match the
            underlying entry-list model well for simple scalar arrays. Brackets
            and numeric indexes put extra structure into the field name. JSON
            text keeps the whole array together but requires a second JSON parse
            on the server.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Arrays of objects need extra care. Repeating child names can lose the
            boundary between item 0 and item 1. Indexed names or a JSON field are
            usually easier to interpret when object grouping matters.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Let the Browser Add the Multipart Boundary
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            When Fetch sends a FormData body, the browser serializes the entries
            and generates the multipart boundary. Setting
            <code>Content-Type: multipart/form-data</code> by hand usually leaves
            out that generated boundary, so the server cannot split the parts
            correctly.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Leave the Content-Type header unset for browser FormData unless you
            are deliberately constructing the multipart body yourself. A manual
            multipart preview is useful for reading the framing, not for copying
            a fixed boundary into Fetch code.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            URL-Encoded Forms and Multipart Forms Solve Different Problems
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            <code>application/x-www-form-urlencoded</code> is compact and works
            well for ordinary text fields, OAuth token requests, and older form
            endpoints. Spaces are represented as <code>+</code>, and other bytes
            are percent-encoded using the form encoding algorithm.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            <code>multipart/form-data</code> is built from separate parts and can
            carry file content as well as text fields. A URL-encoded body cannot
            represent a browser File or Blob part in the same way.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            A Filename String Is Not a File Upload
          </h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            <code>{"{ \"avatar\": \"/tmp/photo.jpg\" }"}</code> contains a
            path string, not the bytes of the photo. Browser uploads need a File
            or Blob object. cURL file upload has its own file-reading syntax such
            as <code>--form avatar=@photo.jpg</code>.
          </p>
          <p className="mt-4 leading-relaxed text-gray-700">
            Generated cURL fields use <code>--form-string</code> so an input value
            beginning with <code>@</code> stays text instead of unexpectedly
            reading a local file. Add an actual file part separately when that is
            what the endpoint expects.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Missing, Empty, and null Can Mean Different Things
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JSON has a real null value. Form fields do not have one universal
            typed null representation. An update endpoint may treat an omitted
            field as “leave unchanged,” an empty string as “clear it,” and the
            text <code>null</code> as five ordinary characters.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Pick the null rule from the endpoint semantics, not from how tidy the
            generated request looks. The same warning applies to empty strings;
            dropping them can change meaning when the server distinguishes an
            empty value from a missing field.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Large Numeric IDs Are Safer as JSON Strings
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JSON number syntax allows integer literals beyond JavaScript&apos;s exact
            safe-integer range. <code>JSON.parse()</code> produces a JavaScript
            Number, so a large database ID can lose digits before any form
            encoding happens.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            If every digit is an identifier rather than a quantity, send it as a
            JSON string at the source. Turning an already-rounded Number back
            into text cannot recover the missing digits.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            Duplicate JSON Names Disappear During Normal Parsing
          </h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-white p-4 text-sm leading-7 text-gray-800">{`{
  "tag": "first",
  "tag": "second"
}`}</pre>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            JavaScript keeps one <code>tag</code> property after parsing, so the
            two source members cannot later become two form fields. Duplicate
            names are flagged before the main parse so that overwrite risk stays
            visible.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Specifications Behind the Encoding
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <ReferenceCard
              title="XMLHttpRequest Standard — FormData"
              href="https://xhr.spec.whatwg.org/#interface-formdata"
              text="Defines FormData as an ordered entry list and the append() behavior for string and Blob/File values."
            />
            <ReferenceCard
              title="Fetch Standard"
              href="https://fetch.spec.whatwg.org/"
              text="Defines how a FormData request body is serialized and how the multipart/form-data boundary is generated."
            />
            <ReferenceCard
              title="RFC 7578 — multipart/form-data"
              href="https://www.rfc-editor.org/rfc/rfc7578"
              text="Defines multipart boundaries, Content-Disposition form-data parts, field names, and file parts."
            />
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            When the Server Still Rejects the Payload
          </h2>

          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/json-to-form-data-converter" />
          </div>
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
    <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm leading-relaxed text-gray-700">
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

function ReferenceCard({
  title,
  href,
  text,
}: {
  title: string;
  href: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="font-semibold text-[var(--green)] underline underline-offset-4"
      >
        {title}
      </a>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">{text}</p>
    </div>
  );
}
