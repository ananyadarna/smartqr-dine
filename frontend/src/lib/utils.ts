/**
 * Sanitizes a URL by trimming spaces, removing double-pasted protocols,
 * removing trailing typos (like a trailing "https" or "http"), and ensuring
 * a correct protocol prefix.
 */
export const sanitizeURL = (url: string): string => {
  if (!url) return "";

  // Clean up whitespace
  let cleanUrl = url.trim();

  // Clean up double pasted URLs (e.g. "domain.comhttps://domain.com")
  const doublePasteMatch = cleanUrl.match(/^(https?:\/\/[^\/]+)(https?:\/\/)/);
  if (doublePasteMatch) {
    cleanUrl = doublePasteMatch[1];
  }

  // Remove trailing slashes first so we can match trailing typos
  cleanUrl = cleanUrl.replace(/\/+$/, "");

  // Remove trailing http/https typos (e.g. "domain.comhttps" -> "domain.com")
  cleanUrl = cleanUrl.replace(/^(https?:\/\/)?([^\/]+)https?$/, "$1$2");

  // Ensure protocol prefix
  if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
    cleanUrl = "https://" + cleanUrl;
  }

  return cleanUrl;
};
