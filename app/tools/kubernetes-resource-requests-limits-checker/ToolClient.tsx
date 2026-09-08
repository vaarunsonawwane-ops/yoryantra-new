"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { parseAllDocuments } from "yaml";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "summary" | "table" | "json" | "markdown" | "csv" | "checklist";
type DetailLevel = "compact" | "balanced" | "detailed";
type ContainerFilter = "all" | "missingRequests" | "missingLimits" | "complete" | "initContainers";
type ContainerStatus = "complete" | "missing-requests" | "missing-limits" | "missing-both" | "pod-level-budget";

type PodBudget = {
  documentIndex: number;
  kind: string;
  workload: string;
  namespace: string;
  cpuRequest: string;
  memoryRequest: string;
  cpuLimit: string;
  memoryLimit: string;
};

type ContainerResource = {
  documentIndex: number;
  kind: string;
  workload: string;
  namespace: string;
  container: string;
  image: string;
  containerType: "container" | "initContainer";
  cpuRequest: string;
  memoryRequest: string;
  cpuLimit: string;
  memoryLimit: string;
  cpuRequestMilli: number | null;
  memoryRequestBytes: number | null;
  cpuLimitMilli: number | null;
  memoryLimitBytes: number | null;
  podBudget: PodBudget | null;
  status: ContainerStatus;
};

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type ParseResult = {
  containers: ContainerResource[];
  podBudgets: PodBudget[];
  ignoredEphemeralContainers: number;
};

type Result = {
  containers: ContainerResource[];
  allContainers: ContainerResource[];
  podBudgets: PodBudget[];
  issues: Issue[];
  output: string;
  containerCount: number;
  visibleContainerCount: number;
  completeCount: number;
  missingRequestsCount: number;
  missingLimitsCount: number;
  podBudgetCount: number;
  ignoredEphemeralContainers: number;
};

const sampleYaml = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-service
  namespace: production
spec:
  replicas: 3
  template:
    spec:
      initContainers:
        - name: migrate
          image: ghcr.io/example/migrate:v1.4.0
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
      containers:
        - name: api
          image: ghcr.io/example/api:v1.4.0
          resources:
            requests:
              cpu: "250m"
              memory: "256Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
        - name: sidecar
          image: busybox:1.36
---
apiVersion: batch/v1
kind: CronJob
metadata:
  name: cleanup
spec:
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: cleanup
              image: busybox:1.36
              resources:
                limits:
                  memory: "128Mi"`;

export default function ToolClient() {
  const [yamlInput, setYamlInput] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [detailLevel, setDetailLevel] = useState<DetailLevel>("balanced");
  const [containerFilter, setContainerFilter] = useState<ContainerFilter>("all");
  const [warnMissingRequests, setWarnMissingRequests] = useState(true);
  const [warnMissingLimits, setWarnMissingLimits] = useState(true);
  const [warnLimitWithoutRequest, setWarnLimitWithoutRequest] = useState(true);
  const [warnNoResources, setWarnNoResources] = useState(true);
  const [warnMemoryOnly, setWarnMemoryOnly] = useState(true);
  const [warnNoContainers, setWarnNoContainers] = useState(true);
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

  const checkResources = () => {
    if (!yamlInput.trim()) {
      setError("Paste Kubernetes YAML manifests before checking resources.");
      setResult(null);
      setOutput("");
      return;
    }

    try {
      const next = buildResult({
        yamlInput,
        outputMode,
        detailLevel,
        containerFilter,
        warnMissingRequests,
        warnMissingLimits,
        warnLimitWithoutRequest,
        warnNoResources,
        warnMemoryOnly,
        warnNoContainers,
      });
      setResult(next);
      setOutput(next.output);
      setError("");
      setCopied(false);
    } catch (caught) {
      setResult(null);
      setOutput("");
      setCopied(false);
      setError(caught instanceof Error ? caught.message : "Unable to check the Kubernetes resources.");
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
    setContainerFilter("all");
    setWarnMissingRequests(true);
    setWarnMissingLimits(true);
    setWarnLimitWithoutRequest(true);
    setWarnNoResources(true);
    setWarnMemoryOnly(true);
    setWarnNoContainers(true);
    clearResult();
  };

  const resetAll = () => {
    setYamlInput("");
    setOutputMode("summary");
    setDetailLevel("balanced");
    setContainerFilter("all");
    setWarnMissingRequests(true);
    setWarnMissingLimits(true);
    setWarnLimitWithoutRequest(true);
    setWarnNoResources(true);
    setWarnMemoryOnly(true);
    setWarnNoContainers(true);
    clearResult();
  };

  return (
    <ToolShell
      title="Kubernetes Resource Requests and Limits Checker"
      description="Check container and Pod-level CPU or memory declarations, quantity errors, missing fields, and request-limit conflicts."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900">Kubernetes YAML</label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Paste Pods or workload manifests. Multi-document YAML and Kubernetes List objects are supported.
            </p>
          </div>
          <textarea
            value={yamlInput}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
              setYamlInput(event.target.value);
              clearResult();
            }}
            placeholder={sampleYaml}
            spellCheck={false}
            className="min-h-[520px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
        </div>

        <div className="self-start rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Resource check settings</h3>
          <div className="mt-4 space-y-4">
            <YoryantraSelect
              label="Output"
              value={outputMode}
              onChange={(value: string) => {
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
              label="Detail"
              value={detailLevel}
              onChange={(value: string) => {
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
              label="Container view"
              value={containerFilter}
              onChange={(value: string) => {
                setContainerFilter(value as ContainerFilter);
                clearResult();
              }}
              options={[
                { label: "All app and init containers", value: "all" },
                { label: "Missing explicit requests", value: "missingRequests" },
                { label: "Missing explicit limits", value: "missingLimits" },
                { label: "Covered request and limit fields", value: "complete" },
                { label: "Init containers only", value: "initContainers" },
              ]}
            />
          </div>

          <div className="mt-5 border-t border-gray-200 pt-5">
            <p className="text-sm font-semibold text-gray-900">Findings</p>
            <div className="mt-3 space-y-3">
              <CheckboxRow checked={warnMissingRequests} onChange={setWarnMissingRequests} label="Missing explicit CPU or memory requests" />
              <CheckboxRow checked={warnMissingLimits} onChange={setWarnMissingLimits} label="Missing explicit CPU or memory limits" />
              <CheckboxRow checked={warnLimitWithoutRequest} onChange={setWarnLimitWithoutRequest} label="Limit present without matching request" />
              <CheckboxRow checked={warnNoResources} onChange={setWarnNoResources} label="No container or Pod-level resource budget" />
              <CheckboxRow checked={warnMemoryOnly} onChange={setWarnMemoryOnly} label="Only one compute resource family configured" />
              <CheckboxRow checked={warnNoContainers} onChange={setWarnNoContainers} label="No supported containers found" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={checkResources} className="min-h-11 whitespace-nowrap rounded-xl bg-[var(--green)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">Check Resources</button>
        <button type="button" onClick={loadExample} className="min-h-11 whitespace-nowrap rounded-xl border border-[var(--green)] px-5 py-3 text-sm font-semibold text-[var(--green)] transition hover:bg-green-50">Load Example</button>
        <button type="button" onClick={resetAll} className="min-h-11 whitespace-nowrap rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50">Reset</button>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
        Pasted YAML is processed in the browser. No cluster, metrics API, admission controller, LimitRange, ResourceQuota, or live Pod state is queried.
      </div>

      {error ? <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">{error}</div> : null}

      {result ? (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <SummaryCard label="Containers" value={String(result.containerCount)} />
            <SummaryCard label="Visible" value={String(result.visibleContainerCount)} />
            <SummaryCard label="Covered" value={String(result.completeCount)} />
            <SummaryCard label="Missing requests" value={String(result.missingRequestsCount)} />
            <SummaryCard label="Pod budgets" value={String(result.podBudgetCount)} />
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="text-lg font-semibold text-gray-900">Container resource table</h3>
            <p className="mt-1 text-sm text-gray-500">The filter changes this view; findings still consider all supported containers in the pasted manifests.</p>
            <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
              <table className="w-full min-w-[1180px] text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Workload</th>
                    <th className="px-4 py-3 font-semibold">Container</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Requests</th>
                    <th className="px-4 py-3 font-semibold">Limits</th>
                    <th className="px-4 py-3 font-semibold">Pod budget</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {result.containers.length ? result.containers.map((container, index) => (
                    <tr key={`${container.documentIndex}-${container.workload}-${container.container}-${index}`}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">{container.kind}/{container.workload || "unnamed"}<span className="block text-gray-500">{container.namespace || "default"}</span></td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-900">{container.container || "-"}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{container.containerType}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">{formatRequest(container)}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">{formatLimit(container)}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">{formatPodBudget(container.podBudget)}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{statusLabel(container.status)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">No containers match the selected view.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}

      {result && result.issues.length ? (
        <div className="mt-6 grid items-start gap-4 md:grid-cols-2">
          {result.issues.map((issue, index) => <IssueCard key={`${issue.title}-${index}`} issue={issue} />)}
        </div>
      ) : null}

      {notes.length ? (
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
          <h3 className="text-lg font-semibold text-gray-900">Interpretation notes</h3>
          <div className="mt-3 divide-y divide-gray-200">
            {notes.map((note) => (
              <div key={note.title} className="py-3 first:pt-0 last:pb-0">
                <p className="text-sm font-semibold text-gray-900">{note.title}</p>
                <p className="mt-1 text-sm leading-6 text-gray-600">{note.message}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-8">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Output</h3>
          {output ? <button type="button" onClick={copyOutput} className="min-h-11 whitespace-nowrap rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-50">{copied ? "Copied" : "Copy"}</button> : null}
        </div>
        <pre className="yoryantra-output min-h-[320px] overflow-auto whitespace-pre-wrap break-words text-sm">{output || "Kubernetes resource findings will appear here."}</pre>
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">A missing request is not always an absent runtime request</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Requests influence scheduling. Limits control how much CPU or memory a workload may consume, but Kubernetes treats CPU and memory limits differently: CPU is throttled, while memory limits are enforced reactively and can lead to an OOM kill under pressure.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            There is an important admission-time detail: when a resource has a limit but no request, Kubernetes can copy that limit into the request if no admission mechanism supplied another default. A namespace LimitRange can also inject defaults. This page therefore distinguishes “not written in this manifest” from “guaranteed to remain absent after admission.”
          </p>
        </div>

        <div className="grid items-start gap-5 md:grid-cols-2">
          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-lg font-semibold text-gray-900">Pod-level resources change the review</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Kubernetes supports Pod-level CPU and memory requests and limits behind the PodLevelResources feature, Beta since 1.34 and enabled by default in current Kubernetes releases. When a pasted Pod spec has <code>spec.resources</code>, the result shows that budget rather than pretending every container must carry the complete budget individually.
            </p>
          </div>

          <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="text-lg font-semibold text-amber-900">Limits are not a universal “must have” rule</h2>
            <p className="mt-3 text-sm leading-6 text-amber-800">
              Platform policy matters. Some teams require CPU and memory limits; others deliberately avoid CPU limits for latency-sensitive services. Missing limits are therefore reported as a policy decision unless another concrete conflict exists.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Quantity mistakes can be tiny on screen and huge in meaning</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            CPU <code>500m</code> means half a CPU. Kubernetes does not accept CPU precision finer than <code>1m</code>. Memory is measured in bytes and suffix case matters: <code>400Mi</code> is hundreds of mebibytes, while <code>400m</code> means four-tenths of a byte. The parser validates CPU and memory quantities before comparing request and limit values so those mistakes do not quietly become ordinary “missing field” findings.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Request greater than limit is a different class of finding</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A container that explicitly requests more CPU or memory than its explicit limit is surfaced as a high-severity conflict. Pod-level budgets receive the same comparison. That is different from an omitted field, where admission defaults, Pod-level resources, or deliberate platform policy may still be involved.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Init containers need their own capacity reasoning</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Init-container resources are listed so they cannot hide inside a workload review, but this page does not turn the table into a Pod scheduler calculation. Kubernetes uses special effective-resource rules for init containers, and restartable sidecar-style init containers add further accounting details. Use a dedicated calculator when you need Pod-level capacity totals.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What static YAML cannot answer</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-gray-600">
            <li>Actual CPU usage, working-set memory, throttling, OOM history, or peak traffic.</li>
            <li>LimitRange defaults, ResourceQuota admission, mutating policies, or organization-specific policies unless those effects are already present in the pasted manifest.</li>
            <li>HPA or VPA recommendations, node allocatable capacity, scheduling constraints, or application SLOs.</li>
            <li>Effective Pod request calculations involving init-container sequencing, Pod overhead, or every current sidecar rule.</li>
          </ul>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-lg font-semibold text-gray-900">Kubernetes references behind these checks</h2>
          <p className="mt-3 leading-relaxed text-gray-600">
            The Kubernetes resource-management guide defines requests, limits, quantity units, limit-to-request fallback, and Pod-level resources. LimitRange documentation explains the namespace defaults that static workload YAML cannot see by itself.
          </p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <a className="font-semibold text-[var(--green)] underline-offset-4 hover:underline" href="https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/" target="_blank" rel="noreferrer">Resource management</a>
            <a className="font-semibold text-[var(--green)] underline-offset-4 hover:underline" href="https://kubernetes.io/docs/concepts/policy/limit-range/" target="_blank" rel="noreferrer">LimitRange defaults</a>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/kubernetes-resource-requests-limits-checker" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function buildResult(options: {
  yamlInput: string;
  outputMode: OutputMode;
  detailLevel: DetailLevel;
  containerFilter: ContainerFilter;
  warnMissingRequests: boolean;
  warnMissingLimits: boolean;
  warnLimitWithoutRequest: boolean;
  warnNoResources: boolean;
  warnMemoryOnly: boolean;
  warnNoContainers: boolean;
}): Result {
  const parsed = parseContainers(options.yamlInput);
  const allContainers = parsed.containers;
  const containers = filterContainers(allContainers, options.containerFilter);
  const issues = buildIssues(allContainers, parsed.podBudgets, parsed.ignoredEphemeralContainers, options);
  const completeCount = allContainers.filter((container) => container.status === "complete" || container.status === "pod-level-budget").length;
  const missingRequestsCount = allContainers.filter((container) => !hasExplicitRequests(container)).length;
  const missingLimitsCount = allContainers.filter((container) => !hasExplicitLimits(container)).length;
  const base = {
    containers,
    allContainers,
    podBudgets: parsed.podBudgets,
    issues,
    containerCount: allContainers.length,
    visibleContainerCount: containers.length,
    completeCount,
    missingRequestsCount,
    missingLimitsCount,
    podBudgetCount: parsed.podBudgets.length,
    ignoredEphemeralContainers: parsed.ignoredEphemeralContainers,
  };
  return { ...base, output: formatOutput(base, options.outputMode, options.detailLevel) };
}

function parseContainers(input: string): ParseResult {
  const documents = parseAllDocuments(input, { uniqueKeys: true, prettyErrors: true });
  const containers: ContainerResource[] = [];
  const podBudgets: PodBudget[] = [];
  let ignoredEphemeralContainers = 0;

  documents.forEach((document, index) => {
    if (document.errors.length) throw new Error(`Kubernetes YAML document ${index + 1}: ${document.errors[0].message}`);
    const value = document.toJS({ maxAliasCount: 100 }) as unknown;
    if (value == null) return;
    const parsed = parseKubernetesObject(value, index + 1);
    containers.push(...parsed.containers);
    podBudgets.push(...parsed.podBudgets);
    ignoredEphemeralContainers += parsed.ignoredEphemeralContainers;
  });

  return { containers, podBudgets, ignoredEphemeralContainers };
}

function parseKubernetesObject(value: unknown, documentIndex: number): ParseResult {
  if (!isRecord(value)) throw new Error(`Document ${documentIndex} must contain a Kubernetes object.`);
  if (String(value.kind || "") === "List") {
    const result: ParseResult = { containers: [], podBudgets: [], ignoredEphemeralContainers: 0 };
    const items = Array.isArray(value.items) ? value.items : [];
    items.forEach((item) => {
      const child = parseKubernetesObject(item, documentIndex);
      result.containers.push(...child.containers);
      result.podBudgets.push(...child.podBudgets);
      result.ignoredEphemeralContainers += child.ignoredEphemeralContainers;
    });
    return result;
  }

  const kind = stringValue(value.kind) || "Unknown";
  const metadata = isRecord(value.metadata) ? value.metadata : {};
  const workload = stringValue(metadata.name) || `unnamed-${documentIndex}`;
  const namespace = stringValue(metadata.namespace) || "default";
  const podSpec = getPodSpec(value, kind);
  if (!podSpec) return { containers: [], podBudgets: [], ignoredEphemeralContainers: 0 };

  const podBudget = parsePodBudget(podSpec, documentIndex, kind, workload, namespace);
  const rawContainers = Array.isArray(podSpec.containers) ? podSpec.containers : [];
  const rawInitContainers = Array.isArray(podSpec.initContainers) ? podSpec.initContainers : [];
  const ephemeral = Array.isArray(podSpec.ephemeralContainers) ? podSpec.ephemeralContainers.length : 0;
  const containers = [
    ...parseContainerArray(rawContainers, "container", documentIndex, kind, workload, namespace, podBudget),
    ...parseContainerArray(rawInitContainers, "initContainer", documentIndex, kind, workload, namespace, podBudget),
  ];

  return { containers, podBudgets: podBudget ? [podBudget] : [], ignoredEphemeralContainers: ephemeral };
}

function getPodSpec(value: Record<string, unknown>, kind: string): Record<string, unknown> | null {
  const spec = isRecord(value.spec) ? value.spec : null;
  if (!spec) return null;
  if (kind === "Pod") return spec;
  if (kind === "CronJob") {
    const jobTemplate = isRecord(spec.jobTemplate) ? spec.jobTemplate : null;
    const jobSpec = jobTemplate && isRecord(jobTemplate.spec) ? jobTemplate.spec : null;
    const template = jobSpec && isRecord(jobSpec.template) ? jobSpec.template : null;
    return template && isRecord(template.spec) ? template.spec : null;
  }
  if (["Deployment", "StatefulSet", "DaemonSet", "ReplicaSet", "ReplicationController", "Job"].includes(kind)) {
    const template = isRecord(spec.template) ? spec.template : null;
    return template && isRecord(template.spec) ? template.spec : null;
  }
  return null;
}

function parsePodBudget(
  podSpec: Record<string, unknown>,
  documentIndex: number,
  kind: string,
  workload: string,
  namespace: string
): PodBudget | null {
  if (!isRecord(podSpec.resources)) return null;
  const resources = podSpec.resources;
  const requests = isRecord(resources.requests) ? resources.requests : {};
  const limits = isRecord(resources.limits) ? resources.limits : {};
  const budget: PodBudget = {
    documentIndex,
    kind,
    workload,
    namespace,
    cpuRequest: readQuantity(requests, "cpu", `${kind}/${workload} Pod-level CPU request`),
    memoryRequest: readQuantity(requests, "memory", `${kind}/${workload} Pod-level memory request`),
    cpuLimit: readQuantity(limits, "cpu", `${kind}/${workload} Pod-level CPU limit`),
    memoryLimit: readQuantity(limits, "memory", `${kind}/${workload} Pod-level memory limit`),
  };
  validateResourcePair(budget.cpuRequest, budget.cpuLimit, "cpu");
  validateResourcePair(budget.memoryRequest, budget.memoryLimit, "memory");
  return budget.cpuRequest || budget.memoryRequest || budget.cpuLimit || budget.memoryLimit ? budget : null;
}

function parseContainerArray(
  rawContainers: unknown[],
  containerType: "container" | "initContainer",
  documentIndex: number,
  kind: string,
  workload: string,
  namespace: string,
  podBudget: PodBudget | null
): ContainerResource[] {
  return rawContainers.map((raw, index) => {
    if (!isRecord(raw)) throw new Error(`${kind}/${workload}: ${containerType} entry ${index + 1} must be an object.`);
    const name = stringValue(raw.name) || `${containerType}-${index + 1}`;
    const resources = raw.resources == null ? {} : requireRecord(raw.resources, `${kind}/${workload} ${name} resources`);
    const requests = resources.requests == null ? {} : requireRecord(resources.requests, `${kind}/${workload} ${name} requests`);
    const limits = resources.limits == null ? {} : requireRecord(resources.limits, `${kind}/${workload} ${name} limits`);
    const cpuRequest = readQuantity(requests, "cpu", `${kind}/${workload} ${name} CPU request`);
    const memoryRequest = readQuantity(requests, "memory", `${kind}/${workload} ${name} memory request`);
    const cpuLimit = readQuantity(limits, "cpu", `${kind}/${workload} ${name} CPU limit`);
    const memoryLimit = readQuantity(limits, "memory", `${kind}/${workload} ${name} memory limit`);
    const cpuRequestMilli = cpuRequest ? parseCpu(cpuRequest) : null;
    const memoryRequestBytes = memoryRequest ? parseMemory(memoryRequest) : null;
    const cpuLimitMilli = cpuLimit ? parseCpu(cpuLimit) : null;
    const memoryLimitBytes = memoryLimit ? parseMemory(memoryLimit) : null;
    const base: ContainerResource = {
      documentIndex,
      kind,
      workload,
      namespace,
      container: name,
      image: stringValue(raw.image),
      containerType,
      cpuRequest,
      memoryRequest,
      cpuLimit,
      memoryLimit,
      cpuRequestMilli,
      memoryRequestBytes,
      cpuLimitMilli,
      memoryLimitBytes,
      podBudget,
      status: "missing-both",
    };
    base.status = getStatus(base);
    return base;
  });
}

function getStatus(container: ContainerResource): ContainerStatus {
  const requestCovered = hasExplicitRequests(container) || podHasCompleteRequests(container.podBudget);
  const limitCovered = hasExplicitLimits(container) || podHasCompleteLimits(container.podBudget);
  if (container.podBudget && requestCovered && limitCovered && (!hasExplicitRequests(container) || !hasExplicitLimits(container))) return "pod-level-budget";
  if (requestCovered && limitCovered) return "complete";
  if (!requestCovered && !limitCovered) return "missing-both";
  if (!requestCovered) return "missing-requests";
  return "missing-limits";
}

function filterContainers(containers: ContainerResource[], filter: ContainerFilter): ContainerResource[] {
  if (filter === "all") return containers;
  if (filter === "missingRequests") return containers.filter((container) => !hasExplicitRequests(container));
  if (filter === "missingLimits") return containers.filter((container) => !hasExplicitLimits(container));
  if (filter === "complete") return containers.filter((container) => container.status === "complete" || container.status === "pod-level-budget");
  if (filter === "initContainers") return containers.filter((container) => container.containerType === "initContainer");
  return containers;
}

function buildIssues(
  containers: ContainerResource[],
  podBudgets: PodBudget[],
  ignoredEphemeralContainers: number,
  options: { warnMissingRequests: boolean; warnMissingLimits: boolean; warnLimitWithoutRequest: boolean; warnNoResources: boolean; warnMemoryOnly: boolean; warnNoContainers: boolean }
): Issue[] {
  const issues: Issue[] = [];
  if (options.warnNoContainers && !containers.length) issues.push({ severity: "warning", title: "No supported containers found", message: "No app containers or initContainers were found under a supported Pod or workload template." });

  const noResourceContainers = containers.filter((container) => !container.cpuRequest && !container.memoryRequest && !container.cpuLimit && !container.memoryLimit && !container.podBudget);
  if (options.warnNoResources && noResourceContainers.length) issues.push({ severity: "warning", title: "No declared resource budget", message: `${noResourceContainers.length} container${noResourceContainers.length === 1 ? " has" : "s have"} no CPU/memory fields and no pasted Pod-level budget.` });

  const missingRequests = containers.filter((container) => !hasExplicitRequests(container));
  if (options.warnMissingRequests && missingRequests.length) {
    const coveredByPod = missingRequests.filter((container) => podHasCompleteRequests(container.podBudget)).length;
    const limitFallback = missingRequests.filter((container) => hasBothLimits(container)).length;
    issues.push({ severity: coveredByPod === missingRequests.length ? "info" : "warning", title: "Explicit requests are incomplete", message: `${missingRequests.length} container${missingRequests.length === 1 ? " is" : "s are"} missing an explicit CPU or memory request. ${coveredByPod ? `${coveredByPod} sit under a complete pasted Pod-level request budget. ` : ""}${limitFallback ? `${limitFallback} have both limits, which Kubernetes may copy into requests when admission has not supplied another default.` : ""}`.trim() });
  }

  const missingLimits = containers.filter((container) => !hasExplicitLimits(container));
  if (options.warnMissingLimits && missingLimits.length) issues.push({ severity: "info", title: "Explicit limits are incomplete", message: `${missingLimits.length} container${missingLimits.length === 1 ? " is" : "s are"} missing an explicit CPU or memory limit. Whether that is acceptable depends on platform and workload policy.` });

  if (options.warnLimitWithoutRequest) {
    const limitWithoutRequest = containers.filter((container) => (container.cpuLimit && !container.cpuRequest) || (container.memoryLimit && !container.memoryRequest));
    if (limitWithoutRequest.length) issues.push({ severity: "info", title: "Limit without matching request", message: `${limitWithoutRequest.length} container${limitWithoutRequest.length === 1 ? " has" : "s have"} at least one limit without the same explicit request; admission defaults or Kubernetes limit-to-request copying can affect the final Pod spec.` });
  }

  if (options.warnMemoryOnly) {
    const oneFamily = containers.filter((container) => Boolean(container.cpuRequest || container.cpuLimit) !== Boolean(container.memoryRequest || container.memoryLimit));
    if (oneFamily.length) issues.push({ severity: "info", title: "Only one compute resource family is declared", message: `${oneFamily.length} container${oneFamily.length === 1 ? " configures" : "s configure"} CPU without memory, or memory without CPU.` });
  }

  if (podBudgets.length) issues.push({ severity: "info", title: "Pod-level resource budgets detected", message: `${podBudgets.length} Pod template${podBudgets.length === 1 ? " contains" : "s contain"} spec.resources. Current Kubernetes can use Pod-level CPU and memory budgets when the PodLevelResources feature is enabled.` });
  if (ignoredEphemeralContainers) issues.push({ severity: "info", title: "Ephemeral containers are not scored", message: `${ignoredEphemeralContainers} ephemeral container${ignoredEphemeralContainers === 1 ? " was" : "s were"} present. Ephemeral containers are debugging constructs and are not included in this app/init-container resource score.` });

  const conflicts = findRequestLimitConflicts(containers, podBudgets);
  conflicts.forEach((message) => issues.unshift({ severity: "high", title: "Request exceeds limit", message }));
  if (!issues.length) issues.push({ severity: "info", title: "No configured finding triggered", message: "The supported containers passed the enabled static checks. Runtime sizing still requires metrics and policy context." });
  return issues;
}

function findRequestLimitConflicts(containers: ContainerResource[], podBudgets: PodBudget[]): string[] {
  const messages: string[] = [];
  containers.forEach((container) => {
    if (container.cpuRequestMilli != null && container.cpuLimitMilli != null && container.cpuRequestMilli > container.cpuLimitMilli) messages.push(`${container.kind}/${container.workload} ${container.container}: CPU request ${container.cpuRequest} is greater than limit ${container.cpuLimit}.`);
    if (container.memoryRequestBytes != null && container.memoryLimitBytes != null && container.memoryRequestBytes > container.memoryLimitBytes) messages.push(`${container.kind}/${container.workload} ${container.container}: memory request ${container.memoryRequest} is greater than limit ${container.memoryLimit}.`);
  });
  podBudgets.forEach((budget) => {
    if (budget.cpuRequest && budget.cpuLimit && parseCpu(budget.cpuRequest) > parseCpu(budget.cpuLimit)) messages.push(`${budget.kind}/${budget.workload}: Pod-level CPU request ${budget.cpuRequest} is greater than limit ${budget.cpuLimit}.`);
    if (budget.memoryRequest && budget.memoryLimit && parseMemory(budget.memoryRequest) > parseMemory(budget.memoryLimit)) messages.push(`${budget.kind}/${budget.workload}: Pod-level memory request ${budget.memoryRequest} is greater than limit ${budget.memoryLimit}.`);
  });
  return messages;
}

function formatOutput(result: Omit<Result, "output">, mode: OutputMode, detailLevel: DetailLevel): string {
  if (mode === "json") {
    return JSON.stringify({
      containers: result.containers.map(stripNumericFields),
      podBudgets: result.podBudgets,
      issues: result.issues,
      totals: {
        containers: result.containerCount,
        visibleContainers: result.visibleContainerCount,
        covered: result.completeCount,
        missingExplicitRequests: result.missingRequestsCount,
        missingExplicitLimits: result.missingLimitsCount,
      },
    }, null, 2);
  }

  if (mode === "markdown") {
    return [
      "| Workload | Container | Type | Requests | Limits | Pod budget | Status |",
      "|---|---|---|---|---|---|---|",
      ...result.containers.map((container) => `| ${escapeMarkdown(`${container.kind}/${container.workload}`)} | ${escapeMarkdown(container.container)} | ${container.containerType} | ${escapeMarkdown(formatRequest(container))} | ${escapeMarkdown(formatLimit(container))} | ${escapeMarkdown(formatPodBudget(container.podBudget))} | ${statusLabel(container.status)} |`),
      "",
      "## Findings",
      ...result.issues.map((issue) => `- **${issue.title}:** ${issue.message}`),
    ].join("\n");
  }

  if (mode === "csv") {
    const rows = [
      ["kind", "workload", "namespace", "container", "type", "image", "cpu_request", "memory_request", "cpu_limit", "memory_limit", "pod_budget", "status"],
      ...result.containers.map((container) => [container.kind, container.workload, container.namespace, container.container, container.containerType, container.image, container.cpuRequest, container.memoryRequest, container.cpuLimit, container.memoryLimit, formatPodBudget(container.podBudget), statusLabel(container.status)]),
    ];
    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }

  if (mode === "checklist") {
    return [
      "Kubernetes resource review",
      "--------------------------",
      "- [ ] Check request values against measured steady-state and peak usage.",
      "- [ ] Decide whether CPU limits fit the workload latency policy.",
      "- [ ] Check memory limits against OOM history and realistic peaks.",
      "- [ ] Review LimitRange and ResourceQuota defaults in the target namespace.",
      "- [ ] Account for Pod-level resources when the cluster enables PodLevelResources.",
      "- [ ] Review init-container effective resource accounting separately for capacity planning.",
      "",
      "Findings:",
      ...result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
    ].join("\n");
  }

  if (mode === "table") {
    return result.containers.map((container) => `${container.kind}/${container.workload} -> ${container.container} (${container.containerType}) -> requests ${formatRequest(container)}; limits ${formatLimit(container)}; pod ${formatPodBudget(container.podBudget)}; ${statusLabel(container.status)}`).join("\n");
  }

  const containerLines = result.containers.map((container) => {
    if (detailLevel === "compact") return `- ${container.container}: ${statusLabel(container.status)}`;
    const base = `- ${container.kind}/${container.workload} ${container.container}: requests ${formatRequest(container)}; limits ${formatLimit(container)} — ${statusLabel(container.status)}`;
    return detailLevel === "detailed" ? `${base}; Pod budget ${formatPodBudget(container.podBudget)}` : base;
  });

  return [
    "Kubernetes resource requests and limits summary",
    "-----------------------------------------------",
    `Containers found: ${result.containerCount}`,
    `Containers in current view: ${result.visibleContainerCount}`,
    `Covered by explicit fields or complete Pod-level budget: ${result.completeCount}`,
    `Missing explicit requests: ${result.missingRequestsCount}`,
    `Missing explicit limits: ${result.missingLimitsCount}`,
    `Pod-level budgets: ${result.podBudgetCount}`,
    "",
    "Current view:",
    ...(containerLines.length ? containerLines : ["- none"]),
    "",
    "Findings:",
    ...result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
  ].join("\n");
}

function stripNumericFields(container: ContainerResource): Record<string, unknown> {
  return {
    documentIndex: container.documentIndex,
    kind: container.kind,
    workload: container.workload,
    namespace: container.namespace,
    container: container.container,
    image: container.image,
    containerType: container.containerType,
    cpuRequest: container.cpuRequest,
    memoryRequest: container.memoryRequest,
    cpuLimit: container.cpuLimit,
    memoryLimit: container.memoryLimit,
    podBudget: container.podBudget,
    status: container.status,
  };
}

function readQuantity(record: Record<string, unknown>, key: string, label: string): string {
  if (!Object.prototype.hasOwnProperty.call(record, key)) return "";
  const value = record[key];
  if (typeof value !== "string" && typeof value !== "number") throw new Error(`${label} must be a Kubernetes quantity string or number.`);
  const text = String(value).trim();
  if (!text) throw new Error(`${label} cannot be empty.`);
  if (key === "cpu") parseCpu(text);
  if (key === "memory") parseMemory(text);
  return text;
}

function parseCpu(value: string): number {
  const units = parseQuantity(value, "CPU");
  const millicpu = units * 1000;
  if (millicpu !== 0 && Math.abs(millicpu) < 1) throw new Error(`CPU quantity "${value}" is finer than Kubernetes' 1m precision.`);
  return millicpu;
}

function parseMemory(value: string): number {
  const bytes = parseQuantity(value, "memory");
  if (bytes > 0 && bytes < 1) throw new Error(`Memory quantity "${value}" is less than one byte; check whether "Mi" or "M" was intended instead of "m".`);
  return bytes;
}

function parseQuantity(value: string, label: string): number {
  const clean = value.trim();
  const match = clean.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))(Ki|Mi|Gi|Ti|Pi|Ei|n|u|m|k|K|M|G|T|P|E|[eE][+-]?\d+)?$/);
  if (!match) throw new Error(`Unsupported ${label} quantity "${clean}".`);
  const amount = Number(match[1]);
  if (!Number.isFinite(amount) || amount < 0) throw new Error(`${label} quantity "${clean}" must be finite and non-negative.`);
  const suffix = match[2] || "";
  const decimal: Record<string, number> = { n: 1e-9, u: 1e-6, m: 1e-3, k: 1e3, K: 1e3, M: 1e6, G: 1e9, T: 1e12, P: 1e15, E: 1e18 };
  const binary: Record<string, number> = { Ki: 2 ** 10, Mi: 2 ** 20, Gi: 2 ** 30, Ti: 2 ** 40, Pi: 2 ** 50, Ei: 2 ** 60 };
  let result = amount;
  if (Object.prototype.hasOwnProperty.call(decimal, suffix)) result = amount * decimal[suffix];
  else if (Object.prototype.hasOwnProperty.call(binary, suffix)) result = amount * binary[suffix];
  else if (/^[eE]/.test(suffix)) result = amount * 10 ** Number(suffix.slice(1));
  if (!Number.isFinite(result)) throw new Error(`${label} quantity "${clean}" is too large to compare safely.`);
  return result;
}

function validateResourcePair(request: string, limit: string, resource: "cpu" | "memory"): void {
  if (request) {
    if (resource === "cpu") parseCpu(request);
    else parseMemory(request);
  }
  if (limit) {
    if (resource === "cpu") parseCpu(limit);
    else parseMemory(limit);
  }
}

function requireRecord(value: unknown, label: string): Record<string, unknown> {
  if (!isRecord(value)) throw new Error(`${label} must be a mapping/object.`);
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringValue(value: unknown): string {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function hasExplicitRequests(container: ContainerResource): boolean {
  return Boolean(container.cpuRequest && container.memoryRequest);
}

function hasExplicitLimits(container: ContainerResource): boolean {
  return Boolean(container.cpuLimit && container.memoryLimit);
}

function hasBothLimits(container: ContainerResource): boolean {
  return Boolean(container.cpuLimit && container.memoryLimit);
}

function podHasCompleteRequests(budget: PodBudget | null): boolean {
  return Boolean(budget && budget.cpuRequest && budget.memoryRequest);
}

function podHasCompleteLimits(budget: PodBudget | null): boolean {
  return Boolean(budget && budget.cpuLimit && budget.memoryLimit);
}

function formatRequest(container: ContainerResource): string {
  const values: string[] = [];
  if (container.cpuRequest) values.push(`cpu ${container.cpuRequest}`);
  if (container.memoryRequest) values.push(`memory ${container.memoryRequest}`);
  return values.join(" / ") || "-";
}

function formatLimit(container: ContainerResource): string {
  const values: string[] = [];
  if (container.cpuLimit) values.push(`cpu ${container.cpuLimit}`);
  if (container.memoryLimit) values.push(`memory ${container.memoryLimit}`);
  return values.join(" / ") || "-";
}

function formatPodBudget(budget: PodBudget | null): string {
  if (!budget) return "-";
  const request = [budget.cpuRequest ? `req cpu ${budget.cpuRequest}` : "", budget.memoryRequest ? `req mem ${budget.memoryRequest}` : ""].filter(Boolean).join(" / ");
  const limit = [budget.cpuLimit ? `lim cpu ${budget.cpuLimit}` : "", budget.memoryLimit ? `lim mem ${budget.memoryLimit}` : ""].filter(Boolean).join(" / ");
  return [request, limit].filter(Boolean).join("; ") || "-";
}

function statusLabel(status: ContainerStatus): string {
  if (status === "pod-level-budget") return "covered by Pod-level budget";
  if (status === "missing-requests") return "missing request coverage";
  if (status === "missing-limits") return "missing limit coverage";
  if (status === "missing-both") return "missing request and limit coverage";
  return "request and limit coverage present";
}

function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function escapeMarkdown(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, "\\n");
}

function getNotes(result: Result): { title: string; message: string }[] {
  const notes: { title: string; message: string }[] = [];
  if (result.podBudgetCount) notes.push({ title: "Pod-level resources are version-sensitive", message: "PodLevelResources is a current Kubernetes feature, but older clusters or disabled feature gates may not accept the same manifest." });
  if (result.missingRequestsCount) notes.push({ title: "Check the admitted Pod, not only the source YAML", message: "A LimitRange or limit-to-request fallback can change the final request values seen after admission." });
  if (result.allContainers.some((container) => container.containerType === "initContainer")) notes.push({ title: "Init containers affect Pod capacity differently", message: "Per-container fields are shown here, but the scheduler's effective Pod request uses init-container-specific accounting rules." });
  notes.push({ title: "Sizing comes from measurements", message: "Static YAML can reveal omissions and contradictions; it cannot determine the right CPU or memory numbers for an application." });
  return notes;
}

function CheckboxRow({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm text-gray-700">
      <input type="checkbox" checked={checked} onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]" />
      <span className="leading-6">{label}</span>
    </label>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function IssueCard({ issue }: { issue: Issue }) {
  const classes = issue.severity === "high"
    ? "border-red-200 bg-red-50 text-red-800"
    : issue.severity === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-gray-200 bg-gray-50 text-gray-700";
  return (
    <div className={`self-start rounded-xl border p-4 ${classes}`}>
      <p className="text-sm font-semibold">{issue.title}</p>
      <p className="mt-1 text-sm leading-6">{issue.message}</p>
    </div>
  );
}
