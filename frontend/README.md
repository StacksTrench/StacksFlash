# Frontend - SCredence Service Verification

Next.js web application for interacting with the SCredence service verification system on Stacks blockchain.

## Project Overview

This frontend application provides a user-friendly interface for:
- **Participants**: View and manage their service verification proofs
- **Issuers**: Issue new service proofs for completed internships, NYSC, volunteering, etc.
- **Verifiers**: Search and verify service records on-chain

## Technology Stack

- **Next.js 16+**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **@stacks/connect**: Wallet connection and authentication (Hiro, Xverse, etc.)
- **@stacks/transactions**: Transaction building, signing, and broadcasting

## Key Dependencies

### Blockchain Integration
- **@stacks/connect** (^7.2.0): Handles wallet connections, user authentication, and transaction signing
- **@stacks/transactions** (^7.2.0): Builds and manages Stacks transactions, contract calls, and data handling

### Core Framework
- **Next.js 16.0.8**: React framework with server-side rendering
- **React 19.2.1**: UI library
- **TypeScript 5**: Type safety

### Styling
- **Tailwind CSS 4**: Utility-first CSS framework

## Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with Navbar
│   ├── page.tsx           # Home page / Dashboard
│   ├── verify/            # Verification page
│   ├── issue/             # Issue proof page (for issuers)
│   └── profile/           # User profile with proofs
├── components/            # React components
│   ├── wallet-panel.tsx   # Wallet connection component
│   ├── proof-card.tsx     # Service proof display card
│   ├── issue-form.tsx     # Form to issue new proofs
│   ├── verify-form.tsx    # Form to verify proofs
│   └── ...
├── lib/                   # Utility libraries
│   ├── stacks-config.ts   # Stacks network configuration
│   └── contracts.ts       # Contract interaction helpers
├── hooks/                 # Custom React hooks
│   └── use-stacks.ts     # Wallet connection hook
└── public/                # Static assets
```

## Installation & Setup

### Prerequisites
- **Node.js** 18+ and npm
- **Stacks Wallet** - Hiro Wallet or Xverse browser extension

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
# Stacks Network Configuration
NEXT_PUBLIC_NETWORK=testnet  # or mainnet

# Contract Addresses (update after deployment)
NEXT_PUBLIC_CONTRACT_ADDRESS=SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7
NEXT_PUBLIC_CONTRACT_NAME=service-verification

# Optional: API endpoints for indexing
NEXT_PUBLIC_API_URL=https://api.scredence.com
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Key Features

### 1. Wallet Connection

Users connect their Stacks wallet (Hiro, Xverse) to interact with the blockchain.

**Implementation**: See `hooks/use-stacks.ts`

```typescript
import { useStacks } from '@/hooks/use-stacks';

function MyComponent() {
  const { address, connect, disconnect } = useStacks();
  
  return (
    <button onClick={connect}>
      {address ? `Connected: ${address}` : 'Connect Wallet'}
    </button>
  );
}
```

### 2. Issue Service Proof (Issuers Only)

Authorized issuers can create new service verification records.

**Key Function**: `issue-service-proof`

```typescript
import { openContractCall } from '@stacks/connect';
import { 
  uintCV, 
  principalCV, 
  bufferCV, 
  someCV, 
  stringAsciiCV 
} from '@stacks/transactions';

async function issueProof(participantAddress: string, serviceData: ServiceData) {
  await openContractCall({
    contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
    contractName: 'service-verification',
    functionName: 'issue-service-proof',
    functionArgs: [
      principalCV(participantAddress),
      uintCV(serviceData.serviceType),
      bufferCV(Buffer.from(serviceData.credentialHash, 'hex')),
      uintCV(serviceData.startDate),
      uintCV(serviceData.endDate),
      uintCV(serviceData.durationDays),
      someCV(stringAsciiCV(serviceData.metadataUri))
    ],
    onFinish: (data) => {
      console.log('Transaction successful:', data);
    }
  });
}
```

### 3. View Service Proofs (Participants)

Participants can view all their service verification records.

**Key Function**: `get-participant-proofs`

```typescript
import { callReadOnlyFunction } from '@stacks/transactions';

async function getParticipantProofs(address: string) {
  const result = await callReadOnlyFunction({
    contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
    contractName: 'service-verification',
    functionName: 'get-participant-proof-count',
    functionArgs: [principalCV(address)],
    network: /* your network config */,
    senderAddress: address,
  });
  
  return result;
}
```

### 4. Verify Service Proof

Anyone can verify the authenticity of a service proof.

**Key Function**: `verify-proof`

```typescript
async function verifyProof(proofId: number, expectedHash: string) {
  const result = await callReadOnlyFunction({
    contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
    contractName: 'service-verification',
    functionName: 'verify-proof',
    functionArgs: [
      uintCV(proofId),
      bufferCV(Buffer.from(expectedHash, 'hex'))
    ],
    network: /* your network config */,
    senderAddress: /* any address */,
  });
  
  return result;
}
```

## Service Types

The frontend should support these service types:

```typescript
export enum ServiceType {
  INTERNSHIP = 1,
  NYSC = 2,
  VOLUNTEERING = 3,
  APPRENTICESHIP = 4,
  TRAINING = 5,
  CDS = 6,
}

export const SERVICE_TYPE_LABELS = {
  [ServiceType.INTERNSHIP]: 'Internship',
  [ServiceType.NYSC]: 'NYSC',
  [ServiceType.VOLUNTEERING]: 'Volunteering',
  [ServiceType.APPRENTICESHIP]: 'Apprenticeship',
  [ServiceType.TRAINING]: 'Training',
  [ServiceType.CDS]: 'Community Development Service',
};
```

## User Flows

### For Participants

1. **Connect Wallet** - Connect Hiro or Xverse wallet
2. **View Dashboard** - See all service proofs
3. **Share Proof** - Generate shareable verification link
4. **Export Proof** - Download proof details (PDF/JSON)

### For Issuers

1. **Connect Wallet** - Connect as authorized issuer
2. **Verify Authorization** - Check if wallet is authorized issuer
3. **Issue Proof** - Fill form with service details
4. **Generate Hash** - Hash credential document
5. **Submit Transaction** - Issue proof on-chain
6. **Confirmation** - View transaction result

### For Verifiers (Employers, Institutions)

1. **Search Proof** - Enter proof ID or participant address
2. **View Details** - See proof information
3. **Verify Hash** - Upload document to compare hash
4. **Confirmation** - Get verification result

## Components

### Core Components

#### WalletPanel
Displays wallet connection status and user address.

```tsx
<WalletPanel />
```

#### ProofCard
Displays a single service proof with details.

```tsx
<ProofCard 
  proofId={1}
  serviceType={ServiceType.INTERNSHIP}
  issuer="Andela Nigeria"
  duration="6 months"
  issuedAt="2024-01-15"
/>
```

#### IssueForm
Form for issuers to create new service proofs.

```tsx
<IssueForm onSuccess={(proofId) => console.log('Issued:', proofId)} />
```

#### VerifyForm
Form for verifying existing proofs.

```tsx
<VerifyForm onVerify={(result) => console.log('Verification:', result)} />
```

## Styling

This project uses Tailwind CSS 4 for styling. Key design principles:

- **Clean & Professional** - Suitable for credentialing system
- **Accessible** - WCAG 2.1 AA compliant
- **Responsive** - Mobile-first design
- **Bitcoin/Stacks Branding** - Orange accents, professional palette

## State Management

The application uses React hooks and Context API for state:

- **WalletContext** - Manages wallet connection state
- **ProofContext** - Manages service proof data
- **IssuerContext** - Manages issuer authorization status

## Testing

```bash
# Run linter
npm run lint

# Type checking
npm run type-check

# Build check
npm run build
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Netlify

1. Push code to GitHub
2. Connect repository in Netlify
3. Set build command: `npm run build`
4. Set environment variables
5. Deploy

### Environment Variables for Production

Ensure these are set in your deployment platform:

```
NEXT_PUBLIC_NETWORK=mainnet
NEXT_PUBLIC_CONTRACT_ADDRESS=<your-mainnet-address>
NEXT_PUBLIC_CONTRACT_NAME=service-verification
```

## Integration with Backend (Future)

When backend API is available, integrate for:

- **Indexing** - Search proofs by participant, issuer, date range
- **Analytics** - Statistics on service types, issuers
- **Notifications** - Alert participants when proofs are issued
- **Metadata Storage** - IPFS/Arweave for proof documents

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Wallet Connection Issues

1. Ensure wallet extension is installed
2. Refresh page and try again
3. Check network (testnet vs mainnet)

### Transaction Failures

1. Verify you're on the correct network
2. Ensure sufficient STX for gas fees
3. Check contract address in environment variables

### Read-Only Function Errors

1. Verify contract is deployed on network
2. Check function arguments format
3. Ensure network configuration is correct

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Stacks.js Documentation](https://docs.hiro.so/stacks.js)
- [@stacks/connect Guide](https://docs.hiro.so/stacks.js/connect)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Contributing

See main [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

---

**Building trust on Bitcoin, one proof at a time**
