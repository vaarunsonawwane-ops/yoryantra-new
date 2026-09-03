"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type RegistryState = "registered" | "temporary" | "unused" | "obsoleted";

type StatusEntry = {
  code: number;
  name: string;
  summary: string;
  reference: string;
  state?: RegistryState;
  note?: string;
};

const STATUS_CODES: StatusEntry[] = [
  { code: 100, name: "Continue", summary: "The server received the initial part of the request and the client can continue sending the request content.", reference: "RFC 9110 §15.2.1" },
  { code: 101, name: "Switching Protocols", summary: "The server agrees to switch protocols using the HTTP Upgrade mechanism.", reference: "RFC 9110 §15.2.2" },
  { code: 102, name: "Processing", summary: "A WebDAV server received the complete request but has not finished processing it.", reference: "RFC 2518" },
  { code: 103, name: "Early Hints", summary: "Carries preliminary response fields before the final response, commonly so clients can begin work such as resource preloading.", reference: "RFC 8297" },
  { code: 104, name: "Upload Resumption Supported", summary: "A temporary registration used by the HTTP resumable-upload work to indicate upload-resumption support.", reference: "IANA temporary registration / resumable-upload draft", state: "temporary", note: "The IANA registration is temporary and is currently scheduled to expire on 13 November 2026 unless extended or made permanent. Check IANA before depending on it." },

  { code: 200, name: "OK", summary: "The request succeeded. The exact meaning and response content depend on the request method.", reference: "RFC 9110 §15.3.1" },
  { code: 201, name: "Created", summary: "The request succeeded and created one or more resources.", reference: "RFC 9110 §15.3.2", note: "A Location field is commonly used when there is a useful URI for the primary created resource." },
  { code: 202, name: "Accepted", summary: "The request was accepted for processing, but processing has not necessarily completed.", reference: "RFC 9110 §15.3.3" },
  { code: 203, name: "Non-Authoritative Information", summary: "A transforming intermediary changed representation metadata from what the origin supplied.", reference: "RFC 9110 §15.3.4" },
  { code: 204, name: "No Content", summary: "The request succeeded and the response has no content to send in the message body.", reference: "RFC 9110 §15.3.5" },
  { code: 205, name: "Reset Content", summary: "The request succeeded and the client should reset the document view that caused the request.", reference: "RFC 9110 §15.3.6" },
  { code: 206, name: "Partial Content", summary: "The server fulfilled a range request with only part of the selected representation.", reference: "RFC 9110 §15.3.7" },
  { code: 207, name: "Multi-Status", summary: "A WebDAV response carrying status information for multiple resources or operations.", reference: "RFC 4918" },
  { code: 208, name: "Already Reported", summary: "A WebDAV status used to avoid repeatedly enumerating the same internal collection members.", reference: "RFC 5842" },
  { code: 226, name: "IM Used", summary: "The server fulfilled the request using instance manipulations defined for delta encoding in HTTP.", reference: "RFC 3229" },

  { code: 300, name: "Multiple Choices", summary: "More than one representation or target is available and the client can select among them.", reference: "RFC 9110 §15.4.1" },
  { code: 301, name: "Moved Permanently", summary: "The target resource has a new permanent URI.", reference: "RFC 9110 §15.4.2", note: "Historical user-agent behavior can rewrite POST to GET. Use 308 when permanent redirect method preservation is required." },
  { code: 302, name: "Found", summary: "The target resource temporarily resides under a different URI.", reference: "RFC 9110 §15.4.3", note: "Historical user-agent behavior can rewrite POST to GET. Use 307 when temporary redirect method preservation is required." },
  { code: 303, name: "See Other", summary: "Directs the client to retrieve a different resource, generally with GET or HEAD, to obtain an indirect response to the original request.", reference: "RFC 9110 §15.4.4" },
  { code: 304, name: "Not Modified", summary: "A conditional GET or HEAD can reuse a stored representation because the selected representation has not changed.", reference: "RFC 9110 §15.4.5", note: "304 is cache validation, not a normal redirect response." },
  { code: 305, name: "Use Proxy", summary: "A historical proxy-redirection status that is not generally used by modern clients.", reference: "RFC 9110 §15.4.6" },
  { code: 306, name: "(Unused)", summary: "Reserved as unused in current HTTP semantics.", reference: "RFC 9110 §15.4.7", state: "unused" },
  { code: 307, name: "Temporary Redirect", summary: "A temporary redirect that preserves the request method and content when automatically followed.", reference: "RFC 9110 §15.4.8" },
  { code: 308, name: "Permanent Redirect", summary: "A permanent redirect that preserves the request method and content when automatically followed.", reference: "RFC 9110 §15.4.9" },

  { code: 400, name: "Bad Request", summary: "The server cannot or will not process the request because it considers the request malformed or otherwise invalid.", reference: "RFC 9110 §15.5.1" },
  { code: 401, name: "Unauthorized", summary: "The request lacks valid authentication credentials for the target resource.", reference: "RFC 9110 §15.5.2", note: "Despite the name, 401 is an authentication challenge. A 401 response carries WWW-Authenticate challenge information." },
  { code: 402, name: "Payment Required", summary: "Reserved for future use; HTTP does not define standard payment semantics for this status.", reference: "RFC 9110 §15.5.3" },
  { code: 403, name: "Forbidden", summary: "The server understood the request but refuses to fulfill it.", reference: "RFC 9110 §15.5.4", note: "Supplying different authentication credentials does not automatically make a 403 request acceptable." },
  { code: 404, name: "Not Found", summary: "The server did not find a current representation for the target resource, or is unwilling to disclose that one exists.", reference: "RFC 9110 §15.5.5" },
  { code: 405, name: "Method Not Allowed", summary: "The request method is known but is not supported by the target resource.", reference: "RFC 9110 §15.5.6", note: "An origin server generating 405 also generates an Allow field listing supported methods." },
  { code: 406, name: "Not Acceptable", summary: "The server cannot provide a representation acceptable under the request's proactive content-negotiation preferences.", reference: "RFC 9110 §15.5.7" },
  { code: 407, name: "Proxy Authentication Required", summary: "The client needs to authenticate with an intermediary proxy before the request can proceed.", reference: "RFC 9110 §15.5.8" },
  { code: 408, name: "Request Timeout", summary: "The server did not receive a complete request message within the time it was prepared to wait.", reference: "RFC 9110 §15.5.9" },
  { code: 409, name: "Conflict", summary: "The request conflicts with the current state of the target resource and might succeed after the conflict is resolved.", reference: "RFC 9110 §15.5.10" },
  { code: 410, name: "Gone", summary: "The target resource is no longer available and the condition is likely to be permanent.", reference: "RFC 9110 §15.5.11" },
  { code: 411, name: "Length Required", summary: "The server refuses the request because it requires a defined Content-Length for this request.", reference: "RFC 9110 §15.5.12" },
  { code: 412, name: "Precondition Failed", summary: "One or more request preconditions evaluated to false on the server.", reference: "RFC 9110 §15.5.13" },
  { code: 413, name: "Content Too Large", summary: "The request content is larger than the server is willing or able to process.", reference: "RFC 9110 §15.5.14" },
  { code: 414, name: "URI Too Long", summary: "The target URI is longer than the server is willing to interpret.", reference: "RFC 9110 §15.5.15" },
  { code: 415, name: "Unsupported Media Type", summary: "The request content format is not supported for the target resource or method.", reference: "RFC 9110 §15.5.16" },
  { code: 416, name: "Range Not Satisfiable", summary: "The requested ranges cannot be satisfied for the selected representation.", reference: "RFC 9110 §15.5.17" },
  { code: 417, name: "Expectation Failed", summary: "The server cannot meet the expectation given in the request's Expect field.", reference: "RFC 9110 §15.5.18" },
  { code: 418, name: "(Unused)", summary: "IANA lists 418 as unused in current HTTP semantics.", reference: "RFC 9110 §15.5.19", state: "unused", note: "The well-known “I'm a teapot” meaning comes from an April Fools RFC and is not the registered HTTP semantics." },
  { code: 421, name: "Misdirected Request", summary: "The request reached a server that is not able or willing to produce an authoritative response for the target URI.", reference: "RFC 9110 §15.5.20" },
  { code: 422, name: "Unprocessable Content", summary: "The server understands the content type and syntax but cannot process the contained instructions.", reference: "RFC 9110 §15.5.21" },
  { code: 423, name: "Locked", summary: "The source or destination resource is locked in a WebDAV operation.", reference: "RFC 4918" },
  { code: 424, name: "Failed Dependency", summary: "A WebDAV operation failed because another action it depended on failed.", reference: "RFC 4918" },
  { code: 425, name: "Too Early", summary: "The server is unwilling to risk processing a request that might be replayed when using early data.", reference: "RFC 8470" },
  { code: 426, name: "Upgrade Required", summary: "The server refuses the current protocol but is willing to serve the request after the client switches to a listed protocol.", reference: "RFC 9110 §15.5.22" },
  { code: 428, name: "Precondition Required", summary: "The origin server requires the request to be conditional, commonly to reduce lost-update conflicts.", reference: "RFC 6585" },
  { code: 429, name: "Too Many Requests", summary: "The client sent too many requests in a given period according to the server's rate-limiting policy.", reference: "RFC 6585", note: "The response may include Retry-After guidance, but clients should not assume it is always present." },
  { code: 431, name: "Request Header Fields Too Large", summary: "The server refuses the request because the header fields are too large, either collectively or individually.", reference: "RFC 6585" },
  { code: 451, name: "Unavailable For Legal Reasons", summary: "Access to the resource is denied as a consequence of a legal demand or restriction.", reference: "RFC 7725" },

  { code: 500, name: "Internal Server Error", summary: "The server encountered an unexpected condition that prevented it from fulfilling the request.", reference: "RFC 9110 §15.6.1" },
  { code: 501, name: "Not Implemented", summary: "The server does not support the functionality needed to fulfill the request.", reference: "RFC 9110 §15.6.2" },
  { code: 502, name: "Bad Gateway", summary: "A gateway or proxy received an invalid response from an upstream server while trying to fulfill the request.", reference: "RFC 9110 §15.6.3" },
  { code: 503, name: "Service Unavailable", summary: "The server is temporarily unable to handle the request, commonly because of overload or maintenance.", reference: "RFC 9110 §15.6.4", note: "The server may send Retry-After to suggest when the client should try again." },
  { code: 504, name: "Gateway Timeout", summary: "A gateway or proxy did not receive a timely response from an upstream server needed to complete the request.", reference: "RFC 9110 §15.6.5" },
  { code: 505, name: "HTTP Version Not Supported", summary: "The server does not support, or refuses to support, the major HTTP version used by the request.", reference: "RFC 9110 §15.6.6" },
  { code: 506, name: "Variant Also Negotiates", summary: "A transparent content-negotiation configuration error caused the chosen variant itself to participate in negotiation.", reference: "RFC 2295" },
  { code: 507, name: "Insufficient Storage", summary: "A WebDAV server cannot store the representation needed to complete the request.", reference: "RFC 4918" },
  { code: 508, name: "Loop Detected", summary: "A WebDAV server terminated an operation because it encountered an infinite loop while processing it.", reference: "RFC 5842" },
  { code: 510, name: "Not Extended", summary: "An obsolete HTTP extension status retained in the IANA registry for historical reference.", reference: "RFC 2774 / IANA status change", state: "obsoleted", note: "Do not design new APIs around this obsolete code." },
  { code: 511, name: "Network Authentication Required", summary: "The client needs to authenticate to gain network access, commonly through an intercepting network such as a captive portal.", reference: "RFC 6585" },
];

const STATUS_BY_CODE: Record<string, StatusEntry> = STATUS_CODES.reduce(
  (accumulator, entry) => {
    accumulator[String(entry.code)] = entry;
    return accumulator;
  },
  {} as Record<string, StatusEntry>
);

function statusClass(code: number) {
  if (code >= 100 && code <= 199) return "1xx — Informational";
  if (code >= 200 && code <= 299) return "2xx — Success";
  if (code >= 300 && code <= 399) return "3xx — Redirection";
  if (code >= 400 && code <= 499) return "4xx — Client Error";
  return "5xx — Server Error";
}

function registryLabel(entry: StatusEntry) {
  if (entry.state === "temporary") return "Temporary registration";
  if (entry.state === "unused") return "Unused";
  if (entry.state === "obsoleted") return "Obsoleted";
  return "Registered";
}

function renderEntry(entry: StatusEntry) {
  const lines = [
    `${entry.code} ${entry.name}`,
    "",
    `Class: ${statusClass(entry.code)}`,
    `Registry status: ${registryLabel(entry)}`,
    `Meaning: ${entry.summary}`,
    `Reference: ${entry.reference}`,
  ];

  if (entry.note) {
    lines.push(`Note: ${entry.note}`);
  }

  return lines.join("\n");
}

export default function ToolClient() {
  const [query, setQuery] = useState("");
  const [output, setOutput] = useState("");
  const [matches, setMatches] = useState<StatusEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const registeredCount = useMemo(
    () => STATUS_CODES.filter((entry) => !entry.state || entry.state === "registered").length,
    []
  );

  const runSearch = () => {
    const cleaned = query.trim().toLowerCase();

    setCopied(false);
    setError("");

    if (!cleaned) {
      setOutput("");
      setMatches([]);
      return;
    }

    if (/^\d+$/.test(cleaned)) {
      if (!/^\d{3}$/.test(cleaned)) {
        setMatches([]);
        setOutput(
          "HTTP status codes are three-digit values. Enter a code from 100 through 599, such as 404."
        );
        return;
      }

      const numeric = Number(cleaned);

      if (numeric < 100 || numeric > 599) {
        setMatches([]);
        setOutput(
          "HTTP status codes use the 100–599 range. This value is outside that range."
        );
        return;
      }

      const entry = STATUS_BY_CODE[cleaned];

      if (entry) {
        setMatches([entry]);
        setOutput(renderEntry(entry));
        return;
      }

      setMatches([]);
      setOutput(
        [
          `${cleaned} — unassigned in this bundled IANA-based table`,
          "",
          `Class: ${statusClass(numeric)}`,
          "Meaning: No specific standard HTTP semantics are assigned to this value in the bundled registry snapshot.",
          `Client fallback: RFC 9110 says an unrecognized ${String(numeric).charAt(0)}xx code is handled as the x00 code of the same class. For example, an unknown 471 is treated like 400 for class-level behavior.`,
          "Note: Frameworks, reverse proxies, CDNs, and vendors sometimes use non-standard status codes. Check the product documentation before assigning a vendor-specific meaning.",
        ].join("\n")
      );
      return;
    }

    const found = STATUS_CODES.filter((entry) => {
      const searchable = [
        String(entry.code),
        entry.name,
        entry.summary,
        entry.note || "",
        entry.reference,
        statusClass(entry.code),
        registryLabel(entry),
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(cleaned);
    });

    setMatches(found);

    if (found.length === 1) {
      setOutput(renderEntry(found[0]));
      return;
    }

    if (found.length > 1) {
      setOutput(
        [
          `${found.length} matching status entries`,
          "",
          ...found
            .slice(0, 20)
            .map((entry) => `${entry.code} ${entry.name} — ${entry.summary}`),
          ...(found.length > 20
            ? [`…and ${found.length - 20} more matches.`]
            : []),
        ].join("\n")
      );
      return;
    }

    setOutput(
      "No registered status entry matched this search. Try a code such as 404, a status name such as Not Found, or a concept such as redirect, cache, authentication, rate limit, gateway, or WebDAV."
    );
  };

  const resetAll = () => {
    setQuery("");
    setOutput("");
    setMatches([]);
    setCopied(false);
    setError("");
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setError("");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setError("The status result could not be copied. Select and copy it manually.");
    }
  };

  return (
    <ToolShell
      title="HTTP Status Code Explorer"
      description="Search HTTP response status codes by number, name, or meaning, then read the protocol semantics behind redirects, authentication, caching, rate limits, gateways, and server failures."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block text-sm font-semibold text-gray-900">
          HTTP Status Code, Name, or Concept
        </label>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">
          Search for <code>404</code>, <code>Not Found</code>,{" "}
          <code>redirect</code>, <code>authentication</code>,{" "}
          <code>cache</code>, <code>WebDAV</code>, or another concept.
        </p>

        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOutput("");
            setMatches([]);
            setCopied(false);
            setError("");
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") runSearch();
          }}
          placeholder="404 or Not Found"
          className="mt-4 w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={runSearch} className="yoryantra-btn">
            Find Status
          </button>
          <button
            type="button"
            onClick={resetAll}
            className="yoryantra-btn-outline"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Bundled entries" value={String(STATUS_CODES.length)} />
        <StatCard label="Regular registrations" value={String(registeredCount)} />
        <StatCard label="Temporary" value="104" />
        <StatCard label="Unused / obsolete" value="306, 418, 510" />
      </div>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Status Code Result
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              The result describes standardized semantics, not how a particular
              framework or vendor chooses to use a non-standard code.
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

        <pre className="mt-4 yoryantra-output min-h-[220px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output ||
            "Enter a registered code, status name, or concept to see its HTTP semantics."}
        </pre>
      </div>

      {error ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      {matches.length > 1 ? (
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
          Tip: refine a broad search such as <code>redirect</code> or{" "}
          <code>WebDAV</code> with a status name or code when you need one
          specific entry.
        </div>
      ) : null}

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            The Number Is Only the Start of the Diagnosis
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A status code describes the result of an HTTP request, but it rarely
            explains the whole failure by itself. The request method, response
            fields, cache validators, authentication challenge, redirect target,
            retry guidance, and any gateway or upstream relationship can all
            change what the response means operationally.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The first digit gives the response class. RFC 9110 requires clients
            to understand that class even when they do not recognize the exact
            code. An unknown <code>471</code>, for example, is handled like a
            generic <code>400</code>-class response rather than being given a
            made-up meaning.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            301, 302, 303, 307, and 308 Are Not Interchangeable
          </h2>
          <div className="mt-4 overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <pre className="whitespace-pre-wrap break-words">{`301 Moved Permanently   → permanent; historical clients can rewrite POST
302 Found               → temporary; historical clients can rewrite POST
303 See Other           → follow another URI using GET or HEAD semantics
307 Temporary Redirect  → temporary and method-preserving
308 Permanent Redirect  → permanent and method-preserving
304 Not Modified        → cache validation, not an ordinary redirect`}</pre>
          </div>
          <p className="mt-4 leading-relaxed text-gray-600">
            A redirect investigation therefore needs both the status and the
            <code> Location</code> field. Method preservation matters especially
            for non-GET requests where silently turning a POST into a GET can
            change application behavior.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            401 and 403 Point to Different Problems
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            <code>401 Unauthorized</code> is an authentication response: the
            request lacks valid credentials and the response carries an
            authentication challenge. <code>403 Forbidden</code> means the
            server understood the request but refuses to fulfill it. Sending a
            different password or token does not automatically turn a 403 into
            an allowed request.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Similar distinctions matter elsewhere. <code>429</code> describes a
            rate policy, while <code>503</code> describes temporary server
            unavailability. <code>502</code> is an invalid upstream response;
            <code>504</code> is an upstream timeout. Reading those pairs
            correctly often tells you which layer to inspect next.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Status 104 Is Still Temporary
          </h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            IANA currently lists <code>104 Upload Resumption Supported</code> as
            a temporary registration that expires on 13 November 2026 unless it
            is extended or made permanent. Code that depends on 104 should
            therefore check the live registry rather than assuming the current
            registration is permanent.
          </p>
          <p className="mt-4 leading-relaxed text-gray-700">
            The live{" "}
            <a
              href="https://www.iana.org/assignments/http-status-codes/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              IANA HTTP Status Code Registry
            </a>{" "}
            is the authority for assigned, temporary, unused, and obsoleted
            values. The general status semantics are defined in{" "}
            <a
              href="https://www.rfc-editor.org/rfc/rfc9110"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              RFC 9110
            </a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Unassigned and Vendor-Specific Codes Need Context
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A three-digit value between 100 and 599 can be syntactically valid
            without having a registered meaning. Products sometimes use such
            values internally, but that does not make them portable HTTP
            semantics. When an unfamiliar code appears in logs, keep the
            response class in mind and then check the software that generated
            it.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Codes 306 and 418 are currently listed as unused, while 510 is
            retained as obsoleted. Those labels are different from
            “unassigned”: an unused or historical value has an explicit
            registry history.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            A Local Reference Cannot Explain a Live Response
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The search is performed against bundled status data in the browser.
            No URL is requested, no redirect is followed, and no response
            headers are fetched. If the question is why a particular server
            returned a code, inspect the real request and response alongside
            application, proxy, CDN, or upstream logs.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Continue From the Response
          </h2>

          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/http-status-code-explorer" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
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
