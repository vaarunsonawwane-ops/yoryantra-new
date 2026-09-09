"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "summary" | "detailed" | "json" | "matches";
type InputMode = "single" | "multi";
type Confidence = "high" | "medium" | "low";

type HashMatch = {
  name: string;
  family: string;
  confidence: Confidence;
  reason: string;
  securityNote: string;
};

type HashAnalysis = {
  input: string;
  value: string;
  length: number;
  characterSet: string;
  format: string;
  shapeNote: string;
  matches: HashMatch[];
  warnings: string[];
};

type IdentifierResult = {
  analyses: HashAnalysis[];
  output: string;
  totalInputs: number;
  matchedInputs: number;
  ambiguousInputs: number;
  warningCount: number;
};

type Pattern = {
  name: string;
  family: string;
  confidence: Confidence;
  test: (value: string) => boolean;
  reason: string;
  securityNote: string;
};

const sampleHashes = `5d41402abc4b2a76b9719d911017c592
2aae6c35c94fcfb415dbe95f408b9ce91ee846ed
a948904f2f0f479b8f8197694b30184b0d2ed1c1cd2a1ec0fb85d299a192a447
$2b$12$abcdefghijklmnopqrstuuJg6kCz3Wr2WlZEVW31KqZ8p.9JZ9L6A
$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$YWJjZGVmZ2hpamtsbW5vcA`;

const patterns: Pattern[] = [
  {
    name: "bcrypt formatted password hash",
    family: "Password hash",
    confidence: "high",
    test: (value) => /^\$2[aby]\$(0[4-9]|[12]\d|3[01])\$[./A-Za-z0-9]{53}$/.test(value),
    reason: "The value has a bcrypt version prefix, valid two-digit cost range, and the expected 60-character layout.",
    securityNote: "The format identifies bcrypt, but it does not tell you whether the chosen cost is appropriate for your system today.",
  },
  {
    name: "Argon2 PHC string",
    family: "Password hash",
    confidence: "high",
    test: (value) => /^\$argon2(id|i|d)\$v=19\$m=\d+,t=\d+,p=\d+\$[A-Za-z0-9+/]+={0,2}\$[A-Za-z0-9+/]+={0,2}$/.test(value),
    reason: "The value carries an Argon2 variant, version, memory/time/parallelism parameters, salt, and encoded tag.",
    securityNote: "Argon2 parameters still need to be judged against the application and hardware; the prefix alone does not prove a strong configuration.",
  },
  {
    name: "PBKDF2-labelled string",
    family: "Password KDF",
    confidence: "high",
    test: (value) => /(^|[$:_-])pbkdf2([_$:-]|$)/i.test(value),
    reason: "The formatted value explicitly names PBKDF2.",
    securityNote: "PBKDF2 storage formats vary by framework. Iteration count, PRF, salt, and derived-key length matter more than the label alone.",
  },
  {
    name: "scrypt-labelled string",
    family: "Password KDF",
    confidence: "medium",
    test: (value) => /^\$scrypt\$/i.test(value) || /^scrypt[:$]/i.test(value),
    reason: "The value starts with a recognizable scrypt label, although there is no single universal storage string for every scrypt implementation.",
    securityNote: "Confirm the exact parameter encoding in the library or framework that produced the value.",
  },
  {
    name: "UUID",
    family: "Identifier, not a hash",
    confidence: "high",
    test: (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value),
    reason: "The hyphenated layout and variant bits match the familiar UUID text form.",
    securityNote: "A UUID is normally an identifier. Do not infer password hashing or digest semantics from it.",
  },
  {
    name: "128-bit hexadecimal digest shape",
    family: "Ambiguous digest shape",
    confidence: "low",
    test: (value) => isHexLength(value, 32),
    reason: "Thirty-two hexadecimal characters encode 128 bits. MD5 and NTLM are two familiar examples, but the shape is not unique to either.",
    securityNote: "Do not label a 32-character hex value as MD5 or NTLM without source-system evidence.",
  },
  {
    name: "SHA-1-sized hexadecimal digest",
    family: "Ambiguous digest shape",
    confidence: "low",
    test: (value) => isHexLength(value, 40),
    reason: "Forty hexadecimal characters encode 160 bits, the output size commonly associated with SHA-1.",
    securityNote: "Length suggests a SHA-1-sized digest but does not prove SHA-1. SHA-1 is being retired from security-sensitive uses.",
  },
  {
    name: "224-bit hexadecimal digest shape",
    family: "Ambiguous digest shape",
    confidence: "low",
    test: (value) => isHexLength(value, 56),
    reason: "Fifty-six hexadecimal characters encode 224 bits, matching outputs such as SHA-224 and SHA3-224.",
    securityNote: "Several algorithms can produce a 224-bit digest, so metadata is needed to identify the algorithm.",
  },
  {
    name: "256-bit hexadecimal digest shape",
    family: "Ambiguous digest shape",
    confidence: "low",
    test: (value) => isHexLength(value, 64),
    reason: "Sixty-four hexadecimal characters encode 256 bits, matching SHA-256, SHA3-256, SHA-512/256, BLAKE2s-256, and other digests.",
    securityNote: "A 64-character hex value is not proof of SHA-256.",
  },
  {
    name: "384-bit hexadecimal digest shape",
    family: "Ambiguous digest shape",
    confidence: "low",
    test: (value) => isHexLength(value, 96),
    reason: "Ninety-six hexadecimal characters encode 384 bits, matching SHA-384, SHA3-384, and other 384-bit outputs.",
    securityNote: "Output size narrows possibilities but does not identify the algorithm by itself.",
  },
  {
    name: "512-bit hexadecimal digest shape",
    family: "Ambiguous digest shape",
    confidence: "low",
    test: (value) => isHexLength(value, 128),
    reason: "One hundred twenty-eight hexadecimal characters encode 512 bits, matching SHA-512, SHA3-512, BLAKE2b-512, and other outputs.",
    securityNote: "Output size narrows possibilities but does not identify the algorithm by itself.",
  },
];

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("multi");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [trimInput, setTrimInput] = useState(true);
  const [includeLegacyCaution, setIncludeLegacyCaution] = useState(true);
  const [showLowConfidence, setShowLowConfidence] = useState(true);
  const [result, setResult] = useState<IdentifierResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const cautionNotes = useMemo(() => (result ? getCautionNotes(result) : []), [result]);

  const clearResult = () => {
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const identifyHashes = () => {
    if (!input.trim()) {
      setError("Paste one value, or put multiple values on separate lines.");
      setResult(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const nextResult = identifyHashAlgorithms(input, {
        inputMode,
        outputMode,
        trimInput,
        includeLegacyCaution,
        showLowConfidence,
      });
      setResult(nextResult);
      setOutput(nextResult.output);
      setError("");
      setCopied(false);
    } catch (caught) {
      setResult(null);
      setOutput("");
      setCopied(false);
      setError(caught instanceof Error ? caught.message : "Unable to classify these values.");
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
      setError("The classification report could not be copied. Select and copy it manually.");
    }
  };

  const loadExample = () => {
    setInput(sampleHashes);
    setInputMode("multi");
    setOutputMode("summary");
    setTrimInput(true);
    setIncludeLegacyCaution(true);
    setShowLowConfidence(true);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setInputMode("multi");
    setOutputMode("summary");
    setTrimInput(true);
    setIncludeLegacyCaution(true);
    setShowLowConfidence(true);
    clearResult();
  };

  return (
    <ToolShell
      title="Hash Algorithm Identifier"
      description="Distinguish self-identifying password hashes from ambiguous digest shapes and token-like values."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="mb-2 block text-sm font-medium text-gray-700">Hash or hash-like value</label>
        <textarea
          value={input}
          onChange={(event: { target: { value: string } }) => {
            setInput(event.target.value);
            clearResult();
          }}
          placeholder={sampleHashes}
          className="min-h-[300px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Self-describing password formats can be recognized with much more confidence than a bare hexadecimal digest. A bare digest is classified by shape, not declared to be a specific algorithm.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">How much ambiguity should stay visible?</h3>
        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Input layout"
            value={inputMode}
            onChange={(value: string) => {
              setInputMode(value as InputMode);
              clearResult();
            }}
            options={[
              { label: "One value per line", value: "multi" },
              { label: "Single value", value: "single" },
            ]}
          />
          <YoryantraSelect
            label="Copied output"
            value={outputMode}
            onChange={(value: string) => {
              setOutputMode(value as OutputMode);
              clearResult();
            }}
            options={[
              { label: "Compact summary", value: "summary" },
              { label: "Detailed reasoning", value: "detailed" },
              { label: "JSON", value: "json" },
              { label: "Matches only", value: "matches" },
            ]}
          />
          <CheckboxRow checked={trimInput} label="Trim leading and trailing whitespace before classification" onChange={(checked) => { setTrimInput(checked); clearResult(); }} />
          <CheckboxRow checked={showLowConfidence} label="Keep digest-size and encoded-byte clues that cannot prove an algorithm" onChange={(checked) => { setShowLowConfidence(checked); clearResult(); }} />
          <CheckboxRow checked={includeLegacyCaution} label="Call out SHA-1-sized and 128-bit legacy digest shapes" onChange={(checked) => { setIncludeLegacyCaution(checked); clearResult(); }} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={identifyHashes} className="yoryantra-btn whitespace-nowrap">Classify Values</button>
        <button onClick={copyOutput} className="yoryantra-btn whitespace-nowrap" disabled={!output}>{copied ? "Copied" : "Copy Output"}</button>
        <button onClick={loadExample} className="yoryantra-btn-outline whitespace-nowrap">Load Example</button>
        <button onClick={resetAll} className="yoryantra-btn-outline whitespace-nowrap">Reset</button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">{error}</div>
      )}

      {result && (
        <div className="mt-8 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Inputs" value={String(result.totalInputs)} />
          <SummaryCard label="With clues" value={String(result.matchedInputs)} />
          <SummaryCard label="Ambiguous" value={String(result.ambiguousInputs)} />
          <SummaryCard label="Cautions" value={String(result.warningCount)} />
        </div>
      )}

      {result && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">What the visible format actually supports</h3>
          <div className="mt-4 space-y-4">
            {result.analyses.map((analysis, index) => (
              <div key={`${index}-${analysis.input}`} className="min-w-0 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <MiniStat label="Length" value={String(analysis.length)} />
                  <MiniStat label="Character set" value={analysis.characterSet} />
                  <MiniStat label="Visible form" value={analysis.format} />
                </div>
                <p className="mt-3 break-words font-mono text-xs text-gray-600 [overflow-wrap:anywhere]">{analysis.value}</p>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{analysis.shapeNote}</p>

                {analysis.matches.length > 0 ? (
                  <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white">
                    <table className="w-full min-w-[760px] text-left text-sm">
                      <thead className="bg-gray-50 text-gray-600">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Clue</th>
                          <th className="px-4 py-3 font-semibold">Confidence</th>
                          <th className="px-4 py-3 font-semibold">Why it matched</th>
                          <th className="px-4 py-3 font-semibold">Boundary</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {analysis.matches.map((match) => (
                          <tr key={match.name}>
                            <td className="px-4 py-3 font-semibold text-gray-900">{match.name}</td>
                            <td className="px-4 py-3">
                              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${match.confidence === "high" ? "bg-green-50 text-green-700" : match.confidence === "medium" ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-700"}`}>{match.confidence}</span>
                            </td>
                            <td className="px-4 py-3 leading-relaxed text-gray-700">{match.reason}</td>
                            <td className="px-4 py-3 leading-relaxed text-gray-700">{match.securityNote}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="mt-4 rounded-lg border border-gray-200 bg-white p-3 text-sm leading-relaxed text-gray-600">
                    No supported format clue matched this exact value.
                  </div>
                )}

                {analysis.warnings.length > 0 && (
                  <div className="mt-4 self-start rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    <ul className="list-disc space-y-1 pl-5">
                      {analysis.warnings.map((warning) => <li key={warning}>{warning}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {cautionNotes.length > 0 && (
        <div className="mt-6 self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">What still needs source-system evidence</h3>
          <div className="mt-3 space-y-3">
            {cautionNotes.map((note) => (
              <p key={note} className="text-sm leading-relaxed text-amber-800">{note}</p>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Copyable classification</h3>
          {output && <button onClick={copyOutput} className="yoryantra-btn-outline whitespace-nowrap text-sm">{copied ? "Copied" : "Copy"}</button>}
        </div>
        <pre className="yoryantra-output min-h-[300px] overflow-auto whitespace-pre-wrap break-words text-sm [overflow-wrap:anywhere]">
          {output || "The format clues will appear here."}
        </pre>
      </div>

      <div className="mt-4 self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
        Classification runs in the browser and performs no hash lookup or cracking. Pasted values are not sent to a server by this page.
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">A hash string can reveal a format without revealing an algorithm</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Prefix-rich password hashes such as bcrypt and Argon2 carry identifying structure: algorithm family, version or parameters, salt, and encoded output. A bare 64-character hexadecimal string carries far less information. It tells you that 256 bits are being represented, not whether the bytes came from SHA-256, SHA3-256, BLAKE2s, SHA-512/256, random data, or something application-specific.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The distinction matters during migrations and incident work. A confident-looking algorithm label based only on digest length can send debugging in the wrong direction.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Why MD5 and NTLM cannot be separated by 32 hex characters</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Both are often written as 32 hexadecimal characters. Many unrelated 128-bit values have the same text shape. Without surrounding metadata—database column meaning, framework settings, source code, protocol context, or a known test vector—the string alone does not prove which algorithm produced it.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            For the same reason, 40, 56, 64, 96, and 128 hex characters are described here as digest-size clues rather than definitive SHA labels.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Password-hash prefixes carry more evidence, but parameters still matter</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A valid-looking bcrypt string identifies the bcrypt storage format and exposes its cost field. An Argon2 PHC string exposes the variant and memory, time, and parallelism parameters. Recognition still does not answer whether those settings are suitable for current hardware, whether salts were generated correctly, or whether the application verifies passwords safely.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            PBKDF2 and scrypt are especially dependent on framework-specific serialization. A visible label can be a strong clue while the exact string grammar remains implementation-specific.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Encoded random bytes can look exactly like a digest</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Base64 and Base64URL strings often appear in API keys, nonces, session identifiers, binary digests, and random secrets. When an encoded value has a canonical form, the decoded byte count is a useful clue. It is still only a byte count. Random 32-byte data and a 32-byte hash digest can have the same encoded length.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Security decisions need more than a guessed name</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            NIST's Secure Hash Standard defines the SHA-1 and SHA-2 digest sizes, while SHA-3 is defined separately. NIST is transitioning away from SHA-1 for remaining applications. For password storage, fast message digests and memory-hard password hashes solve different problems; RFC 9106 documents Argon2 and recommends Argon2id for broadly applicable password-hashing settings.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            References: <a className="font-medium text-[var(--green)] underline underline-offset-2" href="https://csrc.nist.gov/pubs/fips/180-4/upd1/final" target="_blank" rel="noreferrer">NIST FIPS 180-4</a>, <a className="font-medium text-[var(--green)] underline underline-offset-2" href="https://www.nist.gov/news-events/news/2022/12/nist-transitioning-away-sha-1-all-applications" target="_blank" rel="noreferrer">NIST SHA-1 transition guidance</a>, and <a className="font-medium text-[var(--green)] underline underline-offset-2" href="https://www.rfc-editor.org/rfc/rfc9106" target="_blank" rel="noreferrer">RFC 9106</a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/hash-algorithm-identifier" />
          </div>
        </div>
      </section>
    </ToolShell>
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
      <div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-gray-900 [overflow-wrap:anywhere]">{value}</p>
    </div>
  );
}

function identifyHashAlgorithms(
  input: string,
  options: {
    inputMode: InputMode;
    outputMode: OutputMode;
    trimInput: boolean;
    includeLegacyCaution: boolean;
    showLowConfidence: boolean;
  }
): IdentifierResult {
  const sourceValues = options.inputMode === "single" ? [input] : input.split(/\r?\n/);
  const values = sourceValues
    .filter((value) => value.trim().length > 0)
    .map((value) => options.trimInput ? value.trim() : value);

  if (values.length === 0) throw new Error("No values were found after applying the input settings.");
  if (values.length > 1000) throw new Error("Classify at most 1,000 values at a time in the browser.");

  const analyses = values.map((value) => analyzeHash(value, options));
  const matchedInputs = analyses.filter((analysis) => analysis.matches.length > 0).length;
  const ambiguousInputs = analyses.filter((analysis) => analysis.matches.some((match) => match.family === "Ambiguous digest shape" || match.confidence === "low")).length;
  const warningCount = analyses.reduce((count, analysis) => count + analysis.warnings.length, 0);

  return {
    analyses,
    output: formatOutput(analyses, options.outputMode),
    totalInputs: analyses.length,
    matchedInputs,
    ambiguousInputs,
    warningCount,
  };
}

function analyzeHash(
  value: string,
  options: { includeLegacyCaution: boolean; showLowConfidence: boolean }
): HashAnalysis {
  const matches = patterns
    .filter((pattern) => pattern.test(value))
    .map<HashMatch>((pattern) => ({
      name: pattern.name,
      family: pattern.family,
      confidence: pattern.confidence,
      reason: pattern.reason,
      securityNote: pattern.securityNote,
    }));

  const encoded = getEncodedByteClue(value);
  if (encoded) matches.push(encoded);

  const filteredMatches = matches
    .filter((match) => options.showLowConfidence || match.confidence !== "low")
    .sort((a, b) => confidenceRank(b.confidence) - confidenceRank(a.confidence));

  return {
    input: value,
    value,
    length: value.length,
    characterSet: detectCharacterSet(value),
    format: detectFormat(value),
    shapeNote: getShapeNote(value, encoded),
    matches: filteredMatches,
    warnings: getWarnings(value, filteredMatches, options.includeLegacyCaution),
  };
}

function confidenceRank(confidence: Confidence) {
  if (confidence === "high") return 3;
  if (confidence === "medium") return 2;
  return 1;
}

function isHexLength(value: string, length: number) {
  return value.length === length && /^[0-9a-f]+$/i.test(value);
}

function detectCharacterSet(value: string) {
  if (/^[0-9a-f]+$/i.test(value)) return "hexadecimal";
  if (/^[A-Za-z0-9+/]+={0,2}$/.test(value)) return "Base64 alphabet";
  if (/^[A-Za-z0-9_-]+$/.test(value)) return "Base64URL/token alphabet";
  if (value.charAt(0) === "$") return "structured $-delimited text";
  return "mixed";
}

function detectFormat(value: string) {
  if (/^\$2[aby]\$/.test(value)) return "bcrypt-like";
  if (/^\$argon2(id|i|d)\$/.test(value)) return "Argon2-like";
  if (/^[0-9a-f]+$/i.test(value)) return "plain hexadecimal";
  if (/^[A-Za-z0-9+/]+={0,2}$/.test(value)) return "Base64-like";
  if (/^[A-Za-z0-9_-]+$/.test(value)) return "Base64URL/token-like";
  return "custom or unknown";
}

function getShapeNote(value: string, encoded: HashMatch | null) {
  if (/^(.)\1+$/.test(value)) return "The value repeats one character, which is not a normal-looking cryptographic output.";
  if (encoded) return encoded.reason;
  if (/^[0-9a-f]+$/i.test(value)) return `The hexadecimal text represents ${value.length * 4} bits if every digit is part of the encoded value.`;
  if (/^\$/.test(value)) return "A structured prefix can carry more identifying evidence than length alone.";
  return "No entropy estimate is inferred from appearance; visual complexity is not a measurement of randomness.";
}

function getWarnings(value: string, matches: HashMatch[], includeLegacyCaution: boolean) {
  const warnings: string[] = [];
  if (matches.length === 0) warnings.push("No supported format clue matched. The value may be custom, truncated, encoded differently, or not a hash.");
  if (matches.filter((match) => match.family === "Ambiguous digest shape").length > 0) warnings.push("Digest length narrows the output size but cannot prove the generating algorithm.");
  if (includeLegacyCaution && isHexLength(value, 32)) warnings.push("A 128-bit hex shape can match legacy values such as MD5 or NTLM; neither should be assumed from shape alone.");
  if (includeLegacyCaution && isHexLength(value, 40)) warnings.push("A 160-bit hex shape is compatible with SHA-1 output size. SHA-1 is being retired from remaining security-sensitive uses.");
  if (/\s/.test(value)) warnings.push("Whitespace is part of the value because trimming is disabled; that can prevent an otherwise familiar format from matching.");
  if (value.length < 8) warnings.push("The value is very short for a cryptographic digest or password-hash string.");
  return warnings;
}

function getEncodedByteClue(value: string): HashMatch | null {
  if (/^[0-9a-f]+$/i.test(value) || value.charAt(0) === "$" || /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(value)) return null;
  const standardBytes = decodeCanonicalBase64Length(value);
  if (standardBytes !== null) {
    return {
      name: `Base64 data (${standardBytes} bytes)`,
      family: "Encoded bytes",
      confidence: "low",
      reason: `The value is canonical standard Base64 representing ${standardBytes} bytes. Those bytes could be a digest, random secret, token, or other binary data.`,
      securityNote: "Encoded byte length is not an algorithm identifier.",
    };
  }
  const urlBytes = decodeCanonicalBase64UrlLength(value);
  if (urlBytes !== null) {
    return {
      name: `Base64URL data (${urlBytes} bytes)`,
      family: "Encoded bytes",
      confidence: "low",
      reason: `The value is canonical unpadded Base64URL representing ${urlBytes} bytes. Those bytes could be a digest, random secret, token, or other binary data.`,
      securityNote: "Encoded byte length is not an algorithm identifier.",
    };
  }
  return null;
}

function decodeCanonicalBase64Length(value: string) {
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value) || value.length % 4 !== 0) return null;
  const firstPad = value.indexOf("=");
  if (firstPad !== -1 && firstPad < value.length - 2) return null;
  try {
    const binary = atob(value);
    const canonical = btoa(binary);
    return canonical === value ? binary.length : null;
  } catch {
    return null;
  }
}

function decodeCanonicalBase64UrlLength(value: string) {
  if (!/^[A-Za-z0-9_-]+$/.test(value) || value.length % 4 === 1) return null;
  try {
    const standard = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = standard + "=".repeat((4 - (standard.length % 4)) % 4);
    const binary = atob(padded);
    const canonical = btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
    return canonical === value ? binary.length : null;
  } catch {
    return null;
  }
}

function formatOutput(analyses: HashAnalysis[], outputMode: OutputMode) {
  if (outputMode === "json") return JSON.stringify(analyses, null, 2);
  if (outputMode === "matches") {
    return analyses.map((analysis, index) => `Input ${index + 1}: ${analysis.matches.length ? analysis.matches.map((match) => `${match.name} [${match.confidence}]`).join(", ") : "no supported clue"}`).join("\n");
  }
  if (outputMode === "detailed") {
    return analyses.map((analysis, index) => [
      `Input ${index + 1}`,
      "-------",
      `Value: ${analysis.value}`,
      `Length: ${analysis.length}`,
      `Character set: ${analysis.characterSet}`,
      `Visible form: ${analysis.format}`,
      `Shape note: ${analysis.shapeNote}`,
      "",
      "Clues:",
      ...(analysis.matches.length ? analysis.matches.map((match) => `- ${match.name} [${match.confidence}]: ${match.reason} ${match.securityNote}`) : ["- No supported format clue matched."]),
      "",
      "Cautions:",
      ...(analysis.warnings.length ? analysis.warnings.map((warning) => `- ${warning}`) : ["- None"]),
    ].join("\n")).join("\n\n");
  }
  return [
    "Hash-format classification",
    "--------------------------",
    ...analyses.map((analysis, index) => `Input ${index + 1}: ${analysis.matches[0] ? `${analysis.matches[0].name} [${analysis.matches[0].confidence}]` : "no supported clue"}${analysis.matches.length > 1 ? ` + ${analysis.matches.length - 1} more` : ""}`),
  ].join("\n");
}

function getCautionNotes(result: IdentifierResult) {
  const notes: string[] = [];
  if (result.ambiguousInputs > 0) notes.push("At least one value is classified from digest size or encoded-byte length. Confirm the algorithm in source code, framework configuration, protocol documentation, or a known test vector before making a migration or security decision.");
  if (result.analyses.some((analysis) => analysis.matches.some((match) => match.name.indexOf("bcrypt") !== -1 || match.name.indexOf("Argon2") !== -1))) notes.push("Recognizing a password-hash format does not validate its cost, memory settings, salt generation, password policy, or verification code.");
  return notes;
}
