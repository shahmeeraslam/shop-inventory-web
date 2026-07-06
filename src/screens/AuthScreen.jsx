import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen() {
  const { login, register } = useAuth();
  
  // 'login' or 'signup' mode toggle state
  const [mode, setMode] = useState('login');
  
  // Form input field state trackers
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Field validation and API response error states
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleFormSubmission = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerError('');
    
    const newErrors = {};

    // 1. Client-Side Data Validation Checks
    if (mode === 'signup' && !name.trim()) {
      newErrors.name = 'Full identity name registration is required.';
    }
    if (!email.trim() || !email.includes('@')) {
      newErrors.email = 'Provide a valid connection email address.';
    }
    if (!password || password.length < 6) {
      newErrors.password = 'Authentication keys must be at least 6 characters.';
    }
    if (mode === 'signup' && !agreeToTerms) {
      newErrors.terms = 'You must authorize data storage protocols to continue.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 2. Direct Live Database Pipeline Execution
    setIsSubmitting(true);
    let result;

    if (mode === 'login') {
      result = await login(email, password);
    } else {
      result = await register(name, email, password);
    }

    setIsSubmitting(false);

    if (!result.success) {
      setServerError(result.error || 'Connection timed out. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto selection:bg-teal-500/20 selection:text-teal-200">
      
      {/* PROFESSIONAL BACKGROUND ACCENT GRADIENTS */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-teal-500/10 to-transparent rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-slate-800/20 to-transparent rounded-full filter blur-[120px] pointer-events-none" />

      {/* CORE MODULAR WINDOW */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden relative flex flex-col transition-all duration-300">
        
        {/* PREMIUM UPPER PANEL BRANDING */}
        <div className="p-8 text-center border-b border-slate-800/60 flex flex-col items-center bg-slate-900/50 backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/10 mb-4 font-bold text-slate-950 text-lg tracking-tight">
            A
          </div>
          <h1 className="text-xl font-bold tracking-[0.2em] text-slate-100 uppercase">
            THE ARCHIVE
          </h1>
          <p className="text-[10px] tracking-widest text-teal-400 font-mono font-medium uppercase mt-2">
            {mode === 'login' ? '// DATABASE ENTRY GATEWAY' : '// INITIALIZE NEW SYSTEM OPERATIVE'}
          </p>
        </div>

        {/* AUTHENTICATION FORM INPUT FRAME */}
        <form onSubmit={handleFormSubmission} className="p-6 sm:p-8 flex flex-col gap-5 bg-slate-900">
          
          {/* SERVER-SIDE ERRORS ALERTS */}
          {serverError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-medium text-rose-400 font-mono flex items-center gap-2">
              <span>✕</span> {serverError}
            </div>
          )}

          {/* OPTIONAL FIELD: Sign Up Real Name Specification Field */}
          {mode === 'signup' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-mono">
                Full Registered Name
              </label>
              <input
                type="text"
                placeholder="Shahzain Ali"
                value={name}
                disabled={isSubmitting}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: false }));
                }}
                className={`w-full p-3.5 bg-slate-950/60 border rounded-xl text-sm font-medium text-slate-200 placeholder-slate-600 outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5 transition-all box-border ${
                  errors.name ? 'border-rose-500/40 focus:ring-rose-500/5' : 'border-slate-800'
                }`}
              />
              {errors.name && (
                <span className="text-[11px] font-medium text-rose-400 font-mono tracking-tight">{errors.name}</span>
              )}
            </div>
          )}

          {/* SHARED FIELD 1: Email Coordinate Location Descriptor */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-mono">
              Corporate / Personal Email
            </label>
            <input
              type="email"
              placeholder="name@domain.com"
              value={email}
              disabled={isSubmitting}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors(prev => ({ ...prev, email: false }));
              }}
              className={`w-full p-3.5 bg-slate-950/60 border rounded-xl text-sm font-medium text-slate-200 placeholder-slate-600 outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5 transition-all box-border ${
                errors.email ? 'border-rose-500/40 focus:ring-rose-500/5' : 'border-slate-800'
              }`}
            />
            {errors.email && (
              <span className="text-[11px] font-medium text-rose-400 font-mono tracking-tight">{errors.email}</span>
            )}
          </div>

          {/* SHARED FIELD 2: Protected Encryption Security Key Pass field */}
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-mono">
              Encryption Security Password
            </label>
            <div className="w-full relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                disabled={isSubmitting}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors(prev => ({ ...prev, password: false }));
                }}
                className={`w-full p-3.5 bg-slate-950/60 border rounded-xl text-sm font-medium text-slate-200 placeholder-slate-600 outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5 transition-all box-border pr-14 ${
                  errors.password ? 'border-rose-500/40 focus:ring-rose-500/5' : 'border-slate-800'
                }`}
              />
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-[10px] font-bold font-mono tracking-wider border-0 bg-transparent cursor-pointer select-none transition-colors"
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
            {errors.password && (
              <span className="text-[11px] font-medium text-rose-400 font-mono tracking-tight">{errors.password}</span>
            )}
          </div>

          {/* OPTIONAL LINK: Terms Authorization Validation Checkboxes */}
          {mode === 'signup' ? (
            <div className="flex flex-col gap-1 mt-1">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  disabled={isSubmitting}
                  onChange={(e) => {
                    setAgreeToTerms(e.target.checked);
                    if (errors.terms) setErrors(prev => ({ ...prev, terms: false }));
                  }}
                  className="mt-0.5 rounded border-slate-800 bg-slate-950 text-teal-500 focus:ring-teal-500/20 focus:ring-offset-slate-900 accent-teal-500"
                />
                <span className="text-xs font-medium text-slate-400 leading-relaxed">
                  I authorize architecture data structures encryption and localized token cookies storage.
                </span>
              </label>
              {errors.terms && (
                <span className="text-[11px] font-medium text-rose-400 font-mono tracking-tight mt-1">{errors.terms}</span>
              )}
            </div>
          ) : (
            <div className="flex justify-end mt-0.5">
              <button
                type="button"
                disabled={isSubmitting}
                className="text-[11px] font-semibold text-teal-400 hover:text-teal-300 tracking-wide font-mono bg-transparent border-0 cursor-pointer transition-colors"
                onClick={() => alert('Security recovery key request dispatched via terminal link protocol.')}
              >
                Forgot Session Key?
              </button>
            </div>
          )}

          {/* PRIMARY EXECUTIVE SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 active:scale-[0.99] text-slate-950 text-sm font-bold py-3.5 rounded-xl shadow-lg shadow-teal-500/5 transition-all mt-3 cursor-pointer flex items-center justify-center gap-2 select-none disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <span className="font-mono text-xs animate-pulse tracking-widest">// SYNCHRONIZING PLATFORM...</span>
            ) : (
              <span className="tracking-wide">{mode === 'login' ? 'Authenticate System Entry' : 'Deploy Digital Clearance Node'}</span>
            )}
          </button>

          {/* TOGGLE WORKSPACE FOOTER SWITCH OVER CARD BUTTONS */}
          <div className="text-center mt-3 pt-5 border-t border-slate-800/60">
            <p className="text-xs font-medium text-slate-500">
              {mode === 'login' ? "New core operative to the framework?" : "Already hold active clearance credentials?"}{' '}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setErrors({});
                  setServerError('');
                }}
                className="text-teal-400 hover:text-teal-300 font-bold bg-transparent border-0 cursor-pointer underline underline-offset-4 ml-1 transition-colors"
              >
                {mode === 'login' ? 'Register Access' : 'Execute Sign-In'}
              </button>
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}