'use client';

import { TOKENS, TokenAddress } from '../types';

interface TokenSelectorProps {
  selectedToken: TokenAddress;
  onTokenChange: (token: TokenAddress) => void;
}

export default function TokenSelector({ selectedToken, onTokenChange }: TokenSelectorProps) {
  return (
    <div className="mb-8">
      <label htmlFor="token-select" className="block text-sm font-medium text-gray-400 mb-3">
        Select Token
      </label>
      <select
        id="token-select"
        value={selectedToken}
        onChange={(e) => onTokenChange(e.target.value as TokenAddress)}
        className="block w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:bg-gray-700 transition-colors duration-200 text-lg font-medium"
      >
        {TOKENS.map((token) => (
          <option key={token} value={token} className="bg-gray-800 text-white">
            {token.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}