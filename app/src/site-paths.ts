/** All local URLs include Vite's configured deployment subpath. */
export const BASE_PATH = import.meta.env.BASE_URL;
export const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://yallarideapp.github.io/automalljo").replace(/\/+$/, "");
export type SiteLanguage = "en" | "ar";
export const assetPath = (path: string) => BASE_PATH + path.replace(/^\/+/, "");
export function sitePath(page = "", lang: SiteLanguage = "en") {
  const clean = page.replace(/^\/+|\/+$/g, "");
  return BASE_PATH + (lang === "ar" ? "ar/" : "") + (clean ? clean + "/" : "");
}
export const absoluteAsset = (path: string) => SITE_URL + "/" + path.replace(/^\/+/, "");
export function canonicalUrl(page = "", lang: SiteLanguage = "en") {
  const clean = page.replace(/^\/+|\/+$/g, "");
  return SITE_URL + "/" + (lang === "ar" ? "ar/" : "") + (clean ? clean + "/" : "");
}
export function languageFromPath(pathname: string): SiteLanguage {
  const path = pathname.startsWith(BASE_PATH) ? "/" + pathname.slice(BASE_PATH.length) : pathname;
  return /^\/ar(?:\/|$)/.test(path) ? "ar" : "en";
}
export function localizedLinks(page: string, lang: SiteLanguage) {
  return [
    { rel: "canonical", href: canonicalUrl(page, lang) },
    { rel: "alternate", hrefLang: "en", href: canonicalUrl(page, "en") },
    { rel: "alternate", hrefLang: "ar", href: canonicalUrl(page, "ar") },
    { rel: "alternate", hrefLang: "x-default", href: canonicalUrl(page, "en") },
  ];
}
