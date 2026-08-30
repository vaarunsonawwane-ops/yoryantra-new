"use client";

import { useState, type ChangeEvent } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type InputMode = "auto" | "url" | "query";

type QueryEntry = {
  index: number;
  rawName: string;
  rawValue: string;
  hadEquals: boolean;
  name: string | null;
  value: string | null;
  decodeError: string | null;
};

function decodeFormComponent(value: string): { value: string | null; error: string | null } {
  const plusExpanded = value.replace(/\+/g, " ");
  const malformed = /%(?![0-9A-Fa-f]{2})/.test(plusExpanded);
  if (malformed) {
    return { value: null, error: "Malformed percent escape; raw text is preserved." };
  }
  try {
    return { value: decodeURIComponent(plusExpanded), error: null };
  } catch {
    return { value: null, error: "Percent-encoded bytes are not valid UTF-8 for decodeURIComponent()." };
  }
}

function looksLikeUrl(value: string): boolean {
  if (/^[A-Za-z][A-Za-z0-9+.-]*:/.test(value) || /^\/\//.test(value) || /^\//.test(value)) return true;
  const question = value.indexOf("?");
  if (question > 0) {
    const beforeQuery = value.slice(0, question);
    if (beforeQuery.indexOf("=") === -1 && beforeQuery.indexOf("&") === -1) return true;
  }
  return false;
}

function extractQuery(input: string, mode: InputMode) {
  const trimmed = input.trim();
  const diagnostics: string[] = [];
  let query = "";
  let sourceKind = "raw query string";
  let fragment: string | null = null;

  const useUrl = mode === "url" || (mode === "auto" && looksLikeUrl(trimmed));

  if (useUrl) {
    try {
      const parsed = new URL(trimmed, "https://yoryantra.invalid");
      query = parsed.search.length ? parsed.search.slice(1) : "";
      fragment = parsed.hash.length ? parsed.hash.slice(1) : null;
      sourceKind = mode === "url" ? "URL" : "URL detected automatically";
      if (!parsed.search.length) diagnostics.push("The URL has no query component.");
    } catch {
      diagnostics.push("The input could not be parsed as a URL, so it was not reinterpreted as a raw query string.");
      return { query: "", sourceKind: "invalid URL", fragment: null, diagnostics, fatal: true };
    }
  } else {
    query = trimmed[0] === "?" ? trimmed.slice(1) : trimmed;
    sourceKind = mode === "query" ? "raw query string" : "raw query string detected automatically";
    if (query[0] === "#") diagnostics.push("The raw query begins with #. In URL mode that would start a fragment, but raw-query mode treats it as data.");
  }

  return { query, sourceKind, fragment, diagnostics, fatal: false };
}

function parseQuery(input: string, mode: InputMode) {
  const extracted = extractQuery(input, mode);
  const diagnostics = extracted.diagnostics.slice();
  const entries: QueryEntry[] = [];
  const grouped: Record<string, { values: Array<string | null>; indexes: number[] }> = {};

  if (extracted.fatal) {
    return { source: extracted.sourceKind, rawQuery: "", fragment: null, entryCount: 0, entries, grouped, diagnostics };
  }

  if (!extracted.query) {
    return { source: extracted.sourceKind, rawQuery: extracted.query, fragment: extracted.fragment, entryCount: 0, entries, grouped, diagnostics };
  }

  extracted.query.split("&").forEach((part, zeroIndex) => {
    if (part === "") return;
    const equals = part.indexOf("=");
    const hadEquals = equals !== -1;
    const rawName = hadEquals ? part.slice(0, equals) : part;
    const rawValue = hadEquals ? part.slice(equals + 1) : "";
    const decodedName = decodeFormComponent(rawName);
    const decodedValue = decodeFormComponent(rawValue);
    const errors: string[] = [];
    if (decodedName.error) errors.push(`name: ${decodedName.error}`);
    if (decodedValue.error) errors.push(`value: ${decodedValue.error}`);

    const entry: QueryEntry = {
      index: zeroIndex + 1,
      rawName,
      rawValue,
      hadEquals,
      name: decodedName.value,
      value: decodedValue.value,
      decodeError: errors.length ? errors.join(" ") : null,
    };
    entries.push(entry);

    if (entry.name !== null) {
      if (!grouped[entry.name]) grouped[entry.name] = { values: [], indexes: [] };
      grouped[entry.name].values.push(entry.value);
      grouped[entry.name].indexes.push(entry.index);
    }
  });

  Object.keys(grouped).forEach((name) => {
    if (grouped[name].values.length > 1) {
      diagnostics.push(`Parameter "${name}" appears ${grouped[name].values.length} times. All values are preserved in order.`);
    }
  });

  if (entries.some((entry) => entry.rawName === "")) diagnostics.push("At least one parameter has an empty name; it is preserved rather than discarded.");
  if (entries.some((entry) => !entry.hadEquals)) diagnostics.push("At least one parameter has no = separator. It is distinct in the raw form from an explicit empty value such as name=.");
  if (entries.some((entry) => entry.rawName.indexOf("+") !== -1 || entry.rawValue.indexOf("+") !== -1)) {
    diagnostics.push("A plus sign was decoded as a space because URLSearchParams-style query parsing uses application/x-www-form-urlencoded rules.");
  }
  if (entries.some((entry) => entry.decodeError)) diagnostics.push("Some components could not be decoded cleanly. Their raw forms remain available in each entry.");

  return {
    source: extracted.sourceKind,
    rawQuery: extracted.query,
    fragment: extracted.fragment,
    entryCount: entries.length,
    entries,
    grouped,
    diagnostics,
    note: "The ordered entries array preserves repeated parameters and raw encoding. Grouped values are arrays so later occurrences never overwrite earlier ones.",
  };
}

export default function ToolClient() {
  const [mode, setMode] = useState<InputMode>("auto");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const parseQueryParams = () => {
    if (!input.trim()) {
      setError("Enter a full URL or query string.");
      setOutput("");
      return;
    }
    setOutput(JSON.stringify(parseQuery(input, mode), null, 2));
    setError("");
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="URL Query Params Parser"
      description="Inspect full URLs or raw query strings while preserving repeated keys, parameter order, blank values, and raw percent encoding."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Input type</label>
        <select
          value={mode}
          onChange={(event: ChangeEvent<HTMLSelectElement>) => {
            setMode(event.target.value as InputMode);
            setOutput("");
            setError("");
          }}
          className="w-full rounded-xl border border-gray-300 bg-white p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        >
          <option value="auto">Auto-detect URL vs raw query</option>
          <option value="url">Full or relative URL</option>
          <option value="query">Raw query string</option>
        </select>
      </div>

      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">URL or query string</label>
        <textarea
          value={input}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)}
          placeholder="https://example.com/search?tag=api&tag=http&q=hello+world&empty=#results"
          className="w-full min-h-[240px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={parseQueryParams} className="yoryantra-btn">Parse Query Params</button>
        <button onClick={resetAll} className="yoryantra-btn-outline">Reset</button>
      </div>

      {error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Parsed Query Data</h3>
          {output && <button onClick={() => navigator.clipboard.writeText(output)} className="yoryantra-btn-outline text-sm">Copy</button>}
        </div>
        <pre className="yoryantra-output min-h-[260px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {output || "Ordered parameters, grouped values, and decoding diagnostics will appear here."}
        </pre>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Repeated query keys are valid data</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Query strings are ordered name-value tuples, not a JavaScript object with one slot per name. A URL such as <code>?tag=api&amp;tag=http</code> contains two values for <code>tag</code>. This parser preserves both entries and their order, then provides a grouped view where each key maps to an array of values.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Raw encoding and decoded values are both useful</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Query parsing on the web commonly follows <code>application/x-www-form-urlencoded</code> rules: <code>+</code> becomes a space and percent-encoded bytes are decoded as UTF-8. The tool keeps <code>rawName</code> and <code>rawValue</code> beside the decoded form so you can see whether a space came from <code>+</code>, <code>%20</code>, or literal text. Malformed escapes are reported instead of silently erasing the raw input.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">URL mode versus raw-query mode</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Full URLs and raw query strings are not the same input grammar. URL mode uses the browser URL parser and keeps the fragment separate. Raw-query mode treats the supplied text as query data directly. Auto mode chooses URL parsing for values that look like absolute, protocol-relative, or path-relative URLs; otherwise it uses raw-query mode.
          </p>
        </div>

        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <h3 className="text-sm font-semibold text-yellow-900">Tokens in URLs can be sensitive</h3>
          <p className="mt-2 text-sm leading-relaxed text-yellow-800">
            OAuth codes, password-reset tokens, signed links, and API credentials sometimes appear in query strings. Parsing happens locally in this browser, but copied output can still expose those values.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reference</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The <a href="https://url.spec.whatwg.org/" target="_blank" rel="noreferrer" className="underline underline-offset-2">WHATWG URL Standard</a> defines URL parsing, URLSearchParams, and the application/x-www-form-urlencoded parser in which plus signs become spaces and tuple order is preserved.
          </p>
        </div>
      </section>

      <YoryantraRelatedTools currentHref="/tools/url-query-params-parser" />
    </ToolShell>
  );
}
