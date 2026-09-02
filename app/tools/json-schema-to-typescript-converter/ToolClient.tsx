"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputStyle = "interface" | "type";
type PropertyStyle = "preserve" | "camel";
type ArrayStyle = "array" | "generic";
type AdditionalMode = "record" | "ignore";

type SchemaNode = SchemaObject | boolean;

type SchemaObject = {
  type?: string | string[];
  title?: string;
  description?: string;
  properties?: Record<string, SchemaNode>;
  required?: string[];
  items?: SchemaNode | SchemaNode[];
  prefixItems?: SchemaNode[];
  additionalItems?: SchemaNode;
  enum?: unknown[];
  const?: unknown;
  anyOf?: SchemaNode[];
  oneOf?: SchemaNode[];
  allOf?: SchemaNode[];
  format?: string;
  additionalProperties?: SchemaNode;
  patternProperties?: Record<string, SchemaNode>;
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
      const parsed = JSON.parse(input) as unknown;

      if (
        parsed !== true &&
        parsed !== false &&
        (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      ) {
        throw new Error("The root JSON Schema must be a schema object, true, or false.");
      }

      const schema = parsed as SchemaNode;
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
      description="Convert practical JSON Schema structures into TypeScript interfaces or type aliases, resolve local JSON Pointer references, and surface schema rules that still need runtime validation."
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
          spellCheck={false}
          className="w-full min-h-[420px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste a JSON Schema object or boolean schema. Conversion runs in this browser tab; local <code className="font-mono text-xs">#/$defs/...</code> and <code className="font-mono text-xs">#/definitions/...</code> references can be resolved when present in the same document.
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
              { label: "Add index signature", value: "record" },
              { label: "Ignore", value: "ignore" },
            ]}
          />

          <label className="flex cursor-pointer items-start gap-2 text-sm font-medium text-gray-900 md:col-span-2">
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
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]"
            />

            Include comments from descriptions
          </label>

          <label className="flex cursor-pointer items-start gap-2 text-sm font-medium text-gray-900 md:col-span-2">
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
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]"
            />

            Export generated types
          </label>

          <label className="flex cursor-pointer items-start gap-2 text-sm font-medium text-gray-900 md:col-span-2">
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
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]"
            />

            Use unknown instead of any
          </label>

          <label className="flex cursor-pointer items-start gap-2 text-sm font-medium text-gray-900 md:col-span-2">
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
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]"
            />

            Keep properties optional when <code className="font-mono text-xs">required</code> is missing (JSON Schema default)
          </label>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Preserve property names when the generated type must describe raw JSON directly. Camel-case output is a convenience transformation and is flagged because it changes the contract keys.
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
        <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
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
        <strong>Privacy and scope:</strong> conversion runs in client-side JavaScript and this tool does not send the pasted schema to an application server. Generated TypeScript is a static typing aid, not a runtime validator; keep your JSON Schema validator in the data path when runtime enforcement matters.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            JSON Schema and TypeScript Solve Different Problems
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON Schema describes constraints that can be evaluated against data at runtime. TypeScript describes values to the compiler while you develop, and its types are erased from normal JavaScript output. Converting a schema is therefore a translation of the parts that TypeScript can express, not a replacement for schema validation.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A property with <code className="font-mono text-sm">type: &quot;string&quot;</code> maps naturally to <code className="font-mono text-sm">string</code>. A rule such as <code className="font-mono text-sm">minLength: 3</code>, <code className="font-mono text-sm">pattern</code>, <code className="font-mono text-sm">minimum</code>, or most <code className="font-mono text-sm">format</code> checks does not have an equivalent ordinary TypeScript property type. The converter keeps the useful static shape and reports warnings for important rules that remain runtime concerns.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">How Common Schema Keywords Map</h2>

          <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-gray-50 text-gray-900">
                <tr>
                  <th className="border-b border-gray-200 px-4 py-3 font-semibold">JSON Schema</th>
                  <th className="border-b border-gray-200 px-4 py-3 font-semibold">TypeScript output</th>
                  <th className="border-b border-gray-200 px-4 py-3 font-semibold">Important caveat</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <MappingRow schema="string / boolean" ts="string / boolean" caveat="Validation rules such as pattern or minLength are not enforced by the type." />
                <MappingRow schema="number / integer" ts="number" caveat="TypeScript number does not enforce integer-only values, ranges, or multiples." />
                <MappingRow schema={'type: ["string", "null"]'} ts="string | null" caveat="Nullability is represented only when null is present in the schema type or composition." />
                <MappingRow schema="enum / const" ts="literal union / literal" caveat="Primitive literals map well; complex object or array equality needs manual review." />
                <MappingRow schema="properties + required" ts="object fields + ?" caveat="A property not listed in required is optional under JSON Schema semantics." />
                <MappingRow schema="items" ts="T[] or Array<T>" caveat="Array validation such as minItems and uniqueItems still needs runtime validation." />
                <MappingRow schema="prefixItems" ts="tuple" caveat="Draft 2020-12 tuple prefixes are supported; the items keyword controls the remaining elements." />
                <MappingRow schema="anyOf / oneOf" ts="union" caveat="oneOf's exactly-one-match rule cannot be enforced by a normal TypeScript union." />
                <MappingRow schema="allOf" ts="intersection" caveat="Intersections approximate structural conjunction but do not carry validation-only keywords." />
                <MappingRow schema="$ref to local JSON Pointer" ts="referenced declaration" caveat="External and recursive reference edges can require a fallback and are reported." />
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Required, Optional, and Nullable Are Separate Ideas
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            In JSON Schema, <code className="font-mono text-sm">required</code> controls whether an object member must exist. It does not make the value non-null. A field can be required and still allow <code className="font-mono text-sm">null</code> when its schema includes the null type. Conversely, an optional property can have a non-null string type when present.
          </p>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">{`Schema
{
  "type": "object",
  "required": ["name", "nickname"],
  "properties": {
    "name": { "type": "string" },
    "nickname": { "type": ["string", "null"] },
    "bio": { "type": "string" }
  }
}

TypeScript
interface GeneratedType {
  name: string;
  nickname: string | null;
  bio?: string;
  // an index signature may also appear when extra keys are modeled
}`}</pre>
          </div>

          <p className="mt-4 text-gray-600 leading-relaxed">
            When a schema omits <code className="font-mono text-sm">required</code>, JSON Schema treats the declared properties as optional. The corresponding option is enabled by default. Turning it off is an explicit generator override, not standard JSON Schema behavior.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Local $ref Resolution and Reference Boundaries</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            References beginning with a local JSON Pointer such as <code className="font-mono text-sm">#/$defs/Address</code> or <code className="font-mono text-sm">#/definitions/User</code> are resolved against the schema document you pasted. JSON Pointer escaping for <code className="font-mono text-sm">~0</code> and <code className="font-mono text-sm">~1</code> is handled when walking the document.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            External references such as another file or HTTPS URL are deliberately not fetched by this browser-only converter. A direct recursive reference back to the root can map to the generated root type, while recursive local-definition patterns that cannot be emitted safely are detected and use <code className="font-mono text-sm">unknown</code> or <code className="font-mono text-sm">any</code> at the unsupported recursive edge. Those fallbacks appear in the warning panel before you copy the code.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Draft 2020-12 also allows useful behavior around reference siblings and dynamic references. This converter does not claim full evaluator semantics for those features; it reports unsupported or partially represented cases instead of silently treating generated TypeScript as equivalent validation logic.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Tuple Schemas Depend on the Draft</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Draft 2020-12 uses <code className="font-mono text-sm">prefixItems</code> for positional tuple entries and <code className="font-mono text-sm">items</code> for any remaining entries. For example, two prefix items with <code className="font-mono text-sm">items: false</code> describe a fixed two-element tuple. If <code className="font-mono text-sm">items</code> is omitted or true, additional values remain allowed.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Older schema drafts used an array in <code className="font-mono text-sm">items</code> for tuple positions and <code className="font-mono text-sm">additionalItems</code> for the tail. The converter recognizes that older shape as a compatibility path and emits a warning so you know draft-specific behavior is involved.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">additionalProperties Is Not the Same as an Exact TypeScript Object</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON Schema allows additional object names by default. With <strong>Add index signature</strong> selected, the converter makes that openness visible with a string index signature. If <code className="font-mono text-sm">additionalProperties</code> contains its own schema, that value type is included too.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            There is no perfect ordinary TypeScript equivalent for “these known properties have their own types, while every other string key must satisfy another schema.” An index signature must also be compatible with the declared properties, so the generated signature may be broader than the JSON Schema rule. The converter warns when it has to make that compromise.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Likewise, <code className="font-mono text-sm">additionalProperties: false</code> is a runtime validation rule. TypeScript performs excess-property checks in some object-literal situations, but its structural type system does not universally guarantee JSON Schema-style object exactness after values flow through variables or other types.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Why Camel-Casing Property Names Is Flagged</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A schema property named <code className="font-mono text-sm">user-id</code> describes a JSON key literally named <code className="font-mono text-sm">user-id</code>. Changing the generated property to <code className="font-mono text-sm">userId</code> is not only formatting; it changes the shape being described. Keep <strong>Preserve</strong> when the type is meant to model parsed JSON directly. Use camel case only when another layer in your application transforms the keys, and review collision warnings such as two source keys that normalize to the same name.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Validation Keywords That Stay at Runtime</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            TypeScript can represent broad shapes, unions, intersections, optional members, tuples, and literal values, but ordinary types do not validate most JSON Schema assertions. Examples include numeric limits, string length and regex patterns, array uniqueness and size, conditional schemas, dependencies, property-name patterns, content annotations, and unevaluated-item/property rules.
          </p>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li><strong>format:</strong> an email or URI schema still becomes <code className="font-mono text-xs">string</code>; whether format is asserted depends on your JSON Schema implementation and vocabulary.</li>
              <li><strong>integer:</strong> becomes <code className="font-mono text-xs">number</code>; TypeScript does not reject 1.5 merely because the source schema said integer.</li>
              <li><strong>pattern:</strong> the regex constraint is not encoded into a normal string type.</li>
              <li><strong>minimum / maximum:</strong> numeric bounds require runtime checking.</li>
              <li><strong>uniqueItems:</strong> a TypeScript array type cannot guarantee value uniqueness.</li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Boolean Schemas: true and false</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON Schema permits a schema itself to be the boolean value <code className="font-mono text-sm">true</code> or <code className="font-mono text-sm">false</code>. A true schema accepts every instance, so this converter maps it to the selected fallback type—<code className="font-mono text-sm">unknown</code> by default. A false schema accepts no instance and maps naturally to TypeScript <code className="font-mono text-sm">never</code>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">A Safer Production Workflow</h2>

          <ol className="mt-4 list-decimal space-y-3 pl-6 text-gray-600 leading-relaxed">
            <li>Validate that the source document is the JSON Schema draft and dialect your system actually uses.</li>
            <li>Generate TypeScript with property names preserved unless your runtime transforms the data.</li>
            <li>Read every warning, especially references, composition keywords, additional properties, and validation-only rules.</li>
            <li>Compile the generated declarations in the real project with its actual TypeScript settings.</li>
            <li>Keep runtime JSON Schema validation at trust boundaries such as API input, config loading, queues, files, or third-party responses.</li>
            <li>Regenerate or diff the TypeScript when the authoritative schema changes so the static model does not drift.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Official References</h2>

          <ul className="mt-4 space-y-3 text-gray-600">
            <li>
              <a
                href="https://json-schema.org/draft/2020-12"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--green)] underline underline-offset-4"
              >
                JSON Schema — Draft 2020-12 specification documents
              </a>
            </li>
            <li>
              <a
                href="https://json-schema.org/specification"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--green)] underline underline-offset-4"
              >
                JSON Schema — specification overview
              </a>
            </li>
            <li>
              <a
                href="https://www.typescriptlang.org/docs/handbook/2/everyday-types.html"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--green)] underline underline-offset-4"
              >
                TypeScript Handbook — everyday types, unions, aliases, and interfaces
              </a>
            </li>
            <li>
              <a
                href="https://www.typescriptlang.org/docs/handbook/2/objects.html"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--green)] underline underline-offset-4"
              >
                TypeScript Handbook — object types and property modifiers
              </a>
            </li>
          </ul>
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

function MappingRow({
  schema,
  ts,
  caveat,
}: {
  schema: string;
  ts: string;
  caveat: string;
}) {
  return (
    <tr>
      <td className="border-b border-gray-100 px-4 py-3 font-mono text-gray-900">{schema}</td>
      <td className="border-b border-gray-100 px-4 py-3 font-mono">{ts}</td>
      <td className="border-b border-gray-100 px-4 py-3">{caveat}</td>
    </tr>
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
  rootSchema: SchemaNode;
  rootTypeName: string;
  refCache: Map<string, string>;
  resolvingRefs: Set<string>;
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
    rootSchema: schema,
    rootTypeName: "GeneratedType",
    refCache: new Map<string, string>(),
    resolvingRefs: new Set<string>(),
    counters: {
      typeCount: 0,
      interfaceCount: 0,
      enumCount: 0,
    },
  };
  const schemaTitle = typeof schema === "object" && schema.title ? schema.title : "";
  const rootTypeName = cleanTypeName(options.rootName.trim() || schemaTitle || "GeneratedType");
  context.rootTypeName = rootTypeName;
  context.usedNames.add(rootTypeName);

  if (options.propertyStyle === "camel") {
    pushWarning(
      context,
      "Property-name conversion changes the keys described by the schema. Camel-case output does not directly describe raw JSON unless your application also transforms those keys."
    );
  }

  collectUnsupportedKeywordWarnings(schema, context);
  const rootType = schemaToTs(schema, rootTypeName, context, 0);
  const prefix = options.exportTypes ? "export " : "";
  const rootComment =
    options.includeComments && typeof schema === "object" && schema.description
      ? `/** ${formatComment(String(schema.description))} */\n`
      : "";

  if (isObjectBody(rootType) && options.outputStyle === "interface") {
    context.declarations.unshift(`${rootComment}${prefix}interface ${rootTypeName} ${rootType}`);
    context.counters.interfaceCount += 1;
  } else if (!context.declarations.some((item) => item.includes(` ${rootTypeName} `))) {
    context.declarations.unshift(`${rootComment}${prefix}type ${rootTypeName} = ${rootType};`);
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
  if (depth > 40) {
    pushWarning(context, `Schema nesting is too deep near ${nameHint}. A fallback type was used.`);
    return fallbackType(context);
  }

  if (schema === true) {
    return fallbackType(context);
  }

  if (schema === false) {
    return "never";
  }

  if (schema.$ref) {
    const siblingKeys = Object.keys(schema).filter(
      (key) =>
        ![
          "$ref",
          "$schema",
          "$id",
          "$anchor",
          "$comment",
          "title",
          "description",
          "default",
          "examples",
          "deprecated",
          "readOnly",
          "writeOnly",
          "$defs",
          "definitions",
          "$vocabulary",
        ].includes(key)
    );

    if (siblingKeys.length > 0) {
      pushWarning(
        context,
        `Reference ${schema.$ref} has sibling schema keywords (${siblingKeys.join(", ")}). This converter resolves the reference but does not intersect sibling constraints with it.`
      );
    }

    return refToType(schema.$ref, context, depth);
  }

  if (schema.const !== undefined) {
    if (schema.const && typeof schema.const === "object") {
      pushWarning(
        context,
        `Complex const value near ${nameHint} is reduced to a fallback type because TypeScript cannot express JSON Schema deep-equality validation exactly.`
      );
    }
    return literalType(schema.const);
  }

  if (schema.enum) {
    context.counters.enumCount += 1;
    if (schema.enum.some((value) => value !== null && typeof value === "object")) {
      pushWarning(
        context,
        `Complex enum value near ${nameHint} is reduced to a fallback type. Review object or array enum members manually.`
      );
    }
    return schema.enum.map(literalType).join(" | ") || fallbackType(context);
  }

  if (schema.anyOf || schema.oneOf) {
    const list = schema.anyOf || schema.oneOf || [];
    const keyword = schema.oneOf ? "oneOf" : "anyOf";
    const siblingKeys = schemaSiblingConstraintKeys(schema, ["anyOf", "oneOf"]);

    if (siblingKeys.length > 0) {
      pushWarning(
        context,
        `${keyword} near ${nameHint} has sibling schema keywords (${siblingKeys.join(", ")}). The generated union does not intersect those sibling constraints.`
      );
    }

    if (list.length === 0) {
      pushWarning(context, `${keyword} is empty near ${nameHint}. A fallback type was used.`);
      return fallbackType(context);
    }

    if (schema.oneOf) {
      pushWarning(
        context,
        "oneOf is represented as a TypeScript union. TypeScript does not enforce JSON Schema's exactly-one-subschema validation rule."
      );
    }

    return list
      .map((item, index) => schemaToTs(item, `${nameHint}${index + 1}`, context, depth + 1))
      .join(" | ");
  }

  if (schema.allOf) {
    const siblingKeys = schemaSiblingConstraintKeys(schema, ["allOf"]);

    if (siblingKeys.length > 0) {
      pushWarning(
        context,
        `allOf near ${nameHint} has sibling schema keywords (${siblingKeys.join(", ")}). The generated intersection does not separately apply those sibling constraints.`
      );
    }

    if (schema.allOf.length === 0) {
      pushWarning(context, `allOf is empty near ${nameHint}. A fallback type was used.`);
      return fallbackType(context);
    }

    pushWarning(
      context,
      "allOf is represented as a TypeScript intersection. Validation-only constraints inside the subschemas still require runtime validation."
    );

    return schema.allOf
      .map((item, index) => schemaToTs(item, `${nameHint}${index + 1}`, context, depth + 1))
      .join(" & ");
  }

  const schemaType =
    schema.type ||
    (schema.properties ||
    schema.required ||
    schema.additionalProperties !== undefined ||
    schema.patternProperties
      ? "object"
      : schema.items !== undefined || schema.prefixItems !== undefined
      ? "array"
      : "unknown");

  if (Array.isArray(schemaType)) {
    return [...new Set(schemaType)]
      .map((item) => typeToTs(item, schema, nameHint, context, depth))
      .join(" | ");
  }

  return typeToTs(schemaType, schema, nameHint, context, depth);
}

function typeToTs(
  type: string,
  schema: SchemaObject,
  nameHint: string,
  context: ConvertContext,
  depth: number
): string {
  if (type === "object") {
    if (
      (!schema.properties || Object.keys(schema.properties).length === 0) &&
      schema.additionalProperties === false &&
      !schema.patternProperties
    ) {
      pushWarning(
        context,
        `Object ${nameHint} disallows additional properties. TypeScript cannot enforce JSON Schema object exactness in every assignment context.`
      );
      return "Record<string, never>";
    }

    return objectToTs(schema, nameHint, context, depth);
  }

  if (type === "array") {
    if (Array.isArray(schema.prefixItems) && schema.prefixItems.length > 0) {
      const parts = schema.prefixItems.map((item, index) =>
        schemaToTs(item, `${nameHint}Item${index + 1}`, context, depth + 1)
      );

      if (schema.items === false) {
        return `[${parts.join(", ")}]`;
      }

      let restType: string;

      if (schema.items === undefined || schema.items === true) {
        restType = fallbackType(context);
      } else if (Array.isArray(schema.items)) {
        pushWarning(
          context,
          `Array ${nameHint} mixes prefixItems with legacy array-form items. A fallback rest type was used.`
        );
        restType = fallbackType(context);
      } else {
        restType = schemaToTs(schema.items, `${nameHint}RestItem`, context, depth + 1);
      }

      return `[${parts.join(", ")}, ...${wrapArrayItem(restType)}[]]`;
    }

    if (Array.isArray(schema.items)) {
      if (schema.items.length === 0) {
        if (schema.additionalItems === false) {
          return "[]";
        }

        const legacyRest =
          schema.additionalItems === undefined || schema.additionalItems === true
            ? fallbackType(context)
            : schemaToTs(schema.additionalItems, `${nameHint}AdditionalItem`, context, depth + 1);

        pushWarning(
          context,
          `Legacy empty tuple-style items array was found near ${nameHint}. Additional items remain allowed unless additionalItems is false.`
        );
        return context.arrayStyle === "generic"
          ? `Array<${legacyRest}>`
          : `${wrapArrayItem(legacyRest)}[]`;
      }

      pushWarning(
        context,
        `Legacy tuple-style items array was generated near ${nameHint}. Draft 2020-12 uses prefixItems for positional tuple schemas.`
      );

      const parts = schema.items.map((item, index) =>
        schemaToTs(item, `${nameHint}Item${index + 1}`, context, depth + 1)
      );

      if (schema.additionalItems === false) {
        return `[${parts.join(", ")}]`;
      }

      const restType =
        schema.additionalItems === undefined || schema.additionalItems === true
          ? fallbackType(context)
          : schemaToTs(schema.additionalItems, `${nameHint}AdditionalItem`, context, depth + 1);

      return `[${parts.join(", ")}, ...${wrapArrayItem(restType)}[]]`;
    }

    if (schema.items === false) {
      return "[]";
    }

    const itemType =
      schema.items === undefined || schema.items === true
        ? fallbackType(context)
        : schemaToTs(schema.items, `${nameHint}Item`, context, depth + 1);

    return context.arrayStyle === "generic"
      ? `Array<${itemType}>`
      : `${wrapArrayItem(itemType)}[]`;
  }

  if (type === "integer") {
    pushWarning(
      context,
      "JSON Schema integer is mapped to TypeScript number. TypeScript does not enforce integer-only values or numeric ranges."
    );
    return "number";
  }

  if (type === "number") {
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

  pushWarning(context, `Schema type ${JSON.stringify(type)} near ${nameHint} is not mapped. A fallback type was used.`);
  return fallbackType(context);
}

function objectToTs(
  schema: SchemaObject,
  nameHint: string,
  context: ConvertContext,
  depth: number
): string {
  const properties = schema.properties || {};
  const required = new Set(schema.required || []);
  const lines: string[] = ["{"];
  const generatedKeys = new Set<string>();
  const knownPropertyTypes: string[] = [];
  let hasOptionalProperties = false;

  Object.entries(properties).forEach(([rawKey, childSchema]) => {
    const preferredKey = context.propertyStyle === "camel" ? toCamelCase(rawKey) : rawKey;
    const key = generatedKeys.has(preferredKey) ? rawKey : preferredKey;

    if (generatedKeys.has(preferredKey)) {
      pushWarning(
        context,
        `Property name conversion created a collision for ${rawKey} in ${nameHint}. The original key was preserved.`
      );
    }

    generatedKeys.add(key);
    const safeKey = formatPropertyName(key);
    const isOptional = shouldOptional(rawKey, required, schema, context);
    const optional = isOptional ? "?" : "";
    if (isOptional) hasOptionalProperties = true;

    const childName = cleanTypeName(`${nameHint}${capitalize(key)}`);
    const childType = schemaToTs(childSchema, childName, context, depth + 1);
    knownPropertyTypes.push(childType);
    const description = typeof childSchema === "object" ? childSchema.description : undefined;
    const comment =
      context.includeComments && description
        ? `  /** ${formatComment(String(description))} */\n`
        : "";

    lines.push(`${comment}  ${safeKey}${optional}: ${childType};`);
  });

  const requiredWithoutProperty = [...required].filter((key) => !(key in properties));
  if (requiredWithoutProperty.length > 0) {
    pushWarning(
      context,
      `Required name${requiredWithoutProperty.length === 1 ? "" : "s"} ${requiredWithoutProperty
        .map((key) => JSON.stringify(key))
        .join(", ")} in ${nameHint} do not have a matching properties schema and are not emitted as explicit fields.`
    );
  }

  if (schema.patternProperties && Object.keys(schema.patternProperties).length > 0) {
    pushWarning(
      context,
      `patternProperties near ${nameHint} is not converted to a TypeScript index signature because regular-expression key constraints cannot be represented precisely.`
    );
  }

  if (schema.additionalProperties !== false && context.additionalMode === "record") {
    const additionalType =
      schema.additionalProperties === undefined || schema.additionalProperties === true
        ? fallbackType(context)
        : schemaToTs(schema.additionalProperties, `${nameHint}Value`, context, depth + 1);

    const indexMembers = [additionalType, ...knownPropertyTypes];
    if (hasOptionalProperties) indexMembers.push("undefined");
    const indexType =
      additionalType === "unknown" || additionalType === "any"
        ? additionalType
        : [...new Set(indexMembers)].join(" | ");
    lines.push(`  [key: string]: ${indexType};`);

    if (schema.additionalProperties && typeof schema.additionalProperties === "object" && knownPropertyTypes.length > 0) {
      pushWarning(
        context,
        `The index signature for ${nameHint} includes known property types so the generated TypeScript remains assignable. This is broader than JSON Schema's additionalProperties rule for unknown keys.`
      );
    }
  } else if (schema.additionalProperties !== false && context.additionalMode === "ignore") {
    pushWarning(
      context,
      `Additional object keys are allowed by ${nameHint}'s schema but are not modeled because Extra Object Keys is set to Ignore.`
    );
  }

  if (schema.additionalProperties === false) {
    pushWarning(
      context,
      `Object ${nameHint} sets additionalProperties to false. TypeScript's structural type system and excess-property checks do not provide the same runtime exactness guarantee.`
    );
  }

  if (
    Object.keys(properties).length === 0 &&
    schema.additionalProperties === undefined &&
    context.additionalMode === "ignore"
  ) {
    lines.push(`  [key: string]: ${fallbackType(context)};`);
    pushWarning(
      context,
      `Object ${nameHint} has no declared properties. A fallback index signature was kept to avoid generating TypeScript's overly broad empty-object type.`
    );
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

function shouldOptional(
  key: string,
  required: Set<string>,
  schema: SchemaObject,
  context: ConvertContext
) {
  if (!schema.required) {
    return context.optionalWhenRequiredMissing;
  }

  return !required.has(key);
}

function refToType(ref: string, context: ConvertContext, depth: number) {
  const cached = context.refCache.get(ref);
  if (cached) return cached;

  if (ref === "#") {
    if (depth === 0) {
      pushWarning(
        context,
        "The root schema directly references itself. A fallback type was used to avoid generating a circular type alias."
      );
      return fallbackType(context);
    }
    return context.rootTypeName;
  }

  if (!ref.startsWith("#/")) {
    pushWarning(
      context,
      `External or non-pointer reference ${ref} is not resolved. A fallback type was used.`
    );
    return fallbackType(context);
  }

  if (context.resolvingRefs.has(ref)) {
    pushWarning(
      context,
      `Recursive reference ${ref} was detected. Recursive declarations are not generated by this converter, so a fallback type was used at the recursive edge.`
    );
    return fallbackType(context);
  }

  const target = resolveLocalRef(context.rootSchema, ref);
  if (target === undefined) {
    pushWarning(context, `Local reference ${ref} could not be resolved. A fallback type was used.`);
    return fallbackType(context);
  }

  const lastSegment = ref.split("/").filter(Boolean).pop() || "ReferencedType";
  const nameHint = cleanTypeName(decodeJsonPointerSegment(lastSegment));
  context.resolvingRefs.add(ref);
  const resolved = schemaToTs(target, nameHint, context, depth + 1);
  context.resolvingRefs.delete(ref);
  context.refCache.set(ref, resolved);
  return resolved;
}

function resolveLocalRef(root: SchemaNode, ref: string): SchemaNode | undefined {
  const segments = ref
    .slice(2)
    .split("/")
    .map(decodeJsonPointerSegment);

  let current: unknown = root;

  for (const segment of segments) {
    if (!current || typeof current !== "object" || Array.isArray(current)) return undefined;
    current = (current as Record<string, unknown>)[segment];
  }

  if (current === true || current === false) return current;
  if (current && typeof current === "object" && !Array.isArray(current)) return current as SchemaObject;
  return undefined;
}

function decodeJsonPointerSegment(value: string) {
  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    // Keep the raw fragment segment when percent-decoding fails.
  }
  return decoded.replace(/~1/g, "/").replace(/~0/g, "~");
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

function formatComment(value: string) {
  return value
    .replace(/\*\//g, "* /")
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function collectUnsupportedKeywordWarnings(schema: SchemaNode, context: ConvertContext) {
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
    "minItems",
    "maxItems",
    "uniqueItems",
    "contains",
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
    "patternProperties",
    "$dynamicRef",
    "$dynamicAnchor",
    "minContains",
    "maxContains",
    "contentEncoding",
    "contentMediaType",
    "contentSchema",
  ];
  const found = new Set<string>();
  const seen = new WeakSet<object>();

  const visit = (value: unknown) => {
    if (!value || typeof value !== "object" || Array.isArray(value) || seen.has(value as object)) {
      if (Array.isArray(value)) {
        value.forEach(visit);
      }
      return;
    }

    seen.add(value as object);
    const record = value as Record<string, unknown>;

    validationOnlyKeywords.forEach((keyword) => {
      if (keyword in record) {
        found.add(keyword);
      }
    });

    Object.values(record).forEach(visit);
  };

  visit(schema);

  if (found.size > 0) {
    pushWarning(
      context,
      `Schema keywords not represented precisely in TypeScript: ${Array.from(found).sort().join(", ")}.`
    );
  }
}

function schemaSiblingConstraintKeys(schema: SchemaObject, excluded: string[]) {
  const metadataKeys = new Set([
    "$schema",
    "$id",
    "$anchor",
    "$comment",
    "title",
    "description",
    "default",
    "examples",
    "deprecated",
    "readOnly",
    "writeOnly",
    "$defs",
    "definitions",
    "$vocabulary",
    ...excluded,
  ]);

  return Object.keys(schema).filter((key) => !metadataKeys.has(key));
}

function pushWarning(context: { warnings: string[] }, message: string) {
  if (!context.warnings.includes(message)) {
    context.warnings.push(message);
  }
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
