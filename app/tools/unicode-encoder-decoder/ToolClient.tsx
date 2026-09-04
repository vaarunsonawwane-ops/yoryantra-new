"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type EncodeStyle =
  | "utf16"
  | "javascript"
  | "codepoint";

type DecodeStyle =
  | "auto"
  | "utf16"
  | "javascript"
  | "codepoint";

type SurrogatePolicy =
  | "strict"
  | "inspect";

type CodePointEntry = {
  codePoint: number;
  label: string;
  display: string;
  utf16: string;
  utf8: string;
  surrogate: boolean;
};

type DecodeResult = {
  text: string;
  warnings: string[];
  detected: string;
};

type UnicodeStats = {
  utf16Units: number;
  sequenceItems: number;
  utf8Bytes: number;
  loneSurrogates: number;
  bidiControls: number;
  nfcChanged: boolean;
  nfdChanged: boolean;
};

const ENCODE_STYLES: Array<{
  value: EncodeStyle;
  label: string;
  detail: string;
}> = [
  {
    value: "utf16",
    label: "UTF-16 \\uXXXX",
    detail:
      "Four-hex-digit code-unit escapes; supplementary characters use surrogate pairs.",
  },
  {
    value: "javascript",
    label: "JavaScript \\u{...}",
    detail:
      "Uses ECMAScript code-point escapes for supplementary characters.",
  },
  {
    value: "codepoint",
    label: "U+ code points",
    detail:
      "Writes Unicode code-point labels such as U+0053 and U+1F600.",
  },
];

function hex(
  value: number,
  width: number
) {
  return value
    .toString(16)
    .toUpperCase()
    .padStart(width, "0");
}

function isHighSurrogate(
  value: number
) {
  return (
    value >= 0xd800 &&
    value <= 0xdbff
  );
}

function isLowSurrogate(
  value: number
) {
  return (
    value >= 0xdc00 &&
    value <= 0xdfff
  );
}

function combineSurrogates(
  high: number,
  low: number
) {
  return (
    0x10000 +
    ((high - 0xd800) << 10) +
    (low - 0xdc00)
  );
}

const BIDI_CONTROL_LABELS: Record<number, string> = {
  0x061c: "ARABIC LETTER MARK (bidi control)",
  0x200e: "LEFT-TO-RIGHT MARK (bidi control)",
  0x200f: "RIGHT-TO-LEFT MARK (bidi control)",
  0x202a: "LEFT-TO-RIGHT EMBEDDING (bidi control)",
  0x202b: "RIGHT-TO-LEFT EMBEDDING (bidi control)",
  0x202c: "POP DIRECTIONAL FORMATTING (bidi control)",
  0x202d: "LEFT-TO-RIGHT OVERRIDE (bidi control)",
  0x202e: "RIGHT-TO-LEFT OVERRIDE (bidi control)",
  0x2066: "LEFT-TO-RIGHT ISOLATE (bidi control)",
  0x2067: "RIGHT-TO-LEFT ISOLATE (bidi control)",
  0x2068: "FIRST STRONG ISOLATE (bidi control)",
  0x2069: "POP DIRECTIONAL ISOLATE (bidi control)",
};

const OTHER_INVISIBLE_LABELS: Record<number, string> = {
  0x200b: "ZERO WIDTH SPACE",
  0x200c: "ZERO WIDTH NON-JOINER",
  0x200d: "ZERO WIDTH JOINER",
  0x2060: "WORD JOINER",
  0xfeff: "ZERO WIDTH NO-BREAK SPACE / BOM",
};

function isBidiControl(codePoint: number) {
  return Object.prototype.hasOwnProperty.call(
    BIDI_CONTROL_LABELS,
    codePoint
  );
}

function displayCodePoint(
  codePoint: number,
  char: string
) {
  if (isBidiControl(codePoint)) {
    return BIDI_CONTROL_LABELS[codePoint];
  }

  if (
    Object.prototype.hasOwnProperty.call(
      OTHER_INVISIBLE_LABELS,
      codePoint
    )
  ) {
    return OTHER_INVISIBLE_LABELS[codePoint];
  }

  if (codePoint === 0x20) {
    return "space";
  }

  if (codePoint === 0x09) {
    return "\\t";
  }

  if (codePoint === 0x0a) {
    return "\\n";
  }

  if (codePoint === 0x0d) {
    return "\\r";
  }

  if (
    codePoint < 0x20 ||
    (codePoint >= 0x7f &&
      codePoint <= 0x9f)
  ) {
    return "control";
  }

  return char;
}

function codePointEntries(
  value: string
) {
  const entries: CodePointEntry[] =
    [];
  let index = 0;

  while (index < value.length) {
    const first =
      value.charCodeAt(index);

    if (
      isHighSurrogate(first) &&
      index + 1 < value.length
    ) {
      const second =
        value.charCodeAt(index + 1);

      if (
        isLowSurrogate(second)
      ) {
        const codePoint =
          combineSurrogates(
            first,
            second
          );
        const char =
          String.fromCodePoint(
            codePoint
          );
        const bytes =
          new TextEncoder().encode(
            char
          );

        entries.push({
          codePoint,
          label: `U+${hex(
            codePoint,
            codePoint <= 0xffff
              ? 4
              : 6
          )}`,
          display: displayCodePoint(
            codePoint,
            char
          ),
          utf16: `0x${hex(
            first,
            4
          )} 0x${hex(
            second,
            4
          )}`,
          utf8: Array.from(
            bytes
          )
            .map(
              (byte) =>
                hex(byte, 2)
            )
            .join(" "),
          surrogate: false,
        });

        index += 2;
        continue;
      }
    }

    const surrogate =
      isHighSurrogate(first) ||
      isLowSurrogate(first);

    const char =
      value.charAt(index);
    const bytes = surrogate
      ? ""
      : Array.from(
          new TextEncoder().encode(
            char
          )
        )
          .map(
            (byte) =>
              hex(byte, 2)
          )
          .join(" ");

    entries.push({
      codePoint: first,
      label: `U+${hex(
        first,
        4
      )}`,
      display: surrogate
        ? "isolated surrogate"
        : displayCodePoint(
            first,
            char
          ),
      utf16: `0x${hex(
        first,
        4
      )}`,
      utf8: surrogate
        ? "not a Unicode scalar value"
        : bytes,
      surrogate,
    });

    index += 1;
  }

  return entries;
}

function getUnicodeStats(
  value: string
): UnicodeStats {
  const entries =
    codePointEntries(value);
  const loneSurrogates =
    entries.filter(
      (entry) =>
        entry.surrogate
    ).length;
  const bidiControls =
    entries.filter(
      (entry) =>
        isBidiControl(
          entry.codePoint
        )
    ).length;

  return {
    utf16Units: value.length,
    sequenceItems:
      entries.length,
    utf8Bytes:
      loneSurrogates === 0
        ? new TextEncoder().encode(
            value
          ).length
        : -1,
    loneSurrogates,
    bidiControls,
    nfcChanged:
      value.normalize("NFC") !==
      value,
    nfdChanged:
      value.normalize("NFD") !==
      value,
  };
}

function encodeUtf16Escapes(
  value: string,
  escapeAscii: boolean
) {
  let output = "";

  for (
    let index = 0;
    index < value.length;
    index += 1
  ) {
    const unit =
      value.charCodeAt(index);

    if (
      !escapeAscii &&
      unit >= 0x20 &&
      unit <= 0x7e
    ) {
      output +=
        value.charAt(index);
    } else {
      output += `\\u${hex(
        unit,
        4
      )}`;
    }
  }

  return output;
}

function encodeJavaScriptEscapes(
  value: string,
  escapeAscii: boolean
) {
  let output = "";
  let index = 0;

  while (index < value.length) {
    const first =
      value.charCodeAt(index);

    if (
      isHighSurrogate(first) &&
      index + 1 < value.length
    ) {
      const second =
        value.charCodeAt(
          index + 1
        );

      if (
        isLowSurrogate(second)
      ) {
        const codePoint =
          combineSurrogates(
            first,
            second
          );
        output += `\\u{${hex(
          codePoint,
          1
        )}}`;
        index += 2;
        continue;
      }
    }

    if (
      !escapeAscii &&
      first >= 0x20 &&
      first <= 0x7e
    ) {
      output +=
        value.charAt(index);
    } else {
      output += `\\u${hex(
        first,
        4
      )}`;
    }

    index += 1;
  }

  return output;
}

function encodeCodePointLabels(
  value: string
) {
  return codePointEntries(value)
    .map((entry) =>
      entry.label
    )
    .join(" ");
}

function validateCodePointRange(
  codePoint: number,
  label: string
) {
  if (
    !Number.isInteger(
      codePoint
    ) ||
    codePoint < 0 ||
    codePoint > 0x10ffff
  ) {
    throw new Error(
      `${label} is outside the Unicode codespace U+0000 through U+10FFFF.`
    );
  }
}

function surrogateWarning(
  label: string
) {
  return `${label} is a surrogate code point/code unit. Surrogates are reserved for UTF-16 pairing and are not Unicode scalar values on their own.`;
}

function decodeUtf16Escapes(
  value: string,
  policy: SurrogatePolicy
): DecodeResult {
  let output = "";
  let index = 0;
  let found = false;
  const warnings: string[] =
    [];

  while (index < value.length) {
    const match =
      value
        .slice(index)
        .match(
          /^\\u([0-9a-fA-F]{4})/
        );

    if (!match) {
      output +=
        value.charAt(index);
      index += 1;
      continue;
    }

    found = true;
    const first =
      parseInt(
        match[1],
        16
      );
    const firstLabel =
      `\\u${match[1].toUpperCase()}`;

    index += 6;

    if (
      isHighSurrogate(first)
    ) {
      const lowMatch =
        value
          .slice(index)
          .match(
            /^\\u([0-9a-fA-F]{4})/
          );

      if (lowMatch) {
        const low =
          parseInt(
            lowMatch[1],
            16
          );

        if (
          isLowSurrogate(low)
        ) {
          output +=
            String.fromCodePoint(
              combineSurrogates(
                first,
                low
              )
            );
          index += 6;
          continue;
        }
      }

      if (
        policy === "strict"
      ) {
        throw new Error(
          `High surrogate ${firstLabel} is not followed by a low-surrogate escape. Strict Unicode text requires a complete UTF-16 surrogate pair.`
        );
      }

      output +=
        String.fromCharCode(
          first
        );
      warnings.push(
        surrogateWarning(
          firstLabel
        )
      );
      continue;
    }

    if (
      isLowSurrogate(first)
    ) {
      if (
        policy === "strict"
      ) {
        throw new Error(
          `Low surrogate ${firstLabel} appears without a preceding high-surrogate escape.`
        );
      }

      output +=
        String.fromCharCode(
          first
        );
      warnings.push(
        surrogateWarning(
          firstLabel
        )
      );
      continue;
    }

    output +=
      String.fromCharCode(
        first
      );
  }

  if (!found) {
    throw new Error(
      "No \\uXXXX escapes were found."
    );
  }

  return {
    text: output,
    warnings,
    detected:
      "UTF-16 \\uXXXX escape sequence",
  };
}

function replaceJavaScriptCodePointEscapes(
  value: string,
  policy: SurrogatePolicy
) {
  const warnings: string[] =
    [];
  let found = false;

  const text = value.replace(
    /\\u\{([0-9a-fA-F]{1,6})\}/g,
    (
      _match,
      rawHex: string
    ) => {
      found = true;
      const codePoint =
        parseInt(rawHex, 16);
      const label =
        `\\u{${rawHex.toUpperCase()}}`;

      validateCodePointRange(
        codePoint,
        label
      );

      if (
        isHighSurrogate(
          codePoint
        ) ||
        isLowSurrogate(
          codePoint
        )
      ) {
        if (
          policy === "strict"
        ) {
          throw new Error(
            `${label} is permitted by JavaScript's code-point escape range, but it denotes a surrogate code point rather than a Unicode scalar value. Switch to inspection mode only if you intentionally need to inspect a lone UTF-16 surrogate.`
          );
        }

        warnings.push(
          surrogateWarning(label)
        );
      }

      return String.fromCodePoint(
        codePoint
      );
    }
  );

  return {
    text,
    warnings,
    found,
  };
}

function decodeJavaScriptEscapes(
  value: string,
  policy: SurrogatePolicy
): DecodeResult {
  const js =
    replaceJavaScriptCodePointEscapes(
      value,
      policy
    );
  let text =
    js.text;
  const warnings =
    js.warnings.slice();
  let found =
    js.found;

  if (
    /\\u[0-9a-fA-F]{4}/.test(
      text
    )
  ) {
    const utf16 =
      decodeUtf16Escapes(
        text,
        policy
      );
    text =
      utf16.text;
    utf16.warnings.forEach(
      (warning) =>
        warnings.push(warning)
    );
    found = true;
  }

  if (!found) {
    throw new Error(
      "No JavaScript Unicode escape was found. Use \\uXXXX or \\u{...}."
    );
  }

  return {
    text,
    warnings,
    detected:
      "JavaScript Unicode escape syntax",
  };
}

function decodeCodePointNotation(
  value: string,
  policy: SurrogatePolicy
): DecodeResult {
  const tokens =
    value
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean);

  if (
    !tokens.length ||
    tokens.some(
      (token) =>
        !/^U\+[0-9a-fA-F]{1,6}$/i.test(
          token
        )
    )
  ) {
    throw new Error(
      "U+ notation must contain only code-point tokens such as U+0053 U+006E U+1F600, separated by spaces or commas."
    );
  }

  const warnings: string[] =
    [];
  let output = "";

  tokens.forEach((token) => {
    const codePoint =
      parseInt(
        token.slice(2),
        16
      );

    validateCodePointRange(
      codePoint,
      token
    );

    if (
      isHighSurrogate(
        codePoint
      ) ||
      isLowSurrogate(
        codePoint
      )
    ) {
      if (
        policy === "strict"
      ) {
        throw new Error(
          `${token.toUpperCase()} is a Unicode surrogate code point, not a Unicode scalar value. It cannot represent a standalone encoded character in well-formed UTF-8/UTF-16 text.`
        );
      }

      warnings.push(
        surrogateWarning(
          token.toUpperCase()
        )
      );
    }

    output +=
      String.fromCodePoint(
        codePoint
      );
  });

  return {
    text: output,
    warnings,
    detected:
      "U+ code-point notation",
  };
}

function decodeUnicodeInput(
  value: string,
  style: DecodeStyle,
  policy: SurrogatePolicy
): DecodeResult {
  if (style === "utf16") {
    return decodeUtf16Escapes(
      value,
      policy
    );
  }

  if (
    style === "javascript"
  ) {
    return decodeJavaScriptEscapes(
      value,
      policy
    );
  }

  if (
    style === "codepoint"
  ) {
    return decodeCodePointNotation(
      value,
      policy
    );
  }

  const hasJs =
    /\\u\{[0-9a-fA-F]{1,6}\}/.test(
      value
    );
  const hasUtf16 =
    /\\u[0-9a-fA-F]{4}/.test(
      value
    );
  const trimmed =
    value.trim();
  const allCodePoints =
    /^(?:U\+[0-9a-fA-F]{1,6})(?:[\s,]+U\+[0-9a-fA-F]{1,6})*$/i.test(
      trimmed
    );

  if (hasJs) {
    return decodeJavaScriptEscapes(
      value,
      policy
    );
  }

  if (hasUtf16) {
    return decodeUtf16Escapes(
      value,
      policy
    );
  }

  if (allCodePoints) {
    return decodeCodePointNotation(
      value,
      policy
    );
  }

  throw new Error(
    "Auto-detect could not find a supported form. Use \\uXXXX, JavaScript \\u{...}, or a sequence of U+XXXX code-point tokens."
  );
}

function encodeUnicode(
  value: string,
  style: EncodeStyle,
  escapeAscii: boolean
) {
  if (style === "utf16") {
    return encodeUtf16Escapes(
      value,
      escapeAscii
    );
  }

  if (
    style === "javascript"
  ) {
    return encodeJavaScriptEscapes(
      value,
      escapeAscii
    );
  }

  return encodeCodePointLabels(
    value
  );
}

function formatStats(
  stats: UnicodeStats
) {
  return [
    `Sequence items: ${stats.sequenceItems}`,
    `UTF-16 code units: ${stats.utf16Units}`,
    `UTF-8 bytes: ${
      stats.utf8Bytes >= 0
        ? stats.utf8Bytes
        : "not well-formed without surrogate replacement"
    }`,
    `Isolated surrogate units: ${stats.loneSurrogates}`,
    `Bidirectional format controls: ${stats.bidiControls}`,
    `NFC changes text: ${
      stats.nfcChanged
        ? "yes"
        : "no"
    }`,
    `NFD changes text: ${
      stats.nfdChanged
        ? "yes"
        : "no"
    }`,
  ].join("\n");
}

export default function ToolClient() {
  const [input, setInput] =
    useState("");
  const [output, setOutput] =
    useState("");
  const [encodeStyle, setEncodeStyle] =
    useState<EncodeStyle>(
      "utf16"
    );
  const [decodeStyle, setDecodeStyle] =
    useState<DecodeStyle>(
      "auto"
    );
  const [
    surrogatePolicy,
    setSurrogatePolicy,
  ] =
    useState<SurrogatePolicy>(
      "strict"
    );
  const [
    escapeAscii,
    setEscapeAscii,
  ] = useState(true);
  const [error, setError] =
    useState("");
  const [notes, setNotes] =
    useState<string[]>([]);
  const [detected, setDetected] =
    useState("");
  const [copied, setCopied] =
    useState(false);

  const stats = useMemo(
    () => getUnicodeStats(input),
    [input]
  );

  const entries = useMemo(
    () =>
      codePointEntries(
        input
      ).slice(0, 80),
    [input]
  );

  const clearResult = () => {
    setOutput("");
    setError("");
    setNotes([]);
    setDetected("");
    setCopied(false);
  };

  const encode = () => {
    if (!input) {
      setError(
        "Enter text to encode."
      );
      setOutput("");
      setNotes([]);
      setDetected("");
      return;
    }

    try {
      const encoded =
        encodeUnicode(
          input,
          encodeStyle,
          escapeAscii
        );
      const nextNotes: string[] =
        [];

      if (
        stats.loneSurrogates
      ) {
        nextNotes.push(
          `The input contains ${stats.loneSurrogates} isolated UTF-16 surrogate code unit${
            stats.loneSurrogates ===
            1
              ? ""
              : "s"
          }. The encoder preserves them as code-unit/code-point notation for inspection, but they are not Unicode scalar values and are not well-formed standalone Unicode text.`
        );
      }

      if (
        encodeStyle ===
          "utf16" &&
        !escapeAscii
      ) {
        nextNotes.push(
          "Printable ASCII is left readable. This output demonstrates \\uXXXX escape representation; it is not automatically a complete quoted JSON string literal because quotes, backslashes, and surrounding quotation marks are not added."
        );
      }

      if (
        encodeStyle ===
        "javascript"
      ) {
        nextNotes.push(
          "\\u{...} code-point escapes are ECMAScript syntax and are not valid JSON escape syntax."
        );
      }

      if (
        stats.nfcChanged
      ) {
        nextNotes.push(
          "The input is not already NFC-normalized. Visually similar text can have different code-point sequences; encoding preserves the sequence you supplied rather than normalizing it."
        );
      }

      setOutput(encoded);
      setNotes(nextNotes);
      setDetected(
        encodeStyle ===
          "utf16"
          ? "Encoded as UTF-16 code-unit escapes"
          : encodeStyle ===
            "javascript"
          ? "Encoded as JavaScript Unicode escapes"
          : "Encoded as Unicode code-point labels"
      );
      setError("");
      setCopied(false);
    } catch (caught) {
      setOutput("");
      setNotes([]);
      setDetected("");
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to encode this text."
      );
    }
  };

  const decode = () => {
    if (!input.trim()) {
      setError(
        "Enter Unicode escape text or code-point notation to decode."
      );
      setOutput("");
      setNotes([]);
      setDetected("");
      return;
    }

    try {
      const result =
        decodeUnicodeInput(
          input,
          decodeStyle,
          surrogatePolicy
        );
      const decodedStats =
        getUnicodeStats(
          result.text
        );
      const nextNotes =
        result.warnings.slice();

      if (
        decodedStats.nfcChanged
      ) {
        nextNotes.push(
          "The decoded text is not NFC-normalized. Decoding preserves the encoded code-point/code-unit sequence rather than normalizing it."
        );
      }

      setOutput(result.text);
      setNotes(nextNotes);
      setDetected(
        result.detected
      );
      setError("");
      setCopied(false);
    } catch (caught) {
      setOutput("");
      setNotes([]);
      setDetected("");
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to decode this input."
      );
    }
  };

  const loadExample = () => {
    setInput(
      "Sneha 😀 नमस्ते e\u0301"
    );
    setEncodeStyle(
      "utf16"
    );
    setDecodeStyle(
      "auto"
    );
    setSurrogatePolicy(
      "strict"
    );
    setEscapeAscii(true);
    clearResult();
  };

  const loadEscapeExample = () => {
    setInput(
      "\\u0053\\u006E\\u0065\\u0068\\u0061 \\uD83D\\uDE00 \\u0928\\u092E\\u0938\\u094D\\u0924\\u0947"
    );
    setDecodeStyle(
      "auto"
    );
    setSurrogatePolicy(
      "strict"
    );
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setEncodeStyle(
      "utf16"
    );
    setDecodeStyle(
      "auto"
    );
    setSurrogatePolicy(
      "strict"
    );
    setEscapeAscii(true);
    clearResult();
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(
        output
      );
      setCopied(true);
      window.setTimeout(
        () => setCopied(false),
        1400
      );
    } catch {
      setCopied(false);
      setError(
        "The output could not be copied. Select and copy it manually."
      );
    }
  };

  return (
    <ToolShell
      title="Unicode Encoder Decoder"
      description="Convert between text, Unicode escapes, and U+ notation while keeping surrogate pairs and normalization differences visible."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label
          htmlFor="unicode-input"
          className="block text-sm font-semibold text-gray-900"
        >
          Text or Unicode notation
        </label>
        <textarea
          id="unicode-input"
          value={input}
          onChange={(event: {
            target: { value: string };
          }) => {
            setInput(
              event.target.value
            );
            clearResult();
          }}
          placeholder="Sneha 😀 नमस्ते or \\u0053\\u006E\\u0065\\u0068\\u0061"
          spellCheck={false}
          className="mt-4 w-full min-h-[260px] rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        {input ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Stat
              label="Sequence items"
              value={String(
                stats.sequenceItems
              )}
            />
            <Stat
              label="UTF-16 units"
              value={String(
                stats.utf16Units
              )}
            />
            <Stat
              label="UTF-8 bytes"
              value={
                stats.utf8Bytes >=
                0
                  ? String(
                      stats.utf8Bytes
                    )
                  : "ill-formed"
              }
            />
            <Stat
              label="Lone surrogates"
              value={String(
                stats.loneSurrogates
              )}
            />
            <Stat
              label="NFC changes?"
              value={
                stats.nfcChanged
                  ? "Yes"
                  : "No"
              }
            />
          </div>
        ) : null}

        {stats.bidiControls ? (
          <div
            role="status"
            className="mt-4 self-start rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-900"
          >
            <strong>Bidirectional formatting controls detected.</strong>{" "}
            The stored character order and the rendered order can differ. The
            inspection table labels these controls instead of rendering them in
            its Display column, while encoded/decoded output preserves the
            supplied sequence.
          </div>
        ) : null}
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-900">
          Encode as
        </h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {ENCODE_STYLES.map(
            (style) => (
              <button
                key={style.value}
                type="button"
                onClick={() => {
                  setEncodeStyle(
                    style.value
                  );
                  clearResult();
                }}
                aria-pressed={encodeStyle === style.value}
                className={`rounded-xl border p-4 text-left transition ${
                  encodeStyle ===
                  style.value
                    ? "border-[var(--green)] bg-green-50"
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
            )
          )}
        </div>

        {encodeStyle !==
        "codepoint" ? (
          <label className="mt-4 flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
            <input
              type="checkbox"
              checked={escapeAscii}
              onChange={(event: {
                target: {
                  checked: boolean;
                };
              }) => {
                setEscapeAscii(
                  event.target.checked
                );
                clearResult();
              }}
              className="mt-1 h-4 w-4 shrink-0 accent-[#d9a928]"
            />
            <span>
              <strong>
                Escape printable ASCII too.
              </strong>{" "}
              Turn this off to leave ordinary printable ASCII readable while
              still escaping non-ASCII and control code units.
            </span>
          </label>
        ) : null}
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <YoryantraSelect
          label="Decode format"
          value={decodeStyle}
          onChange={(value: string) => {
            setDecodeStyle(
              value as DecodeStyle
            );
            clearResult();
          }}
          options={[
            {
              label:
                "Auto-detect common forms",
              value: "auto",
            },
            {
              label:
                "UTF-16 \\uXXXX",
              value: "utf16",
            },
            {
              label:
                "JavaScript \\u{...} / \\uXXXX",
              value: "javascript",
            },
            {
              label:
                "U+ code points",
              value: "codepoint",
            },
          ]}
        />

        <YoryantraSelect
          label="Decoded surrogate handling"
          value={surrogatePolicy}
          onChange={(value: string) => {
            setSurrogatePolicy(
              value as SurrogatePolicy
            );
            clearResult();
          }}
          options={[
            {
              label:
                "Strict Unicode text",
              value: "strict",
            },
            {
              label:
                "Inspection: allow lone surrogates",
              value: "inspect",
            },
          ]}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={decode}
          className="yoryantra-btn shrink-0 whitespace-nowrap"
        >
          Decode Unicode
        </button>
        <button
          type="button"
          onClick={encode}
          className="yoryantra-btn-outline shrink-0 whitespace-nowrap"
        >
          Encode Unicode
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="yoryantra-btn-outline shrink-0 whitespace-nowrap"
        >
          Load Text Example
        </button>
        <button
          type="button"
          onClick={loadEscapeExample}
          className="yoryantra-btn-outline shrink-0 whitespace-nowrap"
        >
          Load Escape Example
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
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700"
        >
          {error}
        </div>
      ) : null}

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Output
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {detected ||
                "Encoded or decoded Unicode output will appear here."}
            </p>
          </div>

          {output ? (
            <button
              type="button"
              onClick={copyOutput}
              className="yoryantra-btn-outline shrink-0 whitespace-nowrap"
            >
              {copied
                ? "Copied"
                : "Copy"}
            </button>
          ) : null}
        </div>

        <pre className="yoryantra-output mt-4 min-h-[220px] overflow-auto whitespace-pre-wrap break-words font-mono text-sm">
          {output ||
            "No output yet."}
        </pre>

        {notes.length ? (
          <div
            role="status"
            className="mt-5 self-start rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-900"
          >
            <ul className="list-disc space-y-2 pl-5">
              {notes.map(
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

      {input ? (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Code-point / encoding inspection
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Showing the first{" "}
              {Math.min(
                entries.length,
                80
              )}{" "}
              sequence item
              {entries.length === 1
                ? ""
                : "s"}. UTF-8 bytes are shown only for Unicode scalar values.
            </p>
          </div>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-900">
                <tr>
                  <th className="p-3">
                    Code point
                  </th>
                  <th className="p-3">
                    Display
                  </th>
                  <th className="p-3">
                    UTF-16 units
                  </th>
                  <th className="p-3">
                    UTF-8 bytes
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {entries.map(
                  (entry, index) => (
                    <tr
                      key={`${entry.label}-${index}`}
                      className="border-t border-gray-200"
                    >
                      <td className="p-3 font-mono">
                        {entry.label}
                      </td>
                      <td className="p-3">
                        {entry.display}
                      </td>
                      <td className="p-3 font-mono text-xs">
                        {entry.utf16}
                      </td>
                      <td className="p-3 font-mono text-xs">
                        {entry.utf8}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          <pre className="mt-4 rounded-xl bg-gray-50 p-4 text-xs leading-6 text-gray-700">
            {formatStats(stats)}
          </pre>
        </div>
      ) : null}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Encoding, decoding, normalization checks, and byte inspection happen on
        the supplied string in your browser. No Unicode lookup API receives the
        text. Site-wide analytics or advertising scripts, if enabled, are
        separate from this operation.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            “One Character” Can Mean Four Different Counts
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A user sees text as grapheme clusters: what appears to be one
            character on screen can be several Unicode code points. JavaScript
            strings are indexed as UTF-16 code units. UTF-8 stores those scalar
            values as one to four bytes. None of those counts is guaranteed to
            equal the number of visible symbols.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The emoji 😀 is one Unicode scalar value, two UTF-16 code units, and
            four UTF-8 bytes. A family emoji or an accented letter written with
            a combining mark can involve several code points while still
            looking like one user-perceived character.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Why 😀 Becomes Two \uXXXX Escapes but One U+1F600
          </h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-white p-4 text-sm leading-7 text-gray-800">{`Unicode code point
U+1F600

UTF-16 code units
D83D DE00

Four-digit escape representation
\\uD83D\\uDE00

JavaScript code-point escape
\\u{1F600}`}</pre>
          <p className="mt-4 leading-relaxed text-gray-600">
            Four-digit <code>\uXXXX</code> escapes represent UTF-16 code units.
            A code point above U+FFFF therefore needs a high-surrogate and
            low-surrogate pair. JavaScript&apos;s brace form can spell the code
            point directly, but that <code>\u{"{...}"}</code> form is not JSON
            syntax.
          </p>
        </div>

        <div className="mt-12 self-start rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            Surrogate Code Points Exist, but They Are Not Standalone Unicode Characters
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            U+D800 through U+DFFF are reserved for UTF-16 surrogate mechanics.
            The Unicode Standard calls all values from U+0000 through U+10FFFF
            code points, but excludes surrogate code points from the set of
            Unicode scalar values. An isolated UTF-16 surrogate code unit has
            no standalone character interpretation.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            Strict decode mode therefore rejects lone surrogates. Inspection
            mode can preserve them in a JavaScript string when you are
            diagnosing malformed or legacy data, while clearly marking that
            result as ill-formed Unicode text.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            JSON Can Contain a \uD800 Escape Even Though Interoperability Is Poor
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JSON&apos;s ABNF permits a four-hex-digit <code>\uXXXX</code> escape,
            and RFC 8259 notes that observed JSON texts can contain unpaired
            surrogate escapes such as <code>\uDEAD</code>. The RFC also warns
            that software behavior for those values is unpredictable.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            That is why “valid-looking JSON escape syntax” and “well-formed
            Unicode scalar text” are not exactly the same claim. The decoder
            defaults to the stricter Unicode interpretation rather than silently
            normalizing malformed surrogate data.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            JavaScript \u{"{...}"} Syntax Describes a Code Point, Not UTF-8 Bytes
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            <code>\u{"{1F600}"}</code> is an ECMAScript source escape. The
            hexadecimal number identifies a Unicode code point up to U+10FFFF.
            It does not show the UTF-8 byte sequence <code>F0 9F 98 80</code>,
            and it is not a percent-encoded URL sequence.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Choose the representation based on the system you are debugging:
            JavaScript source, JSON-style UTF-16 escapes, U+ notation in
            documentation, or UTF-8 bytes on the wire are different layers.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Two Strings Can Look the Same and Still Have Different Code Points
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The visible letter <code>é</code> can be represented as U+00E9 or
            as U+0065 followed by U+0301 COMBINING ACUTE ACCENT. Unicode
            normalization defines standard transformations such as NFC and NFD
            for equivalent sequences.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The normalization check reports whether NFC or NFD would change the
            supplied sequence, but it does not normalize automatically. Silent
            normalization would make an encoder stop being a faithful
            representation of the exact string you pasted.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Bidirectional Controls Can Change Display Order Without Changing Stored Order
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Characters such as U+202E RIGHT-TO-LEFT OVERRIDE and the isolate
            controls U+2066 through U+2069 affect how surrounding text is
            displayed. They do not rearrange the underlying code-point sequence,
            so copied text can look different from the order a parser reads.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The inspection table names common bidirectional controls instead of
            placing the invisible control itself in the Display column. That
            makes source review safer while leaving the actual input and output
            untouched. The Unicode Bidirectional Algorithm defines how these
            controls participate in rendering.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            TextEncoder Has to Repair Lone Surrogates Before Producing UTF-8
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            UTF-8 encodes Unicode scalar values; surrogate code points are not
            scalar values. JavaScript strings, however, can contain lone UTF-16
            surrogate code units. Web APIs that turn such strings into Unicode
            scalar text generally use well-formed-string behavior, which can
            replace lone surrogates with U+FFFD.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The inspection table does not pretend those replacement bytes were
            the original character. It labels a lone surrogate as not directly
            representable as a Unicode scalar value.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Unicode, JSON, and JavaScript Define Different Parts of the Problem
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Unicode&apos;s core specification defines code points, surrogate
            code units, surrogate pairs, scalar values, UTF-16, and UTF-8.{" "}
            <a
              href="https://unicode.org/versions/Unicode17.0.0/core-spec/chapter-3/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              Unicode 17 Core Specification, Chapter 3
            </a>
            . Bidirectional formatting is specified separately in{" "}
            <a
              href="https://www.unicode.org/reports/tr9/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              Unicode Standard Annex #9
            </a>
            . For syntax boundaries,{" "}
            <a
              href="https://www.rfc-editor.org/rfc/rfc8259"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              RFC 8259
            </a>{" "}
            covers JSON string escapes and surrogate interoperability, while
            the{" "}
            <a
              href="https://tc39.es/ecma262/multipage/ecmascript-language-lexical-grammar.html"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              ECMAScript lexical grammar
            </a>{" "}
            defines JavaScript&apos;s Unicode escape forms.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/unicode-encoder-decoder" />
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
      <div className="mt-2 text-sm font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}
