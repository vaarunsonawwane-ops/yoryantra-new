import Link from "next/link";
import { tools } from "@/app/data/tools";
import InfoCard from "@/app/components/InfoCard";
import SectionCard from "@/app/components/SectionCard";

const devopsTools = tools.filter((tool) => tool.category === "DevOps Tools");

export const metadata = {
  title: "DevOps Tools for Docker, Kubernetes, DNS, and Config | Yoryantra",
  description:
    "Review Docker Compose, Kubernetes, cron, DNS, CIDR, environment variables, GitHub Actions, Nginx, and deployment configuration before runtime.",
  alternates: {
    canonical: "https://yoryantra.com/categories/devops-tools",
  },
  openGraph: {
    title: "DevOps Tools for Docker, Kubernetes, DNS, and Config | Yoryantra",
    description:
      "Static configuration checks for Docker, Kubernetes, cron, DNS, CIDR, environment files, GitHub Actions, and Nginx.",
    url: "https://yoryantra.com/categories/devops-tools",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevOps Tools for Docker, Kubernetes, DNS, and Config | Yoryantra",
    description:
      "Inspect deployment configuration before runtime across Docker, Kubernetes, cron, DNS, networking, CI, and Nginx.",
  },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-center text-sm text-gray-500">
          <Link href="/" className="hover:!text-[var(--light-gold)] transition-colors duration-200">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/categories" className="hover:!text-[var(--light-gold)] transition-colors duration-200">Categories</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">DevOps Tools</span>
        </div>

        <div className="max-w-4xl">
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            DevOps Tools for Configuration You Can Inspect Before Runtime
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            Infrastructure configuration has a useful pre-runtime layer. Docker
            Compose files, Kubernetes manifests, GitHub Actions workflows,
            environment assignments, Nginx rules, cron expressions, DNS answers,
            and CIDR ranges can all reveal problems before a deployment or incident
            turns them into runtime symptoms.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <InfoCard
            title="Parsing comes before platform validation"
            description="A file must first be syntactically readable, but valid YAML alone says nothing about Kubernetes schemas, Compose semantics, or policy enforcement."
          />
          <InfoCard
            title="Declared state is not observed state"
            description="A manifest can describe ports, images, requests, limits, or dependencies without proving that a cluster, runner, resolver, or host will make them work."
          />
          <InfoCard
            title="Precedence changes outcomes"
            description="Environment interpolation, DNS caches, Nginx matching, cron fields, image tags, and configuration defaults can all make apparently similar inputs behave differently."
          />
        </div>

        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">All DevOps Tools</h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              The 32 tools cover Docker Compose, Dockerfiles, Kubernetes, environment
              variables, YAML validation and conversion, cron, DNS, CIDR, GitHub
              Actions, and Nginx configuration.
            </p>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {devopsTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[var(--light-gold)]">{tool.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{tool.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <SectionCard>
          <h2 className="text-2xl font-semibold text-gray-900">
            A Configuration Travels Through More Than One Layer
          </h2>
          <div className="mt-6 space-y-6 text-gray-600 leading-relaxed">
            <div>
              <h3 className="font-semibold text-gray-900">1. Text and syntax</h3>
              <p className="mt-2">
                YAML, dotenv assignments, cron fields, CIDR notation, and Nginx snippets
                must first be parseable. Syntax checks are useful because later tools
                cannot reason reliably about malformed input.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">2. Configuration semantics</h3>
              <p className="mt-2">
                Once parsed, relationships start to matter: a Service port must map to
                something meaningful, resource requests and limits can conflict, Compose
                mounts can target the same path, and environment values can resolve from
                several sources.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">3. Runtime and policy</h3>
              <p className="mt-2">
                The final outcome belongs to the live platform. Kubernetes admission,
                CRDs, scheduler capacity, registry access, secrets, storage classes,
                repository permissions, runner state, Docker host settings, and network
                policy are not visible in a pasted configuration alone.
              </p>
            </div>
          </div>
        </SectionCard>

        <section className="mt-16 max-w-4xl">
          <h2 className="text-2xl font-semibold text-gray-900">
            What These Checks Can Narrow Down Before You Touch Production
          </h2>
          <div className="mt-5 space-y-5 text-gray-600 leading-relaxed">
            <p>
              Docker-related tools can expose port collisions, risky host mounts,
              dependency relationships, Dockerfile instruction concerns, and Compose
              interpolation problems. Kubernetes tools can inventory resources, trace
              images, map Service ports, summarize manifests, and review declared CPU
              or memory constraints.
            </p>
            <p>
              DNS and networking tools answer a different class of question. Resolver
              comparisons show what selected public resolvers currently return; CIDR
              calculators explain address boundaries mathematically. Neither proves the
              path a specific client, corporate resolver, or network appliance will take.
            </p>
            <p>
              YAML formatting itself is intentionally not in this category. The standalone
              YAML Formatter belongs to JSON & Data Tools because reformatting data is a
              representation task. YAML validation and YAML/JSON conversion remain here
              where they support deployment-oriented workflows.
            </p>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900">Primary Platform References</h2>
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <a href="https://docs.docker.com/reference/compose-file/" target="_blank" rel="noreferrer" className="font-semibold text-[var(--green)] underline underline-offset-4">
                Docker Compose file reference
              </a>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Defines the Compose model behind services, volumes, networks, ports, environment values, and dependencies.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <a href="https://kubernetes.io/docs/reference/kubernetes-api/" target="_blank" rel="noreferrer" className="font-semibold text-[var(--green)] underline underline-offset-4">
                Kubernetes API reference
              </a>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Documents built-in resource fields and semantics that static manifest checks need to interpret carefully.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <a href="https://docs.github.com/en/actions/reference/workflows-and-actions" target="_blank" rel="noreferrer" className="font-semibold text-[var(--green)] underline underline-offset-4">
                GitHub Actions reference
              </a>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Covers workflow triggers, jobs, permissions, expressions, matrices, and action behavior used by CI checks.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-16 border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-semibold text-gray-900">Related Tool Categories</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/categories/json-tools" className="yoryantra-btn-outline">JSON & Data Tools</Link>
            <Link href="/categories/developer-tools" className="yoryantra-btn-outline">Developer Tools</Link>
            <Link href="/categories/security-tools" className="yoryantra-btn-outline">Security Tools</Link>
            <Link href="/categories/encoding-tools" className="yoryantra-btn-outline">Encoding Tools</Link>
            <Link href="/categories/seo-tools" className="yoryantra-btn-outline">SEO Tools</Link>
          </div>
        </section>
      </section>
    </main>
  );
}
