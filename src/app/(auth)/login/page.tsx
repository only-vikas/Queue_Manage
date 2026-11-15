"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to log in");
      }

      router.push("/queues");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__header">
          <div className="login-card__logo">QueueOS // Rugas Desk</div>
          <h1 className="login-card__title">Sign In</h1>
          <p className="login-card__subtitle">Enter your manager credentials to access the queue desk</p>
        </div>

        <form onSubmit={handleSubmit} className="login-card__body">
          {error && <div className="input-error">{error}</div>}

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
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="input mono"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "8px" }}
          >
            {isLoading ? "Signing In..." : "Enter Workspace"}
            <ArrowRight size={14} />
          </button>

          <div style={{ textAlign: "center", marginTop: "12px", fontSize: "13px", color: "var(--text-secondary)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" style={{ color: "var(--accent-primary)", fontWeight: 600, textDecoration: "none" }}>
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

