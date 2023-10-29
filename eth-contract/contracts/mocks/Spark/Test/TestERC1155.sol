// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract TestERC1155 is Context, ERC1155, Ownable {
    using SafeMath for uint256;

    constructor(string memory BASE_URI) ERC1155(BASE_URI) {}

    function mint(address _to, uint256 _tokenId) external {
        _mint(_to, _tokenId, 1, "");
    }
}
