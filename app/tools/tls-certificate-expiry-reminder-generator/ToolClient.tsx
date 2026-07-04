"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "reminder" | "checklist" | "calendar" | "json" | "markdown" | "csv";
type Environment = "production" | "staging" | "development" | "internal" | "multiple";
type RenewalMethod = "automatic" | "manual" | "managed" | "unknown";
type Urgency = "healthy" | "watch" | "urgent" | "expired";

type ReminderItem = {
  label: string;
  date: string;
  daysBeforeExpiry: number;
  message: string;
};

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type Result = {
  domain: string;
  expiryDate: string;
  daysUntilExpiry: number;
  urgency: Urgency;
  reminders: ReminderItem[];
  checklist: string[];
  issues: Issue[];
  output: string;
};

const sampleDomain = "example.com";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function ToolClient() {
  const [domain, setDomain] = useState("");
  const [issuer, setIssuer] = useState("");
  const [owner, setOwner] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [environment, setEnvironment] = useState<Environment>("production");
  const [renewalMethod, setRenewalMethod] = useState<RenewalMethod>("automatic");
  const [outputMode, setOutputMode] = useState<OutputMode>("reminder");
  const [alertDays, setAlertDays] = useState("60, 30, 14, 7, 3, 1");
  const [includePostRenewalChecks, setIncludePostRenewalChecks] = useState(true);
  const [includeDnsChecks, setIncludeDnsChecks] = useState(true);
  const [includeMonitoringChecks, setIncludeMonitoringChecks] = useState(true);
  const [includeFallbackPlan, setIncludeFallbackPlan] = useState(true);
  const [warnShortWindow, setWarnShortWindow] = useState(true);
  const [result, setResult] = useState<Result | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getNotes(result, renewalMethod) : []), [result, renewalMethod]);

  const clearResult = () => {
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const generateReminder = () => {
    if (!domain.trim()) {
      setError("Please enter a domain or certificate name.");
      setResult(null);
      setOutput("");
      return;
    }

    if (!expiryDate.trim()) {
      setError("Please enter the certificate expiry date.");
      setResult(null);
      setOutput("");
      return;
    }

    try {
      const next = buildReminder({
        domain,
        issuer,
        owner,
        expiryDate,
        environment,
        renewalMethod,
        outputMode,
        alertDays,
        includePostRenewalChecks,
        includeDnsChecks,
        includeMonitoringChecks,
        includeFallbackPlan,
        warnShortWindow,
      });

      setResult(next);
      setOutput(next.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate certificate reminder.");
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
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + 64);

    setDomain(sampleDomain);
    setIssuer("Let's Encrypt");
    setOwner("Web / DevOps team");
    setExpiryDate(date.toISOString().slice(0, 10));
    setEnvironment("production");
    setRenewalMethod("automatic");
    setOutputMode("reminder");
    setAlertDays("60, 30, 14, 7, 3, 1");
    setIncludePostRenewalChecks(true);
    setIncludeDnsChecks(true);
    setIncludeMonitoringChecks(true);
    setIncludeFallbackPlan(true);
    setWarnShortWindow(true);
    clearResult();
  };

  const resetAll = () => {
    setDomain("");
    setIssuer("");
    setOwner("");
    setExpiryDate("");
    setEnvironment("production");
    setRenewalMethod("automatic");
    setOutputMode("reminder");
    setAlertDays("60, 30, 14, 7, 3, 1");
    setIncludePostRenewalChecks(true);
    setIncludeDnsChecks(true);
    setIncludeMonitoringChecks(true);
    setIncludeFallbackPlan(true);
    setWarnShortWindow(true);
    clearResult();
  };

  return (
    <ToolShell
      title="TLS Certificate Expiry Reminder Generator"
      description="Generate TLS certificate expiry reminders, SSL renewal checklists, calendar notes, and renewal action plans for domains, environments, issuers, and certificate owners."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-full rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Certificate Details
          </h3>

          <div className="mt-4 space-y-4">
            <InputField
              label="Domain or Certificate Name"
              value={domain}
              onChange={(value) => {
                setDomain(value);
                clearResult();
              }}
              placeholder="example.com"
            />

            <InputField
              label="Issuer"
              value={issuer}
              onChange={(value) => {
                setIssuer(value);
                clearResult();
              }}
              placeholder="Let's Encrypt, DigiCert, Cloudflare, AWS ACM..."
            />

            <InputField
              label="Owner or Team"
              value={owner}
              onChange={(value) => {
                setOwner(value);
                clearResult();
              }}
              placeholder="Web / DevOps team"
            />

            <DatePickerField
              label="Expiry Date"
              value={expiryDate}
              onChange={(value) => {
                setExpiryDate(value);
                clearResult();
              }}
            />
          </div>
        </div>

        <div className="h-full rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Renewal Context
          </h3>

          <div className="mt-4 space-y-4">
            <YoryantraSelect
              label="Environment"
              value={environment}
              onChange={(value) => {
                setEnvironment(value as Environment);
                clearResult();
              }}
              options={[
                { label: "Production", value: "production" },
                { label: "Staging", value: "staging" },
                { label: "Development", value: "development" },
                { label: "Internal service", value: "internal" },
                { label: "Multiple environments", value: "multiple" },
              ]}
            />

            <YoryantraSelect
              label="Renewal Method"
              value={renewalMethod}
              onChange={(value) => {
                setRenewalMethod(value as RenewalMethod);
                clearResult();
              }}
              options={[
                { label: "Automatic renewal", value: "automatic" },
                { label: "Manual renewal", value: "manual" },
                { label: "Managed by provider", value: "managed" },
                { label: "Unknown", value: "unknown" },
              ]}
            />

            <InputField
              label="Alert Days Before Expiry"
              value={alertDays}
              onChange={(value) => {
                setAlertDays(value);
                clearResult();
              }}
              placeholder="60, 30, 14, 7, 3, 1"
            />

            <YoryantraSelect
              label="Output"
              value={outputMode}
              onChange={(value) => {
                setOutputMode(value as OutputMode);
                clearResult();
              }}
              options={[
                { label: "Reminder plan", value: "reminder" },
                { label: "Renewal checklist", value: "checklist" },
                { label: "Calendar notes", value: "calendar" },
                { label: "JSON", value: "json" },
                { label: "Markdown", value: "markdown" },
                { label: "CSV", value: "csv" },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>

        <div className="mt-4 space-y-3">
          <CheckboxRow checked={includePostRenewalChecks} label="Include post-renewal browser and chain checks" onChange={(checked) => { setIncludePostRenewalChecks(checked); clearResult(); }} />
          <CheckboxRow checked={includeDnsChecks} label="Include DNS and load balancer checklist items" onChange={(checked) => { setIncludeDnsChecks(checked); clearResult(); }} />
          <CheckboxRow checked={includeMonitoringChecks} label="Include monitoring and alerting checks" onChange={(checked) => { setIncludeMonitoringChecks(checked); clearResult(); }} />
          <CheckboxRow checked={includeFallbackPlan} label="Include rollback and fallback plan reminders" onChange={(checked) => { setIncludeFallbackPlan(checked); clearResult(); }} />
          <CheckboxRow checked={warnShortWindow} label="Warn when renewal window is too short" onChange={(checked) => { setWarnShortWindow(checked); clearResult(); }} />
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          This tool does not scan live certificates or renew anything. Enter the expiry date from your certificate dashboard, hosting provider, browser certificate view, OpenSSL output, or certificate monitoring system.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generateReminder} className="yoryantra-btn">
          Generate Reminder Plan
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
          <SummaryCard label="Domain" value={result.domain} />
          <SummaryCard label="Days Left" value={String(result.daysUntilExpiry)} />
          <SummaryCard label="Urgency" value={result.urgency} />
          <SummaryCard label="Reminders" value={String(result.reminders.length)} />
        </div>
      )}

      {result && result.reminders.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Reminder Schedule
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Dates are generated from the expiry date and your alert-day settings.
          </p>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Reminder</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Days Before</th>
                  <th className="px-4 py-3 font-semibold">Message</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {result.reminders.map((item) => (
                  <tr key={`${item.label}-${item.date}`}>
                    <td className="px-4 py-3 font-semibold text-gray-800">{item.label}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{item.date}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{item.daysBeforeExpiry}</td>
                    <td className="px-4 py-3 text-gray-700">
                      <span className="block max-w-[360px] break-words">{item.message}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result && result.issues.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Certificate reminder findings
          </h3>

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
          <h3 className="text-sm font-semibold text-blue-900">
            Renewal guidance
          </h3>

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
          {output || "TLS certificate reminder output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        This generator does not renew certificates or verify live certificate status. Use it as a planning helper with your actual certificate monitoring and renewal workflow.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Planning TLS Certificate Renewals Before They Break Production
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Expired TLS certificates can break websites, APIs, dashboards, webhooks, mobile apps, and internal services. A simple reminder plan helps teams renew certificates before users see browser warnings or failed requests.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This TLS Certificate Expiry Reminder Generator creates reminder dates, renewal checklists, calendar notes, and action plans from a domain, expiry date, owner, environment, issuer, and renewal method. It is a planning helper, not a live certificate scanner.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Using the TLS Certificate Expiry Reminder Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter the domain or certificate name.</li>
            <li>Add issuer, owner, environment, and renewal method if known.</li>
            <li>Enter the certificate expiry date exactly as shown by your provider or certificate viewer.</li>
            <li>Choose reminder days and checklist options.</li>
            <li>Copy the reminder plan, checklist, calendar notes, JSON, Markdown, or CSV output.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            What to Check During Renewal
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Renew or replace the certificate before the final week.</li>
            <li>Confirm the full certificate chain, SAN names, issuer, and hostname match are served correctly.</li>
            <li>Check all load balancers, CDN edges, reverse proxies, API gateways, and origin servers.</li>
            <li>Verify HTTP to HTTPS redirects and HSTS behavior after renewal.</li>
            <li>Confirm monitoring alerts reset after the new certificate is active.</li>
            <li>Document owner, issuer, renewal method, and next expiry date.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Renewal Reminder
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Domain: example.com
Expiry: 2026-08-15
Reminder: renew certificate 30 days before expiry
Post-renewal: verify browser, chain, CDN, load balancer, and monitoring checks`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Automation Still Needs Monitoring
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Automatic renewal tools are helpful, but they can fail because of DNS changes, CAA restrictions, rate limits, account issues, expired tokens, firewall rules, changed validation methods, or broken deployment hooks.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Even if renewal is automated, keep certificate expiry alerts and a manual fallback plan ready.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <Faq title="What does a TLS certificate expiry reminder generator do?">
              It creates reminder dates and renewal checklist notes based on a certificate expiry date.
            </Faq>

            <Faq title="Does this tool scan my live certificate?">
              No. It uses the expiry date you enter and generates reminders locally in your browser. Use your hosting provider, certificate manager, browser certificate view, OpenSSL, or monitoring tool to confirm the live expiry date.
            </Faq>

            <Faq title="How early should I renew a TLS certificate?">
              Many teams start checking 30 to 60 days before expiry, with stronger alerts in the final two weeks.
            </Faq>

            <Faq title="Do automatic renewals still need reminders?">
              Yes. Automatic renewal can fail, so monitoring and fallback reminders are still useful.
            </Faq>

            <Faq title="Is anything uploaded when I generate reminders?">
              No. The reminder plan is generated directly in your browser.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/tls-certificate-expiry-reminder-generator" />
        </div>
      </section>
    </ToolShell>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-[54px] w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
      />
    </div>
  );
}

function DatePickerField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const selectedDate = parseInputDate(value);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [openAbove, setOpenAbove] = useState(false);
  const [pickerMode, setPickerMode] = useState<"days" | "months" | "years">("days");
  const [viewDate, setViewDate] = useState<Date>(() => selectedDate || new Date());

  const calendarDays = useMemo(() => buildCalendarDays(viewDate), [viewDate]);
  const yearOptions = useMemo(() => buildYearOptions(viewDate), [viewDate]);
  const displayValue = selectedDate ? formatDisplayDate(selectedDate) : "";

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target;

      if (target instanceof Node && wrapperRef.current && !wrapperRef.current.contains(target)) {
        setOpen(false);
        setPickerMode("days");
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [open]);

  const openPicker = () => {
    if (!open && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const estimatedPickerHeight = 380;
      const bottomSpace = window.innerHeight - rect.bottom;
      const topSpace = rect.top;

      setOpenAbove(bottomSpace < estimatedPickerHeight && topSpace > bottomSpace);
    }

    setOpen((current) => !current);
    setPickerMode("days");
  };

  const moveMonth = (offset: number) => {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
    setPickerMode("days");
  };

  const selectMonth = (monthIndex: number) => {
    setViewDate((current) => new Date(current.getFullYear(), monthIndex, 1));
    setPickerMode("days");
  };

  const selectYear = (year: number) => {
    setViewDate((current) => new Date(year, current.getMonth(), 1));
    setPickerMode("months");
  };

  const selectDate = (date: Date) => {
    onChange(formatDateInputValue(date));
    setViewDate(date);
    setOpen(false);
    setPickerMode("days");
  };

  const clearDate = () => {
    onChange("");
    setOpen(false);
    setPickerMode("days");
  };

  const selectToday = () => {
    const today = new Date();
    selectDate(today);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block mb-2 text-sm font-medium text-gray-700">
        {label}
      </label>

      <button
        type="button"
        onClick={openPicker}
        className="flex min-h-[54px] w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-4 py-3 text-left text-sm font-mono outline-none transition hover:border-gray-300 focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
      >
        <span className={displayValue ? "text-gray-900" : "text-gray-400"}>
          {displayValue || "dd-mm-yyyy"}
        </span>

        <span className="text-[var(--light-gold)]" aria-hidden="true">
          ▪
        </span>
      </button>

      {open && (
        <div
          className={`absolute left-0 z-30 w-[300px] rounded-2xl border border-gray-200 bg-white p-4 shadow-xl ${
            openAbove ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => moveMonth(-1)}
              className="px-1 py-1 text-xl leading-none text-[var(--light-gold)] transition hover:opacity-75"
              aria-label="Previous month"
            >
              ←
            </button>

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPickerMode((current) => current === "months" ? "days" : "months")}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  pickerMode === "months"
                    ? "bg-[var(--light-gold)]/15 text-[var(--light-gold)]"
                    : "text-gray-900 hover:bg-[var(--light-gold)]/10"
                }`}
              >
                {monthNames[viewDate.getMonth()]}
              </button>

              <button
                type="button"
                onClick={() => setPickerMode((current) => current === "years" ? "days" : "years")}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  pickerMode === "years"
                    ? "bg-[var(--light-gold)]/15 text-[var(--light-gold)]"
                    : "text-gray-900 hover:bg-[var(--light-gold)]/10"
                }`}
              >
                {viewDate.getFullYear()}
              </button>
            </div>

            <button
              type="button"
              onClick={() => moveMonth(1)}
              className="px-1 py-1 text-xl leading-none text-[var(--light-gold)] transition hover:opacity-75"
              aria-label="Next month"
            >
              →
            </button>
          </div>

          {pickerMode === "months" && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {monthNames.map((month, index) => {
                const isSelected = index === viewDate.getMonth();

                return (
                  <button
                    key={month}
                    type="button"
                    onClick={() => selectMonth(index)}
                    className={`rounded-lg px-2 py-2 text-sm transition ${
                      isSelected
                        ? "bg-[var(--light-gold)] font-semibold text-white shadow-sm"
                        : "text-gray-800 hover:bg-[var(--light-gold)]/10"
                    }`}
                  >
                    {month.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          )}

          {pickerMode === "years" && (
            <div className="mt-4 grid max-h-[260px] grid-cols-4 gap-2 overflow-y-auto pr-1">
              {yearOptions.map((year) => {
                const isSelected = year === viewDate.getFullYear();

                return (
                  <button
                    key={year}
                    type="button"
                    onClick={() => selectYear(year)}
                    className={`rounded-lg px-2 py-2 text-sm transition ${
                      isSelected
                        ? "bg-[var(--light-gold)] font-semibold text-white shadow-sm"
                        : "text-gray-800 hover:bg-[var(--light-gold)]/10"
                    }`}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          )}

          {pickerMode === "days" && (
            <>
              <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500">
                {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
                  <div key={day} className="py-1">
                    {day}
                  </div>
                ))}
              </div>

              <div className="mt-1 grid grid-cols-7 gap-1">
                {calendarDays.map((day) => {
                  const isSelected = selectedDate ? isSameDate(day.date, selectedDate) : false;
                  const isToday = isSameDate(day.date, new Date());

                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => selectDate(day.date)}
                      className={`h-9 rounded-lg text-sm transition ${
                        isSelected
                          ? "bg-[var(--light-gold)] font-semibold text-white shadow-sm"
                          : day.inCurrentMonth
                            ? "text-gray-800 hover:bg-[var(--light-gold)]/10 hover:text-gray-900"
                            : "text-gray-400 hover:bg-gray-50"
                      } ${isToday && !isSelected ? "ring-1 ring-[var(--light-gold)]" : ""}`}
                    >
                      {day.date.getDate()}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
            <button
              type="button"
              onClick={clearDate}
              className="text-sm font-semibold text-gray-900 transition hover:text-[var(--light-gold)]"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={selectToday}
              className="text-sm font-semibold text-gray-900 transition hover:text-[var(--light-gold)]"
            >
              Today
            </button>
          </div>
        </div>
      )}
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

function parseInputDate(value: string) {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

function isSameDate(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function buildYearOptions(viewDate: Date) {
  const currentYear = new Date().getFullYear();
  const selectedYear = viewDate.getFullYear();
  const start = Math.min(currentYear - 5, selectedYear - 5);
  const end = Math.max(currentYear + 15, selectedYear + 15);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function buildCalendarDays(viewDate: Date) {
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);

    return {
      date,
      key: formatDateInputValue(date),
      inCurrentMonth: date.getMonth() === viewDate.getMonth(),
    };
  });
}

function buildReminder(options: {
  domain: string;
  issuer: string;
  owner: string;
  expiryDate: string;
  environment: Environment;
  renewalMethod: RenewalMethod;
  outputMode: OutputMode;
  alertDays: string;
  includePostRenewalChecks: boolean;
  includeDnsChecks: boolean;
  includeMonitoringChecks: boolean;
  includeFallbackPlan: boolean;
  warnShortWindow: boolean;
}): Result {
  const expiry = parseDate(options.expiryDate);
  const today = startOfUtcDay(new Date());
  const daysUntilExpiry = differenceInDays(today, expiry);
  const urgency = getUrgency(daysUntilExpiry);
  const alertNumbers = parseAlertDays(options.alertDays);
  const reminders = buildReminders({
    domain: options.domain.trim(),
    expiry,
    alertNumbers,
    owner: options.owner.trim(),
    urgency,
  });
  const checklist = buildChecklist(options);
  const issues = buildIssues({
    daysUntilExpiry,
    urgency,
    renewalMethod: options.renewalMethod,
    environment: options.environment,
    alertNumbers,
    warnShortWindow: options.warnShortWindow,
  });
  const base = {
    domain: options.domain.trim(),
    expiryDate: formatDate(expiry),
    daysUntilExpiry,
    urgency,
    reminders,
    checklist,
    issues,
  };
  const output = formatOutput(base, options.outputMode, options);

  return {
    ...base,
    output,
  };
}

function parseDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Please enter the expiry date in YYYY-MM-DD format.");
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    !Number.isFinite(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error("Please enter a valid expiry date.");
  }

  return date;
}

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function differenceInDays(start: Date, end: Date) {
  const ms = end.getTime() - start.getTime();
  return Math.ceil(ms / 86400000);
}

function parseAlertDays(value: string) {
  const numbers = value
    .split(/[,\n]/)
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item) && item >= 0 && item <= 398);

  const unique = Array.from(new Set(numbers));

  if (unique.length === 0) {
    throw new Error("Enter at least one reminder day, such as 30 or 7.");
  }

  return unique.sort((a, b) => b - a);
}

function buildReminders(options: {
  domain: string;
  expiry: Date;
  alertNumbers: number[];
  owner: string;
  urgency: Urgency;
}) {
  return options.alertNumbers.map((days) => {
    const date = new Date(options.expiry);
    date.setUTCDate(date.getUTCDate() - days);

    const ownerText = options.owner ? ` Owner: ${options.owner}.` : "";
    const passed = startOfUtcDay(date).getTime() < startOfUtcDay(new Date()).getTime();

    return {
      label: `${days} day${days === 1 ? "" : "s"} before expiry`,
      date: formatDate(date),
      daysBeforeExpiry: days,
      message: passed
        ? `${options.domain} TLS certificate reminder for ${days} day${days === 1 ? "" : "s"} before expiry has already passed.${ownerText}`
        : `${options.domain} TLS certificate expires in ${days} day${days === 1 ? "" : "s"}.${ownerText}`,
    };
  });
}

function buildChecklist(options: {
  domain: string;
  issuer: string;
  owner: string;
  environment: Environment;
  renewalMethod: RenewalMethod;
  includePostRenewalChecks: boolean;
  includeDnsChecks: boolean;
  includeMonitoringChecks: boolean;
  includeFallbackPlan: boolean;
}) {
  const checklist: string[] = [];

  checklist.push(`Confirm current certificate details for ${options.domain.trim()}.`);

  if (options.issuer.trim()) {
    checklist.push(`Verify issuer account or provider access: ${options.issuer.trim()}.`);
  } else {
    checklist.push("Identify certificate issuer or provider account.");
  }

  if (options.owner.trim()) {
    checklist.push(`Confirm responsible owner/team: ${options.owner.trim()}.`);
  } else {
    checklist.push("Assign a certificate owner or responsible team.");
  }

  if (options.renewalMethod === "automatic") {
    checklist.push("Check automatic renewal job, ACME or provider validation method, and deployment hook.");
  } else if (options.renewalMethod === "manual") {
    checklist.push("Schedule manual renewal and deployment before the final week.");
  } else if (options.renewalMethod === "managed") {
    checklist.push("Confirm managed provider renewal status and support escalation path.");
  } else {
    checklist.push("Identify whether renewal is automatic, manual, or provider-managed.");
  }

  if (options.environment === "production" || options.environment === "multiple") {
    checklist.push("Prioritize production endpoint testing after renewal.");
  }

  if (options.includeDnsChecks) {
    checklist.push("Verify DNS validation records, CAA records, CDN settings, API gateways, and load balancer certificate attachments.");
  }

  if (options.includePostRenewalChecks) {
    checklist.push("After renewal, verify browser lock icon, hostname match, certificate chain, SAN names, issuer, expiry date, and HTTPS redirect behavior.");
  }

  if (options.includeMonitoringChecks) {
    checklist.push("Confirm monitoring alerts, uptime checks, and certificate expiry dashboards show the new expiry date.");
  }

  if (options.includeFallbackPlan) {
    checklist.push("Keep rollback notes, provider login access, and emergency contact path ready before the final expiry window.");
  }

  checklist.push("Document the new expiry date and create the next reminder cycle.");

  return checklist;
}

function buildIssues(options: {
  daysUntilExpiry: number;
  urgency: Urgency;
  renewalMethod: RenewalMethod;
  environment: Environment;
  alertNumbers: number[];
  warnShortWindow: boolean;
}) {
  const issues: Issue[] = [];

  if (options.urgency === "expired") {
    issues.push({
      severity: "high",
      title: "Certificate is already expired",
      message: "Renew or replace this certificate immediately and check affected services.",
    });
  } else if (options.urgency === "urgent") {
    issues.push({
      severity: "high",
      title: "Certificate expiry is urgent",
      message: "There is very little time left before expiry. Prioritize renewal and production verification.",
    });
  } else if (options.urgency === "watch") {
    issues.push({
      severity: "warning",
      title: "Renewal window is active",
      message: "The certificate is approaching expiry. Confirm renewal ownership and validation path now.",
    });
  }

  if (options.warnShortWindow && options.daysUntilExpiry <= 14 && options.daysUntilExpiry >= 0) {
    issues.push({
      severity: "warning",
      title: "Short renewal window",
      message: "Renewal should not wait until the last few days, especially for production or manually managed certificates.",
    });
  }

  if (options.renewalMethod === "unknown") {
    issues.push({
      severity: "warning",
      title: "Renewal method unknown",
      message: "Unknown renewal ownership is a common reason certificates expire unexpectedly.",
    });
  }

  if ((options.environment === "production" || options.environment === "multiple") && options.alertNumbers.every((day) => day < 30)) {
    issues.push({
      severity: "info",
      title: "Add earlier production reminders",
      message: "Production certificates are safer with reminders at least 30 to 60 days before expiry.",
    });
  }

  if (options.daysUntilExpiry >= 0 && options.alertNumbers.some((day) => day > options.daysUntilExpiry)) {
    issues.push({
      severity: "info",
      title: "Some reminder dates have already passed",
      message: "One or more selected reminder windows are earlier than today. Keep them for records or remove them from the active calendar notes.",
    });
  }

  if (options.alertNumbers.some((day) => day === 0)) {
    issues.push({
      severity: "warning",
      title: "Expiry-day reminder included",
      message: "A reminder on the expiry day is a last safety net, not a renewal plan. Keep earlier reminders too.",
    });
  }

  if (issues.length === 0) {
    issues.push({
      severity: "info",
      title: "Reminder plan looks healthy",
      message: "The expiry date and reminder schedule leave enough room for normal renewal work.",
    });
  }

  return issues;
}

function getUrgency(days: number): Urgency {
  if (days < 0) return "expired";
  if (days <= 7) return "urgent";
  if (days <= 30) return "watch";
  return "healthy";
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatOutput(
  result: Omit<Result, "output">,
  mode: OutputMode,
  options: {
    issuer: string;
    owner: string;
    environment: Environment;
    renewalMethod: RenewalMethod;
  }
) {
  if (mode === "json") {
    return JSON.stringify(result, null, 2);
  }

  if (mode === "csv") {
    const rows = [
      ["label", "date", "daysBeforeExpiry", "message"],
      ...result.reminders.map((item) => [item.label, item.date, String(item.daysBeforeExpiry), item.message]),
    ];

    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }

  if (mode === "markdown") {
    return [
      `# TLS Certificate Renewal Plan: ${result.domain}`,
      "",
      `- Expiry date: ${result.expiryDate}`,
      `- Days until expiry: ${result.daysUntilExpiry}`,
      `- Urgency: ${result.urgency}`,
      `- Issuer: ${options.issuer.trim() || "not specified"}`,
      `- Owner: ${options.owner.trim() || "not specified"}`,
      `- Environment: ${options.environment}`,
      `- Renewal method: ${options.renewalMethod}`,
      "",
      "## Reminder schedule",
      ...result.reminders.map((item) => `- ${item.date}: ${item.message}`),
      "",
      "## Checklist",
      ...result.checklist.map((item) => `- [ ] ${item}`),
      "",
      "## Findings",
      ...result.issues.map((issue) => `- **${issue.title}:** ${issue.message}`),
    ].join("\n");
  }

  if (mode === "calendar") {
    return [
      `Calendar notes for ${result.domain}`,
      "----------------------------",
      ...result.reminders.map((item) => `${item.date} - ${item.label}: ${item.message}`),
    ].join("\n");
  }

  if (mode === "checklist") {
    return [
      `TLS Renewal Checklist: ${result.domain}`,
      "----------------------",
      `Expiry: ${result.expiryDate}`,
      `Urgency: ${result.urgency}`,
      "",
      ...result.checklist.map((item) => `- [ ] ${item}`),
    ].join("\n");
  }

  return [
    `TLS Certificate Expiry Reminder: ${result.domain}`,
    "--------------------------------",
    `Expiry date: ${result.expiryDate}`,
    `Days until expiry: ${result.daysUntilExpiry}`,
    `Urgency: ${result.urgency}`,
    `Issuer: ${options.issuer.trim() || "not specified"}`,
    `Owner: ${options.owner.trim() || "not specified"}`,
    `Environment: ${options.environment}`,
    `Renewal method: ${options.renewalMethod}`,
    "",
    "Reminder schedule:",
    ...result.reminders.map((item) => `- ${item.date} (${item.label}): ${item.message}`),
    "",
    "Checklist:",
    ...result.checklist.map((item) => `- ${item}`),
    "",
    "Findings:",
    ...result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
  ].join("\n");
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function getNotes(result: Result, renewalMethod: RenewalMethod) {
  const notes: { title: string; message: string }[] = [];

  if (result.urgency === "urgent" || result.urgency === "expired") {
    notes.push({
      title: "Act immediately",
      message: "Do not wait for the next normal maintenance window if the certificate is already expired or close to expiry.",
    });
  }

  if (renewalMethod === "automatic") {
    notes.push({
      title: "Verify automation, not just expiry date",
      message: "Automatic renewal can still fail. Confirm validation, deployment hooks, and monitoring alerts.",
    });
  }

  notes.push({
    title: "Update the next cycle",
    message: "After renewal, record the new expiry date and create a new reminder schedule.",
  });

  return notes;
}
