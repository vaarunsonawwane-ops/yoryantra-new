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

type BuildResult = {
  url: string;
  errors: string[];
  warnings: string[];
  notes: string[];
  existingUtmKeys: string[];
  duplicateUtmKeys: string[];
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

const SECRETISH_QUERY_NAME =
  /(?:token|secret|signature|sig|password|passwd|api[_-]?key|access[_-]?key|auth|authorization|code)/i;

function parseHttpUrl(input: string) {
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      url: null as URL | null,
      error: "Enter a destination URL.",
    };
  }

  try {
    const parsed = new URL(trimmed);

    if (
      parsed.protocol !== "http:" &&
      parsed.protocol !== "https:"
    ) {
      return {
        url: null as URL | null,
        error:
          "Campaign links should use an http:// or https:// destination URL.",
      };
    }

    if (parsed.username || parsed.password) {
      return {
        url: null as URL | null,
        error:
          "Remove username/password credentials from the destination URL before building a campaign link.",
      };
    }

    return {
      url: parsed,
      error: "",
    };
  } catch {
    return {
      url: null as URL | null,
      error:
        "Enter an absolute destination URL such as https://example.com/page.",
    };
  }
}

function collectExistingUtmInfo(parsed: URL) {
  const existing: string[] = [];
  const duplicates: string[] = [];

  UTM_KEYS.forEach((pair) => {
    const key = pair[1];
    const values = parsed.searchParams.getAll(key);

    if (values.length) {
      existing.push(key);
    }

    if (values.length > 1) {
      duplicates.push(key);
    }
  });

  return { existing, duplicates };
}

function buildCampaignUrl(
  baseUrl: string,
  fields: CampaignFields,
  clearExisting: boolean
): BuildResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const notes: string[] = [];
  const parsedResult = parseHttpUrl(baseUrl);

  if (!parsedResult.url) {
    return {
      url: "",
      errors: parsedResult.error
        ? [parsedResult.error]
        : [],
      warnings,
      notes,
      existingUtmKeys: [],
      duplicateUtmKeys: [],
    };
  }

  const parsed = parsedResult.url;
  const info = collectExistingUtmInfo(parsed);

  if (clearExisting) {
    UTM_KEYS.forEach((pair) => {
      parsed.searchParams.delete(pair[1]);
    });
  }

  UTM_KEYS.forEach((pair) => {
    const field = pair[0];
    const key = pair[1];
    const value = fields[field].trim();

    if (value) {
      parsed.searchParams.set(key, value);
    }
  });

  const finalValues = {
    source: parsed.searchParams.get("utm_source") || "",
    medium: parsed.searchParams.get("utm_medium") || "",
    campaign: parsed.searchParams.get("utm_campaign") || "",
    id: parsed.searchParams.get("utm_id") || "",
    sourcePlatform:
      parsed.searchParams.get("utm_source_platform") || "",
  };

  const hasAnyFinalUtm = UTM_KEYS.some((pair) =>
    parsed.searchParams.has(pair[1])
  );

  if (!hasAnyFinalUtm) {
    warnings.push(
      "No UTM parameters are present in the generated URL yet."
    );
  } else {
    const missingCore: string[] = [];

    if (!finalValues.source) {
      missingCore.push("utm_source");
    }

    if (!finalValues.medium) {
      missingCore.push("utm_medium");
    }

    if (!finalValues.campaign) {
      missingCore.push("utm_campaign");
    }

    if (missingCore.length) {
      warnings.push(
        `The campaign URL is missing ${missingCore.join(
          ", "
        )}. Google Analytics recommends using utm_source, utm_medium, and utm_campaign together.`
      );
    }

    if (
      !finalValues.id ||
      !finalValues.sourcePlatform
    ) {
      notes.push(
        "Google Analytics also recommends using relevant campaign parameters such as utm_id and utm_source_platform when those identifiers are part of your measurement plan."
      );
    }
  }

  const caseSensitiveValues = [
    finalValues.source,
    finalValues.medium,
    finalValues.campaign,
  ].filter(Boolean);

  if (
    caseSensitiveValues.some((value) => /[A-Z]/.test(value))
  ) {
    warnings.push(
      "UTM values are case-sensitive in reporting. Mixed capitalization can split what you intended to be one source, medium, or campaign."
    );
  }

  if (info.existing.length && !clearExisting) {
    notes.push(
      `Existing UTM parameters are preserved unless a non-empty form field replaces the same key: ${info.existing.join(
        ", "
      )}.`
    );
  }

  if (info.existing.length && clearExisting) {
    notes.push(
      `Existing UTM parameters were cleared before applying the form values: ${info.existing.join(
        ", "
      )}.`
    );
  }

  if (info.duplicates.length) {
    warnings.push(
      `The destination URL contains duplicate UTM keys: ${info.duplicates.join(
        ", "
      )}. A field you set here is normalized to one value; untouched duplicates remain when "clear existing" is off.`
    );
  }

  let nonUtmCount = 0;

  parsed.searchParams.forEach((_, key) => {
    const isUtm = UTM_KEYS.some(
      (pair) => pair[1] === key
    );

    if (!isUtm) {
      nonUtmCount += 1;
    }
  });

  if (nonUtmCount) {
    notes.push(
      `${nonUtmCount} non-UTM query parameter${
        nonUtmCount === 1 ? " is" : "s are"
      } preserved.`
    );
  }

  if (parsed.hash) {
    notes.push(
      `The URL fragment ${parsed.hash} is preserved at the end of the generated link.`
    );
  }

  const secretishNames: string[] = [];

  parsed.searchParams.forEach((_, key) => {
    if (
      SECRETISH_QUERY_NAME.test(key) &&
      secretishNames.indexOf(key) === -1
    ) {
      secretishNames.push(key);
    }
  });

  if (secretishNames.length) {
    warnings.push(
      `The destination includes query names that may contain sensitive values (${secretishNames.join(
        ", "
      )}). Review them before sharing the campaign URL widely.`
    );
  }

  if (
    parsed.hostname === "localhost" ||
    parsed.hostname === "127.0.0.1" ||
    parsed.hostname === "::1"
  ) {
    notes.push(
      "The destination is local-only, so this campaign URL is mainly useful for testing rather than public acquisition traffic."
    );
  }

  if (
    fields.creativeFormat.trim() ||
    fields.marketingTactic.trim() ||
    parsed.searchParams.has("utm_creative_format") ||
    parsed.searchParams.has("utm_marketing_tactic")
  ) {
    notes.push(
      "Google documents utm_creative_format and utm_marketing_tactic but currently notes that they are not reported in Google Analytics properties."
    );
  }

  return {
    url: parsed.toString(),
    errors,
    warnings,
    notes,
    existingUtmKeys: info.existing,
    duplicateUtmKeys: info.duplicates,
  };
}

function readFieldsFromUrl(baseUrl: string) {
  const parsed = parseHttpUrl(baseUrl);

  if (!parsed.url) {
    return {
      fields: null as CampaignFields | null,
      error: parsed.error,
    };
  }

  const next = { ...EMPTY_FIELDS };

  UTM_KEYS.forEach((pair) => {
    const field = pair[0];
    const key = pair[1];
    next[field] = parsed.url
      ? parsed.url.searchParams.get(key) || ""
      : "";
  });

  return {
    fields: next,
    error: "",
  };
}

export default function ToolClient() {
  const [baseUrl, setBaseUrl] = useState("");
  const [fields, setFields] =
    useState<CampaignFields>(EMPTY_FIELDS);
  const [clearExisting, setClearExisting] =
    useState(false);
  const [importMessage, setImportMessage] =
    useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildCampaignUrl(
        baseUrl,
        fields,
        clearExisting
      ),
    [baseUrl, fields, clearExisting]
  );

  const update = (
    field: keyof CampaignFields,
    value: string
  ) => {
    setFields((current) => ({
      ...current,
      [field]: value,
    }));
    setCopied(false);
    setImportMessage("");
  };

  const importExisting = () => {
    const imported = readFieldsFromUrl(baseUrl);

    if (!imported.fields) {
      setImportMessage(imported.error);
      return;
    }

    setFields(imported.fields);
    setImportMessage(
      "Existing UTM values were loaded into the form. The destination URL itself was not changed."
    );
    setCopied(false);
  };

  const loadExample = () => {
    setBaseUrl(
      "https://example.com/pricing?ref=homepage#plans"
    );
    setFields({
      source: "newsletter",
      medium: "email",
      campaign: "autumn_launch",
      id: "launch_2026_09",
      sourcePlatform: "email_platform",
      term: "",
      content: "top_cta",
      creativeFormat: "",
      marketingTactic: "",
    });
    setClearExisting(false);
    setImportMessage("");
    setCopied(false);
  };

  const reset = () => {
    setBaseUrl("");
    setFields({ ...EMPTY_FIELDS });
    setClearExisting(false);
    setImportMessage("");
    setCopied(false);
  };

  const copyUrl = async () => {
    if (!result.url) return;

    try {
      await navigator.clipboard.writeText(result.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]";

  return (
    <ToolShell
      title="UTM Builder"
      description="Build campaign URLs without damaging the destination: preserve existing query parameters and fragments, review old UTM tags, and apply a consistent Google Analytics campaign taxonomy."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Destination URL
        </label>
        <input
          type="url"
          value={baseUrl}
          onChange={(event: { target: { value: string } }) => {
            setBaseUrl(event.target.value);
            setImportMessage("");
            setCopied(false);
          }}
          placeholder="https://example.com/page?ref=nav#section"
          spellCheck={false}
          className={inputClass}
        />

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={importExisting}
            className="yoryantra-btn-outline text-sm"
          >
            Load Existing UTMs Into Fields
          </button>
        </div>

        {importMessage ? (
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            {importMessage}
          </p>
        ) : null}
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Field
          label="UTM Source"
          hint="Where the traffic came from"
          value={fields.source}
          onChange={(value) => update("source", value)}
          placeholder="newsletter"
        />
        <Field
          label="UTM Medium"
          hint="The marketing channel"
          value={fields.medium}
          onChange={(value) => update("medium", value)}
          placeholder="email"
        />
        <Field
          label="UTM Campaign"
          hint="The campaign or promotion name"
          value={fields.campaign}
          onChange={(value) =>
            update("campaign", value)
          }
          placeholder="autumn_launch"
        />
        <Field
          label="UTM ID"
          hint="A stable campaign identifier"
          value={fields.id}
          onChange={(value) => update("id", value)}
          placeholder="launch_2026_09"
        />
        <Field
          label="UTM Source Platform"
          hint="Platform managing or directing the traffic"
          value={fields.sourcePlatform}
          onChange={(value) =>
            update("sourcePlatform", value)
          }
          placeholder="email_platform"
        />
        <Field
          label="UTM Term"
          hint="Keyword or targeting term"
          value={fields.term}
          onChange={(value) => update("term", value)}
          placeholder="running shoes"
        />
        <Field
          label="UTM Content"
          hint="Creative, CTA, or link variation"
          value={fields.content}
          onChange={(value) =>
            update("content", value)
          }
          placeholder="hero_cta"
        />
        <Field
          label="UTM Creative Format"
          hint="Creative type"
          value={fields.creativeFormat}
          onChange={(value) =>
            update("creativeFormat", value)
          }
          placeholder="video"
        />
        <Field
          label="UTM Marketing Tactic"
          hint="Campaign targeting tactic"
          value={fields.marketingTactic}
          onChange={(value) =>
            update("marketingTactic", value)
          }
          placeholder="remarketing"
        />
      </div>

      <label className="mt-6 flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        <input
          type="checkbox"
          checked={clearExisting}
          onChange={(event: { target: { checked: boolean } }) => {
            setClearExisting(event.target.checked);
            setCopied(false);
          }}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#d9a928]"
        />
        <span>
          <strong>
            Clear existing UTM parameters before applying these fields.
          </strong>{" "}
          Off by default so opening an already-tagged destination does not silently erase campaign data.
        </span>
      </label>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={loadExample}
          className="yoryantra-btn"
        >
          Load Example
        </button>
        {result.url ? (
          <button
            type="button"
            onClick={copyUrl}
            className="yoryantra-btn-outline"
          >
            {copied ? "Copied" : "Copy URL"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={reset}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {result.errors.length ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          <ul className="list-disc space-y-1 pl-5">
            {result.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Campaign URL
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">
          Built with the browser URL parser, so existing non-UTM query parameters and fragments stay in the correct part of the URL.
        </p>
        <div className="mt-4 yoryantra-output min-h-[150px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {result.url ||
            "Enter a valid destination URL to generate the campaign link."}
        </div>
      </div>

      {result.warnings.length ? (
        <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-900">
          <strong>Review before publishing:</strong>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {result.notes.length ? (
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
          <ul className="list-disc space-y-1 pl-5">
            {result.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            A UTM Link Is a Naming Decision, Not Just a URL-Formatting Task
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Adding <code>utm_source=email</code> to a URL is easy. The harder part is deciding whether every email system, teammate, agency, and campaign will use the same source and medium names six months from now. Analytics reports group by the values you send, so <code>newsletter</code>, <code>Newsletter</code>, and <code>email_newsletter</code> can become separate reporting values even when people meant the same source.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The builder deliberately does not auto-lowercase or rewrite your taxonomy. Silent cleanup can be just as damaging as inconsistency if your organization already has established names. Instead, it warns about likely fragmentation and leaves the naming decision visible.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            A Campaign URL Should Preserve the Destination
          </h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-white p-4 text-sm leading-7 text-gray-800">{`Before:
https://example.com/pricing?plan=pro&ref=homepage#compare

After tagging:
https://example.com/pricing?plan=pro&ref=homepage&utm_source=newsletter&utm_medium=email&utm_campaign=autumn_launch#compare`}</pre>
          <p className="mt-4 leading-relaxed text-gray-600">
            The existing <code>plan</code> and <code>ref</code> parameters still matter to the destination, and the <code>#compare</code> fragment still belongs at the end. Building the link through the browser URL API avoids the common string-concatenation mistakes that produce two question marks, put UTMs after the fragment, or drop existing parameters.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Existing UTM Tags Are Preserved by Default
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            An already-tagged destination may have been copied from an ad platform, CRM, email workflow, or previous campaign. Blank form fields should not silently mean “delete those tags.” In this version of the builder, an empty field leaves the existing key alone. Entering a new value replaces that key.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            When you intentionally want a clean slate, enable <strong>Clear existing UTM parameters</strong>. The separate “Load Existing UTMs Into Fields” action is useful when you want to inspect and edit an existing campaign link rather than starting over.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            The Core Parameters Answer Three Different Questions
          </h2>
          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-900">
                <tr>
                  <th className="p-3">Parameter</th>
                  <th className="p-3">Question it answers</th>
                  <th className="p-3">Example</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr className="border-t">
                  <td className="p-3 font-mono">utm_source</td>
                  <td className="p-3">Where did the traffic come from?</td>
                  <td className="p-3 font-mono">newsletter</td>
                </tr>
                <tr className="border-t">
                  <td className="p-3 font-mono">utm_medium</td>
                  <td className="p-3">What marketing channel or medium carried it?</td>
                  <td className="p-3 font-mono">email</td>
                </tr>
                <tr className="border-t">
                  <td className="p-3 font-mono">utm_campaign</td>
                  <td className="p-3">Which campaign or promotion was it part of?</td>
                  <td className="p-3 font-mono">autumn_launch</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 leading-relaxed text-gray-600">
            Google Analytics recommends using those three together. <code>utm_id</code> can provide a stable campaign identifier, while <code>utm_source_platform</code> can describe the platform responsible for directing the traffic. Term and content are useful for keyword or creative-level distinctions when your measurement plan needs them.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            A Naming Convention Prevents Reporting From Fragmenting
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Pick conventions before generating hundreds of links. Decide whether source names use full platform names or short names, whether medium values follow your channel-grouping strategy, how campaign IDs map to internal systems, and how creative names are structured.
          </p>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-7 text-gray-700">
            <div><strong>Consistent:</strong> source=instagram, medium=paid_social, campaign=summer_sale</div>
            <div><strong>Fragmented:</strong> Instagram / insta / IG, PaidSocial / paid-social / social_paid</div>
          </div>
          <p className="mt-4 leading-relaxed text-gray-600">
            Consistency is more valuable than inventing a complicated taxonomy. Use names your team can apply correctly without having to reinterpret them every time.
          </p>
        </div>

        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            Do Not Use Acquisition UTMs as a Substitute for Internal Click Tracking
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            UTM parameters are primarily for campaign links bringing users to your site. Adding them to navigation between your own pages can muddy acquisition reporting or change how analytics systems interpret campaign context. If you need to measure which internal button, card, or navigation item was clicked, use an event or another purpose-built internal measurement method.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Manual UTMs and Ad-Platform Auto-Tagging Can Interact
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Advertising platforms may add their own click identifiers, and Google Ads can use auto-tagging. Google Analytics documents precedence behavior when manual and automatic tagging coexist. Before adding UTMs to links that are already auto-tagged through an integrated ad platform, confirm which values your reporting setup will actually use.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Campaign URLs Are Public Enough That Secrets Do Not Belong in Them
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Query strings can appear in browser history, analytics systems, logs, copied messages, screenshots, referrer data, and third-party tools. UTM values themselves should describe campaigns, not carry personal data, passwords, API keys, authorization codes, or private customer details.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The builder flags query-parameter names that look credential-related, but that is only a warning heuristic. It cannot determine whether an innocent-looking value is actually sensitive.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Test the Final Click Path, Not Only the Generated String
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Email systems, link shorteners, social platforms, redirect services, consent tooling, and server redirects can modify or remove query parameters after you copy the URL. Before launching an important campaign, click through the real published link and verify the landing URL and analytics data rather than assuming the builder's output survives every intermediary unchanged.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Google Analytics Campaign-Tagging Guidance
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Google’s current campaign URL documentation adds direct value here because it defines the UTM parameter set, notes case sensitivity and naming consistency, and explains which parameters are currently reported.
          </p>
          <p className="mt-4 text-sm">
            <a
              href="https://support.google.com/analytics/answer/10917952"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              Google Analytics — collect campaign data with custom URLs
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <YoryantraRelatedTools currentHref="/tools/utm-builder" />
        </div>
      </section>
    </ToolShell>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        value={value}
        onChange={(event: { target: { value: string } }) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        spellCheck={false}
        className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
      />
      <p className="mt-1 text-xs leading-relaxed text-gray-500">
        {hint}
      </p>
    </div>
  );
}
