import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cloud, Loader2 } from 'lucide-react';
import api from '../api/axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      const response = await api.post('/auth/forgot-password', { email, password });
      setSuccess(response.data?.message || 'Password updated successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to update password. Please check credentials.';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4">
      <div className="w-full max-w-[380px] space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="h-12 w-12 bg-zinc-900 rounded-xl flex items-center justify-center text-white">
              <Cloud size={24} strokeWidth={2} />
            </div>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Enter your email and new password
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg border border-green-200 text-center">
            {success}
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                className="block w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-colors"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                className="block w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                className="block w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-colors"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full justify-center items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Password'}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          Remembered your password?{' '}
          <Link to="/login" className="font-medium text-zinc-900 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
