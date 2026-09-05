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
  examples?: unknown[];
  format?: string;
  additionalProperties?: boolean;
  title?: string;
  [key: string]: unknown;
};

type SchemaStats = {
  objectCount: number;
  arrayCount: number;
  propertyCount: number;
  maxDepth: number;
  nullableFields: number;
  mixedArrays: number;
  nodeCount: number;
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

type InferContext = {
  schemaDraft: SchemaDraft;
  requiredMode: RequiredMode;
  arrayMode: ArrayMode;
  includeExamples: boolean;
  detectFormats: boolean;
  allowAdditionalProperties: boolean;
  nullableTypes: boolean;
  depth: number;
  path: string;
  stats: SchemaStats;
  warnings: string[];
};

const MAX_INPUT_CHARS = 1_000_000;
const MAX_SCHEMA_NODES = 10_000;
const MAX_SCHEMA_DEPTH = 100;

const sampleJson = `{
  "id": 101,
  "name": "Sneha",
  "slug": "json-schema-generator",
  "published": true,
  "category": "JSON & Data Tools",
  "tags": ["json", "schema", "developer"],
  "meta": {
    "priority": 1,
    "canonical": "https://yoryantra.com/tools/json-schema-generator"
  },
  "createdAt": "2026-09-05T10:30:00Z"
}`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [schemaDraft, setSchemaDraft] = useState<SchemaDraft>("2020-12");
  const [outputMode, setOutputMode] = useState<OutputMode>("schema");
  const [requiredMode, setRequiredMode] = useState<RequiredMode>("none");
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

  const clearResult = () => {
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const generateSchema = () => {
    if (!input.trim()) {
      setError("Paste sample JSON before generating a schema.");
      setResult(null);
      setOutput("");
      setCopied(false);
      return;
    }

    if (input.length > MAX_INPUT_CHARS) {
      setError(
        `Input is too large for interactive inference. Keep it under ${MAX_INPUT_CHARS.toLocaleString()} characters.`
      );
      setResult(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      assertLosslessJsonText(input);
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
        err instanceof Error ? err.message : "The schema could not be inferred safely."
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

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setError("");

      window.setTimeout(() => {
        setCopied(false);
      }, 1400);
    } catch {
      setCopied(false);
      setError(
        "The browser blocked clipboard access. Select the generated output and copy it manually."
      );
    }
  };

  const loadExample = () => {
    setInput(sampleJson);
    setSchemaDraft("2020-12");
    setOutputMode("schema");
    setRequiredMode("none");
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
    setRequiredMode("none");
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
      description="Infer a draft-aware JSON Schema from sample data while keeping validation assumptions visible."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Sample JSON
        </label>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            clearResult();
          }}
          placeholder={sampleJson}
          spellCheck={false}
          className="min-h-[390px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Objects, arrays, scalars, and null are accepted. Duplicate member names
          and precision-changing numbers are stopped before JavaScript parsing can
          alter them.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          How the sample should be interpreted
        </h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Schema draft"
            value={schemaDraft}
            onChange={(value) => {
              setSchemaDraft(value as SchemaDraft);
              clearResult();
            }}
            options={[
              { label: "2020-12", value: "2020-12" },
              { label: "2019-09", value: "2019-09" },
              { label: "Draft 07", value: "draft-07" },
            ]}
          />

          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value) => {
              setOutputMode(value as OutputMode);
              clearResult();
            }}
            options={[
              { label: "Schema only", value: "schema" },
              { label: "Schema with source example", value: "schemaWithExample" },
              { label: "Inference summary", value: "summary" },
            ]}
          />

          <YoryantraSelect
            label="Required properties"
            value={requiredMode}
            onChange={(value) => {
              setRequiredMode(value as RequiredMode);
              clearResult();
            }}
            options={[
              { label: "Do not infer required", value: "none" },
              { label: "Require every observed key", value: "all" },
              { label: "Require observed non-null keys", value: "nonNull" },
            ]}
          />

          <YoryantraSelect
            label="Array samples"
            value={arrayMode}
            onChange={(value) => {
              setArrayMode(value as ArrayMode);
              clearResult();
            }}
            options={[
              { label: "Merge all observed items", value: "merged" },
              { label: "Infer from first item only", value: "firstItem" },
            ]}
          />

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Schema title
            </label>
            <input
              value={schemaTitle}
              onChange={(event) => {
                setSchemaTitle(event.target.value);
                clearResult();
              }}
              placeholder="Generated Schema"
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
          </div>
        </div>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <label className="self-start flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={includeExamples}
              onChange={(event) => {
                setIncludeExamples(event.target.checked);
                clearResult();
              }}
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]"
            />
            <span>
              <span className="block text-sm font-medium text-gray-900">
                Add observed examples
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Attach leaf examples and one root example without duplicating whole subtrees.
              </span>
            </span>
          </label>

          <label className="self-start flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={detectFormats}
              onChange={(event) => {
                setDetectFormats(event.target.checked);
                clearResult();
              }}
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]"
            />
            <span>
              <span className="block text-sm font-medium text-gray-900">
                Suggest familiar string formats
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Recognize conservative email, URI, date, date-time, and UUID shapes.
              </span>
            </span>
          </label>

          <label className="self-start flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={nullableTypes}
              onChange={(event) => {
                setNullableTypes(event.target.checked);
                clearResult();
              }}
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]"
            />
            <span>
              <span className="block text-sm font-medium text-gray-900">
                Preserve null in mixed samples
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Keep null alongside another observed type when array samples contain both.
              </span>
            </span>
          </label>

          <label className="self-start flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={allowAdditionalProperties}
              onChange={(event) => {
                setAllowAdditionalProperties(event.target.checked);
                clearResult();
              }}
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]"
            />
            <span>
              <span className="block text-sm font-medium text-gray-900">
                Allow unobserved object properties
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Leave objects open instead of rejecting names absent from the sample.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={generateSchema}
          className="yoryantra-btn min-h-10 whitespace-nowrap"
        >
          Generate Schema
        </button>

        <button
          onClick={copyOutput}
          className="yoryantra-btn min-h-10 whitespace-nowrap"
          disabled={!output}
        >
          {copied ? "Copied" : "Copy Output"}
        </button>

        <button
          onClick={loadExample}
          className="yoryantra-btn-outline min-h-10 whitespace-nowrap"
        >
          Load Example
        </button>

        <button
          onClick={resetAll}
          className="yoryantra-btn-outline min-h-10 whitespace-nowrap"
        >
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Properties" value={String(result.stats.propertyCount)} />
          <SummaryCard label="Objects" value={String(result.stats.objectCount)} />
          <SummaryCard label="Arrays" value={String(result.stats.arrayCount)} />
          <SummaryCard label="Max depth" value={String(result.stats.maxDepth)} />
        </div>
      )}

      {result && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Schema preview</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            The preview always shows the schema itself, even when the selected copy output is a summary or a schema-plus-example wrapper.
          </p>
          <pre className="mt-4 max-h-[520px] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-gray-200 bg-gray-50 p-4 font-mono text-sm text-gray-800">
            {JSON.stringify(result.schema, null, 2)}
          </pre>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Assumptions worth checking
          </h3>
          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={`${note.title}-${note.message}`}>
                <p className="text-sm font-semibold text-amber-900">{note.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-amber-800">{note.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Selected output</h3>
          {output && (
            <button
              onClick={copyOutput}
              className="yoryantra-btn-outline min-h-10 whitespace-nowrap text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
        <pre className="yoryantra-output min-h-[340px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "Generated schema output will appear here."}
        </pre>
      </div>

      <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
        <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
          Inference runs in this browser component. Pasted JSON stays in the page
          and browser memory unless you copy or otherwise share it yourself.
        </div>
        <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
          One sample can reveal observed shape, not business intent. Required
          fields, allowed ranges, patterns, uniqueness, and closed vocabularies
          still need human decisions.
        </div>
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            A sample can show structure, but it cannot prove the contract
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            If a sample contains an integer at $.id, a string at $.name, and an
            array at $.tags, those observations are reasonable starting types.
            The same sample cannot tell you whether id must be positive, name has
            a maximum length, tags must be unique, or a missing property is
            invalid. Generated schema therefore works best as an explicit draft
            for human refinement rather than an automatic declaration of policy.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Required means presence, not non-nullness
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            In JSON Schema, required lists property names that must be present in
            an object. A required property can still accept null when its own
            schema allows null. Because one object cannot prove which keys are
            mandatory in every valid instance, the default here does not infer
            required properties. The two stricter modes are deliberate heuristics
            you can opt into when the sample is known to represent a complete
            record.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Arrays become more trustworthy when more than one item is observed
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Merge-all mode combines the types and object properties seen across
            every sampled element. When object items differ, a property is marked
            required only if the selected required policy marks it required in
            every observed object. First-item mode is faster for repetitive data
            but ignores later evidence and is flagged whenever more items were
            available.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The generator intentionally does not infer minItems from the sample
            length. Seeing three elements once does not mean every valid array
            needs at least three elements.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Format detection is a hint, not proof
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Strings that conservatively resemble an email address, URI, calendar
            date, RFC 3339-style date-time, or UUID can receive a format keyword.
            A string that happens to look like a date may actually be an opaque
            identifier, so format suggestions should be removed when the domain
            meaning does not match the observed shape.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Draft 2020-12 separates format annotation from format assertion, and
            validator behavior can depend on the implementation and vocabulary
            configuration. The current JSON Schema specification is published at{" "}
            <a
              href="https://json-schema.org/specification"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-2"
            >
              json-schema.org
            </a>
            .
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            additionalProperties controls how closed an object becomes
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Leaving additional properties allowed means names absent from the
            sample can still validate. Turning the option off sets
            additionalProperties to false on inferred object schemas, which is a
            much stronger contract. That can be correct for tightly controlled
            payloads, but it can also reject legitimate future fields when the
            sample was incomplete.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Draft choice changes the dialect, not the observed data
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The selected $schema URI identifies Draft 2020-12, 2019-09, or Draft
            7. The generated subset here uses keywords that are valid across those
            choices, while avoiding draft-specific tuple syntax and other features
            that cannot be inferred reliably from one example. Draft 2020-12 is
            the current published JSON Schema version. Its array vocabulary also
            distinguishes prefixItems from items for tuple-style schemas, a
            distinction this sample-driven generator does not guess.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            JSON parsing itself has two subtle loss points
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Duplicate object member names can be collapsed differently by JSON
            implementations, and JavaScript numbers cannot exactly represent every
            JSON numeric literal. Before inference, the input is checked for
            duplicate names, negative zero, non-finite conversion, unsafe
            integers, and unusually precise decimal literals that would be
            rounded. RFC 8259 discusses duplicate-name interoperability and the
            practical limits around numeric precision: {" "}
            <a
              href="https://www.rfc-editor.org/rfc/rfc8259.html"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-2"
            >
              RFC 8259
            </a>
            .
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            What still needs to be authored after inference
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Production schemas often need minimum and maximum values, string
            lengths, patterns, enums, const values, conditional rules,
            dependentRequired, unevaluatedProperties, references, reusable
            definitions, array cardinality, uniqueness, and domain-specific
            descriptions. None of those should be invented from a single payload
            merely to make the generated schema look more complete.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/json-schema-generator" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">{value}</div>
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
    nodeCount: 0,
  };

  const inferred = inferSchema(value, {
    ...options,
    depth: 0,
    path: "$",
    stats,
    warnings,
  });

  const rootSchema: SchemaNode = {
    $schema: getSchemaUrl(options.schemaDraft),
    title: options.schemaTitle.trim() || "Generated Schema",
    ...inferred,
  };

  if (options.includeExamples) {
    rootSchema.examples = [value];
  }

  const output =
    options.outputMode === "summary"
      ? formatSummary(rootSchema, stats, warnings)
      : options.outputMode === "schemaWithExample"
      ? JSON.stringify({ schema: rootSchema, example: value }, null, 2)
      : JSON.stringify(rootSchema, null, 2);

  return {
    schema: rootSchema,
    output,
    stats,
    warnings: uniqueStrings(warnings),
  };
}

function inferSchema(value: unknown, context: InferContext): SchemaNode {
  if (context.depth > MAX_SCHEMA_DEPTH) {
    throw new Error(
      `The sample exceeds the supported nesting depth of ${MAX_SCHEMA_DEPTH}. Simplify or split the document before inference.`
    );
  }

  context.stats.nodeCount += 1;

  if (context.stats.nodeCount > MAX_SCHEMA_NODES) {
    throw new Error(
      `The sample would create more than ${MAX_SCHEMA_NODES.toLocaleString()} schema nodes. Split the data into smaller examples.`
    );
  }

  context.stats.maxDepth = Math.max(context.stats.maxDepth, context.depth);

  if (value === null) {
    context.stats.nullableFields += 1;
    return { type: "null" };
  }

  if (Array.isArray(value)) {
    context.stats.arrayCount += 1;
    const schema: SchemaNode = { type: "array" };

    if (value.length === 0) {
      schema.items = {};
      context.warnings.push(
        `${context.path} is empty, so an item type cannot be inferred.`
      );
      return schema;
    }

    if (context.arrayMode === "firstItem" && value.length > 1) {
      context.warnings.push(
        `${context.path} has ${value.length} items, but only the first item was used for inference.`
      );
    }

    const itemValues = context.arrayMode === "firstItem" ? [value[0]] : value;
    const itemSchemas = itemValues.map((item, index) =>
      inferSchema(item, {
        ...context,
        depth: context.depth + 1,
        path: `${context.path}[${index}]`,
      })
    );

    schema.items = mergeSchemas(itemSchemas, context);

    if (
      context.includeExamples &&
      value.length <= 3 &&
      value.every((item) => item === null || typeof item !== "object")
    ) {
      schema.examples = [value];
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
        path: toJsonPath(context.path, key),
      });
    });

    const required = getRequiredKeys(entries, context.requiredMode);

    return {
      type: "object",
      properties,
      ...(required.length > 0 ? { required } : {}),
      additionalProperties: context.allowAdditionalProperties,
    };
  }

  const schema: SchemaNode = {
    type: getPrimitiveType(value),
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

function mergeSchemas(schemas: SchemaNode[], context: InferContext): SchemaNode {
  if (schemas.length === 0) {
    return {};
  }

  if (schemas.length === 1) {
    return schemas[0];
  }

  const rawTypes = uniqueStrings(
    schemas.reduce<string[]>((all, schema) => {
      if (Array.isArray(schema.type)) {
        return all.concat(schema.type);
      }
      return schema.type ? all.concat(schema.type) : all;
    }, [])
  );

  if (rawTypes.length > 1) {
    context.stats.mixedArrays += 1;
  }

  const types = applyNullPolicy(rawTypes, context.nullableTypes);

  if (!context.nullableTypes && rawTypes.includes("null") && rawTypes.length > 1) {
    context.warnings.push(
      "At least one mixed sample contained null, but the Preserve null option is off, so null was omitted from that union."
    );
  }

  const merged: SchemaNode = {
    type: collapseTypes(types),
  };

  if (rawTypes.includes("object")) {
    const objectSchemas = schemas.filter((schema) => hasSchemaType(schema, "object"));
    const mergedProperties: Record<string, SchemaNode[]> = {};

    objectSchemas.forEach((schema) => {
      Object.entries(schema.properties || {}).forEach(([key, childSchema]) => {
        if (!mergedProperties[key]) {
          mergedProperties[key] = [];
        }
        mergedProperties[key].push(childSchema);
      });
    });

    const properties: Record<string, SchemaNode> = {};
    Object.entries(mergedProperties).forEach(([key, childSchemas]) => {
      properties[key] = mergeSchemas(childSchemas, context);
    });

    const required = intersectRequiredKeys(objectSchemas);
    merged.properties = properties;
    merged.additionalProperties = context.allowAdditionalProperties;

    if (required.length > 0) {
      merged.required = required;
    }
  }

  if (rawTypes.includes("array")) {
    const arraySchemas = schemas.filter((schema) => hasSchemaType(schema, "array"));
    const itemSchemas = arraySchemas
      .map((schema) => schema.items)
      .filter((schema): schema is SchemaNode => Boolean(schema));

    merged.items = itemSchemas.length > 0 ? mergeSchemas(itemSchemas, context) : {};
  }

  return merged;
}

function getRequiredKeys(
  entries: Array<[string, unknown]>,
  mode: RequiredMode
) {
  if (mode === "none") {
    return [];
  }

  return entries
    .filter(([, value]) => (mode === "all" ? true : value !== null))
    .map(([key]) => key);
}

function intersectRequiredKeys(schemas: SchemaNode[]) {
  if (schemas.length === 0) {
    return [];
  }

  const first = schemas[0].required || [];

  return first.filter((key) =>
    schemas.every((schema) => (schema.required || []).includes(key))
  );
}

function hasSchemaType(schema: SchemaNode, type: string) {
  return Array.isArray(schema.type)
    ? schema.type.includes(type)
    : schema.type === type;
}

function applyNullPolicy(types: string[], nullableTypes: boolean) {
  if (nullableTypes || !types.includes("null") || types.length === 1) {
    return types;
  }

  return types.filter((type) => type !== "null");
}

function collapseTypes(types: string[]): string | string[] | undefined {
  if (types.length === 0) {
    return undefined;
  }
  return types.length === 1 ? types[0] : types;
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
  if (isValidDateTime(value)) {
    return "date-time";
  }

  if (isValidDateOnly(value)) {
    return "date";
  }

  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    return "uuid";
  }

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "email";
  }

  if (/^[A-Za-z][A-Za-z0-9+.-]*:/.test(value)) {
    try {
      new URL(value);
      return "uri";
    } catch {
      return "";
    }
  }

  return "";
}

function isValidDateOnly(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isValidDateTime(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) {
    return false;
  }

  const datePart = value.slice(0, 10);
  return isValidDateOnly(datePart) && !Number.isNaN(Date.parse(value));
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
    "JSON Schema inference summary",
    "-----------------------------",
    `Root type: ${Array.isArray(schema.type) ? schema.type.join(", ") : schema.type || "unknown"}`,
    `Properties observed: ${stats.propertyCount}`,
    `Objects observed: ${stats.objectCount}`,
    `Arrays observed: ${stats.arrayCount}`,
    `Null values observed: ${stats.nullableFields}`,
    `Mixed array unions: ${stats.mixedArrays}`,
    `Maximum depth: ${stats.maxDepth}`,
    `Schema nodes: ${stats.nodeCount}`,
    "",
    "Cautions:",
    ...(warnings.length === 0 ? ["(none from structural inference)"] : uniqueStrings(warnings).map((warning) => `- ${warning}`)),
  ].join("\n");
}

function getSchemaNotes(result: GeneratedResult): SchemaNote[] {
  const notes: SchemaNote[] = [];

  result.warnings.forEach((warning) => {
    notes.push({ title: "Sample limitation", message: warning });
  });

  if (result.stats.mixedArrays > 0) {
    notes.push({
      title: "Multiple item types were observed",
      message:
        "The generated item schema contains a type union or merged structure. Confirm that the variation is intentional rather than inconsistent sample data.",
    });
  }

  if (result.stats.nullableFields > 0) {
    notes.push({
      title: "Null appeared in the sample",
      message:
        "Null in one payload does not by itself establish when null is permitted. Check the surrounding contract before keeping or removing it.",
    });
  }

  if (result.stats.maxDepth >= 8) {
    notes.push({
      title: "Deep nesting",
      message:
        "Deeply nested generated schemas are harder to maintain. Reusable $defs and $ref sections may be clearer when the same structures repeat.",
    });
  }

  return dedupeNotes(notes);
}

function assertLosslessJsonText(text: string) {
  try {
    JSON.parse(text);
  } catch {
    throw new Error("The sample is not valid JSON.");
  }

  const stack: Array<{ type: "object" | "array"; keys?: Set<string> }> = [];
  let index = 0;

  while (index < text.length) {
    const char = text[index];

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    if (char === "{") {
      stack.push({ type: "object", keys: new Set<string>() });
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
      const tokenEnd = findJsonStringEnd(text, index);
      const token = text.slice(index, tokenEnd + 1);
      let next = tokenEnd + 1;

      while (next < text.length && /\s/.test(text[next])) {
        next += 1;
      }

      const frame = stack[stack.length - 1];

      if (frame?.type === "object" && text[next] === ":") {
        const key = JSON.parse(token) as string;
        if (frame.keys?.has(key)) {
          throw new Error(
            `Duplicate JSON member name ${JSON.stringify(key)} would be collapsed before schema inference.`
          );
        }
        frame.keys?.add(key);
      }

      index = tokenEnd + 1;
      continue;
    }

    if (char === "-" || /\d/.test(char)) {
      const numberMatch = text.slice(index).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);

      if (numberMatch) {
        const token = numberMatch[0];
        const numericValue = Number(token);

        if (!isSafeNumberToken(token, numericValue)) {
          throw new Error(
            `JSON number ${token} cannot be represented safely by JavaScript during schema inference. Put high-precision numeric identifiers or decimals in JSON strings.`
          );
        }

        index += token.length;
        continue;
      }
    }

    index += 1;
  }
}

function findJsonStringEnd(text: string, start: number) {
  let escaped = false;

  for (let index = start + 1; index < text.length; index += 1) {
    const char = text[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === '"') {
      return index;
    }
  }

  return text.length - 1;
}

function isSafeNumberToken(token: string, numericValue: number) {
  if (!Number.isFinite(numericValue) || Object.is(numericValue, -0)) {
    return false;
  }

  if (/^-?(?:0|[1-9]\d*)$/.test(token)) {
    return Number.isSafeInteger(numericValue);
  }

  const significantDigits = token
    .replace(/^[+-]/, "")
    .split(/[eE]/)[0]
    .replace(".", "")
    .replace(/^0+/, "").length;

  if (significantDigits > 15) {
    return false;
  }

  if (numericValue === 0 && /[1-9]/.test(token)) {
    return false;
  }

  return true;
}

function toJsonPath(parentPath: string, key: string) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)
    ? `${parentPath}.${key}`
    : `${parentPath}[${JSON.stringify(key)}]`;
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values));
}

function dedupeNotes(notes: SchemaNote[]) {
  const seen = new Set<string>();
  return notes.filter((note) => {
    const key = `${note.title}\n${note.message}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
