// Production build: generate the Arabic page, then copy only public files into dist/.
// Vercel runs this (vercel.json) and serves dist/, so notes, tools and config never go online.
import { cpSync, rmSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

await import("./build-ar.mjs");

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const PUBLIC = [
  "index.html", "ar", "privacy", "styles.css", "script.js", "fonts", "work",
  "og-image.png", "favicon.svg", "robots.txt", "sitemap.xml",
];

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist);
for (const item of PUBLIC) cpSync(join(root, item), join(dist, item), { recursive: true });
console.log("dist/ ready:", PUBLIC.join(", "));
