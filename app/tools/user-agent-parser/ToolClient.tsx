"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [userAgent, setUserAgent] = useState("");
  const [output, setOutput] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState("");

  const parseUserAgent = () => {
    try {
      if (!userAgent.trim()) {
        setError("Please enter a user agent string.");
        setOutput(null);
        return;
      }

      const ua = userAgent.toLowerCase();

      let browser = "Unknown";
      let os = "Unknown";
      let device = "Desktop";

      // Browser detection
      if (ua.includes("chrome") && !ua.includes("edg")) {
        browser = "Google Chrome";
      } else if (ua.includes("firefox")) {
        browser = "Mozilla Firefox";
      } else if (ua.includes("safari") && !ua.includes("chrome")) {
        browser = "Safari";
      } else if (ua.includes("edg")) {
        browser = "Microsoft Edge";
      } else if (ua.includes("opera") || ua.includes("opr")) {
        browser = "Opera";
      }

      // OS detection
      if (ua.includes("windows")) {
        os = "Windows";
      } else if (ua.includes("mac os")) {
        os = "macOS";
      } else if (ua.includes("linux")) {
        os = "Linux";
      } else if (ua.includes("android")) {
        os = "Android";
        device = "Mobile";
      } else if (
        ua.includes("iphone") ||
        ua.includes("ipad")
      ) {
        os = "iOS";
        device = "Mobile";
      }

      // Device detection
      if (
        ua.includes("mobile") ||
        ua.includes("android") ||
        ua.includes("iphone")
      ) {
        device = "Mobile";
      }

      if (ua.includes("tablet") || ua.includes("ipad")) {
        device = "Tablet";
      }

      setOutput({
        Browser: browser,
        OperatingSystem: os,
        DeviceType: device,
      });

      setError("");
    } catch {
      setError("Unable to parse user agent.");
      setOutput(null);
    }
  };

  const resetAll = () => {
    setUserAgent("");
    setOutput(null);
    setError("");
  };

  return (
    <ToolShell
      title="User Agent Parser"
      description="Parse browser and device user agents instantly with this free online User Agent Parser."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          User Agent String
        </label>

        <textarea
          value={userAgent}
          onChange={(e) =>
            setUserAgent(e.target.value)
          }
          placeholder="Paste user agent string here..."
          className="w-full min-h-[220px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={parseUserAgent}
          className="yoryantra-btn"
        >
          Parse User Agent
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
            Parsed Result
          </h3>

          {output && (
            <button
              onClick={() =>
                navigator.clipboard.writeText(
                  JSON.stringify(output, null, 2)
                )
              }
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <div className="yoryantra-output min-h-[180px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {output
            ? JSON.stringify(output, null, 2)
            : "Parsed user agent details will appear here..."}
        </div>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Understanding User Agent Strings
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            User agent strings help websites identify browsers, operating
            systems, rendering engines, and device types making a request.
            Browsers, mobile apps, bots, crawlers, API tools, and automated
            systems often send user agent data with every HTTP request.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            During debugging workflows, raw user agent strings can become
            difficult to inspect because they contain long browser and system
            identifiers packed into a single line. This parser extracts the
            important details into a readable format for easier analysis.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool is useful for browser compatibility testing, analytics,
            SEO debugging, bot detection, traffic analysis, frontend
            troubleshooting, and API request inspection directly inside your
            browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the User Agent Parser
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Copy the user agent string from your browser or logs.</li>

            <li>
              Paste the user agent into the input field.
            </li>

            <li>
              Click <strong>Parse User Agent</strong>.
            </li>

            <li>
              Review the detected browser, operating system, and device type.
            </li>

            <li>
              Copy the parsed output if needed for debugging or reporting.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Debugging browser compatibility issues.</li>

            <li>Analyzing mobile, tablet, and desktop traffic.</li>

            <li>Testing analytics and visitor tracking systems.</li>

            <li>Inspecting crawler and bot requests.</li>

            <li>Reviewing API requests and automated traffic sources.</li>

            <li>Checking browser information from server logs.</li>

            <li>Understanding traffic patterns during SEO audits.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example User Agent String
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <p>Raw user agent:</p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`Mozilla/5.0 (Windows NT 10.0; Win64; x64)
AppleWebKit/537.36 (KHTML, like Gecko)
Chrome/124.0 Safari/537.36`}
            </pre>

            <p className="mt-4">Parsed result:</p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`{
  "Browser": "Google Chrome",
  "OperatingSystem": "Windows",
  "DeviceType": "Desktop"
}`}
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
                What is a user agent string?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A user agent string is information sent by browsers, apps, or
                bots that identifies the browser, operating system, rendering
                engine, and device making the request.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why inspect user agent strings?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                User agent inspection helps debug browser compatibility issues,
                analyze website traffic, detect bots, test responsive behavior,
                and troubleshoot API requests.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this detect mobile devices?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The parser can identify mobile, desktop, and tablet device
                types based on the user agent string.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Where can I find user agent strings?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                User agent strings can be copied from browser DevTools, server
                logs, analytics platforms, API requests, crawlers, or debugging
                tools.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is parsing done on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. User agent parsing happens entirely inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            User agent analysis often connects with HTTP headers, browser
            requests, cookies, CORS debugging, analytics systems, and traffic
            inspection workflows.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/http-headers-parser"
              className="yoryantra-btn-outline"
            >
              HTTP Headers Parser
            </Link>

            <Link
              href="/tools/cors-header-checker"
              className="yoryantra-btn-outline"
            >
              CORS Header Checker
            </Link>

            <Link
              href="/tools/cookie-parser"
              className="yoryantra-btn-outline"
            >
              Cookie Parser
            </Link>

            <Link
              href="/tools/ip-address-inspector"
              className="yoryantra-btn-outline"
            >
              IP Address Inspector
            </Link>

            <Link
              href="/tools/http-status-code-explorer"
              className="yoryantra-btn-outline"
            >
              HTTP Status Code Explorer
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}