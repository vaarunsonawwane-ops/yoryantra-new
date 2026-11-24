"use client";

import { useEffect, useMemo, useState } from "react";
import type { WorkflowPanelProps } from "../workflow-types";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
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

export default function EnvDiffPanel({ incoming }: WorkflowPanelProps) {
  const [leftInput, setLeftInput] = useState("");
  const [rightInput, setRightInput] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [hideSecretValues, setHideSecretValues] = useState(true);
  const [trimValues, setTrimValues] = useState(true);
  const [ignoreComments, setIgnoreComments] = useState(true);
  const [caseSensitiveKeys, setCaseSensitiveKeys] = useState(true);
  const [diffResult, setDiffResult] = useState<EnvDiffResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const output = useMemo(
    () => (diffResult ? formatEnvDiffOutput(diffResult, { outputMode, hideSecretValues }) : ""),
    [diffResult, outputMode, hideSecretValues]
  );

  const notes = useMemo(
    () => (diffResult ? getEnvNotes(diffResult) : []),
    [diffResult]
  );

  const compareEnvFiles = () => {
    if (!leftInput.trim() && !rightInput.trim()) {
      setError("Paste at least one .env block to compare.");
      setDiffResult(null);
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

      setDiffResult(nextDiff);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to compare these environment variables."
      );
      setDiffResult(null);
      setCopied(false);
    }
  };

  const copyOutput = async () => {
    if (!output) {
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setError("");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setError("The browser blocked clipboard access. Select and copy the diff output manually.");
    }
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
    setError("");
    setCopied(false);
  };

  useEffect(() => {
    if (!incoming) return;
    if (incoming.side === "b") setRightInput(incoming.value);
    else setLeftInput(incoming.value);
    setDiffResult(null);
    setError("");
    setCopied(false);
  }, [incoming]);

  return (
    <>
      <p className="mb-6 leading-relaxed text-gray-600">Compare dotenv assignments while surfacing missing keys, duplicate definitions, empty values, and secret-sensitive changes.</p>
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <label htmlFor="envdiffpanel-input-0" className="block mb-2 text-sm font-medium text-gray-700">
            Environment A
          </label>

          <textarea id="envdiffpanel-input-0"
            value={leftInput}
            onChange={(event) => {
              setLeftInput(event.target.value);
              setDiffResult(null);
              setError("");
              setCopied(false);
            }}
            placeholder={leftExample}
            spellCheck={false}
            className="w-full min-h-[340px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)] placeholder:text-gray-400 text-gray-900"
          />

          <p className="mt-2 text-sm text-gray-500">
            Paste your first .env file, local variables, staging variables, or
            old deployment variables.
          </p>
        </div>

        <div>
          <label htmlFor="envdiffpanel-input-1" className="block mb-2 text-sm font-medium text-gray-700">
            Environment B
          </label>

          <textarea id="envdiffpanel-input-1"
            value={rightInput}
            onChange={(event) => {
              setRightInput(event.target.value);
              setDiffResult(null);
              setError("");
              setCopied(false);
            }}
            placeholder={rightExample}
            spellCheck={false}
            className="w-full min-h-[340px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)] placeholder:text-gray-400 text-gray-900"
          />

          <p className="mt-2 text-sm text-gray-500">
            Paste the second .env file, production variables, CI variables, or
            new deployment variables.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Compare Options
        </h3>

        <div className="mt-4 max-w-44">
          <YoryantraSelect
            width="short"
            label="Output"
            value={outputMode}
            onChange={(value) => {
              setOutputMode(value as OutputMode);
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

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex cursor-pointer gap-3">
            <input
              type="checkbox"
              checked={hideSecretValues}
              onChange={(event) => {
                setHideSecretValues(event.target.checked);
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)] shrink-0"
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

          <label className="flex cursor-pointer gap-3">
            <input
              type="checkbox"
              checked={trimValues}
              onChange={(event) => {
                setTrimValues(event.target.checked);
                setDiffResult(null);
                setError("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)] shrink-0"
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

          <label className="flex cursor-pointer gap-3">
            <input
              type="checkbox"
              checked={ignoreComments}
              onChange={(event) => {
                setIgnoreComments(event.target.checked);
                setDiffResult(null);
                setError("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)] shrink-0"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Ignore comments
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Treat # outside quoted values as the start of a comment; full comment lines are always ignored.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer gap-3">
            <input
              type="checkbox"
              checked={caseSensitiveKeys}
              onChange={(event) => {
                setCaseSensitiveKeys(event.target.checked);
                setDiffResult(null);
                setError("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)] shrink-0"
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
        <button onClick={compareEnvFiles} className="yoryantra-btn min-h-10 whitespace-nowrap">
          Compare Environment Variables
        </button>

        <button onClick={loadExample} className="yoryantra-btn-outline min-h-10 whitespace-nowrap">
          Load Example
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline min-h-10 whitespace-nowrap">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {diffResult && (
        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
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
        <DiffTable diff={diffResult} hideSecretValues={hideSecretValues} />
      )}

      {diffResult &&
        (diffResult.leftDuplicates.length > 0 ||
          diffResult.rightDuplicates.length > 0 ||
          diffResult.leftEmpty.length > 0 ||
          diffResult.rightEmpty.length > 0) && (
          <div className="mt-8">
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
        <div className="mt-6 self-start">
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
              className="yoryantra-btn-outline min-h-10 whitespace-nowrap text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">
          {output || "Environment variable diff output will appear here."}
        </pre>
      </div>

      <section className="mt-12 space-y-10">
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
            Dotenv Syntax Is Not Universal
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            There is no single formal dotenv standard across every runtime. This parser follows the widely used assignment model: valid variable names, optional <code className="font-mono">export</code>, quoted multiline values, and comments outside quotes. Project-specific expansion such as <code className="font-mono">${"{VAR}"}</code> is compared as text rather than executed.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Node.js publishes a concrete dotenv grammar and parser behavior in its{" "}
            <a
              href="https://nodejs.org/api/environment_variables.html#dotenv"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-2"
            >
              environment variables documentation
            </a>
            . Compare against the runtime that actually loads your file when syntax compatibility matters.
          </p>
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
            Related Tools
          </h2>

          <div className="mt-4">

            <YoryantraRelatedTools presentation="links" currentHref="/tools/environment-variable-diff-checker" />

          </div>
        </div>
      </section>
    </>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>

      <div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}

function DiffTable({
  diff,
  hideSecretValues,
}: {
  diff: EnvDiffResult;
  hideSecretValues: boolean;
}) {
  const items = [...diff.added, ...diff.removed, ...diff.changed];
  const statusLabels = { added: "Added in B", removed: "Removed from B", changed: "Changed", same: "Same" };
  const statusColors = { added: "text-green-700", removed: "text-red-700", changed: "text-amber-800", same: "text-gray-700" };

  const renderValue = (key: string, value: string) => {
    const visibleValue = formatEnvValue(key, value, hideSecretValues);
    return visibleValue === "" ? '""' : visibleValue;
  };

  return (
    <section className="mt-8 min-w-0">
      <h3 className="text-lg font-semibold text-gray-900">Variable differences</h3>
      <p className="mt-2 text-sm text-gray-600">Added, removed and changed variables. A dash indicates an absent variable; empty values are shown as empty quotes.</p>
      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200" role="region" aria-label="Environment variable differences" tabIndex={0}>
        <table className="w-full min-w-[640px] table-fixed border-collapse text-left text-sm">
          <thead className="bg-gray-50 text-gray-900">
            <tr>
              <th scope="col" className="w-[24%] px-4 py-3 font-semibold">Variable</th>
              <th scope="col" className="w-[20%] px-4 py-3 font-semibold">Status</th>
              <th scope="col" className="w-[28%] px-4 py-3 font-semibold">Environment A</th>
              <th scope="col" className="w-[28%] px-4 py-3 font-semibold">Environment B</th>
            </tr>
          </thead>
          <tbody className="text-gray-900">
            {items.length === 0 ? (
              <tr><td colSpan={4} className="border-t border-gray-200 px-4 py-4 text-gray-600">No added, removed or changed variables.</td></tr>
            ) : items.map((item) => (
              <tr key={`${item.type}-${item.key}`} className="border-t border-gray-200 align-top">
                <th scope="row" className="px-4 py-3 break-words font-mono font-medium">{item.key}</th>
                <td className={`px-4 py-3 font-medium ${statusColors[item.type]}`}>{statusLabels[item.type]}</td>
                <td className="px-4 py-3 whitespace-pre-wrap break-words font-mono">{item.type === "added" ? "—" : renderValue(item.key, item.leftValue)}</td>
                <td className="px-4 py-3 whitespace-pre-wrap break-words font-mono">{item.type === "removed" ? "—" : renderValue(item.key, item.rightValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DetailList({ title, values }: { title: string; values: string[] }) {
  return (
    <div>
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
  const source = input.replace(/\r\n?/g, "\n");
  const variables: EnvVariable[] = [];
  let offset = 0;
  let line = 1;

  while (offset < source.length) {
    const lineStart = offset;
    const lineEnd = source.indexOf("\n", offset);
    const physicalEnd = lineEnd === -1 ? source.length : lineEnd;
    const rawLine = source.slice(lineStart, physicalEnd);
    const leadingTrimmed = rawLine.replace(/^\s+/, "");

    if (!leadingTrimmed || leadingTrimmed.startsWith("#")) {
      offset = lineEnd === -1 ? source.length : lineEnd + 1;
      line += 1;
      continue;
    }

    let cursor = lineStart;
    while (cursor < source.length && (source[cursor] === " " || source[cursor] === "\t")) {
      cursor += 1;
    }

    let exported = false;
    if (
      source.slice(cursor, cursor + 6) === "export" &&
      /\s/.test(source[cursor + 6] || "")
    ) {
      exported = true;
      cursor += 6;
      while (source[cursor] === " " || source[cursor] === "\t") cursor += 1;
    }

    const keyStart = cursor;
    while (cursor < source.length && /[A-Za-z0-9_]/.test(source[cursor])) cursor += 1;
    const key = source.slice(keyStart, cursor);

    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      throw new Error(`Line ${line}: invalid environment variable name.`);
    }

    while (source[cursor] === " " || source[cursor] === "\t") cursor += 1;
    if (source[cursor] !== "=") {
      throw new Error(`Line ${line}: expected "=" after ${key}.`);
    }
    cursor += 1;
    while (source[cursor] === " " || source[cursor] === "\t") cursor += 1;

    const valueStartLine = line;
    const quote =
      source[cursor] === '"' || source[cursor] === "'" || source[cursor] === "`"
        ? source[cursor]
        : null;
    let value = "";
    let quoted = Boolean(quote);

    if (quote) {
      cursor += 1;
      let closed = false;

      while (cursor < source.length) {
        const char = source[cursor];
        if (char === quote) {
          closed = true;
          cursor += 1;
          break;
        }
        value += char;
        if (char === "\n") line += 1;
        cursor += 1;
      }

      if (!closed) {
        throw new Error(`Line ${valueStartLine}: unterminated quoted value for ${key}.`);
      }

      while (source[cursor] === " " || source[cursor] === "\t") cursor += 1;
      if (
        cursor < source.length &&
        source[cursor] !== "\n" &&
        !(options.ignoreComments && source[cursor] === "#")
      ) {
        throw new Error(
          `Line ${line}: unexpected text after the quoted value for ${key}.`
        );
      }

      if (options.ignoreComments && source[cursor] === "#") {
        while (cursor < source.length && source[cursor] !== "\n") cursor += 1;
      }
    } else {
      const valueChars: string[] = [];
      while (cursor < source.length && source[cursor] !== "\n") {
        if (options.ignoreComments && source[cursor] === "#") break;
        valueChars.push(source[cursor]);
        cursor += 1;
      }
      value = valueChars.join("").replace(/[ \t]+$/, "");
    }

    if (options.trimValues) {
      value = value.trim();
    }

    const rawEnd = cursor < source.length && source[cursor] === "\n" ? cursor : cursor;
    variables.push({
      key,
      value,
      line: valueStartLine,
      raw: source.slice(lineStart, rawEnd),
      quoted,
      exported,
    });

    while (cursor < source.length && source[cursor] !== "\n") cursor += 1;
    if (cursor < source.length && source[cursor] === "\n") {
      cursor += 1;
      line += 1;
    }
    offset = cursor;
  }

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

function getLastValue(group: EnvGroup): string {
  return group.values[group.values.length - 1]?.value || "";
}

function normalizeKey(key: string, caseSensitiveKeys: boolean): string {
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

function findEmptyValues(groups: EnvGroup[]): string[] {
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

function isSecretKey(key: string): boolean {
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
