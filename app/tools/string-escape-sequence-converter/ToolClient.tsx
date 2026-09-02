"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type ActionMode = "decode" | "encode" | "inspect" | "normalize";
type EscapeStyle = "javascript" | "json" | "unicode" | "hex" | "c";
type OutputMode = "text" | "json" | "markdown" | "csv" | "checklist";
type NewlineMode = "preserve" | "lf" | "crlf";

type CharacterRow = {
  codePointIndex: number;
  utf16Index: number;
  char: string;
  display: string;
  codePoint: number;
  unicode: string;
  utf16: string;
  utf8Bytes: number;
  category: string;
};

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type DecodeResult = {
  text: string;
  issues: Issue[];
  recognizedEscapes: number;
};

type Result = {
  output: string;
  convertedText: string;
  rows: CharacterRow[];
  issues: Issue[];
  inputCodeUnits: number;
  outputCodeUnits: number;
  outputCodePoints: number;
  utf8Bytes: number;
  escapeCount: number;
  lineCount: number;
};

const SAMPLE = String.raw`Hello\nWorld\nUnicode: \u0935\u0930\u0941\u0923\nEmoji: \u{1F680}`;

function styleLabel(style: EscapeStyle) {
  if (style === "javascript") return "JavaScript";
  if (style === "json") return "JSON";
  if (style === "unicode") return "Unicode escape";
  if (style === "hex") return "hex escape";
  return "C-style";
}

function formatHex(value: number, uppercase: boolean) {
  const text = value.toString(16);
  return uppercase ? text.toUpperCase() : text.toLowerCase();
}

function isHighSurrogate(value: number) {
  return value >= 0xd800 && value <= 0xdbff;
}

function isLowSurrogate(value: number) {
  return value >= 0xdc00 && value <= 0xdfff;
}

function isSurrogate(value: number) {
  return value >= 0xd800 && value <= 0xdfff;
}

function isValidCUniversalCharacterName(value: number) {
  if (value > 0x10ffff || isSurrogate(value)) {
    return false;
  }

  if (
    value < 0x00a0 &&
    value !== 0x0024 &&
    value !== 0x0040 &&
    value !== 0x0060
  ) {
    return false;
  }

  return true;
}

function applyNewlineMode(input: string, mode: NewlineMode) {
  if (mode === "preserve") {
    return input;
  }

  const normalized = input.replace(/\r\n|\r|\n/g, "\n");

  return mode === "crlf"
    ? normalized.replace(/\n/g, "\r\n")
    : normalized;
}

function prepareInput(
  input: string,
  trimInput: boolean,
  unwrapQuotes: boolean,
  actionMode: ActionMode
) {
  let value = trimInput ? input.trim() : input;
  const issues: Issue[] = [];

  if (
    unwrapQuotes &&
    (actionMode === "decode" || actionMode === "normalize") &&
    value.length >= 2
  ) {
    const first = value.charAt(0);
    const last = value.charAt(value.length - 1);

    if (
      (first === '"' && last === '"') ||
      (first === "'" && last === "'") ||
      (first === "`" && last === "`")
    ) {
      value = value.slice(1, -1);

      issues.push({
        severity: "info",
        title: "Outer quote characters removed",
        message:
          `Matching ${first} wrapper characters were removed before escape decoding. This is wrapper removal, not evaluation of a complete ${
            first === "`" ? "JavaScript template literal" : "language string literal"
          }.`,
      });

      if (first === "`" && /\$\{/.test(value)) {
        issues.push({
          severity: "warning",
          title: "Template interpolation is not evaluated",
          message:
            "The unwrapped backtick text contains ${...}. No JavaScript is executed and template expressions are not evaluated.",
        });
      }
    }
  }

  return {
    value,
    issues,
  };
}

function pushIssue(
  issues: Issue[],
  enabled: boolean,
  severity: Issue["severity"],
  title: string,
  message: string
) {
  if (enabled) {
    issues.push({
      severity,
      title,
      message,
    });
  }
}

function decodeFixedUnicode(
  input: string,
  index: number,
  issues: Issue[],
  warn: boolean
) {
  const hex = input.slice(index + 2, index + 6);

  if (!/^[0-9A-Fa-f]{4}$/.test(hex)) {
    pushIssue(
      issues,
      warn,
      "warning",
      "Invalid \\u escape",
      `\\u at UTF-16 position ${index} is not followed by exactly four hexadecimal digits.`
    );

    return {
      text: "\\u",
      nextIndex: index + 1,
      recognized: false,
    };
  }

  const first = Number.parseInt(hex, 16);

  if (isHighSurrogate(first)) {
    const nextPrefix = input.slice(index + 6, index + 8);
    const nextHex = input.slice(index + 8, index + 12);

    if (
      nextPrefix === "\\u" &&
      /^[0-9A-Fa-f]{4}$/.test(nextHex)
    ) {
      const second = Number.parseInt(nextHex, 16);

      if (isLowSurrogate(second)) {
        return {
          text:
            String.fromCharCode(first) +
            String.fromCharCode(second),
          nextIndex: index + 11,
          recognized: true,
        };
      }
    }

    pushIssue(
      issues,
      warn,
      "warning",
      "Lone high surrogate escape",
      `\\u${hex} is a high surrogate without a following low-surrogate \\uXXXX escape. The UTF-16 code unit is preserved for inspection.`
    );
  } else if (isLowSurrogate(first)) {
    pushIssue(
      issues,
      warn,
      "warning",
      "Lone low surrogate escape",
      `\\u${hex} is a low surrogate without a preceding high surrogate. The UTF-16 code unit is preserved for inspection.`
    );
  }

  return {
    text: String.fromCharCode(first),
    nextIndex: index + 5,
    recognized: true,
  };
}

function decodeCFixedUniversal(
  input: string,
  index: number,
  issues: Issue[],
  warn: boolean
) {
  const hex =
    input.slice(
      index + 2,
      index + 6
    );

  if (
    !/^[0-9A-Fa-f]{4}$/.test(
      hex
    )
  ) {
    pushIssue(
      issues,
      warn,
      "warning",
      "Invalid C \\u escape",
      `\\u at UTF-16 position ${index} is not followed by exactly four hexadecimal digits.`
    );

    return {
      text: "\\u",
      nextIndex:
        index + 1,
      recognized: false,
    };
  }

  const codePoint =
    Number.parseInt(
      hex,
      16
    );
  const raw =
    `\\u${hex}`;

  if (!isValidCUniversalCharacterName(codePoint)) {
    pushIssue(
      issues,
      warn,
      "high",
      "C universal-character name is outside the allowed range",
      `${raw} is not a valid C universal-character name. C rejects surrogates, values above U+10FFFF, and most values below U+00A0 except U+0024 ($), U+0040 (@), and U+0060 (grave accent). Use a simple, octal or hexadecimal escape for control bytes.`
    );

    return {
      text: raw,
      nextIndex:
        index + 5,
      recognized: false,
    };
  }

  return {
    text:
      String.fromCodePoint(
        codePoint
      ),
    nextIndex:
      index + 5,
    recognized: true,
  };
}

function decodeBracedUnicode(
  input: string,
  index: number,
  style: EscapeStyle,
  issues: Issue[],
  warn: boolean
) {
  const close = input.indexOf("}", index + 3);

  if (close === -1) {
    pushIssue(
      issues,
      warn,
      "warning",
      "Unclosed braced Unicode escape",
      `A \\u{...} sequence beginning at UTF-16 position ${index} has no closing brace.`
    );

    return {
      text: "\\u{",
      nextIndex: index + 2,
      recognized: false,
    };
  }

  const body = input.slice(index + 3, close);
  const raw = input.slice(index, close + 1);

  if (style === "json" || style === "c") {
    pushIssue(
      issues,
      warn,
      "high",
      "Braced Unicode escape is not valid for this style",
      `\\u{...} is not a ${style === "json" ? "JSON string" : "C universal-character-name"} escape. The sequence was kept unchanged.`
    );

    return {
      text: raw,
      nextIndex: close,
      recognized: false,
    };
  }

  if (!/^[0-9A-Fa-f]{1,6}$/.test(body)) {
    pushIssue(
      issues,
      warn,
      "warning",
      "Invalid braced Unicode escape",
      `${raw} must contain one to six hexadecimal digits.`
    );

    return {
      text: raw,
      nextIndex: close,
      recognized: false,
    };
  }

  const codePoint = Number.parseInt(body, 16);

  if (codePoint > 0x10ffff) {
    pushIssue(
      issues,
      warn,
      "high",
      "Unicode code point is too large",
      `${raw} is above Unicode's maximum U+10FFFF.`
    );

    return {
      text: raw,
      nextIndex: close,
      recognized: false,
    };
  }

  if (isSurrogate(codePoint)) {
    pushIssue(
      issues,
      warn,
      "warning",
      "Surrogate code point in braced escape",
      `${raw} names a surrogate code point rather than a Unicode scalar value. It is preserved as the corresponding UTF-16 code unit and deserves interoperability review.`
    );
  }

  return {
    text: String.fromCodePoint(codePoint),
    nextIndex: close,
    recognized: true,
  };
}

function decodeCUniversal(
  input: string,
  index: number,
  issues: Issue[],
  warn: boolean
) {
  const hex = input.slice(index + 2, index + 10);

  if (!/^[0-9A-Fa-f]{8}$/.test(hex)) {
    pushIssue(
      issues,
      warn,
      "warning",
      "Invalid C \\U escape",
      `\\U at UTF-16 position ${index} is not followed by exactly eight hexadecimal digits.`
    );

    return {
      text: "\\U",
      nextIndex: index + 1,
      recognized: false,
    };
  }

  const codePoint = Number.parseInt(hex, 16);
  const raw = `\\U${hex}`;

  if (!isValidCUniversalCharacterName(codePoint)) {
    pushIssue(
      issues,
      warn,
      "high",
      "Invalid C universal-character name",
      `${raw} is outside C's universal-character-name constraints. Surrogates, values above U+10FFFF, and most values below U+00A0 are not permitted.`
    );

    return {
      text: raw,
      nextIndex: index + 9,
      recognized: false,
    };
  }

  return {
    text: String.fromCodePoint(codePoint),
    nextIndex: index + 9,
    recognized: true,
  };
}

function decodeLongUnicodeUtility(
  input: string,
  index: number,
  issues: Issue[],
  warn: boolean
) {
  const hex = input.slice(index + 2, index + 10);

  if (!/^[0-9A-Fa-f]{8}$/.test(hex)) {
    pushIssue(
      issues,
      warn,
      "warning",
      "Invalid \\U escape",
      `\\U at UTF-16 position ${index} is not followed by exactly eight hexadecimal digits.`
    );

    return {
      text: "\\U",
      nextIndex: index + 1,
      recognized: false,
    };
  }

  const codePoint = Number.parseInt(hex, 16);
  const raw = `\\U${hex}`;

  if (codePoint > 0x10ffff) {
    pushIssue(
      issues,
      warn,
      "high",
      "Unicode code point is too large",
      `${raw} is above Unicode's maximum U+10FFFF and was kept unchanged.`
    );

    return {
      text: raw,
      nextIndex: index + 9,
      recognized: false,
    };
  }

  if (isSurrogate(codePoint)) {
    pushIssue(
      issues,
      warn,
      "warning",
      "Surrogate value in 8-digit Unicode escape",
      `${raw} names a surrogate value rather than a Unicode scalar value. The UTF-16 code unit is preserved for inspection.`
    );
  }

  return {
    text: String.fromCodePoint(codePoint),
    nextIndex: index + 9,
    recognized: true,
  };
}

function decodeEscapes(
  input: string,
  style: EscapeStyle,
  warnInvalidEscapes: boolean
): DecodeResult {
  const issues: Issue[] = [];
  let output = "";
  let recognizedEscapes = 0;

  const common: Record<string, string> = {
    "\\": "\\",
    n: "\n",
    r: "\r",
    t: "\t",
  };

  const jsonSimple: Record<string, string> = {
    '"': '"',
    "\\": "\\",
    "/": "/",
    b: "\b",
    f: "\f",
    n: "\n",
    r: "\r",
    t: "\t",
  };

  const javascriptSimple: Record<string, string> = {
    '"': '"',
    "'": "'",
    "`": "`",
    "\\": "\\",
    b: "\b",
    f: "\f",
    n: "\n",
    r: "\r",
    t: "\t",
    v: "\v",
  };

  const cSimple: Record<string, string> = {
    '"': '"',
    "'": "'",
    "?": "?",
    "\\": "\\",
    a: "\x07",
    b: "\b",
    f: "\f",
    n: "\n",
    r: "\r",
    t: "\t",
    v: "\v",
  };

  for (let index = 0; index < input.length; index += 1) {
    const current = input.charAt(index);

    if (current !== "\\") {
      output += current;
      continue;
    }

    const next =
      index + 1 < input.length
        ? input.charAt(index + 1)
        : "";

    if (!next) {
      output += "\\";
      pushIssue(
        issues,
        warnInvalidEscapes,
        "warning",
        "Trailing backslash",
        "The input ends with a single backslash. It was preserved."
      );
      continue;
    }

    if (
      style === "javascript" &&
      (next === "\n" || next === "\r" || next === "\u2028" || next === "\u2029")
    ) {
      if (
        next === "\r" &&
        input.charAt(index + 2) === "\n"
      ) {
        index += 2;
      } else {
        index += 1;
      }

      recognizedEscapes += 1;
      continue;
    }

    const simple =
      style === "json"
        ? jsonSimple
        : style === "c"
        ? cSimple
        : style === "unicode" || style === "hex"
        ? common
        : javascriptSimple;

    if (Object.prototype.hasOwnProperty.call(simple, next)) {
      output += simple[next];
      recognizedEscapes += 1;

      if (style === "c" && next === "?") {
        pushIssue(
          issues,
          warnInvalidEscapes,
          "info",
          "Question-mark escape is valid but usually unnecessary in C23",
          "\\? remains a valid C escape for a question mark. It was historically useful for avoiding trigraph recognition; C23 removed trigraphs, so that particular reason no longer applies."
        );
      }

      index += 1;
      continue;
    }

    if (style === "javascript" && next === "0") {
      const following = input.charAt(index + 2);

      if (!/^[0-9]$/.test(following)) {
        output += "\0";
        recognizedEscapes += 1;
        index += 1;
        continue;
      }
    }

    if (style === "javascript" && /^[0-9]$/.test(next)) {
      output += `\\${next}`;
      pushIssue(
        issues,
        warnInvalidEscapes,
        "warning",
        "Legacy numeric/octal JavaScript escape kept",
        `\\${next} begins a legacy numeric escape form. It is restricted in strict-mode/module code, so legacy octal meaning is not guessed here.`
      );
      index += 1;
      continue;
    }

    if (style === "c" && /^[0-7]$/.test(next)) {
      let end = index + 1;

      while (
        end + 1 < input.length &&
        end - index < 3 &&
        /^[0-7]$/.test(input.charAt(end + 1))
      ) {
        end += 1;
      }

      const octal = input.slice(index + 1, end + 1);
      const value = Number.parseInt(octal, 8);

      if (value <= 0xff) {
        output += String.fromCharCode(value);
        recognizedEscapes += 1;
      } else {
        output += `\\${octal}`;
        pushIssue(
          issues,
          warnInvalidEscapes,
          "high",
          "C octal value is outside ordinary char range",
          `\\${octal} is above 255. In the ordinary unprefixed C string mode modeled here, an octal escape must fit unsigned char; prefixed literals use different corresponding types. The sequence was kept unchanged.`
        );
      }

      index = end;
      continue;
    }

    if (next === "x") {
      if (style === "json" || style === "unicode") {
        output += "\\x";
        pushIssue(
          issues,
          warnInvalidEscapes,
          style === "json" ? "high" : "warning",
          "\\x is outside the selected syntax",
          `\\xHH is not a ${style === "json" ? "JSON" : "Unicode-only"} escape.`
        );
        index += 1;
        continue;
      }

      if (style === "c") {
        let end = index + 2;

        while (
          end < input.length &&
          /^[0-9A-Fa-f]$/.test(input.charAt(end))
        ) {
          end += 1;
        }

        const digits = input.slice(index + 2, end);

        if (!digits) {
          output += "\\x";
          pushIssue(
            issues,
            warnInvalidEscapes,
            "warning",
            "Invalid C hex escape",
            `\\x at UTF-16 position ${index} has no following hexadecimal digit.`
          );
          index += 1;
          continue;
        }

        const value = Number.parseInt(digits, 16);

        if (value <= 0xff) {
          output += String.fromCharCode(value);
          recognizedEscapes += 1;
        } else {
          output += input.slice(index, end);
          pushIssue(
            issues,
            warnInvalidEscapes,
            "high",
            "C hex value is outside ordinary char range",
            `\\x${digits} is above 255. In the ordinary unprefixed C string mode modeled here, a hexadecimal escape must fit unsigned char; prefixed literals use different corresponding types. The sequence was kept unchanged.`
          );
        }

        index = end - 1;
        continue;
      }

      const hex = input.slice(index + 2, index + 4);

      if (/^[0-9A-Fa-f]{2}$/.test(hex)) {
        output += String.fromCharCode(Number.parseInt(hex, 16));
        recognizedEscapes += 1;
        index += 3;
      } else {
        output += "\\x";
        pushIssue(
          issues,
          warnInvalidEscapes,
          "warning",
          "Invalid hex escape",
          `\\x at UTF-16 position ${index} needs exactly two hexadecimal digits in this ${styleLabel(
            style
          )} mode.`
        );
        index += 1;
      }

      continue;
    }

    if (next === "u") {
      if (input.charAt(index + 2) === "{") {
        const decoded = decodeBracedUnicode(
          input,
          index,
          style,
          issues,
          warnInvalidEscapes
        );
        output += decoded.text;
        index = decoded.nextIndex;

        if (decoded.recognized) {
          recognizedEscapes += 1;
        }

        continue;
      }

      const decoded =
        style === "c"
          ? decodeCFixedUniversal(
              input,
              index,
              issues,
              warnInvalidEscapes
            )
          : decodeFixedUnicode(
              input,
              index,
              issues,
              warnInvalidEscapes
            );
      output += decoded.text;
      index = decoded.nextIndex;

      if (decoded.recognized) {
        recognizedEscapes += 1;
      }

      continue;
    }

    if (next === "U" && (style === "c" || style === "unicode")) {
      const decoded =
        style === "c"
          ? decodeCUniversal(
              input,
              index,
              issues,
              warnInvalidEscapes
            )
          : decodeLongUnicodeUtility(
              input,
              index,
              issues,
              warnInvalidEscapes
            );
      output += decoded.text;
      index = decoded.nextIndex;

      if (decoded.recognized) {
        recognizedEscapes += 1;
      }

      continue;
    }

    if (style === "javascript") {
      output += next;
      recognizedEscapes += 1;
      pushIssue(
        issues,
        warnInvalidEscapes,
        "info",
        "JavaScript identity escape",
        `\\${next} decodes to ${next} in a JavaScript string-literal context. Do not assume the same behavior in JSON or other data formats.`
      );
      index += 1;
      continue;
    }

    output += `\\${next}`;
    pushIssue(
      issues,
      warnInvalidEscapes,
      style === "json" ? "high" : "warning",
      style === "json" ? "Invalid JSON escape" : "Unknown escape kept",
      `\\${next} at UTF-16 position ${index} is not recognized in ${styleLabel(
        style
      )} mode and was kept unchanged.`
    );
    index += 1;
  }

  return {
    text: output,
    issues,
    recognizedEscapes,
  };
}

function unicodeEscape(codePoint: number, uppercase: boolean) {
  const hex = formatHex(codePoint, uppercase);

  return codePoint <= 0xffff
    ? `\\u${hex.padStart(4, "0")}`
    : `\\u{${hex}}`;
}

function jsonUnicodeEscape(codePoint: number, uppercase: boolean) {
  if (codePoint <= 0xffff) {
    return `\\u${formatHex(codePoint, uppercase).padStart(4, "0")}`;
  }

  const adjusted = codePoint - 0x10000;
  const high = 0xd800 + (adjusted >> 10);
  const low = 0xdc00 + (adjusted & 0x3ff);

  return `\\u${formatHex(high, uppercase).padStart(
    4,
    "0"
  )}\\u${formatHex(low, uppercase).padStart(4, "0")}`;
}

function cUnicodeEscape(codePoint: number, uppercase: boolean) {
  const hex = formatHex(codePoint, uppercase);

  return codePoint <= 0xffff
    ? `\\u${hex.padStart(4, "0")}`
    : `\\U${hex.padStart(8, "0")}`;
}

function encodeEscapes(
  input: string,
  style: EscapeStyle,
  options: {
    escapeNonAscii: boolean;
    escapeQuotes: boolean;
    escapeSlashes: boolean;
    uppercaseHex: boolean;
  }
) {
  let output = "";

  for (const char of input) {
    const point = char.codePointAt(0);
    const codePoint =
      typeof point === "number" ? point : 0;
    const hex = formatHex(codePoint, options.uppercaseHex);

    if (char === "\n") output += "\\n";
    else if (char === "\r") output += "\\r";
    else if (char === "\t") output += "\\t";
    else if (char === "\b") output += "\\b";
    else if (char === "\f") output += "\\f";
    else if (codePoint === 0x07 && style === "c") output += "\\a";
    else if (char === "\v") {
      output += style === "json" ? "\\u000B" : "\\v";
    } else if (char === '"') {
      output +=
        style === "json" || options.escapeQuotes ? '\\"' : '"';
    } else if (char === "'") {
      output +=
        style !== "json" && options.escapeQuotes ? "\\'" : "'";
    } else if (char === "`") {
      output +=
        style === "javascript" && options.escapeQuotes ? "\\`" : "`";
    } else if (char === "\\") output += "\\\\";
    else if (char === "/") {
      output += options.escapeSlashes ? "\\/" : "/";
    } else if (codePoint === 0) {
      output +=
        style === "json" ||
        style === "unicode"
          ? "\\u0000"
          : style === "c"
          ? "\\000"
          : "\\x00";
    } else if (
      style ===
        "javascript" &&
      (codePoint ===
        0x2028 ||
        codePoint ===
          0x2029)
    ) {
      output +=
        `\\u${hex.padStart(
          4,
          "0"
        )}`;
    } else if (style === "unicode" && codePoint > 0x7e) {
      output += unicodeEscape(codePoint, options.uppercaseHex);
    } else if (
      style === "hex" &&
      codePoint <= 0xff &&
      (options.escapeNonAscii || codePoint < 0x20 || codePoint > 0x7e)
    ) {
      output += `\\x${hex.padStart(2, "0")}`;
    } else if (
      style === "c" &&
      options.escapeNonAscii &&
      codePoint > 0x7e
    ) {
      output +=
        codePoint < 0x00a0 && codePoint <= 0xff
          ? `\\${codePoint.toString(8).padStart(3, "0")}`
          : cUnicodeEscape(codePoint, options.uppercaseHex);
    } else if (
      style === "json" &&
      options.escapeNonAscii &&
      codePoint > 0x7e
    ) {
      output += jsonUnicodeEscape(codePoint, options.uppercaseHex);
    } else if (
      options.escapeNonAscii &&
      codePoint > 0x7e
    ) {
      output += unicodeEscape(codePoint, options.uppercaseHex);
    } else if (codePoint < 0x20 || codePoint === 0x7f) {
      output +=
        style === "json"
          ? jsonUnicodeEscape(codePoint, options.uppercaseHex)
          : style === "c"
          ? `\\${codePoint.toString(8).padStart(3, "0")}`
          : `\\u${hex.padStart(4, "0")}`;
    } else if (isSurrogate(codePoint)) {
      output += `\\u${hex.padStart(4, "0")}`;
    } else {
      output += char;
    }
  }

  return output;
}

function utf16Display(char: string) {
  const values: string[] = [];

  for (let index = 0; index < char.length; index += 1) {
    values.push(
      `0x${char
        .charCodeAt(index)
        .toString(16)
        .toUpperCase()
        .padStart(4, "0")}`
    );
  }

  return values.join(" ");
}

function displayCharacter(char: string) {
  if (char === "\n") return "\\n";
  if (char === "\r") return "\\r";
  if (char === "\t") return "\\t";
  if (char === "\b") return "\\b";
  if (char === "\f") return "\\f";
  if (char === "\v") return "\\v";
  if (char === "\0") return "\\0";
  if (char === " ") return "space";
  return char;
}

function categorize(codePoint: number) {
  if (isSurrogate(codePoint)) return "Lone surrogate";
  if (codePoint < 32 || codePoint === 127) return "Control";
  if (codePoint >= 48 && codePoint <= 57) return "Digit";
  if (
    (codePoint >= 65 && codePoint <= 90) ||
    (codePoint >= 97 && codePoint <= 122)
  ) {
    return "Latin letter";
  }
  if (codePoint <= 127) return "ASCII symbol";
  if (codePoint >= 0x1f300 && codePoint <= 0x1faff) {
    return "Emoji / symbol";
  }
  return "Unicode";
}

function inspectCharacters(input: string) {
  const rows: CharacterRow[] = [];
  let codePointIndex = 0;
  let utf16Index = 0;

  for (const char of input) {
    const point = char.codePointAt(0);
    const codePoint =
      typeof point === "number" ? point : 0;

    rows.push({
      codePointIndex,
      utf16Index,
      char,
      display: displayCharacter(char),
      codePoint,
      unicode: `U+${codePoint
        .toString(16)
        .toUpperCase()
        .padStart(4, "0")}`,
      utf16: utf16Display(char),
      utf8Bytes: new TextEncoder().encode(char).length,
      category: categorize(codePoint),
    });

    codePointIndex += 1;
    utf16Index += char.length;
  }

  return rows;
}

function countBackslashSequences(input: string) {
  let count = 0;

  for (let index = 0; index < input.length; index += 1) {
    if (input.charAt(index) === "\\") {
      count += 1;
      index += 1;
    }
  }

  return count;
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function formatOutput(
  result: Omit<Result, "output">,
  outputMode: OutputMode,
  actionMode: ActionMode,
  escapeStyle: EscapeStyle
) {
  if (outputMode === "text") {
    return result.convertedText;
  }

  if (outputMode === "json") {
    return JSON.stringify(
      {
        action: actionMode,
        style: escapeStyle,
        inputCodeUnits: result.inputCodeUnits,
        outputCodeUnits: result.outputCodeUnits,
        outputCodePoints: result.outputCodePoints,
        utf8Bytes: result.utf8Bytes,
        escapeCount: result.escapeCount,
        lineCount: result.lineCount,
        convertedText: result.convertedText,
        issues: result.issues,
        characters: result.rows.slice(0, 250),
      },
      null,
      2
    );
  }

  if (outputMode === "markdown") {
    const lines = [
      "| # | UTF-16 index | Character | Unicode | UTF-16 | UTF-8 bytes | Type |",
      "| ---: | ---: | --- | --- | --- | ---: | --- |",
    ];

    result.rows.slice(0, 250).forEach((row) => {
      const safe = (value: string) =>
        value
          .replace(/\|/g, "\\|")
          .replace(/\r?\n/g, " ");

      lines.push(
        `| ${row.codePointIndex} | ${row.utf16Index} | ${safe(
          row.display
        )} | ${row.unicode} | ${row.utf16} | ${row.utf8Bytes} | ${row.category} |`
      );
    });

    return lines.join("\n");
  }

  if (outputMode === "csv") {
    const lines = [
      [
        "code_point_index",
        "utf16_index",
        "character",
        "unicode",
        "utf16",
        "utf8_bytes",
        "type",
      ]
        .map(csvCell)
        .join(","),
    ];

    result.rows.slice(0, 250).forEach((row) => {
      lines.push(
        [
          String(row.codePointIndex),
          String(row.utf16Index),
          row.display,
          row.unicode,
          row.utf16,
          String(row.utf8Bytes),
          row.category,
        ]
          .map(csvCell)
          .join(",")
      );
    });

    return lines.join("\n");
  }

  const lines = [
    `[${result.issues.some((issue) => issue.severity === "high") ? " " : "x"}] No high-severity syntax issue`,
    `[${result.rows.some((row) => row.category === "Control") ? " " : "x"}] No control characters`,
    `[${result.rows.some((row) => row.category === "Lone surrogate") ? " " : "x"}] No lone surrogate code units`,
    `[x] Action: ${actionMode}`,
    `[x] Escape style: ${escapeStyle}`,
    `[x] Output code points: ${result.outputCodePoints}`,
    `[x] UTF-8 bytes: ${result.utf8Bytes}`,
  ];

  result.issues.forEach((issue) => {
    lines.push(
      `- ${issue.severity.toUpperCase()}: ${issue.title} — ${issue.message}`
    );
  });

  return lines.join("\n");
}

function buildResult(options: {
  input: string;
  actionMode: ActionMode;
  escapeStyle: EscapeStyle;
  outputMode: OutputMode;
  newlineMode: NewlineMode;
  trimInput: boolean;
  unwrapQuotes: boolean;
  escapeNonAscii: boolean;
  escapeQuotes: boolean;
  escapeSlashes: boolean;
  uppercaseHex: boolean;
  warnInvalidEscapes: boolean;
  warnControlCharacters: boolean;
}): Result {
  const prepared = prepareInput(
    options.input,
    options.trimInput,
    options.unwrapQuotes,
    options.actionMode
  );
  const issues = prepared.issues.slice();
  let convertedText = prepared.value;
  let escapeCount = countBackslashSequences(prepared.value);

  if (
    options.escapeStyle ===
      "json" &&
    (options.actionMode ===
      "decode" ||
      options.actionMode ===
        "normalize") &&
    /[\u0000-\u001F]/.test(
      prepared.value
    )
  ) {
    issues.push({
      severity: "high",
      title:
        "Unescaped control character in JSON string content",
      message:
        "JSON strings cannot contain literal U+0000–U+001F control characters. Encode them with a valid JSON escape such as \\n, \\t or \\u00XX.",
    });
  }

  if (options.actionMode === "decode") {
    const decoded = decodeEscapes(
      prepared.value,
      options.escapeStyle,
      options.warnInvalidEscapes
    );
    convertedText = applyNewlineMode(
      decoded.text,
      options.newlineMode
    );
    escapeCount = decoded.recognizedEscapes;
    decoded.issues.forEach((issue) => issues.push(issue));
  } else if (options.actionMode === "encode") {
    const plain = applyNewlineMode(
      prepared.value,
      options.newlineMode
    );
    convertedText = encodeEscapes(
      plain,
      options.escapeStyle,
      {
        escapeNonAscii: options.escapeNonAscii,
        escapeQuotes: options.escapeQuotes,
        escapeSlashes: options.escapeSlashes,
        uppercaseHex: options.uppercaseHex,
      }
    );
    escapeCount = countBackslashSequences(convertedText);
  } else if (options.actionMode === "normalize") {
    const decoded = decodeEscapes(
      prepared.value,
      options.escapeStyle,
      options.warnInvalidEscapes
    );
    const normalizedText = applyNewlineMode(
      decoded.text,
      options.newlineMode
    );
    convertedText = encodeEscapes(
      normalizedText,
      options.escapeStyle,
      {
        escapeNonAscii: options.escapeNonAscii,
        escapeQuotes: options.escapeQuotes,
        escapeSlashes: options.escapeSlashes,
        uppercaseHex: options.uppercaseHex,
      }
    );
    escapeCount = decoded.recognizedEscapes;
    decoded.issues.forEach((issue) => issues.push(issue));
  } else {
    convertedText = applyNewlineMode(
      prepared.value,
      options.newlineMode
    );
  }

  const rows = inspectCharacters(convertedText);
  const controls = rows.filter(
    (row) => row.category === "Control"
  ).length;
  const surrogates = rows.filter(
    (row) => row.category === "Lone surrogate"
  ).length;

  if (options.warnControlCharacters && controls) {
    issues.push({
      severity: "warning",
      title: "Control characters found",
      message:
        `${controls} control character${
          controls === 1 ? "" : "s"
        } appear in the converted text. They can be meaningful (newline/tab) or accidental hidden data.`,
    });
  }

  if (surrogates) {
    issues.push({
      severity: "warning",
      title:
        "Lone surrogate code units found",
      message:
        `${surrogates} lone UTF-16 surrogate code unit${
          surrogates === 1
            ? ""
            : "s"
        } remain. JSON syntax can contain escaped unpaired surrogates, but Unicode interoperability is unpredictable. Browser TextEncoder replaces lone surrogates with U+FFFD when producing UTF-8, so the displayed UTF-8 byte count reflects that replacement behavior.`,
    });
  }

  if (
    (options.actionMode === "encode" ||
      options.actionMode === "normalize") &&
    options.escapeStyle === "json"
  ) {
    try {
      JSON.parse(`"${convertedText}"`);
    } catch {
      issues.push({
        severity: "high",
        title: "Generated JSON string content is not valid",
        message:
          "Wrapping the generated content in JSON double quotes did not parse. Review quote/backslash handling before using it as JSON.",
      });
    }
  }

  if (
    options.escapeStyle === "hex" &&
    options.escapeNonAscii &&
    rows.some((row) => row.codePoint > 0xff)
  ) {
    issues.push({
      severity: "info",
      title: "Hex mode cannot represent every Unicode character as one \\xHH",
      message:
        "\\xHH represents one 8-bit value in this utility mode. Characters above U+00FF fall back to Unicode escapes rather than being truncated.",
    });
  }

  if (
    options.escapeStyle === "c" &&
    (options.actionMode === "decode" ||
      options.actionMode === "normalize")
  ) {
    issues.push({
      severity: "info",
      title: "C escapes depend on the execution character set",
      message:
        "C mode models ordinary unprefixed string escapes. Octal and hexadecimal values must fit unsigned char; prefixed u8/u/U/L literals have different corresponding ranges and are not simulated here. Character meaning can still depend on the implementation's literal/execution encoding.",
    });
  }

  const resultBase: Omit<Result, "output"> = {
    convertedText,
    rows,
    issues,
    inputCodeUnits: options.input.length,
    outputCodeUnits: convertedText.length,
    outputCodePoints: rows.length,
    utf8Bytes: new TextEncoder().encode(convertedText).length,
    escapeCount,
    lineCount: convertedText.length
      ? convertedText.split(/\r\n|\r|\n/).length
      : 0,
  };

  return {
    ...resultBase,
    output: formatOutput(
      resultBase,
      options.outputMode,
      options.actionMode,
      options.escapeStyle
    ),
  };
}

function getNotes(result: Result) {
  return result.issues;
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [actionMode, setActionMode] =
    useState<ActionMode>("decode");
  const [escapeStyle, setEscapeStyle] =
    useState<EscapeStyle>("javascript");
  const [outputMode, setOutputMode] =
    useState<OutputMode>("text");
  const [newlineMode, setNewlineMode] =
    useState<NewlineMode>("preserve");
  const [trimInput, setTrimInput] = useState(false);
  const [unwrapQuotes, setUnwrapQuotes] = useState(true);
  const [escapeNonAscii, setEscapeNonAscii] = useState(false);
  const [escapeQuotes, setEscapeQuotes] = useState(true);
  const [escapeSlashes, setEscapeSlashes] = useState(false);
  const [uppercaseHex, setUppercaseHex] = useState(true);
  const [warnInvalidEscapes, setWarnInvalidEscapes] =
    useState(true);
  const [warnControlCharacters, setWarnControlCharacters] =
    useState(true);
  const [result, setResult] =
    useState<Result | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(
    () => (result ? getNotes(result) : []),
    [result]
  );

  const clear = () => {
    setResult(null);
    setError("");
    setCopied(false);
  };

  const processString = () => {
    if (!input.length || (trimInput && !input.trim())) {
      setError("Paste escaped text or plain text to convert.");
      setResult(null);
      return;
    }

    try {
      const next = buildResult({
        input,
        actionMode,
        escapeStyle,
        outputMode,
        newlineMode,
        trimInput,
        unwrapQuotes,
        escapeNonAscii,
        escapeQuotes,
        escapeSlashes,
        uppercaseHex,
        warnInvalidEscapes,
        warnControlCharacters,
      });

      setResult(next);
      setError("");
      setCopied(false);
    } catch (caught) {
      setResult(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to convert this escaped string."
      );
    }
  };

  const loadExample = () => {
    setInput(SAMPLE);
    setActionMode("decode");
    setEscapeStyle("javascript");
    setOutputMode("text");
    setNewlineMode("preserve");
    setTrimInput(false);
    setUnwrapQuotes(true);
    setEscapeNonAscii(false);
    setEscapeQuotes(true);
    setEscapeSlashes(false);
    setUppercaseHex(true);
    setWarnInvalidEscapes(true);
    setWarnControlCharacters(true);
    clear();
  };

  const reset = () => {
    setInput("");
    setActionMode("decode");
    setEscapeStyle("javascript");
    setOutputMode("text");
    setNewlineMode("preserve");
    setTrimInput(false);
    setUnwrapQuotes(true);
    setEscapeNonAscii(false);
    setEscapeQuotes(true);
    setEscapeSlashes(false);
    setUppercaseHex(true);
    setWarnInvalidEscapes(true);
    setWarnControlCharacters(true);
    clear();
  };

  const copy = async () => {
    if (!result || !result.output) {
      return;
    }

    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError(
        "The converted output could not be copied. Select and copy it manually."
      );
    }
  };

  return (
    <ToolShell
      title="String Escape Sequence Converter"
      description="Decode, encode, normalize or inspect JavaScript, JSON and C string escapes while keeping control characters, Unicode scalar values, UTF-16 surrogates and syntax-specific edge cases visible."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block text-sm font-semibold text-gray-900">
            Escaped string or plain text
          </label>
          <textarea
            value={input}
            onChange={(event: { target: { value: string } }) => {
              setInput(event.target.value);
              clear();
            }}
            placeholder={SAMPLE}
            spellCheck={false}
            className="mt-3 min-h-[430px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
        </div>

        <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5">
          <YoryantraSelect
            label="Action"
            value={actionMode}
            onChange={(value: string) => {
              setActionMode(value as ActionMode);
              clear();
            }}
            options={[
              { label: "Decode escape sequences", value: "decode" },
              { label: "Encode plain text", value: "encode" },
              { label: "Inspect characters only", value: "inspect" },
              { label: "Decode + re-encode / normalize", value: "normalize" },
            ]}
          />

          <YoryantraSelect
            label="Escape syntax"
            value={escapeStyle}
            onChange={(value: string) => {
              setEscapeStyle(value as EscapeStyle);
              clear();
            }}
            options={[
              { label: "JavaScript / TypeScript string", value: "javascript" },
              { label: "JSON string content", value: "json" },
              { label: "Unicode escape utility", value: "unicode" },
              { label: "Hex escape utility", value: "hex" },
              { label: "C-style string", value: "c" },
            ]}
          />

          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value: string) => {
              setOutputMode(value as OutputMode);
              clear();
            }}
            options={[
              { label: "Converted text", value: "text" },
              { label: "JSON report", value: "json" },
              { label: "Markdown character table", value: "markdown" },
              { label: "CSV character table", value: "csv" },
              { label: "Review checklist", value: "checklist" },
            ]}
          />

          <YoryantraSelect
            label="Line breaks"
            value={newlineMode}
            onChange={(value: string) => {
              setNewlineMode(value as NewlineMode);
              clear();
            }}
            options={[
              { label: "Preserve", value: "preserve" },
              { label: "Normalize to LF", value: "lf" },
              { label: "Normalize to CRLF", value: "crlf" },
            ]}
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="font-semibold text-gray-900">Conversion options</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Toggle
            checked={trimInput}
            onChange={(value) => {
              setTrimInput(value);
              clear();
            }}
            title="Trim outer whitespace"
            text="Off by default because leading/trailing whitespace may be data."
          />
          <Toggle
            checked={unwrapQuotes}
            onChange={(value) => {
              setUnwrapQuotes(value);
              clear();
            }}
            title="Remove matching outer quotes while decoding"
            text="Removes the wrapper only; it never evaluates JavaScript/template expressions."
          />
          <Toggle
            checked={escapeNonAscii}
            onChange={(value) => {
              setEscapeNonAscii(value);
              clear();
            }}
            title="Escape non-ASCII while encoding"
            text="JSON uses surrogate pairs for supplementary characters; C uses \\u/\\U where permitted and simple or numeric escapes for low control values."
          />
          <Toggle
            checked={escapeQuotes}
            onChange={(value) => {
              setEscapeQuotes(value);
              clear();
            }}
            title="Escape quote characters"
            text="JSON double quotes are always escaped because otherwise the generated string content would be invalid."
          />
          <Toggle
            checked={escapeSlashes}
            onChange={(value) => {
              setEscapeSlashes(value);
              clear();
            }}
            title="Escape forward slashes"
            text="Usually unnecessary; useful only for consumers that deliberately prefer \\/."
          />
          <Toggle
            checked={uppercaseHex}
            onChange={(value) => {
              setUppercaseHex(value);
              clear();
            }}
            title="Uppercase hexadecimal digits"
            text="Changes spelling only, not the decoded value."
          />
          <Toggle
            checked={warnInvalidEscapes}
            onChange={(value) => {
              setWarnInvalidEscapes(value);
              clear();
            }}
            title="Report invalid/ambiguous escapes"
            text="Keep enabled when diagnosing copied strings from an unknown format."
          />
          <Toggle
            checked={warnControlCharacters}
            onChange={(value) => {
              setWarnControlCharacters(value);
              clear();
            }}
            title="Report control characters"
            text="Useful for hidden newlines, tabs, NUL and pasted control bytes."
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={processString}
          className="yoryantra-btn"
        >
          Convert String
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
          onClick={reset}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {error ? (
        <div className="mt-5 whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Stat label="Escapes" value={String(result.escapeCount)} />
            <Stat
              label="Code points"
              value={String(result.outputCodePoints)}
            />
            <Stat
              label="UTF-16 units"
              value={String(result.outputCodeUnits)}
            />
            <Stat
              label="UTF-8 bytes"
              value={String(result.utf8Bytes)}
            />
            <Stat label="Lines" value={String(result.lineCount)} />
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Output
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Output format: {outputMode}. Character inspection describes
                  the converted text, not the original escape spelling.
                </p>
              </div>
              <button
                type="button"
                onClick={copy}
                className="yoryantra-btn-outline whitespace-nowrap"
              >
                {copied ? "Copied" : "Copy Output"}
              </button>
            </div>

            <pre className="yoryantra-output mt-4 min-h-[300px] max-h-[680px] overflow-auto whitespace-pre-wrap break-words font-mono text-sm">
              {result.output}
            </pre>
          </div>

          {notes.length ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h3 className="font-semibold text-gray-900">
                Syntax and Unicode review
              </h3>
              <div className="mt-4 space-y-3">
                {notes.map((issue, index) => (
                  <div
                    key={`${issue.title}-${index}`}
                    className="rounded-xl border border-amber-200 bg-white/60 p-4 text-sm leading-relaxed text-gray-700"
                  >
                    <strong>
                      {issue.severity.toUpperCase()} · {issue.title}
                    </strong>
                    <p className="mt-1">{issue.message}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {result.rows.length ? (
            <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-left text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">#</th>
                    <th className="px-4 py-3 font-semibold">UTF-16 index</th>
                    <th className="px-4 py-3 font-semibold">Character</th>
                    <th className="px-4 py-3 font-semibold">Unicode</th>
                    <th className="px-4 py-3 font-semibold">UTF-16</th>
                    <th className="px-4 py-3 font-semibold">UTF-8 bytes</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {result.rows.slice(0, 100).map((row) => (
                    <tr key={`${row.utf16Index}-${row.unicode}`}>
                      <td className="px-4 py-3">{row.codePointIndex}</td>
                      <td className="px-4 py-3">{row.utf16Index}</td>
                      <td className="px-4 py-3 font-mono">{row.display}</td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {row.unicode}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {row.utf16}
                      </td>
                      <td className="px-4 py-3">{row.utf8Bytes}</td>
                      <td className="px-4 py-3">{row.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {result.rows.length > 100 ? (
                <p className="p-4 text-sm text-gray-500">
                  Showing the first 100 code-point rows in the browser table.
                  JSON/CSV/Markdown output can include up to 250 inspection
                  rows.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : (
        <pre className="yoryantra-output mt-8 min-h-[300px] whitespace-pre-wrap break-words text-sm">
          Converted text, syntax diagnostics, Unicode/UTF-16 inspection and
          export output will appear here.
        </pre>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        The pasted string is processed in the browser. JavaScript is not
        evaluated, C is not compiled, template expressions are not executed,
        and the text is not sent to a conversion API. Site-wide analytics or
        advertising scripts, if enabled, are separate from this operation.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            The Backslash Does Not Mean the Same Thing in Every String Format
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            <code>\n</code> is familiar across several languages, but the sets
            quickly diverge. JSON allows a deliberately small escape grammar.
            JavaScript adds forms such as <code>\xHH</code>,{" "}
            <code>\u{"{...}"}</code>, line continuation and some identity
            escapes. C has octal, greedy hexadecimal and{" "}
            <code>\UXXXXXXXX</code> universal-character names.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Decoding every backslash with one universal regex can make malformed
            JSON look valid or turn C bytes into invented Unicode characters.
            The selected syntax determines which transformations are allowed.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            JSON Has No \xHH or \u{"{1F680}"} Escape
          </h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            JSON strings use <code>\uXXXX</code> UTF-16 code-unit escapes. A
            supplementary character such as 🚀 is represented with two{" "}
            <code>\uXXXX</code> surrogate escapes when escaped, not the
            JavaScript code-point form <code>\u{"{1F680}"}</code>.
          </p>
          <p className="mt-4 leading-relaxed text-gray-700">
            A useful validation check is to wrap generated JSON string content
            in double quotes and pass it through <code>JSON.parse</code>. That
            catches a quote, backslash or control character that would make the
            generated JSON string invalid.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            One Visible Character Can Be Two UTF-16 Code Units
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JavaScript strings are indexed as UTF-16 code units. Many emoji and
            historic-script characters are outside the Basic Multilingual Plane
            and use a surrogate pair, so a single Unicode code point can make{" "}
            <code>string.length</code> increase by two.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The inspection table shows both a code-point row index and the
            original UTF-16 offset so copied error positions and JavaScript
            indexes are easier to reconcile.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Lone Surrogates Are a Real Interoperability Edge Case
          </h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            JSON grammar can carry escaped UTF-16 surrogate code units even
            when they do not form a valid pair. Software differs in how well
            such strings survive encoding, databases, APIs and Unicode
            normalization.
          </p>
          <p className="mt-4 leading-relaxed text-gray-700">
            Lone surrogate escapes are kept visible during diagnosis rather
            than silently replaced or combined. That makes the malformed or
            non-interoperable code-unit sequence easier to trace back to its
            source.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Newline Normalization Must Happen Before Encoding Plain Text
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Once a newline has become the two visible characters{" "}
            <code>\</code> and <code>n</code>, changing LF to CRLF no longer
            affects it. The encode path therefore normalizes actual line
            separators first and only then turns them into escape sequences.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Normalize mode does the reverse in a deliberate order: decode →
            normalize actual line breaks → encode using the selected syntax.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            C Hex Escapes Are Greedy
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            In C, <code>\x</code> consumes hexadecimal digits until the run
            ends; it is not inherently limited to two digits. The resulting
            value is then interpreted through the C implementation&apos;s
            character model.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The C mode here models an ordinary unprefixed string, so an octal
            or hexadecimal escape must fit the range of unsigned char. Larger
            values stay visible as high-severity findings instead of being
            assigned an invented browser-Unicode meaning. Prefixed u8, u, U and
            L literals have different corresponding ranges and are outside this
            mode.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            C Universal-Character Names Are Not General Control-Byte Escapes
          </h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            C places extra constraints on <code>\uXXXX</code> and{" "}
            <code>\UXXXXXXXX</code>. Surrogates are not permitted, values above
            U+10FFFF are not permitted, and most code points below U+00A0 cannot
            be written as universal-character names.
          </p>
          <p className="mt-4 leading-relaxed text-gray-700">
            Control characters therefore use the ordinary C escapes such as{" "}
            <code>\a</code>, <code>\n</code> and <code>\t</code>, or a
            numeric octal/hex escape when no simple spelling exists. Fixed
            three-digit octal output avoids both an invalid low-value{" "}
            <code>\u</code> escape and the greedy-length problem of{" "}
            <code>\x</code>.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Removing Quotes Is Not the Same as Parsing a Language Literal
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            When “unwrap matching quotes” is enabled, only the first and last
            matching quote characters are removed before escape conversion.
            JavaScript source is not evaluated, adjacent literals are not
            concatenated, template expressions are not processed, and a C
            compiler&apos;s source/execution character sets are not simulated.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <ReferenceCard
            title="ECMAScript lexical grammar"
            href="https://tc39.es/ecma262/multipage/ecmascript-language-lexical-grammar.html"
            text="Primary reference for JavaScript string escape sequences, Unicode escapes, hex escapes and line continuations."
          />
          <ReferenceCard
            title="RFC 8259 — JSON"
            href="https://www.rfc-editor.org/rfc/rfc8259.html"
            text="Defines JSON string escaping and the interoperability concern around unpaired surrogate sequences."
          />
          <ReferenceCard
            title="Unicode Standard"
            href="https://www.unicode.org/versions/latest/"
            text="Reference for Unicode code points, scalar values and UTF character representation."
          />
          <ReferenceCard
            title="C23 working draft — WG14 N3096"
            href="https://www.open-std.org/jtc1/sc22/wg14/www/docs/n3096.pdf"
            text="Public WG14 draft showing C escape-sequence grammar and universal-character-name constraints, including the low-value, surrogate and U+10FFFF limits."
          />
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Keep Working With the String
          </h2>

          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/string-escape-sequence-converter" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function Toggle({
  checked,
  onChange,
  title,
  text,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  title: string;
  text: string;
}) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm leading-relaxed text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event: { target: { checked: boolean } }) =>
          onChange(event.target.checked)
        }
        className="mt-1"
      />
      <span>
        <strong className="text-gray-900">{title}</strong>
        <span className="mt-1 block text-gray-500">{text}</span>
      </span>
    </label>
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
      <div className="mt-2 break-words text-lg font-semibold text-gray-900">
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
      <p className="mt-3 text-sm leading-relaxed text-gray-600">{text}</p>
    </div>
  );
}
