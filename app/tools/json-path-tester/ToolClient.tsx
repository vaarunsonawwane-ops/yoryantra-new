"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type PathResult = {
  path: string;
  value: unknown;
};

const sampleJson = `{
  "user": {
    "id": 101,
    "name": "Yoryantra User",
    "email": "user@example.com",
    "roles": ["admin", "editor"]
  },
  "orders": [
    {
      "id": "ord_001",
      "total": 49.99,
      "status": "paid"
    },
    {
      "id": "ord_002",
      "total": 19.5,
      "status": "pending"
    }
  ],
  "active": true
}`;

const samplePath = "$.orders[0].total";

export default function ToolClient() {
  const [jsonInput, setJsonInput] = useState("");
  const [pathInput, setPathInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const testJsonPath = () => {
    if (!jsonInput.trim()) {
      setError("Please enter JSON data to test.");
      setOutput("");
      return;
    }

    if (!pathInput.trim()) {
      setError("Please enter a JSON path to test.");
      setOutput("");
      return;
    }

    try {
      const parsedJson = JSON.parse(jsonInput);
      const results = evaluateJsonPath(parsedJson, pathInput.trim());

      setOutput(formatResults(pathInput.trim(), results));
      setError("");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to test this JSON path.";

      setError(message);
      setOutput("");
    }
  };

  const loadExample = () => {
    setJsonInput(sampleJson);
    setPathInput(samplePath);
    setOutput("");
    setError("");
  };

  const resetAll = () => {
    setJsonInput("");
    setPathInput("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="JSON Path Tester"
      description="Test JSON paths against JSON data, inspect nested values, and check array results directly in your browser."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          JSON Data
        </label>

        <textarea
          value={jsonInput}
          onChange={(event) => setJsonInput(event.target.value)}
          placeholder={sampleJson}
          className="w-full min-h-[260px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste JSON data from an API response, log entry, configuration file,
          or test payload.
        </p>
      </div>

      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          JSON Path
        </label>

        <input
          value={pathInput}
          onChange={(event) => setPathInput(event.target.value)}
          placeholder="$.orders[0].total"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />

        <p className="mt-2 text-sm text-gray-500">
          Supports common paths like <strong>$.user.name</strong>,{" "}
          <strong>$.orders[0]</strong>, <strong>$.orders[*].id</strong>, and{" "}
          <strong>$..id</strong>.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={testJsonPath} className="yoryantra-btn">
          Test JSON Path
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

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            JSON Path Result
          </h3>

          {output && (
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[260px] whitespace-pre-wrap break-words">
          {output || "Matched JSON path values will appear here."}
        </pre>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Testing JSON Paths Against API Responses and Nested Data
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON paths are useful when you need to pull a specific value from an
            API response, nested object, array, log payload, or configuration
            file. Small path mistakes can return the wrong value or no result at
            all.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This JSON Path Tester helps you test JSON paths, inspect matched
            values, check nested keys, query arrays, and review JSON path output
            directly in your browser before using the path in code or
            automation.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Checking Nested JSON Values in the Browser
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste JSON data into the input box.</li>
            <li>Enter the JSON path you want to test.</li>
            <li>
              Click <strong>Test JSON Path</strong>.
            </li>
            <li>Review the matched values and their result paths.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common JSON Path Tester Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Testing paths against API response data.</li>
            <li>Finding nested values inside JSON objects.</li>
            <li>Checking array item paths such as <strong>$.items[0]</strong>.</li>
            <li>Extracting repeated values with wildcard paths.</li>
            <li>Debugging JSON queries before adding them to code or automation.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example JSON Paths
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`$.user.name        Get the user name
$.orders[0].total  Get the first order total
$.orders[*].id     Get all order IDs
$..id              Find all id values recursively`}
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
                What does a JSON Path Tester do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A JSON Path Tester checks a JSON path against JSON data and
                shows the values that match the path. It helps you confirm that
                your path points to the correct nested value or array item.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Which JSON path patterns are supported?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                This tool supports common patterns such as root paths, dot
                notation, bracket array indexes, wildcards, and recursive key
                lookup using paths like <strong>$..id</strong>.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I test JSON paths from API responses?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Paste an API response into the JSON input box, add the path
                you want to test, and review the matched output.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my JSON data uploaded to a server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The JSON path check happens directly in your browser. Your
                JSON data is not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/json-path-tester" />
        </div>
      </section>
    </ToolShell>
  );
}

function evaluateJsonPath(data: unknown, path: string): PathResult[] {
  if (!path.startsWith("$")) {
    throw new Error("JSON path should start with $.");
  }

  if (path === "$") {
    return [{ path: "$", value: data }];
  }

  if (path.startsWith("$..")) {
    const key = path.slice(3).trim();

    if (!key || /[.[\]*]/.test(key)) {
      throw new Error("Recursive lookup should look like $..id or $..name.");
    }

    const results: PathResult[] = [];
    findRecursiveValues(data, key, "$", results);

    return results;
  }

  const tokens = tokenizePath(path);
  let current: PathResult[] = [{ path: "$", value: data }];

  tokens.forEach((token) => {
    const next: PathResult[] = [];

    current.forEach((item) => {
      if (token === "*") {
        if (Array.isArray(item.value)) {
          item.value.forEach((value, index) => {
            next.push({
              path: `${item.path}[${index}]`,
              value,
            });
          });
        } else if (isRecord(item.value)) {
          Object.entries(item.value).forEach(([key, value]) => {
            next.push({
              path: `${item.path}.${key}`,
              value,
            });
          });
        }

        return;
      }

      if (/^\d+$/.test(token)) {
        if (Array.isArray(item.value)) {
          const index = Number(token);

          if (index in item.value) {
            next.push({
              path: `${item.path}[${index}]`,
              value: item.value[index],
            });
          }
        }

        return;
      }

      if (isRecord(item.value) && token in item.value) {
        next.push({
          path: `${item.path}.${token}`,
          value: item.value[token],
        });
      }
    });

    current = next;
  });

  return current;
}

function tokenizePath(path: string) {
  const body = path.slice(1);
  const tokens: string[] = [];
  let index = 0;

  while (index < body.length) {
    const char = body[index];

    if (char === ".") {
      index += 1;
      let key = "";

      while (index < body.length && /[A-Za-z0-9_$-]/.test(body[index])) {
        key += body[index];
        index += 1;
      }

      if (!key) {
        throw new Error("Invalid dot notation in JSON path.");
      }

      tokens.push(key);
      continue;
    }

    if (char === "[") {
      const closeIndex = body.indexOf("]", index);

      if (closeIndex === -1) {
        throw new Error("Missing closing bracket in JSON path.");
      }

      const content = body.slice(index + 1, closeIndex).trim();

      if (content === "*") {
        tokens.push("*");
      } else if (/^\d+$/.test(content)) {
        tokens.push(content);
      } else if (
        (content.startsWith("'") && content.endsWith("'")) ||
        (content.startsWith('"') && content.endsWith('"'))
      ) {
        tokens.push(content.slice(1, -1));
      } else {
        throw new Error(
          "Bracket notation should use an index, wildcard, or quoted key."
        );
      }

      index = closeIndex + 1;
      continue;
    }

    throw new Error("Unsupported JSON path syntax.");
  }

  return tokens;
}

function findRecursiveValues(
  value: unknown,
  key: string,
  currentPath: string,
  results: PathResult[]
) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      findRecursiveValues(item, key, `${currentPath}[${index}]`, results);
    });

    return;
  }

  if (!isRecord(value)) {
    return;
  }

  Object.entries(value).forEach(([objectKey, objectValue]) => {
    const nextPath = `${currentPath}.${objectKey}`;

    if (objectKey === key) {
      results.push({
        path: nextPath,
        value: objectValue,
      });
    }

    findRecursiveValues(objectValue, key, nextPath, results);
  });
}

function formatResults(path: string, results: PathResult[]) {
  if (!results.length) {
    return [
      "JSON path tested.",
      "",
      `Path: ${path}`,
      "Matches found: 0",
      "",
      "No values matched this JSON path.",
    ].join("\n");
  }

  const lines = [
    "JSON path tested.",
    "",
    `Path: ${path}`,
    `Matches found: ${results.length}`,
    "",
    "Results:",
    "",
  ];

  results.forEach((result, index) => {
    lines.push(`${index + 1}. ${result.path}`);
    lines.push(JSON.stringify(result.value, null, 2));
    lines.push("");
  });

  return lines.join("\n").trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
