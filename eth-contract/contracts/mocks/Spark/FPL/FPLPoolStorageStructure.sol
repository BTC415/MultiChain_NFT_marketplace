// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// Note that we must use upgradeable forms of these contracts, otherwise we must set our contracts
// as abstract because the top level contract which is StakingPoolProxy does not have a constructor
// to call their constructors in it, so to avoid that error we must use upgradeable parent contrats
// their code size doesn't have noticable overheads
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

import "../interfaces/IRewardManager.sol";
import "../interfaces/ISparksToken.sol";
import "../interfaces/IPredictionNumber.sol";

import "../libraries/BasisPoints.sol";
import "../libraries/CalculateRewardLib.sol";
import "../libraries/ClaimRewardLib.sol";

contract NFTPredictionPoolStorageStructure is
    OwnableUpgradeable,
    ERC721Holder,
    ERC1155Holder
{
    address public nftPredictionPoolImplementation;
    address public poolCreator;

    // declared for passing params to libraries
    struct LibParams {
        uint256 launchDate;
        uint256 lockTime;
        uint256 maturityTime;
        uint256 floorPriceOnMaturity;
        uint256 prizeAmount;
        uint256 stakeApr;
        bool isMatured;
    }
    LibParams public lps;

    struct StakeWithPrediction {
        uint256 stakedBalance;
        uint256 stakedTime;
        uint256 amountWithdrawn;
        uint256 lastWithdrawalTime;
        // uint256 pricePrediction1;
        // uint256 pricePrediction2;

        uint256[] pricePredictions;
        uint256 difference;
        uint256 rank;
        bool didPrizeWithdrawn;
        bool didUnstake;
    }

    struct NFTWithID {
        bool isWinner;
        bool isUSDPaid;
        uint256 nftID;
    }

    struct PrizeRewardRate {
        uint256 rank;
        uint256 percentage;
    }

    address[] public stakers;
    address[] public winnerStakers;
    PrizeRewardRate[] public prizeRewardRates;

    mapping(address => StakeWithPrediction) public predictions;
    mapping(address => NFTWithID) public nftRecipients;

    // it wasn't possible to use totem token interface since we use taxRate variable
    ISparksToken public sparksToken;
    IRewardManager public rewardManager;
    address public usdStorage;
    IERC20 public usdToken;
    address public nftToken;

    IPredictionNumber public predictionNumberContract;

    // can be "ERC721" or "ERC1155"
    uint256 public constant erc721 = 721;
    uint256 public constant erc1155 = 1155;

    uint256 public nftType;

    string public poolType;
    // since most NFT's price is settled in ETH, but can be "BNB" or "USDT" too
    string public priceCurrency;

    // 100 means 1%
    uint256 public constant sizeLimitRangeRate = 500;

    // the default dexDecimal is 8 but can be modified in setIDOPrices
    uint256 public constant dexDecimal = 8;

    uint256 public constant tier1 = 3000 * (10**18);
    uint256 public constant tier2 = 30000 * (10**18);
    uint256 public constant tier3 = 150000 * (10**18);

    uint256 public launchDate;
    uint256 public lockTime;
    uint256 public maturityTime;
    uint256 public purchaseExpirationTime;

    uint256 public sizeAllocation; // total TOTM can be staked
    uint256 public stakeApr; // the annual return rate for staking TOTM

    uint256 public prizeAmount;

    uint256 public stakeTaxRate;
    uint256 public minimumStakeAmount;

    uint256 public totalStaked;

    // matruing price and purchase price should have same decimals
    uint256 public floorPriceOnMaturity;
    uint256 public purchasePriceInUSD;

    bool public isAnEmergency;
    bool public isActive;
    bool public isLocked;
    bool public isMatured;
    bool public isDeleted;

    /**
     * @dev StakingPoolImplementation can't be upgraded unless superAdmin sets this flag.
     */
    bool public upgradeEnabled;

    /// @notice added for FPL
    address public nftCollection;
}
