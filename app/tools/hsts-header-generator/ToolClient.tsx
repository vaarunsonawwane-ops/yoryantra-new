"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type PresetMode =
  | "testing"
  | "thirtyDays"
  | "sixMonths"
  | "oneYear"
  | "twoYears"
  | "custom";
type OutputMode = "header" | "nginx" | "apache" | "cloudflare" | "json";

type HeaderResult = {
  headerValue: string;
  fullHeader: string;
  maxAge: number;
  output: string;
  preloadHeaderShape: boolean;
  warnings: string[];
  observations: string[];
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
  const [result, setResult] = useState<HeaderResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getHSTSNotes(result) : []), [result]);

  const clearResult = () => {
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const generateHeader = () => {
    try {
      const nextResult = buildHSTSHeader({
        presetMode,
        customMaxAge,
        outputMode,
        includeSubDomains,
        preload,
      });

      setResult(nextResult);
      setOutput(nextResult.output);
      setError("");
      setCopied(false);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to generate this HSTS header."
      );
      setResult(null);
      setOutput("");
      setCopied(false);
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
      setError(
        "The HSTS output could not be copied. Select it and copy it manually."
      );
    }
  };

  const loadExample = () => {
    setPresetMode("testing");
    setCustomMaxAge("300");
    setOutputMode("header");
    setIncludeSubDomains(true);
    setPreload(false);
    clearResult();
  };

  const resetAll = () => {
    setPresetMode("oneYear");
    setCustomMaxAge("31536000");
    setOutputMode("header");
    setIncludeSubDomains(true);
    setPreload(false);
    clearResult();
  };

  return (
    <ToolShell
      title="HSTS Header Generator"
      description="Build an HSTS header while keeping max-age, subdomain scope, and preload consequences visible."
    >
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">HSTS settings</h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Max-Age preset"
            value={presetMode}
            onChange={(value) => {
              const next = value as PresetMode;
              setPresetMode(next);
              setCustomMaxAge(String(presetSeconds[next]));
              clearResult();
            }}
            options={[
              { label: "Testing — 5 minutes", value: "testing" },
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
              clearResult();
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
              Max-Age seconds
            </label>
            <input
              inputMode="numeric"
              value={customMaxAge}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setPresetMode("custom");
                setCustomMaxAge(event.target.value);
                clearResult();
              }}
              placeholder="31536000"
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              HSTS uses decimal seconds. Enter 0 only when you intentionally want
              the receiving browser to forget this host&apos;s stored HSTS policy.
            </p>
          </div>

          <label className="flex cursor-pointer items-start gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={includeSubDomains}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setIncludeSubDomains(event.target.checked);
                clearResult();
              }}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--light-gold)]"
            />
            <span>
              Include subdomains
              <span className="mt-1 block font-normal leading-relaxed text-gray-500">
                Every affected subdomain must keep working over HTTPS while the
                policy is remembered.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={preload}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setPreload(event.target.checked);
                clearResult();
              }}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--light-gold)]"
            />
            <span>
              Add preload directive
              <span className="mt-1 block font-normal leading-relaxed text-gray-500">
                This is an opt-in signal for browser preload lists, not part of
                the core RFC 6797 grammar and not an automatic submission.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={generateHeader}
          className="yoryantra-btn whitespace-nowrap"
        >
          Generate HSTS Header
        </button>
        <button
          onClick={copyOutput}
          className="yoryantra-btn whitespace-nowrap"
          disabled={!output}
        >
          {copied ? "Copied" : "Copy Output"}
        </button>
        <button
          onClick={loadExample}
          className="yoryantra-btn-outline whitespace-nowrap"
        >
          Load Rollout Example
        </button>
        <button
          onClick={resetAll}
          className="yoryantra-btn-outline whitespace-nowrap"
        >
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
          <SummaryCard label="Max-Age" value={result.maxAge.toLocaleString()} />
          <SummaryCard label="Duration" value={formatDuration(result.maxAge)} />
          <SummaryCard
            label="Subdomains"
            value={includeSubDomains ? "Included" : "Not included"}
          />
          <SummaryCard
            label="Preload header shape"
            value={result.preloadHeaderShape ? "Meets header fields" : "No"}
          />
        </div>
      )}

      {result && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Generated header</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            HSTS is meaningful only when this response header is received over
            HTTPS. Do not send a production policy until the affected hosts are
            ready to stay HTTPS-only for the selected lifetime.
          </p>
          <pre className="mt-4 overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm font-mono text-gray-800 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
            {result.fullHeader}
          </pre>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Before you deploy it
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

      {result && result.observations.length > 0 && (
        <div className="mt-6 self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">What this value means</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            {result.observations.join(" ")}
          </p>
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Output</h3>
          {output && (
            <button
              onClick={copyOutput}
              className="yoryantra-btn-outline whitespace-nowrap text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
        <pre className="yoryantra-output min-h-[260px] overflow-auto whitespace-pre-wrap break-words text-sm [overflow-wrap:anywhere]">
          {output || "Generated HSTS output will appear here."}
        </pre>
      </div>

      <div className="mt-4 self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
        The header is assembled in your browser. No hostname, policy value, or
        generated output is sent anywhere by this page.
      </div>

      <section className="mt-12 space-y-11 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What the browser remembers after HSTS arrives
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A browser that accepts a Strict-Transport-Security header remembers
            that host as HTTPS-only for the number of seconds in max-age. During
            that period it upgrades HTTP attempts before making the network
            request. The policy is learned from an HTTPS response; sending the
            header over plain HTTP does not establish HSTS.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            That memory is why a long value deserves care. A certificate outage,
            forgotten subdomain, old device endpoint, or internal hostname can
            become inaccessible instead of falling back to HTTP. HSTS is meant to
            make that fallback impossible.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Roll out max-age before you commit for a year
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A short policy is easier to recover from while you are checking
            redirects, certificates, mixed deployment paths, and subdomains.
            The HSTS preload project recommends staged values such as five
            minutes, one week, and one month before a long-term policy. Waiting
            through each stage matters because previously cached HSTS state does
            not disappear when you change the server configuration.
          </p>
          <div className="mt-4 overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <pre className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
{`Strict-Transport-Security: max-age=300; includeSubDomains`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            includeSubDomains is a domain-wide promise
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            With includeSubDomains present, the policy covers descendants of the
            HSTS host as well. That can include old applications, internal names,
            customer-specific subdomains, and hosts managed by another team. A
            forgotten HTTP-only subdomain is enough to make a broad policy hurt.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Also remember that a child host cannot reliably opt out while it is
            still covered by an ancestor&apos;s active includeSubDomains policy.
            Sending max-age=0 on the child does not cancel the parent&apos;s policy.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Preload is separate from ordinary HSTS
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 6797 defines HSTS itself. The preload directive is an ecosystem
            convention used by browser preload lists. A header containing
            max-age of at least one year, includeSubDomains, and preload has the
            required header shape for the current submission service, but that
            does not make a domain eligible by itself. Certificates, redirects,
            the base domain, and every subdomain still have to satisfy the
            service&apos;s checks.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The preload project explicitly advises against enabling preload by
            default because removal can take months to reach users. Treat it as
            a separate operational decision, not a checkbox that makes HSTS
            stronger automatically.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            What max-age=0 actually removes
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A value of zero tells a browser that receives the HTTPS response to
            stop treating that host as an HSTS host. It does not repair a broken
            certificate path before the browser can reach the HTTPS response,
            and it does not override HSTS inherited from a parent domain that is
            still active with includeSubDomains.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Keep the header and the deployment target separate
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Nginx, Apache, a CDN, and a managed host all express response-header
            rules differently. The generated server snippets only place the same
            HSTS value into common configuration syntax. They cannot verify that
            the rule runs on every HTTPS response, survives redirects, or is
            inherited into nested configuration blocks.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            The two references worth checking before a long-lived policy
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The protocol behavior comes from{" "}
            <a
              href="https://www.rfc-editor.org/rfc/rfc6797"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              RFC 6797
            </a>
            . If you are considering preload, read the current{" "}
            <a
              href="https://hstspreload.org/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              HSTS preload requirements and rollout guidance
            </a>
            . The preload service can change independently of the RFC, so its
            live requirements matter more than an old copied checklist.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/hsts-header-generator" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900 [overflow-wrap:anywhere]">
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
}: {
  presetMode: PresetMode;
  customMaxAge: string;
  outputMode: OutputMode;
  includeSubDomains: boolean;
  preload: boolean;
}): HeaderResult {
  const rawMaxAge =
    presetMode === "custom" ? customMaxAge.trim() : String(presetSeconds[presetMode]);

  if (!/^\d+$/.test(rawMaxAge)) {
    throw new Error("Max-age must contain decimal digits only, such as 300 or 31536000.");
  }

  const maxAge = Number(rawMaxAge);

  if (!Number.isSafeInteger(maxAge)) {
    throw new Error(
      "Max-age is too large for this browser tool to preserve exactly. Use a value up to 9007199254740991 seconds."
    );
  }

  const parts = [`max-age=${maxAge}`];
  if (includeSubDomains) parts.push("includeSubDomains");
  if (preload) parts.push("preload");

  const headerValue = parts.join("; ");
  const fullHeader = `Strict-Transport-Security: ${headerValue}`;
  const preloadHeaderShape =
    maxAge >= 31536000 && includeSubDomains && preload;
  const warnings: string[] = [];
  const observations: string[] = [];

  if (maxAge === 0) {
    observations.push(
      "max-age=0 is a removal instruction for this host after the browser receives it over HTTPS."
    );
  } else if (maxAge < 2592000) {
    observations.push(
      "This is a short-lived policy, which is easier to recover from during staged rollout."
    );
  } else if (maxAge >= 31536000) {
    observations.push(
      "This browser may remember the HTTPS-only policy for a year or longer unless a later HTTPS response changes it."
    );
  }

  if (includeSubDomains && maxAge > 0) {
    warnings.push(
      "includeSubDomains extends the policy to descendant hosts, so every affected subdomain needs working HTTPS."
    );
  }

  if (preload && !preloadHeaderShape) {
    warnings.push(
      "The current preload submission header shape requires max-age of at least 31536000 seconds plus includeSubDomains and preload."
    );
  }

  if (preload) {
    warnings.push(
      "Preload is a separate browser-list commitment and can be slow to undo; the header alone does not submit or qualify the domain."
    );
  }

  if (maxAge === 0 && (includeSubDomains || preload)) {
    warnings.push(
      "A removal header normally does not need includeSubDomains or preload; inherited parent-domain HSTS can still apply."
    );
  }

  const output = formatOutput({
    outputMode,
    headerValue,
    fullHeader,
    maxAge,
    includeSubDomains,
    preload,
    preloadHeaderShape,
    warnings,
    observations,
  });

  return {
    headerValue,
    fullHeader,
    maxAge,
    output,
    preloadHeaderShape,
    warnings,
    observations,
  };
}

function formatOutput({
  outputMode,
  headerValue,
  fullHeader,
  maxAge,
  includeSubDomains,
  preload,
  preloadHeaderShape,
  warnings,
  observations,
}: {
  outputMode: OutputMode;
  headerValue: string;
  fullHeader: string;
  maxAge: number;
  includeSubDomains: boolean;
  preload: boolean;
  preloadHeaderShape: boolean;
  warnings: string[];
  observations: string[];
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
        preloadHeaderShape,
        warnings,
        observations,
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
      "Apply the response-header rule to HTTPS responses only.",
    ].join("\n");
  }

  return fullHeader;
}

function formatDuration(seconds: number) {
  if (seconds === 0) return "Removal value";
  if (seconds < 60) return `${seconds} second${seconds === 1 ? "" : "s"}`;
  if (seconds < 86400) {
    const hours = seconds / 3600;
    return Number.isInteger(hours) ? `${hours} hour${hours === 1 ? "" : "s"}` : `${seconds.toLocaleString()} seconds`;
  }
  const days = seconds / 86400;
  if (Number.isInteger(days) && days < 365) return `${days} days`;
  const years = seconds / 31536000;
  if (Number.isInteger(years)) return `${years} year${years === 1 ? "" : "s"}`;
  return `${seconds.toLocaleString()} seconds`;
}

function getHSTSNotes(result: HeaderResult): HSTSNote[] {
  const notes: HSTSNote[] = [];

  result.warnings.forEach((warning, index) => {
    notes.push({ title: `Caution ${index + 1}`, message: warning });
  });

  if (result.preloadHeaderShape) {
    notes.push({
      title: "Header shape, not preload readiness",
      message:
        "The directive combination matches the current preload header requirements, but domain-wide HTTPS, redirects, certificates, and submission status still have to be checked separately.",
    });
  }

  return notes;
}
