// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../Role/PoolCreator.sol";
import "../interfaces/IRewardManager.sol";
import "./NFTBankProxy.sol";

contract NFTBankFactory is PoolCreator {
    address public superAdmin;
    address public nftBankImplementationAddr;

    event BankCreated(
        address indexed pool,
        string bankType,
        address nftContract,
        // uint256 nftScheduleStartDate,
        // uint256 nftType,
        uint256[2] variables
    );

    event NewNFTBankImplemnetationWasSet();

    event NewSuperAdminWasSet();

    constructor(address _nftBankImplementationAddr, address _superAdmin) {
        nftBankImplementationAddr = _nftBankImplementationAddr;
        superAdmin = _superAdmin;
    }

    function createPoolProxy(
        string memory _bankType,
        address nftToken,
        // uint256 nftScheduleStartDate,
        // uint256 nftType,
        uint256[2] memory _variables
    ) external onlyPoolCreator returns (address) {
        NFTBankProxy nftBankProxy = new NFTBankProxy();
        address nftBankProxyAddr = address(nftBankProxy);

        nftBankProxy.upgradeTo(nftBankImplementationAddr);

        nftBankProxy.initialize(_bankType, nftToken, _msgSender(), _variables);

        emit BankCreated(nftBankProxyAddr, _bankType, nftToken, _variables);

        nftBankProxy.transferOwnership(superAdmin);

        return nftBankProxyAddr;
    }

    // Call this in case you want to use a new StakingPoolImplementation from now on
    // Notice that in case you want to upgrade a working pool, you should not call this
    // ToDO: need new modifier other than onlyPoolCreator to prevent mistakes?
    function setNewBankImplementationAddr(address _ImpAdr)
        external
        onlyPoolCreator
    {
        require(
            nftBankImplementationAddr != _ImpAdr,
            "This address is the implementation that is  already being used"
        );
        nftBankImplementationAddr = _ImpAdr;
        emit NewNFTBankImplemnetationWasSet();
    }

    /**
     * @notice Changes superAdmin's address so that new StakingPoolProxies have this new superAdmin
     */
    function setNewSuperAdmin(address _superAdmin) external onlyPoolCreator {
        superAdmin = _superAdmin;
        emit NewSuperAdminWasSet();
    }
}
