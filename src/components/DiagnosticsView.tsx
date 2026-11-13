import React from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Download,
  RefreshCw,
  Wrench,
  XCircle,
} from 'lucide-react';
import type {
  DiagnosticLogEntry,
  FailureTriage,
  HandshakeTrace,
  TunnelSettings,
  VpnServer,
} from '../types/vpn';

interface DiagnosticsViewProps {
  selectedServer: VpnServer;
  trace: HandshakeTrace | null;
  tunnelSettings: TunnelSettings;
  logs: DiagnosticLogEntry[];
  isTracing: boolean;
  onRunTrace: (simulateFault?: boolean) => void;
  onApplyTriage: (
    actionId: FailureTriage['recommendedActions'][number]['id']
  ) => void;
  onExportJson: () => void;
}

export const DiagnosticsView: React.FC<DiagnosticsViewProps> = ({
  selectedServer,
  trace,
  tunnelSettings,
  logs,
  isTracing,
  onRunTrace,
  onApplyTriage,
  onExportJson,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <section className="rounded-xl border border-white/10 bg-[#0F172A] p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-bold text-[#F8FAFC]">
            ISAKMP Handshake Trace & Failure Triage
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Target gateway <span className="font-mono text-[#F8FAFC]">{selectedServer.hostname}</span> ({selectedServer.ip}) · MTU {tunnelSettings.mtuClamping ? `${tunnelSettings.mtuValue} B` : '1500 B'} · {tunnelSettings.natTraversal ? 'NAT-T UDP 4500' : 'UDP 500'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onRunTrace(false)}
            disabled={isTracing}
            className="min-h-[42px] px-4 py-2 rounded-lg bg-[#2979FF] hover:bg-[#1E66E5] text-xs font-semibold text-[#F8FAFC] inline-flex items-center gap-2 whitespace-nowrap disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isTracing ? 'animate-spin' : ''}`} />
            <span>{isTracing ? 'Tracing Handshake...' : 'Run 4-Stage Trace'}</span>
          </button>

          <button
            type="button"
            onClick={() => onRunTrace(true)}
            disabled={isTracing}
            className="min-h-[42px] px-4 py-2 rounded-lg bg-[#1E293B] border border-[#FFAB00]/40 hover:border-[#FFAB00] text-xs font-medium text-[#FFAB00] inline-flex items-center gap-2 whitespace-nowrap disabled:opacity-60"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Test Carrier NAT Fault</span>
          </button>

          <button
            type="button"
            onClick={onExportJson}
            className="min-h-[42px] px-4 py-2 rounded-lg bg-[#1E293B] border border-white/10 hover:border-[#00E5FF]/50 text-xs font-medium text-[#F8FAFC] inline-flex items-center gap-2 whitespace-nowrap"
          >
            <Download className="w-4 h-4 text-[#00E5FF]" />
            <span>Export JSON</span>
          </button>
        </div>
      </section>

      {/* Automated Failure Diagnostics & 1-Tap Recovery Triage */}
      {trace?.triage?.detected && (
        <section className="rounded-xl border border-[#FF1744]/40 bg-[#FF1744]/5 p-5 sm:p-6 space-y-4">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-[#FF1744] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-mono text-xs text-[#FF1744] font-semibold">
                {trace.triage.code}
              </div>
              <h2 className="font-display text-base sm:text-lg font-bold text-[#F8FAFC]">
                {trace.triage.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#C2C6D7] leading-relaxed">
                {trace.triage.explanation}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {trace.triage.recommendedActions.map((act) => (
              <button
                key={act.id}
                type="button"
                onClick={() => onApplyTriage(act.id)}
                className="text-left rounded-lg border border-white/10 bg-[#0F172A] hover:border-[#00E5FF]/60 p-3.5 transition-colors space-y-1.5"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#00E5FF]">
                  <Wrench className="w-3.5 h-3.5 shrink-0" />
                  <span>{act.label}</span>
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-snug">
                  {act.description}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 4-Stage Handshake Trace Stepper */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-xl border border-white/10 bg-[#0F172A] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-[#F8FAFC]">
              4-Stage ISAKMP & Canary Pipeline
            </h2>
            {trace && (
              <span className="font-mono text-xs text-[#00E5FF] tabular-nums">
                Total {trace.totalDurationMs} ms · {trace.cipherSuite}
              </span>
            )}
          </div>

          {!trace ? (
            <div className="rounded-lg border border-white/5 bg-[#0D1321] p-8 text-center text-sm text-[#94A3B8]">
              Select &ldquo;Run 4-Stage Trace&rdquo; to execute DNS lookup, UDP 500/4500 probing, IKE_SA_INIT negotiation, and wrong-credential canary validation.
            </div>
          ) : (
            <div className="space-y-3">
              {trace.stages.map((stage, idx) => (
                <div
                  key={stage.id}
                  className="rounded-lg border border-white/10 bg-[#0D1321] p-4 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {stage.status === 'passed' && (
                        <CheckCircle2 className="w-4 h-4 text-[#00E676] shrink-0" />
                      )}
                      {stage.status === 'warning' && (
                        <AlertTriangle className="w-4 h-4 text-[#FFAB00] shrink-0" />
                      )}
                      {stage.status === 'failed' && (
                        <XCircle className="w-4 h-4 text-[#FF1744] shrink-0" />
                      )}
                      <span className="font-display text-sm font-semibold text-[#F8FAFC]">
                        Stage {idx + 1}: {stage.label}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-[#00E5FF] tabular-nums">
                      {stage.durationMs ?? '--'} ms
                    </span>
                  </div>

                  <p className="text-xs text-[#94A3B8]">{stage.detail}</p>

                  {stage.packetHex && (
                    <div className="rounded bg-[#080C14] border border-white/5 px-3 py-2 font-mono text-[11px] text-[#BDF4FF] overflow-x-auto whitespace-nowrap">
                      {stage.packetHex}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Structured Diagnostic Event Log */}
        <div className="lg:col-span-5 rounded-xl border border-white/10 bg-[#0F172A] p-5 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00E5FF]" />
              <h2 className="font-display text-base font-semibold text-[#F8FAFC]">
                Session Diagnostic Logs
              </h2>
            </div>
            <span className="font-mono text-xs text-[#64748B] tabular-nums">
              {logs.length} events
            </span>
          </div>

          <div className="flex-1 rounded-lg border border-white/10 bg-[#080C14] p-3.5 font-mono text-[11px] space-y-2 max-h-[460px] overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-[#64748B] py-6 text-center">
                No session trace events recorded yet.
              </div>
            ) : (
              logs.map((entry) => {
                const lvlColor =
                  entry.level === 'ERROR'
                    ? 'text-[#FF1744]'
                    : entry.level === 'WARN'
                      ? 'text-[#FFAB00]'
                      : entry.level === 'AUTH'
                        ? 'text-[#00E676]'
                        : 'text-[#00E5FF]';
                return (
                  <div key={entry.id} className="leading-relaxed border-b border-white/5 pb-1.5">
                    <span className="text-[#64748B] tabular-nums">
                      {entry.timestamp.slice(11, 19)}
                    </span>{' '}
                    <span className={`font-semibold ${lvlColor}`}>[{entry.level}]</span>{' '}
                    <span className="text-[#94A3B8]">{entry.subsystem}:</span>{' '}
                    <span className="text-[#DFE2EE]">{entry.message}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
