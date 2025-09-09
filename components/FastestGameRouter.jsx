// components/FastestGameRouter.jsx
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

  // إعداد Pusher مبسط
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

  if (!pusher) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 select-none flex flex-col items-center justify-center p-4">
        <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
        <p className="text-white font-bold">جاري تحميل...</p>
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

  if (gameState === 'finished') {
    const myScore = finalScores[playerId];
    const opponentScore = finalScores[opponentId];
    const isWinner = myScore > opponentScore;
    const isTie = myScore === opponentScore;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 select-none flex flex-col items-center justify-center p-4">
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 max-w-md w-full text-center shadow-2xl border border-slate-700">
          <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
            النتائج النهائية
          </h1>
          
          <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
            isWinner ? 'bg-green-500' : isTie ? 'bg-yellow-500' : 'bg-red-500'
          }`}>
            <span className="text-3xl">
              {isWinner ? '🏆' : isTie ? '🤝' : '😢'}
            </span>
          </div>

          <p className="text-2xl font-bold mb-6 text-white">
            {isWinner ? 'مبروك! أنت الفائز!' : isTie ? 'تعادل!' : 'للأسف خسرت'}
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
              <span className="text-slate-300">نقاطك:</span>
              <span className="text-white font-bold text-xl">{myScore}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
              <span className="text-slate-300">نقاط الخصم:</span>
              <span className="text-white font-bold text-xl">{opponentScore}</span>
            </div>
          </div>

          <button
            onClick={goHome}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return null;
}