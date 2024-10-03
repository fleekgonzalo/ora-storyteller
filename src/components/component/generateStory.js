// 'use client'
// import React, { useState, useEffect } from "react";
// import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import { Web3 } from "web3";
// import { ORAPlugin, Chain, Models } from "@ora-io/web3-plugin-ora";

// // Define the AI model and prompt prefix
// const MODEL = Models.LLAMA2;

// export default function AIResponse(promptPrefix) {
//   // State variables to manage user input, AI response, loading state, waiting state, and countdown
//   const [message, setMessage] = useState("");
//   const [response, setResponse] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [waiting, setWaiting] = useState(false);
//   const [countdown, setCountdown] = useState(30);

//   // Initialize the Web3 provider (RPC endpoint or injected provider)
//   const [web3, setWeb3] = useState(null);

//   useEffect(() => {
//     if (typeof window !== "undefined" && window.ethereum) {
//       const web3Instance = new Web3(window.ethereum);
//       web3Instance.registerPlugin(new ORAPlugin(Chain.SEPOLIA));
//       setWeb3(web3Instance);
//     } else {
//       console.error("No Ethereum provider found. Install MetaMask.");
//     }
//   }, []);

//   // Register the ORA plugin with the specified chain
//   //web3.registerPlugin(new ORAPlugin(Chain.SEPOLIA));

//   // Function to handle sending the message to the ORA AI
//   const handleSend = async () => {
//     setLoading(true);
//     setResponse("Estimating fee and sending transaction...");
//     try {
//       // Estimate the fee for the AI model
//       const estimateFee = await web3.ora.estimateFee(MODEL);
//       console.log("fee", estimateFee);

//       // Connect to MetaMask and get the user's accounts
//       const accounts = await web3.eth.requestAccounts();
//       console.log("accounts connected:", accounts);

//       // Send the transaction with the full prompt (prefix + user message)
//       const fullPrompt = promptPrefix + message;
//       const receipt = await web3.ora.calculateAIResult(accounts[0], MODEL, fullPrompt, estimateFee);
//       console.log(receipt.transactionHash);

//       // Set the response and start the countdown
//       setResponse("Transaction sent. Please wait 30 seconds before fetching the result...");
//       setWaiting(true);
//       setLoading(false);
//       setCountdown(30);
//     } catch (error) {
//       console.error("Error in handleSend:", error);
//       setResponse("Failed to send transaction, ensure you are on SEPOLIA. Please try again.");
//       setLoading(false);
//     }
//   };

//   // Function to fetch the AI result
//   const fetchResult = async () => {
//     setLoading(true);
//     try {
//       // Fetch the AI result using the full prompt
//       const fullPrompt = promptPrefix + message;
//       const result = await web3.ora.getAIResult(MODEL, fullPrompt);
//       console.log(result);
//       setResponse(result);
//     } catch (error) {
//       console.error("Error in fetchResult:", error);
//       setResponse("Failed to fetch AI response. Please try again later.");
//     } finally {
//       setLoading(false);
//       setWaiting(false);
//     }
//   };

//   // Countdown effect
//   useEffect(() => {
//     if (waiting && countdown > 0) {
//       const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
//       return () => clearTimeout(timer);
//     }
//   }, [waiting, countdown]);

//   return (
//     <section className="col-span-1 lg:col-span-1">
//       <Card>
//         <CardHeader>
//           <CardTitle>Explain Code with ORA AI</CardTitle>
//           <CardDescription>Ask Ora Ai any question about the code and get a response</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             <div className="prose">
//               <p>{response || "The AI has not responded yet. Please enter a message and click 'Send' to get a response."}</p>
//             </div>
//             <div className="flex gap-2">
//               <Textarea
//                 placeholder="Enter your message"
//                 rows={3}
//                 value={message}
//                 onChange={(e) => setMessage(e.target.value)}
//               />
//               <Button onClick={handleSend} disabled={loading || waiting}>
//                 {loading ? "Processing..." : "Send"}
//               </Button>
//               <Button onClick={fetchResult} disabled={loading || countdown > 0}>
//                 {waiting ? `Fetch Result (${countdown}s)` : "Fetch Result"}
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </section>
//   );
// }