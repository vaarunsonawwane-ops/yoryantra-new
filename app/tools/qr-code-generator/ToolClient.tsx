"use client";

import { useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [qrCode, setQrCode] = useState("");

  const generateQRCode = async () => {
    if (!input.trim()) return;

    try {
      const url = await QRCode.toDataURL(input);

      setQrCode(url);
    } catch (error) {
      console.error(error);
    }
  };

  const resetAll = () => {
    setInput("");
    setQrCode("");
  };

  return (
    <ToolShell
      title="QR Code Generator"
      description="Generate QR codes instantly from text, URLs, and other content with this free online QR Code Generator."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Text or URL
        </label>

        <textarea
          className="w-full h-40 rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder="Enter text or URL..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={generateQRCode}
          className="yoryantra-btn"
        >
          Generate QR Code
        </button>

        <button
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {/* QR OUTPUT */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Generated QR Code
        </h3>

        <div className="yoryantra-output min-h-[280px] flex items-center justify-center">
          {qrCode ? (
            <div className="flex flex-col items-center gap-4">
              <img
                src={qrCode}
                alt="Generated QR Code"
                className="w-64 h-64"
              />

              <a
                href={qrCode}
                download="yoryantra-qr-code.png"
                className="yoryantra-btn-outline"
              >
                Download QR Code
              </a>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Generated QR code will appear here...
            </p>
          )}
        </div>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What is QR Code Generator
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            QR Code Generator helps you instantly create QR codes
            from URLs, text, contact details, or other information directly
            in your browser. QR codes are widely used for websites,
            payments, marketing, sharing links, authentication, and more.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            You can generate and download QR codes quickly without needing
            additional software or registration.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the QR Code Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter text, a URL, or other content.</li>
            <li>Click <strong>Generate QR Code</strong>.</li>
            <li>Preview the generated QR code instantly.</li>
            <li>Download the QR code image if needed.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Sharing website URLs quickly.</li>
            <li>Generating QR codes for marketing campaigns.</li>
            <li>Creating QR codes for business cards.</li>
            <li>Sharing WiFi credentials or contact details.</li>
            <li>Using QR codes in presentations or packaging.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is a QR code?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A QR code is a scannable two-dimensional barcode that stores
                information such as URLs, text, or contact details.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I download the generated QR code?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. You can download the generated QR code image directly
                after creating it.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this QR Code Generator secure?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. QR codes are generated directly in your browser and your
                data is not uploaded anywhere.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/url-encoder" className="yoryantra-btn-outline">
              URL Encoder Decoder
            </Link>

            <Link href="/tools/base64-encoder-decoder" className="yoryantra-btn-outline">
              Base64 Encoder Decoder
            </Link>

            <Link href="/tools/password-generator" className="yoryantra-btn-outline">
              Password Generator
            </Link>

            <Link href="/tools/uuid-generator" className="yoryantra-btn-outline">
              UUID Generator
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
