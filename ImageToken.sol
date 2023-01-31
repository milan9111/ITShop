// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./IERC20.sol";
import "./ERC20.sol";

contract ImageToken is ERC20 {
    constructor(address shop) ERC20("ImageToken", "IT", 10000, shop) {}
}
