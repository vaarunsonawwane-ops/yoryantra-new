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
  "Subject: =?UTF-8?B?UsOpc3Vtw6kg4oCTIEFQSSBzdGF0dXM=?=";

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

  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(decoded.text)) {
    warnings.push(
      "Decoded text contains a control character. RFC 2047 is intended for printable or whitespace text, so inspect the source before displaying it in a terminal or log viewer."
    );
  }

  if (/[\u202A-\u202E\u2066-\u2069]/.test(decoded.text)) {
    warnings.push(
      "Decoded text contains Unicode bidirectional-control characters. They can change visual ordering without changing the underlying string, so compare the raw value when identity or security matters."
    );
  }

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

function isRfc2047Token(value: string) {
  return Boolean(value) &&
    !/[\x00-\x20\x7F()<>@,;:\"\/\[\]?.=]/.test(value);
}

function parseEncodedWords(input: string) {
  const words: EncodedWord[] = [];
  const regex = /=\?([^?\s]+)\?([bBqQ])\?([^?\s]+)\?=/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    if (!isRfc2047Token(match[1])) {
      continue;
    }

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

    const containingWord = validWords.find(
      (word) => start >= word.start && start < word.end
    );

    if (containingWord) {
      cursor = containingWord.end;
      continue;
    }

    const end = input.indexOf("?=", start + 2);
    const sample =
      end === -1
        ? input.slice(start, Math.min(input.length, start + 90))
        : input.slice(start, Math.min(input.length, end + 2));

    issues.push(sample);
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
  const hasRawNonAscii = physicalLines.some((line) => /[^\x00-\x7F]/.test(line));
  const overHardLimit = physicalLines.filter((line) => {
    const length = /[^\x00-\x7F]/.test(line)
      ? new TextEncoder().encode(line).length
      : line.length;

    return length > 998;
  }).length;
  const overRecommended =
    physicalLines.filter(
      (line) =>
        line.length > 78
    ).length;

  if (overHardLimit) {
    issues.push({
      severity: "warning",
      title: "Header line exceeds the hard length limit",
      message:
        `${overHardLimit} physical line${
          overHardLimit === 1 ? "" : "s"
        } exceed the 998-${hasRawNonAscii ? "octet RFC 6532" : "character RFC 5322"} limit before CRLF. The 78-character recommendation is a separate display-oriented limit.`,
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
        "No complete =?charset?B/Q?encoded-text?= token matching the RFC 2047 grammar was found.",
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
        "RFC 2047 encoded-words are not the standard mechanism for MIME parameter values such as filename=. Parameter encoding uses other MIME mechanisms (for example RFC 2231 parameter conventions).",
    });
  }

  issues.push({
    severity: "note",
    title: "Display decoding is contextual",
    message:
      "RFC 2047 allows encoded-words only in defined message-header contexts. Recognizable tokens can be decoded for diagnosis, but complete RFC 5322 address and structured-header parsing requires field-specific grammar.",
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

    if (codePoint <= 0x7f || (codePoint >= 0xa0 && codePoint <= 0xff)) {
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
  encoding: "B" | "Q",
  firstWordLimit = 75
) {
  const words: string[] = [];
  let current = "";

  const currentLimit = () => (words.length === 0 ? firstWordLimit : 75);

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
      encodedWordLength(charset, encoding, encoded) > currentLimit()
    ) {
      flush();
      current = char;
    } else {
      current = candidate;
    }

    const currentBytes = encodeBytes(current, charset);
    const currentEncoded =
      encoding === "B"
        ? bytesToBase64(currentBytes)
        : bytesToQ(currentBytes);

    if (encodedWordLength(charset, encoding, currentEncoded) > currentLimit()) {
      throw new Error(
        `A character cannot fit inside the available RFC 2047 encoded-word line space using ${charset}/${encoding}.`
      );
    }
  }

  flush();

  return words;
}

function chooseEncoding(text: string, charset: CharsetMode) {
  const b = splitTextForWords(text, charset, "B").join("\r\n ");
  const q = splitTextForWords(text, charset, "Q").join("\r\n ");

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
  const sourceHeaderName = split.name;
  const headerName = preserveHeaderName ? sourceHeaderName : "";
  const body = sourceHeaderName ? split.body : unfolded;

  if (!body) {
    throw new Error("Enter text to encode.");
  }

  if (/[\r\n]/.test(body)) {
    throw new Error(
      "Enter one unfolded header value. A bare CR or LF inside the value would make the surrounding message header invalid."
    );
  }

  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(body)) {
    throw new Error(
      "The source contains a control character that does not belong in ordinary RFC 2047 display text. Remove it or inspect the original message bytes before encoding."
    );
  }

  const lowerHeaderName = sourceHeaderName.toLowerCase();
  const structuredFields = [
    "from", "to", "cc", "bcc", "sender", "reply-to",
    "resent-from", "resent-to", "resent-cc", "resent-bcc", "resent-sender",
    "date", "message-id", "return-path", "received", "mime-version",
    "content-type", "content-disposition",
  ];

  if (sourceHeaderName && structuredFields.indexOf(lowerHeaderName) !== -1) {
    throw new Error(
      `${sourceHeaderName}: has structured syntax that must not be replaced by one RFC 2047 encoded-word value. Encode only the display-text fragment that belongs in an allowed phrase/text position, or use an unstructured field such as Subject.`
    );
  }

  const selected =
    encodingMode === "auto"
      ? chooseEncoding(body, charset)
      : encodingMode;

  let foldBeforeFirst = false;
  let firstWordLimit = 75;

  if (headerName) {
    firstWordLimit = Math.min(75, 76 - `${headerName}: `.length);
    const firstChar = Array.from(body)[0];

    if (firstChar) {
      const firstBytes = encodeBytes(firstChar, charset);
      const firstEncoded =
        selected === "B" ? bytesToBase64(firstBytes) : bytesToQ(firstBytes);

      if (encodedWordLength(charset, selected, firstEncoded) > firstWordLimit) {
        foldBeforeFirst = true;
        firstWordLimit = 75;
      }
    }
  }

  const words = splitTextForWords(body, charset, selected, firstWordLimit);
  const value = words.join("\r\n ");
  const encodedText = headerName
    ? foldBeforeFirst
      ? `${headerName}:\r\n ${value}`
      : `${headerName}: ${value}`
    : value;

  return {
    encodedText,
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

    const generatedWords = parseEncodedWords(unfoldHeader(encoded.encodedText));
    const issues: MimeIssue[] = [
      {
        severity: "note",
        title: `${encoded.encoding} encoding selected`,
        message:
          `The value was split into ${encoded.wordCount} encoded-word${
            encoded.wordCount === 1 ? "" : "s"
          }. Each token stays within RFC 2047's 75-character limit, and generated lines containing encoded-words stay within 76 characters.`,
      },
    ];

    if (encoded.wordCount > 1 || encoded.encodedText.indexOf("\r\n") !== -1) {
      issues.push({
        severity: "note",
        title: "Header folding was added",
        message:
          "CRLF followed by one space separates folded encoded-words. During display, linear whitespace between adjacent encoded-words is ignored.",
      });
    }

    if (/[\u202A-\u202E\u2066-\u2069]/.test(options.input)) {
      issues.push({
        severity: "warning",
        title: "Bidirectional control character in source text",
        message:
          "The source contains a Unicode bidirectional-control character. Encoding preserves that character, so compare the logical string with its visual rendering before using it in an identity, log, or security-sensitive header.",
      });
    }

    if (/^[\x00-\x7F]*$/.test(options.input)) {
      issues.push({
        severity: "note",
        title: "The source text is already ASCII",
        message:
          "RFC 2047 permits encoded-words for ASCII text but discourages unnecessary encoding. Plain ASCII is usually easier to read and debug when the surrounding field syntax allows it.",
      });
    }

    return {
      output: encoded.encodedText,
      decodedText: options.input,
      encodedText: encoded.encodedText,
      words: generatedWords,
      unfoldedInput: prepared,
      issues,
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
  const [copiedTarget, setCopiedTarget] = useState<"output" | "report" | "">("");

  const report = useMemo(
    () => (result ? formatReport(result) : ""),
    [result]
  );

  const clearResult = () => {
    setResult(null);
    setError("");
    setCopiedTarget("");
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
      setCopiedTarget("");
    } catch (caught) {
      setResult(null);
      setCopiedTarget("");
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
      setCopiedTarget("output");
      window.setTimeout(() => setCopiedTarget(""), 1400);
    } catch {
      setCopiedTarget("");
      setError("The output could not be copied. Select and copy it manually.");
    }
  };

  const copyReport = async () => {
    if (!report) return;

    try {
      await navigator.clipboard.writeText(report);
      setCopiedTarget("report");
      window.setTimeout(() => setCopiedTarget(""), 1400);
    } catch {
      setCopiedTarget("");
      setError("The report could not be copied. Select and copy it manually.");
    }
  };

  return (
    <ToolShell
      title="MIME Encoded-Word Decoder"
      description="Email subjects and display names can arrive as =?charset?B/Q?...?= encoded-words. The declared charset matters just as much as the Base64 or Q encoding around the bytes."
    >
      <div className="max-w-sm">
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
      </div>

      {actionMode === "encode" ? (
        <div className="mt-5 grid gap-5 md:grid-cols-2">
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
            label="Charset"
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
      ) : null}

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <label htmlFor="mime-header-input" className="block text-sm font-semibold text-gray-900">
          {actionMode === "decode" ? "Email header or header value" : "Text or unstructured header value"}
        </label>
        <textarea
          id="mime-header-input"
          value={input}
          onChange={(event: { target: { value: string } }) => {
            setInput(event.target.value);
            clearResult();
          }}
          placeholder={
            actionMode === "decode"
              ? SAMPLE_HEADER
              : "Subject: Café résumé — नमस्ते"
          }
          spellCheck={false}
          className="mt-3 min-h-[250px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className={`mt-6 grid gap-4 ${actionMode === "decode" ? "md:grid-cols-3" : "md:grid-cols-1"}`}>
        {actionMode === "decode" ? (
          <>
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
          </>
        ) : null}
        <Toggle
          checked={preserveHeaderName}
          onChange={(checked) => {
            setPreserveHeaderName(checked);
            clearResult();
          }}
          title="Preserve header name"
          text={
            actionMode === "decode"
              ? "Keep Subject:, From:, Comments:, or another valid field name in decoded output."
              : "Keep a field name such as Subject:. Whole structured fields such as From:, To:, Content-Type: and Content-Disposition: are rejected for encoding."
          }
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
        <div role="alert" className="mt-5 whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
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
                  {copiedTarget === "output" ? "Copied" : "Copy Output"}
                </button>
                <button
                  type="button"
                  onClick={copyReport}
                  className="yoryantra-btn-outline whitespace-nowrap"
                >
                  {copiedTarget === "report" ? "Copied" : "Copy Report"}
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
        Header parsing runs in browser-side code and does not connect to an
        IMAP or SMTP server. Subjects, display names, addresses and Message-IDs
        can still be sensitive, so remove details you do not need before sharing
        decoded output. Site-wide analytics or advertising scripts, if enabled,
        are separate from the header operation.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            An Encoded-Word Is More Than Base64
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 2047 uses the form <code>=?charset?encoding?encoded-text?=</code>.
            The <code>B</code> form carries Base64 bytes; <code>Q</code> uses a
            header-specific quoted form. The charset then decides how those
            bytes become characters.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Decoding only the Base64 portion is therefore incomplete. The same
            byte can display differently under UTF-8, ISO-8859-1 and
            Windows-1252, and an unsupported or incorrect charset label can be
            the reason a subject looks corrupted.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-700">
            Q Encoding Has Its Own Header Rules
          </h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            Q looks similar to quoted-printable, but it is not the same thing as
            a MIME body encoded with quoted-printable. Inside an encoded-word,
            underscore means an ASCII space and <code>=HH</code> represents one
            byte in hexadecimal. A literal underscore has to be encoded as
            <code>=5F</code>.
          </p>
          <p className="mt-4 leading-relaxed text-gray-700">
            The allowed literal characters also depend on where the encoded-word
            appears. A display-name phrase has tighter rules than an unstructured
            Subject field, which is why conservative Q output escapes punctuation
            instead of trying to keep every printable character readable.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            ISO-8859-1 and Windows-1252 Are Not Interchangeable
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            They agree across much of the byte range, but Windows-1252 assigns
            printable characters such as the euro sign and smart quotes to many
            bytes from 0x80 through 0x9F. ISO-8859-1 treats that range as control
            characters.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            A classic symptom is punctuation turning into controls or replacement
            characters even though the Base64 itself is valid. Check the declared
            charset before assuming the transport encoding is broken.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Adjacent Encoded-Words Hide Their Separating Whitespace
          </h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-white p-4 text-sm leading-7 text-gray-800">{`=?UTF-8?Q?R=C3=A9sum=C3=A9?= =?UTF-8?Q?_=E2=80=93_API?=`}</pre>
          <p className="mt-4 leading-relaxed text-gray-600">
            When two encoded-words are next to each other and only linear
            whitespace sits between them, that whitespace is ignored for display.
            A visible space must come from the decoded content itself, such as
            <code>_</code> or <code>=20</code> in Q encoding.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This is why plain regex replacement often inserts an extra space or
            removes one that was intentionally encoded. Header unfolding and
            encoded-word display rules have to be considered together.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            The 75-Character Token Limit and 76-Character Line Limit Are Different
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            One complete encoded-word cannot exceed 75 characters. RFC 2047 also
            limits a header line that contains an encoded-word to 76 characters.
            A field name such as <code>Subject:</code> therefore reduces the room
            available for the first token.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Long values need several self-contained encoded-words. A UTF-8
            multi-byte character cannot be cut between two words, and a Q escape
            such as <code>=E2</code> cannot be continued in the next token. Folding
            with CRLF plus whitespace keeps the logical field value intact.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Do Not Encode an Entire From or To Field as One Word
          </h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            Address fields have structure. An encoded-word may represent a
            display-name phrase, but it must not replace the address itself or
            hide the <code>addr-spec</code> syntax. The same restriction applies to
            fields such as <code>Received</code> and MIME parameters such as
            <code>filename=</code>.
          </p>
          <p className="mt-4 leading-relaxed text-gray-700">
            If you are repairing a complete structured header, parse that field
            first and encode only the text position where RFC 2047 allows it. A
            decoded display name also says nothing about whether the underlying
            sender address or authentication results are trustworthy.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Broken Headers Need Tolerant Reading, Not Silent Repair
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Old mail archives contain missing Base64 padding, unknown charset
            labels, malformed Q escapes and strings that merely look like
            encoded-words. It can be useful to recover readable text, but the
            damaged source should remain visible.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Missing Base64 padding can be tolerated for inspection while still
            being reported as non-canonical. Unknown charsets should not be
            guessed silently. If the decoded result contains control or Unicode
            bidirectional characters, compare it with the raw header before
            pasting it into logs or security reports.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Modern SMTP Can Carry UTF-8 Headers Directly
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 6532 extends Internet message headers so field bodies can contain
            Unicode directly when the message is transported with SMTPUTF8. That
            does not make RFC 2047 disappear: encoded-words remain common in older
            mail, mixed infrastructure and compatibility-oriented software.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            When you control both ends of a modern mail path, check whether direct
            UTF-8 is already supported before adding legacy encoded-word syntax
            purely out of habit.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            RFC 2047 Sits Inside the Wider Email Format
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            <a href="https://www.rfc-editor.org/rfc/rfc2047" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">RFC 2047</a>{" "}
            defines encoded-word syntax, B/Q rules, legal header contexts,
            adjacent-word whitespace and length limits. <a href="https://www.rfc-editor.org/rfc/rfc5322" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">RFC 5322</a>{" "}
            defines the surrounding Internet message-header syntax and folding.
            <a href="https://www.rfc-editor.org/rfc/rfc6532" target="_blank" rel="noreferrer" className="ml-1 font-medium text-[var(--green)] underline underline-offset-4">RFC 6532</a>{" "}
            covers internationalized UTF-8 header fields. For MIME parameters such as filenames, <a href="https://www.rfc-editor.org/rfc/rfc2231" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">RFC 2231</a>{" "}
            defines the parameter mechanism instead of RFC 2047 encoded-words.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            If the Header Is Only Part of the Problem
          </h2>
          <p className="mt-3 leading-relaxed text-gray-600">
            A broken subject can be an encoded-word problem, a charset problem,
            or just one symptom of a larger MIME message issue. Inspect the next
            layer instead of decoding the same string repeatedly.
          </p>
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
        className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]"
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
