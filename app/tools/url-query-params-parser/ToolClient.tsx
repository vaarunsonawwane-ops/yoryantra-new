"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type InputMode = "auto" | "url" | "query";

type DecodedComponent = {
  value: string;
  issue: string | null;
};

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

function decodeFormComponentAccurately(raw: string): DecodedComponent {
  const probe = new URLSearchParams(`value=${raw}`);
  const decoded = probe.get("value") || "";
  const plusExpanded = raw.replace(/\+/g, " ");
  const malformedPercent = /%(?![0-9A-Fa-f]{2})/.test(plusExpanded);

  if (malformedPercent) {
    return {
      value: decoded,
      issue:
        "Contains a % that is not followed by two hexadecimal digits. Browser form parsing preserves malformed percent text instead of treating it as a complete escape.",
    };
  }

  try {
    decodeURIComponent(plusExpanded);

    return {
      value: decoded,
      issue: null,
    };
  } catch {
    return {
      value: decoded,
      issue:
        "Percent-encoded bytes are not valid UTF-8 for decodeURIComponent(). Browser form decoding can insert replacement characters; use the raw value when exact source bytes matter.",
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
        "Leading or trailing whitespace was ignored while parsing the value as a URL."
      );
    }

    try {
      const parsed = new URL(
        trimmed,
        "https://yoryantra.invalid"
      );

      const query = parsed.search
        ? parsed.search.slice(1)
        : "";
      const fragment = parsed.hash
        ? parsed.hash.slice(1)
        : null;

      if (!parsed.search) {
        diagnostics.push("The URL has no query component after ?.");
      }

      return {
        query,
        fragment,
        source:
          mode === "url"
            ? "URL"
            : "URL detected automatically",
        diagnostics,
        fatal: false,
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
      };
    }
  }

  const query =
    input.charAt(0) === "?"
      ? input.slice(1)
      : input;

  if (query.indexOf("#") !== -1) {
    diagnostics.push(
      "Raw-query mode contains #. Here it is treated as query data; in a full URL, # begins the fragment and is not part of the query."
    );
  }

  if (/[\r\n\t]/.test(query)) {
    diagnostics.push(
      "The raw query contains a tab or line break. Such characters should normally be percent-encoded before a query is placed in a URL."
    );
  }

  return {
    query,
    fragment: null,
    source:
      mode === "query"
        ? "raw query string"
        : "raw query string detected automatically",
    diagnostics,
    fatal: false,
  };
}

function parseQuery(
  input: string,
  mode: InputMode
): QueryResult {
  const extracted = extractQuery(input, mode);
  const diagnostics = extracted.diagnostics.slice();
  const entries: QueryEntry[] = [];
  const grouped = createGroupedMap();

  if (extracted.fatal) {
    return {
      source: extracted.source,
      rawQuery: "",
      fragment: null,
      entryCount: 0,
      uniqueNames: 0,
      repeatedNames: 0,
      entries,
      grouped,
      diagnostics,
      note:
        "No query parameters were parsed because URL parsing failed.",
    };
  }

  if (extracted.query === "") {
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
        "No query parameter entries were present.",
    };
  }

  extracted.query.split("&").forEach((part, zeroIndex) => {
    if (part === "") return;

    const equals = part.indexOf("=");
    const hadEquals = equals !== -1;
    const rawName = hadEquals
      ? part.slice(0, equals)
      : part;
    const rawValue = hadEquals
      ? part.slice(equals + 1)
      : "";

    const decodedName =
      decodeFormComponentAccurately(rawName);
    const decodedValue =
      decodeFormComponentAccurately(rawValue);

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

  Object.keys(grouped).forEach((name) => {
    if (grouped[name].values.length > 1) {
      diagnostics.push(
        `Parameter "${name}" appears ${grouped[name].values.length} times. All values are preserved in order instead of overwriting earlier ones.`
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
      "At least one parameter has no = separator. Its decoded value is empty, but the raw form remains distinct from an explicit value such as name=."
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
      "A literal + in the raw query was decoded as a space because URL query parsing commonly uses application/x-www-form-urlencoded rules."
    );
  }

  if (
    entries.some(
      (entry) =>
        entry.nameDecodeIssue ||
        entry.valueDecodeIssue
    )
  ) {
    diagnostics.push(
      "At least one component has a decoding warning. Compare the raw and decoded forms before rewriting the URL."
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
      "The ordered entries preserve repeated parameters, raw encoding, and whether = was present. The grouped view stores arrays so duplicate names, including names such as __proto__, are not silently overwritten.",
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

  const parseQueryParams = () => {
    if (input === "") {
      setError("Enter a full URL or raw query string.");
      setOutput("");
      setCopied(false);
      return;
    }

    const result = parseQuery(input, mode);

    setOutput(JSON.stringify(result, null, 2));
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

  const resetAll = () => {
    setInput("");
    setMode("auto");
    setOutput("");
    setError("");
    setCopied(false);
  };

  const copyOutput = async () => {
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
            {
              label: "Auto-detect URL vs query",
              value: "auto",
            },
            {
              label: "Full or relative URL",
              value: "url",
            },
            {
              label: "Raw query string",
              value: "query",
            },
          ]}
        />

        <div className="mt-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <label className="block text-sm font-semibold text-gray-900">
                URL or Query String
              </label>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">
                A query normally begins after <code>?</code> and ends before{" "}
                <code>#</code> in a full URL.
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
        <button
          type="button"
          onClick={parseQueryParams}
          className="yoryantra-btn"
        >
          Parse Query Params
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

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Parsed Query Data
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Raw values stay visible beside decoded values so you can see
              exactly what changed during query parsing.
            </p>
          </div>

          {output ? (
            <button
              type="button"
              onClick={copyOutput}
              className="yoryantra-btn-outline text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          ) : null}
        </div>

        <pre className="mt-4 yoryantra-output min-h-[280px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output ||
            "Ordered parameters, repeated values, raw encoding, decoded text, and diagnostics will appear here."}
        </pre>
      </div>

      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Query parameters can contain private tokens
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          Password-reset links, OAuth authorization codes, signed download
          links, invitation tokens, and API credentials sometimes appear in
          URLs. This parser works on the pasted text in your browser and does
          not request the URL or send it to a query-parsing API, but copied
          output can still expose those values. Site-wide analytics or
          advertising scripts, if enabled, are separate from this parsing
          operation.
        </p>
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What the Parameters in a URL Mean
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The query is the part of a URL that usually comes after{" "}
            <code>?</code>. Websites use it to pass small pieces of information
            such as a search term, filter, page number, campaign tag, language,
            or sorting choice. In{" "}
            <code>?name=Sneha&amp;city=Pune</code>, <code>name</code> and{" "}
            <code>city</code> are parameter names and their values are{" "}
            <code>Sneha</code> and <code>Pune</code>.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            A fragment beginning with <code>#</code> is different. It normally
            identifies a location or client-side state within the resource and
            is not part of the URL query sent in an ordinary HTTP request.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Reasons You May Want to Inspect Query Parameters
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-gray-600">
            <li>
              Understand a long link before sharing it.
            </li>
            <li>
              See campaign parameters such as <code>utm_source</code> or{" "}
              <code>utm_campaign</code>.
            </li>
            <li>
              Check search filters, sort options, pagination, or language
              values.
            </li>
            <li>
              Debug an API request when one parameter has the wrong value or
              encoding.
            </li>
            <li>
              Compare repeated filters such as{" "}
              <code>tag=books&amp;tag=music</code> without losing either value.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Repeated Query Names Are Real Data
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A query is an ordered list of name-value pairs, not necessarily a
            one-key-one-value object. A URL can legitimately contain{" "}
            <code>?tag=books&amp;tag=music</code>. Which meaning the server
            assigns to repeated values is application-specific, so the parser
            keeps both entries in order and also provides a grouped array view.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why + Can Become a Space
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Web query handling commonly uses{" "}
            <code>application/x-www-form-urlencoded</code> rules. In that
            format, a literal <code>+</code> in the serialized query represents
            a space. A real plus sign is normally encoded as{" "}
            <code>%2B</code>. This is why <code>q=hello+world</code> parses to{" "}
            <code>hello world</code>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Raw and Decoded Values Answer Different Questions
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Decoded text is easier to read, but the raw form tells you how the
            URL was actually serialized. A space might come from{" "}
            <code>+</code> or <code>%20</code>; a plus sign might come from{" "}
            <code>%2B</code>. Keeping both forms is useful when comparing links,
            debugging signatures, tracking double encoding, or determining
            whether a client encoded a value differently from the server's
            expectations.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Missing =, Empty Values, and Empty Names Are Not Identical
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            <code>?flag</code> and <code>?flag=</code> both produce an empty
            decoded value in common browser query APIs, but their raw spelling
            is different. <code>?=value</code> has an empty parameter name.
            These edge cases are preserved because backend frameworks can make
            different application-level decisions about them.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Malformed Percent Encoding Does Not Always Stop Browser Parsing
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Browser URL-form parsing is deliberately tolerant. A malformed{" "}
            <code>%</code> sequence may remain as text, and invalid UTF-8 byte
            sequences can decode with replacement characters rather than
            throwing an exception. The parser follows browser-style decoded
            output while adding warnings and preserving the raw component, so a
            tolerant decode is not mistaken for clean input.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            URL Mode and Raw-Query Mode Are Intentionally Different
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            URL mode lets the browser URL parser identify the real query and
            fragment. Raw-query mode treats the supplied text directly as query
            data. That difference matters when <code>#</code> appears: in a
            full URL it begins the fragment, while in raw-query mode it is just
            another character unless your application applies its own rules.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reference for Browser Query Parsing
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The WHATWG URL Standard is useful here because it defines the
            browser URL parser, <code>URLSearchParams</code>, tuple ordering,
            percent-decoding, and the{" "}
            <code>application/x-www-form-urlencoded</code> rules used by this
            tool.
          </p>
          <p className="mt-4 text-sm">
            <a
              href="https://url.spec.whatwg.org/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              WHATWG URL Standard
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <YoryantraRelatedTools currentHref="/tools/url-query-params-parser" />
        </div>
      </section>
    </ToolShell>
  );
}
