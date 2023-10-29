// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.9;

import "./ERC1155AuctionBase.sol";

contract ERC1155Auction is ERC1155AuctionBase {
    using ArrayLibrary for address[];
    using ArrayLibrary for uint256[];

    function createAuction(
        address contractAddr,
        uint256 tokenId,
        uint8 payment,
        uint256 amount
    ) external isProperContract(contractAddr) {
        _transferNFT(contractAddr, msg.sender, address(this), tokenId, amount);
        Auction memory auction = Auction(
            payment,
            msg.sender,
            amount,
            block.timestamp,
            new address[](0),
            new uint256[](0),
            new uint256[](0)
        );
        if (tokenIdToAuctions[contractAddr][tokenId].length == 0) {
            auctionTokenIds[contractAddr].push(tokenId);
        }
        tokenIdToAuctions[contractAddr][tokenId].push(auction);
        if (auctionsBySeller[msg.sender][contractAddr][tokenId].length == 0) {
            auctionTokenIdsBySeller[msg.sender][contractAddr].push(tokenId);
        }
        auctionsBySeller[msg.sender][contractAddr][tokenId].push(auction);
        emit AuctionCreated(contractAddr, tokenId, payment, amount);
    }

    function cancelAuction(
        address contractAddr,
        uint256 tokenId,
        uint256 startedAt,
        uint256 amount
    ) external {
        _transferNFT(contractAddr, address(this), msg.sender, tokenId, amount);
        _cancelAuction(contractAddr, tokenId, startedAt, amount);
        emit AuctionCancelled(contractAddr, tokenId, startedAt, amount);
    }

    function bid(
        address contractAddr,
        uint256 tokenId,
        address auctioneer,
        uint256 startedAt,
        uint256 bidAmount,
        uint256 bidPrice
    ) external payable {
        require(msg.sender != auctioneer, "Is Auctioneer");
        Auction[] storage auctions = tokenIdToAuctions[contractAddr][tokenId];
        uint256 i = _findAuctionIndex(auctions, auctioneer, startedAt);
        PaymentLibrary.escrowFund(
            tokenAddrs[auctions[i].payment],
            bidPrice * bidAmount
        );
        _bidAuction(auctions[i], bidPrice, bidAmount);
        auctions = auctionsBySeller[auctioneer][contractAddr][tokenId];
        i = _findAuctionIndex(auctions, auctioneer, startedAt);
        _bidAuction(auctions[i], bidPrice, bidAmount);
        emit AuctionBid(
            contractAddr,
            tokenId,
            auctioneer,
            startedAt,
            bidPrice,
            bidAmount
        );
    }

    function cancelBid(
        address contractAddr,
        uint256 tokenId,
        address auctioneer,
        uint256 startedAt,
        uint256 bidAmount
    ) external {
        Auction[] storage auctions = tokenIdToAuctions[contractAddr][tokenId];
        uint256 i = _findAuctionIndex(auctions, auctioneer, startedAt);
        uint256 j = auctions[i].bidders.findIndex(msg.sender);
        uint256 price = auctions[i].bidPrices[j] * bidAmount;
        PaymentLibrary.transferFund(
            tokenAddrs[auctions[i].payment],
            price,
            msg.sender
        );
        _removeBid(auctions[i], msg.sender, bidAmount);
        auctions = auctionsBySeller[auctioneer][contractAddr][tokenId];
        i = _findAuctionIndex(auctions, auctioneer, startedAt);
        _removeBid(auctions[i], msg.sender, bidAmount);
        emit BidCancelled(
            contractAddr,
            tokenId,
            auctioneer,
            startedAt,
            bidAmount
        );
    }

    function acceptBid(
        address contractAddr,
        uint256 tokenId,
        uint256 startedAt,
        uint256 bidAmount
    ) external payable {
        Auction[] storage auctions = tokenIdToAuctions[contractAddr][tokenId];
        uint256 i = _findAuctionIndex(auctions, msg.sender, startedAt);
        Auction storage auction = auctions[i];
        require(auction.bidders.length > 0, "No Bid");
        i = auction.bidPrices.findMaxIndex();
        require(auction.bidAmounts[i] >= bidAmount, "Insuffcient Bid");
        address bidder = auction.bidders[i];
        _transferNFT(contractAddr, address(this), bidder, tokenId, bidAmount);
        uint256 price = auction.bidPrices[i];
        PaymentLibrary.payFund(
            tokenAddrs[auction.payment],
            price * bidAmount,
            msg.sender,
            contractAddr,
            tokenId
        );
        _removeBid(auction, bidder, bidAmount);
        auctions = auctionsBySeller[msg.sender][contractAddr][tokenId];
        i = _findAuctionIndex(auctions, msg.sender, startedAt);
        _removeBid(auctions[i], bidder, bidAmount);
        _cancelAuction(contractAddr, tokenId, startedAt, bidAmount);
        emit BidAccepted(
            contractAddr,
            tokenId,
            startedAt,
            bidder,
            auction.payment,
            price,
            bidAmount
        );
    }
}
