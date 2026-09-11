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

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">The symbol is only as dependable as the payload behind it</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A QR code carries the exact string that was encoded. When that string is a URL, the symbol does not verify the domain, judge whether the page is safe, keep the destination available, or make a temporary link permanent. A static symbol also cannot be edited after printing; only a redirect or another destination you control can change what happens after somebody scans it.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            For long-lived print, encode an address you expect to keep under your control and test the full journey after scanning. Redirects, login requirements, mobile layout, expired campaign parameters, and certificate problems belong to the destination, not to the QR symbol.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-xl border border-gray-200">
          <div className="border-b border-gray-200 bg-gray-50 p-5">
            <h2 className="text-xl font-semibold text-gray-900">Choosing L, M, Q, or H trades payload room for recovery</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Higher error correction adds redundant codewords. That can help a scanner recover data when part of a symbol is damaged, but it can also increase symbol density for the same payload. The percentages below describe approximate codeword restoration capability; they are not permission to cover the same percentage of the visible image with a logo or crop.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-white text-gray-900">
                <tr className="border-b border-gray-200">
                  <th className="px-5 py-3 font-semibold">Level</th>
                  <th className="px-5 py-3 font-semibold">Approx. restoration</th>
                  <th className="px-5 py-3 font-semibold">What changes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-600">
                <tr><td className="px-5 py-3 font-medium text-gray-900">L</td><td className="px-5 py-3">7% of codewords</td><td className="px-5 py-3">Lowest redundancy and the most payload capacity.</td></tr>
                <tr><td className="px-5 py-3 font-medium text-gray-900">M</td><td className="px-5 py-3">15% of codewords</td><td className="px-5 py-3">A common general-purpose balance.</td></tr>
                <tr><td className="px-5 py-3 font-medium text-gray-900">Q</td><td className="px-5 py-3">25% of codewords</td><td className="px-5 py-3">More redundancy for harsher physical conditions.</td></tr>
                <tr><td className="px-5 py-3 font-medium text-gray-900">H</td><td className="px-5 py-3">30% of codewords</td><td className="px-5 py-3">Highest redundancy and the largest capacity trade-off.</td></tr>
              </tbody>
            </table>
          </div>
          <p className="border-t border-gray-200 px-5 py-4 text-xs leading-relaxed text-gray-500">
            Source: {" "}
            <a className="text-[var(--green)] underline underline-offset-2" href="https://www.qrcode.com/en/about/standards.html" target="_blank" rel="noreferrer">
              DENSO WAVE QR Code outline specification
            </a>{" "}
            (QR Code is standardized in ISO/IEC 18004).
          </p>
        </div>

        <div className="mt-10 self-start rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-lg font-semibold text-gray-900">Keep the four-module quiet zone clear</h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-700">
            QR Code requires a clear margin four modules wide on every side. The generated PNG includes that margin. Cropping it away, placing graphics into it, or letting a busy background run through it can make scanning less reliable even though the encoded data itself is valid.
          </p>
          <p className="mt-3 text-xs text-gray-600">
            Reference: {" "}
            <a className="text-[var(--green)] underline underline-offset-2" href="https://www.qrcode.com/en/howto/code.html" target="_blank" rel="noreferrer">
              DENSO WAVE guidance on QR Code area and margin
            </a>.
          </p>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900">Before a QR code goes into a poster, label, or document</h2>
          <ol className="mt-5 space-y-4 text-gray-600 leading-relaxed">
            <li><strong className="text-gray-900">1. Scan the exported PNG, not only the preview.</strong> Test the actual asset after it has gone through the design or document workflow that will be published.</li>
            <li><strong className="text-gray-900">2. Test at the final physical size.</strong> Pixel dimensions describe the raster file, not a guaranteed scan distance. Module size, print resolution, camera quality, lighting, surface, and payload density all matter.</li>
            <li><strong className="text-gray-900">3. Confirm the decoded value character for character.</strong> This matters for URLs with query strings, tokens, Unicode text, phone numbers, or other payloads where a small difference changes meaning.</li>
            <li><strong className="text-gray-900">4. Keep contrast and surrounding space simple.</strong> Decorative colors, transparency, logos, gradients, or textured backgrounds can reduce readability. Error correction is recovery capability, not a guarantee that every visual customization will scan.</li>
            <li><strong className="text-gray-900">5. Re-test destinations that must live for months or years.</strong> A perfectly readable QR code can still lead to a retired route, expired redirect, broken certificate, or page that no longer works well on mobile.</li>
          </ol>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/qr-code-generator" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
