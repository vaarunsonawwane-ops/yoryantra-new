"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

function decodeBase64Url(value: string) {
  const normalized = value
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const padded =
    normalized + "=".repeat((4 - (normalized.length % 4)) % 4);

  const binary = atob(padded);

  return Uint8Array.from(binary, (character) =>
    character.charCodeAt(0)
  );
}

function decodeJWTHeader(value: string) {
  try {
    const bytes = decodeBase64Url(value);
    const text = new TextDecoder().decode(bytes);
    const header = JSON.parse(text) as { alg?: unknown; typ?: unknown };

    if (
      !header ||
      typeof header !== "object" ||
      Array.isArray(header)
    ) {
      throw new Error();
    }

    return header;
  } catch {
    throw new Error(
      "The JWT header is not valid Base64URL-encoded JSON."
    );
  }
}

export default function ToolClient() {
  const [token, setToken] = useState("");
  const [secret, setSecret] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const verifyJWT = async () => {
    try {
      const cleanedToken = token.trim();
      const cleanedSecret = secret;

      if (!cleanedToken) {
        throw new Error("Please enter a JWT token.");
      }

      if (!cleanedSecret) {
        throw new Error("Please enter the expected HS256 secret.");
      }

      const parts = cleanedToken.split(".");

      if (parts.length !== 3 || parts.some((part) => !part)) {
        throw new Error(
          "Enter a compact JWT with three dot-separated sections."
        );
      }

      const header = decodeJWTHeader(parts[0]);

      if (header.alg !== "HS256") {
        throw new Error(
          `This tool verifies HS256 tokens only. The JWT header declares ${
            typeof header.alg === "string" ? header.alg : "no supported algorithm"
          }.`
        );
      }

      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(cleanedSecret),
        {
          name: "HMAC",
          hash: "SHA-256",
        },
        false,
        ["verify"]
      );

      let signature: Uint8Array;

      try {
        signature = decodeBase64Url(parts[2]);
      } catch {
        throw new Error("The JWT signature is not valid Base64URL data.");
      }

      const signatureBuffer = signature.buffer.slice(
        signature.byteOffset,
        signature.byteOffset + signature.byteLength
      ) as ArrayBuffer;

      const data = encoder.encode(`${parts[0]}.${parts[1]}`);
      const dataBuffer = data.buffer.slice(
        data.byteOffset,
        data.byteOffset + data.byteLength
      ) as ArrayBuffer;

      const isValid = await crypto.subtle.verify(
        "HMAC",
        key,
        signatureBuffer,
        dataBuffer
      );

      setOutput(
        isValid
          ? [
              "Signature verification passed.",
              "",
              "Algorithm: HS256",
              "The signature matches the token header and payload for the secret you entered.",
              "",
              "This result does not confirm claim validity, expiry, issuer, audience, or whether the application should accept the token.",
            ].join("\n")
          : [
              "Signature verification failed.",
              "",
              "The signature does not match the token header and payload for the secret you entered.",
              "Check the secret, token value, and signing algorithm.",
            ].join("\n")
      );

      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to verify this JWT signature."
      );
      setOutput("");
    }
  };

  const resetAll = () => {
    setToken("");
    setSecret("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="JWT Signature Verifier"
      description="Verify whether an HS256 JWT signature matches the token header and payload for the shared secret you enter."
    >
      {/* TOKEN */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          JWT Token
        </label>

        <textarea
          value={token}
          onChange={(e) =>
            setToken(e.target.value)
          }
          placeholder="Paste JWT token here..."
          className="w-full min-h-[180px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* SECRET */}
      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Secret Key
        </label>

        <input
          type="password"
          value={secret}
          onChange={(e) =>
            setSecret(e.target.value)
          }
          placeholder="Enter the expected HS256 secret..."
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={verifyJWT}
          className="yoryantra-btn"
        >
          Verify JWT Signature
        </button>

        <button
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Verification Result
          </h3>

          {output && (
            <button
              onClick={() =>
                navigator.clipboard.writeText(output)
              }
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <div className="yoryantra-output min-h-[160px] text-sm whitespace-pre-wrap break-words">
          {output ||
            "JWT verification result will appear here..."}
        </div>
      </div>

      {/* SECURITY NOTE */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Security Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          Verification happens locally inside your browser. Avoid using live
          production tokens or secrets unless you understand the risk. A valid
          signature confirms integrity for the supplied secret, not that the
          claims are acceptable or the token should be trusted.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Verifying JWT Signatures Before Trusting Tokens
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            HS256 uses one shared secret to create and verify an HMAC-SHA256
            signature. Verification checks whether the encoded header and
            payload match the signature for the secret you provide.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This tool reads the algorithm declared in the JWT header and only
            proceeds when it is exactly HS256. Tokens using RS256, ES256, none,
            or another algorithm require a different verification method.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A successful signature check does not validate exp, nbf, iss, aud,
            permissions, revocation, or application policy. Those checks must be
            performed separately.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the JWT Signature Verifier
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Paste your JWT token into the editor.
            </li>

            <li>
              Enter the secret key used to sign the token.
            </li>

            <li>
              Click <strong>Verify JWT Signature</strong>.
            </li>

            <li>
              Review the result, then validate the token claims and application rules separately.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Testing JWT authentication systems.</li>

            <li>Debugging invalid token signature errors.</li>

            <li>Inspecting HS256-signed JWT tokens.</li>

            <li>Verifying API authentication workflows.</li>

            <li>Checking token integrity during development.</li>

            <li>Testing session and authorization systems.</li>

            <li>Debugging OAuth and backend authentication flows.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Understanding JWT Signature Verification
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Header:</strong> Contains token metadata and signing
                algorithm details.
              </li>

              <li>
                <strong>Payload:</strong> Contains claims, permissions, and
                token information.
              </li>

              <li>
                <strong>Signature:</strong> Confirms whether the token was
                signed using the correct secret key.
              </li>

              <li>
                <strong>Verification:</strong> Helps detect modified or invalid
                tokens during authentication workflows.
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Verification Workflow
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <pre className="whitespace-pre-wrap break-words">
{`1. Paste JWT token
2. Enter secret key
3. Verify signature
4. Review claims and application rules separately`}
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
                What is JWT signature verification?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It checks whether the JWT signature matches the encoded header
                and payload for the shared HS256 secret you entered.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Which JWT algorithm does this tool support?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                This verifier currently supports HS256 JWT signature
                verification using HMAC SHA-256.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this tool decode JWT payloads?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                This tool focuses on signature verification. You can use the
                JWT Decoder tool to inspect payload data separately.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are JWT secrets uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Verification happens locally inside your browser and secrets
                are not uploaded or stored.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why would JWT verification fail?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Verification can fail because of invalid signatures, incorrect
                secrets, modified payloads, unsupported algorithms, or malformed
                tokens.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/jwt-signature-verifier" />
        </div>
      </section>
    </ToolShell>
  );
}