import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { signAndSendTransaction } from "../../solana/connection";
import { makeCancelListTx } from "..";
import { CLUSTER_API } from '../../../config/dev';

const connection = new Connection(CLUSTER_API);

(async () => {
  const userKeypair = Keypair.fromSecretKey(bs58.decode('CTDxo5UVojgVRJQTG6aKTb2mbyxtBmpYWAZwMDMjDtKVBQs5wRJTe475YJYsdtxTtAghhNCudvzTyuDxEetQvDa'));
  const mint = new PublicKey('AaEMdPsXnNYwneAGJC8NszgU5w4UkkmbhpmkcNocHWP8');
  const tokenAccount = new PublicKey('D17LuzPuNzpSutdSLjdXVXDiVPFMohztjuvQbL655WjQ');

  const tx = await makeCancelListTx({
    user: userKeypair.publicKey,
    mint,
    tokenAccount
  });

  // sign and send transaction
  const wallet = new NodeWallet(userKeypair);
  await signAndSendTransaction(connection, wallet, tx);
})()