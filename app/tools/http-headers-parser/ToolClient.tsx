"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type ParsedField = {
  line: number;
  name: string;
  normalizedName: string;
  value: string;
  pseudo: boolean;
  obsFold: boolean;
};

type FieldGroup = {
  originalNames: string[];
  values: string[];
  lines: number[];
  count: number;
  combination: string;
};

type ParsedHeaders = {
  startLine: {
    kind: "request" | "response";
    value: string;
  } | null;
  fieldCount: number;
  uniqueFieldNames: number;
  repeatedFieldNames: number;
  bodyLinesIgnored: number;
  fields: ParsedField[];
  grouped: Record<string, FieldGroup>;
  diagnostics: string[];
  note: string;
};

const TOKEN_NAME_PATTERN = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
const PSEUDO_NAME_PATTERN = /^:[a-z0-9-]+$/;
const KNOWN_PSEUDO = [
  ":method",
  ":scheme",
  ":authority",
  ":path",
  ":status",
  ":protocol",
];

function createGroupMap() {
  return Object.create(null) as Record<string, FieldGroup>;
}

function hasForbiddenFieldValueControl(value: string) {
  return /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(value);
}

function parseFieldLine(
  line: string,
  lineNumber: number
): { field?: ParsedField; diagnostics: string[] } {
  const diagnostics: string[] = [];

  if (line.charAt(0) === ":") {
    const separator = line.indexOf(":", 1);

    if (separator === -1) {
      return {
        diagnostics: [
          `Line ${lineNumber}: pseudo-header has no colon separating its name and value.`,
        ],
      };
    }

    const name = line.slice(0, separator);
    const value = line
      .slice(separator + 1)
      .replace(/^[ \t]+|[ \t]+$/g, "");

    if (!PSEUDO_NAME_PATTERN.test(name)) {
      diagnostics.push(
        `Line ${lineNumber}: "${name}" is not valid lowercase pseudo-header syntax.`
      );
    }

    if (KNOWN_PSEUDO.indexOf(name) === -1) {
      diagnostics.push(
        `Line ${lineNumber}: "${name}" is not one of the standard pseudo-header names recognized by this parser.`
      );
    }

    if (hasForbiddenFieldValueControl(value)) {
      diagnostics.push(
        `Line ${lineNumber}: the pseudo-header value contains a prohibited control character.`
      );
    }

    return {
      field: {
        line: lineNumber,
        name,
        normalizedName: name,
        value,
        pseudo: true,
        obsFold: false,
      },
      diagnostics,
    };
  }

  const separator = line.indexOf(":");

  if (separator === -1) {
    return {
      diagnostics: [
        `Line ${lineNumber}: no colon separator was found.`,
      ],
    };
  }

  const rawName = line.slice(0, separator);
  const name = rawName.trim();
  const value = line
    .slice(separator + 1)
    .replace(/^[ \t]+|[ \t]+$/g, "");

  if (!name) {
    return {
      diagnostics: [`Line ${lineNumber}: field name is empty.`],
    };
  }

  if (!TOKEN_NAME_PATTERN.test(name)) {
    diagnostics.push(
      `Line ${lineNumber}: "${name}" contains characters that are not valid in an HTTP field name.`
    );
  }

  if (rawName !== name) {
    diagnostics.push(
      `Line ${lineNumber}: whitespace before the colon is invalid in an HTTP field line. The field is preserved only for inspection.`
    );
  }

  if (hasForbiddenFieldValueControl(value)) {
    diagnostics.push(
      `Line ${lineNumber}: field "${name}" contains a prohibited control character in its value.`
    );
  }

  return {
    field: {
      line: lineNumber,
      name,
      normalizedName: name.toLowerCase(),
      value,
      pseudo: false,
      obsFold: false,
    },
    diagnostics,
  };
}

function classifyStartLine(candidate: string) {
  if (/^HTTP\/\d(?:\.\d)?\s+\d{3}(?:\s+.*)?$/.test(candidate)) {
    return {
      kind: "response" as const,
      value: candidate,
    };
  }

  if (
    /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+\s+\S+\s+HTTP\/\d(?:\.\d)?$/.test(
      candidate
    )
  ) {
    return {
      kind: "request" as const,
      value: candidate,
    };
  }

  return null;
}

function addRepeatedFieldDiagnostics(
  grouped: Record<string, FieldGroup>,
  diagnostics: string[]
) {
  Object.keys(grouped).forEach((name) => {
    const group = grouped[name];

    if (group.count <= 1) return;

    if (name === "set-cookie") {
      group.combination = "keep-separate";
      diagnostics.push(
        `Set-Cookie appears ${group.count} times. Keep those field values separate; blindly comma-combining Set-Cookie changes its syntax.`
      );
      return;
    }

    if (name === "cookie") {
      group.combination = "protocol-specific-cookie-handling";
      diagnostics.push(
        `Cookie appears ${group.count} times. HTTP/2 and HTTP/3 define special handling for Cookie field lines, so preserve order and protocol context while debugging.`
      );
      return;
    }

    group.combination = "field-definition-dependent";
    diagnostics.push(
      `Field "${name}" appears ${group.count} times. Whether repeated values may be combined depends on that field's specification; do not assume a comma join is always valid.`
    );
  });
}

function parseContentLengthValues(group: FieldGroup | undefined) {
  if (!group) return [];

  const values: string[] = [];

  group.values.forEach((fieldValue) => {
    fieldValue.split(",").forEach((part) => {
      values.push(part.trim());
    });
  });

  return values;
}

function addFramingDiagnostics(
  grouped: Record<string, FieldGroup>,
  diagnostics: string[]
) {
  const contentLength = grouped["content-length"];
  const transferEncoding = grouped["transfer-encoding"];

  if (contentLength && transferEncoding) {
    diagnostics.push(
      "Both Content-Length and Transfer-Encoding are present. In HTTP/1.x this is a message-framing/security-sensitive combination; do not use this text parser as proof that the message is safe or acceptable."
    );
  }

  if (contentLength) {
    const values = parseContentLengthValues(contentLength);
    const invalid = values.some((value) => !/^\d+$/.test(value));
    const distinct: string[] = [];

    values.forEach((value) => {
      const normalized = /^\d+$/.test(value)
        ? value.replace(/^0+(?=\d)/, "")
        : value;

      if (distinct.indexOf(normalized) === -1) {
        distinct.push(normalized);
      }
    });

    if (invalid) {
      diagnostics.push(
        "Content-Length contains a value that is not an unsigned decimal integer."
      );
    }

    if (distinct.length > 1) {
      diagnostics.push(
        "Content-Length contains conflicting values. Conflicting message-length values are invalid and are relevant to HTTP request-smuggling defenses."
      );
    } else if (values.length > 1) {
      diagnostics.push(
        "Content-Length is repeated with the same numeric text. Some recipients can normalize identical duplicates, but duplicates still deserve review when debugging raw HTTP/1.x framing."
      );
    }
  }
}

function addPseudoHeaderDiagnostics(
  fields: ParsedField[],
  diagnostics: string[]
) {
  const pseudoFields = fields.filter((field) => field.pseudo);
  const regularFields = fields.filter((field) => !field.pseudo);

  if (pseudoFields.length === 0) return;

  if (regularFields.length > 0) {
    const lastPseudoLine = Math.max.apply(
      null,
      pseudoFields.map((field) => field.line)
    );
    const firstRegularLine = Math.min.apply(
      null,
      regularFields.map((field) => field.line)
    );

    if (lastPseudoLine > firstRegularLine) {
      diagnostics.push(
        "A pseudo-header appears after a regular field. HTTP/2 and HTTP/3 require pseudo-header fields to appear before regular fields."
      );
    }
  }

  const pseudoCounts = Object.create(null) as Record<string, number>;

  pseudoFields.forEach((field) => {
    pseudoCounts[field.name] = (pseudoCounts[field.name] || 0) + 1;
  });

  Object.keys(pseudoCounts).forEach((name) => {
    if (pseudoCounts[name] > 1) {
      diagnostics.push(
        `Pseudo-header "${name}" appears ${pseudoCounts[name]} times. Pseudo-header fields are not ordinary repeatable HTTP fields.`
      );
    }
  });

  const hasStatus = pseudoFields.some(
    (field) => field.name === ":status"
  );
  const hasRequestPseudo = pseudoFields.some(
    (field) =>
      field.name === ":method" ||
      field.name === ":scheme" ||
      field.name === ":authority" ||
      field.name === ":path" ||
      field.name === ":protocol"
  );

  if (hasStatus && hasRequestPseudo) {
    diagnostics.push(
      "The block mixes :status with request pseudo-headers. A normal HTTP/2 or HTTP/3 field section is either request-oriented or response-oriented, not both."
    );
  }

  regularFields.forEach((field) => {
    if (/[A-Z]/.test(field.name)) {
      diagnostics.push(
        `Field "${field.name}" contains uppercase letters while pseudo-headers are present. HTTP/2 and HTTP/3 field names are lowercase.`
      );
    }
  });
}

function addRequestDiagnostics(
  startLine: ParsedHeaders["startLine"],
  grouped: Record<string, FieldGroup>,
  diagnostics: string[]
) {
  if (!startLine || startLine.kind !== "request") return;

  if (
    /HTTP\/1\.1$/.test(startLine.value) &&
    !grouped["host"]
  ) {
    diagnostics.push(
      "This looks like a complete HTTP/1.1 request start line, but no Host field was parsed. A complete HTTP/1.1 request normally requires Host."
    );
  }

  if (grouped["host"] && grouped["host"].count > 1) {
    diagnostics.push(
      "Host appears more than once. Multiple Host fields are invalid in an HTTP/1.1 request and can be security-sensitive."
    );
  }
}

function parseHeadersBlock(input: string): ParsedHeaders {
  const sourceLines = input.replace(/\r\n?/g, "\n").split("\n");
  const diagnostics: string[] = [];
  const fields: ParsedField[] = [];
  let startLine: ParsedHeaders["startLine"] = null;

  let firstMeaningful = -1;

  for (let index = 0; index < sourceLines.length; index += 1) {
    if (sourceLines[index].trim()) {
      firstMeaningful = index;
      break;
    }
  }

  if (firstMeaningful !== -1) {
    const candidate = sourceLines[firstMeaningful].trim();
    const classified = classifyStartLine(candidate);

    if (classified) {
      startLine = classified;
      sourceLines[firstMeaningful] = "";
    }
  }

  let headerStarted = startLine !== null;
  let headerEnded = false;
  let ignoredAfterHeader = 0;

  sourceLines.forEach((line, zeroIndex) => {
    const lineNumber = zeroIndex + 1;

    if (zeroIndex === firstMeaningful && startLine !== null) return;

    if (!line.trim()) {
      if (headerStarted && !headerEnded) {
        headerEnded = true;
      }
      return;
    }

    if (headerEnded) {
      ignoredAfterHeader += 1;
      return;
    }

    headerStarted = true;

    if (/^[ \t]/.test(line)) {
      if (fields.length === 0) {
        diagnostics.push(
          `Line ${lineNumber}: an indented continuation line appears before any field.`
        );
        return;
      }

      const continuation = line.trim();
      const previous = fields[fields.length - 1];

      previous.value += ` ${continuation}`;
      previous.obsFold = true;

      diagnostics.push(
        `Line ${lineNumber}: obsolete line folding was unfolded with one space for inspection. Modern senders should not generate obs-fold.`
      );
      return;
    }

    const parsed = parseFieldLine(line, lineNumber);

    parsed.diagnostics.forEach((diagnostic) =>
      diagnostics.push(diagnostic)
    );

    if (parsed.field) {
      fields.push(parsed.field);
    }
  });

  if (ignoredAfterHeader > 0) {
    diagnostics.push(
      `${ignoredAfterHeader} non-empty line${
        ignoredAfterHeader === 1 ? " was" : "s were"
      } found after the first blank line and treated as message body or trailing text rather than headers.`
    );
  }

  const grouped = createGroupMap();

  fields.forEach((field) => {
    const name = field.normalizedName;

    if (!grouped[name]) {
      grouped[name] = {
        originalNames: [],
        values: [],
        lines: [],
        count: 0,
        combination: "single",
      };
    }

    const group = grouped[name];

    if (group.originalNames.indexOf(field.name) === -1) {
      group.originalNames.push(field.name);
    }

    group.values.push(field.value);
    group.lines.push(field.line);
    group.count += 1;
  });

  addRepeatedFieldDiagnostics(grouped, diagnostics);
  addFramingDiagnostics(grouped, diagnostics);
  addPseudoHeaderDiagnostics(fields, diagnostics);
  addRequestDiagnostics(startLine, grouped, diagnostics);

  const sensitiveNames = [
    "authorization",
    "proxy-authorization",
    "cookie",
    "set-cookie",
    "x-api-key",
    "api-key",
    "x-auth-token",
  ];

  const sensitive = fields.filter(
    (field) =>
      sensitiveNames.indexOf(field.normalizedName) !== -1
  );

  if (sensitive.length > 0) {
    diagnostics.push(
      "This block contains a credential- or session-related field. Treat copied output as sensitive even though parsing is local."
    );
  }

  if (fields.length === 0) {
    diagnostics.push("No valid HTTP field lines were parsed.");
  }

  const uniqueFieldNames = Object.keys(grouped).length;
  const repeatedFieldNames = Object.keys(grouped).filter(
    (name) => grouped[name].count > 1
  ).length;

  return {
    startLine,
    fieldCount: fields.length,
    uniqueFieldNames,
    repeatedFieldNames,
    bodyLinesIgnored: ignoredAfterHeader,
    fields,
    grouped,
    diagnostics,
    note:
      "The ordered fields array preserves source order. Grouped names are case-insensitive for ordinary fields. Repeated-field combination is definition-dependent, and pseudo-headers are protocol metadata rather than ordinary HTTP/1.x header fields.",
  };
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const lineCount = useMemo(
    () =>
      input
        ? input.replace(/\r\n?/g, "\n").split("\n").length
        : 0,
    [input]
  );

  const parseHeaders = () => {
    if (!input.trim()) {
      setError("Enter an HTTP request or response header block.");
      setOutput("");
      setCopied(false);
      return;
    }

    const result = parseHeadersBlock(input);

    setOutput(JSON.stringify(result, null, 2));
    setError("");
    setCopied(false);
  };

  const loadExample = () => {
    setInput(
      "HTTP/1.1 302 Found\nContent-Type: text/html; charset=utf-8\nLocation: https://example.com/welcome?name=Sneha\nCache-Control: no-store\nSet-Cookie: session=abc123; Path=/; Secure; HttpOnly\nSet-Cookie: theme=dark; Path=/"
    );
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setCopied(false);
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setError(
        "The parsed output could not be copied. Select and copy it manually."
      );
    }
  };

  return (
    <ToolShell
      title="HTTP Headers Parser"
      description="Paste raw HTTP request or response headers to turn them into ordered structured data, keep repeated fields visible, and surface malformed lines or framing patterns that deserve attention."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <label className="block text-sm font-semibold text-gray-900">
              HTTP Header Block
            </label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              You can paste headers from browser developer tools, an API
              client, a proxy, a server log, or a raw HTTP/1.x message.
            </p>
          </div>
          <p className="text-xs text-gray-500">
            {lineCount.toLocaleString()} line
            {lineCount === 1 ? "" : "s"}
          </p>
        </div>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setOutput("");
            setError("");
            setCopied(false);
          }}
          placeholder={`HTTP/1.1 200 OK\nContent-Type: application/json\nCache-Control: no-store\nSet-Cookie: session=abc123; Path=/; HttpOnly`}
          spellCheck={false}
          className="mt-4 w-full min-h-[320px] rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={parseHeaders}
          className="yoryantra-btn"
        >
          Parse Headers
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

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Parsed Header Data
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              The ordered field list is the safest view when duplicates matter.
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

        <pre className="mt-4 yoryantra-output min-h-[280px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output ||
            "Ordered fields, grouped values, start-line details, and diagnostics will appear here."}
        </pre>
      </div>

      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Raw headers can contain credentials
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          Authorization tokens, API keys, Cookie, and Set-Cookie values can
          grant access to accounts or services. Parsing happens on the pasted
          text in your browser and this tool does not send the header block to
          a parsing API, but copied output remains sensitive. Site-wide
          analytics or advertising scripts, if enabled, are separate from this
          parsing operation.
        </p>
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What HTTP Headers Are
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            HTTP headers are labeled pieces of information attached to a web
            request or response. They tell the other side things that are not
            normally part of the page or API body itself—what format is being
            sent, whether a response can be cached, where a redirect points,
            which credentials are presented, or which cookies should be stored.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            For example, <code>Content-Type: application/json</code> tells the
            receiver how to interpret the message content, while{" "}
            <code>Location</code> commonly identifies the destination of a
            redirect response. You do not need to know the entire HTTP
            specification to use the parser: paste the block and inspect the
            names and values first, then use the deeper diagnostics when you
            are troubleshooting protocol behavior.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Request Headers and Response Headers Answer Different Questions
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Request fields describe what the client is asking for or sending:
            examples include <code>Accept</code>, <code>Authorization</code>,{" "}
            <code>Cookie</code>, and <code>Content-Type</code>. Response fields
            describe the server's reply: examples include{" "}
            <code>Cache-Control</code>, <code>Location</code>,{" "}
            <code>Set-Cookie</code>, and response{" "}
            <code>Content-Type</code>. Some field names can appear in more than
            one context, so the surrounding request/response matters.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Repeated Headers Cannot Always Be Turned Into One Value
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A common programming mistake is to parse headers into a simple
            object and let the last occurrence overwrite earlier ones. That
            loses information. Even joining duplicates with commas is not a
            universal solution because combination rules depend on the field.
            <code>Set-Cookie</code> is the important everyday example: several
            cookies are normally sent as separate Set-Cookie field lines.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The output therefore provides both an ordered <code>fields</code>{" "}
            array and a grouped view. Use the ordered array when exact
            repetition and ordering matter.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Blank Lines Separate Headers From the Message Body
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            In a raw HTTP/1.x message, the empty line after the field section
            marks the boundary before message content. If you paste a response
            body below that blank line, the parser reports how many non-empty
            lines followed it and does not reinterpret those body lines as
            headers.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Advanced Checks: Pseudo-Headers, obs-fold, and Message Framing
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            HTTP/2 and HTTP/3 use pseudo-header fields such as{" "}
            <code>:method</code>, <code>:path</code>, and{" "}
            <code>:status</code> instead of the textual request/status lines
            used by HTTP/1.x. When a capture contains pseudo-headers, this tool
            checks their ordering, duplicate names, request/response mixing,
            and lowercase regular field names.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Indented continuation lines are reported as obsolete line folding
            and unfolded only for inspection. The parser also warns about
            conflicting <code>Content-Length</code> values and the simultaneous
            presence of <code>Content-Length</code> and{" "}
            <code>Transfer-Encoding</code>, because HTTP/1.x message framing is
            security-sensitive and inconsistent parsing between intermediaries
            can contribute to request-smuggling vulnerabilities.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Parser Scope and Limitations
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            This is a structural text inspector. It does not make a network
            request, verify TLS, decode HPACK or QPACK, parse a binary HTTP/2 or
            HTTP/3 frame, or validate every field-specific grammar. For
            example, understanding a complex <code>Cache-Control</code>, CSP,
            CORS, signature, or authentication field can require a dedicated
            parser for that field.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            HTTP References That Matter for This Parser
          </h2>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <a
              href="https://www.rfc-editor.org/rfc/rfc9110"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              RFC 9110 — HTTP Semantics
            </a>
            <a
              href="https://www.rfc-editor.org/rfc/rfc9112"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              RFC 9112 — HTTP/1.1 Message Syntax and Routing
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <YoryantraRelatedTools currentHref="/tools/http-headers-parser" />
        </div>
      </section>
    </ToolShell>
  );
}
