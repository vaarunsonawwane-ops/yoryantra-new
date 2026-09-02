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
      `Decoded effective Secret data is already ${effectiveDataBytes} bytes, which exceeds Kubernetes' 1 MiB Secret size limit before object metadata/serialization overhead is considered.`
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
      description="Kubernetes Secret data is stored as Base64-encoded bytes. Parse the YAML, inspect data and stringData, and keep decoded values masked until you need to read them."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block text-sm font-semibold text-gray-900">
            Kubernetes YAML
          </label>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            Single- or multi-document YAML is supported. Quoted scalars, block
            scalars, anchors and normal YAML syntax are parsed by the project&apos;s
            YAML library rather than a hand-written line parser.
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
              Enabled by default so a successful decode does not immediately
              expose credentials during screen sharing or screenshots.
            </span>
          </label>

          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-900">
            Base64 is not encryption. A Secret manifest can contain production
            credentials, private keys, registry passwords or tokens. Prefer
            placeholders during testing and avoid copying unmasked output into
            tickets or chat.
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
                  <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-900">
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
          Parsed Secret metadata, masked decoded values, binary-field previews
          and type-specific review notes will appear here.
        </pre>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        The pasted manifest is parsed and decoded in your browser. No Kubernetes
        API request is made. Site-wide analytics or advertising scripts, if
        enabled, are separate from the parsing and Base64 decoding steps.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Parse the YAML Before Decoding Base64
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Kubernetes manifests are YAML documents, not a collection of lines
            that can be split safely at every colon. Quoted values can contain
            <code>#</code>, block scalars can span several lines, anchors can
            reuse nodes, and YAML parsing decides whether an unquoted value
            becomes a string, number, boolean, array, or mapping.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Base64 decoding only makes sense after those YAML rules have been
            applied. If <code>data</code> or <code>stringData</code> contains a
            non-string value, fix the YAML first instead of trying to decode a
            value Kubernetes would not accept as a Secret string entry.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            data and stringData Are Two Authoring Paths to the Same Stored Data
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Values under <code>data</code> are Base64-encoded representations of
            arbitrary bytes. <code>stringData</code> accepts ordinary strings as
            write-time input and Kubernetes merges them into <code>data</code>.
            <code>stringData</code> is not returned when the Secret is later read
            from the API.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            If the same key appears in both sections, the stringData value wins.
            That matters during troubleshooting because the Base64 value visible
            under <code>data</code> may not be the value that is finally stored.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-xl font-semibold text-red-900">
            Base64 Is Not a Security Boundary
          </h2>
          <p className="mt-4 leading-relaxed text-red-900/90">
            Base64 changes representation; it does not provide confidentiality.
            Anyone who can read the encoded bytes can normally recover the
            original password, token, certificate, private key, or application
            value.
          </p>
          <p className="mt-4 leading-relaxed text-red-900/90">
            Real protection comes from access control, API authorization, Secret
            distribution, workload isolation, and encryption-at-rest choices.
            Keeping decoded values masked reduces accidental exposure on screen,
            but it does not make a production credential safe to paste into an
            unrelated system.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Not Every Decoded Value Is Text
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Secret data is a byte map. Certificates, key material, compressed
            data, and application blobs can contain byte sequences that are not
            valid UTF-8. Forcing those bytes through a forgiving text decoder can
            replace invalid sequences and hide the actual content.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Valid UTF-8 is shown as text. Other byte sequences are shown by byte
            count with a hexadecimal preview, which is safer than pretending
            arbitrary binary data is readable text.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            Built-In Secret Types Add Key-Level Rules
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            <code>Opaque</code> allows application-defined keys. Built-in types
            add expectations: TLS uses <code>tls.crt</code> and
            <code>tls.key</code>; Docker config uses
            <code>.dockerconfigjson</code> or <code>.dockercfg</code>; SSH auth
            uses <code>ssh-privatekey</code>; basic auth uses
            <code>username</code> and/or <code>password</code> according to the
            Kubernetes type rules.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            Required key names are only the first check. Their presence does not
            prove that a TLS key matches its certificate, a registry login works,
            or an SSH private key is appropriate for the host you plan to trust.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            YAML Can Change the Type You Thought You Wrote
          </h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-gray-50 p-4 text-sm leading-7 text-gray-800">{`stringData:
  enabled: true
  pin: 012345

When strings are intended:
stringData:
  enabled: "true"
  pin: "012345"`}</pre>
          <p className="mt-4 leading-relaxed text-gray-600">
            Secret <code>data</code> and <code>stringData</code> are string-keyed
            maps in the Kubernetes API. If YAML produces a boolean, number,
            array, or mapping where a string is expected, the manifest can fail
            before Base64 decoding is even relevant.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Secret keys have their own restriction too: only alphanumeric
            characters, <code>-</code>, <code>_</code>, and <code>.</code> are
            allowed. A YAML parser can accept a wider key, but the Kubernetes API
            will not necessarily accept that Secret entry.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            stringData Is Awkward With Server-Side Apply
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Kubernetes documents that <code>stringData</code> does not work well
            with server-side apply. The field is write-only and is merged into
            <code>data</code>, so field ownership and later reads do not line up as
            neatly as they do for ordinary persisted fields.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            If a GitOps or server-side-apply workflow manages the Secret, decide
            whether to store Base64 values under <code>data</code> or use a
            dedicated secret-management system instead of repeatedly fighting
            write-only field behavior.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            immutable Changes Update Behavior, Not Decoding
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Setting <code>immutable: true</code> prevents later changes to Secret
            data. It can also reduce kubelet watch load in clusters with many
            Secret mounts. It does not change the Base64 representation or the
            bytes already stored in the Secret.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            An update can therefore fail even when the YAML value itself looks
            perfectly valid. Check the immutable flag before assuming a rejected
            change is an encoding problem.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            Secret Size Has a Hard Limit
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            Kubernetes limits an individual Secret to 1 MiB. Large certificates,
            bundles, generated credentials, or application blobs can push a
            Secret past that boundary faster than expected, especially once the
            complete API object is serialized.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            If the decoded effective data alone is already over 1 MiB, the
            manifest is beyond the documented Secret size limit before metadata
            and serialization overhead are considered. Large non-secret payloads
            usually belong somewhere else.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            A Manifest Is Not the Live Cluster
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The YAML on disk can differ from the object stored in the cluster
            after templating, GitOps substitution, admission changes, Secret
            generation, controller updates, or a later deployment. Decoding a
            pasted manifest answers what that text contains, not what a Pod is
            reading right now.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            When live state is the question, use authenticated kubectl or API
            access and follow the organization&apos;s credential-handling process.
            Long-lived service-account-token Secrets are also a special case;
            current Kubernetes guidance prefers short-lived TokenRequest or
            projected service account tokens for most workloads.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Kubernetes Behavior to Verify
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <ReferenceCard
              title="Kubernetes Secrets"
              href="https://kubernetes.io/docs/concepts/configuration/secret/"
              text="data, stringData, built-in Secret types, size limits, immutable Secrets, service account token guidance, and security considerations."
            />
            <ReferenceCard
              title="Secret v1 API Reference"
              href="https://kubernetes.io/docs/reference/kubernetes-api/core/secret-v1/"
              text="The API-level fields and types for Secret objects, including data, stringData, immutable, metadata, and type."
            />
            <ReferenceCard
              title="Encrypting Confidential Data at Rest"
              href="https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/"
              text="Explains API-server encryption at rest, which is separate from Base64 representation."
            />
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Check the Rest of the Manifest
          </h2>
          <YoryantraRelatedTools currentHref="/tools/kubernetes-secret-decoder" />
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
