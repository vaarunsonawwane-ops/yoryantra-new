"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type XmlIssue = {
  level: "Warning" | "Note";
  message: string;
};

type XmlDeclaration = {
  present: boolean;
  version: string;
  encoding: string;
  standalone: string;
};

type DoctypeInfo = {
  present: boolean;
  name: string;
  publicId: string;
  systemId: string;
  hasEntityDeclarations: boolean;
};

type XmlReport = {
  wellFormed: boolean;
  parserError: string;
  parserLine: number | null;
  parserColumn: number | null;
  rootName: string;
  rootLocalName: string;
  rootNamespace: string;
  elementCount: number;
  attributeCount: number;
  namespaceDeclarationCount: number;
  namespaces: string[];
  prefixes: string[];
  comments: number;
  cdataSections: number;
  processingInstructions: number;
  declaration: XmlDeclaration;
  doctype: DoctypeInfo;
  schemaHints: string[];
  issues: XmlIssue[];
  sourceLines: number;
  sourceBytes: number;
};

const MAX_INPUT_CHARACTERS = 2_000_000;

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<catalog xmlns="https://example.com/catalog"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <!-- Example XML document -->
  <book id="bk101">
    <title>Yoryantra XML Guide</title>
    <author>Sneha</author>
    <price currency="INR">799</price>
  </book>
</catalog>`;

function uniqueStrings(
  values: string[]
) {
  const result: string[] = [];

  values.forEach((value) => {
    if (
      value &&
      result.indexOf(
        value
      ) === -1
    ) {
      result.push(value);
    }
  });

  return result;
}

function parseXmlDeclaration(
  source: string
): XmlDeclaration {
  const match =
    source.match(
      /^\uFEFF?<\?xml\s+([^?]+)\?>/
    );

  if (!match) {
    return {
      present: false,
      version: "",
      encoding: "",
      standalone: "",
    };
  }

  const attrs =
    match[1];
  const read = (
    name: string
  ) => {
    const attr =
      attrs.match(
        new RegExp(
          `(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`,
          "i"
        )
      );

    return attr
      ? attr[1] ||
          attr[2] ||
          ""
      : "";
  };

  return {
    present: true,
    version:
      read("version"),
    encoding:
      read("encoding"),
    standalone:
      read("standalone"),
  };
}

function findIllegalXmlCharacter(
  source: string
) {
  let line = 1;
  let column = 1;

  for (
    let index = 0;
    index < source.length;
    index += 1
  ) {
    const first =
      source.charCodeAt(index);
    let codePoint = first;
    let units = 1;

    if (
      first >= 0xd800 &&
      first <= 0xdbff &&
      index + 1 <
        source.length
    ) {
      const second =
        source.charCodeAt(
          index + 1
        );

      if (
        second >= 0xdc00 &&
        second <= 0xdfff
      ) {
        codePoint =
          0x10000 +
          ((first - 0xd800) <<
            10) +
          (second - 0xdc00);
        units = 2;
      }
    }

    const allowed =
      codePoint === 0x09 ||
      codePoint === 0x0a ||
      codePoint === 0x0d ||
      (codePoint >= 0x20 &&
        codePoint <=
          0xd7ff) ||
      (codePoint >= 0xe000 &&
        codePoint <=
          0xfffd) ||
      (codePoint >=
        0x10000 &&
        codePoint <=
          0x10ffff);

    if (!allowed) {
      return {
        codePoint,
        line,
        column,
      };
    }

    if (
      codePoint === 0x0a
    ) {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }

    if (units === 2) {
      index += 1;
    }
  }

  return null;
}

function findParserError(
  document: Document,
  source: string
) {
  const candidates =
    Array.from(
      document.getElementsByTagName(
        "parsererror"
      )
    ).concat(
      Array.from(
        document.getElementsByTagNameNS(
          "*",
          "parsererror"
        )
      )
    );

  for (
    let index = 0;
    index < candidates.length;
    index += 1
  ) {
    const candidate =
      candidates[index];
    const namespace =
      candidate.namespaceURI ||
      "";

    if (
      namespace
        .toLowerCase()
        .indexOf(
          "parsererror"
        ) !== -1 ||
      namespace
        .toLowerCase()
        .indexOf(
          "mozilla.org/newlayout/xml"
        ) !== -1
    ) {
      return candidate;
    }
  }

  const root =
    document.documentElement;

  if (
    root &&
    root.localName ===
      "parsererror" &&
    !/^\s*<parsererror(?:\s|>)/i.test(
      source
    )
  ) {
    return root;
  }

  return null;
}

function cleanParserError(
  value: string
) {
  return value
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1200);
}

function parserErrorLocation(
  text: string
) {
  const patterns = [
    /line\s+(\d+)\s+(?:at\s+)?column\s+(\d+)/i,
    /line\s+(\d+),\s*column\s+(\d+)/i,
    /(\d+):(\d+):/,
  ];

  for (
    let index = 0;
    index < patterns.length;
    index += 1
  ) {
    const match =
      text.match(
        patterns[index]
      );

    if (match) {
      return {
        line:
          Number(match[1]),
        column:
          Number(match[2]),
      };
    }
  }

  return {
    line: null,
    column: null,
  };
}

function sourceExcerpt(
  source: string,
  line: number | null,
  column: number | null
) {
  if (!line) {
    return "";
  }

  const lines =
    source
      .replace(/\r\n?/g, "\n")
      .split("\n");
  const value =
    lines[line - 1] || "";

  if (!column) {
    return value;
  }

  return `${value}\n${" ".repeat(
    Math.max(
      column - 1,
      0
    )
  )}^`;
}

function countNodeTypes(
  node: Node
) {
  let comments = 0;
  let cdataSections = 0;
  let processingInstructions =
    0;

  const visit = (
    current: Node
  ) => {
    if (
      current.nodeType ===
      8
    ) {
      comments += 1;
    } else if (
      current.nodeType ===
      4
    ) {
      cdataSections += 1;
    } else if (
      current.nodeType ===
      7
    ) {
      processingInstructions +=
        1;
    }

    Array.from(
      current.childNodes
    ).forEach(visit);
  };

  visit(node);

  return {
    comments,
    cdataSections,
    processingInstructions,
  };
}

function doctypeInfo(
  document: Document,
  source: string
): DoctypeInfo {
  const doctype =
    document.doctype;
  const withoutComments =
    source.replace(
      /<!--[\s\S]*?-->/g,
      ""
    );

  return {
    present:
      Boolean(doctype) ||
      /<!DOCTYPE\b/i.test(
        withoutComments
      ),
    name: doctype
      ? doctype.name
      : "",
    publicId: doctype
      ? doctype.publicId
      : "",
    systemId: doctype
      ? doctype.systemId
      : "",
    hasEntityDeclarations:
      /<!ENTITY\b/i.test(
        withoutComments
      ),
  };
}

function inspectXml(
  source: string
): XmlReport {
  if (
    typeof window ===
    "undefined"
  ) {
    throw new Error(
      "XML parsing must run in the browser."
    );
  }

  const declaration =
    parseXmlDeclaration(
      source
    );
  const illegal =
    findIllegalXmlCharacter(
      source
    );
  const issues: XmlIssue[] =
    [];

  if (illegal) {
    issues.push({
      level: "Warning",
      message:
        `The source contains a character outside the XML 1.0 Char production at line ${illegal.line}, column ${illegal.column} (code point U+${illegal.codePoint
          .toString(16)
          .toUpperCase()
          .padStart(
            4,
            "0"
          )}).`,
    });
  }

  if (
    source.indexOf(
      "<?xml"
    ) !== -1 &&
    !declaration.present
  ) {
    issues.push({
      level: "Warning",
      message:
        "An XML declaration marker appears in the source but is not serialized at the beginning of the document (after an optional BOM). XML declarations have strict placement rules.",
    });
  }

  if (
    declaration.present
  ) {
    if (
      declaration.version &&
      declaration.version !== "1.0" &&
      declaration.version !== "1.1"
    ) {
      issues.push({
        level: "Warning",
        message:
          `XML declaration version "${declaration.version}" is unusual. Browser parsing here should not be treated as certification for that XML version.`,
      });
    } else if (declaration.version === "1.1") {
      issues.push({
        level: "Note",
        message:
          "The document declares XML 1.1. The pre-parse source-character check on this page follows the XML 1.0 Fifth Edition character production, so use an XML 1.1-aware validator when 1.1-specific conformance matters.",
      });
    }

    if (
      declaration.standalone &&
      declaration.standalone !==
        "yes" &&
      declaration.standalone !==
        "no"
    ) {
      issues.push({
        level: "Warning",
        message:
          `standalone="${declaration.standalone}" should be yes or no in an XML declaration.`,
      });
    }

    if (
      declaration.encoding &&
      declaration.encoding
        .toUpperCase() !==
        "UTF-8" &&
      declaration.encoding
        .toUpperCase() !==
        "UTF-16"
    ) {
      issues.push({
        level: "Note",
        message:
          `The declaration says encoding="${declaration.encoding}". The browser receives a JavaScript Unicode string rather than the original bytes, so byte encoding cannot be verified against that declaration.`,
      });
    } else if (
      declaration.encoding
    ) {
      issues.push({
        level: "Note",
        message:
          `The declaration says encoding="${declaration.encoding}". Browser DOMParser is parsing an already-decoded JavaScript string here, so byte-level encoding correctness is outside this check.`,
      });
    }
  }

  const document =
    new DOMParser().parseFromString(
      source,
      "application/xml"
    );
  const parserError =
    findParserError(
      document,
      source
    );

  if (parserError) {
    const text =
      cleanParserError(
        parserError.textContent ||
          "Malformed XML."
      );
    const location =
      parserErrorLocation(
        text
      );

    return {
      wellFormed: false,
      parserError: text,
      parserLine:
        location.line,
      parserColumn:
        location.column,
      rootName: "",
      rootLocalName: "",
      rootNamespace: "",
      elementCount: 0,
      attributeCount: 0,
      namespaceDeclarationCount:
        0,
      namespaces: [],
      prefixes: [],
      comments: 0,
      cdataSections: 0,
      processingInstructions: 0,
      declaration,
      doctype:
        doctypeInfo(
          document,
          source
        ),
      schemaHints: [],
      issues,
      sourceLines:
        source
          .replace(
            /\r\n?/g,
            "\n"
          )
          .split("\n")
          .length,
      sourceBytes:
        new TextEncoder().encode(
          source
        ).length,
    };
  }

  const root =
    document.documentElement;

  if (!root) {
    return {
      wellFormed: false,
      parserError:
        "No XML document element was found.",
      parserLine: null,
      parserColumn: null,
      rootName: "",
      rootLocalName: "",
      rootNamespace: "",
      elementCount: 0,
      attributeCount: 0,
      namespaceDeclarationCount:
        0,
      namespaces: [],
      prefixes: [],
      comments: 0,
      cdataSections: 0,
      processingInstructions: 0,
      declaration,
      doctype:
        doctypeInfo(
          document,
          source
        ),
      schemaHints: [],
      issues,
      sourceLines:
        source
          .replace(
            /\r\n?/g,
            "\n"
          )
          .split("\n")
          .length,
      sourceBytes:
        new TextEncoder().encode(
          source
        ).length,
    };
  }

  const elements =
    Array.from(
      document.getElementsByTagName(
        "*"
      )
    );
  let attributeCount = 0;
  let namespaceDeclarationCount =
    0;
  const namespaces: string[] = [];
  const prefixes: string[] = [];
  const schemaHints: string[] =
    [];

  elements.forEach(
    (element) => {
      if (
        element.namespaceURI
      ) {
        namespaces.push(
          element.namespaceURI
        );
      }

      if (element.prefix) {
        prefixes.push(
          element.prefix
        );
      }

      Array.from(
        element.attributes
      ).forEach(
        (attribute) => {
          if (
            attribute.namespaceURI ===
            "http://www.w3.org/2000/xmlns/"
          ) {
            namespaceDeclarationCount +=
              1;
            return;
          }

          attributeCount += 1;

          if (
            attribute.namespaceURI
          ) {
            namespaces.push(
              attribute.namespaceURI
            );
          }

          if (
            attribute.prefix
          ) {
            prefixes.push(
              attribute.prefix
            );
          }

          if (
            attribute.namespaceURI ===
              "http://www.w3.org/2001/XMLSchema-instance" &&
            (attribute.localName ===
              "schemaLocation" ||
              attribute.localName ===
                "noNamespaceSchemaLocation")
          ) {
            schemaHints.push(
              `${element.tagName} @ ${attribute.name}="${attribute.value}"`
            );
          }
        }
      );
    }
  );

  const nodeCounts =
    countNodeTypes(
      document
    );
  const doctype =
    doctypeInfo(
      document,
      source
    );

  if (doctype.present) {
    issues.push({
      level: "Note",
      message:
        `DOCTYPE${
          doctype.name
            ? ` "${doctype.name}"`
            : ""
        } is present. Well-formedness is not the same as DTD validity, and this browser check does not certify the document against a DTD.`,
    });

    if (
      doctype.publicId ||
      doctype.systemId
    ) {
      issues.push({
        level: "Note",
        message:
          `The DOCTYPE references an external identifier${
            doctype.systemId
              ? ` (${doctype.systemId})`
              : ""
          }. External DTD resources are not fetched or used as validation authority.`,
      });
    }

    if (
      doctype.hasEntityDeclarations
    ) {
      issues.push({
        level: "Warning",
        message:
          "ENTITY declarations were detected in the document type. Entity and external-resource behavior is parser-specific and can create security/resource risks in server-side XML processors; do not infer safe XXE behavior from this browser parse.",
      });
    }
  }

  if (
    schemaHints.length
  ) {
    issues.push({
      level: "Note",
      message:
        `Found ${schemaHints.length} XML Schema location hint${
          schemaHints.length ===
          1
            ? ""
            : "s"
        }. schemaLocation/noNamespaceSchemaLocation are hints; XSD files are not fetched and element/content models are not validated against them.`,
    });
  }

  if (
    nodeCounts.cdataSections
  ) {
    issues.push({
      level: "Note",
      message:
        `The document contains ${nodeCounts.cdataSections} CDATA section${
          nodeCounts.cdataSections ===
          1
            ? ""
            : "s"
        }. CDATA changes markup recognition within the section but does not make the document exempt from XML well-formedness rules.`,
    });
  }

  const rootNamespace =
    root.namespaceURI ||
    "";

  if (!rootNamespace) {
    const prefixedElements =
      elements.filter(
        (element) =>
          Boolean(
            element.prefix
          )
      );

    if (
      prefixedElements.length
    ) {
      issues.push({
        level: "Note",
        message:
          "The root element has no namespace URI while prefixed elements occur elsewhere. That can be intentional; namespace identity belongs to each qualified name, not automatically to the whole document.",
      });
    }
  }

  if (
    rootNamespace &&
    elements.some(
      (element) =>
        !element.prefix &&
        !element.namespaceURI
    )
  ) {
    issues.push({
      level: "Note",
      message:
        "The document mixes a default namespace with unnamespaced elements. This can be intentional, but verify namespace resets such as xmlns=\"\" where schema matching depends on exact namespace URIs.",
    });
  }

  return {
    wellFormed: true,
    parserError: "",
    parserLine: null,
    parserColumn: null,
    rootName:
      root.tagName,
    rootLocalName:
      root.localName,
    rootNamespace,
    elementCount:
      elements.length,
    attributeCount,
    namespaceDeclarationCount,
    namespaces:
      uniqueStrings(
        namespaces
      ).sort(),
    prefixes:
      uniqueStrings(
        prefixes
      ).sort(),
    comments:
      nodeCounts.comments,
    cdataSections:
      nodeCounts.cdataSections,
    processingInstructions:
      nodeCounts.processingInstructions,
    declaration,
    doctype,
    schemaHints,
    issues,
    sourceLines:
      source
        .replace(
          /\r\n?/g,
          "\n"
        )
        .split("\n").length,
    sourceBytes:
      new TextEncoder().encode(
        source
      ).length,
  };
}

function formatXmlReport(
  report: XmlReport,
  source: string
) {
  const lines = [
    "XML inspection",
    `Status: ${
      report.wellFormed
        ? "Well-formed by browser XML parser"
        : "Not well-formed"
    }`,
    `Source lines: ${report.sourceLines}`,
    `Source UTF-8 bytes: ${report.sourceBytes}`,
  ];

  if (!report.wellFormed) {
    lines.push(
      "",
      `Parser error: ${report.parserError}`
    );

    const excerpt =
      sourceExcerpt(
        source,
        report.parserLine,
        report.parserColumn
      );

    if (excerpt) {
      lines.push(
        "",
        "Source location:",
        excerpt
      );
    }
  } else {
    lines.push(
      `Root: ${report.rootName}`,
      `Root local name: ${report.rootLocalName}`,
      `Root namespace: ${
        report.rootNamespace ||
        "(none)"
      }`,
      `Elements: ${report.elementCount}`,
      `Attributes (excluding xmlns declarations): ${report.attributeCount}`,
      `Namespace declarations: ${report.namespaceDeclarationCount}`,
      `Namespace URIs used: ${
        report.namespaces.length
          ? report.namespaces.join(
              ", "
            )
          : "None"
      }`,
      `Prefixes used: ${
        report.prefixes.length
          ? report.prefixes.join(
              ", "
            )
          : "None"
      }`,
      `Comments: ${report.comments}`,
      `CDATA sections: ${report.cdataSections}`,
      `Processing instructions: ${report.processingInstructions}`,
      `DOCTYPE: ${
        report.doctype.present
          ? report.doctype.name ||
            "present"
          : "None"
      }`,
      `XSD location hints: ${report.schemaHints.length}`
    );
  }

  lines.push(
    "",
    "XML declaration:",
    report.declaration.present
      ? `version=${report.declaration.version || "(not parsed)"}, encoding=${report.declaration.encoding || "(not declared)"}, standalone=${report.declaration.standalone || "(not declared)"}`
      : "Not present"
  );

  lines.push(
    "",
    "Review notes:"
  );

  if (!report.issues.length) {
    lines.push(
      "No additional note from this browser rule set."
    );
  } else {
    report.issues.forEach(
      (entry, index) => {
        lines.push(
          `${index + 1}. ${entry.level}: ${entry.message}`
        );
      }
    );
  }

  lines.push(
    "",
    "Boundary: well-formedness does not certify DTD validity, XSD validity, application-schema correctness, external entity safety, or byte-encoding correctness."
  );

  return lines.join("\n");
}

export default function ToolClient() {
  const [input, setInput] =
    useState(SAMPLE_XML);
  const [report, setReport] =
    useState<XmlReport | null>(
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
        "Paste an XML document to check."
      );
      setReport(null);
      return;
    }

    if (input.length > MAX_INPUT_CHARACTERS) {
      setError(
        `XML input is larger than ${MAX_INPUT_CHARACTERS.toLocaleString()} characters. Use a local streaming or schema-aware parser for larger documents.`
      );
      setReport(null);
      return;
    }

    try {
      setReport(
        inspectXml(input)
      );
      setError("");
      setCopied(false);
    } catch (caught) {
      setReport(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to inspect this XML."
      );
      setCopied(false);
    }
  };

  const loadExample = () => {
    setInput(SAMPLE_XML);
    clearResult();
  };

  const loadBrokenExample = () => {
    setInput(`<?xml version="1.0"?>
<catalog>
  <book id="1">
    <title>Broken nesting</title>
  </catalog>
</book>`);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    clearResult();
  };

  const copyReport = async () => {
    if (!report) return;

    try {
      await navigator.clipboard.writeText(
        formatXmlReport(
          report,
          input
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
        "The XML report could not be copied. Select and copy it manually."
      );
    }
  };

  return (
    <ToolShell
      title="XML Validator"
      description="Check XML well-formedness and inspect roots, namespaces, declarations, DOCTYPE, attributes, CDATA, and schema hints."
    >
      <div>
        <label htmlFor="xml-validator-input" className="block text-sm font-semibold text-gray-900">
          XML document
        </label>
        <textarea
          id="xml-validator-input"
          value={input}
          onChange={(event: {
            target: { value: string };
          }) => {
            setInput(
              event.target.value
            );
            clearResult();
          }}
          rows={19}
          placeholder={SAMPLE_XML}
          spellCheck={false}
          className="mt-2 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          This checks an XML document with one document element. A fragment with
          several top-level elements needs a wrapper before it becomes a
          well-formed XML document.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={validate}
          className="yoryantra-btn shrink-0 whitespace-nowrap"
        >
          Check XML
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="yoryantra-btn-outline shrink-0 whitespace-nowrap"
        >
          Load Valid Example
        </button>
        <button
          type="button"
          onClick={loadBrokenExample}
          className="yoryantra-btn-outline shrink-0 whitespace-nowrap"
        >
          Load Broken Example
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
          <div
            role={report.wellFormed ? "status" : "alert"}
            aria-live="polite"
            className={`rounded-2xl border p-5 ${
              report.wellFormed
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3
                  className={`text-lg font-semibold ${
                    report.wellFormed
                      ? "text-green-900"
                      : "text-red-900"
                  }`}
                >
                  {report.wellFormed
                    ? "Well-formed XML"
                    : "XML parser error"}
                </h3>
                <p
                  className={`mt-2 text-sm leading-relaxed ${
                    report.wellFormed
                      ? "text-green-800"
                      : "text-red-800"
                  }`}
                >
                  {report.wellFormed
                    ? "The browser's XML parser accepted the document's XML syntax and namespace bindings."
                    : report.parserError}
                </p>

                {!report.wellFormed &&
                report.parserLine ? (
                  <pre className="mt-4 overflow-auto whitespace-pre-wrap rounded-xl bg-white/70 p-4 font-mono text-xs leading-6 text-red-900">
                    {sourceExcerpt(
                      input,
                      report.parserLine,
                      report.parserColumn
                    )}
                  </pre>
                ) : null}
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
          </div>

          {report.wellFormed ? (
            <>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Stat
                  label="Root element"
                  value={
                    report.rootName
                  }
                />
                <Stat
                  label="Elements"
                  value={String(
                    report.elementCount
                  )}
                />
                <Stat
                  label="Attributes"
                  value={String(
                    report.attributeCount
                  )}
                />
                <Stat
                  label="Namespaces"
                  value={String(
                    report.namespaces
                      .length
                  )}
                />
                <Stat
                  label="Comments"
                  value={String(
                    report.comments
                  )}
                />
                <Stat
                  label="CDATA"
                  value={String(
                    report.cdataSections
                  )}
                />
                <Stat
                  label="Processing instructions"
                  value={String(
                    report.processingInstructions
                  )}
                />
                <Stat
                  label="UTF-8 bytes"
                  value={String(
                    report.sourceBytes
                  )}
                />
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Namespace view
                  </h3>
                  <dl className="mt-4 space-y-4 text-sm">
                    <div>
                      <dt className="font-semibold text-gray-900">
                        Root namespace
                      </dt>
                      <dd className="mt-1 break-all text-gray-600">
                        {report.rootNamespace ||
                          "(none)"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-gray-900">
                        Namespace URIs used
                      </dt>
                      <dd className="mt-1 text-gray-600">
                        {report.namespaces
                          .length
                          ? report.namespaces.join(
                              "\n"
                            )
                          : "None"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-gray-900">
                        Prefixes used
                      </dt>
                      <dd className="mt-1 text-gray-600">
                        {report.prefixes
                          .length
                          ? report.prefixes.join(
                              ", "
                            )
                          : "None"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-gray-900">
                        xmlns declarations
                      </dt>
                      <dd className="mt-1 text-gray-600">
                        {report.namespaceDeclarationCount}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Document metadata
                  </h3>
                  <dl className="mt-4 space-y-4 text-sm">
                    <div>
                      <dt className="font-semibold text-gray-900">
                        XML declaration
                      </dt>
                      <dd className="mt-1 text-gray-600">
                        {report.declaration
                          .present
                          ? `version ${
                              report
                                .declaration
                                .version ||
                              "?"
                            }, encoding ${
                              report
                                .declaration
                                .encoding ||
                              "not declared"
                            }, standalone ${
                              report
                                .declaration
                                .standalone ||
                              "not declared"
                            }`
                          : "Not present"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-gray-900">
                        DOCTYPE
                      </dt>
                      <dd className="mt-1 break-all text-gray-600">
                        {report.doctype
                          .present
                          ? report
                              .doctype
                              .name ||
                            "Present"
                          : "None"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-gray-900">
                        XSD location hints
                      </dt>
                      <dd className="mt-1 text-gray-600">
                        {report.schemaHints
                          .length
                          ? report.schemaHints.join(
                              "\n"
                            )
                          : "None"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </>
          ) : null}

          {report.issues.length ? (
            <div className="mt-6 self-start rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-900">
              <strong>
                XML review notes:
              </strong>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                {report.issues.map(
                  (entry, index) => (
                    <li
                      key={`${entry.message}-${index}`}
                    >
                      <strong>
                        {entry.level}:
                      </strong>{" "}
                      {entry.message}
                    </li>
                  )
                )}
              </ul>
            </div>
          ) : null}
        </div>
      ) : (
        <pre className="yoryantra-output mt-8 min-h-[300px] overflow-auto whitespace-pre-wrap break-words text-sm">
          XML parser status, root/namespace information, declaration, DOCTYPE,
          schema hints, and document statistics will appear here.
        </pre>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Parsing happens on the supplied XML string in your browser. The XML is not
        uploaded; external DTD/XSD resources are not fetched, and the page does not reproduce
        a server-side XML parser&apos;s entity configuration. Inputs above 2,000,000
        characters are stopped before parsing to bound browser work. Site-wide
        analytics or advertising scripts, if enabled, are separate from this
        operation.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Well-Formed XML and Valid XML Are Different Claims
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Well-formedness is the XML language baseline: one document element,
            properly nested and case-matched tags, quoted attribute values,
            legal character references, valid namespace bindings, and syntax
            that an XML parser can build into a document tree.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Validation adds another layer. A DTD or XML Schema can say that a{" "}
            <code>book</code> must contain a title, that an attribute has a
            particular type, or that elements must occur in a specific order.
            This browser checker answers the first question. It does not pretend
            to answer the second without the schema and a validating processor.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            XML Has One Document Element—A Fragment Is Not Automatically a Document
          </h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-white p-4 text-sm leading-7 text-gray-800">{`Not an XML document:
<item>A</item>
<item>B</item>

Wrapped as one document:
<items>
  <item>A</item>
  <item>B</item>
</items>`}</pre>
          <p className="mt-4 leading-relaxed text-gray-600">
            Editors and APIs sometimes talk about “XML fragments” that contain
            several sibling nodes. That can be valid application data, but an
            XML document itself has one root/document element. The check here uses document form.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Namespace Prefixes Are Labels; Namespace URIs Carry the Identity
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            <code>x:price</code> and <code>p:price</code> can represent the same
            expanded XML name when <code>x</code> and <code>p</code> are bound
            to the same namespace URI. Conversely, identical local names under
            different namespace URIs are different names to namespace-aware
            software.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The report therefore shows namespace URIs separately from prefixes.
            Debug schema failures by checking the URI actually bound to the
            element, not by assuming a familiar prefix has universal meaning.
          </p>
        </div>

        <div className="mt-12 self-start rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            A Default Namespace Does Not Automatically Apply to Unprefixed Attributes
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            In Namespaces in XML, a default namespace applies to unprefixed
            element names, but the namespace name for an unprefixed attribute
            is not taken from that default namespace. This surprises developers
            moving between element and attribute APIs.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            If an XSD or application expects a qualified attribute, inspect its
            namespace URI rather than assuming it inherited the element&apos;s
            default namespace.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            The encoding="UTF-8" Declaration Cannot Be Verified After the Bytes Are Already a JavaScript String
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Character encoding is a byte-to-character question. By the time
            text is pasted into this page, the browser has already produced a
            JavaScript Unicode string. DOMParser does not receive the original
            file bytes alongside the declaration.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The validator can inspect what the declaration says, but it cannot
            prove a file claiming UTF-8 was actually encoded as UTF-8 on disk or
            over HTTP. When mojibake or encoding mismatch is the problem, inspect
            the original bytes and transport Content-Type as well.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            XML 1.0 Does Not Permit Every Control Character
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            XML 1.0 defines a specific character range. Common tab, line feed
            and carriage return are allowed, but many other C0 control
            characters are not legal XML 1.0 characters even when a JavaScript
            string can contain them.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Yoryantra performs a source-character scan before DOM parsing so a
            hidden control character has a clearer line/column clue instead of
            being reduced to an opaque generic parser failure.
          </p>
        </div>

        <div className="mt-12 self-start rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            DOCTYPE and Entity Handling Are a Security Boundary in Server-Side Parsers
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            DTDs can declare entities and external identifiers. Historically,
            unsafe server-side XML parser configurations have allowed external
            entity expansion to read local resources, perform network requests,
            or consume excessive resources.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            This browser&apos;s DOMParser behavior is not evidence that a Java,
            PHP, Python, .NET, C/C++, or backend library is configured safely.
            When your application does not require DTDs/external entities,
            disable unnecessary external entity and external DTD processing
            using that parser&apos;s security controls.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            schemaLocation Is a Hint; It Does Not Perform XSD Validation
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Attributes such as <code>xsi:schemaLocation</code> can associate
            namespace names with schema locations, while{" "}
            <code>xsi:noNamespaceSchemaLocation</code> can point at a schema for
            unnamespaced content. Seeing those attributes only tells you the
            hint exists.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The browser review does not download the XSD, resolve imports/includes, or
            validate types and content models. Use an XSD validator that
            understands the exact schema set when application validity matters.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            CDATA Avoids Markup Recognition Inside the Section; It Is Not “Raw Anything”
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A CDATA section lets text contain characters such as{" "}
            <code>&lt;</code> and <code>&amp;</code> without treating them as
            ordinary markup or entity-reference starts. But the section itself
            still has XML syntax and cannot contain its terminating{" "}
            <code>]]&gt;</code> sequence as content.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            CDATA also does not change the meaning of the resulting character
            data to downstream applications. It is a source representation
            choice, not a validation bypass.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            XML Is Not HTML With Stricter Formatting
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            XML element names are case-sensitive, arbitrary empty elements can
            use <code>/&gt;</code>, and HTML&apos;s large set of named character
            entities is not automatically available. XML&apos;s predefined
            entities are limited unless a DTD defines more.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            A browser&apos;s forgiving HTML parser may repair markup that an XML
            parser correctly rejects. When an API says it accepts XML, test it
            as XML rather than opening it as text/html and assuming the repaired
            DOM proves validity.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            A Well-Formed Sitemap, SVG, SOAP Envelope, or Config File Can Still Be Wrong for Its Application
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Sitemap protocol limits, SVG element semantics, SOAP namespaces,
            Maven/Android/application configuration schemas, and proprietary API
            contracts all live above generic XML syntax. The root element can be
            spelled perfectly while the consuming system rejects the document
            for a missing required child or wrong namespace version.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Use the well-formedness result to answer “can an XML parser build the document?”
            Then move to the application-specific validator for “is this the
            right XML document?”
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <ReferenceCard
            title="XML 1.0 Fifth Edition"
            href="https://www.w3.org/TR/xml/"
            text="Defines XML documents, well-formedness constraints, character ranges, declarations, elements, attributes, comments, CDATA, DTDs and entity syntax."
          />
          <ReferenceCard
            title="Namespaces in XML 1.0"
            href="https://www.w3.org/TR/xml-names/"
            text="Defines qualified names, prefixes, namespace declarations, namespace names and default-namespace behavior."
          />
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/xml-validator" />
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
      <div className="mt-2 break-words text-lg font-semibold text-gray-900">
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
