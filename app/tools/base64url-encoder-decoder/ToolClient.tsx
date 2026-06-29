"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

export default function ToolClient() {
  const [input, setInput] =
    useState("");

  const [output, setOutput] =
    useState("");

  const [error, setError] =
    useState("");

  const toBase64Url = (
    str: string
  ) => {
    return btoa(
      unescape(
        encodeURIComponent(str)
      )
    )
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  };

  const fromBase64Url = (
    str: string
  ) => {
    const base64 = str
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(
        str.length +
          ((4 -
            (str.length % 4)) %
            4),
        "="
      );

    return decodeURIComponent(
      escape(atob(base64))
    );
  };

  const encodeValue = () => {
    try {
      setOutput(
        toBase64Url(input)
      );

      setError("");
    } catch {
      setError(
        "Unable to encode Base64URL value."
      );

      setOutput("");
    }
  };

  const decodeValue = () => {
    try {
      setOutput(
        fromBase64Url(input)
      );

      setError("");
    } catch {
      setError(
        "Invalid Base64URL input."
      );

      setOutput("");
    }
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="Base64URL Encoder Decoder"
      description="Encode and decode Base64URL strings instantly with this free online Base64URL Encoder Decoder."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Input
        </label>

        <textarea
          value={input}
          onChange={(e) =>
            setInput(
              e.target.value
            )
          }
          placeholder="Paste Base64URL or plain text here..."
          className="w-full min-h-[220px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={encodeValue}
          className="yoryantra-btn"
        >
          Encode Base64URL
        </button>

        <button
          onClick={decodeValue}
          className="yoryantra-btn-outline"
        >
          Decode Base64URL
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
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 overflow-auto">
          {error}
        </div>
      )}

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Result
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

        <div className="yoryantra-output min-h-[180px] text-sm break-words whitespace-pre-wrap overflow-auto">
          {output ||
            "Encoded or decoded Base64URL output will appear here..."}
        </div>
      </div>

      {/* PRIVACY */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Privacy Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          Base64URL encoding and decoding happens locally inside your browser.
          Your JWT payloads, API values, authentication data, and encoded
          strings are not uploaded, stored, or processed on any external server.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Encoding Base64URL Strings for JWTs and URLs
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Base64URL encoding and decoding helps developers safely handle JWT
            tokens, OAuth payloads, authentication systems, API data, webhook
            payloads, URL parameters, and encoded values used inside modern web
            applications.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Base64URL is a URL-safe variation of Base64 encoding. It replaces
            special characters such as <code>+</code> and <code>/</code> with
            URL-safe alternatives like <code>-</code> and <code>_</code> so
            encoded values can safely travel through URLs and HTTP systems.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Base64URL Encoder Decoder transforms encoded values directly
            inside your browser without requiring backend processing or external
            APIs.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Base64URL Encoder Decoder
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Paste your plain text or Base64URL value into the editor.
            </li>

            <li>
              Click <strong>Encode Base64URL</strong> or{" "}
              <strong>Decode Base64URL</strong>.
            </li>

            <li>
              Review the transformed result instantly.
            </li>

            <li>
              Copy the processed value if needed.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Decoding JWT token payloads.
            </li>

            <li>
              Encoding URL-safe authentication data.
            </li>

            <li>
              Working with OAuth tokens and APIs.
            </li>

            <li>
              Safely embedding encoded values inside URLs.
            </li>

            <li>
              Testing Base64URL workflows during development.
            </li>

            <li>
              Debugging encoded API responses.
            </li>

            <li>
              Converting Base64URL values into readable text.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Base64URL Encoding
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <p className="font-medium text-gray-900">
              Plain text:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`Yoryantra`}
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              Base64URL encoded:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`WW9yeWFudHJh`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why Base64URL Encoding Matters
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>URL safety:</strong> Prevent unsafe characters from
                breaking URLs and HTTP requests.
              </li>

              <li>
                <strong>JWT compatibility:</strong> JWT authentication systems
                rely heavily on Base64URL encoding.
              </li>

              <li>
                <strong>Cleaner APIs:</strong> Safely transport encoded values
                across applications and services.
              </li>

              <li>
                <strong>Improved interoperability:</strong> Standardize encoded
                values for web authentication workflows.
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
                What is Base64URL?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Base64URL is a URL-safe variation of Base64 encoding commonly
                used in JWT tokens, OAuth systems, APIs, and authentication
                workflows.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                How is Base64URL different from Base64?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Base64URL replaces characters such as + and / with URL-safe
                alternatives like - and _.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why is Base64URL used in JWT tokens?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                JWT tokens travel through URLs and HTTP headers, so they use
                Base64URL encoding to avoid unsafe URL characters.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this useful for API debugging?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Base64URL decoding is commonly used while debugging JWT
                payloads, OAuth tokens, APIs, and authentication systems.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is processing done on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Base64URL encoding and decoding happens entirely inside your
                browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/base64url-encoder-decoder" />
        </div>
      </section>
    </ToolShell>
  );
}