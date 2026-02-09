"use client";

import { useStacks } from "@/lib/hooks/use-stacks";
import { useSCredence } from "@/lib/hooks/use-scredence";
import { ShieldCheck, Users, ExternalLink, Loader2, Info } from "lucide-react";
import { RegisterIssuerModal } from "../components/register-issuer-modal";
import { useEffect, useState } from "react";

export default function IssuersPage() {
  const { isConnected, stxAddress } = useStacks();
  const { getIssuerInfo } = useSCredence();
  const [myIssuerData, setMyIssuerData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isConnected && stxAddress) {
      setIsLoading(true);
      getIssuerInfo(stxAddress).then(data => {
        if (data && data.value) {
          setMyIssuerData(data.value.value);
        }
        setIsLoading(false);
      });
    }
  }, [isConnected, stxAddress, getIssuerInfo]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Issuer Dashboard
            </h1>
            <p className="mt-1 text-lg text-muted-foreground">
              Manage authorized organizations and issue service proofs.
            </p>
          </div>
          {isConnected && <RegisterIssuerModal />}
        </header>

        {/* My Organization Section (Real Data) */}
        {isConnected && (
          <section className="rounded-xl border border-primary/20 bg-primary/5 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Info className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-primary">My Organization Status</h2>
            </div>
            
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Checking registry...</span>
              </div>
            ) : myIssuerData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-background rounded-lg border border-border">
                  <p className="text-xs font-medium text-muted-foreground uppercase">Organization Name</p>
                  <p className="text-lg font-bold text-foreground mt-1">{myIssuerData.name.value}</p>
                </div>
                <div className="p-4 bg-background rounded-lg border border-border">
                  <p className="text-xs font-medium text-muted-foreground uppercase">Category</p>
                  <p className="text-lg font-bold text-foreground mt-1">{myIssuerData.category.value}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Your wallet <strong>{stxAddress?.slice(0, 6)}...{stxAddress?.slice(-4)}</strong> is not registered as an issuer.
              </p>
            )}
          </section>
        )}

        {/* Stats Grid (Mock) */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Issuers</p>
                <p className="text-2xl font-bold text-foreground">12</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Participants</p>
                <p className="text-2xl font-bold text-foreground">1,204</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Proofs</p>
                <p className="text-2xl font-bold text-foreground">45</p>
              </div>
            </div>
          </div>
        </div>

        {/* Global Registry (Mock) */}
        <section className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border bg-muted/50 px-6 py-4">
            <h2 className="font-semibold text-foreground">Registered Issuers (Network)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-muted-foreground">
              <thead className="bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-3">Organization</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Wallet</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { name: "Andela Nigeria", category: "Tech Training", status: "Active", wallet: "SP1Y...BWRQQJ9" },
                  { name: "Cisco Networking", category: "Certification", status: "Active", wallet: "SP3F...GY3WJQTM" },
                  { name: "HNG Internship", category: "Internship", status: "Active", wallet: "SP37...H4FHM06" },
                ].map((issuer, idx) => (
                  <tr key={idx} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{issuer.name}</td>
                    <td className="px-6 py-4">{issuer.category}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                        {issuer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{issuer.wallet}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary hover:text-primary/80">
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
