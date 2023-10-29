import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { signAndSendTransaction } from "../../solana/connection";
import { makeAcceptBidTx } from "..";
import { CLUSTER_API } from '../../../config/dev';

const connection = new Connection(CLUSTER_API);

(async () => {
  const sellerKeypair = Keypair.fromSecretKey(bs58.decode('CTDxo5UVojgVRJQTG6aKTb2mbyxtBmpYWAZwMDMjDtKVBQs5wRJTe475YJYsdtxTtAghhNCudvzTyuDxEetQvDa'));
  const bidder = new PublicKey('44ZbLk2K77k44fYS93tJwAMD1UbCWoTEK2PYRGjEsJmH');
  const mint = new PublicKey('ACQiDtfYDEjqNgVPqB15mKndCgqJWyLQDtqPUpX5pVuT');
  const tokenFrom = new PublicKey('BvrAWfyKaFNBrM9VcpoHCxB2yc75sGEaKkNMs478b9Rw');

  const wallet = new NodeWallet(sellerKeypair);
  let keypair = [185, 162, 183, 188, 89, 224, 44, 92, 1, 139, 59, 53, 105, 164, 18, 172, 245, 118, 222, 141, 29, 182, 129, 78, 89, 51, 135, 61, 125, 207, 165, 196, 238, 136, 210, 175, 250, 61, 245, 210, 43, 204, 180, 110, 194, 233, 137, 21, 250, 164, 80, 247, 143, 116, 139, 88, 44, 158, 128, 140, 55, 154, 167, 9];

  let vault = Keypair.fromSeed(Uint8Array.from(keypair).slice(0, 32));

  const tx = await makeAcceptBidTx({
    seller: sellerKeypair.publicKey,
    bidder,
    mint,
    tokenFrom,
    vault: vault
  });
  // sign and send transaction
  await signAndSendTransaction(connection, wallet, tx);
})()