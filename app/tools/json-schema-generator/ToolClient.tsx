"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type SchemaDraft = "2020-12" | "2019-09" | "draft-07";
type OutputMode = "schema" | "schemaWithExample" | "summary";
type RequiredMode = "all" | "nonNull" | "none";
type ArrayMode = "merged" | "firstItem";

type SchemaNode = {
  type?: string | string[];
  properties?: Record<string, SchemaNode>;
  items?: SchemaNode;
  required?: string[];
  enum?: unknown[];
  examples?: unknown[];
  format?: string;
  additionalProperties?: boolean;
  minItems?: number;
  title?: string;
  description?: string;
  [key: string]: unknown;
};

type SchemaStats = {
  objectCount: number;
  arrayCount: number;
  propertyCount: number;
  maxDepth: number;
  nullableFields: number;
  mixedArrays: number;
};

type GeneratedResult = {
  schema: SchemaNode;
  output: string;
  stats: SchemaStats;
  warnings: string[];
};

type SchemaNote = {
  title: string;
  message: string;
};

const sampleJson = `{
  "id": 101,
  "name": "Yoryantra Tool",
  "slug": "json-schema-generator",
  "published": true,
  "category": "JSON & Data Tools",
  "tags": ["json", "schema", "developer"],
  "meta": {
    "title": "JSON Schema Generator",
    "priority": 1
  },
  "createdAt": "2026-05-31T10:30:00Z"
}`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [schemaDraft, setSchemaDraft] = useState<SchemaDraft>("2020-12");
  const [outputMode, setOutputMode] = useState<OutputMode>("schema");
  const [requiredMode, setRequiredMode] = useState<RequiredMode>("all");
  const [arrayMode, setArrayMode] = useState<ArrayMode>("merged");
  const [schemaTitle, setSchemaTitle] = useState("Generated Schema");
  const [includeExamples, setIncludeExamples] = useState(true);
  const [detectFormats, setDetectFormats] = useState(true);
  const [allowAdditionalProperties, setAllowAdditionalProperties] = useState(true);
  const [nullableTypes, setNullableTypes] = useState(true);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getSchemaNotes(result) : []), [result]);

  const generateSchema = () => {
    if (!input.trim()) {
      setError("Please paste sample JSON to generate a schema.");
      setResult(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const nextResult = buildSchemaFromJson(parsed, {
        schemaDraft,
        outputMode,
        requiredMode,
        arrayMode,
        schemaTitle,
        includeExamples,
        detectFormats,
        allowAdditionalProperties,
        nullableTypes,
      });

      setResult(nextResult);
      setOutput(nextResult.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof SyntaxError
          ? "The sample JSON is not valid. Please fix the JSON and try again."
          : err instanceof Error
          ? err.message
          : "Unable to generate JSON Schema."
      );
      setResult(null);
      setOutput("");
      setCopied(false);
    }
  };

  const copyOutput = async () => {
    if (!output) {
      return;
    }

    await navigator.clipboard.writeText(output);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1400);
  };

  const loadExample = () => {
    setInput(sampleJson);
    setSchemaDraft("2020-12");
    setOutputMode("schema");
    setRequiredMode("all");
    setArrayMode("merged");
    setSchemaTitle("Yoryantra Tool Schema");
    setIncludeExamples(true);
    setDetectFormats(true);
    setAllowAdditionalProperties(true);
    setNullableTypes(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setSchemaDraft("2020-12");
    setOutputMode("schema");
    setRequiredMode("all");
    setArrayMode("merged");
    setSchemaTitle("Generated Schema");
    setIncludeExamples(true);
    setDetectFormats(true);
    setAllowAdditionalProperties(true);
    setNullableTypes(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="JSON Schema Generator"
      description="Generate JSON Schema from sample JSON, detect types, arrays, nested objects, required fields, enums, examples, and validation-friendly schema directly in your browser."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Sample JSON
        </label>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setResult(null);
            setOutput("");
            setError("");
            setCopied(false);
          }}
          placeholder={sampleJson}
          className="w-full min-h-[390px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste a sample JSON object, array, API response, or config file. The
          schema is generated locally in your browser.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Options
        </h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Schema Draft"
            value={schemaDraft}
            onChange={(value) => {
              setSchemaDraft(value as SchemaDraft);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              {
                label: "2020-12",
                value: "2020-12",
              },
              {
                label: "2019-09",
                value: "2019-09",
              },
              {
                label: "Draft 07",
                value: "draft-07",
              },
            ]}
          />

          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value) => {
              setOutputMode(value as OutputMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              {
                label: "Schema only",
                value: "schema",
              },
              {
                label: "Schema with example",
                value: "schemaWithExample",
              },
              {
                label: "Summary",
                value: "summary",
              },
            ]}
          />

          <YoryantraSelect
            label="Required Fields"
            value={requiredMode}
            onChange={(value) => {
              setRequiredMode(value as RequiredMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              {
                label: "All object keys",
                value: "all",
              },
              {
                label: "Only non-null keys",
                value: "nonNull",
              },
              {
                label: "No required fields",
                value: "none",
              },
            ]}
          />

          <YoryantraSelect
            label="Array Handling"
            value={arrayMode}
            onChange={(value) => {
              setArrayMode(value as ArrayMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              {
                label: "Merge all items",
                value: "merged",
              },
              {
                label: "Use first item",
                value: "firstItem",
              },
            ]}
          />

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Schema Title
            </label>

            <input
              value={schemaTitle}
              onChange={(event) => {
                setSchemaTitle(event.target.value);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              placeholder="Generated Schema"
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={includeExamples}
              onChange={(event) => {
                setIncludeExamples(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Include examples
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={detectFormats}
              onChange={(event) => {
                setDetectFormats(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Detect common formats
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={nullableTypes}
              onChange={(event) => {
                setNullableTypes(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Include null in nullable types
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={allowAdditionalProperties}
              onChange={(event) => {
                setAllowAdditionalProperties(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Allow additional properties
          </label>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          A generated schema is a strong starting point. Review it before using
          it for real validation rules.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generateSchema} className="yoryantra-btn">
          Generate Schema
        </button>

        <button onClick={copyOutput} className="yoryantra-btn" disabled={!output}>
          {copied ? "Copied" : "Copy Output"}
        </button>

        <button onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Properties"
            value={result.stats.propertyCount.toLocaleString()}
          />
          <SummaryCard
            label="Objects"
            value={result.stats.objectCount.toLocaleString()}
          />
          <SummaryCard
            label="Arrays"
            value={result.stats.arrayCount.toLocaleString()}
          />
          <SummaryCard
            label="Max Depth"
            value={result.stats.maxDepth.toLocaleString()}
          />
        </div>
      )}

      {result && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Schema Preview
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Generated JSON Schema based on the sample JSON.
          </p>

          <pre className="mt-4 overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm font-mono text-gray-800 whitespace-pre-wrap break-words max-h-[520px]">
            {JSON.stringify(result.schema, null, 2)}
          </pre>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Schema notes
          </h3>

          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-amber-900">
                  {note.title}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-amber-800">
                  {note.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Output
          </h3>

          {output && (
            <button
              onClick={copyOutput}
              className="yoryantra-btn-outline text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[340px] whitespace-pre-wrap break-words">
          {output || "Generated JSON Schema will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        JSON Schema generation happens directly in your browser. Your pasted JSON
        is not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Generating JSON Schema From Sample JSON
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON Schema is useful when you need to describe the shape of a JSON
            object, validate API responses, document request bodies, or keep data
            contracts clear. Writing a schema by hand can take time when the JSON
            has nested objects, arrays, nullable values, and mixed types.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This JSON Schema Generator reads sample JSON and creates a starting
            schema with detected types, object properties, array items, required
            fields, examples, and common formats like email, URI, and date-time.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Creating a Schema From JSON
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste a sample JSON object or array.</li>
            <li>Choose the JSON Schema draft version.</li>
            <li>Select how required fields and arrays should be handled.</li>
            <li>Generate the schema and review the detected structure.</li>
            <li>Copy the schema into your validator, API docs, or project files.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common JSON Schema Generator Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Creating a first schema from an API response.</li>
            <li>Documenting request and response body structure.</li>
            <li>Preparing a schema before using a JSON Schema validator.</li>
            <li>Finding nested object and array shapes in copied JSON.</li>
            <li>Generating examples for internal notes or documentation.</li>
            <li>Starting validation rules before editing them manually.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Generated Schema
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "active": { "type": "boolean" }
  },
  "required": ["name", "active"]
}`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Generated Schemas Still Need Review
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A generated schema is based only on the sample JSON you paste. If the
            sample is incomplete, the schema may miss optional fields, alternate
            types, valid enum values, or validation limits like minimum,
            maximum, pattern, and length.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Use this tool to create a good starting schema, then adjust the
            rules based on what your real data is allowed to contain.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What does a JSON Schema Generator do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It reads sample JSON and creates a JSON Schema that describes the
                detected object structure, types, arrays, and fields.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this different from a JSON Schema Validator?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. A generator creates a schema from sample JSON. A validator
                checks JSON against an existing schema.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this handle nested JSON?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. It detects nested objects, arrays, nullable values, and
                mixed array item types where possible.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this create a perfect production schema?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. It creates a starting point. Review required fields, allowed
                values, patterns, and limits before using it for strict
                validation.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my JSON uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Schema generation happens directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/json-schema-generator" />
        </div>
      </section>
    </ToolShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>

      <div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}

function buildSchemaFromJson(
  value: unknown,
  options: {
    schemaDraft: SchemaDraft;
    outputMode: OutputMode;
    requiredMode: RequiredMode;
    arrayMode: ArrayMode;
    schemaTitle: string;
    includeExamples: boolean;
    detectFormats: boolean;
    allowAdditionalProperties: boolean;
    nullableTypes: boolean;
  }
): GeneratedResult {
  const warnings: string[] = [];
  const stats: SchemaStats = {
    objectCount: 0,
    arrayCount: 0,
    propertyCount: 0,
    maxDepth: 0,
    nullableFields: 0,
    mixedArrays: 0,
  };

  const schema = inferSchema(value, {
    ...options,
    depth: 0,
    stats,
    warnings,
  });

  const rootSchema: SchemaNode = {
    $schema: getSchemaUrl(options.schemaDraft),
    title: options.schemaTitle.trim() || "Generated Schema",
    ...schema,
  };

  const output =
    options.outputMode === "summary"
      ? formatSummary(rootSchema, stats, warnings)
      : options.outputMode === "schemaWithExample"
      ? JSON.stringify(
          {
            schema: rootSchema,
            example: value,
          },
          null,
          2
        )
      : JSON.stringify(rootSchema, null, 2);

  return {
    schema: rootSchema,
    output,
    stats,
    warnings,
  };
}

function inferSchema(
  value: unknown,
  context: {
    schemaDraft: SchemaDraft;
    requiredMode: RequiredMode;
    arrayMode: ArrayMode;
    includeExamples: boolean;
    detectFormats: boolean;
    allowAdditionalProperties: boolean;
    nullableTypes: boolean;
    depth: number;
    stats: SchemaStats;
    warnings: string[];
  }
): SchemaNode {
  context.stats.maxDepth = Math.max(context.stats.maxDepth, context.depth);

  if (value === null) {
    context.stats.nullableFields += 1;
    return {
      type: "null",
      ...(context.includeExamples ? { examples: [null] } : {}),
    };
  }

  if (Array.isArray(value)) {
    context.stats.arrayCount += 1;

    const schema: SchemaNode = {
      type: "array",
      minItems: value.length,
    };

    if (value.length === 0) {
      schema.items = {};
      context.warnings.push("An empty array was found. Item type could not be inferred.");
      return schema;
    }

    const itemValues = context.arrayMode === "firstItem" ? [value[0]] : value;
    const itemSchemas = itemValues.map((item) =>
      inferSchema(item, {
        ...context,
        depth: context.depth + 1,
      })
    );

    schema.items = mergeSchemas(itemSchemas, context);

    if (context.includeExamples) {
      schema.examples = [value.slice(0, 3)];
    }

    return schema;
  }

  if (typeof value === "object") {
    context.stats.objectCount += 1;

    const record = value as Record<string, unknown>;
    const entries = Object.entries(record);
    const properties: Record<string, SchemaNode> = {};

    entries.forEach(([key, item]) => {
      context.stats.propertyCount += 1;
      properties[key] = inferSchema(item, {
        ...context,
        depth: context.depth + 1,
      });
    });

    const required =
      context.requiredMode === "none"
        ? []
        : entries
            .filter(([, item]) =>
              context.requiredMode === "all" ? true : item !== null
            )
            .map(([key]) => key);

    return {
      type: "object",
      properties,
      ...(required.length > 0 ? { required } : {}),
      additionalProperties: context.allowAdditionalProperties,
      ...(context.includeExamples ? { examples: [record] } : {}),
    };
  }

  const primitiveType = getPrimitiveType(value);
  const schema: SchemaNode = {
    type: primitiveType,
  };

  if (typeof value === "string" && context.detectFormats) {
    const format = detectStringFormat(value);

    if (format) {
      schema.format = format;
    }
  }

  if (context.includeExamples) {
    schema.examples = [value];
  }

  return schema;
}

function mergeSchemas(
  schemas: SchemaNode[],
  context: {
    nullableTypes: boolean;
    stats: SchemaStats;
  }
): SchemaNode {
  if (schemas.length === 1) {
    return schemas[0];
  }

  const types = Array.from(
    new Set(
      schemas.flatMap((schema) =>
        Array.isArray(schema.type) ? schema.type : schema.type ? [schema.type] : []
      )
    )
  );

  if (types.length > 1) {
    context.stats.mixedArrays += 1;
  }

  if (types.includes("object")) {
    const objectSchemas = schemas.filter((schema) => schema.type === "object");
    const mergedProperties: Record<string, SchemaNode[]> = {};

    objectSchemas.forEach((schema) => {
      Object.entries(schema.properties || {}).forEach(([key, childSchema]) => {
        mergedProperties[key] = [...(mergedProperties[key] || []), childSchema];
      });
    });

    const properties: Record<string, SchemaNode> = {};

    Object.entries(mergedProperties).forEach(([key, childSchemas]) => {
      properties[key] = mergeSchemas(childSchemas, context);
    });

    return {
      type: types.length === 1 ? "object" : types,
      properties,
      additionalProperties: true,
    };
  }

  if (types.includes("array")) {
    const arraySchemas = schemas.filter((schema) => schema.type === "array");
    const itemSchemas = arraySchemas
      .map((schema) => schema.items)
      .filter((schema): schema is SchemaNode => Boolean(schema));

    return {
      type: types.length === 1 ? "array" : types,
      items: itemSchemas.length > 0 ? mergeSchemas(itemSchemas, context) : {},
    };
  }

  return {
    type:
      types.length === 1
        ? types[0]
        : context.nullableTypes
        ? types
        : types.filter((type) => type !== "null"),
  };
}

function getPrimitiveType(value: unknown) {
  if (typeof value === "string") {
    return "string";
  }

  if (typeof value === "number") {
    return Number.isInteger(value) ? "integer" : "number";
  }

  if (typeof value === "boolean") {
    return "boolean";
  }

  return "string";
}

function detectStringFormat(value: string) {
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "email";
  }

  if (/^https?:\/\/[^\s]+$/i.test(value)) {
    return "uri";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return "date";
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    return "date-time";
  }

  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    return "uuid";
  }

  return "";
}

function getSchemaUrl(draft: SchemaDraft) {
  if (draft === "draft-07") {
    return "http://json-schema.org/draft-07/schema#";
  }

  if (draft === "2019-09") {
    return "https://json-schema.org/draft/2019-09/schema";
  }

  return "https://json-schema.org/draft/2020-12/schema";
}

function formatSummary(schema: SchemaNode, stats: SchemaStats, warnings: string[]) {
  return [
    "JSON Schema Summary",
    "-------------------",
    `Root type: ${Array.isArray(schema.type) ? schema.type.join(", ") : schema.type || "unknown"}`,
    `Properties: ${stats.propertyCount}`,
    `Objects: ${stats.objectCount}`,
    `Arrays: ${stats.arrayCount}`,
    `Nullable fields: ${stats.nullableFields}`,
    `Mixed arrays: ${stats.mixedArrays}`,
    `Max depth: ${stats.maxDepth}`,
    "",
    "Warnings:",
    ...(warnings.length === 0 ? ["(none)"] : warnings.map((warning) => `- ${warning}`)),
  ].join("\n");
}

function getSchemaNotes(result: GeneratedResult): SchemaNote[] {
  const notes: SchemaNote[] = [];

  if (result.warnings.length > 0) {
    notes.push({
      title: "Review warnings",
      message: result.warnings.join(" "),
    });
  }

  if (result.stats.mixedArrays > 0) {
    notes.push({
      title: "Mixed array types found",
      message:
        "One or more arrays contain different item types. Review the generated items schema before using it for strict validation.",
    });
  }

  if (result.stats.nullableFields > 0) {
    notes.push({
      title: "Null values found",
      message:
        "Some values are null. Decide whether those fields should really allow null in your final schema.",
    });
  }

  if (result.stats.maxDepth >= 5) {
    notes.push({
      title: "Deep JSON structure",
      message:
        "The sample JSON has a deep structure. Review nested objects carefully before using the schema in production.",
    });
  }

  return notes;
}
