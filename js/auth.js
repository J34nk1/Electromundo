/* Icono de cuenta del header: lleva a cuenta.html y marca si hay sesión */
(function () {
  const db = window.supabaseClient;
  const link = document.querySelector('a[aria-label="Cuenta"]');
  if (!link) return;
  link.href = "cuenta.html";
  if (!db) return;
  db.auth.getSession().then(({ data }) => {
    const u = data.session?.user;
    if (u) { link.classList.add("logged"); link.title = u.email; }
  });
})();
