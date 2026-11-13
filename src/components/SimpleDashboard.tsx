import React from 'react';
import { Shield, ShieldCheck, ArrowRight, RefreshCw, Lock } from 'lucide-react';
import type { VpnServer, TunnelSettings } from '../types/vpn';

interface SimpleDashboardProps {
  isConnected: boolean;
  isConnecting: boolean;
  selectedServer: VpnServer;
  quickSwapServers: VpnServer[];
  tunnelSettings: TunnelSettings;
  connectionSeconds: number;
  onConnectToggle: () => void;
  onSelectServer: (server: VpnServer) => void;
  onRunBestScan: () => void;
  isScanning: boolean;
}

function formatDuration(sec: number): string {
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return [hrs, mins, s].map((v) => String(v).padStart(2, '0')).join(':');
}

export const SimpleDashboard: React.FC<SimpleDashboardProps> = ({
  isConnected,
  isConnecting,
  selectedServer,
  quickSwapServers,
  tunnelSettings,
  connectionSeconds,
  onConnectToggle,
  onSelectServer,
  onRunBestScan,
  isScanning,
}) => {
  return (
    <div className="space-y-8">
      {/* Primary Single-Anchor Protection Card */}
      <section className="rounded-2xl border border-white/10 bg-[#0F172A] p-6 sm:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-3 text-sm">
              {isConnected ? (
                <span className="inline-flex items-center gap-2 font-medium text-[#00E676]">
                  <span className="h-2 w-2 rounded-full bg-[#00E676] animate-pulse" />
                  Tunnel Protected
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 font-medium text-[#94A3B8]">
                  <Shield className="w-4 h-4 text-[#94A3B8]" />
                  Unprotected Standby
                </span>
              )}
              <span className="text-[#64748B]" aria-hidden="true">·</span>
              <span className="text-[#94A3B8] tabular-nums">{tunnelSettings.protocol}</span>
              {isConnected && (
                <>
                  <span className="text-[#64748B]" aria-hidden="true">·</span>
                  <span className="font-mono text-[#00E5FF] tabular-nums">
                    {formatDuration(connectionSeconds)}
                  </span>
                </>
              )}
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#F8FAFC] text-balance">
              {isConnected
                ? `Connected to ${selectedServer.city}, ${selectedServer.countryCode}`
                : 'Fast 1-tap IKEv2 protection on verified clean relays'}
            </h1>

            <p className="text-sm sm:text-base text-[#94A3B8] max-w-xl leading-relaxed">
              {isConnected
                ? `Encrypted via ${selectedServer.hostname} (${selectedServer.ip}) with ${tunnelSettings.mtuClamping ? `${tunnelSettings.mtuValue} B` : '1500 B'} MTU clamping and ${tunnelSettings.killSwitch ? 'Always-On Kill Switch active' : 'standard routing'}.`
                : `Selected relay ${selectedServer.hostname} passed wrong-credential canary probing with ${selectedServer.latencyMs ?? 24} ms latency and ${selectedServer.load}% load.`}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={onConnectToggle}
                disabled={isConnecting}
                className={`min-h-[48px] px-6 py-3 rounded-lg text-sm font-semibold inline-flex items-center gap-2.5 transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] ${
                  isConnected
                    ? 'bg-[#1E293B] border border-[#00E676]/50 text-[#F8FAFC] hover:border-[#FF1744] hover:text-[#FF1744]'
                    : 'bg-[#2979FF] text-[#F8FAFC] hover:bg-[#1E66E5] shadow-[0_0_18px_rgba(41,121,255,0.35)]'
                } disabled:opacity-60`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {isConnecting
                    ? 'Negotiating IKEv2 Handshake...'
                    : isConnected
                      ? 'Disconnect Tunnel'
                      : 'Connect to Best Server'}
                </span>
              </button>

              <button
                type="button"
                onClick={onRunBestScan}
                disabled={isScanning}
                className="min-h-[48px] px-5 py-3 rounded-lg text-sm font-medium bg-[#1E293B] border border-white/10 text-[#F8FAFC] hover:border-[#00E5FF]/50 inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 text-[#00E5FF] ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'Probing Clean Nodes...' : 'Find Best Clean Node'}</span>
              </button>
            </div>
          </div>

          {/* Right Summary Panel */}
          <div className="lg:col-span-5 rounded-xl border border-white/10 bg-[#0D1321] p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <div className="text-xs text-[#94A3B8]">Target Relay</div>
                <div className="font-mono text-base font-semibold text-[#F8FAFC] mt-0.5">
                  {selectedServer.hostname}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[#94A3B8]">Ping</div>
                <div className="font-mono text-lg font-bold text-[#00E676] tabular-nums mt-0.5">
                  {selectedServer.latencyMs ?? 24} ms
                </div>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs text-[#64748B]">Gateway IP</dt>
                <dd className="font-mono text-[#F8FAFC] tabular-nums mt-1">{selectedServer.ip}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#64748B]">Server Load</dt>
                <dd className="font-mono text-[#F8FAFC] tabular-nums mt-1">{selectedServer.load}%</dd>
              </div>
              <div>
                <dt className="text-xs text-[#64748B]">Canary Check</dt>
                <dd className="font-medium text-[#00E676] mt-1">
                  {selectedServer.banStatus === 'clean' ? 'Clean IP' : selectedServer.banStatus}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#64748B]">Kill Switch & MTU</dt>
                <dd className="font-mono text-[#F8FAFC] tabular-nums mt-1">
                  {tunnelSettings.killSwitch ? 'Strict' : 'Off'} · {tunnelSettings.mtuValue} B
                </dd>
              </div>
            </dl>

            <div className="flex items-center gap-2 pt-2 border-t border-white/10 text-xs text-[#94A3B8]">
              <Lock className="w-3.5 h-3.5 text-[#00E5FF] shrink-0" />
              <span>Real NordService credentials committed only after canary verification</span>
            </div>
          </div>
        </div>
      </section>

      {/* Instant Server Quick-Swap Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-[#F8FAFC]">
            Quick Server Swap
          </h2>
          <span className="text-xs text-[#94A3B8]">
            Top clean relays ranked by vpnban score
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickSwapServers.map((srv) => {
            const active = srv.id === selectedServer.id;
            return (
              <button
                key={srv.id}
                type="button"
                onClick={() => onSelectServer(srv)}
                className={`text-left rounded-xl border p-4 transition-all min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] ${
                  active
                    ? 'border-[#2979FF] bg-[#2979FF]/10 shadow-[0_0_12px_rgba(41,121,255,0.2)]'
                    : 'border-white/10 bg-[#0F172A] hover:border-white/25'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-semibold text-[#F8FAFC]">
                    {srv.city}, {srv.countryCode}
                  </span>
                  <span className="font-mono text-xs font-semibold text-[#00E676] tabular-nums">
                    {srv.latencyMs ?? 28} ms
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-xs text-[#94A3B8]">
                  <span className="font-mono truncate">{srv.hostname}</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0 text-[#64748B]" />
                </div>
                <div className="mt-2.5 text-xs text-[#64748B] tabular-nums">
                  Load {srv.load}% · Score {srv.score}/100
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
