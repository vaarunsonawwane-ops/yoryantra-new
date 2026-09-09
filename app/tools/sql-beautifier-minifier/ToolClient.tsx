"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type SQLAction = "beautify" | "minify";
type KeywordCase = "upper" | "lower" | "preserve";
type IndentSize = "two" | "four";
type CommaStyle = "leading" | "trailing";
type OutputFormat = "sql" | "json";

type SQLStats = {
  characters: number;
  lines: number;
  statements: number;
  selectCount: number;
  joinCount: number;
  whereCount: number;
  groupByCount: number;
  orderByCount: number;
  insertCount: number;
  updateCount: number;
  deleteCount: number;
};

type QueryWarning = {
  title: string;
  message: string;
};

type FormatOptions = {
  keywordCase: KeywordCase;
  indentSize: IndentSize;
  commaStyle: CommaStyle;
  uppercaseFunctions: boolean;
  breakBeforeJoin: boolean;
  breakBeforeWhere: boolean;
  removeComments: boolean;
};

const sampleSql = `select u.id,u.name,u.email,count(o.id) as order_count,sum(o.total) as total_spent from users u left join orders o on o.user_id = u.id where u.active = true and o.created_at >= '2026-01-01' group by u.id,u.name,u.email having count(o.id) > 0 order by total_spent desc limit 20;`;

const sqlKeywords = [
  "select",
  "from",
  "where",
  "and",
  "or",
  "join",
  "inner",
  "left",
  "right",
  "full",
  "outer",
  "cross",
  "on",
  "group",
  "by",
  "having",
  "order",
  "limit",
  "offset",
  "insert",
  "into",
  "values",
  "update",
  "set",
  "delete",
  "create",
  "alter",
  "drop",
  "table",
  "view",
  "index",
  "primary",
  "key",
  "foreign",
  "references",
  "constraint",
  "as",
  "distinct",
  "union",
  "all",
  "case",
  "when",
  "then",
  "else",
  "end",
  "is",
  "null",
  "not",
  "in",
  "exists",
  "between",
  "like",
  "desc",
  "asc",
  "with",
  "recursive",
  "returning",
];

const sqlFunctions = [
  "count",
  "sum",
  "avg",
  "min",
  "max",
  "coalesce",
  "nullif",
  "cast",
  "convert",
  "date",
  "now",
  "lower",
  "upper",
  "trim",
  "substring",
  "round",
];

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [action, setAction] = useState<SQLAction>("beautify");
  const [keywordCase, setKeywordCase] = useState<KeywordCase>("upper");
  const [indentSize, setIndentSize] = useState<IndentSize>("two");
  const [commaStyle, setCommaStyle] = useState<CommaStyle>("trailing");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("sql");
  const [uppercaseFunctions, setUppercaseFunctions] = useState(false);
  const [breakBeforeJoin, setBreakBeforeJoin] = useState(true);
  const [breakBeforeWhere, setBreakBeforeWhere] = useState(true);
  const [removeComments, setRemoveComments] = useState(false);
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => getSQLStats(input), [input]);
  const warnings = useMemo(
    () => getSQLWarnings(input, removeComments),
    [input, removeComments]
  );

  const processSQL = () => {
    if (!input.trim()) {
      setError("Please enter SQL input.");
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const options: FormatOptions = {
        keywordCase,
        indentSize,
        commaStyle,
        uppercaseFunctions,
        breakBeforeJoin,
        breakBeforeWhere,
        removeComments,
      };

      const nextOutput =
        action === "minify"
          ? minifySQL(input, removeComments)
          : beautifySQL(input, options);

      const finalOutput =
        outputFormat === "json"
          ? JSON.stringify(
              {
                action,
                sql: nextOutput,
                stats: getSQLStats(nextOutput),
              },
              null,
              2
            )
          : nextOutput;

      setOutput(finalOutput);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to process this SQL."
      );
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
    setInput(sampleSql);
    setOutput("");
    setError("");
    setAction("beautify");
    setKeywordCase("upper");
    setIndentSize("two");
    setCommaStyle("trailing");
    setOutputFormat("sql");
    setUppercaseFunctions(false);
    setBreakBeforeJoin(true);
    setBreakBeforeWhere(true);
    setRemoveComments(false);
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setAction("beautify");
    setKeywordCase("upper");
    setIndentSize("two");
    setCommaStyle("trailing");
    setOutputFormat("sql");
    setUppercaseFunctions(false);
    setBreakBeforeJoin(true);
    setBreakBeforeWhere(true);
    setRemoveComments(false);
    setCopied(false);
  };

  return (
    <ToolShell
      title="SQL Beautifier / Minifier"
      description="Reformat or compact common SQL while preserving quoted text and exposing dialect-sensitive limits."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          SQL Input
        </label>

        <textarea
          value={input}
          onChange={(event: { target: { value: string } }) => {
            setInput(event.target.value);
            setOutput("");
            setError("");
            setCopied(false);
          }}
          placeholder={sampleSql}
          className="w-full min-h-[340px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste a SQL query, migration snippet, database log query, report query,
          or copied statement to beautify, minify, and review it.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <SummaryCard label="Characters" value={stats.characters.toLocaleString()} />
        <SummaryCard label="Lines" value={stats.lines.toLocaleString()} />
        <SummaryCard label="Statements" value={stats.statements.toLocaleString()} />
        <SummaryCard label="Joins" value={stats.joinCount.toLocaleString()} />
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Formatting Options
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <YoryantraSelect
            label="Action"
            value={action}
            onChange={(value: string) => {
              setAction(value as SQLAction);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              {
                label: "Beautify SQL",
                value: "beautify",
              },
              {
                label: "Minify SQL",
                value: "minify",
              },
            ]}
          />

          <YoryantraSelect
            label="Keyword Case"
            value={keywordCase}
            onChange={(value: string) => {
              setKeywordCase(value as KeywordCase);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              {
                label: "UPPERCASE",
                value: "upper",
              },
              {
                label: "lowercase",
                value: "lower",
              },
              {
                label: "Preserve",
                value: "preserve",
              },
            ]}
          />

          <YoryantraSelect
            label="Output Format"
            value={outputFormat}
            onChange={(value: string) => {
              setOutputFormat(value as OutputFormat);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              {
                label: "SQL",
                value: "sql",
              },
              {
                label: "JSON",
                value: "json",
              },
            ]}
          />

          <YoryantraSelect
            label="Indent Size"
            value={indentSize}
            onChange={(value: string) => {
              setIndentSize(value as IndentSize);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              {
                label: "2 spaces",
                value: "two",
              },
              {
                label: "4 spaces",
                value: "four",
              },
            ]}
          />

          <YoryantraSelect
            label="Comma Style"
            value={commaStyle}
            onChange={(value: string) => {
              setCommaStyle(value as CommaStyle);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              {
                label: "Trailing commas",
                value: "trailing",
              },
              {
                label: "Leading commas",
                value: "leading",
              },
            ]}
          />

          <div className="self-start rounded-xl border border-gray-200 bg-white p-4">
            <div className="text-sm font-medium text-gray-900">
              Browser-first formatting
            </div>

            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              SQL processing runs locally. No query text is sent to a server.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="self-start flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={breakBeforeJoin}
              onChange={(event: { target: { checked: boolean } }) => {
                setBreakBeforeJoin(event.target.checked);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Break before JOIN clauses
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Put JOIN, LEFT JOIN, INNER JOIN, and related joins on separate
                lines for easier review.
              </span>
            </span>
          </label>

          <label className="self-start flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={breakBeforeWhere}
              onChange={(event: { target: { checked: boolean } }) => {
                setBreakBeforeWhere(event.target.checked);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Break AND / OR conditions
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Put top-level AND and OR conditions on indented lines after the formatter separates major clauses.
              </span>
            </span>
          </label>

          <label className="self-start flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={uppercaseFunctions}
              onChange={(event: { target: { checked: boolean } }) => {
                setUppercaseFunctions(event.target.checked);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Uppercase common functions
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Convert functions such as count, sum, coalesce, and cast to
                uppercase.
              </span>
            </span>
          </label>

          <label className="self-start flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={removeComments}
              onChange={(event: { target: { checked: boolean } }) => {
                setRemoveComments(event.target.checked);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Remove SQL comments
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Remove ordinary line and block comments. MySQL version comments and optimizer-hint comments are preserved because they can affect execution.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={processSQL} className="yoryantra-btn whitespace-nowrap">
          {action === "minify" ? "Minify SQL" : "Beautify SQL"}
        </button>

        <button onClick={loadExample} className="yoryantra-btn-outline whitespace-nowrap">
          Load Example
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline whitespace-nowrap">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mt-6 self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            SQL review notes
          </h3>

          <div className="mt-3 space-y-3">
            {warnings.map((warning) => (
              <div key={warning.title}>
                <p className="text-sm font-semibold text-amber-900">
                  {warning.title}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-amber-800">
                  {warning.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Query Structure Preview
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          A quick breakdown of the query shape based on keyword counts.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DetailCard label="SELECT" value={stats.selectCount.toLocaleString()} />
          <DetailCard label="WHERE" value={stats.whereCount.toLocaleString()} />
          <DetailCard label="GROUP BY" value={stats.groupByCount.toLocaleString()} />
          <DetailCard label="ORDER BY" value={stats.orderByCount.toLocaleString()} />
          <DetailCard label="INSERT" value={stats.insertCount.toLocaleString()} />
          <DetailCard label="UPDATE" value={stats.updateCount.toLocaleString()} />
          <DetailCard label="DELETE" value={stats.deleteCount.toLocaleString()} />
          <DetailCard label="JOIN" value={stats.joinCount.toLocaleString()} />
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            SQL Output
          </h3>

          {output && (
            <button
              onClick={copyOutput}
              className="yoryantra-btn-outline whitespace-nowrap text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">
          {output || "Formatted or minified SQL output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        SQL processing stays in the browser. Formatting does not execute the query, connect to a database, or prove that the output is valid for a particular SQL dialect.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Formatting SQL Without Touching Quoted Data
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Whitespace and keyword casing look cosmetic until a formatter changes text inside a string literal, quoted identifier, comment, or stored-function body. The formatting pass protects those lexical regions first, then adjusts the surrounding SQL. That keeps values such as <code className="font-mono text-sm">'a  b'</code>, semicolons inside strings, and quoted names out of the rewrite rules.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What the Beautifier Changes</h2>
          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Keyword case outside protected strings, identifiers, and comments.</li>
            <li>Spacing around common comparison operators and commas.</li>
            <li>Line breaks around major clauses and, when selected, JOIN and AND/OR boundaries.</li>
            <li>Top-level SELECT-list commas, with leading or trailing comma style.</li>
            <li>A small set of common function names when the uppercase-functions option is enabled.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Minifying Is Not SQL Compression</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Minification removes formatting whitespace outside protected lexical regions. It does not rewrite expressions, optimize the query plan, shorten identifiers, or change parameter values. Ordinary comments can be removed, but comments with execution meaning such as MySQL <code className="font-mono text-sm">/*! ... */</code> version comments and <code className="font-mono text-sm">/*+ ... */</code> optimizer hints are preserved.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Dialect Boundaries Matter</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            SQL is not one interchangeable grammar. PostgreSQL has dollar-quoted strings and nested block comments; MySQL uses backtick-quoted identifiers and execution-sensitive comments; SQL Server commonly uses bracketed identifiers; cloud warehouses add their own clauses and functions. The formatter protects several widely seen lexical forms, but it is not a full parser for every vendor grammar. A quote immediately preceded by an odd number of backslashes is rejected because different dialects disagree about whether the backslash escapes that quote.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Review stored procedures, procedural SQL, vendor-specific operators, templated SQL, and migration scripts before replacing source code with formatted output. The structure counters are lexical signals, not syntax validation or query-plan analysis.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Safety Notes for Destructive Statements</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            DELETE and UPDATE statements are checked one statement at a time for a missing WHERE clause, and DROP/TRUNCATE are called out for review. Those notices cannot understand business intent, triggers, permissions, transactions, or database-specific semantics. Treat them as a visual prompt, not as an approval to run a statement.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">A Useful Lexical Reference</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            PostgreSQL's <a href="https://www.postgresql.org/docs/current/sql-syntax-lexical.html" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-2">official lexical-structure documentation</a> is a good concrete example of why a formatter has to distinguish tokens, quoted strings, dollar-quoted strings, special characters, and comments before changing whitespace. Other database engines have their own syntax documentation and should be checked when dialect-specific SQL matters.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/sql-beautifier-minifier" />
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

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>

      <div className="mt-1 break-words font-mono text-sm text-gray-900">
        {value}
      </div>
    </div>
  );
}

function beautifySQL(sql: string, options: FormatOptions) {
  const indent = options.indentSize === "four" ? "    " : "  ";
  const protectedSql = protectSQL(sql, options.removeComments);
  let formatted = normalizeSQLSpacing(protectedSql.text);

  formatted = applyKeywordCase(formatted, options.keywordCase);
  if (options.uppercaseFunctions) formatted = applyFunctionCase(formatted);

  formatted = formatted.replace(/\s*,\s*/g, ", ").replace(/\s*;\s*/g, ";\n").trim();

  const majorClauses = ["SELECT", "FROM", "WHERE", "GROUP BY", "HAVING", "ORDER BY", "LIMIT", "OFFSET", "RETURNING", "VALUES", "SET"];
  majorClauses.forEach((clause) => {
    const regex = new RegExp(`\\s+(${escapeRegExp(clause)})\\s+`, "gi");
    formatted = formatted.replace(regex, `\n$1 `);
  });

  if (options.breakBeforeJoin) {
    formatted = formatted.replace(/\s+((?:INNER|LEFT|RIGHT|FULL|CROSS)?\s*JOIN)\s+/gi, "\n$1 ");
  }
  if (options.breakBeforeWhere) {
    formatted = formatted.replace(/\s+(AND)\s+/gi, `\n${indent}$1 `).replace(/\s+(OR)\s+/gi, `\n${indent}$1 `);
  }

  formatted = formatSelectList(formatted, indent, options.commaStyle);
  formatted = indentContinuationLines(formatted, indent);
  const result = formatted.split("\n").map((line) => line.replace(/[ \t]+$/, "")).filter((line, index, lines) => !(line.trim() === "" && lines[index - 1]?.trim() === "")).join("\n").trim();
  return restoreSQL(result, protectedSql.values);
}

function minifySQL(sql: string, removeComments: boolean) {
  const protectedSql = protectSQL(sql, removeComments);
  const minified = protectedSql.text
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ",")
    .replace(/\s*=\s*/g, "=")
    .replace(/\s*;\s*/g, ";")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .trim();
  return restoreSQL(minified, protectedSql.values);
}

function normalizeSQLSpacing(sql: string) {
  return sql.replace(/\r\n/g, "\n").replace(/\t/g, " ").replace(/[ ]+/g, " ")
    .replace(/\s*(<>|!=|>=|<=|=|>|<)\s*/g, " $1 ")
    .replace(/\s+/g, " ").trim();
}

function applyKeywordCase(sql: string, keywordCase: KeywordCase) {
  if (keywordCase === "preserve") return sql;
  let result = sql;
  [...sqlKeywords].sort((a, b) => b.length - a.length).forEach((keyword) => {
    const replacement = keywordCase === "upper" ? keyword.toUpperCase() : keyword.toLowerCase();
    result = result.replace(new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "gi"), replacement);
  });
  return result;
}

function applyFunctionCase(sql: string) {
  let result = sql;
  sqlFunctions.forEach((fn) => {
    result = result.replace(new RegExp(`\\b${escapeRegExp(fn)}\\s*\\(`, "gi"), `${fn.toUpperCase()}(`);
  });
  return result;
}

function formatSelectList(sql: string, indent: string, commaStyle: CommaStyle) {
  const lines = sql.split("\n");
  const nextLines: string[] = [];
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (/^SELECT\s+/i.test(trimmed) && trimmed.includes(",")) {
      const selectBody = trimmed.replace(/^SELECT\s+/i, "");
      const parts = splitByTopLevelComma(selectBody);
      nextLines.push("SELECT");
      parts.forEach((part, index) => {
        const cleanPart = part.trim();
        if (commaStyle === "leading" && index > 0) nextLines.push(`${indent}, ${cleanPart}`);
        else if (commaStyle === "trailing" && index < parts.length - 1) nextLines.push(`${indent}${cleanPart},`);
        else nextLines.push(`${indent}${cleanPart}`);
      });
      return;
    }
    nextLines.push(line);
  });
  return nextLines.join("\n");
}

function indentContinuationLines(sql: string, indent: string) {
  return sql.split("\n").map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return "";
    if (/^(SELECT|FROM|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|OFFSET|RETURNING|INSERT|UPDATE|DELETE|VALUES|SET)\b/i.test(trimmed)) return trimmed;
    if (/^((INNER|LEFT|RIGHT|FULL|CROSS)\s+)?JOIN\b/i.test(trimmed)) return trimmed;
    if (/^(AND|OR)\b/i.test(trimmed)) return `${indent}${trimmed}`;
    if (trimmed.startsWith(", ")) return `${indent}${trimmed}`;
    return trimmed;
  }).join("\n");
}

function splitByTopLevelComma(value: string) {
  const parts: string[] = [];
  let current = "";
  let depth = 0;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (char === "(") depth += 1;
    else if (char === ")") depth = Math.max(depth - 1, 0);
    if (char === "," && depth === 0) { parts.push(current); current = ""; }
    else current += char;
  }
  if (current.trim()) parts.push(current);
  return parts;
}

type ProtectedSQL = {
  text: string;
  values: string[];
  semanticCommentsFound: boolean;
};

function protectSQL(sql: string, removeComments: boolean): ProtectedSQL {
  const values: string[] = [];
  let text = "";
  let semanticCommentsFound = false;
  const protect = (value: string) => {
    const placeholder = `\uE000${values.length}\uE001`;
    values.push(value);
    text += placeholder;
  };

  for (let index = 0; index < sql.length; ) {
    const char = sql[index];
    const next = sql[index + 1];

    if (char === "-" && next === "-") {
      let end = sql.indexOf("\n", index + 2);
      if (end === -1) end = sql.length;
      const value = sql.slice(index, end);
      if (removeComments) text += end < sql.length ? "\n" : " "; else protect(value);
      index = end;
      continue;
    }

    if (char === "/" && next === "*") {
      let depth = 1;
      let end = index + 2;
      while (end < sql.length && depth > 0) {
        if (sql[end] === "/" && sql[end + 1] === "*") { depth += 1; end += 2; continue; }
        if (sql[end] === "*" && sql[end + 1] === "/") { depth -= 1; end += 2; continue; }
        end += 1;
      }
      if (depth !== 0) throw new Error("SQL contains an unclosed block comment.");
      const value = sql.slice(index, end);
      const semantic = value.startsWith("/*!") || value.startsWith("/*+");
      if (semantic) semanticCommentsFound = true;
      if (removeComments && !semantic) text += " "; else protect(value);
      index = end;
      continue;
    }

    if (char === "#" && (index === 0 || sql[index - 1] === "\n")) {
      let end = sql.indexOf("\n", index + 1);
      if (end === -1) end = sql.length;
      const value = sql.slice(index, end);
      if (removeComments) text += end < sql.length ? "\n" : " "; else protect(value);
      index = end;
      continue;
    }

    if (char === "$" ) {
      const opener = /^\$(?:[A-Za-z_][A-Za-z0-9_]*)?\$/.exec(sql.slice(index));
      if (opener) {
        const delimiter = opener[0];
        const endStart = sql.indexOf(delimiter, index + delimiter.length);
        if (endStart === -1) throw new Error(`SQL contains an unclosed dollar-quoted string (${delimiter}).`);
        const end = endStart + delimiter.length;
        protect(sql.slice(index, end));
        index = end;
        continue;
      }
    }

    if (char === "'" || char === '"' || char === "`") {
      const quote = char;
      let end = index + 1;
      let closed = false;
      while (end < sql.length) {
        if (sql[end] === quote) {
          if (sql[end + 1] === quote) { end += 2; continue; }
          let backslashes = 0;
          for (let cursor = end - 1; cursor >= index && sql[cursor] === "\\"; cursor -= 1) backslashes += 1;
          if (backslashes % 2 === 1) {
            throw new Error("A backslash immediately before a closing quote is dialect-sensitive SQL. The formatter stops instead of guessing whether that quote is escaped.");
          }
          end += 1; closed = true; break;
        }
        end += 1;
      }
      if (!closed) throw new Error(`SQL contains an unclosed ${quote === "'" ? "string literal" : "quoted identifier"}.`);
      protect(sql.slice(index, end));
      index = end;
      continue;
    }

    if (char === "[") {
      let end = index + 1;
      let closed = false;
      while (end < sql.length) {
        if (sql[end] === "]") {
          if (sql[end + 1] === "]") { end += 2; continue; }
          end += 1; closed = true; break;
        }
        end += 1;
      }
      if (closed) { protect(sql.slice(index, end)); index = end; continue; }
    }

    text += char;
    index += 1;
  }
  return { text, values, semanticCommentsFound };
}

function restoreSQL(text: string, values: string[]) {
  return text.replace(/\uE000(\d+)\uE001/g, (_match, index: string) => values[Number(index)] ?? "");
}

function getSQLStats(sql: string): SQLStats {
  const text = sql || "";
  if (!text) return { characters: 0, lines: 0, statements: 0, selectCount: 0, joinCount: 0, whereCount: 0, groupByCount: 0, orderByCount: 0, insertCount: 0, updateCount: 0, deleteCount: 0 };
  let masked = "";
  try { masked = protectSQL(text, false).text.toLowerCase().replace(/\s+/g, " "); } catch { masked = text.toLowerCase(); }
  return {
    characters: text.length,
    lines: text.split(/\r?\n/).length,
    statements: masked.split(";").filter((statement) => statement.trim()).length,
    selectCount: countKeyword(masked, "select"),
    joinCount: countKeyword(masked, "join"),
    whereCount: countKeyword(masked, "where"),
    groupByCount: countPhrase(masked, "group by"),
    orderByCount: countPhrase(masked, "order by"),
    insertCount: countKeyword(masked, "insert"),
    updateCount: countKeyword(masked, "update"),
    deleteCount: countKeyword(masked, "delete"),
  };
}

function getSQLWarnings(sql: string, removeComments: boolean): QueryWarning[] {
  const warnings: QueryWarning[] = [];
  if (!sql.trim()) return warnings;
  let protectedSql: ProtectedSQL;
  try { protectedSql = protectSQL(sql, false); } catch { return warnings; }
  const executable = protectedSql.text;
  const statements = executable.split(";").map((statement) => statement.trim()).filter(Boolean);

  if (/\bselect\s+\*/i.test(executable)) warnings.push({ title: "SELECT * detected", message: "SELECT * can couple callers to schema changes and return columns that are not needed. Decide whether an explicit column list is clearer for this query." });
  statements.forEach((statement, index) => {
    if (/\bdelete\s+from\b/i.test(statement) && !/\bwhere\b/i.test(statement)) warnings.push({ title: `DELETE without WHERE${statements.length > 1 ? ` (statement ${index + 1})` : ""}`, message: "No WHERE keyword was found in this DELETE statement outside quoted text and comments. Confirm that all target rows are intended." });
    if (/\bupdate\b/i.test(statement) && !/\bwhere\b/i.test(statement)) warnings.push({ title: `UPDATE without WHERE${statements.length > 1 ? ` (statement ${index + 1})` : ""}`, message: "No WHERE keyword was found in this UPDATE statement outside quoted text and comments. Confirm that all target rows are intended." });
  });
  if (/\b(drop\s+table|truncate\s+table)\b/i.test(executable)) warnings.push({ title: "Destructive statement detected", message: "DROP TABLE or TRUNCATE TABLE appears outside quoted text and comments. Confirm the target database, transaction behavior, and recovery plan before execution." });
  if (removeComments && protectedSql.semanticCommentsFound) warnings.push({ title: "Execution-sensitive comments will be preserved", message: "MySQL version comments (/*!...*/) and optimizer-hint comments (/*+...*/) can affect execution, so the remove-comments option does not strip them." });
  if (/\$[A-Za-z_]*\$/i.test(sql) || /`[^`]*`/.test(sql) || /\[[^\]]+\]/.test(sql)) warnings.push({ title: "Dialect-specific quoting detected", message: "Dollar quotes, backticks, and bracketed identifiers belong to different SQL dialects. Their text is protected, but surrounding vendor-specific grammar may still need manual review." });
  return warnings;
}

function countKeyword(value: string, keyword: string) {
  const matches = value.match(new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "g"));
  return matches ? matches.length : 0;
}

function countPhrase(value: string, phrase: string) {
  const pattern = phrase.split(/\s+/).map(escapeRegExp).join("\\s+");
  const matches = value.match(new RegExp(`\\b${pattern}\\b`, "g"));
  return matches ? matches.length : 0;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

