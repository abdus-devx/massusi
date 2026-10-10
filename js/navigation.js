export function initNavigation({ navigate }) {
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("backdrop");
  const toggle = document.getElementById("menuToggle");
  const moreToggle = document.getElementById("mobileMoreToggle");
  const moreMenu = document.getElementById("mobileMoreMenu");
  const moreBackdrop = document.getElementById("mobileMoreBackdrop");

  const close = () => {
    sidebar.classList.remove("open");
    backdrop.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };

  const closeMore = () => {
    moreMenu.hidden = true;
    moreBackdrop.hidden = true;
    moreToggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const open = !sidebar.classList.contains("open");
    sidebar.classList.toggle("open", open);
    backdrop.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });

  document.getElementById("sidebarClose").addEventListener("click", close);
  backdrop.addEventListener("click", close);

  moreToggle.addEventListener("click", () => {
    const open = moreMenu.hidden;
    moreMenu.hidden = !open;
    moreBackdrop.hidden = !open;
    moreToggle.setAttribute("aria-expanded", String(open));
  });

  moreBackdrop.addEventListener("click", closeMore);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      close();
      closeMore();
      document.getElementById("searchModal")?.close();
    }
  });

  document.addEventListener("click", (e) => {
    const link = e.target.closest("[data-route]");

    if (link) {
      e.preventDefault();
      navigate(new URL(link.href).pathname);
      close();
      closeMore();
    }
  });
}

export function setActive(path) {
  document.querySelectorAll("[data-nav]").forEach((el) => {
    el.classList.remove("active");
  });

  document.querySelectorAll("[data-mobile-nav]").forEach((el) => {
    el.classList.remove("active");
  });

  const key =
    path === "/"
      ? "dashboard"
      : path.startsWith("/tentang")
        ? "tentang"
        : path.split("/")[2] || "artikel";

  document.querySelector(`[data-nav="${key}"]`)?.classList.add("active");

  const mobileKey =
    path === "/" ? "home" : path.startsWith("/artikel") ? "artikel" : null;

  if (mobileKey) {
    document
      .querySelector(`[data-mobile-nav="${mobileKey}"]`)
      ?.classList.add("active");
  }
}
