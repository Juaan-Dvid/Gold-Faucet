
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { abi } from "./assets/abis/GoldTokenAbi";
import { GOLD_CONTRACT_ADDRESS } from './assets/constants';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { config } from './main';
import { useState } from 'react';
import { toast } from 'react-toastify';


function App() {
  const { address, isConnected } = useAccount();
  const [isMinting, setIsMinting] = useState(false);
  const { data, isLoading, refetch } = useReadContract({
    abi,
    address: GOLD_CONTRACT_ADDRESS,
    functionName: "balanceOf",
    args: [address],
  })

  const {writeContractAsync} = useWriteContract()

  const handleMint = async () => {
    setIsMinting(true);

    try {
      const txHash =await writeContractAsync({
        abi,
        address: GOLD_CONTRACT_ADDRESS,
        functionName: "mint",
        args: [address, 1],
      })

      await waitForTransactionReceipt(config, {
        confirmations: 1,
        hash: txHash,
      })

      setIsMinting(false);
      toast.success('Tokens minted successfully!');
      refetch();

    } catch (error) {
      console.error(error);  
  
      if (error instanceof Error) {
        const errorMessage = "You must wait before minting again";
        if (error.message.includes(errorMessage)) {
          toast.error('You must wait for the next hour');
        } else {
          toast.error('Failed to mint Gold tokens');
        }
      } else {
        toast.error('An unknown error occurred');
      }  
      setIsMinting(false);
    }
  };

  return (
    <main className="w-full flex justify-center items-center min-h-svh flex-col">
      <h1 className="text-4xl font-bold text-yellow-600">Gold Faucet. Arbitrum Sepolia network. </h1>
      <h1 className="text-1xl text-yellow-600">Fast and reliable. 1 Gold per/hour. </h1>
      <div className='space-y-5 my-5 p-4 flex flex-col gap-5 rounded border border-gray-300 items-center'>
        <ConnectButton />
        { isConnected ? (
          <div className="flex flex-col items-center justify-center">
            <button className='px-3 py-1 font-semibold bg-slate-700 rounded-xl disabled:opacity-50' disabled={isMinting} onClick={handleMint}>
              {isMinting ? 'Sending...' : 'Send me Gold'}
            </button>
            <p className="text-xs"><span>Balance:</span> {isLoading ? (<span className='opacity-50'>Loading...</span>) : (data?.toString())} <span>Gold</span></p>
          </div>
        ) : (
          <div>Please connect your wallet to use this faucet</div>
        )}
        
      </div>
    </main>
  );
}

export default App
