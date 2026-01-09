// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Ledger {
    error Ledger__InsufficientBalance();
    error Ledger__WithdrawFailed();

    mapping(address => uint256) private s_balanceOfAccount;

    event EthDeposited(address indexed account, uint256 indexed amount);
    event EthWithdrawn(address indexed account, uint256 indexed amount);

    function deposit() external payable {
        s_balanceOfAccount[msg.sender] += msg.value;

        emit EthDeposited(msg.sender, msg.value);
    }

    function withdraw(uint256 withdrawAmount) external {
        if (s_balanceOfAccount[msg.sender] < withdrawAmount) {
            revert Ledger__InsufficientBalance();
        }

        s_balanceOfAccount[msg.sender] -= withdrawAmount;

        (bool success,) = payable(msg.sender).call{value: withdrawAmount}("");

        emit EthWithdrawn(msg.sender, withdrawAmount);

        if (!success) {
            revert Ledger__WithdrawFailed();
        }
    }

    function getBalance() public view returns (uint256) {
        return s_balanceOfAccount[msg.sender];
    }
}
