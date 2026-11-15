"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

export default function LoginPage() {
  const router = useRouter();
  const { success } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const triggerShake = () => {
    if (cardRef.current && typeof cardRef.current.animate === "function") {
      cardRef.current.animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(-4px)" },
          { transform: "translateX(4px)" },
          { transform: "translateX(-3px)" },
          { transform: "translateX(3px)" },
          { transform: "translateX(0)" },
        ],
        { duration: 220, easing: "linear" }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed. Invalid credentials.");
      }

      success("Authenticated successfully", `Welcome back, ${data.manager?.name || "Manager"}`);
      router.push("/queues");
      router.refresh();
    } catch (err: unknown) {
      triggerShake();
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--bg-canvas)",
        padding: "24px 16px",
      }}
    >
      {/* 360px Center Login Card */}
      <div
        ref={cardRef}
        style={{
          width: "100%",
          maxWidth: "360px",
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-hairline)",
          borderRadius: "6px",
          overflow: "hidden",
          boxShadow: "none",
          animation: "cardEnter 180ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
      >
        <style>{`
          @keyframes cardEnter {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* Card Header */}
        <div
          style={{
            padding: "24px 24px 20px 24px",
            borderBottom: "1px solid var(--border-hairline)",
          }}
        >
          {/* Status node */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "14px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  backgroundColor: "var(--accent-primary)",
                  borderRadius: "2px",
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.01em",
                }}
              >
                QueueOS
              </span>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "2px 8px",
                borderRadius: "4px",
                backgroundColor: "var(--bg-canvas)",
                border: "1px solid var(--border-hairline)",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--status-serving-text)",
                fontWeight: 500,
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "var(--status-serving-text)",
                }}
              />
              Node 01 // Live
            </div>
          </div>

          <h1
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            Manager Console
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              marginTop: "4px",
              lineHeight: 1.4,
            }}
          >
            Enter credentials to access operational desk.
          </p>
        </div>

        {/* Card Body / Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: "20px 24px 24px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                padding: "10px 12px",
                backgroundColor: "var(--status-cancelled-bg)",
                border: "1px solid #FECACA",
                borderRadius: "4px",
                fontSize: "12px",
                color: "var(--status-cancelled-text)",
                lineHeight: 1.4,
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: "1px" }} />
              <span>{error}</span>
            </div>
          )}

          {/* Email input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              htmlFor="login-email"
              style={{
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                color: "var(--text-secondary)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Work Email
            </label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@rugas.io"
              style={{
                height: "36px",
                padding: "0 12px",
                backgroundColor: "var(--bg-input)",
                border: "1px solid var(--border-strong)",
                borderRadius: "4px",
                fontFamily: "var(--font-mono)",
                fontSize: "13px",
                color: "var(--text-primary)",
                outline: "none",
                transition: "border-color 120ms ease, background-color 120ms ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--border-focus)";
                e.target.style.backgroundColor = "var(--bg-surface)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border-strong)";
                e.target.style.backgroundColor = "var(--bg-input)";
              }}
            />
          </div>

          {/* Password input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              htmlFor="login-password"
              style={{
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                color: "var(--text-secondary)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  height: "36px",
                  padding: "0 36px 0 12px",
                  backgroundColor: "var(--bg-input)",
                  border: "1px solid var(--border-strong)",
                  borderRadius: "4px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                  color: "var(--text-primary)",
                  outline: "none",
                  transition: "border-color 120ms ease, background-color 120ms ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--border-focus)";
                  e.target.style.backgroundColor = "var(--bg-surface)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border-strong)";
                  e.target.style.backgroundColor = "var(--bg-input)";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  padding: "4px",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              height: "36px",
              marginTop: "4px",
              backgroundColor: "var(--accent-primary)",
              color: "var(--text-on-accent)",
              border: "none",
              borderRadius: "4px",
              fontSize: "13px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.8 : 1,
              transition: "background-color 120ms ease",
            }}
            onMouseOver={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = "var(--accent-primary-hover)";
            }}
            onMouseOut={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = "var(--accent-primary)";
            }}
          >
            {isLoading ? (
              <span style={{ display: "inline-flex", gap: "4px", alignItems: "center" }}>
                <span>Authenticating...</span>
              </span>
            ) : (
              <>
                <span>Sign In to Workspace</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>

          {/* Card footer link */}
          <div
            style={{
              textAlign: "center",
              marginTop: "4px",
              fontSize: "12px",
              color: "var(--text-secondary)",
            }}
          >
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              style={{
                color: "var(--accent-primary)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Create one
            </Link>
          </div>
        </form>
      </div>

      <div
        style={{
          marginTop: "16px",
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "var(--text-muted)",
          letterSpacing: "0.02em",
        }}
      >
        QueueOS Triage Architecture // Rugas Technologies
      </div>
    </div>
  );
}
