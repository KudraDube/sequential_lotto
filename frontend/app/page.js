"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import LottoABI from "@/utils/SequentialLotto.json";
import { Bangers } from "next/font/google";

// 🎪 Import the cheesy font
const bangers = Bangers({ weight: "400", subsets: ["latin"] });

// ⚙️ Config
const CONTRACT_ADDRESS = "0x8e6b0c11e3c98fcf40001269759083cf0d3ccbfb";
const PUBLIC_RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com"; 

export default function Home() {
  // State Variables
  const [account, setAccount] = useState(null);
  const [ticketNumbers, setTicketNumbers] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [jackpot, setJackpot] = useState("0.00");
  const [lastWinners, setLastWinners] = useState([0,0,0,0,0,0,0]);
  const [countdown, setCountdown] = useState("Loading...");
  const [lastDrawTime, setLastDrawTime] = useState(null);

  // --- Blockchain Functions (Same as before) ---
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        setAccount(await signer.getAddress());
      } catch (error) { console.error(error); }
    } else { alert("Please install MetaMask!"); }
  };

  useEffect(() => {
    const fetchBlockchainData = async () => {
      try {
        const provider = new ethers.JsonRpcProvider(PUBLIC_RPC_URL);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, LottoABI.abi, provider);
        setJackpot(ethers.formatEther(await provider.getBalance(CONTRACT_ADDRESS)));
        setLastDrawTime(Number(await contract.lastDrawTimestamp()));
        let winners = [];
        for (let i = 0; i < 7; i++) {
          winners.push(Number(await contract.lastWinningNumbers(i)));
        }
        setLastWinners(winners);
      } catch (error) { console.error(error); }
    };
    fetchBlockchainData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!lastDrawTime) return;
      const now = Math.floor(Date.now() / 1000);
      const timeLeft = 86400 - (now - lastDrawTime);
      if (timeLeft <= 0) { setCountdown("DRAWING NOW!"); } else {
        const h = Math.floor(timeLeft / 3600);
        const m = Math.floor((timeLeft % 3600) / 60);
        const s = timeLeft % 60;
        setCountdown(`${h}h ${m}m ${s}s`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lastDrawTime]);

  const buyTicket = async () => {
    if (!account) return alert("Connect wallet first!");
    const numbersArray = ticketNumbers.split(",").map((n) => parseInt(n.trim()));
    if (numbersArray.length !== 7 || numbersArray.some((n) => isNaN(n) || n < 1 || n > 49)) return alert("Pick exactly 7 numbers between 1-49.");
    try {
      setIsLoading(true); setStatus("Confirm in MetaMask...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, LottoABI.abi, signer);
      const tx = await contract.buyTicket(numbersArray, { value: ethers.parseEther("0.01") });
      setStatus(`Sending...`); await tx.wait(); 
      setStatus("✅ Ticket Purchased! Sho!"); setTicketNumbers(""); setIsLoading(false);
      setJackpot((prev) => (parseFloat(prev) + 0.01).toFixed(3));
    } catch (error) { console.error(error); setStatus("❌ Error: " + (error.reason || error.message)); setIsLoading(false); }
  };
  // ------------------------------------

  return (
    // Main container forced to screen height (h-screen) and no overflow (overflow-hidden)
    <main className="h-screen w-full bg-gradient-to-b from-yellow-300 via-orange-200 to-yellow-300 flex flex-col items-center justify-between p-2 font-sans overflow-hidden relative">
      
      {/* Background decorative elements (low opacity gold coins) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10 font-extrabold text-9xl flex flex-wrap justify-around items-center z-0">
        <span>💰</span><span>🪙</span><span>💸</span><span>💰</span><span>🪙</span>
      </div>

      {/* HEADER */}
      <header className="text-center z-10 mt-2">
        <h1 className={`${bangers.className} text-6xl md:text-8xl text-orange-600 drop-shadow-[0_3px_0_#000] tracking-wider transform -rotate-2`}>
          🎱 ZONKE BONKE 🎱
        </h1>
        <p className="text-black font-black text-xl md:text-2xl uppercase tracking-widest -mt-2">
          Thatha amachance bhoza yami
        </p>
      </header>

      {/* TOP TABS (Timer & Last Winners) */}
      <div className="flex w-full max-w-4xl gap-2 md:gap-4 z-10 px-2 h-24 md:h-32 shrink-0">
        {/* Tab 1: Timer */}
        <div className="flex-1 bg-black/90 border-4 border-orange-500 rounded-2xl p-2 shadow-lg flex flex-col items-center justify-center text-white">
            <h3 className={`${bangers.className} text-xl text-orange-400 tracking-wider`}>⏳ NEXT DRAW IN:</h3>
            <p className="text-3xl md:text-5xl font-black text-white animate-pulse leading-none">{countdown}</p>
        </div>
          {/* Tab 2: Last Winners */}
        <div className="flex-1 bg-white/90 border-4 border-black rounded-2xl p-2 shadow-lg flex flex-col items-center justify-center text-black">
            <h3 className={`${bangers.className} text-xl text-black tracking-wider mb-1`}>🏆 LAST WINNING BALLS</h3>
            <div className="flex gap-1 md:gap-2 justify-center">
              {lastWinners.map((num, i) => (
                // Simulating snooker balls with rounded divs and alternating colors
                <div key={i} className={`w-7 h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center font-black text-white text-sm md:text-lg border-2 border-gray-800 shadow-sm ${num === 0 ? 'bg-gray-400' : i % 2 === 0 ? 'bg-red-600' : 'bg-black'}`}>
                  {num === 0 ? '-' : num}
                </div>
              ))}
            </div>
        </div>
      </div>

      {/* MAIN JACKPOT SECTION */}
      <div className="relative w-full py-4 flex flex-col items-center justify-center z-20 shrink-0 my-1">
        {/* Decorative money bags flanking the jackpot */}
        <span className="absolute left-[5%] md:left-[15%] text-6xl md:text-8xl animate-bounce">💰</span>
        <span className="absolute right-[5%] md:right-[15%] text-6xl md:text-8xl animate-bounce delay-100">💰</span>
        
        <h3 className={`${bangers.className} text-2xl md:text-4xl text-black mb-0 bg-yellow-400 px-4 py-1 border-2 border-black rounded-full z-10`}>
          CURRENT JACKPOT
        </h3>
        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 border-y-8 border-black w-full text-center py-2 shadow-[0_10px_20px_rgba(0,0,0,0.4)] transform rotate-1">
          <p className="text-7xl md:text-9xl font-black text-white drop-shadow-[0_5px_0_#000] leading-none">
            {jackpot} <span className="text-4xl md:text-6xl">ETH</span>
          </p>
        </div>
      </div>

      {/* GET TICKET SECTION (Fixed to bottom) */}
      <div className="bg-black w-full max-w-3xl rounded-t-3xl p-4 pb-6 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-30 text-white border-t-4 border-orange-500 shrink-0">
          <div className="flex justify-between items-center mb-3">
            <h2 className={`${bangers.className} text-2xl md:text-3xl text-orange-500`}>🎟️ GET YOUR TICKET!</h2>
            {/* Compact Wallet Connection Status */}
            {!account ? (
              <button onClick={connectWallet} className="bg-orange-500 hover:bg-orange-600 text-black font-bold py-1 px-4 rounded-full shadow-md transition-transform active:scale-95 text-sm border-2 border-white">
                🔌 CONNECT WALLET
              </button>
            ) : (
              <span className="bg-gray-800 text-orange-300 text-xs font-mono px-3 py-1 rounded-full border border-orange-500">
                🟢 {account.slice(0,6)}...{account.slice(-4)}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Pick 7: e.g. 3, 9, 15, 22, 31, 40, 49"
              className="flex-grow p-3 text-black font-bold text-lg rounded-xl border-4 border-orange-500 focus:outline-none focus:ring-4 focus:ring-yellow-300 transition text-center bg-yellow-100"
              value={ticketNumbers}
              onChange={(e) => setTicketNumbers(e.target.value)}
            />
            <button 
              onClick={buyTicket}
              disabled={isLoading || !account}
              className={`font-black text-xl py-3 px-6 rounded-xl shadow-lg transition-all whitespace-nowrap border-b-4 ${
                isLoading || !account 
                  ? "bg-gray-600 border-gray-800 cursor-not-allowed text-gray-400" 
                  : "bg-gradient-to-b from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 border-orange-900 text-black transform hover:-translate-y-1 active:translate-y-0"
              }`}
            >
              {isLoading ? "⏳ BUYING..." : "BUY (0.01 ETH)"}
            </button>
          </div>
          {status && <p className="mt-2 text-center text-yellow-300 text-sm font-bold">{status}</p>}
      </div>
    </main>
  );
}