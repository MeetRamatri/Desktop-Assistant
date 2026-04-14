const BASE_URL = 'http://localhost:3000/api/users';

export async function loginUser(email, password) {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Login failed');
  }
  return response.json();
}

export async function registerUser(username, email, password) {
  const response = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Registration failed');
  }
  return response.json();
}

export async function validateSession() {
  const response = await fetch(`${BASE_URL}/validate`, { method: 'GET' });
  if (!response.ok) throw new Error('Invalid session');
  return response.json();
}

export async function logoutUser() {
  const response = await fetch(`${BASE_URL}/logout`, { method: 'POST' });
  if (!response.ok) throw new Error('Logout failed');
}
