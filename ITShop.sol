// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./IERC20.sol";
import "./ImageToken.sol";

contract ITShop {
    IERC20 public token;
    address payable public owner;
    uint rateToken = 1000000000;
    event Bought(uint _amount, address indexed _buyer);
    event Sold(uint _amount, address indexed _seller);

    constructor() {
        token = new ImageToken(address(this));
        owner = payable(msg.sender);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "not an owner!");
        _;
    }

    function sell(uint _amountToSell) external {
        require(_amountToSell > 0 && token.balanceOf(msg.sender) >= _amountToSell, "incorrect amount!");

        uint allowance = token.allowance(msg.sender, address(this));
        require(allowance >= _amountToSell, "check allowance!");

        token.transferFrom(msg.sender, address(this), _amountToSell);

        payable(msg.sender).transfer(_amountToSell * rateToken);

        emit Sold(_amountToSell, msg.sender);
    }

    receive() external payable {
        uint tokensToBuy = msg.value / rateToken;
        require(tokensToBuy > 0, "not enough funds!");

        uint currentBalance = tokenBalance();
        require(currentBalance >= tokensToBuy, "not enough tokens!");

        token.transfer(msg.sender, tokensToBuy);
        emit Bought(tokensToBuy, msg.sender);
    }

    function tokenBalance() public view returns(uint) {
        return token.balanceOf(address(this));
    }

    function transferProceeds() public onlyOwner {
        owner.transfer(address(this).balance);
    }
}
