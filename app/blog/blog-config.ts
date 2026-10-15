/**
 * C10 release lock. Keep false until C11-C13 pass and C14 explicitly
 * authorizes publication of the first reviewed article.
 * Never derive this from NODE_ENV or an environment variable alone.
 */
export const BLOG_RELEASE_ENABLED = true;

/** Historical C8/C9-approved launch corpus: preserve in the strategy master.
 * Individual article publishing at C14 does not require all eight to go live at once.
 */
export const C9_LAUNCH_SLUGS = [
  "formdata-415-unsupported-media-type",
  "nested-json-to-formdata-arrays-objects",
  "formdata-multipart-boundary-troubleshooting",
  "cors-preflight-access-control-allow-headers",
  "robots-txt-allowed-but-not-indexed",
  "duplicate-without-user-selected-canonical",
  "valid-sitemap-not-indexed",
  "external-secrets-operator-vs-kubernetes-secrets",
] as const;

/** READY articles render only in local development preview, never production. */
export const BLOG_LOCAL_PREVIEW_ENABLED =
  process.env.NODE_ENV === "development" &&
  process.env.YORYANTRA_C10_PREVIEW === "1";
