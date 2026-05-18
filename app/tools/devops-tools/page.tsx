import Link from "next/link";

const devopsTools = [
  {
    title: "Docker Compose Validator",
    description:
      "Validate Docker Compose YAML files before running container stacks.",
    href: "/tools/docker-compose-validator",
  },
  {
    title: "Kubernetes YAML Validator",
    description:
      "Check Kubernetes manifests for required fields and YAML issues.",
    href: "/tools/kubernetes-yaml-validator",
  },
  {
    title: ".env File Parser",
    description:
      "Parse environment variables into readable JSON for debugging.",
    href: "/tools/env-file-parser",
  },
  {
    title: "YAML Formatter",
    description:
      "Format YAML files for configuration, DevOps, and infrastructure work.",
    href: "/tools/yaml-formatter",
  },
  {
    title: "JSON to YAML Converter",
    description:
      "Convert JSON data into readable YAML configuration.",
    href: "/tools/json-to-yaml-converter",
  },
  {
    title: "YAML to JSON Converter",
    description:
      "Convert YAML configuration into structured JSON output.",
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
      "Read cron expressions and understand recurring schedules.",
    href: "/tools/cron-expression-parser",
  },
];

const featuredTools = devopsTools.slice(0, 6);

export const metadata = {
  title: "DevOps Tools Online Free | Yoryantra",

  description:
    "Use free online DevOps tools for Docker Compose validation, Kubernetes YAML checks, .env parsing, YAML formatting, cron expressions, and configuration workflows.",

  keywords: [
    "devops tools",
    "online devops tools",
    "docker compose validator",
    "kubernetes yaml validator",
    "yaml formatter",
    "env file parser",
    "cron expression generator",
    "configuration tools",
    "infrastructure tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/devops-tools",
  },

  openGraph: {
    title: "DevOps Tools Online Free | Yoryantra",

    description:
      "Free online DevOps utilities for Docker, Kubernetes, YAML, .env files, cron expressions, and infrastructure configuration.",

    url: "https://yoryantra.com/tools/devops-tools",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "DevOps Tools Online Free | Yoryantra",

    description:
      "Free online DevOps tools for configuration, containers, YAML, Kubernetes, Docker, and cron workflows.",
  },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--green)]">
            DevOps Tools
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            DevOps Tools for Containers, YAML, and Configuration Workflows
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            Use practical DevOps utilities to validate Docker Compose files,
            check Kubernetes YAML, parse .env files, format configuration data,
            and build cron expressions for scheduled jobs.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Built for Configuration Checks
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Review YAML, Docker Compose, Kubernetes manifests, and environment
              variables before they create deployment problems.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Useful Before Deployment
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              These tools help catch simple formatting and configuration issues
              during local development and release preparation.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Fast Browser-Based Utilities
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Most utilities run directly in your browser, making them quick to
              use while keeping configuration values private.
            </p>
          </div>
        </div>

        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              Popular DevOps Tools
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Start with common utilities for container configuration, YAML
              validation, environment variables, and automation schedules.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featuredTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[var(--green)]">
                  {tool.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {tool.description}
                </p>

                <span className="mt-5 inline-flex text-sm font-semibold text-[var(--green)]">
                  Open tool →
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              All DevOps Tools
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Browse utilities for infrastructure configuration, containers,
              YAML formatting, environment variables, and scheduled jobs.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {devopsTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="rounded-2xl border border-gray-200 bg-gray-50 p-6 transition hover:border-[var(--green)] hover:bg-white"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {tool.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {tool.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-2xl border border-gray-200 bg-gray-50 p-8">
          <h2 className="text-2xl font-semibold text-gray-900">
            Where These DevOps Tools Help
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              "Validating Docker Compose configuration before deployment.",
              "Checking Kubernetes YAML manifests during setup.",
              "Parsing .env files and reviewing environment variables.",
              "Formatting YAML used in infrastructure workflows.",
              "Converting JSON and YAML configuration formats.",
              "Creating cron expressions for automation jobs.",
              "Reviewing container and service configuration.",
              "Reducing simple deployment mistakes early.",
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

        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900">
            Why DevOps Utilities Matter
          </h2>

          <div className="mt-5 space-y-4 text-gray-600 leading-relaxed">
            <p>
              DevOps work often depends on small configuration files that control
              containers, services, environments, deployment jobs, and
              infrastructure behavior.
            </p>

            <p>
              Simple YAML mistakes, missing services, broken environment
              variables, or incorrect schedules can slow down deployments.
              Browser-based utilities make quick checks easier during daily
              development.
            </p>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-6 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What are DevOps tools used for?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                DevOps tools help with configuration, deployment preparation,
                container workflows, infrastructure files, automation, and
                environment management.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are these tools useful for Docker and Kubernetes?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. This category includes Docker Compose validation,
                Kubernetes YAML checks, YAML formatting, and environment file
                parsing.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Do these tools require installation?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. These tools are designed to work directly inside your
                browser for quick checks.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are configuration values uploaded?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Most Yoryantra utilities process inputs locally inside your
                browser unless a tool clearly needs an external URL check.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-16 border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-semibold text-gray-900">
            Related Tool Categories
          </h2>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/tools/developer-tools" className="yoryantra-btn-outline">
              Developer Utilities
            </Link>

            <Link href="/tools/json-tools" className="yoryantra-btn-outline">
              JSON & Data Tools
            </Link>

            <Link href="/tools/security-tools" className="yoryantra-btn-outline">
              Security Tools
            </Link>

            <Link href="/tools/encoding-tools" className="yoryantra-btn-outline">
              Encoding Tools
            </Link>

            <Link href="/tools/seo-tools" className="yoryantra-btn-outline">
              SEO Tools
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}