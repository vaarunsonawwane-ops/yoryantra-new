"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type PEMBlock = {
  type: string;
  body: string;
  decodedText: string;
  byteLength: number;
  details: string[];
};

const samplePem = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKZ4YoryantraDemoOnlyMA0GCSqGSIb3DQEBCwUAMEUx
CzAJBgNVBAYTAklOMRIwEAYDVQQKDAlZb3J5YW50cmExIjAgBgNVBAMMGXlvcnlh
bnRyYS5leGFtcGxlIGRlbW8gY2VydDAeFw0yNjAxMDEwMDAwMDBaFw0yNzAxMDEw
MDAwMDBaMEUxCzAJBgNVBAYTAklOMRIwEAYDVQQKDAlZb3J5YW50cmExIjAgBgNV
BAMMGXlvcnlhbnRyYS5leGFtcGxlIGRlbW8gY2VydDCCASIwDQYJKoZIhvcNAQEB
BQADggEPADCCAQoCggEBAKDemoCertificateForViewingOnlyDoNotUseInProd
uctionYoryantraBrowserToolExampleCertificateDataOnly1234567890abcde
fghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghij
klmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZExampleCertificateContent
ForPEMViewerToolOnlyDoNotUseAsRealCertificateDataYoryantraDemoCA==
-----END CERTIFICATE-----`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const inspectCertificate = () => {
    if (!input.trim()) {
      setError("Please enter PEM certificate content to inspect.");
      setOutput("");
      return;
    }

    try {
      const blocks = parsePEMBlocks(input);

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
      description="Inspect PEM certificate blocks, decode readable certificate data, and review certificate content directly in your browser."
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
          Paste a PEM certificate, certificate chain, public certificate block,
          or certificate-like PEM content.
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
            Certificate Report
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
        This tool is for quick PEM inspection in the browser. Do not paste
        private keys or sensitive production secrets into tools unless you are
        sure what they contain.
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Inspecting PEM Certificates Before Using Them in Security Workflows
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            PEM files are commonly used for SSL certificates, certificate
            chains, public keys, private keys, and X.509 certificate data. When
            working with HTTPS, APIs, proxies, servers, or security headers, it
            is useful to quickly check what kind of PEM block you have.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This PEM Certificate Viewer helps you inspect PEM blocks, check
            certificate boundaries, estimate decoded size, identify certificate
            block types, and review readable decoded content directly in your
            browser before using the certificate in configuration or debugging.
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
            <li>Review detected PEM block types, decoded size, and readable fields.</li>
            <li>Use the report to check certificate content before configuration work.</li>
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
            <li>Inspecting decoded certificate text during HTTPS debugging.</li>
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
                A PEM Certificate Viewer reads PEM blocks and shows useful
                details such as block type, decoded size, detected certificate
                boundaries, and readable decoded content when available.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this fully decode every X.509 certificate field?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                This browser tool provides quick PEM inspection and readable
                decoded content where possible. Full ASN.1/X.509 field parsing
                can require a dedicated certificate parser.
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

function parsePEMBlocks(source: string): PEMBlock[] {
  const pattern =
    /-----BEGIN ([A-Z0-9 ]+)-----([\s\S]*?)-----END \1-----/g;

  const blocks: PEMBlock[] = [];
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(source)) !== null) {
    const type = match[1].trim();
    const body = match[2].replace(/\s+/g, "");

    if (!body) {
      continue;
    }

    const decoded = decodeBase64ToText(body);
    const byteLength = estimateByteLength(body);

    blocks.push({
      type,
      body,
      decodedText: decoded,
      byteLength,
      details: buildBlockDetails(type, body, decoded, byteLength),
    });
  }

  return blocks;
}

function buildBlockDetails(
  type: string,
  body: string,
  decodedText: string,
  byteLength: number
) {
  const details = [
    `Type: ${type}`,
    `Base64 characters: ${body.length}`,
    `Estimated decoded size: ${byteLength} bytes`,
  ];

  if (type === "CERTIFICATE") {
    details.push("Block kind: X.509 certificate or certificate chain item");
  } else if (type.includes("PRIVATE KEY")) {
    details.push("Block kind: Private key");
    details.push("Warning: private keys should be handled carefully.");
  } else if (type.includes("PUBLIC KEY")) {
    details.push("Block kind: Public key");
  } else if (type.includes("CERTIFICATE REQUEST")) {
    details.push("Block kind: Certificate signing request");
  } else {
    details.push("Block kind: PEM encoded data");
  }

  if (decodedText.trim()) {
    details.push("Readable decoded text: detected");
  } else {
    details.push("Readable decoded text: not detected");
  }

  return details;
}

function formatReport(blocks: PEMBlock[]) {
  const lines = [
    "PEM certificate inspection completed.",
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
      lines.push("Readable decoded preview:");
      lines.push(block.decodedText.slice(0, 800));
    }

    lines.push("");
  });

  return lines.join("\n").trim();
}

function decodeBase64ToText(value: string) {
  try {
    const binary = atob(value);
    const text = Array.from(binary)
      .map((char) => {
        const code = char.charCodeAt(0);

        if (code >= 32 && code <= 126) {
          return char;
        }

        if (code === 10 || code === 13 || code === 9) {
          return char;
        }

        return ".";
      })
      .join("");

    const readableCount = text
      .split("")
      .filter((char) => /[A-Za-z0-9\s:.,/_=-]/.test(char)).length;

    if (readableCount < text.length * 0.45) {
      return "";
    }

    return text;
  } catch {
    throw new Error("Invalid base64 content inside one or more PEM blocks.");
  }
}

function estimateByteLength(value: string) {
  const padding = (value.match(/=+$/)?.[0].length || 0);
  return Math.max(0, Math.floor((value.length * 3) / 4) - padding);
}
