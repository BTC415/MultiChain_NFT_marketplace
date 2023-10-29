// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.9;

contract ProxyRegistry {
    mapping(address => mapping(address => bool)) public proxies;

    function setProxy(address addr) external {
        proxies[msg.sender][addr] = true;
    }
}
