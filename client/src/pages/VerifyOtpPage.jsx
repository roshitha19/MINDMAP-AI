import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Orbit, KeyRound, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

const VerifyOtpPage = () => {
  const navigate = useNavigate();
  const { verifyOtp, demoOtp } = useAuth();

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyOtp(otp);
      setSuccess('Email successfully verified! Entering Universe...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setOtp(demoOtp || '123456');
  };

  return (
    <div className="min-h-screen bg-cosmic-darkest flex items-center justify-center p-4 relative overflow-hidden">
      <div className="max-w-md w-full cosmic-panel rounded-3xl p-8 relative z-10 border border-cosmic-border shadow-2xl">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cosmic-indigo to-cosmic-violet flex items-center justify-center shadow-cosmic-md mb-3">
            <KeyRound className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">Verify Your Account</h2>
          <p className="text-xs text-slate-400 mt-1">
            Enter the 6-digit verification code sent to your email
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        {/* Demo Quick-Fill Pill */}
        <div className="mb-5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">Demo Code Available:</span>
          <button
            type="button"
            onClick={handleFillDemo}
            className="px-2.5 py-1 rounded-lg bg-cosmic-violet/20 hover:bg-cosmic-violet/30 text-cosmic-violet font-mono font-bold transition-colors"
          >
            Auto-fill ({demoOtp || '123456'})
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-center">
              6-Digit Security Code
            </label>
            <input
              type="text"
              maxLength="6"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.trim())}
              placeholder="123456"
              className="w-full text-center tracking-[0.5em] text-lg font-mono py-3 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-cosmic-violet focus:ring-1 focus:ring-cosmic-violet text-white outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-cosmic-indigo to-cosmic-violet hover:opacity-90 text-white shadow-cosmic-md flex items-center justify-center space-x-2 transition-all"
          >
            <span>{loading ? 'Validating...' : 'Verify & Enter Universe'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
