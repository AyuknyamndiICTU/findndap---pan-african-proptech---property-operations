import React, { useEffect, useRef, useState } from 'react';
import { X, LogIn } from 'lucide-react';
import { api, ApiError } from '../services/api';
import { AgentKYC, AuthUser } from '../types';
import { useModalDismiss } from '../utils/useModalDismiss';
import { useI18n } from '../i18n/LanguageContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignedIn: (user: AuthUser, agentKYC: AgentKYC | null) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSignedIn }) => {
  const { t } = useI18n();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);
  useModalDismiss(isOpen, onClose);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError(null);
      setTimeout(() => usernameRef.current?.focus(), 0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError(t('login.missingCredentials'));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { user, agentKYC } = await api.login(username.trim(), password);
      setPassword('');
      onSignedIn(user, agentKYC);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('login.unreachable'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-[#002044]/10 overflow-hidden"
      >
        <div className="bg-[#002044] text-white p-4 sm:p-5 flex items-center justify-between gap-3">
          <h2 id="login-title" className="text-lg font-bold">{t('login.title')}</h2>
          <button
            onClick={onClose}
            aria-label={t('common.close')}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 sm:p-6 space-y-4">
          <p className="text-xs text-[#43474f]">
            {t('login.intro')}
          </p>
          <div>
            <label htmlFor="login-username" className="block text-xs font-bold text-[#002044] mb-1">
              {t('login.username')}
            </label>
            <input
              id="login-username"
              ref={usernameRef}
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-[#f2f3ff] text-sm text-[#131b2e] border border-[#eaedff] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002044]"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-xs font-bold text-[#002044] mb-1">
              {t('login.password')}
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-[#f2f3ff] text-sm text-[#131b2e] border border-[#eaedff] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002044]"
            />
          </div>
          {error && (
            <p role="alert" className="text-xs font-semibold text-rose-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full h-11 rounded-xl bg-[#ff9827] hover:bg-[#8e4f00] text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <LogIn className="w-4 h-4" aria-hidden="true" />
            <span>{busy ? t('login.submitting') : t('login.submit')}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
