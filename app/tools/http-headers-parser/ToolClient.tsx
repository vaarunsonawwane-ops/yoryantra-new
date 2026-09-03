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

function classifyStartLine(candidate: string) {
  if (/^HTTP\/\d(?:\.\d)?\s+\d{3}(?:\s+.*)?$/.test(candidate)) {
    return { kind: "response" as const, value: candidate };
  }

  if (
    /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+\s+\S+\s+HTTP\/\d(?:\.\d)?$/.test(
      candidate
    )
  ) {
    return { kind: "request" as const, value: candidate };
  }

  return null;
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
        `Line ${lineNumber}: "${name}" is not one of the standard pseudo-header names recognized in this inspection.`
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
      diagnostics: [`Line ${lineNumber}: no colon separator was found.`],
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

function addRepeatedDiagnostics(
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
        `Cookie appears ${group.count} times. Preserve order and protocol context while debugging HTTP/2 or HTTP/3 captures.`
      );
      return;
    }

    group.combination = "field-definition-dependent";
    diagnostics.push(
      `Field "${name}" appears ${group.count} times. Whether repeated values can be combined depends on that field's definition.`
    );
  });
}

function addFramingDiagnostics(
  grouped: Record<string, FieldGroup>,
  diagnostics: string[]
) {
  const contentLength = grouped["content-length"];
  const transferEncoding = grouped["transfer-encoding"];

  if (contentLength && transferEncoding) {
    diagnostics.push(
      "Both Content-Length and Transfer-Encoding are present. In HTTP/1.x this is a message-framing and security-sensitive combination that deserves manual review."
    );
  }

  if (!contentLength) return;

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
      "Content-Length contains conflicting values. Conflicting message lengths are invalid and relevant to HTTP request-smuggling defenses."
    );
  } else if (values.length > 1) {
    diagnostics.push(
      "Content-Length is repeated with the same numeric value. Duplicates still deserve review when inspecting raw HTTP/1.x framing."
    );
  }
}

function addPseudoDiagnostics(
  fields: ParsedField[],
  grouped: Record<string, FieldGroup>,
  diagnostics: string[]
) {
  const pseudoFields = fields.filter((field) => field.pseudo);
  const regularFields = fields.filter((field) => !field.pseudo);

  if (!pseudoFields.length) return;

  if (regularFields.length) {
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
        "A pseudo-header appears after a regular field. HTTP/2 and HTTP/3 require pseudo-header fields before regular fields."
      );
    }
  }

  const counts = Object.create(null) as Record<string, number>;

  pseudoFields.forEach((field) => {
    counts[field.name] = (counts[field.name] || 0) + 1;
  });

  Object.keys(counts).forEach((name) => {
    if (counts[name] > 1) {
      diagnostics.push(
        `Pseudo-header "${name}" appears ${counts[name]} times. HTTP/2 and HTTP/3 do not allow repeated pseudo-header names in one field section.`
      );
    }
  });

  const hasPseudo = (name: string) =>
    pseudoFields.some((field) => field.name === name);
  const pseudoValue = (name: string) => {
    const found = pseudoFields.find((field) => field.name === name);
    return found ? found.value : "";
  };

  const hasStatus = hasPseudo(":status");
  const method = pseudoValue(":method");
  const scheme = pseudoValue(":scheme");
  const authority = pseudoValue(":authority");
  const path = pseudoValue(":path");
  const protocol = pseudoValue(":protocol");
  const hasRequestPseudo = [
    ":method",
    ":scheme",
    ":authority",
    ":path",
    ":protocol",
  ].some(hasPseudo);

  if (hasStatus && hasRequestPseudo) {
    diagnostics.push(
      "The block mixes :status with request pseudo-headers. A normal HTTP/2 or HTTP/3 field section is request-oriented or response-oriented, not both."
    );
  }

  if (hasStatus) {
    const status = pseudoValue(":status");
    if (!/^\d{3}$/.test(status)) {
      diagnostics.push(
        ':status should contain exactly three decimal digits in an HTTP/2 or HTTP/3 response field section.'
      );
    } else {
      const statusCode = Number(status);
      if (statusCode < 100 || statusCode > 599) {
        diagnostics.push(
          `:status is ${status}; ordinary HTTP status codes are in the 100-599 range.`
        );
      }
    }
  }

  if (hasRequestPseudo && !hasPseudo(":method")) {
    diagnostics.push("A request-style pseudo-header block is missing :method.");
  } else if (hasPseudo(":method") && method === "") {
    diagnostics.push(":method is present but empty.");
  }

  if (hasPseudo(":protocol") && method !== "CONNECT") {
    diagnostics.push(
      ":protocol is defined for Extended CONNECT rather than an ordinary request method."
    );
  }

  if (method) {
    const extendedConnect = method === "CONNECT" && hasPseudo(":protocol");

    if (method === "CONNECT" && !extendedConnect) {
      if (!hasPseudo(":authority") || !authority) {
        diagnostics.push("A CONNECT request needs a non-empty :authority.");
      }
      if (hasPseudo(":scheme") || hasPseudo(":path")) {
        diagnostics.push(
          "An ordinary CONNECT request omits :scheme and :path. Extended CONNECT has different requirements."
        );
      }
    } else {
      if (!hasPseudo(":scheme")) {
        diagnostics.push("A non-CONNECT request-style block is missing :scheme.");
      } else if (!scheme) {
        diagnostics.push(":scheme is present but empty.");
      }
      if (!hasPseudo(":path")) {
        diagnostics.push("A non-CONNECT request-style block is missing :path.");
      } else if (!path) {
        diagnostics.push(":path is present but empty.");
      }
      if (extendedConnect && (!hasPseudo(":authority") || !authority)) {
        diagnostics.push("Extended CONNECT needs a non-empty :authority.");
      }
      if (extendedConnect && !protocol) {
        diagnostics.push(":protocol is present but empty on an Extended CONNECT request.");
      }
      if (extendedConnect) {
        diagnostics.push(
          "Extended CONNECT also requires protocol support to have been negotiated with the peer; pasted field text cannot prove that negotiation happened."
        );
      }
      if ((scheme === "http" || scheme === "https") && !authority && !grouped["host"]) {
        diagnostics.push(`A ${scheme} request needs authority information in :authority or Host.`);
      }
    }
  }


  if (authority && grouped["host"]) {
    const host = grouped["host"].values[0] || "";
    if (host && authority.toLowerCase() !== host.toLowerCase()) {
      diagnostics.push(
        `:authority is "${authority}" while Host is "${host}". HTTP/2 and HTTP/3 require these to identify the same authority when both are present.`
      );
    }
  }

  ["connection", "proxy-connection", "keep-alive", "transfer-encoding", "upgrade"].forEach((name) => {
    if (grouped[name]) {
      diagnostics.push(
        `Field "${name}" is connection-specific and is not allowed in HTTP/2 or HTTP/3 field sections.`
      );
    }
  });

  if (grouped["te"]) {
    const invalidTe = grouped["te"].values.some(
      (value) => value.trim().toLowerCase() !== "trailers"
    );
    if (invalidTe) {
      diagnostics.push('In HTTP/2 and HTTP/3 requests, TE is only permitted with the value "trailers".');
    }
  }

  regularFields.forEach((field) => {
    if (/[A-Z]/.test(field.name)) {
      diagnostics.push(
        `Field "${field.name}" contains uppercase letters while pseudo-headers are present. HTTP/2 and HTTP/3 field names are lowercase.`
      );
    }
  });
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
      if (!fields.length) {
        diagnostics.push(
          `Line ${lineNumber}: an indented continuation line appears before any field.`
        );
        return;
      }

      const previous = fields[fields.length - 1];
      previous.value += ` ${line.trim()}`;
      previous.obsFold = true;

      diagnostics.push(
        `Line ${lineNumber}: obsolete line folding was unfolded with one space for inspection.`
      );
      return;
    }

    const parsed = parseFieldLine(line, lineNumber);

    parsed.diagnostics.forEach((item) => diagnostics.push(item));

    if (parsed.field) {
      fields.push(parsed.field);
    }
  });

  if (ignoredAfterHeader > 0) {
    diagnostics.push(
      `${ignoredAfterHeader} non-empty line${
        ignoredAfterHeader === 1 ? " was" : "s were"
      } found after the first blank line and treated as body or trailing text rather than headers.`
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

  addRepeatedDiagnostics(grouped, diagnostics);
  addFramingDiagnostics(grouped, diagnostics);
  addPseudoDiagnostics(fields, grouped, diagnostics);

  const hasPseudoHeaders = fields.some((field) => field.pseudo);

  if (
    startLine &&
    /HTTP\/(?:2(?:\.0)?|3(?:\.0)?)/.test(startLine.value)
  ) {
    diagnostics.push(
      "HTTP/2 and HTTP/3 do not carry an HTTP/1-style textual start line on the wire. Treat this as a human-readable capture produced by another program."
    );
  }

  if (
    startLine &&
    /HTTP\/1\./.test(startLine.value) &&
    hasPseudoHeaders
  ) {
    diagnostics.push(
      "Pseudo-header fields belong to HTTP/2 and HTTP/3, not an HTTP/1.x field section. The pasted block mixes two representations."
    );
  }

  if (
    startLine &&
    /HTTP\/1\.0/.test(startLine.value) &&
    grouped["transfer-encoding"]
  ) {
    diagnostics.push(
      "Transfer-Encoding is an HTTP/1.1 framing mechanism. Its presence in an HTTP/1.0 textual message deserves investigation."
    );
  }

  if (
    startLine &&
    startLine.kind === "request" &&
    /HTTP\/1\.1$/.test(startLine.value) &&
    !grouped["host"]
  ) {
    diagnostics.push(
      "This looks like an HTTP/1.1 request start line, but no Host field was parsed."
    );
  }

  if (grouped["host"] && grouped["host"].count > 1) {
    diagnostics.push(
      "Host appears more than once. Multiple Host fields are invalid in an HTTP/1.1 request and can be security-sensitive."
    );
  }

  const sensitiveNames = [
    "authorization",
    "proxy-authorization",
    "cookie",
    "set-cookie",
    "x-api-key",
    "api-key",
    "x-auth-token",
  ];

  if (
    fields.some(
      (field) =>
        sensitiveNames.indexOf(field.normalizedName) !== -1
    )
  ) {
    diagnostics.push(
      "This block contains a credential- or session-related field. Treat copied output as sensitive even though parsing is local."
    );
  }

  if (!fields.length) {
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
      "The ordered fields array preserves source order. Grouped ordinary names are case-insensitive. Repeated-field combination is definition-dependent, and pseudo-headers are protocol metadata rather than ordinary HTTP/1.x field lines.",
  };
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const lineCount = useMemo(
    () =>
      input ? input.replace(/\r\n?/g, "\n").split("\n").length : 0,
    [input]
  );

  const run = () => {
    if (!input.trim()) {
      setError("Enter an HTTP request or response header block.");
      setOutput("");
      return;
    }

    setOutput(JSON.stringify(parseHeadersBlock(input), null, 2));
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

  const reset = () => {
    setInput("");
    setOutput("");
    setError("");
    setCopied(false);
  };

  const copy = async () => {
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
      description="Paste raw HTTP request or response headers to turn them into ordered structured data, preserve repeated fields, and surface malformed lines or message-framing patterns that deserve attention."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <label className="block text-sm font-semibold text-gray-900">
              HTTP Header Block
            </label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Paste headers from browser DevTools, curl, an API client, a proxy, or a server log.
            </p>
          </div>
          <p className="text-xs text-gray-500">
            {lineCount.toLocaleString()} line{lineCount === 1 ? "" : "s"}
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
        <button type="button" onClick={run} className="yoryantra-btn">
          Parse Headers
        </button>
        <button type="button" onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>
        <button type="button" onClick={reset} className="yoryantra-btn-outline">
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
              The ordered field list is the safest view when duplicates or protocol details matter.
            </p>
          </div>
          {output ? (
            <button type="button" onClick={copy} className="yoryantra-btn-outline text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          ) : null}
        </div>

        <pre className="mt-4 yoryantra-output min-h-[280px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output ||
            "Ordered fields, grouped values, start-line details, and diagnostics will appear here."}
        </pre>
      </div>

      <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <h3 className="text-sm font-semibold text-gray-900">
          Raw headers can contain credentials
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">
          Authorization tokens, API keys, Cookie, and Set-Cookie values can grant access to accounts or services. Parsing stays in your browser and no header-parsing API receives the pasted block, but copied output remains sensitive. Site-wide analytics or advertising scripts, if enabled, are separate from this parsing operation.
        </p>
      </div>

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Turning a Raw Header Block Into a Debugging Trail
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            HTTP headers are most useful when you read them as evidence of what happened between a client, an intermediary, and a server. One line can explain why a response was cached, another why the browser redirected, another why authentication failed, and another which representation was actually returned.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Original field order and repeated values need to stay visible because that is often the information lost first when headers are converted into a simple object. A grouped view is convenient for scanning; the ordered list is safer when duplicates, cookies, proxies, or message framing are involved.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Follow the Clues in This Response
          </h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-white p-4 text-sm leading-7 text-gray-800">{`HTTP/1.1 302 Found
Location: https://example.com/welcome?name=Sneha
Cache-Control: no-store
Set-Cookie: session=abc123; Path=/; Secure; HttpOnly`}</pre>
          <p className="mt-4 leading-relaxed text-gray-600">
            The first line says this is a 302 response. Location provides the redirect target. Cache-Control asks caches not to store the response. Set-Cookie asks the browser to create or update a cookie. That small block already tells you much more than the status code alone.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            High-Value Fields to Recognize Quickly
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[
              ["Content-Type", "Tells the receiver how to interpret the message content, such as JSON, HTML, CSS, or an image."],
              ["Location", "Commonly identifies a redirect destination or a resource URI, depending on response status."],
              ["Cache-Control", "Controls how browsers and intermediaries may cache or reuse a response."],
              ["Authorization", "Carries credentials or tokens and should be treated as sensitive."],
              ["WWW-Authenticate", "Describes the authentication challenge associated with a 401 response."],
              ["Cookie / Set-Cookie", "Cookie sends stored values with a request; Set-Cookie asks the browser to store state from a response."],
            ].map(([name, description]) => (
              <div key={name} className="rounded-xl border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900">{name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Repeated Fields Cannot Always Be Flattened Safely
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            HTTP field names are case-insensitive, but repeated values do not all share one universal merge rule. Some field definitions allow a combined list. Others, especially Set-Cookie, need separate field values. Cookie also has protocol-specific handling in HTTP/2 and HTTP/3.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Reducing the block to a last-value-wins object would lose that evidence. Ordered source fields and a separate grouped view keep both representations available.{" "}
            <a href="https://www.rfc-editor.org/rfc/rfc9110" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">
              RFC 9110
            </a>{" "}
            explains when repeated field lines can be recombined and calls out Set-Cookie as a special case.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            The Blank Line Is a Real Boundary
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            In HTTP/1.x text form, an empty line separates the header field section from the message body. If a curl <code>-i</code> capture or proxy trace also contains HTML, JSON, or another body, the non-empty lines after that boundary are counted as trailing text rather than treated as more header fields. A chunked trailer section is not reconstructed from pasted body text.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Content-Length and Transfer-Encoding Deserve Extra Attention
          </h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            HTTP/1.x recipients must agree on where one message ends and the next begins. Conflicting Content-Length values, or an ambiguous combination of Content-Length and Transfer-Encoding, are security-sensitive because different intermediaries can interpret message boundaries differently.
          </p>
          <p className="mt-4 leading-relaxed text-gray-700">
            Suspicious framing text can be surfaced from a pasted field section, but request-smuggling analysis still depends on the exact bytes and the behavior of every intermediary in the path.{" "}
            <a href="https://www.rfc-editor.org/rfc/rfc9112" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">
              RFC 9112
            </a>{" "}
            defines the HTTP/1.1 message-length precedence rules behind these warnings.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why HTTP/2 and HTTP/3 Captures Look Different
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            HTTP/2 and HTTP/3 use pseudo-header fields such as <code>:method</code>, <code>:path</code>, <code>:authority</code>, and <code>:status</code> instead of the textual request/status lines used by HTTP/1.x. Pseudo-headers have stricter ordering, duplication, required-field, lowercase-name, and connection-specific-field rules. Those rules are defined in{" "}
            <a href="https://www.rfc-editor.org/rfc/rfc9113" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">
              RFC 9113 for HTTP/2
            </a>{" "}
            and{" "}
            <a href="https://www.rfc-editor.org/rfc/rfc9114" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">
              RFC 9114 for HTTP/3
            </a>. Extended CONNECT adds <code>:protocol</code> through{" "}
            <a href="https://www.rfc-editor.org/rfc/rfc8441" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">
              RFC 8441
            </a>, with HTTP/3 WebSocket use carried forward by RFC 9220.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Browser DevTools may show these fields in readable text even though the wire format is compressed. Readable field text is enough for structural inspection, but it is not an HPACK, QPACK, or binary-frame decoder.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Obsolete Line Folding Can Hide What a Field Contains
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Older HTTP syntax allowed a field value to continue on an indented next line. Modern senders should not generate that obs-fold form. When it appears, joining the continuation with one space makes the value readable while still reporting that the source used obsolete syntax.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Questions the Header Block Can Answer
          </h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 leading-relaxed text-gray-600">
            <li>Compare browser and API-client responses when only one client has a caching or authentication problem.</li>
            <li>Check whether a redirect really includes the expected Location field.</li>
            <li>Confirm that an API returned application/json rather than HTML or a generic binary type.</li>
            <li>Inspect several Set-Cookie fields without losing one to object-key overwriting.</li>
            <li>See which fields were added or changed by a CDN, reverse proxy, gateway, or origin server.</li>
            <li>Spot malformed field names, whitespace-before-colon, control characters, or suspicious HTTP/1.x framing values.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Structure Is Not the Same as Full Field Validation
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Individual fields can have complex grammars of their own. Content Security Policy, Cache-Control, CORS, signatures, authentication challenges, Structured Fields, cookies, and content negotiation each need dedicated rules for deep validation. Preserving the raw field-section structure is a different job from fully validating every registered field.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Trace the Message Beyond the Header Block
          </h2>

          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/http-headers-parser" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
