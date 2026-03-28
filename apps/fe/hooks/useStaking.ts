import { useState, useEffect, useCallback } from 'react';
import { useProgram, PROGRAM_ID } from './useProgram';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import { BN } from '@coral-xyz/anchor';
import toast from 'react-hot-toast';

export function useStaking() {
  const { program } = useProgram();
  const { publicKey } = useWallet();
  const [poolState, setPoolState] = useState<any>(null);
  const [userStake, setUserStake] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  const fetchState = useCallback(async () => {
    if (!program) return;

    try {
      const [poolPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('pool')],
        PROGRAM_ID
      );

      const pState = await program.account.poolState.fetchNullable(poolPda);
      setPoolState(pState);

      if (publicKey) {
        const [userPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('user'), publicKey.toBuffer()],
          PROGRAM_ID
        );
        const uState = await program.account.userStake.fetchNullable(userPda);
        setUserStake(uState);

        try {
          if (pState) {
            const userAta = await getAssociatedTokenAddress(pState.rewardMint, publicKey);
            const acc = await getAccount(program.provider.connection, userAta);
            setWalletBalance(Number(acc.amount) / 1e9);
          } else {
            setWalletBalance(0);
          }
        } catch {
          setWalletBalance(0);
        }
      } else {
        setUserStake(null);
        setWalletBalance(0);
      }
    } catch (e) {
      console.error("Error fetching state:", e);
    }
  }, [program, publicKey, refreshTrigger]);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  const refreshState = () => setRefreshTrigger(prev => prev + 1);

  const stake = async (amount: number) => {
    if (!program || !publicKey) {
      toast.error('Wallet not connected');
      return;
    }
    setLoading(true);
    let toastId;
    try {
      const lamports = new BN(amount * 1e9);

      toastId = toast.loading('Staking SOL...');

      await program.methods.stake(lamports)
        .accounts({ user: publicKey })
        .rpc();

      toast.success('Successfully staked SOL!', { id: toastId });
      refreshState();
    } catch (e: any) {
      toast.error(`Stake failed: ${e.message}`, { id: toastId });
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const requestUnstake = async (amount: number) => {
    if (!program || !publicKey) return;
    setLoading(true);
    let toastId = toast.loading('Requesting unstake...');
    try {
      const lamports = new BN(amount * 1e9);

      await program.methods.requestUnstake(lamports)
        .accounts({ user: publicKey })
        .rpc();

      toast.success('Unstake requested! 24h lockup started.', { id: toastId });
      refreshState();
    } catch (e: any) {
      toast.error(`Request failed: ${e.message}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const withdrawUnstake = async () => {
    if (!program || !publicKey) return;
    setLoading(true);
    let toastId = toast.loading('Withdrawing SOL...');
    try {

      await program.methods.withdrawUnstake()
        .accounts({ user: publicKey })
        .rpc();

      toast.success('SOL withdrawn successfully!', { id: toastId });
      refreshState();
    } catch (e: any) {
      toast.error(`Withdraw failed: ${e.message}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const claimRewards = async () => {
    if (!program || !publicKey) return;

    setLoading(true);
    let toastId = toast.loading('Claiming Rewards...');
    try {
      const [poolPda] = PublicKey.findProgramAddressSync([Buffer.from('pool')], PROGRAM_ID);
      const [rewardVaultPda] = PublicKey.findProgramAddressSync([Buffer.from('reward_vault')], PROGRAM_ID);

      const poolStateData = await program.account.poolState.fetch(poolPda);
      const userRewardAta = await getAssociatedTokenAddress(
        poolStateData.rewardMint,
        publicKey
      );

      const tx = new Transaction();

      try {
        await getAccount(program.provider.connection, userRewardAta);
      } catch (err: any) {
        if (err.name === 'TokenAccountNotFoundError' || err.message.includes('could not find account')) {
          tx.add(
            createAssociatedTokenAccountInstruction(
              publicKey,
              userRewardAta,
              publicKey,
              poolStateData.rewardMint
            )
          );
        } else {
          console.warn("Error checking ATA:", err);
        }
      }

      const claimIx = await program.methods.claimRewards()
        .accounts({
          user: publicKey,
          rewardVault: rewardVaultPda,
          userRewardAccount: userRewardAta,
        })
        .instruction();

      tx.add(claimIx);

      await (program.provider as any).sendAndConfirm(tx, []);

      toast.success('Rewards claimed successfully!', { id: toastId });
      refreshState();
    } catch (error: any) {
      console.error("Claim error:", error);
      toast.error(`Claim failed: ${error.message}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return {
    poolState,
    userStake,
    walletBalance,
    loading,
    stake,
    requestUnstake,
    withdrawUnstake,
    claimRewards,
    refreshState
  };
}
