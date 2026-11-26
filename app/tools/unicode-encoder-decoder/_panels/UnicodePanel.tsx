"use client";

import { useEffect, useMemo, useState } from "react";
import OutputStatistics from "./OutputStatistics";
import type { PanelProps } from "../workflow-types";
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

export default function UnicodePanel({ incoming, onSend }: PanelProps) {
  const [lastAction, setLastAction] = useState<"decode" | "encode">("decode");
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

  useEffect(() => {
    if (!incoming) return;
    setInput(incoming.value); setOutput(""); setError(""); setNotes([]); setDetected(""); setCopied(false);
  }, [incoming]);

  const encode = () => {
    setLastAction("encode");
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
    setLastAction("decode");
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
    setLastAction("encode");
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
    setLastAction("decode");
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
    setLastAction("decode");
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
    <>
      <div className="min-w-0">
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
          className="mt-4 w-full min-h-[240px] rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)] placeholder:text-gray-400 text-gray-900"
        />

        {stats.bidiControls ? (
          <div
            role="status"
            className="mt-4  text-sm leading-relaxed text-amber-800"
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
        <div className="max-w-80">
          <YoryantraSelect label="Encode as" value={encodeStyle} onChange={value => { setEncodeStyle(value as EncodeStyle); clearResult(); }} options={ENCODE_STYLES.map(({value, label}) => ({value, label}))} />
        </div>
        <p className="mt-2 text-sm text-gray-600">{ENCODE_STYLES.find(style => style.value === encodeStyle)?.detail}</p>

        {encodeStyle !==
        "codepoint" ? (
          <label className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-gray-900">
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
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]"
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

      <div className="mt-6 grid gap-4 sm:grid-cols-2 max-w-2xl">
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
          className={`${lastAction === "decode" ? "yoryantra-btn" : "yoryantra-btn-outline"} shrink-0 whitespace-nowrap`}
        >
          Decode Unicode
        </button>
        <button
          type="button"
          onClick={encode}
          className={`${lastAction === "encode" ? "yoryantra-btn" : "yoryantra-btn-outline"} shrink-0 whitespace-nowrap`}
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
          className="mt-6  text-sm leading-relaxed text-red-700"
        >
          {error}
        </div>
      ) : null}

        {notes.length ? (
          <div
            role="status"
            className="mt-5 text-sm leading-relaxed"
          >
            <h3 className="font-semibold text-gray-900">Review notes</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-amber-800">
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

      <div className="mt-5 min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              Output
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {detected ||
                "Copy the result or send it to Unicode escape sequences."}
            </p>
          </div>

          <button disabled={!output}

              type="button"
              onClick={copyOutput}
              className="yoryantra-btn-outline shrink-0 whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copied
                ? "Copied"
                : "Copy Output"}
            </button>
        </div>

        {input && (
          <OutputStatistics
            idPrefix="unicode-input-stats"
            title="Input statistics"
            description="Counts describe the input as entered, including any literal escape notation."
            items={[
              ["Code-point items", String(stats.sequenceItems)],
              ["UTF-16 units", String(stats.utf16Units)],
              ["UTF-8 bytes", stats.utf8Bytes >= 0 ? String(stats.utf8Bytes) : "Ill-formed"],
              ["Lone surrogates", String(stats.loneSurrogates)],
              ["Bidi controls", String(stats.bidiControls)],
              ["NFC changes?", stats.nfcChanged ? "Yes" : "No"],
              ["NFD changes?", stats.nfdChanged ? "Yes" : "No"],
            ]}
          />
        )}
        <pre className={`mt-4 max-h-[520px] overflow-auto yoryantra-output min-h-[240px] whitespace-pre-wrap break-words font-mono text-sm leading-6 ${detected ? "text-gray-900" : "text-gray-400"}`}>
          {detected ? (output || "(empty string)") : <span className="text-gray-400">{error ? "No output generated. Correct the input and try again." : "Encoded or decoded Unicode text will appear here."}</span>}
        </pre>
      </div>

      {output && <div className="mt-4"><button type="button" className="yoryantra-btn-outline" onClick={() => onSend("escape", output)}>Send output to Unicode escapes</button><p className="mt-2 text-sm text-gray-600">Replaces the receiving input without converting it.</p></div>}

      {input ? (
        <div className="mt-8 min-w-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Input character details
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Showing the first{" "}
              {Math.min(
                entries.length,
                80
              )}{" "}
              input sequence item
              {entries.length === 1
                ? ""
                : "s"}. UTF-8 bytes are shown only for Unicode scalar values.
            </p>
          </div>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">
                    Code point
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    Display
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    UTF-16 units
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    UTF-8 bytes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {entries.map(
                  (entry, index) => (
                    <tr
                      key={`${entry.label}-${index}`}
                    >
                      <td className="px-4 py-3 font-mono">
                        {entry.label}
                      </td>
                      <td className="px-4 py-3">
                        {entry.display}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {entry.utf16}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {entry.utf8}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>


        </div>
      ) : null}


      <section className="mt-12 ">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Unicode Characters, Code Points and Bytes
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A visible character (a grapheme cluster) can contain several Unicode code points. JavaScript strings use UTF-16 code units. UTF-8 encodes each Unicode scalar value as one to four bytes. None of those counts is guaranteed to
            equal the number of visible symbols.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The emoji 😀 is one Unicode scalar value, two UTF-16 code units, and
            four UTF-8 bytes. A family emoji or an accented letter written with
            a combining mark can involve several code points while still
            looking like one user-perceived character.
          </p>
        </div>

        <div className="mt-10 min-w-0">
          <h2 className="text-xl font-semibold text-gray-900">
            Emoji and UTF-16 Escapes
          </h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-gray-50 p-4 text-sm leading-7 text-gray-800">{`Unicode code point
U+1F600

UTF-16 code units
D83D DE00

Four-digit escape representation
\\uD83D\\uDE00

JavaScript code-point escape
\\u{1F600}`}</pre>
          <p className="mt-4 leading-relaxed text-gray-600">
            Four-digit <code className="rounded bg-gray-100 px-1 py-0.5 text-gray-900">\uXXXX</code> escapes represent UTF-16 code units.
            A code point above U+FFFF therefore needs a high-surrogate and
            low-surrogate pair. JavaScript&apos;s brace form can spell the code
            point directly, but that <code className="rounded bg-gray-100 px-1 py-0.5 text-gray-900">\u{"{...}"}</code> form is not JSON
            syntax.
          </p>
        </div>

        <div className="mt-10 min-w-0">
          <h2 className="text-xl font-semibold text-gray-900">
            Unicode Surrogate Pairs and Lone Surrogates
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            U+D800 through U+DFFF are reserved for UTF-16 surrogate mechanics.
            The Unicode Standard calls all values from U+0000 through U+10FFFF
            code points, but excludes surrogate code points from the set of
            Unicode scalar values. An isolated UTF-16 surrogate code unit has
            no standalone character interpretation.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Strict decode mode therefore rejects lone surrogates. Inspection
            mode can preserve them in a JavaScript string when you are
            diagnosing malformed or legacy data, while clearly marking that
            result as ill-formed Unicode text.
          </p>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900">
            Lone Surrogates in JSON
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JSON&apos;s ABNF permits a four-hex-digit <code className="rounded bg-gray-100 px-1 py-0.5 text-gray-900">\uXXXX</code> escape,
            and RFC 8259 notes that observed JSON texts can contain unpaired
            surrogate escapes such as <code className="rounded bg-gray-100 px-1 py-0.5 text-gray-900">\uDEAD</code>. The RFC also warns
            that software behavior for those values is unpredictable.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Strict Unicode decoding rejects isolated surrogates even if their JSON escape syntax is valid. Use inspection mode to keep the original code units for troubleshooting.
          </p>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900">
            JavaScript Code-Point Escapes
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            <code className="rounded bg-gray-100 px-1 py-0.5 text-gray-900">\u{"{1F600}"}</code> is an ECMAScript source escape. The
            hexadecimal number identifies a Unicode code point up to U+10FFFF.
            It does not show the UTF-8 byte sequence <code className="rounded bg-gray-100 px-1 py-0.5 text-gray-900">F0 9F 98 80</code>,
            and it is not a percent-encoded URL sequence.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Choose the representation based on the system you are debugging:
            JavaScript source, JSON-style UTF-16 escapes, U+ notation in
            documentation, or UTF-8 bytes on the wire are different layers.
          </p>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900">
            Unicode Normalization: NFC and NFD
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The visible letter <code className="rounded bg-gray-100 px-1 py-0.5 text-gray-900">é</code> can be represented as U+00E9 or
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

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900">
            Bidirectional Formatting Controls
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

        <div className="mt-10 min-w-0">
          <h2 className="text-xl font-semibold text-gray-900">
            UTF-8 and Lone Surrogates
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            UTF-8 encodes Unicode scalar values; surrogate code points are not
            scalar values. JavaScript strings, however, can contain lone UTF-16
            surrogate code units. TextEncoder replaces isolated surrogates with U+FFFD before encoding them to UTF-8.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The inspection table does not pretend those replacement bytes were
            the original character. It labels a lone surrogate as not directly
            representable as a Unicode scalar value.
          </p>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900">
            Unicode and Escape Syntax References
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

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/unicode-encoder-decoder" presentation="links" />
          </div>
        </div>
      </section>
    </>
  );
}

