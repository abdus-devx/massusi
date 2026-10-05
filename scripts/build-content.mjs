import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const articlesDir = path.join(root, "content", "articles");
const advertisementsDir = path.join(root, "content", "advertisements");

const articlesOut = path.join(root, "js", "articles.generated.js");
const advertisementsOut = path.join(root, "js", "advertisements.generated.js");

function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!match) {
    throw new Error("Invalid frontmatter");
  }

  const lines = match[1].split(/\r?\n/);
  const data = {};

  let currentList = null;

  for (const line of lines) {
    if (/^\s*-\s+/.test(line) && currentList) {
      currentList.push(
        line
          .replace(/^\s*-\s+/, "")
          .trim()
          .replace(/^['"]|['"]$/g, ""),
      );
      continue;
    }

    const m = line.match(/^([\w-]+):\s*(.*)$/);

    if (!m) continue;

    const [, key, raw] = m;

    if (raw === "") {
      data[key] = [];
      currentList = data[key];
      continue;
    }

    currentList = null;

    let value = raw.trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (value === "true") {
      data[key] = true;
    } else if (value === "false") {
      data[key] = false;
    } else {
      data[key] = value;
    }
  }

  return {
    data,
    body: match[2].trim(),
  };
}

function escHtml(s = "") {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[c],
  );
}

function inline(s) {
  let x = escHtml(s);

  x = x.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" loading="lazy">',
  );

  x = x.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  x = x.replace(/`([^`]+)`/g, "<code>$1</code>");

  x = x.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  x = x.replace(/__([^_]+)__/g, "<strong>$1</strong>");

  x = x.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  x = x.replace(/_([^_]+)_/g, "<em>$1</em>");

  return x;
}

function markdownToHtml(md) {
  const lines = md.replace(/\r/g, "").split("\n");

  const output = [];

  let para = [];
  let list = [];

  let inCode = false;
  let code = [];

  const flushPara = () => {
    if (para.length) {
      output.push(`<p>${inline(para.join(" "))}</p>`);
      para = [];
    }
  };

  const flushList = () => {
    if (list.length) {
      output.push(
        `<ul>${list.map((item) => `<li>${inline(item)}</li>`).join("")}</ul>`,
      );

      list = [];
    }
  };

  for (const line of lines) {
    if (line.startsWith("```")) {
      flushPara();
      flushList();

      if (!inCode) {
        inCode = true;
        code = [];
      } else {
        output.push(`<pre><code>${escHtml(code.join("\n"))}</code></pre>`);

        inCode = false;
      }

      continue;
    }

    if (inCode) {
      code.push(line);
      continue;
    }

    if (!line.trim()) {
      flushPara();
      flushList();
      continue;
    }

    const heading = line.match(/^(#{2,4})\s+(.+)$/);

    if (heading) {
      flushPara();
      flushList();

      const level = heading[1].length;

      const id = heading[2]
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");

      output.push(`<h${level} id="${id}">${inline(heading[2])}</h${level}>`);

      continue;
    }

    if (line.startsWith("> ")) {
      flushPara();
      flushList();

      output.push(`<blockquote>${inline(line.slice(2))}</blockquote>`);

      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      flushPara();

      list.push(line.replace(/^[-*]\s+/, ""));

      continue;
    }

    para.push(line.trim());
  }

  flushPara();
  flushList();

  if (inCode) {
    output.push(`<pre><code>${escHtml(code.join("\n"))}</code></pre>`);
  }

  return output.join("\n");
}

/* =========================================================
   ARTICLES
   ========================================================= */

const articleFiles = fs
  .readdirSync(articlesDir)
  .filter((file) => file.endsWith(".md"));

const articles = articleFiles
  .map((file, index) => {
    const raw = fs.readFileSync(path.join(articlesDir, file), "utf8");

    const { data, body } = parseFrontmatter(raw);

    return {
      id: index + 1,
      slug: data.slug || file.replace(/\.md$/, ""),

      title: data.title,

      category: data.category,

      excerpt: data.excerpt || "",

      author: data.author || "Massusi Editorial",

      date: data.publishDate,

      modified: data.modifiedDate || data.publishDate,

      readTime: data.readTime || "5 min read",

      image: data.image || "",

      tags: data.tags || [],

      featured: !!data.featured,

      bodyHtml: markdownToHtml(body),
    };
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date));

const categories = [
  ...new Set(articles.map((article) => article.category).filter(Boolean)),
];

fs.writeFileSync(
  articlesOut,
  `// AUTO-GENERATED. Edit Markdown files in content/articles via Decap CMS.
export const categories=${JSON.stringify(categories)};
export const articles=${JSON.stringify(articles)};
export const getArticle=(slug)=>articles.find(a=>a.slug===slug);
export const getByCategory=(category)=>articles.filter(a=>a.category.toLowerCase()===category.toLowerCase());
`,
);

/* =========================================================
   ADVERTISEMENTS
   ========================================================= */

let advertisements = [];

if (fs.existsSync(advertisementsDir)) {
  const advertisementFiles = fs
    .readdirSync(advertisementsDir)
    .filter((file) => file.endsWith(".md"));

  advertisements = advertisementFiles
    .map((file, index) => {
      const raw = fs.readFileSync(path.join(advertisementsDir, file), "utf8");

      const { data } = parseFrontmatter(raw);

      return {
        id: index + 1,

        slug: data.slug || file.replace(/\.md$/, ""),

        title: data.title || "",

        position: data.position || "after-hero",

        image: data.image || "",

        link: data.link || "",

        active: data.active !== false,
      };
    })
    .filter((ad) => ad.active);
}

fs.writeFileSync(
  advertisementsOut,
  `// AUTO-GENERATED. Edit Markdown files in content/advertisements via Decap CMS.
export const advertisements=${JSON.stringify(advertisements)};
export const getAdvertisement=(position)=>advertisements.find(ad=>ad.position===position && ad.active);
`,
);

/* =========================================================
   SITEMAP
   ========================================================= */

const sitemap =
  [
    '<?xml version="1.0" encoding="UTF-8"?>',

    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',

    "  <url><loc>https://massusi.net/</loc></url>",

    "  <url><loc>https://massusi.net/artikel</loc></url>",

    "  <url><loc>https://massusi.net/tentang</loc></url>",

    ...categories.map(
      (category) =>
        `  <url><loc>https://massusi.net/artikel/${encodeURIComponent(
          category.toLowerCase(),
        )}</loc></url>`,
    ),

    ...articles.map(
      (article) =>
        `  <url><loc>https://massusi.net/artikel/${article.slug}</loc></url>`,
    ),

    "</urlset>",
  ].join("\n") + "\n";

fs.writeFileSync(path.join(root, "sitemap.xml"), sitemap);

console.log(`Built ${articles.length} articles into ${articlesOut}`);

console.log(
  `Built ${advertisements.length} advertisements into ${advertisementsOut}`,
);
