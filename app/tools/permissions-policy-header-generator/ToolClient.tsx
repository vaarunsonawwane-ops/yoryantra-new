"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type PresetMode = "restrictive" | "baseline" | "media" | "custom";
type OutputMode = "header" | "nginx" | "apache" | "cloudflare" | "json";
type AllowMode = "none" | "self" | "all" | "custom";
type FeatureStatus = "standardized" | "proposed";

type FeatureSetting = {
  key: string;
  label: string;
  description: string;
  status: FeatureStatus;
  mode: AllowMode;
  origins: string;
  enabled: boolean;
};

type PolicyResult = {
  headerValue: string;
  fullHeader: string;
  output: string;
  directiveCount: number;
  blockedCount: number;
  customCount: number;
  broadCount: number;
  proposedCount: number;
  cautions: string[];
};

type PolicyNote = {
  title: string;
  message: string;
};

const baseFeatures: FeatureSetting[] = [
  {
    key: "camera",
    label: "Camera",
    description: "Limits which origins may request camera access.",
    status: "standardized",
    mode: "none",
    origins: "",
    enabled: true,
  },
  {
    key: "microphone",
    label: "Microphone",
    description: "Limits which origins may request microphone access.",
    status: "standardized",
    mode: "none",
    origins: "",
    enabled: true,
  },
  {
    key: "geolocation",
    label: "Geolocation",
    description: "Limits use of the browser geolocation feature.",
    status: "standardized",
    mode: "none",
    origins: "",
    enabled: true,
  },
  {
    key: "fullscreen",
    label: "Fullscreen",
    description: "Limits use of the Fullscreen API.",
    status: "standardized",
    mode: "self",
    origins: "",
    enabled: true,
  },
  {
    key: "payment",
    label: "Payment",
    description: "Limits use of payment-related browser capabilities.",
    status: "standardized",
    mode: "none",
    origins: "",
    enabled: true,
  },
  {
    key: "usb",
    label: "USB",
    description: "Limits access to USB devices through WebUSB.",
    status: "standardized",
    mode: "none",
    origins: "",
    enabled: true,
  },
  {
    key: "serial",
    label: "Serial",
    description: "Limits access to serial devices through Web Serial.",
    status: "standardized",
    mode: "none",
    origins: "",
    enabled: true,
  },
  {
    key: "bluetooth",
    label: "Bluetooth",
    description: "Limits Bluetooth access where the directive is supported.",
    status: "standardized",
    mode: "none",
    origins: "",
    enabled: true,
  },
  {
    key: "display-capture",
    label: "Display Capture",
    description: "Limits screen and window capture requests.",
    status: "standardized",
    mode: "none",
    origins: "",
    enabled: true,
  },
  {
    key: "web-share",
    label: "Web Share",
    description: "Limits calls to the Web Share API.",
    status: "standardized",
    mode: "self",
    origins: "",
    enabled: true,
  },
  {
    key: "accelerometer",
    label: "Accelerometer",
    description: "Limits accelerometer sensor access.",
    status: "standardized",
    mode: "none",
    origins: "",
    enabled: true,
  },
  {
    key: "gyroscope",
    label: "Gyroscope",
    description: "Limits gyroscope sensor access.",
    status: "standardized",
    mode: "none",
    origins: "",
    enabled: true,
  },
  {
    key: "magnetometer",
    label: "Magnetometer",
    description: "Limits magnetometer sensor access.",
    status: "standardized",
    mode: "none",
    origins: "",
    enabled: true,
  },
  {
    key: "autoplay",
    label: "Autoplay",
    description: "Limits autoplay of audio and video media.",
    status: "standardized",
    mode: "none",
    origins: "",
    enabled: true,
  },
  {
    key: "encrypted-media",
    label: "Encrypted Media",
    description: "Limits access to Encrypted Media Extensions.",
    status: "standardized",
    mode: "none",
    origins: "",
    enabled: true,
  },
  {
    key: "picture-in-picture",
    label: "Picture in Picture",
    description: "Limits picture-in-picture video behavior.",
    status: "standardized",
    mode: "self",
    origins: "",
    enabled: true,
  },
  {
    key: "publickey-credentials-get",
    label: "Passkey / WebAuthn Get",
    description: "Limits retrieval of public-key credentials through WebAuthn.",
    status: "standardized",
    mode: "self",
    origins: "",
    enabled: true,
  },
  {
    key: "screen-wake-lock",
    label: "Screen Wake Lock",
    description: "Limits requests that keep the screen awake.",
    status: "standardized",
    mode: "none",
    origins: "",
    enabled: true,
  },
  {
    key: "xr-spatial-tracking",
    label: "XR Spatial Tracking",
    description: "Limits spatial tracking used by WebXR experiences.",
    status: "standardized",
    mode: "none",
    origins: "",
    enabled: true,
  },
  {
    key: "clipboard-read",
    label: "Clipboard Read",
    description: "Limits clipboard reads; the directive remains proposed in the W3C feature list.",
    status: "proposed",
    mode: "none",
    origins: "",
    enabled: false,
  },
  {
    key: "clipboard-write",
    label: "Clipboard Write",
    description: "Limits clipboard writes; the directive remains proposed in the W3C feature list.",
    status: "proposed",
    mode: "self",
    origins: "",
    enabled: false,
  },
];

function cloneFeatures() {
  return baseFeatures.map((feature) => ({ ...feature }));
}

export default function ToolClient() {
  const [features, setFeatures] = useState<FeatureSetting[]>(() =>
    applyPresetToFeatures("baseline")
  );
  const [presetMode, setPresetMode] = useState<PresetMode>("baseline");
  const [outputMode, setOutputMode] = useState<OutputMode>("header");
  const [includeDisabled, setIncludeDisabled] = useState(false);
  const [result, setResult] = useState<PolicyResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getPolicyNotes(result) : []), [result]);

  const clearResult = () => {
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const updateFeature = (
    key: string,
    field: keyof FeatureSetting,
    value: string | boolean
  ) => {
    setFeatures((current) =>
      current.map((feature) =>
        feature.key === key ? { ...feature, [field]: value } : feature
      )
    );
    setPresetMode("custom");
    clearResult();
  };

  const applyPreset = (preset: PresetMode) => {
    setPresetMode(preset);
    if (preset !== "custom") {
      setFeatures(applyPresetToFeatures(preset));
    }
    clearResult();
  };

  const generatePolicy = () => {
    try {
      const nextResult = buildPermissionsPolicy({
        features,
        outputMode,
        includeDisabled,
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
          : "Unable to build this Permissions-Policy header."
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
      setError(
        "The Permissions-Policy output could not be copied. Select it and copy it manually."
      );
    }
  };

  const loadExample = () => {
    setPresetMode("custom");
    setFeatures(
      applyPresetToFeatures("baseline").map((feature) =>
        feature.key === "camera"
          ? {
              ...feature,
              mode: "custom" as AllowMode,
              origins: "self https://video.example.com",
            }
          : feature
      )
    );
    setOutputMode("header");
    setIncludeDisabled(false);
    clearResult();
  };

  const resetAll = () => {
    setFeatures(applyPresetToFeatures("baseline"));
    setPresetMode("baseline");
    setOutputMode("header");
    setIncludeDisabled(false);
    clearResult();
  };

  return (
    <ToolShell
      title="Permissions Policy Header Generator"
      description="Build Permissions-Policy directives for selected browser features with explicit allowlists and origin scope."
    >
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Policy setup</h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Starting point"
            value={presetMode}
            onChange={(value) => applyPreset(value as PresetMode)}
            options={[
              { label: "Restrictive — explicitly block selected features", value: "restrictive" },
              { label: "Baseline — same-origin for a few UI features", value: "baseline" },
              { label: "Media page — camera and microphone on same origin", value: "media" },
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

          <label className="flex cursor-pointer items-start gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={includeDisabled}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setIncludeDisabled(event.target.checked);
                clearResult();
              }}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--light-gold)]"
            />
            <span>
              Include omitted feature rows in JSON output
              <span className="mt-1 block font-normal leading-relaxed text-gray-500">
                Omitted features are not automatically blocked; their specification-defined default allowlist still matters.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">Feature directives</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Include a feature only when you want the response header to state an explicit rule for it. Custom allowlists accept <code className="font-mono">self</code> and exact HTTP(S) origins.
        </p>

        <div className="mt-5 overflow-visible rounded-xl border border-gray-200 bg-gray-50">
          <div className="hidden grid-cols-[92px_1fr_176px] gap-3 rounded-t-xl border-b border-gray-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 md:grid">
            <span>Include</span>
            <span>Feature</span>
            <span>Allowlist</span>
          </div>

          <div className="divide-y divide-gray-200">
            {features.map((feature) => (
              <div key={feature.key} className="px-4 py-3">
                <div className="grid gap-3 md:grid-cols-[92px_1fr_176px] md:items-center">
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
                    <input
                      type="checkbox"
                      checked={feature.enabled}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        updateFeature(feature.key, "enabled", event.target.checked)
                      }
                      className="h-4 w-4 shrink-0 accent-[var(--light-gold)]"
                    />
                    Include
                  </label>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="font-semibold text-gray-900">{feature.label}</p>
                      <code className="break-all text-xs text-gray-500">{feature.key}</code>
                      {feature.status === "proposed" && (
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                          Proposed
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm leading-relaxed text-gray-500">
                      {feature.description}
                    </p>
                  </div>

                  <CompactAllowSelect
                    value={feature.mode}
                    label={feature.label}
                    disabled={!feature.enabled}
                    onChange={(value) => updateFeature(feature.key, "mode", value)}
                  />
                </div>

                {feature.enabled && feature.mode === "custom" && (
                  <div className="mt-3 border-t border-gray-200 pt-3 md:ml-[105px]">
                    <label className="block text-sm font-medium text-gray-700">
                      Exact origins
                    </label>
                    <input
                      value={feature.origins}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        updateFeature(feature.key, "origins", event.target.value)
                      }
                      placeholder="self https://video.example.com"
                      className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
                    />
                    <p className="mt-2 text-xs leading-relaxed text-gray-500">
                      Separate entries with spaces. Paths, query strings, credentials, and wildcard hostnames are rejected because this field is for origins, not URLs.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generatePolicy} className="yoryantra-btn whitespace-nowrap">
          Build Policy
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
          <SummaryCard label="Directives" value={String(result.directiveCount)} />
          <SummaryCard label="Blocked" value={String(result.blockedCount)} />
          <SummaryCard label="Custom origin rules" value={String(result.customCount)} />
          <SummaryCard label="Broad rules" value={String(result.broadCount)} />
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
        <pre className="yoryantra-output min-h-[250px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "The Permissions-Policy output will appear here."}
        </pre>
      </div>

      <div className="mt-4 self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
        Policy construction happens in this browser. The feature choices and custom origins entered here are not sent anywhere by this page.
      </div>

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            A policy can block a feature; it cannot grant permission
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Permissions-Policy sits in front of browser capabilities such as camera, microphone, geolocation, fullscreen, and sensors. Allowing an origin in the header only makes that feature eligible under this policy. It does not bypass a user permission prompt, secure-context requirement, API requirement, or browser setting.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            That distinction matters when debugging. A page may be allowed by Permissions-Policy and still be denied by the user, blocked because the page is not in a secure context, or fail because that browser does not implement the API.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Omitted is not the same as blocked
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A directive such as <code className="font-mono">camera=()</code> explicitly disables camera for that response. Leaving <code className="font-mono">camera</code> out of the header does something different: the directive&apos;s default allowlist and normal browser rules still apply. This page therefore keeps “Include” separate from the allowlist choice instead of pretending an omitted row is denied.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            self, *, and exact origins describe different boundaries
          </h2>
          <div className="mt-4 grid items-start gap-4 md:grid-cols-3">
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="font-mono font-semibold text-gray-900">()</p>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">Explicitly allows no origin for that feature.</p>
            </div>
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="font-mono font-semibold text-gray-900">(self)</p>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">Allows the response&apos;s own origin, subject to the rest of the browser&apos;s checks.</p>
            </div>
            <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="font-mono font-semibold text-amber-900">*</p>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">Broadly allows the feature to origins covered by the wildcard. Use it only when that breadth is deliberate.</p>
            </div>
          </div>
          <p className="mt-4 leading-relaxed text-gray-600">
            A custom list can combine <code className="font-mono">self</code> with exact origins such as <code className="font-mono">https://video.example.com</code>. A URL path is not an origin, so entries such as <code className="font-mono">https://example.com/embed</code> are rejected instead of being silently rewritten.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Cross-origin iframes need both sides of the policy
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A response header can set the upper bound for a feature, but an embedded frame can also be constrained by its iframe <code className="font-mono">allow</code> attribute and by policy inheritance. If a cross-origin video frame needs camera access, adding its origin to the header is only one part of the setup. Check the iframe markup and the embedded document as well.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Clipboard directives still need compatibility testing
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            <code className="font-mono">clipboard-read</code> and <code className="font-mono">clipboard-write</code> are included as optional rows because they are implemented in some browsers, notably Chromium-based ones. The W3C feature list still marks them as proposed, so they start disabled here and are labelled rather than presented as universally standardized controls.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Keep an HTTP header on one physical line
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The generated header joins directives with commas on a single line. Pretty-printing a header by inserting raw newlines can turn one field into invalid or unintended HTTP syntax in a configuration file. Server snippets preserve the same one-line field value and only wrap it in the syntax expected by that server.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            The directive list changes as browser features evolve
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The authoritative Permissions Policy specification is maintained by the W3C Web Application Security Working Group. The separate feature registry is useful when you need to check whether a directive is standardized, proposed, or still tied to a particular implementation. Browser support should still be tested for the exact directives your application depends on.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            References: {" "}
            <a
              href="https://w3c.github.io/webappsec-permissions-policy/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-2"
            >
              W3C Permissions Policy
            </a>{" "}
            and {" "}
            <a
              href="https://github.com/w3c/webappsec-permissions-policy/blob/main/features.md"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-2"
            >
              W3C feature list
            </a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/permissions-policy-header-generator" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function CompactAllowSelect({
  value,
  label,
  disabled,
  onChange,
}: {
  value: AllowMode;
  label: string;
  disabled: boolean;
  onChange: (value: AllowMode) => void;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const options: Array<{ label: string; value: AllowMode }> = [
    { label: "None", value: "none" },
    { label: "Self", value: "self" },
    { label: "All", value: "all" },
    { label: "Custom origins", value: "custom" },
  ];
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );
  const selected = options[selectedIndex];

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const openMenu = () => {
    if (disabled) return;
    setActiveIndex(selectedIndex);
    setOpen(true);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openMenu();
        return;
      }
      const delta = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((current) => (current + delta + options.length) % options.length);
      return;
    }

    if ((event.key === "Enter" || event.key === " ") && open) {
      event.preventDefault();
      onChange(options[activeIndex].value);
      setOpen(false);
      return;
    }

    if ((event.key === "Enter" || event.key === " ") && !open) {
      event.preventDefault();
      openMenu();
    }
  };

  return (
    <div ref={wrapperRef} className="relative min-w-0">
      <button
        type="button"
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-gray-300 bg-white px-3 py-2 text-left text-sm text-gray-900 outline-none transition enabled:hover:border-gray-400 focus:border-transparent focus:ring-2 focus:ring-[var(--green)] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
        aria-label={`Allowlist for ${label}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{selected.label}</span>
        <span className="shrink-0 text-xs text-[var(--green)]">▾</span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={`Allowlist options for ${label}`}
          className="absolute right-0 z-30 mt-1 w-full min-w-[170px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`block min-h-10 w-full px-3 py-2 text-left text-sm transition ${
                option.value === value
                  ? "bg-[var(--green)]/10 font-semibold text-[var(--green)]"
                  : index === activeIndex
                    ? "bg-gray-50 text-gray-900"
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
    <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function applyPresetToFeatures(preset: Exclude<PresetMode, "custom">) {
  const features = cloneFeatures();

  return features.map((feature) => {
    if (feature.status === "proposed") {
      return { ...feature, enabled: false };
    }

    if (preset === "restrictive") {
      return { ...feature, enabled: true, mode: "none" as AllowMode, origins: "" };
    }

    if (preset === "media") {
      const sameOrigin = new Set([
        "camera",
        "microphone",
        "fullscreen",
        "autoplay",
        "picture-in-picture",
      ]);
      return {
        ...feature,
        enabled: true,
        mode: sameOrigin.has(feature.key) ? ("self" as AllowMode) : ("none" as AllowMode),
        origins: "",
      };
    }

    const selfFeatures = new Set([
      "fullscreen",
      "web-share",
      "picture-in-picture",
      "publickey-credentials-get",
    ]);
    return {
      ...feature,
      enabled: true,
      mode: selfFeatures.has(feature.key) ? ("self" as AllowMode) : ("none" as AllowMode),
      origins: "",
    };
  });
}

function buildPermissionsPolicy({
  features,
  outputMode,
  includeDisabled,
}: {
  features: FeatureSetting[];
  outputMode: OutputMode;
  includeDisabled: boolean;
}): PolicyResult {
  const selected = features.filter((feature) => feature.enabled);
  if (selected.length === 0) {
    throw new Error("Include at least one feature before building the policy.");
  }

  const cautions: string[] = [];
  const directives = selected.map((feature) => {
    const value = formatAllowList(feature);
    if (feature.mode === "all") {
      cautions.push(`${feature.label} is allowed with a wildcard.`);
    }
    if (feature.status === "proposed") {
      cautions.push(`${feature.label} uses a directive that is still listed as proposed by W3C.`);
    }
    return `${feature.key}=${value}`;
  });

  const headerValue = directives.join(", ");
  const fullHeader = `Permissions-Policy: ${headerValue}`;
  const directiveCount = selected.length;
  const blockedCount = selected.filter((feature) => feature.mode === "none").length;
  const customCount = selected.filter((feature) => feature.mode === "custom").length;
  const broadCount = selected.filter((feature) => feature.mode === "all").length;
  const proposedCount = selected.filter((feature) => feature.status === "proposed").length;
  const output = formatOutput({
    outputMode,
    headerValue,
    fullHeader,
    features: includeDisabled ? features : selected,
    directiveCount,
    blockedCount,
    customCount,
    broadCount,
    proposedCount,
    cautions,
  });

  return {
    headerValue,
    fullHeader,
    output,
    directiveCount,
    blockedCount,
    customCount,
    broadCount,
    proposedCount,
    cautions,
  };
}

function formatAllowList(feature: FeatureSetting) {
  if (feature.mode === "none") return "()";
  if (feature.mode === "self") return "(self)";
  if (feature.mode === "all") return "*";

  const origins = parseCustomAllowlist(feature.origins, feature.label);
  return `(${origins.map((origin) => (origin === "self" ? "self" : `"${origin}"`)).join(" ")})`;
}

function parseCustomAllowlist(value: string, featureLabel: string) {
  const raw = value
    .split(/\s+/)
    .map((entry) => entry.trim().replace(/^"|"$/g, ""))
    .filter(Boolean);

  if (raw.length === 0) {
    throw new Error(`${featureLabel}: enter at least one exact origin or self for the custom allowlist.`);
  }

  const normalized: string[] = [];
  raw.forEach((entry) => {
    if (entry.toLowerCase() === "self") {
      if (!normalized.includes("self")) normalized.push("self");
      return;
    }

    if (entry === "*") {
      throw new Error(`${featureLabel}: choose All instead of placing * inside a custom allowlist.`);
    }

    if (entry.includes("*")) {
      throw new Error(`${featureLabel}: wildcard hostnames are not accepted in the exact-origin field.`);
    }

    let url: URL;
    try {
      url = new URL(entry);
    } catch {
      throw new Error(`${featureLabel}: ${entry} is not a valid HTTP(S) origin.`);
    }

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new Error(`${featureLabel}: ${entry} must use http:// or https://.`);
    }

    if (url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
      throw new Error(`${featureLabel}: ${entry} contains more than an origin. Remove credentials, path, query, or fragment.`);
    }

    if (!normalized.includes(url.origin)) normalized.push(url.origin);
  });

  return normalized;
}

function formatOutput({
  outputMode,
  headerValue,
  fullHeader,
  features,
  directiveCount,
  blockedCount,
  customCount,
  broadCount,
  proposedCount,
  cautions,
}: {
  outputMode: OutputMode;
  headerValue: string;
  fullHeader: string;
  features: FeatureSetting[];
  directiveCount: number;
  blockedCount: number;
  customCount: number;
  broadCount: number;
  proposedCount: number;
  cautions: string[];
}) {
  if (outputMode === "json") {
    return JSON.stringify(
      {
        header: fullHeader,
        value: headerValue,
        directiveCount,
        blockedCount,
        customCount,
        broadCount,
        proposedCount,
        features,
        cautions,
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
      "Apply as a response-header rule on the responses that should carry this policy.",
    ].join("\n");
  }

  return fullHeader;
}

function getPolicyNotes(result: PolicyResult): PolicyNote[] {
  const notes: PolicyNote[] = [];

  if (result.broadCount > 0) {
    notes.push({
      title: "Wildcard access is broad",
      message: `${result.broadCount} directive${result.broadCount === 1 ? "" : "s"} use *. Confirm that cross-origin access is intentional rather than choosing the wildcard for convenience.`,
    });
  }

  if (result.customCount > 0) {
    notes.push({
      title: "Custom origins need iframe checks too",
      message: "An origin in the header can still be constrained by iframe allow attributes, policy inheritance, user permission, and API-specific browser requirements.",
    });
  }

  if (result.proposedCount > 0) {
    notes.push({
      title: "Proposed directives included",
      message: "Clipboard policy directives are implemented in some browsers but remain proposed in the W3C feature list. Test the exact browser set you support.",
    });
  }

  return notes;
}
