// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers, upgrades } = require('hardhat');

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await run('compile');

  // We get the contract to deploy
  const accounts = await ethers.getSigners()
  console.log('Deploying with ', accounts[0].address)

  const arrayLibraryAddr = '0x2f2Ad41Eba98A79d96F1C851f722aaAB6c9a6c4c'
  const sparkTokenAddr = '0xEc738E4F4ab9D05F2D86E8008Ec7D388197EaB62'
  const addressesAddr = '0xc58403Fdb33953b0d9996102D8261B6Be9FF9cDb'

  const ERC1155Sale = await ethers.getContractFactory('ERC1155Sale', { libraries: { ArrayLibrary: arrayLibraryAddr } });
  const erc1155Sale = await upgrades.deployProxy(ERC1155Sale, [], { unsafeAllow: ['external-library-linking'] })

  await erc1155Sale.deployed();

  console.log('ERC1155Sale Contract Address:', erc1155Sale.address);

  await (await erc1155Sale.setSparkTokenContractAddr(sparkTokenAddr)).wait()
  await (await erc1155Sale.setAddressesContractAddr(addressesAddr)).wait()
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
