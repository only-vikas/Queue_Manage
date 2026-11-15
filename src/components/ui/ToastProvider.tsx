"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, Megaphone, X } from "lucide-react";

export type ToastVariant = "success" | "error" | "info" | "serving";

export interface ToastOptions {
  title: string | React.ReactNode;
  subtext?: string | React.ReactNode;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}

export interface ToastItem extends ToastOptions {
  id: string;
  variant: ToastVariant;
  createdAt: number;
}

interface ToastContextValue {
  toast: (variant: ToastVariant, options: ToastOptions) => void;
  success: (title: string | React.ReactNode, subtext?: string | React.ReactNode, options?: Partial<ToastOptions>) => void;
  error: (title: string | React.ReactNode, subtext?: string | React.ReactNode, options?: Partial<ToastOptions>) => void;
  info: (title: string | React.ReactNode, subtext?: string | React.ReactNode, options?: Partial<ToastOptions>) => void;
  serving: (title: string | React.ReactNode, subtext?: string | React.ReactNode, options?: Partial<ToastOptions>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_CONFIG: Record<
  ToastVariant,
  { railColor: string; icon: React.ReactNode }
> = {
  success: {
    railColor: "#166534",
    icon: <CheckCircle2 size={16} style={{ color: "#166534" }} />,
  },
  error: {
    railColor: "#B91C1C",
    icon: <AlertCircle size={16} style={{ color: "#B91C1C" }} />,
  },
  info: {
    railColor: "#1D4ED8",
    icon: <Info size={16} style={{ color: "#1D4ED8" }} />,
  },
  serving: {
    railColor: "#0F766E",
    icon: <Megaphone size={16} style={{ color: "#0F766E" }} />,
  },
};

function ToastComponent({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const [isPaused, setIsPaused] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const duration = item.duration ?? 4000;
  const config = VARIANT_CONFIG[item.variant];

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(item.id);
    }, 180);
  }, [item.id, onDismiss]);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "340px",
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border-strong)",
        borderRadius: "6px",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
        transform: isExiting ? "translateX(16px)" : "translateY(0)",
        opacity: isExiting ? 0 : 1,
        transition: "transform 180ms ease, opacity 180ms ease",
        animation: !isExiting ? "toastEnter 220ms cubic-bezier(0.16, 1, 0.3, 1) forwards" : undefined,
      }}
    >
      {/* 3px Left Accent Rail */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "3px",
          backgroundColor: config.railColor,
        }}
      />

      <div
        style={{
          padding: "12px 14px 12px 18px",
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
        }}
      >
        <div style={{ marginTop: "2px", flexShrink: 0 }}>{config.icon}</div>

        <div style={{ flex: 1, minWidth: 0, paddingRight: "4px" }}>
          <div
            style={{
              fontSize: "13px",
              lineHeight: "18px",
              fontWeight: 600,
              color: "var(--text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item.title}
          </div>
          {item.subtext && (
            <div
              style={{
                fontSize: "11px",
                lineHeight: "15px",
                color: "var(--text-secondary)",
                marginTop: "2px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.subtext}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            flexShrink: 0,
            marginTop: "1px",
          }}
        >
          {item.actionLabel && (
            <button
              type="button"
              onClick={() => {
                item.onAction?.();
                handleDismiss();
              }}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--accent-primary)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "2px 4px",
                lineHeight: 1,
              }}
            >
              [{item.actionLabel}]
            </button>
          )}

          <button
            type="button"
            aria-label="Dismiss toast"
            onClick={handleDismiss}
            style={{
              width: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
              background: "none",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* 4px Flat Vermilion Auto-Dismiss Progress Bar */}
      <div
        style={{
          width: "100%",
          height: "4px",
          backgroundColor: "var(--border-hairline)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            backgroundColor: "var(--accent-primary)",
            width: "100%",
            animation: `drainProgress ${duration}ms linear forwards`,
            animationPlayState: isPaused ? "paused" : "running",
          }}
          onAnimationEnd={handleDismiss}
        />
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (variant: ToastVariant, options: ToastOptions) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = {
        ...options,
        id,
        variant,
        createdAt: Date.now(),
      };

      setToasts((prev) => {
        // Enforce max 4 visible toasts (FIFO drop)
        const updated = [...prev, newToast];
        if (updated.length > 4) {
          return updated.slice(updated.length - 4);
        }
        return updated;
      });
    },
    []
  );

  const success = useCallback(
    (title: string | React.ReactNode, subtext?: string | React.ReactNode, options?: Partial<ToastOptions>) => {
      toast("success", { title, subtext, ...options });
    },
    [toast]
  );

  const error = useCallback(
    (title: string | React.ReactNode, subtext?: string | React.ReactNode, options?: Partial<ToastOptions>) => {
      toast("error", { title, subtext, duration: 6000, ...options });
    },
    [toast]
  );

  const info = useCallback(
    (title: string | React.ReactNode, subtext?: string | React.ReactNode, options?: Partial<ToastOptions>) => {
      toast("info", { title, subtext, ...options });
    },
    [toast]
  );

  const serving = useCallback(
    (title: string | React.ReactNode, subtext?: string | React.ReactNode, options?: Partial<ToastOptions>) => {
      toast("serving", { title, subtext, ...options });
    },
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toast, success, error, info, serving, dismiss }}>
      {children}
      {/* Toast Container bottom-right */}
      <aside
        aria-live="polite"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 60,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          width: "340px",
          maxWidth: "calc(100% - 32px)",
          pointerEvents: "auto",
        }}
      >
        <style>{`
          @keyframes toastEnter {
            from {
              opacity: 0;
              transform: translateY(16px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes drainProgress {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}</style>
        {toasts.map((t) => (
          <ToastComponent key={t.id} item={t} onDismiss={dismiss} />
        ))}
      </aside>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}

