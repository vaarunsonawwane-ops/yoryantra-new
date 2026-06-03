"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "summary" | "detailed" | "json" | "matches";
type InputMode = "single" | "multi";
type Confidence = "high" | "medium" | "low";

type HashMatch = {
  name: string;
  family: string;
  confidence: Confidence;
  reason: string;
  example: string;
  securityNote: string;
};

type HashAnalysis = {
  input: string;
  normalized: string;
  length: number;
  characterSet: string;
  format: string;
  entropyHint: string;
  matches: HashMatch[];
  warnings: string[];
};

type IdentifierResult = {
  analyses: HashAnalysis[];
  output: string;
  totalInputs: number;
  matchedInputs: number;
  warningCount: number;
};

type HashNote = {
  title: string;
  message: string;
};

const sampleHashes = `5d41402abc4b2a76b9719d911017c592
2aae6c35c94fcfb415dbe95f408b9ce91ee846ed
a948904f2f0f479b8f8197694b30184b0d2ed1c1cd2a1ec0fb85d299a192a447
$2y$10$abcdefghijklmnopqrstuuJg6kCz3Wr2WlZEVW31KqZ8p.9JZ9L6
$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$hashvaluehere`;

const knownPatterns: Array<{
  name: string;
  family: string;
  test: (value: string) => boolean;
  confidence: Confidence;
  reason: string;
  example: string;
  securityNote: string;
}> = [
  {
    name: "MD5",
    family: "Fast hash",
    test: (value) => /^[a-f0-9]{32}$/i.test(value),
    confidence: "medium",
    reason: "32 hexadecimal characters is a common MD5 digest shape.",
    example: "5d41402abc4b2a76b9719d911017c592",
    securityNote: "MD5 is not suitable for password storage or collision-resistant security use.",
  },
  {
    name: "SHA-1",
    family: "Fast hash",
    test: (value) => /^[a-f0-9]{40}$/i.test(value),
    confidence: "medium",
    reason: "40 hexadecimal characters is a common SHA-1 digest shape.",
    example: "2aae6c35c94fcfb415dbe95f408b9ce91ee846ed",
    securityNote: "SHA-1 is considered weak for collision-resistant security use.",
  },
  {
    name: "SHA-224",
    family: "Fast hash",
    test: (value) => /^[a-f0-9]{56}$/i.test(value),
    confidence: "medium",
    reason: "56 hexadecimal characters is a common SHA-224 digest shape.",
    example: "d14a028c2a3a2bc9476102bb288234c415a2b01f828ea62ac5b3e42f",
    securityNote: "SHA-224 is uncommon compared with SHA-256 and SHA-512.",
  },
  {
    name: "SHA-256",
    family: "Fast hash",
    test: (value) => /^[a-f0-9]{64}$/i.test(value),
    confidence: "medium",
    reason: "64 hexadecimal characters is a common SHA-256 digest shape.",
    example: "a948904f2f0f479b8f8197694b30184b0d2ed1c1cd2a1ec0fb85d299a192a447",
    securityNote: "SHA-256 is fast. Do not use raw SHA-256 alone for password storage.",
  },
  {
    name: "SHA-384",
    family: "Fast hash",
    test: (value) => /^[a-f0-9]{96}$/i.test(value),
    confidence: "medium",
    reason: "96 hexadecimal characters is a common SHA-384 digest shape.",
    example: "hex string with 96 characters",
    securityNote: "SHA-384 is a cryptographic hash, but password storage still needs a slow password hash.",
  },
  {
    name: "SHA-512",
    family: "Fast hash",
    test: (value) => /^[a-f0-9]{128}$/i.test(value),
    confidence: "medium",
    reason: "128 hexadecimal characters is a common SHA-512 digest shape.",
    example: "hex string with 128 characters",
    securityNote: "SHA-512 is fast. Do not use raw SHA-512 alone for password storage.",
  },
  {
    name: "bcrypt",
    family: "Password hash",
    test: (value) => /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value),
    confidence: "high",
    reason: "bcrypt hashes use the $2a$, $2b$, or $2y$ prefix with cost and salt/hash data.",
    example: "$2y$10$abcdefghijklmnopqrstuuJg6kCz3Wr2WlZEVW31KqZ8p.9JZ9L6",
    securityNote: "bcrypt is designed for password hashing when configured with a suitable cost.",
  },
  {
    name: "Argon2",
    family: "Password hash",
    test: (value) => /^\$argon2(id|i|d)\$v=\d+\$m=\d+,t=\d+,p=\d+\$/.test(value),
    confidence: "high",
    reason: "Argon2 hashes include an argon2 prefix and memory, time, and parallelism parameters.",
    example: "$argon2id$v=19$m=65536,t=3,p=4$...",
    securityNote: "Argon2id is commonly recommended for modern password hashing.",
  },
  {
    name: "scrypt",
    family: "Password hash",
    test: (value) => /^\$scrypt\$/.test(value) || /^scrypt[:$]/i.test(value),
    confidence: "medium",
    reason: "The value has a scrypt-style prefix.",
    example: "$scrypt$ln=16,r=8,p=1$...",
    securityNote: "scrypt is a password hashing KDF when configured with suitable parameters.",
  },
  {
    name: "PBKDF2-style string",
    family: "Password hash / KDF",
    test: (value) => /pbkdf2/i.test(value),
    confidence: "high",
    reason: "The value explicitly includes PBKDF2 in the formatted string.",
    example: "pbkdf2_sha256$600000$salt$hash",
    securityNote: "PBKDF2 security depends heavily on iteration count, salt, and algorithm.",
  },
  {
    name: "Base64 encoded 128-bit value",
    family: "Token / digest shape",
    test: (value) => /^[A-Za-z0-9+/]{22}={0,2}$/.test(value) || /^[A-Za-z0-9_-]{22}$/.test(value),
    confidence: "low",
    reason: "The value looks like Base64/Base64URL data around 128 bits.",
    example: "XUFAKrxLKna5cZ2REBfFkg",
    securityNote: "This shape could be a token, digest, random ID, or encoded bytes.",
  },
  {
    name: "Base64 encoded 256-bit value",
    family: "Token / digest shape",
    test: (value) => /^[A-Za-z0-9+/]{43}={0,2}$/.test(value) || /^[A-Za-z0-9_-]{43,44}$/.test(value),
    confidence: "low",
    reason: "The value looks like Base64/Base64URL data around 256 bits.",
    example: "qUiQTy8PR5-4mIgOSFZ2WokT6idTQ1R_iE5nZ9N8Z8w",
    securityNote: "This shape could be a token, SHA-256 bytes, random secret, or encoded data.",
  },
  {
    name: "UUID",
    family: "Identifier",
    test: (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value),
    confidence: "high",
    reason: "The value matches the common UUID format.",
    example: "550e8400-e29b-41d4-a716-446655440000",
    securityNote: "A UUID is usually an identifier, not a password hash.",
  },
  {
    name: "NTLM",
    family: "Password hash",
    test: (value) => /^[a-f0-9]{32}$/i.test(value),
    confidence: "low",
    reason: "NTLM hashes are also 32 hexadecimal characters, overlapping with MD5.",
    example: "8846f7eaee8fb117ad06bdd830b7586c",
    securityNote: "NTLM is weak for modern password security.",
  },
];

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("multi");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [trimInput, setTrimInput] = useState(true);
  const [caseInsensitiveHex, setCaseInsensitiveHex] = useState(true);
  const [includeWeakHashWarnings, setIncludeWeakHashWarnings] = useState(true);
  const [showLowConfidence, setShowLowConfidence] = useState(true);
  const [result, setResult] = useState<IdentifierResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getHashNotes(result) : []), [result]);

  const identifyHashes = () => {
    if (!input.trim()) {
      setError("Please paste one or more hash strings.");
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
        caseInsensitiveHex,
        includeWeakHashWarnings,
        showLowConfidence,
      });

      setResult(nextResult);
      setOutput(nextResult.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to identify this hash value."
      );
      setResult(null);
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
    setInput(sampleHashes);
    setInputMode("multi");
    setOutputMode("summary");
    setTrimInput(true);
    setCaseInsensitiveHex(true);
    setIncludeWeakHashWarnings(true);
    setShowLowConfidence(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setInputMode("multi");
    setOutputMode("summary");
    setTrimInput(true);
    setCaseInsensitiveHex(true);
    setIncludeWeakHashWarnings(true);
    setShowLowConfidence(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="Hash Algorithm Identifier"
      description="Identify possible hash algorithms from a hash string. Check length, character set, common formats, MD5, SHA1, SHA256, SHA512, bcrypt, Argon2, UUID-like values, and more directly in your browser."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Hash Input
        </label>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setResult(null);
            setOutput("");
            setError("");
            setCopied(false);
          }}
          placeholder={sampleHashes}
          className="w-full min-h-[320px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste one hash or multiple hashes on separate lines. This tool
          identifies possible formats; it cannot prove the exact algorithm when
          formats overlap.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Options
        </h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Input"
            value={inputMode}
            onChange={(value) => {
              setInputMode(value as InputMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Multiple lines", value: "multi" },
              { label: "Single value", value: "single" },
            ]}
          />

          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value) => {
              setOutputMode(value as OutputMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Summary", value: "summary" },
              { label: "Detailed report", value: "detailed" },
              { label: "JSON", value: "json" },
              { label: "Matches only", value: "matches" },
            ]}
          />

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={trimInput}
              onChange={(event) => {
                setTrimInput(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Trim whitespace
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={caseInsensitiveHex}
              onChange={(event) => {
                setCaseInsensitiveHex(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Treat hexadecimal as case-insensitive
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={includeWeakHashWarnings}
              onChange={(event) => {
                setIncludeWeakHashWarnings(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Include weak hash warnings
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={showLowConfidence}
              onChange={(event) => {
                setShowLowConfidence(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Show low-confidence matches
          </label>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Hash identification is based on format, length, prefix, and character
          set. Different algorithms can share the same visible shape.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={identifyHashes} className="yoryantra-btn">
          Identify Hash
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
          <SummaryCard label="Inputs" value={result.totalInputs.toLocaleString()} />
          <SummaryCard label="Matched" value={result.matchedInputs.toLocaleString()} />
          <SummaryCard label="Warnings" value={result.warningCount.toLocaleString()} />
          <SummaryCard
            label="Best Match"
            value={result.analyses[0]?.matches[0]?.name || "(none)"}
          />
        </div>
      )}

      {result && result.analyses.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Identification Results
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Possible algorithms based on visible hash format and known prefixes.
          </p>

          <div className="mt-4 space-y-4">
            {result.analyses.map((analysis, index) => (
              <div key={`${analysis.normalized}-${index}`} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-900">
                    Input {index + 1}
                  </span>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                    {analysis.length} chars
                  </span>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                    {analysis.characterSet}
                  </span>

                  {analysis.matches[0] && (
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                      Best: {analysis.matches[0].name}
                    </span>
                  )}
                </div>

                <pre className="mt-3 overflow-auto rounded-lg bg-white p-3 text-xs font-mono text-gray-800 whitespace-pre-wrap break-words">
                  {analysis.normalized}
                </pre>

                {analysis.matches.length > 0 ? (
                  <div className="mt-4 overflow-auto rounded-xl border border-gray-200 bg-white">
                    <table className="w-full min-w-[760px] text-left text-sm">
                      <thead className="bg-gray-50 text-gray-600">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Possible Type</th>
                          <th className="px-4 py-3 font-semibold">Confidence</th>
                          <th className="px-4 py-3 font-semibold">Reason</th>
                          <th className="px-4 py-3 font-semibold">Note</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {analysis.matches.map((match) => (
                          <tr key={`${analysis.normalized}-${match.name}`}>
                            <td className="px-4 py-3 font-semibold text-gray-900">
                              {match.name}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                match.confidence === "high"
                                  ? "bg-green-50 text-green-700"
                                  : match.confidence === "medium"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}>
                                {match.confidence}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-700">
                              {match.reason}
                            </td>
                            <td className="px-4 py-3 text-gray-700">
                              {match.securityNote}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-amber-700">
                    No common hash format matched this value.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Hash identification notes
          </h3>

          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-amber-900">
                  {note.title}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-amber-800">
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
          {output || "Hash identification output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Hash identification happens directly in your browser. Your pasted values
        are not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Identifying Possible Hash Algorithms
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Hash strings often appear in logs, database dumps, API responses,
            password migration work, security reports, and old application code.
            The visible shape of a hash can suggest likely algorithms, but it
            usually cannot prove the exact algorithm by itself.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Hash Algorithm Identifier checks length, character set, common
            prefixes, and known formats to suggest possible hash types such as
            MD5, SHA-1, SHA-256, SHA-512, bcrypt, Argon2, scrypt, PBKDF2-style
            strings, Base64-like values, and UUID-like identifiers.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Checking a Hash Type
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste one hash or multiple hashes on separate lines.</li>
            <li>Choose single or multi-line input mode.</li>
            <li>Turn low-confidence matches on or off.</li>
            <li>Run the identifier and review possible algorithms.</li>
            <li>Use the result as a clue, not as final proof.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Hash Identifier Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Recognizing whether a value looks like MD5, SHA-1, or SHA-256.</li>
            <li>Checking if a stored password hash looks like bcrypt or Argon2.</li>
            <li>Reviewing old application hashes during migration work.</li>
            <li>Separating random tokens, UUIDs, and hash-like values.</li>
            <li>Finding weak legacy hash formats in exported data.</li>
            <li>Documenting possible algorithms during security cleanup.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Hash Shapes
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`MD5:    5d41402abc4b2a76b9719d911017c592
SHA-1:  2aae6c35c94fcfb415dbe95f408b9ce91ee846ed
SHA256: a948904f2f0f479b8f8197694b30184b0d2ed1c1cd2a1ec0fb85d299a192a447
bcrypt: $2y$10$...`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Hash Identification Has Limits
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Many algorithms produce outputs with the same length and character
            set. For example, a 32-character hex string may be MD5, NTLM, or
            something else entirely. Without metadata, configuration, or a known
            input, the exact algorithm may remain uncertain.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Use this tool to narrow down possibilities. For security decisions,
            confirm the algorithm from the source system, code, database schema,
            or hashing configuration.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                Can this prove the exact hash algorithm?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. It identifies likely algorithms based on format. Some hash
                algorithms share the same visible shape.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why can MD5 and NTLM look similar?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Both are commonly represented as 32 hexadecimal characters, so a
                value can match both shapes.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this identify bcrypt and Argon2?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. bcrypt and Argon2 have recognizable formatted prefixes and
                parameter sections.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this crack or reverse hashes?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. This tool only identifies possible hash formats. It does not
                crack, reverse, or look up hashes.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are my hash values uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Identification happens directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/hash-generator" className="yoryantra-btn-outline">
              Hash Generator
            </Link>

            <Link href="/tools/sha256-generator" className="yoryantra-btn-outline">
              SHA256 Generator
            </Link>

            <Link href="/tools/hmac-generator" className="yoryantra-btn-outline">
              HMAC Generator
            </Link>

            <Link href="/tools/bcrypt-generator" className="yoryantra-btn-outline">
              bcrypt Generator
            </Link>

            <Link href="/tools/random-token-generator" className="yoryantra-btn-outline">
              Random Token Generator
            </Link>
          </div>
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

function identifyHashAlgorithms(
  input: string,
  options: {
    inputMode: InputMode;
    outputMode: OutputMode;
    trimInput: boolean;
    caseInsensitiveHex: boolean;
    includeWeakHashWarnings: boolean;
    showLowConfidence: boolean;
  }
): IdentifierResult {
  const values =
    options.inputMode === "single"
      ? [input]
      : input.split(/\r?\n/);

  const analyses = values
    .map((value) => (options.trimInput ? value.trim() : value))
    .filter(Boolean)
    .map((value) => analyzeHash(value, options));

  if (analyses.length === 0) {
    throw new Error("No hash-like values were found.");
  }

  const matchedInputs = analyses.filter((analysis) => analysis.matches.length > 0).length;
  const warningCount = analyses.reduce((count, analysis) => count + analysis.warnings.length, 0);
  const output = formatOutput(analyses, options.outputMode);

  return {
    analyses,
    output,
    totalInputs: analyses.length,
    matchedInputs,
    warningCount,
  };
}

function analyzeHash(
  value: string,
  options: {
    includeWeakHashWarnings: boolean;
    showLowConfidence: boolean;
  }
): HashAnalysis {
  const normalized = value.trim();
  const matches = knownPatterns
    .filter((pattern) => pattern.test(normalized))
    .map<HashMatch>((pattern) => ({
      name: pattern.name,
      family: pattern.family,
      confidence: pattern.confidence,
      reason: pattern.reason,
      example: pattern.example,
      securityNote: pattern.securityNote,
    }))
    .filter((match) => options.showLowConfidence || match.confidence !== "low")
    .sort((a, b) => confidenceRank(b.confidence) - confidenceRank(a.confidence));
  const warnings = getWarnings(normalized, matches, options.includeWeakHashWarnings);

  return {
    input: value,
    normalized,
    length: normalized.length,
    characterSet: detectCharacterSet(normalized),
    format: detectFormat(normalized),
    entropyHint: getEntropyHint(normalized),
    matches,
    warnings,
  };
}

function confidenceRank(confidence: Confidence) {
  if (confidence === "high") {
    return 3;
  }

  if (confidence === "medium") {
    return 2;
  }

  return 1;
}

function detectCharacterSet(value: string) {
  if (/^[a-f0-9]+$/i.test(value)) {
    return "hexadecimal";
  }

  if (/^[A-Za-z0-9+/]+={0,2}$/.test(value)) {
    return "base64-like";
  }

  if (/^[A-Za-z0-9_-]+$/.test(value)) {
    return "base64url/token-like";
  }

  if (/^\$/.test(value)) {
    return "modular crypt format";
  }

  return "mixed";
}

function detectFormat(value: string) {
  if (/^\$2[aby]\$/.test(value)) {
    return "bcrypt formatted";
  }

  if (/^\$argon2/.test(value)) {
    return "Argon2 formatted";
  }

  if (/^[a-f0-9]+$/i.test(value)) {
    return "plain hex";
  }

  if (/^[A-Za-z0-9+/]+={0,2}$/.test(value)) {
    return "Base64-like";
  }

  if (/^[A-Za-z0-9_-]+$/.test(value)) {
    return "Base64URL or token-like";
  }

  return "unknown or custom";
}

function getEntropyHint(value: string) {
  if (value.length < 16) {
    return "short value";
  }

  if (/^(.)\1+$/.test(value)) {
    return "repeated characters";
  }

  if (/^[a-f0-9]+$/i.test(value) && value.length >= 64) {
    return "long hex digest shape";
  }

  if (value.length >= 60) {
    return "long formatted value";
  }

  return "normal-looking length";
}

function getWarnings(
  value: string,
  matches: HashMatch[],
  includeWeakHashWarnings: boolean
) {
  const warnings: string[] = [];

  if (matches.length === 0) {
    warnings.push("No common hash format matched this value.");
  }

  if (matches.length > 1) {
    warnings.push("More than one format matched. Hash identification is not always exact.");
  }

  if (includeWeakHashWarnings && matches.some((match) => ["MD5", "SHA-1", "NTLM"].includes(match.name))) {
    warnings.push("This value may be a weak legacy hash type.");
  }

  if (value.length < 16) {
    warnings.push("This value is short and may not be a cryptographic hash.");
  }

  if (/\s/.test(value)) {
    warnings.push("Whitespace was found inside the value.");
  }

  return warnings;
}

function formatOutput(analyses: HashAnalysis[], outputMode: OutputMode) {
  if (outputMode === "json") {
    return JSON.stringify(analyses, null, 2);
  }

  if (outputMode === "matches") {
    return analyses
      .map((analysis, index) => {
        const matches = analysis.matches.length
          ? analysis.matches.map((match) => `${match.name} (${match.confidence})`).join(", ")
          : "(no match)";

        return `Input ${index + 1}: ${matches}`;
      })
      .join("\n");
  }

  if (outputMode === "detailed") {
    return analyses
      .map((analysis, index) => {
        const matches = analysis.matches.length
          ? analysis.matches.map((match) => `- ${match.name} [${match.confidence}]: ${match.reason}\n  ${match.securityNote}`).join("\n")
          : "- No common format matched.";
        const warnings = analysis.warnings.length
          ? analysis.warnings.map((warning) => `- ${warning}`).join("\n")
          : "- None";

        return [
          `Input ${index + 1}`,
          "-------",
          `Value: ${analysis.normalized}`,
          `Length: ${analysis.length}`,
          `Character set: ${analysis.characterSet}`,
          `Format: ${analysis.format}`,
          `Entropy hint: ${analysis.entropyHint}`,
          "",
          "Possible matches:",
          matches,
          "",
          "Warnings:",
          warnings,
        ].join("\n");
      })
      .join("\n\n");
  }

  return [
    "Hash Algorithm Identification Summary",
    "-------------------------------------",
    ...analyses.map((analysis, index) => {
      const best = analysis.matches[0];

      return [
        `Input ${index + 1}:`,
        `  Length: ${analysis.length}`,
        `  Character set: ${analysis.characterSet}`,
        `  Best match: ${best ? `${best.name} (${best.confidence})` : "(no match)"}`,
        `  Warnings: ${analysis.warnings.length}`,
      ].join("\n");
    }),
  ].join("\n");
}

function getHashNotes(result: IdentifierResult): HashNote[] {
  const notes: HashNote[] = [];

  if (result.analyses.some((analysis) => analysis.matches.length === 0)) {
    notes.push({
      title: "Some values did not match",
      message:
        "One or more inputs did not match common hash formats. They may be custom tokens, truncated hashes, encoded data, or non-hash values.",
    });
  }

  if (result.analyses.some((analysis) => analysis.matches.length > 1)) {
    notes.push({
      title: "Overlapping formats",
      message:
        "Some values match more than one format. Length and character set alone cannot always prove the exact algorithm.",
    });
  }

  if (result.analyses.some((analysis) => analysis.matches.some((match) => ["MD5", "SHA-1", "NTLM"].includes(match.name)))) {
    notes.push({
      title: "Possible weak legacy hash",
      message:
        "MD5, SHA-1, and NTLM are weak for modern security-sensitive use. Review old systems carefully before reusing them.",
    });
  }

  return notes;
}
