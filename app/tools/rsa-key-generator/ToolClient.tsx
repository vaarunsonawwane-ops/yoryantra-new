"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

export default function ToolClient() {
  const [keySize, setKeySize] =
    useState(2048);

  const [publicKey, setPublicKey] =
    useState("");

  const [privateKey, setPrivateKey] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const arrayBufferToBase64 = (
    buffer: ArrayBuffer
  ) => {
    const bytes =
      new Uint8Array(buffer);

    let binary = "";

    bytes.forEach((b) => {
      binary +=
        String.fromCharCode(b);
    });

    return window.btoa(binary);
  };

  const formatPEM = (
    base64: string,
    type:
      | "PUBLIC KEY"
      | "PRIVATE KEY"
  ) => {
    const lines = base64
      .match(/.{1,64}/g)
      ?.join("\n") || base64;

    return `-----BEGIN ${type}-----\n${lines}\n-----END ${type}-----`;
  };

  const generateKeys =
    async () => {
      try {
        setLoading(true);

        const keyPair =
          await window.crypto.subtle.generateKey(
            {
              name: "RSASSA-PKCS1-v1_5",
              modulusLength:
                keySize,
              publicExponent:
                new Uint8Array([
                  1, 0, 1,
                ]),
              hash: "SHA-256",
            },
            true,
            ["sign", "verify"]
          );

        const exportedPublicKey =
          await window.crypto.subtle.exportKey(
            "spki",
            keyPair.publicKey
          );

        const exportedPrivateKey =
          await window.crypto.subtle.exportKey(
            "pkcs8",
            keyPair.privateKey
          );

        const publicPem =
          formatPEM(
            arrayBufferToBase64(
              exportedPublicKey
            ),
            "PUBLIC KEY"
          );

        const privatePem =
          formatPEM(
            arrayBufferToBase64(
              exportedPrivateKey
            ),
            "PRIVATE KEY"
          );

        setPublicKey(publicPem);

        setPrivateKey(
          privatePem
        );
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

        <YoryantraSelect
          value={String(keySize)}
          onChange={(value) =>
            setKeySize(
              Number(value)
            )
          }
          options={[
            {
              label: "1024",
              value: "1024",
            },
            {
              label: "2048 Recommended",
              value: "2048",
            },
            {
              label: "4096 High Security",
              value: "4096",
            },
          ]}
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={generateKeys}
          className="yoryantra-btn"
          disabled={loading}
        >
          {loading
            ? "Generating..."
            : "Generate RSA Keys"}
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
              onClick={() =>
                navigator.clipboard.writeText(
                  publicKey
                )
              }
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <div className="yoryantra-output min-h-[180px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {publicKey ||
            "Generated RSA public key will appear here..."}
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
              onClick={() =>
                navigator.clipboard.writeText(
                  privateKey
                )
              }
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <div className="yoryantra-output min-h-[220px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {privateKey ||
            "Generated RSA private key will appear here..."}
        </div>
      </div>

      {/* PRIVACY */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Privacy Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          RSA key generation happens locally inside your browser using the Web
          Crypto API. Your keys are never uploaded, stored, or processed on any
          external server.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Generating RSA Keys for JWTs, APIs, and Certificates
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            RSA key generation helps developers create secure public and private
            key pairs for JWT authentication, SSL certificates, API security,
            SSH access, digital signatures, encrypted communication, OAuth
            workflows, and backend authentication systems.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            RSA is one of the most widely used public-key cryptography
            algorithms in modern infrastructure. Applications use public keys
            for verification and encryption, while private keys remain secret
            for signing and authentication operations.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This RSA Key Generator creates PEM-formatted RSA keys directly
            inside your browser using the Web Crypto API without requiring
            backend services or external APIs.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the RSA Key Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Select the RSA key size.
            </li>

            <li>
              Click{" "}
              <strong>
                Generate RSA Keys
              </strong>.
            </li>

            <li>
              Review the generated
              public and private keys.
            </li>

            <li>
              Copy the PEM-formatted
              keys for your security
              workflow.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Generating RSA keys for
              JWT signing.
            </li>

            <li>
              Creating SSH and
              encryption key pairs.
            </li>

            <li>
              Building secure API
              authentication systems.
            </li>

            <li>
              Testing public-key
              cryptography workflows.
            </li>

            <li>
              Generating keys for SSL
              certificates.
            </li>

            <li>
              Creating signing keys
              for OAuth systems.
            </li>

            <li>
              Learning RSA encryption
              and verification
              workflows.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Recommended RSA Key Sizes
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>
                  1024-bit:
                </strong>{" "}
                Older systems and
                testing only.
              </li>

              <li>
                <strong>
                  2048-bit:
                </strong>{" "}
                Recommended for most
                applications and APIs.
              </li>

              <li>
                <strong>
                  4096-bit:
                </strong>{" "}
                Higher security but
                slower cryptographic
                operations.
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why RSA Keys Matter in Security Workflows
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>
                  Secure authentication:
                </strong>{" "}
                RSA keys are widely
                used for JWT signing
                and identity
                verification.
              </li>

              <li>
                <strong>
                  Safer APIs:
                </strong>{" "}
                Public-key encryption
                improves API security
                workflows.
              </li>

              <li>
                <strong>
                  SSL and certificates:
                </strong>{" "}
                RSA remains common in
                HTTPS and certificate
                management systems.
              </li>

              <li>
                <strong>
                  Modern infrastructure:
                </strong>{" "}
                Cloud platforms,
                DevOps systems, and
                authentication
                providers rely heavily
                on RSA cryptography.
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
                Public keys can be shared openly for verification and
                encryption, while private keys must remain secret for signing
                and authentication.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this RSA Key Generator secure?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Key generation happens directly inside your browser using
                the Web Crypto API.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Which RSA key size should I choose?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                2048-bit RSA is recommended for most modern applications.
                4096-bit provides stronger security but may be slower.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are generated keys uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. RSA key generation happens entirely inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            RSA key generation often connects with JWT authentication, SSL
            certificates, API security, PEM formatting, OAuth workflows, and
            backend cryptography systems.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/pem-formatter"
              className="yoryantra-btn-outline"
            >
              PEM Formatter
            </Link>

            <Link
              href="/tools/jwt-signature-verifier"
              className="yoryantra-btn-outline"
            >
              JWT Signature Verifier
            </Link>

            <Link
              href="/tools/base64url-encoder-decoder"
              className="yoryantra-btn-outline"
            >
              Base64URL Encoder Decoder
            </Link>

            <Link
              href="/tools/hmac-generator"
              className="yoryantra-btn-outline"
            >
              HMAC Generator
            </Link>

            <Link
              href="/tools/api-key-generator"
              className="yoryantra-btn-outline"
            >
              API Key Generator
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}