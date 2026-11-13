export type AppMode = 'simple' | 'pro';

export type NavTab = 'dashboard' | 'scanner' | 'map' | 'diagnostics' | 'vault';

export type ProtocolType = 'IKEv2/IPSec' | 'NordLynx' | 'OpenVPN UDP';

export type BanStatus = 'clean' | 'throttled' | 'banned' | 'untested' | 'unreachable';

export interface VpnServer {
  id: number;
  name: string;
  hostname: string;
  ip: string;
  country: string;
  countryCode: string;
  city: string;
  region: 'Europe' | 'North America' | 'Asia-Pacific' | 'Middle East & Africa' | 'South America';
  lat: number;
  lon: number;
  load: number;
  technologies: string[];
  // Live/probed metrics
  latencyMs: number | null;
  jitterMs: number | null;
  packetLossPct: number;
  banStatus: BanStatus;
  wrongCredResponse: string;
  ikeSaInitOk: boolean | null;
  natTRequired: boolean;
  probeMethod: 'udp-500' | 'udp-4500' | 'tcp-443-fallback' | 'pending';
  lastProbedAt: string | null;
  score: number; // 0-100 composite vpnban rank
}

export interface ScanConfig {
  workers: 8 | 16 | 32 | 64;
  timeoutMs: 1500 | 2500 | 5000;
  probePort: 500 | 4500;
  useWrongCredentialCheck: boolean;
  canaryUsername: string;
  regionFilter: string;
}

export interface HandshakeStage {
  id: 'dns' | 'probe' | 'ike_sa_init' | 'ike_auth';
  label: string;
  detail: string;
  status: 'idle' | 'running' | 'passed' | 'warning' | 'failed';
  durationMs: number | null;
  packetHex?: string;
}

export interface FailureTriage {
  detected: boolean;
  code: string;
  title: string;
  explanation: string;
  recommendedActions: Array<{
    id: 'mtu_1380' | 'enable_natt' | 'switch_nordlynx' | 'reroute_clean';
    label: string;
    description: string;
  }>;
}

export interface HandshakeTrace {
  serverHostname: string;
  serverIp: string;
  startedAt: string;
  totalDurationMs: number;
  cipherSuite: string;
  dhGroup: string;
  mtuBytes: number;
  natTActive: boolean;
  wrongCredCanaryPassed: boolean;
  stages: HandshakeStage[];
  triage: FailureTriage | null;
  rawLogs: string[];
}

export interface TunnelSettings {
  protocol: ProtocolType;
  natTraversal: boolean;
  mobike: boolean;
  killSwitch: boolean;
  mtuClamping: boolean;
  mtuValue: number;
  cipherSuite: 'AES-256-GCM / SHA-384 / MODP-2048' | 'AES-256-CBC / SHA-256 / MODP-2048' | 'ChaCha20-Poly1305 / SHA-512';
}

export interface VaultCredentials {
  serviceUsername: string;
  servicePassword: string;
  canaryUsername: string;
  canaryPassword: string;
  rootCaVerified: boolean;
  rootCaFingerprint: string;
  keystoreMode: 'Android Keystore AES-256-GCM (API 23+)' | 'EncryptedSharedPreferences';
  lastUpdated: string;
}

export interface TelemetryPoint {
  timestamp: string;
  downloadMbps: number;
  uploadMbps: number;
  latencyMs: number;
  jitterMs: number;
}

export interface DiagnosticLogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'PROBE' | 'WARN' | 'ERROR' | 'AUTH';
  subsystem: string;
  message: string;
  server?: string;
}
