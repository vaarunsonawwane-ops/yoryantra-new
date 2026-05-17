"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [length, setLength] =
    useState(32);

  const [output, setOutput] =
    useState("");

  const generateToken = () => {
    const safeLength =
      Math.min(
        Math.max(length, 8),
        256
      );

    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    const randomValues =
      new Uint32Array(
        safeLength
      );

    let result = "";

    window.crypto.getRandomValues(
      randomValues
    );

    for (
      let i = 0;
      i < safeLength;
      i++
    ) {
      result +=
        chars[
          randomValues[i] %
            chars.length
        ];
    }

    setOutput(result);
  };

  const resetAll = () => {
    setLength(32);
    setOutput("");
  };

  return (
    <ToolShell
      title="Random Token Generator"
      description="Generate secure random tokens, secret strings, and unique identifiers instantly with this free online Random Token Generator."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Token Length
        </label>

        <input
          type="number"
          min="8"
          max="256"
          value={length}
          onChange={(e) =>
            setLength(
              Number(
                e.target.value
              )
            )
          }
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={generateToken}
          className="yoryantra-btn"
        >
          Generate Token
        </button>

        <button
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Generated Random Token
          </h3>

          {output && (
            <button
              onClick={() =>
                navigator.clipboard.writeText(
                  output
                )
              }
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <div className="yoryantra-output min-h-[160px] flex items-center text-sm break-words whitespace-pre-wrap overflow-auto">
          {output ||
            "Generated random token will appear here..."}
        </div>
      </div>

      {/* PRIVACY */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Privacy Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          Random token generation happens locally inside your browser using
          secure cryptographic randomness. Generated tokens are not uploaded,
          stored, or processed on any external server.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Generating Random Tokens for APIs, Sessions, and Testing
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Random token generation helps developers create secure API tokens,
            session identifiers, temporary access strings, webhook secrets,
            authentication values, verification codes, testing credentials, and
            unique identifiers used across modern applications and backend
            systems.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Random tokens are commonly used in authentication systems, API
            security, password reset workflows, OAuth integrations, cloud
            infrastructure, DevOps environments, and temporary access control
            systems where uniqueness and unpredictability are important.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Random Token Generator creates secure tokens directly inside
            your browser using the Web Crypto API without requiring backend
            processing or external services.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Random Token Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Choose the token length.
            </li>

            <li>
              Click{" "}
              <strong>
                Generate Token
              </strong>.
            </li>

            <li>
              Review the generated
              random token instantly.
            </li>

            <li>
              Copy the token for your
              application, API, or
              testing workflow.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Generating API access
              tokens.
            </li>

            <li>
              Creating secure session
              identifiers.
            </li>

            <li>
              Generating webhook
              verification secrets.
            </li>

            <li>
              Creating temporary
              authentication values.
            </li>

            <li>
              Generating random test
              credentials.
            </li>

            <li>
              Building password reset
              and verification
              workflows.
            </li>

            <li>
              Creating unique access
              strings for development
              systems.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Random Token
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <p className="font-medium text-gray-900">
              Example generated token:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`qM7kLp2xW9vBa8NdR4sHt1YuE6zFc0Jp`}
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              Example API usage:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`Authorization: Bearer your_random_token`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why Random Tokens Matter in Security Workflows
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>
                  Better security:
                </strong>{" "}
                Random tokens reduce
                predictability in
                authentication systems.
              </li>

              <li>
                <strong>
                  Safer APIs:
                </strong>{" "}
                Unique access tokens
                improve API security
                workflows.
              </li>

              <li>
                <strong>
                  Cleaner testing:
                </strong>{" "}
                Generate temporary
                identifiers for
                development and QA
                environments.
              </li>

              <li>
                <strong>
                  Improved reliability:
                </strong>{" "}
                Strong randomness helps
                prevent token
                collisions and weak
                identifiers.
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
                What is a random token?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A random token is a uniquely generated string commonly used for
                authentication, session management, APIs, verification systems,
                and temporary credentials.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this Random Token Generator secure?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Tokens are generated directly inside your browser using the
                Web Crypto API for secure randomness.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Which token length should I use?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A 32-character token is common for most applications. Longer
                tokens provide stronger randomness and uniqueness.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I use generated tokens for APIs?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Random tokens are commonly used in APIs, authentication
                systems, webhooks, and temporary access workflows.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are generated tokens uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Token generation happens entirely inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            Random token generation often connects with API authentication,
            session management, JWT workflows, security testing, backend
            development, and DevOps systems.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/api-key-generator"
              className="yoryantra-btn-outline"
            >
              API Key Generator
            </Link>

            <Link
              href="/tools/password-generator"
              className="yoryantra-btn-outline"
            >
              Password Generator
            </Link>

            <Link
              href="/tools/hmac-generator"
              className="yoryantra-btn-outline"
            >
              HMAC Generator
            </Link>

            <Link
              href="/tools/uuid-generator"
              className="yoryantra-btn-outline"
            >
              UUID Generator
            </Link>

            <Link
              href="/tools/rsa-key-generator"
              className="yoryantra-btn-outline"
            >
              RSA Key Generator
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}