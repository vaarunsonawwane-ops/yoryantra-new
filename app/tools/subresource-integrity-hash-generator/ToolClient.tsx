"use client";

import { useMemo, useRef, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type Algorithm = "SHA-256" | "SHA-384" | "SHA-512" | "all";
type HashAlgorithm = "SHA-256" | "SHA-384" | "SHA-512";
type ResourceType = "script" | "style" | "raw";
type OutputMode = "attribute" | "html" | "hashes" | "json" | "markdown";
type Severity = "info" | "warning";

type SriHash = {
  algorithm: HashAlgorithm;
  prefix: "sha256" | "sha384" | "sha512";
  value: string;
  integrity: string;
};

type Issue = {
  severity: Severity;
  title: string;
  message: string;
};

type SriResult = {
  hashes: SriHash[];
  output: string;
  issues: Issue[];
  inputBytes: number;
  integrityValue: string;
  htmlSnippet: string;
};

const sampleContent = `console.log("Hello from a pinned CDN script");
function add(a, b) {
  return a + b;
}`;

export default function ToolClient() {
  const [content, setContent] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [algorithm, setAlgorithm] = useState<Algorithm>("SHA-384");
  const [resourceType, setResourceType] = useState<ResourceType>("script");
  const [outputMode, setOutputMode] = useState<OutputMode>("attribute");
  const [includeCrossorigin, setIncludeCrossorigin] = useState(true);
  const [combineAllHashes, setCombineAllHashes] = useState(false);
  const [warnAboutDynamicFiles, setWarnAboutDynamicFiles] = useState(true);
  const [result, setResult] = useState<SriResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const requestId = useRef(0);

  const warnings = useMemo(
    () => result?.issues.filter((item) => item.severity === "warning") || [],
    [result]
  );
  const infoItems = useMemo(
    () => result?.issues.filter((item) => item.severity === "info") || [],
    [result]
  );

  const clearResult = () => {
    requestId.current += 1;
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const generateSri = async () => {
    if (
      outputMode === "html" &&
      resourceType !== "raw" &&
      resourceUrl.trim().length === 0
    ) {
      setError("Enter the script or stylesheet URL before generating a complete HTML tag.");
      setResult(null);
      setOutput("");
      setCopied(false);
      return;
    }

    if (resourceUrl.trim()) {
      try {
        const parsed = new URL(resourceUrl.trim());
        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
          throw new Error();
        }
      } catch {
        setError("Resource URL must be a valid HTTP or HTTPS URL.");
        setResult(null);
        setOutput("");
        setCopied(false);
        return;
      }
    }

    const currentRequest = requestId.current + 1;
    requestId.current = currentRequest;

    try {
      const next = await buildSriResult({
        content,
        resourceUrl: resourceUrl.trim(),
        algorithm,
        resourceType,
        outputMode,
        includeCrossorigin,
        combineAllHashes,
        warnAboutDynamicFiles,
      });

      if (requestId.current !== currentRequest) return;

      setResult(next);
      setOutput(next.output);
      setError("");
      setCopied(false);
    } catch (caught) {
      if (requestId.current !== currentRequest) return;

      setError(
        caught instanceof Error
          ? caught.message
          : "The SRI hashes could not be generated in this browser."
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
      setError("The generated output could not be copied. Select and copy it manually.");
    }
  };

  const loadExample = () => {
    setContent(sampleContent);
    setResourceUrl("https://cdn.example.com/app-4.2.1.min.js");
    setAlgorithm("SHA-384");
    setResourceType("script");
    setOutputMode("attribute");
    setIncludeCrossorigin(true);
    setCombineAllHashes(false);
    setWarnAboutDynamicFiles(true);
    clearResult();
  };

  const resetAll = () => {
    setContent("");
    setResourceUrl("");
    setAlgorithm("SHA-384");
    setResourceType("script");
    setOutputMode("attribute");
    setIncludeCrossorigin(true);
    setCombineAllHashes(false);
    setWarnAboutDynamicFiles(true);
    clearResult();
  };

  return (
    <ToolShell
      title="Subresource Integrity Hash Generator"
      description="Hash exact UTF-8 script or stylesheet text for SRI and generate deployable integrity attributes."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Exact Resource Text
        </label>

        <textarea
          value={content}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
            setContent(event.target.value);
            clearResult();
          }}
          placeholder={sampleContent}
          spellCheck={false}
          className="min-h-[340px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Hashing uses the exact UTF-8 bytes represented by this field. No trimming, Unicode normalization, or line-ending conversion is applied by the page.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Resource URL
        </label>

        <input
          value={resourceUrl}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setResourceUrl(event.target.value);
            clearResult();
          }}
          placeholder="https://cdn.example.com/app-4.2.1.min.js"
          className="w-full rounded-xl border border-gray-300 bg-white p-3 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Optional for an integrity value alone. A URL is required when you ask for a complete script or stylesheet tag.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Choose the SRI output
        </h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Hash algorithm"
            value={algorithm}
            onChange={(value: string) => {
              setAlgorithm(value as Algorithm);
              clearResult();
            }}
            options={[
              { label: "SHA-384 baseline", value: "SHA-384" },
              { label: "SHA-256", value: "SHA-256" },
              { label: "SHA-512", value: "SHA-512" },
              { label: "Generate all three", value: "all" },
            ]}
          />

          <YoryantraSelect
            label="Resource markup"
            value={resourceType}
            onChange={(value: string) => {
              setResourceType(value as ResourceType);
              clearResult();
            }}
            options={[
              { label: "Script element", value: "script" },
              { label: "Stylesheet link", value: "style" },
              { label: "Integrity value only", value: "raw" },
            ]}
          />

          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value: string) => {
              setOutputMode(value as OutputMode);
              clearResult();
            }}
            options={[
              { label: "Integrity attribute value", value: "attribute" },
              { label: "Complete HTML tag", value: "html" },
              { label: "Hash list", value: "hashes" },
              { label: "JSON", value: "json" },
              { label: "Markdown table", value: "markdown" },
            ]}
          />

          <div className="space-y-3 md:col-span-2">
            <CheckboxRow
              checked={includeCrossorigin}
              label='Include crossorigin="anonymous" in generated HTML'
              onChange={(checked) => {
                setIncludeCrossorigin(checked);
                clearResult();
              }}
            />

            <CheckboxRow
              checked={combineAllHashes}
              label="When generating all three, combine them into one integrity value"
              onChange={(checked) => {
                setCombineAllHashes(checked);
                clearResult();
              }}
            />

            <CheckboxRow
              checked={warnAboutDynamicFiles}
              label="Flag URLs that look unversioned or changeable"
              onChange={(checked) => {
                setWarnAboutDynamicFiles(checked);
                clearResult();
              }}
            />
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          SHA-256, SHA-384, and SHA-512 are valid SRI algorithms. The SRI specification describes SHA-384 as a good baseline; if different algorithms are combined, the browser evaluates the strongest supported algorithm present.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generateSri} className="yoryantra-btn whitespace-nowrap">
          Generate SRI
        </button>

        <button
          onClick={copyOutput}
          className="yoryantra-btn-outline whitespace-nowrap"
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
        <div className="mt-8 grid items-start gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="UTF-8 bytes" value={result.inputBytes.toLocaleString()} />
          <SummaryCard label="Generated hashes" value={String(result.hashes.length)} />
          <SummaryCard
            label="Integrity uses"
            value={integrityAlgorithms(result.integrityValue)}
          />
          <SummaryCard label="Findings" value={String(result.issues.length)} />
        </div>
      )}

      {result && result.hashes.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Hashes for the exact pasted text
          </h3>

          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Algorithm</th>
                  <th className="px-4 py-3 font-semibold">SRI token</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {result.hashes.map((hash) => (
                  <tr key={hash.algorithm}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {hash.algorithm}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">
                      <span className="block max-w-[620px] break-all">
                        {hash.integrity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <FindingCard tone="amber" title="Deployment cautions" items={warnings} />
      )}

      {infoItems.length > 0 && (
        <FindingCard tone="blue" title="Details that affect the match" items={infoItems} />
      )}

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Output
          </h3>

          {output && (
            <button
              onClick={copyOutput}
              className="yoryantra-btn-outline whitespace-nowrap text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output min-h-[280px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "Generated SRI output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
        Hashing happens in this browser with Web Crypto. The pasted resource text is not fetched, uploaded, or compared with the URL automatically.
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            SRI protects a particular resource body, not a CDN name
          </h2>

          <p className="mt-4 leading-relaxed text-gray-600">
            An integrity attribute tells the browser which cryptographic digest is acceptable for a script or stylesheet. If the fetched bytes do not match the strongest supported integrity metadata, the browser refuses to use that resource.
          </p>

          <p className="mt-4 leading-relaxed text-gray-600">
            That protects against an unexpected file replacement at a third-party host, but only when the hash was created from the exact version you intended to trust.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Copying source text can change the bytes you meant to hash
          </h2>

          <p className="mt-4 leading-relaxed text-gray-600">
            Minification, a trailing newline, CRLF versus LF, Unicode normalization, or a build step that rewrites text will change the digest. For a production CDN file, generating SRI from the exact downloaded artifact is safer than copying code from an editor or documentation page.
          </p>

          <p className="mt-4 leading-relaxed text-gray-600">
            This page hashes UTF-8 text because that is what a browser textarea can represent. It is not a byte-for-byte file upload hasher for arbitrary binary content or non-UTF-8 source files.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Combining SHA-256, SHA-384, and SHA-512 is not ordinary fallback
          </h2>

          <p className="mt-4 leading-relaxed text-gray-600">
            An integrity attribute may contain several space-separated hashes. When different supported algorithms are present, the browser selects the strongest algorithm set and ignores weaker ones for that response. Multiple hashes of the same strongest algorithm can represent approved alternate resource bodies.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Cross-origin SRI needs CORS cooperation
          </h2>

          <p className="mt-4 leading-relaxed text-gray-600">
            A resource on another origin must be fetched with CORS for SRI validation. In ordinary script and stylesheet markup that normally means a <span className="font-mono">crossorigin="anonymous"</span> attribute and an appropriate <span className="font-mono">Access-Control-Allow-Origin</span> response from the resource server.
          </p>

          <p className="mt-4 leading-relaxed text-gray-600">
            A correct hash cannot compensate for missing CORS permission. If the CDN does not opt in, the cross-origin resource still fails.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Pin the URL and update the hash together
          </h2>

          <p className="mt-4 leading-relaxed text-gray-600">
            URLs such as <span className="font-mono">latest.js</span> or an unversioned package path can change without notice. SRI then turns that change into a load failure, which is safer than executing unexpected code but can still break the page. Versioned resource URLs make that failure mode easier to control.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Standards behind the integrity attribute
          </h2>

          <p className="mt-4 leading-relaxed text-gray-600">
            The W3C Subresource Integrity specification defines the integrity metadata format, algorithm priority, and CORS requirement. The HTML specification applies the attribute to scripts and qualifying link resources, including stylesheets.
          </p>

          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            References:{" "}
            <a
              href="https://www.w3.org/TR/SRI/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-2"
            >
              W3C Subresource Integrity
            </a>
            {" "}and{" "}
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Subresource_Integrity"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-2"
            >
              MDN Subresource Integrity
            </a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/subresource-integrity-hash-generator" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function CheckboxRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-sm font-medium leading-relaxed text-gray-900">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]"
      />
      <span>{label}</span>
    </label>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-1 break-words font-mono text-sm font-semibold text-gray-900 [overflow-wrap:anywhere]">
        {value}
      </div>
    </div>
  );
}

function FindingCard({
  tone,
  title,
  items,
}: {
  tone: "amber" | "blue";
  title: string;
  items: Issue[];
}) {
  const amber = tone === "amber";

  return (
    <div
      className={`mt-6 self-start rounded-xl border p-4 ${
        amber
          ? "border-amber-200 bg-amber-50 text-amber-800"
          : "border-blue-200 bg-blue-50 text-blue-800"
      }`}
    >
      <h3 className={`text-sm font-semibold ${amber ? "text-amber-900" : "text-blue-900"}`}>
        {title}
      </h3>
      <div className="mt-3 space-y-3">
        {items.map((item, index) => (
          <div key={`${item.title}-${index}`}>
            <p className={`text-sm font-semibold ${amber ? "text-amber-900" : "text-blue-900"}`}>
              {item.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed">{item.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

async function buildSriResult(options: {
  content: string;
  resourceUrl: string;
  algorithm: Algorithm;
  resourceType: ResourceType;
  outputMode: OutputMode;
  includeCrossorigin: boolean;
  combineAllHashes: boolean;
  warnAboutDynamicFiles: boolean;
}): Promise<SriResult> {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto is not available in this browser context.");
  }

  const algorithms: HashAlgorithm[] =
    options.algorithm === "all"
      ? ["SHA-256", "SHA-384", "SHA-512"]
      : [options.algorithm];

  const hashes = await Promise.all(
    algorithms.map((item) => makeSriHash(options.content, item))
  );

  const sha384 = hashes.find((item) => item.algorithm === "SHA-384");
  const preferred = sha384 || hashes[0];
  const integrityValue =
    options.algorithm === "all" && options.combineAllHashes
      ? sortHashesByStrength(hashes).map((item) => item.integrity).join(" ")
      : preferred?.integrity || "";

  const htmlSnippet = makeHtmlSnippet(
    options.resourceUrl,
    integrityValue,
    options.resourceType,
    options.includeCrossorigin
  );

  const issues = getIssues(options, hashes, integrityValue);
  const base = {
    hashes,
    issues,
    inputBytes: new TextEncoder().encode(options.content).length,
    integrityValue,
    htmlSnippet,
  };

  return {
    ...base,
    output: formatOutput(base, options.outputMode),
  };
}

async function makeSriHash(
  content: string,
  algorithm: HashAlgorithm
): Promise<SriHash> {
  const bytes = new TextEncoder().encode(content);
  const digest = await globalThis.crypto.subtle.digest(algorithm, bytes);
  const value = arrayBufferToBase64(digest);
  const prefix = algorithmToPrefix(algorithm);

  return {
    algorithm,
    prefix,
    value,
    integrity: `${prefix}-${value}`,
  };
}

function algorithmToPrefix(algorithm: HashAlgorithm): SriHash["prefix"] {
  if (algorithm === "SHA-256") return "sha256";
  if (algorithm === "SHA-512") return "sha512";
  return "sha384";
}

function sortHashesByStrength(hashes: SriHash[]) {
  const rank: Record<HashAlgorithm, number> = {
    "SHA-256": 1,
    "SHA-384": 2,
    "SHA-512": 3,
  };

  return [...hashes].sort((a, b) => rank[a.algorithm] - rank[b.algorithm]);
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return btoa(binary);
}

function makeHtmlSnippet(
  url: string,
  integrity: string,
  type: ResourceType,
  includeCrossorigin: boolean
) {
  if (type === "raw") return integrity;
  if (!url) return "";

  const crossorigin = includeCrossorigin ? ' crossorigin="anonymous"' : "";

  if (type === "style") {
    return `<link rel="stylesheet" href="${escapeHtml(url)}" integrity="${integrity}"${crossorigin} />`;
  }

  return `<script src="${escapeHtml(url)}" integrity="${integrity}"${crossorigin}></script>`;
}

function getIssues(
  options: {
    content: string;
    resourceUrl: string;
    resourceType: ResourceType;
    includeCrossorigin: boolean;
    combineAllHashes: boolean;
    warnAboutDynamicFiles: boolean;
  },
  hashes: SriHash[],
  integrityValue: string
): Issue[] {
  const issues: Issue[] = [];

  if (options.content.length === 0) {
    issues.push({
      severity: "info",
      title: "The input is an empty UTF-8 resource",
      message: "An empty file has a valid digest. Confirm that zero bytes are what you intended to protect.",
    });
  }

  if (/\r\n|\r/.test(options.content)) {
    issues.push({
      severity: "info",
      title: "Line endings are part of the digest",
      message: "CRLF and LF represent different byte sequences. The deployed file must use the same line endings as the text hashed here.",
    });
  }

  if (hasUnpairedSurrogate(options.content)) {
    issues.push({
      severity: "warning",
      title: "Unpaired UTF-16 surrogate was replaced during UTF-8 encoding",
      message: "TextEncoder converts an unpaired surrogate to U+FFFD. Hash the actual deployed file bytes instead of relying on pasted malformed Unicode text.",
    });
  }

  if (
    typeof options.content.normalize === "function" &&
    options.content !== options.content.normalize("NFC")
  ) {
    issues.push({
      severity: "info",
      title: "Unicode normalization can change the digest",
      message: "The text is not NFC-normalized. The page preserves it exactly rather than rewriting visually equivalent Unicode.",
    });
  }

  if (
    options.warnAboutDynamicFiles &&
    /(\/latest(?:[./_-]|$)|\/current(?:[./_-]|$)|\/nightly(?:[./_-]|$)|\/canary(?:[./_-]|$)|\/snapshot(?:[./_-]|$)|@latest(?:\/|$))/i.test(
      options.resourceUrl
    )
  ) {
    issues.push({
      severity: "warning",
      title: "The URL looks changeable rather than version-pinned",
      message: "If the remote body changes while the HTML keeps this hash, the browser will block the resource.",
    });
  }

  if (/^http:\/\//i.test(options.resourceUrl)) {
    issues.push({
      severity: "warning",
      title: "The resource URL uses HTTP",
      message: "SRI is intended for integrity-protected resources delivered in a secure context. Prefer HTTPS for external scripts and styles.",
    });
  }

  if (
    options.resourceUrl &&
    options.resourceType !== "raw" &&
    !options.includeCrossorigin
  ) {
    issues.push({
      severity: "warning",
      title: "Cross-origin SRI needs a CORS-mode request",
      message: "If this URL is on another origin, omitting crossorigin can make SRI fail even when the hash is correct. The resource server must also allow the request with CORS.",
    });
  }

  if (hashes.length > 1 && options.combineAllHashes) {
    issues.push({
      severity: "info",
      title: "The browser will prefer the strongest supported algorithm",
      message: "Combining sha256, sha384, and sha512 does not make them ordinary fallbacks; supported browsers evaluate the strongest algorithm set present.",
    });
  }

  if (integrityValue.startsWith("sha384-")) {
    issues.push({
      severity: "info",
      title: "SHA-384 is being used for the deployment value",
      message: "SHA-384 is a valid SRI algorithm and is described by the SRI specification as a good baseline.",
    });
  }

  return issues;
}

function hasUnpairedSurrogate(value: string) {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);

    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        index += 1;
      } else {
        return true;
      }
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      return true;
    }
  }

  return false;
}

function integrityAlgorithms(value: string) {
  const prefixes = value
    .split(/\s+/)
    .filter(Boolean)
    .map((item) => item.split("-")[0]);

  return prefixes.length ? prefixes.join(", ") : "—";
}

function formatOutput(result: Omit<SriResult, "output">, mode: OutputMode) {
  if (mode === "json") {
    return JSON.stringify(result, null, 2);
  }

  if (mode === "html") {
    return result.htmlSnippet;
  }

  if (mode === "hashes") {
    return result.hashes
      .map((hash) => `${hash.algorithm}: ${hash.integrity}`)
      .join("\n");
  }

  if (mode === "markdown") {
    return [
      "| Algorithm | SRI token |",
      "| --- | --- |",
      ...result.hashes.map((hash) => `| ${hash.algorithm} | ${hash.integrity} |`),
    ].join("\n");
  }

  return result.integrityValue;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
