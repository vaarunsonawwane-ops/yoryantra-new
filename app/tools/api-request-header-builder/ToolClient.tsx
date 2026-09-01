"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type HeaderRow = {
  id: number;
  name: string;
  value: string;
  enabled: boolean;
};

type OutputMode =
  | "plain"
  | "fetch"
  | "curl"
  | "json";

type BuildResult = {
  output: string;
  warnings: string[];
  notes: string[];
  active: HeaderRow[];
  sensitiveCount: number;
};

const STARTER_HEADERS: HeaderRow[] = [
  {
    id: 1,
    name: "Accept",
    value:
      "application/json",
    enabled: true,
  },
  {
    id: 2,
    name: "Content-Type",
    value:
      "application/json",
    enabled: true,
  },
  {
    id: 3,
    name: "Authorization",
    value:
      "Bearer YOUR_TOKEN_HERE",
    enabled: false,
  },
];

const PRESETS = [
  {
    label: "Bearer token",
    name: "Authorization",
    value:
      "Bearer YOUR_TOKEN_HERE",
  },
  {
    label: "Accept JSON",
    name: "Accept",
    value:
      "application/json",
  },
  {
    label: "JSON body",
    name: "Content-Type",
    value:
      "application/json",
  },
  {
    label: "API key",
    name: "X-API-Key",
    value:
      "YOUR_API_KEY_HERE",
  },
  {
    label:
      "Idempotency key",
    name: "Idempotency-Key",
    value:
      "YOUR_IDEMPOTENCY_KEY",
  },
  {
    label: "No cache",
    name: "Cache-Control",
    value: "no-cache",
  },
];

const BROWSER_FORBIDDEN_EXACT = [
  "accept-charset",
  "accept-encoding",
  "access-control-request-headers",
  "access-control-request-method",
  "connection",
  "content-length",
  "cookie",
  "cookie2",
  "date",
  "dnt",
  "expect",
  "host",
  "keep-alive",
  "origin",
  "permissions-policy",
  "referer",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "via",
];

const USUALLY_SINGLE = [
  "authorization",
  "content-type",
  "content-length",
  "host",
  "user-agent",
  "referer",
  "origin",
];

const CORS_SAFELISTED_NAMES = [
  "accept",
  "accept-language",
  "content-language",
  "content-type",
  "range",
];

function cloneStarter() {
  return STARTER_HEADERS.map(
    (header) => ({
      ...header,
    })
  );
}

function isToken(
  value: string
) {
  return /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/.test(
    value
  );
}

function hasInvalidValueControl(
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
      code === 0x0a ||
      code === 0x0d ||
      code === 0x00 ||
      code === 0x7f ||
      (code < 0x20 &&
        code !== 0x09)
    ) {
      return true;
    }
  }

  return false;
}

function browserForbiddenName(
  lower: string
) {
  return (
    BROWSER_FORBIDDEN_EXACT.indexOf(
      lower
    ) !== -1 ||
    lower.indexOf(
      "proxy-"
    ) === 0 ||
    lower.indexOf(
      "sec-"
    ) === 0
  );
}

function sensitiveHeader(
  lower: string
) {
  return (
    [
      "authorization",
      "proxy-authorization",
      "cookie",
      "set-cookie",
      "x-api-key",
      "api-key",
    ].indexOf(lower) !==
      -1 ||
    /(?:token|secret|api[-_]?key|credential)/i.test(
      lower
    )
  );
}

function isCorsSafelistedContentType(
  value: string
) {
  const mediaType =
    value
      .split(";")[0]
      .trim()
      .toLowerCase();

  return (
    mediaType ===
      "application/x-www-form-urlencoded" ||
    mediaType ===
      "multipart/form-data" ||
    mediaType ===
      "text/plain"
  );
}

function crossOriginPreflightLikely(
  name: string,
  value: string
) {
  const lower =
    name.toLowerCase();

  if (
    CORS_SAFELISTED_NAMES.indexOf(
      lower
    ) === -1
  ) {
    return true;
  }

  if (
    lower ===
    "content-type"
  ) {
    return !isCorsSafelistedContentType(
      value
    );
  }

  if (
    lower === "range" &&
    value.indexOf(",") !==
      -1
  ) {
    return true;
  }

  return false;
}

function posixSingleQuote(
  value: string
) {
  return `'${value.replace(
    /'/g,
    `'\\''`
  )}'`;
}

function normalizeRows(
  rows: HeaderRow[]
) {
  return rows
    .filter(
      (row) =>
        row.enabled &&
        row.name.trim()
    )
    .map((row) => ({
      ...row,
      name:
        row.name.trim(),
      value:
        row.value.replace(
          /^[ \t]+|[ \t]+$/g,
          ""
        ),
    }));
}

function validateRows(
  rows: HeaderRow[]
) {
  if (!rows.length) {
    throw new Error(
      "Enable at least one header row with a field name."
    );
  }

  rows.forEach(
    (row, index) => {
      if (
        row.name.charAt(0) ===
        ":"
      ) {
        throw new Error(
          `Row ${
            index + 1
          }: HTTP/2 and HTTP/3 pseudo-fields such as ${row.name} are protocol framing fields, not ordinary API request headers for this builder.`
        );
      }

      if (
        !isToken(row.name)
      ) {
        throw new Error(
          `Row ${
            index + 1
          }: "${row.name}" is not a valid HTTP field-name token.`
        );
      }

      if (
        hasInvalidValueControl(
          row.value
        )
      ) {
        throw new Error(
          `Row ${
            index + 1
          }: ${row.name} contains CR, LF, NUL, DEL, or another unsafe control character. Header values cannot contain raw line breaks in this builder.`
        );
      }
    }
  );
}

function formatPlain(
  rows: HeaderRow[]
) {
  return rows
    .map(
      (row) =>
        `${row.name}: ${row.value}`
    )
    .join("\n");
}

function formatFetch(
  rows: HeaderRow[]
) {
  const lines = [
    "const headers = new Headers();",
  ];

  rows.forEach((row) => {
    lines.push(
      `headers.append(${JSON.stringify(
        row.name
      )}, ${JSON.stringify(
        row.value
      )});`
    );
  });

  lines.push(
    "",
    "// Use in fetch options:",
    "fetch(url, { headers });"
  );

  return lines.join("\n");
}

function formatCurl(
  rows: HeaderRow[]
) {
  return rows
    .map(
      (row) =>
        `-H ${posixSingleQuote(
          `${row.name}: ${row.value}`
        )}`
    )
    .join(" \\\n  ");
}

function formatJsonPairs(
  rows: HeaderRow[]
) {
  return JSON.stringify(
    rows.map((row) => [
      row.name,
      row.value,
    ]),
    null,
    2
  );
}

function buildHeaders(
  rows: HeaderRow[],
  outputMode: OutputMode
): BuildResult {
  const active =
    normalizeRows(rows);

  validateRows(active);

  const warnings: string[] =
    [];
  const notes: string[] = [];
  const grouped =
    Object.create(
      null
    ) as Record<
      string,
      HeaderRow[]
    >;
  let sensitiveCount = 0;

  active.forEach((row) => {
    const lower =
      row.name.toLowerCase();

    if (!grouped[lower]) {
      grouped[lower] = [];
    }

    grouped[lower].push(
      row
    );

    if (
      sensitiveHeader(
        lower
      )
    ) {
      sensitiveCount += 1;
    }

    if (
      outputMode ===
        "fetch" &&
      browserForbiddenName(
        lower
      )
    ) {
      warnings.push(
        `${row.name} is browser-controlled or forbidden for script-authored Fetch requests. A browser may reject, replace, or omit it even though servers, cURL, Node.js, or lower-level clients can send similar fields.`
      );
    }

    if (
      outputMode ===
        "fetch" &&
      lower ===
        "user-agent"
    ) {
      notes.push(
        "User-Agent is not uniformly useful as a script-controlled browser Fetch header. Browser implementations can control or omit it; do not depend on this snippet to spoof a browser identity."
      );
    }

    if (
      outputMode ===
        "fetch" &&
      crossOriginPreflightLikely(
        row.name,
        row.value
      )
    ) {
      notes.push(
        `${row.name} is not CORS-safelisted in this form. On a cross-origin browser request, it can contribute to a preflight request unless another rule already requires one.`
      );
    }

    if (
      lower ===
      "content-type"
    ) {
      notes.push(
        "Content-Type describes the representation you are sending in the request body. Do not add application/json merely because you expect a JSON response."
      );
    }

    if (
      lower === "accept"
    ) {
      notes.push(
        "Accept describes response media types the client is willing to receive; it is different from Content-Type."
      );
    }

    if (
      lower ===
      "authorization"
    ) {
      notes.push(
        "Authorization credentials can be intentionally forwarded by API clients, but redirects, logs, examples, screenshots, browser extensions, and copied snippets can expose them. Use placeholders in documentation."
      );
    }
  });

  Object.keys(grouped).forEach(
    (lower) => {
      const duplicates =
        grouped[lower];

      if (
        duplicates.length > 1
      ) {
        if (
          USUALLY_SINGLE.indexOf(
            lower
          ) !== -1
        ) {
          warnings.push(
            `${duplicates[0].name} appears ${duplicates.length} times. HTTP permits repeated field lines in general, but this field is normally treated as one logical request value; confirm the target API/client semantics instead of relying on duplicate lines.`
          );
        } else {
          notes.push(
            `${duplicates[0].name} appears ${duplicates.length} times. Repeated field lines are preserved by Plain, Fetch Headers.append(), cURL, and JSON-pairs output; whether repetition is meaningful depends on that field's specification.`
          );
        }
      }
    }
  );

  if (
    outputMode ===
    "fetch"
  ) {
    notes.push(
      "CORS notes here are practical hints, not a complete preflight simulator. Safelisted request-header values have additional byte/value restrictions, and request method/credentials/origin also affect browser CORS behavior."
    );
  }

  if (sensitiveCount) {
    warnings.push(
      `${sensitiveCount} enabled header row${
        sensitiveCount === 1
          ? " looks"
          : "s look"
      } credential- or secret-related. Prefer placeholders here unless you genuinely need a local one-off snippet, and avoid sharing the resulting output.`
    );
  }

  if (
    active.some(
      (row) =>
        row.name.toLowerCase() ===
        "content-length"
    )
  ) {
    warnings.push(
      "Content-Length is usually calculated by the HTTP client from the encoded request body. Hard-coding it can make the request invalid when the body changes."
    );
  }

  if (
    active.some(
      (row) =>
        row.name.toLowerCase() ===
        "host"
    )
  ) {
    notes.push(
      "Host/:authority identifies the target authority and is normally generated from the request URL by high-level clients. Override it only in clients/proxies that explicitly support that workflow."
    );
  }

  const uniqueNotes =
    Array.from(
      new Set(notes)
    );
  const uniqueWarnings =
    Array.from(
      new Set(warnings)
    );

  let output = "";

  if (
    outputMode === "plain"
  ) {
    output =
      formatPlain(active);
  } else if (
    outputMode === "fetch"
  ) {
    output =
      formatFetch(active);
  } else if (
    outputMode === "curl"
  ) {
    output =
      formatCurl(active);
  } else {
    output =
      formatJsonPairs(active);
  }

  return {
    output,
    warnings:
      uniqueWarnings,
    notes: uniqueNotes,
    active,
    sensitiveCount,
  };
}

export default function ToolClient() {
  const [headers, setHeaders] =
    useState<HeaderRow[]>(
      cloneStarter()
    );
  const [
    outputMode,
    setOutputMode,
  ] =
    useState<OutputMode>(
      "plain"
    );
  const [result, setResult] =
    useState<BuildResult | null>(
      null
    );
  const [error, setError] =
    useState("");
  const [nextId, setNextId] =
    useState(4);
  const [copied, setCopied] =
    useState(false);

  const activeCount =
    useMemo(
      () =>
        headers.filter(
          (row) =>
            row.enabled &&
            row.name.trim()
        ).length,
      [headers]
    );

  const clearResult = () => {
    setResult(null);
    setError("");
    setCopied(false);
  };

  const addHeader = () => {
    setHeaders((current) =>
      current.concat([
        {
          id: nextId,
          name: "",
          value: "",
          enabled: true,
        },
      ])
    );
    setNextId(
      (value) =>
        value + 1
    );
    clearResult();
  };

  const addPreset = (
    name: string,
    value: string
  ) => {
    setHeaders((current) =>
      current.concat([
        {
          id: nextId,
          name,
          value,
          enabled: true,
        },
      ])
    );
    setNextId(
      (value) =>
        value + 1
    );
    clearResult();
  };

  const updateHeader = (
    id: number,
    field:
      | "name"
      | "value"
      | "enabled",
    value:
      | string
      | boolean
  ) => {
    setHeaders((current) =>
      current.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]:
                value,
            }
          : row
      )
    );
    clearResult();
  };

  const removeHeader = (
    id: number
  ) => {
    setHeaders((current) =>
      current.filter(
        (row) =>
          row.id !== id
      )
    );
    clearResult();
  };

  const generate = () => {
    try {
      setResult(
        buildHeaders(
          headers,
          outputMode
        )
      );
      setError("");
      setCopied(false);
    } catch (caught) {
      setResult(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to build these request headers."
      );
      setCopied(false);
    }
  };

  const resetAll = () => {
    setHeaders(
      cloneStarter()
    );
    setOutputMode(
      "plain"
    );
    setNextId(4);
    clearResult();
  };

  const copyOutput = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(
        result.output
      );
      setCopied(true);
      window.setTimeout(
        () => setCopied(false),
        1400
      );
    } catch {
      setCopied(false);
      setError(
        "The generated header snippet could not be copied. Select and copy it manually."
      );
    }
  };

  return (
    <ToolShell
      title="API Request Header Builder"
      description="Build API request-header snippets without sending a request: validate field-name/value syntax, preserve repeated fields where the output format can represent them, flag browser-controlled headers, and separate authentication, representation and CORS concerns."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Request header rows
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Empty values are allowed. Raw CR/LF and unsafe control characters
              are rejected so a value cannot create a second header line.
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {activeCount} enabled
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {headers.map(
            (header) => (
              <div
                key={
                  header.id
                }
                className="grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 lg:grid-cols-[44px_1fr_1.4fr_auto]"
              >
                <label className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={
                      header.enabled
                    }
                    onChange={(event: {
                      target: {
                        checked: boolean;
                      };
                    }) =>
                      updateHeader(
                        header.id,
                        "enabled",
                        event.target
                          .checked
                      )
                    }
                    aria-label={`Enable ${header.name || "header row"}`}
                  />
                </label>

                <input
                  value={
                    header.name
                  }
                  onChange={(event: {
                    target: {
                      value: string;
                    };
                  }) =>
                    updateHeader(
                      header.id,
                      "name",
                      event.target.value
                    )
                  }
                  placeholder="Header name"
                  spellCheck={false}
                  className="rounded-xl border border-gray-300 p-3 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
                />

                <input
                  value={
                    header.value
                  }
                  onChange={(event: {
                    target: {
                      value: string;
                    };
                  }) =>
                    updateHeader(
                      header.id,
                      "value",
                      event.target.value
                    )
                  }
                  placeholder="Header value"
                  spellCheck={false}
                  className="rounded-xl border border-gray-300 p-3 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
                />

                <button
                  type="button"
                  onClick={() =>
                    removeHeader(
                      header.id
                    )
                  }
                  className="yoryantra-btn-outline whitespace-nowrap"
                >
                  Remove
                </button>
              </div>
            )
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={addHeader}
            className="yoryantra-btn-outline"
          >
            Add Header
          </button>

          {PRESETS.map(
            (preset) => (
              <button
                key={
                  preset.label
                }
                type="button"
                onClick={() =>
                  addPreset(
                    preset.name,
                    preset.value
                  )
                }
                className="yoryantra-btn-outline"
              >
                {preset.label}
              </button>
            )
          )}
        </div>
      </div>

      <div className="mt-7 max-w-xl">
        <YoryantraSelect
          label="Output format"
          value={outputMode}
          onChange={(value: string) => {
            setOutputMode(
              value as OutputMode
            );
            clearResult();
          }}
          options={[
            {
              label:
                "Plain HTTP field lines",
              value: "plain",
            },
            {
              label:
                "JavaScript Fetch / Headers API",
              value: "fetch",
            },
            {
              label:
                "cURL -H flags (POSIX shell)",
              value: "curl",
            },
            {
              label:
                "JSON array of [name, value] pairs",
              value: "json",
            },
          ]}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={generate}
          className="yoryantra-btn"
        >
          Build Headers
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

      {result ? (
        <div className="mt-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat
              label="Enabled fields"
              value={String(
                result.active
                  .length
              )}
            />
            <Stat
              label="Warnings"
              value={String(
                result.warnings
                  .length
              )}
            />
            <Stat
              label="Sensitive rows"
              value={String(
                result.sensitiveCount
              )}
            />
          </div>

          {result.warnings.length ? (
            <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-900">
              <strong>
                Review before using the snippet:
              </strong>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                {result.warnings.map(
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
                  Generated request-header snippet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  The builder does not add a real URL, request body, method,
                  or authentication secret beyond the values you explicitly
                  enter.
                </p>
              </div>

              <button
                type="button"
                onClick={copyOutput}
                className="yoryantra-btn-outline whitespace-nowrap"
              >
                {copied
                  ? "Copied"
                  : "Copy"}
              </button>
            </div>

            <pre className="yoryantra-output mt-4 min-h-[300px] overflow-auto whitespace-pre-wrap break-words font-mono text-sm">
              {result.output}
            </pre>
          </div>

          {result.notes.length ? (
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              <ul className="list-disc space-y-2 pl-5">
                {result.notes.map(
                  (note, index) => (
                    <li
                      key={`${note}-${index}`}
                    >
                      {note}
                    </li>
                  )
                )}
              </ul>
            </div>
          ) : null}
        </div>
      ) : (
        <pre className="yoryantra-output mt-8 min-h-[280px] overflow-auto whitespace-pre-wrap break-words text-sm">
          Validated HTTP request-header output and browser/API review notes will
          appear here.
        </pre>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Header construction happens on the values in your browser. The tool
        does not call an API endpoint. Avoid using real production tokens in
        reusable examples or shared sessions. Site-wide analytics or
        advertising scripts, if enabled, are separate from this construction
        operation.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            A Header Name and Value Can Be Syntactically Fine and Still Be Wrong for the Request
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            HTTP defines a general field model, but individual field
            specifications define what each value means.{" "}
            <code>Authorization: Bearer ...</code> can be valid syntax and still
            fail because the token has the wrong audience.{" "}
            <code>Content-Type: application/json</code> can be valid and still
            be wrong when the request body is multipart data.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This builder validates the structural layer and surfaces common
            browser/API traps. The target API contract remains the authority on
            required authentication schemes, media types, versions and custom
            fields.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Accept and Content-Type Answer Opposite Sides of the Representation Conversation
          </h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-white p-4 text-sm leading-7 text-gray-800">{`Content-Type: application/json
Accept: application/problem+json, application/json`}</pre>
          <p className="mt-4 leading-relaxed text-gray-600">
            Content-Type describes the representation enclosed in this request
            when there is one. Accept expresses which response media types the
            client can accept. A GET request with no body often needs Accept but
            has no reason to claim it is sending JSON.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Servers can use content negotiation differently, so API
            documentation still decides whether either field is required.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            Browsers Do Not Let JavaScript Control Every HTTP Request Field
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            The Fetch standard and browser implementations reserve or control
            fields such as Host, Content-Length, Connection, Cookie, Origin and
            Sec-* request metadata. High-level browser code cannot treat the
            network request like a raw TCP header editor.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            When Fetch output contains one of those names, this tool warns
            rather than producing a false promise that the browser will send
            the line exactly as written. cURL, backend clients and proxy
            libraries have different levels of control.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Custom Authentication Headers Can Change CORS Before the API Code Runs
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Cross-origin browser requests have a small set of CORS-safelisted
            request headers and value restrictions. Authorization, X-API-Key and
            most custom fields are not simple safelisted request headers.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            That can trigger a preflight OPTIONS request. If the server does not
            answer the preflight with compatible Access-Control-Allow-Origin,
            Access-Control-Allow-Methods and Access-Control-Allow-Headers
            behavior, the browser can block the frontend request even though the
            same cURL request works perfectly.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Duplicate Header Lines Are Not Universally Invalid—and Not Universally Safe Either
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            HTTP&apos;s general field model allows repeated field lines for fields
            whose definition permits combination. But fields have their own
            semantics. Sending two Authorization lines or two conflicting
            Content-Type fields is usually a configuration smell even though a
            generic parser can represent both.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The old Yoryantra builder rejected every duplicate. This version
            preserves repeated fields in raw HTTP, Fetch Headers.append(), cURL
            and JSON pair output, then warns more strongly for fields that are
            normally one logical request value.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-xl font-semibold text-red-900">
            CR/LF in a Header Value Is Not a Clever Way to Add a Second Header
          </h2>
          <p className="mt-4 leading-relaxed text-red-900/90">
            Building a header block from user-controlled text without rejecting
            line breaks can create header-injection or response/request
            splitting problems in vulnerable systems. Modern HTTP libraries
            generally prohibit this, but code generators should not normalize
            dangerous input into apparently valid examples.
          </p>
          <p className="mt-4 leading-relaxed text-red-900/90">
            This builder rejects CR, LF, NUL, DEL and unsafe control characters
            in field values. If the API needs a multiline logical value, use
            that field&apos;s defined encoding/serialization rather than raw
            message framing characters.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Content-Length Is Usually the Client&apos;s Job
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Content-Length describes the size of the message content in bytes
            under HTTP framing rules. A JavaScript string length is not
            automatically that byte length, and transfer/content codings can
            further affect what a client sends.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            High-level HTTP clients calculate framing fields from the body they
            serialize. Hard-coding Content-Length in an example is fragile and
            browsers do not let Fetch scripts control it directly.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            JSON Object Output Cannot Faithfully Represent Duplicate Field Names
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A JavaScript/JSON object has one property slot for a given key.
            Serializing two <code>X-Tag</code> lines to an object therefore
            either overwrites one value or invents an array convention that a
            client may not understand.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            For that reason the JSON mode emits an array of{" "}
            <code>[name, value]</code> pairs. It preserves order and duplicate
            names without pretending every HTTP client accepts an arbitrary
            object shape.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            cURL Quoting Is Shell Syntax, Not HTTP Syntax
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The <code>-H</code> argument tells cURL what header field line to
            add. The quotes around that argument are interpreted by your shell
            before cURL receives it. Bash/zsh-style POSIX quoting is different
            from Windows Command Prompt or PowerShell quoting.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This tool labels its cURL output as POSIX-shell flags and escapes
            embedded single quotes accordingly. If you paste those flags into
            another shell, translate the shell quoting rather than modifying
            the actual HTTP header value.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Placeholder Credentials Should Stay Placeholders in Documentation
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Bearer tokens and API keys routinely escape through issue trackers,
            copied terminal commands, screenshots, browser history, chat logs,
            code examples and CI output. A header builder makes snippets easy to
            copy, so it should also make that risk visible.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Use obvious placeholders in reusable snippets. When a real secret
            must be used for a local test, avoid saving the generated output and
            rotate the credential if it is exposed outside the intended
            environment.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <ReferenceCard
            title="RFC 9110: HTTP Semantics"
            href="https://www.rfc-editor.org/rfc/rfc9110"
            text="Defines the general HTTP field model, field-name token grammar, field values, repeated field lines and common request semantics."
          />
          <ReferenceCard
            title="WHATWG Fetch"
            href="https://fetch.spec.whatwg.org/"
            text="Defines browser Fetch behavior, forbidden request-header names, CORS-safelisted request headers and browser-controlled request processing."
          />
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <YoryantraRelatedTools currentHref="/tools/api-request-header-builder" />
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
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
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
