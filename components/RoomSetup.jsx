// components/RoomSetup.jsx
import React, { useState, useEffect } from 'react';

export default function RoomSetup({ 
  onStartFastestGame, 
  pusher, 
  setIsHost,
  setPlayerId,
  setOpponentId,
  playerId 
}) {
  const [mode, setMode] = useState('choice');
  const [roomId, setRoomId] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [opponentJoined, setOpponentJoined] = useState(false);
  const [channel, setChannel] = useState(null);
  const [joinError, setJoinError] = useState('');

  // إنشاء Room ID عشوائي
  const generateRoomId = () => {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  };

  // إنشاء غرفة جديدة
  const createRoom = () => {
    const newRoomId = generateRoomId();
    setRoomId(newRoomId);
    setIsHost(true);
    setMode('waiting');

    // استخدام public channel
    const channelName = `room-${newRoomId}`;
    const roomChannel = pusher.subscribe(channelName);
    setChannel(roomChannel);

    console.log(`Host subscribed to: ${channelName}`);

    // الاستماع لانضمام اللاعب الثاني
    roomChannel.bind('user-joined', (data) => {
      console.log('User joined:', data);
      if (data.playerId !== playerId && !data.isHost) {
        setOpponentId(data.playerId);
        setOpponentJoined(true);
        console.log('Guest found!');
      }
    });

    // إرسال presence للمضيف
    setTimeout(() => {
      fetch('/api/pusher/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: channelName,
          event: 'user-joined',
          data: {
            playerId: playerId,
            isHost: true,
            roomId: newRoomId
          }
        })
      }).catch(console.error);
    }, 1000);
  };

  // الانضمام لغرفة موجودة
  const joinRoom = () => {
    if (!joinRoomId.trim()) {
      setJoinError('يرجى إدخال رقم الغرفة');
      return;
    }

    const cleanRoomId = joinRoomId.trim().toUpperCase();
    setJoinError('');
    setIsHost(false);
    setMode('joining');

    const channelName = `room-${cleanRoomId}`;
    const roomChannel = pusher.subscribe(channelName);
    setChannel(roomChannel);

    console.log(`Guest subscribed to: ${channelName}`);

    // الاستماع للمضيف
    roomChannel.bind('user-joined', (data) => {
      console.log('User found:', data);
      if (data.playerId !== playerId && data.isHost) {
        setOpponentId(data.playerId);
        setMode('joined');
        console.log('Host found!');
      }
    });

    // الاستماع لبدء اللعبة
    roomChannel.bind('game-started', (data) => {
      console.log('Game started');
      onStartFastestGame(cleanRoomId);
    });

    // إرسال presence للضيف
    setTimeout(() => {
      fetch('/api/pusher/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: channelName,
          event: 'user-joined',
          data: {
            playerId: playerId,
            isHost: false,
            roomId: cleanRoomId
          }
        })
      }).then(() => {
        // timeout للانضمام
        setTimeout(() => {
          if (mode === 'joining') {
            setJoinError('لم يتم العثور على الغرفة');
            setMode('choice');
          }
        }, 8000);
      }).catch(console.error);
    }, 1000);
  };

  // نسخ رقم الغرفة
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
  };

  // بدء اللعبة
  const startGame = () => {
    if (opponentJoined && channel) {
      fetch('/api/pusher/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: channel.name,
          event: 'game-started',
          data: {
            startedBy: playerId,
            roomId: roomId
          }
        })
      }).then(() => {
        onStartFastestGame(roomId);
      }).catch(console.error);
    }
  };

  // الرجوع للخيارات
  const goBack = () => {
    setMode('choice');
    setJoinError('');
    setJoinRoomId('');
    setOpponentJoined(false);
    if (channel) {
      pusher.unsubscribe(channel.name);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 select-none flex flex-col items-center justify-center p-4">
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 max-w-md w-full text-center shadow-2xl border border-slate-700">
        
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-6">
          فقرة من أسرع
        </h1>

        {/* اختيار النمط */}
        {mode === 'choice' && (
          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 mb-3"
            >
              إنشاء غرفة جديدة
            </button>

            <button
              onClick={() => setMode('join')}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-300"
            >
              الانضمام لغرفة موجودة
            </button>
          </div>
        )}

        {/* إنشاء غرفة */}
        {mode === 'create' && (
          <div className="space-y-4">
            <p className="text-slate-300 mb-6">
              سيتم إنشاء غرفة جديدة وإعطاؤك رقم الغرفة
            </p>
            <button
              onClick={createRoom}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-300"
            >
              إنشاء الغرفة
            </button>
            <button onClick={goBack} className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold">
              رجوع
            </button>
          </div>
        )}

        {/* الانضمام لغرفة */}
        {mode === 'join' && (
          <div className="space-y-4">
            <p className="text-slate-300 mb-4">أدخل رقم الغرفة:</p>
            
            <input
              type="text"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
              placeholder="ABC123XY"
              className="w-full bg-slate-700 text-white p-3 rounded-lg text-center font-bold text-lg border border-slate-600 focus:border-blue-400 focus:outline-none"
              maxLength={8}
            />
            
            {joinError && <p className="text-red-400 text-sm">{joinError}</p>}
            
            <button
              onClick={joinRoom}
              disabled={!joinRoomId.trim()}
              className={`w-full px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 ${
                joinRoomId.trim() 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              انضمام للغرفة
            </button>
            
            <button onClick={goBack} className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold">
              رجوع
            </button>
          </div>
        )}

        {/* انتظار اللاعب الثاني */}
        {mode === 'waiting' && !opponentJoined && (
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="w-16 h-16 bg-yellow-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
              <p className="text-yellow-400 font-bold mb-4">في انتظار اللاعب الثاني...</p>
            </div>
            
            <div className="bg-slate-700/50 rounded-xl p-4 mb-4">
              <p className="text-slate-300 text-sm mb-2">رقم الغرفة:</p>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={roomId}
                  readOnly
                  className="flex-1 bg-slate-600 text-white p-3 rounded-lg text-center font-bold text-xl"
                />
                <button
                  onClick={copyRoomId}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-3 rounded-lg font-bold text-sm"
                >
                  نسخ
                </button>
              </div>
            </div>

            <p className="text-slate-400 text-xs">شارك رقم الغرفة مع صديقك</p>
            <button onClick={goBack} className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold">
              إلغاء
            </button>
          </div>
        )}

        {/* تم انضمام اللاعب الثاني */}
        {mode === 'waiting' && opponentJoined && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-green-400 font-bold mb-4">انضم اللاعب الثاني!</p>
            <p className="text-slate-300 mb-6">الآن يمكنكما بدء اللعبة</p>
            
            <button
              onClick={startGame}
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 animate-pulse"
            >
              ابدأ اللعبة!
            </button>
          </div>
        )}

        {/* حالة الانضمام */}
        {mode === 'joining' && (
          <div className="space-y-4">
            <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white font-bold">جاري الانضمام للغرفة...</p>
            <p className="text-slate-400 text-sm">رقم الغرفة: {joinRoomId}</p>
            <button onClick={goBack} className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold">
              إلغاء
            </button>
          </div>
        )}

        {/* تم الانضمام بنجاح */}
        {mode === 'joined' && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-green-400 font-bold mb-2">تم الانضمام بنجاح!</p>
            <p className="text-slate-300 mb-4">في انتظار المضيف لبدء اللعبة...</p>
            <p className="text-slate-400 text-sm">رقم الغرفة: {joinRoomId}</p>
          </div>
        )}

   
      </div>
    </div>
  );
}