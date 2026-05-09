import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthGuard from "@/components/AuthGuard";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Toaster } from "sonner";

import Providers from "@/components/Providers";
import CartSync from "@/components/CartSync";

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
        <Providers>
          <CartSync />
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
                background: '#1e3a8a',
                color: '#ffffff',
                border: 'none',
                fontSize: '11px',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.1em',
                borderRadius: '16px',
                padding: '14px 20px',
                boxShadow: '0 8px 30px rgba(30, 58, 138, 0.25)',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}