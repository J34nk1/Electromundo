const PRODUCTS = [
  {
    id: "hp-victus",
    name: "HP - Victus 15.6\" Gaming Laptop",
    price: 1800,
    category: "laptops",
    image: "img/laptop-hp.jpg",
    featured: true,
    offer: false
  },
  {
    id: "dell-g15",
    name: "Dell - G15 15.6\" Gaming Laptop",
    price: 2000,
    category: "laptops",
    image: "img/laptop-dell.jpg",
    featured: true,
    offer: false
  },
  {
    id: "asus-rog",
    name: "ASUS - ROG Gaming Desktop",
    price: 2500,
    category: "desktops",
    image: "img/pc-asus.jpg",
    featured: true,
    offer: false
  },
  {
    id: "acer-nitro-27",
    name: "Acer - Nitro 27\" Gaming Monitor",
    price: 1800,
    category: "monitores",
    image: "img/monitor-acer.jpg",
    featured: true,
    offer: false
  },
  {
    id: "acer-nitro-27b",
    name: "Acer - Nitro 27\" Gaming Monitor",
    price: 1800,
    category: "monitores",
    image: "img/monitor-acer-2.jpg",
    featured: true,
    offer: false
  },
  {
    id: "lenovo-loq",
    name: "Lenovo - LOQ 15.6\" Gaming Laptop",
    price: 2199,
    oldPrice: 2499,
    category: "laptops",
    image: "img/laptop-cat.jpg",
    featured: false,
    offer: true
  },
  {
    id: "acer-nitro5",
    name: "Acer - Nitro 5 15.6\" Gaming Laptop",
    price: 1699,
    oldPrice: 1999,
    category: "laptops",
    image: "img/laptop-hp.jpg",
    featured: false,
    offer: true
  },
  {
    id: "hp-omen",
    name: "HP - OMEN Desktop Gaming",
    price: 2899,
    category: "desktops",
    image: "img/desktop-cat.jpg",
    featured: false,
    offer: false
  },
  {
    id: "ryzen-pc",
    name: "PC Gamer Ryzen 5 + RTX 4060",
    price: 2399,
    oldPrice: 2799,
    category: "desktops",
    image: "img/pc-asus.jpg",
    featured: false,
    offer: true
  },
  {
    id: "headset-g",
    name: "Audífonos Gamer RGB 7.1",
    price: 189,
    oldPrice: 249,
    category: "accesorios",
    image: "img/accesorios.jpg",
    featured: false,
    offer: true
  },
  {
    id: "mouse-g",
    name: "Mouse Gamer 16000 DPI",
    price: 99,
    category: "accesorios",
    image: "img/accesorios.jpg",
    featured: false,
    offer: false
  },
  {
    id: "lg-ultragear",
    name: "LG - UltraGear 27\" 165Hz",
    price: 1299,
    oldPrice: 1599,
    category: "monitores",
    image: "img/monitor-acer.jpg",
    featured: false,
    offer: true
  }
];

const money = (n) =>
  "S/ " + n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const cartKey = "eletromundo-cart";
let cart = JSON.parse(localStorage.getItem(cartKey) || "[]");

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function saveCart() {
  localStorage.setItem(cartKey, JSON.stringify(cart));
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

function productCard(p) {
  const old = p.oldPrice
    ? `<span class="old-price">${money(p.oldPrice)}</span>`
    : "";
  const priceClass = p.oldPrice ? "price sale" : "price";
  return `
    <article class="card">
      <div class="card-img"><img src="${p.image}" alt="${p.name}"></div>
      <h3>${p.name}</h3>
      <p class="${priceClass}">${old}${money(p.price)}</p>
      <button class="btn-add" data-add="${p.id}">Añadir</button>
    </article>
  `;
}

function renderGrid(target, list) {
  const el = $(target);
  if (!el) return;
  el.innerHTML = list.map(productCard).join("") || `<p class="empty">No hay productos.</p>`;
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
        return `
          <div class="cart-item">
            <img src="${p.image}" alt="">
            <div>
              <h4>${p.name}</h4>
              <p>${money(p.price)}</p>
              <div class="qty">
                <button data-qty="${p.id}" data-d="-1">−</button>
                <span>${item.qty}</span>
                <button data-qty="${p.id}" data-d="1">+</button>
              </div>
            </div>
            <button class="remove" data-remove="${p.id}">Quitar</button>
          </div>
        `;
      })
      .join("");
  }
  const total = cart.reduce((s, i) => {
    const p = PRODUCTS.find((x) => x.id === i.id);
    return s + p.price * i.qty;
  }, 0);
  const totalEl = $("#cart-total");
  if (totalEl) totalEl.textContent = money(total);
}

function toast(msg) {
  let t = $(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._id);
  toast._id = setTimeout(() => t.classList.remove("show"), 1800);
}

function openCart(open) {
  $(".overlay")?.classList.toggle("open", open);
  $(".drawer")?.classList.toggle("open", open);
}

function initHero() {
  const slides = $$(".hero-slide");
  const dots = $$(".hero-dots button");
  if (!slides.length) return;
  let i = 0;
  const show = (n) => {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, idx) => s.classList.toggle("active", idx === i));
    dots.forEach((d, idx) => d.classList.toggle("active", idx === i));
  };
  dots.forEach((d, idx) => d.addEventListener("click", () => show(idx)));
  setInterval(() => show(i + 1), 5000);
}

function initCatalog() {
  const grid = "#catalog-grid";
  if (!$(grid)) return;
  const params = new URLSearchParams(location.search);
  const q = (params.get("q") || "").toLowerCase();
  const catParam = params.get("cat") || "todos";
  let current = catParam;

  const apply = () => {
    let list = PRODUCTS.slice();
    if (current !== "todos") list = list.filter((p) => p.category === current);
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q));
    renderGrid(grid, list);
    $$(".chip").forEach((c) => c.classList.toggle("active", c.dataset.cat === current));
  };

  $$(".chip").forEach((c) =>
    c.addEventListener("click", () => {
      current = c.dataset.cat;
      apply();
    })
  );
  apply();
}

function initSearch() {
  const form = $("#search-form");
  const panel = $(".search-panel");
  $("#search-toggle")?.addEventListener("click", () => {
    panel?.classList.toggle("open");
    $("#search-input")?.focus();
  });
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = $("#search-input").value.trim();
    location.href = `catalogo.html?q=${encodeURIComponent(q)}`;
  });
}

function initContact() {
  $("#contact-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#c-name").value.trim();
    const email = $("#c-email").value.trim();
    const msg = $("#form-msg");
    if (!name || !email) {
      msg.textContent = "Completa nombre y correo.";
      msg.style.color = "#ffb4b4";
      return;
    }
    msg.textContent = "Mensaje enviado. Te contactaremos pronto.";
    msg.style.color = "#86efac";
    e.target.reset();
  });
}

document.addEventListener("click", (e) => {
  const add = e.target.closest("[data-add]");
  if (add) addToCart(add.dataset.add);

  const qty = e.target.closest("[data-qty]");
  if (qty) changeQty(qty.dataset.qty, Number(qty.dataset.d));

  const rem = e.target.closest("[data-remove]");
  if (rem) removeItem(rem.dataset.remove);
});

$("#cart-toggle")?.addEventListener("click", () => openCart(true));
$("#cart-close")?.addEventListener("click", () => openCart(false));
$(".overlay")?.addEventListener("click", () => openCart(false));
$("#menu-toggle")?.addEventListener("click", () => $(".nav")?.classList.toggle("open"));
$("#checkout")?.addEventListener("click", () => {
  if (!cart.length) return toast("El carrito está vacío");
  cart = [];
  saveCart();
  openCart(false);
  toast("Pedido registrado. Gracias por tu compra.");
});

renderGrid("#featured-grid", PRODUCTS.filter((p) => p.featured));
renderGrid("#offers-grid", PRODUCTS.filter((p) => p.offer));
initCatalog();
initHero();
initSearch();
initContact();
updateBadge();
renderCart();
