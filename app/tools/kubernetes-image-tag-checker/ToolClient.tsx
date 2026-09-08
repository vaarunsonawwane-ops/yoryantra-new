"use client";

import { useMemo, useState } from "react";
import { parseAllDocuments } from "yaml";
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
  containerType: "container" | "initContainer" | "ephemeralContainer";
  image: string;
  imagePullPolicy: string;
  expectedDefaultPullPolicy: "Always" | "IfNotPresent";
  registry: string;
  repository: string;
  tag: string;
  digest: string;
  referenceIssue: string;
  status: "tagged" | "latest" | "untagged" | "digest" | "tagged-and-digest" | "invalid";
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
  displayedImageCount: number;
  latestCount: number;
  untaggedCount: number;
  digestCount: number;
  invalidCount: number;
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

    try {
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
      description="Trace container image tags, digests, pull policies, and registry references across Kubernetes manifests."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900">
              Kubernetes YAML
            </label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Paste workload manifests to examine container, init-container, and ephemeral-container image references.
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
          Parsing stays in this browser. No registry, image layer, or Kubernetes API request is made.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={checkImages} className="yoryantra-btn min-h-[44px] whitespace-nowrap">
          Check Image Tags
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
          <SummaryCard label="Images" value={result.imageCount.toLocaleString()} />
          <SummaryCard label="latest / implicit" value={(result.latestCount + result.untaggedCount).toLocaleString()} />
          <SummaryCard label="Digest Pins" value={result.digestCount.toLocaleString()} />
          <SummaryCard label="Reference Problems" value={result.invalidCount.toLocaleString()} />
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
                  <th className="px-4 py-3 font-semibold">Pull policy</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {result.images.map((image, index) => (
                  <tr key={`${image.image}-${image.containerName}-${index}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{image.kind}/{image.resourceName || "unnamed"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {image.containerName || "-"}<span className="mt-1 block text-[11px] text-gray-500">{image.containerType}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-900">
                      <span className="block max-w-[320px] break-words">{image.image}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{image.registry || "implicit"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{image.digest || image.tag || "-"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {image.imagePullPolicy || `${image.expectedDefaultPullPolicy} (default)`}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{image.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result && result.issues.length > 0 && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Image findings</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {result.issues.map((issue, index) => (
              <FindingCard key={`${issue.title}-${index}`} issue={issue} />
            ))}
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Image reference notes</h3>
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
          {output || "Kubernetes image tag check output will appear here."}
        </pre>
      </div>

      <div className="mt-4 self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
        Manifest text is parsed in this browser. Image layers, registries, SBOMs, signatures, CVEs, and live cluster state are outside this check.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">What an image reference actually fixes</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Kubernetes accepts an image name with a tag, a digest, or both. A tag is a movable label; a digest identifies specific image content. When both are present, Kubernetes pulls by digest, so the digest is the part that fixes the content even if the tag later moves.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            An image without a tag or digest has implicit <code>latest</code> semantics. That is different from writing a version tag such as <code>v1.8.2</code>, and it deserves the same release attention as an explicit <code>:latest</code> reference.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
            <h2 className="font-semibold text-amber-900">Pull policy can outlive an image edit</h2>
            <p className="mt-2 text-sm leading-relaxed text-amber-800">
              Kubernetes defaults <code>imagePullPolicy</code> when an object is first created. Changing a workload later from a version tag to <code>latest</code> does not automatically rewrite an already stored pull policy, so review the explicit field as well as the image text.
            </p>
          </div>
          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h2 className="font-semibold text-gray-900">A registry name is not a trust decision</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              An explicit hostname makes the source easier to see, but it says nothing about provenance, vulnerability state, signature verification, or whether credentials are configured correctly.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Workload locations covered</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Images are collected from <code>containers</code>, <code>initContainers</code>, and <code>ephemeralContainers</code> in Pods and common Pod-template workloads such as Deployments, StatefulSets, DaemonSets, ReplicaSets, Jobs, and CronJobs. Generic controllers with a standard <code>spec.template.spec</code> Pod template are also read.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            OCI image volume references and custom-resource fields that merely happen to be named <code>image</code> are not treated as container images. That boundary prevents unrelated YAML from being misreported as runnable containers.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reading the result before a release</h2>
          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Separate digest-pinned references from movable tags.</li>
            <li>Review explicit <code>latest</code> and implicit-latest references first.</li>
            <li>Compare the image text with the declared or expected default pull policy.</li>
            <li>Check whether an implicit registry is intentional for the target runtime.</li>
            <li>Use registry, signature, SBOM, and vulnerability controls for questions the manifest cannot answer.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reference syntax worth checking</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">{`nginx:latest
nginx
registry.k8s.io/pause:3.10
registry.k8s.io/pause@sha256:<64-hex-digest>
registry.k8s.io/pause:3.10@sha256:<64-hex-digest>`}</pre>
          </div>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The Kubernetes <a className="underline decoration-gray-300 underline-offset-4 hover:text-gray-900" href="https://kubernetes.io/docs/concepts/containers/images/" target="_blank" rel="noreferrer">Images documentation</a> explains default tags, digest behavior, and pull-policy defaulting in more detail.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Questions that matter more than “is it tagged?”</h2>
          <div className="mt-5 space-y-6">
            <Faq title="Does a version tag guarantee immutable content?">
              No. A registry can move a tag unless policy prevents it. A digest identifies the image content more precisely.
            </Faq>
            <Faq title="What happens when both a tag and digest are present?">
              Kubernetes uses the digest for the pull. The tag remains readable context, but it does not decide the fetched image content.
            </Faq>
            <Faq title="Does an omitted tag mean no tag at all?">
              Kubernetes treats an omitted tag as <code>latest</code>. The result therefore distinguishes the text form while warning about the same release unpredictability.
            </Faq>
            <Faq title="Why show imagePullPolicy next to the reference?">
              Pull behavior depends on both fields, and the API server defaults the policy when the object is first created rather than continuously recalculating it after image edits.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4"><YoryantraRelatedTools currentHref="/tools/kubernetes-image-tag-checker" /></div>
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
  const issues = buildIssues(allImages, options);
  const base = {
    images,
    issues,
    imageCount: allImages.length,
    displayedImageCount: images.length,
    latestCount: allImages.filter((image) => image.status === "latest").length,
    untaggedCount: allImages.filter((image) => image.status === "untagged").length,
    digestCount: allImages.filter((image) => Boolean(image.digest) && !image.referenceIssue).length,
    invalidCount: allImages.filter((image) => Boolean(image.referenceIssue)).length,
  };
  const output = formatOutput(base, options.outputMode, options.detailLevel);

  return { ...base, output };
}

function parseImages(input: string): ImageInfo[] {
  const documents = parseAllDocuments(input, {
    prettyErrors: true,
    strict: true,
    uniqueKeys: true,
  });
  const parseErrors = documents.reduce<Array<{ message: string }>>(
    (all, document) => all.concat(document.errors),
    []
  );
  if (parseErrors.length > 0) {
    throw new Error(parseErrors[0].message);
  }

  const images: ImageInfo[] = [];
  documents.forEach((document, index) => {
    const root = document.toJS({ maxAliasCount: 100 });
    collectImagesFromValue(root, index + 1, images);
  });

  return images;
}

function collectImagesFromValue(value: unknown, documentIndex: number, images: ImageInfo[]): void {
  if (!isRecord(value)) return;

  if (value.kind === "List" && Array.isArray(value.items)) {
    value.items.forEach((item) => collectImagesFromValue(item, documentIndex, images));
    return;
  }

  const kind = readString(value.kind) || "Unknown";
  const metadata = isRecord(value.metadata) ? value.metadata : {};
  const resourceName = readString(metadata.name);
  const namespace = readString(metadata.namespace);
  const podSpec = getPodSpec(value, kind);
  if (!podSpec) return;

  const groups: Array<{ key: string; type: ImageInfo["containerType"] }> = [
    { key: "containers", type: "container" },
    { key: "initContainers", type: "initContainer" },
    { key: "ephemeralContainers", type: "ephemeralContainer" },
  ];

  groups.forEach(({ key, type }) => {
    const raw = podSpec[key];
    if (!Array.isArray(raw)) return;

    raw.forEach((candidate, containerIndex) => {
      if (!isRecord(candidate)) return;
      const image = readString(candidate.image);
      if (!image) return;
      const parsed = parseImageReference(image);
      const imagePullPolicy = readString(candidate.imagePullPolicy);

      images.push({
        documentIndex,
        kind,
        resourceName,
        namespace,
        containerName: readString(candidate.name) || `${type}-${containerIndex + 1}`,
        containerType: type,
        image,
        imagePullPolicy,
        expectedDefaultPullPolicy: getExpectedDefaultPullPolicy(parsed),
        ...parsed,
      });
    });
  });
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

function parseImageReference(image: string): Omit<ImageInfo, "documentIndex" | "kind" | "resourceName" | "namespace" | "containerName" | "containerType" | "image" | "imagePullPolicy" | "expectedDefaultPullPolicy"> {
  const clean = image.trim();
  let referenceIssue = "";
  if (!clean || /\s/.test(clean)) {
    referenceIssue = "Image references cannot be empty or contain whitespace.";
  }

  const firstAt = clean.indexOf("@");
  const lastAt = clean.lastIndexOf("@");
  if (!referenceIssue && firstAt !== lastAt) {
    referenceIssue = "Image reference contains more than one digest separator (@).";
  }

  const withoutDigest = firstAt >= 0 ? clean.slice(0, firstAt) : clean;
  const digest = firstAt >= 0 ? clean.slice(firstAt + 1) : "";
  if (!referenceIssue && firstAt >= 0 && !digest) {
    referenceIssue = "Digest separator is present but the digest is empty.";
  }
  if (!referenceIssue && digest && !isValidDigest(digest)) {
    referenceIssue = `Digest ${digest} does not match the expected algorithm:value form.`;
  }

  const lastSlash = withoutDigest.lastIndexOf("/");
  const lastColon = withoutDigest.lastIndexOf(":");
  const hasTag = lastColon > lastSlash;
  const tag = hasTag ? withoutDigest.slice(lastColon + 1) : "";
  const repositoryWithRegistry = hasTag ? withoutDigest.slice(0, lastColon) : withoutDigest;

  if (!referenceIssue && !repositoryWithRegistry) {
    referenceIssue = "Image repository is empty.";
  }
  if (!referenceIssue && tag && !/^[A-Za-z0-9_][A-Za-z0-9._-]{0,127}$/.test(tag)) {
    referenceIssue = `Tag ${tag} does not match the container image tag syntax accepted by Kubernetes.`;
  }

  const segments = repositoryWithRegistry.split("/");
  const firstPart = segments[0] || "";
  const hasRegistry = segments.length > 1 && (firstPart.includes(".") || firstPart.includes(":") || firstPart === "localhost");
  const registry = hasRegistry ? firstPart : "";
  const repository = hasRegistry ? segments.slice(1).join("/") : repositoryWithRegistry;

  let status: ImageInfo["status"] = "tagged";
  if (referenceIssue) status = "invalid";
  else if (digest && tag) status = "tagged-and-digest";
  else if (digest) status = "digest";
  else if (!tag) status = "untagged";
  else if (tag.toLowerCase() === "latest") status = "latest";

  return { registry, repository, tag, digest, referenceIssue, status };
}

function isValidDigest(value: string): boolean {
  const match = value.match(/^([a-z0-9]+(?:[._+-][a-z0-9]+)*):([A-Za-z0-9=_-]+)$/);
  if (!match) return false;
  if (match[1] === "sha256") return /^[a-fA-F0-9]{64}$/.test(match[2]);
  return match[2].length >= 16;
}

function getExpectedDefaultPullPolicy(image: Pick<ImageInfo, "tag" | "digest">): "Always" | "IfNotPresent" {
  if (image.digest) return "IfNotPresent";
  if (!image.tag || image.tag.toLowerCase() === "latest") return "Always";
  return "IfNotPresent";
}

function filterImages(images: ImageInfo[], filter: ImageFilter): ImageInfo[] {
  if (filter === "all") return images;
  if (filter === "latest") return images.filter((image) => image.status === "latest");
  if (filter === "untagged") return images.filter((image) => image.status === "untagged");
  if (filter === "digest") return images.filter((image) => Boolean(image.digest));
  if (filter === "unpinned") return images.filter((image) => !image.digest);
  return images;
}

function buildIssues(images: ImageInfo[], options: {
  warnLatest: boolean;
  warnUntagged: boolean;
  warnNoDigest: boolean;
  warnNoRegistry: boolean;
  warnNoImages: boolean;
  warnMutableTags: boolean;
}): Issue[] {
  const issues: Issue[] = [];

  const invalid = images.filter((image) => image.referenceIssue);
  if (invalid.length > 0) {
    issues.push({
      severity: "high",
      title: "Malformed image reference",
      message: `${invalid.length} image reference${invalid.length === 1 ? "" : "s"} need attention. ${invalid.slice(0, 2).map((image) => `${image.containerName}: ${image.referenceIssue}`).join(" ")}`,
    });
  }

  if (options.warnNoImages && images.length === 0) {
    issues.push({ severity: "warning", title: "No container images found", message: "No container, init-container, or ephemeral-container image references were found in supported Pod specs." });
  }

  const latest = images.filter((image) => image.status === "latest");
  if (options.warnLatest && latest.length > 0) {
    issues.push({ severity: "warning", title: "Explicit latest tag", message: `${latest.length} image reference${latest.length === 1 ? " uses" : "s use"} :latest. Tags can move, which makes rollout history and rollback less deterministic.` });
  }

  const untagged = images.filter((image) => image.status === "untagged");
  if (options.warnUntagged && untagged.length > 0) {
    issues.push({ severity: "warning", title: "Implicit latest semantics", message: `${untagged.length} image reference${untagged.length === 1 ? " omits" : "s omit"} both tag and digest. Kubernetes treats an omitted tag as latest.` });
  }

  const invalidPolicy = images.filter((image) => image.imagePullPolicy && !["Always", "IfNotPresent", "Never"].includes(image.imagePullPolicy));
  if (invalidPolicy.length > 0) {
    issues.push({ severity: "high", title: "Invalid imagePullPolicy value", message: `${invalidPolicy.length} container${invalidPolicy.length === 1 ? " has" : "s have"} an imagePullPolicy outside Always, IfNotPresent, or Never.` });
  }

  const cacheRisk = images.filter((image) => (image.status === "latest" || image.status === "untagged") && image.imagePullPolicy === "IfNotPresent");
  if (cacheRisk.length > 0) {
    issues.push({ severity: "warning", title: "Mutable reference with IfNotPresent", message: `${cacheRisk.length} image reference${cacheRisk.length === 1 ? " combines" : "s combine"} latest semantics with an explicit IfNotPresent policy. Existing node cache can therefore matter.` });
  }

  if (options.warnNoDigest) {
    const unpinned = images.filter((image) => !image.digest && !image.referenceIssue);
    if (unpinned.length > 0) {
      issues.push({ severity: "info", title: "References are not digest-pinned", message: `${unpinned.length} image reference${unpinned.length === 1 ? " relies" : "s rely"} on tags or implicit latest semantics rather than immutable content digests.` });
    }
  }

  if (options.warnNoRegistry) {
    const implicit = images.filter((image) => !image.registry && !image.referenceIssue);
    if (implicit.length > 0) {
      issues.push({ severity: "info", title: "Registry is implicit", message: `${implicit.length} image reference${implicit.length === 1 ? " does" : "s do"} not include a registry hostname. Confirm the runtime's default registry behavior is intended.` });
    }
  }

  if (options.warnMutableTags) {
    const mutable = images.filter((image) => image.tag && /^(dev|test|staging|main|master|edge|nightly|snapshot)$/i.test(image.tag));
    if (mutable.length > 0) {
      issues.push({ severity: "info", title: "Branch or environment-style tags", message: `These tag names often move between builds: ${Array.from(new Set(mutable.map((image) => image.tag))).join(", ")}. Treat that as a release-process signal, not proof of mutability.` });
    }
  }

  if (issues.length === 0) {
    issues.push({ severity: "info", title: "No enabled image-reference concern found", message: "The enabled checks did not find malformed references, latest semantics, or the selected pinning concerns." });
  }

  return issues;
}

function formatOutput(result: Omit<Result, "output">, mode: OutputMode, detailLevel: DetailLevel): string {
  if (mode === "json") return JSON.stringify(result, null, 2);

  if (mode === "markdown") {
    return [
      "| Resource | Container | Type | Image | Registry | Tag | Digest | Pull policy | Status |",
      "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
      ...result.images.map((image) => `| ${escapeMarkdown(`${image.kind}/${image.resourceName || "unnamed"}`)} | ${escapeMarkdown(image.containerName)} | ${image.containerType} | ${escapeMarkdown(image.image)} | ${escapeMarkdown(image.registry || "implicit")} | ${escapeMarkdown(image.tag || "-")} | ${image.digest ? "yes" : "no"} | ${escapeMarkdown(image.imagePullPolicy || `${image.expectedDefaultPullPolicy} (default)`)} | ${image.status} |`),
      "",
      "## Findings",
      ...result.issues.map((issue) => `- **${escapeMarkdown(issue.title)}:** ${escapeMarkdown(issue.message)}`),
    ].join("\n");
  }

  if (mode === "csv") {
    const rows = [
      ["resource", "namespace", "container", "container_type", "image", "registry", "repository", "tag", "digest", "pull_policy", "status"],
      ...result.images.map((image) => [
        `${image.kind}/${image.resourceName}`,
        image.namespace,
        image.containerName,
        image.containerType,
        image.image,
        image.registry,
        image.repository,
        image.tag,
        image.digest,
        image.imagePullPolicy || `${image.expectedDefaultPullPolicy} (default)`,
        image.status,
      ]),
    ];
    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }

  if (mode === "checklist") {
    return [
      "Kubernetes image reference review",
      "---------------------------------",
      "- [ ] Confirm production references avoid accidental latest semantics.",
      "- [ ] Confirm digest pins where immutable content identity is required.",
      "- [ ] Compare imagePullPolicy with the release and node-cache expectations.",
      "- [ ] Confirm registry hostnames and image-pull credentials are intentional.",
      "- [ ] Run registry vulnerability, signature, and SBOM controls separately.",
      "",
      ...result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
    ].join("\n");
  }

  if (mode === "table") {
    return result.images.map((image) => `${image.kind}/${image.resourceName || "unnamed"} -> ${image.containerType}/${image.containerName} -> ${image.image} -> ${image.imagePullPolicy || `${image.expectedDefaultPullPolicy} (default)`} -> ${image.status}`).join("\n");
  }

  const lines = detailLevel === "compact"
    ? result.images.map((image) => `- ${image.image} (${image.status})`)
    : result.images.map((image) => `- ${image.kind}/${image.resourceName || "unnamed"} ${image.containerType}/${image.containerName}: ${image.image} — ${image.status}; pull ${image.imagePullPolicy || `${image.expectedDefaultPullPolicy} default`}`);

  return [
    "Kubernetes image reference summary",
    "----------------------------------",
    `Images found: ${result.imageCount}`,
    `Images shown by filter: ${result.displayedImageCount}`,
    `Explicit latest: ${result.latestCount}`,
    `Implicit latest: ${result.untaggedCount}`,
    `Digest-pinned: ${result.digestCount}`,
    `Reference problems: ${result.invalidCount}`,
    "",
    "Images:",
    ...(lines.length ? lines : ["- none shown"]),
    "",
    "Findings:",
    ...result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
  ].join("\n");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
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
  if (result.digestCount > 0) notes.push({ title: "Digest references fix content identity", message: "A digest does not prove the image is safe, but it prevents a registry tag move from silently changing the referenced image content." });
  if (result.images.some((image) => !image.imagePullPolicy)) notes.push({ title: "Default pull policy is shown as an expectation", message: "The API server sets imagePullPolicy when an object is first created. Existing stored objects can retain a previously defaulted value after later image edits." });
  notes.push({ title: "Manifest review stops before the registry", message: "Signature verification, vulnerability state, SBOM contents, image availability, credentials, and admission policy require registry, CI, or cluster-aware checks." });
  return notes;
}

