"use client";

import { useState, useCallback } from 'react';
import { 
  Cl, 
  fetchCallReadOnlyFunction,
  parseContext,
  cvToJSON
} from '@stacks/transactions';
import { STACKS_NETWORK_CONFIG, SC_CONTRACTS } from '../constants/contracts';
import { useStacks } from './use-stacks';
import { executeSCredenceAction } from '../stacks-actions';

export function useSCredence() {
  const { stxAddress } = useStacks();
  const [loading, setLoading] = useState(false);

  const getIssuerInfo = useCallback(async (issuerAddress: string) => {
    try {
      const options = {
        contractAddress: SC_CONTRACTS.VERIFICATION.split('.')[0],
        contractName: SC_CONTRACTS.VERIFICATION.split('.')[1],
        functionName: 'get-issuer-info',
        functionArgs: [Cl.principal(issuerAddress)],
        network: STACKS_NETWORK_CONFIG,
        senderAddress: stxAddress || issuerAddress,
      };

      const result = await fetchCallReadOnlyFunction(options);
      return cvToJSON(result);
    } catch (error) {
      console.error("Error fetching issuer info:", error);
      return null;
    }
  }, [stxAddress]);

  const verifyProof = useCallback(async (proofId: number, credentialHash: string) => {
    try {
      const options = {
        contractAddress: SC_CONTRACTS.VERIFICATION.split('.')[0],
        contractName: SC_CONTRACTS.VERIFICATION.split('.')[1],
        functionName: 'verify-proof',
        functionArgs: [Cl.uint(proofId), Cl.buffer(Buffer.from(credentialHash.replace('0x', ''), 'hex'))],
        network: STACKS_NETWORK_CONFIG,
        senderAddress: stxAddress || 'SP2VEX0FTG7RWZXN2EPR22RNGP4EBK36JSD0BRW8Q', // Fallback for public check
      };

      const result = await fetchCallReadOnlyFunction(options);
      return cvToJSON(result);
    } catch (error) {
      console.error("Error verifying proof:", error);
      return null;
    }
  }, [stxAddress]);

  return {
    getIssuerInfo,
    verifyProof,
    loading
  };
}

export function useSCredenceActions() {
  const registerIssuer = async (orgName: string, category: string, onFinish: (data: any) => void) => {
    await executeSCredenceAction(
      'register-issuer',
      [Cl.stringAscii(orgName), Cl.stringAscii(category)],
      onFinish,
      () => console.log("Transaction cancelled")
    );
  };

  const issueProof = async (
    participant: string, 
    serviceType: number, 
    hash: string, 
    onFinish: (data: any) => void
  ) => {
    await executeSCredenceAction(
      'issue-service-proof',
      [
        Cl.principal(participant),
        Cl.uint(serviceType),
        Cl.buffer(Buffer.from(hash.replace('0x', ''), 'hex')),
        Cl.uint(Math.floor(Date.now() / 1000)), // start
        Cl.uint(Math.floor(Date.now() / 1000) + 86400 * 30), // end
        Cl.uint(30), // duration
        Cl.none(), // expiry
        Cl.none() // uri
      ],
      onFinish,
      () => console.log("Transaction cancelled")
    );
  };

  return {
    registerIssuer,
    issueProof
  };
}
