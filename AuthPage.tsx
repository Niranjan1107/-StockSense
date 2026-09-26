import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Warehouse,
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Building2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RefreshCw,
  Boxes,
  Truck,
  TrendingUp,
  SlidersHorizontal,
  ChevronLeft
} from 'lucide-react';
import { Role } from '../../types/inventory';

type AuthViewMode = 'login' | 'register' | 'forgot_password' | 'otp_verify' | 'reset_password';

export const AuthPage: React.FC = () => {
  const {
    login,
    signup,
    requestPasswordResetOtp,
    verifyOtp,
    resetPassword,
    activeOtpNotice,
    clearOtpNotice,
  } = useAuth();

  const [mode, setMode] = useState<AuthViewMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register fields
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('inventory_manager');
  const [assignedWarehouseId, setAssignedWarehouseId] = useState('wh-1');
  const [confirmPassword, setConfirmPassword] = useState('');

  // OTP & Reset fields
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Status feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Retrieve saved rememberMe email if exists
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('stocksense_remember_email_v2');
      if (savedEmail) {
        setEmail(savedEmail);
      }
    } catch {}
  }, []);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    const res = await login(email, password, rememberMe);
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.message || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Work email is required.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const res = await signup(name, email, role, password, assignedWarehouseId);
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.message || 'Registration failed.');
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your registered work email.');
      return;
    }

    setIsLoading(true);
    const res = await requestPasswordResetOtp(email);
    setIsLoading(false);

    if (res.success) {
      setSuccessMessage(res.message);
      setResendCooldown(60);
      setMode('otp_verify');
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!otpCode || otpCode.trim().length < 6) {
      setErrorMessage('Please enter the full 6-digit OTP code.');
      return;
    }

    setIsLoading(true);
    const res = await verifyOtp(email, otpCode);
    setIsLoading(false);

    if (res.success) {
      setSuccessMessage('Code verified. Set your new secure password below.');
      setMode('reset_password');
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Password confirmation does not match.');
      return;
    }

    setIsLoading(true);
    const res = await resetPassword(email, otpCode, newPassword);
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  const fillQuickDemo = (demoRole: Role) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (demoRole === 'inventory_manager') {
      setEmail('elena.vance@stocksense.io');
      setPassword('Manager@123');
    } else {
      setEmail('marcus.chen@stocksense.io');
      setPassword('Staff@123');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-900 font-sans antialiased text-slate-900">
      
      {/* Top simulated OTP dispatch banner */}
      {activeOtpNotice && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-400 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
            <span className="bg-slate-950 text-white text-[10px] px-2 py-0.5 rounded font-mono font-bold shrink-0">
              SIMULATED DISPATCH
            </span>
            <span className="truncate">{activeOtpNotice}</span>
          </div>
          <button
            onClick={clearOtpNotice}
            className="text-slate-950/70 hover:text-slate-950 p-1 text-sm font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* LEFT PANEL: Enterprise Warehouse & Inventory Brand Presence */}
      <div className="lg:w-1/2 relative bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white flex flex-col justify-between p-8 lg:p-14 overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
        {/* Subtle decorative grid background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        {/* Ambient lighting accents */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Branding */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-slate-950 font-black tracking-tight shadow-lg shadow-emerald-500/20">
              <Warehouse className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white block">StockSense</span>
              <span className="text-[11px] text-emerald-400 font-semibold tracking-wider uppercase">
                Modular Inventory System
              </span>
            </div>
          </div>
        </div>

        {/* Center Visual & Value Proposition */}
        <div className="relative z-10 my-8 lg:my-auto space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time Warehouse & Stock Orchestration</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Digitize and streamline every pallet, SKU, and facility location.
            </h1>
            <p className="text-sm text-slate-400 max-w-lg leading-relaxed">
              Replace outdated paper registries and static Excel tables with an integrated operational ledger. Seamlessly manage vendor receipts, customer dispatching, rack transfers, and physical count reconciliations.
            </p>
          </div>

          {/* Real-time Warehouse Throughput Visual Metrics */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-900/80 backdrop-blur-xs p-4 rounded-xl border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Picking Accuracy</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl font-bold font-mono text-white">99.85%</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Automated SKU verification guard</p>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-xs p-4 rounded-xl border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Active Locations</span>
                <Boxes className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-xl font-bold font-mono text-white">3 Facilities</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Main, Production & Regional Hub</p>
            </div>
          </div>

          {/* 4-Step Operational Flow pill chain */}
          <div className="hidden sm:flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-300 font-medium">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px] font-bold">1</span>
              <span>Dock Receipt</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
            <div className="flex items-center gap-1.5 text-amber-400">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px] font-bold">2</span>
              <span>Rack Move</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
            <div className="flex items-center gap-1.5 text-blue-400">
              <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-bold">3</span>
              <span>Pick & Pack</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
            <div className="flex items-center gap-1.5 text-purple-400">
              <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px] font-bold">4</span>
              <span>Ledger Audit</span>
            </div>
          </div>
        </div>

        {/* Bottom Security / Trust Footer */}
        <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <span>Production-grade Bcrypt & JWT Authorization</span>
          <span>Version 2.4.0</span>
        </div>
      </div>

      {/* RIGHT PANEL: SaaS Authentication Card */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-16 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-8">
          
          {/* Quick Demo Logins Bar (for instant review) */}
          <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                Quick Test Credentials
              </span>
              <span className="text-[10px] text-slate-500 font-medium">1-Click Auto-Fill</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => fillQuickDemo('inventory_manager')}
                className="p-2 bg-white hover:bg-emerald-50/50 hover:border-emerald-300 border border-slate-200 rounded-lg transition-all text-xs group"
              >
                <span className="font-semibold text-slate-900 block group-hover:text-emerald-700">
                  Elena Vance
                </span>
                <span className="text-[10px] text-slate-500 block">Inventory Manager</span>
              </button>

              <button
                type="button"
                onClick={() => fillQuickDemo('warehouse_staff')}
                className="p-2 bg-white hover:bg-emerald-50/50 hover:border-emerald-300 border border-slate-200 rounded-lg transition-all text-xs group"
              >
                <span className="font-semibold text-slate-900 block group-hover:text-emerald-700">
                  Marcus Chen
                </span>
                <span className="text-[10px] text-slate-500 block">Warehouse Staff</span>
              </button>
            </div>
          </div>

          {/* Feedback alerts */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMessage}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODE 1: LOGIN FORM */}
          {/* ======================================================== */}
          {mode === 'login' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-black text-slate-950 tracking-tight">Sign in to StockSense</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Access your inventory dashboard and operations console.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Work Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. elena.vance@stocksense.io"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-semibold text-slate-700">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);
                        setSuccessMessage(null);
                        setMode('forgot_password');
                      }}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="text-slate-600 font-medium">Remember me for 7 days</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-slate-900/10 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Authenticating credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-4 text-center border-t border-slate-100 text-slate-600">
                  <span>Don't have an enterprise account? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setSuccessMessage(null);
                      setMode('register');
                    }}
                    className="font-bold text-slate-950 hover:underline cursor-pointer"
                  >
                    Create an account
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODE 2: REGISTER FORM */}
          {/* ======================================================== */}
          {mode === 'register' && (
            <div>
              <div className="mb-5">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 mb-2 font-medium"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back to login</span>
                </button>
                <h2 className="text-2xl font-black text-slate-950 tracking-tight">Create Operator Account</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Register with your role to access permitted inventory workflows.
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Jordan Miller"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Work Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. jordan.miller@stocksense.io"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Operational Role *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('inventory_manager')}
                      className={`p-2.5 text-left rounded-xl border transition-all ${
                        role === 'inventory_manager'
                          ? 'border-slate-950 bg-slate-950 text-white shadow-xs'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="font-bold block">Inventory Manager</span>
                      <span className="text-[10px] opacity-80">Catalog, rules & full approvals</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('warehouse_staff')}
                      className={`p-2.5 text-left rounded-xl border transition-all ${
                        role === 'warehouse_staff'
                          ? 'border-slate-950 bg-slate-950 text-white shadow-xs'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="font-bold block">Warehouse Staff</span>
                      <span className="text-[10px] opacity-80">Picking, counting & transfers</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Password *</label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 6 chars"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Confirm Password *</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-slate-900/10 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
                >
                  {isLoading ? 'Creating secure account...' : 'Create Account & Enter'}
                </button>

                <div className="pt-3 text-center border-t border-slate-100 text-slate-600">
                  <span>Already registered? </span>
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="font-bold text-slate-950 hover:underline cursor-pointer"
                  >
                    Log in here
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODE 3: FORGOT PASSWORD */}
          {/* ======================================================== */}
          {mode === 'forgot_password' && (
            <div>
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 mb-2 font-medium"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back to login</span>
                </button>
                <h2 className="text-2xl font-black text-slate-950 tracking-tight">Password Recovery</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your registered work email to receive a 6-digit OTP verification code.
                </p>
              </div>

              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Registered Work Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. elena.vance@stocksense.io"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-slate-900/10 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? 'Generating OTP code...' : 'Send 6-Digit OTP Code'}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-xs text-slate-500 hover:text-slate-900 font-medium"
                  >
                    Remember your password? Return to login
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODE 4: OTP VERIFICATION */}
          {/* ======================================================== */}
          {mode === 'otp_verify' && (
            <div>
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setMode('forgot_password')}
                  className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 mb-2 font-medium"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Change email</span>
                </button>
                <h2 className="text-2xl font-black text-slate-950 tracking-tight">Enter Verification Code</h2>
                <p className="text-xs text-slate-500 mt-1">
                  We dispatched a 6-digit one-time passcode to <strong className="text-slate-800">{email}</strong>.
                </p>
              </div>

              <form onSubmit={handleVerifyOtpSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">6-Digit Code</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full pl-9 pr-3 py-2 text-base font-mono font-bold tracking-widest border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Valid for 10 minutes</span>
                  {resendCooldown > 0 ? (
                    <span className="text-slate-400">Resend in {resendCooldown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleForgotPasswordSubmit}
                      className="text-emerald-700 font-semibold hover:underline"
                    >
                      Resend code
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? 'Verifying...' : 'Verify Code & Proceed'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODE 5: RESET PASSWORD */}
          {/* ======================================================== */}
          {mode === 'reset_password' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-black text-slate-950 tracking-tight">Create New Password</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Choose a new strong password for your StockSense account.
                </p>
              </div>

              <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {isLoading ? 'Saving password...' : 'Update Password & Enter Dashboard'}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
