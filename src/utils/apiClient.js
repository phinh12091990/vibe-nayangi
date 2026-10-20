/**
 * Client API connector for PostgreSQL Backend with automatic fallback to localStorage
 * Features: Server-side Authentication, JWT Token Persistence, and Protected Endpoints
 */

const API_BASE = '/api';
const TOKEN_KEY = 'nayangi_auth_jwt_token';

export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore storage quota errors
  }
}

export function clearAuthToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Ignore
  }
}

function getAuthHeaders(headers = {}) {
  const token = getAuthToken();
  const baseHeaders = {
    'Content-Type': 'application/json',
    ...headers
  };
  if (token) {
    baseHeaders['Authorization'] = `Bearer ${token}`;
  }
  return baseHeaders;
}

export async function checkServerStatus() {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
    if (!res.ok) return { online: false, postgres: { connected: false } };
    return await res.json();
  } catch {
    return { online: false, postgres: { connected: false } };
  }
}

// Server-side Login
export async function login(username, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      signal: AbortSignal.timeout(3000)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Đăng nhập không thành công.' };
    }
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  } catch (err) {
    return { success: false, error: err.message, networkError: true };
  }
}

// Server-side Registration
export async function register(accountData) {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(accountData),
      signal: AbortSignal.timeout(3000)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Đăng ký không thành công.' };
    }
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  } catch (err) {
    return { success: false, error: err.message, networkError: true };
  }
}

export async function fetchRemoteAccounts() {
  try {
    const res = await fetch(`${API_BASE}/accounts`, {
      headers: getAuthHeaders(),
      signal: AbortSignal.timeout(3000)
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function saveRemoteAccount(account) {
  try {
    const res = await fetch(`${API_BASE}/accounts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(account),
      signal: AbortSignal.timeout(3000)
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function updateRemoteAccount(id, accountData) {
  try {
    const res = await fetch(`${API_BASE}/accounts/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(accountData),
      signal: AbortSignal.timeout(3000)
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchRemoteFoods() {
  try {
    const res = await fetch(`${API_BASE}/foods`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function saveRemoteFood(food) {
  try {
    const res = await fetch(`${API_BASE}/foods`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(food),
      signal: AbortSignal.timeout(3000)
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchRemoteHistory(accountId) {
  try {
    const url = accountId ? `${API_BASE}/history?accountId=${accountId}` : `${API_BASE}/history`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
      signal: AbortSignal.timeout(3000)
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function saveRemoteHistory(entry) {
  try {
    const res = await fetch(`${API_BASE}/history`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(entry),
      signal: AbortSignal.timeout(3000)
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function deleteRemoteHistory(id) {
  try {
    const res = await fetch(`${API_BASE}/history/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      signal: AbortSignal.timeout(3000)
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function clearRemoteHistory(accountId) {
  try {
    const url = accountId ? `${API_BASE}/history?accountId=${accountId}` : `${API_BASE}/history`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      signal: AbortSignal.timeout(3000)
    });
    return res.ok;
  } catch {
    return false;
  }
}
