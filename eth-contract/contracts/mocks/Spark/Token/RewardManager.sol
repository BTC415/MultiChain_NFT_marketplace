// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "../interfaces/ISparksToken.sol";
import "../Role/Operator.sol";
import "../Role/Rewarder.sol";

contract RewardManager is Context, Ownable, Operator, Rewarder {
    ISparksToken sparksToken;

    event SetOperator(address operator);
    event SetRewarder(address rewarder);

    constructor(ISparksToken _sparksToken) {
        sparksToken = _sparksToken;
    }

    function setOperator(address _newOperator) public onlyOwner {
        require(
            _newOperator != address(0),
            "0200 New Operator address cannot be zero."
        );

        addOperator(_newOperator);
        addRewarder(_newOperator);
        emit SetOperator(_newOperator);
    }

    function addPool(address _poolAddress) public onlyOperator {
        require(
            _poolAddress != address(0),
            "0210 Pool address cannot be zero."
        );

        addRewarder(_poolAddress);
        emit SetRewarder(_poolAddress);
    }

    function rewardUser(address _user, uint256 _amount) public onlyRewarder {
        require(_user != address(0), "0230 User address cannot be zero.");

        require(sparksToken.transfer(_user, _amount));
    }
}
