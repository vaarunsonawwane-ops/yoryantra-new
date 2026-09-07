"use client";

import { useMemo, useState } from "react";
import { parseDocument } from "yaml";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type ValidationLevel = "basic" | "strict";
type OutputMode = "summary" | "json" | "checklist";
type IssueSeverity = "error" | "warning" | "info";

type WorkflowIssue = {
  severity: IssueSeverity;
  title: string;
  message: string;
  path: string;
};

type ParsedWorkflow = {
  workflowName: string;
  triggers: string[];
  jobs: WorkflowJob[];
  permissions: string;
  envKeys: string[];
  raw: unknown;
};

type WorkflowJob = {
  id: string;
  name: string;
  runsOn: string;
  needs: string[];
  steps: WorkflowStep[];
  permissions: string;
  envKeys: string[];
};

type WorkflowStep = {
  name: string;
  uses: string;
  run: string;
  shell: string;
  withKeys: string[];
  envKeys: string[];
};

type ValidationResult = {
  parsed: ParsedWorkflow;
  issues: WorkflowIssue[];
  score: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
};

type YAMLLine = {
  indent: number;
  key: string;
  value: string;
  raw: string;
  line: number;
};

const sampleWorkflow = `name: CI

on:
  push:
    branches:
      - main
  pull_request:
  workflow_dispatch:

permissions:
  contents: read

jobs:
  test:
    name: Run tests
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install dependencies
        run: npm ci

      - name: Run build
        run: npm run build`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [validationLevel, setValidationLevel] =
    useState<ValidationLevel>("basic");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [checkPinnedActions, setCheckPinnedActions] = useState(true);
  const [checkPermissions, setCheckPermissions] = useState(true);
  const [checkSecrets, setCheckSecrets] = useState(true);
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const groupedIssues = useMemo(() => {
    if (!validationResult) {
      return {
        errors: [],
        warnings: [],
        info: [],
      };
    }

    return {
      errors: validationResult.issues.filter((issue) => issue.severity === "error"),
      warnings: validationResult.issues.filter(
        (issue) => issue.severity === "warning"
      ),
      info: validationResult.issues.filter((issue) => issue.severity === "info"),
    };
  }, [validationResult]);

  const validateWorkflow = () => {
    if (!input.trim()) {
      setError("Please paste a GitHub Actions workflow YAML file.");
      setValidationResult(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const result = validateGitHubActionsWorkflow(input, {
        validationLevel,
        checkPinnedActions,
        checkPermissions,
        checkSecrets,
      });

      const nextOutput = formatValidationOutput(result, {
        outputMode,
      });

      setValidationResult(result);
      setOutput(nextOutput);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to validate this GitHub Actions workflow."
      );
      setValidationResult(null);
      setOutput("");
      setCopied(false);
    }
  };

  const copyOutput = async () => {
    if (!output) {
      return;
    }

    await navigator.clipboard.writeText(output);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1400);
  };

  const loadExample = () => {
    setInput(sampleWorkflow);
    setValidationLevel("basic");
    setOutputMode("summary");
    setCheckPinnedActions(true);
    setCheckPermissions(true);
    setCheckSecrets(true);
    setValidationResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setValidationLevel("basic");
    setOutputMode("summary");
    setCheckPinnedActions(true);
    setCheckPermissions(true);
    setCheckSecrets(true);
    setValidationResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="GitHub Actions YAML Validator"
      description="Parse workflow YAML and examine triggers, jobs, runners, permissions, action references, and secret-handling risks."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Workflow YAML
        </label>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setValidationResult(null);
            setOutput("");
            setError("");
            setCopied(false);
          }}
          placeholder={sampleWorkflow}
          className="w-full min-h-[420px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste a GitHub Actions workflow file from{" "}
          <span className="font-mono">.github/workflows</span> to check its
          structure before committing or debugging a failed CI run.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Validation Options
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Validation Level"
            value={validationLevel}
            onChange={(value) => {
              setValidationLevel(value as ValidationLevel);
              setValidationResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              {
                label: "Basic",
                value: "basic",
              },
              {
                label: "Strict",
                value: "strict",
              },
            ]}
          />

          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value) => {
              setOutputMode(value as OutputMode);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              {
                label: "Summary",
                value: "summary",
              },
              {
                label: "JSON",
                value: "json",
              },
              {
                label: "Checklist",
                value: "checklist",
              },
            ]}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={checkPinnedActions}
              onChange={(event) => {
                setCheckPinnedActions(event.target.checked);
                setValidationResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Check action versions
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Warn when actions are not pinned with a version or commit.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={checkPermissions}
              onChange={(event) => {
                setCheckPermissions(event.target.checked);
                setValidationResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Check permissions
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Look for missing workflow or job permissions.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={checkSecrets}
              onChange={(event) => {
                setCheckSecrets(event.target.checked);
                setValidationResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Check secrets usage
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Warn about plain secret-looking values in workflow text.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={validateWorkflow} className="yoryantra-btn">
          Validate Workflow
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

      {validationResult && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Score"
            value={`${validationResult.score.toLocaleString()}%`}
          />
          <SummaryCard
            label="Errors"
            value={validationResult.errorCount.toLocaleString()}
          />
          <SummaryCard
            label="Warnings"
            value={validationResult.warningCount.toLocaleString()}
          />
          <SummaryCard
            label="Jobs"
            value={validationResult.parsed.jobs.length.toLocaleString()}
          />
        </div>
      )}

      {validationResult && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Workflow Overview
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Main workflow details found in the YAML file.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <DetailCard
              label="Workflow Name"
              value={validationResult.parsed.workflowName || "(not found)"}
            />
            <DetailCard
              label="Triggers"
              value={
                validationResult.parsed.triggers.length > 0
                  ? validationResult.parsed.triggers.join(", ")
                  : "(not found)"
              }
            />
            <DetailCard
              label="Workflow Permissions"
              value={validationResult.parsed.permissions || "(not found)"}
            />
            <DetailCard
              label="Environment Keys"
              value={
                validationResult.parsed.envKeys.length > 0
                  ? validationResult.parsed.envKeys.join(", ")
                  : "(none)"
              }
            />
          </div>
        </div>
      )}

      {validationResult && validationResult.parsed.jobs.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Jobs Found
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Jobs, runners, dependencies, and step counts detected in the
            workflow.
          </p>

          <div className="mt-4 space-y-4">
            {validationResult.parsed.jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <DetailCard label="Job ID" value={job.id} />
                  <DetailCard label="Name" value={job.name || "(not set)"} />
                  <DetailCard
                    label="Runs On"
                    value={job.runsOn || "(not found)"}
                  />
                  <DetailCard
                    label="Needs"
                    value={job.needs.length > 0 ? job.needs.join(", ") : "(none)"}
                  />
                  <DetailCard
                    label="Steps"
                    value={job.steps.length.toLocaleString()}
                  />
                  <DetailCard
                    label="Permissions"
                    value={job.permissions || "(inherits workflow permissions)"}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {validationResult && validationResult.issues.length > 0 && (
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <IssueColumn
            title="Errors"
            description="Problems that can break or confuse a workflow."
            issues={groupedIssues.errors}
          />

          <IssueColumn
            title="Warnings"
            description="Things that may work but are worth reviewing."
            issues={groupedIssues.warnings}
          />

          <IssueColumn
            title="Info"
            description="Helpful notes about workflow quality."
            issues={groupedIssues.info}
          />
        </div>
      )}

      {validationResult && validationResult.issues.length === 0 && (
        <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-relaxed text-green-800">
          No issues found with the selected checks.
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Validation Output
          </h3>

          {output && (
            <button
              onClick={copyOutput}
              className="yoryantra-btn-outline text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">
          {output || "GitHub Actions validation output will appear here."}
        </pre>
      </div>

      <div className="mt-4 self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Workflow validation happens directly in your browser. Your GitHub Actions
        YAML is not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What a local workflow review can catch before GitHub runs it
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            GitHub Actions workflows can fail because of small YAML mistakes,
            missing runners, incomplete steps, wrong triggers, or unclear
            permissions. Sometimes the file looks fine at a quick glance, but the
            workflow still fails after you push it.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This GitHub Actions YAML Validator checks the workflow structure and
            points out structural and policy issues in jobs, steps, triggers, permissions,
            runners, action versions, and secret handling. It is meant for quick
            checks before committing or while debugging CI problems.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How the workflow structure is interpreted
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste the workflow YAML from your .github/workflows folder.</li>
            <li>Choose basic or strict validation.</li>
            <li>Turn on checks for action versions, permissions, and secrets.</li>
            <li>Review the workflow overview, jobs, and issues.</li>
            <li>Copy the summary, JSON, or checklist output for notes or fixes.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Workflow mistakes worth separating from YAML syntax
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Missing workflow triggers such as push or pull_request.</li>
            <li>Jobs without runs-on values.</li>
            <li>Steps without uses or run commands.</li>
            <li>Actions without pinned versions.</li>
            <li>Missing permissions blocks in stricter workflows.</li>
            <li>Secret-looking values written directly in the YAML.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            A small workflow with explicit permissions
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`name: CI

on:
  push:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Token permissions and secret references need separate attention
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            GitHub Actions workflows often touch source code, packages, release
            jobs, deployment keys, and cloud credentials. A clear permissions
            block and proper secret usage make workflows easier to review and
            safer to maintain.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Use repository or organization secrets for real values. Avoid writing
            tokens, passwords, API keys, or private URLs directly in workflow
            files.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-lg font-semibold text-gray-900">
            YAML validity is only the first layer
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            GitHub defines the workflow keys, expression contexts, event-specific
            behavior, permissions, reusable workflows, and runner semantics.
            Local parsing can catch malformed YAML and many structural mistakes,
            but it cannot resolve repository secrets, environments, matrices,
            permissions policies, referenced reusable workflows, or runner-time
            behavior.
          </p>
          <p className="mt-3 text-sm text-gray-600">
            <a
              href="https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              GitHub Actions workflow syntax
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            GitHub Actions validation boundaries
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What does a local workflow validator actually verify?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It checks a GitHub Actions workflow file for workflow structure,
                job, step, trigger, permission, and secret-related issues.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this execute jobs or expressions?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. This tool only checks the YAML text. It does not connect to
                GitHub or run any action.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What still needs GitHub’s runner and repository context?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. It is a quick browser-side review tool. Always test the final
                workflow in GitHub Actions.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Where does the workflow YAML go?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Validation happens directly in your browser, and your YAML is
                not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4"><YoryantraRelatedTools currentHref="/tools/github-actions-yaml-validator" /></div>
        </div>
      </section>
    </ToolShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>

      <div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>

      <div className="mt-1 break-words font-mono text-sm text-gray-900">
        {value}
      </div>
    </div>
  );
}

function IssueColumn({
  title,
  description,
  issues,
}: {
  title: string;
  description: string;
  issues: WorkflowIssue[];
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>

      <p className="mt-2 text-sm text-gray-500">{description}</p>

      <div className="mt-4 space-y-3">
        {issues.length === 0 ? (
          <p className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
            No {title.toLowerCase()} found.
          </p>
        ) : (
          issues.map((issue, index) => (
            <div
              key={`${issue.severity}-${issue.path}-${index}`}
              className="rounded-xl border border-gray-200 bg-gray-50 p-4"
            >
              <p className="text-sm font-semibold text-gray-900">
                {issue.title}
              </p>

              <p className="mt-1 text-sm leading-relaxed text-gray-600">
                {issue.message}
              </p>

              {issue.path && (
                <p className="mt-2 break-words font-mono text-xs text-gray-500">
                  {issue.path}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function validateGitHubActionsWorkflow(
  input: string,
  options: {
    validationLevel: ValidationLevel;
    checkPinnedActions: boolean;
    checkPermissions: boolean;
    checkSecrets: boolean;
  }
): ValidationResult {
  const syntaxIssues = checkYAMLSyntax(input);

  if (syntaxIssues.some((issue) => issue.severity === "error")) {
    const parsed = createEmptyWorkflow();
    return buildValidationResult(parsed, syntaxIssues);
  }

  const parsed = parseWorkflow(input);
  const issues: WorkflowIssue[] = [...syntaxIssues];

  if (!parsed.workflowName) {
    issues.push({
      severity: "info",
      title: "Workflow has no name",
      message:
        "Adding a name makes the workflow easier to identify in GitHub Actions.",
      path: "name",
    });
  }

  if (parsed.triggers.length === 0) {
    issues.push({
      severity: "error",
      title: "No workflow trigger found",
      message:
        "A GitHub Actions workflow needs an on block such as push, pull_request, workflow_dispatch, or schedule.",
      path: "on",
    });
  }

  if (parsed.jobs.length === 0) {
    issues.push({
      severity: "error",
      title: "No jobs found",
      message:
        "A workflow needs at least one job under the jobs block.",
      path: "jobs",
    });
  }

  if (options.checkPermissions && !parsed.permissions) {
    issues.push({
      severity: options.validationLevel === "strict" ? "warning" : "info",
      title: "Workflow permissions not set",
      message:
        "A top-level permissions block makes token access clearer and safer.",
      path: "permissions",
    });
  }

  parsed.jobs.forEach((job) => {
    const rawJobs =
      isRecord(parsed.raw) && isRecord(parsed.raw.jobs) ? parsed.raw.jobs : null;
    const rawJob =
      rawJobs && isRecord(rawJobs[job.id]) ? (rawJobs[job.id] as Record<string, unknown>) : null;
    const reusableWorkflow = Boolean(rawJob && rawJob.uses);

    if (!job.runsOn && !reusableWorkflow) {
      issues.push({
        severity: "error",
        title: "Job is missing runs-on",
        message:
          "A normal job needs runs-on. Jobs that call a reusable workflow use jobs.<job_id>.uses instead.",
        path: `jobs.${job.id}.runs-on`,
      });
    }

    if (job.runsOn && reusableWorkflow) {
      issues.push({
        severity: "error",
        title: "Reusable-workflow job also has runs-on",
        message:
          "A job that calls a reusable workflow with jobs.<job_id>.uses does not use runs-on or normal steps.",
        path: `jobs.${job.id}`,
      });
    }

    if (job.steps.length === 0 && !reusableWorkflow) {
      issues.push({
        severity: "warning",
        title: "Job has no steps",
        message:
          "This job does not appear to have any steps.",
        path: `jobs.${job.id}.steps`,
      });
    }

    if (options.checkPermissions && !job.permissions && options.validationLevel === "strict") {
      issues.push({
        severity: "info",
        title: "Job permissions not set",
        message:
          "Strict mode suggests setting job-level permissions when jobs need different access.",
        path: `jobs.${job.id}.permissions`,
      });
    }

    job.steps.forEach((step, index) => {
      const path = `jobs.${job.id}.steps[${index}]`;

      if (!step.uses && !step.run) {
        issues.push({
          severity: "error",
          title: "Step has no uses or run",
          message:
            "Each step should either use an action or run a command.",
          path,
        });
      }

      if (step.uses && step.run) {
        issues.push({
          severity: "warning",
          title: "Step has both uses and run",
          message:
            "A step normally uses either an action or a command, not both.",
          path,
        });
      }

      if (options.checkPinnedActions && step.uses) {
        const pinIssue = checkActionPin(step.uses, path, options.validationLevel);

        if (pinIssue) {
          issues.push(pinIssue);
        }
      }

      if (step.run && step.run.includes("sudo") && options.validationLevel === "strict") {
        issues.push({
          severity: "info",
          title: "Step uses sudo",
          message:
            "Sudo can be fine on hosted runners, but review whether it is really needed.",
          path,
        });
      }
    });
  });

  if (options.checkSecrets) {
    findPlainSecretIssues(input).forEach((issue) => issues.push(issue));
  }

  return buildValidationResult(parsed, issues);
}

function checkYAMLSyntax(input: string): WorkflowIssue[] {
  const issues: WorkflowIssue[] = [];

  try {
    const document = parseDocument(input, {
      prettyErrors: true,
      uniqueKeys: true,
    });

    document.errors.forEach((yamlError) => {
      issues.push({
        severity: "error",
        title: "Invalid YAML",
        message: yamlError.message,
        path: yamlError.linePos?.[0]
          ? `line ${yamlError.linePos[0].line}, column ${yamlError.linePos[0].col}`
          : "workflow YAML",
      });
    });

    document.warnings.forEach((yamlWarning) => {
      issues.push({
        severity: "warning",
        title: "YAML parser warning",
        message: yamlWarning.message,
        path: yamlWarning.linePos?.[0]
          ? `line ${yamlWarning.linePos[0].line}, column ${yamlWarning.linePos[0].col}`
          : "workflow YAML",
      });
    });
  } catch (error) {
    issues.push({
      severity: "error",
      title: "Unable to parse YAML",
      message:
        error instanceof Error ? error.message : "The workflow YAML could not be parsed.",
      path: "workflow YAML",
    });
  }

  return issues;
}

function parseWorkflow(input: string): ParsedWorkflow {
  const document = parseDocument(input, {
    prettyErrors: true,
    uniqueKeys: true,
  });

  if (document.errors.length > 0) {
    throw new Error(document.errors[0].message);
  }

  const root = document.toJS({ mapAsMap: false }) as unknown;

  if (!isRecord(root)) {
    throw new Error("A GitHub Actions workflow must be a top-level YAML mapping.");
  }

  const jobsValue = root.jobs;
  const jobs: WorkflowJob[] = [];

  if (isRecord(jobsValue)) {
    Object.entries(jobsValue).forEach(([id, value]) => {
      if (!isRecord(value)) {
        return;
      }

      const stepsValue = value.steps;
      const steps: WorkflowStep[] = Array.isArray(stepsValue)
        ? stepsValue
            .filter(isRecord)
            .map((step) => ({
              name: scalarText(step.name),
              uses: scalarText(step.uses),
              run: scalarText(step.run),
              shell: scalarText(step.shell),
              withKeys: isRecord(step.with) ? Object.keys(step.with) : [],
              envKeys: isRecord(step.env) ? Object.keys(step.env) : [],
            }))
        : [];

      jobs.push({
        id,
        name: scalarText(value.name),
        runsOn: scalarText(value["runs-on"]),
        needs: stringList(value.needs),
        steps,
        permissions: value.permissions === undefined ? "" : compactValue(value.permissions),
        envKeys: isRecord(value.env) ? Object.keys(value.env) : [],
      });
    });
  }

  return {
    workflowName: scalarText(root.name),
    triggers: triggerNames(root.on),
    jobs,
    permissions: root.permissions === undefined ? "" : compactValue(root.permissions),
    envKeys: isRecord(root.env) ? Object.keys(root.env) : [],
    raw: root,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function scalarText(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map((item) => scalarText(item)).filter(Boolean).join(", ");
  return "";
}

function stringList(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => scalarText(item)).filter(Boolean);
  }

  const single = scalarText(value);
  return single ? [single] : [];
}

function triggerNames(value: unknown) {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.map((item) => scalarText(item)).filter(Boolean);
  if (isRecord(value)) return Object.keys(value);
  return [];
}

function compactValue(value: unknown) {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return "(structured value)";
  }
}

function toYAMLLines(input: string): YAMLLine[] {
  return input
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((raw, index) => {
      const withoutComment = stripComment(raw);
      const indent = raw.length - raw.replace(/^\s+/, "").length;
      const trimmed = withoutComment.trim();
      const colonIndex = trimmed.indexOf(":");

      if (colonIndex === -1) {
        return {
          indent,
          key: "",
          value: trimmed,
          raw,
          line: index + 1,
        };
      }

      return {
        indent,
        key: trimmed.slice(0, colonIndex).trim().replace(/^["']|["']$/g, ""),
        value: trimmed.slice(colonIndex + 1).trim(),
        raw,
        line: index + 1,
      };
    });
}

function stripComment(line: string) {
  let quote: "'" | '"' | null = null;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (quote) {
      if (char === quote) {
        quote = null;
      }

      continue;
    }

    if (char === "'" || char === '"') {
      quote = char;
      continue;
    }

    if (char === "#") {
      return line.slice(0, index);
    }
  }

  return line;
}

function getTopLevelScalar(lines: YAMLLine[], key: string) {
  const line = lines.find((item) => item.indent === 0 && item.key === key);
  return cleanValue(line?.value || "");
}

function parseTriggers(lines: YAMLLine[]) {
  const onLine = lines.find((line) => line.indent === 0 && line.key === "on");
  const triggers: string[] = [];

  if (!onLine) {
    return triggers;
  }

  if (onLine.value) {
    return splitInlineList(onLine.value);
  }

  lines
    .filter((line) => line.indent === 2 && line.key && line.line > onLine.line)
    .forEach((line) => {
      if (isAfterTopLevel(lines, onLine.line, line.line)) {
        return;
      }

      triggers.push(line.key);
    });

  return Array.from(new Set(triggers));
}

function parseJobs(lines: YAMLLine[]): WorkflowJob[] {
  const jobsLine = lines.find((line) => line.indent === 0 && line.key === "jobs");

  if (!jobsLine) {
    return [];
  }

  const jobLines = lines.filter(
    (line) =>
      line.line > jobsLine.line &&
      line.indent === 2 &&
      line.key &&
      !isAfterTopLevel(lines, jobsLine.line, line.line)
  );

  return jobLines.map((jobLine) => {
    const blockLines = lines.filter(
      (line) =>
        line.line > jobLine.line &&
        line.indent > jobLine.indent &&
        !isNextSiblingOrAfter(lines, jobLine, line)
    );

    return {
      id: jobLine.key,
      name: getNestedScalar(blockLines, 4, "name"),
      runsOn: getNestedScalar(blockLines, 4, "runs-on"),
      needs: parseNeeds(blockLines),
      steps: parseSteps(blockLines),
      permissions: parseNestedBlockAsText(blockLines, 4, "permissions"),
      envKeys: parseNestedMapKeys(blockLines, 4, "env"),
    };
  });
}

function parseNeeds(lines: YAMLLine[]) {
  const needsValue = getNestedScalar(lines, 4, "needs");

  if (!needsValue) {
    return [];
  }

  return splitInlineList(needsValue);
}

function parseSteps(lines: YAMLLine[]): WorkflowStep[] {
  const stepsLine = lines.find((line) => line.indent === 4 && line.key === "steps");

  if (!stepsLine) {
    return [];
  }

  const stepStarts = lines.filter((line) => {
    const trimmed = line.raw.trim();
    return (
      line.line > stepsLine.line &&
      line.indent === 6 &&
      trimmed.startsWith("-")
    );
  });

  return stepStarts.map((stepStart, index) => {
    const nextStart = stepStarts[index + 1];
    const stepLines = lines.filter(
      (line) =>
        line.line >= stepStart.line &&
        (!nextStart || line.line < nextStart.line)
    );
    const firstLine = stepStart.raw.trim().replace(/^-\s*/, "");
    const firstLineParsed = parseInlineKeyValue(firstLine);

    return {
      name: firstLineParsed.key === "name" ? cleanValue(firstLineParsed.value) : getStepScalar(stepLines, "name"),
      uses: firstLineParsed.key === "uses" ? cleanValue(firstLineParsed.value) : getStepScalar(stepLines, "uses"),
      run: firstLineParsed.key === "run" ? cleanValue(firstLineParsed.value) : getStepScalar(stepLines, "run"),
      shell: getStepScalar(stepLines, "shell"),
      withKeys: parseStepMapKeys(stepLines, "with"),
      envKeys: parseStepMapKeys(stepLines, "env"),
    };
  });
}

function getNestedScalar(lines: YAMLLine[], indent: number, key: string) {
  const line = lines.find((item) => item.indent === indent && item.key === key);
  return cleanValue(line?.value || "");
}

function parseNestedBlockAsText(lines: YAMLLine[], indent: number, key: string) {
  const start = lines.find((line) => line.indent === indent && line.key === key);

  if (!start) {
    return "";
  }

  const childLines = lines.filter(
    (line) => line.line > start.line && line.indent > start.indent
  );

  if (start.value) {
    return cleanValue(start.value);
  }

  return childLines.map((line) => line.raw.trim()).join("; ");
}

function parseBlockAsText(lines: YAMLLine[], key: string) {
  const start = lines.find((line) => line.indent === 0 && line.key === key);

  if (!start) {
    return "";
  }

  if (start.value) {
    return cleanValue(start.value);
  }

  return lines
    .filter((line) => line.line > start.line && line.indent > start.indent)
    .filter((line) => !isAfterTopLevel(lines, start.line, line.line))
    .map((line) => line.raw.trim())
    .join("; ");
}

function parseTopLevelMapKeys(lines: YAMLLine[], key: string) {
  const start = lines.find((line) => line.indent === 0 && line.key === key);

  if (!start) {
    return [];
  }

  return lines
    .filter(
      (line) =>
        line.line > start.line &&
        line.indent === 2 &&
        line.key &&
        !isAfterTopLevel(lines, start.line, line.line)
    )
    .map((line) => line.key);
}

function parseNestedMapKeys(lines: YAMLLine[], indent: number, key: string) {
  const start = lines.find((line) => line.indent === indent && line.key === key);

  if (!start) {
    return [];
  }

  return lines
    .filter((line) => line.line > start.line && line.indent === indent + 2 && line.key)
    .map((line) => line.key);
}

function getStepScalar(lines: YAMLLine[], key: string) {
  const line = lines.find((item) => item.key === key);
  return cleanValue(line?.value || "");
}

function parseStepMapKeys(lines: YAMLLine[], key: string) {
  const start = lines.find((line) => line.key === key);

  if (!start) {
    return [];
  }

  return lines
    .filter((line) => line.line > start.line && line.indent > start.indent && line.key)
    .map((line) => line.key);
}

function parseInlineKeyValue(value: string) {
  const colonIndex = value.indexOf(":");

  if (colonIndex === -1) {
    return {
      key: "",
      value: "",
    };
  }

  return {
    key: value.slice(0, colonIndex).trim(),
    value: value.slice(colonIndex + 1).trim(),
  };
}

function checkActionPin(
  usesValue: string,
  path: string,
  validationLevel: ValidationLevel
): WorkflowIssue | null {
  if (usesValue.startsWith("./") || usesValue.startsWith("docker://")) {
    return null;
  }

  if (!usesValue.includes("@")) {
    return {
      severity: "warning",
      title: "Action reference is missing",
      message:
        "Repository actions should include a ref after @. Local actions and docker:// images follow different forms.",
      path,
    };
  }

  const [, ref = ""] = usesValue.split("@");

  if (!ref) {
    return {
      severity: "warning",
      title: "Action reference is empty",
      message:
        "The action has @ but no version or reference after it.",
      path,
    };
  }

  if (validationLevel === "strict" && !/^[0-9a-fA-F]{40}$/.test(ref)) {
    return {
      severity: ["main", "master"].includes(ref) ? "warning" : "info",
      title: /^[vV]?\d+(?:\.\d+){0,2}$/.test(ref)
        ? "Action uses a version tag"
        : "Action is not pinned to a full commit SHA",
      message:
        "GitHub recommends a full commit SHA for the strongest immutability. Tags and branches can move.",
      path,
    };
  }

  return null;
}

function findPlainSecretIssues(input: string): WorkflowIssue[] {
  const issues: WorkflowIssue[] = [];
  const lines = input.replace(/\r\n/g, "\n").split("\n");

  lines.forEach((line, index) => {
    const lower = line.toLowerCase();

    if (
      (lower.includes("token:") ||
        lower.includes("password:") ||
        lower.includes("secret:") ||
        lower.includes("api_key:") ||
        lower.includes("apikey:")) &&
      !line.includes("${{ secrets.")
    ) {
      issues.push({
        severity: "warning",
        title: "Possible plain secret value",
        message:
          "This line looks like it may contain a token, password, secret, or API key outside GitHub secrets.",
        path: `line ${index + 1}`,
      });
    }
  });

  return issues;
}

function buildValidationResult(
  parsed: ParsedWorkflow,
  issues: WorkflowIssue[]
): ValidationResult {
  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;
  const infoCount = issues.filter((issue) => issue.severity === "info").length;
  const score = Math.max(0, 100 - errorCount * 30 - warningCount * 10 - infoCount * 3);

  return {
    parsed,
    issues,
    score,
    errorCount,
    warningCount,
    infoCount,
  };
}

function createEmptyWorkflow(): ParsedWorkflow {
  return {
    workflowName: "",
    triggers: [],
    jobs: [],
    permissions: "",
    envKeys: [],
    raw: null,
  };
}

function formatValidationOutput(
  result: ValidationResult,
  options: {
    outputMode: OutputMode;
  }
) {
  if (options.outputMode === "json") {
    return JSON.stringify(result, null, 2);
  }

  if (options.outputMode === "checklist") {
    return [
      "# GitHub Actions Workflow Checklist",
      "",
      `- [${result.parsed.workflowName ? "x" : " "}] Workflow name is set`,
      `- [${result.parsed.triggers.length > 0 ? "x" : " "}] Workflow trigger is defined`,
      `- [${result.parsed.jobs.length > 0 ? "x" : " "}] At least one job is defined`,
      `- [${result.parsed.jobs.every((job) => job.runsOn) ? "x" : " "}] Every job has runs-on`,
      `- [${result.parsed.jobs.every((job) => job.steps.length > 0) ? "x" : " "}] Every job has steps`,
      `- [${result.parsed.permissions ? "x" : " "}] Workflow permissions are set`,
      "",
      "Issues:",
      ...result.issues.map(
        (issue) =>
          `- [${issue.severity.toUpperCase()}] ${issue.title} (${issue.path})`
      ),
    ].join("\n");
  }

  return [
    "GitHub Actions Workflow Validation",
    "----------------------------------",
    `Score: ${result.score}%`,
    `Errors: ${result.errorCount}`,
    `Warnings: ${result.warningCount}`,
    `Info: ${result.infoCount}`,
    `Workflow name: ${result.parsed.workflowName || "(not found)"}`,
    `Triggers: ${
      result.parsed.triggers.length > 0
        ? result.parsed.triggers.join(", ")
        : "(not found)"
    }`,
    `Jobs: ${result.parsed.jobs.length}`,
    "",
    "Issues:",
    ...(result.issues.length === 0
      ? ["No issues found with the selected checks."]
      : result.issues.map(
          (issue) =>
            `- [${issue.severity.toUpperCase()}] ${issue.title}: ${issue.message} (${issue.path})`
        )),
  ].join("\n");
}

function splitInlineList(value: string) {
  const cleaned = cleanValue(value);

  if (!cleaned) {
    return [];
  }

  if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
    return cleaned
      .slice(1, -1)
      .split(",")
      .map((item) => cleanValue(item))
      .filter(Boolean);
  }

  return cleaned
    .split(",")
    .map((item) => cleanValue(item))
    .filter(Boolean);
}

function cleanValue(value: string) {
  return value.trim().replace(/^["']|["']$/g, "");
}

function isAfterTopLevel(lines: YAMLLine[], startLine: number, targetLine: number) {
  return lines.some(
    (line) =>
      line.line > startLine &&
      line.line < targetLine &&
      line.indent === 0 &&
      line.key
  );
}

function isNextSiblingOrAfter(lines: YAMLLine[], parent: YAMLLine, target: YAMLLine) {
  return lines.some(
    (line) =>
      line.line > parent.line &&
      line.line <= target.line &&
      line.indent <= parent.indent &&
      line.key
  );
}

function countUnescapedQuotes(value: string, quote: string) {
  let count = 0;
  let escaped = false;

  for (const char of value) {
    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === quote) {
      count += 1;
    }
  }

  return count;
}
