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

    try {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate this header safely.");
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
      description="Build attachment or inline Content-Disposition values with an ASCII fallback, UTF-8 filename*, and response snippets."
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
                { label: "Nginx directives", value: "nginx" },
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
        <button onClick={generateHeader} className="yoryantra-btn whitespace-nowrap">
          Generate Header
        </button>

        <button onClick={copyOutput} className="yoryantra-btn whitespace-nowrap" disabled={!output}>
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
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Disposition" value={dispositionType} />
          <SummaryCard label="Preview Mode" value={result.previewMode} />
          <SummaryCard label="ASCII Fallback" value={result.asciiFilename} />
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
            {(filenameMode === "both" || filenameMode === "utf8Only") && includeUtf8Filename && (
              <InfoRow label="Encoded filename*" value={result.encodedFilename || "not used"} />
            )}
          </div>
        </div>
      )}

      {result && result.issues.length > 0 && (
        <IssuePanel title="Header findings" issues={result.issues} />
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Download header guidance</h3>

          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-gray-900">{note.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{note.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Output</h3>

          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline whitespace-nowrap text-sm">
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
          <h2 className="text-2xl font-semibold text-gray-900">The filename is a suggestion to the recipient</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            <code>Content-Disposition</code> can suggest whether a representation is handled inline or offered as a download, and a <code>filename</code> parameter can suggest the name shown to the user. Neither value grants permission to write to a path or proves that the extension is safe for the received bytes.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Receiving software should discard directory components, avoid special filesystem names, and treat the supplied name as advisory. Those recipient-side safety points come directly from <a className="font-medium text-gray-900 underline underline-offset-4" href="https://www.rfc-editor.org/rfc/rfc6266" target="_blank" rel="noreferrer">RFC 6266</a> rather than from filename cosmetics.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Use <code>filename*</code> when the real name needs UTF-8</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A quoted <code>filename</code> works best as a conservative ASCII fallback. <code>filename*</code> uses the extended parameter syntax defined by <a className="font-medium text-gray-900 underline underline-offset-4" href="https://www.rfc-editor.org/rfc/rfc8187" target="_blank" rel="noreferrer">RFC 8187</a>, so a UTF-8 name can be represented without placing arbitrary Unicode directly in the legacy quoted parameter.
          </p>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Content-Disposition: attachment; filename="report-euro.pdf"; filename*=UTF-8''report-%E2%82%AC.pdf`}
            </pre>
          </div>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Sending both parameters gives older recipients a readable fallback while newer ones can prefer the UTF-8 value. Extended values use percent encoding, so a space becomes <code>%20</code>; form-style <code>+</code> encoding does not belong here.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Inline and attachment change presentation, not content safety</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            <code>attachment</code> asks the recipient to present a save flow instead of normal inline processing. <code>inline</code> leaves normal handling in place. Browser preview still depends on the actual media type, the bytes in the response, browser capabilities, and surrounding response headers.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A valid disposition value does not make user-supplied HTML, SVG, scripts, or other active content trustworthy. Authorization, content validation, an accurate <code>Content-Type</code>, and an appropriate serving policy still belong to the application.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Keep untrusted names out of raw header syntax</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Filenames arriving from forms, databases, object stores, or external APIs may contain path separators, control characters, or line breaks. Carriage return and line feed characters must never be allowed to cross from filename data into response-header syntax.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            With sanitization enabled, the generator replaces unsafe separators and control characters before building the field. With sanitization disabled, control characters are rejected instead of being emitted. That boundary is intentional: “raw” output should not mean “permit header injection.”
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">The server snippets stop at setting headers</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Express, Next.js, and Nginx examples only show the response-header portion. They do not open or stream a file, authorize the request, verify the media type, choose cache policy, or confirm that the generated filename matches the stored object. Keep those decisions in the surrounding server code.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/content-disposition-header-generator" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function IssuePanel({ title, issues }: { title: string; issues: Issue[] }) {
  return (
    <div className="mt-6 space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {issues.map((issue, index) => {
        const classes = issue.severity === "high"
          ? "border-red-200 bg-red-50 text-red-700"
          : issue.severity === "warning"
            ? "border-amber-200 bg-amber-50 text-amber-800"
            : "border-gray-200 bg-gray-50 text-gray-600";
        return (
          <div key={`${issue.title}-${index}`} className={`self-start rounded-xl border p-4 ${classes}`}>
            <p className="text-sm font-semibold text-gray-900">{issue.title}</p>
            <p className="mt-1 text-sm leading-relaxed">{issue.message}</p>
          </div>
        );
      })}
    </div>
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
        className="min-h-[54px] w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--light-gold)]"
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
  if (!options.sanitizeFilename && /[\r\n\u0000-\u001F\u007F]/.test(originalFilename)) {
    throw new Error("Filename contains control characters. Enable sanitization or remove them before generating a header.");
  }
  const sanitizedFilename = options.sanitizeFilename ? sanitizeForHeader(originalFilename) : originalFilename;
  const asciiFallback = buildAsciiFallback(options.fallbackFilename.trim() || sanitizedFilename);
  const encodedFilename = encodeRfc8187Value(sanitizedFilename);
  const contentType = options.includeContentType
    ? (options.contentTypePreset === "custom" ? validateContentType(options.customContentType) : contentTypes[options.contentTypePreset])
    : "";
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
  const output = formatOutput(base, options.outputMode, contentType, options.includeContentType);

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

function encodeRfc8187Value(value: string) {
  return encodeURIComponent(value)
    .replace(/['()]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)
    .replace(/\*/g, "%2A");
}

function escapeQuotedHeader(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
}

function validateContentType(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/[\r\n\u0000-\u001F\u007F]/.test(trimmed)) {
    throw new Error("Custom Content-Type cannot contain control characters or line breaks.");
  }
  if (!/^[!#$%&'*+.^_`|~0-9A-Za-z-]+\/[!#$%&'*+.^_`|~0-9A-Za-z-]+(?:\s*;\s*[!#$%&'*+.^_`|~0-9A-Za-z-]+=(?:[!#$%&'*+.^_`|~0-9A-Za-z-]+|"[^"\r\n]*"))*$/.test(trimmed)) {
    throw new Error("Custom Content-Type must be a valid media type, for example application/example+json.");
  }
  return trimmed;
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

function formatOutput(result: Omit<Result, "output">, mode: OutputMode, contentType: string, includeContentType: boolean) {
  const emittedContentType = includeContentType ? contentType : "";

  if (mode === "json") {
    return JSON.stringify({
      contentDisposition: result.headerValue,
      contentType: emittedContentType,
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
      emittedContentType ? `res.setHeader("Content-Type", "${escapeJs(emittedContentType)}");` : "",
      "res.send(fileBuffer);",
    ].filter(Boolean).join("\n");
  }

  if (mode === "nextjs") {
    return [
      "return new Response(fileBuffer, {",
      "  headers: {",
      `    "Content-Disposition": "${escapeJs(result.headerValue)}",`,
      emittedContentType ? `    "Content-Type": "${escapeJs(emittedContentType)}",` : "",
      "  },",
      "});",
    ].filter(Boolean).join("\n");
  }

  if (mode === "nginx") {
    return [
      `add_header Content-Disposition '${result.headerValue.replace(/'/g, "\\'")}';`,
      emittedContentType ? `types { ${emittedContentType} ${extensionFromFilename(result.asciiFilename)}; }` : "",
    ].filter(Boolean).join("\n");
  }

  if (mode === "markdown") {
    return [
      "| Field | Value |",
      "| --- | --- |",
      `| Content-Disposition | ${escapeMarkdown(result.headerValue)} |`,
      `| Content-Type | ${escapeMarkdown(emittedContentType || "not set")} |`,
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
