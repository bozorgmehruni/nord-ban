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
  Square,
} from 'lucide-react';
import type { VpnServer, ScanConfig } from '../types/vpn';

interface ScannerViewProps {
  servers: VpnServer[];
  totalDiscovered: number;
  dataSource: 'live-nord-api' | 'curated-snapshot';
  scanConfig: ScanConfig;
  isScanning: boolean;
  scanProgress: { completed: number; total: number } | null;
  lastScanDurationMs: number | null;
  selectedServerId: number;
  onUpdateConfig: (patch: Partial<ScanConfig>) => void;
  onRunScan: () => void;
  onStopScan: () => void;
  onSelectAndConnect: (server: VpnServer) => void;
  onTraceServer: (server: VpnServer) => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({
  servers,
  totalDiscovered,
  dataSource,
  scanConfig,
  isScanning,
  scanProgress,
  lastScanDurationMs,
  selectedServerId,
  onUpdateConfig,
  onRunScan,
  onStopScan,
  onSelectAndConnect,
  onTraceServer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'latency' | 'load'>('score');
  const [cleanOnly, setCleanOnly] = useState(false);
  const [techFilter, setTechFilter] = useState<'all' | 'ikev2' | 'wireguard_udp' | 'openvpn_udp'>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(100);

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

  const displayedServers = useMemo(
    () => filteredServers.slice(0, visibleCount),
    [filteredServers, visibleCount]
  );

  const probedCount = useMemo(
    () => servers.filter((s) => s.banStatus !== 'untested').length,
    [servers]
  );
  const cleanCount = useMemo(
    () => servers.filter((s) => s.banStatus === 'clean').length,
    [servers]
  );
  const cleanRate = probedCount > 0 ? ((cleanCount / probedCount) * 100).toFixed(1) : '0.0';
  const avgLatency = useMemo(() => {
    const valid = servers.filter((s) => s.latencyMs !== null);
    if (!valid.length) return 0;
    return Math.round(valid.reduce((acc, s) => acc + (s.latencyMs ?? 0), 0) / valid.length);
  }, [servers]);

  const progressPct = scanProgress && scanProgress.total > 0
    ? Math.round((scanProgress.completed / scanProgress.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Fleet Telemetry Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl obsidian-card p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#8c90a0]">
            Global Fleet Catalog
          </div>
          <div className="mt-1.5 font-mono text-2xl font-bold text-[#dfe2ee] tabular-nums">
            {totalDiscovered.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-[#8c90a0]">
            {dataSource === 'live-nord-api' ? 'Live NordVPN Full API' : 'Curated Relay Snapshot'}
          </div>
        </div>

        <div className="rounded-xl obsidian-card p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#8c90a0]">
            Probed / Loaded List
          </div>
          <div className="mt-1.5 font-mono text-2xl font-bold text-[#00E5FF] tabular-nums">
            {probedCount.toLocaleString()} / {servers.length.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-[#8c90a0] tabular-nums">
            {lastScanDurationMs ? `Last sweep ${(lastScanDurationMs / 1000).toFixed(1)}s` : 'Ready to scan all nodes'}
          </div>
        </div>

        <div className="rounded-xl obsidian-card p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#8c90a0]">
            Clean IKEv2 Rate
          </div>
          <div className="mt-1.5 font-mono text-2xl font-bold text-[#00E676] tabular-nums">
            {cleanRate}%
          </div>
          <div className="mt-1 text-xs text-[#8c90a0] tabular-nums">
            {cleanCount.toLocaleString()} low-ban relays verified
          </div>
        </div>

        <div className="rounded-xl obsidian-card p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#8c90a0]">
            Fleet Mean RTT
          </div>
          <div className="mt-1.5 font-mono text-2xl font-bold text-[#dfe2ee] tabular-nums">
            {avgLatency} ms
          </div>
          <div className="mt-1 text-xs text-[#8c90a0]">
            UDP {scanConfig.probePort} · {scanConfig.workers} workers
          </div>
        </div>
      </div>

      {/* vpnban Async Probe Engine Control Panel */}
      <section className={`rounded-xl obsidian-card p-5 sm:p-6 space-y-5 ${isScanning ? 'obsidian-halo-cyan' : ''}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#dfe2ee]">
              vpnban IKEv2 Async Probe Engine
            </h1>
            <p className="text-xs sm:text-sm text-[#c2c6d7] mt-1">
              Scans ALL {servers.length.toLocaleString()} servers in the loaded list using auto-generated random fake usernames and passwords — your real NordService password is requested only when connecting.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            {isScanning && (
              <button
                type="button"
                onClick={onStopScan}
                className="min-h-[48px] px-4 py-2.5 rounded-lg bg-[#262a33] border border-[#FF1744]/50 text-sm font-semibold text-[#FF1744] hover:bg-[#FF1744]/10 inline-flex items-center gap-2 whitespace-nowrap"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </button>
            )}
            <button
              type="button"
              onClick={onRunScan}
              disabled={isScanning}
              className="min-h-[48px] px-5 py-2.5 rounded-lg bg-[#2979FF] hover:bg-[#1E66E5] text-sm font-semibold text-[#F8FAFC] inline-flex items-center gap-2 transition-all obsidian-halo-blue whitespace-nowrap disabled:opacity-60"
            >
              <Radar className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>
                {isScanning && scanProgress
                  ? `Probing ${scanProgress.completed.toLocaleString()}/${scanProgress.total.toLocaleString()} (${progressPct}%)`
                  : `Scan All ${servers.length.toLocaleString()} Servers (Fake Creds)`}
              </span>
            </button>
          </div>
        </div>

        {/* Live Full-List Progress Bar */}
        {scanProgress && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono text-[#c2c6d7] tabular-nums">
              <span>
                {isScanning ? 'Batch probing all loaded relays...' : 'Full list probe complete'}
              </span>
              <span className="text-[#00E5FF]">
                {scanProgress.completed.toLocaleString()} / {scanProgress.total.toLocaleString()} ({progressPct}%)
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#0a0e16] overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-[#2979FF] to-[#00E5FF] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Scanner Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-white/10">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.05em] text-[#8c90a0] mb-1.5">
              Async Worker Pool
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 rounded-lg obsidian-inset">
              {([8, 16, 32, 64] as const).map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => onUpdateConfig({ workers: w })}
                  className={`py-1.5 rounded text-xs font-mono font-semibold transition-colors ${
                    scanConfig.workers === w
                      ? 'bg-[#2979FF] text-[#F8FAFC]'
                      : 'text-[#c2c6d7] hover:text-[#dfe2ee]'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.05em] text-[#8c90a0] mb-1.5">
              ISAKMP Probe Timeout
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-lg obsidian-inset">
              {([1500, 2500, 5000] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onUpdateConfig({ timeoutMs: t })}
                  className={`py-1.5 rounded text-xs font-mono font-semibold transition-colors ${
                    scanConfig.timeoutMs === t
                      ? 'bg-[#2979FF] text-[#F8FAFC]'
                      : 'text-[#c2c6d7] hover:text-[#dfe2ee]'
                  }`}
                >
                  {(t / 1000).toFixed(1)}s
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.05em] text-[#8c90a0] mb-1.5">
              Target UDP Port
            </label>
            <div className="grid grid-cols-2 gap-1 p-1 rounded-lg obsidian-inset">
              {([500, 4500] as const).map((port) => (
                <button
                  key={port}
                  type="button"
                  onClick={() => onUpdateConfig({ probePort: port })}
                  className={`py-1.5 rounded text-xs font-mono font-semibold transition-colors ${
                    scanConfig.probePort === port
                      ? 'bg-[#2979FF] text-[#F8FAFC]'
                      : 'text-[#c2c6d7] hover:text-[#dfe2ee]'
                  }`}
                >
                  {port === 500 ? 'UDP 500' : 'UDP 4500 NAT-T'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.05em] text-[#8c90a0] mb-1.5">
              Random Fake Auth Probe
            </label>
            <button
              type="button"
              onClick={() =>
                onUpdateConfig({ useWrongCredentialCheck: !scanConfig.useWrongCredentialCheck })
              }
              className={`w-full min-h-[38px] px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center justify-between transition-colors ${
                scanConfig.useWrongCredentialCheck
                  ? 'border-[#00E676]/50 bg-[#00E676]/10 text-[#dfe2ee]'
                  : 'border-white/10 bg-[#0a0e16] text-[#8c90a0]'
              }`}
            >
              <span>{scanConfig.useWrongCredentialCheck ? 'Random Fake Creds' : 'SA_INIT Only'}</span>
              <span className="font-mono text-[11px] text-[#00E5FF]">
                {scanConfig.useWrongCredentialCheck ? 'Auto-Gen' : 'Off'}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Search, Filter & Server Explorer Table */}
      <section className="rounded-xl obsidian-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-[#8c90a0] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(100);
                }}
                placeholder={`Search all ${servers.length.toLocaleString()} gateways by hostname, city, country, or IPv4...`}
                className="w-full h-12 pl-10 pr-4 rounded-lg bg-[#0a0e16] border border-[#424655] text-sm text-[#dfe2ee] placeholder-[#8c90a0] focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={techFilter}
                onChange={(e) => {
                  setTechFilter(e.target.value as typeof techFilter);
                  setVisibleCount(100);
                }}
                aria-label="Filter by protocol"
                className="h-12 px-3 rounded-lg bg-[#0a0e16] border border-[#424655] text-xs text-[#dfe2ee] focus:outline-none focus:border-[#00E5FF]"
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
                className="h-12 px-3 rounded-lg bg-[#0a0e16] border border-[#424655] text-xs text-[#dfe2ee] focus:outline-none focus:border-[#00E5FF]"
              >
                <option value="score">Sort: vpnban Score</option>
                <option value="latency">Sort: Lowest Latency</option>
                <option value="load">Sort: Lowest Load</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  setCleanOnly((v) => !v);
                  setVisibleCount(100);
                }}
                className={`h-12 px-4 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap ${
                  cleanOnly
                    ? 'border-[#2979FF] bg-[#2979FF]/15 text-[#dfe2ee]'
                    : 'border-[#424655] bg-[#0a0e16] text-[#c2c6d7] hover:text-[#dfe2ee]'
                }`}
              >
                Clean IPs Only
              </button>
            </div>
          </div>

          {/* State Filter Chips */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {regions.map((region) => (
                <button
                  key={region}
                  type="button"
                  onClick={() => {
                    onUpdateConfig({ regionFilter: region });
                    setVisibleCount(100);
                  }}
                  className={`h-8 px-3 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                    scanConfig.regionFilter === region
                      ? 'border-[#2979FF] bg-[#2979FF]/15 text-[#dfe2ee]'
                      : 'border-white/10 bg-[#181c24] text-[#c2c6d7] hover:text-[#dfe2ee]'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
            <span className="font-mono text-xs text-[#8c90a0] tabular-nums">
              Showing {displayedServers.length.toLocaleString()} of {filteredServers.length.toLocaleString()} matching
            </span>
          </div>
        </div>

        {/* Data Grid */}
        <div className="divide-y divide-white/5">
          {displayedServers.length === 0 ? (
            <div className="p-10 text-center text-sm text-[#8c90a0]">
              No gateways match the active filter criteria. Reset filters or run a fresh fleet scan.
            </div>
          ) : (
            displayedServers.map((srv) => {
              const expanded = expandedId === srv.id;
              const isSelected = srv.id === selectedServerId;

              return (
                <div
                  key={srv.id}
                  className={`transition-colors ${
                    isSelected ? 'bg-[#2979FF]/10' : 'hover:bg-[#262a33]/50'
                  }`}
                >
                  <div className="px-4 sm:px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">
                    <div className="min-w-[210px] flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-semibold text-[#dfe2ee]">
                          {srv.city}, {srv.countryCode}
                        </span>
                        <span className="text-[#8c90a0]" aria-hidden="true">·</span>
                        <span className="font-mono text-xs text-[#c2c6d7]">{srv.hostname}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#8c90a0] font-mono tabular-nums">
                        <span>{srv.ip}</span>
                        <span aria-hidden="true">·</span>
                        <span>{srv.probeMethod}</span>
                        <span aria-hidden="true">·</span>
                        <span>Score {srv.score}/100</span>
                        {srv.lastFakeProbeCreds && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-[#00E5FF]">
                              fake {srv.lastFakeProbeCreds.username}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status + Metrics */}
                    <div className="flex flex-wrap items-center gap-6">
                      <div className="text-right">
                        <div className="text-[11px] uppercase tracking-[0.05em] text-[#8c90a0]">Latency</div>
                        <div className="font-mono text-sm font-semibold text-[#dfe2ee] tabular-nums">
                          {srv.latencyMs !== null ? `${srv.latencyMs} ms` : '--'}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[11px] uppercase tracking-[0.05em] text-[#8c90a0]">Load</div>
                        <div
                          className={`font-mono text-sm font-semibold tabular-nums ${
                            srv.load > 70 ? 'text-[#FFAB00]' : 'text-[#dfe2ee]'
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
                          <span className="text-[#8c90a0]">Untested</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectAndConnect(srv)}
                          className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-[#2979FF] hover:bg-[#1E66E5] text-xs font-semibold text-[#F8FAFC] inline-flex items-center gap-1.5 whitespace-nowrap"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Connect</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpandedId(expanded ? null : srv.id)}
                          aria-label="Toggle raw fake-probe diagnostics"
                          className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg border border-white/10 bg-[#0a0e16] text-[#c2c6d7] hover:text-[#dfe2ee]"
                        >
                          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {expanded && (
                    <div className="px-4 sm:px-5 pb-4 pt-1">
                      <div className="rounded-lg obsidian-inset p-4 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <span className="text-[#8c90a0]">Random Fake Probe Verdict:</span>
                            <div className="font-mono text-[#00E5FF] mt-0.5">{srv.wrongCredResponse}</div>
                          </div>
                          <div>
                            <span className="text-[#8c90a0]">Jitter &amp; Packet Loss:</span>
                            <div className="font-mono text-[#dfe2ee] mt-0.5 tabular-nums">
                              ±{srv.jitterMs ?? 2.0} ms · {srv.packetLossPct}% loss
                            </div>
                          </div>
                          <div>
                            <span className="text-[#8c90a0]">Supported Stack:</span>
                            <div className="font-mono text-[#dfe2ee] mt-0.5">
                              {srv.technologies.join(' · ')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
                          <button
                            type="button"
                            onClick={() => onTraceServer(srv)}
                            className="px-3 py-1.5 rounded-lg border border-white/10 bg-[#262a33] text-xs font-medium text-[#dfe2ee] hover:border-[#00E5FF]/50"
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

        {filteredServers.length > displayedServers.length && (
          <div className="p-4 border-t border-white/10 bg-[#0a0e16]/50 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setVisibleCount((c) => c + 150)}
              className="min-h-[40px] px-4 py-2 rounded-lg bg-[#262a33] border border-white/10 hover:border-[#00E5FF]/50 text-xs font-semibold text-[#dfe2ee]"
            >
              Show +150 More ({(filteredServers.length - displayedServers.length).toLocaleString()} remaining)
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
