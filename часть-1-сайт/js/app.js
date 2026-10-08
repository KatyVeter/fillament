/* Общая логика всех страниц: шапка/подвал, корзина, валюты, поиск, отрисовка страниц. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const byId = id => PRODUCTS.find(p => p.id === id);
  const collOf = p => COLLECTIONS.find(c => c.id === p.cat);
  const inStock = p => p.stock !== false;
  const params = new URLSearchParams(location.search);
  const num = n => n.toLocaleString("ru-RU");
  // plural(5, ["товар", "товара", "товаров"]) -> "5 товаров"
  const plural = (n, f) => {
    const a = n % 10, b = n % 100;
    return `${num(n)} ${a === 1 && b !== 11 ? f[0] : a >= 2 && a <= 4 && (b < 12 || b > 14) ? f[1] : f[2]}`;
  };
  const GOODS = ["товар", "товара", "товаров"];

  /* ---------- валюта ---------- */
  let currency = store.get("currency", "USD");
  if (!SITE.currencies[currency]) currency = "USD";
  const money = usd => {
    const c = SITE.currencies[currency];
    return c.symbol + (usd * c.rate).toFixed(2);
  };
  const unitPrice = (p, weight) => +(p.price * (weight === 3 ? 2.6 : 1)).toFixed(2);

  /* ---------- изображения товаров (заглушки, пока нет настоящих фото) ---------- */
  let uid = 0;
  function spool(hex) {
    const g = "sg" + ++uid;
    const rings = [78, 72, 66, 60, 54].map(r => `<circle cx="100" cy="100" r="${r}" fill="none" stroke="rgba(0,0,0,.16)" stroke-width="1.5"/>`).join("");
    const holes = [0, 60, 120, 180, 240, 300].map(a => {
      const x = 100 + 30 * Math.cos(a * Math.PI / 180), y = 100 + 30 * Math.sin(a * Math.PI / 180);
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="#0b0c06"/>`;
    }).join("");
    return `<svg class="spool" viewBox="0 0 200 200" aria-hidden="true"><defs><radialGradient id="${g}" cx="32%" cy="28%" r="80%"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></radialGradient></defs>
      <circle cx="100" cy="100" r="97" fill="#1d1f14" stroke="#4a4630" stroke-width="2"/>
      <circle cx="100" cy="100" r="85" fill="${hex}"/>${rings}
      <circle cx="100" cy="100" r="85" fill="url(#${g})"/>
      <circle cx="100" cy="100" r="47" fill="#17180e" stroke="#c9a14a" stroke-width="1.5"/>${holes}
      <circle cx="100" cy="100" r="12" fill="#0b0c06" stroke="#c9a14a" stroke-width="1.5"/></svg>`;
  }
  function box(hex) {
    return `<svg class="spool" viewBox="0 0 200 200" aria-hidden="true">
      <rect x="28" y="52" width="144" height="112" rx="18" fill="${hex}" stroke="#4a4630" stroke-width="2"/>
      <rect x="28" y="52" width="144" height="112" rx="18" fill="rgba(0,0,0,.18)"/>
      <rect x="44" y="68" width="112" height="56" rx="10" fill="rgba(0,0,0,.45)" stroke="#c9a14a" stroke-width="1.2"/>
      <circle cx="100" cy="96" r="20" fill="none" stroke="#c9a14a" stroke-width="1.5"/><circle cx="100" cy="96" r="6" fill="#c9a14a"/>
      <rect x="60" y="138" width="46" height="10" rx="5" fill="#c9a14a"/><circle cx="134" cy="143" r="6" fill="rgba(0,0,0,.5)" stroke="#c9a14a"/></svg>`;
  }
  // цвет на карточке по умолчанию: по возможности яркий, чтобы сетка не была стеной чёрных катушек
  function heroColor(p) {
    const vivid = p.colors.slice(0, 7).filter(c => !NEUTRAL_COLORS.includes(c.name));
    return vivid.length ? vivid[PRODUCTS.indexOf(p) % vivid.length] : p.colors[0];
  }
  /* Катушка в объёме: название материала на боковине, фактура пластика и
     напечатанный предмет рядом — свой для каждой коллекции. */
  const GOLD = "rgba(226,190,115,.6)";
  const shade = (pts, a) => `<polygon points="${pts}" fill="rgba(${a > 0 ? "255,255,255" : "0,0,0"},${Math.abs(a)})"/>`;
  const PRINTS = {
    // калибровочный куб
    general: hex => {
      const t = "28,6 54,19 28,32 2,19", l = "2,19 28,32 28,62 2,49", r = "28,32 54,19 54,49 28,62";
      return `<polygon points="28,6 54,19 54,49 28,62 2,49 2,19" fill="${hex}" stroke="${GOLD}" stroke-width=".8"/>${shade(t, .28)}${shade(l, -.12)}${shade(r, -.36)}`;
    },
    // витая ваза
    aesthetic: hex => `<path d="M18 4H38C36 16 52 26 50 42C48 56 40 62 28 62C16 62 8 56 6 42C4 26 20 16 18 4Z" fill="${hex}" stroke="${GOLD}" stroke-width=".8"/>
      <path d="M21 5C16 24 36 40 22 61M28 5C24 24 46 40 32 62M35 5C34 22 52 38 42 59" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="1.6"/>
      <path d="M12 40C12 30 20 22 22 10" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="2" stroke-linecap="round"/>`,
    // молния и линии скорости
    highspeed: hex => `<path d="M-14 22H4M-20 34H0M-12 46H6" stroke="${GOLD}" stroke-width="1.6" stroke-linecap="round"/>
      <polygon points="34,0 8,36 25,36 17,64 50,24 31,24 42,0" fill="${hex}" stroke="${GOLD}" stroke-width=".8"/>${shade("34,0 8,36 25,36 31,24 42,0", .22)}`,
    // гайка
    functional: hex => {
      const h = "28,4 54,19 54,49 28,64 2,49 2,19";
      return `<polygon points="${h}" fill="${hex}" stroke="${GOLD}" stroke-width=".8"/>${shade("28,4 54,19 28,34 2,19", .22)}${shade("28,34 54,19 54,49 28,64", -.32)}
        <circle cx="28" cy="34" r="12" fill="#0b0c06" stroke="${GOLD}" stroke-width=".8"/>`;
    },
    // шестерня
    engineering: hex => {
      const teeth = [0, 45, 90, 135, 180, 225, 270, 315].map(a => `<rect x="22" y="2" width="12" height="14" rx="2" transform="rotate(${a} 28 34)"/>`).join("");
      return `<g fill="${hex}" stroke="${GOLD}" stroke-width=".8">${teeth}<circle cx="28" cy="34" r="22"/></g>
        <circle cx="28" cy="34" r="22" fill="rgba(255,255,255,.1)"/><circle cx="28" cy="34" r="15" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="2"/>
        <circle cx="28" cy="34" r="8" fill="#0b0c06" stroke="${GOLD}" stroke-width=".8"/>`;
    },
  };
  // фактура намотки по типу материала
  function finish(p) {
    const id = p.id;
    if (id.includes("silk")) return `<rect x="40" y="30" width="110" height="140" fill="url(#silk)"/>`;
    if (id.includes("marble")) return [[60, 60], [82, 48], [104, 70], [70, 96], [96, 110], [120, 92], [58, 128], [88, 142], [112, 150], [128, 56], [76, 76], [124, 126]]
      .map(([x, y], k) => `<circle cx="${x}" cy="${y}" r="${1.2 + (k % 3) * .7}" fill="rgba(30,30,30,.55)"/>`).join("");
    if (id.includes("wood")) return `<path d="M44 62Q92 52 142 64M44 86Q96 94 142 84M44 112Q90 102 142 114M44 138Q98 146 142 136" fill="none" stroke="rgba(60,30,10,.4)" stroke-width="2.2"/>`;
    if (id.includes("-cf")) return `<path d="${[...Array(14)].map((_, k) => `M${30 + k * 10} 170L${70 + k * 10} 30`).join("")}" stroke="rgba(255,255,255,.13)" stroke-width="2.5"/>`;
    return "";
  }
  function spool3d(p, hex) {
    const u = ++uid, name = p.label || p.name;
    const fs = Math.min(15, 104 / name.length).toFixed(1);
    const lines = [102, 110, 118, 126, 134].map(x => `<ellipse cx="${x}" cy="100" rx="51" ry="66" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="1.4"/>`).join("");
    const glow = p.id.includes("glow") ? ` style="filter:drop-shadow(0 0 9px ${hex})"` : "";
    const matte = p.id.includes("matte") || p.id.includes("-cf");
    return `<svg class="spool s3d" viewBox="0 0 250 200" aria-hidden="true"${glow}><defs>
        <clipPath id="b${u}"><path d="M95 34H146V166H95A51 66 0 0 1 95 34Z"/></clipPath>
        <linearGradient id="v${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="${matte ? .16 : .42}"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></linearGradient>
        <linearGradient id="silk" x1="0" y1="0" x2="0" y2="1"><stop offset=".1" stop-color="#fff" stop-opacity="0"/><stop offset=".2" stop-color="#fff" stop-opacity=".65"/><stop offset=".32" stop-color="#fff" stop-opacity="0"/><stop offset=".55" stop-color="#fff" stop-opacity=".3"/><stop offset=".7" stop-color="#fff" stop-opacity="0"/></linearGradient>
        <radialGradient id="f${u}" cx="35%" cy="25%" r="85%"><stop offset="0" stop-color="#2c2a1c"/><stop offset="1" stop-color="#0c0c07"/></radialGradient></defs>
      <ellipse cx="128" cy="186" rx="100" ry="8" fill="rgba(0,0,0,.4)"/>
      <ellipse cx="88" cy="100" rx="56" ry="77" fill="#0d0e08" stroke="#34311f" stroke-width="1.5"/>
      <g clip-path="url(#b${u})"><rect x="40" y="30" width="110" height="140" fill="${hex}"/>${lines}${finish(p)}<rect x="40" y="30" width="110" height="140" fill="url(#v${u})"/></g>
      <ellipse cx="146" cy="100" rx="60" ry="80" fill="url(#f${u})" stroke="#6b5c30" stroke-width="1.5"/>
      <ellipse cx="146" cy="100" rx="54" ry="73" fill="none" stroke="${GOLD}" stroke-width=".6" opacity=".6"/>
      <path d="M96 128C122 112 150 176 200 118M100 142C126 124 152 184 196 134" fill="none" stroke="${GOLD}" stroke-width=".8" opacity=".55"/>
      <ellipse cx="150" cy="106" rx="19" ry="25" fill="#050503" stroke="${GOLD}" stroke-width=".8"/><ellipse cx="146" cy="106" rx="12" ry="19" fill="#1b1b12"/>
      <text x="146" y="58" text-anchor="middle" font-family="Manrope,Arial,sans-serif" font-weight="800" font-size="${fs}" fill="#e9c97f">${esc(name)}</text>
      <text x="146" y="68" text-anchor="middle" font-family="Manrope,Arial,sans-serif" font-weight="600" font-size="4.6" letter-spacing="1.4" fill="#a8946a">3D FILAMENT</text>
      <g transform="translate(136 140)" fill="#e2be73"><polygon points="10,0 12.5,0 20,18 15.5,18 8.5,3"/><polygon points="7.4,5.6 9.5,9.4 3,13.2"/><path d="M0 18Q5 12.4 11 12.4L13.4 16.4Q6 16 0 18Z"/></g>
      <g transform="translate(186 122)">${(PRINTS[p.cat] || PRINTS.general)(hex)}</g></svg>`;
  }
  const art = (p, hex) => (p.type === "box" ? box(hex || heroColor(p).hex) : spool3d(p, hex || heroColor(p).hex));

  /* ---------- корзина и избранное ---------- */
  let cart = store.get("cart", []).filter(l => byId(l.id));
  let wish = store.get("wish", []);
  const cartCount = () => cart.reduce((n, l) => n + l.qty, 0);
  const subtotal = () => cart.reduce((s, l) => s + unitPrice(byId(l.id), l.weight) * l.qty, 0);
  function addToCart(id, color, weight, qty = 1) {
    const p = byId(id);
    if (!p || !inStock(p)) return;
    color = color || heroColor(p).name;
    weight = weight ?? p.weights[0] ?? null;
    const line = cart.find(l => l.id === id && l.color === color && l.weight === weight);
    line ? (line.qty += qty) : cart.push({ id, color, weight, qty });
    saveCart();
    toast(`${p.name} — добавлено в корзину`);
    openDrawer();
  }
  function saveCart() {
    cart = cart.filter(l => l.qty > 0);
    store.set("cart", cart);
    renderCart();
    document.dispatchEvent(new Event("cart:change"));
  }
  function toggleWish(id) {
    wish = wish.includes(id) ? wish.filter(x => x !== id) : [...wish, id];
    store.set("wish", wish);
    $$(`.wish[data-id="${id}"]`).forEach(b => b.classList.toggle("on", wish.includes(id)));
    $("#wishCount").textContent = wish.length || "";
  }

  /* ---------- шапка и подвал ---------- */
  const ICON = {
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
    bag: '<svg viewBox="0 0 24 24"><path d="M6 8h12l1 12H5L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    menu: '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  };
  const page = document.body.dataset.page;

  function renderLayout() {
    const curOpts = Object.keys(SITE.currencies).map(c => `<option${c === currency ? " selected" : ""}>${c}</option>`).join("");
    const mega = COLLECTIONS.map(c => `<a href="shop.html?cat=${c.id}"><b>${c.name}</b><span>${c.short}</span></a>`).join("");
    const act = n => (page === n ? ' class="active"' : "");
    $("#header").innerHTML = `
      <div class="topbar"><div class="wrap">
        <div class="topbar-left"><b>Бесплатная доставка по миру</b> <span>при заказе от ${money(SITE.freeShippingFrom)} · возврат 30 дней</span></div>
        <div class="topbar-right"><a href="support.html#wholesale">Оптом</a><a href="support.html#contact">Контакты</a>
          <select id="currency" aria-label="Валюта">${curOpts}</select></div>
      </div></div>
      <header class="header"><div class="wrap">
        <button class="icon-btn burger" id="burger" aria-label="Меню">${ICON.menu}</button>
        <a class="brand" href="index.html"><img src="assets/logo-128.png" alt="Логотип ${SITE.name}"><span>${SITE.name}</span></a>
        <ul class="nav" id="nav">
          <li><a href="shop.html"${act("shop")}>Филаменты</a><div class="mega">${mega}</div></li>
          <li><a href="shop.html?cat=accessories">Аксессуары</a></li>
          <li><a href="compare.html"${act("compare")}>Лаборатория</a></li>
          <li><a href="about.html"${act("about")}>О бренде</a></li>
          <li><a href="support.html"${act("support")}>Поддержка</a></li>
        </ul>
        <div class="header-actions">
          <button class="icon-btn" id="searchBtn" aria-label="Поиск">${ICON.search}</button>
          <a class="icon-btn" href="shop.html?wish=1" aria-label="Избранное">${ICON.heart}<span class="count" id="wishCount">${wish.length || ""}</span></a>
          <button class="icon-btn" id="cartBtn" aria-label="Корзина">${ICON.bag}<span class="count" id="cartCount"></span></button>
        </div>
      </div></header>`;

    const list = arr => arr.map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join("");
    $("#footer").innerHTML = `
      <footer class="footer"><div class="wrap">
        <div class="footer-grid">
          <div><a class="brand" href="index.html"><img src="assets/logo-128.png" alt=""><span>${SITE.name}</span></a>
            <p style="margin-top:16px;max-width:300px">${SITE.tagline}. Точная намотка, вакуумная упаковка, доставка по всему миру.</p>
            <div class="social">${SITE.socials.map(([t, h]) => `<a href="${h}" aria-label="${t}">${t}</a>`).join("")}</div></div>
          <div><h4>Каталог</h4><ul>${list(COLLECTIONS.map(c => [c.name, `shop.html?cat=${c.id}`]))}</ul></div>
          <div><h4>Компания</h4><ul>${list([["О бренде", "about.html"], ["Сертификаты", "about.html#certs"], ["Лаборатория материалов", "compare.html"], ["Оптовым клиентам", "support.html#wholesale"]])}</ul></div>
          <div><h4>Поддержка</h4><ul>${list([["Вопросы и ответы", "support.html#faq"], ["Доставка", "support.html#shipping"], ["Возврат и гарантия", "support.html#returns"], ["Связаться с нами", "support.html#contact"]])}</ul></div>
          <div><h4>Контакты</h4><ul><li><a href="mailto:${SITE.email}">${SITE.email}</a></li><li><a href="#">${SITE.phone}</a></li><li><a href="#">${SITE.address}</a></li></ul></div>
        </div>
        <div class="footer-bottom"><span>© ${new Date().getFullYear()} ${SITE.name}. Все права защищены. · <a href="support.html#privacy">Конфиденциальность</a> · <a href="support.html#terms">Условия</a></span>
          <div class="pay"><span>VISA</span><span>Mastercard</span><span>PayPal</span><span>Apple Pay</span><span>Google Pay</span></div></div>
      </div></footer>
      <div class="overlay" id="overlay"></div>
      <aside class="drawer" id="drawer" aria-label="Корзина">
        <div class="drawer-head"><h3>Корзина</h3><button class="icon-btn" id="drawerClose" aria-label="Закрыть">${ICON.close}</button></div>
        <div class="drawer-body" id="drawerBody"></div><div class="drawer-foot" id="drawerFoot"></div>
      </aside>
      <div class="search-pop" id="searchPop"><div class="wrap"><input id="searchInput" placeholder="Поиск: материал, цвет, аксессуар…" autocomplete="off"><div class="search-res" id="searchRes"></div></div></div>
      <div class="toast" id="toast"></div>`;

    $("#currency").onchange = e => { store.set("currency", e.target.value); location.reload(); };
    $("#burger").onclick = () => $("#nav").classList.toggle("on");
    $("#cartBtn").onclick = openDrawer;
    $("#drawerClose").onclick = closeAll;
    $("#overlay").onclick = closeAll;
    $("#searchBtn").onclick = () => { $("#searchPop").classList.add("on"); $("#overlay").classList.add("on"); $("#searchInput").focus(); runSearch(""); };
    $("#searchInput").oninput = e => runSearch(e.target.value);
    document.addEventListener("keydown", e => e.key === "Escape" && closeAll());
    document.title = document.title.replace("AUREX", SITE.name);
    $$("[data-brand]").forEach(el => (el.textContent = SITE.name));
    $$("[data-email]").forEach(el => { el.textContent = SITE.email; if (el.tagName === "A") el.href = "mailto:" + SITE.email; });
  }

  function openDrawer() { $("#drawer").classList.add("on"); $("#overlay").classList.add("on"); }
  function closeAll() { $$("#drawer,#overlay,#searchPop,#nav").forEach(e => e.classList.remove("on")); }
  let toastT;
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 2200); }

  const haystack = p => [p.name, p.material, collOf(p).name, ...p.colors.map(c => c.name)].join(" ").toLowerCase();
  function runSearch(q) {
    q = q.trim().toLowerCase();
    const hits = PRODUCTS.filter(p => !q || haystack(p).includes(q)).slice(0, 8);
    $("#searchRes").innerHTML = hits.length
      ? hits.map(p => `<a href="product.html?id=${p.id}">${art(p)}<div><b>${p.name}</b><div class="muted">${collOf(p).name} · ${money(p.price)}</div></div></a>`).join("")
      : `<p class="muted">По запросу «${esc(q)}» ничего не найдено.</p>`;
  }

  const lineHTML = l => {
    const p = byId(l.id), hex = (p.colors.find(c => c.name === l.color) || p.colors[0]).hex;
    const key = cart.indexOf(l);
    return `<div class="line"><a class="ph" href="product.html?id=${p.id}">${art(p, hex)}</a>
      <div><b>${p.name}</b><small>${l.color}${l.weight ? " · " + l.weight + " кг" : ""}</small>
        <span class="qty sm"><button data-q="${key}" data-d="-1">−</button><input value="${l.qty}" readonly><button data-q="${key}" data-d="1">+</button></span></div>
      <div style="text-align:right"><b>${money(unitPrice(p, l.weight) * l.qty)}</b><button class="rm" data-rm="${key}">Удалить</button></div></div>`;
  };
  function bindLines(root) {
    $$("[data-q]", root).forEach(b => (b.onclick = () => { cart[+b.dataset.q].qty += +b.dataset.d; saveCart(); }));
    $$("[data-rm]", root).forEach(b => (b.onclick = () => { cart.splice(+b.dataset.rm, 1); saveCart(); }));
  }
  function renderCart() {
    $("#cartCount").textContent = cartCount() || "";
    const body = $("#drawerBody"), foot = $("#drawerFoot");
    if (!cart.length) {
      body.innerHTML = `<div class="empty" style="margin-top:24px">Корзина пуста.</div>`;
      foot.innerHTML = `<a class="btn btn-gold btn-block" href="shop.html">Перейти в каталог</a>`;
      return;
    }
    const sub = subtotal(), left = SITE.freeShippingFrom - sub;
    body.innerHTML = cart.map(lineHTML).join("");
    foot.innerHTML = `
      <div class="ship-bar">${left > 0 ? `До бесплатной доставки осталось <b>${money(left)}</b>` : "Вам доступна <b>бесплатная доставка</b>"}
        <div class="bar"><i style="width:${Math.min(100, sub / SITE.freeShippingFrom * 100)}%"></i></div></div>
      <div class="tot big"><span>Сумма</span><span>${money(sub)}</span></div>
      <a class="btn btn-gold btn-block" href="cart.html">Оформить заказ</a>
      <button class="btn btn-ghost btn-block" id="keepShopping">Продолжить покупки</button>`;
    $("#keepShopping").onclick = closeAll;
    bindLines(body);
  }

  /* ---------- карточка товара ---------- */
  function card(p) {
    const c = heroColor(p);
    const badge = !inStock(p) ? `<span class="badge out">Нет в наличии</span>` : p.badge ? `<span class="badge${p.badge === SALE_BADGE ? " sale" : ""}">${p.badge}</span>` : "";
    const sws = p.colors.slice(0, 7).map(x => `<button class="sw${x === c ? " on" : ""}" style="background:${x.hex}" title="${x.name}" data-hex="${x.hex}" data-color="${x.name}"></button>`).join("");
    return `<article class="pcard" data-id="${p.id}" data-color="${c.name}" style="--c:${c.hex}">
      ${badge}<button class="wish${wish.includes(p.id) ? " on" : ""}" data-id="${p.id}" aria-label="В избранное">${ICON.heart}</button>
      <a class="pcard-img" href="product.html?id=${p.id}">${art(p, c.hex)}</a>
      <div class="pcard-body">
        <span class="pcard-cat">${collOf(p).name}</span>
        <h3><a href="product.html?id=${p.id}">${p.name}</a></h3>
        <div class="rating"><span class="stars">★</span>${p.rating} <span>(${num(p.reviews)})</span></div>
        <div class="swatches">${sws}${p.colors.length > 7 ? `<span class="sw-more">+${p.colors.length - 7}</span>` : ""}</div>
        <div class="price-row"><span class="price">${money(p.price)}${p.old ? `<s>${money(p.old)}</s>` : ""}</span>
          ${inStock(p) ? `<button class="add-btn" data-add="${p.id}" aria-label="В корзину">+</button>` : ""}</div>
      </div></article>`;
  }
  function bindCards(root = document) {
    $$(".pcard", root).forEach(el => {
      const p = byId(el.dataset.id);
      $$(".sw", el).forEach(s => (s.onclick = () => {
        $$(".sw", el).forEach(x => x.classList.toggle("on", x === s));
        el.dataset.color = s.dataset.color;
        el.style.setProperty("--c", s.dataset.hex);
        $(".pcard-img", el).innerHTML = art(p, s.dataset.hex);
      }));
      const add = $("[data-add]", el);
      if (add) add.onclick = () => addToCart(p.id, el.dataset.color);
      $(".wish", el).onclick = () => toggleWish(p.id);
    });
  }
  const fill = (sel, items) => { const el = $(sel); if (el) { el.innerHTML = items.map(card).join(""); bindCards(el); } };

  /* Рамка для золотых иллюстраций: свечение, арка и общий стиль линий. */
  function goldFrame(inner) {
    return `<svg viewBox="0 0 320 180" aria-hidden="true"><defs>
        <linearGradient id="pg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6dc9a"/><stop offset=".5" stop-color="#c9973f"/><stop offset="1" stop-color="#f0cf85"/></linearGradient>
        <radialGradient id="ph" cx="50%" cy="45%" r="50%"><stop offset="0" stop-color="#e2be73" stop-opacity=".28"/><stop offset="1" stop-color="#e2be73" stop-opacity="0"/></radialGradient></defs>
      <circle cx="160" cy="104" r="96" fill="url(#ph)"/><circle cx="160" cy="118" r="84" fill="#14150c" stroke="url(#pg)" stroke-width="1.2" opacity=".9"/>
      <g fill="none" stroke="url(#pg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" font-family="Manrope,Arial,sans-serif">${inner}</g></svg>`;
  }
  const G = 'fill="url(#pg)" stroke="none"';
  const STEP_ART = {
    // бункер с гранулами
    pellets: goldFrame(`<path d="M104 34H216L182 92H138Z" fill="rgba(226,190,115,.14)"/><path d="M138 92h44v14h-44Z" fill="#0d0e08"/>
      ${[[128, 46], [146, 44], [164, 47], [182, 45], [198, 47], [138, 58], [156, 60], [174, 58], [190, 60], [148, 72], [166, 74], [180, 72], [158, 86]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" ${G}/>`).join("")}
      <circle cx="160" cy="120" r="4" ${G} opacity=".9"/><circle cx="152" cy="136" r="3.5" ${G} opacity=".7"/><circle cx="168" cy="146" r="3" ${G} opacity=".5"/><circle cx="158" cy="158" r="2.5" ${G} opacity=".35"/>
      <circle cx="236" cy="112" r="17" fill="#0d0e08"/><path d="M228 112l6 6 11-12" stroke-width="3"/>`),
    // нить под лазерным замером
    laser: goldFrame(`<path d="M44 104H276" stroke-width="9"/><path d="M44 104H276" stroke="rgba(255,255,255,.35)" stroke-width="2" transform="translate(0 -3)"/>
      <rect x="140" y="26" width="40" height="24" rx="5" fill="#0d0e08"/><rect x="140" y="150" width="40" height="18" rx="5" fill="#0d0e08"/>
      <path d="M160 50V96M160 112v38" stroke="#ff8a6a" stroke-width="2" stroke-dasharray="3 5"/><circle cx="160" cy="104" r="12" stroke="#ff8a6a" stroke-width="1.5"/>
      <rect x="196" y="40" width="96" height="40" rx="8" fill="#0d0e08"/><text x="244" y="58" text-anchor="middle" font-size="13" font-weight="800" fill="#e9c97f" stroke="none">1,75 мм</text><text x="244" y="72" text-anchor="middle" font-size="9" font-weight="700" fill="#9ed68a" stroke="none">± 0,02 ✓</text>`),
    // катушка с витками один к одному
    winding: goldFrame(`<circle cx="170" cy="100" r="66" fill="#0d0e08"/>${[58, 50, 42, 34, 26].map((r, k) => `<circle cx="170" cy="100" r="${r}" stroke-width="5" opacity="${1 - k * .13}"/>`).join("")}
      <circle cx="170" cy="100" r="15" fill="#17180e"/><circle cx="170" cy="100" r="4" ${G}/>
      <path d="M30 158C70 158 96 150 112 132" stroke-width="3"/><path d="M24 158h10" stroke-width="3"/>`),
    // коробка, вакуум и самолёт
    box: goldFrame(`<polygon points="150,58 206,84 150,110 94,84" fill="rgba(226,190,115,.3)"/><polygon points="94,84 150,110 150,166 94,140" fill="rgba(226,190,115,.14)"/><polygon points="150,110 206,84 206,140 150,166" fill="rgba(226,190,115,.06)"/>
      <path d="M122 71l56 26M122 97v22" stroke-width="1.4" opacity=".8"/>
      <path d="M214 60l58-30-18 54-14-18Z" fill="url(#pg)" stroke="none"/><path d="M240 66l32-36" stroke="#14150c" stroke-width="1.2"/><path d="M196 74q10-2 18-12" stroke-dasharray="3 5" stroke-width="1.4"/>
      <circle cx="232" cy="130" r="17" fill="#0d0e08"/><text x="232" y="134" text-anchor="middle" font-size="11" font-weight="800" fill="#e9c97f" stroke="none">24 ч</text>`),
  };

  const STAR = (x, y, s) => `<path d="M${x} ${y - 3 * s}l${s} ${2 * s} ${2 * s} ${s}-${2 * s} ${s}-${s} ${2 * s}-${s}-${2 * s}-${2 * s}-${s} ${2 * s}-${s}Z" ${G}/>`;
  const FIND_ART = {
    // росток из калибровочного куба
    beginner: goldFrame(`<polygon points="160,112 196,128 160,144 124,128" fill="rgba(226,190,115,.3)"/><polygon points="124,128 160,144 160,170 124,154" fill="rgba(226,190,115,.14)"/><polygon points="160,144 196,128 196,154 160,170" fill="rgba(226,190,115,.06)"/>
      <path d="M160 126V70" stroke-width="3"/><path d="M160 92C136 92 124 76 122 58C144 58 158 70 160 92Z" fill="rgba(122,140,60,.55)" stroke="#a9b56a"/><path d="M160 78C184 78 198 62 200 42C176 42 162 56 160 78Z" fill="rgba(122,140,60,.55)" stroke="#a9b56a"/>${STAR(236, 70, 3)}${STAR(92, 100, 2)}`),
    // две шестерни в зацеплении
    strong: goldFrame(`<g fill="rgba(226,190,115,.16)">${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<rect x="126" y="46" width="16" height="18" rx="3" transform="rotate(${a} 134 100)"/>`).join("")}<circle cx="134" cy="100" r="38"/></g>
      <circle cx="134" cy="100" r="24" stroke-width="1.4" opacity=".6"/><circle cx="134" cy="100" r="10" fill="#0d0e08"/>
      <g fill="rgba(226,190,115,.3)">${[22, 82, 142, 202, 262, 322].map(a => `<rect x="204" y="106" width="12" height="14" rx="2.500" transform="rotate(${a} 210 136)"/>`).join("")}<circle cx="210" cy="136" r="22"/></g><circle cx="210" cy="136" r="7" fill="#0d0e08"/>
      <path d="M222 44h44M244 44v24M232 68h24v22h-24Z" stroke-width="1.6"/><text x="244" y="84" text-anchor="middle" font-size="9" font-weight="800" fill="#e9c97f" stroke="none">кг</text>`),
    // солнце, туча и дождь
    outdoor: goldFrame(`<circle cx="126" cy="78" r="26" fill="rgba(226,190,115,.3)"/><path d="M126 36v-10M126 130v-10M84 78h-10M178 78h-10M96 48l-7-7M156 48l7-7M96 108l-7 7" stroke-width="2.4"/>
      <path d="M156 132a22 22 0 0 1 6-43a30 30 0 0 1 56 6a19 19 0 0 1 2 37Z" fill="#14150c"/>
      <path d="M170 144l-6 14M192 144l-6 14M214 144l-6 14" stroke="#8fc7e8" stroke-width="2.4"/>`),
    // гибкая лента
    flexible: goldFrame(`<path d="M52 118C92 44 128 44 160 104S228 164 268 86" stroke-width="16" opacity=".28"/><path d="M52 118C92 44 128 44 160 104S228 164 268 86" stroke-width="9"/>
      <path d="M52 118C92 44 128 44 160 104S228 164 268 86" stroke="rgba(255,255,255,.4)" stroke-width="1.5" transform="translate(0 -2.500)"/>
      <path d="M38 62q-10 16 0 32M34 60l4 2-2 4M282 122q10-16 0-32M286 124l-4-2 2-4" stroke-width="1.6"/>`),
    // витая ваза с искрами
    pretty: goldFrame(`<path d="M144 32H176C172 56 204 74 200 110C196 142 180 158 160 158C140 158 124 142 120 110C116 74 148 56 144 32Z" fill="rgba(226,190,115,.2)"/>
      <path d="M150 34C140 70 184 100 158 156M162 34C156 68 200 96 176 150M138 60C130 96 164 120 140 148" stroke-width="1.6" opacity=".75"/>
      <path d="M128 112C128 92 142 76 146 52" stroke="rgba(255,255,255,.45)" stroke-width="2.500"/>${STAR(230, 54, 4)}${STAR(92, 72, 3)}${STAR(238, 124, 2.500)}${STAR(84, 132, 2)}`),
    // молния и спидометр
    fast: goldFrame(`<path d="M96 138A66 66 0 0 1 224 138" stroke-width="6" opacity=".28"/><path d="M96 138A66 66 0 0 1 214 100" stroke-width="6"/>
      <polygon points="172,30 132,96 158,96 146,150 196,78 168,78 184,30" fill="url(#pg)" stroke="#14150c" stroke-width="2"/>
      <path d="M44 70h36M32 92h40M48 114h28" stroke-width="2.400" opacity=".8"/>
      <text x="252" y="150" text-anchor="middle" font-size="13" font-weight="800" fill="#e9c97f" stroke="none">600</text><text x="252" y="162" text-anchor="middle" font-size="7.500" letter-spacing="1" fill="#a8946a" stroke="none">мм/с</text>`),
  };

  const SUPPORT_ART = {
    // облако с вопросом
    faq: goldFrame(`<path d="M104 44h112a14 14 0 0 1 14 14v52a14 14 0 0 1-14 14h-40l-22 24v-24h-50a14 14 0 0 1-14-14V58a14 14 0 0 1 14-14Z" fill="rgba(226,190,115,.14)"/>
      <path d="M146 72a14 14 0 1 1 20 12c-5 3-6 6-6 12" stroke-width="5"/><circle cx="160" cy="108" r="3.500" ${G}/>${STAR(246, 50, 3)}${STAR(74, 120, 2)}`),
    // грузовик на маршруте
    truck: goldFrame(`<path d="M30 150H290" stroke-dasharray="10 8" stroke-width="1.600" opacity=".7"/>
      <rect x="84" y="62" width="96" height="64" rx="6" fill="rgba(226,190,115,.16)"/><path d="M180 82h34l22 24v20h-56Z" fill="rgba(226,190,115,.3)"/><path d="M192 90h18l12 14h-30Z" fill="#0d0e08" stroke-width="1.200"/>
      <circle cx="116" cy="130" r="13" fill="#0d0e08"/><circle cx="116" cy="130" r="4" ${G}/><circle cx="206" cy="130" r="13" fill="#0d0e08"/><circle cx="206" cy="130" r="4" ${G}/>
      <path d="M40 78h30M30 96h40M46 114h24" stroke-width="2.200" opacity=".8"/><polygon points="132,78 150,86 132,94 114,86" fill="url(#pg)" stroke="none"/>`),
    // стрелка возврата и «30»
    ret: goldFrame(`<path d="M214 100a54 54 0 1 1-18-40" stroke-width="5"/><polygon points="188,40 214,52 192,70" fill="url(#pg)" stroke="none"/>
      <text x="160" y="110" text-anchor="middle" font-size="34" font-weight="800" fill="#e9c97f" stroke="none">30</text><text x="160" y="128" text-anchor="middle" font-size="10" letter-spacing="2" fill="#a8946a" stroke="none">ДНЕЙ</text>`),
    // паллета с коробками
    factory: goldFrame(`<path d="M76 150h168M88 150v10M160 150v10M232 150v10M76 160h168" stroke-width="2.400"/>
      <rect x="92" y="106" width="44" height="40" rx="3" fill="rgba(226,190,115,.14)"/><rect x="138" y="106" width="44" height="40" rx="3" fill="rgba(226,190,115,.24)"/><rect x="184" y="106" width="44" height="40" rx="3" fill="rgba(226,190,115,.14)"/>
      <rect x="114" y="64" width="44" height="40" rx="3" fill="rgba(226,190,115,.3)"/><rect x="160" y="64" width="44" height="40" rx="3" fill="rgba(226,190,115,.18)"/><rect x="138" y="24" width="44" height="38" rx="3" fill="rgba(226,190,115,.12)"/>
      <path d="M114 106v14M160 106v14M206 106v14M136 64v12M182 64v12M160 24v12" stroke-width="1.400" opacity=".8"/>`),
    // щит с галочкой
    shield: goldFrame(`<path d="M160 28l56 20v40c0 36-24 60-56 72-32-12-56-36-56-72V48Z" fill="rgba(226,190,115,.16)"/><path d="M160 44l40 14v30c0 26-16 44-40 54Z" fill="rgba(226,190,115,.14)" stroke="none"/>
      <path d="M136 92l18 18 32-36" stroke-width="6"/>${STAR(250, 60, 3)}${STAR(72, 104, 2.500)}`),
    // вилка и «12 мес.»
    plug: goldFrame(`<path d="M132 34v26M168 34v26" stroke-width="6"/><path d="M116 60h68v22a34 34 0 0 1-68 0Z" fill="rgba(226,190,115,.24)"/><path d="M150 116v18c0 16 20 22 36 14s34 0 44 14" stroke-width="3"/>
      <circle cx="232" cy="74" r="28" fill="#0d0e08"/><text x="232" y="78" text-anchor="middle" font-size="19" font-weight="800" fill="#e9c97f" stroke="none">12</text><text x="232" y="91" text-anchor="middle" font-size="8" letter-spacing="1.500" fill="#a8946a" stroke="none">МЕС.</text>`),
  };

  /* ---------- страницы ---------- */
  const pages = {
    home() {
      // катушки на орбите вокруг логотипа, у каждой подпись материала
      $("#introSpools").innerHTML = [["#d4a94a", "Silk"], ["#6b7036", "PLA"], ["#d8c39a", "PETG"], ["#f2f2ee", "TPU"], ["#b0443a", "ASA"], ["#2b2b30", "CF"]]
        .map(([h, label], k) => `<div class="orb" style="--i:${k}">${spool(h)}<span>${label}</span></div>`).join("");
      // слайды: фото + текст + три факта под ним
      const slides = [
        { img: "assets/hero-cdek.jpg", eye: "Доставка по всему миру",
          h: `Ваша катушка уже <span class="gold-text">в пути</span>`,
          p: "Самолётом, морем или курьером до двери — собираем заказ за 24 часа и везём в 60+ стран. Трек-номер с первой минуты, усиленная упаковка и страховка каждой посылки: катушка приедет такой же ровной, какой сошла с линии.",
          cta: ["Условия доставки", "support.html#shipping"],
          facts: [["60+", "стран доставки"], ["24 ч", "до отправки заказа"], ["100%", "посылок с трек-номером"]] },
        { img: "assets/hero-all.jpg", eye: "Палитра",
          h: `100+ оттенков. <span class="gold-text">Ни одного случайного.</span>`,
          p: "От спокойных природных тонов до смелых акцентов, от матового бархата до шёлкового блеска. Цвет совпадает от партии к партии — докупите катушку через год и не увидите разницы.",
          cta: ["Выбрать свой цвет", "shop.html"],
          facts: [["100+", "цветов в наличии"], ["6", "коллекций и фактур"], ["1:1", "цвет от партии к партии"]] },
        { img: "assets/hero-kach.jpg", eye: "Качество и цена",
          h: `Премиум-качество. <span class="gold-text">Без премиум-наценки.</span>`,
          p: "Первичное сырьё, допуск ±0,02 мм и лазерный контроль каждого метра — а стоит дешевле, чем у многих известных брендов. Мы экономим на посредниках, а не на материале: больше катушек, больше идей, тот же бюджет.",
          cta: ["Смотреть цены", "shop.html"],
          facts: [["±0,02 мм", "допуск диаметра"], ["0", "вторичного сырья"], [money(byId("pla").price), "за 1 кг PLA"]] },
      ];
      const copy = $("#heroCopy"), dots = $("#heroDots"), bg = $("#heroBg");
      bg.innerHTML = slides.map(s => `<div style="background-image:url('${s.img}')"></div>`).join("");
      let i = 0, timer;
      const show = n => {
        i = (n + slides.length) % slides.length;
        copy.classList.add("fade");
        $$("div", bg).forEach((d, k) => d.classList.toggle("on", k === i));
        setTimeout(() => {
          const s = slides[i];
          copy.innerHTML = `<span class="eyebrow">${s.eye}</span><h1>${s.h}</h1><p class="lead">${s.p}</p>
            <div class="hero-cta"><a class="btn btn-gold" href="${s.cta[1]}">${s.cta[0]}</a><a class="btn btn-ghost" href="compare.html">Сравнить материалы</a></div>
            <div class="hero-stats">${s.facts.map(f => `<div><b class="gold-text">${f[0]}</b><span>${f[1]}</span></div>`).join("")}</div>`;
          copy.classList.remove("fade");
        }, 300);
        $$("button", dots).forEach((b, k) => b.classList.toggle("on", k === i));
      };
      dots.innerHTML = slides.map((_, k) => `<button aria-label="Слайд ${k + 1}"></button>`).join("");
      $$("button", dots).forEach((b, k) => (b.onclick = () => { show(k); clearInterval(timer); }));
      show(0);
      timer = setInterval(() => show(i + 1), 8000);

      $("#cats").innerHTML = COLLECTIONS.map((c, k) => {
        const ps = PRODUCTS.filter(p => p.cat === c.id);
        const a = ps[0], b = ps[1] || ps[0];
        // у коллекций с фото (c.img) фон — фотография, у остальных — нарисованные катушки
        return `<a class="cat${k < 2 ? " wide" : ""}${c.img ? " photo" : " full"}" href="shop.html?cat=${c.id}" style="--a:${c.accent}${c.img ? `;--img:url('../${c.img}')` : ""}">
          <div><h3>${c.name}</h3><p>${c.blurb}</p></div><span class="more">${plural(ps.length, GOODS)} →</span>
          ${c.img ? "" : art(a) + art(b, b.colors[0].hex)}</a>`;
      }).join("");

      fill("#bestsellers", [...PRODUCTS].sort((a, b) => b.reviews - a.reviews).slice(0, 8));
      // карусель отзывов: листается по одному, центральный подсвечен, по наведению пауза
      const track = $("#reviews"), rdots = $("#revDots"), n = REVIEWS.length;
      track.innerHTML = [...REVIEWS, ...REVIEWS.slice(0, 3)].map(quote).join("");
      rdots.innerHTML = REVIEWS.map((_, k) => `<button aria-label="Отзыв ${k + 1}"></button>`).join("");
      const cards = $$(".quote", track);
      let ri = 0, rt;
      const perView = () => Math.max(1, Math.round(track.parentElement.offsetWidth / cards[0].offsetWidth));
      const place = animate => {
        track.style.transition = animate ? "" : "none";
        track.style.transform = `translateX(${-ri * (cards[0].offsetWidth + 20)}px)`;
        const mid = ri + Math.floor(perView() / 2);
        cards.forEach((c, k) => c.classList.toggle("mid", k === mid));
        $$("button", rdots).forEach((b, k) => b.classList.toggle("on", k === mid % n));
      };
      const next = () => {
        ri++; place(true);
        if (ri === n) setTimeout(() => { ri = 0; place(false); }, 750); // незаметный возврат к началу
      };
      const play = () => { clearInterval(rt); rt = setInterval(next, 4000); };
      $$("button", rdots).forEach((b, k) => (b.onclick = () => { ri = (k - Math.floor(perView() / 2) + n) % n; place(true); play(); }));
      track.onmouseenter = () => clearInterval(rt);
      track.onmouseleave = play;
      addEventListener("resize", () => place(false));
      place(false); play();
      // иллюстрации к статьям журнала: золотая графика на фоне светящейся арки
      const frame = goldFrame;
      const miniSpool = (x, y, color, label) => `<circle cx="${x}" cy="${y}" r="32" fill="#0d0e08"/><circle cx="${x}" cy="${y}" r="21" stroke="${color}" stroke-width="13"/>
        <circle cx="${x}" cy="${y}" r="32"/><circle cx="${x}" cy="${y}" r="11" fill="#17180e"/><circle cx="${x}" cy="${y}" r="3.5" fill="url(#pg)" stroke="none"/>
        <text x="${x}" y="${y + 52}" text-anchor="middle" font-size="12" font-weight="800" letter-spacing="1" fill="#e9c97f" stroke="none">${label}</text>`;
      const POST_ART = {
        guide: frame(`${miniSpool(84, 84, "#6b7036", "PLA")}${miniSpool(236, 84, "#3b3b40", "ABS")}${miniSpool(160, 70, "#d8c39a", "PETG")}
          <path d="M122 66l8-5M190 61l8 5" stroke-dasharray="2 5"/>`),
        dry: frame(`<path d="M160 30C160 30 120 82 120 108a40 40 0 0 0 80 0C200 82 160 30 160 30Z" fill="url(#pg)" stroke="none"/>
          <path d="M138 108a22 22 0 0 0 14 20" stroke="rgba(255,255,255,.65)" stroke-width="3"/>
          <text x="162" y="116" text-anchor="middle" font-size="17" font-weight="800" fill="#1a1505" stroke="none">10%</text>
          <path d="M88 136q-9-12 0-24t0-24M68 128q-7-9 0-18t0-18M232 136q9-12 0-24t0-24M252 128q7-9 0-18t0-18"/>
          <circle cx="160" cy="100" r="66" stroke-width="1" stroke-dasharray="2 7" opacity=".7"/>`),
        profile: frame(`<rect x="138" y="22" width="44" height="36" rx="6" fill="#0d0e08"/><path d="M146 32h28M146 40h28M146 48h28" stroke-width="1.2" opacity=".7"/>
          <path d="M146 58h28l-9 20h-10Z" fill="url(#pg)" stroke="none"/><circle cx="160" cy="83" r="3.5" fill="#fff3c9" stroke="none"/>
          ${[0, 1, 2, 3, 4].map(k => `<rect x="${104 - k * 4}" y="${90 + k * 11}" width="${112 + k * 8}" height="7" rx="3.5" fill="url(#pg)" stroke="none" opacity="${1 - k * .16}"/>`).join("")}
          <path d="M232 46h56M232 68h56M232 90h56" stroke-width="1.6" opacity=".6"/><circle cx="272" cy="46" r="5" fill="url(#pg)" stroke="none"/><circle cx="246" cy="68" r="5" fill="url(#pg)" stroke="none"/><circle cx="262" cy="90" r="5" fill="url(#pg)" stroke="none"/>
          <text x="58" y="52" text-anchor="middle" font-size="15" font-weight="800" fill="#e9c97f" stroke="none">210°</text><text x="58" y="68" text-anchor="middle" font-size="8" letter-spacing="1" fill="#a8946a" stroke="none">СОПЛО</text>
          <text x="58" y="92" text-anchor="middle" font-size="15" font-weight="800" fill="#e9c97f" stroke="none">60°</text><text x="58" y="108" text-anchor="middle" font-size="8" letter-spacing="1" fill="#a8946a" stroke="none">СТОЛ</text>`),
      };
      const LAB_ART = {
        // лепестковая диаграмма двух материалов
        compare: frame(`<polygon points="160,38 219,81 196,150 124,150 101,81" stroke-width="1.2" opacity=".7"/><polygon points="160,69 189.500,90.500 178,125 142,125 130.500,90.500" stroke-width=".8" opacity=".45"/>
          <path d="M160 100V38M160 100L219 81M160 100L196 150M160 100L124 150M160 100L101 81" stroke-width=".8" opacity=".45"/>
          <polygon points="160,48 209,84 182,132 132,140 120,87" fill="rgba(226,190,115,.3)"/>
          <polygon points="160,72 188,91 192,145 128,146 106,83" fill="rgba(122,140,60,.42)" stroke="#a9b56a"/>
          <circle cx="160" cy="48" r="3.5" fill="url(#pg)" stroke="none"/><circle cx="209" cy="84" r="3.5" fill="url(#pg)" stroke="none"/><circle cx="120" cy="87" r="3.5" fill="url(#pg)" stroke="none"/>`),
        // мишень и стрела
        finder: frame(`<circle cx="156" cy="104" r="58" stroke-width="1.2" opacity=".6"/><circle cx="156" cy="104" r="40"/><circle cx="156" cy="104" r="22" fill="rgba(226,190,115,.18)"/>
          <circle cx="156" cy="104" r="7" fill="url(#pg)" stroke="none"/><path d="M156 34v20M156 154v20M86 104h20M206 104h20" stroke-width="1.2" opacity=".7"/>
          <path d="M246 26L162 98" stroke-width="3"/><path d="M246 26l-4 20M246 26l-20 4M232 40l-4 16M232 40l-16 4" stroke-width="2"/><path d="M158 102l14-4-4 14Z" fill="url(#pg)" stroke="none"/>`),
        // шкала и ползунки
        settings: frame(`<path d="M100 128A60 60 0 0 1 220 128" stroke-width="7" opacity=".28"/><path d="M100 128A60 60 0 0 1 198 82" stroke-width="7"/>
          <path d="M160 128L200 80" stroke-width="3"/><circle cx="160" cy="128" r="8" fill="url(#pg)" stroke="none"/>
          <path d="M92 128h-8M228 128h8M160 60v-8M112 80l-6-6M208 80l6-6" stroke-width="1.4" opacity=".7"/>
          <text x="160" y="160" text-anchor="middle" font-size="16" font-weight="800" fill="#e9c97f" stroke="none">210 °C</text>
          <path d="M40 60v70M56 60v70M264 60v70M280 60v70" stroke-width="1.4" opacity=".5"/><rect x="35" y="74" width="10" height="16" rx="3" fill="url(#pg)" stroke="none"/><rect x="51" y="104" width="10" height="16" rx="3" fill="url(#pg)" stroke="none"/><rect x="259" y="96" width="10" height="16" rx="3" fill="url(#pg)" stroke="none"/><rect x="275" y="66" width="10" height="16" rx="3" fill="url(#pg)" stroke="none"/>`),
        // раскрытая книга
        knowledge: frame(`<path d="M160 62C140 48 110 46 88 54V142C110 134 140 136 160 150Z" fill="rgba(226,190,115,.12)"/><path d="M160 62C180 48 210 46 232 54V142C210 134 180 136 160 150Z" fill="rgba(226,190,115,.2)"/>
          <path d="M102 74c14-4 30-3 44 4M102 92c14-4 30-3 44 4M102 110c14-4 30-3 44 4M174 78c14-7 30-8 44-4M174 96c14-7 30-8 44-4M174 114c14-7 30-8 44-4" stroke-width="1.3" opacity=".7"/>
          <path d="M160 18l4 11 11 4-11 4-4 11-4-11-11-4 11-4Z" fill="url(#pg)" stroke="none"/><path d="M214 22l2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill="url(#pg)" stroke="none" opacity=".8"/><path d="M106 26l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="url(#pg)" stroke="none" opacity=".6"/>`),
      };
      $$("[data-art]").forEach(el => (el.innerHTML = LAB_ART[el.dataset.art] || ""));
      $("#posts").innerHTML = POSTS.map(p => `<a class="post" href="support.html#faq"><div class="post-img">${POST_ART[p.art] || ""}</div><div class="post-body"><small>${p.tag}</small><h3>${p.title}</h3><p>${p.text}</p></div></a>`).join("");
    },

    shop() {
      const state = { cat: params.get("cat") || "all", material: "all", sort: "featured", stock: false, q: "", max: 60, wish: params.get("wish") === "1" };
      if (state.cat !== "all" && !COLLECTIONS.some(c => c.id === state.cat)) state.cat = "all";
      const root = $("#shopRoot");
      const materials = [...new Set(PRODUCTS.map(p => p.material))];
      root.innerHTML = `
        <div class="coll-strip" id="collStrip"></div>
        <div class="shop-tools">
          <input class="field" id="fQ" placeholder="Поиск по каталогу…">
          <select class="field" id="fMat"><option value="all">Все материалы</option>${materials.map(m => `<option>${m}</option>`).join("")}</select>
          <label class="range">Цена до <b id="fMaxV"></b><input type="range" id="fMax" min="15" max="60" step="1" value="60"></label>
          <label class="check"><input type="checkbox" id="fStock"> Только в наличии</label>
          <select class="field" id="fSort"><option value="featured">Рекомендуемые</option><option value="low">Сначала дешевле</option><option value="high">Сначала дороже</option><option value="rating">По рейтингу</option><option value="popular">По популярности</option></select>
        </div>
        <div id="shopOut"></div>`;

      const strip = () => {
        const tabs = [{ id: "all", name: "Все товары", accent: "#e2be73" }, ...COLLECTIONS];
        $("#collStrip").innerHTML = tabs.map(c => {
          const ps = c.id === "all" ? PRODUCTS : PRODUCTS.filter(p => p.cat === c.id);
          const img = c.id === "all" ? "assets/hero-all.jpg" : c.img;
          const s = img ? "" : art(ps[0]);
          return `<button class="coll-tab${img ? " photo" : ""}${state.cat === c.id ? " on" : ""}" data-cat="${c.id}" style="--a:${c.accent}${img ? `;--img:url('../${img}')` : ""}">${s}<span><b>${c.name}</b><small>${plural(ps.length, GOODS)}</small></span></button>`;
        }).join("");
        $$(".coll-tab").forEach(b => (b.onclick = () => { state.cat = b.dataset.cat; state.wish = false; history.replaceState(null, "", state.cat === "all" ? "shop.html" : `shop.html?cat=${state.cat}`); draw(); }));
      };
      const banner = (c, n, all) => `<div class="coll-banner" style="--a:${c.accent}">
          <div><span class="eyebrow" style="color:${c.accent}">${plural(n, GOODS)}</span><h2>${c.name}</h2><p>${c.blurb}</p></div>
          ${all ? `<button class="btn btn-ghost btn-sm" data-go="${c.id}">Вся коллекция →</button>` : ""}</div>`;
      const sorters = {
        featured: () => 0, low: (a, b) => a.price - b.price, high: (a, b) => b.price - a.price,
        rating: (a, b) => b.rating - a.rating, popular: (a, b) => b.reviews - a.reviews,
      };
      function draw() {
        strip();
        $("#fMaxV").textContent = money(state.max);
        let list = PRODUCTS.filter(p =>
          (state.material === "all" || p.material === state.material) && p.price <= state.max && (!state.stock || inStock(p)) &&
          (!state.wish || wish.includes(p.id)) && (!state.q || haystack(p).includes(state.q)));
        list = [...list].sort(sorters[state.sort]);
        const out = $("#shopOut");
        const groups = state.cat === "all" ? COLLECTIONS : COLLECTIONS.filter(c => c.id === state.cat);
        const html = groups.map(c => {
          const ps = list.filter(p => p.cat === c.id);
          return ps.length ? `<section class="coll-block">${banner(c, ps.length, state.cat === "all")}<div class="grid">${ps.map(card).join("")}</div></section>` : "";
        }).join("");
        out.innerHTML = (state.wish ? `<p class="muted" style="margin-bottom:20px">Показано ваше избранное (${wish.length}).</p>` : "") +
          (html || `<div class="empty">Под эти фильтры ничего не подошло. <button class="btn btn-ghost btn-sm" id="reset" style="margin-left:10px">Сбросить фильтры</button></div>`);
        bindCards(out);
        $$("[data-go]", out).forEach(b => (b.onclick = () => { state.cat = b.dataset.go; draw(); window.scrollTo({ top: root.offsetTop - 90, behavior: "smooth" }); }));
        const r = $("#reset"); if (r) r.onclick = () => location.assign("shop.html");
        const c = COLLECTIONS.find(x => x.id === state.cat);
        $("#shopTitle").textContent = state.wish ? "Избранное" : c ? c.name : "Все товары";
      }
      $("#fQ").oninput = e => { state.q = e.target.value.trim().toLowerCase(); draw(); };
      $("#fMat").onchange = e => { state.material = e.target.value; draw(); };
      $("#fMax").oninput = e => { state.max = +e.target.value; draw(); };
      $("#fStock").onchange = e => { state.stock = e.target.checked; draw(); };
      $("#fSort").onchange = e => { state.sort = e.target.value; draw(); };
      draw();
    },

    product() {
      const p = byId(params.get("id")) || PRODUCTS[0];
      const c = collOf(p);
      const isFil = p.weights.length > 0;
      const sel = { color: heroColor(p), weight: p.weights[0] ?? null, qty: 1 };
      document.title = `${p.name} — ${SITE.name}`;
      const specRows = Object.entries(p.specs).map(([k, v]) => `<tr><td>${SPEC_LABELS[k] || k}</td><td>${v}</td></tr>`).join("");
      const props = p.props ? `<div class="props">${Object.entries(p.props).map(([k, v]) => `<div class="prop"><span>${PROP_LABELS[k]}</span><div class="bar"><i style="width:${v * 20}%"></i></div><b>${v}/5</b></div>`).join("")}</div>` : "";
      $("#productRoot").innerHTML = `
        <div class="wrap"><div class="crumbs" style="padding-top:28px;margin:0"><a href="index.html">Главная</a> / <a href="shop.html">Каталог</a> / <a href="shop.html?cat=${c.id}">${c.name}</a> / ${p.name}</div>
        <div class="pdp">
          <div class="pdp-gallery"><div class="pdp-main" id="pdpMain"></div><div class="thumbs" id="thumbs"></div></div>
          <div>
            <span class="pcard-cat">${c.name}${isFil ? " · " + p.material : ""}</span>
            <h1>${isFil ? "Филамент " : ""}${p.name}</h1>
            <div class="rating"><span class="stars">★★★★★</span>${p.rating} · ${plural(p.reviews, ["отзыв", "отзыва", "отзывов"])}</div>
            <div class="price" id="pdpPrice"></div>
            <p class="muted">${p.desc}</p>
            <div class="opt"><div class="opt-label">Цвет: <b id="colorName"></b></div><div class="swatches" id="pdpColors"></div></div>
            ${isFil ? `<div class="opt"><div class="opt-label">Вес катушки</div><div class="pills" id="pdpWeights"></div></div>
            <div class="opt"><div class="opt-label">Диаметр</div><div class="pills"><span class="pill on">1,75 мм</span></div></div>` : ""}
            <div class="stock${inStock(p) ? "" : " out"}">${inStock(p) ? "● В наличии — отправим в течение 24 часов" : "● Нет в наличии — скоро появится"}</div>
            <div class="buy-row">
              <span class="qty"><button id="qMinus">−</button><input id="qVal" value="1" readonly><button id="qPlus">+</button></span>
              <button class="btn btn-gold" style="flex:1" id="pdpAdd"${inStock(p) ? "" : " disabled"}>В корзину</button>
              <button class="btn btn-ghost" id="pdpWish"></button>
            </div>
            <div class="assure"><div><b>Бесплатная доставка</b>от ${money(SITE.freeShippingFrom)}</div><div><b>Возврат 30 дней</b>без лишних вопросов</div><div><b>${isFil ? "±0,02 мм" : "Гарантия 12 мес."}</b>${isFil ? "допуск диаметра" : "на электронику"}</div></div>
          </div>
        </div>
        <div class="tabs" id="tabs"><button class="on" data-t="t1">${p.props ? "Свойства" : "Описание"}</button><button data-t="t2">Характеристики</button><button data-t="t3">Доставка и возврат</button><button data-t="t4">Отзывы</button></div>
        <div id="t1">${props || `<p class="muted">${p.desc}</p>`}${p.props ? `<p class="muted" style="margin-top:26px">Хотите сравнить ${p.name} с другими материалами? <a class="gold-text" href="compare.html?m=${p.id}">Открыть в Лаборатории материалов →</a></p>` : ""}</div>
        <div id="t2" class="hidden"><table class="spec">${specRows}${isFil ? `<tr><td>Диаметр</td><td>1,75 мм ± 0,02 мм</td></tr><tr><td>Катушка</td><td>Перерабатываемый картон, совместима с системами автоподачи</td></tr>` : ""}</table></div>
        <div id="t3" class="hidden"><p class="muted" style="max-width:720px">Заказы отправляются в течение 24 часов в рабочие дни. Стандартная доставка занимает 5–10 рабочих дней в зависимости от страны, экспресс — 2–4 рабочих дня. Невскрытый товар можно вернуть в течение 30 дней с полным возмещением. Подробности — на <a class="gold-text" href="support.html#shipping">странице поддержки</a>.</p></div>
        <div id="t4" class="hidden"><div class="tiles three">${REVIEWS.slice(0, 3).map(quote).join("")}</div></div>
        <section class="section" style="padding-bottom:96px"><div class="section-head"><h2>Вам также может понравиться</h2></div><div class="grid" id="related"></div></section></div>`;

      const wishLabel = () => ($("#pdpWish").textContent = wish.includes(p.id) ? "♥ В избранном" : "♡ В избранное");
      const drawArt = () => {
        const m = $("#pdpMain"); m.innerHTML = art(p, sel.color.hex); m.style.setProperty("--c", sel.color.hex);
        $("#colorName").textContent = sel.color.name;
        $("#pdpPrice").innerHTML = money(unitPrice(p, sel.weight)) + (p.old && sel.weight !== 3 ? `<s>${money(p.old)}</s>` : "");
        $$("#pdpColors .sw, #thumbs button").forEach(s => s.classList.toggle("on", s.dataset.color === sel.color.name));
      };
      $("#pdpColors").innerHTML = p.colors.map(x => `<button class="sw lg" style="background:${x.hex}" title="${x.name}" data-color="${x.name}"></button>`).join("");
      $("#thumbs").innerHTML = p.colors.slice(0, 6).map(x => `<button data-color="${x.name}">${art(p, x.hex)}</button>`).join("");
      $$("#pdpColors .sw, #thumbs button").forEach(s => (s.onclick = () => { sel.color = p.colors.find(x => x.name === s.dataset.color); drawArt(); }));
      if (isFil) {
        $("#pdpWeights").innerHTML = p.weights.map((w, k) => `<button class="pill${k ? "" : " on"}" data-w="${w}">${w} кг</button>`).join("");
        $$("#pdpWeights .pill").forEach(b => (b.onclick = () => { sel.weight = +b.dataset.w; $$("#pdpWeights .pill").forEach(x => x.classList.toggle("on", x === b)); drawArt(); }));
      }
      const setQ = d => { sel.qty = Math.max(1, Math.min(99, sel.qty + d)); $("#qVal").value = sel.qty; };
      $("#qMinus").onclick = () => setQ(-1); $("#qPlus").onclick = () => setQ(1);
      $("#pdpAdd").onclick = () => addToCart(p.id, sel.color.name, sel.weight, sel.qty);
      $("#pdpWish").onclick = () => { toggleWish(p.id); wishLabel(); };
      $$("#tabs button").forEach(b => (b.onclick = () => { $$("#tabs button").forEach(x => x.classList.toggle("on", x === b)); ["t1", "t2", "t3", "t4"].forEach(t => $("#" + t).classList.toggle("hidden", t !== b.dataset.t)); }));
      wishLabel();
      drawArt();
      fill("#related", PRODUCTS.filter(x => x.id !== p.id && x.cat === p.cat).concat(PRODUCTS.filter(x => x.cat !== p.cat)).slice(0, 4));
    },

    compare() {
      const mats = PRODUCTS.filter(p => p.props);
      let picked = [...new Set([params.get("m"), "pla", "petg", "pla-cf"].filter(id => mats.some(m => m.id === id)))].slice(0, 3);
      const MAX = 4;
      function draw() {
        $("#cmpPick").innerHTML = mats.map(m => `<button class="pill${picked.includes(m.id) ? " on" : ""}" data-m="${m.id}">${m.name}</button>`).join("");
        $$("#cmpPick .pill").forEach(b => (b.onclick = () => {
          const id = b.dataset.m;
          if (picked.includes(id)) picked = picked.filter(x => x !== id);
          else if (picked.length < MAX) picked.push(id);
          else return toast(`Одновременно можно сравнить до ${MAX} материалов`);
          draw();
        }));
        const ps = picked.map(byId);
        if (!ps.length) { $("#cmpOut").innerHTML = `<div class="empty">Выберите хотя бы один материал выше.</div>`; return; }
        const row = (label, fn) => `<tr><td>${label}</td>${ps.map(p => `<td>${fn(p)}</td>`).join("")}</tr>`;
        $("#cmpOut").innerHTML = `<div class="cmp-wrap"><table class="spec">
          <tr><th></th>${ps.map(p => `<th><div style="width:84px;margin-bottom:10px">${art(p)}</div>${p.name}</th>`).join("")}</tr>
          ${Object.keys(PROP_LABELS).map(k => row(PROP_LABELS[k], p => `<div class="bar"><i style="width:${p.props[k] * 20}%"></i></div>`)).join("")}
          ${Object.keys(SPEC_LABELS).map(k => row(SPEC_LABELS[k], p => p.specs[k])).join("")}
          ${row("Коллекция", p => collOf(p).name)}
          ${row("Цветов", p => p.colors.length)}
          ${row("Цена от", p => `<b>${money(p.price)}</b>`)}
          ${row("", p => `<a class="btn btn-gold btn-sm" href="product.html?id=${p.id}">Подробнее</a>`)}
        </table></div>`;
      }
      draw();
      const picks = { beginner: ["pla", "pla-plus"], strong: ["petg-cf", "pa12-cf"], outdoor: ["asa", "petg"], flexible: ["tpu-95a"], pretty: ["pla-silk", "pla-matte"], fast: ["hs-pla", "hs-petg"] };
      $$("[data-art]").forEach(a => (a.innerHTML = FIND_ART[a.dataset.art] || ""));
      $$("[data-find]").forEach(b => {
        $(".find-mats", b).innerHTML = picks[b.dataset.find].map(id => `<span>${byId(id).name}</span>`).join("");
        b.onclick = () => {
          picked = [...picks[b.dataset.find]]; draw();
          $$("[data-find]").forEach(x => x.classList.toggle("on", x === b));
          $("#cmpPick").scrollIntoView({ behavior: "smooth", block: "center" });
        };
      });
    },

    cart() {
      const root = $("#checkoutRoot");
      let ship = "standard";
      function draw() {
        if (!cart.length) { root.innerHTML = `<div class="empty" style="margin:64px 0 96px">Корзина пуста. <a class="btn btn-gold btn-sm" href="shop.html" style="margin-left:10px">В каталог</a></div>`; return; }
        const sub = subtotal();
        const free = sub >= SITE.freeShippingFrom;
        const shipCost = ship === "express" ? SITE.shippingExpress : free ? 0 : SITE.shippingFlat;
        const sumEl = $("#sumBox");
        const sumHTML = `<h3>Ваш заказ</h3><div id="sumLines">${cart.map(lineHTML).join("")}</div>
          <div style="display:grid;gap:10px;margin-top:18px">
            <div class="tot"><span>Товары</span><span>${money(sub)}</span></div>
            <div class="tot"><span>Доставка</span><span>${shipCost ? money(shipCost) : "Бесплатно"}</span></div>
            <div class="tot big"><span>Итого</span><span>${money(sub + shipCost)}</span></div></div>`;
        if (sumEl) { sumEl.innerHTML = sumHTML; bindLines(sumEl); $("#stdPrice").textContent = free ? "Бесплатно" : money(SITE.shippingFlat); return; }
        root.innerHTML = `<div class="checkout">
          <form id="orderForm">
            <div class="box"><h3>Контакты</h3><div class="form-grid">
              <label class="full">Email<input class="field sq" type="email" required placeholder="you@example.com"></label></div></div>
            <div class="box"><h3>Адрес доставки</h3><div class="form-grid">
              <label>Имя<input class="field sq" required></label><label>Фамилия<input class="field sq" required></label>
              <label class="full">Адрес<input class="field sq" required></label>
              <label>Город<input class="field sq" required></label><label>Почтовый индекс<input class="field sq" required></label>
              <label class="full">Страна<select class="field sq" required><option value="">Выберите страну</option>${COUNTRIES.map(c => `<option>${c}</option>`).join("")}</select></label></div></div>
            <div class="box"><h3>Способ доставки</h3>
              <label class="radio"><input type="radio" name="ship" value="standard" checked> Стандартная · 5–10 рабочих дней <span id="stdPrice">${free ? "Бесплатно" : money(SITE.shippingFlat)}</span></label>
              <label class="radio"><input type="radio" name="ship" value="express"> Экспресс · 2–4 рабочих дня <span>${money(SITE.shippingExpress)}</span></label></div>
            <div class="box"><h3>Оплата</h3><p class="note">Это демо-шаблон: оплата не списывается. Перед запуском сюда подключается платёжная система (Stripe, PayPal и т. д.).</p>
              <button class="btn btn-gold btn-block" style="margin-top:16px">Оформить заказ</button></div>
          </form>
          <div class="box" id="sumBox" style="position:sticky;top:96px">${sumHTML}</div></div>`;
        bindLines($("#sumBox"));
        $$("[name=ship]").forEach(r => (r.onchange = () => { ship = r.value; draw(); }));
        $("#orderForm").onsubmit = e => {
          e.preventDefault();
          const no = "DEMO-" + Math.floor(100000 + Math.random() * 900000);
          cart = []; store.set("cart", cart); renderCart();
          root.innerHTML = `<div class="newsletter" style="margin:64px 0 96px"><span class="eyebrow">Заказ ${no}</span><h2 class="h2">Спасибо — заказ оформлен</h2><p class="muted" style="margin-top:12px">Это демонстрационное подтверждение. Оплата не списана, отправка не производится.</p><a class="btn btn-gold" style="margin-top:26px" href="shop.html">Продолжить покупки</a></div>`;
          window.scrollTo({ top: 0 });
        };
      }
      draw();
      document.addEventListener("cart:change", draw);
    },

    about() {
      const el = $("#aboutReviews"); if (el) el.innerHTML = REVIEWS.slice(3, 6).map(quote).join("");
      $$("[data-art]").forEach(a => (a.innerHTML = STEP_ART[a.dataset.art] || ""));
    },
    support() {
      $$("[data-art]").forEach(a => (a.innerHTML = SUPPORT_ART[a.dataset.art] || ""));
      // живой поиск по вопросам
      const items = $$("#faqList details");
      $("#faqSearch").oninput = e => {
        const q = e.target.value.trim().toLowerCase();
        let shown = 0;
        items.forEach(d => { const hit = !q || d.textContent.toLowerCase().includes(q); d.classList.toggle("hidden", !hit); d.open = hit && !!q; shown += hit; });
        if (!q) items[0].open = true;
        $("#faqEmpty").classList.toggle("hidden", shown > 0);
        if (q && e.isTrusted) $("#faq").scrollIntoView({ behavior: "smooth", block: "start" });
      };
    },
  };

  function quote(r) {
    return `<div class="quote"><span class="stars">★★★★★</span><p>«${r.text}»</p><div class="who"><span class="avatar">${r.name[0]}</span><div><b>${r.name}</b><div class="muted">${r.place}</div></div></div></div>`;
  }

  /* ---------- демо-формы и появление блоков ---------- */
  function bindForms() {
    $$("form[data-demo]").forEach(f => (f.onsubmit = e => { e.preventDefault(); f.reset(); toast(f.dataset.demo); }));
  }
  function reveal() {
    const els = $$(".reveal");
    if (!("IntersectionObserver" in window)) return els.forEach(e => e.classList.add("in"));
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
    els.forEach(e => io.observe(e));
  }

  renderLayout();
  renderCart();
  if (pages[page]) pages[page]();
  bindForms();
  reveal();
})();
