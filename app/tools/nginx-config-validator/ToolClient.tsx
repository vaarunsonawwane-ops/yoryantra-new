"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type NginxIssue = {
  line: number;
  level: "Warning" | "Note";
  message: string;
};

type Directive = {
  line: number;
  name: string;
  args: string[];
  kind: "simple" | "block";
  context: string[];
};

type ScanResult = {
  directives: Directive[];
  issues: NginxIssue[];
  blockCount: number;
};

const sampleConfig = `server {
    listen 80;
    server_name example.com www.example.com;

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}`;

export default function ToolClient() {
  const [input, setInput] = useState(sampleConfig);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const validate = () => {
    if (!input.trim()) {
      setError("Paste an Nginx configuration or snippet to inspect.");
      setOutput("");
      return;
    }

    try {
      const result = scanNginx(input);
      setOutput(formatNginxReport(result));
      setError("");
    } catch (err) {
      setOutput("");
      setError(err instanceof Error ? err.message : "Unable to inspect this Nginx configuration.");
    }
  };

  const resetAll = () => {
    setInput(sampleConfig);
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="Nginx Config Validator"
      description="Statically inspect Nginx configuration text for braces, semicolons, quoted values, block structure, and selected common directive mistakes."
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nginx configuration
        </label>
        <textarea
          value={input}
          onChange={(event: { target: { value: string } }) => setInput(event.target.value)}
          rows={16}
          placeholder={sampleConfig}
          className="mt-2 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          This is a static browser inspector. It cannot load include files,
          installed modules, certificates, filesystem paths, DNS, or upstreams.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={validate} className="yoryantra-btn">
          Inspect Nginx Config
        </button>
        <button
          onClick={() => {
            setInput(sampleConfig);
            setOutput("");
            setError("");
          }}
          className="yoryantra-btn-outline"
        >
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

      <div className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Static inspection report
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
        <pre className="yoryantra-output mt-3 min-h-[320px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "Nginx configuration findings will appear here."}
        </pre>
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            A static inspector is useful, but nginx -t is authoritative
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Nginx configuration syntax is built from simple directives ending in
            semicolons and block directives enclosed in braces. This tool scans
            those structural boundaries while respecting quoted text and
            comments, then applies a small set of high-confidence checks.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            It does not know which modules are installed or whether an included
            file, certificate, path, resolver, variable, or upstream exists.
            Nginx itself must perform those checks.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Before reloading production Nginx
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Run <span className="font-mono">nginx -t</span> against the actual
            configuration. Nginx documents that option as checking configuration
            syntax and trying to open files referenced by the configuration.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reference</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            See the official{" "}
            <a href="https://nginx.org/en/docs/switches.html" target="_blank" rel="noreferrer" className="font-medium underline">
              Nginx command-line parameter documentation
            </a>
            . This browser tool does not send the configuration anywhere.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/nginx-config-validator" />
        </div>
      </section>
    </ToolShell>
  );
}

function scanNginx(source: string): ScanResult {
  const directives: Directive[] = [];
  const issues: NginxIssue[] = [];
  const context: Array<{ name: string; line: number }> = [];
  let buffer = "";
  let statementLine = 1;
  let line = 1;
  let quote: "'" | '"' | "" = "";
  let escaped = false;
  let inComment = false;
  let blockCount = 0;

  const startBufferIfNeeded = (char: string) => {
    if (!buffer.trim() && !/\s/.test(char)) statementLine = line;
  };

  const flush = (kind: "simple" | "block") => {
    const statement = buffer.trim();
    buffer = "";
    if (!statement) return null;

    const parts = splitArguments(statement);
    if (!parts.length) return null;

    const directive: Directive = {
      line: statementLine,
      name: parts[0].toLowerCase(),
      args: parts.slice(1),
      kind,
      context: context.map((item) => item.name),
    };
    directives.push(directive);
    return directive;
  };

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];

    if (inComment) {
      if (char === "\n") {
        inComment = false;
        line += 1;
        if (buffer && !buffer.endsWith(" ")) buffer += " ";
      }
      continue;
    }

    if (escaped) {
      startBufferIfNeeded(char);
      buffer += char;
      escaped = false;
      if (char === "\n") line += 1;
      continue;
    }

    if (char === "\\" && quote) {
      startBufferIfNeeded(char);
      buffer += char;
      escaped = true;
      continue;
    }

    if (quote) {
      buffer += char;
      if (char === quote) quote = "";
      if (char === "\n") line += 1;
      continue;
    }

    if (char === "'" || char === '"') {
      startBufferIfNeeded(char);
      quote = char;
      buffer += char;
      continue;
    }

    if (char === "#") {
      inComment = true;
      continue;
    }

    if (char === "\n") {
      line += 1;
      if (buffer && !buffer.endsWith(" ")) buffer += " ";
      continue;
    }

    if (char === "{") {
      const directive = flush("block");
      if (!directive) {
        issues.push({
          line,
          level: "Warning",
          message: "Opening brace has no block directive before it.",
        });
      } else {
        context.push({ name: directive.name, line: directive.line });
        blockCount += 1;
        inspectDirective(directive, issues);
      }
      continue;
    }

    if (char === ";") {
      const directive = flush("simple");
      if (!directive) {
        issues.push({
          line,
          level: "Note",
          message: "Empty directive terminator found.",
        });
      } else {
        inspectDirective(directive, issues);
      }
      continue;
    }

    if (char === "}") {
      if (buffer.trim()) {
        issues.push({
          line: statementLine,
          level: "Warning",
          message: `Directive "${buffer.trim()}" reaches a closing brace without a semicolon.`,
        });
        buffer = "";
      }

      if (!context.length) {
        issues.push({
          line,
          level: "Warning",
          message: "Closing brace has no matching opening block.",
        });
      } else {
        context.pop();
      }
      continue;
    }

    startBufferIfNeeded(char);
    buffer += char;
  }

  if (quote) {
    issues.push({
      line: statementLine,
      level: "Warning",
      message: "Quoted value is not closed before end of input.",
    });
  }

  if (buffer.trim()) {
    issues.push({
      line: statementLine,
      level: "Warning",
      message: `Directive "${buffer.trim()}" reaches end of input without a semicolon or block opening brace.`,
    });
  }

  context.forEach((block) => {
    issues.push({
      line: block.line,
      level: "Warning",
      message: `Block "${block.name}" does not have a matching closing brace.`,
    });
  });

  const hasInclude = directives.some((directive) => directive.name === "include");
  if (hasInclude) {
    issues.push({
      line: 0,
      level: "Note",
      message: "include directives are present. This browser check does not load or inspect included files.",
    });
  }

  const serverBlocks = directives.filter(
    (directive) => directive.kind === "block" && directive.name === "server"
  );
  if (serverBlocks.length) {
    const hasListen = directives.some(
      (directive) =>
        directive.name === "listen" && directive.context.includes("server")
    );
    if (!hasListen) {
      issues.push({
        line: 0,
        level: "Note",
        message: "A server block was found but no listen directive was detected inside a server context.",
      });
    }
  }

  return {
    directives,
    issues: dedupeIssues(issues),
    blockCount,
  };
}

function inspectDirective(directive: Directive, issues: NginxIssue[]) {
  const { name, args, line, kind } = directive;

  if (kind === "block" && ["location", "upstream", "map"].includes(name) && !args.length) {
    issues.push({
      line,
      level: "Warning",
      message: `${name} block is missing the argument/name that normally follows the directive.`,
    });
  }

  if (name === "listen" && !args.length) {
    issues.push({ line, level: "Warning", message: "listen has no address or port argument." });
  }

  if (name === "proxy_pass") {
    if (!args.length) {
      issues.push({ line, level: "Warning", message: "proxy_pass has no destination." });
    } else if (args.length > 1) {
      issues.push({
        line,
        level: "Note",
        message: "proxy_pass usually takes one destination value. Review the parsed arguments.",
      });
    }
  }

  if (name === "ssl" && args[0]?.toLowerCase() === "on") {
    issues.push({
      line,
      level: "Note",
      message: 'Legacy "ssl on;" syntax was found. Modern configurations normally enable SSL on the listen directive.',
    });
  }

  if (name === "root" && args.length === 1 && args[0] === "/") {
    issues.push({
      line,
      level: "Warning",
      message: "The filesystem root / is configured as a web root. Confirm this is intentional.",
    });
  }

  if (name === "add_header" && args.length) {
    const securityHeaders = new Set([
      "content-security-policy",
      "strict-transport-security",
      "x-frame-options",
      "x-content-type-options",
      "referrer-policy",
      "permissions-policy",
    ]);
    if (
      securityHeaders.has(args[0].toLowerCase()) &&
      !args.some((arg) => arg.toLowerCase() === "always")
    ) {
      issues.push({
        line,
        level: "Note",
        message: `${args[0]} is added without the "always" parameter. Review whether it should also be present on error responses.`,
      });
    }
  }
}

function splitArguments(statement: string) {
  const result: string[] = [];
  let current = "";
  let quote: "'" | '"' | "" = "";
  let escaped = false;

  for (let index = 0; index < statement.length; index += 1) {
    const char = statement[index];

    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (char === "\\" && quote) {
      current += char;
      escaped = true;
      continue;
    }

    if (quote) {
      current += char;
      if (char === quote) quote = "";
      continue;
    }

    if (char === "'" || char === '"') {
      quote = char;
      current += char;
      continue;
    }

    if (/\s/.test(char)) {
      if (current) {
        result.push(current);
        current = "";
      }
      continue;
    }

    current += char;
  }

  if (current) result.push(current);
  return result;
}

function formatNginxReport(result: ScanResult) {
  const warnings = result.issues.filter((issue) => issue.level === "Warning").length;
  const notes = result.issues.filter((issue) => issue.level === "Note").length;
  const names = Array.from(new Set(result.directives.map((directive) => directive.name)));

  const lines = [
    "Nginx static inspection completed.",
    "",
    `Parsed directives: ${result.directives.length}`,
    `Blocks opened: ${result.blockCount}`,
    `Directive names: ${names.length ? names.join(", ") : "None"}`,
    `Warnings: ${warnings}`,
    `Notes: ${notes}`,
    "",
    "Findings:",
  ];

  if (!result.issues.length) {
    lines.push("No structural issues found by this static browser check.");
  } else {
    result.issues.forEach((issue, index) => {
      lines.push(
        `${index + 1}. ${issue.level}${issue.line ? ` on line ${issue.line}` : ""}: ${issue.message}`
      );
    });
  }

  lines.push("");
  lines.push(
    "Not checked here: installed modules, include file contents, referenced files, certificates, filesystem permissions, DNS, upstream availability, or runtime behavior."
  );
  lines.push("Before reload, run nginx -t against the real configuration.");

  return lines.join("\n");
}

function dedupeIssues(issues: NginxIssue[]) {
  const seen = new Set<string>();
  return issues.filter((issue) => {
    const key = `${issue.line}|${issue.level}|${issue.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
