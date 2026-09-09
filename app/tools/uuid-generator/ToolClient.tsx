"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

function fallbackUuidV4(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`;
}

function createUuidV4(): string {
  if (typeof crypto === "undefined") {
    throw new Error("The browser Crypto API is not available in this context.");
  }

  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  if (typeof crypto.getRandomValues === "function") {
    return fallbackUuidV4();
  }

  throw new Error("This browser does not provide a cryptographically secure UUID source.");
}

export default function ToolClient() {
  const [uuid, setUuid] = useState("");
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  const generateUUID = () => {
    try {
      setUuid(createUuidV4());
      setError("");
      setCopyStatus("");
    } catch (reason) {
      setUuid("");
      setError(reason instanceof Error ? reason.message : "UUID generation failed in this browser.");
      setCopyStatus("");
    }
  };

  const copyUuid = async () => {
    if (!uuid) return;
    try {
      await navigator.clipboard.writeText(uuid);
      setCopyStatus("Copied");
    } catch {
      setCopyStatus("Copy failed");
    }
  };

  const resetAll = () => {
    setUuid("");
    setError("");
    setCopyStatus("");
  };

  return (
    <ToolShell
      title="UUID Generator"
      description="Generate RFC 9562 UUIDv4 identifiers from cryptographically secure browser randomness, one value at a time."
    >
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={generateUUID} className="yoryantra-btn whitespace-nowrap">
          Generate UUID
        </button>
        <button type="button" onClick={resetAll} className="yoryantra-btn-outline whitespace-nowrap">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Generated UUIDv4</h3>
          {uuid && (
            <div className="flex items-center gap-3">
              {copyStatus && <span className="text-sm text-gray-600">{copyStatus}</span>}
              <button type="button" onClick={copyUuid} className="yoryantra-btn-outline text-sm whitespace-nowrap">
                Copy
              </button>
            </div>
          )}
        </div>
        <pre className="yoryantra-output min-h-[160px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {uuid || "Generate a UUIDv4 to see the canonical 8-4-4-4-12 hexadecimal form."}
        </pre>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 items-start">
        <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Generated locally</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            The identifier is created in your browser. No UUID value is sent to Yoryantra for generation or storage.
          </p>
        </div>
        <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-950">Identifier, not authentication secret</h3>
          <p className="mt-2 text-sm leading-relaxed text-amber-900">
            UUIDv4 is designed for identifiers. Do not treat a UUID alone as proof of identity, authorization, ownership, or access permission.
          </p>
        </div>
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">What the browser actually generates</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 9562 defines UUIDv4 as a 128-bit UUID whose version field is set to 4 and whose RFC variant bits are set to <code>10</code>. The remaining 122 bits come from random or pseudorandom data. That fixed bit layout is why a version 4 UUID has <code>4</code> in the version position and one of <code>8</code>, <code>9</code>, <code>a</code>, or <code>b</code> in the variant position.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Modern browsers expose <code>crypto.randomUUID()</code>, which returns a cryptographically secure UUIDv4. The fallback path here uses <code>crypto.getRandomValues()</code> and sets the same version and variant bits explicitly when <code>randomUUID()</code> is unavailable.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Uniqueness is probabilistic, not a database guarantee</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            UUIDv4 leaves an enormous random space, so accidental collisions are extraordinarily unlikely when a sound random source is used. Still, the standard does not turn probability into an absolute guarantee. Applications that require hard uniqueness should keep the database constraint or duplicate check that the data model already needs.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Where UUIDv4 fits well</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-600 leading-relaxed">
            <li>Database primary or public identifiers when random ordering is acceptable.</li>
            <li>Correlation IDs for tracing requests across logs and services.</li>
            <li>Client-created object IDs when separate systems must create identifiers independently.</li>
            <li>Test fixtures where a standards-shaped random identifier is preferable to a sequential number.</li>
          </ul>
          <p className="mt-4 leading-relaxed text-gray-600">
            For write-heavy databases where insertion order matters, UUIDv7 may be a better design choice because RFC 9562 places a Unix-epoch timestamp in the most significant bits. This page intentionally generates UUIDv4 only; it does not disguise a different scheme as version 4.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What a UUID does not tell you</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A UUID string does not prove who created it, whether a referenced record exists, whether the holder may access that record, or whether an identifier was generated by a trusted source. UUIDv4 also carries no timestamp or application metadata that can be recovered from the value.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">References for the exact format</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 9562 is the current UUID specification and replaces RFC 4122. MDN documents the browser <code>Crypto.randomUUID()</code> method and its secure-random UUIDv4 behavior.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <a className="font-medium text-[var(--green)] underline underline-offset-4" href="https://www.rfc-editor.org/rfc/rfc9562.html" target="_blank" rel="noreferrer">RFC 9562: UUIDs</a>
            <a className="font-medium text-[var(--green)] underline underline-offset-4" href="https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID" target="_blank" rel="noreferrer">MDN: Crypto.randomUUID()</a>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/uuid-generator" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
