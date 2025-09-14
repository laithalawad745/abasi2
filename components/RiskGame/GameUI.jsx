// components/RiskGame/GameUI.jsx - بالتصميم الجديد
import React from 'react';

export default function GameUI({ 
  players, 
  currentPlayer, 
  round, 
  countries, 
  onEndTurn, 
  onRestart, 
  getPlayerStats 
}) {
  
  const getGameStatusMessage = () => {
    if (currentPlayer) {
      return `دور ${currentPlayer.name}`;
    }
    return '';
  };

  return (
    <>
      {/* شريط علوي بالتصميم الجديد */}
      <div className="fixed top-0 left-0 right-0 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/20 p-4 z-40">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          {/* اللوجو والعنوان */}
          <div className="flex items-center gap-4">
            <div className="text-2xl md:text-3xl font-black text-white tracking-wider">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">
                الهيمنة
              </span>
            </div>
          </div>

          {/* مؤشر حالة اللعبة */}
          <div className="flex items-center gap-4">
            <div className="text-center hidden md:block">
              <div className="text-lg text-white font-semibold">
                {getGameStatusMessage()}
              </div>
            </div>
            
            <button
              onClick={onEndTurn}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg shadow-green-500/30"
            >
              إنهاء الدور
            </button>
            
            <button
              onClick={onRestart}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105"
            >
              🔄 إعادة تشغيل
            </button>
          </div>
        </div>
      </div>

      {/* 🆕 مؤشر دور اللاعب للشاشات الكبيرة فقط */}
      {currentPlayer && (
        <div className="hidden md:block fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div 
            className="bg-[#0a0a0f]/90 backdrop-blur-xl rounded-2xl px-8 py-4 shadow-2xl border-2"
            style={{ 
              borderColor: currentPlayer.color,
              boxShadow: `0 0 30px ${currentPlayer.color}40`
            }}
          >
            <div className="flex items-center gap-6">
              {/* دائرة ملونة للاعب */}
              <div 
                className="w-12 h-12 rounded-full border-3 border-white shadow-lg"
                style={{ backgroundColor: currentPlayer.color }}
              ></div>
              
              {/* معلومات اللاعب */}
              <div className="text-center">
                <div className="text-white font-bold text-xl">
                  دور: {currentPlayer.name}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 مؤشر دور اللاعب للهاتف فقط - مبسط */}
      {currentPlayer && (
        <div className="block md:hidden fixed top-20 left-2 right-2 z-50">
          <div 
            className="bg-[#0a0a0f]/90 backdrop-blur-xl rounded-xl px-4 py-3 shadow-xl border-2"
            style={{ 
              borderColor: currentPlayer.color,
              boxShadow: `0 0 20px ${currentPlayer.color}30`
            }}
          >
            <div className="flex items-center justify-center gap-4">
              {/* دائرة ملونة صغيرة */}
              <div 
                className="w-8 h-8 rounded-full border-2 border-white"
                style={{ backgroundColor: currentPlayer.color }}
              ></div>
              
              {/* اسم اللاعب */}
              <div className="text-white font-bold text-lg">
                دور: {currentPlayer.name}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* لوحة اللاعبين - ملتصقة بيمين الشاشة مع التصميم الجديد */}
      <div className="hidden md:block fixed top-32 right-0 bottom-16 w-80 bg-[#0a0a0f]/90 backdrop-blur-xl shadow-2xl z-30 overflow-y-auto border-l border-white/20 rounded-l-3xl">     
        <div className="p-6">
          <h3 className="text-white font-bold text-2xl mb-6 text-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-500">
               لوحة اللاعبين
            </span>
          </h3>
          
          <div className="space-y-4">
            {players.map((player, index) => {
              const stats = getPlayerStats(player);
              const isCurrentPlayer = currentPlayer && player.id === currentPlayer.id;
              const isEliminated = player.eliminated;
              
              return (
                <div
                  key={player.id}
                  className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                    isEliminated
                      ? 'border-red-500/50 bg-red-500/10 opacity-60'
                      : isCurrentPlayer
                      ? 'border-yellow-400/80 bg-white/10 shadow-lg animate-pulse'
                      : 'border-white/20 bg-white/5'
                  }`}
                  style={isCurrentPlayer ? {
                    boxShadow: `0 0 20px ${player.color}30`
                  } : {}}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white shadow-lg"
                        style={{ backgroundColor: player.color }}
                      ></div>
                      <span className={`font-bold text-lg ${isEliminated ? 'text-red-400' : 'text-white'}`}>
                        {player.name}
                        {isCurrentPlayer && !isEliminated && ' 👑'}
                        {isEliminated && ' ❌'}
                      </span>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${isEliminated ? 'text-red-300' : 'text-gray-300'}`}>
                        🏰 {stats.countries} دولة
                      </div>
                      <div className={`text-sm ${isEliminated ? 'text-red-300' : 'text-gray-300'}`}>
                        ⚔️ {stats.totalTroops} جندي
                      </div>
                    </div>
                  </div>
                  
                  {/* شريط تقدم الدول */}
                  <div className="mt-3">
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min((stats.countries / Object.keys(countries).length) * 100, 100)}%`,
                          backgroundColor: player.color
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 text-center">
                      {Math.round((stats.countries / Object.keys(countries).length) * 100)}% من العالم
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* معلومات إضافية */}
          <div className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <h4 className="text-white font-bold mb-3">📈 إحصائيات اللعبة</h4>
            <div className="text-gray-300 text-sm space-y-2">
              <p>🔄 الجولة: {round}</p>
              <p>🌍 إجمالي الدول: {Object.keys(countries).length}</p>
              <p>👥 اللاعبون النشطون: {players.filter(p => !p.eliminated).length}</p>
            </div>
          </div>

          {/* تعليمات سريعة */}
          <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4">
            <h4 className="text-blue-300 font-bold mb-2">💡 تعليمات سريعة</h4>
            <div className="text-blue-200 text-xs space-y-1">
              <p>• اضغط دولة فارغة = احتلال</p>
              <p>• اضغط دولتك = تقوية</p>
              <p>• اضغط دولة عدو = هجوم</p>
            </div>
          </div>
        </div>
      </div>

      {/* لوحة مبسطة للهاتف */}
      <div className="block md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0f]/90 backdrop-blur-xl border-t border-white/20 p-4 z-30">
        <div className="flex justify-between items-center">
          <div className="text-white text-sm">
            <span className="font-bold">الجولة {round}</span>
          </div>
          
          <div className="flex gap-2">
            {players.slice(0, 4).map((player) => {
              const stats = getPlayerStats(player);
              const isCurrentPlayer = currentPlayer && player.id === currentPlayer.id;
              
              return (
                <div
                  key={player.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
                    isCurrentPlayer ? 'bg-white/20' : 'bg-white/5'
                  }`}
                >
                  <div 
                    className="w-4 h-4 rounded-full border border-white"
                    style={{ backgroundColor: player.color }}
                  ></div>
                  <span className="text-white text-xs font-bold">
                    {stats.countries}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}