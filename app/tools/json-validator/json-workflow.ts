/**
 * Shared conversion operations retained from the original JSON Formatter,
 * JSON Minifier and JSON Sort Keys tools (17 November 2026 source snapshot).
 *
 * Formatting and minification use original JSON tokens; sorting deliberately
 * rejects duplicate object keys and non-round-trippable numeric values.
 */
export type SortDirection = "asc" | "desc";
export type OutputSpacing = "two" | "four" | "compact";
export type JsonDiagnostics = {
  duplicateKeys: string[];
  unsafeIntegers: string[];
  nonFiniteNumbers: string[];
  highPrecisionNumbers: string[];
};
const MAX_DEPTH = 120;
const MAX_VALUES = 25000;
function isJsonWhitespace(char: string) {
  return char === " " || char === "\t" || char === "\n" || char === "\r";
}

function stripTrailingWhitespace(value: string) {
  return value.replace(/\s+$/, "");
}

function nextSignificant(source: string, start: number) {
  for (let index = start; index < source.length; index += 1) {
    if (!isJsonWhitespace(source[index])) {
      return source[index];
    }
  }

  return "";
}

function previousSignificant(value: string) {
  for (let index = value.length - 1; index >= 0; index -= 1) {
    if (!isJsonWhitespace(value[index])) {
      return value[index];
    }
  }

  return "";
}

function prettyPrintJson(source: string, indent: string) {
  let output = "";
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];

    if (inString) {
      output += char;

      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }

      continue;
    }

    if (char === '"') {
      inString = true;
      output += char;
      continue;
    }

    if (isJsonWhitespace(char)) {
      continue;
    }

    if (char === "{" || char === "[") {
      output += char;

      const closing = char === "{" ? "}" : "]";

      if (nextSignificant(source, index + 1) !== closing) {
        depth += 1;
        output += `\n${indent.repeat(depth)}`;
      }

      continue;
    }

    if (char === "}" || char === "]") {
      const opening = char === "}" ? "{" : "[";

      if (previousSignificant(output) !== opening) {
        depth = Math.max(depth - 1, 0);
        output =
          `${stripTrailingWhitespace(output)}\n${indent.repeat(depth)}`;
      }

      output += char;
      continue;
    }

    if (char === ",") {
      output += `,\n${indent.repeat(depth)}`;
      continue;
    }

    if (char === ":") {
      output += ": ";
      continue;
    }

    output += char;
  }

  return output;
}

function findJsonStringEnd(source: string, start: number) {
  let escaped = false;

  for (
    let index = start + 1;
    index < source.length;
    index += 1
  ) {
    const char = source[index];

    if (escaped) {
      escaped = false;
    } else if (char === "\\") {
      escaped = true;
    } else if (char === '"') {
      return index;
    }
  }

  return source.length - 1;
}

function integerOutsideSafeRange(token: string) {
  if (!/^-?(?:0|[1-9]\d*)$/.test(token)) {
    return false;
  }

  const digits =
    token.replace(/^-/, "").replace(/^0+/, "") || "0";
  const max = "9007199254740991";

  if (digits.length !== max.length) {
    return digits.length > max.length;
  }

  return digits > max;
}

function significantDigitCount(token: string) {
  const mantissa = token.split(/[eE]/)[0];
  const digits = mantissa
    .replace(/[-.]/g, "")
    .replace(/^0+/, "");

  return digits.length;
}

function uniqueStrings(values: string[]) {
  const result: string[] = [];

  values.forEach((value) => {
    if (result.indexOf(value) === -1) {
      result.push(value);
    }
  });

  return result;
}

function inspectJsonSource(source: string): JsonDiagnostics {
  const duplicateKeys: string[] = [];
  const unsafeIntegers: string[] = [];
  const nonFiniteNumbers: string[] = [];
  const highPrecisionNumbers: string[] = [];
  const stack: Array<{
    type: "object" | "array";
    keys?: Set<string>;
  }> = [];

  let index = 0;

  while (index < source.length) {
    const char = source[index];

    if (isJsonWhitespace(char)) {
      index += 1;
      continue;
    }

    if (char === "{") {
      stack.push({
        type: "object",
        keys: new Set<string>(),
      });
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
      const end = findJsonStringEnd(source, index);
      const raw = source.slice(index, end + 1);
      let cursor = end + 1;

      while (
        cursor < source.length &&
        isJsonWhitespace(source[cursor])
      ) {
        cursor += 1;
      }

      const current = stack[stack.length - 1];

      if (
        source[cursor] === ":" &&
        current &&
        current.type === "object" &&
        current.keys
      ) {
        try {
          const key = JSON.parse(raw) as string;

          if (current.keys.has(key)) {
            duplicateKeys.push(key);
          } else {
            current.keys.add(key);
          }
        } catch {
          // Full JSON.parse validation is performed before this scan.
        }
      }

      index = end + 1;
      continue;
    }

    if (char === "-" || /\d/.test(char)) {
      const match = source
        .slice(index)
        .match(
          /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/
        );

      if (match) {
        const token = match[0];

        if (integerOutsideSafeRange(token)) {
          unsafeIntegers.push(token);
        }

        if (
          /[.eE]/.test(token) &&
          significantDigitCount(token) > 15
        ) {
          highPrecisionNumbers.push(token);
        }

        if (!Number.isFinite(Number(token))) {
          nonFiniteNumbers.push(token);
        }

        index += token.length;
        continue;
      }
    }

    index += 1;
  }

  return {
    duplicateKeys: uniqueStrings(duplicateKeys),
    unsafeIntegers: uniqueStrings(unsafeIntegers),
    nonFiniteNumbers: uniqueStrings(nonFiniteNumbers),
    highPrecisionNumbers: uniqueStrings(
      highPrecisionNumbers
    ),
  };
}
function minifyJsonTokens(source: string) {
  let output = "";
  let inString = false;
  let escaped = false;

  for (
    let index = 0;
    index < source.length;
    index += 1
  ) {
    const char = source[index];

    if (inString) {
      output += char;

      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }

      continue;
    }

    if (char === '"') {
      inString = true;
      output += char;
    } else if (!isJsonWhitespace(char)) {
      output += char;
    }
  }

  return output;
}
function serializeSortedJson(value: unknown, direction: SortDirection, spacing: number) {
  const state = { values: 0 };

  const serialize = (current: unknown, depth: number): string => {
    state.values += 1;
    if (state.values > MAX_VALUES) {
      throw new Error(`This JSON exceeds the ${MAX_VALUES.toLocaleString()}-value sorting limit.`);
    }
    if (depth > MAX_DEPTH) {
      throw new Error(`This JSON exceeds the ${MAX_DEPTH}-level nesting limit.`);
    }

    if (Array.isArray(current)) {
      const parts = current.map((item) => serialize(item, depth + 1));
      return joinSerialized(parts, "[", "]", depth, spacing);
    }

    if (isPlainObject(current)) {
      const keys = Object.keys(current).sort((a, b) => compareKeys(a, b, direction));
      const parts = keys.map((key) => {
        const keyText = JSON.stringify(key);
        const valueText = serialize(current[key], depth + 1);
        return spacing === 0 ? `${keyText}:${valueText}` : `${keyText}: ${valueText}`;
      });
      return joinSerialized(parts, "{", "}", depth, spacing);
    }

    const primitive = JSON.stringify(current);
    if (primitive === undefined) {
      throw new Error("A value could not be serialized as JSON.");
    }
    return primitive;
  };

  return serialize(value, 0);
}

function joinSerialized(parts: string[], open: string, close: string, depth: number, spacing: number) {
  if (parts.length === 0) return `${open}${close}`;
  if (spacing === 0) return `${open}${parts.join(",")}${close}`;

  const childIndent = " ".repeat((depth + 1) * spacing);
  const closingIndent = " ".repeat(depth * spacing);
  return `${open}\n${parts.map((part) => `${childIndent}${part}`).join(",\n")}\n${closingIndent}${close}`;
}

function compareKeys(a: string, b: string, direction: SortDirection) {
  if (a === b) return 0;
  const ascending = a < b ? -1 : 1;
  return direction === "asc" ? ascending : -ascending;
}

function preflightJson(text: string) {
  let index = 0;
  let values = 0;

  const skipWhitespace = () => {
    while (index < text.length && /\s/.test(text[index])) index += 1;
  };

  const parseString = (): string => {
    const start = index;
    if (text[index] !== '"') throw new Error("Expected a JSON string.");
    index += 1;
    let escaped = false;

    while (index < text.length) {
      const char = text[index];
      if (escaped) {
        escaped = false;
        index += 1;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        index += 1;
        continue;
      }
      if (char === '"') {
        index += 1;
        return JSON.parse(text.slice(start, index)) as string;
      }
      index += 1;
    }

    throw new Error("Unterminated JSON string.");
  };

  const parseNumber = () => {
    const match = text.slice(index).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);
    if (!match) throw new Error("Invalid JSON number.");
    const token = match[0];
    const numeric = Number(token);

    if (!Number.isFinite(numeric)) {
      throw new Error(`Number ${token} is outside JavaScript's finite numeric range.`);
    }
    if (numeric === 0 && token.startsWith("-")) {
      throw new Error("Negative zero would be normalized to 0 during serialization, so sorting was stopped.");
    }

    const roundTrip = numeric.toString();
    if (normalizeDecimal(token) !== normalizeDecimal(roundTrip)) {
      throw new Error(`Number ${token} cannot round-trip through JavaScript without changing its decimal value.`);
    }

    index += token.length;
  };

  const parseValue = (depth: number): void => {
    values += 1;
    if (values > MAX_VALUES) {
      throw new Error(`This JSON exceeds the ${MAX_VALUES.toLocaleString()}-value sorting limit.`);
    }
    if (depth > MAX_DEPTH) {
      throw new Error(`This JSON exceeds the ${MAX_DEPTH}-level nesting limit.`);
    }
    skipWhitespace();
    const char = text[index];

    if (char === "{") {
      parseObject(depth + 1);
      return;
    }
    if (char === "[") {
      parseArray(depth + 1);
      return;
    }
    if (char === '"') {
      parseString();
      return;
    }
    if (text.startsWith("true", index)) {
      index += 4;
      return;
    }
    if (text.startsWith("false", index)) {
      index += 5;
      return;
    }
    if (text.startsWith("null", index)) {
      index += 4;
      return;
    }
    parseNumber();
  };

  const parseObject = (depth: number) => {
    index += 1;
    skipWhitespace();
    const keys = new Set<string>();
    if (text[index] === "}") {
      index += 1;
      return;
    }

    while (index < text.length) {
      skipWhitespace();
      const key = parseString();
      if (keys.has(key)) {
        throw new Error(`Duplicate object member name ${JSON.stringify(key)} was found. Sorting would discard one of its values.`);
      }
      keys.add(key);
      skipWhitespace();
      if (text[index] !== ":") throw new Error("Expected : after an object member name.");
      index += 1;
      parseValue(depth);
      skipWhitespace();
      if (text[index] === "}") {
        index += 1;
        return;
      }
      if (text[index] !== ",") throw new Error("Expected , or } inside a JSON object.");
      index += 1;
    }

    throw new Error("Unclosed JSON object.");
  };

  const parseArray = (depth: number) => {
    index += 1;
    skipWhitespace();
    if (text[index] === "]") {
      index += 1;
      return;
    }

    while (index < text.length) {
      parseValue(depth);
      skipWhitespace();
      if (text[index] === "]") {
        index += 1;
        return;
      }
      if (text[index] !== ",") throw new Error("Expected , or ] inside a JSON array.");
      index += 1;
    }

    throw new Error("Unclosed JSON array.");
  };

  parseValue(0);
  skipWhitespace();
  if (index !== text.length) {
    throw new Error("Unexpected content appears after the JSON value.");
  }
}

function normalizeDecimal(token: string) {
  let value = token.toLowerCase();
  let sign = "";
  if (value.startsWith("-")) {
    sign = "-";
    value = value.slice(1);
  } else if (value.startsWith("+")) {
    value = value.slice(1);
  }

  const exponentParts = value.split("e");
  const mantissa = exponentParts[0];
  const exponent = exponentParts.length > 1 ? Number(exponentParts[1]) : 0;
  const dotIndex = mantissa.indexOf(".");
  const fractionalDigits = dotIndex === -1 ? 0 : mantissa.length - dotIndex - 1;
  let digits = mantissa.replace(".", "").replace(/^0+/, "");

  if (!digits) return "0e0";

  let power = exponent - fractionalDigits;
  while (digits.endsWith("0")) {
    digits = digits.slice(0, -1);
    power += 1;
  }

  return `${sign}${digits}e${power}`;
}

function getSpacingValue(outputSpacing: OutputSpacing) {
  if (outputSpacing === "four") return 4;
  if (outputSpacing === "compact") return 0;
  return 2;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export { prettyPrintJson, minifyJsonTokens, inspectJsonSource };
export function sortJsonKeysSafely(source: string, direction: SortDirection, spacing: OutputSpacing) {
  preflightJson(source);
  const parsed: unknown = JSON.parse(source);
  return serializeSortedJson(parsed, direction, getSpacingValue(spacing));
}
