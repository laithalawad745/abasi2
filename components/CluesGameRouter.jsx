// components/CluesGameRouter.jsx - إصلاح مشكلة فقدان التركيز في حقل الإدخال
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CluesGame from './CluesGame';
import { ToastContainer } from 'react-toastify';
import { showSuccessToast, showErrorToast } from './ToastNotification';

export default function CluesGameRouter({ roomIdFromUrl = null }) {
  const router = useRouter();
  const [currentView, setCurrentView] = useState('home');
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isHost, setIsHost] = useState(false);
  
  // 🆕 إضافة refs لحقول الإدخال لحل مشكلة التركيز
  const playerNameInputRef = useRef(null);
  const roomIdInputRef = useRef(null);

  // إذا كان هناك roomId من الرابط، انتقل مباشرة لصفحة الانضمام
  useEffect(() => {
    if (roomIdFromUrl) {
      setRoomId(roomIdFromUrl);
      setCurrentView('join');
    }
  }, [roomIdFromUrl]);

  // 🆕 دالة محسّنة لتغيير اسم اللاعب مع الحفاظ على التركيز
  const handlePlayerNameChange = useCallback((e) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    setPlayerName(value);
    
    // إعادة التركيز في النيكست تيك
    setTimeout(() => {
      if (playerNameInputRef.current) {
        playerNameInputRef.current.focus();
        playerNameInputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0);
  }, []);

  // 🆕 دالة محسّنة لتغيير رمز الغرفة مع الحفاظ على التركيز
  const handleRoomIdChange = useCallback((e) => {
    const value = e.target.value.toUpperCase();
    const cursorPosition = e.target.selectionStart;
    
    setRoomId(value);
    
    // إعادة التركيز في النيكست تيك
    setTimeout(() => {
      if (roomIdInputRef.current) {
        roomIdInputRef.current.focus();
        roomIdInputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0);
  }, []);

  // الصفحة الرئيسية
  const HomePage = () => (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-pink-500/15 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center mb-12">
          {/* العنوان الرئيسي */}
          <div className="relative mb-8">
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4 tracking-tight">
              🧩 التلميحات
            </h1>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 blur-2xl opacity-20 -z-10"></div>
          </div>

          {/* الوصف */}
          <p className="text-2xl md:text-3xl text-white/80 font-medium mb-8 leading-relaxed">
            لعبة الذكاء والتركيز<br />
            <span className="text-white/60 text-xl">خمن الإجابة من التلميحات التدريجية</span>
          </p>

          {/* القواعد الأساسية */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <div className="text-4xl mb-3">💡</div>
              <h3 className="text-lg font-bold text-white mb-2">تلميحات تدريجية</h3>
              <p className="text-white/70 text-sm">احصل على تلميحات إضافية لكن النقاط تقل</p>
            </div>
            <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-lg font-bold text-white mb-2">اجب بسرعة</h3>
              <p className="text-white/70 text-sm">من يجيب أولاً يحصل على نقاط أكثر</p>
            </div>
            <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="text-lg font-bold text-white mb-2">تنافس شريف</h3>
              <p className="text-white/70 text-sm">تحدى أصدقاءك في معركة الذكاء</p>
            </div>
          </div>
        </div>

        {/* أزرار الخيارات */}
        <div className="flex flex-col sm:flex-row gap-6 max-w-md w-full">
          <button
            onClick={() => setCurrentView('create')}
            className="group relative flex-1"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 border border-purple-400/20 backdrop-blur-sm">
              🎮 إنشاء غرفة جديدة
            </div>
          </button>

          <button
            onClick={() => setCurrentView('join')}
            className="group relative flex-1"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 border border-blue-400/20 backdrop-blur-sm">
              🚪 انضمام لغرفة
            </div>
          </button>
        </div>

        {/* إحصائيات */}
        <div className="mt-16 text-center">
          <p className="text-white/60 mb-4">📊 إحصائيات اللعبة</p>
          <div className="flex flex-wrap justify-center gap-8 text-white/80">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">20+</div>
              <div className="text-sm">سؤال متنوع</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">10</div>
              <div className="text-sm">تلميحات لكل سؤال</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-400">200</div>
              <div className="text-sm">نقطة للإجابة السريعة</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // صفحة إنشاء غرفة
  const CreateRoomPage = () => (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden flex items-center justify-center p-4">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
              🎮 إنشاء غرفة
            </h2>
            <p className="text-white/70">أنشئ غرفة جديدة وادع أصدقاءك!</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-white font-semibold mb-2">اسمك</label>
              <input
                ref={playerNameInputRef}
                type="text"
                value={playerName}
                onChange={handlePlayerNameChange}
                placeholder="أدخل اسمك"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors duration-300"
                maxLength={20}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                key="create-player-name" // مفتاح ثابت لمنع re-mount
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setCurrentView('home')}
                className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-300"
              >
                ← رجوع
              </button>
              <button
                onClick={createRoom}
                disabled={!playerName.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                إنشاء الغرفة
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // صفحة الانضمام لغرفة
  const JoinRoomPage = () => (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden flex items-center justify-center p-4">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3">
              🚪 انضمام لغرفة
            </h2>
            <p className="text-white/70">انضم لغرفة موجودة وابدأ اللعب!</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-white font-semibold mb-2">اسمك</label>
              <input
                ref={playerNameInputRef}
                type="text"
                value={playerName}
                onChange={handlePlayerNameChange}
                placeholder="أدخل اسمك"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors duration-300"
                maxLength={20}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                key="join-player-name" // مفتاح ثابت لمنع re-mount
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">رمز الغرفة</label>
              <input
                ref={roomIdInputRef}
                type="text"
                value={roomId}
                onChange={handleRoomIdChange}
                placeholder="أدخل رمز الغرفة"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors duration-300 font-mono text-center text-lg tracking-wider"
                maxLength={6}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                key="join-room-id" // مفتاح ثابت لمنع re-mount
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setCurrentView('home')}
                className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-300"
              >
                ← رجوع
              </button>
              <button
                onClick={joinRoom}
                disabled={!playerName.trim() || !roomId.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                انضمام للغرفة
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // إنشاء غرفة جديدة
  const createRoom = () => {
    if (!playerName.trim()) {
      showErrorToast('يرجى إدخال اسمك أولاً');
      return;
    }

    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(newRoomId);
    setIsHost(true);
    setCurrentView('game');
    showSuccessToast(`تم إنشاء الغرفة: ${newRoomId}`);
  };

  // الانضمام لغرفة
  const joinRoom = () => {
    if (!playerName.trim()) {
      showErrorToast('يرجى إدخال اسمك أولاً');
      return;
    }

    if (!roomId.trim()) {
      showErrorToast('يرجى إدخال رمز الغرفة');
      return;
    }

    setIsHost(false);
    setCurrentView('game');
    showSuccessToast(`انضممت للغرفة: ${roomId}`);
  };

  // العودة للصفحة الرئيسية
  const goHome = () => {
    setCurrentView('home');
    setRoomId('');
    setPlayerName('');
    setIsHost(false);
  };

  // عرض المكون المناسب
  if (currentView === 'game') {
    return (
      <>
        <CluesGame
          roomId={roomId}
          playerName={playerName}
          isHost={isHost}
          onExit={goHome}
        />
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      {currentView === 'home' && <HomePage />}
      {currentView === 'create' && <CreateRoomPage />}
      {currentView === 'join' && <JoinRoomPage />}
      <ToastContainer />
    </>
  );
}