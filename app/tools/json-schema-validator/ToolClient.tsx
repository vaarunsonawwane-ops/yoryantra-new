"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

const MAX_INPUT_CHARS = 2_000_000;
const MAX_JSON_DEPTH = 120;
const MAX_VALIDATION_EVALUATIONS = 200_000;
const MAX_REPORTED_ISSUES = 200;
const MAX_PATTERN_LENGTH = 500;
const DRAFT_2020_12 = "https://json-schema.org/draft/2020-12/schema";

const exampleInstance = `{
  "name": "Sneha",
  "role": "developer",
  "skills": ["TypeScript", "SQL"],
  "profile": {
    "active": true
  }
}`;

const exampleSchema = `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["name", "skills"],
  "properties": {
    "name": {
      "type": "string",
      "minLength": 2
    },
    "role": {
      "enum": ["developer", "designer"]
    },
    "skills": {
      "type": "array",
      "minItems": 1,
      "uniqueItems": true,
      "items": {
        "type": "string"
      }
    },
    "profile": {
      "$ref": "#/$defs/profile"
    }
  },
  "$defs": {
    "profile": {
      "type": "object",
      "required": ["active"],
      "properties": {
        "active": { "type": "boolean" }
      },
      "additionalProperties": false
    }
  },
  "additionalProperties": false
}`;

type JSONValue =
  | null
  | boolean
  | number
  | string
  | JSONValue[]
  | { [key: string]: JSONValue };

type JSONSchema = boolean | SchemaObject;
type SchemaObject = Record<string, unknown>;

type ValidationIssue = {
  path: string;
  keyword: string;
  message: string;
};

type ValidationSummary = {
  valid: boolean;
  issueCount: number;
  evaluations: number;
  bomRemoved: boolean;
  notes: string[];
};

type ValidationContext = {
  rootSchema: JSONSchema;
  evaluations: number;
  activeRefs: Set<string>;
};

class ValidationLimitError extends Error {}

export default function ToolClient() {
  const [jsonInput, setJsonInput] = useState("");
  const [schemaInput, setSchemaInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<ValidationSummary | null>(null);
  const [copied, setCopied] = useState(false);

  const statusText = useMemo(() => {
    if (!summary) return "";
    if (summary.valid) return "Passed supported assertions";
    return `${summary.issueCount} validation ${summary.issueCount === 1 ? "failure" : "failures"}`;
  }, [summary]);

  const validateSchema = () => {
    try {
      if (!jsonInput.trim()) throw new Error("Enter a JSON instance before validating.");
      if (!schemaInput.trim()) throw new Error("Enter a JSON Schema before validating.");
      if (jsonInput.length > MAX_INPUT_CHARS) {
        throw new Error(`JSON instance exceeds the ${MAX_INPUT_CHARS.toLocaleString()}-character browser limit.`);
      }
      if (schemaInput.length > MAX_INPUT_CHARS) {
        throw new Error(`JSON Schema exceeds the ${MAX_INPUT_CHARS.toLocaleString()}-character browser limit.`);
      }

      const normalizedInstance = stripLeadingBom(jsonInput);
      const normalizedSchema = stripLeadingBom(schemaInput);

      assertLosslessJsonText(normalizedInstance.text, "JSON instance");
      assertLosslessJsonText(normalizedSchema.text, "JSON Schema");

      const instance = JSON.parse(normalizedInstance.text) as JSONValue;
      const schema = JSON.parse(normalizedSchema.text) as unknown;
      if (!isJsonSchema(schema)) {
        throw new Error("A JSON Schema must be an object or the boolean value true or false.");
      }

      const schemaNotes = inspectSchemaDefinition(schema);
      const context: ValidationContext = {
        rootSchema: schema,
        evaluations: 0,
        activeRefs: new Set<string>(),
      };
      const issues = validateValue(instance, schema, "$", context).slice(0, MAX_REPORTED_ISSUES);
      const truncated = issues.length >= MAX_REPORTED_ISSUES;

      if (issues.length === 0) {
        setOutput("Validation passed for every supported Draft 2020-12 assertion in this schema.");
      } else {
        const lines = issues.map(
          (issue, index) => `${index + 1}. ${issue.path} — ${issue.keyword}: ${issue.message}`
        );
        if (truncated) {
          lines.push(`\nOnly the first ${MAX_REPORTED_ISSUES} failures are shown.`);
        }
        setOutput(`Validation failed:\n\n${lines.join("\n")}`);
      }

      const notes = [...schemaNotes];
      if (normalizedInstance.bomRemoved || normalizedSchema.bomRemoved) {
        notes.push("A leading UTF-8 BOM marker was removed before parsing.");
      }

      setSummary({
        valid: issues.length === 0,
        issueCount: issues.length,
        evaluations: context.evaluations,
        bomRemoved: normalizedInstance.bomRemoved || normalizedSchema.bomRemoved,
        notes,
      });
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to validate this instance and schema safely.");
      setOutput("");
      setSummary(null);
      setCopied(false);
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("Copy failed. Select the validation result and copy it manually.");
    }
  };

  const loadExample = () => {
    setJsonInput(exampleInstance);
    setSchemaInput(exampleSchema);
    setOutput("");
    setError("");
    setSummary(null);
    setCopied(false);
  };

  const resetAll = () => {
    setJsonInput("");
    setSchemaInput("");
    setOutput("");
    setError("");
    setSummary(null);
    setCopied(false);
  };

  return (
    <ToolShell
      title="JSON Schema Validator"
      description="Check JSON instances against a careful Draft 2020-12 subset with path-level failures."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="min-w-0">
          <label className="mb-2 block text-sm font-medium text-gray-700">JSON instance</label>
          <textarea
            value={jsonInput}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setJsonInput(event.target.value)}
            spellCheck={false}
            placeholder={`{
  "name": "Sneha",
  "active": true
}`}
            className="w-full min-h-[280px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          />
        </div>

        <div className="min-w-0">
          <label className="mb-2 block text-sm font-medium text-gray-700">JSON Schema</label>
          <textarea
            value={schemaInput}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setSchemaInput(event.target.value)}
            spellCheck={false}
            placeholder={`{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["name"]
}`}
            className="w-full min-h-[280px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={validateSchema} className="yoryantra-btn min-h-10 whitespace-nowrap">
          Validate JSON
        </button>
        <button onClick={loadExample} className="yoryantra-btn-outline min-h-10 whitespace-nowrap">
          Load Example
        </button>
        <button onClick={resetAll} className="yoryantra-btn-outline min-h-10 whitespace-nowrap">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700 overflow-auto">
          {error}
        </div>
      )}

      {summary && (
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Metric label="Result" value={statusText} />
          <Metric label="Assertions evaluated" value={summary.evaluations.toLocaleString()} />
          <Metric label="Reported failures" value={summary.issueCount.toLocaleString()} />
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Validation result</h2>
          {output && (
            <button
              onClick={copyOutput}
              className="yoryantra-btn-outline min-h-10 whitespace-nowrap text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
        <div className="yoryantra-output min-h-[180px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {output || "Path-level validation failures will appear here."}
        </div>
      </div>

      {summary && summary.notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 self-start">
          <div className="font-semibold text-gray-900">Dialect notes</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 leading-relaxed">
            {summary.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2 items-start">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 self-start">
          <h2 className="text-sm font-semibold text-gray-900">Browser-side boundary</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            Instance and schema text are parsed and validated by this page. The component does not send either input to a validation API. Copy only writes the result to your browser clipboard when you press Copy.
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 self-start">
          <h2 className="text-sm font-semibold text-amber-950">Not a full JSON Schema implementation</h2>
          <p className="mt-2 text-sm leading-relaxed text-amber-900">
            Validation follows Draft 2020-12 semantics only for the keywords listed below. Dynamic references, unevaluated* keywords, custom vocabularies, external references, and format assertions are outside this browser implementation. Use a standards-compliant library for release gates or schemas that depend on those features.
          </p>
        </div>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Valid JSON can still be the wrong data</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON syntax answers one question: can the text be parsed? A schema answers different questions: must an object contain a particular member, may an array contain only strings, is a number inside an accepted range, or can extra properties appear at all?
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A failed path points to the instance location that broke an assertion. That distinction matters when a payload is syntactically fine but an API, configuration loader, or test fixture still rejects its shape.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What is evaluated here</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 items-start">
            <InfoCard
              title="Values and scalars"
              text="type, enum, const, minimum, maximum, exclusiveMinimum, exclusiveMaximum, multipleOf, minLength, maxLength, and Unicode-aware pattern checks."
            />
            <InfoCard
              title="Objects"
              text="required, properties, patternProperties, additionalProperties as a boolean or subschema, propertyNames, minProperties, maxProperties, dependentRequired, and dependentSchemas."
            />
            <InfoCard
              title="Arrays"
              text="prefixItems, items, contains, minContains, maxContains, minItems, maxItems, and uniqueItems without changing array order."
            />
            <InfoCard
              title="Schema composition"
              text="allOf, anyOf, oneOf, not, if/then/else, boolean schemas, $defs, and local JSON Pointer $ref values such as #/$defs/address."
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">The schema is checked before the instance</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A validator should not quietly interpret malformed schema keywords. This page rejects the wrong keyword types, negative length limits, duplicate required names, invalid regular expressions, non-positive multipleOf values, unsupported dialect declarations, unresolved local references, and features whose validation meaning it cannot implement faithfully.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            It also stops duplicate JSON member names and conservatively rejects numbers that JavaScript would not preserve safely. Otherwise JSON.parse could discard a duplicate member or round a precision-sensitive value before schema evaluation even begins.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Draft 2020-12 changed how tuple arrays are written</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            In Draft 2020-12, <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">prefixItems</code> describes positional tuple entries and <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">items</code> applies to entries after that prefix. Older drafts used the <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">items</code>/<code className="rounded bg-gray-100 px-1 py-0.5 text-sm">additionalItems</code> pairing differently, which is why this page rejects schemas that explicitly declare an older dialect rather than guessing at their meaning.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">String length is not JavaScript string.length</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            JavaScript counts UTF-16 code units. JSON Schema length assertions count JSON string characters, so supplementary Unicode characters must not be counted twice. The validator counts Unicode code points for minLength and maxLength rather than using the raw JavaScript length property.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">References deliberately stop at the browser boundary</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Local references such as <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">#/$defs/profile</code> are resolved inside the pasted schema. Remote URLs and named anchors are rejected instead of being fetched or silently ignored. That keeps validation deterministic and avoids making network requests just because a pasted schema contains a reference.
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 self-start">
          <h2 className="text-lg font-semibold text-amber-950">Regular expressions deserve caution</h2>
          <p className="mt-3 text-sm leading-relaxed text-amber-900">
            Draft 2020-12 patterns use ECMA-262-style regular expressions and are not implicitly anchored. JavaScript cannot reliably time-box a pathological regular expression on the main thread, so schemas from untrusted sources can still create expensive pattern work. Pattern length is capped here, but that is not a complete ReDoS defense.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Where the specification draws the line</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON Schema’s current published version is Draft 2020-12. The official validation specification defines assertions such as type, numeric bounds, string lengths, array limits, required members, and dependentRequired; the core specification defines applicators and reference behavior. For a production validator, those documents and the official meta-schema are the source of truth.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            Official references:{" "}
            <a
              href="https://json-schema.org/draft/2020-12/json-schema-validation"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-2"
            >
              Draft 2020-12 Validation
            </a>{" "}
            and{" "}
            <a
              href="https://json-schema.org/draft/2020-12/json-schema-core"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-2"
            >
              Draft 2020-12 Core
            </a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/json-schema-validator" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 self-start">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 break-words text-sm font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 self-start">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{text}</p>
    </div>
  );
}

function validateValue(
  value: JSONValue,
  schema: JSONSchema,
  path: string,
  context: ValidationContext
): ValidationIssue[] {
  context.evaluations += 1;
  if (context.evaluations > MAX_VALIDATION_EVALUATIONS) {
    throw new ValidationLimitError(
      `Validation exceeded ${MAX_VALIDATION_EVALUATIONS.toLocaleString()} schema evaluations. Reduce the data or schema complexity.`
    );
  }

  if (schema === true) return [];
  if (schema === false) {
    return [issue(path, "false schema", "the boolean schema false rejects every instance")];
  }

  const issues: ValidationIssue[] = [];

  if (typeof schema.$ref === "string") {
    const refKey = `${path}|${schema.$ref}`;
    if (context.activeRefs.has(refKey)) {
      throw new Error(`Circular local $ref ${schema.$ref} re-entered the same instance location ${path}.`);
    }
    context.activeRefs.add(refKey);
    try {
      const target = resolveLocalRef(schema.$ref, context.rootSchema);
      pushIssues(issues, validateValue(value, target, path, context));
    } finally {
      context.activeRefs.delete(refKey);
    }
  }

  if (schema.type !== undefined) {
    const allowed = Array.isArray(schema.type) ? schema.type : [schema.type];
    const actual = valueType(value);
    const matched = allowed.some(
      (expected) =>
        expected === actual ||
        (expected === "number" && (actual === "number" || actual === "integer"))
    );
    if (!matched) {
      pushIssue(issues, issue(path, "type", `expected ${allowed.join(" or ")}, received ${actual}`));
      return issues;
    }
  }

  if (Array.isArray(schema.enum) && !schema.enum.some((candidate) => deepEqual(candidate as JSONValue, value))) {
    pushIssue(issues, issue(path, "enum", "value is not one of the allowed enum members"));
  }

  if (Object.prototype.hasOwnProperty.call(schema, "const") && !deepEqual(schema.const as JSONValue, value)) {
    pushIssue(issues, issue(path, "const", "value does not equal the required const value"));
  }

  if (typeof value === "number") {
    validateNumber(value, schema, path, issues);
  }

  if (typeof value === "string") {
    validateString(value, schema, path, issues);
  }

  if (Array.isArray(value)) {
    validateArray(value, schema, path, context, issues);
  }

  if (isPlainJsonObject(value)) {
    validateObject(value, schema, path, context, issues);
  }

  if (Array.isArray(schema.allOf)) {
    schema.allOf.forEach((subschema) => {
      pushIssues(issues, validateValue(value, subschema as JSONSchema, path, context));
    });
  }

  if (Array.isArray(schema.anyOf)) {
    const matches = schema.anyOf.filter(
      (subschema) => validateValue(value, subschema as JSONSchema, path, context).length === 0
    ).length;
    if (matches === 0) {
      pushIssue(issues, issue(path, "anyOf", "value does not satisfy any listed subschema"));
    }
  }

  if (Array.isArray(schema.oneOf)) {
    const matches = schema.oneOf.filter(
      (subschema) => validateValue(value, subschema as JSONSchema, path, context).length === 0
    ).length;
    if (matches !== 1) {
      pushIssue(issues, issue(path, "oneOf", `value must satisfy exactly one subschema; matched ${matches}`));
    }
  }

  if (isJsonSchema(schema.not) && validateValue(value, schema.not, path, context).length === 0) {
    pushIssue(issues, issue(path, "not", "value satisfies the prohibited subschema"));
  }

  if (isJsonSchema(schema.if)) {
    const conditionMatches = validateValue(value, schema.if, path, context).length === 0;
    if (conditionMatches && isJsonSchema(schema.then)) {
      pushIssues(issues, validateValue(value, schema.then, path, context));
    } else if (!conditionMatches && isJsonSchema(schema.else)) {
      pushIssues(issues, validateValue(value, schema.else, path, context));
    }
  }

  return issues;
}

function validateNumber(value: number, schema: SchemaObject, path: string, issues: ValidationIssue[]) {
  if (typeof schema.minimum === "number" && value < schema.minimum) {
    pushIssue(issues, issue(path, "minimum", `must be at least ${schema.minimum}`));
  }
  if (typeof schema.maximum === "number" && value > schema.maximum) {
    pushIssue(issues, issue(path, "maximum", `must be at most ${schema.maximum}`));
  }
  if (typeof schema.exclusiveMinimum === "number" && value <= schema.exclusiveMinimum) {
    pushIssue(issues, issue(path, "exclusiveMinimum", `must be greater than ${schema.exclusiveMinimum}`));
  }
  if (typeof schema.exclusiveMaximum === "number" && value >= schema.exclusiveMaximum) {
    pushIssue(issues, issue(path, "exclusiveMaximum", `must be less than ${schema.exclusiveMaximum}`));
  }
  if (typeof schema.multipleOf === "number" && !isMultipleOf(value, schema.multipleOf)) {
    pushIssue(issues, issue(path, "multipleOf", `must be a multiple of ${schema.multipleOf}`));
  }
}

function validateString(value: string, schema: SchemaObject, path: string, issues: ValidationIssue[]) {
  const characterLength = Array.from(value).length;
  if (typeof schema.minLength === "number" && characterLength < schema.minLength) {
    pushIssue(issues, issue(path, "minLength", `must contain at least ${schema.minLength} Unicode characters`));
  }
  if (typeof schema.maxLength === "number" && characterLength > schema.maxLength) {
    pushIssue(issues, issue(path, "maxLength", `must contain at most ${schema.maxLength} Unicode characters`));
  }
  if (typeof schema.pattern === "string") {
    const expression = new RegExp(schema.pattern, "u");
    if (!expression.test(value)) {
      pushIssue(issues, issue(path, "pattern", `does not match /${schema.pattern}/u`));
    }
  }
}

function validateArray(
  value: JSONValue[],
  schema: SchemaObject,
  path: string,
  context: ValidationContext,
  issues: ValidationIssue[]
) {
  if (typeof schema.minItems === "number" && value.length < schema.minItems) {
    pushIssue(issues, issue(path, "minItems", `must contain at least ${schema.minItems} items`));
  }
  if (typeof schema.maxItems === "number" && value.length > schema.maxItems) {
    pushIssue(issues, issue(path, "maxItems", `must contain at most ${schema.maxItems} items`));
  }

  if (schema.uniqueItems === true) {
    const seen = new Set<string>();
    for (let index = 0; index < value.length; index += 1) {
      const key = canonicalJsonKey(value[index]);
      if (seen.has(key)) {
        pushIssue(issues, issue(`${path}[${index}]`, "uniqueItems", "duplicates an earlier array item"));
        break;
      }
      seen.add(key);
    }
  }

  const prefixItems = Array.isArray(schema.prefixItems) ? schema.prefixItems : [];
  prefixItems.forEach((subschema, index) => {
    if (index < value.length) {
      pushIssues(issues, validateValue(value[index], subschema as JSONSchema, `${path}[${index}]`, context));
    }
  });

  if (isJsonSchema(schema.items)) {
    const start = prefixItems.length;
    for (let index = start; index < value.length; index += 1) {
      pushIssues(issues, validateValue(value[index], schema.items, `${path}[${index}]`, context));
    }
  }

  if (isJsonSchema(schema.contains)) {
    let matches = 0;
    value.forEach((item, index) => {
      if (validateValue(item, schema.contains as JSONSchema, `${path}[${index}]`, context).length === 0) {
        matches += 1;
      }
    });
    const minimum = typeof schema.minContains === "number" ? schema.minContains : 1;
    const maximum = typeof schema.maxContains === "number" ? schema.maxContains : Number.POSITIVE_INFINITY;
    if (matches < minimum) {
      pushIssue(issues, issue(path, "contains", `only ${matches} items matched; at least ${minimum} must match`));
    }
    if (matches > maximum) {
      pushIssue(issues, issue(path, "maxContains", `${matches} items matched; at most ${maximum} may match`));
    }
  }
}

function validateObject(
  value: Record<string, JSONValue>,
  schema: SchemaObject,
  path: string,
  context: ValidationContext,
  issues: ValidationIssue[]
) {
  const keys = Object.keys(value);
  if (typeof schema.minProperties === "number" && keys.length < schema.minProperties) {
    pushIssue(issues, issue(path, "minProperties", `must contain at least ${schema.minProperties} properties`));
  }
  if (typeof schema.maxProperties === "number" && keys.length > schema.maxProperties) {
    pushIssue(issues, issue(path, "maxProperties", `must contain at most ${schema.maxProperties} properties`));
  }

  if (Array.isArray(schema.required)) {
    schema.required.forEach((propertyName) => {
      if (typeof propertyName === "string" && !Object.prototype.hasOwnProperty.call(value, propertyName)) {
        pushIssue(issues, issue(childPath(path, propertyName), "required", "required property is missing"));
      }
    });
  }

  const properties = isPlainObject(schema.properties) ? schema.properties : {};
  const patternProperties = isPlainObject(schema.patternProperties) ? schema.patternProperties : {};
  const compiledPatterns = Object.keys(patternProperties).map((pattern) => ({
    pattern,
    expression: new RegExp(pattern, "u"),
    schema: patternProperties[pattern] as JSONSchema,
  }));

  keys.forEach((key) => {
    let covered = false;
    if (Object.prototype.hasOwnProperty.call(properties, key)) {
      covered = true;
      pushIssues(issues, validateValue(value[key], properties[key] as JSONSchema, childPath(path, key), context));
    }

    compiledPatterns.forEach((entry) => {
      if (entry.expression.test(key)) {
        covered = true;
        pushIssues(issues, validateValue(value[key], entry.schema, childPath(path, key), context));
      }
    });

    if (!covered && isJsonSchema(schema.additionalProperties)) {
      pushIssues(issues, validateValue(value[key], schema.additionalProperties, childPath(path, key), context));
    }
  });

  if (isJsonSchema(schema.propertyNames)) {
    keys.forEach((key) => {
      pushIssues(issues, validateValue(key, schema.propertyNames as JSONSchema, `${path}{property ${JSON.stringify(key)}}`, context));
    });
  }

  if (isPlainObject(schema.dependentRequired)) {
    const dependentRequired = schema.dependentRequired;
    Object.keys(dependentRequired).forEach((trigger) => {
      if (!Object.prototype.hasOwnProperty.call(value, trigger)) return;
      const requiredNames = dependentRequired[trigger];
      if (!Array.isArray(requiredNames)) return;
      requiredNames.forEach((requiredName) => {
        if (typeof requiredName === "string" && !Object.prototype.hasOwnProperty.call(value, requiredName)) {
          pushIssue(
            issues,
            issue(childPath(path, requiredName), "dependentRequired", `${JSON.stringify(requiredName)} is required when ${JSON.stringify(trigger)} is present`)
          );
        }
      });
    });
  }

  if (isPlainObject(schema.dependentSchemas)) {
    const dependentSchemas = schema.dependentSchemas;
    Object.keys(dependentSchemas).forEach((trigger) => {
      if (!Object.prototype.hasOwnProperty.call(value, trigger)) return;
      pushIssues(issues, validateValue(value, dependentSchemas[trigger] as JSONSchema, path, context));
    });
  }
}

function inspectSchemaDefinition(schema: JSONSchema): string[] {
  const notes: string[] = [];
  if (schema !== false && schema !== true) {
    if (schema.$schema === undefined) {
      notes.push("No $schema URI is declared; supported keywords are evaluated with Draft 2020-12 semantics.");
    }
    if (hasKeyword(schema, "format")) {
      notes.push("format is treated as annotation only; no format assertion is performed.");
    }
  }
  validateSchemaDefinition(schema, schema, "#", true);
  return notes;
}

function validateSchemaDefinition(
  schema: JSONSchema,
  rootSchema: JSONSchema,
  path: string,
  isRoot = false
) {
  if (typeof schema === "boolean") return;

  if (isRoot && schema.$schema !== undefined) {
    if (typeof schema.$schema !== "string") {
      throw new Error(`${path}/$schema must be a string URI.`);
    }
    if (schema.$schema.replace(/#$/, "") !== DRAFT_2020_12) {
      throw new Error(`This implementation uses Draft 2020-12 semantics. The schema declares ${schema.$schema}.`);
    }
  }

  ["$dynamicRef", "$dynamicAnchor", "unevaluatedItems", "unevaluatedProperties"].forEach((keyword) => {
    if (Object.prototype.hasOwnProperty.call(schema, keyword)) {
      throw new Error(`${path}/${escapePointerToken(keyword)} is not supported by this partial validator; validation would be incomplete if it were ignored.`);
    }
  });

  if (schema.$vocabulary !== undefined) {
    throw new Error(`${path}/$vocabulary is not supported because custom vocabulary requirements can change validation semantics.`);
  }

  if (schema.$id !== undefined) {
    if (typeof schema.$id !== "string") throw new Error(`${path}/$id must be a string URI-reference.`);
    if (!isRoot) {
      throw new Error(`${path}/$id creates an embedded schema resource, which this local-reference implementation does not resolve safely.`);
    }
  }

  if (schema.format !== undefined && typeof schema.format !== "string") {
    throw new Error(`${path}/format must be a string.`);
  }

  if (schema.$ref !== undefined) {
    if (typeof schema.$ref !== "string") throw new Error(`${path}/$ref must be a string.`);
    resolveLocalRef(schema.$ref, rootSchema);
  }

  if (schema.type !== undefined) validateTypeKeyword(schema.type, `${path}/type`);
  if (schema.enum !== undefined) {
    if (!Array.isArray(schema.enum)) throw new Error(`${path}/enum must be an array.`);
    schema.enum.forEach((value, index) => {
      if (!isJsonValue(value)) throw new Error(`${path}/enum/${index} is not a JSON value.`);
    });
  }
  if (Object.prototype.hasOwnProperty.call(schema, "const") && !isJsonValue(schema.const)) {
    throw new Error(`${path}/const must be a JSON value.`);
  }

  validateFiniteNumberKeyword(schema, "minimum", path);
  validateFiniteNumberKeyword(schema, "maximum", path);
  validateFiniteNumberKeyword(schema, "exclusiveMinimum", path);
  validateFiniteNumberKeyword(schema, "exclusiveMaximum", path);
  if (schema.multipleOf !== undefined) {
    if (typeof schema.multipleOf !== "number" || !Number.isFinite(schema.multipleOf) || schema.multipleOf <= 0) {
      throw new Error(`${path}/multipleOf must be a positive finite number.`);
    }
  }

  ["minLength", "maxLength", "minItems", "maxItems", "minContains", "maxContains", "minProperties", "maxProperties"].forEach(
    (keyword) => validateNonNegativeIntegerKeyword(schema, keyword, path)
  );
  if (schema.pattern !== undefined) validatePattern(schema.pattern, `${path}/pattern`);
  if (schema.uniqueItems !== undefined && typeof schema.uniqueItems !== "boolean") {
    throw new Error(`${path}/uniqueItems must be a boolean.`);
  }

  if (schema.required !== undefined) validateUniqueStringArray(schema.required, `${path}/required`);
  if (schema.dependentRequired !== undefined) {
    if (!isPlainObject(schema.dependentRequired)) throw new Error(`${path}/dependentRequired must be an object.`);
    const dependentRequired = schema.dependentRequired;
    Object.keys(dependentRequired).forEach((key) => {
      validateUniqueStringArray(dependentRequired[key], `${path}/dependentRequired/${escapePointerToken(key)}`);
    });
  }

  validateSchemaMap(schema.properties, rootSchema, `${path}/properties`);
  if (schema.patternProperties !== undefined) {
    if (!isPlainObject(schema.patternProperties)) throw new Error(`${path}/patternProperties must be an object.`);
    const patternProperties = schema.patternProperties;
    Object.keys(patternProperties).forEach((pattern) => {
      validatePattern(pattern, `${path}/patternProperties/${escapePointerToken(pattern)}`);
      const child = patternProperties[pattern];
      if (!isJsonSchema(child)) throw new Error(`${path}/patternProperties/${escapePointerToken(pattern)} must contain a schema.`);
      validateSchemaDefinition(child, rootSchema, `${path}/patternProperties/${escapePointerToken(pattern)}`);
    });
  }
  validateSchemaMap(schema.$defs, rootSchema, `${path}/$defs`);
  validateSchemaMap(schema.dependentSchemas, rootSchema, `${path}/dependentSchemas`);

  ["additionalProperties", "items", "contains", "propertyNames", "not", "if", "then", "else"].forEach((keyword) => {
    const value = schema[keyword];
    if (value !== undefined) {
      if (!isJsonSchema(value)) throw new Error(`${path}/${escapePointerToken(keyword)} must be a schema object or boolean schema.`);
      validateSchemaDefinition(value, rootSchema, `${path}/${escapePointerToken(keyword)}`);
    }
  });

  if (schema.prefixItems !== undefined) validateSchemaArray(schema.prefixItems, rootSchema, `${path}/prefixItems`, true);
  ["allOf", "anyOf", "oneOf"].forEach((keyword) => {
    if (schema[keyword] !== undefined) validateSchemaArray(schema[keyword], rootSchema, `${path}/${keyword}`, true);
  });
}

function validateSchemaMap(value: unknown, rootSchema: JSONSchema, path: string) {
  if (value === undefined) return;
  if (!isPlainObject(value)) throw new Error(`${path} must be an object whose values are schemas.`);
  Object.keys(value).forEach((key) => {
    const child = value[key];
    if (!isJsonSchema(child)) throw new Error(`${path}/${escapePointerToken(key)} must be a schema object or boolean schema.`);
    validateSchemaDefinition(child, rootSchema, `${path}/${escapePointerToken(key)}`);
  });
}

function validateSchemaArray(value: unknown, rootSchema: JSONSchema, path: string, requireNonEmpty: boolean) {
  if (!Array.isArray(value) || (requireNonEmpty && value.length === 0)) {
    throw new Error(`${path} must be ${requireNonEmpty ? "a non-empty" : "an"} array of schemas.`);
  }
  value.forEach((child, index) => {
    if (!isJsonSchema(child)) throw new Error(`${path}/${index} must be a schema object or boolean schema.`);
    validateSchemaDefinition(child, rootSchema, `${path}/${index}`);
  });
}

function validateTypeKeyword(value: unknown, path: string) {
  const allowed = new Set(["null", "boolean", "object", "array", "number", "string", "integer"]);
  if (typeof value === "string") {
    if (!allowed.has(value)) throw new Error(`${path} contains unknown type ${JSON.stringify(value)}.`);
    return;
  }
  if (!Array.isArray(value)) throw new Error(`${path} must be a type name or an array of unique type names.`);
  const seen = new Set<string>();
  value.forEach((item) => {
    if (typeof item !== "string" || !allowed.has(item)) throw new Error(`${path} contains an invalid type name.`);
    if (seen.has(item)) throw new Error(`${path} contains duplicate type ${JSON.stringify(item)}.`);
    seen.add(item);
  });
}

function validateUniqueStringArray(value: unknown, path: string) {
  if (!Array.isArray(value)) throw new Error(`${path} must be an array of unique strings.`);
  const seen = new Set<string>();
  value.forEach((item) => {
    if (typeof item !== "string") throw new Error(`${path} must contain only strings.`);
    if (seen.has(item)) throw new Error(`${path} contains duplicate value ${JSON.stringify(item)}.`);
    seen.add(item);
  });
}

function validateFiniteNumberKeyword(schema: SchemaObject, keyword: string, path: string) {
  const value = schema[keyword];
  if (value !== undefined && (typeof value !== "number" || !Number.isFinite(value))) {
    throw new Error(`${path}/${keyword} must be a finite number.`);
  }
}

function validateNonNegativeIntegerKeyword(schema: SchemaObject, keyword: string, path: string) {
  const value = schema[keyword];
  if (value !== undefined && (typeof value !== "number" || !Number.isInteger(value) || value < 0)) {
    throw new Error(`${path}/${keyword} must be a non-negative integer.`);
  }
}

function validatePattern(value: unknown, path: string) {
  if (typeof value !== "string") throw new Error(`${path} must be a string.`);
  if (value.length > MAX_PATTERN_LENGTH) throw new Error(`${path} exceeds the ${MAX_PATTERN_LENGTH}-character browser pattern limit.`);
  try {
    new RegExp(value, "u");
  } catch {
    throw new Error(`${path} is not a valid Unicode-aware ECMAScript regular expression.`);
  }
}

function resolveLocalRef(ref: string, rootSchema: JSONSchema): JSONSchema {
  if (ref === "#") return rootSchema;
  if (!ref.startsWith("#/")) {
    if (ref.startsWith("#")) {
      throw new Error(`Named or non-pointer local reference ${ref} is not supported; use a local JSON Pointer such as #/$defs/name.`);
    }
    throw new Error(`External $ref ${ref} is not fetched by this browser validator.`);
  }

  let fragment: string;
  try {
    fragment = decodeURIComponent(ref.slice(1));
  } catch {
    throw new Error(`$ref ${ref} contains malformed percent encoding.`);
  }
  const tokens = fragment
    .slice(1)
    .split("/")
    .map((token) => decodePointerToken(token));

  let current: unknown = rootSchema;
  tokens.forEach((token) => {
    if (Array.isArray(current)) {
      if (!/^(0|[1-9]\d*)$/.test(token)) throw new Error(`$ref ${ref} contains invalid array index ${JSON.stringify(token)}.`);
      const index = Number(token);
      if (index >= current.length) throw new Error(`$ref ${ref} points outside an array.`);
      current = current[index];
      return;
    }
    if (!isPlainObject(current) || !Object.prototype.hasOwnProperty.call(current, token)) {
      throw new Error(`$ref ${ref} does not resolve inside the pasted schema.`);
    }
    current = current[token];
  });

  if (!isJsonSchema(current)) throw new Error(`$ref ${ref} does not resolve to a schema object or boolean schema.`);
  return current;
}

function decodePointerToken(token: string) {
  if (/~(?![01])/u.test(token)) throw new Error(`JSON Pointer token ${JSON.stringify(token)} contains an invalid ~ escape.`);
  return token.replace(/~1/g, "/").replace(/~0/g, "~");
}

function childPath(path: string, key: string) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? `${path}.${key}` : `${path}[${JSON.stringify(key)}]`;
}

function issue(path: string, keyword: string, message: string): ValidationIssue {
  return { path, keyword, message };
}

function pushIssue(target: ValidationIssue[], item: ValidationIssue) {
  if (target.length < MAX_REPORTED_ISSUES) target.push(item);
}

function pushIssues(target: ValidationIssue[], items: ValidationIssue[]) {
  for (let index = 0; index < items.length && target.length < MAX_REPORTED_ISSUES; index += 1) {
    target.push(items[index]);
  }
}

function valueType(value: JSONValue) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (typeof value === "number" && Number.isInteger(value)) return "integer";
  return typeof value;
}

function isMultipleOf(value: number, divisor: number) {
  const quotient = value / divisor;
  const nearest = Math.round(quotient);
  const tolerance = Number.EPSILON * Math.max(1, Math.abs(quotient)) * 8;
  return Math.abs(quotient - nearest) <= tolerance;
}

function deepEqual(left: JSONValue, right: JSONValue): boolean {
  if (typeof left === "number" && typeof right === "number") return left === right;
  if (left === right) return true;
  if (Array.isArray(left) && Array.isArray(right)) {
    return left.length === right.length && left.every((item, index) => deepEqual(item, right[index]));
  }
  if (isPlainJsonObject(left) && isPlainJsonObject(right)) {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    return (
      leftKeys.length === rightKeys.length &&
      leftKeys.every(
        (key) => Object.prototype.hasOwnProperty.call(right, key) && deepEqual(left[key], right[key])
      )
    );
  }
  return false;
}

function canonicalJsonKey(value: JSONValue): string {
  if (value === null) return "n:null";
  if (typeof value === "string") return `s:${JSON.stringify(value)}`;
  if (typeof value === "number") return `d:${String(value)}`;
  if (typeof value === "boolean") return `b:${value ? "1" : "0"}`;
  if (Array.isArray(value)) return `a:[${value.map((item) => canonicalJsonKey(item)).join(",")}]`;
  const keys = Object.keys(value).sort();
  return `o:{${keys.map((key) => `${JSON.stringify(key)}:${canonicalJsonKey(value[key])}`).join(",")}}`;
}

function hasKeyword(schema: JSONSchema, keyword: string): boolean {
  if (typeof schema === "boolean") return false;
  if (Object.prototype.hasOwnProperty.call(schema, keyword)) return true;

  const singleSchemaKeywords = [
    "additionalProperties",
    "items",
    "contains",
    "propertyNames",
    "not",
    "if",
    "then",
    "else",
  ];
  for (const key of singleSchemaKeywords) {
    const child = schema[key];
    if (isJsonSchema(child) && hasKeyword(child, keyword)) return true;
  }

  const schemaArrayKeywords = ["prefixItems", "allOf", "anyOf", "oneOf"];
  for (const key of schemaArrayKeywords) {
    const children = schema[key];
    if (Array.isArray(children)) {
      for (const child of children) {
        if (isJsonSchema(child) && hasKeyword(child, keyword)) return true;
      }
    }
  }

  const schemaMapKeywords = ["properties", "patternProperties", "$defs", "dependentSchemas"];
  for (const key of schemaMapKeywords) {
    const children = schema[key];
    if (isPlainObject(children)) {
      for (const child of Object.values(children)) {
        if (isJsonSchema(child) && hasKeyword(child, keyword)) return true;
      }
    }
  }

  return false;
}

function isJsonSchema(value: unknown): value is JSONSchema {
  return typeof value === "boolean" || isPlainObject(value);
}

function isJsonValue(value: unknown): value is JSONValue {
  if (value === null || typeof value === "string" || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.every((item) => isJsonValue(item));
  if (isPlainObject(value)) return Object.values(value).every((item) => isJsonValue(item));
  return false;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isPlainJsonObject(value: JSONValue): value is Record<string, JSONValue> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function stripLeadingBom(text: string) {
  const bomRemoved = text.charCodeAt(0) === 0xfeff;
  return { text: bomRemoved ? text.slice(1) : text, bomRemoved };
}

function escapePointerToken(value: string) {
  return value.replace(/~/g, "~0").replace(/\//g, "~1");
}

function assertLosslessJsonText(text: string, label: string) {
  try {
    JSON.parse(text);
  } catch (parseError) {
    throw new Error(`${label} is not valid JSON: ${parseError instanceof Error ? parseError.message : "parse failed"}`);
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
      if (stack.length > MAX_JSON_DEPTH) throw new Error(`${label} is nested more than ${MAX_JSON_DEPTH} levels.`);
      index += 1;
      continue;
    }

    if (char === "[") {
      stack.push({ type: "array" });
      if (stack.length > MAX_JSON_DEPTH) throw new Error(`${label} is nested more than ${MAX_JSON_DEPTH} levels.`);
      index += 1;
      continue;
    }

    if (char === "}" || char === "]") {
      stack.pop();
      index += 1;
      continue;
    }

    if (char === '"') {
      const end = findJsonStringEnd(text, index);
      const token = text.slice(index, end + 1);
      let next = end + 1;
      while (next < text.length && /\s/.test(text[next])) next += 1;
      const frame = stack[stack.length - 1];
      if (frame?.type === "object" && text[next] === ":") {
        const key = JSON.parse(token) as string;
        if (frame.keys?.has(key)) {
          throw new Error(`${label} contains duplicate member ${JSON.stringify(key)}, which JSON.parse would collapse.`);
        }
        frame.keys?.add(key);
      }
      index = end + 1;
      continue;
    }

    if (char === "-" || /\d/.test(char)) {
      const match = text.slice(index).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);
      if (match) {
        const token = match[0];
        const numericValue = Number(token);
        if (!isSafeNumberToken(token, numericValue)) {
          throw new Error(`${label} contains number ${token}, which cannot be handled conservatively with JavaScript number semantics. Quote it if exact digits matter.`);
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
    if (char === '"') return index;
  }
  return text.length - 1;
}

function isSafeNumberToken(token: string, numericValue: number) {
  if (!Number.isFinite(numericValue) || Object.is(numericValue, -0)) return false;
  if (Number.isInteger(numericValue) && !Number.isSafeInteger(numericValue)) return false;
  if (/^-?(?:0|[1-9]\d*)$/.test(token)) return Number.isSafeInteger(numericValue);
  const significantDigits = token
    .replace(/^[+-]/, "")
    .split(/[eE]/)[0]
    .replace(".", "")
    .replace(/^0+/, "").length;
  if (significantDigits > 15) return false;
  if (numericValue === 0 && /[1-9]/.test(token)) return false;
  return true;
}
