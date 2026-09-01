"use client";

import { useMemo, useState } from "react";
import { parseAllDocuments } from "yaml";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type Severity = "high" | "warning" | "note";

type Issue = {
  severity: Severity;
  service: string;
  target: string;
  title: string;
  message: string;
};

type Mount = {
  service: string;
  type: string;
  source: string;
  target: string;
  readOnly: boolean;
  syntax: "short" | "long";
  options: string[];
  sourceKind: "bind" | "named" | "anonymous" | "socket" | "tmpfs" | "other";
  declaredNamedVolume: boolean;
  createHostPath: boolean | null;
  issues: Issue[];
};

type Report = {
  mounts: Mount[];
  issues: Issue[];
  topLevelVolumes: string[];
  yamlWarnings: string[];
  sourceBytes: number;
};

const SAMPLE = `services:
  web:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./public:/usr/share/nginx/html:ro
      - /var/run/docker.sock:/var/run/docker.sock

  api:
    image: node:22-alpine
    volumes:
      - .:/app
      - api-data:/var/lib/app
      - /app/node_modules
      - type: bind
        source: ./config
        target: /app/config
        read_only: true
        bind:
          create_host_path: false

volumes:
  api-data:`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function isWindowsPath(value: string) {
  return /^[A-Za-z]:[\\/]/.test(value);
}

function isBindSource(value: string) {
  return (
    value === "." ||
    value === ".." ||
    value.indexOf("./") === 0 ||
    value.indexOf("../") === 0 ||
    value.indexOf("/") === 0 ||
    value.indexOf("~/") === 0 ||
    isWindowsPath(value)
  );
}

function riskyBindLabel(source: string) {
  const normalized = source.replace(/\\/g, "/");

  if (normalized === "/") return "host root filesystem";
  if (
    normalized === "/var/run/docker.sock" ||
    normalized === "/run/docker.sock"
  ) {
    return "Docker daemon socket";
  }
  if (/^\/(?:etc|proc|sys|dev|boot)(?:\/|$)/.test(normalized)) {
    return "sensitive host system path";
  }
  if (/^\/var\/lib\/docker(?:\/|$)/.test(normalized)) {
    return "Docker engine data directory";
  }
  if (/^[A-Za-z]:\/Windows(?:\/|$)/i.test(normalized)) {
    return "Windows system directory";
  }

  return "";
}

function splitShortSyntax(value: string) {
  const parts: string[] = [];
  let current = "";

  for (let index = 0; index < value.length; index += 1) {
    const char = value.charAt(index);

    if (
      char === ":" &&
      !(
        index === 1 &&
        /^[A-Za-z]$/.test(value.charAt(0)) &&
        (value.charAt(2) === "\\" || value.charAt(2) === "/")
      )
    ) {
      parts.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  parts.push(current);

  if (parts.length > 3) {
    return {
      source: "",
      target: "",
      options: [] as string[],
      error:
        "Short volume syntax contains too many colon-separated segments. Use long syntax when a platform-specific source path is ambiguous.",
    };
  }

  if (parts.length === 1) {
    return {
      source: "",
      target: parts[0],
      options: [] as string[],
      error: "",
    };
  }

  return {
    source: parts[0],
    target: parts[1],
    options:
      parts.length === 3
        ? parts[2].split(",").filter(Boolean)
        : [],
    error: "",
  };
}

function targetLooksConfig(target: string) {
  return /(?:^|\/)(?:etc|config|conf|certs?|nginx|apache|static|public)(?:\/|$)/i.test(
    target
  );
}

function classifyMount(source: string, type: string) {
  if (type === "tmpfs") return "tmpfs" as const;
  if (type && type !== "bind" && type !== "volume") return "other" as const;

  if (!source) return "anonymous" as const;

  const normalized = source.replace(/\\/g, "/");

  if (
    normalized === "/var/run/docker.sock" ||
    normalized === "/run/docker.sock"
  ) {
    return "socket" as const;
  }

  if (type === "bind" || isBindSource(source)) {
    return "bind" as const;
  }

  return "named" as const;
}

function mountIssues(
  mount: Omit<Mount, "issues">,
  topVolumes: string[]
) {
  const issues: Issue[] = [];
  const add = (
    severity: Severity,
    title: string,
    message: string
  ) =>
    issues.push({
      severity,
      service: mount.service,
      target: mount.target,
      title,
      message,
    });

  if (!mount.target) {
    add(
      "high",
      "Missing container target",
      "Every service mount needs a target path inside the container."
    );
  }

  if (mount.sourceKind === "socket") {
    add(
      "high",
      "Docker socket mount",
      "Access to the Docker daemon socket can give a container powerful control over the host Docker engine. Treat it as a privileged capability, not ordinary application data."
    );
  }

  if (mount.sourceKind === "bind") {
    const risky = riskyBindLabel(mount.source);

    if (risky) {
      add(
        "high",
        `Risky bind source: ${risky}`,
        `Host path "${mount.source}" exposes a sensitive part of the host filesystem. Confirm that the container truly needs this scope.`
      );
    }

    if (
      (mount.source === "." || mount.source === "./") &&
      !mount.readOnly
    ) {
      add(
        "warning",
        "Writable project-root bind",
        "Mounting the whole project directory read-write is common in development, but it expands the container's ability to modify source files and is usually a poor production default."
      );
    }

    if (
      targetLooksConfig(mount.target) &&
      !mount.readOnly
    ) {
      add(
        "warning",
        "Config/static-style mount is writable",
        "This target looks like configuration, certificate or static content. Consider read_only/:ro when the application only needs to consume it."
      );
    }

    if (
      mount.syntax === "short" &&
      mount.source &&
      mount.createHostPath === null
    ) {
      add(
        "note",
        "Short bind syntax can create a missing host directory",
        "Compose short bind syntax can create the source directory on the host when it does not exist. Long syntax can set bind.create_host_path: false."
      );
    }

    if (
      mount.source.indexOf("./") === 0 ||
      mount.source.indexOf("../") === 0
    ) {
      add(
        "note",
        "Relative bind path",
        "Relative host paths are resolved from the Compose file's project location and are intended for local-runtime deployments; non-local platforms can reject them."
      );
    }
  }

  if (mount.sourceKind === "named") {
    const declared = topVolumes.indexOf(mount.source) !== -1;

    if (!declared) {
      add(
        "warning",
        "Named volume is not declared at top level",
        `Service uses named volume "${mount.source}", but it is not present in the top-level volumes mapping of this pasted Compose model.`
      );
    }
  }

  if (mount.sourceKind === "anonymous") {
    add(
      "note",
      "Anonymous volume",
      "An anonymous volume can be valid, but Docker assigns its name. Named volumes are easier to reference and manage when persistence is intentional."
    );
  }

  if (
    mount.type === "volume" &&
    mount.options.indexOf("nocopy") !== -1
  ) {
    add(
      "note",
      "volume.nocopy enabled",
      "The volume is configured not to receive initial data copied from the image's existing target directory."
    );
  }

  return issues;
}

function parseShortMount(
  value: string,
  service: string,
  topVolumes: string[]
): Mount {
  const parsed = splitShortSyntax(value);

  if (parsed.error) {
    const base: Omit<Mount, "issues"> = {
      service,
      type: "unknown",
      source: "",
      target: "",
      readOnly: false,
      syntax: "short",
      options: [],
      sourceKind: "other",
      declaredNamedVolume: false,
      createHostPath: null,
    };

    return {
      ...base,
      issues: [
        {
          severity: "high",
          service,
          target: "",
          title: "Ambiguous short volume syntax",
          message: parsed.error,
        },
      ],
    };
  }

  const readOnly = parsed.options.indexOf("ro") !== -1;
  const sourceKind = classifyMount(parsed.source, "");
  const base: Omit<Mount, "issues"> = {
    service,
    type:
      sourceKind === "bind" || sourceKind === "socket"
        ? "bind"
        : sourceKind === "named" || sourceKind === "anonymous"
        ? "volume"
        : "unknown",
    source: parsed.source,
    target: parsed.target,
    readOnly,
    syntax: "short",
    options: parsed.options,
    sourceKind,
    declaredNamedVolume:
      sourceKind === "named" &&
      topVolumes.indexOf(parsed.source) !== -1,
    createHostPath:
      sourceKind === "bind" || sourceKind === "socket"
        ? null
        : null,
  };

  return {
    ...base,
    issues: mountIssues(base, topVolumes),
  };
}

function parseLongMount(
  value: Record<string, unknown>,
  service: string,
  topVolumes: string[]
): Mount {
  const type = asString(value.type) || "volume";
  const source = asString(value.source);
  const target = asString(value.target);
  const readOnly = value.read_only === true;
  const sourceKind = classifyMount(source, type);
  const options: string[] = [];
  let createHostPath: boolean | null = null;

  if (type === "bind" && isRecord(value.bind)) {
    if (typeof value.bind.create_host_path === "boolean") {
      createHostPath = value.bind.create_host_path;
      options.push(
        `create_host_path=${String(value.bind.create_host_path)}`
      );
    }
    if (typeof value.bind.propagation === "string") {
      options.push(`propagation=${value.bind.propagation}`);
    }
    if (typeof value.bind.selinux === "string") {
      options.push(`selinux=${value.bind.selinux}`);
    }
  }

  if (type === "volume" && isRecord(value.volume)) {
    if (value.volume.nocopy === true) {
      options.push("nocopy");
    }
    if (typeof value.volume.subpath === "string") {
      options.push(`subpath=${value.volume.subpath}`);
    }
  }

  if (type === "tmpfs" && source) {
    options.push("tmpfs-source-ignored");
  }

  const base: Omit<Mount, "issues"> = {
    service,
    type,
    source,
    target,
    readOnly,
    syntax: "long",
    options,
    sourceKind,
    declaredNamedVolume:
      sourceKind === "named" &&
      topVolumes.indexOf(source) !== -1,
    createHostPath,
  };

  const issues = mountIssues(base, topVolumes);

  if (
    ["volume", "bind", "tmpfs", "image", "npipe", "cluster"].indexOf(type) === -1
  ) {
    issues.push({
      severity: "warning",
      service,
      target,
      title: "Unknown long-syntax mount type",
      message: `Mount type "${type}" is not one of the Compose mount types this checker recognizes. Verify support in your Docker Compose version/platform.`,
    });
  }

  if (type === "tmpfs" && source) {
    issues.push({
      severity: "warning",
      service,
      target,
      title: "tmpfs mount has a source",
      message:
        "Compose long-syntax tmpfs mounts do not use a source value. Remove it unless another tool generated a nonstandard model.",
    });
  }

  return {
    ...base,
    issues,
  };
}

function analyzeCompose(source: string): Report {
  const docs = parseAllDocuments(source, {
    uniqueKeys: true,
    prettyErrors: true,
  });

  const yamlErrors: string[] = [];
  const yamlWarnings: string[] = [];

  docs.forEach((doc, index) => {
    doc.errors.forEach((error) =>
      yamlErrors.push(`Document ${index + 1}: ${error.message}`)
    );
    doc.warnings.forEach((warning) =>
      yamlWarnings.push(`Document ${index + 1}: ${warning.message}`)
    );
  });

  if (yamlErrors.length) {
    throw new Error(`YAML parsing failed:\n${yamlErrors.join("\n")}`);
  }

  const nonEmpty = docs
    .map((doc) => doc.toJS({ maxAliasCount: 100 }))
    .filter((value) => value !== null && value !== undefined);

  if (nonEmpty.length !== 1) {
    throw new Error(
      `Expected one Compose YAML document, but found ${nonEmpty.length}. Docker Compose application files are reviewed here as one resolved YAML model.`
    );
  }

  const root = nonEmpty[0];

  if (!isRecord(root)) {
    throw new Error("Compose YAML must have a top-level mapping/object.");
  }

  if (!isRecord(root.services)) {
    throw new Error("No top-level services mapping was found.");
  }

  const services = root.services;
  const topVolumes = isRecord(root.volumes)
    ? Object.keys(root.volumes)
    : [];
  const mounts: Mount[] = [];

  Object.keys(services).forEach((serviceName) => {
    const service = services[serviceName];

    if (!isRecord(service) || service.volumes === undefined) {
      return;
    }

    if (!Array.isArray(service.volumes)) {
      mounts.push({
        service: serviceName,
        type: "unknown",
        source: "",
        target: "",
        readOnly: false,
        syntax: "long",
        options: [],
        sourceKind: "other",
        declaredNamedVolume: false,
        createHostPath: null,
        issues: [
          {
            severity: "high",
            service: serviceName,
            target: "",
            title: "Service volumes is not a sequence",
            message:
              "Compose service volumes should be a sequence/list of short- or long-syntax mount entries.",
          },
        ],
      });
      return;
    }

    service.volumes.forEach((entry) => {
      if (typeof entry === "string") {
        mounts.push(parseShortMount(entry, serviceName, topVolumes));
      } else if (isRecord(entry)) {
        mounts.push(parseLongMount(entry, serviceName, topVolumes));
      } else {
        mounts.push({
          service: serviceName,
          type: "unknown",
          source: "",
          target: "",
          readOnly: false,
          syntax: "long",
          options: [],
          sourceKind: "other",
          declaredNamedVolume: false,
          createHostPath: null,
          issues: [
            {
              severity: "high",
              service: serviceName,
              target: "",
              title: "Unsupported volume entry",
              message:
                "A service volume entry must be a short-syntax string or a long-syntax mapping.",
            },
          ],
        });
      }
    });
  });

  Object.keys(root.volumes || {}).forEach((name) => {
    if (!isRecord(root.volumes) || !isRecord(root.volumes[name])) {
      return;
    }

    const definition = root.volumes[name] as Record<string, unknown>;

    if (definition.external === true) {
      const extras = Object.keys(definition).filter(
        (key) => key !== "external" && key !== "name"
      );

      if (extras.length) {
        mounts.push({
          service: "(top-level volumes)",
          type: "volume-definition",
          source: name,
          target: "",
          readOnly: false,
          syntax: "long",
          options: [],
          sourceKind: "other",
          declaredNamedVolume: true,
          createHostPath: null,
          issues: [
            {
              severity: "high",
              service: "(top-level volumes)",
              target: "",
              title: `External volume "${name}" has incompatible attributes`,
              message:
                `When external: true, Compose treats lifecycle as external; attributes other than name are not relevant and Docker Compose rejects invalid combinations. Extra keys: ${extras.join(", ")}.`,
            },
          ],
        });
      }
    }
  });

  const targetMap: Record<string, number[]> = Object.create(null);

  mounts.forEach((mount, index) => {
    if (!mount.target || mount.service === "(top-level volumes)") return;
    const key = `${mount.service}\u0000${mount.target}`;

    if (!targetMap[key]) targetMap[key] = [];
    targetMap[key].push(index);
  });

  Object.keys(targetMap).forEach((key) => {
    const indexes = targetMap[key];

    if (indexes.length < 2) return;

    indexes.forEach((index) => {
      const mount = mounts[index];
      mount.issues.push({
        severity: "high",
        service: mount.service,
        target: mount.target,
        title: "Duplicate mount target in one service",
        message:
          `Service "${mount.service}" defines ${indexes.length} mounts for target "${mount.target}". Compose merge behavior and runtime obscuring can make the effective source surprising; resolve the duplicate deliberately.`,
      });
    });
  });

  const issues = mounts.reduce<Issue[]>((all, mount) => {
    mount.issues.forEach((issue) => all.push(issue));
    return all;
  }, []);

  return {
    mounts,
    issues,
    topLevelVolumes: topVolumes,
    yamlWarnings,
    sourceBytes: new TextEncoder().encode(source).length,
  };
}

function formatReport(report: Report) {
  const lines = [
    "Docker Compose volume review",
    `Mount entries: ${report.mounts.filter((m) => m.service !== "(top-level volumes)").length}`,
    `Top-level named volumes: ${report.topLevelVolumes.length}`,
    `High findings: ${report.issues.filter((i) => i.severity === "high").length}`,
    `Warnings: ${report.issues.filter((i) => i.severity === "warning").length}`,
    `UTF-8 source bytes: ${report.sourceBytes}`,
    "",
    "Mounts:",
  ];

  report.mounts.forEach((mount, index) => {
    lines.push(
      `${index + 1}. ${mount.service}`,
      `   type: ${mount.type}`,
      `   source: ${mount.source || "(anonymous / not applicable)"}`,
      `   target: ${mount.target || "(none)"}`,
      `   access: ${mount.readOnly ? "read-only" : "read-write/default"}`,
      `   syntax: ${mount.syntax}`,
      `   classification: ${mount.sourceKind}`
    );

    if (mount.options.length) {
      lines.push(`   options: ${mount.options.join(", ")}`);
    }
  });

  if (report.issues.length) {
    lines.push("", "Findings:");

    report.issues.forEach((issue, index) => {
      lines.push(
        `${index + 1}. ${issue.severity.toUpperCase()} — ${issue.service}${
          issue.target ? ` ${issue.target}` : ""
        }: ${issue.title}`,
        `   ${issue.message}`
      );
    });
  }

  lines.push(
    "",
    "Boundary: this browser review parses one pasted Compose YAML model. It does not resolve shell/.env interpolation, merge -f override files/includes/extends, inspect the host filesystem, verify external volumes, or ask the Docker Engine what will actually mount. Confirm the final model with docker compose config."
  );

  return lines.join("\n");
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const output = useMemo(
    () => (report ? formatReport(report) : ""),
    [report]
  );

  const clear = () => {
    setReport(null);
    setError("");
    setCopied(false);
  };

  const run = () => {
    if (!input.trim()) {
      setError("Paste a Docker Compose YAML file or service model.");
      setReport(null);
      return;
    }

    try {
      setReport(analyzeCompose(input));
      setError("");
      setCopied(false);
    } catch (caught) {
      setReport(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to review this Compose YAML."
      );
    }
  };

  const loadExample = () => {
    setInput(SAMPLE);
    clear();
  };

  const reset = () => {
    setInput("");
    clear();
  };

  const copy = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("The report could not be copied. Select and copy it manually.");
    }
  };

  const realMounts = report
    ? report.mounts.filter((mount) => mount.service !== "(top-level volumes)")
    : [];
  const highCount = report
    ? report.issues.filter((issue) => issue.severity === "high").length
    : 0;
  const warningCount = report
    ? report.issues.filter((issue) => issue.severity === "warning").length
    : 0;

  return (
    <ToolShell
      title="Docker Compose Volume Checker"
      description="Parse a Docker Compose file with YAML semantics and review bind mounts, named and anonymous volumes, Docker socket exposure, duplicate container targets, read-only opportunities and top-level volume declarations."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block text-sm font-semibold text-gray-900">
          Docker Compose YAML
        </label>
        <textarea
          value={input}
          onChange={(event: { target: { value: string } }) => {
            setInput(event.target.value);
            clear();
          }}
          rows={22}
          placeholder={SAMPLE}
          spellCheck={false}
          className="mt-3 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          This version reads real YAML instead of extracting volume lines with
          indentation heuristics. It reviews the pasted model as-is and does not
          perform Docker Compose interpolation or file merging.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={run} className="yoryantra-btn">
          Check Compose Volumes
        </button>
        <button type="button" onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>
        <button type="button" onClick={reset} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error ? (
        <div className="mt-5 whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      {report ? (
        <div className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Stat label="Mounts" value={String(realMounts.length)} />
            <Stat
              label="Bind mounts"
              value={String(
                realMounts.filter(
                  (mount) =>
                    mount.sourceKind === "bind" ||
                    mount.sourceKind === "socket"
                ).length
              )}
            />
            <Stat
              label="Named volumes"
              value={String(
                realMounts.filter((mount) => mount.sourceKind === "named").length
              )}
            />
            <Stat label="High findings" value={String(highCount)} />
            <Stat label="Warnings" value={String(warningCount)} />
          </div>

          {report.issues.length ? (
            <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
              <h3 className="font-semibold text-yellow-900">Volume findings</h3>
              <div className="mt-4 space-y-3">
                {report.issues.map((issue, index) => (
                  <div
                    key={`${issue.service}-${issue.title}-${index}`}
                    className="rounded-xl border border-yellow-200 bg-white/60 p-4 text-sm leading-relaxed text-yellow-900"
                  >
                    <strong>
                      {issue.severity.toUpperCase()} · {issue.title}
                    </strong>
                    <p className="mt-1">{issue.message}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Service</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Source</th>
                  <th className="px-4 py-3 font-semibold">Target</th>
                  <th className="px-4 py-3 font-semibold">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {realMounts.map((mount, index) => (
                  <tr key={`${mount.service}-${mount.target}-${index}`}>
                    <td className="px-4 py-3 font-mono text-xs">{mount.service}</td>
                    <td className="px-4 py-3">{mount.sourceKind}</td>
                    <td className="px-4 py-3 break-all font-mono text-xs">
                      {mount.source || "(anonymous)"}
                    </td>
                    <td className="px-4 py-3 break-all font-mono text-xs">
                      {mount.target || "(missing)"}
                    </td>
                    <td className="px-4 py-3">
                      {mount.readOnly ? "read-only" : "read-write/default"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Copyable review
              </h3>
              <button
                type="button"
                onClick={copy}
                className="yoryantra-btn-outline whitespace-nowrap"
              >
                {copied ? "Copied" : "Copy Report"}
              </button>
            </div>
            <pre className="yoryantra-output mt-4 min-h-[280px] max-h-[650px] overflow-auto whitespace-pre-wrap break-words font-mono text-sm">
              {output}
            </pre>
          </div>
        </div>
      ) : (
        <pre className="yoryantra-output mt-8 min-h-[300px] whitespace-pre-wrap break-words text-sm">
          Parsed mounts, named-volume declarations, duplicate targets and
          security/portability findings will appear here.
        </pre>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        YAML parsing and mount review happen on the pasted Compose text in your
        browser. The tool does not inspect host files, Docker volumes, the Docker
        socket or the Engine. Site-wide analytics or advertising scripts, if
        enabled, are separate from this review.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            A Valid Mount Can Still Give a Container Far More Host Access Than It Needs
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Compose syntax only tells you whether a mount can be described. It
            does not decide whether mounting <code>/</code>,{" "}
            <code>/etc</code>, the Docker daemon socket, or an entire source
            repository is appropriate for the workload.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This checker therefore separates structural parsing from review
            findings. A mount can remain syntactically recognizable while being
            flagged as a serious security or portability concern.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-xl font-semibold text-red-900">
            The Docker Socket Is Effectively an Administrative Interface
          </h2>
          <p className="mt-4 leading-relaxed text-red-900/90">
            Mounting <code>/var/run/docker.sock</code> allows software inside
            the container to send Docker API requests to the host daemon. In
            many configurations that can be used to create privileged
            containers, mount host directories or otherwise escape the normal
            application sandbox.
          </p>
          <p className="mt-4 leading-relaxed text-red-900/90">
            Some CI agents and management tools genuinely need daemon access.
            The important point is that this is not “just another Unix socket
            file.” Treat it as a high-trust capability.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Named Volumes and Bind Mounts Solve Different Problems
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A bind mount ties a container path to a host filesystem path. That
            is ideal for local source code, generated files or host-managed
            configuration, but it makes the service more dependent on the host.
            A named volume is managed by Docker and is usually a cleaner fit for
            persistent application data whose host pathname should not matter.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Named volumes reused by services belong in the Compose top-level{" "}
            <code>volumes</code> mapping. The checker compares service references
            with that declaration instead of assuming any non-path source exists.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            Short Bind Syntax Can Create a Host Directory You Did Not Mean to Create
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            Docker Compose documents backward-compatible behavior where a
            missing bind source used through short syntax can be created as a
            directory on the host. A typo such as{" "}
            <code>./confg:/app/config</code> can therefore produce an empty
            directory rather than immediately exposing the misspelling.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            Long syntax can set <code>bind.create_host_path: false</code>. For
            production configuration files, that can turn a silent mount
            surprise into an explicit startup failure.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Read-Only Is a Capability Decision, Not a Formatting Preference
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            If a process only needs to read certificates, generated static
            assets or configuration, a read-only mount prevents accidental or
            compromised writes through that mount. Conversely, databases and
            caches normally need writable storage.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This checker only suggests read-only treatment for targets that look
            configuration/static-oriented. It does not mark every read-write
            mount as wrong.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Duplicate Targets Matter Because Mounts Hide What Was There Before
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A mount replaces the container&apos;s view of the target path with the
            mounted source. Defining multiple sources for the same target makes
            the effective filesystem difficult to reason about—especially after
            Compose file merging or extends.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Docker Compose itself has target-based merge behavior in some
            Compose model operations. The browser checker flags duplicate
            targets in the pasted model and then tells you to inspect the real
            resolved model rather than trying to imitate every merge rule.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Modern Compose Has More Mount Types Than Bind and Volume
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Current Compose long syntax can describe volume, bind, tmpfs,
            npipe, image and cluster mounts. Advanced options include
            <code>volume.nocopy</code>, volume subpaths, bind propagation and{" "}
            <code>create_host_path</code>.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This tool identifies those types but focuses its security and
            lifecycle analysis on common bind/named-volume cases. Platform- or
            version-specific options still need Docker Compose validation.
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-relaxed text-gray-700">
          Docker&apos;s current{" "}
          <a
            href="https://docs.docker.com/reference/compose-file/services/#volumes"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--green)] underline underline-offset-4"
          >
            service volumes reference
          </a>{" "}
          documents short/long syntax, mount types, <code>read_only</code>,
          relative bind paths and <code>create_host_path</code>. The{" "}
          <a
            href="https://docs.docker.com/reference/compose-file/volumes/"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--green)] underline underline-offset-4"
          >
            top-level volumes reference
          </a>{" "}
          covers named-volume lifecycle and external volume definitions.
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Resolve the Real Compose Model Before Deployment
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Variables in source paths, multiple <code>-f</code> files,{" "}
            <code>include</code>, <code>extends</code> and profile-specific
            choices can change the final mount set. After browser review, run{" "}
            <code>docker compose config</code> from the actual project so Docker
            Compose performs its own interpolation and merge logic.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/docker-compose-volume-checker" />
        </div>
      </section>
    </ToolShell>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-2 break-words text-lg font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}
