"use client";

import { useMemo, useState } from "react";
import yaml from "js-yaml";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type Level = "error" | "warning" | "review" | "info";

type Finding = {
  level: Level;
  path: string;
  message: string;
};

type PlainObject = Record<string, unknown>;

type ComposeInspection = {
  services: string[];
  findings: Finding[];
  interpolationTokens: string[];
};

const TOP_LEVEL_RESOURCE_KEYS = [
  "networks",
  "volumes",
  "configs",
  "secrets",
] as const;

function isObject(value: unknown): value is PlainObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function typeName(value: unknown) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
}

function hasOwn(object: PlainObject, key: string) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function addFinding(
  findings: Finding[],
  level: Level,
  path: string,
  message: string
) {
  findings.push({ level, path, message });
}

function addTypeFinding(
  findings: Finding[],
  value: unknown,
  expected: "object" | "array" | "string",
  path: string
) {
  const valid =
    expected === "object"
      ? isObject(value)
      : expected === "array"
      ? Array.isArray(value)
      : typeof value === "string";

  if (!valid) {
    addFinding(
      findings,
      "error",
      path,
      `Expected ${expected}, found ${typeName(value)}.`
    );
  }
}

function getNamesFromListOrMap(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string => typeof item === "string"
    );
  }

  if (isObject(value)) {
    return Object.keys(value);
  }

  return [];
}

function declaredNames(root: PlainObject, key: string) {
  return isObject(root[key]) ? Object.keys(root[key] as PlainObject) : [];
}

function looksLikePathSource(source: string) {
  if (!source) return false;
  if (source === "." || source === "..") return true;
  if (source.indexOf("./") === 0 || source.indexOf("../") === 0) return true;
  if (source.charAt(0) === "/" || source.charAt(0) === "~") return true;
  if (/^[A-Za-z]:[\\/]/.test(source)) return true;
  if (source.indexOf("\\\\") === 0) return true;
  return false;
}

function extractInterpolationTokens(input: string) {
  const unique: string[] = [];
  let index = 0;

  while (index < input.length) {
    if (input.charAt(index) !== "$") {
      index += 1;
      continue;
    }

    if (input.charAt(index + 1) === "$") {
      index += 2;
      continue;
    }

    const start = index;
    const next = input.charAt(index + 1);

    if (next === "{") {
      const close = input.indexOf("}", index + 2);

      if (close !== -1 && close > index + 2) {
        const token = input.slice(start, close + 1);
        if (unique.indexOf(token) === -1) unique.push(token);
        index = close + 1;
        continue;
      }
    } else if (/[A-Za-z_]/.test(next)) {
      index += 2;
      while (
        index < input.length &&
        /[A-Za-z0-9_]/.test(input.charAt(index))
      ) {
        index += 1;
      }

      const token = input.slice(start, index);
      if (unique.indexOf(token) === -1) unique.push(token);
      continue;
    }

    index += 1;
  }

  return unique;
}

function containsInterpolation(value: string) {
  return extractInterpolationTokens(value).length > 0;
}

function inspectNamedVolumeReferences(
  serviceName: string,
  service: PlainObject,
  root: PlainObject,
  findings: Finding[]
) {
  if (!Array.isArray(service.volumes)) return;

  const declared = declaredNames(root, "volumes");

  service.volumes.forEach((item, index) => {
    let source = "";

    if (typeof item === "string") {
      const text = item.trim();

      if (!text) {
        addFinding(
          findings,
          "error",
          `services.${serviceName}.volumes[${index}]`,
          "Volume entry is empty."
        );
        return;
      }

      if (text.charAt(0) === "/") return;

      const windowsDrive = /^[A-Za-z]:[\\/]/.test(text);
      if (windowsDrive) return;

      const colon = text.indexOf(":");
      if (colon === -1) {
        return;
      }

      source = text.slice(0, colon);
    } else if (isObject(item)) {
      if (
        item.type === "volume" &&
        typeof item.source === "string"
      ) {
        source = item.source;
      } else {
        return;
      }
    } else {
      addFinding(
        findings,
        "error",
        `services.${serviceName}.volumes[${index}]`,
        `Expected a string or mapping, found ${typeName(item)}.`
      );
      return;
    }

    if (
      !source ||
      looksLikePathSource(source) ||
      containsInterpolation(source)
    ) {
      return;
    }

    if (declared.indexOf(source) === -1) {
      addFinding(
        findings,
        "warning",
        `services.${serviceName}.volumes[${index}]`,
        `Named volume "${source}" has no matching top-level volumes entry in this file. It may be supplied by another merged or included Compose file.`
      );
    }
  });
}

function inspectConfigOrSecretReferences(
  serviceName: string,
  service: PlainObject,
  root: PlainObject,
  field: "configs" | "secrets",
  findings: Finding[]
) {
  const value = service[field];
  if (typeof value === "undefined") return;

  if (!Array.isArray(value)) {
    addFinding(
      findings,
      "error",
      `services.${serviceName}.${field}`,
      `Expected array, found ${typeName(value)}.`
    );
    return;
  }

  const declared = declaredNames(root, field);

  value.forEach((item, index) => {
    const source =
      typeof item === "string"
        ? item
        : isObject(item) && typeof item.source === "string"
        ? item.source
        : "";

    if (!source) {
      if (!isObject(item)) {
        addFinding(
          findings,
          "error",
          `services.${serviceName}.${field}[${index}]`,
          `Expected a ${field.slice(0, -1)} name or mapping with source.`
        );
      }
      return;
    }

    if (
      declared.indexOf(source) === -1 &&
      !containsInterpolation(source)
    ) {
      addFinding(
        findings,
        "warning",
        `services.${serviceName}.${field}[${index}]`,
        `References ${field.slice(0, -1)} "${source}" without a matching top-level ${field} entry in this file.`
      );
    }
  });
}

function inspectServiceReferences(
  serviceName: string,
  service: PlainObject,
  root: PlainObject,
  findings: Finding[]
) {
  const serviceNames = isObject(root.services)
    ? Object.keys(root.services as PlainObject)
    : [];
  const networkNames = declaredNames(root, "networks");

  getNamesFromListOrMap(service.depends_on).forEach((name) => {
    if (
      serviceNames.indexOf(name) === -1 &&
      !containsInterpolation(name)
    ) {
      addFinding(
        findings,
        "warning",
        `services.${serviceName}.depends_on`,
        `References service "${name}", which is not declared in this file. It may come from an included or merged Compose model.`
      );
    }
  });

  getNamesFromListOrMap(service.networks).forEach((name) => {
    if (
      name !== "default" &&
      networkNames.indexOf(name) === -1 &&
      !containsInterpolation(name)
    ) {
      addFinding(
        findings,
        "warning",
        `services.${serviceName}.networks`,
        `References network "${name}" without a matching top-level networks entry in this file.`
      );
    }
  });

  ["network_mode", "ipc", "pid"].forEach((field) => {
    const value = service[field];

    if (
      typeof value === "string" &&
      value.indexOf("service:") === 0
    ) {
      const target = value.slice("service:".length);

      if (
        serviceNames.indexOf(target) === -1 &&
        !containsInterpolation(target)
      ) {
        addFinding(
          findings,
          "warning",
          `services.${serviceName}.${field}`,
          `References service "${target}" through ${field}, but that service is not declared in this file.`
        );
      }
    }
  });

  if (isObject(service.extends)) {
    const localService = service.extends.service;
    const externalFile = service.extends.file;

    if (
      typeof localService === "string" &&
      typeof externalFile === "undefined" &&
      serviceNames.indexOf(localService) === -1
    ) {
      addFinding(
        findings,
        "warning",
        `services.${serviceName}.extends.service`,
        `Extends local service "${localService}", which is not declared in this file.`
      );
    }
  }

  inspectNamedVolumeReferences(
    serviceName,
    service,
    root,
    findings
  );
  inspectConfigOrSecretReferences(
    serviceName,
    service,
    root,
    "configs",
    findings
  );
  inspectConfigOrSecretReferences(
    serviceName,
    service,
    root,
    "secrets",
    findings
  );
}

function inspectSecuritySensitiveSettings(
  serviceName: string,
  service: PlainObject,
  findings: Finding[]
) {
  const base = `services.${serviceName}`;

  if (service.privileged === true) {
    addFinding(
      findings,
      "review",
      `${base}.privileged`,
      "privileged: true gives the container broad host-facing capabilities. Review whether the workload genuinely requires it."
    );
  }

  if (service.network_mode === "host") {
    addFinding(
      findings,
      "review",
      `${base}.network_mode`,
      "Host networking reduces network isolation and changes port behavior. Review this setting carefully."
    );
  }

  if (service.pid === "host" || service.ipc === "host") {
    addFinding(
      findings,
      "review",
      base,
      "The service joins a host namespace. That can be legitimate for infrastructure tooling but reduces isolation."
    );
  }

  if (Array.isArray(service.cap_add)) {
    const capabilities = service.cap_add.filter(
      (value): value is string => typeof value === "string"
    );

    if (
      capabilities.some(
        (capability) => capability.toUpperCase() === "ALL"
      )
    ) {
      addFinding(
        findings,
        "review",
        `${base}.cap_add`,
        "cap_add includes ALL. Grant only the Linux capabilities the container actually needs."
      );
    }
  }

  if (Array.isArray(service.volumes)) {
    service.volumes.forEach((item, index) => {
      const source =
        typeof item === "string"
          ? item.split(":")[0]
          : isObject(item) && typeof item.source === "string"
          ? item.source
          : "";

      if (
        source === "/var/run/docker.sock" ||
        source === "/run/docker.sock"
      ) {
        addFinding(
          findings,
          "review",
          `${base}.volumes[${index}]`,
          "A Docker socket path is mounted into the service. Access to the Docker daemon can effectively provide host-level control."
        );
      }
    });
  }
}

function inspectService(
  serviceName: string,
  serviceValue: unknown,
  root: PlainObject,
  findings: Finding[]
) {
  const base = `services.${serviceName}`;

  if (!isObject(serviceValue)) {
    addFinding(
      findings,
      "error",
      base,
      `Service definition must be a mapping/object, found ${typeName(
        serviceValue
      )}.`
    );
    return;
  }

  const service = serviceValue;

  const stringFields = [
    "image",
    "container_name",
    "hostname",
    "restart",
    "network_mode",
  ];
  const arrayFields = [
    "ports",
    "volumes",
    "configs",
    "secrets",
    "profiles",
    "cap_add",
    "cap_drop",
    "expose",
  ];
  const objectFields = ["deploy", "healthcheck", "logging"];

  stringFields.forEach((field) => {
    if (hasOwn(service, field) && typeof service[field] !== "string") {
      addFinding(
        findings,
        "error",
        `${base}.${field}`,
        `Expected string, found ${typeName(service[field])}.`
      );
    }
  });

  arrayFields.forEach((field) => {
    if (hasOwn(service, field) && !Array.isArray(service[field])) {
      addFinding(
        findings,
        "error",
        `${base}.${field}`,
        `Expected array, found ${typeName(service[field])}.`
      );
    }
  });

  objectFields.forEach((field) => {
    if (hasOwn(service, field) && !isObject(service[field])) {
      addFinding(
        findings,
        "error",
        `${base}.${field}`,
        `Expected object, found ${typeName(service[field])}.`
      );
    }
  });

  if (hasOwn(service, "build")) {
    const build = service.build;

    if (!(typeof build === "string" || isObject(build))) {
      addFinding(
        findings,
        "error",
        `${base}.build`,
        `Expected a string path or object, found ${typeName(build)}.`
      );
    }
  }

  ["environment", "labels", "depends_on", "networks"].forEach(
    (field) => {
      if (!hasOwn(service, field)) return;

      const value = service[field];

      if (!(Array.isArray(value) || isObject(value))) {
        addFinding(
          findings,
          "error",
          `${base}.${field}`,
          `Expected an array or object, found ${typeName(value)}.`
        );
      }
    }
  );

  if (hasOwn(service, "env_file")) {
    const envFile = service.env_file;

    if (
      !(
        typeof envFile === "string" ||
        Array.isArray(envFile)
      )
    ) {
      addFinding(
        findings,
        "error",
        `${base}.env_file`,
        `Expected a string or array, found ${typeName(envFile)}.`
      );
    }
  }

  ["command", "entrypoint"].forEach((field) => {
    if (!hasOwn(service, field)) return;

    const value = service[field];

    if (!(typeof value === "string" || Array.isArray(value) || value === null)) {
      addFinding(
        findings,
        "error",
        `${base}.${field}`,
        `Expected string, array, or null, found ${typeName(value)}.`
      );
    }
  });

  if (Array.isArray(service.profiles)) {
    service.profiles.forEach((profile, index) => {
      if (typeof profile !== "string" || !profile.trim()) {
        addFinding(
          findings,
          "error",
          `${base}.profiles[${index}]`,
          "Profile names must be non-empty strings."
        );
      } else if (!/^[A-Za-z0-9][A-Za-z0-9_.-]+$/.test(profile)) {
        addFinding(
          findings,
          "error",
          `${base}.profiles[${index}]`,
          `Profile name "${profile}" does not match the Compose profile-name pattern [a-zA-Z0-9][a-zA-Z0-9_.-]+.`
        );
      }
    });
  }

  inspectServiceReferences(
    serviceName,
    service,
    root,
    findings
  );
  inspectSecuritySensitiveSettings(
    serviceName,
    service,
    findings
  );
}

function inspectComposeDocument(
  parsed: unknown,
  rawInput: string
): ComposeInspection {
  const findings: Finding[] = [];
  const interpolationTokens = extractInterpolationTokens(rawInput);

  if (!isObject(parsed)) {
    addFinding(
      findings,
      "error",
      "$",
      "A Compose file must have a mapping/object at the YAML document root."
    );

    return {
      services: [],
      findings,
      interpolationTokens,
    };
  }

  if (hasOwn(parsed, "version")) {
    addFinding(
      findings,
      "warning",
      "version",
      "The top-level version field is obsolete in the current Compose Specification. Modern Docker Compose uses the current schema regardless of this value."
    );
  }

  if (!hasOwn(parsed, "services")) {
    addFinding(
      findings,
      "error",
      "services",
      "Missing the top-level services mapping."
    );

    return {
      services: [],
      findings,
      interpolationTokens,
    };
  }

  if (!isObject(parsed.services)) {
    addFinding(
      findings,
      "error",
      "services",
      `Expected object, found ${typeName(parsed.services)}.`
    );

    return {
      services: [],
      findings,
      interpolationTokens,
    };
  }

  TOP_LEVEL_RESOURCE_KEYS.forEach((key) => {
    if (hasOwn(parsed, key)) {
      addTypeFinding(
        findings,
        parsed[key],
        "object",
        key
      );
    }
  });

  if (
    hasOwn(parsed, "name") &&
    typeof parsed.name !== "string"
  ) {
    addFinding(
      findings,
      "error",
      "name",
      `Top-level name must be a string, found ${typeName(parsed.name)}.`
    );
  }

  if (hasOwn(parsed, "include")) {
    if (!Array.isArray(parsed.include)) {
      addFinding(
        findings,
        "error",
        "include",
        `Expected include to be an array, found ${typeName(parsed.include)}.`
      );
    } else {
      parsed.include.forEach((item, index) => {
        const path = `include[${index}]`;

        if (typeof item === "string") {
          if (!item.trim()) {
            addFinding(findings, "error", path, "Included Compose path is empty.");
          }
          return;
        }

        if (!isObject(item)) {
          addFinding(
            findings,
            "error",
            path,
            `Expected an included path string or mapping, found ${typeName(item)}.`
          );
          return;
        }

        const includePath = item.path;
        const validPath =
          typeof includePath === "string"
            ? Boolean(includePath.trim())
            : Array.isArray(includePath) &&
              includePath.length > 0 &&
              includePath.every(
                (value) => typeof value === "string" && value.trim()
              );

        if (!validPath) {
          addFinding(
            findings,
            "error",
            `${path}.path`,
            "Long include syntax requires path as a non-empty string or non-empty array of path strings."
          );
        }
      });
    }
  }

  const servicesMap = parsed.services;
  const services = Object.keys(servicesMap);

  if (!services.length) {
    addFinding(
      findings,
      "warning",
      "services",
      "The services mapping is empty, so this file defines no runnable services."
    );
  }

  services.forEach((serviceName) => {
    if (!serviceName.trim()) {
      addFinding(
        findings,
        "error",
        "services",
        "A service name is empty."
      );
      return;
    }

    inspectService(
      serviceName,
      servicesMap[serviceName],
      parsed,
      findings
    );
  });

  if (hasOwn(parsed, "include")) {
    addFinding(
      findings,
      "info",
      "include",
      "The file uses include. References that appear missing locally may be provided by included Compose applications."
    );
  }

  if (interpolationTokens.length) {
    addFinding(
      findings,
      "info",
      "$",
      `Detected ${interpolationTokens.length} distinct Compose-style interpolation token${
        interpolationTokens.length === 1 ? "" : "s"
      }. Environment values, defaults, required-variable expressions, and interpolation precedence are intentionally left unresolved.`
    );
  }

  if (!findings.length) {
    addFinding(
      findings,
      "info",
      "$",
      "No problems were found by the structural and reference checks implemented for the pasted file."
    );
  }

  return {
    services,
    findings,
    interpolationTokens,
  };
}

function formatInspection(result: ComposeInspection) {
  const counts = {
    error: 0,
    warning: 0,
    review: 0,
    info: 0,
  };

  result.findings.forEach((finding) => {
    counts[finding.level] += 1;
  });

  const verdict =
    counts.error > 0
      ? "Structural problems found"
      : counts.warning > 0 || counts.review > 0
      ? "Structural check completed — review findings"
      : "Structural check completed";

  const lines = result.findings
    .map(
      (finding) =>
        `${finding.level.toUpperCase()}  ${finding.path}\n${finding.message}`
    )
    .join("\n\n");

  return [
    verdict,
    "",
    `Services detected: ${result.services.length}${
      result.services.length
        ? ` (${result.services.join(", ")})`
        : ""
    }`,
    `Errors: ${counts.error}`,
    `Warnings: ${counts.warning}`,
    `Security / isolation review notes: ${counts.review}`,
    `Info: ${counts.info}`,
    `Interpolation tokens: ${result.interpolationTokens.length}`,
    "",
    lines || "No findings.",
    "",
    "Final validation step:",
    "Run `docker compose config -q` with the real Compose files, environment variables, --env-file inputs, profiles, includes, and overrides used by the project.",
  ].join("\n");
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const lineCount = useMemo(
    () =>
      input
        ? input.replace(/\r\n?/g, "\n").split("\n").length
        : 0,
    [input]
  );

  const validateCompose = () => {
    if (!input.trim()) {
      setError("Enter Docker Compose YAML to inspect.");
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const parsed = yaml.load(input);
      const result = inspectComposeDocument(parsed, input);

      setOutput(formatInspection(result));
      setError("");
      setCopied(false);
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "Invalid YAML.";

      setError(`YAML parse error: ${message}`);
      setOutput("");
      setCopied(false);
    }
  };

  const loadExample = () => {
    setInput(`services:
  web:
    image: "nginx:\${NGINX_TAG:-alpine}"
    ports:
      - "8080:80"
    depends_on:
      - api
  api:
    build: ./api
    environment:
      APP_ENV: production
    volumes:
      - app-data:/var/lib/app

volumes:
  app-data:
`);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setCopied(false);
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setError(
        "The inspection result could not be copied. Select and copy it manually."
      );
    }
  };

  return (
    <ToolShell
      title="Docker Compose Validator"
      description="Inspect Compose YAML structure, local cross-references, interpolation clues, named resources, and host-facing settings before checking the resolved project with Docker Compose."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <label className="block text-sm font-semibold text-gray-900">
              Docker Compose YAML
            </label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Paste one Compose file. The text is read as written; sibling
              overrides, includes, env files, and shell variables are not loaded.
            </p>
          </div>

          <p className="text-xs text-gray-500">
            {lineCount.toLocaleString()} line
            {lineCount === 1 ? "" : "s"}
          </p>
        </div>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setOutput("");
            setError("");
            setCopied(false);
          }}
          placeholder={`services:\n  web:\n    image: nginx:alpine\n    ports:\n      - "8080:80"`}
          spellCheck={false}
          className="mt-4 w-full min-h-[360px] rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={validateCompose}
          className="yoryantra-btn"
        >
          Check Compose File
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="yoryantra-btn-outline"
        >
          Load Example
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700 whitespace-pre-wrap overflow-auto">
          {error}
        </div>
      ) : null}

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Compose Inspection
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Errors are structural. Warnings need context. Review notes flag
              settings that can materially reduce container isolation.
            </p>
          </div>

          {output ? (
            <button
              type="button"
              onClick={copyOutput}
              className="yoryantra-btn-outline text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          ) : null}
        </div>

        <pre className="mt-4 yoryantra-output min-h-[280px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output ||
            "Compose syntax, structural findings, references, interpolation notes, and review items will appear here."}
        </pre>
      </div>

      <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <h3 className="text-sm font-semibold text-gray-900">
          Local file inspection only
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">
          YAML parsing stays in your browser and no Compose-validation API receives
          the pasted file. Shell variables, .env files, includes, overrides,
          images, build context, the Docker Engine, and the host filesystem are
          not read. Site-wide analytics or advertising scripts, if enabled, are
          separate from this inspection.
        </p>
      </div>

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Valid YAML Can Still Be a Broken Compose File
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            YAML parsing answers only the first question: can the text be turned
            into data? Docker Compose then expects an application model built
            around services, networks, volumes, configs, secrets, profiles,
            interpolation, and implementation rules. A file can therefore be
            perfect YAML while still referencing a missing service, using the
            wrong data shape for a field, or resolving differently once
            environment variables and override files are applied.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            A local structural pass can catch relationships that plain YAML parsing
            cannot see, but the final application model still belongs to Docker
            Compose. The current Compose Specification is documented in the{" "}
            <a href="https://docs.docker.com/reference/compose-file/" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">
              Compose file reference
            </a>.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Follow One Service Through the Model
          </h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-white p-4 text-sm leading-7 text-gray-800">{`services:
  web:
    image: nginx:alpine
    depends_on:
      - api
    networks:
      - frontend
    volumes:
      - app-data:/usr/share/nginx/html

volumes:
  app-data:

networks:
  frontend:`}</pre>
          <p className="mt-4 leading-relaxed text-gray-600">
            The web service is not isolated from the rest of the file. Its
            depends_on value should name another service, frontend should exist
            as a network in the resolved Compose model, and app-data should be
            a declared named volume unless another Compose file supplies it.
            Those cross-references are exactly the kind of mistake plain YAML
            parsing cannot see.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why Missing References Are Warnings Instead of Automatic Failures
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Modern Compose projects can be assembled from multiple files,
            includes, extends relationships, profiles, and command-line
            overrides. A network or service that looks missing in one pasted
            file can legitimately appear in the final resolved model.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Unresolved local references are therefore warnings rather than automatic
            failures. If the project really is contained in one file, they are
            strong signals. In a modular project, inspect the resolved model
            before deciding that a reference is broken. Docker documents how
            <a href="https://docs.docker.com/reference/compose-file/include/" target="_blank" rel="noreferrer" className="ml-1 font-medium text-[var(--green)] underline underline-offset-4">
              include copies resources into the application model
            </a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            The version Field No Longer Selects a Compose Schema
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Older Compose examples commonly begin with{" "}
            <code>version: "3.8"</code> or a similar value. In the current
            Compose Specification that top-level field is obsolete and kept
            only for backward compatibility. Docker Compose validates against
            its current implemented schema rather than switching behavior
            according to the version text.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Keeping version is not normally a fatal problem, so it is reported as a
            warning instead of an error. Docker describes the field as obsolete
            and informational in its{" "}
            <a href="https://docs.docker.com/reference/compose-file/version-and-name/" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">
              version and name documentation
            </a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Interpolation Can Change the File You Think You Are Validating
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Compose supports expressions such as <code>${"{TAG}"}</code>,{" "}
            <code>${"{PORT:-8080}"}</code>, and required-variable forms. The
            final value can depend on shell variables, an env file, project
            location, CLI flags, and interpolation precedence. Compose applies
            interpolation before some merge behavior, so validating only the
            literal YAML cannot tell you the final image tag, path, port, or
            other substituted value.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Interpolation tokens are counted without treating <code>$$</code> as a
            variable reference, because Compose uses a double dollar sign for a
            literal dollar. Values are deliberately left unresolved rather than
            asking for shell or env-file secrets. Docker's{" "}
            <a href="https://docs.docker.com/reference/compose-file/interpolation/" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">
              interpolation rules
            </a>{" "}
            cover defaults, required forms, nesting, and escaping.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Some Compose Settings Deserve a Security Review, Not Just Schema Validation
          </h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            A Compose file can be syntactically valid and still grant a
            container unusually broad access to the host. Those settings are called
            attention to a small set of high-impact examples such as{" "}
            <code>privileged: true</code>, host networking or namespaces,{" "}
            <code>cap_add: [ALL]</code>, and Docker socket mounts.
          </p>
          <p className="mt-4 leading-relaxed text-gray-700">
            These settings are not automatically malicious—monitoring agents,
            development tools, and infrastructure workloads sometimes need
            them. The point is to make them visible before running an
            unfamiliar Compose project.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Short Volume Syntax Has More Than One Meaning
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            In <code>./data:/app/data</code>, the source is a host path. In{" "}
            <code>app-data:/app/data</code>, the source is a named volume. In{" "}
            <code>/app/data</code>, the entry can describe an anonymous volume.
            Only the named-volume case is resolved against the top-level
            volumes mapping; bind paths do not need a top-level declaration.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Variable interpolation and platform-specific path syntax make this
            distinction tricky, which is another reason the Docker CLI remains
            the final authority.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Close the Gap With the Resolved Compose Model
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Before deployment, run the same files and environment through{" "}
            <code>docker compose config</code>. Docker documents that command as
            parsing, resolving, merging, and rendering the actual application
            model. If only validation is needed, <code>docker compose config -q</code>
            performs the configuration check quietly. The{" "}
            <a
              href="https://docs.docker.com/reference/cli/docker/compose/config/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              docker compose config reference
            </a>{" "}
            covers the same resolution boundary.
          </p>

          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/docker-compose-validator" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
