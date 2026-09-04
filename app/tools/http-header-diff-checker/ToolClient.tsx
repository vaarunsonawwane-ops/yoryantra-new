"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type DiffStatus =
  | "Added"
  | "Removed"
  | "Changed"
  | "Same";

type HeaderEntry = {
  key: string;
  displayName: string;
  values: string[];
  sourceLines: number[];
  pseudo: boolean;
};

type HeaderSection = {
  startLine: string;
  fields: Record<
    string,
    HeaderEntry
  >;
  warnings: string[];
  malformed: Array<{
    line: number;
    text: string;
  }>;
};

type HeaderDiff = {
  key: string;
  name: string;
  status: DiffStatus;
  before: string[];
  after: string[];
  sensitive: boolean;
};

type DiffReport = {
  before: HeaderSection;
  after: HeaderSection;
  fields: HeaderDiff[];
  startLineStatus:
    | DiffStatus
    | "Not compared";
  warnings: string[];
  ignoredNames: string[];
};

const SAMPLE_BEFORE = `HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Cache-Control: no-cache
Set-Cookie: session=before123; Secure; HttpOnly; SameSite=Lax
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Server: nginx`;

const SAMPLE_AFTER = `HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Cache-Control: public, max-age=3600
Set-Cookie: session=after456; Secure; HttpOnly; SameSite=Lax
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Content-Security-Policy: default-src 'self'; object-src 'none'
Server: cloudflare`;

const VOLATILE_HEADERS = [
  "date",
  "age",
  "x-request-id",
  "x-correlation-id",
  "traceparent",
  "tracestate",
  "cf-ray",
  "server-timing",
];

const SENSITIVE_HEADERS = [
  "authorization",
  "proxy-authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "api-key",
];

function isToken(
  value: string
) {
  return /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/.test(
    value
  );
}

function canonicalHeaderName(
  lower: string
) {
  return lower
    .split("-")
    .map((part) =>
      part
        ? part
            .charAt(0)
            .toUpperCase() +
          part.slice(1)
        : part
    )
    .join("-");
}

function isStartLine(
  line: string
) {
  return (
    /^HTTP\/\d(?:\.\d)?\s+\d{3}(?:\s|$)/i.test(
      line
    ) ||
    /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+\s+\S+\s+HTTP\/\d(?:\.\d)?$/i.test(
      line
    )
  );
}

function containsBadValueControl(
  value: string
) {
  for (
    let index = 0;
    index < value.length;
    index += 1
  ) {
    const code =
      value.charCodeAt(index);

    if (
      (code < 0x20 &&
        code !== 0x09) ||
      code === 0x7f
    ) {
      return true;
    }
  }

  return false;
}

function parsePseudoField(
  line: string
) {
  if (
    line.charAt(0) !== ":"
  ) {
    return null;
  }

  const secondColon =
    line.indexOf(":", 1);

  if (secondColon === -1) {
    return null;
  }

  const name =
    line.slice(
      1,
      secondColon
    );
  const value =
    line
      .slice(
        secondColon + 1
      )
      .trim();

  if (
    !name ||
    !isToken(name)
  ) {
    return null;
  }

  return {
    name: `:${name}`,
    value,
  };
}

function parseHeaderSection(
  source: string
): HeaderSection {
  const lines =
    source
      .replace(
        /\r\n?/g,
        "\n"
      )
      .split("\n");
  const fields =
    Object.create(
      null
    ) as Record<
      string,
      HeaderEntry
    >;
  const warnings: string[] =
    [];
  const malformed: Array<{
    line: number;
    text: string;
  }> = [];
  let startLine = "";
  let previousKey = "";

  lines.forEach(
    (rawLine, index) => {
      const lineNumber =
        index + 1;

      if (!rawLine.trim()) {
        previousKey = "";
        return;
      }

      if (
        /^[ \t]/.test(
          rawLine
        )
      ) {
        if (
          previousKey &&
          fields[
            previousKey
          ] &&
          fields[
            previousKey
          ].values.length
        ) {
          const entry =
            fields[
              previousKey
            ];
          const valueIndex =
            entry.values.length -
            1;
          entry.values[
            valueIndex
          ] += ` ${rawLine.trim()}`;
          warnings.push(
            `Line ${lineNumber}: obsolete folded-field continuation was unfolded into the preceding ${entry.displayName} value for comparison. Modern HTTP senders should not generate obs-fold.`
          );
        } else {
          malformed.push({
            line:
              lineNumber,
            text:
              rawLine.trim(),
          });
        }

        return;
      }

      const trimmed =
        rawLine.trim();

      if (
        isStartLine(trimmed)
      ) {
        if (!startLine) {
          startLine = trimmed;
        } else {
          warnings.push(
            `Line ${lineNumber}: another HTTP start/status line was found after the first one and was not treated as a field.`
          );
        }
        previousKey = "";
        return;
      }

      const pseudo =
        parsePseudoField(
          rawLine
        );

      if (pseudo) {
        const key =
          pseudo.name;

        if (
          key !==
          key.toLowerCase()
        ) {
          warnings.push(
            `Line ${lineNumber}: HTTP/2 and HTTP/3 pseudo-field names are expected in lowercase.`
          );
        }

        if (!fields[key]) {
          fields[key] = {
            key,
            displayName: key,
            values: [],
            sourceLines: [],
            pseudo: true,
          };
        }

        fields[key].values.push(
          pseudo.value
        );
        fields[
          key
        ].sourceLines.push(
          lineNumber
        );
        previousKey = key;
        return;
      }

      const colon =
        rawLine.indexOf(":");

      if (colon <= 0) {
        malformed.push({
          line:
            lineNumber,
          text: trimmed,
        });
        previousKey = "";
        return;
      }

      const nameSource =
        rawLine.slice(
          0,
          colon
        );
      const rawName =
        nameSource.trim();

      if (
        nameSource !==
        rawName
      ) {
        malformed.push({
          line:
            lineNumber,
          text: trimmed,
        });
        warnings.push(
          `Line ${lineNumber}: whitespace appears between the field name and colon. Modern HTTP/1 field syntax does not permit that whitespace, so the line was not normalized into a valid field.`
        );
        previousKey = "";
        return;
      }

      const value =
        rawLine
          .slice(colon + 1)
          .replace(
            /^[ \t]+|[ \t]+$/g,
            ""
          );

      if (
        !isToken(rawName)
      ) {
        malformed.push({
          line:
            lineNumber,
          text: trimmed,
        });
        previousKey = "";
        return;
      }

      if (
        containsBadValueControl(
          value
        )
      ) {
        warnings.push(
          `Line ${lineNumber}: ${rawName} contains a control character that is unsafe or invalid in modern HTTP field values.`
        );
      }

      const key =
        rawName.toLowerCase();

      if (!fields[key]) {
        fields[key] = {
          key,
          displayName:
            canonicalHeaderName(
              key
            ),
          values: [],
          sourceLines: [],
          pseudo: false,
        };
      }

      fields[key].values.push(
        value
      );
      fields[
        key
      ].sourceLines.push(
        lineNumber
      );
      previousKey = key;
    }
  );

  if (
    !Object.keys(fields)
      .length
  ) {
    throw new Error(
      "No valid HTTP fields were found in one of the supplied sections."
    );
  }

  if (malformed.length) {
    warnings.push(
      `${malformed.length} non-empty line${
        malformed.length ===
        1
          ? ""
          : "s"
      } could not be parsed as an HTTP field or start/status line. They are listed separately instead of being silently ignored.`
    );
  }

  Object.keys(fields).forEach(
    (key) => {
      const entry =
        fields[key];

      if (
        entry.values.length >
          1 &&
        key === "set-cookie"
      ) {
        warnings.push(
          "Set-Cookie appears on multiple field lines. Those lines are preserved separately; Set-Cookie is a well-known exception that must not be naively comma-combined."
        );
      }
    }
  );

  return {
    startLine,
    fields,
    warnings,
    malformed,
  };
}

function shouldIgnore(
  key: string,
  ignoreVolatile: boolean
) {
  return (
    ignoreVolatile &&
    VOLATILE_HEADERS.indexOf(
      key
    ) !== -1
  );
}

function arraysEqual(
  left: string[],
  right: string[]
) {
  if (
    left.length !==
    right.length
  ) {
    return false;
  }

  for (
    let index = 0;
    index < left.length;
    index += 1
  ) {
    if (
      left[index] !==
      right[index]
    ) {
      return false;
    }
  }

  return true;
}

function sensitiveName(
  key: string
) {
  return (
    SENSITIVE_HEADERS.indexOf(
      key
    ) !== -1 ||
    /(?:token|secret|api[-_]?key|credential)/i.test(
      key
    )
  );
}

function buildHeaderDiff(
  before: HeaderSection,
  after: HeaderSection,
  ignoreVolatile: boolean
) {
  const keys =
    Array.from(
      new Set(
        Object.keys(
          before.fields
        ).concat(
          Object.keys(
            after.fields
          )
        )
      )
    )
      .filter(
        (key) =>
          !shouldIgnore(
            key,
            ignoreVolatile
          )
      )
      .sort();

  const fields: HeaderDiff[] =
    keys.map((key) => {
      const beforeEntry =
        before.fields[key];
      const afterEntry =
        after.fields[key];
      const beforeValues =
        beforeEntry
          ? beforeEntry.values
          : [];
      const afterValues =
        afterEntry
          ? afterEntry.values
          : [];
      let status: DiffStatus =
        "Same";

      if (
        !beforeEntry &&
        afterEntry
      ) {
        status = "Added";
      } else if (
        beforeEntry &&
        !afterEntry
      ) {
        status = "Removed";
      } else if (
        !arraysEqual(
          beforeValues,
          afterValues
        )
      ) {
        status = "Changed";
      }

      return {
        key,
        name:
          beforeEntry
            ? beforeEntry
                .displayName
            : afterEntry
            ? afterEntry
                .displayName
            : key,
        status,
        before:
          beforeValues.slice(),
        after:
          afterValues.slice(),
        sensitive:
          sensitiveName(
            key
          ),
      };
    });

  let startLineStatus:
    | DiffStatus
    | "Not compared" =
    "Not compared";

  if (
    before.startLine ||
    after.startLine
  ) {
    if (
      !before.startLine
    ) {
      startLineStatus =
        "Added";
    } else if (
      !after.startLine
    ) {
      startLineStatus =
        "Removed";
    } else if (
      before.startLine ===
      after.startLine
    ) {
      startLineStatus =
        "Same";
    } else {
      startLineStatus =
        "Changed";
    }
  }

  const warnings =
    before.warnings
      .map(
        (warning) =>
          `Before: ${warning}`
      )
      .concat(
        after.warnings.map(
          (warning) =>
            `After: ${warning}`
        )
      );

  const ignoredNames =
    ignoreVolatile
      ? VOLATILE_HEADERS.filter(
          (key) =>
            Boolean(
              before.fields[
                key
              ] ||
                after.fields[
                  key
                ]
            )
        )
      : [];

  if (
    fields.some(
      (field) =>
        field.key ===
          "content-length" &&
        field.status ===
          "Changed"
    )
  ) {
    warnings.push(
      "Content-Length changed. That may simply reflect a different payload; compare Content-Type, Content-Encoding, status, and body generation before treating it as a header defect."
    );
  }

  if (
    fields.some(
      (field) =>
        field.key ===
          "cache-control" &&
        field.status !==
          "Same"
    )
  ) {
    warnings.push(
      "Cache-Control changed. Review browser/shared-cache behavior together with related validators such as Age, Expires, ETag, Last-Modified, Vary, and CDN cache rules."
    );
  }

  if (
    fields.some(
      (field) =>
        [
          "content-security-policy",
          "strict-transport-security",
          "x-frame-options",
          "referrer-policy",
          "permissions-policy",
        ].indexOf(
          field.key
        ) !== -1 &&
        field.status !==
          "Same"
    )
  ) {
    warnings.push(
      "One or more browser security policies changed. A diff proves the field changed; it does not prove the new policy is safer or compatible with the application."
    );
  }

  return {
    before,
    after,
    fields,
    startLineStatus,
    warnings,
    ignoredNames,
  } as DiffReport;
}

function redactedValue(
  value: string,
  sensitive: boolean,
  redact: boolean
) {
  if (
    sensitive &&
    redact
  ) {
    return "[redacted]";
  }

  return value;
}

function formatValues(
  values: string[],
  sensitive: boolean,
  redact: boolean
) {
  if (!values.length) {
    return "(not present)";
  }

  return values
    .map(
      (value, index) =>
        `${
          values.length > 1
            ? `[${index + 1}] `
            : ""
        }${redactedValue(
          value,
          sensitive,
          redact
        )}`
    )
    .join("\n");
}

function redactMalformedLine(
  text: string,
  redact: boolean
) {
  if (!redact) {
    return text;
  }

  if (
    /^(?:authorization|proxy-authorization|cookie|set-cookie|x-api-key|api-key|[^:\s]*(?:token|secret|credential)[^:\s]*)\s*[:=]/i.test(
      text.trim()
    )
  ) {
    const name =
      text
        .trim()
        .split(/[:=]/)[0];

    return `${name}: [redacted malformed value]`;
  }

  return text;
}

function formatDiffReport(
  report: DiffReport,
  redact: boolean
) {
  const added =
    report.fields.filter(
      (item) =>
        item.status ===
        "Added"
    );
  const removed =
    report.fields.filter(
      (item) =>
        item.status ===
        "Removed"
    );
  const changed =
    report.fields.filter(
      (item) =>
        item.status ===
        "Changed"
    );
  const same =
    report.fields.filter(
      (item) =>
        item.status ===
        "Same"
    );
  const lines = [
    "HTTP header comparison",
    `Added: ${added.length}`,
    `Removed: ${removed.length}`,
    `Changed: ${changed.length}`,
    `Same: ${same.length}`,
    `Start/status line: ${report.startLineStatus}`,
  ];

  if (
    report.before
      .startLine ||
    report.after.startLine
  ) {
    lines.push(
      "",
      `Before start/status: ${report.before.startLine || "(not supplied)"}`,
      `After start/status: ${report.after.startLine || "(not supplied)"}`
    );
  }

  if (
    report.ignoredNames.length
  ) {
    lines.push(
      "",
      `Ignored volatile fields: ${report.ignoredNames
        .map(
          canonicalHeaderName
        )
        .join(", ")}`
    );
  }

  [
    ["Changed fields", changed],
    ["Added fields", added],
    ["Removed fields", removed],
    ["Unchanged fields", same],
  ].forEach(
    (group) => {
      const label =
        group[0] as string;
      const items =
        group[1] as HeaderDiff[];

      lines.push(
        "",
        `${label}:`
      );

      if (!items.length) {
        lines.push("  None");
        return;
      }

      items.forEach(
        (item) => {
          lines.push(
            `  ${item.name}`
          );

          if (
            item.status ===
            "Changed"
          ) {
            lines.push(
              `    Before: ${formatValues(
                item.before,
                item.sensitive,
                redact
              ).replace(
                /\n/g,
                "\n            "
              )}`,
              `    After: ${formatValues(
                item.after,
                item.sensitive,
                redact
              ).replace(
                /\n/g,
                "\n           "
              )}`
            );
          } else {
            const values =
              item.status ===
              "Added"
                ? item.after
                : item.before;

            lines.push(
              `    ${formatValues(
                values,
                item.sensitive,
                redact
              ).replace(
                /\n/g,
                "\n    "
              )}`
            );
          }
        }
      );
    }
  );

  if (
    report.before.malformed
      .length ||
    report.after.malformed
      .length
  ) {
    lines.push(
      "",
      "Unparsed lines:"
    );

    report.before.malformed.forEach(
      (item) =>
        lines.push(
          `  Before line ${item.line}: ${redactMalformedLine(
            item.text,
            redact
          )}`
        )
    );
    report.after.malformed.forEach(
      (item) =>
        lines.push(
          `  After line ${item.line}: ${redactMalformedLine(
            item.text,
            redact
          )}`
        )
    );
  }

  if (
    report.warnings.length
  ) {
    lines.push(
      "",
      "Review notes:",
      ...report.warnings.map(
        (warning) =>
          `- ${warning}`
      )
    );
  }

  return lines.join("\n");
}

export default function ToolClient() {
  const [
    beforeInput,
    setBeforeInput,
  ] = useState("");
  const [
    afterInput,
    setAfterInput,
  ] = useState("");
  const [report, setReport] =
    useState<DiffReport | null>(
      null
    );
  const [error, setError] =
    useState("");
  const [
    redactSensitive,
    setRedactSensitive,
  ] = useState(true);
  const [
    ignoreVolatile,
    setIgnoreVolatile,
  ] = useState(false);
  const [copied, setCopied] =
    useState(false);

  const clearResult = () => {
    setReport(null);
    setError("");
    setCopied(false);
  };

  const compareHeaders = () => {
    if (
      !beforeInput.trim() ||
      !afterInput.trim()
    ) {
      setError(
        "Paste both header sections before comparing them."
      );
      setReport(null);
      return;
    }

    try {
      const before =
        parseHeaderSection(
          beforeInput
        );
      const after =
        parseHeaderSection(
          afterInput
        );

      setReport(
        buildHeaderDiff(
          before,
          after,
          ignoreVolatile
        )
      );
      setError("");
      setCopied(false);
    } catch (caught) {
      setReport(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to compare these HTTP fields."
      );
      setCopied(false);
    }
  };

  const loadExample = () => {
    setBeforeInput(
      SAMPLE_BEFORE
    );
    setAfterInput(
      SAMPLE_AFTER
    );
    setRedactSensitive(true);
    setIgnoreVolatile(false);
    clearResult();
  };

  const resetAll = () => {
    setBeforeInput("");
    setAfterInput("");
    setRedactSensitive(true);
    setIgnoreVolatile(false);
    clearResult();
  };

  const copyReport = async () => {
    if (!report) return;

    try {
      await navigator.clipboard.writeText(
        formatDiffReport(
          report,
          redactSensitive
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
        "The header comparison report could not be copied. Select and copy it manually."
      );
    }
  };

  const changed = report
    ? report.fields.filter(
        (item) =>
          item.status ===
          "Changed"
      ).length
    : 0;
  const added = report
    ? report.fields.filter(
        (item) =>
          item.status ===
          "Added"
      ).length
    : 0;
  const removed = report
    ? report.fields.filter(
        (item) =>
          item.status ===
          "Removed"
      ).length
    : 0;
  const same = report
    ? report.fields.filter(
        (item) =>
          item.status ===
          "Same"
      ).length
    : 0;

  return (
    <ToolShell
      title="HTTP Header Diff Checker"
      description="Compare HTTP header sets while preserving case-insensitive names, repeated fields, malformed lines, and redaction needs."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <HeaderInput
          label="Before"
          value={beforeInput}
          onChange={(value) => {
            setBeforeInput(
              value
            );
            clearResult();
          }}
          placeholder={
            SAMPLE_BEFORE
          }
        />
        <HeaderInput
          label="After"
          value={afterInput}
          onChange={(value) => {
            setAfterInput(
              value
            );
            clearResult();
          }}
          placeholder={
            SAMPLE_AFTER
          }
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="self-start flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
          <input
            type="checkbox"
            checked={
              redactSensitive
            }
            onChange={(event: {
              target: {
                checked: boolean;
              };
            }) =>
              setRedactSensitive(
                event.target.checked
              )
            }
            className="mt-1"
          />
          <span>
            <strong>
              Redact sensitive values in visible/copy reports.
            </strong>{" "}
            Authorization, Cookie, Set-Cookie, API-key-like and credential-like
            field values remain part of the in-browser comparison but display as
            <code> [redacted]</code>.
          </span>
        </label>

        <label className="self-start flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
          <input
            type="checkbox"
            checked={
              ignoreVolatile
            }
            onChange={(event: {
              target: {
                checked: boolean;
              };
            }) => {
              setIgnoreVolatile(
                event.target.checked
              );
              clearResult();
            }}
            className="mt-1"
          />
          <span>
            <strong>
              Ignore common volatile trace/timing fields.
            </strong>{" "}
            Hides Date, Age, request/correlation IDs, traceparent/tracestate,
            CF-Ray and Server-Timing from the diff.
          </span>
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={
            compareHeaders
          }
          className="yoryantra-btn shrink-0 whitespace-nowrap"
        >
          Compare Headers
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="yoryantra-btn-outline shrink-0 whitespace-nowrap"
        >
          Load Example
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
        <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      {report ? (
        <div className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Changed"
              value={String(
                changed
              )}
            />
            <Stat
              label="Added"
              value={String(
                added
              )}
            />
            <Stat
              label="Removed"
              value={String(
                removed
              )}
            />
            <Stat
              label="Same"
              value={String(same)}
            />
          </div>

          {(report.before
            .startLine ||
            report.after
              .startLine) ? (
            <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              <strong>
                Start/status line:
              </strong>{" "}
              {report.startLineStatus}
              <div className="mt-2 grid gap-2 font-mono text-xs md:grid-cols-2">
                <div className="break-all">
                  Before:{" "}
                  {report.before
                    .startLine ||
                    "(not supplied)"}
                </div>
                <div className="break-all">
                  After:{" "}
                  {report.after
                    .startLine ||
                    "(not supplied)"}
                </div>
              </div>
            </div>
          ) : null}

          {report.warnings.length ? (
            <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-900">
              <strong>
                Comparison notes:
              </strong>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                {report.warnings.map(
                  (
                    warning,
                    index
                  ) => (
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
                  Field-by-field diff
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Header field names compare case-insensitively. Values and
                  repeated-field order are preserved after normal surrounding
                  whitespace is removed.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  copyReport
                }
                className="yoryantra-btn-outline shrink-0 whitespace-nowrap"
              >
                {copied
                  ? "Copied"
                  : "Copy Report"}
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {report.fields.map(
                (item) => (
                  <DiffCard
                    key={
                      item.key
                    }
                    item={item}
                    redact={
                      redactSensitive
                    }
                  />
                )
              )}
            </div>
          </div>

          {(report.before
            .malformed.length ||
            report.after
              .malformed
              .length) ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
              <h3 className="font-semibold text-red-900">
                Unparsed input lines
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-red-800">
                These lines were preserved as evidence instead of silently
                disappearing from the comparison.
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <MalformedList
                  label="Before"
                  items={
                    report.before
                      .malformed
                  }
                  redact={
                    redactSensitive
                  }
                />
                <MalformedList
                  label="After"
                  items={
                    report.after
                      .malformed
                  }
                  redact={
                    redactSensitive
                  }
                />
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <pre className="yoryantra-output mt-8 min-h-[280px] overflow-auto whitespace-pre-wrap break-words text-sm">
          Added, removed, changed and unchanged HTTP fields will appear here
          with repeated-value and malformed-line details.
        </pre>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Comparison runs on the pasted header text in your browser. The tool
        does not request either URL or reproduce intermediary/proxy behavior.
        Site-wide analytics or advertising scripts, if enabled, are separate
        from the comparison operation.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            HTTP Field Names Ignore Case; Your Diff Tool Should Too
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 9110 defines HTTP field names as case-insensitive.{" "}
            <code>content-type</code>, <code>Content-Type</code> and{" "}
            <code>CONTENT-TYPE</code> therefore identify the same field name in
            HTTP semantics. Treating capitalization alone as a deployment
            change produces noisy diffs.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Yoryantra normalizes the comparison key to lowercase while keeping
            a readable display name. HTTP/2 and HTTP/3 pseudo-fields such as{" "}
            <code>:status</code> are handled separately because their syntax is
            not an ordinary HTTP field line.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Repeated Field Lines Are Data, Not Formatting Noise
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            HTTP permits many fields to be repeated, and RFC 9110 generally
            defines combination by preserving the order of field-line values.
            A diff that converts every field into one dictionary string before
            comparison can lose that evidence.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Every parsed field line stays in source order. If the before
            response contains two <code>Warning</code> lines and the after
            response reverses or changes them, that remains visible instead of
            being flattened away.
          </p>
        </div>

        <div className="mt-12 self-start rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            Set-Cookie Is the Classic Reason “Just Join Duplicates With a Comma” Is Dangerous
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            Set-Cookie commonly appears once per cookie and its syntax includes
            commas in places where generic list combination is unsafe. HTTP
            specifications call out Set-Cookie as a field that does not follow
            the ordinary combination model.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            The checker therefore preserves each Set-Cookie line independently.
            Sensitive redaction is on by default so session identifiers do not
            leak into screenshots or copied comparison reports.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Whitespace Around a Field Value Is Different From Whitespace Inside the Value
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            HTTP syntax permits optional whitespace around field values in
            serialized messages. A proxy might emit{" "}
            <code>Cache-Control: no-cache</code> while another emits spacing
            around the same value. That surrounding whitespace is removed by
            the parser before comparison.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Internal characters are preserved. The comparison does not reorder CSP
            directives, split Cache-Control tokens, normalize media types, sort
            Vary values, or reinterpret each registered field&apos;s grammar.
            Those transformations could incorrectly turn a real semantic change
            into “same.”
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            obs-fold Is Historical Input You May Still Encounter, Not Something New Servers Should Emit
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Older HTTP syntax allowed continuation lines beginning with space or
            tab. Modern HTTP treats that obsolete folding syntax as something
            recipients must handle cautiously rather than something senders
            should produce.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            When the pasted capture contains an indented continuation, this
            checker unfolds it into the preceding value and reports that it did
            so. That preserves useful debugging evidence without recommending
            obs-fold as valid modern output.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            A Changed Header Is an Observation; the Cause May Live in a Different Layer
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            If Server changes from Nginx to Cloudflare, your origin software may
            not have changed at all—the edge may be replacing the field. A new
            Age header can indicate cache reuse. A changed Content-Length may be
            compression, templating, minification or a genuinely different
            payload.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Header diffs are strongest when paired with the deployment event:
            CDN rule, reverse-proxy change, framework release, cache-policy
            update, security-header rollout, API version or origin migration.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Cache-Control Changes Need the Whole Cache Story
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Moving from <code>no-cache</code> to{" "}
            <code>public, max-age=3600</code> is obviously important, but the
            effective cache behavior can also depend on shared-cache directives,
            Vary, validators, Age, CDN configuration, authenticated responses,
            request headers and application-specific surrogate controls.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Use the diff to find the change. Then test representative requests
            through the actual browser/CDN/origin path before deciding the cache
            behavior is correct.
          </p>
        </div>

        <div className="mt-12 self-start rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            Security-Header Diffs Need Behavior Testing, Not “More Headers = Better”
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            Adding CSP, HSTS or Permissions-Policy can be a security
            improvement; a misconfigured value can also block scripts, embeds,
            authentication popups, API connections or whole subdomains.
            Removing X-Frame-Options might be acceptable when a stronger
            equivalent frame-ancestors policy is enforced.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            The checker flags policy changes so they get deliberate review. It
            does not assign security meaning simply from added/removed counts.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Volatile Fields Are Optional Noise Suppression, Not “Unimportant Headers”
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Date, Age, request IDs and tracing fields often differ on every
            request. Hiding them can make a before/after deployment diff easier
            to read. But those fields can be exactly what you need when
            diagnosing cache residency, request routing or distributed tracing.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The ignore option is therefore explicit and off by default. When
            enabled, the report lists which present fields were intentionally
            omitted.
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-relaxed text-gray-700">
          <a
            href="https://www.rfc-editor.org/rfc/rfc9110"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--green)] underline underline-offset-4"
          >
            RFC 9110: HTTP Semantics
          </a>{" "}
          is the useful baseline for field-name case-insensitivity, repeated
          field lines, field order and the general HTTP field model. Protocol
          version framing details belong to the relevant HTTP/1.1, HTTP/2 or
          HTTP/3 specification rather than a generic text diff.
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/http-header-diff-checker" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function HeaderInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(event: {
          target: {
            value: string;
          };
        }) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        aria-label={`${label} HTTP header section`}
        spellCheck={false}
        className="mt-2 w-full min-h-[340px] rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
      />
    </div>
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

function DiffCard({
  item,
  redact,
}: {
  item: HeaderDiff;
  redact: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700">
          {item.status}
        </span>
        <code className="break-all text-sm font-semibold text-gray-900">
          {item.name}
        </code>
        {item.sensitive ? (
          <span className="text-xs text-gray-500">
            sensitive
          </span>
        ) : null}
      </div>

      {item.status ===
      "Changed" ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <ValueBox
            label="Before"
            values={
              item.before
            }
            sensitive={
              item.sensitive
            }
            redact={redact}
          />
          <ValueBox
            label="After"
            values={
              item.after
            }
            sensitive={
              item.sensitive
            }
            redact={redact}
          />
        </div>
      ) : (
        <div className="mt-4">
          <ValueBox
            label={
              item.status ===
              "Added"
                ? "After"
                : "Before"
            }
            values={
              item.status ===
              "Added"
                ? item.after
                : item.before
            }
            sensitive={
              item.sensitive
            }
            redact={redact}
          />
        </div>
      )}
    </div>
  );
}

function ValueBox({
  label,
  values,
  sensitive,
  redact,
}: {
  label: string;
  values: string[];
  sensitive: boolean;
  redact: boolean;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-2 space-y-2">
        {values.length ? (
          values.map(
            (value, index) => (
              <code
                key={index}
                className="block break-all text-xs leading-relaxed text-gray-800"
              >
                {values.length >
                1
                  ? `${index + 1}. `
                  : ""}
                {redactedValue(
                  value,
                  sensitive,
                  redact
                )}
              </code>
            )
          )
        ) : (
          <span className="text-xs text-gray-500">
            Not present
          </span>
        )}
      </div>
    </div>
  );
}

function MalformedList({
  label,
  items,
  redact,
}: {
  label: string;
  items: Array<{
    line: number;
    text: string;
  }>;
  redact: boolean;
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-white/60 p-4">
      <div className="text-sm font-semibold text-red-900">
        {label}
      </div>
      {items.length ? (
        <ul className="mt-2 space-y-2 text-xs text-red-800">
          {items.map(
            (item, index) => (
              <li
                key={`${item.line}-${index}`}
              >
                line{" "}
                {item.line}:{" "}
                <code>
                  {redactMalformedLine(
                    item.text,
                    redact
                  )}
                </code>
              </li>
            )
          )}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-red-800">
          None
        </p>
      )}
    </div>
  );
}
