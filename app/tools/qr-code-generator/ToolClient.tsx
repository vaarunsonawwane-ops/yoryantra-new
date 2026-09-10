"use client";

import { type ChangeEvent, useMemo, useState } from "react";
import QRCode from "qrcode";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";
type ImageSize = "256" | "384" | "512" | "768";

const sampleContent = "https://example.com/docs?source=qr";

const errorCorrectionNotes: Record<ErrorCorrectionLevel, string> = {
  L: "Lowest redundancy; leaves the most room for data.",
  M: "Balanced redundancy and capacity for general use.",
  Q: "More redundancy for codes that may be partly obscured.",
  H: "Highest redundancy, with the largest capacity trade-off.",
};

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<ErrorCorrectionLevel>("M");
  const [imageSize, setImageSize] = useState<ImageSize>("512");
  const [qrCode, setQrCode] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const utf8Bytes = useMemo(() => new TextEncoder().encode(input).length, [input]);
  const codePoints = useMemo(() => Array.from(input).length, [input]);

  const clearResult = () => {
    setQrCode("");
    setError("");
    setCopied(false);
  };

  const generateQRCode = async () => {
    if (!input.trim()) {
      setError("Enter the text or URL you want the QR code to contain.");
      setQrCode("");
      return;
    }

    try {
      const url = await QRCode.toDataURL(input, {
        width: Number(imageSize),
        margin: 4,
        errorCorrectionLevel,
      });

      setQrCode(url);
      setError("");
      setCopied(false);
    } catch {
      setError(
        "That content could not be encoded at the selected settings. Shorten the content or choose a lower error-correction level.",
      );
      setQrCode("");
    }
  };

  const copyContent = async () => {
    if (!qrCode) return;

    try {
      await navigator.clipboard.writeText(input);
      setCopied(true);
      setError("");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("The browser could not copy the encoded content to the clipboard.");
    }
  };

  const loadExample = () => {
    setInput(sampleContent);
    setErrorCorrectionLevel("M");
    setImageSize("512");
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setErrorCorrectionLevel("M");
    setImageSize("512");
    clearResult();
  };

  return (
    <ToolShell
      title="QR Code Generator"
      description="Encode text or URLs as downloadable QR images with selectable size and error correction."
    >
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block text-sm font-semibold text-gray-900">Content to encode</label>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            The exact string is placed in the symbol. A URL is not shortened, checked, or contacted.
          </p>
          <textarea
            className="mt-3 w-full min-h-[210px] rounded-xl border border-gray-300 p-4 text-sm font-mono leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            placeholder="https://example.com"
            value={input}
            spellCheck={false}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
              setInput(event.target.value);
              clearResult();
            }}
          />

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
            <span>{codePoints.toLocaleString()} Unicode code points</span>
            <span>{utf8Bytes.toLocaleString()} UTF-8 bytes</span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Symbol Settings</h3>
          <div className="mt-4 space-y-4">
            <YoryantraSelect
              label="Error Correction"
              value={errorCorrectionLevel}
              onChange={(value) => {
                setErrorCorrectionLevel(value as ErrorCorrectionLevel);
                clearResult();
              }}
              options={[
                { value: "L", label: "L — lower redundancy" },
                { value: "M", label: "M — balanced" },
                { value: "Q", label: "Q — higher redundancy" },
                { value: "H", label: "H — highest redundancy" },
              ]}
            />

            <p className="text-sm leading-relaxed text-gray-500">
              {errorCorrectionNotes[errorCorrectionLevel]}
            </p>

            <YoryantraSelect
              label="PNG Size"
              value={imageSize}
              onChange={(value) => {
                setImageSize(value as ImageSize);
                clearResult();
              }}
              options={[
                { value: "256", label: "256 × 256 px" },
                { value: "384", label: "384 × 384 px" },
                { value: "512", label: "512 × 512 px" },
                { value: "768", label: "768 × 768 px" },
              ]}
            />

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
              A four-module quiet zone is kept around every generated symbol.
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generateQRCode} className="yoryantra-btn min-h-[44px] whitespace-nowrap">
          Generate QR Code
        </button>
        <button onClick={loadExample} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap">
          Load Example
        </button>
        <button onClick={resetAll} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Generated QR Code</h3>
          {qrCode && (
            <button onClick={copyContent} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap text-sm">
              {copied ? "Copied" : "Copy Content"}
            </button>
          )}
        </div>

        <div className="yoryantra-output min-h-[340px] flex items-center justify-center p-6">
          {qrCode ? (
            <div className="flex max-w-full flex-col items-center gap-5">
              <img
                src={qrCode}
                alt="Generated QR code preview"
                className="h-auto w-64 max-w-full rounded-lg border border-gray-200 bg-white"
              />
              <a
                href={qrCode}
                download="yoryantra-qr-code.png"
                className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap"
              >
                Download PNG
              </a>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Generate a symbol to preview it here.</p>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
        Generation happens in this browser. The text you enter is passed to the QR encoder on the page; Yoryantra does not send it to an endpoint for QR generation.
      </div>

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">A QR code stores data; it does not make that data trustworthy</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A generated symbol represents the string you entered. If that string is a URL, the QR code does not verify the domain, check whether the page is safe, keep the destination alive, or add analytics by itself. A static QR code also cannot change its destination later unless the encoded URL points to a redirect you control.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            That distinction matters when codes are printed. A short, durable URL under your control is usually easier to maintain than a long campaign URL tied to a temporary service. Test the final encoded destination as a user would see it, including redirects and mobile behavior.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Error correction spends capacity to survive damage</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            QR Code has four error-correction levels: L, M, Q, and H. Higher levels add more redundant codewords, which can make a symbol recoverable when part of it is dirty or damaged, but the extra redundancy leaves less room for payload data and can make the symbol denser. DENSO WAVE describes M as the common general-purpose level, while Q or H may suit harsher physical conditions.
          </p>
          <p className="mt-3 text-sm text-gray-500">
            References: {" "}
            <a className="text-[var(--green)] underline underline-offset-2" href="https://www.qrcode.com/en/about/error_correction.html" target="_blank" rel="noreferrer">
              DENSO WAVE error correction guidance
            </a>{" "}
            and {" "}
            <a className="text-[var(--green)] underline underline-offset-2" href="https://www.iso.org/standard/83389.html" target="_blank" rel="noreferrer">
              ISO/IEC 18004:2024
            </a>.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 items-start">
          <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="text-lg font-semibold text-gray-900">Protect the quiet zone when printing</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">
              Cropping tightly around the black modules can make scanning less reliable. QR Code guidance calls for a clear four-module margin on every side. The generated PNG keeps that margin, so avoid trimming it away in a design editor.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-lg font-semibold text-gray-900">Pixels are not the same as printable size</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">
              The PNG size controls raster resolution, not a guaranteed physical scan distance. Printing dimensions, module size, contrast, surface, camera quality, lighting, and payload density all affect real scanning. Test the finished artwork at its real size before a large print run.
            </p>
            <p className="mt-3 text-xs text-gray-500">
              Reference: {" "}
              <a className="text-[var(--green)] underline underline-offset-2" href="https://www.qrcode.com/en/howto/code.html" target="_blank" rel="noreferrer">
                DENSO WAVE quiet-zone and symbol-area guidance
              </a>.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What to check before a QR code leaves the screen</h2>
          <ul className="mt-4 space-y-3 text-gray-600 leading-relaxed">
            <li><strong className="text-gray-900">Scan the actual output:</strong> confirm that at least two different camera/scanner apps decode the intended text or URL.</li>
            <li><strong className="text-gray-900">Keep strong contrast:</strong> decorative colors, transparency, logos, or busy backgrounds can reduce readability even when the underlying data is valid.</li>
            <li><strong className="text-gray-900">Use the shortest stable payload that fits the job:</strong> more data generally produces a denser symbol and smaller modules at the same printed dimensions.</li>
            <li><strong className="text-gray-900">Treat destinations separately:</strong> HTTPS, redirects, authentication, tracking parameters, and landing-page safety belong to the URL or service being encoded, not to the QR symbol itself.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/qr-code-generator" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
