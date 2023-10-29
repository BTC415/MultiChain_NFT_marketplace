import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { makeATokenAccountTransaction, makeTransaction, signAndSendTransaction } from "../../solana/connection";
import { makeUpdateBidTx } from "..";
import { CLUSTER_API } from '../../../config/dev';

const connection = new Connection(CLUSTER_API);

(async () => {
  const bidderKeypair = Keypair.fromSecretKey(bs58.decode('5fy5ddJwUTrHRAbM7BiH7d4Ai3Ry9WByE58tjooVX6fSNNtwf9ru27YnQcpu1AzBZmSe1vJvFqvXkGsVNmgcdvT5'));
  const seller = new PublicKey('DuQbVfRugVnRkakZ7a6vowHEuhwFFQxg3DpPFPiiNadr');
  const mint = new PublicKey('ACQiDtfYDEjqNgVPqB15mKndCgqJWyLQDtqPUpX5pVuT');
  const tokenAccount = new PublicKey('BvrAWfyKaFNBrM9VcpoHCxB2yc75sGEaKkNMs478b9Rw');
  let keypair = [185, 162, 183, 188, 89, 224, 44, 92, 1, 139, 59, 53, 105, 164, 18, 172, 245, 118, 222, 141, 29, 182, 129, 78, 89, 51, 135, 61, 125, 207, 165, 196, 238, 136, 210, 175, 250, 61, 245, 210, 43, 204, 180, 110, 194, 233, 137, 21, 250, 164, 80, 247, 143, 116, 139, 88, 44, 158, 128, 140, 55, 154, 167, 9];

  let vault = Keypair.fromSeed(Uint8Array.from(keypair).slice(0, 32));

  const price = 1;
  const wallet = new NodeWallet(bidderKeypair);
  const tx = await makeUpdateBidTx(price, {
    bidder: bidderKeypair.publicKey,
    seller: seller,
    mint,
    tokenAccount: tokenAccount,
    vault
  });
  // sign and send transaction
  await signAndSendTransaction(connection, wallet, tx);
})()