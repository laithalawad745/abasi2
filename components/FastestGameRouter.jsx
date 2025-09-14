// components/FastestGameRouter.jsx - التصميم الجديد مع الحفاظ على الوظائف الأصلية
'use client';

import React, { useState, useEffect } from 'react';
import Pusher from 'pusher-js';
import RoomSetup from './RoomSetup';
import JoinRoom from './JoinRoom';
import FastestGame from './FastestGame';

export default function FastestGameRouter({ roomIdFromUrl = null }) {
  const [gameState, setGameState] = useState('setup');
  const [pusher, setPusher] = useState(null);
  const [playerId, setPlayerId] = useState('');
  const [opponentId, setOpponentId] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState(roomIdFromUrl);
  const [finalScores, setFinalScores] = useState(null);

  // إعداد Pusher مبسط - الكود الأصلي بالضبط
  useEffect(() => {
    const pusherClient = new Pusher('39e929ae966aeeea6ca3', {
      cluster: 'us2',
      encrypted: true
    });

    pusherClient.connection.bind('connected', () => {
      console.log('Pusher connected!');
    });

    pusherClient.connection.bind('error', (err) => {
      console.error('Pusher error:', err);
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

  // جميع الوظائف الأصلية بالضبط
  const handleStartFastestGame = (roomId) => {
    setCurrentRoomId(roomId);
    setGameState('playing');
  };

  const handleJoinSuccess = (roomId) => {
    setCurrentRoomId(roomId);
    setGameState('playing');
  };

  const handleGameEnd = (scores) => {
    setFinalScores(scores);
    setGameState('finished');
  };

  const goHome = () => {
    window.location.href = '/';
  };

  // شاشة التحميل - التصميم الجديد
  if (!pusher) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden select-none">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-red-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
          <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl text-center">
            <div className="animate-spin w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-6"></div>
            <h3 className="text-xl font-bold text-white mb-2">جاري تحميل من أسرع...</h3>
            <p className="text-gray-400">يرجى الانتظار</p>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'setup') {
    return (
      <RoomSetup 
        onStartFastestGame={handleStartFastestGame}
        pusher={pusher}
        setIsHost={setIsHost}
        setPlayerId={setPlayerId}
        setOpponentId={setOpponentId}
        playerId={playerId}
      />
    );
  }

  if (gameState === 'joining') {
    return (
      <JoinRoom 
        roomId={currentRoomId}
        onJoinSuccess={handleJoinSuccess}
        pusher={pusher}
        setIsHost={setIsHost}
        setPlayerId={setPlayerId}
        setOpponentId={setOpponentId}
        playerId={playerId}
      />
    );
  }

  if (gameState === 'playing') {
    return (
      <FastestGame 
        roomId={currentRoomId}
        pusher={pusher}
        isHost={isHost}
        playerId={playerId}
        opponentId={opponentId}
        onGameEnd={handleGameEnd}
      />
    );
  }

  // شاشة النتائج النهائية - التصميم الجديد مع الحفاظ على المنطق الأصلي
  if (gameState === 'finished') {
    const myScore = finalScores[playerId];
    const opponentScore = finalScores[opponentId];
    const isWinner = myScore > opponentScore;
    const isTie = myScore === opponentScore;

    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden select-none">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
          <div className="max-w-md w-full">
            <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl text-center">
              
              {/* عنوان النتائج */}
              <div className="mb-8">
                <h1 className="text-4xl font-black mb-4">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                    🏆 النتائج النهائية
                  </span>
                </h1>
              </div>

              {/* أيقونة النتيجة */}
              <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center transition-all duration-500 ${
                isWinner 
                  ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-400/50 ring-2 ring-green-400/30' 
                  : isTie 
                    ? 'bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border-2 border-yellow-400/50 ring-2 ring-yellow-400/30' 
                    : 'bg-gradient-to-br from-red-500/20 to-pink-500/20 border-2 border-red-400/50 ring-2 ring-red-400/30'
              }`}>
                <span className="text-4xl">
                  {isWinner ? '🏆' : isTie ? '🤝' : '😢'}
                </span>
              </div>

              {/* رسالة النتيجة */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-white">
                  {isWinner ? 'مبروك! أنت الفائز! 🎉' : isTie ? 'تعادل مثير! 🤝' : 'للأسف خسرت هذه المرة 😔'}
                </h2>
                
                {isWinner && (
                  <p className="text-green-400 font-semibold">أنت أسرع في الإجابة!</p>
                )}
                {isTie && (
                  <p className="text-yellow-400 font-semibold">نفس السرعة تماماً!</p>
                )}
                {!isWinner && !isTie && (
                  <p className="text-gray-400 font-semibold">حاول مرة أخرى!</p>
                )}
              </div>

              {/* عرض النقاط */}
              <div className="space-y-4 mb-8">
                <div className={`p-4 rounded-2xl border transition-all duration-300 ${
                  isWinner 
                    ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30'
                    : 'bg-white/5 border-white/10'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 font-semibold">نقاطك:</span>
                    <span className={`font-bold text-2xl ${
                      isWinner ? 'text-green-400' : 'text-white'
                    }`}>
                      {myScore}
                    </span>
                  </div>
                </div>
                
                <div className={`p-4 rounded-2xl border transition-all duration-300 ${
                  !isWinner && !isTie
                    ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/30'
                    : 'bg-white/5 border-white/10'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 font-semibold">نقاط الخصم:</span>
                    <span className={`font-bold text-2xl ${
                      !isWinner && !isTie ? 'text-blue-400' : 'text-white'
                    }`}>
                      {opponentScore}
                    </span>
                  </div>
                </div>
              </div>

              {/* زر العودة للرئيسية */}
              <button
                onClick={goHome}
                className="group relative w-full"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-center gap-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0L3.586 10l4.707-4.707a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd"/>
                    </svg>
                    العودة للرئيسية
                  </div>
                </div>
              </button>

              {/* معلومات إضافية */}
              <div className="mt-6 text-center">
                <div className="inline-flex items-center justify-center space-x-6 space-x-reverse bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3">
                  <div className="flex items-center space-x-2 space-x-reverse text-gray-300">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">لعبة سرعة</span>
                  </div>
                  <div className="w-px h-4 bg-white/20"></div>
                  <div className="flex items-center space-x-2 space-x-reverse text-gray-300">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">أسئلة متنوعة</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}