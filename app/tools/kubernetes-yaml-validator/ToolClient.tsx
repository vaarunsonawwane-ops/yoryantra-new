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

type ResourceResult = {
  label: string;
  kind: string;
  name: string;
  findings: Finding[];
};

function isObject(value: unknown): value is PlainObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOwn(object: PlainObject, key: string) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function hasNonEmptyString(object: PlainObject, key: string) {
  return (
    typeof object[key] === "string" &&
    String(object[key]).trim().length > 0
  );
}

function addFinding(
  findings: Finding[],
  level: Level,
  path: string,
  message: string
) {
  findings.push({ level, path, message });
}

function getMetadata(resource: PlainObject) {
  return isObject(resource.metadata)
    ? (resource.metadata as PlainObject)
    : null;
}

function inspectStringMap(
  value: unknown,
  path: string,
  findings: Finding[]
) {
  if (typeof value === "undefined") return;

  if (!isObject(value)) {
    addFinding(
      findings,
      "error",
      path,
      "Expected a mapping/object."
    );
    return;
  }

  Object.keys(value).forEach((key) => {
    if (typeof value[key] !== "string") {
      addFinding(
        findings,
        "error",
        `${path}.${key}`,
        `Expected a string value, found ${Array.isArray(value[key]) ? "array" : value[key] === null ? "null" : typeof value[key]}. Quote YAML booleans or numbers when the Kubernetes field expects text.`
      );
    }
  });
}

function isDnsSubdomain(value: string) {
  if (!value || value.length > 253) return false;
  const labels = value.split(".");
  return labels.every(
    (label) =>
      label.length > 0 &&
      label.length <= 63 &&
      /^[a-z0-9](?:[-a-z0-9]*[a-z0-9])?$/.test(label)
  );
}

function isLabelName(value: string, allowEmpty: boolean) {
  if (!value) return allowEmpty;
  return (
    value.length <= 63 &&
    /^[A-Za-z0-9](?:[-_.A-Za-z0-9]*[A-Za-z0-9])?$/.test(value)
  );
}

function isLabelKey(value: string) {
  const slash = value.indexOf("/");

  if (slash === -1) return isLabelName(value, false);
  if (value.indexOf("/", slash + 1) !== -1) return false;

  const prefix = value.slice(0, slash);
  const name = value.slice(slash + 1);

  return isDnsSubdomain(prefix) && isLabelName(name, false);
}

function inspectLabels(
  value: unknown,
  path: string,
  findings: Finding[]
) {
  if (typeof value === "undefined") return;

  if (!isObject(value)) {
    addFinding(findings, "error", path, "Expected a mapping/object.");
    return;
  }

  Object.keys(value).forEach((key) => {
    if (!isLabelKey(key)) {
      addFinding(
        findings,
        "error",
        `${path}.${key}`,
        `Label key "${key}" does not match Kubernetes label-key syntax.`
      );
    }

    const labelValue = value[key];
    if (typeof labelValue !== "string") {
      addFinding(
        findings,
        "error",
        `${path}.${key}`,
        `Expected a string label value, found ${Array.isArray(labelValue) ? "array" : labelValue === null ? "null" : typeof labelValue}.`
      );
    } else if (!isLabelName(labelValue, true)) {
      addFinding(
        findings,
        "error",
        `${path}.${key}`,
        `Label value "${labelValue}" must be 63 characters or less and, when non-empty, begin and end with an alphanumeric character.`
      );
    }
  });
}

function inspectAnnotations(
  value: unknown,
  path: string,
  findings: Finding[]
) {
  if (typeof value === "undefined") return;

  if (!isObject(value)) {
    addFinding(findings, "error", path, "Expected a mapping/object.");
    return;
  }

  Object.keys(value).forEach((key) => {
    if (!isLabelKey(key)) {
      addFinding(
        findings,
        "error",
        `${path}.${key}`,
        `Annotation key "${key}" does not match Kubernetes annotation-key syntax.`
      );
    }

    if (typeof value[key] !== "string") {
      addFinding(
        findings,
        "error",
        `${path}.${key}`,
        `Expected a string annotation value, found ${Array.isArray(value[key]) ? "array" : value[key] === null ? "null" : typeof value[key]}.`
      );
    }
  });
}

function inspectMetadata(
  resource: PlainObject,
  basePath: string,
  kind: string,
  findings: Finding[]
) {
  const metadata = getMetadata(resource);

  if (!metadata) {
    if (kind !== "List") {
      addFinding(
        findings,
        "error",
        `${basePath}.metadata`,
        "Missing or invalid metadata mapping."
      );
    }
    return;
  }

  if (
    kind !== "List" &&
    !hasNonEmptyString(metadata, "name") &&
    !hasNonEmptyString(metadata, "generateName")
  ) {
    addFinding(
      findings,
      "warning",
      `${basePath}.metadata`,
      "Neither metadata.name nor metadata.generateName is present."
    );
  }

  inspectLabels(
    metadata.labels,
    `${basePath}.metadata.labels`,
    findings
  );
  inspectAnnotations(
    metadata.annotations,
    `${basePath}.metadata.annotations`,
    findings
  );

  if (
    hasOwn(metadata, "namespace") &&
    typeof metadata.namespace !== "string"
  ) {
    addFinding(
      findings,
      "error",
      `${basePath}.metadata.namespace`,
      "metadata.namespace must be a string."
    );
  }
}

function labelsFromTemplate(template: PlainObject | null) {
  if (!template || !isObject(template.metadata)) return null;

  const labels = template.metadata.labels;

  return isObject(labels) ? (labels as PlainObject) : null;
}

function selectorMatches(
  selector: PlainObject,
  labels: PlainObject | null,
  path: string,
  findings: Finding[]
) {
  if (!labels) {
    addFinding(
      findings,
      "error",
      `${path}.template.metadata.labels`,
      "The Pod template has no labels to satisfy the controller selector."
    );
    return;
  }

  if (
    hasOwn(selector, "matchLabels") &&
    !isObject(selector.matchLabels)
  ) {
    addFinding(
      findings,
      "error",
      `${path}.selector.matchLabels`,
      "matchLabels must be a mapping/object."
    );
  }

  if (isObject(selector.matchLabels)) {
    Object.keys(selector.matchLabels).forEach((key) => {
      const expected = selector.matchLabels as PlainObject;
      const value = expected[key];

      if (!isLabelKey(key)) {
        addFinding(
          findings,
          "error",
          `${path}.selector.matchLabels.${key}`,
          `Selector label key "${key}" is not valid Kubernetes label syntax.`
        );
      }

      if (typeof value !== "string") {
        addFinding(
          findings,
          "error",
          `${path}.selector.matchLabels.${key}`,
          "Selector matchLabels values must be strings."
        );
        return;
      }

      if (!isLabelName(value, true)) {
        addFinding(
          findings,
          "error",
          `${path}.selector.matchLabels.${key}`,
          `Selector label value "${value}" is not valid Kubernetes label syntax.`
        );
      }

      if (labels[key] !== value) {
        addFinding(
          findings,
          "error",
          `${path}.selector.matchLabels.${key}`,
          `Selector requires ${key}=${value}, but the Pod template label is ${
            typeof labels[key] === "undefined"
              ? "missing"
              : JSON.stringify(labels[key])
          }.`
        );
      }
    });
  }

  if (
    hasOwn(selector, "matchExpressions") &&
    !Array.isArray(selector.matchExpressions)
  ) {
    addFinding(
      findings,
      "error",
      `${path}.selector.matchExpressions`,
      "matchExpressions must be an array."
    );
  }

  if (Array.isArray(selector.matchExpressions)) {
    selector.matchExpressions.forEach((expression, index) => {
      if (!isObject(expression)) {
        addFinding(
          findings,
          "error",
          `${path}.selector.matchExpressions[${index}]`,
          "Selector expression must be an object."
        );
        return;
      }

      const key =
        typeof expression.key === "string" ? expression.key : "";
      const operator =
        typeof expression.operator === "string"
          ? expression.operator
          : "";
      const rawValues = Array.isArray(expression.values)
        ? expression.values
        : [];
      const values = rawValues.filter(
        (item): item is string => typeof item === "string"
      );

      if (
        rawValues.length !== values.length
      ) {
        addFinding(
          findings,
          "error",
          `${path}.selector.matchExpressions[${index}].values`,
          "Selector expression values must be strings."
        );
      }

      if (!key || !operator) {
        addFinding(
          findings,
          "error",
          `${path}.selector.matchExpressions[${index}]`,
          "Selector expression needs string key and operator values."
        );
        return;
      }

      if (!isLabelKey(key)) {
        addFinding(
          findings,
          "error",
          `${path}.selector.matchExpressions[${index}].key`,
          `Selector label key "${key}" is not valid Kubernetes label syntax.`
        );
      }

      values.forEach((value, valueIndex) => {
        if (!isLabelName(value, true)) {
          addFinding(
            findings,
            "error",
            `${path}.selector.matchExpressions[${index}].values[${valueIndex}]`,
            `Selector label value "${value}" is not valid Kubernetes label syntax.`
          );
        }
      });

      const labelValue = labels[key];
      const labelExists = typeof labelValue === "string";
      let matches = true;

      if (operator === "In") {
        if (!values.length) {
          addFinding(
            findings,
            "error",
            `${path}.selector.matchExpressions[${index}].values`,
            "The In selector operator requires a non-empty values array."
          );
          return;
        }

        matches =
          labelExists &&
          values.indexOf(String(labelValue)) !== -1;
      } else if (operator === "NotIn") {
        if (!values.length) {
          addFinding(
            findings,
            "error",
            `${path}.selector.matchExpressions[${index}].values`,
            "The NotIn selector operator requires a non-empty values array."
          );
          return;
        }

        matches =
          !labelExists ||
          values.indexOf(String(labelValue)) === -1;
      } else if (operator === "Exists") {
        if (rawValues.length) {
          addFinding(
            findings,
            "error",
            `${path}.selector.matchExpressions[${index}].values`,
            "The Exists selector operator does not use values."
          );
        }
        matches = labelExists;
      } else if (operator === "DoesNotExist") {
        if (rawValues.length) {
          addFinding(
            findings,
            "error",
            `${path}.selector.matchExpressions[${index}].values`,
            "The DoesNotExist selector operator does not use values."
          );
        }
        matches = !labelExists;
      } else {
        addFinding(
          findings,
          "warning",
          `${path}.selector.matchExpressions[${index}].operator`,
          `Operator "${operator}" is outside the selector operators evaluated here.`
        );
        return;
      }

      if (!matches) {
        addFinding(
          findings,
          "error",
          `${path}.selector.matchExpressions[${index}]`,
          `The Pod template labels do not satisfy selector expression ${key} ${operator}.`
        );
      }
    });
  }
}

function isPrintableEnvName(value: string) {
  if (!value || value.indexOf("=") !== -1) return false;

  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code < 0x20 || code > 0x7e) return false;
  }

  return true;
}

function isBase64Text(value: string) {
  if (!value || value.length % 4 !== 0) return value === "";
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(value)) return false;

  const firstPadding = value.indexOf("=");
  return firstPadding === -1 || firstPadding >= value.length - 2;
}

function inspectEnvFrom(
  envFrom: unknown,
  path: string,
  findings: Finding[]
) {
  if (typeof envFrom === "undefined") return;

  if (!Array.isArray(envFrom)) {
    addFinding(findings, "error", path, "envFrom must be an array.");
    return;
  }

  envFrom.forEach((item, index) => {
    const itemPath = `${path}[${index}]`;

    if (!isObject(item)) {
      addFinding(findings, "error", itemPath, "envFrom entry must be an object.");
      return;
    }

    if (hasOwn(item, "prefix")) {
      if (
        typeof item.prefix !== "string" ||
        (String(item.prefix) !== "" &&
          !isPrintableEnvName(String(item.prefix)))
      ) {
        addFinding(
          findings,
          "error",
          `${itemPath}.prefix`,
          "envFrom.prefix may contain printable ASCII characters except =."
        );
      }
    }

    const sources = ["configMapRef", "secretRef"].filter((key) =>
      hasOwn(item, key)
    );

    if (sources.length !== 1) {
      addFinding(
        findings,
        "error",
        itemPath,
        "envFrom entry must select exactly one configMapRef or secretRef."
      );
      return;
    }

    const source = item[sources[0]];
    if (!isObject(source) || !hasNonEmptyString(source, "name")) {
      addFinding(
        findings,
        "error",
        `${itemPath}.${sources[0]}.name`,
        `${sources[0]} requires a non-empty name.`
      );
    }
  });
}

function inspectEnv(
  env: unknown,
  path: string,
  findings: Finding[]
) {
  if (typeof env === "undefined") return;

  if (!Array.isArray(env)) {
    addFinding(findings, "error", path, "env must be an array.");
    return;
  }

  const seen = Object.create(null) as Record<string, number>;

  env.forEach((item, index) => {
    const itemPath = `${path}[${index}]`;

    if (!isObject(item)) {
      addFinding(
        findings,
        "error",
        itemPath,
        "Environment entry must be an object."
      );
      return;
    }

    if (!hasNonEmptyString(item, "name")) {
      addFinding(
        findings,
        "error",
        `${itemPath}.name`,
        "Environment variable name is missing."
      );
    } else {
      const name = String(item.name);

      if (!isPrintableEnvName(name)) {
        addFinding(
          findings,
          "error",
          `${itemPath}.name`,
          "Environment variable names may contain printable ASCII characters except =."
        );
      }

      if (seen[name]) {
        addFinding(
          findings,
          "warning",
          `${itemPath}.name`,
          `Environment variable "${name}" is repeated in this container. Review which value should win.`
        );
      }

      seen[name] = index + 1;
    }

    const hasValue = hasOwn(item, "value");
    const hasValueFrom = hasOwn(item, "valueFrom");

    if (hasValue && hasValueFrom) {
      addFinding(
        findings,
        "error",
        itemPath,
        "An env entry should not define both value and valueFrom."
      );
    }

    if (hasValue && typeof item.value !== "string") {
      addFinding(
        findings,
        "error",
        `${itemPath}.value`,
        "env.value must be a string. Quote YAML booleans and numbers such as true, false, 123, or 1.5."
      );
    }

    if (hasValueFrom && !isObject(item.valueFrom)) {
      addFinding(
        findings,
        "error",
        `${itemPath}.valueFrom`,
        "env.valueFrom must be an object."
      );
    } else if (hasValueFrom && isObject(item.valueFrom)) {
      const sourceKeys = [
        "fieldRef",
        "resourceFieldRef",
        "configMapKeyRef",
        "secretKeyRef",
      ].filter((key) => hasOwn(item.valueFrom as PlainObject, key));

      if (sourceKeys.length !== 1) {
        addFinding(
          findings,
          "error",
          `${itemPath}.valueFrom`,
          "env.valueFrom must select exactly one fieldRef, resourceFieldRef, configMapKeyRef, or secretKeyRef."
        );
      }
    }
  });
}

function inspectVolumeMounts(
  mounts: unknown,
  volumeNames: string[],
  path: string,
  findings: Finding[]
) {
  if (typeof mounts === "undefined") return;

  if (!Array.isArray(mounts)) {
    addFinding(
      findings,
      "error",
      path,
      "volumeMounts must be an array."
    );
    return;
  }

  mounts.forEach((mount, index) => {
    if (!isObject(mount)) {
      addFinding(
        findings,
        "error",
        `${path}[${index}]`,
        "volumeMount entry must be an object."
      );
      return;
    }

    const name =
      typeof mount.name === "string" ? mount.name : "";

    if (!name) {
      addFinding(
        findings,
        "error",
        `${path}[${index}].name`,
        "volumeMount name is missing."
      );
    } else if (volumeNames.indexOf(name) === -1) {
      addFinding(
        findings,
        "error",
        `${path}[${index}].name`,
        `volumeMount references "${name}", but the Pod spec has no volume with that name.`
      );
    }

    if (!hasNonEmptyString(mount, "mountPath")) {
      addFinding(
        findings,
        "error",
        `${path}[${index}].mountPath`,
        "volumeMount requires a non-empty mountPath string."
      );
    }
  });
}

function inspectPodVolumes(
  spec: PlainObject,
  path: string,
  findings: Finding[]
) {
  if (typeof spec.volumes === "undefined") return [];

  if (!Array.isArray(spec.volumes)) {
    addFinding(
      findings,
      "error",
      `${path}.volumes`,
      "volumes must be an array."
    );
    return [];
  }

  const names: string[] = [];

  spec.volumes.forEach((volume, index) => {
    const itemPath = `${path}.volumes[${index}]`;

    if (!isObject(volume)) {
      addFinding(
        findings,
        "error",
        itemPath,
        "Volume entry must be an object."
      );
      return;
    }

    const name =
      typeof volume.name === "string" ? volume.name : "";

    if (!name) {
      addFinding(
        findings,
        "error",
        `${itemPath}.name`,
        "Volume name is missing."
      );
    } else {
      if (names.indexOf(name) !== -1) {
        addFinding(
          findings,
          "error",
          `${itemPath}.name`,
          `Volume name "${name}" is duplicated in this Pod spec.`
        );
      }

      names.push(name);
    }

    if (isObject(volume.hostPath)) {
      addFinding(
        findings,
        "review",
        `${itemPath}.hostPath`,
        "hostPath mounts a path from the Kubernetes node into the Pod. Review the host access and portability implications."
      );
    }
  });

  return names;
}

function inspectContainers(
  spec: PlainObject,
  path: string,
  findings: Finding[],
  requireContainers: boolean
) {
  const containers = spec.containers;

  if (!Array.isArray(containers) || !containers.length) {
    if (requireContainers) {
      addFinding(
        findings,
        "error",
        `${path}.containers`,
        "Expected a non-empty containers array."
      );
    }
    return;
  }

  const volumeNames = inspectPodVolumes(spec, path, findings);
  const containerNames = Object.create(null) as Record<string, number>;

  containers.forEach((container, index) => {
    const itemPath = `${path}.containers[${index}]`;

    if (!isObject(container)) {
      addFinding(
        findings,
        "error",
        itemPath,
        "Container entry must be an object."
      );
      return;
    }

    if (!hasNonEmptyString(container, "name")) {
      addFinding(
        findings,
        "error",
        `${itemPath}.name`,
        "Container name is missing."
      );
    } else {
      const name = String(container.name);

      if (containerNames[name]) {
        addFinding(
          findings,
          "error",
          `${itemPath}.name`,
          `Container name "${name}" is duplicated in this Pod spec.`
        );
      }

      containerNames[name] = index + 1;
    }

    if (!hasNonEmptyString(container, "image")) {
      addFinding(
        findings,
        "error",
        `${itemPath}.image`,
        "Container image is missing."
      );
    }

    if (hasOwn(container, "imagePullPolicy")) {
      const policy = container.imagePullPolicy;

      if (
        typeof policy !== "string" ||
        ["Always", "IfNotPresent", "Never"].indexOf(policy) === -1
      ) {
        addFinding(
          findings,
          "warning",
          `${itemPath}.imagePullPolicy`,
          "imagePullPolicy is normally Always, IfNotPresent, or Never."
        );
      }
    }

    inspectEnv(container.env, `${itemPath}.env`, findings);
    inspectEnvFrom(container.envFrom, `${itemPath}.envFrom`, findings);
    inspectVolumeMounts(
      container.volumeMounts,
      volumeNames,
      `${itemPath}.volumeMounts`,
      findings
    );

    if (
      isObject(container.securityContext) &&
      container.securityContext.privileged === true
    ) {
      addFinding(
        findings,
        "review",
        `${itemPath}.securityContext.privileged`,
        "This container requests privileged mode. Review whether it genuinely requires broad node-facing privileges."
      );
    }
  });

  if (Array.isArray(spec.initContainers)) {
    const allNames = Object.create(null) as Record<string, boolean>;

    Object.keys(containerNames).forEach((name) => {
      allNames[name] = true;
    });

    spec.initContainers.forEach((container, index) => {
      const itemPath = `${path}.initContainers[${index}]`;

      if (!isObject(container)) {
        addFinding(
          findings,
          "error",
          itemPath,
          "Init container entry must be an object."
        );
        return;
      }

      const name =
        typeof container.name === "string" ? container.name : "";

      if (!name) {
        addFinding(
          findings,
          "error",
          `${itemPath}.name`,
          "Init container name is missing."
        );
      } else if (allNames[name]) {
        addFinding(
          findings,
          "error",
          `${itemPath}.name`,
          `Container name "${name}" is duplicated across containers/initContainers.`
        );
      } else {
        allNames[name] = true;
      }

      if (!hasNonEmptyString(container, "image")) {
        addFinding(
          findings,
          "error",
          `${itemPath}.image`,
          "Init container image is missing."
        );
      }

      inspectEnv(container.env, `${itemPath}.env`, findings);
      inspectEnvFrom(container.envFrom, `${itemPath}.envFrom`, findings);
      inspectVolumeMounts(
        container.volumeMounts,
        volumeNames,
        `${itemPath}.volumeMounts`,
        findings
      );

      if (
        isObject(container.securityContext) &&
        container.securityContext.privileged === true
      ) {
        addFinding(
          findings,
          "review",
          `${itemPath}.securityContext.privileged`,
          "The init container requests privileged mode. Review whether it genuinely requires broad node-facing privileges."
        );
      }
    });
  }

  if (
    spec.hostNetwork === true ||
    spec.hostPID === true ||
    spec.hostIPC === true
  ) {
    addFinding(
      findings,
      "review",
      path,
      "This Pod requests one or more host namespaces (hostNetwork, hostPID, or hostIPC). Review the isolation and scheduling implications."
    );
  }
}

function inspectPodSpec(
  spec: unknown,
  path: string,
  findings: Finding[],
  restartPolicyRule: "any" | "always" | "job"
) {
  if (!isObject(spec)) {
    addFinding(
      findings,
      "error",
      path,
      "Missing or invalid Pod spec mapping."
    );
    return;
  }

  inspectContainers(spec, path, findings, true);

  if (!hasOwn(spec, "restartPolicy")) {
    if (restartPolicyRule === "job") {
      addFinding(
        findings,
        "error",
        `${path}.restartPolicy`,
        "Job and CronJob Pod templates should explicitly use restartPolicy: OnFailure or Never."
      );
    }
    return;
  }

  const restartPolicy = spec.restartPolicy;
  const valid = ["Always", "OnFailure", "Never"];

  if (
    typeof restartPolicy !== "string" ||
    valid.indexOf(restartPolicy) === -1
  ) {
    addFinding(
      findings,
      "error",
      `${path}.restartPolicy`,
      "restartPolicy must be Always, OnFailure, or Never."
    );
  } else if (
    restartPolicyRule === "always" &&
    restartPolicy !== "Always"
  ) {
    addFinding(
      findings,
      "error",
      `${path}.restartPolicy`,
      "Controller-managed Pods for this workload require restartPolicy: Always."
    );
  } else if (
    restartPolicyRule === "job" &&
    restartPolicy === "Always"
  ) {
    addFinding(
      findings,
      "error",
      `${path}.restartPolicy`,
      "Job and CronJob Pod templates use restartPolicy OnFailure or Never, not Always."
    );
  }
}

function inspectController(
  resource: PlainObject,
  kind: string,
  basePath: string,
  findings: Finding[]
) {
  if (!isObject(resource.spec)) {
    addFinding(
      findings,
      "error",
      `${basePath}.spec`,
      `${kind} spec is missing or invalid.`
    );
    return;
  }

  const spec = resource.spec;
  const template = isObject(spec.template)
    ? (spec.template as PlainObject)
    : null;

  if (!template) {
    addFinding(
      findings,
      "error",
      `${basePath}.spec.template`,
      `${kind} requires a Pod template.`
    );
  } else {
    inspectLabels(
      isObject(template.metadata)
        ? template.metadata.labels
        : undefined,
      `${basePath}.spec.template.metadata.labels`,
      findings
    );

    inspectPodSpec(
      template.spec,
      `${basePath}.spec.template.spec`,
      findings,
      "always"
    );
  }

  if (!isObject(spec.selector)) {
    addFinding(
      findings,
      "error",
      `${basePath}.spec.selector`,
      `${kind} requires a selector mapping.`
    );
  } else {
    const selector = spec.selector;
    const matchLabelCount = isObject(selector.matchLabels)
      ? Object.keys(selector.matchLabels).length
      : 0;
    const expressionCount = Array.isArray(selector.matchExpressions)
      ? selector.matchExpressions.length
      : 0;

    if (matchLabelCount === 0 && expressionCount === 0) {
      addFinding(
        findings,
        "error",
        `${basePath}.spec.selector`,
        `${kind} selector is empty. Define labels that identify the Pods managed by this controller.`
      );
    }

    selectorMatches(
      selector,
      labelsFromTemplate(template),
      `${basePath}.spec`,
      findings
    );
  }

  if (
    hasOwn(spec, "replicas") &&
    (!Number.isInteger(spec.replicas) ||
      Number(spec.replicas) < 0)
  ) {
    addFinding(
      findings,
      "error",
      `${basePath}.spec.replicas`,
      "replicas must be a non-negative integer."
    );
  }

  if (
    kind === "StatefulSet" &&
    !hasNonEmptyString(spec, "serviceName")
  ) {
    addFinding(
      findings,
      "error",
      `${basePath}.spec.serviceName`,
      "StatefulSet requires spec.serviceName."
    );
  }
}

function inspectJob(
  resource: PlainObject,
  basePath: string,
  findings: Finding[]
) {
  if (!isObject(resource.spec)) {
    addFinding(
      findings,
      "error",
      `${basePath}.spec`,
      "Job spec is missing or invalid."
    );
    return;
  }

  const template = resource.spec.template;

  if (!isObject(template)) {
    addFinding(
      findings,
      "error",
      `${basePath}.spec.template`,
      "Job requires a Pod template."
    );
    return;
  }

  inspectPodSpec(
    template.spec,
    `${basePath}.spec.template.spec`,
    findings,
    "job"
  );
}

function inspectCronJob(
  resource: PlainObject,
  basePath: string,
  findings: Finding[]
) {
  if (!isObject(resource.spec)) {
    addFinding(
      findings,
      "error",
      `${basePath}.spec`,
      "CronJob spec is missing or invalid."
    );
    return;
  }

  const spec = resource.spec;

  if (!hasNonEmptyString(spec, "schedule")) {
    addFinding(
      findings,
      "error",
      `${basePath}.spec.schedule`,
      "CronJob schedule is missing."
    );
  }

  if (
    hasOwn(spec, "concurrencyPolicy") &&
    (typeof spec.concurrencyPolicy !== "string" ||
      ["Allow", "Forbid", "Replace"].indexOf(
        String(spec.concurrencyPolicy)
      ) === -1)
  ) {
    addFinding(
      findings,
      "warning",
      `${basePath}.spec.concurrencyPolicy`,
      "concurrencyPolicy is normally Allow, Forbid, or Replace."
    );
  }

  const jobTemplate = isObject(spec.jobTemplate)
    ? (spec.jobTemplate as PlainObject)
    : null;
  const jobSpec =
    jobTemplate && isObject(jobTemplate.spec)
      ? (jobTemplate.spec as PlainObject)
      : null;
  const podTemplate =
    jobSpec && isObject(jobSpec.template)
      ? (jobSpec.template as PlainObject)
      : null;

  if (!podTemplate) {
    addFinding(
      findings,
      "error",
      `${basePath}.spec.jobTemplate.spec.template`,
      "CronJob requires a nested Job Pod template."
    );
    return;
  }

  inspectPodSpec(
    podTemplate.spec,
    `${basePath}.spec.jobTemplate.spec.template.spec`,
    findings,
    "job"
  );
}

function inspectConfigMapOrSecret(
  resource: PlainObject,
  kind: string,
  basePath: string,
  findings: Finding[]
) {
  const keyPattern = /^[A-Za-z0-9._-]+$/;

  const inspectKeyMap = (
    value: unknown,
    path: string,
    requireBase64: boolean
  ) => {
    if (typeof value === "undefined") return [] as string[];

    if (!isObject(value)) {
      addFinding(findings, "error", path, "Expected a mapping/object.");
      return [] as string[];
    }

    const keys = Object.keys(value);

    keys.forEach((key) => {
      if (!keyPattern.test(key)) {
        addFinding(
          findings,
          "error",
          `${path}.${key}`,
          `Key "${key}" may contain only letters, numbers, ., -, and _.`
        );
      }

      if (typeof value[key] !== "string") {
        addFinding(
          findings,
          "error",
          `${path}.${key}`,
          `Expected a string value, found ${Array.isArray(value[key]) ? "array" : value[key] === null ? "null" : typeof value[key]}.`
        );
      } else if (requireBase64 && !isBase64Text(String(value[key]))) {
        addFinding(
          findings,
          "error",
          `${path}.${key}`,
          "Secret data values must use standard base64 without embedded whitespace."
        );
      }
    });

    return keys;
  };

  if (kind === "ConfigMap") {
    const dataKeys = inspectKeyMap(
      resource.data,
      `${basePath}.data`,
      false
    );
    const binaryKeys = inspectKeyMap(
      resource.binaryData,
      `${basePath}.binaryData`,
      true
    );

    binaryKeys.forEach((key) => {
      if (dataKeys.indexOf(key) !== -1) {
        addFinding(
          findings,
          "error",
          `${basePath}.binaryData.${key}`,
          `ConfigMap key "${key}" appears in both data and binaryData.`
        );
      }
    });
  }

  if (kind === "Secret") {
    const dataKeys = inspectKeyMap(
      resource.data,
      `${basePath}.data`,
      true
    );
    const stringDataKeys = inspectKeyMap(
      resource.stringData,
      `${basePath}.stringData`,
      false
    );

    stringDataKeys.forEach((key) => {
      if (dataKeys.indexOf(key) !== -1) {
        addFinding(
          findings,
          "warning",
          `${basePath}.stringData.${key}`,
          `Secret key "${key}" appears in both data and stringData; stringData overwrites data when the object is written.`
        );
      }
    });

    if (
      hasOwn(resource, "type") &&
      typeof resource.type !== "string"
    ) {
      addFinding(
        findings,
        "error",
        `${basePath}.type`,
        "Secret type must be a string."
      );
    }
  }
}

function inspectResource(
  resource: unknown,
  label: string,
  basePath: string
): ResourceResult {
  const findings: Finding[] = [];

  if (!isObject(resource)) {
    addFinding(
      findings,
      "error",
      basePath,
      "Kubernetes document must contain a mapping/object."
    );

    return {
      label,
      kind: "Unknown",
      name: "",
      findings,
    };
  }

  if (!hasNonEmptyString(resource, "apiVersion")) {
    addFinding(
      findings,
      "error",
      `${basePath}.apiVersion`,
      "Missing apiVersion."
    );
  }

  if (!hasNonEmptyString(resource, "kind")) {
    addFinding(
      findings,
      "error",
      `${basePath}.kind`,
      "Missing kind."
    );
  }

  const kind = hasNonEmptyString(resource, "kind")
    ? String(resource.kind)
    : "Unknown";
  const metadata = getMetadata(resource);
  const name =
    metadata && typeof metadata.name === "string"
      ? metadata.name
      : "";

  inspectMetadata(resource, basePath, kind, findings);

  if (kind === "List") {
    if (!Array.isArray(resource.items)) {
      addFinding(
        findings,
        "error",
        `${basePath}.items`,
        "A List object requires an items array."
      );
    }

    return { label, kind, name, findings };
  }

  if (kind === "Pod") {
    inspectPodSpec(
      resource.spec,
      `${basePath}.spec`,
      findings,
      "any"
    );

    if (resource.apiVersion !== "v1") {
      addFinding(
        findings,
        "warning",
        `${basePath}.apiVersion`,
        "Core Pod manifests normally use apiVersion: v1."
      );
    }
  }

  const controllers = [
    "Deployment",
    "StatefulSet",
    "DaemonSet",
    "ReplicaSet",
  ];

  if (controllers.indexOf(kind) !== -1) {
    inspectController(resource, kind, basePath, findings);

    if (resource.apiVersion !== "apps/v1") {
      addFinding(
        findings,
        "warning",
        `${basePath}.apiVersion`,
        `${kind} manifests in current Kubernetes normally use apps/v1.`
      );
    }
  }

  if (kind === "Job") {
    inspectJob(resource, basePath, findings);

    if (resource.apiVersion !== "batch/v1") {
      addFinding(
        findings,
        "warning",
        `${basePath}.apiVersion`,
        "Current Job manifests normally use batch/v1."
      );
    }
  }

  if (kind === "CronJob") {
    inspectCronJob(resource, basePath, findings);

    if (resource.apiVersion !== "batch/v1") {
      addFinding(
        findings,
        "warning",
        `${basePath}.apiVersion`,
        "Current CronJob manifests normally use batch/v1."
      );
    }
  }

  if (
    kind === "Ingress" &&
    resource.apiVersion !== "networking.k8s.io/v1"
  ) {
    addFinding(
      findings,
      "warning",
      `${basePath}.apiVersion`,
      "Current Ingress manifests normally use networking.k8s.io/v1."
    );
  }

  if (kind === "ConfigMap" || kind === "Secret") {
    inspectConfigMapOrSecret(
      resource,
      kind,
      basePath,
      findings
    );
  }

  if (hasOwn(resource, "status")) {
    addFinding(
      findings,
      "info",
      `${basePath}.status`,
      "A status field is present. Status is generally managed by Kubernetes; configuration files usually focus on desired-state fields."
    );
  }

  if (!findings.length) {
    addFinding(
      findings,
      "info",
      basePath,
      "No problems were found by the structural checks implemented for this resource."
    );
  }

  return { label, kind, name, findings };
}

function inspectDocuments(documents: unknown[]) {
  const results: ResourceResult[] = [];

  documents.forEach((document, documentIndex) => {
    if (document === null || typeof document === "undefined") {
      return;
    }

    const base = `document[${documentIndex + 1}]`;
    const root = inspectResource(
      document,
      `Document ${documentIndex + 1}`,
      base
    );

    results.push(root);

    if (
      isObject(document) &&
      document.kind === "List" &&
      Array.isArray(document.items)
    ) {
      document.items.forEach((item, itemIndex) => {
        const itemKind =
          isObject(item) && typeof item.kind === "string"
            ? item.kind
            : "Item";

        results.push(
          inspectResource(
            item,
            `Document ${documentIndex + 1} / List item ${
              itemIndex + 1
            } (${itemKind})`,
            `${base}.items[${itemIndex}]`
          )
        );
      });
    }
  });

  return results;
}

function formatResults(
  results: ResourceResult[],
  documentCount: number,
  templateMarkers: boolean
) {
  const counts = {
    error: 0,
    warning: 0,
    review: 0,
    info: 0,
  };

  results.forEach((result) => {
    result.findings.forEach((finding) => {
      counts[finding.level] += 1;
    });
  });

  const sections = results.map((result) => {
    const identity = `${result.kind}${
      result.name ? `/${result.name}` : ""
    }`;

    const body = result.findings
      .map(
        (finding) =>
          `${finding.level.toUpperCase()}  ${finding.path}\n${finding.message}`
      )
      .join("\n\n");

    return `${result.label} — ${identity}\n${"-".repeat(
      Math.min(result.label.length + identity.length + 3, 72)
    )}\n${body}`;
  });

  const verdict =
    counts.error > 0
      ? "Structural problems found"
      : counts.warning > 0 || counts.review > 0
      ? "Structural check completed — review findings"
      : "Structural check completed";

  return [
    verdict,
    "",
    `YAML documents: ${documentCount}`,
    `Kubernetes objects inspected: ${results.length}`,
    `Errors: ${counts.error}`,
    `Warnings: ${counts.warning}`,
    `Security / isolation review notes: ${counts.review}`,
    `Info: ${counts.info}`,
    `Template markers detected: ${templateMarkers ? "yes" : "no"}`,
    "",
    sections.join("\n\n"),
    "",
    "Cluster validation boundary",
    "---------------------------",
    "The pasted manifest does not provide the target cluster OpenAPI schema, CRDs, admission policies, feature gates, defaults, namespace policy, or Kubernetes version. Use kubectl validation and, when appropriate, a server-side dry run against the target cluster.",
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

  const validateKubernetesYaml = () => {
    if (!input.trim()) {
      setError("Enter Kubernetes YAML to inspect.");
      setOutput("");
      setCopied(false);
      return;
    }

    const templateMarkers =
      input.indexOf("{{") !== -1 ||
      input.indexOf("{%") !== -1;

    try {
      const documents: unknown[] = [];

      yaml.loadAll(input, (document: unknown) => {
        documents.push(document);
      });

      const nonEmptyDocuments = documents.filter(
        (document) =>
          document !== null &&
          typeof document !== "undefined"
      );

      if (!nonEmptyDocuments.length) {
        setError("The YAML contains no Kubernetes objects.");
        setOutput("");
        setCopied(false);
        return;
      }

      const results = inspectDocuments(documents);

      setOutput(
        formatResults(
          results,
          nonEmptyDocuments.length,
          templateMarkers
        )
      );
      setError("");
      setCopied(false);
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "Invalid YAML.";

      setError(
        `YAML parse error: ${message}${
          templateMarkers
            ? "\n\nTemplate markers such as {{ ... }} or {% ... %} were detected. Render the Helm/Jinja-style template first if you want to validate the resulting Kubernetes YAML."
            : ""
        }`
      );
      setOutput("");
      setCopied(false);
    }
  };

  const loadExample = () => {
    setInput(`apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: web
          image: nginx:alpine
          env:
            - name: DISPLAY_NAME
              value: Sneha
            - name: PORT
              value: "8080"
          ports:
            - containerPort: 8080`);
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
        "The manifest findings could not be copied. Select and copy them manually."
      );
    }
  };

  return (
    <ToolShell
      title="Kubernetes YAML Validator"
      description="Inspect one or more Kubernetes manifests for object identity, workload templates, containers, selectors, labels, environment values, common API versions, and other mistakes worth catching before cluster-aware validation."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <label className="block text-sm font-semibold text-gray-900">
              Kubernetes YAML Manifest
            </label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Multi-document YAML separated with --- and Kubernetes List
              objects are supported.
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
          placeholder={`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: web\nspec:\n  selector:\n    matchLabels:\n      app: web\n  template:\n    metadata:\n      labels:\n        app: web\n    spec:\n      containers:\n        - name: web\n          image: nginx:alpine`}
          spellCheck={false}
          className="mt-4 w-full min-h-[400px] rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={validateKubernetesYaml}
          className="yoryantra-btn"
        >
          Check Kubernetes YAML
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
              Manifest Findings
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Findings are grouped per object so one valid resource does not
              hide a broken resource later in the same YAML stream.
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

        <pre className="mt-4 yoryantra-output min-h-[300px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output ||
            "Document-by-document Kubernetes findings will appear here."}
        </pre>
      </div>

      <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <h3 className="text-sm font-semibold text-gray-900">
          No cluster is contacted
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">
          YAML parsing stays in your browser. The manifest is not sent to a
          validation service or Kubernetes cluster. Installed CRDs, admission
          policies, namespace rules, server-side defaults, feature gates, and
          the target API-server version therefore remain outside the local
          result. Site-wide analytics or advertising scripts, if enabled, are
          separate from this inspection.
        </p>
      </div>

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            “The YAML Is Valid” Is Only the Beginning
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Kubernetes manifests pass through several layers of interpretation.
            First the YAML must parse. Then the document has to describe a
            recognizable Kubernetes object. The resource schema must accept its
            fields and value types. Admission rules can modify or reject it.
            Finally, controllers and workloads still have to behave correctly
            in the cluster.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            A generic YAML parse covers only the first layer. Local Kubernetes-aware
            checks can catch relationships such as selectors, Pod templates,
            volumes, mounts, env sources, and common API versions, but the target
            API server remains authoritative for its installed schemas and policy.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Read a Deployment as a Chain of Relationships
          </h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-white p-4 text-sm leading-7 text-gray-800">{`kind: Deployment
spec:
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: web
          image: nginx:alpine`}</pre>
          <p className="mt-4 leading-relaxed text-gray-600">
            The selector and Pod-template labels are related: the Deployment
            needs to recognize the Pods it manages. The template then needs a
            Pod spec, and the Pod spec needs usable container definitions. A
            typo in any one of those places can make a manifest structurally
            wrong even though every colon and indentation level is valid YAML.
            Kubernetes defines label-key/value syntax and selector semantics in
            its{" "}
            <a href="https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">
              labels and selectors documentation
            </a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            apiVersion and kind Tell Kubernetes Which Schema to Use
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A Kubernetes object normally identifies itself with{" "}
            <code>apiVersion</code> and <code>kind</code>. A Deployment using{" "}
            <code>apps/v1</code> and a CronJob using <code>batch/v1</code> are
            interpreted through different API schemas. Custom resources add
            schemas that only exist when their CRDs are installed in the target
            cluster.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Only a focused set of built-in workload relationships is evaluated
            locally. Unknown kinds are not automatically errors; they may be
            valid custom resources whose schemas exist only through CRDs in the
            target cluster.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            YAML Types Can Quietly Produce the Wrong Kubernetes Value
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Some Kubernetes fields are strings even when their contents look
            numeric or boolean. An environment variable written as{" "}
            <code>value: 123</code> can become a YAML number, while the
            Kubernetes env value field expects text. Writing{" "}
            <code>value: "123"</code> makes the intended type explicit.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The same issue appears in labels, annotations, ConfigMap data, and
            Secret stringData, where accidental YAML booleans or numbers can
            cause validation failures. Those high-value type mismatches are
            reported while the original YAML remains untouched.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Container Names, Volumes, and Mounts Form Another Local Graph
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Container names must be unique within a Pod, and a volumeMount
            refers to a volume by name. If the mount says{" "}
            <code>name: app-data</code> while the Pod defines{" "}
            <code>name: data</code>, the relationship is broken. These checks
            stay local to each Pod template so similarly named volumes in another
            resource do not accidentally satisfy the reference.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Environment Sources and Secret Data Have Their Own Rules
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Current Kubernetes allows environment-variable names to contain
            printable ASCII characters except <code>=</code>. An <code>env</code>
            entry can hold a literal string or one <code>valueFrom</code> source;
            <code>envFrom</code> selects a ConfigMap or Secret source. Ordering also
            matters when values reference earlier variables. The{" "}
            <a href="https://kubernetes.io/docs/tasks/inject-data-application/define-environment-variable-container/" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">
              Kubernetes environment-variable guide
            </a>{" "}
            describes these runtime rules.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Secret <code>data</code> values are standard base64 strings, while
            <code>stringData</code> accepts plain strings and overwrites a matching
            <code>data</code> key when written. Base64 is encoding, not encryption.
            Kubernetes' own{" "}
            <a href="https://kubernetes.io/docs/concepts/security/secrets-good-practices/" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">
              Secret guidance
            </a>{" "}
            recommends treating manifests containing credentials as sensitive.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Structural Validity and Workload Safety Are Different Questions
          </h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            Kubernetes intentionally supports powerful features such as
            privileged containers, host namespaces, and hostPath volumes. They
            can be necessary for node agents or infrastructure workloads, but
            they also reduce isolation. A few obvious cases are marked for
            review instead of being declared invalid.
          </p>
          <p className="mt-4 leading-relaxed text-gray-700">
            A full security review also needs RBAC, Pod Security admission,
            image provenance, capabilities, seccomp/AppArmor, network policy,
            secret handling, service accounts, supply-chain controls, and the
            policies of the target cluster.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Jobs and Long-Running Controllers Do Not Share Every Pod Rule
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Deployments, StatefulSets, DaemonSets, and ReplicaSets manage
            continuously running Pods and use restartPolicy Always. Jobs and
            CronJobs are completion-oriented workloads, where Pod templates use
            OnFailure or Never instead. The nested structure also differs:
            CronJob contains a Job template, which then contains a Pod template.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Following those nesting relationships keeps a missing CronJob
            schedule or nested Pod template close to the path that needs fixing.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Multi-Document Files and List Objects Need Per-Object Results
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A single YAML file can contain several resources separated by{" "}
            <code>---</code>. Kubernetes List objects can also wrap several
            items. A single “valid” badge for the whole file is not very useful
            when object one is fine and object four has the problem.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Findings stay attached to each document, and List items are expanded
            for inspection while retaining their source location in the result
            path.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Render Templates Before Validating the Manifest They Produce
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Helm, Jinja-style systems, CI templates, and other generators can
            contain placeholders that are not the final Kubernetes manifest.
            Validating template source as though it were already rendered YAML
            can create misleading parser errors—or worse, validate a shape that
            changes after rendering.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            When template markers are detected, the result records that fact.
            For production checks, render the same values and chart/template
            inputs used by the deployment pipeline, then validate the rendered
            objects.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            The API Server Knows Things a Browser Cannot Know
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Kubernetes server-side field validation uses the schemas available
            to the actual API server and can detect unknown or duplicate fields.
            Admission webhooks and policies can add organization-specific
            requirements after ordinary schema checks, while CRDs add resource
            types and validation rules that are not present in the pasted YAML.
            Kubernetes documents the strict, warn, and ignore validation modes in
            the{" "}
            <a href="https://kubernetes.io/docs/reference/kubectl/generated/kubectl_apply/" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">
              kubectl apply reference
            </a>.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            When you need to know whether the target cluster would accept the
            manifest, a useful next step is{" "}
            <code>kubectl apply --dry-run=server -f manifest.yaml</code>. A
            server-side dry run submits the request for server processing
            without persisting the resource.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            A server-side dry run submits the request for normal server processing
            without persisting the resource, which is the closest check available
            before an actual write.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Keep Following the Manifest's Dependencies
          </h2>

          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/kubernetes-yaml-validator" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
