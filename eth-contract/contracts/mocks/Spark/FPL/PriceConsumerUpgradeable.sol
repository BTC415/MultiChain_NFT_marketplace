// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract PriceConsumerUpgradeable is Initializable {
    AggregatorV3Interface internal priceFeed;

    /**
     * @param _oracle The chainlink node oracle address to send requests
    */
    function __PriceConsumer_initialize(address _oracle) public initializer {
        priceFeed = AggregatorV3Interface(_oracle);
    }

    /**
     * @notice Returns decimals for oracle contract
    */
    function getDecimals() public view returns (uint8) {
        uint8 decimals = priceFeed.decimals();
        return decimals;
    }

    /**
     * @notice Returns the latest price from oracle contract
    */
    function getLatestPrice() public view returns (uint256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();

        return price >= 0 ? uint256(price) : 0;
    }
}
