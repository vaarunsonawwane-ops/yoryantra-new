"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type LintLevel =
  | "Warning"
  | "Suggestion"
  | "Note";

type SourceMode =
  | "auto"
  | "full"
  | "snippet";

type NginxIssue = {
  line: number;
  level: LintLevel;
  rule: string;
  message: string;
};

type ContextFrame = {
  name: string;
  args: string[];
  line: number;
};

type Directive = {
  line: number;
  name: string;
  args: string[];
  kind: "simple" | "block";
  context: ContextFrame[];
  raw: string;
};

type NginxReport = {
  directives: Directive[];
  issues: NginxIssue[];
  blockCount: number;
  includeCount: number;
  detectedMode: "full" | "snippet";
};

const MAX_INPUT_CHARACTERS = 2_000_000;

const SAMPLE_CONFIG = `worker_processes auto;

events {
    worker_connections 1024;
}

http {
    include mime.types;

    server {
        listen 80;
        server_name example.com www.example.com;

        location /api/ {
            proxy_pass http://127.0.0.1:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}`;

function issue(
  line: number,
  level: LintLevel,
  rule: string,
  message: string
): NginxIssue {
  return {
    line,
    level,
    rule,
    message,
  };
}

function contextNames(
  directive: Directive
) {
  return directive.context.map(
    (frame) => frame.name
  );
}

function nearestContext(
  directive: Directive,
  name: string
) {
  for (
    let index =
      directive.context.length - 1;
    index >= 0;
    index -= 1
  ) {
    if (
      directive.context[index]
        .name === name
    ) {
      return directive.context[
        index
      ];
    }
  }

  return null;
}

function contextLabel(
  directive: Directive
) {
  if (!directive.context.length) {
    return "main / supplied root";
  }

  return directive.context
    .map((frame) => {
      const args =
        frame.args.join(" ");

      return args
        ? `${frame.name} ${args}`
        : frame.name;
    })
    .join(" → ");
}

function splitArguments(
  statement: string
) {
  const result: string[] = [];
  let current = "";
  let quote = "";
  let escaped = false;

  const push = () => {
    if (current) {
      result.push(current);
      current = "";
    }
  };

  for (
    let index = 0;
    index < statement.length;
    index += 1
  ) {
    const char =
      statement.charAt(index);

    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (quote) {
      if (char === quote) {
        quote = "";
      } else {
        current += char;
      }
      continue;
    }

    if (
      char === "'" ||
      char === '"'
    ) {
      quote = char;
      continue;
    }

    if (/\s/.test(char)) {
      push();
      continue;
    }

    current += char;
  }

  if (escaped) {
    current += "\\";
  }

  push();
  return result;
}

function scanNginx(
  source: string
) {
  const directives: Directive[] =
    [];
  const issues: NginxIssue[] =
    [];
  const context: ContextFrame[] =
    [];
  let buffer = "";
  let statementLine = 1;
  let line = 1;
  let quote = "";
  let escaped = false;
  let inComment = false;
  let blockCount = 0;

  const appendSpace = () => {
    if (
      buffer &&
      buffer.charAt(
        buffer.length - 1
      ) !== " "
    ) {
      buffer += " ";
    }
  };

  const startBuffer = (
    char: string
  ) => {
    if (
      !buffer.trim() &&
      !/\s/.test(char)
    ) {
      statementLine = line;
    }
  };

  const flush = (
    kind:
      | "simple"
      | "block"
  ) => {
    const statement =
      buffer.trim();
    buffer = "";

    if (!statement) {
      return null;
    }

    const parts =
      splitArguments(
        statement
      );

    if (!parts.length) {
      return null;
    }

    const directive: Directive = {
      line: statementLine,
      name:
        parts[0].toLowerCase(),
      args:
        parts.slice(1),
      kind,
      context:
        context.map(
          (frame) => ({
            name: frame.name,
            args:
              frame.args.slice(),
            line: frame.line,
          })
        ),
      raw: statement,
    };

    directives.push(
      directive
    );

    return directive;
  };

  for (
    let index = 0;
    index < source.length;
    index += 1
  ) {
    const char =
      source.charAt(index);

    if (inComment) {
      if (char === "\n") {
        inComment = false;
        line += 1;
        appendSpace();
      }
      continue;
    }

    if (escaped) {
      startBuffer(char);

      if (char === "\n") {
        line += 1;
        appendSpace();
      } else {
        buffer += char;
      }

      escaped = false;
      continue;
    }

    if (char === "\\") {
      startBuffer(char);
      escaped = true;
      continue;
    }

    if (quote) {
      buffer += char;

      if (char === quote) {
        quote = "";
      }

      if (char === "\n") {
        line += 1;
      }

      continue;
    }

    if (
      char === "'" ||
      char === '"'
    ) {
      startBuffer(char);
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
      appendSpace();
      continue;
    }

    if (char === "{") {
      const directive =
        flush("block");

      if (!directive) {
        issues.push(
          issue(
            line,
            "Warning",
            "orphan-opening-brace",
            "Opening brace has no block directive before it."
          )
        );
      } else {
        context.push({
          name:
            directive.name,
          args:
            directive.args.slice(),
          line:
            directive.line,
        });
        blockCount += 1;
      }

      continue;
    }

    if (char === ";") {
      const directive =
        flush("simple");

      if (!directive) {
        issues.push(
          issue(
            line,
            "Note",
            "empty-terminator",
            "An empty semicolon was found."
          )
        );
      }

      continue;
    }

    if (char === "}") {
      if (buffer.trim()) {
        issues.push(
          issue(
            statementLine,
            "Warning",
            "missing-semicolon",
            `Directive text "${buffer.trim()}" reaches a closing brace without a semicolon or block opening brace.`
          )
        );
        buffer = "";
      }

      if (!context.length) {
        issues.push(
          issue(
            line,
            "Warning",
            "orphan-closing-brace",
            "Closing brace has no matching opening block."
          )
        );
      } else {
        context.pop();
      }

      continue;
    }

    startBuffer(char);
    buffer += char;
  }

  if (quote) {
    issues.push(
      issue(
        statementLine,
        "Warning",
        "unclosed-quote",
        "Quoted value is not closed before the end of the supplied configuration."
      )
    );
  }

  if (escaped) {
    issues.push(
      issue(
        line,
        "Warning",
        "dangling-escape",
        "The supplied configuration ends immediately after a backslash escape."
      )
    );
  }

  if (buffer.trim()) {
    issues.push(
      issue(
        statementLine,
        "Warning",
        "unterminated-directive",
        `Directive text "${buffer.trim()}" reaches the end of input without a semicolon or block opening brace.`
      )
    );
  }

  context.forEach((frame) => {
    issues.push(
      issue(
        frame.line,
        "Warning",
        "unclosed-block",
        `Block "${frame.name}${
          frame.args.length
            ? ` ${frame.args.join(
                " "
              )}`
            : ""
        }" has no matching closing brace in the supplied text.`
      )
    );
  });

  return {
    directives,
    structuralIssues:
      issues,
    blockCount,
  };
}

function detectMode(
  directives: Directive[],
  requested: SourceMode
) {
  if (requested === "full") {
    return "full" as const;
  }

  if (requested === "snippet") {
    return "snippet" as const;
  }

  const mainSignals = [
    "worker_processes",
    "user",
    "pid",
    "error_log",
    "events",
    "http",
    "stream",
    "mail",
    "load_module",
  ];

  const topLevel =
    directives.filter(
      (directive) =>
        directive.context
          .length === 0
    );

  return topLevel.some(
    (directive) =>
      mainSignals.indexOf(
        directive.name
      ) !== -1
  )
    ? ("full" as const)
    : ("snippet" as const);
}

function isHttpUrl(
  value: string
) {
  return (
    value.indexOf("http://") ===
      0 ||
    value.indexOf("https://") ===
      0
  );
}

function proxyPassHasUri(
  value: string
) {
  if (
    !isHttpUrl(value) ||
    value.indexOf("$") !== -1
  ) {
    return false;
  }

  try {
    const parsed =
      new URL(value);

    return (
      parsed.pathname !==
        "/" ||
      value.charAt(
        value.length - 1
      ) === "/"
    );
  } catch {
    return false;
  }
}

function locationKind(
  frame: ContextFrame | null
) {
  if (!frame) return "";

  const value =
    frame.args.join(" ");

  if (
    /^@/.test(value)
  ) {
    return "named";
  }

  if (
    /^~\*?\s/.test(value)
  ) {
    return "regex";
  }

  if (
    /^=\s/.test(value)
  ) {
    return "exact";
  }

  return "prefix";
}

function contextIsPrefix(
  possibleParent: ContextFrame[],
  child: ContextFrame[]
) {
  if (
    possibleParent.length >
    child.length
  ) {
    return false;
  }

  for (
    let index = 0;
    index < possibleParent.length;
    index += 1
  ) {
    if (
      possibleParent[index].name !==
        child[index].name ||
      possibleParent[index].line !==
        child[index].line
    ) {
      return false;
    }
  }

  return true;
}

function hasVisibleDirective(
  directives: Directive[],
  name: string,
  context: ContextFrame[]
) {
  return directives.some(
    (directive) =>
      directive.name === name &&
      contextIsPrefix(
        directive.context,
        context
      )
  );
}

function sameContextKey(
  directive: Directive
) {
  return directive.context
    .map(
      (frame) =>
        `${frame.name}:${frame.line}`
    )
    .join("|");
}

function countSameContext(
  directives: Directive[],
  directive: Directive,
  name: string
) {
  const key =
    sameContextKey(
      directive
    );

  return directives.filter(
    (candidate) =>
      candidate.name === name &&
      sameContextKey(
        candidate
      ) === key
  ).length;
}

function inspectDirective(
  directive: Directive,
  directives: Directive[],
  issues: NginxIssue[]
) {
  const name =
    directive.name;
  const args =
    directive.args;
  const line =
    directive.line;
  const contexts =
    contextNames(
      directive
    );

  if (
    directive.kind === "block" &&
    [
      "location",
      "upstream",
      "map",
      "geo",
      "limit_except",
      "if",
    ].indexOf(name) !==
      -1 &&
    !args.length
  ) {
    issues.push(
      issue(
        line,
        "Warning",
        "missing-block-argument",
        `${name} block is missing the argument that normally identifies its location, condition, zone, or mapping.`
      )
    );
  }

  if (
    directive.kind === "simple" &&
    [
      "listen",
      "server_name",
      "proxy_pass",
      "root",
      "alias",
      "include",
      "return",
      "rewrite",
      "ssl_certificate",
      "ssl_certificate_key",
    ].indexOf(name) !==
      -1 &&
    !args.length
  ) {
    issues.push(
      issue(
        line,
        "Warning",
        "missing-directive-argument",
        `${name} has no argument.`
      )
    );
  }

  if (
    name === "events" &&
    directive.context.length
  ) {
    issues.push(
      issue(
        line,
        "Warning",
        "events-context",
        "events is a main-context block in a full nginx.conf; it should not be nested inside another block."
      )
    );
  }

  if (
    (name === "http" ||
      name === "stream" ||
      name === "mail") &&
    directive.context.length
  ) {
    issues.push(
      issue(
        line,
        "Warning",
        "top-level-module-context",
        `${name} is normally a main-context block in a full nginx.conf.`
      )
    );
  }

  if (
    name === "location" &&
    contexts.indexOf(
      "server"
    ) === -1
  ) {
    issues.push(
      issue(
        line,
        "Warning",
        "location-context",
        "location appears without an enclosing server context in the supplied text. If this is an intentionally partial snippet, provide the parent context mentally when reviewing the result."
      )
    );
  }

  if (name === "listen") {
    const first =
      args.length
        ? args[0]
        : "";

    if (
      first &&
      /^\d+$/.test(first)
    ) {
      const port =
        Number(first);

      if (
        port < 1 ||
        port > 65535
      ) {
        issues.push(
          issue(
            line,
            "Warning",
            "listen-port",
            `listen port ${first} is outside 1-65535.`
          )
        );
      }
    }
  }

  if (
    name === "proxy_pass"
  ) {
    if (
      args.length > 1
    ) {
      issues.push(
        issue(
          line,
          "Warning",
          "proxy-pass-arguments",
          "proxy_pass normally takes one URL destination value. Review the parsed arguments."
        )
      );
    }

    if (args.length) {
      const destination =
        args[0];

      if (
        destination.indexOf(
          "http://"
        ) !== 0 &&
        destination.indexOf(
          "https://"
        ) !== 0 &&
        destination.indexOf(
          "http://unix:"
        ) !== 0 &&
        destination.indexOf(
          "https://unix:"
        ) !== 0
      ) {
        issues.push(
          issue(
            line,
            "Suggestion",
            "proxy-pass-scheme",
            `proxy_pass destination "${destination}" does not visibly begin with http:// or https://. Variables can make a valid destination less obvious, so confirm it against the real Nginx parser.`
          )
        );
      }

      const location =
        nearestContext(
          directive,
          "location"
        );
      const kind =
        locationKind(
          location
        );

      if (
        location &&
        proxyPassHasUri(
          destination
        )
      ) {
        if (
          kind === "regex" ||
          kind === "named"
        ) {
          issues.push(
            issue(
              line,
              "Warning",
              "proxy-pass-uri-location",
              `proxy_pass includes a URI component inside a ${kind} location. Nginx documents cases where proxy_pass in regex or named locations should be specified without a URI because the part of the request URI to replace cannot be determined.`
            )
          );
        } else {
          issues.push(
            issue(
              line,
              "Note",
              "proxy-pass-uri-rewrite",
              `proxy_pass includes a URI component in location "${location.args.join(
                " "
              )}". Nginx replaces the normalized request-URI portion matching the location with the URI from proxy_pass; trailing-slash changes here can alter upstream paths.`
            )
          );
        }
      }

      if (
        destination.indexOf("$") !==
        -1
      ) {
        const hasResolver =
          directives.some(
            (candidate) =>
              candidate.name ===
                "resolver" &&
              candidate.line <=
                directive.line
          );

        if (!hasResolver) {
          issues.push(
            issue(
              line,
              "Note",
              "dynamic-proxy-resolution",
              "proxy_pass contains a variable. If the resulting upstream host requires runtime DNS resolution rather than an upstream group, a resolver directive may be required; this static checker cannot determine the final variable value."
            )
          );
        }
      }
    }
  }

  if (
    name === "ssl" &&
    args.length &&
    args[0].toLowerCase() ===
      "on"
  ) {
    issues.push(
      issue(
        line,
        "Suggestion",
        "legacy-ssl-directive",
        'Legacy "ssl on;" syntax was found. Modern HTTP configurations normally enable TLS using the ssl parameter on listen.'
      )
    );
  }

  if (
    name === "ssl_protocols"
  ) {
    const oldProtocols =
      args.filter(
        (arg) =>
          arg === "TLSv1" ||
          arg === "TLSv1.1" ||
          arg === "SSLv2" ||
          arg === "SSLv3"
      );

    if (
      oldProtocols.length
    ) {
      issues.push(
        issue(
          line,
          "Warning",
          "old-tls-protocol",
          `ssl_protocols includes older protocol${
            oldProtocols.length === 1
              ? ""
              : "s"
          }: ${oldProtocols.join(
            ", "
          )}. Confirm this is deliberately required by your client compatibility policy.`
        )
      );
    }
  }

  if (
    name === "root" &&
    args.length === 1 &&
    args[0] === "/"
  ) {
    issues.push(
      issue(
        line,
        "Warning",
        "filesystem-root",
        "The filesystem root / is configured as a web root. Confirm that exposing files relative to the operating-system root is intentional."
      )
    );
  }

  if (
    name === "autoindex" &&
    args.length &&
    args[0].toLowerCase() ===
      "on"
  ) {
    issues.push(
      issue(
        line,
        "Suggestion",
        "autoindex",
        "autoindex is enabled. Directory listings can expose filenames and structure; keep it only where directory browsing is intended."
      )
    );
  }

  if (
    name === "server_tokens" &&
    args.length &&
    args[0].toLowerCase() ===
      "on"
  ) {
    issues.push(
      issue(
        line,
        "Note",
        "server-tokens",
        "server_tokens is explicitly on. Review whether exposing the Nginx version in generated error pages and the Server header matches your information-disclosure policy."
      )
    );
  }

  if (
    name === "add_header" &&
    args.length
  ) {
    const header =
      args[0].toLowerCase();
    const securityHeaders = [
      "content-security-policy",
      "strict-transport-security",
      "x-frame-options",
      "x-content-type-options",
      "referrer-policy",
      "permissions-policy",
    ];

    if (
      securityHeaders.indexOf(
        header
      ) !== -1 &&
      !args.some(
        (arg) =>
          arg.toLowerCase() ===
          "always"
      )
    ) {
      issues.push(
        issue(
          line,
          "Suggestion",
          "security-header-always",
          `${args[0]} is added without the always parameter. Review whether the header should also be sent on response codes outside add_header's default status set.`
        )
      );
    }

    if (
      contexts.indexOf(
        "location"
      ) !== -1
    ) {
      issues.push(
        issue(
          line,
          "Note",
          "add-header-inheritance",
          "add_header is declared in a location. Header inheritance is context-sensitive: declaring add_header at a child level can affect inheritance from parent levels unless add_header_inherit behavior is configured in versions that support it."
        )
      );
    }
  }

  if (
    name === "return" &&
    args.length
  ) {
    const code =
      Number(args[0]);

    if (
      Number.isInteger(
        code
      ) &&
      (code === 301 ||
        code === 302 ||
        code === 303 ||
        code === 307 ||
        code === 308) &&
      args.length < 2
    ) {
      issues.push(
        issue(
          line,
          "Warning",
          "redirect-return",
          `return ${code} normally needs a redirect URL for this use.`
        )
      );
    }

    if (
      args.some(
        (arg) =>
          arg.indexOf(
            "http://"
          ) === 0
      )
    ) {
      issues.push(
        issue(
          line,
          "Suggestion",
          "http-redirect",
          "A return directive visibly redirects to an http:// URL. Confirm that a transport-security downgrade is intentional."
        )
      );
    }
  }

  if (
    name === "rewrite" &&
    args.length < 2
  ) {
    issues.push(
      issue(
        line,
        "Warning",
        "rewrite-arguments",
        "rewrite normally needs a regular expression and replacement, with an optional flag."
      )
    );
  }

  if (
    name === "if" &&
    directive.kind === "block"
  ) {
    issues.push(
      issue(
        line,
        "Note",
        "rewrite-if",
        "An if block is present. Nginx if belongs to the rewrite module and does not behave like a general-purpose programming-language conditional; review the directives inside it against their documented allowed context."
      )
    );
  }

  if (
    [
      "cmd",
      "entrypoint",
      "copy",
      "run",
    ].indexOf(name) !==
    -1
  ) {
    issues.push(
      issue(
        line,
        "Warning",
        "foreign-config-syntax",
        `"${name}" looks like a Dockerfile instruction, not an Nginx directive. Confirm that the correct file was pasted.`
      )
    );
  }

  if (
    name === "server_name" &&
    args.length
  ) {
    const duplicates: string[] =
      [];

    args.forEach((arg) => {
      if (
        args.filter(
          (candidate) =>
            candidate === arg
        ).length > 1 &&
        duplicates.indexOf(
          arg
        ) === -1
      ) {
        duplicates.push(arg);
      }
    });

    if (
      duplicates.length
    ) {
      issues.push(
        issue(
          line,
          "Suggestion",
          "duplicate-server-name",
          `server_name repeats ${duplicates.join(
            ", "
          )}.`
        )
      );
    }
  }

  if (
    [
      "client_max_body_size",
      "proxy_read_timeout",
      "proxy_connect_timeout",
      "proxy_send_timeout",
      "keepalive_timeout",
    ].indexOf(name) !==
      -1 &&
    countSameContext(
      directives,
      directive,
      name
    ) > 1
  ) {
    issues.push(
      issue(
        line,
        "Suggestion",
        "duplicate-same-context",
        `${name} is declared more than once in the same supplied context. Nginx directives have directive-specific duplicate/inheritance rules; remove accidental duplicates and confirm intentional ones with nginx -t.`
      )
    );
  }
}

function dedupeIssues(
  issues: NginxIssue[]
) {
  const seen =
    new Set<string>();
  const result: NginxIssue[] =
    [];

  issues.forEach((entry) => {
    const key = `${entry.line}|${entry.level}|${entry.rule}|${entry.message}`;

    if (!seen.has(key)) {
      seen.add(key);
      result.push(entry);
    }
  });

  const rank: Record<
    LintLevel,
    number
  > = {
    Warning: 0,
    Suggestion: 1,
    Note: 2,
  };

  return result.sort(
    (a, b) => {
      if (a.line !== b.line) {
        if (a.line === 0) {
          return -1;
        }

        if (b.line === 0) {
          return 1;
        }

        return a.line - b.line;
      }

      return (
        rank[a.level] -
        rank[b.level]
      );
    }
  );
}

function buildNginxReport(
  source: string,
  mode: SourceMode
): NginxReport {
  const scanned =
    scanNginx(source);
  const directives =
    scanned.directives;
  const issues =
    scanned.structuralIssues.slice();
  const detectedMode =
    detectMode(
      directives,
      mode
    );
  const includeCount =
    directives.filter(
      (directive) =>
        directive.name ===
        "include"
    ).length;

  directives.forEach(
    (directive) =>
      inspectDirective(
        directive,
        directives,
        issues
      )
  );

  if (includeCount) {
    issues.push(
      issue(
        0,
        "Note",
        "include-boundary",
        `The supplied text contains ${includeCount} include directive${
          includeCount === 1
            ? ""
            : "s"
        }. This browser inspector does not load included files, so a directive that looks missing here may exist in an included file and an included file may contain errors not visible here.`
      )
    );
  }

  if (
    detectedMode === "full"
  ) {
    directives
      .filter(
        (directive) =>
          directive.context
            .length === 0 &&
          directive.name ===
            "server"
      )
      .forEach(
        (directive) => {
          issues.push(
            issue(
              directive.line,
              "Warning",
              "top-level-server",
              "A server block appears at the main level while Full nginx.conf mode is active. HTTP, stream, and mail server blocks belong inside their module context."
            )
          );
        }
      );

    const hasEvents =
      directives.some(
        (directive) =>
          directive.name ===
            "events" &&
          directive.context
            .length === 0 &&
          directive.kind ===
            "block"
      );

    if (!hasEvents) {
      issues.push(
        issue(
          0,
          "Suggestion",
          "events-block",
          "Full nginx.conf mode was selected/detected, but no top-level events block was found in the supplied text. If this is actually an included snippet, switch the source mode to Included snippet."
        )
      );
    }
  } else {
    issues.push(
      issue(
        0,
        "Note",
        "snippet-context",
        "The supplied text is being treated as an included/partial snippet. Parent-context checks are intentionally conservative because the browser cannot know whether this file is included from http, server, stream, mail, or another valid context."
      )
    );
  }

  const sslListeners =
    directives.filter(
      (directive) =>
        directive.name ===
          "listen" &&
        directive.args.some(
          (arg) =>
            arg.toLowerCase() ===
            "ssl"
        )
    );

  sslListeners.forEach(
    (listenDirective) => {
      const context =
        listenDirective.context;
      const hasCertificate =
        hasVisibleDirective(
          directives,
          "ssl_certificate",
          context
        );
      const hasInclude =
        hasVisibleDirective(
          directives,
          "include",
          context
        ) ||
        includeCount > 0;

      if (
        !hasCertificate
      ) {
        issues.push(
          issue(
            listenDirective.line,
            hasInclude
              ? "Note"
              : "Suggestion",
            "ssl-certificate-visibility",
            hasInclude
              ? "listen uses ssl, but no ssl_certificate is visible in this exact supplied context. An include may provide it, so confirm with nginx -T / nginx -t."
              : "listen uses ssl, but no ssl_certificate is visible in the same supplied context. Confirm certificates are configured directly or through an omitted parent/include before deployment."
          )
        );
      }
    }
  );

  return {
    directives,
    issues:
      dedupeIssues(
        issues
      ),
    blockCount:
      scanned.blockCount,
    includeCount,
    detectedMode,
  };
}

function formatReport(
  report: NginxReport
) {
  const warnings =
    report.issues.filter(
      (entry) =>
        entry.level ===
        "Warning"
    ).length;
  const suggestions =
    report.issues.filter(
      (entry) =>
        entry.level ===
        "Suggestion"
    ).length;
  const notes =
    report.issues.filter(
      (entry) =>
        entry.level ===
        "Note"
    ).length;

  const lines = [
    "Nginx static inspection",
    `Mode: ${report.detectedMode === "full" ? "Full nginx.conf" : "Included / partial snippet"}`,
    `Directives parsed: ${report.directives.length}`,
    `Blocks parsed: ${report.blockCount}`,
    `Include directives: ${report.includeCount}`,
    `Warnings: ${warnings}`,
    `Suggestions: ${suggestions}`,
    `Notes: ${notes}`,
    "",
    "Findings:",
  ];

  if (!report.issues.length) {
    lines.push(
      "No issue from this static rule set was found."
    );
  } else {
    report.issues.forEach(
      (entry, index) => {
        lines.push(
          `${index + 1}. ${entry.level}${
            entry.line
              ? ` · line ${entry.line}`
              : ""
          } · ${entry.rule}`,
          `   ${entry.message}`
        );
      }
    );
  }

  lines.push(
    "",
    "Parsed directives:"
  );

  report.directives.forEach(
    (directive, index) => {
      lines.push(
        `${index + 1}. line ${directive.line} · ${directive.kind} · ${directive.name}${
          directive.args.length
            ? ` ${directive.args.join(
                " "
              )}`
            : ""
        }`,
        `   context: ${contextLabel(
          directive
        )}`
      );
    }
  );

  lines.push(
    "",
    "Authoritative next step: run nginx -t against the real deployed configuration; nginx -T shows the effective include-expanded configuration when includes need tracing."
  );

  return lines.join("\n");
}

export default function ToolClient() {
  const [input, setInput] =
    useState(SAMPLE_CONFIG);
  const [sourceMode, setSourceMode] =
    useState<SourceMode>("auto");
  const [report, setReport] =
    useState<NginxReport | null>(
      null
    );
  const [error, setError] =
    useState("");
  const [copied, setCopied] =
    useState(false);

  const clearResult = () => {
    setReport(null);
    setError("");
    setCopied(false);
  };

  const validate = () => {
    if (!input.trim()) {
      setError(
        "Paste an Nginx configuration or included snippet to inspect."
      );
      setReport(null);
      return;
    }

    if (input.length > MAX_INPUT_CHARACTERS) {
      setError(
        `Configuration input is larger than ${MAX_INPUT_CHARACTERS.toLocaleString()} characters. Run nginx -t/-T locally for very large configurations.`
      );
      setReport(null);
      return;
    }

    try {
      setReport(
        buildNginxReport(
          input,
          sourceMode
        )
      );
      setError("");
      setCopied(false);
    } catch (caught) {
      setReport(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to inspect this Nginx configuration."
      );
      setCopied(false);
    }
  };

  const loadExample = () => {
    setInput(SAMPLE_CONFIG);
    setSourceMode("auto");
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setSourceMode("auto");
    clearResult();
  };

  const copyReport = async () => {
    if (!report) return;

    try {
      await navigator.clipboard.writeText(
        formatReport(report)
      );
      setCopied(true);
      window.setTimeout(
        () => setCopied(false),
        1400
      );
    } catch {
      setCopied(false);
      setError(
        "The Nginx report could not be copied. Select and copy it manually."
      );
    }
  };

  const issues =
    report
      ? report.issues
      : [];

  return (
    <ToolShell
      title="Nginx Config Validator"
      description="Statically review Nginx configuration structure, proxy settings, TLS, headers, includes, and deployment warnings."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div>
          <label htmlFor="nginx-config-input" className="block text-sm font-semibold text-gray-900">
            Nginx configuration
          </label>
          <textarea
            id="nginx-config-input"
            value={input}
            onChange={(event: {
              target: { value: string };
            }) => {
              setInput(
                event.target.value
              );
              clearResult();
            }}
            rows={19}
            placeholder={SAMPLE_CONFIG}
            spellCheck={false}
            className="mt-2 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
        </div>

        <div>
          <YoryantraSelect
            label="Supplied source"
            value={sourceMode}
            onChange={(value: string) => {
              setSourceMode(
                value as SourceMode
              );
              clearResult();
            }}
            options={[
              {
                label:
                  "Auto-detect",
                value: "auto",
              },
              {
                label:
                  "Full nginx.conf",
                value: "full",
              },
              {
                label:
                  "Included / partial snippet",
                value: "snippet",
              },
            ]}
          />

          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
            <strong>
              Why this matters:
            </strong>{" "}
            a <code>server {"{ ... }"}</code> block can be a valid file included
            from <code>http {"{ ... }"}</code>, while the same server block at
            the top level of the real nginx.conf is not the same context.
          </div>

          <div className="mt-5 self-start rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-900">
            The browser inspection never opens include files, certificate paths, log paths,
            upstream sockets, DNS names, or dynamic modules. A clean browser
            report is not a deployment approval.
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={validate}
          className="yoryantra-btn shrink-0 whitespace-nowrap"
        >
          Inspect Nginx Config
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="yoryantra-btn-outline shrink-0 whitespace-nowrap"
        >
          Load Example
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="yoryantra-btn-outline shrink-0 whitespace-nowrap"
        >
          Reset
        </button>
      </div>

      {error ? (
        <div role="alert" className="mt-6 whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      {report ? (
        <div className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Stat
              label="Directives"
              value={String(
                report.directives
                  .length
              )}
            />
            <Stat
              label="Blocks"
              value={String(
                report.blockCount
              )}
            />
            <Stat
              label="Warnings"
              value={String(
                issues.filter(
                  (entry) =>
                    entry.level ===
                    "Warning"
                ).length
              )}
            />
            <Stat
              label="Suggestions"
              value={String(
                issues.filter(
                  (entry) =>
                    entry.level ===
                    "Suggestion"
                ).length
              )}
            />
            <Stat
              label="Notes"
              value={String(
                issues.filter(
                  (entry) =>
                    entry.level ===
                    "Note"
                ).length
              )}
            />
          </div>

          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
            <strong>
              Inspection mode:
            </strong>{" "}
            {report.detectedMode ===
            "full"
              ? "Full nginx.conf"
              : "Included / partial snippet"}
            {" · "}
            <strong>
              Includes visible:
            </strong>{" "}
            {report.includeCount}
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Static inspection findings
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Lines refer to the pasted text, not an include-expanded
                  configuration.
                </p>
              </div>

              <button
                type="button"
                onClick={copyReport}
                className="yoryantra-btn-outline shrink-0 whitespace-nowrap"
              >
                {copied
                  ? "Copied"
                  : "Copy Report"}
              </button>
            </div>

            {issues.length ? (
              <div className="mt-5 space-y-4">
                {issues.map(
                  (entry, index) => (
                    <div
                      key={`${entry.rule}-${entry.line}-${index}`}
                      className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                          {entry.level}
                        </span>
                        <span className="text-xs text-gray-500">
                          {entry.rule}
                        </span>
                        {entry.line ? (
                          <span className="text-xs text-gray-500">
                            line{" "}
                            {entry.line}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-gray-700">
                        {entry.message}
                      </p>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="mt-5 text-sm leading-relaxed text-gray-700">
                No issue from this static browser rule set was found. Run
                Nginx&apos;s own configuration test before deployment.
              </p>
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="text-lg font-semibold text-gray-900">
              Parsed directive map
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              This view shows where each directive was parsed,
              especially in deeply nested server/location snippets.
            </p>
            <div className="mt-4 space-y-3">
              {report.directives
                .slice(0, 120)
                .map(
                  (
                    directive,
                    index
                  ) => (
                    <div
                      key={`${directive.line}-${directive.name}-${index}`}
                      className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                    >
                      <div className="font-mono text-xs leading-relaxed text-gray-800">
                        line{" "}
                        {directive.line} ·{" "}
                        {directive.kind} ·{" "}
                        {directive.name}
                        {directive.args
                          .length
                          ? ` ${directive.args.join(
                              " "
                            )}`
                          : ""}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {contextLabel(
                          directive
                        )}
                      </div>
                    </div>
                  )
                )}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <CommandCard
              command="nginx -t"
              text="Tests the real configuration syntax and attempts to open files referred to by the configuration."
            />
            <CommandCard
              command="nginx -T"
              text="Performs the configuration test and also dumps the effective configuration, which helps when tracing include files."
            />
          </div>
        </div>
      ) : (
        <pre className="yoryantra-output mt-8 min-h-[300px] overflow-auto whitespace-pre-wrap break-words text-sm">
          Structural findings, context notes, proxy/TLS/header diagnostics, and
          parsed directive locations will appear here.
        </pre>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Static inspection runs on the pasted configuration in your browser. The
        config is not uploaded to a validation service. Inputs above 2,000,000
        characters are stopped before scanning; very large or include-heavy
        configurations belong in nginx -t/-T on the target environment.
        Site-wide analytics or advertising scripts, if enabled, are separate
        from this operation.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            A Browser Can Parse the Shape of Nginx Config; Only Nginx Knows the Configuration You Actually Built
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Nginx configuration is composed of simple directives ending in a
            semicolon and block directives containing nested directives between
            braces. That structure is visible in pasted text, so a browser tool
            can catch missing semicolons, unclosed quotes, unmatched braces, and
            several high-confidence directive mistakes.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            But Nginx modules define their own directives, accepted arguments,
            allowed contexts, and runtime behavior. Dynamic modules can add
            vocabulary this page has never heard of. An <code>include</code>
            can change the effective configuration completely. That is why
            unknown directives are not naively labelled invalid here.
          </p>
        </div>

        <div className="mt-12 self-start rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            nginx -t Does More Than Count Braces
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            Nginx documents <code>-t</code> as testing configuration syntax and
            trying to open files referenced by the configuration. A browser
            cannot perform the second half. It cannot confirm a certificate
            file exists, an included file parses, a log directory is writable,
            a dynamic module is installed, or a referenced path is correct on
            the target machine.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            Use this page before or during editing. Use <code>nginx -t</code>
            against the real deployment before reload. When includes make the
            source hard to reason about, <code>nginx -T</code> additionally
            dumps the configuration Nginx sees.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            “This server Block Is Invalid” Depends on Whether You Pasted nginx.conf or an Included File
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A virtual-host file might contain only{" "}
            <code>server {"{ ... }"}</code> because the main nginx.conf includes
            it from inside <code>http {"{ ... }"}</code>. The snippet is valid
            in that parent context even though the same text would not be a
            complete top-level configuration.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The source-mode selector exists to avoid a common static-linter
            mistake: judging every snippet as though it starts at Nginx&apos;s main
            context.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            A Trailing Slash on proxy_pass Can Change the Upstream URI
          </h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-white p-4 text-sm leading-7 text-gray-800">{`location /api/ {
    proxy_pass http://backend/;
}

location /api/ {
    proxy_pass http://backend;
}`}</pre>
          <p className="mt-4 leading-relaxed text-gray-600">
            Those two configurations are not merely stylistic variations. When{" "}
            <code>proxy_pass</code> is specified with a URI, Nginx replaces the
            portion of the normalized request URI that matched the location
            with the URI from <code>proxy_pass</code>. Without that URI, the
            request URI is passed according to a different rule.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This is why the linter reports a proxy URI as an interpretation note
            instead of “fixing” slashes automatically. The correct form depends
            on the upstream path contract.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Regex and Named Locations Make proxy_pass URI Rewriting More Restricted
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Nginx documents cases where the request-URI portion to replace
            cannot be determined, including regular-expression locations and
            named locations. In those cases, <code>proxy_pass</code> should be
            specified without a URI component.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The static checker can recognize the visible location form and flag
            this specific combination. It still cannot know what an included
            rewrite rule or variable will do to the final request.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Includes Turn Local Absence Into Weak Evidence
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Suppose a pasted TLS server has <code>listen 443 ssl;</code> but no
            visible <code>ssl_certificate</code>. If that same server also
            includes a shared TLS file, the certificate may be configured
            perfectly outside the pasted text. A static tool should not call
            that a definite missing-certificate error.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Findings become deliberately more cautious when includes are
            present. The right debugging step is to inspect the expanded
            configuration with Nginx itself.
          </p>
        </div>

        <div className="mt-12 self-start rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            add_header Has Both Status-Code and Inheritance Behavior
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            Security headers added without the <code>always</code> parameter are
            not necessarily emitted on every response status. Separately,
            declaring <code>add_header</code> in a child context can change what
            is inherited from a parent. Newer Nginx releases also provide{" "}
            <code>add_header_inherit</code> controls.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            A header line can therefore look correct in isolation while error
            pages or nested locations receive a different effective header set.
            Test representative response paths after configuration validation.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Variables Move Some Configuration Questions From Parse Time to Request Time
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A static <code>proxy_pass http://backend;</code> can refer to a named
            upstream resolved from the configuration. A destination containing
            variables can require runtime DNS resolution depending on the final
            value, which introduces <code>resolver</code> behavior and different
            URI rules.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The linter reports variable-based proxying as something to inspect;
            it cannot expand Nginx variables in a browser without a request,
            runtime state, and the complete configuration.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Security Checks Need Context, Not a Collection of “Best Practice” Superstitions
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            <code>autoindex on</code> deserves attention because it can expose
            directory contents; it is still correct for a deliberate file
            browser. Running older TLS protocols deserves attention because
            compatibility may be trading against transport security; a legacy
            internal client might still explain the choice.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The page therefore avoids assigning a fake security score. Findings
            tell you what behavior to verify, not whether an arbitrary checklist
            has declared the server “secure.”
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-relaxed text-gray-700">
          The official{" "}
          <a
            href="https://nginx.org/en/docs/beginners_guide.html"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--green)] underline underline-offset-4"
          >
            Nginx configuration guide
          </a>{" "}
          documents simple/block directives and contexts. The{" "}
          <a
            href="https://nginx.org/en/docs/switches.html"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--green)] underline underline-offset-4"
          >
            command-line documentation
          </a>{" "}
          defines <code>-t</code> and <code>-T</code>, while module documentation
          such as{" "}
          <a
            href="https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--green)] underline underline-offset-4"
          >
            proxy_pass
          </a>{" "}
          remains the authority for directive-specific behavior.
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/nginx-config-validator" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-2 text-xl font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}

function CommandCard({
  command,
  text,
}: {
  command: string;
  text: string;
}) {
  return (
    <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-5">
      <code className="font-semibold text-gray-900">
        {command}
      </code>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">
        {text}
      </p>
    </div>
  );
}
