// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LPToken is ERC20 {
    address public immutable exchange;
    bool public immutable transferable;

    error OnlyExchange();
    error TransfersDisabled();

    modifier onlyExchange() {
        if (msg.sender != exchange) revert OnlyExchange();
        _;
    }

    constructor(
        string memory name_,
        string memory symbol_,
        address exchange_,
        bool transferable_
    ) ERC20(name_, symbol_) {
        exchange = exchange_;
        transferable = transferable_;
    }

    function mint(address to, uint256 amount) external onlyExchange {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyExchange {
        _burn(from, amount);
    }

    function _update(address from, address to, uint256 value) internal override {
        // Block transfers if non-transferable (allow mint/burn)
        if (!transferable && from != address(0) && to != address(0)) {
            revert TransfersDisabled();
        }
        super._update(from, to, value);
    }
}
