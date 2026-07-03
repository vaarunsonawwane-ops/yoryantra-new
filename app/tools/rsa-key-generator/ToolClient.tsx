"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type CopyTarget = "public" | "private" | null;

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return window.btoa(binary);
}

function formatPem(base64: string, type: "PUBLIC KEY" | "PRIVATE KEY") {
  const lines = base64.match(/.{1,64}/g)?.join("\n") || base64;
  return `-----BEGIN ${type}-----\n${lines}\n-----END ${type}-----`;
}

export default function ToolClient() {
  const [keySize, setKeySize] = useState(2048);
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<CopyTarget>(null);

  const generateKeys = async () => {
    if (![2048, 3072, 4096].includes(keySize)) {
      setError("Choose a supported RSA modulus length.");
      return;
    }

    setLoading(true);
    setError("");
    setPublicKey("");
    setPrivateKey("");
    setCopied(null);

    try {
      const keyPair = (await window.crypto.subtle.generateKey(
        {
          name: "RSASSA-PKCS1-v1_5",
          modulusLength: keySize,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true,
        ["sign", "verify"]
      )) as CryptoKeyPair;

      const [exportedPublicKey, exportedPrivateKey] = await Promise.all([
        window.crypto.subtle.exportKey("spki", keyPair.publicKey),
        window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey),
      ]);

      setPublicKey(
        formatPem(arrayBufferToBase64(exportedPublicKey), "PUBLIC KEY")
      );
      setPrivateKey(
        formatPem(arrayBufferToBase64(exportedPrivateKey), "PRIVATE KEY")
      );
    } catch {
      setError(
        "Your browser could not generate or export this RSA key pair. Try another supported key size or browser."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyValue = async (value: string, target: Exclude<CopyTarget, null>) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(target);
      window.setTimeout(() => setCopied(null), 1400);
    } catch {
      setError("Copy failed. Select the PEM value and copy it manually.");
    }
  };

  const resetAll = () => {
    setKeySize(2048);
    setPublicKey("");
    setPrivateKey("");
    setLoading(false);
    setError("");
    setCopied(null);
  };

  return (
    <ToolShell
      title="RSA Key Generator"
      description="Generate extractable RSA signing key pairs locally and export SPKI public keys and unencrypted PKCS8 private keys in PEM format."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          RSA Modulus Length
        </label>

        <YoryantraSelect
          value={String(keySize)}
          onChange={(value: string) => setKeySize(Number(value))}
          options={[
            { label: "2048-bit", value: "2048" },
            { label: "3072-bit", value: "3072" },
            { label: "4096-bit", value: "4096" },
          ]}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={generateKeys}
          className="yoryantra-btn"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate RSA Signing Keys"}
        </button>

        <button
          onClick={resetAll}
          className="yoryantra-btn-outline"
          disabled={loading}
        >
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Public Key — SPKI PEM
          </h3>

          {publicKey && (
            <button
              onClick={() => copyValue(publicKey, "public")}
              className="yoryantra-btn-outline text-sm"
            >
              {copied === "public" ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output min-h-[180px] overflow-auto whitespace-pre-wrap break-all text-sm">
          {publicKey || "Generated SPKI public key will appear here."}
        </pre>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Private Key — Unencrypted PKCS8 PEM
          </h3>

          {privateKey && (
            <button
              onClick={() => copyValue(privateKey, "private")}
              className="yoryantra-btn-outline text-sm"
            >
              {copied === "private" ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output min-h-[220px] overflow-auto whitespace-pre-wrap break-all text-sm">
          {privateKey || "Generated PKCS8 private key will appear here."}
        </pre>
      </div>

      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Private Key Warning
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          Generation and export happen locally with Web Crypto. The private key
          is extractable and exported without password-based encryption. Do not
          use a browser-generated private key in a sensitive production system
          unless your security process explicitly allows this workflow. Copying
          the key places it on the clipboard.
        </p>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Generating RSA Signing Keys in Browser-Compatible Formats
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This tool asks Web Crypto to create an RSASSA-PKCS1-v1_5 key pair
            configured with SHA-256 and public exponent 65537. The public key is
            exported as SubjectPublicKeyInfo (SPKI), while the private key is
            exported as unencrypted PKCS8.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            These outputs can help with local testing, signature experiments,
            and systems that explicitly accept these formats. They are not SSH
            key files, certificate requests, certificates, or encrypted private
            keys.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the RSA Key Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Select a modulus length supported by the tool.</li>
            <li>Click <strong>Generate RSA Signing Keys</strong>.</li>
            <li>Copy the SPKI public key only where a public key is expected.</li>
            <li>Handle the unencrypted PKCS8 private key as sensitive material.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Output and Algorithm Details
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li><strong>Algorithm:</strong> RSASSA-PKCS1-v1_5 with SHA-256.</li>
              <li><strong>Public exponent:</strong> 65537.</li>
              <li><strong>Public output:</strong> SPKI PEM labelled PUBLIC KEY.</li>
              <li><strong>Private output:</strong> Unencrypted PKCS8 PEM labelled PRIVATE KEY.</li>
              <li><strong>Key usage:</strong> Signing and signature verification.</li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Important Format Boundaries
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>The output is not an OpenSSH private or public key.</li>
            <li>The tool does not create a certificate or certificate signing request.</li>
            <li>The private key is not protected by a passphrase.</li>
            <li>A system expecting RSA-PSS or RSA-OAEP may require a different algorithm configuration.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">Can I use these keys for SSH?</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                Not directly. SSH commonly expects OpenSSH-specific formats and metadata. Use an SSH-focused key-generation tool for that workflow.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Does this create an SSL or TLS certificate?</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                No. It creates only an RSA key pair. A certificate also contains identity, validity, extensions, and a certificate-authority signature.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Why is 1024-bit unavailable?</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                The tool excludes 1024-bit generation because it is too small for new general-purpose security deployments.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Are the private keys encrypted?</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The PKCS8 output is unencrypted. Store it only through a process designed for sensitive private-key material.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/rsa-key-generator" />
        </div>
      </section>
    </ToolShell>
  );
}
