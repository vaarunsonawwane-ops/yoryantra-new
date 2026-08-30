"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type StatusEntry = {
  name: string;
  summary: string;
  reference: string;
  note?: string;
};

const STATUS_CODES: Record<string, StatusEntry> = {
  "100": { name: "Continue", summary: "The server received the request headers and the client can continue sending the request content.", reference: "RFC 9110 §15.2.1" },
  "101": { name: "Switching Protocols", summary: "The server agrees to switch protocols as requested through the Upgrade mechanism.", reference: "RFC 9110 §15.2.2" },
  "102": { name: "Processing", summary: "A WebDAV server has received the complete request but has not finished processing it.", reference: "RFC 2518" },
  "103": { name: "Early Hints", summary: "Carries preliminary response headers before the final response, commonly so clients can begin work such as preloading resources.", reference: "RFC 8297" },
  "104": { name: "Upload Resumption Supported", summary: "Temporary IANA registration used by the resumable-upload work to indicate upload resumption support.", reference: "IANA temporary registration", note: "This registration is temporary and can change or expire; check the live IANA registry before depending on it." },
  "200": { name: "OK", summary: "The request succeeded. The exact meaning and response content depend on the request method.", reference: "RFC 9110 §15.3.1" },
  "201": { name: "Created", summary: "The request succeeded and created one or more resources.", reference: "RFC 9110 §15.3.2", note: "A Location header is often used to identify the primary created resource when appropriate." },
  "202": { name: "Accepted", summary: "The request was accepted for processing, but processing has not necessarily completed.", reference: "RFC 9110 §15.3.3" },
  "203": { name: "Non-Authoritative Information", summary: "A transforming intermediary changed the enclosed representation metadata from what the origin server supplied.", reference: "RFC 9110 §15.3.4" },
  "204": { name: "No Content", summary: "The request succeeded and there is no response content to send in the message body.", reference: "RFC 9110 §15.3.5" },
  "205": { name: "Reset Content", summary: "The request succeeded and the client should reset the document view that caused the request.", reference: "RFC 9110 §15.3.6" },
  "206": { name: "Partial Content", summary: "The server fulfilled a range request with only part of the selected representation.", reference: "RFC 9110 §15.3.7" },
  "207": { name: "Multi-Status", summary: "A WebDAV response that carries status information for multiple resources or operations.", reference: "RFC 4918" },
  "208": { name: "Already Reported", summary: "A WebDAV status used to avoid repeatedly enumerating the same internal collection members.", reference: "RFC 5842" },
  "226": { name: "IM Used", summary: "The server fulfilled the request using one or more instance manipulations as defined for delta encoding in HTTP.", reference: "RFC 3229" },
  "300": { name: "Multiple Choices", summary: "More than one representation or target is available and the client can select among them.", reference: "RFC 9110 §15.4.1" },
  "301": { name: "Moved Permanently", summary: "The target resource has a new permanent URI.", reference: "RFC 9110 §15.4.2", note: "For strict method preservation on redirects, 308 is the explicit permanent alternative." },
  "302": { name: "Found", summary: "The target resource temporarily resides under a different URI.", reference: "RFC 9110 §15.4.3", note: "Historical user-agent behavior can change POST to GET; use 307 when the method must be preserved." },
  "303": { name: "See Other", summary: "Directs the client to retrieve a different resource, normally using GET or HEAD, to obtain an indirect response to the original request.", reference: "RFC 9110 §15.4.4" },
  "304": { name: "Not Modified", summary: "A conditional GET or HEAD can reuse its cached representation because the selected representation has not changed.", reference: "RFC 9110 §15.4.5", note: "304 is a cache-validation response, not a normal redirect page." },
  "305": { name: "Use Proxy", summary: "Defined for historical proxy redirection behavior and not generally used by modern clients.", reference: "RFC 9110 §15.4.6" },
  "306": { name: "(Unused)", summary: "This status code is reserved as unused in the HTTP semantics specification.", reference: "RFC 9110 §15.4.7" },
  "307": { name: "Temporary Redirect", summary: "Temporary redirect that preserves the request method and content when the client follows it automatically.", reference: "RFC 9110 §15.4.8" },
  "308": { name: "Permanent Redirect", summary: "Permanent redirect that preserves the request method and content when the client follows it automatically.", reference: "RFC 9110 §15.4.9" },
  "400": { name: "Bad Request", summary: "The server cannot or will not process the request because it considers the request malformed or otherwise invalid.", reference: "RFC 9110 §15.5.1" },
  "401": { name: "Unauthorized", summary: "The request lacks valid authentication credentials for the target resource.", reference: "RFC 9110 §15.5.2", note: "Despite the name, 401 is about authentication. A 401 response uses WWW-Authenticate challenge information." },
  "402": { name: "Payment Required", summary: "Reserved for future use; HTTP does not currently define standard payment semantics for this code.", reference: "RFC 9110 §15.5.3" },
  "403": { name: "Forbidden", summary: "The server understood the request but refuses to fulfill it.", reference: "RFC 9110 §15.5.4", note: "Authenticating again does not automatically make a 403 request acceptable." },
  "404": { name: "Not Found", summary: "The server did not find a current representation for the target resource, or is unwilling to disclose that one exists.", reference: "RFC 9110 §15.5.5" },
  "405": { name: "Method Not Allowed", summary: "The request method is known but is not supported by the target resource.", reference: "RFC 9110 §15.5.6", note: "The origin server generates an Allow header identifying supported methods." },
  "406": { name: "Not Acceptable", summary: "The server cannot provide a representation acceptable under the request's proactive content-negotiation preferences.", reference: "RFC 9110 §15.5.7" },
  "407": { name: "Proxy Authentication Required", summary: "The client needs to authenticate with an intermediary proxy before the request can proceed.", reference: "RFC 9110 §15.5.8" },
  "408": { name: "Request Timeout", summary: "The server did not receive a complete request message within the time it was prepared to wait.", reference: "RFC 9110 §15.5.9" },
  "409": { name: "Conflict", summary: "The request conflicts with the current state of the target resource and might succeed after the conflict is resolved.", reference: "RFC 9110 §15.5.10" },
  "410": { name: "Gone", summary: "The target resource is no longer available and the condition is likely to be permanent.", reference: "RFC 9110 §15.5.11" },
  "411": { name: "Length Required", summary: "The server refuses the request because it requires a defined Content-Length for this request.", reference: "RFC 9110 §15.5.12" },
  "412": { name: "Precondition Failed", summary: "One or more request preconditions evaluated to false on the server.", reference: "RFC 9110 §15.5.13" },
  "413": { name: "Content Too Large", summary: "The request content is larger than the server is willing or able to process.", reference: "RFC 9110 §15.5.14" },
  "414": { name: "URI Too Long", summary: "The target URI is longer than the server is willing to interpret.", reference: "RFC 9110 §15.5.15" },
  "415": { name: "Unsupported Media Type", summary: "The request content format is not supported for the target resource or method.", reference: "RFC 9110 §15.5.16" },
  "416": { name: "Range Not Satisfiable", summary: "The requested ranges cannot be satisfied for the selected representation.", reference: "RFC 9110 §15.5.17" },
  "417": { name: "Expectation Failed", summary: "The server cannot meet the expectation given in the request's Expect field.", reference: "RFC 9110 §15.5.18" },
  "418": { name: "(Unused)", summary: "IANA lists 418 as unused under the current HTTP semantics specification.", reference: "RFC 9110 §15.5.19", note: "The familiar 'I'm a teapot' meaning comes from an older April Fools RFC and is not the registered HTTP semantics here." },
  "421": { name: "Misdirected Request", summary: "The request reached a server that is not able or willing to produce an authoritative response for the target URI.", reference: "RFC 9110 §15.5.20" },
  "422": { name: "Unprocessable Content", summary: "The server understands the content type and syntax but cannot process the contained instructions.", reference: "RFC 9110 §15.5.21" },
  "423": { name: "Locked", summary: "The source or destination resource is locked in a WebDAV operation.", reference: "RFC 4918" },
  "424": { name: "Failed Dependency", summary: "A WebDAV operation failed because another action that it depended on failed.", reference: "RFC 4918" },
  "425": { name: "Too Early", summary: "The server is unwilling to risk processing a request that might be replayed when using early data.", reference: "RFC 8470" },
  "426": { name: "Upgrade Required", summary: "The server refuses the current protocol but is willing to serve the request after the client switches to a listed protocol.", reference: "RFC 9110 §15.5.22" },
  "428": { name: "Precondition Required", summary: "The origin server requires the request to be conditional, commonly to reduce lost-update conflicts.", reference: "RFC 6585" },
  "429": { name: "Too Many Requests", summary: "The client sent too many requests in a given period according to the server's rate-limiting policy.", reference: "RFC 6585", note: "The server may send Retry-After guidance, but clients should not assume it is always present." },
  "431": { name: "Request Header Fields Too Large", summary: "The server refuses the request because the header fields are too large, either collectively or individually.", reference: "RFC 6585" },
  "451": { name: "Unavailable For Legal Reasons", summary: "Access to the resource is denied as a consequence of a legal demand or restriction.", reference: "RFC 7725" },
  "500": { name: "Internal Server Error", summary: "The server encountered an unexpected condition that prevented it from fulfilling the request.", reference: "RFC 9110 §15.6.1" },
  "501": { name: "Not Implemented", summary: "The server does not support the functionality needed to fulfill the request, such as an unrecognized or unsupported method.", reference: "RFC 9110 §15.6.2" },
  "502": { name: "Bad Gateway", summary: "A gateway or proxy received an invalid response from an upstream server while trying to fulfill the request.", reference: "RFC 9110 §15.6.3" },
  "503": { name: "Service Unavailable", summary: "The server is temporarily unable to handle the request, commonly because of overload or maintenance.", reference: "RFC 9110 §15.6.4", note: "A server may send Retry-After to suggest when the client should try again." },
  "504": { name: "Gateway Timeout", summary: "A gateway or proxy did not receive a timely response from an upstream server needed to complete the request.", reference: "RFC 9110 §15.6.5" },
  "505": { name: "HTTP Version Not Supported", summary: "The server does not support, or refuses to support, the major HTTP version used by the request.", reference: "RFC 9110 §15.6.6" },
  "506": { name: "Variant Also Negotiates", summary: "A transparent content-negotiation configuration error caused the chosen variant itself to participate in negotiation.", reference: "RFC 2295" },
  "507": { name: "Insufficient Storage", summary: "A WebDAV server cannot store the representation needed to complete the request.", reference: "RFC 4918" },
  "508": { name: "Loop Detected", summary: "A WebDAV server terminated an operation because it encountered an infinite loop while processing it.", reference: "RFC 5842" },
  "510": { name: "Not Extended (Obsoleted)", summary: "An obsolete HTTP extension status retained in the IANA registry for historical reference.", reference: "RFC 2774 / IANA status change", note: "Do not design new APIs around this obsolete code." },
  "511": { name: "Network Authentication Required", summary: "The client needs to authenticate to gain network access, typically through an intercepting network such as a captive portal.", reference: "RFC 6585" },
};

function statusClass(code: number): string {
  if (code >= 100 && code <= 199) return "1xx — Informational";
  if (code >= 200 && code <= 299) return "2xx — Success";
  if (code >= 300 && code <= 399) return "3xx — Redirection";
  if (code >= 400 && code <= 499) return "4xx — Client Error";
  return "5xx — Server Error";
}

function renderEntry(code: string, entry: StatusEntry): string {
  const lines = [
    code + " " + entry.name,
    "",
    "Class: " + statusClass(Number(code)),
    "Meaning: " + entry.summary,
    "Reference: " + entry.reference,
  ];
  if (entry.note) lines.push("Note: " + entry.note);
  return lines.join("\n");
}

export default function ToolClient() {
  const [query, setQuery] = useState("");
  const [output, setOutput] = useState("");

  const findStatusCode = () => {
    const cleaned = query.trim().toLowerCase();
    if (!cleaned) {
      setOutput("");
      return;
    }

    if (/^\d{3}$/.test(cleaned)) {
      const numeric = Number(cleaned);
      if (numeric < 100 || numeric > 599) {
        setOutput("HTTP status codes use three digits in the 100–599 range. This value is outside that range.");
        return;
      }

      const entry = STATUS_CODES[cleaned];
      if (entry) {
        setOutput(renderEntry(cleaned, entry));
        return;
      }

      setOutput(
        [
          cleaned + " — no registered entry in this IANA-based table",
          "",
          "Class: " + statusClass(numeric),
          "Meaning: No standard HTTP semantics are assigned here in the bundled registry snapshot.",
          "Note: A framework, reverse proxy, CDN, or vendor can use non-standard codes, so verify the product documentation before assigning meaning to an unregistered number.",
        ].join("\n")
      );
      return;
    }

    const matches = Object.keys(STATUS_CODES).filter((code) => {
      const entry = STATUS_CODES[code];
      return entry.name.toLowerCase().indexOf(cleaned) !== -1;
    });

    if (matches.length === 1) {
      const code = matches[0];
      setOutput(renderEntry(code, STATUS_CODES[code]));
      return;
    }

    if (matches.length > 1) {
      setOutput(
        "Matching registered status names:\n\n" +
          matches.slice(0, 12).map((code) => code + " " + STATUS_CODES[code].name).join("\n") +
          (matches.length > 12 ? "\n…" : "")
      );
      return;
    }

    setOutput("No status name matched this bundled IANA-based table. Try a three-digit code such as 404, or a registered phrase such as Not Found or Temporary Redirect.");
  };

  const resetAll = () => {
    setQuery("");
    setOutput("");
  };

  return (
    <ToolShell
      title="HTTP Status Code Explorer"
      description="Look up registered HTTP status codes and the request semantics that matter while debugging APIs, redirects, caching, authentication, and server failures."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          HTTP Status Code or Name
        </label>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="404 or Not Found"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={findStatusCode} className="yoryantra-btn">Find Status</button>
        <button onClick={resetAll} className="yoryantra-btn-outline">Reset</button>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Status Code Result</h3>
          {output && (
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>
        <div className="yoryantra-output min-h-[190px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {output || "Enter a registered code or status name to see its semantics."}
        </div>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Read the Code in Context, Not Just by Its Number</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            HTTP status codes describe the result of a request, but the useful debugging detail is often in the semantics around the code: whether a redirect preserves the method, whether authentication is missing, whether a conditional cache request can reuse a stored response, or whether a gateway failed while talking to an upstream server.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This explorer uses an IANA registry snapshot reviewed on August 30, 2026, including WebDAV and extension codes. It distinguishes registered, unused, obsolete, temporary, and unassigned values instead of treating every three-digit number as a standard response.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Redirect Codes That Are Easy to Mix Up</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">{`301 Moved Permanently   → permanent; historical clients may rewrite POST
302 Found               → temporary; historical clients may rewrite POST
303 See Other           → follow another URI using GET/HEAD semantics
307 Temporary Redirect  → temporary and method-preserving
308 Permanent Redirect  → permanent and method-preserving`}</pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Authentication, Rate Limits, and Availability</h2>
          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li><strong>401</strong> is an authentication challenge; <strong>403</strong> means the server refuses the request after understanding it.</li>
            <li><strong>429</strong> describes a client exceeding a rate policy; <strong>503</strong> describes temporary server unavailability such as overload or maintenance.</li>
            <li><strong>502</strong> means a gateway received an invalid upstream response, while <strong>504</strong> means the upstream response did not arrive in time.</li>
            <li><strong>304</strong> belongs to cache validation and does not mean the resource moved somewhere else.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Registry Notes</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            The IANA HTTP Status Code Registry is the source of truth for registered numbers. In the August 30, 2026 snapshot used here, 104 is temporary, 418 and 306 are listed as unused, and 510 is retained as obsoleted. The registry can change, so temporary, unusual, or newly introduced codes should be checked against IANA and the referenced specification.
          </p>
          <p className="mt-3 text-gray-600 leading-relaxed">
            This page performs a local table lookup only. It does not make an HTTP request, inspect your server, or verify how a specific application uses a status code.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/http-status-code-explorer" />
        </div>
      </section>
    </ToolShell>
  );
}
