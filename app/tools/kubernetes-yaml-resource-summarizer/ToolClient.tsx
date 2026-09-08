"use client";

import { useMemo, useState } from "react";
import { parseAllDocuments } from "yaml";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "summary" | "table" | "json" | "markdown" | "csv" | "checklist";
type DetailLevel = "compact" | "balanced" | "detailed";
type ResourceFilter = "all" | "workloads" | "networking" | "config" | "security";

type KubeResource = {
  documentIndex: number;
  kind: string;
  name: string;
  namespace: string;
  scope: "namespaced" | "cluster" | "unknown";
  apiVersion: string;
  replicas: string;
  images: string[];
  ports: string[];
  hosts: string[];
  labels: string[];
  serviceType: string;
  configKeyCount: number;
  secretKeyCount: number;
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
  displayedResourceCount: number;
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

    try {
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
    } catch (caught) {
      setResult(null);
      setOutput("");
      setCopied(false);
      setError(caught instanceof Error ? caught.message : "Could not parse the Kubernetes YAML.");
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
      description="Inventory Kubernetes resources, namespaces, workload images, replicas, ports, hosts, and configuration signals from manifests."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900">
              Kubernetes YAML
            </label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Paste one or more Kubernetes YAML documents; multi-document streams and kind: List are supported.
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
          Parsing stays in this browser. No resource is applied and no Kubernetes API discovery or schema lookup is performed.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={summarizeYaml} className="yoryantra-btn min-h-[44px] whitespace-nowrap">
          Summarize Kubernetes YAML
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
          <SummaryCard label="Resources" value={result.resourceCount.toLocaleString()} />
          <SummaryCard label="Namespaces" value={result.namespaceCount.toLocaleString()} />
          <SummaryCard label="Images" value={result.imageCount.toLocaleString()} />
          <SummaryCard label="Ports / Backends" value={result.portCount.toLocaleString()} />
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
                  <th className="px-4 py-3 font-semibold">Namespace / Scope</th>
                  <th className="px-4 py-3 font-semibold">Images</th>
                  <th className="px-4 py-3 font-semibold">Replicas</th>
                  <th className="px-4 py-3 font-semibold">Ports / Hosts</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {result.resources.map((resource) => (
                  <tr key={`${resource.documentIndex}-${resource.kind}-${resource.name}`}>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-900">{resource.kind}<span className="mt-1 block font-normal text-[11px] text-gray-500">{resource.apiVersion || "apiVersion missing"}</span></td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{resource.name || "-"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{resource.scope === "cluster" ? "cluster-scoped" : resource.namespace || (resource.scope === "namespaced" ? "default/unspecified" : "scope unknown")}</td>
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
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Manifest findings</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {result.issues.map((issue, index) => (
              <FindingCard key={`${issue.title}-${index}`} issue={issue} />
            ))}
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">How to read the inventory</h3>
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
          {output || "Kubernetes YAML summary output will appear here."}
        </pre>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Treat a manifest summary as an inventory</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A Kubernetes YAML stream can mix workloads, Services, Ingresses, configuration, RBAC, storage, and custom resources. The inventory keeps the object identity first—<code>apiVersion</code>, <code>kind</code>, name, and namespace—then adds fields that are meaningful for that resource family.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            That is intentionally different from pretending every object has replicas, images, or ports. A Secret and a Deployment answer different review questions, so their summary signals should differ too.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
            <h2 className="font-semibold text-amber-900">Secrets deserve a separate handling path</h2>
            <p className="mt-2 text-sm leading-relaxed text-amber-800">
              Secret values are deliberately not copied into the inventory. Kubernetes Secret data is commonly base64-encoded, which is not encryption; repository, access-control, and encryption-at-rest decisions still matter.
            </p>
          </div>
          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h2 className="font-semibold text-gray-900">Namespace is not universal</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Deployments and Services are namespaced, while objects such as Namespace, Node, PersistentVolume, StorageClass, and ClusterRole are cluster-scoped. Missing namespace is only flagged where the resource family is known to be namespaced.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What changes by resource family</h2>
          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li><strong>Pod-template workloads:</strong> container, init-container, and ephemeral-container images plus declared container ports and scaling hints.</li>
            <li><strong>Services:</strong> type, Service port, targetPort, nodePort, app protocol, and headless or ExternalName signals.</li>
            <li><strong>Ingress:</strong> rule and TLS hosts plus Service backend references.</li>
            <li><strong>ConfigMaps and Secrets:</strong> key counts without echoing Secret values.</li>
            <li><strong>RBAC and cluster-scoped objects:</strong> identity and scope rather than invented workload fields.</li>
            <li><strong>Custom resources:</strong> object identity and metadata are kept, while domain-specific spec fields remain outside the generic summary.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Replica text is a declaration, not live capacity</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Deployments, StatefulSets, and ReplicaSets expose <code>spec.replicas</code> and default to one when it is omitted. DaemonSets scale with eligible nodes; Jobs describe parallelism and completions; CronJobs create Jobs according to schedule. The summary preserves those distinctions instead of forcing every workload into one replica number.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Static YAML stops before API-server truth</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The parser validates YAML structure and duplicate keys, but it does not perform Kubernetes OpenAPI validation, default every API field, resolve CRD schemas, run admission, check RBAC, or compare against live cluster state. Use server-side dry-run, policy checks, and the target cluster when those answers matter.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Kubernetes' <a className="underline decoration-gray-300 underline-offset-4 hover:text-gray-900" href="https://kubernetes.io/docs/concepts/overview/working-with-objects/" target="_blank" rel="noreferrer">object documentation</a> explains the object model, while the <a className="underline decoration-gray-300 underline-offset-4 hover:text-gray-900" href="https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/" target="_blank" rel="noreferrer">namespace documentation</a> distinguishes namespaced and cluster-scoped resources.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What the inventory can and cannot answer</h2>
          <div className="mt-5 space-y-6">
            <Faq title="Can a valid YAML document still be invalid Kubernetes configuration?">
              Yes. YAML syntax and Kubernetes API schema validity are separate layers. Unknown fields, removed API versions, admission rules, or CRD validation can still reject a syntactically valid document.
            </Faq>
            <Faq title="Why are Secret values not displayed?">
              The resource identity and key count are usually enough for an inventory. Reprinting credentials adds exposure without improving the structural summary.
            </Faq>
            <Faq title="Does an omitted Deployment replica count mean zero?">
              No. Kubernetes defaults a Deployment replica count to one when the field is omitted. The inventory labels that as a default rather than showing a misleading blank or zero.
            </Faq>
            <Faq title="Can custom resources still appear?">
              Yes. Their apiVersion, kind, metadata, labels, and scope hint can be listed, but domain-specific fields require the CRD schema or controller knowledge.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4"><YoryantraRelatedTools currentHref="/tools/kubernetes-yaml-resource-summarizer" /></div>
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

function FindingCard({ issue }: { issue: Issue }) {
  const style = issue.severity === "high"
    ? "border-red-200 bg-red-50 text-red-800"
    : issue.severity === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-gray-200 bg-white text-gray-700";
  const heading = issue.severity === "high"
    ? "text-red-900"
    : issue.severity === "warning"
      ? "text-amber-900"
      : "text-gray-900";
  return (
    <div className={`self-start rounded-lg border p-3 ${style}`}>
      <p className={`text-sm font-semibold ${heading}`}>{issue.title}</p>
      <p className="mt-1 text-sm leading-relaxed">{issue.message}</p>
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
  const issues = buildIssues(allResources, options);
  const namespaces = new Set(allResources.filter((resource) => resource.scope === "namespaced").map((resource) => resource.namespace || "default/unspecified"));
  const images = new Set(allResources.reduce<string[]>((all, resource) => all.concat(resource.images), []));
  const base = {
    resources,
    issues,
    resourceCount: allResources.length,
    displayedResourceCount: resources.length,
    namespaceCount: namespaces.size,
    imageCount: images.size,
    portCount: allResources.reduce((total, resource) => total + resource.ports.length, 0),
  };
  const output = formatOutput(base, options.outputMode, options.detailLevel);
  return { ...base, output };
}

function parseKubernetesYaml(input: string): KubeResource[] {
  const documents = parseAllDocuments(input, { prettyErrors: true, strict: true, uniqueKeys: true });
  const parseErrors = documents.reduce<Array<{ message: string }>>((all, document) => all.concat(document.errors), []);
  if (parseErrors.length > 0) throw new Error(parseErrors[0].message);

  const resources: KubeResource[] = [];
  documents.forEach((document, index) => {
    const root = document.toJS({ maxAliasCount: 100 });
    collectResources(root, index + 1, resources);
  });
  return resources;
}

function collectResources(value: unknown, documentIndex: number, resources: KubeResource[]): void {
  if (!isRecord(value)) return;
  if (value.kind === "List" && Array.isArray(value.items)) {
    value.items.forEach((item) => collectResources(item, documentIndex, resources));
    return;
  }
  const resource = parseResource(value, documentIndex);
  if (resource) resources.push(resource);
}

function parseResource(root: Record<string, unknown>, documentIndex: number): KubeResource | null {
  const kind = readString(root.kind);
  const apiVersion = readString(root.apiVersion);
  if (!kind && !apiVersion) return null;
  const metadata = isRecord(root.metadata) ? root.metadata : {};
  const name = readString(metadata.name);
  const namespace = readString(metadata.namespace);
  const scope = getScope(kind, apiVersion);
  const images = extractImages(root, kind);
  const ports = extractPorts(root, kind);
  const hosts = extractHosts(root, kind);
  const labels = mapToPairs(readStringMap(metadata.labels));
  const replicas = describeScale(root, kind);
  const spec = isRecord(root.spec) ? root.spec : {};
  const serviceType = kind === "Service" ? readString(spec.type) || "ClusterIP" : "";
  const configKeyCount = kind === "ConfigMap" ? countMapKeys(root.data) + countMapKeys(root.binaryData) : 0;
  const secretKeyCount = kind === "Secret" ? countMapKeys(root.data) + countMapKeys(root.stringData) : 0;
  const notes = buildResourceNotes(kind, images, ports, hosts, serviceType, configKeyCount, secretKeyCount);

  return { documentIndex, kind: kind || "Unknown", name, namespace, scope, apiVersion, replicas, images, ports, hosts, labels, serviceType, configKeyCount, secretKeyCount, notes };
}

function extractImages(root: Record<string, unknown>, kind: string): string[] {
  const podSpec = getPodSpec(root, kind);
  if (!podSpec) return [];
  const values: string[] = [];
  ["containers", "initContainers", "ephemeralContainers"].forEach((key) => {
    const group = podSpec[key];
    if (!Array.isArray(group)) return;
    group.forEach((candidate) => {
      if (!isRecord(candidate)) return;
      const image = readString(candidate.image);
      if (image) values.push(image);
    });
  });
  return Array.from(new Set(values));
}

function extractPorts(root: Record<string, unknown>, kind: string): string[] {
  const values: string[] = [];
  if (kind === "Service") {
    const spec = isRecord(root.spec) ? root.spec : {};
    const rawPorts = Array.isArray(spec.ports) ? spec.ports : [];
    rawPorts.forEach((candidate) => {
      if (!isRecord(candidate)) return;
      const port = readPortValue(candidate.port);
      if (!port) return;
      const target = readPortValue(candidate.targetPort) || port;
      const node = readPortValue(candidate.nodePort);
      const protocol = readString(candidate.protocol) || "TCP";
      const name = readString(candidate.name);
      values.push(`${name ? `${name}:` : ""}${port}->${target}/${protocol}${node ? ` node:${node}` : ""}`);
    });
    return values;
  }

  if (kind === "Ingress") {
    const spec = isRecord(root.spec) ? root.spec : {};
    collectIngressBackendStrings(spec).forEach((value) => values.push(value));
    return Array.from(new Set(values));
  }

  if (kind === "EndpointSlice") {
    const ports = Array.isArray(root.ports) ? root.ports : [];
    ports.forEach((candidate) => {
      if (!isRecord(candidate)) return;
      const port = readPortValue(candidate.port);
      if (!port) return;
      values.push(`${readString(candidate.name) || "endpoint"}:${port}/${readString(candidate.protocol) || "TCP"}`);
    });
    return values;
  }

  const podSpec = getPodSpec(root, kind);
  if (!podSpec) return [];
  const containers = Array.isArray(podSpec.containers) ? podSpec.containers : [];
  containers.forEach((candidate) => {
    if (!isRecord(candidate)) return;
    const containerName = readString(candidate.name) || "container";
    const rawPorts = Array.isArray(candidate.ports) ? candidate.ports : [];
    rawPorts.forEach((rawPort) => {
      if (!isRecord(rawPort)) return;
      const port = readPortValue(rawPort.containerPort);
      if (port) values.push(`${containerName}:${readString(rawPort.name) ? `${readString(rawPort.name)}=` : ""}${port}/${readString(rawPort.protocol) || "TCP"}`);
    });
  });
  return Array.from(new Set(values));
}

function extractHosts(root: Record<string, unknown>, kind: string): string[] {
  if (kind === "Service") {
    const spec = isRecord(root.spec) ? root.spec : {};
    const externalName = readString(spec.externalName);
    return externalName ? [externalName] : [];
  }
  if (kind !== "Ingress") return [];
  const spec = isRecord(root.spec) ? root.spec : {};
  const hosts: string[] = [];
  const rules = Array.isArray(spec.rules) ? spec.rules : [];
  rules.forEach((rule) => { if (isRecord(rule)) { const host = readString(rule.host); if (host) hosts.push(host); } });
  const tls = Array.isArray(spec.tls) ? spec.tls : [];
  tls.forEach((entry) => {
    if (!isRecord(entry) || !Array.isArray(entry.hosts)) return;
    entry.hosts.forEach((host) => { const value = readString(host); if (value) hosts.push(value); });
  });
  return Array.from(new Set(hosts));
}

function collectIngressBackendStrings(spec: Record<string, unknown>): string[] {
  const values: string[] = [];
  const add = (backend: unknown) => {
    if (!isRecord(backend)) return;
    const service = isRecord(backend.service) ? backend.service : null;
    if (!service) return;
    const name = readString(service.name);
    const port = isRecord(service.port) ? service.port : {};
    const ref = readPortValue(port.number) || readString(port.name);
    if (name) values.push(`${name}:${ref || "?"}`);
  };
  add(spec.defaultBackend);
  const rules = Array.isArray(spec.rules) ? spec.rules : [];
  rules.forEach((rule) => {
    if (!isRecord(rule)) return;
    const http = isRecord(rule.http) ? rule.http : null;
    const paths = http && Array.isArray(http.paths) ? http.paths : [];
    paths.forEach((path) => { if (isRecord(path)) add(path.backend); });
  });
  return Array.from(new Set(values));
}

function getPodSpec(root: Record<string, unknown>, kind: string): Record<string, unknown> | null {
  const spec = isRecord(root.spec) ? root.spec : null;
  if (!spec) return null;
  if (kind === "Pod") return spec;
  if (kind === "CronJob") {
    const jobTemplate = isRecord(spec.jobTemplate) ? spec.jobTemplate : null;
    const jobSpec = jobTemplate && isRecord(jobTemplate.spec) ? jobTemplate.spec : null;
    const template = jobSpec && isRecord(jobSpec.template) ? jobSpec.template : null;
    return template && isRecord(template.spec) ? template.spec : null;
  }
  const template = isRecord(spec.template) ? spec.template : null;
  return template && isRecord(template.spec) ? template.spec : null;
}

function describeScale(root: Record<string, unknown>, kind: string): string {
  const spec = isRecord(root.spec) ? root.spec : {};
  if (kind === "Deployment" || kind === "StatefulSet" || kind === "ReplicaSet" || kind === "ReplicationController") {
    if (!("replicas" in spec)) return "default 1";
    const replicas = readNonNegativeInteger(spec.replicas);
    return replicas === null ? "invalid replicas value" : String(replicas);
  }
  if (kind === "DaemonSet") return "per eligible node";
  if (kind === "Pod") return "1 Pod";
  if (kind === "Job") {
    const parallelism = "parallelism" in spec ? readNonNegativeInteger(spec.parallelism) : 1;
    const completions = "completions" in spec ? readNonNegativeInteger(spec.completions) : null;
    if (parallelism === null) return "invalid parallelism value";
    if ("completions" in spec && completions === null) return "invalid completions value";
    return `parallelism ${parallelism}${completions === null ? "" : `; completions ${completions}`}`;
  }
  if (kind === "CronJob") {
    const jobTemplate = isRecord(spec.jobTemplate) ? spec.jobTemplate : {};
    const jobSpec = isRecord(jobTemplate.spec) ? jobTemplate.spec : {};
    const parallelism = "parallelism" in jobSpec ? readNonNegativeInteger(jobSpec.parallelism) : 1;
    return parallelism === null ? "invalid Job parallelism value" : `per Job; parallelism ${parallelism}`;
  }
  return "";
}

const CLUSTER_SCOPED_KINDS = new Set([
  "Namespace", "Node", "PersistentVolume", "StorageClass", "ClusterRole", "ClusterRoleBinding",
  "CustomResourceDefinition", "MutatingWebhookConfiguration", "ValidatingWebhookConfiguration",
  "PriorityClass", "APIService", "RuntimeClass", "VolumeAttachment", "CSIDriver", "CSINode",
  "CertificateSigningRequest",
]);
const NAMESPACED_KINDS = new Set([
  "Pod", "Deployment", "StatefulSet", "ReplicaSet", "DaemonSet", "Job", "CronJob", "ReplicationController",
  "Service", "Ingress", "NetworkPolicy", "EndpointSlice", "ConfigMap", "Secret", "PersistentVolumeClaim",
  "ServiceAccount", "Role", "RoleBinding", "ResourceQuota", "LimitRange", "HorizontalPodAutoscaler", "PodDisruptionBudget",
]);

function getScope(kind: string, _apiVersion: string): KubeResource["scope"] {
  if (CLUSTER_SCOPED_KINDS.has(kind)) return "cluster";
  if (NAMESPACED_KINDS.has(kind)) return "namespaced";
  return "unknown";
}

function filterResources(resources: KubeResource[], filter: ResourceFilter): KubeResource[] {
  if (filter === "all") return resources;
  const groups: Record<ResourceFilter, string[]> = {
    all: [],
    workloads: ["Deployment", "StatefulSet", "DaemonSet", "Job", "CronJob", "Pod", "ReplicaSet", "ReplicationController"],
    networking: ["Service", "Ingress", "NetworkPolicy", "EndpointSlice"],
    config: ["ConfigMap", "Secret", "PersistentVolumeClaim", "PersistentVolume", "StorageClass"],
    security: ["ServiceAccount", "Role", "RoleBinding", "ClusterRole", "ClusterRoleBinding", "Secret", "NetworkPolicy"],
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
}): Issue[] {
  const issues: Issue[] = [];
  if (options.warnNoResources && resources.length === 0) issues.push({ severity: "warning", title: "No Kubernetes resources found", message: "No object with Kubernetes-style apiVersion/kind fields was found in the parsed YAML documents." });

  if (options.warnMissingNamespace) {
    const missing = resources.filter((resource) => resource.scope === "namespaced" && !resource.namespace);
    if (missing.length > 0) issues.push({ severity: "info", title: "Namespaced resources rely on namespace defaulting", message: `${missing.length} known namespaced resource${missing.length === 1 ? " omits" : "s omit"} metadata.namespace. Where the client allows it, the active namespace context supplies the target namespace.` });
  }

  if (options.warnLatestImages) {
    const latest = resources.reduce<string[]>((all, resource) => all.concat(resource.images), []).filter(hasLatestSemantics);
    if (latest.length > 0) issues.push({ severity: "warning", title: "latest or implicit-latest images found", message: `Review these image references for repeatability: ${Array.from(new Set(latest)).join(", ")}.` });
  }

  if (options.warnSecrets) {
    const secrets = resources.filter((resource) => resource.kind === "Secret");
    if (secrets.length > 0) issues.push({ severity: "warning", title: "Secret resources are present", message: `${secrets.length} Secret resource${secrets.length === 1 ? " is" : "s are"} present. Values are intentionally omitted from the inventory; base64 representation is not encryption.` });
  }

  if (options.warnLoadBalancer) {
    const services = resources.filter((resource) => resource.kind === "Service" && resource.serviceType === "LoadBalancer");
    if (services.length > 0) issues.push({ severity: "warning", title: "LoadBalancer Services are declared", message: `${services.length} Service${services.length === 1 ? " requests" : "s request"} load-balancer integration. External address, exposure, and cost depend on the cluster implementation.` });
  }

  if (options.warnMissingReplicas) {
    const defaulted = resources.filter((resource) => ["Deployment", "StatefulSet", "ReplicaSet", "ReplicationController"].includes(resource.kind) && resource.replicas === "default 1");
    if (defaulted.length > 0) issues.push({ severity: "info", title: "Replica count relies on the Kubernetes default", message: `${defaulted.length} scalable workload${defaulted.length === 1 ? " omits" : "s omit"} spec.replicas; the API default is one.` });
  }

  const invalidScale = resources.filter((resource) => resource.replicas.startsWith("invalid"));
  if (invalidScale.length > 0) issues.push({ severity: "high", title: "Invalid workload scaling value", message: `${invalidScale.length} workload${invalidScale.length === 1 ? " has" : "s have"} a replicas, parallelism, or completions value that is not a non-negative integer.` });

  const custom = resources.filter((resource) => resource.scope === "unknown");
  if (custom.length > 0) issues.push({ severity: "info", title: "Some resource scopes are unknown without API discovery", message: `${custom.length} resource${custom.length === 1 ? " has" : "s have"} a kind whose namespaced/cluster scope cannot be safely inferred from a static built-in list, which is common for CRDs.` });

  if (issues.length === 0) issues.push({ severity: "info", title: "No enabled inventory concern found", message: "The enabled checks found no Secret, latest-image, LoadBalancer, namespace-defaulting, or replica-defaulting concern in the parsed set." });
  return issues;
}

function formatOutput(result: Omit<Result, "output">, mode: OutputMode, detailLevel: DetailLevel): string {
  if (mode === "json") return JSON.stringify(result, null, 2);
  if (mode === "markdown") {
    return [
      "| Kind | Name | Namespace / scope | Images | Scale | Ports / Hosts |",
      "| --- | --- | --- | --- | --- | --- |",
      ...result.resources.map((resource) => `| ${escapeMarkdown(resource.kind)} | ${escapeMarkdown(resource.name || "-")} | ${escapeMarkdown(resource.scope === "cluster" ? "cluster-scoped" : resource.namespace || (resource.scope === "namespaced" ? "default/unspecified" : "scope unknown"))} | ${escapeMarkdown(resource.images.join(", ") || "-")} | ${escapeMarkdown(resource.replicas || "-")} | ${escapeMarkdown(resource.ports.concat(resource.hosts).join(", ") || "-")} |`),
      "",
      "## Findings",
      ...result.issues.map((issue) => `- **${escapeMarkdown(issue.title)}:** ${escapeMarkdown(issue.message)}`),
    ].join("\n");
  }
  if (mode === "csv") {
    const rows = [["api_version", "kind", "name", "namespace", "scope", "images", "scale", "ports", "hosts", "service_type", "config_keys", "secret_keys"], ...result.resources.map((resource) => [resource.apiVersion, resource.kind, resource.name, resource.namespace, resource.scope, resource.images.join("; "), resource.replicas, resource.ports.join("; "), resource.hosts.join("; "), resource.serviceType, String(resource.configKeyCount), String(resource.secretKeyCount)])];
    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }
  if (mode === "checklist") {
    return [
      "Kubernetes manifest inventory review",
      "------------------------------------",
      "- [ ] Confirm apiVersion/kind pairs are supported by the target cluster.",
      "- [ ] Confirm namespaced objects land in the intended namespace.",
      "- [ ] Review workload image references and scaling declarations.",
      "- [ ] Review Service / Ingress exposure and backend mappings separately.",
      "- [ ] Keep Secret values out of ordinary review output and repositories where possible.",
      "- [ ] Use server-side dry-run and admission/policy checks before deployment.",
      "",
      ...result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
    ].join("\n");
  }
  if (mode === "table") {
    return result.resources.map((resource) => [
      `${resource.apiVersion || "?"} ${resource.kind}/${resource.name || "unnamed"}`,
      `scope: ${resource.scope === "cluster" ? "cluster" : resource.namespace || resource.scope}`,
      `scale: ${resource.replicas || "n/a"}`,
      `images: ${resource.images.join(", ") || "none"}`,
      `ports/hosts: ${resource.ports.concat(resource.hosts).join(", ") || "none"}`,
    ].join("\n")).join("\n\n");
  }

  const resourceLines = detailLevel === "compact"
    ? result.resources.map((resource) => `- ${resource.kind}/${resource.name || "unnamed"}`)
    : result.resources.map((resource) => `- ${resource.apiVersion || "?"} ${resource.kind}/${resource.name || "unnamed"} — ${resource.scope === "cluster" ? "cluster-scoped" : resource.namespace || (resource.scope === "namespaced" ? "default/unspecified" : "scope unknown")}; ${resource.replicas ? `scale ${resource.replicas}; ` : ""}images ${resource.images.join(", ") || "none"}; ports/hosts ${resource.ports.concat(resource.hosts).join(", ") || "none"}`);

  return [
    "Kubernetes manifest resource inventory",
    "--------------------------------------",
    `Resources found: ${result.resourceCount}`,
    `Resources shown by filter: ${result.displayedResourceCount}`,
    `Namespaces represented: ${result.namespaceCount}`,
    `Unique images: ${result.imageCount}`,
    `Port/backend declarations: ${result.portCount}`,
    "",
    "Resources:",
    ...(resourceLines.length ? resourceLines : ["- none shown"]),
    "",
    "Findings:",
    ...result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
  ].join("\n");
}

function buildResourceNotes(kind: string, images: string[], ports: string[], hosts: string[], serviceType: string, configKeyCount: number, secretKeyCount: number): string[] {
  const notes: string[] = [];
  if (images.length > 0) notes.push(`${images.length} image reference${images.length === 1 ? "" : "s"}`);
  if (ports.length > 0) notes.push(`${ports.length} port/backend declaration${ports.length === 1 ? "" : "s"}`);
  if (hosts.length > 0) notes.push(`${hosts.length} host${hosts.length === 1 ? "" : "s"}`);
  if (kind === "Service" && serviceType) notes.push(`Service type ${serviceType}`);
  if (configKeyCount > 0) notes.push(`${configKeyCount} configuration key${configKeyCount === 1 ? "" : "s"}`);
  if (secretKeyCount > 0) notes.push(`${secretKeyCount} Secret key${secretKeyCount === 1 ? "" : "s"} (values hidden)`);
  return notes;
}

function hasLatestSemantics(image: string): boolean {
  const withoutDigest = image.split("@")[0];
  if (image.includes("@")) return false;
  const lastSlash = withoutDigest.lastIndexOf("/");
  const lastColon = withoutDigest.lastIndexOf(":");
  if (lastColon <= lastSlash) return true;
  return withoutDigest.slice(lastColon + 1).toLowerCase() === "latest";
}

function readNonNegativeInteger(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : null;
}

function countMapKeys(value: unknown): number {
  return isRecord(value) ? Object.keys(value).length : 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function readPortValue(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "string") return value.trim();
  return "";
}

function readStringMap(value: unknown): Record<string, string> {
  if (!isRecord(value)) return {};
  const result: Record<string, string> = Object.create(null) as Record<string, string>;
  Object.keys(value).forEach((key) => {
    const scalar = value[key];
    if (typeof scalar === "string" || typeof scalar === "number" || typeof scalar === "boolean") result[key] = String(scalar);
  });
  return result;
}

function mapToPairs(value: Record<string, string>): string[] {
  return Object.keys(value).sort().map((key) => `${key}=${value[key]}`);
}

function csvEscape(value: string): string {
  if (/[",\r\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function escapeMarkdown(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\r?\n/g, "\\n");
}

function getNotes(result: Result): Array<{ title: string; message: string }> {
  const notes: Array<{ title: string; message: string }> = [];
  if (result.resources.some((resource) => resource.scope === "cluster")) notes.push({ title: "Cluster-scoped objects are kept separate", message: "Their namespace cell is not filled with a fake default namespace." });
  if (result.resources.some((resource) => resource.kind === "Secret")) notes.push({ title: "Secret values stay out of the summary", message: "Only the number of data/stringData keys is counted; credential contents are not echoed into output formats." });
  notes.push({ title: "Inventory is not API validation", message: "OpenAPI schemas, CRD rules, defaulting, admission, RBAC, and live status require the target API server or another cluster-aware validator." });
  return notes;
}

