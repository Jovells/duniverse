// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./mockUSDT.sol";

contract Duniverse {
    address public owner;  // The owner of the contract
    address public MOCKUSDT_ADDRESS;

    mapping(uint256 => Purchase) public purchases;
    mapping(uint256 => Product) public products;
    mapping(uint256 => Planet) public planets;
    mapping(address => uint) public approvedSellers;
    mapping(address => uint256) public approvalRequests;
    mapping(uint256 => bool) public appeals; // New mapping for appeals

    uint256 public numPurchases;
    uint256 public numProducts;

    struct Planet {
        uint256 planetId;
        string planetName;
        string planetDescription;
        address ruler;
    }

    struct Purchase {
        uint256 purchaseId;
        uint256 productId;
        address buyer;
        address seller;
        uint256 amount;
        bool isReleased;
        bool isDelivered;
        bool isRefunded;
    }

    struct Product {
        string productName;
        uint256 productId;
        uint256 planetId;
        address seller;
        uint256 quantity;
        uint256 price;
        uint256 sales;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the Owner can perform this operation");
        _;
    }

    modifier onlyApprovedSeller(uint256 planetId) {
        require(approvedSellers[msg.sender] == planetId, "Only approved sellers can add products");
        _;
    }

    modifier onlyBuyer(uint256 purchaseId) {
        require(msg.sender == purchases[purchaseId].buyer, "Only the Buyer can perform this operation");
        _;
    }

    modifier onlySeller(uint256 purchaseId) {
        require(msg.sender == purchases[purchaseId].seller, "Only the Seller can perform this operation");
        _;
    }

    modifier onlyPurchaseRuler(uint256 purchaseId) {
        Purchase memory purchase = purchases[purchaseId];
        uint productId = purchase.productId;
        uint planetId = products[productId].planetId;
        Planet memory planet = planets[planetId];
        require(msg.sender == planet.ruler, "Only the Ruler can perform this operation");
        _;
    }

    modifier onlyRuler(uint planetId) {
        require(msg.sender == planets[planetId].ruler, "Only the Ruler can perform this operation");
        _ ;
    }

    event Sale(
        address indexed buyer,
        uint256 purchaseId,
        uint256 totalAmount
    );

    event Refund(
        address indexed buyer,
        address indexed seller,
        uint256 purchaseId,
        uint256 totalAmount
    );

    event Release(
        address indexed buyer,
        uint256 purchaseId,
        uint256 totalAmount
    );

    event Delivered(
        address indexed buyer,
        uint256 purchaseId,
        uint256 totalAmount
    );

    event ApprovalRequested(
        address indexed seller,
        uint256 planetId
    );

    event ApprovalGranted(
        address indexed seller,
        uint256 planetId
    );

    event ApprovalDeclined(
        address indexed seller,
        uint256 planetId
    );

    event AppealRaised(
        uint256 indexed purchaseId,
        address indexed by
    );

    event PlanetCreated(
        uint256 indexed planetId,
        string planetName,
        string planetDescription,
        address indexed ruler
    );

    event ProductAdded(
        uint256 indexed productId,
        uint256 indexed planetId,
        address indexed seller,
        string name,
        uint256 quantity,
        uint256 price
    );

    constructor(address _MOCKUSDT_ADDRESS) {
        owner = msg.sender;
        MOCKUSDT_ADDRESS = _MOCKUSDT_ADDRESS;
    }

    // Function to add a product
    function addProduct(string memory _productName, uint256 _planetId, address _seller, uint256 _quantity, uint256 _price) public onlyApprovedSeller(_planetId) {
        uint256 _productId = ++numProducts;
        products[_productId] = Product(_productName, _productId, _planetId, _seller, _quantity, _price, 0);
        emit ProductAdded(_productId, _planetId, _seller,_productName, _quantity, _price); // Emit event when a product is added
    }

    // Function for sellers to request approval
    function requestApproval(uint256 _planetId) public {
        approvalRequests[msg.sender] = _planetId;
        emit ApprovalRequested(msg.sender, _planetId);
    }

    // Function for rulers to approve a seller
    function approveSeller(address _seller) public onlyRuler(approvalRequests[_seller]) {
        uint256 planetId = approvalRequests[_seller];
        approvedSellers[_seller] = planetId;
        delete approvalRequests[_seller];
        emit ApprovalGranted(_seller, planetId);
    }

    // Function for rulers to decline a seller
    function declineSeller(address _seller) public onlyPurchaseRuler(approvalRequests[_seller]) {
        uint256 planetId = approvalRequests[_seller];
        delete approvalRequests[_seller];
        emit ApprovalDeclined(_seller, planetId);
    }

    function createPlanet(uint256 _planetId, string memory _planetName, string memory _planetDescription) public {
        planets[_planetId] = Planet(_planetId, _planetName, _planetDescription, msg.sender);
        emit PlanetCreated(_planetId, _planetName, _planetDescription, msg.sender); // Emit event when a planet is created
    }

    function getPurchases(uint start, uint end) public view returns (Purchase[] memory) {
        require(start <= end, "Invalid range");
        uint length = end - start + 1;
        Purchase[] memory _purchases = new Purchase[](length);
        uint j = 0;
        for (uint i = start; i <= end; i++) {
            _purchases[j] = purchases[i];
            j++;
        }
        return _purchases;
    }

    function getBuyerPurchases(address buyer, uint start, uint end) public view returns (Purchase[] memory) {
        require(start <= end, "Invalid range");
        uint length = end - start + 1;
        Purchase[] memory _purchases = new Purchase[](length);
        uint j = 0;
        for (uint i = start; i <= end; i++) {
            if (purchases[i].buyer == buyer) {
                _purchases[j] = purchases[i];
                j++;
            }
        }
        return _purchases;
    }

    function getSellerPurchases(address seller, uint start, uint end) public view returns (Purchase[] memory) {
        require(start <= end, "Invalid range");
        uint length = end - start + 1;
        Purchase[] memory _purchases = new Purchase[](length);
        uint j = 0;
        for (uint i = start; i <= end; i++) {
            if (purchases[i].seller == seller) {
                _purchases[j] = purchases[i];
                j++;
            }
        }
        return _purchases;
    }

    function purchaseProduct(uint256 _productId, uint256 _quantity) public payable {
        require(products[_productId].quantity >= _quantity, "Insufficient inventory or product does not exist");
        uint256 totalPrice = products[_productId].price * _quantity;
        MockUSDT(MOCKUSDT_ADDRESS).transferFrom(msg.sender, address(this), totalPrice);
        numPurchases++;
        emit Sale(msg.sender, numPurchases, totalPrice);
        products[_productId].quantity -= _quantity;
        products[_productId].sales += _quantity;
        purchases[numPurchases] = Purchase(numPurchases, _productId, msg.sender, products[_productId].seller, totalPrice, false, false, false);
        emit Sale(msg.sender, numPurchases, _quantity);
    }

    // Function to issue a refund
    function release(uint256 _purchaseId) external onlyBuyer(_purchaseId) {
        require(!purchases[_purchaseId].isReleased, "Funds are already released");
        MockUSDT(MOCKUSDT_ADDRESS).transfer(purchases[_purchaseId].seller, purchases[_purchaseId].amount);
        purchases[_purchaseId].isReleased = true;
        emit Release(msg.sender, _purchaseId, purchases[_purchaseId].amount);
    }

    function releaseFor(uint256 _purchaseId) external onlyPurchaseRuler(_purchaseId) {
        require(appeals[_purchaseId], "Appeal must be raised before release");
        require(!purchases[_purchaseId].isReleased, "Funds are already released");
        MockUSDT(MOCKUSDT_ADDRESS).transfer(purchases[_purchaseId].seller, purchases[_purchaseId].amount);
        purchases[_purchaseId].isReleased = true;
        emit Release(msg.sender, _purchaseId, purchases[_purchaseId].amount);
    }

    function refund(uint256 _purchaseId) external onlyPurchaseRuler(_purchaseId) {
        require(appeals[_purchaseId], "Appeal must be raised before refund");
        require(!purchases[_purchaseId].isReleased, "Funds are already released");
        require(!purchases[_purchaseId].isRefunded, "Purchase already refunded");
        MockUSDT(MOCKUSDT_ADDRESS).transfer(purchases[_purchaseId].buyer, purchases[_purchaseId].amount);
        emit Refund(msg.sender, purchases[_purchaseId].seller, _purchaseId, purchases[_purchaseId].amount);
        purchases[_purchaseId].isRefunded = true;
    }

    function markDelivered(uint256 _purchaseId) external onlySeller(_purchaseId) {
        require(!purchases[_purchaseId].isDelivered, "Already shipped");
        purchases[_purchaseId].isDelivered = true;
        emit Delivered(msg.sender, _purchaseId, purchases[_purchaseId].amount);
    }

    // Function for buyers and sellers to raise an appeal
    function raiseAppeal(uint256 _purchaseId) external {
        require(msg.sender == purchases[_purchaseId].buyer || msg.sender == purchases[_purchaseId].seller, "Only buyer or seller can raise an appeal");
        appeals[_purchaseId] = true;
        emit AppealRaised(_purchaseId, msg.sender);
    }
}
