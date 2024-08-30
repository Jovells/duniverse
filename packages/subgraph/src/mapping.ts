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

// Utility function to get the current timestamp
function getCurrentTimestamp(): BigInt {
  return BigInt.fromI32(Date.now() / 1000);
}

// Handle the creation of a new planet
export function handlePlanetCreated(event: PlanetCreated): void {
  let planet = new Planet(event.params.planetId.toString());
  planet.planetId = event.params.planetId;
  planet.planetName = event.params.planetName;
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

  product.quantity = event.params.quantity;
  product.name = event.params.name;
  product.price = event.params.price;
  product.sales = BigInt.fromI32(0);
  product.createdAt = event.block.timestamp;
  product.updatedAt = event.block.timestamp;
  product.save();
}

// Handle the sale of a product
export function handleSale(event: Sale): void {
                                                let saleEvent = new SaleEvent(
                                                  event.transaction.hash.toHex()
                                                );
                                                saleEvent.purchase = event.params.purchaseId.toString();
                                                saleEvent.totalAmount =
                                                  event.params.totalAmount;
                                                saleEvent.createdAt =
                                                  event.block.timestamp;
                                                saleEvent.updatedAt =
                                                  event.block.timestamp;
                                                saleEvent.save();

                                                let purchase = Purchase.load(
                                                  event.params.purchaseId.toString()
                                                );
                                                if (purchase == null) {
                                                  purchase = new Purchase(
                                                    event.params.purchaseId.toString()
                                                  );
                                                  purchase.purchaseId =
                                                    event.params.purchaseId;

                                                  let product = Product.load(
                                                    event.params.purchaseId.toString()
                                                  );
                                                  if (product) {
                                                    purchase.product =
                                                      product.id;
                                                    purchase.seller =
                                                      product.seller;
                                                    product.updatedAt =
                                                      event.block.timestamp;
                                                    product.save();
                                                  }

                                                  let buyer = Buyer.load(
                                                    event.params.buyer.toHex()
                                                  );
                                                  if (!buyer) {
                                                    buyer = new Buyer(
                                                      event.params.buyer.toHex()
                                                    );
                                                    buyer.address =
                                                      event.params.buyer;
                                                    buyer.createdAt =
                                                      event.block.timestamp;
                                                    buyer.updatedAt =
                                                      event.block.timestamp;
                                                    buyer.save();
                                                  }
                                                  purchase.buyer = buyer.id;

                                                  purchase.amount =
                                                    event.params.totalAmount;
                                                  purchase.isReleased = false;
                                                  purchase.isDelivered = false;
                                                  purchase.isRefunded = false;
                                                  purchase.appealRaised = false;
                                                  purchase.createdAt =
                                                    event.block.timestamp;
                                                  purchase.updatedAt =
                                                    event.block.timestamp;
                                                }

                                                let product = Product.load(
                                                  purchase.product
                                                );
                                                if (product != null) {
                                                  product.sales = product.sales.plus(
                                                    BigInt.fromI32(1)
                                                  );
                                                  product.updatedAt =
                                                    event.block.timestamp;
                                                  product.save();
                                                }

                                                purchase.updatedAt =
                                                  event.block.timestamp;
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
  let approvalRequest = new ApprovalRequest(event.transaction.hash.toHex());

  let seller = Seller.load(event.params.seller.toHex());
  if (!seller) {
    seller = new Seller(event.params.seller.toHex());
    seller.address = event.params.seller;
    seller.createdAt = event.block.timestamp;
    seller.updatedAt = event.block.timestamp;
    seller.save();
  }
  approvalRequest.seller = seller.id;

  let planet = Planet.load(event.params.planetId.toString());
  if (planet) {
    approvalRequest.planet = planet.id;
    planet.updatedAt = event.block.timestamp;
    planet.save();
  }

  approvalRequest.status = "requested";
  approvalRequest.createdAt = event.block.timestamp;
  approvalRequest.updatedAt = event.block.timestamp;
  approvalRequest.save();
}

// Handle approvals granted to sellers
export function handleApprovalGranted(event: ApprovalGranted): void {
  let approvalEvent = new ApprovalEvent(event.transaction.hash.toHex());
  approvalEvent.eventType = "granted";

  let seller = Seller.load(event.params.seller.toHex());
  if (!seller) {
    seller = new Seller(event.params.seller.toHex());
    seller.address = event.params.seller;
    seller.createdAt = event.block.timestamp;
    seller.updatedAt = event.block.timestamp;
    seller.save();
  }
  approvalEvent.seller = seller.id;

  let planet = Planet.load(event.params.planetId.toString());
  if (planet) {
    approvalEvent.planet = planet.id;
    planet.updatedAt = event.block.timestamp;
    planet.save();
  }

  approvalEvent.createdAt = event.block.timestamp;
  approvalEvent.updatedAt = event.block.timestamp;
  approvalEvent.save();

  let approvalRequest = ApprovalRequest.load(
    approvalEvent.seller + "-" + approvalEvent.planet
  );
  if (approvalRequest != null) {
    approvalRequest.status = "granted";
    approvalRequest.updatedAt = event.block.timestamp;
    approvalRequest.save();
  }
}

// Handle approvals declined for sellers
export function handleApprovalDeclined(event: ApprovalDeclined): void {
  let approvalEvent = new ApprovalEvent(event.transaction.hash.toHex());
  approvalEvent.eventType = "declined";

  let seller = Seller.load(event.params.seller.toHex());
  if (!seller) {
    seller = new Seller(event.params.seller.toHex());
    seller.address = event.params.seller;
    seller.createdAt = event.block.timestamp;
    seller.updatedAt = event.block.timestamp;
    seller.save();
  }
  approvalEvent.seller = seller.id;

  let planet = Planet.load(event.params.planetId.toString());
  if (planet) {
    approvalEvent.planet = planet.id;
    planet.updatedAt = event.block.timestamp;
    planet.save();
  }

  approvalEvent.createdAt = event.block.timestamp;
  approvalEvent.updatedAt = event.block.timestamp;
  approvalEvent.save();

  let approvalRequest = ApprovalRequest.load(
    approvalEvent.seller + "-" + approvalEvent.planet
  );
  if (approvalRequest != null) {
    approvalRequest.status = "declined";
    approvalRequest.updatedAt = event.block.timestamp;
    approvalRequest.save();
  }
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
