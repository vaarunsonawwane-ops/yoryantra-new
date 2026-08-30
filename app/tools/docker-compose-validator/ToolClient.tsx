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

const isObject = (value: unknown): value is PlainObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const typeName = (value: unknown) => {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
};

const addTypeFinding = (
  findings: Finding[],
  value: unknown,
  expected: "object" | "array" | "string",
  path: string
) => {
  const valid =
    expected === "object"
      ? isObject(value)
      : expected === "array"
        ? Array.isArray(value)
        : typeof value === "string";

  if (!valid) {
    findings.push({
      level: "error",
      path,
      message: `Expected ${expected}, found ${typeName(value)}.`,
    });
  }
};

const getListNames = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  if (isObject(value)) return Object.keys(value);
  return [];
};

const validateServiceReferences = (
  serviceName: string,
  service: PlainObject,
  root: PlainObject,
  findings: Finding[]
) => {
  const serviceNames = isObject(root.services) ? Object.keys(root.services) : [];
  const declaredNetworks = isObject(root.networks) ? Object.keys(root.networks) : [];
  const declaredConfigs = isObject(root.configs) ? Object.keys(root.configs) : [];
  const declaredSecrets = isObject(root.secrets) ? Object.keys(root.secrets) : [];

  const dependsOn = getListNames(service.depends_on);
  dependsOn.forEach((name) => {
    if (!serviceNames.includes(name)) {
      findings.push({
        level: "warning",
        path: `services.${serviceName}.depends_on`,
        message: `References service "${name}", which is not declared in this file.`,
      });
    }
  });

  const networks = getListNames(service.networks);
  networks.forEach((name) => {
    if (name !== "default" && !declaredNetworks.includes(name)) {
      findings.push({
        level: "warning",
        path: `services.${serviceName}.networks`,
        message: `References network "${name}" without a matching top-level networks entry. It may be supplied by another merged Compose file.`,
      });
    }
  });

  const inspectResourceList = (
    field: "configs" | "secrets",
    declared: string[]
  ) => {
    const value = service[field];
    if (!Array.isArray(value)) return;

    value.forEach((item, index) => {
      const source =
        typeof item === "string"
          ? item
          : isObject(item) && typeof item.source === "string"
            ? item.source
            : null;

      if (source && !declared.includes(source)) {
        findings.push({
          level: "warning",
          path: `services.${serviceName}.${field}[${index}]`,
          message: `References ${field.slice(0, -1)} "${source}" without a matching top-level ${field} entry. It may be external or supplied by another merged file.`,
        });
      }
    });
  };

  inspectResourceList("configs", declaredConfigs);
  inspectResourceList("secrets", declaredSecrets);
};

export const inspectComposeDocument = (parsed: unknown): { findings: Finding[]; services: string[] } => {
  const findings: Finding[] = [];

  if (!isObject(parsed)) {
    findings.push({
      level: "error",
      path: "$",
      message: "A Compose file must have a mapping/object at the document root.",
    });
    return { findings, services: [] };
  }

  if (Object.prototype.hasOwnProperty.call(parsed, "version")) {
    findings.push({
      level: "warning",
      path: "version",
      message: "The top-level version field is obsolete in the current Compose Specification. Modern Docker Compose uses the latest schema regardless of this value.",
    });
  }

  if (!Object.prototype.hasOwnProperty.call(parsed, "services")) {
    findings.push({
      level: "error",
      path: "services",
      message: "Missing the required top-level services mapping.",
    });
    return { findings, services: [] };
  }

  if (!isObject(parsed.services)) {
    findings.push({
      level: "error",
      path: "services",
      message: `Expected object, found ${typeName(parsed.services)}.`,
    });
    return { findings, services: [] };
  }

  const servicesMap = parsed.services;
  const services = Object.keys(servicesMap);
  if (services.length === 0) {
    findings.push({
      level: "warning",
      path: "services",
      message: "The services mapping is empty, so this file defines no runnable services.",
    });
  }

  (["networks", "volumes", "configs", "secrets"] as const).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(parsed, key)) {
      addTypeFinding(findings, parsed[key], "object", key);
    }
  });

  services.forEach((name) => {
    const service = servicesMap[name];
    const path = `services.${name}`;

    if (!isObject(service)) {
      findings.push({
        level: "error",
        path,
        message: `Service definitions must be mappings/objects, found ${typeName(service)}.`,
      });
      return;
    }

    const typedFields: Array<[string, "object" | "array" | "string"]> = [
      ["image", "string"],
      ["ports", "array"],
      ["volumes", "array"],
      ["configs", "array"],
      ["secrets", "array"],
      ["profiles", "array"],
      ["deploy", "object"],
      ["healthcheck", "object"],
    ];

    typedFields.forEach(([field, expected]) => {
      if (Object.prototype.hasOwnProperty.call(service, field)) {
        addTypeFinding(findings, service[field], expected, `${path}.${field}`);
      }
    });

    if (Object.prototype.hasOwnProperty.call(service, "build")) {
      const build = service.build;
      if (!(typeof build === "string" || isObject(build))) {
        findings.push({
          level: "error",
          path: `${path}.build`,
          message: `Expected a string path or object, found ${typeName(build)}.`,
        });
      }
    }

    (["environment", "labels", "depends_on", "networks"] as const).forEach((field) => {
      if (!Object.prototype.hasOwnProperty.call(service, field)) return;
      const value = service[field];
      if (!(Array.isArray(value) || isObject(value))) {
        findings.push({
          level: "error",
          path: `${path}.${field}`,
          message: `Expected an array or object, found ${typeName(value)}.`,
        });
      }
    });

    if (Array.isArray(service.profiles)) {
      service.profiles.forEach((profile, index) => {
        if (typeof profile !== "string") {
          findings.push({
            level: "error",
            path: `${path}.profiles[${index}]`,
            message: "Profile names must be strings.",
          });
        }
      });
    }

    validateServiceReferences(name, service, parsed, findings);
  });

  if (findings.length === 0) {
    findings.push({
      level: "info",
      path: "$",
      message: "No problems were found by these structural checks.",
    });
  }

  return { findings, services };
};

const formatFindings = (findings: Finding[]) => {
  const counts = findings.reduce(
    (acc, finding) => {
      acc[finding.level] += 1;
      return acc;
    },
    { error: 0, warning: 0, info: 0 }
  );

  const lines = findings.map(
    (finding) =>
      `${finding.level.toUpperCase()}  ${finding.path}\n${finding.message}`
  );

  return {
    counts,
    text: lines.join("\n\n"),
  };
};

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const validateCompose = () => {
    if (!input.trim()) {
      setError("Please enter Docker Compose YAML.");
      setOutput("");
      return;
    }

    try {
      const parsed = yaml.load(input);
      const result = inspectComposeDocument(parsed);
      const formatted = formatFindings(result.findings);
      const verdict = formatted.counts.error > 0 ? "Structural problems found" : "Structural check completed";

      setOutput(
        `${verdict}\n\nServices detected: ${result.services.length}${
          result.services.length ? ` (${result.services.join(", ")})` : ""
        }\nErrors: ${formatted.counts.error}\nWarnings: ${formatted.counts.warning}\n\n${formatted.text}\n\nScope note: this browser check does not resolve Compose interpolation, profiles, includes, merged files, platform capabilities, image/build availability, or the complete rolling Compose schema. Run docker compose config for authoritative Compose CLI validation.`
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
      title="Docker Compose Validator"
      description="Inspect Compose YAML syntax, service structure, common field types, and references before running Docker Compose."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Docker Compose YAML
        </label>
        <textarea
          value={input}
          onChange={(event: { target: { value: string } }) => setInput(event.target.value)}
          placeholder={`services:\n  web:\n    image: nginx:alpine\n    ports:\n      - "8080:80"`}
          className="w-full min-h-[300px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={validateCompose} className="yoryantra-btn">
          Check Compose File
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
          <h3 className="text-lg font-semibold text-gray-900">Inspection Result</h3>
          {output && (
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>
        <pre className="yoryantra-output min-h-[220px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {output || "Compose syntax and structural findings will appear here."}
        </pre>
      </div>

      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">Local structural check</h3>
        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          The YAML is parsed in your browser and is not sent to an external validation service. This tool checks useful structural mistakes; it does not emulate the complete Docker Compose CLI.
        </p>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">What this Compose check can catch</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A Compose file is more than valid YAML. The current Compose Specification expects a top-level <code>services</code> mapping, with service definitions and optional top-level networks, volumes, configs, and secrets. This inspector checks those shapes, several common service-field types, and references that often become copy-and-paste mistakes.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The top-level <code>version</code> field is also reported as obsolete. Modern Docker Compose uses the current Compose Specification regardless of that value, so keeping <code>version: "3.8"</code> does not select an older schema.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Why this is not the final validation step</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Compose has a rolling specification plus interpolation, profiles, includes, merged files, platform-specific behavior, build configuration, external resources, and implementation-specific checks. A browser-only structural inspector cannot reliably reproduce all of that. Before deployment, run <code>docker compose config</code> with the same files and environment that your real project uses.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Useful references</h2>
          <ul className="mt-4 space-y-3 text-gray-600 leading-relaxed">
            <li>
              <a className="text-[var(--light-gold)] hover:underline" href="https://docs.docker.com/reference/compose-file/" target="_blank" rel="noreferrer">
                Docker Compose file reference
              </a>{" "}— the current Compose Specification implemented by Docker Compose.
            </li>
            <li>
              <a className="text-[var(--light-gold)] hover:underline" href="https://docs.docker.com/reference/compose-file/version-and-name/" target="_blank" rel="noreferrer">
                Docker version and name reference
              </a>{" "}— explains why the top-level version property is obsolete.
            </li>
          </ul>
        </div>

        <YoryantraRelatedTools currentHref="/tools/docker-compose-validator" />
      </section>
    </ToolShell>
  );
}
