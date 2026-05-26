import ToolClient from "./ToolClient";

export const metadata = {
  title: "Nginx Config Validator | Check Nginx Configuration Online | Yoryantra",

  description:
    "Check Nginx configuration snippets for common syntax issues, missing braces, duplicate directives, server blocks, proxy settings, and basic Nginx config mistakes.",

  keywords: [
    "nginx config validator",
    "nginx configuration checker",
    "nginx config checker",
    "validate nginx config",
    "nginx syntax checker",
    "nginx server block checker",
    "nginx config linter",
    "devops tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/nginx-config-validator",
  },

  openGraph: {
    title: "Nginx Config Validator | Check Nginx Configuration Online | Yoryantra",

    description:
      "Check Nginx configuration snippets for common syntax issues, missing braces, duplicate directives, server blocks, proxy settings, and basic Nginx config mistakes.",

    url: "https://yoryantra.com/tools/nginx-config-validator",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Nginx Config Validator | Check Nginx Configuration Online | Yoryantra",

    description:
      "Check Nginx configuration snippets for common syntax issues, missing braces, duplicate directives, server blocks, proxy settings, and basic Nginx config mistakes.",
  },
};

export default function NginxConfigValidatorPage() {
  return <ToolClient />;
}
