"use client";

// ============================================================
// AuthGuard is now a passthrough component.
// All authentication is handled by NextAuth (SessionProvider).
// Admin route protection is handled by src/app/admin/layout.tsx.
// This component is kept only as a wrapper to avoid breaking
// the layout.tsx structure.
// ============================================================

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
