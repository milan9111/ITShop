const { expect } = require("chai");
const { ethers } = require("hardhat");
const tokenJSON = require('../artifacts/contracts/ImageToken.sol/ImageToken.json');

describe("ITShop", function() {
    let owner;
    let buyer;
    let shop;
    let erc20;

    beforeEach(async function() {
        [owner, buyer] = await ethers.getSigners();

        const ITShop = await ethers.getContractFactory("ITShop", owner);
        shop = await ITShop.deploy();
        await shop.deployed();

        erc20 = new ethers.Contract(await shop.token(), tokenJSON.abi, owner);

    });

    it("should have an owner and a token", async function() {
        expect(await shop.owner()).to.eq(owner.address);

        expect(await shop.token()).to.be.properAddress;
    });

    it("allows to buy", async function() {
        const tokenAmount = 3;
        const rateToken = 1000000000;

        const txData = {
            value: tokenAmount * rateToken,
            to: shop.address
        }

        const tx = await buyer.sendTransaction(txData);
        await tx.wait();

        expect(await erc20.balanceOf(buyer.address))
            .to.eq(tokenAmount);

        await expect(() => tx)
            .to.changeEtherBalance(shop, tokenAmount * rateToken);

        await expect(tx)
            .to.emit(shop, "Bought")
            .withArgs(tokenAmount, buyer.address);
    });

    it("allows to sell", async function() {
        const tokenAmount = 3;
        const sellAmount = 2;
        const rateToken = 1000000000;

        const tx = await buyer.sendTransaction({
            value: tokenAmount * rateToken,
            to: shop.address
        });
        await tx.wait();

        const approval = await erc20.connect(buyer).approve(shop.address, sellAmount);
        await approval.wait();

        const sellTx = await shop.connect(buyer).sell(sellAmount);

        expect(await erc20.balanceOf(buyer.address)).to.eq(1);

        await expect(() => sellTx)
            .to.changeEtherBalance(shop, -sellAmount * rateToken);

        await expect(sellTx)
            .to.emit(shop, "Sold")
            .withArgs(sellAmount, buyer.address);
    });
})
