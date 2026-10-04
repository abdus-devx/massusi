export function buildTOC(container){
  const headings=[...container.querySelectorAll("h2,h3")];
  if(!headings.length)return;
  headings.forEach((h,i)=>{h.id=h.id||`section-${i+1}`});
  const wrap=document.createElement("nav");wrap.className="toc";wrap.setAttribute("aria-label","Daftar isi");
  wrap.innerHTML="<strong>Daftar isi</strong>";
  const ol=document.createElement("ol");
  headings.forEach(h=>{const li=document.createElement("li");li.innerHTML=`<a href="#${h.id}">${h.textContent}</a>`;ol.append(li)});
  wrap.append(ol);container.insertBefore(wrap,container.firstChild);
}
