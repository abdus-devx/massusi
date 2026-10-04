const base = "https://massusi.net";
export function updateSEO({title,description,path="/",type="website",article=null}){
  document.title = title;
  const set=(name,content)=>{let el=document.querySelector(`meta[name="${name}"]`);if(!el){el=document.createElement("meta");el.name=name;document.head.appendChild(el)}el.content=content};
  const prop=(name,content)=>{let el=document.querySelector(`meta[property="${name}"]`);if(!el){el=document.createElement("meta");el.setAttribute("property",name);document.head.appendChild(el)}el.content=content};
  set("description",description); set("robots","index,follow");
  let canonical=document.querySelector('link[rel="canonical"]'); canonical.href=base+path;
  prop("og:title",title);prop("og:description",description);prop("og:url",base+path);prop("og:type",type);
  prop("og:image",base+"/assets/images/og-default.svg");
  set("twitter:title",title);set("twitter:description",description);set("twitter:image",base+"/assets/images/og-default.svg");
  const schema=article?{"@context":"https://schema.org","@type":"Article","headline":article.title,"description":article.excerpt,"datePublished":article.date,"dateModified":article.modified,"author":{"@type":"Organization","name":"Massusi","url":base},"publisher":{"@type":"Organization","name":"Massusi","url":base},"image":base+"/assets/images/og-default.svg","mainEntityOfPage":{"@type":"WebPage","@id":base+path}}:{"@context":"https://schema.org","@type":"WebSite","name":"Massusi","url":base,"description":description,"potentialAction":{"@type":"SearchAction","target":base+"/artikel?search={search_term_string}","query-input":"required name=search_term_string"}};
  document.getElementById("jsonld").textContent=JSON.stringify(schema);
}
