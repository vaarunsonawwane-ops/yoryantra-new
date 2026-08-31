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
  items?: SchemaValue | SchemaValue[];
  prefixItems?: SchemaValue[];
  additionalItems?: SchemaValue;
  minItems?: number;
  maxItems?: number;
  enum?: unknown[];
  const?: unknown;
  anyOf?: SchemaValue[];
  oneOf?: SchemaValue[];
  allOf?: SchemaValue[];
  additionalProperties?: SchemaValue;
  $ref?: string;
  $schema?: string;
  $defs?: Record<string, SchemaValue>;
  definitions?: Record<string, SchemaValue>;
  [key: string]: unknown;
};

type ConvertOptions = {
  rootName: string;
  outputStyle: OutputStyle;
  propertyStyle: PropertyStyle;
  arrayStyle: ArrayStyle;
  additionalMode: AdditionalMode;
  includeComments: boolean;
  exportTypes: boolean;
  preferUnknown: boolean;
};

type ConvertResult = {
  output: string;
  outputKind: "interface" | "type";
  refsResolved: number;
  enumCount: number;
  warnings: string[];
};

type ConvertContext = ConvertOptions & {
  rootSchema: SchemaValue;
  warnings: string[];
  refsResolved: number;
  enumCount: number;
  resolvingRefs: Set<string>;
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
    }
  },
  "additionalProperties": false
}`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [rootName, setRootName] = useState("GeneratedType");
  const [outputStyle, setOutputStyle] =
    useState<OutputStyle>("interface");
  const [propertyStyle, setPropertyStyle] =
    useState<PropertyStyle>("preserve");
  const [arrayStyle, setArrayStyle] = useState<ArrayStyle>("array");
  const [additionalMode, setAdditionalMode] =
    useState<AdditionalMode>("record");
  const [includeComments, setIncludeComments] = useState(true);
  const [exportTypes, setExportTypes] = useState(true);
  const [preferUnknown, setPreferUnknown] = useState(true);
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(
    () => (result ? getConverterNotes(result) : []),
    [result]
  );

  const clearResult = () => {
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

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

      if (
        typeof parsed !== "boolean" &&
        (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      ) {
        throw new Error(
          "A JSON Schema must be a JSON object or a boolean schema."
        );
      }

      const nextResult = convertJsonSchemaToTypeScript(
        parsed as SchemaValue,
        {
          rootName,
          outputStyle,
          propertyStyle,
          arrayStyle,
          additionalMode,
          includeComments,
          exportTypes,
          preferUnknown,
        }
      );

      setResult(nextResult);
      setOutput(nextResult.output);
      setError("");
      setCopied(false);
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "The schema could not be converted.";

      setError(message);
      setResult(null);
      setOutput("");
      setCopied(false);
    }
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setError("");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError(
        "The TypeScript output could not be copied. Select and copy it manually."
      );
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
    clearResult();
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
    clearResult();
  };

  return (
    <ToolShell
      title="JSON Schema to TypeScript Converter"
      description="Convert common JSON Schema structures into TypeScript interfaces or type aliases, resolve local JSON Pointer references, handle modern and legacy tuple forms, and surface schema rules that TypeScript cannot represent exactly."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block text-sm font-semibold text-gray-900">
          JSON Schema
        </label>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">
          Paste a JSON Schema object or boolean schema. This is a structural
          converter, not a replacement for validating the schema against its
          declared meta-schema.
        </p>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            clearResult();
          }}
          placeholder={sampleSchema}
          spellCheck={false}
          className="mt-4 w-full min-h-[420px] rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Conversion Options
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
                clearResult();
              }}
              placeholder="GeneratedType"
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
          </div>

          <YoryantraSelect
            label="Output Style"
            value={outputStyle}
            onChange={(value) => {
              setOutputStyle(value as OutputStyle);
              clearResult();
            }}
            options={[
              { label: "Interface when possible", value: "interface" },
              { label: "Type alias", value: "type" },
            ]}
          />

          <YoryantraSelect
            label="Property Names"
            value={propertyStyle}
            onChange={(value) => {
              setPropertyStyle(value as PropertyStyle);
              clearResult();
            }}
            options={[
              { label: "Preserve JSON names", value: "preserve" },
              { label: "Camel case", value: "camel" },
            ]}
          />

          <YoryantraSelect
            label="Array Style"
            value={arrayStyle}
            onChange={(value) => {
              setArrayStyle(value as ArrayStyle);
              clearResult();
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
              clearResult();
            }}
            options={[
              {
                label: "Represent additionalProperties",
                value: "record",
              },
              { label: "Ignore extra-key rules", value: "ignore" },
            ]}
          />

          <Toggle
            checked={includeComments}
            onChange={(value) => {
              setIncludeComments(value);
              clearResult();
            }}
            label="Include schema descriptions as TypeScript comments"
          />

          <Toggle
            checked={exportTypes}
            onChange={(value) => {
              setExportTypes(value);
              clearResult();
            }}
            label="Add export to the root declaration"
          />

          <Toggle
            checked={preferUnknown}
            onChange={(value) => {
              setPreferUnknown(value);
              clearResult();
            }}
            label="Use unknown instead of any for unconstrained values"
          />
        </div>

        <p className="mt-4 text-sm leading-relaxed text-gray-500">
          Property optionality follows JSON Schema&apos;s{" "}
          <code>required</code> keyword. Properties are optional when their
          names are not listed in <code>required</code>; a default value does
          not make a property required.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={convertSchema}
          className="yoryantra-btn"
        >
          Convert to TypeScript
        </button>

        <button
          type="button"
          onClick={copyOutput}
          className="yoryantra-btn"
          disabled={!output}
        >
          {copied ? "Copied" : "Copy Output"}
        </button>

        <button
          type="button"
          onClick={loadExample}
          className="yoryantra-btn-outline"
        >
          Load Example
        </button>

        <button
          type="button"
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Root output" value={result.outputKind} />
          <SummaryCard
            label="Local refs"
            value={result.refsResolved.toLocaleString()}
          />
          <SummaryCard
            label="Enum unions"
            value={result.enumCount.toLocaleString()}
          />
          <SummaryCard
            label="Warnings"
            value={result.warnings.length.toLocaleString()}
          />
        </div>
      ) : null}

      {notes.length > 0 ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            TypeScript review notes
          </h3>
          <div className="mt-3 space-y-4">
            {notes.map((note) => (
              <div key={`${note.title}-${note.message}`}>
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
      ) : null}

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              TypeScript Output
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Treat generated types as a structural starting point. Runtime
              validation rules remain the job of your JSON Schema validator.
            </p>
          </div>

          {output ? (
            <button
              type="button"
              onClick={copyOutput}
              className="yoryantra-btn-outline text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          ) : null}
        </div>

        <pre className="mt-4 yoryantra-output min-h-[380px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "Generated TypeScript will appear here."}
        </pre>
      </div>

      <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Browser-local conversion
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          Conversion runs in your browser. Local references are resolved only
          inside the pasted schema and external references are not fetched by
          this tool. Site-wide analytics or advertising scripts, if enabled by
          the website, are separate from the conversion operation itself.
        </p>
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Where JSON Schema and TypeScript Line Up
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            TypeScript can represent many structural parts of JSON Schema:
            object properties, required versus optional fields, primitive
            types, arrays, nullable unions, primitive enums and const values,
            nested objects, and common union or intersection shapes. This
            converter focuses on those structural mappings and reports places
            where the result is only an approximation.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            TypeScript&apos;s type system is structural and disappears at
            runtime. A generated type can improve editor and compile-time
            checks, but it does not perform JSON Schema validation when data
            arrives from an API, file, form, database, or other untrusted
            source.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Required Properties and Properties Without Schemas
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            In JSON Schema, the <code>properties</code> keyword describes
            schemas for named properties, while <code>required</code> decides
            which names must exist. A name may legally appear in{" "}
            <code>required</code> without appearing in{" "}
            <code>properties</code>. In that case this converter emits a
            required <code>unknown</code> or <code>any</code> property and
            warns that the value itself is unconstrained.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Draft 2020-12 Arrays and Tuples
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Draft 2020-12 uses <code>prefixItems</code> for position-specific
            tuple entries and <code>items</code> for the remaining entries.
            The converter handles that form, including closed tuples with{" "}
            <code>items: false</code> and open tuples with typed or
            unconstrained remainders. An array in <code>items</code> is
            recognized as legacy tuple syntax and flagged for review.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            <code>minItems</code> can make the first tuple entries required,
            which TypeScript tuple syntax can approximate. More advanced
            length constraints such as arbitrary <code>maxItems</code> values
            or minimum lengths that extend into an open rest element cannot be
            represented exactly by an ordinary reusable TypeScript type.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Local $ref Handling and Sibling Keywords
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Local references such as <code>#/$defs/User</code> are resolved
            with JSON Pointer rules inside the pasted document. External
            references are not requested. Recursive local references are
            stopped with a fallback type instead of risking an infinite
            conversion loop, and the output is marked for manual review.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Modern JSON Schema drafts allow schema keywords beside{" "}
            <code>$ref</code>. When structural sibling keywords are present,
            this converter combines their TypeScript approximation with the
            referenced type using an intersection. Older drafts treated some
            reference siblings differently, so schemas that declare an older
            dialect are flagged for review.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            additionalProperties Is Not an Exact TypeScript Match
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JSON Schema allows additional object properties unless a schema
            forbids them. An unconstrained extra-key rule maps reasonably to a
            TypeScript string index signature with <code>unknown</code> or{" "}
            <code>any</code>. A typed <code>additionalProperties</code> rule is
            harder because a TypeScript string index signature also applies to
            explicitly named properties. The converter broadens the index
            value type when necessary and reports that approximation.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Even when <code>additionalProperties: false</code> is present,
            TypeScript object types are not general-purpose runtime
            &quot;exact object&quot; validators. Excess-property checks have
            their own TypeScript rules, so keep runtime schema validation when
            extra keys must actually be rejected.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Validation Keywords Do Not Become Runtime Type Checks
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Rules such as <code>minimum</code>, <code>maximum</code>,{" "}
            <code>pattern</code>, <code>format</code>,{" "}
            <code>minLength</code>, <code>uniqueItems</code>,{" "}
            <code>contains</code>, conditional schemas, dependent schemas, and{" "}
            <code>unevaluatedProperties</code> describe validation behavior.
            Normal TypeScript types cannot enforce most of those rules, so the
            converter lists them instead of pretending the generated code is
            equivalent to the schema.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            <code>oneOf</code> is another important approximation: a
            TypeScript union can describe possible shapes, but it does not
            enforce JSON Schema&apos;s requirement that exactly one branch
            validate.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Boolean Schemas
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JSON Schema allows <code>true</code> and <code>false</code> as
            complete schemas. <code>true</code> accepts every instance and
            maps to the selected fallback type, <code>unknown</code> by
            default. <code>false</code> accepts no instance and maps naturally
            to TypeScript <code>never</code>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Official References
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed">
            <p>
              <a
                href="https://json-schema.org/draft/2020-12/json-schema-core"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--green)] underline underline-offset-4"
              >
                JSON Schema Draft 2020-12 — Core specification
              </a>
            </p>
            <p>
              <a
                href="https://json-schema.org/draft/2020-12/json-schema-validation"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--green)] underline underline-offset-4"
              >
                JSON Schema Draft 2020-12 — Validation specification
              </a>
            </p>
            <p>
              <a
                href="https://www.rfc-editor.org/rfc/rfc6901"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--green)] underline underline-offset-4"
              >
                RFC 6901 — JSON Pointer
              </a>
            </p>
            <p>
              <a
                href="https://www.typescriptlang.org/docs/handbook/2/everyday-types.html"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--green)] underline underline-offset-4"
              >
                TypeScript Handbook — Everyday Types
              </a>
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/json-schema-to-typescript-converter" />
        </div>
      </section>
    </ToolShell>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[var(--light-gold)]"
      />
      <span>{label}</span>
    </label>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function convertJsonSchemaToTypeScript(
  schema: SchemaValue,
  options: ConvertOptions
): ConvertResult {
  const objectSchema = isSchemaObject(schema) ? schema : null;
  const requestedName = options.rootName.trim();
  const schemaTitle =
    objectSchema && typeof objectSchema.title === "string"
      ? objectSchema.title
      : "";

  const rootTypeName = cleanTypeName(
    requestedName && requestedName !== "GeneratedType"
      ? requestedName
      : schemaTitle || requestedName || "GeneratedType"
  );

  const context: ConvertContext = {
    rootSchema: schema,
    rootName: options.rootName,
    outputStyle: options.outputStyle,
    propertyStyle: options.propertyStyle,
    arrayStyle: options.arrayStyle,
    additionalMode: options.additionalMode,
    includeComments: options.includeComments,
    exportTypes: options.exportTypes,
    preferUnknown: options.preferUnknown,
    warnings: [],
    refsResolved: 0,
    enumCount: 0,
    resolvingRefs: new Set<string>(),
  };

  addDialectWarning(schema, context);
  collectUnsupportedKeywordWarnings(schema, context);

  const rootType = schemaToTs(schema, rootTypeName, context, 0);
  const prefix = options.exportTypes ? "export " : "";

  let outputKind: "interface" | "type" = "type";
  let output: string;

  if (
    options.outputStyle === "interface" &&
    isPlainObjectTypeExpression(rootType)
  ) {
    outputKind = "interface";
    output = `${prefix}interface ${rootTypeName} ${rootType}`;
  } else {
    output = `${prefix}type ${rootTypeName} = ${rootType};`;

    if (
      options.outputStyle === "interface" &&
      !isPlainObjectTypeExpression(rootType)
    ) {
      context.warnings.push(
        "The root schema maps to a union, intersection, primitive, tuple, boolean schema, or other non-interface shape, so a type alias was generated even though interface output was selected."
      );
    }
  }

  return {
    output,
    outputKind,
    refsResolved: context.refsResolved,
    enumCount: context.enumCount,
    warnings: dedupe(context.warnings),
  };
}

function schemaToTs(
  schema: SchemaValue,
  nameHint: string,
  context: ConvertContext,
  depth: number
): string {
  if (depth > 32) {
    context.warnings.push(
      `Schema nesting is too deep near ${nameHint}. A fallback type was used.`
    );
    return fallbackType(context);
  }

  if (schema === true) return fallbackType(context);
  if (schema === false) return "never";

  if (typeof schema.$ref === "string") {
    const referenceType = refToType(
      schema.$ref,
      nameHint,
      context,
      depth + 1
    );
    const siblingSchema = getReferenceSiblingSchema(schema);

    if (siblingSchema) {
      context.warnings.push(
        `$ref near ${nameHint} has sibling schema keywords. Modern JSON Schema applies those siblings, so the generated TypeScript combines the referenced and sibling structures with an intersection. Review older-draft schemas manually.`
      );

      const siblingType = schemaToTs(
        siblingSchema,
        `${nameHint}RefSibling`,
        context,
        depth + 1
      );

      return combineIntersection(referenceType, siblingType);
    }

    return referenceType;
  }

  if ("$ref" in schema && schema.$ref !== undefined) {
    context.warnings.push(
      `$ref near ${nameHint} is not a string. A fallback type was used for the invalid reference.`
    );
    return fallbackType(context);
  }

  if ("const" in schema) {
    return literalType(schema.const, context, `const near ${nameHint}`);
  }

  if (schema.enum !== undefined) {
    if (!Array.isArray(schema.enum) || schema.enum.length === 0) {
      context.warnings.push(
        `enum near ${nameHint} is not a non-empty array. The schema keyword is invalid and never was used as a conservative fallback.`
      );
      return "never";
    }

    context.enumCount += 1;
    const members = schema.enum.map((value) =>
      literalType(value, context, `enum near ${nameHint}`)
    );
    return dedupe(members).join(" | ") || fallbackType(context);
  }

  const oneOf = readSchemaArray(schema.oneOf, "oneOf", nameHint, context);
  if (oneOf) {
    if (oneOf.length === 0) return "never";

    context.warnings.push(
      `oneOf near ${nameHint} is represented as a TypeScript union. TypeScript does not enforce JSON Schema's exactly-one-valid-branch rule.`
    );

    return dedupe(
      oneOf.map((item, index) =>
        schemaToTs(item, `${nameHint}OneOf${index + 1}`, context, depth + 1)
      )
    ).join(" | ");
  }

  const anyOf = readSchemaArray(schema.anyOf, "anyOf", nameHint, context);
  if (anyOf) {
    if (anyOf.length === 0) return "never";

    return dedupe(
      anyOf.map((item, index) =>
        schemaToTs(item, `${nameHint}AnyOf${index + 1}`, context, depth + 1)
      )
    ).join(" | ");
  }

  const allOf = readSchemaArray(schema.allOf, "allOf", nameHint, context);
  if (allOf) {
    if (allOf.length === 0) return fallbackType(context);

    return dedupe(
      allOf.map((item, index) =>
        schemaToTs(item, `${nameHint}AllOf${index + 1}`, context, depth + 1)
      )
    )
      .map(wrapForIntersection)
      .join(" & ");
  }

  const schemaType = schema.type || inferSchemaType(schema);

  if (Array.isArray(schemaType)) {
    if (schemaType.length === 0) {
      context.warnings.push(
        `An empty type array was found near ${nameHint}. A fallback type was used.`
      );
      return fallbackType(context);
    }

    return dedupe(
      schemaType.map((item) =>
        typeToTs(item, schema, nameHint, context, depth)
      )
    ).join(" | ");
  }

  if (typeof schemaType !== "string") {
    context.warnings.push(
      `The type keyword near ${nameHint} is not a string or string array. A fallback type was used.`
    );
    return fallbackType(context);
  }

  return typeToTs(schemaType, schema, nameHint, context, depth);
}

function typeToTs(
  type: string,
  schema: SchemaNode,
  nameHint: string,
  context: ConvertContext,
  depth: number
): string {
  if (type === "object") {
    return objectToTs(schema, nameHint, context, depth + 1);
  }

  if (type === "array") {
    return arrayToTs(schema, nameHint, context, depth + 1);
  }

  if (type === "integer" || type === "number") return "number";
  if (type === "string") return "string";
  if (type === "boolean") return "boolean";
  if (type === "null") return "null";

  if (type === "unknown") return fallbackType(context);

  context.warnings.push(
    `Unsupported or unknown JSON Schema type ${JSON.stringify(
      type
    )} near ${nameHint}. A fallback TypeScript type was used.`
  );
  return fallbackType(context);
}

function objectToTs(
  schema: SchemaNode,
  nameHint: string,
  context: ConvertContext,
  depth: number
): string {
  const properties = readProperties(schema.properties, nameHint, context);
  const required = readRequired(schema.required, nameHint, context);
  const lines: string[] = ["{"];
  const generatedKeys = new Set<string>();
  const knownPropertyTypes: string[] = [];

  Object.entries(properties).forEach(([rawKey, childSchema]) => {
    const preferredKey =
      context.propertyStyle === "camel" ? toCamelCase(rawKey) : rawKey;

    if (context.propertyStyle === "camel" && preferredKey !== rawKey) {
      context.warnings.push(
        `Property ${JSON.stringify(rawKey)} was renamed to ${JSON.stringify(
          preferredKey
        )} near ${nameHint}. The generated TypeScript key no longer matches the raw JSON property unless your application transforms it.`
      );
    }

    let key = preferredKey;

    if (generatedKeys.has(key)) {
      key = rawKey;
      context.warnings.push(
        `Property name conversion created a collision for ${JSON.stringify(
          rawKey
        )} near ${nameHint}. The original property name was preserved.`
      );
    }

    generatedKeys.add(key);

    const childType = schemaToTs(
      childSchema,
      cleanTypeName(`${nameHint} ${key}`),
      context,
      depth + 1
    );
    knownPropertyTypes.push(childType);

    const optional = required.has(rawKey) ? "" : "?";
    const childDescription =
      isSchemaObject(childSchema) &&
      typeof childSchema.description === "string"
        ? childSchema.description
        : "";
    const comment =
      context.includeComments && childDescription
        ? `  /** ${formatComment(childDescription)} */\n`
        : "";

    lines.push(
      `${comment}  ${formatPropertyName(key)}${optional}: ${childType};`
    );
  });

  required.forEach((requiredKey) => {
    if (Object.prototype.hasOwnProperty.call(properties, requiredKey)) return;

    context.warnings.push(
      `required includes ${JSON.stringify(
        requiredKey
      )} near ${nameHint}, but properties does not define a schema for that name. The generated property is required and uses the selected fallback type.`
    );

    let key =
      context.propertyStyle === "camel"
        ? toCamelCase(requiredKey)
        : requiredKey;

    if (generatedKeys.has(key)) {
      key = requiredKey;
    }

    if (generatedKeys.has(key)) {
      context.warnings.push(
        `A required property ${JSON.stringify(
          requiredKey
        )} could not be emitted separately near ${nameHint} because its generated TypeScript name collides with another property.`
      );
      return;
    }

    generatedKeys.add(key);
    const fallback = fallbackType(context);
    knownPropertyTypes.push(fallback);
    lines.push(`  ${formatPropertyName(key)}: ${fallback};`);
  });

  if (context.additionalMode === "record") {
    const additional: unknown = schema.additionalProperties;

    if (additional !== false) {
      const additionalType =
        additional === undefined || additional === true
          ? fallbackType(context)
          : isSchemaValue(additional)
          ? schemaToTs(
              additional,
              `${nameHint}AdditionalValue`,
              context,
              depth + 1
            )
          : fallbackType(context);

      if (
        additional !== undefined &&
        additional !== true &&
        additional !== false &&
        !isSchemaValue(additional)
      ) {
        context.warnings.push(
          `additionalProperties near ${nameHint} is not a valid schema or boolean. A fallback index value type was used.`
        );
      }

      if (
        knownPropertyTypes.length === 0 ||
        additionalType === "unknown" ||
        additionalType === "any"
      ) {
        lines.push(`  [key: string]: ${additionalType};`);
      } else {
        const indexType = dedupe([
          additionalType,
          ...knownPropertyTypes,
        ]).join(" | ");
        lines.push(`  [key: string]: ${indexType};`);
        context.warnings.push(
          `Typed additionalProperties near ${nameHint} was broadened in the TypeScript string index signature so explicitly named properties remain assignable. Extra-key values may therefore be typed more broadly than the JSON Schema rule.`
        );
      }
    }
  } else if (schema.additionalProperties !== undefined) {
    context.warnings.push(
      `additionalProperties near ${nameHint} was intentionally omitted because "Ignore extra-key rules" is selected.`
    );
  }

  if (
    schema.patternProperties &&
    typeof schema.patternProperties === "object" &&
    !Array.isArray(schema.patternProperties) &&
    Object.keys(schema.patternProperties).length > 0
  ) {
    context.warnings.push(
      `patternProperties near ${nameHint} cannot be represented exactly by a normal TypeScript string index signature, so the regex-key constraint is not generated.`
    );
  }

  if (lines.length === 1) {
    if (schema.additionalProperties === false) {
      return "Record<string, never>";
    }
    return "Record<string, unknown>";
  }

  lines.push("}");
  return lines.join("\n");
}

function arrayToTs(
  schema: SchemaNode,
  nameHint: string,
  context: ConvertContext,
  depth: number
): string {
  if (Array.isArray(schema.prefixItems) || Array.isArray(schema.items)) {
    return tupleToTs(schema, nameHint, context, depth + 1);
  }

  if (
    schema.prefixItems !== undefined &&
    !Array.isArray(schema.prefixItems)
  ) {
    context.warnings.push(
      `prefixItems near ${nameHint} is not an array. The invalid keyword was ignored.`
    );
  }

  const items = schema.items;
  let itemType: string;

  if (items === undefined || items === true) {
    itemType = fallbackType(context);
  } else if (items === false) {
    itemType = "never";
  } else if (isSchemaValue(items)) {
    itemType = schemaToTs(
      items,
      `${nameHint}Item`,
      context,
      depth + 1
    );
  } else {
    context.warnings.push(
      `items near ${nameHint} is not a valid schema or boolean. A fallback array item type was used.`
    );
    itemType = fallbackType(context);
  }

  return formatArrayType(itemType, context.arrayStyle);
}

function tupleToTs(
  schema: SchemaNode,
  nameHint: string,
  context: ConvertContext,
  depth: number
) {
  const modern = Array.isArray(schema.prefixItems);
  const prefixSchemas: SchemaValue[] = modern
    ? schema.prefixItems || []
    : Array.isArray(schema.items)
    ? schema.items
    : [];

  if (!modern && Array.isArray(schema.items)) {
    context.warnings.push(
      `Legacy tuple syntax using an array in items was found near ${nameHint}. Draft 2020-12 uses prefixItems instead.`
    );
  }

  const prefixTypes = prefixSchemas.map((item, index) =>
    schemaToTs(
      item,
      `${nameHint}Item${index + 1}`,
      context,
      depth + 1
    )
  );

  const minItems =
    typeof schema.minItems === "number" &&
    Number.isInteger(schema.minItems) &&
    schema.minItems > 0
      ? schema.minItems
      : 0;

  const requiredPrefixCount = Math.min(prefixTypes.length, minItems);
  const tupleEntries = prefixTypes.map((type, index) =>
    index < requiredPrefixCount ? type : `${wrapTupleType(type)}?`
  );

  const remainder = modern ? schema.items : schema.additionalItems;

  if (remainder === false) {
    if (minItems > prefixTypes.length) {
      context.warnings.push(
        `minItems near ${nameHint} requires more elements than the closed tuple allows. The schema is unsatisfiable for that combination, so never was returned.`
      );
      return "never";
    }

    return `[${tupleEntries.join(", ")}]`;
  }

  let remainderType: string;

  if (remainder === undefined || remainder === true) {
    remainderType = fallbackType(context);
  } else if (Array.isArray(remainder)) {
    context.warnings.push(
      `The tuple remainder near ${nameHint} is unexpectedly array-valued. A fallback rest type was used.`
    );
    remainderType = fallbackType(context);
  } else if (isSchemaValue(remainder)) {
    remainderType = schemaToTs(
      remainder,
      `${nameHint}Rest`,
      context,
      depth + 1
    );
  } else {
    context.warnings.push(
      `The tuple remainder near ${nameHint} is not a valid schema or boolean. A fallback rest type was used.`
    );
    remainderType = fallbackType(context);
  }

  if (minItems > prefixTypes.length) {
    context.warnings.push(
      `minItems near ${nameHint} extends into the tuple rest element. The generated TypeScript rest type does not enforce that minimum length exactly.`
    );
  }

  tupleEntries.push(`...${wrapTupleType(remainderType)}[]`);
  return `[${tupleEntries.join(", ")}]`;
}

function refToType(
  ref: string,
  nameHint: string,
  context: ConvertContext,
  depth: number
) {
  if (!ref.startsWith("#")) {
    context.warnings.push(
      `External reference ${ref} near ${nameHint} was not fetched. A fallback type was used.`
    );
    return fallbackType(context);
  }

  if (context.resolvingRefs.has(ref)) {
    context.warnings.push(
      `Recursive local reference ${ref} near ${nameHint} was not expanded indefinitely. A fallback type was used at the recursive point; model the recursive TypeScript type manually if recursion matters.`
    );
    return fallbackType(context);
  }

  const resolved = resolveLocalRef(context.rootSchema, ref);

  if (resolved === undefined) {
    context.warnings.push(
      `Local reference ${ref} near ${nameHint} could not be resolved. A fallback type was used.`
    );
    return fallbackType(context);
  }

  context.refsResolved += 1;
  context.resolvingRefs.add(ref);

  const pointerName =
    ref === "#"
      ? nameHint
      : cleanTypeName(
          decodePointerLabel(ref.split("/").pop() || nameHint)
        );

  const result = schemaToTs(
    resolved,
    pointerName || nameHint,
    context,
    depth + 1
  );

  context.resolvingRefs.delete(ref);
  return result;
}

function resolveLocalRef(
  root: SchemaValue,
  ref: string
): SchemaValue | undefined {
  if (ref === "#") return root;
  if (!ref.startsWith("#/")) return undefined;

  let decoded: string;

  try {
    decoded = decodeURIComponent(ref.slice(1));
  } catch {
    return undefined;
  }

  const parts = decoded
    .slice(1)
    .split("/")
    .map((part) => part.replace(/~1/g, "/").replace(/~0/g, "~"));

  let current: unknown = root;

  for (const part of parts) {
    if (
      !current ||
      typeof current !== "object" ||
      Array.isArray(current) ||
      !Object.prototype.hasOwnProperty.call(current, part)
    ) {
      return undefined;
    }

    current = (current as Record<string, unknown>)[part];
  }

  return isSchemaValue(current) ? current : undefined;
}

function getReferenceSiblingSchema(
  schema: SchemaNode
): SchemaNode | null {
  const ignored = new Set([
    "$ref",
    "$id",
    "$schema",
    "$comment",
    "$anchor",
    "$dynamicAnchor",
    "title",
    "description",
    "default",
    "examples",
    "$defs",
    "definitions",
  ]);

  const sibling: SchemaNode = {};
  let count = 0;

  Object.entries(schema).forEach(([key, value]) => {
    if (ignored.has(key)) return;
    sibling[key] = value;
    count += 1;
  });

  return count > 0 ? sibling : null;
}

function readProperties(
  value: unknown,
  nameHint: string,
  context: ConvertContext
): Record<string, SchemaValue> {
  if (value === undefined) return {};

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    context.warnings.push(
      `properties near ${nameHint} is not an object. The invalid keyword was ignored.`
    );
    return {};
  }

  const output: Record<string, SchemaValue> = {};

  Object.entries(value as Record<string, unknown>).forEach(
    ([key, child]) => {
      if (isSchemaValue(child)) {
        output[key] = child;
      } else {
        context.warnings.push(
          `Property schema for ${JSON.stringify(
            key
          )} near ${nameHint} is not a JSON Schema object or boolean. A fallback schema was used.`
        );
        output[key] = true;
      }
    }
  );

  return output;
}

function readRequired(
  value: unknown,
  nameHint: string,
  context: ConvertContext
) {
  const required = new Set<string>();

  if (value === undefined) return required;

  if (!Array.isArray(value)) {
    context.warnings.push(
      `required near ${nameHint} is not an array. The invalid keyword was ignored.`
    );
    return required;
  }

  value.forEach((item) => {
    if (typeof item === "string") {
      required.add(item);
    } else {
      context.warnings.push(
        `required near ${nameHint} contains a non-string entry that was ignored.`
      );
    }
  });

  return required;
}

function readSchemaArray(
  value: unknown,
  keyword: string,
  nameHint: string,
  context: ConvertContext
): SchemaValue[] | null {
  if (value === undefined) return null;

  if (!Array.isArray(value)) {
    context.warnings.push(
      `${keyword} near ${nameHint} is not an array. The invalid keyword was ignored.`
    );
    return [];
  }

  const schemas: SchemaValue[] = [];

  value.forEach((item, index) => {
    if (isSchemaValue(item)) {
      schemas.push(item);
    } else {
      context.warnings.push(
        `${keyword}[${index}] near ${nameHint} is not a schema object or boolean and was replaced with an unconstrained fallback.`
      );
      schemas.push(true);
    }
  });

  return schemas;
}

function inferSchemaType(schema: SchemaNode) {
  if (
    schema.properties !== undefined ||
    schema.patternProperties !== undefined ||
    schema.additionalProperties !== undefined ||
    schema.required !== undefined
  ) {
    return "object";
  }

  if (
    schema.items !== undefined ||
    schema.prefixItems !== undefined
  ) {
    return "array";
  }

  return "unknown";
}

function literalType(
  value: unknown,
  context: ConvertContext,
  location: string
) {
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      context.warnings.push(
        `A non-finite numeric literal appeared in ${location}. A fallback type was used.`
      );
      return fallbackType(context);
    }
    return String(value);
  }
  if (typeof value === "boolean") return String(value);
  if (value === null) return "null";

  context.warnings.push(
    `A non-primitive literal appeared in ${location}. Normal TypeScript literal types do not directly represent this JSON value, so a fallback type was used.`
  );
  return fallbackType(context);
}

function collectUnsupportedKeywordWarnings(
  schema: SchemaValue,
  context: ConvertContext
) {
  const validationOnlyKeywords = [
    "minimum",
    "maximum",
    "exclusiveMinimum",
    "exclusiveMaximum",
    "multipleOf",
    "minLength",
    "maxLength",
    "pattern",
    "format",
    "maxItems",
    "uniqueItems",
    "contains",
    "minContains",
    "maxContains",
    "minProperties",
    "maxProperties",
    "dependentRequired",
    "dependentSchemas",
    "if",
    "then",
    "else",
    "not",
    "unevaluatedProperties",
    "unevaluatedItems",
    "propertyNames",
    "contentEncoding",
    "contentMediaType",
    "contentSchema",
    "$dynamicRef",
    "$recursiveRef",
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
      if (Object.prototype.hasOwnProperty.call(record, keyword)) {
        found.add(keyword);
      }
    });

    Object.values(record).forEach(visit);
  };

  visit(schema);

  if (found.size > 0) {
    context.warnings.push(
      `Validation or advanced keywords are not represented as equivalent runtime TypeScript constraints: ${Array.from(
        found
      )
        .sort()
        .join(", ")}.`
    );
  }
}

function addDialectWarning(
  schema: SchemaValue,
  context: ConvertContext
) {
  if (!isSchemaObject(schema)) return;

  const dialect =
    typeof schema.$schema === "string" ? schema.$schema : "";

  if (!dialect) {
    context.warnings.push(
      "No $schema dialect is declared. Where draft behavior matters, this converter uses a Draft 2020-12-oriented interpretation while recognizing common legacy tuple syntax."
    );
    return;
  }

  if (
    /draft-0?4|draft-0?6|draft-0?7/i.test(dialect)
  ) {
    context.warnings.push(
      `An older JSON Schema dialect appears to be declared (${dialect}). Tuple keywords and $ref sibling behavior differ across drafts, so review draft-sensitive output carefully.`
    );
  }
}

function fallbackType(context: { preferUnknown: boolean }) {
  return context.preferUnknown ? "unknown" : "any";
}

function formatArrayType(itemType: string, style: ArrayStyle) {
  if (style === "generic") return `Array<${itemType}>`;
  return `${wrapArrayType(itemType)}[]`;
}

function wrapArrayType(value: string) {
  return needsGrouping(value) ? `(${value})` : value;
}

function wrapTupleType(value: string) {
  return needsGrouping(value) ? `(${value})` : value;
}

function wrapForIntersection(value: string) {
  return value.includes(" | ") ? `(${value})` : value;
}

function combineIntersection(left: string, right: string) {
  if (left === "unknown") return right;
  if (right === "unknown") return left;
  if (left === "never" || right === "never") return "never";
  if (left === right) return left;
  return `${wrapForIntersection(left)} & ${wrapForIntersection(right)}`;
}

function needsGrouping(value: string) {
  return value.includes(" | ") || value.includes(" & ");
}

function isPlainObjectTypeExpression(value: string) {
  const trimmed = value.trim();
  return trimmed.startsWith("{") && trimmed.endsWith("}");
}

function cleanTypeName(value: string) {
  const cleaned = value
    .replace(/[^A-Za-z0-9_$]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map(capitalize)
    .join("");

  const fallback = cleaned || "GeneratedType";
  return /^[A-Za-z_$]/.test(fallback)
    ? fallback
    : `Type${fallback}`;
}

function toCamelCase(value: string) {
  const converted = value
    .replace(/[-_\s]+(.)?/g, (_match, char: string) =>
      char ? char.toUpperCase() : ""
    )
    .replace(/^(.)/, (char) => char.toLowerCase());

  return converted || value;
}

function capitalize(value: string) {
  return value ? value[0].toUpperCase() + value.slice(1) : value;
}

function formatPropertyName(value: string) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value)
    ? value
    : JSON.stringify(value);
}

function formatComment(value: string) {
  return value
    .replace(/\*\//g, "* /")
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodePointerLabel(value: string) {
  let decoded = value;

  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    // Keep the original fragment token for a readable type-name hint.
  }

  return decoded.replace(/~1/g, "/").replace(/~0/g, "~");
}

function isSchemaObject(value: SchemaValue): value is SchemaNode {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSchemaValue(value: unknown): value is SchemaValue {
  return (
    typeof value === "boolean" ||
    (typeof value === "object" &&
      value !== null &&
      !Array.isArray(value))
  );
}

function dedupe(values: string[]) {
  return Array.from(new Set(values));
}

function getConverterNotes(result: ConvertResult): ConverterNote[] {
  const notes: ConverterNote[] = [];

  result.warnings.forEach((warning, index) => {
    notes.push({
      title: `Review ${index + 1}`,
      message: warning,
    });
  });

  if (
    result.output.includes("unknown") ||
    result.output.includes("any")
  ) {
    notes.push({
      title: "Fallback types are present",
      message:
        "The generated output includes unconstrained fallback types. Tighten those fields manually when your application knows more about the real data shape.",
    });
  }

  if (result.output.includes("[key: string]")) {
    notes.push({
      title: "String index signature generated",
      message:
        "At least one object permits additional keys. Review typed additionalProperties warnings because TypeScript index signatures are broader than JSON Schema's exact extra-key semantics.",
    });
  }

  return notes;
}
