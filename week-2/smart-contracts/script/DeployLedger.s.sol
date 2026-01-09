// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script} from "../lib/forge-std/src/Script.sol";
import {Ledger} from "../src/Ledger.sol";

contract DeployLedger is Script {
    function run() external returns (Ledger) {
        vm.startBroadcast();
        Ledger ledger = new Ledger();
        vm.stopBroadcast();
        return ledger;
    }
}
