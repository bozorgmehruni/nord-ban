import React, { useState } from 'react';
import { Eye, EyeOff, Lock, ShieldCheck, X } from 'lucide-react';
import type { VpnServer } from '../types/vpn';

interface ConnectCredentialsModalProps {
  server: VpnServer;
  initialUsername: string;
  initialPassword: string;
  isConnecting: boolean;
  onCancel: () => void;
  onConfirmConnect: (username: string, password: string) => void;
}

export const ConnectCredentialsModal: React.FC<ConnectCredentialsModalProps> = ({
  server,
  initialUsername,
  initialPassword,
  isConnecting,
  onCancel,
  onConfirmConnect,
}) => {
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState(initialPassword === '••••••••••••••••••••••••' ? '' : initialPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Enter both your real NordVPN Service Username and Password to authenticate IKE_AUTH.');
      return;
    }
    setError(null);
    onConfirmConnect(username.trim(), password);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="connect-creds-title"
    >
      <div className="w-full max-w-md rounded-2xl obsidian-elevated p-6 space-y-5 shadow-[0_12px_36px_rgba(2,6,23,0.75)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#00E5FF]">
              IKE_AUTH Credential Gate
            </div>
            <h2 id="connect-creds-title" className="text-lg font-semibold text-[#dfe2ee] mt-1">
              Connect to {server.city}, {server.countryCode}
            </h2>
            <p className="font-mono text-xs text-[#8c90a0] mt-0.5">
              {server.hostname} · {server.ip}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close credential prompt"
            className="p-1.5 rounded-lg text-[#c2c6d7] hover:text-[#dfe2ee] hover:bg-[#31353e]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Random Fake Probe Verification Summary */}
        <div className="rounded-lg obsidian-inset p-3.5 space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#00E676]">
            Clean Gateway Verified via Random Fake Probe
          </div>
          <div className="font-mono text-xs text-[#c2c6d7]">
            Tested fake pair:{' '}
            <span className="text-[#00E5FF]">
              {server.lastFakeProbeCreds
                ? `${server.lastFakeProbeCreds.username} : ${server.lastFakeProbeCreds.password}`
                : 'Auto-generated per scan'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="real-svc-user" className="block text-xs font-medium text-[#c2c6d7]">
              Correct NordService Username
            </label>
            <input
              id="real-svc-user"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="NordVPN manual service username"
              className="w-full h-12 px-3.5 rounded-lg bg-[#0a0e16] border border-[#424655] font-mono text-xs text-[#dfe2ee] placeholder-[#8c90a0] focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="real-svc-pass" className="block text-xs font-medium text-[#c2c6d7]">
              Correct NordService Password
            </label>
            <div className="relative">
              <input
                id="real-svc-pass"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your real NordService password"
                autoFocus
                className="w-full h-12 pl-3.5 pr-11 rounded-lg bg-[#0a0e16] border border-[#424655] font-mono text-xs text-[#dfe2ee] placeholder-[#8c90a0] focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label="Toggle password visibility"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c2c6d7] hover:text-[#dfe2ee]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-[#FF1744]/40 bg-[#FF1744]/10 px-3 py-2 text-xs text-[#ffb4ab]">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2 text-[11px] text-[#8c90a0]">
            <Lock className="w-3.5 h-3.5 text-[#00E5FF] shrink-0" />
            <span>Credentials are stored in your local encrypted session vault for IKE_AUTH only.</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="min-h-[44px] px-4 py-2 rounded-lg text-xs font-medium text-[#c2c6d7] hover:text-[#dfe2ee] hover:bg-[#31353e]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isConnecting}
              className="min-h-[44px] px-5 py-2 rounded-lg bg-[#2979FF] hover:bg-[#1E66E5] text-xs font-semibold text-[#F8FAFC] inline-flex items-center gap-2 obsidian-halo-blue disabled:opacity-60"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isConnecting ? 'Authenticating...' : 'Authenticate & Connect'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
