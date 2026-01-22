// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Ledger {
    error Ledger__InsufficientBalance();
    error Ledger__WithdrawFailed();

    enum TransactionType {
        WITHDRAW,
        DEPOSIT
    }

    struct TransactionInfo {
        address account;
        uint256 transactionAmount;
        TransactionType transactionType;
    }

    mapping(address => uint256) private s_balanceOfAccount;
    TransactionInfo[] private s_transactions;

    event EthDeposited(address indexed account, uint256 indexed amount);
    event EthWithdrawn(address indexed account, uint256 indexed amount);

    function deposit() external payable {
        s_balanceOfAccount[msg.sender] += msg.value;
        s_transactions.push(
            TransactionInfo({
                account: msg.sender,
                transactionAmount: msg.value,
                transactionType: TransactionType.DEPOSIT
            })
        );

        emit EthDeposited(msg.sender, msg.value);
    }

    function withdraw(uint256 withdrawAmount) external {
        if (s_balanceOfAccount[msg.sender] < withdrawAmount) {
            revert Ledger__InsufficientBalance();
        }

        s_balanceOfAccount[msg.sender] -= withdrawAmount;
        s_transactions.push(
            TransactionInfo({
                account: msg.sender,
                transactionAmount: withdrawAmount,
                transactionType: TransactionType.WITHDRAW
            })
        );

        (bool success, ) = payable(msg.sender).call{value: withdrawAmount}("");

        emit EthWithdrawn(msg.sender, withdrawAmount);

        if (!success) {
            revert Ledger__WithdrawFailed();
        }
    }

    function getBalance() public view returns (uint256) {
        return s_balanceOfAccount[msg.sender];
    }

    function getTransactionHistory() public view returns(TransactionInfo[] memory) {
        return s_transactions;
    }
}
