"use client";

import { useState } from "react";
import { Search, XCircle, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { useSCredence } from "@/lib/hooks/use-scredence";

export default function VerifyPage() {
  const [proofId, setProofId] = useState("");
  const [hash, setHash] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const { verifyProof } = useSCredence();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setResult(null);

    try {
      const data = await verifyProof(parseInt(proofId), hash);
      
      if (data && data.value && data.value.value) {
        // Success: Found proof
        const val = data.value.value;
        setResult({
          isValid: val["is-valid"].value,
          isRevoked: val["is-revoked"].value,
          isExpired: val["is-expired"].value,
          participant: val.participant.value,
          issuer: val.issuer.value,
          serviceType: val["service-type"].value.toString(),
          issuedAt: new Date(Number(val["issued-at"].value) * 1000).toLocaleDateString(),
        });
      } else {
        // Null result or error
        setResult({
          error: "Proof not found on-chain or invalid format.",
        });
      }
    } catch (error) {
      console.error(error);
      setResult({
        error: "Verification failed. Please check your connection.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex flex-col gap-8">
        <header className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Verify Service Proof
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Enter the unique credentials to verify authenticity on the Stacks blockchain.
          </p>
        </header>

        <section className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <form onSubmit={handleVerify} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="proofId" className="text-sm font-semibold text-foreground">
                  Proof ID
                </label>
                <input
                  id="proofId"
                  type="number"
                  placeholder="e.g. 1"
                  className="rounded-lg border border-border bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition text-foreground placeholder:text-muted-foreground"
                  value={proofId}
                  onChange={(e) => setProofId(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="hash" className="text-sm font-semibold text-foreground">
                  Credential Hash
                </label>
                <input
                  id="hash"
                  type="text"
                  placeholder="0x..."
                  className="rounded-lg border border-border bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition text-foreground placeholder:text-muted-foreground"
                  value={hash}
                  onChange={(e) => setHash(e.target.value)}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isVerifying}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Verify Authenticity
                </>
              )}
            </button>
          </form>
        </section>

        {result && (
          <section className="animate-in fade-in slide-in-from-top-4 duration-500">
            {result.error ? (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6 text-center text-destructive">
                <XCircle className="mx-auto h-12 w-12 text-destructive mb-3" />
                <h3 className="font-bold text-lg">Verification Failed</h3>
                <p className="mt-1">{result.error}</p>
              </div>
            ) : (
              <div className={`rounded-2xl border p-6 ${result.isValid ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-amber-500/20 bg-amber-500/10'}`}>
                <div className="flex items-center gap-4 mb-6">
                  {result.isValid ? (
                    <CheckCircle className="h-10 w-10 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="h-10 w-10 text-amber-500" />
                  )}
                  <div>
                    <h3 className={`text-xl font-bold ${result.isValid ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                      {result.isValid ? 'Valid Credential' : 'Invalid / Revoked'}
                    </h3>
                    <p className={`text-sm ${result.isValid ? 'text-emerald-600/80 dark:text-emerald-500/80' : 'text-amber-600/80 dark:text-amber-500/80'}`}>
                      Verified on Stacks Mainnet
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 text-sm">
                  <div>
                    <p className="font-semibold text-muted-foreground uppercase tracking-wide text-xs">Participant</p>
                    <p className="mt-1 font-medium text-foreground truncate">{result.participant}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-muted-foreground uppercase tracking-wide text-xs">Issuer</p>
                    <p className="mt-1 font-medium text-foreground truncate">{result.issuer}</p>
                  </div>
                  {result.serviceType && (
                    <div>
                      <p className="font-semibold text-muted-foreground uppercase tracking-wide text-xs">Service Type</p>
                      <p className="mt-1 font-medium text-foreground">{result.serviceType}</p>
                    </div>
                  )}
                  {result.issuedAt && (
                    <div>
                      <p className="font-semibold text-muted-foreground uppercase tracking-wide text-xs">Issued Date</p>
                      <p className="mt-1 font-medium text-foreground">{result.issuedAt}</p>
                    </div>
                  )}
                  {result.isRevoked && (
                    <div className="col-span-full mt-2 pt-4 border-t border-amber-500/20">
                      <p className="font-semibold text-amber-700 dark:text-amber-400">Revocation Status</p>
                      <p className="mt-1 text-amber-600 dark:text-amber-300">This credential has been explicitly revoked by the issuer.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
