# Web3Wrap - ERC20 Token Example

This project demonstrates a simple ERC20 token implementation with a React frontend.

## Smart Contract

The project includes a simple ERC20 token contract created with OpenZeppelin:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Erc20Token is ERC20, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address initialOwner
    ) ERC20(name, symbol) Ownable(initialOwner) {
        _mint(initialOwner, initialSupply * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}
```

## Contract Deployment

To deploy the contract:

1. Install Hardhat: `npm install --save-dev hardhat`
2. Create a new Hardhat project: `npx hardhat init`
3. Install OpenZeppelin: `npm install @openzeppelin/contracts`
4. Copy the `Erc20Token.sol` contract into your `contracts/` directory
5. Create a deployment script:

```javascript
// scripts/deploy.js
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const Erc20Token = await ethers.getContractFactory("Erc20Token");
  const token = await Erc20Token.deploy(
    "My Token", // name
    "MTK", // symbol
    "1000000", // initialSupply
    deployer.address, // initialOwner
  );

  await token.deployed();
  console.log("Token deployed to:", token.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

6. Run the deployment: `npx hardhat run scripts/deploy.js --network <your-network>`

## Frontend Integration

The frontend uses:

- Next.js for the React framework
- Wagmi and Viem for Ethereum interactions
- Shadcn UI components for the interface

## Features

- Deploy new ERC20 tokens (in actual deployment this would use Hardhat/Foundry)
- Interact with existing tokens (check balance, get info)
- Transfer tokens to other addresses

## Getting Started

1. Install dependencies: `npm install`
2. Run the development server: `npm run dev`
3. Visit [http://localhost:3000/token](http://localhost:3000/token) to use the app

## Prerequisites

- Node.js
- Metamask or other Web3 wallet
- Access to Ethereum testnet (Sepolia recommended)
