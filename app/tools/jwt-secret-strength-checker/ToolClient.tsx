"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "summary" | "report" | "json" | "markdown";
type SecretUse = "jwtHs256" | "jwtHs384" | "jwtHs512" | "apiSecret" | "general";
type SecretEncoding = "utf8" | "hex" | "base64" | "base64url";
type Severity = "info" | "warning" | "high";

type Issue = {
  severity: Severity;
  title: string;
  message: string;
};

type SecretResult = {
  status: "needs replacement" | "review" | "no obvious weakness";
  secretPreview: string;
  inputCharacters: number;
  codePoints: number;
  keyBytes: number;
  requiredBytes: number;
  requirementLabel: string;
  meetsByteFloor: boolean;
  detectedShape: string;
  encoding: SecretEncoding;
  issues: Issue[];
  output: string;
};

const sampleSecret = "mJ7Xf4v9Q2tL8pN6sR3wY1zC5bH0uKqA";

const weakFragments = [
  "secret",
  "jwtsecret",
  "jwt-secret",
  "your-256-bit-secret",
  "changeme",
  "change-me",
  "password",
  "admin",
  "default",
  "qwerty",
  "letmein",
  "supersecret",
  "mysecret",
  "privatekey",
];

const useOptions: Array<{ label: string; value: SecretUse }> = [
  { label: "JWT HS256", value: "jwtHs256" },
  { label: "JWT HS384", value: "jwtHs384" },
  { label: "JWT HS512", value: "jwtHs512" },
  { label: "API / application secret", value: "apiSecret" },
  { label: "General shared secret", value: "general" },
];

const encodingOptions: Array<{ label: string; value: SecretEncoding }> = [
  { label: "UTF-8 text bytes", value: "utf8" },
  { label: "Hex-encoded bytes", value: "hex" },
  { label: "Base64-encoded bytes", value: "base64" },
  { label: "Base64URL-encoded bytes", value: "base64url" },
];

export default function ToolClient() {
  const [secret, setSecret] = useState("");
  const [secretUse, setSecretUse] = useState<SecretUse>("jwtHs256");
  const [secretEncoding, setSecretEncoding] = useState<SecretEncoding>("utf8");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [maskSecret, setMaskSecret] = useState(true);
  const [checkDefaultSecrets, setCheckDefaultSecrets] = useState(true);
  const [checkPatterns, setCheckPatterns] = useState(true);
  const [result, setResult] = useState<SecretResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const warnings = useMemo(
    () => result?.issues.filter((item) => item.severity === "warning") || [],
    [result]
  );
  const highIssues = useMemo(
    () => result?.issues.filter((item) => item.severity === "high") || [],
    [result]
  );
  const infoItems = useMemo(
    () => result?.issues.filter((item) => item.severity === "info") || [],
    [result]
  );

  const clearResult = () => {
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const checkSecret = () => {
    if (secret.length === 0) {
      setError("Enter the exact secret value you want to assess.");
      setResult(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const next = analyzeSecret({
        secret,
        secretUse,
        secretEncoding,
        outputMode,
        maskSecret,
        checkDefaultSecrets,
        checkPatterns,
      });

      setResult(next);
      setOutput(next.output);
      setError("");
      setCopied(false);
    } catch (caught) {
      setResult(null);
      setOutput("");
      setCopied(false);
      setError(
        caught instanceof Error
          ? caught.message
          : "The secret could not be interpreted with the selected encoding."
      );
    }
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setError("The report could not be copied. Select and copy it manually.");
    }
  };

  const loadExample = () => {
    setSecret(sampleSecret);
    setSecretUse("jwtHs256");
    setSecretEncoding("utf8");
    setOutputMode("summary");
    setMaskSecret(true);
    setCheckDefaultSecrets(true);
    setCheckPatterns(true);
    clearResult();
  };

  const resetAll = () => {
    setSecret("");
    setSecretUse("jwtHs256");
    setSecretEncoding("utf8");
    setOutputMode("summary");
    setMaskSecret(true);
    setCheckDefaultSecrets(true);
    setCheckPatterns(true);
    clearResult();
  };

  return (
    <ToolShell
      title="JWT Secret Strength Checker"
      description="Check HMAC JWT secret bytes against JWA minimums and obvious guessable patterns."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          JWT or HMAC Secret
        </label>

        <textarea
          value={secret}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
            setSecret(event.target.value);
            clearResult();
          }}
          placeholder={sampleSecret}
          spellCheck={false}
          autoComplete="off"
          className="min-h-[210px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          The value is not trimmed or normalized. For UTF-8 mode, spaces and line endings are part of the key bytes.
        </p>
      </div>

      <div className="mt-6 self-start rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        A signing secret is a credential. Prefer a disposable test value here. If you must examine a production key, keep the page and any screenshots private and leave masking enabled.
      </div>

      {!maskSecret && (
        <div className="mt-4 self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
          Masking is off. Generated output will contain the complete secret value, so do not paste that report into tickets, chat, logs, or screenshots.
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Tell the checker how your application uses the value
        </h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Signing use"
            value={secretUse}
            onChange={(value: string) => {
              setSecretUse(value as SecretUse);
              clearResult();
            }}
            options={useOptions}
          />

          <YoryantraSelect
            label="Key representation"
            value={secretEncoding}
            onChange={(value: string) => {
              setSecretEncoding(value as SecretEncoding);
              clearResult();
            }}
            options={encodingOptions}
          />

          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value: string) => {
              setOutputMode(value as OutputMode);
              clearResult();
            }}
            options={[
              { label: "Summary", value: "summary" },
              { label: "Detailed report", value: "report" },
              { label: "JSON", value: "json" },
              { label: "Markdown", value: "markdown" },
            ]}
          />

          <div className="space-y-3 md:col-span-2">
            <CheckboxRow
              checked={maskSecret}
              label="Mask the secret in copied output"
              onChange={(checked) => {
                setMaskSecret(checked);
                clearResult();
              }}
            />
            <CheckboxRow
              checked={checkDefaultSecrets}
              label="Look for common placeholder and default words"
              onChange={(checked) => {
                setCheckDefaultSecrets(checked);
                clearResult();
              }}
            />
            <CheckboxRow
              checked={checkPatterns}
              label="Look for repeated or predictable text patterns"
              onChange={(checked) => {
                setCheckPatterns(checked);
                clearResult();
              }}
            />
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          JWA requires HMAC keys at least as large as the hash output: 32 bytes for HS256, 48 for HS384, and 64 for HS512. Those byte floors do not become optional in a “relaxed” mode.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={checkSecret} className="yoryantra-btn whitespace-nowrap">
          Check Secret
        </button>

        <button
          onClick={copyOutput}
          className="yoryantra-btn-outline whitespace-nowrap"
          disabled={!output}
        >
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
        <div className="mt-8 grid items-start gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Local result" value={result.status} />
          <SummaryCard label="Key bytes" value={String(result.keyBytes)} />
          <SummaryCard
            label={result.requirementLabel}
            value={`${result.requiredBytes} bytes`}
          />
          <SummaryCard label="Representation" value={encodingLabel(result.encoding)} />
        </div>
      )}

      {result && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            What was actually measured
          </h3>

          <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
            <InfoCard label="Masked input" value={result.secretPreview} />
            <InfoCard label="Input characters" value={String(result.inputCharacters)} />
            <InfoCard label="Unicode code points" value={String(result.codePoints)} />
            <InfoCard label="Detected shape" value={result.detectedShape} />
          </div>

          <p className="mt-4 text-sm leading-relaxed text-gray-500">
            A Base64-looking or hex-looking string is not automatically decoded by JWT libraries. The selected representation controls the byte count shown above.
          </p>
        </div>
      )}

      {highIssues.length > 0 && (
        <FindingCard
          tone="red"
          title="Replace or correct before using this key"
          items={highIssues}
        />
      )}

      {warnings.length > 0 && (
        <FindingCard
          tone="amber"
          title="Things worth checking"
          items={warnings}
        />
      )}

      {infoItems.length > 0 && (
        <FindingCard
          tone="neutral"
          title="What the local check can confirm"
          items={infoItems}
        />
      )}

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Output
          </h3>

          {output && (
            <button
              onClick={copyOutput}
              className="yoryantra-btn-outline whitespace-nowrap text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output min-h-[280px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "JWT secret assessment will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
        Analysis stays in this browser. The page counts or decodes the value you provide and never needs to send the secret to a verification service.
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            HMAC security starts with the actual key bytes
          </h2>

          <p className="mt-4 leading-relaxed text-gray-600">
            HS256, HS384, and HS512 are symmetric JWT signing algorithms: the same secret is used to create and verify the MAC. RFC 7518 requires a key at least as large as the corresponding hash output—256, 384, or 512 bits.
          </p>

          <p className="mt-4 leading-relaxed text-gray-600">
            Character count is not the standard. A 32-character ASCII value is 32 bytes, while 32 non-ASCII characters may occupy more UTF-8 bytes. Encoded strings add another wrinkle because an application may use the visible characters directly or decode them into bytes first.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Meeting the byte floor does not make a guessable phrase strong
          </h2>

          <p className="mt-4 leading-relaxed text-gray-600">
            A long project name, repeated character, leaked environment value, or familiar placeholder can still be a poor signing key. Anyone who has a valid HMAC-signed token can test candidate secrets offline, so predictable text deserves different treatment from uniformly random bytes.
          </p>

          <p className="mt-4 leading-relaxed text-gray-600">
            That is why the result separates the standards-based byte check from local pattern checks instead of turning both into one invented “entropy score.”
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Raw text, hex, and Base64 are not interchangeable
          </h2>

          <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
            <div className="grid gap-3 bg-gray-50 p-4 text-sm text-gray-700 md:grid-cols-2">
              <div>
                <p className="font-semibold text-gray-900">UTF-8 text</p>
                <p className="mt-1 leading-relaxed">
                  The exact entered text is encoded as UTF-8. Leading, trailing, and internal whitespace remain part of the key.
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Encoded bytes</p>
                <p className="mt-1 leading-relaxed">
                  Hex, Base64, or Base64URL mode decodes the representation first. Choose one of these only when your application does the same.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            A safer way to create and rotate HMAC JWT keys
          </h2>

          <ol className="mt-4 list-decimal space-y-2 pl-5 leading-relaxed text-gray-600">
            <li>Generate the required number of random bytes with a cryptographically secure random source.</li>
            <li>Store the key in a secret manager or another credential store rather than source code.</li>
            <li>Configure the verifier to accept only the HMAC algorithm you intentionally deploy.</li>
            <li>Plan rotation so old tokens can age out without leaving one secret active indefinitely.</li>
            <li>If a key appears in logs, source control, chat, or screenshots, treat the exposure separately from its measured strength.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Where the requirements come from
          </h2>

          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 7518 defines HS256, HS384, and HS512 and requires keys of at least 256, 384, and 512 bits respectively. RFC 8725 adds JWT deployment guidance, including algorithm verification and key-management cautions.
          </p>

          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            References:{" "}
            <a
              href="https://www.rfc-editor.org/rfc/rfc7518#section-3.2"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-2"
            >
              RFC 7518 §3.2
            </a>
            {" "}and{" "}
            <a
              href="https://www.rfc-editor.org/rfc/rfc8725"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-2"
            >
              RFC 8725
            </a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Limits of a pasted-secret check
          </h2>

          <p className="mt-4 leading-relaxed text-gray-600">
            A single visible value cannot prove how it was generated, whether copies exist elsewhere, whether it is reused, or whether your verifier handles algorithms safely. “No obvious weakness” therefore means only that the selected byte requirement and the checks on this page did not find a problem.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/jwt-secret-strength-checker" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function CheckboxRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-sm font-medium leading-relaxed text-gray-900">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]"
      />
      <span>{label}</span>
    </label>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-1 break-words font-mono text-base font-semibold text-gray-900 [overflow-wrap:anywhere]">
        {value}
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-1 break-words font-mono text-sm font-semibold text-gray-900 [overflow-wrap:anywhere]">
        {value}
      </div>
    </div>
  );
}

function FindingCard({
  tone,
  title,
  items,
}: {
  tone: "red" | "amber" | "neutral";
  title: string;
  items: Issue[];
}) {
  const classes =
    tone === "red"
      ? "border-red-200 bg-red-50 text-red-800"
      : tone === "amber"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-gray-200 bg-gray-50 text-gray-600";

  const heading =
    tone === "red"
      ? "text-red-900"
      : tone === "amber"
        ? "text-amber-900"
        : "text-gray-900";

  return (
    <div className={`mt-6 self-start rounded-xl border p-4 ${classes}`}>
      <h3 className={`text-sm font-semibold ${heading}`}>{title}</h3>
      <div className="mt-3 space-y-3">
        {items.map((item, index) => (
          <div key={`${item.title}-${index}`}>
            <p className={`text-sm font-semibold ${heading}`}>{item.title}</p>
            <p className="mt-1 text-sm leading-relaxed">{item.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function analyzeSecret(options: {
  secret: string;
  secretUse: SecretUse;
  secretEncoding: SecretEncoding;
  outputMode: OutputMode;
  maskSecret: boolean;
  checkDefaultSecrets: boolean;
  checkPatterns: boolean;
}): SecretResult {
  const bytes = decodeSecretBytes(options.secret, options.secretEncoding);
  const required = minimumForUse(options.secretUse);
  const inputCharacters = options.secret.length;
  const codePoints = Array.from(options.secret).length;
  const detectedShape = detectShape(options.secret);
  const issues = buildIssues({
    secret: options.secret,
    secretUse: options.secretUse,
    secretEncoding: options.secretEncoding,
    keyBytes: bytes.length,
    requiredBytes: required.bytes,
    requirementLabel: required.label,
    checkDefaultSecrets: options.checkDefaultSecrets,
    checkPatterns: options.checkPatterns,
  });

  const status = getStatus(issues);
  const base = {
    status,
    secretPreview: options.maskSecret ? maskValue(options.secret) : options.secret,
    inputCharacters,
    codePoints,
    keyBytes: bytes.length,
    requiredBytes: required.bytes,
    requirementLabel: required.label,
    meetsByteFloor: bytes.length >= required.bytes,
    detectedShape,
    encoding: options.secretEncoding,
    issues,
  };

  return {
    ...base,
    output: formatOutput(base, options.outputMode),
  };
}

function decodeSecretBytes(value: string, encoding: SecretEncoding): Uint8Array {
  if (encoding === "utf8") {
    return new TextEncoder().encode(value);
  }

  if (/\s/.test(value)) {
    throw new Error(`${encodingLabel(encoding)} input cannot contain whitespace.`);
  }

  if (encoding === "hex") {
    if (!/^[0-9a-fA-F]+$/.test(value) || value.length % 2 !== 0) {
      throw new Error("Hex input must contain an even number of hexadecimal characters.");
    }

    const bytes = new Uint8Array(value.length / 2);

    for (let index = 0; index < value.length; index += 2) {
      bytes[index / 2] = Number.parseInt(value.slice(index, index + 2), 16);
    }

    return bytes;
  }

  if (encoding === "base64url") {
    if (!/^[A-Za-z0-9_-]+={0,2}$/.test(value)) {
      throw new Error("Base64URL input may contain only letters, digits, -, _, and optional trailing padding.");
    }

    const firstPadding = value.indexOf("=");
    if (firstPadding !== -1 && firstPadding < value.length - 2) {
      throw new Error("Base64URL padding may appear only at the end.");
    }

    const unpadded = value.replace(/=+$/, "");
    if (unpadded.length % 4 === 1) {
      throw new Error("Base64URL input has an impossible length.");
    }

    const standard = unpadded.replace(/-/g, "+").replace(/_/g, "/");
    const bytes = decodeBase64(standard);
    const canonical = bytesToBase64(bytes)
      .replace(/=+$/, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    if (canonical !== unpadded) {
      throw new Error("Base64URL input is not a canonical encoding of these bytes.");
    }

    return bytes;
  }

  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value)) {
    throw new Error("Base64 input may contain only the standard Base64 alphabet and optional trailing padding.");
  }

  const firstPadding = value.indexOf("=");
  if (firstPadding !== -1 && firstPadding < value.length - 2) {
    throw new Error("Base64 padding may appear only at the end.");
  }

  const unpadded = value.replace(/=+$/, "");
  if (unpadded.length % 4 === 1) {
    throw new Error("Base64 input has an impossible length.");
  }

  const bytes = decodeBase64(unpadded);
  const canonical = bytesToBase64(bytes).replace(/=+$/, "");

  if (canonical !== unpadded) {
    throw new Error("Base64 input is not a canonical encoding of these bytes.");
  }

  return bytes;
}

function decodeBase64(unpadded: string): Uint8Array {
  const padding = "=".repeat((4 - (unpadded.length % 4)) % 4);
  let binary = "";

  try {
    binary = atob(unpadded + padding);
  } catch {
    throw new Error("The encoded key could not be decoded.");
  }

  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return btoa(binary);
}

function hasUnpairedSurrogate(value: string) {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);

    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1);

      if (next >= 0xdc00 && next <= 0xdfff) {
        index += 1;
      } else {
        return true;
      }
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      return true;
    }
  }

  return false;
}

function minimumForUse(secretUse: SecretUse): { bytes: number; label: string } {
  if (secretUse === "jwtHs512") return { bytes: 64, label: "JWA minimum" };
  if (secretUse === "jwtHs384") return { bytes: 48, label: "JWA minimum" };
  if (secretUse === "jwtHs256") return { bytes: 32, label: "JWA minimum" };

  return { bytes: 32, label: "Advisory baseline" };
}

function buildIssues(options: {
  secret: string;
  secretUse: SecretUse;
  secretEncoding: SecretEncoding;
  keyBytes: number;
  requiredBytes: number;
  requirementLabel: string;
  checkDefaultSecrets: boolean;
  checkPatterns: boolean;
}): Issue[] {
  const issues: Issue[] = [];
  const isJwtHmac = options.secretUse.startsWith("jwtHs");

  if (options.keyBytes < options.requiredBytes) {
    issues.push({
      severity: isJwtHmac ? "high" : "warning",
      title: isJwtHmac ? "Below the JWA key-size requirement" : "Shorter than the advisory baseline",
      message: `${labelForUse(options.secretUse)} is being assessed as ${options.keyBytes} key bytes; ${options.requiredBytes} bytes are ${isJwtHmac ? "required by JWA" : "used here as a conservative random-secret baseline"}.`,
    });
  } else {
    issues.push({
      severity: "info",
      title: isJwtHmac ? "JWA byte floor is met" : "Advisory byte baseline is met",
      message: `${options.keyBytes} key bytes meet the ${options.requiredBytes}-byte ${isJwtHmac ? "minimum for this JWT HMAC algorithm" : "baseline used for this non-JWT case"}.`,
    });
  }

  const lower = options.secret.toLowerCase();

  if (options.secretEncoding === "utf8" && options.checkDefaultSecrets) {
    if (weakFragments.some((fragment) => lower === fragment)) {
      issues.push({
        severity: "high",
        title: "The entire value is a familiar default or placeholder",
        message: "This belongs in a guessing dictionary rather than in a JWT signing key.",
      });
    } else if (weakFragments.some((fragment) => lower.includes(fragment))) {
      issues.push({
        severity: "warning",
        title: "A familiar secret fragment appears in the value",
        message: "Human-readable secret words can indicate a constructed phrase rather than uniformly random key material.",
      });
    }
  }

  if (options.checkPatterns && options.secretEncoding === "utf8") {
    if (/^([\s\S])\1+$/u.test(options.secret)) {
      issues.push({
        severity: "high",
        title: "One character is repeated",
        message: "Length alone does not help when the entire text is the same repeated character.",
      });
    }

    if (/(?:012345|123456|234567|abcdef|qwerty|letmein|password|changeme)/i.test(options.secret)) {
      issues.push({
        severity: "high",
        title: "Predictable sequence is present",
        message: "The text contains a sequence or phrase that belongs in a guessing dictionary rather than a signing key.",
      });
    }

    if (/^[A-Za-z0-9_-]+(?:[-_][A-Za-z0-9_-]+){1,}$/u.test(options.secret) && /[A-Za-z]/.test(options.secret)) {
      issues.push({
        severity: "warning",
        title: "The value looks phrase-like",
        message: "A long human-readable identifier can satisfy a byte count while still being much easier to guess than random bytes.",
      });
    }
  }

  if (options.secretEncoding === "utf8" && /^\s|\s$/u.test(options.secret)) {
    issues.push({
      severity: "warning",
      title: "Leading or trailing whitespace is part of the key",
      message: "The checker preserves it. Confirm your application does too, because trimming would produce a different HMAC key.",
    });
  }

  if (options.secretEncoding === "utf8" && hasUnpairedSurrogate(options.secret)) {
    issues.push({
      severity: "warning",
      title: "Malformed Unicode changes during UTF-8 encoding",
      message: "TextEncoder replaces an unpaired UTF-16 surrogate with U+FFFD. Confirm that the application creates key bytes the same way.",
    });
  }

  if (
    options.secretEncoding === "utf8" &&
    /^(?:sk-|ghp_|gho_|github_pat_|xox[baprs]-)/i.test(options.secret)
  ) {
    issues.push({
      severity: "warning",
      title: "The value resembles another service credential",
      message: "Do not reuse an API or platform token as a JWT signing key. Generate a separate credential for signing.",
    });
  }

  if (options.secretEncoding !== "utf8") {
    issues.push({
      severity: "info",
      title: "Decoded bytes were measured",
      message: `${encodingLabel(options.secretEncoding)} was decoded before the byte check. Make sure your JWT library receives those decoded bytes rather than the visible encoded text.`,
    });
  }

  if (issues.every((item) => item.severity === "info")) {
    issues.push({
      severity: "info",
      title: "No obvious guessable pattern was found",
      message: "That result cannot prove the key came from a cryptographically secure generator, is unique, or has never been exposed.",
    });
  }

  return issues;
}

function getStatus(issues: Issue[]): SecretResult["status"] {
  if (issues.some((item) => item.severity === "high")) return "needs replacement";
  if (issues.some((item) => item.severity === "warning")) return "review";
  return "no obvious weakness";
}

function detectShape(value: string) {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    return "UUID-shaped text";
  }

  if (/^[0-9a-f]+$/i.test(value) && value.length >= 32 && value.length % 2 === 0) {
    return "hex-shaped text";
  }

  if (/^[A-Za-z0-9]+={0,2}$/.test(value) && value.length >= 24) {
    return "Base64/Base64URL-shaped text";
  }

  if (/^[A-Za-z0-9+/]+={0,2}$/.test(value) && value.length >= 24) {
    return "Base64-shaped text";
  }

  if (/^[A-Za-z0-9_-]+={0,2}$/.test(value) && value.length >= 24) {
    return "Base64URL-shaped text";
  }

  if (/^[A-Za-z0-9_-]+(?:[-_][A-Za-z0-9_-]+)+$/.test(value)) {
    return "phrase/identifier-shaped text";
  }

  return "plain text";
}

function labelForUse(secretUse: SecretUse) {
  if (secretUse === "jwtHs256") return "JWT HS256";
  if (secretUse === "jwtHs384") return "JWT HS384";
  if (secretUse === "jwtHs512") return "JWT HS512";
  if (secretUse === "apiSecret") return "API/application secret";
  return "general shared secret";
}

function encodingLabel(encoding: SecretEncoding) {
  if (encoding === "utf8") return "UTF-8 text";
  if (encoding === "hex") return "hex";
  if (encoding === "base64") return "Base64";
  return "Base64URL";
}

function maskValue(value: string) {
  const count = Array.from(value).length;
  return `[masked: ${count} ${count === 1 ? "character" : "characters"}]`;
}

function formatOutput(
  result: Omit<SecretResult, "output">,
  mode: OutputMode
) {
  if (mode === "json") {
    return JSON.stringify(result, null, 2);
  }

  if (mode === "markdown") {
    return [
      "# JWT secret assessment",
      "",
      `- Result: **${result.status}**`,
      `- Key bytes: ${result.keyBytes}`,
      `- ${result.requirementLabel}: ${result.requiredBytes} bytes`,
      `- Representation: ${encodingLabel(result.encoding)}`,
      `- Input characters: ${result.inputCharacters}`,
      `- Unicode code points: ${result.codePoints}`,
      `- Detected shape: ${result.detectedShape}`,
      `- Secret preview: \`${escapeMarkdown(result.secretPreview)}\``,
      "",
      "## Findings",
      ...result.issues.map((item) => `- **${item.title}:** ${item.message}`),
    ].join("\n");
  }

  if (mode === "report") {
    return [
      "JWT Secret Assessment",
      "---------------------",
      `Result: ${result.status}`,
      `Secret preview: ${result.secretPreview}`,
      `Key bytes: ${result.keyBytes}`,
      `${result.requirementLabel}: ${result.requiredBytes} bytes`,
      `Representation: ${encodingLabel(result.encoding)}`,
      `Input characters: ${result.inputCharacters}`,
      `Unicode code points: ${result.codePoints}`,
      `Detected shape: ${result.detectedShape}`,
      "",
      "Findings:",
      ...result.issues.map((item) => `- [${item.severity}] ${item.title}: ${item.message}`),
    ].join("\n");
  }

  return [
    "JWT Secret Assessment",
    "---------------------",
    `Result: ${result.status}`,
    `Key bytes: ${result.keyBytes}`,
    `${result.requirementLabel}: ${result.requiredBytes} bytes`,
    `Representation: ${encodingLabel(result.encoding)}`,
    `Secret preview: ${result.secretPreview}`,
    "",
    ...result.issues.map((item) => `- ${item.title}: ${item.message}`),
  ].join("\n");
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, "\\n");
}
