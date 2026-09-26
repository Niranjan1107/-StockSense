import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Mail, KeyRound, ArrowRight, CheckCircle2, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { Role } from '../../types/inventory';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup' | 'reset';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login, signup, requestPasswordResetOtp, resetPassword, switchDemoRole } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>(initialMode);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('inventory_manager');
  
  // OTP Reset states
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setStatusMessage({ text: 'Please enter your email', type: 'error' });
      return;
    }
    setLoading(true);
    await login(email, password);
    setLoading(false);
    onClose();
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setStatusMessage({ text: 'Please complete all required fields', type: 'error' });
      return;
    }
    setLoading(true);
    await signup(name, email, role, password);
    setLoading(false);
    onClose();
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setStatusMessage({ text: 'Please enter your account email address', type: 'error' });
      return;
    }
    setLoading(true);
    const res = await requestPasswordResetOtp(email);
    setLoading(false);
    if (res.success) {
      setStatusMessage({ text: res.message, type: 'success' });
      setResetStep(2);
    } else {
      setStatusMessage({ text: res.message, type: 'error' });
    }
  };

  const handleVerifyOtpAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setStatusMessage({ text: 'Please enter the 6-digit OTP code', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setStatusMessage({ text: 'Password must be at least 6 characters', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatusMessage({ text: 'Passwords do not match', type: 'error' });
      return;
    }

    setLoading(true);
    const res = await resetPassword(email, otpCode, newPassword);
    setLoading(false);
    if (res.success) {
      setStatusMessage({ text: res.message, type: 'success' });
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setStatusMessage({ text: res.message, type: 'error' });
    }
  };

  const handleQuickDemo = (demoRole: Role) => {
    switchDemoRole(demoRole);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm tracking-wider">
              SS
            </div>
            <div>
              <h2 className="text-base font-semibold leading-tight">StockSense Access</h2>
              <p className="text-xs text-slate-400">Inventory & Operations Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Credentials Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <p className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            Quick Demo Access (1-Click Switch)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('inventory_manager')}
              className="px-3 py-2 text-left bg-white border border-slate-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50/40 transition-all text-xs group"
            >
              <span className="font-semibold text-slate-900 block group-hover:text-emerald-700">Inventory Manager</span>
              <span className="text-[11px] text-slate-500 block truncate">Elena Vance</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('warehouse_staff')}
              className="px-3 py-2 text-left bg-white border border-slate-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50/40 transition-all text-xs group"
            >
              <span className="font-semibold text-slate-900 block group-hover:text-emerald-700">Warehouse Staff</span>
              <span className="text-[11px] text-slate-500 block truncate">Marcus Chen</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {statusMessage && (
            <div
              className={`mb-4 p-3 rounded-lg text-xs flex items-start gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Mode 1: Login */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. elena.vance@stocksense.io"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('reset');
                      setStatusMessage(null);
                    }}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Forgot Password? (OTP)
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In to StockSense'}
              </button>

              <div className="pt-2 text-center text-xs text-slate-500">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setStatusMessage(null);
                  }}
                  className="text-slate-900 font-semibold hover:underline"
                >
                  Create one now
                </button>
              </div>
            </form>
          )}

          {/* Mode 2: Signup */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Jordan Miller"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. jordan@stocksense.io"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Operational Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('inventory_manager')}
                    className={`py-2 px-3 text-xs rounded-lg border text-left transition-all ${
                      role === 'inventory_manager'
                        ? 'border-slate-900 bg-slate-900 text-white font-medium'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block font-semibold">Inventory Manager</span>
                    <span className="text-[10px] opacity-80">Full approvals & catalogs</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('warehouse_staff')}
                    className={`py-2 px-3 text-xs rounded-lg border text-left transition-all ${
                      role === 'warehouse_staff'
                        ? 'border-slate-900 bg-slate-900 text-white font-medium'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block font-semibold">Warehouse Staff</span>
                    <span className="text-[10px] opacity-80">Transfers & counts</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Create Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Create Account & Enter'}
              </button>

              <div className="pt-2 text-center text-xs text-slate-500">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setStatusMessage(null);
                  }}
                  className="text-slate-900 font-semibold hover:underline"
                >
                  Log in here
                </button>
              </div>
            </form>
          )}

          {/* Mode 3: OTP Password Reset */}
          {mode === 'reset' && (
            <div>
              <div className="mb-4">
                <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block mb-1">
                  Security Recovery
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {resetStep === 1 ? 'Request One-Time Password (OTP)' : 'Enter 6-Digit OTP Code'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {resetStep === 1
                    ? 'Enter the email address tied to your warehouse operator profile.'
                    : `We sent a 6-digit verification code to ${email}.`}
                </p>
              </div>

              {resetStep === 1 ? (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="e.g. elena.vance@stocksense.io"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {loading ? 'Sending OTP...' : 'Send Verification OTP'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtpAndReset} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">6-Digit OTP Code</label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        className="w-full pl-9 pr-3 py-2 text-base tracking-widest font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    {loading ? 'Verifying...' : 'Reset Password & Sign In'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setResetStep(1)}
                    className="w-full text-xs text-slate-500 hover:text-slate-800 py-1"
                  >
                    Did not get code? Request new OTP
                  </button>
                </form>
              )}

              <div className="pt-3 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setStatusMessage(null);
                  }}
                  className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                >
                  ← Return to Login
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
