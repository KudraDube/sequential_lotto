🎟️ SequentialLotto


A fully automated, decentralized lottery system built on Ethereum. This contract allows players to purchase tickets with their lucky numbers and uses Chainlink VRF (Verifiable Random Function) v2.5 to ensure the draw is provably fair and tamper-proof.

The best part? It's self-executing. Thanks to Chainlink Automation, the lottery draws itself every 24 hours without any human intervention.

🎮 How to Play
Buy a Ticket: Call buyTicket with an array of 7 numbers (each between 1 and 49).

Price: Each ticket costs exactly 0.01 ETH.

The Draw: Every 24 hours, if there are tickets in the pool, the contract automatically requests 7 random numbers from Chainlink.

Winning: Payouts are based on how many numbers you match in sequence, starting from the first number.

🤖 Automation & Fairness
This project leverages the latest Web3 infrastructure to stay decentralized:

Chainlink VRF v2.5: Unlike standard random number generators in code, VRF provides cryptographic proof that the winning numbers haven't been manipulated by the owner or the miners.

Chainlink Automation: The checkUpkeep and performUpkeep functions allow the Chainlink Network to monitor the contract. Once the interval (1 day) has passed, the network triggers the draw automatically.

💰 Prize Distribution
The contract takes the total ETH pool and distributes it as follows:

10% Fee: Sent to the contract owner to cover gas and maintenance.

Tiered Payouts:

2 Matches: 5% of the pool

3 Matches: 10% of the pool

4 Matches: 15% of the pool

5-6 Matches: 20% of the pool

7 Matches (Jackpot): 30% of the pool

Note: Matches must be sequential. If you miss the first or second number, the check stops!

🛠️ Technical Setup (Hardhat)
1. Environment Variables
You'll need a .env file with your VRF_SUBSCRIPTION_ID and the VRF_COORDINATOR address for your specific network (e.g., Sepolia).

2. Installation & Compile
Bash
npm install
npx hardhat compile
3. Deployment
When deploying, you must provide the Subscription ID from the Chainlink VRF Dashboard:

Bash
npx hardhat run scripts/deploy.js --network sepolia
📜 License
MIT
