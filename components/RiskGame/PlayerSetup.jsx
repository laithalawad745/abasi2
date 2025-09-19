// components/RiskGame/PlayerSetup.jsx - بالتصميم الجديد
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
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 p-6 md:p-8 flex items-center justify-center min-h-screen">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          
          {/* العنوان */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-wider mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">
                الهيمنة
              </span>
            </h1>
            <p className="text-xl text-gray-300">لعبة الاستراتيجية والسيطرة على العالم</p>
          </div>
          
          <div className="mb-8">
            <label className="block text-white text-2xl font-bold mb-6">عدد اللاعبين</label>
            <select 
              value={playerCount} 
              onChange={(e) => setPlayerCount(Number(e.target.value))}
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl px-6 py-4 text-xl w-full focus:border-green-500/50 focus:outline-none transition-all duration-300"
            >
              {[2,3,4,5,6,7,8].map(num => (
                <option key={num} value={num} className="bg-[#1a1a2e] text-white">{num} لاعبين</option>
              ))}
            </select>
            
            {/* ===== دوائر الألوان ===== */}
            <div className="mt-8">
              <p className="text-gray-300 text-lg mb-4" > : كل لاعب يختار لون </p>
              <div className="flex justify-center items-center gap-3 flex-wrap">
                {playerColors.slice(0, playerCount).map((color, index) => (
                  <div
                    key={index}
                    className="relative group"
                  >
                    <div
                      className="w-12 h-12 rounded-full border-3 border-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
                      style={{ backgroundColor: color }}
                      title={`لاعب ${index + 1}`}
                    ></div>
                    <div 
                      className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ 
                        background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
                        transform: 'scale(2)'
                      }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => onSetupComplete(playerCount)}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-2xl transition-all duration-300 hover:scale-105 shadow-lg shadow-green-500/30"
          >
             ابدأ اللعبة
          </button>

          {/* معلومات إضافية */}
   
        </div>
      </div>
    </div>
  );
}