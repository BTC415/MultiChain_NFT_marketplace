// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract USDRetriever {
    IERC20 internal USDCContract;

    event ReceivedTokens(address indexed from, uint256 amount);
    event TransferTokens(address indexed to, uint256 amount);
    event ApproveTokens(address indexed to, uint256 amount);

    function setUSDToken(address _usdContractAddress) internal {
        USDCContract = IERC20(_usdContractAddress);
    }

    function approveTokens(address _to, uint256 _amount) internal {
        USDCContract.approve(_to, _amount);
        emit ApproveTokens(_to, _amount);
    }

    function getUSDBalance() external view returns (uint256) {
        return USDCContract.balanceOf(address(this));
    }

    function getUSDToken() external view returns (address) {
        return address(USDCContract);
    }
}
