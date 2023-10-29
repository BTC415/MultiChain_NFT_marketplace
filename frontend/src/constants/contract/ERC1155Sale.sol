// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.9;

import "./ERC1155SaleBase.sol";

contract ERC1155Sale is ERC1155SaleBase {
    using ArrayLibrary for address[];

    function createSale(
        address contractAddr,
        uint256 tokenId,
        Sale memory sale
    ) external isProperContract(contractAddr) {
        require(sale.startPrice >= sale.endPrice, "Invalid Price");
        sale.offerers = new address[](0);
        sale.offerPrices = new uint256[](0);
        sale.offerAmounts = new uint256[](0);
        sale.seller = msg.sender;
        sale.startedAt = block.timestamp;
        IERC1155(contractAddr).safeTransferFrom(
            msg.sender,
            address(this),
            tokenId,
            sale.amount,
            ""
        );
        if (tokenIdToSales[contractAddr][tokenId].length == 0) {
            saleTokenIds[contractAddr].push(tokenId);
        }
        tokenIdToSales[contractAddr][tokenId].push(sale);
        if (salesBySeller[msg.sender][contractAddr][tokenId].length == 0) {
            saleTokenIdsBySeller[msg.sender][contractAddr].push(tokenId);
        }
        salesBySeller[msg.sender][contractAddr][tokenId].push(sale);
        emit SaleCreated(
            contractAddr,
            tokenId,
            sale.payment,
            sale.seller,
            sale.startPrice,
            sale.endPrice,
            sale.amount,
            sale.startedAt,
            sale.duration
        );
    }

    function updateSale(
        address contractAddr,
        uint256 tokenId,
        Sale memory sale
    ) external isProperContract(contractAddr) {
        require(msg.sender == sale.seller, "Not Seller");
        _updateSale(contractAddr, tokenId, sale);
        emit SaleUpdated(
            contractAddr,
            tokenId,
            sale.payment,
            sale.seller,
            sale.startPrice,
            sale.endPrice,
            sale.amount,
            sale.startedAt,
            sale.duration
        );
    }

    function buy(
        address contractAddr,
        uint256 tokenId,
        Sale memory sale
    ) external payable isProperContract(contractAddr) nonReentrant {
        require(msg.sender != sale.seller, "Is Seller");
        uint256 price = getCurrentPrice(sale);
        _buy(contractAddr, tokenId, sale, price * sale.amount);
        emit SaleSuccessful(
            contractAddr,
            tokenId,
            sale.payment,
            sale.seller,
            sale.startPrice,
            sale.endPrice,
            sale.startedAt,
            sale.duration,
            price,
            sale.amount,
            msg.sender
        );
    }

    function cancelSale(
        address contractAddr,
        uint256 tokenId,
        Sale memory sale
    ) external isProperContract(contractAddr) {
        IERC1155(contractAddr).safeTransferFrom(
            address(this),
            msg.sender,
            tokenId,
            sale.amount,
            ""
        );
        _removeSale(contractAddr, tokenId, sale);
    }

    function makeOffer(
        address contractAddr,
        uint256 tokenId,
        Sale memory sale,
        uint256 price
    ) external payable isProperContract(contractAddr) {
        require(msg.sender != sale.seller, "Is Seller");
        uint256 curPrice = getCurrentPrice(sale);
        require(price < curPrice, "Invalid Offer Price");
        PaymentLibrary.escrowFund(
            tokenAddrs[sale.payment],
            price * sale.amount
        );
        _createOffer(
            tokenIdToSales[contractAddr][tokenId],
            sale,
            price,
            curPrice
        );
        _createOffer(
            salesBySeller[sale.seller][contractAddr][tokenId],
            sale,
            price,
            curPrice
        );
        emit OfferCreated(
            contractAddr,
            tokenId,
            sale.payment,
            sale.seller,
            sale.startPrice,
            sale.endPrice,
            sale.startedAt,
            sale.duration,
            price,
            sale.amount,
            msg.sender
        );
    }

    function updateOffer(
        address contractAddr,
        uint256 tokenId,
        Sale memory sale,
        uint256 price,
        uint256 amount
    ) external payable isProperContract(contractAddr) {
        require(msg.sender != sale.seller, "Is Seller");
        uint256 curPrice = getCurrentPrice(sale);
        _updateOffer(
            contractAddr,
            tokenId,
            tokenIdToSales[contractAddr][tokenId],
            sale,
            price,
            curPrice,
            amount
        );
        emit OfferUpdated(
            contractAddr,
            tokenId,
            sale.payment,
            sale.seller,
            sale.startPrice,
            sale.endPrice,
            sale.startedAt,
            sale.duration,
            price,
            sale.amount,
            msg.sender
        );
    }

    function cancelOffer(
        address contractAddr,
        uint256 tokenId,
        Sale memory sale
    ) external isProperContract(contractAddr) {
        Sale storage curSale = tokenIdToSales[contractAddr][tokenId][
            _findSaleIndex(tokenIdToSales[contractAddr][tokenId], sale)
        ];
        PaymentLibrary.transferFund(
            tokenAddrs[curSale.payment],
            curSale.offerPrices[curSale.offerers.findIndex(msg.sender)] *
                sale.amount,
            msg.sender
        );
        _removeOffer(tokenIdToSales[contractAddr][tokenId], sale, msg.sender);
        _removeOffer(
            salesBySeller[sale.seller][contractAddr][tokenId],
            sale,
            msg.sender
        );
        emit OfferCancelled(
            contractAddr,
            tokenId,
            sale.payment,
            sale.seller,
            sale.startPrice,
            sale.endPrice,
            sale.startedAt,
            sale.duration,
            sale.amount,
            msg.sender
        );
    }

    function acceptOffer(
        address contractAddr,
        uint256 tokenId,
        Sale memory sale
    ) external isProperContract(contractAddr) {
        uint256 i = _findSaleIndex(tokenIdToSales[contractAddr][tokenId], sale);
        require(
            i < tokenIdToSales[contractAddr][tokenId].length,
            "Not On Sale"
        );
        Sale storage curSale = tokenIdToSales[contractAddr][tokenId][i];
        require(curSale.offerers.length > 0, "No Offer");
        uint256 maxOffererId = ArrayLibrary.findMaxIndex(curSale.offerPrices);
        require(
            curSale.offerAmounts[maxOffererId] >= sale.amount,
            "Insufficient Offer"
        );
        PaymentLibrary.payFund(
            tokenAddrs[sale.payment],
            curSale.offerPrices[maxOffererId] * sale.amount,
            msg.sender,
            contractAddr,
            tokenId
        );
        address buyer = curSale.offerers[maxOffererId];
        IERC1155(contractAddr).safeTransferFrom(
            address(this),
            buyer,
            tokenId,
            sale.amount,
            ""
        );
        _removeOffer(tokenIdToSales[contractAddr][tokenId], sale, buyer);
        _removeOffer(
            salesBySeller[msg.sender][contractAddr][tokenId],
            sale,
            buyer
        );
        _removeSale(contractAddr, tokenId, sale);
        emit OfferAccepted(
            contractAddr,
            tokenId,
            sale.payment,
            sale.seller,
            sale.startPrice,
            sale.endPrice,
            sale.startedAt,
            sale.duration,
            sale.amount,
            buyer
        );
    }
}
