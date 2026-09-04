"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type IssueLevel =
  | "Warning"
  | "Note";

type StructuredIssue = {
  level: IssueLevel;
  path: string;
  message: string;
};

type EntityNode = {
  path: string;
  types: string[];
  id: string;
  context: string;
  properties: string[];
  referenceOnly: boolean;
};

type JsonLdDocument = {
  label: string;
  value: unknown;
  source: string;
  duplicateKeys: string[];
};

type StructuredReport = {
  documents: JsonLdDocument[];
  nodes: EntityNode[];
  issues: StructuredIssue[];
  typeNames: string[];
  duplicateIds: Array<{
    id: string;
    paths: string[];
  }>;
  htmlInput: boolean;
};

const MAX_INPUT_CHARACTERS = 2_000_000;
const MAX_PAGE_URL_CHARACTERS = 4_096;

const SAMPLE_JSON_LD = `{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://example.com/articles/json-ld#article",
  "headline": "Understanding JSON-LD",
  "url": "https://example.com/articles/json-ld",
  "datePublished": "2026-08-20",
  "author": {
    "@type": "Person",
    "name": "Sneha"
  }
}`;

const JSON_LD_KEYWORDS = [
  "@base",
  "@container",
  "@context",
  "@direction",
  "@graph",
  "@id",
  "@import",
  "@included",
  "@index",
  "@json",
  "@language",
  "@list",
  "@nest",
  "@none",
  "@prefix",
  "@propagate",
  "@protected",
  "@reverse",
  "@set",
  "@type",
  "@value",
  "@version",
  "@vocab",
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

function uniqueStrings(
  values: string[]
) {
  const result: string[] = [];

  values.forEach((value) => {
    if (
      result.indexOf(
        value
      ) === -1
    ) {
      result.push(value);
    }
  });

  return result;
}

function normalizePageUrl(
  raw: string
) {
  const value = raw.trim();

  if (!value) return "";

  try {
    const parsed =
      new URL(value);

    if (
      parsed.protocol !== "http:" &&
      parsed.protocol !== "https:"
    ) {
      return "";
    }

    if (
      parsed.username ||
      parsed.password
    ) {
      return "";
    }

    parsed.hash = "";

    return parsed.href;
  } catch {
    return "";
  }
}

function jsonErrorMessage(
  caught: unknown
) {
  return caught instanceof Error
    ? caught.message
    : "JSON parsing failed.";
}

function detectDuplicateJsonKeys(
  source: string
) {
  const duplicates: string[] =
    [];
  const stack: Array<{
    type: "object" | "array";
    keys?: Set<string>;
  }> = [];
  let index = 0;

  const stringEnd = (
    start: number
  ) => {
    let escaped = false;

    for (
      let cursor = start + 1;
      cursor < source.length;
      cursor += 1
    ) {
      const char =
        source.charAt(cursor);

      if (escaped) {
        escaped = false;
      } else if (
        char === "\\"
      ) {
        escaped = true;
      } else if (
        char === '"'
      ) {
        return cursor;
      }
    }

    return source.length - 1;
  };

  while (
    index < source.length
  ) {
    const char =
      source.charAt(index);

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    if (char === "{") {
      stack.push({
        type: "object",
        keys:
          new Set<string>(),
      });
      index += 1;
      continue;
    }

    if (char === "[") {
      stack.push({
        type: "array",
      });
      index += 1;
      continue;
    }

    if (
      char === "}" ||
      char === "]"
    ) {
      stack.pop();
      index += 1;
      continue;
    }

    if (char === '"') {
      const end =
        stringEnd(index);
      const raw =
        source.slice(
          index,
          end + 1
        );
      let cursor =
        end + 1;

      while (
        cursor <
          source.length &&
        /\s/.test(
          source.charAt(
            cursor
          )
        )
      ) {
        cursor += 1;
      }

      const current =
        stack[
          stack.length - 1
        ];

      if (
        current &&
        current.type ===
          "object" &&
        current.keys &&
        source.charAt(
          cursor
        ) === ":"
      ) {
        try {
          const key =
            JSON.parse(
              raw
            ) as string;

          if (
            current.keys.has(
              key
            )
          ) {
            duplicates.push(
              key
            );
          } else {
            current.keys.add(
              key
            );
          }
        } catch {
          // The main JSON parse reports syntax errors.
        }
      }

      index = end + 1;
      continue;
    }

    index += 1;
  }

  return uniqueStrings(
    duplicates
  );
}

function extractJsonLdDocuments(
  source: string
) {
  const trimmed =
    source.trim();

  if (!trimmed) {
    throw new Error(
      "Paste raw JSON-LD or HTML containing JSON-LD."
    );
  }

  if (
    trimmed.charAt(0) !== "<"
  ) {
    try {
      return {
        htmlInput: false,
        documents: [
          {
            label:
              "Raw JSON-LD",
            value:
              JSON.parse(
                trimmed
              ) as unknown,
            source: trimmed,
            duplicateKeys:
              detectDuplicateJsonKeys(
                trimmed
              ),
          },
        ],
      };
    } catch (caught) {
      throw new Error(
        `Invalid JSON-LD JSON: ${jsonErrorMessage(
          caught
        )}`
      );
    }
  }

  if (
    typeof window ===
    "undefined"
  ) {
    throw new Error(
      "HTML extraction must run in the browser."
    );
  }

  const document =
    new DOMParser().parseFromString(
      source,
      "text/html"
    );
  const scripts =
    Array.from(
      document.getElementsByTagName(
        "script"
      )
    ).filter((script) => {
      const type =
        (
          script.getAttribute(
            "type"
          ) || ""
        )
          .trim()
          .toLowerCase();

      return (
        type
          .split(";")[0]
          .trim() ===
        "application/ld+json"
      );
    });

  if (!scripts.length) {
    throw new Error(
      'No <script type="application/ld+json"> block was found in the pasted HTML.'
    );
  }

  const documents: JsonLdDocument[] =
    scripts.map(
      (script, index) => {
        const text =
          (
            script.textContent ||
            ""
          ).trim();

        if (!text) {
          throw new Error(
            `JSON-LD script ${
              index + 1
            } is empty.`
          );
        }

        try {
          return {
            label: `JSON-LD script ${
              index + 1
            }`,
            value:
              JSON.parse(
                text
              ) as unknown,
            source: text,
            duplicateKeys:
              detectDuplicateJsonKeys(
                text
              ),
          };
        } catch (caught) {
          throw new Error(
            `JSON-LD script ${
              index + 1
            } contains invalid JSON: ${jsonErrorMessage(
              caught
            )}`
          );
        }
      }
    );

  return {
    htmlInput: true,
    documents,
  };
}

function describeContext(
  value: unknown
) {
  if (
    typeof value === "string"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (
          typeof item ===
          "string"
        ) {
          return item;
        }

        if (isRecord(item)) {
          return "{…}";
        }

        return String(item);
      })
      .join(", ");
  }

  if (isRecord(value)) {
    return "{local context}";
  }

  return "";
}

function contextLooksSchemaOrg(
  value: unknown
): boolean {
  if (
    typeof value === "string"
  ) {
    return /^https?:\/\/schema\.org\/?$/i.test(
      value.trim()
    );
  }

  if (Array.isArray(value)) {
    return value.some(
      (item) =>
        contextLooksSchemaOrg(
          item
        )
    );
  }

  if (isRecord(value)) {
    const vocab =
      value["@vocab"];

    return (
      typeof vocab ===
        "string" &&
      /^https?:\/\/schema\.org\/?$/i.test(
        vocab.trim()
      )
    );
  }

  return false;
}

function readTypes(
  value: unknown,
  path: string,
  issues: StructuredIssue[]
) {
  if (
    value === undefined
  ) {
    return [] as string[];
  }

  if (
    typeof value === "string"
  ) {
    if (!value.trim()) {
      issues.push({
        level: "Warning",
        path: `${path}['@type']`,
        message:
          "@type is present but empty.",
      });

      return [];
    }

    return [
      value.trim(),
    ];
  }

  if (Array.isArray(value)) {
    const result: string[] =
      [];

    value.forEach(
      (item, index) => {
        if (
          typeof item ===
            "string" &&
          item.trim()
        ) {
          result.push(
            item.trim()
          );
        } else {
          issues.push({
            level:
              "Warning",
            path: `${path}['@type'][${index}]`,
            message:
              "@type arrays should contain non-empty type strings.",
          });
        }
      }
    );

    return uniqueStrings(
      result
    );
  }

  issues.push({
    level: "Warning",
    path: `${path}['@type']`,
    message:
      "@type should be a string or an array of strings.",
  });

  return [];
}

function appendPath(
  path: string,
  key: string
) {
  return `${path}['${key
    .replace(/\\/g, "\\\\")
    .replace(
      /'/g,
      "\\'"
    )}']`;
}

function validJsonLdKeyword(
  key: string
) {
  return (
    JSON_LD_KEYWORDS.indexOf(
      key
    ) !== -1
  );
}

function resolvePossibleUrl(
  value: string,
  pageUrl: string
) {
  const raw = value.trim();

  if (!raw) {
    return {
      valid: false,
      absolute: false,
      resolved: "",
      fragmentOnly: false,
    };
  }

  if (
    raw.charAt(0) === "#"
  ) {
    if (!pageUrl) {
      return {
        valid: true,
        absolute: false,
        resolved: raw,
        fragmentOnly: true,
      };
    }

    try {
      return {
        valid: true,
        absolute: false,
        resolved:
          new URL(
            raw,
            pageUrl
          ).href,
        fragmentOnly: true,
      };
    } catch {
      return {
        valid: false,
        absolute: false,
        resolved: "",
        fragmentOnly: true,
      };
    }
  }

  try {
    const absolute =
      /^[A-Za-z][A-Za-z0-9+.-]*:/.test(
        raw
      );

    if (absolute) {
      return {
        valid: true,
        absolute: true,
        resolved: raw,
        fragmentOnly: false,
      };
    }

    if (pageUrl) {
      return {
        valid: true,
        absolute: false,
        resolved:
          new URL(
            raw,
            pageUrl
          ).href,
        fragmentOnly: false,
      };
    }

    return {
      valid: true,
      absolute: false,
      resolved: raw,
      fragmentOnly: false,
    };
  } catch {
    return {
      valid: false,
      absolute: false,
      resolved: "",
      fragmentOnly: false,
    };
  }
}

function looksDateLikeProperty(
  key: string
) {
  return [
    "datePublished",
    "dateModified",
    "startDate",
    "endDate",
    "uploadDate",
    "expires",
    "validFrom",
    "validThrough",
  ].indexOf(key) !== -1;
}

function validLooseIsoDate(
  value: string
) {
  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  ) {
    const date =
      new Date(
        `${value}T00:00:00Z`
      );

    return (
      !Number.isNaN(
        date.getTime()
      ) &&
      date
        .toISOString()
        .slice(0, 10) ===
        value
    );
  }

  if (
    /^\d{4}-\d{2}-\d{2}T/.test(
      value
    )
  ) {
    const calendarDate = value.slice(0, 10);
    const date = new Date(`${calendarDate}T00:00:00Z`);

    return (
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === calendarDate &&
      !Number.isNaN(Date.parse(value))
    );
  }

  return false;
}

function inspectKnownPropertyShape(
  key: string,
  value: unknown,
  path: string,
  pageUrl: string,
  issues: StructuredIssue[]
) {
  if (
    [
      "url",
      "sameAs",
      "mainEntityOfPage",
    ].indexOf(key) !== -1
  ) {
    const values =
      Array.isArray(value)
        ? value
        : [value];

    values.forEach(
      (item, index) => {
        if (
          typeof item ===
          "string"
        ) {
          const info =
            resolvePossibleUrl(
              item,
              pageUrl
            );

          if (!info.valid) {
            issues.push({
              level:
                "Warning",
              path: Array.isArray(
                value
              )
                ? `${path}[${index}]`
                : path,
              message:
                `${key} contains a string that could not be interpreted as an IRI/URL reference.`,
            });
          } else if (
            !info.absolute
          ) {
            issues.push({
              level: "Note",
              path: Array.isArray(
                value
              )
                ? `${path}[${index}]`
                : path,
              message:
                `${key} is relative${
                  info.resolved
                    ? ` and resolves to ${info.resolved}`
                    : ""
                }. Relative IRIs can be meaningful in JSON-LD, while public search markup is usually easier to audit with stable absolute URLs.`,
            });
          }
        } else if (
          key === "url" &&
          !isRecord(item)
        ) {
          issues.push({
            level: "Note",
            path,
            message:
              "url is not a string or node object. Confirm the value shape against the vocabulary/consumer you are targeting.",
          });
        }
      }
    );
  }

  if (
    looksDateLikeProperty(
      key
    )
  ) {
    const values =
      Array.isArray(value)
        ? value
        : [value];

    values.forEach(
      (item, index) => {
        if (
          typeof item ===
            "string" &&
          !validLooseIsoDate(
            item
          )
        ) {
          issues.push({
            level: "Note",
            path: Array.isArray(
              value
            )
              ? `${path}[${index}]`
              : path,
            message:
              `${key} "${item}" is not a simple ISO date/date-time recognized by this structural review. Schema.org and Google feature-specific rules can be more specific than this generic check.`,
          });
        }
      }
    );
  }

  if (
    [
      "name",
      "headline",
      "description",
    ].indexOf(key) !== -1 &&
    typeof value === "string" &&
    !value.trim()
  ) {
    issues.push({
      level: "Warning",
      path,
      message:
        `${key} is present but empty.`,
    });
  }
}

function inspectValue(
  value: unknown,
  path: string,
  inheritedContext: unknown,
  pageUrl: string,
  nodes: EntityNode[],
  issues: StructuredIssue[],
  topLevel: boolean
) {
  if (Array.isArray(value)) {
    value.forEach(
      (item, index) =>
        inspectValue(
          item,
          `${path}[${index}]`,
          inheritedContext,
          pageUrl,
          nodes,
          issues,
          topLevel
        )
    );
    return;
  }

  if (!isRecord(value)) {
    if (topLevel) {
      issues.push({
        level: "Warning",
        path,
        message:
          "A top-level JSON-LD value is not an object or array of objects.",
      });
    }
    return;
  }

  Object.keys(value)
    .filter(
      (key) =>
        key.charAt(0) ===
          "@" &&
        !validJsonLdKeyword(
          key
        )
    )
    .forEach((key) => {
      issues.push({
        level: "Warning",
        path:
          appendPath(
            path,
            key
          ),
        message:
          `"${key}" looks like a JSON-LD keyword but is not one of the standard JSON-LD 1.1 keywords recognized by this structural review.`,
      });
    });

  const localContext =
    hasOwn(
      value,
      "@context"
    )
      ? value["@context"]
      : inheritedContext;
  const contextText =
    describeContext(
      localContext
    );

  if (
    hasOwn(
      value,
      "@context"
    )
  ) {
    const contextValue =
      value["@context"];

    if (
      !(
        typeof contextValue ===
          "string" ||
        Array.isArray(
          contextValue
        ) ||
        isRecord(
          contextValue
        ) ||
        contextValue === null
      )
    ) {
      issues.push({
        level: "Warning",
        path: `${path}['@context']`,
        message:
          "@context has an unexpected primitive type.",
      });
    }

    if (
      topLevel &&
      !contextLooksSchemaOrg(
        contextValue
      )
    ) {
      issues.push({
        level: "Note",
        path: `${path}['@context']`,
        message:
          "The top-level context is not a simple Schema.org context recognized by this structural review. That can be valid JSON-LD, but Schema.org/Google-specific expectations should not be assumed.",
      });
    }
  } else if (
    topLevel &&
    !inheritedContext
  ) {
    issues.push({
      level: "Warning",
      path,
      message:
        "No top-level @context is visible. Raw JSON-LD needs context information to map compact terms such as Article, name, and author to IRIs.",
    });
  }

  const types =
    readTypes(
      value["@type"],
      path,
      issues
    );
  const id =
    value["@id"];

  if (
    id !== undefined &&
    typeof id !== "string"
  ) {
    issues.push({
      level: "Warning",
      path: `${path}['@id']`,
      message:
        "@id should be a string IRI/reference when present.",
    });
  } else if (
    typeof id === "string"
  ) {
    if (!id.trim()) {
      issues.push({
        level: "Warning",
        path: `${path}['@id']`,
        message:
          "@id is present but empty.",
      });
    } else {
      const info =
        resolvePossibleUrl(
          id,
          pageUrl
        );

      if (!info.valid) {
        issues.push({
          level: "Warning",
          path: `${path}['@id']`,
          message:
            "@id could not be interpreted as an IRI/reference.",
        });
      } else if (
        !info.absolute
      ) {
        issues.push({
          level: "Note",
          path: `${path}['@id']`,
          message:
            `@id is relative${
              info.resolved
                ? ` and resolves to ${info.resolved}`
                : ""
            }. Relative IRIs are valid JSON-LD in the right base context, but stable absolute IDs are often easier to debug across generated pages.`,
        });
      }
    }
  }

  const properties =
    Object.keys(value).filter(
      (key) =>
        key.charAt(0) !==
        "@"
    );
  const referenceOnly =
    typeof id === "string" &&
    !types.length &&
    !properties.length;

  if (
    types.length ||
    typeof id === "string" ||
    properties.length
  ) {
    nodes.push({
      path,
      types,
      id:
        typeof id === "string"
          ? id
          : "",
      context:
        contextText,
      properties,
      referenceOnly,
    });
  }

  if (
    !referenceOnly &&
    properties.length >= 2 &&
    !types.length &&
    contextLooksSchemaOrg(
      localContext
    )
  ) {
    issues.push({
      level: "Note",
      path,
      message:
        "This Schema.org-shaped object has normal properties but no @type. Untyped nodes can be valid JSON-LD, but confirm that the consuming vocabulary does not need an explicit entity type here.",
    });
  }

  if (
    value["@graph"] !==
    undefined
  ) {
    const graph =
      value["@graph"];

    if (
      Array.isArray(graph)
    ) {
      graph.forEach(
        (item, index) =>
          inspectValue(
            item,
            `${path}['@graph'][${index}]`,
            localContext,
            pageUrl,
            nodes,
            issues,
            false
          )
      );
    } else if (
      isRecord(graph)
    ) {
      inspectValue(
        graph,
        `${path}['@graph']`,
        localContext,
        pageUrl,
        nodes,
        issues,
        false
      );
    } else {
      issues.push({
        level: "Warning",
        path: `${path}['@graph']`,
        message:
          "@graph should contain a node object or array of node objects in the patterns this inspector supports.",
      });
    }
  }

  Object.keys(value).forEach(
    (key) => {
      if (
        key === "@context" ||
        key === "@graph"
      ) {
        return;
      }

      const child =
        value[key];

      if (
        key.charAt(0) !==
        "@"
      ) {
        inspectKnownPropertyShape(
          key,
          child,
          appendPath(
            path,
            key
          ),
          pageUrl,
          issues
        );
      }

      if (
        child &&
        typeof child ===
          "object"
      ) {
        inspectValue(
          child,
          appendPath(
            path,
            key
          ),
          localContext,
          pageUrl,
          nodes,
          issues,
          false
        );
      }
    }
  );
}

function duplicateIdReport(
  nodes: EntityNode[]
) {
  const grouped =
    Object.create(null) as Record<
      string,
      string[]
    >;

  nodes.forEach((node) => {
    if (!node.id) return;

    if (!grouped[node.id]) {
      grouped[node.id] =
        [];
    }

    grouped[node.id].push(
      node.path
    );
  });

  return Object.keys(grouped)
    .filter(
      (id) =>
        grouped[id].length > 1
    )
    .map((id) => ({
      id,
      paths: grouped[id],
    }));
}

function inspectStructuredData(
  source: string,
  rawPageUrl: string
): StructuredReport {
  const pageUrl =
    rawPageUrl.trim()
      ? normalizePageUrl(
          rawPageUrl
        )
      : "";

  if (
    rawPageUrl.trim() &&
    !pageUrl
  ) {
    throw new Error(
      "Page URL must be an absolute HTTP or HTTPS URL without embedded credentials."
    );
  }

  const extracted =
    extractJsonLdDocuments(
      source
    );
  const nodes: EntityNode[] =
    [];
  const issues: StructuredIssue[] =
    [];

  extracted.documents.forEach(
    (document, index) => {
      if (
        document.duplicateKeys
          .length
      ) {
        issues.push({
          level: "Warning",
          path:
            extracted.documents
              .length === 1
              ? "$"
              : `$document[${index}]`,
          message:
            `Duplicate JSON member name${
              document
                .duplicateKeys
                .length === 1
                ? ""
                : "s"
            } detected before JSON.parse: ${document.duplicateKeys.join(
              ", "
            )}. JavaScript JSON.parse keeps only the last value for duplicate names, so fix the source rather than relying on parser overwrite behavior.`,
        });
      }

      inspectValue(
        document.value,
        extracted.documents
          .length === 1
          ? "$"
          : `$document[${index}]`,
        null,
        pageUrl,
        nodes,
        issues,
        true
      );
    }
  );

  const duplicateIds =
    duplicateIdReport(nodes);

  duplicateIds.forEach(
    (entry) => {
      issues.push({
        level: "Note",
        path:
          entry.paths.join(
            ", "
          ),
        message:
          `@id "${entry.id}" appears on ${entry.paths.length} node objects. JSON-LD can use repeated @id values to describe the same graph node across statements; confirm that this is intentional rather than copied markup for different entities.`,
      });
    }
  );

  const typeNames =
    uniqueStrings(
      nodes.reduce(
        (
          result: string[],
          node
        ) => {
          node.types.forEach(
            (type) =>
              result.push(type)
          );

          return result;
        },
        []
      )
    );

  if (!nodes.length) {
    issues.push({
      level: "Warning",
      path: "$",
      message:
        "No JSON-LD node object with @type, @id, or normal properties was found.",
    });
  }

  if (
    extracted.htmlInput &&
    extracted.documents.length >
      1
  ) {
    issues.push({
      level: "Note",
      path: "$",
      message:
        `The HTML contains ${extracted.documents.length} JSON-LD script blocks. Multiple blocks can be valid; verify that your templates are intentionally describing complementary entities rather than injecting duplicate page markup.`,
    });
  }

  return {
    documents:
      extracted.documents,
    nodes,
    issues,
    typeNames,
    duplicateIds,
    htmlInput:
      extracted.htmlInput,
  };
}

function formatStructuredReport(
  report: StructuredReport
) {
  const warnings =
    report.issues.filter(
      (entry) =>
        entry.level ===
        "Warning"
    ).length;
  const notes =
    report.issues.filter(
      (entry) =>
        entry.level ===
        "Note"
    ).length;
  const lines = [
    "Structured data inspection",
    `Input form: ${
      report.htmlInput
        ? "HTML with JSON-LD script blocks"
        : "Raw JSON-LD"
    }`,
    `JSON-LD documents: ${report.documents.length}`,
    `Node objects: ${report.nodes.length}`,
    `Types: ${
      report.typeNames.length
        ? report.typeNames.join(
            ", "
          )
        : "None"
    }`,
    `Warnings: ${warnings}`,
    `Notes: ${notes}`,
    "",
    "Nodes:",
  ];

  if (!report.nodes.length) {
    lines.push(
      "No entity/reference nodes found."
    );
  } else {
    report.nodes.forEach(
      (node, index) => {
        lines.push(
          `${index + 1}. ${node.path}`,
          `   kind: ${
            node.referenceOnly
              ? "reference-only @id node"
              : "described node"
          }`,
          `   @type: ${
            node.types.length
              ? node.types.join(
                  ", "
                )
              : "Not set"
          }`,
          `   @id: ${
            node.id ||
            "Not set"
          }`,
          `   @context: ${
            node.context ||
            "Inherited / not resolved"
          }`,
          `   properties: ${
            node.properties
              .length
              ? node.properties.join(
                  ", "
                )
              : "None"
          }`
        );
      }
    );
  }

  lines.push(
    "",
    "Issues:"
  );

  if (!report.issues.length) {
    lines.push(
      "No structural issue from this local rule set was found."
    );
  } else {
    report.issues.forEach(
      (entry, index) => {
        lines.push(
          `${index + 1}. ${entry.level} at ${entry.path}: ${entry.message}`
        );
      }
    );
  }

  lines.push(
    "",
    "Boundary: the browser review checks JSON/JSON-LD structure and selected implementation patterns. It does not fetch Schema.org contexts, certify vocabulary correctness, or determine Google rich-result eligibility."
  );

  return lines.join("\n");
}

export default function ToolClient() {
  const [pageUrl, setPageUrl] =
    useState("");
  const [input, setInput] =
    useState(
      SAMPLE_JSON_LD
    );
  const [report, setReport] =
    useState<StructuredReport | null>(
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

  const validate = () => {
    if (!input.trim()) {
      setError(
        "Paste JSON-LD or HTML containing JSON-LD."
      );
      setReport(null);
      return;
    }

    if (input.length > MAX_INPUT_CHARACTERS) {
      setError(
        `Structured-data input is larger than ${MAX_INPUT_CHARACTERS.toLocaleString()} characters. Inspect very large pages with deployment tooling instead.`
      );
      setReport(null);
      return;
    }

    if (pageUrl.length > MAX_PAGE_URL_CHARACTERS) {
      setError(
        `Page URL is larger than ${MAX_PAGE_URL_CHARACTERS.toLocaleString()} characters.`
      );
      setReport(null);
      return;
    }

    try {
      setReport(
        inspectStructuredData(
          input,
          pageUrl
        )
      );
      setError("");
      setCopied(false);
    } catch (caught) {
      setReport(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to inspect this structured data."
      );
      setCopied(false);
    }
  };

  const loadJsonExample = () => {
    setPageUrl(
      "https://example.com/articles/json-ld"
    );
    setInput(
      SAMPLE_JSON_LD
    );
    clearResult();
  };

  const loadGraphExample = () => {
    setPageUrl(
      "https://example.com/about"
    );
    setInput(`{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://example.com/#website",
      "url": "https://example.com/",
      "name": "Example Site"
    },
    {
      "@type": "Organization",
      "@id": "https://example.com/#organization",
      "name": "Example Studio",
      "url": "https://example.com/"
    },
    {
      "@type": "WebPage",
      "@id": "https://example.com/about#webpage",
      "url": "https://example.com/about",
      "name": "About Example Studio",
      "isPartOf": { "@id": "https://example.com/#website" },
      "about": { "@id": "https://example.com/#organization" }
    }
  ]
}`);
    clearResult();
  };

  const resetAll = () => {
    setPageUrl("");
    setInput("");
    clearResult();
  };

  const copyReport = async () => {
    if (!report) return;

    try {
      await navigator.clipboard.writeText(
        formatStructuredReport(
          report
        )
      );
      setCopied(true);
      window.setTimeout(
        () => setCopied(false),
        1400
      );
    } catch {
      setCopied(false);
      setError(
        "The structured-data report could not be copied. Select and copy it manually."
      );
    }
  };

  const warnings = report
    ? report.issues.filter(
        (entry) =>
          entry.level ===
          "Warning"
      ).length
    : 0;
  const notes = report
    ? report.issues.filter(
        (entry) =>
          entry.level ===
          "Note"
      ).length
    : 0;

  return (
    <ToolShell
      title="Structured Data Validator"
      description="Inspect JSON-LD graphs for syntax, contexts, types, IDs, references, duplicates, and implementation warnings."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label htmlFor="structured-page-url" className="block text-sm font-semibold text-gray-900">
          Page URL{" "}
          <span className="font-normal text-gray-500">
            (optional)
          </span>
        </label>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">
          Page context helps interpret relative <code>@id</code> and common URL
          properties. The page itself is not fetched.
        </p>
        <input
          id="structured-page-url"
          value={pageUrl}
          onChange={(event: {
            target: { value: string };
          }) => {
            setPageUrl(
              event.target.value
            );
            clearResult();
          }}
          placeholder="https://example.com/page"
          spellCheck={false}
          className="mt-4 w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-6">
        <label htmlFor="structured-source-input" className="block text-sm font-semibold text-gray-900">
          JSON-LD or HTML source
        </label>
        <textarea
          id="structured-source-input"
          value={input}
          onChange={(event: {
            target: { value: string };
          }) => {
            setInput(
              event.target.value
            );
            clearResult();
          }}
          rows={18}
          placeholder={SAMPLE_JSON_LD}
          spellCheck={false}
          className="mt-2 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Accepts one raw JSON-LD value or HTML containing one or more{" "}
          <code>application/ld+json</code> script blocks.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={validate}
          className="yoryantra-btn shrink-0 whitespace-nowrap"
        >
          Inspect Structured Data
        </button>
        <button
          type="button"
          onClick={loadJsonExample}
          className="yoryantra-btn-outline shrink-0 whitespace-nowrap"
        >
          Load Article Example
        </button>
        <button
          type="button"
          onClick={loadGraphExample}
          className="yoryantra-btn-outline shrink-0 whitespace-nowrap"
        >
          Load @graph Example
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="yoryantra-btn-outline shrink-0 whitespace-nowrap"
        >
          Reset
        </button>
      </div>

      {error ? (
        <div role="alert" className="mt-6 whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      {report ? (
        <div className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Stat
              label="JSON-LD docs"
              value={String(
                report.documents
                  .length
              )}
            />
            <Stat
              label="Nodes"
              value={String(
                report.nodes.length
              )}
            />
            <Stat
              label="Types"
              value={String(
                report.typeNames
                  .length
              )}
            />
            <Stat
              label="Warnings"
              value={String(
                warnings
              )}
            />
            <Stat
              label="Notes"
              value={String(notes)}
            />
          </div>

          {report.issues.length ? (
            <div className="mt-5 self-start rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-900">
              <strong>
                Structural / implementation review:
              </strong>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                {report.issues.map(
                  (entry, index) => (
                    <li
                      key={`${entry.path}-${entry.message}-${index}`}
                    >
                      <strong>
                        {entry.level}:
                      </strong>{" "}
                      <code>
                        {entry.path}
                      </code>{" "}
                      —{" "}
                      {entry.message}
                    </li>
                  )
                )}
              </ul>
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-relaxed text-green-800">
              No structural issue from this local JSON-LD rule set was found.
              Vocabulary and search-feature validation are still separate.
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Entity / node map
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">
                  Reference-only <code>@id</code> objects are kept separate from
                  nodes that actually declare type or properties.
                </p>
              </div>

              <button
                type="button"
                onClick={copyReport}
                className="yoryantra-btn-outline shrink-0 whitespace-nowrap"
              >
                {copied
                  ? "Copied"
                  : "Copy Report"}
              </button>
            </div>

            {report.nodes.length ? (
              <div className="mt-5 space-y-4">
                {report.nodes.map(
                  (node, index) => (
                    <div
                      key={`${node.path}-${index}`}
                      className="rounded-xl border border-gray-200 bg-gray-50 p-5"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                          {node.referenceOnly
                            ? "Reference"
                            : "Node"}
                        </span>
                        <code className="break-all text-xs text-gray-600">
                          {node.path}
                        </code>
                      </div>

                      <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                        <div>
                          <dt className="font-semibold text-gray-900">
                            @type
                          </dt>
                          <dd className="mt-1 break-words text-gray-600">
                            {node.types.length
                              ? node.types.join(
                                  ", "
                                )
                              : "Not set"}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-gray-900">
                            @id
                          </dt>
                          <dd className="mt-1 break-all text-gray-600">
                            {node.id ||
                              "Not set"}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-gray-900">
                            Context
                          </dt>
                          <dd className="mt-1 break-words text-gray-600">
                            {node.context ||
                              "Inherited / not resolved"}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-gray-900">
                            Properties
                          </dt>
                          <dd className="mt-1 break-words text-gray-600">
                            {node.properties
                              .length
                              ? node.properties.join(
                                  ", "
                                )
                              : "None"}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="mt-5 text-sm text-gray-600">
                No node objects were found.
              </p>
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="text-lg font-semibold text-gray-900">
              Types found
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {report.typeNames
                .length ? (
                report.typeNames.map(
                  (type) => (
                    <span
                      key={type}
                      className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700"
                    >
                      {type}
                    </span>
                  )
                )
              ) : (
                <span className="text-sm text-gray-500">
                  No @type values found.
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <pre className="yoryantra-output mt-8 min-h-[300px] overflow-auto whitespace-pre-wrap break-words text-sm">
          JSON-LD documents, graph nodes, @type / @id relationships, duplicate
          source keys, and implementation findings will appear here.
        </pre>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Parsing and inspection happen on the pasted markup in your browser. The
        review does not fetch remote JSON-LD contexts, Schema.org definitions, the
        page URL, or Google&apos;s Rich Results Test. Inputs above 2,000,000
        characters are stopped before parsing so a pasted production page cannot
        monopolize the browser tab. Site-wide analytics or advertising scripts,
        if enabled, are separate from this operation.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            “Valid Structured Data” Is Really Several Different Questions
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            First, the text must be valid JSON when you use JSON-LD. Second, it
            must make sense as JSON-LD: contexts, IDs, types, graphs and
            references have JSON-LD semantics. Third, the terms need to belong
            to the vocabulary you intend to use, such as Schema.org. Finally, a
            consumer such as Google Search can impose feature-specific required
            properties and quality rules.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Passing one layer does not prove the next. The browser review focuses on the
            first two layers and selected implementation signals. It refuses to
            turn a structural JSON-LD check into a fake “rich result valid”
            badge.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            @context Is What Makes “Article” and “headline” More Than Private JSON Keys
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Ordinary JSON does not know what <code>Article</code>,{" "}
            <code>headline</code>, or <code>author</code> means. JSON-LD context
            information maps compact terms to IRIs so different systems can
            interpret them as linked-data vocabulary rather than application
            keys invented by one site.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Schema.org markup commonly uses{" "}
            <code>"@context": "https://schema.org"</code>. JSON-LD also supports
            local context objects, arrays of contexts, vocabulary mappings and
            other advanced forms. This browser does not download remote context
            documents, so it reports what is declared without pretending to
            perform full JSON-LD expansion.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            @id Is Graph Identity, Not Just Another “URL Field”
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Two node objects can intentionally use the same{" "}
            <code>@id</code> because they are making statements about the same
            graph node. A WebPage might refer to an Organization using only{" "}
            <code>{"{ \"@id\": \"https://example.com/#organization\" }"}</code>,
            while another node in the graph supplies that organization&apos;s
            name, logo and URL.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            For that reason the checker marks repeated IDs as a review note,
            not an automatic duplicate-entity error. It also labels objects that
            contain only <code>@id</code> as references rather than pretending
            each reference is a fully described entity.
          </p>
        </div>

        <div className="mt-12 self-start rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            Duplicate JSON Keys Can Disappear Before a JSON-LD Library Ever Sees Them
          </h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-white p-4 text-sm leading-7 text-gray-800">{`{
  "@type": "Article",
  "headline": "First headline",
  "headline": "Second headline"
}`}</pre>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            JavaScript&apos;s JSON parser produces one object property for that
            repeated name, effectively hiding the earlier source value. Other
            software can handle duplicate names differently. The source is scanned
            the source before parsing and reports repeated member names so the
            markup can be fixed instead of relying on overwrite behavior.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            @graph Helps Connect Page Entities, but It Is Not a Requirement for “Good JSON-LD”
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A page can use one simple top-level Article object and be perfectly
            reasonable. <code>@graph</code> becomes helpful when a page describes
            several named nodes—a WebSite, Organization, WebPage, Person,
            Article, BreadcrumbList or other related objects—and you want their{" "}
            <code>@id</code> references to make those relationships explicit.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The checker understands graph arrays and graph objects but does not
            penalize markup simply because it chose a simpler non-graph shape.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Multiple application/ld+json Blocks Are Not Automatically Duplicate Markup
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A template may emit Organization markup in one component and
            page-specific Article markup in another. Google can read JSON-LD
            embedded in page markup, and multiple script blocks can represent
            complementary data.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The real problem is accidental duplication: two layout systems
            describing the same article with conflicting headlines, IDs or
            dates. The report shows the number of blocks and repeated IDs so
            you can review the graph instead of enforcing “exactly one script”
            as an invented rule.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Schema.org Vocabulary Is Larger Than Google&apos;s Rich-Result Feature Set
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A type or property can be legitimate Schema.org vocabulary without
            powering a special Google Search appearance. Conversely, a Google
            feature can require a specific subset of Schema.org properties and
            additional content/quality conditions.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            For Google behavior, Google explicitly tells publishers to use its
            feature documentation as definitive rather than assuming every
            Schema.org possibility is supported in Search. This is why the tool
            does not maintain a stale hard-coded list of “Google-valid types.”
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Markup Has to Describe the Page the User Actually Gets
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Google&apos;s structured-data guidance says the markup on a page
            should describe that page&apos;s content and should not invent
            information that is invisible or misleading to users. A browser
            JSON-LD parser cannot judge whether a five-star rating, price, event
            date or author name is truthful.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Technical validation therefore cannot replace editorial accuracy.
            Compare important structured properties with the visible rendered
            page, especially when data is generated from separate CMS fields or
            APIs.
          </p>
        </div>

        <div className="mt-12 self-start rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            Test the Rendered Production Page, Not Only the JSON-LD Snippet in Your Editor
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            Framework hydration, tag managers, CMS plugins, personalization and
            deployment templates can remove, duplicate or change JSON-LD after
            the component you inspected locally. Google supports JSON-LD and
            recommends it in many implementations, but eligibility belongs to
            the final page Google can process.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            After this structural pass, use Google&apos;s Rich Results Test for
            supported Search features and Search Console after deployment.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Three References Answer Three Different Questions
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <ReferenceCard
              title="JSON-LD 1.1"
              href="https://www.w3.org/TR/json-ld11/"
              text="Defines JSON-LD keywords, contexts, node identifiers, graphs and the linked-data processing model."
            />
            <ReferenceCard
              title="Schema.org"
              href="https://schema.org/"
              text="Defines the vocabulary of types and properties commonly used in web structured data."
            />
            <ReferenceCard
              title="Google Search"
              href="https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data"
              text="Defines Google Search formats, feature documentation, required/recommended properties and rich-result guidance."
            />
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/structured-data-validator" />
          </div>
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

function ReferenceCard({
  title,
  href,
  text,
}: {
  title: string;
  href: string;
  text: string;
}) {
  return (
    <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-5">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="font-semibold text-[var(--green)] underline underline-offset-4"
      >
        {title}
      </a>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">
        {text}
      </p>
    </div>
  );
}
