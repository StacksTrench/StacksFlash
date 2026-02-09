"use client";

import { WalletPanel } from "./components/wallet-panel";
import { useStacks } from "@/lib/hooks/use-stacks";
import Link from "next/link";
import { ShieldCheck, Search, ArrowRight, FileCheck, Info } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { isConnected } = useStacks();

  const features = [
    {
      title: "Issuer Dashboard",
      desc: "Organizations can register and manage official service verification records.",
      href: "/issuers",
      icon: ShieldCheck,
      color: "bg-orange-500",
    },
    {
      title: "Verify Proof",
      desc: "Anyone can instantly verify the authenticity of a credential hash on-chain.",
      href: "/verify",
      icon: Search,
      color: "bg-blue-500",
    },
    {
      title: "My Proofs",
      desc: "View and manage all service verifications associated with your identity.",
      href: "/proofs",
      icon: FileCheck,
      color: "bg-emerald-500",
    }
  ];

  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16 md:py-24 relative z-10">
        <header className="flex flex-col gap-4 max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 w-fit"
          >
            <Info className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Protocol v1.0 Live
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight text-foreground"
          >
            {isConnected ? (
              <>Welcome back to <span className="text-primary italic">SCredence</span></>
            ) : (
              <>Trustless <span className="text-primary italic text-6xl md:text-8xl block">Verification</span></>
            )}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground leading-relaxed"
          >
            {isConnected 
              ? "Your identity is connected. Explore the dashboard or verify a new credential instantly."
              : "The Bitcoin-anchored service verification protocol. Issue, manage, and verify immutable proofs on Stacks."}
          </motion.p>
        </header>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {isConnected ? (
            features.map((feat, idx) => (
              <Link 
                key={feat.href}
                href={feat.href}
                className="group relative flex flex-col gap-4 p-8 rounded-[32px] border border-border bg-card hover:border-primary/50 transition-all shadow-sm overflow-hidden"
              >
                <div className={`w-12 h-12 ${feat.color}/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform`}>
                  <feat.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  Open Tool <ArrowRight className="w-3 h-3" />
                </div>
                
                {/* Shape Morph Detail */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
              </Link>
            ))
          ) : (
            <div className="col-span-full">
              <div className="p-8 md:p-12 rounded-[40px] border border-border bg-card shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                <WalletPanel />
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
