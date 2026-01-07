import { abi, contractAddress } from "./constants.js"
import { createWalletClient, createPublicClient, http, custom } from 'https://esm.sh/viem'
import { sepolia } from 'https://esm.sh/viem/chains'

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http("https://eth-sepolia.g.alchemy.com/v2/dVbnDaox5HeNEFqMXegjG")
})

let account
let walletClient
let transactionHash

const connectButton = document.getElementById("connect-button")
const setButton = document.getElementById("set-button")
const getButton = document.getElementById("get-button")
const enterNumber = document.getElementById("number")

async function connectWallet() {
  walletClient = createWalletClient({
    chain: sepolia,
    transport: custom(window.ethereum),
  })

  const addresses = await walletClient.requestAddresses()
  account = addresses[0]
  connectButton.innerHTML =  `Connected: ${account}`
}

async function set(_number) {

  const { request } = await publicClient.simulateContract({
    address: contractAddress,
    abi,
    functionName: "set",
    args: [_number],
    account,
  })

  const hash = await walletClient.writeContract(request)
  return hash;
}

async function getNumber() {
  const number = await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: "getNumber",
  })

  return number
}

connectButton.onclick = connectWallet

setButton.onclick = async () => {
  if (!account) {
    alert("Please connect your wallet")
    return
  }

  const value = BigInt(enterNumber.value)
  transactionHash = await set(value)

  console.log(`The transaction hash is ${transactionHash}`);
  
}

getButton.onclick = async () => {
  const number = await getNumber()
  alert(`Stored number: ${number.toString()}`)
}


