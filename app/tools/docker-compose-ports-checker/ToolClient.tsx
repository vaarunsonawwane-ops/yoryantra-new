"use client";

import { useMemo, useState } from "react";
import { parseDocument } from "yaml";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "summary" | "json" | "table";
type Severity = "error" | "warning" | "info";

type PortMapping = {
  service: string;
  raw: string;
  line: number;
  hostIp: string;
  hostPort: string;
  containerPort: string;
  protocol: string;
  mode: "published" | "exposed" | "object" | "unknown";
  valid: boolean;
  normalizedHostKey: string;
};

type ServicePorts = {
  service: string;
  ports: PortMapping[];
  expose: PortMapping[];
};

type PortIssue = {
  severity: Severity;
  title: string;
  message: string;
  service: string;
  line: number;
};

type PortSummary = {
  services: ServicePorts[];
  mappings: PortMapping[];
  issues: PortIssue[];
  duplicateHostPorts: PortMapping[][];
  duplicateContainerPorts: PortMapping[][];
  publishedCount: number;
  exposedOnlyCount: number;
  invalidCount: number;
  privilegedHostPorts: number;
};

type YAMLLine = {
  raw: string;
  trimmed: string;
  indent: number;
  line: number;
};

const sampleCompose = `services:
  web:
    image: nginx:latest
    ports:
      - "8080:80"
      - "8443:443"

  api:
    image: node:22
    ports:
      - "3000:3000"
      - "127.0.0.1:9229:9229"

  admin:
    image: adminer
    ports:
      - "8080:8080"

  redis:
    image: redis:7
    expose:
      - "6379"`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [checkHostConflicts, setCheckHostConflicts] = useState(true);
  const [checkContainerConflicts, setCheckContainerConflicts] = useState(false);
  const [warnPrivilegedPorts, setWarnPrivilegedPorts] = useState(true);
  const [warnUnquotedPorts, setWarnUnquotedPorts] = useState(true);
  const [portsSummary, setPortsSummary] = useState<PortSummary | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const groupedIssues = useMemo(() => {
    if (!portsSummary) {
      return {
        errors: [],
        warnings: [],
        info: [],
      };
    }

    return {
      errors: portsSummary.issues.filter((issue) => issue.severity === "error"),
      warnings: portsSummary.issues.filter(
        (issue) => issue.severity === "warning"
      ),
      info: portsSummary.issues.filter((issue) => issue.severity === "info"),
    };
  }, [portsSummary]);

  const checkPorts = () => {
    if (!input.trim()) {
      setError("Please paste a Docker Compose YAML file.");
      setPortsSummary(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const summary = analyzeComposePorts(input, {
        checkHostConflicts,
        checkContainerConflicts,
        warnPrivilegedPorts,
        warnUnquotedPorts,
      });

      const nextOutput = formatPortOutput(summary, {
        outputMode,
      });

      setPortsSummary(summary);
      setOutput(nextOutput);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to check Docker Compose ports."
      );
      setPortsSummary(null);
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
    setInput(sampleCompose);
    setOutputMode("summary");
    setCheckHostConflicts(true);
    setCheckContainerConflicts(false);
    setWarnPrivilegedPorts(true);
    setWarnUnquotedPorts(true);
    setPortsSummary(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setOutputMode("summary");
    setCheckHostConflicts(true);
    setCheckContainerConflicts(false);
    setWarnPrivilegedPorts(true);
    setWarnUnquotedPorts(true);
    setPortsSummary(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="Docker Compose Ports Checker"
      description="Review published ports, host bindings, ranges, protocols, expose entries, and cross-service conflicts before deployment."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Docker Compose YAML
        </label>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setPortsSummary(null);
            setOutput("");
            setError("");
            setCopied(false);
          }}
          placeholder={sampleCompose}
          className="w-full min-h-[430px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste a Docker Compose file to check published ports, exposed ports,
          duplicate host ports, and service-level port mapping problems.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Check Options
        </h3>

        <div className="mt-4 max-w-md">
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
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex min-h-[104px] cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={checkHostConflicts}
              onChange={(event) => {
                setCheckHostConflicts(event.target.checked);
                setPortsSummary(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium leading-5 text-gray-900">
                Check host conflicts
              </span>

              <span className="mt-1 block text-sm leading-6 text-gray-500">
                Find services trying to publish the same host port.
              </span>
            </span>
          </label>

          <label className="flex min-h-[104px] cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={checkContainerConflicts}
              onChange={(event) => {
                setCheckContainerConflicts(event.target.checked);
                setPortsSummary(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium leading-5 text-gray-900">
                Check container ports
              </span>

              <span className="mt-1 block text-sm leading-6 text-gray-500">
                Warn when several services use the same container port.
              </span>
            </span>
          </label>

          <label className="flex min-h-[104px] cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={warnPrivilegedPorts}
              onChange={(event) => {
                setWarnPrivilegedPorts(event.target.checked);
                setPortsSummary(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium leading-5 text-gray-900">
                Warn privileged ports
              </span>

              <span className="mt-1 block text-sm leading-6 text-gray-500">
                Warn when host ports are below 1024.
              </span>
            </span>
          </label>

          <label className="flex min-h-[104px] cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={warnUnquotedPorts}
              onChange={(event) => {
                setWarnUnquotedPorts(event.target.checked);
                setPortsSummary(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium leading-5 text-gray-900">
                Warn unquoted ports
              </span>

              <span className="mt-1 block text-sm leading-6 text-gray-500">
                Suggest quoting port mappings like "8080:80".
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={checkPorts} className="yoryantra-btn">
          Check Compose Ports
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

      {portsSummary && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Services"
            value={portsSummary.services.length.toLocaleString()}
          />
          <SummaryCard
            label="Published Ports"
            value={portsSummary.publishedCount.toLocaleString()}
          />
          <SummaryCard
            label="Issues"
            value={portsSummary.issues.length.toLocaleString()}
          />
          <SummaryCard
            label="Host Conflicts"
            value={portsSummary.duplicateHostPorts.length.toLocaleString()}
          />
        </div>
      )}

      {portsSummary && portsSummary.mappings.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Port Mappings Found
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Published and exposed ports detected from the Compose file.
          </p>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Service</th>
                  <th className="px-4 py-3 font-semibold">Mode</th>
                  <th className="px-4 py-3 font-semibold">Host IP</th>
                  <th className="px-4 py-3 font-semibold">Host Port</th>
                  <th className="px-4 py-3 font-semibold">Container Port</th>
                  <th className="px-4 py-3 font-semibold">Protocol</th>
                  <th className="px-4 py-3 font-semibold">Line</th>
                  <th className="px-4 py-3 font-semibold">Raw</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {portsSummary.mappings.map((mapping, index) => (
                  <tr key={`${mapping.service}-${mapping.line}-${index}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">
                      {mapping.service}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {mapping.mode}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {mapping.hostIp || "(all)"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {mapping.hostPort || "(none)"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {mapping.containerPort || "(none)"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {mapping.protocol}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {mapping.line}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      <span className="block max-w-[300px] break-words">
                        {mapping.raw}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {portsSummary && portsSummary.issues.length > 0 && (
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <IssueColumn
            title="Errors"
            description="Problems that can break port publishing."
            issues={groupedIssues.errors}
          />

          <IssueColumn
            title="Warnings"
            description="Things that may work but should be reviewed."
            issues={groupedIssues.warnings}
          />

          <IssueColumn
            title="Info"
            description="Helpful notes about port mappings."
            issues={groupedIssues.info}
          />
        </div>
      )}

      {portsSummary && portsSummary.issues.length === 0 && (
        <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-relaxed text-green-800">
          No port issues found with the selected checks.
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Ports Output
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
          {output || "Docker Compose ports output will appear here."}
        </pre>
      </div>

      <div className="mt-4 self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Docker Compose port checking happens directly in your browser. Your YAML
        is not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What Docker Compose port checks can catch before `up`
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Port collisions often appear when several services try to
            publish the same host port. A web app, admin panel, database UI, or
            local debug service can fail to start because another container is
            already using the port.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Docker Compose Ports Checker reads the ports and expose sections
            from a Compose file and shows published ports, container ports,
            duplicate host ports, invalid mappings, privileged ports, and useful
            notes before you run the stack.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reading short and long Compose port syntax
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste your Docker Compose YAML into the input box.</li>
            <li>Choose whether to check host ports, container ports, and low ports.</li>
            <li>Run the checker to see published and exposed ports.</li>
            <li>Review conflicts, invalid mappings, and quoting suggestions.</li>
            <li>Copy the summary, JSON, or table output for notes or fixes.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Where port collisions usually appear
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Finding two services using the same host port.</li>
            <li>Checking localhost-bound ports like 127.0.0.1:9229:9229.</li>
            <li>Reviewing published ports before sharing a Compose file.</li>
            <li>Finding unquoted port mappings that may be confusing in YAML.</li>
            <li>Checking exposed-only ports that are not published to the host.</li>
            <li>Preparing cleaner debugging notes for a Compose startup issue.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reading one published-port mapping
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`services:
  web:
    ports:
      - "8080:80"
      - "127.0.0.1:9229:9229"

  admin:
    ports:
      - "8080:8080"`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            `ports` and `expose` have different network effects
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The ports section publishes a container port to the host machine.
            The expose section only documents or exposes ports inside the Docker
            network. A service can be reachable by other containers without being
            published to your laptop or server.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            When a container is not reachable from the browser or API client,
            check whether the port is actually published under ports and whether
            another service is already using the same host port.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Compose syntax is the source of truth
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            Docker documents both short and long <code>ports</code> syntax,
            requires equivalent host/container range lengths, and rejects port
            publishing with <code>network_mode: host</code>. The checker follows
            those rules, but it does not run the Docker Engine or test whether a
            port is already occupied by a process outside this Compose file.
          </p>
          <p className="mt-3 text-sm text-gray-600">
            <a
              href="https://docs.docker.com/reference/compose-file/services/#ports"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              Docker Compose services reference: ports
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Docker Compose port questions that change the result
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What counts as a host-port conflict?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It reads Docker Compose YAML and checks published ports, exposed
                ports, duplicate host ports, invalid mappings, and port
                configuration issues.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                When can the same container port appear in several services?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. It can show when two services publish the same host port,
                which often causes one container to fail at startup.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this prove the Compose file will start?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. This tool only checks the YAML text. It does not run Docker
                or connect to your machine.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Where does the Compose YAML go?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Port checking happens directly in your browser, and your
                YAML is not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4"><YoryantraRelatedTools currentHref="/tools/docker-compose-ports-checker" /></div>
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

function IssueColumn({
  title,
  description,
  issues,
}: {
  title: string;
  description: string;
  issues: PortIssue[];
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>

      <p className="mt-2 text-sm text-gray-500">{description}</p>

      <div className="mt-4 space-y-3">
        {issues.length === 0 ? (
          <p className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
            No {title.toLowerCase()} found.
          </p>
        ) : (
          issues.map((issue, index) => (
            <div
              key={`${issue.severity}-${issue.service}-${issue.line}-${index}`}
              className="rounded-xl border border-gray-200 bg-gray-50 p-4"
            >
              <p className="text-sm font-semibold text-gray-900">
                {issue.title}
              </p>

              <p className="mt-1 text-sm leading-relaxed text-gray-600">
                {issue.message}
              </p>

              <p className="mt-2 break-words font-mono text-xs text-gray-500">
                {issue.service ? `${issue.service}, ` : ""}line {issue.line || "?"}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function analyzeComposePorts(
  input: string,
  options: {
    checkHostConflicts: boolean;
    checkContainerConflicts: boolean;
    warnPrivilegedPorts: boolean;
    warnUnquotedPorts: boolean;
  }
): PortSummary {
  const services = parseComposeServicesFromDocument(input);
  const mappings = services.reduce<PortMapping[]>(
    (all, service) => all.concat(service.ports, service.expose),
    []
  );
  const issues: PortIssue[] = [...findHostNetworkPortIssues(input)];

  mappings.forEach((mapping) => {
    if (!mapping.valid) {
      issues.push({
        severity: "error",
        title: "Invalid port mapping",
        message: `Could not read the port mapping "${mapping.raw}".`,
        service: mapping.service,
        line: mapping.line,
      });
    }

    if (
      options.warnPrivilegedPorts &&
      mapping.hostPort &&
      isNumericPort(mapping.hostPort) &&
      Number(mapping.hostPort) < 1024
    ) {
      issues.push({
        severity: "warning",
        title: "Privileged host port",
        message:
          "Host ports below 1024 may need elevated permissions or may conflict with system services.",
        service: mapping.service,
        line: mapping.line,
      });
    }

    if (
      options.warnUnquotedPorts &&
      mapping.mode === "published" &&
      mapping.raw.includes(":") &&
      mapping.raw.startsWith("UNQUOTED:")
    ) {
      issues.push({
        severity: "info",
        title: "Port mapping is not quoted",
        message:
          "Quoting port mappings like \"8080:80\" avoids YAML confusion and keeps the value clearly as a string.",
        service: mapping.service,
        line: mapping.line,
      });
    }

    if (mapping.protocol && !["tcp", "udp"].includes(mapping.protocol)) {
      issues.push({
        severity: "warning",
        title: "Unusual protocol",
        message:
          "Docker Compose ports usually use tcp or udp. Review this protocol value.",
        service: mapping.service,
        line: mapping.line,
      });
    }

    if (mapping.hostPort && mapping.hostPort.includes("-")) {
      issues.push({
        severity: "info",
        title: "Host port range found",
        message:
          "Port ranges are valid in some Compose use cases, but they are harder to check for conflicts exactly.",
        service: mapping.service,
        line: mapping.line,
      });
    }
  });

  const duplicateHostPorts = options.checkHostConflicts
    ? findDuplicateHostPorts(mappings)
    : [];
  duplicateHostPorts.forEach((group) => {
    group.forEach((mapping) => {
      issues.push({
        severity: "error",
        title: "Duplicate host port",
        message: `Host port ${mapping.hostPort}/${mapping.protocol} is published by more than one service.`,
        service: mapping.service,
        line: mapping.line,
      });
    });
  });

  const duplicateContainerPorts = options.checkContainerConflicts
    ? findDuplicateContainerPorts(mappings)
    : [];
  duplicateContainerPorts.forEach((group) => {
    group.forEach((mapping) => {
      issues.push({
        severity: "warning",
        title: "Repeated container port",
        message: `Container port ${mapping.containerPort}/${mapping.protocol} appears in more than one service.`,
        service: mapping.service,
        line: mapping.line,
      });
    });
  });

  return {
    services,
    mappings,
    issues,
    duplicateHostPorts,
    duplicateContainerPorts,
    publishedCount: mappings.filter((mapping) => mapping.mode === "published" || mapping.mode === "object").length,
    exposedOnlyCount: mappings.filter((mapping) => mapping.mode === "exposed").length,
    invalidCount: mappings.filter((mapping) => !mapping.valid).length,
    privilegedHostPorts: mappings.filter(
      (mapping) =>
        mapping.hostPort &&
        isNumericPort(mapping.hostPort) &&
        Number(mapping.hostPort) < 1024
    ).length,
  };
}

function parseComposeServicesFromDocument(input: string): ServicePorts[] {
  const document = parseDocument(input, {
    prettyErrors: true,
    uniqueKeys: true,
  });

  if (document.errors.length > 0) {
    throw new Error(document.errors[0].message);
  }

  const root = document.toJS({ mapAsMap: false }) as unknown;

  if (!isPlainRecord(root) || !isPlainRecord(root.services)) {
    throw new Error("Could not find a top-level services mapping.");
  }

  const services = Object.entries(root.services).map(([service, serviceValue]) => {
    if (!isPlainRecord(serviceValue)) {
      return { service, ports: [], expose: [] };
    }

    return {
      service,
      ports: parsePortCollection(service, serviceValue.ports, "ports"),
      expose: parsePortCollection(service, serviceValue.expose, "expose"),
    };
  });

  if (services.length === 0) {
    throw new Error("No services were found under the services mapping.");
  }

  return services;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parsePortCollection(
  service: string,
  value: unknown,
  sectionName: "ports" | "expose"
): PortMapping[] {
  if (value === undefined || value === null) return [];

  if (!Array.isArray(value)) {
    return [
      {
        service,
        raw: JSON.stringify(value),
        line: 0,
        hostIp: "",
        hostPort: "",
        containerPort: "",
        protocol: "tcp",
        mode: sectionName === "expose" ? "exposed" : "unknown",
        valid: false,
        normalizedHostKey: "",
      },
    ];
  }

  return value.map((entry) => {
    if (typeof entry === "string" || typeof entry === "number") {
      return parsePortString(service, String(entry), 0, sectionName);
    }

    if (isPlainRecord(entry)) {
      return parseObjectPortValue(service, entry, sectionName);
    }

    return {
      service,
      raw: JSON.stringify(entry),
      line: 0,
      hostIp: "",
      hostPort: "",
      containerPort: "",
      protocol: "tcp",
      mode: "unknown" as const,
      valid: false,
      normalizedHostKey: "",
    };
  });
}

function parseObjectPortValue(
  service: string,
  value: Record<string, unknown>,
  sectionName: "ports" | "expose"
): PortMapping {
  const hostIp = typeof value.host_ip === "string" ? value.host_ip : "";
  const hostPort =
    typeof value.published === "string" || typeof value.published === "number"
      ? String(value.published)
      : "";
  const containerPort =
    typeof value.target === "string" || typeof value.target === "number"
      ? String(value.target)
      : "";
  const protocol = typeof value.protocol === "string" ? value.protocol.toLowerCase() : "tcp";
  const valid =
    Boolean(containerPort) &&
    isPortOrRange(containerPort) &&
    (!hostPort || isPortOrRange(hostPort)) &&
    rangesHaveCompatibleCardinality(hostPort, containerPort);

  return {
    service,
    raw: JSON.stringify(value),
    line: 0,
    hostIp,
    hostPort,
    containerPort,
    protocol,
    mode: sectionName === "expose" ? "exposed" : "object",
    valid,
    normalizedHostKey: buildHostKey(hostIp, hostPort, protocol),
  };
}

function rangesHaveCompatibleCardinality(hostPort: string, containerPort: string) {
  if (!hostPort || !hostPort.includes("-") || !containerPort.includes("-")) {
    return true;
  }

  return portRangeSize(hostPort) === portRangeSize(containerPort);
}

function portRangeSize(value: string) {
  const [start, end] = value.split("-").map(Number);
  return end - start + 1;
}

function findHostNetworkPortIssues(input: string): PortIssue[] {
  const document = parseDocument(input, { prettyErrors: true, uniqueKeys: true });
  if (document.errors.length > 0) return [];
  const root = document.toJS({ mapAsMap: false }) as unknown;
  if (!isPlainRecord(root) || !isPlainRecord(root.services)) return [];

  const issues: PortIssue[] = [];
  Object.entries(root.services).forEach(([service, value]) => {
    if (
      isPlainRecord(value) &&
      value.network_mode === "host" &&
      Array.isArray(value.ports) &&
      value.ports.length > 0
    ) {
      issues.push({
        severity: "error",
        title: "Port publishing conflicts with host networking",
        message:
          'Docker Compose rejects port mappings when network_mode is "host" because the container already uses the host network.',
        service,
        line: 0,
      });
    }
  });
  return issues;
}

function toLines(input: string): YAMLLine[] {
  return input.replace(/\r\n/g, "\n").split("\n").map((raw, index) => ({
    raw,
    trimmed: stripComment(raw).trim(),
    indent: raw.length - raw.replace(/^\s+/, "").length,
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

function parseComposeServices(lines: YAMLLine[]): ServicePorts[] {
  const servicesLine = lines.find(
    (line) => line.indent === 0 && line.trimmed === "services:"
  );

  if (!servicesLine) {
    throw new Error("Could not find a top-level services block.");
  }

  const serviceLines = lines.filter(
    (line) =>
      line.line > servicesLine.line &&
      line.indent === 2 &&
      line.trimmed.endsWith(":")
  );

  const services = serviceLines.map((serviceLine, index) => {
    const nextServiceLine = serviceLines[index + 1];
    const serviceName = serviceLine.trimmed.slice(0, -1);
    const blockLines = lines.filter(
      (line) =>
        line.line > serviceLine.line &&
        (!nextServiceLine || line.line < nextServiceLine.line)
    );

    return {
      service: serviceName,
      ports: parsePortsForService(serviceName, blockLines, "ports"),
      expose: parsePortsForService(serviceName, blockLines, "expose"),
    };
  });

  if (services.length === 0) {
    throw new Error("No services were found under the services block.");
  }

  return services;
}

function parsePortsForService(
  service: string,
  lines: YAMLLine[],
  sectionName: "ports" | "expose"
): PortMapping[] {
  const section = lines.find(
    (line) => line.indent === 4 && line.trimmed === `${sectionName}:`
  );

  if (!section) {
    return [];
  }

  const itemLines = lines.filter(
    (line) =>
      line.line > section.line &&
      line.indent > section.indent &&
      line.trimmed.startsWith("-")
  );

  const mappings: PortMapping[] = [];

  itemLines.forEach((line, index) => {
    const nextItem = itemLines[index + 1];
    const rawItem = line.trimmed.replace(/^-\s*/, "");

    if (rawItem.includes(":") && !rawItem.startsWith("{") && !rawItem.includes("=")) {
      mappings.push(parsePortString(service, rawItem, line.line, sectionName));
      return;
    }

    if (rawItem && !rawItem.includes(":")) {
      mappings.push(parsePortString(service, rawItem, line.line, sectionName));
      return;
    }

    const objectLines = lines.filter(
      (candidate) =>
        candidate.line >= line.line &&
        (!nextItem || candidate.line < nextItem.line)
    );
    const objectMapping = parseObjectPort(service, objectLines, line.line, sectionName);

    if (objectMapping) {
      mappings.push(objectMapping);
    }
  });

  return mappings;
}

function parsePortString(
  service: string,
  rawInput: string,
  line: number,
  sectionName: "ports" | "expose"
): PortMapping {
  const raw = cleanValue(rawInput);
  const protocolSplit = raw.split("/");
  const portPart = protocolSplit[0];
  const protocol = (protocolSplit[1] || "tcp").trim();
  const parts = portPart.split(":");
  const mode = sectionName === "expose" ? "exposed" : "published";

  let hostIp = "";
  let hostPort = "";
  let containerPort = "";

  if (sectionName === "expose") {
    containerPort = parts[0] || "";
  } else if (parts.length === 1) {
    containerPort = parts[0] || "";
  } else if (parts.length === 2) {
    hostPort = parts[0] || "";
    containerPort = parts[1] || "";
  } else if (parts.length >= 3) {
    hostIp = parts.slice(0, -2).join(":");
    hostPort = parts[parts.length - 2] || "";
    containerPort = parts[parts.length - 1] || "";
  }

  const valid =
    Boolean(containerPort) &&
    isPortOrRange(containerPort) &&
    (!hostPort || isPortOrRange(hostPort)) &&
    rangesHaveCompatibleCardinality(hostPort, containerPort);

  return {
    service,
    raw: rawInput,
    line,
    hostIp,
    hostPort,
    containerPort,
    protocol,
    mode,
    valid,
    normalizedHostKey: buildHostKey(hostIp, hostPort, protocol),
  };
}

function parseObjectPort(
  service: string,
  lines: YAMLLine[],
  fallbackLine: number,
  sectionName: "ports" | "expose"
): PortMapping | null {
  const values: Record<string, string> = {};

  lines.forEach((line) => {
    const cleaned = line.trimmed.replace(/^-\s*/, "");
    const colonIndex = cleaned.indexOf(":");

    if (colonIndex === -1) {
      return;
    }

    const key = cleaned.slice(0, colonIndex).trim();
    const value = cleanValue(cleaned.slice(colonIndex + 1).trim());

    if (key) {
      values[key] = value;
    }
  });

  if (Object.keys(values).length === 0) {
    return null;
  }

  const hostIp = values.host_ip || values.hostIp || "";
  const hostPort = values.published || values.host_port || values.hostPort || "";
  const containerPort = values.target || values.container_port || values.containerPort || "";
  const protocol = values.protocol || "tcp";
  const valid = Boolean(containerPort) && isPortOrRange(containerPort) && (!hostPort || isPortOrRange(hostPort));

  return {
    service,
    raw: lines.map((line) => line.raw.trim()).join(" "),
    line: fallbackLine,
    hostIp,
    hostPort,
    containerPort,
    protocol,
    mode: sectionName === "expose" ? "exposed" : "object",
    valid,
    normalizedHostKey: buildHostKey(hostIp, hostPort, protocol),
  };
}

function findDuplicateHostPorts(mappings: PortMapping[]) {
  const published = mappings.filter(
    (mapping) => mapping.hostPort && mapping.valid && mapping.mode !== "exposed"
  );
  const groups: PortMapping[][] = [];
  const visited = new Set<number>();

  for (let index = 0; index < published.length; index += 1) {
    if (visited.has(index)) continue;
    const group = [published[index]];

    for (let other = index + 1; other < published.length; other += 1) {
      if (
        published[index].protocol === published[other].protocol &&
        hostBindingsOverlap(published[index], published[other])
      ) {
        group.push(published[other]);
        visited.add(other);
      }
    }

    if (group.length > 1) {
      visited.add(index);
      groups.push(group);
    }
  }

  return groups;
}

function hostBindingsOverlap(left: PortMapping, right: PortMapping) {
  if (!portRangesOverlap(left.hostPort, right.hostPort)) return false;

  const leftIp = normalizeBindingIp(left.hostIp);
  const rightIp = normalizeBindingIp(right.hostIp);

  if (leftIp === rightIp) return true;
  if (leftIp === "0.0.0.0" && isIPv4Binding(rightIp)) return true;
  if (rightIp === "0.0.0.0" && isIPv4Binding(leftIp)) return true;
  return false;
}

function normalizeBindingIp(value: string) {
  const cleaned = value.replace(/^\[|\]$/g, "");
  return cleaned || "0.0.0.0";
}

function isIPv4Binding(value: string) {
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(value);
}

function portRangesOverlap(left: string, right: string) {
  const [leftStart, leftEnd] = portRangeBounds(left);
  const [rightStart, rightEnd] = portRangeBounds(right);
  return leftStart <= rightEnd && rightStart <= leftEnd;
}

function portRangeBounds(value: string): [number, number] {
  if (value.includes("-")) {
    const [start, end] = value.split("-").map(Number);
    return [start, end];
  }
  const port = Number(value);
  return [port, port];
}

function findDuplicateContainerPorts(mappings: PortMapping[]) {
  const groups = new Map<string, PortMapping[]>();

  mappings
    .filter((mapping) => mapping.containerPort && mapping.valid)
    .forEach((mapping) => {
      const key = `${mapping.containerPort}/${mapping.protocol}`;
      const existing = groups.get(key) || [];
      existing.push(mapping);
      groups.set(key, existing);
    });

  return Array.from(groups.values()).filter((group) => group.length > 1);
}

function buildHostKey(hostIp: string, hostPort: string, protocol: string) {
  return `${hostIp || "0.0.0.0"}:${hostPort}/${protocol}`;
}

function isPortOrRange(value: string) {
  if (!value) {
    return false;
  }

  if (value.includes("-")) {
    const [start, end] = value.split("-").map(Number);
    return isValidPortNumber(start) && isValidPortNumber(end) && start <= end;
  }

  return isValidPortNumber(Number(value));
}

function isNumericPort(value: string) {
  return /^\d+$/.test(value);
}

function isValidPortNumber(value: number) {
  return Number.isInteger(value) && value > 0 && value <= 65535;
}

function isQuoted(value: string) {
  const trimmed = value.trim();
  return (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  );
}

function cleanValue(value: string) {
  return value.trim().replace(/^["']|["']$/g, "");
}

function formatPortOutput(
  summary: PortSummary,
  options: {
    outputMode: OutputMode;
  }
) {
  if (options.outputMode === "json") {
    return JSON.stringify(summary, null, 2);
  }

  if (options.outputMode === "table") {
    return [
      "Service | Mode | Host IP | Host Port | Container Port | Protocol | Line",
      "--- | --- | --- | --- | --- | --- | ---:",
      ...summary.mappings.map(
        (mapping) =>
          `${mapping.service} | ${mapping.mode} | ${mapping.hostIp || "(all)"} | ${
            mapping.hostPort || "(none)"
          } | ${mapping.containerPort || "(none)"} | ${mapping.protocol} | ${
            mapping.line
          }`
      ),
    ].join("\n");
  }

  return [
    "Docker Compose Ports Check",
    "--------------------------",
    `Services checked: ${summary.services.length}`,
    `Published ports: ${summary.publishedCount}`,
    `Exposed-only ports: ${summary.exposedOnlyCount}`,
    `Issues: ${summary.issues.length}`,
    `Invalid mappings: ${summary.invalidCount}`,
    `Host port conflict groups: ${summary.duplicateHostPorts.length}`,
    `Privileged host ports: ${summary.privilegedHostPorts}`,
    "",
    "Port mappings:",
    ...(summary.mappings.length === 0
      ? ["(none found)"]
      : summary.mappings.map(
          (mapping) =>
            `- ${mapping.service}: ${mapping.hostIp ? `${mapping.hostIp}:` : ""}${
              mapping.hostPort ? `${mapping.hostPort}:` : ""
            }${mapping.containerPort}/${mapping.protocol} (${mapping.mode}, line ${mapping.line})`
        )),
    "",
    "Issues:",
    ...(summary.issues.length === 0
      ? ["No port issues found with the selected checks."]
      : summary.issues.map(
          (issue) =>
            `- [${issue.severity.toUpperCase()}] ${issue.title}: ${
              issue.message
            } (${issue.service || "compose"}, line ${issue.line || "?"})`
        )),
  ].join("\n");
}
