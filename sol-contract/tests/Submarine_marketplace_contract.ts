import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SubmarineMarketplaceContract } from "../target/types/submarine_marketplace_contract";

describe("Submarine_marketplace_contract", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SubmarineMarketplaceContract as Program<SubmarineMarketplaceContract>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
