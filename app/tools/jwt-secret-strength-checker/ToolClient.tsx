"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "summary" | "report" | "json" | "markdown" | "csv";
type SecretUse = "jwtHs256" | "jwtHs384" | "jwtHs512" | "apiSecret" | "general";
type Strictness = "balanced" | "strict" | "relaxed";

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type SecretResult = {
  secretPreview: string;
  length: number;
  uniqueChars: number;
  charsetSize: number;
  estimatedEntropy: number;
  score: number;
  grade: "strong" | "okay" | "weak" | "danger";
  detectedFormat: string;
  issues: Issue[];
  output: string;
};

const sampleSecret = "replace-this-with-a-random-32-byte-secret";

const weakSecrets = [
  "secret",
  "jwtsecret",
  "jwt-secret",
  "your-256-bit-secret",
  "changeme",
  "change-me",
  "password",
  "admin",
  "default",
  "test",
  "dev",
  "development",
  "production",
  "123456",
  "qwerty",
  "letmein",
  "supersecret",
  "mysecret",
  "privatekey",
];

export default function ToolClient() {
  const [secret, setSecret] = useState("");
  const [secretUse, setSecretUse] = useState<SecretUse>("jwtHs256");
  const [strictness, setStrictness] = useState<Strictness>("balanced");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [maskSecret, setMaskSecret] = useState(true);
  const [checkDefaultSecrets, setCheckDefaultSecrets] = useState(true);
  const [checkPatterns, setCheckPatterns] = useState(true);
  const [checkFormat, setCheckFormat] = useState(true);
  const [result, setResult] = useState<SecretResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getNotes(result, secretUse) : []), [result, secretUse]);

  const clearResult = () => {
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const checkSecret = () => {
    if (!secret) {
      setError("Please enter a JWT or HMAC signing secret to check.");
      setResult(null);
      setOutput("");
      return;
    }

    const next = analyzeSecret({
      secret,
      secretUse,
      strictness,
      outputMode,
      maskSecret,
      checkDefaultSecrets,
      checkPatterns,
      checkFormat,
    });

    setResult(next);
    setOutput(next.output);
    setError("");
    setCopied(false);
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const loadExample = () => {
    setSecret(sampleSecret);
    setSecretUse("jwtHs256");
    setStrictness("balanced");
    setOutputMode("summary");
    setMaskSecret(true);
    setCheckDefaultSecrets(true);
    setCheckPatterns(true);
    setCheckFormat(true);
    clearResult();
  };

  const resetAll = () => {
    setSecret("");
    setSecretUse("jwtHs256");
    setStrictness("balanced");
    setOutputMode("summary");
    setMaskSecret(true);
    setCheckDefaultSecrets(true);
    setCheckPatterns(true);
    setCheckFormat(true);
    clearResult();
  };

  return (
    <ToolShell
      title="JWT Secret Strength Checker"
      description="Check JWT signing secret strength locally in your browser. Estimate entropy, detect weak/default secrets, repeated patterns, short keys, and risky HMAC signing secret formats."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          JWT or HMAC Secret
        </label>

        <textarea
          value={secret}
          onChange={(event) => {
            setSecret(event.target.value);
            clearResult();
          }}
          placeholder={sampleSecret}
          className="w-full min-h-[210px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste a signing secret to estimate strength. The check runs locally in your browser.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Do not paste real production secrets unless you are working in a private environment. This tool runs locally, but masking secrets before screenshots or sharing is still a safer habit.
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Secret Use"
            value={secretUse}
            onChange={(value) => {
              setSecretUse(value as SecretUse);
              clearResult();
            }}
            options={[
              { label: "JWT HS256", value: "jwtHs256" },
              { label: "JWT HS384", value: "jwtHs384" },
              { label: "JWT HS512", value: "jwtHs512" },
              { label: "API secret", value: "apiSecret" },
              { label: "General shared secret", value: "general" },
            ]}
          />

          <YoryantraSelect
            label="Checking Style"
            value={strictness}
            onChange={(value) => {
              setStrictness(value as Strictness);
              clearResult();
            }}
            options={[
              { label: "Balanced", value: "balanced" },
              { label: "Strict", value: "strict" },
              { label: "Relaxed", value: "relaxed" },
            ]}
          />

          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value) => {
              setOutputMode(value as OutputMode);
              clearResult();
            }}
            options={[
              { label: "Summary", value: "summary" },
              { label: "Detailed report", value: "report" },
              { label: "JSON", value: "json" },
              { label: "Markdown table", value: "markdown" },
              { label: "CSV", value: "csv" },
            ]}
          />

          <div className="md:col-span-2 space-y-3">
            <CheckboxRow checked={maskSecret} label="Mask secret in output" onChange={(checked) => { setMaskSecret(checked); clearResult(); }} />
            <CheckboxRow checked={checkDefaultSecrets} label="Check common weak/default secret words" onChange={(checked) => { setCheckDefaultSecrets(checked); clearResult(); }} />
            <CheckboxRow checked={checkPatterns} label="Check repeated characters and predictable patterns" onChange={(checked) => { setCheckPatterns(checked); clearResult(); }} />
            <CheckboxRow checked={checkFormat} label="Detect base64, hex, UUID, and random-looking formats" onChange={(checked) => { setCheckFormat(checked); clearResult(); }} />
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          JWT HMAC secrets should be long, random, and stored securely. Human-readable words are usually risky.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={checkSecret} className="yoryantra-btn">
          Check Secret Strength
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
          <SummaryCard label="Grade" value={result.grade} />
          <SummaryCard label="Score" value={`${result.score}/100`} />
          <SummaryCard label="Length" value={String(result.length)} />
          <SummaryCard label="Entropy" value={`${result.estimatedEntropy} bits`} />
        </div>
      )}

      {result && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Secret Review</h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <InfoCard label="Preview" value={result.secretPreview} />
            <InfoCard label="Detected Format" value={result.detectedFormat} />
            <InfoCard label="Unique Characters" value={String(result.uniqueChars)} />
            <InfoCard label="Charset Size" value={String(result.charsetSize)} />
          </div>
        </div>
      )}

      {result && result.issues.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">Secret findings</h3>

          <div className="mt-3 space-y-3">
            {result.issues.map((issue, index) => (
              <div key={`${issue.title}-${index}`}>
                <p className="text-sm font-semibold text-amber-900">{issue.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-amber-800">{issue.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900">JWT secret guidance</h3>

          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-blue-900">{note.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-blue-800">{note.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Output</h3>

          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">
          {output || "JWT secret strength output will appear here."}
        </pre>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Checking JWT Signing Secrets Before Deployment</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JWTs signed with HMAC algorithms such as HS256 rely on a shared secret. If that secret is short, predictable, reused, or based on a common word, attackers may be able to guess it and forge tokens.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This JWT Secret Strength Checker estimates whether a secret looks safe enough for signing tokens by reviewing length, entropy, character variety, weak words, repeated patterns, and random-looking formats.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Using the JWT Secret Strength Checker</h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste a JWT or HMAC signing secret.</li>
            <li>Choose the expected use, such as HS256, HS384, or HS512.</li>
            <li>Review length, entropy estimate, grade, and warnings.</li>
            <li>Replace weak secrets with long random values from a secure generator.</li>
            <li>Store secrets in environment variables or secret managers, not in code.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Common Weak JWT Secret Problems</h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Using words like secret, password, default, or changeme.</li>
            <li>Using project names, app names, or environment names as secrets.</li>
            <li>Using secrets that are too short for the signing algorithm.</li>
            <li>Repeating the same character or simple sequence.</li>
            <li>Committing secrets into source code or public repositories.</li>
            <li>Reusing one secret across many environments or applications.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Safer JWT Secret Example</h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Use a long random value, for example a 32-byte or 64-byte secret generated by a secure random source.`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Secret Strength Is Only One Part of JWT Security</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A strong secret helps protect token signatures, but JWT security also depends on algorithm restrictions, expiration times, audience checks, issuer validation, key rotation, HTTPS, and safe token storage.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Use this checker to catch weak secrets, then review the full JWT validation flow separately.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>

          <div className="mt-5 space-y-6">
            <Faq title="What does a JWT secret strength checker do?">
              It estimates whether a JWT signing secret is long, random, and resistant to guessing.
            </Faq>

            <Faq title="How long should a JWT secret be?">
              For HS256, a random 32-byte secret is a common practical minimum. Higher algorithms can use longer random secrets.
            </Faq>

            <Faq title="Is entropy estimation exact?">
              No. Entropy here is an estimate based on character variety and length. Human-chosen secrets may be weaker than they look.
            </Faq>

            <Faq title="Should I paste production secrets?">
              Avoid pasting real production secrets unless you are in a private trusted environment. This tool runs locally, but caution is still best.
            </Faq>

            <Faq title="Is anything uploaded when I check a secret?">
              No. The check runs directly in your browser.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/jwt-decoder" className="yoryantra-btn-outline">JWT Decoder</Link>
            <Link href="/tools/jwt-claims-inspector" className="yoryantra-btn-outline">JWT Claims Inspector</Link>
            <Link href="/tools/hash-generator" className="yoryantra-btn-outline">Hash Generator</Link>
            <Link href="/tools/random-password-generator" className="yoryantra-btn-outline">Random Password Generator</Link>
            <Link href="/tools/api-key-generator" className="yoryantra-btn-outline">API Key Generator</Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function CheckboxRow({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[var(--light-gold)]"
      />
      {label}
    </label>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 break-words font-mono text-sm font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function Faq({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600 leading-relaxed">{children}</p>
    </div>
  );
}

function analyzeSecret(options: {
  secret: string;
  secretUse: SecretUse;
  strictness: Strictness;
  outputMode: OutputMode;
  maskSecret: boolean;
  checkDefaultSecrets: boolean;
  checkPatterns: boolean;
  checkFormat: boolean;
}): SecretResult {
  const normalizedSecret = options.secret.trim();
  const length = normalizedSecret.length;
  const uniqueChars = new Set(normalizedSecret).size;
  const charsetSize = estimateCharsetSize(normalizedSecret);
  const estimatedEntropy = Math.round(length * Math.log2(Math.max(charsetSize, 1)));
  const detectedFormat = options.checkFormat ? detectFormat(normalizedSecret) : "not checked";
  const issues = buildIssues({
    secret: normalizedSecret,
    length,
    uniqueChars,
    estimatedEntropy,
    detectedFormat,
    secretUse: options.secretUse,
    strictness: options.strictness,
    checkDefaultSecrets: options.checkDefaultSecrets,
    checkPatterns: options.checkPatterns,
  });
  const score = calculateScore(issues, estimatedEntropy, length, options.secretUse);
  const grade = getGrade(score, issues);
  const secretPreview = options.maskSecret ? maskValue(normalizedSecret) : normalizedSecret;
  const base = {
    secretPreview,
    length,
    uniqueChars,
    charsetSize,
    estimatedEntropy,
    score,
    grade,
    detectedFormat,
    issues,
  };
  const output = formatOutput(base, options.outputMode);

  return {
    ...base,
    output,
  };
}

function estimateCharsetSize(value: string) {
  let size = 0;

  if (/[a-z]/.test(value)) size += 26;
  if (/[A-Z]/.test(value)) size += 26;
  if (/[0-9]/.test(value)) size += 10;
  if (/[^a-zA-Z0-9]/.test(value)) size += 33;

  return size || 1;
}

function detectFormat(value: string) {
  if (/^[a-f0-9]+$/i.test(value) && value.length >= 32 && value.length % 2 === 0) {
    return "hex-like";
  }

  if (/^[A-Za-z0-9+/]+={0,2}$/.test(value) && value.length >= 32) {
    return "base64-like";
  }

  if (/^[A-Za-z0-9_-]+$/.test(value) && value.length >= 32) {
    return "base64url/random-looking";
  }

  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    return "uuid";
  }

  if (/^[a-z0-9-]+$/i.test(value) && value.includes("-")) {
    return "slug/phrase-like";
  }

  return "plain text";
}

function buildIssues(options: {
  secret: string;
  length: number;
  uniqueChars: number;
  estimatedEntropy: number;
  detectedFormat: string;
  secretUse: SecretUse;
  strictness: Strictness;
  checkDefaultSecrets: boolean;
  checkPatterns: boolean;
}) {
  const issues: Issue[] = [];
  const minLength = getMinimumLength(options.secretUse, options.strictness);
  const minEntropy = getMinimumEntropy(options.secretUse, options.strictness);
  const lowerSecret = options.secret.toLowerCase();

  if (options.length < minLength) {
    issues.push({
      severity: "high",
      title: "Secret is too short",
      message: `This secret has ${options.length} characters. For ${labelForUse(options.secretUse)}, use at least ${minLength} random characters or equivalent bytes.`,
    });
  }

  if (options.estimatedEntropy < minEntropy) {
    issues.push({
      severity: "warning",
      title: "Estimated entropy is low",
      message: `Estimated entropy is ${options.estimatedEntropy} bits. Aim for at least ${minEntropy} bits for this use case.`,
    });
  }

  if (options.checkDefaultSecrets && weakSecrets.some((item) => lowerSecret === item || lowerSecret.includes(item))) {
    issues.push({
      severity: "high",
      title: "Weak/default secret pattern",
      message: "The secret contains a common weak/default word or placeholder.",
    });
  }

  if (options.checkPatterns) {
    if (/^(.)\1+$/.test(options.secret)) {
      issues.push({
        severity: "high",
        title: "Repeated single character",
        message: "The secret is made from one repeated character.",
      });
    }

    if (/(123456|abcdef|qwerty|password|secret|changeme)/i.test(options.secret)) {
      issues.push({
        severity: "high",
        title: "Predictable sequence",
        message: "The secret contains a common predictable sequence.",
      });
    }

    if (options.uniqueChars <= 4 && options.length >= 8) {
      issues.push({
        severity: "warning",
        title: "Low character variety",
        message: "The secret uses very few unique characters.",
      });
    }
  }

  if (options.detectedFormat === "uuid") {
    issues.push({
      severity: "warning",
      title: "UUID-like value",
      message: "A UUID is usually not ideal as a long-term JWT signing secret. Use a stronger random secret.",
    });
  }

  if (options.detectedFormat === "slug/phrase-like") {
    issues.push({
      severity: "warning",
      title: "Phrase-like secret",
      message: "Human-readable phrase-like secrets are usually weaker than random byte strings.",
    });
  }

  if (issues.length === 0) {
    issues.push({
      severity: "info",
      title: "No obvious weakness found",
      message: "The secret looks acceptable by these local checks. Still rotate it safely and keep it out of source code.",
    });
  }

  return issues;
}

function getMinimumLength(secretUse: SecretUse, strictness: Strictness) {
  const base = secretUse === "jwtHs512" ? 64 : secretUse === "jwtHs384" ? 48 : 32;

  if (strictness === "strict") return base + 16;
  if (strictness === "relaxed") return Math.max(24, base - 8);
  return base;
}

function getMinimumEntropy(secretUse: SecretUse, strictness: Strictness) {
  const base = secretUse === "jwtHs512" ? 256 : secretUse === "jwtHs384" ? 192 : 128;

  if (strictness === "strict") return base + 64;
  if (strictness === "relaxed") return Math.max(96, base - 32);
  return base;
}

function calculateScore(issues: Issue[], entropy: number, length: number, secretUse: SecretUse) {
  let score = 100;
  const minLength = getMinimumLength(secretUse, "balanced");
  const minEntropy = getMinimumEntropy(secretUse, "balanced");

  if (length < minLength) score -= 20;
  if (entropy < minEntropy) score -= 20;

  issues.forEach((issue) => {
    if (issue.severity === "high") score -= 25;
    else if (issue.severity === "warning") score -= 10;
    else if (issue.title !== "No obvious weakness found") score -= 4;
  });

  return Math.max(0, Math.min(100, score));
}

function getGrade(score: number, issues: Issue[]): SecretResult["grade"] {
  if (issues.some((issue) => issue.severity === "high") || score < 45) return "danger";
  if (score < 70) return "weak";
  if (score < 88) return "okay";
  return "strong";
}

function labelForUse(secretUse: SecretUse) {
  if (secretUse === "jwtHs256") return "JWT HS256";
  if (secretUse === "jwtHs384") return "JWT HS384";
  if (secretUse === "jwtHs512") return "JWT HS512";
  if (secretUse === "apiSecret") return "API secret";
  return "general shared secret";
}

function maskValue(value: string) {
  if (value.length <= 8) return "*".repeat(value.length);
  return `${value.slice(0, 4)}${"*".repeat(Math.min(16, value.length - 8))}${value.slice(-4)}`;
}

function formatOutput(result: Omit<SecretResult, "output">, mode: OutputMode) {
  if (mode === "json") {
    return JSON.stringify(result, null, 2);
  }

  if (mode === "csv") {
    const rows = [
      ["metric", "value"],
      ["secretPreview", result.secretPreview],
      ["length", String(result.length)],
      ["uniqueChars", String(result.uniqueChars)],
      ["charsetSize", String(result.charsetSize)],
      ["estimatedEntropy", String(result.estimatedEntropy)],
      ["score", String(result.score)],
      ["grade", result.grade],
      ["detectedFormat", result.detectedFormat],
      ["issues", result.issues.map((issue) => `${issue.severity}: ${issue.title}`).join("; ")],
    ];

    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }

  if (mode === "markdown") {
    return [
      "| Metric | Value |",
      "| --- | --- |",
      `| Secret preview | ${escapeMarkdown(result.secretPreview)} |`,
      `| Length | ${result.length} |`,
      `| Unique characters | ${result.uniqueChars} |`,
      `| Charset size | ${result.charsetSize} |`,
      `| Estimated entropy | ${result.estimatedEntropy} bits |`,
      `| Score | ${result.score}/100 |`,
      `| Grade | ${result.grade} |`,
      `| Detected format | ${escapeMarkdown(result.detectedFormat)} |`,
    ].join("\n");
  }

  if (mode === "report") {
    return [
      "JWT Secret Strength Report",
      "--------------------------",
      `Secret preview: ${result.secretPreview}`,
      `Length: ${result.length}`,
      `Unique characters: ${result.uniqueChars}`,
      `Estimated entropy: ${result.estimatedEntropy} bits`,
      `Detected format: ${result.detectedFormat}`,
      `Score: ${result.score}/100`,
      `Grade: ${result.grade}`,
      "",
      "Findings:",
      ...result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
    ].join("\n");
  }

  return [
    "JWT Secret Strength Summary",
    "---------------------------",
    `Secret preview: ${result.secretPreview}`,
    `Grade: ${result.grade}`,
    `Score: ${result.score}/100`,
    `Length: ${result.length}`,
    `Estimated entropy: ${result.estimatedEntropy} bits`,
    `Detected format: ${result.detectedFormat}`,
    "",
    "Findings:",
    ...result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
  ].join("\n");
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, "\\n");
}

function getNotes(result: SecretResult, secretUse: SecretUse) {
  const notes: { title: string; message: string }[] = [];

  if (result.grade === "danger" || result.grade === "weak") {
    notes.push({
      title: "Replace this secret",
      message: "Use a long random secret generated by a secure random source, then rotate existing tokens safely.",
    });
  }

  notes.push({
    title: "Keep JWT algorithms locked down",
    message: "Do not accept arbitrary algorithms from token headers. Configure your verifier to accept only the algorithms you intentionally use.",
  });

  notes.push({
    title: "Rotate and store safely",
    message: `For ${labelForUse(secretUse)}, store the secret in an environment variable or secret manager and rotate it when exposed.`,
  });

  return notes;
}
