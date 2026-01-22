// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract USDCPool {
    error USDCPool__InvalidInput();
    error USDCPool__InsufficientLiquidity();
    error USDCPool__TransferFailed();
    error USDCPool__SlippageExceeded();
    error USDCPool__InvalidReserves();

    IERC20 public immutable i_token;
    uint256 public s_totalLiquidity;
    mapping(address => uint256) public s_liquidity;
    
    constructor(address _token) {
        if (_token == address(0)) revert USDCPool__InvalidInput();
        i_token = IERC20(_token);
    }

    function getAmountOut(uint256 inputAmount, uint256 inputReserve, uint256 outputReserve) private pure returns (uint256) {
        if (inputReserve == 0 || outputReserve == 0) revert USDCPool__InvalidReserves();
        
        uint256 inputAmountWithFee = inputAmount * 997;
        uint256 numerator = inputAmountWithFee * outputReserve;
        uint256 denominator = (inputReserve * 1000) + inputAmountWithFee;
        
        return numerator / denominator; 
    }

    function swapEthToUsdc(uint256 minTokensOut) external payable {
        if (msg.value == 0) revert USDCPool__InvalidInput();
        
        uint256 ethReserve = address(this).balance - msg.value;
        uint256 tokenReserve = i_token.balanceOf(address(this));
        
        uint256 tokensBought = getAmountOut(msg.value, ethReserve, tokenReserve);
        
        if (tokensBought < minTokensOut) revert USDCPool__SlippageExceeded();
        
        bool success = i_token.transfer(msg.sender, tokensBought);
        if (!success) revert USDCPool__TransferFailed();
    }

    function swapUsdcToEth(uint256 tokenIn, uint256 minEthOut) external {
        if (tokenIn == 0) revert USDCPool__InvalidInput();
        
        uint256 tokenReserve = i_token.balanceOf(address(this));
        uint256 ethReserve = address(this).balance;
        
        bool success = i_token.transferFrom(msg.sender, address(this), tokenIn);
        if (!success) revert USDCPool__TransferFailed();

        uint256 ethBought = getAmountOut(tokenIn, tokenReserve, ethReserve);

        if (ethBought < minEthOut) revert USDCPool__SlippageExceeded();
        
        (success, ) = msg.sender.call{value: ethBought}("");
        if (!success) revert USDCPool__TransferFailed();
    }

    function addLiquidity(uint256 tokenAmount) external payable returns (uint256) {
        if (msg.value == 0 || tokenAmount == 0) revert USDCPool__InvalidInput();

        uint256 ethReserve = address(this).balance - msg.value;
        uint256 tokenReserve = i_token.balanceOf(address(this));
        uint256 liquidMinted;
        
        if (tokenReserve == 0) {
            bool success = i_token.transferFrom(msg.sender, address(this), tokenAmount);
            if (!success) revert USDCPool__TransferFailed();
            
            liquidMinted = ethReserve; 
            s_totalLiquidity = ethReserve;
        } else {
            uint256 ethRatio = (msg.value * tokenReserve) / ethReserve;
            if (tokenAmount < ethRatio) revert USDCPool__InsufficientLiquidity();
            
            bool success = i_token.transferFrom(msg.sender, address(this), ethRatio);
            if (!success) revert USDCPool__TransferFailed();

            liquidMinted = (msg.value * s_totalLiquidity) / ethReserve;
            s_totalLiquidity += liquidMinted;
        }

        s_liquidity[msg.sender] += liquidMinted;
        return liquidMinted;
    }

    function removeLiquidity(uint256 amount) external returns (uint256, uint256) {
        if (s_liquidity[msg.sender] < amount) revert USDCPool__InsufficientLiquidity();
        if (amount == 0) revert USDCPool__InvalidInput();
        
        uint256 ethAmount = (amount * address(this).balance) / s_totalLiquidity;
        uint256 tokenAmount = (amount * i_token.balanceOf(address(this))) / s_totalLiquidity;
        
        s_liquidity[msg.sender] -= amount;
        s_totalLiquidity -= amount;
        
        (bool success, ) = msg.sender.call{value: ethAmount}("");
        if (!success) revert USDCPool__TransferFailed();
        
        success = i_token.transfer(msg.sender, tokenAmount);
        if (!success) revert USDCPool__TransferFailed();
        
        return (ethAmount, tokenAmount);
    }
}
