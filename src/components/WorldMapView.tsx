import React, { useMemo, useState } from 'react';
import { ShieldCheck, Activity, X } from 'lucide-react';
import type { VpnServer } from '../types/vpn';

interface WorldMapViewProps {
  servers: VpnServer[];
  selectedServer: VpnServer;
  isConnected: boolean;
  onSelectServer: (server: VpnServer) => void;
  onConnectServer: (server: VpnServer) => void;
  onTraceServer: (server: VpnServer) => void;
}

// Convert lat/lon to 1000x500 Equirectangular SVG coordinates
function projectCoords(lat: number, lon: number): { x: number; y: number } {
  const x = ((lon + 180) / 360) * 1000;
  const y = ((90 - lat) / 180) * 500;
  return { x, y };
}

// Simplified clean vector continent paths (1000x500 equirectangular projection)
const CONTINENT_PATHS = [
  // North America
  'M 95,72 L 175,60 L 265,68 L 312,92 L 325,120 L 290,152 L 265,172 L 245,195 L 222,222 L 195,215 L 175,185 L 145,155 L 118,125 L 82,95 Z',
  // Greenland
  'M 340,32 L 415,28 L 435,62 L 385,82 L 348,68 Z',
  // South America
  'M 255,232 L 302,228 L 345,260 L 368,302 L 342,358 L 306,412 L 282,442 L 268,405 L 258,340 L 245,280 Z',
  // Europe
  'M 455,148 L 478,108 L 518,86 L 562,76 L 585,95 L 578,136 L 555,158 L 525,162 L 495,158 L 465,165 Z',
  // UK & Ireland
  'M 466,114 L 478,110 L 482,126 L 468,128 Z',
  // Africa
  'M 458,175 L 522,172 L 568,195 L 598,236 L 590,295 L 555,365 L 525,382 L 502,338 L 492,272 L 455,235 Z',
  // Asia
  'M 580,82 L 668,66 L 785,70 L 882,88 L 912,115 L 875,152 L 828,178 L 795,212 L 752,228 L 705,218 L 655,205 L 605,185 L 582,148 Z',
  // Japan
  'M 862,135 L 882,124 L 892,146 L 870,158 Z',
  // Indonesia / Maritime SE Asia
  'M 755,248 L 812,248 L 825,266 L 765,266 Z',
  // Australia
  'M 792,315 L 868,308 L 908,342 L 895,388 L 842,395 L 795,366 Z',
];

export const WorldMapView: React.FC<WorldMapViewProps> = ({
  servers,
  selectedServer,
  isConnected,
  onSelectServer,
  onConnectServer,
  onTraceServer,
}) => {
  const [activeRegion, setActiveRegion] = useState<string>('All');
  const [drawerOpen, setDrawerOpen] = useState(true);

  // Client approximate anchor (New York / Atlantic)
  const originPoint = projectCoords(40.71, -74.0);
  const selectedPoint = projectCoords(selectedServer.lat, selectedServer.lon);

  const visibleServers = useMemo(() => {
    if (activeRegion === 'All') return servers;
    return servers.filter((s) => s.region === activeRegion);
  }, [servers, activeRegion]);

  const regionalClusters = useMemo(() => {
    const groups: Record<string, { count: number; avgPing: number; clean: number }> = {};
    for (const s of servers) {
      if (!groups[s.region]) groups[s.region] = { count: 0, avgPing: 0, clean: 0 };
      groups[s.region].count += 1;
      groups[s.region].avgPing += s.latencyMs ?? 45;
      if (s.banStatus === 'clean') groups[s.region].clean += 1;
    }
    return Object.entries(groups).map(([region, stat]) => ({
      region,
      count: stat.count,
      avgPing: Math.round(stat.avgPing / stat.count),
      clean: stat.clean,
    }));
  }, [servers]);

  const controlPointY = Math.min(originPoint.y, selectedPoint.y) - 65;
  const arcPath = `M ${originPoint.x} ${originPoint.y} Q ${(originPoint.x + selectedPoint.x) / 2} ${controlPointY} ${selectedPoint.x} ${selectedPoint.y}`;

  return (
    <div className="space-y-6">
      {/* Regional Cluster Filter Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-bold text-[#F8FAFC]">
            Global Relay Cartography
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Select any cluster pin to inspect vpnban status, latency, and trigger a direct IKEv2 tunnel
          </p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['All', ...regionalClusters.map((c) => c.region)].map((region) => (
            <button
              key={region}
              type="button"
              onClick={() => setActiveRegion(region)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeRegion === region
                  ? 'bg-[#2979FF] text-[#F8FAFC]'
                  : 'bg-[#0F172A] border border-white/10 text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Vector Mercator Map Canvas */}
        <div className="lg:col-span-8 rounded-2xl border border-white/10 bg-[#0D1321] p-4 sm:p-5 relative overflow-hidden">
          <svg
            viewBox="0 0 1000 500"
            className="w-full h-auto select-none"
            role="img"
            aria-label="Interactive global VPN relay map"
          >
            {/* Graticule grid */}
            {[100, 200, 300, 400].map((y) => (
              <line key={`lat-${y}`} x1="0" y1={y} x2="1000" y2={y} stroke="rgba(255,255,255,0.04)" />
            ))}
            {[166, 333, 500, 666, 833].map((x) => (
              <line key={`lon-${x}`} x1={x} y1="0" x2={x} y2="500" stroke="rgba(255,255,255,0.04)" />
            ))}

            {/* Continent Vector Polygons */}
            {CONTINENT_PATHS.map((d, idx) => (
              <path
                key={idx}
                d={d}
                fill="#182235"
                stroke="#2D3E5E"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            ))}

            {/* Active Tunnel Tracer Arc */}
            <path
              d={arcPath}
              fill="none"
              stroke={isConnected ? '#00E676' : '#00E5FF'}
              strokeWidth="2"
              strokeDasharray="6 4"
              opacity="0.85"
            />

            {/* Client Origin Pin */}
            <circle cx={originPoint.x} cy={originPoint.y} r="4.5" fill="#F8FAFC" />

            {/* Server Nodes */}
            {visibleServers.map((srv) => {
              const { x, y } = projectCoords(srv.lat, srv.lon);
              const isSelected = srv.id === selectedServer.id;
              const pinColor =
                srv.banStatus === 'banned' || srv.banStatus === 'unreachable'
                  ? '#FF1744'
                  : srv.banStatus === 'throttled'
                    ? '#FFAB00'
                    : isSelected
                      ? '#00E5FF'
                      : '#00E676';

              return (
                <g
                  key={srv.id}
                  className="cursor-pointer"
                  onClick={() => {
                    onSelectServer(srv);
                    setDrawerOpen(true);
                  }}
                >
                  {isSelected && (
                    <circle
                      cx={x}
                      cy={y}
                      r="14"
                      fill="none"
                      stroke="#00E5FF"
                      strokeWidth="1.5"
                      opacity="0.7"
                    />
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 6.5 : 4.5}
                    fill={pinColor}
                    stroke="#080C14"
                    strokeWidth="1.5"
                  />
                  {isSelected && (
                    <text
                      x={x + 10}
                      y={y + 4}
                      fill="#F8FAFC"
                      fontSize="11"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {srv.city} ({srv.latencyMs ?? 24}ms)
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Map Legend */}
          <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-[#94A3B8]">
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00E676]" />
                Clean IKEv2
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFAB00]" />
                Throttled / High Load
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF1744]" />
                Banned / DPI Reset
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF]" />
                Selected Relay
              </span>
            </div>
            <span className="font-mono tabular-nums">
              {visibleServers.length} plotted gateways
            </span>
          </div>
        </div>

        {/* Contextual Cluster & Relay Drawer */}
        <div className="lg:col-span-4 space-y-4">
          {drawerOpen && (
            <div className="rounded-2xl border border-white/10 bg-[#0F172A] p-5 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs text-[#00E5FF] font-medium">{selectedServer.region}</div>
                  <h2 className="font-display text-lg font-bold text-[#F8FAFC] mt-0.5">
                    {selectedServer.city}, {selectedServer.country}
                  </h2>
                  <div className="font-mono text-xs text-[#94A3B8] mt-0.5">
                    {selectedServer.hostname} · {selectedServer.ip}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close relay details"
                  className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <dl className="grid grid-cols-2 gap-3 rounded-xl border border-white/5 bg-[#0D1321] p-3.5 text-xs">
                <div>
                  <dt className="text-[#64748B]">RTT Ping</dt>
                  <dd className="font-mono text-sm font-semibold text-[#00E676] tabular-nums mt-0.5">
                    {selectedServer.latencyMs ?? 24} ms
                  </dd>
                </div>
                <div>
                  <dt className="text-[#64748B]">Server Load</dt>
                  <dd className="font-mono text-sm font-semibold text-[#F8FAFC] tabular-nums mt-0.5">
                    {selectedServer.load}%
                  </dd>
                </div>
                <div>
                  <dt className="text-[#64748B]">vpnban Score</dt>
                  <dd className="font-mono text-sm font-semibold text-[#00E5FF] tabular-nums mt-0.5">
                    {selectedServer.score}/100
                  </dd>
                </div>
                <div>
                  <dt className="text-[#64748B]">Canary Status</dt>
                  <dd className="font-medium text-[#F8FAFC] mt-0.5 capitalize">
                    {selectedServer.banStatus}
                  </dd>
                </div>
              </dl>

              <div className="text-xs text-[#94A3B8] font-mono bg-[#080C14] border border-white/5 rounded-lg p-3">
                {selectedServer.wrongCredResponse}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => onConnectServer(selectedServer)}
                  className="min-h-[44px] px-3 py-2 rounded-lg bg-[#2979FF] hover:bg-[#1E66E5] text-xs font-semibold text-[#F8FAFC] inline-flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Connect Relay</span>
                </button>
                <button
                  type="button"
                  onClick={() => onTraceServer(selectedServer)}
                  className="min-h-[44px] px-3 py-2 rounded-lg bg-[#1E293B] border border-white/10 hover:border-[#00E5FF]/50 text-xs font-medium text-[#F8FAFC] inline-flex items-center justify-center gap-1.5"
                >
                  <Activity className="w-4 h-4 text-[#00E5FF]" />
                  <span>Trace Path</span>
                </button>
              </div>
            </div>
          )}

          {/* Regional Cluster Density Cards */}
          <div className="rounded-2xl border border-white/10 bg-[#0F172A] p-5 space-y-3">
            <h3 className="font-display text-sm font-semibold text-[#F8FAFC]">
              Regional Cluster Health
            </h3>
            <div className="divide-y divide-white/5">
              {regionalClusters.map((c) => (
                <button
                  key={c.region}
                  type="button"
                  onClick={() => setActiveRegion(c.region)}
                  className="w-full py-2.5 flex items-center justify-between text-left hover:bg-[#1E293B]/30 px-2 rounded transition-colors"
                >
                  <div>
                    <div className="text-xs font-medium text-[#F8FAFC]">{c.region}</div>
                    <div className="text-[11px] text-[#64748B] tabular-nums">
                      {c.clean}/{c.count} clean nodes
                    </div>
                  </div>
                  <span className="font-mono text-xs text-[#00E5FF] tabular-nums">
                    ~{c.avgPing} ms
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
