"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputStyle = "interface" | "type";
type PropertyStyle = "preserve" | "camel";
type ArrayStyle = "array" | "generic";
type AdditionalMode = "record" | "ignore";

type SchemaNode = {
  type?: string | string[];
  title?: string;
  description?: string;
  properties?: Record<string, SchemaNode>;
  required?: string[];
  items?: SchemaNode | SchemaNode[];
  enum?: unknown[];
  const?: unknown;
  anyOf?: SchemaNode[];
  oneOf?: SchemaNode[];
  allOf?: SchemaNode[];
  format?: string;
  additionalProperties?: boolean | SchemaNode;
  $ref?: string;
  $defs?: Record<string, SchemaNode>;
  definitions?: Record<string, SchemaNode>;
  [key: string]: unknown;
};

type ConvertResult = {
  output: string;
  typeCount: number;
  interfaceCount: number;
  enumCount: number;
  warnings: string[];
};

type ConverterNote = {
  title: string;
  message: string;
};

const sampleSchema = `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "YoryantraTool",
  "type": "object",
  "description": "A tool entry used on the Yoryantra website.",
  "required": ["title", "href", "category"],
  "properties": {
    "title": {
      "type": "string",
      "description": "Tool display name"
    },
    "description": {
      "type": "string"
    },
    "href": {
      "type": "string",
      "format": "uri"
    },
    "category": {
      "type": "string",
      "enum": ["Developer Tools", "JSON & Data Tools", "SEO Tools"]
    },
    "published": {
      "type": ["boolean", "null"]
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "meta": {
      "type": "object",
      "properties": {
        "priority": {
          "type": "integer"
        },
        "featured": {
          "type": "boolean"
        }
      }
    }
  }
}`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [rootName, setRootName] = useState("GeneratedType");
  const [outputStyle, setOutputStyle] = useState<OutputStyle>("interface");
  const [propertyStyle, setPropertyStyle] = useState<PropertyStyle>("preserve");
  const [arrayStyle, setArrayStyle] = useState<ArrayStyle>("array");
  const [additionalMode, setAdditionalMode] = useState<AdditionalMode>("record");
  const [includeComments, setIncludeComments] = useState(true);
  const [exportTypes, setExportTypes] = useState(true);
  const [preferUnknown, setPreferUnknown] = useState(true);
  const [optionalWhenRequiredMissing, setOptionalWhenRequiredMissing] = useState(true);
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getConverterNotes(result) : []), [result]);

  const convertSchema = () => {
    if (!input.trim()) {
      setError("Please paste a JSON Schema to convert.");
      setResult(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const schema = JSON.parse(input) as SchemaNode;
      const nextResult = convertJsonSchemaToTypeScript(schema, {
        rootName,
        outputStyle,
        propertyStyle,
        arrayStyle,
        additionalMode,
        includeComments,
        exportTypes,
        preferUnknown,
        optionalWhenRequiredMissing,
      });

      setResult(nextResult);
      setOutput(nextResult.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof SyntaxError
          ? "The JSON Schema is not valid JSON. Please fix it and try again."
          : err instanceof Error
          ? err.message
          : "Unable to convert this JSON Schema."
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
    setInput(sampleSchema);
    setRootName("YoryantraTool");
    setOutputStyle("interface");
    setPropertyStyle("preserve");
    setArrayStyle("array");
    setAdditionalMode("record");
    setIncludeComments(true);
    setExportTypes(true);
    setPreferUnknown(true);
    setOptionalWhenRequiredMissing(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setRootName("GeneratedType");
    setOutputStyle("interface");
    setPropertyStyle("preserve");
    setArrayStyle("array");
    setAdditionalMode("record");
    setIncludeComments(true);
    setExportTypes(true);
    setPreferUnknown(true);
    setOptionalWhenRequiredMissing(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="JSON Schema to TypeScript Converter"
      description="Convert JSON Schema to TypeScript interfaces and types. Supports objects, arrays, enums, required fields, nullable values, nested schemas, and comments directly in your browser."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          JSON Schema
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
          placeholder={sampleSchema}
          className="w-full min-h-[420px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste a JSON Schema object. The TypeScript output is generated locally
          in your browser.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Options
        </h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Root Type Name
            </label>

            <input
              value={rootName}
              onChange={(event) => {
                setRootName(event.target.value);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              placeholder="GeneratedType"
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
          </div>

          <YoryantraSelect
            label="Output Style"
            value={outputStyle}
            onChange={(value) => {
              setOutputStyle(value as OutputStyle);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Interface", value: "interface" },
              { label: "Type alias", value: "type" },
            ]}
          />

          <YoryantraSelect
            label="Property Names"
            value={propertyStyle}
            onChange={(value) => {
              setPropertyStyle(value as PropertyStyle);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Preserve", value: "preserve" },
              { label: "Camel case", value: "camel" },
            ]}
          />

          <YoryantraSelect
            label="Array Style"
            value={arrayStyle}
            onChange={(value) => {
              setArrayStyle(value as ArrayStyle);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Type[]", value: "array" },
              { label: "Array<Type>", value: "generic" },
            ]}
          />

          <YoryantraSelect
            label="Extra Object Keys"
            value={additionalMode}
            onChange={(value) => {
              setAdditionalMode(value as AdditionalMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Add Record field", value: "record" },
              { label: "Ignore", value: "ignore" },
            ]}
          />

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={includeComments}
              onChange={(event) => {
                setIncludeComments(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Include comments from descriptions
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={exportTypes}
              onChange={(event) => {
                setExportTypes(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Export generated types
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={preferUnknown}
              onChange={(event) => {
                setPreferUnknown(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Use unknown instead of any
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={optionalWhenRequiredMissing}
              onChange={(event) => {
                setOptionalWhenRequiredMissing(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Treat fields as optional when required is missing
          </label>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          This converter creates practical TypeScript from common JSON Schema
          patterns. Review complex schemas with refs or advanced composition.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={convertSchema} className="yoryantra-btn">
          Convert to TypeScript
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
          <SummaryCard label="Types" value={result.typeCount.toLocaleString()} />
          <SummaryCard label="Interfaces" value={result.interfaceCount.toLocaleString()} />
          <SummaryCard label="Enums" value={result.enumCount.toLocaleString()} />
          <SummaryCard label="Warnings" value={result.warnings.length.toLocaleString()} />
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            TypeScript notes
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
            TypeScript Output
          </h3>

          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[380px] whitespace-pre-wrap break-words">
          {output || "Generated TypeScript will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        JSON Schema to TypeScript conversion happens directly in your browser.
        Your schema is not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Converting JSON Schema Into TypeScript Types
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON Schema describes the shape of JSON data. TypeScript types help
            you work with that same data safely inside your code. When an API or
            config file already has a schema, converting it into TypeScript can
            save time and reduce mistakes.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This JSON Schema to TypeScript Converter turns common schema patterns
            into readable TypeScript interfaces or type aliases. It handles
            objects, arrays, enums, required fields, nullable values, nested
            schemas, comments, and additional properties.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Creating TypeScript From a Schema
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste your JSON Schema into the input box.</li>
            <li>Choose interface or type alias output.</li>
            <li>Pick property, array, export, and comment options.</li>
            <li>Convert the schema and review any warnings.</li>
            <li>Copy the generated TypeScript into your project.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common JSON Schema to TypeScript Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Generating interfaces from API request or response schemas.</li>
            <li>Creating config file types from JSON Schema.</li>
            <li>Turning generated schemas into developer-friendly types.</li>
            <li>Documenting schema fields with TypeScript comments.</li>
            <li>Creating starter types before editing them manually.</li>
            <li>Keeping API contracts and TypeScript code easier to compare.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example TypeScript Output
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`export interface User {
  id: number;
  name: string;
  email?: string;
  tags: string[];
}`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Review Advanced Schemas Manually
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON Schema can express many validation rules that do not map
            perfectly to TypeScript. Things like pattern, minimum, maximum,
            conditional schemas, dependent schemas, and complex refs may need
            manual review.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Use this converter as a practical starting point. For strict
            production contracts, review the output and adjust the types for how
            your real application uses the data.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What does a JSON Schema to TypeScript converter do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It reads JSON Schema and creates TypeScript interfaces or type
                aliases that match the schema structure.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this different from JSON to TypeScript?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. JSON to TypeScript uses sample JSON. JSON Schema to
                TypeScript uses an existing schema with types, required fields,
                enums, and validation hints.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this support required fields?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Fields listed in required are generated as required
                TypeScript properties. Other fields are optional.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this fully support refs?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It handles simple local definition names, but complex references
                and advanced schema composition should be reviewed manually.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my schema uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Conversion happens directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/json-schema-generator" className="yoryantra-btn-outline">
              JSON Schema Generator
            </Link>

            <Link href="/tools/json-schema-validator" className="yoryantra-btn-outline">
              JSON Schema Validator
            </Link>

            <Link href="/tools/json-to-typescript-converter" className="yoryantra-btn-outline">
              JSON to TypeScript Converter
            </Link>

            <Link href="/tools/json-validator" className="yoryantra-btn-outline">
              JSON Validator
            </Link>

            <Link href="/tools/json-formatter" className="yoryantra-btn-outline">
              JSON Formatter
            </Link>
          </div>
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

type ConvertOptions = {
  rootName: string;
  outputStyle: OutputStyle;
  propertyStyle: PropertyStyle;
  arrayStyle: ArrayStyle;
  additionalMode: AdditionalMode;
  includeComments: boolean;
  exportTypes: boolean;
  preferUnknown: boolean;
  optionalWhenRequiredMissing: boolean;
};

type ConvertContext = ConvertOptions & {
  declarations: string[];
  usedNames: Set<string>;
  warnings: string[];
  counters: {
    typeCount: number;
    interfaceCount: number;
    enumCount: number;
  };
};

function convertJsonSchemaToTypeScript(schema: SchemaNode, options: ConvertOptions): ConvertResult {
  const context: ConvertContext = {
    ...options,
    declarations: [],
    usedNames: new Set<string>(),
    warnings: [],
    counters: {
      typeCount: 0,
      interfaceCount: 0,
      enumCount: 0,
    },
  };
  const rootTypeName = cleanTypeName(schema.title || options.rootName || "GeneratedType");
  const rootType = schemaToTs(schema, rootTypeName, context, 0);
  const prefix = options.exportTypes ? "export " : "";

  if (isObjectBody(rootType) && options.outputStyle === "interface") {
    context.declarations.unshift(`${prefix}interface ${rootTypeName} ${rootType}`);
    context.counters.interfaceCount += 1;
  } else if (!context.declarations.some((item) => item.includes(` ${rootTypeName} `))) {
    context.declarations.unshift(`${prefix}type ${rootTypeName} = ${rootType};`);
    context.counters.typeCount += 1;
  }

  return {
    output: context.declarations.join("\n\n"),
    typeCount: context.counters.typeCount,
    interfaceCount: context.counters.interfaceCount,
    enumCount: context.counters.enumCount,
    warnings: context.warnings,
  };
}

function schemaToTs(schema: SchemaNode, nameHint: string, context: ConvertContext, depth: number): string {
  if (schema.$ref) {
    return refToTypeName(schema.$ref, context);
  }

  if (schema.const !== undefined) {
    return literalType(schema.const);
  }

  if (schema.enum) {
    context.counters.enumCount += 1;
    return schema.enum.map(literalType).join(" | ") || fallbackType(context);
  }

  if (schema.anyOf || schema.oneOf) {
    const list = schema.anyOf || schema.oneOf || [];
    return list.map((item, index) => schemaToTs(item, `${nameHint}${index + 1}`, context, depth + 1)).join(" | ");
  }

  if (schema.allOf) {
    return schema.allOf.map((item, index) => schemaToTs(item, `${nameHint}${index + 1}`, context, depth + 1)).join(" & ");
  }

  const schemaType = schema.type || (schema.properties ? "object" : schema.items ? "array" : "unknown");

  if (Array.isArray(schemaType)) {
    return schemaType.map((item) => typeToTs(item, schema, nameHint, context, depth)).join(" | ");
  }

  return typeToTs(schemaType, schema, nameHint, context, depth);
}

function typeToTs(type: string, schema: SchemaNode, nameHint: string, context: ConvertContext, depth: number): string {
  if (type === "object") {
    return objectToTs(schema, nameHint, context, depth);
  }

  if (type === "array") {
    const itemSchema = Array.isArray(schema.items) ? schema.items[0] : schema.items;
    const itemType = itemSchema ? schemaToTs(itemSchema, `${nameHint}Item`, context, depth + 1) : fallbackType(context);
    return context.arrayStyle === "generic" ? `Array<${itemType}>` : `${wrapArrayItem(itemType)}[]`;
  }

  if (type === "integer" || type === "number") {
    return "number";
  }

  if (type === "string") {
    return "string";
  }

  if (type === "boolean") {
    return "boolean";
  }

  if (type === "null") {
    return "null";
  }

  return fallbackType(context);
}

function objectToTs(schema: SchemaNode, nameHint: string, context: ConvertContext, depth: number): string {
  const properties = schema.properties || {};
  const required = new Set(schema.required || []);
  const lines: string[] = ["{"];

  Object.entries(properties).forEach(([rawKey, childSchema]) => {
    const key = context.propertyStyle === "camel" ? toCamelCase(rawKey) : rawKey;
    const safeKey = formatPropertyName(key);
    const optional = shouldOptional(rawKey, required, schema, context) ? "?" : "";
    const childName = cleanTypeName(`${nameHint}${capitalize(key)}`);
    const childType = schemaToTs(childSchema, childName, context, depth + 1);
    const comment = context.includeComments && childSchema.description
      ? `  /** ${String(childSchema.description).replace(/\*\//g, "* /")} */\n`
      : "";

    lines.push(`${comment}  ${safeKey}${optional}: ${childType};`);
  });

  if (schema.additionalProperties && context.additionalMode === "record") {
    const additionalType = typeof schema.additionalProperties === "object"
      ? schemaToTs(schema.additionalProperties as SchemaNode, `${nameHint}Value`, context, depth + 1)
      : fallbackType(context);
    lines.push(`  [key: string]: ${additionalType};`);
  }

  if (Object.keys(properties).length === 0 && !schema.additionalProperties) {
    lines.push(`  [key: string]: ${fallbackType(context)};`);
    context.warnings.push(`Object ${nameHint} has no properties. A fallback index signature was added.`);
  }

  lines.push("}");
  const body = lines.join("\n");

  if (depth === 0) {
    return body;
  }

  const typeName = uniqueName(cleanTypeName(nameHint), context.usedNames);
  const prefix = context.exportTypes ? "export " : "";

  if (context.outputStyle === "interface") {
    context.declarations.push(`${prefix}interface ${typeName} ${body}`);
    context.counters.interfaceCount += 1;
  } else {
    context.declarations.push(`${prefix}type ${typeName} = ${body};`);
    context.counters.typeCount += 1;
  }

  return typeName;
}

function shouldOptional(key: string, required: Set<string>, schema: SchemaNode, context: ConvertContext) {
  if (!schema.required && context.optionalWhenRequiredMissing) {
    return true;
  }

  return !required.has(key);
}

function refToTypeName(ref: string, context: ConvertContext) {
  const name = ref.split("/").filter(Boolean).pop();

  if (!name) {
    context.warnings.push(`Could not read reference ${ref}.`);
    return fallbackType(context);
  }

  context.warnings.push(`Reference ${ref} was converted to ${cleanTypeName(name)}. Check it manually.`);
  return cleanTypeName(name);
}

function literalType(value: unknown) {
  if (typeof value === "string") {
    return JSON.stringify(value);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (value === null) {
    return "null";
  }

  return "unknown";
}

function fallbackType(context: { preferUnknown: boolean }) {
  return context.preferUnknown ? "unknown" : "any";
}

function cleanTypeName(value: string) {
  const cleaned = value
    .replace(/[^A-Za-z0-9_]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map(capitalize)
    .join("");

  const fallback = cleaned || "GeneratedType";

  return /^[A-Za-z_]/.test(fallback) ? fallback : `Type${fallback}`;
}

function uniqueName(name: string, usedNames: Set<string>) {
  if (!usedNames.has(name)) {
    usedNames.add(name);
    return name;
  }

  let index = 2;

  while (usedNames.has(`${name}${index}`)) {
    index += 1;
  }

  const next = `${name}${index}`;
  usedNames.add(next);
  return next;
}

function toCamelCase(value: string) {
  return value
    .replace(/[-_\s]+(.)?/g, (_match, char: string) => (char ? char.toUpperCase() : ""))
    .replace(/^(.)/, (char) => char.toLowerCase());
}

function capitalize(value: string) {
  return value ? value[0].toUpperCase() + value.slice(1) : value;
}

function formatPropertyName(value: string) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value) ? value : JSON.stringify(value);
}

function wrapArrayItem(value: string) {
  return value.includes(" | ") || value.includes(" & ") ? `(${value})` : value;
}

function isObjectBody(value: string) {
  return value.trim().startsWith("{");
}

function getConverterNotes(result: ConvertResult): ConverterNote[] {
  const notes: ConverterNote[] = [];

  if (result.warnings.length > 0) {
    notes.push({
      title: "Review warnings",
      message: result.warnings.join(" "),
    });
  }

  if (result.output.includes("unknown") || result.output.includes("any")) {
    notes.push({
      title: "Fallback types found",
      message:
        "The output includes fallback types. Review those fields and tighten them if you know the real value shape.",
    });
  }

  if (result.output.includes("[key: string]")) {
    notes.push({
      title: "Index signature added",
      message:
        "At least one object allows extra keys. Check whether this matches the schema rules you want.",
    });
  }

  return notes;
}
