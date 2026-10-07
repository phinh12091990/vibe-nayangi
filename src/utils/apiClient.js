/**
 * Client API connector for PostgreSQL Backend with automatic fallback to localStorage
 */

const API_BASE = '/api';

export async function checkServerStatus() {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
    if (!res.ok) return { online: false, postgres: { connected: false } };
    return await res.json();
  } catch {
    return { online: false, postgres: { connected: false } };
  }
}

export async function fetchRemoteAccounts() {
  try {
    const res = await fetch(`${API_BASE}/accounts`, { signal: AbortSignal.timeout(3000) });
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
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
      headers: { 'Content-Type': 'application/json' },
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
      signal: AbortSignal.timeout(3000)
    });
    return res.ok;
  } catch {
    return false;
  }
}
