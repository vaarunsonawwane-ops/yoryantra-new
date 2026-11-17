"use client";

import { useMemo, useState } from "react";
import { parseAllDocuments } from "yaml";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type EntrySource = "data" | "stringData";

type SecretEntry = {
  key: string;
  source: EntrySource;
  encodedValue: string;
  decodedValue: string;
  bytes: number;
  isText: boolean;
  error: string;
};

type SecretDocument = {
  documentNumber: number;
  apiVersion: string;
  kind: string;
  name: string;
  namespace: string;
  secretType: string;
  immutable: boolean | null;
  entries: SecretEntry[];
  notes: string[];
};

type SecretReport = {
  documents: SecretDocument[];
  notes: string[];
  yamlWarnings: string[];
};

const SAMPLE_SECRET = `apiVersion: v1
kind: Secret
metadata:
  name: app-secret
  namespace: default
type: Opaque
data:
  username: YWRtaW4=
  password: c2VjcmV0MTIz
  api_key: eW9yeWFudHJhLWtleQ==
stringData:
  environment: production`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value)
  );
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function metadataValue(
  value: unknown,
  key: string
) {
  if (!isRecord(value)) {
    return "";
  }

  return asString(value[key]);
}

function hexPreview(bytes: Uint8Array) {
  const shown = bytes.slice(0, 96);
  const hex = Array.from(shown)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join(" ");

  return `${hex}${bytes.length > 96 ? " …" : ""}`;
}

function decodeBase64Value(value: string) {
  const normalized = value.replace(/\r\n|\r|\n/g, "");

  if (!normalized) {
    return {
      value: "",
      bytes: 0,
      isText: true,
    };
  }

  if (/\s/.test(normalized)) {
    throw new Error(
      "Invalid standard Base64: spaces/tabs are present after YAML parsing. Kubernetes Secret data values should be standard Base64 strings."
    );
  }

  if (
    !/^[A-Za-z0-9+/]+={0,2}$/.test(normalized) ||
    normalized.length % 4 !== 0
  ) {
    throw new Error(
      "Invalid standard Base64 encoding or padding."
    );
  }

  const firstPadding = normalized.indexOf("=");

  if (
    firstPadding !== -1 &&
    firstPadding < normalized.length - 2
  ) {
    throw new Error(
      "Base64 padding appears before the end of the value."
    );
  }

  let binary = "";

  try {
    binary = atob(normalized);
  } catch {
    throw new Error(
      "Invalid standard Base64 encoding."
    );
  }

  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  try {
    const text = new TextDecoder("utf-8", {
      fatal: true,
    }).decode(bytes);

    return {
      value: text,
      bytes: bytes.length,
      isText: true,
    };
  } catch {
    return {
      value: `[binary data: ${bytes.length} bytes]\nhex: ${hexPreview(bytes)}`,
      bytes: bytes.length,
      isText: false,
    };
  }
}

function readStringMap(
  value: unknown,
  sectionName: string,
  notes: string[]
) {
  const result: Array<{
    key: string;
    value: string;
    error: string;
  }> = [];

  if (value === undefined || value === null) {
    return result;
  }

  if (!isRecord(value)) {
    notes.push(
      `${sectionName} exists but is not a YAML mapping/object. Kubernetes Secret ${sectionName} is expected to be a string-keyed map.`
    );
    return result;
  }

  Object.keys(value).forEach((key) => {
    const item = value[key];

    if (!/^[A-Za-z0-9._-]+$/.test(key)) {
      notes.push(
        `${sectionName}.${key || "(empty key)"} uses a key outside Kubernetes Secret's allowed alphanumeric, -, _, and . character set.`
      );
    }

    if (typeof item !== "string") {
      result.push({
        key,
        value: "",
        error:
          `${sectionName}.${key} parsed as ${Array.isArray(item) ? "array" : item === null ? "null" : typeof item}, not a string. Quote YAML values when Kubernetes expects map[string]string data.`,
      });
      return;
    }

    result.push({
      key,
      value: item,
      error: "",
    });
  });

  return result;
}

function typeSpecificNotes(
  secretType: string,
  keys: string[],
  metadata: unknown,
  entries: SecretEntry[]
) {
  const notes: string[] = [];
  const has = (key: string) => keys.indexOf(key) !== -1;
  const effectiveEntry = (key: string) => {
    for (let index = entries.length - 1; index >= 0; index -= 1) {
      if (entries[index].key === key && !entries[index].error) {
        return entries[index];
      }
    }

    return null;
  };
  const reviewDockerJson = (key: string) => {
    const entry = effectiveEntry(key);

    if (!entry || !entry.isText) {
      if (entry && !entry.isText) {
        notes.push(
          `${key} decodes to binary data rather than UTF-8 JSON text.`
        );
      }
      return;
    }

    try {
      JSON.parse(entry.decodedValue);
      notes.push(
        `${key} decodes to valid JSON. Kubernetes checks JSON syntax for Docker config Secret types, but it does not prove the document is a usable Docker config or that the credentials work.`
      );
    } catch {
      notes.push(
        `${key} does not decode to valid JSON, so a Docker config Secret using this value would fail the built-in JSON check.`
      );
    }
  };

  if (secretType === "kubernetes.io/tls") {
    const missing = ["tls.crt", "tls.key"].filter((key) => !has(key));

    if (missing.length) {
      notes.push(
        `TLS Secret is missing expected key${
          missing.length === 1 ? "" : "s"
        }: ${missing.join(", ")}. Kubernetes' built-in TLS Secret type expects tls.crt and tls.key keys.`
      );
    } else {
      notes.push(
        "TLS Secret contains tls.crt and tls.key. Key presence does not prove that the certificate parses correctly or that the private key matches it."
      );
    }
  }

  if (secretType === "kubernetes.io/dockerconfigjson") {
    if (!has(".dockerconfigjson")) {
      notes.push(
        'kubernetes.io/dockerconfigjson Secret is missing the expected ".dockerconfigjson" key.'
      );
    } else {
      reviewDockerJson(".dockerconfigjson");
    }
  }

  if (secretType === "kubernetes.io/dockercfg") {
    if (!has(".dockercfg")) {
      notes.push(
        'kubernetes.io/dockercfg Secret is missing the expected ".dockercfg" key.'
      );
    } else {
      reviewDockerJson(".dockercfg");
    }
  }

  if (secretType === "kubernetes.io/basic-auth") {
    if (!has("username") && !has("password")) {
      notes.push(
        "Basic-auth Secret contains neither username nor password. Kubernetes documents those conventional keys for this built-in type."
      );
    }
  }

  if (secretType === "kubernetes.io/ssh-auth" && !has("ssh-privatekey")) {
    notes.push(
      "SSH-auth Secret is missing the expected ssh-privatekey key."
    );
  }

  if (secretType === "kubernetes.io/service-account-token") {
    const annotations =
      isRecord(metadata) && isRecord(metadata.annotations)
        ? metadata.annotations
        : null;
    const serviceAccountName =
      annotations &&
      typeof annotations["kubernetes.io/service-account.name"] === "string"
        ? annotations["kubernetes.io/service-account.name"]
        : "";

    if (!serviceAccountName) {
      notes.push(
        "Service-account-token Secret does not show the kubernetes.io/service-account.name annotation used to identify the ServiceAccount."
      );
    }

    notes.push(
      "Long-lived service-account-token Secrets are a specialized legacy workflow. Kubernetes recommends the TokenRequest API/projected tokens for many modern workloads."
    );
  }

  return notes;
}

function parseSecretDocument(
  value: unknown,
  documentNumber: number
): SecretDocument {
  const notes: string[] = [];

  if (!isRecord(value)) {
    return {
      documentNumber,
      apiVersion: "",
      kind: "",
      name: "",
      namespace: "",
      secretType: "",
      immutable: null,
      entries: [],
      notes: [
        "This YAML document does not contain a top-level mapping/object, so it cannot be interpreted as a Kubernetes Secret manifest.",
      ],
    };
  }

  const apiVersion = asString(value.apiVersion);
  const kind = asString(value.kind);
  const metadata = value.metadata;
  const name = metadataValue(metadata, "name");
  const namespace = metadataValue(metadata, "namespace");
  const rawType = asString(value.type);
  const secretType = rawType || "Opaque";
  const immutable =
    typeof value.immutable === "boolean" ? value.immutable : null;
  const dataFields = readStringMap(value.data, "data", notes);
  const stringDataFields = readStringMap(
    value.stringData,
    "stringData",
    notes
  );
  const entries: SecretEntry[] = [];

  dataFields.forEach((field) => {
    if (field.error) {
      entries.push({
        key: field.key,
        source: "data",
        encodedValue: "",
        decodedValue: "",
        bytes: 0,
        isText: false,
        error: field.error,
      });
      return;
    }

    try {
      const decoded = decodeBase64Value(field.value);

      entries.push({
        key: field.key,
        source: "data",
        encodedValue: field.value,
        decodedValue: decoded.value,
        bytes: decoded.bytes,
        isText: decoded.isText,
        error: "",
      });
    } catch (caught) {
      entries.push({
        key: field.key,
        source: "data",
        encodedValue: field.value,
        decodedValue: "",
        bytes: 0,
        isText: false,
        error:
          caught instanceof Error
            ? caught.message
            : "Invalid Base64 value.",
      });
    }
  });

  stringDataFields.forEach((field) => {
    if (field.error) {
      entries.push({
        key: field.key,
        source: "stringData",
        encodedValue: "",
        decodedValue: "",
        bytes: 0,
        isText: true,
        error: field.error,
      });
      return;
    }

    entries.push({
      key: field.key,
      source: "stringData",
      encodedValue: "",
      decodedValue: field.value,
      bytes: new TextEncoder().encode(field.value).length,
      isText: true,
      error: "",
    });
  });

  const dataKeys = dataFields.map((field) => field.key);
  const overlapping = stringDataFields
    .map((field) => field.key)
    .filter((key) => dataKeys.indexOf(key) !== -1);

  if (overlapping.length) {
    notes.push(
      `Key${
        overlapping.length === 1 ? "" : "s"
      } ${overlapping.join(
        ", "
      )} appear in both data and stringData. When Kubernetes merges them, the stringData value takes precedence for the same key.`
    );
  }


  if (stringDataFields.length) {
    notes.push(
      "Kubernetes documentation notes that stringData does not work well with server-side apply. Prefer data or a different secret-management path when server-side apply ownership matters."
    );
  }

  if (kind !== "Secret") {
    notes.push(
      kind
        ? `kind is "${kind}", not "Secret". Secret-specific rules may not apply to this document.`
        : "No kind field was found. A Kubernetes Secret manifest normally uses kind: Secret."
    );
  }

  if (apiVersion !== "v1") {
    notes.push(
      apiVersion
        ? `apiVersion is "${apiVersion}". Core Kubernetes Secret objects use apiVersion: v1.`
        : "No apiVersion field was found. Core Kubernetes Secret objects use apiVersion: v1."
    );
  }

  if (!name) {
    notes.push(
      "metadata.name is not present. A namespaced Secret normally needs a name before it can be created."
    );
  }

  if (value.type === undefined) {
    notes.push(
      "type is omitted, so this review treats the Secret as Opaque, Kubernetes' default Secret type."
    );
  }

  if (
    value.immutable !== undefined &&
    typeof value.immutable !== "boolean"
  ) {
    notes.push(
      "immutable is present but did not parse as a boolean."
    );
  }

  if (!entries.length) {
    notes.push(
      "No scalar data or stringData entries were found."
    );
  }

  if (entries.some((entry) => entry.error)) {
    notes.push(
      "At least one field could not be interpreted. Valid fields remain visible so you can isolate the problem."
    );
  }

  if (
    entries.some(
      (entry) =>
        entry.source === "data" &&
        !entry.error &&
        !entry.isText
    )
  ) {
    notes.push(
      "At least one data value is binary rather than valid UTF-8 text. A hexadecimal preview is shown for that field."
    );
  }


  const effectiveBytes: Record<string, number> = {};
  entries.forEach((entry) => {
    if (!entry.error) {
      effectiveBytes[entry.key] = entry.bytes;
    }
  });
  const effectiveDataBytes = Object.keys(effectiveBytes).reduce(
    (total, key) => total + effectiveBytes[key],
    0
  );

  if (effectiveDataBytes > 1024 * 1024) {
    notes.push(
      `Decoded Secret data totals ${effectiveDataBytes} bytes, above Kubernetes' 1 MiB Secret data limit.`
    );
  }

  const finalKeys = dataKeys.slice();

  stringDataFields.forEach((field) => {
    if (finalKeys.indexOf(field.key) === -1) {
      finalKeys.push(field.key);
    }
  });

  typeSpecificNotes(secretType, finalKeys, metadata, entries).forEach((note) =>
    notes.push(note)
  );

  return {
    documentNumber,
    apiVersion,
    kind,
    name,
    namespace,
    secretType,
    immutable,
    entries,
    notes,
  };
}

function parseKubernetesSecrets(source: string): SecretReport {
  const documents = parseAllDocuments(source, {
    uniqueKeys: true,
    prettyErrors: true,
  });

  if (!documents.length) {
    throw new Error("No YAML document was found.");
  }

  const yamlErrors: string[] = [];
  const yamlWarnings: string[] = [];

  documents.forEach((document, index) => {
    document.errors.forEach((error) => {
      yamlErrors.push(
        `Document ${index + 1}: ${error.message}`
      );
    });

    document.warnings.forEach((warning) => {
      yamlWarnings.push(
        `Document ${index + 1}: ${warning.message}`
      );
    });
  });

  if (yamlErrors.length) {
    throw new Error(
      `YAML parsing failed:\n${yamlErrors.join("\n")}`
    );
  }

  const parsedDocuments = documents.map((document, index) => {
    let value: unknown;

    try {
      value = document.toJS({
        maxAliasCount: 100,
      });
    } catch (caught) {
      throw new Error(
        `Document ${index + 1} could not be converted from YAML: ${
          caught instanceof Error ? caught.message : "unknown YAML error"
        }`
      );
    }

    return parseSecretDocument(value, index + 1);
  });

  const notes: string[] = [];

  if (parsedDocuments.length > 1) {
    notes.push(
      `The input contains ${parsedDocuments.length} YAML documents. Each is reviewed independently; kubectl/apply behavior still depends on the complete resource set and cluster API validation.`
    );
  }

  if (
    parsedDocuments.some(
      (document) => document.kind && document.kind !== "Secret"
    )
  ) {
    notes.push(
      "At least one YAML document is not kind: Secret. It is kept visible because mixed multi-document files are common during troubleshooting."
    );
  }

  notes.push(
    "Base64 decoding proves representation only. It does not prove that the Secret is authorized, encrypted at rest, safe to expose to a Pod, or accepted by a Kubernetes API server."
  );

  return {
    documents: parsedDocuments,
    notes,
    yamlWarnings,
  };
}

function maskValue(value: string, bytes: number) {
  if (!value) {
    return "(empty value)";
  }

  return `•••••••• (${bytes} byte${bytes === 1 ? "" : "s"} hidden)`;
}

function entryDisplay(entry: SecretEntry, mask: boolean) {
  if (entry.error) {
    return `ERROR: ${entry.error}`;
  }

  return mask
    ? maskValue(entry.decodedValue, entry.bytes)
    : entry.decodedValue;
}

function formatSecretReport(
  report: SecretReport,
  mask: boolean
) {
  const lines = [
    "Kubernetes Secret inspection",
    `YAML documents: ${report.documents.length}`,
    "",
  ];

  report.documents.forEach((document) => {
    lines.push(
      `Document ${document.documentNumber}`,
      `apiVersion: ${document.apiVersion || "not found"}`,
      `kind: ${document.kind || "not found"}`,
      `name: ${document.name || "not found"}`,
      `namespace: ${document.namespace || "not specified"}`,
      `type: ${document.secretType || "not specified"}`,
      `immutable: ${
        document.immutable === null ? "not specified" : String(document.immutable)
      }`,
      ""
    );

    if (document.entries.length) {
      document.entries.forEach((entry) => {
        lines.push(
          `[${entry.source}] ${entry.key}`,
          entryDisplay(entry, mask),
          ""
        );
      });
    } else {
      lines.push("No data/stringData entries.", "");
    }

    if (document.notes.length) {
      lines.push(
        "Document review:",
        ...document.notes.map((note) => `- ${note}`),
        ""
      );
    }
  });

  if (report.yamlWarnings.length) {
    lines.push(
      "YAML warnings:",
      ...report.yamlWarnings.map((warning) => `- ${warning}`),
      ""
    );
  }

  if (report.notes.length) {
    lines.push(
      "Overall notes:",
      ...report.notes.map((note) => `- ${note}`)
    );
  }

  return lines.join("\n").trim();
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<SecretReport | null>(null);
  const [error, setError] = useState("");
  const [maskValues, setMaskValues] = useState(true);
  const [copied, setCopied] = useState(false);

  const formattedOutput = useMemo(
    () => (result ? formatSecretReport(result, maskValues) : ""),
    [result, maskValues]
  );

  const clearResult = () => {
    setResult(null);
    setError("");
    setCopied(false);
  };

  const decode = () => {
    if (!input.trim()) {
      setError("Paste Kubernetes Secret YAML to inspect.");
      setResult(null);
      return;
    }

    try {
      setResult(parseKubernetesSecrets(input));
      setError("");
      setCopied(false);
    } catch (caught) {
      setResult(null);
      setCopied(false);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to parse this Secret YAML."
      );
    }
  };

  const loadExample = () => {
    setInput(SAMPLE_SECRET);
    setMaskValues(true);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setMaskValues(true);
    clearResult();
  };

  const copyOutput = async () => {
    if (!formattedOutput) return;

    try {
      await navigator.clipboard.writeText(formattedOutput);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setError(
        "The Secret report could not be copied. Select and copy it manually."
      );
    }
  };

  const entryCount = result
    ? result.documents.reduce(
        (total, document) => total + document.entries.length,
        0
      )
    : 0;
  const invalidCount = result
    ? result.documents.reduce(
        (total, document) =>
          total + document.entries.filter((entry) => entry.error).length,
        0
      )
    : 0;
  const binaryCount = result
    ? result.documents.reduce(
        (total, document) =>
          total +
          document.entries.filter(
            (entry) =>
              entry.source === "data" &&
              !entry.error &&
              !entry.isText
          ).length,
        0
      )
    : 0;

  return (
    <ToolShell
      title="Kubernetes Secret Decoder"
      description="When you open a Kubernetes Secret YAML file, you&apos;ll usually see the values under data written in Base64. To read those values, you need to decode them."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block text-sm font-semibold text-gray-900">
            Kubernetes YAML
          </label>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            The project supports YAML in single or multiple documents. It uses
            the project&apos;s YAML library to parse quoted scalars, block scalars,
            anchors, and other normal YAML syntax instead of using a custom line parser.
          </p>
          <textarea
            value={input}
            onChange={(event: { target: { value: string } }) => {
              setInput(event.target.value);
              clearResult();
            }}
            placeholder={SAMPLE_SECRET}
            spellCheck={false}
            className="mt-4 min-h-[430px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Secret-value visibility
          </h2>

          <label className="mt-5 flex items-start gap-3 text-sm leading-relaxed text-gray-700">
            <input
              type="checkbox"
              checked={maskValues}
              onChange={(event: { target: { checked: boolean } }) => {
                setMaskValues(event.target.checked);
                setCopied(false);
              }}
              className="mt-1"
            />
            <span>
              <strong>Mask decoded values.</strong>{" "}
              When you decode a Secret, the values stay hidden by default. You
              can show them whenever you need to check something. Just remember
              that the original YAML is still visible in the input box, so be
              careful when sharing your screen.
            </span>
          </label>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-gray-700">
            Base64 isn&apos;t a way to keep things secret. A secret file can have
            important info like passwords, private keys, or special tokens for
            getting into systems. When you&apos;re testing, use fake info instead
            of the real thing, and don&apos;t copy the actual details into help
            tickets or chat rooms.
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={decode} className="yoryantra-btn">
          Decode Secret
        </button>
        <button type="button" onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>
        <button type="button" onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error ? (
        <div className="mt-5 whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="YAML documents" value={String(result.documents.length)} />
            <Stat label="Secret fields" value={String(entryCount)} />
            <Stat label="Invalid fields" value={String(invalidCount)} />
            <Stat label="Binary fields" value={String(binaryCount)} />
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={copyOutput}
              className="yoryantra-btn-outline whitespace-nowrap"
            >
              {copied
                ? "Copied"
                : maskValues
                ? "Copy Masked Report"
                : "Copy Unmasked Report"}
            </button>
          </div>

          <div className="mt-4 space-y-6">
            {result.documents.map((document) => (
              <div
                key={document.documentNumber}
                className="rounded-2xl border border-gray-200 bg-white p-5"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      YAML document {document.documentNumber}
                    </div>
                    <h3 className="mt-1 text-lg font-semibold text-gray-900">
                      {document.name || document.kind || "Unnamed document"}
                    </h3>
                  </div>
                  <div className="text-sm text-gray-500">
                    {document.secretType || "type not specified"}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <Info label="apiVersion" value={document.apiVersion || "not found"} />
                  <Info label="kind" value={document.kind || "not found"} />
                  <Info label="name" value={document.name || "not found"} />
                  <Info
                    label="namespace"
                    value={document.namespace || "not specified"}
                  />
                  <Info
                    label="immutable"
                    value={
                      document.immutable === null
                        ? "not specified"
                        : String(document.immutable)
                    }
                  />
                </div>

                {document.entries.length ? (
                  <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50 text-left text-gray-600">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Key</th>
                          <th className="px-4 py-3 font-semibold">Source</th>
                          <th className="px-4 py-3 font-semibold">Decoded value</th>
                          <th className="px-4 py-3 font-semibold">Bytes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {document.entries.map((entry, index) => (
                          <tr key={`${entry.source}-${entry.key}-${index}`}>
                            <td className="px-4 py-3 align-top font-mono">
                              {entry.key}
                            </td>
                            <td className="px-4 py-3 align-top font-mono">
                              {entry.source}
                            </td>
                            <td className="px-4 py-3 align-top">
                              <pre className="max-w-[720px] whitespace-pre-wrap break-words font-mono text-xs leading-6 text-gray-800">
                                {entryDisplay(entry, maskValues)}
                              </pre>
                            </td>
                            <td className="px-4 py-3 align-top">
                              {entry.error ? "—" : entry.bytes}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="mt-5 text-sm text-gray-600">
                    No data/stringData fields were found.
                  </p>
                )}

                {document.notes.length ? (
                  <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-gray-700">
                    <ul className="list-disc space-y-2 pl-5">
                      {document.notes.map((note, index) => (
                        <li key={`${note}-${index}`}>{note}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {result.yamlWarnings.length || result.notes.length ? (
            <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5 text-sm leading-relaxed text-gray-700">
              {result.yamlWarnings.length ? (
                <>
                  <strong className="text-gray-900">YAML parser warnings</strong>
                  <ul className="mt-2 list-disc space-y-2 pl-5">
                    {result.yamlWarnings.map((warning, index) => (
                      <li key={`${warning}-${index}`}>{warning}</li>
                    ))}
                  </ul>
                </>
              ) : null}

              {result.notes.length ? (
                <>
                  <strong className="mt-5 block text-gray-900">
                    Overall review
                  </strong>
                  <ul className="mt-2 list-disc space-y-2 pl-5">
                    {result.notes.map((note, index) => (
                      <li key={`${note}-${index}`}>{note}</li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : (
        <pre className="yoryantra-output mt-8 min-h-[300px] whitespace-pre-wrap break-words text-sm">
          This is where you&apos;ll see secret metadata, decoded values that have
          been hidden, previews of binary fields, and notes about the types of
          data being reviewed.
        </pre>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        The tool reads and decodes your YAML right in your browser. It doesn&apos;t
        connect to your Kubernetes cluster or make any Kubernetes API requests.
        If the site is tracking visits or running ads, that&apos;s a separate thing
        and doesn&apos;t affect how the information is decoded.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900">
            Parse the YAML Before Decoding Base64
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Kubernetes manifests are written in YAML, which is a type of document. You can&apos;t just
            split these documents into lines at every colon, because that won&apos;t always work. This
            is because values can be quoted and still have special characters like <code>#</code>, or
            they can take up several lines. There&apos;s also a feature that lets you reuse parts of
            the document, and how YAML is parsed determines what type of data something is - like a
            string, a number, or false, a list, or a group of key-value pairs.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            You need to apply the YAML rules first before you can decode something using Base64. This
            is because if your <code>data</code> or <code>stringData</code> has something that
            isn&apos;t a string, you should fix the YAML instead of trying to decode it - Kubernetes
            won&apos;t accept it as a Secret string anyway.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            How data and stringData work in Kubernetes Secrets
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            So, the values under <code>data</code> are coded in a special way called Base64, which can
            handle any kind of bytes. The <code>stringData</code> field is where you can put regular
            text when you&apos;re creating something, and Kubernetes will combine it with the
            <code>data</code>. But here&apos;s the thing: when you go back to get the Secret from the
            API later, the <code>stringData</code> part won&apos;t be there.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            When the same key shows up in two places, the <code>stringData</code> value takes priority.
            This is important to remember when you&apos;re trying to figure out what&apos;s going
            wrong, because the Base64 value you see under <code>data</code> might not be the one
            that&apos;s actually saved.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Base64 Is Not a Security Boundary
          </h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            Base64 just changes how something looks, it doesn&apos;t keep it secret. If someone can
            read the coded message, they can usually figure out the original password, token, or other
            important info like a private key or certificate.
          </p>
          <p className="mt-4 leading-relaxed text-gray-700">
            To really stay safe, you need to control who can access your stuff, make sure your APIs are
            secure, keep secrets hidden, separate your work, and encrypt things when they&apos;re not
            being used. Hiding sensitive info on screens is a good idea, but it&apos;s not enough to
            keep your important credentials safe if you copy and paste them into another system by
            mistake.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Not Every Decoded Value Is Text
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Some Secrets contain text, while others contain files, certificates, keys, or other binary
            data. When you decode them, the result may not always look like readable text. That&apos;s
            normal because some files contain bytes that aren&apos;t meant to be displayed as text.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            If the decoded data contains valid UTF-8 text, the tool shows it normally. If it contains
            binary data that can&apos;t be read as UTF-8, you&apos;ll see the number of bytes and a hex
            preview instead.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Built-In Secret Types Add Key-Level Rules
          </h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            <code>Opaque</code> lets you use your own keys. Some built-in types have specific
            requirements: for example, TLS needs a <code>tls.crt</code> and a <code>tls.key</code>,
            while Docker config uses either <code>.dockerconfigjson</code> or <code>.dockercfg</code>.
            Then there&apos;s SSH auth, which uses an <code>ssh-privatekey</code>, and basic auth,
            which uses a <code>username</code> and/or <code>password</code> - all based on the rules
            set by Kubernetes.
          </p>
          <p className="mt-4 leading-relaxed text-gray-700">
            First, you need to check if you have the right key names. But just having them doesn&apos;t
            mean everything is okay. It doesn&apos;t check if your TLS key is a good match for its
            certificate, or if your registry login will work, or even if your SSH private key is
            suitable for the host you want to trust.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            YAML Can Change the Data Type You Thought You Specified
          </h2>
          <p className="mt-4 text-sm font-medium text-gray-700">Without quotes</p>
          <pre className="mt-2 overflow-auto rounded-xl bg-gray-50 p-4 text-sm leading-7 text-gray-800">{`stringData:
  enabled: true
  pin: 012345`}</pre>
          <p className="mt-4 text-sm font-medium text-gray-700">When you want both values to be strings</p>
          <pre className="mt-2 overflow-auto rounded-xl bg-gray-50 p-4 text-sm leading-7 text-gray-800">{`stringData:
  enabled: "true"
  pin: "012345"`}</pre>
          <p className="mt-4 leading-relaxed text-gray-600">
            In Kubernetes, we have two types of maps: secret <code>data</code> and
            <code>stringData</code>. These maps use strings as keys. Sometimes, when we use YAML, it
            can cause problems if it gives us a true/false value, a number, a list, or a map when it
            should give us a string. This can make our manifest fail, and it happens before the system
            even tries to decode anything using Base64.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Secret keys have some rules too - they can only use letters, numbers, <code>-</code>,
            <code>_</code>, and <code>.</code>. A YAML parser might accept other kinds of keys, but
            that doesn&apos;t mean the Kubernetes API will work with them.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            stringData Is Awkward With Server-Side Apply
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Kubernetes notes that using <code>stringData</code> can be tricky with server-side apply.
            This field is only for writing and gets mixed into the <code>data</code>, which means it
            doesn&apos;t always match up nicely when you try to read it back or figure out who owns it,
            unlike other fields that are saved normally.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            When you&apos;re using GitOps or a server-side-apply workflow to manage a Secret, you need
            to figure out if you should store Base64 values under <code>data</code>. Or maybe it&apos;s
            better to use a separate system to manage your secrets. This way, you can avoid the hassle
            of dealing with fields that can only be written to, but not read from.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            immutable Changes Update Behavior, Not Decoding
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            When you set <code>immutable</code> to true, you can&apos;t make any changes to the secret
            data later on. This can also help reduce the load on the kubelet in big clusters where lots
            of secrets are mounted. But it won&apos;t affect how the data is stored in the secret - the
            Base64 representation and the bytes will stay the same.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            So, an update can still fail even if the YAML value seems fine. Make sure to check the
            <code>immutable</code> flag before thinking a rejected change is just an encoding issue.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Secret Size Has a Hard Limit
          </h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            Kubernetes allows up to 1 MiB of data in a single Secret. This limit is based on the actual
            data stored in the Secret, not the size of the YAML file.
          </p>
          <p className="mt-4 leading-relaxed text-gray-700">
            Large certificates, keys, and other files can quickly add up. If your Secret contains more
            than 1 MiB of data, Kubernetes will reject it. For large files that aren&apos;t sensitive,
            it&apos;s better to store them somewhere else.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            A Manifest Is Not the Live Cluster
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The YAML file on your computer might not be the same as what&apos;s actually running in the
            cluster. This can happen after you&apos;ve made changes with templating, GitOps, or updated
            the controller. Maybe some secrets were added or something changed during deployment. If
            you decode a manifest you copied, it will show you what&apos;s in that text, but not
            what&apos;s currently running in a Pod.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            If you want to check what&apos;s actually stored in your Kubernetes cluster, you can use
            <code>kubectl</code> or the Kubernetes API with the access your team has given you. Just
            make sure you follow your company&apos;s rules when handling passwords, tokens, and other
            sensitive information.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            There&apos;s a special situation with long-term secret codes for services - usually,
            it&apos;s better to use short-term codes or special tokens that are linked to a service
            account, as recommended by Kubernetes for most tasks.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">Kubernetes Behavior to Verify</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <ReferenceCard
              title="Kubernetes Secrets"
              href="https://kubernetes.io/docs/concepts/configuration/secret/"
              text="Things to think about include data, stringData, built-in Secret types, how big they can be, and how immutable Secrets can't be changed. We also need to consider service account tokens and how to keep everything secure."
            />
            <ReferenceCard
              title="Secret v1 API Reference"
              href="https://kubernetes.io/docs/reference/kubernetes-api/core/secret-v1/"
              text="The fields and types at the API level for Secret objects include data, stringData, immutable, metadata, and type."
            />
            <ReferenceCard
              title="Encrypting Confidential Data at Rest"
              href="https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/"
              text="Kubernetes can encrypt Secret data before storing it, but this depends on how your cluster is configured. Base64 is only used to represent the data, so it shouldn't be confused with encryption."
            />
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/kubernetes-secret-decoder" />
          </div>
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

function Info({
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
      <div className="mt-2 break-words text-sm leading-relaxed text-gray-800">
        {value}
      </div>
    </div>
  );
}

function ReferenceCard({
  title,
  href,
  text,
}: {
  title: string;
  href: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="font-semibold text-[var(--green)] underline underline-offset-4"
      >
        {title}
      </a>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">{text}</p>
    </div>
  );
}
