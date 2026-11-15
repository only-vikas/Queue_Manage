"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [workspaceName, setWorkspaceName] = useState("Rugas Command Desk");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, workspaceName }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      router.push("/queues");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__header">
          <div className="login-card__logo">QueueOS // Rugas Desk</div>
          <h1 className="login-card__title">Create Manager Account</h1>
          <p className="login-card__subtitle">Initialize a new queue triage workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="login-card__body">
          {error && <div className="input-error">{error}</div>}

          <div className="input-group">
            <label className="input-label" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Taylor"
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="workspaceName">
              Workspace Name
            </label>
            <input
              id="workspaceName"
              type="text"
              className="input"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="e.g. Central Clinic Desk"
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="email">
              Manager Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="input mono"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="manager@rugas.io"
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">
              Password (min. 6 chars)
            </label>
            <input
              id="password"
              type="password"
              required
              className="input mono"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "8px" }}
          >
            {isLoading ? "Creating..." : "Initialize Desk"}
            <ArrowRight size={14} />
          </button>

          <div style={{ textAlign: "center", marginTop: "12px", fontSize: "13px", color: "var(--text-secondary)" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--accent-primary)", fontWeight: 600, textDecoration: "none" }}>
              Log In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

