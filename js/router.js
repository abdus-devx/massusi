export function createRouter(render){
  const go=path=>{history.pushState({}, "", path);render(path);window.scrollTo({top:0,behavior:"instant"})};
  window.addEventListener("popstate",()=>render(location.pathname));
  return go;
}
