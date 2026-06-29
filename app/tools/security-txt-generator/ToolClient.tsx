"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "securityTxt" | "signedTemplate" | "json" | "markdown" | "nginx" | "apache";
type ExpiryPreset = "30" | "90" | "180" | "365" | "custom";
type ContactType = "email" | "url" | "both";

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type Result = {
  output: string;
  securityTxt: string;
  issues: Issue[];
  expiryDate: string;
  fieldCount: number;
  requiredFieldCount: number;
  canonicalUrl: string;
};

export default function ToolClient() {
  const [domain, setDomain] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactUrl, setContactUrl] = useState("");
  const [policyUrl, setPolicyUrl] = useState("");
  const [encryptionUrl, setEncryptionUrl] = useState("");
  const [acknowledgmentsUrl, setAcknowledgmentsUrl] = useState("");
  const [hiringUrl, setHiringUrl] = useState("");
  const [preferredLanguages, setPreferredLanguages] = useState("en");
  const [expiryPreset, setExpiryPreset] = useState<ExpiryPreset>("365");
  const [customExpiry, setCustomExpiry] = useState("");
  const [contactType, setContactType] = useState<ContactType>("email");
  const [outputMode, setOutputMode] = useState<OutputMode>("securityTxt");
  const [includeCanonical, setIncludeCanonical] = useState(true);
  const [includePolicy, setIncludePolicy] = useState(true);
  const [includePreferredLanguages, setIncludePreferredLanguages] = useState(true);
  const [includeCommentHeader, setIncludeCommentHeader] = useState(true);
  const [warnMissingPolicy, setWarnMissingPolicy] = useState(true);
  const [result, setResult] = useState<Result | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getNotes(result) : []), [result]);

  const clearResult = () => {
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const generateSecurityTxt = () => {
    if (!domain.trim()) {
      setError("Please enter your domain or website URL.");
      setResult(null);
      setOutput("");
      return;
    }

    if ((contactType === "email" || contactType === "both") && !contactEmail.trim()) {
      setError("Please enter a security contact email.");
      setResult(null);
      setOutput("");
      return;
    }

    if ((contactType === "url" || contactType === "both") && !contactUrl.trim()) {
      setError("Please enter a security contact URL.");
      setResult(null);
      setOutput("");
      return;
    }

    try {
      const next = buildSecurityTxt({
        domain,
        contactEmail,
        contactUrl,
        policyUrl,
        encryptionUrl,
        acknowledgmentsUrl,
        hiringUrl,
        preferredLanguages,
        expiryPreset,
        customExpiry,
        contactType,
        outputMode,
        includeCanonical,
        includePolicy,
        includePreferredLanguages,
        includeCommentHeader,
        warnMissingPolicy,
      });

      setResult(next);
      setOutput(next.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate security.txt.");
      setResult(null);
      setOutput("");
    }
  };

  const copyOutput = async () => {
    if (!output) return;

    await navigator.clipboard.writeText(output);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1400);
  };

  const loadExample = () => {
    setDomain("https://example.com");
    setContactEmail("security@example.com");
    setContactUrl("https://example.com/security-contact");
    setPolicyUrl("https://example.com/security-policy");
    setEncryptionUrl("https://example.com/pgp-key.txt");
    setAcknowledgmentsUrl("https://example.com/security/thanks");
    setHiringUrl("");
    setPreferredLanguages("en, hi");
    setExpiryPreset("365");
    setCustomExpiry("");
    setContactType("both");
    setOutputMode("securityTxt");
    setIncludeCanonical(true);
    setIncludePolicy(true);
    setIncludePreferredLanguages(true);
    setIncludeCommentHeader(true);
    setWarnMissingPolicy(true);
    clearResult();
  };

  const resetAll = () => {
    setDomain("");
    setContactEmail("");
    setContactUrl("");
    setPolicyUrl("");
    setEncryptionUrl("");
    setAcknowledgmentsUrl("");
    setHiringUrl("");
    setPreferredLanguages("en");
    setExpiryPreset("365");
    setCustomExpiry("");
    setContactType("email");
    setOutputMode("securityTxt");
    setIncludeCanonical(true);
    setIncludePolicy(true);
    setIncludePreferredLanguages(true);
    setIncludeCommentHeader(true);
    setWarnMissingPolicy(true);
    clearResult();
  };

  return (
    <ToolShell
      title="Security.txt Generator"
      description="Generate a security.txt file for vulnerability disclosure. Create Contact, Expires, Canonical, Policy, Encryption, Acknowledgments, Preferred-Languages, and Hiring fields."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Website and Contact
          </h3>

          <div className="mt-4 space-y-4">
            <InputField
              label="Domain or Website URL"
              value={domain}
              onChange={(value) => {
                setDomain(value);
                clearResult();
              }}
              placeholder="https://example.com"
            />

            <YoryantraSelect
              label="Contact Type"
              value={contactType}
              onChange={(value) => {
                setContactType(value as ContactType);
                clearResult();
              }}
              options={[
                { label: "Email contact", value: "email" },
                { label: "Contact page URL", value: "url" },
                { label: "Email and URL", value: "both" },
              ]}
            />

            {(contactType === "email" || contactType === "both") && (
              <InputField
                label="Security Email"
                value={contactEmail}
                onChange={(value) => {
                  setContactEmail(value);
                  clearResult();
                }}
                placeholder="security@example.com"
              />
            )}

            {(contactType === "url" || contactType === "both") && (
              <InputField
                label="Security Contact URL"
                value={contactUrl}
                onChange={(value) => {
                  setContactUrl(value);
                  clearResult();
                }}
                placeholder="https://example.com/security-contact"
              />
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Disclosure Details
          </h3>

          <div className="mt-4 space-y-4">
            <InputField
              label="Policy URL"
              value={policyUrl}
              onChange={(value) => {
                setPolicyUrl(value);
                clearResult();
              }}
              placeholder="https://example.com/security-policy"
            />

            <InputField
              label="Encryption Key URL"
              value={encryptionUrl}
              onChange={(value) => {
                setEncryptionUrl(value);
                clearResult();
              }}
              placeholder="https://example.com/pgp-key.txt"
            />

            <InputField
              label="Acknowledgments URL"
              value={acknowledgmentsUrl}
              onChange={(value) => {
                setAcknowledgmentsUrl(value);
                clearResult();
              }}
              placeholder="https://example.com/security/thanks"
            />

            <InputField
              label="Hiring URL"
              value={hiringUrl}
              onChange={(value) => {
                setHiringUrl(value);
                clearResult();
              }}
              placeholder="https://example.com/careers/security"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Expiry"
            value={expiryPreset}
            onChange={(value) => {
              setExpiryPreset(value as ExpiryPreset);
              clearResult();
            }}
            options={[
              { label: "30 days", value: "30" },
              { label: "90 days", value: "90" },
              { label: "180 days", value: "180" },
              { label: "365 days", value: "365" },
              { label: "Custom ISO date", value: "custom" },
            ]}
          />

          {expiryPreset === "custom" && (
            <InputField
              label="Custom Expiry"
              value={customExpiry}
              onChange={(value) => {
                setCustomExpiry(value);
                clearResult();
              }}
              placeholder="2027-06-01T00:00:00Z"
            />
          )}

          <InputField
            label="Preferred Languages"
            value={preferredLanguages}
            onChange={(value) => {
              setPreferredLanguages(value);
              clearResult();
            }}
            placeholder="en, hi"
          />

          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value) => {
              setOutputMode(value as OutputMode);
              clearResult();
            }}
            options={[
              { label: "security.txt", value: "securityTxt" },
              { label: "Signed template", value: "signedTemplate" },
              { label: "JSON", value: "json" },
              { label: "Markdown notes", value: "markdown" },
              { label: "Nginx location", value: "nginx" },
              { label: "Apache rewrite note", value: "apache" },
            ]}
          />

          <div className="md:col-span-2 space-y-3">
            <CheckboxRow checked={includeCanonical} label="Include Canonical field" onChange={(checked) => { setIncludeCanonical(checked); clearResult(); }} />
            <CheckboxRow checked={includePolicy} label="Include Policy field when available" onChange={(checked) => { setIncludePolicy(checked); clearResult(); }} />
            <CheckboxRow checked={includePreferredLanguages} label="Include Preferred-Languages field" onChange={(checked) => { setIncludePreferredLanguages(checked); clearResult(); }} />
            <CheckboxRow checked={includeCommentHeader} label="Include short comment header" onChange={(checked) => { setIncludeCommentHeader(checked); clearResult(); }} />
            <CheckboxRow checked={warnMissingPolicy} label="Warn when policy URL is missing" onChange={(checked) => { setWarnMissingPolicy(checked); clearResult(); }} />
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          The generated file is usually placed at <span className="font-mono">/.well-known/security.txt</span> on your domain.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generateSecurityTxt} className="yoryantra-btn">
          Generate Security.txt
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
          <SummaryCard label="Fields" value={result.fieldCount.toLocaleString()} />
          <SummaryCard label="Required" value={result.requiredFieldCount.toLocaleString()} />
          <SummaryCard label="Expires" value={result.expiryDate} />
          <SummaryCard label="Findings" value={result.issues.length.toLocaleString()} />
        </div>
      )}

      {result && result.issues.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">Security.txt findings</h3>

          <div className="mt-3 space-y-3">
            {result.issues.map((issue, index) => (
              <div key={`${issue.title}-${index}`}>
                <p className="text-sm font-semibold text-amber-900">{issue.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-amber-800">{issue.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900">Publishing guidance</h3>

          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-blue-900">{note.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-blue-800">{note.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Output</h3>

          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[360px] whitespace-pre-wrap break-words">
          {output || "Generated security.txt content will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Security.txt helps researchers contact you, but it is not a security control by itself. Make sure the contact inbox or form is monitored.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Creating a Security.txt File for Vulnerability Reports</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A security.txt file gives security researchers a clear way to report vulnerabilities. Instead of guessing who to contact, they can check a standard location on your website and find your preferred contact, policy, expiry date, and encryption details.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Security.txt Generator creates a clean file for <span className="font-mono">/.well-known/security.txt</span> with common fields such as Contact, Expires, Canonical, Policy, Encryption, Acknowledgments, Preferred-Languages, and Hiring.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Using the Security.txt Generator</h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter your domain or website URL.</li>
            <li>Add a security contact email, contact page, or both.</li>
            <li>Choose an expiry date and optional policy, encryption, acknowledgment, and hiring URLs.</li>
            <li>Copy the generated content.</li>
            <li>Publish it at <span className="font-mono">/.well-known/security.txt</span> and keep it updated.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Important Security.txt Fields</h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li><strong>Contact</strong> tells researchers where to send reports.</li>
            <li><strong>Expires</strong> tells readers when the file should be considered stale.</li>
            <li><strong>Canonical</strong> points to the official security.txt URL.</li>
            <li><strong>Policy</strong> links to vulnerability disclosure rules and scope.</li>
            <li><strong>Encryption</strong> points to a key for encrypted reports.</li>
            <li><strong>Acknowledgments</strong> links to a page recognizing valid reports.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example Security.txt Content</h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Contact: mailto:security@example.com
Expires: 2027-06-01T00:00:00Z
Canonical: https://example.com/.well-known/security.txt
Policy: https://example.com/security-policy
Preferred-Languages: en`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Keep Security.txt Practical</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A security.txt file is most useful when the contact actually works. Use an email inbox or form that someone checks, and link to a policy that explains what is in scope, what is out of scope, and what researchers should expect after submitting a report.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Review the file before the Expires date so researchers do not rely on stale information.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>

          <div className="mt-5 space-y-6">
            <Faq title="What is security.txt?">
              It is a standard text file that helps security researchers find the right contact and policy for vulnerability reports.
            </Faq>

            <Faq title="Where should I publish security.txt?">
              The common location is /.well-known/security.txt on your domain.
            </Faq>

            <Faq title="Is Expires required?">
              Yes, Expires is an important field because it tells readers when the file should be considered outdated.
            </Faq>

            <Faq title="Should I include a Policy URL?">
              Yes, if you have one. A policy page helps define scope, expectations, safe testing rules, and reporting process.
            </Faq>

            <Faq title="Is anything uploaded when I generate the file?">
              No. The file is generated directly in your browser.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/security-txt-generator" />
        </div>
      </section>
    </ToolShell>
  );
}

function InputField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
      />
    </div>
  );
}

function CheckboxRow({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[var(--light-gold)]"
      />
      {label}
    </label>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function Faq({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600 leading-relaxed">{children}</p>
    </div>
  );
}

function buildSecurityTxt(options: {
  domain: string;
  contactEmail: string;
  contactUrl: string;
  policyUrl: string;
  encryptionUrl: string;
  acknowledgmentsUrl: string;
  hiringUrl: string;
  preferredLanguages: string;
  expiryPreset: ExpiryPreset;
  customExpiry: string;
  contactType: ContactType;
  outputMode: OutputMode;
  includeCanonical: boolean;
  includePolicy: boolean;
  includePreferredLanguages: boolean;
  includeCommentHeader: boolean;
  warnMissingPolicy: boolean;
}): Result {
  const siteUrl = normalizeSiteUrl(options.domain);
  const canonicalUrl = `${siteUrl}/.well-known/security.txt`;
  const expiryDate = getExpiryDate(options.expiryPreset, options.customExpiry);
  const lines: string[] = [];

  if (options.includeCommentHeader) {
    lines.push("# Security contact information for this website");
    lines.push("# Generated by Yoryantra Security.txt Generator");
    lines.push("");
  }

  if (options.contactType === "email" || options.contactType === "both") {
    lines.push(`Contact: mailto:${options.contactEmail.trim()}`);
  }

  if (options.contactType === "url" || options.contactType === "both") {
    lines.push(`Contact: ${normalizeAbsoluteUrl(options.contactUrl.trim(), siteUrl)}`);
  }

  lines.push(`Expires: ${expiryDate}`);

  if (options.includeCanonical) {
    lines.push(`Canonical: ${canonicalUrl}`);
  }

  if (options.includePolicy && options.policyUrl.trim()) {
    lines.push(`Policy: ${normalizeAbsoluteUrl(options.policyUrl.trim(), siteUrl)}`);
  }

  if (options.encryptionUrl.trim()) {
    lines.push(`Encryption: ${normalizeAbsoluteUrl(options.encryptionUrl.trim(), siteUrl)}`);
  }

  if (options.acknowledgmentsUrl.trim()) {
    lines.push(`Acknowledgments: ${normalizeAbsoluteUrl(options.acknowledgmentsUrl.trim(), siteUrl)}`);
  }

  if (options.includePreferredLanguages && options.preferredLanguages.trim()) {
    lines.push(`Preferred-Languages: ${options.preferredLanguages.trim()}`);
  }

  if (options.hiringUrl.trim()) {
    lines.push(`Hiring: ${normalizeAbsoluteUrl(options.hiringUrl.trim(), siteUrl)}`);
  }

  const securityTxt = `${lines.join("\n")}\n`;
  const issues = buildIssues({
    contactEmail: options.contactEmail,
    contactUrl: options.contactUrl,
    contactType: options.contactType,
    policyUrl: options.policyUrl,
    encryptionUrl: options.encryptionUrl,
    expiryDate,
    canonicalUrl,
    warnMissingPolicy: options.warnMissingPolicy,
  });
  const fieldCount = lines.filter((line) => line.includes(":") && !line.startsWith("#")).length;
  const requiredFieldCount = lines.filter((line) => line.startsWith("Contact:") || line.startsWith("Expires:")).length;
  const base = {
    securityTxt,
    issues,
    expiryDate,
    fieldCount,
    requiredFieldCount,
    canonicalUrl,
  };
  const output = formatOutput(base, options.outputMode);

  return {
    ...base,
    output,
  };
}

function buildIssues(options: {
  contactEmail: string;
  contactUrl: string;
  contactType: ContactType;
  policyUrl: string;
  encryptionUrl: string;
  expiryDate: string;
  canonicalUrl: string;
  warnMissingPolicy: boolean;
}) {
  const issues: Issue[] = [];

  if ((options.contactType === "email" || options.contactType === "both") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(options.contactEmail.trim())) {
    issues.push({
      severity: "warning",
      title: "Email format should be reviewed",
      message: "The contact email does not look like a standard email address.",
    });
  }

  if ((options.contactType === "url" || options.contactType === "both") && !/^https?:\/\//i.test(options.contactUrl.trim())) {
    issues.push({
      severity: "warning",
      title: "Contact URL should be absolute",
      message: "Use a full HTTPS URL for contact pages.",
    });
  }

  if (options.warnMissingPolicy && !options.policyUrl.trim()) {
    issues.push({
      severity: "info",
      title: "Policy URL missing",
      message: "A disclosure policy helps researchers understand scope, safe testing rules, and expected response process.",
    });
  }

  if (!options.encryptionUrl.trim()) {
    issues.push({
      severity: "info",
      title: "Encryption field missing",
      message: "An encryption key URL is optional but useful if you want encrypted vulnerability reports.",
    });
  }

  const expiryTime = Date.parse(options.expiryDate);

  if (!Number.isFinite(expiryTime)) {
    issues.push({
      severity: "high",
      title: "Invalid expiry date",
      message: "Expires should be a valid ISO date/time.",
    });
  } else if (expiryTime <= Date.now()) {
    issues.push({
      severity: "high",
      title: "Expiry date is not in the future",
      message: "Security.txt should have an Expires value in the future.",
    });
  }

  if (!/^https:\/\//i.test(options.canonicalUrl)) {
    issues.push({
      severity: "warning",
      title: "Canonical should use HTTPS",
      message: "Publish security.txt over HTTPS when possible.",
    });
  }

  if (issues.length === 0) {
    issues.push({
      severity: "info",
      title: "Security.txt looks ready",
      message: "The generated file includes the main required fields and practical optional fields.",
    });
  }

  return issues;
}

function getExpiryDate(preset: ExpiryPreset, customExpiry: string) {
  if (preset === "custom") {
    const trimmed = customExpiry.trim();

    if (!trimmed) {
      throw new Error("Please enter a custom expiry date.");
    }

    return trimmed;
  }

  const days = Number(preset);
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString().replace(".000Z", "Z");
}

function normalizeSiteUrl(value: string) {
  const trimmed = value.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    return `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ""}`.replace(/\/$/, "");
  } catch {
    throw new Error("Please enter a valid domain or website URL.");
  }
}

function normalizeAbsoluteUrl(value: string, siteUrl: string) {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${siteUrl}${value}`;
  }

  return `${siteUrl}/${value}`;
}

function formatOutput(result: Omit<Result, "output">, mode: OutputMode) {
  if (mode === "json") {
    return JSON.stringify(result, null, 2);
  }

  if (mode === "markdown") {
    return [
      "# Security.txt",
      "",
      "```",
      result.securityTxt.trim(),
      "```",
      "",
      `Canonical: ${result.canonicalUrl}`,
      `Expires: ${result.expiryDate}`,
      "",
      "## Findings",
      ...result.issues.map((issue) => `- **${issue.title}:** ${issue.message}`),
    ].join("\n");
  }

  if (mode === "signedTemplate") {
    return [
      "-----BEGIN PGP SIGNED MESSAGE-----",
      "Hash: SHA256",
      "",
      result.securityTxt.trim(),
      "-----BEGIN PGP SIGNATURE-----",
      "",
      "[Add detached or cleartext signature here if your process requires signed security.txt]",
      "-----END PGP SIGNATURE-----",
      "",
    ].join("\n");
  }

  if (mode === "nginx") {
    return [
      "# Place the generated security.txt file at: /var/www/html/.well-known/security.txt",
      "location = /.well-known/security.txt {",
      "  default_type text/plain;",
      "  try_files $uri =404;",
      "}",
      "",
      result.securityTxt.trim(),
    ].join("\n");
  }

  if (mode === "apache") {
    return [
      "# Place the generated security.txt file at: /.well-known/security.txt",
      "# Apache usually serves this as a static text file.",
      "# Optional content type:",
      "AddType text/plain .txt",
      "",
      result.securityTxt.trim(),
    ].join("\n");
  }

  return result.securityTxt;
}

function getNotes(result: Result) {
  const notes: { title: string; message: string }[] = [];

  notes.push({
    title: "Publish at the well-known path",
    message: `The canonical location should be ${result.canonicalUrl}.`,
  });

  notes.push({
    title: "Monitor the contact channel",
    message: "A security.txt file only helps if the email inbox or contact form is actively monitored.",
  });

  notes.push({
    title: "Review before expiry",
    message: `This file expires on ${result.expiryDate}. Update it before that date.`,
  });

  return notes;
}
