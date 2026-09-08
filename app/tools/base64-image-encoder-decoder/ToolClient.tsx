"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
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
      description="Encode image bytes as Base64 or inspect pasted image data URLs without uploading the source."
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

          {mode === "decode" && decodeInputType === "base64Only" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Image Type
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

        {mode === "decode" && decodeInputType === "base64Only" && (
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            Image Type is used to build a valid data URL from Base64-only image text.
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
        <div className="mt-6 self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
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

      <div className="mt-4 self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
        Image reading, Base64 conversion, and previewing happen in this browser tab. Yoryantra does not send the selected file or pasted Base64 value to its server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">What changes when an image becomes Base64</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">Base64 represents binary bytes with printable ASCII characters. It does not compress the image, improve quality, or change the pixel data. A Base64 payload is normally about one third larger than the original bytes before the data-URL prefix is added.</p>
          <p className="mt-4 text-gray-600 leading-relaxed">A data URL adds a media type such as <code>image/png</code> and the <code>;base64</code> marker. That media type is metadata supplied by the source, so the decoder also checks common raster signatures instead of trusting a PNG, JPEG, GIF, WebP, or BMP label blindly.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Small inline assets versus normal image files</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">Inlining can make sense for a tiny icon, fixture, email snippet, or reproducible bug example. For ordinary site images, separate files are usually easier to cache, inspect, replace, and serve efficiently. A 400 KB image does not become cheaper because it is embedded in CSS or HTML.</p>
          <div className="mt-4 self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">Treat large data URLs as a transport convenience, not an optimization. They increase text size and can make source files, logs, tickets, and browser devtools difficult to work with.</div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">MIME labels, SVG, and trust boundaries</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">A pasted data URL can claim any media type. Raster signatures provide a useful sanity check, but they are not malware scanning. SVG is XML-based text and may contain links, external references, or active constructs depending on where it is later embedded. Review untrusted SVG before placing it into HTML or CSS.</p>
          <p className="mt-4 text-gray-600 leading-relaxed">The preview proves only that the browser can decode the supplied bytes as an image. It does not prove that the content is safe for every downstream context.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Base64 rules used here</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">The alphabet and padding rules follow RFC 4648 Base64. Pasted values may omit final padding when the remaining length can still represent complete bytes; impossible one-character remainders and malformed padding are rejected. Whitespace between Base64 characters is removed for pasted input.</p>
          <p className="mt-3 text-gray-600 leading-relaxed">Reference: <a className="text-[var(--gold)] underline underline-offset-2" href="https://www.rfc-editor.org/rfc/rfc4648" target="_blank" rel="noreferrer">RFC 4648 — Base-N Encodings</a>.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">A quick size check before copying</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">Compare the decoded byte estimate with the Base64 character count shown above. If the result is going into source control, an API payload, or a support ticket, check whether a normal file attachment or object URL would carry the intent more clearly.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4"><YoryantraRelatedTools currentHref="/tools/base64-image-encoder-decoder" /></div>
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

  if (trimmed.length > 20_000_000) {
    throw new Error("The pasted Base64 value is too large for a browser-side preview. Keep it under 20 million characters.");
  }

  const dataUrlMatch = trimmed.match(/^data:([^;,]+);base64,([\s\S]*)$/i);

  if (options.decodeInputType !== "base64Only" && dataUrlMatch) {
    const mimeType = normalizeImageMimeType(dataUrlMatch[1]);
    const base64 = normalizeBase64(dataUrlMatch[2]);
    validateDecodedImageBytes(base64, mimeType);

    return {
      mimeType,
      base64,
      dataUrl: `data:${mimeType};base64,${base64}`,
    };
  }

  if (options.decodeInputType === "dataUrl") {
    throw new Error("This does not look like a Base64 image data URL.");
  }

  const base64 = normalizeBase64(trimmed);
  const mimeType = normalizeImageMimeType(options.fallbackMimeType || "image/png");
  validateDecodedImageBytes(base64, mimeType);

  return {
    mimeType,
    base64,
    dataUrl: `data:${mimeType};base64,${base64}`,
  };
}

function cleanupBase64(value: string): string {
  return value.replace(/\s+/g, "");
}

function normalizeBase64(value: string): string {
  const clean = cleanupBase64(value);

  if (!clean) {
    throw new Error("The Base64 value is empty.");
  }

  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(clean) || /=/.test(clean.slice(0, -2))) {
    throw new Error("The pasted value contains invalid Base64 characters or padding.");
  }

  const unpadded = clean.replace(/=+$/g, "");
  const remainder = unpadded.length % 4;

  if (remainder === 1) {
    throw new Error("The Base64 length is impossible: one trailing Base64 character cannot form a byte sequence.");
  }

  const normalized = unpadded + (remainder === 0 ? "" : "=".repeat(4 - remainder));

  try {
    atob(normalized);
  } catch {
    throw new Error("The pasted value is not decodable Base64.");
  }

  return normalized;
}

function normalizeImageMimeType(value: string): string {
  const mime = value.trim().toLowerCase();

  if (!/^image\/[a-z0-9.+-]+$/.test(mime)) {
    throw new Error("The MIME type must be an image/* media type.");
  }

  return mime;
}

function validateDecodedImageBytes(base64: string, mimeType: string): void {
  const binary = atob(base64);
  const bytes = Array.from(binary.slice(0, 16), (char) => char.charCodeAt(0));
  const has = (...values: number[]) => values.every((value, index) => bytes[index] === value);
  const claimedRaster =
    (mimeType === "image/png" && has(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) ||
    ((mimeType === "image/jpeg" || mimeType === "image/jpg") && has(0xff, 0xd8, 0xff)) ||
    (mimeType === "image/gif" && binary.slice(0, 6).match(/^GIF8[79]a$/)) ||
    (mimeType === "image/webp" && binary.slice(0, 4) === "RIFF" && binary.slice(8, 12) === "WEBP") ||
    (mimeType === "image/bmp" && binary.slice(0, 2) === "BM");

  if (["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "image/bmp"].includes(mimeType) && !claimedRaster) {
    throw new Error(`The decoded bytes do not match the declared ${mimeType} image type.`);
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
