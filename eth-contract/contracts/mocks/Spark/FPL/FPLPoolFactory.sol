// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../Role/PoolCreator.sol";
import "../interfaces/IRewardManager.sol";
import "./FPLPoolProxy.sol";

contract NFTPredictionPoolFactory is PoolCreator {
    ISparksToken public immutable sparksToken;
    IRewardManager public immutable rewardManager;
    IPredictionNumber public predictionNumberContract;
    address public usdStorage;

    address public superAdmin;
    address public immutable usdTokenAddress;
    address public nftPredictionPoolImplementationAddr;

    uint256 public nftPoolTaxRate;
    uint256 public minimumStakeAmount;

    event PoolCreated(
        address indexed pool,
        string poolType,
        string priceCurrency,
        address nftContract,
        // uint256 launchDate,
        // uint256 maturityTime,
        // uint256 lockTime,
        // uint256 purchaseExpirationTime,
        // uint256 sizeAllocation,
        // uint256 stakeApr,
        // uint256 prizeAmount,
        // uint256 stakingPoolTaxRate,
        // uint256 purchasePriceInUSD,
        // uint256 minimumStakeAmount,
        // uint256 nftType
        uint256[11] variables,
        uint256[8] ranks,
        uint256[8] percentages
    );

    event NewNFTPoolImplemnetationWasSet();

    event NewSuperAdminWasSet();
    event NewUSDStorageWasSet();
    event NewPredictionNumberWasSet();

    constructor(
        ISparksToken _sparksToken,
        IRewardManager _rewardManager,
        IPredictionNumber _predictionNumber,
        address _usdStorage,
        address _usdTokenAddress,
        address _nftPredictionPoolImplementationAddr,
        address _superAdmin
    ) {
        sparksToken = _sparksToken;
        rewardManager = _rewardManager;
        predictionNumberContract = _predictionNumber;

        usdStorage = _usdStorage;
        usdTokenAddress = _usdTokenAddress;

        nftPredictionPoolImplementationAddr = _nftPredictionPoolImplementationAddr;
        superAdmin = _superAdmin;

        nftPoolTaxRate = 300;
    }

    function createPoolProxy(
        string memory _poolType,
        string memory _priceCurrency,
        address _nftToken,
        address _nftCollection,
        // uint256 launchDate,
        // uint256 maturityTime,
        // uint256 lockTime,
        // uint256 purchaseExpirationTime,
        // uint256 sizeAllocation,
        // uint256 stakeApr,
        // uint256 prizeAmount,
        // uint256 burnRate,
        // uint256 purchasePriceInUSD,
        // uint256 minimumStakeAmount,
        // uint256 nftType
        uint256[11] memory _variables,
        uint256[8] memory _ranks,
        uint256[8] memory _percentages
    ) external onlyPoolCreator returns (address) {
        require(
            _ranks.length == _percentages.length,
            "length of ranks and percentages should be same"
        );

        NFTPredictionPoolProxy nftPoolProxy = new NFTPredictionPoolProxy();
        address nftPoolProxyAddr = address(nftPoolProxy);

        nftPoolProxy.upgradeTo(nftPredictionPoolImplementationAddr);

        if (_variables[6] == 0) {
            _variables[6] = nftPoolTaxRate;
        }

        address[4] memory storageUSDIDOCreator = [
            usdStorage,
            usdTokenAddress,
            _nftToken,
            _msgSender()
        ];

        nftPoolProxy.initialize(
            _poolType,
            _priceCurrency,
            sparksToken,
            rewardManager,
            predictionNumberContract,
            _nftCollection,
            storageUSDIDOCreator,
            _variables,
            _ranks,
            _percentages
        );

        emit PoolCreated(
            nftPoolProxyAddr,
            _poolType,
            _priceCurrency,
            _nftToken,
            _variables,
            _ranks,
            _percentages
        );

        nftPoolProxy.transferOwnership(superAdmin);

        rewardManager.addPool(nftPoolProxyAddr);

        return nftPoolProxyAddr;
    }

    // Call this in case you want to use a new StakingPoolImplementation from now on
    // Notice that in case you want to upgrade a working pool, you should not call this
    // ToDO: need new modifier other than onlyPoolCreator to prevent mistakes?
    function setNewNFTPoolImplementationAddr(address _ImpAdr)
        external
        onlyPoolCreator
    {
        require(
            nftPredictionPoolImplementationAddr != _ImpAdr,
            "This address is the implementation that is  already being used"
        );
        nftPredictionPoolImplementationAddr = _ImpAdr;
        emit NewNFTPoolImplemnetationWasSet();
    }

    /**
     * @notice Changes superAdmin's address so that new StakingPoolProxies have this new superAdmin
     */
    function setNewSuperAdmin(address _superAdmin) external onlyPoolCreator {
        superAdmin = _superAdmin;
        emit NewSuperAdminWasSet();
    }

    function setNewPredictionNumber(IPredictionNumber _predictionNumber)
        external
        onlyPoolCreator
    {
        predictionNumberContract = _predictionNumber;

        emit NewPredictionNumberWasSet();
    }

    function setNewUSDStorage(address _usdStorage) external onlyPoolCreator {
        usdStorage = _usdStorage;
        emit NewUSDStorageWasSet();
    }

    function setDefaultTaxRate(uint256 newStakingPoolTaxRate)
        external
        onlyPoolCreator
    {
        require(
            newStakingPoolTaxRate < 10000,
            "0720 Tax connot be over 100% (10000 BP)"
        );
        nftPoolTaxRate = newStakingPoolTaxRate;
    }
}
