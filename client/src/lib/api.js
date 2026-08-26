const BASE = '/api/soldiers';
const TOKEN_KEY = 'agh.authToken';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle(res) {
  if (res.status === 401) {
    setToken(null);
    window.location.hash = '#/login';
    throw new Error('Ulgama gaýtadan girmeli.');
  }
  if (!res.ok) {
    let msg = `Ýalňyşlyk (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.json();
}

export async function login(username, password) {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const body = await handle(res);
  setToken(body.token);
  return body;
}

export async function logout() {
  try {
    await fetch('/api/logout', { method: 'POST', headers: authHeaders() });
  } finally {
    setToken(null);
  }
}

export function listSoldiers() {
  return fetch(BASE, { headers: authHeaders() }).then(handle);
}

export function getSoldier(id) {
  return fetch(`${BASE}/${id}`, { headers: authHeaders() }).then(handle);
}

export function createSoldier(data) {
  return fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  }).then(handle);
}

export function updateSoldier(id, data) {
  return fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  }).then(handle);
}

export function deleteSoldier(id) {
  return fetch(`${BASE}/${id}`, { method: 'DELETE', headers: authHeaders() }).then(handle);
}
