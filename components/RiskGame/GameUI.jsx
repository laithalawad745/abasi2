// components/RiskGame/GameUI.jsx
import React from 'react';
import Link from 'next/link';

export default function GameUI({ 
  currentPlayer, 
  players, 
  countries, 
  gamePhase,
  round,
  onEndTurn, 
  onRestart 
}) {
  // حساب إحصائيات اللاعبين
  const getPlayerStats = (player) => {
    const playerCountries = Object.values(countries).filter(c => c.owner === player.id);
    const totalTroops = playerCountries.reduce((sum, c) => sum + c.troops, 0);
    
    return {
      countries: playerCountries.length,
      troops: totalTroops
    };
  };

  // حساب إجمالي الدول المحتلة
  const getTotalOccupiedCountries = () => {
    return Object.values(countries).filter(c => c.owner !== null).length;
  };

  const getTotalCountries = () => {
    return Object.keys(countries).length;
  };

  // حساب نسبة التقدم في اللعبة
  const getGameProgress = () => {
    const totalCountries = getTotalCountries();
    const occupiedCountries = getTotalOccupiedCountries();
    return totalCountries > 0 ? (occupiedCountries / totalCountries) * 100 : 0;
  };

  // الحصول على اللاعبين النشطين فقط
  const getActivePlayers = () => {
    return players.filter(p => !p.eliminated);
  };

  // الحصول على رسالة حالة اللعبة
  const getGameStatusMessage = () => {
    if (gamePhase === 'playing') {
      const progress = getGameProgress();
      if (progress < 100) {
        return `مرحلة الاحتلال الأولي - ${Math.round(progress)}% من الدول محتلة`;
      } else {
        return 'جميع الدول محتلة - جاري الانتقال لمرحلة الإقصاء';
      }
    } else if (gamePhase === 'elimination') {
      return 'مرحلة الإقصاء - المعركة من أجل البقاء!';
    }
    return 'جاري اللعب...';
  };

  return (
    <>
      {/* شريط علوي */}
      <div className="fixed top-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-b border-slate-700 p-4 z-40">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          {/* اللوجو والعنوان */}
          <div className="flex items-center gap-4">

            <div className="hidden md:block text-lg font-bold text-white">
              الهيمنة 
            </div>
          </div>

          {/* مؤشر حالة اللعبة */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-300">
                {getGameStatusMessage()}
              </div>
              <div className="text-xs text-gray-400">
                الجولة {round}
              </div>
            </div>
            
            <button
              onClick={onEndTurn}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-lg shadow-green-500/25"
            >
              إنهاء الدور
            </button>
            
            <button
              onClick={onRestart}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold transition-all"
            >
              🔄 إعادة تشغيل
            </button>
          </div>
        </div>
      </div>

      {/* لوحة اللاعبين */}
<div className="hidden md:block fixed top-20 right-4 w-80 bg-slate-800/90 backdrop-blur-lg rounded-lg p-4 shadow-2xl z-30 max-h-96 overflow-y-auto">     
     
     
        <h3 className="text-white font-bold text-lg mb-3 text-center">👑 لوحة اللاعبين</h3>
        
        <div className="space-y-3">
          {players.map((player, index) => {
            const stats = getPlayerStats(player);
            const isCurrentPlayer = currentPlayer && player.id === currentPlayer.id;
            const isEliminated = player.eliminated;
            
            return (
              <div
                key={player.id}
                className={`p-3 rounded-lg border-2 transition-all ${
                  isEliminated
                    ? 'border-red-500 bg-red-900/30 opacity-60'
                    : isCurrentPlayer
                    ? 'border-yellow-400 bg-slate-700/80 shadow-lg shadow-yellow-400/25'
                    : 'border-slate-600 bg-slate-700/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white"
                      style={{ backgroundColor: player.color }}
                    ></div>
                    <span className={`font-bold ${isEliminated ? 'text-red-400' : 'text-white'}`}>
                      {player.name}
                      {isCurrentPlayer && !isEliminated && ' 👑'}
                      {isEliminated && ' ❌'}
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-sm ${isEliminated ? 'text-red-300' : 'text-gray-300'}`}>
                      🏰 {stats.countries} دولة
                    </div>
                    <div className={`text-sm ${isEliminated ? 'text-red-300' : 'text-gray-300'}`}>
                      ⚔️ {stats.troops} جندي
                    </div>
                  </div>
                </div>
                
                {/* شريط التقدم */}
                {!isEliminated && (
                  <div className="mt-2 w-full bg-slate-600 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        backgroundColor: player.color,
                        width: `${Math.max(5, (stats.countries / getTotalCountries()) * 100)}%`
                      }}
                    ></div>
                  </div>
                )}
                
                {/* مؤشر الإقصاء */}
                {isEliminated && (
                  <div className="mt-2 text-xs text-red-400 font-bold text-center">
                    مُقصى من اللعبة
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* إحصائيات عامة */}
        <div className="mt-4 pt-3 border-t border-slate-600">
          <div className="text-sm text-gray-300 space-y-1">
            <div>🌍 الدول المحتلة: {getTotalOccupiedCountries()}/{getTotalCountries()}</div>
            <div>👥 اللاعبون النشطون: {getActivePlayers().length}/{players.length}</div>
            <div>🎯 الدور: {currentPlayer ? currentPlayer.name : 'غير محدد'}</div>
            <div className="w-full bg-slate-600 rounded-full h-2 mt-2">
              <div 
                className="h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
                style={{ width: `${getGameProgress()}%` }}
              ></div>
            </div>
            <div className="text-xs text-center text-gray-400">
              تقدم اللعبة: {Math.round(getGameProgress())}%
            </div>
          </div>
        </div>
      </div>

      {/* لوحة التعليمات */}
      {/* <div className="fixed bottom-4 right-4 w-80 bg-slate-800/90 backdrop-blur-lg rounded-lg p-4 shadow-2xl z-30">
        <h4 className="text-white font-bold text-sm mb-2">💡 تعليمات اللعب:</h4>
        <div className="text-xs text-gray-300 space-y-1">
          {gamePhase === 'playing' && getGameProgress() < 100 ? (
            <>
              <div className="text-blue-400 font-bold">مرحلة الاحتلال الأولي:</div>
              <div>• اضغط على دولة فارغة (رمادية) لاحتلالها</div>
              <div>• سؤال سهل = 5 جنود، متوسط = 10، صعب = 20</div>
              <div>• يمكن تقوية دولك أو مهاجمة الدول المجاورة</div>
            </>
          ) : gamePhase === 'elimination' ? (
            <>
              <div className="text-red-400 font-bold">مرحلة الإقصاء:</div>
              <div>• هاجم الدول المجاورة لتوسيع إمبراطوريتك</div>
              <div>• النجاح = احتلال + 15 جندي</div>
              <div>• الفشل = خسارة نصف الجيش</div>
              <div>• التقوية: نجاح = جنود، فشل = -25%</div>
            </>
          ) : (
            <>
              <div>• اضغط على أي دولة للتفاعل معها</div>
              <div>• أجب على الأسئلة لكسب الجنود</div>
              <div>• احتل العالم للفوز!</div>
            </>
          )}
        </div>
      </div> */}

      {/* شريط التقدم السفلي */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-700 p-2 z-30">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-4">
            <div className="text-gray-300">
              🌍 <span className="text-white font-bold">{getTotalOccupiedCountries()}</span>/{getTotalCountries()} دولة
            </div>
            <div className="text-gray-300">
              👥 <span className="text-white font-bold">{getActivePlayers().length}</span> لاعب نشط
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-gray-300">
              🎯 <span className="text-white font-bold">{currentPlayer?.name || 'غير محدد'}</span>
            </div>
          </div>
          
          <div className="text-gray-300">
            الجولة <span className="text-white font-bold">{round}</span>
          </div>
        </div>
      </div>
    </>
  );
}