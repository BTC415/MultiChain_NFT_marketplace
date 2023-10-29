// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "../interfaces/ILocker.sol";
import "../libraries/BasisPoints.sol";

// TODO: add an interface for this to add the interface instead of
contract SparksToken is ILockerUser, Context, ERC20, Ownable {
    using BasisPoints for uint256;
    using SafeMath for uint256;

    string public constant NAME = "Totem Spark Token";
    string public constant SYMBOL = "SPARX";
    uint8 public constant DECIMALS = 18;
    uint256 public constant INITIAL_SUPPLY =
        325000000 * (10**uint256(DECIMALS));

    address public SeedInvestmentAddr;
    address public StrategicRoundAddr;
    address public PrivateSaleAddr;
    address public PublicSaleAddr;
    address public TeamAllocationAddr;
    address public StakingRewardsAddr;
    address public CommunityDevelopmentAddr;
    address public MarketingDevelopmentAddr;
    address public LiquidityPoolAddr;
    address public AirDropAddr;

    address public taxationWallet;

    // TODO: change this numbers
    uint256 public constant SEED_INVESTMENT =
        19500000 * (10**uint256(DECIMALS)); // 6% for Seed investment
    uint256 public constant STRATEGIC_ROUND =
        32500000 * (10**uint256(DECIMALS)); // 10% for Strategic Round
    uint256 public constant PRIVATE_SALE = 32500000 * (10**uint256(DECIMALS)); // 10% for Private Sale
    uint256 public constant PUBLIC_SALE = 12187500 * (10**uint256(DECIMALS)); // 3.75% for Public Sale
    uint256 public constant TEAM_ALLOCATION =
        25187500 * (10**uint256(DECIMALS)); // 7.75% for Team allocation
    uint256 public constant STAKING_REWARDS =
        65000000 * (10**uint256(DECIMALS)); // 20% for Staking Revawards
    uint256 public constant COMMUNITY_DEVELOPMENT =
        40625000 * (10**uint256(DECIMALS)); // 12.5% for Community development
    uint256 public constant MARKETING_DEVELOPMENT =
        48750000 * (10**uint256(DECIMALS)); // 15% for Community development
    uint256 public constant LIQUIDITY_POOL = 16250000 * (10**uint256(DECIMALS)); // 5% for Liquidity pool
    uint256 public constant AIR_DROP = 32500000 * (10**uint256(DECIMALS)); // 10% for Advisors

    bool private _isDistributionComplete = false;

    ILocker public override locker;

    constructor() ERC20(NAME, SYMBOL) {
        _mint(address(this), INITIAL_SUPPLY);
    }

    function getTaxationWallet() public view returns (address) {
        return TeamAllocationAddr;
    }

    function setTaxationWallet(address _newTaxationWallet) external onlyOwner {
        taxationWallet = _newTaxationWallet;
    }

    function setLocker(address _locker) external onlyOwner {
        require(_locker != address(0), "_locker cannot be address(0)");
        locker = ILocker(_locker);
        emit SetLocker(_locker);
    }

    function setDistributionTeamsAddresses(
        address _SeedInvestmentAddr,
        address _StrategicRoundAddr,
        address _PrivateSaleAddr,
        address _PublicSaleAddr,
        address _TeamAllocationAddr,
        address _StakingRewardsAddr,
        address _CommunityDevelopmentAddr,
        address _MarketingDevelopmentAddr,
        address _LiquidityPoolAddr,
        address _AirDropAddr
    ) public onlyOwner {
        require(!_isDistributionComplete);

        require(_SeedInvestmentAddr != address(0));
        require(_StrategicRoundAddr != address(0));
        require(_PrivateSaleAddr != address(0));
        require(_PublicSaleAddr != address(0));
        require(_TeamAllocationAddr != address(0));
        require(_StakingRewardsAddr != address(0));
        require(_CommunityDevelopmentAddr != address(0));
        require(_MarketingDevelopmentAddr != address(0));
        require(_LiquidityPoolAddr != address(0));
        require(_AirDropAddr != address(0));

        // set parnters addresses
        SeedInvestmentAddr = _SeedInvestmentAddr;
        StrategicRoundAddr = _StrategicRoundAddr;
        PrivateSaleAddr = _PrivateSaleAddr;
        PublicSaleAddr = _PublicSaleAddr;
        TeamAllocationAddr = _TeamAllocationAddr;
        StakingRewardsAddr = _StakingRewardsAddr;
        CommunityDevelopmentAddr = _CommunityDevelopmentAddr;
        MarketingDevelopmentAddr = _MarketingDevelopmentAddr;
        LiquidityPoolAddr = _LiquidityPoolAddr;
        AirDropAddr = _AirDropAddr;

        taxationWallet = TeamAllocationAddr;
    }

    function distributeTokens() public onlyOwner {
        require((!_isDistributionComplete));

        _transfer(address(this), SeedInvestmentAddr, SEED_INVESTMENT);
        _transfer(address(this), StrategicRoundAddr, STRATEGIC_ROUND);
        _transfer(address(this), PrivateSaleAddr, PRIVATE_SALE);
        _transfer(address(this), PublicSaleAddr, PUBLIC_SALE);
        _transfer(address(this), TeamAllocationAddr, TEAM_ALLOCATION);
        _transfer(address(this), StakingRewardsAddr, STAKING_REWARDS);
        _transfer(
            address(this),
            CommunityDevelopmentAddr,
            COMMUNITY_DEVELOPMENT
        );
        _transfer(
            address(this),
            MarketingDevelopmentAddr,
            MARKETING_DEVELOPMENT
        );
        _transfer(address(this), LiquidityPoolAddr, LIQUIDITY_POOL);
        _transfer(address(this), AirDropAddr, AIR_DROP);

        _isDistributionComplete = true;
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal virtual override {
        if (address(locker) != address(0)) {
            locker.lockOrGetPenalty(sender, recipient);
        }
        ERC20._transfer(sender, recipient, amount);
    }
}
