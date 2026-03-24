// ===========================
// MAVN — E-Commerce JavaScript
// ===========================
 
// ---- PRODUCT DATA ----
const products = [
  { id: 1, name: 'Canvas Tote Bag',      category: 'bags',        price: 48,  emoji: '🎒', tag: 'new'  },
  { id: 2, name: 'Leather Crossbody',    category: 'bags',        price: 125, emoji: '👜', tag: 'hot'  },
  { id: 3, name: 'Woven Market Bag',     category: 'bags',        price: 38,  emoji: '🧺', tag: null   },
  { id: 4, name: 'Linen Shirt',          category: 'apparel',     price: 72,  emoji: '👔', tag: 'new'  },
  { id: 5, name: 'Classic Tee',          category: 'apparel',     price: 34,  oldPrice: 48, emoji: '👕', tag: 'sale' },
  { id: 6, name: 'Cashmere Sweater',     category: 'apparel',     price: 168, emoji: '🧥', tag: 'hot'  },
  { id: 7, name: 'Soy Wax Candle',       category: 'home',        price: 28,  emoji: '🕯️', tag: 'new'  },
  { id: 8, name: 'Ceramic Mug Set',      category: 'home',        price: 54,  emoji: '☕', tag: null   },
  { id: 9, name: 'Linen Throw Pillow',   category: 'home',        price: 42,  oldPrice: 58, emoji: '🛋️', tag: 'sale' },
  { id: 10, name: 'Minimal Watch',       category: 'accessories', price: 195, emoji: '⌚', tag: 'hot'  },
  { id: 11, name: 'Silver Ring Set',     category: 'accessories', price: 62,  emoji: '💍', tag: 'new'  },
  { id: 12, name: 'Sun Hat',             category: 'accessories', price: 46,  emoji: '👒', tag: null   },
];
 
// ---- STATE ----
let cart = JSON.parse(localStorage.getItem('mavn_cart') || '[]');
let currentFilter = 'all';
let wishlist = new Set(JSON.parse(localStorage.getItem('mavn_wishlist') || '[]'));
 
// ---- SAVE TO STORAGE ----
function saveCart()     { localStorage.setItem('mavn_cart', JSON.stringify(cart)); }
function saveWishlist() { localStorage.setItem('mavn_wishlist', JSON.stringify([...wishlist])); }
 
// ---- RENDER PRODUCTS ----
function renderProducts(filter = 'all') {
  const grid = document.getElementById('productGrid');
  const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);
 
  grid.innerHTML = filtered.map((p, i) => `
    <div class="product-card" style="animation-delay:${i * 0.05}s" data-id="${p.id}">
      <div class="product-img">
        ${p.tag ? `<span class="product-tag ${p.tag}">${p.tag === 'sale' ? 'Sale' : p.tag === 'new' ? 'New' : '🔥 Hot'}</span>` : ''}
        <span class="wishlist-btn" data-id="${p.id}" title="Wishlist">${wishlist.has(p.id) ? '❤️' : '🤍'}</span>
        <span style="font-size:60px">${p.emoji}</span>
      </div>
      <div class="product-info">
        <div class="product-cat">${p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-bottom">
          <div class="product-price">
            ${p.oldPrice ? `<span class="old-price">$${p.oldPrice}</span>` : ''}
            $${p.price}
          </div>
          <button class="add-btn" data-id="${p.id}" title="Add to cart">+</button>
        </div>
      </div>
    </div>
  `).join('');
 
  // Attach events
  grid.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      addToCart(Number(btn.dataset.id));
    });
  });
 
  grid.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      toggleWishlist(Number(btn.dataset.id), btn);
    });
  });
 
  grid.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => {
      const p = products.find(x => x.id === Number(card.dataset.id));
      showToast(`📦 ${p.name} — $${p.price}`);
    });
  });
}
 
// ---- FILTER TABS ----
document.querySelectorAll('.filter-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentFilter = tab.dataset.filter;
    renderProducts(currentFilter);
  });
});
 
// ---- CATEGORY CARDS ----
document.querySelectorAll('.cat-item').forEach(item => {
  item.addEventListener('click', () => {
    const filter = item.dataset.filter;
    document.querySelectorAll('.cat-item').forEach(c => c.classList.remove('active'));
    item.classList.add('active');
 
    // Sync filter tabs
    document.querySelectorAll('.filter-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.filter === filter);
    });
 
    currentFilter = filter;
    renderProducts(filter);
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
  });
});
 
// ---- CART ----
function addToCart(id) {
  const product = products.find(p => p.id === id);
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
  updateCartUI();
  showToast(`✓ ${product.name} added to cart`);
  animateCartBtn();
}
 
function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  updateCartUI();
  renderCartItems();
}
 
function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) { removeFromCart(id); return; }
  saveCart();
  updateCartUI();
  renderCartItems();
}
 
function updateCartUI() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const countEl = document.getElementById('cartCount');
  countEl.textContent = count;
  countEl.classList.toggle('visible', count > 0);
}
 
function renderCartItems() {
  const el = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');
 
  if (!cart.length) {
    el.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    footer.style.display = 'none';
    return;
  }
 
  footer.style.display = 'block';
  el.innerHTML = cart.map(item => `
    <div class="cart-item">
      <span class="cart-item-icon">${item.emoji}</span>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${item.price}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" data-id="${item.id}" data-delta="-1">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" data-id="${item.id}" data-delta="1">+</button>
        </div>
      </div>
      <button class="remove-item" data-id="${item.id}" title="Remove">✕</button>
    </div>
  `).join('');
 
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById('cartTotal').textContent = `$${total.toFixed(2)}`;
 
  // Qty buttons
  el.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => changeQty(Number(btn.dataset.id), Number(btn.dataset.delta)));
  });
 
  // Remove buttons
  el.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(Number(btn.dataset.id)));
  });
}
 
function animateCartBtn() {
  const btn = document.getElementById('cartBtn');
  btn.style.transform = 'scale(1.25)';
  setTimeout(() => btn.style.transform = '', 220);
}
 
// Cart open/close
const cartDrawer  = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
 
document.getElementById('cartBtn').addEventListener('click', openCart);
document.getElementById('closeCart').addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);
 
function openCart() {
  renderCartItems();
  cartDrawer.classList.add('open');
  cartOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('open');
  document.body.style.overflow = '';
}
 
document.getElementById('checkoutBtn').addEventListener('click', () => {
  showToast('🎉 Thank you! Order placed successfully.');
  cart = [];
  saveCart();
  updateCartUI();
  renderCartItems();
  closeCart();
});
 
// ---- WISHLIST ----
function toggleWishlist(id, btn) {
  if (wishlist.has(id)) {
    wishlist.delete(id);
    btn.textContent = '🤍';
    showToast('Removed from wishlist');
  } else {
    wishlist.add(id);
    btn.textContent = '❤️';
    showToast('❤️ Added to wishlist');
  }
  saveWishlist();
}
 
// ---- SEARCH ----
const searchOverlay = document.getElementById('searchOverlay');
const searchInput   = document.getElementById('searchInput');
 
document.getElementById('searchBtn').addEventListener('click', () => {
  searchOverlay.classList.add('open');
  setTimeout(() => searchInput.focus(), 100);
});
document.getElementById('closeSearch').addEventListener('click', () => {
  searchOverlay.classList.remove('open');
  searchInput.value = '';
});
 
searchInput.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    searchOverlay.classList.remove('open');
    searchInput.value = '';
    return;
  }
  if (e.key === 'Enter') {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) return;
    const found = products.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );
    searchOverlay.classList.remove('open');
    searchInput.value = '';
 
    // Reset filter tabs
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('.filter-tab[data-filter="all"]').classList.add('active');
 
    const grid = document.getElementById('productGrid');
    if (!found.length) {
      grid.innerHTML = `<p style="color:var(--ink-lite);grid-column:1/-1;text-align:center;padding:60px 0">No results for "<strong>${query}</strong>"</p>`;
    } else {
      grid.innerHTML = found.map((p, i) => `
        <div class="product-card" style="animation-delay:${i * 0.05}s" data-id="${p.id}">
          <div class="product-img">
            ${p.tag ? `<span class="product-tag ${p.tag}">${p.tag === 'sale' ? 'Sale' : p.tag === 'new' ? 'New' : '🔥 Hot'}</span>` : ''}
            <span class="wishlist-btn" data-id="${p.id}">${wishlist.has(p.id) ? '❤️' : '🤍'}</span>
            <span style="font-size:60px">${p.emoji}</span>
          </div>
          <div class="product-info">
            <div class="product-cat">${p.category}</div>
            <div class="product-name">${p.name}</div>
            <div class="product-bottom">
              <div class="product-price">
                ${p.oldPrice ? `<span class="old-price">$${p.oldPrice}</span>` : ''}
                $${p.price}
              </div>
              <button class="add-btn" data-id="${p.id}">+</button>
            </div>
          </div>
        </div>
      `).join('');
 
      grid.querySelectorAll('.add-btn').forEach(btn => {
        btn.addEventListener('click', e => { e.stopPropagation(); addToCart(Number(btn.dataset.id)); });
      });
      grid.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', e => { e.stopPropagation(); toggleWishlist(Number(btn.dataset.id), btn); });
      });
    }
 
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    showToast(`Found ${found.length} result${found.length !== 1 ? 's' : ''} for "${query}"`);
  }
});
 
// ---- SUBSCRIBE FORM ----
document.getElementById('subscribeForm').addEventListener('submit', e => {
  e.preventDefault();
  document.getElementById('formSuccess').classList.add('show');
  e.target.reset();
  showToast('🎉 You\'re subscribed!');
  setTimeout(() => document.getElementById('formSuccess').classList.remove('show'), 5000);
});
 
// ---- TOAST ----
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}
 
// ---- NAVBAR SCROLL ----
window.addEventListener('scroll', () => {
  document.querySelector('.nav').classList.toggle('scrolled', window.scrollY > 20);
});
 
// ---- INIT ----
renderProducts();
updateCartUI();
