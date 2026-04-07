"use client";

import { useRouter } from "next/navigation";
import { MessageCircle, Camera, ArrowLeft } from "lucide-react";

export default function BespokeStudioPage() {
  const router = useRouter();

  return (
    <div className="min-h-[100svh] bg-background flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-1000">
      <div className="max-w-md w-full space-y-12">
        {/* Aesthetic Icon/Logo placeholder */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/5 rounded-full animate-pulse" />
            <div className="text-4xl font-serif text-primary/20">E</div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-serif text-primary uppercase tracking-widest leading-tight">
            The Bespoke Studio <br /> is brewing.
          </h1>
          <p className="text-primary/60 text-sm md:text-base uppercase tracking-[0.2em] leading-relaxed">
            We are currently crafting our customization experience. It will be live soon.
          </p>
        </div>

        <div className="space-y-6 pt-8 border-t border-primary/10">
          <p className="text-[10px] tracking-[0.3em] uppercase text-primary/40 font-bold">
            Want a customized piece right now? <br /> Drop us a message:
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <a 
              href="https://wa.me/919497716349" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-3 bg-[#25D366] text-white py-4 px-8 rounded-full text-xs font-bold tracking-[0.2em] uppercase transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-green-500/20"
            >
              <MessageCircle size={18} fill="currentColor" /> WhatsApp
            </a>
            
            <a 
              href="https://www.instagram.com/ethoss.in" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white py-4 px-8 rounded-full text-xs font-bold tracking-[0.2em] uppercase transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-pink-500/20"
            >
              <Camera size={18} /> Instagram
            </a>
          </div>
        </div>

        <button 
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.4em] uppercase text-primary/60 hover:text-primary transition-colors group pt-4"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>
      </div>
      
      {/* Decorative background element */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-primary/[0.02] rounded-full blur-3xl pointer-events-none -z-10" />
    </div>
  );
}
