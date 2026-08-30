"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputStyle = "interface" | "type";
type PropertyStyle = "preserve" | "camel";
type ArrayStyle = "array" | "generic";
type AdditionalMode = "record" | "ignore";

type SchemaValue = SchemaNode | boolean;

type SchemaNode = {
  type?: string | string[];
  title?: string;
  description?: string;
  properties?: Record<string, SchemaValue>;
  patternProperties?: Record<string, SchemaValue>;
  required?: string[];
  minItems?: number;
  items?: SchemaValue | SchemaValue[];
  prefixItems?: SchemaValue[];
  additionalItems?: SchemaValue;
  enum?: unknown[];
  const?: unknown;
  anyOf?: SchemaValue[];
  oneOf?: SchemaValue[];
  allOf?: SchemaValue[];
  format?: string;
  additionalProperties?: SchemaValue;
  $ref?: string;
  $defs?: Record<string, SchemaValue>;
  definitions?: Record<string, SchemaValue>;
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
      const parsed = JSON.parse(input) as unknown;

      if (typeof parsed !== "boolean" && (!parsed || typeof parsed !== "object" || Array.isArray(parsed))) {
        throw new Error("A JSON Schema must be an object or a boolean schema.");
      }

      const schema = parsed as SchemaValue;
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

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setError("");

      window.setTimeout(() => {
        setCopied(false);
      }, 1400);
    } catch {
      setError("The TypeScript output could not be copied. Select and copy it manually.");
      setCopied(false);
    }
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
      description="Convert common JSON Schema structures into TypeScript interfaces or type aliases, resolve local JSON Pointer refs, handle modern tuple syntax, and review rules that TypeScript cannot enforce."
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
          Paste a JSON Schema object or boolean schema. The TypeScript output is generated locally
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
              { label: "Represent extra keys", value: "record" },
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
          This converter handles common schema patterns. Review warnings and
          test the generated code before using it in a production project.
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
          <SummaryCard label="Enum unions" value={result.enumCount.toLocaleString()} />
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
        Conversion happens directly in your browser. Your schema is not uploaded
        to a server by this tool.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Where JSON Schema and TypeScript Line Up</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            TypeScript can represent many structural parts of JSON Schema well: object properties, required versus optional fields, primitive types, arrays, nullable unions, enums, const values, nested objects, and common anyOf/allOf shapes. This converter turns those parts into readable interfaces or type aliases and reports the places where the mapping is only an approximation.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The converter also resolves local JSON Pointer references such as #/$defs/User and #/definitions/User. External references are intentionally not fetched, so a schema cannot cause this browser-only tool to request another document.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Draft 2020-12 Arrays and Tuples</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Draft 2020-12 uses prefixItems for position-specific tuple entries and items for the remaining entries. The converter handles that form, including closed tuples with items: false and open tuples with a typed or unconstrained remainder. Older schemas that use an array in items are treated as legacy tuple syntax and are flagged for review.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Extra Object Keys Need Care in TypeScript</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON Schema allows additional properties unless a schema explicitly forbids them. When extra-key output is enabled, unconstrained additional properties become an unknown or any index signature. A schema that constrains only additional keys is harder to mirror exactly because a TypeScript string index signature also applies to named properties; the converter reports when it has to broaden that index type.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Validation Rules Do Not Become TypeScript Runtime Checks</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Rules such as minimum, maximum, pattern, format, minLength, uniqueItems, contains, conditional schemas, dependent schemas, and unevaluatedProperties describe runtime validation. A normal TypeScript type cannot enforce most of those rules, so the converter lists them as warnings instead of pretending the generated type is a validator.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            oneOf is another important approximation: a TypeScript union can describe the possible shapes, but it does not enforce JSON Schema&apos;s “exactly one matching branch” rule. Recursive local references and dynamic/external reference behavior can also require manual modeling.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Boolean Schemas</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON Schema allows true and false as complete schemas. true accepts every instance and maps to the selected fallback type (unknown by default); false accepts no instance and maps naturally to TypeScript never.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Use the Output as a Structural Starting Point</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Generated TypeScript is most useful for editor hints, API models, configuration types, and a first pass at application contracts. Review warnings before committing the output, especially when a schema uses refs, composition, typed additional properties, draft-specific tuple features, or validation-only keywords. TypeScript types disappear at runtime; keep schema validation in place when runtime guarantees matter.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Browser-Local Conversion</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Conversion runs in your browser. Local references are resolved only inside the pasted schema and external refs are not fetched by this page.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/json-schema-to-typescript-converter" />
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
  rootSchema: SchemaValue;
  declarations: string[];
  usedNames: Set<string>;
  warnings: string[];
  resolvingRefs: Set<string>;
  refTypeCache: Map<string, string>;
  counters: {
    typeCount: number;
    interfaceCount: number;
    enumCount: number;
  };
};

function convertJsonSchemaToTypeScript(schema: SchemaValue, options: ConvertOptions): ConvertResult {
  const objectSchema = isSchemaObject(schema) ? schema : null;
  const requestedName = options.rootName.trim();
  const rootTypeName = cleanTypeName(
    requestedName && requestedName !== "GeneratedType"
      ? requestedName
      : objectSchema?.title || requestedName || "GeneratedType"
  );
  const context: ConvertContext = {
    ...options,
    rootSchema: schema,
    declarations: [],
    usedNames: new Set<string>([rootTypeName]),
    warnings: [],
    resolvingRefs: new Set<string>(),
    refTypeCache: new Map<string, string>(),
    counters: { typeCount: 0, interfaceCount: 0, enumCount: 0 },
  };

  collectUnsupportedKeywordWarnings(schema, context);
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
    warnings: [...new Set(context.warnings)],
  };
}

function schemaToTs(schema: SchemaValue, nameHint: string, context: ConvertContext, depth: number): string {
  if (depth > 40) {
    context.warnings.push(`Schema nesting is too deep near ${nameHint}. A fallback type was used.`);
    return fallbackType(context);
  }

  if (schema === true) return fallbackType(context);
  if (schema === false) return "never";

  if (schema.$ref) {
    const refSiblings = Object.keys(schema).filter(
      (key) => !["$ref", "$id", "$schema", "$comment", "title", "description", "default", "examples"].includes(key)
    );
    if (refSiblings.length > 0) {
      context.warnings.push(
        `$ref near ${nameHint} has sibling schema keywords (${refSiblings.join(", ")}). This converter resolves the reference but does not merge sibling constraints; review that field manually.`
      );
    }
    return refToType(schema.$ref, nameHint, context, depth);
  }

  if (schema.const !== undefined) {
    return literalType(schema.const, context, `const near ${nameHint}`);
  }

  if (schema.enum) {
    context.counters.enumCount += 1;
    const enumTypes = schema.enum.map((value) => literalType(value, context, `enum near ${nameHint}`));
    return [...new Set(enumTypes)].join(" | ") || fallbackType(context);
  }

  if (schema.anyOf || schema.oneOf) {
    const keyword = schema.oneOf ? "oneOf" : "anyOf";
    const list = schema.oneOf || schema.anyOf || [];
    if (list.length === 0) {
      context.warnings.push(`${keyword} is empty near ${nameHint}. A fallback type was used.`);
      return fallbackType(context);
    }
    if (schema.oneOf) {
      context.warnings.push(`oneOf near ${nameHint} is represented as a TypeScript union. TypeScript does not enforce the exactly-one-match rule.`);
    }
    return [...new Set(list.map((item, index) => schemaToTs(item, `${nameHint}${index + 1}`, context, depth + 1)))].join(" | ");
  }

  if (schema.allOf) {
    if (schema.allOf.length === 0) {
      context.warnings.push(`allOf is empty near ${nameHint}. A fallback type was used.`);
      return fallbackType(context);
    }
    return [...new Set(schema.allOf.map((item, index) => schemaToTs(item, `${nameHint}${index + 1}`, context, depth + 1)))].join(" & ");
  }

  const schemaType = schema.type || inferSchemaType(schema);
  if (Array.isArray(schemaType)) {
    if (schemaType.length === 0) {
      context.warnings.push(`An empty type array was found near ${nameHint}. A fallback type was used.`);
      return fallbackType(context);
    }
    return [...new Set(schemaType.map((item) => typeToTs(item, schema, nameHint, context, depth)))].join(" | ");
  }

  return typeToTs(schemaType, schema, nameHint, context, depth);
}

function inferSchemaType(schema: SchemaNode) {
  if (schema.properties || schema.patternProperties || schema.additionalProperties !== undefined) return "object";
  if (schema.items !== undefined || schema.prefixItems) return "array";
  return "unknown";
}

function typeToTs(type: string, schema: SchemaNode, nameHint: string, context: ConvertContext, depth: number): string {
  if (type === "object") {
    if ((!schema.properties || Object.keys(schema.properties).length === 0) && schema.additionalProperties === false) {
      return "Record<string, never>";
    }
    return objectToTs(schema, nameHint, context, depth);
  }

  if (type === "array") {
    if (schema.prefixItems || Array.isArray(schema.items)) {
      return tupleToTs(schema, nameHint, context, depth);
    }

    const itemSchema = schema.items;
    const itemType = itemSchema === undefined || itemSchema === true
      ? fallbackType(context)
      : itemSchema === false
      ? "never"
      : schemaToTs(itemSchema, `${nameHint}Item`, context, depth + 1);

    return context.arrayStyle === "generic" ? `Array<${itemType}>` : `${wrapArrayItem(itemType)}[]`;
  }

  if (type === "integer" || type === "number") return "number";
  if (type === "string") return "string";
  if (type === "boolean") return "boolean";
  if (type === "null") return "null";
  return fallbackType(context);
}

function tupleToTs(schema: SchemaNode, nameHint: string, context: ConvertContext, depth: number) {
  const isModern = Array.isArray(schema.prefixItems);
  const prefixSchemas = isModern ? schema.prefixItems || [] : (Array.isArray(schema.items) ? schema.items : []);

  if (!isModern) {
    context.warnings.push(`Legacy tuple syntax using an array in items was found near ${nameHint}. Draft 2020-12 uses prefixItems instead.`);
  }

  const rawPrefixTypes = prefixSchemas.map((item, index) => schemaToTs(item, `${nameHint}Item${index + 1}`, context, depth + 1));
  const minItems = Number.isInteger(schema.minItems) && (schema.minItems as number) > 0 ? (schema.minItems as number) : 0;
  const requiredPrefixCount = Math.min(rawPrefixTypes.length, minItems);
  const prefixTypes = rawPrefixTypes.map((type, index) => (index < requiredPrefixCount ? type : `${type}?`));
  const remainder = isModern ? schema.items : schema.additionalItems;

  if (minItems > rawPrefixTypes.length) {
    context.warnings.push(`minItems near ${nameHint} requires more items than the fixed tuple prefix. The generated rest element does not enforce that minimum length.`);
  }

  if (remainder === false) return `[${prefixTypes.join(", ")}]`;

  const remainderType = remainder === undefined || remainder === true
    ? fallbackType(context)
    : Array.isArray(remainder)
    ? fallbackType(context)
    : schemaToTs(remainder, `${nameHint}Rest`, context, depth + 1);

  if (Array.isArray(remainder)) {
    context.warnings.push(`Unexpected array-valued tuple remainder near ${nameHint}. A fallback rest type was used.`);
  }

  const rest = `...${wrapArrayItem(remainderType)}[]`;
  return `[${[...prefixTypes, rest].join(", ")}]`;
}

function objectToTs(schema: SchemaNode, nameHint: string, context: ConvertContext, depth: number): string {
  const properties = schema.properties || {};
  const required = new Set(schema.required || []);
  const lines: string[] = ["{"];
  const generatedKeys = new Set<string>();
  const knownPropertyTypes: string[] = [];

  [...required].filter((key) => !(key in properties)).forEach((key) => {
    context.warnings.push(`required includes ${JSON.stringify(key)} near ${nameHint}, but no matching properties schema was provided. Add that property manually if it belongs in the TypeScript shape.`);
  });

  Object.entries(properties).forEach(([rawKey, childSchema]) => {
    const preferredKey = context.propertyStyle === "camel" ? toCamelCase(rawKey) : rawKey;
    if (context.propertyStyle === "camel" && preferredKey !== rawKey) {
      context.warnings.push(`Property ${JSON.stringify(rawKey)} was renamed to ${JSON.stringify(preferredKey)} near ${nameHint}. The TypeScript key no longer matches the raw JSON property unless your application transforms it.`);
    }
    const key = generatedKeys.has(preferredKey) ? rawKey : preferredKey;

    if (generatedKeys.has(preferredKey)) {
      context.warnings.push(`Property name conversion created a collision for ${rawKey} in ${nameHint}. The original key was preserved.`);
    }

    generatedKeys.add(key);
    const safeKey = formatPropertyName(key);
    const optional = shouldOptional(rawKey, required, schema, context) ? "?" : "";
    const childName = cleanTypeName(`${nameHint}${capitalize(key)}`);
    const childType = schemaToTs(childSchema, childName, context, depth + 1);
    knownPropertyTypes.push(childType);
    const childDescription = isSchemaObject(childSchema) ? childSchema.description : undefined;
    const comment = context.includeComments && childDescription
      ? `  /** ${formatComment(String(childDescription))} */\n`
      : "";

    lines.push(`${comment}  ${safeKey}${optional}: ${childType};`);
  });

  if (context.additionalMode === "record" && schema.additionalProperties !== false) {
    const additional = schema.additionalProperties;
    const additionalType = additional === undefined || additional === true
      ? fallbackType(context)
      : schemaToTs(additional, `${nameHint}AdditionalValue`, context, depth + 1);

    if (knownPropertyTypes.length === 0 || additionalType === "unknown" || additionalType === "any") {
      lines.push(`  [key: string]: ${additionalType};`);
    } else {
      const indexType = [...new Set([additionalType, ...knownPropertyTypes])].join(" | ");
      lines.push(`  [key: string]: ${indexType};`);
      context.warnings.push(`Typed additionalProperties near ${nameHint} was broadened in the TypeScript index signature so named properties remain assignable. Review extra-key typing manually if the distinction matters.`);
    }
  }

  if (schema.patternProperties && Object.keys(schema.patternProperties).length > 0) {
    context.warnings.push(`patternProperties near ${nameHint} cannot be represented exactly by a normal TypeScript string index signature.`);
  }

  lines.push("}");
  const body = lines.join("\n");
  if (depth === 0) return body;

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
  if (!schema.required && context.optionalWhenRequiredMissing) return true;
  return !required.has(key);
}

function refToType(ref: string, nameHint: string, context: ConvertContext, depth: number) {
  if (!ref.startsWith("#")) {
    context.warnings.push(`External reference ${ref} is not fetched. A fallback type was used.`);
    return fallbackType(context);
  }

  const cached = context.refTypeCache.get(ref);
  if (cached) return cached;

  if (context.resolvingRefs.has(ref)) {
    context.warnings.push(`Recursive local reference ${ref} was not expanded near ${nameHint}. A fallback type was used to avoid an infinite declaration loop.`);
    return fallbackType(context);
  }

  const resolved = resolveLocalRef(context.rootSchema, ref);
  if (resolved === undefined) {
    context.warnings.push(`Local reference ${ref} could not be resolved. A fallback type was used.`);
    return fallbackType(context);
  }

  context.resolvingRefs.add(ref);
  const pointerName = ref === "#" ? nameHint : cleanTypeName(ref.split("/").pop() || nameHint);
  const resolvedType = schemaToTs(resolved, pointerName, context, depth + 1);
  context.resolvingRefs.delete(ref);
  context.refTypeCache.set(ref, resolvedType);
  return resolvedType;
}

function resolveLocalRef(root: SchemaValue, ref: string): SchemaValue | undefined {
  if (ref === "#") return root;
  if (!ref.startsWith("#/")) return undefined;

  let pointer: string;
  try {
    pointer = decodeURIComponent(ref.slice(2));
  } catch {
    return undefined;
  }

  const parts = pointer.split("/").map((part) => part.replace(/~1/g, "/").replace(/~0/g, "~"));
  let current: unknown = root;

  for (const part of parts) {
    if (!current || typeof current !== "object" || Array.isArray(current) || !(part in current)) return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  return isSchemaValue(current) ? current : undefined;
}

function literalType(value: unknown, context: ConvertContext, location: string) {
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      context.warnings.push(`A non-finite numeric literal appeared in ${location}. A fallback type was used.`);
      return fallbackType(context);
    }
    return String(value);
  }
  if (typeof value === "boolean") return String(value);
  if (value === null) return "null";
  context.warnings.push(`A non-primitive literal appeared in ${location}. TypeScript literal output is approximated with a fallback type.`);
  return fallbackType(context);
}

function formatComment(value: string) {
  return value.replace(/\*\//g, "* /").replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
}

function collectUnsupportedKeywordWarnings(schema: SchemaValue, context: ConvertContext) {
  const validationOnlyKeywords = [
    "minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "multipleOf",
    "minLength", "maxLength", "pattern", "format", "minItems", "maxItems",
    "uniqueItems", "contains", "minContains", "maxContains", "minProperties",
    "maxProperties", "dependentRequired", "dependentSchemas", "if", "then", "else",
    "not", "unevaluatedProperties", "unevaluatedItems", "propertyNames",
    "contentEncoding", "contentMediaType", "contentSchema", "$dynamicRef", "$recursiveRef",
  ];
  const found = new Set<string>();

  const visit = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (!value || typeof value !== "object") return;
    const record = value as Record<string, unknown>;
    validationOnlyKeywords.forEach((keyword) => {
      if (keyword in record) found.add(keyword);
    });
    Object.values(record).forEach(visit);
  };

  visit(schema);
  if (found.size > 0) {
    context.warnings.push(`Validation or advanced keywords are not represented as runtime TypeScript constraints: ${Array.from(found).sort().join(", ")}.`);
  }
}

function fallbackType(context: { preferUnknown: boolean }) {
  return context.preferUnknown ? "unknown" : "any";
}

function cleanTypeName(value: string) {
  const cleaned = value.replace(/[^A-Za-z0-9_]/g, " ").split(/\s+/).filter(Boolean).map(capitalize).join("");
  const fallback = cleaned || "GeneratedType";
  return /^[A-Za-z_]/.test(fallback) ? fallback : `Type${fallback}`;
}

function uniqueName(name: string, usedNames: Set<string>) {
  if (!usedNames.has(name)) {
    usedNames.add(name);
    return name;
  }
  let index = 2;
  while (usedNames.has(`${name}${index}`)) index += 1;
  const next = `${name}${index}`;
  usedNames.add(next);
  return next;
}

function toCamelCase(value: string) {
  return value.replace(/[-_\s]+(.)?/g, (_match, char: string) => (char ? char.toUpperCase() : "")).replace(/^(.)/, (char) => char.toLowerCase());
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

function isSchemaObject(value: SchemaValue): value is SchemaNode {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSchemaValue(value: unknown): value is SchemaValue {
  return typeof value === "boolean" || (typeof value === "object" && value !== null && !Array.isArray(value));
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
