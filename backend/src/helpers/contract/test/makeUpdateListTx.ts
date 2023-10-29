import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { signAndSendTransaction } from "../../solana/connection";
import { makeUpdateListTx } from "..";
import { CLUSTER_API } from '../../../config/dev';

const connection = new Connection(CLUSTER_API);

(async () => {
  const userKeypair = Keypair.fromSecretKey(bs58.decode('CTDxo5UVojgVRJQTG6aKTb2mbyxtBmpYWAZwMDMjDtKVBQs5wRJTe475YJYsdtxTtAghhNCudvzTyuDxEetQvDa'));
  const price = 3;
  const mint = new PublicKey('B8ZTbSgBDEtGj5bQhmfhx2oYhZbmJXni9cJFfwRxdFFw');
  const tokenAccount = new PublicKey('7BmdZtPPCGQL3LW6V7tf9QBZXSqXBL4aEhwnmuYwLYMW');

  const tx = await makeUpdateListTx(price, {
    user: userKeypair.publicKey,
    mint,
    tokenAccount
  });

  // sign and send transaction
  const wallet = new NodeWallet(userKeypair);
  await signAndSendTransaction(connection, wallet, tx);
})()