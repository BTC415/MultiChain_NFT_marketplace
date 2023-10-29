// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.9;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import "./libraries/ArrayLibrary.sol";
import "./libraries/PaymentLibrary.sol";

import "./interfaces/AddressesInterface.sol";

abstract contract MarketplaceBase is
    Initializable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    using ArrayLibrary for address[];
    using ArrayLibrary for uint256[];

    address public addressesContractAddr;
    address[2] public tokenAddrs;
    mapping(address => uint256[2]) public claimable;

    modifier isProperContract(address contractAddr) {
        require(addressesContractAddr != address(0), "No Address Contract");
        require(
            AddressesInterface(addressesContractAddr).isVerified(contractAddr),
            "Not Verified"
        );
        _;
    }

    function initialize() public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {}

    function setAddressesContractAddr(address contractAddr) external onlyOwner {
        addressesContractAddr = contractAddr;
    }

    function setSparkTokenContractAddr(address newSparkAddr)
        external
        onlyOwner
    {
        tokenAddrs[1] = newSparkAddr;
    }

    function claim(uint256 amount, uint8 index) external {
        require(amount <= claimable[msg.sender][index], "Exceeds Claimable");
        claimable[msg.sender][index] -= amount;
        PaymentLibrary.transferFund(tokenAddrs[index], amount, msg.sender);
    }
}
