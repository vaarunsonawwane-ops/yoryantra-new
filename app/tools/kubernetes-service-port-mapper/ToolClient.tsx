"use client";

import { useMemo, useState } from "react";
import { parseAllDocuments } from "yaml";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "summary" | "mapping" | "json" | "markdown" | "csv" | "checklist";
type DetailLevel = "compact" | "balanced" | "detailed";
type ExposureFilter = "all" | "cluster" | "node" | "loadBalancer" | "ingress";

type ServicePort = {
  name: string;
  protocol: string;
  appProtocol: string;
  port: string;
  targetPort: string;
  targetPortWasDefaulted: boolean;
  nodePort: string;
  problems: string[];
};

type KubeService = {
  name: string;
  namespace: string;
  type: string;
  clusterIP: string;
  externalName: string;
  selector: string[];
  selectorMap: Record<string, string>;
  ports: ServicePort[];
  documentIndex: number;
};

type WorkloadPort = {
  workload: string;
  namespace: string;
  kind: string;
  labels: string[];
  labelMap: Record<string, string>;
  container: string;
  image: string;
  containerPort: string;
  name: string;
  protocol: string;
};

type WorkloadInfo = {
  workload: string;
  namespace: string;
  kind: string;
  labels: string[];
  labelMap: Record<string, string>;
  ports: WorkloadPort[];
};

type IngressBackend = {
  host: string;
  path: string;
  serviceName: string;
  servicePort: string;
};

type IngressInfo = {
  name: string;
  namespace: string;
  hosts: string[];
  services: string[];
  backends: IngressBackend[];
};

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type Result = {
  services: KubeService[];
  workloadPorts: WorkloadPort[];
  workloads: WorkloadInfo[];
  ingress: IngressInfo[];
  issues: Issue[];
  output: string;
  serviceCount: number;
  servicePortCount: number;
  workloadPortCount: number;
  ingressHostCount: number;
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
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: web
          image: nginx:1.25
          ports:
            - name: http
              containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: web-service
  namespace: production
spec:
  type: NodePort
  selector:
    app: web
  ports:
    - name: http
      protocol: TCP
      port: 80
      targetPort: 8080
      nodePort: 30080
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
  namespace: production
spec:
  rules:
    - host: app.example.com
      http:
        paths:
          - backend:
              service:
                name: web-service
                port:
                  number: 80`;

export default function ToolClient() {
  const [yamlInput, setYamlInput] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [detailLevel, setDetailLevel] = useState<DetailLevel>("balanced");
  const [exposureFilter, setExposureFilter] = useState<ExposureFilter>("all");
  const [warnNodePort, setWarnNodePort] = useState(true);
  const [warnLoadBalancer, setWarnLoadBalancer] = useState(true);
  const [warnMissingTargetPort, setWarnMissingTargetPort] = useState(true);
  const [warnSelectorMismatch, setWarnSelectorMismatch] = useState(true);
  const [warnNoServices, setWarnNoServices] = useState(true);
  const [warnIngressWithoutService, setWarnIngressWithoutService] = useState(true);
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

  const mapPorts = () => {
    if (!yamlInput.trim()) {
      setError("Please paste Kubernetes Service, workload, or Ingress YAML.");
      setResult(null);
      setOutput("");
      return;
    }

    try {
      const next = buildResult({
        yamlInput,
        outputMode,
        detailLevel,
        exposureFilter,
        warnNodePort,
        warnLoadBalancer,
        warnMissingTargetPort,
        warnSelectorMismatch,
        warnNoServices,
        warnIngressWithoutService,
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
    window.setTimeout(() => setCopied(false), 1400);
  };

  const loadExample = () => {
    setYamlInput(sampleYaml);
    setOutputMode("summary");
    setDetailLevel("balanced");
    setExposureFilter("all");
    setWarnNodePort(true);
    setWarnLoadBalancer(true);
    setWarnMissingTargetPort(true);
    setWarnSelectorMismatch(true);
    setWarnNoServices(true);
    setWarnIngressWithoutService(true);
    clearResult();
  };

  const resetAll = () => {
    setYamlInput("");
    setOutputMode("summary");
    setDetailLevel("balanced");
    setExposureFilter("all");
    setWarnNodePort(true);
    setWarnLoadBalancer(true);
    setWarnMissingTargetPort(true);
    setWarnSelectorMismatch(true);
    setWarnNoServices(true);
    setWarnIngressWithoutService(true);
    clearResult();
  };

  return (
    <ToolShell
      title="Kubernetes Service Port Mapper"
      description="Map Service ports to selected workload ports and Ingress backends across Kubernetes manifests."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900">
              Kubernetes YAML
            </label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Paste Services with workload and Ingress manifests to trace declared traffic paths.
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
          <h3 className="text-lg font-semibold text-gray-900">Mapping Settings</h3>

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
                { label: "Port mapping", value: "mapping" },
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
              label="Exposure Filter"
              value={exposureFilter}
              onChange={(value) => {
                setExposureFilter(value as ExposureFilter);
                clearResult();
              }}
              options={[
                { label: "All service types", value: "all" },
                { label: "ClusterIP only", value: "cluster" },
                { label: "NodePort only", value: "node" },
                { label: "LoadBalancer only", value: "loadBalancer" },
                { label: "Ingress-related", value: "ingress" },
              ]}
            />

            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
              <p className="text-sm font-medium text-gray-700">Port fields</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {["port", "targetPort", "nodePort", "containerPort", "host"].map((item) => (
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
          <CheckboxRow checked={warnNodePort} label="Warn about NodePort exposure" onChange={(checked) => { setWarnNodePort(checked); clearResult(); }} />
          <CheckboxRow checked={warnLoadBalancer} label="Warn about LoadBalancer services" onChange={(checked) => { setWarnLoadBalancer(checked); clearResult(); }} />
          <CheckboxRow checked={warnMissingTargetPort} label="Note when targetPort defaults to port" onChange={(checked) => { setWarnMissingTargetPort(checked); clearResult(); }} />
          <CheckboxRow checked={warnSelectorMismatch} label="Warn when service selector does not match labels" onChange={(checked) => { setWarnSelectorMismatch(checked); clearResult(); }} />
          <CheckboxRow checked={warnNoServices} label="Warn when no Service resources are found" onChange={(checked) => { setWarnNoServices(checked); clearResult(); }} />
          <CheckboxRow checked={warnIngressWithoutService} label="Warn when Ingress references unknown services" onChange={(checked) => { setWarnIngressWithoutService(checked); clearResult(); }} />
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Parsing stays in this browser. EndpointSlices, Pod readiness, cloud load balancers, and live traffic are not queried.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={mapPorts} className="yoryantra-btn min-h-[44px] whitespace-nowrap">
          Map Service Ports
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
          <SummaryCard label="Service Ports" value={result.servicePortCount.toLocaleString()} />
          <SummaryCard label="Container Ports" value={result.workloadPortCount.toLocaleString()} />
          <SummaryCard label="Ingress Hosts" value={result.ingressHostCount.toLocaleString()} />
        </div>
      )}

      {result && result.services.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Service Port Mapping</h3>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Service</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Namespace</th>
                  <th className="px-4 py-3 font-semibold">Selector</th>
                  <th className="px-4 py-3 font-semibold">Ports</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {result.services.map((service) => (
                  <tr key={`${service.namespace}-${service.name}`}>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-900">{service.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{service.type}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{service.namespace || "default/unspecified"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      <span className="block max-w-[260px] break-words">{service.selector.join(", ") || "-"}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      <span className="block max-w-[360px] break-words">{formatPorts(service.ports)}</span>
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
          <h3 className="text-sm font-semibold text-gray-900">Port mapping findings</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {result.issues.map((issue, index) => (
              <FindingCard key={`${issue.title}-${index}`} issue={issue} />
            ))}
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Service routing notes</h3>
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
          {output || "Kubernetes service port mapping output will appear here."}
        </pre>
      </div>

      <div className="mt-4 self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
        Manifest text is parsed in this browser. Live EndpointSlices, readiness, network policy, kube-proxy behavior, DNS, and cloud networking are outside the mapping.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Follow the port path in the right order</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A Service receives traffic on <code>spec.ports[].port</code> and sends it to <code>targetPort</code>. If <code>targetPort</code> is omitted, Kubernetes defaults it to the Service port. A named targetPort resolves against a named port on selected Pods; a numeric targetPort does not require the Pod manifest to declare <code>containerPort</code>.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            That distinction matters during static review: a missing numeric <code>containerPort</code> declaration is not proof that routing will fail, while a named targetPort with no matching named Pod port is a much stronger signal.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
            <h2 className="font-semibold text-amber-900">Selectors are namespace-sensitive</h2>
            <p className="mt-2 text-sm leading-relaxed text-amber-800">
              A normal Service selects Pods by label equality inside its own namespace. A matching label set found in another namespace is not a backend for that Service.
            </p>
          </div>
          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h2 className="font-semibold text-gray-900">Selectorless Services are different</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              A Service without a selector can be backed by manually managed EndpointSlices. Static workload-label matching therefore does not classify selectorless Services as broken.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Exposure type changes the meaning of a port</h2>
          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li><strong>ClusterIP</strong> exposes the Service on a cluster-internal virtual IP by default.</li>
            <li><strong>NodePort</strong> adds a port on nodes; the configured cluster range can differ from the common default range.</li>
            <li><strong>LoadBalancer</strong> asks an implementation or cloud integration to provision external load balancing and normally builds on Service networking underneath.</li>
            <li><strong>ExternalName</strong> is DNS indirection rather than a proxy to selected Pods.</li>
            <li><strong>Headless</strong> Services use <code>clusterIP: None</code> and rely on DNS/endpoints rather than the normal virtual IP.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Ingress references are checked as namespaced backends</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Standard Ingress backends name a Service and either a numeric or named Service port. The mapping checks that the referenced Service exists in the same namespace and that the requested Service port is declared in the pasted set. It also reads <code>defaultBackend</code> in addition to rule paths.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What a static mapping still cannot prove</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Matching YAML does not prove that Pods are Ready, EndpointSlices contain usable endpoints, the application listens on the target port, NetworkPolicy allows the flow, kube-proxy or a service mesh is healthy, or a cloud load balancer has finished provisioning.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Kubernetes documents Service selectors, targetPort defaulting, named ports, multi-port Services, selectorless Services, and EndpointSlices in the <a className="underline decoration-gray-300 underline-offset-4 hover:text-gray-900" href="https://kubernetes.io/docs/concepts/services-networking/service/" target="_blank" rel="noreferrer">Service documentation</a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Port-mapping details that often cause confusion</h2>
          <div className="mt-5 space-y-6">
            <Faq title="Is targetPort required?">
              No. If it is omitted, Kubernetes uses the Service <code>port</code> value as the targetPort.
            </Faq>
            <Faq title="Must a Pod declare containerPort for numeric Service routing?">
              No. A numeric targetPort can reach the Pod IP and port even when <code>containerPort</code> is not declared. The declaration is still useful documentation and is required for named-port resolution.
            </Faq>
            <Faq title="Does a matching selector guarantee an endpoint?">
              No. Pod readiness and EndpointSlice state are runtime facts. The comparison here only establishes that pasted Pod-template labels could match the Service selector.
            </Faq>
            <Faq title="Can an Ingress point to a Service in another namespace?">
              Standard Ingress Service backends are namespaced with the Ingress. Cross-namespace routing needs a different mechanism or controller-specific feature.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4"><YoryantraRelatedTools currentHref="/tools/kubernetes-service-port-mapper" /></div>
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
  exposureFilter: ExposureFilter;
  warnNodePort: boolean;
  warnLoadBalancer: boolean;
  warnMissingTargetPort: boolean;
  warnSelectorMismatch: boolean;
  warnNoServices: boolean;
  warnIngressWithoutService: boolean;
}): Result {
  const parsed = parseKubernetesNetworkManifests(options.yamlInput);
  const allServices = parsed.services;
  const ingress = parsed.ingress;
  const workloads = parsed.workloads;
  const workloadPorts = workloads.reduce<WorkloadPort[]>((all, workload) => all.concat(workload.ports), []);
  const services = filterServices(allServices, ingress, options.exposureFilter);
  const issues = buildIssues({ allServices, workloads, ingress, options });
  const base = {
    services,
    workloadPorts,
    workloads,
    ingress,
    issues,
    serviceCount: services.length,
    servicePortCount: services.reduce((total, service) => total + service.ports.length, 0),
    workloadPortCount: workloadPorts.length,
    ingressHostCount: ingress.reduce((total, item) => total + item.hosts.length, 0),
  };
  const output = formatOutput(base, options.outputMode, options.detailLevel);
  return { ...base, output };
}

function parseKubernetesNetworkManifests(input: string): {
  services: KubeService[];
  workloads: WorkloadInfo[];
  ingress: IngressInfo[];
} {
  const documents = parseAllDocuments(input, { prettyErrors: true, strict: true, uniqueKeys: true });
  const parseErrors = documents.reduce<Array<{ message: string }>>((all, document) => all.concat(document.errors), []);
  if (parseErrors.length > 0) throw new Error(parseErrors[0].message);

  const services: KubeService[] = [];
  const workloads: WorkloadInfo[] = [];
  const ingress: IngressInfo[] = [];
  documents.forEach((document, index) => {
    const value = document.toJS({ maxAliasCount: 100 });
    collectNetworkObjects(value, index + 1, services, workloads, ingress);
  });
  return { services, workloads, ingress };
}

function collectNetworkObjects(
  value: unknown,
  documentIndex: number,
  services: KubeService[],
  workloads: WorkloadInfo[],
  ingress: IngressInfo[]
): void {
  if (!isRecord(value)) return;
  if (value.kind === "List" && Array.isArray(value.items)) {
    value.items.forEach((item) => collectNetworkObjects(item, documentIndex, services, workloads, ingress));
    return;
  }

  const kind = readString(value.kind);
  if (kind === "Service") {
    const service = parseServiceObject(value, documentIndex);
    if (service) services.push(service);
    return;
  }
  if (kind === "Ingress") {
    const item = parseIngressObject(value);
    if (item) ingress.push(item);
    return;
  }

  const workload = parseWorkloadObject(value, kind);
  if (workload) workloads.push(workload);
}

function parseServiceObject(root: Record<string, unknown>, documentIndex: number): KubeService | null {
  const metadata = isRecord(root.metadata) ? root.metadata : {};
  const spec = isRecord(root.spec) ? root.spec : {};
  const name = readString(metadata.name);
  if (!name) return null;
  const selectorMap = readStringMap(spec.selector);
  const rawPorts = Array.isArray(spec.ports) ? spec.ports : [];
  const ports: ServicePort[] = [];

  rawPorts.forEach((candidate) => {
    if (!isRecord(candidate)) return;
    const port = readPortValue(candidate.port);
    const rawTargetPort = readPortValue(candidate.targetPort);
    const targetPort = rawTargetPort || port;
    const nodePort = readPortValue(candidate.nodePort);
    const problems: string[] = [];
    if (candidate.port === undefined) problems.push("port is required");
    else if (typeof candidate.port !== "number" || !Number.isInteger(candidate.port)) problems.push("port must be an integer, not a quoted/string value");
    if (candidate.nodePort !== undefined && (typeof candidate.nodePort !== "number" || !Number.isInteger(candidate.nodePort))) problems.push("nodePort must be an integer when specified");
    if (candidate.targetPort !== undefined && typeof candidate.targetPort !== "number" && typeof candidate.targetPort !== "string") problems.push("targetPort must be an integer or named string");
    ports.push({
      name: readString(candidate.name),
      protocol: readString(candidate.protocol) || "TCP",
      appProtocol: readString(candidate.appProtocol),
      port,
      targetPort,
      targetPortWasDefaulted: candidate.targetPort === undefined && Boolean(port),
      nodePort,
      problems,
    });
  });

  return {
    name,
    namespace: readString(metadata.namespace),
    type: readString(spec.type) || "ClusterIP",
    clusterIP: readString(spec.clusterIP),
    externalName: readString(spec.externalName),
    selector: mapToPairs(selectorMap),
    selectorMap,
    ports,
    documentIndex,
  };
}

function parseWorkloadObject(root: Record<string, unknown>, kind: string): WorkloadInfo | null {
  const podSpec = getPodSpec(root, kind);
  const podLabels = getPodTemplateLabels(root, kind);
  if (!podSpec || !podLabels) return null;
  const metadata = isRecord(root.metadata) ? root.metadata : {};
  const workload = readString(metadata.name) || `${kind || "workload"}-unnamed`;
  const namespace = readString(metadata.namespace);
  const ports: WorkloadPort[] = [];
  const containers = Array.isArray(podSpec.containers) ? podSpec.containers : [];

  containers.forEach((candidate, containerIndex) => {
    if (!isRecord(candidate)) return;
    const container = readString(candidate.name) || `container-${containerIndex + 1}`;
    const image = readString(candidate.image);
    const rawPorts = Array.isArray(candidate.ports) ? candidate.ports : [];
    rawPorts.forEach((rawPort) => {
      if (!isRecord(rawPort)) return;
      const containerPort = readPortValue(rawPort.containerPort);
      if (!containerPort) return;
      ports.push({
        workload,
        namespace,
        kind,
        labels: mapToPairs(podLabels),
        labelMap: podLabels,
        container,
        image,
        containerPort,
        name: readString(rawPort.name),
        protocol: readString(rawPort.protocol) || "TCP",
      });
    });
  });

  return { workload, namespace, kind, labels: mapToPairs(podLabels), labelMap: podLabels, ports };
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

function getPodTemplateLabels(root: Record<string, unknown>, kind: string): Record<string, string> | null {
  if (kind === "Pod") {
    const metadata = isRecord(root.metadata) ? root.metadata : {};
    return readStringMap(metadata.labels);
  }
  const spec = isRecord(root.spec) ? root.spec : null;
  if (!spec) return null;
  let template: Record<string, unknown> | null = null;
  if (kind === "CronJob") {
    const jobTemplate = isRecord(spec.jobTemplate) ? spec.jobTemplate : null;
    const jobSpec = jobTemplate && isRecord(jobTemplate.spec) ? jobTemplate.spec : null;
    template = jobSpec && isRecord(jobSpec.template) ? jobSpec.template : null;
  } else {
    template = isRecord(spec.template) ? spec.template : null;
  }
  if (!template) return null;
  const metadata = isRecord(template.metadata) ? template.metadata : {};
  return readStringMap(metadata.labels);
}

function parseIngressObject(root: Record<string, unknown>): IngressInfo | null {
  const metadata = isRecord(root.metadata) ? root.metadata : {};
  const spec = isRecord(root.spec) ? root.spec : {};
  const name = readString(metadata.name);
  if (!name) return null;
  const namespace = readString(metadata.namespace);
  const backends: IngressBackend[] = [];

  const addBackend = (backend: unknown, host: string, path: string) => {
    if (!isRecord(backend)) return;
    const service = isRecord(backend.service) ? backend.service : null;
    if (!service) return;
    const serviceName = readString(service.name);
    const port = isRecord(service.port) ? service.port : {};
    const servicePort = readPortValue(port.number) || readString(port.name);
    if (serviceName) backends.push({ host, path, serviceName, servicePort });
  };

  addBackend(spec.defaultBackend, "*", "defaultBackend");
  const rules = Array.isArray(spec.rules) ? spec.rules : [];
  rules.forEach((rule) => {
    if (!isRecord(rule)) return;
    const host = readString(rule.host) || "*";
    const http = isRecord(rule.http) ? rule.http : null;
    const paths = http && Array.isArray(http.paths) ? http.paths : [];
    paths.forEach((pathItem) => {
      if (!isRecord(pathItem)) return;
      addBackend(pathItem.backend, host, readString(pathItem.path) || "/");
    });
  });

  return {
    name,
    namespace,
    hosts: Array.from(new Set(backends.map((backend) => backend.host).filter((host) => host !== "*"))),
    services: Array.from(new Set(backends.map((backend) => backend.serviceName))),
    backends,
  };
}

function filterServices(services: KubeService[], ingress: IngressInfo[], filter: ExposureFilter): KubeService[] {
  if (filter === "all") return services;
  if (filter === "cluster") return services.filter((service) => service.type === "ClusterIP");
  if (filter === "node") return services.filter((service) => service.type === "NodePort");
  if (filter === "loadBalancer") return services.filter((service) => service.type === "LoadBalancer");
  if (filter === "ingress") {
    const keys = new Set<string>();
    ingress.forEach((item) => item.backends.forEach((backend) => keys.add(`${item.namespace}\u0000${backend.serviceName}`)));
    return services.filter((service) => keys.has(`${service.namespace}\u0000${service.name}`));
  }
  return services;
}

function buildIssues(params: {
  allServices: KubeService[];
  workloads: WorkloadInfo[];
  ingress: IngressInfo[];
  options: {
    warnNodePort: boolean;
    warnLoadBalancer: boolean;
    warnMissingTargetPort: boolean;
    warnSelectorMismatch: boolean;
    warnNoServices: boolean;
    warnIngressWithoutService: boolean;
  };
}): Issue[] {
  const issues: Issue[] = [];
  const { allServices, workloads, ingress, options } = params;

  if (options.warnNoServices && allServices.length === 0) {
    issues.push({ severity: "warning", title: "No Service resources found", message: "No Kubernetes Service object was found in the pasted documents." });
  }

  if (options.warnNodePort) {
    const node = allServices.filter((service) => service.type === "NodePort");
    if (node.length > 0) issues.push({ severity: "warning", title: "NodePort exposure declared", message: `${node.length} Service${node.length === 1 ? "" : "s"} request NodePort exposure. Actual reachability still depends on node networking and firewalls.` });
  }

  if (options.warnLoadBalancer) {
    const load = allServices.filter((service) => service.type === "LoadBalancer");
    if (load.length > 0) issues.push({ severity: "warning", title: "LoadBalancer Service declared", message: `${load.length} Service${load.length === 1 ? "" : "s"} request external load-balancer integration. Provisioning, addresses, and cost depend on the cluster implementation.` });
  }

  if (options.warnMissingTargetPort) {
    const defaulted = allServices.reduce((total, service) => total + service.ports.filter((port) => port.targetPortWasDefaulted).length, 0);
    if (defaulted > 0) issues.push({ severity: "info", title: "targetPort defaults to Service port", message: `${defaulted} Service port entr${defaulted === 1 ? "y omits" : "ies omit"} targetPort. Kubernetes validly defaults each target to the corresponding Service port.` });
  }

  allServices.forEach((service) => {
    validateServicePortShape(service, issues);
    if (!options.warnSelectorMismatch || Object.keys(service.selectorMap).length === 0) return;
    const sameNamespace = workloads.filter((workload) => workload.namespace === service.namespace);
    const selected = sameNamespace.filter((workload) => labelsMatch(service.selectorMap, workload.labelMap));
    if (sameNamespace.length > 0 && selected.length === 0) {
      issues.push({ severity: "warning", title: `No pasted workload matches ${service.name}`, message: `Service ${formatNamespaced(service.namespace, service.name)} has a selector, but none of the pasted Pod-template labels in that namespace satisfy it.` });
      return;
    }
    if (sameNamespace.length === 0) {
      issues.push({ severity: "info", title: `Selector for ${service.name} cannot be cross-checked`, message: `No Pod or Pod-template workload from namespace ${service.namespace || "default/unspecified"} is present in the pasted set.` });
      return;
    }

    service.ports.forEach((port) => {
      if (!port.targetPort || /^\d+$/.test(port.targetPort)) return;
      const namedMatches = selected.reduce<WorkloadPort[]>((all, workload) => all.concat(workload.ports), []).filter((item) => item.name === port.targetPort && item.protocol === port.protocol);
      if (namedMatches.length === 0) {
        issues.push({ severity: "warning", title: `Named targetPort ${port.targetPort} was not found`, message: `Service ${formatNamespaced(service.namespace, service.name)} refers to named targetPort ${port.targetPort}/${port.protocol}, but no selected pasted container declares that named port.` });
      }
    });
  });

  if (options.warnIngressWithoutService) {
    ingress.forEach((item) => {
      item.backends.forEach((backend) => {
        const service = allServices.find((candidate) => candidate.namespace === item.namespace && candidate.name === backend.serviceName);
        if (!service) {
          issues.push({ severity: "warning", title: "Ingress backend Service not found", message: `Ingress ${formatNamespaced(item.namespace, item.name)} points to ${backend.serviceName}, but that Service is not present in the same namespace in the pasted set.` });
          return;
        }
        if (backend.servicePort && !serviceHasPort(service, backend.servicePort)) {
          issues.push({ severity: "warning", title: "Ingress backend port not found", message: `Ingress ${formatNamespaced(item.namespace, item.name)} requests ${backend.serviceName}:${backend.servicePort}, but that port name/number is not declared by the pasted Service.` });
        }
      });
    });
  }

  if (allServices.some((service) => service.type === "ExternalName")) {
    issues.push({ severity: "info", title: "ExternalName uses DNS indirection", message: "ExternalName Services do not select Pods or proxy traffic through the normal Service virtual IP path." });
  }
  if (allServices.some((service) => service.clusterIP === "None")) {
    issues.push({ severity: "info", title: "Headless Service present", message: "clusterIP: None changes discovery semantics; clients resolve backend endpoints rather than using the normal Service virtual IP." });
  }

  if (issues.length === 0) issues.push({ severity: "info", title: "No enabled static mapping concern found", message: "The pasted Service selectors, named target ports, and Ingress backends are internally consistent for the enabled checks." });
  return dedupeIssues(issues);
}

function validateServicePortShape(service: KubeService, issues: Issue[]): void {
  if (service.ports.length > 1 && service.ports.some((port) => !port.name)) {
    issues.push({ severity: "warning", title: `Unnamed port in multi-port Service ${service.name}`, message: "Kubernetes requires port names when a Service exposes more than one port so each entry is unambiguous." });
  }
  const names = service.ports.map((port) => port.name).filter(Boolean);
  if (new Set(names).size !== names.length) {
    issues.push({ severity: "high", title: `Duplicate Service port name in ${service.name}`, message: "Port names within a Service must be unique." });
  }
  service.ports.forEach((port) => {
    port.problems.forEach((problem) => issues.push({ severity: "high", title: `Invalid Service port entry in ${service.name}`, message: problem }));
    if (port.port && !isValidPortNumber(port.port)) issues.push({ severity: "high", title: `Invalid Service port ${port.port}`, message: `Service ${service.name} declares a port outside 1-65535 or a non-integer value.` });
    if (port.nodePort && !isValidPortNumber(port.nodePort)) issues.push({ severity: "high", title: `Invalid nodePort ${port.nodePort}`, message: `Service ${service.name} declares a nodePort outside 1-65535 or a non-integer value. Cluster policy can impose a narrower range.` });
    if (port.protocol && !["TCP", "UDP", "SCTP"].includes(port.protocol)) issues.push({ severity: "high", title: `Unsupported Service protocol ${port.protocol}`, message: `Service ports use TCP, UDP, or SCTP.` });
  });
}

function labelsMatch(selector: Record<string, string>, labels: Record<string, string>): boolean {
  return Object.keys(selector).every((key) => labels[key] === selector[key]);
}

function serviceHasPort(service: KubeService, reference: string): boolean {
  return service.ports.some((port) => port.name === reference || port.port === reference);
}

function isValidPortNumber(value: string): boolean {
  if (!/^\d+$/.test(value)) return false;
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 && number <= 65535;
}

function formatOutput(result: Omit<Result, "output">, mode: OutputMode, detailLevel: DetailLevel): string {
  if (mode === "json") return JSON.stringify(result, null, 2);
  if (mode === "markdown") {
    return [
      "| Service | Type | Namespace | Selector | Ports |",
      "| --- | --- | --- | --- | --- |",
      ...result.services.map((service) => `| ${escapeMarkdown(service.name)} | ${service.type} | ${escapeMarkdown(service.namespace || "-")} | ${escapeMarkdown(service.selector.join(", ") || "-")} | ${escapeMarkdown(formatPorts(service.ports))} |`),
      "",
      "## Ingress backends",
      ...result.ingress.reduce<string[]>((all, item) => all.concat(item.backends.map((backend) => `- ${item.namespace || "default/unspecified"}/${item.name}: ${backend.host}${backend.path} -> ${backend.serviceName}:${backend.servicePort || "?"}`)), []),
      "",
      "## Findings",
      ...result.issues.map((issue) => `- **${escapeMarkdown(issue.title)}:** ${escapeMarkdown(issue.message)}`),
    ].join("\n");
  }
  if (mode === "csv") {
    const rows = [["service", "type", "namespace", "selector", "ports", "cluster_ip", "external_name"], ...result.services.map((service) => [service.name, service.type, service.namespace, service.selector.join("; "), formatPorts(service.ports), service.clusterIP, service.externalName])];
    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }
  if (mode === "checklist") {
    return [
      "Kubernetes Service port review",
      "------------------------------",
      "- [ ] Confirm selectors match intended Pod-template labels in the same namespace.",
      "- [ ] Confirm named targetPorts exist on selected container ports.",
      "- [ ] Treat omitted targetPort as a valid default to the Service port.",
      "- [ ] Confirm NodePort / LoadBalancer exposure is intentional for the target cluster.",
      "- [ ] Confirm Ingress backends name existing Services and Service ports.",
      "- [ ] Check live EndpointSlices and Pod readiness before diagnosing runtime routing.",
      "",
      ...result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
    ].join("\n");
  }
  if (mode === "mapping") {
    return result.services.map((service) => {
      const selected = result.workloads.filter((workload) => workload.namespace === service.namespace && labelsMatch(service.selectorMap, workload.labelMap));
      const lines = [
        `${formatNamespaced(service.namespace, service.name)} (${service.type}${service.clusterIP === "None" ? ", headless" : ""})`,
        `selector: ${service.selector.join(", ") || "none"}`,
        `ports: ${formatPorts(service.ports)}`,
      ];
      if (service.externalName) lines.push(`externalName: ${service.externalName}`);
      if (detailLevel === "detailed") lines.push(`matching pasted workloads: ${selected.map((workload) => workload.workload).join(", ") || "none / not applicable"}`);
      return lines.join("\n");
    }).join("\n\n");
  }

  return [
    "Kubernetes Service port mapping summary",
    "---------------------------------------",
    `Services shown: ${result.serviceCount}`,
    `Service port entries shown: ${result.servicePortCount}`,
    `Declared container ports found: ${result.workloadPortCount}`,
    `Ingress hosts found: ${result.ingressHostCount}`,
    "",
    "Services:",
    ...(result.services.length ? result.services.map((service) => `- ${formatNamespaced(service.namespace, service.name)} (${service.type}): ${formatPorts(service.ports)}; selector ${service.selector.join(", ") || "none"}`) : ["- none shown"]),
    "",
    "Ingress backends:",
    ...(result.ingress.length ? result.ingress.reduce<string[]>((all, item) => all.concat(item.backends.map((backend) => `- ${formatNamespaced(item.namespace, item.name)} ${backend.host}${backend.path} -> ${backend.serviceName}:${backend.servicePort || "?"}`)), []) : ["- none found"]),
    "",
    "Findings:",
    ...result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
  ].join("\n");
}

function formatPorts(ports: ServicePort[]): string {
  if (ports.length === 0) return "-";
  return ports.map((port) => {
    const parts = [
      port.name || "",
      `port ${port.port || "?"}`,
      `target ${port.targetPort || "?"}${port.targetPortWasDefaulted ? " (default)" : ""}`,
      port.nodePort ? `node ${port.nodePort}` : "",
      port.protocol || "TCP",
      port.appProtocol ? `app ${port.appProtocol}` : "",
    ].filter(Boolean);
    return parts.join(" / ");
  }).join("; ");
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

function formatNamespaced(namespace: string, name: string): string {
  return `${namespace || "default/unspecified"}/${name}`;
}

function dedupeIssues(issues: Issue[]): Issue[] {
  const seen = new Set<string>();
  return issues.filter((issue) => {
    const key = `${issue.severity}\u0000${issue.title}\u0000${issue.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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
  if (result.services.some((service) => Object.keys(service.selectorMap).length > 0)) notes.push({ title: "Service selection is label-based", message: "The comparison uses Pod-template labels from the same namespace; it does not assume a Deployment name is a Service backend." });
  if (result.services.some((service) => service.ports.some((port) => port.targetPortWasDefaulted))) notes.push({ title: "Omitted targetPort is valid", message: "Kubernetes defaults targetPort to the Service port. The mapping marks that default instead of treating the omission as an error." });
  notes.push({ title: "Runtime routing starts after the manifest", message: "EndpointSlices, readiness, NetworkPolicy, service mesh behavior, kube-proxy/eBPF implementation, and external load balancers require live cluster evidence." });
  return notes;
}

