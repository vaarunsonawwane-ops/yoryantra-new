import Link from "next/link";

const featuredCategories = [
  {
    title: "DevOps Tools",
    description:
      "Docker, Kubernetes, YAML, environment files, cron, and deployment workflows.",
    href: "/categories/devops-tools",
  },
  {
    title: "Developer Tools",
    description:
      "Developer tools for debugging, timestamps, UUIDs, APIs, and daily checks.",
    href: "/categories/developer-tools",
  },
  {
    title: "JSON & Data Tools",
    description:
      "JSON, YAML, schema, validation, and structured-data workflows.",
    href: "/categories/json-tools",
  },
  {
    title: "Security Tools",
    description:
      "Security tools for tokens, hashes, keys, headers, and authentication checks.",
    href: "/categories/security-tools",
  },
];

const popularDevopsTools = [
  {
    title: "Docker Compose Validator",
    description:
      "Check Docker Compose syntax and common structure issues before running a stack.",
    href: "/tools/docker-compose-validator",
  },
  {
    title: "Kubernetes YAML Validator",
    description:
      "Check Kubernetes manifest syntax and common configuration problems.",
    href: "/tools/kubernetes-yaml-validator",
  },
  {
    title: ".env File Parser",
    description:
      "Parse environment files into readable key-value output.",
    href: "/tools/env-file-parser",
  },
  {
    title: "YAML Formatter",
    description:
      "Format valid YAML for clearer review and debugging.",
    href: "/tools/yaml-formatter",
  },
  {
    title: "JSON to YAML Converter",
    description:
      "Convert JSON to YAML while preserving the underlying data structure.",
    href: "/tools/json-to-yaml-converter",
  },
  {
    title: "YAML to JSON Converter",
    description:
      "Convert YAML to JSON for debugging, scripts, and API workflows.",
    href: "/tools/yaml-to-json-converter",
  },
  {
    title: "Cron Expression Generator",
    description:
      "Build cron expressions for scheduled jobs and automation.",
    href: "/tools/cron-expression-generator",
  },
  {
    title: "Cron Expression Parser",
    description:
      "Interpret cron fields and review the resulting schedule.",
    href: "/tools/cron-expression-parser",
  },
];

export const metadata = {
  title: "DevOps Workflows for Docker, Kubernetes, YAML, and Automation | Yoryantra",

  description:
    "Follow practical DevOps workflows for Docker Compose, Kubernetes YAML, environment files, YAML formatting, cron expressions, and configuration conversion.",

  keywords: [
    "DevOps workflows",
    "DevOps tool selection",
    "docker compose validator",
    "kubernetes yaml validator",
    "yaml formatter",
    "env file parser",
    "cron expression generator",
    "cron parser",
    "json to yaml converter",
    "infrastructure tools",
    "configuration tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/devops-resources",
  },

  openGraph: {
    title: "DevOps Workflows for Docker, Kubernetes, YAML, and Automation | Yoryantra",

    description:
      "Practical DevOps workflows and tools for Docker Compose, Kubernetes YAML, environment files, YAML formatting, cron expressions, and configuration checks.",

    url: "https://yoryantra.com/devops-resources",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "DevOps Workflows for Docker, Kubernetes, YAML, and Automation | Yoryantra",

    description:
      "Choose the right DevOps tool for Docker, Kubernetes, YAML, environment files, cron expressions, and deployment checks.",
  },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-6 py-16">
        {/* BREADCRUMB */}
        <div className="mb-8 flex items-center text-sm text-gray-500">
          <Link
            href="/"
            className="hover:!text-[var(--light-gold)] transition-colors duration-200"
          >
            Home
          </Link>

          <span className="mx-2">/</span>

          <span className="text-gray-900">
            DevOps Resources
          </span>
        </div>

        {/* HERO */}
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            DevOps Workflows for Docker, Kubernetes, YAML, and Automation
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            Use practical browser-based tools for Docker Compose,
            Kubernetes YAML, environment files, YAML formatting, cron
            expressions, configuration conversion, and pre-deployment checks.
          </p>
        </div>

        {/* INTRO */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Choose the Right Tool for Configuration Checks
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Validate Docker Compose files, inspect Kubernetes manifests,
              format YAML, parse environment variables, and review configuration
              before deployment.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Separate Syntax Checks from Deployment Testing
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Syntax and structure checks can catch common mistakes, but they
              do not confirm that images, secrets, permissions, networks, storage,
              or runtime behaviour are correct.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Understand What a Browser Check Can Confirm
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Browser tools are useful for focused checks and conversions.
              Production readiness still depends on real environments, logs,
              access controls, backups, monitoring, and rollback plans.
            </p>
          </div>
        </div>

        {/* FEATURED CATEGORIES */}
        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              Related Categories for DevOps Work
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Use these categories when the task extends beyond one
              configuration check into data conversion, security, debugging,
              or deployment preparation.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {featuredCategories.map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[var(--light-gold)]">
                  {category.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {category.description}
                </p>

                <span className="mt-5 inline-flex text-sm font-semibold text-[var(--light-gold)]">
                  Explore category →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* POPULAR TOOLS */}
        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              Common DevOps Tools and When to Use Them
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Start with these tools for container configuration,
              Kubernetes manifests, environment files, YAML conversion, and
              scheduled jobs.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {popularDevopsTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[var(--light-gold)]">
                  {tool.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {tool.description}
                </p>

                <span className="mt-5 inline-flex text-sm font-semibold text-[var(--light-gold)]">
                  Open tool →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* WORKFLOWS */}
        <section className="mt-16 rounded-2xl border border-gray-200 bg-gray-50 p-8">
          <h2 className="text-2xl font-semibold text-gray-900">
            Practical DevOps Workflows
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              "Validate Docker Compose syntax and structure before running a stack.",
              "Check Kubernetes YAML structure before applying changes to a cluster.",
              "Parse environment files and review variable names and values.",
              "Format YAML before reviewing configuration changes.",
              "Convert JSON to YAML when a configuration workflow expects YAML.",
              "Convert YAML to JSON for debugging, scripts, and API workflows.",
              "Create cron expressions for scheduled jobs and automation.",
              "Read cron schedules before adding or changing automation tasks.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* WHY MATTERS */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900">
            How to Interpret DevOps Tool Results
          </h2>

          <div className="mt-5 space-y-4 text-gray-600 leading-relaxed">
            <p>
              DevOps workflows often depend on small configuration files
              that control containers, services, environments, deployments,
              scheduled jobs, and infrastructure behaviour.
            </p>

            <p>
              A file can be valid YAML and still be wrong for Docker,
              Kubernetes, or the target environment. Review references, secrets,
              ports, volumes, permissions, image tags, schedules, and runtime
              behaviour before production use.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-6 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                How should I choose between similar DevOps tools?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Start with the exact task: format, parse, convert, validate,
                generate, or interpret. Similar tools are separated because
                those operations answer different questions.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does valid YAML mean a Docker or Kubernetes file is correct?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Valid YAML only confirms the syntax. The file may still
                contain unsupported fields, missing resources, incorrect names,
                unavailable images, or environment-specific problems.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can a cron expression be valid but still run at the wrong time?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Time zones, daylight-saving changes, scheduler
                differences, and day-of-month or day-of-week behaviour can
                change when a job actually runs.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Do browser-based checks replace deployment testing?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. They help with focused checks, formatting, and
                conversions. Production deployments still need staging tests,
                logs, monitoring, backups, access controls, and rollback plans.
              </p>
            </div>
          </div>
        </section>

        {/* RELATED */}
        <section className="mt-16 border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-semibold text-gray-900">
            Continue Exploring Yoryantra
          </h2>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/categories/devops-tools"
              className="yoryantra-btn-outline"
            >
              DevOps Tools
            </Link>

            <Link
              href="/developers"
              className="yoryantra-btn-outline"
            >
              For Developers
            </Link>

            <Link
              href="/categories/developer-tools"
              className="yoryantra-btn-outline"
            >
              Developer Tools
            </Link>

            <Link
              href="/categories/json-tools"
              className="yoryantra-btn-outline"
            >
              JSON & Data Tools
            </Link>

            <Link
              href="/categories/security-tools"
              className="yoryantra-btn-outline"
            >
              Security Tools
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
