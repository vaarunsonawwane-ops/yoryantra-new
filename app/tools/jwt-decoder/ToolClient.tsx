"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [token, setToken] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const decodeJWT = () => {
    try {
      const parts = token.split(".");

      if (parts.length !== 3) {
        setError("Invalid JWT token.");
        setOutput("");
        return;
      }

      const payload = JSON.parse(atob(parts[1]));

      setOutput(JSON.stringify(payload, null, 2));
      setError("");
    } catch {
      setError("Unable to decode JWT token.");
      setOutput("");
    }
  };

  const resetAll = () => {
    setToken("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="JWT Decoder"
      description="Decode JWT tokens instantly and inspect payload data securely with this free online JWT decoder."
    >

      {/* INPUT */}
      <div>

        <label className="block mb-2 text-sm font-medium text-gray-700">
          JWT Token
        </label>

        <textarea
          className="w-full h-64 rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder="Paste JWT token here..."
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />

      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">

        <button
          onClick={decodeJWT}
          className="yoryantra-btn"
        >
          Decode JWT
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
        <p className="mt-4 text-sm font-medium text-red-500">
          {error}
        </p>
      )}

      {/* OUTPUT */}
      <div className="mt-8">

        <div className="flex items-center justify-between mb-3">

          <h3 className="text-lg font-semibold text-gray-900">
            Decoded Payload
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

        <pre className="yoryantra-output overflow-auto text-sm min-h-[180px] whitespace-pre-wrap break-words">
          {output || "Decoded JWT payload will appear here..."}
        </pre>

      </div>

      {/* SECURITY NOTE */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">

        <h3 className="text-sm font-semibold text-yellow-900">
          Security Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          JWT tokens are decoded locally in your browser. Your token data
          is not stored or sent to any server.
        </p>

      </div>

{/* SEO CONTENT */}
<div className="mt-10 border-t border-gray-200 pt-8 space-y-10">

  {/* ABOUT */}
  <section>

    <h2 className="text-2xl font-semibold text-gray-900">
      About JWT Decoder
    </h2>

    <p className="mt-4 text-gray-600 leading-relaxed">
      JWT Decoder is a tool that helps inspect JSON Web Tokens by decoding
      the token payload into a readable format. It is useful for developers
      working with authentication, authorization, APIs, user sessions,
      and token-based application workflows.
    </p>

  </section>

  {/* HOW TO USE */}
  <section>

    <h2 className="text-2xl font-semibold text-gray-900">
      How to Use JWT Decoder
    </h2>

    <div className="mt-4 space-y-3 text-gray-600 leading-relaxed">

      <p>
        1. Paste your JWT token into the input box.
      </p>

      <p>
        2. Click the Decode JWT button.
      </p>

      <p>
        3. If the token is valid, the decoded payload will appear below.
      </p>

      <p>
        4. Use Copy to quickly copy the decoded payload.
      </p>

    </div>

  </section>

  {/* USE CASES */}
  <section>

    <h2 className="text-2xl font-semibold text-gray-900">
      Common Use Cases
    </h2>

    <ul className="mt-4 space-y-3 text-gray-600 leading-relaxed list-disc pl-6">

      <li>
        Inspecting JWT payload data during authentication debugging.
      </li>

      <li>
        Checking user session information stored in a token.
      </li>

      <li>
        Debugging API authorization issues.
      </li>

      <li>
        Reading token claims such as issuer, expiry, subject, or role data.
      </li>

      <li>
        Understanding token structure while working with web applications.
      </li>

    </ul>

  </section>

  {/* FAQ */}
  <section>

    <h2 className="text-2xl font-semibold text-gray-900">
      Frequently Asked Questions
    </h2>

    <div className="mt-5 space-y-6">

      <div>

        <h3 className="font-semibold text-gray-900">
          What is a JWT Decoder?
        </h3>

        <p className="mt-2 text-gray-600 leading-relaxed">
          A JWT Decoder converts the payload section of a JSON Web Token
          into a readable JSON format so you can inspect the token data.
        </p>

      </div>

      <div>

        <h3 className="font-semibold text-gray-900">
          Does this tool verify JWT signatures?
        </h3>

        <p className="mt-2 text-gray-600 leading-relaxed">
          No. This tool decodes the token payload for inspection. It does
          not verify signatures or confirm whether a token is trusted.
        </p>

      </div>

      <div>

        <h3 className="font-semibold text-gray-900">
          Is my JWT token uploaded anywhere?
        </h3>

        <p className="mt-2 text-gray-600 leading-relaxed">
          No. JWT decoding happens directly inside your browser. Your token
          is not uploaded or stored anywhere.
        </p>

      </div>

    </div>

  </section>

</div>

    </ToolShell>
  );
}