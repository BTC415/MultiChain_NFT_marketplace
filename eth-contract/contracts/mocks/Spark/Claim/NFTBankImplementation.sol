// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./NFTBankStorageStructure.sol";

contract NFTBankImplementation is
    NFTBankStorageStructure
{
    using BasisPoints for uint256;
    using SafeMath for uint256;

    modifier onlyPoolCreator {
        require(
            _msgSender() == poolCreator,
            "0600 caller is not a pool creator"
        );
        _;
    }

    event WithdrawNFT(address indexed user, uint256 nftID);

    event PoolLocked();
    event PoolUnLocked();
    event PoolSorted();
    event PoolDeleted();


    function claimNFT() external {
        require(
            !isLocked, 
            "0670 pool is locked"
        );

        require(
            block.timestamp >= nftScheduleStartDate,
            "0675 start date isn't reached"
        );

        NFTWithID memory _winnerNFTWithID = nftRecipients[_msgSender()];

        require(
            _winnerNFTWithID.isWinner,
            "0671 only winners can purchase"
        );

        if (!_winnerNFTWithID.didNFTwithdrawn) {
            // for rewarding ERC721 NFTs
            if (nftType == erc721) {
                _withdrawNFT(_msgSender());

                _transferERC721NFTs(nftToken, _msgSender(), _winnerNFTWithID.nftID);
            }
                
            // for rewarding ERC1155 NFTs
            if (nftType == erc1155) {
                uint256 thisAmount = 1;
                bytes memory thisBytes = "0x";

                _withdrawNFT(_msgSender());
                    
                _transferERC1155NFTs(nftToken, _msgSender(), _winnerNFTWithID.nftID, thisAmount, thisBytes);
            }
        }
    }

    function _withdrawNFT(
        address _winner
    ) 
        internal
    {
        NFTWithID storage _winnerNFTWithID = nftRecipients[_winner];

        if (_winnerNFTWithID.didNFTwithdrawn) return;

        _winnerNFTWithID.didNFTwithdrawn = true;
    }


    function lockPool() public onlyPoolCreator {
        isLocked = true;

        emit PoolLocked();
    }

    function unLockPool() internal {
        isLocked = false;

        emit PoolUnLocked();
    }

    function deletePool() external onlyPoolCreator {
        isDeleted = true;
        emit PoolDeleted();
    }

    function updateNFTType(uint256 _nftType) public onlyPoolCreator {
        require(
            _nftType == erc721 || _nftType == erc1155,
            "0302 only 721 and 1155 ERCs"
        );

        nftType = _nftType;
    }
    

    function getWinners() 
        public 
        view 
        returns(address[] memory) 
    {
        address[] memory addrs = new address[](winners.length);

        for (uint256 i = 0; i < winners.length; i++) {
            addrs[i] = winners[i];
        }

        return (addrs);
    }

    // TODO: waht is the exact number of winners
    function removeWinners(address[] calldata addrArray)
        external 
        onlyPoolCreator 
    {
        require(
            !isNFTScheduleSettled || block.timestamp < nftScheduleStartDate,
            "0675 start date reached"
        );

        if(winners.length != 0) {
            delete winners;
        }

        for (uint256 i = 0; i < addrArray.length; i++) {

            // the first 0 address means the other addresses are also 0 so they won't be checked
            if (addrArray[i] == address(0)) break;

            nftRecipients[addrArray[i]] = NFTWithID({
                    isWinner: false,
                    didNFTwithdrawn: false,
                    nftID: 0
            });  
        }

        emit PoolDeleted();
    }

    // TODO: waht is the exact number of winners
    function setWinners(address[] calldata _addrArray, uint256[] calldata _idArray)
        external 
        onlyPoolCreator 
    {
        require(
            !isNFTScheduleSettled || block.timestamp < nftScheduleStartDate,
            "0675 start date reached"
        );

        require(
            _addrArray.length == _idArray.length,
            "array length incompatible"
        );

        if(winners.length != 0) {
            delete winners;
        }

        for (uint256 i = 0; i < _addrArray.length; i++) {

            // the first 0 address means the other addresses are also 0 so they won't be checked
            if (_addrArray[i] == address(0)) break;

            winners.push(
                _addrArray[i]
            );

            nftRecipients[_addrArray[i]] = NFTWithID({
                    isWinner: true,
                    didNFTwithdrawn: false,
                    nftID: _idArray[i]
            });    
        }

        emit PoolSorted();
    }

    function withdrawStuckTokens(address _stuckToken, address _receiver, uint256 _amount)
        external
        onlyPoolCreator
    {
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

    function withdrawStuckERC1155NFTs(address _stuckToken, address _receiver, uint256 _id, uint256 _amount, bytes memory _data)
        external
        onlyPoolCreator
    {
        _transferERC1155NFTs(_stuckToken, _receiver, _id, _amount, _data);
    }
    
    function _transferERC1155NFTs(address _stuckToken, address _receiver, uint256 _id, uint256 _amount, bytes memory _data)
        internal
    {
        IERC1155 stuckToken = IERC1155(_stuckToken);
        stuckToken.safeTransferFrom(address(this), _receiver, _id, _amount, _data);
    }
}