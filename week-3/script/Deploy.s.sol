// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/USDCPool.sol";
import "../src/USDCToken/USDCToken.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        // 1. Deploy USDC (Mint 1 million USDC)
        USDCToken usdc = new USDCToken(1_000_000 * 10**18);
        console.log("USDC Token Deployed at:", address(usdc));

        // 2. Deploy Pool
        USDCPool pool = new USDCPool(address(usdc));
        console.log("USDC Pool Deployed at:", address(pool));

        vm.stopBroadcast();
    }
}
