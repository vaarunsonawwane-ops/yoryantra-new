"use client";

import { useMemo, useState } from "react";
import { parseDocument } from "yaml";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "summary" | "mermaid" | "json" | "markdown" | "csv" | "checklist";
type ParseMode = "balanced" | "strict" | "loose";
type GraphDirection = "TD" | "LR";

type ComposeDependency = {
  name: string;
  condition: "service_started" | "service_healthy" | "service_completed_successfully" | string;
  required: boolean;
  restart: boolean;
};

type ComposeService = {
  name: string;
  image: string;
  build: string;
  dependsOn: string[];
  dependencies: ComposeDependency[];
  links: string[];
  namespaceRefs: string[];
  networks: string[];
  ports: string[];
  environment: string[];
  hasHealthcheck: boolean;
};

type DependencyEdge = {
  from: string;
  to: string;
  type: "depends_on" | "links" | "namespace_ref" | "env_hint";
  detail: string;
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
      db:
        condition: service_healthy
      redis:
        condition: service_started
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
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
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
      description="Map Compose service relationships while separating startup dependencies from network and environment hints."
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
                { label: "Full file or services block", value: "balanced" },
                { label: "Require top-level services", value: "strict" },
                { label: "Treat root as services block", value: "loose" },
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
                {["services", "depends_on", "namespace refs", "links", "ports", "networks", "environment"].map((item) => (
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
          <CheckboxRow checked={warnMissingDependsOn} label="Flag environment host hints without explicit depends_on" onChange={(checked) => { setWarnMissingDependsOn(checked); clearResult(); }} />
          <CheckboxRow checked={warnLinksUsage} label="Warn when links is used" onChange={(checked) => { setWarnLinksUsage(checked); clearResult(); }} />
          <CheckboxRow checked={warnPublicDatabasePorts} label="Warn about publicly mapped database/cache ports" onChange={(checked) => { setWarnPublicDatabasePorts(checked); clearResult(); }} />
          <CheckboxRow checked={warnDependencyCycles} label="Warn about dependency cycles" onChange={(checked) => { setWarnDependencyCycles(checked); clearResult(); }} />
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          YAML is parsed structurally in the browser. Compose interpolation, profiles, extends, include files, and runtime resolution are not executed here.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={visualizeDependencies} className="yoryantra-btn min-h-[44px] whitespace-nowrap">
          Visualize Dependencies
        </button>

        <button onClick={copyOutput} className="yoryantra-btn min-h-[44px] whitespace-nowrap" disabled={!output}>
          {copied ? "Copied" : "Copy Output"}
        </button>

        <button onClick={loadExample} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap">
          Load Example
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap">
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
        <div className="mt-6 grid items-start gap-3 md:grid-cols-2">
          {result.issues.map((issue, index) => {
            const classes = issueClassNames(issue.severity);
            return (
              <div key={`${issue.title}-${index}`} className={`${classes.card} self-start rounded-xl border p-4`}>
                <p className={`text-sm font-semibold ${classes.title}`}>{issue.title}</p>
                <p className={`mt-1 text-sm leading-relaxed ${classes.body}`}>{issue.message}</p>
              </div>
            );
          })}
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Compose dependency guidance</h3>

          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-gray-900">{note.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{note.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Output</h3>

          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[360px] whitespace-pre-wrap break-words">
          {output || "Dependency graph output will appear here."}
        </pre>
      </div>

      <div className="mt-5 self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
        Compose text is parsed in your browser. Nothing is sent to Docker, a registry, or a Yoryantra server by this page.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Read the graph as several different kinds of relationship</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A Compose file can describe startup ordering, shared namespaces, published ports, network membership, and application-level connection strings. Those signals are related, but they do not mean the same thing. The graph keeps formal <code className="font-mono">depends_on</code> edges separate from legacy links, service namespace references, and environment-derived hints.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            That distinction matters when debugging startup problems. A database hostname inside <code className="font-mono">DATABASE_URL</code> suggests an application connection, but it does not create Compose startup ordering by itself.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What Compose actually guarantees for depends_on</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Short-form <code className="font-mono">depends_on</code> establishes dependency order, but it does not wait for a service to become healthy. Long syntax can require <code className="font-mono">service_healthy</code> or <code className="font-mono">service_completed_successfully</code>. The parser preserves those conditions so a graph does not flatten every dependency into the same promise.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Application retries still matter. Even a well-ordered container startup is not a substitute for handling delayed network availability, database recovery, or an unhealthy dependency.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Signals that are informative rather than authoritative</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-600 leading-relaxed">
            <li><strong>Environment hints:</strong> service names found inside values such as database or Redis URLs are inferred application relationships.</li>
            <li><strong>links:</strong> these can express service reachability aliases, but modern Compose networking normally makes explicit links unnecessary.</li>
            <li><strong>network_mode / ipc / pid service references:</strong> these share another service&apos;s namespace and are shown separately from startup dependencies.</li>
            <li><strong>ports:</strong> entries under <code className="font-mono">ports</code> publish container ports to the host; they are not service-to-service dependency declarations.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Where this browser analysis stops</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The YAML document is parsed, but Compose interpolation, profile activation, <code className="font-mono">extends</code>, external include files, image metadata, and live container state are not resolved. Treat the graph as a structural reading of the pasted document, then confirm runtime behavior with <code className="font-mono">docker compose config</code>, health status, and logs.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Docker&apos;s Compose service reference is the useful authority for <code className="font-mono">depends_on</code> conditions and service-level networking behavior: <a className="font-medium text-[var(--green)] underline underline-offset-2" href="https://docs.docker.com/reference/compose-file/services/" target="_blank" rel="noreferrer">Docker Compose services reference</a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Mermaid output is intentionally presentation-only</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Mermaid output gives every service a generated node identifier and keeps the original service name as a quoted label. This avoids collisions when names contain punctuation and prevents a service name from being interpreted as Mermaid syntax.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/docker-compose-service-dependency-visualizer" />
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
  const networks = new Set(services.reduce<string[]>((all, service) => all.concat(service.networks), []));
  const base = {
    services,
    edges,
    issues,
    serviceCount: services.length,
    dependencyCount: edges.filter((edge) => edge.type === "depends_on").length,
    portCount: services.reduce((total, service) => total + service.ports.length, 0),
    networkCount: networks.size,
  };

  return {
    ...base,
    output: formatOutput(base, options.outputMode, options.graphDirection),
  };
}

function parseServices(text: string, parseMode: ParseMode): ComposeService[] {
  const document = parseDocument(text, { prettyErrors: true });
  if (document.errors.length > 0) {
    throw new Error(document.errors.map((item) => item.message).join("\n"));
  }

  let root: unknown;
  try {
    root = document.toJS({ maxAliasCount: 100 });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Unable to expand this YAML document safely.");
  }

  if (!isRecord(root)) {
    throw new Error("Compose input must be a YAML mapping.");
  }

  let serviceRoot: Record<string, unknown>;
  if (parseMode === "loose") {
    serviceRoot = isRecord(root.services) ? root.services : root;
  } else if (isRecord(root.services)) {
    serviceRoot = root.services;
  } else if (parseMode === "strict") {
    throw new Error("Strict mode requires a top-level services mapping.");
  } else {
    serviceRoot = root;
  }

  const services: ComposeService[] = [];
  for (const [name, rawService] of Object.entries(serviceRoot)) {
    if (["version", "name", "networks", "volumes", "configs", "secrets", "include"].includes(name)) {
      continue;
    }

    if (!isRecord(rawService)) {
      if (parseMode === "strict") {
        throw new Error(`Service ${name} must be a mapping.`);
      }
      continue;
    }

    const dependencies = parseDependsOn(rawService.depends_on);
    const networks = parseNames(rawService.networks);
    const networkMode = scalarText(rawService.network_mode);
    const namespaceRefs = [networkMode, scalarText(rawService.ipc), scalarText(rawService.pid)]
      .map(extractServiceReference)
      .filter((value): value is string => Boolean(value));

    services.push({
      name,
      image: scalarText(rawService.image),
      build: formatBuild(rawService.build),
      dependsOn: dependencies.map((item) => item.name),
      dependencies,
      links: parseNames(rawService.links).map((item) => item.split(":")[0]),
      namespaceRefs,
      networks: networks.length > 0 || networkMode ? networks : ["default"],
      ports: parsePorts(rawService.ports),
      environment: parseEnvironment(rawService.environment),
      hasHealthcheck: isRecord(rawService.healthcheck) && rawService.healthcheck.disable !== true,
    });
  }

  if (services.length === 0) {
    throw new Error("No Compose services were found in this YAML mapping.");
  }

  return services;
}

function parseDependsOn(value: unknown): ComposeDependency[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => scalarText(item))
      .filter(Boolean)
      .map((name) => ({ name, condition: "service_started", required: true, restart: false }));
  }

  if (!isRecord(value)) return [];
  return Object.entries(value).map(([name, config]) => {
    if (!isRecord(config)) {
      return { name, condition: "service_started", required: true, restart: false };
    }
    return {
      name,
      condition: scalarText(config.condition) || "service_started",
      required: config.required !== false,
      restart: config.restart === true,
    };
  });
}

function parseNames(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(scalarText).filter(Boolean);
  if (isRecord(value)) return Object.keys(value);
  const single = scalarText(value);
  return single ? [single] : [];
}

function parsePorts(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => {
    if (!isRecord(entry)) return scalarText(entry);
    const target = scalarText(entry.target);
    const published = scalarText(entry.published);
    const hostIp = scalarText(entry.host_ip);
    const protocol = scalarText(entry.protocol) || "tcp";
    const binding = [hostIp, published, target].filter(Boolean).join(":");
    return binding ? `${binding}/${protocol}` : JSON.stringify(entry);
  }).filter(Boolean);
}

function parseEnvironment(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(scalarText).filter(Boolean);
  if (!isRecord(value)) return [];
  return Object.entries(value).map(([key, item]) => `${key}=${scalarText(item)}`);
}

function formatBuild(value: unknown): string {
  if (typeof value === "string") return value;
  if (!isRecord(value)) return "";
  const context = scalarText(value.context) || ".";
  const dockerfile = scalarText(value.dockerfile);
  const target = scalarText(value.target);
  return [context, dockerfile ? `dockerfile=${dockerfile}` : "", target ? `target=${target}` : ""].filter(Boolean).join("; ");
}

function buildEdges(services: ComposeService[], includeLinks: boolean, includeEnvHints: boolean): DependencyEdge[] {
  const names = new Set(services.map((service) => service.name));
  const edges: DependencyEdge[] = [];
  const add = (edge: DependencyEdge) => {
    if (!names.has(edge.to) || edge.from === edge.to) return;
    if (!edges.some((item) => item.from === edge.from && item.to === edge.to && item.type === edge.type)) edges.push(edge);
  };

  services.forEach((service) => {
    service.dependencies.forEach((dependency) => add({
      from: service.name,
      to: dependency.name,
      type: "depends_on",
      detail: dependency.condition,
    }));

    service.namespaceRefs.forEach((dependency) => add({
      from: service.name,
      to: dependency,
      type: "namespace_ref",
      detail: "service namespace",
    }));

    if (includeLinks) {
      service.links.forEach((dependency) => add({ from: service.name, to: dependency, type: "links", detail: "link" }));
    }

    if (includeEnvHints) {
      service.environment.forEach((environmentValue) => {
        services.forEach((candidate) => {
          if (candidate.name === service.name) return;
          const pattern = new RegExp(`(^|[^A-Za-z0-9_-])${escapeRegExp(candidate.name)}([^A-Za-z0-9_-]|$)`);
          if (pattern.test(environmentValue)) {
            add({ from: service.name, to: candidate.name, type: "env_hint", detail: "environment hint" });
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
}): Issue[] {
  const issues: Issue[] = [];
  const serviceNames = new Set(services.map((service) => service.name));
  const missingRequired = services.reduce<string[]>((all, service) => all.concat(service.dependencies.filter((dependency) => dependency.required && !serviceNames.has(dependency.name)).map((dependency) => `${service.name} → ${dependency.name}`)), []);
  const missingOptional = services.reduce<string[]>((all, service) => all.concat(service.dependencies.filter((dependency) => !dependency.required && !serviceNames.has(dependency.name)).map((dependency) => `${service.name} → ${dependency.name}`)), []);
  if (missingRequired.length > 0) {
    issues.push({ severity: "high", title: "Required depends_on targets are missing", message: missingRequired.join(", ") });
  }
  if (missingOptional.length > 0) {
    issues.push({ severity: "info", title: "Optional depends_on targets are absent", message: `${missingOptional.join(", ")}. These entries use required: false, so Compose treats absence differently from a required dependency.` });
  }

  const unhealthy = services.reduce<string[]>((all, service) => all.concat(service.dependencies.filter((dependency) => dependency.condition === "service_healthy").filter((dependency) => {
    const target = services.find((candidate) => candidate.name === dependency.name);
    return Boolean(target && !target.hasHealthcheck);
  }).map((dependency) => `${service.name} → ${dependency.name}`)), []);
  if (unhealthy.length > 0) {
    issues.push({ severity: "info", title: "service_healthy with no Compose-declared healthcheck", message: `No healthcheck is declared for these dependency services in the pasted Compose file: ${unhealthy.join(", ")}. The referenced image may still define one, which this page cannot inspect.` });
  }

  if (options.warnLinksUsage && services.some((service) => service.links.length > 0)) {
    issues.push({ severity: "info", title: "links entries found", message: "Links can add aliases, but services on a shared Compose network can normally reach each other by service name without links." });
  }

  if (options.warnMissingDependsOn) {
    const hints = edges.filter((edge) => edge.type === "env_hint" && !edges.some((candidate) => candidate.from === edge.from && candidate.to === edge.to && candidate.type === "depends_on"));
    if (hints.length > 0) {
      issues.push({ severity: "info", title: "Connection hints without startup ordering", message: `${hints.map((edge) => `${edge.from} → ${edge.to}`).join(", ")}. This may be intentional: depends_on controls dependency order, not ordinary network reachability.` });
    }
  }

  if (options.warnPublicDatabasePorts) {
    const published = services.filter((service) => /(postgres|mysql|mariadb|mongo|redis|db|database|cache)/i.test(`${service.name} ${service.image}`) && service.ports.length > 0);
    if (published.length > 0) {
      issues.push({ severity: "warning", title: "Database or cache ports are published to the host", message: `Review whether host publication is required for: ${published.map((service) => service.name).join(", ")}. Internal Compose traffic usually does not need a host port.` });
    }
  }

  if (options.warnDependencyCycles && hasCycle(services.map((service) => service.name), edges.filter((edge) => edge.type === "depends_on"))) {
    issues.push({ severity: "warning", title: "depends_on cycle found", message: "Formal dependency edges form a cycle. Review the startup design rather than treating the graph as a simple topological order." });
  }

  if (issues.length === 0) {
    issues.push({ severity: "info", title: "No enabled finding triggered", message: "The pasted structure parsed cleanly under the checks you enabled. Runtime readiness and application behavior still need real Compose testing." });
  }
  return issues;
}

function hasCycle(nodes: string[], edges: DependencyEdge[]): boolean {
  const graph = new Map<string, string[]>();
  nodes.forEach((node) => graph.set(node, []));
  edges.forEach((edge) => graph.get(edge.from)?.push(edge.to));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (node: string): boolean => {
    if (visiting.has(node)) return true;
    if (visited.has(node)) return false;
    visiting.add(node);
    for (const next of graph.get(node) || []) if (visit(next)) return true;
    visiting.delete(node);
    visited.add(node);
    return false;
  };
  return nodes.some(visit);
}

function formatOutput(result: Omit<Result, "output">, mode: OutputMode, direction: GraphDirection): string {
  if (mode === "json") return JSON.stringify(result, null, 2);
  if (mode === "mermaid") {
    const ids = new Map(result.services.map((service, index) => [service.name, `s${index + 1}`]));
    const nodes = result.services.map((service) => `  ${ids.get(service.name)}["${escapeMermaidLabel(service.name)}"]`);
    const edges = result.edges.map((edge) => `  ${ids.get(edge.from)} -->|${escapeMermaidLabel(edge.type)}| ${ids.get(edge.to)}`);
    return [`graph ${direction}`, ...nodes, ...edges].join("\n");
  }
  if (mode === "markdown") {
    return [
      "| Service | Image / Build | depends_on | Ports | Networks |",
      "| --- | --- | --- | --- | --- |",
      ...result.services.map((service) => `| ${escapeMarkdown(service.name)} | ${escapeMarkdown(service.image || service.build || "-")} | ${escapeMarkdown(service.dependencies.map((item) => `${item.name} (${item.condition})`).join(", ") || "-")} | ${escapeMarkdown(service.ports.join(", ") || "-")} | ${escapeMarkdown(service.networks.join(", ") || "-")} |`),
      "",
      "## Findings",
      ...result.issues.map((issue) => `- **${escapeMarkdown(issue.title)}:** ${escapeMarkdown(issue.message)}`),
    ].join("\n");
  }
  if (mode === "csv") {
    const rows = [["service", "image_or_build", "depends_on", "links", "namespace_refs", "ports", "networks"], ...result.services.map((service) => [service.name, service.image || service.build, service.dependencies.map((item) => `${item.name}:${item.condition}`).join("; "), service.links.join("; "), service.namespaceRefs.join("; "), service.ports.join("; "), service.networks.join("; ")])];
    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }
  if (mode === "checklist") {
    return [
      "Docker Compose dependency review",
      "--------------------------------",
      "- [ ] Confirm depends_on conditions match the readiness behavior you expect.",
      "- [ ] Confirm applications retry dependency connections after startup.",
      "- [ ] Confirm database/cache host port publication is intentional.",
      "- [ ] Confirm services share the networks required for service-name DNS.",
      "- [ ] Confirm namespace-sharing references are deliberate.",
      "- [ ] Run docker compose config and a real startup test before deployment.",
      "",
      "Findings:",
      ...result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
    ].join("\n");
  }
  return [
    "Docker Compose dependency summary",
    "---------------------------------",
    `Services: ${result.serviceCount}`,
    `Formal depends_on edges: ${result.dependencyCount}`,
    `Published port entries: ${result.portCount}`,
    `Networks represented: ${result.networkCount}`,
    "",
    "Relationships:",
    ...(result.edges.length > 0 ? result.edges.map((edge) => `- ${edge.from} -> ${edge.to} (${edge.type}${edge.detail ? `; ${edge.detail}` : ""})`) : ["- none"]),
    "",
    "Findings:",
    ...result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
  ].join("\n");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function scalarText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function extractServiceReference(value: string): string | null {
  const match = value.match(/^service:(.+)$/);
  return match ? match[1] : null;
}

function csvEscape(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function escapeMarkdown(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\r?\n/g, "\\n");
}

function escapeMermaidLabel(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r?\n/g, " ");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function issueClassNames(severity: Issue["severity"]): { card: string; title: string; body: string } {
  if (severity === "high") return { card: "border-red-200 bg-red-50", title: "text-red-900", body: "text-red-800" };
  if (severity === "warning") return { card: "border-amber-200 bg-amber-50", title: "text-amber-900", body: "text-amber-800" };
  return { card: "border-gray-200 bg-gray-50", title: "text-gray-900", body: "text-gray-600" };
}

function getNotes(result: Result): { title: string; message: string }[] {
  const notes: { title: string; message: string }[] = [];
  const healthyDependencies = result.services.reduce<ComposeDependency[]>((all, service) => all.concat(service.dependencies), []).filter((dependency) => dependency.condition === "service_healthy").length;
  if (healthyDependencies > 0) notes.push({ title: "Health-gated dependencies are visible", message: `${healthyDependencies} dependency edge(s) use service_healthy, which is stronger than short-form startup ordering.` });
  if (result.services.some((service) => service.networks.includes("default"))) notes.push({ title: "Implicit default network represented", message: "A service without explicit networks is shown on Compose's implicit default network unless it uses another network mode." });
  if (result.edges.some((edge) => edge.type === "env_hint")) notes.push({ title: "Environment edges are inferred", message: "Environment-based edges are text hints only. They do not prove reachability, startup order, or a successful connection." });
  return notes;
}

