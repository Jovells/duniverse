"use client";  // Add this line to indicate that the component is a Client Component

import { useState } from 'react';
import { Web3 } from "web3";
import { Models, ORAPlugin, Chain } from "@ora-io/web3-plugin-ora";

// Initialize Web3.js with Sepolia Testnet
const web3 = new Web3("https://1rpc.io/sepolia");
web3.registerPlugin(new ORAPlugin(Chain.SEPOLIA));

// Add private key to initialize a wallet (ensure this key is securely managed)
const wallet = web3.eth.accounts.wallet.add("0xbaeb072fb008216be99bd682e2778cb212f65507f88d5484b917dfbc61900d19");

export default function GenerateImage() {
  const [prompt, setPrompt] = useState('');
  const [imageResult, setImageResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const estimatedFee = await web3.ora.estimateFee(Models.STABLE_DIFFUSION);

      const tx = await web3.ora.calculateAIResult(wallet[0].address, Models.STABLE_DIFFUSION, prompt, estimatedFee);

      console.log("Oracle is generating result...");

      // Wait for 30 seconds to ensure the oracle returns the result
      await new Promise((resolve) => setTimeout(resolve, 30000));

      const result = await web3.ora.getAIResult(Models.STABLE_DIFFUSION, prompt);
      setImageResult(result);
    } catch (err) {
      console.error('Error generating image:', err);
      setError('Failed to generate image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Generate Image</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt"
          required
          style={{ padding: '0.5rem', width: '300px', marginRight: '10px' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '0.5rem' }}>
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {imageResult && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Generated Image:</h2>
          <img
            src={`https://ipfs.io/ipfs/${imageResult}`}
            alt="Generated"
            style={{ maxWidth: '30%', height: 'auto' }}
          />
        </div>
      )}
    </div>
  );
}