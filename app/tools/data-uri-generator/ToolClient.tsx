"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type InputKind = "text" | "svg" | "html" | "css" | "json";
type EncodingMode = "percent" | "base64";
type OutputMode = "dataUri" | "htmlLink" | "htmlImg" | "cssUrl" | "json";
type CharsetMode = "include" | "omit";

type DataUriResult = {
  inputKind: InputKind;
  mimeType: string;
  charset: string;
  encodingMode: EncodingMode;
  sourceLength: number;
  outputLength: number;
  dataUri: string;
  previewSafe: boolean;
  warnings: string[];
};

type DataUriNote = {
  title: string;
  message: string;
};

const examples: Record<InputKind, string> = {
  text: "Hello from Yoryantra",
  svg: `<svg width="180" height="90" viewBox="0 0 180 90" xmlns="http://www.w3.org/2000/svg">
  <rect width="180" height="90" rx="14" fill="#12633A"/>
  <circle cx="48" cy="45" r="18" fill="#D6A84C"/>
  <text x="100" y="51" text-anchor="middle" font-size="16" font-family="Arial" fill="#ffffff">Data URI</text>
</svg>`,
  html: `<strong>Hello</strong> from <em>Yoryantra</em>`,
  css: `body {
  font-family: system-ui, sans-serif;
  color: #12633A;
}`,
  json: `{
  "name": "Yoryantra",
  "type": "utility"
}`,
};

const mimeByKind: Record<InputKind, string> = {
  text: "text/plain",
  svg: "image/svg+xml",
  html: "text/html",
  css: "text/css",
  json: "application/json",
};

export default function ToolClient() {
  const [inputKind, setInputKind] = useState<InputKind>("svg");
  const [input, setInput] = useState("");
  const [mimeType, setMimeType] = useState("image/svg+xml");
  const [encodingMode, setEncodingMode] = useState<EncodingMode>("percent");
  const [outputMode, setOutputMode] = useState<OutputMode>("dataUri");
  const [charsetMode, setCharsetMode] = useState<CharsetMode>("include");
  const [charset, setCharset] = useState("utf-8");
  const [trimInput, setTrimInput] = useState(true);
  const [result, setResult] = useState<DataUriResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getDataUriNotes(result) : []), [result]);

  const generateDataUri = () => {
    if (!input.trim()) {
      setError("Please enter text, SVG, HTML, CSS, or JSON to convert into a data URI.");
      setResult(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const nextResult = buildDataUri({
        input,
        inputKind,
        mimeType,
        charset,
        charsetMode,
        encodingMode,
        trimInput,
      });

      const nextOutput = formatOutput(nextResult, {
        outputMode,
      });

      setResult(nextResult);
      setOutput(nextOutput);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate this data URI."
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
    const nextKind: InputKind = "svg";
    setInputKind(nextKind);
    setInput(examples[nextKind]);
    setMimeType(mimeByKind[nextKind]);
    setEncodingMode("percent");
    setOutputMode("dataUri");
    setCharsetMode("include");
    setCharset("utf-8");
    setTrimInput(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setInputKind("svg");
    setInput("");
    setMimeType("image/svg+xml");
    setEncodingMode("percent");
    setOutputMode("dataUri");
    setCharsetMode("include");
    setCharset("utf-8");
    setTrimInput(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const changeKind = (value: InputKind) => {
    setInputKind(value);
    setMimeType(mimeByKind[value]);
    setInput(examples[value]);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="Data URI Generator"
      description="Generate data URIs from text, SVG, HTML, CSS, JSON, and small snippets. Choose MIME type, encoding style, Base64 output, and preview data URLs directly in your browser."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Source Content
        </label>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setResult(null);
            setOutput("");
            setError("");
            setCopied(false);
          }}
          placeholder={examples.svg}
          className="w-full min-h-[360px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste text, SVG, HTML, CSS, or JSON. This works best for small snippets,
          icons, examples, and test data.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Options
        </h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Content Type"
            value={inputKind}
            onChange={(value) => changeKind(value as InputKind)}
            options={[
              {
                label: "SVG",
                value: "svg",
              },
              {
                label: "Plain text",
                value: "text",
              },
              {
                label: "HTML",
                value: "html",
              },
              {
                label: "CSS",
                value: "css",
              },
              {
                label: "JSON",
                value: "json",
              },
            ]}
          />

          <YoryantraSelect
            label="Encoding"
            value={encodingMode}
            onChange={(value) => {
              setEncodingMode(value as EncodingMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              {
                label: "Percent encoded",
                value: "percent",
              },
              {
                label: "Base64",
                value: "base64",
              },
            ]}
          />

          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value) => {
              setOutputMode(value as OutputMode);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              {
                label: "Data URI",
                value: "dataUri",
              },
              {
                label: "HTML link",
                value: "htmlLink",
              },
              {
                label: "HTML image",
                value: "htmlImg",
              },
              {
                label: "CSS url()",
                value: "cssUrl",
              },
              {
                label: "JSON",
                value: "json",
              },
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700">
              MIME Type
            </label>

            <input
              value={mimeType}
              onChange={(event) => {
                setMimeType(event.target.value);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              placeholder="image/svg+xml"
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
          </div>

          <YoryantraSelect
            label="Charset"
            value={charsetMode}
            onChange={(value) => {
              setCharsetMode(value as CharsetMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              {
                label: "Include charset",
                value: "include",
              },
              {
                label: "Omit charset",
                value: "omit",
              },
            ]}
          />

          {charsetMode === "include" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Charset Value
              </label>

              <input
                value={charset}
                onChange={(event) => {
                  setCharset(event.target.value);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                placeholder="utf-8"
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />
            </div>
          )}

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={trimInput}
              onChange={(event) => {
                setTrimInput(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Trim leading and trailing whitespace
          </label>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Percent encoding is often readable for SVG and text. Base64 is useful
          when the content has many special characters.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generateDataUri} className="yoryantra-btn">
          Generate Data URI
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
          <SummaryCard label="MIME Type" value={result.mimeType} />
          <SummaryCard label="Encoding" value={result.encodingMode} />
          <SummaryCard
            label="Source Length"
            value={result.sourceLength.toLocaleString()}
          />
          <SummaryCard
            label="Output Length"
            value={result.outputLength.toLocaleString()}
          />
        </div>
      )}

      {result && result.previewSafe && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Preview
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Browser preview for supported data URI content.
          </p>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
            {inputKind === "svg" ? (
              <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-gray-200 bg-white p-4">
                <img
                  src={result.dataUri}
                  alt="Data URI preview"
                  className="max-h-[260px] max-w-full rounded-lg object-contain"
                />
              </div>
            ) : (
              <iframe
                title="Data URI preview"
                src={result.dataUri}
                className="h-[240px] w-full rounded-xl border border-gray-200 bg-white"
              />
            )}
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Data URI notes
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
            <button
              onClick={copyOutput}
              className="yoryantra-btn-outline text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">
          {output || "Generated data URI output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Data URI generation happens directly in your browser. Your pasted content
        is not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Creating Data URIs for Small Snippets
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A data URI lets you place small content directly inside a URL. It can
            hold plain text, SVG, HTML, CSS, JSON, images, and other content
            types. This is useful when you need a tiny self-contained asset or a
            quick test value.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Data URI Generator creates clean data URLs from source content.
            You can choose the MIME type, charset, percent encoding, Base64
            output, and copy the result as a raw data URI, HTML tag, CSS url(),
            or JSON object.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Generating a Data URL
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste the text, SVG, HTML, CSS, or JSON source content.</li>
            <li>Choose the content type and MIME type.</li>
            <li>Select percent encoding or Base64 encoding.</li>
            <li>Pick the output format you want to copy.</li>
            <li>Review the preview and copy the generated data URI.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Data URI Generator Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Embedding a small SVG icon in CSS or HTML.</li>
            <li>Creating a quick data URL for testing browser behavior.</li>
            <li>Preparing small HTML or text examples for documentation.</li>
            <li>Converting a CSS snippet into a data URL for experiments.</li>
            <li>Building tiny self-contained examples for bug reports.</li>
            <li>Comparing percent encoding and Base64 output size.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Data URI
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`data:text/plain;charset=utf-8,Hello%20from%20Yoryantra`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Data URIs Are Best for Small Content
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Data URIs are convenient, but they can make HTML and CSS heavier when
            the content is large. A small SVG or short text snippet is usually
            fine. A large image, long document, or big JSON file is usually
            better kept as a separate file.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Use data URIs for small assets, examples, experiments, and quick
            testing. For production pages, check performance and caching before
            inlining too much content.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is a data URI?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A data URI is a URL that contains the content itself, such as
                text, SVG, HTML, CSS, JSON, or Base64 data.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Should I use percent encoding or Base64?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Percent encoding is often readable for text and SVG. Base64 is
                useful when the content has many special characters or binary-like
                data.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this create SVG data URIs?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Choose SVG content type, paste the SVG, and generate a
                percent-encoded or Base64 data URI.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are data URIs good for large files?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Usually no. Data URIs are better for small snippets and small
                assets. Large files should normally stay as separate files.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my content uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The data URI is generated directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/base64-image-encoder-decoder" className="yoryantra-btn-outline">
              Base64 Image Encoder Decoder
            </Link>

            <Link href="/tools/base64-encoder-decoder" className="yoryantra-btn-outline">
              Base64 Encoder Decoder
            </Link>

            <Link href="/tools/url-query-encoder-decoder" className="yoryantra-btn-outline">
              URL Query Encoder Decoder
            </Link>

            <Link href="/tools/html-encoder-decoder" className="yoryantra-btn-outline">
              HTML Encoder Decoder
            </Link>

            <Link href="/tools/svg-optimizer" className="yoryantra-btn-outline">
              SVG Optimizer
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
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

function buildDataUri({
  input,
  inputKind,
  mimeType,
  charset,
  charsetMode,
  encodingMode,
  trimInput,
}: {
  input: string;
  inputKind: InputKind;
  mimeType: string;
  charset: string;
  charsetMode: CharsetMode;
  encodingMode: EncodingMode;
  trimInput: boolean;
}): DataUriResult {
  const source = trimInput ? input.trim() : input;
  const cleanMime = mimeType.trim() || mimeByKind[inputKind];
  const cleanCharset = charset.trim() || "utf-8";
  const metaParts = [cleanMime];

  if (charsetMode === "include" && cleanCharset) {
    metaParts.push(`charset=${cleanCharset}`);
  }

  let encodedContent = "";
  const warnings: string[] = [];

  if (encodingMode === "base64") {
    metaParts.push("base64");
    encodedContent = encodeBase64(source);
  } else {
    encodedContent = encodeDataUriComponent(source, inputKind);
  }

  const dataUri = `data:${metaParts.join(";")},${encodedContent}`;
  const previewSafe = ["text", "svg", "html"].includes(inputKind);

  if (source.length > 2000) {
    warnings.push("The source content is long. Data URIs are usually best for small snippets.");
  }

  if (dataUri.length > source.length * 1.5 && source.length > 200) {
    warnings.push("The data URI is much longer than the source content. This is normal, but check whether inline use is still worth it.");
  }

  if (inputKind === "html") {
    warnings.push("HTML data URIs can execute markup in some contexts. Use only trusted content.");
  }

  return {
    inputKind,
    mimeType: cleanMime,
    charset: cleanCharset,
    encodingMode,
    sourceLength: source.length,
    outputLength: dataUri.length,
    dataUri,
    previewSafe,
    warnings,
  };
}

function formatOutput(
  result: DataUriResult,
  options: {
    outputMode: OutputMode;
  }
) {
  if (options.outputMode === "json") {
    return JSON.stringify(result, null, 2);
  }

  if (options.outputMode === "htmlLink") {
    return `<a href="${result.dataUri}">Open data URI</a>`;
  }

  if (options.outputMode === "htmlImg") {
    return `<img src="${result.dataUri}" alt="Data URI image" />`;
  }

  if (options.outputMode === "cssUrl") {
    return `url("${result.dataUri}")`;
  }

  return result.dataUri;
}

function encodeBase64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

function encodeDataUriComponent(value: string, inputKind: InputKind) {
  const encoded = encodeURIComponent(value)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");

  if (inputKind === "svg") {
    return encoded
      .replace(/%20/g, " ")
      .replace(/%3D/g, "=")
      .replace(/%3A/g, ":")
      .replace(/%2F/g, "/")
      .replace(/%2C/g, ",");
  }

  return encoded;
}

function getDataUriNotes(result: DataUriResult): DataUriNote[] {
  const notes: DataUriNote[] = [];

  if (result.warnings.length > 0) {
    notes.push({
      title: "Review warnings",
      message: result.warnings.join(" "),
    });
  }

  if (result.encodingMode === "percent" && result.inputKind === "svg") {
    notes.push({
      title: "SVG percent encoding",
      message:
        "Percent-encoded SVG data URIs are often easier to inspect than Base64 SVG data URIs.",
    });
  }

  if (result.encodingMode === "base64") {
    notes.push({
      title: "Base64 output",
      message:
        "Base64 is convenient, but it can make text-based content less readable.",
    });
  }

  if (result.outputLength > 4000) {
    notes.push({
      title: "Long data URI",
      message:
        "This data URI is long. Check where you plan to use it, because some tools and editors do not handle very long inline URLs nicely.",
    });
  }

  return notes;
}
