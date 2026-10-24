// Shared API + auth helpers used by every page.

// When the page is served by the Express server (port 8000) use relative URLs,
// otherwise (Live Server, file://) talk to the backend directly.
// Frontend is served by the same Express app in production, so use same-origin API paths.
const API_BASE = '';

const Auth = {
    get(key) {
        return sessionStorage.getItem(key) || localStorage.getItem(key);
    },

    save({ accessToken, refreshToken }, remember) {
        this.clear();
        const store = remember ? localStorage : sessionStorage;
        store.setItem('accessToken', accessToken);
        store.setItem('refreshToken', refreshToken);
    },

    setAccessToken(token) {
        const store = localStorage.getItem('refreshToken') ? localStorage : sessionStorage;
        store.setItem('accessToken', token);
    },

    clear() {
        ['accessToken', 'refreshToken', 'userEmail'].forEach((k) => {
            localStorage.removeItem(k);
            sessionStorage.removeItem(k);
        });
    },

    isLoggedIn() {
        return Boolean(this.get('accessToken'));
    },

    // Reads the email from the JWT payload without a network call (for the header).
    email() {
        const token = this.get('accessToken');
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
            return payload.email;
        } catch {
            return null;
        }
    },
};

class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

async function rawRequest(path, { method = 'GET', body, token } = {}) {
    const headers = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let res;
    try {
        res = await fetch(`${API_BASE}${path}`, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    } catch {
        throw new ApiError('Cannot reach the server. Make sure the backend is running (npm start).', 0);
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(data.message || `Request failed (${res.status})`, res.status);
    return data;
}

async function refreshAccessToken() {
    const refreshToken = Auth.get('refreshToken');
    if (!refreshToken) throw new ApiError('Session expired', 401);
    const { newAccessToken } = await rawRequest('/users/refresh', { method: 'POST', body: { token: refreshToken } });
    Auth.setAccessToken(newAccessToken);
    return newAccessToken;
}

// Authenticated request: retries once with a refreshed access token on 401.
async function authRequest(path, options = {}) {
    try {
        return await rawRequest(path, { ...options, token: Auth.get('accessToken') });
    } catch (err) {
        if (err.status !== 401) throw err;
        try {
            const token = await refreshAccessToken();
            return await rawRequest(path, { ...options, token });
        } catch (refreshErr) {
            if (refreshErr.status === 401) Auth.clear();
            throw refreshErr;
        }
    }
}

const api = {
    register: (email, password) => rawRequest('/users/register', { method: 'POST', body: { email, password } }),
    login: (email, password) => rawRequest('/users/login', { method: 'POST', body: { email, password } }),
    me: () => authRequest('/users/me'),
};

// ---------- Shared UI helpers ----------

function showAlert(el, message, type = 'error') {
    el.className = `alert alert-${type}`;
    el.textContent = message;
    el.hidden = false;
}

function hideAlert(el) {
    el.hidden = true;
}

function setLoading(button, loading, text) {
    if (loading) {
        button.dataset.label = button.innerHTML;
        button.disabled = true;
        button.innerHTML = `<span class="spinner"></span> ${text || 'Please wait...'}`;
    } else {
        button.disabled = false;
        if (button.dataset.label) button.innerHTML = button.dataset.label;
    }
}

function toast(message) {
    let el = document.querySelector('.toast');
    if (!el) {
        el = document.createElement('div');
        el.className = 'toast';
        el.setAttribute('role', 'status');
        document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('show'), 2400);
}

function logout() {
    Auth.clear();
    location.href = 'index.html';
}

// Header: toggle guest/user items, mobile menu, logout buttons.
function initHeader() {
    const loggedIn = Auth.isLoggedIn();
    document.querySelectorAll('[data-auth="guest"]').forEach((el) => (el.hidden = loggedIn));
    document.querySelectorAll('[data-auth="user"]').forEach((el) => (el.hidden = !loggedIn));
    document.querySelectorAll('[data-user-email]').forEach((el) => (el.textContent = Auth.email() || ''));
    document.querySelectorAll('[data-logout]').forEach((btn) => btn.addEventListener('click', logout));

    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            const open = nav.classList.toggle('open');
            toggle.setAttribute('aria-expanded', String(open));
        });
        nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => nav.classList.remove('open')));
    }

    const year = document.querySelector('[data-year]');
    if (year) year.textContent = new Date().getFullYear();
}

// Show / hide password buttons.
function initPasswordToggles() {
    document.querySelectorAll('.toggle-password').forEach((btn) => {
        btn.addEventListener('click', () => {
            const input = document.getElementById(btn.dataset.target);
            const show = input.type === 'password';
            input.type = show ? 'text' : 'password';
            btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
            btn.innerHTML = show ? ICONS.eyeOff : ICONS.eye;
        });
    });
}

const ICONS = {
    eye: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    eyeOff: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-6.5 0-10-7-10-7a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="2" y1="2" x2="22" y2="22"/></svg>',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initPasswordToggles();
});
