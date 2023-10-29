// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// TODO: provide an interface so IDO-prediction can work with that
interface IPredictionNumber {

    event PredictionRangeSettled(
        uint256[6] newRanges
    );

    function setNewPredictionLimits(uint256[6] memory _newPredictionRanges) external;

    function getNumberOfPredictions(uint256 _amount) external view returns (uint256);
}