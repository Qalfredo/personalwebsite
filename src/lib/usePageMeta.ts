import { useEffect } from "react";

const SITE_URL = "https://alfredoquintana.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;

interface PageMeta {
  /** Full document title, e.g. "Projects — Alfredo Quintana". */
  title: string;
  /** Meta description / og:description / twitter:description. */
  description: string;
  /** Path without domain, e.g. "/about". Used for canonical + og:url. */
  path: string;
  /** Absolute OG image URL. Defaults to the site-wide card. */
  image?: string;
  /** og:type — "website" (default) or "article" for posts. */
  type?: "website" | "article";
}

/** Ensures a <meta>/<link> tag with the given selector exists, then sets its value. */
const setTag = (
  selector: string,
  create: () => HTMLElement,
  attr: string,
  value: string,
) => {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
};

const setMetaName = (name: string, value: string) =>
  setTag(
    `meta[name="${name}"]`,
    () => {
      const m = document.createElement("meta");
      m.setAttribute("name", name);
      return m;
    },
    "content",
    value,
  );

const setMetaProp = (property: string, value: string) =>
  setTag(
    `meta[property="${property}"]`,
    () => {
      const m = document.createElement("meta");
      m.setAttribute("property", property);
      return m;
    },
    "content",
    value,
  );

/**
 * Keeps the document title and social/SEO meta tags in sync with the current
 * route on the client. Crawlers that execute JS (e.g. Googlebot) pick this up;
 * non-JS crawlers rely on the per-route static HTML emitted by scripts/prerender.mjs.
 */
export const usePageMeta = ({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  type = "website",
}: PageMeta) => {
  useEffect(() => {
    const url = `${SITE_URL}${path}`;

    document.title = title;
    setMetaName("description", description);

    setMetaProp("og:title", title);
    setMetaProp("og:description", description);
    setMetaProp("og:url", url);
    setMetaProp("og:type", type);
    setMetaProp("og:image", image);

    setMetaName("twitter:title", title);
    setMetaName("twitter:description", description);
    setMetaName("twitter:image", image);

    setTag(
      'link[rel="canonical"]',
      () => {
        const l = document.createElement("link");
        l.setAttribute("rel", "canonical");
        return l;
      },
      "href",
      url,
    );
  }, [title, description, path, image, type]);
};
