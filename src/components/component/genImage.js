'use client'

import React, { useState } from "react";
import { Web3 } from "web3";
import { ORAPlugin, Chain, Models } from "@ora-io/web3-plugin-ora";

export default function StoryImageGen({ prompt }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false); 
  const [error, setError] = useState(null);
  const [transactionHash, setTransactionHash] = useState(null);

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

    setFetching(true); // Start loading for fetching
    setError(null);

    // Add a 30-second delay
    setTimeout(async () => {
      try {
        const result = await web3.ora.getAIResult(Models.STABLE_DIFFUSION, prompt);
        console.log("Result:", result); // Debugging line
        const ipfsUrl = `https://ipfs.io/ipfs/${result}`;
        console.log("Generated IPFS URL:", ipfsUrl); // Log the IPFS URL
        setImageUrl(ipfsUrl); // Set the generated image URL
      } catch (error) {
        setError(`Error fetching result: ${error.message}`);
      } finally {
        setFetching(false); // End loading for fetching
      }
    }, 30000); // 30-second delay
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
        onClick={generateImage}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate AI Image"}
      </button>
      <button
        className="bg-green-500 text-white px-4 py-2 rounded mt-2"
        onClick={fetchResult}
        disabled={fetching || loading || !transactionHash}
      >
        {fetching ? "Fetching (30s wait)..." : "Fetch Result"}
      </button>

      {error && <p className="text-red-500">{error}</p>}
      {fetching && <p>Loading... Please wait while we fetch the image.</p>}
      {imageUrl && (
        <div className="mt-4">
          <img src={imageUrl} alt="Generated AI" className="max-w-full h-auto rounded" />
        </div>
      )}
    </div>
  );
}