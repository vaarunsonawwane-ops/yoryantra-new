"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "summary" | "table" | "json" | "markdown" | "csv" | "checklist";
type DetailLevel = "compact" | "balanced" | "detailed";
type ResourceFilter = "all" | "workloads" | "networking" | "config" | "security";

type KubeResource = {
  documentIndex: number;
  kind: string;
  name: string;
  namespace: string;
  apiVersion: string;
  replicas: string;
  images: string[];
  ports: string[];
  hosts: string[];
  labels: string[];
  notes: string[];
};

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type Result = {
  resources: KubeResource[];
  issues: Issue[];
  output: string;
  resourceCount: number;
  namespaceCount: number;
  imageCount: number;
  portCount: number;
};

const sampleYaml = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  namespace: production
  labels:
    app: web
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: web
          image: nginx:1.25
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: web-service
  namespace: production
spec:
  type: ClusterIP
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 80
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
  namespace: production
spec:
  rules:
    - host: app.example.com`;

export default function ToolClient() {
  const [yamlInput, setYamlInput] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [detailLevel, setDetailLevel] = useState<DetailLevel>("balanced");
  const [resourceFilter, setResourceFilter] = useState<ResourceFilter>("all");
  const [warnLatestImages, setWarnLatestImages] = useState(true);
  const [warnMissingNamespace, setWarnMissingNamespace] = useState(true);
  const [warnSecrets, setWarnSecrets] = useState(true);
  const [warnLoadBalancer, setWarnLoadBalancer] = useState(true);
  const [warnMissingReplicas, setWarnMissingReplicas] = useState(true);
  const [warnNoResources, setWarnNoResources] = useState(true);
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

  const summarizeYaml = () => {
    if (!yamlInput.trim()) {
      setError("Please paste Kubernetes YAML manifests.");
      setResult(null);
      setOutput("");
      return;
    }

    const next = buildResult({
      yamlInput,
      outputMode,
      detailLevel,
      resourceFilter,
      warnLatestImages,
      warnMissingNamespace,
      warnSecrets,
      warnLoadBalancer,
      warnMissingReplicas,
      warnNoResources,
    });

    setResult(next);
    setOutput(next.output);
    setError("");
    setCopied(false);
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
    setYamlInput(sampleYaml);
    setOutputMode("summary");
    setDetailLevel("balanced");
    setResourceFilter("all");
    setWarnLatestImages(true);
    setWarnMissingNamespace(true);
    setWarnSecrets(true);
    setWarnLoadBalancer(true);
    setWarnMissingReplicas(true);
    setWarnNoResources(true);
    clearResult();
  };

  const resetAll = () => {
    setYamlInput("");
    setOutputMode("summary");
    setDetailLevel("balanced");
    setResourceFilter("all");
    setWarnLatestImages(true);
    setWarnMissingNamespace(true);
    setWarnSecrets(true);
    setWarnLoadBalancer(true);
    setWarnMissingReplicas(true);
    setWarnNoResources(true);
    clearResult();
  };

  return (
    <ToolShell
      title="Kubernetes YAML Resource Summarizer"
      description="Summarize Kubernetes YAML manifests in your browser. Extract resources, namespaces, images, replicas, ports, services, ingress hosts, config maps, secrets, and review notes."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900">
              Kubernetes YAML
            </label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Paste one or more Kubernetes YAML documents separated by ---.
            </p>
          </div>

          <textarea
            value={yamlInput}
            onChange={(event) => {
              setYamlInput(event.target.value);
              clearResult();
            }}
            placeholder={sampleYaml}
            spellCheck={false}
            className="w-full min-h-[520px] rounded-xl border border-gray-300 p-4 text-sm leading-6 font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Summary Settings</h3>

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
                { label: "Resource table", value: "table" },
                { label: "JSON", value: "json" },
                { label: "Markdown table", value: "markdown" },
                { label: "CSV", value: "csv" },
                { label: "Review checklist", value: "checklist" },
              ]}
            />

            <YoryantraSelect
              label="Detail Level"
              value={detailLevel}
              onChange={(value) => {
                setDetailLevel(value as DetailLevel);
                clearResult();
              }}
              options={[
                { label: "Compact", value: "compact" },
                { label: "Balanced", value: "balanced" },
                { label: "Detailed", value: "detailed" },
              ]}
            />

            <YoryantraSelect
              label="Resource Filter"
              value={resourceFilter}
              onChange={(value) => {
                setResourceFilter(value as ResourceFilter);
                clearResult();
              }}
              options={[
                { label: "All resources", value: "all" },
                { label: "Workloads", value: "workloads" },
                { label: "Networking", value: "networking" },
                { label: "Config", value: "config" },
                { label: "Security", value: "security" },
              ]}
            />

            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
              <p className="text-sm font-medium text-gray-700">Looks for</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {["kind", "metadata", "namespace", "image", "ports", "hosts"].map((item) => (
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
          <CheckboxRow checked={warnLatestImages} label="Warn about latest or untagged images" onChange={(checked) => { setWarnLatestImages(checked); clearResult(); }} />
          <CheckboxRow checked={warnMissingNamespace} label="Warn when namespace is missing" onChange={(checked) => { setWarnMissingNamespace(checked); clearResult(); }} />
          <CheckboxRow checked={warnSecrets} label="Warn when Secret resources are present" onChange={(checked) => { setWarnSecrets(checked); clearResult(); }} />
          <CheckboxRow checked={warnLoadBalancer} label="Warn about LoadBalancer services" onChange={(checked) => { setWarnLoadBalancer(checked); clearResult(); }} />
          <CheckboxRow checked={warnMissingReplicas} label="Warn when deployments do not set replicas" onChange={(checked) => { setWarnMissingReplicas(checked); clearResult(); }} />
          <CheckboxRow checked={warnNoResources} label="Warn when no resources are found" onChange={(checked) => { setWarnNoResources(checked); clearResult(); }} />
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          This tool summarizes manifest text. It does not apply resources, contact a cluster, or validate every Kubernetes schema field.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={summarizeYaml} className="yoryantra-btn">
          Summarize Kubernetes YAML
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
          <SummaryCard label="Resources" value={result.resourceCount.toLocaleString()} />
          <SummaryCard label="Namespaces" value={result.namespaceCount.toLocaleString()} />
          <SummaryCard label="Images" value={result.imageCount.toLocaleString()} />
          <SummaryCard label="Ports" value={result.portCount.toLocaleString()} />
        </div>
      )}

      {result && result.resources.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Resource Summary</h3>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Kind</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Namespace</th>
                  <th className="px-4 py-3 font-semibold">Images</th>
                  <th className="px-4 py-3 font-semibold">Replicas</th>
                  <th className="px-4 py-3 font-semibold">Ports / Hosts</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {result.resources.map((resource) => (
                  <tr key={`${resource.documentIndex}-${resource.kind}-${resource.name}`}>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-900">{resource.kind}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{resource.name || "-"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{resource.namespace || "default/unspecified"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      <span className="block max-w-[280px] break-words">{resource.images.join(", ") || "-"}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{resource.replicas || "-"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      <span className="block max-w-[280px] break-words">{[...resource.ports, ...resource.hosts].join(", ") || "-"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result && result.issues.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">Manifest findings</h3>

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
          <h3 className="text-sm font-semibold text-blue-900">Kubernetes review guidance</h3>

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
          {output || "Kubernetes YAML summary output will appear here."}
        </pre>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Reading Kubernetes YAML Without Getting Lost</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Kubernetes manifests can contain many resources in one file: Deployments, Services, Ingress rules, ConfigMaps, Secrets, Jobs, CronJobs, ServiceAccounts, and more. A quick summary helps you understand what will be created before applying anything.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Kubernetes YAML Resource Summarizer extracts resource names, namespaces, images, replicas, ports, hosts, labels, and review notes directly in your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Using the Kubernetes YAML Resource Summarizer</h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste one or more Kubernetes YAML manifests.</li>
            <li>Choose the detail level, resource filter, and output format.</li>
            <li>Review extracted resources, images, ports, namespaces, and warnings.</li>
            <li>Copy the summary, table, JSON, Markdown, CSV, or checklist output.</li>
            <li>Use the summary for reviews before applying manifests to a cluster.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Common Kubernetes Resources This Tool Summarizes</h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li><strong>Deployments</strong> with images, replicas, labels, and container ports.</li>
            <li><strong>Services</strong> with service types and exposed ports.</li>
            <li><strong>Ingress</strong> resources with hosts and routing hints.</li>
            <li><strong>ConfigMaps</strong> and <strong>Secrets</strong> used for configuration.</li>
            <li><strong>Jobs</strong> and <strong>CronJobs</strong> used for task execution.</li>
            <li><strong>Namespaces</strong>, <strong>ServiceAccounts</strong>, and other support resources.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example Kubernetes Manifest</h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: web
          image: nginx:1.25`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">A Summary Is Not a Cluster Validation</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This tool is designed for quick manifest review. It does not contact your Kubernetes cluster, check live resources, verify RBAC permissions, or validate every schema field against a Kubernetes API version.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Use it before code review or deployment, then confirm with kubectl dry-run, admission checks, policy tools, and real cluster testing.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>

          <div className="mt-5 space-y-6">
            <Faq title="What does a Kubernetes YAML Resource Summarizer do?">
              It reads pasted Kubernetes YAML and summarizes resources, names, namespaces, images, replicas, ports, hosts, and warnings.
            </Faq>

            <Faq title="Does this apply YAML to my cluster?">
              No. It only analyzes pasted text locally in your browser.
            </Faq>

            <Faq title="Can it parse multiple YAML documents?">
              Yes. It supports documents separated by ---.
            </Faq>

            <Faq title="Does it validate Kubernetes schemas?">
              No. It is a practical summarizer, not a full Kubernetes schema validator.
            </Faq>

            <Faq title="Is anything uploaded when I summarize YAML?">
              No. The summary is generated directly in your browser.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/yaml-validator" className="yoryantra-btn-outline">YAML Validator</Link>
            <Link href="/tools/docker-compose-validator" className="yoryantra-btn-outline">Docker Compose Validator</Link>
            <Link href="/tools/dockerfile-instruction-explainer" className="yoryantra-btn-outline">Dockerfile Instruction Explainer</Link>
            <Link href="/tools/env-to-json-converter" className="yoryantra-btn-outline">ENV to JSON Converter</Link>
            <Link href="/tools/json-formatter" className="yoryantra-btn-outline">JSON Formatter</Link>
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
  yamlInput: string;
  outputMode: OutputMode;
  detailLevel: DetailLevel;
  resourceFilter: ResourceFilter;
  warnLatestImages: boolean;
  warnMissingNamespace: boolean;
  warnSecrets: boolean;
  warnLoadBalancer: boolean;
  warnMissingReplicas: boolean;
  warnNoResources: boolean;
}): Result {
  const allResources = parseKubernetesYaml(options.yamlInput);
  const resources = filterResources(allResources, options.resourceFilter);
  const issues = buildIssues(resources, options);
  const namespaces = new Set(resources.map((resource) => resource.namespace).filter(Boolean));
  const images = new Set(resources.flatMap((resource) => resource.images));
  const base = {
    resources,
    issues,
    resourceCount: resources.length,
    namespaceCount: namespaces.size,
    imageCount: images.size,
    portCount: resources.reduce((total, resource) => total + resource.ports.length, 0),
  };
  const output = formatOutput(base, options.outputMode, options.detailLevel);

  return {
    ...base,
    output,
  };
}

function parseKubernetesYaml(input: string) {
  return input
    .split(/^---\s*$/m)
    .map((doc) => doc.trim())
    .filter(Boolean)
    .map((doc, index) => parseDocument(doc, index + 1))
    .filter((resource): resource is KubeResource => Boolean(resource));
}

function parseDocument(documentText: string, documentIndex: number): KubeResource | null {
  const lines = documentText.split(/\r?\n/);
  const kind = getTopLevelValue(lines, "kind");
  const apiVersion = getTopLevelValue(lines, "apiVersion");

  if (!kind && !apiVersion) return null;

  const name = getMetadataValue(lines, "name");
  const namespace = getMetadataValue(lines, "namespace");
  const replicas = getNestedScalar(lines, "replicas");
  const images = collectValues(lines, "image");
  const ports = collectPortValues(lines);
  const hosts = collectValues(lines, "host");
  const labels = collectLabels(lines);
  const notes = buildResourceNotes(kind, images, ports, hosts);

  return {
    documentIndex,
    kind: kind || "Unknown",
    name,
    namespace,
    apiVersion,
    replicas,
    images,
    ports,
    hosts,
    labels,
    notes,
  };
}

function getTopLevelValue(lines: string[], key: string) {
  const regex = new RegExp(`^${key}:\\s*(.+)\\s*$`);

  for (const line of lines) {
    const match = line.match(regex);
    if (match) return stripQuotes(match[1].trim());
  }

  return "";
}

function getMetadataValue(lines: string[], key: string) {
  let inMetadata = false;
  const regex = new RegExp(`^\\s{2}${key}:\\s*(.+)\\s*$`);

  for (const line of lines) {
    if (/^metadata:\s*$/.test(line)) {
      inMetadata = true;
      continue;
    }

    if (inMetadata && /^\S/.test(line)) {
      inMetadata = false;
    }

    if (inMetadata) {
      const match = line.match(regex);
      if (match) return stripQuotes(match[1].trim());
    }
  }

  return "";
}

function getNestedScalar(lines: string[], key: string) {
  const regex = new RegExp(`^\\s*${key}:\\s*(.+)\\s*$`);

  for (const line of lines) {
    const match = line.match(regex);
    if (match) return stripQuotes(match[1].trim());
  }

  return "";
}

function collectValues(lines: string[], key: string) {
  const values: string[] = [];
  const regex = new RegExp(`^\\s*-?\\s*${key}:\\s*(.+)\\s*$`);

  lines.forEach((line) => {
    const match = line.match(regex);
    if (match) values.push(stripQuotes(match[1].trim()));
  });

  return Array.from(new Set(values));
}

function collectPortValues(lines: string[]) {
  const values: string[] = [];

  lines.forEach((line) => {
    const match = line.match(/^\s*-?\s*(containerPort|port|targetPort|nodePort):\s*(.+)\s*$/);
    if (match) values.push(`${match[1]}=${stripQuotes(match[2].trim())}`);
  });

  return Array.from(new Set(values));
}

function collectLabels(lines: string[]) {
  const labels: string[] = [];
  let inLabels = false;
  let labelIndent = 0;

  lines.forEach((line) => {
    const labelMatch = line.match(/^(\s*)labels:\s*$/);
    if (labelMatch) {
      inLabels = true;
      labelIndent = labelMatch[1].length;
      return;
    }

    if (inLabels) {
      const indent = line.length - line.trimStart().length;
      if (line.trim() && indent <= labelIndent) {
        inLabels = false;
        return;
      }

      const pair = line.trim().match(/^([A-Za-z0-9_.-]+):\s*(.+)$/);
      if (pair) labels.push(`${pair[1]}=${stripQuotes(pair[2].trim())}`);
    }
  });

  return Array.from(new Set(labels));
}

function buildResourceNotes(kind: string, images: string[], ports: string[], hosts: string[]) {
  const notes: string[] = [];

  if (["Deployment", "StatefulSet", "DaemonSet", "Job", "CronJob", "Pod"].includes(kind) && images.length > 0) {
    notes.push(`uses ${images.length} container image${images.length === 1 ? "" : "s"}`);
  }

  if (ports.length > 0) {
    notes.push(`defines ${ports.length} port value${ports.length === 1 ? "" : "s"}`);
  }

  if (hosts.length > 0) {
    notes.push(`defines ${hosts.length} host value${hosts.length === 1 ? "" : "s"}`);
  }

  return notes;
}

function filterResources(resources: KubeResource[], filter: ResourceFilter) {
  if (filter === "all") return resources;

  const groups: Record<ResourceFilter, string[]> = {
    all: [],
    workloads: ["Deployment", "StatefulSet", "DaemonSet", "Job", "CronJob", "Pod", "ReplicaSet"],
    networking: ["Service", "Ingress", "NetworkPolicy", "EndpointSlice"],
    config: ["ConfigMap", "Secret", "PersistentVolumeClaim", "PersistentVolume"],
    security: ["ServiceAccount", "Role", "RoleBinding", "ClusterRole", "ClusterRoleBinding", "Secret"],
  };

  return resources.filter((resource) => groups[filter].includes(resource.kind));
}

function buildIssues(resources: KubeResource[], options: {
  warnLatestImages: boolean;
  warnMissingNamespace: boolean;
  warnSecrets: boolean;
  warnLoadBalancer: boolean;
  warnMissingReplicas: boolean;
  warnNoResources: boolean;
}) {
  const issues: Issue[] = [];

  if (options.warnNoResources && resources.length === 0) {
    issues.push({
      severity: "warning",
      title: "No Kubernetes resources found",
      message: "No recognizable Kubernetes resources were found in the pasted YAML.",
    });
  }

  if (options.warnMissingNamespace) {
    const missing = resources.filter((resource) => !resource.namespace && resource.kind !== "Namespace");

    if (missing.length > 0) {
      issues.push({
        severity: "info",
        title: "Namespace not set on some resources",
        message: `${missing.length} resource${missing.length === 1 ? "" : "s"} do not specify metadata.namespace.`,
      });
    }
  }

  if (options.warnLatestImages) {
    const latest = resources.flatMap((resource) => resource.images).filter((image) => image.endsWith(":latest") || !image.includes(":"));

    if (latest.length > 0) {
      issues.push({
        severity: "info",
        title: "Latest or untagged images found",
        message: `Review image tags for predictability: ${Array.from(new Set(latest)).join(", ")}.`,
      });
    }
  }

  if (options.warnSecrets && resources.some((resource) => resource.kind === "Secret")) {
    issues.push({
      severity: "warning",
      title: "Secret resource present",
      message: "Secrets are base64 encoded in manifests, not encrypted by default. Handle them carefully.",
    });
  }

  if (options.warnLoadBalancer && resources.some((resource) => resource.kind === "Service" && /type:\s*LoadBalancer/i.test(getOriginalResourceText(resource)))) {
    issues.push({
      severity: "info",
      title: "LoadBalancer service detected",
      message: "LoadBalancer services can create external cloud load balancers and may affect cost or exposure.",
    });
  }

  if (options.warnMissingReplicas) {
    const missingReplicas = resources.filter((resource) => resource.kind === "Deployment" && !resource.replicas);

    if (missingReplicas.length > 0) {
      issues.push({
        severity: "info",
        title: "Deployment replicas not set",
        message: `${missingReplicas.length} Deployment resource${missingReplicas.length === 1 ? "" : "s"} do not set spec.replicas.`,
      });
    }
  }

  if (issues.length === 0) {
    issues.push({
      severity: "info",
      title: "Kubernetes resources summarized",
      message: "No obvious manifest review warning was found from the enabled checks.",
    });
  }

  return issues;
}

function getOriginalResourceText(_resource: KubeResource) {
  return "";
}

function formatOutput(result: Omit<Result, "output">, mode: OutputMode, detailLevel: DetailLevel) {
  if (mode === "json") {
    return JSON.stringify(result, null, 2);
  }

  if (mode === "markdown") {
    return [
      "| Kind | Name | Namespace | Images | Replicas | Ports / Hosts |",
      "| --- | --- | --- | --- | --- | --- |",
      ...result.resources.map((resource) => `| ${resource.kind} | ${resource.name || "-"} | ${resource.namespace || "-"} | ${escapeMarkdown(resource.images.join(", ") || "-")} | ${resource.replicas || "-"} | ${escapeMarkdown([...resource.ports, ...resource.hosts].join(", ") || "-")} |`),
      "",
      "## Findings",
      ...result.issues.map((issue) => `- **${issue.title}:** ${issue.message}`),
    ].join("\n");
  }

  if (mode === "csv") {
    const rows = [
      ["kind", "name", "namespace", "images", "replicas", "ports", "hosts"],
      ...result.resources.map((resource) => [
        resource.kind,
        resource.name,
        resource.namespace,
        resource.images.join("; "),
        resource.replicas,
        resource.ports.join("; "),
        resource.hosts.join("; "),
      ]),
    ];

    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }

  if (mode === "checklist") {
    return [
      "Kubernetes Manifest Review Checklist",
      "------------------------------------",
      "- [ ] Confirm namespaces are intentional.",
      "- [ ] Confirm image tags are pinned and expected.",
      "- [ ] Confirm service exposure is safe.",
      "- [ ] Confirm deployments have suitable replica counts.",
      "- [ ] Confirm secrets are handled with the right secret management process.",
      "- [ ] Confirm manifests pass kubectl dry-run or CI validation.",
      "",
      "Findings:",
      ...result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
    ].join("\n");
  }

  if (mode === "table") {
    return result.resources
      .map((resource) => [
        `${resource.kind}: ${resource.name || "unnamed"}`,
        `namespace: ${resource.namespace || "default/unspecified"}`,
        `images: ${resource.images.join(", ") || "none"}`,
        `ports/hosts: ${[...resource.ports, ...resource.hosts].join(", ") || "none"}`,
      ].join("\n"))
      .join("\n\n");
  }

  const resourceLines = detailLevel === "compact"
    ? result.resources.map((resource) => `- ${resource.kind}/${resource.name || "unnamed"}`)
    : result.resources.map((resource) => `- ${resource.kind}/${resource.name || "unnamed"} in ${resource.namespace || "default/unspecified"} — images: ${resource.images.join(", ") || "none"}; ports/hosts: ${[...resource.ports, ...resource.hosts].join(", ") || "none"}`);

  return [
    "Kubernetes YAML Resource Summary",
    "--------------------------------",
    `Resources: ${result.resourceCount}`,
    `Namespaces: ${result.namespaceCount}`,
    `Images: ${result.imageCount}`,
    `Ports: ${result.portCount}`,
    "",
    "Resources:",
    ...resourceLines,
    "",
    "Findings:",
    ...result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
  ].join("\n");
}

function stripQuotes(value: string) {
  return value.replace(/^["']|["']$/g, "");
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

function getNotes(result: Result) {
  const notes: { title: string; message: string }[] = [];

  if (result.imageCount > 0) {
    notes.push({
      title: "Review image tags before deployment",
      message: "Pinned image tags make rollbacks, reviews, and deployment history easier to reason about.",
    });
  }

  if (result.portCount > 0) {
    notes.push({
      title: "Ports do not always mean public exposure",
      message: "Container ports, service ports, node ports, and ingress hosts mean different things. Review the resource kind before assuming exposure.",
    });
  }

  notes.push({
    title: "Use cluster-aware validation too",
    message: "This summary is useful for review, but kubectl dry-run, policy checks, and cluster admission rules catch different issues.",
  });

  return notes;
}
