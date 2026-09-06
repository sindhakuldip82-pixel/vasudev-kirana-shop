// Admin routes reuse the root layout's providers (Language/Cart) but skip the
// customer Header/BottomNav -- see src/components/AppShell.tsx, which detects
// the /admin path and renders children directly instead of the shop chrome.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
