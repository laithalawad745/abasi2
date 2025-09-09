// components/JoinRoom.jsx
import React, { useState, useEffect } from 'react';

export default function JoinRoom({ 
  roomId, 
  onJoinSuccess, 
  pusher, 
  setIsHost,
  setPlayerId,
  setOpponentId,
  playerId 
}) {
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [isWaitingForStart, setIsWaitingForStart] = useState(false);
  const [channel, setChannel] = useState(null);

  useEffect(() => {
    if (roomId && pusher) {
      joinRoom();
    }
  }, [roomId, pusher]);

  const joinRoom = () => {
    setIsJoining(true);
    setIsHost(false);

    try {
      // الاشتراك في قناة الغرفة
      const roomChannel = pusher.subscribe(`fastest-room-${roomId}`);
      setChannel(roomChannel);

      // الاستماع لبدء اللعبة
      roomChannel.bind('start-game', (data) => {
        onJoinSuccess(roomId);
      });

      // الاستماع للاعبين الموجودين
      roomChannel.bind('player-joined', (data) => {
        if (data.isHost) {
          setOpponentId(data.playerId);
        }
      });

      // إعلام القناة أن اللاعب الثاني انضم
      setTimeout(() => {
        roomChannel.trigger('client-player-joined', {
          playerId: playerId,
          isHost: false
        });
        setIsJoining(false);
        setIsWaitingForStart(true);
      }, 1000);

    } catch (error) {
      setJoinError('فشل في الانضمام للغرفة');
      setIsJoining(false);
    }
  };

  if (isJoining) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 select-none flex flex-col items-center justify-center p-4">
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 max-w-md w-full text-center shadow-2xl border border-slate-700">
          <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white font-bold">جاري الانضمام للغرفة...</p>
          <p className="text-slate-400 text-sm mt-2">رقم الغرفة: {roomId}</p>
        </div>
      </div>
    );
  }

  if (joinError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 select-none flex flex-col items-center justify-center p-4">
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 max-w-md w-full text-center shadow-2xl border border-slate-700">
          <div className="w-16 h-16 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">❌</span>
          </div>
          <p className="text-red-400 font-bold mb-2">خطأ في الانضمام</p>
          <p className="text-slate-300 text-sm mb-4">{joinError}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold transition-all duration-300"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 select-none flex flex-col items-center justify-center p-4">
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 max-w-md w-full text-center shadow-2xl border border-slate-700">
        <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
          <span className="text-2xl">✅</span>
        </div>
        <p className="text-green-400 font-bold mb-2">تم الانضمام بنجاح!</p>
        <p className="text-slate-300 mb-4">في انتظار المضيف لبدء اللعبة...</p>
        <p className="text-slate-400 text-sm">رقم الغرفة: {roomId}</p>
        
  
      </div>
    </div>
  );
}