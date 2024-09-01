🏗 DUniverse - Scaffold-ETH 2 based Framework
<h4 align="center"> <a href="https://docs.scaffoldeth.io">Documentation</a> | <a href="https://scaffoldeth.io">Website</a> </h4>
🧪 An open-source, up-to-date toolkit for building decentralized applications (dapps) on the Ethereum blockchain. It's designed to make it easier for developers to create and deploy smart contracts and build user interfaces that interact with those contracts.

⚙️ Built using NextJS, RainbowKit, Hardhat, Wagmi, Viem, and Typescript.

✅ Contract Hot Reload: Your frontend auto-adapts to your smart contract as you edit it.
🪝 Custom hooks: Collection of React hooks wrapper around wagmi to simplify interactions with smart contracts with typescript autocompletion.
🧱 Components: Collection of common web3 components to quickly build your frontend.
🔥 Burner Wallet & Local Faucet: Quickly test your application with a burner wallet and local faucet.
🔐 Integration with Wallet Providers: Connect to different wallet providers and interact with the Ethereum network.
Requirements
Before you begin, you need to install the following tools:

Node (>= v18.17)
Yarn (v1 or v2+)
Git
Quickstart
To get started with Scaffold-ETH 2, follow the steps below:

Install dependencies if it was skipped in CLI:

``` cd my-dapp-example yarn install ```

Run a local network in the first terminal:

``` yarn chain ```

This command starts a local Ethereum network using Hardhat. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in packages/hardhat/hardhat.config.ts.

On a second terminal, deploy the test contract:

``` yarn deploy ```

This command deploys a test smart contract to the local network. The contract is located in packages/hardhat/contracts and can be modified to suit your needs. The yarn deploy command uses the deploy script located in packages/hardhat/deploy to deploy the contract to the network. You can also customize the deploy script.

On a third terminal, start your NextJS app:

``` yarn start ```

Visit your app on: http://localhost:3000. You can interact with your smart contract using the Debug Contracts page. You can tweak the app config in packages/nextjs/scaffold.config.ts.

Run smart contract test with yarn hardhat:test

Edit your smart contract YourContract.sol in packages/hardhat/contracts
Edit your frontend homepage at packages/nextjs/app/page.tsx. For guidance on routing and configuring pages/layouts checkout the Next.js documentation.
Edit your deployment scripts in packages/hardhat/deploy
🚀 Setup The Graph Integration
Now that we have spun up our blockchain, started our frontend application and deployed our smart contract, we can start setting up our subgraph and utilize The Graph!

Before following these steps be sure Docker is running!

✅ Step 1: Clean up any old data and spin up our docker containers ✅
First run the following to clean up any old data. Do this if you need to reset everything.

``` yarn clean-node ```

We can now spin up a graph node by running the following command… 🧑‍🚀

``` yarn run-node ```

This will spin up all the containers for The Graph using docker-compose. You will want to keep this window open at all times so that you can see log output from Docker.

As stated before, be sure to keep this window open so that you can see any log output from Docker. 🔎

NOTE FOR LINUX USERS: If you are running Linux you will need some additional changes to the project.

Linux Only
For hardhat

Update your package.json in packages/hardhat with the following command line option for the hardhat chain.

``` "chain": "hardhat node --network hardhat --no-deploy --hostname 0.0.0.0" ```

For foundry

Update your package.json in packages/foundry with the following command line option for the anvil chain.

``` "chain": "anvil --host 0.0.0.0 --config-out localhost.json", ```

Save the file and then restart your chain in its original window.

``` yarn chain ```

Redeploy your smart contracts.

``` yarn deploy ```

You might also need to add a firewall exception for port 8432. As an example for Ubuntu... run the following command.

``` sudo ufw allow 8545/tcp ```

✅ Step 2: Create and ship our subgraph ✅
Now we can open up a fifth window to finish setting up The Graph. 😅 In this fifth window we will create our local subgraph!

Note: You will only need to do this once.

``` yarn local-create ```

You should see some output stating your subgraph has been created along with a log output on your graph-node inside docker.

Next we will ship our subgraph! You will need to give your subgraph a version after executing this command. (e.g. 0.0.1).

``` yarn local-ship ```

This command does the following all in one… 🚀🚀🚀

Copies the contracts ABI from the hardhat/deployments folder
Generates the networks.json file
Generates AssemblyScript types from the subgraph schema and the contract ABIs.
Compiles and checks the mapping functions.
… and deploy a local subgraph!
If you get an error ts-node you can install it with the following command

``` npm install -g ts-node ```

You should get a build completed output along with the address of your Subgraph endpoint.

``` Build completed: QmYdGWsVSUYTd1dJnqn84kJkDggc2GD9RZWK5xLVEMB9iP

Deployed to http://localhost:8000/subgraphs/name/scaffold-eth/your-contract/graphql

Subgraph endpoints: Queries (HTTP): http://localhost:8000/subgraphs/name/scaffold-eth/your-contract ```

✅ Step 3: Test your Subgraph ✅
Go ahead and head over to your subgraph endpoint and take a look!

Here is an example query…

``` { greetings(first: 25, orderBy: createdAt, orderDirection: desc) { id greeting premium value createdAt sender { address greetingCount } } } ```

If all is well and you’ve sent a transaction to your smart contract then you will see a similar data output!

✅ Side Quest: Run a Matchstick Test ✅
Matchstick is a unit testing framework, developed by LimeChain, that enables subgraph developers to test their mapping logic in a sandboxed environment and deploy their subgraphs with confidence!

The project comes with a pre-written test located in packages/subgraph/tests/asserts.test.ts

To test simply type....

``` yarn subgraph
```

This will run graph test and automatically download the needed files for testing.

You should receive the following output.

``` Fetching latest version tag... Downloading release from https://github.com/LimeChain/matchstick/releases/download/0.6.0/binary-macos-11-m1 binary-macos-11-m1 has been installed!

Compiling...

💬 Compiling asserts...

Igniting tests 🔥

asserts
Asserts: √ Greeting and Sender entities - 0.102ms

All 1 tests passed! 😎

[Thu, 07 Mar 2024 15:10:26 -0800] Program executed in: 1.838s. ```

NOTE: If you get an error, you may trying passing -d flag yarn subgraph:test -d. This will run matchstick in docker container.

Shipping to Subgraph Studio 🚀
NOTE: This step requires deployment of contract to live network. Checkout list of supported networks.

Update the packages/subgraph/subgraph.yaml file with your contract address, network name, start block number(optional) : ``` ...

network: goerli ... source: address: "YOUR CONTRACT ADDRESS" startBlock: 8397357 # Optional ... ```
Create a new Subgraph in Subgraph Studio and deploy the code.

🔌 Ora AI Web3.js Plugin Integration
This project includes integration with the Ora AI plugin using Web3.js, allowing users to interact with the blockchain through AI-driven text prompts.

Setup
Install the Ora AI plugin in your Next.js project:

``` yarn add ora-ai-web3 ```

Import the plugin into your Next.js component:

``` import OraWeb3 from 'ora-ai-web3'; ```

Initialize the OraWeb3 instance and set up a basic text-to-blockchain interaction:

``` const oraWeb3 = new OraWeb3({ provider: "https://goerli.infura.io/v3/YOUR_INFURA_PROJECT_ID", contractAddress: "YOUR_SMART_CONTRACT_ADDRESS", abi: YOUR_CONTRACT_ABI, });

const handleGenerate = async () => { const result = await oraWeb3.generate("Mint a new token with the name 'ScaffoldToken'"); console.log(result); }; ```

Use the handleGenerate function to trigger interactions via AI-generated text:

``` <button onClick={handleGenerate}>Generate on Blockchain</button> ```

This integration enables users to interact with the blockchain by simply typing in prompts, making it more accessible for non-technical users.

