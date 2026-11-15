import { Suspense } from "react";
import { AppShell } from "@/components/shell/AppShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div style={{ padding: "24px", color: "var(--text-muted)" }}>Loading Workspace...</div>}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
