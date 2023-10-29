// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// TODO: provide an interface so IDO-prediction can work with that
interface IRewardManager {

    event SetOperator(address operator);
    event SetRewarder(address rewarder);

    function setOperator(address _newOperator) external;

    function addPool(address _poolAddress) external;

    function rewardUser(address _user, uint256 _amount) external;
}