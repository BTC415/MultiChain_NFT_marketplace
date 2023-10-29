import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { signAndSendTransaction } from "../../solana/connection";
import { makeBuyTx } from "..";
import { CLUSTER_API } from '../../../config/dev';

const connection = new Connection(CLUSTER_API);

(async () => {
  const buyerKeypair = Keypair.fromSecretKey(bs58.decode('5fy5ddJwUTrHRAbM7BiH7d4Ai3Ry9WByE58tjooVX6fSNNtwf9ru27YnQcpu1AzBZmSe1vJvFqvXkGsVNmgcdvT5'));
  const seller = new PublicKey('DuQbVfRugVnRkakZ7a6vowHEuhwFFQxg3DpPFPiiNadr');
  const mint = new PublicKey('B8ZTbSgBDEtGj5bQhmfhx2oYhZbmJXni9cJFfwRxdFFw');
  const tokenFrom = new PublicKey('88L1kn8vWxsUPzTr5MEuvHizv98vUn2ZFnAqqw7W9MCh');

  const wallet = new NodeWallet(buyerKeypair);

  const tx = await makeBuyTx({
    buyer: buyerKeypair.publicKey,
    seller,
    mint,
    tokenFrom
  });
  // sign and send transaction
  await signAndSendTransaction(connection, wallet, tx);
})()