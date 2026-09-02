"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type ActionMode =
  | "normalize"
  | "extract"
  | "wrap";
type NewlineMode =
  | "lf"
  | "crlf";

type PemBlock = {
  index: number;
  beginLabel: string;
  endLabel: string;
  rawBody: string;
  cleanBase64: string;
  canonicalBase64: string;
  decodedBytes: number;
  lineCount: number;
  matchingEnd: boolean;
  labelValid: boolean;
  base64Valid: boolean;
  errors: string[];
  warnings: string[];
  classification: string;
};

type PemIssue = {
  severity:
    | "warning"
    | "note";
  title: string;
  message: string;
};

type PemResult = {
  blocks: PemBlock[];
  output: string;
  issues: PemIssue[];
  outsideText: string[];
  totalBytes: number;
};

const SAMPLE_PEM = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCr+kUZP3HeeXkATULsDnfIu4OA
P3c1yyHYvHVwSV1nn45TxTyMbJRG7BHD+tKRd5XeBTmFBFBErt34p96d/7fWty/z
9rMdmsLtabZ0xiM8wDjSd46ePqU+Nzu5L9uKZnSmvwz2kdaFPnN6d28q8B3N71Wi
alLzwYH3Hj2yc4bYewIDAQAB
-----END PUBLIC KEY-----`;

const LABEL_OPTIONS = [
  "CERTIFICATE",
  "PRIVATE KEY",
  "ENCRYPTED PRIVATE KEY",
  "PUBLIC KEY",
  "CERTIFICATE REQUEST",
  "X509 CRL",
  "CMS",
  "PKCS7",
];

function validLabel(label: string) {
  if (!label) {
    return false;
  }

  if (
    label !== label.toUpperCase()
  ) {
    return false;
  }

  if (
    label.charAt(0) === " " ||
    label.charAt(label.length - 1) === " " ||
    label.charAt(0) === "-" ||
    label.charAt(label.length - 1) === "-"
  ) {
    return false;
  }

  if (
    label.indexOf("  ") !== -1 ||
    label.indexOf("--") !== -1
  ) {
    return false;
  }

  for (let index = 0; index < label.length; index += 1) {
    const code = label.charCodeAt(index);
    const char = label.charAt(index);

    if (
      code < 0x21 ||
      code > 0x7e ||
      char === "-"
    ) {
      if (char !== " " && char !== "-") {
        return false;
      }
    }
  }

  return /^[\x21-\x2C\x2E-\x7E]+(?:[ -][\x21-\x2C\x2E-\x7E]+)*$/.test(
    label
  );
}

function prohibitedGeneratorLabel(label: string) {
  return (
    [
      "X509 CERTIFICATE",
      "X.509 CERTIFICATE",
      "CRL",
      "NEW CERTIFICATE REQUEST",
      "CERTIFICATE CHAIN",
    ].indexOf(label) !== -1
  );
}

function classifyLabel(label: string) {
  if (label === "CERTIFICATE") return "X.509 certificate";
  if (label === "CERTIFICATE REQUEST") return "PKCS #10 certificate request";
  if (label === "X509 CRL") return "X.509 certificate revocation list";
  if (label === "PUBLIC KEY") return "SubjectPublicKeyInfo public key";
  if (label === "PRIVATE KEY") return "PKCS #8 private key";
  if (label === "ENCRYPTED PRIVATE KEY") return "Encrypted PKCS #8 private key";
  if (label === "CMS") return "Cryptographic Message Syntax";
  if (label === "PKCS7") return "PKCS #7";
  if (/PRIVATE KEY/i.test(label)) return "private-key material";
  if (/PUBLIC KEY/i.test(label)) return "public-key material";
  if (/CERTIFICATE/i.test(label)) return "certificate-related block";
  if (/CRL/i.test(label)) return "certificate revocation list";
  return "PEM/textual-encoding block";
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return btoa(binary);
}

function decodeBase64Strict(value: string) {
  const errors: string[] = [];
  const warnings: string[] = [];
  const clean = value.replace(/\s/g, "");

  if (!clean) {
    errors.push("Base64 body is empty.");

    return {
      clean,
      canonical: "",
      bytes: new Uint8Array(),
      errors,
      warnings,
    };
  }

  if (/[^A-Za-z0-9+/=]/.test(clean)) {
    errors.push("Body contains characters outside the standard Base64 alphabet.");
  }

  const padding = (clean.match(/=+$/) || [""])[0];

  if (padding.length > 2) {
    errors.push("Base64 has more than two trailing padding characters.");
  }

  if (clean.indexOf("=") !== -1 && !/=+$/.test(clean)) {
    errors.push("Base64 padding appears before the end of the body.");
  }

  if (clean.length % 4 === 1) {
    errors.push("Base64 length cannot be valid because it leaves a one-character remainder.");
  }

  if (errors.length) {
    return {
      clean,
      canonical: "",
      bytes: new Uint8Array(),
      errors,
      warnings,
    };
  }

  if (clean.length % 4 !== 0) {
    warnings.push(
      "Trailing Base64 padding is omitted. The normalized generator output will restore canonical padding."
    );
  }

  try {
    const padded = clean + "=".repeat((4 - (clean.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    const canonical = bytesToBase64(bytes);

    if (
      canonical.replace(/=+$/, "") !==
      clean.replace(/=+$/, "")
    ) {
      warnings.push(
        "Decoded bytes re-encode to a different canonical Base64 spelling. Non-zero/ambiguous padding bits or non-canonical input may be involved."
      );
    }

    return {
      clean,
      canonical,
      bytes,
      errors,
      warnings,
    };
  } catch {
    errors.push("Browser Base64 decoding failed.");

    return {
      clean,
      canonical: "",
      bytes: new Uint8Array(),
      errors,
      warnings,
    };
  }
}

function parseBoundary(
  line: string,
  kind: "BEGIN" | "END"
) {
  const regex =
    kind === "BEGIN"
      ? /^-----BEGIN (.+)-----$/
      : /^-----END (.+)-----$/;
  const match = line.match(regex);

  return match ? match[1] : "";
}

function parsePemBlocks(input: string) {
  const normalized = input.replace(/\r\n?/g, "\n");
  const lines = normalized.split("\n");
  const blocks: PemBlock[] = [];
  const outsideText: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const originalLine = lines[index];
    const trimmed = originalLine.trim();
    const beginLabel = parseBoundary(trimmed, "BEGIN");

    if (!beginLabel) {
      if (trimmed) {
        outsideText.push(`Line ${index + 1}: ${trimmed}`);
      }
      index += 1;
      continue;
    }

    const bodyLines: string[] = [];
    const beginLineNumber = index + 1;
    let endLabel = "";
    let endFound = false;
    index += 1;

    while (index < lines.length) {
      const currentTrimmed = lines[index].trim();
      const nestedBegin = parseBoundary(currentTrimmed, "BEGIN");
      const candidateEnd = parseBoundary(currentTrimmed, "END");

      if (nestedBegin) {
        break;
      }

      if (candidateEnd) {
        endLabel = candidateEnd;
        endFound = true;
        index += 1;
        break;
      }

      bodyLines.push(lines[index]);
      index += 1;
    }

    const rawBody = bodyLines.join("\n");
    const bodyDecode = decodeBase64Strict(rawBody);
    const errors = bodyDecode.errors.slice();
    const warnings = bodyDecode.warnings.slice();
    const labelValid = validLabel(beginLabel);

    if (!labelValid) {
      errors.push(
        `BEGIN label "${beginLabel}" is outside RFC 7468 generator label grammar/case requirements.`
      );
    }

    if (!endFound) {
      errors.push(
        `No END boundary was found for block beginning on line ${beginLineNumber}.`
      );
    }

    const matchingEnd = endFound && endLabel === beginLabel;

    if (endFound && !matchingEnd) {
      errors.push(
        `END label "${endLabel}" does not match BEGIN label "${beginLabel}".`
      );
    }

    if (endFound && !validLabel(endLabel)) {
      errors.push(
        `END label "${endLabel}" is outside RFC 7468 generator label grammar/case requirements.`
      );
    }

    const nonBlankLines = bodyLines.filter((line) => line.trim()).length;
    const bodyHasLegacyHeader = bodyLines.some(
      (line) =>
        /^[A-Za-z0-9-]+:\s*/.test(line.trim()) &&
        !/^[A-Za-z0-9+/=]+$/.test(line.trim())
    );

    if (bodyHasLegacyHeader) {
      warnings.push(
        "The encapsulated region contains a header-like line (for example legacy PEM Proc-Type/DEK-Info). RFC 7468 textual encoding does not define encapsulated headers alongside the Base64 data."
      );
    }

    const hasBodyWhitespace =
      bodyLines.some(
        (line) =>
          line &&
          line !== line.trim()
      );

    if (hasBodyWhitespace) {
      warnings.push(
        "Whitespace surrounds one or more Base64 lines. Parsers can be tolerant, but normalized generator output removes extraneous whitespace."
      );
    }

    const nonFinalLineLengths = bodyLines
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, -1)
      .map((line) => line.length);

    if (
      nonFinalLineLengths.some(
        (length) => length !== 64
      )
    ) {
      warnings.push(
        "At least one non-final Base64 line is not 64 characters. RFC 7468 generators use exactly 64 characters per line except the final line."
      );
    }

    blocks.push({
      index: blocks.length + 1,
      beginLabel,
      endLabel,
      rawBody,
      cleanBase64: bodyDecode.clean,
      canonicalBase64: bodyDecode.canonical,
      decodedBytes: bodyDecode.bytes.length,
      lineCount: nonBlankLines,
      matchingEnd,
      labelValid,
      base64Valid: bodyDecode.errors.length === 0,
      errors,
      warnings,
      classification: classifyLabel(beginLabel),
    });
  }

  return {
    blocks,
    outsideText,
  };
}

function wrap64(value: string, newline: string) {
  const lines: string[] = [];

  for (let index = 0; index < value.length; index += 64) {
    lines.push(value.slice(index, index + 64));
  }

  return lines.join(newline);
}

function canonicalPem(
  label: string,
  canonicalBase64: string,
  newline: string
) {
  return [
    `-----BEGIN ${label}-----`,
    wrap64(canonicalBase64, newline),
    `-----END ${label}-----`,
  ].join(newline);
}

function normalizeExistingBlocks(
  blocks: PemBlock[],
  newline: string
) {
  const invalid = blocks.filter(
    (block) =>
      !block.matchingEnd ||
      !block.labelValid ||
      prohibitedGeneratorLabel(
        block.beginLabel
      ) ||
      !block.base64Valid ||
      !block.canonicalBase64
  );

  if (invalid.length) {
    throw new Error(
      `Cannot generate normalized PEM because ${invalid.length} block${
        invalid.length === 1 ? " has" : "s have"
      } a boundary/Base64 problem or a historical label that RFC 7468 generators should not emit. Fix the reported block or deliberately re-wrap verified bytes with the correct standardized label.`
    );
  }

  return blocks
    .map((block) =>
      canonicalPem(
        block.beginLabel,
        block.canonicalBase64,
        newline
      )
    )
    .join(`${newline}${newline}`);
}

function extractBase64(blocks: PemBlock[], newline: string) {
  if (!blocks.length) {
    throw new Error("No PEM block was found to extract.");
  }

  return blocks
    .map((block) => {
      if (!block.base64Valid || !block.canonicalBase64) {
        return `# Block ${block.index} (${block.beginLabel}) has invalid Base64`;
      }

      return [
        `# Block ${block.index}: ${block.beginLabel}`,
        wrap64(block.canonicalBase64, newline),
      ].join(newline);
    })
    .join(`${newline}${newline}`);
}

function buildIssues(
  blocks: PemBlock[],
  outsideText: string[]
) {
  const issues: PemIssue[] = [];

  if (!blocks.length) {
    issues.push({
      severity: "note",
      title: "No PEM block detected",
      message:
        "Use Wrap Raw Base64 when the input contains only Base64 rather than BEGIN/END boundaries.",
    });
  }

  if (blocks.length > 1) {
    issues.push({
      severity: "note",
      title: "Multiple blocks stay separate",
      message:
        `The input contains ${blocks.length} PEM blocks. Normalization preserves each block and its label in order instead of joining their Base64 bodies into one synthetic object.`,
    });
  }

  if (
    blocks.some((block) =>
      /PRIVATE KEY/i.test(block.beginLabel)
    )
  ) {
    issues.push({
      severity: "warning",
      title: "Private-key material detected",
      message:
        "Private keys are sensitive. Avoid unnecessary production-key handling, screenshots, clipboard history, logs and shared browser sessions.",
    });
  }

  if (outsideText.length) {
    issues.push({
      severity: "note",
      title: "Text exists outside PEM boundaries",
      message:
        `${outsideText.length} non-empty outside line${
          outsideText.length === 1 ? " was" : "s were"
        } found. Normalized output contains only PEM blocks and deliberately drops surrounding commentary.`,
    });
  }

  blocks.forEach((block) => {
    block.errors.forEach((error) => {
      issues.push({
        severity: "warning",
        title: `Block ${block.index} · ${block.beginLabel}`,
        message: error,
      });
    });

    block.warnings.forEach((warning) => {
      issues.push({
        severity: "note",
        title: `Block ${block.index} · ${block.beginLabel}`,
        message: warning,
      });
    });

    if (block.beginLabel === "X509 CERTIFICATE") {
      issues.push({
        severity: "warning",
        title: `Block ${block.index} uses a historical certificate label`,
        message:
          'RFC 7468 generators use "CERTIFICATE" and must not generate the historical "X509 CERTIFICATE" label.',
      });
    }

    if (block.beginLabel === "CRL") {
      issues.push({
        severity: "warning",
        title: `Block ${block.index} uses a historical CRL label`,
        message:
          'RFC 7468 standardizes "X509 CRL"; generators must not generate the historical "CRL" label.',
      });
    }

    if (block.beginLabel === "NEW CERTIFICATE REQUEST") {
      issues.push({
        severity: "note",
        title: `Block ${block.index} uses a legacy CSR label`,
        message:
          'RFC 7468 generators use "CERTIFICATE REQUEST", although parsers may treat "NEW CERTIFICATE REQUEST" as equivalent.',
      });
    }

    if (block.beginLabel === "CERTIFICATE CHAIN") {
      issues.push({
        severity: "warning",
        title: `Block ${block.index} uses CERTIFICATE CHAIN`,
        message:
          'RFC 7468 says generators must not generate the "CERTIFICATE CHAIN" label. Certificate bundles normally contain multiple separate CERTIFICATE blocks.',
      });
    }
  });

  issues.push({
    severity: "note",
    title: "Container formatting is not certificate validation",
    message:
      "A valid PEM wrapper and decodable Base64 do not prove the bytes are the ASN.1 structure implied by the label, that a certificate is trusted, or that a private key matches a certificate.",
  });

  return issues;
}

function buildResult(options: {
  input: string;
  actionMode: ActionMode;
  newlineMode: NewlineMode;
  wrapLabel: string;
}): PemResult {
  const newline =
    options.newlineMode === "crlf"
      ? "\r\n"
      : "\n";
  const parsed = parsePemBlocks(options.input);
  const issues = buildIssues(parsed.blocks, parsed.outsideText);
  let output = "";

  if (options.actionMode === "wrap") {
    const label = options.wrapLabel.trim();

    if (!validLabel(label)) {
      throw new Error(
        "PEM label must be uppercase RFC 7468 label text without leading/trailing spaces or hyphens, consecutive spaces, or consecutive hyphens."
      );
    }

    const decoded = decodeBase64Strict(options.input);

    if (decoded.errors.length || !decoded.canonical) {
      throw new Error(
        decoded.errors.length
          ? `Raw Base64 cannot be wrapped: ${decoded.errors.join(" ")}`
          : "Raw Base64 is empty."
      );
    }

    output = canonicalPem(label, decoded.canonical, newline);

    decoded.warnings.forEach((warning) => {
      issues.unshift({
        severity: "note",
        title: "Raw Base64 normalized",
        message: warning,
      });
    });

    return {
      blocks: [],
      output,
      issues,
      outsideText: [],
      totalBytes: decoded.bytes.length,
    };
  }

  if (!parsed.blocks.length) {
    throw new Error(
      "No PEM BEGIN/END block was found. Choose Wrap Raw Base64 if the input is only Base64."
    );
  }

  if (options.actionMode === "normalize") {
    output = normalizeExistingBlocks(parsed.blocks, newline);
  } else {
    output = extractBase64(parsed.blocks, newline);
  }

  return {
    blocks: parsed.blocks,
    output,
    issues,
    outsideText: parsed.outsideText,
    totalBytes: parsed.blocks.reduce(
      (sum, block) => sum + block.decodedBytes,
      0
    ),
  };
}

function formatReport(result: PemResult) {
  const lines = [
    "PEM encoding review",
    `Blocks: ${result.blocks.length}`,
    `Decoded bytes: ${result.totalBytes}`,
  ];

  result.blocks.forEach((block) => {
    lines.push(
      "",
      `Block ${block.index}: ${block.beginLabel}`,
      `Kind: ${block.classification}`,
      `END label: ${block.endLabel || "(missing)"}`,
      `Matching boundary: ${block.matchingEnd ? "yes" : "no"}`,
      `Label grammar: ${block.labelValid ? "accepted" : "needs review"}`,
      `Base64: ${block.base64Valid ? "decodable" : "invalid"}`,
      `Decoded bytes: ${block.decodedBytes}`,
      `Non-empty body lines: ${block.lineCount}`
    );
  });

  if (result.issues.length) {
    lines.push(
      "",
      "Review:",
      ...result.issues.map(
        (issue) =>
          `- ${issue.severity.toUpperCase()} — ${issue.title}: ${issue.message}`
      )
    );
  }

  return lines.join("\n");
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [actionMode, setActionMode] = useState<ActionMode>("normalize");
  const [newlineMode, setNewlineMode] = useState<NewlineMode>("lf");
  const [wrapLabel, setWrapLabel] = useState("CERTIFICATE");
  const [result, setResult] = useState<PemResult | null>(null);
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
        actionMode === "wrap"
          ? "Paste raw standard Base64 to wrap."
          : "Paste one or more PEM blocks."
      );
      setResult(null);
      return;
    }

    try {
      setResult(
        buildResult({
          input,
          actionMode,
          newlineMode,
          wrapLabel,
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
          : "Unable to process this PEM/Base64 input."
      );
    }
  };

  const loadExample = () => {
    setInput(SAMPLE_PEM);
    setActionMode("normalize");
    setNewlineMode("lf");
    setWrapLabel("CERTIFICATE");
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setActionMode("normalize");
    setNewlineMode("lf");
    setWrapLabel("CERTIFICATE");
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
      title="PEM Certificate Encoder Decoder"
      description="Normalize RFC 7468-style PEM blocks without collapsing bundles, extract canonical Base64 per block, or wrap raw Base64 using deliberate labels and 64-character generator lines."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <YoryantraSelect
          label="Action"
          value={actionMode}
          onChange={(value: string) => {
            setActionMode(value as ActionMode);
            clearResult();
          }}
          options={[
            { label: "Normalize PEM blocks", value: "normalize" },
            { label: "Extract Base64 per block", value: "extract" },
            { label: "Wrap raw Base64 as PEM", value: "wrap" },
          ]}
        />

        <YoryantraSelect
          label="Generated line endings"
          value={newlineMode}
          onChange={(value: string) => {
            setNewlineMode(value as NewlineMode);
            clearResult();
          }}
          options={[
            { label: "LF", value: "lf" },
            { label: "CRLF", value: "crlf" },
          ]}
        />
      </div>

      {actionMode === "wrap" ? (
        <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block text-sm font-semibold text-gray-900">
            PEM label
          </label>
          <input
            value={wrapLabel}
            onChange={(event: { target: { value: string } }) => {
              setWrapLabel(event.target.value);
              clearResult();
            }}
            list="pem-label-options"
            spellCheck={false}
            className="mt-3 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
          <datalist id="pem-label-options">
            {LABEL_OPTIONS.map((label) => (
              <option key={label} value={label} />
            ))}
          </datalist>
          <p className="mt-2 text-sm text-gray-500">
            Labels are case-sensitive in RFC 7468. Use the label that matches
            the actual encoded structure; changing a label does not convert the
            bytes.
          </p>
        </div>
      ) : null}

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block text-sm font-semibold text-gray-900">
          {actionMode === "wrap" ? "Raw Base64" : "PEM input"}
        </label>
        <textarea
          value={input}
          onChange={(event: { target: { value: string } }) => {
            setInput(event.target.value);
            clearResult();
          }}
          placeholder={actionMode === "wrap" ? "MIIB..." : SAMPLE_PEM}
          spellCheck={false}
          className="mt-3 min-h-[390px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={run} className="yoryantra-btn">
          {actionMode === "normalize"
            ? "Normalize PEM"
            : actionMode === "extract"
            ? "Extract Base64"
            : "Wrap Base64"}
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
            <Stat label="Blocks" value={String(result.blocks.length)} />
            <Stat label="Decoded bytes" value={String(result.totalBytes)} />
            <Stat
              label="Warnings"
              value={String(
                result.issues.filter((issue) => issue.severity === "warning").length
              )}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Generated output
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Generator output uses 64-character Base64 lines except for
                  the final line of each block.
                </p>
              </div>
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

            <pre className="yoryantra-output mt-4 min-h-[320px] max-h-[700px] overflow-auto whitespace-pre-wrap break-words font-mono text-sm">
              {result.output}
            </pre>
          </div>

          {result.blocks.length ? (
            <div className="mt-6 space-y-4">
              {result.blocks.map((block) => (
                <div
                  key={block.index}
                  className="rounded-2xl border border-gray-200 bg-white p-5"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Block {block.index}
                      </div>
                      <h3 className="mt-1 text-lg font-semibold text-gray-900">
                        {block.beginLabel}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {block.classification}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {block.decodedBytes.toLocaleString()} decoded bytes
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <Info
                      label="END boundary"
                      value={block.endLabel || "(missing)"}
                    />
                    <Info
                      label="Boundary match"
                      value={block.matchingEnd ? "yes" : "no"}
                    />
                    <Info
                      label="Base64"
                      value={block.base64Valid ? "decodable" : "invalid"}
                    />
                  </div>

                  {block.errors.length || block.warnings.length ? (
                    <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-700">
                      {block.errors.map((item, index) => (
                        <li key={`e-${index}`}>
                          <strong>Error:</strong> {item}
                        </li>
                      ))}
                      {block.warnings.map((item, index) => (
                        <li key={`w-${index}`}>
                          <strong>Note:</strong> {item}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          {result.issues.length ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h3 className="font-semibold text-gray-700">PEM review</h3>
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
        <pre className="yoryantra-output mt-8 min-h-[300px] whitespace-pre-wrap break-words text-sm">
          Normalized PEM, per-block Base64, boundary diagnostics and decoded
          byte sizes will appear here.
        </pre>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        PEM/Base64 parsing and re-encoding happen on the pasted text in your
        browser. The tool does not upload keys or certificates and does not
        perform trust, signature, certificate-chain or key-pair validation.
        Site-wide analytics or advertising scripts, if enabled, are separate
        from this operation.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            PEM Is a Textual Container Around Binary Structures
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The familiar BEGIN/END lines and Base64 body make binary PKIX, PKCS
            and CMS structures convenient to store in text files. The label
            tells software what kind of inner object it should expect.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Rewrapping the Base64 changes the text representation, not the
            certificate, key or CSR bytes. Changing only the label changes even
            less: it does not convert a PKCS #8 private key into a certificate
            or a CSR into a public key.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-700">
            A Certificate Bundle Is Several PEM Blocks, Not One Bigger Certificate
          </h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            Certificate-chain files commonly concatenate a leaf certificate and
            intermediate certificates. Each object keeps its own{" "}
            <code>BEGIN CERTIFICATE</code>, Base64 body and{" "}
            <code>END CERTIFICATE</code> boundary.
          </p>
          <p className="mt-4 leading-relaxed text-gray-700">
            The older normalization pattern of joining all Base64 bodies and
            wrapping them once destroys those object boundaries. This version
            normalizes every block independently and preserves the original
            block order.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            RFC 7468 Generators Use 64-Character Base64 Lines
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Parsers are deliberately tolerant of several newline conventions
            and can accept other line sizes, but RFC 7468 gives generators a
            concrete output rule: Base64 lines are 64 characters except for the
            final line that carries the remainder.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Normalized output therefore uses 64 rather than offering arbitrary
            “pretty” widths. You can choose LF or CRLF because both newline
            conventions occur in real environments.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            BEGIN and END Labels Are Case-Sensitive and Should Match
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 7468 generator labels are uppercase and the END label must match
            the corresponding BEGIN label. Parsers in the wild can be more
            tolerant, which is why a mismatched file may open in one program and
            fail in another.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Normalization refuses to silently “fix” a mismatched boundary
            because choosing which label is correct requires knowing what the
            inner bytes actually represent.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Historical Labels Can Be Parseable but Poor Generator Output
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 7468 standardizes <code>CERTIFICATE</code> for certificates,{" "}
            <code>X509 CRL</code> for CRLs and{" "}
            <code>CERTIFICATE REQUEST</code> for PKCS #10 requests. It also
            documents historical labels that deployed parsers may encounter.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            A diagnostic parser can recognize historical files while a
            standards-oriented generator should emit the standardized label.
            This tool reports that distinction instead of equating every old
            label.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Private-Key PEM Is Secret Material Even When the Formatting Operation Is Local
          </h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            Certificates and public keys are designed for distribution. Private
            keys are not. Local browser processing avoids intentionally sending
            the key to a formatting API, but clipboard history, screenshots,
            browser extensions, local logs and screen sharing remain real
            exposure paths.
          </p>
          <p className="mt-4 leading-relaxed text-gray-700">
            Prefer test keys when learning or checking formatting. If a
            production private key is accidentally exposed outside its intended
            environment, treat rotation as an operational security decision—not
            as a formatting problem.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Decodable Base64 Does Not Prove the Label Is True
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Any byte sequence can be Base64-encoded and placed between{" "}
            <code>BEGIN CERTIFICATE</code> boundaries. A text formatter can
            prove that those bytes round-trip through Base64, but it has not
            proven they form the ASN.1 Certificate structure implied by the
            label.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Use the PEM Certificate Viewer for field inspection and
            cryptographic/X.509 tooling for chain, signature, hostname,
            revocation or key-match questions.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Legacy PEM Headers Are Not Part of RFC 7468 Textual Encoding
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Older PEM-style encrypted key files can contain lines such as{" "}
            <code>Proc-Type:</code> and <code>DEK-Info:</code> between the
            boundary and encoded data. RFC 7468 explicitly distinguishes its
            textual encoding from legacy PEM and does not define those
            encapsulated headers.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The parser reports header-like body lines rather than silently
            treating punctuation from them as Base64.
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-relaxed text-gray-700">
          <a
            href="https://www.rfc-editor.org/rfc/rfc7468"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--green)] underline underline-offset-4"
          >
            RFC 7468
          </a>{" "}
          is the primary reference for textual boundaries, label grammar,
          multiple instances, Base64 wrapping, parser tolerance and the
          standardized certificate/key/CSR/CRL/CMS labels used by this tool.
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>

          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/pem-certificate-encoder-decoder" />
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
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-2 break-words font-mono text-xs leading-relaxed text-gray-800">
        {value}
      </div>
    </div>
  );
}
