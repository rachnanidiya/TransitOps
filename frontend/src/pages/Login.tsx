import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'An error occurred during login'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">TransitOps</h1>
          <p className="text-white/80">
            Sign in to your transport operations dashboard
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              className="mt-1 block w-full rounded-lg border border-border/50 bg-dark-bg/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus-ring-dark-primary focus:border-dark-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="mt-1 block w-full rounded-lg border border-border/50 bg-dark-bg/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus-ring-dark-primary focus:border-dark-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p className="text-sm text-danger">{error}</p>
          )}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 text-sm font-medium text-white bg-dark-primary hover:bg-dark-primary/90 transition-all duration-300 rounded-lg"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        <div className="text-center text-white/60 text-sm mt-4">
          <p>Demo credentials:</p>
          <p className="mt-1">
            Fleet Manager: fleet.manager@transitops.com / fleet123
          </p>
          <p>
            Dispatcher: dispatcher@transitops.com / dispatch123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;