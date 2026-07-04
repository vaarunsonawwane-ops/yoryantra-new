"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type ParsedHeader = {
  name: string;
  values: string[];
};

type Finding = {
  level: "High" | "Medium" | "Low" | "Info";
  message: string;
};

function parseHeaders(input: string) {
  const headers: Record<string, ParsedHeader> = {};
  const rawLines = input.replace(/\r\n/g, "\n").split("\n");
  const normalizedLines: string[] = [];

  for (const line of rawLines) {
    if (!line.trim()) continue;

    if (/^\s/.test(line) && normalizedLines.length > 0) {
      normalizedLines[normalizedLines.length - 1] += ` ${line.trim()}`;
    } else {
      normalizedLines.push(line.trim());
    }
  }

  for (const line of normalizedLines) {
    const separatorIndex = line.indexOf(":");

    if (separatorIndex === -1) continue;

    const name = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (!name || !value) continue;

    const key = name.toLowerCase();

    if (!headers[key]) {
      headers[key] = { name, values: [] };
    }

    headers[key].values.push(value);
  }

  return headers;
}

function getHeader(headers: Record<string, ParsedHeader>, name: string) {
  const header = headers[name.toLowerCase()];

  if (!header) return undefined;

  return header.values.join(", ").trim();
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeOrigin(value: string) {
  return value.trim().replace(/\/$/, "");
}

function isSimpleMethod(method: string) {
  return ["GET", "HEAD", "POST"].includes(method.toUpperCase());
}

function isCorsHeaderName(name: string) {
  return name.toLowerCase().startsWith("access-control-") ||
    name.toLowerCase() === "vary";
}

function buildCorsReport({
  headersInput,
  requestOrigin,
  requestMethod,
  requestHeaders,
}: {
  headersInput: string;
  requestOrigin: string;
  requestMethod: string;
  requestHeaders: string;
}) {
  const headers = parseHeaders(headersInput);
  const headerNames = Object.keys(headers);

  if (headerNames.length === 0) {
    throw new Error("No valid HTTP headers were found. Paste response headers in Name: Value format.");
  }

  const findings: Finding[] = [];
  const detected: string[] = [];

  const addFinding = (level: Finding["level"], message: string) => {
    findings.push({ level, message });
  };

  const corsHeaderNames = headerNames
    .filter((name) => isCorsHeaderName(name))
    .sort();

  const allowOrigin = getHeader(headers, "Access-Control-Allow-Origin");
  const allowCredentials = getHeader(headers, "Access-Control-Allow-Credentials");
  const allowMethods = getHeader(headers, "Access-Control-Allow-Methods");
  const allowHeaders = getHeader(headers, "Access-Control-Allow-Headers");
  const exposeHeaders = getHeader(headers, "Access-Control-Expose-Headers");
  const maxAge = getHeader(headers, "Access-Control-Max-Age");
  const vary = getHeader(headers, "Vary");
  const allowPrivateNetwork = getHeader(headers, "Access-Control-Allow-Private-Network");

  if (corsHeaderNames.length === 0) {
    addFinding(
      "High",
      "No CORS response headers were found. A browser cross-origin request will usually be blocked unless the response contains the required CORS headers."
    );
  }

  if (allowOrigin) {
    detected.push(`Access-Control-Allow-Origin: ${allowOrigin}`);

    const originHeader = headers["access-control-allow-origin"];

    if (originHeader && originHeader.values.length > 1) {
      addFinding(
        "High",
        "Multiple Access-Control-Allow-Origin header values were found. Browsers expect a single allowed origin value, not a list of origins."
      );
    }

    if (allowOrigin.includes(",")) {
      addFinding(
        "High",
        "Access-Control-Allow-Origin appears to contain multiple comma-separated origins. CORS does not allow a list of origins in this header."
      );
    }

    if (allowOrigin === "null") {
      addFinding(
        "Medium",
        "Access-Control-Allow-Origin is set to null. This is only suitable for narrow cases and should not be used as a broad allow rule."
      );
    }
  } else {
    addFinding(
      "High",
      "Access-Control-Allow-Origin is missing. This is the main response header browsers check for CORS access."
    );
  }

  const credentialsValue = allowCredentials?.toLowerCase();

  if (allowCredentials) {
    detected.push(`Access-Control-Allow-Credentials: ${allowCredentials}`);

    if (credentialsValue !== "true") {
      addFinding(
        "Medium",
        "Access-Control-Allow-Credentials only has a meaningful enabled value of true. If credentials are not allowed, omit the header instead of sending false."
      );
    }
  }

  if (allowOrigin === "*" && credentialsValue === "true") {
    addFinding(
      "High",
      "Wildcard origin cannot be used with credentialed browser requests. Use a specific origin when cookies, client certificates, or HTTP authentication are involved."
    );
  }

  const cleanedRequestOrigin = normalizeOrigin(requestOrigin);

  if (cleanedRequestOrigin && allowOrigin && allowOrigin !== "*" && allowOrigin !== "null") {
    if (normalizeOrigin(allowOrigin) === cleanedRequestOrigin) {
      addFinding(
        "Info",
        "The allowed origin matches the optional request origin you entered."
      );
    } else {
      addFinding(
        "High",
        `The allowed origin does not match the request origin. Browser request origin: ${cleanedRequestOrigin}. Header value: ${allowOrigin}.`
      );
    }
  }

  if (allowMethods) {
    detected.push(`Access-Control-Allow-Methods: ${allowMethods}`);
  }

  const method = requestMethod.trim().toUpperCase();

  if (method) {
    const allowedMethods = allowMethods
      ? splitList(allowMethods).map((item) => item.toUpperCase())
      : [];

    if (!isSimpleMethod(method) && !allowMethods) {
      addFinding(
        "High",
        `${method} usually needs a successful preflight response, but Access-Control-Allow-Methods is missing.`
      );
    }

    if (allowMethods && !allowedMethods.includes(method) && !allowedMethods.includes("*")) {
      addFinding(
        "High",
        `${method} is not listed in Access-Control-Allow-Methods.`
      );
    }

    if (allowMethods && allowedMethods.includes(method)) {
      addFinding("Info", `${method} is listed in Access-Control-Allow-Methods.`);
    }
  }

  if (allowHeaders) {
    detected.push(`Access-Control-Allow-Headers: ${allowHeaders}`);
  }

  const requestedHeaders = splitList(requestHeaders).map((item) => item.toLowerCase());
  const allowedHeaders = allowHeaders
    ? splitList(allowHeaders).map((item) => item.toLowerCase())
    : [];

  if (requestedHeaders.length > 0) {
    if (!allowHeaders) {
      addFinding(
        "High",
        "Request headers were provided, but Access-Control-Allow-Headers is missing. Non-simple request headers usually need to be allowed in the preflight response."
      );
    } else if (allowedHeaders.includes("*") && credentialsValue === "true") {
      addFinding(
        "Medium",
        "Access-Control-Allow-Headers uses *. For credentialed requests, list sensitive request headers such as Authorization explicitly for better compatibility."
      );
    } else if (!allowedHeaders.includes("*")) {
      const missingHeaders = requestedHeaders.filter(
        (header) => !allowedHeaders.includes(header)
      );

      if (missingHeaders.length > 0) {
        addFinding(
          "High",
          `These request headers are not listed in Access-Control-Allow-Headers: ${missingHeaders.join(", ")}.`
        );
      } else {
        addFinding(
          "Info",
          "The optional request headers you entered are listed in Access-Control-Allow-Headers."
        );
      }
    }
  }

  if (exposeHeaders) {
    detected.push(`Access-Control-Expose-Headers: ${exposeHeaders}`);
  }

  if (maxAge) {
    detected.push(`Access-Control-Max-Age: ${maxAge}`);

    const maxAgeNumber = Number(maxAge);

    if (!Number.isFinite(maxAgeNumber) || maxAgeNumber < 0) {
      addFinding(
        "Medium",
        "Access-Control-Max-Age should be a non-negative number of seconds."
      );
    } else if (maxAgeNumber > 86400) {
      addFinding(
        "Low",
        "Access-Control-Max-Age is high. Browsers may cap this value, so very large values may not behave exactly as configured."
      );
    }
  }

  if (allowPrivateNetwork) {
    detected.push(`Access-Control-Allow-Private-Network: ${allowPrivateNetwork}`);
    addFinding(
      "Info",
      "Access-Control-Allow-Private-Network was found. Review this carefully if public pages can reach private-network resources."
    );
  }

  if (allowOrigin && allowOrigin !== "*" && allowOrigin !== "null") {
    const varyValues = vary ? splitList(vary).map((item) => item.toLowerCase()) : [];

    if (!varyValues.includes("origin")) {
      addFinding(
        "Medium",
        "If your server dynamically echoes allowed origins, add Vary: Origin so shared caches do not reuse a response for the wrong origin."
      );
    }
  }

  if (vary) {
    detected.push(`Vary: ${vary}`);
  }

  const highCount = findings.filter((finding) => finding.level === "High").length;
  const mediumCount = findings.filter((finding) => finding.level === "Medium").length;

  const summary = highCount > 0
    ? "Review needed: likely browser-blocking CORS issue found."
    : mediumCount > 0
      ? "Mostly usable, but review the warnings before deployment."
      : "No obvious blocking CORS issue found from the pasted headers.";

  const lines = [
    "CORS Header Check",
    "=================",
    `Summary: ${summary}`,
    `Parsed headers: ${headerNames.length}`,
    `CORS-related headers found: ${corsHeaderNames.length}`,
    "",
    "Detected CORS Headers",
    "---------------------",
    detected.length > 0 ? detected.join("\n") : "No CORS-related response headers were detected.",
    "",
    "Findings",
    "--------",
    findings.length > 0
      ? findings.map((finding) => `[${finding.level}] ${finding.message}`).join("\n")
      : "No warnings from the pasted values.",
    "",
    "Important Limit",
    "---------------",
    "This tool checks pasted response headers only. It does not make a live browser request, run a preflight request, or confirm server-side routing behavior.",
  ];

  return lines.join("\n");
}

export default function ToolClient() {
  const [headersInput, setHeadersInput] = useState("");
  const [requestOrigin, setRequestOrigin] = useState("");
  const [requestMethod, setRequestMethod] = useState("GET");
  const [requestHeaders, setRequestHeaders] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const analyzeCors = () => {
    try {
      if (!headersInput.trim()) {
        setError("Please enter HTTP response headers.");
        setOutput("");
        return;
      }

      const report = buildCorsReport({
        headersInput,
        requestOrigin,
        requestMethod,
        requestHeaders,
      });

      setOutput(report);
      setError("");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to analyze CORS headers."
      );
      setOutput("");
    }
  };

  const loadExample = () => {
    setHeadersInput(`HTTP/2 200
Content-Type: application/json
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 600
Vary: Origin`);
    setRequestOrigin("https://app.example.com");
    setRequestMethod("POST");
    setRequestHeaders("Content-Type, Authorization");
    setOutput("");
    setError("");
  };

  const resetAll = () => {
    setHeadersInput("");
    setRequestOrigin("");
    setRequestMethod("GET");
    setRequestHeaders("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="CORS Header Checker"
      description="Check CORS response headers for allowed origins, credentials, methods, request headers, preflight behavior, and common browser issues."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          HTTP Response Headers
        </label>

        <textarea
          value={headersInput}
          onChange={(e) => setHeadersInput(e.target.value)}
          placeholder={`Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
Vary: Origin`}
          className="w-full min-h-[240px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Request Origin Optional
          </label>
          <input
            value={requestOrigin}
            onChange={(e) => setRequestOrigin(e.target.value)}
            placeholder="https://app.example.com"
            className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Request Method Optional
          </label>
          <input
            value={requestMethod}
            onChange={(e) => setRequestMethod(e.target.value.toUpperCase())}
            placeholder="POST"
            className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Request Headers Optional
          </label>
          <input
            value={requestHeaders}
            onChange={(e) => setRequestHeaders(e.target.value)}
            placeholder="Content-Type, Authorization"
            className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={analyzeCors} className="yoryantra-btn">
          Analyze CORS Headers
        </button>

        <button onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
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
            CORS Analysis Result
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

        <div className="yoryantra-output min-h-[220px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {output || "CORS header analysis will appear here..."}
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Privacy Note
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          CORS header analysis happens locally in your browser. The headers you
          paste are not uploaded, stored, or processed on an external server.
        </p>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Checking CORS Headers Before Debugging Browser API Errors
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            CORS controls whether a browser allows a page from one origin to
            read a response from another origin. An API can work in cURL,
            Postman, or server-side code but still fail in the browser when the
            response does not include the CORS headers the browser expects.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This checker reviews pasted response headers such as
            Access-Control-Allow-Origin, Access-Control-Allow-Methods,
            Access-Control-Allow-Headers, Access-Control-Allow-Credentials,
            Access-Control-Max-Age, Access-Control-Expose-Headers, and Vary.
            It also lets you add the request origin, method, and request
            headers so the warnings are closer to your real browser request.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The result is a practical debugging report, not a live network test.
            It helps you notice common CORS mistakes before changing server,
            CDN, API gateway, or reverse proxy configuration.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the CORS Header Checker
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Copy the response headers from DevTools, logs, or an API client.</li>
            <li>Paste the headers into the response header box.</li>
            <li>Add the browser request origin, method, and request headers if known.</li>
            <li>Click <strong>Analyze CORS Headers</strong>.</li>
            <li>Review missing headers, unsafe combinations, and preflight notes.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common CORS Issues This Tool Checks
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Missing Access-Control-Allow-Origin headers.</li>
            <li>Wildcard origin used with credentialed requests.</li>
            <li>Multiple origins placed in one Access-Control-Allow-Origin value.</li>
            <li>Request methods not listed in Access-Control-Allow-Methods.</li>
            <li>Custom request headers not listed in Access-Control-Allow-Headers.</li>
            <li>Missing Vary: Origin when allowed origins are dynamic.</li>
            <li>Invalid or unusually high Access-Control-Max-Age values.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example CORS Response Headers
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <p className="font-medium text-gray-900">Response headers:</p>
            <pre className="mt-2 whitespace-pre-wrap break-words">
{`Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 600
Vary: Origin`}
            </pre>

            <p className="mt-4 font-medium text-gray-900">Useful request context:</p>
            <pre className="mt-2 whitespace-pre-wrap break-words">
{`Origin: https://app.example.com
Method: POST
Request headers: Content-Type, Authorization`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            CORS Checker Limitations
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>No live request:</strong> This tool checks pasted
                headers only. It does not fetch the URL or run a real preflight
                request.
              </li>
              <li>
                <strong>Browser behavior matters:</strong> CORS is enforced by
                browsers. Server-side clients like cURL are not blocked in the
                same way.
              </li>
              <li>
                <strong>Credentials need extra care:</strong> Cookies, HTTP
                authentication, and client certificates should not be combined
                with broad wildcard CORS rules.
              </li>
              <li>
                <strong>Server routing still matters:</strong> A correct header
                on one route does not prove that every API route, error route,
                or OPTIONS response is configured correctly.
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
              <h3 className="font-semibold text-gray-900">What is CORS?</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                CORS means Cross-Origin Resource Sharing. It is a browser
                mechanism that lets a server say which origins may read selected
                cross-origin responses.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why does my API work in Postman but fail in the browser?
              </h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                Postman and cURL are not restricted by browser CORS checks. A
                browser request can fail if the response or preflight response
                does not include the required CORS headers.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I use Access-Control-Allow-Origin: *?
              </h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                A wildcard can be suitable for public, non-credentialed
                resources. Do not use it with credentialed requests that depend
                on cookies, HTTP authentication, or client certificates.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this tool test my live API?
              </h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                No. It analyzes the response headers you paste. Use browser
                DevTools and server logs to confirm live route behavior.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are pasted headers uploaded anywhere?
              </h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The check runs locally in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <YoryantraRelatedTools currentHref="/tools/cors-header-checker" />
        </div>
      </section>
    </ToolShell>
  );
}
