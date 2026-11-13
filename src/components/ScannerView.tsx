import React, { useMemo, useState } from 'react';
import {
  Radar,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
} from 'lucide-react';
import type { VpnServer, ScanConfig } from '../types/vpn';

interface ScannerViewProps {
  servers: VpnServer[];
  totalDiscovered: number;
  dataSource: 'live-nord-api' | 'curated-snapshot';
  scanConfig: ScanConfig;
  isScanning: boolean;
  lastScanDurationMs: number | null;
  selectedServerId: number;
  onUpdateConfig: (patch: Partial<ScanConfig>) => void;
  onRunScan: () => void;
  onSelectAndConnect: (server: VpnServer) => void;
  onTraceServer: (server: VpnServer) => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({
  servers,
  totalDiscovered,
  dataSource,
  scanConfig,
  isScanning,
  lastScanDurationMs,
  selectedServerId,
  onUpdateConfig,
  onRunScan,
  onSelectAndConnect,
  onTraceServer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'latency' | 'load'>('score');
  const [cleanOnly, setCleanOnly] = useState(false);
  const [techFilter, setTechFilter] = useState<'all' | 'ikev2' | 'wireguard_udp' | 'openvpn_udp'>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const regions = ['All', 'Europe', 'North America', 'Asia-Pacific', 'Middle East & Africa', 'South America'];

  const filteredServers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return servers
      .filter((s) => {
        if (scanConfig.regionFilter !== 'All' && s.region !== scanConfig.regionFilter) return false;
        if (cleanOnly && s.banStatus !== 'clean') return false;
        if (techFilter !== 'all' && !s.technologies.includes(techFilter)) return false;
        if (
          q &&
          !s.hostname.toLowerCase().includes(q) &&
          !s.city.toLowerCase().includes(q) &&
          !s.country.toLowerCase().includes(q) &&
          !s.ip.includes(q)
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'latency') return (a.latencyMs ?? 999) - (b.latencyMs ?? 999);
        if (sortBy === 'load') return a.load - b.load;
        return b.score - a.score;
      });
  }, [servers, scanConfig.regionFilter, cleanOnly, techFilter, searchQuery, sortBy]);

  const cleanCount = servers.filter((s) => s.banStatus === 'clean').length;
  const cleanRate = servers.length ? ((cleanCount / servers.length) * 100).toFixed(1) : '0.0';
  const avgLatency = useMemo(() => {
    const valid = servers.filter((s) => s.latencyMs !== null);
    if (!valid.length) return 0;
    return Math.round(valid.reduce((acc, s) => acc + (s.latencyMs ?? 0), 0) / valid.length);
  }, [servers]);

  return (
    <div className="space-y-6">
      {/* Fleet Telemetry Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/10 bg-[#0F172A] p-4">
          <div className="text-xs text-[#94A3B8]">Global Fleet Catalog</div>
          <div className="mt-1.5 font-mono text-2xl font-bold text-[#F8FAFC] tabular-nums">
            {totalDiscovered.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-[#64748B]">
            {dataSource === 'live-nord-api' ? 'Live NordVPN API' : 'Curated Relay Snapshot'}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0F172A] p-4">
          <div className="text-xs text-[#94A3B8]">Active Probed Relays</div>
          <div className="mt-1.5 font-mono text-2xl font-bold text-[#00E5FF] tabular-nums">
            {servers.length}
          </div>
          <div className="mt-1 text-xs text-[#64748B] tabular-nums">
            {lastScanDurationMs ? `Last sweep ${lastScanDurationMs}ms` : 'Ready to probe'}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0F172A] p-4">
          <div className="text-xs text-[#94A3B8]">Clean IKEv2 Rate</div>
          <div className="mt-1.5 font-mono text-2xl font-bold text-[#00E676] tabular-nums">
            {cleanRate}%
          </div>
          <div className="mt-1 text-xs text-[#64748B] tabular-nums">
            {cleanCount} low-ban relays verified
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0F172A] p-4">
          <div className="text-xs text-[#94A3B8]">Fleet Mean RTT</div>
          <div className="mt-1.5 font-mono text-2xl font-bold text-[#F8FAFC] tabular-nums">
            {avgLatency} ms
          </div>
          <div className="mt-1 text-xs text-[#64748B]">
            UDP {scanConfig.probePort} · {scanConfig.workers} workers
          </div>
        </div>
      </div>

      {/* vpnban Async Probe Engine Control Panel */}
      <section className="rounded-xl border border-white/10 bg-[#0F172A] p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-xl font-bold text-[#F8FAFC]">
              vpnban IKEv2 Async Probe Engine
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
              Probes UDP 500/4500 gateways using wrong canary credentials to isolate clean, unbanned servers before connecting with your real NordService account.
            </p>
          </div>
          <button
            type="button"
            onClick={onRunScan}
            disabled={isScanning}
            className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[#2979FF] hover:bg-[#1E66E5] text-sm font-semibold text-[#F8FAFC] inline-flex items-center gap-2 transition-all shadow-[0_0_16px_rgba(41,121,255,0.3)] whitespace-nowrap disabled:opacity-60"
          >
            <Radar className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? `Probing (${scanConfig.workers} Workers)...` : 'Run Wrong-Cred Fleet Scan'}</span>
          </button>
        </div>

        {/* Scanner Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-white/10">
          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
              Async Worker Pool
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 rounded-lg bg-[#0D1321] border border-white/10">
              {([8, 16, 32, 64] as const).map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => onUpdateConfig({ workers: w })}
                  className={`py-1.5 rounded text-xs font-mono font-semibold transition-colors ${
                    scanConfig.workers === w
                      ? 'bg-[#2979FF] text-[#F8FAFC]'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
              ISAKMP Probe Timeout
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-[#0D1321] border border-white/10">
              {([1500, 2500, 5000] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onUpdateConfig({ timeoutMs: t })}
                  className={`py-1.5 rounded text-xs font-mono font-semibold transition-colors ${
                    scanConfig.timeoutMs === t
                      ? 'bg-[#2979FF] text-[#F8FAFC]'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  {(t / 1000).toFixed(1)}s
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
              Target UDP Port
            </label>
            <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-[#0D1321] border border-white/10">
              {([500, 4500] as const).map((port) => (
                <button
                  key={port}
                  type="button"
                  onClick={() => onUpdateConfig({ probePort: port })}
                  className={`py-1.5 rounded text-xs font-mono font-semibold transition-colors ${
                    scanConfig.probePort === port
                      ? 'bg-[#2979FF] text-[#F8FAFC]'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  {port === 500 ? 'UDP 500' : 'UDP 4500 NAT-T'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
              Wrong-Credential Canary Check
            </label>
            <button
              type="button"
              onClick={() =>
                onUpdateConfig({ useWrongCredentialCheck: !scanConfig.useWrongCredentialCheck })
              }
              className={`w-full min-h-[38px] px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center justify-between transition-colors ${
                scanConfig.useWrongCredentialCheck
                  ? 'border-[#00E676]/50 bg-[#00E676]/10 text-[#F8FAFC]'
                  : 'border-white/10 bg-[#0D1321] text-[#94A3B8]'
              }`}
            >
              <span>{scanConfig.useWrongCredentialCheck ? 'Canary Active' : 'SA_INIT Only'}</span>
              <span className="font-mono text-[11px] text-[#00E5FF]">
                {scanConfig.canaryUsername}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Search, Filter & Server Explorer Table */}
      <section className="rounded-xl border border-white/10 bg-[#0F172A] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by hostname, city, country, or IPv4..."
                className="w-full h-11 pl-10 pr-4 rounded-lg bg-[#0D1321] border border-[#334155] text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#00E5FF]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={techFilter}
                onChange={(e) => setTechFilter(e.target.value as typeof techFilter)}
                aria-label="Filter by protocol"
                className="h-11 px-3 rounded-lg bg-[#0D1321] border border-[#334155] text-xs text-[#F8FAFC] focus:outline-none focus:border-[#00E5FF]"
              >
                <option value="all">All Protocols</option>
                <option value="ikev2">IKEv2/IPSec</option>
                <option value="wireguard_udp">NordLynx (WireGuard)</option>
                <option value="openvpn_udp">OpenVPN UDP</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                aria-label="Sort servers"
                className="h-11 px-3 rounded-lg bg-[#0D1321] border border-[#334155] text-xs text-[#F8FAFC] focus:outline-none focus:border-[#00E5FF]"
              >
                <option value="score">Sort: vpnban Score</option>
                <option value="latency">Sort: Lowest Latency</option>
                <option value="load">Sort: Lowest Load</option>
              </select>

              <button
                type="button"
                onClick={() => setCleanOnly((v) => !v)}
                className={`h-11 px-3.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap ${
                  cleanOnly
                    ? 'border-[#2979FF] bg-[#2979FF]/15 text-[#F8FAFC]'
                    : 'border-[#334155] bg-[#0D1321] text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                Clean IPs Only
              </button>
            </div>
          </div>

          {/* Region Segmented Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {regions.map((region) => (
              <button
                key={region}
                type="button"
                onClick={() => onUpdateConfig({ regionFilter: region })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  scanConfig.regionFilter === region
                    ? 'bg-[#2979FF] text-[#F8FAFC]'
                    : 'bg-[#0D1321] text-[#94A3B8] hover:text-[#F8FAFC] border border-white/5'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* Data Grid */}
        <div className="divide-y divide-white/5">
          {filteredServers.length === 0 ? (
            <div className="p-10 text-center text-sm text-[#94A3B8]">
              No gateways match the active filter criteria. Reset filters or run a fresh fleet scan.
            </div>
          ) : (
            filteredServers.map((srv) => {
              const expanded = expandedId === srv.id;
              const isSelected = srv.id === selectedServerId;

              return (
                <div
                  key={srv.id}
                  className={`transition-colors ${
                    isSelected ? 'bg-[#2979FF]/8' : 'hover:bg-[#1E293B]/40'
                  }`}
                >
                  <div className="px-4 sm:px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">
                    <div className="min-w-[200px] flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-display text-sm font-semibold text-[#F8FAFC]">
                          {srv.city}, {srv.countryCode}
                        </span>
                        <span className="text-[#64748B]" aria-hidden="true">·</span>
                        <span className="font-mono text-xs text-[#94A3B8]">{srv.hostname}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#64748B] font-mono tabular-nums">
                        <span>{srv.ip}</span>
                        <span aria-hidden="true">·</span>
                        <span>{srv.probeMethod}</span>
                        <span aria-hidden="true">·</span>
                        <span>Score {srv.score}/100</span>
                      </div>
                    </div>

                    {/* Status + Metrics */}
                    <div className="flex flex-wrap items-center gap-6">
                      <div className="text-right">
                        <div className="text-[11px] text-[#64748B]">Latency</div>
                        <div className="font-mono text-sm font-semibold text-[#F8FAFC] tabular-nums">
                          {srv.latencyMs !== null ? `${srv.latencyMs} ms` : '--'}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[11px] text-[#64748B]">Load</div>
                        <div
                          className={`font-mono text-sm font-semibold tabular-nums ${
                            srv.load > 70 ? 'text-[#FFAB00]' : 'text-[#F8FAFC]'
                          }`}
                        >
                          {srv.load}%
                        </div>
                      </div>

                      <div className="min-w-[115px] flex items-center gap-1.5 text-xs font-medium">
                        {srv.banStatus === 'clean' && (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-[#00E676] shrink-0" />
                            <span className="text-[#00E676]">Clean IP</span>
                          </>
                        )}
                        {srv.banStatus === 'throttled' && (
                          <>
                            <AlertTriangle className="w-4 h-4 text-[#FFAB00] shrink-0" />
                            <span className="text-[#FFAB00]">Throttled</span>
                          </>
                        )}
                        {(srv.banStatus === 'banned' || srv.banStatus === 'unreachable') && (
                          <>
                            <XCircle className="w-4 h-4 text-[#FF1744] shrink-0" />
                            <span className="text-[#FF1744]">
                              {srv.banStatus === 'banned' ? 'Banned / DPI' : 'Unreachable'}
                            </span>
                          </>
                        )}
                        {srv.banStatus === 'untested' && (
                          <span className="text-[#94A3B8]">Untested</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectAndConnect(srv)}
                          className="min-h-[36px] px-3 py-1.5 rounded-lg bg-[#2979FF] hover:bg-[#1E66E5] text-xs font-semibold text-[#F8FAFC] inline-flex items-center gap-1.5 whitespace-nowrap"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Connect</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpandedId(expanded ? null : srv.id)}
                          aria-label="Toggle raw canary diagnostics"
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg border border-white/10 bg-[#0D1321] text-[#94A3B8] hover:text-[#F8FAFC]"
                        >
                          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {expanded && (
                    <div className="px-4 sm:px-5 pb-4 pt-1">
                      <div className="rounded-lg border border-white/10 bg-[#080C14] p-4 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <span className="text-[#64748B]">Wrong-Cred Canary Verdict:</span>
                            <div className="font-mono text-[#00E5FF] mt-0.5">{srv.wrongCredResponse}</div>
                          </div>
                          <div>
                            <span className="text-[#64748B]">Jitter & Packet Loss:</span>
                            <div className="font-mono text-[#F8FAFC] mt-0.5 tabular-nums">
                              ±{srv.jitterMs ?? 2.0} ms · {srv.packetLossPct}% loss
                            </div>
                          </div>
                          <div>
                            <span className="text-[#64748B]">Supported Stack:</span>
                            <div className="font-mono text-[#F8FAFC] mt-0.5">
                              {srv.technologies.join(' · ')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
                          <button
                            type="button"
                            onClick={() => onTraceServer(srv)}
                            className="px-3 py-1.5 rounded-lg border border-white/10 bg-[#1E293B] text-xs font-medium text-[#F8FAFC] hover:border-[#00E5FF]/50"
                          >
                            Run 4-Stage ISAKMP Trace
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};
