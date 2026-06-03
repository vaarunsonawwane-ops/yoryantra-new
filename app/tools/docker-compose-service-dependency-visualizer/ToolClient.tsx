"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "summary" | "mermaid" | "json" | "markdown" | "csv" | "checklist";
type ParseMode = "balanced" | "strict" | "loose";
type GraphDirection = "TD" | "LR";

type ComposeService = {
  name: string;
  image: string;
  build: string;
  dependsOn: string[];
  links: string[];
  networks: string[];
  ports: string[];
  environment: string[];
  lineNumber: number;
};

type DependencyEdge = {
  from: string;
  to: string;
  type: "depends_on" | "links" | "env_hint";
};

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type Result = {
  services: ComposeService[];
  edges: DependencyEdge[];
  issues: Issue[];
  output: string;
  serviceCount: number;
  dependencyCount: number;
  portCount: number;
  networkCount: number;
};

const sampleCompose = `services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://postgres:postgres@db:5432/app
      REDIS_URL: redis://redis:6379
    depends_on:
      - db
      - redis
    networks:
      - backend

  worker:
    build: .
    depends_on:
      - redis
      - db
    networks:
      - backend

  db:
    image: postgres:16
    ports:
      - "5432:5432"
    networks:
      - backend

  redis:
    image: redis:7-alpine
    networks:
      - backend

networks:
  backend:`;

export default function ToolClient() {
  const [composeText, setComposeText] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [parseMode, setParseMode] = useState<ParseMode>("balanced");
  const [graphDirection, setGraphDirection] = useState<GraphDirection>("LR");
  const [includeLinks, setIncludeLinks] = useState(true);
  const [includeEnvHints, setIncludeEnvHints] = useState(true);
  const [warnMissingDependsOn, setWarnMissingDependsOn] = useState(true);
  const [warnLinksUsage, setWarnLinksUsage] = useState(true);
  const [warnPublicDatabasePorts, setWarnPublicDatabasePorts] = useState(true);
  const [warnDependencyCycles, setWarnDependencyCycles] = useState(true);
  const [result, setResult] = useState<Result | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getNotes(result) : []), [result]);

  const clearResult = () => {
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const visualizeDependencies = () => {
    if (!composeText.trim()) {
      setError("Please paste a Docker Compose YAML file or services block.");
      setResult(null);
      setOutput("");
      return;
    }

    try {
      const next = buildResult({
        composeText,
        outputMode,
        parseMode,
        graphDirection,
        includeLinks,
        includeEnvHints,
        warnMissingDependsOn,
        warnLinksUsage,
        warnPublicDatabasePorts,
        warnDependencyCycles,
      });

      setResult(next);
      setOutput(next.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to parse this Docker Compose content.");
      setResult(null);
      setOutput("");
    }
  };

  const copyOutput = async () => {
    if (!output) return;

    await navigator.clipboard.writeText(output);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1400);
  };

  const loadExample = () => {
    setComposeText(sampleCompose);
    setOutputMode("summary");
    setParseMode("balanced");
    setGraphDirection("LR");
    setIncludeLinks(true);
    setIncludeEnvHints(true);
    setWarnMissingDependsOn(true);
    setWarnLinksUsage(true);
    setWarnPublicDatabasePorts(true);
    setWarnDependencyCycles(true);
    clearResult();
  };

  const resetAll = () => {
    setComposeText("");
    setOutputMode("summary");
    setParseMode("balanced");
    setGraphDirection("LR");
    setIncludeLinks(true);
    setIncludeEnvHints(true);
    setWarnMissingDependsOn(true);
    setWarnLinksUsage(true);
    setWarnPublicDatabasePorts(true);
    setWarnDependencyCycles(true);
    clearResult();
  };

  return (
    <ToolShell
      title="Docker Compose Service Dependency Visualizer"
      description="Visualize Docker Compose service dependencies from pasted compose YAML. Extract services, depends_on, links, ports, networks, and generate Mermaid graphs, summaries, JSON, Markdown, CSV, and checklists."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900">
              Docker Compose YAML
            </label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Paste a full docker-compose.yml file or just the services block.
            </p>
          </div>

          <textarea
            value={composeText}
            onChange={(event) => {
              setComposeText(event.target.value);
              clearResult();
            }}
            placeholder={sampleCompose}
            spellCheck={false}
            className="w-full min-h-[500px] rounded-xl border border-gray-300 p-4 text-sm leading-6 font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Graph Settings</h3>

          <div className="mt-4 space-y-4">
            <YoryantraSelect
              label="Output"
              value={outputMode}
              onChange={(value) => {
                setOutputMode(value as OutputMode);
                clearResult();
              }}
              options={[
                { label: "Readable summary", value: "summary" },
                { label: "Mermaid graph", value: "mermaid" },
                { label: "JSON", value: "json" },
                { label: "Markdown table", value: "markdown" },
                { label: "CSV", value: "csv" },
                { label: "Review checklist", value: "checklist" },
              ]}
            />

            <YoryantraSelect
              label="Parse Mode"
              value={parseMode}
              onChange={(value) => {
                setParseMode(value as ParseMode);
                clearResult();
              }}
              options={[
                { label: "Balanced", value: "balanced" },
                { label: "Strict indentation", value: "strict" },
                { label: "Loose route-style parsing", value: "loose" },
              ]}
            />

            <YoryantraSelect
              label="Graph Direction"
              value={graphDirection}
              onChange={(value) => {
                setGraphDirection(value as GraphDirection);
                clearResult();
              }}
              options={[
                { label: "Left to right", value: "LR" },
                { label: "Top down", value: "TD" },
              ]}
            />

            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
              <p className="text-sm font-medium text-gray-700">Extracted from</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {["services", "depends_on", "links", "ports", "networks", "environment"].map((item) => (
                  <span key={item} className="rounded-full border border-gray-200 bg-white px-2.5 py-1 font-mono text-xs text-gray-500">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Checks</h3>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <CheckboxRow checked={includeLinks} label="Include legacy links as dependency edges" onChange={(checked) => { setIncludeLinks(checked); clearResult(); }} />
          <CheckboxRow checked={includeEnvHints} label="Infer dependency hints from environment URLs" onChange={(checked) => { setIncludeEnvHints(checked); clearResult(); }} />
          <CheckboxRow checked={warnMissingDependsOn} label="Warn when environment hints are missing depends_on" onChange={(checked) => { setWarnMissingDependsOn(checked); clearResult(); }} />
          <CheckboxRow checked={warnLinksUsage} label="Warn when links is used" onChange={(checked) => { setWarnLinksUsage(checked); clearResult(); }} />
          <CheckboxRow checked={warnPublicDatabasePorts} label="Warn about publicly mapped database/cache ports" onChange={(checked) => { setWarnPublicDatabasePorts(checked); clearResult(); }} />
          <CheckboxRow checked={warnDependencyCycles} label="Warn about dependency cycles" onChange={(checked) => { setWarnDependencyCycles(checked); clearResult(); }} />
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          This tool uses practical text parsing for common Compose files. It does not run Docker or validate against every Compose schema detail.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={visualizeDependencies} className="yoryantra-btn">
          Visualize Dependencies
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
          <SummaryCard label="Services" value={result.serviceCount.toLocaleString()} />
          <SummaryCard label="Dependencies" value={result.dependencyCount.toLocaleString()} />
          <SummaryCard label="Ports" value={result.portCount.toLocaleString()} />
          <SummaryCard label="Networks" value={result.networkCount.toLocaleString()} />
        </div>
      )}

      {result && result.services.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Service Dependency Table</h3>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Service</th>
                  <th className="px-4 py-3 font-semibold">Image / Build</th>
                  <th className="px-4 py-3 font-semibold">Depends On</th>
                  <th className="px-4 py-3 font-semibold">Ports</th>
                  <th className="px-4 py-3 font-semibold">Networks</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {result.services.map((service) => (
                  <tr key={service.name}>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-900">{service.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{service.image || service.build || "-"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{service.dependsOn.join(", ") || "-"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{service.ports.join(", ") || "-"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{service.networks.join(", ") || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result && result.issues.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">Compose findings</h3>

          <div className="mt-3 space-y-3">
            {result.issues.map((issue, index) => (
              <div key={`${issue.title}-${index}`}>
                <p className="text-sm font-semibold text-amber-900">{issue.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-amber-800">{issue.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900">Compose dependency guidance</h3>

          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-blue-900">{note.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-blue-800">{note.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Output</h3>

          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[360px] whitespace-pre-wrap break-words">
          {output || "Dependency graph output will appear here."}
        </pre>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Visualizing Docker Compose Service Dependencies</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Docker Compose files can grow quickly. Once services depend on databases, queues, workers, cache services, and internal networks, it becomes harder to understand startup order and service relationships by reading YAML alone.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Docker Compose Service Dependency Visualizer extracts services, depends_on entries, legacy links, ports, networks, and environment-based hints, then turns them into summaries, Mermaid graphs, JSON, Markdown, CSV, or review checklists.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Using the Compose Dependency Visualizer</h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste a full docker-compose.yml file or just the services section.</li>
            <li>Choose the output format and graph direction.</li>
            <li>Enable dependency hints from links or environment URLs if useful.</li>
            <li>Review extracted services, dependencies, ports, and warnings.</li>
            <li>Copy the summary, Mermaid graph, JSON, Markdown, CSV, or checklist output.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What This Tool Looks For</h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li><strong>services</strong> that define containers in the Compose file.</li>
            <li><strong>depends_on</strong> relationships between services.</li>
            <li><strong>links</strong> as older-style dependency hints.</li>
            <li><strong>ports</strong> that expose service ports to the host.</li>
            <li><strong>networks</strong> used by each service.</li>
            <li><strong>environment URLs</strong> that mention another service name.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example Mermaid Graph</h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`graph LR
  app --> db
  app --> redis
  worker --> redis`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">depends_on Does Not Mean Ready</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            In Compose, dependency order does not always mean the database, cache, or service is fully ready to accept traffic. Apps should still handle retries, connection delays, and readiness checks.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Use this visualizer to understand relationships, then confirm runtime behavior with logs, health checks, and real startup tests.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>

          <div className="mt-5 space-y-6">
            <Faq title="What does a Docker Compose dependency visualizer do?">
              It extracts Compose services and dependencies so you can understand relationships between app, database, cache, worker, and other services.
            </Faq>

            <Faq title="Does this run Docker Compose?">
              No. It only analyzes pasted YAML text in your browser.
            </Faq>

            <Faq title="Can it generate Mermaid diagrams?">
              Yes. Choose Mermaid graph output and paste the result into a Markdown tool that supports Mermaid.
            </Faq>

            <Faq title="Does depends_on wait for the service to be ready?">
              Not always. Startup order and readiness are different. Use health checks and app retries when needed.
            </Faq>

            <Faq title="Is anything uploaded when I visualize dependencies?">
              No. Parsing runs directly in your browser.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/docker-compose-validator" className="yoryantra-btn-outline">Docker Compose Validator</Link>
            <Link href="/tools/docker-compose-ports-checker" className="yoryantra-btn-outline">Docker Compose Ports Checker</Link>
            <Link href="/tools/dockerfile-instruction-explainer" className="yoryantra-btn-outline">Dockerfile Instruction Explainer</Link>
            <Link href="/tools/docker-env-checker" className="yoryantra-btn-outline">Docker Env Checker</Link>
            <Link href="/tools/yaml-validator" className="yoryantra-btn-outline">YAML Validator</Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function CheckboxRow({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[var(--light-gold)]"
      />
      {label}
    </label>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function Faq({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600 leading-relaxed">{children}</p>
    </div>
  );
}

function buildResult(options: {
  composeText: string;
  outputMode: OutputMode;
  parseMode: ParseMode;
  graphDirection: GraphDirection;
  includeLinks: boolean;
  includeEnvHints: boolean;
  warnMissingDependsOn: boolean;
  warnLinksUsage: boolean;
  warnPublicDatabasePorts: boolean;
  warnDependencyCycles: boolean;
}): Result {
  const services = parseServices(options.composeText, options.parseMode);
  const edges = buildEdges(services, options.includeLinks, options.includeEnvHints);
  const issues = buildIssues(services, edges, options);
  const networks = new Set(services.flatMap((service) => service.networks));
  const base = {
    services,
    edges,
    issues,
    serviceCount: services.length,
    dependencyCount: edges.length,
    portCount: services.reduce((total, service) => total + service.ports.length, 0),
    networkCount: networks.size,
  };
  const output = formatOutput(base, options.outputMode, options.graphDirection);

  return {
    ...base,
    output,
  };
}

function parseServices(text: string, parseMode: ParseMode) {
  const lines = text.split(/\r?\n/);
  const services: ComposeService[] = [];
  const serviceIndent = findServiceIndent(lines);
  let current: ComposeService | null = null;
  let activeKey = "";

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const raw = line.replace(/\t/g, "  ");
    const trimmed = raw.trim();

    if (!trimmed || trimmed.startsWith("#")) return;

    const indent = raw.length - raw.trimStart().length;
    const serviceMatch = raw.match(new RegExp(`^\\\\s{${serviceIndent}}([A-Za-z0-9._-]+):\\\\s*$`));

    if (serviceMatch && !["services", "networks", "volumes", "configs", "secrets"].includes(serviceMatch[1])) {
      current = {
        name: serviceMatch[1],
        image: "",
        build: "",
        dependsOn: [],
        links: [],
        networks: [],
        ports: [],
        environment: [],
        lineNumber,
      };
      services.push(current);
      activeKey = "";
      return;
    }

    if (!current || indent <= serviceIndent) return;

    const keyMatch = trimmed.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);

    if (keyMatch) {
      const key = keyMatch[1];
      const value = stripQuotes(keyMatch[2].trim());
      activeKey = key;

      if (key === "image") current.image = value;
      else if (key === "build") current.build = value || ".";
      else if (key === "depends_on" && value) current.dependsOn.push(...splitInlineList(value));
      else if (key === "links" && value) current.links.push(...splitInlineList(value));
      else if (key === "networks" && value) current.networks.push(...splitInlineList(value));
      else if (key === "ports" && value) current.ports.push(...splitInlineList(value));
      else if (key === "environment" && value) current.environment.push(value);

      return;
    }

    const listMatch = trimmed.match(/^-\s*(.+)$/);

    if (listMatch) {
      const value = stripQuotes(listMatch[1].trim());

      if (activeKey === "depends_on") current.dependsOn.push(cleanDependencyName(value));
      else if (activeKey === "links") current.links.push(cleanDependencyName(value));
      else if (activeKey === "networks") current.networks.push(cleanDependencyName(value));
      else if (activeKey === "ports") current.ports.push(value);
      else if (activeKey === "environment") current.environment.push(value);
      return;
    }

    if (activeKey === "environment" && trimmed.includes(":")) {
      current.environment.push(trimmed);
    }
  });

  return parseMode === "strict" ? services.filter((service) => service.name) : services;
}

function findServiceIndent(lines: string[]) {
  const servicesLine = lines.findIndex((line) => /^\s*services:\s*$/.test(line));

  if (servicesLine === -1) return 2;

  for (let index = servicesLine + 1; index < lines.length; index += 1) {
    const match = lines[index].match(/^(\s+)[A-Za-z0-9._-]+:\s*$/);

    if (match) return match[1].length;
  }

  return 2;
}

function buildEdges(services: ComposeService[], includeLinks: boolean, includeEnvHints: boolean) {
  const serviceNames = new Set(services.map((service) => service.name));
  const edges: DependencyEdge[] = [];

  services.forEach((service) => {
    service.dependsOn.forEach((dependency) => {
      if (dependency && serviceNames.has(dependency)) {
        edges.push({ from: service.name, to: dependency, type: "depends_on" });
      }
    });

    if (includeLinks) {
      service.links.forEach((dependency) => {
        if (dependency && serviceNames.has(dependency)) {
          edges.push({ from: service.name, to: dependency, type: "links" });
        }
      });
    }

    if (includeEnvHints) {
      service.environment.forEach((envValue) => {
        serviceNames.forEach((candidate) => {
          if (candidate !== service.name && new RegExp(`(^|[^A-Za-z0-9_-])${escapeRegExp(candidate)}([^A-Za-z0-9_-]|$)`).test(envValue)) {
            const exists = edges.some((edge) => edge.from === service.name && edge.to === candidate);
            if (!exists) edges.push({ from: service.name, to: candidate, type: "env_hint" });
          }
        });
      });
    }
  });

  return edges;
}

function buildIssues(services: ComposeService[], edges: DependencyEdge[], options: {
  warnMissingDependsOn: boolean;
  warnLinksUsage: boolean;
  warnPublicDatabasePorts: boolean;
  warnDependencyCycles: boolean;
}) {
  const issues: Issue[] = [];

  if (services.length === 0) {
    issues.push({
      severity: "warning",
      title: "No services found",
      message: "No Docker Compose services were found. Paste a services block or full compose file.",
    });
  }

  if (options.warnLinksUsage && services.some((service) => service.links.length > 0)) {
    issues.push({
      severity: "info",
      title: "links found",
      message: "links is older Compose style. Most projects can use service names on shared networks instead.",
    });
  }

  if (options.warnMissingDependsOn) {
    const hinted = edges.filter((edge) => edge.type === "env_hint");
    if (hinted.length > 0) {
      issues.push({
        severity: "info",
        title: "Environment dependency hints found",
        message: "Some dependencies were inferred from environment values. Confirm whether depends_on or startup retry logic is needed.",
      });
    }
  }

  if (options.warnPublicDatabasePorts) {
    const risky = services.filter((service) =>
      /(postgres|mysql|mariadb|mongo|redis|db|database|cache)/i.test(`${service.name} ${service.image}`) &&
      service.ports.some((port) => port.includes(":"))
    );

    if (risky.length > 0) {
      issues.push({
        severity: "warning",
        title: "Database or cache ports mapped to host",
        message: `These services expose ports to the host: ${risky.map((service) => service.name).join(", ")}. Confirm this is intentional.`,
      });
    }
  }

  if (options.warnDependencyCycles && hasCycle(services.map((service) => service.name), edges)) {
    issues.push({
      severity: "warning",
      title: "Possible dependency cycle",
      message: "A service dependency cycle was detected. Cycles can make startup order harder to reason about.",
    });
  }

  if (issues.length === 0) {
    issues.push({
      severity: "info",
      title: "Compose dependencies parsed",
      message: "No obvious dependency warning was found from the enabled checks.",
    });
  }

  return issues;
}

function hasCycle(nodes: string[], edges: DependencyEdge[]) {
  const graph = new Map<string, string[]>();

  nodes.forEach((node) => graph.set(node, []));
  edges.forEach((edge) => {
    graph.get(edge.from)?.push(edge.to);
  });

  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (node: string): boolean => {
    if (visiting.has(node)) return true;
    if (visited.has(node)) return false;

    visiting.add(node);

    for (const next of graph.get(node) || []) {
      if (visit(next)) return true;
    }

    visiting.delete(node);
    visited.add(node);
    return false;
  };

  return nodes.some((node) => visit(node));
}

function formatOutput(result: Omit<Result, "output">, mode: OutputMode, direction: GraphDirection) {
  if (mode === "json") {
    return JSON.stringify(result, null, 2);
  }

  if (mode === "mermaid") {
    return [
      `graph ${direction}`,
      ...result.edges.map((edge) => `  ${safeMermaid(edge.from)} -->|${edge.type}| ${safeMermaid(edge.to)}`),
      ...(result.edges.length === 0 ? result.services.map((service) => `  ${safeMermaid(service.name)}`) : []),
    ].join("\n");
  }

  if (mode === "markdown") {
    return [
      "| Service | Image / Build | Depends On | Ports | Networks |",
      "| --- | --- | --- | --- | --- |",
      ...result.services.map((service) => `| ${service.name} | ${escapeMarkdown(service.image || service.build || "-")} | ${service.dependsOn.join(", ") || "-"} | ${escapeMarkdown(service.ports.join(", ") || "-")} | ${service.networks.join(", ") || "-"} |`),
      "",
      "## Findings",
      ...result.issues.map((issue) => `- **${issue.title}:** ${issue.message}`),
    ].join("\n");
  }

  if (mode === "csv") {
    const rows = [
      ["service", "image_or_build", "depends_on", "links", "ports", "networks"],
      ...result.services.map((service) => [
        service.name,
        service.image || service.build,
        service.dependsOn.join("; "),
        service.links.join("; "),
        service.ports.join("; "),
        service.networks.join("; "),
      ]),
    ];

    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }

  if (mode === "checklist") {
    return [
      "Docker Compose Dependency Review Checklist",
      "------------------------------------------",
      "- [ ] Confirm every app service can retry database/cache connections.",
      "- [ ] Confirm depends_on is used only for startup order, not readiness assumptions.",
      "- [ ] Confirm host port mappings are needed and safe.",
      "- [ ] Confirm database and cache services are not exposed publicly by accident.",
      "- [ ] Confirm services share the networks they need.",
      "- [ ] Confirm health checks exist where readiness matters.",
      "",
      "Findings:",
      ...result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
    ].join("\n");
  }

  return [
    "Docker Compose Service Dependency Summary",
    "-----------------------------------------",
    `Services: ${result.serviceCount}`,
    `Dependencies: ${result.dependencyCount}`,
    `Ports: ${result.portCount}`,
    `Networks: ${result.networkCount}`,
    "",
    "Services:",
    ...result.services.map((service) => `- ${service.name}: depends on ${service.dependsOn.join(", ") || "none"}; ports ${service.ports.join(", ") || "none"}`),
    "",
    "Edges:",
    ...(result.edges.length ? result.edges.map((edge) => `- ${edge.from} -> ${edge.to} (${edge.type})`) : ["- none"]),
    "",
    "Findings:",
    ...result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
  ].join("\n");
}

function splitInlineList(value: string) {
  const clean = value.replace(/^\[|\]$/g, "").trim();
  if (!clean) return [];
  return clean.split(",").map((item) => cleanDependencyName(item.trim())).filter(Boolean);
}

function cleanDependencyName(value: string) {
  return stripQuotes(value.split(":")[0].trim());
}

function stripQuotes(value: string) {
  return value.replace(/^["']|["']$/g, "");
}

function safeMermaid(value: string) {
  return value.replace(/[^A-Za-z0-9_]/g, "_");
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, "\\n");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getNotes(result: Result) {
  const notes: { title: string; message: string }[] = [];

  if (result.edges.length > 0) {
    notes.push({
      title: "Dependencies are not readiness checks",
      message: "depends_on can help order startup, but apps still need retries or health checks when databases and caches take time to become ready.",
    });
  }

  if (result.portCount > 0) {
    notes.push({
      title: "Review host port mappings",
      message: "A port mapping like 5432:5432 exposes the service on the host. Keep only the mappings you actually need.",
    });
  }

  notes.push({
    title: "Networks shape service reachability",
    message: "Services can usually reach each other by service name when they share a Compose network.",
  });

  return notes;
}
