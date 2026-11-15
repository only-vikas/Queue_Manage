"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ChevronUp,
  ChevronDown,
  X,
  Check,
  Plus,
  Play,
  RotateCw,
  Clock,
  Phone,
  User,
} from "lucide-react";

interface TokenItem {
  _id: string;
  tokenNumber: string;
  sequenceNumber: number;
  personName: string;
  phone?: string;
  notes?: string;
  status: "WAITING" | "SERVING" | "COMPLETED" | "CANCELLED";
  position: number;
  createdAt: string;
  servedAt?: string;
}

interface QueueData {
  _id: string;
  name: string;
  prefix: string;
  waitingCount: number;
}

function QueueWorkspace() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeQueueId = searchParams.get("id");

  const [queues, setQueues] = useState<QueueData[]>([]);
  const [selectedQueue, setSelectedQueue] = useState<QueueData | null>(null);
  const [servingToken, setServingToken] = useState<TokenItem | null>(null);
  const [waitingTokens, setWaitingTokens] = useState<TokenItem[]>([]);
  const [personName, setPersonName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [servingDuration, setServingDuration] = useState("00m 00s");

  // Load all queues first
  const loadQueues = useCallback(async () => {
    try {
      const res = await fetch("/api/queues");
      if (res.status === 401) {
        router.push("/login");
        return null;
      }
      if (res.ok) {
        const data = await res.json();
        setQueues(data.queues || []);
        return data.queues as QueueData[];
      }
    } catch (e) {
      console.error("Error loading queues:", e);
    }
    return null;
  }, [router]);

  // Load details for selected queue
  const loadQueueDetails = useCallback(async (queueId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/queues/${queueId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedQueue(data.queue);
        setServingToken(data.servingToken);
        setWaitingTokens(data.waitingTokens || []);
      }
    } catch (e) {
      console.error("Error fetching queue details:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueues().then((allQueues) => {
      if (allQueues && allQueues.length > 0) {
        const targetId = activeQueueId || allQueues[0]._id;
        loadQueueDetails(targetId);
      } else {
        setIsLoading(false);
      }
    });
  }, [activeQueueId, loadQueues, loadQueueDetails]);

  // Timer for currently serving token
  useEffect(() => {
    if (!servingToken?.servedAt) {
      setServingDuration("00m 00s");
      return;
    }

    const servedTime = new Date(servingToken.servedAt).getTime();
    const updateTimer = () => {
      const now = Date.now();
      const elapsedSec = Math.max(0, Math.floor((now - servedTime) / 1000));
      const mins = Math.floor(elapsedSec / 60);
      const secs = elapsedSec % 60;
      setServingDuration(
        `${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [servingToken]);

  // Quick Add Token
  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQueue || !personName.trim()) return;

    try {
      const res = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          queueId: selectedQueue._id,
          personName,
          phone,
          notes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setWaitingTokens((prev) => [...prev, data.token]);
        setPersonName("");
        setPhone("");
        setNotes("");
        loadQueues();
      }
    } catch (err) {
      console.error("Error creating token:", err);
    }
  };

  // Assign Next
  const handleAssignNext = async () => {
    if (!selectedQueue) return;
    setIsAssigning(true);
    try {
      const res = await fetch("/api/tokens/assign-next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queueId: selectedQueue._id }),
      });

      if (res.ok) {
        await loadQueueDetails(selectedQueue._id);
        loadQueues();
      }
    } catch (err) {
      console.error("Error assigning next token:", err);
    } finally {
      setIsAssigning(false);
    }
  };

  // Reorder
  const handleReorder = async (tokenId: string, direction: "UP" | "DOWN") => {
    try {
      const res = await fetch(`/api/tokens/${tokenId}/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
      });

      if (res.ok && selectedQueue) {
        await loadQueueDetails(selectedQueue._id);
      }
    } catch (err) {
      console.error("Error reordering token:", err);
    }
  };

  // Update Status (Complete / Cancel)
  const handleUpdateStatus = async (
    tokenId: string,
    status: "COMPLETED" | "CANCELLED"
  ) => {
    try {
      const res = await fetch(`/api/tokens/${tokenId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok && selectedQueue) {
        await loadQueueDetails(selectedQueue._id);
        loadQueues();
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // Format wait time
  const formatWaitTime = (createdAt: string) => {
    const elapsedSec = Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000));
    const mins = Math.floor(elapsedSec / 60);
    const secs = elapsedSec % 60;
    return `${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
  };

  if (isLoading && queues.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__title">Loading Queue Desk...</div>
      </div>
    );
  }

  if (queues.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__number">0</div>
        <div className="empty-state__title">No queues yet</div>
        <div className="empty-state__hint">
          Create your first queue in the left sidebar to start triaging visitors.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* 52px Queue Panel Header */}
      <div className="queue-header">
        <h2 className="queue-header__title">{selectedQueue?.name || "Queue Desk"}</h2>
        <span className="queue-header__count">
          {waitingTokens.length} waiting
        </span>

        <div className="queue-header__actions">
          <button
            onClick={() => selectedQueue && loadQueueDetails(selectedQueue._id)}
            className="btn btn-ghost"
            title="Refresh"
            style={{ width: "32px", height: "32px", padding: 0 }}
          >
            <RotateCw size={14} />
          </button>

          <button
            onClick={handleAssignNext}
            disabled={waitingTokens.length === 0 || isAssigning}
            className="btn btn-primary"
          >
            <Play size={13} fill="currentColor" />
            Assign Next Token
          </button>
        </div>
      </div>

      {/* 64px Currently Serving Banner */}
      <div className="serving-banner">
        <span className="serving-banner__label">Serving</span>

        {servingToken ? (
          <>
            <span className="serving-banner__token">{servingToken.tokenNumber}</span>
            <div className="divider-v" style={{ height: "20px" }} />
            <span className="serving-banner__name">{servingToken.personName}</span>

            {servingToken.phone && (
              <span style={{ fontSize: "12px", color: "var(--status-serving-text)", opacity: 0.8 }}>
                ({servingToken.phone})
              </span>
            )}

            <div className="divider-v" style={{ height: "20px" }} />
            <span className="serving-banner__timer mono">
              <Clock size={13} style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }} />
              {servingDuration}
            </span>

            <div className="serving-banner__actions">
              <button
                onClick={() => handleUpdateStatus(servingToken._id, "COMPLETED")}
                className="btn btn-secondary btn-sm"
                title="Mark Completed"
              >
                <Check size={13} style={{ color: "var(--status-completed-text)" }} />
                Complete
              </button>
              <button
                onClick={() => handleUpdateStatus(servingToken._id, "CANCELLED")}
                className="btn btn-danger btn-sm"
                title="Cancel Token"
              >
                <X size={13} />
              </button>
            </div>
          </>
        ) : (
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            No token currently serving. Click &ldquo;Assign Next Token&rdquo; to call the next person in line.
          </span>
        )}
      </div>

      {/* 48px Quick-Add Entry Bar */}
      <form onSubmit={handleQuickAdd} className="quickadd-bar">
        <User size={15} style={{ color: "var(--text-muted)" }} />
        <input
          type="text"
          required
          className="quickadd-bar__input"
          placeholder="Person name (e.g. Rohan Sharma)..."
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
        />

        <div className="divider-v" style={{ height: "20px" }} />

        <Phone size={14} style={{ color: "var(--text-muted)" }} />
        <input
          type="text"
          className="quickadd-bar__input mono"
          style={{ maxWidth: "160px" }}
          placeholder="Phone (opt)..."
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <div className="divider-v" style={{ height: "20px" }} />

        <input
          type="text"
          className="quickadd-bar__input"
          style={{ maxWidth: "220px" }}
          placeholder="Notes / purpose..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <button type="submit" className="quickadd-bar__submit" title="Issue Token (Enter)">
          <Plus size={15} />
        </button>
      </form>

      {/* Waiting Token List */}
      <div className="queue-list">
        <div className="queue-list__header">
          <div className="queue-list__header-cell token-row__position">#</div>
          <div className="queue-list__header-cell token-row__id">TOKEN</div>
          <div className="queue-list__header-cell token-row__name">NAME</div>
          <div className="queue-list__header-cell token-row__wait">WAIT TIME</div>
          <div className="queue-list__header-cell token-row__actions">ACTIONS</div>
        </div>

        {waitingTokens.length === 0 ? (
          <div style={{ padding: "40px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
            Queue is empty. Use the quick-add bar above to issue a token.
          </div>
        ) : (
          waitingTokens.map((t, idx) => (
            <div key={t._id} className="token-row">
              <span className="token-row__position position-index">
                #{String(idx + 1).padStart(2, "0")}
              </span>

              <span className="token-row__id token-id">{t.tokenNumber}</span>

              <div className="token-row__name">
                <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>{t.personName}</span>
                {t.phone && (
                  <span style={{ marginLeft: "8px", fontSize: "12px", color: "var(--text-muted)" }} className="mono">
                    {t.phone}
                  </span>
                )}
                {t.notes && (
                  <span style={{ marginLeft: "8px", fontSize: "12px", color: "var(--text-secondary)" }}>
                    — {t.notes}
                  </span>
                )}
              </div>

              <span className="token-row__wait timer-display">
                {formatWaitTime(t.createdAt)}
              </span>

              <div className="token-row__actions">
                <button
                  onClick={() => handleReorder(t._id, "UP")}
                  disabled={idx === 0}
                  className="btn-icon"
                  title="Move Up"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => handleReorder(t._id, "DOWN")}
                  disabled={idx === waitingTokens.length - 1}
                  className="btn-icon"
                  title="Move Down"
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  onClick={() => handleUpdateStatus(t._id, "CANCELLED")}
                  className="btn-danger"
                  title="Cancel Token"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function QueuesPage() {
  return (
    <Suspense fallback={<div className="empty-state"><div className="empty-state__title">Loading...</div></div>}>
      <QueueWorkspace />
    </Suspense>
  );
}

