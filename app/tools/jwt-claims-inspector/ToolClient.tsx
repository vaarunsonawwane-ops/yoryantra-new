"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "summary" | "report" | "json" | "claims";
type TimeMode = "local" | "utc";
type IssueSeverity = "warning" | "info";

type ClaimIssue = {
  severity: IssueSeverity;
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
  algorithm: string;
  tokenType: string;
  signaturePresent: boolean;
  unsecured: boolean;
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
};

type EncryptedJwt = {
  header: Record<string, unknown>;
  output: string;
};

const sampleJwt = createSampleJwt();

export default function ToolClient() {
  const [token, setToken] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [timeMode, setTimeMode] = useState<TimeMode>("local");
  const [expectedIssuer, setExpectedIssuer] = useState("");
  const [expectedAudience, setExpectedAudience] = useState("");
  const [clockToleranceSeconds, setClockToleranceSeconds] = useState("60");
  const [requireExpiration, setRequireExpiration] = useState(false);
  const [requireIssuer, setRequireIssuer] = useState(false);
  const [requireAudience, setRequireAudience] = useState(false);
  const [requireSubject, setRequireSubject] = useState(false);
  const [flagLongLifetime, setFlagLongLifetime] = useState(false);
  const [inspection, setInspection] = useState<JWTInspection | null>(null);
  const [encrypted, setEncrypted] = useState<EncryptedJwt | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const warnings = useMemo(
    () => (inspection ? inspection.issues.filter((issue) => issue.severity === "warning") : []),
    [inspection]
  );
  const information = useMemo(
    () => (inspection ? inspection.issues.filter((issue) => issue.severity === "info") : []),
    [inspection]
  );

  const clearResult = () => {
    setInspection(null);
    setEncrypted(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const inspectClaims = () => {
    if (!token.trim()) {
      setError("Paste a compact JWT before inspecting its claims.");
      setInspection(null);
      setEncrypted(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const tolerance = parseClockTolerance(clockToleranceSeconds);
      const parts = token.trim().split(".");

      if (parts.length === 5) {
        const encryptedResult = inspectEncryptedJwt(parts);
        setEncrypted(encryptedResult);
        setInspection(null);
        setOutput(encryptedResult.output);
        setError("");
        setCopied(false);
        return;
      }

      if (parts.length !== 3) {
        throw new Error("Compact JWT input should contain three JWS parts or five JWE parts.");
      }

      const nextInspection = inspectJwtClaims(parts, {
        outputMode,
        timeMode,
        expectedIssuer,
        expectedAudience,
        clockToleranceSeconds: tolerance,
        requireExpiration,
        requireIssuer,
        requireAudience,
        requireSubject,
        flagLongLifetime,
      });
      setInspection(nextInspection);
      setEncrypted(null);
      setOutput(nextInspection.output);
      setError("");
      setCopied(false);
    } catch (caught) {
      setInspection(null);
      setEncrypted(null);
      setOutput("");
      setCopied(false);
      setError(caught instanceof Error ? caught.message : "Unable to inspect this JWT.");
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
      setError("The claim report could not be copied. Select and copy it manually.");
    }
  };

  const loadExample = () => {
    setToken(sampleJwt);
    setOutputMode("summary");
    setTimeMode("local");
    setExpectedIssuer("https://auth.example.com");
    setExpectedAudience("yoryantra-api");
    setClockToleranceSeconds("60");
    setRequireExpiration(false);
    setRequireIssuer(false);
    setRequireAudience(false);
    setRequireSubject(false);
    setFlagLongLifetime(false);
    clearResult();
  };

  const resetAll = () => {
    setToken("");
    setOutputMode("summary");
    setTimeMode("local");
    setExpectedIssuer("");
    setExpectedAudience("");
    setClockToleranceSeconds("60");
    setRequireExpiration(false);
    setRequireIssuer(false);
    setRequireAudience(false);
    setRequireSubject(false);
    setFlagLongLifetime(false);
    clearResult();
  };

  return (
    <ToolShell
      title="JWT Claims Inspector"
      description="Read registered and provider-specific JWT claims without confusing decoded data with signature verification."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="mb-2 block text-sm font-medium text-gray-700">Compact JWT</label>
        <textarea
          value={token}
          onChange={(event: { target: { value: string } }) => {
            setToken(event.target.value);
            clearResult();
          }}
          placeholder={sampleJwt}
          className="min-h-[280px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Three-part JWS tokens can expose their JSON claims. Five-part compact JWE tokens are recognized as encrypted, but their claims cannot be read here without decryption keys and algorithms.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Compare claims with the context you actually expect</h3>
        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Copied output"
            value={outputMode}
            onChange={(value: string) => {
              setOutputMode(value as OutputMode);
              clearResult();
            }}
            options={[
              { label: "Compact summary", value: "summary" },
              { label: "Detailed reasoning", value: "report" },
              { label: "JSON", value: "json" },
              { label: "Claims only", value: "claims" },
            ]}
          />
          <YoryantraSelect
            label="Time display"
            value={timeMode}
            onChange={(value: string) => {
              setTimeMode(value as TimeMode);
              clearResult();
            }}
            options={[
              { label: "Local time", value: "local" },
              { label: "UTC", value: "utc" },
            ]}
          />

          <TextField label="Expected issuer (exact match)" value={expectedIssuer} placeholder="https://auth.example.com" onChange={(value: string) => { setExpectedIssuer(value); clearResult(); }} />
          <TextField label="Expected audience" value={expectedAudience} placeholder="api-client-id" onChange={(value: string) => { setExpectedAudience(value); clearResult(); }} />

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Clock tolerance in seconds</label>
            <input
              inputMode="numeric"
              value={clockToleranceSeconds}
              onChange={(event: { target: { value: string } }) => {
                setClockToleranceSeconds(event.target.value);
                clearResult();
              }}
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
            <p className="mt-2 text-xs leading-relaxed text-gray-500">Whole seconds from 0 to 300. Tolerance is applied symmetrically to exp, nbf, and future iat comparisons.</p>
          </div>

          <CheckboxRow checked={requireExpiration} label="Treat a missing exp claim as a required-claim problem" onChange={(checked) => { setRequireExpiration(checked); clearResult(); }} />
          <CheckboxRow checked={requireIssuer} label="Treat a missing iss claim as a required-claim problem" onChange={(checked) => { setRequireIssuer(checked); clearResult(); }} />
          <CheckboxRow checked={requireAudience} label="Treat a missing aud claim as a required-claim problem" onChange={(checked) => { setRequireAudience(checked); clearResult(); }} />
          <CheckboxRow checked={requireSubject} label="Treat a missing sub claim as a required-claim problem" onChange={(checked) => { setRequireSubject(checked); clearResult(); }} />
          <CheckboxRow checked={flagLongLifetime} label="Flag exp − iat lifetimes longer than 24 hours as an application-specific heuristic" onChange={(checked) => { setFlagLongLifetime(checked); clearResult(); }} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={inspectClaims} className="yoryantra-btn whitespace-nowrap">Inspect Claims</button>
        <button onClick={copyOutput} className="yoryantra-btn whitespace-nowrap" disabled={!output}>{copied ? "Copied" : "Copy Output"}</button>
        <button onClick={loadExample} className="yoryantra-btn-outline whitespace-nowrap">Load Example</button>
        <button onClick={resetAll} className="yoryantra-btn-outline whitespace-nowrap">Reset</button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">{error}</div>
      )}

      {encrypted && (
        <div className="mt-6 self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">Encrypted compact JWT detected</h3>
          <p className="mt-2 text-sm leading-relaxed text-amber-800">
            Five compact parts indicate JWE rather than a readable JWS claims set. The protected header can be decoded, but the claims remain ciphertext until the JWE is successfully decrypted.
          </p>
          <pre className="mt-3 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-amber-200 bg-white p-3 font-mono text-xs text-gray-800 [overflow-wrap:anywhere]">{JSON.stringify(encrypted.header, null, 2)}</pre>
        </div>
      )}

      {inspection && (
        <div className="mt-8 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Algorithm header" value={inspection.algorithm} />
          <SummaryCard label="Signature segment" value={inspection.unsecured ? "empty / alg=none" : inspection.signaturePresent ? "present" : "missing"} />
          <SummaryCard label="Expiration" value={inspection.expiresAt} />
          <SummaryCard label="Not before" value={inspection.notBefore} />
        </div>
      )}

      {inspection && (
        <div className="mt-8 min-w-0 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Claims and their registered meaning</h3>
          <div className="mt-4 min-w-0 overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Claim</th>
                  <th className="px-4 py-3 font-semibold">Value</th>
                  <th className="px-4 py-3 font-semibold">Interpretation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inspection.claimRows.map((row) => (
                  <tr key={row.name}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">{row.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700"><span className="block max-w-[320px] break-words [overflow-wrap:anywhere]">{formatClaimValue(row.value)}</span></td>
                    <td className="px-4 py-3 leading-relaxed text-gray-700">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mt-6 self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">Claim conditions that deserve attention</h3>
          <div className="mt-3 space-y-3">
            {warnings.map((issue) => (
              <div key={issue.title}>
                <p className="text-sm font-semibold text-amber-900">{issue.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-amber-800">{issue.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {information.length > 0 && (
        <div className="mt-6 self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Neutral observations</h3>
          <div className="mt-3 space-y-3">
            {information.map((issue) => (
              <div key={issue.title}>
                <p className="text-sm font-semibold text-gray-900">{issue.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{issue.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Copyable claim report</h3>
          {output && <button onClick={copyOutput} className="yoryantra-btn-outline whitespace-nowrap text-sm">{copied ? "Copied" : "Copy"}</button>}
        </div>
        <pre className="yoryantra-output min-h-[300px] overflow-auto whitespace-pre-wrap break-words text-sm [overflow-wrap:anywhere]">
          {output || "Decoded claim details will appear here."}
        </pre>
      </div>

      <div className="mt-4 self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
        Decoding stays in the browser. A pasted bearer token can still be a live credential, so prefer a redacted or test token whenever the real secret is not necessary for debugging.
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Decoded claims are data, not proof that the token is trustworthy</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Anyone can create a JWT-looking header and payload. Reading <span className="font-mono text-gray-800">iss</span>, <span className="font-mono text-gray-800">aud</span>, <span className="font-mono text-gray-800">sub</span>, or an unexpired <span className="font-mono text-gray-800">exp</span> tells you what the token claims, not whether a trusted issuer actually signed it.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Real acceptance requires cryptographic verification with an allowed algorithm and the correct key, followed by the claim rules for that token profile. RFC 8725 specifically calls out algorithm verification, issuer validation, and audience validation as security requirements in applicable JWT deployments.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">NumericDate is seconds since the Unix epoch, and it may contain a fraction</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 7519 defines <span className="font-mono text-gray-800">exp</span>, <span className="font-mono text-gray-800">nbf</span>, and <span className="font-mono text-gray-800">iat</span> using NumericDate. NumericDate is a JSON number measured in seconds from 1970-01-01T00:00:00Z, and non-integer values are allowed. Strings such as <span className="font-mono text-gray-800">"1717078800"</span> are therefore not valid NumericDate values.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The clock tolerance setting is an explicit comparison aid rather than a claim rewrite. It never changes the decoded value, and very large finite timestamps are shown as outside JavaScript's Date range instead of causing formatting to fail.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Issuer and audience checks only make sense against expected values</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Registered claims are optional unless the application or token profile makes them required. That is why missing <span className="font-mono text-gray-800">iss</span>, <span className="font-mono text-gray-800">aud</span>, <span className="font-mono text-gray-800">sub</span>, and <span className="font-mono text-gray-800">exp</span> are not treated as universal failures by default. Turn on a requirement only when it reflects the system you are debugging.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            When you enter an expected issuer, comparison is exact and case-sensitive. Audience may be a single string or an array of strings; a match means the expected audience appears in that registered claim, not that the token has been authenticated.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Unsecured JWS and encrypted JWE are different cases</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A three-part JWS using <span className="font-mono text-gray-800">alg=none</span> is an unsecured JWT and, when structurally valid, has an empty signature segment. It can be decoded but should only be accepted in an application that explicitly permits that unsecured form and protects it by other means. A five-part compact JWE is encrypted; its protected header is visible, while the claims remain encrypted until decryption succeeds.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            JWTs also use UTF-8 JSON and unpadded Base64URL. The decoder checks canonical Base64URL rather than quietly accepting malformed padding or a different text encoding.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Scopes and roles are conventions layered on top of JWT</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Claims such as <span className="font-mono text-gray-800">scope</span>, <span className="font-mono text-gray-800">scp</span>, <span className="font-mono text-gray-800">roles</span>, <span className="font-mono text-gray-800">permissions</span>, and <span className="font-mono text-gray-800">groups</span> are common in real identity systems, but their meaning is provider- or application-specific. Seeing <span className="font-mono text-gray-800">admin</span> in a decoded array is not authorization by itself.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">The standards behind the checks</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 7519 defines JWT and the registered claims. RFC 7515 defines JWS compact serialization, including the unsecured form. RFC 8725 adds current JWT security guidance. RFC 7797 explicitly says JWTs must not use the JWS unencoded-payload option.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            References: <a className="font-medium text-[var(--green)] underline underline-offset-2" href="https://www.rfc-editor.org/rfc/rfc7519" target="_blank" rel="noreferrer">RFC 7519</a>, <a className="font-medium text-[var(--green)] underline underline-offset-2" href="https://www.rfc-editor.org/rfc/rfc7515" target="_blank" rel="noreferrer">RFC 7515</a>, <a className="font-medium text-[var(--green)] underline underline-offset-2" href="https://www.rfc-editor.org/rfc/rfc8725" target="_blank" rel="noreferrer">RFC 8725</a>, and <a className="font-medium text-[var(--green)] underline underline-offset-2" href="https://www.rfc-editor.org/rfc/rfc7797" target="_blank" rel="noreferrer">RFC 7797</a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/jwt-claims-inspector" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function TextField({ label, value, placeholder, onChange }: { label: string; value: string; placeholder: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input value={value} onChange={(event: { target: { value: string } }) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]" />
    </div>
  );
}

function CheckboxRow({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-sm font-medium text-gray-900 md:col-span-2">
      <input type="checkbox" checked={checked} onChange={(event: { target: { checked: boolean } }) => onChange(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]" />
      <span>{label}</span>
    </label>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 break-words font-mono text-sm font-semibold text-gray-900 [overflow-wrap:anywhere]">{value}</div>
    </div>
  );
}

function inspectJwtClaims(
  parts: string[],
  options: {
    outputMode: OutputMode;
    timeMode: TimeMode;
    expectedIssuer: string;
    expectedAudience: string;
    clockToleranceSeconds: number;
    requireExpiration: boolean;
    requireIssuer: boolean;
    requireAudience: boolean;
    requireSubject: boolean;
    flagLongLifetime: boolean;
  }
): JWTInspection {
  const header = decodeBase64UrlJsonObject(parts[0], "header");
  if (header.b64 === false) throw new Error("JWTs must not use the JWS b64=false unencoded-payload option.");

  const algorithm = typeof header.alg === "string" ? header.alg : "";
  if (!algorithm) throw new Error("The JWT protected header is missing the required alg string.");

  const unsecured = algorithm.toLowerCase() === "none";
  if (unsecured) {
    if (parts[2] !== "") throw new Error("An unsecured alg=none JWT must have an empty signature segment.");
  } else {
    if (!parts[2]) throw new Error("A signed JWS needs a non-empty signature segment.");
    validateCanonicalBase64Url(parts[2], "signature");
  }

  const payload = decodeBase64UrlJsonObject(parts[1], "payload");
  const nowSeconds = Date.now() / 1000;
  const exp = getNumericDate(payload.exp);
  const iat = getNumericDate(payload.iat);
  const nbf = getNumericDate(payload.nbf);
  const issues = getClaimIssues({ header, payload, algorithm, unsecured, exp, iat, nbf, nowSeconds, options });
  const scopes = extractScopeList(payload.scope !== undefined ? payload.scope : payload.scp);
  const roles = collectRoleLikeClaims(payload);
  const claimRows = buildClaimRows(payload, { exp, iat, nbf, timeMode: options.timeMode });
  const isExpired = exp !== null ? exp <= nowSeconds - options.clockToleranceSeconds : false;
  const isNotYetValid = nbf !== null ? nbf > nowSeconds + options.clockToleranceSeconds : false;
  const base = {
    header,
    payload,
    algorithm,
    tokenType: typeof header.typ === "string" ? header.typ : "",
    signaturePresent: parts[2].length > 0,
    unsecured,
    expiresAt: exp !== null ? formatNumericDate(exp, options.timeMode) : "(missing)",
    issuedAt: iat !== null ? formatNumericDate(iat, options.timeMode) : "(missing)",
    notBefore: nbf !== null ? formatNumericDate(nbf, options.timeMode) : "(missing)",
    secondsUntilExpiry: exp !== null ? exp - nowSeconds : null,
    isExpired,
    isNotYetValid,
    scopes,
    roles,
    claimRows,
    issues,
  };
  return { ...base, output: formatOutput(base, options.outputMode) };
}

function inspectEncryptedJwt(parts: string[]): EncryptedJwt {
  if (parts.length !== 5) throw new Error("Compact JWE should contain five parts.");
  const header = decodeBase64UrlJsonObject(parts[0], "protected header");
  if (typeof header.alg !== "string" || !header.alg) throw new Error("The JWE protected header is missing alg.");
  if (typeof header.enc !== "string" || !header.enc) throw new Error("The JWE protected header is missing enc.");
  if (String(header.alg).toLowerCase() === "dir") {
    if (parts[1] !== "") throw new Error("A compact JWE using alg=dir must have an empty encrypted-key segment.");
  } else {
    validateCanonicalBase64Url(parts[1], "encrypted key");
  }
  validateCanonicalBase64Url(parts[2], "initialization vector");
  validateCanonicalBase64Url(parts[3], "ciphertext");
  validateCanonicalBase64Url(parts[4], "authentication tag");
  return {
    header,
    output: [
      "Encrypted compact JWT (JWE)",
      "---------------------------",
      `alg: ${String(header.alg)}`,
      `enc: ${String(header.enc)}`,
      `cty: ${typeof header.cty === "string" ? header.cty : "(missing)"}`,
      "Claims: encrypted; decryption is required before they can be inspected.",
    ].join("\n"),
  };
}

function decodeBase64UrlJsonObject(part: string, label: string) {
  if (!part) throw new Error(`The JWT ${label} segment is empty.`);
  const bytes = decodeCanonicalBase64Url(part, label);
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error(`The JWT ${label} is not valid UTF-8.`);
  }
  let value: unknown;
  try {
    value = JSON.parse(text) as unknown;
  } catch {
    throw new Error(`The JWT ${label} is not valid JSON.`);
  }
  if (!isObject(value)) throw new Error(`The JWT ${label} must decode to a JSON object.`);
  return value;
}

function validateCanonicalBase64Url(part: string, label: string) {
  if (!part) throw new Error(`The JWT ${label} segment is empty.`);
  decodeCanonicalBase64Url(part, label);
}

function decodeCanonicalBase64Url(part: string, label: string) {
  if (!/^[A-Za-z0-9_-]+$/.test(part) || part.length % 4 === 1) {
    throw new Error(`The JWT ${label} is not canonical unpadded Base64URL.`);
  }
  try {
    const standard = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = standard + "=".repeat((4 - (standard.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const canonical = bytesToBase64Url(bytes);
    if (canonical !== part) throw new Error();
    return bytes;
  } catch {
    throw new Error(`The JWT ${label} is not canonical unpadded Base64URL.`);
  }
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) binary += String.fromCharCode(bytes[index]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function parseClockTolerance(value: string) {
  if (!/^\d+$/.test(value.trim())) throw new Error("Clock tolerance must be a whole number from 0 to 300 seconds.");
  const seconds = Number(value);
  if (!Number.isSafeInteger(seconds) || seconds < 0 || seconds > 300) throw new Error("Clock tolerance must be a whole number from 0 to 300 seconds.");
  return seconds;
}

function getClaimIssues({
  header,
  payload,
  algorithm,
  unsecured,
  exp,
  iat,
  nbf,
  nowSeconds,
  options,
}: {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  algorithm: string;
  unsecured: boolean;
  exp: number | null;
  iat: number | null;
  nbf: number | null;
  nowSeconds: number;
  options: {
    expectedIssuer: string;
    expectedAudience: string;
    clockToleranceSeconds: number;
    requireExpiration: boolean;
    requireIssuer: boolean;
    requireAudience: boolean;
    requireSubject: boolean;
    flagLongLifetime: boolean;
  };
}) {
  const issues: ClaimIssue[] = [];

  if (unsecured) issues.push({ severity: "warning", title: "Unsecured alg=none token", message: "The compact structure is consistent with an unsecured JWT. Decoding it does not make it acceptable; the receiving application would need to explicitly permit this form and protect it by other means." });

  ["exp", "iat", "nbf"].forEach((claimName) => {
    if (payload[claimName] !== undefined && getNumericDate(payload[claimName]) === null) {
      issues.push({ severity: "warning", title: `${claimName} is not NumericDate`, message: `${claimName} must be a finite JSON number measured in seconds since the Unix epoch. Numeric strings and date strings are different claim types.` });
    }
  });

  if (options.requireExpiration && payload.exp === undefined) issues.push({ severity: "warning", title: "Required exp claim is missing", message: "Your selected profile requires exp, but this payload does not contain it." });
  if (options.requireIssuer && payload.iss === undefined) issues.push({ severity: "warning", title: "Required iss claim is missing", message: "Your selected profile requires iss, but this payload does not contain it." });
  if (options.requireAudience && payload.aud === undefined) issues.push({ severity: "warning", title: "Required aud claim is missing", message: "Your selected profile requires aud, but this payload does not contain it." });
  if (options.requireSubject && payload.sub === undefined) issues.push({ severity: "warning", title: "Required sub claim is missing", message: "Your selected profile requires sub, but this payload does not contain it." });

  if (payload.iss !== undefined && typeof payload.iss !== "string") issues.push({ severity: "warning", title: "iss has the wrong JSON type", message: "The registered issuer claim is a case-sensitive StringOrURI value, so it should be a string." });
  if (payload.sub !== undefined && typeof payload.sub !== "string") issues.push({ severity: "warning", title: "sub has the wrong JSON type", message: "The registered subject claim should be a string." });
  if (payload.jti !== undefined && typeof payload.jti !== "string") issues.push({ severity: "warning", title: "jti has the wrong JSON type", message: "The registered JWT ID claim should be a string." });
  if (payload.aud !== undefined && !validAudienceType(payload.aud)) issues.push({ severity: "warning", title: "aud has the wrong JSON type", message: "The registered audience claim should be one string or an array containing only strings." });

  if (exp !== null && exp <= nowSeconds - options.clockToleranceSeconds) issues.push({ severity: "warning", title: "exp is past the comparison window", message: "Against the current browser clock and selected tolerance, the expiration time has passed." });
  if (nbf !== null && nbf > nowSeconds + options.clockToleranceSeconds) issues.push({ severity: "warning", title: "nbf is still in the future", message: "Against the current browser clock and selected tolerance, the token says it should not yet be accepted." });
  if (iat !== null && iat > nowSeconds + options.clockToleranceSeconds) issues.push({ severity: "warning", title: "iat is ahead of the browser clock", message: "The issued-at time is later than the current browser time plus tolerance. Clock skew or bad claim data are both possible explanations." });
  if (exp !== null && iat !== null && exp <= iat) issues.push({ severity: "warning", title: "exp is not later than iat", message: "The expiration claim is at or before the issued-at claim. That ordering deserves issuer-side checking." });
  if (exp !== null && nbf !== null && nbf > exp) issues.push({ severity: "warning", title: "nbf is later than exp", message: "The not-before time is after expiration, leaving no normal acceptance window." });
  if (options.flagLongLifetime && exp !== null && iat !== null && exp - iat > 86400) issues.push({ severity: "warning", title: "Lifetime exceeds the selected 24-hour heuristic", message: "JWT itself does not impose this 24-hour limit. Treat it as an application-policy prompt, not a standards violation." });

  const expectedIssuer = options.expectedIssuer.trim();
  if (expectedIssuer && payload.iss !== expectedIssuer) issues.push({ severity: "warning", title: "Issuer does not match the expected value", message: "The decoded iss value is not an exact case-sensitive match for the issuer you entered." });
  const expectedAudience = options.expectedAudience.trim();
  if (expectedAudience && !audienceMatches(payload.aud, expectedAudience)) issues.push({ severity: "warning", title: "Audience does not include the expected value", message: "The decoded aud claim does not contain the audience you entered." });

  if (header.crit !== undefined) issues.push({ severity: "info", title: "Critical JOSE header is present", message: "A crit header means processing rules may depend on extensions. Claim inspection does not implement application-specific critical-header handling." });
  if (typeof header.typ === "string") issues.push({ severity: "info", title: "typ header is descriptive, not verification", message: `The protected header says typ=${header.typ}. Token profiles can use typ to separate JWT kinds, but the value still needs profile-specific validation.` });
  if (payload.exp === undefined && !options.requireExpiration) issues.push({ severity: "info", title: "No exp claim", message: "RFC 7519 does not make exp mandatory for every JWT. Whether its absence is acceptable depends on the token profile and application." });
  if (algorithm) issues.push({ severity: "info", title: "Algorithm was read, not accepted", message: `The header declares alg=${algorithm}. Cryptographic verification must independently restrict allowed algorithms rather than trusting this text.` });
  return issues;
}

function getNumericDate(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function validAudienceType(value: unknown) {
  if (typeof value === "string") return true;
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function audienceMatches(value: unknown, expected: string) {
  if (typeof value === "string") return value === expected;
  return Array.isArray(value) && value.some((item) => typeof item === "string" && item === expected);
}

function extractScopeList(value: unknown) {
  if (typeof value === "string") return value.split(/\s+/).map((item) => item.trim()).filter(Boolean);
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string" && item.length > 0);
  return [];
}

function extractStringList(value: unknown) {
  if (typeof value === "string") return value.split(/[\s,]+/).map((item) => item.trim()).filter(Boolean);
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string" && item.length > 0);
  return [];
}

function collectRoleLikeClaims(payload: Record<string, unknown>) {
  const result: string[] = [];
  ["roles", "role", "permissions", "groups"].forEach((name) => {
    extractStringList(payload[name]).forEach((item) => {
      if (result.indexOf(item) === -1) result.push(item);
    });
  });
  return result;
}

function buildClaimRows(payload: Record<string, unknown>, options: { exp: number | null; iat: number | null; nbf: number | null; timeMode: TimeMode }) {
  const registered: Array<{ name: string; label: string; note: string }> = [
    { name: "iss", label: "Issuer", note: "Principal that issued the JWT; application-specific validation is still required." },
    { name: "sub", label: "Subject", note: "Principal that is the subject of the claims." },
    { name: "aud", label: "Audience", note: "Recipient or recipients the JWT is intended for." },
    { name: "exp", label: "Expiration", note: "Time on or after which the JWT must not be accepted, subject to allowed clock skew." },
    { name: "nbf", label: "Not Before", note: "Time before which the JWT must not be accepted, subject to allowed clock skew." },
    { name: "iat", label: "Issued At", note: "Time when the JWT was issued; often used to reason about token age." },
    { name: "jti", label: "JWT ID", note: "Unique identifier that can help prevent replay when the application uses it that way." },
  ];

  const rows: ClaimRow[] = registered.map((item) => ({
    name: item.name,
    label: item.label,
    note: item.note,
    value: item.name === "exp" && options.exp !== null ? `${String(payload.exp)} (${formatNumericDate(options.exp, options.timeMode)})` : item.name === "iat" && options.iat !== null ? `${String(payload.iat)} (${formatNumericDate(options.iat, options.timeMode)})` : item.name === "nbf" && options.nbf !== null ? `${String(payload.nbf)} (${formatNumericDate(options.nbf, options.timeMode)})` : payload[item.name] !== undefined ? payload[item.name] : "(missing)",
  }));

  Object.keys(payload).filter((key) => !registered.some((item) => item.name === key)).sort().forEach((key) => {
    rows.push({ name: key, label: key, value: payload[key], note: "Private, public, or provider-specific claim; meaning depends on the token profile." });
  });
  return rows;
}

function formatNumericDate(seconds: number, mode: TimeMode) {
  const milliseconds = seconds * 1000;
  if (!Number.isFinite(milliseconds) || Math.abs(milliseconds) > 8.64e15) return "Outside the JavaScript Date range";
  const date = new Date(milliseconds);
  if (Number.isNaN(date.getTime())) return "Outside the JavaScript Date range";
  return mode === "utc" ? date.toISOString() : date.toLocaleString();
}

function formatClaimValue(value: unknown) {
  if (typeof value === "string") return value;
  const json = JSON.stringify(value);
  return json === undefined ? String(value) : json;
}

function formatOutput(inspection: Omit<JWTInspection, "output">, outputMode: OutputMode) {
  if (outputMode === "claims") return JSON.stringify(inspection.payload, null, 2);
  if (outputMode === "json") return JSON.stringify(inspection, null, 2);
  if (outputMode === "report") {
    return [
      "JWT claim inspection",
      "--------------------",
      `Algorithm header: ${inspection.algorithm}`,
      `Unsecured alg=none: ${inspection.unsecured ? "yes" : "no"}`,
      `Signature segment: ${inspection.signaturePresent ? "present" : "empty"}`,
      `Expiration: ${inspection.expiresAt}`,
      `Issued at: ${inspection.issuedAt}`,
      `Not before: ${inspection.notBefore}`,
      `Scopes: ${inspection.scopes.length ? inspection.scopes.join(", ") : "(none found)"}`,
      `Role-like values: ${inspection.roles.length ? inspection.roles.join(", ") : "(none found)"}`,
      "",
      "Findings:",
      ...(inspection.issues.length ? inspection.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`) : ["- None"]),
      "",
      "Reminder: decoded claims have not been cryptographically verified.",
    ].join("\n");
  }
  return [
    "JWT claim summary",
    "-----------------",
    `Algorithm header: ${inspection.algorithm}`,
    `Expiration: ${inspection.expiresAt}`,
    `Expired by browser-clock comparison: ${inspection.isExpired ? "yes" : "no"}`,
    `Not yet valid by browser-clock comparison: ${inspection.isNotYetValid ? "yes" : "no"}`,
    `Issuer: ${formatClaimValue(inspection.payload.iss !== undefined ? inspection.payload.iss : "(missing)")}`,
    `Audience: ${formatClaimValue(inspection.payload.aud !== undefined ? inspection.payload.aud : "(missing)")}`,
    `Subject: ${formatClaimValue(inspection.payload.sub !== undefined ? inspection.payload.sub : "(missing)")}`,
    `Warnings: ${inspection.issues.filter((issue) => issue.severity === "warning").length}`,
    "Trust: not verified",
  ].join("\n");
}

function createSampleJwt() {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    iss: "https://auth.example.com",
    aud: ["yoryantra-api", "profile-service"],
    sub: "sneha-42",
    scope: "tools:read tools:write",
    roles: ["editor"],
    iat: 1717075200,
    nbf: 1717075200,
    exp: 1893459600,
  };
  return `${encodeJsonBase64Url(header)}.${encodeJsonBase64Url(payload)}.c2lnbmF0dXJl`;
}

function encodeJsonBase64Url(value: Record<string, unknown>) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  return bytesToBase64Url(bytes);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
