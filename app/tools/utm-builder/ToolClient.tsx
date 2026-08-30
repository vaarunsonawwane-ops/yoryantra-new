"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type CampaignFields = {
  source: string;
  medium: string;
  campaign: string;
  id: string;
  sourcePlatform: string;
  term: string;
  content: string;
  creativeFormat: string;
  marketingTactic: string;
};

const EMPTY_FIELDS: CampaignFields = {
  source: "",
  medium: "",
  campaign: "",
  id: "",
  sourcePlatform: "",
  term: "",
  content: "",
  creativeFormat: "",
  marketingTactic: "",
};

const UTM_KEYS: Array<[keyof CampaignFields, string]> = [
  ["id", "utm_id"],
  ["source", "utm_source"],
  ["medium", "utm_medium"],
  ["campaign", "utm_campaign"],
  ["sourcePlatform", "utm_source_platform"],
  ["term", "utm_term"],
  ["content", "utm_content"],
  ["creativeFormat", "utm_creative_format"],
  ["marketingTactic", "utm_marketing_tactic"],
];

function buildCampaignUrl(baseUrl: string, fields: CampaignFields) {
  const trimmed = baseUrl.trim();
  if (!trimmed) return { url: "", warnings: ["Enter a destination URL."], existing: [] as string[] };

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { url: "", warnings: ["Enter an absolute URL such as https://example.com/page."], existing: [] as string[] };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { url: "", warnings: ["Campaign links should use an http:// or https:// destination URL."], existing: [] as string[] };
  }

  const existing = UTM_KEYS.map(([, key]) => key).filter((key) => parsed.searchParams.has(key));
  UTM_KEYS.forEach(([field, key]) => {
    const value = fields[field].trim();
    if (value) parsed.searchParams.set(key, value);
    else if (existing.includes(key)) parsed.searchParams.delete(key);
  });

  const warnings: string[] = [];
  const anyCampaignValue = UTM_KEYS.some(([field]) => fields[field].trim());
  if (anyCampaignValue) {
    const missingCore = [
      ["utm_source", fields.source],
      ["utm_medium", fields.medium],
      ["utm_campaign", fields.campaign],
    ].filter(([, value]) => !String(value).trim()).map(([key]) => key);
    if (missingCore.length) warnings.push(`Google Analytics recommends using utm_source, utm_medium, and utm_campaign together. Missing: ${missingCore.join(", ")}.`);
  } else {
    warnings.push("No UTM values are set, so the generated URL is only the normalized destination URL.");
  }
  if (existing.length) warnings.push(`Existing UTM parameters were replaced or removed according to the fields above: ${existing.join(", ")}.`);
  if (/[A-Z]/.test(fields.source) || /[A-Z]/.test(fields.medium)) warnings.push("Campaign values can fragment reports when capitalization is inconsistent. Keep a naming convention rather than relying on automatic lowercasing.");
  if (fields.creativeFormat.trim() || fields.marketingTactic.trim()) warnings.push("Google documents utm_creative_format and utm_marketing_tactic, but notes that they are not currently reported in Google Analytics properties.");

  return { url: parsed.toString(), warnings, existing };
}

export default function ToolClient() {
  const [baseUrl, setBaseUrl] = useState("");
  const [fields, setFields] = useState<CampaignFields>(EMPTY_FIELDS);

  const result = useMemo(() => buildCampaignUrl(baseUrl, fields), [baseUrl, fields]);

  const update = (field: keyof CampaignFields, value: string) => {
    setFields((current) => ({ ...current, [field]: value }));
  };

  const loadExample = () => {
    setBaseUrl("https://example.com/pricing?ref=homepage#plans");
    setFields({
      source: "newsletter",
      medium: "email",
      campaign: "autumn_launch",
      id: "launch_2026_08",
      sourcePlatform: "email_platform",
      term: "",
      content: "top_cta",
      creativeFormat: "",
      marketingTactic: "",
    });
  };

  const reset = () => {
    setBaseUrl("");
    setFields(EMPTY_FIELDS);
  };

  const inputClass = "w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition";

  return (
    <ToolShell
      title="UTM Builder"
      description="Build campaign URLs while preserving existing query parameters and fragments, with current Google Analytics UTM fields and consistency checks."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Destination URL</label>
        <input type="url" value={baseUrl} onChange={(event: { target: { value: string } }) => setBaseUrl(event.target.value)} placeholder="https://example.com/page?ref=nav#section" className={inputClass} />
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Field label="UTM Source" value={fields.source} onChange={(value) => update("source", value)} placeholder="newsletter" />
        <Field label="UTM Medium" value={fields.medium} onChange={(value) => update("medium", value)} placeholder="email" />
        <Field label="UTM Campaign" value={fields.campaign} onChange={(value) => update("campaign", value)} placeholder="autumn_launch" />
        <Field label="UTM ID" value={fields.id} onChange={(value) => update("id", value)} placeholder="campaign_2026_08" />
        <Field label="UTM Source Platform" value={fields.sourcePlatform} onChange={(value) => update("sourcePlatform", value)} placeholder="google_ads" />
        <Field label="UTM Term" value={fields.term} onChange={(value) => update("term", value)} placeholder="running shoes" />
        <Field label="UTM Content" value={fields.content} onChange={(value) => update("content", value)} placeholder="hero_cta" />
        <Field label="UTM Creative Format" value={fields.creativeFormat} onChange={(value) => update("creativeFormat", value)} placeholder="video" />
        <Field label="UTM Marketing Tactic" value={fields.marketingTactic} onChange={(value) => update("marketingTactic", value)} placeholder="remarketing" />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={loadExample} className="yoryantra-btn">Load Example</button>
        {result.url && <button onClick={() => navigator.clipboard.writeText(result.url)} className="yoryantra-btn-outline">Copy URL</button>}
        <button onClick={reset} className="yoryantra-btn-outline">Reset</button>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Campaign URL</h3>
        <div className="yoryantra-output min-h-[140px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {result.url || "A valid campaign URL will appear here."}
        </div>
      </div>

      {result.warnings.length > 0 && (
        <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
          <div className="font-semibold">Checks</div>
          <ul className="mt-2 list-disc list-inside space-y-1">
            {result.warnings.map((warning) => <li key={warning}>{warning}</li>)}
          </ul>
        </div>
      )}

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Build Tracking URLs Without Damaging the Destination URL</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This builder uses the browser URL parser rather than string concatenation. Existing non-UTM query parameters stay in place, fragments remain at the end of the URL, and each UTM field is percent-encoded as a query parameter value.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            If the destination already contains one of the UTM parameters shown above, the value in the form replaces it. Leaving that field blank removes the existing UTM parameter so the output does not accidentally carry stale campaign data.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What the Current Google Analytics Parameters Mean</h2>
          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-900"><tr><th className="p-3">Parameter</th><th className="p-3">Purpose</th></tr></thead>
              <tbody className="text-gray-600">
                <tr className="border-t"><td className="p-3 font-mono">utm_source</td><td className="p-3">The referring platform or source, such as newsletter, google, or billboard.</td></tr>
                <tr className="border-t"><td className="p-3 font-mono">utm_medium</td><td className="p-3">The marketing medium or channel, such as email, cpc, banner, or referral.</td></tr>
                <tr className="border-t"><td className="p-3 font-mono">utm_campaign</td><td className="p-3">The campaign or promotion name.</td></tr>
                <tr className="border-t"><td className="p-3 font-mono">utm_id</td><td className="p-3">A campaign identifier, especially useful when joining campaign data.</td></tr>
                <tr className="border-t"><td className="p-3 font-mono">utm_term / utm_content</td><td className="p-3">Paid keyword and creative/link variation details.</td></tr>
                <tr className="border-t"><td className="p-3 font-mono">utm_source_platform</td><td className="p-3">The platform responsible for directing the traffic.</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Naming Consistency Matters More Than Automatic Cleanup</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            The tool does not silently lowercase, replace spaces, or rename campaign values. That could change an intentional taxonomy. Instead, keep a documented naming convention so the same source, medium, and campaign do not split into multiple reporting values because of spelling or capitalization differences.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Official Reference</h2>
          <p className="mt-3 text-gray-600 leading-relaxed"><a className="underline" href="https://support.google.com/analytics/answer/10917952" target="_blank" rel="noreferrer">Google Analytics: Collect campaign data with custom URLs</a> documents the current UTM parameter set and campaign-tagging guidance.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Explore Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/utm-builder" />
        </div>
      </section>
    </ToolShell>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-gray-700">{label}</label>
      <input value={value} onChange={(event: { target: { value: string } }) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition" />
    </div>
  );
}
