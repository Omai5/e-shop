// Home page: products, cart, and the login modal.

const PRODUCTS = [
    { id: 'phone', name: 'Smartphone', price: 499, image: 'images/phone.jpg', desc: '6.5" display, 128GB storage, all-day battery.' },
    { id: 'headphones', name: 'Headphones', price: 99, image: 'images/headphones.jpg', desc: 'Wireless and noise-cancelling, 30h playback.' },
    { id: 'watch', name: 'Smart Watch', price: 149, image: 'images/watch.jpg', desc: 'Heart-rate, GPS and sleep tracking.' },
    { id: 'laptop', name: 'Laptop', price: 899, image: 'images/laptop.jpg', desc: '14" lightweight laptop, 16GB RAM, 512GB SSD.' },
    { id: 'camera', name: 'Camera', price: 649, image: 'images/camera.jpg', desc: '24MP camera with 4K video recording.' },
    { id: 'speaker', name: 'Bluetooth Speaker', price: 79, image: 'images/speaker.jpg', desc: 'Waterproof portable speaker with deep bass.' },
];

const money = (n) => `$${n.toLocaleString('en-US')}`;
const findProduct = (id) => PRODUCTS.find((p) => p.id === id);

// ---------- Cart (persisted in localStorage) ----------
const Cart = {
    items: (() => {
        try { return JSON.parse(localStorage.getItem('cart')) || {}; } catch { return {}; }
    })(),
    save() {
        localStorage.setItem('cart', JSON.stringify(this.items));
        renderCart();
    },
    add(id) { this.items[id] = (this.items[id] || 0) + 1; this.save(); },
    change(id, delta) {
        this.items[id] = (this.items[id] || 0) + delta;
        if (this.items[id] <= 0) delete this.items[id];
        this.save();
    },
    clear() { this.items = {}; this.save(); },
    count() { return Object.values(this.items).reduce((a, b) => a + b, 0); },
    total() { return Object.entries(this.items).reduce((sum, [id, q]) => sum + (findProduct(id)?.price || 0) * q, 0); },
};

function renderProducts() {
    document.getElementById('productsGrid').innerHTML = PRODUCTS.map((p) => `
        <article class="product-card">
            <img src="${p.image}" alt="${p.name}" loading="lazy">
            <div class="product-body">
                <h3>${p.name}</h3>
                <p class="desc">${p.desc}</p>
                <div class="product-footer">
                    <p class="price">${money(p.price)}</p>
                    <button type="button" class="btn btn-primary" data-add="${p.id}">Add to Cart</button>
                </div>
            </div>
        </article>`).join('');
}

function renderCart() {
    const count = Cart.count();
    const badge = document.getElementById('cartCount');
    badge.textContent = count;
    badge.dataset.count = count;

    const entries = Object.entries(Cart.items).filter(([id]) => findProduct(id));
    document.getElementById('cartItems').innerHTML = entries.length
        ? entries.map(([id, q]) => {
            const p = findProduct(id);
            return `
            <div class="cart-item">
                <img src="${p.image}" alt="">
                <div class="cart-item-info"><strong>${p.name}</strong><small>${money(p.price)}</small></div>
                <div class="qty">
                    <button type="button" data-dec="${id}" aria-label="Decrease">−</button>
                    <span>${q}</span>
                    <button type="button" data-inc="${id}" aria-label="Increase">+</button>
                </div>
            </div>`;
        }).join('')
        : '<p class="cart-empty">Your cart is empty.</p>';

    document.getElementById('cartTotal').textContent = money(Cart.total());
    document.getElementById('checkoutBtn').disabled = count === 0;
}

// ---------- Panels (login modal + cart drawer) ----------
function openPanel(id) {
    closePanels();
    document.getElementById(id).classList.add('open');
    document.getElementById('overlay').classList.add('open');
    document.body.classList.add('no-scroll');
}

function closePanels() {
    document.querySelectorAll('.drawer.open, .modal.open').forEach((el) => el.classList.remove('open'));
    document.getElementById('overlay').classList.remove('open');
    document.body.classList.remove('no-scroll');
}

function openLogin() {
    openPanel('loginModal');
    document.getElementById('email').focus();
}

async function checkout() {
    if (!Auth.isLoggedIn()) {
        toast('Please log in to complete your order');
        openLogin();
        return;
    }
    const btn = document.getElementById('checkoutBtn');
    setLoading(btn, true, 'Placing order...');
    try {
        const { user } = await api.me(); // verifies the session with the backend
        Cart.clear();
        closePanels();
        toast(`Order placed! Confirmation sent to ${user.email}`);
    } catch (err) {
        toast(err.message);
        if (err.status === 401) { updateAuthUI(); openLogin(); }
    } finally {
        setLoading(btn, false);
    }
}

// ---------- Login ----------
function updateAuthUI() {
    const loggedIn = Auth.isLoggedIn();
    document.querySelectorAll('[data-auth="guest"]').forEach((el) => (el.hidden = loggedIn));
    document.querySelectorAll('[data-auth="user"]').forEach((el) => (el.hidden = !loggedIn));
    document.querySelectorAll('[data-user-email]').forEach((el) => (el.textContent = Auth.email() || ''));
}

function initLoginForm() {
    const form = document.getElementById('loginForm');
    const alertBox = document.getElementById('loginAlert');
    const btn = form.querySelector('button[type="submit"]');

    // Coming from register.html?registered=email or a link to index.html#login
    const registered = new URLSearchParams(location.search).get('registered');
    if (registered) {
        form.email.value = registered;
        showAlert(alertBox, 'Account created successfully. Please log in.', 'success');
    }
    if ((registered || location.hash === '#login') && !Auth.isLoggedIn()) {
        openLogin();
        if (registered) form.password.focus();
    }
    history.replaceState(null, '', location.pathname);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert(alertBox);
        const email = form.email.value.trim();
        const password = form.password.value;

        if (!EMAIL_REGEX.test(email)) return showAlert(alertBox, 'Please enter a valid email address.');
        if (!password) return showAlert(alertBox, 'Please enter your password.');

        setLoading(btn, true, 'Logging in...');
        try {
            const tokens = await api.login(email, password);
            Auth.save(tokens, form.remember.checked);
            form.reset();
            closePanels();
            updateAuthUI();
            toast(`Welcome back, ${Auth.email()}!`);
        } catch (err) {
            showAlert(alertBox, err.status === 401 ? 'Invalid email or password.' : err.message);
        } finally {
            setLoading(btn, false);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    renderCart();
    initLoginForm();

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) return closePanels(); // click outside the login card
        const t = e.target.closest('button');
        if (!t) return;
        if (t.dataset.add) { Cart.add(t.dataset.add); toast(`${findProduct(t.dataset.add).name} added to cart`); }
        if (t.dataset.inc) Cart.change(t.dataset.inc, 1);
        if (t.dataset.dec) Cart.change(t.dataset.dec, -1);
        if (t.hasAttribute('data-open-login')) openLogin();
        if (t.hasAttribute('data-close')) closePanels();
    });

    document.getElementById('cartBtn').addEventListener('click', () => openPanel('cartDrawer'));
    document.getElementById('checkoutBtn').addEventListener('click', checkout);
    document.getElementById('overlay').addEventListener('click', closePanels);
    document.addEventListener('keydown', (e) => e.key === 'Escape' && closePanels());
});
