# Project Roadmap & Issues - StacksFlash ⚡

This document tracks the development of the StacksFlash protocol, including smart contracts and frontend integration.

---

## 🚀 Priority: Critical

### Issue #1: Core Flash Loan Logic
**Status:** ✅ COMPLETED
**Description:** Implement the base flash loan mechanism using a trait-based callback pattern.
- **Tasks:**
  - [x] Define `flash-borrower-trait`.
  - [x] Implement `flash-loan` function with optimistic transfer and repayment check.
  - [x] Add fee calculation logic.

### Issue #2: Fee Management System
**Status:** ✅ COMPLETED
**Description:** Allow protocol admins to manage and withdraw accumulated fees.
- **Tasks:**
  - [x] Implement `withdraw-fees` function.
  - [x] Add access control for admin-only functions.

### Issue #3: Security Hardening (Reentrancy)
**Status:** ❌ PENDING
**Description:** Protect the protocol against reentrancy attacks during the callback execution.
- **Tasks:**
  - [ ] Implement a reentrancy guard (mutex lock).
  - [ ] Add tests for reentrancy scenarios.

---

## 🛠️ Smart Contract Tasks

### Issue #4: Liquidity Pools
**Status:** ❌ PENDING
**Description:** Allow users to provide liquidity to the flash loan pool and earn a share of the fees.
- **Tasks:**
  - [ ] Implement `provide-liquidity` with `lp-token` minting.
  - [ ] Implement `remove-liquidity` with pro-rata share calculation.
  - [ ] Update fee distribution to accrue to the pool.

### Issue #5: Multi-Asset Support
**Status:** ❌ PENDING
**Description:** Expand the protocol to support any SIP-010 token, not just STX.
- **Tasks:**
  - [ ] Refactor `flash-loan` to accept a token trait.
  - [ ] Create a map for per-token liquidity pools.

---

## 🎨 Frontend Tasks

### Issue #6: Liquidity Provider Dashboard
**Status:** ❌ PENDING
**Description:** Create a UI for LPs to manage their positions.
- **Tasks:**
  - [ ] Connect wallet (Leather/Xverse).
  - [ ] Display current pool APY and TVL.
  - [ ] Build Deposit/Withdraw interface.

### Issue #7: Arbitrage Scanner (Advanced)
**Status:** ❌ PENDING
**Description:** A tool to visualize potential arbitrage opportunities across Stacks DEXs (Alex, Arkadiko).
- **Tasks:**
  - [ ] Fetch prices from major DEXs.
  - [ ] Calculate potential flash loan profit.

---

## ✅ Completed Milestones
- [x] Project Scaffold (Frontend + Contracts)
- [x] Initial Contract Deployment Strategy
- [x] Basic Documentation
