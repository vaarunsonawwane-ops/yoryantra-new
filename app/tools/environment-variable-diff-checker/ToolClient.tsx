"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "summary" | "json" | "patch";
type EnvVariable = {
  key: string;
  value: string;
  line: number;
  raw: string;
  quoted: boolean;
  exported: boolean;
};

type EnvGroup = {
  key: string;
  values: EnvVariable[];
};

type EnvDiff = {
  key: string;
  leftValue: string;
  rightValue: string;
  type: "added" | "removed" | "changed" | "same";
};

type DuplicateEnv = {
  key: string;
  count: number;
  values: string[];
};

type EnvDiffResult = {
  leftVariables: EnvGroup[];
  rightVariables: EnvGroup[];
  added: EnvDiff[];
  removed: EnvDiff[];
  changed: EnvDiff[];
  same: EnvDiff[];
  leftDuplicates: DuplicateEnv[];
  rightDuplicates: DuplicateEnv[];
  leftEmpty: string[];
  rightEmpty: string[];
  secretLikeKeys: string[];
};

type EnvNote = {
  title: string;
  message: string;
};

const leftExample = `# local .env
NODE_ENV=development
API_URL=https://api-dev.example.com
DATABASE_URL=postgres://localhost:5432/app
FEATURE_FLAGS=debug,beta
LOG_LEVEL=debug
EMPTY_VALUE=`;

const rightExample = `# production .env
NODE_ENV=production
API_URL=https://api.example.com
DATABASE_URL=postgres://prod.example.com:5432/app
FEATURE_FLAGS=beta
LOG_LEVEL=info
SENTRY_DSN=https://example@sentry.io/123`;

export default function ToolClient() {
  const [leftInput, setLeftInput] = useState("");
  const [rightInput, setRightInput] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [hideSecretValues, setHideSecretValues] = useState(true);
  const [trimValues, setTrimValues] = useState(true);
  const [ignoreComments, setIgnoreComments] = useState(true);
  const [caseSensitiveKeys, setCaseSensitiveKeys] = useState(true);
  const [diffResult, setDiffResult] = useState<EnvDiffResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(
    () => (diffResult ? getEnvNotes(diffResult) : []),
    [diffResult]
  );

  const compareEnvFiles = () => {
    if (!leftInput.trim() && !rightInput.trim()) {
      setError("Paste at least one .env block to compare.");
      setDiffResult(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const nextDiff = buildEnvDiff({
        leftInput,
        rightInput,
        trimValues,
        ignoreComments,
        caseSensitiveKeys,
      });

      const nextOutput = formatEnvDiffOutput(nextDiff, {
        outputMode,
        hideSecretValues,
      });

      setDiffResult(nextDiff);
      setOutput(nextOutput);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to compare these environment variables."
      );
      setDiffResult(null);
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
    setLeftInput(leftExample);
    setRightInput(rightExample);
    setOutputMode("summary");
    setHideSecretValues(true);
    setTrimValues(true);
    setIgnoreComments(true);
    setCaseSensitiveKeys(true);
    setDiffResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setLeftInput("");
    setRightInput("");
    setOutputMode("summary");
    setHideSecretValues(true);
    setTrimValues(true);
    setIgnoreComments(true);
    setCaseSensitiveKeys(true);
    setDiffResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="Environment Variable Diff Checker"
      description="Compare two .env files or environment variable blocks, find added, removed, changed, duplicate, empty, and secret-looking variables directly in your browser."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Environment A
          </label>

          <textarea
            value={leftInput}
            onChange={(event) => {
              setLeftInput(event.target.value);
              setDiffResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            placeholder={leftExample}
            className="w-full min-h-[340px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          <p className="mt-2 text-sm text-gray-500">
            Paste your first .env file, local variables, staging variables, or
            old deployment variables.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Environment B
          </label>

          <textarea
            value={rightInput}
            onChange={(event) => {
              setRightInput(event.target.value);
              setDiffResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            placeholder={rightExample}
            className="w-full min-h-[340px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          <p className="mt-2 text-sm text-gray-500">
            Paste the second .env file, production variables, CI variables, or
            new deployment variables.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Compare Options
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
                label: "Patch-style",
                value: "patch",
              },
            ]}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={hideSecretValues}
              onChange={(event) => {
                setHideSecretValues(event.target.checked);
                setOutput("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Hide secret values
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Hide values for keys that look like tokens, passwords, secrets,
                and API keys.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={trimValues}
              onChange={(event) => {
                setTrimValues(event.target.checked);
                setDiffResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Trim values
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Ignore extra spaces around values when comparing.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={ignoreComments}
              onChange={(event) => {
                setIgnoreComments(event.target.checked);
                setDiffResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Ignore comments
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Skip comment lines that start with #.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={caseSensitiveKeys}
              onChange={(event) => {
                setCaseSensitiveKeys(event.target.checked);
                setDiffResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Case-sensitive keys
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Treat API_URL and api_url as different variables.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={compareEnvFiles} className="yoryantra-btn">
          Compare Environment Variables
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

      {diffResult && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Added"
            value={diffResult.added.length.toLocaleString()}
          />
          <SummaryCard
            label="Removed"
            value={diffResult.removed.length.toLocaleString()}
          />
          <SummaryCard
            label="Changed"
            value={diffResult.changed.length.toLocaleString()}
          />
          <SummaryCard
            label="Same"
            value={diffResult.same.length.toLocaleString()}
          />
        </div>
      )}

      {diffResult && (
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <DiffColumn
            title="Added in B"
            description="Variables found in Environment B but not in Environment A."
            items={diffResult.added}
            valueKey="rightValue"
            hideSecretValues={hideSecretValues}
          />

          <DiffColumn
            title="Removed from B"
            description="Variables found in Environment A but missing from Environment B."
            items={diffResult.removed}
            valueKey="leftValue"
            hideSecretValues={hideSecretValues}
          />

          <DiffColumn
            title="Changed Values"
            description="Variables present in both environments with different values."
            items={diffResult.changed}
            valueKey="both"
            hideSecretValues={hideSecretValues}
          />
        </div>
      )}

      {diffResult &&
        (diffResult.leftDuplicates.length > 0 ||
          diffResult.rightDuplicates.length > 0 ||
          diffResult.leftEmpty.length > 0 ||
          diffResult.rightEmpty.length > 0) && (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="text-lg font-semibold text-gray-900">
              Extra Checks
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Duplicates and empty values can cause confusing deployment issues.
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <DetailList
                title="Environment A duplicates"
                values={diffResult.leftDuplicates.map(
                  (item) => `${item.key} (${item.count})`
                )}
              />

              <DetailList
                title="Environment B duplicates"
                values={diffResult.rightDuplicates.map(
                  (item) => `${item.key} (${item.count})`
                )}
              />

              <DetailList
                title="Environment A empty values"
                values={diffResult.leftEmpty}
              />

              <DetailList
                title="Environment B empty values"
                values={diffResult.rightEmpty}
              />
            </div>
          </div>
        )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Environment notes
          </h3>

          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-amber-900">
                  {note.title}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-amber-800">
                  {note.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Diff Output
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
          {output || "Environment variable diff output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Environment variable comparison happens directly in your browser. The
        values you paste are not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Comparing Environment Variables Before Deployment
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Environment variable differences are a common reason for broken
            deployments. A missing API URL, changed feature flag, empty secret,
            wrong database string, or duplicate key can make local, staging, and
            production behave differently.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Environment Variable Diff Checker compares two .env files or
            variable blocks and shows what was added, removed, changed, or kept
            the same. It also points out duplicates, empty values, and
            secret-looking keys so you can review risky changes before shipping.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Checking Two .env Files
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste the first environment block into Environment A.</li>
            <li>Paste the second environment block into Environment B.</li>
            <li>Choose whether comments, spaces, and key case should matter.</li>
            <li>Review added, removed, changed, duplicate, and empty variables.</li>
            <li>Copy the summary, JSON, or patch-style diff output.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Environment Variable Diff Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Comparing local and production .env files.</li>
            <li>Checking staging variables before a deployment.</li>
            <li>Comparing .env.example with a real .env file.</li>
            <li>Finding missing variables in CI/CD settings.</li>
            <li>Reviewing changed feature flags or API URLs.</li>
            <li>Finding duplicate keys and empty secret values.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Environment Difference
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Environment A:
NODE_ENV=development
API_URL=https://api-dev.example.com
LOG_LEVEL=debug

Environment B:
NODE_ENV=production
API_URL=https://api.example.com
LOG_LEVEL=info

Changed:
NODE_ENV
API_URL
LOG_LEVEL`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Be Careful With Secrets
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Environment files often contain database URLs, tokens, API keys,
            passwords, private endpoints, and service credentials. The tool hides
            secret-looking values by default in copied output.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Before sharing a diff in a ticket, chat, or screenshot, replace real
            values with safe examples. Keep production secrets out of public
            messages and documentation.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What does an environment variable diff checker do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It compares two .env files or variable blocks and shows which
                variables were added, removed, changed, or stayed the same.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this compare .env.example and .env?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Paste .env.example in one side and your .env file on the
                other side to check missing or changed variables.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this hide secrets?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Secret-looking values are hidden in copied output by default, but
                you should still avoid sharing real production secrets.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are my environment variables uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Comparison happens directly in your browser, and your values
                are not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/env-file-parser" className="yoryantra-btn-outline">
              .env File Parser
            </Link>

            <Link href="/tools/json-to-env-converter" className="yoryantra-btn-outline">
              JSON to ENV Converter
            </Link>

            <Link href="/tools/env-to-json-converter" className="yoryantra-btn-outline">
              ENV to JSON Converter
            </Link>

            <Link href="/tools/github-actions-yaml-validator" className="yoryantra-btn-outline">
              GitHub Actions YAML Validator
            </Link>

            <Link href="/tools/docker-compose-validator" className="yoryantra-btn-outline">
              Docker Compose Validator
            </Link>
          </div>
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

function DiffColumn({
  title,
  description,
  items,
  valueKey,
  hideSecretValues,
}: {
  title: string;
  description: string;
  items: EnvDiff[];
  valueKey: "leftValue" | "rightValue" | "both";
  hideSecretValues: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>

      <p className="mt-2 text-sm text-gray-500">{description}</p>

      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
            No items found.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={`${item.type}-${item.key}`}
              className="rounded-xl border border-gray-200 bg-gray-50 p-4"
            >
              <p className="font-mono text-sm font-semibold text-gray-900">
                {item.key}
              </p>

              {valueKey === "both" ? (
                <>
                  <p className="mt-2 break-words font-mono text-xs text-gray-600">
                    A: {formatEnvValue(item.key, item.leftValue, hideSecretValues)}
                  </p>

                  <p className="mt-1 break-words font-mono text-xs text-gray-600">
                    B: {formatEnvValue(item.key, item.rightValue, hideSecretValues)}
                  </p>
                </>
              ) : (
                <p className="mt-2 break-words font-mono text-xs text-gray-600">
                  {formatEnvValue(item.key, item[valueKey], hideSecretValues)}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function DetailList({ title, values }: { title: string; values: string[] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <h4 className="font-semibold text-gray-900">{title}</h4>

      {values.length === 0 ? (
        <p className="mt-2 text-sm text-gray-500">None found.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {values.map((value) => (
            <li key={value} className="font-mono text-sm text-gray-700">
              {value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function buildEnvDiff({
  leftInput,
  rightInput,
  trimValues,
  ignoreComments,
  caseSensitiveKeys,
}: {
  leftInput: string;
  rightInput: string;
  trimValues: boolean;
  ignoreComments: boolean;
  caseSensitiveKeys: boolean;
}): EnvDiffResult {
  const leftVariables = groupVariables(
    parseEnvBlock(leftInput, {
      trimValues,
      ignoreComments,
    }),
    caseSensitiveKeys
  );
  const rightVariables = groupVariables(
    parseEnvBlock(rightInput, {
      trimValues,
      ignoreComments,
    }),
    caseSensitiveKeys
  );

  const leftMap = new Map(leftVariables.map((item) => [normalizeKey(item.key, caseSensitiveKeys), item]));
  const rightMap = new Map(rightVariables.map((item) => [normalizeKey(item.key, caseSensitiveKeys), item]));
  const allKeys = Array.from(new Set([...leftMap.keys(), ...rightMap.keys()])).sort();

  const added: EnvDiff[] = [];
  const removed: EnvDiff[] = [];
  const changed: EnvDiff[] = [];
  const same: EnvDiff[] = [];

  allKeys.forEach((normalizedKey) => {
    const left = leftMap.get(normalizedKey);
    const right = rightMap.get(normalizedKey);
    const key = right?.key || left?.key || normalizedKey;

    if (!left && right) {
      added.push({
        key,
        leftValue: "",
        rightValue: getLastValue(right),
        type: "added",
      });
      return;
    }

    if (left && !right) {
      removed.push({
        key,
        leftValue: getLastValue(left),
        rightValue: "",
        type: "removed",
      });
      return;
    }

    if (left && right) {
      const leftValue = getLastValue(left);
      const rightValue = getLastValue(right);

      const diff: EnvDiff = {
        key,
        leftValue,
        rightValue,
        type: leftValue === rightValue ? "same" : "changed",
      };

      if (leftValue === rightValue) {
        same.push(diff);
      } else {
        changed.push(diff);
      }
    }
  });

  const secretLikeKeys = allKeys.filter((key) => isSecretKey(key));

  return {
    leftVariables,
    rightVariables,
    added,
    removed,
    changed,
    same,
    leftDuplicates: findDuplicates(leftVariables),
    rightDuplicates: findDuplicates(rightVariables),
    leftEmpty: findEmptyValues(leftVariables),
    rightEmpty: findEmptyValues(rightVariables),
    secretLikeKeys,
  };
}

function parseEnvBlock(
  input: string,
  options: {
    trimValues: boolean;
    ignoreComments: boolean;
  }
): EnvVariable[] {
  const variables: EnvVariable[] = [];

  input.replace(/\r\n/g, "\n").split("\n").forEach((line, index) => {
    const raw = line;
    const trimmed = line.trim();

    if (!trimmed) {
      return;
    }

    if (options.ignoreComments && trimmed.startsWith("#")) {
      return;
    }

    let workingLine = trimmed;
    let exported = false;

    if (workingLine.startsWith("export ")) {
      exported = true;
      workingLine = workingLine.slice("export ".length).trim();
    }

    const equalsIndex = workingLine.indexOf("=");

    if (equalsIndex === -1) {
      return;
    }

    const key = workingLine.slice(0, equalsIndex).trim();
    let value = workingLine.slice(equalsIndex + 1);
    const quoted =
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"));

    if (quoted) {
      value = value.slice(1, -1);
    }

    if (options.trimValues) {
      value = value.trim();
    }

    if (!key) {
      return;
    }

    variables.push({
      key,
      value,
      line: index + 1,
      raw,
      quoted,
      exported,
    });
  });

  return variables;
}

function groupVariables(
  variables: EnvVariable[],
  caseSensitiveKeys: boolean
): EnvGroup[] {
  const groups = new Map<string, EnvGroup>();

  variables.forEach((variable) => {
    const key = normalizeKey(variable.key, caseSensitiveKeys);
    const existing = groups.get(key);

    if (existing) {
      existing.values.push(variable);
      return;
    }

    groups.set(key, {
      key: variable.key,
      values: [variable],
    });
  });

  return Array.from(groups.values()).sort((a, b) => a.key.localeCompare(b.key));
}

function getLastValue(group: EnvGroup) {
  return group.values[group.values.length - 1]?.value || "";
}

function normalizeKey(key: string, caseSensitiveKeys: boolean) {
  return caseSensitiveKeys ? key : key.toLowerCase();
}

function findDuplicates(groups: EnvGroup[]): DuplicateEnv[] {
  return groups
    .filter((group) => group.values.length > 1)
    .map((group) => ({
      key: group.key,
      count: group.values.length,
      values: group.values.map((item) => item.value),
    }));
}

function findEmptyValues(groups: EnvGroup[]) {
  return groups
    .filter((group) => getLastValue(group) === "")
    .map((group) => group.key);
}

function formatEnvDiffOutput(
  diff: EnvDiffResult,
  options: {
    outputMode: OutputMode;
    hideSecretValues: boolean;
  }
) {
  if (options.outputMode === "json") {
    return JSON.stringify(
      {
        added: sanitizeDiffs(diff.added, options.hideSecretValues),
        removed: sanitizeDiffs(diff.removed, options.hideSecretValues),
        changed: sanitizeDiffs(diff.changed, options.hideSecretValues),
        same: sanitizeDiffs(diff.same, options.hideSecretValues),
        duplicates: {
          environmentA: sanitizeDuplicates(diff.leftDuplicates, options.hideSecretValues),
          environmentB: sanitizeDuplicates(diff.rightDuplicates, options.hideSecretValues),
        },
        emptyValues: {
          environmentA: diff.leftEmpty,
          environmentB: diff.rightEmpty,
        },
        counts: {
          added: diff.added.length,
          removed: diff.removed.length,
          changed: diff.changed.length,
          same: diff.same.length,
        },
      },
      null,
      2
    );
  }

  if (options.outputMode === "patch") {
    return [
      ...diff.removed.map(
        (item) =>
          `- ${item.key}=${formatEnvValue(
            item.key,
            item.leftValue,
            options.hideSecretValues
          )}`
      ),
      ...diff.added.map(
        (item) =>
          `+ ${item.key}=${formatEnvValue(
            item.key,
            item.rightValue,
            options.hideSecretValues
          )}`
      ),
      ...diff.changed.map(
        (item) =>
          `~ ${item.key}\n  A=${formatEnvValue(
            item.key,
            item.leftValue,
            options.hideSecretValues
          )}\n  B=${formatEnvValue(
            item.key,
            item.rightValue,
            options.hideSecretValues
          )}`
      ),
    ].join("\n");
  }

  return [
    "Environment Variable Diff",
    "-------------------------",
    `Added in B: ${diff.added.length}`,
    `Removed from B: ${diff.removed.length}`,
    `Changed values: ${diff.changed.length}`,
    `Same variables: ${diff.same.length}`,
    `Duplicates in A: ${diff.leftDuplicates.length}`,
    `Duplicates in B: ${diff.rightDuplicates.length}`,
    `Empty values in A: ${diff.leftEmpty.length}`,
    `Empty values in B: ${diff.rightEmpty.length}`,
    "",
    "Added in B:",
    ...formatDiffList(diff.added, "rightValue", options.hideSecretValues),
    "",
    "Removed from B:",
    ...formatDiffList(diff.removed, "leftValue", options.hideSecretValues),
    "",
    "Changed:",
    ...diff.changed.map(
      (item) =>
        `${item.key}\n  A=${formatEnvValue(
          item.key,
          item.leftValue,
          options.hideSecretValues
        )}\n  B=${formatEnvValue(
          item.key,
          item.rightValue,
          options.hideSecretValues
        )}`
    ),
  ].join("\n");
}

function formatDiffList(
  items: EnvDiff[],
  valueKey: "leftValue" | "rightValue",
  hideSecretValues: boolean
) {
  if (items.length === 0) {
    return ["(none)"];
  }

  return items.map(
    (item) =>
      `${item.key}=${formatEnvValue(item.key, item[valueKey], hideSecretValues)}`
  );
}

function sanitizeDiffs(items: EnvDiff[], hideSecretValues: boolean) {
  return items.map((item) => ({
    ...item,
    leftValue: formatEnvValue(item.key, item.leftValue, hideSecretValues),
    rightValue: formatEnvValue(item.key, item.rightValue, hideSecretValues),
  }));
}

function sanitizeDuplicates(items: DuplicateEnv[], hideSecretValues: boolean) {
  return items.map((item) => ({
    ...item,
    values: item.values.map((value) =>
      formatEnvValue(item.key, value, hideSecretValues)
    ),
  }));
}

function formatEnvValue(key: string, value: string, hideSecretValues: boolean) {
  if (hideSecretValues && isSecretKey(key)) {
    return "[hidden]";
  }

  return value;
}

function isSecretKey(key: string) {
  const normalized = key.toLowerCase();

  return (
    normalized.includes("secret") ||
    normalized.includes("token") ||
    normalized.includes("password") ||
    normalized.includes("passwd") ||
    normalized.includes("api_key") ||
    normalized.includes("apikey") ||
    normalized.includes("private_key") ||
    normalized.includes("database_url") ||
    normalized.includes("db_url") ||
    normalized.includes("dsn")
  );
}

function getEnvNotes(diff: EnvDiffResult): EnvNote[] {
  const notes: EnvNote[] = [];

  if (diff.removed.length > 0) {
    notes.push({
      title: "Variables removed",
      message:
        "Some variables exist in Environment A but not in Environment B. Check whether they are still required before deploying.",
    });
  }

  if (diff.changed.some((item) => isSecretKey(item.key))) {
    notes.push({
      title: "Secret-looking values changed",
      message:
        "One or more secret-looking variables changed. Keep real values hidden before sharing the diff.",
    });
  }

  if (diff.leftDuplicates.length > 0 || diff.rightDuplicates.length > 0) {
    notes.push({
      title: "Duplicate variables found",
      message:
        "Duplicate environment variable keys can be confusing because the last value usually wins.",
    });
  }

  if (diff.leftEmpty.length > 0 || diff.rightEmpty.length > 0) {
    notes.push({
      title: "Empty values found",
      message:
        "Some variables have empty values. That may be intentional, but it is worth checking before deployment.",
    });
  }

  if (diff.changed.some((item) => item.key.toLowerCase().includes("node_env"))) {
    notes.push({
      title: "NODE_ENV changed",
      message:
        "NODE_ENV affects app behavior, logging, builds, and dependencies. Review this change carefully.",
    });
  }

  return notes;
}
