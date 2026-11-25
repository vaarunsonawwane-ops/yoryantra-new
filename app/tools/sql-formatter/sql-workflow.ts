// Shared lexical formatting helpers adapted from both original SQL tools.
export type KeywordCase = "upper" | "lower" | "preserve";
export type IndentSize = "two" | "four";
export type CommaStyle = "trailing" | "leading";

export type SQLStats = {
  characters: number;
  lines: number;
  statements: number;
  selectCount: number;
  joinCount: number;
  whereCount: number;
  groupByCount: number;
  orderByCount: number;
  insertCount: number;
  updateCount: number;
  deleteCount: number;
};

export type QueryWarning = { title: string; message: string };
export type FormatOptions = {
  keywordCase: KeywordCase;
  indentSize: IndentSize;
  commaStyle: CommaStyle;
  breakBeforeJoin: boolean;
  breakBooleanConditions: boolean;
  functionCase: "preserve" | "keyword" | "upper";
  removeComments: boolean;
};

type ProtectedSQL = { text: string; segments: string[]; semanticCommentsFound: boolean; };

export const MAX_SQL_CHARS = 500_000;
function assertInputLimit(sql: string) {
  if (sql.length > MAX_SQL_CHARS) throw new Error(`SQL exceeds the ${MAX_SQL_CHARS.toLocaleString()}-character browser limit. Format the script in smaller sections.`);
}
const SEGMENT_OPEN = "\uE100";
const SEGMENT_CLOSE = "\uE101";
const FORCED_NEWLINE = "\uE102";

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
  "constraint",
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
  "recursive",
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
  "convert",
  "date",
  "now",
  "lower",
  "upper",
  "trim",
  "substring",
  "round",
];

export function beautifySQL(sql: string, options: FormatOptions) {
  assertInputLimit(sql);
  const indent = options.indentSize === "four" ? "    " : "  ";
  const protectedSql = protectSQLSegments(sql, true, options.removeComments);
  let formatted = normalizeSQLSpacing(protectedSql.text);

  formatted = applyKeywordCase(formatted, options.keywordCase);
  if (options.functionCase !== "preserve") formatted = applyFunctionCase(formatted, options.functionCase === "upper" ? "upper" : options.keywordCase);

  formatted = formatted.replace(/\s*,\s*/g, ", ").replace(/\s*;\s*/g, ";\n").trim();

  ["INSERT INTO", "DELETE FROM", "GROUP BY", "ORDER BY", "UNION ALL", "SELECT", "FROM", "WHERE", "HAVING", "LIMIT", "OFFSET", "RETURNING", "VALUES", "SET", "UNION"].forEach((clause) => {
    const regex = new RegExp(`\\s+(${escapeRegExp(clause)})\\s+`, "gi");
    formatted = formatted.replace(regex, `\n$1 `);
  });

  if (options.breakBeforeJoin) {
    formatted = formatted.replace(/\s+((?:(?:LEFT|RIGHT|FULL)\s+OUTER\s+|(?:INNER|LEFT|RIGHT|FULL|CROSS|NATURAL)\s+)?JOIN)\s+/gi, "\n$1 ");
  }

  if (options.breakBooleanConditions) {
    formatted = breakBooleanConditionsSafely(formatted, indent);
  }

  formatted = formatSelectList(formatted, indent, options.commaStyle);
  formatted = indentContinuationLines(formatted, indent);
  formatted = formatted
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .filter((line, index, lines) => !(line.trim() === "" && lines[index - 1]?.trim() === ""))
    .join("\n")
    .trim();

  return restoreSQLSegments(cleanForcedNewlines(formatted), protectedSql.segments).trim();
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
    result = result.replace(new RegExp(`(?<![\\p{L}\\p{N}_$])${escapeRegExp(keyword)}(?![\\p{L}\\p{N}_$])`, "giu"), replacement);
  });
  return result;
}

function applyFunctionCase(sql: string, keywordCase: KeywordCase) {
  if (keywordCase === "preserve") return sql;
  let result = sql;
  sqlFunctions.forEach((fn) => {
    const replacement = keywordCase === "lower" ? fn.toLowerCase() : fn.toUpperCase();
    result = result.replace(new RegExp(`(?<![\\p{L}\\p{N}_$])${escapeRegExp(fn)}\\s*\\(`, "giu"), `${replacement}(`);
  });
  return result;
}

/** Keep the AND that separates BETWEEN bounds attached to its expression.
 * This is a lexical formatting aid, not a dialect-aware SQL parser.
 */
function breakBooleanConditionsSafely(sql: string, indent: string) {
  let result = "";
  let last = 0;
  let depth = 0;
  const betweenAtDepth = new Map<number, number>();
  const token = /[A-Za-z_][A-Za-z0-9_$]*/g;
  let match: RegExpExecArray | null;
  let position = 0;

  while ((match = token.exec(sql)) !== null) {
    for (; position < match.index; position += 1) {
      if (sql[position] === "(") depth += 1;
      else if (sql[position] === ")") {
        betweenAtDepth.delete(depth);
        depth = Math.max(0, depth - 1);
      } else if (sql[position] === ";") {
        betweenAtDepth.clear();
      }
    }

    const word = match[0].toUpperCase();
    const end = match.index + match[0].length;
    // Do not mistake part of a longer identifier (e.g. myAND) for a keyword.
    if ((match.index > 0 && /[A-Za-z0-9_$]/.test(sql[match.index - 1])) ||
        (end < sql.length && /[A-Za-z0-9_$]/.test(sql[end]))) continue;

    if (word === "BETWEEN") {
      betweenAtDepth.set(depth, (betweenAtDepth.get(depth) ?? 0) + 1);
    } else if (word === "AND") {
      const pending = betweenAtDepth.get(depth) ?? 0;
      if (pending) {
        if (pending === 1) betweenAtDepth.delete(depth);
        else betweenAtDepth.set(depth, pending - 1);
      } else {
        const whitespace = sql.slice(last, match.index).match(/\s+$/)?.[0];
        if (whitespace) {
          result += sql.slice(last, match.index - whitespace.length) + `\n${indent}${match[0]}`;
          last = end;
        }
      }
    } else if (word === "OR") {
      const whitespace = sql.slice(last, match.index).match(/\s+$/)?.[0];
      if (whitespace) {
        result += sql.slice(last, match.index - whitespace.length) + `\n${indent}${match[0]}`;
        last = end;
      }
    }
  }
  return result + sql.slice(last);
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
    if (/^(?:(?:LEFT|RIGHT|FULL)\s+OUTER\s+|(?:INNER|LEFT|RIGHT|FULL|CROSS|NATURAL)\s+)?JOIN\b/i.test(trimmed)) return trimmed;
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

export function minifySQL(sql: string, removeComments: boolean) {
  assertInputLimit(sql);
  const protectedSql = protectSQLSegments(sql, true, removeComments);
  const minified = protectedSql.text
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ",")
    .replace(/([^\s<>=!:+\-*/~#@?|&^%])\s*=\s*(?=[^\s<>=!:+\-*/~#@?|&^%])/g, "$1=")
    .replace(/\s*;\s*/g, ";")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .trim();
  return restoreSQLSegments(cleanForcedNewlines(minified), protectedSql.segments).trim();
}

function protectSQLSegments(sql: string, strict: boolean, removeComments = false): ProtectedSQL {
  const segments: string[] = [];
  let result = "";
  let index = 0;
  let semanticCommentsFound = false;
  if (/[\uE100-\uE102]/.test(sql)) throw new Error("SQL contains reserved internal formatting characters.");

  const addSegment = (value: string) => {
    const id = segments.length;
    segments.push(value);
    result += `${SEGMENT_OPEN}${id}${SEGMENT_CLOSE}`;
  };

  while (index < sql.length) {
    const char = sql[index];
    const next = sql[index + 1];

    if (char === "\r" || char === "\n") {
      const newlineStart = index;
      if (char === "\r" && next === "\n") index += 2;
      else index += 1;
      // Preserve literal-concatenation newlines, batch separators and line-start hash comments.
      const previousProtected = result.trimEnd().endsWith(SEGMENT_CLOSE);
      let nextContent = index;
      while (previousProtected && nextContent < sql.length && /[ \t\r\n]/.test(sql[nextContent])) nextContent += 1;
      const nextProtected = previousProtected && /^(?:['"`]|[EeNnBbXx]'|\$(?:[A-Za-z_][A-Za-z0-9_]*)?\$|#)/.test(sql.slice(nextContent));
      const lineEnd = /[^\r\n]*/y;
      lineEnd.lastIndex = index;
      const nextLine = lineEnd.exec(sql)?.[0] ?? "";
      const previousLine = sql.slice(Math.max(sql.lastIndexOf("\n", newlineStart - 1), sql.lastIndexOf("\r", newlineStart - 1)) + 1, newlineStart).trim();
      const batch = /^(?:GO(?:\s+\d+)?|\/)$/i;
      result += (previousProtected && nextProtected) || /^[ \t]*#/.test(nextLine) || batch.test(nextLine.trim()) || batch.test(previousLine) ? `${FORCED_NEWLINE} ` : " ";
      continue;
    }

    if ((char === "-" && next === "-") || (char === "#" && /^[ \t]*$/.test(sql.slice(Math.max(sql.lastIndexOf("\n", index - 1), sql.lastIndexOf("\r", index - 1)) + 1, index)))) {
      let end = index + (char === "#" ? 1 : 2);
      while (end < sql.length && sql[end] !== "\n" && sql[end] !== "\r") end += 1;
      if (!removeComments) addSegment(sql.slice(index, end));
      else result += " ";
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
      const value = sql.slice(index, end);
      const semantic = value.startsWith("/*!") || value.startsWith("/*+");
      semanticCommentsFound ||= semantic;
      if (removeComments && !semantic) result += /[\r\n]/.test(value) ? FORCED_NEWLINE : " ";
      else addSegment(value);
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
        if (sql[end] === quote) {
          let backslashes = 0;
          for (let cursor = end - 1; cursor >= index && sql[cursor] === "\\"; cursor -= 1) backslashes += 1;
          if (backslashes % 2 === 1 && strict) throw new Error("A backslash immediately before a quote is dialect-sensitive SQL. The formatter stops instead of guessing whether that quote is escaped.");
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

  return { text: result, segments, semanticCommentsFound };
}

function cleanForcedNewlines(text: string) {
  return text.replace(new RegExp(`[ \t\n]*${FORCED_NEWLINE}[ \t\n]*`, "g"), FORCED_NEWLINE);
}

function restoreSQLSegments(sql: string, segments: string[]) {
  return sql.replace(new RegExp(`${SEGMENT_OPEN}(\\d+)${SEGMENT_CLOSE}|${FORCED_NEWLINE}`, "g"), (_match, rawIndex?: string) => rawIndex === undefined ? "\n" : segments[Number(rawIndex)] ?? "");
}

function analysisCode(sql: string) {
  try {
    return protectSQLSegments(sql, false).text.replace(new RegExp(FORCED_NEWLINE, "g"), " ");
  } catch {
    return sql;
  }
}

export function getSQLStats(sql: string): SQLStats {
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
    insertCount: countKeyword(normalized, "insert"),
    updateCount: countKeyword(normalized, "update"),
    deleteCount: countKeyword(normalized, "delete"),
  };
}

/** Return only words outside parentheses and protected strings/comments.
 * A WHERE inside a subquery must not count as the outer UPDATE/DELETE's WHERE.
 */
function topLevelSQLWords(sql: string) {
  const words: string[] = [];
  let depth = 0;
  const token = /[A-Za-z_][A-Za-z0-9_$]*|[()]/g;
  let match: RegExpExecArray | null;
  while ((match = token.exec(sql)) !== null) {
    if (match[0] === "(") depth += 1;
    else if (match[0] === ")") depth = Math.max(0, depth - 1);
    else if (depth === 0) {
      const end = match.index + match[0].length;
      if ((match.index === 0 || !/[A-Za-z0-9_$]/.test(sql[match.index - 1])) &&
          (end === sql.length || !/[A-Za-z0-9_$]/.test(sql[end]))) {
        words.push(match[0].toUpperCase());
      }
    }
  }
  return words;
}

export function getSQLWarnings(sql: string, removeComments = false): QueryWarning[] {
  const code = analysisCode(sql);
  const warnings: QueryWarning[] = [];
  const statements = code.split(";").filter((part) => hasExecutableText(part));

  statements.forEach((statement, index) => {
    const number = statements.length > 1 ? ` in statement ${index + 1}` : "";
    if (/\bselect\s+\*/i.test(statement)) {
      warnings.push({ title: `SELECT *${number}`, message: "Selecting every column can be intentional, but it can also pull more data than expected or make callers depend on schema changes." });
    }

    const words = topLevelSQLWords(statement);
    // A leading WITH may define one or more CTEs before the outer statement.
    // Check the first top-level command rather than UPDATE within an INSERT upsert.
    const firstCommand = words[0] === "WITH"
      ? words.findIndex((word) => ["SELECT", "INSERT", "UPDATE", "DELETE", "MERGE"].includes(word))
      : 0;
    const command = words[firstCommand];
    if ((command === "UPDATE" || command === "DELETE") && !words.slice(firstCommand + 1).includes("WHERE")) {
      warnings.push({
        title: `${command} without WHERE${number}`,
        message: `The outer ${command} appears to have no WHERE clause. A WHERE inside a nested query does not limit the outer statement. Confirm which rows will be affected in your database before running it.`,
      });
    }
  });

  if (/\b(drop\s+table|truncate\s+table)\b/i.test(code)) warnings.push({ title: "Destructive statement detected", message: "DROP TABLE or TRUNCATE TABLE appears outside quoted text and comments. Confirm the target database, transaction behavior, and recovery plan before execution." });
  try {
    if (removeComments && protectSQLSegments(sql, false).semanticCommentsFound) warnings.push({ title: "Execution-sensitive comments will be preserved", message: "MySQL version comments (/*!...*/) and optimizer-hint comments (/*+...*/) can affect execution, so the remove-comments option does not strip them." });
  } catch { /* Formatting reports lexical errors separately. */ }
  if (/\$[A-Za-z_]*\$/i.test(sql) || /`[^`]*`/.test(sql) || /\[[^\]]+\]/.test(sql)) warnings.push({ title: "Dialect-specific quoting detected", message: "Dollar quotes, backticks, and bracketed identifiers belong to different SQL dialects. Their text is protected, but surrounding vendor-specific grammar may still need manual review." });
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
