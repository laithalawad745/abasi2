// components/QuestionAnswerGame.jsx - الملف الكامل مع إصلاح التناوب
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { questionAnswerData } from '../app/data/questionAnswerData';
import { ImageModal, ConfirmModal } from './Modals';
import ToastNotification, { showSuccessToast, showErrorToast, showInfoToast } from './ToastNotification';

// بيانات أنواع الأسئلة مع الأيقونات (مطابقة لملف البيانات)
const questionTypes = [
  { id: 'sports', name: 'رياضة', icon: '⚽', color: 'from-blue-500 to-blue-600' },
  { id: 'history', name: 'تاريخ', icon: '🏛️', color: 'from-amber-500 to-orange-600' },
  { id: 'geography', name: 'جغرافيا', icon: '🌍', color: 'from-green-500 to-green-600' },
  { id: 'series', name: 'مسلسلات', icon: '📺', color: 'from-purple-500 to-purple-600' },
  { id: 'cars', name: 'سيارات', icon: '🚗', color: 'from-red-500 to-red-600' },
  { id: 'technology', name: 'تكنولوجيا', icon: '💻', color: 'from-indigo-500 to-indigo-600' },
  { id: 'food', name: 'طعام', icon: '🍕', color: 'from-yellow-500 to-yellow-600' },
  { id: 'science', name: 'علوم', icon: '🔬', color: 'from-cyan-500 to-cyan-600' }
];

export default function QuestionAnswerGame() {
  // حالة اللعبة
  const [gamePhase, setGamePhase] = useState('setup'); // setup, playing, finished
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [currentTurn, setCurrentTurn] = useState('red');
  const [teams, setTeams] = useState([
    { name: 'الفريق الأحمر', color: 'red', score: 0 },
    { name: 'الفريق الأزرق', color: 'blue', score: 0 }
  ]);

  // حالة الأسئلة
  const [teamQuestionMap, setTeamQuestionMap] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState(new Set());

  // حالة UI
  const [zoomedImage, setZoomedImage] = useState(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Timer State
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerInterval, setTimerInterval] = useState(null);

  // Local Storage Keys
  const STORAGE_KEYS = {
    selectedTypes: 'qa-game-selected-types',
    usedQuestions: 'qa-game-used-questions',
    teamQuestionMap: 'qa-game-team-question-map',
    teams: 'qa-game-teams',
    currentTurn: 'qa-game-current-turn',
    gamePhase: 'qa-game-phase'
  };

  // تحميل البيانات من localStorage
  useEffect(() => {
    try {
      const savedPhase = localStorage.getItem(STORAGE_KEYS.gamePhase);
      const savedSelectedTypes = localStorage.getItem(STORAGE_KEYS.selectedTypes);
      const savedUsedQuestions = localStorage.getItem(STORAGE_KEYS.usedQuestions);
      const savedTeamQuestionMap = localStorage.getItem(STORAGE_KEYS.teamQuestionMap);
      const savedTeams = localStorage.getItem(STORAGE_KEYS.teams);
      const savedCurrentTurn = localStorage.getItem(STORAGE_KEYS.currentTurn);

      if (savedPhase) setGamePhase(savedPhase);
      if (savedSelectedTypes) setSelectedTypes(JSON.parse(savedSelectedTypes));
      if (savedUsedQuestions) setUsedQuestions(new Set(JSON.parse(savedUsedQuestions)));
      if (savedTeamQuestionMap) setTeamQuestionMap(JSON.parse(savedTeamQuestionMap));
      if (savedTeams) setTeams(JSON.parse(savedTeams));
      if (savedCurrentTurn) setCurrentTurn(savedCurrentTurn);
    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error);
    }
  }, []);

  // حفظ البيانات
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.gamePhase, gamePhase);
    } catch (error) {}
  }, [gamePhase]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.selectedTypes, JSON.stringify(selectedTypes));
    } catch (error) {}
  }, [selectedTypes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.usedQuestions, JSON.stringify(Array.from(usedQuestions)));
    } catch (error) {}
  }, [usedQuestions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.teamQuestionMap, JSON.stringify(teamQuestionMap));
    } catch (error) {}
  }, [teamQuestionMap]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.teams, JSON.stringify(teams));
    } catch (error) {}
  }, [teams]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.currentTurn, currentTurn);
    } catch (error) {}
  }, [currentTurn]);

  // Timer Functions
  const startTimer = () => {
    if (!timerActive) {
      setTimerActive(true);
      const interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
      setTimerInterval(interval);
    }
  };

  const stopTimer = () => {
    setTimerActive(false);
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  const toggleTimer = () => {
    if (timerActive) {
      stopTimer();
    } else {
      startTimer();
    }
  };

  const resetTimer = () => {
    stopTimer();
    setTimer(0);
  };

  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  // دوال اختيار الأنواع
  const toggleTypeSelection = (typeId) => {
    if (selectedTypes.includes(typeId)) {
      setSelectedTypes(prev => prev.filter(id => id !== typeId));
    } else if (selectedTypes.length < 6) {
      setSelectedTypes(prev => [...prev, typeId]);
    }
  };

  // بدء اللعبة
  const startGame = () => {
    if (selectedTypes.length !== 6) {
      showErrorToast('يجب اختيار 6 أنواع أسئلة بالضبط!');
      return;
    }

    // إعداد خريطة الأسئلة
    const initialMap = {};
    selectedTypes.forEach(typeId => {
      initialMap[typeId] = {
        red: { easy: false, medium: false, hard: false },
        blue: { easy: false, medium: false, hard: false }
      };
    });
    
    setTeamQuestionMap(initialMap);
    setGamePhase('playing');
    showSuccessToast('تم بدء اللعبة! حظاً موفقاً 🎮');
  };

  // الحصول على سؤال عشوائي
  const getRandomQuestion = (typeId, difficulty) => {
    if (!questionAnswerData[typeId]) {
      console.error(`No data found for type: ${typeId}`);
      return null;
    }

    const questionsOfType = questionAnswerData[typeId].questions || [];
    const usedQuestionIds = Array.from(usedQuestions);
    const availableQuestions = questionsOfType.filter(q => 
      q.difficulty === difficulty && !usedQuestionIds.includes(q.id)
    );

    if (availableQuestions.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    return availableQuestions[randomIndex];
  };

  // اختيار سؤال
  const selectQuestion = (typeId, team, difficulty) => {
    if (team !== currentTurn) {
      showErrorToast(`ليس دور الفريق ${team === 'red' ? 'الأحمر' : 'الأزرق'} الآن!`);
      return;
    }

    if (currentQuestion) {
      showErrorToast('يجب الانتهاء من السؤال الحالي أولاً!');
      return;
    }

    if (teamQuestionMap[typeId]?.[team]?.[difficulty]) {
      showErrorToast('تم الإجابة على هذا السؤال من قبل!');
      return;
    }

    // الحصول على سؤال عشوائي
    const randomQuestion = getRandomQuestion(typeId, difficulty);
    
    if (!randomQuestion) {
      showErrorToast(`لا توجد أسئلة ${difficulty === 'easy' ? 'سهلة' : difficulty === 'medium' ? 'متوسطة' : 'صعبة'} متاحة في ${questionTypes.find(t => t.id === typeId).name}!`);
      return;
    }

    const points = difficulty === 'easy' ? 200 : difficulty === 'medium' ? 400 : 600;

    setCurrentQuestion({
      ...randomQuestion,
      typeId,
      team,
      difficulty,
      points
    });
    setShowAnswer(false);
    showInfoToast(`تم اختيار سؤال ${difficulty === 'easy' ? 'سهل' : difficulty === 'medium' ? 'متوسط' : 'صعب'} في ${questionTypes.find(t => t.id === typeId).name}`);
  };

  // 🆕 دالة إغلاق السؤال بدون تغيير الدور (للاستخدام الداخلي)
  const closeQuestionOnly = () => {
    if (currentQuestion) {
      // إضافة السؤال للأسئلة المستخدمة
      setUsedQuestions(prev => new Set([...prev, currentQuestion.id]));

      // تحديث خريطة الأسئلة
      setTeamQuestionMap(prev => ({
        ...prev,
        [currentQuestion.typeId]: {
          ...prev[currentQuestion.typeId],
          [currentQuestion.team]: {
            ...prev[currentQuestion.typeId][currentQuestion.team],
            [currentQuestion.difficulty]: true
          }
        }
      }));
    }
    
    setCurrentQuestion(null);
    setShowAnswer(false);
  };

  // 🆕 دالة إغلاق السؤال مع تغيير الدور
  const closeQuestion = () => {
    closeQuestionOnly();
    // تغيير الدور بعد إغلاق السؤال
    setCurrentTurn(currentTurn === 'red' ? 'blue' : 'red');
  };

  // 🆕 دالة إضافة النقاط مع تغيير الدور
  const addPoints = (points, teamWhoAnswered) => {
    setTeams(prevTeams => 
      prevTeams.map(team => 
        team.color === teamWhoAnswered 
          ? { ...team, score: team.score + points }
          : team
      )
    );
    showSuccessToast(`🎉 تم إضافة ${points} نقطة للفريق ${teamWhoAnswered === 'red' ? 'الأحمر' : 'الأزرق'}!`);
    
    // إغلاق السؤال بدون تغيير الدور أولاً
    closeQuestionOnly();
    
    // ثم تغيير الدور بعد إضافة النقاط
    setCurrentTurn(currentTurn === 'red' ? 'blue' : 'red');
  };

  // فحص إذا انتهت اللعبة
  const isGameFinished = () => {
    if (!teamQuestionMap || selectedTypes.length === 0) return false;
    
    return selectedTypes.every(typeId => 
      teamQuestionMap[typeId] &&
      ['easy', 'medium', 'hard'].every(difficulty =>
        teamQuestionMap[typeId]['red'][difficulty] && 
        teamQuestionMap[typeId]['blue'][difficulty]
      )
    );
  };

  // إعادة تعيين اللعبة
  const resetGame = () => {
    setGamePhase('setup');
    setSelectedTypes([]);
    setTeams([
      { name: 'الفريق الأحمر', color: 'red', score: 0 },
      { name: 'الفريق الأزرق', color: 'blue', score: 0 }
    ]);
    setTeamQuestionMap({});
    setCurrentQuestion(null);
    setCurrentTurn('red');
    setShowAnswer(false);
    setUsedQuestions(new Set());
    setShowConfirmReset(false);
    resetTimer();

    // مسح localStorage
    try {
      Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('خطأ في مسح localStorage:', error);
    }

    showInfoToast('تم إعادة تعيين اللعبة بنجاح!');
  };

  useEffect(() => {
    if (gamePhase === 'playing' && isGameFinished()) {
      setGamePhase('finished');
      showSuccessToast('🎉 انتهت اللعبة! تحقق من النتائج');
    }
  }, [teamQuestionMap, gamePhase]);

  // مرحلة الإعداد
  if (gamePhase === 'setup') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="text-4xl md:text-5xl font-black text-white tracking-wider">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                ABSI
              </span>
            </div>
            <Link 
              href="/" 
              className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              ← الرئيسية
            </Link>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
              فقرة
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                سؤال و جواب
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-6">اختر 6 أنواع أسئلة من أصل 8</p>
            <div className="text-lg text-yellow-400 font-bold">
              المختار: {selectedTypes.length}/6
            </div>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {questionTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => toggleTypeSelection(type.id)}
                  disabled={!selectedTypes.includes(type.id) && selectedTypes.length >= 6}
                  className={`p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                    selectedTypes.includes(type.id)
                      ? `bg-gradient-to-br ${type.color} text-white shadow-lg border-2 border-white/30`
                      : selectedTypes.length >= 6
                      ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }`}
                >
                  <div className="text-3xl mb-2">{type.icon}</div>
                  <div className="text-lg font-bold">{type.name}</div>
                  {selectedTypes.includes(type.id) && (
                    <div className="text-2xl mt-2">✓</div>
                  )}
                </button>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={startGame}
                disabled={selectedTypes.length !== 6}
                className={`px-8 py-4 rounded-2xl font-bold text-xl transition-all duration-300 ${
                  selectedTypes.length === 6
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:scale-105'
                    : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                }`}
              >
                🎮 بدء اللعبة
              </button>
            </div>
          </div>
        </div>

        <ToastNotification />
      </div>
    );
  }

  // مرحلة اللعب
  if (gamePhase === 'playing') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="text-4xl md:text-5xl font-black text-white tracking-wider">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                سؤال و جواب
              </span>
            </div>
            <Link 
              href="/" 
              className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              ← الرئيسية
            </Link>
          </div>

          {/* مؤقت */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4">
              <div className="text-3xl font-bold text-white">
                {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={toggleTimer}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${
                    timerActive 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {timerActive ? '⏸️ إيقاف' : '▶️ تشغيل'}
                </button>
                <button
                  onClick={resetTimer}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-sm transition-all duration-300"
                >
                  🔄 إعادة
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* الفريق الأحمر */}
            <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-xl border border-red-400/30 rounded-3xl p-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-red-300 mb-2">
                  الفريق الأحمر {currentTurn === 'red' && '← الدور الآن'}
                </h3>
                <div className="text-4xl font-black text-white">{teams[0].score}</div>
              </div>
            </div>

            {/* الفريق الأزرق */}
            <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-xl border border-blue-400/30 rounded-3xl p-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-blue-300 mb-2">
                  الفريق الأزرق {currentTurn === 'blue' && '← الدور الآن'}
                </h3>
                <div className="text-4xl font-black text-white">{teams[1].score}</div>
              </div>
            </div>
          </div>

          {/* لوحة الأسئلة */}
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedTypes.map(typeId => {
                const type = questionTypes.find(t => t.id === typeId);
                return (
                  <div key={typeId} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                    <div className="grid grid-cols-3 gap-4">
                      {/* العمود الأيسر - أسئلة الأحمر */}
                      <div className="space-y-4">
                        <div className="text-center text-red-300 font-bold text-sm mb-2">أحمر</div>
                        <button
                          onClick={() => selectQuestion(typeId, 'red', 'easy')}
                          disabled={teamQuestionMap[typeId]?.red?.easy || currentQuestion || currentTurn !== 'red'}
                          className={`w-full p-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                            teamQuestionMap[typeId]?.red?.easy
                              ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                              : !currentQuestion && currentTurn === 'red'
                              ? 'bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:scale-105 shadow-lg'
                              : 'bg-red-300/30 text-red-200 cursor-not-allowed'
                          }`}
                        >
                          {teamQuestionMap[typeId]?.red?.easy ? '✓' : '200'}
                        </button>
                        
                        <button
                          onClick={() => selectQuestion(typeId, 'red', 'medium')}
                          disabled={teamQuestionMap[typeId]?.red?.medium || currentQuestion || currentTurn !== 'red'}
                          className={`w-full p-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                            teamQuestionMap[typeId]?.red?.medium
                              ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                              : !currentQuestion && currentTurn === 'red'
                              ? 'bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:scale-105 shadow-lg'
                              : 'bg-red-300/30 text-red-200 cursor-not-allowed'
                          }`}
                        >
                          {teamQuestionMap[typeId]?.red?.medium ? '✓' : '400'}
                        </button>
                        
                        <button
                          onClick={() => selectQuestion(typeId, 'red', 'hard')}
                          disabled={teamQuestionMap[typeId]?.red?.hard || currentQuestion || currentTurn !== 'red'}
                          className={`w-full p-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                            teamQuestionMap[typeId]?.red?.hard
                              ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                              : !currentQuestion && currentTurn === 'red'
                              ? 'bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:scale-105 shadow-lg'
                              : 'bg-red-300/30 text-red-200 cursor-not-allowed'
                          }`}
                        >
                          {teamQuestionMap[typeId]?.red?.hard ? '✓' : '600'}
                        </button>
                      </div>

                      {/* العمود الأوسط - أيقونة ونوع السؤال */}
                      <div className="flex items-center justify-center">
                        <div className={`bg-gradient-to-br ${type.color} rounded-2xl p-4 text-center shadow-lg h-full flex flex-col justify-center min-h-[200px]`}>
                          <div className="text-4xl mb-3">{type.icon}</div>
                          <div className="text-white font-bold text-lg">{type.name}</div>
                        </div>
                      </div>

                      {/* العمود الأيمن - أسئلة الأزرق */}
                      <div className="space-y-4">
                        <div className="text-center text-blue-300 font-bold text-sm mb-2">أزرق</div>
                        <button
                          onClick={() => selectQuestion(typeId, 'blue', 'easy')}
                          disabled={teamQuestionMap[typeId]?.blue?.easy || currentQuestion || currentTurn !== 'blue'}
                          className={`w-full p-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                            teamQuestionMap[typeId]?.blue?.easy
                              ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                              : !currentQuestion && currentTurn === 'blue'
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:scale-105 shadow-lg'
                              : 'bg-blue-300/30 text-blue-200 cursor-not-allowed'
                          }`}
                        >
                          {teamQuestionMap[typeId]?.blue?.easy ? '✓' : '200'}
                        </button>
                        
                        <button
                          onClick={() => selectQuestion(typeId, 'blue', 'medium')}
                          disabled={teamQuestionMap[typeId]?.blue?.medium || currentQuestion || currentTurn !== 'blue'}
                          className={`w-full p-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                            teamQuestionMap[typeId]?.blue?.medium
                              ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                              : !currentQuestion && currentTurn === 'blue'
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:scale-105 shadow-lg'
                              : 'bg-blue-300/30 text-blue-200 cursor-not-allowed'
                          }`}
                        >
                          {teamQuestionMap[typeId]?.blue?.medium ? '✓' : '400'}
                        </button>
                        
                        <button
                          onClick={() => selectQuestion(typeId, 'blue', 'hard')}
                          disabled={teamQuestionMap[typeId]?.blue?.hard || currentQuestion || currentTurn !== 'blue'}
                          className={`w-full p-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                            teamQuestionMap[typeId]?.blue?.hard
                              ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                              : !currentQuestion && currentTurn === 'blue'
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:scale-105 shadow-lg'
                              : 'bg-blue-300/30 text-blue-200 cursor-not-allowed'
                          }`}
                        >
                          {teamQuestionMap[typeId]?.blue?.hard ? '✓' : '600'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* أزرار التحكم */}
            <div className="text-center mt-8 space-y-4">
              <button
                onClick={() => setCurrentTurn(currentTurn === 'red' ? 'blue' : 'red')}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 mr-4"
              >
                🔄 تغيير الدور
              </button>
              
              <button
                onClick={() => setShowConfirmReset(true)}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105"
              >
                🔄 لعبة جديدة
              </button>
            </div>
          </div>
        </div>

        {/* نافذة السؤال */}
        {currentQuestion && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 md:p-8">
                
                {/* عنوان السؤال */}
                <div className="text-center mb-6">
                  <div className="inline-block px-6 py-3 rounded-2xl font-bold text-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                    {currentQuestion.points} نقطة - {currentQuestion.difficulty === 'easy' ? 'سهل' : currentQuestion.difficulty === 'medium' ? 'متوسط' : 'صعب'}
                  </div>
                  <p className="text-gray-400 mt-2">للفريق {currentQuestion.team === 'red' ? 'الأحمر' : 'الأزرق'}</p>
                </div>
                
                {/* نص السؤال */}
                <div className="text-center mb-8">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                    <h3 className="text-2xl md:text-3xl font-bold text-white leading-relaxed">
                      {currentQuestion.question}
                    </h3>
                  </div>
                </div>

                {/* صورة السؤال */}
                {currentQuestion.hasImage && (
                  <div className="flex justify-center mb-8">
                    <img 
                      src={currentQuestion.imageUrl} 
                      alt="صورة السؤال" 
                      className="max-w-full max-h-64 md:max-h-80 object-contain rounded-2xl shadow-lg border border-white/20 cursor-pointer hover:scale-105 transition-transform duration-300"
                      onClick={() => setZoomedImage(currentQuestion.imageUrl)}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x250/6366F1/FFFFFF?text=صورة+السؤال';
                      }}
                    />
                  </div>
                )}

                {/* الإجابة */}
                {showAnswer && (
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <h4 className="text-2xl font-bold text-green-400">الإجابة الصحيحة</h4>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-6">
                      <p className="text-2xl md:text-3xl text-white font-bold">{currentQuestion.answer}</p>
                    </div>

                    {/* صورة الإجابة */}
                    {currentQuestion.hasAnswerImage && (
                      <div className="flex justify-center">
                        <img 
                          src={currentQuestion.answerImageUrl} 
                          alt="صورة الإجابة" 
                          className="max-w-full max-h-48 md:max-h-64 object-contain rounded-2xl shadow-lg border border-green-400/50 cursor-pointer hover:scale-105 transition-transform duration-300"
                          onClick={() => setZoomedImage(currentQuestion.answerImageUrl)}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=صورة+الإجابة';
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* أزرار التحكم */}
                <div className="flex flex-wrap justify-center gap-4">
                  {!showAnswer ? (
                    <button
                      onClick={() => setShowAnswer(true)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-2xl font-bold transition-all duration-300 hover:scale-105"
                    >
                      عرض الإجابة
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => addPoints(currentQuestion.points, 'red')}
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2"
                      >
                        🔴 الأحمر أجاب صح (+{currentQuestion.points})
                      </button>
                      <button
                        onClick={() => addPoints(currentQuestion.points, 'blue')}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2"
                      >
                        🔵 الأزرق أجاب صح (+{currentQuestion.points})
                      </button>
                      <button
                        onClick={closeQuestion}
                        className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-2xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2"
                      >
                        ❌ لا أحد أجاب صح
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* نافذة تأكيد إعادة التعيين */}
        <ConfirmModal
          isOpen={showConfirmReset}
          onClose={() => setShowConfirmReset(false)}
          onConfirm={resetGame}
          title="إعادة تعيين اللعبة"
          message="هل أنت متأكد من إعادة تعيين اللعبة؟ سيتم فقدان جميع البيانات الحالية."
        />

        {/* نافذة زووم الصورة */}
        <ImageModal 
          isOpen={!!zoomedImage} 
          imageUrl={zoomedImage} 
          onClose={() => setZoomedImage(null)} 
        />

        <ToastNotification />
      </div>
    );
  }

  // مرحلة انتهاء اللعبة
  if (gamePhase === 'finished') {
    const winner = teams[0].score > teams[1].score ? teams[0] : teams[1].score > teams[0].score ? teams[1] : null;
    
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 p-6 md:p-8 text-center">
          <div className="max-w-4xl mx-auto">
            {/* عنوان انتهاء اللعبة */}
            <div className="mb-12">
              <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
                🎉 انتهت اللعبة!
              </h1>
              {winner ? (
                <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                  الفائز: {winner.name}!
                </h2>
              ) : (
                <h2 className="text-3xl md:text-4xl font-bold text-purple-400">
                  تعادل!
                </h2>
              )}
            </div>

            {/* النتيجة النهائية */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className={`p-8 rounded-3xl backdrop-blur-xl border ${
                winner?.color === 'red' 
                  ? 'bg-gradient-to-br from-red-500/30 to-pink-500/30 border-red-400/50 ring-4 ring-red-400/30' 
                  : 'bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-400/30'
              }`}>
                <h3 className="text-2xl font-bold text-red-300 mb-4">الفريق الأحمر</h3>
                <div className="text-5xl font-black text-white">{teams[0].score}</div>
                {winner?.color === 'red' && <div className="text-yellow-400 text-2xl mt-2">👑</div>}
              </div>

              <div className={`p-8 rounded-3xl backdrop-blur-xl border ${
                winner?.color === 'blue' 
                  ? 'bg-gradient-to-br from-blue-500/30 to-indigo-500/30 border-blue-400/50 ring-4 ring-blue-400/30' 
                  : 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-blue-400/30'
              }`}>
                <h3 className="text-2xl font-bold text-blue-300 mb-4">الفريق الأزرق</h3>
                <div className="text-5xl font-black text-white">{teams[1].score}</div>
                {winner?.color === 'blue' && <div className="text-yellow-400 text-2xl mt-2">👑</div>}
              </div>
            </div>

            {/* أزرار التحكم */}
            <div className="space-y-4">
              <button
                onClick={resetGame}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl font-bold text-xl transition-all duration-300 hover:scale-105 mr-4"
              >
                🎮 لعبة جديدة
              </button>
              
              <Link
                href="/"
                className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-2xl font-bold text-xl transition-all duration-300 hover:scale-105"
              >
                🏠 العودة للرئيسية
              </Link>
            </div>
          </div>
        </div>

        <ToastNotification />
      </div>
    );
  }

  return null;
}