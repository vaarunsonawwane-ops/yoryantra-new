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
  "name": "Sneha",
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
    '// Replace this example URL with your API endpoint.',
    'const url = "https://api.example.com/submit";',
    "",
    buildFormDataCode(fields),
    "",
    "fetch(url, {",
    '  method: "POST",',
    "  body: formData,",
    "});",
    "",
    "// Let the browser set Content-Type and the multipart boundary.",
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
      title: "Check your nested field names",
      message:
        `Your JSON has nested objects. The tool used ${options.keyStyle === "dot" ? "dots" : "brackets"} in the field names. Check that your API accepts them.`,
    });
  }

  if (hasArray(parsed)) {
    issues.push({
      severity: "warning",
      title: "Check the array format",
      message:
        `Your JSON contains arrays. You selected "${options.arrayMode}" mode. Make sure your API accepts this format.`,
    });
  }


  if (options.ambiguousKeys.length) {
    issues.push({
      severity: "warning",
      title: "Some field names may conflict",
      message:
        `Check these JSON keys: ${options.ambiguousKeys.slice(0, 6).join(", ")}${options.ambiguousKeys.length > 6 ? "…" : ""}. They contain dots or brackets that may also be used for nested fields. Your API might read them differently than you expect.`,
    });
  }

  if (options.hasArrayOfObjects && options.arrayMode === "repeat") {
    issues.push({
      severity: "warning",
      title: "Array items may get mixed together",
      message:
        "Your JSON has an array of objects. Repeated field names can make it hard to tell which values belong to each object. Try numbered indexes or JSON text if your API accepts them.",
    });
  }

  if (options.duplicateJsonKeys.length) {
    issues.push({
      severity: "warning",
      title: "Duplicate JSON keys found",
      message:
        `These keys appear more than once: ${options.duplicateJsonKeys.join(", ")}. JavaScript keeps the last value for each repeated key, so earlier values won't appear in the result.`,
    });
  }

  if (options.unsafeNumberPaths.length) {
    issues.push({
      severity: "warning",
      title: "A large number may have lost digits",
      message:
        `Check these fields: ${options.unsafeNumberPaths.slice(0, 6).join(", ")}${options.unsafeNumberPaths.length > 6 ? "…" : ""}. The numbers are too large for JavaScript to read safely. If they're IDs, put them inside quotes in your original JSON to keep every digit.`,
    });
  }

  if (options.trimStrings) {
    issues.push({
      severity: "note",
      title: "Spaces were removed",
      message:
        "You've turned on trimming, so spaces at the beginning and end of text values were removed. Turn it off if those spaces matter.",
    });
  }

  if (options.nullMode === "omit") {
    issues.push({
      severity: "note",
      title: "Null fields were left out",
      message:
        "You chose to skip null values, so those fields won't appear in the result. Some APIs treat a missing field differently from an empty field.",
    });
  }

  if (!fields.length) {
    issues.push({
      severity: "warning",
      title: "No fields were created",
      message:
        "There are no fields to show. Check your JSON and the options you've selected. Empty objects, empty arrays and skipped values can leave you with no fields.",
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
      title: "Add the actual file if you're uploading one",
      message:
        `${fileLike.length} field${fileLike.length === 1 ? " may be" : "s may be"} related to a file. The tool keeps these values as text. To upload a file, add a File or Blob in JavaScript, or use cURL's file upload option.`,
    });
  }

  if (
    options.outputMode === "formdata" ||
    options.outputMode === "fetch"
  ) {
    issues.push({
      severity: "note",
      title: "Numbers and true/false become text",
      message:
        "FormData stores numbers and true/false values as text. For example, true becomes the text \"true\". Add a real File or Blob separately if you need to upload one.",
    });
  }

  if (options.outputMode === "urlencoded") {
    issues.push({
      severity: "note",
      title: "URL-encoded output is for text fields",
      message:
        "This format uses + for spaces and encodes special characters. It sends text fields, not file uploads. Check that your API accepts application/x-www-form-urlencoded.",
    });
  }

  if (options.outputMode === "multipart") {
    issues.push({
      severity: "note",
      title: "This is a multipart preview",
      message:
        "The preview shows how the fields are separated. Your browser will create its own boundary when it sends FormData. To upload a file, add the actual file bytes separately.",
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
      "Your JSON must start with an object, like {\"name\": \"Sneha\"}. The tool uses its keys to make form fields."
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
      description="Turn your JSON into FormData for API requests. Just paste in your JSON, decide what to do with nested objects, arrays and null values, and then copy the result."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block text-sm font-semibold text-gray-900">
            JSON object
          </label>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            Enter the JSON code you want to change. This can be from a program
            you're working on, an example from an API, or your own information.
            Your JSON must start with an object, like {"{}"}. The tool uses its
            keys to make form fields.
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
            text="Off by default. Sometimes the spaces at the start or end of a value matter."
          />
          <Toggle
            checked={includeEmptyStrings}
            onChange={(checked) => {
              setIncludeEmptyStrings(checked);
              clearResult();
            }}
            title="Keep empty strings from JSON"
            text="Turn this off to skip empty text values in your JSON. Null values use the separate JSON null option."
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
                  The results of your conversion will show up here. You can copy
                  the form fields, JavaScript code, or whichever output you chose.
                  Check the field names before using them in your API request.
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
              <h3 className="font-semibold text-yellow-900">Things to check</h3>
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
              {result.fields.length > 80 ? (
                <p className="border-b border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  Showing the first 80 of {result.fields.length} fields here.
                  The generated output above has all {result.fields.length} fields.
                </p>
              ) : null}
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
          Your converted fields or code will show up here.
        </pre>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Your JSON is converted right in your browser. The tool doesn't send
        your JSON to an API or run any code it generates. Website analytics
        and ads, if they're turned on, work on their own and don't affect
        the conversion.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            How JSON becomes FormData
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JSON is pretty flexible - it can hold all sorts of things like text,
            numbers, and even objects and arrays. FormData is a different story
            though. It uses names for fields, and these fields can contain text
            or files.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            So, let's say you have a basic JSON object with a name and an email -
            that can easily turn into two form fields. But things get tricky
            when your JSON has nested objects or lists. Then you have to figure
            out what to call those fields.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            So the tool offers a few choices. This way, you can pick the format
            that fits with your API. Numbers and true/false values are sent as text.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            How to handle nested objects
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            Let's say your JSON looks like this:
          </p>
          <pre className="mt-4 overflow-auto rounded-xl bg-white p-4 text-sm leading-7 text-gray-800">{`{
  "profile": {
    "role": "developer"
  }
}`}</pre>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            You can change it to one of these field names:
          </p>
          <pre className="mt-4 overflow-auto rounded-xl bg-white p-4 text-sm leading-7 text-gray-800">{`profile.role=developer

or

profile[role]=developer`}</pre>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            Some APIs use dots to show nested data, while others use brackets.
            This is pretty standard - you'll see both ways used a lot.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            Something to keep in mind is that if your original JSON has a key
            called <code>profile.role</code>, the result might look identical
            to a field made from a nested object. Take a closer look at how
            your API reads that field name. You may need to change the key's
            name or try a different format to get it working.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Converting JSON arrays
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Arrays can be converted in different ways too. For example,
            suppose you have:
          </p>
          <pre className="mt-4 overflow-auto rounded-xl bg-gray-50 p-4 text-sm leading-7 text-gray-800">{`{
  "tags": ["api", "forms"]
}`}</pre>
          <p className="mt-4 leading-relaxed text-gray-600">
            This tool gives you four options to change the array.
          </p>
          <pre className="mt-4 overflow-auto rounded-xl bg-gray-50 p-4 text-sm leading-7 text-gray-800">{`Repeat the field name:
tags=api
tags=forms

Add brackets:
tags[]=api
tags[]=forms

Use numbered indexes:
tags[0]=api
tags[1]=forms

Keep the array as JSON text:
tags=["api","forms"]`}</pre>
          <p className="mt-4 leading-relaxed text-gray-600">
            Different APIs use these formats, so you need to check which one
            works with yours.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            When you're working with arrays that have objects in them, you need
            to be a bit more careful. If you use the same field names over and
            over, the server can have trouble knowing which fields go with
            which object. Numbered indexes can help tell things apart. If your
            API allows it, you can also keep the whole array as JSON text.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Let your browser handle the multipart boundary
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            When you use JavaScript Fetch to send FormData, the browser handles
            the details of splitting it into parts for you. The boundary
            separates the different fields in the request so the server can
            read them.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            You don't have to include the <code>Content-Type: multipart/form-data</code>
            header on your own. If you set it without the right boundary,
            it can actually make the request fail. Just include FormData in the
            body of your Fetch request. The browser will add the right header.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This tool has a multipart preview that shows you how the fields
            are put together. The browser creates its own boundary when you
            actually send FormData.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            URL-encoded or multipart form data?
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            These two formats are used for sending form data, but they don't
            work the same way.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            <strong>URL-encoded form data</strong> is great for sending text
            information. We usually use it for normal forms and API requests,
            like when we need an OAuth token. Spaces are replaced with
            <code>+</code> and other characters are encoded so they can be sent.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            <strong>Multipart form data</strong> sends information in separate
            parts. These parts can contain text or files - it can handle both.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            If your API expects <code>application/x-www-form-urlencoded</code>,
            choose URL-encoded output. If it expects
            <code>multipart/form-data</code>, use FormData or the Fetch example
            the tool creates. The multipart preview shows how the fields are
            laid out, but it doesn't upload any files.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-xl font-semibold text-red-900">
            Uploading files
          </h2>
          <p className="mt-4 leading-relaxed text-red-900/90">
            Suppose your JSON contains:
          </p>
          <pre className="mt-4 overflow-auto rounded-xl bg-white p-4 text-sm leading-7 text-gray-800">{`{
  "avatar": "/tmp/photo.jpg"
}`}</pre>
          <p className="mt-4 leading-relaxed text-red-900/90">
            This tells you where a picture is, but it doesn't include the
            actual picture. To upload it from your browser, add the actual
            File or Blob to FormData.
          </p>
          <p className="mt-4 leading-relaxed text-red-900/90">
            For cURL, you can use:
          </p>
          <pre className="mt-4 overflow-auto rounded-xl bg-white p-4 text-sm leading-7 text-gray-800">{"curl --form 'avatar=@photo.jpg' https://example.com/upload"}</pre>
          <p className="mt-4 leading-relaxed text-red-900/90">
            This tool uses <code>--form-string</code> when it creates cURL output.
            That way, if a text field starts with <code>@</code>, it's treated
            as regular text and not mistaken for a file path. If you need to
            send a real file with your API, add it separately.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Handling null and empty values
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            When you change JSON into form data, you might get fields that are
            empty or have <code>null</code> in them. The tool gives you three
            options for <code>null</code>:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6 leading-relaxed text-gray-600">
            <li>Send an empty string.</li>
            <li>Send the text <code>null</code>.</li>
            <li>Leave the field out.</li>
          </ul>
          <p className="mt-4 leading-relaxed text-gray-600">
            Why does this matter?
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            So, let's say you're making changes to someone's profile. With
            some APIs, if you don't include a particular field, it will just
            stay the same. But here's the thing: if you include that field
            and it's empty, the API might actually clear the saved value.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The text <code>null</code> may be treated like any other text.
            So take a look at how your API works with these values before you
            pick an option. You also get to choose if you want to include
            empty strings in the result or not.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Working with large numbers
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            When you're working with JSON and it has a really big number,
            JavaScript might have trouble reading all the digits right.
            This is an issue with really long IDs, like order numbers or
            account numbers, where every single digit is important.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">For example:</p>
          <pre className="mt-4 overflow-auto rounded-xl bg-gray-50 p-4 text-sm leading-7 text-gray-800">{`{
  "orderId": "9007199254740993"
}`}</pre>
          <p className="mt-4 leading-relaxed text-gray-600">
            When you put the ID in quotes, JavaScript treats it as text,
            so it keeps all the digits. If you use the same ID as a number
            in JSON, JavaScript may change its value when it reads it.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            If JavaScript has already changed the number, turning it back into
            text won't bring the missing digits back. For long IDs, it's
            generally better to keep them as strings.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            Check for duplicate JSON keys
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            Look at this JSON:
          </p>
          <pre className="mt-4 overflow-auto rounded-xl bg-white p-4 text-sm leading-7 text-gray-800">{`{
  "tag": "first",
  "tag": "second"
}`}</pre>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            The key <code>tag</code> appears twice. When JavaScript reads the
            JSON, it uses the last value it finds, which in this case is
            <code>second</code>. So the first value just gets lost.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            This tool looks at your JSON to see if you have any keys that are
            the same. If it finds duplicates, it will show a warning, so you
            can fix them before using the converted result.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            When your API rejects the converted data
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The converted data might look fine, but for some reason, the API
            still gives an error. This can be really confusing because
            everything seems okay, yet it just doesn't work.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Start by looking at the error message your API gives you. This
            message might say what's wrong or what's missing.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Next, check the fields you've converted to see if they match what
            the API is looking for. Make sure to look closely at nested field
            names, arrays, and empty values too.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            If you get an HTTP 415 error, take a look at how you're sending
            the request. Your API might need JSON, URL-encoded form data or
            multipart form data. Check the format it accepts.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            When you're making a Fetch request with FormData, just let the
            browser handle the multipart header. If you're uploading a file,
            double-check that you're sending the file itself, not just its name.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Try sending just a couple of fields to start. If they work okay,
            then add the rest and see where things go wrong.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Technical references
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            To get a better grasp of FormData, it's helpful to look at the
            standards that make it work. These standards explain how FormData
            functions in more detail.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <ReferenceCard
              title="XMLHttpRequest Standard — FormData"
              href="https://xhr.spec.whatwg.org/#interface-formdata"
              text="FormData stores field names with text or file values. It also has append(), which lets you add another field or file."
            />
            <ReferenceCard
              title="Fetch Standard"
              href="https://fetch.spec.whatwg.org/"
              text="Explains how browsers send FormData in HTTP requests and generate multipart boundaries."
            />
            <ReferenceCard
              title="RFC 7578 — multipart/form-data"
              href="https://www.rfc-editor.org/rfc/rfc7578"
              text="Explains how multipart requests send form fields and files, including field names, filenames and boundaries."
            />
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <YoryantraRelatedTools currentHref="/tools/json-to-form-data-converter" />
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
        className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]"
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
