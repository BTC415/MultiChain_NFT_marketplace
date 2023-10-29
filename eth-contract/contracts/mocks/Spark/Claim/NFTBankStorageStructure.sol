// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// Note that we must use upgradeable forms of these contracts, otherwise we must set our contracts
// as abstract because the top level contract which is StakingPoolProxy does not have a constructor
// to call their constructors in it, so to avoid that error we must use upgradeable parent contrats
// their code size doesn't have noticable overheads
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

import "../libraries/BasisPoints.sol";

contract NFTBankStorageStructure is
    OwnableUpgradeable,
    ERC721Holder,
    ERC1155Holder
{
    address public nftBankImplementation;
    address public poolCreator;

    struct NFTWithID {
        bool isWinner;
        bool didNFTwithdrawn;
        uint256 nftID;
    }

    address[] public winners;

    mapping(address => NFTWithID) public nftRecipients;

    address public nftToken;

    // can be "ERC721" or "ERC1155"
    uint256 public constant erc721 = 721;
    uint256 public constant erc1155 = 1155;

    uint256 public nftType;

    string public bankType;

    uint256 public nftScheduleStartDate;
    bool public isNFTScheduleSettled;

    bool public isLocked;
    bool public isDeleted;

    /**
     * @dev StakingPoolImplementation can't be upgraded unless superAdmin sets this flag.
     */
    bool public upgradeEnabled;
}
