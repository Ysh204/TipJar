"use client";

import { useMemo } from 'react';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import idl from '../../lib/idl/staking_contract_solana.json';
import { PublicKey } from '@solana/web3.js';
import type { StakingContractSolana } from "../../lib/idl/staking_contract_solana"

export const PROGRAM_ID = new PublicKey(idl.address);

export function useProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const provider = useMemo(() => {
    if (!wallet) return null;
    return new AnchorProvider(connection, wallet, { commitment: 'confirmed' });
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    return new Program<StakingContractSolana>(idl as StakingContractSolana, provider);
  }, [provider]);

  return { program, provider };
}
