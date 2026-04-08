/**
 * Car Rental System — Core JS
 * API client, auth utilities, shared helpers
 */

// ─── Config ──────────────────────────────────────────────────
const API_BASE = 'http://localhost:5000/api';

// ─── API Client ───────────────────────────────────────────────
const api = {
  async request(method, endpoint, data = null, isFormData = false) {
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!isFormData) headers['Content-Type'] = 'application/json';

    const config = { method, headers };
    if (data) config.body = isFormData ? data : JSON.stringify(data);

    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const json = await res.json();

    if (!res.ok) throw new Error(json.message || 'Something went wrong');
    return json;
  },
  get:    (url)        => api.request('GET',    url),
  post:   (url, data)  => api.request('POST',   url, data),
  put:    (url, data)  => api.request('PUT',    url, data),
  delete: (url)        => api.request('DELETE', url),
  upload: (url, form)  => api.request('POST',   url, form, true),
  uploadPut: (url, form) => api.request('PUT',  url, form, true),
};

// ─── Auth ─────────────────────────────────────────────────────
const auth = {
  getUser() {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  },
  getToken() { return localStorage.getItem('token'); },
  isLoggedIn() { return !!this.getToken(); },
  isAdmin() { return this.getUser()?.role === 'admin'; },
  save(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/frontend/pages/login.html';
  },
  requireLogin() {
    if (!this.isLoggedIn()) {
      window.location.href = '/frontend/pages/login.html';
      return false;
    }
    return true;
  },
  requireAdmin() {
    if (!this.isAdmin()) {
      window.location.href = '/frontend/index.html';
      return false;
    }
    return true;
  }
};

// ─── Toast Notifications ──────────────────────────────────────
function showToast(message, type = 'info', duration = 4000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type] || ''}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ─── Navbar Rendering ─────────────────────────────────────────
function renderNavbar(activePage = '') {
  const user = auth.getUser();
  const basePath = getBasePath();

  document.body.insertAdjacentHTML('afterbegin', `
    <nav class="navbar">
      <div class="container">
        <a href="${basePath}index.html" class="nav-logo">🚗 <span>Drive</span>Luxe</a>

        <div class="nav-links" id="nav-links">
          <a href="${basePath}index.html" class="${activePage === 'home' ? 'active' : ''}">Home</a>
          <a href="${basePath}pages/cars.html" class="${activePage === 'cars' ? 'active' : ''}">Browse Cars</a>
          ${user ? `<a href="${basePath}pages/${user.role === 'admin' ? 'admin' : 'dashboard'}.html" class="${activePage === 'dashboard' ? 'active' : ''}">${user.role === 'admin' ? 'Admin' : 'Dashboard'}</a>` : ''}
        </div>

        <div class="nav-actions">
          ${user ? `
            <div class="nav-user" onclick="window.location.href='${basePath}pages/${user.role === 'admin' ? 'admin' : 'dashboard'}.html'">
              <div class="nav-avatar">${user.name.charAt(0).toUpperCase()}</div>
              <span style="font-size:0.88rem; color:var(--text-primary)">${user.name.split(' ')[0]}</span>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="auth.logout()">Logout</button>
          ` : `
            <a href="${basePath}pages/login.html" class="btn btn-ghost btn-sm">Login</a>
            <a href="${basePath}pages/register.html" class="btn btn-primary btn-sm">Register</a>
          `}
          <div class="hamburger" onclick="toggleMobileMenu()">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </nav>
    <div id="toast-container"></div>
  `);
}

function toggleMobileMenu() {
  document.getElementById('nav-links')?.classList.toggle('open');
}

function getBasePath() {
  const path = window.location.pathname;
  return path.includes('/pages/') ? '../' : './';
}

// ─── Render Footer ────────────────────────────────────────────
function renderFooter() {
  const basePath = getBasePath();
  document.body.insertAdjacentHTML('beforeend', `
    <footer>
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="nav-logo">🚗 <span>Drive</span>Luxe</div>
            <p>Premium car rental experience. Explore the world in comfort and style with our curated fleet.</p>
          </div>
          <div class="footer-col">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Press</a>
          </div>
          <div class="footer-col">
            <h4>Services</h4>
            <a href="${basePath}pages/cars.html">Browse Cars</a>
            <a href="#">Long-term Rental</a>
            <a href="#">Corporate</a>
          </div>
          <div class="footer-col">
            <h4>Support</h4>
            <a href="#">Help Center</a>
            <a href="#">Contact</a>
            <a href="#">Terms</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© ${new Date().getFullYear()} DriveLuxe. All rights reserved.</span>
          <span>Made with ❤️ for car enthusiasts</span>
        </div>
      </div>
    </footer>
  `);
}

// ─── Utility: Format currency ─────────────────────────────────
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

// ─── Utility: Format date ─────────────────────────────────────
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ─── Utility: Render Star Rating ──────────────────────────────
function renderStars(rating, max = 5) {
  let html = '<div class="star-rating">';
  for (let i = 1; i <= max; i++) {
    html += `<span class="star ${i <= Math.round(rating) ? '' : 'empty'}">★</span>`;
  }
  html += `<span class="rating-count">(${rating || 0})</span></div>`;
  return html;
}

// ─── Utility: Render status badge ────────────────────────────
function renderStatusBadge(status) {
  const dot = '●';
  return `<span class="status-badge status-${status}">${dot} ${status}</span>`;
}

// ─── Utility: Car placeholder image ──────────────────────────
function carImageHTML(car) {
  const typeEmojis = { Sedan: '🚗', SUV: '🚙', Hatchback: '🚗', Luxury: '🏎️', Electric: '⚡', Convertible: '🏎️', Truck: '🚚', Van: '🚐', Hybrid: '🌿' };
  if (car.images && car.images.length > 0) {
    return `<img src="http://localhost:5000${car.images[0]}" alt="${car.name}" loading="lazy" onerror="this.parentNode.innerHTML='<div class=car-placeholder><span>${typeEmojis[car.type] || '🚗'}</span></div>'">`;
  }
  return `<div class="car-placeholder"><span style="font-size:3rem">${typeEmojis[car.type] || '🚗'}</span><small style="font-size:0.75rem;color:var(--text-muted)">${car.brand} ${car.model}</small></div>`;
}

// ─── Render Car Card ──────────────────────────────────────────
function renderCarCard(car, showAdminActions = false) {
  const basePath = getBasePath();
  return `
    <div class="car-card" data-id="${car._id}">
      <div class="car-card-image">
        ${carImageHTML(car)}
        <span class="car-badge ${car.isAvailable ? 'badge-available' : 'badge-unavailable'}">
          ${car.isAvailable ? 'Available' : 'Booked'}
        </span>
        <span class="car-badge badge-type" style="left:auto;right:12px">${car.type}</span>
      </div>
      <div class="car-card-body">
        <div>
          <div class="car-card-title">${car.name}</div>
          <div class="car-card-subtitle">${car.brand} ${car.model} · ${car.year}</div>
        </div>
        <div class="car-specs">
          <span class="spec-item">👥 ${car.seats} seats</span>
          <span class="spec-item">⚙️ ${car.transmission}</span>
          <span class="spec-item">⛽ ${car.fuelType}</span>
          <span class="spec-item">📍 ${car.location}</span>
        </div>
        ${renderStars(car.rating)}
      </div>
      <div class="car-card-footer">
        <div class="car-price">${formatCurrency(car.pricePerDay)}<span>/day</span></div>
        ${showAdminActions ? `
          <div style="display:flex;gap:8px">
            <button class="btn btn-ghost btn-sm" onclick="editCar('${car._id}')">✏️ Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteCar('${car._id}', '${car.name}')">🗑️</button>
          </div>
        ` : `
          <a href="${basePath}pages/car-detail.html?id=${car._id}" class="btn btn-primary btn-sm">Book Now</a>
        `}
      </div>
    </div>
  `;
}

// ─── Modal helpers ────────────────────────────────────────────
function openModal(id) { document.getElementById(id)?.classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id)?.classList.add('hidden'); }

function createModal(id, title, bodyHTML, footerHTML = '') {
  const existing = document.getElementById(id);
  if (existing) existing.remove();

  document.body.insertAdjacentHTML('beforeend', `
    <div class="modal-overlay" id="${id}" onclick="if(event.target===this) closeModal('${id}')">
      <div class="modal">
        <div class="modal-header">
          <h2>${title}</h2>
          <button class="modal-close" onclick="closeModal('${id}')">✕</button>
        </div>
        <div class="modal-body">${bodyHTML}</div>
        ${footerHTML ? `<div class="modal-footer">${footerHTML}</div>` : ''}
      </div>
    </div>
  `);
}

// ─── Confirm Dialog ───────────────────────────────────────────
function confirmDialog(message, onConfirm) {
  createModal('confirm-dialog', 'Confirm Action', `
    <p style="color:var(--text-secondary);margin-bottom:8px">${message}</p>
  `, `
    <button class="btn btn-ghost" onclick="closeModal('confirm-dialog')">Cancel</button>
    <button class="btn btn-danger" id="confirm-yes-btn">Confirm</button>
  `);
  document.getElementById('confirm-yes-btn').onclick = () => {
    closeModal('confirm-dialog');
    onConfirm();
  };
}

// ─── Debounce helper ──────────────────────────────────────────
function debounce(fn, delay = 400) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}
 // get data from backend

async function loadCars() {
  try {
    const response = await api.get('/cars');
    console.log(response); // 👈 check data

    // ✅ FIX: extract array properly
    const cars = response.cars || response.data || response;

    const container = document.getElementById("featured-cars");
    container.innerHTML = "";

    cars.forEach(car => {
      container.innerHTML += renderCarCard(car);
    });

  } catch (error) {
    console.error(error);
  }
}

window.onload = loadCars;