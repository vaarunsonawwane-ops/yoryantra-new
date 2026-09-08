"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type RawPemBlock = {
  label: string;
  bodyLines: string[];
  startLine: number;
};

type NormalizedBase64 = {
  canonical: string;
  byteCount: number;
  paddingAdded: boolean;
};

type FormatResult = {
  formatted: string;
  details: string[];
  warnings: string[];
};

type CopyState = "pem" | null;

const BEGIN_BOUNDARY = /^-----BEGIN (.*?)-----[\t ]*$/;
const END_BOUNDARY = /^-----END (.*?)-----[\t ]*$/;

const FOREIGN_ARMOR_LABELS = new Set([
  "OPENSSH PRIVATE KEY",
  "PGP MESSAGE",
  "PGP PUBLIC KEY BLOCK",
  "PGP PRIVATE KEY BLOCK",
  "PGP SIGNATURE",
]);

function isRfc7468Label(label: string) {
  if (!label) {
    return false;
  }

  let previousWasSeparator = false;

  for (let index = 0; index < label.length; index += 1) {
    const character = label[index];

    if (character === " " || character === "-") {
      if (index === 0 || index === label.length - 1 || previousWasSeparator) {
        return false;
      }

      previousWasSeparator = true;
      continue;
    }

    const code = character.charCodeAt(0);

    if (code < 0x21 || code > 0x7e || character === "-") {
      return false;
    }

    previousWasSeparator = false;
  }

  return !previousWasSeparator;
}

function bytesToBinary(bytes: Uint8Array) {
  let binary = "";

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return binary;
}

function binaryToBytes(binary: string) {
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function wrapBase64(value: string) {
  return value.match(/.{1,64}/g)?.join("\n") || value;
}

function normalizeBase64Body(bodyLines: string[], blockNumber: number): NormalizedBase64 {
  const legacyHeader = bodyLines.find((line) => /^[A-Za-z0-9-]+\s*:/.test(line.trim()));

  if (legacyHeader) {
    throw new Error(
      `Block ${blockNumber} contains a legacy PEM-style header (${legacyHeader.trim()}). RFC 7468 textual encoding does not place headers inside the encapsulation boundaries, so it is not safe to strip or rewrite that line as Base64.`,
    );
  }

  const compact = bodyLines.join("").replace(/\s+/g, "");

  if (!compact) {
    throw new Error(`Block ${blockNumber} has no Base64 body content.`);
  }

  if (/[^A-Za-z0-9+/=]/.test(compact)) {
    throw new Error(
      `Block ${blockNumber} contains a character outside the standard Base64 alphabet.`,
    );
  }

  const paddingMatch = compact.match(/=+$/);
  const paddingCount = paddingMatch ? paddingMatch[0].length : 0;

  if (paddingCount > 2) {
    throw new Error(`Block ${blockNumber} has more than two trailing Base64 padding characters.`);
  }

  const core = paddingCount > 0
    ? compact.slice(0, compact.length - paddingCount)
    : compact;

  if (core.includes("=")) {
    throw new Error(`Block ${blockNumber} has Base64 padding before the end of the body.`);
  }

  const remainder = core.length % 4;

  if (remainder === 1) {
    throw new Error(
      `Block ${blockNumber} has an impossible Base64 length. Check for a missing or extra character.`,
    );
  }

  const expectedPadding = (4 - remainder) % 4;

  if (paddingCount > 0 && paddingCount !== expectedPadding) {
    throw new Error(
      `Block ${blockNumber} has ${paddingCount} padding character${paddingCount === 1 ? "" : "s"}, but its length requires ${expectedPadding}.`,
    );
  }

  const padded = core + "=".repeat(expectedPadding);
  let bytes: Uint8Array;

  try {
    bytes = binaryToBytes(atob(padded));
  } catch {
    throw new Error(`Block ${blockNumber} could not be decoded as Base64.`);
  }

  const canonical = btoa(bytesToBinary(bytes));
  const canonicalCore = canonical.replace(/=+$/g, "");

  if (core !== canonicalCore) {
    throw new Error(
      `Block ${blockNumber} decodes, but its unused Base64 pad bits are not canonical. Re-export the original object instead of preserving an ambiguous Base64 spelling.`,
    );
  }

  return {
    canonical,
    byteCount: bytes.length,
    paddingAdded: paddingCount === 0 && expectedPadding > 0,
  };
}

function parsePemBlocks(input: string) {
  const normalizedInput = input.replace(/\r\n?/g, "\n");
  const lines = normalizedInput.split("\n");
  const blocks: RawPemBlock[] = [];
  const outsideText: string[] = [];
  let current: RawPemBlock | null = null;

  for (let zeroBasedLine = 0; zeroBasedLine < lines.length; zeroBasedLine += 1) {
    const line = lines[zeroBasedLine];
    const lineNumber = zeroBasedLine + 1;
    const beginMatch = line.match(BEGIN_BOUNDARY);
    const endMatch = line.match(END_BOUNDARY);

    if (beginMatch) {
      if (current) {
        throw new Error(
          `Line ${lineNumber} starts a new PEM block before BEGIN ${current.label} has a matching END boundary.`,
        );
      }

      const label = beginMatch[1];

      if (!isRfc7468Label(label)) {
        throw new Error(
          `Line ${lineNumber} has a malformed PEM label. Labels cannot start or end with a space or hyphen, and separators cannot repeat.`,
        );
      }

      if (FOREIGN_ARMOR_LABELS.has(label.toUpperCase())) {
        throw new Error(
          `${label} uses a different armored file format rather than the RFC 7468-style PEM encoding handled here. Preserve it with software that understands that format.`,
        );
      }

      current = { label, bodyLines: [], startLine: lineNumber };
      continue;
    }

    if (endMatch) {
      if (!current) {
        throw new Error(`Line ${lineNumber} has an END boundary without a matching BEGIN boundary.`);
      }

      const endLabel = endMatch[1];

      if (!isRfc7468Label(endLabel)) {
        throw new Error(`Line ${lineNumber} has a malformed END label.`);
      }

      if (current.label !== endLabel) {
        throw new Error(
          `Block beginning on line ${current.startLine} opens as ${current.label} but closes as ${endLabel}.`,
        );
      }

      blocks.push(current);
      current = null;
      continue;
    }

    if (line.includes("-----BEGIN") || line.includes("-----END")) {
      throw new Error(
        `Line ${lineNumber} looks like a PEM boundary but does not use the expected five-dash BEGIN/END form.`,
      );
    }

    if (current) {
      current.bodyLines.push(line);
    } else if (line.trim()) {
      outsideText.push(line.trim());
    }
  }

  if (current) {
    throw new Error(
      `BEGIN ${current.label} on line ${current.startLine} has no matching END boundary.`,
    );
  }

  if (blocks.length === 0) {
    throw new Error(
      "No complete PEM block was found. Bare Base64 is not assigned a certificate or key label automatically.",
    );
  }

  return { blocks, outsideText };
}

function formatPemContent(input: string): FormatResult {
  const { blocks, outsideText } = parsePemBlocks(input);
  const warnings: string[] = [];
  const details: string[] = [];
  const formattedBlocks: string[] = [];

  if (outsideText.length > 0) {
    warnings.push(
      `Text outside the PEM boundaries was omitted (${outsideText.length} non-empty line${outsideText.length === 1 ? "" : "s"}). Check that nothing important was pasted before or after the block.`,
    );
  }

  blocks.forEach((block, index) => {
    const blockNumber = index + 1;
    const normalizedBody = normalizeBase64Body(block.bodyLines, blockNumber);

    if (block.label !== block.label.toUpperCase()) {
      warnings.push(
        `Block ${blockNumber} uses label ${block.label}. RFC 7468 labels are formally case-sensitive and uppercase; the label was preserved rather than silently changed.`,
      );
    }

    if (normalizedBody.paddingAdded) {
      warnings.push(
        `Block ${blockNumber} was missing final Base64 padding. The required = character${normalizedBody.canonical.endsWith("==") ? "s were" : " was"} restored from the decoded byte length.`,
      );
    }

    if (block.label.toUpperCase().includes("PRIVATE KEY")) {
      warnings.push(
        `Block ${blockNumber} is labelled ${block.label}. Treat the formatted output and clipboard as private-key material.`,
      );
    }

    const wrappedBody = wrapBase64(normalizedBody.canonical);
    const lineCount = wrappedBody.split("\n").length;

    details.push(
      `Block ${blockNumber}: ${block.label} · ${normalizedBody.byteCount} decoded byte${normalizedBody.byteCount === 1 ? "" : "s"} · ${lineCount} Base64 line${lineCount === 1 ? "" : "s"}.`,
    );

    formattedBlocks.push(
      `-----BEGIN ${block.label}-----\n${wrappedBody}\n-----END ${block.label}-----`,
    );
  });

  return {
    formatted: formattedBlocks.join("\n\n"),
    details,
    warnings,
  };
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [details, setDetails] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<CopyState>(null);

  const clearResult = () => {
    setOutput("");
    setDetails([]);
    setWarnings([]);
    setError("");
    setCopied(null);
  };

  const formatPem = () => {
    if (!input.trim()) {
      setError("Paste a PEM block before formatting.");
      setOutput("");
      setDetails([]);
      setWarnings([]);
      setCopied(null);
      return;
    }

    try {
      const result = formatPemContent(input);

      setOutput(result.formatted);
      setDetails(result.details);
      setWarnings(result.warnings);
      setError("");
      setCopied(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The PEM text could not be formatted.");
      setOutput("");
      setDetails([]);
      setWarnings([]);
      setCopied(null);
    }
  };

  const loadExample = () => {
    setInput(`-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEaOm6aUPSPtQXA8uOJIGS7tx0lsQE2ykMqWK+r7FZzSA036PKCbFde2NLVdWeqSniYWJDHZJzXMgEwkatNvZHWg==
-----END PUBLIC KEY-----`);
    clearResult();
  };

  const copyPem = async () => {
    if (!output) {
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      setCopied("pem");
      window.setTimeout(() => setCopied(null), 1400);
    } catch {
      setError("Copy failed. Select the formatted PEM and copy it manually.");
      setCopied(null);
    }
  };

  const resetAll = () => {
    setInput("");
    clearResult();
  };

  return (
    <ToolShell
      title="PEM Formatter"
      description="Normalize PEM boundaries and Base64 wrapping without guessing the encoded object type."
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          PEM input
        </label>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            clearResult();
          }}
          placeholder={`-----BEGIN CERTIFICATE-----
MIID...base64...data
-----END CERTIFICATE-----`}
          className="min-h-[260px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={formatPem} className="yoryantra-btn min-h-11 whitespace-nowrap">
          Format PEM
        </button>

        <button onClick={loadExample} className="yoryantra-btn-outline min-h-11 whitespace-nowrap">
          Load Example
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline min-h-11 whitespace-nowrap">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 overflow-auto rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Formatted PEM</h3>

          {output && (
            <button
              onClick={copyPem}
              className="yoryantra-btn-outline min-h-11 self-start whitespace-nowrap text-sm sm:self-auto"
            >
              {copied === "pem" ? "Copied" : "Copy PEM"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output min-h-[240px] overflow-auto whitespace-pre font-mono text-sm">
          {output || "Formatted PEM output will appear here."}
        </pre>
      </div>

      {(details.length > 0 || warnings.length > 0) && (
        <div className="mt-6 grid items-start gap-4 md:grid-cols-2">
          {details.length > 0 && (
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
              <h3 className="text-sm font-semibold text-gray-900">What changed</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-gray-700">
                {details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </div>
          )}

          {warnings.length > 0 && (
            <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-semibold text-amber-900">Check before copying</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-amber-800">
                {warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
        <h3 className="text-sm font-semibold text-amber-900">Private-key text deserves private-key handling</h3>
        <p className="mt-2 text-sm leading-relaxed text-amber-800">
          Formatting runs on the pasted string in the current browser tab; no
          formatter endpoint is needed. That does not protect a key from browser
          extensions, clipboard history, screen capture, shared-device access,
          or backups. Prefer a non-production sample when the real private key is
          not required for the task.
        </p>
      </div>

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            PEM is a boundary plus Base64, not a certificate format by itself
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A PEM-style block is a textual envelope around Base64-encoded bytes.
            The label says what those bytes are supposed to represent:
            <code> CERTIFICATE</code>, <code>PUBLIC KEY</code>,
            <code> PRIVATE KEY</code>, <code>CERTIFICATE REQUEST</code>, and
            several other labels are used by PKIX and related formats.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Rewrapping Base64 cannot turn one object type into another. A block
            labelled <code>PUBLIC KEY</code> is expected to contain a public-key
            structure, but formatting alone does not ASN.1-decode the bytes to
            prove that the label is truthful.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why the output returns to 64 characters per Base64 line
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 7468 requires generators for these textual encodings to wrap the
            Base64 body at exactly 64 characters per line except for the final
            line. Parsers in the wild are often more tolerant, which is why
            copied keys and certificates may arrive with unusual wrapping or
            extra whitespace.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The formatter removes whitespace from the body, decodes the Base64,
            checks canonical pad bits, restores required padding when it was
            omitted, and re-encodes the same bytes before applying 64-character
            wrapping. BEGIN and END labels are preserved exactly when they match.
          </p>
          <p className="mt-3 text-sm text-gray-600">
            Reference:{" "}
            <a
              href="https://www.rfc-editor.org/rfc/rfc7468.html"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-gray-900 underline underline-offset-4"
            >
              RFC 7468 — Textual Encodings of PKIX, PKCS, and CMS Structures
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Some damage can be repaired; some should stop the conversion
          </h2>
          <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
              <h3 className="font-semibold text-gray-900">Safe normalization</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 leading-relaxed">
                <li>CRLF, CR, and LF line endings can be read.</li>
                <li>Whitespace inside a Base64 body can be removed.</li>
                <li>Missing final Base64 padding can be reconstructed from length.</li>
                <li>Several complete PEM blocks can be emitted in order.</li>
              </ul>
            </div>
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
              <h3 className="font-semibold text-gray-900">Stop and investigate</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 leading-relaxed">
                <li>BEGIN and END labels do not match.</li>
                <li>A boundary is incomplete, nested, or malformed.</li>
                <li>The Base64 alphabet, length, padding, or pad bits are invalid.</li>
                <li>Legacy header lines appear inside the encapsulated body.</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Text outside a block is different from text inside it
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 7468 allows parsers to encounter text before or after an
            encapsulated object. Here, non-empty outside text is omitted from the
            formatted PEM and surfaced as a warning so a copied comment, shell
            prompt, or certificate-chain note is not silently folded into the
            Base64 body.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Legacy PEM encryption headers such as <code>Proc-Type:</code> or
            <code>DEK-Info:</code> are a different syntax. They are rejected
            rather than stripped because removing those lines can destroy the
            information needed to interpret an encrypted legacy key.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Formatting cannot answer certificate or key-validity questions
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-gray-600">
            <li>Certificate trust, expiry, hostname matching, revocation, and extensions are not evaluated.</li>
            <li>A private key is not compared with a certificate or public key.</li>
            <li>Encrypted private keys are not decrypted and passphrases are never requested.</li>
            <li>The ASN.1 object inside the Base64 bytes is not parsed to confirm it matches the boundary label.</li>
            <li>OpenSSH private-key files and OpenPGP ASCII armor are different textual formats and are outside the PEM normalization covered here.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/pem-formatter" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
