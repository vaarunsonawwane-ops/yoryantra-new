"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type KeywordCase = "upper" | "lower" | "preserve";
type IndentSize = "two" | "four";
type CommaStyle = "trailing" | "leading";

type SQLStats = {
  characters: number;
  lines: number;
  statements: number;
  selectCount: number;
  joinCount: number;
  whereCount: number;
  groupByCount: number;
  orderByCount: number;
};

type QueryWarning = {
  title: string;
  message: string;
};

type FormatOptions = {
  keywordCase: KeywordCase;
  indentSize: IndentSize;
  commaStyle: CommaStyle;
  breakBeforeJoin: boolean;
  breakBeforeWhere: boolean;
  uppercaseFunctions: boolean;
};

const sampleSql = `select u.id,u.name,u.email,count(o.id) as order_count,sum(o.total) as total_spent from users u left join orders o on o.user_id = u.id where u.active = true and o.created_at >= '2026-01-01' group by u.id,u.name,u.email order by total_spent desc limit 20;`;

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
  "lower",
  "upper",
  "trim",
  "round",
];

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [keywordCase, setKeywordCase] = useState<KeywordCase>("upper");
  const [indentSize, setIndentSize] = useState<IndentSize>("two");
  const [commaStyle, setCommaStyle] = useState<CommaStyle>("trailing");
  const [breakBeforeJoin, setBreakBeforeJoin] = useState(true);
  const [breakBeforeWhere, setBreakBeforeWhere] = useState(true);
  const [uppercaseFunctions, setUppercaseFunctions] = useState(false);
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => getSQLStats(input), [input]);
  const warnings = useMemo(() => getSQLWarnings(input), [input]);

  const formatSQL = () => {
    if (!input.trim()) {
      setError("Please enter SQL input.");
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const formatted = beautifySQL(input, {
        keywordCase,
        indentSize,
        commaStyle,
        breakBeforeJoin,
        breakBeforeWhere,
        uppercaseFunctions,
      });

      setOutput(formatted);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to format this SQL."
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
    setKeywordCase("upper");
    setIndentSize("two");
    setCommaStyle("trailing");
    setBreakBeforeJoin(true);
    setBreakBeforeWhere(true);
    setUppercaseFunctions(false);
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setKeywordCase("upper");
    setIndentSize("two");
    setCommaStyle("trailing");
    setBreakBeforeJoin(true);
    setBreakBeforeWhere(true);
    setUppercaseFunctions(false);
    setCopied(false);
  };

  return (
    <ToolShell
      title="SQL Formatter"
      description="Format SQL queries into a cleaner, readable layout directly in your browser."
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
          Paste a SQL query from logs, database tools, ORM output, reports, or
          scripts to turn it into a cleaner readable format.
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
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
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
                Break before JOIN
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Put JOIN clauses on separate lines for easier review.
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
                Break filters
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Put WHERE, GROUP BY, ORDER BY, AND, and OR on clearer lines.
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
                Uppercase functions
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Format common functions like COUNT, SUM, and COALESCE.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={formatSQL} className="yoryantra-btn">
          Format SQL
        </button>

        <button onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>

        <Link href="/tools/sql-beautifier-minifier" className="yoryantra-btn-outline">
          Advanced SQL Beautifier
        </Link>
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
          A quick look at common SQL clauses found in the input.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DetailCard label="SELECT" value={stats.selectCount.toLocaleString()} />
          <DetailCard label="WHERE" value={stats.whereCount.toLocaleString()} />
          <DetailCard label="GROUP BY" value={stats.groupByCount.toLocaleString()} />
          <DetailCard label="ORDER BY" value={stats.orderByCount.toLocaleString()} />
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Formatted SQL Output
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
          {output || "Formatted SQL output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        SQL formatting happens directly in your browser. Your SQL query is not
        uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Formatting SQL Queries for Quick Reading
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            SQL queries are often copied from logs, admin panels, ORM output,
            database clients, and reporting tools as long one-line statements.
            That makes joins, filters, selected fields, and ordering harder to
            inspect.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This SQL Formatter is meant for quick cleanup. Paste a query, choose
            a few readable formatting options, and copy a cleaner version for
            debugging, review, documentation, or sharing in a ticket.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Formatting SQL Without Changing the Query
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste SQL into the input box.</li>
            <li>Choose keyword case, indentation, and comma style.</li>
            <li>Enable line breaks for joins and filters when needed.</li>
            <li>
              Click <strong>Format SQL</strong> and copy the formatted output.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common SQL Formatter Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Cleaning SQL copied from application logs.</li>
            <li>Making generated ORM SQL easier to inspect.</li>
            <li>Formatting database queries before adding them to notes or tickets.</li>
            <li>Reviewing joins, filters, grouping, and ordering more clearly.</li>
            <li>Preparing readable query examples for documentation.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Simple Formatter vs Advanced SQL Beautifier
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This page is for quick SQL formatting. For minifying SQL, JSON output,
            comment removal, extra warnings, and more advanced formatting
            controls, use the{" "}
            <Link
              href="/tools/sql-beautifier-minifier"
              className="font-semibold text-[var(--green)] hover:underline"
            >
              SQL Beautifier / Minifier
            </Link>
            .
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example SQL Formatting
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
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What does a SQL formatter do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It adds line breaks, indentation, and consistent keyword casing
                so a SQL query is easier to read.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this run my SQL query?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. This tool only formats text. It does not connect to a
                database or execute anything.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Will formatting change the query result?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                The tool is designed to change whitespace and casing, not query
                meaning. Still, always review important SQL before running it.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my SQL uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Formatting happens directly in your browser, and your SQL is
                not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/sql-beautifier-minifier" className="yoryantra-btn-outline">
              SQL Beautifier / Minifier
            </Link>

            <Link href="/tools/json-formatter" className="yoryantra-btn-outline">
              JSON Formatter
            </Link>

            <Link href="/tools/regex-tester" className="yoryantra-btn-outline">
              Regex Tester
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
  let formatted = normalizeSQLSpacing(sql);

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
  };
}

function getSQLWarnings(sql: string): QueryWarning[] {
  const warnings: QueryWarning[] = [];

  if (/\bselect\s+\*/i.test(sql)) {
    warnings.push({
      title: "SELECT * detected",
      message:
        "SELECT * can be useful while debugging, but it may return more data than needed in production queries.",
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
