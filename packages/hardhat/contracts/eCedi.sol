// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract ECedi is ERC20, Ownable, ERC20Permit {
    function decimals() public view virtual override returns (uint8) {
        return 6;
    }
    constructor() ERC20("eCedi", "ECD") ERC20Permit("MyToken") {
        _mint(msg.sender, 1000 * 10 ** decimals());
    }


    function mint() public {
        _mint(msg.sender, 1000 * 10 ** decimals());
    }
}