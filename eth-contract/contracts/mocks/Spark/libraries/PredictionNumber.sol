// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

// ToDo: turn this into a library

contract PredictionNumber is Context, Ownable {
    using SafeMath for uint256;

    uint256[6] public predictionRanges;

    event PredictionRangeSettled(uint256[6] newRanges);

    constructor(uint256[6] memory _newPredictionRanges) {
        predictionRanges = _newPredictionRanges;

        emit PredictionRangeSettled(predictionRanges);
    }

    function setNewPredictionLimits(uint256[6] memory _newPredictionRanges)
        public
        onlyOwner
    {
        predictionRanges = _newPredictionRanges;

        emit PredictionRangeSettled(predictionRanges);
    }

    function getNumberOfPredictions(uint256 _amount)
        public
        view
        returns (uint256)
    {
        uint256 PredictionFrontier0 = predictionRanges[0];

        uint256 PredictionFrontier1 = PredictionFrontier0 + predictionRanges[1];

        uint256 PredictionFrontier2 = PredictionFrontier1 + predictionRanges[2];

        uint256 PredictionFrontier3 = PredictionFrontier2 + predictionRanges[3];

        uint256 PredictionFrontier4 = PredictionFrontier3 + predictionRanges[4];

        uint256 PredictionFrontier5 = PredictionFrontier4 + predictionRanges[5];

        if (_amount < PredictionFrontier0) {
            return 1;
        } else if (_amount < PredictionFrontier1) {
            return 2;
        } else if (_amount < PredictionFrontier2) {
            return 3;
        } else if (_amount < PredictionFrontier3) {
            return 4;
        } else if (_amount < PredictionFrontier4) {
            return 5;
        } else if (_amount < PredictionFrontier5) {
            return 6;
        } else {
            return (_amount.div(predictionRanges[5]) + 1);
        }
    }
}
