import { openContractCall } from '@stacks/connect';
import { 
  AnchorMode, 
  PostConditionMode, 
  Cl,
  type PostCondition
} from '@stacks/transactions';
import { STACKS_NETWORK_CONFIG, SC_CONTRACTS } from './constants/contracts';

/**
 * Standard options for Stacks contract calls
 */
export const getSTXContractCallBasicOptions = (
  functionName: string,
  functionArgs: any[],
  postConditions: PostCondition[] = []
) => {
  return {
    contractAddress: SC_CONTRACTS.VERIFICATION.split('.')[0],
    contractName: SC_CONTRACTS.VERIFICATION.split('.')[1],
    functionName,
    functionArgs,
    network: STACKS_NETWORK_CONFIG,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
    postConditions,
  };
};

/**
 * Executes a contract call with standard UI feedback
 */
export const executeSCredenceAction = async (
  functionName: string,
  functionArgs: any[],
  onFinish: (data: any) => void,
  onCancel: () => void,
  postConditions: PostCondition[] = []
) => {
  const options = {
    ...getSTXContractCallBasicOptions(functionName, functionArgs, postConditions),
    onFinish,
    onCancel,
  };
  
  await openContractCall(options as any);
};
