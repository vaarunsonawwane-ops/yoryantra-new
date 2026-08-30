"use client";

import { useState, type ChangeEvent } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type ParsedField = {
  index: number;
  name: string;
  normalizedName: string;
  value: string;
  pseudo: boolean;
  obsFold: boolean;
};

const tokenNamePattern = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;

function parseFieldLine(line: string, index: number): { field?: ParsedField; diagnostic?: string } {
  if (line[0] === ":") {
    const separator = line.indexOf(":", 1);
    if (separator === -1) return { diagnostic: `Line ${index}: pseudo-header has no value separator.` };
    const name = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    return {
      field: { index, name, normalizedName: name.toLowerCase(), value, pseudo: true, obsFold: false },
    };
  }

  const separator = line.indexOf(":");
  if (separator === -1) return { diagnostic: `Line ${index}: no colon separator was found.` };

  const rawName = line.slice(0, separator);
  const name = rawName.trim();
  const value = line.slice(separator + 1).replace(/^[ \t]+|[ \t]+$/g, "");

  if (!name) return { diagnostic: `Line ${index}: field name is empty.` };
  if (!tokenNamePattern.test(name)) return { diagnostic: `Line ${index}: "${name}" contains characters that are not valid in an HTTP field name.` };

  const field = { index, name, normalizedName: name.toLowerCase(), value, pseudo: false, obsFold: false };
  if (rawName !== name) {
    return { field, diagnostic: `Line ${index}: whitespace before the colon is invalid in an HTTP field line; the field is preserved for inspection.` };
  }
  return { field };
}

function parseHeadersBlock(input: string) {
  const sourceLines = input.replace(/\r\n?/g, "\n").split("\n");
  const diagnostics: string[] = [];
  const fields: ParsedField[] = [];
  let startLine: string | null = null;
  let startLineKind: "request" | "response" | null = null;

  let firstMeaningful = -1;
  for (let i = 0; i < sourceLines.length; i += 1) {
    if (sourceLines[i].trim()) {
      firstMeaningful = i;
      break;
    }
  }

  if (firstMeaningful !== -1) {
    const candidate = sourceLines[firstMeaningful].trim();
    if (/^HTTP\/\d(?:\.\d)?\s+\d{3}(?:\s|$)/i.test(candidate)) {
      startLine = candidate;
      startLineKind = "response";
      sourceLines[firstMeaningful] = "";
    } else if (/^[A-Z!#$%&'*+.^_`|~-]+\s+\S+\s+HTTP\/\d(?:\.\d)?$/i.test(candidate)) {
      startLine = candidate;
      startLineKind = "request";
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
      if (headerStarted && !headerEnded) headerEnded = true;
      return;
    }

    if (headerEnded) {
      ignoredAfterHeader += 1;
      return;
    }

    headerStarted = true;
    if (/^[ \t]/.test(line)) {
      if (!fields.length) {
        diagnostics.push(`Line ${lineNumber}: an indented continuation line appears before any field.`);
        return;
      }
      const continuation = line.trim();
      fields[fields.length - 1].value += ` ${continuation}`;
      fields[fields.length - 1].obsFold = true;
      diagnostics.push(`Line ${lineNumber}: obsolete line folding was unfolded with a single space for inspection.`);
      return;
    }

    const parsed = parseFieldLine(line, lineNumber);
    if (parsed.diagnostic) diagnostics.push(parsed.diagnostic);
    if (parsed.field) fields.push(parsed.field);
  });

  if (ignoredAfterHeader) diagnostics.push(`${ignoredAfterHeader} non-empty line(s) after the first blank line were treated as message body/trailing text and ignored.`);

  const grouped: Record<string, { originalNames: string[]; values: string[]; count: number; combination: string }> = {};
  fields.forEach((field) => {
    if (!grouped[field.normalizedName]) {
      grouped[field.normalizedName] = { originalNames: [], values: [], count: 0, combination: "single" };
    }
    const group = grouped[field.normalizedName];
    if (group.originalNames.indexOf(field.name) === -1) group.originalNames.push(field.name);
    group.values.push(field.value);
    group.count += 1;
  });

  Object.keys(grouped).forEach((name) => {
    const group = grouped[name];
    if (group.count <= 1) return;
    if (name === "set-cookie") {
      group.combination = "keep-separate";
      diagnostics.push(`Set-Cookie appears ${group.count} times. Those field lines are intentionally preserved separately and must not be comma-combined.`);
    } else if (name === "cookie") {
      group.combination = "special-cookie-semantics";
      diagnostics.push(`Cookie appears ${group.count} times. HTTP/2 and HTTP/3 have special rules for combining Cookie field lines; preserve order when debugging.`);
    } else {
      group.combination = "definition-dependent";
      diagnostics.push(`Field "${name}" appears ${group.count} times. Whether repeated lines may be comma-combined depends on that field's definition.`);
    }
  });

  const pseudoPositions = fields.filter((field) => field.pseudo).map((field) => field.index);
  const regularPositions = fields.filter((field) => !field.pseudo).map((field) => field.index);
  if (pseudoPositions.length && regularPositions.length) {
    const lastPseudo = Math.max.apply(null, pseudoPositions);
    const firstRegular = Math.min.apply(null, regularPositions);
    if (lastPseudo > firstRegular) diagnostics.push("A pseudo-header appears after a regular field. HTTP/2 and HTTP/3 require pseudo-fields to precede regular fields.");
  }

  const sensitive = fields.filter((field) => /^(authorization|proxy-authorization|cookie|set-cookie)$/i.test(field.name));
  if (sensitive.length) diagnostics.push("This block contains authentication or cookie fields. Treat copied output as sensitive data.");

  if (!fields.length) diagnostics.push("No valid HTTP field lines were parsed.");

  return {
    startLine: startLine ? { kind: startLineKind, value: startLine } : null,
    fieldCount: fields.length,
    fields,
    grouped,
    diagnostics,
    note: "Grouped names are case-insensitive. The ordered fields array is the source-preserving view; repeated-field combination is definition-dependent and Set-Cookie is a special case.",
  };
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const parseHeaders = () => {
    if (!input.trim()) {
      setError("Enter HTTP request or response headers.");
      setOutput("");
      return;
    }
    setOutput(JSON.stringify(parseHeadersBlock(input), null, 2));
    setError("");
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="HTTP Headers Parser"
      description="Parse raw HTTP header blocks while preserving repeated field lines, original order, start lines, and malformed-line diagnostics."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">HTTP header block</label>
        <textarea
          value={input}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)}
          placeholder={`HTTP/1.1 200 OK\nContent-Type: application/json\nSet-Cookie: session=a; Path=/; HttpOnly\nSet-Cookie: theme=dark; Path=/`}
          className="w-full min-h-[260px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={parseHeaders} className="yoryantra-btn">Parse Headers</button>
        <button onClick={resetAll} className="yoryantra-btn-outline">Reset</button>
      </div>

      {error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Parsed Header Data</h3>
          {output && <button onClick={() => navigator.clipboard.writeText(output)} className="yoryantra-btn-outline text-sm">Copy</button>}
        </div>
        <pre className="yoryantra-output min-h-[260px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {output || "Ordered fields, grouped values, and diagnostics will appear here."}
        </pre>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Repeated HTTP fields are not ordinary object keys</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A raw HTTP field section can contain more than one field line with the same case-insensitive name. Flattening those lines into a JavaScript object silently loses information. This parser keeps an ordered field array and also builds a grouped view where every value remains available.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Do not assume every repeated field can be joined with commas. HTTP only permits that when the field's definition uses list semantics. <code>Set-Cookie</code> is the well-known exception that commonly appears on multiple lines and cannot be safely comma-combined.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Start lines, pseudo-fields, and old folding</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            If present, an HTTP/1.x request line or status line is reported separately from the fields. Text copied from HTTP/2 or HTTP/3 tooling can also contain pseudo-fields such as <code>:method</code> or <code>:status</code>; those are marked as pseudo-fields rather than treated as ordinary header names. Indented continuation lines are flagged as obsolete folding and unfolded only for inspection.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Parser scope</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This tool inspects pasted text. It does not make an HTTP request, validate field-specific grammar such as Cache-Control directives, or decide whether an entire network message is acceptable to a particular server or browser. Field-specific semantics still belong to the specification for that field.
          </p>
        </div>

        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <h3 className="text-sm font-semibold text-yellow-900">Credentials can be present in headers</h3>
          <p className="mt-2 text-sm leading-relaxed text-yellow-800">
            Authorization, Proxy-Authorization, Cookie, and Set-Cookie values can contain live credentials or sessions. Parsing is local to this browser, but copied output remains sensitive.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reference</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            <a href="https://www.rfc-editor.org/rfc/rfc9110" target="_blank" rel="noreferrer" className="underline underline-offset-2">RFC 9110</a> defines HTTP field lines, case-insensitive field names, repeated-field handling, field order, and the Set-Cookie exception.
          </p>
        </div>
      </section>

      <YoryantraRelatedTools currentHref="/tools/http-headers-parser" />
    </ToolShell>
  );
}
