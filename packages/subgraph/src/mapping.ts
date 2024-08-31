import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  PlanetCreated,
  ProductAdded,
  Sale,
  Delivered,
  Release,
  Refund,
  AppealRaised,
  ApprovalRequested,
  ApprovalGranted,
  ApprovalDeclined,
} from "../generated/Duniverse/Duniverse";
import {
  Planet,
  Product,
  Purchase,
  Appeal,
  ApprovalRequest,
  ApprovedSeller,
} from "../generated/schema";

export function handlePlanetCreated(event: PlanetCreated): void {
  let planet = new Planet(event.params.planetId.toString());
  planet.planetName = event.params.planetName;
  planet.planetImage = event.params.planetImage;
  planet.planetDescription = event.params.planetDescription;
  planet.ruler = event.params.ruler;
  planet.createdAt = event.block.timestamp;
  planet.updatedAt = event.block.timestamp;
  planet.save();
}

export function handleProductAdded(event: ProductAdded): void {
  let product = new Product(event.params.productId.toString());
  product.name = event.params.name;
  product.planet = event.params.planetId.toString(); // Assigning the planet ID (string) instead of the entity
  product.productImage = event.params.productImage;
  product.seller = event.params.seller;
  product.quantity = event.params.quantity;
  product.price = event.params.price;
  product.sales = BigInt.fromI32(0);
  product.createdAt = event.block.timestamp;
  product.updatedAt = event.block.timestamp;
  product.save();
}

export function handleSale(event: Sale): void {
  let purchase = new Purchase(event.params.purchaseId.toString());
  purchase.product = event.params.productId.toString(); // Assigning the product ID (string) instead of the entity
  purchase.buyer = event.params.buyer;
  purchase.seller = event.params.seller;
  purchase.amount = event.params.totalAmount;
  purchase.isReleased = false;
  purchase.isDelivered = false;
  purchase.isRefunded = false;
  purchase.timestamp = event.block.timestamp;
  purchase.save();

  let product = Product.load(event.params.productId.toString());
  if (product) {
    product.sales = product.sales.plus(BigInt.fromI32(1));
    product.updatedAt = event.block.timestamp;
    product.save();
  }
}

export function handleDelivered(event: Delivered): void {
  let purchase = Purchase.load(event.params.purchaseId.toString());
  if (purchase) {
    purchase.isDelivered = true;
    purchase.save();
  }
}

export function handleRelease(event: Release): void {
  let purchase = Purchase.load(event.params.purchaseId.toString());
  if (purchase) {
    purchase.isReleased = true;
    purchase.save();
  }
}

export function handleRefund(event: Refund): void {
  let purchase = Purchase.load(event.params.purchaseId.toString());
  if (purchase) {
    purchase.isRefunded = true;
    purchase.save();
  }
}

export function handleAppealRaised(event: AppealRaised): void {
  let appeal = new Appeal(event.params.purchaseId.toString());
  appeal.purchase = event.params.purchaseId.toString(); // Assigning the purchase ID (string) instead of the entity
  appeal.by = event.params.by;
  appeal.timestamp = event.block.timestamp;
  appeal.save();
}

export function handleApprovalRequested(event: ApprovalRequested): void {
  let approvalRequest = new ApprovalRequest(event.transaction.hash.toHex());
  approvalRequest.seller = event.params.seller;
  approvalRequest.planet = event.params.planetId.toString(); // Assigning the planet ID (string) instead of the entity
  approvalRequest.status = "Pending";
  approvalRequest.timestamp = event.block.timestamp;
  approvalRequest.save();
}

export function handleApprovalGranted(event: ApprovalGranted): void {
  let approvedSeller = new ApprovedSeller(
    event.params.seller.toHexString() + "-" + event.params.planetId.toString()
  );
  approvedSeller.seller = event.params.seller;
  approvedSeller.planet = event.params.planetId.toString(); // Assigning the planet ID (string) instead of the entity
  approvedSeller.approvedAt = event.block.timestamp;
  approvedSeller.save();

  let approvalRequest = ApprovalRequest.load(event.transaction.hash.toHex());
  if (approvalRequest) {
    approvalRequest.status = "Approved";
    approvalRequest.save();
  }
}

export function handleApprovalDeclined(event: ApprovalDeclined): void {
  let approvalRequest = ApprovalRequest.load(event.transaction.hash.toHex());
  if (approvalRequest) {
    approvalRequest.status = "Declined";
    approvalRequest.save();
  }
}
