"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type PresetMode = "strict" | "balanced" | "media" | "custom";
type OutputMode = "header" | "nginx" | "apache" | "cloudflare" | "json";
type AllowMode = "none" | "self" | "all" | "custom";

type FeatureSetting = {
  key: string;
  label: string;
  description: string;
  mode: AllowMode;
  origins: string;
  enabled: boolean;
};

type PolicyResult = {
  headerValue: string;
  fullHeader: string;
  output: string;
  enabledCount: number;
  blockedCount: number;
  customCount: number;
  warnings: string[];
};

type PolicyNote = {
  title: string;
  message: string;
};

const defaultFeatures: FeatureSetting[] = [
  {
    key: "camera",
    label: "Camera",
    description: "Controls access to camera devices.",
    mode: "none",
    origins: "",
    enabled: true,
  },
  {
    key: "microphone",
    label: "Microphone",
    description: "Controls access to microphone devices.",
    mode: "none",
    origins: "",
    enabled: true,
  },
  {
    key: "geolocation",
    label: "Geolocation",
    description: "Controls browser location access.",
    mode: "none",
    origins: "",
    enabled: true,
  },
  {
    key: "fullscreen",
    label: "Fullscreen",
    description: "Controls fullscreen API access.",
    mode: "self",
    origins: "",
    enabled: true,
  },
  {
    key: "payment",
    label: "Payment",
    description: "Controls Payment Request API access.",
    mode: "none",
    origins: "",
    enabled: true,
  },
  {
    key: "usb",
    label: "USB",
    description: "Controls WebUSB access.",
    mode: "none",
    origins: "",
    enabled: true,
  },
  {
    key: "serial",
    label: "Serial",
    description: "Controls Web Serial API access.",
    mode: "none",
    origins: "",
    enabled: true,
  },
  {
    key: "bluetooth",
    label: "Bluetooth",
    description: "Controls Web Bluetooth access where supported.",
    mode: "none",
    origins: "",
    enabled: true,
  },
  {
    key: "clipboard-read",
    label: "Clipboard Read",
    description: "Controls reading from the clipboard.",
    mode: "none",
    origins: "",
    enabled: true,
  },
  {
    key: "clipboard-write",
    label: "Clipboard Write",
    description: "Controls writing to the clipboard.",
    mode: "self",
    origins: "",
    enabled: true,
  },
  {
    key: "display-capture",
    label: "Display Capture",
    description: "Controls screen sharing / display capture.",
    mode: "none",
    origins: "",
    enabled: true,
  },
  {
    key: "web-share",
    label: "Web Share",
    description: "Controls Web Share API access.",
    mode: "self",
    origins: "",
    enabled: true,
  },
  {
    key: "accelerometer",
    label: "Accelerometer",
    description: "Controls accelerometer sensor access.",
    mode: "none",
    origins: "",
    enabled: true,
  },
  {
    key: "gyroscope",
    label: "Gyroscope",
    description: "Controls gyroscope sensor access.",
    mode: "none",
    origins: "",
    enabled: true,
  },
  {
    key: "magnetometer",
    label: "Magnetometer",
    description: "Controls magnetometer sensor access.",
    mode: "none",
    origins: "",
    enabled: true,
  },
];

export default function ToolClient() {
  const [features, setFeatures] = useState<FeatureSetting[]>(defaultFeatures);
  const [presetMode, setPresetMode] = useState<PresetMode>("balanced");
  const [outputMode, setOutputMode] = useState<OutputMode>("header");
  const [includeDisabled, setIncludeDisabled] = useState(false);
  const [oneDirectivePerLine, setOneDirectivePerLine] = useState(false);
  const [result, setResult] = useState<PolicyResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getPolicyNotes(result) : []), [result]);

  const updateFeature = (
    key: string,
    field: keyof FeatureSetting,
    value: string | boolean
  ) => {
    setFeatures((current) =>
      current.map((feature) =>
        feature.key === key
          ? {
              ...feature,
              [field]: value,
            }
          : feature
      )
    );
    setPresetMode("custom");
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const applyPreset = (preset: PresetMode) => {
    setPresetMode(preset);

    if (preset === "strict") {
      setFeatures(
        defaultFeatures.map((feature) => ({
          ...feature,
          enabled: true,
          mode: "none",
          origins: "",
        }))
      );
    }

    if (preset === "balanced") {
      setFeatures(
        defaultFeatures.map((feature) => ({
          ...feature,
          enabled: true,
          mode:
            feature.key === "fullscreen" ||
            feature.key === "clipboard-write" ||
            feature.key === "web-share"
              ? "self"
              : "none",
          origins: "",
        }))
      );
    }

    if (preset === "media") {
      setFeatures(
        defaultFeatures.map((feature) => ({
          ...feature,
          enabled: true,
          mode:
            feature.key === "camera" ||
            feature.key === "microphone" ||
            feature.key === "fullscreen" ||
            feature.key === "clipboard-write"
              ? "self"
              : "none",
          origins: "",
        }))
      );
    }

    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const generatePolicy = () => {
    try {
      const nextResult = buildPermissionsPolicy({
        features,
        outputMode,
        includeDisabled,
        oneDirectivePerLine,
      });

      setResult(nextResult);
      setOutput(nextResult.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate this Permissions-Policy header."
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
    applyPreset("balanced");
    setOutputMode("header");
    setIncludeDisabled(false);
    setOneDirectivePerLine(false);
  };

  const resetAll = () => {
    setFeatures(defaultFeatures);
    setPresetMode("balanced");
    setOutputMode("header");
    setIncludeDisabled(false);
    setOneDirectivePerLine(false);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="Permissions Policy Header Generator"
      description="Generate Permissions-Policy headers for browser features like camera, microphone, geolocation, fullscreen, payment, USB, clipboard, and more directly in your browser."
    >
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Header Settings
        </h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Preset"
            value={presetMode}
            onChange={(value) => applyPreset(value as PresetMode)}
            options={[
              { label: "Strict - block most features", value: "strict" },
              { label: "Balanced - allow common safe features", value: "balanced" },
              { label: "Media app - allow camera and microphone", value: "media" },
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

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={includeDisabled}
              onChange={(event) => {
                setIncludeDisabled(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Include disabled feature rows in JSON output
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={oneDirectivePerLine}
              onChange={(event) => {
                setOneDirectivePerLine(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Put each directive on a new line
          </label>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Permissions-Policy controls which browser features are allowed on your
          page and in embedded frames.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Browser Features
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          Choose which features to include and how each feature should be allowed.
          Use custom origins only when a trusted third-party origin needs access.
        </p>

        <div className="mt-5 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
          <div className="hidden grid-cols-[96px_1fr_170px] gap-3 border-b border-gray-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 md:grid">
            <span>Include</span>
            <span>Feature</span>
            <span>Allow</span>
          </div>

          <div className="divide-y divide-gray-200">
            {features.map((feature) => (
              <div key={feature.key} className="px-4 py-3">
                <div className="grid gap-3 md:grid-cols-[96px_1fr_170px] md:items-center">
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
                    <input
                      type="checkbox"
                      checked={feature.enabled}
                      onChange={(event) =>
                        updateFeature(feature.key, "enabled", event.target.checked)
                      }
                      className="h-4 w-4 accent-[var(--light-gold)]"
                    />

                    Include
                  </label>

                  <div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="font-semibold text-gray-900">
                        {feature.label}
                      </p>

                      <p className="font-mono text-xs text-gray-500">
                        {feature.key}
                      </p>
                    </div>

                    <p className="mt-0.5 text-sm leading-relaxed text-gray-500">
                      {feature.description}
                    </p>
                  </div>

                  <CompactAllowSelect
                    value={feature.mode}
                    label={feature.label}
                    onChange={(value) =>
                      updateFeature(feature.key, "mode", value)
                    }
                  />
                </div>

                {feature.mode === "custom" && (
                  <div className="mt-3 border-t border-gray-200 pt-3 md:ml-[109px]">
                    <label className="block text-sm font-medium text-gray-700">
                      Allowed Origins
                    </label>

                    <input
                      value={feature.origins}
                      onChange={(event) =>
                        updateFeature(feature.key, "origins", event.target.value)
                      }
                      placeholder="https://example.com https://cdn.example.com"
                      className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
                    />

                    <p className="mt-2 text-xs leading-relaxed text-gray-500">
                      Separate origins with spaces. Example: https://example.com
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generatePolicy} className="yoryantra-btn">
          Generate Header
        </button>

        <button onClick={copyOutput} className="yoryantra-btn" disabled={!output}>
          {copied ? "Copied" : "Copy Output"}
        </button>

        <button onClick={loadExample} className="yoryantra-btn-outline">
          Load Balanced Example
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
          <SummaryCard label="Included" value={result.enabledCount.toLocaleString()} />
          <SummaryCard label="Blocked" value={result.blockedCount.toLocaleString()} />
          <SummaryCard label="Custom" value={result.customCount.toLocaleString()} />
          <SummaryCard label="Warnings" value={result.warnings.length.toLocaleString()} />
        </div>
      )}

      {result && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Generated Header
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Copy this header into your web server, CDN, reverse proxy, or hosting
            response header settings.
          </p>

          <pre className="mt-4 overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm font-mono text-gray-800 whitespace-pre-wrap break-words">
            {result.fullHeader}
          </pre>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Permissions Policy notes
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

        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">
          {output || "Generated Permissions-Policy output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Permissions-Policy generation happens directly in your browser. Your
        settings are not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Generating Permissions-Policy Headers
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Permissions-Policy is a browser security header that controls access
            to powerful browser features. It can block or limit APIs such as
            camera, microphone, geolocation, payment, USB, clipboard, fullscreen,
            display capture, and sensors.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Permissions Policy Header Generator helps you build a clear
            header without writing every directive by hand. You can start with a
            strict, balanced, or media-friendly preset, then adjust each feature
            based on what your site actually needs.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Creating a Browser Feature Policy Header
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Choose a preset or start editing features manually.</li>
            <li>Set each feature to none, self, all, or custom origins.</li>
            <li>Generate the Permissions-Policy header.</li>
            <li>Review warnings for broad or custom access.</li>
            <li>Copy the header for your server, CDN, or hosting provider.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Permissions Policy Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Blocking camera and microphone on pages that do not need them.</li>
            <li>Disabling geolocation for privacy-sensitive pages.</li>
            <li>Allowing fullscreen only for the same origin.</li>
            <li>Limiting payment, USB, serial, and Bluetooth APIs.</li>
            <li>Creating safer defaults for embedded frames.</li>
            <li>Preparing a modern browser security header for a website.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Permissions-Policy Header
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Permissions-Policy: camera=(), microphone=(), geolocation=(), fullscreen=(self)`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Only Allow Features You Really Need
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A good Permissions-Policy header is usually restrictive. If your page
            does not use camera, microphone, USB, payment, or geolocation, it is
            safer to block those features instead of leaving access open.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Some features may behave differently across browsers. Test the final
            header on the pages that use browser APIs, especially if your site
            embeds third-party frames or media tools.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is a Permissions-Policy header?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It is a browser response header that controls which browser
                features a page or embedded frame is allowed to use.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is Permissions-Policy the same as Feature-Policy?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Permissions-Policy is the newer name and format. Feature-Policy
                was the older version used by some browsers in the past.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What does camera=() mean?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It means camera access is disabled for the page and its allowed
                contexts.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What does fullscreen=(self) mean?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It allows fullscreen only for the same origin.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is anything uploaded when I generate the header?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The header is generated directly in your browser.
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

            <Link href="/tools/hsts-header-generator" className="yoryantra-btn-outline">
              HSTS Header Generator
            </Link>

            <Link href="/tools/csp-generator" className="yoryantra-btn-outline">
              CSP Generator
            </Link>

            <Link href="/tools/cookie-security-checker" className="yoryantra-btn-outline">
              Cookie Security Checker
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function CompactAllowSelect({
  value,
  label,
  onChange,
}: {
  value: AllowMode;
  label: string;
  onChange: (value: AllowMode) => void;
}) {
  const [open, setOpen] = useState(false);
  const options: Array<{ label: string; value: AllowMode }> = [
    { label: "None", value: "none" },
    { label: "Self", value: "self" },
    { label: "All", value: "all" },
    { label: "Custom origins", value: "custom" },
  ];
  const selected = options.find((option) => option.value === value) || options[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-3 py-2 text-left text-sm text-gray-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        aria-label={`Allow setting for ${label}`}
        aria-expanded={open}
      >
        <span>{selected.label}</span>
        <span className="ml-3 text-xs text-gray-500">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`block w-full px-3 py-2 text-left text-sm transition ${
                option.value === value
                  ? "bg-[var(--green)]/10 font-medium text-[var(--green)]"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
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

function buildPermissionsPolicy({
  features,
  outputMode,
  includeDisabled,
  oneDirectivePerLine,
}: {
  features: FeatureSetting[];
  outputMode: OutputMode;
  includeDisabled: boolean;
  oneDirectivePerLine: boolean;
}): PolicyResult {
  const selected = features.filter((feature) => feature.enabled);
  const warnings: string[] = [];

  if (selected.length === 0) {
    throw new Error("Select at least one browser feature to include.");
  }

  const directives = selected.map((feature) => {
    const value = formatAllowList(feature);

    if (feature.mode === "all") {
      warnings.push(`${feature.label} is allowed for all origins.`);
    }

    if (feature.mode === "custom" && !feature.origins.trim()) {
      warnings.push(`${feature.label} uses custom origins but no origin was entered.`);
    }

    return `${feature.key}=${value}`;
  });

  const separator = oneDirectivePerLine ? ",\n  " : ", ";
  const headerValue = directives.join(separator);
  const fullHeader = oneDirectivePerLine
    ? `Permissions-Policy: ${headerValue}`
    : `Permissions-Policy: ${headerValue}`;
  const enabledCount = selected.length;
  const blockedCount = selected.filter((feature) => feature.mode === "none").length;
  const customCount = selected.filter((feature) => feature.mode === "custom").length;
  const output = formatOutput({
    outputMode,
    headerValue,
    fullHeader,
    features: includeDisabled ? features : selected,
    enabledCount,
    blockedCount,
    customCount,
    warnings,
  });

  return {
    headerValue,
    fullHeader,
    output,
    enabledCount,
    blockedCount,
    customCount,
    warnings,
  };
}

function formatAllowList(feature: FeatureSetting) {
  if (feature.mode === "none") {
    return "()";
  }

  if (feature.mode === "self") {
    return "(self)";
  }

  if (feature.mode === "all") {
    return "(*)";
  }

  const origins = feature.origins
    .split(/\s+/)
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => {
      if (origin === "self" || origin === "*") {
        return origin;
      }

      return `"${origin}"`;
    });

  return origins.length > 0 ? `(${origins.join(" ")})` : "()";
}

function formatOutput({
  outputMode,
  headerValue,
  fullHeader,
  features,
  enabledCount,
  blockedCount,
  customCount,
  warnings,
}: {
  outputMode: OutputMode;
  headerValue: string;
  fullHeader: string;
  features: FeatureSetting[];
  enabledCount: number;
  blockedCount: number;
  customCount: number;
  warnings: string[];
}) {
  if (outputMode === "json") {
    return JSON.stringify(
      {
        header: fullHeader,
        value: headerValue,
        enabledCount,
        blockedCount,
        customCount,
        features,
        warnings,
      },
      null,
      2
    );
  }

  if (outputMode === "nginx") {
    return `add_header Permissions-Policy '${headerValue}' always;`;
  }

  if (outputMode === "apache") {
    return `Header always set Permissions-Policy "${headerValue.replace(/"/g, '\\"')}"`;
  }

  if (outputMode === "cloudflare") {
    return [
      "Header name: Permissions-Policy",
      `Header value: ${headerValue}`,
      "",
      "Apply this as a response header rule on pages where these browser feature limits should apply.",
    ].join("\n");
  }

  return fullHeader;
}

function getPolicyNotes(result: PolicyResult): PolicyNote[] {
  const notes: PolicyNote[] = [];

  if (result.warnings.length > 0) {
    notes.push({
      title: "Review broad access",
      message: result.warnings.join(" "),
    });
  }

  if (result.blockedCount >= 8) {
    notes.push({
      title: "Restrictive policy",
      message:
        "Many browser features are blocked. This is usually good for pages that do not need powerful browser APIs.",
    });
  }

  if (result.customCount > 0) {
    notes.push({
      title: "Custom origins used",
      message:
        "Custom origins should be exact trusted origins. Review them before deploying the header.",
    });
  }

  return notes;
}
