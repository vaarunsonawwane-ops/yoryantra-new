"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type Algorithm = "SHA-256" | "SHA-384" | "SHA-512" | "all";
type HashAlgorithm = "SHA-256" | "SHA-384" | "SHA-512";
type ResourceType = "script" | "style" | "raw";
type OutputMode = "attribute" | "html" | "hashes" | "json" | "markdown";

type SriHash = {
  algorithm: HashAlgorithm;
  prefix: "sha256" | "sha384" | "sha512";
  value: string;
  integrity: string;
};

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type SriResult = {
  hashes: SriHash[];
  output: string;
  issues: Issue[];
  inputBytes: number;
  recommendedIntegrity: string;
  htmlSnippet: string;
};

const sampleContent = `console.log("Hello from a CDN script");
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
  const [includeAllHashes, setIncludeAllHashes] = useState(false);
  const [warnAboutDynamicFiles, setWarnAboutDynamicFiles] = useState(true);
  const [result, setResult] = useState<SriResult | null>(null);
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

  const generateSri = async () => {
    if (!content) {
      setError("Please paste the exact script or stylesheet content to hash.");
      setResult(null);
      setOutput("");
      return;
    }

    try {
      const next = await buildSriResult({
        content,
        resourceUrl,
        algorithm,
        resourceType,
        outputMode,
        includeCrossorigin,
        includeAllHashes,
        warnAboutDynamicFiles,
      });

      setResult(next);
      setOutput(next.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate SRI hashes.");
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
    setContent(sampleContent);
    setResourceUrl("https://cdn.example.com/app.min.js");
    setAlgorithm("SHA-384");
    setResourceType("script");
    setOutputMode("attribute");
    setIncludeCrossorigin(true);
    setIncludeAllHashes(false);
    setWarnAboutDynamicFiles(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setContent("");
    setResourceUrl("");
    setAlgorithm("SHA-384");
    setResourceType("script");
    setOutputMode("attribute");
    setIncludeCrossorigin(true);
    setIncludeAllHashes(false);
    setWarnAboutDynamicFiles(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="Subresource Integrity Hash Generator"
      description="Generate Subresource Integrity hashes for scripts and styles. Create SHA-256, SHA-384, and SHA-512 integrity attributes for CDN resources directly in your browser."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Resource Content
        </label>

        <textarea
          value={content}
          onChange={(event) => {
            setContent(event.target.value);
            clearResult();
          }}
          placeholder={sampleContent}
          className="w-full min-h-[360px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste the exact final JavaScript or CSS content served by the CDN. SRI hashes must match the bytes served to the browser.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Resource URL
        </label>

        <input
          value={resourceUrl}
          onChange={(event) => {
            setResourceUrl(event.target.value);
            clearResult();
          }}
          placeholder="https://cdn.example.com/app.min.js"
          className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Optional. Used only when generating script or stylesheet HTML snippets.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Options
        </h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Algorithm"
            value={algorithm}
            onChange={(value) => {
              setAlgorithm(value as Algorithm);
              clearResult();
            }}
            options={[
              { label: "SHA-384 recommended", value: "SHA-384" },
              { label: "SHA-256", value: "SHA-256" },
              { label: "SHA-512", value: "SHA-512" },
              { label: "All algorithms", value: "all" },
            ]}
          />

          <YoryantraSelect
            label="Resource Type"
            value={resourceType}
            onChange={(value) => {
              setResourceType(value as ResourceType);
              clearResult();
            }}
            options={[
              { label: "Script tag", value: "script" },
              { label: "Stylesheet link", value: "style" },
              { label: "Raw integrity only", value: "raw" },
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
              { label: "Integrity attribute", value: "attribute" },
              { label: "HTML snippet", value: "html" },
              { label: "All hashes", value: "hashes" },
              { label: "JSON", value: "json" },
              { label: "Markdown table", value: "markdown" },
            ]}
          />

          <div className="md:col-span-2 space-y-3">
            <CheckboxRow
              checked={includeCrossorigin}
              label="Include crossorigin=&quot;anonymous&quot; in HTML snippet"
              onChange={(checked) => {
                setIncludeCrossorigin(checked);
                clearResult();
              }}
            />

            <CheckboxRow
              checked={includeAllHashes}
              label="Include all generated hashes in integrity value"
              onChange={(checked) => {
                setIncludeAllHashes(checked);
                clearResult();
              }}
            />

            <CheckboxRow
              checked={warnAboutDynamicFiles}
              label="Warn about dynamic or frequently changing files"
              onChange={(checked) => {
                setWarnAboutDynamicFiles(checked);
                clearResult();
              }}
            />
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          SRI is useful for fixed CDN scripts and styles. It can break if the remote file changes without updating the integrity hash.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generateSri} className="yoryantra-btn">
          Generate SRI Hash
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
          <SummaryCard label="Input Bytes" value={result.inputBytes.toLocaleString()} />
          <SummaryCard label="Hashes" value={result.hashes.length.toLocaleString()} />
          <SummaryCard label="Recommended" value={result.hashes[0]?.prefix || "sha384"} />
          <SummaryCard label="Issues" value={result.issues.length.toLocaleString()} />
        </div>
      )}

      {result && result.hashes.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Generated Hashes
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Copy the integrity value into your script or stylesheet tag.
          </p>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Algorithm</th>
                  <th className="px-4 py-3 font-semibold">Integrity Value</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {result.hashes.map((hash) => (
                  <tr key={hash.algorithm}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {hash.algorithm}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">
                      <span className="block max-w-[620px] break-words">
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

      {result && result.issues.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            SRI findings
          </h3>

          <div className="mt-3 space-y-3">
            {result.issues.map((issue, index) => (
              <div key={`${issue.title}-${index}`}>
                <p className="text-sm font-semibold text-amber-900">
                  {issue.title}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-amber-800">
                  {issue.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900">
            SRI guidance
          </h3>

          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-blue-900">
                  {note.title}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-blue-800">
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
          {output || "Generated SRI output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        SRI hash generation happens directly in your browser using the Web Crypto API. Your pasted script or stylesheet content is not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Generating Subresource Integrity Hashes for CDN Files
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Subresource Integrity helps browsers verify that an external script or stylesheet has not changed unexpectedly. When you add an integrity attribute, the browser checks the downloaded file against the expected hash before using it.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This SRI Hash Generator creates SHA-256, SHA-384, and SHA-512 integrity values from pasted resource content, then builds ready-to-copy script or stylesheet snippets.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Using the SRI Hash Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste the exact JavaScript or CSS content served by the CDN.</li>
            <li>Enter the resource URL if you want a full HTML snippet.</li>
            <li>Choose SHA-384 for a common secure default, or generate all hashes.</li>
            <li>Copy the integrity attribute or complete script/link tag.</li>
            <li>Update the hash whenever the external file changes.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example SRI Script Tag
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`<script src="https://cdn.example.com/app.min.js"
  integrity="sha384-..."
  crossorigin="anonymous"></script>`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            When SRI Is Useful
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Loading third-party scripts from a CDN.</li>
            <li>Loading shared CSS frameworks from external hosts.</li>
            <li>Pinning a known fixed version of a library.</li>
            <li>Reducing risk from unexpected CDN file changes.</li>
            <li>Improving browser-side supply-chain protection for static resources.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            SRI Works Best With Fixed File Versions
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            SRI hashes are exact. If even one byte changes in the CDN file, the browser rejects the resource. This is good for safety, but it means SRI should usually be used with versioned or pinned files, not URLs that change often.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            If you update a script or stylesheet, regenerate the SRI hash and update the HTML tag at the same time.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <Faq title="What is Subresource Integrity?">
              Subresource Integrity is a browser security feature that checks whether an external script or stylesheet matches a trusted cryptographic hash.
            </Faq>

            <Faq title="Which SRI algorithm should I use?">
              SHA-384 is commonly used and is a good default. SHA-256 and SHA-512 are also supported by modern browsers.
            </Faq>

            <Faq title="Why did my script stop loading after adding SRI?">
              The file served by the CDN probably does not match the pasted content used to generate the hash, or the remote file changed.
            </Faq>

            <Faq title="Should I use crossorigin with SRI?">
              For cross-origin resources, crossorigin=&quot;anonymous&quot; is commonly used with SRI so the browser can perform the integrity check correctly.
            </Faq>

            <Faq title="Is anything uploaded when I generate a hash?">
              No. The hash is generated directly in your browser.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/hash-generator" className="yoryantra-btn-outline">
              Hash Generator
            </Link>

            <Link href="/tools/sha256-generator" className="yoryantra-btn-outline">
              SHA256 Generator
            </Link>

            <Link href="/tools/security-headers-scanner" className="yoryantra-btn-outline">
              Security Headers Scanner
            </Link>

            <Link href="/tools/csp-analyzer" className="yoryantra-btn-outline">
              CSP Analyzer
            </Link>

            <Link href="/tools/csp-report-analyzer" className="yoryantra-btn-outline">
              CSP Report Analyzer
            </Link>
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
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>

      <div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}

function Faq({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900">
        {title}
      </h3>

      <p className="mt-2 text-gray-600 leading-relaxed">
        {children}
      </p>
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
  includeAllHashes: boolean;
  warnAboutDynamicFiles: boolean;
}): Promise<SriResult> {
  const algorithms: HashAlgorithm[] = options.algorithm === "all"
    ? ["SHA-256", "SHA-384", "SHA-512"]
    : [options.algorithm];

  const hashes = await Promise.all(
    algorithms.map((item) => makeSriHash(options.content, item))
  );
  const recommendedIntegrity = options.includeAllHashes
    ? hashes.map((hash) => hash.integrity).join(" ")
    : hashes[0]?.integrity || "";
  const htmlSnippet = makeHtmlSnippet(
    options.resourceUrl,
    recommendedIntegrity,
    options.resourceType,
    options.includeCrossorigin
  );
  const issues = getIssues(options, hashes);
  const inputBytes = new TextEncoder().encode(options.content).length;
  const base = {
    hashes,
    issues,
    inputBytes,
    recommendedIntegrity,
    htmlSnippet,
  };
  const output = formatOutput(base, options.outputMode);

  return {
    ...base,
    output,
  };
}

async function makeSriHash(content: string, algorithm: HashAlgorithm): Promise<SriHash> {
  const bytes = new TextEncoder().encode(content);
  const digest = await crypto.subtle.digest(algorithm, bytes);
  const base64 = arrayBufferToBase64(digest);
  const prefix = algorithmToPrefix(algorithm);

  return {
    algorithm,
    prefix,
    value: base64,
    integrity: `${prefix}-${base64}`,
  };
}

function algorithmToPrefix(algorithm: HashAlgorithm): SriHash["prefix"] {
  if (algorithm === "SHA-256") {
    return "sha256";
  }

  if (algorithm === "SHA-512") {
    return "sha512";
  }

  return "sha384";
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

function makeHtmlSnippet(
  url: string,
  integrity: string,
  type: ResourceType,
  includeCrossorigin: boolean
) {
  const safeUrl = url || "https://cdn.example.com/resource.js";
  const crossorigin = includeCrossorigin ? ' crossorigin="anonymous"' : "";

  if (type === "style") {
    return `<link rel="stylesheet" href="${escapeHtml(safeUrl)}" integrity="${integrity}"${crossorigin} />`;
  }

  if (type === "raw") {
    return integrity;
  }

  return `<script src="${escapeHtml(safeUrl)}" integrity="${integrity}"${crossorigin}></script>`;
}

function getIssues(
  options: {
    content: string;
    resourceUrl: string;
    resourceType: ResourceType;
    warnAboutDynamicFiles: boolean;
  },
  hashes: SriHash[]
): Issue[] {
  const issues: Issue[] = [];

  if (hashes.some((hash) => hash.algorithm === "SHA-256")) {
    issues.push({
      severity: "info",
      title: "SHA-384 is often preferred",
      message: "SHA-256 is supported, but SHA-384 is commonly used for SRI examples and CDN snippets.",
    });
  }

  if (options.warnAboutDynamicFiles && /(latest|current|main|master|nightly|dev|snapshot)/i.test(options.resourceUrl)) {
    issues.push({
      severity: "warning",
      title: "Possibly dynamic resource URL",
      message: "This URL looks like it may change over time. SRI works best with pinned file versions.",
    });
  }

  if (options.resourceUrl && !/^https:\/\//i.test(options.resourceUrl)) {
    issues.push({
      severity: "warning",
      title: "Resource URL is not HTTPS",
      message: "External scripts and styles should usually be loaded over HTTPS.",
    });
  }

  if (options.content.length < 20) {
    issues.push({
      severity: "info",
      title: "Very small input",
      message: "The pasted resource content is very short. Confirm you pasted the full final file content.",
    });
  }

  if (issues.length === 0) {
    issues.push({
      severity: "info",
      title: "SRI hash generated",
      message: "Copy the integrity value into the matching script or stylesheet tag.",
    });
  }

  return issues;
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
      "| Algorithm | Integrity |",
      "| --- | --- |",
      ...result.hashes.map((hash) => `| ${hash.algorithm} | ${hash.integrity} |`),
    ].join("\n");
  }

  return result.recommendedIntegrity;
}

function getNotes(result: SriResult) {
  const notes: { title: string; message: string }[] = [];

  notes.push({
    title: "Hash must match exact content",
    message: "SRI checks the exact bytes delivered to the browser. Minification, CDN updates, or different line endings can change the hash.",
  });

  if (result.recommendedIntegrity.includes("sha384")) {
    notes.push({
      title: "SHA-384 selected",
      message: "SHA-384 is a common practical default for SRI snippets.",
    });
  }

  return notes;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
