import { decodeTokenMetadata, getSolanaMetadataAddress } from '@nfteyez/sol-rayz';
import * as anchor from '@project-serum/anchor'
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';
import { TOKEN_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token';
import { Connection, PublicKey, Keypair, Commitment, ConnectionConfig, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js';

import {
  PROGRAM_ID,
  KEYPAIR,
  POOL_SEED,
  BID_SEED,
  CLUSTER_API
} from '../../config/dev'
import { IDL } from '../../constants/idl';
import { makeATokenAccountTransaction, makeTransaction } from '../solana/connection';

import { SolanaClient, SolanaClientProps } from '../solana';

const connection = new Connection(CLUSTER_API, {
  skipPreflight: true,
  preflightCommitment: 'confirmed' as Commitment,
} as ConnectionConfig);
const ADMIN_WALLET = Keypair.fromSeed(Uint8Array.from(KEYPAIR).slice(0, 32));
const solanaClient = new SolanaClient({ rpcEndpoint: CLUSTER_API } as SolanaClientProps)

export const getProvider = () => {
  return new anchor.Provider(connection, new NodeWallet(ADMIN_WALLET), {
    skipPreflight: true,
    preflightCommitment: 'confirmed' as Commitment,
  } as ConnectionConfig);
}

export const getProgram = () => {
  const provider = getProvider();
  const program = new anchor.Program(IDL, new PublicKey(PROGRAM_ID), provider);
  return program;
}

export const makeListTx = async (price: number, accounts: { user: PublicKey, mint: PublicKey, tokenAccount: PublicKey }) => {
  try {
    const { user, mint, tokenAccount } = accounts;
    const program = getProgram();
    let instructions: any[] = [], signers: any[] = [];

    console.log('user', user.toString(), 'tokenAccount', tokenAccount.toString());
    let [pool, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(POOL_SEED), user.toBuffer(), mint.toBuffer()],
      new PublicKey(PROGRAM_ID)
    );

    // const wallets = [pool.toString()];
    // console.log('wallets========', wallets)
    // let nftList = await solanaClient.getAllCollectibles(wallets, [
    //   { updateAuthority: 'DuQbVfRugVnRkakZ7a6vowHEuhwFFQxg3DpPFPiiNadr', collectionName: 'TheElementies #' }
    // ]);

    // console.log('nftList', nftList)

    // const data = await program.account.pool.fetch(pool);
    // console.log('data', data.price.toString())
    // return;


    let lamportsPrice = price * LAMPORTS_PER_SOL;
    const priceHigh = Math.floor(lamportsPrice / LAMPORTS_PER_SOL);
    const priceLow = lamportsPrice % LAMPORTS_PER_SOL;

    const ataToTx = await makeATokenAccountTransaction(connection, user, pool, mint);
    instructions = [...instructions, ...ataToTx.instructions];
    signers = [...signers, ...ataToTx.signers];
    const nftTo = ataToTx.tokenTo;
    console.log('nftTo', nftTo)

    instructions.push(program.instruction.list(priceHigh, priceLow, bump, {
      accounts: {
        pool: pool,
        user: user,
        admin: ADMIN_WALLET.publicKey,
        mint: mint,
        tokenFrom: tokenAccount,
        tokenTo: nftTo,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId
      }
    }))
    signers.push(ADMIN_WALLET);
    const transaction = await makeTransaction(connection, instructions, signers, user);
    return transaction;
  }
  catch (error) {
    console.log('error', error);
  }

  return null;
}

export const makeUpdateListTx = async (price: number, accounts: { user: PublicKey, mint: PublicKey, tokenAccount: PublicKey }) => {
  try {
    const { user, mint, tokenAccount } = accounts;
    const program = getProgram();
    let instructions: any[] = [], signers: any[] = [];
    let [pool, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(POOL_SEED), user.toBuffer(), mint.toBuffer()],
      new PublicKey(PROGRAM_ID)
    );

    let lamportsPrice = price * LAMPORTS_PER_SOL;
    const priceHigh = Math.floor(lamportsPrice / LAMPORTS_PER_SOL);
    const priceLow = lamportsPrice % LAMPORTS_PER_SOL;

    instructions.push(program.instruction.updateList(priceHigh, priceLow, {
      accounts: {
        pool: pool,
        user: user,
        admin: ADMIN_WALLET.publicKey,
        mint: mint,
        tokenAccount: tokenAccount
      }
    }));
    signers.push(ADMIN_WALLET);
    const transaction = await makeTransaction(connection, instructions, signers, user);
    return transaction;
  }
  catch (error) {
    console.log('error', error);
  }
  return null;
}

export const makeCancelListTx = async (accounts: { user: PublicKey, mint: PublicKey, tokenAccount: PublicKey }) => {
  try {
    const { user, mint, tokenAccount } = accounts;
    const program = getProgram();
    let instructions: any[] = [], signers: any[] = [];

    let [pool, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(POOL_SEED), user.toBuffer(), mint.toBuffer()],
      new PublicKey(PROGRAM_ID)
    );

    const ataToTx = await makeATokenAccountTransaction(connection, user, user, mint);
    instructions = [...instructions, ...ataToTx.instructions];
    signers = [...signers, ...ataToTx.signers];
    const nftTo = ataToTx.tokenTo;
    console.log('nftTo', nftTo)

    instructions.push(program.instruction.cancelList({
      accounts: {
        pool: pool,
        user: user,
        admin: ADMIN_WALLET.publicKey,
        mint,
        tokenFrom: tokenAccount,
        tokenTo: nftTo,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId
      }
    }));
    signers.push(ADMIN_WALLET);
    const transaction = await makeTransaction(connection, instructions, signers, user);
    return transaction;
  }
  catch (error) {
    console.log('error', error);
  }
  return null;
}

export const makeBuyTx = async (accounts: { buyer: PublicKey, seller: PublicKey, mint: PublicKey, tokenFrom: PublicKey }) => {
  try {
    const { buyer, seller, mint, tokenFrom } = accounts;
    const program = getProgram();
    let instructions: any[] = [], signers: any[] = [];
    let [pool] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(POOL_SEED), seller.toBuffer(), mint.toBuffer()],
      new PublicKey(PROGRAM_ID)
    );

    const ataToTx = await makeATokenAccountTransaction(connection, buyer, buyer, mint);
    instructions = [...instructions, ...ataToTx.instructions];
    signers = [...signers, ...ataToTx.signers];

    const metadataAccount = await getSolanaMetadataAddress(mint);
    const data = await connection.getAccountInfo(metadataAccount);
    const metadata = await decodeTokenMetadata(data.data);

    let remainingAccounts: any[] = [];
    metadata.data.creators.forEach((creator: any) => {
      remainingAccounts.push({
        pubkey: creator.address,
        isWritable: true,
        isSigner: false
      });
    })

    console.log('ataToTx.tokenTo', ataToTx.tokenTo.toString())

    instructions.push(program.instruction.buy(0, {
      accounts: {
        pool: pool,
        buyer: buyer,
        admin: ADMIN_WALLET.publicKey,
        seller: seller,
        mint: mint,
        metadata: metadataAccount,
        tokenFrom: tokenFrom,
        tokenTo: ataToTx.tokenTo,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId
      },
      remainingAccounts: remainingAccounts
    }));
    signers.push(ADMIN_WALLET);
    const transaction = await makeTransaction(connection, instructions, signers, buyer);
    return transaction;
  }
  catch (error) {
    console.log('error', error);
  }
  return null;
}

export const makeBidTx = async (price: number, accounts: { bidder: PublicKey, seller: PublicKey, mint: PublicKey, tokenAccount: PublicKey, vault: Keypair }) => {
  try {
    const { bidder, seller, mint, tokenAccount, vault } = accounts;
    const program = getProgram();
    let instructions: any[] = [], signers: any[] = [];
    let [bidPda, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(BID_SEED), bidder.toBuffer(), mint.toBuffer(), tokenAccount.toBuffer()],
      new PublicKey(PROGRAM_ID)
    );

    let [poolPda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(POOL_SEED), seller.toBuffer(), mint.toBuffer()],
      new PublicKey(PROGRAM_ID)
    );

    let lamportsPrice = price * LAMPORTS_PER_SOL;

    const priceHigh = Math.floor(lamportsPrice / LAMPORTS_PER_SOL);
    const priceLow = lamportsPrice % LAMPORTS_PER_SOL;

    console.log('seller', seller.toString());
    instructions.push(program.instruction.createBid(priceHigh, priceLow, bump, {
      accounts: {
        bid: bidPda,
        pool: poolPda,
        bidder: bidder,
        seller: seller,
        vault: vault.publicKey,
        admin: ADMIN_WALLET.publicKey,
        mint: mint,
        tokenAccount: tokenAccount,
        systemProgram: SystemProgram.programId
      }
    }));
    signers.push(ADMIN_WALLET);
    signers.push(vault);
    const transaction = await makeTransaction(connection, instructions, signers, bidder);
    console.log('bid transaction', transaction);
    return transaction;
  }
  catch (error) {
    console.log('error', error);
  }
  return null;
}

export const makeUpdateBidTx = async (price: number, accounts: { bidder: PublicKey, seller: PublicKey, mint: PublicKey, tokenAccount: PublicKey, vault: Keypair }) => {
  try {
    const { bidder, seller, mint, tokenAccount, vault } = accounts;
    const program = getProgram();
    let instructions: any[] = [], signers: any[] = [];

    let [bidPda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(BID_SEED), bidder.toBuffer(), mint.toBuffer(), tokenAccount.toBuffer()],
      new PublicKey(PROGRAM_ID)
    );

    let [poolPda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(POOL_SEED), seller.toBuffer(), mint.toBuffer()],
      new PublicKey(PROGRAM_ID)
    );

    let lamportsPrice = price * LAMPORTS_PER_SOL;
    const priceHigh = Math.floor(lamportsPrice / LAMPORTS_PER_SOL);
    const priceLow = lamportsPrice % LAMPORTS_PER_SOL;

    instructions.push(program.instruction.updateBid(priceHigh, priceLow, {
      accounts: {
        bid: bidPda,
        pool: poolPda,
        bidder: bidder,
        seller: seller,
        vault: vault.publicKey,
        admin: ADMIN_WALLET.publicKey,
        mint: mint,
        tokenAccount: tokenAccount,
        systemProgram: SystemProgram.programId
      }
    }));
    signers.push(ADMIN_WALLET);
    signers.push(vault);
    const transaction = await makeTransaction(connection, instructions, signers, bidder);
    return transaction;
  }
  catch (error) {
    console.log('error');
  }
  return null;
}

export const makeCancelBidTx = async (accounts: { bidder: PublicKey, mint: PublicKey, tokenAccount: PublicKey, vault: Keypair }) => {
  try {
    const { bidder, mint, tokenAccount, vault } = accounts;
    console.log('bidder', bidder.toString(), 'mint', mint.toString(), 'tokenAccount', tokenAccount.toString());
    const program = getProgram();
    let instructions: any[] = [], signers: any[] = [];

    let [bidPda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(BID_SEED), bidder.toBuffer(), mint.toBuffer(), tokenAccount.toBuffer()],
      new PublicKey(PROGRAM_ID)
    );

    instructions.push(program.instruction.cancelBid({
      accounts: {
        bid: bidPda,
        bidder: bidder,
        vault: vault.publicKey,
        admin: ADMIN_WALLET.publicKey,
        systemProgram: SystemProgram.programId
      }
    }));
    signers.push(ADMIN_WALLET);
    signers.push(vault);
    const transaction = await makeTransaction(connection, instructions, signers, bidder);
    return transaction;
  }
  catch (error) {
    console.log('error');
  }
  return null;
}

export const makeAcceptBidTx = async (accounts: { seller: PublicKey, bidder: PublicKey, mint: PublicKey, tokenFrom: PublicKey, vault: Keypair }) => {
  try {
    const { seller, bidder, mint, tokenFrom, vault } = accounts;
    const program = getProgram();
    let instructions: any[] = [], signers: any[] = [];

    let [bidPda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(BID_SEED), bidder.toBuffer(), mint.toBuffer(), tokenFrom.toBuffer()],
      new PublicKey(PROGRAM_ID)
    );

    let [poolPda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(POOL_SEED), seller.toBuffer(), mint.toBuffer()],
      new PublicKey(PROGRAM_ID)
    );

    const ataToTx = await makeATokenAccountTransaction(connection, seller, bidder, mint);
    instructions = [...instructions, ...ataToTx.instructions];
    signers = [...signers, ...ataToTx.signers];
    const metadataAccount = await getSolanaMetadataAddress(mint);
    const data = await connection.getAccountInfo(metadataAccount);
    const metadata = await decodeTokenMetadata(data.data);

    let remainingAccounts: any[] = [];
    metadata.data.creators.forEach((creator: any) => {
      remainingAccounts.push({
        pubkey: creator.address,
        isWritable: true,
        isSigner: false
      });
    })

    instructions.push(program.instruction.acceptBid(0, {
      accounts: {
        pool: poolPda,
        bid: bidPda,
        vault: vault.publicKey,
        seller: seller,
        bidder: bidder,
        admin: ADMIN_WALLET.publicKey,
        mint: mint,
        metadata: metadataAccount,
        tokenFrom: tokenFrom,
        tokenTo: ataToTx.tokenTo,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID
      },
      remainingAccounts: remainingAccounts
    }));
    signers.push(ADMIN_WALLET);
    signers.push(vault);
    const transaction = await makeTransaction(connection, instructions, signers, seller);
    return transaction;
  }
  catch (error) {
    console.log('error', error);
  }
  return null;
}