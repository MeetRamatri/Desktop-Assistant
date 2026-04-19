import React, { useState, useEffect } from 'react';
import { validateSession, logoutUser } from './api.js';
import Auth from './pages/Auth.jsx';
import Chat from './pages/Chat.jsx';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check session on load
    validateSession()
      .then(data => setUser({ id: data.userId, email: data.email, username: data.email?.split('@')[0] || 'User' }))
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
      <div id="app-container" className="chat-mode">
        <Chat user={user} onLogout={handleLogout} />
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
