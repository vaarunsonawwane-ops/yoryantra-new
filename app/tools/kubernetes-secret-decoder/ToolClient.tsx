"use client";

import { useMemo, useState, type ReactNode } from "react";
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

type SecretResult = {
  apiVersion: string;
  kind: string;
  name: string;
  namespace: string;
  secretType: string;
  entries: SecretEntry[];
  notes: string[];
};

const sampleSecret = `apiVersion: v1
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

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<SecretResult | null>(null);
  const [error, setError] = useState("");
  const [maskValues, setMaskValues] = useState(false);
  const [copied, setCopied] = useState(false);

  const formattedOutput = useMemo(
    () => (result ? formatSecretResult(result, maskValues) : ""),
    [result, maskValues]
  );

  const decodeSecret = () => {
    if (!input.trim()) {
      setError("Please paste Kubernetes Secret YAML to decode.");
      setResult(null);
      return;
    }

    try {
      const next = parseKubernetesSecret(input);
      setResult(next);
      setError("");
      setCopied(false);
    } catch (err) {
      setResult(null);
      setCopied(false);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to decode this Kubernetes Secret."
      );
    }
  };

  const copyOutput = async () => {
    if (!formattedOutput) return;
    await navigator.clipboard.writeText(formattedOutput);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const loadExample = () => {
    setInput(sampleSecret);
    setResult(null);
    setError("");
    setMaskValues(false);
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setResult(null);
    setError("");
    setMaskValues(false);
    setCopied(false);
  };

  const invalidCount = result?.entries.filter((entry) => entry.error).length ?? 0;
  const dataCount = result?.entries.filter((entry) => entry.source === "data").length ?? 0;
  const stringDataCount = result?.entries.filter((entry) => entry.source === "stringData").length ?? 0;

  return (
    <ToolShell
      title="Kubernetes Secret Decoder"
      description="Decode base64 values from Kubernetes Secret YAML, inspect data and stringData fields, and review secret metadata locally in your browser."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block text-sm font-semibold text-gray-900">
            Kubernetes Secret YAML
          </label>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            Paste a Secret manifest containing a <span className="font-mono">data</span> section,
            a <span className="font-mono">stringData</span> section, or both.
          </p>

          <textarea
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setResult(null);
              setError("");
              setCopied(false);
            }}
            placeholder={sampleSecret}
            spellCheck={false}
            className="mt-4 w-full min-h-[390px] rounded-xl border border-gray-300 p-4 text-sm leading-6 font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Decode Options</h3>

          <label className="mt-5 flex items-start gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={maskValues}
              onChange={(event) => {
                setMaskValues(event.target.checked);
                setCopied(false);
              }}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#d9a928]"
            />
            <span>
              <span className="font-medium text-gray-900">Mask values in copied output</span>
              <span className="mt-1 block leading-6 text-gray-500">
                Useful when you need to share the structure of a Secret without exposing the decoded credentials.
              </span>
            </span>
          </label>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            Kubernetes Secret <span className="font-mono">data</span> values are base64 encoded.
            Base64 is an encoding, not encryption. Treat decoded credentials as sensitive.
          </div>

          <div className="mt-5 text-sm leading-6 text-gray-600">
            <p><strong className="text-gray-900">data:</strong> base64 values are decoded.</p>
            <p className="mt-2"><strong className="text-gray-900">stringData:</strong> values are already plain text and are shown as provided.</p>
            <p className="mt-2"><strong className="text-gray-900">Invalid fields:</strong> one bad base64 value is reported without hiding the other valid fields.</p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={decodeSecret} className="yoryantra-btn">
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
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Secret" value={result.name || "Not named"} />
            <StatCard label="Type" value={result.secretType || "Not specified"} />
            <StatCard label="data fields" value={String(dataCount)} />
            <StatCard label="Invalid values" value={String(invalidCount)} />
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Decoded Values</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {dataCount} base64 field{dataCount === 1 ? "" : "s"} and {stringDataCount} plain-text field{stringDataCount === 1 ? "" : "s"} found.
                </p>
              </div>
              <button
                type="button"
                onClick={copyOutput}
                className="yoryantra-btn-outline text-sm"
              >
                {copied ? "Copied" : maskValues ? "Copy Masked Output" : "Copy Output"}
              </button>
            </div>

            <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
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
                  {result.entries.map((entry, index) => (
                    <tr key={`${entry.source}-${entry.key}-${index}`}>
                      <td className="px-4 py-3 font-mono align-top">{entry.key}</td>
                      <td className="px-4 py-3 align-top">
                        <span className="font-mono">{entry.source}</span>
                      </td>
                      <td className="px-4 py-3 align-top">
                        {entry.error ? (
                          <span className="text-red-700">{entry.error}</span>
                        ) : (
                          <pre className="max-w-[720px] whitespace-pre-wrap break-words font-mono text-xs leading-6 text-gray-800">
                            {maskValues ? maskSecretValue(entry.decodedValue, entry.bytes) : entry.decodedValue}
                          </pre>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">{entry.error ? "—" : entry.bytes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {result.notes.length ? (
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-gray-900">Review Notes</h3>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-gray-600">
                {result.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      ) : null}

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What a Kubernetes Secret Decoder Actually Shows
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A Kubernetes Secret manifest can contain binary or text data under <span className="font-mono">data</span>. In YAML and JSON representations, those values are serialized as base64 strings. Decoding them is useful when you are checking a manifest, investigating a misconfigured environment variable, or confirming which credential a workload will read.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This tool also recognizes <span className="font-mono">stringData</span>. Kubernetes provides that field as a convenient way to write non-binary secret values without manually base64 encoding them first, so those values are displayed as plain text rather than decoded a second time.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            data vs stringData: the Difference Matters
          </h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Field</th>
                  <th className="px-4 py-3 font-semibold">What you put in YAML</th>
                  <th className="px-4 py-3 font-semibold">What this tool does</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                <tr>
                  <td className="px-4 py-3 font-mono">data</td>
                  <td className="px-4 py-3">Base64-encoded values</td>
                  <td className="px-4 py-3">Decodes each value and reports invalid base64 separately</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono">stringData</td>
                  <td className="px-4 py-3">Plain strings</td>
                  <td className="px-4 py-3">Shows the value as written; no base64 decoding is applied</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-gray-600 leading-relaxed">
            If the same key is present in both sections, Kubernetes gives the <span className="font-mono">stringData</span> value precedence when it merges the fields. This tool flags that situation so you do not accidentally review the wrong value.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Useful Checks Before You Apply a Secret
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-600 leading-relaxed">
            <li>Confirm the manifest is really <span className="font-mono">kind: Secret</span> and that the namespace is the one your workload uses.</li>
            <li>Decode usernames, tokens, connection strings, certificates, and configuration values to catch copy-paste mistakes.</li>
            <li>Check for one invalid base64 field instead of assuming the entire Secret is unusable.</li>
            <li>For TLS or Docker registry Secrets, remember that Kubernetes may also impose type-specific key requirements.</li>
            <li>Avoid pasting production credentials into tickets, chat messages, screenshots, or documentation after decoding them.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Equivalent kubectl Workflow
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            When you already have cluster access, you can retrieve a Secret field with <span className="font-mono">kubectl</span> and pipe the base64 value to your operating system&apos;s base64 decoder. The exact command-line flag differs between environments, which is why this browser tool is convenient for reviewing pasted manifests without contacting a cluster.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Limitations and Security Notes
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This is a lightweight Secret-manifest parser, not a full YAML engine or Kubernetes API validator. It is intended for ordinary block-style <span className="font-mono">data</span> and <span className="font-mono">stringData</span> mappings. YAML anchors, complex tags, and multi-line block scalars may require a dedicated YAML parser. Binary <span className="font-mono">data</span> values are shown as a hexadecimal preview when they are not valid UTF-8 text.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The decoding logic runs in this page in your browser and does not send a request to a Kubernetes cluster. Still, decoded values can be highly sensitive, so use the masking option before copying output for someone else.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Official Reference</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Kubernetes documents the behavior of <span className="font-mono">data</span>, <span className="font-mono">stringData</span>, built-in Secret types, and the security limitations of base64 encoding in its official Secret documentation.
          </p>
          <a
            href="https://kubernetes.io/docs/concepts/configuration/secret/"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex text-sm font-semibold text-[var(--green)] hover:underline"
          >
            Kubernetes Secrets documentation ↗
          </a>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Common Questions</h2>
          <div className="mt-5 space-y-6">
            <Question title="Does base64 make a Kubernetes Secret encrypted?">
              No. Base64 changes how bytes are represented; it does not provide confidentiality. Cluster access control, encryption at rest, secret-management practices, and application handling are separate security concerns.
            </Question>
            <Question title="Why can a decoded Secret contain unreadable characters?">
              A Secret can store arbitrary bytes, not only UTF-8 text. When a value is binary, this tool shows a hexadecimal preview instead of pretending the bytes are normal text.
            </Question>
            <Question title="Can this validate whether Kubernetes will accept the whole manifest?">
              No. It checks the Secret structure needed for decoding and reports base64 problems, but it does not perform full Kubernetes schema validation or contact an API server.
            </Question>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/kubernetes-secret-decoder" />
        </div>
      </section>
    </ToolShell>
  );
}

function parseKubernetesSecret(source: string): SecretResult {
  const normalized = source.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const apiVersion = readTopLevelScalar(lines, "apiVersion");
  const kind = readTopLevelScalar(lines, "kind");
  const secretType = readTopLevelScalar(lines, "type");
  const metadata = readMetadata(lines);

  if (kind && kind.toLowerCase() !== "secret") {
    throw new Error(`This manifest is kind: ${kind}, not kind: Secret.`);
  }

  const dataFields = readMappingSection(lines, "data");
  const stringDataFields = readMappingSection(lines, "stringData");

  if (!dataFields.length && !stringDataFields.length) {
    throw new Error("No values were found under data or stringData.");
  }

  const entries: SecretEntry[] = [];

  dataFields.forEach(({ key, value, unsupported }) => {
    if (unsupported) {
      entries.push({
        key,
        source: "data",
        encodedValue: value,
        decodedValue: "",
        bytes: 0,
        isText: false,
        error: "Multi-line YAML scalar detected. Paste this value as a single base64 string to decode it here.",
      });
      return;
    }

    try {
      const decoded = decodeBase64Value(value);
      entries.push({
        key,
        source: "data",
        encodedValue: value,
        decodedValue: decoded.value,
        bytes: decoded.bytes,
        isText: decoded.isText,
        error: "",
      });
    } catch (err) {
      entries.push({
        key,
        source: "data",
        encodedValue: value,
        decodedValue: "",
        bytes: 0,
        isText: false,
        error: err instanceof Error ? err.message : "Invalid base64 value.",
      });
    }
  });

  stringDataFields.forEach(({ key, value, unsupported }) => {
    const plainValue = unsupported
      ? "[multi-line stringData value — lightweight parser does not expand block scalars]"
      : value;

    entries.push({
      key,
      source: "stringData",
      encodedValue: "",
      decodedValue: plainValue,
      bytes: new TextEncoder().encode(plainValue).length,
      isText: true,
      error: "",
    });
  });

  const notes: string[] = [];
  const dataKeys = new Set(dataFields.map((field) => field.key));
  const duplicateKeys = stringDataFields
    .map((field) => field.key)
    .filter((key) => dataKeys.has(key));

  if (duplicateKeys.length) {
    notes.push(
      `The key${duplicateKeys.length === 1 ? "" : "s"} ${duplicateKeys.join(", ")} appear in both data and stringData. Kubernetes uses the stringData value when those fields are merged.`
    );
  }

  if (!kind) {
    notes.push("No kind field was found. A normal Kubernetes Secret manifest uses kind: Secret.");
  }

  if (!apiVersion) {
    notes.push("No apiVersion field was found. Core Kubernetes Secrets normally use apiVersion: v1.");
  }

  if (entries.some((entry) => entry.error)) {
    notes.push("At least one data value could not be decoded. Valid fields are still shown so you can isolate the problem.");
  }

  if (entries.some((entry) => entry.source === "data" && !entry.error && !entry.isText)) {
    notes.push("At least one decoded data value is binary rather than valid UTF-8 text; a hexadecimal preview is shown for that field.");
  }

  return {
    apiVersion,
    kind,
    name: metadata.name,
    namespace: metadata.namespace,
    secretType,
    entries,
    notes,
  };
}

function readTopLevelScalar(lines: string[], key: string) {
  const pattern = new RegExp(`^${escapeRegExp(key)}\\s*:\\s*(.*)$`, "i");

  for (const line of lines) {
    if (countIndent(line) !== 0) continue;
    const match = line.trim().match(pattern);
    if (match) return cleanYamlScalar(match[1]);
  }

  return "";
}

function readMetadata(lines: string[]) {
  let insideMetadata = false;
  let metadataIndent = -1;
  let name = "";
  let namespace = "";

  for (const rawLine of lines) {
    const line = rawLine.replace(/\t/g, "  ");
    const trimmed = line.trim();
    const indent = countIndent(line);

    if (!insideMetadata && /^metadata\s*:\s*$/i.test(trimmed) && indent === 0) {
      insideMetadata = true;
      metadataIndent = indent;
      continue;
    }

    if (!insideMetadata) continue;
    if (trimmed && indent <= metadataIndent) break;
    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = trimmed.match(/^([A-Za-z0-9_.-]+)\s*:\s*(.*)$/);
    if (!match) continue;

    const value = cleanYamlScalar(match[2]);
    if (match[1] === "name") name = value;
    if (match[1] === "namespace") namespace = value;
  }

  return { name, namespace };
}

function readMappingSection(lines: string[], sectionName: string) {
  const fields: Array<{ key: string; value: string; unsupported: boolean }> = [];
  let insideSection = false;
  let sectionIndent = -1;
  let skippedBlockIndent: number | null = null;

  for (const rawLine of lines) {
    const line = rawLine.replace(/\t/g, "  ");
    const trimmed = line.trim();
    const indent = countIndent(line);

    if (!insideSection) {
      const sectionMatch = trimmed.match(/^([A-Za-z0-9_.-]+)\s*:\s*$/);
      if (sectionMatch && indent === 0 && sectionMatch[1].toLowerCase() === sectionName.toLowerCase()) {
        insideSection = true;
        sectionIndent = indent;
      }
      continue;
    }

    if (trimmed && indent <= sectionIndent) break;
    if (!trimmed || trimmed.startsWith("#")) continue;

    if (skippedBlockIndent !== null) {
      if (indent > skippedBlockIndent) continue;
      skippedBlockIndent = null;
    }

    const match = trimmed.match(/^([A-Za-z0-9_.-]+)\s*:\s*(.*)$/);
    if (!match) continue;

    const rawValue = match[2].trim();
    const unsupported = rawValue === "|" || rawValue === ">" || /^[-+]?\d*[|>]$/.test(rawValue);

    fields.push({
      key: match[1],
      value: unsupported ? rawValue : cleanYamlScalar(rawValue),
      unsupported,
    });

    if (unsupported) skippedBlockIndent = indent;
  }

  return fields;
}

function decodeBase64Value(value: string) {
  const normalized = value.replace(/\s+/g, "");

  if (!normalized) {
    return { value: "", bytes: 0, isText: true };
  }

  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normalized) || normalized.length % 4 !== 0) {
    throw new Error("Invalid standard base64 encoding.");
  }

  let binary = "";
  try {
    binary = atob(normalized);
  } catch {
    throw new Error("Invalid standard base64 encoding.");
  }

  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return { value: text, bytes: bytes.length, isText: true };
  } catch {
    const preview = Array.from(bytes.slice(0, 96))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join(" ");
    const suffix = bytes.length > 96 ? " …" : "";
    return {
      value: `[binary data: ${bytes.length} bytes]\nhex: ${preview}${suffix}`,
      bytes: bytes.length,
      isText: false,
    };
  }
}

function formatSecretResult(result: SecretResult, maskValues: boolean) {
  const lines = [
    "Kubernetes Secret review",
    "",
    `apiVersion: ${result.apiVersion || "not found"}`,
    `kind: ${result.kind || "not found"}`,
    `name: ${result.name || "not found"}`,
    `namespace: ${result.namespace || "not specified"}`,
    `type: ${result.secretType || "not specified"}`,
    "",
  ];

  for (const entry of result.entries) {
    lines.push(`[${entry.source}] ${entry.key}`);
    if (entry.error) {
      lines.push(`ERROR: ${entry.error}`);
    } else {
      lines.push(maskValues ? maskSecretValue(entry.decodedValue, entry.bytes) : entry.decodedValue);
    }
    lines.push("");
  }

  if (result.notes.length) {
    lines.push("Review notes:");
    result.notes.forEach((note) => lines.push(`- ${note}`));
  }

  return lines.join("\n").trim();
}

function maskSecretValue(value: string, bytes?: number) {
  if (!value) return "(empty value)";
  const size = bytes ?? new TextEncoder().encode(value).length;
  return `•••••••• (${size} bytes hidden)`;
}

function cleanYamlScalar(value: string) {
  const trimmed = stripInlineComment(value.trim());
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function stripInlineComment(value: string) {
  let single = false;
  let double = false;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (char === "'" && !double) single = !single;
    if (char === '"' && !single && value[index - 1] !== "\\") double = !double;
    if (char === "#" && !single && !double && (index === 0 || /\s/.test(value[index - 1]))) {
      return value.slice(0, index).trimEnd();
    }
  }

  return value;
}

function countIndent(line: string) {
  const match = line.match(/^ */);
  return match ? match[0].length : 0;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 break-words font-mono text-base font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function Question({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600 leading-relaxed">{children}</p>
    </div>
  );
}
