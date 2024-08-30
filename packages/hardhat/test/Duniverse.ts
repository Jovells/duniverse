import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Duniverse, Duniverse__factory, MockUSDT, MockUSDT__factory } from "../typechain-types";

describe("Duniverse", function () {
  let buyer: SignerWithAddress,
    buyer2: SignerWithAddress,
    nonBuyer: SignerWithAddress,
    seller: SignerWithAddress,
    ruler: SignerWithAddress;
  let mockUSDT: MockUSDT, duniverseContract: Duniverse;
  const totalAmount = ethers.parseUnits("1", 6); // 100 tokens
  const planetId = 1;
  const productId = 1;
  const productName = "Product 1";

  before(async () => {
    [buyer, buyer2, nonBuyer, seller, ruler] = await ethers.getSigners();

    // Deploy the MockUSDT contract
    const MockUSDT: MockUSDT__factory = await ethers.getContractFactory("MockUSDT");
    mockUSDT = await MockUSDT.deploy();
    await mockUSDT.deploymentTransaction();
    mockUSDT.connect(buyer).mint();
    mockUSDT.connect(buyer2).mint();

    // Deploy the Duniverse contract
    const Duniverse: Duniverse__factory = await ethers.getContractFactory("Duniverse");
    duniverseContract = await Duniverse.deploy(mockUSDT.target);
    await duniverseContract.deploymentTransaction();
  });

  describe("Planet Creation", function () {
    it("should allow the ruler to create a planet", async () => {
      await duniverseContract.connect(ruler).createPlanet(planetId, "Earth", "A beautiful planet");
      const planet = await duniverseContract.planets(planetId);
      expect(planet.planetName).to.equal("Earth");
      expect(planet.ruler).to.equal(ruler.address);
    });
  });

  describe("Seller Approval", function () {
    it("should allow the seller to request approval to sell on a planet", async () => {
      await duniverseContract.connect(seller).requestApproval(planetId);
      const approvalRequest = await duniverseContract.approvalRequests(seller.address);
      expect(approvalRequest).to.equal(planetId);
    });

    it("should allow the ruler to approve the seller", async () => {
      await duniverseContract.connect(ruler).approveSeller(seller.address);
      const approvedSeller = await duniverseContract.approvedSellers(seller.address);
      expect(approvedSeller).to.equal(planetId);
    });
  });

  describe("Product Purchase", function () {
    it("should allow the seller to add a product", async () => {
      await duniverseContract.connect(seller).addProduct(productName, planetId, seller.address, 10, totalAmount);
      const product = await duniverseContract.products(productId);
      console.log("product", product);
      expect(product.seller).to.equal(seller.address);
      expect(product.price).to.equal(totalAmount);
    });

    it("should allow the buyer to purchase a product", async () => {
      await mockUSDT.connect(buyer).approve(duniverseContract.target, totalAmount);
      await duniverseContract.connect(buyer).purchaseProduct(productId, 1);
      const purchases = await duniverseContract.getPurchases(1, 1);
      expect(purchases[0].buyer).to.equal(buyer.address);
      expect(purchases[0].amount).to.equal(totalAmount);
    });

    it("should revert if transfer failed when buying a product", async () => {
      const purchase = duniverseContract.connect(nonBuyer).purchaseProduct(productId, 1);
      await expect(purchase).to.be.reverted;
    });
  });

  describe("Release and Shipment", function () {
    it("should allow the seller to mark a product as shipped", async () => {
      const purchaseId = 1;
      await duniverseContract.connect(seller).markDelivered(purchaseId, { gasLimit: 3e7 });
      const purchase = await duniverseContract.purchases(purchaseId);
      expect(purchase.isDelivered).to.equal(true);
    });

    it("should not allow a double shipment", async () => {
      const purchaseId = 1;
      const shipment = duniverseContract.connect(seller).markDelivered(purchaseId, { gasLimit: 3e7 });
      await expect(shipment).to.be.revertedWith("Already shipped");
    });

    it("should not allow a non-seller to mark a product as shipped", async () => {
      const purchaseId = 1;
      const shipment = duniverseContract.connect(nonBuyer).markDelivered(purchaseId, { gasLimit: 3e7 });
      await expect(shipment).to.be.revertedWith("Only the Seller can perform this operation");
    });

    it("should allow the buyer to release funds", async () => {
      const purchaseId = 1;
      const release = await duniverseContract.connect(buyer).release(purchaseId, { gasLimit: 3e7 });
      const purchase = await duniverseContract.purchases(purchaseId);
      expect(purchase.isReleased).to.equal(true);
      expect(release).to.emit(duniverseContract, "Release");
    });

    it("should not allow a double release", async () => {
      const purchaseId = 1;
      const release = duniverseContract.connect(buyer).release(purchaseId, { gasLimit: 3e7 });
      await expect(release).to.be.revertedWith("Funds are already released");
    });

    it("should not allow a non-buyer to release funds", async () => {
      const purchaseId = 1;
      const release = duniverseContract.connect(nonBuyer).release(purchaseId, { gasLimit: 3e7 });
      await expect(release).to.be.revertedWith("Only the Buyer can perform this operation");
    });
  });

  describe("Appeals and Arbitration", function () {
    it("should allow the buyer to raise an appeal", async () => {
      const purchaseId = 1;
      await duniverseContract.connect(buyer).raiseAppeal(purchaseId);
      const appeal = await duniverseContract.appeals(purchaseId);
      expect(appeal).to.equal(true);
    });

    it("should allow the seller to raise an appeal", async () => {
      const purchaseId = 1;
      await duniverseContract.connect(seller).raiseAppeal(purchaseId);
      const appeal = await duniverseContract.appeals(purchaseId);
      expect(appeal).to.equal(true);
    });

    it("should allow the ruler to refund a purchase after an appeal is raised", async () => {
      await mockUSDT.connect(buyer2).approve(duniverseContract.target, totalAmount);
      await duniverseContract.connect(buyer2).purchaseProduct(productId, 1);
      const purchaseId = 2;
      await duniverseContract.connect(buyer2).raiseAppeal(purchaseId);
      await duniverseContract.connect(ruler).refund(purchaseId);
      const purchase = await duniverseContract.purchases(purchaseId);
      expect(purchase.isRefunded).to.equal(true);
    });

    it("should not allow the ruler to refund a purchase without an appeal", async () => {
      //make a purchase
      await mockUSDT.connect(buyer2).approve(duniverseContract.target, totalAmount);
      await duniverseContract.connect(buyer2).purchaseProduct(productId, 1);
      const purchaseId = 3;
      const refund = duniverseContract.connect(ruler).refund(purchaseId, { gasLimit: 3e7 });
      await expect(refund).to.be.revertedWith("Appeal must be raised before refund");
    });

    it("should not allow the ruler to refund a purchase that has already been refunded", async () => {
      const purchaseId = 2;
      const refund = duniverseContract.connect(ruler).refund(purchaseId, { gasLimit: 3e7 });
      await expect(refund).to.be.revertedWith("Purchase already refunded");
    });

    it("should not allow the ruler to refund a purchase that has already been released", async () => {
      const purchaseId = 1;
      const refund = duniverseContract.connect(ruler).refund(purchaseId, { gasLimit: 3e7 });
      await expect(refund).to.be.revertedWith("Funds are already released");
    });

    it("should not allow a non-ruler to refund a purchase", async () => {
      const purchaseId = 2;
      const refund = duniverseContract.connect(buyer).refund(purchaseId, { gasLimit: 3e7 });
      await expect(refund).to.be.revertedWith("Only the Ruler can perform this operation");
    });

    it("should allow the ruler to release funds for a purchase after an appeal is raised", async () => {
      await mockUSDT.connect(buyer2).approve(duniverseContract.target, totalAmount);
      await duniverseContract.connect(buyer2).purchaseProduct(productId, 1);
      const purchaseId = 3;
      await duniverseContract.connect(buyer2).raiseAppeal(purchaseId);
      await duniverseContract.connect(ruler).releaseFor(purchaseId);
      const purchase = await duniverseContract.purchases(purchaseId);
      expect(purchase.isReleased).to.equal(true);
    });

    it("should not allow the ruler to release funds for a purchase without an appeal", async () => {
      //make a purchase
      await mockUSDT.connect(buyer2).approve(duniverseContract.target, totalAmount);
      await duniverseContract.connect(buyer2).purchaseProduct(productId, 1);
      const purchaseId = 4;
      const release = duniverseContract.connect(ruler).releaseFor(purchaseId, { gasLimit: 3e7 });
      await expect(release).to.be.revertedWith("Appeal must be raised before release");
    });

    it("should not allow a non-ruler to release funds for a purchase", async () => {
      const purchaseId = 3;
      const release = duniverseContract.connect(buyer).releaseFor(purchaseId, { gasLimit: 3e7 });
      await expect(release).to.be.revertedWith("Only the Ruler can perform this operation");
    });

    it("should not allow the ruler to release funds for a purchase that has already been released", async () => {
      //make a purchase
      await mockUSDT.connect(buyer2).approve(duniverseContract.target, totalAmount);
      await duniverseContract.connect(buyer2).purchaseProduct(productId, 1);

      //raise appeal
      const purchaseId = 5;
      await duniverseContract.connect(buyer2).raiseAppeal(purchaseId);

      //try to release twice
      duniverseContract.connect(ruler).releaseFor(purchaseId);
      const release2 = duniverseContract.connect(ruler).releaseFor(purchaseId);
      await expect(release2).to.be.revertedWith("Funds are already released");
    });
  });

  describe("Reading Records", function () {
    it("should allow the buyer to get their purchases", async () => {
      const buyerPurchases = await duniverseContract.getBuyerPurchases(buyer.address, 1, 3);
      expect(buyerPurchases[0].buyer).to.equal(buyer.address);
    });

    it("should not allow an invalid range when getting buyer purchases", async () => {
      const buyerPurchases = duniverseContract.getBuyerPurchases(buyer.address, 1, 0);
      await expect(buyerPurchases).to.be.revertedWith("Invalid range");
    });

    it("should allow the seller to get their purchases", async () => {
      const sellerPurchases = await duniverseContract.getSellerPurchases(seller.address, 1, 3);
      expect(sellerPurchases[0].seller).to.equal(seller.address);
    });

    it("should not allow an invalid range when getting seller purchases", async () => {
      const sellerPurchases = duniverseContract.getSellerPurchases(seller.address, 1, 0);
      await expect(sellerPurchases).to.be.revertedWith("Invalid range");
    });

    it("should allow getting purchases", async () => {
      const purchases = await duniverseContract.getPurchases(1, 3);
      expect(purchases[0].buyer).to.equal(buyer.address);
    });

    it("should not allow an invalid range when getting purchases", async () => {
      const purchases = duniverseContract.getPurchases(1, 0);
      await expect(purchases).to.be.revertedWith("Invalid range");
    });
  });
});
