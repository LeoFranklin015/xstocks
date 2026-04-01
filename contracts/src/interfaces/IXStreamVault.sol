// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IXStreamVault {
    function onDxTransfer(
        address xStock,
        address from,
        uint256 fromBalanceBefore,
        address to,
        uint256 toBalanceBefore,
        uint256 amount
    ) external;
}
