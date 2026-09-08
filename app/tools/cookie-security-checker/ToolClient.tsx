"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "summary" | "report" | "json" | "draft";
type CookieContext = "https" | "http" | "local";
type Severity = "info" | "warning" | "high";

type CookieAttribute = {
  rawName: string;
  name: string;
  value: string | true;
};

type CookieIssue = {
  severity: Severity;
  title: string;
  message: string;
};

type ParsedCookie = {
  original: string;
  name: string;
  value: string;
  attributes: Record<string, string | true>;
  attributeList: CookieAttribute[];
  duplicateAttributes: string[];
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
  sensitiveByName: boolean;
  issues: CookieIssue[];
  hardeningDraft: string;
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
  const [result, setResult] = useState<CookieResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getCookieNotes(result) : []), [result]);

  const clearResult = () => {
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const checkCookies = () => {
    if (!input.trim()) {
      setError("Paste one or more Set-Cookie header values first.");
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
      });
      setResult(nextResult);
      setOutput(nextResult.output);
      setError("");
      setCopied(false);
    } catch (caught) {
      setResult(null);
      setOutput("");
      setCopied(false);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to parse these Set-Cookie headers."
      );
    }
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setError("The cookie report could not be copied. Select it and copy it manually.");
    }
  };

  const loadExample = () => {
    setInput(sampleCookies);
    setOutputMode("summary");
    setCookieContext("https");
    setTreatSessionAsSensitive(true);
    setRequireSameSite(true);
    setWarnLongExpiry(true);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setOutputMode("summary");
    setCookieContext("https");
    setTreatSessionAsSensitive(true);
    setRequireSameSite(true);
    setWarnLongExpiry(true);
    clearResult();
  };

  return (
    <ToolShell
      title="Cookie Security Checker"
      description="Check Set-Cookie attributes, prefix rules, cross-site behavior, and scope without guessing application intent."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Set-Cookie headers
        </label>
        <textarea
          value={input}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
            setInput(event.target.value);
            clearResult();
          }}
          placeholder={sampleCookies}
          className="min-h-[340px] w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Paste one header per line. If you paste a larger response-header block containing Set-Cookie lines, unrelated headers are ignored. Separate Set-Cookie fields are never comma-joined.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Interpretation options</h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value) => {
              setOutputMode(value as OutputMode);
              clearResult();
            }}
            options={[
              { label: "Summary", value: "summary" },
              { label: "Detailed report", value: "report" },
              { label: "JSON", value: "json" },
              { label: "Hardening draft", value: "draft" },
            ]}
          />

          <YoryantraSelect
            label="Deployment context"
            value={cookieContext}
            onChange={(value) => {
              setCookieContext(value as CookieContext);
              clearResult();
            }}
            options={[
              { label: "HTTPS site", value: "https" },
              { label: "HTTP site", value: "http" },
              { label: "Localhost / local testing", value: "local" },
            ]}
          />

          <label className="flex cursor-pointer items-start gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={treatSessionAsSensitive}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setTreatSessionAsSensitive(event.target.checked);
                clearResult();
              }}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--light-gold)]"
            />
            <span>
              Treat names containing session, auth, token, jwt, or sid as security-sensitive
              <span className="mt-1 block font-normal leading-relaxed text-gray-500">
                This is a naming heuristic only. The cookie name cannot prove what the value authorizes.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={requireSameSite}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setRequireSameSite(event.target.checked);
                clearResult();
              }}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--light-gold)]"
            />
            <span>Call out cookies that omit an explicit SameSite attribute</span>
          </label>

          <label className="flex cursor-pointer items-start gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={warnLongExpiry}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setWarnLongExpiry(event.target.checked);
                clearResult();
              }}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--light-gold)]"
            />
            <span>Call out lifetimes beyond the 400-day user-agent guidance</span>
          </label>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={checkCookies} className="yoryantra-btn whitespace-nowrap">
          Check Cookies
        </button>
        <button
          onClick={copyOutput}
          className="yoryantra-btn whitespace-nowrap"
          disabled={!output}
        >
          {copied ? "Copied" : "Copy Output"}
        </button>
        <button onClick={loadExample} className="yoryantra-btn-outline whitespace-nowrap">
          Load Example
        </button>
        <button onClick={resetAll} className="yoryantra-btn-outline whitespace-nowrap">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Cookies" value={String(result.totalCookies)} />
          <SummaryCard label="No cautions" value={String(result.passCount)} />
          <SummaryCard label="Cautions" value={String(result.warningCount)} />
          <SummaryCard label="High risk" value={String(result.highCount)} />
        </div>
      )}

      {result && result.cookies.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Cookie-by-cookie findings</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Red findings are reserved for clear rejection conditions or dangerous combinations. Amber findings need application context before changing the header.
          </p>

          <div className="mt-4 space-y-4">
            {result.cookies.map((cookie, cookieIndex) => {
              const high = cookie.issues.filter((issue) => issue.severity === "high").length;
              const warning = cookie.issues.filter((issue) => issue.severity === "warning").length;
              return (
                <div
                  key={`${cookie.name}-${cookieIndex}`}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-semibold text-gray-900">
                      {cookie.name || "(unnamed cookie)"}
                    </span>
                    {cookie.flags.secure && (
                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">Secure</span>
                    )}
                    {cookie.flags.httpOnly && (
                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">HttpOnly</span>
                    )}
                    {cookie.flags.sameSite && (
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700">
                        SameSite={cookie.flags.sameSite}
                      </span>
                    )}
                    {high > 0 && (
                      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                        {high} high risk
                      </span>
                    )}
                    {warning > 0 && (
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                        {warning} caution{warning === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>

                  {cookie.issues.length > 0 ? (
                    <div className="mt-4 grid items-start gap-3 md:grid-cols-2">
                      {cookie.issues.map((issue, issueIndex) => (
                        <div
                          key={`${cookieIndex}-${issue.title}-${issueIndex}`}
                          className={`self-start rounded-lg border p-3 text-sm ${
                            issue.severity === "high"
                              ? "border-red-200 bg-red-50 text-red-800"
                              : issue.severity === "warning"
                                ? "border-amber-200 bg-amber-50 text-amber-800"
                                : "border-gray-200 bg-white text-gray-700"
                          }`}
                        >
                          <p className="font-semibold">{issue.title}</p>
                          <p className="mt-1 leading-relaxed">{issue.message}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm leading-relaxed text-gray-600">
                      No high-risk or caution-level findings were produced under the selected interpretation options.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 grid items-start gap-4 md:grid-cols-2">
          {notes.map((note) => (
            <div
              key={note.title}
              className="self-start rounded-xl border border-amber-200 bg-amber-50 p-4"
            >
              <p className="text-sm font-semibold text-amber-900">{note.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-amber-800">{note.message}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Output</h3>
          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline whitespace-nowrap text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
        <pre className="yoryantra-output min-h-[300px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "The cookie report will appear here."}
        </pre>
      </div>

      <div className="mt-4 self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
        Parsing happens in this browser. The pasted Set-Cookie values are not sent anywhere by this page.
      </div>

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            A Set-Cookie line carries behavior, not just a value
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A cookie&apos;s name and value are only the first part of the instruction. Secure changes when the browser may send it, HttpOnly changes whether script can read it, SameSite changes cross-site sending, Domain and Path narrow request scope, and expiry attributes decide whether it survives the browser session.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Because those choices depend on what the application is doing, this page separates standards violations from application-dependent cautions. It does not assign a made-up security score to a cookie whose purpose it cannot know.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Secure and HttpOnly solve different problems
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Secure limits transmission to secure transport, while HttpOnly prevents JavaScript access through APIs such as <code className="font-mono">document.cookie</code>. An authentication cookie commonly benefits from both. A cookie intentionally read by frontend JavaScript cannot simply be given HttpOnly without changing application behavior, which is why the hardening draft does not add it from a name heuristic alone.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            SameSite omission is not a promise of Lax behavior
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Modern browsers commonly apply a Lax-like default when SameSite is omitted, but omission is not the same configuration as explicitly sending <code className="font-mono">SameSite=Lax</code>. Compatibility details have changed over time. For a cookie that must be sent cross-site, <code className="font-mono">SameSite=None</code> also requires Secure.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Domain and Path are scope controls, not authentication boundaries
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Without Domain, a cookie is host-only. Adding Domain makes it available to matching subdomains as well, which can be too broad for a sensitive cookie. Path narrows when the browser sends a cookie, but the cookie specification explicitly warns against treating Path as a security boundary between applications on the same host.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Prefixes turn part of the cookie name into browser-enforced constraints
          </h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Prefix</th>
                  <th className="px-4 py-3 font-semibold">Required shape</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white text-gray-600">
                <tr><td className="px-4 py-3 font-mono">__Secure-</td><td className="px-4 py-3">Secure and a secure origin.</td></tr>
                <tr><td className="px-4 py-3 font-mono">__Host-</td><td className="px-4 py-3">Secure, Path=/, no Domain, and a secure origin.</td></tr>
                <tr><td className="px-4 py-3 font-mono">__Http-</td><td className="px-4 py-3">Secure, HttpOnly, and a secure origin.</td></tr>
                <tr><td className="px-4 py-3 font-mono">__Host-Http-</td><td className="px-4 py-3">Combines the host-only and HttpOnly requirements.</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 leading-relaxed text-gray-600">
            The current cookie specification tells user agents to recognize these prefixes case-insensitively. That detail is often missed in server-side linters that only check an exact uppercase spelling.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Partitioned changes storage context, not cookie secrecy
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A Partitioned cookie is stored in a partition keyed by top-level site context. The attribute requires Secure, but partitioning does not replace HttpOnly, SameSite decisions, careful Domain scope, or normal server-side authorization. Host-prefixed names can further constrain scope when the deployment can use them.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Max-Age wins when both lifetime attributes are present
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            When Max-Age and Expires appear together, Max-Age takes precedence. Zero or a negative Max-Age is a deletion instruction rather than a long-lived cookie. Current user-agent guidance also caps very distant expirations to roughly 400 days, so the lifetime check calls out values beyond that boundary instead of inventing a much shorter universal limit.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            A hardening draft cannot know your application intent
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The draft output only applies mechanical requirements that follow from the existing header: for example, adding Secure when SameSite=None or Partitioned requires it, and repairing the mandatory shape of a recognized cookie prefix. It does not remove Domain from an ordinary cookie, force Path=/, add HttpOnly from a guessed name, or invent SameSite=Lax, because each of those can change real behavior.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            The current cookie standard is newer than RFC 6265
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 10025, published in 2026, updates HTTP cookie behavior and obsoletes RFC 6265. Browser documentation remains valuable for deployment details such as SameSite=None, localhost handling, Partitioned cookies, and prefix support. If a server framework serializes cookies for you, compare its output with both the current standard and the browsers you support.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            References: {" "}
            <a
              href="https://www.rfc-editor.org/rfc/rfc10025"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-2"
            >
              RFC 10025
            </a>{" "}
            and {" "}
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-2"
            >
              MDN Set-Cookie
            </a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/cookie-security-checker" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">{value}</p>
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
  }
): CookieResult {
  const headers = extractCookieHeaders(input);
  if (headers.length === 0) {
    throw new Error("No Set-Cookie values were found in the pasted text.");
  }

  const cookies = headers.map((header) => analyzeSingleCookie(header, options));
  const passCount = cookies.filter((cookie) =>
    cookie.issues.every((issue) => issue.severity === "info")
  ).length;
  const warningCount = cookies.reduce(
    (count, cookie) => count + cookie.issues.filter((issue) => issue.severity === "warning").length,
    0
  );
  const highCount = cookies.reduce(
    (count, cookie) => count + cookie.issues.filter((issue) => issue.severity === "high").length,
    0
  );
  const output = formatOutput(cookies, options.outputMode);

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
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const explicit = lines
    .filter((line) => /^set-cookie\s*:/i.test(line))
    .map((line) => line.replace(/^set-cookie\s*:\s*/i, ""));

  if (explicit.length > 0) return explicit;

  if (lines.some((line) => /^[!#$%&'*+.^_`|~0-9A-Za-z-]+\s*:/.test(line))) {
    throw new Error("A response-header block was detected, but it contains no Set-Cookie header lines.");
  }

  return lines;
}

function analyzeSingleCookie(
  header: string,
  options: {
    cookieContext: CookieContext;
    treatSessionAsSensitive: boolean;
    requireSameSite: boolean;
    warnLongExpiry: boolean;
  }
): ParsedCookie {
  const segments = header.split(";").map((part) => part.trim());
  const first = segments.shift() || "";
  const separatorIndex = first.indexOf("=");
  const name = separatorIndex >= 0 ? first.slice(0, separatorIndex).trim() : "";
  const value = separatorIndex >= 0 ? first.slice(separatorIndex + 1).trim() : first.trim();
  const attributeList: CookieAttribute[] = [];
  const attributes: Record<string, string | true> = {};
  const counts: Record<string, number> = {};

  segments.filter(Boolean).forEach((segment) => {
    const index = segment.indexOf("=");
    const rawName = (index >= 0 ? segment.slice(0, index) : segment).trim();
    const normalizedName = rawName.toLowerCase();
    const attributeValue = index >= 0 ? segment.slice(index + 1).trim() : true;
    attributeList.push({ rawName, name: normalizedName, value: attributeValue });
    attributes[normalizedName] = attributeValue;
    counts[normalizedName] = (counts[normalizedName] || 0) + 1;
  });

  const duplicateAttributes = Object.keys(counts).filter((key) => counts[key] > 1);
  const sameSite = normalizeSameSite(readAttribute(attributes, "samesite"));
  const flags = {
    secure: attributes.secure === true,
    httpOnly: attributes.httponly === true,
    sameSite,
    domain: readAttribute(attributes, "domain"),
    path: readAttribute(attributes, "path"),
    expires: readAttribute(attributes, "expires"),
    maxAge: readAttribute(attributes, "max-age"),
    partitioned: attributes.partitioned === true,
  };
  const sensitiveByName = options.treatSessionAsSensitive && isSensitiveCookieName(name);
  const issues = getCookieIssues({
    name,
    value,
    attributes,
    duplicateAttributes,
    flags,
    sensitiveByName,
    options,
  });
  const hardeningDraft = buildHardeningDraft({ name, value, attributeList, attributes });

  return {
    original: header,
    name,
    value,
    attributes,
    attributeList,
    duplicateAttributes,
    flags,
    sensitiveByName,
    issues,
    hardeningDraft,
  };
}

function readAttribute(attributes: Record<string, string | true>, name: string) {
  const value = attributes[name];
  return typeof value === "string" ? value : "";
}

function getCookieIssues({
  name,
  value,
  attributes,
  duplicateAttributes,
  flags,
  sensitiveByName,
  options,
}: {
  name: string;
  value: string;
  attributes: Record<string, string | true>;
  duplicateAttributes: string[];
  flags: ParsedCookie["flags"];
  sensitiveByName: boolean;
  options: {
    cookieContext: CookieContext;
    requireSameSite: boolean;
    warnLongExpiry: boolean;
  };
}) {
  const issues: CookieIssue[] = [];
  const lowerName = name.toLowerCase();

  if (!name) {
    issues.push({
      severity: "high",
      title: "Cookie name is missing",
      message: "The first name=value pair has no cookie name. Well-behaved server syntax requires a valid cookie-name before the equals sign.",
    });
  } else if (!isValidCookieName(name)) {
    issues.push({
      severity: "high",
      title: "Cookie name contains invalid characters",
      message: "The cookie name falls outside the token characters allowed by the current Set-Cookie server syntax.",
    });
  }

  if (!isWellBehavedCookieValue(value)) {
    issues.push({
      severity: "warning",
      title: "Cookie value falls outside conservative server syntax",
      message: "Browsers can be permissive while parsing, but this value contains characters that a well-behaved Set-Cookie serializer should quote or avoid. Check the framework that produced it.",
    });
  }

  if (duplicateAttributes.length > 0) {
    issues.push({
      severity: "warning",
      title: "Duplicate attributes make the result ambiguous",
      message: `Repeated attributes: ${duplicateAttributes.join(", ")}. User agents process repeated attributes in order, so avoid depending on which value wins.`,
    });
  }

  if (sensitiveByName && options.cookieContext === "https" && !flags.secure) {
    issues.push({
      severity: "high",
      title: "Sensitive-looking cookie is not Secure",
      message: "Without Secure, this cookie can be sent on an insecure HTTP request if one is made. Confirm the cookie's real purpose before changing application behavior.",
    });
  } else if (!flags.secure && options.cookieContext === "https") {
    issues.push({
      severity: "warning",
      title: "Secure is absent",
      message: "The deployment is marked HTTPS, but this cookie does not require secure transport. Decide whether any HTTP transmission would be acceptable for its value.",
    });
  }

  if (flags.secure && options.cookieContext === "http") {
    issues.push({
      severity: "warning",
      title: "Secure cookie on an HTTP deployment",
      message: "A Secure cookie is not normally set or returned over an insecure HTTP origin. Move the deployment to HTTPS rather than removing Secure from a sensitive cookie.",
    });
  }

  if (flags.secure && options.cookieContext === "local") {
    issues.push({
      severity: "info",
      title: "Localhost has special secure-context behavior",
      message: "Browsers commonly make localhost exceptions for local development. Test the actual browser and hostname instead of assuming production HTTPS behavior is identical.",
    });
  }

  if (sensitiveByName && !flags.httpOnly) {
    issues.push({
      severity: "warning",
      title: "Sensitive-looking cookie is script-readable",
      message: "HttpOnly is absent. Add it only if frontend JavaScript does not need to read this cookie; the name heuristic cannot know that requirement.",
    });
  }

  if (options.requireSameSite && !readAttribute(attributes, "samesite")) {
    issues.push({
      severity: "warning",
      title: "SameSite is implicit",
      message: "Modern browsers often apply a Lax-like default, but omission is not identical to explicitly choosing Lax. State the intended cross-site behavior when compatibility matters.",
    });
  }

  const rawSameSite = readAttribute(attributes, "samesite");
  if (rawSameSite && !flags.sameSite) {
    issues.push({
      severity: "warning",
      title: "SameSite value is not recognized",
      message: `SameSite=${rawSameSite} is not Strict, Lax, or None. A browser may ignore the attribute and fall back to its default behavior.`,
    });
  }

  if (flags.sameSite === "None" && !flags.secure) {
    issues.push({
      severity: "high",
      title: "SameSite=None requires Secure",
      message: "Browsers require SameSite=None cookies to carry Secure. Without it, the cookie can be rejected rather than behaving as a cross-site cookie.",
    });
  }

  if (flags.partitioned && !flags.secure) {
    issues.push({
      severity: "high",
      title: "Partitioned requires Secure",
      message: "Partitioned cookies must also carry Secure. Add Secure and serve the cookie from an appropriate secure context.",
    });
  }

  if (flags.partitioned && !lowerName.startsWith("__host-") && !lowerName.startsWith("__host-http-")) {
    issues.push({
      severity: "info",
      title: "Partitioned cookie is not host-prefixed",
      message: "A host prefix is not mandatory for Partitioned, but it can tighten host scope when the application can meet the prefix requirements.",
    });
  }

  if (flags.domain) {
    if (sensitiveByName) {
      issues.push({
        severity: "warning",
        title: "Sensitive-looking cookie has Domain scope",
        message: "A Domain attribute makes the cookie available to matching subdomains. Omit Domain when host-only scope is sufficient for the application.",
      });
    } else {
      issues.push({
        severity: "info",
        title: "Domain widens host scope",
        message: "The cookie is not host-only. Confirm that matching subdomains really need to receive it.",
      });
    }
    if (flags.domain.startsWith(".")) {
      issues.push({
        severity: "info",
        title: "Leading dot on Domain is ignored",
        message: "Current cookie processing ignores a leading dot on Domain. It does not create a different subdomain-only scope.",
      });
    }
  }

  if (!flags.path) {
    issues.push({
      severity: "info",
      title: "Path will be defaulted by the browser",
      message: "Without Path, the browser derives a default from the request path. Path controls request scope but should not be treated as an isolation boundary between applications.",
    });
  }

  if (flags.maxAge) {
    if (!/^-?\d+$/.test(flags.maxAge)) {
      issues.push({
        severity: "warning",
        title: "Max-Age is not an integer",
        message: "Max-Age uses an integer number of seconds. Values such as decimals, exponent notation, or arbitrary text should not be relied on.",
      });
    } else {
      const maxAge = Number(flags.maxAge);
      if (Number.isSafeInteger(maxAge) && maxAge <= 0) {
        issues.push({
          severity: "info",
          title: "Max-Age requests cookie deletion",
          message: "A zero or negative Max-Age tells the browser to expire the cookie rather than keep it as a persistent cookie.",
        });
      }
    }
  }

  if (flags.expires && Number.isNaN(Date.parse(flags.expires))) {
    issues.push({
      severity: "warning",
      title: "Expires is not recognized as a date here",
      message: "The browser cookie-date algorithm is more specific than JavaScript Date.parse, so treat this as a compatibility signal rather than definitive rejection. Check the serialized date format.",
    });
  }

  if (flags.maxAge && flags.expires) {
    issues.push({
      severity: "info",
      title: "Max-Age takes precedence over Expires",
      message: "When both attributes are present, Max-Age controls the cookie lifetime. Keep the values aligned if Expires is present for older compatibility.",
    });
  }

  if (options.warnLongExpiry && isBeyondFourHundredDays(flags.maxAge, flags.expires)) {
    issues.push({
      severity: "warning",
      title: "Lifetime exceeds 400-day browser guidance",
      message: "Current user-agent guidance caps very distant cookie lifetimes to roughly 400 days. A larger server value may therefore be shortened by the browser.",
    });
  }

  addPrefixIssues(issues, lowerName, flags, options.cookieContext);
  return issues;
}

function addPrefixIssues(
  issues: CookieIssue[],
  lowerName: string,
  flags: ParsedCookie["flags"],
  context: CookieContext
) {
  const secureOriginProblem = context === "http";
  const isHostHttp = lowerName.startsWith("__host-http-");
  const isHost = lowerName.startsWith("__host-");
  const isHttp = lowerName.startsWith("__http-");
  const isSecure = lowerName.startsWith("__secure-");

  if (isHostHttp) {
    if (!flags.secure || !flags.httpOnly || flags.path !== "/" || Boolean(flags.domain)) {
      issues.push({
        severity: "high",
        title: "__Host-Http- prefix requirements are not met",
        message: "This prefix requires Secure, HttpOnly, Path=/, no Domain, and a secure origin. Browsers that enforce the prefix can reject a cookie that violates those constraints.",
      });
    }
  } else if (isHost) {
    if (!flags.secure || flags.path !== "/" || Boolean(flags.domain)) {
      issues.push({
        severity: "high",
        title: "__Host- prefix requirements are not met",
        message: "A __Host- cookie requires Secure, Path=/, no Domain, and a secure origin. Browsers that enforce the prefix can reject a violating cookie.",
      });
    }
  } else if (isHttp) {
    if (!flags.secure || !flags.httpOnly) {
      issues.push({
        severity: "high",
        title: "__Http- prefix requirements are not met",
        message: "A __Http- cookie requires both Secure and HttpOnly from a secure origin. Support is newer than the older __Host- and __Secure- prefixes, so test target browsers.",
      });
    }
  } else if (isSecure && !flags.secure) {
    issues.push({
      severity: "high",
      title: "__Secure- prefix requires Secure",
      message: "A __Secure- cookie must carry Secure and be set from a secure origin. Browsers that enforce the prefix can reject it otherwise.",
    });
  }

  if ((isHostHttp || isHost || isHttp || isSecure) && secureOriginProblem) {
    issues.push({
      severity: "high",
      title: "Cookie prefix requires a secure origin",
      message: "The selected deployment context is HTTP, but this cookie name uses a prefix whose contract includes a secure origin.",
    });
  }
}

function normalizeSameSite(value: string) {
  const lower = value.toLowerCase();
  if (lower === "strict") return "Strict";
  if (lower === "lax") return "Lax";
  if (lower === "none") return "None";
  return "";
}

function isSensitiveCookieName(name: string) {
  return /(?:^|[-_.])(session|sess|sid|auth|token|jwt)(?:$|[-_.])/i.test(name) ||
    /(sessionid|authentic|access_token|refresh_token)/i.test(name);
}

function isValidCookieName(name: string) {
  return /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(name);
}

function isWellBehavedCookieValue(value: string) {
  const unquoted = value.startsWith('"') && value.endsWith('"') ? value.slice(1, -1) : value;
  return /^[\x21\x23-\x2B\x2D-\x3A\x3C-\x5B\x5D-\x7E]*$/.test(unquoted);
}

function isBeyondFourHundredDays(maxAge: string, expires: string) {
  const limitSeconds = 400 * 24 * 60 * 60;
  if (/^-?\d+$/.test(maxAge)) {
    const value = Number(maxAge);
    if (Number.isSafeInteger(value) && value > limitSeconds) return true;
  }

  if (expires) {
    const timestamp = Date.parse(expires);
    if (!Number.isNaN(timestamp) && timestamp - Date.now() > limitSeconds * 1000) return true;
  }

  return false;
}

function buildHardeningDraft({
  name,
  value,
  attributeList,
  attributes,
}: {
  name: string;
  value: string;
  attributeList: CookieAttribute[];
  attributes: Record<string, string | true>;
}) {
  const normalized = new Map<string, CookieAttribute>();
  attributeList.forEach((attribute) => normalized.set(attribute.name, attribute));
  const lowerName = name.toLowerCase();
  const needsHost = lowerName.startsWith("__host-") || lowerName.startsWith("__host-http-");
  const needsHttpOnly = lowerName.startsWith("__http-") || lowerName.startsWith("__host-http-");
  const sameSite = normalizeSameSite(readAttribute(attributes, "samesite"));
  const needsSecure =
    lowerName.startsWith("__secure-") ||
    needsHost ||
    needsHttpOnly ||
    sameSite === "None" ||
    attributes.partitioned === true;

  if (needsSecure && !normalized.has("secure")) {
    normalized.set("secure", { rawName: "Secure", name: "secure", value: true });
  }
  if (needsHttpOnly && !normalized.has("httponly")) {
    normalized.set("httponly", { rawName: "HttpOnly", name: "httponly", value: true });
  }
  if (needsHost) {
    normalized.delete("domain");
    normalized.set("path", { rawName: "Path", name: "path", value: "/" });
  }

  const rendered = Array.from(normalized.values()).map((attribute) =>
    attribute.value === true ? canonicalAttributeName(attribute.name, attribute.rawName) : `${canonicalAttributeName(attribute.name, attribute.rawName)}=${attribute.value}`
  );
  return [`Set-Cookie: ${name}${name || value ? "=" : ""}${name ? value : ""}`, ...rendered]
    .filter(Boolean)
    .join("; ");
}

function canonicalAttributeName(name: string, fallback: string) {
  const known: Record<string, string> = {
    secure: "Secure",
    httponly: "HttpOnly",
    samesite: "SameSite",
    domain: "Domain",
    path: "Path",
    expires: "Expires",
    "max-age": "Max-Age",
    partitioned: "Partitioned",
    priority: "Priority",
  };
  return known[name] || fallback;
}

function formatOutput(cookies: ParsedCookie[], outputMode: OutputMode) {
  if (outputMode === "json") {
    return JSON.stringify(
      cookies.map((cookie) => ({
        name: cookie.name,
        value: cookie.value,
        attributes: cookie.attributes,
        duplicateAttributes: cookie.duplicateAttributes,
        sensitiveByName: cookie.sensitiveByName,
        findings: cookie.issues,
        hardeningDraft: cookie.hardeningDraft,
      })),
      null,
      2
    );
  }

  if (outputMode === "draft") {
    return [
      "Hardening draft — verify application behavior before deployment",
      "",
      ...cookies.map((cookie) => cookie.hardeningDraft),
      "",
      "The draft only repairs mechanical requirements implied by the existing header. It does not invent SameSite, remove ordinary Domain scope, or add HttpOnly from a guessed cookie purpose.",
    ].join("\n");
  }

  if (outputMode === "report") {
    return cookies
      .map((cookie, index) => {
        const findings = cookie.issues.length
          ? cookie.issues.map((issue) => `- ${issue.severity.toUpperCase()}: ${issue.title} — ${issue.message}`).join("\n")
          : "- No caution-level findings under the selected options.";
        return [
          `${index + 1}. ${cookie.name || "(unnamed cookie)"}`,
          `Original: ${cookie.original}`,
          `Secure: ${cookie.flags.secure ? "yes" : "no"}`,
          `HttpOnly: ${cookie.flags.httpOnly ? "yes" : "no"}`,
          `SameSite: ${cookie.flags.sameSite || "not explicit / unrecognized"}`,
          `Domain: ${cookie.flags.domain || "host-only"}`,
          `Path: ${cookie.flags.path || "browser default"}`,
          `Partitioned: ${cookie.flags.partitioned ? "yes" : "no"}`,
          "Findings:",
          findings,
        ].join("\n");
      })
      .join("\n\n");
  }

  return cookies
    .map((cookie, index) => {
      const high = cookie.issues.filter((issue) => issue.severity === "high").length;
      const warning = cookie.issues.filter((issue) => issue.severity === "warning").length;
      const info = cookie.issues.filter((issue) => issue.severity === "info").length;
      return `${index + 1}. ${cookie.name || "(unnamed cookie)"} — high ${high}, caution ${warning}, info ${info}`;
    })
    .join("\n");
}

function getCookieNotes(result: CookieResult): CookieNote[] {
  const notes: CookieNote[] = [];

  if (result.highCount > 0) {
    notes.push({
      title: "Some combinations can be rejected or expose sensitive state",
      message: "Prioritize the red findings first. They are reserved for clear prefix/attribute violations, dangerous transport gaps on sensitive-looking cookies, or combinations browsers require you to fix.",
    });
  }

  if (result.cookies.some((cookie) => cookie.sensitiveByName)) {
    notes.push({
      title: "Cookie-name sensitivity is only a hint",
      message: "Names such as session or auth suggest higher impact, but a name cannot prove whether JavaScript access, cross-site requests, or subdomain scope are required.",
    });
  }

  if (result.cookies.some((cookie) => cookie.duplicateAttributes.length > 0)) {
    notes.push({
      title: "Remove duplicate attributes at the serializer",
      message: "Do not depend on duplicate Set-Cookie attributes resolving the same way across intermediaries and user agents. Fix the source that serializes the cookie.",
    });
  }

  return notes;
}
