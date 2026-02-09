# Frontend Issues - SCredence (Service Verification Protocol)

This document tracks the UI/UX and contract integration tasks for the SCredence dApp.

---

## 🚀 Priority: High

### Issue #11: Smart Contract Integration (Logic)
**Status:** 🚧 IN PROGRESS  
**Labels:** `frontend`, `web3`, `integration`  
**Description:** Replace mock data with real blockchain interactions using `@stacks/connect`.
- **Tasks:**
  - [x] Implement `useSCredence` hook for reading contract state.
  - [x] Implement `useSCredenceActions` hook for executing transactions.
  - [x] Connect Issuer Dashboard to `register-issuer` and `issuers` map.
  - [x] Connect Verification page to `verify-proof` read-only function.
  - [ ] Connect My Proofs page to user-specific proof data.

### Issue #12: Mobile Responsiveness & UX Polish
**Status:** ❌ PENDING  
**Labels:** `ui/ux`, `design`  
**Description:** Ensure the dApp provides a premium experience across all device sizes.
- **Tasks:**
  - [ ] Optimize tables and cards for mobile viewports.
  - [ ] Add toast notifications for transaction success/failure.
  - [ ] Implement skeleton loaders for data fetching states.

---

## ✅ Completed Issues

### Issue #6: Stacks Wallet Integration
**Status:** ✅ COMPLETED  
**Description:** Integrated Leather/Xverse wallets with Mainnet support.

### Issue #7: Issuer Dashboard (UI Shell)
**Status:** ✅ COMPLETED  
**Description:** Built the interface for managing organizations.

### Issue #8: Proof Verification (UI Shell)
**Status:** ✅ COMPLETED  
**Description:** Created the public interface for credential checking.

### Issue #10: Stacks Orange Rebrand & Dark Mode
**Status:** ✅ COMPLETED  
**Description:** Applied official Stacks branding and implemented theme switching.
