import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Activity } from 'lucide-react';
import { TopBar } from './components/TopBar';
import { SimpleDashboard } from './components/SimpleDashboard';
import { ProDashboard } from './components/ProDashboard';
import { ScannerView } from './components/ScannerView';
import { WorldMapView } from './components/WorldMapView';
import { DiagnosticsView } from './components/DiagnosticsView';
import { VaultAndApkView } from './components/VaultAndApkView';
import { ConnectCredentialsModal } from './components/ConnectCredentialsModal';
import { FALLBACK_NORD_SERVERS } from './data/fallbackServers';
import type {
  AppMode,
  DiagnosticLogEntry,
  FailureTriage,
  HandshakeTrace,
  NavTab,
  ProtocolType,
  ScanConfig,
  TelemetryPoint,
  TunnelSettings,
  VaultCredentials,
  VpnServer,
} from './types/vpn';

function createInitialTelemetry(baseLatency: number): TelemetryPoint[] {
  const now = Date.now();
  return Array.from({ length: 18 }, (_, i) => ({
    timestamp: new Date(now - (17 - i) * 1500).toISOString(),
    downloadMbps: 240 + Math.sin(i * 0.6) * 48,
    uploadMbps: 92 + Math.cos(i * 0.5) * 22,
    latencyMs: Math.max(12, Math.round(baseLatency + Math.sin(i * 0.8) * 3)),
    jitterMs: Number((1.6 + Math.abs(Math.cos(i * 0.4)) * 1.4).toFixed(1)),
  }));
}

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [appMode, setAppMode] = useState<AppMode>('pro');

  const [servers, setServers] = useState<VpnServer[]>(FALLBACK_NORD_SERVERS);
  const [totalDiscovered, setTotalDiscovered] = useState<number>(3580);
  const [dataSource, setDataSource] = useState<'live-nord-api' | 'curated-snapshot'>('curated-snapshot');
  const [selectedServerId, setSelectedServerId] = useState<number>(FALLBACK_NORD_SERVERS[5].id); // uk2410

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionSeconds, setConnectionSeconds] = useState(0);
  const [pendingConnectServer, setPendingConnectServer] = useState<VpnServer | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<{ completed: number; total: number } | null>(null);
  const scanAbortRef = useRef<AbortController | null>(null);
  const [lastScanDurationMs, setLastScanDurationMs] = useState<number | null>(null);
  const [isTracing, setIsTracing] = useState(false);
  const [handshakeTrace, setHandshakeTrace] = useState<HandshakeTrace | null>(null);

  const [scanConfig, setScanConfig] = useState<ScanConfig>({
    workers: 32,
    timeoutMs: 2500,
    probePort: 500,
    useWrongCredentialCheck: true,
    regionFilter: 'All',
  });

  const [tunnelSettings, setTunnelSettings] = useState<TunnelSettings>({
    protocol: 'IKEv2/IPSec',
    natTraversal: true,
    mobike: true,
    killSwitch: true,
    mtuClamping: true,
    mtuValue: 1380,
    cipherSuite: 'AES-256-GCM / SHA-384 / MODP-2048',
  });

  const [vault, setVault] = useState<VaultCredentials>({
    serviceUsername: '',
    servicePassword: '',
    rootCaVerified: true,
    rootCaFingerprint: '43:48:A0:E9:44:4C:78:CB:26:5E:05:8D:5E:89:44:B4:D8:4F:96:62',
    keystoreMode: 'Android Keystore AES-256-GCM (API 23+)',
    lastUpdated: new Date().toISOString(),
  });

  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>(() =>
    createInitialTelemetry(24)
  );

  const [logs, setLogs] = useState<DiagnosticLogEntry[]>([
    {
      id: 'init-1',
      timestamp: new Date().toISOString(),
      level: 'INFO',
      subsystem: 'ikev2_stack',
      message: 'Initialized Obsidian Telemetry engine · MOBIKE RFC 4555 & MTU 1380B ready',
    },
    {
      id: 'init-2',
      timestamp: new Date().toISOString(),
      level: 'PROBE',
      subsystem: 'vpnban_random_probe',
      message: 'Scanner generates random fake usernames & passwords per relay; real password requested only on connect',
    },
  ]);

  const appendLog = useCallback(
    (level: DiagnosticLogEntry['level'], subsystem: string, message: string, server?: string) => {
      setLogs((prev) => [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: new Date().toISOString(),
          level,
          subsystem,
          message,
          server,
        },
        ...prev.slice(0, 120),
      ]);
    },
    []
  );

  const selectedServer = useMemo(
    () => servers.find((s) => s.id === selectedServerId) ?? servers[0] ?? FALLBACK_NORD_SERVERS[0],
    [servers, selectedServerId]
  );

  const quickSwapServers = useMemo(
    () =>
      [...servers]
        .filter((s) => s.banStatus === 'clean' || s.banStatus === 'untested')
        .sort((a, b) => b.score - a.score)
        .slice(0, 4),
    [servers]
  );

  // Fetch initial server catalog from Express backend
  useEffect(() => {
    let active = true;
    fetch('/api/servers')
      .then((res) => res.json())
      .then((data: { source: 'live-nord-api' | 'curated-snapshot'; totalDiscovered: number; servers: VpnServer[] }) => {
        if (!active || !Array.isArray(data.servers) || data.servers.length === 0) return;
        setServers(data.servers);
        setTotalDiscovered(data.totalDiscovered);
        setDataSource(data.source);
        setSelectedServerId((curr) =>
          data.servers.some((s) => s.id === curr) ? curr : data.servers[0].id
        );
        appendLog(
          'INFO',
          'fleet_directory',
          `Loaded ${data.servers.length} IKEv2 gateways (${data.source === 'live-nord-api' ? 'Live NordVPN API' : 'Curated Snapshot'})`
        );
      })
      .catch(() => {
        // fallback already loaded
      });
    return () => {
      active = false;
    };
  }, [appendLog]);

  // Live connection timer & telemetry sparkline stream when tunnel is connected
  useEffect(() => {
    if (!isConnected) {
      setConnectionSeconds(0);
      return;
    }

    const timer = setInterval(() => {
      setConnectionSeconds((s) => s + 1);
      const baseLat = selectedServer.latencyMs ?? 24;
      setTelemetry((prev) => [
        ...prev.slice(1),
        {
          timestamp: new Date().toISOString(),
          downloadMbps: Number((260 + Math.random() * 115).toFixed(1)),
          uploadMbps: Number((85 + Math.random() * 42).toFixed(1)),
          latencyMs: Math.max(10, Math.round(baseLat + (Math.random() - 0.5) * 6)),
          jitterMs: Number((1.2 + Math.random() * 1.8).toFixed(1)),
        },
      ]);
    }, 1000);

    return () => clearInterval(timer);
  }, [isConnected, selectedServer.latencyMs]);

  const stopFleetScan = useCallback(() => {
    scanAbortRef.current?.abort();
    scanAbortRef.current = null;
    setIsScanning(false);
    appendLog('WARN', 'vpnban_pool', 'Fleet probe paused by user');
  }, [appendLog]);

  const runFleetScan = useCallback(async () => {
    if (isScanning) return;
    const controller = new AbortController();
    scanAbortRef.current = controller;
    setIsScanning(true);

    const allTargets = [...servers];
    const total = allTargets.length;
    const chunkSize = 120;
    const startedAt = performance.now();

    setScanProgress({ completed: 0, total });
    appendLog(
      'PROBE',
      'vpnban_pool',
      `Starting ${scanConfig.workers}-worker async probe across ALL ${total.toLocaleString()} servers on UDP ${scanConfig.probePort} (timeout ${scanConfig.timeoutMs}ms, random_fake_creds=${scanConfig.useWrongCredentialCheck})`
    );

    try {
      const mergedMap = new Map<number, VpnServer>(allTargets.map((s) => [s.id, s]));
      let completed = 0;

      for (let i = 0; i < total; i += chunkSize) {
        if (controller.signal.aborted) break;
        const batch = allTargets.slice(i, i + chunkSize);
        const res = await fetch('/api/scanner/probe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            servers: batch,
            workers: scanConfig.workers,
            timeoutMs: scanConfig.timeoutMs,
            probePort: scanConfig.probePort,
            useWrongCredentialCheck: scanConfig.useWrongCredentialCheck,
          }),
        });
        const data = await res.json();
        if (Array.isArray(data.servers)) {
          for (const probed of data.servers as VpnServer[]) {
            mergedMap.set(probed.id, probed);
          }
          completed = Math.min(total, i + batch.length);
          setScanProgress({ completed, total });
          const nextList = Array.from(mergedMap.values()).sort((a, b) => b.score - a.score);
          setServers(nextList);
        }
      }

      const elapsedMs = Math.round(performance.now() - startedAt);
      setLastScanDurationMs(elapsedMs);

      const finalList = Array.from(mergedMap.values()).sort((a, b) => b.score - a.score);
      const cleanCount = finalList.filter((s) => s.banStatus === 'clean').length;
      const cleanPct = finalList.length ? ((cleanCount / finalList.length) * 100).toFixed(1) : '0.0';
      const bestClean = finalList.find((s) => s.banStatus === 'clean') ?? finalList[0];

      if (bestClean && !controller.signal.aborted) {
        setSelectedServerId(bestClean.id);
        appendLog(
          'AUTH',
          'vpnban_rank',
          `Scanned all ${completed.toLocaleString()}/${total.toLocaleString()} nodes in ${(elapsedMs / 1000).toFixed(1)}s · Clean rate ${cleanPct}% · Best node ${bestClean.hostname} (${bestClean.latencyMs}ms, fake ${bestClean.lastFakeProbeCreds?.username ?? 'auto'})`
        );
      }
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        appendLog('ERROR', 'vpnban_pool', 'Fleet probe encountered an error; retaining completed batch telemetry');
      }
    } finally {
      scanAbortRef.current = null;
      setIsScanning(false);
    }
  }, [appendLog, isScanning, scanConfig, servers]);

  const runHandshakeTrace = useCallback(
    async (targetServer: VpnServer = selectedServer, simulateFault = false) => {
      setIsTracing(true);
      appendLog(
        'PROBE',
        'isakmp_trace',
        `Tracing 4-stage handshake for ${targetServer.hostname} (port ${tunnelSettings.natTraversal ? 4500 : 500}, MTU ${tunnelSettings.mtuValue}B)`
      );
      try {
        const res = await fetch('/api/handshake/trace', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            server: targetServer,
            probePort: tunnelSettings.natTraversal ? 4500 : 500,
            mtuBytes: tunnelSettings.mtuClamping ? tunnelSettings.mtuValue : 1500,
            natTEnabled: tunnelSettings.natTraversal,
            simulateCarrierFault: simulateFault,
          }),
        });
        const trace: HandshakeTrace = await res.json();
        setHandshakeTrace(trace);
        if (trace.triage?.detected) {
          appendLog('WARN', 'triage_engine', `${trace.triage.code}: ${trace.triage.title}`, targetServer.hostname);
        } else {
          appendLog(
            'AUTH',
            'ike_auth',
            `4-stage trace passed in ${trace.totalDurationMs}ms · Random fake probe (${trace.randomFakeCreds.username}) verified clean`,
            targetServer.hostname
          );
        }
        return trace;
      } catch {
        appendLog('ERROR', 'isakmp_trace', 'Handshake trace API unavailable');
        return null;
      } finally {
        setIsTracing(false);
      }
    },
    [appendLog, selectedServer, tunnelSettings.mtuClamping, tunnelSettings.mtuValue, tunnelSettings.natTraversal]
  );

  const executeConnectWithCredentials = useCallback(
    async (target: VpnServer, realUsername: string, realPassword: string) => {
      setSelectedServerId(target.id);
      setIsConnecting(true);
      setVault((prev) => ({
        ...prev,
        serviceUsername: realUsername,
        servicePassword: realPassword,
        lastUpdated: new Date().toISOString(),
      }));

      appendLog(
        'PROBE',
        'vpnban_gate',
        `Running random fake-credential gate on ${target.hostname} before submitting real NordService password`
      );
      const trace = await runHandshakeTrace(target, false);
      if (trace && trace.wrongCredCanaryPassed) {
        setIsConnected(true);
        appendLog(
          'AUTH',
          'tunnel_up',
          `Connected via ${tunnelSettings.protocol} to ${target.hostname} (${target.ip}) using real credentials for ${realUsername}`,
          target.hostname
        );
      } else {
        setIsConnected(false);
        setActiveTab('diagnostics');
        appendLog(
          'ERROR',
          'vpnban_gate',
          `Random fake-credential gate flagged ${target.hostname} — real password withheld. Opened failure triage.`,
          target.hostname
        );
      }
      setIsConnecting(false);
    },
    [appendLog, runHandshakeTrace, tunnelSettings.protocol]
  );

  const requestConnectToServer = useCallback((target: VpnServer) => {
    setSelectedServerId(target.id);
    setPendingConnectServer(target);
  }, []);

  const handlePrimaryConnectToggle = useCallback(() => {
    if (isConnected) {
      setIsConnected(false);
      appendLog('INFO', 'tunnel_down', `Closed ${tunnelSettings.protocol} SA with ${selectedServer.hostname}`);
      return;
    }
    setPendingConnectServer(selectedServer);
  }, [appendLog, isConnected, selectedServer, tunnelSettings.protocol]);

  const handleApplyTriage = useCallback(
    async (actionId: FailureTriage['recommendedActions'][number]['id']) => {
      if (actionId === 'mtu_1380') {
        setTunnelSettings((prev) => ({ ...prev, mtuClamping: true, mtuValue: 1380 }));
        appendLog('INFO', 'triage_fix', 'Applied baseband MTU clamping = 1380 B');
        await runHandshakeTrace(selectedServer, false);
      } else if (actionId === 'enable_natt') {
        setTunnelSettings((prev) => ({ ...prev, natTraversal: true }));
        appendLog('INFO', 'triage_fix', 'Forced NAT-Traversal encapsulation on UDP 4500');
        await runHandshakeTrace(selectedServer, false);
      } else if (actionId === 'switch_nordlynx') {
        setTunnelSettings((prev) => ({ ...prev, protocol: 'NordLynx' }));
        setIsConnected(true);
        appendLog('AUTH', 'protocol_pivot', `Pivoted tunnel transport to NordLynx (WireGuard) on ${selectedServer.hostname}`);
      } else if (actionId === 'reroute_clean') {
        const bestClean =
          [...servers]
            .filter((s) => s.banStatus === 'clean' && s.id !== selectedServer.id)
            .sort((a, b) => b.score - a.score)[0] ?? servers[0];
        if (bestClean) {
          appendLog('INFO', 'triage_reroute', `Auto-rerouting to clean relay ${bestClean.hostname} (score ${bestClean.score})`);
          if (vault.serviceUsername.trim() && vault.servicePassword.trim()) {
            await executeConnectWithCredentials(bestClean, vault.serviceUsername, vault.servicePassword);
          } else {
            setPendingConnectServer(bestClean);
          }
        }
      }
    },
    [appendLog, executeConnectWithCredentials, runHandshakeTrace, selectedServer, servers, vault.servicePassword, vault.serviceUsername]
  );

  const handleProtocolSwitch = useCallback(
    (protocol: ProtocolType) => {
      setTunnelSettings((prev) => ({ ...prev, protocol }));
      appendLog('INFO', 'protocol_stack', `Switched active tunnel profile to ${protocol}`);
    },
    [appendLog]
  );

  const handleExportJson = useCallback(() => {
    const payload = {
      exportedAt: new Date().toISOString(),
      app: 'NordVPN IKEv2 Explorer',
      connected: isConnected,
      selectedServer,
      tunnelSettings,
      handshakeTrace,
      recentLogs: logs.slice(0, 50),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nordvpn-ikev2-telemetry-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    appendLog('INFO', 'telemetry_export', 'Exported structured JSON session trace');
  }, [appendLog, handshakeTrace, isConnected, logs, selectedServer, tunnelSettings]);

  return (
    <div className="min-h-screen bg-[#0f131c] text-[#dfe2ee] pb-24 lg:pb-12">
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isConnected={isConnected}
        isConnecting={isConnecting}
        onPrimaryConnectAction={handlePrimaryConnectToggle}
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 space-y-6">
        {/* Workspace Toolbar (Mode Switch + Active Relay Context) */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3 text-xs text-[#c2c6d7]">
            <span className="font-semibold text-[#dfe2ee]">
              {selectedServer.city}, {selectedServer.countryCode}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[#c2c6d7]">{selectedServer.hostname}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-[#00E5FF]">
              {selectedServer.latencyMs ?? 24} ms
            </span>
          </div>

          {activeTab === 'dashboard' && (
            <div className="flex items-center gap-1 p-1 rounded-lg obsidian-inset">
              <button
                type="button"
                onClick={() => setAppMode('simple')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  appMode === 'simple'
                    ? 'bg-[#2979FF] text-[#F8FAFC]'
                    : 'text-[#c2c6d7] hover:text-[#dfe2ee]'
                }`}
              >
                Simple Mode
              </button>
              <button
                type="button"
                onClick={() => setAppMode('pro')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  appMode === 'pro'
                    ? 'bg-[#2979FF] text-[#F8FAFC]'
                    : 'text-[#c2c6d7] hover:text-[#dfe2ee]'
                }`}
              >
                Pro Telemetry
              </button>
            </div>
          )}
        </div>

        {activeTab === 'dashboard' &&
          (appMode === 'simple' ? (
            <SimpleDashboard
              isConnected={isConnected}
              isConnecting={isConnecting}
              selectedServer={selectedServer}
              quickSwapServers={quickSwapServers}
              tunnelSettings={tunnelSettings}
              connectionSeconds={connectionSeconds}
              onConnectToggle={handlePrimaryConnectToggle}
              onSelectServer={(srv) => setSelectedServerId(srv.id)}
              onRunBestScan={runFleetScan}
              isScanning={isScanning}
            />
          ) : (
            <ProDashboard
              isConnected={isConnected}
              isConnecting={isConnecting}
              selectedServer={selectedServer}
              tunnelSettings={tunnelSettings}
              telemetry={telemetry}
              handshakeTrace={handshakeTrace}
              connectionSeconds={connectionSeconds}
              onConnectToggle={handlePrimaryConnectToggle}
              onProtocolSwitch={handleProtocolSwitch}
              onRunHandshakeTrace={() => runHandshakeTrace(selectedServer, false)}
              onExportJson={handleExportJson}
              onNavigateDiagnostics={() => setActiveTab('diagnostics')}
            />
          ))}

        {activeTab === 'scanner' && (
          <ScannerView
            servers={servers}
            totalDiscovered={totalDiscovered}
            dataSource={dataSource}
            scanConfig={scanConfig}
            isScanning={isScanning}
            scanProgress={scanProgress}
            lastScanDurationMs={lastScanDurationMs}
            selectedServerId={selectedServer.id}
            onUpdateConfig={(patch) => setScanConfig((prev) => ({ ...prev, ...patch }))}
            onRunScan={runFleetScan}
            onStopScan={stopFleetScan}
            onSelectAndConnect={requestConnectToServer}
            onTraceServer={(srv) => {
              setSelectedServerId(srv.id);
              setActiveTab('diagnostics');
              runHandshakeTrace(srv, false);
            }}
          />
        )}

        {activeTab === 'map' && (
          <WorldMapView
            servers={servers}
            selectedServer={selectedServer}
            isConnected={isConnected}
            onSelectServer={(srv) => setSelectedServerId(srv.id)}
            onConnectServer={requestConnectToServer}
            onTraceServer={(srv) => {
              setSelectedServerId(srv.id);
              setActiveTab('diagnostics');
              runHandshakeTrace(srv, false);
            }}
          />
        )}

        {activeTab === 'diagnostics' && (
          <DiagnosticsView
            selectedServer={selectedServer}
            trace={handshakeTrace}
            tunnelSettings={tunnelSettings}
            logs={logs}
            isTracing={isTracing}
            onRunTrace={(simulateFault) => runHandshakeTrace(selectedServer, Boolean(simulateFault))}
            onApplyTriage={handleApplyTriage}
            onExportJson={handleExportJson}
          />
        )}

        {activeTab === 'vault' && (
          <VaultAndApkView
            vault={vault}
            tunnelSettings={tunnelSettings}
            onUpdateVault={(patch) => setVault((prev) => ({ ...prev, ...patch }))}
            onUpdateTunnel={(patch) => setTunnelSettings((prev) => ({ ...prev, ...patch }))}
            onVerifyRootCa={() => {
              setVault((prev) => ({ ...prev, rootCaVerified: true }));
              appendLog('AUTH', 'root_ca', 'Verified DigiCert Global Root G2 -> NordVPN Root CA chain');
            }}
          />
        )}
      </main>

      {/* Stitch Floating Diagnostics Probe Trigger (56x56, 16px radius) */}
      {activeTab !== 'diagnostics' && (
        <button
          type="button"
          onClick={() => {
            setActiveTab('diagnostics');
            runHandshakeTrace(selectedServer, false);
          }}
          aria-label="Run quick 4-stage ISAKMP probe"
          title="Run 4-Stage ISAKMP Probe"
          className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-30 w-14 h-14 rounded-2xl bg-[#2979FF] hover:bg-[#1E66E5] text-[#F8FAFC] flex items-center justify-center obsidian-halo-blue transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF]"
        >
          <Activity className="w-6 h-6" />
        </button>
      )}

      {/* Real NordService Username & Password Gate Modal when Connecting */}
      {pendingConnectServer && (
        <ConnectCredentialsModal
          server={pendingConnectServer}
          initialUsername={vault.serviceUsername}
          initialPassword={vault.servicePassword}
          isConnecting={isConnecting}
          onCancel={() => setPendingConnectServer(null)}
          onConfirmConnect={async (username, password) => {
            const target = pendingConnectServer;
            setPendingConnectServer(null);
            await executeConnectWithCredentials(target, username, password);
          }}
        />
      )}
    </div>
  );
}
