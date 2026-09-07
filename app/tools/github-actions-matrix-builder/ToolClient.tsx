"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
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

type MatrixScalar = string | number | boolean | null;
type MatrixCombination = Record<string, MatrixScalar>;

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
  notes: MatrixNote[];
};

type MatrixNote = {
  severity: "info" | "warning" | "high";
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
  const [quoteValues, setQuoteValues] = useState(true);
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

  const notes = result.notes;
  const previewColumns = useMemo(() => {
    const columns: string[] = [];
    const seen = new Set<string>();
    result.finalCombinations.slice(0, 50).forEach((combination) => {
      Object.keys(combination).forEach((key) => {
        if (!seen.has(key)) {
          seen.add(key);
          columns.push(key);
        }
      });
    });
    return columns;
  }, [result.finalCombinations]);

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
    setQuoteValues(true);
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
    setQuoteValues(true);
    setCopied(false);
  };

  return (
    <ToolShell
      title="GitHub Actions Matrix Builder"
      description="Preview GitHub strategy combinations with accurate include/exclude expansion, scalar typing, concurrency, and job limits."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Matrix Axes
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Add each matrix axis as a name and comma-separated values. Quoted commas are supported.
            </p>
          </div>

          <button onClick={addAxis} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap">
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
                className="min-h-[44px] whitespace-nowrap rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
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
          <div className="self-start rounded-xl border border-gray-200 bg-white p-4">
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

          <label className="flex self-start cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
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

          <label className="flex self-start cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
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
                Alphabetize axes. GitHub uses axis order when creating matrix jobs.
              </span>
            </span>
          </label>

          <label className="flex self-start cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
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
                Keep values as strings
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Recommended for versions such as 3.10. Turn off only when you want YAML booleans, numbers, or null.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={copyOutput} className="yoryantra-btn min-h-[44px] whitespace-nowrap" disabled={!output}>
          {copied ? "Copied" : "Copy Output"}
        </button>

        <button onClick={loadExample} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap">
          Load Example
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap">
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
          value={result.totalAfterExclude < 0 ? "Not expanded" : result.totalAfterExclude.toLocaleString()}
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
            The combinations after exclude rules and GitHub-style include expansion.
          </p>

          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">#</th>
                  {previewColumns.map((key) => (
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

                    {previewColumns.map((key) => (
                      <td
                        key={`combo-${index}-${key}`}
                        className="px-4 py-3 font-mono text-xs text-gray-700"
                      >
                        {formatPreviewValue(combination[key])}
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
        <div className="mt-6 grid items-start gap-3 md:grid-cols-2">
          {notes.map((note, index) => {
            const classes = noteClassNames(note.severity);
            return (
              <div key={`${note.title}-${index}`} className={`${classes.card} self-start rounded-xl border p-4`}>
                <p className={`text-sm font-semibold ${classes.title}`}>{note.title}</p>
                <p className={`mt-1 text-sm leading-relaxed ${classes.body}`}>{note.message}</p>
              </div>
            );
          })}
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
              className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[340px] whitespace-pre-wrap break-words">
          {output || "GitHub Actions matrix output will appear here."}
        </pre>
      </div>

      <div className="mt-4 self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
        Matrix generation happens in your browser. Axis values and rules are not sent to GitHub or a Yoryantra server by this page.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">The Cartesian product is only the starting matrix</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Base axes create a Cartesian product: three operating systems and two language versions start with six combinations. GitHub then applies <code className="font-mono">exclude</code> and processes each <code className="font-mono">include</code> object. The preview follows those rules rather than simply appending every include row.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Include can enrich existing combinations or create a new one</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            An include object is merged into compatible base combinations when it does not overwrite their original axis values. If it cannot be merged into any compatible combination, GitHub creates a new matrix combination. Added fields from an earlier include may be replaced by a later include; original axis values are not overwritten.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Matrix value type can change workflow behavior</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Values are kept as strings by default because version-like text such as <code className="font-mono">3.10</code> should not accidentally become the number <code className="font-mono">3.1</code>. Turn string preservation off only when you deliberately want YAML booleans, numbers, or <code className="font-mono">null</code>. Quoted list entries can contain commas.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">The 256-job limit is a hard workflow boundary</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            GitHub limits a matrix to 256 generated jobs per workflow run. The page warns when the final expanded matrix exceeds that limit and also stops materializing extremely large browser previews before they consume unreasonable memory. <code className="font-mono">max-parallel</code> controls concurrency; it does not reduce the number of jobs generated.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Job snippets deliberately avoid inventing CI steps</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The full-job output contains <code className="font-mono">runs-on</code>, the matrix strategy, and a placeholder for your own steps. It does not automatically add checkout or setup actions, because those are workflow decisions with their own permissions, versioning, and supply-chain implications.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">GitHub is the authority for expansion semantics</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            GitHub documents matrix expansion, partial-match excludes, include processing, <code className="font-mono">fail-fast</code>, <code className="font-mono">max-parallel</code>, and the 256-job cap in the <a className="font-medium text-[var(--green)] underline underline-offset-2" href="https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#jobsjob_idstrategy" target="_blank" rel="noreferrer">workflow syntax reference</a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/github-actions-matrix-builder" />
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
                className="min-h-[44px] whitespace-nowrap rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
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
  const notes: MatrixNote[] = [];
  const enabledAxes = axes
    .filter((axis) => axis.enabled)
    .filter((axis) => axis.name.trim() && axis.values.trim())
    .map((axis) => ({ ...axis, name: axis.name.trim(), values: axis.values.trim() }));

  const duplicateNames = findDuplicates(enabledAxes.map((axis) => axis.name));
  if (duplicateNames.length > 0) notes.push({ severity: "high", title: "Duplicate matrix axis names", message: `Each axis key must be unique. Duplicates: ${duplicateNames.join(", ")}.` });
  const reserved = enabledAxes.filter((axis) => ["include", "exclude"].includes(axis.name)).map((axis) => axis.name);
  if (reserved.length > 0) notes.push({ severity: "high", title: "Reserved matrix keys used as axes", message: `${reserved.join(", ")} are reserved for matrix expansion rules.` });

  const finalAxes = sortAxes ? [...enabledAxes].sort((a, b) => compareText(a.name, b.name)) : enabledAxes;
  const axisValues = finalAxes.map((axis) => ({ ...axis, parsedValues: splitValues(axis.values).map((token) => parseMatrixScalar(token, quoteValues)) }));
  const baseCount = axisValues.length === 0 ? 0 : axisValues.reduce((total, axis) => total * Math.max(1, axis.parsedValues.length), 1);
  const MATERIALIZE_LIMIT = 10000;
  let combinations: MatrixCombination[] = [];
  if (baseCount <= MATERIALIZE_LIMIT) combinations = buildCombinations(axisValues);
  else notes.push({ severity: "high", title: "Matrix preview is too large to materialize safely", message: `The base axes create ${baseCount.toLocaleString()} combinations before exclude/include processing. Reduce the axes before previewing combinations in the browser.` });

  const parsedIncludeRules = includeRules.filter((rule) => rule.enabled && rule.values.trim()).map((rule) => parseRule(rule.values, quoteValues));
  const parsedExcludeRules = excludeRules.filter((rule) => rule.enabled && rule.values.trim()).map((rule) => parseRule(rule.values, quoteValues));

  const afterExclude = combinations.filter((combination) => !parsedExcludeRules.some((rule) => doesRuleMatch(combination, rule)));
  const finalCombinations = combinations.length > 0 || finalAxes.length === 0 ? applyIncludeRules(afterExclude, parsedIncludeRules, finalAxes.map((axis) => axis.name)) : [];
  const previewWasMaterialized = baseCount <= MATERIALIZE_LIMIT;
  const finalCount = finalAxes.length === 0
    ? parsedIncludeRules.length
    : previewWasMaterialized
      ? finalCombinations.length
      : parsedIncludeRules.length === 0 && parsedExcludeRules.length === 0
        ? baseCount
        : -1;

  if (finalAxes.length === 0 && parsedIncludeRules.length === 0) notes.push({ severity: "warning", title: "No matrix combinations yet", message: "Add at least one axis or an include-only combination." });
  if (finalCount > 256) notes.push({ severity: "high", title: "GitHub matrix job limit exceeded", message: `The expanded matrix has ${finalCount.toLocaleString()} jobs. GitHub limits a matrix to 256 jobs per workflow run.` });
  if (finalCount > 20 && finalCount <= 256) notes.push({ severity: "warning", title: "Large matrix", message: `${finalCount.toLocaleString()} jobs may increase queue time and CI usage. max-parallel changes concurrency, not total job count.` });
  if (finalCount < 0) notes.push({ severity: "high", title: "Final job count was not expanded", message: "The base Cartesian product exceeds the browser preview safety limit and include/exclude rules are present. Reduce the matrix before relying on a final job count." });

  const maxParallelValue = maxParallel.trim();
  if (maxParallelValue && (!/^\d+$/.test(maxParallelValue) || Number(maxParallelValue) < 1)) notes.push({ severity: "high", title: "max-parallel must be a positive integer", message: `Received ${maxParallelValue}. The invalid value is omitted from generated YAML.` });
  const validMaxParallel = /^\d+$/.test(maxParallelValue) && Number(maxParallelValue) >= 1 ? maxParallelValue : "";

  const trimmedJobName = jobName.trim() || "test";
  const jobNameValid = /^[A-Za-z_][A-Za-z0-9_-]*$/.test(trimmedJobName);
  if (!jobNameValid) notes.push({ severity: "high", title: "Invalid GitHub job ID", message: "A job ID must start with a letter or underscore and contain only letters, numbers, hyphens, or underscores." });

  if (sortAxes && finalAxes.length > 1) notes.push({ severity: "info", title: "Axis order was changed", message: "GitHub uses matrix variable order when creating jobs, so alphabetical sorting is not purely cosmetic." });
  if (!quoteValues) notes.push({ severity: "warning", title: "YAML scalar typing is enabled", message: "Unquoted true, false, null, and JSON-style numbers become typed YAML scalars. Keep values as strings for version text unless numeric/boolean types are intentional." });
  if (parsedExcludeRules.length > 0 && combinations.length > 0 && afterExclude.length === combinations.length) notes.push({ severity: "info", title: "Exclude rules matched no base combination", message: "Check key names, scalar types, and values. Exclude uses partial matching against generated base combinations." });

  const yaml = buildMatrixYaml({ axes: axisValues, includeRules: parsedIncludeRules, excludeRules: parsedExcludeRules, failFast, maxParallel: validMaxParallel, quoteValues });
  const jobYaml = buildJobYaml({ jobName: trimmedJobName, jobNameValid, runnerExpression: runnerExpression.trim() || "${{ matrix.os }}", matrixYaml: yaml });
  return {
    axes: finalAxes,
    includeRules: parsedIncludeRules,
    excludeRules: parsedExcludeRules,
    combinations,
    finalCombinations: finalAxes.length === 0 ? parsedIncludeRules : finalCombinations,
    totalBeforeExclude: combinations.length > 0 ? combinations.length : baseCount,
    totalAfterExclude: finalCount,
    yaml,
    jobYaml,
    json: JSON.stringify({
      axes: axisValues.map((axis) => ({ name: axis.name, values: axis.parsedValues })),
      include: parsedIncludeRules,
      exclude: parsedExcludeRules,
      totalBeforeExclude: combinations.length > 0 ? combinations.length : baseCount,
      totalAfterExclude: finalCount < 0 ? null : finalCount,
      combinations: finalAxes.length === 0 ? parsedIncludeRules : finalCombinations,
    }, null, 2),
    notes,
  };
}

type ParsedAxis = MatrixAxis & { parsedValues: MatrixScalar[] };

type ExpansionEntry = { original: MatrixCombination; values: MatrixCombination; fromBase: boolean };

function buildCombinations(axes: ParsedAxis[]): MatrixCombination[] {
  if (axes.length === 0) return [];
  return axes.reduce<MatrixCombination[]>((current, axis) => {
    if (current.length === 0) return axis.parsedValues.map((value) => ({ [axis.name]: value }));
    const next: MatrixCombination[] = [];
    current.forEach((combination) => {
      axis.parsedValues.forEach((value) => {
        next.push({ ...combination, [axis.name]: value });
      });
    });
    return next;
  }, []);
}

function applyIncludeRules(base: MatrixCombination[], includeRules: MatrixCombination[], axisNames: string[]): MatrixCombination[] {
  const axisSet = new Set(axisNames);
  const entries: ExpansionEntry[] = base.map((combination) => ({ original: { ...combination }, values: { ...combination }, fromBase: true }));
  for (const include of includeRules) {
    let applied = false;
    for (const entry of entries) {
      if (!entry.fromBase) continue;
      const compatible = Object.entries(include).every(([key, value]) => !axisSet.has(key) || !(key in entry.original) || scalarEqual(entry.original[key], value));
      if (compatible) {
        entry.values = { ...entry.values, ...include };
        applied = true;
      }
    }
    if (!applied) entries.push({ original: {}, values: { ...include }, fromBase: false });
  }
  return entries.map((entry) => entry.values);
}

function splitValues(value: string): { text: string; quoted: boolean }[] {
  const tokens: { text: string; quoted: boolean }[] = [];
  let current = "";
  let quote: "'" | '"' | null = null;
  let tokenQuoted = false;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (quote) {
      if (char === quote) quote = null;
      else if (char === "\\" && index + 1 < value.length) { current += value[index + 1]; index += 1; }
      else current += char;
      continue;
    }
    if (char === "'" || char === '"') { quote = char; tokenQuoted = true; continue; }
    if (char === ",") {
      if (current.trim() || tokenQuoted) tokens.push({ text: current.trim(), quoted: tokenQuoted });
      current = ""; tokenQuoted = false; continue;
    }
    current += char;
  }
  if (current.trim() || tokenQuoted) tokens.push({ text: current.trim(), quoted: tokenQuoted });
  return tokens;
}

function parseRule(value: string, keepStrings: boolean): MatrixCombination {
  return splitValues(value).reduce<MatrixCombination>((acc, token) => {
    const equalsIndex = token.text.indexOf("=");
    if (equalsIndex === -1) return acc;
    const key = token.text.slice(0, equalsIndex).trim();
    const rawValue = token.text.slice(equalsIndex + 1).trim();
    if (key) acc[key] = parseMatrixScalar({ text: rawValue, quoted: token.quoted }, keepStrings);
    return acc;
  }, {});
}

function parseMatrixScalar(token: { text: string; quoted: boolean }, keepStrings: boolean): MatrixScalar {
  if (keepStrings || token.quoted) return token.text;
  if (token.text === "true") return true;
  if (token.text === "false") return false;
  if (token.text === "null") return null;
  if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(token.text)) {
    const numeric = Number(token.text);
    if (Number.isFinite(numeric) && Number.isSafeInteger(numeric) === (Number.isInteger(numeric))) return numeric;
    if (Number.isFinite(numeric) && !Number.isInteger(numeric)) return numeric;
  }
  return token.text;
}

function doesRuleMatch(combination: MatrixCombination, rule: MatrixCombination): boolean {
  return Object.entries(rule).every(([key, value]) => key in combination && scalarEqual(combination[key], value));
}

function scalarEqual(left: MatrixScalar, right: MatrixScalar): boolean {
  return Object.is(left, right);
}

function buildMatrixYaml({
  axes,
  includeRules,
  excludeRules,
  failFast,
  maxParallel,
  quoteValues,
}: {
  axes: ParsedAxis[];
  includeRules: MatrixCombination[];
  excludeRules: MatrixCombination[];
  failFast: boolean;
  maxParallel: string;
  quoteValues: boolean;
}): string {
  const lines = ["strategy:", `  fail-fast: ${failFast ? "true" : "false"}`];
  if (maxParallel) lines.push(`  max-parallel: ${maxParallel}`);
  lines.push("  matrix:");
  axes.forEach((axis) => {
    lines.push(`    ${formatYamlKey(axis.name)}:`);
    axis.parsedValues.forEach((value) => lines.push(`      - ${formatYamlValue(value, quoteValues)}`));
  });
  if (includeRules.length > 0) appendRules(lines, "include", includeRules, quoteValues);
  if (excludeRules.length > 0) appendRules(lines, "exclude", excludeRules, quoteValues);
  if (axes.length === 0 && includeRules.length === 0) lines.push("    # Add an axis or include-only combination");
  return lines.join("\n");
}

function appendRules(lines: string[], key: "include" | "exclude", rules: MatrixCombination[], quoteValues: boolean): void {
  lines.push(`    ${key}:`);
  rules.forEach((rule) => {
    const entries = Object.entries(rule);
    if (entries.length === 0) { lines.push("      - {}"); return; }
    entries.forEach(([name, value], index) => {
      const prefix = index === 0 ? "      - " : "        ";
      lines.push(`${prefix}${formatYamlKey(name)}: ${formatYamlValue(value, quoteValues)}`);
    });
  });
}

function buildJobYaml({ jobName, jobNameValid, runnerExpression, matrixYaml }: { jobName: string; jobNameValid: boolean; runnerExpression: string; matrixYaml: string }): string {
  if (!jobNameValid) return ["# Fix the Job Name before using this snippet.", "# GitHub job IDs must start with a letter or _ and contain only letters, numbers, - or _.", "", matrixYaml].join("\n");
  const indentedMatrix = matrixYaml.split("\n").map((line) => `    ${line}`).join("\n");
  return [
    "jobs:",
    `  ${jobName}:`,
    `    runs-on: ${runnerExpression}`,
    indentedMatrix,
    "    steps:",
    "      # Add the steps required by this job.",
  ].join("\n");
}

function formatYamlKey(value: string): string {
  return /^[A-Za-z_][A-Za-z0-9_-]*$/.test(value) ? value : JSON.stringify(value);
}

function formatYamlValue(value: MatrixScalar, keepStrings: boolean): string {
  if (value === null) return "null";
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  if (keepStrings) return JSON.stringify(value);
  const needsQuote = value === "" || /^[-?:,\[\]{}#&*!|>'\"%@`]/.test(value) || /:\s|\s#/.test(value) || /^(?:true|false|null|~)$/i.test(value) || /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(value);
  return needsQuote ? JSON.stringify(value) : value;
}

function formatPreviewValue(value: MatrixScalar | undefined): string {
  if (value === undefined) return "";
  if (value === null) return "null";
  if (typeof value === "string") return value;
  return String(value);
}

function findDuplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  values.forEach((value) => { if (seen.has(value)) duplicates.add(value); else seen.add(value); });
  return [...duplicates];
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function noteClassNames(severity: MatrixNote["severity"]): { card: string; title: string; body: string } {
  if (severity === "high") return { card: "border-red-200 bg-red-50", title: "text-red-900", body: "text-red-800" };
  if (severity === "warning") return { card: "border-amber-200 bg-amber-50", title: "text-amber-900", body: "text-amber-800" };
  return { card: "border-gray-200 bg-gray-50", title: "text-gray-900", body: "text-gray-600" };
}

