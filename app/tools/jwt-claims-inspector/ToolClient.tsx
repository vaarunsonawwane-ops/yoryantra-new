"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "summary" | "report" | "json" | "claims";
type TimeMode = "local" | "utc";
type Severity = "pass" | "info" | "warning" | "high";

type ClaimIssue = {
  severity: Severity;
  title: string;
  message: string;
};

type ClaimRow = {
  name: string;
  value: unknown;
  label: string;
  note: string;
};

type JWTInspection = {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signaturePresent: boolean;
  algorithm: string;
  tokenType: string;
  expiresAt: string;
  issuedAt: string;
  notBefore: string;
  secondsUntilExpiry: number | null;
  isExpired: boolean;
  isNotYetValid: boolean;
  scopes: string[];
  roles: string[];
  claimRows: ClaimRow[];
  issues: ClaimIssue[];
  output: string;
  score: number;
};

type ClaimNote = {
  title: string;
  message: string;
};

const sampleJwt =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRlbW8ta2V5LTEifQ.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaXNzIjoiaHR0cHM6Ly9hdXRoLmV4YW1wbGUuY29tIiwiYXVkIjoieW9yeWFudHJhLWFwaSIsIm5hbWUiOiJZb3J5YW50cmEgVXNlciIsInNjb3BlIjoicmVhZDp0b29scyB3cml0ZTp0b29scyIsInJvbGVzIjpbImVkaXRvciIsImFkbWluIl0sImlhdCI6MTcxNzA3NTIwMCwibmJmIjoxNzE3MDc1MjAwLCJleHAiOjQxMDI0NDQ4MDB9.signature-placeholder";

export default function ToolClient() {
  const [token, setToken] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [timeMode, setTimeMode] = useState<TimeMode>("local");
  const [expectedIssuer, setExpectedIssuer] = useState("");
  const [expectedAudience, setExpectedAudience] = useState("");
  const [clockToleranceSeconds, setClockToleranceSeconds] = useState("60");
  const [requireIssuer, setRequireIssuer] = useState(true);
  const [requireAudience, setRequireAudience] = useState(true);
  const [requireSubject, setRequireSubject] = useState(true);
  const [warnAlgNone, setWarnAlgNone] = useState(true);
  const [warnLongLifetime, setWarnLongLifetime] = useState(true);
  const [inspection, setInspection] = useState<JWTInspection | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (inspection ? getClaimNotes(inspection) : []), [inspection]);

  const inspectClaims = () => {
    if (!token.trim()) {
      setError("Please paste a JWT token.");
      setInspection(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const nextInspection = inspectJwtClaims(token, {
        outputMode,
        timeMode,
        expectedIssuer,
        expectedAudience,
        clockToleranceSeconds: Math.max(0, Number(clockToleranceSeconds) || 0),
        requireIssuer,
        requireAudience,
        requireSubject,
        warnAlgNone,
        warnLongLifetime,
      });

      setInspection(nextInspection);
      setOutput(nextInspection.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to inspect this JWT."
      );
      setInspection(null);
      setOutput("");
      setCopied(false);
    }
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

  const loadExample = () => {
    setToken(sampleJwt);
    setOutputMode("summary");
    setTimeMode("local");
    setExpectedIssuer("https://auth.example.com");
    setExpectedAudience("yoryantra-api");
    setClockToleranceSeconds("60");
    setRequireIssuer(true);
    setRequireAudience(true);
    setRequireSubject(true);
    setWarnAlgNone(true);
    setWarnLongLifetime(true);
    setInspection(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setToken("");
    setOutputMode("summary");
    setTimeMode("local");
    setExpectedIssuer("");
    setExpectedAudience("");
    setClockToleranceSeconds("60");
    setRequireIssuer(true);
    setRequireAudience(true);
    setRequireSubject(true);
    setWarnAlgNone(true);
    setWarnLongLifetime(true);
    setInspection(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="JWT Claims Inspector"
      description="Inspect JWT claims locally and check expiration, issued-at, not-before, issuer, audience, subject, scopes, roles, lifetime, and common claim issues. This tool does not verify signatures."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          JWT Token
        </label>

        <textarea
          value={token}
          onChange={(event) => {
            setToken(event.target.value);
            setInspection(null);
            setOutput("");
            setError("");
            setCopied(false);
          }}
          placeholder={sampleJwt}
          className="w-full min-h-[300px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste a JWT access token, ID token, or test token. This tool decodes
          claims locally, but it does not verify the signature or trust the token.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Options
        </h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value) => {
              setOutputMode(value as OutputMode);
              setInspection(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Summary", value: "summary" },
              { label: "Detailed report", value: "report" },
              { label: "JSON", value: "json" },
              { label: "Claims only", value: "claims" },
            ]}
          />

          <YoryantraSelect
            label="Time Display"
            value={timeMode}
            onChange={(value) => {
              setTimeMode(value as TimeMode);
              setInspection(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Local time", value: "local" },
              { label: "UTC", value: "utc" },
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Expected Issuer
            </label>

            <input
              value={expectedIssuer}
              onChange={(event) => {
                setExpectedIssuer(event.target.value);
                setInspection(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              placeholder="https://auth.example.com"
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Expected Audience
            </label>

            <input
              value={expectedAudience}
              onChange={(event) => {
                setExpectedAudience(event.target.value);
                setInspection(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              placeholder="api-client-id"
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Clock Tolerance Seconds
            </label>

            <input
              value={clockToleranceSeconds}
              onChange={(event) => {
                setClockToleranceSeconds(event.target.value);
                setInspection(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              placeholder="60"
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={requireIssuer}
              onChange={(event) => {
                setRequireIssuer(event.target.checked);
                setInspection(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Require issuer claim
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={requireAudience}
              onChange={(event) => {
                setRequireAudience(event.target.checked);
                setInspection(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Require audience claim
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={requireSubject}
              onChange={(event) => {
                setRequireSubject(event.target.checked);
                setInspection(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Require subject claim
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={warnAlgNone}
              onChange={(event) => {
                setWarnAlgNone(event.target.checked);
                setInspection(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Warn about alg none or missing algorithm
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={warnLongLifetime}
              onChange={(event) => {
                setWarnLongLifetime(event.target.checked);
                setInspection(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Warn about long token lifetime
          </label>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Claim checks are useful for debugging, but a token is trusted only when
          your server verifies its signature and expected claims.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={inspectClaims} className="yoryantra-btn">
          Inspect Claims
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

      {inspection && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Score" value={`${inspection.score}/100`} />
          <SummaryCard label="Algorithm" value={inspection.algorithm || "(missing)"} />
          <SummaryCard label="Expired" value={inspection.isExpired ? "Yes" : "No"} />
          <SummaryCard label="Issues" value={inspection.issues.length.toLocaleString()} />
        </div>
      )}

      {inspection && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Claim Review
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Common JWT claims and their decoded values.
          </p>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Claim</th>
                  <th className="px-4 py-3 font-semibold">Value</th>
                  <th className="px-4 py-3 font-semibold">Meaning</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {inspection.claimRows.map((row) => (
                  <tr key={row.name}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">
                      {row.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      <span className="block max-w-[280px] break-words">
                        {formatClaimValue(row.value)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {row.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {inspection && inspection.issues.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Claim findings
          </h3>

          <div className="mt-3 space-y-3">
            {inspection.issues.map((issue, index) => (
              <div key={`${issue.title}-${index}`}>
                <p className="text-sm font-semibold text-amber-900">
                  {issue.title}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-amber-800">
                  {issue.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900">
            JWT notes
          </h3>

          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-blue-900">
                  {note.title}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-blue-800">
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
            <button onClick={copyOutput} className="yoryantra-btn-outline text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[340px] whitespace-pre-wrap break-words">
          {output || "JWT claims inspection output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        JWT claim inspection happens directly in your browser. Your token is not
        uploaded to a server. Avoid pasting real production tokens into any
        online tool.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Inspecting JWT Claims Beyond Basic Decoding
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A JWT decoder shows the header and payload. A claims inspector goes
            one step further and checks what the claims mean: whether the token
            is expired, not yet valid, missing issuer or audience, using a risky
            algorithm, or carrying scopes and roles that need review.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This JWT Claims Inspector helps you review common claims like exp,
            iat, nbf, iss, aud, sub, scope, scp, roles, permissions, and groups
            while debugging authentication and API access issues.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Checking JWT Claim Health
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste a JWT access token, ID token, or safe test token.</li>
            <li>Add expected issuer or audience values if you know them.</li>
            <li>Choose the output format and time display.</li>
            <li>Inspect expiration, not-before, subject, issuer, audience, scopes, and roles.</li>
            <li>Review warnings before using the token in real code.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common JWT Claims Inspector Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Checking why a token is expired or not yet valid.</li>
            <li>Comparing aud and iss claims with expected API values.</li>
            <li>Reading scopes, roles, permissions, or groups from a token.</li>
            <li>Finding long-lived access tokens during debugging.</li>
            <li>Checking whether subject or issuer claims are missing.</li>
            <li>Reviewing ID token or access token payloads safely during development.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example JWT Claims
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`{
  "iss": "https://auth.example.com",
  "aud": "api-client",
  "sub": "1234567890",
  "scope": "read:tools write:tools",
  "iat": 1717075200,
  "exp": 1717078800
}`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Claim Inspection Does Not Verify Trust
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Reading claims is useful, but it does not prove the token is trusted.
            A JWT can only be trusted after the signature, algorithm, issuer,
            audience, expiry, and other expected claims are verified by your
            application or API.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Use this tool for inspection and debugging. For real authorization
            decisions, always verify the JWT on the server with the correct key
            and claim checks.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What does a JWT Claims Inspector do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It decodes JWT claims and checks common claim issues such as
                expiry, issuer, audience, subject, not-before, scopes, and roles.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this different from a JWT Decoder?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. A decoder shows the token payload. This tool explains and
                checks the claims inside that payload.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this verify the JWT signature?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. It inspects claims only. Use your server or a signature
                verifier when you need to verify trust.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this check aud and iss values?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Add expected audience and issuer values, and the tool will
                compare them with the token claims.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my JWT uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Claim inspection happens directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/jwt-claims-inspector" />
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

function inspectJwtClaims(
  token: string,
  options: {
    outputMode: OutputMode;
    timeMode: TimeMode;
    expectedIssuer: string;
    expectedAudience: string;
    clockToleranceSeconds: number;
    requireIssuer: boolean;
    requireAudience: boolean;
    requireSubject: boolean;
    warnAlgNone: boolean;
    warnLongLifetime: boolean;
  }
): JWTInspection {
  const parts = token.trim().split(".");

  if (parts.length !== 3) {
    throw new Error("A JWT should have three dot-separated parts.");
  }

  const header = decodeJwtPart(parts[0], "header");
  const payload = decodeJwtPart(parts[1], "payload");

  if (!isObject(header) || !isObject(payload)) {
    throw new Error("JWT header and payload should decode into JSON objects.");
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const exp = getNumberClaim(payload.exp);
  const iat = getNumberClaim(payload.iat);
  const nbf = getNumberClaim(payload.nbf);
  const algorithm = typeof header.alg === "string" ? header.alg : "";
  const tokenType = typeof header.typ === "string" ? header.typ : "";
  const signaturePresent = Boolean(parts[2]);
  const issues = getClaimIssues({
    header,
    payload,
    algorithm,
    signaturePresent,
    exp,
    iat,
    nbf,
    nowSeconds,
    options,
  });
  const scopes = extractListClaims(payload.scope || payload.scp);
  const roles = extractListClaims(payload.roles || payload.role || payload.permissions || payload.groups);
  const claimRows = buildClaimRows(payload, {
    exp,
    iat,
    nbf,
    timeMode: options.timeMode,
  });
  const secondsUntilExpiry = typeof exp === "number" ? exp - nowSeconds : null;
  const isExpired = typeof exp === "number" ? exp <= nowSeconds - options.clockToleranceSeconds : false;
  const isNotYetValid = typeof nbf === "number" ? nbf > nowSeconds + options.clockToleranceSeconds : false;
  const expiresAt = typeof exp === "number" ? formatUnixTime(exp, options.timeMode) : "(missing)";
  const issuedAt = typeof iat === "number" ? formatUnixTime(iat, options.timeMode) : "(missing)";
  const notBefore = typeof nbf === "number" ? formatUnixTime(nbf, options.timeMode) : "(missing)";
  const score = calculateScore(issues);
  const inspectionBase = {
    header,
    payload,
    signaturePresent,
    algorithm,
    tokenType,
    expiresAt,
    issuedAt,
    notBefore,
    secondsUntilExpiry,
    isExpired,
    isNotYetValid,
    scopes,
    roles,
    claimRows,
    issues,
    score,
  };
  const output = formatOutput(inspectionBase, options.outputMode);

  return {
    ...inspectionBase,
    output,
  };
}

function decodeJwtPart(part: string, label: string) {
  try {
    if (!/^[A-Za-z0-9_-]*$/.test(part)) {
      throw new Error();
    }

    const padded = addPadding(part.replace(/-/g, "+").replace(/_/g, "/"));
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const text = new TextDecoder().decode(bytes);
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error(`Unable to decode JWT ${label}.`);
  }
}

function addPadding(value: string) {
  const remainder = value.length % 4;
  return remainder === 0 ? value : value + "=".repeat(4 - remainder);
}

function getClaimIssues({
  header,
  payload,
  algorithm,
  signaturePresent,
  exp,
  iat,
  nbf,
  nowSeconds,
  options,
}: {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  algorithm: string;
  signaturePresent: boolean;
  exp: number | null;
  iat: number | null;
  nbf: number | null;
  nowSeconds: number;
  options: {
    expectedIssuer: string;
    expectedAudience: string;
    clockToleranceSeconds: number;
    requireIssuer: boolean;
    requireAudience: boolean;
    requireSubject: boolean;
    warnAlgNone: boolean;
    warnLongLifetime: boolean;
  };
}) {
  const issues: ClaimIssue[] = [];

  if (!signaturePresent) {
    issues.push({
      severity: "high",
      title: "Missing signature part",
      message: "The token does not have a signature part.",
    });
  }

  if (options.warnAlgNone && (!algorithm || algorithm.toLowerCase() === "none")) {
    issues.push({
      severity: "high",
      title: "Risky or missing algorithm",
      message: "The JWT header uses alg none or does not clearly name a signing algorithm.",
    });
  }

  if (exp === null) {
    issues.push({
      severity: "warning",
      title: "Missing exp claim",
      message: "The token has no expiration claim.",
    });
  } else if (exp <= nowSeconds - options.clockToleranceSeconds) {
    issues.push({
      severity: "high",
      title: "Token is expired",
      message: "The exp claim is in the past.",
    });
  }

  if (nbf !== null && nbf > nowSeconds + options.clockToleranceSeconds) {
    issues.push({
      severity: "warning",
      title: "Token is not valid yet",
      message: "The nbf claim is in the future.",
    });
  }

  if (iat !== null && iat > nowSeconds + options.clockToleranceSeconds) {
    issues.push({
      severity: "warning",
      title: "Issued-at time is in the future",
      message: "The iat claim is later than the current time.",
    });
  }

  if (options.warnLongLifetime && exp !== null && iat !== null && exp - iat > 60 * 60 * 24) {
    issues.push({
      severity: "warning",
      title: "Long token lifetime",
      message: "The token lifetime is longer than 24 hours. That may be valid for some systems, but short-lived access tokens are usually safer.",
    });
  }

  if (exp !== null && iat !== null && exp <= iat) {
    issues.push({
      severity: "high",
      title: "Expiration is not after issued-at",
      message: "The exp claim should be later than the iat claim.",
    });
  }

  if (exp !== null && nbf !== null && nbf > exp) {
    issues.push({
      severity: "high",
      title: "Not-before is after expiration",
      message: "The nbf claim is later than exp, so the token may never be usable.",
    });
  }

  ["exp", "iat", "nbf"].forEach((claimName) => {
    if (payload[claimName] !== undefined && getNumberClaim(payload[claimName]) === null) {
      issues.push({
        severity: "warning",
        title: `Invalid ${claimName} claim type`,
        message: `${claimName} should be a numeric Unix timestamp in seconds, not a string, date, or object.`,
      });
    }
  });

  if (Array.isArray(payload.aud) && !payload.aud.every((item) => typeof item === "string")) {
    issues.push({
      severity: "warning",
      title: "Audience array has non-string values",
      message: "The aud claim should be a string or an array of strings.",
    });
  }

  if (header.crit !== undefined) {
    issues.push({
      severity: "info",
      title: "Critical header present",
      message: "The JWT header has a crit field. This inspector does not evaluate custom critical header rules.",
    });
  }

  if (options.requireIssuer && typeof payload.iss !== "string") {
    issues.push({
      severity: "warning",
      title: "Missing issuer",
      message: "The iss claim is missing or not a string.",
    });
  }

  if (options.requireAudience && payload.aud === undefined) {
    issues.push({
      severity: "warning",
      title: "Missing audience",
      message: "The aud claim is missing.",
    });
  }

  if (options.requireSubject && typeof payload.sub !== "string") {
    issues.push({
      severity: "warning",
      title: "Missing subject",
      message: "The sub claim is missing or not a string.",
    });
  }

  if (options.expectedIssuer.trim() && payload.iss !== options.expectedIssuer.trim()) {
    issues.push({
      severity: "high",
      title: "Issuer mismatch",
      message: "The token issuer does not match the expected issuer.",
    });
  }

  if (options.expectedAudience.trim() && !audienceMatches(payload.aud, options.expectedAudience.trim())) {
    issues.push({
      severity: "high",
      title: "Audience mismatch",
      message: "The token audience does not include the expected audience.",
    });
  }

  if (typeof header.kid !== "string") {
    issues.push({
      severity: "info",
      title: "No key ID",
      message: "The header has no kid value. Some systems use kid to choose the verification key.",
    });
  }

  return issues;
}

function audienceMatches(aud: unknown, expected: string) {
  if (typeof aud === "string") {
    return aud === expected;
  }

  if (Array.isArray(aud)) {
    return aud.some((item) => typeof item === "string" && item === expected);
  }

  return false;
}

function getNumberClaim(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function buildClaimRows(
  payload: Record<string, unknown>,
  options: {
    exp: number | null;
    iat: number | null;
    nbf: number | null;
    timeMode: TimeMode;
  }
): ClaimRow[] {
  const rows: ClaimRow[] = [
    {
      name: "iss",
      value: payload.iss ?? "(missing)",
      label: "Issuer",
      note: "Who issued the token.",
    },
    {
      name: "aud",
      value: payload.aud ?? "(missing)",
      label: "Audience",
      note: "Who the token is meant for.",
    },
    {
      name: "sub",
      value: payload.sub ?? "(missing)",
      label: "Subject",
      note: "The user, account, or entity the token represents.",
    },
    {
      name: "exp",
      value: options.exp !== null ? formatUnixTime(options.exp, options.timeMode) : "(missing)",
      label: "Expiration",
      note: "When the token expires.",
    },
    {
      name: "iat",
      value: options.iat !== null ? formatUnixTime(options.iat, options.timeMode) : "(missing)",
      label: "Issued At",
      note: "When the token was issued.",
    },
    {
      name: "nbf",
      value: options.nbf !== null ? formatUnixTime(options.nbf, options.timeMode) : "(missing)",
      label: "Not Before",
      note: "Before this time, the token should not be accepted.",
    },
  ];

  Object.keys(payload)
    .filter((key) => !rows.some((row) => row.name === key))
    .sort()
    .forEach((key) => {
      rows.push({
        name: key,
        value: payload[key],
        label: key,
        note: "Custom or provider-specific claim.",
      });
    });

  return rows;
}

function extractListClaims(value: unknown) {
  if (typeof value === "string") {
    return value
      .split(/[,\s]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean);
  }

  return [];
}

function formatUnixTime(seconds: number, mode: TimeMode) {
  const date = new Date(seconds * 1000);

  return mode === "utc" ? date.toISOString() : date.toLocaleString();
}

function formatClaimValue(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value);
}

function formatOutput(
  inspection: Omit<JWTInspection, "output">,
  outputMode: OutputMode
) {
  if (outputMode === "json") {
    return JSON.stringify(inspection, null, 2);
  }

  if (outputMode === "claims") {
    return JSON.stringify(inspection.payload, null, 2);
  }

  if (outputMode === "report") {
    const issues =
      inspection.issues.length === 0
        ? ["- No common claim issues found."]
        : inspection.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`);

    return [
      "JWT Claims Report",
      "-----------------",
      `Score: ${inspection.score}/100`,
      `Algorithm: ${inspection.algorithm || "(missing)"}`,
      `Type: ${inspection.tokenType || "(missing)"}`,
      `Signature present: ${inspection.signaturePresent ? "yes" : "no"}`,
      `Expired: ${inspection.isExpired ? "yes" : "no"}`,
      `Not yet valid: ${inspection.isNotYetValid ? "yes" : "no"}`,
      `Expires at: ${inspection.expiresAt}`,
      `Issued at: ${inspection.issuedAt}`,
      `Not before: ${inspection.notBefore}`,
      `Scopes: ${inspection.scopes.length ? inspection.scopes.join(", ") : "(none)"}`,
      `Roles: ${inspection.roles.length ? inspection.roles.join(", ") : "(none)"}`,
      "",
      "Findings:",
      ...issues,
    ].join("\n");
  }

  return [
    "JWT Claims Summary",
    "------------------",
    `Score: ${inspection.score}/100`,
    `Algorithm: ${inspection.algorithm || "(missing)"}`,
    `Expired: ${inspection.isExpired ? "yes" : "no"}`,
    `Not yet valid: ${inspection.isNotYetValid ? "yes" : "no"}`,
    `Expires at: ${inspection.expiresAt}`,
    `Issuer: ${String(inspection.payload.iss ?? "(missing)")}`,
    `Audience: ${formatClaimValue(inspection.payload.aud ?? "(missing)")}`,
    `Subject: ${String(inspection.payload.sub ?? "(missing)")}`,
    `Scopes: ${inspection.scopes.length ? inspection.scopes.join(", ") : "(none)"}`,
    `Roles: ${inspection.roles.length ? inspection.roles.join(", ") : "(none)"}`,
    `Findings: ${inspection.issues.length}`,
  ].join("\n");
}

function calculateScore(issues: ClaimIssue[]) {
  let score = 100;

  issues.forEach((issue) => {
    if (issue.severity === "high") {
      score -= 30;
    } else if (issue.severity === "warning") {
      score -= 15;
    } else if (issue.severity === "info") {
      score -= 5;
    }
  });

  return Math.max(0, score);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getClaimNotes(inspection: JWTInspection): ClaimNote[] {
  const notes: ClaimNote[] = [];

  if (inspection.isExpired) {
    notes.push({
      title: "Expired token",
      message:
        "This token is expired based on the exp claim and current browser time.",
    });
  }

  if (inspection.isNotYetValid) {
    notes.push({
      title: "Not valid yet",
      message:
        "This token has an nbf claim in the future. It should not be accepted yet.",
    });
  }

  if (inspection.scopes.length > 0 || inspection.roles.length > 0) {
    notes.push({
      title: "Authorization claims found",
      message:
        "Scopes, roles, permissions, or groups were found. Review whether they match the access you expect.",
    });
  }

  notes.push({
    title: "Signature not verified here",
    message:
      "This tool inspects JWT claims only. Treat the result as informational until your server verifies the signature, allowed algorithm, issuer, audience, and time claims.",
  });

  return notes;
}
