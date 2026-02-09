# Project Issues - SCredence (Service Verification Protocol)

This document outlines the roadmap and tasks for building the Bitcoin-anchored service verification protocol.

## Smart Contract Issues

### Issuer Management

#### Issue #1: Implement Issuer Registration
**Priority:** High  
**Status:** ✅ Completed  
**Description:** Enable the contract owner to register and manage authorized issuers.

---

### Service Proofs

#### Issue #2: Implement Proof Issuance
**Priority:** High  
**Status:** ✅ Completed  
**Description:** Allow authorized issuers to create immutable service verification records.

#### Issue #3: Implement Proof Verification
**Priority:** High  
**Status:** ✅ Completed  
**Description:** Public functions to verify the authenticity of a credential hash.

---

### Security & Controls

#### Issue #4: Proof Revocation Mechanism
**Priority:** High  
**Status:** ✅ Completed  
**Description:** Enable issuers to revoke proofs in case of errors or fraudulent information.
- **Tasks:**
  - [x] Add `revoked-proofs` map.
  - [x] Implement `revoke-service-proof` function.
  - [x] Update verification logic to check for revocation status.

#### Issue #5: Proof Expiration & Renewal
**Priority:** Medium  
**Status:** ✅ Completed  
**Description:** Support time-limited credentials that can be renewed by issuers.
- **Tasks:**
  - [x] Add `expiry-date` to `service-proofs` map.
  - [x] Update `issue-service-proof` to handle expiry validation.
  - [x] Implement `renew-service-proof` function.
  - [x] Update verification logic to check for expiration.

---

## Frontend Issues

### Wallet & Identity

#### Issue #6: Stacks Wallet Integration
**Priority:** High  
**Status:** ✅ Completed  
**Description:** Connect Leather/Xverse wallets to the dApp.

#### Issue #7: Issuer Dashboard
**Priority:** High  
**Status:** ✅ Completed  
**Description:** Interface for authorized organizations to issue and manage proofs.

#### Issue #8: Implement Proof Verification UI
**Priority:** High  
**Status:** ✅ Completed  
**Description:** Create a public verification interface for checking credential authenticity.

#### Issue #9: Smart Contract Mainnet Deployment
**Priority:** Critical  
**Status:** ✅ Completed  
**Description:** Deploy the finalized smart contracts to Stacks Mainnet.
- **Tasks:**
  - [x] Configure `Clarinet.toml` for Mainnet deployment.
  - [x] Rename contracts to `alpha` version.
  - [x] Execute deployment plan.
  - [x] Verify contract on Stacks Explorer.

#### Issue #10: Frontend Branding & Theme Update (Orange Scheme)
**Priority:** Medium  
**Status:** ❌ Pending  
**Description:** Align the dApp design with the Stacks ecosystem by adopting the official Orange color palette.
- **Tasks:**
  - [ ] Update Tailwind config with Stacks Orange primary colors.
  - [ ] Refactor components (`Navbar`, `Buttons`, `Cards`) to use the new theme.
  - [ ] Ensure dark mode compatibility.

#### Issue #11: Frontend-Contract Integration & Mobile Responsiveness
**Priority:** High  
**Status:** ❌ Pending  
**Description:** Connect the UI to the deployed contracts and ensure a mobile-first experience.
- **Tasks:**
  - [ ] Integrate `useStacks` with contract calls (issue, verify, revoke).
  - [ ] Optimize `IssuerDashboard` for mobile viewports.
  - [ ] Optimize `ProofVerification` page for mobile.
