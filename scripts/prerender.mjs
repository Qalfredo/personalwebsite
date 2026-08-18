// Post-build SEO prerender.
//
// This is a client-rendered Vite SPA, so the served HTML is the same shell for
// every route. Crawlers and link-preview bots that don't execute JS would see
// identical <title>/<meta> for every page. This script fixes that at the
// minimum-viable level the audit calls for: it copies the built dist/index.html
// into a per-route file and injects that route's own title, description, canonical,
// and Open Graph / Twitter tags into the *initial* HTML — no framework migration.
//
// It also emits sitemap.xml. Run automatically via the `postbuild` npm script.
//
// NOTE: post entries are duplicated from src/data/projects.ts on purpose — this
// script runs in plain Node and can't import the Vite `?raw` markdown modules.
// When you add or rename a post, update the `posts` array below.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, "..", "dist");
const SITE_URL = "https://alfredoquintana.com";
const OG_IMAGE = `${SITE_URL}/og-default.png`;

const escapeHtml = (s) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const posts = [
  {
    path: "/projects/ultravioleta-fraud-detection",
    title: "Ultravioleta: Making Invisible Fraud Visible",
    description:
      "How our team replaced a brittle rule-based heuristic with a real-time machine learning system at Ridery — and why the hardest part was never the model.",
  },
  {
    path: "/projects/osrm-production-deployment",
    title: "How We Cut Routing Costs by ~99% by Deploying OSRM",
    description:
      "A production guide to replacing Google Maps Distance Matrix with a self-hosted OSRM stack for ride-hailing workloads at scale.",
  },
];

const routes = [
  {
    path: "/",
    title: "Alfredo Quintana — Senior ML & Data Engineer",
    description:
      "Senior ML & Data Engineer building production ML and data systems at marketplace scale — pricing, fraud, routing, and payments. Founded a data team 0→8, saved $800K+/year, and now leads the engineering of a fintech product.",
    type: "website",
  },
  {
    path: "/about",
    title: "About — Alfredo Quintana",
    description:
      "Senior ML & Data Engineer. I built the data function at Ridery (0→8), replaced Google Maps routing for $800K+/year, shipped a real-time fraud system, and now lead engineering on Ridery Pay. B.Sc. Mathematics; 4+ years teaching data science.",
    type: "website",
  },
  {
    path: "/projects",
    title: "Projects & Writing — Alfredo Quintana",
    description:
      "Long-form write-ups on production ML and data engineering at marketplace scale — real-time fraud detection, self-hosted routing, and applied AI.",
    type: "website",
  },
  ...posts.map((p) => ({
    path: p.path,
    title: `${p.title} — Alfredo Quintana`,
    description: p.description,
    type: "article",
  })),
];

/** Replace the first occurrence matching `re`, or warn if the anchor is missing. */
const swap = (html, re, replacement, label) => {
  if (!re.test(html)) {
    console.warn(`  ! prerender: could not find ${label} to replace`);
    return html;
  }
  return html.replace(re, replacement);
};

const applyMeta = (html, route) => {
  const url = `${SITE_URL}${route.path === "/" ? "/" : route.path}`;
  const title = escapeHtml(route.title);
  const desc = escapeHtml(route.description);

  let out = html;
  out = swap(out, /<title>[\s\S]*?<\/title>/, `<title>${title}</title>`, "<title>");
  out = swap(out, /(<meta name="description" content=")[^"]*(")/, `$1${desc}$2`, "description");
  out = swap(out, /(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`, "og:title");
  out = swap(out, /(<meta property="og:description" content=")[^"]*(")/, `$1${desc}$2`, "og:description");
  out = swap(out, /(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`, "og:url");
  out = swap(out, /(<meta property="og:type" content=")[^"]*(")/, `$1${route.type}$2`, "og:type");
  out = swap(out, /(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`, "twitter:title");
  out = swap(out, /(<meta name="twitter:description" content=")[^"]*(")/, `$1${desc}$2`, "twitter:description");
  out = swap(out, /(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`, "canonical");
  return out;
};

const buildSitemap = () => {
  const today = new Date().toISOString().slice(0, 10);
  const urls = routes
    .map((r) => {
      const loc = `${SITE_URL}${r.path === "/" ? "/" : r.path}`;
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
};

const run = async () => {
  const indexPath = join(DIST, "index.html");
  if (!existsSync(indexPath)) {
    console.error(`prerender: ${indexPath} not found — run \`vite build\` first.`);
    process.exit(1);
  }

  const template = await readFile(indexPath, "utf8");

  for (const route of routes) {
    const html = applyMeta(template, route);
    if (route.path === "/") {
      await writeFile(indexPath, html, "utf8");
      console.log("  ✓ / (index.html)");
      continue;
    }
    const dir = join(DIST, route.path.replace(/^\//, ""));
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, "index.html"), html, "utf8");
    console.log(`  ✓ ${route.path}`);
  }

  await writeFile(join(DIST, "sitemap.xml"), buildSitemap(), "utf8");
  console.log("  ✓ sitemap.xml");
};

run().catch((err) => {
  console.error("prerender failed:", err);
  process.exit(1);
});
