"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type JSONValue =
  | null
  | boolean
  | number
  | string
  | JSONValue[]
  | { [key: string]: JSONValue };

type JSONSchema = {
  type?: string | string[];
  required?: string[];
  properties?: Record<string, JSONSchema>;
  additionalProperties?: boolean;
  items?: JSONSchema;
  enum?: JSONValue[];
  const?: JSONValue;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  minProperties?: number;
  maxProperties?: number;
  allOf?: JSONSchema[];
  anyOf?: JSONSchema[];
  oneOf?: JSONSchema[];
  not?: JSONSchema;
};

function valueType(value: JSONValue): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (Number.isInteger(value)) return "integer";
  return typeof value;
}

function deepEqual(left: JSONValue, right: JSONValue): boolean {
  if (Object.is(left, right)) {
    return true;
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    return (
      left.length === right.length &&
      left.every((item, index) => deepEqual(item, right[index]))
    );
  }

  if (
    left !== null &&
    right !== null &&
    typeof left === "object" &&
    typeof right === "object" &&
    !Array.isArray(left) &&
    !Array.isArray(right)
  ) {
    const leftObject = left as Record<string, JSONValue>;
    const rightObject = right as Record<string, JSONValue>;
    const leftKeys = Object.keys(leftObject);
    const rightKeys = Object.keys(rightObject);

    return (
      leftKeys.length === rightKeys.length &&
      leftKeys.every(
        (key) =>
          Object.prototype.hasOwnProperty.call(rightObject, key) &&
          deepEqual(leftObject[key], rightObject[key])
      )
    );
  }

  return false;
}

function validateValue(
  value: JSONValue,
  schema: JSONSchema,
  path = "$"
): string[] {
  const errors: string[] = [];

  if (schema.type) {
    const allowed = Array.isArray(schema.type)
      ? schema.type
      : [schema.type];

    const actual = valueType(value);
    const typeMatches = allowed.some(
      (expected) =>
        expected === actual ||
        (expected === "number" &&
          (actual === "number" || actual === "integer"))
    );

    if (!typeMatches) {
      errors.push(
        `${path}: expected ${allowed.join(" or ")}, received ${actual}.`
      );
      return errors;
    }
  }

  if (schema.enum && !schema.enum.some((item) => deepEqual(item, value))) {
    errors.push(`${path}: value is not included in the allowed enum.`);
  }

  if ("const" in schema && !deepEqual(schema.const as JSONValue, value)) {
    errors.push(`${path}: value does not match the required const value.`);
  }

  if (typeof value === "string") {
    if (
      typeof schema.minLength === "number" &&
      value.length < schema.minLength
    ) {
      errors.push(
        `${path}: string length must be at least ${schema.minLength}.`
      );
    }

    if (
      typeof schema.maxLength === "number" &&
      value.length > schema.maxLength
    ) {
      errors.push(
        `${path}: string length must be at most ${schema.maxLength}.`
      );
    }

    if (schema.pattern) {
      try {
        if (!new RegExp(schema.pattern).test(value)) {
          errors.push(
            `${path}: string does not match pattern ${schema.pattern}.`
          );
        }
      } catch {
        errors.push(`${path}: schema contains an invalid pattern.`);
      }
    }
  }

  if (typeof value === "number") {
    if (
      typeof schema.minimum === "number" &&
      value < schema.minimum
    ) {
      errors.push(`${path}: value must be at least ${schema.minimum}.`);
    }

    if (
      typeof schema.maximum === "number" &&
      value > schema.maximum
    ) {
      errors.push(`${path}: value must be at most ${schema.maximum}.`);
    }

    if (
      typeof schema.exclusiveMinimum === "number" &&
      value <= schema.exclusiveMinimum
    ) {
      errors.push(
        `${path}: value must be greater than ${schema.exclusiveMinimum}.`
      );
    }

    if (
      typeof schema.exclusiveMaximum === "number" &&
      value >= schema.exclusiveMaximum
    ) {
      errors.push(
        `${path}: value must be less than ${schema.exclusiveMaximum}.`
      );
    }
  }

  if (Array.isArray(value)) {
    if (
      typeof schema.minItems === "number" &&
      value.length < schema.minItems
    ) {
      errors.push(
        `${path}: array must contain at least ${schema.minItems} items.`
      );
    }

    if (
      typeof schema.maxItems === "number" &&
      value.length > schema.maxItems
    ) {
      errors.push(
        `${path}: array must contain at most ${schema.maxItems} items.`
      );
    }

    if (schema.uniqueItems) {
      const hasDuplicate = value.some((item, index) =>
        value.slice(index + 1).some((other) => deepEqual(item, other))
      );

      if (hasDuplicate) {
        errors.push(`${path}: array items must be unique.`);
      }
    }

    if (schema.items) {
      value.forEach((item, index) => {
        errors.push(
          ...validateValue(item, schema.items as JSONSchema, `${path}[${index}]`)
        );
      });
    }
  }

  if (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    const objectValue = value as Record<string, JSONValue>;
    const keys = Object.keys(objectValue);

    if (
      typeof schema.minProperties === "number" &&
      keys.length < schema.minProperties
    ) {
      errors.push(
        `${path}: object must contain at least ${schema.minProperties} properties.`
      );
    }

    if (
      typeof schema.maxProperties === "number" &&
      keys.length > schema.maxProperties
    ) {
      errors.push(
        `${path}: object must contain at most ${schema.maxProperties} properties.`
      );
    }

    schema.required?.forEach((field) => {
      if (!Object.prototype.hasOwnProperty.call(objectValue, field)) {
        errors.push(`${path}.${field}: required property is missing.`);
      }
    });

    const definedProperties = schema.properties ?? {};

    Object.entries(definedProperties).forEach(
      ([propertyName, propertySchema]) => {
        if (
          Object.prototype.hasOwnProperty.call(
            objectValue,
            propertyName
          )
        ) {
          errors.push(
            ...validateValue(
              objectValue[propertyName],
              propertySchema,
              `${path}.${propertyName}`
            )
          );
        }
      }
    );

    if (schema.additionalProperties === false) {
      keys
        .filter(
          (key) =>
            !Object.prototype.hasOwnProperty.call(
              definedProperties,
              key
            )
        )
        .forEach((key) => {
          errors.push(`${path}.${key}: additional property is not allowed.`);
        });
    }
  }

  if (schema.allOf) {
    schema.allOf.forEach((subschema, index) => {
      const subErrors = validateValue(value, subschema, path);
      if (subErrors.length) {
        errors.push(
          `${path}: allOf schema ${index + 1} failed.`,
          ...subErrors
        );
      }
    });
  }

  if (schema.anyOf) {
    const matches = schema.anyOf.filter(
      (subschema) => validateValue(value, subschema, path).length === 0
    ).length;

    if (matches === 0) {
      errors.push(`${path}: value does not match any anyOf schema.`);
    }
  }

  if (schema.oneOf) {
    const matches = schema.oneOf.filter(
      (subschema) => validateValue(value, subschema, path).length === 0
    ).length;

    if (matches !== 1) {
      errors.push(
        `${path}: value must match exactly one oneOf schema; matched ${matches}.`
      );
    }
  }

  if (schema.not && validateValue(value, schema.not, path).length === 0) {
    errors.push(`${path}: value matches a schema listed under not.`);
  }

  return errors;
}

export default function ToolClient() {
  const [jsonInput, setJsonInput] = useState("");
  const [schemaInput, setSchemaInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const validateSchema = () => {
    try {
      if (!jsonInput.trim()) {
        throw new Error("Please enter JSON data.");
      }

      if (!schemaInput.trim()) {
        throw new Error("Please enter a JSON schema.");
      }

      const jsonData = JSON.parse(jsonInput) as JSONValue;
      const schema = JSON.parse(schemaInput) as JSONSchema;

      if (
        schema === null ||
        typeof schema !== "object" ||
        Array.isArray(schema)
      ) {
        throw new Error("The schema must be a JSON object.");
      }

      const validationErrors = validateValue(jsonData, schema);

      if (validationErrors.length) {
        setOutput(
          `Validation failed with ${validationErrors.length} issue${
            validationErrors.length === 1 ? "" : "s"
          }:\n\n${validationErrors
            .map((item, index) => `${index + 1}. ${item}`)
            .join("\n")}`
        );
      } else {
        setOutput(
          "Validation passed for the supported JSON Schema rules."
        );
      }

      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to validate the JSON data and schema."
      );
      setOutput("");
    }
  };

  const resetAll = () => {
    setJsonInput("");
    setSchemaInput("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="JSON Schema Validator"
      description="Validate JSON data against common schema rules including types, required fields, properties, arrays, enums, ranges, and patterns."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          JSON Data
        </label>

        <textarea
          value={jsonInput}
          onChange={(event) => setJsonInput(event.target.value)}
          placeholder={`{
  "name": "Yoryantra",
  "active": true
}`}
          className="w-full min-h-[220px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          JSON Schema
        </label>

        <textarea
          value={schemaInput}
          onChange={(event) => setSchemaInput(event.target.value)}
          placeholder={`{
  "type": "object",
  "required": ["name"],
  "properties": {
    "name": {
      "type": "string",
      "minLength": 2
    },
    "active": {
      "type": "boolean"
    }
  }
}`}
          className="w-full min-h-[220px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={validateSchema} className="yoryantra-btn">
          Validate JSON
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 overflow-auto">
          {error}
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Validation Result
          </h3>

          {output && (
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <div className="yoryantra-output min-h-[180px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {output || "Validation results will appear here."}
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Supported Rules and Privacy
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          Validation runs locally in your browser. This tool supports common
          rules such as type, required, properties, additionalProperties,
          items, enum, const, numeric and length limits, pattern, uniqueItems,
          allOf, anyOf, oneOf, and not. It does not implement every JSON Schema
          draft keyword, format checker, or external $ref.
        </p>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Checking JSON Structure Against Common Schema Rules
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Valid JSON syntax only confirms that a parser can read the text. It
            does not confirm that required fields exist, values use the expected
            types, arrays contain valid items, or application rules are met.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This validator checks JSON data against a practical subset of JSON
            Schema rules directly in the browser. It is useful for API payloads,
            webhook examples, configuration data, fixtures, and integration
            debugging.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the JSON Schema Validator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste the JSON data into the first editor.</li>
            <li>Paste a JSON Schema object into the second editor.</li>
            <li>Click <strong>Validate JSON</strong>.</li>
            <li>Review each reported path and rule before changing the data or schema.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Supported Validation Areas
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Primitive, object, array, and integer type checks.</li>
            <li>Required properties and nested property validation.</li>
            <li>Array item rules, length limits, and unique items.</li>
            <li>Enums, const values, numeric ranges, and string patterns.</li>
            <li>Common allOf, anyOf, oneOf, and not combinations.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example JSON Schema
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`{
  "type": "object",
  "required": ["name", "email"],
  "properties": {
    "name": {
      "type": "string",
      "minLength": 2
    },
    "email": {
      "type": "string"
    }
  },
  "additionalProperties": false
}`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                Is valid JSON automatically valid against a schema?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. JSON syntax can be valid while fields, types, required
                values, or nested structures do not match the schema.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this implement every JSON Schema keyword?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. It supports the common rules listed above but does not
                provide complete draft compliance, format validation, or
                external reference resolution.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I use this for API payload checks?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes, for quick development checks. Production validation should
                use a standards-compliant library configured for the JSON Schema
                draft used by your application.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my JSON uploaded?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The JSON data and schema are processed locally in the
                browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/json-schema-validator" />
        </div>
      </section>
    </ToolShell>
  );
}
