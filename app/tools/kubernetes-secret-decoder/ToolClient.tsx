"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

type DecodedSecret = {
  key: string;
  value: string;
};

const sampleSecret = `apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
data:
  username: YWRtaW4=
  password: c2VjcmV0MTIz
  api_key: eW9yeWFudHJhLWtleQ==`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const decodeSecret = () => {
    if (!input.trim()) {
      setError("Please enter Kubernetes Secret YAML content to decode.");
      setOutput("");
      return;
    }

    try {
      const decodedValues = decodeKubernetesSecret(input);
      setOutput(formatDecodedValues(decodedValues));
      setError("");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to decode this Kubernetes Secret.";

      setError(message);
      setOutput("");
    }
  };

  const loadExample = () => {
    setInput(sampleSecret);
    setOutput("");
    setError("");
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="Kubernetes Secret Decoder"
      description="Decode Kubernetes Secret YAML values, inspect base64 encoded data, and review secret content in your browser."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Kubernetes Secret YAML
        </label>

        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={sampleSecret}
          className="w-full min-h-[260px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={decodeSecret} className="yoryantra-btn">
          Decode Secret
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

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Decoded Secret Values
          </h3>

          {output && (
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[220px] whitespace-pre-wrap break-words">
          {output || "Decoded Kubernetes Secret values will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Kubernetes Secrets are base64 encoded, not encrypted by default. Be
        careful when decoding real secret values and avoid sharing sensitive
        output.
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Decoding Kubernetes Secret YAML Values Before Deployment
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Kubernetes Secrets often store values such as usernames, passwords,
            tokens, API keys, and configuration data in base64 encoded form.
            When reviewing a Kubernetes Secret YAML file, it is useful to decode
            the values and confirm what will actually be used by the application.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Kubernetes Secret Decoder helps you decode Kubernetes Secret
            data values, inspect base64 encoded content, and review secret keys
            directly in your browser before using them in clusters, deployments,
            or DevOps configuration.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reviewing K8s Secret Data in the Browser
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste Kubernetes Secret YAML content into the input box.</li>
            <li>
              Click <strong>Decode Secret</strong>.
            </li>
            <li>Review the decoded key-value output.</li>
            <li>Use the result to check secret values carefully before deployment.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Kubernetes Secret Decoder Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Decoding Kubernetes Secret YAML during local review.</li>
            <li>Checking base64 encoded usernames, passwords, or tokens.</li>
            <li>Reviewing secret values before applying manifests.</li>
            <li>Debugging application configuration that reads from Kubernetes Secrets.</li>
            <li>Checking whether copied secret data was encoded correctly.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Kubernetes Secret YAML
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{sampleSecret}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What does a Kubernetes Secret Decoder do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A Kubernetes Secret Decoder reads the <strong>data</strong>
                section from a Secret YAML file and decodes base64 encoded
                values into readable text.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are Kubernetes Secrets encrypted?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Kubernetes Secret values are base64 encoded by default. Base64
                is not encryption. Actual protection depends on cluster
                configuration, access controls, and encryption settings.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this tool decode stringData values?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                The <strong>stringData</strong> section already contains plain
                text values, so this tool focuses on decoding values inside the
                <strong>data</strong> section.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my Kubernetes Secret uploaded to a server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The Kubernetes Secret decoding happens directly in your
                browser. Your YAML content and decoded values are not uploaded
                to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/kubernetes-yaml-validator"
              className="yoryantra-btn-outline"
            >
              Kubernetes YAML Validator
            </Link>

            <Link
              href="/tools/yaml-validator"
              className="yoryantra-btn-outline"
            >
              YAML Validator
            </Link>

            <Link
              href="/tools/base64-encoder-decoder"
              className="yoryantra-btn-outline"
            >
              Base64 Encoder Decoder
            </Link>

            <Link
              href="/tools/docker-compose-validator"
              className="yoryantra-btn-outline"
            >
              Docker Compose Validator
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function decodeKubernetesSecret(source: string) {
  const lines = source.split(/\r?\n/);
  const decodedValues: DecodedSecret[] = [];
  let insideData = false;
  let dataIndent = -1;

  const kindLine = lines.find((line) => line.trim().toLowerCase().startsWith("kind:"));

  if (kindLine && !/kind:\s*secret/i.test(kindLine.trim())) {
    throw new Error("This YAML does not look like a Kubernetes Secret.");
  }

  for (const line of lines) {
    const rawLine = line.replace(/\t/g, "  ");
    const trimmed = rawLine.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const indent = countIndent(rawLine);

    if (/^data:\s*$/i.test(trimmed)) {
      insideData = true;
      dataIndent = indent;
      continue;
    }

    if (insideData && indent <= dataIndent && /^[A-Za-z0-9_-]+:\s*/.test(trimmed)) {
      insideData = false;
    }

    if (!insideData) {
      continue;
    }

    const match = trimmed.match(/^([A-Za-z0-9_.-]+):\s*(.+)$/);

    if (!match) {
      continue;
    }

    const key = match[1];
    const encodedValue = cleanYamlValue(match[2]);

    if (!encodedValue) {
      decodedValues.push({
        key,
        value: "",
      });

      continue;
    }

    try {
      decodedValues.push({
        key,
        value: decodeBase64(encodedValue),
      });
    } catch {
      throw new Error(
        `Unable to decode value for "${key}". Make sure it is valid base64 content.`
      );
    }
  }

  if (!decodedValues.length) {
    throw new Error("No decodable values were found inside the data section.");
  }

  return decodedValues;
}

function formatDecodedValues(values: DecodedSecret[]) {
  const output = [
    "Decoded Kubernetes Secret values",
    "",
    ...values.map((item) => `${item.key}: ${item.value}`),
    "",
    `Decoded ${values.length} value${values.length === 1 ? "" : "s"}.`,
  ];

  return output.join("\n");
}

function decodeBase64(value: string) {
  const normalized = value.trim();

  if (!/^[A-Za-z0-9+/=]+$/.test(normalized)) {
    throw new Error("Invalid base64 value.");
  }

  try {
    return decodeURIComponent(
      Array.from(atob(normalized))
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join("")
    );
  } catch {
    return atob(normalized);
  }
}

function cleanYamlValue(value: string) {
  return value
    .trim()
    .replace(/^["']/, "")
    .replace(/["']$/, "")
    .split("#")[0]
    .trim();
}

function countIndent(line: string) {
  const match = line.match(/^ */);
  return match ? match[0].length : 0;
}
