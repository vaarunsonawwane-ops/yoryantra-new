"use client";

import { useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] =
    useState("");

  const [qrCode, setQrCode] =
    useState("");

  const [error, setError] =
    useState("");

  const generateQRCode =
    async () => {
      if (!input.trim()) {
        setError(
          "Please enter text or a URL."
        );

        setQrCode("");
        return;
      }

      try {
        const url =
          await QRCode.toDataURL(
            input,
            {
              width: 512,
              margin: 2,
            }
          );

        setQrCode(url);

        setError("");
      } catch {
        setError(
          "Unable to generate QR code."
        );

        setQrCode("");
      }
    };

  const resetAll = () => {
    setInput("");
    setQrCode("");
    setError("");
  };

  return (
    <ToolShell
      title="QR Code Generator"
      description="Generate QR codes instantly for URLs, campaigns, text, and sharing with this free online QR Code Generator."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Text or URL
        </label>

        <textarea
          className="w-full min-h-[180px] rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder="https://example.com"
          value={input}
          onChange={(e) =>
            setInput(
              e.target.value
            )
          }
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={
            generateQRCode
          }
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

      {/* ERROR */}
      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* QR OUTPUT */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Generated QR Code
          </h3>

          {qrCode && (
            <button
              onClick={() =>
                navigator.clipboard.writeText(
                  input
                )
              }
              className="yoryantra-btn-outline text-sm"
            >
              Copy Content
            </button>
          )}
        </div>

        <div className="yoryantra-output min-h-[320px] flex items-center justify-center">
          {qrCode ? (
            <div className="flex flex-col items-center gap-5">
              <img
                src={qrCode}
                alt="Generated QR Code"
                className="w-64 h-64 rounded-lg border border-gray-200"
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

      {/* PRIVACY */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Privacy Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          QR code generation happens locally inside your browser. Your URLs,
          campaign links, text, and encoded content are not uploaded, stored, or
          processed on any external server.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Generating QR Codes for Links, Campaigns, and Quick Sharing
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            QR code generation helps marketers, developers, businesses, content
            creators, and SEO teams create scannable QR codes for websites,
            campaign links, payment pages, contact information, product
            packaging, WiFi sharing, event registrations, and mobile-friendly
            user experiences.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            QR codes allow smartphones and devices to instantly open URLs,
            access information, or perform actions without manually typing long
            links. They are widely used across marketing campaigns, restaurants,
            packaging, retail, analytics tracking, and offline-to-online
            conversion workflows.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This QR Code Generator creates downloadable QR codes directly inside
            your browser without requiring registration or external QR services.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the QR Code Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Enter a URL, text, or other content.
            </li>

            <li>
              Click{" "}
              <strong>
                Generate QR Code
              </strong>.
            </li>

            <li>
              Preview the generated QR code instantly.
            </li>

            <li>
              Download the QR code image if needed.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Sharing website URLs quickly.
            </li>

            <li>
              Creating QR codes for marketing campaigns.
            </li>

            <li>
              Generating QR codes for UTM tracking links.
            </li>

            <li>
              Adding QR codes to business cards and packaging.
            </li>

            <li>
              Sharing event registrations and forms.
            </li>

            <li>
              Creating scannable restaurant menus and payment links.
            </li>

            <li>
              Improving offline-to-online conversion tracking.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example QR Code Workflow
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <p className="font-medium text-gray-900">
              Example URL:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`https://example.com/?utm_source=instagram&utm_medium=qr`}
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              Example use case:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`Print the QR code on flyers, posters, packaging, or menus for quick mobile access.`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why QR Codes Matter in Modern Marketing
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Faster access:</strong>{" "}
                Users can instantly open URLs without typing.
              </li>

              <li>
                <strong>Better campaign tracking:</strong>{" "}
                Combine QR codes with UTM links for analytics reporting.
              </li>

              <li>
                <strong>Mobile-friendly sharing:</strong>{" "}
                Improve user experience across devices and offline materials.
              </li>

              <li>
                <strong>Flexible usage:</strong>{" "}
                QR codes work across marketing, retail, events, restaurants, and
                business workflows.
              </li>
            </ul>
          </div>
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
                URLs, text, contact details, or other information.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I use QR codes for marketing campaigns?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. QR codes are commonly used in ads, posters, menus,
                packaging, social campaigns, and offline marketing materials.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I download the generated QR code?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. You can download the generated QR code image instantly
                after creation.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this QR Code Generator secure?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. QR codes are generated directly inside your browser and no
                data is uploaded anywhere.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can QR codes contain UTM tracking links?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. QR codes often contain UTM URLs for campaign tracking and
                analytics reporting.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            QR code generation often connects with campaign tracking, URL
            management, analytics workflows, SEO reporting, and digital
            marketing systems.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/utm-builder"
              className="yoryantra-btn-outline"
            >
              UTM Builder
            </Link>

            <Link
              href="/tools/url-query-params-parser"
              className="yoryantra-btn-outline"
            >
              URL Query Params Parser
            </Link>

            <Link
              href="/tools/url-encoder-decoder"
              className="yoryantra-btn-outline"
            >
              URL Encoder Decoder
            </Link>

            <Link
              href="/tools/redirect-checker"
              className="yoryantra-btn-outline"
            >
              Redirect Checker
            </Link>

            <Link
              href="/tools/open-graph-generator"
              className="yoryantra-btn-outline"
            >
              Open Graph Generator
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}