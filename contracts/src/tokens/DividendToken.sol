// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IXStreamVault} from "../interfaces/IXStreamVault.sol";

contract DividendToken is ERC20 {
    address public immutable vault;
    address public immutable xStock;

    error OnlyVault();

    modifier onlyVault() {
        if (msg.sender != vault) revert OnlyVault();
        _;
    }

    constructor(
        string memory name_,
        string memory symbol_,
        address vault_,
        address xStock_
    ) ERC20(name_, symbol_) {
        vault = vault_;
        xStock = xStock_;
    }

    function mint(address to, uint256 amount) external onlyVault {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyVault {
        _burn(from, amount);
    }

    function _update(address from, address to, uint256 value) internal override {
        // On regular transfers (not mint/burn), handle dividend accounting
        if (from != address(0) && to != address(0)) {
            IXStreamVault(vault).onDxTransfer(
                xStock,
                from,
                balanceOf(from),
                to,
                balanceOf(to),
                value
            );
        }
        super._update(from, to, value);
    }
}
