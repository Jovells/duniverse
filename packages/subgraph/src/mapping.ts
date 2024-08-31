import { BigInt } from "@graphprotocol/graph-ts";
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
  planet.save();
}

export function handleProductAdded(event: ProductAdded): void {
  let product = new Product(event.params.productId.toString());
  let planet = Planet.load(event.params.planetId.toString());
  if (planet) {
    product.planet = planet.id;  // Assign the Planet ID as a string
  }
  product.productImage = event.params.productImage;
  product.seller = event.params.seller;
  product.quantity = event.params.quantity;
  product.price = event.params.price;
  product.sales = BigInt.fromI32(0);
  product.save();
}

export function handleSale(event: Sale): void {
  let purchase = new Purchase(event.params.purchaseId.toString());
  purchase.id = event.params.purchaseId.toString();
  purchase.product = Product.load(event.params.productId.toString())!.id;
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
  appeal.purchase = Purchase.load(event.params.purchaseId.toString())!.id;
  appeal.by = event.params.by;
  appeal.timestamp = event.block.timestamp;
  appeal.save();
}

export function handleApprovalRequested(event: ApprovalRequested): void {
  let approvalRequest = new ApprovalRequest(event.transaction.hash.toHex());
  approvalRequest.seller = event.params.seller;
  approvalRequest.planet = event.params.planetId.toString();
  approvalRequest.status = "Pending";
  approvalRequest.timestamp = event.block.timestamp;
  approvalRequest.save();
}

export function handleApprovalGranted(event: ApprovalGranted): void {
  let approvedSeller = new ApprovedSeller(
    event.params.seller.toHexString() + "-" + event.params.planetId.toString()
  );
  approvedSeller.seller = event.params.seller;
  approvedSeller.planet = event.params.planetId.toString();
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
