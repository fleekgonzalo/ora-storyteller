"use client";

import React, { useState, useEffect } from "react";
import { STORY_MODEL } from "./generateStory";
import Web3 from "web3";
import { ORAPlugin, Chain } from "@ora-io/web3-plugin-ora";

const History = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initializeWeb3 = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        web3Instance.registerPlugin(new ORAPlugin(Chain.SEPOLIA));
        setWeb3(web3Instance);
      }
    };

    initializeWeb3();
  }, []);

  const fetchResult = async (prompt) => {
    setLoading(true);
    try {
      const result = await web3.ora.getAIResult(STORY_MODEL, prompt);
      setSearchResult(result);
    } catch (error) {
      console.error("Error in fetchResult:", error);
      setError("Failed to fetch AI response. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!web3) {
      setError("Web3 is not initialized.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await fetchResult(searchQuery);
    } catch (error) {
      setError("Error fetching AI results: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-lg overflow-hidden mt-8 p-8">
      <h2 className="text-2xl font-bold mb-4">History</h2>
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search previous results"
          className="flex-1 px-4 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-medium shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {searchResult ? (
        <div className="mb-4">
          <p>{searchResult}</p>
        </div>
      ) : (
        <p>No stories found.</p>
      )}
    </div>
  );
};

export default History;