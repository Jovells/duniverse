import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Get signers for different roles
  const [deployerSigner, ruler1, ruler2, seller1, seller2] = await hre.ethers.getSigners();

  // Deploy ECedi contract
  const eCediDeployment = await deploy("ECedi", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  if (!eCediDeployment.address) {
    throw new Error("ECedi contract deployment failed, address is undefined.");
  }

  const eCedi = new ethers.Contract(eCediDeployment.address, eCediDeployment.abi, deployerSigner);
  console.log(`eCedi deployed to ${eCedi.target}`);

  // Deploy Duniverse contract with the ECedi contract address as the argument
  const duniverseDeployment = await deploy("Duniverse", {
    from: deployer,
    args: [eCedi.target],
    log: true,
    autoMine: true,
  });

  if (!duniverseDeployment.address) {
    throw new Error("Duniverse contract deployment failed, address is undefined.");
  }

  const duniverse = new ethers.Contract(duniverseDeployment.address, duniverseDeployment.abi, deployerSigner);
  console.log(`Duniverse deployed to ${duniverse.target}`);

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
};

export default deployYourContract;

deployYourContract.tags = ["Duniverse"];
