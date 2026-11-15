"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Menu,
  X,
  Plus,
  LogOut,
  Layers,
  BarChart3,
  Shield,
} from "lucide-react";
import { CreateQueueModal } from "@/components/modals/CreateQueueModal";
import { useToast } from "@/components/ui/ToastProvider";

export interface QueueSummary {
  _id: string;
  name: string;
  prefix: string;
  waitingCount: number;
}

interface ManagerProfile {
  name: string;
  email: string;
  workspaceName?: string;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeQueueId = searchParams.get("id");
  const { info } = useToast();

  const [queues, setQueues] = useState<QueueSummary[]>([]);
  const [manager, setManager] = useState<ManagerProfile | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoadingQueues, setIsLoadingQueues] = useState(true);

  // Fetch session & queues
  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setManager(data.manager);
      }
    } catch (e) {
      console.error("Session check failed:", e);
    }
  }, [router]);

  const fetchQueues = useCallback(async () => {
    try {
      const res = await fetch("/api/queues");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setQueues(data.queues || []);
      }
    } catch (e) {
      console.error("Failed to fetch queues:", e);
    } finally {
      setIsLoadingQueues(false);
    }
  }, [router]);

  useEffect(() => {
    fetchSession();
    fetchQueues();
  }, [fetchSession, fetchQueues]);

  // Close mobile drawer on route/search changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname, searchParams]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      info("Logged out", "Session terminated successfully");
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  const initials = manager?.name
    ? manager.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "OP";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        backgroundColor: "var(--bg-canvas)",
        overflow: "hidden",
      }}
    >
      {/* 52px Fixed Topbar */}
      <header
        style={{
          height: "52px",
          backgroundColor: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-hairline)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          zIndex: 40,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Mobile Hamburger Button (<768px) */}
          <button
            type="button"
            className="md-hide"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation drawer"
            style={{
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "transparent",
              border: "1px solid var(--border-strong)",
              borderRadius: "4px",
              color: "var(--text-primary)",
              cursor: "pointer",
            }}
          >
            {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>

          {/* Logo & Workspace Title */}
          <Link
            href="/queues"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              color: "var(--text-primary)",
            }}
          >
            <Image
              src="/logo.png"
              alt="QueueOS Logo"
              width={24}
              height={24}
              priority
              style={{
                borderRadius: "3px",
                objectFit: "contain",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "14px",
                fontWeight: 700,
                letterSpacing: "-0.01em",
              }}
            >
              QueueOS
            </span>
          </Link>

          <div
            className="mobile-hide"
            style={{
              width: "1px",
              height: "16px",
              backgroundColor: "var(--border-hairline)",
            }}
          />

          <span
            className="mobile-hide"
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--text-secondary)",
            }}
          >
            {manager?.workspaceName || "Rugas Desk #01"}
          </span>

          <div
            className="mobile-hide"
            style={{
              width: "1px",
              height: "16px",
              backgroundColor: "var(--border-hairline)",
              margin: "0 4px",
            }}
          />

          {/* Desktop Nav Links */}
          <nav
            className="mobile-hide"
            style={{
              display: "flex",
              alignItems: "center",
              height: "52px",
              gap: "16px",
            }}
          >
            <Link
              href="/queues"
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                fontSize: "13px",
                fontWeight: pathname === "/queues" ? 600 : 500,
                color: pathname === "/queues" ? "var(--text-primary)" : "var(--text-secondary)",
                borderBottom: pathname === "/queues" ? "2px solid var(--border-focus)" : "2px solid transparent",
                textDecoration: "none",
                padding: "0 4px",
                transition: "color 120ms ease",
              }}
            >
              Queues
            </Link>

            <Link
              href="/analytics"
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                fontSize: "13px",
                fontWeight: pathname === "/analytics" ? 600 : 500,
                color: pathname === "/analytics" ? "var(--text-primary)" : "var(--text-secondary)",
                borderBottom: pathname === "/analytics" ? "2px solid var(--border-focus)" : "2px solid transparent",
                textDecoration: "none",
                padding: "0 4px",
                transition: "color 120ms ease",
              }}
            >
              Analytics
            </Link>
          </nav>
        </div>

        {/* Topbar Right Area */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Quick New Queue Trigger on Topbar for Mobile */}
          <button
            type="button"
            className="md-hide"
            onClick={() => setIsCreateModalOpen(true)}
            aria-label="Add new queue"
            style={{
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-strong)",
              borderRadius: "4px",
              color: "var(--text-primary)",
              cursor: "pointer",
            }}
          >
            <Plus size={16} />
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              paddingLeft: "8px",
              borderLeft: "1px solid var(--border-hairline)",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "4px",
                backgroundColor: "var(--bg-canvas)",
                border: "1px solid var(--border-strong)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
              title={manager?.email}
            >
              {initials}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              aria-label="Sign out"
              style={{
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "none",
                border: "none",
                borderRadius: "4px",
                color: "var(--text-muted)",
                cursor: "pointer",
                transition: "color 120ms ease, background-color 120ms ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = "var(--status-cancelled-text)";
                e.currentTarget.style.backgroundColor = "var(--bg-hover)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = "var(--text-muted)";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container: Sidebar + Content */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
        {/* Mobile Slide-over Drawer Backdrop */}
        {isMobileMenuOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(24, 24, 22, 0.40)",
              zIndex: 45,
            }}
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* 240px Left Sidebar */}
        <aside
          className={`sidebar-nav ${isMobileMenuOpen ? "drawer-open" : ""}`}
          style={{
            width: "240px",
            backgroundColor: "var(--bg-surface)",
            borderRight: "1px solid var(--border-hairline)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flexShrink: 0,
            zIndex: 46,
          }}
        >
          {/* Top Section */}
          <div style={{ display: "flex", flexDirection: "column", padding: "12px 0" }}>
            {/* Header / Active Queues Count */}
            <div
              style={{
                padding: "0 16px 8px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                QUEUES
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--text-secondary)",
                }}
              >
                {queues.length.toString().padStart(2, "0")} ACTIVE
              </span>
            </div>

            {/* Queue List */}
            <nav style={{ display: "flex", flexDirection: "column", width: "100%" }}>
              {isLoadingQueues ? (
                <div style={{ padding: "16px", fontSize: "12px", color: "var(--text-muted)", textAlign: "center" }}>
                  Loading queues...
                </div>
              ) : queues.length === 0 ? (
                <div style={{ padding: "16px", fontSize: "12px", color: "var(--text-muted)", textAlign: "center" }}>
                  No active queues
                </div>
              ) : (
                queues.map((q) => {
                  const isActive =
                    pathname === "/queues" &&
                    (activeQueueId ? activeQueueId === q._id : queues[0]?._id === q._id);

                  return (
                    <Link
                      key={q._id}
                      href={`/queues?id=${q._id}`}
                      style={{
                        height: "36px",
                        padding: "0 14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor: isActive ? "var(--bg-active-row)" : "transparent",
                        borderLeft: isActive ? "2px solid var(--border-focus)" : "2px solid transparent",
                        color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                        fontWeight: isActive ? 600 : 500,
                        fontSize: "13px",
                        textDecoration: "none",
                        transition: "background-color 120ms ease, color 120ms ease",
                      }}
                      onMouseOver={(e) => {
                        if (!isActive) e.currentTarget.style.backgroundColor = "var(--bg-hover)";
                      }}
                      onMouseOut={(e) => {
                        if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {q.name}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "11px",
                          fontWeight: 600,
                          backgroundColor: isActive ? "var(--bg-surface)" : "var(--bg-hover)",
                          border: "1px solid var(--border-hairline)",
                          color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                          padding: "1px 6px",
                          borderRadius: "4px",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {q.waitingCount ?? 0}
                      </span>
                    </Link>
                  );
                })
              )}
            </nav>
          </div>

          {/* Bottom Pinned Action: "+ New Queue" */}
          <div
            style={{
              padding: "12px 14px",
              borderTop: "1px solid var(--border-hairline)",
              backgroundColor: "var(--bg-surface)",
            }}
          >
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              style={{
                width: "100%",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                backgroundColor: "transparent",
                border: "1px dashed var(--border-strong)",
                borderRadius: "4px",
                color: "var(--text-secondary)",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 120ms ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "var(--border-focus)";
                e.currentTarget.style.color = "var(--accent-primary)";
                e.currentTarget.style.backgroundColor = "var(--bg-serving)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "var(--border-strong)";
                e.currentTarget.style.color = "var(--text-secondary)";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Plus size={14} />
              <span>New Queue</span>
            </button>
          </div>
        </aside>

        {/* Workspace Canvas / Children */}
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            backgroundColor: "var(--bg-canvas)",
          }}
        >
          {children}
        </main>
      </div>

      {/* Responsive Styles Injection */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-hide {
            display: none !important;
          }
          .md-hide {
            display: flex !important;
          }
          .sidebar-nav {
            position: fixed !important;
            top: 52px !important;
            bottom: 0 !important;
            left: 0 !important;
            transform: translateX(-100%) !important;
            transition: transform 240ms cubic-bezier(0.16, 1, 0.3, 1) !important;
            box-shadow: none !important;
          }
          .sidebar-nav.drawer-open {
            transform: translateX(0) !important;
            box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;
          }
        }
        @media (min-width: 769px) {
          .md-hide {
            display: none !important;
          }
        }
      `}</style>

      {/* Create Queue Modal */}
      <CreateQueueModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onQueueCreated={async (newQueue) => {
          await fetchQueues();
          router.push(`/queues?id=${newQueue._id}`);
        }}
      />
    </div>
  );
}
