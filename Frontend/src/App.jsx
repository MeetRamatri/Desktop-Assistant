import React, { useState, useEffect } from 'react';
import { validateSession, logoutUser } from './api.js';
import Auth from './pages/Auth.jsx';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check session on load
    validateSession()
      .then(data => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error('Logout error', e);
    }
    setUser(null);
  };

  if (isLoading && !user) {
    return (
      <div id="app-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  // --- Rendering Logic based on Authentication ---
  // If user is authenticated, render the main app layout containing chat or other pages
  if (user) {
    return (
      <div id="app-container">
        <div id="chat-view" className="auth-card" style={{ width: '100%', height: 'calc(100vh - 80px)', maxWidth: '900px', display: 'flex', flexDirection: 'column' }}>
          <div className="chat-header">
            <h2>Hello, {user.username || 'User'}!</h2>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Chat interface will be implemented here...
          </div>
        </div>
      </div>
    );
  }

  // --- External Auth View ---
  // If no user is authenticated, fall back to Auth page
  return (
    <div id="app-container">
      <Auth onAuthSuccess={(userData) => setUser(userData)} />
    </div>
  );
}
