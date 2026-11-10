/* UI compartida por todas las páginas: tema claro/oscuro y menú móvil */
(function () {
  const KEY = "electromundo-theme";
  const root = document.documentElement;

  function apply(dark) {
    root.classList.toggle("dark-theme", dark);
    const btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.setAttribute("aria-pressed", String(dark));
      btn.setAttribute("aria-label", dark ? "Cambiar a tema claro" : "Cambiar a tema oscuro");
    }
  }

  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  apply(saved === "dark");

  document.getElementById("theme-toggle")?.addEventListener("click", () => {
    const dark = !root.classList.contains("dark-theme");
    apply(dark);
    try { localStorage.setItem(KEY, dark ? "dark" : "light"); } catch (e) {}
  });

  const nav = document.getElementById("nav");
  document.getElementById("menu-toggle")?.addEventListener("click", () => nav?.classList.toggle("open"));

  document.getElementById("search-toggle")?.addEventListener("click", () => {
    const panel = document.getElementById("search-panel");
    panel?.classList.toggle("open");
    if (panel?.classList.contains("open")) document.getElementById("search-input")?.focus();
  });
})();
