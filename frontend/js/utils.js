/**
 * Car Rental System — Shared JS Utilities
 * API client, Auth management, UI helpers
 */

const API_BASE = 'http://localhost:5000/api';

/* ══════════════════════════════════════════════
   AUTH HELPERS
══════════════════════════════════════════════ */
const Auth = {
  getToken: () => localStorage.getItem('token'),
  getUser:  () => JSON.parse(localStorage.getItem('user') || 'null'),
  isLoggedIn: () => !!localStorage.getItem('token'),
  isAdmin: () => {
    const user = Auth.getUser();
    return user && user.role === 'admin';
  },
  save: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  logout: () => {
    Auth.clear();
    window.location.href = '/frontend/pages/login.html';
  },
  requireAuth: () => {
    if (!Auth.isLoggedIn()) {
      window.location.href = '/frontend/pages/login.html';
      return false;
    }
    return true;
  },
  requireAdmin: () => {
    if (!Auth.isLoggedIn() || !Auth.isAdmin()) {
      window.location.href = '/frontend/pages/login.html';
      return false;
    }
    return true;
  }
};

/* ══════════════════════════════════════════════
   API CLIENT
══════════════════════════════════════════════ */
const API = {
  request: async (method, path, body = null, auth = false, isFormData = false) => {
    const headers = {};

    if (!isFormData) headers['Content-Type'] = 'application/json';
    if (auth) headers['Authorization'] = `Bearer ${Auth.getToken()}`;

    const opts = { method, headers };
    if (body) opts.body = isFormData ? body : JSON.stringify(body);

    const res = await fetch(`${API_BASE}${path}`, opts);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'An error occurred');
    }
    return data;
  },

  get:    (path, auth = false)          => API.request('GET', path, null, auth),
  post:   (path, body, auth = false)    => API.request('POST', path, body, auth),
  put:    (path, body, auth = false)    => API.request('PUT', path, body, auth),
  delete: (path, auth = false)          => API.request('DELETE', path, null, auth),
  postForm: (path, formData, auth = false) => API.request('POST', path, formData, auth, true),
  putForm:  (path, formData, auth = false) => API.request('PUT', path, formData, auth, true),

  // Auth
  register: (data)   => API.post('/auth/register', data),
  login:    (data)   => API.post('/auth/login', data),
  getMe:    ()       => API.get('/auth/me', true),

  // Cars
  getCars: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return API.get(`/cars${qs ? '?' + qs : ''}`);
  },
  getCar:             (id)      => API.get(`/cars/${id}`),
  getCarAvailability: (id, q)   => API.get(`/cars/${id}/availability?${new URLSearchParams(q)}`),
  createCar:          (fd)      => API.postForm('/cars', fd, true),
  updateCar:          (id, fd)  => API.putForm(`/cars/${id}`, fd, true),
  deleteCar:          (id)      => API.delete(`/cars/${id}`, true),
  getAnalytics:       ()        => API.get('/cars/analytics', true),

  // Bookings
  createBooking:        (data)   => API.post('/bookings', data, true),
  getMyBookings:        (params) => API.get(`/bookings/my?${new URLSearchParams(params || {})}`, true),
  getAllBookings:        (params) => API.get(`/bookings?${new URLSearchParams(params || {})}`, true),
  getBooking:           (id)     => API.get(`/bookings/${id}`, true),
  cancelBooking:        (id, r)  => API.put(`/bookings/${id}/cancel`, { reason: r }, true),
  updateBookingStatus:  (id, s)  => API.put(`/bookings/${id}/status`, { status: s }, true),

  // Users
  getUsers:        () => API.get('/users', true),
  toggleUserStatus:(id) => API.put(`/users/${id}/toggle-status`, {}, true),

  // Reviews
  addReview:       (data)   => API.post('/reviews', data, true),
  getCarReviews:   (carId)  => API.get(`/reviews/car/${carId}`),
  deleteReview:    (id)     => API.delete(`/reviews/${id}`, true),
};

/* ══════════════════════════════════════════════
   TOAST NOTIFICATIONS
══════════════════════════════════════════════ */
const Toast = {
  container: null,

  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(type, title, message = '', duration = 4000) {
    this.init();
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        ${message ? `<div class="toast-message">${message}</div>` : ''}
      </div>
    `;
    this.container.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  success: (title, msg) => Toast.show('success', title, msg),
  error:   (title, msg) => Toast.show('error', title, msg),
  warning: (title, msg) => Toast.show('warning', title, msg),
  info:    (title, msg) => Toast.show('info', title, msg),
};

/* ══════════════════════════════════════════════
   NAVBAR RENDERER
══════════════════════════════════════════════ */
function renderNavbar(activePage = '') {
  const user = Auth.getUser();
  const isAdmin = Auth.isAdmin();

  const navLinks = `
    <a href="../index.html" class="nav-link ${activePage === 'home' ? 'active' : ''}">Home</a>
    <a href="cars.html" class="nav-link ${activePage === 'cars' ? 'active' : ''}">Browse Cars</a>
    ${user ? `
      <a href="${isAdmin ? 'admin.html' : 'dashboard.html'}" class="nav-link ${activePage === 'dashboard' ? 'active' : ''}">
        ${isAdmin ? 'Admin' : 'Dashboard'}
      </a>
    ` : ''}
  `;

  const actions = user ? `
    <div style="display:flex;align-items:center;gap:0.75rem;">
      <span style="font-size:0.82rem;color:var(--text-muted);">Hi, ${user.name.split(' ')[0]}</span>
      <button class="btn btn-outline btn-sm" onclick="Auth.logout()">Logout</button>
    </div>
  ` : `
    <a href="login.html" class="btn btn-outline btn-sm">Login</a>
    <a href="register.html" class="btn btn-primary btn-sm">Sign Up</a>
  `;

  return `
    <nav class="navbar">
      <a href="../index.html" class="navbar-brand">
        <div class="brand-icon">🚗</div>
        DRIVE<span>LUXE</span>
      </a>
      <div class="navbar-nav" id="mainNav">${navLinks}</div>
      <div class="navbar-actions">${actions}</div>
      <div class="hamburger" onclick="toggleMobileNav()" id="hamburger">
        <span></span><span></span><span></span>
      </div>
    </nav>
    <div id="mobile-nav" style="display:none;position:fixed;top:var(--header-h);left:0;right:0;background:var(--bg-secondary);border-bottom:1px solid var(--border);padding:1rem;z-index:999;flex-direction:column;gap:0.5rem;">
      ${navLinks}
      <div style="margin-top:0.5rem;padding-top:0.75rem;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:0.5rem;">
        ${actions}
      </div>
    </div>
  `;
}

function toggleMobileNav() {
  const nav = document.getElementById('mobile-nav');
  nav.style.display = nav.style.display === 'none' ? 'flex' : 'none';
}

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */

/** Format currency */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

/** Format date */
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

/** Format date range */
function formatDateRange(start, end) {
  return `${formatDate(start)} → ${formatDate(end)}`;
}

/** Calculate days between two dates */
function calcDays(start, end) {
  return Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
}

/** Today as YYYY-MM-DD */
function todayStr() {
  return new Date().toISOString().split('T')[0];
}

/** Tomorrow as YYYY-MM-DD */
function tomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

/** Render star rating HTML */
function renderStars(rating, max = 5) {
  let html = '<div class="stars">';
  for (let i = 1; i <= max; i++) {
    html += `<span class="star ${i <= rating ? 'filled' : ''}">★</span>`;
  }
  html += '</div>';
  return html;
}

/** Render booking status badge */
function statusBadge(status) {
  const map = {
    confirmed:  'badge-success',
    active:     'badge-info',
    completed:  'badge-neutral',
    cancelled:  'badge-danger',
    pending:    'badge-warning',
  };
  return `<span class="badge ${map[status] || 'badge-neutral'}">${status}</span>`;
}

/** Render payment status badge */
function paymentBadge(status) {
  const map = { paid: 'badge-success', pending: 'badge-warning', refunded: 'badge-info' };
  return `<span class="badge ${map[status] || 'badge-neutral'}">${status}</span>`;
}

/** Car image src with fallback */
function carImageSrc(images) {
  if (images && images.length > 0) return `http://localhost:5000${images[0]}`;
  return 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&q=80';
}

/** Render a car card */
function renderCarCard(car) {
  const img = carImageSrc(car.images);
  return `
    <div class="car-card" onclick="location.href='car-detail.html?id=${car._id}'">
      <div class="car-card-image">
        <img src="${img}" alt="${car.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&q=80'">
        <span class="car-type-badge">${car.type}</span>
        <div class="availability-dot ${car.isAvailable ? '' : 'unavailable'}"></div>
      </div>
      <div class="car-card-body">
        <div class="car-card-brand">${car.brand} · ${car.year}</div>
        <div class="car-card-name">${car.name}</div>
        <div class="car-card-specs">
          <span class="car-spec">⚙️ ${car.transmission}</span>
          <span class="car-spec">👥 ${car.seats} seats</span>
          <span class="car-spec">⛽ ${car.fuelType}</span>
          ${car.rating > 0 ? `<span class="car-spec">★ ${car.rating} (${car.numReviews})</span>` : ''}
        </div>
      </div>
      <div class="car-card-footer">
        <div class="car-price">
          <span class="car-price-amount">${formatCurrency(car.pricePerDay)}</span>
          <span class="car-price-label">per day</span>
        </div>
        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();location.href='book.html?carId=${car._id}'">
          Book Now
        </button>
      </div>
    </div>
  `;
}

/** Show loading state */
function showLoading(el, msg = 'Loading...') {
  el.innerHTML = `<div class="loading-overlay"><div class="spinner"></div><span class="text-muted">${msg}</span></div>`;
}

/** Show empty state */
function showEmpty(el, title = 'Nothing here', text = '', action = '') {
  el.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">🔍</div>
      <div class="empty-state-title">${title}</div>
      <div class="empty-state-text">${text}</div>
      ${action}
    </div>
  `;
}

/** Modal open/close */
function openModal(id) {
  document.getElementById(id).classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
  document.body.style.overflow = '';
}

// Close modal on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(m => {
      m.classList.remove('active');
      document.body.style.overflow = '';
    });
  }
});
