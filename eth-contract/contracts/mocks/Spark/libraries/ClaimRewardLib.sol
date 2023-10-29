// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./CalculateRewardLib.sol";
import "./BasisPoints.sol";
import "../FPL/FPLPoolStorageStructure.sol";

library ClaimRewardLib {
    using CalculateRewardLib for *;
    using BasisPoints for uint256;
    using SafeMath for uint256;

    uint256 public constant oracleDecimal = 8;

    ////////////////////////// public functions /////////////////////
    function getStakingReturn(
        NFTPredictionPoolStorageStructure.StakeWithPrediction
            storage _userStake,
        NFTPredictionPoolStorageStructure.LibParams storage _lps
    ) public view returns (uint256) {
        if (_userStake.stakedBalance == 0) return 0;

        uint256 reward = CalculateRewardLib._getStakingReturnPerStake(
            _userStake,
            _lps
        );

        return reward;
    }

    function withdrawStakingReturn(
        uint256 _rewardPerStake,
        NFTPredictionPoolStorageStructure.StakeWithPrediction storage _userStake
    ) public {
        if (_userStake.stakedBalance <= 0) return;

        _userStake.lastWithdrawalTime = block.timestamp;
        _userStake.amountWithdrawn = _userStake.amountWithdrawn.add(
            _rewardPerStake
        );
    }

    function withdrawPrize(
        NFTPredictionPoolStorageStructure.StakeWithPrediction storage _userStake
    ) public {
        if (_userStake.stakedBalance <= 0) return;

        _userStake.didPrizeWithdrawn = true;
    }

    function withdrawStakedBalance(
        NFTPredictionPoolStorageStructure.StakeWithPrediction storage _userStake
    ) public {
        if (_userStake.stakedBalance <= 0) return;

        _userStake.didUnstake = true;
    }

    function getPrize(
        NFTPredictionPoolStorageStructure.StakeWithPrediction
            storage _userStake,
        NFTPredictionPoolStorageStructure.LibParams storage _lps,
        NFTPredictionPoolStorageStructure.PrizeRewardRate[]
            storage _prizeRewardRates
    ) public view returns (uint256) {
        // wihtout the maturing price calculating prize is impossible
        if (!_lps.isMatured) return 0;

        // users that don't stake don't get any prize also
        if (_userStake.stakedBalance <= 0) return 0;

        // uint256 maturingBTCPrizeAmount =
        //     (_lps.usdPrizeAmount.mul(10**oracleDecimal)).div(_lps.maturingPrice);

        uint256 reward = 0;
        // uint256 btcReward = 0;

        // only calculate the prize amount for stakes that are not withdrawn yet
        if (!_userStake.didPrizeWithdrawn) {
            uint256 _totemAmount = CalculateRewardLib._getPrizeAmount(
                _userStake.rank,
                _lps,
                _prizeRewardRates
            );

            reward = reward.add(_totemAmount);
        }

        return reward;
    }

    // function withdrawNFT(
    //     NFTPredictionPoolStorageStructure.NFTWithID storage _winnerNFT
    // )
    //     public
    // {
    //     if (!_winnerNFT.isWinner) return;

    //     _winnerNFT.didNFTwithdrawn = true;
    // }

    function payUSDForNFT(
        NFTPredictionPoolStorageStructure.NFTWithID storage _winnerNFT
    ) public {
        if (_winnerNFT.isUSDPaid) return;

        _winnerNFT.isUSDPaid = true;
    }
}
