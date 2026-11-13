import React, { useState } from 'react';
import {
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  Download,
  Copy,
  Check,
  Smartphone,
  Lock,
} from 'lucide-react';
import { ANDROID_PROJECT_FILES } from '../data/androidProjectTemplate';
import type { TunnelSettings, VaultCredentials } from '../types/vpn';

interface VaultAndApkViewProps {
  vault: VaultCredentials;
  tunnelSettings: TunnelSettings;
  onUpdateVault: (patch: Partial<VaultCredentials>) => void;
  onUpdateTunnel: (patch: Partial<TunnelSettings>) => void;
  onVerifyRootCa: () => void;
}

export const VaultAndApkView: React.FC<VaultAndApkViewProps> = ({
  vault,
  tunnelSettings,
  onUpdateVault,
  onUpdateTunnel,
  onVerifyRootCa,
}) => {
  const [showRealPassword, setShowRealPassword] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const activeFile = ANDROID_PROJECT_FILES[selectedFileIndex] ?? ANDROID_PROJECT_FILES[0];

  const handleSaveVault = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateVault({ lastUpdated: new Date().toISOString() });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2200);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(activeFile.content);
      setCopiedPath(activeFile.path);
      setTimeout(() => setCopiedPath(null), 1800);
    } catch {
      // ignore clipboard restrictions
    }
  };

  return (
    <div className="space-y-8">
      {/* Dual-Column: Keystore Credentials Vault & IPSec Protocol Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Hardware-Backed Keystore Vault */}
        <form
          onSubmit={handleSaveVault}
          className="lg:col-span-7 rounded-xl border border-white/10 bg-[#0F172A] p-6 space-y-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#00E5FF]" />
                <h1 className="font-display text-lg font-bold text-[#F8FAFC]">
                  NordService Keystore & Canary Vault
                </h1>
              </div>
              <p className="text-xs text-[#94A3B8] mt-1">
                {vault.keystoreMode} · Keeps real NordVPN manual service credentials isolated from vpnban canary probes
              </p>
            </div>
            <span className="font-mono text-xs text-[#00E676]">AES-256-GCM</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#94A3B8]">
                Real NordService Username
              </label>
              <input
                type="text"
                value={vault.serviceUsername}
                onChange={(e) => onUpdateVault({ serviceUsername: e.target.value })}
                placeholder="Paste NordVPN manual service username"
                className="w-full h-11 px-3.5 rounded-lg bg-[#0D1321] border border-[#334155] font-mono text-xs text-[#F8FAFC] focus:outline-none focus:border-[#00E5FF]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#94A3B8]">
                Real NordService Password
              </label>
              <div className="relative">
                <input
                  type={showRealPassword ? 'text' : 'password'}
                  value={vault.servicePassword}
                  onChange={(e) => onUpdateVault({ servicePassword: e.target.value })}
                  placeholder="Paste NordVPN manual service password"
                  className="w-full h-11 pl-3.5 pr-10 rounded-lg bg-[#0D1321] border border-[#334155] font-mono text-xs text-[#F8FAFC] focus:outline-none focus:border-[#00E5FF]"
                />
                <button
                  type="button"
                  onClick={() => setShowRealPassword((v) => !v)}
                  aria-label="Toggle password visibility"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#F8FAFC]"
                >
                  {showRealPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#94A3B8]">
                vpnban Wrong-Credential Canary User
              </label>
              <input
                type="text"
                value={vault.canaryUsername}
                onChange={(e) => onUpdateVault({ canaryUsername: e.target.value })}
                className="w-full h-11 px-3.5 rounded-lg bg-[#0D1321] border border-[#334155] font-mono text-xs text-[#00E5FF] focus:outline-none focus:border-[#00E5FF]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#94A3B8]">
                vpnban Wrong-Credential Canary Secret
              </label>
              <input
                type="text"
                value={vault.canaryPassword}
                onChange={(e) => onUpdateVault({ canaryPassword: e.target.value })}
                className="w-full h-11 px-3.5 rounded-lg bg-[#0D1321] border border-[#334155] font-mono text-xs text-[#00E5FF] focus:outline-none focus:border-[#00E5FF]"
              />
            </div>
          </div>

          {/* Root CA Verification Block */}
          <div className="rounded-lg border border-white/10 bg-[#0D1321] p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#F8FAFC]">
                <ShieldCheck
                  className={`w-4 h-4 shrink-0 ${
                    vault.rootCaVerified ? 'text-[#00E676]' : 'text-[#FFAB00]'
                  }`}
                />
                <span>DigiCert & NordVPN Root CA Pinning</span>
              </div>
              <div className="font-mono text-[11px] text-[#94A3B8] truncate">
                SHA-256: {vault.rootCaFingerprint}
              </div>
            </div>
            <button
              type="button"
              onClick={onVerifyRootCa}
              className="min-h-[38px] px-3.5 py-1.5 rounded-lg border border-white/10 bg-[#1E293B] hover:border-[#00E5FF]/50 text-xs font-medium text-[#F8FAFC] whitespace-nowrap"
            >
              {vault.rootCaVerified ? 'Re-Verify CA Chain' : 'Verify Root CA'}
            </button>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[#64748B]">
              {savedNotice
                ? 'Credentials encrypted & stored in local session vault.'
                : 'Stored locally in browser memory · never transmitted unencrypted.'}
            </span>
            <button
              type="submit"
              className="min-h-[42px] px-5 py-2 rounded-lg bg-[#2979FF] hover:bg-[#1E66E5] text-xs font-semibold text-[#F8FAFC] inline-flex items-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Save Vault Credentials</span>
            </button>
          </div>
        </form>

        {/* Advanced IPSec Stack Settings */}
        <div className="lg:col-span-5 rounded-xl border border-white/10 bg-[#0F172A] p-6 space-y-5">
          <div>
            <h2 className="font-display text-lg font-bold text-[#F8FAFC]">
              IPSec & Mobile Baseband Stack
            </h2>
            <p className="text-xs text-[#94A3B8] mt-1">
              Resilient tunnel policies for Android 6.0+ VpnService & cellular roaming
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                key: 'natTraversal' as const,
                title: 'NAT-Traversal (UDP 4500)',
                desc: 'Encapsulates ESP packets in UDP 4500 across carrier/residential NATs.',
                val: tunnelSettings.natTraversal,
              },
              {
                key: 'mobike' as const,
                title: 'MOBIKE Seamless Roaming (RFC 4555)',
                desc: 'Preserves IKEv2 SA state when switching between Wi-Fi and 5G/LTE.',
                val: tunnelSettings.mobike,
              },
              {
                key: 'mtuClamping' as const,
                title: 'Baseband MTU Clamping (1380 B)',
                desc: 'Clamps TUN interface MTU to 1380 bytes to stop double-fragmentation.',
                val: tunnelSettings.mtuClamping,
              },
              {
                key: 'killSwitch' as const,
                title: 'Always-On Kill Switch',
                desc: 'Blocks cleartext non-tunnel egress if IKE_AUTH drops unexpectedly.',
                val: tunnelSettings.killSwitch,
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-4 rounded-lg border border-white/5 bg-[#0D1321] p-3.5"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#F8FAFC]">{item.title}</div>
                  <div className="text-[11px] text-[#94A3B8] mt-0.5 leading-snug">{item.desc}</div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={item.val}
                  onClick={() =>
                    onUpdateTunnel({
                      [item.key]: !item.val,
                      ...(item.key === 'mtuClamping' ? { mtuValue: !item.val ? 1380 : 1500 } : {}),
                    })
                  }
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border border-white/10 transition-colors ${
                    item.val ? 'bg-[#2979FF]' : 'bg-[#1E293B]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 translate-y-0.5 rounded-full bg-[#F8FAFC] transition-transform ${
                      item.val ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-medium text-[#94A3B8]">
              Negotiated IPSec Cipher Suite
            </label>
            <select
              value={tunnelSettings.cipherSuite}
              onChange={(e) =>
                onUpdateTunnel({
                  cipherSuite: e.target.value as TunnelSettings['cipherSuite'],
                })
              }
              className="w-full h-11 px-3 rounded-lg bg-[#0D1321] border border-[#334155] font-mono text-xs text-[#F8FAFC] focus:outline-none focus:border-[#00E5FF]"
            >
              <option value="AES-256-GCM / SHA-384 / MODP-2048">
                AES-256-GCM / SHA-384 / MODP-2048
              </option>
              <option value="AES-256-CBC / SHA-256 / MODP-2048">
                AES-256-CBC / SHA-256 / MODP-2048
              </option>
              <option value="ChaCha20-Poly1305 / SHA-512">
                ChaCha20-Poly1305 / SHA-512
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Android 6.0+ (API 23+) APK Project Export & Code Inspector */}
      <section className="rounded-xl border border-white/10 bg-[#0F172A] p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[#00E676]" />
              <h2 className="font-display text-xl font-bold text-[#F8FAFC]">
                Android 6.0+ (API 23–35) APK Project Bundle
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-3xl">
              This web workspace does not include the Android SDK/Gradle compiler required to sign binary `.apk` files directly in-browser. Download the complete Kotlin + Jetpack Compose + VpnService Gradle project below to build <code className="font-mono text-[#00E5FF]">app-debug.apk</code> in Android Studio or automatically via the included GitHub Actions workflow.
            </p>
          </div>

          <a
            href="/api/android/export-zip"
            download="nordvpn-ikev2-explorer-android6-plus.zip"
            className="min-h-[46px] px-5 py-2.5 rounded-lg bg-[#2979FF] hover:bg-[#1E66E5] text-sm font-semibold text-[#F8FAFC] inline-flex items-center gap-2 shadow-[0_0_16px_rgba(41,121,255,0.3)] whitespace-nowrap shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download Android 6.0+ Project (.zip)</span>
          </a>
        </div>

        {/* File Tree + Code Viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-4 space-y-1.5">
            {ANDROID_PROJECT_FILES.map((file, idx) => (
              <button
                key={file.path}
                type="button"
                onClick={() => setSelectedFileIndex(idx)}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg border transition-colors ${
                  idx === selectedFileIndex
                    ? 'border-[#2979FF] bg-[#2979FF]/12 text-[#F8FAFC]'
                    : 'border-white/5 bg-[#0D1321] text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                <div className="font-mono text-xs font-medium truncate">{file.path}</div>
                <div className="text-[11px] text-[#64748B] truncate mt-0.5">
                  {file.description}
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-8 rounded-xl border border-white/10 bg-[#080C14] overflow-hidden flex flex-col">
            <div className="px-4 py-2.5 border-b border-white/10 bg-[#0D1321] flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-[#00E5FF] truncate">
                {activeFile.path}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-2.5 py-1 rounded bg-[#1E293B] border border-white/10 text-xs text-[#F8FAFC] hover:border-[#00E5FF]/50 inline-flex items-center gap-1.5 shrink-0"
              >
                {copiedPath === activeFile.path ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#00E676]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 font-mono text-xs text-[#DFE2EE] overflow-x-auto max-h-[460px] leading-relaxed">
              <code>{activeFile.content}</code>
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
};
