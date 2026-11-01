import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Orbit, Lock, Mail, User, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Compute password strength
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: 'Empty', color: 'bg-slate-700' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 4) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (!agreeTerms) {
      return setError('Please accept the terms and conditions');
    }

    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/verify-otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cosmic-darkest flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute w-[500px] h-[500px] bg-cosmic-indigo/15 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-md w-full cosmic-panel rounded-3xl p-8 relative z-10 border border-cosmic-border shadow-2xl">
        <div className="flex flex-col items-center text-center mb-6">
          <Link to="/" className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cosmic-indigo to-cosmic-violet flex items-center justify-center shadow-cosmic-md mb-3">
            <Orbit className="w-7 h-7 text-white" />
          </Link>
          <h2 className="text-2xl font-black tracking-tight text-white">Create Universe Account</h2>
          <p className="text-xs text-slate-400 mt-1">
            Build your personalized AI knowledge laboratory
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-cosmic-violet focus:ring-1 focus:ring-cosmic-violet text-xs text-slate-100 placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.rivera@cs.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-cosmic-violet focus:ring-1 focus:ring-cosmic-violet text-xs text-slate-100 placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-cosmic-violet focus:ring-1 focus:ring-cosmic-violet text-xs text-slate-100 placeholder-slate-500 outline-none transition-all"
              />
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2 flex items-center space-x-2">
                <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden flex space-x-1">
                  <div className={`h-full flex-1 ${strength.score >= 1 ? strength.color : 'bg-slate-800'}`} />
                  <div className={`h-full flex-1 ${strength.score >= 2 ? strength.color : 'bg-slate-800'}`} />
                  <div className={`h-full flex-1 ${strength.score >= 3 ? strength.color : 'bg-slate-800'}`} />
                </div>
                <span className="text-[10px] font-semibold text-slate-400">{strength.label}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm Password</label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-cosmic-violet focus:ring-1 focus:ring-cosmic-violet text-xs text-slate-100 placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="rounded bg-slate-900 border-slate-800 text-cosmic-violet focus:ring-0"
            />
            <label htmlFor="terms" className="text-xs text-slate-400">
              I agree to the Terms of Service & Privacy Policy
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-cosmic-indigo to-cosmic-violet hover:opacity-90 text-white shadow-cosmic-md flex items-center justify-center space-x-2 transition-all"
          >
            <span>{loading ? 'Creating Account...' : 'Launch Your Universe'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-cosmic-violet font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
