const hre = require("hardhat");

async function main() {
  const UserRegistry = await hre.ethers.getContractFactory("UserRegistry");
  const userReg = await UserRegistry.deploy();

  await userReg.waitForDeployment();
  const userRegAddress = await userReg.getAddress();
  console.log("UserReg deployed to:", userRegAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
