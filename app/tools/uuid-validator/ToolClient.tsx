"use client";

import { useState, type ChangeEvent } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type ResultStatus = "defined" | "caution" | "invalid";

type UUIDCheck = {
  input: string;
  normalized: string;
  status: ResultStatus;
  statusText: string;
  presentation: string;
  version: string;
  variant: string;
  detail: string;
};

const sampleUUIDs = `550e8400-e29b-41d4-a716-446655440000
01890f3a-65b0-7cc3-98c4-dc0c0c07398f
urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6
00000000-0000-0000-0000-000000000000
not-a-valid-uuid`;

const canonicalPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NIL_UUID = "00000000-0000-0000-0000-000000000000";
const MAX_UUID = "ffffffff-ffff-ffff-ffff-ffffffffffff";

const versionDescriptions: Record<string, string> = {
  "1": "UUIDv1 — Gregorian time-based",
  "2": "UUIDv2 — DCE Security reserved form",
  "3": "UUIDv3 — name-based with MD5",
  "4": "UUIDv4 — random or pseudorandom",
  "5": "UUIDv5 — name-based with SHA-1",
  "6": "UUIDv6 — reordered Gregorian time-based",
  "7": "UUIDv7 — Unix-epoch time-based",
  "8": "UUIDv8 — custom format",
};

function normalizePresentation(input: string): { value: string; presentation: string } {
  const trimmed = input.trim();

  if (/^urn:uuid:/i.test(trimmed)) {
    return { value: trimmed.slice(9), presentation: "UUID URN" };
  }

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return { value: trimmed.slice(1, -1), presentation: "Braced UUID string" };
  }

  return { value: trimmed, presentation: "Canonical UUID string" };
}

function getVariant(char: string): string {
  const value = parseInt(char, 16);
  if (Number.isNaN(value)) return "Unknown";
  if ((value & 0x8) === 0) return "NCS compatibility variant (0xxx)";
  if ((value & 0xc) === 0x8) return "RFC 9562 variant (10xx)";
  if ((value & 0xe) === 0xc) return "Microsoft compatibility variant (110x)";
  return "Reserved/future variant (111x)";
}

function checkUUID(input: string): UUIDCheck {
  const presentation = normalizePresentation(input);
  const normalized = presentation.value.toLowerCase();

  if (!canonicalPattern.test(normalized)) {
    return {
      input,
      normalized,
      status: "invalid",
      statusText: "Invalid UUID text",
      presentation: presentation.presentation,
      version: "Not available",
      variant: "Not available",
      detail: "The value does not contain exactly 32 hexadecimal digits in the 8-4-4-4-12 UUID layout.",
    };
  }

  if (normalized === NIL_UUID) {
    return {
      input,
      normalized,
      status: "defined",
      statusText: "Defined special UUID",
      presentation: presentation.presentation,
      version: "Nil UUID",
      variant: "NCS compatibility bit range by value",
      detail: "RFC 9562 reserves the all-zero 128-bit UUID as the Nil UUID.",
    };
  }

  if (normalized === MAX_UUID) {
    return {
      input,
      normalized,
      status: "defined",
      statusText: "Defined special UUID",
      presentation: presentation.presentation,
      version: "Max UUID",
      variant: "Reserved/future bit range by value",
      detail: "RFC 9562 reserves the all-one 128-bit UUID as the Max UUID.",
    };
  }

  const versionNibble = normalized.charAt(14);
  const variantNibble = normalized.charAt(19);
  const variant = getVariant(variantNibble);
  const isRfcVariant = ["8", "9", "a", "b"].includes(variantNibble);

  if (!isRfcVariant) {
    return {
      input,
      normalized,
      status: "caution",
      statusText: "Canonical text, non-RFC variant",
      presentation: presentation.presentation,
      version: "Version field is not interpreted for this variant",
      variant,
      detail: "The string has UUID-shaped hexadecimal text, but its variant is outside the RFC 9562 10xx layout used for versions 1 through 8.",
    };
  }

  if (versionNibble === "2") {
    return {
      input,
      normalized,
      status: "caution",
      statusText: "DCE Security UUIDv2 form",
      presentation: presentation.presentation,
      version: versionDescriptions["2"],
      variant,
      detail: "RFC 9562 reserves version 2 for DCE Security UUIDs but leaves that UUID definition outside the scope of the specification.",
    };
  }

  const description = versionDescriptions[versionNibble];
  if (description) {
    return {
      input,
      normalized,
      status: "defined",
      statusText: "Defined RFC 9562 UUID",
      presentation: presentation.presentation,
      version: description,
      variant,
      detail:
        versionNibble === "8"
          ? "UUIDv8 fixes the version and variant bits but leaves the remaining 122 bits to an implementation-specific format; uniqueness must not be assumed from the version alone."
          : "The version and variant bit positions match a UUID form currently described by RFC 9562.",
    };
  }

  return {
    input,
    normalized,
    status: "caution",
    statusText: "Reserved or unused version",
    presentation: presentation.presentation,
    version: versionNibble === "0" ? "Version 0 — unused" : `Version ${parseInt(versionNibble, 16)} — reserved for future definition`,
    variant,
    detail: "The string has the RFC variant bits, but its version nibble is not a currently defined UUID version in RFC 9562.",
  };
}

function formatResults(results: UUIDCheck[]): string {
  const definedCount = results.filter((result) => result.status === "defined").length;
  const cautionCount = results.filter((result) => result.status === "caution").length;
  const invalidCount = results.filter((result) => result.status === "invalid").length;

  const lines = [
    `Values checked: ${results.length}`,
    `Defined UUID forms: ${definedCount}`,
    `Reserved/non-RFC forms: ${cautionCount}`,
    `Invalid text: ${invalidCount}`,
    "",
  ];

  results.forEach((result, index) => {
    lines.push(`${index + 1}. ${result.input}`);
    if (result.normalized && result.normalized !== result.input.toLowerCase()) {
      lines.push(`   Normalized: ${result.normalized}`);
    }
    lines.push(`   Status: ${result.statusText}`);
    lines.push(`   Presentation: ${result.presentation}`);
    lines.push(`   Version: ${result.version}`);
    lines.push(`   Variant: ${result.variant}`);
    lines.push(`   Note: ${result.detail}`);
    lines.push("");
  });

  return lines.join("\n").trim();
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  const validateUUIDs = () => {
    const values = input
      .split(/[\s,]+/)
      .map((value) => value.trim())
      .filter(Boolean);

    if (values.length === 0) {
      setError("Enter one or more UUID values to validate.");
      setOutput("");
      setCopyStatus("");
      return;
    }

    if (values.length > 200) {
      setError("Check up to 200 UUID values at a time so the result stays readable.");
      setOutput("");
      setCopyStatus("");
      return;
    }

    setOutput(formatResults(values.map(checkUUID)));
    setError("");
    setCopyStatus("");
  };

  const loadExample = () => {
    setInput(sampleUUIDs);
    setOutput("");
    setError("");
    setCopyStatus("");
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setCopyStatus("");
  };

  const copyOutput = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopyStatus("Copied");
    } catch {
      setCopyStatus("Copy failed");
    }
  };

  return (
    <ToolShell
      title="UUID Validator"
      description="Check canonical, URN, or braced UUID strings against RFC 9562 version and variant rules."
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="uuid-input">
          UUID Input
        </label>
        <textarea
          id="uuid-input"
          value={input}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
            setInput(event.target.value);
            setCopyStatus("");
          }}
          placeholder={sampleUUIDs}
          spellCheck={false}
          className="min-h-[240px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Separate values with whitespace or commas. Canonical UUID strings, <code>urn:uuid:</code> values, and braced strings are recognized.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={validateUUIDs} className="yoryantra-btn whitespace-nowrap">Validate UUIDs</button>
        <button type="button" onClick={loadExample} className="yoryantra-btn-outline whitespace-nowrap">Load Example</button>
        <button type="button" onClick={resetAll} className="yoryantra-btn-outline whitespace-nowrap">Reset</button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Validation Result</h3>
          {output && (
            <div className="flex items-center gap-3">
              {copyStatus && <span className="text-sm text-gray-600">{copyStatus}</span>}
              <button type="button" onClick={copyOutput} className="yoryantra-btn-outline text-sm whitespace-nowrap">Copy</button>
            </div>
          )}
        </div>
        <pre className="yoryantra-output min-h-[260px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "Validation details will appear here."}
        </pre>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 items-start">
        <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Format check only</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            Validation reads the UUID text and its version/variant bits. It does not query a database or prove that the identifier exists, is unique, or belongs to a particular record.
          </p>
        </div>
        <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-950">Reserved forms need context</h3>
          <p className="mt-2 text-sm leading-relaxed text-amber-900">
            A canonical 8-4-4-4-12 string can still use a non-RFC variant or a version nibble reserved for future definition. The result reports that distinction instead of calling every UUID-shaped string valid.
          </p>
        </div>
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">UUID shape, variant, and version are separate questions</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 9562 defines the familiar UUID text as 32 hexadecimal digits grouped <code>8-4-4-4-12</code>. That shape alone does not tell you how the 128 bits should be interpreted. The variant bits choose the layout family, and only the RFC <code>10xx</code> variant uses the version table that includes UUIDv1 through UUIDv8.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This validator therefore avoids the old shortcut of accepting only versions 1 through 5. RFC 9562 added UUIDv6, UUIDv7, and UUIDv8, while also defining Nil and Max as special UUID values.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">How each result is classified</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-600 leading-relaxed">
            <li><strong>Defined RFC 9562 UUID:</strong> canonical hexadecimal text, RFC variant bits, and a fully specified version such as 1, 3, 4, 5, 6, 7, or 8.</li>
            <li><strong>DCE Security UUIDv2 form:</strong> the version and variant bits identify v2, whose full definition RFC 9562 leaves outside its scope.</li>
            <li><strong>Defined special UUID:</strong> the all-zero Nil UUID or all-one Max UUID.</li>
            <li><strong>Reserved/non-RFC form:</strong> UUID-shaped text using another variant or an unused/reserved RFC-version nibble.</li>
            <li><strong>Invalid UUID text:</strong> the hexadecimal groups or separators do not match the UUID string representation.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">URNs and braces are presentation wrappers</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 9562 shows the <code>urn:uuid:</code> form for UUID URNs and notes that some implementations display the hexadecimal UUID inside curly braces. The validator removes one recognized wrapper before checking the underlying 128-bit textual form and reports which presentation it received.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Version numbers do not prove semantics by themselves</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Seeing a <code>7</code> in the version position means the bits claim UUIDv7 only when the UUID also uses the RFC variant. This page checks those fixed fields, but it does not reconstruct every version-specific timestamp, namespace, hash input, counter, or custom UUIDv8 layout. A value can pass the structural checks while still having been produced incorrectly by its original generator.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Current specification</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 9562 replaced RFC 4122 and is the reference used here for the string form, variants, versions 1–8, Nil UUID, and Max UUID.
          </p>
          <div className="mt-4 text-sm">
            <a className="font-medium text-[var(--green)] underline underline-offset-4" href="https://www.rfc-editor.org/rfc/rfc9562.html" target="_blank" rel="noreferrer">RFC 9562: Universally Unique IDentifiers</a>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/uuid-validator" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
