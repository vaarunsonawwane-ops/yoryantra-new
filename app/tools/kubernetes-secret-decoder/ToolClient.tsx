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
  metadata: unknown
) {
  const notes: string[] = [];
  const has = (key: string) => keys.indexOf(key) !== -1;

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
        "TLS Secret contains tls.crt and tls.key. This decoder does not validate certificate/key syntax or whether the private key matches the certificate."
      );
    }
  }

  if (secretType === "kubernetes.io/dockerconfigjson") {
    if (!has(".dockerconfigjson")) {
      notes.push(
        'kubernetes.io/dockerconfigjson Secret is missing the expected ".dockerconfigjson" key.'
      );
    } else {
      notes.push(
        ".dockerconfigjson is present. Kubernetes checks that this value can be interpreted as JSON for the built-in type, but this decoder does not authenticate registry credentials."
      );
    }
  }

  if (secretType === "kubernetes.io/dockercfg" && !has(".dockercfg")) {
    notes.push(
      'kubernetes.io/dockercfg Secret is missing the expected ".dockercfg" key.'
    );
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

  if (kind !== "Secret") {
    notes.push(
      kind
        ? `kind is "${kind}", not "Secret". The YAML can still be inspected, but this tool cannot assume Kubernetes Secret semantics.`
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

  const finalKeys = dataKeys.slice();

  stringDataFields.forEach((field) => {
    if (finalKeys.indexOf(field.key) === -1) {
      finalKeys.push(field.key);
    }
  });

  typeSpecificNotes(secretType, finalKeys, metadata).forEach((note) =>
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
      "At least one YAML document is not kind: Secret. The decoder does not discard it silently because mixed multi-document files are common during troubleshooting."
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
      description="Parse Secret manifests with a real YAML parser, decode base64 data, preserve stringData semantics, identify binary fields and type-specific key expectations, and keep decoded values masked until you choose to reveal them."
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
            placeholders when testing the tool and avoid copying unmasked output
            into tickets or chat.
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
        YAML parsing and Base64 decoding happen on the pasted manifest in your
        browser. The tool does not contact a Kubernetes cluster or API server.
        Site-wide analytics or advertising scripts, if enabled, are separate
        from this decoding operation.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            A Secret Decoder Needs a YAML Parser Before It Needs a Base64 Decoder
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Kubernetes manifests are YAML documents, not line-oriented
            <code>key: value</code> text files. Quoted scalars can contain
            comment characters, block scalars can span lines, anchors can reuse
            nodes, and YAML parsing rules determine whether a value becomes a
            string, number, boolean or mapping.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Earlier Yoryantra versions intentionally used a lightweight parser
            and had to document unsupported block-scalar behavior. This freeze
            version uses the project&apos;s real YAML library first, then applies
            Kubernetes Secret-specific checks to the parsed object.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            data and stringData Reach the Same Secret Through Different Authoring Paths
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Values under <code>data</code> are Base64-encoded representations of
            arbitrary bytes. <code>stringData</code> is a write-only convenience
            that lets manifest authors provide unencoded string values and lets
            the API server merge them into Secret data.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            When the same key is supplied in both sections, the stringData value
            wins during that merge. The decoder shows both source sections and
            calls out overlapping keys so you do not inspect the Base64 value
            and accidentally believe it will be the effective value.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-xl font-semibold text-red-900">
            Base64 Makes Bytes Printable; It Does Not Make Them Confidential
          </h2>
          <p className="mt-4 leading-relaxed text-red-900/90">
            Anyone who can read a Secret&apos;s Base64 data can normally decode it.
            Kubernetes security depends on RBAC and authorization, API access,
            workload isolation, storage/encryption-at-rest configuration and how
            applications handle the material after mounting or injecting it.
          </p>
          <p className="mt-4 leading-relaxed text-red-900/90">
            That is why decoded values start masked here. Local browser
            processing reduces unnecessary network exposure, but it does not
            make a production credential harmless to display, screenshot or
            copy.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            A Secret Can Store Binary Data That Is Not Valid UTF-8
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Certificates, key material and application blobs are byte sequences.
            Decoding Base64 does not guarantee the result is readable text.
            Forcing arbitrary bytes through a normal string decoder can replace
            invalid sequences and hide the actual content.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Yoryantra uses a fatal UTF-8 decode first. If the bytes are not valid
            UTF-8, it reports their size and shows a hexadecimal preview instead
            of pretending the data is text.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            Built-In Secret Types Add Expectations Beyond “data Is a Map”
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            An Opaque Secret can use application-defined keys. Built-in types
            carry conventions or validation: TLS Secrets use{" "}
            <code>tls.crt</code> and <code>tls.key</code>;
            dockerconfigjson uses <code>.dockerconfigjson</code>; SSH auth uses{" "}
            <code>ssh-privatekey</code>; basic auth commonly uses username and
            password.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            This decoder checks whether those expected key names are present,
            but it does not claim that a certificate is valid, a private key
            matches it, registry credentials work, or an SSH key is
            cryptographically sound.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            YAML Type Coercion Can Break a Secret Before Base64 Is Checked
          </h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-gray-50 p-4 text-sm leading-7 text-gray-800">{`stringData:
  enabled: true
  pin: 012345

Safer when strings are intended:
stringData:
  enabled: "true"
  pin: "012345"`}</pre>
          <p className="mt-4 leading-relaxed text-gray-600">
            Kubernetes Secret data/stringData are string-keyed maps at the API
            level. If YAML produces a boolean, number, array or object where a
            string is expected, the manifest can fail schema/API conversion or
            behave differently from what a human reading the source assumed.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The real YAML parser lets this tool identify the parsed type and
            tell you to quote values that are meant to remain strings.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            immutable Changes Update Behavior, Not the Meaning of Decoded Bytes
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Kubernetes can mark a Secret immutable. That prevents changes to the
            Secret&apos;s data after creation and can reduce API-server/kubelet
            watch load in some large deployments.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The decoder displays the immutable flag because it matters when a
            value is correct in YAML but an attempted update still fails. It
            does not change how existing data bytes are Base64-decoded.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Decoding a Manifest and Reading the Live Cluster Are Different Workflows
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A manifest on your laptop can differ from the object stored in the
            cluster after templating, GitOps substitution, admission changes,
            Secret generation or a later update. This page only answers what the
            pasted YAML says.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            When cluster state is the question, use authenticated kubectl/API
            access and your organization&apos;s secret-handling process. Do not
            paste live credentials into unrelated systems simply to make
            inspection easier.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <ReferenceCard
            title="Kubernetes Secrets"
            href="https://kubernetes.io/docs/concepts/configuration/secret/"
            text="Official documentation for data, stringData, built-in Secret types, immutable Secrets and security considerations."
          />
          <ReferenceCard
            title="Encrypt Secret Data at Rest"
            href="https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/"
            text="Explains API-server encryption-at-rest configuration, which is separate from Base64 representation."
          />
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
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
