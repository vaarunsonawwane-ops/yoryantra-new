"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type LintLevel =
  | "Warning"
  | "Suggestion"
  | "Info";

type LintIssue = {
  line: number;
  level: LintLevel;
  rule: string;
  message: string;
};

type Instruction = {
  keyword: string;
  value: string;
  raw: string;
  startLine: number;
  endLine: number;
};

type ParserInfo = {
  escapeCharacter: "\\" | "`";
  directives: Record<string, string>;
  issues: LintIssue[];
};

type Stage = {
  index: number;
  from: Instruction;
  alias: string;
  instructions: Instruction[];
};

type LintResult = {
  issues: LintIssue[];
  instructionCount: number;
  stageCount: number;
  parserInfo: ParserInfo;
};

const SAMPLE_DOCKERFILE = `# syntax=docker/dockerfile:1

FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
USER node
CMD ["node", "dist/server.js"]`;

const KNOWN_INSTRUCTIONS = [
  "ADD",
  "ARG",
  "CMD",
  "COPY",
  "ENTRYPOINT",
  "ENV",
  "EXPOSE",
  "FROM",
  "HEALTHCHECK",
  "LABEL",
  "MAINTAINER",
  "ONBUILD",
  "RUN",
  "SHELL",
  "STOPSIGNAL",
  "USER",
  "VOLUME",
  "WORKDIR",
];

function issue(
  line: number,
  level: LintLevel,
  rule: string,
  message: string
): LintIssue {
  return {
    line,
    level,
    rule,
    message,
  };
}

function parseParserInfo(
  source: string
): ParserInfo {
  const lines = source
    .replace(/\r\n?/g, "\n")
    .split("\n");
  const directives =
    Object.create(null) as Record<
      string,
      string
    >;
  const issues: LintIssue[] = [];
  let escapeCharacter:
    | "\\"
    | "`" = "\\";
  let directiveWindowOpen = true;

  lines.forEach((line, index) => {
    const trimmed =
      line.trim();
    const lineNumber =
      index + 1;
    const directiveMatch =
      trimmed.match(
        /^#\s*([A-Za-z]+)\s*=\s*(.*?)\s*$/
      );

    if (
      directiveWindowOpen &&
      directiveMatch
    ) {
      const key =
        directiveMatch[1].toLowerCase();
      const value =
        directiveMatch[2];

      if (
        key === "syntax" ||
        key === "escape" ||
        key === "check"
      ) {
        if (
          Object.prototype.hasOwnProperty.call(
            directives,
            key
          )
        ) {
          issues.push(
            issue(
              lineNumber,
              "Warning",
              "duplicate-parser-directive",
              `Parser directive "${key}" appears more than once. Docker parser directives may only be used once.`
            )
          );
        } else {
          directives[key] =
            value;
        }

        if (key === "escape") {
          if (
            value === "\\" ||
            value === "`"
          ) {
            escapeCharacter =
              value;
          } else {
            issues.push(
              issue(
                lineNumber,
                "Warning",
                "escape-directive",
                `# escape=${value} is not one of Docker's supported escape characters (\\ or \`).`
              )
            );
          }
        }

        return;
      }
    }

    if (!trimmed) {
      if (
        directiveWindowOpen
      ) {
        directiveWindowOpen =
          false;
      }
      return;
    }

    if (
      directiveWindowOpen &&
      trimmed.charAt(0) === "#"
    ) {
      directiveWindowOpen =
        false;
      return;
    }

    if (
      trimmed &&
      trimmed.charAt(0) !== "#"
    ) {
      directiveWindowOpen =
        false;
    }

    if (
      !directiveWindowOpen &&
      directiveMatch
    ) {
      const key =
        directiveMatch[1].toLowerCase();

      if (
        key === "syntax" ||
        key === "escape" ||
        key === "check"
      ) {
        issues.push(
          issue(
            lineNumber,
            "Info",
            "late-parser-directive",
            `# ${key}=... appears after Docker's parser-directive window has closed, so Docker treats it as an ordinary comment rather than an active parser directive.`
          )
        );
      }
    }
  });

  return {
    escapeCharacter,
    directives,
    issues,
  };
}

function lineHasContinuation(
  line: string,
  escapeCharacter: "\\" | "`"
) {
  const trimmedRight =
    line.replace(/[ \t]+$/, "");

  return (
    trimmedRight.charAt(
      trimmedRight.length - 1
    ) === escapeCharacter
  );
}

function removeContinuation(
  line: string,
  escapeCharacter: "\\" | "`"
) {
  const trimmedRight =
    line.replace(/[ \t]+$/, "");

  return trimmedRight.slice(
    0,
    -1
  );
}

function heredocDelimiter(
  value: string
) {
  const match =
    value.match(
      /<<-?\s*(?:"([^"]+)"|'([^']+)'|([A-Za-z_][A-Za-z0-9_.-]*))/
    );

  if (!match) return "";

  return (
    match[1] ||
    match[2] ||
    match[3] ||
    ""
  );
}

function parseInstructions(
  source: string,
  escapeCharacter: "\\" | "`"
) {
  const lines = source
    .replace(/\r\n?/g, "\n")
    .split("\n");
  const instructions: Instruction[] =
    [];
  let buffer = "";
  let startLine = 0;
  let heredocEnd = "";

  const flush = (
    endLine: number
  ) => {
    const raw =
      buffer.trim();
    buffer = "";

    if (!raw) return;

    const match =
      raw.match(
        /^([A-Za-z]+)\s+([\s\S]*)$/
      );

    if (!match) {
      return;
    }

    instructions.push({
      keyword:
        match[1].toUpperCase(),
      value:
        match[2].trim(),
      raw,
      startLine,
      endLine,
    });
  };

  for (
    let index = 0;
    index < lines.length;
    index += 1
  ) {
    const line =
      lines[index];
    const lineNumber =
      index + 1;
    const trimmed =
      line.trim();

    if (heredocEnd) {
      buffer += `\n${line}`;

      if (
        trimmed === heredocEnd
      ) {
        flush(lineNumber);
        heredocEnd = "";
      }

      continue;
    }

    if (
      !buffer &&
      (!trimmed ||
        trimmed.charAt(0) === "#")
    ) {
      continue;
    }

    if (!buffer) {
      startLine =
        lineNumber;
    }

    const continued =
      lineHasContinuation(
        line,
        escapeCharacter
      );
    const piece = continued
      ? removeContinuation(
          line,
          escapeCharacter
        )
      : line;

    buffer += `${buffer ? " " : ""}${piece.trim()}`;

    if (!continued) {
      const possibleDelimiter =
        heredocDelimiter(buffer);

      if (
        possibleDelimiter &&
        /^RUN\b/i.test(buffer)
      ) {
        heredocEnd =
          possibleDelimiter;
      } else {
        flush(lineNumber);
      }
    }
  }

  if (buffer) {
    flush(lines.length);
  }

  return instructions;
}

function getFromParts(
  value: string
) {
  const tokens =
    value
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  let index = 0;

  while (
    index < tokens.length &&
    tokens[index].indexOf("--") === 0
  ) {
    index += 1;
  }

  const image =
    tokens[index] || "";
  let alias = "";

  if (
    tokens[index + 1] &&
    tokens[index + 1].toUpperCase() ===
      "AS" &&
    tokens[index + 2]
  ) {
    alias =
      tokens[index + 2];
  }

  return {
    image,
    alias,
    tokens,
  };
}

function buildStages(
  instructions: Instruction[]
) {
  const stages: Stage[] = [];
  let current: Stage | null =
    null;

  instructions.forEach(
    (instruction) => {
      if (
        instruction.keyword ===
        "FROM"
      ) {
        const parts =
          getFromParts(
            instruction.value
          );
        current = {
          index: stages.length,
          from: instruction,
          alias: parts.alias,
          instructions: [
            instruction,
          ],
        };
        stages.push(current);
        return;
      }

      if (current) {
        current.instructions.push(
          instruction
        );
      }
    }
  );

  return stages;
}

function finalStage(
  stages: Stage[]
) {
  return stages.length
    ? stages[
        stages.length - 1
      ]
    : null;
}

function instructionCount(
  stage: Stage,
  keyword: string
) {
  return stage.instructions.filter(
    (instruction) =>
      instruction.keyword ===
      keyword
  ).length;
}

function getLastInstruction(
  stage: Stage,
  keyword: string
) {
  const matches =
    stage.instructions.filter(
      (instruction) =>
        instruction.keyword ===
        keyword
    );

  return matches.length
    ? matches[
        matches.length - 1
      ]
    : null;
}

function imageUsesImplicitLatest(
  image: string
) {
  if (
    !image ||
    image.indexOf("$") !== -1 ||
    image.indexOf("@") !== -1 ||
    image.toLowerCase() ===
      "scratch"
  ) {
    return false;
  }

  const tail =
    image.split("/").pop() ||
    image;

  return (
    tail.indexOf(":") === -1
  );
}

function imageUsesLatest(
  image: string
) {
  if (
    image.indexOf("$") !== -1
  ) {
    return false;
  }

  const tail =
    image.split("/").pop() ||
    image;

  return /:latest$/i.test(
    tail
  );
}

function fromHasConstantPlatform(
  value: string
) {
  const match =
    value.match(
      /(?:^|\s)--platform=([^\s]+)/
    );

  if (!match) return "";

  const platform =
    match[1];

  return platform.indexOf("$") ===
    -1
    ? platform
    : "";
}

function isAbsoluteWorkdir(
  value: string
) {
  const trimmed =
    value.trim();

  if (
    trimmed.indexOf("$") !== -1
  ) {
    return true;
  }

  return (
    trimmed.charAt(0) === "/" ||
    /^[A-Za-z]:[\\/]/.test(
      trimmed
    )
  );
}

function looksLikeSimpleLocalAdd(
  value: string
) {
  const lower =
    value.toLowerCase();

  if (
    lower.indexOf("http://") !==
      -1 ||
    lower.indexOf("https://") !==
      -1 ||
    lower.indexOf("git@") !==
      -1 ||
    lower.indexOf("git://") !==
      -1
  ) {
    return false;
  }

  if (
    /\.tar(?:\.(?:gz|bz2|xz|zst))?(?:\s|$)/i.test(
      value
    )
  ) {
    return false;
  }

  return true;
}

function copiesWholeContext(
  value: string
) {
  const compact =
    value
      .replace(/\s+/g, " ")
      .trim();

  if (
    compact.charAt(0) === "["
  ) {
    try {
      const parsed =
        JSON.parse(
          compact
        ) as unknown;

      if (
        !Array.isArray(parsed) ||
        parsed.length < 2
      ) {
        return false;
      }

      return parsed
        .slice(0, -1)
        .some(
          (item) =>
            item === "."
        );
    } catch {
      return false;
    }
  }

  const tokens =
    compact
      .split(/\s+/)
      .filter(Boolean);
  const withoutOptions =
    tokens.filter(
      (token) =>
        token.indexOf("--") !==
        0
    );

  return withoutOptions
    .slice(0, -1)
    .indexOf(".") !== -1;
}

function assignmentNames(
  value: string
) {
  const names: string[] = [];
  const matches =
    value.match(
      /[A-Za-z_][A-Za-z0-9_]*(?=\s*=)/g
    );

  if (matches) {
    matches.forEach((name) => {
      if (
        names.indexOf(name) ===
        -1
      ) {
        names.push(name);
      }
    });
  }

  if (!names.length) {
    const first =
      value
        .trim()
        .split(/\s+/)[0];

    if (
      /^[A-Za-z_][A-Za-z0-9_]*$/.test(
        first
      )
    ) {
      names.push(first);
    }
  }

  return names;
}

function legacyEnvSyntax(
  value: string
) {
  return /^[A-Za-z_][A-Za-z0-9_]*\s+[^=]/.test(
    value.trim()
  );
}

function validateJsonCommandForm(
  instruction: Instruction,
  issues: LintIssue[]
) {
  const value =
    instruction.value.trim();

  if (
    value.charAt(0) !== "["
  ) {
    issues.push(
      issue(
        instruction.startLine,
        "Info",
        "shell-form-command",
        `${instruction.keyword} uses shell form. Exec/JSON form can make signal handling and argument boundaries more predictable for application processes, while shell form is still useful when shell processing is intentional.`
      )
    );
    return;
  }

  try {
    const parsed =
      JSON.parse(
        value
      ) as unknown;

    if (
      !Array.isArray(parsed) ||
      !parsed.length ||
      parsed.some(
        (item) =>
          typeof item !== "string"
      )
    ) {
      issues.push(
        issue(
          instruction.startLine,
          "Warning",
          "json-command-form",
          `${instruction.keyword} starts like exec/JSON form but is not a non-empty JSON array of strings. Docker's exec form uses JSON array syntax.`
        )
      );
    }
  } catch {
    issues.push(
      issue(
        instruction.startLine,
        "Warning",
        "json-command-form",
        `${instruction.keyword} starts with [ but is not valid JSON array syntax. Docker may interpret or reject it differently from the exec form you intended.`
      )
    );
  }
}

function lintExpose(
  instruction: Instruction,
  issues: LintIssue[]
) {
  const tokens =
    instruction.value
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  tokens.forEach((token) => {
    if (
      token.indexOf("$") !==
      -1
    ) {
      return;
    }

    const parts =
      token.split("/");
    const portText =
      parts[0];
    const protocol =
      parts.length > 1
        ? parts[1]
        : "";

    if (
      !/^\d+$/.test(
        portText
      ) ||
      Number(portText) < 1 ||
      Number(portText) >
        65535
    ) {
      issues.push(
        issue(
          instruction.startLine,
          "Warning",
          "expose-format",
          `EXPOSE value "${token}" does not contain a valid numeric port from 1 to 65535.`
        )
      );
      return;
    }

    if (
      protocol &&
      protocol !== "tcp" &&
      protocol !== "udp"
    ) {
      issues.push(
        issue(
          instruction.startLine,
          protocol.toLowerCase() ===
            "tcp" ||
            protocol.toLowerCase() ===
              "udp"
            ? "Suggestion"
            : "Warning",
          "expose-protocol",
          `EXPOSE protocol "${protocol}" should be tcp or udp in lowercase.`
        )
      );
    }
  });
}

function lintRunInstruction(
  instruction: Instruction,
  issues: LintIssue[]
) {
  const text =
    instruction.value;
  const lower =
    text.toLowerCase();

  if (/\bsudo\b/.test(lower)) {
    issues.push(
      issue(
        instruction.startLine,
        "Suggestion",
        "sudo",
        "RUN uses sudo. Build steps run as the current Dockerfile user, so sudo is usually unnecessary and may not exist in the base image."
      )
    );
  }

  if (
    /\b(curl|wget)\b[\s\S]*\|\s*(sh|bash)\b/i.test(
      text
    )
  ) {
    issues.push(
      issue(
        instruction.startLine,
        "Warning",
        "remote-script-pipe",
        "Downloaded content is piped directly into a shell. Pin and verify the artifact or otherwise establish integrity before executing remote code during the build."
      )
    );
  }

  if (
    /\bapt-get\s+install\b/i.test(
      text
    )
  ) {
    if (
      !/\bapt-get\s+update\b/i.test(
        text
      )
    ) {
      issues.push(
        issue(
          instruction.startLine,
          "Warning",
          "apt-update-install",
          "apt-get install appears without apt-get update in the same RUN instruction. Docker recommends combining update and install when they belong to the same package-install step so cached package indexes do not become stale."
        )
      );
    }

    if (
      !/--no-install-recommends\b/i.test(
        text
      )
    ) {
      issues.push(
        issue(
          instruction.startLine,
          "Suggestion",
          "apt-recommends",
          "Consider --no-install-recommends when recommended packages are not actually required by the image."
        )
      );
    }

    if (
      !/rm\s+-rf\s+\/var\/lib\/apt\/lists\/\*/i.test(
        text
      )
    ) {
      issues.push(
        issue(
          instruction.startLine,
          "Suggestion",
          "apt-lists",
          "Consider removing /var/lib/apt/lists/* in the same RUN instruction after apt installation so package-list data is not retained in that layer."
        )
      );
    }
  }

  if (
    /\bapt-get\s+update\b/i.test(
      text
    ) &&
    !/\bapt-get\s+install\b/i.test(
      text
    )
  ) {
    issues.push(
      issue(
        instruction.startLine,
        "Warning",
        "apt-update-alone",
        "apt-get update is in a separate RUN instruction. Docker documents cache problems with this pattern; combine update and install when the update exists only to support that install."
      )
    );
  }

  if (
    /\bapk\s+add\b/i.test(
      text
    ) &&
    !/\bapk\s+add\b[\s\S]*--no-cache\b/i.test(
      text
    )
  ) {
    issues.push(
      issue(
        instruction.startLine,
        "Suggestion",
        "apk-cache",
        "Consider apk add --no-cache when Alpine's package index does not need to remain in the resulting layer."
      )
    );
  }

  if (
    /\bapt(?:-get)?\s+upgrade\b/i.test(
      text
    )
  ) {
    issues.push(
      issue(
        instruction.startLine,
        "Info",
        "package-upgrade",
        "The build performs a broad package upgrade. Review whether rebuilding from an updated base image and deliberately pinning required packages gives a clearer, more reproducible maintenance path."
      )
    );
  }
}

function dedupeIssues(
  issues: LintIssue[]
) {
  const seen =
    new Set<string>();
  const result: LintIssue[] =
    [];

  issues.forEach((entry) => {
    const key = `${entry.line}|${entry.rule}|${entry.message}`;

    if (!seen.has(key)) {
      seen.add(key);
      result.push(entry);
    }
  });

  return result.sort(
    (a, b) => {
      if (a.line !== b.line) {
        return a.line - b.line;
      }

      const rank: Record<
        LintLevel,
        number
      > = {
        Warning: 0,
        Suggestion: 1,
        Info: 2,
      };

      return (
        rank[a.level] -
        rank[b.level]
      );
    }
  );
}

function checkDockerfile(
  source: string
): LintResult {
  const parserInfo =
    parseParserInfo(source);
  const instructions =
    parseInstructions(
      source,
      parserInfo.escapeCharacter
    );
  const issues: LintIssue[] =
    parserInfo.issues.slice();

  if (!instructions.length) {
    issues.push(
      issue(
        0,
        "Warning",
        "empty-file",
        "No Dockerfile instructions were found."
      )
    );

    return {
      issues:
        dedupeIssues(issues),
      instructionCount: 0,
      stageCount: 0,
      parserInfo,
    };
  }

  instructions.forEach(
    (instruction) => {
      if (
        KNOWN_INSTRUCTIONS.indexOf(
          instruction.keyword
        ) === -1
      ) {
        issues.push(
          issue(
            instruction.startLine,
            "Warning",
            "unknown-instruction",
            `"${instruction.keyword}" is not one of the standard Dockerfile instructions recognized by this linter. A custom Dockerfile frontend can change the grammar, so verify it against the declared # syntax frontend before deleting it.`
          )
        );
      }
    }
  );

  const firstFromIndex =
    instructions.findIndex(
      (instruction) =>
        instruction.keyword ===
        "FROM"
    );

  if (firstFromIndex === -1) {
    issues.push(
      issue(
        0,
        "Warning",
        "missing-from",
        "No FROM instruction was found. Standard Dockerfile build stages begin with FROM; only global ARG instructions and parser directives/comments may precede the first stage."
      )
    );
  } else {
    instructions
      .slice(
        0,
        firstFromIndex
      )
      .forEach(
        (instruction) => {
          if (
            instruction.keyword !==
            "ARG"
          ) {
            issues.push(
              issue(
                instruction.startLine,
                "Warning",
                "instruction-before-from",
                `${instruction.keyword} appears before the first FROM. In the standard Dockerfile grammar, only ARG instructions may precede the first FROM after parser directives/comments.`
              )
            );
          }
        }
      );
  }

  const stages =
    buildStages(instructions);
  const aliases =
    Object.create(null) as Record<
      string,
      number
    >;

  stages.forEach((stage) => {
    const fromParts =
      getFromParts(
        stage.from.value
      );
    const image =
      fromParts.image;

    if (!image) {
      issues.push(
        issue(
          stage.from.startLine,
          "Warning",
          "from-image",
          "FROM does not contain a base image or stage reference."
        )
      );
    } else {
      if (
        imageUsesLatest(image) ||
        imageUsesImplicitLatest(
          image
        )
      ) {
        issues.push(
          issue(
            stage.from.startLine,
            "Suggestion",
            "base-image-tag",
            "The base image uses latest or an implicit latest tag. A deliberate version tag improves intent; a digest provides stronger immutability when reproducibility matters."
          )
        );
      }
    }

    const platform =
      fromHasConstantPlatform(
        stage.from.value
      );

    if (platform) {
      issues.push(
        issue(
          stage.from.startLine,
          "Info",
          "constant-platform",
          `FROM pins --platform=${platform}. A constant platform can prevent a Dockerfile from building naturally for other target architectures; keep it only when the stage truly requires that platform.`
        )
      );
    }

    if (stage.alias) {
      const key =
        stage.alias.toLowerCase();

      if (
        Object.prototype.hasOwnProperty.call(
          aliases,
          key
        )
      ) {
        issues.push(
          issue(
            stage.from.startLine,
            "Warning",
            "duplicate-stage-name",
            `Stage name "${stage.alias}" duplicates an earlier stage alias declared on line ${aliases[key]}.`
          )
        );
      } else {
        aliases[key] =
          stage.from.startLine;
      }
    }

    [
      "CMD",
      "ENTRYPOINT",
      "HEALTHCHECK",
    ].forEach((keyword) => {
      const count =
        instructionCount(
          stage,
          keyword
        );

      if (count > 1) {
        const last =
          getLastInstruction(
            stage,
            keyword
          );

        issues.push(
          issue(
            last
              ? last.startLine
              : stage.from.startLine,
            "Warning",
            "multiple-instruction",
            `Stage ${stage.index + 1} contains ${count} ${keyword} instructions. Only the last ${keyword} of a build stage is effective at runtime.`
          )
        );
      }
    });
  });

  const lastStage =
    finalStage(stages);

  if (lastStage) {
    const workdir =
      getLastInstruction(
        lastStage,
        "WORKDIR"
      );
    const user =
      getLastInstruction(
        lastStage,
        "USER"
      );
    const command =
      getLastInstruction(
        lastStage,
        "CMD"
      );
    const entrypoint =
      getLastInstruction(
        lastStage,
        "ENTRYPOINT"
      );

    if (!workdir) {
      issues.push(
        issue(
          lastStage.from.startLine,
          "Suggestion",
          "workdir",
          "No WORKDIR was found in the final stage. An explicit working directory often makes relative COPY, RUN, CMD, and ENTRYPOINT paths easier to reason about."
        )
      );
    } else if (
      !isAbsoluteWorkdir(
        workdir.value
      )
    ) {
      issues.push(
        issue(
          workdir.startLine,
          "Suggestion",
          "relative-workdir",
          `Final-stage WORKDIR "${workdir.value}" is relative. A relative workdir can depend on the base image's current directory; an absolute path is more predictable.`
        )
      );
    }

    if (!user) {
      issues.push(
        issue(
          lastStage.from.startLine,
          "Suggestion",
          "non-root-user",
          "No USER instruction was found in the final stage. Where the application permits it, running the application as a non-root user reduces container privileges."
        )
      );
    } else if (
      /^(?:0|root)(?::(?:0|root))?$/i.test(
        user.value.trim()
      )
    ) {
      issues.push(
        issue(
          user.startLine,
          "Warning",
          "root-user",
          "The final USER explicitly selects root/UID 0. Confirm that the application genuinely requires root privileges at runtime."
        )
      );
    }

    if (
      !command &&
      !entrypoint
    ) {
      issues.push(
        issue(
          lastStage.from.startLine,
          "Info",
          "default-command",
          "The final stage has no CMD or ENTRYPOINT. That can be intentional for a reusable base image, but application images usually define a default process."
        )
      );
    }
  }

  instructions.forEach(
    (instruction) => {
      const keyword =
        instruction.keyword;
      const value =
        instruction.value;
      const raw =
        instruction.raw;
      const line =
        instruction.startLine;

      if (
        keyword ===
        "MAINTAINER"
      ) {
        issues.push(
          issue(
            line,
            "Suggestion",
            "maintainer",
            "MAINTAINER is deprecated. Use LABEL metadata such as org.opencontainers.image.authors instead."
          )
        );
      }

      if (
        keyword === "ADD"
      ) {
        if (
          looksLikeSimpleLocalAdd(
            value
          )
        ) {
          issues.push(
            issue(
              line,
              "Suggestion",
              "add-vs-copy",
              "This ADD appears to copy local content without using ADD-specific remote or archive behavior. COPY communicates a plain copy more clearly."
            )
          );
        } else if (
          /https?:\/\//i.test(
            value
          ) &&
          value.indexOf(
            "--checksum="
          ) === -1
        ) {
          issues.push(
            issue(
              line,
              "Info",
              "remote-add",
              "ADD downloads a remote HTTP(S) source without an inline --checksum option. Review how the remote artifact is pinned and verified before relying on it in a reproducible build."
            )
          );
        }
      }

      if (
        keyword === "COPY" &&
        copiesWholeContext(value)
      ) {
        issues.push(
          issue(
            line,
            "Suggestion",
            "copy-context",
            "COPY . can send more files into the image than intended and can invalidate cache broadly. Review .dockerignore and consider copying dependency manifests before application source when that improves cache reuse."
          )
        );
      }

      if (
        keyword === "RUN"
      ) {
        lintRunInstruction(
          instruction,
          issues
        );
      }

      if (
        keyword === "ENV" ||
        keyword === "ARG"
      ) {
        const names =
          assignmentNames(value);

        names.forEach(
          (name) => {
            if (
              /(password|passwd|secret|token|api[_-]?key|private[_-]?key|credential)/i.test(
                name
              )
            ) {
              issues.push(
                issue(
                  line,
                  "Warning",
                  "possible-secret",
                  `${keyword} variable "${name}" looks secret-related. ARG and ENV are not secure secret stores; use BuildKit secret mounts or another build-time secret mechanism when the value is sensitive.`
                )
              );
            }
          }
        );

        if (
          keyword === "ENV" &&
          legacyEnvSyntax(value)
        ) {
          issues.push(
            issue(
              line,
              "Suggestion",
              "env-syntax",
              "ENV appears to use the legacy space-separated key/value form. Prefer ENV key=value for clearer parsing and modern Dockerfile style."
            )
          );
        }
      }

      if (
        (keyword === "COPY" ||
          keyword === "ADD") &&
        /(^|[\s"'\/])(\.env|id_rsa|id_ed25519|credentials(?:\.json)?|[^/\s"']*\.pem)(?=$|[\s"'\/])/i.test(
          raw
        )
      ) {
        issues.push(
          issue(
            line,
            "Warning",
            "sensitive-copy",
            "This instruction appears to copy a potentially sensitive file. Confirm that private keys, credentials, and .env files are excluded from the build context/image unless deliberately required."
          )
        );
      }

      if (
        keyword === "CMD" ||
        keyword === "ENTRYPOINT"
      ) {
        validateJsonCommandForm(
          instruction,
          issues
        );
      }

      if (
        keyword === "WORKDIR" &&
        !isAbsoluteWorkdir(
          value
        )
      ) {
        issues.push(
          issue(
            line,
            "Suggestion",
            "relative-workdir",
            `WORKDIR "${value}" is relative. Its final location can depend on the current working directory inherited from the base image or previous WORKDIR instructions.`
          )
        );
      }

      if (
        keyword === "EXPOSE"
      ) {
        lintExpose(
          instruction,
          issues
        );
      }
    }
  );

  if (
    !parserInfo.directives.syntax
  ) {
    issues.push(
      issue(
        0,
        "Info",
        "syntax-directive",
        "No active # syntax= parser directive was detected. Docker can use its bundled frontend, but declaring docker/dockerfile:1 makes the intended Dockerfile frontend explicit and gives access to current stable syntax features."
      )
    );
  }

  return {
    issues:
      dedupeIssues(issues),
    instructionCount:
      instructions.length,
    stageCount:
      stages.length,
    parserInfo,
  };
}

function formatLintReport(
  result: LintResult
) {
  const issues =
    result.issues;
  const lines = [
    `Instructions reviewed: ${result.instructionCount}`,
    `Build stages: ${result.stageCount}`,
    `Escape character: ${
      result.parserInfo
        .escapeCharacter === "\\"
        ? "backslash (\\\\)"
        : "backtick (`)"
    }`,
    `Warnings: ${
      issues.filter(
        (entry) =>
          entry.level ===
          "Warning"
      ).length
    }`,
    `Suggestions: ${
      issues.filter(
        (entry) =>
          entry.level ===
          "Suggestion"
      ).length
    }`,
    `Informational: ${
      issues.filter(
        (entry) =>
          entry.level ===
          "Info"
      ).length
    }`,
    "",
  ];

  if (!issues.length) {
    lines.push(
      "No issues from this browser rule set were found.",
      "A real Docker/BuildKit parse, build, build-context review, and image scan are still required for production confidence."
    );

    return lines.join("\n");
  }

  issues.forEach(
    (entry, index) => {
      lines.push(
        `${index + 1}. ${entry.level}${
          entry.line
            ? ` · line ${entry.line}`
            : ""
        } · ${entry.rule}`,
        `   ${entry.message}`,
        ""
      );
    }
  );

  return lines
    .join("\n")
    .replace(/\s+$/, "");
}

export default function ToolClient() {
  const [input, setInput] =
    useState("");
  const [result, setResult] =
    useState<LintResult | null>(
      null
    );
  const [error, setError] =
    useState("");
  const [copied, setCopied] =
    useState(false);

  const lint = () => {
    if (!input.trim()) {
      setError(
        "Paste Dockerfile content to review."
      );
      setResult(null);
      return;
    }

    try {
      setResult(
        checkDockerfile(input)
      );
      setError("");
      setCopied(false);
    } catch (caught) {
      setResult(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to review this Dockerfile."
      );
      setCopied(false);
    }
  };

  const loadExample = () => {
    setInput(
      SAMPLE_DOCKERFILE
    );
    setResult(null);
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setResult(null);
    setError("");
    setCopied(false);
  };

  const copyReport = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(
        formatLintReport(result)
      );
      setCopied(true);
      window.setTimeout(
        () => setCopied(false),
        1400
      );
    } catch {
      setCopied(false);
      setError(
        "The lint report could not be copied. Select and copy it manually."
      );
    }
  };

  const issues =
    result
      ? result.issues
      : [];

  return (
    <ToolShell
      title="Dockerfile Linter"
      description="Review Dockerfile source for suspicious build patterns, stage-level overrides, parser-directive behavior, package/cache problems, secret handling, and runtime defaults—without pretending a browser text scan replaces Docker or BuildKit."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block text-sm font-semibold text-gray-900">
          Dockerfile
        </label>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">
          The linter understands common instructions, multi-stage boundaries,
          backslash or backtick continuation from an active{" "}
          <code># escape=</code> directive, and simple RUN heredocs.
        </p>
        <textarea
          value={input}
          onChange={(event: {
            target: { value: string };
          }) => {
            setInput(
              event.target.value
            );
            setResult(null);
            setError("");
            setCopied(false);
          }}
          placeholder={SAMPLE_DOCKERFILE}
          spellCheck={false}
          className="mt-4 w-full min-h-[380px] rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={lint}
          className="yoryantra-btn"
        >
          Lint Dockerfile
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="yoryantra-btn-outline"
        >
          Load Example
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <CountCard
              label="Instructions"
              value={
                result.instructionCount
              }
            />
            <CountCard
              label="Stages"
              value={
                result.stageCount
              }
            />
            <CountCard
              label="Warnings"
              value={
                issues.filter(
                  (entry) =>
                    entry.level ===
                    "Warning"
                ).length
              }
            />
            <CountCard
              label="Suggestions"
              value={
                issues.filter(
                  (entry) =>
                    entry.level ===
                    "Suggestion"
                ).length
              }
            />
            <CountCard
              label="Info"
              value={
                issues.filter(
                  (entry) =>
                    entry.level ===
                    "Info"
                ).length
              }
            />
          </div>

          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
            <strong>
              Parser context:
            </strong>{" "}
            escape character{" "}
            <code>
              {result.parserInfo
                .escapeCharacter ===
              "\\"
                ? "\\"
                : "`"}
            </code>
            {result.parserInfo
              .directives.syntax
              ? ` · syntax=${result.parserInfo.directives.syntax}`
              : " · no active syntax directive detected"}
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Dockerfile Review
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Findings are heuristic review prompts unless Docker&apos;s own
                  parser/build checks say otherwise.
                </p>
              </div>
              <button
                type="button"
                onClick={copyReport}
                className="yoryantra-btn-outline whitespace-nowrap"
              >
                {copied
                  ? "Copied"
                  : "Copy Report"}
              </button>
            </div>

            {issues.length ? (
              <div className="mt-6 space-y-4">
                {issues.map(
                  (entry, index) => (
                    <div
                      key={`${entry.rule}-${entry.line}-${index}`}
                      className="rounded-xl border border-gray-200 bg-gray-50 p-5"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                          {entry.level}
                        </span>
                        <span className="text-xs font-medium text-gray-500">
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
              <p className="mt-6 text-sm leading-relaxed text-gray-700">
                No issues from this browser rule set were found. That does not
                prove the Dockerfile builds, that the build context is correct,
                or that the resulting image is secure.
              </p>
            )}
          </div>
        </div>
      ) : (
        <pre className="yoryantra-output mt-8 min-h-[240px] overflow-auto whitespace-pre-wrap break-words text-sm">
          Dockerfile findings will appear here.
        </pre>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Linting runs on the pasted Dockerfile in your browser. No image is
        pulled, no build context is uploaded, and no Docker build is executed.
        Site-wide analytics or advertising scripts, if enabled, are separate
        from this source review.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              A Dockerfile Linter Should Tell You When It Is Guessing
            </h2>
            <p className="mt-4 leading-relaxed text-gray-600">
              Dockerfile behavior depends on the Dockerfile frontend, parser
              directives, base image, build context, BuildKit features, shell,
              target platform, build arguments, mounted secrets, and files that
              are not visible in the pasted text. A browser linter can catch
              suspicious patterns, but it cannot reproduce that entire build.
            </p>
            <p className="mt-4 leading-relaxed text-gray-600">
              That is why this tool separates warnings from suggestions and
              informational findings. A missing non-root USER may be worth
              review; it is not automatically a broken image. An invalid
              duplicate stage name or malformed command form is a different
              class of problem.
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
            <h3 className="font-semibold text-yellow-900">
              Run Docker&apos;s own checks too
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-yellow-900/90">
              Modern Dockerfile syntax includes built-in build checks, and
              Docker can evaluate them during a real build/check workflow.
              Those checks understand Docker&apos;s parser and current frontend
              better than a standalone regex linter can.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Parser Directives Can Change How the Same Physical Lines Are Read
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            <code># syntax=...</code> selects the Dockerfile frontend.{" "}
            <code># escape=...</code> can switch the line-continuation escape
            from backslash to backtick, which is particularly relevant to
            Windows paths. Docker only recognizes parser directives in the
            directive area at the top of the file.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The previous Yoryantra linter always treated a trailing backslash as
            continuation. This version first reads the active escape directive,
            so a Windows Dockerfile using backtick continuation is not flattened
            with the wrong rule.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Multi-Stage Builds Create Several Different Places for “The Last Instruction Wins”
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Every <code>FROM</code> begins a build stage. A Dockerfile can have
            one CMD in the build stage and another in the final runtime stage
            without conflict. But two CMD instructions inside the same stage
            do not create two default commands—the later one replaces the
            earlier one. The same review applies to ENTRYPOINT and HEALTHCHECK.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This linter groups instructions by stage before reporting those
            overrides, rather than counting the entire file as one flat list.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            ARG and ENV Are Convenient Configuration Channels, Not Secret Stores
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Variable names such as <code>API_KEY</code>, <code>PASSWORD</code>,
            or <code>PRIVATE_KEY</code> are flagged because build arguments and
            environment instructions can leak through image metadata, history,
            logs, cache behavior, or downstream layers depending on how they are
            used.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            BuildKit secret mounts exist so a build step can consume a secret
            without treating it as ordinary Dockerfile configuration. A text
            linter cannot determine whether an innocent variable name contains
            a secret, so name-based findings remain warnings rather than proof
            of exposure.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            COPY . Is Usually a Build-Context Question Before It Is a COPY Question
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            <code>COPY . .</code> can be perfectly reasonable, especially after
            dependency layers are established. Its safety and cache impact
            depend heavily on <code>.dockerignore</code>. A pasted Dockerfile
            does not reveal whether <code>.git</code>, local builds, test data,
            credentials, or gigabytes of unrelated files are excluded from the
            context.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The linter therefore says “review .dockerignore” instead of claiming
            every whole-context copy is wrong.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            apt-get update in Its Own Layer Is a Cache Bug Waiting to Happen
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            Docker&apos;s build cache can reuse a previous{" "}
            <code>RUN apt-get update</code> layer even when a later install list
            changes. Keeping update and install in the same RUN instruction ties
            the package index refresh to the installation step that needs it.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            Removing <code>/var/lib/apt/lists/*</code> in that same layer and
            avoiding unnecessary recommended packages can also reduce retained
            package metadata and image size.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Shell Form and Exec Form Trade Convenience for Process Predictability
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Docker supports shell and exec forms for RUN, CMD, and ENTRYPOINT.
            Exec form uses a JSON array and starts the executable directly
            without an implicit command shell. That usually gives application
            processes cleaner signal handling and argument boundaries.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Shell form is not forbidden—it is useful when shell expansion,
            pipelines, redirection, or compound shell logic is intentional. The
            linter reports shell-form CMD/ENTRYPOINT as informational rather
            than pretending every shell is a vulnerability.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            A Version Tag and a Digest Solve Different Reproducibility Problems
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            An implicit or explicit <code>latest</code> tag says very little
            about which base image will be pulled next month. A version tag such
            as <code>node:22-alpine</code> communicates intent but can still be
            updated by its publisher. A content digest points at immutable image
            content but requires an explicit update process when you want new
            fixes.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The linter recommends deliberate pinning without declaring one
            universal policy. Security maintenance and byte-for-byte
            reproducibility can pull the policy in different directions.
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Docker&apos;s Own Documentation Is Part of the Tool, Not Decoration
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The{" "}
            <a
              href="https://docs.docker.com/reference/dockerfile/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              Dockerfile reference
            </a>{" "}
            defines parser directives, instruction grammar, shell/exec forms,
            build checks, FROM stages, secret mounts and instruction behavior.
            Docker&apos;s{" "}
            <a
              href="https://docs.docker.com/build/building/best-practices/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              build best practices
            </a>{" "}
            provides the cache, package, context and image-maintenance guidance
            behind several of the linter&apos;s suggestions.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <YoryantraRelatedTools currentHref="/tools/dockerfile-linter" />
        </div>
      </section>
    </ToolShell>
  );
}

function CountCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-2 text-xl font-semibold text-gray-900">
        {value.toLocaleString()}
      </div>
    </div>
  );
}
