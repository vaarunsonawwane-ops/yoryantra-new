import { tools } from "@/app/data/tools";

export default function sitemap() {
  const baseUrl = "https://yoryantra.com";

  const toolPages = tools.map((tool) => ({
    url: `${baseUrl}${tool.href}`,
    lastModified: new Date(),
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },

    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
    },

    ...toolPages,
  ];
}