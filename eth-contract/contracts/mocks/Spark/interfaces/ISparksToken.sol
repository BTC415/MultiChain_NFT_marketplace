// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// TODO: add an interface for this to add the interface instead of 
interface ISparksToken {
    
    function setLocker(address _locker) external;

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
    ) external;

    function distributeTokens() external;

    function getTaxationWallet() external returns (address);

    function setTaxationWallet(address _newTaxationWallet) external;

    function transfer(address recipient, uint256 amount)
        external
        returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    function balanceOf(address account) external view returns (uint256);
}
