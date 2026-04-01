// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IMarketKeeper {
    function isMarketOpen() external view returns (bool);
}
