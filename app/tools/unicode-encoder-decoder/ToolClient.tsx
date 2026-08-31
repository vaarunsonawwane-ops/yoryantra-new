"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type EncodeStyle = "json" | "javascript" | "codepoint";
type DecodeStyle = "auto" | "json" | "javascript" | "codepoint";

const encodeStyles: Array<{ value: EncodeStyle; label: string; detail: string }> = [
  {
    value: "json",
    label: "JSON / UTF-16",
    detail: "Uses \\uXXXX escapes and surrogate pairs for non-BMP characters.",
  },
  {
    value: "javascript",
    label: "JavaScript code point",
    detail: "Uses \\u{...} for characters outside the basic multilingual plane.",
  },
  {
    value: "codepoint",
    label: "U+ code points",
    detail: "Writes each character as U+XXXX or U+XXXXX.",
  },
];

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [encodeStyle, setEncodeStyle] = useState<EncodeStyle>("json");
  const [decodeStyle, setDecodeStyle] = useState<DecodeStyle>("auto");
  const [escapeAscii, setEscapeAscii] = useState(true);
  const [error, setError] = useState("");

  const stats = useMemo(() => getUnicodeStats(input), [input]);

  const encode = () => {
    if (!input) {
      setError("Enter text to encode.");
      setOutput("");
      return;
    }

    try {
      const encoded =
        encodeStyle === "json"
          ? encodeJsonUtf16(input, escapeAscii)
          : encodeStyle === "javascript"
          ? encodeJavaScriptCodePoints(input, escapeAscii)
          : encodeCodePointLabels(input);

      setOutput(encoded);
      setError("");
    } catch (err) {
      setOutput("");
      setError(err instanceof Error ? err.message : "Unable to encode this text.");
    }
  };

  const decode = () => {
    if (!input.trim()) {
      setError("Enter Unicode escape text or code-point notation to decode.");
      setOutput("");
      return;
    }

    try {
      const decoded = decodeUnicodeInput(input, decodeStyle);
      setOutput(decoded);
      setError("");
    } catch (err) {
      setOutput("");
      setError(err instanceof Error ? err.message : "Unable to decode this input.");
    }
  };

  const loadExample = () => {
    setInput("Hello 😀 नमस्ते");
    setOutput("");
    setError("");
    setEncodeStyle("json");
    setDecodeStyle("auto");
    setEscapeAscii(true);
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setEncodeStyle("json");
    setDecodeStyle("auto");
    setEscapeAscii(true);
  };

  return (
    <ToolShell
      title="Unicode Encoder Decoder"
      description="Convert readable Unicode text to JSON-compatible UTF-16 escapes, JavaScript code-point escapes, or U+ notation, and decode those forms safely."
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Input
        </label>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={7}
          placeholder={"Examples: Hello 😀  |  \\uD83D\\uDE00  |  \\u{1F600}  |  U+1F600"}
          className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm text-gray-500">
          Characters: {stats.codePoints.toLocaleString()} · UTF-16 code units:{" "}
          {stats.codeUnits.toLocaleString()} · UTF-8 bytes:{" "}
          {stats.utf8Bytes.toLocaleString()}
        </p>
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-gray-700">Encode as</p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {encodeStyles.map((style) => (
            <button
              key={style.value}
              onClick={() => setEncodeStyle(style.value)}
              className={`rounded-xl border p-4 text-left transition ${
                encodeStyle === style.value
                  ? "border-[var(--light-gold)] bg-yellow-50"
                  : "border-gray-200 bg-white hover:border-[var(--light-gold)]"
              }`}
            >
              <span className="block text-sm font-semibold text-gray-900">
                {style.label}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-gray-500">
                {style.detail}
              </span>
            </button>
          ))}
        </div>

        {encodeStyle !== "codepoint" && (
          <label className="mt-4 flex items-start gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={escapeAscii}
              onChange={(event) => setEscapeAscii(event.target.checked)}
              className="mt-1"
            />
            <span>
              Escape ASCII characters too. Turn this off to leave ordinary
              printable ASCII readable while escaping non-ASCII characters.
            </span>
          </label>
        )}
      </div>

      <div className="mt-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Decode format
        </label>
        <select
          value={decodeStyle}
          onChange={(event) => setDecodeStyle(event.target.value as DecodeStyle)}
          className="w-full rounded-xl border border-gray-300 bg-white p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)] md:max-w-md"
        >
          <option value="auto">Auto-detect common forms</option>
          <option value="json">JSON / UTF-16 \\uXXXX</option>
          <option value="javascript">JavaScript \\u{"{...}"}</option>
          <option value="codepoint">U+ code points</option>
        </select>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={decode} className="yoryantra-btn">
          Decode Unicode
        </button>
        <button onClick={encode} className="yoryantra-btn-outline">
          Encode Unicode
        </button>
        <button onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>
        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Output</h3>
          {output && (
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>
        <pre className="yoryantra-output min-h-[220px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "Encoded or decoded Unicode output will appear here."}
        </pre>
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            JSON Escapes and JavaScript Code-Point Escapes Are Not the Same
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JSON string escapes use exactly four hexadecimal digits after
            <code> \u</code>. Characters above U+FFFF are represented with a
            UTF-16 surrogate pair, such as <code>\uD83D\uDE00</code> for 😀.
            JavaScript source code also supports code-point escape syntax such
            as <code>\u{"{1F600}"}</code>, but that form is not valid JSON.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The JSON / UTF-16 mode focuses on Unicode escape representation.
            It is not a complete JSON string escaper for quote, backslash, and
            other JSON string-syntax concerns; use the dedicated JSON Escape
            Unescape tool when you need a complete JSON string literal.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Surrogate-Pair Validation Matters
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A high UTF-16 surrogate should be followed by a matching low
            surrogate when it represents a character outside the basic
            multilingual plane. The decoder reports unpaired surrogate escapes
            instead of silently producing malformed Unicode text.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Code Points, Code Units, and UTF-8 Bytes
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JavaScript string length is based on UTF-16 code units, so one emoji
            can occupy two code units while still representing one Unicode code
            point. UTF-8 uses a separate variable-length byte encoding. The
            counters above make those distinctions visible while debugging
            payloads or escaped strings.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Standards Reference
          </h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="https://www.rfc-editor.org/rfc/rfc8259.html"
              target="_blank"
              rel="noreferrer noopener"
              className="yoryantra-btn-outline"
            >
              RFC 8259 JSON strings
            </a>
            <a
              href="https://tc39.es/ecma262/"
              target="_blank"
              rel="noreferrer noopener"
              className="yoryantra-btn-outline"
            >
              ECMAScript specification
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/unicode-encoder-decoder" />
        </div>
      </section>
    </ToolShell>
  );
}

function getUnicodeStats(value: string) {
  return {
    codePoints: Array.from(value).length,
    codeUnits: value.length,
    utf8Bytes: new TextEncoder().encode(value).length,
  };
}

function encodeJsonUtf16(value: string, escapeAscii: boolean) {
  let output = "";

  for (const char of Array.from(value)) {
    const codePoint = char.codePointAt(0);
    if (codePoint === undefined) continue;

    if (!escapeAscii && codePoint >= 0x20 && codePoint <= 0x7e) {
      output += char;
      continue;
    }

    if (codePoint <= 0xffff) {
      output += `\\u${hex(codePoint, 4)}`;
      continue;
    }

    const adjusted = codePoint - 0x10000;
    const high = 0xd800 + (adjusted >> 10);
    const low = 0xdc00 + (adjusted & 0x3ff);
    output += `\\u${hex(high, 4)}\\u${hex(low, 4)}`;
  }

  return output;
}

function encodeJavaScriptCodePoints(value: string, escapeAscii: boolean) {
  let output = "";

  for (const char of Array.from(value)) {
    const codePoint = char.codePointAt(0);
    if (codePoint === undefined) continue;

    if (!escapeAscii && codePoint >= 0x20 && codePoint <= 0x7e) {
      output += char;
    } else if (codePoint <= 0xffff) {
      output += `\\u${hex(codePoint, 4)}`;
    } else {
      output += `\\u{${codePoint.toString(16).toUpperCase()}}`;
    }
  }

  return output;
}

function encodeCodePointLabels(value: string) {
  return Array.from(value)
    .map((char) => {
      const codePoint = char.codePointAt(0);
      return codePoint === undefined ? "" : `U+${hex(codePoint, codePoint <= 0xffff ? 4 : 5)}`;
    })
    .filter(Boolean)
    .join(" ");
}

function decodeUnicodeInput(value: string, style: DecodeStyle) {
  if (style === "json") return decodeUtf16Escapes(value);
  if (style === "javascript") return decodeJavaScriptEscapes(value);
  if (style === "codepoint") return decodeCodePointNotation(value);

  const hasJsCodePoint = /\\u\{[0-9a-fA-F]+\}/.test(value);
  const hasUtf16 = /\\u[0-9a-fA-F]{4}/.test(value);
  const looksLikeCodePoints = /(?:^|[\s,])U\+[0-9a-fA-F]{1,6}(?=$|[\s,])/i.test(value);

  if (hasJsCodePoint) {
    const afterJs = replaceJavaScriptCodePointEscapes(value);
    return hasUtf16 ? decodeUtf16Escapes(afterJs) : afterJs;
  }

  if (hasUtf16) return decodeUtf16Escapes(value);
  if (looksLikeCodePoints) return decodeCodePointNotation(value);

  throw new Error(
    "No supported Unicode escape was found. Use \\uXXXX, \\u{...}, or U+XXXX notation."
  );
}

function decodeJavaScriptEscapes(value: string) {
  const withCodePoints = replaceJavaScriptCodePointEscapes(value);
  return /\\u[0-9a-fA-F]{4}/.test(withCodePoints)
    ? decodeUtf16Escapes(withCodePoints)
    : withCodePoints;
}

function replaceJavaScriptCodePointEscapes(value: string) {
  return value.replace(/\\u\{([0-9a-fA-F]{1,6})\}/g, (_match, rawHex: string) => {
    const codePoint = parseInt(rawHex, 16);
    assertUnicodeScalar(codePoint, `\\u{${rawHex}}`);
    return String.fromCodePoint(codePoint);
  });
}

function decodeUtf16Escapes(value: string) {
  let output = "";
  let index = 0;
  let found = false;

  while (index < value.length) {
    const match = value.slice(index).match(/^\\u([0-9a-fA-F]{4})/);

    if (!match) {
      output += value[index];
      index += 1;
      continue;
    }

    found = true;
    const codeUnit = parseInt(match[1], 16);
    index += 6;

    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      const lowMatch = value.slice(index).match(/^\\u([0-9a-fA-F]{4})/);
      if (!lowMatch) {
        throw new Error(
          `High surrogate \\u${match[1].toUpperCase()} is not followed by a low-surrogate escape.`
        );
      }

      const low = parseInt(lowMatch[1], 16);
      if (low < 0xdc00 || low > 0xdfff) {
        throw new Error(
          `High surrogate \\u${match[1].toUpperCase()} is followed by a non-low-surrogate escape.`
        );
      }

      const codePoint =
        0x10000 + ((codeUnit - 0xd800) << 10) + (low - 0xdc00);
      output += String.fromCodePoint(codePoint);
      index += 6;
      continue;
    }

    if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
      throw new Error(
        `Low surrogate \\u${match[1].toUpperCase()} appears without a preceding high surrogate.`
      );
    }

    output += String.fromCharCode(codeUnit);
  }

  if (!found) {
    throw new Error("No \\uXXXX escapes were found.");
  }

  return output;
}

function decodeCodePointNotation(value: string) {
  const tokens = value
    .trim()
    .split(/[\s,]+/)
    .filter(Boolean);

  if (!tokens.length || tokens.some((token) => !/^U\+[0-9a-fA-F]{1,6}$/i.test(token))) {
    throw new Error(
      "U+ notation must contain code-point tokens such as U+0041 U+1F600."
    );
  }

  return tokens
    .map((token) => {
      const codePoint = parseInt(token.slice(2), 16);
      assertUnicodeScalar(codePoint, token);
      return String.fromCodePoint(codePoint);
    })
    .join("");
}

function assertUnicodeScalar(codePoint: number, label: string) {
  if (
    !Number.isInteger(codePoint) ||
    codePoint < 0 ||
    codePoint > 0x10ffff ||
    (codePoint >= 0xd800 && codePoint <= 0xdfff)
  ) {
    throw new Error(`${label} is not a valid Unicode scalar value.`);
  }
}

function hex(value: number, width: number) {
  return value.toString(16).toUpperCase().padStart(width, "0");
}
