import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthGuard from "@/components/AuthGuard";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "ETHOSS.IN | Handcrafted Minimalist Jewellery",
  description: "100% Handcrafted jewellery from Kerala. Minimalist. Sustainable. Built to last.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased bg-background text-primary overflow-x-hidden selection:bg-primary/10">
        {/* Navbar */}
        <Navbar />

        {/* Global role-based route guard */}
        <AuthGuard>
          <main className="relative min-h-[100svh] w-full flex flex-col">
            {children}
          </main>
        </AuthGuard>

        {/* Footer — hidden on admin routes */}
        <Footer />

        {/* Bottom Navigation — mobile only, non-admin routes */}
        <BottomNavigation />

        {/* Mobile-friendly Toaster */}
        <Toaster 
          position="bottom-center" 
          toastOptions={{
            style: {
              background: 'var(--background)',
              color: 'var(--primary)',
              border: '1px solid rgba(var(--primary-rgb), 0.1)',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            },
          }}
        />
      </body>
    </html>
  );
}