"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "summary" | "json" | "table";
type CPUUnit = "millicores" | "cores";
type MemoryUnit = "Mi" | "Gi";
type WorkloadKind =
  | "Deployment"
  | "StatefulSet"
  | "DaemonSet"
  | "Job"
  | "CronJob"
  | "Pod"
  | "Unknown";

type ContainerResource = {
  workload: string;
  kind: WorkloadKind;
  container: string;
  replicas: number;
  cpuRequestMillicores: number;
  cpuLimitMillicores: number;
  memoryRequestMi: number;
  memoryLimitMi: number;
  hasRequest: boolean;
  hasLimit: boolean;
};

type WorkloadSummary = {
  workload: string;
  kind: WorkloadKind;
  replicas: number;
  containers: number;
  cpuRequestMillicores: number;
  cpuLimitMillicores: number;
  memoryRequestMi: number;
  memoryLimitMi: number;
};

type ResourceTotals = {
  containers: ContainerResource[];
  workloads: WorkloadSummary[];
  totalCpuRequestMillicores: number;
  totalCpuLimitMillicores: number;
  totalMemoryRequestMi: number;
  totalMemoryLimitMi: number;
  containerCount: number;
  workloadCount: number;
  missingRequests: number;
  missingLimits: number;
};

type ResourceNote = {
  title: string;
  message: string;
};

type YAMLLine = {
  raw: string;
  trimmed: string;
  indent: number;
  line: number;
};

const sampleYaml = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-deployment
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: api
          image: example/api:latest
          resources:
            requests:
              cpu: "250m"
              memory: "256Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"

        - name: worker
          image: example/worker:latest
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "250m"
              memory: "256Mi"`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [cpuUnit, setCpuUnit] = useState<CPUUnit>("millicores");
  const [memoryUnit, setMemoryUnit] = useState<MemoryUnit>("Mi");
  const [includeReplicas, setIncludeReplicas] = useState(true);
  const [warnMissingResources, setWarnMissingResources] = useState(true);
  const [resourceTotals, setResourceTotals] = useState<ResourceTotals | null>(
    null
  );
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(
    () =>
      resourceTotals
        ? getResourceNotes(resourceTotals, {
            warnMissingResources,
          })
        : [],
    [resourceTotals, warnMissingResources]
  );

  const calculateResources = () => {
    if (!input.trim()) {
      setError("Please paste Kubernetes YAML with resource requests or limits.");
      setResourceTotals(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const totals = calculateKubernetesResources(input, {
        includeReplicas,
      });

      const nextOutput = formatResourceOutput(totals, {
        outputMode,
        cpuUnit,
        memoryUnit,
      });

      setResourceTotals(totals);
      setOutput(nextOutput);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to calculate Kubernetes resources."
      );
      setResourceTotals(null);
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
    setInput(sampleYaml);
    setOutputMode("summary");
    setCpuUnit("millicores");
    setMemoryUnit("Mi");
    setIncludeReplicas(true);
    setWarnMissingResources(true);
    setResourceTotals(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setOutputMode("summary");
    setCpuUnit("millicores");
    setMemoryUnit("Mi");
    setIncludeReplicas(true);
    setWarnMissingResources(true);
    setResourceTotals(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="Kubernetes Resource Calculator"
      description="Calculate Kubernetes CPU and memory requests, limits, container totals, pod totals, and workload resource usage from YAML directly in your browser."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Kubernetes YAML
        </label>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setResourceTotals(null);
            setOutput("");
            setError("");
            setCopied(false);
          }}
          placeholder={sampleYaml}
          className="w-full min-h-[430px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste a Kubernetes Pod, Deployment, StatefulSet, DaemonSet, Job, or
          CronJob YAML file to calculate CPU and memory requests and limits.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Calculation Options
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
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
                label: "Table",
                value: "table",
              },
            ]}
          />

          <YoryantraSelect
            label="CPU Unit"
            value={cpuUnit}
            onChange={(value) => {
              setCpuUnit(value as CPUUnit);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              {
                label: "Millicores",
                value: "millicores",
              },
              {
                label: "Cores",
                value: "cores",
              },
            ]}
          />

          <YoryantraSelect
            label="Memory Unit"
            value={memoryUnit}
            onChange={(value) => {
              setMemoryUnit(value as MemoryUnit);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              {
                label: "Mi",
                value: "Mi",
              },
              {
                label: "Gi",
                value: "Gi",
              },
            ]}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={includeReplicas}
              onChange={(event) => {
                setIncludeReplicas(event.target.checked);
                setResourceTotals(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Include replicas
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Multiply container resources by the workload replica count.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={warnMissingResources}
              onChange={(event) => {
                setWarnMissingResources(event.target.checked);
                setOutput("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Warn about missing resources
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Show notes when containers are missing requests or limits.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={calculateResources} className="yoryantra-btn">
          Calculate Resources
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

      {resourceTotals && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="CPU Requests"
            value={formatCpu(resourceTotals.totalCpuRequestMillicores, cpuUnit)}
          />
          <SummaryCard
            label="CPU Limits"
            value={formatCpu(resourceTotals.totalCpuLimitMillicores, cpuUnit)}
          />
          <SummaryCard
            label="Memory Requests"
            value={formatMemory(resourceTotals.totalMemoryRequestMi, memoryUnit)}
          />
          <SummaryCard
            label="Memory Limits"
            value={formatMemory(resourceTotals.totalMemoryLimitMi, memoryUnit)}
          />
        </div>
      )}

      {resourceTotals && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Workload Summary
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Resource totals grouped by workload. Replica counts are included when
            the option is enabled.
          </p>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Workload</th>
                  <th className="px-4 py-3 font-semibold">Kind</th>
                  <th className="px-4 py-3 font-semibold">Replicas</th>
                  <th className="px-4 py-3 font-semibold">Containers</th>
                  <th className="px-4 py-3 font-semibold">CPU Request</th>
                  <th className="px-4 py-3 font-semibold">CPU Limit</th>
                  <th className="px-4 py-3 font-semibold">Memory Request</th>
                  <th className="px-4 py-3 font-semibold">Memory Limit</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {resourceTotals.workloads.map((workload) => (
                  <tr key={`${workload.kind}-${workload.workload}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">
                      {workload.workload}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {workload.kind}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {workload.replicas}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {workload.containers}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {formatCpu(workload.cpuRequestMillicores, cpuUnit)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {formatCpu(workload.cpuLimitMillicores, cpuUnit)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {formatMemory(workload.memoryRequestMi, memoryUnit)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {formatMemory(workload.memoryLimitMi, memoryUnit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {resourceTotals && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Containers Found
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Container-level resource values detected from the YAML.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {resourceTotals.containers.map((container, index) => (
              <div
                key={`${container.workload}-${container.container}-${index}`}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4"
              >
                <div className="flex flex-col gap-1">
                  <p className="font-mono text-sm font-semibold text-gray-900">
                    {container.container}
                  </p>

                  <p className="text-xs text-gray-500">
                    {container.kind} / {container.workload}
                  </p>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <MiniStat
                    label="CPU Request"
                    value={formatCpu(container.cpuRequestMillicores, cpuUnit)}
                  />
                  <MiniStat
                    label="CPU Limit"
                    value={formatCpu(container.cpuLimitMillicores, cpuUnit)}
                  />
                  <MiniStat
                    label="Memory Request"
                    value={formatMemory(container.memoryRequestMi, memoryUnit)}
                  />
                  <MiniStat
                    label="Memory Limit"
                    value={formatMemory(container.memoryLimitMi, memoryUnit)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Resource notes
          </h3>

          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-amber-900">
                  {note.title}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-amber-800">
                  {note.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Calculation Output
          </h3>

          {output && (
            <button
              onClick={copyOutput}
              className="yoryantra-btn-outline text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">
          {output || "Kubernetes resource calculation output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Kubernetes resource calculation happens directly in your browser. Your
        YAML is not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Calculating Kubernetes CPU and Memory Requests
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Kubernetes resource requests and limits are easy to miss when a YAML
            file has many containers, sidecars, replicas, and workloads. A small
            resource value can look harmless in one container but become much
            larger after replicas are counted.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Kubernetes Resource Calculator reads CPU and memory requests and
            limits from Kubernetes YAML and calculates totals by container and
            workload. It is useful before deployments, cluster sizing checks,
            namespace reviews, and cost or capacity discussions.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Checking Resource Totals From YAML
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste a Kubernetes workload YAML file into the input box.</li>
            <li>Choose whether replica counts should be included.</li>
            <li>Select CPU and memory display units.</li>
            <li>Review total requests, limits, workloads, and containers.</li>
            <li>Copy the summary, JSON, or table output for notes or review.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Kubernetes Resource Calculator Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Estimating CPU and memory usage before deploying a workload.</li>
            <li>Checking total requests and limits after replica counts.</li>
            <li>Reviewing sidecar containers that add hidden resource usage.</li>
            <li>Finding containers with missing requests or limits.</li>
            <li>Preparing capacity notes for staging or production clusters.</li>
            <li>Comparing resource values during Kubernetes YAML reviews.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Kubernetes Resources
          </h2>

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
          <h2 className="text-xl font-semibold text-gray-900">
            Requests, Limits, and Real Cluster Capacity
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Requests are used by Kubernetes scheduling to reserve capacity. Limits
            control the maximum resources a container can use. Both matter, but
            they answer different questions.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This calculator is a browser-side estimate from the YAML you paste.
            Always review the final values with your actual cluster settings,
            namespaces, autoscaling rules, and deployment process.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What does a Kubernetes Resource Calculator do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It reads Kubernetes YAML and calculates CPU and memory requests
                and limits across containers and workloads.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this include replica counts?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Replica counts are included by default for workloads like
                Deployments and StatefulSets. You can turn that off if you want
                per-pod values only.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this parse CPU values like 250m?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. CPU values such as 250m, 0.5, and 1 are converted into
                millicores or cores for output.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this parse memory values like Mi and Gi?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Memory values such as Mi, Gi, Ki, M, and G are converted
                into Mi or Gi for output.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my Kubernetes YAML uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Calculation happens directly in your browser, and your YAML
                is not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/kubernetes-yaml-validator" className="yoryantra-btn-outline">
              Kubernetes YAML Validator
            </Link>

            <Link href="/tools/kubernetes-secret-decoder" className="yoryantra-btn-outline">
              Kubernetes Secret Decoder
            </Link>

            <Link href="/tools/yaml-validator" className="yoryantra-btn-outline">
              YAML Validator
            </Link>

            <Link href="/tools/docker-compose-validator" className="yoryantra-btn-outline">
              Docker Compose Validator
            </Link>

            <Link href="/tools/github-actions-yaml-validator" className="yoryantra-btn-outline">
              GitHub Actions YAML Validator
            </Link>
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

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>

      <div className="mt-1 break-words font-mono text-sm text-gray-900">
        {value}
      </div>
    </div>
  );
}

function calculateKubernetesResources(
  input: string,
  options: {
    includeReplicas: boolean;
  }
): ResourceTotals {
  const documents = input
    .replace(/\r\n/g, "\n")
    .split(/\n---\s*\n/)
    .map((document) => document.trim())
    .filter(Boolean);

  const containers = documents.flatMap((document) =>
    parseDocumentResources(document, {
      includeReplicas: options.includeReplicas,
    })
  );

  if (containers.length === 0) {
    throw new Error(
      "No containers with Kubernetes resource blocks were found. Check that the YAML contains containers and resources."
    );
  }

  const workloads = summarizeWorkloads(containers);

  return {
    containers,
    workloads,
    totalCpuRequestMillicores: sum(containers, "cpuRequestMillicores"),
    totalCpuLimitMillicores: sum(containers, "cpuLimitMillicores"),
    totalMemoryRequestMi: sum(containers, "memoryRequestMi"),
    totalMemoryLimitMi: sum(containers, "memoryLimitMi"),
    containerCount: containers.length,
    workloadCount: workloads.length,
    missingRequests: containers.filter((container) => !container.hasRequest).length,
    missingLimits: containers.filter((container) => !container.hasLimit).length,
  };
}

function parseDocumentResources(
  document: string,
  options: {
    includeReplicas: boolean;
  }
): ContainerResource[] {
  const lines = toLines(document);
  const kind = getTopLevelValue(lines, "kind") as WorkloadKind || "Unknown";
  const workload = getMetadataName(lines) || `${kind.toLowerCase()}-workload`;
  const replicas = options.includeReplicas ? getReplicaCount(lines, kind) : 1;
  const containerStarts = findContainerStarts(lines);

  return containerStarts.map((start, index) => {
    const nextStart = containerStarts[index + 1];
    const blockLines = lines.filter(
      (line) =>
        line.line >= start.line &&
        (!nextStart || line.line < nextStart.line)
    );

    const containerName =
      parseContainerInlineName(start.trimmed) ||
      getFirstNestedValue(blockLines, "name") ||
      `container-${index + 1}`;
    const resources = parseContainerResources(blockLines);

    return {
      workload,
      kind,
      container: containerName,
      replicas,
      cpuRequestMillicores: resources.cpuRequestMillicores * replicas,
      cpuLimitMillicores: resources.cpuLimitMillicores * replicas,
      memoryRequestMi: resources.memoryRequestMi * replicas,
      memoryLimitMi: resources.memoryLimitMi * replicas,
      hasRequest: resources.hasRequest,
      hasLimit: resources.hasLimit,
    };
  });
}

function toLines(input: string): YAMLLine[] {
  return input.split("\n").map((raw, index) => ({
    raw,
    trimmed: stripComment(raw).trim(),
    indent: raw.length - raw.trimStart().length,
    line: index + 1,
  }));
}

function stripComment(line: string) {
  let quote: "'" | '"' | null = null;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (quote) {
      if (char === quote) {
        quote = null;
      }

      continue;
    }

    if (char === "'" || char === '"') {
      quote = char;
      continue;
    }

    if (char === "#") {
      return line.slice(0, index);
    }
  }

  return line;
}

function getTopLevelValue(lines: YAMLLine[], key: string) {
  const line = lines.find(
    (item) => item.indent === 0 && item.trimmed.startsWith(`${key}:`)
  );

  return line ? cleanYamlValue(line.trimmed.slice(key.length + 1)) : "";
}

function getMetadataName(lines: YAMLLine[]) {
  const metadataLine = lines.find(
    (line) => line.indent === 0 && line.trimmed === "metadata:"
  );

  if (!metadataLine) {
    return "";
  }

  const nameLine = lines.find(
    (line) =>
      line.line > metadataLine.line &&
      line.indent === metadataLine.indent + 2 &&
      line.trimmed.startsWith("name:")
  );

  return nameLine ? cleanYamlValue(nameLine.trimmed.slice("name:".length)) : "";
}

function getReplicaCount(lines: YAMLLine[], kind: WorkloadKind) {
  if (kind === "DaemonSet" || kind === "Pod") {
    return 1;
  }

  const replicasLine = lines.find((line) => line.trimmed.startsWith("replicas:"));

  if (!replicasLine) {
    return 1;
  }

  const count = Number(cleanYamlValue(replicasLine.trimmed.slice("replicas:".length)));

  return Number.isFinite(count) && count > 0 ? count : 1;
}

function findContainerStarts(lines: YAMLLine[]) {
  return lines.filter((line) => {
    const trimmed = line.trimmed;

    return (
      trimmed.startsWith("- name:") ||
      trimmed === "- name" ||
      trimmed.startsWith("- image:")
    );
  });
}

function parseContainerInlineName(trimmed: string) {
  if (!trimmed.startsWith("- name:")) {
    return "";
  }

  return cleanYamlValue(trimmed.slice("- name:".length));
}

function getFirstNestedValue(lines: YAMLLine[], key: string) {
  const line = lines.find((item) => item.trimmed.startsWith(`${key}:`));

  return line ? cleanYamlValue(line.trimmed.slice(key.length + 1)) : "";
}

function parseContainerResources(lines: YAMLLine[]) {
  const resourcesLine = lines.find((line) => line.trimmed === "resources:");

  if (!resourcesLine) {
    return {
      cpuRequestMillicores: 0,
      cpuLimitMillicores: 0,
      memoryRequestMi: 0,
      memoryLimitMi: 0,
      hasRequest: false,
      hasLimit: false,
    };
  }

  const requestLine = lines.find(
    (line) =>
      line.line > resourcesLine.line &&
      line.indent > resourcesLine.indent &&
      line.trimmed === "requests:"
  );
  const limitLine = lines.find(
    (line) =>
      line.line > resourcesLine.line &&
      line.indent > resourcesLine.indent &&
      line.trimmed === "limits:"
  );

  const requestValues = requestLine ? parseResourcePair(lines, requestLine) : {};
  const limitValues = limitLine ? parseResourcePair(lines, limitLine) : {};

  return {
    cpuRequestMillicores: parseCpu(requestValues.cpu || ""),
    cpuLimitMillicores: parseCpu(limitValues.cpu || ""),
    memoryRequestMi: parseMemory(requestValues.memory || ""),
    memoryLimitMi: parseMemory(limitValues.memory || ""),
    hasRequest: Boolean(requestLine),
    hasLimit: Boolean(limitLine),
  };
}

function parseResourcePair(lines: YAMLLine[], sectionLine: YAMLLine) {
  const values: Record<string, string> = {};

  lines
    .filter(
      (line) =>
        line.line > sectionLine.line &&
        line.indent > sectionLine.indent &&
        (line.trimmed.startsWith("cpu:") || line.trimmed.startsWith("memory:"))
    )
    .forEach((line) => {
      if (line.trimmed.startsWith("cpu:")) {
        values.cpu = cleanYamlValue(line.trimmed.slice("cpu:".length));
      }

      if (line.trimmed.startsWith("memory:")) {
        values.memory = cleanYamlValue(line.trimmed.slice("memory:".length));
      }
    });

  return values;
}

function parseCpu(value: string) {
  const clean = value.trim();

  if (!clean) {
    return 0;
  }

  if (clean.endsWith("m")) {
    return Number(clean.slice(0, -1)) || 0;
  }

  const cores = Number(clean);

  return Number.isFinite(cores) ? cores * 1000 : 0;
}

function parseMemory(value: string) {
  const clean = value.trim();

  if (!clean) {
    return 0;
  }

  const match = clean.match(/^([0-9.]+)\s*([a-zA-Z]+)?$/);

  if (!match) {
    return 0;
  }

  const amount = Number(match[1]);
  const unit = (match[2] || "Mi").toLowerCase();

  if (!Number.isFinite(amount)) {
    return 0;
  }

  if (unit === "ki") {
    return amount / 1024;
  }

  if (unit === "mi") {
    return amount;
  }

  if (unit === "gi") {
    return amount * 1024;
  }

  if (unit === "ti") {
    return amount * 1024 * 1024;
  }

  if (unit === "k") {
    return amount / 1024;
  }

  if (unit === "m") {
    return amount;
  }

  if (unit === "g") {
    return amount * 1000;
  }

  return amount;
}

function summarizeWorkloads(containers: ContainerResource[]): WorkloadSummary[] {
  const groups = new Map<string, ContainerResource[]>();

  containers.forEach((container) => {
    const key = `${container.kind}:${container.workload}`;
    const existing = groups.get(key) || [];
    existing.push(container);
    groups.set(key, existing);
  });

  return Array.from(groups.values()).map((group) => ({
    workload: group[0].workload,
    kind: group[0].kind,
    replicas: group[0].replicas,
    containers: group.length,
    cpuRequestMillicores: sum(group, "cpuRequestMillicores"),
    cpuLimitMillicores: sum(group, "cpuLimitMillicores"),
    memoryRequestMi: sum(group, "memoryRequestMi"),
    memoryLimitMi: sum(group, "memoryLimitMi"),
  }));
}

function sum<T extends Record<string, unknown>>(items: T[], key: keyof T) {
  return items.reduce((total, item) => {
    const value = item[key];
    return total + (typeof value === "number" ? value : 0);
  }, 0);
}

function formatResourceOutput(
  totals: ResourceTotals,
  options: {
    outputMode: OutputMode;
    cpuUnit: CPUUnit;
    memoryUnit: MemoryUnit;
  }
) {
  if (options.outputMode === "json") {
    return JSON.stringify(
      {
        totals: {
          cpuRequest: formatCpu(totals.totalCpuRequestMillicores, options.cpuUnit),
          cpuLimit: formatCpu(totals.totalCpuLimitMillicores, options.cpuUnit),
          memoryRequest: formatMemory(totals.totalMemoryRequestMi, options.memoryUnit),
          memoryLimit: formatMemory(totals.totalMemoryLimitMi, options.memoryUnit),
          containers: totals.containerCount,
          workloads: totals.workloadCount,
          missingRequests: totals.missingRequests,
          missingLimits: totals.missingLimits,
        },
        workloads: totals.workloads,
        containers: totals.containers,
      },
      null,
      2
    );
  }

  if (options.outputMode === "table") {
    return [
      "Workload | Kind | Replicas | Containers | CPU Request | CPU Limit | Memory Request | Memory Limit",
      "--- | --- | ---: | ---: | ---: | ---: | ---: | ---:",
      ...totals.workloads.map(
        (workload) =>
          `${workload.workload} | ${workload.kind} | ${workload.replicas} | ${
            workload.containers
          } | ${formatCpu(workload.cpuRequestMillicores, options.cpuUnit)} | ${formatCpu(
            workload.cpuLimitMillicores,
            options.cpuUnit
          )} | ${formatMemory(
            workload.memoryRequestMi,
            options.memoryUnit
          )} | ${formatMemory(workload.memoryLimitMi, options.memoryUnit)}`
      ),
    ].join("\n");
  }

  return [
    "Kubernetes Resource Calculation",
    "-------------------------------",
    `Workloads: ${totals.workloadCount}`,
    `Containers: ${totals.containerCount}`,
    `CPU requests: ${formatCpu(totals.totalCpuRequestMillicores, options.cpuUnit)}`,
    `CPU limits: ${formatCpu(totals.totalCpuLimitMillicores, options.cpuUnit)}`,
    `Memory requests: ${formatMemory(totals.totalMemoryRequestMi, options.memoryUnit)}`,
    `Memory limits: ${formatMemory(totals.totalMemoryLimitMi, options.memoryUnit)}`,
    `Containers missing requests: ${totals.missingRequests}`,
    `Containers missing limits: ${totals.missingLimits}`,
    "",
    "Workloads:",
    ...totals.workloads.map(
      (workload) =>
        `- ${workload.kind}/${workload.workload}: ${workload.containers} container(s), ${workload.replicas} replica(s), CPU request ${formatCpu(
          workload.cpuRequestMillicores,
          options.cpuUnit
        )}, memory request ${formatMemory(workload.memoryRequestMi, options.memoryUnit)}`
    ),
  ].join("\n");
}

function formatCpu(value: number, unit: CPUUnit) {
  if (unit === "cores") {
    return `${(value / 1000).toFixed(3).replace(/\.?0+$/, "")} cores`;
  }

  return `${Math.round(value)}m`;
}

function formatMemory(value: number, unit: MemoryUnit) {
  if (unit === "Gi") {
    return `${(value / 1024).toFixed(3).replace(/\.?0+$/, "")}Gi`;
  }

  return `${Math.round(value)}Mi`;
}

function getResourceNotes(
  totals: ResourceTotals,
  options: {
    warnMissingResources: boolean;
  }
): ResourceNote[] {
  const notes: ResourceNote[] = [];

  if (options.warnMissingResources && totals.missingRequests > 0) {
    notes.push({
      title: "Some containers are missing requests",
      message:
        "Requests help Kubernetes schedule pods properly. Review containers without CPU or memory requests.",
    });
  }

  if (options.warnMissingResources && totals.missingLimits > 0) {
    notes.push({
      title: "Some containers are missing limits",
      message:
        "Limits can help prevent a container from using too much CPU or memory.",
    });
  }

  if (totals.totalCpuLimitMillicores > 0 && totals.totalCpuRequestMillicores > 0) {
    const ratio = totals.totalCpuLimitMillicores / totals.totalCpuRequestMillicores;

    if (ratio >= 4) {
      notes.push({
        title: "CPU limit is much higher than request",
        message:
          "The total CPU limit is at least 4x the CPU request. This may be intentional, but it is worth reviewing.",
      });
    }
  }

  if (totals.totalMemoryLimitMi > 0 && totals.totalMemoryRequestMi > 0) {
    const ratio = totals.totalMemoryLimitMi / totals.totalMemoryRequestMi;

    if (ratio >= 4) {
      notes.push({
        title: "Memory limit is much higher than request",
        message:
          "The total memory limit is at least 4x the memory request. Check whether the workload really needs that much headroom.",
      });
    }
  }

  if (totals.totalCpuRequestMillicores === 0 && totals.totalMemoryRequestMi === 0) {
    notes.push({
      title: "No requests found",
      message:
        "No CPU or memory requests were detected. The YAML may be missing resource requests or the structure may need review.",
    });
  }

  return notes;
}

function cleanYamlValue(value: string) {
  return value.trim().replace(/^["']|["']$/g, "");
}
