/**
 * Authentication Modal Component
 * Strictly supports ONLY:
 * 1. Passwordless / Password-Free (Magic Link & OTP / Passkey)
 * 2. Social Logins (Google & GitHub)
 */

import React, { useState } from 'react';
import { api } from '../services/api';
import { UserProfile } from '../types/index';
import {
  Check,
  Chrome,
  Github,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState<'passwordless' | 'social'>('passwordless');
  const [email, setEmail] = useState('');
  const [passwordlessMethod, setPasswordlessMethod] = useState<'magic_link' | 'otp' | 'passkey'>('magic_link');
  const [otpCode, setOtpCode] = useState('');
  const [awaitingOtp, setAwaitingOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePasswordlessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setFeedback('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      if (passwordlessMethod === 'otp' && !awaitingOtp) {
        // Send OTP code simulation
        setAwaitingOtp(true);
        setFeedback('Enter 6-digit code sent to your inbox (or use demo code: 750921)');
        setOtpCode('750921');
        setIsLoading(false);
        return;
      }

      const res = await api.passwordlessLogin(email, passwordlessMethod);
      setFeedback(res.message);
      onAuthSuccess(res.user);
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: unknown) {
      setFeedback(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const res = await api.socialLogin(provider);
      setFeedback(res.message);
      onAuthSuccess(res.user);
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: unknown) {
      setFeedback(err instanceof Error ? err.message : 'Social login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-3xl bg-zinc-900 border border-zinc-700/80 p-6 sm:p-8 shadow-2xl relative text-zinc-100 overflow-hidden">
        {/* Top Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close authentication modal"
          className="absolute top-5 right-5 p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Supabase Secure Auth</span>
          </div>
          <h2 className="text-2xl font-black text-white">Sign In to TaskPulse</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Choose between Passwordless Email Link or One-Click Social Logins
          </p>
        </div>

        {/* Mode Selector Tabs (Strictly 2 options) */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-zinc-950 border border-zinc-800 mb-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('passwordless')}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'passwordless' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>1. Passwordless</span>
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'social' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>2. Social Logins</span>
          </button>
        </div>

        {/* Option 1: Passwordless / Password-Free Form */}
        {activeTab === 'passwordless' && (
          <form onSubmit={handlePasswordlessSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 mb-1 block">Your Work or Personal Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="bhaveshp750@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Passwordless Sub-Method Radios */}
            <div className="grid grid-cols-3 gap-2 text-[11px] font-semibold text-center">
              {[
                { id: 'magic_link', label: 'Magic Link' },
                { id: 'otp', label: '6-Digit OTP' },
                { id: 'passkey', label: 'Passkey / WebAuthn' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setPasswordlessMethod(m.id as 'magic_link' | 'otp' | 'passkey');
                    setAwaitingOtp(false);
                  }}
                  className={`py-2 px-1 rounded-xl border transition-all ${
                    passwordlessMethod === m.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold'
                      : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* OTP Code Input (when active) */}
            {awaitingOtp && (
              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-indigo-500/40 space-y-2">
                <label className="text-xs font-semibold text-zinc-300 block">Enter One-Time Security Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="750921"
                  className="w-full tracking-widest text-center py-2 rounded-xl bg-zinc-800 border border-zinc-700 font-mono text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading
                ? 'Securing Session...'
                : awaitingOtp
                ? 'Verify OTP & Enter App'
                : passwordlessMethod === 'magic_link'
                ? 'Send Instant Magic Link'
                : passwordlessMethod === 'otp'
                ? 'Request 6-Digit OTP'
                : 'Authenticate with Passkey'}
            </button>
          </form>
        )}

        {/* Option 2: Social Logins (Google & GitHub) */}
        {activeTab === 'social' && (
          <div className="space-y-3">
            <button
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-white text-zinc-900 hover:bg-zinc-100 flex items-center justify-center gap-2.5 transition-transform active:scale-95 shadow-md"
            >
              <Chrome className="w-4 h-4 text-rose-500" />
              <span>Continue with Google</span>
            </button>

            <button
              onClick={() => handleSocialLogin('github')}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 flex items-center justify-center gap-2.5 transition-transform active:scale-95"
            >
              <Github className="w-4 h-4 text-zinc-100" />
              <span>Continue with GitHub</span>
            </button>
          </div>
        )}

        {/* Feedback Message */}
        {feedback && (
          <div className="mt-4 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 text-center animate-in fade-in">
            {feedback}
          </div>
        )}

        {/* Footer Guarantee */}
        <div className="mt-6 pt-4 border-t border-zinc-800 text-center text-[11px] text-zinc-500">
          <span>🔒 Password-free architecture. All users provisioned with 1-Year Pro Founder access.</span>
        </div>
      </div>
    </div>
  );
};
