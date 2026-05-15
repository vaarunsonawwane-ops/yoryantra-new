"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [keySize, setKeySize] = useState(2048);
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [loading, setLoading] = useState(false);

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    const bytes = new Uint8Array(buffer);

    let binary = "";

    bytes.forEach((b) => {
      binary += String.fromCharCode(b);
    });

    return window.btoa(binary);
  };

  const formatPEM = (
    base64: string,
    type: "PUBLIC KEY" | "PRIVATE KEY"
  ) => {
    const lines = base64.match(/.{1,64}/g)?.join("\n") || base64;

    return `-----BEGIN ${type}-----\n${lines}\n-----END ${type}-----`;
  };

  const generateKeys = async () => {
    try {
      setLoading(true);

      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: "RSASSA-PKCS1-v1_5",
          modulusLength: keySize,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true,
        ["sign", "verify"]
      );

      const exportedPublicKey = await window.crypto.subtle.exportKey(
        "spki",
        keyPair.publicKey
      );

      const exportedPrivateKey = await window.crypto.subtle.exportKey(
        "pkcs8",
        keyPair.privateKey
      );

      const publicPem = formatPEM(
        arrayBufferToBase64(exportedPublicKey),
        "PUBLIC KEY"
      );

      const privatePem = formatPEM(
        arrayBufferToBase64(exportedPrivateKey),
        "PRIVATE KEY"
      );

      setPublicKey(publicPem);
      setPrivateKey(privatePem);
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setKeySize(2048);
    setPublicKey("");
    setPrivateKey("");
  };

  return (
    <ToolShell
      title="RSA Key Generator"
      description="Generate RSA public and private key pairs instantly with this free online RSA Key Generator."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          RSA Key Size
        </label>

        <select
          value={keySize}
          onChange={(e) => setKeySize(Number(e.target.value))}
          className="w-full rounded-xl border border-gray-300 bg-white p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        >
          <option value={1024}>1024</option>
          <option value={2048}>2048 Recommended</option>
          <option value={4096}>4096 High Security</option>
        </select>
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={generateKeys}
          className="yoryantra-btn"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate RSA Keys"}
        </button>

        <button
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {/* PUBLIC KEY */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Public Key
          </h3>

          {publicKey && (
            <button
              onClick={() => navigator.clipboard.writeText(publicKey)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <div className="yoryantra-output min-h-[180px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {publicKey || "Generated RSA public key will appear here..."}
        </div>
      </div>

      {/* PRIVATE KEY */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Private Key
          </h3>

          {privateKey && (
            <button
              onClick={() => navigator.clipboard.writeText(privateKey)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <div className="yoryantra-output min-h-[220px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {privateKey || "Generated RSA private key will appear here..."}
        </div>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            About This RSA Key Generator
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This RSA Key Generator helps you generate RSA public and private key
            pairs instantly in your browser. RSA keys are commonly used for
            encryption, authentication, digital signatures, SSH access, JWT
            signing, SSL certificates, and secure communication workflows.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The generated keys are created locally in your browser using the Web
            Crypto API. No keys are uploaded or stored on any server.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the RSA Key Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Select the RSA key size.</li>
            <li>Click <strong>Generate RSA Keys</strong>.</li>
            <li>Copy the generated public and private keys.</li>
            <li>Use the keys in your security or development workflow.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Generating RSA keys for JWT signing.</li>
            <li>Creating SSH or encryption key pairs.</li>
            <li>Testing public-key cryptography workflows.</li>
            <li>Generating keys for authentication systems.</li>
            <li>Learning how RSA encryption works.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Recommended RSA Key Sizes
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>1024-bit:</strong> Older systems and testing only.
              </li>

              <li>
                <strong>2048-bit:</strong> Recommended for most applications.
              </li>

              <li>
                <strong>4096-bit:</strong> Higher security but slower operations.
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
              <h3 className="font-semibold text-gray-900">
                What is RSA?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                RSA is a public-key cryptography algorithm used for encryption,
                authentication, and digital signatures.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is the difference between public and private keys?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                The public key can be shared openly, while the private key must
                remain secret and secure.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this RSA Key Generator secure?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Key generation happens directly in your browser using the
                Web Crypto API.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Which RSA key size should I choose?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                2048-bit RSA is recommended for most modern applications.
                4096-bit provides stronger security but is slower.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/jwt-expiration-checker" className="yoryantra-btn-outline">
              JWT Expiration Checker
            </Link>

            <Link href="/tools/api-key-generator" className="yoryantra-btn-outline">
              API Key Generator
            </Link>

            <Link href="/tools/hmac-generator" className="yoryantra-btn-outline">
              HMAC Generator
            </Link>

            <Link href="/tools/random-token-generator" className="yoryantra-btn-outline">
              Random Token Generator
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}