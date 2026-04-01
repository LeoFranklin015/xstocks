// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IPyth} from "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import {PythStructs} from "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract PythAdapter is Ownable {
    IPyth public immutable pyth;
    uint256 public maxStaleness;

    error StalePrice();
    error NegativePrice();

    event MaxStalenessUpdated(uint256 newMaxStaleness);

    constructor(address pythContract_, uint256 maxStaleness_) Ownable(msg.sender) {
        pyth = IPyth(pythContract_);
        maxStaleness = maxStaleness_;
    }

    function getPrice(
        bytes32 feedId,
        bytes[] calldata updateData
    ) external payable returns (uint256 price, uint256 publishTime) {
        pyth.updatePriceFeeds{value: msg.value}(updateData);

        PythStructs.Price memory p = pyth.getPriceNoOlderThan(feedId, maxStaleness);
        if (p.price <= 0) revert NegativePrice();

        price = normalizePythPrice(p.price, p.expo);
        publishTime = p.publishTime;
    }

    function getPriceCached(
        bytes32 feedId
    ) external view returns (uint256 price, uint256 publishTime) {
        PythStructs.Price memory p = pyth.getPriceNoOlderThan(feedId, maxStaleness);
        if (p.price <= 0) revert NegativePrice();

        price = normalizePythPrice(p.price, p.expo);
        publishTime = p.publishTime;
    }

    function getUpdateFee(
        bytes[] calldata updateData
    ) external view returns (uint256) {
        return pyth.getUpdateFee(updateData);
    }

    function setMaxStaleness(uint256 seconds_) external onlyOwner {
        maxStaleness = seconds_;
        emit MaxStalenessUpdated(seconds_);
    }

    function normalizePythPrice(
        int64 price_,
        int32 expo_
    ) public pure returns (uint256) {
        if (price_ <= 0) revert NegativePrice();
        uint256 p = uint256(uint64(price_));

        if (expo_ < 0) {
            uint32 absExpo = uint32(-expo_);
            if (absExpo <= 18) {
                return p * 10 ** (18 - absExpo);
            } else {
                return p / 10 ** (absExpo - 18);
            }
        } else {
            return p * 10 ** (18 + uint32(expo_));
        }
    }
}
