"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
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

type QueryWarning = { title: string; message: string };
type FormatOptions = {
  keywordCase: KeywordCase;
  indentSize: IndentSize;
  commaStyle: CommaStyle;
  breakBeforeJoin: boolean;
  breakBooleanConditions: boolean;
  uppercaseFunctions: boolean;
};

type ProtectedSQL = { text: string; segments: string[] };

const MAX_SQL_CHARS = 500_000;
const SEGMENT_OPEN = "\uE100";
const SEGMENT_CLOSE = "\uE101";
const FORCED_NEWLINE = "\uE102";

const sampleSql = `select u.id,u.name,u.email,count(o.id) as order_count,sum(o.total) as total_spent from users u left join orders o on o.user_id = u.id where u.active = true and o.note <> 'from here; keep SELECT lowercase' group by u.id,u.name,u.email order by total_spent desc limit 20;`;

const sqlKeywords = [
  "select", "from", "where", "and", "or", "join", "inner", "left", "right", "full", "outer", "cross", "on",
  "group", "by", "having", "order", "limit", "offset", "insert", "into", "values", "update", "set", "delete", "create",
  "alter", "drop", "table", "view", "index", "primary", "key", "foreign", "references", "as", "distinct", "union", "all",
  "case", "when", "then", "else", "end", "is", "null", "not", "in", "exists", "between", "like", "desc", "asc", "with", "returning",
];

const sqlFunctions = ["count", "sum", "avg", "min", "max", "coalesce", "nullif", "cast", "lower", "upper", "trim", "round"];

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [keywordCase, setKeywordCase] = useState<KeywordCase>("upper");
  const [indentSize, setIndentSize] = useState<IndentSize>("two");
  const [commaStyle, setCommaStyle] = useState<CommaStyle>("trailing");
  const [breakBeforeJoin, setBreakBeforeJoin] = useState(true);
  const [breakBooleanConditions, setBreakBooleanConditions] = useState(true);
  const [uppercaseFunctions, setUppercaseFunctions] = useState(false);
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => getSQLStats(input), [input]);
  const warnings = useMemo(() => getSQLWarnings(input), [input]);

  const clearResult = () => {
    setOutput("");
    setError("");
    setCopied(false);
  };

  const formatSQL = () => {
    if (!input.trim()) {
      setError("Enter SQL before formatting.");
      setOutput("");
      setCopied(false);
      return;
    }
    if (input.length > MAX_SQL_CHARS) {
      setError(`SQL exceeds the ${MAX_SQL_CHARS.toLocaleString()}-character browser limit. Format the script in smaller sections.`);
      setOutput("");
      return;
    }

    try {
      const formatted = beautifySQL(input, {
        keywordCase,
        indentSize,
        commaStyle,
        breakBeforeJoin,
        breakBooleanConditions,
        uppercaseFunctions,
      });
      setOutput(formatted);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to format this SQL safely.");
      setOutput("");
      setCopied(false);
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("Copy failed. Select the formatted SQL and copy it manually.");
    }
  };

  const loadExample = () => {
    setInput(sampleSql);
    setOutput("");
    setError("");
    setKeywordCase("upper");
    setIndentSize("two");
    setCommaStyle("trailing");
    setBreakBeforeJoin(true);
    setBreakBooleanConditions(true);
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
    setBreakBooleanConditions(true);
    setUppercaseFunctions(false);
    setCopied(false);
  };

  return (
    <ToolShell
      title="SQL Formatter"
      description="Reflow SQL clauses and lists without rewriting quoted text or comments."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="mb-2 block text-sm font-medium text-gray-700">SQL input</label>
        <textarea
          value={input}
          onChange={(event: { target: { value: string } }) => {
            setInput(event.target.value);
            clearResult();
          }}
          placeholder={sampleSql}
          className="min-h-[340px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Quoted strings, quoted identifiers, line comments, block comments, and PostgreSQL-style dollar-quoted bodies are protected before spacing and keyword changes are applied.
        </p>
      </div>

      <div className="mt-6 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Characters" value={stats.characters.toLocaleString()} />
        <SummaryCard label="Lines" value={stats.lines.toLocaleString()} />
        <SummaryCard label="Statements" value={stats.statements.toLocaleString()} />
        <SummaryCard label="Joins" value={stats.joinCount.toLocaleString()} />
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Layout choices</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <YoryantraSelect
            label="Keyword Case"
            value={keywordCase}
            onChange={(value: string) => { setKeywordCase(value as KeywordCase); clearResult(); }}
            options={[
              { label: "UPPERCASE", value: "upper" },
              { label: "lowercase", value: "lower" },
              { label: "Preserve", value: "preserve" },
            ]}
          />
          <YoryantraSelect
            label="Indent Size"
            value={indentSize}
            onChange={(value: string) => { setIndentSize(value as IndentSize); clearResult(); }}
            options={[{ label: "2 spaces", value: "two" }, { label: "4 spaces", value: "four" }]}
          />
          <YoryantraSelect
            label="Comma Style"
            value={commaStyle}
            onChange={(value: string) => { setCommaStyle(value as CommaStyle); clearResult(); }}
            options={[{ label: "Trailing commas", value: "trailing" }, { label: "Leading commas", value: "leading" }]}
          />
        </div>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-3">
          <Toggle
            checked={breakBeforeJoin}
            onChange={(value) => { setBreakBeforeJoin(value); clearResult(); }}
            title="Break before JOIN"
            detail="Place JOIN clauses on their own lines."
          />
          <Toggle
            checked={breakBooleanConditions}
            onChange={(value) => { setBreakBooleanConditions(value); clearResult(); }}
            title="Break AND / OR conditions"
            detail="Indent top-level boolean continuations for faster scanning."
          />
          <Toggle
            checked={uppercaseFunctions}
            onChange={(value) => { setUppercaseFunctions(value); clearResult(); }}
            title="Case common functions"
            detail="Apply the selected keyword case to names such as COUNT and COALESCE."
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={formatSQL} className="yoryantra-btn min-h-[44px] whitespace-nowrap">Format SQL</button>
        <button onClick={loadExample} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap">Load Example</button>
        <button onClick={resetAll} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap">Reset</button>
        <Link href="/tools/sql-beautifier-minifier" className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap">Advanced SQL Beautifier</Link>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">{error}</div>
      )}

      {warnings.length > 0 && (
        <div className="mt-6 self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">Query cautions found in executable text</h3>
          <div className="mt-3 space-y-3">
            {warnings.map((warning) => (
              <div key={`${warning.title}-${warning.message}`}>
                <p className="text-sm font-semibold text-amber-900">{warning.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-amber-800">{warning.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">Clause snapshot</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Counts ignore protected strings and comments, so words such as SELECT inside a message do not inflate the result.
        </p>
        <div className="mt-4 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DetailCard label="SELECT" value={stats.selectCount.toLocaleString()} />
          <DetailCard label="WHERE" value={stats.whereCount.toLocaleString()} />
          <DetailCard label="GROUP BY" value={stats.groupByCount.toLocaleString()} />
          <DetailCard label="ORDER BY" value={stats.orderByCount.toLocaleString()} />
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Formatted SQL output</h3>
          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
        <pre className="yoryantra-output min-h-[320px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "Formatted SQL will appear here."}
        </pre>
      </div>

      <div className="mt-6 grid items-start gap-4 md:grid-cols-2">
        <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
          <strong className="text-amber-900">Formatting is not SQL validation.</strong>{" "}
          SQL dialects disagree about keywords, operators, quoting, procedural blocks, and extensions. Review important output in the database engine that will actually parse it.
        </div>
        <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
          Formatting runs in this browser session. The page does not connect to a database, execute the query, or send the SQL to Yoryantra.
        </div>
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Whitespace is easy; SQL lexical boundaries are not</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A formatter that blindly replaces spaces or uppercases words can alter text inside a string literal, quoted identifier, or comment. A semicolon inside <code className="rounded bg-gray-100 px-1">'message; still text'</code> is not a statement boundary either. The formatting pass therefore protects those regions first, changes only the surrounding SQL text, and restores the protected content afterward.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The same protection covers PostgreSQL dollar-quoted bodies, backtick-quoted names commonly seen in MySQL-family syntax, and bracketed identifiers used by SQL Server-style syntax. Supporting those lexical forms does not make the formatter a parser for every dialect; it simply avoids treating their contents as ordinary code.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What the formatter deliberately changes</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-gray-600">
            <li>Selected keyword casing outside protected text.</li>
            <li>Spacing around common comparison operators and commas.</li>
            <li>Line breaks around major clauses, joins, and optional AND / OR continuations.</li>
            <li>Top-level SELECT-list commas when they can be separated without entering parentheses or protected text.</li>
          </ul>
          <p className="mt-4 leading-relaxed text-gray-600">
            It does not execute SQL, resolve schemas, validate column names, infer a database dialect, or prove that the formatted statement is semantically equivalent. Keyword-versus-identifier meaning can require a real dialect parser.
          </p>
        </div>

        <div className="grid items-start gap-5 md:grid-cols-2">
          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-lg font-semibold text-gray-900">Line comments need their newline</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              <code className="rounded bg-white px-1">-- comment</code> extends to the end of its line. Removing that line break can accidentally comment out the next clause. The protected representation carries a forced newline marker so formatting cannot merge following SQL into the comment.
            </p>
          </div>
          <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="text-lg font-semibold text-amber-900">Data-changing statements deserve a second check</h2>
            <p className="mt-3 text-sm leading-relaxed text-amber-800">
              Simple cautions flag UPDATE or DELETE statements that appear to lack WHERE in their own statement, plus SELECT *. These are reading aids, not a safety proof: CTEs, subqueries, dialect syntax, and dynamic SQL can make regex-level warnings incomplete.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">A formatting example that preserves literal text</h2>
          <div className="mt-4 overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <pre className="whitespace-pre-wrap break-words">{`Before:\nselect id,note from logs where note='select a,b; from text' and active=true;\n\nAfter:\nSELECT\n  id,\n  note\nFROM logs\nWHERE note = 'select a,b; from text'\n  AND active = true;`}</pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Why PostgreSQL&apos;s lexical documentation is a useful reference</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            PostgreSQL&apos;s current{" "}
            <a href="https://www.postgresql.org/docs/current/sql-syntax-lexical.html" target="_blank" rel="noreferrer" className="font-semibold text-[var(--green)] hover:underline">lexical structure documentation</a>{" "}
            gives concrete examples of tokens, quoted identifiers, string constants, dollar quoting, statement semicolons, and both line and block comments. It is referenced here for lexical behavior the formatter protects, not as a claim that PostgreSQL syntax represents every SQL implementation.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">When the advanced formatter is the better fit</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            This page keeps the control set intentionally narrow. Minification, comment-removal choices, alternate output forms, and deeper diagnostics belong in the{" "}
            <Link href="/tools/sql-beautifier-minifier" className="font-semibold text-[var(--green)] hover:underline">SQL Beautifier / Minifier</Link>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/sql-formatter" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function Toggle({ checked, onChange, title, detail }: { checked: boolean; onChange: (value: boolean) => void; title: string; detail: string }) {
  return (
    <label className="self-start flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-white p-4">
      <input type="checkbox" checked={checked} onChange={(event: { target: { checked: boolean } }) => onChange(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]" />
      <span>
        <span className="block text-sm font-medium text-gray-900">{title}</span>
        <span className="mt-1 block text-sm leading-relaxed text-gray-500">{detail}</span>
      </span>
    </label>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 break-words font-mono text-sm text-gray-900">{value}</div>
    </div>
  );
}

function beautifySQL(sql: string, options: FormatOptions) {
  const indent = options.indentSize === "four" ? "    " : "  ";
  const protectedSql = protectSQLSegments(sql, true);
  let formatted = normalizeSQLSpacing(protectedSql.text);

  formatted = applyKeywordCase(formatted, options.keywordCase);
  if (options.uppercaseFunctions) formatted = applyFunctionCase(formatted, options.keywordCase);

  formatted = formatted.replace(/\s*,\s*/g, ", ").replace(/\s*;\s*/g, ";\n").trim();

  ["INSERT INTO", "DELETE FROM", "GROUP BY", "ORDER BY", "UNION ALL", "SELECT", "FROM", "WHERE", "HAVING", "LIMIT", "OFFSET", "RETURNING", "VALUES", "SET", "UNION"].forEach((clause) => {
    const regex = new RegExp(`\\s+(${escapeRegExp(clause)})\\s+`, "gi");
    formatted = formatted.replace(regex, `\n$1 `);
  });

  if (options.breakBeforeJoin) {
    formatted = formatted.replace(/\s+((?:(?:INNER|LEFT|RIGHT|FULL|CROSS)\s+)?JOIN)\s+/gi, "\n$1 ");
  }

  if (options.breakBooleanConditions) {
    formatted = formatted.replace(/\s+(AND|OR)\s+/gi, `\n${indent}$1 `);
  }

  formatted = formatSelectList(formatted, indent, options.commaStyle);
  formatted = indentContinuationLines(formatted, indent);
  formatted = formatted
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .filter((line, index, lines) => !(line.trim() === "" && lines[index - 1]?.trim() === ""))
    .join("\n")
    .trim();

  return restoreSQLSegments(formatted, protectedSql.segments).trim();
}

function normalizeSQLSpacing(sql: string) {
  return sql
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ ]+/g, " ")
    .replace(/(^|[^<>=!:+\-*\/~#@?|&^%])\s*(<>|!=|>=|<=|=|>|<)\s*(?=[^<>=!:+\-*\/~#@?|&^%]|$)/g, "$1 $2 ")
    .replace(/\s+/g, " ")
    .trim();
}

function applyKeywordCase(sql: string, keywordCase: KeywordCase) {
  if (keywordCase === "preserve") return sql;
  let result = sql;
  sqlKeywords.slice().sort((a, b) => b.length - a.length).forEach((keyword) => {
    const replacement = keywordCase === "upper" ? keyword.toUpperCase() : keyword.toLowerCase();
    result = result.replace(new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "gi"), replacement);
  });
  return result;
}

function applyFunctionCase(sql: string, keywordCase: KeywordCase) {
  if (keywordCase === "preserve") return sql;
  let result = sql;
  sqlFunctions.forEach((fn) => {
    const replacement = keywordCase === "lower" ? fn.toLowerCase() : fn.toUpperCase();
    result = result.replace(new RegExp(`\\b${escapeRegExp(fn)}\\s*\\(`, "gi"), `${replacement}(`);
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
      if (parts.length <= 1) {
        nextLines.push(line);
        return;
      }
      nextLines.push(trimmed.slice(0, 6).toUpperCase() === "SELECT" ? trimmed.slice(0, 6) : "SELECT");
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
    if (/^(SELECT|FROM|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|OFFSET|RETURNING|INSERT|UPDATE|DELETE|VALUES|SET|UNION)\b/i.test(trimmed)) return trimmed;
    if (/^((INNER|LEFT|RIGHT|FULL|CROSS)\s+)?JOIN\b/i.test(trimmed)) return trimmed;
    if (/^(AND|OR)\b/i.test(trimmed)) return `${indent}${trimmed}`;
    if (trimmed.startsWith(", ")) return `${indent}${trimmed}`;
    return line.startsWith(indent) ? line : trimmed;
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

    if (char === "," && depth === 0) {
      parts.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  if (current.trim()) parts.push(current);
  return parts;
}

function protectSQLSegments(sql: string, strict: boolean): ProtectedSQL {
  const segments: string[] = [];
  let result = "";
  let index = 0;

  const addSegment = (value: string) => {
    const id = segments.length;
    segments.push(value);
    result += `${SEGMENT_OPEN}${id}${SEGMENT_CLOSE}`;
  };

  while (index < sql.length) {
    const char = sql[index];
    const next = sql[index + 1];

    if (char === "\r" || char === "\n") {
      if (char === "\r" && next === "\n") index += 2;
      else index += 1;
      result += `${FORCED_NEWLINE} `;
      continue;
    }

    if (char === "-" && next === "-") {
      let end = index + 2;
      while (end < sql.length && sql[end] !== "\n" && sql[end] !== "\r") end += 1;
      addSegment(sql.slice(index, end));
      if (end < sql.length) {
        if (sql[end] === "\r" && sql[end + 1] === "\n") end += 2;
        else end += 1;
        result += FORCED_NEWLINE;
      }
      index = end;
      continue;
    }

    if (char === "/" && next === "*") {
      let end = index + 2;
      let depth = 1;
      while (end < sql.length && depth > 0) {
        if (sql[end] === "/" && sql[end + 1] === "*") { depth += 1; end += 2; continue; }
        if (sql[end] === "*" && sql[end + 1] === "/") { depth -= 1; end += 2; continue; }
        end += 1;
      }
      if (depth > 0 && strict) throw new Error("A /* block comment is not closed. Close it before formatting so following SQL is not mistaken for comment text.");
      addSegment(sql.slice(index, end));
      index = end;
      continue;
    }

    if (char === "$") {
      const opener = sql.slice(index).match(/^\$(?:[A-Za-z_][A-Za-z0-9_]*)?\$/)?.[0];
      if (opener) {
        const endAt = sql.indexOf(opener, index + opener.length);
        if (endAt === -1) {
          if (strict) throw new Error(`Dollar-quoted block ${opener} is not closed.`);
          addSegment(sql.slice(index));
          break;
        }
        const end = endAt + opener.length;
        addSegment(sql.slice(index, end));
        index = end;
        continue;
      }
    }

    if (char === "'" || char === '"' || char === "`") {
      const quote = char;
      let end = index + 1;
      let closed = false;
      while (end < sql.length) {
        if (sql[end] === "\\" && end + 1 < sql.length) { end += 2; continue; }
        if (sql[end] === quote) {
          if (sql[end + 1] === quote) { end += 2; continue; }
          end += 1;
          closed = true;
          break;
        }
        end += 1;
      }
      if (!closed && strict) throw new Error(`Quoted SQL segment beginning with ${quote} is not closed.`);
      addSegment(sql.slice(index, end));
      index = end;
      continue;
    }

    if (char === "[") {
      let end = index + 1;
      let closed = false;
      while (end < sql.length) {
        if (sql[end] === "]" && sql[end + 1] === "]") { end += 2; continue; }
        if (sql[end] === "]") { end += 1; closed = true; break; }
        end += 1;
      }
      if (!closed && strict) throw new Error("Bracketed identifier is not closed with ].");
      addSegment(sql.slice(index, end));
      index = end;
      continue;
    }

    result += char;
    index += 1;
  }

  return { text: result, segments };
}

function restoreSQLSegments(sql: string, segments: string[]) {
  return sql
    .replace(new RegExp(`${SEGMENT_OPEN}(\\d+)${SEGMENT_CLOSE}`, "g"), (_match, rawIndex: string) => segments[Number(rawIndex)] ?? "")
    .replace(new RegExp(FORCED_NEWLINE, "g"), "\n");
}

function analysisCode(sql: string) {
  try {
    return protectSQLSegments(sql, false).text.replace(new RegExp(FORCED_NEWLINE, "g"), " ");
  } catch {
    return sql;
  }
}

function getSQLStats(sql: string): SQLStats {
  const code = analysisCode(sql);
  const normalized = code.toLowerCase();
  const statementParts = code.split(";");
  const statements = statementParts.filter((part) => hasExecutableText(part)).length;

  return {
    characters: sql.length,
    lines: sql ? sql.split(/\r\n|\r|\n/).length : 0,
    statements,
    selectCount: countKeyword(normalized, "select"),
    joinCount: countKeyword(normalized, "join"),
    whereCount: countKeyword(normalized, "where"),
    groupByCount: countPhrase(normalized, "group by"),
    orderByCount: countPhrase(normalized, "order by"),
  };
}

function getSQLWarnings(sql: string): QueryWarning[] {
  const code = analysisCode(sql);
  const warnings: QueryWarning[] = [];
  const statements = code.split(";").filter((part) => hasExecutableText(part));

  statements.forEach((statement, index) => {
    const number = statements.length > 1 ? ` in statement ${index + 1}` : "";
    if (/\bselect\s+\*/i.test(statement)) {
      warnings.push({ title: `SELECT *${number}`, message: "Selecting every column can be intentional, but it can also pull more data than expected or make callers depend on schema changes." });
    }
    if (/\bdelete\s+from\b/i.test(statement) && !/\bwhere\b/i.test(statement)) {
      warnings.push({ title: `DELETE without WHERE${number}`, message: "The executable text appears to contain DELETE without a WHERE clause. Confirm the intended row scope in the target database before running it." });
    }
    if (/\bupdate\b/i.test(statement) && !/\bwhere\b/i.test(statement)) {
      warnings.push({ title: `UPDATE without WHERE${number}`, message: "The executable text appears to contain UPDATE without a WHERE clause. Confirm the intended row scope in the target database before running it." });
    }
  });

  return warnings;
}

function hasExecutableText(value: string) {
  const withoutSegments = value
    .replace(new RegExp(`${SEGMENT_OPEN}\\d+${SEGMENT_CLOSE}`, "g"), "")
    .replace(new RegExp(FORCED_NEWLINE, "g"), "")
    .trim();
  return withoutSegments.length > 0;
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
