// components/RiskGame/SpinWheel.jsx - بالتصميم الجديد
import React, { useState } from 'react';

export default function SpinWheel({ players, onSpinComplete }) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);

  const spin = () => {
    setSpinning(true);
    // محاكاة دوران العجلة
    setTimeout(() => {
      const randomOrder = [...players].sort(() => Math.random() - 0.5);
      setResult(randomOrder);
      setSpinning(false);
    }, 3000);
  };

  const confirmOrder = () => {
    onSpinComplete(result);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 p-6 md:p-8 flex items-center justify-center min-h-screen">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl">
          
          {/* <h2 className="text-4xl font-bold text-white mb-8">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
               تحديد ترتيب اللعب
            </span>
          </h2> */}
          
          {!result ? (
            <>
              {/* عجلة الحظ */}
              <div className={`relative w-64 h-64 mx-auto mb-8 transition-all duration-1000 ${spinning ? 'animate-spin' : ''}`}>
                <div className="w-full h-full rounded-full border-8 border-yellow-400 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center shadow-2xl shadow-yellow-500/30">
                  <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                    <span className="text-white text-4xl">🎲</span>
                  </div>
                </div>
                {/* مؤشر العجلة */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <div className="w-6 h-6 bg-yellow-400 rounded-full border-2 border-white shadow-lg"></div>
                </div>
              </div>
              
              <button
                onClick={spin}
                disabled={spinning}
                className={`px-8 py-4 rounded-2xl font-bold text-xl w-full transition-all duration-300 shadow-lg ${
                  spinning 
                    ? 'bg-white/10 text-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white hover:scale-105 shadow-purple-500/30'
                }`}
              >
                {spinning ? '🌀 جاري الدوران...' : ' أدر العجلة'}
              </button>
            </>
          ) : (
            <>
              <h3 className="text-3xl text-white mb-8 font-bold">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">
                تم الترتيب عشوائي
                </span>
              </h3>
               {/*
              <div className="space-y-4 mb-8">
                {result.map((player, index) => (
                  <div 
                    key={player.id}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-center justify-between">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-xl font-bold text-lg">
                        #{index + 1}
                      </div>
                      
                      <div 
                        className="w-8 h-8 rounded-full border-3 border-white shadow-lg"
                        style={{ backgroundColor: player.color }}
                      ></div>
                      
                      <span className="text-white font-bold text-lg">{player.name}</span>
                    </div>
                  </div>
                ))}
              </div> */}
              
              <button
                onClick={confirmOrder}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-green-500/30"
              >
                ابدأ اللعبة
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}