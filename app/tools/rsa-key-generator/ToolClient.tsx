"use client";

import { useRef, useState } from "react";
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
  const [generatedSize, setGeneratedSize] = useState<number | null>(null);
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<CopyTarget>(null);
  const generationRequest = useRef(0);

  const clearGeneratedKeys = () => {
    setGeneratedSize(null);
    setPublicKey("");
    setPrivateKey("");
    setError("");
    setCopied(null);
  };

  const changeKeySize = (value: string) => {
    generationRequest.current += 1;
    setLoading(false);
    setKeySize(Number(value));
    clearGeneratedKeys();
  };

  const generateKeys = async () => {
    if (![2048, 3072, 4096].includes(keySize)) {
      setError("Choose one of the supported RSA modulus lengths.");
      return;
    }

    if (!window.crypto?.subtle) {
      setError(
        "Web Crypto is unavailable in this browser context. Open the HTTPS site in a current browser before generating key material.",
      );
      return;
    }

    const requestedSize = keySize;
    const requestId = generationRequest.current + 1;
    generationRequest.current = requestId;

    setLoading(true);
    setError("");
    setGeneratedSize(null);
    setPublicKey("");
    setPrivateKey("");
    setCopied(null);

    try {
      const keyPair = (await window.crypto.subtle.generateKey(
        {
          name: "RSASSA-PKCS1-v1_5",
          modulusLength: requestedSize,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true,
        ["sign", "verify"],
      )) as CryptoKeyPair;

      const [exportedPublicKey, exportedPrivateKey] = await Promise.all([
        window.crypto.subtle.exportKey("spki", keyPair.publicKey),
        window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey),
      ]);

      if (generationRequest.current !== requestId) {
        return;
      }

      setPublicKey(formatPem(arrayBufferToBase64(exportedPublicKey), "PUBLIC KEY"));
      setPrivateKey(formatPem(arrayBufferToBase64(exportedPrivateKey), "PRIVATE KEY"));
      setGeneratedSize(requestedSize);
    } catch {
      if (generationRequest.current !== requestId) {
        return;
      }

      setError(
        "The browser could not generate and export this RSA key pair. Try another supported modulus length or a current browser with Web Crypto enabled.",
      );
    } finally {
      if (generationRequest.current === requestId) {
        setLoading(false);
      }
    }
  };

  const copyValue = async (value: string, target: Exclude<CopyTarget, null>) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(target);
      setError("");
      window.setTimeout(() => setCopied(null), 1400);
    } catch {
      setError("Copy failed. Select the PEM value and copy it manually.");
      setCopied(null);
    }
  };

  const resetAll = () => {
    generationRequest.current += 1;
    setKeySize(2048);
    setLoading(false);
    clearGeneratedKeys();
  };

  return (
    <ToolShell
      title="RSA Key Generator"
      description="Generate RSA signing keys locally and export SPKI public and PKCS #8 private PEM."
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          RSA modulus length
        </label>

        <YoryantraSelect
          value={String(keySize)}
          onChange={changeKeySize}
          options={[
            { label: "2048-bit", value: "2048" },
            { label: "3072-bit", value: "3072" },
            { label: "4096-bit", value: "4096" },
          ]}
        />

        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Larger moduli take more CPU. Choose the size required by the system
          that will import the key rather than assuming the largest option is
          automatically the right one.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={generateKeys}
          className="yoryantra-btn min-h-11 whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate RSA Signing Keys"}
        </button>

        <button
          onClick={resetAll}
          className="yoryantra-btn-outline min-h-11 whitespace-nowrap"
        >
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {generatedSize && (
        <div className="mt-6 self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
          <strong className="text-gray-900">Generated pair:</strong>{" "}
          {generatedSize}-bit RSA, public exponent 65537. The browser CryptoKey
          objects were created for RSASSA-PKCS1-v1_5 signing and verification
          with SHA-256 before export.
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Public key — SPKI PEM
          </h3>

          {publicKey && (
            <button
              onClick={() => copyValue(publicKey, "public")}
              className="yoryantra-btn-outline min-h-11 self-start whitespace-nowrap text-sm sm:self-auto"
            >
              {copied === "public" ? "Copied" : "Copy Public Key"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output min-h-[180px] overflow-auto whitespace-pre font-mono text-sm">
          {publicKey || "Generated SPKI public key will appear here."}
        </pre>
      </div>

      <div className="mt-8">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Private key — unencrypted PKCS #8 PEM
          </h3>

          {privateKey && (
            <button
              onClick={() => copyValue(privateKey, "private")}
              className="yoryantra-btn-outline min-h-11 self-start whitespace-nowrap text-sm sm:self-auto"
            >
              {copied === "private" ? "Copied" : "Copy Private Key"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output min-h-[220px] overflow-auto whitespace-pre font-mono text-sm">
          {privateKey || "Generated PKCS #8 private key will appear here."}
        </pre>
      </div>

      <div className="mt-8 self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
        <h3 className="text-sm font-semibold text-amber-900">
          Exportable means the private key can leave the CryptoKey object
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-amber-800">
          Generation and export happen in the current browser tab. The private
          key is deliberately extractable because PEM output is the purpose of
          the page, and the PKCS #8 block is not password-encrypted. Copying it
          places key material on the clipboard. Reset removes the displayed
          strings from page state, but it cannot promise secure erasure from
          JavaScript engine memory, browser history mechanisms, extensions, or
          clipboard history.
        </p>
      </div>

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            The browser creates a signing key pair, not a certificate
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Web Crypto generates two related RSA keys. The private key can create
            signatures and the public key can verify them. The selected browser
            algorithm is <code>RSASSA-PKCS1-v1_5</code> with SHA-256 and public
            exponent 65537.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            A certificate is a separate signed structure that binds a public key
            to identity and policy information. A certificate signing request is
            separate too. Neither one is created here, and the PEM blocks do not
            establish trust on their own.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            SPKI and PKCS #8 tell another program how the key is packaged
          </h2>
          <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
              <h3 className="font-semibold text-gray-900">SPKI public key</h3>
              <p className="mt-2 leading-relaxed">
                <code>SubjectPublicKeyInfo</code> carries the public-key algorithm
                identifier and RSA public-key bytes. PEM uses the
                <code> PUBLIC KEY</code> label around the DER encoding.
              </p>
            </div>
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
              <h3 className="font-semibold text-gray-900">PKCS #8 private key</h3>
              <p className="mt-2 leading-relaxed">
                The exported private-key structure is wrapped with the
                <code> PRIVATE KEY</code> label. It is unencrypted, unlike an
                <code> ENCRYPTED PRIVATE KEY</code> container.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            SHA-256 belongs to the Web Crypto key configuration, not the PEM label
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A subtle interoperability detail matters here. Web Crypto creates the
            in-memory keys under the RSASSA-PKCS1-v1_5 + SHA-256 configuration,
            but its RSA SPKI and PKCS #8 export uses the generic
            <code> rsaEncryption</code> algorithm identifier. The exported key
            encoding does not record a permanent “SHA-256 only” rule.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Another platform may be able to import the same RSA key material for
            RSA-PSS or RSA-OAEP when its API and policy allow that use. That does
            not mean signature padding and encryption padding are interchangeable;
            the receiving protocol still has to specify the correct RSA scheme.
          </p>
          <p className="mt-3 text-sm text-gray-600">
            Reference:{" "}
            <a
              href="https://www.w3.org/TR/webcrypto/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-gray-900 underline underline-offset-4"
            >
              Web Cryptography API — RSASSA-PKCS1-v1_5 export rules
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Choosing 2048, 3072, or 4096 bits is a compatibility decision too
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            NIST SP 800-131A Rev. 2 requires an RSA modulus of at least 2048 bits
            for the minimum 112-bit security-strength requirement in the U.S.
            federal guidance it covers. That is why 1024-bit generation is not an
            option here. Other organizations can impose different lifetimes,
            algorithms, hardware limits, or profiles.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Moving from 2048 to 3072 or 4096 bits increases key size and the cost
            of private-key operations. Before choosing, check the protocol,
            certificate profile, HSM, library, or service that will consume the
            key. A larger modulus does not repair an incompatible signature
            algorithm or weak private-key storage.
          </p>
          <p className="mt-3 text-sm text-gray-600">
            Reference:{" "}
            <a
              href="https://csrc.nist.gov/pubs/sp/800/131/a/r2/final"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-gray-900 underline underline-offset-4"
            >
              NIST SP 800-131A Rev. 2
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Where the exported blocks fit—and where they do not
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-gray-600">
            <li>They can be used where software explicitly accepts an RSA SPKI public key and unencrypted PKCS #8 private key.</li>
            <li>They are not OpenSSH key files and do not include SSH comments or authorized-keys formatting.</li>
            <li>They are not X.509 certificates, certificate signing requests, JWK documents, or PKCS #12 bundles.</li>
            <li>The private key has no passphrase protection; encrypt it or import it into appropriate key storage before any workflow that requires protected-at-rest key material.</li>
            <li>Production key generation may need an HSM, KMS, audited entropy source, non-exportable key policy, rotation process, and access controls that a browser page cannot provide.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            The two container standards are worth naming precisely
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 5280 defines the <code>SubjectPublicKeyInfo</code> structure used
            for the public export. RFC 5958 documents asymmetric private-key
            packages and the PKCS #8-style <code>PRIVATE KEY</code> textual form.
            RFC 7468 describes the surrounding BEGIN/END textual encoding and
            64-character Base64 line wrapping.
          </p>
          <p className="mt-3 text-sm text-gray-600">
            References:{" "}
            <a
              href="https://www.rfc-editor.org/rfc/rfc5280.html"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-gray-900 underline underline-offset-4"
            >
              RFC 5280
            </a>
            {" · "}
            <a
              href="https://www.rfc-editor.org/rfc/rfc5958.html"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-gray-900 underline underline-offset-4"
            >
              RFC 5958
            </a>
            {" · "}
            <a
              href="https://www.rfc-editor.org/rfc/rfc7468.html"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-gray-900 underline underline-offset-4"
            >
              RFC 7468
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/rsa-key-generator" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
