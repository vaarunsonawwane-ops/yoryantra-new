"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "summary" | "table" | "json" | "markdown" | "csv" | "checklist";
type DetailLevel = "compact" | "balanced" | "detailed";
type ContainerFilter = "all" | "missingRequests" | "missingLimits" | "complete" | "initContainers";

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
  status: "complete" | "missing-requests" | "missing-limits" | "missing-both";
};

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type Result = {
  containers: ContainerResource[];
  issues: Issue[];
  output: string;
  containerCount: number;
  completeCount: number;
  missingRequestsCount: number;
  missingLimitsCount: number;
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
      setError("Please paste Kubernetes YAML manifests.");
      setResult(null);
      setOutput("");
      return;
    }

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
      description="Check Kubernetes YAML for CPU and memory requests and limits. Review missing resources, container settings, namespaces, workloads, and deployment notes."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900">
              Kubernetes YAML
            </label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Paste workloads to check container CPU and memory requests and limits.
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
          <h3 className="text-lg font-semibold text-gray-900">Resource Check Settings</h3>

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
              label="Container Filter"
              value={containerFilter}
              onChange={(value) => {
                setContainerFilter(value as ContainerFilter);
                clearResult();
              }}
              options={[
                { label: "All containers", value: "all" },
                { label: "Missing requests", value: "missingRequests" },
                { label: "Missing limits", value: "missingLimits" },
                { label: "Complete resources", value: "complete" },
                { label: "Init containers", value: "initContainers" },
              ]}
            />

            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
              <p className="text-sm font-medium text-gray-700">Resource fields</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {["requests.cpu", "requests.memory", "limits.cpu", "limits.memory"].map((item) => (
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
          <CheckboxRow checked={warnMissingRequests} label="Warn when CPU or memory requests are missing" onChange={(checked) => { setWarnMissingRequests(checked); clearResult(); }} />
          <CheckboxRow checked={warnMissingLimits} label="Warn when CPU or memory limits are missing" onChange={(checked) => { setWarnMissingLimits(checked); clearResult(); }} />
          <CheckboxRow checked={warnLimitWithoutRequest} label="Warn when limits exist without requests" onChange={(checked) => { setWarnLimitWithoutRequest(checked); clearResult(); }} />
          <CheckboxRow checked={warnNoResources} label="Warn when resources block is missing" onChange={(checked) => { setWarnNoResources(checked); clearResult(); }} />
          <CheckboxRow checked={warnMemoryOnly} label="Warn when only memory or only CPU is configured" onChange={(checked) => { setWarnMemoryOnly(checked); clearResult(); }} />
          <CheckboxRow checked={warnNoContainers} label="Warn when no containers are found" onChange={(checked) => { setWarnNoContainers(checked); clearResult(); }} />
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          This checker reads pasted YAML only. It does not contact a cluster, inspect live pods, or calculate real usage.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={checkResources} className="yoryantra-btn">
          Check Resources
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
          <SummaryCard label="Containers" value={result.containerCount.toLocaleString()} />
          <SummaryCard label="Complete" value={result.completeCount.toLocaleString()} />
          <SummaryCard label="Missing Requests" value={result.missingRequestsCount.toLocaleString()} />
          <SummaryCard label="Missing Limits" value={result.missingLimitsCount.toLocaleString()} />
        </div>
      )}

      {result && result.containers.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Container Resource Table</h3>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Workload</th>
                  <th className="px-4 py-3 font-semibold">Container</th>
                  <th className="px-4 py-3 font-semibold">Image</th>
                  <th className="px-4 py-3 font-semibold">Requests</th>
                  <th className="px-4 py-3 font-semibold">Limits</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {result.containers.map((container, index) => (
                  <tr key={`${container.workload}-${container.container}-${index}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{container.kind}/{container.workload || "unnamed"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-900">{container.container || "-"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      <span className="block max-w-[280px] break-words">{container.image || "-"}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{formatRequest(container)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{formatLimit(container)}</td>
                    <td className="px-4 py-3 text-gray-700">{container.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result && result.issues.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">Resource findings</h3>

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
          <h3 className="text-sm font-semibold text-blue-900">Kubernetes resource guidance</h3>

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
          {output || "Kubernetes resource check output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        This tool analyzes pasted Kubernetes YAML locally in your browser. It does not contact a cluster, inspect live pods, or calculate actual CPU and memory usage.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Checking Kubernetes CPU and Memory Settings</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Kubernetes requests and limits affect scheduling, stability, and resource isolation. Missing CPU or memory settings can make workloads harder to place, tune, and protect under load.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Kubernetes Resource Requests and Limits Checker extracts container resource settings from pasted YAML and highlights missing requests, missing limits, and incomplete CPU or memory configuration.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Using the Kubernetes Resource Checker</h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste Kubernetes workload YAML such as Deployments, Pods, Jobs, or CronJobs.</li>
            <li>Choose the output format and container filter.</li>
            <li>Review CPU and memory requests and limits for each container.</li>
            <li>Check warnings for missing or incomplete resource settings.</li>
            <li>Copy the summary, table, JSON, Markdown, CSV, or checklist output.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Requests vs Limits</h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li><strong>CPU request</strong> helps Kubernetes decide where to schedule the pod.</li>
            <li><strong>Memory request</strong> reserves expected memory for scheduling decisions.</li>
            <li><strong>CPU limit</strong> can throttle containers when CPU usage goes above the limit.</li>
            <li><strong>Memory limit</strong> can cause containers to be killed when they exceed the limit.</li>
            <li><strong>Init containers</strong> can have different resource needs from long-running containers.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example Resource Block</h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`resources:
  requests:
    cpu: "250m"
    memory: "256Mi"
  limits:
    cpu: "500m"
    memory: "512Mi"`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">YAML Review Is Not Capacity Planning</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This checker helps you spot missing manifest values, but it cannot know real application usage, traffic patterns, node pressure, or autoscaling behavior.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Use it during manifest review, then tune resources using metrics, load tests, production observations, and platform policy.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>

          <div className="mt-5 space-y-6">
            <Faq title="What does a Kubernetes Resource Requests and Limits Checker do?">
              It extracts container CPU and memory requests and limits from Kubernetes YAML and flags missing or incomplete settings.
            </Faq>

            <Faq title="Does this check live pod usage?">
              No. It only checks pasted YAML and does not connect to your cluster or metrics system.
            </Faq>

            <Faq title="Should every container have requests and limits?">
              Many teams require them for predictable scheduling and safety, but exact policies vary by platform and workload type.
            </Faq>

            <Faq title="Can this read initContainers?">
              Yes. It checks both containers and initContainers when they appear in the manifest.
            </Faq>

            <Faq title="Is anything uploaded when I check resources?">
              No. The check runs directly in your browser.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/kubernetes-yaml-resource-summarizer" className="yoryantra-btn-outline">Kubernetes YAML Resource Summarizer</Link>
            <Link href="/tools/kubernetes-image-tag-checker" className="yoryantra-btn-outline">Kubernetes Image Tag Checker</Link>
            <Link href="/tools/kubernetes-service-port-mapper" className="yoryantra-btn-outline">Kubernetes Service Port Mapper</Link>
            <Link href="/tools/yaml-validator" className="yoryantra-btn-outline">YAML Validator</Link>
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
  containerFilter: ContainerFilter;
  warnMissingRequests: boolean;
  warnMissingLimits: boolean;
  warnLimitWithoutRequest: boolean;
  warnNoResources: boolean;
  warnMemoryOnly: boolean;
  warnNoContainers: boolean;
}): Result {
  const allContainers = parseContainers(options.yamlInput);
  const containers = filterContainers(allContainers, options.containerFilter);
  const issues = buildIssues(containers, allContainers, options);
  const base = {
    containers,
    issues,
    containerCount: containers.length,
    completeCount: containers.filter((container) => container.status === "complete").length,
    missingRequestsCount: containers.filter((container) => container.status === "missing-requests" || container.status === "missing-both").length,
    missingLimitsCount: containers.filter((container) => container.status === "missing-limits" || container.status === "missing-both").length,
  };
  const output = formatOutput(base, options.outputMode, options.detailLevel);

  return {
    ...base,
    output,
  };
}

function parseContainers(input: string) {
  const docs = input
    .split(/^---\s*$/m)
    .map((text, index) => ({ text: text.trim(), index: index + 1 }))
    .filter((doc) => doc.text);
  const containers: ContainerResource[] = [];

  docs.forEach((doc) => {
    const lines = doc.text.split(/\r?\n/);
    const kind = getTopLevelValue(lines, "kind") || "Unknown";
    const workload = getMetadataValue(lines, "name");
    const namespace = getMetadataValue(lines, "namespace");

    containers.push(...extractContainerBlocks(lines, doc.index, kind, workload, namespace, "initContainers", "initContainer"));
    containers.push(...extractContainerBlocks(lines, doc.index, kind, workload, namespace, "containers", "container"));
  });

  return containers;
}

function extractContainerBlocks(
  lines: string[],
  documentIndex: number,
  kind: string,
  workload: string,
  namespace: string,
  sectionName: string,
  containerType: "container" | "initContainer"
) {
  const results: ContainerResource[] = [];
  let inSection = false;
  let sectionIndent = 0;
  let current: ContainerResource | null = null;
  let inResources = false;
  let resourceMode: "requests" | "limits" | "" = "";

  const pushCurrent = () => {
    if (!current) return;
    current.status = getStatus(current);
    results.push(current);
    current = null;
    inResources = false;
    resourceMode = "";
  };

  lines.forEach((line) => {
    const sectionMatch = line.match(new RegExp(`^(\\s*)${sectionName}:\\s*$`));

    if (sectionMatch) {
      inSection = true;
      sectionIndent = sectionMatch[1].length;
      pushCurrent();
      return;
    }

    if (!inSection) return;

    const indent = line.length - line.trimStart().length;

    if (line.trim() && indent <= sectionIndent && !line.trim().startsWith("-")) {
      pushCurrent();
      inSection = false;
      return;
    }

    const containerMatch = line.match(/^\s*-\s*name:\s*(.+)\s*$/);
    if (containerMatch) {
      pushCurrent();
      current = {
        documentIndex,
        kind,
        workload,
        namespace,
        container: stripQuotes(containerMatch[1].trim()),
        image: "",
        containerType,
        cpuRequest: "",
        memoryRequest: "",
        cpuLimit: "",
        memoryLimit: "",
        status: "missing-both",
      };
      return;
    }

    if (!current) return;

    const imageMatch = line.match(/^\s*image:\s*(.+)\s*$/);
    if (imageMatch) {
      current.image = stripQuotes(imageMatch[1].trim());
      return;
    }

    if (/^\s*resources:\s*$/.test(line)) {
      inResources = true;
      return;
    }

    if (inResources && /^\s*requests:\s*$/.test(line)) {
      resourceMode = "requests";
      return;
    }

    if (inResources && /^\s*limits:\s*$/.test(line)) {
      resourceMode = "limits";
      return;
    }

    if (inResources && resourceMode) {
      const cpuMatch = line.match(/^\s*cpu:\s*(.+)\s*$/);
      const memoryMatch = line.match(/^\s*memory:\s*(.+)\s*$/);

      if (cpuMatch && resourceMode === "requests") current.cpuRequest = stripQuotes(cpuMatch[1].trim());
      if (memoryMatch && resourceMode === "requests") current.memoryRequest = stripQuotes(memoryMatch[1].trim());
      if (cpuMatch && resourceMode === "limits") current.cpuLimit = stripQuotes(cpuMatch[1].trim());
      if (memoryMatch && resourceMode === "limits") current.memoryLimit = stripQuotes(memoryMatch[1].trim());
    }
  });

  pushCurrent();

  return results;
}

function getStatus(container: ContainerResource): ContainerResource["status"] {
  const hasRequests = Boolean(container.cpuRequest && container.memoryRequest);
  const hasLimits = Boolean(container.cpuLimit && container.memoryLimit);

  if (hasRequests && hasLimits) return "complete";
  if (!hasRequests && !hasLimits) return "missing-both";
  if (!hasRequests) return "missing-requests";
  return "missing-limits";
}

function filterContainers(containers: ContainerResource[], filter: ContainerFilter) {
  if (filter === "all") return containers;
  if (filter === "missingRequests") return containers.filter((container) => container.status === "missing-requests" || container.status === "missing-both");
  if (filter === "missingLimits") return containers.filter((container) => container.status === "missing-limits" || container.status === "missing-both");
  if (filter === "complete") return containers.filter((container) => container.status === "complete");
  if (filter === "initContainers") return containers.filter((container) => container.containerType === "initContainer");
  return containers;
}

function buildIssues(containers: ContainerResource[], allContainers: ContainerResource[], options: {
  warnMissingRequests: boolean;
  warnMissingLimits: boolean;
  warnLimitWithoutRequest: boolean;
  warnNoResources: boolean;
  warnMemoryOnly: boolean;
  warnNoContainers: boolean;
}) {
  const issues: Issue[] = [];

  if (options.warnNoContainers && allContainers.length === 0) {
    issues.push({
      severity: "warning",
      title: "No containers found",
      message: "No containers or initContainers were found in the pasted Kubernetes YAML.",
    });
  }

  if (options.warnNoResources && containers.some((container) => container.status === "missing-both")) {
    issues.push({
      severity: "warning",
      title: "Containers missing resource settings",
      message: "Some containers have no complete CPU/memory requests or limits.",
    });
  }

  if (options.warnMissingRequests && containers.some((container) => container.status === "missing-requests" || container.status === "missing-both")) {
    issues.push({
      severity: "warning",
      title: "Missing requests",
      message: "Some containers are missing CPU or memory requests, which can affect scheduling behavior.",
    });
  }

  if (options.warnMissingLimits && containers.some((container) => container.status === "missing-limits" || container.status === "missing-both")) {
    issues.push({
      severity: "info",
      title: "Missing limits",
      message: "Some containers are missing CPU or memory limits. Confirm whether this is allowed by your platform policy.",
    });
  }

  if (options.warnLimitWithoutRequest && containers.some((container) => (container.cpuLimit || container.memoryLimit) && (!container.cpuRequest || !container.memoryRequest))) {
    issues.push({
      severity: "info",
      title: "Limits without complete requests",
      message: "Some containers define limits without complete requests. Review scheduler expectations and QoS behavior.",
    });
  }

  if (options.warnMemoryOnly && containers.some((container) =>
    Boolean(container.cpuRequest || container.cpuLimit) !== Boolean(container.memoryRequest || container.memoryLimit)
  )) {
    issues.push({
      severity: "info",
      title: "Only CPU or only memory configured",
      message: "Some containers appear to configure only one resource family. Confirm this is intentional.",
    });
  }

  if (issues.length === 0) {
    issues.push({
      severity: "info",
      title: "Resource settings checked",
      message: "No obvious resource request or limit warning was found from the enabled checks.",
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
      "| Workload | Container | Image | Requests | Limits | Status |",
      "| --- | --- | --- | --- | --- | --- |",
      ...result.containers.map((container) => `| ${container.kind}/${container.workload || "unnamed"} | ${container.container || "-"} | ${escapeMarkdown(container.image || "-")} | ${formatRequest(container)} | ${formatLimit(container)} | ${container.status} |`),
      "",
      "## Findings",
      ...result.issues.map((issue) => `- **${issue.title}:** ${issue.message}`),
    ].join("\n");
  }

  if (mode === "csv") {
    const rows = [
      ["kind", "workload", "namespace", "container", "image", "cpu_request", "memory_request", "cpu_limit", "memory_limit", "status"],
      ...result.containers.map((container) => [
        container.kind,
        container.workload,
        container.namespace,
        container.container,
        container.image,
        container.cpuRequest,
        container.memoryRequest,
        container.cpuLimit,
        container.memoryLimit,
        container.status,
      ]),
    ];

    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }

  if (mode === "checklist") {
    return [
      "Kubernetes Resource Review Checklist",
      "------------------------------------",
      "- [ ] Confirm CPU and memory requests are set for important workloads.",
      "- [ ] Confirm limits match platform policy and workload behavior.",
      "- [ ] Confirm initContainers have suitable resources.",
      "- [ ] Confirm resource settings are based on metrics or load testing.",
      "- [ ] Confirm HPA/VPA behavior is considered if autoscaling is used.",
      "- [ ] Confirm namespace-level LimitRanges or ResourceQuotas are understood.",
      "",
      "Findings:",
      ...result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
    ].join("\n");
  }

  if (mode === "table") {
    return result.containers
      .map((container) => `${container.kind}/${container.workload || "unnamed"} -> ${container.container || "container"} -> requests ${formatRequest(container)}; limits ${formatLimit(container)}; ${container.status}`)
      .join("\n");
  }

  const lines = detailLevel === "compact"
    ? result.containers.map((container) => `- ${container.container || "container"}: ${container.status}`)
    : result.containers.map((container) => `- ${container.kind}/${container.workload || "unnamed"} ${container.container || ""}: requests ${formatRequest(container)}; limits ${formatLimit(container)} — ${container.status}`);

  return [
    "Kubernetes Resource Requests and Limits Summary",
    "-----------------------------------------------",
    `Containers: ${result.containerCount}`,
    `Complete: ${result.completeCount}`,
    `Missing requests: ${result.missingRequestsCount}`,
    `Missing limits: ${result.missingLimitsCount}`,
    "",
    "Containers:",
    ...(lines.length ? lines : ["- none found"]),
    "",
    "Findings:",
    ...result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
  ].join("\n");
}

function formatRequest(container: ContainerResource) {
  const values = [];
  if (container.cpuRequest) values.push(`cpu ${container.cpuRequest}`);
  if (container.memoryRequest) values.push(`memory ${container.memoryRequest}`);
  return values.join(" / ") || "-";
}

function formatLimit(container: ContainerResource) {
  const values = [];
  if (container.cpuLimit) values.push(`cpu ${container.cpuLimit}`);
  if (container.memoryLimit) values.push(`memory ${container.memoryLimit}`);
  return values.join(" / ") || "-";
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

  if (result.missingRequestsCount > 0) {
    notes.push({
      title: "Requests influence scheduling",
      message: "CPU and memory requests help Kubernetes decide where a pod should run.",
    });
  }

  if (result.missingLimitsCount > 0) {
    notes.push({
      title: "Limits are policy-dependent",
      message: "Some platforms require limits, while others avoid strict CPU limits for latency-sensitive workloads.",
    });
  }

  notes.push({
    title: "Use metrics for real sizing",
    message: "Manifest checks are useful, but resource values should be tuned with metrics, load tests, and production observations.",
  });

  return notes;
}
