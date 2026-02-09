"use client";

import { useState } from "react";
import { useSCredenceActions } from "@/lib/hooks/use-scredence";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from "./ui/dialog";
import { Plus, Loader2 } from "lucide-react";

export function RegisterIssuerModal() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { registerIssuer } = useSCredenceActions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await registerIssuer(name, category, (data) => {
        console.log("Transaction finished:", data);
        setIsSubmitting(false);
        // In a real app, we might wait for confirmation or optimistically update
        window.location.reload(); 
      });
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Register New Issuer
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">Register Organization</DialogTitle>
          <p className="text-sm text-muted-foreground text-center">
            Register your organization as an authorized proof issuer.
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-medium">Organization Name</label>
            <input
              id="name"
              className="rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. Andela"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="category" className="text-sm font-medium">Category</label>
            <input
              id="category"
              className="rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. Tech Training"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <DialogClose asChild>
               <button type="button" className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg">Cancel</button>
            </DialogClose>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-50 flex-1"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Registration"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
