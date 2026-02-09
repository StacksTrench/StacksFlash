# Smart Contract - SCredence Service Verification

This directory contains the Clarity smart contracts for SCredence, a Bitcoin-anchored verification system for professional service built on Stacks.

## Project Overview

SCredence allows:
- **Issuers**: Organizations, employers, and institutions to issue verified service records
- **Participants**: Individuals to own permanent, verifiable credentials on-chain
- **Verifiers**: Anyone to instantly verify service records without contacting issuers

## Technology Stack

- **Clarity 4**: Smart contract language for Stacks (latest version)
- **Clarinet**: Development and testing framework
- **Vitest**: Testing framework for contract tests
- **TypeScript**: For writing test files
- **@stacks/clarinet-sdk**: SDK for interacting with Clarinet simnet
- **@stacks/transactions**: For building Clarity values in tests (Cl.bool, Cl.uint, etc.)

## Contract Architecture

### service-verification.clar

The core contract that handles:

1. **Issuer Management**
   - Register authorized issuers (organizations, employers, institutions)
   - Revoke issuer authorization
   - Track issuer details and status

2. **Service Proof Issuance**
   - Issue immutable service records
   - Support multiple service types (internship, NYSC, volunteering, etc.)
   - Store cryptographic hash of credentials
   - Track service duration and dates

3. **Verification**
   - Public functions to verify any service proof
   - Validate credential hashes
   - Retrieve proof details

4. **Participant Management**
   - Track all proofs for each participant
   - Index proofs for efficient retrieval
   - Count total proofs per participant

## Service Types Supported

- **Internship** (`u1`) - Corporate internships, attachments
- **NYSC** (`u2`) - National Youth Service Corps primary assignment
- **Volunteering** (`u3`) - NGO and community service
- **Apprenticeship** (`u4`) - Trade and skill apprenticeships
- **Training** (`u5`) - Professional training programs
- **CDS** (`u6`) - Community Development Service (NYSC)

## Key Features

### Immutability
- Service proofs cannot be modified once issued
- Anchored to Bitcoin via Stacks for permanent record

### Cryptographic Verification
- Only hashes stored on-chain (privacy-preserving)
- Original documents stored off-chain
- Anyone can verify authenticity by comparing hashes

### Access Control
- Only contract owner can register/revoke issuers
- Only authorized issuers can issue proofs
- Anyone can read and verify proofs

### Event Emission
- All proof issuances emit events for indexing
- Enables building search/analytics on top

## Installation & Setup

### Prerequisites
- **Clarinet** - [Installation Guide](https://docs.hiro.so/clarinet/getting-started)
- **Node.js** 18+ and npm

### Install Dependencies

```bash
npm install
```

### Run Tests

```bash
npm run test
```

### Check Contract Syntax

```bash
clarinet check
```

### Interactive Console

```bash
clarinet console
```

## Contract Functions

### Admin Functions (Contract Owner Only)

#### register-issuer
Register a new authorized issuer.

```clarity
(contract-call? .service-verification register-issuer
  'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7  ;; issuer address
  "Andela Nigeria"                                 ;; name
  "Tech Training Organization"                     ;; organization-type
)
```

#### revoke-issuer
Revoke an issuer's authorization.

```clarity
(contract-call? .service-verification revoke-issuer
  'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7  ;; issuer address
)
```

### Issuer Functions (Authorized Issuers Only)

#### issue-service-proof
Issue a new service verification proof.

```clarity
(contract-call? .service-verification issue-service-proof
  'SP2ZD731ANQZT6J4K3F5N8A40ZXWXC1XFXHVVQFKE      ;; participant
  u1                                               ;; service-type (internship)
  0x1234567890abcdef...                            ;; credential-hash (32 bytes)
  u1640995200                                      ;; start-date (unix timestamp)
  u1656547200                                      ;; end-date (unix timestamp)
  u180                                             ;; duration-days
  (some "ipfs://Qm...")                            ;; metadata-uri (optional)
)
```

### Read-Only Functions (Public)

#### get-service-proof
Retrieve a service proof by ID.

```clarity
(contract-call? .service-verification get-service-proof u1)
```

#### verify-proof
Verify a proof by comparing hashes.

```clarity
(contract-call? .service-verification verify-proof
  u1                                    ;; proof-id
  0x1234567890abcdef...                 ;; expected-hash
)
```

#### is-authorized-issuer
Check if an address is an authorized issuer.

```clarity
(contract-call? .service-verification is-authorized-issuer
  'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7
)
```

#### get-participant-proof-count
Get total proofs for a participant.

```clarity
(contract-call? .service-verification get-participant-proof-count
  'SP2ZD731ANQZT6J4K3F5N8A40ZXWXC1XFXHVVQFKE
)
```

#### get-statistics
Get total issuers and proofs.

```clarity
(contract-call? .service-verification get-statistics)
```

## Data Structures

### Authorized Issuers

```clarity
{
  name: (string-ascii 100),
  organization-type: (string-ascii 50),
  authorized-at: uint,
  authorized-by: principal,
  is-active: bool
}
```

### Service Proofs

```clarity
{
  participant: principal,
  issuer: principal,
  service-type: uint,
  credential-hash: (buff 32),
  start-date: uint,
  end-date: uint,
  duration-days: uint,
  issued-at: uint,
  metadata-uri: (optional (string-ascii 256))
}
```

## Testing

We use Vitest with the Clarinet SDK for comprehensive contract testing.

### Test Structure

```
tests/
├── service-verification.test.ts    # Main contract tests
└── traits.test.ts                   # Trait tests (if applicable)
```

### Running Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test service-verification.test.ts

# Watch mode
npm run test -- --watch
```

### Test Coverage

- ✅ Issuer registration and revocation
- ✅ Service proof issuance
- ✅ Proof verification
- ✅ Access control (authorization checks)
- ✅ Error handling
- ✅ Data retrieval functions

## Deployment

### Testnet Deployment

1. **Configure Settings**

Edit `settings/Testnet.toml`:

```toml
[accounts.deployer]
mnemonic = "your testnet mnemonic here"
```

2. **Generate Deployment Plan**

```bash
clarinet deployments generate --testnet --low-cost
```

This creates `deployments/default.testnet-plan.yaml`.

3. **Review Plan**

Check the generated plan file to ensure correct configuration.

4. **Deploy**

```bash
clarinet deployment apply -p deployments/default.testnet-plan.yaml
```

### Mainnet Deployment

1. **Configure Settings**

Edit `settings/Mainnet.toml`:

```toml
[accounts.deployer]
mnemonic = "your mainnet mnemonic here"
```

2. **Generate Deployment Plan**

```bash
clarinet deployments generate --mainnet --medium-cost
```

3. **Review and Deploy**

⚠️ **IMPORTANT**: Triple-check all settings before mainnet deployment!

```bash
clarinet deployment apply -p deployments/default.mainnet-plan.yaml
```

## Integration Guide

### Frontend Integration

See [Frontend README](../frontend/README.md) for detailed integration examples.

Example contract call from frontend:

```typescript
import { openContractCall } from '@stacks/connect';
import { uintCV, principalCV, bufferCV, someCV, stringAsciiCV } from '@stacks/transactions';

// Issue a service proof
await openContractCall({
  contractAddress: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
  contractName: 'service-verification',
  functionName: 'issue-service-proof',
  functionArgs: [
    principalCV('SP2ZD731ANQZT6J4K3F5N8A40ZXWXC1XFXHVVQFKE'),
    uintCV(1),  // SERVICE_TYPE_INTERNSHIP
    bufferCV(Buffer.from('credential-hash-here')),
    uintCV(1640995200),
    uintCV(1656547200),
    uintCV(180),
    someCV(stringAsciiCV('ipfs://Qm...'))
  ],
  onFinish: (data) => console.log('Transaction:', data),
});
```

## Security Considerations

### Access Control
- Contract owner is set at deployment (tx-sender)
- Only owner can register/revoke issuers
- Only authorized issuers can issue proofs
- All proofs are public and verifiable

### Data Privacy
- Only hashes stored on-chain, not actual documents
- Metadata URIs are optional
- Participants control off-chain documents

### Immutability
- Proofs cannot be modified after issuance
- Issuer revocation doesn't affect existing proofs
- Consider implications carefully before issuing

## Roadmap

### Current Features
- ✅ Issuer registration and management
- ✅ Service proof issuance
- ✅ Proof verification
- ✅ Multiple service types

### Planned Features
- 📋 Multi-signature issuer authorization
- 📋 Proof expiration/renewal
- 📋 Proof revocation mechanism
- 📋 NFT-based credential representation
- 📋 Integration with decentralized identity standards

## Resources

- [Stacks Documentation](https://docs.stacks.co)
- [Clarity Language Reference](https://docs.hiro.so/clarity)
- [Clarinet Documentation](https://docs.hiro.so/clarinet)
- [Testing with Vitest](https://vitest.dev)

## Support

For issues and questions:
- Check test files for usage examples
- Review contract comments
- Open an issue on GitHub

---

**Built for trust, credibility, and opportunity on Bitcoin**
