"use client";

import { useState } from "react";
import yaml from "js-yaml";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type Level = "error" | "warning" | "info";

type Finding = {
  level: Level;
  path: string;
  message: string;
};

type PlainObject = Record<string, unknown>;

type ResourceResult = {
  label: string;
  findings: Finding[];
};

const isObject = (value: unknown): value is PlainObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const hasString = (obj: PlainObject, key: string) => typeof obj[key] === "string" && String(obj[key]).trim().length > 0;

const getMetadata = (resource: PlainObject): PlainObject | null =>
  isObject(resource.metadata) ? resource.metadata : null;

const selectorMatchesLabels = (selector: unknown, labels: unknown) => {
  if (!isObject(selector) || !isObject(selector.matchLabels) || !isObject(labels)) return null;
  const entries = Object.entries(selector.matchLabels);
  if (entries.length === 0) return true;
  return entries.every(([key, value]) => labels[key] === value);
};

const checkContainers = (spec: PlainObject, path: string, findings: Finding[]) => {
  const containers = spec.containers;
  if (!Array.isArray(containers) || containers.length === 0) {
    findings.push({ level: "error", path: `${path}.containers`, message: "Expected a non-empty containers array." });
    return;
  }

  containers.forEach((container, index) => {
    if (!isObject(container)) {
      findings.push({ level: "error", path: `${path}.containers[${index}]`, message: "Container entry must be an object." });
      return;
    }
    if (!hasString(container, "name")) {
      findings.push({ level: "warning", path: `${path}.containers[${index}].name`, message: "Container name is missing." });
    }
    if (!hasString(container, "image")) {
      findings.push({ level: "warning", path: `${path}.containers[${index}].image`, message: "Container image is missing." });
    }
  });
};

const checkPodTemplate = (
  resource: PlainObject,
  basePath: string,
  findings: Finding[]
) => {
  if (!isObject(resource.spec)) {
    findings.push({ level: "error", path: `${basePath}.spec`, message: "Missing or invalid spec object." });
    return;
  }

  const template = resource.spec.template;
  if (!isObject(template)) {
    findings.push({ level: "error", path: `${basePath}.spec.template`, message: "Missing or invalid Pod template." });
    return;
  }

  if (!isObject(template.spec)) {
    findings.push({ level: "error", path: `${basePath}.spec.template.spec`, message: "Missing Pod template spec." });
    return;
  }

  checkContainers(template.spec, `${basePath}.spec.template.spec`, findings);
};

const inspectSingleResource = (
  resource: unknown,
  label: string,
  basePath: string
): ResourceResult => {
  const findings: Finding[] = [];

  if (!isObject(resource)) {
    findings.push({ level: "error", path: basePath, message: "Kubernetes document must contain an object/mapping." });
    return { label, findings };
  }

  if (!hasString(resource, "apiVersion")) {
    findings.push({ level: "error", path: `${basePath}.apiVersion`, message: "Missing apiVersion." });
  }
  if (!hasString(resource, "kind")) {
    findings.push({ level: "error", path: `${basePath}.kind`, message: "Missing kind." });
  }

  const kind = hasString(resource, "kind") ? String(resource.kind) : "Unknown";
  const metadata = getMetadata(resource);

  if (kind !== "List") {
    if (!metadata) {
      findings.push({ level: "error", path: `${basePath}.metadata`, message: "Missing or invalid metadata object." });
    } else if (!hasString(metadata, "name") && !hasString(metadata, "generateName")) {
      findings.push({ level: "warning", path: `${basePath}.metadata`, message: "Neither metadata.name nor metadata.generateName is present." });
    }
  }

  if (kind === "List") {
    if (!Array.isArray(resource.items)) {
      findings.push({ level: "error", path: `${basePath}.items`, message: "A List object needs an items array." });
    }
    return { label, findings };
  }

  if (kind === "Pod") {
    if (!isObject(resource.spec)) {
      findings.push({ level: "error", path: `${basePath}.spec`, message: "Pod spec is missing or invalid." });
    } else {
      checkContainers(resource.spec, `${basePath}.spec`, findings);
    }
  }

  const controllers = ["Deployment", "StatefulSet", "DaemonSet", "ReplicaSet"];
  if (controllers.includes(kind)) {
    checkPodTemplate(resource, basePath, findings);
    if (!isObject(resource.spec) || !isObject(resource.spec.selector)) {
      findings.push({ level: "error", path: `${basePath}.spec.selector`, message: `${kind} needs a selector object.` });
    } else if (isObject(resource.spec.template)) {
      const templateMetadata = isObject(resource.spec.template.metadata) ? resource.spec.template.metadata : null;
      const labels = templateMetadata && isObject(templateMetadata.labels) ? templateMetadata.labels : null;
      const matches = selectorMatchesLabels(resource.spec.selector, labels);
      if (matches === false) {
        findings.push({
          level: "error",
          path: `${basePath}.spec.selector.matchLabels`,
          message: "Selector matchLabels do not match the Pod template labels. The API rejects this for apps/v1 Deployments and related controllers.",
        });
      }
    }

    if (kind === "Deployment" && resource.apiVersion !== "apps/v1") {
      findings.push({ level: "warning", path: `${basePath}.apiVersion`, message: "Current Deployment manifests normally use apps/v1." });
    }
  }

  if (kind === "Job") {
    checkPodTemplate({ spec: { template: isObject(resource.spec) ? resource.spec.template : undefined } }, basePath, findings);
    if (resource.apiVersion !== "batch/v1") {
      findings.push({ level: "warning", path: `${basePath}.apiVersion`, message: "Current Job manifests normally use batch/v1." });
    }
  }

  if (kind === "CronJob") {
    if (!isObject(resource.spec)) {
      findings.push({ level: "error", path: `${basePath}.spec`, message: "CronJob spec is missing or invalid." });
    } else {
      if (!hasString(resource.spec, "schedule")) {
        findings.push({ level: "error", path: `${basePath}.spec.schedule`, message: "CronJob schedule is missing." });
      }
      const jobTemplate = isObject(resource.spec.jobTemplate) ? resource.spec.jobTemplate : null;
      const jobSpec = jobTemplate && isObject(jobTemplate.spec) ? jobTemplate.spec : null;
      if (!jobSpec || !isObject(jobSpec.template)) {
        findings.push({ level: "error", path: `${basePath}.spec.jobTemplate.spec.template`, message: "CronJob Pod template is missing." });
      } else {
        checkPodTemplate({ spec: { template: jobSpec.template } }, `${basePath}.spec.jobTemplate`, findings);
      }
    }
    if (resource.apiVersion !== "batch/v1") {
      findings.push({ level: "warning", path: `${basePath}.apiVersion`, message: "Current CronJob manifests normally use batch/v1." });
    }
  }

  if (kind === "Ingress" && resource.apiVersion !== "networking.k8s.io/v1") {
    findings.push({ level: "warning", path: `${basePath}.apiVersion`, message: "Current Ingress manifests normally use networking.k8s.io/v1." });
  }

  if (findings.length === 0) {
    findings.push({ level: "info", path: basePath, message: "No problems were found by these structural checks." });
  }

  return { label, findings };
};

export const inspectKubernetesDocuments = (documents: unknown[]): ResourceResult[] => {
  const results: ResourceResult[] = [];

  documents.forEach((document, documentIndex) => {
    if (document === null || typeof document === "undefined") return;

    const base = `document[${documentIndex + 1}]`;
    const rootResult = inspectSingleResource(document, `Document ${documentIndex + 1}`, base);
    results.push(rootResult);

    if (isObject(document) && document.kind === "List" && Array.isArray(document.items)) {
      document.items.forEach((item, itemIndex) => {
        const itemKind = isObject(item) && typeof item.kind === "string" ? item.kind : "Item";
        results.push(
          inspectSingleResource(
            item,
            `Document ${documentIndex + 1} / List item ${itemIndex + 1} (${itemKind})`,
            `${base}.items[${itemIndex}]`
          )
        );
      });
    }
  });

  return results;
};

const formatResults = (results: ResourceResult[]) => {
  let errors = 0;
  let warnings = 0;

  const sections = results.map((result) => {
    result.findings.forEach((finding) => {
      if (finding.level === "error") errors += 1;
      if (finding.level === "warning") warnings += 1;
    });

    const body = result.findings
      .map((finding) => `${finding.level.toUpperCase()}  ${finding.path}\n${finding.message}`)
      .join("\n\n");
    return `${result.label}\n${"-".repeat(Math.min(result.label.length, 60))}\n${body}`;
  });

  return { errors, warnings, text: sections.join("\n\n") };
};

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const validateKubernetesYaml = () => {
    if (!input.trim()) {
      setError("Please enter Kubernetes YAML.");
      setOutput("");
      return;
    }

    try {
      const documents: unknown[] = [];
      yaml.loadAll(input, (document: unknown) => documents.push(document));
      const nonEmptyDocuments = documents.filter((document) => document !== null && typeof document !== "undefined");

      if (nonEmptyDocuments.length === 0) {
        setError("The YAML contains no Kubernetes objects.");
        setOutput("");
        return;
      }

      const results = inspectKubernetesDocuments(documents);
      const formatted = formatResults(results);
      const verdict = formatted.errors > 0 ? "Structural problems found" : "Structural check completed";

      setOutput(
        `${verdict}\n\nYAML documents: ${nonEmptyDocuments.length}\nObjects inspected: ${results.length}\nErrors: ${formatted.errors}\nWarnings: ${formatted.warnings}\n\n${formatted.text}\n\nScope note: this tool does not have your cluster OpenAPI schema, CRDs, admission policies, defaulting rules, or API-server version. Use kubectl with schema/server-side validation for authoritative acceptance checks.`
      );
      setError("");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Invalid YAML.";
      setError(`YAML parse error: ${message}`);
      setOutput("");
    }
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="Kubernetes YAML Validator"
      description="Inspect one or more Kubernetes YAML documents for required object fields and common workload-structure mistakes before using kubectl."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Kubernetes YAML Manifest
        </label>
        <textarea
          value={input}
          onChange={(event: { target: { value: string } }) => setInput(event.target.value)}
          placeholder={`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: web\nspec:\n  selector:\n    matchLabels:\n      app: web\n  template:\n    metadata:\n      labels:\n        app: web\n    spec:\n      containers:\n        - name: web\n          image: nginx:alpine`}
          className="w-full min-h-[340px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={validateKubernetesYaml} className="yoryantra-btn">
          Check Kubernetes YAML
        </button>
        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 whitespace-pre-wrap overflow-auto">
          {error}
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Manifest Findings</h3>
          {output && (
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>
        <pre className="yoryantra-output min-h-[240px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {output || "Document-by-document Kubernetes findings will appear here."}
        </pre>
      </div>

      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">Local manifest inspection</h3>
        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          The YAML is parsed locally in your browser. No cluster is contacted, so this tool cannot validate CRDs, admission policies, cluster-version schemas, or server-side defaults.
        </p>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">From YAML syntax to Kubernetes object structure</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Valid YAML is only the first step. Kubernetes objects identify themselves with <code>apiVersion</code> and <code>kind</code>, and normally include metadata such as a name. Workload resources add resource-specific structures: Deployments need selectors and Pod templates, Pods need containers, and CronJobs need schedules plus nested Job and Pod templates.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This inspector handles multiple YAML documents separated by <code>---</code> and expands Kubernetes <code>List</code> objects so individual items receive their own findings. It also checks a small set of high-value workload relationships, such as Deployment selector labels matching Pod-template labels.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What still needs kubectl or the API server</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Kubernetes schemas vary by resource type, Kubernetes version, installed CRDs, feature gates, and admission configuration. The API server can also default fields or reject values that a generic browser checker cannot know about. Use <code>kubectl</code> validation or a server-side dry run when you need to know whether your actual cluster accepts a manifest.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Useful references</h2>
          <ul className="mt-4 space-y-3 text-gray-600 leading-relaxed">
            <li>
              <a className="text-[var(--light-gold)] hover:underline" href="https://kubernetes.io/docs/concepts/overview/working-with-objects/" target="_blank" rel="noreferrer">
                Kubernetes objects
              </a>{" "}— required object fields and manifest structure.
            </li>
            <li>
              <a className="text-[var(--light-gold)] hover:underline" href="https://kubernetes.io/docs/reference/kubectl/generated/kubectl_apply/" target="_blank" rel="noreferrer">
                kubectl apply reference
              </a>{" "}— cluster-aware application and validation behavior.
            </li>
          </ul>
        </div>

        <YoryantraRelatedTools currentHref="/tools/kubernetes-yaml-validator" />
      </section>
    </ToolShell>
  );
}
