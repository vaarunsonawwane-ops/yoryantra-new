"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "summary" | "report" | "json" | "fixed";
type CookieContext = "https" | "http" | "local";
type Severity = "pass" | "info" | "warning" | "high";

type ParsedCookie = {
  original: string;
  name: string;
  value: string;
  attributes: Record<string, string | true>;
  flags: {
    secure: boolean;
    httpOnly: boolean;
    sameSite: string;
    domain: string;
    path: string;
    expires: string;
    maxAge: string;
    partitioned: boolean;
  };
  issues: CookieIssue[];
  score: number;
  fixedHeader: string;
};

type CookieIssue = {
  severity: Severity;
  title: string;
  message: string;
};

type CookieResult = {
  cookies: ParsedCookie[];
  totalCookies: number;
  passCount: number;
  warningCount: number;
  highCount: number;
  output: string;
};

type CookieNote = {
  title: string;
  message: string;
};

const sampleCookies = `Set-Cookie: sessionId=abc123; Path=/; HttpOnly; Secure; SameSite=Lax
Set-Cookie: analytics_id=track-789; Path=/; Max-Age=31536000; SameSite=None
Set-Cookie: __Host-auth=token-value; Path=/; Secure; HttpOnly; SameSite=Strict
Set-Cookie: preferences=dark; Domain=.example.com; Path=/; Expires=Wed, 21 Oct 2026 07:28:00 GMT
Set-Cookie: third_party_id=chip-123; Path=/; SameSite=None; Partitioned`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [cookieContext, setCookieContext] = useState<CookieContext>("https");
  const [treatSessionAsSensitive, setTreatSessionAsSensitive] = useState(true);
  const [requireSameSite, setRequireSameSite] = useState(true);
  const [warnLongExpiry, setWarnLongExpiry] = useState(true);
  const [suggestFixes, setSuggestFixes] = useState(true);
  const [result, setResult] = useState<CookieResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getCookieNotes(result) : []), [result]);

  const checkCookies = () => {
    if (!input.trim()) {
      setError("Please paste one or more Set-Cookie headers.");
      setResult(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const nextResult = analyzeCookies(input, {
        outputMode,
        cookieContext,
        treatSessionAsSensitive,
        requireSameSite,
        warnLongExpiry,
        suggestFixes,
      });

      setResult(nextResult);
      setOutput(nextResult.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to check these cookie headers."
      );
      setResult(null);
      setOutput("");
      setCopied(false);
    }
  };

  const copyOutput = async () => {
    if (!output) {
      return;
    }

    await navigator.clipboard.writeText(output);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1400);
  };

  const loadExample = () => {
    setInput(sampleCookies);
    setOutputMode("summary");
    setCookieContext("https");
    setTreatSessionAsSensitive(true);
    setRequireSameSite(true);
    setWarnLongExpiry(true);
    setSuggestFixes(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setOutputMode("summary");
    setCookieContext("https");
    setTreatSessionAsSensitive(true);
    setRequireSameSite(true);
    setWarnLongExpiry(true);
    setSuggestFixes(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="Cookie Security Checker"
      description="Review Set-Cookie headers for common security issues. Check Secure, HttpOnly, SameSite, expiry, Domain, Path, cookie prefixes, Partitioned cookies, and risky settings in your browser."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Set-Cookie Headers
        </label>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setResult(null);
            setOutput("");
            setError("");
            setCopied(false);
          }}
          placeholder={sampleCookies}
          className="w-full min-h-[360px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste one or more Set-Cookie headers from a response, browser devtools,
          curl output, or an API gateway.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Options
        </h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value) => {
              setOutputMode(value as OutputMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Summary", value: "summary" },
              { label: "Detailed report", value: "report" },
              { label: "JSON", value: "json" },
              { label: "Suggested headers", value: "fixed" },
            ]}
          />

          <YoryantraSelect
            label="Cookie Context"
            value={cookieContext}
            onChange={(value) => {
              setCookieContext(value as CookieContext);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "HTTPS site", value: "https" },
              { label: "HTTP site", value: "http" },
              { label: "Local testing", value: "local" },
            ]}
          />

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={treatSessionAsSensitive}
              onChange={(event) => {
                setTreatSessionAsSensitive(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Treat session/auth cookies as sensitive
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={requireSameSite}
              onChange={(event) => {
                setRequireSameSite(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Warn when SameSite is missing
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={warnLongExpiry}
              onChange={(event) => {
                setWarnLongExpiry(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Warn about long-lived cookies
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={suggestFixes}
              onChange={(event) => {
                setSuggestFixes(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Suggest safer Set-Cookie headers
          </label>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Cookie checks are based on common browser security practices. Review
          changes before using them in production.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={checkCookies} className="yoryantra-btn">
          Check Cookies
        </button>

        <button onClick={copyOutput} className="yoryantra-btn" disabled={!output}>
          {copied ? "Copied" : "Copy Output"}
        </button>

        <button onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Cookies" value={result.totalCookies.toLocaleString()} />
          <SummaryCard label="Passed" value={result.passCount.toLocaleString()} />
          <SummaryCard label="Warnings" value={result.warningCount.toLocaleString()} />
          <SummaryCard label="High Risk" value={result.highCount.toLocaleString()} />
        </div>
      )}

      {result && result.cookies.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Cookie Review
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Parsed cookie attributes and security findings.
          </p>

          <div className="mt-4 space-y-4">
            {result.cookies.map((cookie, index) => (
              <div key={`${cookie.name}-${index}`} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-900">
                    {cookie.name || "(unnamed cookie)"}
                  </span>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                    Score {cookie.score}/100
                  </span>

                  {cookie.flags.secure && (
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                      Secure
                    </span>
                  )}

                  {cookie.flags.httpOnly && (
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                      HttpOnly
                    </span>
                  )}

                  {cookie.flags.sameSite && (
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                      SameSite={cookie.flags.sameSite}
                    </span>
                  )}
                </div>

                {cookie.issues.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {cookie.issues.map((issue, index) => (
                      <div
                        key={`${cookie.name}-${issue.title}-${index}`}
                        className={`rounded-lg border p-3 text-sm ${
                          issue.severity === "high"
                            ? "border-red-200 bg-red-50 text-red-800"
                            : issue.severity === "warning"
                            ? "border-amber-200 bg-amber-50 text-amber-800"
                            : "border-blue-200 bg-blue-50 text-blue-800"
                        }`}
                      >
                        <p className="font-semibold">{issue.title}</p>
                        <p className="mt-1 leading-relaxed">{issue.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-green-700">
                    No common cookie security issues were found for this cookie.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Cookie notes
          </h3>

          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-amber-900">
                  {note.title}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-amber-800">
                  {note.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Output
          </h3>

          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[340px] whitespace-pre-wrap break-words">
          {output || "Cookie security report will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Cookie checking happens directly in your browser. Your pasted headers are
        not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Checking Cookie Security Settings
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Cookies often carry session IDs, login tokens, preferences, tracking
            values, and other browser state. A small mistake in a Set-Cookie
            header can make a cookie easier to steal, send cross-site, or expose
            to client-side scripts.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Cookie Security Checker reviews Set-Cookie headers for common
            issues such as missing Secure, missing HttpOnly, weak SameSite
            settings, risky domain scope, long expiry, Partitioned cookie
            requirements, and prefix rule mistakes.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reviewing a Set-Cookie Header
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste one or more Set-Cookie headers into the input box.</li>
            <li>Choose whether the cookies belong to HTTPS, HTTP, or local testing.</li>
            <li>Turn on checks for session cookies, SameSite, expiry, and suggested fixes.</li>
            <li>Run the checker and review warnings for each cookie.</li>
            <li>Copy the summary, detailed report, JSON, or suggested headers.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Cookie Security Checker Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Checking session cookies for Secure and HttpOnly flags.</li>
            <li>Reviewing SameSite settings before deploying login flows.</li>
            <li>Finding cookies that are scoped too broadly with Domain.</li>
            <li>Checking __Host-, __Secure-, __Http-, and __Host-Http- cookie prefix rules.</li>
            <li>Reviewing Partitioned cookies that must also use Secure.</li>
            <li>Reviewing Set-Cookie headers from curl, devtools, or API responses.</li>
            <li>Preparing safer cookie settings for web apps and APIs.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Secure Cookie
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Set-Cookie: __Host-session=abc123; Path=/; Secure; HttpOnly; SameSite=Lax`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Cookie Security Depends on the App
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A safe cookie setting depends on how the cookie is used. A session
            cookie usually needs stronger protection than a harmless preference
            cookie. A cross-site integration may need SameSite=None, but that
            also requires Secure.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Use this tool to catch common mistakes, then review the final header
            with your real login, API, JavaScript access, cross-site behavior,
            and browser support in mind.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What does a Cookie Security Checker do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It checks Set-Cookie headers for common security settings like
                Secure, HttpOnly, SameSite, Domain, Path, expiry, Partitioned
                cookies, and prefix rules.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why is HttpOnly important?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                HttpOnly helps prevent JavaScript from reading a cookie, which is
                especially important for session and authentication cookies.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why does SameSite=None need Secure?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Browsers require SameSite=None cookies to also use Secure so they
                are only sent over HTTPS.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Should every cookie use Domain?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Omitting Domain usually keeps the cookie scoped to the exact
                host, which is often safer for sensitive cookies.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What should Partitioned cookies include?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Partitioned cookies must use Secure. For safer host scoping, a
                __Host- or __Host-Http- prefix is often a good fit when your app
                can use it.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are my cookie headers uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Cookie checking happens directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/cookie-security-checker" />
        </div>
      </section>
    </ToolShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>

      <div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}

function analyzeCookies(
  input: string,
  options: {
    outputMode: OutputMode;
    cookieContext: CookieContext;
    treatSessionAsSensitive: boolean;
    requireSameSite: boolean;
    warnLongExpiry: boolean;
    suggestFixes: boolean;
  }
): CookieResult {
  const headers = extractCookieHeaders(input);

  if (headers.length === 0) {
    throw new Error("No Set-Cookie headers were found.");
  }

  const cookies = headers.map((header) => analyzeSingleCookie(header, options));
  const passCount = cookies.filter((cookie) => cookie.issues.every((issue) => issue.severity !== "warning" && issue.severity !== "high")).length;
  const warningCount = cookies.reduce(
    (count, cookie) => count + cookie.issues.filter((issue) => issue.severity === "warning").length,
    0
  );
  const highCount = cookies.reduce(
    (count, cookie) => count + cookie.issues.filter((issue) => issue.severity === "high").length,
    0
  );
  const output = formatOutput(cookies, {
    outputMode: options.outputMode,
    suggestFixes: options.suggestFixes,
  });

  return {
    cookies,
    totalCookies: cookies.length,
    passCount,
    warningCount,
    highCount,
    output,
  };
}

function extractCookieHeaders(input: string) {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^set-cookie:\s*/i, ""))
    .filter((line) => line.includes("="));
}

function analyzeSingleCookie(
  header: string,
  options: {
    cookieContext: CookieContext;
    treatSessionAsSensitive: boolean;
    requireSameSite: boolean;
    warnLongExpiry: boolean;
    suggestFixes: boolean;
  }
): ParsedCookie {
  const parts = splitCookieHeader(header);
  const [nameValue, ...attributeParts] = parts;
  const equalsIndex = nameValue.indexOf("=");
  const name = equalsIndex === -1 ? nameValue.trim() : nameValue.slice(0, equalsIndex).trim();
  const value = equalsIndex === -1 ? "" : nameValue.slice(equalsIndex + 1).trim();
  const attributes: Record<string, string | true> = {};

  attributeParts.forEach((part) => {
    const index = part.indexOf("=");
    const rawName = index === -1 ? part.trim() : part.slice(0, index).trim();
    const rawValue = index === -1 ? true : part.slice(index + 1).trim();
    attributes[rawName.toLowerCase()] = rawValue;
  });

  const flags = {
    secure: "secure" in attributes,
    httpOnly: "httponly" in attributes,
    sameSite: typeof attributes.samesite === "string" ? attributes.samesite : "",
    domain: typeof attributes.domain === "string" ? attributes.domain : "",
    path: typeof attributes.path === "string" ? attributes.path : "",
    expires: typeof attributes.expires === "string" ? attributes.expires : "",
    maxAge: typeof attributes["max-age"] === "string" ? attributes["max-age"] : "",
    partitioned: "partitioned" in attributes,
  };
  const issues = getCookieIssues({
    name,
    value,
    attributes,
    flags,
    options,
  });
  const score = calculateScore(issues);
  const fixedHeader = buildSuggestedHeader({
    name,
    value,
    attributes,
    flags,
  });

  return {
    original: header,
    name,
    value,
    attributes,
    flags,
    issues,
    score,
    fixedHeader,
  };
}

function splitCookieHeader(header: string) {
  const parts: string[] = [];
  let current = "";
  let inExpires = false;

  header.split(";").forEach((part, index) => {
    const trimmed = part.trim();

    if (index > 0 && /^expires=/i.test(trimmed)) {
      inExpires = true;
      current = trimmed;
      return;
    }

    if (inExpires && !/^\s*[A-Za-z-]+\s*=/.test(trimmed) && !/^(secure|httponly|partitioned)$/i.test(trimmed)) {
      current += `; ${trimmed}`;
      return;
    }

    if (inExpires) {
      parts.push(current);
      current = "";
      inExpires = false;
    }

    parts.push(trimmed);
  });

  if (current) {
    parts.push(current);
  }

  return parts.filter(Boolean);
}

function getCookieIssues({
  name,
  value,
  attributes,
  flags,
  options,
}: {
  name: string;
  value: string;
  attributes: Record<string, string | true>;
  flags: ParsedCookie["flags"];
  options: {
    cookieContext: CookieContext;
    treatSessionAsSensitive: boolean;
    requireSameSite: boolean;
    warnLongExpiry: boolean;
  };
}) {
  const issues: CookieIssue[] = [];
  const lowerName = name.toLowerCase();
  const sameSite = flags.sameSite.toLowerCase();
  const hasHostPrefix = name.startsWith("__Host-") || name.startsWith("__Host-Http-");
  const hasHttpPrefix = name.startsWith("__Http-") || name.startsWith("__Host-Http-");
  const sensitive =
    options.treatSessionAsSensitive &&
    /(session|auth|token|jwt|sid|login|csrf|xsrf)/i.test(name);

  if (!name) {
    issues.push({
      severity: "high",
      title: "Missing cookie name",
      message: "This Set-Cookie header does not have a clear cookie name.",
    });
  }

  if (!value) {
    issues.push({
      severity: "info",
      title: "Empty cookie value",
      message: "The cookie value is empty. That may be intentional when clearing cookies.",
    });
  }

  if (!flags.secure && options.cookieContext === "https") {
    issues.push({
      severity: sensitive ? "high" : "warning",
      title: "Missing Secure flag",
      message: "Secure helps make sure the cookie is only sent over HTTPS.",
    });
  }

  if (flags.secure && options.cookieContext === "http") {
    issues.push({
      severity: "info",
      title: "Secure cookie on HTTP context",
      message: "Secure cookies are meant for HTTPS. For plain HTTP testing, browser behavior may differ from production.",
    });
  }

  if (!flags.httpOnly && sensitive) {
    issues.push({
      severity: "high",
      title: "Sensitive cookie missing HttpOnly",
      message: "Session, auth, token, or login cookies should usually use HttpOnly.",
    });
  } else if (!flags.httpOnly) {
    issues.push({
      severity: "info",
      title: "HttpOnly not set",
      message: "HttpOnly is useful when JavaScript does not need to read this cookie.",
    });
  }

  if (options.requireSameSite && !flags.sameSite) {
    issues.push({
      severity: "warning",
      title: "Missing SameSite",
      message: "SameSite helps control whether cookies are sent in cross-site requests.",
    });
  }

  if (flags.sameSite && !["lax", "strict", "none"].includes(sameSite)) {
    issues.push({
      severity: "warning",
      title: "Unknown SameSite value",
      message: "SameSite should usually be Lax, Strict, or None.",
    });
  }

  if (sameSite === "none" && !flags.secure) {
    issues.push({
      severity: "high",
      title: "SameSite=None without Secure",
      message: "Browsers require SameSite=None cookies to also use Secure.",
    });
  }

  if (flags.partitioned && !flags.secure) {
    issues.push({
      severity: "high",
      title: "Partitioned cookie missing Secure",
      message: "Partitioned cookies must be set with Secure.",
    });
  }

  if (flags.partitioned && !hasHostPrefix) {
    issues.push({
      severity: "info",
      title: "Partitioned cookie without host prefix",
      message: "A __Host- or __Host-Http- prefix can help keep a Partitioned cookie bound to the hostname.",
    });
  }

  if (flags.domain && sensitive) {
    issues.push({
      severity: "warning",
      title: "Sensitive cookie uses Domain",
      message: "A Domain attribute can make a sensitive cookie available to subdomains.",
    });
  }

  if (!flags.path) {
    issues.push({
      severity: "info",
      title: "Path is missing",
      message: "Setting Path=/ is common when the cookie is meant for the whole site.",
    });
  }

  if (flags.maxAge && !isValidMaxAge(flags.maxAge)) {
    issues.push({
      severity: "warning",
      title: "Invalid Max-Age",
      message: "Max-Age should be a valid number of seconds.",
    });
  }

  if (flags.expires && Number.isNaN(Date.parse(flags.expires))) {
    issues.push({
      severity: "warning",
      title: "Invalid Expires date",
      message: "Expires should be a valid HTTP date value.",
    });
  }

  if (options.warnLongExpiry && isLongLived(flags.maxAge, flags.expires)) {
    issues.push({
      severity: sensitive ? "high" : "warning",
      title: "Long-lived cookie",
      message: "Long expiry can increase risk if the cookie is stolen or misused.",
    });
  }

  if (hasHostPrefix && (!flags.secure || flags.domain || flags.path !== "/")) {
    issues.push({
      severity: "high",
      title: "__Host- prefix rule issue",
      message: "__Host- and __Host-Http- cookies must use Secure, Path=/, and must not use Domain.",
    });
  }

  if (name.startsWith("__Secure-") && !flags.secure) {
    issues.push({
      severity: "high",
      title: "__Secure- prefix rule issue",
      message: "__Secure- cookies must use the Secure flag.",
    });
  }

  if (hasHttpPrefix && (!flags.secure || !flags.httpOnly)) {
    issues.push({
      severity: "high",
      title: "__Http- prefix rule issue",
      message: "__Http- and __Host-Http- cookies must use both Secure and HttpOnly.",
    });
  }

  if (lowerName.includes("csrf") && sameSite === "none") {
    issues.push({
      severity: "warning",
      title: "CSRF cookie uses SameSite=None",
      message: "CSRF-related cookies often need careful SameSite behavior. Review this setting.",
    });
  }

  return issues;
}

function isValidMaxAge(maxAge: string) {
  const seconds = Number(maxAge);
  return Number.isFinite(seconds) && Number.isInteger(seconds);
}

function normalizeSameSite(sameSite: string) {
  const value = sameSite.toLowerCase();

  if (value === "strict") {
    return "Strict";
  }

  if (value === "none") {
    return "None";
  }

  return "Lax";
}

function isLongLived(maxAge: string, expires: string) {
  if (maxAge) {
    const seconds = Number(maxAge);
    return Number.isFinite(seconds) && seconds > 60 * 60 * 24 * 90;
  }

  if (expires) {
    const time = Date.parse(expires);

    if (!Number.isNaN(time)) {
      return time - Date.now() > 1000 * 60 * 60 * 24 * 90;
    }
  }

  return false;
}

function calculateScore(issues: CookieIssue[]) {
  let score = 100;

  issues.forEach((issue) => {
    if (issue.severity === "high") {
      score -= 30;
    } else if (issue.severity === "warning") {
      score -= 15;
    } else if (issue.severity === "info") {
      score -= 5;
    }
  });

  return Math.max(0, score);
}

function buildSuggestedHeader({
  name,
  value,
  attributes,
  flags,
}: {
  name: string;
  value: string;
  attributes: Record<string, string | true>;
  flags: ParsedCookie["flags"];
}) {
  const hasHostPrefix = name.startsWith("__Host-") || name.startsWith("__Host-Http-");
  const parts = [`${name}=${value}`];
  const path = hasHostPrefix ? "/" : flags.path || "/";
  const sameSite = normalizeSameSite(flags.sameSite);

  parts.push(`Path=${path}`);
  parts.push("Secure");
  parts.push("HttpOnly");
  parts.push(`SameSite=${sameSite}`);

  if (flags.maxAge && isValidMaxAge(flags.maxAge)) {
    parts.push(`Max-Age=${Math.trunc(Number(flags.maxAge))}`);
  } else if (flags.expires && !Number.isNaN(Date.parse(flags.expires))) {
    parts.push(`Expires=${flags.expires}`);
  }

  if (flags.partitioned) {
    parts.push("Partitioned");
  }

  if (typeof attributes.priority === "string") {
    parts.push(`Priority=${attributes.priority}`);
  }

  return `Set-Cookie: ${parts.join("; ")}`;
}

function formatOutput(
  cookies: ParsedCookie[],
  options: {
    outputMode: OutputMode;
    suggestFixes: boolean;
  }
) {
  if (options.outputMode === "json") {
    return JSON.stringify(cookies, null, 2);
  }

  if (options.outputMode === "fixed") {
    return cookies.map((cookie) => cookie.fixedHeader).join("\n");
  }

  if (options.outputMode === "report") {
    return cookies
      .map((cookie) => {
        const issues =
          cookie.issues.length === 0
            ? ["- No common issues found."]
            : cookie.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`);

        return [
          `Cookie: ${cookie.name}`,
          `Score: ${cookie.score}/100`,
          `Secure: ${cookie.flags.secure ? "yes" : "no"}`,
          `HttpOnly: ${cookie.flags.httpOnly ? "yes" : "no"}`,
          `SameSite: ${cookie.flags.sameSite || "(missing)"}`,
          `Domain: ${cookie.flags.domain || "(not set)"}`,
          `Path: ${cookie.flags.path || "(not set)"}`,
          "",
          "Findings:",
          ...issues,
          ...(options.suggestFixes ? ["", "Suggested:", cookie.fixedHeader] : []),
        ].join("\n");
      })
      .join("\n\n---\n\n");
  }

  const totalHigh = cookies.reduce(
    (count, cookie) => count + cookie.issues.filter((issue) => issue.severity === "high").length,
    0
  );
  const totalWarnings = cookies.reduce(
    (count, cookie) => count + cookie.issues.filter((issue) => issue.severity === "warning").length,
    0
  );

  return [
    "Cookie Security Summary",
    "-----------------------",
    `Cookies checked: ${cookies.length}`,
    `High risk findings: ${totalHigh}`,
    `Warnings: ${totalWarnings}`,
    "",
    ...cookies.map((cookie) => {
      const topIssues = cookie.issues
        .filter((issue) => issue.severity === "high" || issue.severity === "warning")
        .slice(0, 3)
        .map((issue) => `  - ${issue.title}`)
        .join("\n");

      return [
        `${cookie.name}: ${cookie.score}/100`,
        topIssues || "  - No major issues found",
      ].join("\n");
    }),
  ].join("\n");
}

function getCookieNotes(result: CookieResult): CookieNote[] {
  const notes: CookieNote[] = [];

  if (result.highCount > 0) {
    notes.push({
      title: "High risk cookie findings",
      message:
        "One or more cookies have high-risk findings. Review Secure, HttpOnly, SameSite, and prefix rules carefully.",
    });
  }

  if (result.warningCount > 0) {
    notes.push({
      title: "Warnings found",
      message:
        "Warnings do not always mean the cookie is broken, but they are worth checking before production use.",
    });
  }

  if (result.cookies.some((cookie) => cookie.flags.sameSite.toLowerCase() === "none")) {
    notes.push({
      title: "Cross-site cookie behavior",
      message:
        "SameSite=None is used for cross-site cookies. Make sure those cookies also use Secure and are truly needed cross-site.",
    });
  }

  return notes;
}
