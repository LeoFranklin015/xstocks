// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IMarketKeeper} from "./interfaces/IMarketKeeper.sol";
import {XStreamExchange} from "./XStreamExchange.sol";
import {PythAdapter} from "./PythAdapter.sol";

contract MarketKeeper is IMarketKeeper, Ownable {
    XStreamExchange public immutable exchange;
    PythAdapter public immutable pythAdapter;

    mapping(address => bool) public keepers;
    bool public override isMarketOpen;

    event MarketOpened(uint256 timestamp);
    event MarketClosed(uint256 timestamp, uint256 positionsSettled);
    event EmergencyClose(uint256 timestamp);
    event KeeperAdded(address indexed keeper);
    event KeeperRemoved(address indexed keeper);

    error OnlyKeeper();
    error AlreadyOpen();
    error AlreadyClosed();

    modifier onlyKeeper() {
        if (!keepers[msg.sender] && msg.sender != owner()) revert OnlyKeeper();
        _;
    }

    constructor(
        address exchange_,
        address pythAdapter_,
        address owner_
    ) Ownable(owner_) {
        exchange = XStreamExchange(exchange_);
        pythAdapter = PythAdapter(pythAdapter_);
    }

    function openMarket() external onlyKeeper {
        if (isMarketOpen) revert AlreadyOpen();
        isMarketOpen = true;
        exchange.setMarketOpen(true);
        emit MarketOpened(block.timestamp);
    }

    function closeMarket(
        address[] calldata pxTokens,
        bytes[] calldata pythUpdateData
    ) external payable onlyKeeper {
        if (!isMarketOpen) revert AlreadyClosed();

        uint256 totalSettled = 0;
        for (uint256 i = 0; i < pxTokens.length; i++) {
            uint256 count = exchange.getOpenPositionCount(pxTokens[i]);
            if (count > 0) {
                (uint256 settled,) = exchange.settleAllPositions{value: msg.value / pxTokens.length}(
                    pxTokens[i],
                    pythUpdateData
                );
                totalSettled += settled;
            }
        }

        isMarketOpen = false;
        exchange.setMarketOpen(false);
        emit MarketClosed(block.timestamp, totalSettled);
    }

    function emergencyCloseMarket() external onlyOwner {
        isMarketOpen = false;
        exchange.setMarketOpen(false);
        emit EmergencyClose(block.timestamp);
    }

    function addKeeper(address keeper_) external onlyOwner {
        keepers[keeper_] = true;
        emit KeeperAdded(keeper_);
    }

    function removeKeeper(address keeper_) external onlyOwner {
        keepers[keeper_] = false;
        emit KeeperRemoved(keeper_);
    }

    function getKeeperStatus(address addr) external view returns (bool) {
        return keepers[addr];
    }
}
