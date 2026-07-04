"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type PemBlock = {
  beginLabel: string;
  endLabel: string;
  body: string;
  start: number;
  end: number;
};

type FormatResult = {
  formatted: string;
  report: string;
};

const PEM_BLOCK_REGEX =
  /-----BEGIN ([A-Za-z0-9][A-Za-z0-9 ._-]{0,80})-----([\s\S]*?)-----END ([A-Za-z0-9][A-Za-z0-9 ._-]{0,80})-----/g;

function normalizeLabel(label: string) {
  return label.trim().replace(/\s+/g, " ");
}

function wrapBase64(value: string) {
  return value.match(/.{1,64}/g)?.join("\n") || value;
}

function findPemBlocks(input: string) {
  const blocks: PemBlock[] = [];
  const ranges: Array<[number, number]> = [];

  for (const match of input.matchAll(PEM_BLOCK_REGEX)) {
    const matchedText = match[0];
    const start = match.index ?? 0;
    const end = start + matchedText.length;

    blocks.push({
      beginLabel: normalizeLabel(match[1]),
      endLabel: normalizeLabel(match[3]),
      body: match[2],
      start,
      end,
    });

    ranges.push([start, end]);
  }

  return { blocks, ranges };
}

function getTextOutsideRanges(input: string, ranges: Array<[number, number]>) {
  let cursor = 0;
  let outside = "";

  for (const [start, end] of ranges) {
    outside += input.slice(cursor, start);
    cursor = end;
  }

  outside += input.slice(cursor);
  return outside;
}

function formatPemContent(input: string): FormatResult {
  const { blocks, ranges } = findPemBlocks(input);

  if (blocks.length === 0) {
    const hasBegin = /-----BEGIN /.test(input);
    const hasEnd = /-----END /.test(input);

    if (hasBegin || hasEnd) {
      throw new Error(
        "PEM boundaries were found, but a complete matching BEGIN and END block could not be parsed. Check the labels and dashes."
      );
    }

    throw new Error(
      "No complete PEM block was found. This formatter does not guess a PEM label for bare Base64 text. Add the correct BEGIN and END lines first."
    );
  }

  const warnings: string[] = [];
  const formattedBlocks: string[] = [];
  const outsideText = getTextOutsideRanges(input, ranges).trim();

  if (outsideText) {
    warnings.push(
      "Text was found outside the PEM block boundaries. It was not included in the formatted output."
    );
  }

  blocks.forEach((block, index) => {
    if (block.beginLabel !== block.endLabel) {
      throw new Error(
        `Block ${index + 1} has mismatched labels: BEGIN ${block.beginLabel} and END ${block.endLabel}.`
      );
    }

    const cleanedBody = block.body.replace(/\s+/g, "");

    if (!cleanedBody) {
      throw new Error(`Block ${index + 1} has no Base64 body content.`);
    }

    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(cleanedBody)) {
      throw new Error(
        `Block ${index + 1} contains characters that are not valid for a standard PEM Base64 body.`
      );
    }

    if (cleanedBody.length % 4 === 1) {
      throw new Error(
        `Block ${index + 1} has an invalid Base64 length. Check whether characters were removed while copying.`
      );
    }

    if (cleanedBody.length % 4 !== 0) {
      warnings.push(
        `Block ${index + 1} has Base64 length that is not a multiple of 4. Some tools may reject missing padding.`
      );
    }

    if (block.beginLabel.toUpperCase().includes("PRIVATE KEY")) {
      warnings.push(
        `Block ${index + 1} is a private key. Format private keys only on a device and browser session you trust.`
      );
    }

    formattedBlocks.push(
      `-----BEGIN ${block.beginLabel}-----\n${wrapBase64(cleanedBody)}\n-----END ${block.beginLabel}-----`
    );
  });

  const formatted = formattedBlocks.join("\n\n");
  const report = [
    "PEM Formatting Report",
    "=====================",
    `Blocks formatted: ${blocks.length}`,
    "Line wrapping: 64 Base64 characters per line, except the final line",
    "Labels: preserved from the matching BEGIN and END boundaries",
    "",
    "Warnings",
    "--------",
    warnings.length > 0 ? warnings.map((item) => `- ${item}`).join("\n") : "No warnings.",
    "",
    "Important Limit",
    "---------------",
    "This tool normalizes PEM text and checks basic structure. It does not decrypt keys, verify certificates, validate trust chains, or prove that the encoded object is safe to use.",
  ].join("\n");

  return { formatted, report };
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [report, setReport] = useState("");
  const [error, setError] = useState("");

  const formatPEM = () => {
    try {
      if (!input.trim()) {
        setError("Please enter PEM content.");
        setOutput("");
        setReport("");
        return;
      }

      const result = formatPemContent(input);

      setOutput(result.formatted);
      setReport(result.report);
      setError("");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to format PEM content."
      );
      setOutput("");
      setReport("");
    }
  };

  const loadExample = () => {
    setInput(`-----BEGIN CERTIFICATE-----
MIIDdzCCAl+gAwIBAgIEbmhvZzANBgkqhkiG9w0BAQsFADBvMQswCQYDVQQGEwJJ
TjEQMA4GA1UECAwHTWFoYXJhMTEQMA4GA1UEBwwHUG9vdmFsMRAwDgYDVQQKDAdF
eGFtcGxlMRAwDgYDVQQLDAdUZXN0aW5nMRIwEAYDVQQDDAlsb2NhbGhvc3Q=
-----END CERTIFICATE-----`);
    setOutput("");
    setReport("");
    setError("");
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setReport("");
    setError("");
  };

  return (
    <ToolShell
      title="PEM Formatter"
      description="Format PEM certificates, public keys, private keys, CSRs, and multiple PEM blocks with safer label checks and 64-character line wrapping."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          PEM Input
        </label>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`-----BEGIN CERTIFICATE-----
MIID...base64...data
-----END CERTIFICATE-----`}
          className="w-full min-h-[260px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={formatPEM} className="yoryantra-btn">
          Format PEM
        </button>

        <button onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 overflow-auto">
          {error}
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Formatted PEM Output
          </h3>

          {output && (
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy PEM
            </button>
          )}
        </div>

        <div className="yoryantra-output min-h-[240px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {output || "Formatted PEM output will appear here..."}
        </div>
      </div>

      {report && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 whitespace-pre-wrap overflow-auto">
          {report}
        </div>
      )}

      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Private Key Safety Note
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          PEM formatting runs locally in your browser and does not upload your
          content. Still, private keys are sensitive. Avoid pasting production
          private keys on shared devices, public computers, or untrusted browser
          sessions.
        </p>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Formatting PEM Certificates and Keys Safely
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            PEM files are text blocks that usually contain certificates, public
            keys, private keys, CSRs, CRLs, or other cryptographic material. A
            PEM block has a BEGIN line, a Base64 body, and a matching END line.
            Many servers and libraries expect the Base64 body to be wrapped in
            clean lines.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This formatter preserves the PEM label, checks matching BEGIN and
            END boundaries, removes extra whitespace inside the Base64 body, and
            wraps the output into standard 64-character lines. It also supports
            multiple PEM blocks, such as certificate chains.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool does not guess a missing label. If you paste bare Base64
            text without BEGIN and END lines, it asks you to add the correct PEM
            boundaries instead of inventing a private-key or certificate label.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the PEM Formatter
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste a full PEM block with BEGIN and END lines.</li>
            <li>Click <strong>Format PEM</strong>.</li>
            <li>Review label warnings, Base64 warnings, and private-key cautions.</li>
            <li>Copy the formatted PEM only after checking that the label is correct.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Formatting public keys and private keys copied from dashboards.</li>
            <li>Cleaning SSL and TLS certificate blocks before server setup.</li>
            <li>Checking BEGIN and END label mismatches.</li>
            <li>Formatting certificate chains that contain multiple PEM blocks.</li>
            <li>Preparing JWT signing keys for local development.</li>
            <li>Removing broken whitespace from copied PEM values.</li>
            <li>Keeping Base64 body lines readable and consistent.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example PEM Structure
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <p className="font-medium text-gray-900">Input can be messy:</p>
            <pre className="mt-2 whitespace-pre-wrap break-words">
{`-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtestdata...
-----END PUBLIC KEY-----`}
            </pre>

            <p className="mt-4 font-medium text-gray-900">Formatted output keeps the same label:</p>
            <pre className="mt-2 whitespace-pre-wrap break-words">
{`-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtestdata...
-----END PUBLIC KEY-----`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            What This Formatter Checks
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Matching labels:</strong> BEGIN CERTIFICATE must close
                with END CERTIFICATE, not a different label.
              </li>
              <li>
                <strong>Base64 body shape:</strong> The tool checks for invalid
                characters and suspicious Base64 length.
              </li>
              <li>
                <strong>Multiple blocks:</strong> Certificate chains and other
                repeated PEM blocks can be formatted together.
              </li>
              <li>
                <strong>No trust validation:</strong> Formatting does not prove
                that a certificate is trusted or that a private key matches a
                certificate.
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">What is PEM format?</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                PEM is a text encoding style commonly used for certificates,
                public keys, private keys, CSRs, CRLs, and related security
                files. The content is usually Base64 data wrapped by BEGIN and
                END lines.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why are PEM lines wrapped at 64 characters?
              </h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                Standard PEM generators wrap the Base64 body into 64-character
                lines, except for the final line. This improves compatibility
                with tools that expect traditional PEM text formatting.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this tool change the key or certificate data?
              </h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                It removes whitespace from the Base64 body and rewraps the text.
                It does not decrypt, regenerate, or intentionally change the
                encoded object.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this verify a certificate chain?
              </h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                No. This is a formatter. It does not validate trust chains,
                expiry, hostname matching, issuer trust, revocation, or key
                usage.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are PEM values uploaded anywhere?
              </h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Formatting happens locally in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <YoryantraRelatedTools currentHref="/tools/pem-formatter" />
        </div>
      </section>
    </ToolShell>
  );
}
