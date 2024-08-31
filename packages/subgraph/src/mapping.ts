import { BigInt } from "@graphprotocol/graph-ts";
import {
  Sale,
  Refund,
  Release,
  Delivered,
  ApprovalRequested,
  ApprovalGranted,
  ApprovalDeclined,
  AppealRaised,
  PlanetCreated,
  ProductAdded,
} from "../generated/Duniverse/Duniverse";
import {
  Planet,
  Product,
  Seller,
  Buyer,
  Purchase,
  ApprovalRequest,
  ApprovalEvent,
  Appeal,
  ReleaseEvent,
  RefundEvent,
  SaleEvent,
  DeliveredEvent,
} from "../generated/schema";

// Handle the creation of a new planet
export function handlePlanetCreated(event: PlanetCreated): void {
  let planet = new Planet(event.params.planetId.toString());
  planet.planetId = event.params.planetId;
  planet.planetName = event.params.planetName;
  planet.planetImage = event.params.planetImage;
  planet.planetDescription = event.params.planetDescription;
  planet.ruler = event.params.ruler;
  planet.createdAt = event.block.timestamp;
  planet.updatedAt = event.block.timestamp;
  planet.save();
}

// Handle the addition of a new product to a planet
export function handleProductAdded(event: ProductAdded): void {
  let product = new Product(event.params.productId.toString());
  product.productId = event.params.productId;
  product.productImage = event.params.productImage;
  product.name = event.params.name;
  product.quantity = event.params.quantity;
  product.price = event.params.price;
  product.sales = BigInt.fromI32(0);

  let planet = Planet.load(event.params.planetId.toString());
  if (planet) {
    product.planet = planet.id;
    planet.updatedAt = event.block.timestamp;
    planet.save();
  }

  let seller = Seller.load(event.params.seller.toHex());
  if (!seller) {
    seller = new Seller(event.params.seller.toHex());
    seller.address = event.params.seller;
    seller.createdAt = event.block.timestamp;
    seller.updatedAt = event.block.timestamp;
    seller.save();
  }
  product.seller = seller.id;

  product.createdAt = event.block.timestamp;
  product.updatedAt = event.block.timestamp;
  product.save();
}

// Handle the sale of a product
export function handleSale(event: Sale): void {
  let saleEvent = new SaleEvent(event.transaction.hash.toHex());
  saleEvent.purchase = event.params.purchaseId.toString();
  saleEvent.totalAmount = event.params.totalAmount;
  saleEvent.createdAt = event.block.timestamp;
  saleEvent.updatedAt = event.block.timestamp;
  saleEvent.save();

  let purchase = Purchase.load(event.params.purchaseId.toString());
  if (purchase == null) {
    purchase = new Purchase(event.params.purchaseId.toString());
    purchase.purchaseId = event.params.purchaseId;

    let product = Product.load(purchase.product);
    if (product) {
      purchase.product = product.id;
      purchase.seller = product.seller;
      product.updatedAt = event.block.timestamp;
      product.save();
    }

    let buyer = Buyer.load(event.params.buyer.toHex());
    if (!buyer) {
      buyer = new Buyer(event.params.buyer.toHex());
      buyer.address = event.params.buyer;
      buyer.createdAt = event.block.timestamp;
      buyer.updatedAt = event.block.timestamp;
      buyer.save();
    }
    purchase.buyer = buyer.id;

    purchase.amount = event.params.totalAmount;
    purchase.isReleased = false;
    purchase.isDelivered = false;
    purchase.isRefunded = false;
    purchase.appealRaised = false;
    purchase.createdAt = event.block.timestamp;
    purchase.updatedAt = event.block.timestamp;
  }

  let product = Product.load(purchase.product);
  if (product != null) {
    product.sales = product.sales.plus(BigInt.fromI32(1));
    product.updatedAt = event.block.timestamp;
    product.save();
  }

  purchase.updatedAt = event.block.timestamp;
  purchase.save();
}

// Handle refund of a purchase
export function handleRefund(event: Refund): void {
  let refundEvent = new RefundEvent(event.transaction.hash.toHex());
  refundEvent.purchase = event.params.purchaseId.toString();
  refundEvent.amount = event.params.totalAmount;
  refundEvent.createdAt = event.block.timestamp;
  refundEvent.updatedAt = event.block.timestamp;
  refundEvent.save();

  let purchase = Purchase.load(event.params.purchaseId.toString());
  if (purchase != null) {
    purchase.isRefunded = true;
    purchase.updatedAt = event.block.timestamp;
    purchase.save();
  }
}

// Handle release of funds after a purchase
export function handleRelease(event: Release): void {
  let releaseEvent = new ReleaseEvent(event.transaction.hash.toHex());
  releaseEvent.purchase = event.params.purchaseId.toString();
  releaseEvent.amount = event.params.totalAmount;
  releaseEvent.createdAt = event.block.timestamp;
  releaseEvent.updatedAt = event.block.timestamp;
  releaseEvent.save();

  let purchase = Purchase.load(event.params.purchaseId.toString());
  if (purchase != null) {
    purchase.isReleased = true;
    purchase.updatedAt = event.block.timestamp;
    purchase.save();
  }
}

// Handle the delivery of a product
export function handleDelivered(event: Delivered): void {
  let deliveredEvent = new DeliveredEvent(event.transaction.hash.toHex());
  deliveredEvent.purchase = event.params.purchaseId.toString();
  deliveredEvent.totalAmount = event.params.totalAmount;
  deliveredEvent.createdAt = event.block.timestamp;
  deliveredEvent.updatedAt = event.block.timestamp;
  deliveredEvent.save();

  let purchase = Purchase.load(event.params.purchaseId.toString());
  if (purchase != null) {
    purchase.isDelivered = true;
    purchase.updatedAt = event.block.timestamp;
    purchase.save();
  }
}

// Handle approval requests from sellers
export function handleApprovalRequested(event: ApprovalRequested): void {
                                                                          let approvalRequestId = `${event.params.seller.toHex()}-${event.params.planetId.toString()}`;
                                                                          let approvalRequest = ApprovalRequest.load(
                                                                            approvalRequestId
                                                                          );

                                                                          // If no existing request, create a new one
                                                                          if (
                                                                            !approvalRequest
                                                                          ) {
                                                                            approvalRequest = new ApprovalRequest(
                                                                              approvalRequestId
                                                                            );
                                                                            approvalRequest.seller = event.params.seller.toHex();
                                                                            approvalRequest.planet = event.params.planetId.toString();
                                                                            approvalRequest.status =
                                                                              "requested";
                                                                            approvalRequest.createdAt =
                                                                              event.block.timestamp;
                                                                          }

                                                                          // Update the updatedAt field in both cases
                                                                          approvalRequest.updatedAt =
                                                                            event.block.timestamp;
                                                                          approvalRequest.save();
                                                                        }
// Handle approvals granted to sellers
export function handleApprovalGranted(event: ApprovalGranted): void {
                                                                      let approvalRequestId = `${event.params.seller.toHex()}-${event.params.planetId.toString()}`;
                                                                      let approvalRequest = ApprovalRequest.load(
                                                                        approvalRequestId
                                                                      );

                                                                      if (
                                                                        approvalRequest
                                                                      ) {
                                                                        // Update the existing request to "granted" if it's currently "requested"
                                                                        if (
                                                                          approvalRequest.status ==
                                                                          "requested"
                                                                        ) {
                                                                          approvalRequest.status =
                                                                            "granted";
                                                                          approvalRequest.updatedAt =
                                                                            event.block.timestamp;
                                                                          approvalRequest.save();
                                                                        }
                                                                      } else {
                                                                        // This should never happen, but if it does, we create a new entry with "granted"
                                                                        approvalRequest = new ApprovalRequest(
                                                                          approvalRequestId
                                                                        );
                                                                        approvalRequest.seller = event.params.seller.toHex();
                                                                        approvalRequest.planet = event.params.planetId.toString();
                                                                        approvalRequest.status =
                                                                          "granted";
                                                                        approvalRequest.createdAt =
                                                                          event.block.timestamp;
                                                                        approvalRequest.updatedAt =
                                                                          event.block.timestamp;
                                                                        approvalRequest.save();
                                                                      }

                                                                      // Log the approval event
                                                                      let approvalEvent = new ApprovalEvent(
                                                                        event.transaction.hash.toHex()
                                                                      );
                                                                      approvalEvent.eventType =
                                                                        "granted";
                                                                      approvalEvent.seller = event.params.seller.toHex();
                                                                      approvalEvent.planet = event.params.planetId.toString();
                                                                      approvalEvent.createdAt =
                                                                        event.block.timestamp;
                                                                      approvalEvent.updatedAt =
                                                                        event.block.timestamp;
                                                                      approvalEvent.save();
                                                                    }

// Handle approvals declined for sellers
export function handleApprovalDeclined(event: ApprovalDeclined): void {
  let approvalRequestId = `${event.params.seller.toHex()}-${event.params.planetId.toString()}`;
  let approvalRequest = ApprovalRequest.load(approvalRequestId);

  if (approvalRequest) {
    // Update the existing request to "declined" if it's currently "requested"
    if (approvalRequest.status == "requested") {
      approvalRequest.status = "declined";
      approvalRequest.updatedAt = event.block.timestamp;
      approvalRequest.save();
    }
  } else {
    // This should never happen, but if it does, we create a new entry with "declined"
    approvalRequest = new ApprovalRequest(approvalRequestId);
    approvalRequest.seller = event.params.seller.toHex();
    approvalRequest.planet = event.params.planetId.toString();
    approvalRequest.status = "declined";
    approvalRequest.createdAt = event.block.timestamp;
    approvalRequest.updatedAt = event.block.timestamp;
    approvalRequest.save();
  }

  // Log the approval event
  let approvalEvent = new ApprovalEvent(event.transaction.hash.toHex());
  approvalEvent.eventType = "declined";
  approvalEvent.seller = event.params.seller.toHex();
  approvalEvent.planet = event.params.planetId.toString();
  approvalEvent.createdAt = event.block.timestamp;
  approvalEvent.updatedAt = event.block.timestamp;
  approvalEvent.save();
}

// Handle appeals raised by buyers or sellers
export function handleAppealRaised(event: AppealRaised): void {
  let appeal = new Appeal(event.transaction.hash.toHex());

  let purchase = Purchase.load(event.params.purchaseId.toString());
  if (purchase) {
    appeal.purchase = purchase.id;
    appeal.buyer = purchase.buyer;
    appeal.seller = purchase.seller;
  }

  appeal.by = event.params.by;
  appeal.createdAt = event.block.timestamp;
  appeal.updatedAt = event.block.timestamp;
  appeal.save();

  if (purchase != null) {
    purchase.appealRaised = true;
    purchase.updatedAt = event.block.timestamp;
    purchase.save();
  }
}
