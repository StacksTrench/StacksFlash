"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStacks } from "@/lib/hooks/use-stacks";

import { ThemeToggle } from "./ui/theme-toggle";
import { Home, ShieldCheck, FileCheck, Search, ChevronDown, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function Navbar() {
  const pathname = usePathname();
  const { isConnected, stxAddress, connect, disconnect } = useStacks();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Issuers", href: "/issuers", icon: ShieldCheck },
    { name: "Proofs", href: "/proofs", icon: FileCheck },
    { name: "Verify", href: "/verify", icon: Search },
  ];

  function formatAddress(address?: string | null) {
    if (!address) return "";
    return `${address.slice(0, 5)}…${address.slice(address.length - 5)}`;
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 h-16">
        {/* Logo - Left */}
        <Link href="/" className="text-xl font-bold tracking-tight text-primary shrink-0">
          SCredence
        </Link>

        {/* Navigation - Center */}
        <div className="hidden md:flex items-center gap-1 bg-secondary/50 p-1 rounded-full border border-border/50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isActive 
                    ? "bg-background text-primary shadow-sm ring-1 ring-border/50" 
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Actions - Right */}
        <div className="flex items-center gap-4 shrink-0">
          <ThemeToggle />
          {isConnected ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors border border-border shadow-sm group">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="font-mono text-xs text-foreground text-nowrap">
                    {formatAddress(stxAddress)}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/proofs" className="flex items-center gap-2 cursor-pointer">
                    <FileCheck className="w-4 h-4" />
                    My Proofs
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={disconnect}
                  className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              type="button"
              onClick={connect}
              className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-95"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
