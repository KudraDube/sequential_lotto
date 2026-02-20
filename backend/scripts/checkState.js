import hre from "hardhat";

async function main() {
  // Your NEW deployed contract
  const CONTRACT_ADDRESS = "0x8e6b0c11e3c98fcf40001269759083cf0d3ccbfb";
  const lotto = await hre.ethers.getContractAt("SequentialLotto", CONTRACT_ADDRESS);

  console.log("🔍 Checking Lottery State...\n");

  // 1. Check the Money
  const balance = await hre.ethers.provider.getBalance(CONTRACT_ADDRESS);
  console.log("💰 Contract Balance:", hre.ethers.formatEther(balance), "ETH");

  // 2. Check the Clock
  const lastDraw = await lotto.lastDrawTimestamp();
  const now = Math.floor(Date.now() / 1000);
  const timePassed = now - Number(lastDraw);
  const timeLeft = 86400 - timePassed; // 86400 seconds = 24 hours

  console.log("⏱️ Time passed since deploy:", Math.floor(timePassed / 60), "minutes");
  if (timeLeft > 0) {
    console.log("⏳ Time until next automated draw:", (timeLeft / 3600).toFixed(2), "hours");
  } else {
    console.log("⏰ 24 hours have passed! Automation should trigger soon.");
  }

  // 3. Check for Tickets
  try {
    const ticket = await lotto.tickets(0);
    console.log("\n🎟️ Ticket found! First player in pool:", ticket.player);
  } catch (e) {
    console.log("\n🎟️ No tickets found in the pool yet.");
  }

  // 4. Check Winning Numbers
  let numbers = [];
  try {
      for(let i=0; i<7; i++) {
        let num = Number(await lotto.lastWinningNumbers(i));
        if (num !== 0) numbers.push(num);
      }
      if (numbers.length > 0) {
          console.log("🎯 Last Winning Numbers:", numbers);
      } else {
          console.log("🎯 No winning numbers yet (Waiting for the 24hr timer!)");
      }
  } catch(e) {
      console.log("🎯 Could not read winning numbers.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});