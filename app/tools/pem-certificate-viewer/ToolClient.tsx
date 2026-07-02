"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type PEMBlock = {
  type: string;
  decodedText: string;
  byteLength: number;
  fingerprint: string;
  details: string[];
};

const samplePem = `-----BEGIN CERTIFICATE-----
MIIDdzCCAl+gAwIBAgIUEWJo+4I40rD6MijWN5/vN4um3JkwDQYJKoZIhvcNAQEL
BQAwSzEgMB4GA1UEAwwXZXhhbXBsZS55b3J5YW50cmEubG9jYWwxGjAYBgNVBAoM
EVlvcnlhbnRyYSBFeGFtcGxlMQswCQYDVQQGEwJJTjAeFw0yNjA3MDIyMDMzNTZa
Fw0zNjA2MjkyMDMzNTZaMEsxIDAeBgNVBAMMF2V4YW1wbGUueW9yeWFudHJhLmxv
Y2FsMRowGAYDVQQKDBFZb3J5YW50cmEgRXhhbXBsZTELMAkGA1UEBhMCSU4wggEi
MA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDXBPmJlcJ99acPgtpgFSWSGiBU
qW41piAf2hFgj2D4CfsHNHP7xrkClKTCHe7VKW+Bm5J33gIGw2UXZjCfjEzCnF7F
ajEeqtCRy9apmKJajihrhOeniIrW44F0XnRILizDQUPpLw8YTHKMdICPHApF/uxZ
ArRA+ImWuqkkZqEitEVM14FbtDbuuEqZOF9DuhnafD6SKRF/4NBZwATx6NhY3pYW
Z1eeTJitnrH6YZb/9aSleYalHWVpoLW+GWnzR4QJmLKLLmWWCqNdjhVdF8DJcQ1K
jzfrDurUlbRnSR8s25l3dTb/Di+dJ+JKw6Jv3nkxIDSCmZ+LYZv8YVd2vS+/AgMB
AAGjUzBRMB0GA1UdDgQWBBQol4hxmGMZjhRIoqRh2IvowsrwszAfBgNVHSMEGDAW
gBQol4hxmGMZjhRIoqRh2IvowsrwszAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3
DQEBCwUAA4IBAQChXspLybcoenxVRqgZBki8bvjlOxfzgRjBNNvcfOPXNSdkR62N
SxnoZCfn8w3bgpbgOkfX+gxY7760p4gcL/VmK4LF8TX49oF7jQCmlLSoZoM6rEdQ
d94eRqyWszzY3Fx9CN+1U4RNwMi+p0gc85QNfjWBcMLhxzAvQ5AyjMMQCJeQ7sjX
IQipn8aS8K8XRvO/zwuVh8v+66weuRStqrwwfuOyQ4g7DeAxDOeSX9B8blXKQagL
NVS1jtHoGZMJA29gADtEXvncO44eiNxEdFntbntYfUtWRR1qoKRgXiZCZHL/NP6X
CNWDOSynE/maGlKGXXKCaDeG025xqn2w/qxd
-----END CERTIFICATE-----`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const inspectCertificate = async () => {
    if (!input.trim()) {
      setError("Please enter PEM certificate content to inspect.");
      setOutput("");
      return;
    }

    try {
      const blocks = await parsePEMBlocks(input);

      if (!blocks.length) {
        setError("No PEM certificate blocks were found.");
        setOutput("");
        return;
      }

      setOutput(formatReport(blocks));
      setError("");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to inspect this PEM certificate.";

      setError(message);
      setOutput("");
    }
  };

  const loadExample = () => {
    setInput(samplePem);
    setOutput("");
    setError("");
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="PEM Certificate Viewer"
      description="Inspect PEM block types, decoded byte size, SHA-256 fingerprints, and certificate boundaries directly in your browser."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          PEM Certificate Input
        </label>

        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={samplePem}
          className="w-full min-h-[280px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste a certificate, certificate chain, public key, CSR, or other
          PEM block. Avoid private keys and sensitive production material.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={inspectCertificate} className="yoryantra-btn">
          Inspect Certificate
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

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            PEM Inspection Report
          </h3>

          {output && (
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[260px] whitespace-pre-wrap break-words">
          {output || "PEM certificate inspection results will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        This tool checks PEM structure and decoded bytes. It does not fully
        parse X.509 fields, verify a certificate chain, match a private key,
        confirm hostname coverage, or establish trust. Avoid private keys and
        sensitive production material.
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Inspecting PEM Certificates Before Using Them in Security Workflows
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            PEM is a text wrapper around Base64-encoded binary data. It is used
            for certificates, certificate requests, public keys, private keys,
            and other security material. The BEGIN and END labels identify the
            intended block type.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This viewer validates the Base64 body, reports the decoded byte
            size, calculates a SHA-256 fingerprint, and shows a limited readable
            byte preview. It is a structure inspector rather than a complete
            X.509 certificate parser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reviewing Certificate Blocks in the Browser
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste PEM certificate content into the input box.</li>
            <li>
              Click <strong>Inspect Certificate</strong>.
            </li>
            <li>Review block types, decoded size, fingerprints, and readable byte previews.</li>
            <li>Use the report as an initial check before using a dedicated X.509 or chain validator.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common PEM Certificate Viewer Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Checking whether a PEM block is a certificate, key, or chain.</li>
            <li>Inspecting certificate-like content copied from configuration files.</li>
            <li>Reviewing PEM boundaries such as BEGIN CERTIFICATE and END CERTIFICATE.</li>
            <li>Checking certificate chains before server or proxy configuration.</li>
            <li>Comparing SHA-256 fingerprints while moving certificate files between systems.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example PEM Certificate Block
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{samplePem}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What does a PEM Certificate Viewer do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It reads PEM boundaries, validates the Base64 body, identifies
                the block label, reports decoded size, and calculates a SHA-256
                fingerprint for the decoded bytes.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this fully decode every X.509 certificate field?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. This tool does not fully parse ASN.1 or display every subject,
                issuer, validity, extension, SAN, or signature field. Use a
                dedicated X.509 parser for those details.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Should I paste private keys into this tool?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Avoid pasting private keys unless you are certain it is safe.
                This tool runs in your browser, but private keys and production
                secrets should always be handled carefully.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my PEM certificate uploaded to a server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The PEM inspection happens directly in your browser. Your
                certificate content is not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/pem-certificate-viewer" />
        </div>
      </section>
    </ToolShell>
  );
}

async function parsePEMBlocks(source: string): Promise<PEMBlock[]> {
  const pattern =
    /-----BEGIN ([A-Z0-9][A-Z0-9 -]*[A-Z0-9])-----([\s\S]*?)-----END \1-----/g;

  const blocks: PEMBlock[] = [];
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(source)) !== null) {
    const type = match[1].trim();
    const body = match[2].replace(/\s+/g, "");

    if (!body) {
      throw new Error(`The ${type} block does not contain Base64 data.`);
    }

    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(body) || body.length % 4 === 1) {
      throw new Error(`The ${type} block contains invalid Base64 data.`);
    }

    const bytes = decodeBase64(body);
    const fingerprint = await sha256Fingerprint(bytes);
    const decodedText = readablePreview(bytes);

    blocks.push({
      type,
      decodedText,
      byteLength: bytes.byteLength,
      fingerprint,
      details: buildBlockDetails(
        type,
        body.length,
        bytes.byteLength,
        fingerprint,
        decodedText
      ),
    });
  }

  return blocks;
}

function buildBlockDetails(
  type: string,
  base64Length: number,
  byteLength: number,
  fingerprint: string,
  decodedText: string
) {
  const details = [
    `Type: ${type}`,
    `Base64 characters: ${base64Length}`,
    `Decoded size: ${byteLength} bytes`,
    `SHA-256 fingerprint: ${fingerprint}`,
  ];

  if (type === "CERTIFICATE") {
    details.push("Block kind: X.509 certificate or certificate chain item");
  } else if (type.includes("PRIVATE KEY")) {
    details.push("Block kind: Private key");
    details.push("Warning: avoid sharing private key material.");
  } else if (type.includes("PUBLIC KEY")) {
    details.push("Block kind: Public key");
  } else if (
    type.includes("CERTIFICATE REQUEST") ||
    type.includes("NEW CERTIFICATE REQUEST")
  ) {
    details.push("Block kind: Certificate signing request");
  } else {
    details.push("Block kind: PEM-encoded data");
  }

  details.push(
    decodedText.trim()
      ? "Readable byte preview: available"
      : "Readable byte preview: not available"
  );

  return details;
}

function formatReport(blocks: PEMBlock[]) {
  const lines = [
    "PEM inspection completed.",
    "",
    `PEM blocks found: ${blocks.length}`,
    "",
  ];

  blocks.forEach((block, index) => {
    lines.push(`Block ${index + 1}`);
    block.details.forEach((detail) => {
      lines.push(`- ${detail}`);
    });

    if (block.decodedText.trim()) {
      lines.push("");
      lines.push("Readable byte preview:");
      lines.push(block.decodedText);
    }

    lines.push("");
  });

  lines.push(
    "Note: This report does not validate certificate trust, hostname coverage, expiry, chain order, or private-key pairing."
  );

  return lines.join("\n").trim();
}

function decodeBase64(value: string) {
  try {
    const binary = atob(value);

    return Uint8Array.from(binary, (character) =>
      character.charCodeAt(0)
    );
  } catch {
    throw new Error("Invalid Base64 content inside a PEM block.");
  }
}

function readablePreview(bytes: Uint8Array) {
  const preview = Array.from(bytes.slice(0, 800))
    .map((byte) => {
      if (byte >= 32 && byte <= 126) {
        return String.fromCharCode(byte);
      }

      if (byte === 10 || byte === 13 || byte === 9) {
        return String.fromCharCode(byte);
      }

      return ".";
    })
    .join("");

  const readableCount = [...preview].filter((character) =>
    /[A-Za-z0-9\s:.,/_=+-]/.test(character)
  ).length;

  return readableCount >= preview.length * 0.45 ? preview : "";
}

async function sha256Fingerprint(bytes: Uint8Array) {
  const buffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;

  const digest = await crypto.subtle.digest("SHA-256", buffer);

  const hex = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0").toUpperCase()
  ).join("");

  return hex.match(/.{2}/g)?.join(":") || hex;
}
