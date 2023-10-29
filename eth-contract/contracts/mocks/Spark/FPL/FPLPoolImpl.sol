// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./FPLPoolStorageStructure.sol";

contract NFTPredictionPoolImplementation is
    NFTPredictionPoolStorageStructure
{
    using BasisPoints for uint256;
    using SafeMath for uint256;
    using CalculateRewardLib for *;
    using ClaimRewardLib for *;

    modifier onlyPoolCreator {
        require(
            _msgSender() == poolCreator,
            "0600 caller is not a pool creator"
        );
        _;
    }

    event Stake(address indexed user, uint256 amount, uint256[] pricePredictions);
    event WithdrawReturn(address indexed user, uint256 stakingReturn);
    event WithdrawPrize(address indexed user, uint256 prize);
    event Unstake(address indexed user, uint256 amount);
    event PayUSDForNFT(address indexed user, uint256 usdAmount, uint256 nftID);

    event WithdrawNFT(address indexed user, uint256 nftID);

    event PoolActivated();
    event PoolDeactivated();

    event PoolLocked();
    event PoolSorted();
    event PoolMatured();
    event PoolDeleted();

    function setActivationStatus(bool _activationStatus) 
        external 
        onlyPoolCreator 
    {
        require(isActive != _activationStatus, "Not changing the activation status");
        isActive = _activationStatus;

        if (isActive) emit PoolActivated();
        else emit PoolDeactivated();
    }

    // ToDo: start here

    function stake(uint256 _amount, uint256[] memory _pricePredictions) external {
        
        require(
            isActive && block.timestamp > launchDate,
            "0613 pool is not active"
        );

        require(
            !isLocked, 
            "0610 Pool is locked"
        );

        require(
            block.timestamp < (launchDate + lockTime),
            "0316 Can not stake after lock date"
        );
        
        require(
            _amount >= minimumStakeAmount, 
            "0611 Amount can't be less than the minimum"
        );
        //checking if the user is already staked or not
        require(
            predictions[_msgSender()].stakedBalance == 0, 
            "0614 this user is already staked"
        );

        uint256 limitRange = sizeAllocation.mulBP(sizeLimitRangeRate);

        require(
            // the total amount of stakes can exceed size allocation by 5%
            totalStaked.add(_amount) <= sizeAllocation.add(limitRange),
            "0612 Can't stake above size allocation"
        );

        uint256 predictionLimit = getPredictionLimit(_amount);

        require(
            _pricePredictions.length == predictionLimit,
            "0617 prediction number doesn't match limit"
        );

        uint256 stakeTaxAmount = 0;
        // now the stakeTaxAmount is the staking tax and the _amount is initial amount minus the staking tax
        (stakeTaxAmount, _amount) = _getStakingTax(_amount);

        sparksToken.transferFrom(
            _msgSender(),
            address(this),
            (_amount + stakeTaxAmount)
        );

        // TODO: which address must be used for staking tax
        if (stakeTaxAmount > 0)
            sparksToken.transfer(sparksToken.getTaxationWallet(), stakeTaxAmount);

        totalStaked = totalStaked.add(_amount);

        _stake(_msgSender(), _amount, _pricePredictions);

        if (totalStaked >= sizeAllocation) {
            // if the staking pool has not anymore capacity then it is locked
            _lockPool();
        }

        emit Stake(_msgSender(), _amount, _pricePredictions);
    }

    function _stake(address _staker, uint256 _amount, uint256[] memory _pricePredictions) internal {
        stakers.push(
            _staker
        );

        // uint256 _modifiedPricePrediction;

        // uint256 tier2TaxAmount = 0;
        // uint256 taxedTier2 =0; 
        /// @dev now the stakeTaxAmount is the staking tax and the _amount is initial amount minus the staking tax
        // (tier2TaxAmount, taxedTier2) = _getStakingTax(tier2);


        // // tier2 = 30000*(10**18)
        // if (_amount >= taxedTier2) {
        //     _modifiedPricePrediction = _pricePrediction2;
        // } else {
        //     _modifiedPricePrediction = 0;
        // }

        predictions[_staker] = StakeWithPrediction({
                stakedBalance: _amount,
                stakedTime: block.timestamp,
                amountWithdrawn: 0,
                lastWithdrawalTime: block.timestamp,
                // pricePrediction1: _pricePrediction1,
                // // if the staked amount was less than tier1 the pricePrediction2 would be 0
                // pricePrediction2: _modifiedPricePrediction,
                pricePredictions: _pricePredictions,
                difference: type(uint256).max,
                rank: type(uint256).max,
                didPrizeWithdrawn: false,
                didUnstake: false
            });
    }


    function claimWithStakingReward() external {
        uint256 stakingReturn = 
            ClaimRewardLib.getStakingReturn(
                predictions[_msgSender()],
                lps
            );

        if (stakingReturn > 0) {

            /// @dev Send the token reward only when rewardManager has the enough funds
            require(
                sparksToken.balanceOf(address(rewardManager)) >= stakingReturn, 
                "Not enough balance in reward manager"
            );

            // _wthdraw don't withdraw actually, and only update the array in the map
            ClaimRewardLib.withdrawStakingReturn(stakingReturn, predictions[_msgSender()]);
        

            // all transfers should be in require, rewardUser is using require
            rewardManager.rewardUser(_msgSender(), stakingReturn);
        }

        if (isMatured) {

            // Users can't unstake until the pool matures
            uint256 stakedBalance = CalculateRewardLib.getTotalStakedBalance(predictions[_msgSender()]);
            if (stakedBalance > 0) {
                // _wthdraw don't withdraw actually, and only update the array in the map
                ClaimRewardLib.withdrawStakedBalance(predictions[_msgSender()]);

                sparksToken.transfer(_msgSender(), stakedBalance);

                emit Unstake(_msgSender(), stakedBalance);
            }
        }

        emit WithdrawReturn(_msgSender(), stakingReturn);
    }

    
    function purchaseNFT() external {
        require(
            isMatured, 
            "0670 pool is not matured"
        );

        require(
            block.timestamp < launchDate + lockTime + maturityTime + purchaseExpirationTime,
            "0675 purchase expired"
        );

        require(
            nftRecipients[_msgSender()].isWinner, 
            "0671 only winners can purchase"
        );

        uint256 totalPrize = ClaimRewardLib.getPrize(
            predictions[_msgSender()],
            lps,
            prizeRewardRates
        );

        if (!nftRecipients[_msgSender()].isUSDPaid) {
            uint256 totalUSDAmount = usdPriceForNFT();

            usdToken.transferFrom(
                _msgSender(), 
                usdStorage, 
                totalUSDAmount
            );

            ClaimRewardLib.payUSDForNFT(nftRecipients[_msgSender()]);

            emit PayUSDForNFT(_msgSender(), totalUSDAmount, nftRecipients[_msgSender()].nftID);
        }

        if (totalPrize > 0) {

            require(
                sparksToken.balanceOf(address(rewardManager)) >= totalPrize, 
                "Not enough balance in reward manager"
            );

            ClaimRewardLib.withdrawPrize(predictions[_msgSender()]);

            // all transfers should be in require, rewardUser is using require
            rewardManager.rewardUser(_msgSender(), totalPrize);

            emit WithdrawPrize(_msgSender(), totalPrize);
        }
    }

    function usdPriceForNFT()
        public 
        view
        returns (uint256)
    {
        uint256 usdAmount = purchasePriceInUSD.mul(10**18);

        usdAmount = usdAmount.div(10**dexDecimal);

        return usdAmount;    
    }


    function lockPool() public onlyPoolCreator {
        require(
            block.timestamp >= launchDate + lockTime,
            "0690 Can't lock pool before lock time"
        );
        _lockPool();
    }

    function _lockPool() internal {
        isLocked = true;

        emit PoolLocked();
    }

    function updateNFTType(uint256 _nftType) public onlyPoolCreator {
        require(
            _nftType == erc721 || _nftType == erc1155,
            "0302 only 721 and 1155 ERCs"
        );

        nftType = _nftType;
    }

    function endNFTPrediction() external onlyPoolCreator {

        require(
            block.timestamp >= launchDate + lockTime + maturityTime,
            "0660 Can't end pool before the maturity time"
        );

        if (stakers.length > 0) {
            require(
                winnerStakers.length != 0,
                "0662 first should sort"
            );
        }


        uint256 max = winnerStakers.length > 25 ? 25 : winnerStakers.length;
        for (uint256 i = 0; i < max; i++) {

            predictions[winnerStakers[i]].rank = 
                i + 1;
        }

        // there is possibility that the size allocation is not reached 
        // and the isLocked is not set to ture
        isLocked = true;
        isMatured = true;

        lps.isMatured = true;

        emit PoolMatured();
    }

    function deletePool() external onlyPoolCreator {
        isDeleted = true;
        emit PoolDeleted();
    }

    function _getStakingTax(uint256 amount)
        internal
        view
        returns (uint256, uint256)
    {
        if (stakeTaxRate == 0) {
            return (0, amount);
        }
        return (
            amount.mulBP(stakeTaxRate),
            amount.sub(amount.mulBP(stakeTaxRate))
        );
    }

    function getPredictionLimit(uint256 _amount) 
        public 
        view 
        returns (uint256) 
    {
        return predictionNumberContract.getNumberOfPredictions(_amount);
    }

    function getPricePredictionsOfAnAddress(address _staker) 
        public 
        view 
        returns(uint256[] memory) 
    {
        StakeWithPrediction storage userStake = predictions[_staker];

        return userStake.pricePredictions;

    }


    function setNFTFloorPriceOnMaturity(uint256 _floorPriceOnMaturity) external onlyPoolCreator {

        require(
            block.timestamp >= launchDate + lockTime + maturityTime,
            "0660 Can't end pool before the maturity time"
        );
        
        floorPriceOnMaturity = _floorPriceOnMaturity;
        lps.floorPriceOnMaturity = _floorPriceOnMaturity;

    }

    function getPrize(address _staker)
        public
        view
        returns (uint256)
    {
        // since in the getPrizeReward function the maturingPrice is used
        // so we got error if it would not be maturityDate
        uint256 totemPrizeReward = ClaimRewardLib.getPrize(
            predictions[_staker],
            lps,
            prizeRewardRates
        );

        return totemPrizeReward;
    }

    function getStakingReturn(address _staker)
        public
        view
        returns (uint256)
    {
        uint256 stakingReturn = ClaimRewardLib.getStakingReturn(
                predictions[_staker],
                lps
            );

        return stakingReturn;
    }
    

    function getStakers() 
        public 
        view 
        returns(address[] memory) 
    {
        address[] memory addrs = new address[](stakers.length);

        for (uint256 i = 0; i < stakers.length; i++) {
            addrs[i] = stakers[i];
        }

        return (addrs);
    }

    // TODO: waht is the exact number of winners
    function setWinnerStakers(address[25] calldata _addrArray, uint256[25] calldata _idArray)
        external 
        onlyPoolCreator 
    {
        if(winnerStakers.length != 0) {
            delete winnerStakers;
        }

        for (uint256 i = 0; i < 25; i++) {

            // the first 0 address means the other addresses are also 0 so they won't be checked
            if (_addrArray[i] == address(0)) break;

            winnerStakers.push(
                _addrArray[i]
            );

            nftRecipients[_addrArray[i]] = NFTWithID({
                    isWinner: true,
                    isUSDPaid: false,
                    nftID: _idArray[i]
            });    
        }

        emit PoolSorted();
    }

    function withdrawStuckTokens(address _stuckToken, address _receiver, uint256 _amount)
        external
        onlyPoolCreator
    {
        require(
            _stuckToken != address(sparksToken), 
            "0695 Sparks can not be transfered"
        );
        IERC20 stuckToken = IERC20(_stuckToken);
        stuckToken.transfer(_receiver, _amount);
    }

    function withdrawStuckERC721NFTs(address _stuckToken, address _receiver, uint256 _id)
        external
        onlyPoolCreator
    {
        _transferERC721NFTs(_stuckToken, _receiver, _id);
    }

    function _transferERC721NFTs(address _stuckToken, address _receiver, uint256 _id)
        internal
    {
        IERC721 stuckToken = IERC721(_stuckToken);
        stuckToken.safeTransferFrom(address(this), _receiver, _id);
    } 
 
    function withdrawStuckERC1155NFTs(
        address _stuckToken, 
        address _receiver, 
        uint256 _id, 
        uint256 _amount, 
        bytes memory _data
    ) external onlyPoolCreator
    {  
        _transferERC1155NFTs(_stuckToken, _receiver, _id, _amount, _data);
    } 
     
    function _transferERC1155NFTs(
        address _stuckToken, 
        address _receiver, 
        uint256 _id, 
        uint256 _amount, 
        bytes memory _data
    ) internal
    {
        IERC1155 stuckToken = IERC1155(_stuckToken);
        stuckToken.safeTransferFrom(address(this), _receiver, _id, _amount, _data);
    }

    function declareEmergency()
        external
        onlyPoolCreator
    {
        isActive = false;
        isAnEmergency = true;

        _lockPool();
    }

    function emergentWithdraw() external {
        require(
            isAnEmergency,
            "it's not an emergency"
        );

        // Users can't unstake until the pool matures
        uint256 stakedBalance = CalculateRewardLib.getTotalStakedBalance(predictions[_msgSender()]);
        if (stakedBalance > 0) {
            sparksToken.transfer(_msgSender(), stakedBalance);

            // _wthdraw don't withdraw actually, and only update the array in the map
            ClaimRewardLib.withdrawStakedBalance(predictions[_msgSender()]);

            emit Unstake(_msgSender(), stakedBalance);
        }
    }
}