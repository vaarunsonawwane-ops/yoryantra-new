"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "summary" | "json" | "steps";
type RedirectStatus = "301" | "302" | "307" | "308" | "unknown";

type ParsedRule = {
  type: "return" | "rewrite" | "server_name" | "location" | "listen" | "unknown";
  raw: string;
  line: number;
  status: RedirectStatus;
  pattern: string;
  target: string;
  flag: string;
  serverId: number;
  serverNames: string[];
  listens: string[];
  locationPattern: string;
};

type TestRequest = {
  url: string;
  protocol: string;
  host: string;
  hostname: string;
  path: string;
  query: string;
};

type RedirectStep = {
  step: number;
  from: string;
  to: string;
  status: RedirectStatus;
  rule: ParsedRule | null;
  note: string;
};

type TestResult = {
  request: TestRequest;
  rules: ParsedRule[];
  matchedRules: ParsedRule[];
  steps: RedirectStep[];
  finalUrl: string;
  redirected: boolean;
  possibleLoop: boolean;
  warnings: string[];
};

const sampleConfig = `server {
  listen 80;
  server_name example.com www.example.com;

  return 301 https://example.com$request_uri;
}

server {
  listen 443 ssl;
  server_name www.example.com;

  location /old-blog/ {
    rewrite ^/old-blog/(.*)$ /blog/$1 permanent;
  }

  location /docs {
    return 302 https://docs.example.com$request_uri;
  }
}`;

const sampleUrl = "http://www.example.com/old-blog/post-1?ref=test";

export default function ToolClient() {
  const [configInput, setConfigInput] = useState("");
  const [testUrl, setTestUrl] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [followRedirects, setFollowRedirects] = useState(true);
  const [maxSteps, setMaxSteps] = useState("5");
  const [treatPermanentAsFinal, setTreatPermanentAsFinal] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const issues = useMemo(() => result?.warnings || [], [result]);

  const testRedirects = () => {
    if (!configInput.trim()) {
      setError("Please paste an Nginx config or redirect rule block.");
      setResult(null);
      setOutput("");
      setCopied(false);
      return;
    }

    if (!testUrl.trim()) {
      setError("Please enter a URL to test.");
      setResult(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const testResult = runRedirectTest(configInput, testUrl, {
        followRedirects,
        maxSteps: Math.max(1, Math.min(Number(maxSteps) || 5, 10)),
        treatPermanentAsFinal,
      });

      const nextOutput = formatTestOutput(testResult, {
        outputMode,
      });

      setResult(testResult);
      setOutput(nextOutput);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to test these Nginx redirect rules."
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
    setConfigInput(sampleConfig);
    setTestUrl(sampleUrl);
    setOutputMode("summary");
    setFollowRedirects(true);
    setMaxSteps("5");
    setTreatPermanentAsFinal(false);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setConfigInput("");
    setTestUrl("");
    setOutputMode("summary");
    setFollowRedirects(true);
    setMaxSteps("5");
    setTreatPermanentAsFinal(false);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="Nginx Redirect Rule Tester"
      description="Simulate common server- and location-scoped Nginx redirect directives against one URL before testing the real configuration."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Nginx Config or Redirect Rules
        </label>

        <textarea
          value={configInput}
          onChange={(event) => {
            setConfigInput(event.target.value);
            setResult(null);
            setOutput("");
            setError("");
            setCopied(false);
          }}
          placeholder={sampleConfig}
          className="w-full min-h-[430px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste a server block, location block, return rule, or rewrite rule to
          test common redirect behavior.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Test URL and Options
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-4 md:col-span-2">
            <label className="block text-sm font-medium text-gray-900">
              Test URL
            </label>

            <input
              value={testUrl}
              onChange={(event) => {
                setTestUrl(event.target.value);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              placeholder={sampleUrl}
              className="mt-2 w-full rounded-xl border border-gray-300 p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />

            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Use the URL you want to test against the Nginx redirect rules.
            </p>
          </div>

          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value) => {
              setOutputMode(value as OutputMode);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              {
                label: "Summary",
                value: "summary",
              },
              {
                label: "JSON",
                value: "json",
              },
              {
                label: "Redirect steps",
                value: "steps",
              },
            ]}
          />

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <label className="block text-sm font-medium text-gray-900">
              Max Steps
            </label>

            <input
              value={maxSteps}
              onChange={(event) => {
                setMaxSteps(event.target.value);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              placeholder="5"
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
          </div>

          <label className="flex min-h-[104px] cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={followRedirects}
              onChange={(event) => {
                setFollowRedirects(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium leading-5 text-gray-900">
                Follow redirects
              </span>

              <span className="mt-1 block text-sm leading-6 text-gray-500">
                Keep applying matching rules to detect chains or loops.
              </span>
            </span>
          </label>

          <label className="flex min-h-[104px] cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={treatPermanentAsFinal}
              onChange={(event) => {
                setTreatPermanentAsFinal(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium leading-5 text-gray-900">
                Stop after permanent redirect
              </span>

              <span className="mt-1 block text-sm leading-6 text-gray-500">
                Stop after 301 or 308 even when follow redirects is on.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={testRedirects} className="yoryantra-btn min-h-11 whitespace-nowrap">
          Test Redirect Rules
        </button>

        <button onClick={loadExample} className="yoryantra-btn-outline min-h-11 whitespace-nowrap">
          Load Example
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline min-h-11 whitespace-nowrap">
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
          <SummaryCard
            label="Redirected"
            value={result.redirected ? "Yes" : "No"}
          />
          <SummaryCard
            label="Steps"
            value={result.steps.length.toLocaleString()}
          />
          <SummaryCard
            label="Rules Found"
            value={result.rules.length.toLocaleString()}
          />
          <SummaryCard
            label="Possible Loop"
            value={result.possibleLoop ? "Yes" : "No"}
          />
        </div>
      )}

      {result && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Redirect Result
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Final result based on the simplified browser-side rule test.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <DetailCard label="Input URL" value={result.request.url} />
            <DetailCard label="Final URL" value={result.finalUrl || "(no redirect)"} />
            <DetailCard
              label="Matched Rules"
              value={result.matchedRules.length.toLocaleString()}
            />
            <DetailCard
              label="Redirect Chain"
              value={
                result.steps.length > 0
                  ? `${result.steps.length} step${result.steps.length === 1 ? "" : "s"}`
                  : "(none)"
              }
            />
          </div>
        </div>
      )}

      {result && result.steps.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Redirect Steps
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Rules applied in order while testing the URL.
          </p>

          <div className="mt-4 space-y-4">
            {result.steps.map((step) => (
              <div
                key={`${step.step}-${step.from}-${step.to}`}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                    Step {step.step}
                  </span>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                    {step.status}
                  </span>

                  {step.rule && (
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                      line {step.rule.line}
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  <p className="break-words font-mono text-xs text-gray-700">
                    From: {step.from}
                  </p>

                  <p className="break-words font-mono text-xs text-gray-700">
                    To: {step.to}
                  </p>

                  {step.note && (
                    <p className="text-sm leading-relaxed text-gray-600">
                      {step.note}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {result && result.rules.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Redirect Rules Found
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Return and rewrite rules detected from the Nginx config.
          </p>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Pattern</th>
                  <th className="px-4 py-3 font-semibold">Target</th>
                  <th className="px-4 py-3 font-semibold">Line</th>
                  <th className="px-4 py-3 font-semibold">Raw</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {result.rules
                  .filter((rule) => rule.type === "return" || rule.type === "rewrite")
                  .map((rule, index) => (
                    <tr key={`${rule.line}-${index}`}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">
                        {rule.type}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">
                        {rule.status}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">
                        <span className="block max-w-[220px] break-words">
                          {rule.pattern || "(any)"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">
                        <span className="block max-w-[260px] break-words">
                          {rule.target || "(none)"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">
                        {rule.line}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">
                        <span className="block max-w-[300px] break-words">
                          {rule.raw}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {issues.length > 0 && (
        <div className="mt-6 self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Redirect notes
          </h3>

          <div className="mt-3 space-y-2">
            {issues.map((issue) => (
              <p key={issue} className="text-sm leading-relaxed text-amber-800">
                {issue}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Test Output
          </h3>

          {output && (
            <button
              onClick={copyOutput}
              className="yoryantra-btn-outline min-h-11 whitespace-nowrap text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">
          {output || "Nginx redirect test output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
        Redirect simulation runs in this browser session. The pasted configuration is not sent to Yoryantra by this page.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Testing Nginx Redirect Rules Before Deploying Them
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Nginx redirects can be tricky because a small change in a return,
            rewrite, server_name, or location block can send users to the wrong
            page. A redirect that looks simple can also create a chain or loop
            when another rule runs after it.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The browser simulation focuses on redirect-producing return and rewrite directives. It now keeps server_name, listen, and location scope in view, but it still does not execute the full Nginx configuration engine.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Checking a Redirect Rule
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste an Nginx server or location block into the input box.</li>
            <li>Enter the URL you want to test.</li>
            <li>Choose whether redirects should be followed for multiple steps.</li>
            <li>Run the test and review the matched rules and final URL.</li>
            <li>Copy the summary, JSON, or redirect step output.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Redirect Situations Worth Rehearsing
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Testing HTTP to HTTPS redirects before deployment.</li>
            <li>Checking www to non-www redirects.</li>
            <li>Reviewing old path to new path rewrite rules.</li>
            <li>Finding possible redirect chains or loops.</li>
            <li>Checking whether a location block redirect may apply.</li>
            <li>Preparing safer notes for server config changes.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Nginx Redirect Rule
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`server {
  listen 80;
  server_name example.com www.example.com;

  return 301 https://example.com$request_uri;
}`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            A Browser-Side Tester, Not a Full Nginx Runtime
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The simulation does not run Nginx. Includes, maps, runtime variables, named locations, every server-selection rule, and the complete rewrite phase cannot be reproduced faithfully in a browser parser.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Treat the result as a preflight check, then run <code className="font-mono">nginx -t</code> and exercise the deployed configuration before relying on the redirect in production.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Nginx documents the execution order and redirect behavior in the{" "}
            <a
              href="https://nginx.org/en/docs/http/ngx_http_rewrite_module.html"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-2"
            >
              ngx_http_rewrite_module reference
            </a>
            . That reference is the authority when this browser simulation and a real server disagree.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Nginx Redirect Questions That Change the Result
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What does an Nginx redirect rule tester do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It checks common Nginx return and rewrite rules against a test
                URL and shows the redirect target when a rule matches.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this test return 301 and 302 rules?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. It can read common return 301, 302, 307, and 308 redirect
                rules.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this test rewrite rules?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It can test simple rewrite patterns and targets, including
                permanent and redirect flags.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this replace testing in Nginx?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. It is a quick browser-side helper. Always test the final
                config in your real Nginx setup.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my Nginx config uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Testing happens directly in your browser, and your config is
                not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4">

            <YoryantraRelatedTools currentHref="/tools/nginx-redirect-rule-tester" />

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

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>

      <div className="mt-1 break-words font-mono text-sm text-gray-900">
        {value}
      </div>
    </div>
  );
}

function runRedirectTest(
  config: string,
  url: string,
  options: {
    followRedirects: boolean;
    maxSteps: number;
    treatPermanentAsFinal: boolean;
  }
): TestResult {
  const request = parseTestUrl(url);
  const rules = parseNginxRules(config);
  const warnings = getConfigWarnings(rules);
  const steps: RedirectStep[] = [];
  let currentUrl = request.url;
  const seenUrls = new Set<string>([currentUrl]);

  for (let index = 0; index < options.maxSteps; index += 1) {
    const currentRequest = parseTestUrl(currentUrl);
    const match = findMatchingRedirectRule(rules, currentRequest);

    if (!match) {
      break;
    }

    const target = applyRule(match, currentRequest);
    const step: RedirectStep = {
      step: index + 1,
      from: currentUrl,
      to: target,
      status: match.status,
      rule: match,
      note: match.type === "rewrite" ? "Matched a rewrite rule." : "Matched a return redirect rule.",
    };

    steps.push(step);

    if (seenUrls.has(target)) {
      warnings.push("Possible redirect loop detected. A redirect target repeats an earlier URL.");
      currentUrl = target;
      break;
    }

    seenUrls.add(currentUrl);
    currentUrl = target;

    if (!options.followRedirects) {
      break;
    }

    if (options.treatPermanentAsFinal && (match.status === "301" || match.status === "308")) {
      break;
    }
  }

  const matchedRules = steps
    .map((step) => step.rule)
    .filter((rule): rule is ParsedRule => Boolean(rule));

  return {
    request,
    rules,
    matchedRules,
    steps,
    finalUrl: steps.length > 0 ? currentUrl : request.url,
    redirected: steps.length > 0,
    possibleLoop: warnings.some((warning) => warning.toLowerCase().includes("loop")),
    warnings,
  };
}

function parseTestUrl(value: string): TestRequest {
  try {
    const url = new URL(value.trim());

    return {
      url: url.href,
      protocol: url.protocol.replace(":", ""),
      host: url.host,
      hostname: url.hostname,
      path: decodePathname(url.pathname || "/"),
      query: url.search,
    };
  } catch {
    throw new Error("Test URL should be a valid absolute URL, such as https://example.com/path.");
  }
}

function parseNginxRules(config: string): ParsedRule[] {
  const rules: ParsedRule[] = [];
  const lines = config.replace(/\r\n?/g, "\n").split("\n");
  let serverId = 0;
  let currentServerId = 0;
  let serverNames: string[] = [];
  let listens: string[] = [];
  let currentLocation = "";
  const stack: Array<"server" | "location" | "other"> = [];

  lines.forEach((rawLine, index) => {
    const raw = stripNginxComment(rawLine).trim();
    if (!raw) return;

    const opens = (raw.match(/\{/g) || []).length;
    const closes = (raw.match(/\}/g) || []).length;
    const clean = raw.replace(/[{}]/g, " ").trim().replace(/;$/, "");

    if (/^server(?:\s|$)/.test(clean) && opens > 0) {
      serverId += 1;
      currentServerId = serverId;
      serverNames = [];
      listens = [];
      currentLocation = "";
      stack.push("server");
      return;
    }

    if (/^location\s+/.test(clean) && opens > 0) {
      currentLocation = clean.replace(/^location\s+/, "").trim();
      stack.push("location");
      return;
    }

    if (opens > 0) {
      for (let count = 0; count < opens; count += 1) stack.push("other");
    }

    if (clean.startsWith("server_name ")) {
      serverNames = splitNginxArgs(clean).slice(1);
      rules.push(
        makeParsedRule("server_name", raw, index + 1, {
          serverId: currentServerId,
          serverNames,
          listens,
          locationPattern: currentLocation,
          target: serverNames.join(" "),
        })
      );
    } else if (clean.startsWith("listen ")) {
      listens = splitNginxArgs(clean).slice(1);
      rules.push(
        makeParsedRule("listen", raw, index + 1, {
          serverId: currentServerId,
          serverNames,
          listens,
          locationPattern: currentLocation,
          target: listens.join(" "),
        })
      );
    } else {
      const parsed = parseNginxLine(clean, raw, index + 1, {
        serverId: currentServerId,
        serverNames,
        listens,
        locationPattern: currentLocation,
      });
      if (parsed) rules.push(parsed);
    }

    for (let count = 0; count < closes; count += 1) {
      const popped = stack.pop();
      if (popped === "location") currentLocation = "";
      if (popped === "server") {
        currentServerId = 0;
        serverNames = [];
        listens = [];
        currentLocation = "";
      }
    }
  });

  return rules;
}

function parseNginxLine(
  clean: string,
  raw: string,
  line: number,
  scope: {
    serverId: number;
    serverNames: string[];
    listens: string[];
    locationPattern: string;
  }
): ParsedRule | null {
  if (clean.startsWith("return ")) {
    const parts = splitNginxArgs(clean);
    let status: RedirectStatus = normalizeStatus(parts[1]);
    let target = parts.slice(2).join(" ");

    if (isRedirectTarget(parts[1]) && parts.length === 2) {
      status = "302";
      target = parts[1];
    }

    return makeParsedRule("return", raw, line, {
      ...scope,
      status,
      target,
    });
  }

  if (clean.startsWith("rewrite ")) {
    const parts = splitNginxArgs(clean);
    const pattern = parts[1] || "";
    const target = parts[2] || "";
    const flag = (parts[3] || "").toLowerCase();
    const status: RedirectStatus =
      flag === "permanent"
        ? "301"
        : flag === "redirect" || isRedirectTarget(target)
          ? "302"
          : "unknown";

    return makeParsedRule("rewrite", raw, line, {
      ...scope,
      status,
      pattern,
      target,
      flag,
    });
  }

  return null;
}

function makeParsedRule(
  type: ParsedRule["type"],
  raw: string,
  line: number,
  values: Partial<ParsedRule>
): ParsedRule {
  return {
    type,
    raw,
    line,
    status: values.status || "unknown",
    pattern: values.pattern || "",
    target: values.target || "",
    flag: values.flag || "",
    serverId: values.serverId || 0,
    serverNames: [...(values.serverNames || [])],
    listens: [...(values.listens || [])],
    locationPattern: values.locationPattern || "",
  };
}

function stripNginxComment(line: string): string {
  let quote: "'" | '"' | null = null;
  let escaped = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (quote) {
      if (char === quote) quote = null;
      continue;
    }
    if (char === "'" || char === '"') {
      quote = char;
      continue;
    }
    if (char === "#") return line.slice(0, index);
  }
  return line;
}

function splitNginxArgs(value: string): string[] {
  const parts: string[] = [];
  let current = "";
  let quote: "'" | '"' | null = null;
  let escaped = false;

  for (const char of value) {
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }
    if (char === "\\") {
      current += char;
      escaped = true;
      continue;
    }
    if (quote) {
      if (char === quote) {
        quote = null;
      } else {
        current += char;
      }
      continue;
    }
    if (char === "'" || char === '"') {
      quote = char;
      continue;
    }
    if (/\s/.test(char)) {
      if (current) {
        parts.push(current);
        current = "";
      }
      continue;
    }
    current += char;
  }

  if (quote) {
    throw new Error("An Nginx directive contains an unterminated quoted argument.");
  }
  if (current) parts.push(current);
  return parts;
}

function normalizeStatus(value: string): RedirectStatus {
  return value === "301" || value === "302" || value === "307" || value === "308"
    ? value
    : "unknown";
}

function isRedirectTarget(value: string): boolean {
  return /^(?:https?:\/\/|\$scheme(?:\:\/\/|:))/i.test(value || "");
}

function findMatchingRedirectRule(
  rules: ParsedRule[],
  request: TestRequest
): ParsedRule | null {
  const serverId = selectServerId(rules, request);
  const candidates = rules.filter(
    (rule) =>
      (rule.type === "return" || rule.type === "rewrite") &&
      rule.status !== "unknown" &&
      (serverId === 0 || rule.serverId === serverId) &&
      locationMatches(rule.locationPattern, request.path)
  );

  const serverLevel = candidates.filter((rule) => !rule.locationPattern);
  const locationLevel = candidates.filter((rule) => rule.locationPattern);

  for (const rule of [...serverLevel, ...locationLevel]) {
    if (rule.type === "return") return rule;
    try {
      if (new RegExp(rule.pattern).test(request.path)) return rule;
    } catch {
      continue;
    }
  }

  return null;
}

function selectServerId(rules: ParsedRule[], request: TestRequest): number {
  const ids = Array.from(
    new Set(rules.map((rule) => rule.serverId).filter((id) => id > 0))
  );
  if (ids.length === 0) return 0;

  for (const id of ids) {
    const scoped = rules.filter((rule) => rule.serverId === id);
    const names = scoped.reduce<string[]>((all, rule) => {
      if (rule.type === "server_name") all.push(...rule.serverNames);
      return all;
    }, []);
    const listens = scoped.reduce<string[]>((all, rule) => {
      if (rule.type === "listen") all.push(...rule.listens);
      return all;
    }, []);

    if (
      serverNameMatches(names, request.hostname) &&
      listenMatches(listens, request.protocol)
    ) {
      return id;
    }
  }

  return ids[0];
}

function serverNameMatches(names: string[], hostname: string): boolean {
  if (names.length === 0) return true;
  const host = hostname.toLowerCase();

  return names.some((name) => {
    const candidate = name.toLowerCase();
    if (candidate === "_" || candidate === host) return true;
    if (candidate.startsWith("*.")) {
      return host.endsWith(candidate.slice(1));
    }
    if (candidate.endsWith(".*")) {
      return host.startsWith(candidate.slice(0, -1));
    }
    return false;
  });
}

function listenMatches(listens: string[], protocol: string): boolean {
  if (listens.length === 0) return true;
  const text = listens.join(" ").toLowerCase();
  const has443 = /(?:^|:|\s)443(?:\s|$)/.test(text) || text.includes("ssl");
  const has80 = /(?:^|:|\s)80(?:\s|$)/.test(text);

  if (protocol === "https" && has80 && !has443) return false;
  if (protocol === "http" && has443 && !has80) return false;
  return true;
}

function locationMatches(pattern: string, path: string): boolean {
  if (!pattern) return true;
  const parts = splitNginxArgs(pattern);
  if (parts[0] === "=") return path === (parts[1] || "");
  if (parts[0] === "~" || parts[0] === "~*") {
    try {
      return new RegExp(parts[1] || "", parts[0] === "~*" ? "i" : "").test(path);
    } catch {
      return false;
    }
  }
  if (parts[0] === "^~") return path.startsWith(parts[1] || "");
  if (parts[0]?.startsWith("@")) return false;
  return path.startsWith(parts[0] || "/");
}

function applyRule(rule: ParsedRule, request: TestRequest): string {
  if (rule.type === "return") {
    return expandNginxTarget(rule.target, request);
  }

  if (rule.type === "rewrite") {
    const regex = new RegExp(rule.pattern);
    const replacement = request.path.replace(regex, rule.target);
    return buildRewriteTarget(replacement, request);
  }

  return request.url;
}

function buildRewriteTarget(replacement: string, request: TestRequest): string {
  let target = expandNginxTarget(replacement, request);
  const suppressOldArgs = target.endsWith("?");
  if (suppressOldArgs) target = target.slice(0, -1);

  if (!/^https?:\/\//i.test(target)) {
    if (!target.startsWith("/")) target = `/${target}`;
    target = `${request.protocol}://${request.host}${target}`;
  }

  if (!suppressOldArgs && request.query) {
    const separator = target.includes("?") ? "&" : "?";
    target += `${separator}${request.query.slice(1)}`;
  }

  return target;
}

function expandNginxTarget(target: string, request: TestRequest): string {
  const replaced = target
    .replace(/\$request_uri/g, `${request.path}${request.query}`)
    .replace(/\$http_host/g, request.host)
    .replace(/\$scheme/g, request.protocol)
    .replace(/\$host/g, request.hostname)
    .replace(/\$uri/g, request.path)
    .replace(/\$is_args/g, request.query ? "?" : "")
    .replace(/\$args/g, request.query.replace(/^\?/, ""));

  if (/^https?:\/\//i.test(replaced)) return replaced;
  if (replaced.startsWith("/")) {
    return `${request.protocol}://${request.host}${replaced}`;
  }
  return replaced;
}

function decodePathname(pathname: string): string {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

function getConfigWarnings(rules: ParsedRule[]) {
  const warnings: string[] = [];

  if (!rules.some((rule) => rule.type === "return" || rule.type === "rewrite")) {
    warnings.push("No return or rewrite redirect rules were found.");
  }

  if (
    rules.some(
      (rule) =>
        rule.type === "rewrite" &&
        rule.status === "unknown" &&
        (rule.flag === "last" || rule.flag === "break" || !rule.flag)
    )
  ) {
    warnings.push(
      "Relative rewrite rules using last, break, or no redirect flag are internal URI rewrites, so they are listed but not followed as client redirects."
    );
  }

  if (rules.some((rule) => rule.type === "return" && rule.status === "unknown")) {
    warnings.push(
      "A return directive uses a non-redirect status or unsupported form; it is not followed as a redirect."
    );
  }

  if (rules.some((rule) => rule.serverNames.some((name) => name.startsWith("~")))) {
    warnings.push(
      "Regex server_name selection is not simulated; verify that case in a real Nginx configuration."
    );
  }

  if (rules.some((rule) => rule.locationPattern.includes("@"))) {
    warnings.push(
      "Named locations are not request-URI locations and are not simulated by this redirect preflight."
    );
  }

  return warnings;
}

function formatTestOutput(
  result: TestResult,
  options: {
    outputMode: OutputMode;
  }
) {
  if (options.outputMode === "json") {
    return JSON.stringify(result, null, 2);
  }

  if (options.outputMode === "steps") {
    if (result.steps.length === 0) {
      return "No redirect steps were applied.";
    }

    return result.steps
      .map(
        (step) =>
          `Step ${step.step} (${step.status})\nFrom: ${step.from}\nTo: ${step.to}\nRule: ${
            step.rule?.raw || "(unknown)"
          }`
      )
      .join("\n\n");
  }

  return [
    "Nginx Redirect Test",
    "-------------------",
    `Input URL: ${result.request.url}`,
    `Redirected: ${result.redirected ? "yes" : "no"}`,
    `Final URL: ${result.finalUrl}`,
    `Redirect steps: ${result.steps.length}`,
    `Rules found: ${result.rules.length}`,
    `Possible loop: ${result.possibleLoop ? "yes" : "no"}`,
    "",
    "Steps:",
    ...(result.steps.length === 0
      ? ["No redirect rule matched."]
      : result.steps.map(
          (step) =>
            `- ${step.status}: ${step.from} -> ${step.to} (line ${
              step.rule?.line || "?"
            })`
        )),
    "",
    "Warnings:",
    ...(result.warnings.length === 0 ? ["(none)"] : result.warnings.map((warning) => `- ${warning}`)),
  ].join("\n");
}
