"use client";

import { useState, type ChangeEvent } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type ParsedHeader = {
  name: string;
  values: string[];
};

type Finding = {
  level: "Error" | "Warning" | "Note";
  message: string;
};

type CredentialsMode = "unknown" | "omit" | "include";

type ParsedHeaders = {
  headers: Record<string, ParsedHeader>;
  ignoredLines: string[];
};

const CORS_SAFELISTED_METHODS = ["GET", "HEAD", "POST"];
const CORS_SAFELISTED_REQUEST_HEADERS = [
  "accept",
  "accept-language",
  "content-language",
  "content-type",
  "range",
];

export function parseHeaders(input: string): ParsedHeaders {
  const headers: Record<string, ParsedHeader> = {};
  const ignoredLines: string[] = [];
  const rawLines = input.replace(/\r\n?|\n/g, "\n").split("\n");
  const normalizedLines: string[] = [];

  for (const rawLine of rawLines) {
    if (!rawLine.trim()) continue;

    if (/^HTTP\/\S+\s+\d{3}(?:\s|$)/i.test(rawLine.trim())) {
      continue;
    }

    if (/^[ \t]/.test(rawLine) && normalizedLines.length > 0) {
      normalizedLines[normalizedLines.length - 1] += ` ${rawLine.trim()}`;
      continue;
    }

    normalizedLines.push(rawLine.trim());
  }

  for (const line of normalizedLines) {
    const separatorIndex = line.indexOf(":");

    if (separatorIndex <= 0) {
      ignoredLines.push(line);
      continue;
    }

    const name = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (!/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(name) || !value) {
      ignoredLines.push(line);
      continue;
    }

    const key = name.toLowerCase();

    if (!headers[key]) {
      headers[key] = { name, values: [] };
    }

    headers[key].values.push(value);
  }

  return { headers, ignoredLines };
}

function getCombinedHeader(
  headers: Record<string, ParsedHeader>,
  name: string
) {
  const header = headers[name.toLowerCase()];
  return header ? header.values.join(", ").trim() : undefined;
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseRequestOrigin(value: string) {
  const trimmed = value.trim();

  if (!trimmed) return "";
  if (trimmed === "null") return "null";

  let url: URL;

  try {
    url = new URL(trimmed);
  } catch {
    throw new Error(
      "Request origin is not a valid origin. Enter a value such as https://app.example.com without a path."
    );
  }

  if (
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    !/^https?:$/.test(url.protocol)
  ) {
    throw new Error(
      "Request origin should contain only scheme, host, and optional port — for example https://app.example.com."
    );
  }

  return url.origin;
}

function isSerializedHttpOrigin(value: string) {
  try {
    const url = new URL(value);
    return (
      /^https?:$/.test(url.protocol) &&
      !url.username &&
      !url.password &&
      url.pathname === "/" &&
      !url.search &&
      !url.hash &&
      value === url.origin
    );
  } catch {
    return false;
  }
}

function isCorsSafelistedMethod(method: string) {
  return CORS_SAFELISTED_METHODS.includes(method.toUpperCase());
}

function isCorsRelevantHeader(name: string) {
  const lower = name.toLowerCase();
  return lower.startsWith("access-control-") || lower === "vary";
}

function isPotentiallySafelistedRequestHeader(name: string) {
  return CORS_SAFELISTED_REQUEST_HEADERS.includes(name.toLowerCase());
}

export function buildCorsReport({
  headersInput,
  requestOrigin,
  requestMethod,
  requestHeaders,
  credentialsMode,
}: {
  headersInput: string;
  requestOrigin: string;
  requestMethod: string;
  requestHeaders: string;
  credentialsMode: CredentialsMode;
}) {
  const { headers, ignoredLines } = parseHeaders(headersInput);
  const headerNames = Object.keys(headers);

  if (headerNames.length === 0) {
    throw new Error(
      "No valid HTTP response headers were found. Paste headers in Name: Value form."
    );
  }

  const findings: Finding[] = [];
  const detected: string[] = [];
  const addFinding = (level: Finding["level"], message: string) => {
    findings.push({ level, message });
  };

  const relevantHeaderNames = headerNames
    .filter((name) => isCorsRelevantHeader(name))
    .sort();

  const allowOrigin = getCombinedHeader(headers, "Access-Control-Allow-Origin");
  const allowCredentials = getCombinedHeader(
    headers,
    "Access-Control-Allow-Credentials"
  );
  const allowMethods = getCombinedHeader(headers, "Access-Control-Allow-Methods");
  const allowHeaders = getCombinedHeader(headers, "Access-Control-Allow-Headers");
  const exposeHeaders = getCombinedHeader(headers, "Access-Control-Expose-Headers");
  const maxAge = getCombinedHeader(headers, "Access-Control-Max-Age");
  const vary = getCombinedHeader(headers, "Vary");
  const allowPrivateNetwork = getCombinedHeader(
    headers,
    "Access-Control-Allow-Private-Network"
  );

  if (ignoredLines.length > 0) {
    addFinding(
      "Note",
      `${ignoredLines.length} line${ignoredLines.length === 1 ? " was" : "s were"} ignored because ${ignoredLines.length === 1 ? "it was" : "they were"} not a complete HTTP header.`
    );
  }

  if (relevantHeaderNames.length === 0) {
    addFinding(
      "Error",
      "No CORS response header was found. A cross-origin browser response normally needs Access-Control-Allow-Origin before its body can be shared with the calling page."
    );
  }

  if (allowOrigin) {
    detected.push(`Access-Control-Allow-Origin: ${allowOrigin}`);
    const originHeader = headers["access-control-allow-origin"];

    if (originHeader.values.length !== 1) {
      addFinding(
        "Error",
        "Access-Control-Allow-Origin appears more than once. Fetch expects one origin value, not multiple header values."
      );
    }

    if (allowOrigin.includes(",")) {
      addFinding(
        "Error",
        "Access-Control-Allow-Origin cannot contain a comma-separated list. Return one serialized origin or * instead."
      );
    } else if (
      allowOrigin !== "*" &&
      allowOrigin !== "null" &&
      !isSerializedHttpOrigin(allowOrigin)
    ) {
      addFinding(
        "Error",
        "Access-Control-Allow-Origin is not a serialized HTTP(S) origin. Values with a path, trailing slash, or malformed URL do not match a browser Origin value."
      );
    }

    if (allowOrigin === "null") {
      addFinding(
        "Warning",
        "Access-Control-Allow-Origin is null. Sandboxed documents and several opaque origins serialize as null, so a broad null allow rule can admit more callers than expected."
      );
    }
  } else {
    addFinding(
      "Error",
      "Access-Control-Allow-Origin is missing. The browser cannot share the response cross-origin without a matching allow-origin value."
    );
  }

  if (allowCredentials) {
    detected.push(`Access-Control-Allow-Credentials: ${allowCredentials}`);
    const credentialsHeader = headers["access-control-allow-credentials"];

    if (credentialsHeader.values.length !== 1) {
      addFinding(
        "Error",
        "Access-Control-Allow-Credentials appears more than once. It is a single case-sensitive token, not a list."
      );
    }

    if (allowCredentials !== "true") {
      addFinding(
        "Error",
        "Access-Control-Allow-Credentials must be exactly true when credentialed CORS access is allowed. Values such as True or false do not enable it."
      );
    }
  }

  if (credentialsMode === "include") {
    if (allowOrigin === "*") {
      addFinding(
        "Error",
        "The request is marked as credentialed, so Access-Control-Allow-Origin cannot be *. Return the exact allowed origin instead."
      );
    }

    if (allowCredentials !== "true") {
      addFinding(
        "Error",
        "The request is marked as credentialed, but Access-Control-Allow-Credentials: true is not present exactly as required."
      );
    }
  } else if (
    credentialsMode === "unknown" &&
    allowOrigin === "*" &&
    allowCredentials === "true"
  ) {
    addFinding(
      "Warning",
      "Wildcard origin works only when the browser request is not using credentials. If cookies, HTTP authentication, or a client certificate are included, this combination will be blocked."
    );
  }

  const cleanedRequestOrigin = parseRequestOrigin(requestOrigin);

  if (
    cleanedRequestOrigin &&
    allowOrigin &&
    allowOrigin !== "*" &&
    allowOrigin !== "null" &&
    isSerializedHttpOrigin(allowOrigin)
  ) {
    if (allowOrigin === cleanedRequestOrigin) {
      addFinding("Note", "Access-Control-Allow-Origin matches the request origin.");
    } else {
      addFinding(
        "Error",
        `Origin mismatch: the request serializes as ${cleanedRequestOrigin}, while Access-Control-Allow-Origin is ${allowOrigin}.`
      );
    }
  }

  if (allowMethods) {
    detected.push(`Access-Control-Allow-Methods: ${allowMethods}`);
  }

  const method = requestMethod.trim().toUpperCase();
  const allowedMethods = allowMethods
    ? splitList(allowMethods).map((item) => item.toUpperCase())
    : [];

  if (method && !/^[!#$%&'*+.^_`|~0-9A-Z-]+$/.test(method)) {
    throw new Error("Request method contains characters that are not valid in an HTTP method token.");
  }

  if (method && !isCorsSafelistedMethod(method) && !allowMethods) {
    addFinding(
      "Error",
      `${method} is not a CORS-safelisted method, and Access-Control-Allow-Methods is missing from the pasted response.`
    );
  }

  if (method && allowMethods) {
    const wildcardWorks = allowedMethods.includes("*") && credentialsMode === "omit";
    const explicitMatch = allowedMethods.includes(method);

    if (!explicitMatch && !wildcardWorks && !isCorsSafelistedMethod(method)) {
      if (allowedMethods.includes("*") && credentialsMode === "unknown") {
        addFinding(
          "Warning",
          `${method} relies on Access-Control-Allow-Methods: *. That wildcard stops acting as a wildcard when the request credentials mode is include.`
        );
      } else {
        addFinding(
          "Error",
          `${method} is not explicitly allowed by Access-Control-Allow-Methods for the request context entered.`
        );
      }
    } else if (explicitMatch) {
      addFinding("Note", `${method} is explicitly listed in Access-Control-Allow-Methods.`);
    }
  }

  if (allowHeaders) {
    detected.push(`Access-Control-Allow-Headers: ${allowHeaders}`);
  }

  const requestedHeaders = Array.from(
    new Set(splitList(requestHeaders).map((item) => item.toLowerCase()))
  );
  const allowedHeaders = allowHeaders
    ? splitList(allowHeaders).map((item) => item.toLowerCase())
    : [];
  const authorizationRequested = requestedHeaders.includes("authorization");
  const nonSafelistedNames = requestedHeaders.filter(
    (name) => !isPotentiallySafelistedRequestHeader(name)
  );

  if (requestedHeaders.some((name) => !/^[!#$%&'*+.^_`|~0-9a-z-]+$/.test(name))) {
    throw new Error("Request headers must be comma-separated HTTP header names, without values.");
  }

  if (requestedHeaders.includes("content-type") || requestedHeaders.includes("range")) {
    addFinding(
      "Note",
      "Content-Type and Range can be CORS-safelisted only for certain values. Header names alone are not enough to decide whether the browser will preflight them."
    );
  }

  if (authorizationRequested && !allowedHeaders.includes("authorization")) {
    addFinding(
      "Error",
      "Authorization is requested but not explicitly listed in Access-Control-Allow-Headers. The * wildcard does not cover Authorization."
    );
  }

  const headersNeedingAllow = nonSafelistedNames.filter(
    (name) => name !== "authorization"
  );

  if (headersNeedingAllow.length > 0) {
    if (!allowHeaders) {
      addFinding(
        "Error",
        `These non-safelisted request headers need preflight permission, but Access-Control-Allow-Headers is missing: ${headersNeedingAllow.join(", ")}.`
      );
    } else {
      const wildcardWorks = allowedHeaders.includes("*") && credentialsMode === "omit";
      const missing = headersNeedingAllow.filter(
        (name) => !allowedHeaders.includes(name) && !wildcardWorks
      );

      if (missing.length > 0) {
        if (allowedHeaders.includes("*") && credentialsMode === "unknown") {
          addFinding(
            "Warning",
            `These headers depend on Access-Control-Allow-Headers: *: ${missing.join(", ")}. The wildcard is not a wildcard when credentials mode is include.`
          );
        } else {
          addFinding(
            "Error",
            `These request headers are not allowed for the entered request context: ${missing.join(", ")}.`
          );
        }
      } else {
        addFinding(
          "Note",
          "The non-safelisted request header names entered are covered by Access-Control-Allow-Headers."
        );
      }
    }
  }

  if (exposeHeaders) {
    detected.push(`Access-Control-Expose-Headers: ${exposeHeaders}`);
    if (splitList(exposeHeaders).includes("*") && credentialsMode === "include") {
      addFinding(
        "Warning",
        "Access-Control-Expose-Headers: * is treated as a literal * for credentialed requests. List response header names explicitly when JavaScript needs to read them."
      );
    }
  }

  if (maxAge) {
    detected.push(`Access-Control-Max-Age: ${maxAge}`);
    const maxAgeHeader = headers["access-control-max-age"];

    if (maxAgeHeader.values.length !== 1 || !/^\d+$/.test(maxAge)) {
      addFinding(
        "Error",
        "Access-Control-Max-Age must be one non-negative integer number of seconds."
      );
    } else {
      const maxAgeNumber = Number(maxAge);
      if (!Number.isSafeInteger(maxAgeNumber)) {
        addFinding(
          "Warning",
          "Access-Control-Max-Age is too large to reason about safely as a JavaScript integer, and browsers may clamp large values anyway."
        );
      } else if (maxAgeNumber > 86400) {
        addFinding(
          "Warning",
          "Access-Control-Max-Age is above one day. Browser caps differ, so the effective preflight cache lifetime can be shorter than this value."
        );
      }
    }
  }

  if (allowPrivateNetwork) {
    detected.push(`Access-Control-Allow-Private-Network: ${allowPrivateNetwork}`);
    addFinding(
      "Note",
      "Access-Control-Allow-Private-Network is present. Private-network access has evolving browser requirements, so verify behavior in the browsers you actually support."
    );
  }

  if (allowOrigin && allowOrigin !== "*" && allowOrigin !== "null") {
    const varyValues = vary
      ? splitList(vary).map((item) => item.toLowerCase())
      : [];

    if (!varyValues.includes("origin")) {
      addFinding(
        "Note",
        "If the server chooses Access-Control-Allow-Origin dynamically from the request Origin, send Vary: Origin so a shared cache does not reuse one origin's response for another."
      );
    }
  }

  if (vary) {
    detected.push(`Vary: ${vary}`);
  }

  const errorCount = findings.filter((finding) => finding.level === "Error").length;
  const warningCount = findings.filter(
    (finding) => finding.level === "Warning"
  ).length;

  const summary =
    errorCount > 0
      ? "Likely browser-blocking mismatch found in the entered context."
      : warningCount > 0
        ? "No definite blocker found, but one or more values need context before deployment."
        : "No obvious CORS blocker found in the pasted headers and request context.";

  return [
    "CORS header check",
    "=================",
    `Summary: ${summary}`,
    `Parsed response headers: ${headerNames.length}`,
    `CORS/relevant headers found: ${relevantHeaderNames.length}`,
    `Credentials context: ${
      credentialsMode === "include"
        ? "include"
        : credentialsMode === "omit"
          ? "without cross-origin credentials"
          : "not specified"
    }`,
    "",
    "Detected CORS headers",
    "---------------------",
    detected.length > 0
      ? detected.join("\n")
      : "No CORS response headers were detected.",
    "",
    "Findings",
    "--------",
    findings.length > 0
      ? findings.map((finding) => `[${finding.level}] ${finding.message}`).join("\n")
      : "No additional findings from the entered values.",
    "",
    "What this cannot prove",
    "----------------------",
    "A pasted response is only one snapshot. This check does not send the actual request, run OPTIONS, follow redirects, inspect response status handling, or prove that every route returns the same headers.",
  ].join("\n");
}

export default function ToolClient() {
  const [headersInput, setHeadersInput] = useState("");
  const [requestOrigin, setRequestOrigin] = useState("");
  const [requestMethod, setRequestMethod] = useState("GET");
  const [requestHeaders, setRequestHeaders] = useState("");
  const [credentialsMode, setCredentialsMode] =
    useState<CredentialsMode>("unknown");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const clearResult = () => {
    setOutput("");
    setError("");
    setCopied(false);
  };

  const analyzeCors = () => {
    try {
      if (!headersInput.trim()) {
        throw new Error("Paste the HTTP response headers you want to check.");
      }

      const report = buildCorsReport({
        headersInput,
        requestOrigin,
        requestMethod,
        requestHeaders,
        credentialsMode,
      });

      setOutput(report);
      setError("");
      setCopied(false);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to analyze these CORS headers."
      );
      setOutput("");
      setCopied(false);
    }
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setError("");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setError("The report could not be copied. Select the output and copy it manually.");
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
    setCredentialsMode("include");
    clearResult();
  };

  const resetAll = () => {
    setHeadersInput("");
    setRequestOrigin("");
    setRequestMethod("GET");
    setRequestHeaders("");
    setCredentialsMode("unknown");
    clearResult();
  };

  return (
    <ToolShell
      title="CORS Header Checker"
      description="Compare CORS response headers with an origin, method, request headers, and credentials context."
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          HTTP Response Headers
        </label>
        <textarea
          value={headersInput}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
            setHeadersInput(event.target.value);
            clearResult();
          }}
          placeholder={`Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
Vary: Origin`}
          className="w-full min-h-[240px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-6 grid items-start gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Request Origin <span className="font-normal text-gray-500">optional</span>
          </label>
          <input
            value={requestOrigin}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setRequestOrigin(event.target.value);
              clearResult();
            }}
            placeholder="https://app.example.com"
            spellCheck={false}
            className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
          <p className="mt-2 text-xs leading-relaxed text-gray-500">
            Enter the browser Origin value, not a page URL with a path.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Request Method <span className="font-normal text-gray-500">optional</span>
          </label>
          <input
            value={requestMethod}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setRequestMethod(event.target.value.toUpperCase());
              clearResult();
            }}
            placeholder="POST"
            spellCheck={false}
            className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
          <p className="mt-2 text-xs leading-relaxed text-gray-500">
            PUT, PATCH, DELETE and other non-safelisted methods normally preflight.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Request Header Names <span className="font-normal text-gray-500">optional</span>
          </label>
          <input
            value={requestHeaders}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setRequestHeaders(event.target.value);
              clearResult();
            }}
            placeholder="Content-Type, Authorization"
            spellCheck={false}
            className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
          <p className="mt-2 text-xs leading-relaxed text-gray-500">
            Names only. Content-Type and Range also depend on their values.
          </p>
        </div>

        <fieldset className="self-start">
          <legend className="mb-2 block text-sm font-medium text-gray-700">
            Cross-origin credentials
          </legend>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Cross-origin credentials mode">
            {[
              ["unknown", "Not sure"],
              ["omit", "No credentials"],
              ["include", "Include credentials"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setCredentialsMode(value as CredentialsMode);
                  clearResult();
                }}
                aria-pressed={credentialsMode === value}
                className={`min-h-11 whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-medium transition ${
                  credentialsMode === value
                    ? "border-[var(--green)] bg-green-50 text-[var(--green)]"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-gray-500">
            Cookies, HTTP authentication and TLS client certificates change wildcard rules.
          </p>
        </fieldset>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={analyzeCors} className="yoryantra-btn whitespace-nowrap">
          Analyze CORS Headers
        </button>
        <button onClick={loadExample} className="yoryantra-btn-outline whitespace-nowrap">
          Load Example
        </button>
        <button onClick={resetAll} className="yoryantra-btn-outline whitespace-nowrap">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">CORS Analysis Result</h3>
          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline text-sm whitespace-nowrap">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
        <div className="yoryantra-output min-h-[220px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "Paste response headers and run the check to see the browser-facing mismatches."}
        </div>
      </div>

      <div className="mt-8 self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
        <h3 className="text-sm font-semibold text-amber-900">
          A header snapshot is not the whole request
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-amber-800">
          Preflight status, redirects, route-specific headers, credential mode and the exact request-header values can all change the browser result. Confirm the failing request in DevTools after fixing the header values.
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
        The analysis runs in your browser. Pasted headers and request context are not sent by this page to an API for checking.
      </div>

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Why a request can work in cURL and still fail in the browser
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            CORS is a browser sharing rule layered on top of HTTP. The server can return a perfectly ordinary 200 response and a command-line client can read it, while browser JavaScript is denied access because the response does not opt in to the calling origin.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The important comparison is between the real browser request and the response that came back: the serialized Origin, whether credentials were included, the method, and any request headers that make a preflight necessary. Looking at Access-Control-Allow-Origin alone often misses the reason a request is blocked.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Give the check the same context as the failing request
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Paste the response headers from the failing network entry, then add the Origin, method and request-header names shown in DevTools. Mark whether the cross-origin fetch includes credentials. That last detail matters because <code>*</code> stops acting as a wildcard for several CORS response headers when credentials mode is <code>include</code>.
          </p>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <pre className="whitespace-pre-wrap break-words">{`Origin: https://app.example.com
Method: POST
Request headers: Content-Type, Authorization
Credentials: include`}</pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            What the browser actually compares
          </h2>
          <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              <strong className="text-gray-900">Origin is one value.</strong>
              <p className="mt-2">Access-Control-Allow-Origin is not a comma-separated allowlist. For a credentialed request it must be the exact allowed serialized origin, and Access-Control-Allow-Credentials must be exactly <code>true</code>.</p>
            </div>
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              <strong className="text-gray-900">Preflight permission is request-specific.</strong>
              <p className="mt-2">A non-safelisted method or request header can require OPTIONS first. Authorization must be named explicitly; an Access-Control-Allow-Headers wildcard does not cover it.</p>
            </div>
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              <strong className="text-gray-900">Safelisted names still have value rules.</strong>
              <p className="mt-2">Content-Type and Range can avoid preflight only for particular values. A field containing header names cannot determine those value-level conditions.</p>
            </div>
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              <strong className="text-gray-900">Caches can make a correct rule look intermittent.</strong>
              <p className="mt-2">When a server chooses a specific allow-origin dynamically, Vary: Origin keeps shared caches from serving a response selected for a different caller.</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            When the headers look right but the browser still blocks
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-gray-600">
            <li>The OPTIONS route returns different headers or a redirect.</li>
            <li>An API gateway adds CORS headers to success responses but not 4xx or 5xx responses.</li>
            <li>The request sends Authorization or another non-safelisted header that was not included in the preflight response.</li>
            <li>The frontend sends credentials while the response relies on wildcard values.</li>
            <li>The requested Content-Type is not one of the CORS-safelisted media types.</li>
            <li>A CDN cached an origin-specific response without Vary: Origin.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Where a pasted-header check stops
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            No network request is made here, so the report cannot see DNS, redirects, TLS, status codes, OPTIONS routing, actual request-header values, browser extensions or credentials that DevTools may show. Treat the report as a comparison of the text you entered, then confirm the real exchange in the browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            The browser standard behind these checks
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The CORS protocol and wildcard behavior are defined in the WHATWG Fetch Standard. MDN's CORS guide is a readable companion when you want concrete browser examples, especially around credentialed requests and preflights.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            <a className="font-medium text-[var(--green)] underline-offset-4 hover:underline" href="https://fetch.spec.whatwg.org/#http-cors-protocol" target="_blank" rel="noreferrer">WHATWG Fetch — CORS protocol</a>
            <span className="mx-2 text-gray-300">·</span>
            <a className="font-medium text-[var(--green)] underline-offset-4 hover:underline" href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS" target="_blank" rel="noreferrer">MDN — Cross-Origin Resource Sharing</a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/cors-header-checker" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
