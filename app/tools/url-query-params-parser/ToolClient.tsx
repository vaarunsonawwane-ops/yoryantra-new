"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type InputMode = "auto" | "url" | "query";

type QueryEntry = {
  index: number;
  rawName: string;
  rawValue: string;
  hadEquals: boolean;
  name: string;
  value: string;
  nameDecodeIssue: string | null;
  valueDecodeIssue: string | null;
};

type GroupedValue = {
  values: string[];
  indexes: number[];
  rawNames: string[];
};

type QueryResult = {
  source: string;
  rawQuery: string;
  fragment: string | null;
  entryCount: number;
  uniqueNames: number;
  repeatedNames: number;
  entries: QueryEntry[];
  grouped: Record<string, GroupedValue>;
  diagnostics: string[];
  note: string;
};

function createGroupedMap() {
  return Object.create(null) as Record<string, GroupedValue>;
}

function decodeComponent(raw: string) {
  const decoded = new URLSearchParams(`value=${raw}`).get("value") || "";
  const plusExpanded = raw.replace(/\+/g, " ");

  if (/%(?![0-9A-Fa-f]{2})/.test(plusExpanded)) {
    return {
      value: decoded,
      issue:
        "Contains a % that is not followed by two hexadecimal digits. Browser form parsing preserves malformed percent text rather than treating it as a complete escape.",
    };
  }

  try {
    decodeURIComponent(plusExpanded);
    return { value: decoded, issue: null };
  } catch {
    return {
      value: decoded,
      issue:
        "Percent-encoded bytes are not valid UTF-8 for decodeURIComponent(). Browser form decoding can insert replacement characters, so compare the raw value when exact source data matters.",
    };
  }
}

function looksLikeUrl(value: string) {
  if (/^[A-Za-z][A-Za-z0-9+.-]*:/.test(value)) return true;
  if (/^\/\//.test(value)) return true;
  if (/^\//.test(value)) return true;

  const question = value.indexOf("?");

  if (question > 0) {
    const beforeQuery = value.slice(0, question);

    if (
      beforeQuery.indexOf("=") === -1 &&
      beforeQuery.indexOf("&") === -1
    ) {
      return true;
    }
  }

  return false;
}

function extractQuery(input: string, mode: InputMode) {
  const diagnostics: string[] = [];
  const trimmed = input.trim();
  const useUrl =
    mode === "url" ||
    (mode === "auto" && looksLikeUrl(trimmed));

  if (useUrl) {
    if (trimmed !== input) {
      diagnostics.push(
        "Leading or trailing whitespace was ignored while validating the value as a URL."
      );
    }

    try {
      const parsed = new URL(trimmed, "https://yoryantra.invalid");
      const hashIndex = trimmed.indexOf("#");
      const queryIndex = trimmed.indexOf("?");
      const hasQueryDelimiter =
        queryIndex !== -1 &&
        (hashIndex === -1 || queryIndex < hashIndex);
      const queryEnd = hashIndex === -1 ? trimmed.length : hashIndex;
      const rawQuery = hasQueryDelimiter
        ? trimmed.slice(queryIndex + 1, queryEnd)
        : "";
      const rawFragment = hashIndex === -1 ? null : trimmed.slice(hashIndex + 1);

      if (!hasQueryDelimiter) {
        diagnostics.push("The URL has no query delimiter before its fragment.");
      } else if (rawQuery === "") {
        diagnostics.push("The URL contains ? but its query component is empty.");
      }

      if (/[\r\n\t]/.test(rawQuery)) {
        diagnostics.push(
          "The original URL query contains a tab or line break. URL parsing can remove or normalize ASCII whitespace, so the raw spelling is preserved separately."
        );
      }

      return {
        query: rawQuery,
        fragment: rawFragment,
        source: mode === "url" ? "URL" : "URL detected automatically",
        diagnostics,
        fatal: false,
        serializedQuery: parsed.search ? parsed.search.slice(1) : "",
      };
    } catch {
      return {
        query: "",
        fragment: null,
        source: "invalid URL",
        diagnostics: [
          ...diagnostics,
          "The input could not be parsed as a URL. It was not silently reinterpreted as a raw query string.",
        ],
        fatal: true,
        serializedQuery: "",
      };
    }
  }

  const query = input.charAt(0) === "?" ? input.slice(1) : input;

  if (query.indexOf("#") !== -1) {
    diagnostics.push(
      "Raw-query mode contains #. Here it is treated as query data; in a full URL, # begins the fragment."
    );
  }

  if (/[\r\n\t]/.test(query)) {
    diagnostics.push(
      "The raw query contains a tab or line break. Those characters should normally be percent-encoded before use in a URL."
    );
  }

  return {
    query,
    fragment: null,
    source: mode === "query" ? "raw query string" : "raw query string detected automatically",
    diagnostics,
    fatal: false,
    serializedQuery: query,
  };
}

function parseQuery(input: string, mode: InputMode): QueryResult {
  const extracted = extractQuery(input, mode);
  const diagnostics = extracted.diagnostics.slice();
  const entries: QueryEntry[] = [];
  const grouped = createGroupedMap();

  if (extracted.fatal || extracted.query === "") {
    return {
      source: extracted.source,
      rawQuery: extracted.query,
      fragment: extracted.fragment,
      entryCount: 0,
      uniqueNames: 0,
      repeatedNames: 0,
      entries,
      grouped,
      diagnostics,
      note:
        extracted.fatal
          ? "No parameters were parsed because URL parsing failed."
          : "No query parameter entries were present.",
    };
  }

  const rawParts = extracted.query.split("&");
  const emptySequences = rawParts.filter((part) => part === "").length;

  rawParts.forEach((part, zeroIndex) => {
    if (part === "") return;

    const equals = part.indexOf("=");
    const hadEquals = equals !== -1;
    const rawName = hadEquals ? part.slice(0, equals) : part;
    const rawValue = hadEquals ? part.slice(equals + 1) : "";

    const decodedName = decodeComponent(rawName);
    const decodedValue = decodeComponent(rawValue);

    const entry: QueryEntry = {
      index: zeroIndex + 1,
      rawName,
      rawValue,
      hadEquals,
      name: decodedName.value,
      value: decodedValue.value,
      nameDecodeIssue: decodedName.issue,
      valueDecodeIssue: decodedValue.issue,
    };

    entries.push(entry);

    if (!grouped[entry.name]) {
      grouped[entry.name] = {
        values: [],
        indexes: [],
        rawNames: [],
      };
    }

    grouped[entry.name].values.push(entry.value);
    grouped[entry.name].indexes.push(entry.index);
    grouped[entry.name].rawNames.push(entry.rawName);
  });

  if (emptySequences) {
    diagnostics.push(
      `${emptySequences} empty query sequence${
        emptySequences === 1 ? " was" : "s were"
      } ignored between or after & separators, matching browser form-style parsing.`
    );
  }

  if (
    extracted.source.indexOf("URL") !== -1 &&
    extracted.serializedQuery !== extracted.query
  ) {
    diagnostics.push(
      "The browser URL parser would serialize the query differently from the original spelling. Raw query text is kept as the source view so normalization does not erase evidence."
    );
  }

  Object.keys(grouped).forEach((name) => {
    if (grouped[name].values.length > 1) {
      diagnostics.push(
        `Parameter "${name}" appears ${grouped[name].values.length} times. All values are preserved in order.`
      );
    }
  });

  if (entries.some((entry) => entry.rawName === "")) {
    diagnostics.push(
      "At least one parameter has an empty name. It is preserved rather than discarded."
    );
  }

  if (entries.some((entry) => !entry.hadEquals)) {
    diagnostics.push(
      "At least one parameter has no = separator. Its decoded value is empty, but the raw spelling remains distinct from name=."
    );
  }

  if (
    entries.some(
      (entry) =>
        entry.rawName.indexOf("+") !== -1 ||
        entry.rawValue.indexOf("+") !== -1
    )
  ) {
    diagnostics.push(
      "A literal + in the raw query was decoded as a space because browser query parsing commonly uses application/x-www-form-urlencoded rules."
    );
  }

  if (
    entries.some(
      (entry) =>
        entry.nameDecodeIssue || entry.valueDecodeIssue
    )
  ) {
    diagnostics.push(
      "At least one component has a decoding warning. Compare raw and decoded forms before rewriting the URL."
    );
  }

  const uniqueNames = Object.keys(grouped).length;
  const repeatedNames = Object.keys(grouped).filter(
    (name) => grouped[name].values.length > 1
  ).length;

  return {
    source: extracted.source,
    rawQuery: extracted.query,
    fragment: extracted.fragment,
    entryCount: entries.length,
    uniqueNames,
    repeatedNames,
    entries,
    grouped,
    diagnostics,
    note:
      "The ordered entries preserve repeated parameters, raw encoding, and whether = was present. The grouped view stores arrays so duplicate names are not silently overwritten.",
  };
}

export default function ToolClient() {
  const [mode, setMode] = useState<InputMode>("auto");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const inputLength = useMemo(
    () => Array.from(input).length,
    [input]
  );

  const run = () => {
    if (input === "") {
      setError("Enter a full URL or raw query string.");
      setOutput("");
      return;
    }

    setOutput(JSON.stringify(parseQuery(input, mode), null, 2));
    setError("");
    setCopied(false);
  };

  const loadExample = () => {
    setInput(
      "https://example.com/search?name=Sneha&tag=books&tag=music&q=hello+world&empty=#results"
    );
    setMode("auto");
    setOutput("");
    setError("");
    setCopied(false);
  };

  const reset = () => {
    setInput("");
    setMode("auto");
    setOutput("");
    setError("");
    setCopied(false);
  };

  const copy = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setError(
        "The parsed output could not be copied. Select and copy it manually."
      );
    }
  };

  return (
    <ToolShell
      title="URL Query Params Parser"
      description="Paste a full URL or the text after ? to see each query parameter, its decoded value, repeated keys, blank values, fragment, and original percent-encoded form."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <YoryantraSelect
          label="Input type"
          value={mode}
          onChange={(value) => {
            setMode(value as InputMode);
            setOutput("");
            setError("");
            setCopied(false);
          }}
          options={[
            { label: "Auto-detect URL vs query", value: "auto" },
            { label: "Full or relative URL", value: "url" },
            { label: "Raw query string", value: "query" },
          ]}
        />

        <div className="mt-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <label className="block text-sm font-semibold text-gray-900">
                URL or Query String
              </label>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">
                In a full URL, the query normally begins after <code>?</code> and ends before <code>#</code>.
              </p>
            </div>
            <p className="text-xs text-gray-500">
              {inputLength.toLocaleString()} characters
            </p>
          </div>

          <textarea
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            placeholder="https://example.com/search?name=Sneha&tag=books&tag=music&q=hello+world#results"
            spellCheck={false}
            className="mt-4 w-full min-h-[280px] rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={run} className="yoryantra-btn">
          Parse Query Params
        </button>
        <button type="button" onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>
        <button type="button" onClick={reset} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Parsed Query Data
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Raw values stay visible beside decoded values so you can see exactly what changed during parsing.
            </p>
          </div>
          {output ? (
            <button type="button" onClick={copy} className="yoryantra-btn-outline text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          ) : null}
        </div>

        <pre className="mt-4 yoryantra-output min-h-[280px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output ||
            "Ordered parameters, repeated values, raw encoding, decoded text, and diagnostics will appear here."}
        </pre>
      </div>

      <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <h3 className="text-sm font-semibold text-gray-900">
          Long links can contain private tokens
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">
          Password-reset links, OAuth authorization codes, signed download links, invitation tokens, and API credentials sometimes appear in URLs. Parsing stays in your browser; the destination is not requested and no query-parsing API receives the pasted text. Copied output can still expose those values. Site-wide analytics or advertising scripts, if enabled, are separate from this parsing operation.
        </p>
      </div>

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Understanding Everything After ? in a Long URL
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Long URLs often look harder than they really are. The query portion is usually a list of small name-value pairs. A shopping site may use them for filters, a search page for the search term, an analytics link for campaign tags, or an API for pagination and options.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Reading the pieces separately is often enough to explain a long link: which names repeat, which characters were encoded, which values are blank, and which fragment after <code>#</code> sits outside the query.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Break This URL Into Pieces
          </h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-white p-4 text-sm leading-7 text-gray-800">{`https://example.com/search?name=Sneha&tag=books&tag=music&q=hello+world#results`}</pre>
          <div className="mt-4 space-y-3 leading-relaxed text-gray-600">
            <p><code>name=Sneha</code> is one parameter.</p>
            <p><code>tag=books</code> and <code>tag=music</code> repeat the same parameter name with two values.</p>
            <p><code>q=hello+world</code> decodes to <code>hello world</code> under normal form-style query parsing.</p>
            <p><code>#results</code> is the fragment. In an ordinary browser navigation it is not part of the HTTP query sent to the server.</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Functional Parameters and Tracking Parameters Serve Different Purposes
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Some parameters change the page itself: <code>page=2</code>, <code>sort=price</code>, <code>lang=en</code>, or <code>category=books</code>. Removing one can change the content you see.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Others are commonly used for attribution or analytics, such as <code>utm_source</code>, <code>utm_medium</code>, and <code>utm_campaign</code>. Those often do not control the main content, but there is no universal rule that says an unfamiliar parameter is safe to delete. A site can use any parameter name for experiments, signed state, referrals, access control, or application logic.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Repeated Parameters Are Real Data
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A query is an ordered sequence of pairs, not necessarily a one-key-one-value object. <code>?tag=books&amp;tag=music</code> can intentionally represent two selected tags. Different frameworks expose repeated values differently: some return arrays, some return the first value, some the last, and some require a dedicated “get all” method.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Keeping every occurrence in order avoids silently collapsing a repeated parameter. A grouped array view can then sit beside the ordered source without choosing a first-value or last-value policy on behalf of the receiving application.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            +, %20, and %2B Are Easy to Confuse
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Browser query APIs commonly use <code>application/x-www-form-urlencoded</code> rules. In that form, <code>+</code> represents a space. A real plus sign is normally serialized as <code>%2B</code>, while a space can also appear as <code>%20</code>. This is the same tuple parsing model defined for <code>URLSearchParams</code> by the WHATWG URL Standard.
          </p>
          <div className="mt-4 overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-4 font-mono text-sm leading-7 text-gray-800">
            <div>q=hello+world → hello world</div>
            <div>q=hello%20world → hello world</div>
            <div>q=2%2B2 → 2+2</div>
          </div>
          <p className="mt-4 leading-relaxed text-gray-600">
            The decoded results may look similar even though their raw source differed. Preserving both views is useful when a client and server disagree about encoding. Browser serialization can also change spelling: mutating <code>URLSearchParams</code> may turn a space into <code>+</code> or re-encode characters even when the decoded value stays the same.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Raw Values Matter for Signatures and Double Encoding
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            If you only want to read a link, decoded text is usually enough. Developers sometimes need the raw representation instead. Signed URLs, OAuth callbacks, webhook validation, cache keys, analytics pipelines, and APIs can depend on exactly how a value was serialized.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            For example, <code>%2520</code> can indicate double encoding: one decoding step produces <code>%20</code>, and a second produces a space. Seeing the raw source next to the decoded result helps identify which layer added the extra encoding.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            flag and flag= Are Not Textually Identical
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Common browser query APIs expose both <code>?flag</code> and <code>?flag=</code> as an empty decoded value, but the original spelling is different. <code>?=value</code> has an empty name. Backend frameworks can normalize these edge cases differently, so the output keeps track of whether the equals sign was actually present.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            The Fragment After # Is Kept Separate
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            In a full URL, the fragment begins at <code>#</code>. Browsers commonly use it for in-page navigation or client-side state, and it is not sent as part of the HTTP request target. In raw-query mode there is no surrounding URL context to prove that <code>#</code> starts a fragment, so it stays in the query data and the ambiguity is reported.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Be Careful With Reset, OAuth, Invitation, and Signed Links
          </h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            Query parameters can contain secrets. Password-reset tokens, authorization codes, pre-signed download credentials, invitation codes, payment state, and API tokens are often placed in URLs. Understanding the parameters does not make them safe to publish. Avoid exposing live sensitive links in screenshots, tickets, forums, or public logs.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Malformed Percent Encoding Can Still Produce a Browser Value
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Browser URL parsing is intentionally tolerant. An incomplete percent escape may remain as literal text, while invalid UTF-8 byte sequences can decode with replacement characters. That helps browsers handle imperfect URLs, but it can hide data-quality problems in APIs and signature workflows.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Browser-style decoding can still produce text from imperfect input, so the raw component stays beside the decoded value and warnings remain visible. A decoded result therefore means a browser-compatible parser produced something, not that the source encoding was clean or canonical. The exact parsing and serialization model comes from the{" "}
            <a href="https://url.spec.whatwg.org/" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">
              WHATWG URL Standard
            </a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Ambiguous Text Needs an Explicit Input Type
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Auto mode tries to distinguish a URL from a bare query string. Most inputs are obvious, but some custom schemes, relative paths, or unusual raw queries can be ambiguous. If you know what the source is, selecting Full or relative URL or Raw query string removes that guess.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Parsing Cannot Tell You Which Parameters Are Safe to Remove
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Parameter names, values, order, duplicates, fragments, raw encoding, and decoding warnings can be read from the URL itself. The URL alone cannot prove that a parameter is safe to remove, that a tracking-looking parameter has no server-side effect, that a signed URL is still valid, or which repeated value a particular backend framework will choose. Those answers belong to the receiving application.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Follow the URL Into the Next Debugging Step
          </h2>

          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/url-query-params-parser" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
