"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "summary" | "mapping" | "json" | "markdown" | "csv" | "checklist";
type DetailLevel = "compact" | "balanced" | "detailed";
type ExposureFilter = "all" | "cluster" | "node" | "loadBalancer" | "ingress";

type ServicePort = {
  name: string;
  protocol: string;
  port: string;
  targetPort: string;
  nodePort: string;
};

type KubeService = {
  name: string;
  namespace: string;
  type: string;
  selector: string[];
  ports: ServicePort[];
  documentIndex: number;
};

type WorkloadPort = {
  workload: string;
  namespace: string;
  kind: string;
  labels: string[];
  container: string;
  image: string;
  containerPort: string;
  name: string;
};

type IngressInfo = {
  name: string;
  namespace: string;
  hosts: string[];
  services: string[];
};

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type Result = {
  services: KubeService[];
  workloadPorts: WorkloadPort[];
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
      setError("Please paste Kubernetes Service, Deployment, Pod, or Ingress YAML.");
      setResult(null);
      setOutput("");
      return;
    }

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
      description="Map Kubernetes Service ports from pasted YAML. Review service type, port, targetPort, nodePort, selectors, container ports, ingress hosts, and exposure notes."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900">
              Kubernetes YAML
            </label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Paste Service, Deployment, Pod, and Ingress YAML to map ports and exposure.
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
          <CheckboxRow checked={warnMissingTargetPort} label="Warn when targetPort is missing" onChange={(checked) => { setWarnMissingTargetPort(checked); clearResult(); }} />
          <CheckboxRow checked={warnSelectorMismatch} label="Warn when service selector does not match labels" onChange={(checked) => { setWarnSelectorMismatch(checked); clearResult(); }} />
          <CheckboxRow checked={warnNoServices} label="Warn when no Service resources are found" onChange={(checked) => { setWarnNoServices(checked); clearResult(); }} />
          <CheckboxRow checked={warnIngressWithoutService} label="Warn when Ingress references unknown services" onChange={(checked) => { setWarnIngressWithoutService(checked); clearResult(); }} />
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          This mapper reads pasted YAML only. It does not contact a Kubernetes cluster or check live endpoints.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={mapPorts} className="yoryantra-btn">
          Map Service Ports
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
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">Port mapping findings</h3>

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
          <h3 className="text-sm font-semibold text-blue-900">Kubernetes port guidance</h3>

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
          {output || "Kubernetes service port mapping output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        This tool analyzes pasted Kubernetes YAML locally in your browser. It does not contact a cluster, test endpoints, or verify live service routing.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Mapping Kubernetes Service Ports Before Deployment</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Kubernetes Service YAML can be confusing because a service port, targetPort, nodePort, and containerPort each mean something different. When manifests grow across Services, Deployments, and Ingress resources, mapping the traffic path helps avoid broken routing.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Kubernetes Service Port Mapper extracts Service ports, target ports, node ports, selectors, container ports, and ingress hosts from pasted YAML so you can review exposure and routing in one place.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Using the Kubernetes Service Port Mapper</h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste Kubernetes Service, Deployment, Pod, and Ingress YAML.</li>
            <li>Choose the output format and exposure filter.</li>
            <li>Review service type, selector, port, targetPort, nodePort, and containerPort values.</li>
            <li>Check warnings about exposure, missing target ports, or selector mismatches.</li>
            <li>Copy the summary, mapping, JSON, Markdown, CSV, or checklist output.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Service Port, TargetPort, and NodePort</h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li><strong>port</strong> is the port exposed by the Kubernetes Service inside the cluster.</li>
            <li><strong>targetPort</strong> points to the container port or named port behind the service.</li>
            <li><strong>nodePort</strong> exposes the service on each node when the service type is NodePort.</li>
            <li><strong>containerPort</strong> documents which port the container process listens on.</li>
            <li><strong>Ingress hosts</strong> can route external HTTP traffic to a service and service port.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example Service Mapping</h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Service web-service
type: NodePort
port: 80
targetPort: 8080
nodePort: 30080
selector: app=web`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Selectors Decide Which Pods Receive Traffic</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A Service does not send traffic to a Deployment directly. It selects Pods by labels. If the service selector does not match the Pod template labels, the service may exist but have no useful endpoints.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Use this mapper as a quick review helper, then confirm live routing with kubectl, endpoints, logs, and cluster-aware tests.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>

          <div className="mt-5 space-y-6">
            <Faq title="What does a Kubernetes Service Port Mapper do?">
              It extracts Service ports, target ports, node ports, selectors, container ports, and ingress hosts from pasted Kubernetes YAML.
            </Faq>

            <Faq title="Does this contact my Kubernetes cluster?">
              No. It only analyzes pasted YAML locally in your browser.
            </Faq>

            <Faq title="What is the difference between port and targetPort?">
              port is the Service port. targetPort is the backend container port or named port that receives the traffic.
            </Faq>

            <Faq title="Can it detect selector mismatches?">
              It can compare simple Service selectors with labels found in workload manifests, but it is not a full cluster-aware endpoint checker.
            </Faq>

            <Faq title="Is anything uploaded when I map service ports?">
              No. The mapping runs directly in your browser.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/kubernetes-yaml-resource-summarizer" className="yoryantra-btn-outline">Kubernetes YAML Resource Summarizer</Link>
            <Link href="/tools/yaml-validator" className="yoryantra-btn-outline">YAML Validator</Link>
            <Link href="/tools/docker-compose-ports-checker" className="yoryantra-btn-outline">Docker Compose Ports Checker</Link>
            <Link href="/tools/docker-compose-service-dependency-visualizer" className="yoryantra-btn-outline">Docker Compose Service Dependency Visualizer</Link>
            <Link href="/tools/dockerfile-instruction-explainer" className="yoryantra-btn-outline">Dockerfile Instruction Explainer</Link>
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
  exposureFilter: ExposureFilter;
  warnNodePort: boolean;
  warnLoadBalancer: boolean;
  warnMissingTargetPort: boolean;
  warnSelectorMismatch: boolean;
  warnNoServices: boolean;
  warnIngressWithoutService: boolean;
}): Result {
  const documents = splitDocuments(options.yamlInput);
  const allServices = documents.map(parseService).filter((service): service is KubeService => Boolean(service));
  const workloadPorts = documents.flatMap(parseWorkloadPorts);
  const ingress = documents.map(parseIngress).filter((item): item is IngressInfo => Boolean(item));
  const services = filterServices(allServices, ingress, options.exposureFilter);
  const issues = buildIssues({ services, allServices, workloadPorts, ingress, options });
  const base = {
    services,
    workloadPorts,
    ingress,
    issues,
    serviceCount: services.length,
    servicePortCount: services.reduce((total, service) => total + service.ports.length, 0),
    workloadPortCount: workloadPorts.length,
    ingressHostCount: ingress.reduce((total, item) => total + item.hosts.length, 0),
  };
  const output = formatOutput(base, options.outputMode, options.detailLevel);

  return {
    ...base,
    output,
  };
}

function splitDocuments(input: string) {
  return input
    .split(/^---\s*$/m)
    .map((text, index) => ({ text: text.trim(), index: index + 1 }))
    .filter((doc) => doc.text);
}

function parseService(doc: { text: string; index: number }): KubeService | null {
  const lines = doc.text.split(/\r?\n/);
  const kind = getTopLevelValue(lines, "kind");

  if (kind !== "Service") return null;

  return {
    name: getMetadataValue(lines, "name"),
    namespace: getMetadataValue(lines, "namespace"),
    type: getSpecValue(lines, "type") || "ClusterIP",
    selector: collectMapUnderKey(lines, "selector"),
    ports: collectServicePorts(lines),
    documentIndex: doc.index,
  };
}

function parseWorkloadPorts(doc: { text: string; index: number }) {
  const lines = doc.text.split(/\r?\n/);
  const kind = getTopLevelValue(lines, "kind");

  if (!["Deployment", "StatefulSet", "DaemonSet", "ReplicaSet", "Pod", "Job", "CronJob"].includes(kind)) {
    return [];
  }

  const workload = getMetadataValue(lines, "name");
  const namespace = getMetadataValue(lines, "namespace");
  const labels = collectAllLabels(lines);
  const ports: WorkloadPort[] = [];
  let currentContainer = "";
  let currentImage = "";
  let currentPortName = "";
  let seenContainers = false;

  lines.forEach((line) => {
    if (/^\s*containers:\s*$/.test(line)) seenContainers = true;

    const containerNameMatch = line.match(/^\s*-\s*name:\s*(.+)\s*$/);
    if (containerNameMatch && seenContainers) {
      currentContainer = stripQuotes(containerNameMatch[1].trim());
      currentPortName = "";
    }

    const imageMatch = line.match(/^\s*image:\s*(.+)\s*$/);
    if (imageMatch) currentImage = stripQuotes(imageMatch[1].trim());

    const portNameMatch = line.match(/^\s*-\s*name:\s*(.+)\s*$/);
    if (portNameMatch) currentPortName = stripQuotes(portNameMatch[1].trim());

    const containerPortMatch = line.match(/^\s*containerPort:\s*(.+)\s*$/);
    if (containerPortMatch) {
      ports.push({
        workload,
        namespace,
        kind,
        labels,
        container: currentContainer,
        image: currentImage,
        containerPort: stripQuotes(containerPortMatch[1].trim()),
        name: currentPortName,
      });
    }
  });

  return ports;
}

function parseIngress(doc: { text: string; index: number }): IngressInfo | null {
  const lines = doc.text.split(/\r?\n/);
  const kind = getTopLevelValue(lines, "kind");

  if (kind !== "Ingress") return null;

  return {
    name: getMetadataValue(lines, "name"),
    namespace: getMetadataValue(lines, "namespace"),
    hosts: collectValues(lines, "host"),
    services: collectNestedServiceNames(lines),
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

    if (inMetadata && /^\S/.test(line)) inMetadata = false;

    if (inMetadata) {
      const match = line.match(regex);
      if (match) return stripQuotes(match[1].trim());
    }
  }

  return "";
}

function getSpecValue(lines: string[], key: string) {
  let inSpec = false;
  const regex = new RegExp(`^\\s{2}${key}:\\s*(.+)\\s*$`);

  for (const line of lines) {
    if (/^spec:\s*$/.test(line)) {
      inSpec = true;
      continue;
    }

    if (inSpec && /^\S/.test(line)) inSpec = false;

    if (inSpec) {
      const match = line.match(regex);
      if (match) return stripQuotes(match[1].trim());
    }
  }

  return "";
}

function collectServicePorts(lines: string[]) {
  const ports: ServicePort[] = [];
  let inPorts = false;
  let current: ServicePort | null = null;

  lines.forEach((line) => {
    if (/^\s{2}ports:\s*$/.test(line)) {
      inPorts = true;
      return;
    }

    if (inPorts && /^\S/.test(line)) {
      if (current) ports.push(current);
      current = null;
      inPorts = false;
      return;
    }

    if (!inPorts) return;

    const itemMatch = line.match(/^\s*-\s*([A-Za-z]+):\s*(.+)\s*$/);
    if (itemMatch) {
      if (current) ports.push(current);
      current = emptyPort();
      assignPortField(current, itemMatch[1], itemMatch[2]);
      return;
    }

    const fieldMatch = line.match(/^\s*([A-Za-z]+):\s*(.+)\s*$/);
    if (fieldMatch && current) assignPortField(current, fieldMatch[1], fieldMatch[2]);
  });

  if (current) ports.push(current);

  return ports;
}

function emptyPort(): ServicePort {
  return {
    name: "",
    protocol: "TCP",
    port: "",
    targetPort: "",
    nodePort: "",
  };
}

function assignPortField(port: ServicePort, key: string, value: string) {
  const clean = stripQuotes(value.trim());

  if (key === "name") port.name = clean;
  else if (key === "protocol") port.protocol = clean;
  else if (key === "port") port.port = clean;
  else if (key === "targetPort") port.targetPort = clean;
  else if (key === "nodePort") port.nodePort = clean;
}

function collectMapUnderKey(lines: string[], key: string) {
  const values: string[] = [];
  let active = false;
  let baseIndent = 0;

  lines.forEach((line) => {
    const match = line.match(new RegExp(`^(\\s*)${key}:\\s*$`));
    if (match) {
      active = true;
      baseIndent = match[1].length;
      return;
    }

    if (active) {
      const indent = line.length - line.trimStart().length;
      if (line.trim() && indent <= baseIndent) {
        active = false;
        return;
      }

      const pair = line.trim().match(/^([A-Za-z0-9_.-]+):\s*(.+)$/);
      if (pair) values.push(`${pair[1]}=${stripQuotes(pair[2].trim())}`);
    }
  });

  return Array.from(new Set(values));
}

function collectAllLabels(lines: string[]) {
  const labels = new Set<string>();
  collectMapUnderKey(lines, "labels").forEach((label) => labels.add(label));
  collectMapUnderKey(lines, "matchLabels").forEach((label) => labels.add(label));
  return Array.from(labels);
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

function collectNestedServiceNames(lines: string[]) {
  const values: string[] = [];

  lines.forEach((line, index) => {
    if (/^\s*service:\s*$/.test(line)) {
      for (let offset = index + 1; offset < Math.min(lines.length, index + 8); offset += 1) {
        const match = lines[offset].match(/^\s*name:\s*(.+)\s*$/);
        if (match) values.push(stripQuotes(match[1].trim()));
      }
    }
  });

  return Array.from(new Set(values));
}

function filterServices(services: KubeService[], ingress: IngressInfo[], filter: ExposureFilter) {
  if (filter === "all") return services;
  if (filter === "cluster") return services.filter((service) => service.type === "ClusterIP");
  if (filter === "node") return services.filter((service) => service.type === "NodePort");
  if (filter === "loadBalancer") return services.filter((service) => service.type === "LoadBalancer");
  if (filter === "ingress") {
    const names = new Set(ingress.flatMap((item) => item.services));
    return services.filter((service) => names.has(service.name));
  }

  return services;
}

function buildIssues(params: {
  services: KubeService[];
  allServices: KubeService[];
  workloadPorts: WorkloadPort[];
  ingress: IngressInfo[];
  options: {
    warnNodePort: boolean;
    warnLoadBalancer: boolean;
    warnMissingTargetPort: boolean;
    warnSelectorMismatch: boolean;
    warnNoServices: boolean;
    warnIngressWithoutService: boolean;
  };
}) {
  const issues: Issue[] = [];
  const serviceNames = new Set(params.allServices.map((service) => service.name));

  if (params.options.warnNoServices && params.allServices.length === 0) {
    issues.push({
      severity: "warning",
      title: "No Service resources found",
      message: "No Kubernetes Service resources were found in the pasted YAML.",
    });
  }

  if (params.options.warnNodePort && params.services.some((service) => service.type === "NodePort")) {
    issues.push({
      severity: "info",
      title: "NodePort service found",
      message: "NodePort exposes a port on every node. Confirm this exposure is intended.",
    });
  }

  if (params.options.warnLoadBalancer && params.services.some((service) => service.type === "LoadBalancer")) {
    issues.push({
      severity: "warning",
      title: "LoadBalancer service found",
      message: "LoadBalancer can create external cloud load balancers and expose traffic outside the cluster.",
    });
  }

  if (params.options.warnMissingTargetPort && params.services.some((service) => service.ports.some((port) => !port.targetPort))) {
    issues.push({
      severity: "info",
      title: "targetPort not set on some services",
      message: "When targetPort is omitted, Kubernetes uses the service port value. Confirm that matches the container port.",
    });
  }

  if (params.options.warnSelectorMismatch) {
    const mismatched = params.services.filter((service) =>
      service.selector.length > 0 &&
      !params.workloadPorts.some((port) => service.selector.every((selector) => port.labels.includes(selector)))
    );

    if (mismatched.length > 0) {
      issues.push({
        severity: "warning",
        title: "Possible selector mismatch",
        message: `No matching workload labels were found for: ${mismatched.map((service) => service.name).join(", ")}.`,
      });
    }
  }

  if (params.options.warnIngressWithoutService) {
    const unknown = params.ingress.flatMap((item) => item.services).filter((name) => !serviceNames.has(name));

    if (unknown.length > 0) {
      issues.push({
        severity: "warning",
        title: "Ingress references unknown service",
        message: `Ingress references service names not found in the pasted YAML: ${Array.from(new Set(unknown)).join(", ")}.`,
      });
    }
  }

  if (issues.length === 0) {
    issues.push({
      severity: "info",
      title: "Service ports mapped",
      message: "No obvious service port mapping warning was found from the enabled checks.",
    });
  }

  return issues;
}

function formatOutput(result: Omit<Result, "output">, mode: OutputMode, detailLevel: DetailLevel) {
  if (mode === "json") {
    return JSON.stringify(result, null, 2);
  }

  if (mode === "markdown") {
    return [
      "| Service | Type | Namespace | Selector | Ports |",
      "| --- | --- | --- | --- | --- |",
      ...result.services.map((service) => `| ${service.name} | ${service.type} | ${service.namespace || "-"} | ${escapeMarkdown(service.selector.join(", ") || "-")} | ${escapeMarkdown(formatPorts(service.ports))} |`),
      "",
      "## Findings",
      ...result.issues.map((issue) => `- **${issue.title}:** ${issue.message}`),
    ].join("\n");
  }

  if (mode === "csv") {
    const rows = [
      ["service", "type", "namespace", "selector", "ports"],
      ...result.services.map((service) => [service.name, service.type, service.namespace, service.selector.join("; "), formatPorts(service.ports)]),
    ];

    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }

  if (mode === "checklist") {
    return [
      "Kubernetes Service Port Review Checklist",
      "---------------------------------------",
      "- [ ] Confirm service selectors match workload labels.",
      "- [ ] Confirm service port maps to the intended container targetPort.",
      "- [ ] Confirm NodePort or LoadBalancer exposure is intentional.",
      "- [ ] Confirm Ingress backends point to existing services and ports.",
      "- [ ] Confirm named targetPorts match named container ports.",
      "- [ ] Confirm live endpoints with kubectl before deployment.",
      "",
      "Findings:",
      ...result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
    ].join("\n");
  }

  if (mode === "mapping") {
    return result.services.map((service) => {
      const lines = [
        `${service.name} (${service.type})`,
        `namespace: ${service.namespace || "default/unspecified"}`,
        `selector: ${service.selector.join(", ") || "none"}`,
        `ports: ${formatPorts(service.ports)}`,
      ];

      if (detailLevel === "detailed") {
        const matching = result.workloadPorts.filter((port) => service.selector.every((selector) => port.labels.includes(selector)));
        lines.push(`matching container ports: ${matching.map((port) => `${port.workload}/${port.container}:${port.containerPort}`).join(", ") || "not found"}`);
      }

      return lines.join("\n");
    }).join("\n\n");
  }

  return [
    "Kubernetes Service Port Mapping Summary",
    "---------------------------------------",
    `Services: ${result.serviceCount}`,
    `Service ports: ${result.servicePortCount}`,
    `Container ports found: ${result.workloadPortCount}`,
    `Ingress hosts: ${result.ingressHostCount}`,
    "",
    "Services:",
    ...result.services.map((service) => `- ${service.name} (${service.type}): ${formatPorts(service.ports)}; selector ${service.selector.join(", ") || "none"}`),
    "",
    "Ingress:",
    ...(result.ingress.length ? result.ingress.map((item) => `- ${item.name}: hosts ${item.hosts.join(", ") || "none"} -> services ${item.services.join(", ") || "none"}`) : ["- none found"]),
    "",
    "Findings:",
    ...result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
  ].join("\n");
}

function formatPorts(ports: ServicePort[]) {
  if (ports.length === 0) return "-";

  return ports.map((port) => {
    const parts = [
      port.name ? `${port.name}` : "",
      `port ${port.port || "?"}`,
      `target ${port.targetPort || "same as port"}`,
      port.nodePort ? `node ${port.nodePort}` : "",
      port.protocol ? port.protocol : "",
    ].filter(Boolean);

    return parts.join(" / ");
  }).join("; ");
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

  if (result.serviceCount > 0) {
    notes.push({
      title: "Service routing depends on selectors",
      message: "A Service routes to Pods selected by labels, not directly to a Deployment name.",
    });
  }

  if (result.services.some((service) => ["NodePort", "LoadBalancer"].includes(service.type))) {
    notes.push({
      title: "Review external exposure",
      message: "NodePort and LoadBalancer can expose traffic beyond the cluster depending on infrastructure and firewall rules.",
    });
  }

  notes.push({
    title: "Check live endpoints too",
    message: "YAML review is helpful, but kubectl endpoints, logs, and live traffic tests confirm actual routing.",
  });

  return notes;
}
