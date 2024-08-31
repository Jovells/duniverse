import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
// import { Wallet } from "zksync-web3";

const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("deployer:", deployer);

  // Check if we're using a zkSync network
  const isZkSync = hre.network.config.zksync === true;

  // Get signers for different roles
  const [deployerSigner, ruler1, ruler2, seller1, seller2] = await hre.ethers.getSigners();

  // Function to check balance, send ETH if needed, and print balance if sufficient
  async function checkAndSendEth(address: string, signer: any, role: string) {
    const balance = await hre.ethers.provider.getBalance(address);
    const balanceInEth = ethers.formatEther(balance);
    if (balance < ethers.parseEther("0.004")) {
      console.log(`Sending ETH to ${role} (${address})`);
      await deployerSigner.sendTransaction({
        to: address,
        value: ethers.parseEther("0.003"),
      });
    } else {
      console.log(`${role} (${address}) has sufficient balance: ${balanceInEth} ETH`);
    }
  }

  // Function to deploy contracts
  async function deployContracts() {
    let mockUSDT, duniverse;

    if (isZkSync) {
      console.log("zksync deployment not working here. use Atlas");
    } else {
      // Regular deployment
      console.log("Deploying MockUSDT...");
      const mockUSDTDeployment = await deploy("MockUSDT", {
        from: deployer,
        args: [],
        log: true,
        autoMine: true,
      });

      if (!mockUSDTDeployment.address) {
        throw new Error("MockUSDT contract deployment failed, address is undefined.");
      }

      console.log(`MockUSDT deployed to ${mockUSDTDeployment.address}`);
      mockUSDT = await ethers.getContractAt("MockUSDT", mockUSDTDeployment.address);

      console.log("Deploying Duniverse...");
      const duniverseDeployment = await deploy("Duniverse", {
        from: deployer,
        args: [mockUSDT.target],
        log: true,
        autoMine: true,
      });

      if (!duniverseDeployment.address) {
        throw new Error("Duniverse contract deployment failed, address is undefined.");
      }

      console.log(`Duniverse deployed to ${duniverseDeployment.address}`);
      duniverse = await ethers.getContractAt("Duniverse", duniverseDeployment.address);
    }

    return { mockUSDT, duniverse };
  }

  // Function to create planets
  async function createPlanets(duniverse: any) {
    console.log("Creating planet 1 Pearson Consultants...");
    const tx1 = await duniverse.connect(ruler1).createPlanet("Pearson Consultants", "image.com", "The first planet");
    await tx1.wait();

    console.log("Creating planet 2 D-Bank...");
    const tx2 = await duniverse.connect(ruler2).createPlanet("D-Bank", "image.com", "The second planet");
    await tx2.wait();
  }

  // Function to request and approve sellers
  async function requestAndApproveSellers(duniverse: any) {
    console.log("requesting approval for seller1...");
    const requestApprovalTx1 = await duniverse.connect(seller1).requestApproval(1);
    await requestApprovalTx1.wait();

    console.log("requesting approval for seller2...");
    const requestApprovalTx2 = await duniverse.connect(seller2).requestApproval(2);
    await requestApprovalTx2.wait();

    console.log("approving seller1...");
    const approvalTx1 = await duniverse.connect(ruler1).approveSeller(seller1.address);
    await approvalTx1.wait();

    console.log("approving seller2...");
    const approvalTx2 = await duniverse.connect(ruler2).approveSeller(seller2.address);
    await approvalTx2.wait();
  }

  // Function to add products to planets
  async function addProducts(duniverse: any) {
    console.log("Adding products to planet 1...");
    const products1 = ["iPhone 16", "Samsung Galaxy", "Tesla Model 3", "Rolex Watch", "Yacht"];
    for (let i = 0; i < products1.length; i++) {
      const addProductTx = await duniverse
        .connect(seller1)
        .addProduct(products1[i], 1, "iphone.com", seller1.address, 100, ethers.parseUnits("10", 6));
      await addProductTx.wait();
      console.log(`Product ${i + 1} added to planet 1`);
    }

    console.log("Adding products to planet 2...");
    const products2 = [
      "chamber and hall",
      "6 bedroom mansion",
      "5 bedroom house",
      "4 bedroom house",
      "3 bedroom house",
    ];
    for (let i = 0; i < products2.length; i++) {
      const addProductTx = await duniverse
        .connect(seller2)
        .addProduct(products2[i], 2, "iphone.com", seller2.address, 100, ethers.parseUnits("100", 6));
      await addProductTx.wait();
      console.log(`Product ${i + 1} added to planet 2`);
    }
  }

  // Main deployment logic
  try {
    // Check and send ETH to ruler1, ruler2, seller1, and seller2
    await checkAndSendEth(ruler1.address, ruler1, "Ruler 1");
    await checkAndSendEth(ruler2.address, ruler2, "Ruler 2");
    await checkAndSendEth(seller1.address, seller1, "Seller 1");
    await checkAndSendEth(seller2.address, seller2, "Seller 2");

    const { duniverse } = await deployContracts();
    if (!duniverse) return;

    await createPlanets(duniverse);
    await requestAndApproveSellers(duniverse);
    await addProducts(duniverse);

    console.log(`2 Planets created and products added to each planet.`);
  } catch (error) {
    console.error("Deployment failed:", error);
    throw error;
  }
};

export default deployYourContract;

deployYourContract.tags = ["Duniverse"];