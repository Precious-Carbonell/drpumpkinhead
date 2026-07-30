import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import './Admin.css';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('admin_user', data.username);
      navigate('/admin');
    } catch {
      setError('Network error');
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-left">
        <form className="admin-login-card" onSubmit={handleSubmit}>
          <img src="/icon.png" alt="DrPumpkinHead" style={{ width: '180px', marginBottom: '1rem' }} />
          <h2>Welcome Back</h2>
          <p className="login-subtitle">Sign in to manage commissions</p>

          {error && <div className="login-error">{error}</div>}

          <div className="form-field">
            <label htmlFor="username">Username</label>
            <input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} required autoFocus />
          </div>

          <div className="form-field" style={{ marginTop: '0.75rem' }}>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          <button type="submit" className="admin-btn primary" disabled={loading} style={{ width: '100%', marginTop: '1.25rem', justifyContent: 'center' }}>
            <LogIn size={16} />
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
      <div className="login-right" />
    </div>
  );
}
