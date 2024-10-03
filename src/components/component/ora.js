'use client'

import React, { useState, useEffect } from "react";
import { Web3 } from "web3";
import { ORAPlugin, Chain, Models } from "@ora-io/web3-plugin-ora";
import { Box, TextField, Button, Typography, Card, CardContent, Divider } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';

const STORY_MODEL = Models.LLAMA2;
const HARDCODED_PROMPT = "enchanted forest";

export default function StoryGen() {
  const [prompt, setPrompt] = useState("");     
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState(null);
  const [transactionHash, setTransactionHash] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [previousStories, setPreviousStories] = useState([]);

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

  useEffect(() => {
    const fetchHardcodedPromptStory = async () => {
      if (web3) {
        try {
          await fetchStory(HARDCODED_PROMPT, true);
        } catch (error) {
          console.error("Error fetching hardcoded prompt story:", error);
        }
      }
    };

    fetchHardcodedPromptStory();
  }, [web3]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && transactionHash) {
      fetchStory(prompt);
    }
  }, [countdown, transactionHash]);

  async function generateStory() {
    if (!prompt) {
      setError("Prompt cannot be empty!");
      return;
    }

    if (!web3) {
      setError("Web3 is not initialized.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const estimateFee = await web3.ora.estimateFee(STORY_MODEL);
      console.log("Fee estimated:", estimateFee);

      // Connect MetaMask
      const accounts = await web3.eth.requestAccounts();
      console.log("Accounts connected:", accounts);

      // Send transaction
      const receipt = await web3.ora.calculateAIResult(
        accounts[0],
        STORY_MODEL,
        prompt,
        estimateFee
      );
      console.log("Transaction hash:", receipt.transactionHash);
      setTransactionHash(receipt.transactionHash);

      // Start countdown
      setCountdown(30);

      // Save prompt to previous_prompt.json
      const newPrompt = { id: uuidv4(), prompt };
      await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPrompt),
      });

    } catch (error) {
      setError(`Error generating story: ${error.message}`);
      setLoading(false);
    }
  }

  async function fetchStory(prompt, isPrevious = false) {
    if (!web3) {
      setError("Web3 is not initialized.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch the generated story
      const result = await web3.ora.getAIResult(STORY_MODEL, prompt);
      if (result) {
        if (isPrevious) {
          setPreviousStories((prev) => [...prev, { prompt, story: result }]);
        } else {
          setStory(result);
        }
      }
    } catch (error) {
      setError(`Error fetching story: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh" gap={2}>
      <TextField
        variant="outlined"
        label="Enter a prompt to generate a story"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        fullWidth
        sx={{ maxWidth: 400 }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={generateStory}
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? "Generating..." : "Generate Story"}
      </Button>

      <Divider sx={{ width: '100%', mt: 4 }} />

      {previousStories.length > 0 && (
        <Box mt={4} width="100%" maxWidth="600px">
          <Typography variant="h6">Previous Prompts</Typography>
          {previousStories.map((item) => (
            <Card key={item.prompt} sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Previous Response: {item.prompt}</Typography>
                <Typography>{item.story}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {story && (
        <Box mt={4} p={2} border="1px solid #ccc" borderRadius="8px" width="100%" maxWidth="600px">
          <Typography variant="h6">Generated Story</Typography>
          <Typography>{story}</Typography>
        </Box>
      )}

      {error && <Typography color="error">{error}</Typography>}
    </Box>
  );
}