"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "matrix" | "job" | "json";
type MatrixAxis = {
  id: number;
  name: string;
  values: string;
  enabled: boolean;
};

type MatrixRule = {
  id: number;
  values: string;
  enabled: boolean;
};

type MatrixCombination = Record<string, string>;

type MatrixResult = {
  axes: MatrixAxis[];
  includeRules: MatrixCombination[];
  excludeRules: MatrixCombination[];
  combinations: MatrixCombination[];
  finalCombinations: MatrixCombination[];
  totalBeforeExclude: number;
  totalAfterExclude: number;
  yaml: string;
  jobYaml: string;
  json: string;
};

type MatrixNote = {
  title: string;
  message: string;
};

const defaultAxes: MatrixAxis[] = [
  {
    id: 1,
    name: "os",
    values: "ubuntu-latest, windows-latest, macos-latest",
    enabled: true,
  },
  {
    id: 2,
    name: "node-version",
    values: "20, 22",
    enabled: true,
  },
];

const defaultIncludeRules: MatrixRule[] = [
  {
    id: 1,
    values: "os=ubuntu-latest,node-version=22,experimental=true",
    enabled: false,
  },
];

const defaultExcludeRules: MatrixRule[] = [
  {
    id: 1,
    values: "os=windows-latest,node-version=20",
    enabled: false,
  },
];

export default function ToolClient() {
  const [axes, setAxes] = useState<MatrixAxis[]>([
    {
      id: 1,
      name: "",
      values: "",
      enabled: true,
    },
  ]);
  const [includeRules, setIncludeRules] = useState<MatrixRule[]>([]);
  const [excludeRules, setExcludeRules] = useState<MatrixRule[]>([]);
  const [outputMode, setOutputMode] = useState<OutputMode>("matrix");
  const [jobName, setJobName] = useState("test");
  const [runnerExpression, setRunnerExpression] = useState("${{ matrix.os }}");
  const [failFast, setFailFast] = useState(true);
  const [maxParallel, setMaxParallel] = useState("");
  const [sortAxes, setSortAxes] = useState(false);
  const [quoteValues, setQuoteValues] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildMatrixResult({
        axes,
        includeRules,
        excludeRules,
        jobName,
        runnerExpression,
        failFast,
        maxParallel,
        sortAxes,
        quoteValues,
      }),
    [
      axes,
      includeRules,
      excludeRules,
      jobName,
      runnerExpression,
      failFast,
      maxParallel,
      sortAxes,
      quoteValues,
    ]
  );

  const output = useMemo(() => {
    if (outputMode === "json") {
      return result.json;
    }

    if (outputMode === "job") {
      return result.jobYaml;
    }

    return result.yaml;
  }, [outputMode, result]);

  const notes = useMemo(() => getMatrixNotes(result), [result]);

  const addAxis = () => {
    setAxes((current) => [
      ...current,
      {
        id: Date.now(),
        name: "",
        values: "",
        enabled: true,
      },
    ]);
    setCopied(false);
  };

  const updateAxis = (
    id: number,
    field: keyof Omit<MatrixAxis, "id">,
    value: string | boolean
  ) => {
    setAxes((current) =>
      current.map((axis) =>
        axis.id === id
          ? {
              ...axis,
              [field]: value,
            }
          : axis
      )
    );
    setCopied(false);
  };

  const removeAxis = (id: number) => {
    setAxes((current) => {
      const next = current.filter((axis) => axis.id !== id);

      return next.length > 0
        ? next
        : [
            {
              id: Date.now(),
              name: "",
              values: "",
              enabled: true,
            },
          ];
    });
    setCopied(false);
  };

  const addIncludeRule = () => {
    setIncludeRules((current) => [
      ...current,
      {
        id: Date.now(),
        values: "",
        enabled: true,
      },
    ]);
    setCopied(false);
  };

  const addExcludeRule = () => {
    setExcludeRules((current) => [
      ...current,
      {
        id: Date.now(),
        values: "",
        enabled: true,
      },
    ]);
    setCopied(false);
  };

  const updateRule = (
    type: "include" | "exclude",
    id: number,
    field: keyof Omit<MatrixRule, "id">,
    value: string | boolean
  ) => {
    const updater = (current: MatrixRule[]) =>
      current.map((rule) =>
        rule.id === id
          ? {
              ...rule,
              [field]: value,
            }
          : rule
      );

    if (type === "include") {
      setIncludeRules(updater);
    } else {
      setExcludeRules(updater);
    }

    setCopied(false);
  };

  const removeRule = (type: "include" | "exclude", id: number) => {
    if (type === "include") {
      setIncludeRules((current) => current.filter((rule) => rule.id !== id));
    } else {
      setExcludeRules((current) => current.filter((rule) => rule.id !== id));
    }

    setCopied(false);
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
    setAxes(defaultAxes);
    setIncludeRules(defaultIncludeRules);
    setExcludeRules(defaultExcludeRules);
    setOutputMode("matrix");
    setJobName("test");
    setRunnerExpression("${{ matrix.os }}");
    setFailFast(true);
    setMaxParallel("");
    setSortAxes(false);
    setQuoteValues(false);
    setCopied(false);
  };

  const resetAll = () => {
    setAxes([
      {
        id: 1,
        name: "",
        values: "",
        enabled: true,
      },
    ]);
    setIncludeRules([]);
    setExcludeRules([]);
    setOutputMode("matrix");
    setJobName("test");
    setRunnerExpression("${{ matrix.os }}");
    setFailFast(true);
    setMaxParallel("");
    setSortAxes(false);
    setQuoteValues(false);
    setCopied(false);
  };

  return (
    <ToolShell
      title="GitHub Actions Matrix Builder"
      description="Build GitHub Actions strategy matrix YAML for OS runners, language versions, include rules, exclude rules, fail-fast, and max-parallel settings directly in your browser."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Matrix Axes
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Add each matrix axis as a name and comma-separated values.
            </p>
          </div>

          <button onClick={addAxis} className="yoryantra-btn-outline">
            Add Axis
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {axes.map((axis, index) => (
            <div
              key={axis.id}
              className="grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 md:grid-cols-[auto_1fr_2fr_auto]"
            >
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={axis.enabled}
                  onChange={(event) =>
                    updateAxis(axis.id, "enabled", event.target.checked)
                  }
                  className="h-4 w-4 accent-[var(--light-gold)]"
                />

                <span>{index + 1}</span>
              </label>

              <input
                value={axis.name}
                onChange={(event) =>
                  updateAxis(axis.id, "name", event.target.value)
                }
                placeholder="os"
                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />

              <input
                value={axis.values}
                onChange={(event) =>
                  updateAxis(axis.id, "values", event.target.value)
                }
                placeholder="ubuntu-latest, windows-latest, macos-latest"
                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />

              <button
                onClick={() => removeAxis(axis.id)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
          Examples: <span className="font-mono text-gray-900">os</span>,{" "}
          <span className="font-mono text-gray-900">node-version</span>,{" "}
          <span className="font-mono text-gray-900">python-version</span>,{" "}
          <span className="font-mono text-gray-900">package-manager</span>.
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <RuleSection
          title="Include Rules"
          description="Add extra matrix combinations or add fields to a specific combination."
          buttonText="Add Include Rule"
          rules={includeRules}
          onAdd={addIncludeRule}
          onUpdate={(id, field, value) => updateRule("include", id, field, value)}
          onRemove={(id) => removeRule("include", id)}
          placeholder="os=ubuntu-latest,node-version=22,experimental=true"
        />

        <RuleSection
          title="Exclude Rules"
          description="Remove specific matrix combinations from the final result."
          buttonText="Add Exclude Rule"
          rules={excludeRules}
          onAdd={addExcludeRule}
          onUpdate={(id, field, value) => updateRule("exclude", id, field, value)}
          onRemove={(id) => removeRule("exclude", id)}
          placeholder="os=windows-latest,node-version=20"
        />
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Output Options
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value) => {
              setOutputMode(value as OutputMode);
              setCopied(false);
            }}
            options={[
              {
                label: "Matrix YAML",
                value: "matrix",
              },
              {
                label: "Full job YAML",
                value: "job",
              },
              {
                label: "JSON",
                value: "json",
              },
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Job Name
            </label>

            <input
              value={jobName}
              onChange={(event) => {
                setJobName(event.target.value);
                setCopied(false);
              }}
              placeholder="test"
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              runs-on
            </label>

            <input
              value={runnerExpression}
              onChange={(event) => {
                setRunnerExpression(event.target.value);
                setCopied(false);
              }}
              placeholder="${{ matrix.os }}"
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <div className="min-h-[116px] rounded-xl border border-gray-200 bg-white p-4">
            <label className="block text-sm font-medium text-gray-900">
              Max Parallel
            </label>

            <input
              value={maxParallel}
              onChange={(event) => {
                setMaxParallel(event.target.value);
                setCopied(false);
              }}
              placeholder="optional"
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
          </div>

          <label className="flex min-h-[116px] cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={failFast}
              onChange={(event) => {
                setFailFast(event.target.checked);
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Fail fast
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Stop queued matrix jobs after one failure.
              </span>
            </span>
          </label>

          <label className="flex min-h-[116px] cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={sortAxes}
              onChange={(event) => {
                setSortAxes(event.target.checked);
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Sort axes
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Sort matrix axes alphabetically.
              </span>
            </span>
          </label>

          <label className="flex min-h-[116px] cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={quoteValues}
              onChange={(event) => {
                setQuoteValues(event.target.checked);
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Quote values
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Wrap matrix values in YAML quotes.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={copyOutput} className="yoryantra-btn" disabled={!output}>
          {copied ? "Copied" : "Copy Output"}
        </button>

        <button onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Axes"
          value={result.axes.length.toLocaleString()}
        />
        <SummaryCard
          label="Before Exclude"
          value={result.totalBeforeExclude.toLocaleString()}
        />
        <SummaryCard
          label="Final Jobs"
          value={result.totalAfterExclude.toLocaleString()}
        />
        <SummaryCard
          label="Include Rules"
          value={result.includeRules.length.toLocaleString()}
        />
      </div>

      {result.finalCombinations.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Matrix Combinations
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            The combinations this matrix will create after exclude rules are
            applied.
          </p>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">#</th>
                  {Object.keys(result.finalCombinations[0] || {}).map((key) => (
                    <th key={key} className="px-4 py-3 font-semibold">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {result.finalCombinations.slice(0, 50).map((combination, index) => (
                  <tr key={`combo-${index}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {index + 1}
                    </td>

                    {Object.keys(result.finalCombinations[0] || {}).map((key) => (
                      <td
                        key={`combo-${index}-${key}`}
                        className="px-4 py-3 font-mono text-xs text-gray-700"
                      >
                        {combination[key] || ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.finalCombinations.length > 50 && (
            <p className="mt-3 text-sm text-gray-500">
              Showing the first 50 combinations only. Copy JSON output to inspect
              the full list.
            </p>
          )}
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Matrix notes
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
            Matrix Output
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

        <pre className="yoryantra-output overflow-auto text-sm min-h-[340px] whitespace-pre-wrap break-words">
          {output || "GitHub Actions matrix output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Matrix building happens directly in your browser. The values you enter
        are not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Building GitHub Actions Matrix YAML
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            GitHub Actions matrix jobs are useful when you need to test the same
            workflow across multiple operating systems, language versions, or
            package managers. But writing the matrix by hand can become messy
            once include and exclude rules are added.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This GitHub Actions Matrix Builder helps you create a strategy matrix
            from simple rows. Add axes, values, include rules, exclude rules,
            fail-fast, and max-parallel settings, then copy clean YAML for your
            workflow file.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Creating a Matrix for CI Jobs
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Add matrix axes such as os, node-version, or python-version.</li>
            <li>Enter comma-separated values for each axis.</li>
            <li>Add include or exclude rules when certain combinations need changes.</li>
            <li>Choose matrix-only YAML or a full job snippet.</li>
            <li>Copy the output into your GitHub Actions workflow file.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common GitHub Actions Matrix Builder Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Testing a Node project across multiple Node versions.</li>
            <li>Running a workflow across Ubuntu, Windows, and macOS.</li>
            <li>Building Python CI jobs across several Python versions.</li>
            <li>Excluding unsupported operating system and version pairs.</li>
            <li>Adding experimental jobs with include rules.</li>
            <li>Limiting matrix concurrency with max-parallel.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Matrix Output
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`strategy:
  fail-fast: true
  matrix:
    os:
      - ubuntu-latest
      - windows-latest
    node-version:
      - 20
      - 22`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Keep Matrix Size Practical
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Every axis multiplies the number of jobs. Three operating systems
            and four language versions already create twelve jobs. Add another
            axis and the count can grow quickly.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Use exclude rules, max-parallel, or smaller version lists when a
            matrix becomes too expensive or too slow for normal pull request
            checks.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is a GitHub Actions matrix?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A matrix lets one job run multiple times with different values,
                such as operating systems, Node versions, or Python versions.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What does include do in a matrix?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Include adds extra combinations or extra fields to a specific
                combination in the matrix.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What does exclude do in a matrix?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Exclude removes specific combinations, such as one unsupported OS
                and language version pair.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this validate the full workflow?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. This tool builds the matrix YAML. Use the GitHub Actions YAML
                Validator to review the full workflow structure.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are my matrix values uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Matrix generation happens directly in your browser, and your
                values are not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/github-actions-yaml-validator" className="yoryantra-btn-outline">
              GitHub Actions YAML Validator
            </Link>

            <Link href="/tools/yaml-validator" className="yoryantra-btn-outline">
              YAML Validator
            </Link>

            <Link href="/tools/dockerfile-linter" className="yoryantra-btn-outline">
              Dockerfile Linter
            </Link>

            <Link href="/tools/docker-compose-validator" className="yoryantra-btn-outline">
              Docker Compose Validator
            </Link>

            <Link href="/tools/environment-variable-diff-checker" className="yoryantra-btn-outline">
              Environment Variable Diff Checker
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function RuleSection({
  title,
  description,
  buttonText,
  rules,
  onAdd,
  onUpdate,
  onRemove,
  placeholder,
}: {
  title: string;
  description: string;
  buttonText: string;
  rules: MatrixRule[];
  onAdd: () => void;
  onUpdate: (
    id: number,
    field: keyof Omit<MatrixRule, "id">,
    value: string | boolean
  ) => void;
  onRemove: (id: number) => void;
  placeholder: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>

          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>

        <button onClick={onAdd} className="yoryantra-btn-outline whitespace-nowrap px-4 py-2">
          {buttonText}
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {rules.length === 0 ? (
          <p className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
            No rules added.
          </p>
        ) : (
          rules.map((rule, index) => (
            <div
              key={rule.id}
              className="grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 md:grid-cols-[auto_1fr_auto]"
            >
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={rule.enabled}
                  onChange={(event) =>
                    onUpdate(rule.id, "enabled", event.target.checked)
                  }
                  className="h-4 w-4 accent-[var(--light-gold)]"
                />

                <span>{index + 1}</span>
              </label>

              <input
                value={rule.values}
                onChange={(event) =>
                  onUpdate(rule.id, "values", event.target.value)
                }
                placeholder={placeholder}
                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />

              <button
                onClick={() => onRemove(rule.id)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
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

function buildMatrixResult({
  axes,
  includeRules,
  excludeRules,
  jobName,
  runnerExpression,
  failFast,
  maxParallel,
  sortAxes,
  quoteValues,
}: {
  axes: MatrixAxis[];
  includeRules: MatrixRule[];
  excludeRules: MatrixRule[];
  jobName: string;
  runnerExpression: string;
  failFast: boolean;
  maxParallel: string;
  sortAxes: boolean;
  quoteValues: boolean;
}): MatrixResult {
  const enabledAxes = axes
    .filter((axis) => axis.enabled)
    .filter((axis) => axis.name.trim() && axis.values.trim())
    .map((axis) => ({
      ...axis,
      name: axis.name.trim(),
      values: axis.values,
    }));

  const finalAxes = sortAxes
    ? [...enabledAxes].sort((a, b) => a.name.localeCompare(b.name))
    : enabledAxes;

  const combinations = buildCombinations(finalAxes);
  const parsedIncludeRules = includeRules
    .filter((rule) => rule.enabled && rule.values.trim())
    .map((rule) => parseRule(rule.values));
  const parsedExcludeRules = excludeRules
    .filter((rule) => rule.enabled && rule.values.trim())
    .map((rule) => parseRule(rule.values));

  const afterExclude = combinations.filter(
    (combination) =>
      !parsedExcludeRules.some((rule) => doesRuleMatch(combination, rule))
  );
  const finalCombinations = [...afterExclude, ...parsedIncludeRules];

  const yaml = buildMatrixYaml({
    axes: finalAxes,
    includeRules: parsedIncludeRules,
    excludeRules: parsedExcludeRules,
    failFast,
    maxParallel,
    quoteValues,
  });

  const jobYaml = buildJobYaml({
    jobName: jobName.trim() || "test",
    runnerExpression: runnerExpression.trim() || "${{ matrix.os }}",
    matrixYaml: yaml,
  });

  return {
    axes: finalAxes,
    includeRules: parsedIncludeRules,
    excludeRules: parsedExcludeRules,
    combinations,
    finalCombinations,
    totalBeforeExclude: combinations.length,
    totalAfterExclude: finalCombinations.length,
    yaml,
    jobYaml,
    json: JSON.stringify(
      {
        axes: finalAxes.map((axis) => ({
          name: axis.name,
          values: splitValues(axis.values),
        })),
        include: parsedIncludeRules,
        exclude: parsedExcludeRules,
        totalBeforeExclude: combinations.length,
        totalAfterExclude: finalCombinations.length,
        combinations: finalCombinations,
      },
      null,
      2
    ),
  };
}

function buildCombinations(axes: MatrixAxis[]): MatrixCombination[] {
  if (axes.length === 0) {
    return [];
  }

  return axes.reduce<MatrixCombination[]>((current, axis) => {
    const values = splitValues(axis.values);

    if (current.length === 0) {
      return values.map((value) => ({
        [axis.name]: value,
      }));
    }

    return current.flatMap((combination) =>
      values.map((value) => ({
        ...combination,
        [axis.name]: value,
      }))
    );
  }, []);
}

function splitValues(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseRule(value: string): MatrixCombination {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .reduce<MatrixCombination>((acc, pair) => {
      const equalsIndex = pair.indexOf("=");

      if (equalsIndex === -1) {
        return acc;
      }

      const key = pair.slice(0, equalsIndex).trim();
      const itemValue = pair.slice(equalsIndex + 1).trim();

      if (key) {
        acc[key] = itemValue;
      }

      return acc;
    }, {});
}

function doesRuleMatch(
  combination: MatrixCombination,
  rule: MatrixCombination
) {
  return Object.entries(rule).every(([key, value]) => combination[key] === value);
}

function buildMatrixYaml({
  axes,
  includeRules,
  excludeRules,
  failFast,
  maxParallel,
  quoteValues,
}: {
  axes: MatrixAxis[];
  includeRules: MatrixCombination[];
  excludeRules: MatrixCombination[];
  failFast: boolean;
  maxParallel: string;
  quoteValues: boolean;
}) {
  const lines = ["strategy:", `  fail-fast: ${failFast ? "true" : "false"}`];

  if (maxParallel.trim()) {
    lines.push(`  max-parallel: ${maxParallel.trim()}`);
  }

  lines.push("  matrix:");

  if (axes.length === 0) {
    lines.push("    # Add at least one matrix axis");
  }

  axes.forEach((axis) => {
    lines.push(`    ${axis.name}:`);
    splitValues(axis.values).forEach((value) => {
      lines.push(`      - ${formatYamlValue(value, quoteValues)}`);
    });
  });

  if (includeRules.length > 0) {
    lines.push("    include:");
    includeRules.forEach((rule) => {
      const entries = Object.entries(rule);
      entries.forEach(([key, value], index) => {
        if (index === 0) {
          lines.push(`      - ${key}: ${formatYamlValue(value, quoteValues)}`);
        } else {
          lines.push(`        ${key}: ${formatYamlValue(value, quoteValues)}`);
        }
      });
    });
  }

  if (excludeRules.length > 0) {
    lines.push("    exclude:");
    excludeRules.forEach((rule) => {
      const entries = Object.entries(rule);
      entries.forEach(([key, value], index) => {
        if (index === 0) {
          lines.push(`      - ${key}: ${formatYamlValue(value, quoteValues)}`);
        } else {
          lines.push(`        ${key}: ${formatYamlValue(value, quoteValues)}`);
        }
      });
    });
  }

  return lines.join("\n");
}

function buildJobYaml({
  jobName,
  runnerExpression,
  matrixYaml,
}: {
  jobName: string;
  runnerExpression: string;
  matrixYaml: string;
}) {
  const indentedMatrix = matrixYaml
    .split("\n")
    .map((line) => `    ${line}`)
    .join("\n");

  return [
    "jobs:",
    `  ${jobName}:`,
    `    runs-on: ${runnerExpression}`,
    indentedMatrix,
    "    steps:",
    "      - name: Checkout repository",
    "        uses: actions/checkout@v4",
    "",
    "      - name: Run matrix job",
    "        run: echo \"Running matrix job\"",
  ].join("\n");
}

function formatYamlValue(value: string, quoteValues: boolean) {
  const needsQuote =
    quoteValues ||
    value.includes(":") ||
    value.includes("#") ||
    value.includes("{") ||
    value.includes("}") ||
    value === "true" ||
    value === "false" ||
    value === "null";

  if (!needsQuote) {
    return value;
  }

  return `"${value.replace(/"/g, '\\"')}"`;
}

function getMatrixNotes(result: MatrixResult): MatrixNote[] {
  const notes: MatrixNote[] = [];

  if (result.axes.length === 0) {
    notes.push({
      title: "No matrix axes",
      message:
        "Add at least one axis such as os, node-version, or python-version.",
    });
  }

  if (result.totalAfterExclude > 20) {
    notes.push({
      title: "Large matrix",
      message:
        "This matrix creates more than 20 jobs. That may slow down pull request checks or use more CI minutes.",
    });
  }

  if (result.excludeRules.length > 0 && result.totalBeforeExclude === result.totalAfterExclude) {
    notes.push({
      title: "Exclude rules may not match",
      message:
        "Exclude rules were added, but the final job count did not change. Check whether the keys and values match the matrix axes.",
    });
  }

  if (result.includeRules.length > 0) {
    notes.push({
      title: "Include rules added",
      message:
        "Include rules can add extra combinations or fields that are not part of the base matrix.",
    });
  }

  if (result.axes.some((axis) => splitValues(axis.values).length === 1)) {
    notes.push({
      title: "Single-value axis",
      message:
        "One axis has only one value. That is valid, but it may not need to be part of the matrix.",
    });
  }

  return notes;
}
