"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type UrlMode = "component" | "full" | "form";
type Operation = "encode" | "decode";

type Result = {
  output: string;
  operation: Operation;
  inputEscapes: number;
  outputEscapes: number;
  inputCharacters: number;
  outputCharacters: number;
};

const modeDetails: Record<
  UrlMode,
  { label: string; note: string; example: string }
> = {
  component: {
    label: "URL component / parameter value",
    note:
      "Encodes data for one URI component. Reserved delimiters such as /, ?, &, =, and # are encoded because they are treated as data here.",
    example: "hello world & tea/cake",
  },
  full: {
    label: "Full URI text",
    note:
      "Preserves URI structure such as scheme separators, path slashes, query delimiters, and fragments. This mode transforms text; it does not validate whether the URL points to a real or safe destination.",
    example: "https://example.com/search?q=hello world&lang=हिन्दी#results",
  },
  form: {
    label: "Form/query value (+ for space)",
    note:
      "Uses application/x-www-form-urlencoded behavior for one value. Spaces serialize as + and a literal plus sign is percent-encoded.",
    example: "hello world + tea",
  },
};

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<UrlMode>("component");
  const [preserveExistingEscapes, setPreserveExistingEscapes] = useState(true);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const stats = useMemo(
    () => ({
      inputEscapes: countPercentEscapes(input),
      malformedPercentAt: findMalformedPercent(input),
      characters: Array.from(input).length,
    }),
    [input]
  );

  const clearResult = () => {
    setResult(null);
    setError("");
    setCopied(false);
  };

  const runEncode = () => {
    if (input === "") {
      setError("Enter a URI, component, or form value to encode.");
      setResult(null);
      setCopied(false);
      return;
    }

    const loneSurrogate = findFirstLoneSurrogate(input);
    if (loneSurrogate >= 0) {
      setError(
        `Unable to encode this input because it contains an unpaired UTF-16 surrogate at code-unit position ${(
          loneSurrogate + 1
        ).toLocaleString()}. Copy the original Unicode text again or remove the malformed code unit.`
      );
      setResult(null);
      setCopied(false);
      return;
    }

    try {
      const output = encodeValue(input, mode, preserveExistingEscapes);

      setResult({
        output,
        operation: "encode",
        inputEscapes: countPercentEscapes(input),
        outputEscapes: countPercentEscapes(output),
        inputCharacters: Array.from(input).length,
        outputCharacters: Array.from(output).length,
      });
      setError("");
      setCopied(false);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? `Unable to encode this input. ${caught.message}`
          : "Unable to encode this input."
      );
      setResult(null);
      setCopied(false);
    }
  };

  const runDecode = () => {
    if (input === "") {
      setError("Enter percent-encoded text to decode.");
      setResult(null);
      setCopied(false);
      return;
    }

    const malformedAt = findMalformedPercent(input);

    if (malformedAt >= 0) {
      setError(
        `Unable to decode this input. Malformed percent escape at character ${(
          malformedAt + 1
        ).toLocaleString()}: every % must be followed by two hexadecimal digits.`
      );
      setResult(null);
      setCopied(false);
      return;
    }

    try {
      const output = decodeValue(input, mode);

      setResult({
        output,
        operation: "decode",
        inputEscapes: countPercentEscapes(input),
        outputEscapes: countPercentEscapes(output),
        inputCharacters: Array.from(input).length,
        outputCharacters: Array.from(output).length,
      });
      setError("");
      setCopied(false);
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "The percent-encoded bytes could not be decoded.";

      setError(
        `Unable to decode this input. ${message} This commonly happens when percent escapes do not form valid UTF-8 for the selected URI decoding behavior.`
      );
      setResult(null);
      setCopied(false);
    }
  };

  const copyOutput = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setError("");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setError("The output could not be copied. Select and copy it manually.");
    }
  };

  const loadExample = () => {
    setInput(modeDetails[mode].example);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setMode("component");
    setPreserveExistingEscapes(true);
    clearResult();
  };

  return (
    <ToolShell
      title="URL Encoder Decoder"
      description="Encode and decode URI components, full URI text, or application/x-www-form-urlencoded values without treating every URL context as the same percent-encoding problem."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <YoryantraSelect
          label="Encoding context"
          value={mode}
          onChange={(value) => {
            setMode(value as UrlMode);
            clearResult();
          }}
          options={[
            {
              label: modeDetails.component.label,
              value: "component",
            },
            {
              label: modeDetails.full.label,
              value: "full",
            },
            {
              label: modeDetails.form.label,
              value: "form",
            },
          ]}
        />

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          {modeDetails[mode].note}
        </p>

        {mode === "full" ? (
          <label className="mt-4 flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
            <input
              type="checkbox"
              checked={preserveExistingEscapes}
              onChange={(event) => {
                setPreserveExistingEscapes(event.target.checked);
                clearResult();
              }}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#d9a928]"
            />
            <span>
              Preserve existing valid <code>%HH</code> triplets when encoding.
              Disable this when a literal percent sequence such as{" "}
              <code>%20</code> is raw data that should become{" "}
              <code>%2520</code>.
            </span>
          </label>
        ) : null}

        <div className="mt-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <label className="block text-sm font-semibold text-gray-900">
              Input
            </label>
            <p className="text-xs text-gray-500">
              {stats.characters.toLocaleString()} characters ·{" "}
              {stats.inputEscapes.toLocaleString()} valid %HH triplets
            </p>
          </div>

          <textarea
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              clearResult();
            }}
            placeholder={modeDetails[mode].example}
            spellCheck={false}
            className="mt-3 w-full min-h-[300px] rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={runEncode} className="yoryantra-btn">
          Encode
        </button>

        <button
          type="button"
          onClick={runDecode}
          className="yoryantra-btn-outline"
        >
          Decode
        </button>

        <button
          type="button"
          onClick={loadExample}
          className="yoryantra-btn-outline"
        >
          Load Example
        </button>

        <button
          type="button"
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      {input && !error && stats.malformedPercentAt >= 0 ? (
        <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-800">
          The input contains a <code>%</code> that is not followed by two
          hexadecimal digits. Encoding can treat that percent sign as data, but
          decoding rejects it because it is not a complete percent-encoded
          octet.
        </div>
      ) : null}

      {result ? (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Operation"
              value={result.operation === "encode" ? "Encode" : "Decode"}
            />
            <StatCard
              label="Input escapes"
              value={result.inputEscapes.toLocaleString()}
            />
            <StatCard
              label="Output escapes"
              value={result.outputEscapes.toLocaleString()}
            />
            <StatCard
              label="Output chars"
              value={result.outputCharacters.toLocaleString()}
            />
          </div>

          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Output</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">
                  Review the result in the same URI context that will consume
                  it. Encoding changes representation; it does not validate the
                  destination or make an unsafe URL trustworthy.
                </p>
              </div>

              <button
                type="button"
                onClick={copyOutput}
                className="yoryantra-btn-outline text-sm"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <pre className="mt-4 yoryantra-output min-h-[220px] overflow-auto whitespace-pre-wrap break-words text-sm">
              {result.output}
            </pre>
          </div>
        </>
      ) : (
        <div className="mt-8 yoryantra-output min-h-[220px] overflow-auto whitespace-pre-wrap break-words text-sm">
          Encoded or decoded output will appear here.
        </div>
      )}

      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Browser-local conversion
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          Encoding and decoding run in your browser. This tool does not request
          the URL, follow redirects, or send the pasted URI/query value to a
          remote encoding service. Site-wide analytics or advertising scripts,
          if enabled by the website, are separate from this conversion
          operation.
        </p>
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Full URIs and URI Components Need Different Encoding
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Percent-encoding represents an octet as a percent sign followed by
            two hexadecimal digits. The important question is whether a
            character is data or URI syntax. Encoding an entire URI as though
            it were one query value turns structural characters such as{" "}
            <code>:</code>, <code>/</code>, <code>?</code>,{" "}
            <code>&amp;</code>, <code>=</code>, and <code>#</code> into data
            and can destroy the intended structure.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Component mode applies RFC 3986-style component encoding and also
            percent-encodes characters such as <code>!</code>,{" "}
            <code>&apos;</code>, <code>(</code>, <code>)</code>, and{" "}
            <code>*</code> that JavaScript&apos;s{" "}
            <code>encodeURIComponent()</code> otherwise leaves unescaped. Use
            it when one value must not be interpreted as a delimiter.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            In full-URI mode, square brackets are preserved only when they
            delimit an IPv6 host literal in the authority section. Literal
            brackets elsewhere are percent-encoded. Unicode domain names are
            not converted to IDNA/Punycode by this encoder; percent-encoding a
            hostname is not a substitute for domain-name processing.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Existing %HH Sequences Are Ambiguous During Encoding
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A pasted full URI may already contain <code>%20</code> for a space.
            Preserving that triplet avoids turning it into{" "}
            <code>%2520</code>. But the literal three characters{" "}
            <code>%20</code> can also be raw data. The full-URI checkbox makes
            this choice explicit instead of silently assuming every percent
            sequence is already encoded.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            %20 and + Are Not Interchangeable Everywhere
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            In ordinary URI percent-encoding, a space becomes{" "}
            <code>%20</code>. The{" "}
            <code>application/x-www-form-urlencoded</code> serializer used by
            HTML forms and <code>URLSearchParams</code> represents space as{" "}
            <code>+</code>. A literal plus sign in form data is percent-encoded
            so decoding can distinguish it from a space.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            That is why form mode converts <code>+</code> to a space before
            percent-decoding, while normal component and full-URI modes leave a
            literal plus sign alone.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reserved Characters Can Be Syntax or Data
          </h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-7 text-gray-700">
            <p>
              RFC 3986 reserves characters including <code>:</code>,{" "}
              <code>/</code>, <code>?</code>, <code>#</code>,{" "}
              <code>[</code>, <code>]</code>, <code>@</code>,{" "}
              <code>!</code>, <code>$</code>, <code>&amp;</code>,{" "}
              <code>&apos;</code>, <code>(</code>, <code>)</code>,{" "}
              <code>*</code>, <code>+</code>, <code>,</code>,{" "}
              <code>;</code>, and <code>=</code>. When one is acting as a
              delimiter, preserve it as syntax. When it is literal data inside
              a component, percent-encode it.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Full-URI Decode Is Intentionally Conservative
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Full-URI mode uses URI-aware decoding rather than decoding every
            reserved escape. This avoids changing an encoded delimiter into
            active URI syntax too early. Component mode decodes percent-encoded
            bytes more aggressively because the whole input is treated as one
            data component.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Percent-Encoding Is Not URL Validation or a Security Check
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Encoding can make data syntactically suitable for a URI component,
            but it does not verify the scheme, hostname, port, origin,
            redirect target, or destination content. A correctly encoded URL
            can still use an unwanted scheme or point to a malicious site.
            Validate URLs separately when your application accepts
            user-controlled destinations.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Unicode Is Encoded as UTF-8 Bytes
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JavaScript URI encoding converts Unicode text to UTF-8 and then
            represents encoded bytes as <code>%HH</code>. Malformed UTF-16
            input such as an unpaired surrogate cannot be converted reliably,
            so this tool detects it before encoding instead of allowing a Web
            API to replace or reject the value without a useful explanation.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Official References
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed">
            <p>
              <a
                href="https://www.rfc-editor.org/rfc/rfc3986"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--green)] underline underline-offset-4"
              >
                RFC 3986 — Uniform Resource Identifier (URI): Generic Syntax
              </a>
            </p>
            <p>
              <a
                href="https://url.spec.whatwg.org/"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--green)] underline underline-offset-4"
              >
                WHATWG URL Standard — percent encoding and
                application/x-www-form-urlencoded
              </a>
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/url-encoder-decoder" />
        </div>
      </section>
    </ToolShell>
  );
}

function encodeRfc3986Component(value: string) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (character) => {
    return `%${character.charCodeAt(0).toString(16).toUpperCase()}`;
  });
}

function encodeFullUri(value: string, preserveExistingEscapes: boolean) {
  if (!preserveExistingEscapes) {
    return encodeFullUriRaw(value);
  }

  const preserved: string[] = [];
  let tokenBase = "__YORYANTRA_PERCENT_ESCAPE__";

  while (value.includes(tokenBase)) {
    tokenBase += "_";
  }

  const masked = value.replace(/%[0-9a-fA-F]{2}/g, (match) => {
    const token = `${tokenBase}${preserved.length}__`;
    preserved.push(match.toUpperCase());
    return token;
  });

  let encoded = encodeFullUriRaw(masked);

  preserved.forEach((escape, index) => {
    const token = `${tokenBase}${index}__`;
    encoded = encoded.split(token).join(escape);
  });

  return encoded;
}

function encodeFullUriRaw(value: string) {
  const authorityMatch = value.match(
    /^((?:[A-Za-z][A-Za-z0-9+.-]*:)?\/\/)([^/?#]*)([\s\S]*)$/
  );

  if (!authorityMatch) {
    return encodeURI(value);
  }

  const prefix = authorityMatch[1];
  const authority = authorityMatch[2];
  const remainder = authorityMatch[3];

  return `${encodeURI(prefix)}${encodeAuthority(authority)}${encodeURI(
    remainder
  )}`;
}

function encodeAuthority(authority: string) {
  const userInfoEnd = authority.lastIndexOf("@");
  const hostStart = userInfoEnd + 1;

  if (authority[hostStart] !== "[") {
    return encodeURI(authority);
  }

  const closingBracket = authority.indexOf("]", hostStart + 1);

  if (closingBracket === -1) {
    return encodeURI(authority);
  }

  const beforeHost = authority.slice(0, hostStart);
  const hostLiteral = authority.slice(hostStart + 1, closingBracket);
  const afterHost = authority.slice(closingBracket + 1);

  return `${encodeURI(beforeHost)}[${encodeURI(hostLiteral)}]${encodeURI(
    afterHost
  )}`;
}

function encodeFormValue(value: string) {
  const params = new URLSearchParams();
  params.set("value", value);
  return params.toString().slice("value=".length);
}

function encodeValue(
  value: string,
  mode: UrlMode,
  preserveExistingEscapes: boolean
) {
  if (mode === "component") return encodeRfc3986Component(value);
  if (mode === "full") return encodeFullUri(value, preserveExistingEscapes);
  return encodeFormValue(value);
}

function decodeValue(value: string, mode: UrlMode) {
  if (mode === "component") return decodeURIComponent(value);
  if (mode === "full") return decodeURI(value);
  return decodeURIComponent(value.replace(/\+/g, " "));
}

function findMalformedPercent(value: string) {
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] !== "%") continue;

    const pair = value.slice(index + 1, index + 3);

    if (!/^[0-9a-fA-F]{2}$/.test(pair)) {
      return index;
    }

    index += 2;
  }

  return -1;
}

function countPercentEscapes(value: string) {
  return (value.match(/%[0-9a-fA-F]{2}/g) || []).length;
}

function findFirstLoneSurrogate(value: string) {
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index);

    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      const next =
        index + 1 < value.length ? value.charCodeAt(index + 1) : -1;

      if (next >= 0xdc00 && next <= 0xdfff) {
        index += 1;
      } else {
        return index;
      }

      continue;
    }

    if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
      return index;
    }
  }

  return -1;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}
