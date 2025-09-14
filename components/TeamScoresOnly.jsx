// components/TeamScoresOnly.jsx
import React from 'react';

export default function TeamScoresOnly({ 
  teams, 
  currentTurn
}) {
  return (
    <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
      {/* الفريق الأحمر */}
      <div className={`relative group transition-all duration-500 ${
        currentTurn === 'red' ? 'scale-105' : ''
      }`}>
        <div className={`p-8 bg-white/5 backdrop-blur-xl border rounded-3xl text-center transition-all duration-500 ${
          currentTurn === 'red'
            ? 'border-red-400/50 bg-gradient-to-br from-red-500/20 to-pink-500/20 shadow-2xl shadow-red-500/25'
            : 'border-white/10 hover:border-red-400/30 bg-white/3'
        }`}>
          {/* تأثير الإضاءة */}
          {currentTurn === 'red' && (
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/30 to-pink-500/30 rounded-3xl blur-xl -z-10 animate-pulse"></div>
          )}
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            
            <h2 className="text-xl md:text-2xl font-bold text-white mb-3">{teams[0].name}</h2>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <p className="text-4xl md:text-6xl font-black text-white mb-1">{teams[0].score}</p>
              <p className="text-gray-400 font-medium">نقطة</p>
            </div>
          </div>
          
          {/* مؤشر الدور */}
          {currentTurn === 'red' && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
      </div>

      {/* الفريق الأزرق */}
      <div className={`relative group transition-all duration-500 ${
        currentTurn === 'blue' ? 'scale-105' : ''
      }`}>
        <div className={`p-8 bg-white/5 backdrop-blur-xl border rounded-3xl text-center transition-all duration-500 ${
          currentTurn === 'blue'
            ? 'border-blue-400/50 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 shadow-2xl shadow-blue-500/25'
            : 'border-white/10 hover:border-blue-400/30 bg-white/3'
        }`}>
          {/* تأثير الإضاءة */}
          {currentTurn === 'blue' && (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-3xl blur-xl -z-10 animate-pulse"></div>
          )}
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            
            <h2 className="text-xl md:text-2xl font-bold text-white mb-3">{teams[1].name}</h2>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <p className="text-4xl md:text-6xl font-black text-white mb-1">{teams[1].score}</p>
              <p className="text-gray-400 font-medium">نقطة</p>
            </div>
          </div>
          
          {/* مؤشر الدور */}
          {currentTurn === 'blue' && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}