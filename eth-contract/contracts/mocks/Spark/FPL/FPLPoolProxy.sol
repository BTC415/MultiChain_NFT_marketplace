// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./FPLPoolStorageStructure.sol";

contract NFTPredictionPoolProxy is NFTPredictionPoolStorageStructure {
    modifier onlyPoolCreator() {
        require(msg.sender == poolCreator, "msg.sender is not an owner");
        _;
    }

    event ImplementationUpgraded();

    constructor() {
        poolCreator = msg.sender;
        upgradeEnabled = true;
    }

    // here we can upgrade our implementation
    function upgradeTo(address _newNFTPredictionPoolImplementation)
        external
        onlyPoolCreator
    {
        require(upgradeEnabled, "Upgrade is not enabled yet");
        require(
            nftPredictionPoolImplementation !=
                _newNFTPredictionPoolImplementation
        );
        _setNFTPoolImplementation(_newNFTPredictionPoolImplementation);
        upgradeEnabled = false;
    }

    /**
     * @notice StakingPoolImplementation can't be upgraded unless superAdmin sets upgradeEnabled
     */
    function enableUpgrade() external onlyOwner {
        upgradeEnabled = true;
    }

    function disableUpgrade() external onlyOwner {
        upgradeEnabled = false;
    }

    // initializer modifier is used to make sure initialize() is not called more than once
    // because we want it to act like a constructor
    function initialize(
        string memory _poolType,
        string memory _priceCurrency,
        ISparksToken _sparksToken,
        IRewardManager _rewardManager,
        IPredictionNumber _predictionNumber,
        address _nftCollection,
        // address _usdStorage,
        // address _usdTokenAddress,
        // address _nftToken,
        // address _poolCreator,
        address[4] memory _storageUSDIDOCreator,
        uint256[11] memory _variables,
        uint256[8] memory _ranks,
        uint256[8] memory _percentages
    ) public initializer onlyPoolCreator {
        // we should call inits because we don't have a constructor to do it for us
        OwnableUpgradeable.__Ownable_init();
        ContextUpgradeable.__Context_init();

        require(
            _variables[0] > block.timestamp,
            "0301 launch date can't be in the past"
        );

        require(
            _variables[10] == erc721 || _variables[10] == erc1155,
            "0302 only 721 and 1155 ERCs"
        );

        nftCollection = _nftCollection;

        poolType = _poolType;
        priceCurrency = _priceCurrency;

        sparksToken = _sparksToken;
        rewardManager = _rewardManager;
        predictionNumberContract = _predictionNumber;

        usdStorage = _storageUSDIDOCreator[0];
        usdToken = IERC20(_storageUSDIDOCreator[1]);

        nftToken = _storageUSDIDOCreator[2];
        poolCreator = _storageUSDIDOCreator[3];

        // deployDate = block.timestamp;
        launchDate = _variables[0];

        maturityTime = _variables[1];
        lockTime = _variables[2];
        purchaseExpirationTime = _variables[3];

        sizeAllocation = _variables[4];
        stakeApr = _variables[5];
        prizeAmount = _variables[6];
        stakeTaxRate = _variables[7];
        purchasePriceInUSD = _variables[8];
        minimumStakeAmount = _variables[9];
        nftType = _variables[10];

        for (uint256 i = 0; i < _ranks.length; i++) {
            if (_percentages[i] == 0) break;

            prizeRewardRates.push(
                PrizeRewardRate({rank: _ranks[i], percentage: _percentages[i]})
            );
        }

        lps.launchDate = launchDate;
        lps.lockTime = lockTime;
        lps.maturityTime = maturityTime;
        lps.floorPriceOnMaturity = floorPriceOnMaturity;
        lps.prizeAmount = prizeAmount;
        lps.stakeApr = stakeApr;
        lps.isMatured = isMatured;
    }

    fallback() external payable {
        address opr = nftPredictionPoolImplementation;
        require(opr != address(0));
        assembly {
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(gas(), opr, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch result
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }

    // Added to get rid of the warning
    receive() external payable {
        // custom function code
    }

    function _setNFTPoolImplementation(address _newNFTPool) internal {
        nftPredictionPoolImplementation = _newNFTPool;
        emit ImplementationUpgraded();
    }
}
