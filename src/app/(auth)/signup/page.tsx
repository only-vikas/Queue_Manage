"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

export default function SignupPage() {
  const router = useRouter();
  const { success } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate password strength (0 to 4)
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = calculateStrength(password);
  const strengthLabels = ["Empty", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["#E4E3DD", "#B91C1C", "#EA580C", "#D97706", "#166534"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          workspaceName: workspaceName.trim() || `${name.trim()}'s Desk`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize account");
      }

      success("Account created successfully", `Workspace initialized for ${data.manager?.name}`);
      router.push("/queues");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Account creation failed");
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
      <div
        style={{
          width: "100%",
          maxWidth: "380px",
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Image
                src="/logo.png"
                alt="QueueOS Logo"
                width={26}
                height={26}
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
                color: "var(--text-secondary)",
                fontWeight: 500,
              }}
            >
              <ShieldCheck size={12} style={{ color: "var(--status-serving-text)" }} />
              Provisioning
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
            Create Manager Account
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              marginTop: "4px",
              lineHeight: 1.4,
            }}
          >
            Set up manager profile and command workspace.
          </p>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: "20px 24px 24px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
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

          {/* Full Name */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label
              htmlFor="signup-name"
              style={{
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                color: "var(--text-secondary)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Full Name
            </label>
            <input
              id="signup-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. Elena Vance"
              style={{
                height: "36px",
                padding: "0 12px",
                backgroundColor: "var(--bg-input)",
                border: "1px solid var(--border-strong)",
                borderRadius: "4px",
                fontSize: "13px",
                color: "var(--text-primary)",
                outline: "none",
                transition: "border-color 120ms ease",
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

          {/* Work Email */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label
              htmlFor="signup-email"
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
              id="signup-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.vance@rugas.io"
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
                transition: "border-color 120ms ease",
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

          {/* Password with 4-segment strength indicator */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <label
                htmlFor="signup-password"
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
              {password.length > 0 && (
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    fontWeight: 600,
                    color: strengthColors[strength],
                    textTransform: "uppercase",
                  }}
                >
                  {strengthLabels[strength]}
                </span>
              )}
            </div>
            <div style={{ position: "relative" }}>
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters..."
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
                  transition: "border-color 120ms ease",
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

            {/* 4-segment strength bar */}
            {password.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "4px", marginTop: "4px" }}>
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    style={{
                      height: "3px",
                      borderRadius: "1px",
                      backgroundColor:
                        strength >= step ? strengthColors[strength] : "var(--border-hairline)",
                      transition: "background-color 150ms ease",
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Workspace Name */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label
              htmlFor="signup-workspace"
              style={{
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                color: "var(--text-secondary)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Workspace / Station Name
            </label>
            <input
              id="signup-workspace"
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="e.g. OPD Triage Station 01"
              style={{
                height: "36px",
                padding: "0 12px",
                backgroundColor: "var(--bg-input)",
                border: "1px solid var(--border-strong)",
                borderRadius: "4px",
                fontSize: "13px",
                color: "var(--text-primary)",
                outline: "none",
                transition: "border-color 120ms ease",
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

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              height: "36px",
              marginTop: "6px",
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
              <span>Initializing Workspace...</span>
            ) : (
              <>
                <span>Initialize Workspace</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>

          {/* Footer Link */}
          <div
            style={{
              textAlign: "center",
              marginTop: "4px",
              fontSize: "12px",
              color: "var(--text-secondary)",
            }}
          >
            Already have an account?{" "}
            <Link
              href="/login"
              style={{
                color: "var(--accent-primary)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Sign In
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
