import Link from "next/link";

const featuredCategories = [
  {
    title: "DevOps Tools",
    description:
      "Docker, Kubernetes, YAML, .env files, cron expressions, and infrastructure utilities.",
    href: "/categories/devops-tools",
  },
  {
    title: "Developer Utilities",
    description:
      "Debugging, timestamps, UUIDs, API checks, and daily developer workflows.",
    href: "/categories/developer-tools",
  },
  {
    title: "JSON & Data Tools",
    description:
      "JSON formatting, validation, YAML conversion, schema checks, and structured data.",
    href: "/categories/json-tools",
  },
  {
    title: "Security Tools",
    description:
      "Tokens, hashes, keys, CSP headers, signatures, and authentication utilities.",
    href: "/categories/security-tools",
  },
];

const popularDevopsTools = [
  {
    title: "Docker Compose Validator",
    description:
      "Validate Docker Compose YAML files before running container stacks.",
    href: "/tools/docker-compose-validator",
  },
  {
    title: "Kubernetes YAML Validator",
    description:
      "Check Kubernetes manifests for YAML and configuration issues.",
    href: "/tools/kubernetes-yaml-validator",
  },
  {
    title: ".env File Parser",
    description:
      "Parse environment variables into readable structured output.",
    href: "/tools/env-file-parser",
  },
  {
    title: "YAML Formatter",
    description:
      "Format YAML files used in configuration and infrastructure workflows.",
    href: "/tools/yaml-formatter",
  },
  {
    title: "JSON to YAML Converter",
    description:
      "Convert JSON data into readable YAML configuration files.",
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
      "Build cron expressions for scheduled jobs and automation workflows.",
    href: "/tools/cron-expression-generator",
  },
  {
    title: "Cron Expression Parser",
    description:
      "Read cron expressions and understand recurring schedules.",
    href: "/tools/cron-expression-parser",
  },
];

export const metadata = {
  title: "DevOps Resources for Docker, Kubernetes, YAML, and Automation | Yoryantra",

  description:
    "Explore practical DevOps resources and free online tools for Docker Compose, Kubernetes YAML, .env files, YAML formatting, cron expressions, JSON to YAML conversion, and infrastructure configuration.",

  keywords: [
    "devops resources",
    "devops tools",
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
    title: "DevOps Resources for Docker, Kubernetes, YAML, and Automation | Yoryantra",

    description:
      "Practical DevOps resources and free tools for Docker Compose, Kubernetes YAML, .env files, YAML formatting, cron expressions, and infrastructure configuration.",

    url: "https://yoryantra.com/devops-resources",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "DevOps Resources for Docker, Kubernetes, YAML, and Automation | Yoryantra",

    description:
      "Explore free DevOps tools and resources for Docker, Kubernetes, YAML, .env files, cron expressions, and deployment workflows.",
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
            DevOps Resources for Docker, Kubernetes, YAML, and Automation
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            Explore practical DevOps resources and browser-based utilities for
            Docker Compose validation, Kubernetes YAML checks, .env parsing,
            YAML formatting, cron expressions, configuration conversion, and
            infrastructure workflows before deployment.
          </p>
        </div>

        {/* INTRO */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Built for Configuration Checks
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Validate Docker Compose files, check Kubernetes manifests, format
              YAML, parse environment variables, and review configuration files
              before they slow down deployments.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Useful Before Deployment
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              DevOps issues often come from small syntax or configuration
              mistakes. These resources help catch simple problems during local
              development and release preparation.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Practical Browser-Based Utilities
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Yoryantra keeps infrastructure utilities lightweight and focused
              so configuration checks can happen quickly without installing
              extra software.
            </p>
          </div>
        </div>

        {/* FEATURED CATEGORIES */}
        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              DevOps-Related Tool Categories
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Start with categories that support configuration, structured data,
              deployment checks, security values, and developer workflows.
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
              Popular DevOps Tools
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Frequently used utilities for Docker Compose, Kubernetes YAML,
              environment variables, YAML formatting, conversion, automation,
              and scheduled jobs.
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
            Common DevOps Workflows
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              "Validating Docker Compose files before running containers.",
              "Checking Kubernetes YAML manifests before applying changes.",
              "Parsing .env files and reviewing environment variables.",
              "Formatting YAML used in infrastructure configuration.",
              "Converting JSON into YAML for configuration workflows.",
              "Converting YAML back into JSON for debugging and automation.",
              "Creating cron expressions for scheduled jobs.",
              "Reading cron schedules before adding automation tasks.",
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
            Why DevOps Resources Matter
          </h2>

          <div className="mt-5 space-y-4 text-gray-600 leading-relaxed">
            <p>
              DevOps work often depends on compact configuration files that
              control containers, services, environments, deployments,
              scheduled jobs, and infrastructure behavior.
            </p>

            <p>
              Small mistakes in YAML, Docker Compose, Kubernetes manifests,
              environment variables, or cron expressions can create deployment
              problems. Practical DevOps resources make it easier to review
              these files before they reach production.
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
                What are DevOps resources used for?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                DevOps resources help developers and infrastructure teams review
                configuration files, validate deployment settings, manage
                environment variables, and prepare automation workflows.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are these tools useful for Docker and Kubernetes?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Docker Compose Validator and Kubernetes YAML Validator help
                review container and orchestration configuration before use.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can these tools help with YAML configuration?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. YAML Formatter, JSON to YAML Converter, YAML to JSON
                Converter, Docker Compose Validator, and Kubernetes YAML
                Validator all support YAML-related workflows.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Do these tools replace full deployment testing?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. These tools help with quick checks and formatting, but
                production deployments still need proper testing, logs,
                monitoring, backups, and infrastructure review.
              </p>
            </div>
          </div>
        </section>

        {/* RELATED */}
        <section className="mt-16 border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-semibold text-gray-900">
            Related Pages
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
              Developers
            </Link>

            <Link
              href="/categories/developer-tools"
              className="yoryantra-btn-outline"
            >
              Developer Utilities
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
