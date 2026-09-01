"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type PathResult = {
  path: string;
  value: unknown;
};

type Segment = {
  kind: "child" | "descendant";
  selectors: Selector[];
};

type Selector =
  | { kind: "name"; name: string }
  | { kind: "wildcard" }
  | { kind: "index"; index: number }
  | {
      kind: "slice";
      start?: number;
      end?: number;
      step: number;
    }
  | { kind: "filter"; expression: string };

type EvaluationReport = {
  expression: string;
  results: PathResult[];
  warnings: string[];
  selectorSummary: string[];
  segmentCount: number;
  riskyNumbers: string[];
};

const SAMPLE_JSON = `{
  "store": {
    "book": [
      { "title": "Book A", "price": 8.95, "inStock": true },
      { "title": "Book B", "price": 12.5, "inStock": false },
      { "title": "Book C", "price": 7.25, "inStock": true }
    ],
    "bicycle": { "price": 19.95 }
  }
}`;

const PRESETS = [
  {
    label: "Cheap book titles",
    value:
      "$.store.book[?@.price < 10].title",
  },
  {
    label: "All prices",
    value: "$..price",
  },
  {
    label: "Last book",
    value: "$.store.book[-1]",
  },
  {
    label: "Reverse books",
    value: "$.store.book[::-1]",
  },
  {
    label: "Union",
    value:
      "$.store.book[0,2].title",
  },
];

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function hasOwn(
  value: Record<string, unknown>,
  key: string
) {
  return Object.prototype.hasOwnProperty.call(
    value,
    key
  );
}

function isNameFirst(char: string) {
  return (
    /[A-Za-z_]/.test(char) ||
    (char.length > 0 &&
      char.charCodeAt(0) >= 0x80)
  );
}

function isNameChar(char: string) {
  return (
    /[A-Za-z0-9_]/.test(char) ||
    (char.length > 0 &&
      char.charCodeAt(0) >= 0x80)
  );
}

function normalizedName(
  name: string
) {
  let output = "";

  for (
    let index = 0;
    index < name.length;
    index += 1
  ) {
    const unit =
      name.charCodeAt(index);
    const char =
      name.charAt(index);

    if (char === "'") {
      output += "\\'";
    } else if (char === "\\") {
      output += "\\\\";
    } else if (unit === 0x08) {
      output += "\\b";
    } else if (unit === 0x0c) {
      output += "\\f";
    } else if (unit === 0x0a) {
      output += "\\n";
    } else if (unit === 0x0d) {
      output += "\\r";
    } else if (unit === 0x09) {
      output += "\\t";
    } else if (
      unit < 0x20 ||
      (unit >= 0xd800 &&
        unit <= 0xdfff)
    ) {
      output += `\\u${unit
        .toString(16)
        .padStart(4, "0")}`;
    } else {
      output += char;
    }
  }

  return output;
}

function appendName(
  base: string,
  name: string
) {
  return `${base}['${normalizedName(
    name
  )}']`;
}

function appendIndex(
  base: string,
  index: number
) {
  return `${base}[${index}]`;
}

function readBracket(
  expression: string,
  start: number
) {
  let quote = "";
  let escaped = false;
  let depth = 1;

  for (
    let index = start + 1;
    index < expression.length;
    index += 1
  ) {
    const char =
      expression.charAt(index);

    if (escaped) {
      escaped = false;
      continue;
    }

    if (
      char === "\\" &&
      quote
    ) {
      escaped = true;
      continue;
    }

    if (quote) {
      if (char === quote) {
        quote = "";
      }
      continue;
    }

    if (
      char === "'" ||
      char === '"'
    ) {
      quote = char;
      continue;
    }

    if (char === "[") {
      depth += 1;
      continue;
    }

    if (char === "]") {
      depth -= 1;

      if (depth === 0) {
        return {
          content:
            expression
              .slice(
                start + 1,
                index
              )
              .trim(),
          nextIndex:
            index + 1,
        };
      }
    }
  }

  throw new Error(
    "Missing closing ] in JSONPath expression."
  );
}

function splitTopLevel(
  value: string,
  separator: string
) {
  const result: string[] = [];
  let current = "";
  let quote = "";
  let escaped = false;
  let bracketDepth = 0;
  let parenDepth = 0;

  for (
    let index = 0;
    index < value.length;
    index += 1
  ) {
    const char =
      value.charAt(index);

    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (
      char === "\\" &&
      quote
    ) {
      current += char;
      escaped = true;
      continue;
    }

    if (quote) {
      current += char;

      if (char === quote) {
        quote = "";
      }

      continue;
    }

    if (
      char === "'" ||
      char === '"'
    ) {
      quote = char;
      current += char;
      continue;
    }

    if (char === "[") {
      bracketDepth += 1;
      current += char;
      continue;
    }

    if (char === "]") {
      bracketDepth -= 1;
      current += char;
      continue;
    }

    if (char === "(") {
      parenDepth += 1;
      current += char;
      continue;
    }

    if (char === ")") {
      parenDepth -= 1;
      current += char;
      continue;
    }

    if (
      char === separator &&
      bracketDepth === 0 &&
      parenDepth === 0
    ) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);
  return result;
}

function decodeHexEscape(
  value: string
) {
  if (
    !/^[0-9A-Fa-f]{4}$/.test(
      value
    )
  ) {
    throw new Error(
      `Invalid Unicode escape \\u${value}.`
    );
  }

  return String.fromCharCode(
    parseInt(value, 16)
  );
}

function decodeQuotedName(
  source: string
) {
  const quote =
    source.charAt(0);

  if (
    (quote !== "'" &&
      quote !== '"') ||
    source.charAt(
      source.length - 1
    ) !== quote
  ) {
    throw new Error(
      `Invalid quoted name selector ${source}.`
    );
  }

  const inner =
    source.slice(1, -1);
  let output = "";

  for (
    let index = 0;
    index < inner.length;
    index += 1
  ) {
    const char =
      inner.charAt(index);

    if (char !== "\\") {
      if (
        char.charCodeAt(0) <
        0x20
      ) {
        throw new Error(
          "Control characters in quoted JSONPath names must be escaped."
        );
      }

      output += char;
      continue;
    }

    index += 1;

    if (index >= inner.length) {
      throw new Error(
        "Quoted name selector ends with an incomplete escape."
      );
    }

    const escaped =
      inner.charAt(index);

    if (
      escaped === quote ||
      escaped === "\\" ||
      escaped === "/"
    ) {
      output += escaped;
    } else if (
      escaped === "b"
    ) {
      output += "\b";
    } else if (
      escaped === "f"
    ) {
      output += "\f";
    } else if (
      escaped === "n"
    ) {
      output += "\n";
    } else if (
      escaped === "r"
    ) {
      output += "\r";
    } else if (
      escaped === "t"
    ) {
      output += "\t";
    } else if (
      escaped === "u"
    ) {
      const hex =
        inner.slice(
          index + 1,
          index + 5
        );

      if (hex.length !== 4) {
        throw new Error(
          "Quoted name selector contains an incomplete Unicode escape."
        );
      }

      output +=
        decodeHexEscape(hex);
      index += 4;
    } else {
      throw new Error(
        `Unsupported escape \\${escaped} in quoted JSONPath name.`
      );
    }
  }

  return output;
}

function readSafeInteger(
  value: string,
  label: string
) {
  if (
    !/^-?(?:0|[1-9]\d*)$/.test(
      value
    )
  ) {
    throw new Error(
      `${label} "${value}" is not an integer.`
    );
  }

  const number =
    Number(value);

  if (
    !Number.isSafeInteger(number)
  ) {
    throw new Error(
      `${label} ${value} is outside JavaScript's exact safe-integer range used by this browser implementation.`
    );
  }

  return number;
}

function parseSelector(
  value: string
): Selector {
  const trimmed =
    value.trim();

  if (!trimmed) {
    throw new Error(
      "JSONPath selector list contains an empty selector."
    );
  }

  if (
    trimmed.charAt(0) === "?"
  ) {
    const expression =
      trimmed.slice(1).trim();

    if (!expression) {
      throw new Error(
        "Filter selector is missing its logical expression."
      );
    }

    return {
      kind: "filter",
      expression,
    };
  }

  if (trimmed === "*") {
    return {
      kind: "wildcard",
    };
  }

  if (
    (trimmed.charAt(0) ===
      "'" &&
      trimmed.charAt(
        trimmed.length - 1
      ) === "'") ||
    (trimmed.charAt(0) ===
      '"' &&
      trimmed.charAt(
        trimmed.length - 1
      ) === '"')
  ) {
    return {
      kind: "name",
      name:
        decodeQuotedName(
          trimmed
        ),
    };
  }

  if (
    trimmed.charAt(0) ===
      "'" ||
    trimmed.charAt(0) ===
      '"' ||
    trimmed.charAt(
      trimmed.length - 1
    ) === "'" ||
    trimmed.charAt(
      trimmed.length - 1
    ) === '"'
  ) {
    throw new Error(
      `Unclosed quoted name selector ${trimmed}.`
    );
  }

  if (
    trimmed.indexOf(":") !==
    -1
  ) {
    const parts =
      trimmed.split(":");

    if (
      parts.length < 2 ||
      parts.length > 3
    ) {
      throw new Error(
        `Invalid array slice "${trimmed}".`
      );
    }

    const readOptional = (
      part: string,
      label: string
    ) => {
      const piece =
        part.trim();

      return piece
        ? readSafeInteger(
            piece,
            label
          )
        : undefined;
    };

    const start =
      readOptional(
        parts[0],
        "Slice start"
      );
    const end =
      readOptional(
        parts[1],
        "Slice end"
      );
    const stepRead =
      parts.length === 3
        ? readOptional(
            parts[2],
            "Slice step"
          )
        : undefined;

    return {
      kind: "slice",
      start,
      end,
      step:
        stepRead === undefined
          ? 1
          : stepRead,
    };
  }

  if (
    /^-?(?:0|[1-9]\d*)$/.test(
      trimmed
    )
  ) {
    return {
      kind: "index",
      index:
        readSafeInteger(
          trimmed,
          "Array index"
        ),
    };
  }

  throw new Error(
    `Unsupported selector "${trimmed}". Use quoted names, indices, wildcards, slices, filters, or a selector union.`
  );
}

function parseSelectorList(
  content: string
) {
  if (!content) {
    throw new Error(
      "JSONPath bracket segment cannot be empty."
    );
  }

  return splitTopLevel(
    content,
    ","
  ).map((item) =>
    parseSelector(item)
  );
}

function parseShorthandSelector(
  expression: string,
  index: number
) {
  if (
    expression.charAt(index) ===
    "*"
  ) {
    return {
      selector: {
        kind: "wildcard",
      } as Selector,
      nextIndex: index + 1,
    };
  }

  const first =
    expression.charAt(index);

  if (!isNameFirst(first)) {
    throw new Error(
      "Dot shorthand requires a simple member name or wildcard. Use bracketed quoted notation for spaces, punctuation, digits at the start, or other unusual names."
    );
  }

  let cursor = index + 1;

  while (
    cursor < expression.length &&
    isNameChar(
      expression.charAt(cursor)
    )
  ) {
    cursor += 1;
  }

  return {
    selector: {
      kind: "name",
      name:
        expression.slice(
          index,
          cursor
        ),
    } as Selector,
    nextIndex: cursor,
  };
}

function parseJsonPath(
  expression: string
) {
  if (
    expression.charAt(0) !== "$"
  ) {
    throw new Error(
      "A JSONPath query must start with the root identifier $."
    );
  }

  if (expression === "$") {
    return [] as Segment[];
  }

  const segments: Segment[] =
    [];
  let index = 1;

  while (
    index < expression.length
  ) {
    while (
      index < expression.length &&
      /\s/.test(
        expression.charAt(index)
      )
    ) {
      index += 1;
    }

    if (
      index >= expression.length
    ) {
      break;
    }

    if (
      expression.slice(
        index,
        index + 2
      ) === ".."
    ) {
      index += 2;

      if (
        expression.charAt(index) ===
        "["
      ) {
        const bracket =
          readBracket(
            expression,
            index
          );

        segments.push({
          kind: "descendant",
          selectors:
            parseSelectorList(
              bracket.content
            ),
        });

        index =
          bracket.nextIndex;
      } else {
        const shorthand =
          parseShorthandSelector(
            expression,
            index
          );

        segments.push({
          kind: "descendant",
          selectors: [
            shorthand.selector,
          ],
        });

        index =
          shorthand.nextIndex;
      }

      continue;
    }

    if (
      expression.charAt(index) ===
      "."
    ) {
      index += 1;
      const shorthand =
        parseShorthandSelector(
          expression,
          index
        );

      segments.push({
        kind: "child",
        selectors: [
          shorthand.selector,
        ],
      });
      index =
        shorthand.nextIndex;
      continue;
    }

    if (
      expression.charAt(index) ===
      "["
    ) {
      const bracket =
        readBracket(
          expression,
          index
        );

      segments.push({
        kind: "child",
        selectors:
          parseSelectorList(
            bracket.content
          ),
      });
      index =
        bracket.nextIndex;
      continue;
    }

    throw new Error(
      `Unsupported JSONPath syntax near "${expression.slice(
        index,
        index + 18
      )}".`
    );
  }

  return segments;
}

function normalizeBound(
  value: number,
  length: number
) {
  return value >= 0
    ? value
    : length + value;
}

function sliceIndexes(
  length: number,
  selector: Extract<
    Selector,
    { kind: "slice" }
  >
) {
  const indexes: number[] = [];
  const step =
    selector.step;

  if (step === 0) {
    return indexes;
  }

  let start: number;
  let end: number;

  if (step > 0) {
    start =
      selector.start ===
      undefined
        ? 0
        : normalizeBound(
            selector.start,
            length
          );
    end =
      selector.end ===
      undefined
        ? length
        : normalizeBound(
            selector.end,
            length
          );

    start = Math.min(
      Math.max(start, 0),
      length
    );
    end = Math.min(
      Math.max(end, 0),
      length
    );

    for (
      let index = start;
      index < end;
      index += step
    ) {
      indexes.push(index);
    }

    return indexes;
  }

  start =
    selector.start ===
    undefined
      ? length - 1
      : normalizeBound(
          selector.start,
          length
        );
  end =
    selector.end ===
    undefined
      ? -1
      : normalizeBound(
          selector.end,
          length
        );

  start = Math.min(
    Math.max(start, -1),
    length - 1
  );
  end = Math.min(
    Math.max(end, -1),
    length - 1
  );

  for (
    let index = start;
    index > end;
    index += step
  ) {
    indexes.push(index);
  }

  return indexes;
}

function childNodes(
  node: PathResult
) {
  if (
    Array.isArray(node.value)
  ) {
    return node.value.map(
      (value, index) => ({
        path: appendIndex(
          node.path,
          index
        ),
        value,
      })
    );
  }

  if (isRecord(node.value)) {
    const objectValue =
      node.value;

    return Object.keys(
      objectValue
    ).map((name) => ({
      path: appendName(
        node.path,
        name
      ),
      value:
        objectValue[name],
    }));
  }

  return [] as PathResult[];
}

function visitDescendants(
  node: PathResult,
  output: PathResult[]
) {
  output.push(node);

  childNodes(node).forEach(
    (child) =>
      visitDescendants(
        child,
        output
      )
  );
}

function findComparison(
  expression: string
) {
  const operators = [
    "==",
    "!=",
    "<=",
    ">=",
    "<",
    ">",
  ];
  let quote = "";
  let escaped = false;
  let bracketDepth = 0;
  let parenDepth = 0;

  for (
    let index = 0;
    index < expression.length;
    index += 1
  ) {
    const char =
      expression.charAt(index);

    if (escaped) {
      escaped = false;
      continue;
    }

    if (
      char === "\\" &&
      quote
    ) {
      escaped = true;
      continue;
    }

    if (quote) {
      if (char === quote) {
        quote = "";
      }
      continue;
    }

    if (
      char === "'" ||
      char === '"'
    ) {
      quote = char;
      continue;
    }

    if (char === "[") {
      bracketDepth += 1;
      continue;
    }

    if (char === "]") {
      bracketDepth -= 1;
      continue;
    }

    if (char === "(") {
      parenDepth += 1;
      continue;
    }

    if (char === ")") {
      parenDepth -= 1;
      continue;
    }

    if (
      bracketDepth === 0 &&
      parenDepth === 0
    ) {
      for (
        let opIndex = 0;
        opIndex < operators.length;
        opIndex += 1
      ) {
        const operator =
          operators[opIndex];

        if (
          expression.slice(
            index,
            index +
              operator.length
          ) === operator
        ) {
          return {
            left:
              expression
                .slice(0, index)
                .trim(),
            operator,
            right:
              expression
                .slice(
                  index +
                    operator.length
                )
                .trim(),
          };
        }
      }
    }
  }

  return null;
}

function parseFilterLiteral(
  value: string
) {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  if (value === "null") {
    return null;
  }

  if (
    /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(
      value
    )
  ) {
    const number =
      Number(value);

    if (!Number.isFinite(number)) {
      throw new Error(
        `Filter numeric literal ${value} is outside JavaScript's finite Number range in this browser implementation.`
      );
    }

    return number;
  }

  if (
    (value.charAt(0) ===
      '"' &&
      value.charAt(
        value.length - 1
      ) === '"') ||
    (value.charAt(0) ===
      "'" &&
      value.charAt(
        value.length - 1
      ) === "'")
  ) {
    return decodeQuotedName(
      value
    );
  }

  throw new Error(
    `Unsupported filter literal "${value}". This implementation supports JSON strings, numbers, true, false, and null.`
  );
}

function evaluateRelativeQuery(
  current: unknown,
  query: string
) {
  const trimmed =
    query.trim();

  if (trimmed === "@") {
    return [current];
  }

  if (
    trimmed.charAt(0) !== "@"
  ) {
    throw new Error(
      "Filter operands in this implementation must use a relative query starting with @."
    );
  }

  const segments =
    parseJsonPath(
      `$${trimmed.slice(1)}`
    );

  let nodes: PathResult[] = [
    {
      path: "$",
      value: current,
    },
  ];

  segments.forEach(
    (segment) => {
      if (
        segment.kind !== "child" ||
        segment.selectors.length !==
          1
      ) {
        throw new Error(
          "Basic filter operands support singular child queries only. Wildcards, descendant selectors, unions, slices, and nested filters are outside this browser subset."
        );
      }

      const selector =
        segment.selectors[0];

      if (
        selector.kind !== "name" &&
        selector.kind !== "index"
      ) {
        throw new Error(
          "Basic filter operands support member-name and array-index selectors only."
        );
      }

      const next: PathResult[] =
        [];

      nodes.forEach(
        (node) => {
          if (
            selector.kind ===
            "name"
          ) {
            if (
              isRecord(
                node.value
              ) &&
              hasOwn(
                node.value,
                selector.name
              )
            ) {
              next.push({
                path:
                  appendName(
                    node.path,
                    selector.name
                  ),
                value:
                  node.value[
                    selector.name
                  ],
              });
            }
          } else if (
            Array.isArray(
              node.value
            )
          ) {
            const resolved =
              selector.index < 0
                ? node.value
                    .length +
                  selector.index
                : selector.index;

            if (
              resolved >= 0 &&
              resolved <
                node.value.length
            ) {
              next.push({
                path:
                  appendIndex(
                    node.path,
                    resolved
                  ),
                value:
                  node.value[
                    resolved
                  ],
              });
            }
          }
        }
      );

      nodes = next;
    }
  );

  return nodes.map(
    (node) => node.value
  );
}

function compareValues(
  left: unknown,
  right: unknown,
  operator: string
) {
  if (operator === "==") {
    return left === right;
  }

  if (operator === "!=") {
    return left !== right;
  }

  if (
    typeof left ===
      "number" &&
    typeof right === "number"
  ) {
    if (operator === "<") {
      return left < right;
    }
    if (operator === "<=") {
      return left <= right;
    }
    if (operator === ">") {
      return left > right;
    }
    if (operator === ">=") {
      return left >= right;
    }
  }

  if (
    typeof left ===
      "string" &&
    typeof right === "string"
  ) {
    if (operator === "<") {
      return left < right;
    }
    if (operator === "<=") {
      return left <= right;
    }
    if (operator === ">") {
      return left > right;
    }
    if (operator === ">=") {
      return left >= right;
    }
  }

  return false;
}

function evaluateBasicFilter(
  current: unknown,
  expression: string
) {
  if (
    expression.indexOf("&&") !==
      -1 ||
    expression.indexOf("||") !==
      -1 ||
    /^\s*!/.test(expression) ||
    /\b(?:length|count|match|search|value)\s*\(/.test(
      expression
    )
  ) {
    throw new Error(
      "This browser implementation intentionally supports only one existence test or one primitive comparison per filter. Logical operators and RFC function extensions are not implemented."
    );
  }

  const comparison =
    findComparison(expression);

  if (!comparison) {
    return (
      evaluateRelativeQuery(
        current,
        expression
      ).length > 0
    );
  }

  if (
    !comparison.left ||
    !comparison.right
  ) {
    throw new Error(
      "Filter comparison is missing a left or right operand."
    );
  }

  const leftValues =
    evaluateRelativeQuery(
      current,
      comparison.left
    );
  const right =
    parseFilterLiteral(
      comparison.right
    );

  return leftValues.some(
    (left) =>
      compareValues(
        left,
        right,
        comparison.operator
      )
  );
}

function applySelector(
  node: PathResult,
  selector: Selector
): PathResult[] {
  if (
    selector.kind === "name"
  ) {
    if (
      !isRecord(node.value) ||
      !hasOwn(
        node.value,
        selector.name
      )
    ) {
      return [];
    }

    return [
      {
        path: appendName(
          node.path,
          selector.name
        ),
        value:
          node.value[
            selector.name
          ],
      },
    ];
  }

  if (
    selector.kind ===
    "wildcard"
  ) {
    return childNodes(node);
  }

  if (
    selector.kind === "index"
  ) {
    if (
      !Array.isArray(node.value)
    ) {
      return [];
    }

    const resolved =
      selector.index < 0
        ? node.value.length +
          selector.index
        : selector.index;

    if (
      resolved < 0 ||
      resolved >=
        node.value.length
    ) {
      return [];
    }

    return [
      {
        path: appendIndex(
          node.path,
          resolved
        ),
        value:
          node.value[resolved],
      },
    ];
  }

  if (
    selector.kind === "slice"
  ) {
    if (
      !Array.isArray(node.value)
    ) {
      return [];
    }

    const arrayValue =
      node.value;

    return sliceIndexes(
      arrayValue.length,
      selector
    ).map((index) => ({
      path: appendIndex(
        node.path,
        index
      ),
      value:
        arrayValue[index],
    }));
  }

  return childNodes(node).filter(
    (child) =>
      evaluateBasicFilter(
        child.value,
        selector.expression
      )
  );
}

function evaluateJsonPath(
  data: unknown,
  segments: Segment[]
) {
  let current: PathResult[] = [
    {
      path: "$",
      value: data,
    },
  ];

  segments.forEach(
    (segment) => {
      const next: PathResult[] =
        [];

      if (
        segment.kind === "child"
      ) {
        current.forEach(
          (node) => {
            segment.selectors.forEach(
              (selector) => {
                applySelector(
                  node,
                  selector
                ).forEach(
                  (result) =>
                    next.push(
                      result
                    )
                );
              }
            );
          }
        );
      } else {
        current.forEach(
          (node) => {
            const visited: PathResult[] =
              [];
            visitDescendants(
              node,
              visited
            );

            visited.forEach(
              (candidate) => {
                segment.selectors.forEach(
                  (selector) => {
                    applySelector(
                      candidate,
                      selector
                    ).forEach(
                      (result) =>
                        next.push(
                          result
                        )
                    );
                  }
                );
              }
            );
          }
        );
      }

      current = next;
    }
  );

  return current;
}

function selectorLabel(
  selector: Selector
) {
  if (
    selector.kind === "name"
  ) {
    return `member name "${selector.name}"`;
  }

  if (
    selector.kind ===
    "wildcard"
  ) {
    return "wildcard";
  }

  if (
    selector.kind === "index"
  ) {
    return `array index ${selector.index}`;
  }

  if (
    selector.kind === "slice"
  ) {
    return `array slice ${
      selector.start ===
      undefined
        ? ""
        : selector.start
    }:${
      selector.end ===
      undefined
        ? ""
        : selector.end
    }:${selector.step}`;
  }

  return `filter ?${selector.expression}`;
}

function describeSegments(
  segments: Segment[]
) {
  if (!segments.length) {
    return [
      "Root identifier only: selects the entire query argument.",
    ];
  }

  return segments.map(
    (segment, index) =>
      `Segment ${index + 1}: ${
        segment.kind ===
        "descendant"
          ? "descendant"
          : "child"
      } selector${
        segment.selectors
          .length === 1
          ? ""
          : "s"
      } — ${segment.selectors
        .map(selectorLabel)
        .join(", ")}`
  );
}

function riskyJsonNumbers(
  source: string
) {
  const values: string[] = [];
  let inString = false;
  let escaped = false;

  for (
    let index = 0;
    index < source.length;
    index += 1
  ) {
    const char =
      source.charAt(index);

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (
        char === "\\"
      ) {
        escaped = true;
      } else if (
        char === '"'
      ) {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (
      char === "-" ||
      /\d/.test(char)
    ) {
      const match =
        source
          .slice(index)
          .match(
            /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/
          );

      if (match) {
        const token =
          match[0];
        const numeric =
          Number(token);
        const integer =
          /^-?(?:0|[1-9]\d*)$/.test(
            token
          );
        let risky = false;

        if (integer) {
          const digits =
            token
              .replace(/^-/, "")
              .replace(
                /^0+/,
                ""
              ) || "0";
          const max =
            "9007199254740991";

          risky =
            digits.length >
              max.length ||
            (digits.length ===
              max.length &&
              digits > max);
        } else {
          const mantissa =
            token.split(
              /[eE]/
            )[0];
          const digits =
            mantissa
              .replace(
                /[-.]/g,
                ""
              )
              .replace(
                /^0+/,
                ""
              );

          risky =
            digits.length > 15 ||
            !Number.isFinite(
              numeric
            );
        }

        if (
          risky &&
          values.indexOf(
            token
          ) === -1
        ) {
          values.push(token);
        }

        index +=
          token.length - 1;
      }
    }
  }

  return values;
}

function valueType(
  value: unknown
) {
  if (value === null) {
    return "null";
  }

  if (Array.isArray(value)) {
    return "array";
  }

  return typeof value;
}

function displayValue(
  value: unknown
) {
  if (
    typeof value === "string"
  ) {
    return JSON.stringify(value);
  }

  const serialized =
    JSON.stringify(
      value,
      null,
      2
    );

  return serialized === undefined
    ? String(value)
    : serialized;
}

function buildReport(
  jsonSource: string,
  expression: string
): EvaluationReport {
  let data: unknown;

  try {
    data = JSON.parse(
      jsonSource
    ) as unknown;
  } catch (caught) {
    throw new Error(
      `JSON input is invalid: ${
        caught instanceof Error
          ? caught.message
          : "JSON.parse failed."
      }`
    );
  }

  const segments =
    parseJsonPath(expression);
  const results =
    evaluateJsonPath(
      data,
      segments
    );
  const riskyNumbers =
    riskyJsonNumbers(
      jsonSource
    );
  const warnings: string[] =
    [];

  if (!results.length) {
    warnings.push(
      "The query is syntactically accepted by this implementation but selected no nodes. An empty nodelist is a normal JSONPath result; it is not automatically an error."
    );
  }

  if (riskyNumbers.length) {
    warnings.push(
      "The JSON contains numeric tokens that ordinary JavaScript Number values may round or overflow. JSON.parse is used by this browser implementation, so filter comparisons against those values may not preserve the exact source-number semantics you expect."
    );
  }

  const uniquePaths: string[] =
    [];
  results.forEach((result) => {
    if (
      uniquePaths.indexOf(
        result.path
      ) === -1
    ) {
      uniquePaths.push(
        result.path
      );
    }
  });

  if (
    uniquePaths.length !==
    results.length
  ) {
    warnings.push(
      "The result nodelist contains the same node more than once. JSONPath nodelists are ordered lists and can contain duplicates; this tester preserves that instead of silently deduplicating the result."
    );
  }

  return {
    expression,
    results,
    warnings,
    selectorSummary:
      describeSegments(
        segments
      ),
    segmentCount:
      segments.length,
    riskyNumbers,
  };
}

function formatReport(
  report: EvaluationReport
) {
  const lines = [
    `JSONPath: ${report.expression}`,
    `Matched nodes: ${report.results.length}`,
    "",
    "Query structure:",
    ...report.selectorSummary.map(
      (item) => `- ${item}`
    ),
    "",
    "Matches:",
  ];

  if (!report.results.length) {
    lines.push(
      "(empty nodelist)"
    );
  } else {
    report.results.forEach(
      (result, index) => {
        lines.push(
          `${index + 1}. ${result.path}`,
          `   type: ${valueType(
            result.value
          )}`,
          `   value: ${displayValue(
            result.value
          )
            .replace(/\n/g, "\n   ")}`
        );
      }
    );
  }

  if (
    report.riskyNumbers.length
  ) {
    lines.push(
      "",
      "Numeric precision review:",
      ...report.riskyNumbers
        .slice(0, 12)
        .map(
          (value) =>
            `- ${value}`
        )
    );
  }

  if (report.warnings.length) {
    lines.push(
      "",
      "Warnings:",
      ...report.warnings.map(
        (warning) =>
          `- ${warning}`
      )
    );
  }

  lines.push(
    "",
    "Scope: practical RFC 9535 selector subset; complete filter logical expressions and function extensions are not implemented."
  );

  return lines.join("\n");
}

export default function ToolClient() {
  const [jsonInput, setJsonInput] =
    useState(SAMPLE_JSON);
  const [pathInput, setPathInput] =
    useState(
      "$.store.book[?@.price < 10].title"
    );
  const [report, setReport] =
    useState<EvaluationReport | null>(
      null
    );
  const [error, setError] =
    useState("");
  const [copied, setCopied] =
    useState(false);

  const clearResult = () => {
    setReport(null);
    setError("");
    setCopied(false);
  };

  const testPath = () => {
    if (!jsonInput.trim()) {
      setError(
        "Paste JSON data to query."
      );
      setReport(null);
      return;
    }

    if (!pathInput.trim()) {
      setError(
        "Enter a JSONPath expression."
      );
      setReport(null);
      return;
    }

    try {
      setReport(
        buildReport(
          jsonInput,
          pathInput.trim()
        )
      );
      setError("");
      setCopied(false);
    } catch (caught) {
      setReport(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to evaluate this JSONPath."
      );
      setCopied(false);
    }
  };

  const loadExample = () => {
    setJsonInput(
      SAMPLE_JSON
    );
    setPathInput(
      "$.store.book[?@.price < 10].title"
    );
    clearResult();
  };

  const resetAll = () => {
    setJsonInput("");
    setPathInput("");
    clearResult();
  };

  const copyReport = async () => {
    if (!report) return;

    try {
      await navigator.clipboard.writeText(
        formatReport(report)
      );
      setCopied(true);
      window.setTimeout(
        () => setCopied(false),
        1400
      );
    } catch {
      setCopied(false);
      setError(
        "The JSONPath report could not be copied. Select and copy it manually."
      );
    }
  };

  return (
    <ToolShell
      title="JSONPath Tester"
      description="Test a practical RFC 9535 JSONPath subset against JSON and inspect the resulting ordered nodelist using normalized result paths, instead of reducing every query to a single JavaScript value."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-gray-900">
            JSON query argument
          </label>
          <textarea
            value={jsonInput}
            onChange={(event: {
              target: { value: string };
            }) => {
              setJsonInput(
                event.target.value
              );
              clearResult();
            }}
            rows={17}
            placeholder={SAMPLE_JSON}
            spellCheck={false}
            className="mt-2 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900">
            JSONPath query
          </label>
          <input
            value={pathInput}
            onChange={(event: {
              target: { value: string };
            }) => {
              setPathInput(
                event.target.value
              );
              clearResult();
            }}
            placeholder="$.store.book[*].title"
            spellCheck={false}
            className="mt-2 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900">
              Supported here
            </p>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Root <code>$</code>, dot-name shorthand, quoted bracket names,
              wildcards, indices including negative indices, slices including
              negative steps, descendant segments, selector unions, existence
              filters, and one primitive comparison per filter.
            </p>
          </div>

          <div className="mt-5">
            <p className="text-sm font-medium text-gray-700">
              Try a query
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {PRESETS.map(
                (preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => {
                      setPathInput(
                        preset.value
                      );
                      clearResult();
                    }}
                    className="yoryantra-btn-outline"
                  >
                    {preset.label}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-900">
            Complete RFC filter logic such as <code>&amp;&amp;</code>,{" "}
            <code>||</code>, negation, nested logical expressions, and function
            extensions such as <code>length()</code> are deliberately rejected
            rather than approximated.
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={testPath}
          className="yoryantra-btn"
        >
          Test JSONPath
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
        <div className="mt-6 whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      {report ? (
        <div className="mt-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat
              label="Matched nodes"
              value={String(
                report.results.length
              )}
            />
            <Stat
              label="Query segments"
              value={String(
                report.segmentCount
              )}
            />
            <Stat
              label="Risky JSON numbers"
              value={String(
                report.riskyNumbers
                  .length
              )}
            />
          </div>

          {report.warnings.length ? (
            <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-900">
              <strong>
                Query review:
              </strong>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                {report.warnings.map(
                  (warning, index) => (
                    <li
                      key={`${warning}-${index}`}
                    >
                      {warning}
                    </li>
                  )
                )}
              </ul>
            </div>
          ) : null}

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Ordered result nodelist
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Result locations use canonical bracket-style normalized paths.
                </p>
              </div>

              <button
                type="button"
                onClick={copyReport}
                className="yoryantra-btn-outline whitespace-nowrap"
              >
                {copied
                  ? "Copied"
                  : "Copy Report"}
              </button>
            </div>

            {report.results.length ? (
              <div className="mt-5 space-y-4">
                {report.results.map(
                  (result, index) => (
                    <div
                      key={`${result.path}-${index}`}
                      className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600">
                          {index + 1}
                        </span>
                        <code className="break-all text-sm font-semibold text-gray-900">
                          {result.path}
                        </code>
                        <span className="text-xs text-gray-500">
                          {valueType(
                            result.value
                          )}
                        </span>
                      </div>
                      <pre className="mt-3 overflow-auto whitespace-pre-wrap break-words font-mono text-sm leading-6 text-gray-700">
                        {displayValue(
                          result.value
                        )}
                      </pre>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-600">
                Empty nodelist — the query selected no nodes.
              </div>
            )}
          </div>

          <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="text-lg font-semibold text-gray-900">
              How the query was read
            </h3>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-gray-700">
              {report.selectorSummary.map(
                (item, index) => (
                  <li
                    key={`${item}-${index}`}
                  >
                    {item}
                  </li>
                )
              )}
            </ol>
          </div>
        </div>
      ) : (
        <pre className="yoryantra-output mt-8 min-h-[280px] overflow-auto whitespace-pre-wrap break-words text-sm">
          Matched node values, normalized result paths, selector interpretation,
          and precision warnings will appear here.
        </pre>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        JSON parsing and JSONPath evaluation run on the supplied text in your
        browser. The data is not sent to a query API. Site-wide analytics or
        advertising scripts, if enabled, are separate from this operation.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            JSONPath Selects Nodes and Locations, Not Just “Whatever Value Comes Back”
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JSONPath is a query language over a JSON value viewed as a tree of
            nodes. A result is an ordered nodelist. Every matched node has both
            a value and a location inside the original JSON tree.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            That distinction matters when two different fields both contain{" "}
            <code>19.95</code>. Returning the scalar alone loses which one was
            selected. This tester therefore displays normalized paths such as{" "}
            <code>$['store']['book'][0]['price']</code> beside the value.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Dot Notation Is Convenient Input; Bracket Notation Is the Stable Result Form
          </h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-white p-4 text-sm leading-7 text-gray-800">{`Input query
$.store.book[0].title

Normalized result path
$['store']['book'][0]['title']`}</pre>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 9535 defines Normalized Paths with bracket notation, single
            quotes for member names, and non-negative array indices. A negative
            query such as <code>$[-1]</code> can therefore return a result path
            such as <code>$[2]</code> when the matched array has three items.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Normalized paths are useful for test fixtures and debugging because
            each one identifies one specific node in that particular JSON value.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            An Empty Result Is Different From null, false, 0, or an Empty String
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            If <code>$.user.middleName</code> finds no such member, the result is
            an empty nodelist. If the member exists and its JSON value is{" "}
            <code>null</code>, the result contains one node whose value is null.
            The same distinction applies to false, zero, and empty strings.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This is one reason a JSONPath tester should report match count and
            paths rather than showing only a formatted JSON value.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            Selector Unions Can Select the Same Node More Than Once
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            JSONPath nodelists are ordered and can contain duplicate nodes.
            Querying the same member or index through two selectors does not
            require an implementation to silently turn the result into a set.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            Yoryantra preserves duplicate result entries and warns when their
            normalized paths repeat. Deduplicate only when your consuming
            workflow specifically wants set-like behavior.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Array Slices Are Directional—and Step Zero Selects Nothing
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            <code>[1:5:2]</code> walks forward from index 1 and selects indices
            1 and 3. <code>[5:1:-2]</code> walks backward and selects 5 and 3.
            <code>[::-1]</code> reverses an array&apos;s nodes.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 9535 makes one behavior especially explicit: a slice step of{" "}
            <code>0</code> selects no elements. It is not a syntax error and
            does not behave like Python&apos;s slice exception.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Descendant Selection Can Expand a Query Much More Than It Looks
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            <code>$..price</code> visits descendants and selects matching price
            members at multiple depths. On a small API response that is handy.
            On deeply nested or very large JSON, descendant queries can examine
            many nodes and return values that belong to unrelated parts of the
            document.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Prefer a more specific child path when you already know the
            structure and need a predictable business field rather than a broad
            discovery query.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Filters Are Where “Supports JSONPath” Stops Being a Precise Claim
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 9535 defines a full logical-expression grammar and standardized
            function-extension mechanism. Many older libraries predate that
            standard and support different operators, scripting expressions, or
            host-language callbacks.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This browser tester deliberately implements a smaller filter layer:
            an existence query such as <code>?@.isbn</code> or one primitive
            comparison such as <code>?@.price &lt; 10</code>. It rejects logical
            operators and function extensions rather than silently giving them
            non-standard meaning.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            JavaScript Number Precision Can Affect a Perfectly Valid JSONPath Comparison
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JSON can contain integer or decimal tokens whose exact mathematical
            value is outside the precision of JavaScript&apos;s Number type. This
            tool uses the browser&apos;s JSON parser, so a filter comparing those
            values inherits that numeric representation.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The tester scans the source for suspicious numeric tokens and warns
            before you trust a comparison involving very large identifiers or
            high-precision decimal data. If exact decimal/integer semantics
            matter, use a JSONPath implementation backed by the numeric model
            required by your application.
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-relaxed text-gray-700">
          <a
            href="https://www.rfc-editor.org/rfc/rfc9535.html"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--green)] underline underline-offset-4"
          >
            RFC 9535: JSONPath
          </a>{" "}
          is directly relevant because JSONPath became an IETF Standards Track
          specification in 2024. It defines selectors, slices, filters,
          nodelists, descendant segments, and Normalized Paths. The tool states
          its filter subset explicitly instead of claiming full RFC coverage.
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <YoryantraRelatedTools currentHref="/tools/json-path-tester" />
        </div>
      </section>
    </ToolShell>
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
      <div className="mt-2 text-xl font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}
