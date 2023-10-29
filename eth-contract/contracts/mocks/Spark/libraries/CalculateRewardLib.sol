// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./BasisPoints.sol";
import "../FPL/FPLPoolStorageStructure.sol";

library CalculateRewardLib {
    using BasisPoints for uint256;
    using SafeMath for uint256;

    uint256 public constant dexDecimal = 8;

    function calcStakingReturn(
        uint256 totalRewardRate,
        uint256 timeDuration,
        uint256 totalStakedBalance
    ) public pure returns (uint256) {
        uint256 yearInSeconds = 365 days;

        uint256 first = (yearInSeconds**2).mul(10**8);

        uint256 second = timeDuration
            .mul(totalRewardRate)
            .mul(yearInSeconds)
            .mul(5000);

        uint256 third = totalRewardRate.mul(yearInSeconds**2).mul(5000);

        uint256 forth = (timeDuration**2).mul(totalRewardRate**2).div(6);

        uint256 fifth = timeDuration
            .mul(totalRewardRate**2)
            .mul(yearInSeconds)
            .div(2);

        uint256 sixth = (totalRewardRate**2).mul(yearInSeconds**2).div(3);

        uint256 rewardPerStake = first.add(second).add(forth).add(sixth);

        rewardPerStake = rewardPerStake.sub(third).sub(fifth);

        rewardPerStake = rewardPerStake.mul(totalRewardRate).mul(timeDuration);

        rewardPerStake = rewardPerStake
            .mul(totalStakedBalance)
            .div(yearInSeconds**3)
            .div(10**12);

        return rewardPerStake;
    }

    // getTotalStakedBalance return remained staked balance
    function getTotalStakedBalance(
        NFTPredictionPoolStorageStructure.StakeWithPrediction storage _userStake
    ) public view returns (uint256) {
        if (_userStake.stakedBalance <= 0) return 0;

        uint256 totalStakedBalance = 0;

        if (!_userStake.didUnstake) {
            totalStakedBalance = totalStakedBalance.add(
                _userStake.stakedBalance
            );
        }

        return totalStakedBalance;
    }

    ////////////////////////// internal functions /////////////////////
    function _getPrizeAmount(
        uint256 _rank,
        NFTPredictionPoolStorageStructure.LibParams storage _lps,
        NFTPredictionPoolStorageStructure.PrizeRewardRate[]
            storage _prizeRewardRates
    ) internal view returns (uint256) {
        for (uint256 i = 0; i < _prizeRewardRates.length; i++) {
            if (_rank <= _prizeRewardRates[i].rank) {
                return
                    (_lps.prizeAmount).mulBP(_prizeRewardRates[i].percentage);
            }
        }

        return 0;
    }

    function _getStakingReturnPerStake(
        NFTPredictionPoolStorageStructure.StakeWithPrediction
            storage _userStake,
        NFTPredictionPoolStorageStructure.LibParams storage _lps
    ) internal view returns (uint256) {
        if (_userStake.didUnstake) {
            return 0;
        }

        uint256 maturityDate = _lps.launchDate +
            _lps.lockTime +
            _lps.maturityTime;

        uint256 timeTo = block.timestamp > maturityDate
            ? maturityDate
            : block.timestamp;

        // the reward formula is ((1 + stakeAPR +enhancedReward)^((MaturingDate - StakingDate)/365) - 1) * StakingBalance
        uint256 rewardPerStake = calcStakingReturn(
            _lps.stakeApr,
            timeTo.sub(_userStake.stakedTime),
            _userStake.stakedBalance
        );

        rewardPerStake = rewardPerStake.sub(_userStake.amountWithdrawn);

        return rewardPerStake;
    }
}
