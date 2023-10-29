// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

import "./MarketplaceBase.sol";

abstract contract ERC1155AuctionBase is MarketplaceBase, ERC1155Receiver {
    using ArrayLibrary for address[];
    using ArrayLibrary for uint256[];

    struct Auction {
        uint8 payment;
        address auctioneer;
        uint256 amount;
        uint256 startedAt;
        address[] bidders;
        uint256[] bidPrices;
        uint256[] bidAmounts;
    }

    struct AcceptBidReq {
        address contractAddr;
        uint256 tokenId;
        uint256 startedAt;
        uint256 bidAmount;
    }

    mapping(address => uint256[]) internal auctionTokenIds;
    mapping(address => mapping(address => uint256[]))
        internal auctionTokenIdsBySeller;

    mapping(address => mapping(uint256 => Auction[]))
        internal tokenIdToAuctions;
    mapping(address => mapping(address => mapping(uint256 => Auction[])))
        internal auctionsBySeller;

    event AuctionCreated(
        address contractAddr,
        uint256 tokenId,
        uint8 payment,
        uint256 amount
    );
    event AuctionCancelled(
        address contractAddr,
        uint256 tokenId,
        uint256 startedAt,
        uint256 amount
    );
    event AuctionBid(
        address contractAddr,
        uint256 tokenId,
        address auctioneer,
        uint256 startedAt,
        uint256 bidPrice,
        uint256 bidAmount
    );
    event BidCancelled(
        address contractAddr,
        uint256 tokenId,
        address auctioneer,
        uint256 startedAt,
        uint256 bidAmount
    );
    event BidAccepted(
        address contractAddr,
        uint256 tokenId,
        uint256 startedAt,
        address bidder,
        uint8 payment,
        uint256 price,
        uint256 amount
    );

    function removeAt(Auction[] storage auctions, uint256 index) internal {
        auctions[index] = auctions[auctions.length - 1];
        auctions.pop();
    }

    function _transferNFT(
        address contractAddr,
        address from,
        address to,
        uint256 tokenId,
        uint256 amount
    ) internal {
        IERC1155(contractAddr).safeTransferFrom(from, to, tokenId, amount, "");
    }

    function _bidAuction(
        Auction storage auction,
        uint256 bidPrice,
        uint256 bidAmount
    ) internal {
        auction.bidders.push(msg.sender);
        auction.bidPrices.push(bidPrice);
        auction.bidAmounts.push(bidAmount);
    }

    function _removeBid(
        Auction storage auction,
        address bidder,
        uint256 bidAmount
    ) internal {
        uint256 i = auction.bidders.findIndex(bidder);
        require(i < auction.bidders.length, "No Bid");
        require(auction.bidAmounts[i] >= bidAmount, "Insufficient Bid");
        auction.bidAmounts[i] -= bidAmount;
        if (auction.bidAmounts[i] == 0) {
            auction.bidders.removeAt(i);
            auction.bidPrices.removeAt(i);
            auction.bidAmounts.removeAt(i);
        }
    }

    function _findAuctionIndex(
        Auction[] memory auctions,
        address auctioneer,
        uint256 startedAt
    ) internal pure returns (uint256 i) {
        for (
            ;
            i < auctions.length &&
                (auctions[i].auctioneer != auctioneer ||
                    auctions[i].startedAt != startedAt);
            ++i
        ) {}
        require(i < auctions.length, "No Auction");
    }

    function _removeAuction(
        Auction[] storage auctions,
        uint256[] storage tokenIds,
        uint256 tokenId,
        uint256 startedAt,
        uint256 amount,
        bool fixClaim
    ) internal {
        uint256 i = _findAuctionIndex(auctions, msg.sender, startedAt);
        require(auctions[i].amount >= amount, "Insufficient Auction");
        auctions[i].amount -= amount;
        for (uint256 j; j < auctions[i].bidders.length; ++j) {
            if (auctions[i].bidAmounts[j] > auctions[i].amount) {
                uint256 removeAmount = auctions[i].bidAmounts[j] -
                    auctions[i].amount;
                if (fixClaim) {
                    claimable[auctions[i].bidders[j]][auctions[i].payment] +=
                        auctions[i].bidPrices[j] *
                        removeAmount;
                }
                _removeBid(auctions[i], auctions[i].bidders[j], removeAmount);
            }
        }
        if (auctions[i].amount == 0) {
            removeAt(auctions, i);
            if (auctions.length == 0) {
                tokenIds.remove(tokenId);
            }
        }
    }

    function _cancelAuction(
        address contractAddr,
        uint256 tokenId,
        uint256 startedAt,
        uint256 amount
    ) internal {
        _removeAuction(
            tokenIdToAuctions[contractAddr][tokenId],
            auctionTokenIds[contractAddr],
            tokenId,
            startedAt,
            amount,
            true
        );
        _removeAuction(
            auctionsBySeller[msg.sender][contractAddr][tokenId],
            auctionTokenIdsBySeller[msg.sender][contractAddr],
            tokenId,
            startedAt,
            amount,
            false
        );
    }

    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes memory
    ) public virtual returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) public virtual returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }

    function getAuctions(address contractAddr)
        external
        view
        isProperContract(contractAddr)
        returns (Auction[] memory auctions)
    {
        uint256 length;
        uint256 i;
        uint256[] storage tokenIds = auctionTokenIds[contractAddr];
        for (; i < tokenIds.length; ++i) {
            length += tokenIdToAuctions[contractAddr][tokenIds[i]].length;
        }
        auctions = new Auction[](length);
        length = 0;
        for (i = 0; i < tokenIds.length; ++i) {
            Auction[] storage curAuctions = tokenIdToAuctions[contractAddr][
                tokenIds[i]
            ];
            for (uint256 j; j < curAuctions.length; ++j) {
                auctions[length++] = curAuctions[j];
            }
        }
    }

    function getAuctionsBySeller(address contractAddr, address owner)
        external
        view
        isProperContract(contractAddr)
        returns (Auction[] memory auctions)
    {
        uint256 length;
        uint256 i;
        uint256[] storage tokenIds = auctionTokenIdsBySeller[owner][
            contractAddr
        ];
        uint256 len = tokenIds.length;
        for (; i < len; ++i) {
            length += auctionsBySeller[owner][contractAddr][tokenIds[i]].length;
        }
        auctions = new Auction[](length);
        length = 0;
        for (i = 0; i < len; ++i) {
            Auction[] storage curAuctions = auctionsBySeller[owner][
                contractAddr
            ][tokenIds[i]];
            uint256 curLen = curAuctions.length;
            for (uint256 j; j < curLen; ++j) {
                auctions[length++] = curAuctions[j];
            }
        }
    }

    function getAuctionsByNFT(address contractAddr, uint256 tokenId)
        external
        view
        isProperContract(contractAddr)
        returns (Auction[] memory)
    {
        return tokenIdToAuctions[contractAddr][tokenId];
    }

    function getAuctionsBySellerNFT(
        address seller,
        address contractAddr,
        uint256 tokenId
    ) external view isProperContract(contractAddr) returns (Auction[] memory) {
        return auctionsBySeller[seller][contractAddr][tokenId];
    }
}
