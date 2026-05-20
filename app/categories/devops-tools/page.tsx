import Link from "next/link";
import { tools } from "@/app/data/tools";
import InfoCard from "@/app/components/InfoCard";

const devopsTools = tools.filter(
  (tool) => tool.category === "DevOps Tools"
);

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
    canonical: "https://yoryantra.com/categories/devops-tools",
  },

  openGraph: {
    title: "DevOps Tools Online Free | Yoryantra",

    description:
      "Free online DevOps utilities for Docker, Kubernetes, YAML, .env files, cron expressions, and infrastructure configuration.",

    url: "https://yoryantra.com/categories/devops-tools",

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
	  
{/* BREADCRUMB */}
<div className="mb-8 flex items-center text-sm text-gray-500">

  <Link
    href="/"
    className="hover:!text-[var(--light-gold)] transition-colors duration-200"
  >
    Home
  </Link>

  <span className="mx-2">/</span>

  <Link
    href="/categories"
    className="hover:!text-[var(--light-gold)] transition-colors duration-200"
  >
    Categories
  </Link>

  <span className="mx-2">/</span>

  <span className="text-gray-900">
    DevOps Tools
  </span>

</div>
	  
        {/* HERO */}
        <div className="max-w-3xl">
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            DevOps Tools for Containers, YAML, and Configuration Workflows
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            Use practical DevOps utilities to validate Docker Compose files,
            check Kubernetes YAML, parse .env files, format configuration data,
            and build cron expressions for scheduled jobs.
          </p>
        </div>

		{/* INTRO */}
		<div className="mt-12 grid gap-6 md:grid-cols-3">
		<InfoCard
		  title="Catch Configuration Problems Before Deployment"
		  description="Small mistakes inside YAML, Docker Compose files, manifests, environment variables, or infrastructure settings can create frustrating deployment issues later."
		/>

		<InfoCard
		  title="Built for Fast Infrastructure Checks"
		  description="Instead of digging through logs or switching between tools, quickly validate, inspect, and troubleshoot common DevOps-related formats and configurations."
		/>

		<InfoCard
		  title="Useful During Setup, Debugging, and Releases"
		  description="Whether you are configuring containers, APIs, CI/CD workflows, infrastructure, or deployments, these tools help reduce avoidable mistakes before production."
		/>
		</div>

        {/* FEATURED TOOLS */}
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

        {/* ALL TOOLS */}
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
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[var(--light-gold)]">
                  {tool.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {tool.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

		{/* USE CASES */}
		<SectionCard>
		  <h2 className="text-2xl font-semibold text-gray-900">
			Everyday Infrastructure Tasks These Tools Help Simplify
		  </h2>

		  <p className="mt-3 max-w-3xl text-gray-600 leading-relaxed">
			A lot of deployment issues begin with small configuration mistakes —
			invalid YAML, incorrect environment variables, broken manifests, or tiny
			formatting problems that are easy to miss. These tools are designed for the
			quick checks teams often do before shipping changes.
		  </p>

		  <div className="mt-8 grid gap-4 md:grid-cols-2">
			{[
			  "Review Docker Compose files before containers fail to start.",
			  "Validate Kubernetes manifests during setup or troubleshooting.",
			  "Check environment variables when configuration feels off.",
			  "Clean or format YAML before deployment and infrastructure changes.",
			  "Move between JSON and YAML formats during integrations or setup.",
			  "Generate cron expressions for scheduled jobs and automation.",
			  "Inspect service and infrastructure configuration more quickly.",
			  "Catch small deployment mistakes before they become production issues.",
			].map((item) => (
			  <SectionMiniCard key={item}>
				<p className="text-sm leading-relaxed text-gray-700">
				  {item}
				</p>
			  </SectionMiniCard>
			))}
		  </div>
		</SectionCard>

        {/* WHY MATTERS */}
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

        {/* FAQ */}
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

        {/* RELATED CATEGORIES */}
        <section className="mt-16 border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-semibold text-gray-900">
            Related Tool Categories
          </h2>

          <div className="mt-5 flex flex-wrap gap-3">
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

            <Link
              href="/categories/encoding-tools"
              className="yoryantra-btn-outline"
            >
              Encoding Tools
            </Link>

            <Link
              href="/categories/seo-tools"
              className="yoryantra-btn-outline"
            >
              SEO Tools
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
