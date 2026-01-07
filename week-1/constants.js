export const contractAddress = "0xE4d81B02e63E02871D6ef211786bD7A11130A2b3"

export const abi = [
  {
    "type": "function",
    "name": "getNumber",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "set",
    "inputs": [
      { "name": "_number", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
]
