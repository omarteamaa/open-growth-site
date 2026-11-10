// Builds the Arabic page at /ar/index.html from index.html and the Arabic copy in script.js.
// Run after any change to index.html or the AR strings:  node tools/build-ar.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = "https://open-growth-site-psi.vercel.app";

const TITLE = "شركة تصميم مواقع في دبي – تدقيق مجاني | أوبن جروث";
const DESC = "مواقع ثنائية اللغة بالعربية والإنجليزية للشركات في الإمارات والخليج، مصممة لتحويل الزوار إلى استفسارات. الأسعار من 18 ألف درهم. تدقيق مجاني خلال 48 ساعة.";
const OG_TITLE = "تصميم مواقع في دبي يجلب لك العملاء | أوبن جروث";

/* Static accessible names that live in the HTML (the rest are data-i18n) */
const LABELS = {
  "Open Growth home": "الصفحة الرئيسية لأوبن جروث",
  "Primary": "التنقل الرئيسي",
  "Switch to light theme": "التبديل إلى الوضع الفاتح",
  "Open menu": "فتح القائمة",
  "What every project includes": "ما يتضمنه كل مشروع",
  "Pause slideshow": "إيقاف العرض التلقائي",
  "Previous website": "الموقع السابق",
  "Next website": "الموقع التالي",
  "Recent website launches": "أحدث المواقع",
  "Chat on WhatsApp": "تواصل عبر واتساب",
};

const html = readFileSync(join(root, "index.html"), "utf8");
const js = readFileSync(join(root, "script.js"), "utf8");

/* Pull the AR object literal out of script.js */
const start = js.indexOf("var AR = {");
const end = js.indexOf("\n  };", start);
if (start < 0 || end < 0) throw new Error("AR strings not found in script.js");
const AR = Function('"use strict"; return (' + js.slice(start + "var AR = ".length, end + 4) + ");")();

/* Replace the inner HTML of every element carrying data-i18n, matching its own closing tag */
function translate(src) {
  const open = /<([a-zA-Z][a-zA-Z0-9]*)\b[^>]*\sdata-i18n="([^"]+)"[^>]*>/g;
  let out = "", last = 0, m, missing = [];
  while ((m = open.exec(src))) {
    const [tag, name, key] = [m[0], m[1].toLowerCase(), m[2]];
    const innerStart = m.index + tag.length;
    const re = new RegExp("<(/?)" + name + "\\b[^>]*>", "gi");
    re.lastIndex = innerStart;
    let depth = 1, t, innerEnd = -1;
    while ((t = re.exec(src))) {
      depth += t[1] ? -1 : 1;
      if (!depth) { innerEnd = t.index; break; }
    }
    if (innerEnd < 0) throw new Error("unclosed <" + name + "> for " + key);
    if (!(key in AR)) { missing.push(key); continue; }
    out += src.slice(last, innerStart) + AR[key].replace(/&(?!\w+;)/g, "&amp;").replace(/</g, "&lt;");
    last = innerEnd;
    open.lastIndex = innerEnd;
  }
  if (missing.length) console.warn("No Arabic for:", [...new Set(missing)].join(", "));
  return out + src.slice(last);
}

let ar = translate(html);

/* Placeholders */
ar = ar.replace(/(<[^>]*data-i18n-ph="([^"]+)"[^>]*>)/g, (tag, _, key) =>
  AR[key] ? tag.replace(/placeholder="[^"]*"/, 'placeholder="' + AR[key] + '"') : tag);

/* aria-labels */
ar = ar.replace(/aria-label="([^"]+)"/g, (all, v) => (LABELS[v] ? 'aria-label="' + LABELS[v] + '"' : all));

const swap = (from, to, label) => {
  const hit = from instanceof RegExp ? from.test(ar) : ar.includes(from);
  if (!hit) throw new Error("build-ar miss: " + label);
  ar = ar.replace(from, to);
};

/* Document language, metadata and alternates */
swap('<html lang="en" dir="ltr">', '<html lang="ar" dir="rtl">', "html");
swap(/<title>[^<]*<\/title>/, "<title>" + TITLE + "</title>", "title");
swap(/<meta name="description" content="[^"]*">/, '<meta name="description" content="' + DESC + '">', "desc");
swap('<link rel="canonical" href="' + BASE + '/">', '<link rel="canonical" href="' + BASE + '/ar/">', "canonical");
swap('<meta property="og:url" content="' + BASE + '/">', '<meta property="og:url" content="' + BASE + '/ar/">', "og url");
ar = ar.replace(/(<meta (?:property="og|name="twitter):title" content=")[^"]*"/g, "$1" + OG_TITLE + '"');
ar = ar.replace(/(<meta (?:property="og|name="twitter):description" content=")[^"]*"/g, "$1" + DESC + '"');
swap('<meta property="og:locale" content="en_AE">\n  <meta property="og:locale:alternate" content="ar_AE">',
  '<meta property="og:locale" content="ar_AE">\n  <meta property="og:locale:alternate" content="en_AE">', "og locale");
swap('<link rel="stylesheet" href="/styles.css">',
  '<link rel="preconnect" href="https://fonts.googleapis.com">\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
  '  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;700&display=swap" rel="stylesheet">\n  <link rel="stylesheet" href="/styles.css">', "arabic font");
swap('<a class="lang" href="/ar/" hreflang="ar" lang="ar" data-track="lang_switch" aria-label="العربية">عربي</a>',
  '<a class="lang" href="/" hreflang="en" lang="en" data-track="lang_switch" aria-label="English">English</a>', "lang link");

/* Structured data: this page is the Arabic WebPage */
ar = ar.replace(/\{"@type":"WebPage"[^\n]*\}(?=\n)/, (wp) => {
  const o = JSON.parse(wp);
  Object.assign(o, { "@id": BASE + "/ar/#webpage", url: BASE + "/ar/", name: TITLE, description: DESC, inLanguage: "ar" });
  return JSON.stringify(o);
});

const header = "<!-- Generated by tools/build-ar.mjs from index.html. Edit index.html or the AR strings in script.js, then rebuild. -->\n";
mkdirSync(join(root, "ar"), { recursive: true });
writeFileSync(join(root, "ar", "index.html"), ar.replace("<!doctype html>\n", "<!doctype html>\n" + header));
console.log("wrote ar/index.html");
