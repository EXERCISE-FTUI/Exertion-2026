"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  getAdminTelemetry,
  type AdminTelemetryResult,
  type TelemetrySessionItem,
  type TelemetryLogEvent,
} from "@/actions/exermind/getAdminTelemetry";
import {
  Activity,
  RefreshCw,
  Users,
  CheckCircle2,
  Clock,
  Zap,
  Search,
  ShieldAlert,
  ArrowLeft,
  FileCheck,
  Radio,
  Flame,
} from "lucide-react";
import "../entry.css";

export default function ExermindAdminMonitorPage() {
  const [data, setData] = useState<AdminTelemetryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchTelemetry = async () => {
    try {
      const res = await getAdminTelemetry();
      setData(res);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch admin telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      startTransition(() => {
        fetchTelemetry();
      });
    }, 5_000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleManualRefresh = () => {
    startTransition(() => {
      fetchTelemetry();
    });
  };

  const filteredSessions = (data?.sessions || []).filter(
    (s) =>
      s.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.leaderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.sessionId.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredLogs = (data?.logs || []).filter((log) => {
    const matchesSearch =
      log.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (selectedFilter === "ALL") return true;
    return log.eventType === selectedFilter;
  });

  return (
    <div className="min-h-screen w-full bg-[#070A0F] text-slate-100 font-montserrat p-4 sm:p-8">
      {/* Top Header Navigation */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/exermind"
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Activity className="h-7 w-7 text-cyan-400 animate-pulse" />
              <h1 className="font-orbitron text-2xl sm:text-3xl font-bold tracking-wider text-white drop-shadow-[0_0_12px_rgba(77,238,234,0.4)]">
                EXERMIND TELEMETRY MONITOR
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 pl-11">
            Real-time live contestant tracking, session telemetry, and log analytics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Live Pulse Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <Radio className={`h-3.5 w-3.5 ${autoRefresh ? "text-emerald-400 animate-ping" : "text-slate-500"}`} />
            <span className="text-slate-300 font-mono">
              {autoRefresh ? "LIVE 5s" : "PAUSED"}
            </span>
          </div>

          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              autoRefresh
                ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/50"
                : "bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800"
            }`}
          >
            {autoRefresh ? "Auto Refresh: ON" : "Auto Refresh: OFF"}
          </button>

          {/* Manual Refresh Button */}
          <button
            onClick={handleManualRefresh}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-orbitron font-semibold text-xs transition-all shadow-[0_0_15px_rgba(77,238,234,0.3)] disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            icon={Users}
            label="Total Sessions"
            value={data?.stats.totalSessions ?? 0}
            color="border-cyan-500/30 text-cyan-400"
          />
          <StatCard
            icon={Flame}
            label="Active Sessions"
            value={data?.stats.activeSessions ?? 0}
            color="border-emerald-500/30 text-emerald-400"
            live
          />
          <StatCard
            icon={CheckCircle2}
            label="Completed Exams"
            value={data?.stats.completedSessions ?? 0}
            color="border-purple-500/30 text-purple-400"
          />
          <StatCard
            icon={FileCheck}
            label="Answers Logged"
            value={data?.stats.totalAnswersLogged ?? 0}
            color="border-blue-500/30 text-blue-400"
          />
          <StatCard
            icon={Zap}
            label="Average Score"
            value={`${data?.stats.averageScore ?? 0}%`}
            color="border-amber-500/30 text-amber-400"
          />
        </div>

        {/* Live Session Holder Table */}
        <div className="rounded-2xl border border-slate-800 bg-[#0C1017] p-4 sm:p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-400" />
              <h2 className="font-orbitron text-lg font-bold text-white tracking-wide">
                Live Contestant Sessions
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {filteredSessions.length} teams
              </span>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search team or leader..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex h-48 w-full items-center justify-center text-slate-400 space-x-3">
              <RefreshCw className="h-6 w-6 animate-spin text-cyan-400" />
              <span className="font-orbitron text-sm">Loading telemetry metrics...</span>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm font-montserrat">
              No active or historic sessions match the search query.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 text-slate-400 font-orbitron uppercase text-[11px] tracking-wider">
                    <th className="py-3 px-4">Team & Holder</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Progress</th>
                    <th className="py-3 px-4">Started</th>
                    <th className="py-3 px-4">Power-Ups</th>
                    <th className="py-3 px-4 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredSessions.map((session) => (
                    <tr
                      key={session.sessionId}
                      className="hover:bg-slate-900/40 transition-colors"
                    >
                      {/* Team Name & Leader */}
                      <td className="py-3.5 px-4 font-montserrat">
                        <div className="font-semibold text-white text-sm">
                          {session.teamName}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Leader: {session.leaderName}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={session.status} />
                      </td>

                      {/* Progress Bar */}
                      <td className="py-3.5 px-4">
                        <div className="w-36 space-y-1">
                          <div className="flex justify-between text-[11px] text-slate-300 font-mono">
                            <span>{session.answeredCount} / {session.totalQuestions}</span>
                            <span>
                              {Math.round((session.answeredCount / (session.totalQuestions || 1)) * 100)}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(
                                  100,
                                  (session.answeredCount / (session.totalQuestions || 1)) * 100,
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Started Time */}
                      <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                        {new Date(session.startedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>

                      {/* Power-Ups */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {session.powerUps.length === 0 ? (
                            <span className="text-slate-500 text-[11px] italic">None</span>
                          ) : (
                            session.powerUps.map((pu, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono"
                              >
                                {pu}
                              </span>
                            ))
                          )}
                        </div>
                      </td>

                      {/* Score */}
                      <td className="py-3.5 px-4 text-right font-orbitron font-bold">
                        {session.score !== null ? (
                          <span className="text-emerald-400 text-sm">{session.score}%</span>
                        ) : session.status === "SUBMITTED" ? (
                          <span className="text-amber-400 text-[11px] font-sans italic">Pending Review</span>
                        ) : (
                          <span className="text-slate-500 text-[11px] font-sans">In Progress</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Real-Time Telemetry Event Log Stream */}
        <div className="rounded-2xl border border-slate-800 bg-[#0C1017] p-4 sm:p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-amber-400" />
              <h2 className="font-orbitron text-lg font-bold text-white tracking-wide">
                Real-Time Telemetry Stream
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {filteredLogs.length} events
              </span>
            </div>

            {/* Log Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {["ALL", "INFO", "POWER_UP", "SUBMIT", "WARNING"].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedFilter(type)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedFilter === type
                      ? "bg-cyan-500 text-black shadow-[0_0_10px_rgba(77,238,234,0.3)] font-orbitron"
                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Terminal Style Log Feed */}
          <div className="rounded-xl border border-slate-900 bg-[#05070A] p-4 font-mono text-xs max-h-96 overflow-y-auto space-y-2">
            {filteredLogs.length === 0 ? (
              <div className="py-8 text-center text-slate-600 font-sans text-xs">
                No telemetry log entries match the active filter.
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded border border-slate-900 hover:border-slate-800 bg-slate-950/60 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="text-slate-500 text-[10px] shrink-0">
                      [{new Date(log.timestamp).toLocaleTimeString()}]
                    </span>

                    <LogBadge type={log.eventType} />

                    <div>
                      <span className="font-semibold text-slate-200">
                        {log.teamName}:
                      </span>{" "}
                      <span className="text-slate-300">{log.message}</span>
                      {log.details && (
                        <span className="text-slate-500 ml-2 font-sans text-[11px]">
                          ({log.details})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  live,
}: {
  icon: any;
  label: string;
  value: string | number;
  color: string;
  live?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-[#0C1017] p-5 shadow-xl transition-all ${color}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-montserrat text-slate-400">{label}</span>
        <div className="flex items-center gap-2">
          {live && (
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          )}
          <Icon className="h-5 w-5 opacity-80" />
        </div>
      </div>
      <div className="mt-3 font-orbitron text-2xl font-bold tracking-tight text-white">
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "IN_PROGRESS") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[11px] font-mono font-medium">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
        IN_PROGRESS
      </span>
    );
  }
  if (status === "SUBMITTED" || status === "COMPLETED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono font-medium">
        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
        COMPLETED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-400 text-[11px] font-mono font-medium">
      {status}
    </span>
  );
}

function LogBadge({ type }: { type: TelemetryLogEvent["eventType"] }) {
  switch (type) {
    case "POWER_UP":
      return (
        <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-500/40 text-purple-300 text-[10px] font-mono">
          POWER_UP
        </span>
      );
    case "SUBMIT":
      return (
        <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono">
          SUBMIT
        </span>
      );
    case "WARNING":
      return (
        <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-500/40 text-amber-300 text-[10px] font-mono">
          WARNING
        </span>
      );
    default:
      return (
        <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-500/40 text-blue-300 text-[10px] font-mono">
          INFO
        </span>
      );
  }
}
