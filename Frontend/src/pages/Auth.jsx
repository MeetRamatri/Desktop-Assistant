import React, { useState } from 'react';
import { loginUser, registerUser } from '../api.js';

export default function Auth({ onAuthSuccess }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      let data;
      if (isLoginMode) {
        data = await loginUser(email, password);
      } else {
        if (!username) throw new Error('Username is required for registration');
        await registerUser(username, email, password);
        data = await loginUser(email, password);
      }
      // Re-propagate success to parent
      onAuthSuccess({ id: data.userId, email: data.email, username: username || data.email?.split('@')[0] || 'User' });
      
      // Reset form
      setEmail('');
      setPassword('');
      setUsername('');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h1>{isLoginMode ? 'Welcome Back' : 'Create Account'}</h1>
        <p>{isLoginMode ? 'Sign in to continue to AI Assistant' : 'Join us to get started'}</p>
      </div>

      {errorMsg && <div className="error-message">{errorMsg}</div>}

      <form onSubmit={handleSubmit}>
        {!isLoginMode && (
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              placeholder="Enter your username" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
            />
          </div>
        )}
        
        <div className="form-group">
          <label>Email Address</label>
          <input 
            type="email" 
            placeholder="name@example.com" 
            required 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
          />
        </div>
        
        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            required 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
          />
        </div>

        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Processing...' : (isLoginMode ? 'Sign In' : 'Sign Up')}
        </button>
      </form>

      <div className="auth-footer">
        <span>{isLoginMode ? "Don't have an account? " : "Already have an account? "}</span>
        <a onClick={() => { setIsLoginMode(!isLoginMode); setErrorMsg(''); }} style={{ cursor: 'pointer' }}>
          {isLoginMode ? 'Sign up' : 'Sign in'}
        </a>
      </div>
    </div>
  );
}
