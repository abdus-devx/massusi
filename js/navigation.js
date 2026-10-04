export function initNavigation({navigate}){
  const sidebar=document.getElementById("sidebar"),backdrop=document.getElementById("backdrop"),toggle=document.getElementById("menuToggle");
  const close=()=>{sidebar.classList.remove("open");backdrop.classList.remove("open");toggle.setAttribute("aria-expanded","false")};
  toggle.addEventListener("click",()=>{const open=!sidebar.classList.contains("open");sidebar.classList.toggle("open",open);backdrop.classList.toggle("open",open);toggle.setAttribute("aria-expanded",String(open))});
  document.getElementById("sidebarClose").addEventListener("click",close);backdrop.addEventListener("click",close);
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){close();document.getElementById("searchModal")?.close()}});
  document.addEventListener("click",e=>{const link=e.target.closest("[data-route]");if(link){e.preventDefault();navigate(new URL(link.href).pathname);close()}});
}
export function setActive(path){
  document.querySelectorAll("[data-nav]").forEach(el=>el.classList.remove("active"));
  const key=path==="/"?"dashboard":path.startsWith("/tentang")?"tentang":path.split("/")[2]||"artikel";
  document.querySelector(`[data-nav="${key}"]`)?.classList.add("active");
}
