"use client";
import React, { useState, useEffect } from 'react';
import Image from next/image;
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Web3 } from "web3";
import { ORAPlugin, Chain, Models } from "@ora-io/web3-plugin-ora";
import History from './History';

const MODEL = Models.LLAMA2;

const SearchStory = () => {
  const [prompt, setPrompt] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [stories, setStories] = useState([]);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [web3, setWeb3] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      web3Instance.registerPlugin(new ORAPlugin(Chain.SEPOLIA));
      setWeb3(web3Instance);
    } else {
      console.error("No Ethereum provider found. Install MetaMask.");
    }
  }, []);

  const handleGenerate = async () => {
    const fullPrompt = `Write a story about ${prompt}`;
    setCurrentPrompt(fullPrompt);
    setLoading(true);
    setResponse("Estimating fee and sending transaction...");
    try {
      const estimateFee = await web3.ora.estimateFee(MODEL);
      const accounts = await web3.eth.requestAccounts();
      const receipt = await web3.ora.calculateAIResult(accounts[0], MODEL, fullPrompt, estimateFee);
      console.log(receipt.transactionHash);
      setResponse("Transaction sent. Please wait 30 seconds before fetching the result...");
      setWaiting(true);
      setLoading(false);
      setCountdown(30);
    } catch (error) {
      console.error("Error in handleSend:", error);
      setResponse("Failed to send transaction, ensure you are on SEPOLIA. Please try again.");
      setLoading(false);
    }
  };

  const fetchResult = async () => {
    setLoading(true);
    try {
      // var prompt = "a goat and a cow"
      const result = await web3.ora.getAIResult(MODEL, currentPrompt);
      setResponse(result);
      setStories([result, ...stories]);
    } catch (error) {
      console.error("Error in fetchResult:", error);
      setResponse("Failed to fetch AI response. Please try again later.");
    } finally {
      setLoading(false);
      setWaiting(false);
    }
  };

  useEffect(() => {
    if (waiting && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setWaiting(false);
    }
  }, [waiting, countdown]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-background">
      <h1 className="text-6xl font-bold mb-8 text-white text-shadow-lg">ORA-Storyteller</h1>
      <div className="max-w-4xl w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-card rounded-2xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-8 flex flex-col justify-center">
              <p className="text-muted-foreground mb-8">
                Input a prompt or topic and let our on-chain AI generate a unique story and image for you.
              </p>
              <div className="flex gap-4">
                <Input
                  placeholder="Write a story about..."
                  className="flex-1 px-4 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <Button
                  onClick={handleGenerate}
                  className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-medium shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  disabled={loading}
                >
                  {loading ? "Generating..." : "Generate"}
                </Button>
              </div>
              <div className="flex justify-center mt-4">
                <Button
                  onClick={fetchResult}
                  className="px-6 py-2 rounded-md bg-secondary text-secondary-foreground font-medium shadow-sm hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
                  disabled={loading || waiting}
                >
                  {waiting ? `Fetch Result (${countdown}s)` : "Fetch Result"}
                </Button>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/enchanted-forest.jpg"
                width={600}
                height={600}
                alt="Generated Image"
                className="w-full h-full object-cover"
                style={{ aspectRatio: "600/600", objectFit: "cover" }}
              />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-card/80 to-transparent" />
              <div className="absolute bottom-0 left-0 w-full p-6 text-card-foreground">
                <p className="text-lg font-bold mb-2">The Enchanted Forest</p>
                <p>
                  In a land where the trees whispered secrets and the streams danced with fairies, a young adventurer
                  embarked on a journey through the Enchanted Forest...
                </p>
              </div>
            </div>
          </div>
        </div>
        {currentPrompt && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Generated Story</h2>
            <div className="bg-card rounded-2xl shadow-lg p-6">
              <p>{response}</p>
            </div>
          </div>
        )}
        <History stories={stories} />
      </div>
    </div>
  );
};

export default SearchStory;