"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type DispositionType = "attachment" | "inline";
type OutputMode = "header" | "headersBlock" | "express" | "nextjs" | "nginx" | "json" | "markdown";
type FilenameMode = "both" | "asciiOnly" | "utf8Only";
type ContentTypePreset =
  | "pdf"
  | "csv"
  | "json"
  | "zip"
  | "png"
  | "xlsx"
  | "text"
  | "octet"
  | "custom";

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type Result = {
  output: string;
  headerValue: string;
  contentDispositionLine: string;
  contentTypeLine: string;
  asciiFilename: string;
  encodedFilename: string;
  issues: Issue[];
  previewMode: string;
};

const contentTypes: Record<ContentTypePreset, string> = {
  pdf: "application/pdf",
  csv: "text/csv; charset=utf-8",
  json: "application/json; charset=utf-8",
  zip: "application/zip",
  png: "image/png",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  text: "text/plain; charset=utf-8",
  octet: "application/octet-stream",
  custom: "",
};

export default function ToolClient() {
  const [filename, setFilename] = useState("");
  const [fallbackFilename, setFallbackFilename] = useState("");
  const [dispositionType, setDispositionType] = useState<DispositionType>("attachment");
  const [filenameMode, setFilenameMode] = useState<FilenameMode>("both");
  const [contentTypePreset, setContentTypePreset] = useState<ContentTypePreset>("pdf");
  const [customContentType, setCustomContentType] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("header");
  const [includeContentType, setIncludeContentType] = useState(true);
  const [sanitizeFilename, setSanitizeFilename] = useState(true);
  const [includeUtf8Filename, setIncludeUtf8Filename] = useState(true);
  const [includeAsciiFallback, setIncludeAsciiFallback] = useState(true);
  const [warnInlineRisk, setWarnInlineRisk] = useState(true);
  const [result, setResult] = useState<Result | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getNotes(result, dispositionType) : []), [result, dispositionType]);

  const clearResult = () => {
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const generateHeader = () => {
    if (!filename.trim()) {
      setError("Please enter a filename.");
      setResult(null);
      setOutput("");
      return;
    }

    const next = buildContentDisposition({
      filename,
      fallbackFilename,
      dispositionType,
      filenameMode,
      contentTypePreset,
      customContentType,
      outputMode,
      includeContentType,
      sanitizeFilename,
      includeUtf8Filename,
      includeAsciiFallback,
      warnInlineRisk,
    });

    setResult(next);
    setOutput(next.output);
    setError("");
    setCopied(false);
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
    setFilename("Invoice June 2026 – ग्राहक.pdf");
    setFallbackFilename("invoice-june-2026.pdf");
    setDispositionType("attachment");
    setFilenameMode("both");
    setContentTypePreset("pdf");
    setCustomContentType("");
    setOutputMode("header");
    setIncludeContentType(true);
    setSanitizeFilename(true);
    setIncludeUtf8Filename(true);
    setIncludeAsciiFallback(true);
    setWarnInlineRisk(true);
    clearResult();
  };

  const resetAll = () => {
    setFilename("");
    setFallbackFilename("");
    setDispositionType("attachment");
    setFilenameMode("both");
    setContentTypePreset("pdf");
    setCustomContentType("");
    setOutputMode("header");
    setIncludeContentType(true);
    setSanitizeFilename(true);
    setIncludeUtf8Filename(true);
    setIncludeAsciiFallback(true);
    setWarnInlineRisk(true);
    clearResult();
  };

  const activeContentType = contentTypePreset === "custom" ? customContentType : contentTypes[contentTypePreset];

  return (
    <ToolShell
      title="Content-Disposition Header Generator"
      description="Generate Content-Disposition headers for file downloads and inline previews. Build attachment and inline headers with safe filenames, UTF-8 filename*, ASCII fallback, and server snippets."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">File Details</h3>

          <div className="mt-4 space-y-4">
            <InputField
              label="Filename"
              value={filename}
              onChange={(value) => {
                setFilename(value);
                clearResult();
              }}
              placeholder="invoice-june-2026.pdf"
            />

            <InputField
              label="ASCII Fallback Filename"
              value={fallbackFilename}
              onChange={(value) => {
                setFallbackFilename(value);
                clearResult();
              }}
              placeholder="invoice-june-2026.pdf"
            />

            <YoryantraSelect
              label="Disposition"
              value={dispositionType}
              onChange={(value) => {
                setDispositionType(value as DispositionType);
                clearResult();
              }}
              options={[
                { label: "Attachment / download", value: "attachment" },
                { label: "Inline / preview", value: "inline" },
              ]}
            />

            <YoryantraSelect
              label="Filename Format"
              value={filenameMode}
              onChange={(value) => {
                setFilenameMode(value as FilenameMode);
                clearResult();
              }}
              options={[
                { label: "ASCII fallback + UTF-8 filename*", value: "both" },
                { label: "ASCII filename only", value: "asciiOnly" },
                { label: "UTF-8 filename* only", value: "utf8Only" },
              ]}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Response Options</h3>

          <div className="mt-4 space-y-4">
            <YoryantraSelect
              label="Content Type"
              value={contentTypePreset}
              onChange={(value) => {
                setContentTypePreset(value as ContentTypePreset);
                clearResult();
              }}
              options={[
                { label: "PDF", value: "pdf" },
                { label: "CSV", value: "csv" },
                { label: "JSON", value: "json" },
                { label: "ZIP", value: "zip" },
                { label: "PNG image", value: "png" },
                { label: "Excel XLSX", value: "xlsx" },
                { label: "Text file", value: "text" },
                { label: "Octet stream", value: "octet" },
                { label: "Custom", value: "custom" },
              ]}
            />

            {contentTypePreset === "custom" && (
              <InputField
                label="Custom Content-Type"
                value={customContentType}
                onChange={(value) => {
                  setCustomContentType(value);
                  clearResult();
                }}
                placeholder="application/vnd.example+json"
              />
            )}

            <YoryantraSelect
              label="Output"
              value={outputMode}
              onChange={(value) => {
                setOutputMode(value as OutputMode);
                clearResult();
              }}
              options={[
                { label: "Header only", value: "header" },
                { label: "Headers block", value: "headersBlock" },
                { label: "Node / Express", value: "express" },
                { label: "Next.js route handler", value: "nextjs" },
                { label: "Nginx add_header", value: "nginx" },
                { label: "JSON", value: "json" },
                { label: "Markdown notes", value: "markdown" },
              ]}
            />

            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
              <p className="text-sm font-medium text-gray-700">Selected Content-Type</p>
              <p className={`mt-1 break-words font-mono text-sm ${
                contentTypePreset === "custom" && customContentType.trim()
                  ? "text-gray-900"
                  : "text-gray-500"
              }`}>
                {activeContentType || "not set"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>

        <div className="mt-4 space-y-3">
          <CheckboxRow checked={includeContentType} label="Include Content-Type line" onChange={(checked) => { setIncludeContentType(checked); clearResult(); }} />
          <CheckboxRow checked={sanitizeFilename} label="Sanitize filename characters" onChange={(checked) => { setSanitizeFilename(checked); clearResult(); }} />
          <CheckboxRow checked={includeAsciiFallback} label="Include ASCII filename fallback when available" onChange={(checked) => { setIncludeAsciiFallback(checked); clearResult(); }} />
          <CheckboxRow checked={includeUtf8Filename} label="Include UTF-8 filename* when useful" onChange={(checked) => { setIncludeUtf8Filename(checked); clearResult(); }} />
          <CheckboxRow checked={warnInlineRisk} label="Warn about inline rendering risks" onChange={(checked) => { setWarnInlineRisk(checked); clearResult(); }} />
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Use attachment for forced downloads and inline when the browser should try to preview the file.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generateHeader} className="yoryantra-btn">
          Generate Header
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
          <SummaryCard label="Disposition" value={dispositionType} />
          <SummaryCard label="Preview Mode" value={result.previewMode} />
          <SummaryCard label="ASCII Filename" value={result.asciiFilename} />
          <SummaryCard label="Findings" value={result.issues.length.toLocaleString()} />
        </div>
      )}

      {result && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Header Preview</h3>

          <div className="mt-4 space-y-3">
            <InfoRow label="Content-Disposition" value={result.headerValue} />
            {includeContentType && result.contentTypeLine && (
              <InfoRow label="Content-Type" value={activeContentType} />
            )}
            <InfoRow label="Encoded filename*" value={result.encodedFilename || "not used"} />
          </div>
        </div>
      )}

      {result && result.issues.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">Header findings</h3>

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
          <h3 className="text-sm font-semibold text-blue-900">Download header guidance</h3>

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

        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">
          {output || "Generated Content-Disposition output will appear here."}
        </pre>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Generating Safe File Download Headers</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Content-Disposition tells browsers whether a response should be downloaded as a file or displayed inline. It also controls the filename suggested to the user when saving a file.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Content-Disposition Header Generator builds safe attachment and inline headers with ASCII fallback filenames, UTF-8 filename* support, and practical server snippets.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Using the Content-Disposition Header Generator</h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter the filename you want users to see.</li>
            <li>Choose attachment for downloads or inline for browser previews.</li>
            <li>Select a content type and filename format.</li>
            <li>Review the generated header and warnings.</li>
            <li>Copy the header, headers block, or server snippet.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Attachment vs Inline</h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li><strong>attachment</strong> asks the browser to download the response as a file.</li>
            <li><strong>inline</strong> allows the browser to preview the file when it supports that media type.</li>
            <li><strong>filename</strong> is the simpler ASCII filename fallback.</li>
            <li><strong>filename*</strong> is useful for UTF-8 names with spaces or non-English characters.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example Content-Disposition Header</h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Content-Disposition: attachment; filename="invoice-june-2026.pdf"; filename*=UTF-8''invoice-june-2026.pdf
Content-Type: application/pdf`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Filenames Should Be Treated Carefully</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Filenames can contain spaces, quotes, path separators, Unicode characters, or unsafe characters. For API responses, it is safer to sanitize filenames and provide a simple fallback filename.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Never place untrusted user input into response headers without validation and escaping.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>

          <div className="mt-5 space-y-6">
            <Faq title="What does a Content-Disposition header do?">
              It tells the browser whether to download a response as a file or display it inline, and it can suggest a filename.
            </Faq>

            <Faq title="Should I use attachment or inline?">
              Use attachment for forced downloads. Use inline when browser preview is desired, such as PDFs or images.
            </Faq>

            <Faq title="What is filename*?">
              filename* allows UTF-8 encoded filenames and is useful for names with spaces or non-English characters.
            </Faq>

            <Faq title="Should I include Content-Type too?">
              Yes. Content-Type helps the browser understand the file type and decide whether it can preview it safely.
            </Faq>

            <Faq title="Is anything uploaded when I generate headers?">
              No. The header is generated directly in your browser.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/content-disposition-header-generator" />
        </div>
      </section>
    </ToolShell>
  );
}

function InputField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-gray-700">{label}</label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-[54px] w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 break-words font-mono text-sm text-gray-900">{value}</p>
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

function buildContentDisposition(options: {
  filename: string;
  fallbackFilename: string;
  dispositionType: DispositionType;
  filenameMode: FilenameMode;
  contentTypePreset: ContentTypePreset;
  customContentType: string;
  outputMode: OutputMode;
  includeContentType: boolean;
  sanitizeFilename: boolean;
  includeUtf8Filename: boolean;
  includeAsciiFallback: boolean;
  warnInlineRisk: boolean;
}): Result {
  const originalFilename = options.filename.trim();
  const sanitizedFilename = options.sanitizeFilename ? sanitizeForHeader(originalFilename) : originalFilename;
  const asciiFallback = buildAsciiFallback(options.fallbackFilename.trim() || sanitizedFilename);
  const encodedFilename = encodeRfc5987Value(sanitizedFilename);
  const contentType = options.contentTypePreset === "custom" ? options.customContentType.trim() : contentTypes[options.contentTypePreset];
  const parts: string[] = [options.dispositionType];

  if ((options.filenameMode === "both" || options.filenameMode === "asciiOnly") && options.includeAsciiFallback) {
    parts.push(`filename="${escapeQuotedHeader(asciiFallback)}"`);
  }

  if ((options.filenameMode === "both" || options.filenameMode === "utf8Only") && options.includeUtf8Filename) {
    parts.push(`filename*=UTF-8''${encodedFilename}`);
  }

  const headerValue = parts.join("; ");
  const contentDispositionLine = `Content-Disposition: ${headerValue}`;
  const contentTypeLine = contentType && options.includeContentType ? `Content-Type: ${contentType}` : "";
  const issues = buildIssues({
    originalFilename,
    sanitizedFilename,
    asciiFallback,
    encodedFilename,
    contentType,
    options,
  });
  const base = {
    headerValue,
    contentDispositionLine,
    contentTypeLine,
    asciiFilename: asciiFallback,
    encodedFilename,
    issues,
    previewMode: options.dispositionType === "inline" ? "browser may preview" : "download suggested",
  };
  const output = formatOutput(base, options.outputMode, contentType);

  return {
    ...base,
    output,
  };
}

function sanitizeForHeader(value: string) {
  return value
    .replace(/[\r\n]/g, " ")
    .replace(/[\\/]+/g, "-")
    .replace(/[<>:"|?*\u0000-\u001F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildAsciiFallback(value: string) {
  const fallback = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/[\\/]+/g, "-")
    .replace(/[<>:"|?*]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .trim();

  return fallback || "download";
}

function encodeRfc5987Value(value: string) {
  return encodeURIComponent(value)
    .replace(/['()]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)
    .replace(/\*/g, "%2A");
}

function escapeQuotedHeader(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
}

function buildIssues(params: {
  originalFilename: string;
  sanitizedFilename: string;
  asciiFallback: string;
  encodedFilename: string;
  contentType: string;
  options: {
    dispositionType: DispositionType;
    filenameMode: FilenameMode;
    includeContentType: boolean;
    warnInlineRisk: boolean;
  };
}) {
  const issues: Issue[] = [];

  if (params.originalFilename !== params.sanitizedFilename) {
    issues.push({
      severity: "info",
      title: "Filename was sanitized",
      message: "Unsafe header characters, path separators, or control characters were removed or replaced.",
    });
  }

  if (params.asciiFallback !== params.sanitizedFilename) {
    issues.push({
      severity: "info",
      title: "ASCII fallback differs from display filename",
      message: "A simpler ASCII filename is useful for older clients and safer fallback behavior.",
    });
  }

  if (!params.contentType && params.options.includeContentType) {
    issues.push({
      severity: "warning",
      title: "Content-Type is missing",
      message: "Content-Type helps browsers handle the response correctly.",
    });
  }

  if (params.options.warnInlineRisk && params.options.dispositionType === "inline") {
    issues.push({
      severity: "info",
      title: "Inline rendering should be intentional",
      message: "Inline files may be previewed by the browser. Use attachment when forced download is safer.",
    });
  }

  if (params.options.filenameMode === "utf8Only") {
    issues.push({
      severity: "info",
      title: "No ASCII fallback filename",
      message: "UTF-8 filename* is useful, but an ASCII filename fallback can improve compatibility.",
    });
  }

  if (issues.length === 0) {
    issues.push({
      severity: "info",
      title: "Header generated",
      message: "The Content-Disposition header looks ready for the selected output style.",
    });
  }

  return issues;
}

function formatOutput(result: Omit<Result, "output">, mode: OutputMode, contentType: string) {
  if (mode === "json") {
    return JSON.stringify({
      contentDisposition: result.headerValue,
      contentType,
      asciiFilename: result.asciiFilename,
      encodedFilename: result.encodedFilename,
      issues: result.issues,
    }, null, 2);
  }

  if (mode === "headersBlock") {
    return [result.contentDispositionLine, result.contentTypeLine].filter(Boolean).join("\n");
  }

  if (mode === "express") {
    return [
      `res.setHeader("Content-Disposition", "${escapeJs(result.headerValue)}");`,
      contentType ? `res.setHeader("Content-Type", "${escapeJs(contentType)}");` : "",
      "res.send(fileBuffer);",
    ].filter(Boolean).join("\n");
  }

  if (mode === "nextjs") {
    return [
      "return new Response(fileBuffer, {",
      "  headers: {",
      `    "Content-Disposition": "${escapeJs(result.headerValue)}",`,
      contentType ? `    "Content-Type": "${escapeJs(contentType)}",` : "",
      "  },",
      "});",
    ].filter(Boolean).join("\n");
  }

  if (mode === "nginx") {
    return [
      `add_header Content-Disposition '${result.headerValue.replace(/'/g, "\\'")}';`,
      contentType ? `types { ${contentType} ${extensionFromFilename(result.asciiFilename)}; }` : "",
    ].filter(Boolean).join("\n");
  }

  if (mode === "markdown") {
    return [
      "| Field | Value |",
      "| --- | --- |",
      `| Content-Disposition | ${escapeMarkdown(result.headerValue)} |`,
      `| Content-Type | ${escapeMarkdown(contentType || "not set")} |`,
      `| ASCII filename | ${escapeMarkdown(result.asciiFilename)} |`,
      `| filename* | ${escapeMarkdown(result.encodedFilename)} |`,
      "",
      "## Findings",
      ...result.issues.map((issue) => `- **${issue.title}:** ${issue.message}`),
    ].join("\n");
  }

  return result.contentDispositionLine;
}

function extensionFromFilename(filename: string) {
  const match = filename.match(/\.([a-z0-9]+)$/i);
  return match ? match[1] : "bin";
}

function escapeJs(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, "\\n");
}

function getNotes(result: Result, dispositionType: DispositionType) {
  const notes: { title: string; message: string }[] = [];

  if (dispositionType === "attachment") {
    notes.push({
      title: "Attachment is best for forced downloads",
      message: "Use attachment when you want the browser to save the response as a file.",
    });
  }

  if (dispositionType === "inline") {
    notes.push({
      title: "Inline depends on browser support",
      message: "The browser may preview PDFs, images, and text files inline, but unsupported files may still download.",
    });
  }

  notes.push({
    title: "Validate filenames server-side",
    message: "Never place untrusted user input into response headers without validation, sanitization, and escaping.",
  });

  return notes;
}
