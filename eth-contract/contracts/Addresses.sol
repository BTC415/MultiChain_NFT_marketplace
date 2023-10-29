// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.9;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import "./libraries/ArrayLibrary.sol";

contract Addresses is OwnableUpgradeable {
    using ArrayLibrary for address[];

    enum NFTType {
        NONE,
        EIP721,
        EIP1155
    }

    address[] private normalContracts;
    address[] private multiTokenContracts;
    mapping(address => bool) private verified;
    mapping(address => NFTType) private contractTypes;

    bytes4 private constant INTERFACE_SIGNATURE_ERC721 = 0x80ac58cd;
    bytes4 private constant INTERFACE_SIGNATURE_ERC1155 = 0xd9b67a26;

    modifier exists(address contractAddr) {
        require(existingContract(contractAddr), "Not Existing Contract");
        _;
    }

    modifier doesNotExist(address contractAddr) {
        require(!existingContract(contractAddr), "Exisitng Contract");
        _;
    }

    constructor() {
        _transferOwnership(msg.sender);
    }

    function existingContract(address contractAddr) public view returns (bool) {
        NFTType ctrctType = contractTypes[contractAddr];
        return ctrctType == NFTType.EIP721 || ctrctType == NFTType.EIP1155;
    }

    function add(address contractAddr)
        external
        doesNotExist(contractAddr)
        onlyOwner
    {
        IERC165 ctrct = IERC165(contractAddr);
        if (ctrct.supportsInterface(INTERFACE_SIGNATURE_ERC721)) {
            contractTypes[contractAddr] = NFTType.EIP721;
            normalContracts.push(contractAddr);
        } else if (ctrct.supportsInterface(INTERFACE_SIGNATURE_ERC1155)) {
            contractTypes[contractAddr] = NFTType.EIP1155;
            multiTokenContracts.push(contractAddr);
        } else {
            revert("Unknown NFT Type");
        }
    }

    function getNFTType(address contractAddr)
        external
        view
        exists(contractAddr)
        returns (NFTType)
    {
        return contractTypes[contractAddr];
    }

    function remove(address contractAddr)
        external
        exists(contractAddr)
        onlyOwner
    {
        if (contractTypes[contractAddr] == NFTType.EIP721) {
            normalContracts.remove(contractAddr);
        } else if (contractTypes[contractAddr] == NFTType.EIP1155) {
            multiTokenContracts.remove(contractAddr);
        }
        verified[contractAddr] = false;
    }

    function verify(address contractAddr)
        external
        exists(contractAddr)
        onlyOwner
    {
        require(verified[contractAddr] == false, "Already Verified Contract");
        verified[contractAddr] = true;
    }

    function getNormalContracts() external view returns (address[] memory) {
        return normalContracts;
    }

    function getMultiTokenContracts() external view returns (address[] memory) {
        return multiTokenContracts;
    }

    function getVerifiedNormalContracts()
        external
        view
        returns (address[] memory verifiedContracts)
    {
        uint256 i;
        uint256 length = normalContracts.length;
        uint256 vlength;
        for (; i < length; ++i) {
            if (verified[normalContracts[i]]) {
                ++vlength;
            }
        }
        verifiedContracts = new address[](vlength);
        vlength = 0;
        for (i = 0; i < length; ++i) {
            if (verified[normalContracts[i]]) {
                verifiedContracts[vlength++] = normalContracts[i];
            }
        }
    }

    function getVerifiedMultiTokenContracts()
        external
        view
        returns (address[] memory verifiedContracts)
    {
        uint256 i;
        uint256 length = multiTokenContracts.length;
        uint256 vlength;
        for (; i < length; ++i) {
            if (verified[multiTokenContracts[i]]) {
                ++vlength;
            }
        }
        verifiedContracts = new address[](vlength);
        vlength = 0;
        for (i = 0; i < length; ++i) {
            if (verified[multiTokenContracts[i]]) {
                verifiedContracts[vlength++] = multiTokenContracts[i];
            }
        }
    }

    function isVerified(address contractAddr)
        external
        view
        exists(contractAddr)
        returns (bool)
    {
        return verified[contractAddr];
    }
}
