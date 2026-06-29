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
      description="Format, minify, and inspect GraphQL queries, mutations, subscriptions, fragments, variables, operation names, and request payloads directly in your browser."
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
                className="w-full min-h-[260px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
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
        <button onClick={formatQuery} className="yoryantra-btn">
          Format GraphQL
        </button>

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
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">GraphQL findings</h3>

          <div className="mt-3 space-y-3">
            {result.issues.map((issue, index) => (
              <div key={`${issue.title}-${index}`}>
                <p className="text-sm font-semibold text-amber-900">{issue.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-amber-800">{issue.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900">GraphQL debugging guidance</h3>

          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-blue-900">{note.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-blue-800">{note.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Output</h3>

          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[360px] whitespace-pre-wrap break-words">
          {output || "Formatted GraphQL output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        This tool formats and inspects GraphQL text locally. It does not validate against a schema or send requests to your endpoint.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Formatting GraphQL Queries for Easier API Debugging</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            GraphQL requests can become hard to read when copied from logs, browser DevTools, API clients, or minified production traffic. Formatting the query makes fields, nested selections, variables, fragments, and operation names easier to review.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This GraphQL Query Formatter formats and minifies queries, extracts operations and variables, formats variables JSON, and generates request payloads or cURL commands for debugging.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Using the GraphQL Query Formatter</h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste a GraphQL query, mutation, subscription, or fragment.</li>
            <li>Optionally paste Variables JSON and an endpoint URL.</li>
            <li>Choose formatted, minified, summary, JSON payload, cURL, or variables output.</li>
            <li>Review operation names, fragments, variables, and warnings.</li>
            <li>Copy the output for testing, documentation, or debugging.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Common GraphQL Formatting Tasks</h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Beautify a minified GraphQL query from logs.</li>
            <li>Minify a query before embedding it in a request payload.</li>
            <li>Extract operation names from a copied GraphQL document.</li>
            <li>Check whether variables used in the query are documented in Variables JSON.</li>
            <li>Create a cURL request for quick API testing.</li>
            <li>Review fragments before sharing a query with another developer.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example GraphQL Query</h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
  }
}`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Formatting Is Not Schema Validation</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A formatter can make a query easier to read, but it cannot know whether fields, arguments, enum values, or variable types are valid unless it has your GraphQL schema.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Use this tool for readability and request debugging, then use your GraphQL server, schema tooling, or API client for schema-level validation.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>

          <div className="mt-5 space-y-6">
            <Faq title="What does a GraphQL Query Formatter do?">
              It formats and minifies GraphQL queries and extracts useful details such as operations, fragments, and variables.
            </Faq>

            <Faq title="Does this validate my GraphQL schema?">
              No. It formats and inspects query text but does not validate fields or types against a schema.
            </Faq>

            <Faq title="Can it format GraphQL variables?">
              Yes. Paste Variables JSON and choose the formatted variables output or JSON request payload.
            </Faq>

            <Faq title="Can it generate a cURL request?">
              Yes. Add a GraphQL endpoint and choose cURL output.
            </Faq>

            <Faq title="Is anything uploaded when I format GraphQL?">
              No. Formatting runs directly in your browser.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/graphql-query-formatter" />
        </div>
      </section>
    </ToolShell>
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
        className="min-h-[54px] w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
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

function Faq({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600 leading-relaxed">{children}</p>
    </div>
  );
}

function buildGraphqlOutput(options: {
  query: string;
  variablesJson: string;
  endpoint: string;
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

    if (nextThree === "\"\"\"" && !inString) {
      inBlockString = !inBlockString;
      output += nextThree;
      index += 2;
      continue;
    }

    if (char === "\"" && value[index - 1] !== "\\" && !inBlockString) {
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

  for (let index = 0; index < minified.length; index += 1) {
    const char = minified[index];
    const nextThree = minified.slice(index, index + 3);

    if (nextThree === "\"\"\"" && !inString) {
      inBlockString = !inBlockString;
      output += nextThree;
      index += 2;
      continue;
    }

    if (char === "\"" && minified[index - 1] !== "\\" && !inBlockString) {
      inString = !inString;
      output += char;
      continue;
    }

    if (inString || inBlockString) {
      output += char;
      continue;
    }

    if (char === "{") {
      output = output.trimEnd() + " {\n";
      indent += 1;
      output += indentUnit.repeat(indent);
    } else if (char === "}") {
      indent = Math.max(0, indent - 1);
      output = output.trimEnd() + "\n" + indentUnit.repeat(indent) + "}";
      if (minified[index + 1] && minified[index + 1] !== "}") {
        output += "\n" + indentUnit.repeat(indent);
      }
    } else if (char === "(") {
      output += "(";
    } else if (char === ")") {
      output = output.trimEnd() + ")";
    } else if (char === ",") {
      output = output.trimEnd() + ", ";
    } else if (char === ":") {
      output = output.trimEnd() + ": ";
    } else {
      output += char;
    }
  }

  return output
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function minifyGraphql(value: string) {
  let output = "";
  let inString = false;
  let inBlockString = false;
  let pendingSpace = false;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    const nextThree = value.slice(index, index + 3);

    if (nextThree === "\"\"\"" && !inString) {
      inBlockString = !inBlockString;
      output += nextThree;
      index += 2;
      pendingSpace = false;
      continue;
    }

    if (char === "\"" && value[index - 1] !== "\\" && !inBlockString) {
      inString = !inString;
      output += char;
      pendingSpace = false;
      continue;
    }

    if (inString || inBlockString) {
      output += char;
      continue;
    }

    if (/\s/.test(char)) {
      pendingSpace = true;
      continue;
    }

    if ("{}():![]=,@".includes(char)) {
      output = output.trimEnd();
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

function extractOperations(value: string): OperationInfo[] {
  const operations: OperationInfo[] = [];
  const regex = /\b(query|mutation|subscription)\s*([A-Za-z_][A-Za-z0-9_]*)?/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(value)) !== null) {
    operations.push({
      type: match[1] as OperationInfo["type"],
      name: match[2] || "anonymous",
    });
  }

  if (operations.length === 0 && value.trim().startsWith("{")) {
    operations.push({
      type: "anonymous",
      name: "anonymous",
    });
  }

  return operations;
}

function extractFragments(value: string) {
  const fragments: string[] = [];
  const regex = /\bfragment\s+([A-Za-z_][A-Za-z0-9_]*)\s+on\s+[A-Za-z_][A-Za-z0-9_]*/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(value)) !== null) {
    fragments.push(match[1]);
  }

  return Array.from(new Set(fragments));
}

function extractVariables(value: string) {
  const variables: string[] = [];
  const regex = /\$([A-Za-z_][A-Za-z0-9_]*)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(value)) !== null) {
    variables.push(match[1]);
  }

  return Array.from(new Set(variables));
}

function parseVariablesJson(value: string) {
  if (!value.trim()) return null;

  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
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
        severity: "warning",
        title: "Variables not found in Variables JSON",
        message: `Missing variable values: ${missing.join(", ")}.`,
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

  const operationName = getPrimaryOperationName(result.operations);
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
    return [
      `curl -X ${options.requestMethod} "${endpoint}" \\`,
      `  -H "Content-Type: application/json" \\`,
      `  -d '${JSON.stringify(payload)}'`,
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
  const named = operations.find((operation) => operation.name !== "anonymous");
  return named?.name || "";
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
