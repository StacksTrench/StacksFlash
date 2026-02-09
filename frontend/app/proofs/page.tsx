"use client";

import { useStacks } from "@/lib/hooks/use-stacks";
import { FileCheck, ExternalLink, Calendar, User } from "lucide-react";

export default function ProofsPage() {
  const { isConnected } = useStacks();

  const mockProofs = [
    {
      id: "1",
      type: "Internship",
      issuer: "Andela Nigeria",
      issuedAt: "2024-01-15",
      status: "Active",
      hash: "0x123...abc",
    },
    {
      id: "3",
      type: "Certification",
      issuer: "HNG Internship",
      issuedAt: "2024-11-20",
      status: "Active",
      hash: "0x789...xyz",
    },
  ];

  if (!isConnected) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-20 text-center">
        <FileCheck className="mx-auto h-16 w-16 text-muted-foreground mb-4 opacity-20" />
        <h1 className="text-3xl font-bold text-foreground mb-4">Your Proofs</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Connect your wallet to view and manage your service verification proofs.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex flex-col gap-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            My Service Proofs
          </h1>
          <p className="mt-1 text-lg text-muted-foreground">
            View all immutable verifications associated with your wallet.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockProofs.map((proof) => (
            <div 
              key={proof.id}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-4 hover:border-primary/50 transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <FileCheck className="h-5 w-5" />
                </div>
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20">
                  {proof.status}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-foreground text-lg">{proof.type}</h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <User className="h-3 w-3" />
                  {proof.issuer}
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t border-border mt-auto">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Issued: {proof.issuedAt}
                  </div>
                  <div className="font-mono text-primary/70">ID: #{proof.id}</div>
                </div>
                <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition hover:bg-secondary/80">
                  View Certificate
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
