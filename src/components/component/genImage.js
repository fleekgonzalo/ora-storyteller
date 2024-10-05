import React, { useState, useEffect } from "react";
import { Web3 } from "web3";
import { ORAPlugin, Chain, Models } from "@ora-io/web3-plugin-ora";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function StoryImageGen({ prompt }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const [transactionHash, setTransactionHash] = useState(null);
  const [countdown, setCountdown] = useState(30);

  const web3 = new Web3(window.ethereum);

  // Register plugin
  web3.registerPlugin(new ORAPlugin(Chain.SEPOLIA));

  async function generateImage() {
    if (!prompt) {
      setError("Prompt cannot be empty!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const estimateFee = await web3.ora.estimateFee(Models.STABLE_DIFFUSION);
      console.log("Fee estimated:", estimateFee);

      // Connect MetaMask
      const accounts = await web3.eth.requestAccounts();
      console.log("Accounts connected:", accounts);

      // Send transaction
      const receipt = await web3.ora.calculateAIResult(
        accounts[0],
        Models.STABLE_DIFFUSION,
        prompt,
        estimateFee
      );
      console.log("Transaction hash:", receipt.transactionHash);
      setTransactionHash(receipt.transactionHash);
      setCountdown(30);
    } catch (error) {
      setError(`Error generating image: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function fetchResult() {
    if (!transactionHash) {
      setError("No image request found. Please generate an image first.");
      return;
    }

    setFetching(true);
    setError(null);

    // Add a 30-second delay
    setTimeout(async () => {
      try {
        const result = await web3.ora.getAIResult(Models.STABLE_DIFFUSION, prompt);
        console.log("Result:", result);
        const ipfsUrl = `https://ipfs.io/ipfs/${result}`;
        console.log("Generated IPFS URL:", ipfsUrl);
        setImageUrl(ipfsUrl);
      } catch (error) {
        setError(`Error fetching result: ${error.message}`);
      } finally {
        setFetching(false);
      }
    }, 30000);
  }

  useEffect(() => {
    if (fetching && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [fetching, countdown]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      {!imageUrl && (
        <>
          <Button
            onClick={generateImage}
            className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-medium shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate AI Image"}
          </Button>
          <Button
            onClick={fetchResult}
            className="px-6 py-2 rounded-md bg-secondary text-secondary-foreground font-medium shadow-sm hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
            disabled={fetching || loading || !transactionHash}
          >
            {fetching ? `Fetching (${countdown}s)` : "Fetch Result"}
          </Button>
        </>
      )}

      {error && <p className="text-red-500">{error}</p>}
      {imageUrl && (
        <div className="mt-4">
          <image src={imageUrl} alt="Generated AI" className="max-w-full h-auto rounded" />
        </div>
      )}
    </div>
  );
}
