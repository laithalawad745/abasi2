// components/PlayerCareerGameRouter.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Pusher from 'pusher-js';
import PlayerCareerSetup from './PlayerCareerSetup';
import PlayerCareerGame from './PlayerCareerGame';

export default function PlayerCareerGameRouter({ roomIdFromUrl = null }) {
  const [gameState, setGameState] = useState('setup');
  const [pusher, setPusher] = useState(null);
  const [playerId, setPlayerId] = useState('');
  const [opponentId, setOpponentId] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState(roomIdFromUrl);
  const [finalScores, setFinalScores] = useState(null);

  // إعداد Pusher
  useEffect(() => {
    const pusherClient = new Pusher('39e929ae966aeeea6ca3', {
      cluster: 'us2',
      encrypted: true
    });

    pusherClient.connection.bind('connected', () => {
      console.log('Pusher connected!');
    });

    setPusher(pusherClient);

    // إنشاء Player ID فريد
    const newPlayerId = 'player_' + Math.random().toString(36).substr(2, 9);
    setPlayerId(newPlayerId);

    if (roomIdFromUrl) {
      setGameState('joining');
    }

    return () => {
      pusherClient.disconnect();
    };
  }, [roomIdFromUrl]);

  const handleGameStart = (roomId, hostStatus, opponent) => {
    setCurrentRoomId(roomId);
    setIsHost(hostStatus);
    setOpponentId(opponent);
    setGameState('playing');
  };

  const handleGameEnd = (scores) => {
    setFinalScores(scores);
    setGameState('finished');
  };

  const goHome = () => {
    window.location.href = '/';
  };

  // شاشة التحميل
  if (!pusher) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden select-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <p className="text-white text-xl">جاري تحميل اللعبة...</p>
          </div>
        </div>
      </div>
    );
  }

  // التوجيه حسب حالة اللعبة
  if (gameState === 'setup' || gameState === 'joining') {
    return (
      <PlayerCareerSetup 
        pusher={pusher}
        playerId={playerId}
        onGameStart={handleGameStart}
        initialMode={gameState === 'joining' ? 'joining' : 'choice'}
        roomIdFromUrl={roomIdFromUrl}
      />
    );
  }

  if (gameState === 'playing') {
    return (
      <PlayerCareerGame 
        roomId={currentRoomId}
        pusher={pusher}
        isHost={isHost}
        playerId={playerId}
        opponentId={opponentId}
        onGameEnd={handleGameEnd}
      />
    );
  }

  if (gameState === 'finished') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-green-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 p-6 md:p-8 flex flex-col min-h-screen">
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-2xl w-full text-center">
              
              <h1 className="text-4xl md:text-6xl font-black text-white mb-8">
                🏆 انتهت اللعبة!
              </h1>

              {finalScores && (
                <div className="space-y-4 mb-8">
                  {Object.entries(finalScores)
                    .sort(([,a], [,b]) => b - a)
                    .map(([playerId, score], index) => (
                    <div 
                      key={playerId}
                      className={`p-4 rounded-2xl border-2 ${
                        index === 0
                          ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/50'
                          : 'bg-white/5 border-white/20'
                      }`}
                    >
                      <div className="text-xl font-bold text-white">
                        {index === 0 ? '👑' : '🥈'} لاعب {playerId.slice(-4)}: {score} نقطة
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setGameState('setup')}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
                >
                  🔄 لعبة جديدة
                </button>
                <button
                  onClick={goHome}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
                >
                  🏠 العودة للقائمة
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}