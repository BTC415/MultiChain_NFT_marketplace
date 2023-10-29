// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./NFTBankStorageStructure.sol";

contract NFTBankProxy is NFTBankStorageStructure {

    modifier onlyPoolCreator() {
        require (msg.sender == poolCreator, "msg.sender is not an owner");
        _;
    }

    event ImplementationUpgraded();

    constructor() {
        poolCreator = msg.sender;
        upgradeEnabled = true;
    }

    // here we can upgrade our implementation
    function upgradeTo(address _nftBankImplementation) external onlyPoolCreator {
        require(upgradeEnabled, "Upgrade is not enabled yet");
        require(nftBankImplementation != _nftBankImplementation);
        _setNFTBankImplementation(_nftBankImplementation);
        upgradeEnabled = false;
    }

    /**
     * @notice StakingPoolImplementation can't be upgraded unless superAdmin sets upgradeEnabled
     */
    function enableUpgrade() external onlyOwner{
        upgradeEnabled = true;
    }

    function disableUpgrade() external onlyOwner{
        upgradeEnabled = false;
    }

    // initializer modifier is used to make sure initialize() is not called more than once
    // because we want it to act like a constructor
    function initialize(
        string memory _bankType,
        address _nftToken,
        address _poolCreator,
        uint256[2] memory _variables
    ) public initializer onlyPoolCreator
    {
        // we should call inits because we don't have a constructor to do it for us
        OwnableUpgradeable.__Ownable_init();
        ContextUpgradeable.__Context_init();

        require(
            _variables[0] > block.timestamp,
            "0301 launch date can't be in the past"
        );

        require(
            _variables[1] == erc721 || _variables[1] == erc1155,
            "0302 only 721 and 1155 ERCs"
        );

        bankType = _bankType;

        nftToken = _nftToken;

        poolCreator = _poolCreator;

        nftScheduleStartDate = _variables[0];

        nftType = _variables[1];

        isNFTScheduleSettled = true;
    }

    fallback() external payable {
        address opr = nftBankImplementation;
        require(opr != address(0));
        assembly {
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(gas(), opr, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch result
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }
    
    // Added to get rid of the warning
    receive() external payable {
        // custom function code
    }

    function _setNFTBankImplementation(address _newNFTBank) internal {
        nftBankImplementation = _newNFTBank;
        emit ImplementationUpgraded();
    }
}
