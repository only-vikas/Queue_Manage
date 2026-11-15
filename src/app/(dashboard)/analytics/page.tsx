"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { RotateCw, TrendingUp, Users, Clock, AlertTriangle } from "lucide-react";

interface AnalyticsData {
  range: string;
  kpis: {
    avgWaitMinutes: number;
    tokensServed: number;
    activeServingCount: number;
    waitingCount: number;
    totalTokens: number;
    cancelRate: number;
  };
  statusBreakdown: {
    WAITING: number;
    SERVING: number;
    COMPLETED: number;
    CANCELLED: number;
  };
  hourlyTrends: Array<{
    hour: number;
    label: string;
    date: string;
    inflow: number;
    completed: number;
  }>;
}

function AnalyticsWorkspace() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [range, setRange] = useState("today");
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalytics = useCallback(async (selectedRange: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/analytics?range=${selectedRange}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Failed to load analytics:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics(range);
  }, [range, loadAnalytics]);

  const maxInflow = Math.max(...(data?.hourlyTrends.map((h) => h.inflow) || [1]), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
      {/* 52px Header */}
      <div className="queue-header">
        <h2 className="queue-header__title">Analytics & Triage Metrics</h2>

        <div className="queue-header__actions">
          <div style={{ display: "flex", gap: "4px" }}>
            {["today", "7d", "30d"].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`btn btn-sm ${range === r ? "btn-primary" : "btn-secondary"}`}
              >
                {r === "today" ? "Today" : r === "7d" ? "7 Days" : "30 Days"}
              </button>
            ))}
          </div>

          <button
            onClick={() => loadAnalytics(range)}
            className="btn btn-ghost"
            title="Refresh"
            style={{ width: "32px", height: "32px", padding: 0 }}
          >
            <RotateCw size={14} />
          </button>
        </div>
      </div>

      {/* 4-Cell KPI Strip */}
      <div className="kpi-strip">
        <div className="kpi-cell">
          <span className="kpi-label">Avg Wait Time</span>
          <div className="kpi-value">
            {isLoading ? "—" : data?.kpis.avgWaitMinutes || 0}
            <span className="kpi-unit">min</span>
          </div>
        </div>

        <div className="kpi-cell">
          <span className="kpi-label">Tokens Served</span>
          <div className="kpi-value">
            {isLoading ? "—" : data?.kpis.tokensServed || 0}
            <span className="kpi-unit">people</span>
          </div>
        </div>

        <div className="kpi-cell">
          <span className="kpi-label">Active Serving</span>
          <div className="kpi-value">
            {isLoading ? "—" : data?.kpis.activeServingCount || 0}
            <span className="kpi-unit">at desk</span>
          </div>
        </div>

        <div className="kpi-cell">
          <span className="kpi-label">Cancel Rate</span>
          <div className="kpi-value">
            {isLoading ? "—" : data?.kpis.cancelRate || 0}
            <span className="kpi-unit">%</span>
          </div>
        </div>
      </div>

      {/* Analytics Panels */}
      <div className="chart-container">
        {/* Left: Hourly Inflow Trends */}
        <div className="chart-panel">
          <div className="chart-title">Hourly Inflow & Queue Volume</div>
          {data?.hourlyTrends.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
              No volume recorded in this time range.
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "flex-end", height: "200px", gap: "8px", paddingTop: "20px" }}>
              {data?.hourlyTrends.map((h, i) => {
                const heightPercent = Math.max((h.inflow / maxInflow) * 100, 6);
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      height: "100%",
                      justifyContent: "flex-end",
                    }}
                  >
                    <span className="mono" style={{ fontSize: "11px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                      {h.inflow}
                    </span>
                    <div
                      style={{
                        width: "100%",
                        height: `${heightPercent}%`,
                        backgroundColor: "var(--accent-primary)",
                        borderRadius: "2px 2px 0 0",
                        minHeight: "4px",
                      }}
                    />
                    <span
                      className="mono"
                      style={{
                        fontSize: "10px",
                        color: "var(--text-muted)",
                        marginTop: "6px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Status Breakdown */}
        <div className="chart-panel">
          <div className="chart-title">Token Outcomes Breakdown</div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="status-dot status-dot--completed" />
                <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>Completed / Served</span>
              </div>
              <span className="mono" style={{ fontWeight: 600 }}>
                {data?.statusBreakdown.COMPLETED || 0}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="status-dot status-dot--serving" />
                <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>Currently Serving</span>
              </div>
              <span className="mono" style={{ fontWeight: 600 }}>
                {data?.statusBreakdown.SERVING || 0}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="status-dot status-dot--waiting" />
                <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>Waiting in Line</span>
              </div>
              <span className="mono" style={{ fontWeight: 600 }}>
                {data?.statusBreakdown.WAITING || 0}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="status-dot status-dot--cancelled" />
                <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>Cancelled / No Show</span>
              </div>
              <span className="mono" style={{ fontWeight: 600 }}>
                {data?.statusBreakdown.CANCELLED || 0}
              </span>
            </div>

            <div className="divider-h" style={{ margin: "4px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>Total Recorded</span>
              <span className="mono" style={{ fontSize: "16px", fontWeight: 700 }}>
                {data?.kpis.totalTokens || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="empty-state"><div className="empty-state__title">Loading Analytics...</div></div>}>
      <AnalyticsWorkspace />
    </Suspense>
  );
}

