import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "ETHOSS.IN | Handcrafted Minimalist Jewellery",
  description: "100% Handcrafted jewellery from Kerala. Minimalist. Sustainable. Built to last.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1", 
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

        {/* Main Content: 
          'min-h-[100svh]' ഉപയോഗിക്കുന്നത് മൊബൈൽ ബ്രൗസർ ബാറുകൾ കാരണം 
          കണ്ടന്റ് മറഞ്ഞുപോകാതിരിക്കാൻ സഹായിക്കും.
        */}
        <main className="relative min-h-[100svh] w-full flex flex-col">
          {children}
        </main>

        {/* Footer */}
        <Footer />

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