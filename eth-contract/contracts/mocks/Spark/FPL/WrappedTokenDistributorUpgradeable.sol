// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "../interfaces/IPancakeRouter.sol";

contract WrappedTokenDistributorUpgradeable is Initializable{
    IPancakeRouter02 internal swapRouter;
    address internal BUSD_CONTRACT_ADDRESS;
    address internal WRAPPED_Token_CONTRACT_ADDRESS;

    event DistributedBTC(address indexed to, uint256 amount);

    function __WrappedTokenDistributor_initialize(
        address swapRouterAddress,
        address BUSDContractAddress,
        address WrappedTokenContractAddress
    ) public initializer {
        swapRouter = IPancakeRouter02(swapRouterAddress);
        BUSD_CONTRACT_ADDRESS = BUSDContractAddress;
        WRAPPED_Token_CONTRACT_ADDRESS = WrappedTokenContractAddress;
    }

    /**
     * @param _to Reciever address
     * @param _usdAmount USD Amount
     * @param _wrappedTokenAmount Wrapped Token Amount
     */
    function transferTokensThroughSwap(
        address _to,
        uint256 _usdAmount,
        uint256 _wrappedTokenAmount,
        uint256 _deadline
    ) internal {
        require(_to != address(0));
        // Get max USD price we can spend for this amount.
        swapRouter.swapExactTokensForTokens(
            _usdAmount,
            _wrappedTokenAmount,
            getPathForUSDToWrappedToken(),
            _to,
            _deadline
        );
    }

    /**
     * @param _amount Amount
     */
    function getEstimatedWrappedTokenForUSD(uint256 _amount)
        public
        view
        returns (uint256)
    {
        uint256[] memory wrappedTokenAmount =
            swapRouter.getAmountsOut(_amount, getPathForUSDToWrappedToken());
        // since in the path the wrappedToken is the second one, so we should retuen the second one also here    
        return wrappedTokenAmount[1];
    }

    function getPathForUSDToWrappedToken() public view returns (address[] memory) {
        address[] memory path = new address[](2);
        path[0] = BUSD_CONTRACT_ADDRESS;
        path[1] = WRAPPED_Token_CONTRACT_ADDRESS;

        return path;
    }

    function getSwapRouter() public view returns (address) {
        return address(swapRouter);
    }
}
