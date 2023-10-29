// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

import "./MarketplaceBase.sol";

abstract contract ERC1155SaleBase is MarketplaceBase, ERC1155Receiver {
    using ArrayLibrary for uint256[];
    using ArrayLibrary for address[];

    struct Sale {
        uint8 payment;
        address seller;
        uint256 startPrice;
        uint256 endPrice;
        uint256 amount;
        uint256 startedAt;
        uint256 duration;
        address[] offerers;
        uint256[] offerPrices;
        uint256[] offerAmounts;
    }

    mapping(address => uint256[]) internal saleTokenIds;
    mapping(address => mapping(address => uint256[]))
        internal saleTokenIdsBySeller;

    mapping(address => mapping(uint256 => Sale[])) internal tokenIdToSales;
    mapping(address => mapping(address => mapping(uint256 => Sale[])))
        internal salesBySeller;

    event SaleCreated(
        address contractAddr,
        uint256 tokenId,
        uint8 payment,
        address seller,
        uint256 startPrice,
        uint256 endPrice,
        uint256 amount,
        uint256 startedAt,
        uint256 duration
    );

    event SaleUpdated(
        address contractAddr,
        uint256 tokenId,
        uint8 payment,
        address seller,
        uint256 startPrice,
        uint256 endPrice,
        uint256 amount,
        uint256 startedAt,
        uint256 duration
    );

    event SaleSuccessful(
        address contractAddr,
        uint256 tokenId,
        uint8 payment,
        address seller,
        uint256 startPrice,
        uint256 endPrice,
        uint256 startedAt,
        uint256 duration,
        uint256 price,
        uint256 amount,
        address buyer
    );
    event SaleCancelled(
        address contractAddr,
        uint256 tokenId,
        uint8 payment,
        address seller,
        uint256 startPrice,
        uint256 endPrice,
        uint256 startedAt,
        uint256 duration,
        uint256 amount
    );
    event OfferCreated(
        address contractAddr,
        uint256 tokenId,
        uint8 payment,
        address seller,
        uint256 startPrice,
        uint256 endPrice,
        uint256 startedAt,
        uint256 duration,
        uint256 price,
        uint256 amount,
        address offerer
    );
    event OfferUpdated(
        address contractAddr,
        uint256 tokenId,
        uint8 payment,
        address seller,
        uint256 startPrice,
        uint256 endPrice,
        uint256 startedAt,
        uint256 duration,
        uint256 price,
        uint256 amount,
        address offerer
    );
    event OfferCancelled(
        address contractAddr,
        uint256 tokenId,
        uint8 payment,
        address seller,
        uint256 startPrice,
        uint256 endPrice,
        uint256 startedAt,
        uint256 duration,
        uint256 amount,
        address offerer
    );
    event OfferAccepted(
        address contractAddr,
        uint256 tokenId,
        uint8 payment,
        address seller,
        uint256 startPrice,
        uint256 endPrice,
        uint256 startedAt,
        uint256 duration,
        uint256 amount,
        address offerer
    );

    function _buy(
        address contractAddr,
        uint256 tokenId,
        Sale memory sale,
        uint256 price
    ) internal {
        PaymentLibrary.escrowFund(tokenAddrs[sale.payment], price);
        PaymentLibrary.payFund(
            tokenAddrs[sale.payment],
            price,
            sale.seller,
            contractAddr,
            tokenId
        );
        IERC1155(contractAddr).safeTransferFrom(
            address(this),
            msg.sender,
            tokenId,
            sale.amount,
            ""
        );
        _removeSale(contractAddr, tokenId, sale);
    }

    function _updateSale(
        address contractAddr,
        uint256 tokenId,
        Sale memory sale
    ) internal {
        uint256 i = _findSaleIndexBySeller(tokenIdToSales[contractAddr][tokenId], sale.seller);
        tokenIdToSales[contractAddr][tokenId][i] = sale;
        salesBySeller[msg.sender][contractAddr][tokenId][i] = sale;
    }

    function _removeSale(
        address contractAddr,
        uint256 tokenId,
        Sale memory sale
    ) internal {
        _deleteSale(
            tokenIdToSales[contractAddr][tokenId],
            saleTokenIds[contractAddr],
            sale,
            tokenId,
            true
        );
        _deleteSale(
            salesBySeller[sale.seller][contractAddr][tokenId],
            saleTokenIdsBySeller[sale.seller][contractAddr],
            sale,
            tokenId,
            false
        );
    }

    function _deleteSale(
        Sale[] storage sales,
        uint256[] storage tokenIds,
        Sale memory sale,
        uint256 tokenId,
        bool fixClaim
    ) internal {
        uint256 i = _findSaleIndex(sales, sale);
        sales[i].amount -= sale.amount;
        for (uint256 j; j < sales[i].offerers.length; ++j) {
            if (sales[i].offerAmounts[j] > sales[i].amount) {
                if (fixClaim) {
                    claimable[sales[i].offerers[j]][sales[i].payment] +=
                        (sales[i].offerAmounts[j] - sales[i].amount) *
                        sales[i].offerPrices[j];
                }
                sales[i].offerAmounts[j] = sales[i].amount;
            }
        }
        if (sales[i].amount == 0) {
            sales[i] = sales[sales.length - 1];
            sales.pop();
            if (sales.length == 0) {
                tokenIds.remove(tokenId);
            }
        }
    }

    function _removeOfferAt(Sale storage sale, uint256 i) internal {
        sale.offerers.removeAt(i);
        sale.offerPrices.removeAt(i);
        sale.offerAmounts.removeAt(i);
    }

    function _createOffer(
        Sale[] storage sales,
        Sale memory sale,
        uint256 price,
        uint256 curPrice
    ) internal {
        uint256 i = _findSaleIndex(sales, sale);
        require(sales[i].amount >= sale.amount, "Insufficient Sale");
        uint256 j = sales[i].offerers.findIndex(msg.sender);
        if (j < sales[i].offerers.length) {
            require(sales[i].offerPrices[j] == price, "Invalid Price");
            sales[i].offerAmounts[j] += sale.amount;
        } else {
            require(price < curPrice, "Invalid Price");
            sales[i].offerers.push(msg.sender);
            sales[i].offerPrices.push(price);
            sales[i].offerAmounts.push(sale.amount);
        }
    }

    function _updateOffer(
        address contractAddr,
        uint256 tokenId,
        Sale[] storage sales,
        Sale memory sale,
        uint256 price,
        uint256 curPrice,
        uint256 amount
    ) internal {
        require(price < curPrice, "Invalid Price");
        uint256 i = _findSaleIndex(sales, sale);
        require(sales[i].amount >= sale.amount, "Insufficient Sale");
        uint256 j = sales[i].offerers.findIndex(msg.sender);
        require(j < sales[i].offerers.length, "Not found offer");
        uint256 oldPay = sales[i].offerAmounts[j] * sales[i].offerPrices[j];
        uint256 newPay = price * amount;
        if (newPay > oldPay) {
            PaymentLibrary.escrowFund(tokenAddrs[sale.payment], newPay - oldPay);
        }
        else {
             PaymentLibrary.payFund(
                tokenAddrs[sale.payment],
                oldPay - newPay,
                sales[i].offerers[j],
                contractAddr,
                tokenId
            );
        }

        sales[i].offerPrices[j] = price;
        sales[i].offerAmounts.push(amount);
    }

    function _removeOffer(
        Sale[] storage sales,
        Sale memory sale,
        address offerer
    ) internal {
        uint256 i = _findSaleIndex(sales, sale);
        uint256 j = sales[i].offerers.findIndex(offerer);
        require(j < sales[i].offerers.length, "No Offer");
        require(sales[i].offerAmounts[j] >= sale.amount, "Insufficient Offer");
        sales[i].offerAmounts[j] -= sale.amount;
        if (sales[i].offerAmounts[j] == 0) {
            _removeOfferAt(sales[i], j);
        }
    }

    function _findSaleIndex(Sale[] memory sales, Sale memory sale)
        internal
        pure
        returns (uint256 i)
    {
        for (; i < sales.length; ++i) {
            if (
                sale.payment == sales[i].payment &&
                sale.startPrice == sales[i].startPrice &&
                sale.endPrice == sales[i].endPrice &&
                sale.startedAt == sales[i].startedAt &&
                sale.duration == sales[i].duration &&
                sale.seller == sales[i].seller
            ) {
                break;
            }
        }
        require(i < sales.length, "Not On Sale");
    }

    function _findSaleIndexBySeller(Sale[] memory sales, address seller)
        internal
        pure
        returns (uint256 i)
    {
        for (; i < sales.length && sales[i].seller != seller; ++i) {}
        require(i < sales.length, "Not On Sale");
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

    function getSalesByNFT(address contractAddr, uint256 tokenId)
        external
        view
        returns (Sale[] memory sales, uint256[] memory currentPrices)
    {
        sales = tokenIdToSales[contractAddr][tokenId];
        currentPrices = new uint256[](sales.length);
        for (uint256 i; i < sales.length; ++i) {
            currentPrices[i] = getCurrentPrice(sales[i]);
        }
    }

    function getSalesBySellerNFT(
        address seller,
        address contractAddr,
        uint256 tokenId
    )
        external
        view
        returns (Sale[] memory sales, uint256[] memory currentPrices)
    {
        sales = salesBySeller[seller][contractAddr][tokenId];
        currentPrices = new uint256[](sales.length);
        for (uint256 i; i < sales.length; ++i) {
            currentPrices[i] = getCurrentPrice(sales[i]);
        }
    }

    function getSale(
        address contractAddr,
        uint256 tokenId,
        Sale memory sl
    ) external view returns (Sale memory sale, uint256 currentPrice) {
        sale = tokenIdToSales[contractAddr][tokenId][
            _findSaleIndex(tokenIdToSales[contractAddr][tokenId], sl)
        ];
        currentPrice = getCurrentPrice(sl);
    }

    function getSales(address contractAddr)
        external
        view
        returns (Sale[] memory sales, uint256[] memory currentPrices)
    {
        uint256 length;
        uint256[] storage tokenIds = saleTokenIds[contractAddr];
        for (uint256 i; i < tokenIds.length; ) {
            length += tokenIdToSales[contractAddr][tokenIds[i++]].length;
        }
        sales = new Sale[](length);
        currentPrices = new uint256[](length);
        length = 0;
        for (uint256 i; i < tokenIds.length; ) {
            Sale[] storage curSales = tokenIdToSales[contractAddr][
                tokenIds[i++]
            ];
            for (uint256 j; j < curSales.length; ++j) {
                sales[length] = curSales[j];
                currentPrices[length++] = getCurrentPrice(curSales[j]);
            }
        }
    }

    function getSalesBySeller(address contractAddr, address owner)
        external
        view
        returns (Sale[] memory sales, uint256[] memory currentPrices)
    {
        uint256 length;
        uint256[] storage tokenIds = saleTokenIdsBySeller[owner][contractAddr];
        for (uint256 i; i < tokenIds.length; ) {
            length += salesBySeller[owner][contractAddr][tokenIds[i++]].length;
        }
        sales = new Sale[](length);
        currentPrices = new uint256[](length);
        length = 0;
        for (uint256 i; i < tokenIds.length; ) {
            Sale[] storage curSales = salesBySeller[owner][contractAddr][
                tokenIds[i++]
            ];
            for (uint256 j; j < curSales.length; ++j) {
                sales[length] = curSales[j];
                currentPrices[length++] = getCurrentPrice(curSales[j]);
            }
        }
    }

    function getCurrentPrice(Sale memory sale)
        public
        view
        returns (uint256 val)
    {
        if (block.timestamp >= sale.startedAt + sale.duration) {
            val = sale.endPrice;
        }
        val = (sale.startPrice -
            ((sale.startPrice - sale.endPrice) *
                (block.timestamp - sale.startedAt)) /
            sale.duration);
    }

    function getSaleTokens(address contractAddr)
        public
        view
        returns (uint256[] memory)
    {
        return saleTokenIds[contractAddr];
    }

    function getSaleTokensBySeller(address contractAddr, address seller)
        public
        view
        returns (uint256[] memory)
    {
        return saleTokenIdsBySeller[seller][contractAddr];
    }
}
