"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type JsonResult = {
  output: string;
  originalBytes: number;
  minifiedBytes: number;
  savedBytes: number;
  savedPercent: string;
  rootType: string;
  duplicateKeys: string[];
  unsafeIntegers: string[];
};

const sampleJson = `{
  "api": "https://example.com/v1",
  "retry": 3,
  "features": ["parse", "validate"],
  "enabled": true
}`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<JsonResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const clearResult = () => {
    setResult(null);
    setError("");
    setCopied(false);
  };

  const minifyJSON = () => {
    if (!input.trim()) {
      setResult(null);
      setError("Paste JSON before minifying.");
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const output = minifyJsonTokens(input);
      const diagnostics = inspectJsonSource(input);
      const originalBytes = getUtf8Bytes(input);
      const minifiedBytes = getUtf8Bytes(output);
      const savedBytes = Math.max(originalBytes - minifiedBytes, 0);
      const savedPercent = originalBytes
        ? ((savedBytes / originalBytes) * 100).toFixed(1)
        : "0.0";

      setResult({
        output,
        originalBytes,
        minifiedBytes,
        savedBytes,
        savedPercent,
        rootType: detectRootType(parsed),
        duplicateKeys: diagnostics.duplicateKeys,
        unsafeIntegers: diagnostics.unsafeIntegers,
      });
      setError("");
      setCopied(false);
    } catch (caught) {
      setResult(null);
      setError(formatJsonError(caught, input));
    }
  };

  const copyOutput = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.output);
    setCopied(true);
  };

  const resetAll = () => {
    setInput("");
    clearResult();
  };

  return (
    <ToolShell
      title="JSON Minifier"
      description="Remove insignificant JSON whitespace without rebuilding the parsed value, preserving original number spellings, key order, and duplicate-key text."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">JSON Input</label>
        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            clearResult();
          }}
          placeholder="Paste formatted JSON here..."
          className="w-full min-h-[280px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={minifyJSON} className="yoryantra-btn">Minify JSON</button>
        <button
          type="button"
          onClick={() => {
            setInput(sampleJson);
            clearResult();
          }}
          className="yoryantra-btn-outline"
        >
          Load Example
        </button>
        <button type="button" onClick={resetAll} className="yoryantra-btn-outline">Reset</button>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700 whitespace-pre-wrap">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Original" value={`${result.originalBytes.toLocaleString()} bytes`} />
            <Stat label="Minified" value={`${result.minifiedBytes.toLocaleString()} bytes`} />
            <Stat label="Saved" value={`${result.savedBytes.toLocaleString()} bytes (${result.savedPercent}%)`} />
            <Stat label="Root" value={result.rootType} />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Minified JSON</h3>
            <button type="button" onClick={copyOutput} className="yoryantra-btn-outline text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <pre className="yoryantra-output mt-3 min-h-[180px] overflow-auto whitespace-pre-wrap break-all text-sm font-mono">
            {result.output}
          </pre>

          {result.duplicateKeys.length ? (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
              <strong>Duplicate member names remain in the minified text:</strong>{" "}
              {result.duplicateKeys.slice(0, 8).join(", ")}
              {result.duplicateKeys.length > 8 ? " …" : ""}. Many JSON consumers keep only the last duplicate value, so review these before sending the payload.
            </div>
          ) : null}

          {result.unsafeIntegers.length ? (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
              <strong>Large integer literals preserved:</strong>{" "}
              {result.unsafeIntegers.slice(0, 6).join(", ")}
              {result.unsafeIntegers.length > 6 ? " …" : ""}. They exceed JavaScript&apos;s exact safe-integer range, so applications that parse them as Number may lose precision.
            </div>
          ) : null}
        </div>
      ) : null}

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">What this minifier removes</h2>
          <div className="mt-4 space-y-4 text-gray-600 leading-relaxed">
            <p>
              JSON permits insignificant whitespace around structural tokens. This tool validates the document, then removes only that outside-string whitespace. Spaces, tabs, and line breaks that are part of a JSON string are left untouched.
            </p>
            <p>
              The output is not compressed in the gzip or Brotli sense. It is simply a smaller textual JSON representation. HTTP compression can reduce transfer size further when a server or CDN enables it.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Why the tool does not parse and stringify the result</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            A parse-and-stringify minifier can silently collapse duplicate member names and can reserialize number tokens after JavaScript has converted them to Number values. Token-level minification keeps the original JSON token spelling while still rejecting invalid syntax first.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-relaxed text-gray-700">
          <strong>Local processing:</strong> pasted JSON stays in the browser; no payload is sent to a remote service.
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reference</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            See <a className="underline" href="https://www.rfc-editor.org/rfc/rfc8259" target="_blank" rel="noreferrer">RFC 8259</a> for JSON grammar and interoperability guidance.
          </p>
        </div>

        <YoryantraRelatedTools currentHref="/tools/json-minifier" />
      </section>
    </ToolShell>
  );
}

function minifyJsonTokens(source: string) {
  let output = "";
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
    } else if (!/\s/.test(char)) {
      output += char;
    }
  }

  return output;
}

function inspectJsonSource(source: string) {
  const duplicateKeys: string[] = [];
  const unsafeIntegers: string[] = [];
  const stack: Array<{ type: "object" | "array"; keys?: Set<string> }> = [];
  let index = 0;

  while (index < source.length) {
    const char = source[index];

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    if (char === "{") {
      stack.push({ type: "object", keys: new Set<string>() });
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
      while (cursor < source.length && /\s/.test(source[cursor])) cursor += 1;
      const current = stack[stack.length - 1];

      if (source[cursor] === ":" && current?.type === "object" && current.keys) {
        try {
          const key = JSON.parse(raw) as string;
          if (current.keys.has(key)) duplicateKeys.push(key);
          else current.keys.add(key);
        } catch {
          // The full JSON parse already validates the token.
        }
      }

      index = end + 1;
      continue;
    }

    if (char === "-" || /[0-9]/.test(char)) {
      const match = source.slice(index).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);
      if (match) {
        const token = match[0];
        if (/^-?\d+$/.test(token)) {
          try {
            const numeric = BigInt(token);
            const absolute = numeric < BigInt(0) ? -numeric : numeric;
            if (absolute > BigInt(Number.MAX_SAFE_INTEGER)) unsafeIntegers.push(token);
          } catch {
            // Ignore; syntax has already been checked.
          }
        }
        index += token.length;
        continue;
      }
    }

    index += 1;
  }

  return { duplicateKeys, unsafeIntegers };
}

function findJsonStringEnd(source: string, start: number) {
  let escaped = false;
  for (let index = start + 1; index < source.length; index += 1) {
    const char = source[index];
    if (escaped) escaped = false;
    else if (char === "\\") escaped = true;
    else if (char === '"') return index;
  }
  return source.length - 1;
}

function formatJsonError(caught: unknown, source: string) {
  const message = caught instanceof Error ? caught.message : "Invalid JSON input.";
  const positionMatch = message.match(/position\s+(\d+)/i);
  if (!positionMatch) return `Invalid JSON. ${message}`;

  const position = Number(positionMatch[1]);
  const before = source.slice(0, position);
  const line = before.split(/\r?\n/).length;
  const lastBreak = Math.max(before.lastIndexOf("\n"), before.lastIndexOf("\r"));
  const column = position - lastBreak;
  const excerpt = source.split(/\r?\n/)[line - 1] ?? "";
  const caret = " ".repeat(Math.max(column - 1, 0)) + "^";
  return `Invalid JSON near line ${line}, column ${column}.\n${excerpt}\n${caret}\n${message}`;
}

function detectRootType(value: unknown) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function getUtf8Bytes(value: string) {
  return new TextEncoder().encode(value).length;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-gray-900 break-words">{value}</div>
    </div>
  );
}
