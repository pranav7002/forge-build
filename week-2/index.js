import { abi, contractAddress } from "./constants.js"
import { createWalletClient, createPublicClient, http, custom, parseEther, formatEther } from 'https://esm.sh/viem'
import { sepolia } from 'https://esm.sh/viem/chains'

const connectButton = document.getElementById("connect-button")
const depositButton = document.getElementById("deposit-button")
const withdrawButton = document.getElementById("withdraw-button")
const ethInputDeposit = document.getElementById("eth-amount-deposit")
const ethInputWithdraw = document.getElementById("eth-amount-withdraw")
const balanceDisplay = document.getElementById("balance")

let address
let walletClient
let balance

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http("https://eth-sepolia.g.alchemy.com/v2/dVbnDaox5HeNEFqMXegjG"),
})

async function connectWallet() {
  walletClient = createWalletClient({
    chain: sepolia,
    transport: custom(window.ethereum),
  })

  const addresses = await walletClient.requestAddresses()
  address = addresses[0]
  connectButton.innerHTML = `Connected: ${address}`
}

async function deposit() {
  const { request } = await publicClient.simulateContract({
    address: contractAddress,
    abi,
    functionName: 'deposit',
    value: parseEther(ethInputDeposit.value),
    account: address
  })

  const hash = await walletClient.writeContract(request)
  console.log(`The transaction hash is: ${hash}`)

  await publicClient.waitForTransactionReceipt({ hash })
  await updateHistory()
}

async function withdraw(_withdrawAmount) {
  const { request } = await publicClient.simulateContract({
    address: contractAddress,
    abi,
    functionName: 'withdraw',
    args: [parseEther(_withdrawAmount)],
    account: address
  })

  const hash = await walletClient.writeContract(request)
  console.log(`The transaction hash is: ${hash}`)

  await publicClient.waitForTransactionReceipt({ hash })
  await updateHistory() 
}

async function getBalance() {
  const balance = await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: 'getBalance',
    account: address
  })

  return balance
}

async function updateBalance() {
  balance = (Number(await getBalance()) / 1e18)
  balanceDisplay.innerText = `${balance} ETH`
}

connectButton.onclick = async () => {
  if (!window.ethereum) {
    alert(`Add MetaMask to browser!`)
    return
  }
  await connectWallet()
  await updateBalance()
  await updateHistory()
}


depositButton.onclick = async () => {
  if (!address) {
    alert(`Connect MetaMask before depositing`)
    return
  }
  balanceDisplay.innerText = `Updating... `
  await deposit()
  await updateBalance()
}

withdrawButton.onclick = async () => {
  if (!address) {
    alert(`Connect MetaMask before withdrawing`)
    return
  }
  balanceDisplay.innerText = `Updating... `
  await withdraw(ethInputWithdraw.value)
  await updateBalance()
}

async function updateHistory() {
  const history = await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: "getTransactionHistory"
  });

  const container = document.getElementById("history");
  container.innerHTML = "";

  for (let i = history.length - 1; i >= 0; i--) {
    const tx = history[i];
    const div = document.createElement("div");
    div.className = "history-item";
    const type = tx.transactionType === 0 ? "WITHDRAW" : "DEPOSIT";
    div.innerText = `Type: ${type} \n Amount: ${formatEther(tx.transactionAmount)} ETH \n Account: ${tx.account}`;
    container.appendChild(div);
  }
}

updateHistory();


