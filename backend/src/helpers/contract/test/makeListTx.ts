import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { signAndSendTransaction } from "../../solana/connection";
import { makeListTx } from "..";
import { CLUSTER_API } from '../../../config/dev';
const connection = new Connection(CLUSTER_API);

(async () => {
  const userKeypair = Keypair.fromSecretKey(bs58.decode('5fy5ddJwUTrHRAbM7BiH7d4Ai3Ry9WByE58tjooVX6fSNNtwf9ru27YnQcpu1AzBZmSe1vJvFqvXkGsVNmgcdvT5'));
  const price = 2;
  const mint = new PublicKey('Bas4TyBEyHPCad6ZoMdLvszEWzwg7fz4VuAbkJxzAMvx');
  const tokenAccount = new PublicKey('8FkGYAnKfjZroVjpbMFVq5WXECHTYzG4etPNPsc26NuU');
  // const mint = new PublicKey('B8ZTbSgBDEtGj5bQhmfhx2oYhZbmJXni9cJFfwRxdFFw');
  // const tokenAccount = new PublicKey('7BmdZtPPCGQL3LW6V7tf9QBZXSqXBL4aEhwnmuYwLYMW');

  const tx = await makeListTx(price, {
    user: userKeypair.publicKey,
    mint,
    tokenAccount
  });

  // sign and send transaction
  const wallet = new NodeWallet(userKeypair);
  await signAndSendTransaction(connection, wallet, tx);
})()