"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type JsonDiagnostics = {
  duplicateKeys: string[];
  unsafeIntegers: string[];
  nonFiniteNumbers: string[];
  highPrecisionNumbers: string[];
};

type JsonResult = {
  output: string;
  originalBytes: number;
  minifiedBytes: number;
  savedBytes: number;
  savedPercent: string;
  rootType: string;
  diagnostics: JsonDiagnostics;
};

const SAMPLE_JSON = `{
  "profile": {
    "name": "Sneha",
    "message": "spaces inside strings stay here"
  },
  "enabled": true,
  "retries": 3,
  "features": [
    "parse",
    "validate"
  ]
}`;

function minifyJsonTokens(source: string) {
  let output = "";
  let inString = false;
  let escaped = false;

  for (
    let index = 0;
    index < source.length;
    index += 1
  ) {
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

function findJsonStringEnd(
  source: string,
  start: number
) {
  let escaped = false;

  for (
    let index = start + 1;
    index < source.length;
    index += 1
  ) {
    const char = source[index];

    if (escaped) {
      escaped = false;
    } else if (char === "\\") {
      escaped = true;
    } else if (char === '"') {
      return index;
    }
  }

  return source.length - 1;
}

function integerOutsideSafeRange(token: string) {
  if (!/^-?(?:0|[1-9]\d*)$/.test(token)) {
    return false;
  }

  const digits =
    token.replace(/^-/, "").replace(/^0+/, "") || "0";
  const max = "9007199254740991";

  if (digits.length !== max.length) {
    return digits.length > max.length;
  }

  return digits > max;
}

function significantDigitCount(token: string) {
  const mantissa = token.split(/[eE]/)[0];
  const digits = mantissa
    .replace(/[-.]/g, "")
    .replace(/^0+/, "");

  return digits.length;
}

function uniqueStrings(values: string[]) {
  const result: string[] = [];

  values.forEach((value) => {
    if (result.indexOf(value) === -1) {
      result.push(value);
    }
  });

  return result;
}

function inspectJsonSource(
  source: string
): JsonDiagnostics {
  const duplicateKeys: string[] = [];
  const unsafeIntegers: string[] = [];
  const nonFiniteNumbers: string[] = [];
  const highPrecisionNumbers: string[] = [];
  const stack: Array<{
    type: "object" | "array";
    keys?: Set<string>;
  }> = [];

  let index = 0;

  while (index < source.length) {
    const char = source[index];

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    if (char === "{") {
      stack.push({
        type: "object",
        keys: new Set<string>(),
      });
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
      const end = findJsonStringEnd(
        source,
        index
      );
      const raw = source.slice(
        index,
        end + 1
      );
      let cursor = end + 1;

      while (
        cursor < source.length &&
        /\s/.test(source[cursor])
      ) {
        cursor += 1;
      }

      const current =
        stack[stack.length - 1];

      if (
        source[cursor] === ":" &&
        current &&
        current.type === "object" &&
        current.keys
      ) {
        try {
          const key = JSON.parse(
            raw
          ) as string;

          if (current.keys.has(key)) {
            duplicateKeys.push(key);
          } else {
            current.keys.add(key);
          }
        } catch {
          // Full JSON validation happens before this scan.
        }
      }

      index = end + 1;
      continue;
    }

    if (char === "-" || /\d/.test(char)) {
      const match = source
        .slice(index)
        .match(
          /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/
        );

      if (match) {
        const token = match[0];

        if (
          integerOutsideSafeRange(token)
        ) {
          unsafeIntegers.push(token);
        }

        if (
          /[.eE]/.test(token) &&
          significantDigitCount(token) > 15
        ) {
          highPrecisionNumbers.push(
            token
          );
        }

        if (
          !Number.isFinite(Number(token))
        ) {
          nonFiniteNumbers.push(token);
        }

        index += token.length;
        continue;
      }
    }

    index += 1;
  }

  return {
    duplicateKeys:
      uniqueStrings(duplicateKeys),
    unsafeIntegers:
      uniqueStrings(unsafeIntegers),
    nonFiniteNumbers:
      uniqueStrings(nonFiniteNumbers),
    highPrecisionNumbers:
      uniqueStrings(highPrecisionNumbers),
  };
}

function detectRootType(value: unknown) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function getUtf8Bytes(value: string) {
  return new TextEncoder().encode(value)
    .length;
}

function lineExcerpt(
  source: string,
  line: number,
  column: number
) {
  const lines = source
    .replace(/\r\n?/g, "\n")
    .split("\n");
  const excerpt = lines[line - 1] || "";
  const caret =
    " ".repeat(
      Math.max(column - 1, 0)
    ) + "^";

  return `${excerpt}\n${caret}`;
}

function formatJsonError(
  caught: unknown,
  source: string
) {
  const message =
    caught instanceof Error
      ? caught.message
      : "Invalid JSON input.";

  const directLocation = message.match(
    /line\s+(\d+)\s+column\s+(\d+)/i
  );

  if (directLocation) {
    const line = Number(
      directLocation[1]
    );
    const column = Number(
      directLocation[2]
    );

    return `Invalid JSON near line ${line}, column ${column}.\n${lineExcerpt(
      source,
      line,
      column
    )}\n${message}`;
  }

  const positionMatch = message.match(
    /position\s+(\d+)/i
  );

  if (positionMatch) {
    const position = Number(
      positionMatch[1]
    );
    const before = source
      .slice(0, position)
      .replace(/\r\n?/g, "\n");
    const line =
      before.split("\n").length;
    const lastBreak =
      before.lastIndexOf("\n");
    const column =
      before.length - lastBreak;

    return `Invalid JSON near line ${line}, column ${column}.\n${lineExcerpt(
      source,
      line,
      column
    )}\n${message}`;
  }

  return `Invalid JSON. ${message}`;
}

export default function ToolClient() {
  const [input, setInput] =
    useState("");
  const [result, setResult] =
    useState<JsonResult | null>(null);
  const [error, setError] =
    useState("");
  const [copied, setCopied] =
    useState(false);

  const clearResult = () => {
    setResult(null);
    setError("");
    setCopied(false);
  };

  const minifyJSON = () => {
    if (!input.trim()) {
      setResult(null);
      setError(
        "Paste JSON before minifying."
      );
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const output =
        minifyJsonTokens(input);
      const originalBytes =
        getUtf8Bytes(input);
      const minifiedBytes =
        getUtf8Bytes(output);
      const savedBytes = Math.max(
        originalBytes - minifiedBytes,
        0
      );
      const savedPercent =
        originalBytes > 0
          ? (
              (savedBytes /
                originalBytes) *
              100
            ).toFixed(1)
          : "0.0";

      setResult({
        output,
        originalBytes,
        minifiedBytes,
        savedBytes,
        savedPercent,
        rootType:
          detectRootType(parsed),
        diagnostics:
          inspectJsonSource(input),
      });
      setError("");
      setCopied(false);
    } catch (caught) {
      setResult(null);
      setError(
        formatJsonError(
          caught,
          input
        )
      );
      setCopied(false);
    }
  };

  const loadExample = () => {
    setInput(SAMPLE_JSON);
    setResult(null);
    setError("");
    setCopied(false);
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
        "The minified JSON could not be copied. Select and copy it manually."
      );
    }
  };

  const resetAll = () => {
    setInput("");
    clearResult();
  };

  const diagnostics = result
    ? result.diagnostics
    : null;

  return (
    <ToolShell
      title="JSON Minifier"
      description="Remove only insignificant JSON whitespace outside strings, preserving source number spellings, duplicate member text, escape sequences, and key order instead of rebuilding the parsed value."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block text-sm font-semibold text-gray-900">
          JSON input
        </label>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">
          The input must be valid JSON. Spaces and line breaks inside string
          values are data and will not be removed.
        </p>

        <textarea
          value={input}
          onChange={(event: {
            target: { value: string };
          }) => {
            setInput(event.target.value);
            clearResult();
          }}
          placeholder={`{
  "name": "Sneha",
  "enabled": true
}`}
          spellCheck={false}
          className="mt-4 w-full min-h-[320px] rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={minifyJSON}
          className="yoryantra-btn"
        >
          Minify JSON
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

      {result ? (
        <div className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Original"
              value={`${result.originalBytes.toLocaleString()} bytes`}
            />
            <Stat
              label="Minified"
              value={`${result.minifiedBytes.toLocaleString()} bytes`}
            />
            <Stat
              label="Whitespace removed"
              value={`${result.savedBytes.toLocaleString()} bytes (${result.savedPercent}%)`}
            />
            <Stat
              label="Root"
              value={result.rootType}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Minified JSON
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  This is whitespace minification, not gzip, Brotli, or binary compression.
                </p>
              </div>

              <button
                type="button"
                onClick={copyOutput}
                className="yoryantra-btn-outline text-sm"
              >
                {copied
                  ? "Copied"
                  : "Copy"}
              </button>
            </div>

            <pre className="yoryantra-output mt-4 min-h-[200px] overflow-auto whitespace-pre-wrap break-all font-mono text-sm">
              {result.output}
            </pre>
          </div>

          {diagnostics &&
          (diagnostics.duplicateKeys.length ||
            diagnostics.unsafeIntegers.length ||
            diagnostics.nonFiniteNumbers.length ||
            diagnostics.highPrecisionNumbers
              .length) ? (
            <div className="mt-5 space-y-3">
              {diagnostics.duplicateKeys
                .length ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
                  <strong>
                    Duplicate member text was preserved:
                  </strong>{" "}
                  {diagnostics.duplicateKeys
                    .slice(0, 8)
                    .join(", ")}
                  {diagnostics
                    .duplicateKeys
                    .length > 8
                    ? " …"
                    : ""}
                  . Different consumers can
                  handle duplicates differently,
                  so minifying them does not make
                  the payload interoperable.
                </div>
              ) : null}

              {diagnostics.unsafeIntegers
                .length ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
                  <strong>
                    Large integer token
                    {diagnostics
                      .unsafeIntegers.length ===
                    1
                      ? ""
                      : "s"}{" "}
                    preserved:
                  </strong>{" "}
                  {diagnostics.unsafeIntegers
                    .slice(0, 6)
                    .join(", ")}
                  {diagnostics
                    .unsafeIntegers.length > 6
                    ? " …"
                    : ""}
                  . JavaScript Number consumers
                  may still lose exact precision
                  when they parse the result.
                </div>
              ) : null}

              {diagnostics
                .highPrecisionNumbers.length ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
                  <strong>
                    High-precision numeric token
                    {diagnostics
                      .highPrecisionNumbers
                      .length === 1
                      ? ""
                      : "s"}:
                  </strong>{" "}
                  {diagnostics.highPrecisionNumbers
                    .slice(0, 5)
                    .join(", ")}
                  {diagnostics
                    .highPrecisionNumbers.length >
                  5
                    ? " …"
                    : ""}
                  . Minification keeps the
                  spelling but does not change
                  the numeric limits of the next
                  parser.
                </div>
              ) : null}

              {diagnostics
                .nonFiniteNumbers.length ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-800">
                  <strong>
                    JavaScript magnitude warning:
                  </strong>{" "}
                  {diagnostics.nonFiniteNumbers
                    .slice(0, 5)
                    .join(", ")}
                  {diagnostics
                    .nonFiniteNumbers.length > 5
                    ? " …"
                    : ""}
                  . The source token remains valid
                  JSON text, but JSON.parse in
                  JavaScript resolves that
                  magnitude outside the finite
                  Number range.
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Minification runs on the pasted JSON in your browser. The tool does
        not send the payload to a minification API. Site-wide analytics or
        advertising scripts, if enabled, are separate from this operation.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            The Safest JSON Minifier Removes Less Than You Might Expect
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JSON permits insignificant whitespace around structural
            characters and values. A minifier can remove those spaces,
            tabs, carriage returns, and line feeds without needing to
            rename keys, reorder members, shorten strings, or transform
            numbers.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Yoryantra validates the JSON first, then removes whitespace
            only while the scanner is outside a quoted string. That
            narrow job is intentional: minification should make the
            text smaller, not invent a different serialization policy.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            This Space Disappears; This Space Does Not
          </h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-white p-4 text-sm leading-7 text-gray-800">{`Before
{
  "city": "Pune",
  "name": "Sneha  Sonawane"
}

After
{"city":"Pune","name":"Sneha  Sonawane"}`}</pre>
          <p className="mt-4 leading-relaxed text-gray-600">
            Formatting whitespace between tokens is removable. The two
            spaces in the name string are part of the actual string and
            remain exactly as written. The same rule protects escape
            sequences and line-break escapes inside JSON strings.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Why This Tool Does Not Use JSON.parse → JSON.stringify for the Output
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Parse-and-stringify creates compact JSON, but it does so by
            constructing JavaScript values and then serializing those
            values again. Duplicate object names can collapse to one
            value. Very large numbers can lose precision. Numeric
            spelling such as exponent notation can be rewritten.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            For minification, none of that rewriting is necessary.
            Removing whitespace from already-valid source tokens gives
            you compact text while leaving those diagnostic clues
            visible.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900">
              Minification reduces source bytes
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Pretty indentation can add a noticeable amount of text to
              a large payload. Removing it reduces the uncompressed
              representation stored or transmitted.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900">
              Compression attacks repeated patterns too
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              gzip and Brotli encode repeated byte patterns, not just
              formatting whitespace. A minified response can still
              shrink substantially again when HTTP compression is
              enabled.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Minification Can Make Debugging More Expensive Than the Bytes It Saves
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            One-line JSON is efficient for machines but unpleasant in a
            log file, code review, incident ticket, or browser console.
            Keep readable source in repositories and operational
            tooling unless compact text has a real benefit. Formatting
            and minification are easy to reverse for valid JSON, so the
            best representation can depend on where the payload lives.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            Whitespace Changes Bytes Even When It Does Not Change the JSON Values
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            If a checksum, digital signature, cache key, HMAC, or test
            fixture is calculated over the literal JSON bytes,
            minification changes that byte sequence. Two JSON texts can
            represent equivalent values and still produce different
            hashes because their whitespace differs.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            Do not minify a signed payload after the signature was
            created unless the signing protocol explicitly defines a
            canonical representation and you follow that exact
            procedure.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Smaller Text Does Not Fix Duplicate Names or Numeric Interoperability
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The minifier reports duplicate member names and risky
            numeric tokens because those issues survive whitespace
            removal. If the next system keeps a different duplicate or
            rounds an identifier, the fact that the payload is now
            compact does not make it safer.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Treat those findings as source-data problems to resolve
            before relying on the payload across languages, runtimes,
            or APIs.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <YoryantraRelatedTools currentHref="/tools/json-minifier" />
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
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}
