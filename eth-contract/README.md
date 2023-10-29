# NFT Marketplace Flow

```mermaid
classDiagram
  direction TB
  MarketplaceBase <|-- ERC721MarketplaceBase
  ERC721MarketplaceBase <|-- ERC721Marketplace
  Addresses <.. ERC721MarketplaceBase
  ERC721MarketplaceBase o-- Sale
  ERC721MarketplaceBase o-- Auction
  ERC721MarketplaceBase o-- Offer
  class ERC721Marketplace {
    +createSale(contractAddr, tokenId, payment, startPrice, endPrice, duration)
    +||payable|| buy(contractAddr, tokenId)
    +cancelSale(contractAddr, tokenId)
    +cancelSaleWhenPaused(contractAddr, tokenId)
    +||payable|| makeOffer(contractAddr, tokenId, price)
    +cancelOffer(contractAddr, tokenId)
    +acceptOffer(contractAddr, tokenId)
    +createAuction(contractAddr, tokenId, payment)
    +||payable|| bid(contractAddr, tokenId, price)
    +cancelBid(contractAddr, tokenId)
    +cancelAuction(contractAddr, tokenId)
    +acceptBid(contractAddr, tokenId)
  }
  class Sale {
    <<struct>>
    +address seller
    +uint8 payment
    +uint256 startPrice
    +uint256 endPrice
    +uint256 startedAt
    +uint256 duration
  }
  class Auction {
    <<struct>>
    +uint8 payment
    +address auctioneer
    +address[] bidders
    +uint256[] bidPrices
  }
  class Offer {
    <<struct>>
    +address offerer
    +uint256 offerPrice
  }
  class ERC721MarketplaceBase {
    <<abstract>>
    -map~address,uint256,Sale~ tokenIdToSales
    -map~address,uint256,Auction~ tokenIdToAuctions
    -map~address,uint256,Offer[]~ tokenIdToOffers
    -removeAt(offers, index)
    -_removeSale(contractAddr, tokenId)
    -_cancelAuction(contractAddr, tokenId)
    +getSale(contractAddr, tokenId) (Sale, Offer[], uint256)
    +getSales(contractAddr) (Sale[], Offer[][], uint256[])
    +getSalesBySeller(contractAddr, seller) (Sale[], Offer[][], uint256[])
    +getAuctions(contractAddr) Auction[]
    +getAuctionsBySeller(contractAddr, seller) Auction[]
    +getCurrentPrice(contractAddr, tokenId) uint256
    +||event|| SaleCreated(contractAddr, tokenId, payment, startPrice, endPrice, time, duration)
    +||event|| SaleSuccessful(contractAddr, tokenId, payment, price, buyer)
    +||event|| SaleCancelled(contractAddr, tokenId)
    +||event|| OfferCreated(contractAddr, tokenId, price, offerer)
    +||event|| OfferCancelled(contractAddr, tokenId, price, offerer)
    +||event|| OfferAccepted(contractAddr, tokenId, payment, price, offerer)
    +||event|| AuctionCreated(contractAddr, tokenId, payment, auctioneer)
    +||event|| AuctionCancelled(contractAddr, tokenId, auctioneer)
    +||event|| AuctionBid(contractAddr, tokenId, bidder, bidPrice)
    +||event|| BidAccepted(contractAddr, tokenId, payment, bidder, bidPrice)
    +||event|| CancelBid(contractAddr, tokenId, bidder)
    +||modifier|| onSale(contractAddr, tokenId)
    +||modifier|| onAuction(contractAddr, tokenId)
    +||modifier|| onlyAuctioneer(contractAddr, tokenId)
    +||modifier|| onlyBidder(contractAddr, tokenId)
  }
  class MarketplaceBase {
    <<abstract>>
    +address addressesContractAddr
    +address sparkTokenContractAddr
    -map~address,uint256[2]~ claimable
    -map~address,uint256[]~ saleTokenIds
    -map~address,uint256[]~ saleTokenIdsBySeller
    -map~address,uint256[]~ auctionTokenIds
    -map~address,uint256[]~ auctionTokenIdsBySeller
    -_escrowFund(payment, price)
    -_transferFund(payment, price, destination)
    -_payFund(payment, price, destination, contractAddr, tokenId)
    +setAddressesContractAddr(contractAddr)
    +setSparkTokenContractAddr(newSparkAddr)
    +getSaleTokens(contractAddr) uint256[]
    +getSaleTokensBySeller(contractAddr, seller) uint256[]
    +getClaimable(user, index) uint256[]
    +claim(amount, index)    
    +||modifier|| isProperContract(contractAddr)
  }
  class Addresses {
    -address[] normalContracts
    -address[] multiTokenContracts
    -map~address,bool~ verified
    -map~address,NFTType~ contractTypes
    +existingContract(contractAddr) bool
    +add(contractAddr)
    +getNFTType(contractAddr) NFTType
    +remove(contractAddr)
    +verify(contractAddr)
    +getNormalContracts() address[]
    +getMultiTokenContracts() address[]
    +getVerifiedNormalContracts() address[]
    +getVerifiedMultiTokenContracts() address[]
    +isVerified(contractAddr) bool
    +||modifier|| exists(contractAddr)
    +||modifier|| doesNotExist(contractAddr)
  }
```

```mermaid
classDiagram
  direction TB
  MarketplaceBase <|-- ERC1155MarketplaceBase
  ERC1155MarketplaceBase <|-- ERC1155Marketplace
  Addresses <.. ERC1155MarketplaceBase
  ERC1155MarketplaceBase o-- Sale
  ERC1155MarketplaceBase o-- Auction
  class ERC1155Marketplace {
    +createSale(contractAddr, tokenId, payment, startPrice, endPrice, duration, amount)
    +buy(contractAddr, tokenId, seller, payment, startPrice, endPrice, amount, startedAt, duration)
    -_buy(contractAddr, tokenId, sale, price)
    +cancelSale(contractAddr, tokenId, seller, payment, startPrice, endPrice, amount, startedAt, duration)
    +makeOffer(contractAddr, tokenId, seller, payment, startPrice, endPrice, startedAt, duration, price, amount)
    -_makeOffer(contractAddr, tokenId, sale, price, amount)
    +cancelOffer(contractAddr, tokenId, seller, payment, startPrice, endPrice, startedAt, duration, amount)
    +acceptOffer(contractAddr, tokenId, payment, startPrice, endPrice, startedAt, duration, amount)
    -_acceptOffer(contractAddr, tokenId, sale, amount)
    +createAuction(contractAddr, tokenId, payment, amount)
    +cancelAuction(contractAddr, tokenId, startedAt, amount)
    +bid(contractAddr, tokenId, auctioneer, startedAt, bidAmount, bidPrice)
    +cancelBid(contractAddr, tokenId, auctioneer, startedAt, bidAmount)
    +acceptBid(contractAddr, tokenId, startedAt, bidAmount)
  }
  class Sale {
    <<struct>>
    +address seller
    +uint8 payment
    +uint256 amount
    +uint256 startPrice
    +uint256 endPrice
    +uint256 startedAt
    +uint256 duration
    +address[] offerers
    +uint256[] offerPrices
    +uint256[] offerAmounts
  }
  class Auction {
    <<struct>>
    +uint8 payment
    +address auctioneer
    +uint256 amount
    +uint256 startedAt
    +address[] bidders
    +uint256[] bidPrices
    +uint256[] bidAmounts
  }
  class ERC1155MarketplaceBase {
    <<abstract>>
    -map~address,uint256,Sale[]~ tokenIdToSales
    -map~address,address,uint256,Sale[]~ salesBySeller
    -map~address,uint256,Auction[]~ tokenIdToAuctions
    -map~address,address,uint256,Auction[]~ auctionsBySeller
    -removeAt(sales, index)
    -removeAt(auctions, index)
    -_removeSale(contractAddr, tokenId, sale)
    -_deleteSale(sales, tokenIds, sale, tokenId, fixClaim)
    -_getSaleInfo(sale) SaleInfo
    -_isSameSale(sale, saleInfo) bool
    -_removeOfferAt(sale, index) bool
    -_createOffer(sales, sale, price, amount, curPrice)
    -_removeOffer(sales, sale, amount, offerer)
    -_bidAuction(auction, bidPrice, bidAmount)
    -_removeBid(auction, bidder, bidAmount)
    -_findSaleIndex(sales, sale) uint256
    -_findAuctionIndex(auctions, auctioneer, startedAt)
    -_removeAuction(auctions, tokenIds, tokenId, startedAt, amount, fixClaim)
    -_cancelAuction(contractAddr, tokenId, startedAt, amount)
    +onERC1155Received(address, address, uint256, uint256, bytes)
    +onERC1155BatchReceived(address, address, uint256[], uint256[], bytes)
    +getSalesByNFT(contractAddr, tokenId) (Sale[], uint256[])
    +getSalesBySellerNFT(seller, contractAddr, tokenId) (Sale[], uint256[])
    +getSale(contractAddr, tokenId, seller, payment, startPrice, endPrice, startedAt, duration, amount) (Sale, uint256)
    -_getSale(contractAddr, tokenId, sl) (Sale, uint256)
    +getSales(contractAddr) (Sale[], uint256[])
    +getSalesBySeller(contractAddr, owner) (Sale[], uint256[])
    +getAuctions(contractAddr) Auction[]
    +getAuctionsBySeller(contractAddr, owner) Auction[]
    +getAuctionsByNFT(contractAddr, tokenId) Auction[]
    +getAuctionsBySellerNFT(seller, contractAddr, tokenId) Auction[]
    +getCurrentPrice(sale) uint256
    +||event|| SaleCreated(contractAddr, tokenId, payment, startPrice, endPrice, amount, time, duration)
    +||event|| SaleSuccessful(contractAddr, tokenId, sale, price, buyer)
    +||event|| SaleCancelled(contractAddr, tokenId, sale)
    +||event|| OfferCreated(sale, contractAddr, tokenId, price, amount, offerer)
    +||event|| OfferCancelled(sale, contractAddr, tokenId, amount, offerer)
    +||event|| AuctionCreated(contractAddr, tokenId, payment, amount)
    +||event|| AuctionCancelled(contractAddr, tokenId, startedAt, amount)
    +||event|| AuctionBid(contractAddr, tokenId, auctioneer, startedAt, bidPrice, bidAmount)
    +||event|| CancelBid(contractAddr, tokenId, auctioneer, startedAt, amount)
    +||event|| BidAccepted(contractAddr, tokenId, startedAt, amount)
  }
  class MarketplaceBase {
    <<abstract>>
    +address addressesContractAddr
    +address sparkTokenContractAddr
    -map~address,uint256[2]~ claimable
    -map~address,uint256[]~ saleTokenIds
    -map~address,uint256[]~ saleTokenIdsBySeller
    -map~address,uint256[]~ auctionTokenIds
    -map~address,uint256[]~ auctionTokenIdsBySeller
    -_escrowFund(payment, price)
    -_transferFund(payment, price, destination)
    -_payFund(payment, price, destination, contractAddr, tokenId)
    +setAddressesContractAddr(contractAddr)
    +setSparkTokenContractAddr(newSparkAddr)
    +getSaleTokens(contractAddr) uint256[]
    +getSaleTokensBySeller(contractAddr, seller) uint256[]
    +getClaimable(user, index) uint256[]
    +claim(amount, index)    
    +||modifier|| isProperContract(contractAddr)
  }
  class Addresses {
    -address[] normalContracts
    -address[] multiTokenContracts
    -map~address,bool~ verified
    -map~address,NFTType~ contractTypes
    +existingContract(contractAddr) bool
    +add(contractAddr)
    +getNFTType(contractAddr) NFTType
    +remove(contractAddr)
    +verify(contractAddr)
    +getNormalContracts() address[]
    +getMultiTokenContracts() address[]
    +getVerifiedNormalContracts() address[]
    +getVerifiedMultiTokenContracts() address[]
    +isVerified(contractAddr) bool
    +||modifier|| exists(contractAddr)
    +||modifier|| doesNotExist(contractAddr)
  }
```

```mermaid
sequenceDiagram
    participant User 1
    participant User 2
    participant Marketplace Owner
    participant Addresses
    participant ERC721Marketplace
    participant ERC721 NFT
    Marketplace Owner->>ERC721Marketplace: Set Addresses Smart Contract Address
    Marketplace Owner->>Addresses: Register NFT Smart Contract
    User 1->>ERC721 NFT: Approve NFT of tokenId to Marketplace
    Marketplace Owner->>Addresses: Verify NFT Smart Contract
    User 1->>ERC721Marketplace: Create/Cancel Sale with tokenId in ERC721 NFT Contract
    ERC721Marketplace-->>ERC721 NFT: Transfer NFT of tokenId<br/>from User 1/Marketplace<br/>to Marketplace/User 1
    User 2->>ERC721Marketplace: Get Sale Tokens in ERC721 NFT Contract
    ERC721Marketplace-->>User 2: Sale Tokens in ERC721 NFT Contract
    User 2->>ERC721Marketplace: Get Sale Info of NFT of tokenId in ERC721 NFT Contract
    ERC721Marketplace-->>User 2: Sale Info of NFT of tokenId in ERC721 NFT Contract
    User 2->>ERC721Marketplace: Purchase NFT of tokenId in ERC721 NFT Contract
    User 2-->>ERC721Marketplace: Escrow price of NFT of tokenId to Marketplace
    ERC721Marketplace-->>ERC721 NFT: Transfer NFT of tokenId<br/>from Marketplace<br/>to User 2
    ERC721Marketplace-->>User 1: Transfer coins of the price to User 1
    User 2->>ERC721Marketplace: Create Offer with tokenId in ERC721 NFT Contract
    User 2-->>ERC721Marketplace: Transfer offer price<br/>from User 2 to Marketplace
    User 2->>ERC721Marketplace: Cancel Offer with tokenId in ERC721 NFT Contract
    ERC721Marketplace-->>User 2: Transfer offer price<br/>from Marketplace to User 2
    User 1->>ERC721Marketplace: Accept Highest Offer with tokenId in ERC721 NFT Contract
    ERC721Marketplace-->>ERC721 NFT: Transfer NFT of tokenId<br/>from Marketplace to User 2
    ERC721Marketplace-->>User 1: Transfer offer price to User 1
    User 1->>ERC721Marketplace: Create/Cancel Auction with tokenId in ERC721 NFT Contract
    ERC721Marketplace-->>ERC721 NFT: Transfer NFT of tokenId<br/>from User 1/Marketplace<br/>to Marketplace/User 1
    User 2->>ERC721Marketplace: Get Auction Tokens in ERC721 NFT Contract
    ERC721Marketplace-->>User 2: Auction Tokens in ERC721 NFT Contract
    User 2->>ERC721Marketplace: Get Auction Info of NFT of tokenId in ERC721 NFT Contract
    ERC721Marketplace-->>User 2: Auction Info of NFT of tokenId in ERC721 NFT Contract
    User 2->>ERC721Marketplace: Create Bid with tokenId in ERC721 NFT Contract
    User 2-->>ERC721Marketplace: Transfer bid price<br/>from User 2 to Marketplace
    User 2->>ERC721Marketplace: Cancel Bid with tokenId in ERC721 NFT Contract
    ERC721Marketplace-->>User 2: Transfer bid price<br/>from Marketplace to User 2
    User 1->>ERC721Marketplace: Accept Highest Bid with tokenId in ERC721 NFT Contract
    ERC721Marketplace-->>ERC721 NFT: Transfer NFT of tokenId<br/>from Marketplace to User 2
    ERC721Marketplace-->>User 1: Transfer bid price to User 1
```

```mermaid
sequenceDiagram
    participant User 1
    participant User 2
    participant Marketplace Owner
    participant Addresses
    participant ERC1155Marketplace
    participant ERC1155 NFT
    Marketplace Owner->>ERC1155Marketplace: Set Addresses Smart Contract Address
    Marketplace Owner->>Addresses: Register NFT Smart Contract
    User 1->>ERC1155 NFT: Approve NFT of tokenId to Marketplace
    Marketplace Owner->>Addresses: Verify NFT Smart Contract
    User 1->>ERC1155Marketplace: Create/Cancel Sale with tokenId in ERC1155 NFT Contract
    ERC1155Marketplace-->>ERC1155 NFT: Transfer NFT of tokenId<br/>from User 1/Marketplace<br/>to Marketplace/User 1
    User 2->>ERC1155Marketplace: Get Sale Tokens in ERC1155 NFT Contract
    ERC1155Marketplace-->>User 2: Sale Tokens in ERC1155 NFT Contract
    User 2->>ERC1155Marketplace: Get Sale Info of NFT of tokenId in ERC1155 NFT Contract
    ERC1155Marketplace-->>User 2: Sale Info of NFT of tokenId in ERC1155 NFT Contract
    User 2->>ERC1155Marketplace: Purchase NFT of tokenId in ERC1155 NFT Contract
    User 2-->>ERC1155Marketplace: Escrow price of NFT of tokenId to Marketplace
    ERC1155Marketplace-->>ERC1155 NFT: Transfer NFT of tokenId<br/>from Marketplace<br/>to User 2
    ERC1155Marketplace-->>User 1: Transfer coins of the price to User 1
    User 2->>ERC1155Marketplace: Create Offer with tokenId in ERC1155 NFT Contract
    User 2-->>ERC1155Marketplace: Transfer offer price<br/>from User 2 to Marketplace
    User 2->>ERC1155Marketplace: Cancel Offer with tokenId in ERC1155 NFT Contract
    ERC1155Marketplace-->>User 2: Transfer offer price<br/>from Marketplace to User 2
    User 1->>ERC1155Marketplace: Accept Highest Offer with tokenId in ERC1155 NFT Contract
    ERC1155Marketplace-->>ERC1155 NFT: Transfer NFT of tokenId<br/>from Marketplace to User 2
    ERC1155Marketplace-->>User 1: Transfer offer price to User 1
    User 1->>ERC1155Marketplace: Create/Cancel Auction with tokenId in ERC1155 NFT Contract
    ERC1155Marketplace-->>ERC1155 NFT: Transfer NFT of tokenId<br/>from User 1/Marketplace<br/>to Marketplace/User 1
    User 2->>ERC1155Marketplace: Get Auction Tokens in ERC1155 NFT Contract
    ERC1155Marketplace-->>User 2: Auction Tokens in ERC1155 NFT Contract
    User 2->>ERC1155Marketplace: Get Auction Info of NFT of tokenId in ERC1155 NFT Contract
    ERC1155Marketplace-->>User 2: Auction Info of NFT of tokenId in ERC1155 NFT Contract
    User 2->>ERC1155Marketplace: Create Bid with tokenId in ERC1155 NFT Contract
    User 2-->>ERC1155Marketplace: Transfer bid price<br/>from User 2 to Marketplace
    User 2->>ERC1155Marketplace: Cancel Bid with tokenId in ERC1155 NFT Contract
    ERC1155Marketplace-->>User 2: Transfer bid price<br/>from Marketplace to User 2
    User 1->>ERC1155Marketplace: Accept Highest Bid with tokenId in ERC1155 NFT Contract
    ERC1155Marketplace-->>ERC1155 NFT: Transfer NFT of tokenId<br/>from Marketplace to User 2
    ERC1155Marketplace-->>User 1: Transfer bid price to User 1
```

# Smart Contract Project Setup and Test

This project is the NFT Marketplace Smart Contract integrating tools for unit test using Hardhat.

# Smart Contract Project Setup

Please install dependency modules
```shell
yarn
```

Please compile Smart Contracts
```shell
yarn compile
```

# Project Test

You can test Smart Contracts using
```shell
yarn test
```

# Deploy Smart Contracts

You can deploy Smart Contracts on the hardhat by
```shell
npx hardhat run scripts/deploy.js
```

First, you should change the .env.example file name as .env
Before deploying Smart contracts in the real networks like Ethereum or Rinkeby, you should add the chain info in the hardhat.config.js file

```javascript
{
  ...
  ropsten: {
    url: `https://ropsten.infura.io/v3/${process.env.INFURA_ID}`,
    tags: ["nft", "marketplace", "test"],
    chainId: 3,
    accounts: real_accounts,
    gas: 2100000,
    gasPrice: 8000000000
  },
  ...
}
```

You should add your wallet private key to .env file to make deploy transaction with your wallet

```javascript
...
PRIVATE_KEY=123123123123123
...
```

After that, you can deploy the Smart Contracts on the chain by

```shell
npx hardhat run scripts/deploy.js --network ropsten
```