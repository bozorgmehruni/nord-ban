import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  ArrowUpDown,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import type {
  VpnServer,
  TunnelSettings,
  TelemetryPoint,
  HandshakeTrace,
  ProtocolType,
} from '../types/vpn';

interface ProDashboardProps {
  isConnected: boolean;
  isConnecting: boolean;
  selectedServer: VpnServer;
  tunnelSettings: TunnelSettings;
  telemetry: TelemetryPoint[];
  handshakeTrace: HandshakeTrace | null;
  connectionSeconds: number;
  onConnectToggle: () => void;
  onProtocolSwitch: (protocol: ProtocolType) => void;
  onRunHandshakeTrace: () => void;
  onExportJson: () => void;
  onNavigateDiagnostics: () => void;
}

function buildSparklinePath(values: number[], width: number, height: number, maxVal: number): string {
  if (values.length === 0) return '';
  const stepX = width / Math.max(1, values.length - 1);
  return values
    .map((val, idx) => {
      const x = idx * stepX;
      const clamped = Math.min(maxVal, Math.max(0, val));
      const y = height - (clamped / Math.max(1, maxVal)) * (height - 8) - 4;
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

function formatDuration(sec: number): string {
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return [hrs, mins, s].map((v) => String(v).padStart(2, '0')).join(':');
}

export const ProDashboard: React.FC<ProDashboardProps> = ({
  isConnected,
  isConnecting,
  selectedServer,
  tunnelSettings,
  telemetry,
  handshakeTrace,
  connectionSeconds,
  onConnectToggle,
  onProtocolSwitch,
  onRunHandshakeTrace,
  onExportJson,
  onNavigateDiagnostics,
}) => {
  const latest = telemetry[telemetry.length - 1] ?? {
    downloadMbps: 0,
    uploadMbps: 0,
    latencyMs: selectedServer.latencyMs ?? 24,
    jitterMs: selectedServer.jitterMs ?? 2.1,
    timestamp: '--:--:--',
  };

  const dlValues = telemetry.map((p) => p.downloadMbps);
  const ulValues = telemetry.map((p) => p.uploadMbps);
  const latValues = telemetry.map((p) => p.latencyMs);

  const dlPath = buildSparklinePath(dlValues, 360, 76, 450);
  const ulPath = buildSparklinePath(ulValues, 360, 76, 450);
  const latPath = buildSparklinePath(latValues, 360, 76, 180);

  const protocols: ProtocolType[] = ['IKEv2/IPSec', 'NordLynx', 'OpenVPN UDP'];

  return (
    <div className="space-y-6">
      {/* Top Telemetry KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className={`rounded-xl obsidian-card p-5 ${isConnected ? 'obsidian-halo-blue' : ''}`}>
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.05em] text-[#8c90a0]">
            <span>Tunnel State</span>
            <span className="font-mono tabular-nums text-[#c2c6d7]">
              {isConnected ? formatDuration(connectionSeconds) : 'IDLE'}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            {isConnected ? (
              <ShieldCheck className="w-5 h-5 text-[#00E676] shrink-0" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-[#FFAB00] shrink-0" />
            )}
            <span className="text-lg font-bold text-[#dfe2ee] truncate">
              {isConnected ? 'IKEv2 Established' : 'Standby / Ready'}
            </span>
          </div>
          <div className="mt-2 text-xs text-[#c2c6d7] font-mono truncate">
            {selectedServer.hostname} · {selectedServer.ip}
          </div>
        </div>

        <div className="rounded-xl obsidian-card p-5">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.05em] text-[#8c90a0]">
            <span>Live Throughput</span>
            <ArrowUpDown className="w-3.5 h-3.5 text-[#00E5FF]" />
          </div>
          <div className="mt-2 flex items-baseline gap-3 font-mono tabular-nums">
            <span className="text-2xl font-bold text-[#00E5FF]">
              {isConnected ? latest.downloadMbps.toFixed(1) : '0.0'}
            </span>
            <span className="text-xs text-[#c2c6d7]">Mbps ↓</span>
            <span className="text-base font-semibold text-[#2979FF]">
              {isConnected ? latest.uploadMbps.toFixed(1) : '0.0'}
            </span>
            <span className="text-xs text-[#c2c6d7]">Mbps ↑</span>
          </div>
          <div className="mt-2 text-xs text-[#8c90a0] tabular-nums">
            Baseband MTU {tunnelSettings.mtuClamping ? `${tunnelSettings.mtuValue} B` : '1500 B'}
          </div>
        </div>

        <div className="rounded-xl obsidian-card p-5">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.05em] text-[#8c90a0]">
            <span>RTT Latency &amp; Jitter</span>
            <span className="font-mono text-[#00E676] tabular-nums">
              {selectedServer.packetLossPct}% loss
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-3 font-mono tabular-nums">
            <span className="text-2xl font-bold text-[#dfe2ee]">
              {latest.latencyMs.toFixed(0)} ms
            </span>
            <span className="text-xs text-[#c2c6d7]">
              ±{latest.jitterMs.toFixed(1)} ms jitter
            </span>
          </div>
          <div className="mt-2 text-xs text-[#8c90a0]">
            {tunnelSettings.natTraversal ? 'NAT-T UDP 4500' : 'Native UDP 500'} ·{' '}
            {tunnelSettings.mobike ? 'MOBIKE On' : 'MOBIKE Off'}
          </div>
        </div>

        <div className="rounded-xl obsidian-card p-5">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.05em] text-[#8c90a0]">
            <span>IP Masking &amp; Kill Switch</span>
            <span className="text-[#00E676] font-semibold">
              {tunnelSettings.killSwitch ? 'Strict' : 'Standard'}
            </span>
          </div>
          <div className="mt-2 font-mono text-base font-semibold text-[#dfe2ee] tabular-nums">
            {isConnected ? selectedServer.ip : 'Local Egress Exposed'}
          </div>
          <div className="mt-2 text-xs text-[#c2c6d7] font-mono tabular-nums">
            Virtual TUN: {isConnected ? '10.6.0.2/24' : 'Inactive'}
          </div>
        </div>
      </div>

      {/* Main 2-Column Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Sparklines + Protocol Pivot */}
        <div className="lg:col-span-7 rounded-xl obsidian-card p-6 flex flex-col justify-between space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#dfe2ee]">
                Packet Throughput &amp; Latency Telemetry
              </h2>
              <p className="text-xs text-[#c2c6d7] mt-0.5">
                Real-time tunnel stream · {tunnelSettings.cipherSuite}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onExportJson}
                className="min-h-[38px] px-3 py-1.5 rounded-lg border border-white/10 bg-[#262a33] text-xs font-medium text-[#dfe2ee] hover:border-[#00E5FF]/50 inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>Export JSON</span>
              </button>
              <button
                type="button"
                onClick={onConnectToggle}
                disabled={isConnecting}
                className={`min-h-[38px] px-4 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isConnected
                    ? 'bg-[#262a33] border border-[#00E676]/50 text-[#dfe2ee] hover:border-[#FF1744]'
                    : 'bg-[#2979FF] text-[#F8FAFC] hover:bg-[#1E66E5] obsidian-halo-blue'
                }`}
              >
                {isConnecting ? 'Negotiating...' : isConnected ? 'Disconnect' : 'Connect Node'}
              </button>
            </div>
          </div>

          {/* Sparkline Containers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg obsidian-inset p-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-[#c2c6d7]">Down / Up Throughput</span>
                <span className="font-mono text-[#00E5FF] tabular-nums">
                  {isConnected ? `${latest.downloadMbps.toFixed(0)} / ${latest.uploadMbps.toFixed(0)} Mbps` : 'Standby'}
                </span>
              </div>
              <svg viewBox="0 0 360 76" className="w-full h-20 overflow-visible">
                <line x1="0" y1="38" x2="360" y2="38" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                {dlPath && (
                  <path d={dlPath} fill="none" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" />
                )}
                {ulPath && (
                  <path d={ulPath} fill="none" stroke="#2979FF" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 2" />
                )}
              </svg>
            </div>

            <div className="rounded-lg obsidian-inset p-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-[#c2c6d7]">Gateway RTT Window</span>
                <span className="font-mono text-[#00E676] tabular-nums">
                  {latest.latencyMs.toFixed(0)} ms
                </span>
              </div>
              <svg viewBox="0 0 360 76" className="w-full h-20 overflow-visible">
                <line x1="0" y1="38" x2="360" y2="38" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                {latPath && (
                  <path d={latPath} fill="none" stroke="#00E676" strokeWidth="2" strokeLinecap="round" />
                )}
              </svg>
            </div>
          </div>

          {/* Multi-Protocol Pivot Switch */}
          <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-medium text-[#dfe2ee]">Multi-Protocol Pivot Stack</div>
              <div className="text-xs text-[#8c90a0] mt-0.5">
                Instant fallback between Native IKEv2, NordLynx, and OpenVPN UDP 1194
              </div>
            </div>
            <div className="flex items-center gap-1 p-1 rounded-lg obsidian-inset">
              {protocols.map((proto) => (
                <button
                  key={proto}
                  type="button"
                  onClick={() => onProtocolSwitch(proto)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                    tunnelSettings.protocol === proto
                      ? 'bg-[#2979FF] text-[#F8FAFC]'
                      : 'text-[#c2c6d7] hover:text-[#dfe2ee]'
                  }`}
                >
                  {proto}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: 4-Stage Cryptographic Tunnel Routing & Fake Probe Status */}
        <div className="lg:col-span-5 rounded-xl obsidian-card p-6 flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-[#dfe2ee]">
                4-Stage Cryptographic Routing
              </h2>
              <p className="text-xs text-[#c2c6d7] mt-0.5">
                ISAKMP &amp; random fake-credential pipeline
              </p>
            </div>
            <button
              type="button"
              onClick={onRunHandshakeTrace}
              className="min-h-[36px] px-3 py-1.5 rounded-lg bg-[#262a33] border border-white/10 text-xs font-medium text-[#dfe2ee] hover:border-[#00E5FF]/50 inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Re-Trace</span>
            </button>
          </div>

          <div className="space-y-3">
            {(handshakeTrace?.stages ?? [
              { id: 'dns', label: 'DNS Resolution', detail: `${selectedServer.hostname} → ${selectedServer.ip}`, status: 'passed', durationMs: 6 },
              { id: 'probe', label: 'Gateway UDP 500/4500 Probe', detail: 'ISAKMP responder reachable', status: 'passed', durationMs: selectedServer.latencyMs ?? 24 },
              { id: 'ike_sa_init', label: 'IKE_SA_INIT Exchange', detail: 'AES-256-GCM · SHA-384 · DH-14', status: 'passed', durationMs: 31 },
              { id: 'ike_auth', label: 'IKE_AUTH & Random Fake-Cred Check', detail: selectedServer.wrongCredResponse, status: selectedServer.banStatus === 'banned' ? 'failed' : 'passed', durationMs: 42 },
            ]).map((stage, idx) => (
              <div
                key={stage.id}
                className="flex items-start justify-between gap-3 rounded-lg obsidian-inset p-3"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  {stage.status === 'passed' && (
                    <CheckCircle2 className="w-4 h-4 text-[#00E676] shrink-0 mt-0.5" />
                  )}
                  {stage.status === 'warning' && (
                    <AlertTriangle className="w-4 h-4 text-[#FFAB00] shrink-0 mt-0.5" />
                  )}
                  {stage.status === 'failed' && (
                    <XCircle className="w-4 h-4 text-[#FF1744] shrink-0 mt-0.5" />
                  )}
                  {(stage.status === 'idle' || stage.status === 'running') && (
                    <div className="w-4 h-4 rounded-full border border-[#00E5FF] shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#dfe2ee]">
                      {idx + 1}. {stage.label}
                    </div>
                    <div className="text-xs text-[#c2c6d7] truncate mt-0.5">
                      {stage.detail}
                    </div>
                  </div>
                </div>
                <span className="font-mono text-xs text-[#00E5FF] tabular-nums shrink-0">
                  {stage.durationMs !== null ? `${stage.durationMs}ms` : '--'}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
            <span className="text-[#c2c6d7]">
              Root CA: DigiCert / NordVPN Verified
            </span>
            <button
              type="button"
              onClick={onNavigateDiagnostics}
              className="text-[#00E5FF] hover:underline font-medium whitespace-nowrap"
            >
              Open Full Trace &amp; Triage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
