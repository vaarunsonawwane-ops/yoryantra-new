import Link from "next/link";

const workflowCards = [
  {
    title: "Docker Compose",
    text: "Ensure you understand what services, ports, volumes, dependencies and environment resolution your compose has.",
    links: [
      { label: "Compose Validator", href: "/tools/docker-compose-validator" },
      { label: "Ports Checker", href: "/tools/docker-compose-ports-checker" },
      { label: "Volume Checker", href: "/tools/docker-compose-volume-checker" },
      { label: "Environment Resolver", href: "/tools/docker-compose-environment-variable-resolver" },
    ],
  },
  {
    title: "Kubernetes manifests",
    text: "Ensure you understand how you have parsed your manifests, what workloads you have, what images you are using, what ports are being used for your services and if you have any resource requests/limits.",
    links: [
      { label: "YAML Validator", href: "/tools/kubernetes-yaml-validator" },
      { label: "Resource Summarizer", href: "/tools/kubernetes-yaml-resource-summarizer" },
      { label: "Service Port Mapper", href: "/tools/kubernetes-service-port-mapper" },
      { label: "Requests & Limits Checker", href: "/tools/kubernetes-resource-requests-limits-checker" },
    ],
  },
  {
    title: "Automation and edge configuration",
    text: "Ensure you understand what you have within your CI matrices, Nginx redirects, cron jobs, DNS responses and environment differences.",
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
          <Link href="/" className="transition-colors duration-200 hover:!text-[var(--gold-text)]">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">DevOps Resources</span>
        </div>

        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-950 md:text-5xl">
            A valid configuration does not necessarily mean it will work.
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            There are a number of different systems that consume DevOps files. 
			YAML can be valid, but you may have an invalid Compose service. 
			Kubernetes manifests can be valid, but there may be an issue with 
			the service pointing to the wrong workloads. CI workflows  
            can be valid, but you could have permission, matrix or secret issues. 
			It can be useful to look into each layer of configuration.
          </p>
        </div>

        <section className="mt-18 rounded-2xl border border-gray-200 bg-white p-7 shadow-sm md:p-9">
          <h2 className="text-2xl font-semibold text-gray-900">
            Why YAML Validation is Important
          </h2>
          <div className="mt-5 space-y-4 leading-8 text-gray-600">
            <p>
              YAML validation has nothing to do with knowing if imagePullPolicy 
			  is a good choice, a Compose volume target is dangerous, a 
			  GitHub Actions job has sufficient permissions or if Nginx rules
              cause a redirect loop. This requires platform specific validation.
            </p>
            <p>
              Also, it's easy to get this the wrong way around. If the document
			  is invalid then platform specific analysis will fail. So always fix 
			  any YAML or dotenv parsing errors first.
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
              <div key={card.title} className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">{card.text}</p>
                <div className="mt-auto flex flex-col gap-2 pt-5">
                  {card.links.map((link) => (
                    <Link key={link.href} href={link.href} className="text-sm font-semibold text-[var(--gold-text)] hover:underline">
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
            When your settings are not working
          </h2>
          <div className="mt-5 space-y-4 leading-8 text-gray-600">
            <p>
              Sometimes when you change something in your .env file it doesn't 
			  do anything. This could be because it is stored somewhere else 
			  too like Docker or your server.
            </p>
            <p>
              To figure out what the value is that is being used in your application
			  this can help you see why it is working on your computer but not on your server.
            </p>
          </div>
        </section>

        <section className="mt-18 border-t border-gray-200 pt-10">
          <h2 className="text-xl font-semibold text-gray-900">Finish With the Platform&apos;s Own Validation</h2>
          <p className="mt-3 max-w-4xl leading-7 text-gray-600">
            While browser based checks can be useful, the final validation 
			comes from the system that will actually run this configuration. 
			Where possible use the platforms built-in validation, dry run, 
			render or test commands.
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
