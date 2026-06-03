"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const validateYAML = () => {
    if (!input.trim()) {
      setError("Please enter YAML content to validate.");
      setOutput("");
      return;
    }

    try {
      parseYAML(input);

      setOutput(
        "Valid YAML\n\nYour YAML syntax looks valid. The content can be parsed successfully."
      );

      setError("");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to validate this YAML content.";

      setError(message);
      setOutput("");
    }
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="YAML Validator"
      description="Validate YAML syntax, check indentation, and find YAML formatting errors directly in your browser."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          YAML Input
        </label>

        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={`app:
  name: Yoryantra
  environment: production
  features:
    - yaml-validator
    - devops-tools
    - configuration-checks`}
          className="w-full min-h-[240px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={validateYAML} className="yoryantra-btn">
          Validate YAML
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
            Validation Result
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

        <pre className="yoryantra-output overflow-auto text-sm min-h-[220px] whitespace-pre-wrap break-words">
          {output || "YAML validation result will appear here."}
        </pre>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Checking YAML Files for Syntax and Formatting Errors
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            YAML files are commonly used in configuration files, DevOps tools,
            deployment settings, CI/CD pipelines, containers, and infrastructure
            configuration. Small indentation problems, missing colons, broken
            lists, or YAML syntax errors can stop a file from working correctly.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This YAML Validator helps you validate YAML syntax, check YAML
            formatting issues, and quickly identify indentation problems before
            using YAML content in configuration, deployment, or DevOps-related
            work.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Validating YAML Content in the Browser
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste your YAML content into the input box.</li>
            <li>
              Click <strong>Validate YAML</strong>.
            </li>
            <li>Check whether the YAML syntax is valid.</li>
            <li>Use the error message to review formatting or indentation issues.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common YAML Validation Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Checking YAML syntax before using configuration files.</li>
            <li>Validating CI/CD YAML files before committing changes.</li>
            <li>Finding indentation issues in YAML content.</li>
            <li>Checking deployment settings and DevOps configuration values.</li>
            <li>Reviewing YAML data before converting it to JSON.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example YAML to Validate
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`app:
  name: Yoryantra
  environment: production
  features:
    - yaml-validator
    - json-tools
    - devops-utilities`}
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
                What does this YAML Validator check?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It checks whether YAML content follows valid YAML syntax. It can
                help identify indentation errors, missing colons, invalid lists,
                unmatched quotes, and broken key-value structure.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why do YAML indentation errors happen?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                YAML depends heavily on spacing and indentation. If a nested
                value, list item, or key is placed at the wrong indentation
                level, the YAML file may fail to parse correctly.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I check DevOps YAML files here?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. You can paste YAML used in configuration files, CI/CD
                files, deployment settings, Kubernetes snippets, Docker-related
                files, or other DevOps content to check basic YAML syntax.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this tool upload my YAML content?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The YAML check happens in your browser. Your YAML content is
                not uploaded to a server for validation.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/yaml-formatter"
              className="yoryantra-btn-outline"
            >
              YAML Formatter
            </Link>

            <Link
              href="/tools/yaml-to-json-converter"
              className="yoryantra-btn-outline"
            >
              YAML to JSON Converter
            </Link>

            <Link
              href="/tools/json-to-yaml-converter"
              className="yoryantra-btn-outline"
            >
              JSON to YAML Converter
            </Link>

            <Link
              href="/tools/kubernetes-yaml-validator"
              className="yoryantra-btn-outline"
            >
              Kubernetes YAML Validator
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function parseYAML(source: string) {
  const lines = source.replace(/\t/g, "  ").split(/\r?\n/);
  const stack: Array<{ indent: number; type: "object" | "array" }> = [
    { indent: -1, type: "object" },
  ];

  let hasContent = false;

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index];
    const lineNumber = index + 1;
    const withoutComment = stripComment(rawLine);

    if (!withoutComment.trim()) {
      continue;
    }

    hasContent = true;

    const indent = countIndent(withoutComment);

    if (indent % 2 !== 0) {
      throw new Error(
        `Line ${lineNumber}: YAML indentation should use consistent spaces.`
      );
    }

    const trimmed = withoutComment.trim();

    if (
      trimmed.startsWith("---") ||
      trimmed.startsWith("...") ||
      trimmed === "{}" ||
      trimmed === "[]"
    ) {
      continue;
    }

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    if (trimmed.startsWith("- ")) {
      const value = trimmed.slice(2).trim();

      if (!value) {
        stack.push({ indent, type: "array" });
        continue;
      }

      if (value.includes(":")) {
        validateKeyValue(value, lineNumber);
      }

      continue;
    }

    if (!trimmed.includes(":")) {
      throw new Error(
        `Line ${lineNumber}: Expected a key-value pair using a colon.`
      );
    }

    validateKeyValue(trimmed, lineNumber);

    const afterColon = trimmed.slice(trimmed.indexOf(":") + 1).trim();

    if (!afterColon) {
      stack.push({ indent, type: "object" });
    }
  }

  if (!hasContent) {
    throw new Error("YAML content is empty.");
  }
}

function validateKeyValue(value: string, lineNumber: number) {
  const colonIndex = value.indexOf(":");

  if (colonIndex === 0) {
    throw new Error(`Line ${lineNumber}: Missing key before colon.`);
  }

  const key = value.slice(0, colonIndex).trim();

  if (!key) {
    throw new Error(`Line ${lineNumber}: Missing key before colon.`);
  }

  const afterColon = value.slice(colonIndex + 1);

  if (afterColon && !afterColon.startsWith(" ")) {
    throw new Error(
      `Line ${lineNumber}: Add a space after the colon in this key-value pair.`
    );
  }

  const quoteChars = value.match(/["']/g);

  if (quoteChars && quoteChars.length % 2 !== 0) {
    throw new Error(`Line ${lineNumber}: Possible unmatched quote detected.`);
  }

  const openBrackets = (value.match(/\[/g) || []).length;
  const closeBrackets = (value.match(/\]/g) || []).length;
  const openBraces = (value.match(/\{/g) || []).length;
  const closeBraces = (value.match(/\}/g) || []).length;

  if (openBrackets !== closeBrackets || openBraces !== closeBraces) {
    throw new Error(
      `Line ${lineNumber}: Possible unmatched bracket or brace detected.`
    );
  }
}

function stripComment(line: string) {
  let inSingleQuote = false;
  let inDoubleQuote = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
    }

    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
    }

    if (char === "#" && !inSingleQuote && !inDoubleQuote) {
      return line.slice(0, index);
    }
  }

  return line;
}

function countIndent(line: string) {
  const match = line.match(/^ */);
  return match ? match[0].length : 0;
}
