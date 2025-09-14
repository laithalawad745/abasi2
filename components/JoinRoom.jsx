// components/JoinRoom.jsx - التصميم الجديد مع الحفاظ على الوظائف الأصلية
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

  // نفس منطق الانضمام الأصلي بالضبط
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

  // حالة الانضمام - التصميم الجديد
  if (isJoining) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden select-none">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
          <div className="max-w-md w-full">
            <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl text-center">
              
              {/* أيقونة التحميل */}
              <div className="mb-6">
                <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              </div>

              {/* العنوان */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-3">جاري الانضمام للغرفة...</h2>
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <p className="text-blue-400 font-semibold">رقم الغرفة: {roomId}</p>
                </div>
              </div>

              {/* رسالة الانتظار */}
              <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                <p className="text-yellow-400 font-semibold">يرجى الانتظار...</p>
                <p className="text-gray-400 text-sm mt-1">جاري البحث عن المضيف</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // حالة الخطأ - التصميم الجديد
  if (joinError) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden select-none">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
          <div className="max-w-md w-full">
            <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl text-center">
              
              {/* أيقونة الخطأ */}
              <div className="mb-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full mx-auto flex items-center justify-center border-2 border-red-500/50">
                  <span className="text-3xl">❌</span>
                </div>
              </div>

              {/* رسالة الخطأ */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-red-400 mb-3">فشل في الانضمام</h2>
                <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                  <p className="text-red-300 font-semibold">{joinError}</p>
                  <p className="text-gray-400 text-sm mt-2">رقم الغرفة: {roomId}</p>
                </div>
              </div>

              {/* زر المحاولة مرة أخرى */}
              <button
                onClick={() => window.location.href = '/fastest'}
                className="group relative w-full"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-center gap-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
                    </svg>
                    محاولة مرة أخرى
                  </div>
                </div>
              </button>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // حالة انتظار بدء اللعبة - التصميم الجديد
  if (isWaitingForStart) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden select-none">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
          <div className="max-w-md w-full">
            <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl text-center">
              
              {/* أيقونة النجاح */}
              <div className="mb-6">
                <div className="w-20 h-20 bg-green-500/20 rounded-full mx-auto flex items-center justify-center border-2 border-green-500/50 animate-pulse">
                  <span className="text-4xl">✅</span>
                </div>
              </div>

              {/* رسالة النجاح */}
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-green-400 mb-4">تم الانضمام بنجاح!</h2>
                <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20 mb-4">
                  <p className="text-green-300 font-semibold">أنت الآن في الغرفة</p>
                  <p className="text-gray-400 text-sm mt-1">رقم الغرفة: {roomId}</p>
                </div>
              </div>

              {/* حالة الانتظار */}
              <div className="p-6 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                <div className="animate-pulse w-12 h-12 bg-yellow-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">⏳</span>
                </div>
                <h3 className="text-xl font-bold text-yellow-400 mb-2">في انتظار المضيف...</h3>
                <p className="text-gray-400">سيبدأ المضيف اللعبة قريباً</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}