// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

import "../interfaces/ProxyRegistryInterface.sol";

contract Custom1155Royal is ERC1155Supply, ERC2981 {
    uint256 public totalMinted;
    mapping(uint256 => string) private tokenURIs;
    address private proxyRegistry;

    event Minted(uint256 tokenId, uint256 amount, address minter);

    constructor(address proxy) ERC1155("") {
        proxyRegistry = proxy;
    }

    function mint(
        string memory tokenUri,
        uint256 amount,
        address royaltyReceiver,
        uint96 royaltyPercentage
    ) external {
        ++totalMinted;
        require(amount > 0, "Minting 0 is not allowed");
        _mint(msg.sender, totalMinted, amount, "");
        tokenURIs[totalMinted] = tokenUri;
        _setTokenRoyalty(totalMinted, royaltyReceiver, royaltyPercentage);
        emit Minted(totalMinted, amount, msg.sender);
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        require(exists(tokenId), "The Token does not exist");
        return tokenURIs[tokenId];
    }

    function _isProxyForUser(address _user, address _address)
        internal
        view
        virtual
        returns (bool)
    {
        if (proxyRegistry == address(0)) {
            return false;
        }
        return ProxyRegistryInterface(proxyRegistry).proxies(_user, _address);
    }

    function isApprovedForAll(address _owner, address _operator)
        public
        view
        override
        returns (bool)
    {
        return
            _isProxyForUser(_owner, _operator) ||
            super.isApprovedForAll(_owner, _operator);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC1155, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
