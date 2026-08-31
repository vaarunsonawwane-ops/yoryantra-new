import ToolClient from "./ToolClient";

export const metadata = {
  title: "Nginx Config Validator | Static Nginx Inspector | Yoryantra",
  description:
    "Statically inspect Nginx configuration snippets for braces, semicolons, block structure, common directive mistakes, and proxy configuration issues.",
  alternates: {
    canonical: "https://yoryantra.com/tools/nginx-config-validator",
  },
  openGraph: {
    title: "Nginx Config Validator | Static Nginx Inspector | Yoryantra",
    description:
      "Statically inspect Nginx configuration snippets for braces, semicolons, block structure, common directive mistakes, and proxy configuration issues.",
    url: "https://yoryantra.com/tools/nginx-config-validator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nginx Config Validator | Static Nginx Inspector | Yoryantra",
    description:
      "Statically inspect Nginx configuration snippets for braces, semicolons, block structure, common directive mistakes, and proxy configuration issues.",
  },
};

export default function Page() {
  return <ToolClient />;
}
