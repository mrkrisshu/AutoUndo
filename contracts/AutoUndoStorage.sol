// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title AutoUndoStorage
 * @notice Minimal smart contract for storing AI automation decisions on-chain
 * @dev Designed for 0G testnet deployment - emits events for decision auditing
 */
contract AutoUndoStorage {
    /// @notice Emitted when a new decision is stored
    /// @param caller The address that stored the decision
    /// @param decision The decision result (EXECUTE or SKIP)
    /// @param summary The audit summary for the decision
    /// @param timestamp The block timestamp when stored
    event DecisionStored(
        address indexed caller,
        string decision,
        string summary,
        uint256 timestamp
    );

    /// @notice Store a decision on-chain for immutable auditing
    /// @param decision The decision result (EXECUTE or SKIP)
    /// @param summary The audit summary describing the decision
    function storeDecision(
        string calldata decision,
        string calldata summary
    ) external {
        emit DecisionStored(msg.sender, decision, summary, block.timestamp);
    }
}
