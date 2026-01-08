// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test} from "../lib/forge-std/src/Test.sol";
import {DeployLedger} from "../script/DeployLedger.s.sol";
import {Ledger} from "../src/Ledger.sol";

contract LedgerTest is Test {
    address USER = makeAddr("user");
    Ledger ledger;
    uint256 constant INIIAL_BALANCE = 10 ether;
    uint256 constant TEST_DEPOSIT_AMOUNT = 1 ether;

    function setUp() external {
        vm.deal(USER, INIIAL_BALANCE);
        DeployLedger deploy = new DeployLedger();
        ledger = deploy.run();
    }

    function testDepositfunctionDepositsMoneyToContract() public {
        vm.prank(USER);
        ledger.deposit{value: TEST_DEPOSIT_AMOUNT}();

        assert(address(ledger).balance == TEST_DEPOSIT_AMOUNT);
    }

    modifier deposited() {
        vm.prank(USER);
        ledger.deposit{value: TEST_DEPOSIT_AMOUNT}();
        _;
    }

    function testWithdrawFunctionWithdrawsFromContract() public deposited {
        uint256 initialUserBalance = address(USER).balance;
        uint256 initialContractBalnce = address(ledger).balance;

        vm.prank(USER);
        ledger.withdraw(TEST_DEPOSIT_AMOUNT);

        uint256 finalUserBalance = address(USER).balance;
        uint256 finalContractBalnce = address(ledger).balance;

        assert((finalUserBalance - initialUserBalance) == TEST_DEPOSIT_AMOUNT);
        assert((initialContractBalnce - finalContractBalnce) == TEST_DEPOSIT_AMOUNT);
    }

    function testDepositingUpdatesMapping() public deposited {
        vm.prank(USER);
        uint256 userBalance = ledger.getBalance();

        assert(userBalance == TEST_DEPOSIT_AMOUNT);
    }

    function testSumOfDepositsIsBalanceOfContract() external {
        uint160 indexOfAccount;
        uint160 numberOfAccounts = 10;
        uint256 amountDeposited = 0;

        for (indexOfAccount = 1; indexOfAccount <= numberOfAccounts; indexOfAccount++) {
            hoax(address(indexOfAccount), INIIAL_BALANCE);
            ledger.deposit{value: TEST_DEPOSIT_AMOUNT}();
            amountDeposited += TEST_DEPOSIT_AMOUNT;
        }

        assert(address(ledger).balance == amountDeposited);
    }

    function testRevertsWhenBalanceIsLesstThanWithdrawAmount() public deposited {
        vm.prank(USER);
        vm.expectRevert(Ledger.Ledger__InsufficientBalance.selector);
        ledger.withdraw(2 * TEST_DEPOSIT_AMOUNT);
    }

    function testEventEmitsOnDepositing() public {
        vm.prank(USER);
        vm.expectEmit(true, true, true, false, address(ledger));
        emit Ledger.EthDeposited(USER, TEST_DEPOSIT_AMOUNT);
        ledger.deposit{value: TEST_DEPOSIT_AMOUNT}();        
    }
}
