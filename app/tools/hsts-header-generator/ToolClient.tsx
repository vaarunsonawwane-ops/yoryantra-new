"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type PresetMode = "testing" | "thirtyDays" | "sixMonths" | "oneYear" | "twoYears" | "custom";
type OutputMode = "header" | "nginx" | "apache" | "cloudflare" | "json";
type HeaderResult = {
  headerValue: string;
  fullHeader: string;
  maxAge: number;
  output: string;
  preloadReady: boolean;
  warnings: string[];
  notes: string[];
};

type HSTSNote = {
  title: string;
  message: string;
};

const presetSeconds: Record<PresetMode, number> = {
  testing: 300,
  thirtyDays: 2592000,
  sixMonths: 15552000,
  oneYear: 31536000,
  twoYears: 63072000,
  custom: 31536000,
};

export default function ToolClient() {
  const [presetMode, setPresetMode] = useState<PresetMode>("oneYear");
  const [customMaxAge, setCustomMaxAge] = useState("31536000");
  const [outputMode, setOutputMode] = useState<OutputMode>("header");
  const [includeSubDomains, setIncludeSubDomains] = useState(true);
  const [preload, setPreload] = useState(false);
  const [forceHttpsNote, setForceHttpsNote] = useState(true);
  const [result, setResult] = useState<HeaderResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getHSTSNotes(result) : []), [result]);

  const generateHeader = () => {
    try {
      const nextResult = buildHSTSHeader({
        presetMode,
        customMaxAge,
        outputMode,
        includeSubDomains,
        preload,
        forceHttpsNote,
      });

      setResult(nextResult);
      setOutput(nextResult.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate this HSTS header."
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
    setPresetMode("oneYear");
    setCustomMaxAge("31536000");
    setOutputMode("header");
    setIncludeSubDomains(true);
    setPreload(false);
    setForceHttpsNote(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setPresetMode("oneYear");
    setCustomMaxAge("31536000");
    setOutputMode("header");
    setIncludeSubDomains(true);
    setPreload(false);
    setForceHttpsNote(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="HSTS Header Generator"
      description="Generate Strict-Transport-Security headers for HTTPS sites. Configure max-age, includeSubDomains, preload readiness, and copy clean HSTS headers directly in your browser."
    >
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          HSTS Settings
        </h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Max-Age Preset"
            value={presetMode}
            onChange={(value) => {
              const next = value as PresetMode;
              setPresetMode(next);
              setCustomMaxAge(String(presetSeconds[next]));
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Testing - 5 minutes", value: "testing" },
              { label: "30 days", value: "thirtyDays" },
              { label: "6 months", value: "sixMonths" },
              { label: "1 year", value: "oneYear" },
              { label: "2 years", value: "twoYears" },
              { label: "Custom", value: "custom" },
            ]}
          />

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
              { label: "HTTP header", value: "header" },
              { label: "Nginx config", value: "nginx" },
              { label: "Apache config", value: "apache" },
              { label: "Cloudflare rule text", value: "cloudflare" },
              { label: "JSON", value: "json" },
            ]}
          />

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Custom Max-Age Seconds
            </label>

            <input
              value={customMaxAge}
              onChange={(event) => {
                setPresetMode("custom");
                setCustomMaxAge(event.target.value);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              placeholder="31536000"
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={includeSubDomains}
              onChange={(event) => {
                setIncludeSubDomains(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Include subdomains
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={preload}
              onChange={(event) => {
                setPreload(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Add preload directive
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={forceHttpsNote}
              onChange={(event) => {
                setForceHttpsNote(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Include HTTPS readiness warnings
          </label>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Start with a short max-age while testing. Use long values only after
          HTTPS works correctly on the main domain and all subdomains you include.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generateHeader} className="yoryantra-btn">
          Generate HSTS Header
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
          <SummaryCard label="Max-Age" value={result.maxAge.toLocaleString()} />
          <SummaryCard
            label="Duration"
            value={formatDuration(result.maxAge)}
          />
          <SummaryCard
            label="Subdomains"
            value={includeSubDomains ? "Included" : "Not included"}
          />
          <SummaryCard
            label="Preload Ready"
            value={result.preloadReady ? "Yes" : "No"}
          />
        </div>
      )}

      {result && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Generated Header
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Copy this value into your web server, CDN, reverse proxy, or hosting
            header settings.
          </p>

          <pre className="mt-4 overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm font-mono text-gray-800 whitespace-pre-wrap break-words">
            {result.fullHeader}
          </pre>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            HSTS notes
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

        <pre className="yoryantra-output overflow-auto text-sm min-h-[300px] whitespace-pre-wrap break-words">
          {output || "Generated HSTS output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        HSTS header generation happens directly in your browser. No domain or
        header value is uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Generating Strict-Transport-Security Headers
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            HSTS tells browsers to use HTTPS for future visits to your site. It
            helps prevent accidental HTTP access and reduces the chance of
            downgrade-related problems after a visitor has received the header.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This HSTS Header Generator creates a clean
            Strict-Transport-Security header with max-age, includeSubDomains, and
            preload options. It also gives practical warnings so you do not lock
            yourself into a setting before your HTTPS setup is ready.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Creating an HSTS Header Safely
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Choose a max-age value. Start small while testing.</li>
            <li>Enable includeSubDomains only if all subdomains support HTTPS.</li>
            <li>Add preload only when you understand the preload requirements.</li>
            <li>Generate the header and review the warnings.</li>
            <li>Copy the output for your server, CDN, or hosting provider.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common HSTS Header Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Adding a Strict-Transport-Security header to an HTTPS site.</li>
            <li>Preparing Nginx or Apache header configuration.</li>
            <li>Testing short max-age values before a longer rollout.</li>
            <li>Checking whether a header looks ready for preload.</li>
            <li>Creating CDN or hosting provider header values.</li>
            <li>Reviewing includeSubDomains before enabling it site-wide.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example HSTS Header
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Strict-Transport-Security: max-age=31536000; includeSubDomains`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Be Careful With Long HSTS Values
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            HSTS is powerful because browsers remember it. A long max-age can
            keep browsers forcing HTTPS for months or years. That is useful for a
            stable HTTPS site, but risky if your HTTPS setup is incomplete.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Before using includeSubDomains or preload, check that every affected
            hostname can serve HTTPS correctly. Start with a short value while
            testing, then increase it after you are confident.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is an HSTS header?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                HSTS stands for HTTP Strict Transport Security. It tells browsers
                to use HTTPS for future requests to a site.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What does max-age mean?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                max-age is the number of seconds a browser should remember the
                HSTS rule for your site.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Should I enable includeSubDomains?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Only enable it if every subdomain that matters supports HTTPS
                correctly. Otherwise some subdomains may become hard to access.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is HSTS preload?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Preload is a stronger setup where browsers can know your site
                should use HTTPS before the first visit. It should be used only
                when you are sure the whole domain is ready.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is anything uploaded when I generate the header?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The HSTS header is generated directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/security-header-generator" className="yoryantra-btn-outline">
              Security Header Generator
            </Link>

            <Link href="/tools/security-headers-scanner" className="yoryantra-btn-outline">
              Security Headers Scanner
            </Link>

            <Link href="/tools/cookie-security-checker" className="yoryantra-btn-outline">
              Cookie Security Checker
            </Link>

            <Link href="/tools/csp-generator" className="yoryantra-btn-outline">
              CSP Generator
            </Link>

            <Link href="/tools/cors-header-checker" className="yoryantra-btn-outline">
              CORS Header Checker
            </Link>
          </div>
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

function buildHSTSHeader({
  presetMode,
  customMaxAge,
  outputMode,
  includeSubDomains,
  preload,
  forceHttpsNote,
}: {
  presetMode: PresetMode;
  customMaxAge: string;
  outputMode: OutputMode;
  includeSubDomains: boolean;
  preload: boolean;
  forceHttpsNote: boolean;
}): HeaderResult {
  const maxAge = presetMode === "custom" ? Number(customMaxAge) : presetSeconds[presetMode];

  if (!Number.isFinite(maxAge) || maxAge < 0) {
    throw new Error("Max-age must be a positive number of seconds.");
  }

  const parts = [`max-age=${Math.floor(maxAge)}`];

  if (includeSubDomains) {
    parts.push("includeSubDomains");
  }

  if (preload) {
    parts.push("preload");
  }

  const headerValue = parts.join("; ");
  const fullHeader = `Strict-Transport-Security: ${headerValue}`;
  const preloadReady = maxAge >= 31536000 && includeSubDomains && preload;
  const warnings: string[] = [];
  const notes: string[] = [];

  if (maxAge < 86400) {
    notes.push("Short max-age is useful for testing but too short for long-term HSTS protection.");
  }

  if (maxAge >= 31536000) {
    notes.push("Long max-age is suitable only after HTTPS is stable.");
  }

  if (includeSubDomains) {
    warnings.push("includeSubDomains affects every subdomain. Make sure they all support HTTPS.");
  }

  if (preload && !preloadReady) {
    warnings.push("Preload usually expects max-age of at least 1 year, includeSubDomains, and preload directive.");
  }

  if (preload) {
    warnings.push("Preload can be difficult to undo. Review the domain carefully before submitting it for preload.");
  }

  if (forceHttpsNote) {
    warnings.push("Only send HSTS over HTTPS. Browsers ignore it over plain HTTP.");
  }

  const output = formatOutput({
    outputMode,
    headerValue,
    fullHeader,
    maxAge: Math.floor(maxAge),
    includeSubDomains,
    preload,
    preloadReady,
    warnings,
    notes,
  });

  return {
    headerValue,
    fullHeader,
    maxAge: Math.floor(maxAge),
    output,
    preloadReady,
    warnings,
    notes,
  };
}

function formatOutput({
  outputMode,
  headerValue,
  fullHeader,
  maxAge,
  includeSubDomains,
  preload,
  preloadReady,
  warnings,
  notes,
}: {
  outputMode: OutputMode;
  headerValue: string;
  fullHeader: string;
  maxAge: number;
  includeSubDomains: boolean;
  preload: boolean;
  preloadReady: boolean;
  warnings: string[];
  notes: string[];
}) {
  if (outputMode === "json") {
    return JSON.stringify(
      {
        header: fullHeader,
        value: headerValue,
        maxAge,
        duration: formatDuration(maxAge),
        includeSubDomains,
        preload,
        preloadReady,
        warnings,
        notes,
      },
      null,
      2
    );
  }

  if (outputMode === "nginx") {
    return `add_header Strict-Transport-Security "${headerValue}" always;`;
  }

  if (outputMode === "apache") {
    return `Header always set Strict-Transport-Security "${headerValue}"`;
  }

  if (outputMode === "cloudflare") {
    return [
      "Header name: Strict-Transport-Security",
      `Header value: ${headerValue}`,
      "",
      "Apply this as a response header rule on HTTPS traffic only.",
    ].join("\n");
  }

  return fullHeader;
}

function formatDuration(seconds: number) {
  if (seconds < 60) {
    return `${seconds} seconds`;
  }

  const days = Math.round(seconds / 86400);

  if (days < 30) {
    return `${days} days`;
  }

  const months = Math.round(days / 30);

  if (months < 12) {
    return `${months} months`;
  }

  const years = Math.round(months / 12);

  return `${years} year${years === 1 ? "" : "s"}`;
}

function getHSTSNotes(result: HeaderResult): HSTSNote[] {
  const notes: HSTSNote[] = [];

  if (result.warnings.length > 0) {
    notes.push({
      title: "Review before deploying",
      message: result.warnings.join(" "),
    });
  }

  if (result.preloadReady) {
    notes.push({
      title: "Preload-style header",
      message:
        "This header has the common preload directives. Review your whole domain and subdomains before using preload.",
    });
  }

  if (result.maxAge < 86400) {
    notes.push({
      title: "Testing value",
      message:
        "This max-age is short. It is useful for testing, but it does not provide long-term HSTS behavior.",
    });
  }

  return notes;
}
