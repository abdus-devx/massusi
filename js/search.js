import { articles } from "./articles.generated.js";
export function searchArticles(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return articles.filter((a) =>
    [a.title, a.category, a.excerpt, ...a.tags]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
}
export function renderSearchResults(results, container) {
  container.innerHTML = results.length
    ? results
        .map(
          (a) =>
            `<a class="search-result" href="/artikel/${a.slug}" data-route><strong>${a.title}</strong><small>${a.category} · ${a.readTime}</small></a>`,
        )
        .join("")
    : `<div class="empty">Tidak ada artikel yang cocok.</div>`;
}
