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
  planet.planetDescription = event.params.planetDescription;
  planet.ruler = event.params.ruler;
  planet.save();
}

// Handle the addition of a new product to a planet
export function handleProductAdded(event: ProductAdded): void {
  let product = new Product(event.params.productId.toString());
  product.productId = event.params.productId;

  let planet = Planet.load(event.params.planetId.toString());
  if (planet) {
    product.planet = planet.id; // Assign the planet ID (string) to the product
  }

  let seller = Seller.load(event.params.seller.toHex());
  if (!seller) {
    seller = new Seller(event.params.seller.toHex());
    seller.address = event.params.seller;
    seller.save();
  }
  product.seller = seller.id; // Assign the seller ID (string) to the product

  product.quantity = event.params.quantity;
  product.name = event.params.productName;
  product.price = event.params.price;
  product.sales = BigInt.fromI32(0); // Initialize sales to 0
  product.save();
}

// Handle the sale of a product
export function handleSale(event: Sale): void {
  let saleEvent = new SaleEvent(event.transaction.hash.toHex());
  saleEvent.purchase = event.params.purchaseId.toString();
  saleEvent.totalAmount = event.params.totalAmount;
  saleEvent.save();

  let purchase = Purchase.load(event.params.purchaseId.toString());
  if (purchase == null) {
    purchase = new Purchase(event.params.purchaseId.toString());
    purchase.purchaseId = event.params.purchaseId;

    let product = Product.load(event.params.purchaseId.toString());
    if (product) {
      purchase.product = product.id; // Assign the product ID (string) to the purchase
      purchase.seller = product.seller; // Use the seller from the associated product
    }

    purchase.buyer = event.params.buyer;
    purchase.amount = event.params.totalAmount;
    purchase.isReleased = false;
    purchase.isDelivered = false;
    purchase.isRefunded = false;
  }

  // Update product sales
  let product = Product.load(purchase.product);
  if (product != null) {
    product.sales = product.sales.plus(BigInt.fromI32(1));
    product.save();
  }

  purchase.save();
}

// Handle refund of a purchase
export function handleRefund(event: Refund): void {
  let refundEvent = new RefundEvent(event.transaction.hash.toHex());
  refundEvent.purchase = event.params.purchaseId.toString();
  refundEvent.amount = event.params.totalAmount;
  refundEvent.save();

  let purchase = Purchase.load(event.params.purchaseId.toString());
  if (purchase != null) {
    purchase.isRefunded = true;
    purchase.save();
  }
}

// Handle release of funds after a purchase
export function handleRelease(event: Release): void {
  let releaseEvent = new ReleaseEvent(event.transaction.hash.toHex());
  releaseEvent.purchase = event.params.purchaseId.toString();
  releaseEvent.amount = event.params.totalAmount;
  releaseEvent.save();

  let purchase = Purchase.load(event.params.purchaseId.toString());
  if (purchase != null) {
    purchase.isReleased = true;
    purchase.save();
  }
}

// Handle the delivery of a product
export function handleDelivered(event: Delivered): void {
  let deliveredEvent = new DeliveredEvent(event.transaction.hash.toHex());
  deliveredEvent.purchase = event.params.purchaseId.toString();
  deliveredEvent.totalAmount = event.params.totalAmount;
  deliveredEvent.save();

  let purchase = Purchase.load(event.params.purchaseId.toString());
  if (purchase != null) {
    purchase.isDelivered = true;
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
    seller.save();
  }
  approvalRequest.seller = seller.id; // Assign the seller ID (string) to the approval request

  let planet = Planet.load(event.params.planetId.toString());
  if (planet) {
    approvalRequest.planet = planet.id; // Assign the planet ID (string) to the approval request
  }

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
    seller.save();
  }
  approvalEvent.seller = seller.id; // Assign the seller ID (string) to the approval event

  let planet = Planet.load(event.params.planetId.toString());
  if (planet) {
    approvalEvent.planet = planet.id; // Assign the planet ID (string) to the approval event
  }

  approvalEvent.save();
}

// Handle approvals declined for sellers
export function handleApprovalDeclined(event: ApprovalDeclined): void {
  let approvalEvent = new ApprovalEvent(event.transaction.hash.toHex());
  approvalEvent.eventType = "declined";

  let seller = Seller.load(event.params.seller.toHex());
  if (!seller) {
    seller = new Seller(event.params.seller.toHex());
    seller.address = event.params.seller;
    seller.save();
  }
  approvalEvent.seller = seller.id; // Assign the seller ID (string) to the approval event

  let planet = Planet.load(event.params.planetId.toString());
  if (planet) {
    approvalEvent.planet = planet.id; // Assign the planet ID (string) to the approval event
  }

  approvalEvent.save();
}

// Handle appeals raised by buyers or sellers
export function handleAppealRaised(event: AppealRaised): void {
  let appeal = new Appeal(event.transaction.hash.toHex());

  let purchase = Purchase.load(event.params.purchaseId.toString());
  if (purchase) {
    appeal.purchase = purchase.id; // Assign the purchase ID (string) to the appeal
  }

  appeal.by = event.params.by;
  appeal.save();

  if (purchase != null) {
    purchase.appealRaised = true;
    purchase.save();
  }
}
