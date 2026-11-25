"use client";

import { useId, useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import { beautifySQL, minifySQL, getSQLStats, getSQLWarnings, MAX_SQL_CHARS, type FormatOptions, type KeywordCase, type IndentSize, type CommaStyle } from "./sql-workflow";

type Action = "beautify" | "minify";
type OutputFormat = "sql" | "json";
const sampleSql = `select u.id,u.name,count(o.id) as order_count from users u left join orders o on o.user_id=u.id where u.name='Sneha' and o.note <> 'from here; keep SELECT lowercase' group by u.id,u.name order by order_count desc;`;
const defaults: FormatOptions = { keywordCase: "upper", indentSize: "two", commaStyle: "trailing", breakBeforeJoin: true, breakBooleanConditions: true, functionCase: "preserve", removeComments: false };
const tasks = [{ label: "Format SQL", value: "beautify" }, { label: "Minify SQL", value: "minify" }];

type Option = { label: string; value: string };
function Setting({label, value, onChange, options}: {label: string; value: string; onChange: (v: string) => void; options: Option[]}) {
  return <YoryantraSelect label={label} value={value} onChange={onChange} options={options} />;
}
function Toggle({ checked, onChange, children }: { checked: boolean; onChange: (value: boolean) => void; children: string }) {
  return <label className="flex cursor-pointer items-start gap-2 text-sm leading-relaxed text-gray-900"><input type="checkbox" checked={checked} onChange={(event: {target: {checked: boolean}}) => onChange(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]" /><span>{children}</span></label>;
}
function Metric({ label, value }: { label: string; value: number }) {
  return <div><p className="text-xs font-medium uppercase tracking-wide text-gray-600">{label}</p><p className="mt-1 font-mono text-base font-semibold text-gray-900">{value.toLocaleString()}</p></div>;
}

export default function ToolClient() {
  const inputId = useId();
  const [input, setInput] = useState("");
  const [action, setAction] = useState<Action>("beautify");
  const [options, setOptions] = useState<FormatOptions>(defaults);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("sql");
  const [result, setResult] = useState<{sql: string; action: Action} | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const overLimit = input.length > MAX_SQL_CHARS;
  const stats = useMemo(() => getSQLStats(overLimit ? "" : input), [input, overLimit]);
  const queryStructure = [
    ["SELECT", stats.selectCount],
    ["WHERE", stats.whereCount],
    ["GROUP BY", stats.groupByCount],
    ["ORDER BY", stats.orderByCount],
    ["INSERT", stats.insertCount],
    ["UPDATE", stats.updateCount],
    ["DELETE", stats.deleteCount],
    ["JOIN", stats.joinCount],
  ] as const;
  const warnings = useMemo(() => overLimit ? [] : getSQLWarnings(input, options.removeComments), [input, overLimit, options.removeComments]);
  const output = useMemo(() => result ? outputFormat === "json" ? JSON.stringify({ action: result.action, sql: result.sql, stats: getSQLStats(result.sql) }, null, 2) : result.sql : "", [result, outputFormat]);
  const clearResult = () => { setResult(null); setError(""); setCopied(false); };
  const changeOption = <K extends keyof FormatOptions>(key: K, value: FormatOptions[K]) => { setOptions(current => ({ ...current, [key]: value })); clearResult(); };
  const changeAction = (value: Action) => { setAction(value); clearResult(); };
  const processSQL = () => {
    clearResult();
    if (!input.trim()) { setError("Enter SQL before formatting or minifying."); return; }
    if (overLimit) { setError(`SQL exceeds the ${MAX_SQL_CHARS.toLocaleString()}-character browser limit. Format the script in smaller sections.`); return; }
    try { setResult({ action, sql: action === "minify" ? minifySQL(input, options.removeComments) : beautifySQL(input, options) }); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to process this SQL safely."); }
  };
  const copyOutput = async () => {
    if (!output) return;
    try { await navigator.clipboard.writeText(output); setCopied(true); window.setTimeout(() => setCopied(false), 1400); }
    catch { setError("Copy failed. Select the SQL output and copy it manually."); }
  };
  const resetSettings = () => { setOptions(defaults); setOutputFormat("sql"); clearResult(); };
  const loadExample = () => { setInput(sampleSql); resetSettings(); };
  const resetAll = () => { setInput(""); resetSettings(); };
  const sendResult = () => {
    if (!result || !result.sql) return;
    setInput(result.sql);
    setAction(action === "minify" ? "beautify" : "minify");
    clearResult();
  };

  return (
    <ToolShell layout="plain" title="SQL Formatter" description="Format SQL clauses and lists or minify SQL while protecting quoted text and comments.">
      <div className="mb-10">
        <p className="leading-relaxed text-gray-600">Format SQL or minify SQL, with optional comment removal and SQL or JSON output.</p>
        <div className="mt-3 w-full max-w-[20rem]"><YoryantraSelect variant="task" label="What do you want to do?" value={action} onChange={value => changeAction(value as Action)} options={tasks} /></div>
      </div>
      <div>
        <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-gray-700">SQL input</label>
        <textarea id={inputId} value={input} onChange={(event: { target: { value: string } }) => { setInput(event.target.value); clearResult(); }} placeholder={sampleSql} className="min-h-[300px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]" />
        <p className="mt-2 text-sm leading-relaxed text-gray-600">Quoted strings, quoted identifiers, line comments, block comments, and PostgreSQL-style dollar-quoted bodies are protected before spacing and keyword changes are applied.</p>
      </div>
      {!overLimit && <div className="mt-6 grid gap-x-6 gap-y-3 grid-cols-2 sm:grid-cols-3">
        <Metric label="Characters" value={stats.characters} /><Metric label="Lines" value={stats.lines} /><Metric label="Statements" value={stats.statements} />
      </div>}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">{action === "beautify" ? "Layout choices" : "Minification options"}</h2>
        {action === "beautify" && <div className="mt-4 grid max-w-[44rem] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Setting label="Keyword Case" value={options.keywordCase} onChange={value => changeOption("keywordCase", value as KeywordCase)} options={[{label:"UPPERCASE", value:"upper"},{label:"lowercase",value:"lower"},{label:"Preserve",value:"preserve"}]} />
          <Setting label="Indent Size" value={options.indentSize} onChange={value => changeOption("indentSize", value as IndentSize)} options={[{label:"2 spaces",value:"two"},{label:"4 spaces",value:"four"}]} />
          <Setting label="Comma Style" value={options.commaStyle} onChange={value => changeOption("commaStyle", value as CommaStyle)} options={[{label:"Trailing commas",value:"trailing"},{label:"Leading commas",value:"leading"}]} />
          <Setting label="Common function case" value={options.functionCase} onChange={value => changeOption("functionCase", value as FormatOptions["functionCase"])} options={[{label:"Preserve",value:"preserve"},{label:"Match keyword case",value:"keyword"},{label:"UPPERCASE",value:"upper"}]} />
          <Setting label="Output Format" value={outputFormat} onChange={value => { setOutputFormat(value as OutputFormat); setCopied(false); }} options={[{label:"SQL",value:"sql"},{label:"JSON",value:"json"}]} />
        </div>}
        {action === "minify" && <div className="mt-4 w-full max-w-44"><Setting label="Output Format" value={outputFormat} onChange={value => { setOutputFormat(value as OutputFormat); setCopied(false); }} options={[{label:"SQL",value:"sql"},{label:"JSON",value:"json"}]} /></div>}
        <div className="mt-5 flex flex-wrap items-start gap-x-8 gap-y-3">
          {action === "beautify" && <><Toggle checked={options.breakBeforeJoin} onChange={value => changeOption("breakBeforeJoin", value)}>Break before JOIN</Toggle><Toggle checked={options.breakBooleanConditions} onChange={value => changeOption("breakBooleanConditions", value)}>Break AND / OR conditions</Toggle></>}
          <Toggle checked={options.removeComments} onChange={value => changeOption("removeComments", value)}>Remove SQL comments</Toggle>
        </div>
        {options.removeComments && <p className="mt-2 text-sm leading-relaxed text-gray-600">Ordinary comments are removed. MySQL version comments and optimizer hints are preserved because they can affect execution.</p>}
      </section>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={processSQL} className="yoryantra-btn whitespace-nowrap">{action === "minify" ? "Minify SQL" : "Format SQL"}</button>
        <button type="button" onClick={loadExample} className="yoryantra-btn-outline whitespace-nowrap">Load Example</button>
        <button type="button" onClick={resetAll} className="yoryantra-btn-outline whitespace-nowrap">Reset</button>
      </div>
      {(error || overLimit) && <p role="alert" className="mt-4 text-sm leading-relaxed text-red-700">{error || `SQL exceeds the ${MAX_SQL_CHARS.toLocaleString()}-character browser limit.`}</p>}
      {warnings.length > 0 && <section className="mt-8 text-amber-800"><h2 className="text-base font-semibold">SQL review notes</h2><div className="mt-3 space-y-3">{warnings.map(warning => <div key={`${warning.title}-${warning.message}`}><p className="font-medium">{warning.title}</p><p className="mt-1 text-sm leading-relaxed">{warning.message}</p></div>)}</div></section>}
      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold text-gray-900">SQL Output</h2>{output && <button type="button" onClick={copyOutput} className="yoryantra-btn-outline whitespace-nowrap">{copied ? "Copied" : "Copy"}</button>}</div>
        <pre aria-live="polite" className="yoryantra-output min-h-[240px] overflow-auto whitespace-pre-wrap break-words text-sm">{output || (result ? "No SQL remains after processing." : "Formatted or minified SQL output will appear here.")}</pre>
        {result?.sql && <div className="mt-4"><button type="button" onClick={sendResult} className="yoryantra-btn-outline">{action === "minify" ? "Send to Format SQL" : "Send to Minify SQL"}</button><p className="mt-2 text-sm text-gray-600">Uses the SQL result as input for the other operation.</p></div>}
      </section>
      {!overLimit && <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Query Structure Preview</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">Counts ignore protected strings and comments, so words such as SELECT inside a message do not inflate the result.</p>
        <div className="mt-4 w-full overflow-hidden rounded-xl border border-gray-200">
          <table aria-label="Query structure counts" className="hidden w-full table-fixed border-collapse text-left text-sm md:table">
            <colgroup><col className="w-[38%]" /><col className="w-[12%]" /><col className="w-[38%]" /><col className="w-[12%]" /></colgroup>
            <thead className="bg-gray-50 text-gray-900">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">SQL keyword / clause</th>
                <th id={`${inputId}-structure-count-left`} scope="col" className="px-4 py-3 text-center font-semibold">Count</th>
                <th scope="col" className="px-4 py-3 font-semibold">SQL keyword / clause</th>
                <th id={`${inputId}-structure-count-right`} scope="col" className="px-4 py-3 text-center font-semibold">Count</th>
              </tr>
            </thead>
            <tbody className="text-gray-900">
              {queryStructure.slice(0, 4).map(([label, count], index) => {
                const [otherLabel, otherCount] = queryStructure[index + 4];
                return (
                  <tr key={label} className="border-t border-gray-200">
                    <th id={`${inputId}-structure-${index}`} className="px-4 py-2 font-mono font-medium">{label}</th>
                    <td headers={`${inputId}-structure-${index} ${inputId}-structure-count-left`} className="px-4 py-2 text-center font-mono tabular-nums">{count.toLocaleString()}</td>
                    <th id={`${inputId}-structure-${index + 4}`} className="px-4 py-2 font-mono font-medium">{otherLabel}</th>
                    <td headers={`${inputId}-structure-${index + 4} ${inputId}-structure-count-right`} className="px-4 py-2 text-center font-mono tabular-nums">{otherCount.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <table aria-label="Query structure counts" className="w-full table-fixed border-collapse text-left text-sm md:hidden">
            <thead className="bg-gray-50 text-gray-900">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">SQL keyword / clause</th>
                <th scope="col" className="w-24 px-4 py-3 text-center font-semibold">Count</th>
              </tr>
            </thead>
            <tbody className="text-gray-900">
              {queryStructure.map(([label, count]) => (
                <tr key={label} className="border-t border-gray-200">
                  <th scope="row" className="px-4 py-2 font-mono font-medium">{label}</th>
                  <td className="px-4 py-2 text-center font-mono tabular-nums">{count.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>}
      <p className="mt-6 leading-relaxed text-gray-600">Formatting does not execute the query, connect to a database, or prove that the output is valid for a particular SQL dialect.</p>
      <section className="mt-12 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Why SQL quotes and comments need protection</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            When you format SQL, the words inside a quoted string or a comment should stay exactly as written. Even the semicolon inside <code className="rounded bg-gray-100 px-1">'message; still text'</code> is part of the message, not the end of a statement. This formatter sets those parts aside, formats the SQL around them, and puts them back unchanged.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The same approach protects PostgreSQL dollar-quoted text, MySQL-style names in backticks, and SQL Server-style names in square brackets. It helps preserve those parts of a query, but it does not mean the formatter understands every database dialect.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What the formatter changes</h2>
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
          <div className="self-start">
            <h2 className="text-lg font-semibold text-gray-900">Keep the line break after a -- comment</h2>
            <p className="mt-3 leading-relaxed text-gray-600">
              When you write <code className="rounded bg-gray-100 px-1">-- comment</code>, the comment ends at the next line break. If a formatter removes that break, it can turn the next SQL clause into part of the comment. Yoryantra keeps the line break in place.
            </p>
          </div>
          <div className="self-start">
            <h2 className="text-lg font-semibold text-gray-900">Data-changing statements deserve a second check</h2>
            <p className="mt-3 leading-relaxed text-gray-600">
              The tool flags some UPDATE or DELETE statements with no outer WHERE clause, even when a nested query contains WHERE. It also flags SELECT *. These warnings are reminders, not a safety check: database-specific syntax and dynamic SQL can still need closer review.
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
            <a href="https://www.postgresql.org/docs/current/sql-syntax-lexical.html" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-2">lexical structure documentation</a>{" "}
            gives concrete examples of tokens, quoted identifiers, string constants, dollar quoting, statement semicolons, and both line and block comments. It is referenced here for lexical behavior the formatter protects, not as a claim that PostgreSQL syntax represents every SQL implementation.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Minifying Is Not SQL Compression</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Minification removes formatting whitespace outside protected lexical regions. It does not rewrite expressions, optimize the query plan, shorten identifiers, or change parameter values. Ordinary comments can be removed, but comments with execution meaning such as MySQL <code className="rounded bg-gray-100 px-1 font-mono text-sm">/*! ... */</code> version comments and <code className="rounded bg-gray-100 px-1 font-mono text-sm">/*+ ... */</code> optimizer hints are preserved.
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
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools presentation="links" currentHref="/tools/sql-formatter" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
