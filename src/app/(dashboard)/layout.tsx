"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Plus, BarChart2, Layers } from "lucide-react";

interface QueueItem {
  _id: string;
  name: string;
  prefix: string;
  waitingCount: number;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [queues, setQueues] = useState<QueueItem[]>([]);
  const [manager, setManager] = useState<{ name: string; workspaceName?: string } | null>(null);
  const [showNewQueueModal, setShowNewQueueModal] = useState(false);
  const [newQueueName, setNewQueueName] = useState("");
  const [newQueuePrefix, setNewQueuePrefix] = useState("A");
  const [isPending, startTransition] = useTransition();

  const fetchQueues = async () => {
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
      console.error("Failed to load queues:", e);
    }
  };

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setManager(data.manager);
      }
    } catch (e) {
      console.error("Failed to load session:", e);
    }
  };

  useEffect(() => {
    fetchSession();
    fetchQueues();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const handleCreateQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQueueName.trim()) return;

    try {
      const res = await fetch("/api/queues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newQueueName, prefix: newQueuePrefix }),
      });

      if (res.ok) {
        const data = await res.json();
        setShowNewQueueModal(false);
        setNewQueueName("");
        setNewQueuePrefix("A");
        await fetchQueues();
        router.push(`/queues?id=${data.queue._id}`);
      }
    } catch (err) {
      console.error("Error creating queue:", err);
    }
  };

  return (
    <div className="app-shell">
      {/* 52px Fixed Top Bar */}
      <header className="topbar">
        <div className="topbar__logo">QueueOS</div>
        <div className="divider-v" style={{ height: "16px", margin: "0 4px" }} />
        <span className="topbar__workspace">
          {manager?.workspaceName || "Rugas Command Desk"}
        </span>

        <nav className="topbar__nav">
          <Link
            href="/queues"
            className={`topbar__nav-link ${pathname.startsWith("/queues") ? "active" : ""}`}
          >
            <Layers size={14} style={{ marginRight: "6px" }} />
            Queues
          </Link>
          <Link
            href="/analytics"
            className={`topbar__nav-link ${pathname.startsWith("/analytics") ? "active" : ""}`}
          >
            <BarChart2 size={14} style={{ marginRight: "6px" }} />
            Analytics
          </Link>

          <div className="divider-v" style={{ height: "16px", margin: "0 8px" }} />

          <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>
            {manager?.name || "Manager"}
          </span>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="btn btn-ghost"
            style={{ width: "28px", height: "28px", padding: 0 }}
          >
            <LogOut size={14} />
          </button>
        </nav>
      </header>

      {/* Main Workspace Body */}
      <div className="workspace">
        {/* 240px Fixed Left Sidebar */}
        <aside className="sidebar">
          <div className="sidebar__section-label">Active Queues</div>

          <div className="sidebar__queue-list">
            {queues.length === 0 ? (
              <div style={{ padding: "16px 8px", fontSize: "12px", color: "var(--text-muted)", textAlign: "center" }}>
                No active queues
              </div>
            ) : (
              queues.map((q) => {
                const isActive = pathname.startsWith("/queues");
                return (
                  <Link
                    key={q._id}
                    href={`/queues?id=${q._id}`}
                    className={`sidebar__queue-item ${isActive ? "active" : ""}`}
                    style={{ textDecoration: "none" }}
                  >
                    <span className="sidebar__queue-name">{q.name}</span>
                    <span className="sidebar__queue-count">{q.waitingCount}</span>
                  </Link>
                );
              })
            )}
          </div>

          <div className="sidebar__footer">
            <button
              onClick={() => setShowNewQueueModal(true)}
              className="btn btn-secondary"
              style={{ width: "100%", justifyContent: "center" }}
            >
              <Plus size={14} />
              New Queue
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="main-content">{children}</main>
      </div>

      {/* New Queue Modal */}
      {showNewQueueModal && (
        <div className="modal-overlay" onClick={() => setShowNewQueueModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <span className="modal__title">Create Queue</span>
            </div>
            <form onSubmit={handleCreateQueue}>
              <div className="modal__body">
                <div className="input-group">
                  <label className="input-label" htmlFor="qName">
                    Queue Name
                  </label>
                  <input
                    id="qName"
                    type="text"
                    required
                    autoFocus
                    className="input"
                    placeholder="e.g. Triage Desk"
                    value={newQueueName}
                    onChange={(e) => setNewQueueName(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="qPrefix">
                    Token Prefix (1-4 letters)
                  </label>
                  <input
                    id="qPrefix"
                    type="text"
                    maxLength={4}
                    className="input mono"
                    placeholder="A"
                    value={newQueuePrefix}
                    onChange={(e) => setNewQueuePrefix(e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              <div className="modal__footer">
                <button
                  type="button"
                  onClick={() => setShowNewQueueModal(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

