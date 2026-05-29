"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
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
  const warnings = useMemo(() => getSQLWarnings(input), [input]);

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
      description="Beautify, format, minify, and clean SQL queries directly in your browser with keyword casing, indentation, compact output, and query structure preview."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          SQL Input
        </label>

        <textarea
          value={input}
          onChange={(event) => {
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
            onChange={(value) => {
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
            onChange={(value) => {
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
            onChange={(value) => {
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
            onChange={(value) => {
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
            onChange={(value) => {
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

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="text-sm font-medium text-gray-900">
              Browser-first formatting
            </div>

            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              SQL processing runs locally. No query text is sent to a server.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={breakBeforeJoin}
              onChange={(event) => {
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

          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={breakBeforeWhere}
              onChange={(event) => {
                setBreakBeforeWhere(event.target.checked);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Break before filters and grouping
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Put WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, and RETURNING on
                new lines.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={uppercaseFunctions}
              onChange={(event) => {
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

          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={removeComments}
              onChange={(event) => {
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
                Strip line comments and block comments before formatting or
                minifying.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={processSQL} className="yoryantra-btn">
          {action === "minify" ? "Minify SQL" : "Beautify SQL"}
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

      {warnings.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
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
              className="yoryantra-btn-outline text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">
          {output || "Formatted or minified SQL output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        SQL formatting happens directly in your browser. Your SQL query is not
        uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Formatting SQL Queries for Easier Review
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            SQL queries are often copied from dashboards, logs, ORM output,
            database clients, reports, and migration files. Long one-line SQL is
            difficult to review, while poorly formatted SQL can hide joins,
            filters, grouping, and ordering logic.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This SQL Beautifier / Minifier helps clean SQL into a readable layout
            or compress it into a compact version. You can change keyword casing,
            indentation, comma style, comment handling, and output format without
            sending the query outside your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Beautifying or Minifying SQL Without Changing Query Logic
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste a SQL query into the input box.</li>
            <li>Select Beautify SQL or Minify SQL.</li>
            <li>Choose keyword case, indentation, comma style, and comment handling.</li>
            <li>Review the query structure preview and warning notes.</li>
            <li>
              Copy the formatted SQL output for use in code, docs, tickets, or
              database tools.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common SQL Beautifier and Minifier Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Formatting long SQL queries copied from application logs.</li>
            <li>Cleaning generated ORM SQL before debugging performance issues.</li>
            <li>Preparing readable SQL snippets for pull requests and tickets.</li>
            <li>Minifying SQL before embedding it in scripts or configuration files.</li>
            <li>Reviewing joins, filters, grouping, and ordering in complex queries.</li>
            <li>Standardizing keyword casing and indentation for documentation.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example SQL Beautifying
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Before:
select id,name,email from users where active=true order by created_at desc;

After:
SELECT
  id,
  name,
  email
FROM users
WHERE active = true
ORDER BY created_at DESC;`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Notes About SQL Formatting Accuracy
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            SQL dialects differ between PostgreSQL, MySQL, SQLite, SQL Server,
            BigQuery, Snowflake, and other databases. This tool focuses on
            practical browser-side formatting for common SQL patterns, not deep
            dialect-specific parsing.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Always review formatted SQL before running it against a database,
            especially when working with stored procedures, vendor-specific
            syntax, complex strings, dynamic SQL, or migration scripts.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is a SQL beautifier?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A SQL beautifier reformats a SQL query with line breaks,
                indentation, and consistent keyword casing so the query is easier
                to read and review.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is SQL minification?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                SQL minification removes unnecessary whitespace and comments to
                make a query shorter while keeping the same basic SQL text.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this execute SQL?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. This tool only formats text. It does not connect to a
                database, execute queries, or validate results.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Which SQL dialects are supported?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                The formatter works best with common SQL patterns used across
                PostgreSQL, MySQL, SQLite, SQL Server, BigQuery, and similar
                systems. Some vendor-specific syntax may need manual review.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this remove SQL comments?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Enable the remove comments option to strip line comments and
                block comments before beautifying or minifying the query.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my SQL uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Formatting happens directly in your browser, and your SQL
                query is not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/json-formatter" className="yoryantra-btn-outline">
              JSON Formatter
            </Link>

            <Link href="/tools/json-validator" className="yoryantra-btn-outline">
              JSON Validator
            </Link>

            <Link href="/tools/regex-match-tester" className="yoryantra-btn-outline">
              Regex Match Tester
            </Link>

            <Link href="/tools/http-request-parser" className="yoryantra-btn-outline">
              HTTP Request Parser
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
  const cleaned = options.removeComments ? stripSQLComments(sql) : sql;
  let formatted = normalizeSQLSpacing(cleaned);

  formatted = applyKeywordCase(formatted, options.keywordCase);
  formatted = options.uppercaseFunctions
    ? applyFunctionCase(formatted, options.keywordCase)
    : formatted;

  formatted = formatted
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s*;\s*/g, ";\n")
    .trim();

  const majorClauses = [
    "SELECT",
    "FROM",
    "WHERE",
    "GROUP BY",
    "HAVING",
    "ORDER BY",
    "LIMIT",
    "OFFSET",
    "RETURNING",
    "VALUES",
    "SET",
  ];

  majorClauses.forEach((clause) => {
    const regex = new RegExp(`\\s+(${escapeRegExp(clause)})\\s+`, "gi");
    formatted = formatted.replace(regex, `\n$1 `);
  });

  if (options.breakBeforeJoin) {
    formatted = formatted.replace(
      /\s+((?:INNER|LEFT|RIGHT|FULL|CROSS)?\s*JOIN)\s+/gi,
      "\n$1 "
    );
  }

  if (options.breakBeforeWhere) {
    formatted = formatted
      .replace(/\s+(AND)\s+/gi, `\n${indent}$1 `)
      .replace(/\s+(OR)\s+/gi, `\n${indent}$1 `);
  }

  formatted = formatSelectList(formatted, indent, options.commaStyle);
  formatted = indentContinuationLines(formatted, indent);

  return formatted
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line, index, lines) => !(line.trim() === "" && lines[index - 1]?.trim() === ""))
    .join("\n")
    .trim();
}

function minifySQL(sql: string, removeComments: boolean) {
  const cleaned = removeComments ? stripSQLComments(sql) : sql;

  return cleaned
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ",")
    .replace(/\s*=\s*/g, "=")
    .replace(/\s*;\s*/g, ";")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .trim();
}

function normalizeSQLSpacing(sql: string) {
  return sql
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ ]+/g, " ")
    .replace(/\s*=\s*/g, " = ")
    .replace(/\s*<>\s*/g, " <> ")
    .replace(/\s*!=\s*/g, " != ")
    .replace(/\s*>=\s*/g, " >= ")
    .replace(/\s*<=\s*/g, " <= ")
    .replace(/\s*>\s*/g, " > ")
    .replace(/\s*<\s*/g, " < ")
    .replace(/\s+/g, " ")
    .trim();
}

function applyKeywordCase(sql: string, keywordCase: KeywordCase) {
  if (keywordCase === "preserve") {
    return sql;
  }

  let result = sql;

  sqlKeywords
    .sort((a, b) => b.length - a.length)
    .forEach((keyword) => {
      const replacement =
        keywordCase === "upper" ? keyword.toUpperCase() : keyword.toLowerCase();

      result = result.replace(
        new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "gi"),
        replacement
      );
    });

  return result;
}

function applyFunctionCase(sql: string, keywordCase: KeywordCase) {
  if (keywordCase === "preserve") {
    return sql;
  }

  let result = sql;

  sqlFunctions.forEach((fn) => {
    const replacement =
      keywordCase === "lower" ? fn.toLowerCase() : fn.toUpperCase();

    result = result.replace(
      new RegExp(`\\b${escapeRegExp(fn)}\\s*\\(`, "gi"),
      `${replacement}(`
    );
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

        if (commaStyle === "leading" && index > 0) {
          nextLines.push(`${indent}, ${cleanPart}`);
          return;
        }

        if (commaStyle === "trailing" && index < parts.length - 1) {
          nextLines.push(`${indent}${cleanPart},`);
          return;
        }

        nextLines.push(`${indent}${cleanPart}`);
      });

      return;
    }

    nextLines.push(line);
  });

  return nextLines.join("\n");
}

function indentContinuationLines(sql: string, indent: string) {
  return sql
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();

      if (!trimmed) {
        return "";
      }

      if (
        /^(SELECT|FROM|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|OFFSET|RETURNING|INSERT|UPDATE|DELETE|VALUES|SET)\b/i.test(
          trimmed
        )
      ) {
        return trimmed;
      }

      if (/^((INNER|LEFT|RIGHT|FULL|CROSS)\s+)?JOIN\b/i.test(trimmed)) {
        return trimmed;
      }

      if (/^(AND|OR)\b/i.test(trimmed)) {
        return `${indent}${trimmed}`;
      }

      if (trimmed.startsWith(", ")) {
        return `${indent}${trimmed}`;
      }

      return trimmed;
    })
    .join("\n");
}

function splitByTopLevelComma(value: string) {
  const parts: string[] = [];
  let current = "";
  let depth = 0;
  let quote: "'" | '"' | "`" | null = null;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];

    if (quote) {
      current += char;

      if (char === quote && value[index - 1] !== "\\") {
        quote = null;
      }

      continue;
    }

    if (char === "'" || char === '"' || char === "`") {
      quote = char;
      current += char;
      continue;
    }

    if (char === "(") {
      depth += 1;
      current += char;
      continue;
    }

    if (char === ")") {
      depth = Math.max(depth - 1, 0);
      current += char;
      continue;
    }

    if (char === "," && depth === 0) {
      parts.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  if (current.trim()) {
    parts.push(current);
  }

  return parts;
}

function stripSQLComments(sql: string) {
  return sql
    .replace(/--.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
}

function getSQLStats(sql: string): SQLStats {
  const text = sql || "";
  const normalized = text.toLowerCase();

  return {
    characters: text.length,
    lines: text ? text.split(/\r?\n/).length : 0,
    statements: text.trim()
      ? text.split(";").filter((statement) => statement.trim()).length
      : 0,
    selectCount: countKeyword(normalized, "select"),
    joinCount: countKeyword(normalized, "join"),
    whereCount: countKeyword(normalized, "where"),
    groupByCount: countPhrase(normalized, "group by"),
    orderByCount: countPhrase(normalized, "order by"),
    insertCount: countKeyword(normalized, "insert"),
    updateCount: countKeyword(normalized, "update"),
    deleteCount: countKeyword(normalized, "delete"),
  };
}

function getSQLWarnings(sql: string): QueryWarning[] {
  const warnings: QueryWarning[] = [];
  const normalized = sql.toLowerCase();

  if (/\bselect\s+\*/i.test(sql)) {
    warnings.push({
      title: "SELECT * detected",
      message:
        "SELECT * can make queries harder to review and may return more data than needed.",
    });
  }

  if (/\bdelete\s+from\b/i.test(sql) && !/\bwhere\b/i.test(sql)) {
    warnings.push({
      title: "DELETE without WHERE",
      message:
        "This looks like a DELETE statement without a WHERE clause. Review carefully before running it.",
    });
  }

  if (/\bupdate\b/i.test(sql) && !/\bwhere\b/i.test(sql)) {
    warnings.push({
      title: "UPDATE without WHERE",
      message:
        "This looks like an UPDATE statement without a WHERE clause. Review carefully before running it.",
    });
  }

  if (normalized.includes("drop table") || normalized.includes("truncate table")) {
    warnings.push({
      title: "Destructive statement detected",
      message:
        "DROP or TRUNCATE statements can remove data or schema objects. Confirm the target environment before running.",
    });
  }

  return warnings;
}

function countKeyword(value: string, keyword: string) {
  const matches = value.match(new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "g"));
  return matches ? matches.length : 0;
}

function countPhrase(value: string, phrase: string) {
  const matches = value.match(new RegExp(`\\b${escapeRegExp(phrase)}\\b`, "g"));
  return matches ? matches.length : 0;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
