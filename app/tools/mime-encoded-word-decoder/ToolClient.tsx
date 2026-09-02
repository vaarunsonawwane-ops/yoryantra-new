"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type ActionMode = "decode" | "encode";
type EncodingMode = "B" | "Q" | "auto";
type CharsetMode =
  | "UTF-8"
  | "ISO-8859-1"
  | "windows-1252"
  | "US-ASCII";

type EncodedWord = {
  raw: string;
  charset: string;
  encoding: "B" | "Q";
  encodedText: string;
  decodedText: string;
  start: number;
  end: number;
  byteLength: number;
  errors: string[];
  warnings: string[];
};

type MimeIssue = {
  severity: "warning" | "note";
  title: string;
  message: string;
};

type MimeResult = {
  output: string;
  decodedText: string;
  encodedText: string;
  words: EncodedWord[];
  issues: MimeIssue[];
  unfoldedInput: string;
};

const SAMPLE_HEADER =
  "Subject: =?UTF-8?B?U25laGEg4oCTIFlvcnlhbnRyYQ==?=";

const WINDOWS_1252_DECODE: Record<number, number> = {
  0x80: 0x20ac,
  0x82: 0x201a,
  0x83: 0x0192,
  0x84: 0x201e,
  0x85: 0x2026,
  0x86: 0x2020,
  0x87: 0x2021,
  0x88: 0x02c6,
  0x89: 0x2030,
  0x8a: 0x0160,
  0x8b: 0x2039,
  0x8c: 0x0152,
  0x8e: 0x017d,
  0x91: 0x2018,
  0x92: 0x2019,
  0x93: 0x201c,
  0x94: 0x201d,
  0x95: 0x2022,
  0x96: 0x2013,
  0x97: 0x2014,
  0x98: 0x02dc,
  0x99: 0x2122,
  0x9a: 0x0161,
  0x9b: 0x203a,
  0x9c: 0x0153,
  0x9e: 0x017e,
  0x9f: 0x0178,
};

const WINDOWS_1252_ENCODE: Record<number, number> = {
  0x20ac: 0x80,
  0x201a: 0x82,
  0x0192: 0x83,
  0x201e: 0x84,
  0x2026: 0x85,
  0x2020: 0x86,
  0x2021: 0x87,
  0x02c6: 0x88,
  0x2030: 0x89,
  0x0160: 0x8a,
  0x2039: 0x8b,
  0x0152: 0x8c,
  0x017d: 0x8e,
  0x2018: 0x91,
  0x2019: 0x92,
  0x201c: 0x93,
  0x201d: 0x94,
  0x2022: 0x95,
  0x2013: 0x96,
  0x2014: 0x97,
  0x02dc: 0x98,
  0x2122: 0x99,
  0x0161: 0x9a,
  0x203a: 0x9b,
  0x0153: 0x9c,
  0x017e: 0x9e,
  0x0178: 0x9f,
};

function unfoldHeader(input: string) {
  return input.replace(/\r?\n[ \t]+/g, " ");
}

function splitHeaderName(input: string) {
  const match = input.match(/^([!#$%&'*+\-.^_`|~0-9A-Za-z]+):[ \t]*([\s\S]*)$/);

  if (!match) {
    return {
      name: "",
      body: input,
    };
  }

  return {
    name: match[1],
    body: match[2],
  };
}

function decodeBase64Word(value: string) {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!value) {
    errors.push("Encoded-text is empty.");
    return {
      bytes: new Uint8Array(),
      errors,
      warnings,
    };
  }

  if (/[\s?]/.test(value)) {
    errors.push("B encoded-text contains whitespace or ?, which is not valid encoded-text.");
  }

  if (/[^A-Za-z0-9+/=]/.test(value)) {
    errors.push("B encoded-text contains characters outside the standard Base64 alphabet.");
  }

  const padding = (value.match(/=+$/) || [""])[0];

  if (padding.length > 2) {
    errors.push("Base64 uses more than two trailing padding characters.");
  }

  if (value.indexOf("=") !== -1 && !/=+$/.test(value)) {
    errors.push("Base64 padding appears before the end of encoded-text.");
  }

  if (value.length % 4 === 1) {
    errors.push("Base64 length cannot be valid because it has a remainder of 1.");
  }

  if (!errors.length && value.length % 4 !== 0) {
    warnings.push(
      "Base64 padding is omitted. Some mail software accepts this, but canonical Base64 normally includes the required trailing padding."
    );
  }

  if (errors.length) {
    return {
      bytes: new Uint8Array(),
      errors,
      warnings,
    };
  }

  try {
    const padded = value + "=".repeat((4 - (value.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return {
      bytes,
      errors,
      warnings,
    };
  } catch {
    errors.push("Browser Base64 decoding failed.");

    return {
      bytes: new Uint8Array(),
      errors,
      warnings,
    };
  }
}

function decodeQWord(value: string) {
  const errors: string[] = [];
  const warnings: string[] = [];
  const bytes: number[] = [];

  if (!value) {
    errors.push("Encoded-text is empty.");
    return {
      bytes: new Uint8Array(),
      errors,
      warnings,
    };
  }

  for (let index = 0; index < value.length; index += 1) {
    const char = value.charAt(index);
    const code = value.charCodeAt(index);

    if (char === "?") {
      errors.push("Q encoded-text contains ?, which cannot appear literally.");
      continue;
    }

    if (char === " " || char === "\t" || code < 33 || code > 126) {
      errors.push("Q encoded-text contains whitespace or a non-printable/non-ASCII character.");
      continue;
    }

    if (char === "_") {
      bytes.push(0x20);
      continue;
    }

    if (char === "=") {
      const pair = value.slice(index + 1, index + 3);

      if (!/^[0-9A-Fa-f]{2}$/.test(pair)) {
        errors.push(`Malformed Q escape at character ${index + 1}; "=" must be followed by two hexadecimal digits.`);
        continue;
      }

      bytes.push(Number.parseInt(pair, 16));
      index += 2;
      continue;
    }

    bytes.push(code);
  }

  return {
    bytes: new Uint8Array(bytes),
    errors,
    warnings,
  };
}

function latin1(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => String.fromCharCode(byte))
    .join("");
}

function windows1252(bytes: Uint8Array) {
  const warnings: string[] = [];

  const text = Array.from(bytes)
    .map((byte) => {
      if (
        [0x81, 0x8d, 0x8f, 0x90, 0x9d].indexOf(byte) !== -1
      ) {
        warnings.push(
          `Windows-1252 byte 0x${byte.toString(16).toUpperCase()} is undefined.`
        );
        return "�";
      }

      if (
        Object.prototype.hasOwnProperty.call(
          WINDOWS_1252_DECODE,
          byte
        )
      ) {
        return String.fromCodePoint(WINDOWS_1252_DECODE[byte]);
      }

      return String.fromCharCode(byte);
    })
    .join("");

  return {
    text,
    warnings,
  };
}

function normalizeCharset(value: string) {
  const clean = value.trim().toLowerCase();

  if (clean === "utf8" || clean === "utf-8") return "utf-8";
  if (
    clean === "iso-8859-1" ||
    clean === "iso8859-1" ||
    clean === "latin1" ||
    clean === "latin-1"
  ) {
    return "iso-8859-1";
  }
  if (
    clean === "windows-1252" ||
    clean === "windows1252" ||
    clean === "cp1252"
  ) {
    return "windows-1252";
  }
  if (clean === "us-ascii" || clean === "ascii") return "us-ascii";

  return clean;
}

function decodeCharset(bytes: Uint8Array, charset: string) {
  const normalized = normalizeCharset(charset);
  const errors: string[] = [];
  const warnings: string[] = [];

  if (normalized === "iso-8859-1") {
    return {
      text: latin1(bytes),
      errors,
      warnings,
    };
  }

  if (normalized === "windows-1252") {
    const decoded = windows1252(bytes);

    return {
      text: decoded.text,
      errors,
      warnings: decoded.warnings,
    };
  }

  if (normalized === "us-ascii") {
    const text = Array.from(bytes)
      .map((byte) => {
        if (byte > 0x7f) {
          errors.push(
            `US-ASCII encoded-word contains byte 0x${byte
              .toString(16)
              .toUpperCase()} above 0x7F.`
          );
          return "�";
        }

        return String.fromCharCode(byte);
      })
      .join("");

    return {
      text,
      errors,
      warnings,
    };
  }

  try {
    const text = new TextDecoder(normalized, {
      fatal: true,
    }).decode(bytes);

    return {
      text,
      errors,
      warnings,
    };
  } catch {
    try {
      const text = new TextDecoder(normalized).decode(bytes);

      errors.push(
        normalized === "utf-8"
          ? "Byte sequence is not valid UTF-8; replacement characters may appear."
          : `Charset "${charset}" could not be decoded strictly; replacement characters may appear.`
      );

      return {
        text,
        errors,
        warnings,
      };
    } catch {
      errors.push(
        `Charset "${charset}" is not supported by this browser's TextDecoder. Encoded bytes are shown as Latin-1 code points only as a diagnostic fallback.`
      );

      return {
        text: latin1(bytes),
        errors,
        warnings,
      };
    }
  }
}

function decodeWord(
  raw: string,
  charset: string,
  encoding: "B" | "Q",
  encodedText: string,
  start: number,
  end: number
): EncodedWord {
  const encoded =
    encoding === "B"
      ? decodeBase64Word(encodedText)
      : decodeQWord(encodedText);
  const decoded = decodeCharset(encoded.bytes, charset);
  const errors = encoded.errors.concat(decoded.errors);
  const warnings = encoded.warnings.concat(decoded.warnings);

  if (raw.length > 75) {
    errors.push(
      `Encoded-word is ${raw.length} characters long. RFC 2047 limits an encoded-word to 75 characters including =?charset?encoding?encoded-text?=.`
    );
  }

  return {
    raw,
    charset,
    encoding,
    encodedText,
    decodedText: encoded.errors.length ? raw : decoded.text,
    start,
    end,
    byteLength: encoded.bytes.length,
    errors,
    warnings,
  };
}

function parseEncodedWords(input: string) {
  const words: EncodedWord[] = [];
  const regex = /=\?([^?\s]+)\?([bBqQ])\?([^?\s]+)\?=/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    words.push(
      decodeWord(
        match[0],
        match[1],
        match[2].toUpperCase() as "B" | "Q",
        match[3],
        match.index,
        match.index + match[0].length
      )
    );
  }

  return words;
}

function decodeDisplayText(
  input: string,
  words: EncodedWord[],
  joinAdjacent: boolean
) {
  if (!words.length) {
    return input;
  }

  let output = "";
  let cursor = 0;

  words.forEach((word, index) => {
    const between = input.slice(cursor, word.start);
    const previous = index > 0 ? words[index - 1] : null;
    const onlyLinearWhitespace =
      Boolean(previous) && /^[ \t]+$/.test(between);

    if (!(joinAdjacent && onlyLinearWhitespace)) {
      output += between;
    }

    output += word.decodedText;
    cursor = word.end;
  });

  output += input.slice(cursor);

  return output;
}

function malformedCandidates(input: string, validWords: EncodedWord[]) {
  const issues: string[] = [];
  let cursor = 0;

  while (cursor < input.length) {
    const start = input.indexOf("=?", cursor);

    if (start === -1) {
      break;
    }

    const valid = validWords.some((word) => word.start === start);

    if (!valid) {
      const end = input.indexOf("?=", start + 2);
      const sample =
        end === -1
          ? input.slice(start, Math.min(input.length, start + 90))
          : input.slice(start, Math.min(input.length, end + 2));

      issues.push(sample);
    }

    cursor = start + 2;
  }

  return issues;
}

function buildDecodeIssues(
  originalInput: string,
  unfoldedInput: string,
  words: EncodedWord[]
) {
  const issues: MimeIssue[] = [];
  const malformed = malformedCandidates(unfoldedInput, words);
  const physicalLines =
    originalInput
      .replace(/\r\n?/g, "\n")
      .split("\n");
  const overHardLimit =
    physicalLines.filter(
      (line) =>
        line.length > 998
    ).length;
  const overRecommended =
    physicalLines.filter(
      (line) =>
        line.length > 78
    ).length;

  if (overHardLimit) {
    issues.push({
      severity: "warning",
      title: "Header line exceeds RFC 5322 hard limit",
      message:
        `${overHardLimit} physical line${
          overHardLimit === 1 ? "" : "s"
        } exceed 998 characters before CRLF. A conforming Internet message must keep each line within that limit.`,
    });
  } else if (overRecommended) {
    issues.push({
      severity: "note",
      title: "Long physical header line",
      message:
        `${overRecommended} physical line${
          overRecommended === 1 ? "" : "s"
        } exceed RFC 5322's recommended 78-character line length. Folding may improve interoperability/readability.`,
    });
  }

  if (originalInput !== unfoldedInput) {
    issues.push({
      severity: "note",
      title: "Header folding was unfolded",
      message:
        "CRLF/LF followed by whitespace was unfolded to one space before RFC 2047 decoding. Folding belongs to the surrounding email header syntax, not to the encoded bytes.",
    });
  }

  if (!words.length) {
    issues.push({
      severity: "note",
      title: "No valid encoded-word recognized",
      message:
        "No complete =?charset?B/Q?encoded-text?= token matching this decoder's RFC 2047 grammar was found.",
    });
  }

  if (malformed.length) {
    issues.push({
      severity: "warning",
      title: "Encoded-word-like text is malformed",
      message:
        `${malformed.length} sequence${
          malformed.length === 1 ? "" : "s"
        } begin with "=?", but do not form valid encoded-word syntax. Example: ${malformed[0]}`,
    });
  }

  words.forEach((word, index) => {
    word.errors.forEach((error) => {
      issues.push({
        severity: "warning",
        title: `Encoded-word ${index + 1} needs review`,
        message: error,
      });
    });

    word.warnings.forEach((warning) => {
      issues.push({
        severity: "note",
        title: `Encoded-word ${index + 1}`,
        message: warning,
      });
    });
  });

  const charsets = Array.from(
    new Set(words.map((word) => normalizeCharset(word.charset)))
  );

  if (charsets.length > 1) {
    issues.push({
      severity: "note",
      title: "Multiple charsets in one header value",
      message:
        `This value uses ${charsets.join(
          ", "
        )}. Adjacent encoded-words can legally use different charsets, but mixed legacy encodings are worth checking when text looks wrong.`,
    });
  }

  if (/^(Received|Return-Path):/i.test(unfoldedInput)) {
    issues.push({
      severity: "warning",
      title: "Header field has restricted encoded-word use",
      message:
        "RFC 2047 encoded-words are not a generic transformation for every header field. Received is specifically not an encoded-word field; use the exact field grammar when validating complete messages.",
    });
  }

  if (
    /;\s*(?:filename|name)\s*=\s*=\?/i.test(unfoldedInput)
  ) {
    issues.push({
      severity: "warning",
      title: "Encoded-word used like a MIME parameter",
      message:
        "RFC 2047 encoded-words are not the standard mechanism for MIME parameter values such as filename=. Parameter encoding uses other MIME mechanisms (for example RFC 2231/5987-style conventions depending on the context).",
    });
  }

  issues.push({
    severity: "note",
    title: "Display decoding is contextual",
    message:
      "RFC 2047 allows encoded-words only in defined message-header contexts. This tool decodes recognizable tokens for diagnostics; it is not a complete RFC 5322 address/header parser.",
  });

  return issues;
}

function encodeBytes(text: string, charset: CharsetMode) {
  if (charset === "UTF-8") {
    return new TextEncoder().encode(text);
  }

  const bytes: number[] = [];

  for (const char of Array.from(text)) {
    const codePoint = char.codePointAt(0) as number;

    if (charset === "US-ASCII") {
      if (codePoint > 0x7f) {
        throw new Error(
          `Character "${char}" cannot be represented in US-ASCII. Choose UTF-8 or another compatible charset.`
        );
      }

      bytes.push(codePoint);
      continue;
    }

    if (charset === "ISO-8859-1") {
      if (codePoint > 0xff) {
        throw new Error(
          `Character "${char}" cannot be represented in ISO-8859-1. Choose UTF-8.`
        );
      }

      bytes.push(codePoint);
      continue;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        WINDOWS_1252_ENCODE,
        codePoint
      )
    ) {
      bytes.push(WINDOWS_1252_ENCODE[codePoint]);
      continue;
    }

    if (codePoint <= 0xff && [0x81, 0x8d, 0x8f, 0x90, 0x9d].indexOf(codePoint) === -1) {
      bytes.push(codePoint);
      continue;
    }

    throw new Error(
      `Character "${char}" cannot be represented in Windows-1252. Choose UTF-8.`
    );
  }

  return new Uint8Array(bytes);
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return btoa(binary);
}

function qEncodeByte(byte: number) {
  if (byte === 0x20) return "_";

  if (
    (byte >= 0x41 && byte <= 0x5a) ||
    (byte >= 0x61 && byte <= 0x7a) ||
    (byte >= 0x30 && byte <= 0x39)
  ) {
    return String.fromCharCode(byte);
  }

  return `=${byte.toString(16).toUpperCase().padStart(2, "0")}`;
}

function bytesToQ(bytes: Uint8Array) {
  return Array.from(bytes).map(qEncodeByte).join("");
}

function encodedWordLength(
  charset: CharsetMode,
  encoding: "B" | "Q",
  encodedText: string
) {
  return `=?${charset}?${encoding}?${encodedText}?=`.length;
}

function splitTextForWords(
  text: string,
  charset: CharsetMode,
  encoding: "B" | "Q"
) {
  const words: string[] = [];
  let current = "";

  const flush = () => {
    if (!current) return;

    const bytes = encodeBytes(current, charset);
    const encoded =
      encoding === "B" ? bytesToBase64(bytes) : bytesToQ(bytes);

    words.push(`=?${charset}?${encoding}?${encoded}?=`);
    current = "";
  };

  for (const char of Array.from(text)) {
    const candidate = current + char;
    const bytes = encodeBytes(candidate, charset);
    const encoded =
      encoding === "B" ? bytesToBase64(bytes) : bytesToQ(bytes);

    if (
      current &&
      encodedWordLength(charset, encoding, encoded) > 75
    ) {
      flush();
      current = char;
    } else {
      current = candidate;
    }

    const singleBytes = encodeBytes(current, charset);
    const singleEncoded =
      encoding === "B"
        ? bytesToBase64(singleBytes)
        : bytesToQ(singleBytes);

    if (encodedWordLength(charset, encoding, singleEncoded) > 75) {
      throw new Error(
        `A single character cannot fit inside the RFC 2047 75-character encoded-word limit using ${charset}/${encoding}.`
      );
    }
  }

  flush();

  return words;
}

function chooseEncoding(text: string, charset: CharsetMode) {
  const bytes = encodeBytes(text, charset);
  const b = bytesToBase64(bytes);
  const q = bytesToQ(bytes);

  return q.length <= b.length ? "Q" : "B";
}

function encodeHeaderValue(
  input: string,
  charset: CharsetMode,
  encodingMode: EncodingMode,
  preserveHeaderName: boolean
) {
  const unfolded = unfoldHeader(input.trim());
  const split = splitHeaderName(unfolded);
  const headerName = preserveHeaderName ? split.name : "";
  const body = preserveHeaderName && split.name ? split.body : unfolded;

  if (!body) {
    throw new Error("Enter text to encode.");
  }

  const selected =
    encodingMode === "auto"
      ? chooseEncoding(body, charset)
      : encodingMode;
  const words = splitTextForWords(body, charset, selected);
  const value = words.join("\r\n ");

  return {
    encodedText: headerName ? `${headerName}: ${value}` : value,
    encoding: selected,
    wordCount: words.length,
  };
}

function buildResult(options: {
  input: string;
  actionMode: ActionMode;
  encodingMode: EncodingMode;
  charset: CharsetMode;
  unfold: boolean;
  joinAdjacent: boolean;
  preserveHeaderName: boolean;
}): MimeResult {
  const prepared = options.unfold
    ? unfoldHeader(options.input.trim())
    : options.input.trim();

  if (options.actionMode === "encode") {
    const encoded = encodeHeaderValue(
      options.input,
      options.charset,
      options.encodingMode,
      options.preserveHeaderName
    );

    return {
      output: encoded.encodedText,
      decodedText: options.input,
      encodedText: encoded.encodedText,
      words: [],
      unfoldedInput: prepared,
      issues: [
        {
          severity: "note",
          title: `${encoded.encoding} encoding selected`,
          message:
            `Output was split into ${encoded.wordCount} encoded-word${
              encoded.wordCount === 1 ? "" : "s"
            } so each token stays within RFC 2047's 75-character limit.`,
        },
        {
          severity: "note",
          title: "Generated folding",
          message:
            "Multiple encoded-words are separated with CRLF + space. Mail software unfolds that header and ignores linear whitespace between adjacent encoded-words for display.",
        },
      ],
    };
  }

  const words = parseEncodedWords(prepared);
  const decoded = decodeDisplayText(
    prepared,
    words,
    options.joinAdjacent
  );
  const split = splitHeaderName(decoded);
  const decodedText =
    !options.preserveHeaderName && split.name
      ? split.body
      : decoded;
  const issues = buildDecodeIssues(options.input.trim(), prepared, words);

  return {
    output: decodedText,
    decodedText,
    encodedText: "",
    words,
    issues,
    unfoldedInput: prepared,
  };
}

function formatReport(result: MimeResult) {
  const lines = [
    "MIME encoded-word inspection",
    `Encoded-words: ${result.words.length}`,
    "",
    "Decoded output:",
    result.output,
  ];

  if (result.words.length) {
    lines.push("", "Words:");

    result.words.forEach((word, index) => {
      lines.push(
        `${index + 1}. ${word.raw}`,
        `   charset: ${word.charset}`,
        `   encoding: ${word.encoding}`,
        `   decoded bytes: ${word.byteLength}`,
        `   decoded text: ${word.decodedText}`
      );

      word.errors.forEach((error) => lines.push(`   ERROR: ${error}`));
      word.warnings.forEach((warning) => lines.push(`   NOTE: ${warning}`));
    });
  }

  if (result.issues.length) {
    lines.push(
      "",
      "Review:",
      ...result.issues.map(
        (issue) => `- ${issue.severity.toUpperCase()} — ${issue.title}: ${issue.message}`
      )
    );
  }

  return lines.join("\n");
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [actionMode, setActionMode] = useState<ActionMode>("decode");
  const [encodingMode, setEncodingMode] = useState<EncodingMode>("auto");
  const [charset, setCharset] = useState<CharsetMode>("UTF-8");
  const [unfold, setUnfold] = useState(true);
  const [joinAdjacent, setJoinAdjacent] = useState(true);
  const [preserveHeaderName, setPreserveHeaderName] = useState(true);
  const [result, setResult] = useState<MimeResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const report = useMemo(
    () => (result ? formatReport(result) : ""),
    [result]
  );

  const clearResult = () => {
    setResult(null);
    setError("");
    setCopied(false);
  };

  const run = () => {
    if (!input.trim()) {
      setError(
        actionMode === "decode"
          ? "Paste an RFC 2047 email header/value to decode."
          : "Enter header text to encode."
      );
      setResult(null);
      return;
    }

    try {
      setResult(
        buildResult({
          input,
          actionMode,
          encodingMode,
          charset,
          unfold,
          joinAdjacent,
          preserveHeaderName,
        })
      );
      setError("");
      setCopied(false);
    } catch (caught) {
      setResult(null);
      setCopied(false);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to process this MIME header text."
      );
    }
  };

  const loadExample = () => {
    setInput(SAMPLE_HEADER);
    setActionMode("decode");
    setEncodingMode("auto");
    setCharset("UTF-8");
    setUnfold(true);
    setJoinAdjacent(true);
    setPreserveHeaderName(true);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setActionMode("decode");
    setEncodingMode("auto");
    setCharset("UTF-8");
    setUnfold(true);
    setJoinAdjacent(true);
    setPreserveHeaderName(true);
    clearResult();
  };

  const copyOutput = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setError("The output could not be copied. Select and copy it manually.");
    }
  };

  const copyReport = async () => {
    if (!report) return;

    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setError("The report could not be copied. Select and copy it manually.");
    }
  };

  return (
    <ToolShell
      title="MIME Encoded-Word Decoder"
      description="Decode RFC 2047 encoded-words in email subjects and display text, inspect B/Q bytes and charsets, or generate deliberately bounded encoded-words without treating MIME header encoding as generic Base64."
    >
      <div className="grid gap-5 md:grid-cols-3">
        <YoryantraSelect
          label="Action"
          value={actionMode}
          onChange={(value: string) => {
            setActionMode(value as ActionMode);
            clearResult();
          }}
          options={[
            { label: "Decode / inspect", value: "decode" },
            { label: "Encode text", value: "encode" },
          ]}
        />

        <YoryantraSelect
          label="Encoding"
          value={encodingMode}
          onChange={(value: string) => {
            setEncodingMode(value as EncodingMode);
            clearResult();
          }}
          options={[
            { label: "Auto (shorter B or Q)", value: "auto" },
            { label: "B (Base64)", value: "B" },
            { label: "Q (header Q encoding)", value: "Q" },
          ]}
        />

        <YoryantraSelect
          label="Charset for encoding"
          value={charset}
          onChange={(value: string) => {
            setCharset(value as CharsetMode);
            clearResult();
          }}
          options={[
            { label: "UTF-8", value: "UTF-8" },
            { label: "ISO-8859-1", value: "ISO-8859-1" },
            { label: "Windows-1252", value: "windows-1252" },
            { label: "US-ASCII", value: "US-ASCII" },
          ]}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block text-sm font-semibold text-gray-900">
          Email header or header value
        </label>
        <textarea
          value={input}
          onChange={(event: { target: { value: string } }) => {
            setInput(event.target.value);
            clearResult();
          }}
          placeholder={SAMPLE_HEADER}
          spellCheck={false}
          className="mt-3 min-h-[250px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Toggle
          checked={unfold}
          onChange={(checked) => {
            setUnfold(checked);
            clearResult();
          }}
          title="Unfold header lines"
          text="Convert CRLF/LF + whitespace folding into a single space before decoding."
        />
        <Toggle
          checked={joinAdjacent}
          onChange={(checked) => {
            setJoinAdjacent(checked);
            clearResult();
          }}
          title="Join adjacent encoded-words"
          text="Ignore linear whitespace between adjacent encoded-words, matching RFC 2047 display rules."
        />
        <Toggle
          checked={preserveHeaderName}
          onChange={(checked) => {
            setPreserveHeaderName(checked);
            clearResult();
          }}
          title="Preserve header name"
          text="Keep Subject:, From:, Comments:, or another valid field name in output."
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={run} className="yoryantra-btn">
          {actionMode === "decode" ? "Decode Header" : "Encode Header"}
        </button>
        <button type="button" onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>
        <button type="button" onClick={resetAll} className="yoryantra-btn-outline">
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
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Encoded-words" value={String(result.words.length)} />
            <Stat
              label="Warnings"
              value={String(
                result.issues.filter((issue) => issue.severity === "warning").length
              )}
            />
            <Stat
              label="Output characters"
              value={String(result.output.length)}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {actionMode === "decode" ? "Decoded output" : "Encoded output"}
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyOutput}
                  className="yoryantra-btn-outline whitespace-nowrap"
                >
                  {copied ? "Copied" : "Copy Output"}
                </button>
                <button
                  type="button"
                  onClick={copyReport}
                  className="yoryantra-btn-outline whitespace-nowrap"
                >
                  Copy Report
                </button>
              </div>
            </div>

            <pre className="yoryantra-output mt-4 min-h-[220px] overflow-auto whitespace-pre-wrap break-words font-mono text-sm">
              {result.output}
            </pre>
          </div>

          {result.words.length ? (
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-gray-900">
                Encoded-word inspection
              </h3>
              <div className="mt-4 space-y-4">
                {result.words.map((word, index) => (
                  <div
                    key={`${word.start}-${index}`}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                  >
                    <code className="block break-all text-xs text-gray-800">
                      {word.raw}
                    </code>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <Info label="Charset" value={word.charset} />
                      <Info label="Encoding" value={word.encoding} />
                      <Info label="Decoded bytes" value={String(word.byteLength)} />
                    </div>
                    <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3">
                      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Decoded text
                      </div>
                      <div className="mt-2 break-words text-sm text-gray-800">
                        {word.decodedText}
                      </div>
                    </div>
                    {word.errors.length || word.warnings.length ? (
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-xs leading-relaxed text-gray-700">
                        {word.errors.map((item, itemIndex) => (
                          <li key={`e-${itemIndex}`}>
                            <strong>Error:</strong> {item}
                          </li>
                        ))}
                        {word.warnings.map((item, itemIndex) => (
                          <li key={`w-${itemIndex}`}>
                            <strong>Note:</strong> {item}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {result.issues.length ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h3 className="font-semibold text-gray-700">
                Header review
              </h3>
              <div className="mt-4 space-y-3">
                {result.issues.map((issue, index) => (
                  <div
                    key={`${issue.title}-${index}`}
                    className="rounded-xl border border-amber-200 bg-white/60 p-4 text-sm leading-relaxed text-gray-700"
                  >
                    <strong>{issue.title}</strong>
                    <p className="mt-1">{issue.message}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <pre className="yoryantra-output mt-8 min-h-[280px] whitespace-pre-wrap break-words text-sm">
          Decoded header text, encoded-word components, charset results and RFC
          2047 diagnostics will appear here.
        </pre>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        MIME header decoding/encoding runs on the text in your browser. The tool
        does not connect to an IMAP/SMTP server or upload an email message.
        Site-wide analytics or advertising scripts, if enabled, are separate
        from this operation.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            An Encoded-Word Is a Header Token, Not “Base64 Somewhere in an Email”
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 2047 encoded-words have a specific shape:{" "}
            <code>=?charset?encoding?encoded-text?=</code>. The charset explains
            how decoded bytes become characters, and the encoding is either B
            (Base64) or Q (a header-oriented quoted encoding).
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            MIME body transfer encodings and header encoded-words solve
            different problems. A body can use Base64 without any{" "}
            <code>=?charset?B?encoded-text?=</code> wrapper, while a Subject can contain several
            encoded-words next to ordinary ASCII text.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-700">
            Q Encoding Is Not the Same as Quoted-Printable Body Encoding
          </h2>
          <p className="mt-4 leading-relaxed text-gray-700/90">
            The syntax is related, but RFC 2047 gives Q encoded-words their own
            rules. Inside an encoded-word, underscore represents an ASCII space,
            and bytes can be written as <code>=HH</code> hexadecimal escapes.
          </p>
          <p className="mt-4 leading-relaxed text-gray-700/90">
            That means <code>=?UTF-8?Q?Sneha_Yoryantra?=</code> decodes the
            underscore as a space. Treating the encoded-text as a normal URL or
            generic quoted-printable string can produce the wrong result.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Whitespace Between Adjacent Encoded-Words Disappears for Display
          </h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-gray-50 p-4 text-sm leading-7 text-gray-800">{`=?UTF-8?B?U25laGE=?= =?UTF-8?Q?_Yoryantra?=`}</pre>
          <p className="mt-4 leading-relaxed text-gray-600">
            When encoded-words are adjacent and separated only by linear
            whitespace, RFC 2047 display decoding ignores that separating
            whitespace. The decoded characters inside the words decide whether
            a visible space exists.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This is one reason naive regex replacement often creates an extra
            space between words or removes a space that was encoded as{" "}
            <code>_</code> or <code>=20</code>.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            75 Characters Is an Encoded-Word Limit, Not Just a Pretty Line-Wrap Preference
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 2047 limits each complete encoded-word to 75 characters,
            including the charset, encoding marker and delimiters. Long Unicode
            header values therefore need multiple encoded-words.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The encoder splits by Unicode characters and re-encodes each
            candidate chunk until every generated word fits. Multiple words are
            folded using CRLF plus whitespace instead of generating one
            oversized token.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            The Charset Is Part of the Data
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The same byte value can mean different characters under UTF-8,
            ISO-8859-1 or Windows-1252. Decoding the Base64 first and then
            blindly calling the bytes UTF-8 can turn a valid legacy header into
            replacement characters.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Yoryantra treats ISO-8859-1 and Windows-1252 separately for their
            0x80–0x9F behavior, handles US-ASCII range violations, and uses the
            browser TextDecoder for other recognized charset labels.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Encoded-Words Are Allowed Only in Specific Header Contexts
          </h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            RFC 2047 does not authorize replacing arbitrary header syntax with
            encoded-words. They are used in text/phrase contexts such as Subject
            and display names, with restrictions. Received is not a generic
            encoded-word field, and MIME parameters such as filename have their
            own parameter-encoding mechanisms.
          </p>
          <p className="mt-4 leading-relaxed text-gray-700">
            This tool decodes recognizable tokens for diagnostics, but it does
            not pretend to be a complete RFC 5322 address parser or MIME
            parameter parser.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Broken Mail Often Requires Tolerant Reading and Strict Diagnosis
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Real messages contain missing Base64 padding, unknown charset
            labels, malformed Q escapes and encoded-word-looking strings that do
            not fully match the grammar. Silently “fixing” all of them makes it
            hard to know whether the original sender was standards-compliant.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The decoder therefore distinguishes warnings from successful
            decoding. It can tolerate omitted Base64 padding for inspection
            while still telling you that the serialized encoded-word is not the
            canonical form you would generate.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <ReferenceCard
            title="RFC 2047 — Message Header Extensions"
            href="https://www.rfc-editor.org/rfc/rfc2047"
            text="Defines encoded-word syntax, B/Q encodings, contexts, adjacent-word whitespace and the 75-character limit."
          />
          <ReferenceCard
            title="RFC 5322 — Internet Message Format"
            href="https://www.rfc-editor.org/rfc/rfc5322"
            text="Defines the surrounding message-header syntax, including fields and line folding."
          />
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>

          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/mime-encoded-word-decoder" />
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
  onChange: (checked: boolean) => void;
  title: string;
  text: string;
}) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
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

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-2 break-words font-mono text-xs text-gray-800">
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
