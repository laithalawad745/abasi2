// components/RiskGame/PlayerSetup.jsx
import React, { useState } from 'react';

export default function PlayerSetup({ onSetupComplete }) {
  const [playerCount, setPlayerCount] = useState(4);

  // ألوان اللاعبين (نفس الألوان من RiskGame)
  const playerColors = [
    '#ff4444', // أحمر - لاعب 0
    '#4444ff', // أزرق - لاعب 1  
    '#44ff44', // أخضر - لاعب 2
    '#ffff44', // أصفر - لاعب 3
    '#ff44ff', // بنفسجي - لاعب 4
    '#44ffff', // سماوي - لاعب 5
    '#ff8844', // برتقالي - لاعب 6
    '#8844ff'  // بنفسجي غامق - لاعب 7
  ];

  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <div className="bg-slate-800/90 backdrop-blur-lg rounded-3xl p-8 border border-slate-600 max-w-md w-full text-center">
        
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
          
          {/* ===== دوائر الألوان ===== */}
          <div className="mt-6">
            <p className="text-slate-300 text-sm mb-3"  >
              :  كل شخص يختار لون    </p>
            <div className="flex justify-center items-center gap-2 flex-wrap">
              {playerColors.slice(0, playerCount).map((color, index) => (
                <div
                  key={index}
                  className="w-8 h-8 rounded-full border-2 border-white/30 shadow-lg transition-all duration-300 hover:scale-110"
                  style={{ backgroundColor: color }}
                  title={`لاعب ${index + 1}`}
                ></div>
              ))}
            </div>
          </div>
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