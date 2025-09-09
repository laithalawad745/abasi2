// components/RiskGame/GameUI.jsx
import React from 'react';

export default function GameUI({ currentPlayer, players, countries }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-b border-slate-600 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* اللاعب الحالي */}
        <div className="flex items-center gap-4">
          <div 
            className="w-8 h-8 rounded-full border-2 border-white"
            style={{ backgroundColor: currentPlayer?.color }}
          ></div>
          <span className="text-white font-bold text-xl">{currentPlayer?.name}</span>
          <span className="text-gray-300">دورك الآن</span>
        </div>

        {/* إحصائيات اللاعبين */}
        <div className="flex gap-4">
          {players.map(player => (
            <div 
              key={player.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                player.id === currentPlayer?.id ? 'bg-yellow-500/20 border border-yellow-500' : 'bg-slate-700'
              }`}
            >
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: player.color }}
              ></div>
              <span className="text-white text-sm">{player.countries.length}</span>
              <span className="text-gray-300 text-sm">🏴</span>
              <span className="text-white text-sm">{player.totalTroops}</span>
              <span className="text-gray-300 text-sm">⚔️</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}