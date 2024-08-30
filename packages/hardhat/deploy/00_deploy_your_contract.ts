import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { Wallet } from "zksync-web3";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

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
    if (balance < ethers.parseEther("0.0001")) {
      console.log(`Sending ETH to ${role} (${address})`);
      await deployerSigner.sendTransaction({
        to: address,
        value: ethers.parseEther("0.001"),
      });
    } else {
      console.log(`${role} (${address}) has sufficient balance: ${balanceInEth} ETH`);
    }
  }

  // Check and send ETH to ruler1, ruler2, seller1, and seller2
  await checkAndSendEth(ruler1.address, ruler1, "Ruler 1");
  await checkAndSendEth(ruler2.address, ruler2, "Ruler 2");
  await checkAndSendEth(seller1.address, seller1, "Seller 1");
  await checkAndSendEth(seller2.address, seller2, "Seller 2");

  try {
    let mockUSDT, duniverse;

    if (isZkSync) {
      // zkSync deployment
      console.log(`Running deploy script for the zkSync network`);

      // Initialize the wallet.
      const wallet = new Wallet(process.env.DEPLOYER_PRIVATE_KEY || "");

      // Create deployer object and load the artifact of the contract you want to deploy.
      const deployer = new Deployer(hre, wallet);

      // Deploy MockUSDT
      const mockUSDTArtifact = await deployer.loadArtifact("MockUSDT");
      mockUSDT = await deployer.deploy(mockUSDTArtifact, []);
      console.log(`MockUSDT deployed to ${await mockUSDT.getAddress()}`);

      // Deploy Duniverse
      const duniverseArtifact = await deployer.loadArtifact("Duniverse");
      duniverse = await deployer.deploy(duniverseArtifact, [await mockUSDT.getAddress()]);
      console.log(`Duniverse deployed to ${await duniverse.getAddress()}`);
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

    // Create 2 planets with different rulers
    const tx1 = await duniverse.connect(ruler1).createPlanet(1, "Planet A", "The first planet");
    await tx1.wait();
    const tx2 = await duniverse.connect(ruler2).createPlanet(2, "Planet B", "The second planet");
    await tx2.wait();

    // Request approval for sellers on both planets
    const requestApprovalTx1 = await duniverse.connect(seller1).requestApproval(1);
    await requestApprovalTx1.wait();
    const requestApprovalTx2 = await duniverse.connect(seller2).requestApproval(2);
    await requestApprovalTx2.wait();

    // Approve sellers for both planets
    const approvalTx1 = await duniverse.connect(ruler1).approveSeller(seller1.address);
    await approvalTx1.wait();
    const approvalTx2 = await duniverse.connect(ruler2).approveSeller(seller2.address);
    await approvalTx2.wait();

    // Add 5 products to each planet
    for (let i = 1; i <= 5; i++) {
      const addProductTx = await duniverse
        .connect(seller1)
        .addProduct(i, 1, seller1.address, 100, ethers.parseEther("1"));
      await addProductTx.wait();
    }
    for (let i = 6; i <= 10; i++) {
      const addProductTx = await duniverse
        .connect(seller2)
        .addProduct(i, 2, seller2.address, 100, ethers.parseEther("2"));
      await addProductTx.wait();
    }

    console.log(`2 Planets created and 5 products added to each planet.`);
  } catch (error) {
    console.error("Deployment failed:", error);
    throw error;
  }
};

export default deployYourContract;

deployYourContract.tags = ["Duniverse"];
