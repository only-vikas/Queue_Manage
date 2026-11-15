"use client";

import { useEffect, useState, useCallback, useMemo, useRef, Suspense } from "react";
import NumberFlow from "@number-flow/react";
import {
  RotateCw,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
} from "lucide-react";
import { HourlyInflowBarChart } from "@/components/analytics/HourlyInflowBarChart";
import { InflowAreaChart } from "@/components/analytics/InflowAreaChart";
import { useToast } from "@/components/ui/ToastProvider";

interface AnalyticsData {
  range: string;
  kpis: {
    avgWaitMinutes: number;
    avgServiceMinutes?: number;
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

interface QueueOption {
  _id: string;
  name: string;
  prefix: string;
}

function AnalyticsWorkspace() {
  const { success, error: toastError } = useToast();

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [queues, setQueues] = useState<QueueOption[]>([]);
  const [selectedQueueId, setSelectedQueueId] = useState<string>("ALL");
  const [range, setRange] = useState<string>("today");
  const [isLoading, setIsLoading] = useState(true);

  // Resize container refs for Visx charts
  const barContainerRef = useRef<HTMLDivElement>(null);
  const areaContainerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(480);

  useEffect(() => {
    const handleResize = () => {
      if (barContainerRef.current) {
        setChartWidth(Math.max(barContainerRef.current.clientWidth - 32, 280));
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch queues for filtering
  useEffect(() => {
    fetch("/api/queues")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.queues) setQueues(json.queues);
      })
      .catch((err) => console.error("Error loading queues for filter:", err));
  }, []);

  // Load analytics
  const loadAnalytics = useCallback(
    async (selectedRange: string, queueId: string) => {
      setIsLoading(true);
      try {
        let url = `/api/analytics?range=${selectedRange}`;
        if (queueId !== "ALL") {
          url += `&queueId=${queueId}`;
        }
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          throw new Error("Failed to load analytics");
        }
      } catch (e: unknown) {
        toastError("Failed to fetch analytics metrics");
      } finally {
        setIsLoading(false);
      }
    },
    [toastError]
  );

  useEffect(() => {
    loadAnalytics(range, selectedQueueId);
  }, [range, selectedQueueId, loadAnalytics]);

  // Total tokens for breakdown percentages
  const totalTokens = useMemo(() => {
    if (!data?.statusBreakdown) return 0;
    const { WAITING, SERVING, COMPLETED, CANCELLED } = data.statusBreakdown;
    return WAITING + SERVING + COMPLETED + CANCELLED;
  }, [data]);

  // Export CSV
  const handleExportCSV = () => {
    if (!data) return;

    const rows = [
      ["QueueOS Operational Analytics Report"],
      ["Date Range", range],
      ["Queue Filter", selectedQueueId === "ALL" ? "All Queues" : selectedQueueId],
      ["Generated At", new Date().toISOString()],
      [],
      ["METRIC", "VALUE"],
      ["Average Wait Time (min)", data.kpis.avgWaitMinutes],
      ["Tokens Served", data.kpis.tokensServed],
      ["Active Serving Now", data.kpis.activeServingCount],
      ["Waiting Count", data.kpis.waitingCount],
      ["Cancellation Rate (%)", data.kpis.cancelRate],
      [],
      ["STATUS BREAKDOWN", "COUNT", "PERCENTAGE"],
      [
        "COMPLETED",
        data.statusBreakdown.COMPLETED,
        totalTokens ? `${Math.round((data.statusBreakdown.COMPLETED / totalTokens) * 100)}%` : "0%",
      ],
      [
        "WAITING",
        data.statusBreakdown.WAITING,
        totalTokens ? `${Math.round((data.statusBreakdown.WAITING / totalTokens) * 100)}%` : "0%",
      ],
      [
        "CANCELLED",
        data.statusBreakdown.CANCELLED,
        totalTokens ? `${Math.round((data.statusBreakdown.CANCELLED / totalTokens) * 100)}%` : "0%",
      ],
      [
        "SERVING",
        data.statusBreakdown.SERVING,
        totalTokens ? `${Math.round((data.statusBreakdown.SERVING / totalTokens) * 100)}%` : "0%",
      ],
      [],
      ["HOURLY / PERIOD TRENDS", "INFLOW", "COMPLETED"],
      ...(data.hourlyTrends || []).map((h) => [h.label, h.inflow, h.completed]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `queueos_analytics_${range}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    success("Analytics CSV exported", "Downloaded telemetry report");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        overflowY: "auto",
        backgroundColor: "var(--bg-canvas)",
      }}
    >
      {/* 52px Analytics Header */}
      <div
        style={{
          height: "52px",
          backgroundColor: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-hairline)",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h1
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
              margin: 0,
            }}
          >
            Analytics &amp; Throughput
          </h1>

          {/* Queue Filter Dropdown */}
          <div style={{ position: "relative" }}>
            <select
              value={selectedQueueId}
              onChange={(e) => setSelectedQueueId(e.target.value)}
              style={{
                height: "28px",
                padding: "0 8px",
                backgroundColor: "var(--bg-input)",
                border: "1px solid var(--border-hairline)",
                borderRadius: "4px",
                fontSize: "12px",
                color: "var(--text-secondary)",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="ALL">All Queues</option>
              {queues.map((q) => (
                <option key={q._id} value={q._id}>
                  {q.name} ({q.prefix})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Header Right Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Segmented Time Range Toggle */}
          <div
            style={{
              display: "flex",
              backgroundColor: "var(--bg-input)",
              border: "1px solid var(--border-hairline)",
              borderRadius: "4px",
              padding: "2px",
              gap: "2px",
            }}
          >
            {[
              { id: "today", label: "Today" },
              { id: "7d", label: "7 Days" },
              { id: "30d", label: "30 Days" },
            ].map((t) => {
              const active = range === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setRange(t.id)}
                  style={{
                    height: "24px",
                    padding: "0 8px",
                    borderRadius: "3px",
                    border: "none",
                    backgroundColor: active ? "var(--bg-surface)" : "transparent",
                    color: active ? "var(--text-primary)" : "var(--text-muted)",
                    fontSize: "11px",
                    fontWeight: active ? 600 : 500,
                    cursor: "pointer",
                    boxShadow: active ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            title="Export CSV Report"
            style={{
              height: "28px",
              padding: "0 10px",
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-strong)",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              cursor: "pointer",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-hover)")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-surface)")}
          >
            <Download size={13} />
            <span className="mobile-hide">Export CSV</span>
          </button>

          {/* Refresh */}
          <button
            type="button"
            onClick={() => loadAnalytics(range, selectedQueueId)}
            title="Refresh Metrics"
            aria-label="Refresh"
            style={{
              height: "28px",
              width: "28px",
              padding: 0,
              backgroundColor: "transparent",
              border: "1px solid var(--border-hairline)",
              borderRadius: "4px",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <RotateCw size={13} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* 4-Cell KPI Strip (76px height) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          backgroundColor: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-hairline)",
          flexShrink: 0,
        }}
      >
        {/* Cell 1: Avg Wait Time */}
        <div
          style={{
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            borderRight: "1px solid var(--border-hairline)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text-muted)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Avg Wait Time
          </span>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "24px",
              fontWeight: 700,
              color: "var(--text-primary)",
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1.1,
              display: "flex",
              alignItems: "baseline",
            }}
          >
            {isLoading ? (
              "—"
            ) : (
              <>
                <NumberFlow value={data?.kpis.avgWaitMinutes || 0} />
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "var(--text-muted)",
                    marginLeft: "4px",
                  }}
                >
                  min
                </span>
              </>
            )}
          </div>
        </div>

        {/* Cell 2: Tokens Served */}
        <div
          style={{
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            borderRight: "1px solid var(--border-hairline)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text-muted)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Tokens Served
          </span>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "24px",
              fontWeight: 700,
              color: "var(--text-primary)",
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1.1,
              display: "flex",
              alignItems: "baseline",
            }}
          >
            {isLoading ? (
              "—"
            ) : (
              <>
                <NumberFlow value={data?.kpis.tokensServed || 0} />
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "var(--text-muted)",
                    marginLeft: "4px",
                  }}
                >
                  {range === "today" ? "today" : range}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Cell 3: Active Now */}
        <div
          style={{
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            borderRight: "1px solid var(--border-hairline)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text-muted)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Active Now
          </span>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "24px",
              fontWeight: 700,
              color: "var(--text-primary)",
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1.1,
              display: "flex",
              alignItems: "baseline",
            }}
          >
            {isLoading ? (
              "—"
            ) : (
              <>
                <NumberFlow value={data?.kpis.activeServingCount || 0} />
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "var(--status-serving-text)",
                    marginLeft: "4px",
                  }}
                >
                  serving
                </span>
              </>
            )}
          </div>
        </div>

        {/* Cell 4: Cancel Rate */}
        <div
          style={{
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text-muted)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Cancel Rate
          </span>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "24px",
              fontWeight: 700,
              color: (data?.kpis.cancelRate || 0) > 10 ? "var(--status-danger)" : "var(--text-primary)",
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1.1,
              display: "flex",
              alignItems: "baseline",
            }}
          >
            {isLoading ? (
              "—"
            ) : (
              <>
                <NumberFlow value={data?.kpis.cancelRate || 0} />
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "var(--text-muted)",
                    marginLeft: "2px",
                  }}
                >
                  %
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Charts Body */}
      <div
        style={{
          padding: "20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: "16px",
        }}
      >
        {/* Chart Panel 1: Hourly Inflow Bar Chart */}
        <div
          ref={barContainerRef}
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-hairline)",
            borderRadius: "6px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  margin: 0,
                }}
              >
                Token Inflow by Hour
              </h2>
              <p
                style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  margin: "2px 0 0 0",
                  fontFamily: "var(--font-mono)",
                }}
              >
                Volume of tickets issued across active desks
              </p>
            </div>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                fontWeight: 600,
                color: "var(--accent-primary)",
                backgroundColor: "var(--bg-serving)",
                border: "1px solid var(--border-serving)",
                padding: "2px 6px",
                borderRadius: "3px",
              }}
            >
              VISX ENGINE
            </span>
          </div>

          <div
            style={{
              width: "100%",
              height: "230px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <HourlyInflowBarChart
              data={data?.hourlyTrends || []}
              width={chartWidth}
              height={220}
            />
          </div>
        </div>

        {/* Chart Panel 2: Token Outcomes Breakdown */}
        <div
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-hairline)",
            borderRadius: "6px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--text-primary)",
                margin: 0,
              }}
            >
              Token Outcomes
            </h2>
            <p
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                margin: "2px 0 0 0",
                fontFamily: "var(--font-mono)",
              }}
            >
              Distribution of finished, active, and dropped tickets
            </p>
          </div>

          {/* Segmented Proportional Bar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div
              style={{
                width: "100%",
                height: "12px",
                borderRadius: "3px",
                backgroundColor: "var(--border-hairline)",
                overflow: "hidden",
                display: "flex",
              }}
            >
              {totalTokens > 0 ? (
                <>
                  <div
                    title={`Completed: ${data?.statusBreakdown.COMPLETED}`}
                    style={{
                      width: `${((data?.statusBreakdown.COMPLETED || 0) / totalTokens) * 100}%`,
                      backgroundColor: "var(--status-completed-text)",
                      height: "100%",
                      transition: "width 300ms ease",
                    }}
                  />
                  <div
                    title={`Serving: ${data?.statusBreakdown.SERVING}`}
                    style={{
                      width: `${((data?.statusBreakdown.SERVING || 0) / totalTokens) * 100}%`,
                      backgroundColor: "var(--status-serving-text)",
                      height: "100%",
                      transition: "width 300ms ease",
                    }}
                  />
                  <div
                    title={`Waiting: ${data?.statusBreakdown.WAITING}`}
                    style={{
                      width: `${((data?.statusBreakdown.WAITING || 0) / totalTokens) * 100}%`,
                      backgroundColor: "var(--text-muted)",
                      height: "100%",
                      transition: "width 300ms ease",
                    }}
                  />
                  <div
                    title={`Cancelled: ${data?.statusBreakdown.CANCELLED}`}
                    style={{
                      width: `${((data?.statusBreakdown.CANCELLED || 0) / totalTokens) * 100}%`,
                      backgroundColor: "var(--status-cancelled-text)",
                      height: "100%",
                      transition: "width 300ms ease",
                    }}
                  />
                </>
              ) : (
                <div style={{ width: "100%", height: "100%", backgroundColor: "var(--border-hairline)" }} />
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              <span>Total: {totalTokens} tokens recorded</span>
              <span>100% telemetry</span>
            </div>
          </div>

          {/* Legend Table */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              border: "1px solid var(--border-hairline)",
              borderRadius: "4px",
              overflow: "hidden",
              fontSize: "12px",
            }}
          >
            {[
              {
                label: "Completed",
                color: "var(--status-completed-text)",
                count: data?.statusBreakdown.COMPLETED || 0,
              },
              {
                label: "Currently Serving",
                color: "var(--status-serving-text)",
                count: data?.statusBreakdown.SERVING || 0,
              },
              {
                label: "Waiting in Queue",
                color: "var(--text-muted)",
                count: data?.statusBreakdown.WAITING || 0,
              },
              {
                label: "Cancelled / Dropped",
                color: "var(--status-cancelled-text)",
                count: data?.statusBreakdown.CANCELLED || 0,
              },
            ].map((item, idx) => {
              const pct = totalTokens > 0 ? Math.round((item.count / totalTokens) * 100) : 0;
              return (
                <div
                  key={item.label}
                  style={{
                    height: "32px",
                    padding: "0 12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: idx % 2 === 0 ? "var(--bg-surface)" : "var(--bg-input)",
                    borderBottom: idx < 3 ? "1px solid var(--border-hairline)" : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "2px",
                        backgroundColor: item.color,
                      }}
                    />
                    <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      {item.label}
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontVariantNumeric: "tabular-nums",
                      display: "flex",
                      gap: "12px",
                    }}
                  >
                    <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{item.count}</span>
                    <span style={{ color: "var(--text-muted)", width: "36px", textAlign: "right" }}>
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart Panel 3: Inflow Trend Area Chart */}
        <div
          ref={areaContainerRef}
          style={{
            gridColumn: "1 / -1",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-hairline)",
            borderRadius: "6px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  margin: 0,
                }}
              >
                Inflow Dynamics &amp; Trend Line
              </h2>
              <p
                style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  margin: "2px 0 0 0",
                  fontFamily: "var(--font-mono)",
                }}
              >
                Area curve styled with Signal Vermilion (#D9481E) and flat tone fill
              </p>
            </div>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--text-secondary)",
              }}
            >
              PEAK HOUR:{" "}
              <strong style={{ color: "var(--accent-primary)" }}>
                {data?.hourlyTrends?.reduce((max, h) => (h.inflow > max.inflow ? h : max), {
                  inflow: 0,
                  label: "--",
                }).label || "--"}
              </strong>
            </span>
          </div>

          <div
            style={{
              width: "100%",
              height: "230px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <InflowAreaChart
              data={data?.hourlyTrends || []}
              width={chartWidth}
              height={220}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div style={{ padding: "24px", color: "var(--text-muted)" }}>Loading Analytics...</div>}>
      <AnalyticsWorkspace />
    </Suspense>
  );
}
