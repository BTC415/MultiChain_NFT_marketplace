// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract WrappedERC20Token is Context, ERC20, Ownable {
    using SafeMath for uint256;

    constructor(string memory NAME, string memory SYMBOL) ERC20(NAME, SYMBOL) {
        _mint(_msgSender(), 100000000000000000000000);
    }
}
