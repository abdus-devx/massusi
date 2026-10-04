import {articles,getArticle,getByCategory,categories} from "./articles.generated.js";
import {updateSEO} from "./seo.js";
import {buildTOC} from "./toc.js";
import {searchArticles,renderSearchResults} from "./search.js";
import {createRouter} from "./router.js";
import {initNavigation,setActive} from "./navigation.js";

const main=document.getElementById("main-content");
const router=createRouter(render);
initNavigation({navigate:router});

const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const artMedia=(label="MASSUSI",image="")=>image?`<div class="article-media"><img src="${esc(image)}" alt="${esc(label)}" loading="lazy"></div>`:`<div class="article-media"><div class="placeholder-art">${esc(label)}</div></div>`;
const card=a=>`<article class="article-card"><a href="/artikel/${a.slug}" data-route>${artMedia(a.category,a.image)}<div class="article-copy"><span class="category">${esc(a.category)}</span><h3>${esc(a.title)}</h3><p>${esc(a.excerpt)}</p><div class="meta"><span>${esc(a.readTime)}</span><span>·</span><time datetime="${a.date}">${new Date(a.date+"T00:00:00").toLocaleDateString("id-ID",{day:"2-digit",month:"short",year:"numeric"})}</time></div><span class="read-more">Baca artikel →</span></div></a></article>`;

function shell(content){main.innerHTML=content}
function ad(){return `<div class="ad-banner" aria-label="Advertisement">ADVERTISEMENT</div>`}

function home(){
 const featured=articles.find(a=>a.featured)||articles[0];
 shell(`<section class="hero"><div><span class="eyebrow">Massusi Knowledge & Business Hub</span><h1>Insight, Edukasi & Informasi Seputar Herbal dan Bisnis Kesehatan</h1><p>Pusat informasi Massusi untuk memahami herbal, kesehatan, pengembangan produk, industri, bisnis, dan jasa maklon melalui konten yang informatif dan mudah dipahami.</p><div class="hero-actions"><a class="btn btn-primary" href="/artikel" data-route>Jelajahi Artikel →</a><a class="btn btn-secondary" href="/tentang" data-route>Kenal Massusi</a></div></div><aside class="hero-note"><strong>Knowledge first.</strong><p>Website utama Massusi dirancang sebagai hub informasi, bukan toko online.</p></aside></section>
 ${ad()}
 <section><div class="section-head"><h2>Featured Insight</h2><a href="/artikel" data-route>Lihat semua →</a></div><article class="featured"><a class="featured-media" href="/artikel/${featured.slug}" data-route>${artMedia(featured.category,featured.image)}</a><div class="featured-copy"><span class="category">${featured.category}</span><h2>${featured.title}</h2><p>${featured.excerpt}</p><div class="meta"><span>${featured.author}</span><span>·</span><time datetime="${featured.date}">${featured.date}</time><span>·</span><span>${featured.readTime}</span></div><div class="hero-actions"><a class="btn btn-primary" href="/artikel/${featured.slug}" data-route>Baca Artikel →</a></div></div></article></section>
 <section><div class="section-head"><h2>Artikel Terbaru</h2><a href="/artikel" data-route>Semua artikel →</a></div><div class="article-grid">${articles.slice(0,6).map(card).join("")}</div></section>
 ${ad()}
 <section><div class="section-head"><h2>Explore Massusi</h2></div><div class="ecosystem">
 <div class="eco-card"><h3>Company Profile</h3><p>Kenali perusahaan dan fasilitas Massusi.</p><a href="https://profile.massusi.net" target="_blank" rel="noopener">Visit Profile ↗</a></div>
 <div class="eco-card"><h3>Jasa Maklon</h3><p>Solusi pengembangan produk herbal dan kesehatan.</p><a href="https://maklon.massusi.net" target="_blank" rel="noopener">Pelajari Jasa Maklon ↗</a></div>
 <div class="eco-card"><h3>Online Store</h3><p>Temukan produk Massusi.</p><a href="https://store.massusi.net" target="_blank" rel="noopener">Kunjungi Store ↗</a></div></div></section>`);
 updateSEO({title:"Massusi — Insight, Edukasi & Informasi Herbal",description:"Massusi Knowledge & Business Hub untuk insight, edukasi dan informasi seputar herbal, kesehatan dan bisnis.",path:"/"});
}

function listing(category){
 const data=category?getByCategory(category):articles;
 const title=category?category:"Artikel";
 shell(`<section class="hero"><div><span class="eyebrow">Knowledge Hub</span><h1>${esc(title)}</h1><p>${category?`Artikel dan insight dalam kategori ${esc(category)}.`:"Kumpulan artikel Massusi seputar herbal, kesehatan, edukasi, industri, maklon dan bisnis."}</p></div></section>
 <div class="tag-row">${categories.map(c=>`<a class="tag" href="/artikel/${c.toLowerCase()}" data-route>${c}</a>`).join("")}</div>
 ${ad()}<div class="article-grid">${data.map(card).join("")}</div>${data.length?`<button class="btn btn-secondary load-more" id="loadMore">Muat lebih banyak</button>`:`<div class="empty">Belum ada artikel pada kategori ini.</div>`}`);
 document.getElementById("loadMore")?.addEventListener("click",e=>e.currentTarget.textContent="Semua artikel sudah ditampilkan.");
 updateSEO({title:`${title} — Massusi`,description:`Artikel Massusi dalam kategori ${title}.`,path:category?`/artikel/${category.toLowerCase()}`:"/artikel"});
}

function articlePage(a){
 shell(`<article class="article-page"><header class="article-header"><span class="category">${esc(a.category)}</span><h1>${esc(a.title)}</h1><p class="article-lead">${esc(a.excerpt)}</p><div class="meta"><span>${esc(a.author)}</span><span>·</span><time datetime="${a.date}">${a.date}</time><span>·</span><span>Diperbarui ${a.modified}</span><span>·</span><span>${a.readTime}</span></div></header>
 <div class="article-feature">${artMedia(a.category)}</div>
 <div class="article-body" id="articleBody">${a.bodyHtml || `<p>${esc(a.excerpt)}</p>`}</div>
 ${ad()}
 <section class="related"><div class="section-head"><h2>Artikel Terkait</h2></div><div class="article-grid">${articles.filter(x=>x.id!==a.id).slice(0,2).map(card).join("")}</div></section>
 </article>`);
 buildTOC(document.getElementById("articleBody"));
 updateSEO({title:`${a.title} — Massusi`,description:a.excerpt,path:`/artikel/${a.slug}`,type:"article",article:a});
}

function about(){
 shell(`<section class="hero"><div><span class="eyebrow">Tentang Massusi</span><h1>Satu ekosistem. Banyak cara untuk belajar dan berkembang.</h1><p>Massusi.net berperan sebagai web hub utama yang menghubungkan informasi, edukasi, company profile, jasa maklon dan online store dalam satu ekosistem.</p></div></section>
 <div class="about-grid"><div class="about-box"><h2>Massusi Knowledge Hub</h2><p>Portal ini berfokus pada artikel, edukasi dan insight mengenai herbal, kesehatan, industri, pengembangan produk dan bisnis.</p></div><div class="about-box"><h2>Ekosistem Massusi</h2><p>Gunakan navigasi ekosistem untuk berpindah ke Company Profile, Jasa Maklon atau Online Store sesuai kebutuhan.</p></div></div>${ad()}`);
 updateSEO({title:"Tentang Massusi — Knowledge & Business Hub",description:"Tentang Massusi dan peran massusi.net sebagai knowledge and business hub.",path:"/tentang"});
}

function render(path){
 setActive(path);
 const crumbs=document.getElementById("breadcrumbs");
 const parts=path.split("/").filter(Boolean);
 crumbs.innerHTML=parts.length?`Home / ${parts.map(esc).join(" / ")}`:"<strong>Dashboard</strong>";
 if(path==="/"||path==="")return home();
 if(path==="/tentang")return about();
 if(path === "/artikel") return listing();
 if(path.startsWith("/artikel/")){
   const slug=decodeURIComponent(path.split("/").slice(2).join("/"));
   const cat=categories.find(c=>c.toLowerCase()===slug.toLowerCase());
   const a=getArticle(slug);
   if(a)return articlePage(a);
   if(cat)return listing(cat);
 }
 return listing();
}
render(location.pathname);

const modal=document.getElementById("searchModal"),input=document.getElementById("searchInput"),results=document.getElementById("searchResults");
function openSearch(){modal.showModal();input.value="";results.innerHTML="";setTimeout(()=>input.focus(),0)}
document.getElementById("searchTrigger").addEventListener("click",openSearch);
document.getElementById("searchClose").addEventListener("click",()=>modal.close());
input.addEventListener("input",()=>renderSearchResults(searchArticles(input.value),results));
results.addEventListener("click",e=>{const link=e.target.closest("[data-route]");if(link){e.preventDefault();modal.close();router(new URL(link.href).pathname)}});
document.addEventListener("keydown",e=>{if(e.key==="/"&&!["INPUT","TEXTAREA"].includes(document.activeElement.tagName)){e.preventDefault();openSearch()}});
