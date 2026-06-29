"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "summary" | "table" | "json" | "markdown" | "csv" | "checklist";
type DetailLevel = "compact" | "balanced" | "detailed";
type ImageFilter = "all" | "latest" | "untagged" | "digest" | "unpinned";

type ImageInfo = {
  documentIndex: number;
  kind: string;
  resourceName: string;
  namespace: string;
  containerName: string;
  image: string;
  registry: string;
  repository: string;
  tag: string;
  digest: string;
  status: "tagged" | "latest" | "untagged" | "digest" | "tagged-and-digest";
};

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type Result = {
  images: ImageInfo[];
  issues: Issue[];
  output: string;
  imageCount: number;
  latestCount: number;
  untaggedCount: number;
  digestCount: number;
};

const sampleYaml = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  namespace: production
spec:
  template:
    spec:
      containers:
        - name: web
          image: nginx:latest
        - name: api
          image: ghcr.io/example/api:v1.8.2
      initContainers:
        - name: migrate
          image: postgres@sha256:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
---
apiVersion: batch/v1
kind: CronJob
metadata:
  name: cleanup-job
spec:
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: cleanup
              image: busybox`;

export default function ToolClient() {
  const [yamlInput, setYamlInput] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [detailLevel, setDetailLevel] = useState<DetailLevel>("balanced");
  const [imageFilter, setImageFilter] = useState<ImageFilter>("all");
  const [warnLatest, setWarnLatest] = useState(true);
  const [warnUntagged, setWarnUntagged] = useState(true);
  const [warnNoDigest, setWarnNoDigest] = useState(false);
  const [warnNoRegistry, setWarnNoRegistry] = useState(false);
  const [warnNoImages, setWarnNoImages] = useState(true);
  const [warnMutableTags, setWarnMutableTags] = useState(true);
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

  const checkImages = () => {
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
      imageFilter,
      warnLatest,
      warnUntagged,
      warnNoDigest,
      warnNoRegistry,
      warnNoImages,
      warnMutableTags,
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
    setImageFilter("all");
    setWarnLatest(true);
    setWarnUntagged(true);
    setWarnNoDigest(false);
    setWarnNoRegistry(false);
    setWarnNoImages(true);
    setWarnMutableTags(true);
    clearResult();
  };

  const resetAll = () => {
    setYamlInput("");
    setOutputMode("summary");
    setDetailLevel("balanced");
    setImageFilter("all");
    setWarnLatest(true);
    setWarnUntagged(true);
    setWarnNoDigest(false);
    setWarnNoRegistry(false);
    setWarnNoImages(true);
    setWarnMutableTags(true);
    clearResult();
  };

  return (
    <ToolShell
      title="Kubernetes Image Tag Checker"
      description="Check Kubernetes YAML for container images, missing tags, latest tags, digest pins, registries, namespaces, and deployment review notes before release."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900">
              Kubernetes YAML
            </label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Paste Kubernetes manifests to extract and review container image tags.
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
          <h3 className="text-lg font-semibold text-gray-900">Image Check Settings</h3>

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
                { label: "Image table", value: "table" },
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
              label="Image Filter"
              value={imageFilter}
              onChange={(value) => {
                setImageFilter(value as ImageFilter);
                clearResult();
              }}
              options={[
                { label: "All images", value: "all" },
                { label: "latest tags only", value: "latest" },
                { label: "untagged only", value: "untagged" },
                { label: "digest-pinned only", value: "digest" },
                { label: "not digest-pinned", value: "unpinned" },
              ]}
            />

            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
              <p className="text-sm font-medium text-gray-700">Checks image strings</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {["tag", "latest", "digest", "registry", "repository"].map((item) => (
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
          <CheckboxRow checked={warnLatest} label="Warn about latest tags" onChange={(checked) => { setWarnLatest(checked); clearResult(); }} />
          <CheckboxRow checked={warnUntagged} label="Warn about missing image tags" onChange={(checked) => { setWarnUntagged(checked); clearResult(); }} />
          <CheckboxRow checked={warnNoDigest} label="Warn when images are not digest-pinned" onChange={(checked) => { setWarnNoDigest(checked); clearResult(); }} />
          <CheckboxRow checked={warnNoRegistry} label="Warn when registry is not explicit" onChange={(checked) => { setWarnNoRegistry(checked); clearResult(); }} />
          <CheckboxRow checked={warnMutableTags} label="Warn about mutable-looking tags" onChange={(checked) => { setWarnMutableTags(checked); clearResult(); }} />
          <CheckboxRow checked={warnNoImages} label="Warn when no images are found" onChange={(checked) => { setWarnNoImages(checked); clearResult(); }} />
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          This checker reads pasted YAML only. It does not pull images, scan vulnerabilities, or contact a Kubernetes cluster.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={checkImages} className="yoryantra-btn">
          Check Image Tags
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
          <SummaryCard label="Images" value={result.imageCount.toLocaleString()} />
          <SummaryCard label="latest Tags" value={result.latestCount.toLocaleString()} />
          <SummaryCard label="Untagged" value={result.untaggedCount.toLocaleString()} />
          <SummaryCard label="Digest Pins" value={result.digestCount.toLocaleString()} />
        </div>
      )}

      {result && result.images.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Image Tag Table</h3>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Resource</th>
                  <th className="px-4 py-3 font-semibold">Container</th>
                  <th className="px-4 py-3 font-semibold">Image</th>
                  <th className="px-4 py-3 font-semibold">Registry</th>
                  <th className="px-4 py-3 font-semibold">Tag / Digest</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {result.images.map((image, index) => (
                  <tr key={`${image.image}-${image.containerName}-${index}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{image.kind}/{image.resourceName || "unnamed"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{image.containerName || "-"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-900">
                      <span className="block max-w-[320px] break-words">{image.image}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{image.registry || "implicit"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{image.digest || image.tag || "-"}</td>
                    <td className="px-4 py-3 text-gray-700">{image.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result && result.issues.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">Image findings</h3>

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
          <h3 className="text-sm font-semibold text-blue-900">Image review guidance</h3>

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
          {output || "Kubernetes image tag check output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        This tool checks pasted Kubernetes YAML locally in your browser. It does not pull images, scan vulnerabilities, or contact your cluster.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Checking Kubernetes Image Tags Before Release</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Container image tags decide what actually runs in a Kubernetes workload. Tags such as latest or missing tags can make deployments harder to reproduce, debug, and roll back.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Kubernetes Image Tag Checker extracts image references from pasted manifests and highlights latest tags, missing tags, digest pins, registry names, and release review notes.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Using the Kubernetes Image Tag Checker</h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste Kubernetes Deployment, Pod, Job, CronJob, or other manifest YAML.</li>
            <li>Choose the output format and image filter.</li>
            <li>Review image tags, registries, repositories, and digest pins.</li>
            <li>Check warnings for latest tags, untagged images, or mutable-looking tags.</li>
            <li>Copy the summary, table, JSON, Markdown, CSV, or checklist output.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Why latest Tags Are Risky</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A tag like latest can point to different image contents over time. That makes it harder to know exactly what was deployed, especially during rollbacks or incident reviews.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Version tags and digest pins make deployments easier to audit and reproduce. The right choice depends on your release process, registry policy, and deployment tooling.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example Image Tag Review</h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`nginx:latest              -> latest tag
ghcr.io/example/api:v1.8.2 -> tagged
busybox                    -> untagged
postgres@sha256:...        -> digest pinned`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Image Checking Is Not Vulnerability Scanning</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This tool reviews image references inside YAML. It does not pull image layers, inspect SBOMs, check CVEs, verify signatures, or scan registries.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Use it for fast manifest review, then use registry scanning, admission policies, signature verification, and CI checks for deeper security controls.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>

          <div className="mt-5 space-y-6">
            <Faq title="What does a Kubernetes Image Tag Checker do?">
              It extracts container images from Kubernetes YAML and flags latest tags, missing tags, digest pins, and registry details.
            </Faq>

            <Faq title="Does this scan container vulnerabilities?">
              No. It only checks image reference text in pasted YAML.
            </Faq>

            <Faq title="Is using latest always wrong?">
              Not always, but it is usually risky for repeatable production deployments because the referenced image can change.
            </Faq>

            <Faq title="What is a digest-pinned image?">
              A digest-pinned image uses sha256 content addressing, making the deployed image reference more precise than a mutable tag.
            </Faq>

            <Faq title="Is anything uploaded when I check image tags?">
              No. The check runs directly in your browser.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/kubernetes-image-tag-checker" />
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
  imageFilter: ImageFilter;
  warnLatest: boolean;
  warnUntagged: boolean;
  warnNoDigest: boolean;
  warnNoRegistry: boolean;
  warnNoImages: boolean;
  warnMutableTags: boolean;
}): Result {
  const allImages = parseImages(options.yamlInput);
  const images = filterImages(allImages, options.imageFilter);
  const issues = buildIssues(images, allImages, options);
  const base = {
    images,
    issues,
    imageCount: images.length,
    latestCount: images.filter((image) => image.status === "latest").length,
    untaggedCount: images.filter((image) => image.status === "untagged").length,
    digestCount: images.filter((image) => image.digest).length,
  };
  const output = formatOutput(base, options.outputMode, options.detailLevel);

  return {
    ...base,
    output,
  };
}

function parseImages(input: string) {
  const documents = input
    .split(/^---\s*$/m)
    .map((text, index) => ({ text: text.trim(), index: index + 1 }))
    .filter((doc) => doc.text);
  const images: ImageInfo[] = [];

  documents.forEach((doc) => {
    const lines = doc.text.split(/\r?\n/);
    const kind = getTopLevelValue(lines, "kind");
    const resourceName = getMetadataValue(lines, "name");
    const namespace = getMetadataValue(lines, "namespace");
    let currentContainer = "";

    lines.forEach((line) => {
      const containerMatch = line.match(/^\s*-\s*name:\s*(.+)\s*$/);
      if (containerMatch) currentContainer = stripQuotes(containerMatch[1].trim());

      const imageMatch = line.match(/^\s*image:\s*(.+)\s*$/);
      if (imageMatch) {
        const image = stripQuotes(imageMatch[1].trim());
        images.push({
          documentIndex: doc.index,
          kind: kind || "Unknown",
          resourceName,
          namespace,
          containerName: currentContainer,
          image,
          ...parseImageReference(image),
        });
      }
    });
  });

  return images;
}

function parseImageReference(image: string): Omit<ImageInfo, "documentIndex" | "kind" | "resourceName" | "namespace" | "containerName" | "image"> {
  const [withoutDigest, digest = ""] = image.split("@");
  const lastSlash = withoutDigest.lastIndexOf("/");
  const lastColon = withoutDigest.lastIndexOf(":");
  const hasTag = lastColon > lastSlash;
  const tag = hasTag ? withoutDigest.slice(lastColon + 1) : "";
  const repositoryWithRegistry = hasTag ? withoutDigest.slice(0, lastColon) : withoutDigest;
  const firstPart = repositoryWithRegistry.split("/")[0] || "";
  const hasRegistry = firstPart.includes(".") || firstPart.includes(":") || firstPart === "localhost";
  const registry = hasRegistry ? firstPart : "";
  const repository = hasRegistry ? repositoryWithRegistry.split("/").slice(1).join("/") : repositoryWithRegistry;
  let status: ImageInfo["status"] = "tagged";

  if (digest && tag) status = "tagged-and-digest";
  else if (digest) status = "digest";
  else if (!tag) status = "untagged";
  else if (tag === "latest") status = "latest";

  return {
    registry,
    repository,
    tag,
    digest,
    status,
  };
}

function filterImages(images: ImageInfo[], filter: ImageFilter) {
  if (filter === "all") return images;
  if (filter === "latest") return images.filter((image) => image.status === "latest");
  if (filter === "untagged") return images.filter((image) => image.status === "untagged");
  if (filter === "digest") return images.filter((image) => Boolean(image.digest));
  if (filter === "unpinned") return images.filter((image) => !image.digest);
  return images;
}

function buildIssues(images: ImageInfo[], allImages: ImageInfo[], options: {
  warnLatest: boolean;
  warnUntagged: boolean;
  warnNoDigest: boolean;
  warnNoRegistry: boolean;
  warnNoImages: boolean;
  warnMutableTags: boolean;
}) {
  const issues: Issue[] = [];

  if (options.warnNoImages && allImages.length === 0) {
    issues.push({
      severity: "warning",
      title: "No container images found",
      message: "No image fields were found in the pasted Kubernetes YAML.",
    });
  }

  if (options.warnLatest && images.some((image) => image.status === "latest")) {
    issues.push({
      severity: "warning",
      title: "latest tag found",
      message: "latest tags can change over time and make deployments harder to reproduce.",
    });
  }

  if (options.warnUntagged && images.some((image) => image.status === "untagged")) {
    issues.push({
      severity: "warning",
      title: "Untagged image found",
      message: "Images without tags usually default to latest behavior in many workflows. Pin a version or digest when possible.",
    });
  }

  if (options.warnNoDigest && images.some((image) => !image.digest)) {
    issues.push({
      severity: "info",
      title: "Images are not digest-pinned",
      message: "Digest pins make image references more exact, though many teams still use version tags with deployment controls.",
    });
  }

  if (options.warnNoRegistry && images.some((image) => !image.registry)) {
    issues.push({
      severity: "info",
      title: "Implicit registry found",
      message: "Some images do not specify a registry. Confirm whether the default registry is intended.",
    });
  }

  if (options.warnMutableTags) {
    const mutable = images.filter((image) => image.tag && /^(dev|test|staging|main|master|latest|snapshot)$/i.test(image.tag));

    if (mutable.length > 0) {
      issues.push({
        severity: "info",
        title: "Mutable-looking tags found",
        message: `Review these tags for release predictability: ${Array.from(new Set(mutable.map((image) => image.tag))).join(", ")}.`,
      });
    }
  }

  if (issues.length === 0) {
    issues.push({
      severity: "info",
      title: "Image tags checked",
      message: "No obvious image tag warning was found from the enabled checks.",
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
      "| Resource | Container | Image | Registry | Tag | Digest | Status |",
      "| --- | --- | --- | --- | --- | --- | --- |",
      ...result.images.map((image) => `| ${image.kind}/${image.resourceName || "unnamed"} | ${image.containerName || "-"} | ${escapeMarkdown(image.image)} | ${image.registry || "implicit"} | ${image.tag || "-"} | ${image.digest ? "yes" : "no"} | ${image.status} |`),
      "",
      "## Findings",
      ...result.issues.map((issue) => `- **${issue.title}:** ${issue.message}`),
    ].join("\n");
  }

  if (mode === "csv") {
    const rows = [
      ["resource", "namespace", "container", "image", "registry", "repository", "tag", "digest", "status"],
      ...result.images.map((image) => [
        `${image.kind}/${image.resourceName}`,
        image.namespace,
        image.containerName,
        image.image,
        image.registry,
        image.repository,
        image.tag,
        image.digest,
        image.status,
      ]),
    ];

    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }

  if (mode === "checklist") {
    return [
      "Kubernetes Image Tag Review Checklist",
      "------------------------------------",
      "- [ ] Confirm production images do not use latest accidentally.",
      "- [ ] Confirm every workload image has an expected version tag or digest.",
      "- [ ] Confirm image registries are trusted and intended.",
      "- [ ] Confirm rollback versions are available.",
      "- [ ] Confirm CI or registry scanning covers these images.",
      "- [ ] Confirm image pull policies match the release process.",
      "",
      "Findings:",
      ...result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
    ].join("\n");
  }

  if (mode === "table") {
    return result.images
      .map((image) => `${image.kind}/${image.resourceName || "unnamed"} -> ${image.containerName || "container"} -> ${image.image} (${image.status})`)
      .join("\n");
  }

  const lines = detailLevel === "compact"
    ? result.images.map((image) => `- ${image.image} (${image.status})`)
    : result.images.map((image) => `- ${image.kind}/${image.resourceName || "unnamed"} ${image.containerName || ""}: ${image.image} — ${image.status}`);

  return [
    "Kubernetes Image Tag Check Summary",
    "----------------------------------",
    `Images: ${result.imageCount}`,
    `latest tags: ${result.latestCount}`,
    `untagged images: ${result.untaggedCount}`,
    `digest pins: ${result.digestCount}`,
    "",
    "Images:",
    ...(lines.length ? lines : ["- none found"]),
    "",
    "Findings:",
    ...result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
  ].join("\n");
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

  if (result.latestCount > 0 || result.untaggedCount > 0) {
    notes.push({
      title: "Prefer predictable image references",
      message: "Version tags or digest pins make deployments easier to reproduce and roll back.",
    });
  }

  if (result.digestCount > 0) {
    notes.push({
      title: "Digest pins are precise",
      message: "A digest points to exact image content, but teams should still keep a readable release process around it.",
    });
  }

  notes.push({
    title: "Use scanning for deeper checks",
    message: "This tool checks image references in YAML. Vulnerabilities, signatures, and SBOMs need registry or CI security tooling.",
  });

  return notes;
}
