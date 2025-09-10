// components/RiskGame/PlayerSetup.jsx
import React, { useState } from 'react';

export default function PlayerSetup({ onSetupComplete }) {
  const [playerCount, setPlayerCount] = useState(4);

  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <div className="bg-slate-800/90 backdrop-blur-lg rounded-3xl p-8 border border-slate-600 max-w-md w-full text-center">
        {/* <h1 className="text-4xl font-bold text-white mb-8"> الهيمنة </h1> */}
        
        <div className="mb-8">
          <label className="block text-white text-xl mb-4">عدد اللاعبين</label>
          <select 
            value={playerCount} 
            onChange={(e) => setPlayerCount(Number(e.target.value))}
            className="bg-slate-700 text-white rounded-lg px-4 py-3 text-xl w-full border border-slate-500"
          >
            {[2,3,4,5,6,7,8].map(num => (
              <option key={num} value={num}>{num} لاعبين</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => onSetupComplete(playerCount)}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-xl w-full transition-all duration-300 shadow-lg"
        >
          ابدأ اللعبة
        </button>
      </div>
    </div>
  );
}