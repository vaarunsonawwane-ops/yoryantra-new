import Link from "next/link";

const layers = [
  {
    number: "01",
    title: "Syntax",
    text: "Can the text be parsed as YAML, dotenv, a cron expression, or another expected format? Syntax is the first gate, not the final verdict.",
  },
  {
    number: "02",
    title: "Platform structure",
    text: "Are the fields, resource kinds, ports, dependencies, runners, or directives meaningful for Docker, Kubernetes, GitHub Actions, or Nginx?",
  },
  {
    number: "03",
    title: "Resolution and precedence",
    text: "Which environment source wins? What does interpolation produce? Which image tag, namespace, service target, or variable value is actually selected?",
  },
  {
    number: "04",
    title: "Runtime behavior",
    text: "Can the image pull, the service start, the DNS name resolve, the workload schedule, and the application stay healthy in the real environment?",
  },
];

const workflowCards = [
  {
    title: "Docker Compose",
    text: "Review services, ports, volumes, dependencies, and environment resolution before the stack is started.",
    links: [
      { label: "Compose Validator", href: "/tools/docker-compose-validator" },
      { label: "Ports Checker", href: "/tools/docker-compose-ports-checker" },
      { label: "Volume Checker", href: "/tools/docker-compose-volume-checker" },
      { label: "Environment Resolver", href: "/tools/docker-compose-environment-variable-resolver" },
    ],
  },
  {
    title: "Kubernetes manifests",
    text: "Separate manifest parsing from workload relationships, image choices, service routing, and resource requests or limits.",
    links: [
      { label: "YAML Validator", href: "/tools/kubernetes-yaml-validator" },
      { label: "Resource Summarizer", href: "/tools/kubernetes-yaml-resource-summarizer" },
      { label: "Service Port Mapper", href: "/tools/kubernetes-service-port-mapper" },
      { label: "Requests & Limits Checker", href: "/tools/kubernetes-resource-requests-limits-checker" },
    ],
  },
  {
    title: "Automation and edge configuration",
    text: "Check CI matrices, Nginx redirects, cron schedules, DNS answers, and environment differences as their own configuration problems.",
    links: [
      { label: "GitHub Actions Validator", href: "/tools/github-actions-yaml-validator" },
      { label: "Nginx Redirect Tester", href: "/tools/nginx-redirect-rule-tester" },
      { label: "Cron Expression Validator", href: "/tools/cron-expression-validator" },
      { label: "Environment Diff Checker", href: "/tools/environment-variable-diff-checker" },
    ],
  },
];

export const metadata = {
  title: "DevOps Configuration Workflows for Docker, Kubernetes, CI, and Nginx | Yoryantra",
  description:
    "Review DevOps configuration in layers: syntax, platform structure, variable resolution, and runtime behavior across Docker, Kubernetes, CI, Nginx, cron, and DNS.",
  alternates: {
    canonical: "https://yoryantra.com/devops-resources",
  },
  openGraph: {
    title: "DevOps Configuration Workflows | Yoryantra",
    description:
      "Practical guidance for Docker, Kubernetes, CI, Nginx, environment variables, cron, and DNS without confusing static validation with runtime truth.",
    url: "https://yoryantra.com/devops-resources",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevOps Configuration Workflows | Yoryantra",
    description:
      "Read configuration in layers before trusting Docker, Kubernetes, CI, Nginx, cron, or DNS behavior.",
  },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-center text-sm text-gray-500">
          <Link href="/" className="transition-colors duration-200 hover:!text-[var(--light-gold)]">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">DevOps Resources</span>
        </div>

        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-950 md:text-5xl">
            Valid Configuration Is Not the Same as a Working Deployment
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            DevOps files are read by several systems before anything actually
            runs. YAML can parse while a Compose service is still wrong. A
            Kubernetes manifest can look reasonable while a Service selects the
            wrong workload. A CI workflow can be syntactically valid while its
            permissions, matrix, or secrets fail at runtime. The useful habit is
            to review configuration in layers.
          </p>
        </div>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900">Four Layers of Configuration Review</h2>
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            {layers.map((layer) => (
              <div key={layer.number} className="self-start rounded-2xl border border-gray-200 bg-gray-50 p-6">
                <div className="flex items-start gap-4">
                  <span className="pt-1 text-xs font-semibold tracking-wider text-[var(--green)]">{layer.number}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{layer.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600">{layer.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-18 rounded-2xl border border-gray-200 bg-white p-7 shadow-sm md:p-9">
          <h2 className="text-2xl font-semibold text-gray-900">
            Why YAML Validation Comes First, Not Last
          </h2>
          <div className="mt-5 space-y-4 leading-8 text-gray-600">
            <p>
              YAML only describes the serialization format. It does not know
              whether <code>imagePullPolicy</code> is appropriate, whether a
              Compose volume target is risky, whether a GitHub Actions job has
              enough permissions, or whether an Nginx rule creates a redirect
              loop. Platform-aware checks need to happen after parsing.
            </p>
            <p>
              The reverse mistake also matters: platform-specific analysis is
              unreliable if the underlying document is malformed. When a tool
              surfaces a YAML or dotenv parsing error, fix that first so later
              warnings are based on the structure you intended.
            </p>
          </div>
        </section>

        <section className="mt-18">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">Work Through the System You Are Configuring</h2>
            <p className="mt-3 leading-7 text-gray-600">
              These tool groups follow platform-specific questions rather than
              treating every configuration file as generic YAML.
            </p>
          </div>
          <div className="mt-7 grid gap-6 lg:grid-cols-3">
            {workflowCards.map((card) => (
              <div key={card.title} className="self-start rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">{card.text}</p>
                <div className="mt-5 flex flex-col gap-2">
                  {card.links.map((link) => (
                    <Link key={link.href} href={link.href} className="text-sm font-semibold text-[var(--light-gold)] hover:underline">
                      {link.label} →
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-18 max-w-5xl">
          <h2 className="text-2xl font-semibold text-gray-900">
            Precedence Is Often the Bug
          </h2>
          <div className="mt-5 space-y-4 leading-8 text-gray-600">
            <p>
              Environment variables are a good example. A value may exist in a
              shell, a project <code>.env</code> file, a Compose interpolation
              source, a service-level <code>environment</code> block, or an
              injected deployment secret. The file you are looking at may not be
              the source that wins.
            </p>
            <p>
              Similar precedence problems appear in image tags, namespace
              defaults, Nginx location matching, DNS caches, and CI matrices.
              When two environments behave differently, compare resolved values
              and effective configuration instead of only comparing source files.
            </p>
          </div>
        </section>

        <section className="mt-18 border-t border-gray-200 pt-10">
          <h2 className="text-xl font-semibold text-gray-900">Finish With the Platform&apos;s Own Validation</h2>
          <p className="mt-3 max-w-4xl leading-7 text-gray-600">
            Browser checks are useful before deployment, but the final authority
            is the system that will run the configuration. Use the platform&apos;s
            own validation, dry-run, rendering, or test commands where available.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold">
            <a href="https://docs.docker.com/reference/compose-file/" target="_blank" rel="noreferrer" className="text-[var(--green)] underline underline-offset-4">Docker Compose file reference ↗</a>
            <a href="https://kubernetes.io/docs/reference/kubernetes-api/" target="_blank" rel="noreferrer" className="text-[var(--green)] underline underline-offset-4">Kubernetes API reference ↗</a>
            <a href="https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax" target="_blank" rel="noreferrer" className="text-[var(--green)] underline underline-offset-4">GitHub Actions workflow syntax ↗</a>
            <a href="https://nginx.org/en/docs/" target="_blank" rel="noreferrer" className="text-[var(--green)] underline underline-offset-4">Nginx documentation ↗</a>
          </div>
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/categories/devops-tools" className="yoryantra-btn-outline">Browse DevOps Tools</Link>
          <Link href="/json-guides" className="yoryantra-btn-outline">JSON & Data Guides</Link>
          <Link href="/resources" className="yoryantra-btn-outline">All Resource Guides</Link>
        </div>
      </section>
    </main>
  );
}
