const BASE_URL = 'http://localhost:3000/api/users';

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export async function loginUser(email, password) {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Login failed');
  }
  const data = await response.json();
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  return data;
}

export async function registerUser(username, email, password) {
  const response = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ username, email, password })
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Registration failed');
  }
  // The user will need to log in after register based on our UI flow, or we can just proceed.
  return response.json();
}

export async function validateSession() {
  const response = await fetch(`${BASE_URL}/validate`, { 
    method: 'GET',
    headers: getHeaders()
  });
  if (!response.ok) {
    localStorage.removeItem('token');
    throw new Error('Invalid session');
  }
  return response.json();
}

export async function logoutUser() {
  const response = await fetch(`${BASE_URL}/logout`, { 
    method: 'POST',
    headers: getHeaders()
  });
  localStorage.removeItem('token');
  if (!response.ok) throw new Error('Logout failed');
}

const CHAT_BASE_URL = 'http://localhost:3000/api/chat';

export async function sendPrompt(userId, promptText, conversationId = null) {
  const response = await fetch(`${CHAT_BASE_URL}/prompt`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ userId, promptText, conversationId })
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to get AI response');
  }
  return response.json();
}

export async function getChatHistory(userId) {
  const response = await fetch(`${CHAT_BASE_URL}/history/${userId}`, { 
    method: 'GET',
    headers: getHeaders()
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to fetch history');
  }
  return response.json();
}
