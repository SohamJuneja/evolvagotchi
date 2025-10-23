import { useWriteContract, useAccount } from 'wagmi';
import { ACHIEVEMENT_CONTRACT_ADDRESS, ACHIEVEMENT_ABI } from './achievementService';

/**
 * Custom hook for recording achievement-worthy actions
 */
export function useAchievements() {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();

  const recordFirstPet = (tokenId: bigint) => {
    if (!address) return;
    
    writeContract({
      address: ACHIEVEMENT_CONTRACT_ADDRESS as `0x${string}`,
      abi: ACHIEVEMENT_ABI,
      functionName: 'recordFirstPet',
      args: [address, tokenId],
    });
  };

  const recordFeed = (tokenId: bigint) => {
    if (!address) return;
    
    writeContract({
      address: ACHIEVEMENT_CONTRACT_ADDRESS as `0x${string}`,
      abi: ACHIEVEMENT_ABI,
      functionName: 'recordFeed',
      args: [address, tokenId],
    });
  };

  const recordPlay = (tokenId: bigint) => {
    if (!address) return;
    
    writeContract({
      address: ACHIEVEMENT_CONTRACT_ADDRESS as `0x${string}`,
      abi: ACHIEVEMENT_ABI,
      functionName: 'recordPlay',
      args: [address, tokenId],
    });
  };

  const recordEvolution = (tokenId: bigint, stage: bigint) => {
    if (!address) return;
    
    writeContract({
      address: ACHIEVEMENT_CONTRACT_ADDRESS as `0x${string}`,
      abi: ACHIEVEMENT_ABI,
      functionName: 'recordEvolution',
      args: [address, tokenId, stage],
    });
  };

  const recordRevival = (tokenId: bigint) => {
    if (!address) return;
    
    writeContract({
      address: ACHIEVEMENT_CONTRACT_ADDRESS as `0x${string}`,
      abi: ACHIEVEMENT_ABI,
      functionName: 'recordRevival',
      args: [address, tokenId],
    });
  };

  const recordPerfectStats = (tokenId: bigint) => {
    if (!address) return;
    
    writeContract({
      address: ACHIEVEMENT_CONTRACT_ADDRESS as `0x${string}`,
      abi: ACHIEVEMENT_ABI,
      functionName: 'recordPerfectStats',
      args: [address, tokenId],
    });
  };

  return {
    recordFirstPet,
    recordFeed,
    recordPlay,
    recordEvolution,
    recordRevival,
    recordPerfectStats,
  };
}
