/* Electro Mundo — tienda: productos, carrito, catálogo, favoritos, contacto */
/* Respaldo local: se usa si Supabase no está configurado o falla */
const LOCAL_PRODUCTS = [
  {
    id: "hp-victus",
    name: "HP - Victus 15.6\" Gaming Laptop",
    price: 1800,
    category: "laptops",
    image: "img/laptop-hp.webp",
    featured: true,
    offer: false
  },
  {
    id: "dell-g15",
    name: "Dell - G15 15.6\" Gaming Laptop",
    price: 2000,
    category: "laptops",
    image: "img/laptop-dell.webp",
    featured: true,
    offer: false
  },
  {
    id: "asus-rog",
    name: "ASUS - ROG Gaming Desktop",
    price: 2500,
    category: "desktops",
    image: "img/pc-asus.webp",
    featured: true,
    offer: false
  },
  {
    id: "acer-nitro-27",
    name: "Acer - Nitro 27\" Gaming Monitor",
    price: 1800,
    category: "monitores",
    image: "img/monitor-acer.webp",
    featured: true,
    offer: false
  },
  {
    id: "acer-nitro-27b",
    name: "Acer - Nitro 27\" Gaming Monitor",
    price: 1800,
    category: "monitores",
    image: "img/monitor-acer-2.webp",
    featured: true,
    offer: false
  },
  {
    id: "lenovo-loq",
    name: "Lenovo - LOQ 15.6\" Gaming Laptop",
    price: 2199,
    oldPrice: 2499,
    category: "laptops",
    image: "img/laptop-cat.webp",
    featured: false,
    offer: true
  },
  {
    id: "acer-nitro5",
    name: "Acer - Nitro 5 15.6\" Gaming Laptop",
    price: 1699,
    oldPrice: 1999,
    category: "laptops",
    image: "img/laptop-hp.webp",
    featured: false,
    offer: true
  },
  {
    id: "hp-omen",
    name: "HP - OMEN Desktop Gaming",
    price: 2899,
    category: "desktops",
    image: "img/desktop-cat.webp",
    featured: false,
    offer: false
  },
  {
    id: "ryzen-pc",
    name: "PC Gamer Ryzen 5 + RTX 4060",
    price: 2399,
    oldPrice: 2799,
    category: "desktops",
    image: "img/pc-asus.webp",
    featured: false,
    offer: true
  },
  {
    id: "headset-g",
    name: "Audífonos Gamer RGB 7.1",
    price: 189,
    oldPrice: 249,
    category: "accesorios",
    image: "img/accesorios.webp",
    featured: false,
    offer: true
  },
  {
    id: "mouse-g",
    name: "Mouse Gamer 16000 DPI",
    price: 99,
    category: "accesorios",
    image: "img/accesorios.webp",
    featured: false,
    offer: false
  },
  {
    id: "lg-ultragear",
    name: "LG - UltraGear 27\" 165Hz",
    price: 1299,
    oldPrice: 1599,
    category: "monitores",
    image: "img/monitor-acer.webp",
    featured: false,
    offer: true
  }
];

/* ---------- Supabase ---------- */
let PRODUCTS = LOCAL_PRODUCTS;
const db = window.supabaseClient;

const CAT_LABEL = { laptops: "Laptops", desktops: "Desktops", accesorios: "Accesorios", monitores: "Monitores" };

async function loadProducts() {
  if (!db) return;
  const { data, error } = await db
    .from("productos")
    .select("*")
    .order("created_at", { ascending: true });

  if (error || !data?.length) {
    console.warn("No se pudieron cargar productos de Supabase, uso los locales.", error);
    return;
  }
  PRODUCTS = data.map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    oldPrice: p.old_price ? Number(p.old_price) : undefined,
    category: p.category,
    image: p.image,
    featured: p.featured,
    offer: p.offer
  }));
}

async function saveOrder() {
  const items = cart
    .map((i) => {
      const p = PRODUCTS.find((x) => x.id === i.id);
      return p ? { id: p.id, name: p.name, price: p.price, qty: i.qty } : null;
    })
    .filter(Boolean);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const { error } = await db.from("pedidos").insert({ items, total });
  return error;
}

/* ---------- Utilidades ---------- */
const money = (n) =>
  "S/ " + n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const esc = (t) =>
  String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (e) { return fallback; }
}
function writeJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
}

/* ---------- Carrito y favoritos ---------- */
const cartKey = "eletromundo-cart";
const favKey = "electromundo-favs";
let cart = readJSON(cartKey, []);
let favs = readJSON(favKey, []);

function saveCart() {
  writeJSON(cartKey, cart);
  updateBadge();
  renderCart();
}

function updateBadge() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  $$(".badge").forEach((b) => {
    b.textContent = count;
    b.classList.toggle("show", count > 0);
  });
}

function addToCart(id) {
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) return;
  const item = cart.find((i) => i.id === id);
  if (item) item.qty += 1;
  else cart.push({ id, qty: 1 });
  saveCart();
  toast(`${product.name} añadido al carrito`);
}

function changeQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter((i) => i.id !== id);
  saveCart();
}

function removeItem(id) {
  cart = cart.filter((i) => i.id !== id);
  saveCart();
}

function toggleFav(id) {
  favs = favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id];
  writeJSON(favKey, favs);
  $$(`[data-fav="${CSS.escape(id)}"]`).forEach((b) => {
    const on = favs.includes(id);
    b.classList.toggle("on", on);
    b.setAttribute("aria-pressed", String(on));
  });
  // En el filtro "Favoritos" la lista debe actualizarse al quitar uno
  if (typeof refreshCatalog === "function") refreshCatalog();
}

/* ---------- Render ---------- */
const HEART = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.5-9.2C1.2 8.6 3 5.5 6.2 5.5c1.9 0 3.4 1 4.3 2.4l1.5 2 1.5-2c.9-1.4 2.4-2.4 4.3-2.4 3.2 0 5 3.1 3.7 6.3C19.5 16.4 12 21 12 21Z" transform="translate(0 .5)"/></svg>`;

function productCard(p) {
  const hasSale = p.oldPrice && p.oldPrice > p.price;
  const discount = hasSale ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  const old = hasSale ? `<span class="old-price">${money(p.oldPrice)}</span>` : "";
  const isFav = favs.includes(p.id);
  return `
    <article class="card">
      ${hasSale ? `<span class="tag-sale">-${discount}%</span>` : ""}
      <button class="fav ${isFav ? "on" : ""}" data-fav="${esc(p.id)}" aria-pressed="${isFav}" aria-label="Guardar en favoritos">${HEART}</button>
      <div class="card-img"><img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy"></div>
      <div class="card-body">
        <span class="card-cat">${esc(CAT_LABEL[p.category] || p.category)}</span>
        <h3>${esc(p.name)}</h3>
        <p class="price ${hasSale ? "sale" : ""}">${old}${money(p.price)}</p>
        <button class="btn-add" data-add="${esc(p.id)}">Añadir al carrito</button>
      </div>
    </article>
  `;
}

function renderGrid(target, list) {
  const el = $(target);
  if (!el) return;
  el.innerHTML = list.map(productCard).join("") || `<p class="empty">No encontramos productos con esos filtros.</p>`;
}

function renderCart() {
  const box = $(".cart-items");
  if (!box) return;
  if (!cart.length) {
    box.innerHTML = `<p class="empty">Tu carrito está vacío.</p>`;
  } else {
    box.innerHTML = cart
      .map((item) => {
        const p = PRODUCTS.find((x) => x.id === item.id);
        if (!p) return "";
        return `
          <div class="cart-item">
            <img src="${esc(p.image)}" alt="">
            <div>
              <h4>${esc(p.name)}</h4>
              <p>${money(p.price)}</p>
              <div class="qty">
                <button data-qty="${esc(p.id)}" data-d="-1" aria-label="Disminuir cantidad">−</button>
                <span>${item.qty}</span>
                <button data-qty="${esc(p.id)}" data-d="1" aria-label="Aumentar cantidad">+</button>
              </div>
            </div>
            <div>
              <div class="line-total">${money(p.price * item.qty)}</div>
              <button class="remove" data-remove="${esc(p.id)}">Quitar</button>
            </div>
          </div>
        `;
      })
      .join("");
  }
  const total = cart.reduce((s, i) => {
    const p = PRODUCTS.find((x) => x.id === i.id);
    return s + (p ? p.price * i.qty : 0);
  }, 0);
  const totalEl = $("#cart-total");
  if (totalEl) totalEl.textContent = money(total);
  const clear = $("#cart-clear");
  if (clear) clear.hidden = !cart.length;
}

function toast(msg) {
  let t = $(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    t.setAttribute("role", "status");
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._id);
  toast._id = setTimeout(() => t.classList.remove("show"), 2200);
}

function openCart(open) {
  $(".overlay")?.classList.toggle("open", open);
  $(".drawer")?.classList.toggle("open", open);
}

/* ---------- Hero ---------- */
function initHero() {
  const slides = $$(".hero-slide");
  const dots = $$(".hero-dots button");
  if (!slides.length) return;
  let i = 0;
  let timer;
  const show = (n) => {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, idx) => s.classList.toggle("active", idx === i));
    dots.forEach((d, idx) => d.classList.toggle("active", idx === i));
  };
  const start = () => { clearInterval(timer); timer = setInterval(() => show(i + 1), 5500); };
  dots.forEach((d, idx) => d.addEventListener("click", () => { show(idx); start(); }));
  const frame = $(".hero-frame");
  frame?.addEventListener("mouseenter", () => clearInterval(timer));
  frame?.addEventListener("mouseleave", start);
  start();
}

/* ---------- Catálogo: categoría, búsqueda, orden y favoritos ---------- */
let refreshCatalog = null;

function initCatalog() {
  const grid = "#catalog-grid";
  if (!$(grid)) return;
  const params = new URLSearchParams(location.search);
  const state = {
    cat: params.get("cat") || "todos",
    q: (params.get("q") || "").trim(),
    sort: "relevancia"
  };

  const search = $("#catalog-search");
  const sort = $("#catalog-sort");
  if (search) search.value = state.q;

  const sorters = {
    relevancia: null,
    "precio-asc": (a, b) => a.price - b.price,
    "precio-desc": (a, b) => b.price - a.price,
    nombre: (a, b) => a.name.localeCompare(b.name, "es")
  };

  refreshCatalog = () => {
    let list = PRODUCTS.slice();
    if (state.cat === "favoritos") list = list.filter((p) => favs.includes(p.id));
    else if (state.cat !== "todos") list = list.filter((p) => p.category === state.cat);
    if (state.q) {
      const q = state.q.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    const fn = sorters[state.sort];
    if (fn) list.sort(fn);

    renderGrid(grid, list);
    $$(".chip").forEach((c) => c.classList.toggle("active", c.dataset.cat === state.cat));
    const count = $("#catalog-count");
    if (count) count.textContent = `${list.length} producto${list.length === 1 ? "" : "s"}`;
  };

  $$(".chip").forEach((c) =>
    c.addEventListener("click", () => {
      state.cat = c.dataset.cat;
      refreshCatalog();
    })
  );
  search?.addEventListener("input", () => { state.q = search.value.trim(); refreshCatalog(); });
  sort?.addEventListener("change", () => { state.sort = sort.value; refreshCatalog(); });
  refreshCatalog();
}

function initSearch() {
  $("#search-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = $("#search-input")?.value.trim() || "";
    location.href = `catalogo.html?q=${encodeURIComponent(q)}`;
  });
}

/* ---------- Contacto ---------- */
function initContact() {
  $("#contact-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = $("#c-name")?.value.trim();
    const email = $("#c-email")?.value.trim();
    const mensaje = $("#c-msg")?.value.trim() || null;
    const msg = $("#form-msg");
    const btn = form.querySelector("button[type=submit]");
    if (!name || !email || !msg) return;

    const say = (text, bad = false) => {
      msg.textContent = text;
      if (bad) msg.dataset.bad = "1"; else delete msg.dataset.bad;
    };

    if (!db) {
      say("Mensaje enviado. Te contactaremos pronto.");
      form.reset();
      return;
    }

    say("Enviando...");
    if (btn) btn.disabled = true;
    const { error } = await db.from("mensajes_contacto").insert({ nombre: name, email, mensaje });
    if (btn) btn.disabled = false;
    if (error) {
      console.error(error);
      say("No se pudo enviar. Intenta nuevamente.", true);
      return;
    }
    say("Mensaje enviado. Te contactaremos pronto.");
    form.reset();
  });
}

/* ---------- Eventos globales ---------- */
document.addEventListener("click", (e) => {
  const add = e.target.closest("[data-add]");
  if (add) addToCart(add.dataset.add);

  const fav = e.target.closest("[data-fav]");
  if (fav) toggleFav(fav.dataset.fav);

  const qty = e.target.closest("[data-qty]");
  if (qty) changeQty(qty.dataset.qty, Number(qty.dataset.d));

  const rem = e.target.closest("[data-remove]");
  if (rem) removeItem(rem.dataset.remove);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") openCart(false);
});

$("#cart-toggle")?.addEventListener("click", () => openCart(true));
$("#cart-close")?.addEventListener("click", () => openCart(false));
$(".overlay")?.addEventListener("click", () => openCart(false));
$("#cart-clear")?.addEventListener("click", () => {
  cart = [];
  saveCart();
});

$("#checkout")?.addEventListener("click", async () => {
  if (!cart.length) return toast("El carrito está vacío");
  const btn = $("#checkout");
  let logged = false;
  if (db) {
    btn.disabled = true;
    const error = await saveOrder();
    btn.disabled = false;
    if (error) {
      console.error(error);
      return toast("No se pudo registrar el pedido. Intenta de nuevo.");
    }
    const { data } = await db.auth.getSession();
    logged = !!data.session?.user;
  }
  cart = [];
  saveCart();
  openCart(false);
  toast(logged
    ? "Pedido registrado. Míralo en Mi cuenta."
    : "Pedido registrado. Inicia sesión para verlo en Mi cuenta.");
});

async function init() {
  initHero();
  initSearch();
  initContact();
  updateBadge();
  renderCart();

  await loadProducts();

  renderGrid("#featured-grid", PRODUCTS.filter((p) => p.featured));
  renderGrid("#offers-grid", PRODUCTS.filter((p) => p.offer));
  initCatalog();
  renderCart();
}

init();
