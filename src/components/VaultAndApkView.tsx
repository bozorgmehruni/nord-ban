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
  Tag,
} from 'lucide-react';
import appIconImg from '../assets/images/nord_ikev2_icon_1794572187702.jpg';
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
  const [releaseTag, setReleaseTag] = useState('v.0.0.1');
  const [copiedCmd, setCopiedCmd] = useState(false);

  const activeFile = ANDROID_PROJECT_FILES[selectedFileIndex] ?? ANDROID_PROJECT_FILES[0];
  const releaseCommand = `git init && git add . && git commit -m "Release ${releaseTag}" && git tag -a ${releaseTag} -m "NordVPN IKEv2 Explorer ${releaseTag}" && git push -u origin main --tags`;

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
          className="lg:col-span-7 rounded-xl obsidian-card p-6 space-y-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#00E5FF]" />
                <h1 className="text-lg font-bold text-[#dfe2ee]">
                  NordService Keystore Vault
                </h1>
              </div>
              <p className="text-xs text-[#c2c6d7] mt-1">
                {vault.keystoreMode} · Used ONLY when connecting. Scanner automatically generates random fake credentials.
              </p>
            </div>
            <span className="font-mono text-xs text-[#00E676]">AES-256-GCM</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/10">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#c2c6d7]">
                Correct NordService Username
              </label>
              <input
                type="text"
                value={vault.serviceUsername}
                onChange={(e) => onUpdateVault({ serviceUsername: e.target.value })}
                placeholder="Paste NordVPN manual service username"
                className="w-full h-12 px-3.5 rounded-lg bg-[#0a0e16] border border-[#424655] font-mono text-xs text-[#dfe2ee] focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#c2c6d7]">
                Correct NordService Password
              </label>
              <div className="relative">
                <input
                  type={showRealPassword ? 'text' : 'password'}
                  value={vault.servicePassword}
                  onChange={(e) => onUpdateVault({ servicePassword: e.target.value })}
                  placeholder="Paste NordVPN manual service password"
                  className="w-full h-12 pl-3.5 pr-10 rounded-lg bg-[#0a0e16] border border-[#424655] font-mono text-xs text-[#dfe2ee] focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]"
                />
                <button
                  type="button"
                  onClick={() => setShowRealPassword((v) => !v)}
                  aria-label="Toggle password visibility"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c2c6d7] hover:text-[#dfe2ee]"
                >
                  {showRealPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Security Boundary Note */}
          <div className="rounded-lg obsidian-inset p-4 space-y-1">
            <div className="text-xs font-semibold text-[#00E5FF]">
              Scan Isolation Policy (vpnban)
            </div>
            <p className="text-xs text-[#c2c6d7] leading-relaxed">
              Every fleet probe automatically creates a fresh random fake username and password (<span className="font-mono text-[#dfe2ee]">probe_xxxxxxxx : fake_xxxxxxxxxxxx</span>). Your real credentials above are prompted and applied strictly when you choose to connect.
            </p>
          </div>

          {/* Root CA Verification Block */}
          <div className="rounded-lg obsidian-inset p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#dfe2ee]">
                <ShieldCheck
                  className={`w-4 h-4 shrink-0 ${
                    vault.rootCaVerified ? 'text-[#00E676]' : 'text-[#FFAB00]'
                  }`}
                />
                <span>DigiCert &amp; NordVPN Root CA Pinning</span>
              </div>
              <div className="font-mono text-[11px] text-[#8c90a0] truncate">
                SHA-256: {vault.rootCaFingerprint}
              </div>
            </div>
            <button
              type="button"
              onClick={onVerifyRootCa}
              className="min-h-[38px] px-3.5 py-1.5 rounded-lg border border-white/10 bg-[#262a33] hover:border-[#00E5FF]/50 text-xs font-medium text-[#dfe2ee] whitespace-nowrap"
            >
              {vault.rootCaVerified ? 'Re-Verify CA Chain' : 'Verify Root CA'}
            </button>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[#8c90a0]">
              {savedNotice
                ? 'Credentials stored in encrypted session vault.'
                : 'Stored locally in session memory · never used during scans.'}
            </span>
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 rounded-lg bg-[#2979FF] hover:bg-[#1E66E5] text-xs font-semibold text-[#F8FAFC] inline-flex items-center gap-2 obsidian-halo-blue"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Save Real Credentials</span>
            </button>
          </div>
        </form>

        {/* Advanced IPSec Stack Settings (Stitch 52dp x 32dp switches) */}
        <div className="lg:col-span-5 rounded-xl obsidian-card p-6 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-[#dfe2ee]">
              IPSec &amp; Mobile Baseband Stack
            </h2>
            <p className="text-xs text-[#c2c6d7] mt-1">
              Resilient tunnel policies for Android 6.0+ VpnService &amp; cellular roaming
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
                className="flex items-center justify-between gap-4 rounded-lg obsidian-inset p-3.5"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#dfe2ee]">{item.title}</div>
                  <div className="text-[11px] text-[#8c90a0] mt-0.5 leading-snug">{item.desc}</div>
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
                  className={`relative inline-flex h-8 w-[52px] shrink-0 cursor-pointer items-center rounded-full border border-white/10 transition-colors ${
                    item.val ? 'bg-[#2979FF]' : 'bg-[#262a33]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 rounded-full transition-transform ${
                      item.val ? 'translate-x-6 bg-[#F8FAFC]' : 'translate-x-1 bg-[#8c90a0]'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-medium text-[#c2c6d7]">
              Negotiated IPSec Cipher Suite
            </label>
            <select
              value={tunnelSettings.cipherSuite}
              onChange={(e) =>
                onUpdateTunnel({
                  cipherSuite: e.target.value as TunnelSettings['cipherSuite'],
                })
              }
              className="w-full h-12 px-3 rounded-lg bg-[#0a0e16] border border-[#424655] font-mono text-xs text-[#dfe2ee] focus:outline-none focus:border-[#00E5FF]"
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

      {/* Android 6.0+ (API 23+) APK Project Export, App Icon & CI/CD Tagging */}
      <section className="rounded-xl obsidian-card p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-start gap-4">
            <img
              src={appIconImg}
              alt="Android App Icon"
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-2xl border border-white/15 object-cover shrink-0 shadow-[0_4px_16px_rgba(0,0,0,0.45)]"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#00E676]" />
                <h2 className="text-xl font-bold text-[#dfe2ee]">
                  Android 6.0+ (API 23–35) APK Project &amp; Icon
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#c2c6d7] max-w-3xl">
                Includes the vector Obsidian Shield adaptive launcher icon (<code className="font-mono text-[#00E5FF]">ic_launcher</code>), random fake-credential <code className="font-mono text-[#00E5FF]">VpnbanScannerEngine.kt</code>, real-password connect dialog, and GitHub Actions APK release workflows supporting tags like <code className="font-mono text-[#00E5FF]">v.0.0.1</code>.
              </p>
            </div>
          </div>

          <a
            href="/api/android/export-zip"
            download="nordvpn-ikev2-explorer-android6-plus.zip"
            className="min-h-[48px] px-5 py-2.5 rounded-lg bg-[#2979FF] hover:bg-[#1E66E5] text-sm font-semibold text-[#F8FAFC] inline-flex items-center gap-2 obsidian-halo-blue whitespace-nowrap shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download Android 6.0+ Project (.zip)</span>
          </a>
        </div>

        {/* CI/CD Automated Release & Tag Command Strip */}
        <div className="rounded-xl obsidian-inset p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#00E5FF]" />
              <span className="text-xs font-semibold text-[#dfe2ee]">
                CI/CD Auto-Release &amp; Tag Pipeline (supports v.0.0.1 &amp; v*)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="release-tag-input" className="text-xs text-[#c2c6d7]">
                Version Tag:
              </label>
              <input
                id="release-tag-input"
                type="text"
                value={releaseTag}
                onChange={(e) => setReleaseTag(e.target.value)}
                className="w-28 h-8 px-2.5 rounded bg-[#0f131c] border border-[#424655] font-mono text-xs text-[#00E5FF] focus:outline-none focus:border-[#00E5FF]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/5 bg-[#0f131c] px-3.5 py-2.5">
            <code className="font-mono text-[11px] text-[#dfe2ee] overflow-x-auto whitespace-nowrap">
              {releaseCommand}
            </code>
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(releaseCommand);
                  setCopiedCmd(true);
                  setTimeout(() => setCopiedCmd(false), 1800);
                } catch {
                  // ignore clipboard restrictions
                }
              }}
              className="px-2.5 py-1 rounded bg-[#262a33] border border-white/10 text-xs text-[#dfe2ee] hover:border-[#00E5FF]/50 inline-flex items-center gap-1.5 shrink-0"
            >
              {copiedCmd ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#00E676]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Command</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-[#8c90a0]">
            Pushing <code className="font-mono text-[#00E5FF]">{releaseTag}</code> triggers GitHub Actions to compile, sign with <code className="font-mono text-[#00E5FF]">apksigner</code>, and attach both Debug &amp; Release Android 6.0+ APKs directly to your GitHub Release.
          </p>
        </div>

        {/* File Tree + Code Viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-4 space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
            {ANDROID_PROJECT_FILES.map((file, idx) => (
              <button
                key={file.path}
                type="button"
                onClick={() => setSelectedFileIndex(idx)}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg border transition-colors ${
                  idx === selectedFileIndex
                    ? 'border-[#2979FF] bg-[#2979FF]/15 text-[#dfe2ee]'
                    : 'border-white/5 bg-[#0a0e16] text-[#c2c6d7] hover:text-[#dfe2ee]'
                }`}
              >
                <div className="font-mono text-xs font-medium truncate">{file.path}</div>
                <div className="text-[11px] text-[#8c90a0] truncate mt-0.5">
                  {file.description}
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-8 rounded-xl border border-white/10 bg-[#0a0e16] overflow-hidden flex flex-col">
            <div className="px-4 py-2.5 border-b border-white/10 bg-[#181c24] flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-[#00E5FF] truncate">
                {activeFile.path}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-2.5 py-1 rounded bg-[#262a33] border border-white/10 text-xs text-[#dfe2ee] hover:border-[#00E5FF]/50 inline-flex items-center gap-1.5 shrink-0"
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
            <pre className="p-4 font-mono text-xs text-[#dfe2ee] overflow-x-auto max-h-[460px] leading-relaxed">
              <code>{activeFile.content}</code>
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
};
