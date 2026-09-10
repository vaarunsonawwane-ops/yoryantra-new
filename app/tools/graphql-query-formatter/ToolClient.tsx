"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "formatted" | "minified" | "summary" | "jsonPayload" | "curl" | "variables";
type IndentSize = "2" | "4";
type RequestMethod = "POST" | "GET";

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type OperationInfo = {
  type: "query" | "mutation" | "subscription" | "anonymous" | "fragment";
  name: string;
};

type GraphqlResult = {
  output: string;
  formatted: string;
  minified: string;
  operations: OperationInfo[];
  fragments: string[];
  variables: string[];
  variablesJsonStatus: string;
  issueCount: number;
  issues: Issue[];
};

const sampleQuery = `query GetUserProfile($id: ID!, $includePosts: Boolean!) {
  user(id: $id) {
    id
    name
    email
    posts @include(if: $includePosts) {
      id
      title
      publishedAt
    }
  }
}

fragment UserCard on User {
  id
  name
}`;

const sampleVariables = `{
  "id": "user_123",
  "includePosts": true
}`;

export default function ToolClient() {
  const [query, setQuery] = useState("");
  const [variablesJson, setVariablesJson] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [operationName, setOperationName] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("formatted");
  const [indentSize, setIndentSize] = useState<IndentSize>("2");
  const [requestMethod, setRequestMethod] = useState<RequestMethod>("POST");
  const [includeVariables, setIncludeVariables] = useState(true);
  const [includeOperationName, setIncludeOperationName] = useState(true);
  const [removeComments, setRemoveComments] = useState(true);
  const [warnAnonymousOperation, setWarnAnonymousOperation] = useState(true);
  const [warnMissingVariables, setWarnMissingVariables] = useState(true);
  const [warnMultipleOperations, setWarnMultipleOperations] = useState(true);
  const [result, setResult] = useState<GraphqlResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getNotes(result) : []), [result]);

  const clearResult = () => {
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const formatQuery = () => {
    if (!query.trim()) {
      setError("Please paste a GraphQL query, mutation, subscription, or fragment.");
      setResult(null);
      setOutput("");
      return;
    }

    try {
      const next = buildGraphqlOutput({
        query,
        variablesJson,
        endpoint,
        operationName,
        outputMode,
        indentSize,
        requestMethod,
        includeVariables,
        includeOperationName,
        removeComments,
        warnAnonymousOperation,
        warnMissingVariables,
        warnMultipleOperations,
      });

      setResult(next);
      setOutput(next.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to format this GraphQL input.");
      setResult(null);
      setOutput("");
    }
  };

  const copyOutput = async () => {
    if (!output) return;

    await navigator.clipboard.writeText(output);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1400);
  };

  const loadExample = () => {
    setQuery(sampleQuery);
    setVariablesJson(sampleVariables);
    setEndpoint("https://api.example.com/graphql");
    setOperationName("GetUserProfile");
    setOutputMode("formatted");
    setIndentSize("2");
    setRequestMethod("POST");
    setIncludeVariables(true);
    setIncludeOperationName(true);
    setRemoveComments(true);
    setWarnAnonymousOperation(true);
    setWarnMissingVariables(true);
    setWarnMultipleOperations(true);
    clearResult();
  };

  const resetAll = () => {
    setQuery("");
    setVariablesJson("");
    setEndpoint("");
    setOperationName("");
    setOutputMode("formatted");
    setIndentSize("2");
    setRequestMethod("POST");
    setIncludeVariables(true);
    setIncludeOperationName(true);
    setRemoveComments(true);
    setWarnAnonymousOperation(true);
    setWarnMissingVariables(true);
    setWarnMultipleOperations(true);
    clearResult();
  };

  return (
    <ToolShell
      title="GraphQL Query Formatter"
      description="Reformat GraphQL source, preserve lexical meaning, inspect operations and variables, and build JSON or cURL requests."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900">
              GraphQL Query
            </label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Paste a query, mutation, subscription, fragment, or copied request body query string.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/70 px-4 py-2.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Query editor
              </span>
              <span className="text-xs font-medium text-gray-400">
                Local only
              </span>
            </div>

            <textarea
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                clearResult();
              }}
              placeholder={sampleQuery}
              spellCheck={false}
              className="block w-full min-h-[420px] resize-y border-0 bg-white p-4 text-sm leading-6 font-mono outline-none placeholder:text-gray-400 focus:ring-0"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900">
              Request Context
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Optional values used when generating request payloads or cURL output.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Variables JSON
              </label>

              <textarea
                value={variablesJson}
                onChange={(event) => {
                  setVariablesJson(event.target.value);
                  clearResult();
                }}
                placeholder={sampleVariables}
                className="w-full min-h-[260px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--light-gold)]"
              />

              <p className="mt-2 text-sm text-gray-500">
                Leave empty when the query does not need variables.
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
              <InputField
                label="GraphQL Endpoint"
                value={endpoint}
                onChange={(value) => {
                  setEndpoint(value);
                  clearResult();
                }}
                placeholder="https://api.example.com/graphql"
              />

              <p className="mt-2 text-sm text-gray-500">
                Used only for cURL output. The placeholder is not sent unless you generate a cURL example without an endpoint.
              </p>

              <div className="mt-4">
                <InputField
                  label="Operation Name"
                  value={operationName}
                  onChange={(value) => {
                    setOperationName(value);
                    clearResult();
                  }}
                  placeholder="GetUserProfile"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Needed to build an executable request when the document contains more than one operation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value) => {
              setOutputMode(value as OutputMode);
              clearResult();
            }}
            options={[
              { label: "Formatted query", value: "formatted" },
              { label: "Minified query", value: "minified" },
              { label: "Operation summary", value: "summary" },
              { label: "JSON request payload", value: "jsonPayload" },
              { label: "cURL request", value: "curl" },
              { label: "Formatted variables", value: "variables" },
            ]}
          />

          <YoryantraSelect
            label="Indent"
            value={indentSize}
            onChange={(value) => {
              setIndentSize(value as IndentSize);
              clearResult();
            }}
            options={[
              { label: "2 spaces", value: "2" },
              { label: "4 spaces", value: "4" },
            ]}
          />

          <YoryantraSelect
            label="Request Method"
            value={requestMethod}
            onChange={(value) => {
              setRequestMethod(value as RequestMethod);
              clearResult();
            }}
            options={[
              { label: "POST", value: "POST" },
              { label: "GET", value: "GET" },
            ]}
          />

          <div className="md:col-span-2 space-y-3">
            <CheckboxRow checked={includeVariables} label="Include variables in request payload outputs" onChange={(checked) => { setIncludeVariables(checked); clearResult(); }} />
            <CheckboxRow checked={includeOperationName} label="Include operationName when available" onChange={(checked) => { setIncludeOperationName(checked); clearResult(); }} />
            <CheckboxRow checked={removeComments} label="Remove comments when formatting/minifying" onChange={(checked) => { setRemoveComments(checked); clearResult(); }} />
            <CheckboxRow checked={warnAnonymousOperation} label="Warn about anonymous operations" onChange={(checked) => { setWarnAnonymousOperation(checked); clearResult(); }} />
            <CheckboxRow checked={warnMissingVariables} label="Warn when query variables have no Variables JSON" onChange={(checked) => { setWarnMissingVariables(checked); clearResult(); }} />
            <CheckboxRow checked={warnMultipleOperations} label="Warn when multiple operations are present" onChange={(checked) => { setWarnMultipleOperations(checked); clearResult(); }} />
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          The formatter is designed for practical readability and request debugging. It does not execute your query.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={formatQuery} className="yoryantra-btn whitespace-nowrap">
          Format GraphQL
        </button>

        <button onClick={copyOutput} className="yoryantra-btn whitespace-nowrap" disabled={!output}>
          {copied ? "Copied" : "Copy Output"}
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

      {result && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Operations" value={result.operations.length.toLocaleString()} />
          <SummaryCard label="Fragments" value={result.fragments.length.toLocaleString()} />
          <SummaryCard label="Variables" value={result.variables.length.toLocaleString()} />
          <SummaryCard label="Findings" value={result.issueCount.toLocaleString()} />
        </div>
      )}

      {result && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">GraphQL Structure</h3>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Item</th>
                  <th className="px-4 py-3 font-semibold">Value</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                <InfoTableRow label="Operations" value={formatOperationList(result.operations)} />
                <InfoTableRow label="Fragments" value={result.fragments.join(", ") || "none"} />
                <InfoTableRow label="Variables" value={result.variables.join(", ") || "none"} />
                <InfoTableRow label="Variables JSON" value={result.variablesJsonStatus} />
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result && result.issues.length > 0 && (
<IssuePanel title="GraphQL findings" issues={result.issues} />
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">GraphQL debugging guidance</h3>

          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-gray-900">{note.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{note.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Output</h3>

          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline whitespace-nowrap text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[360px] whitespace-pre-wrap break-words">
          {output || "Formatted GraphQL output will appear here."}
        </pre>
      </div>

      <div className="mt-4 self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Formatting and inspection stay in the browser. Schema validation and network execution are deliberately outside this page.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Whitespace is cheap; token boundaries are not</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            GraphQL permits whitespace, line terminators, commas, comments, and a Unicode BOM between lexical tokens. A formatter can reshape those separators, but it must not rewrite characters that belong inside a string, block string, name, number, or other token. The language rules are defined in the <a className="font-medium text-gray-900 underline underline-offset-4" href="https://spec.graphql.org/September2025/" target="_blank" rel="noreferrer">GraphQL specification</a>.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Quoted strings and block strings are therefore kept opaque while surrounding layout changes. The delimiter review is only a paste-damage check; balanced braces and parentheses do not prove that a document is valid GraphQL.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Comments make minification less obvious</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A GraphQL comment begins with <code>#</code> and ends at a line terminator. Keeping the comment while deleting that terminator can turn the following source text into part of the comment, so preserved comments keep their boundary. Braces and parentheses inside comments are ignored by the structural review.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            When “Remove comments” is selected, comment text is dropped but a safe separator remains where needed so adjacent tokens are not accidentally joined.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Formatting a document and constructing one request are different jobs</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            One GraphQL document can contain several operations plus reusable fragments. Formatting the whole document is fine; executing one operation is more specific. When multiple operations are present, a request needs an <code>operationName</code> so the server knows which operation to run.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Variables travel separately from the GraphQL source and are represented as JSON in the common HTTP request format. A referenced variable can still be absent from the variables object when it is nullable or has a default, so a missing key is context for review rather than an automatic syntax failure.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            For transport, POST sends the request payload in JSON. GET places <code>query</code>, <code>operationName</code>, and <code>variables</code> in the URL query component and must not be used to execute a mutation. Those examples follow the current <a className="font-medium text-gray-900 underline underline-offset-4" href="https://graphql.github.io/graphql-over-http/draft/" target="_blank" rel="noreferrer">GraphQL-over-HTTP draft</a>, which is transport guidance rather than part of the core language specification.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">A clean document can still fail against the real schema</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Field existence, argument types, fragment type conditions, directive placement, variable compatibility, authorization, resolver behavior, query cost, and execution errors all require information this page does not have. Operation and fragment lists are text-level inspection aids, not a substitute for parsing and schema validation in the environment that will execute the request.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Very large documents also have practical limits outside the formatter: GET URLs can exceed intermediary limits, servers can enforce document-size or depth limits, and persisted-query systems may not accept arbitrary source at all. Formatting changes readability; it does not negotiate those server policies.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/graphql-query-formatter" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function IssuePanel({ title, issues }: { title: string; issues: Issue[] }) {
  return (
    <div className="mt-6 space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {issues.map((issue, index) => {
        const classes = issue.severity === "high"
          ? "border-red-200 bg-red-50 text-red-700"
          : issue.severity === "warning"
            ? "border-amber-200 bg-amber-50 text-amber-800"
            : "border-gray-200 bg-gray-50 text-gray-600";
        return (
          <div key={`${issue.title}-${index}`} className={`self-start rounded-xl border p-4 ${classes}`}>
            <p className="text-sm font-semibold text-gray-900">{issue.title}</p>
            <p className="mt-1 text-sm leading-relaxed">{issue.message}</p>
          </div>
        );
      })}
    </div>
  );
}

function InputField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-gray-700">{label}</label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-[54px] w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--light-gold)]"
      />
    </div>
  );
}

function CheckboxRow({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[var(--light-gold)]"
      />
      {label}
    </label>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function InfoTableRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td className="px-4 py-3 font-mono text-xs text-gray-800">{label}</td>
      <td className="px-4 py-3 font-mono text-xs text-gray-700">
        <span className="block max-w-[620px] break-words">{value}</span>
      </td>
    </tr>
  );
}


function buildGraphqlOutput(options: {
  query: string;
  variablesJson: string;
  endpoint: string;
  operationName: string;
  outputMode: OutputMode;
  indentSize: IndentSize;
  requestMethod: RequestMethod;
  includeVariables: boolean;
  includeOperationName: boolean;
  removeComments: boolean;
  warnAnonymousOperation: boolean;
  warnMissingVariables: boolean;
  warnMultipleOperations: boolean;
}): GraphqlResult {
  assertBalancedGraphql(options.query);
  const cleanedQuery = options.removeComments ? stripGraphqlComments(options.query) : options.query;
  const formatted = formatGraphql(cleanedQuery, Number(options.indentSize));
  const minified = minifyGraphql(cleanedQuery);
  const operations = extractOperations(cleanedQuery);
  const fragments = extractFragments(cleanedQuery);
  const variables = extractVariables(cleanedQuery);
  const parsedVariables = parseVariablesJson(options.variablesJson);
  const issues = buildIssues({
    operations,
    variables,
    parsedVariables,
    variablesJson: options.variablesJson,
    warnAnonymousOperation: options.warnAnonymousOperation,
    warnMissingVariables: options.warnMissingVariables,
    warnMultipleOperations: options.warnMultipleOperations,
  });
  const base = {
    formatted,
    minified,
    operations,
    fragments,
    variables,
    variablesJsonStatus: getVariablesStatus(options.variablesJson, parsedVariables),
    issueCount: issues.length,
    issues,
  };
  const output = formatOutput(base, options, parsedVariables);

  return {
    ...base,
    output,
  };
}

function stripGraphqlComments(value: string) {
  let output = "";
  let inString = false;
  let inBlockString = false;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    const nextThree = value.slice(index, index + 3);

    if (nextThree === "\"\"\"" && !inString && !isEscaped(value, index)) {
      inBlockString = !inBlockString;
      output += nextThree;
      index += 2;
      continue;
    }

    if (char === "\"" && !isEscaped(value, index) && !inBlockString) {
      inString = !inString;
      output += char;
      continue;
    }

    if (char === "#" && !inString && !inBlockString) {
      while (index < value.length && value[index] !== "\n") {
        index += 1;
      }
      output += "\n";
      continue;
    }

    output += char;
  }

  return output;
}

function formatGraphql(value: string, indentSize: number) {
  const minified = minifyGraphql(value);
  const indentUnit = " ".repeat(indentSize);
  let output = "";
  let indent = 0;
  let inString = false;
  let inBlockString = false;
  let inComment = false;

  for (let index = 0; index < minified.length; index += 1) {
    const char = minified[index];
    const nextThree = minified.slice(index, index + 3);

    if (inComment) {
      output += char;
      if (char === "\n" || char === "\r") {
        inComment = false;
        if (minified[index + 1] && minified[index + 1] !== "}") {
          output += indentUnit.repeat(indent);
        }
      }
      continue;
    }

    if (nextThree === "\"\"\"" && !inString && !isEscaped(minified, index)) {
      inBlockString = !inBlockString;
      output += nextThree;
      index += 2;
      continue;
    }

    if (char === "\"" && !isEscaped(minified, index) && !inBlockString) {
      inString = !inString;
      output += char;
      continue;
    }

    if (inString || inBlockString) {
      output += char;
      continue;
    }

    if (char === "#") {
      inComment = true;
      output += char;
      continue;
    }

    if (char === "{") {
      output = output.replace(/[\s]+$/g, "") + " {\n";
      indent += 1;
      output += indentUnit.repeat(indent);
    } else if (char === "}") {
      indent = Math.max(0, indent - 1);
      output = output.replace(/[\s]+$/g, "") + "\n" + indentUnit.repeat(indent) + "}";
      if (minified[index + 1] && minified[index + 1] !== "}") {
        output += "\n" + indentUnit.repeat(indent);
      }
    } else if (char === "(") {
      output += "(";
    } else if (char === ")") {
      output = output.replace(/[\s]+$/g, "") + ")";
    } else if (char === ",") {
      output = output.replace(/[\s]+$/g, "") + ", ";
    } else if (char === ":") {
      output = output.replace(/[\s]+$/g, "") + ": ";
    } else {
      output += char;
    }
  }

  return output
    .split(/\r?\n/)
    .map((line) => line.replace(/[\s]+$/g, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function minifyGraphql(value: string) {
  let output = "";
  let inString = false;
  let inBlockString = false;
  let inComment = false;
  let pendingSpace = false;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    const nextThree = value.slice(index, index + 3);

    if (inComment) {
      output += char;
      if (char === "\n" || char === "\r") inComment = false;
      continue;
    }

    if (nextThree === "\"\"\"" && !inString && !isEscaped(value, index)) {
      inBlockString = !inBlockString;
      output += nextThree;
      index += 2;
      pendingSpace = false;
      continue;
    }

    if (char === "\"" && !inBlockString && !isEscaped(value, index)) {
      inString = !inString;
      output += char;
      pendingSpace = false;
      continue;
    }

    if (inString || inBlockString) {
      output += char;
      continue;
    }

    if (char === "#") {
      if (pendingSpace && output && !output.endsWith("\n")) output += " ";
      output += char;
      pendingSpace = false;
      inComment = true;
      continue;
    }

    if (/\s/.test(char)) {
      pendingSpace = true;
      continue;
    }

    if ("{}():![]=,@".includes(char)) {
      output = output.replace(/[\s]+$/g, "");
      output += char;
      pendingSpace = false;
      continue;
    }

    if (pendingSpace && output && /[A-Za-z0-9_$]/.test(output[output.length - 1]) && /[A-Za-z0-9_$]/.test(char)) {
      output += " ";
    }

    output += char;
    pendingSpace = false;
  }

  return output.trim();
}

function isEscaped(value: string, index: number) {
  let slashes = 0;
  for (let cursor = index - 1; cursor >= 0 && value[cursor] === "\\"; cursor -= 1) slashes += 1;
  return slashes % 2 === 1;
}

function assertBalancedGraphql(value: string) {
  const stack: string[] = [];
  const matching: Record<string, string> = { "}": "{", ")": "(", "]": "[" };
  let inString = false;
  let inBlockString = false;
  let inComment = false;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    const nextThree = value.slice(index, index + 3);

    if (inComment) {
      if (char === "\n" || char === "\r") inComment = false;
      continue;
    }
    if (nextThree === "\"\"\"" && !inString && !isEscaped(value, index)) {
      inBlockString = !inBlockString; index += 2; continue;
    }
    if (char === "\"" && !inBlockString && !isEscaped(value, index)) {
      inString = !inString; continue;
    }
    if (inString || inBlockString) continue;
    if (char === "#") { inComment = true; continue; }
    if ("{([".includes(char)) stack.push(char);
    if ("})]".includes(char)) {
      if (stack.pop() !== matching[char]) throw new Error(`Unbalanced GraphQL delimiter near ${char}.`);
    }
  }
  if (inString || inBlockString) throw new Error("GraphQL input contains an unterminated string.");
  if (stack.length > 0) throw new Error(`GraphQL input is missing a closing delimiter for ${stack[stack.length - 1]}.`);
}

function maskGraphqlNonCode(value: string) {
  let output = "";
  let inString = false;
  let inBlockString = false;
  let inComment = false;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    const nextThree = value.slice(index, index + 3);
    if (inComment) {
      output += char === "\n" || char === "\r" ? char : " ";
      if (char === "\n" || char === "\r") inComment = false;
      continue;
    }
    if (nextThree === "\"\"\"" && !inString && !isEscaped(value, index)) {
      inBlockString = !inBlockString; output += "   "; index += 2; continue;
    }
    if (char === "\"" && !inBlockString && !isEscaped(value, index)) {
      inString = !inString; output += " "; continue;
    }
    if (!inString && !inBlockString && char === "#") { inComment = true; output += " "; continue; }
    output += inString || inBlockString ? (char === "\n" || char === "\r" ? char : " ") : char;
  }
  return output;
}

function extractOperations(value: string): OperationInfo[] {
  const source = maskGraphqlNonCode(value);
  const operations: OperationInfo[] = [];
  let braceDepth = 0;
  let parenDepth = 0;
  let bracketDepth = 0;
  let headerKind: "operation" | "fragment" | null = null;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];

    if (char === "(" && braceDepth === 0) { parenDepth += 1; continue; }
    if (char === ")" && braceDepth === 0) { parenDepth = Math.max(0, parenDepth - 1); continue; }
    if (char === "[" && braceDepth === 0) { bracketDepth += 1; continue; }
    if (char === "]" && braceDepth === 0) { bracketDepth = Math.max(0, bracketDepth - 1); continue; }

    if (char === "{" && parenDepth === 0 && bracketDepth === 0) {
      if (braceDepth === 0) {
        if (headerKind === null) {
          operations.push({ type: "anonymous", name: "anonymous" });
        }
        headerKind = null;
      }
      braceDepth += 1;
      continue;
    }

    if (char === "}" && parenDepth === 0 && bracketDepth === 0) {
      braceDepth = Math.max(0, braceDepth - 1);
      continue;
    }

    if (braceDepth !== 0 || parenDepth !== 0 || bracketDepth !== 0 || !/[A-Za-z_]/.test(char)) {
      continue;
    }

    let end = index + 1;
    while (end < source.length && /[A-Za-z0-9_]/.test(source[end])) end += 1;
    const token = source.slice(index, end);

    if (token === "fragment") {
      headerKind = "fragment";
      index = end - 1;
      continue;
    }

    if (token === "query" || token === "mutation" || token === "subscription") {
      let cursor = end;
      while (cursor < source.length && /[\s,]/.test(source[cursor])) cursor += 1;
      const nameMatch = source.slice(cursor).match(/^([A-Za-z_][A-Za-z0-9_]*)/);

      operations.push({
        type: token,
        name: nameMatch?.[1] || "anonymous",
      });
      headerKind = "operation";
      index = end - 1;
      continue;
    }

    index = end - 1;
  }

  return operations;
}

function extractFragments(value: string) {
  const source = maskGraphqlNonCode(value);
  const fragments: string[] = [];
  const regex = /\bfragment\s+([A-Za-z_][A-Za-z0-9_]*)\s+on\s+[A-Za-z_][A-Za-z0-9_]*/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(source)) !== null) {
    fragments.push(match[1]);
  }

  return Array.from(new Set(fragments));
}

function extractVariables(value: string) {
  const source = maskGraphqlNonCode(value);
  const variables: string[] = [];
  const regex = /\$([A-Za-z_][A-Za-z0-9_]*)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(source)) !== null) {
    variables.push(match[1]);
  }

  return Array.from(new Set(variables));
}

function parseVariablesJson(value: string) {
  if (!value.trim()) return null;

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Variables JSON must be a JSON object because GraphQL variables are sent as a map.");
    }
    return parsed as Record<string, unknown>;
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("Variables JSON must")) throw err;
    throw new Error("Variables JSON is not valid JSON.");
  }
}

function getVariablesStatus(value: string, parsed: Record<string, unknown> | null) {
  if (!value.trim()) return "not provided";
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return "valid object";
  return "valid JSON, but not an object";
}

function buildIssues(params: {
  operations: OperationInfo[];
  variables: string[];
  parsedVariables: Record<string, unknown> | null;
  variablesJson: string;
  warnAnonymousOperation: boolean;
  warnMissingVariables: boolean;
  warnMultipleOperations: boolean;
}) {
  const issues: Issue[] = [];

  if (params.warnAnonymousOperation && params.operations.some((operation) => operation.name === "anonymous")) {
    issues.push({
      severity: "info",
      title: "Anonymous operation",
      message: "Named operations are easier to debug in logs, GraphQL clients, and monitoring tools.",
    });
  }

  if (params.warnMultipleOperations && params.operations.length > 1) {
    issues.push({
      severity: "warning",
      title: "Multiple operations found",
      message: "When sending multiple operations in one document, include operationName in the request payload.",
    });
  }

  if (params.warnMissingVariables && params.variables.length > 0 && !params.variablesJson.trim()) {
    issues.push({
      severity: "info",
      title: "Variables JSON missing",
      message: "The query references variables, but no Variables JSON was provided.",
    });
  }

  if (params.parsedVariables && typeof params.parsedVariables === "object") {
    const missing = params.variables.filter((name) => !Object.prototype.hasOwnProperty.call(params.parsedVariables, name));

    if (missing.length > 0) {
      issues.push({
        severity: "info",
        title: "Variable names absent from Variables JSON",
        message: `Not supplied here: ${missing.join(", ")}. That can still be valid for nullable variables or variables with defaults.`,
      });
    }
  }

  if (issues.length === 0) {
    issues.push({
      severity: "info",
      title: "GraphQL document inspected",
      message: "No obvious formatting or request payload issue was found.",
    });
  }

  return issues;
}

function formatOutput(
  result: Omit<GraphqlResult, "output">,
  options: {
    outputMode: OutputMode;
    endpoint: string;
    operationName: string;
    requestMethod: RequestMethod;
    includeVariables: boolean;
    includeOperationName: boolean;
  },
  parsedVariables: Record<string, unknown> | null
) {
  if (options.outputMode === "formatted") {
    return result.formatted;
  }

  if (options.outputMode === "minified") {
    return result.minified;
  }

  if (options.outputMode === "variables") {
    return parsedVariables ? JSON.stringify(parsedVariables, null, 2) : "No valid Variables JSON provided.";
  }

  const requestedOperationName = options.operationName.trim();
  const namedOperations = result.operations.filter((operation) => operation.name !== "anonymous");
  const requestedOperation = requestedOperationName
    ? namedOperations.find((operation) => operation.name === requestedOperationName)
    : null;

  if (requestedOperationName && !requestedOperation) {
    throw new Error(`Operation Name "${requestedOperationName}" was not found in the document.`);
  }

  const isExecutableOutput = options.outputMode === "jsonPayload" || options.outputMode === "curl";
  if (isExecutableOutput && result.operations.length === 0) {
    throw new Error("No executable GraphQL operation was found. A fragment-only document can be formatted, but it cannot be sent by itself.");
  }
  if (isExecutableOutput && result.operations.length > 1 && !requestedOperationName) {
    throw new Error("This document contains multiple operations. Enter the Operation Name to build an executable request.");
  }
  if (isExecutableOutput && result.operations.length > 1 && !options.includeOperationName) {
    throw new Error("Enable Include operationName to build a request from a document that contains multiple operations.");
  }

  const selectedOperation = requestedOperation || (result.operations.length === 1 ? result.operations[0] : null);
  const operationName = requestedOperationName || getPrimaryOperationName(result.operations);
  const payload = buildPayload({
    query: result.minified,
    operationName,
    parsedVariables,
    includeVariables: options.includeVariables,
    includeOperationName: options.includeOperationName,
  });

  if (options.outputMode === "jsonPayload") {
    return JSON.stringify(payload, null, 2);
  }

  if (options.outputMode === "curl") {
    const endpoint = options.endpoint.trim() || "https://api.example.com/graphql";
    const acceptHeader = "Accept: application/graphql-response+json, application/json;q=0.9";
    if (options.requestMethod === "GET") {
      if (selectedOperation?.type === "mutation") {
        throw new Error("GraphQL over HTTP GET must not execute mutations. Choose POST for the selected operation.");
      }
      const params = new URLSearchParams();
      params.set("query", result.minified);
      if (payload.operationName) params.set("operationName", String(payload.operationName));
      if (payload.variables) params.set("variables", JSON.stringify(payload.variables));
      const requestUrl = appendQueryBeforeFragment(endpoint, params.toString());
      return `curl -X GET ${quotePosixShell(requestUrl)} -H ${quotePosixShell(acceptHeader)}`;
    }
    return [
      `curl -X POST ${quotePosixShell(endpoint)} \\`,
      `  -H ${quotePosixShell("Content-Type: application/json")} \\`,
      `  -H ${quotePosixShell(acceptHeader)} \\`,
      `  -d ${quotePosixShell(JSON.stringify(payload))}`,
    ].join("\n");
  }

  return [
    "GraphQL Operation Summary",
    "-------------------------",
    `Operations: ${formatOperationList(result.operations)}`,
    `Fragments: ${result.fragments.join(", ") || "none"}`,
    `Variables: ${result.variables.join(", ") || "none"}`,
    `Variables JSON: ${result.variablesJsonStatus}`,
    "",
    "Findings:",
    ...result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
  ].join("\n");
}

function appendQueryBeforeFragment(endpoint: string, query: string) {
  const hashIndex = endpoint.indexOf("#");
  const base = hashIndex >= 0 ? endpoint.slice(0, hashIndex) : endpoint;
  const fragment = hashIndex >= 0 ? endpoint.slice(hashIndex) : "";
  const separator = base.includes("?")
    ? (base.endsWith("?") || base.endsWith("&") ? "" : "&")
    : "?";
  return `${base}${separator}${query}${fragment}`;
}

function quotePosixShell(value: string) {
  return `'${value.replace(/'/g, `'"'"'`)}'`;
}

function buildPayload(params: {
  query: string;
  operationName: string;
  parsedVariables: Record<string, unknown> | null;
  includeVariables: boolean;
  includeOperationName: boolean;
}) {
  const payload: Record<string, unknown> = {
    query: params.query,
  };

  if (params.includeOperationName && params.operationName && params.operationName !== "anonymous") {
    payload.operationName = params.operationName;
  }

  if (params.includeVariables && params.parsedVariables) {
    payload.variables = params.parsedVariables;
  }

  return payload;
}

function getPrimaryOperationName(operations: OperationInfo[]) {
  if (operations.length !== 1) return "";
  const named = operations[0];
  return named.name !== "anonymous" ? named.name : "";
}

function formatOperationList(operations: OperationInfo[]) {
  if (operations.length === 0) return "none";

  return operations.map((operation) => `${operation.type}:${operation.name}`).join(", ");
}

function getNotes(result: GraphqlResult) {
  const notes: { title: string; message: string }[] = [];

  if (result.operations.length > 1) {
    notes.push({
      title: "Multiple operations need operationName",
      message: "GraphQL servers usually need operationName when one request document contains more than one operation.",
    });
  }

  if (result.variables.length > 0) {
    notes.push({
      title: "Variables keep queries reusable",
      message: "Use variables instead of string-building dynamic values into the query text.",
    });
  }

  notes.push({
    title: "Schema validation is separate",
    message: "A formatter can improve readability, but only your GraphQL schema can confirm whether fields and types are valid.",
  });

  return notes;
}
