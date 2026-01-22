'use client'

import { useAccount, useConnect, useDisconnect, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { useState, useEffect } from 'react'
import { parseEther, parseUnits, formatEther, formatUnits } from 'viem'
import { USDC_POOL_ADDRESS, USDC_TOKEN_ADDRESS } from '@/constants'
import USDCPoolABI from '@/abis/USDCPool.json'
import USDCTokenABI from '@/abis/USDCToken.json'

export default function Home() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: ethBalance } = useBalance({ address })

  const [usdcBalance, setUsdcBalance] = useState<string>('0')
  const [poolEth, setPoolEth] = useState<string>('0')
  const [poolUsdc, setPoolUsdc] = useState<string>('0')

  const [swapAmount, setSwapAmount] = useState('')
  const [isEthToUsdc, setIsEthToUsdc] = useState(true)

  const [liqAmount, setLiqAmount] = useState('')

  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  const { data: usdcBalData } = useReadContract({
    address: USDC_TOKEN_ADDRESS as `0x${string}`,
    abi: USDCTokenABI,
    functionName: 'balanceOf',
    args: [address],
  })

  const { data: poolUsdcData } = useReadContract({
    address: USDC_TOKEN_ADDRESS as `0x${string}`,
    abi: USDCTokenABI,
    functionName: 'balanceOf',
    args: [USDC_POOL_ADDRESS],
  })

  const { data: poolEthData } = useBalance({ address: USDC_POOL_ADDRESS as `0x${string}` })

  useEffect(() => {
    if (usdcBalData) setUsdcBalance(formatUnits(usdcBalData as bigint, 18))
    if (poolUsdcData) setPoolUsdc(formatUnits(poolUsdcData as bigint, 18))
    if (poolEthData) setPoolEth(formatEther(poolEthData.value))
  }, [usdcBalData, poolUsdcData, poolEthData])

  const handleConnect = () => connect({ connector: injected() })

  const handleSwap = async () => {
    if (!swapAmount) return

    if (isEthToUsdc) {
      writeContract({
        address: USDC_POOL_ADDRESS as `0x${string}`,
        abi: USDCPoolABI,
        functionName: 'swapEthToUsdc',
        args: [0n],
        value: parseEther(swapAmount),
      })
    } else {
      writeContract({
        address: USDC_POOL_ADDRESS as `0x${string}`,
        abi: USDCPoolABI,
        functionName: 'swapUsdcToEth',
        args: [parseUnits(swapAmount, 18), 0n],
      })
    }
  }

  const handleApprove = () => {
    if (!swapAmount) return
    writeContract({
      address: USDC_TOKEN_ADDRESS as `0x${string}`,
      abi: USDCTokenABI,
      functionName: 'approve',
      args: [USDC_POOL_ADDRESS, parseUnits(swapAmount, 18)],
    })
  }

  const handleAddLiquidity = () => {
    if (!liqAmount) return
    writeContract({
      address: USDC_POOL_ADDRESS as `0x${string}`,
      abi: USDCPoolABI,
      functionName: 'addLiquidity',
      args: [parseUnits(liqAmount, 18)],
      value: parseEther(liqAmount),
    })
  }

  return (
    <div className="max-w-3xl mx-auto p-6 text-black">
      <header className="flex justify-between items-center mb-12 border-b-2 border-black pb-4">
        <h1 className="text-4xl font-bold uppercase tracking-tighter">AMM</h1>
        <div>
          {isConnected ? (
            <div className="flex gap-4 items-center">
              <span className="text-sm font-medium">
                ETH: {ethBalance ? formatEther(ethBalance.value) : '0'} | USDC: {Number(usdcBalance).toFixed(2)}
              </span>
              <button
                onClick={() => disconnect()}
                className="border-2 border-black hover:bg-black hover:text-white px-4 py-2 font-bold transition-all"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              className="border-2 border-black hover:bg-black hover:text-white px-4 py-2 font-bold transition-all"
            >
              Connect
            </button>
          )}
        </div>
      </header>

      <main className="space-y-12">
        <section className="border-2 border-black p-6">
          <h2 className="text-xl font-bold mb-6 uppercase border-b-2 border-black inline-block">Pool Stats</h2>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-sm uppercase tracking-wide mb-1 opacity-70">ETH Reserve</p>
              <p className="text-3xl font-bold">{Number(poolEth).toFixed(4)}</p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-wide mb-1 opacity-70">USDC Reserve</p>
              <p className="text-3xl font-bold">{Number(poolUsdc).toFixed(2)}</p>
            </div>
          </div>
        </section>

        <section className="border-2 border-black p-6">
          <div className="flex justify-between items-baseline mb-6">
            <h2 className="text-xl font-bold uppercase border-b-2 border-black inline-block">Swap</h2>
            <button
              onClick={() => setIsEthToUsdc(!isEthToUsdc)}
              className="text-sm font-bold hover:underline uppercase decoration-2 underline-offset-4"
            >
              Switch Direction
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold uppercase mb-2">
                Pay ({isEthToUsdc ? 'ETH' : 'USDC'})
              </label>
              <input
                type="number"
                value={swapAmount}
                onChange={(e) => setSwapAmount(e.target.value)}
                className="w-full border-2 border-black p-3 text-lg font-bold focus:outline-none focus:bg-gray-50"
                placeholder="0.0"
              />
            </div>

            <div className="flex gap-4">
              {!isEthToUsdc && (
                <button
                  onClick={handleApprove}
                  disabled={isWritePending || !swapAmount}
                  className="flex-1 border-2 border-black py-4 font-bold uppercase hover:bg-black hover:text-white transition-all disabled:opacity-50"
                >
                  Approve USDC
                </button>
              )}
              <button
                onClick={handleSwap}
                disabled={!isConnected || isWritePending || !swapAmount}
                className="flex-1 border-2 border-black py-4 font-bold uppercase hover:bg-black hover:text-white transition-all disabled:opacity-50"
              >
                {isWritePending ? 'Pending...' : 'Swap'}
              </button>
            </div>
          </div>
        </section>

        <section className="border-2 border-black p-6">
          <h2 className="text-xl font-bold mb-6 uppercase border-b-2 border-black inline-block">Add Liquidity</h2>
          <div className="flex gap-4">
            <input
              type="number"
              value={liqAmount}
              onChange={(e) => setLiqAmount(e.target.value)}
              className="flex-1 border-2 border-black p-3 text-lg font-bold focus:outline-none focus:bg-gray-50"
              placeholder="Amount"
            />
            <button
              onClick={handleApprove}
              className="border-2 border-black px-6 font-bold uppercase hover:bg-black hover:text-white transition-all"
            >
              Approve
            </button>
            <button
              onClick={handleAddLiquidity}
              className="border-2 border-black px-8 font-bold uppercase hover:bg-black hover:text-white transition-all"
            >
              Add
            </button>
          </div>
        </section>

        {hash && (
          <div className="border-2 border-black p-4 break-all">
            <p className="font-bold mb-2">Transaction Hash:</p>
            <p className="font-mono text-sm">{hash}</p>
            {isConfirming && <div className="mt-2 font-bold animate-pulse">Confirming...</div>}
            {isConfirmed && <div className="mt-2 font-bold decoration-2 underline">Confirmed!</div>}
          </div>
        )}
      </main>
    </div>
  )
}
