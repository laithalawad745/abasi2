// components/RiskGame/SpinWheel.jsx
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
    <div className="flex items-center justify-center min-h-screen p-8">
      <div className="bg-slate-800/90 backdrop-blur-lg rounded-3xl p-8 border border-slate-600 max-w-lg w-full text-center">
        <h2 className="text-3xl font-bold text-white mb-8">تحديد ترتيب اللعب</h2>
        
        {!result ? (
          <>
            {/* عجلة الحظ */}
            <div className={`relative w-64 h-64 mx-auto mb-8 ${spinning ? 'animate-spin' : ''}`}>
              <div className="w-full h-full rounded-full border-8 border-yellow-400 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <div className="text-white text-6xl"></div>
              </div>
            </div>
            
            <button
              onClick={spin}
              disabled={spinning}
              className={`px-8 py-4 rounded-xl font-bold text-xl w-full transition-all duration-300 ${
                spinning 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg'
              }`}
            >
              {spinning ? 'جاري الدوران...' : 'أدر العجلة'}
            </button>
          </>
        ) : (
          <>
            <h3 className="text-2xl text-white mb-6">ترتيب اللعب:</h3>
            <div className="space-y-3 mb-8">
              {result.map((player, index) => (
                <div 
                  key={player.id}
                  className="flex items-center justify-between bg-slate-700 rounded-lg p-4"
                >
                  <span className="text-white font-bold">#{index + 1}</span>
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white"
                    style={{ backgroundColor: player.color }}
                  ></div>
                  <span className="text-white">{player.name}</span>
                </div>
              ))}
            </div>
            
            <button
              onClick={confirmOrder}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-xl w-full transition-all duration-300 shadow-lg"
            >
              تأكيد الترتيب
            </button>
          </>
        )}
      </div>
    </div>
  );
}