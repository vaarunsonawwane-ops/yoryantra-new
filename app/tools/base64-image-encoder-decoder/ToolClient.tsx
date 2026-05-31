"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type Mode = "encode" | "decode";
type OutputMode = "dataUrl" | "base64Only" | "htmlImg" | "cssUrl";
type DecodeInputType = "auto" | "dataUrl" | "base64Only";

type ImageDetails = {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
  base64Length: number;
  dataUrlLength: number;
  estimatedDecodedBytes: number;
};

type DecodeResult = {
  previewUrl: string;
  mimeType: string;
  base64: string;
  dataUrl: string;
  estimatedBytes: number;
  base64Length: number;
  valid: boolean;
};

type ImageNote = {
  title: string;
  message: string;
};

const sampleSvgDataUrl =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjkwIiB2aWV3Qm94PSIwIDAgMTYwIDkwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxNjAiIGhlaWdodD0iOTAiIHJ4PSIxMiIgZmlsbD0iIzEyNjMzQSIvPjxjaXJjbGUgY3g9IjQ0IiBjeT0iNDUiIHI9IjE4IiBmaWxsPSIjRDZBODRDIi8+PHBhdGggZD0iTTcwIDY1TDkzIDM5TDExOSA2NUg3MFoiIGZpbGw9IiNGRkYiIG9wYWNpdHk9IjAuOTIiLz48dGV4dCB4PSI4MCIgeT0iMjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZmlsbD0iI0ZGRiI+QmFzZTY0PC90ZXh0Pjwvc3ZnPg==";

export default function ToolClient() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [mode, setMode] = useState<Mode>("encode");
  const [outputMode, setOutputMode] = useState<OutputMode>("dataUrl");
  const [decodeInputType, setDecodeInputType] = useState<DecodeInputType>("auto");
  const [fileName, setFileName] = useState("");
  const [mimeType, setMimeType] = useState("image/png");
  const [encodedDataUrl, setEncodedDataUrl] = useState("");
  const [encodedBase64, setEncodedBase64] = useState("");
  const [decodeInput, setDecodeInput] = useState("");
  const [imageDetails, setImageDetails] = useState<ImageDetails | null>(null);
  const [decodeResult, setDecodeResult] = useState<DecodeResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => {
    if (mode === "encode" && imageDetails) {
      return getEncodeNotes(imageDetails);
    }

    if (mode === "decode" && decodeResult) {
      return getDecodeNotes(decodeResult);
    }

    return [];
  }, [mode, imageDetails, decodeResult]);

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      resetEncodeOutput(false);
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] || "" : "";
      const dimensions = await readImageDimensions(dataUrl);
      const details: ImageDetails = {
        fileName: file.name,
        mimeType: file.type || detectMimeFromDataUrl(dataUrl) || "image/*",
        sizeBytes: file.size,
        width: dimensions.width,
        height: dimensions.height,
        base64Length: base64.length,
        dataUrlLength: dataUrl.length,
        estimatedDecodedBytes: estimateBase64Bytes(base64),
      };
      const nextOutput = formatImageOutput({
        dataUrl,
        base64,
        outputMode,
        mimeType: details.mimeType,
      });

      setMode("encode");
      setFileName(file.name);
      setMimeType(details.mimeType);
      setEncodedDataUrl(dataUrl);
      setEncodedBase64(base64);
      setImageDetails(details);
      setOutput(nextOutput);
      setDecodeResult(null);
      setError("");
      setCopied(false);
    } catch {
      setError("Unable to read this image file.");
      resetEncodeOutput(false);
    }
  };

  const decodeImage = async () => {
    if (!decodeInput.trim()) {
      setError("Please paste a Base64 image string or data URL.");
      setDecodeResult(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const parsed = parseBase64ImageInput(decodeInput, {
        decodeInputType,
        fallbackMimeType: mimeType || "image/png",
      });
      const previewUrl = parsed.dataUrl;
      const dimensions = await readImageDimensions(previewUrl);
      const result: DecodeResult = {
        previewUrl,
        mimeType: parsed.mimeType,
        base64: parsed.base64,
        dataUrl: parsed.dataUrl,
        estimatedBytes: estimateBase64Bytes(parsed.base64),
        base64Length: parsed.base64.length,
        valid: dimensions.width > 0 && dimensions.height > 0,
      };
      const nextOutput = formatImageOutput({
        dataUrl: result.dataUrl,
        base64: result.base64,
        outputMode,
        mimeType: result.mimeType,
      });

      setMode("decode");
      setDecodeResult(result);
      setImageDetails({
        fileName: "decoded-image",
        mimeType: result.mimeType,
        sizeBytes: result.estimatedBytes,
        width: dimensions.width,
        height: dimensions.height,
        base64Length: result.base64Length,
        dataUrlLength: result.dataUrl.length,
        estimatedDecodedBytes: result.estimatedBytes,
      });
      setEncodedDataUrl(result.dataUrl);
      setEncodedBase64(result.base64);
      setOutput(nextOutput);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to decode this Base64 image."
      );
      setDecodeResult(null);
      setOutput("");
      setCopied(false);
    }
  };

  const rebuildOutput = (nextOutputMode: OutputMode) => {
    const dataUrl =
      mode === "decode" && decodeResult ? decodeResult.dataUrl : encodedDataUrl;
    const base64 =
      mode === "decode" && decodeResult ? decodeResult.base64 : encodedBase64;
    const type =
      mode === "decode" && decodeResult ? decodeResult.mimeType : mimeType;

    if (!dataUrl || !base64) {
      setOutput("");
      return;
    }

    setOutput(
      formatImageOutput({
        dataUrl,
        base64,
        outputMode: nextOutputMode,
        mimeType: type,
      })
    );
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

  const loadExample = async () => {
    try {
      const parsed = parseBase64ImageInput(sampleSvgDataUrl, {
        decodeInputType: "dataUrl",
        fallbackMimeType: "image/svg+xml",
      });
      const dimensions = await readImageDimensions(parsed.dataUrl);
      const result: DecodeResult = {
        previewUrl: parsed.dataUrl,
        mimeType: parsed.mimeType,
        base64: parsed.base64,
        dataUrl: parsed.dataUrl,
        estimatedBytes: estimateBase64Bytes(parsed.base64),
        base64Length: parsed.base64.length,
        valid: true,
      };

      setMode("decode");
      setDecodeInput(sampleSvgDataUrl);
      setDecodeInputType("auto");
      setMimeType("image/svg+xml");
      setOutputMode("dataUrl");
      setDecodeResult(result);
      setEncodedDataUrl(parsed.dataUrl);
      setEncodedBase64(parsed.base64);
      setImageDetails({
        fileName: "sample.svg",
        mimeType: parsed.mimeType,
        sizeBytes: result.estimatedBytes,
        width: dimensions.width,
        height: dimensions.height,
        base64Length: parsed.base64.length,
        dataUrlLength: parsed.dataUrl.length,
        estimatedDecodedBytes: result.estimatedBytes,
      });
      setOutput(parsed.dataUrl);
      setError("");
      setCopied(false);
    } catch {
      setError("Unable to load the sample image.");
    }
  };

  const resetAll = () => {
    setMode("encode");
    setOutputMode("dataUrl");
    setDecodeInputType("auto");
    setFileName("");
    setMimeType("image/png");
    setEncodedDataUrl("");
    setEncodedBase64("");
    setDecodeInput("");
    setImageDetails(null);
    setDecodeResult(null);
    setOutput("");
    setError("");
    setCopied(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetEncodeOutput = (clearFile: boolean) => {
    setFileName("");
    setEncodedDataUrl("");
    setEncodedBase64("");
    setImageDetails(null);
    setDecodeResult(null);
    setOutput("");
    setCopied(false);

    if (clearFile && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <ToolShell
      title="Base64 Image Encoder Decoder"
      description="Convert images to Base64 data URLs, decode Base64 image strings, preview images, check size, MIME type, and copy clean output directly in your browser."
    >
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Choose What You Want to Do
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <button
            onClick={() => {
              setMode("encode");
              setError("");
              setCopied(false);
            }}
            className={`rounded-xl border border-gray-200 bg-white p-4 text-left transition ${
              mode === "encode"
                ? "shadow-sm ring-2 ring-[var(--green)]"
                : "hover:border-[var(--green)]"
            }`}
          >
            <span className="block text-sm font-semibold text-gray-900">
              Image to Base64
            </span>

            <span className="mt-1 block text-sm leading-relaxed text-gray-500">
              Upload an image and convert it to a Base64 string or data URL.
            </span>
          </button>

          <button
            onClick={() => {
              setMode("decode");
              setError("");
              setCopied(false);
            }}
            className={`rounded-xl border border-gray-200 bg-white p-4 text-left transition ${
              mode === "decode"
                ? "shadow-sm ring-2 ring-[var(--green)]"
                : "hover:border-[var(--green)]"
            }`}
          >
            <span className="block text-sm font-semibold text-gray-900">
              Base64 to Image
            </span>

            <span className="mt-1 block text-sm leading-relaxed text-gray-500">
              Paste a Base64 image string, preview it, and copy clean output.
            </span>
          </button>
        </div>
      </div>

      {mode === "encode" ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Image File
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="block w-full rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--green)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:opacity-90"
          />

          <p className="mt-2 text-sm text-gray-500">
            Choose a PNG, JPG, WebP, GIF, SVG, or other image file. The image is
            read in your browser and is not uploaded.
          </p>

          {encodedDataUrl && (
            <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-900">
                Image preview
              </p>

              <div className="mt-3 flex min-h-[180px] items-center justify-center rounded-xl border border-gray-200 bg-white p-4">
                <img
                  src={encodedDataUrl}
                  alt={fileName || "Encoded preview"}
                  className="max-h-[260px] max-w-full rounded-lg object-contain"
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Base64 Image Input
          </label>

          <textarea
            value={decodeInput}
            onChange={(event) => {
              setDecodeInput(event.target.value);
              setDecodeResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            placeholder={sampleSvgDataUrl}
            className="w-full min-h-[280px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          <p className="mt-2 text-sm text-gray-500">
            Paste a full data URL like data:image/png;base64,... or a Base64-only
            image string.
          </p>

          {decodeResult && (
            <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-900">
                Decoded image preview
              </p>

              <div className="mt-3 flex min-h-[180px] items-center justify-center rounded-xl border border-gray-200 bg-white p-4">
                <img
                  src={decodeResult.previewUrl}
                  alt="Decoded Base64 preview"
                  className="max-h-[260px] max-w-full rounded-lg object-contain"
                />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Output Options
        </h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-3">
          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value) => {
              const nextMode = value as OutputMode;
              setOutputMode(nextMode);
              rebuildOutput(nextMode);
              setCopied(false);
            }}
            options={[
              {
                label: "Data URL",
                value: "dataUrl",
              },
              {
                label: "Base64 only",
                value: "base64Only",
              },
              {
                label: "HTML img tag",
                value: "htmlImg",
              },
              {
                label: "CSS url()",
                value: "cssUrl",
              },
            ]}
          />

          {mode === "decode" && (
            <YoryantraSelect
              label="Input Type"
              value={decodeInputType}
              onChange={(value) => {
                setDecodeInputType(value as DecodeInputType);
                setDecodeResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              options={[
                {
                  label: "Auto detect",
                  value: "auto",
                },
                {
                  label: "Data URL",
                  value: "dataUrl",
                },
                {
                  label: "Base64 only",
                  value: "base64Only",
                },
              ]}
            />
          )}

          {mode === "decode" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                MIME Type
              </label>

              <input
                value={mimeType}
                onChange={(event) => {
                  setMimeType(event.target.value);
                  setDecodeResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                placeholder="image/png"
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />


            </div>
          )}
        </div>

        {mode === "decode" && (
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            MIME Type is used only when the pasted value is Base64-only. Full data URLs already include the image type.
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {mode === "decode" && (
          <button onClick={decodeImage} className="yoryantra-btn">
            Decode Image
          </button>
        )}

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

      {imageDetails && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="MIME Type"
            value={imageDetails.mimeType || "unknown"}
          />
          <SummaryCard
            label="Dimensions"
            value={
              imageDetails.width && imageDetails.height
                ? `${imageDetails.width} × ${imageDetails.height}`
                : "unknown"
            }
          />
          <SummaryCard
            label="Image Size"
            value={formatBytes(imageDetails.estimatedDecodedBytes || imageDetails.sizeBytes)}
          />
          <SummaryCard
            label="Base64 Length"
            value={imageDetails.base64Length.toLocaleString()}
          />
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Image notes
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
          {output || "Base64 image output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Base64 image encoding and decoding happens directly in your browser. Your
        image file and pasted Base64 text are not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Converting Images to Base64 Data URLs
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Base64 image strings are useful when you need to embed a small image
            directly inside HTML, CSS, JSON, email templates, or documentation.
            Instead of linking to a separate file, the image is stored as text.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Base64 Image Encoder Decoder converts image files into Base64
            data URLs and can also decode Base64 image strings back into a
            preview. It is useful for quick checks, small icons, test data, and
            places where an image needs to be copied as text.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Encoding or Decoding a Base64 Image
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Choose Image to Base64 or Base64 to Image.</li>
            <li>Upload an image file or paste a Base64 image string.</li>
            <li>Select data URL, Base64-only, HTML img tag, or CSS url output.</li>
            <li>Review the preview, MIME type, dimensions, and size notes.</li>
            <li>Copy the output for your code, test data, or notes.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Base64 Image Converter Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Embedding a small icon inside HTML or CSS.</li>
            <li>Creating a data URL for quick image testing.</li>
            <li>Previewing a Base64 image copied from JSON or an API response.</li>
            <li>Checking whether a Base64 image string is valid.</li>
            <li>Converting SVG, PNG, JPG, GIF, or WebP images into text.</li>
            <li>Preparing small image examples for documentation or bug reports.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Base64 Image Data URL
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            When Base64 Images Are Useful
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Base64 images work well for very small assets, examples, inline SVG
            previews, and quick test data. They are not always the best choice
            for large photos because Base64 text is usually larger than the
            original binary image.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            For production websites, use Base64 images carefully. Large inline
            images can make HTML or CSS heavier and harder to cache separately.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is a Base64 image?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A Base64 image is an image converted into text. It is often used
                inside data URLs that start with data:image/type;base64.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this convert an image to a data URL?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Upload an image and choose Data URL output to get a full
                data:image/...;base64 string.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this decode Base64 back to an image?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Paste a Base64 image string or data URL and the tool will
                show a preview when the image is valid.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this upload my image?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Image reading and Base64 conversion happen directly in your
                browser.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Should I use Base64 for large images?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Usually no. Base64 can make large images heavier as text. It is
                better for small icons, SVGs, examples, or quick test data.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/base64-encoder-decoder" className="yoryantra-btn-outline">
              Base64 Encoder Decoder
            </Link>

            <Link href="/tools/url-encoder-decoder" className="yoryantra-btn-outline">
              URL Encoder Decoder
            </Link>

            <Link href="/tools/html-encoder-decoder" className="yoryantra-btn-outline">
              HTML Encoder Decoder
            </Link>

            <Link href="/tools/hex-encoder-decoder" className="yoryantra-btn-outline">
              Hex Encoder Decoder
            </Link>

            <Link href="/tools/qr-code-generator" className="yoryantra-btn-outline">
              QR Code Generator
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

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("File could not be read as a data URL."));
      }
    };

    reader.onerror = () => reject(new Error("File could not be read."));
    reader.readAsDataURL(file);
  });
}

function readImageDimensions(src: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };

    image.onerror = () => reject(new Error("The image could not be previewed."));
    image.src = src;
  });
}

function parseBase64ImageInput(
  input: string,
  options: {
    decodeInputType: DecodeInputType;
    fallbackMimeType: string;
  }
) {
  const trimmed = input.trim();

  if (!trimmed) {
    throw new Error("Please paste a Base64 image string.");
  }

  const dataUrlMatch = trimmed.match(/^data:([^;,]+);base64,([\s\S]+)$/i);

  if (options.decodeInputType !== "base64Only" && dataUrlMatch) {
    const mimeType = dataUrlMatch[1].trim();
    const base64 = cleanupBase64(dataUrlMatch[2]);

    validateBase64(base64);

    return {
      mimeType,
      base64,
      dataUrl: `data:${mimeType};base64,${base64}`,
    };
  }

  if (options.decodeInputType === "dataUrl") {
    throw new Error("This does not look like a valid Base64 image data URL.");
  }

  const base64 = cleanupBase64(trimmed);
  validateBase64(base64);

  const mimeType = options.fallbackMimeType.trim() || "image/png";

  return {
    mimeType,
    base64,
    dataUrl: `data:${mimeType};base64,${base64}`,
  };
}

function cleanupBase64(value: string) {
  return value.replace(/\s+/g, "");
}

function validateBase64(value: string) {
  if (!value) {
    throw new Error("The Base64 value is empty.");
  }

  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value)) {
    throw new Error("The pasted value contains characters that are not valid Base64.");
  }

  if (value.length % 4 !== 0) {
    throw new Error("The Base64 length looks incomplete. It should usually be divisible by 4.");
  }
}

function detectMimeFromDataUrl(value: string) {
  const match = value.match(/^data:([^;,]+);base64,/i);
  return match ? match[1] : "";
}

function estimateBase64Bytes(base64: string) {
  const clean = cleanupBase64(base64);
  const padding = clean.endsWith("==") ? 2 : clean.endsWith("=") ? 1 : 0;

  return Math.max(0, Math.floor((clean.length * 3) / 4) - padding);
}

function formatImageOutput({
  dataUrl,
  base64,
  outputMode,
  mimeType,
}: {
  dataUrl: string;
  base64: string;
  outputMode: OutputMode;
  mimeType: string;
}) {
  if (outputMode === "base64Only") {
    return base64;
  }

  if (outputMode === "htmlImg") {
    return `<img src="${dataUrl}" alt="Base64 image" />`;
  }

  if (outputMode === "cssUrl") {
    return `background-image: url("${dataUrl}");`;
  }

  return dataUrl || `data:${mimeType};base64,${base64}`;
}

function getEncodeNotes(details: ImageDetails): ImageNote[] {
  const notes: ImageNote[] = [];

  if (details.estimatedDecodedBytes > 100 * 1024) {
    notes.push({
      title: "Large Base64 image",
      message:
        "This image is larger than 100 KB. Base64 output can become heavy, so use it carefully in HTML or CSS.",
    });
  }

  if (details.mimeType === "image/svg+xml") {
    notes.push({
      title: "SVG image",
      message:
        "SVG can often be used as text or optimized before converting to Base64.",
    });
  }

  if (details.dataUrlLength > details.estimatedDecodedBytes) {
    notes.push({
      title: "Base64 adds size",
      message:
        "Base64 text is usually larger than the original image file. This is normal.",
    });
  }

  return notes;
}

function getDecodeNotes(result: DecodeResult): ImageNote[] {
  const notes: ImageNote[] = [];

  if (result.estimatedBytes > 100 * 1024) {
    notes.push({
      title: "Decoded image is large",
      message:
        "This Base64 image decodes to more than 100 KB. It may be too large for inline use.",
    });
  }

  if (!result.mimeType.startsWith("image/")) {
    notes.push({
      title: "MIME type does not look like an image",
      message:
        "The MIME type does not start with image/. Check the MIME type if the preview does not work.",
    });
  }

  return notes;
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let index = 0;

  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }

  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}
