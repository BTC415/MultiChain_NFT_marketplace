// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.9;

interface ProxyRegistryInterface {
    function proxies(address addr, address operator)
        external
        view
        returns (bool);
}
