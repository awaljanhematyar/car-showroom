const Navigation = {
  init() {
    window.addEventListener("hashchange", () => App.render());
    document
      .getElementById("sidebar-collapse")
      .addEventListener("click", () =>
        document.body.classList.toggle("sidebar-collapsed"),
      );
    const sidebar = document.getElementById("sidebar"),
      overlay = document.getElementById("mobile-overlay");
    const close = () => {
      sidebar.classList.remove("mobile-open");
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    };
    document.getElementById("mobile-menu").onclick = () => {
      sidebar.classList.add("mobile-open");
      overlay.classList.add("active");
      document.body.style.overflow = "hidden";
    };
    overlay.onclick = close;
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
    sidebar
      .querySelectorAll("a")
      .forEach((a) => a.addEventListener("click", close));
  },
  setActive(route) {
    document
      .querySelectorAll(".sidebar-nav a")
      .forEach((a) => a.classList.toggle("active", a.dataset.route === route));
  },
  go(route) {
    location.hash = route;
  },
};
