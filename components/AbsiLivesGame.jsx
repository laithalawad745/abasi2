// components/AbsiLivesGame.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { sampleTopics } from '../app/data/gameData';
import { ImageModal, ConfirmModal } from './Modals';
import ToastNotification from './ToastNotification';

export default function AbsiLivesGame() {
  // حالة اللعبة
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [currentTurn, setCurrentTurn] = useState('red');
  const [teams, setTeams] = useState([
    { name: 'الفريق الأحمر', color: 'red', score: 0 },
    { name: 'الفريق الأزرق', color: 'blue', score: 0 }
  ]);

  // حالة الأسئلة مع localStorage
  const [absiTopic, setAbsiTopic] = useState(null);
  const [usedQuestions, setUsedQuestions] = useState(new Set()); // Set بسيط لجميع الأسئلة المستخدمة
  const [teamQuestionMap, setTeamQuestionMap] = useState({});

  // Local Storage Keys
  const STORAGE_KEYS = {
    usedQuestions: 'absi-lives-used-questions-global', // تغيير الاسم للوضوح
    teamQuestionMap: 'absi-lives-team-question-map',
    teams: 'absi-lives-teams',
    currentTurn: 'absi-lives-current-turn'
  };
  
  // حالة أخرى
  const [zoomedImage, setZoomedImage] = useState(null);
  const [gameFinished, setGameFinished] = useState(false);
  
  // Timer State
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerInterval, setTimerInterval] = useState(null);

  // تحميل البيانات من localStorage
  useEffect(() => {
    try {
      const savedUsedQuestions = localStorage.getItem(STORAGE_KEYS.usedQuestions);
      if (savedUsedQuestions) {
        setUsedQuestions(new Set(JSON.parse(savedUsedQuestions)));
      }
    } catch (error) {}

    try {
      const savedTeamQuestionMap = localStorage.getItem(STORAGE_KEYS.teamQuestionMap);
      if (savedTeamQuestionMap) {
        setTeamQuestionMap(JSON.parse(savedTeamQuestionMap));
      }
    } catch (error) {}

    try {
      const savedTeams = localStorage.getItem(STORAGE_KEYS.teams);
      if (savedTeams) {
        setTeams(JSON.parse(savedTeams));
      }
    } catch (error) {}

    try {
      const savedCurrentTurn = localStorage.getItem(STORAGE_KEYS.currentTurn);
      if (savedCurrentTurn) {
        setCurrentTurn(savedCurrentTurn);
      }
    } catch (error) {}
  }, []);

  // حفظ البيانات في localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.usedQuestions, JSON.stringify([...usedQuestions]));
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

  // فحص انتهاء اللعبة عند تغيير خريطة الأسئلة
  useEffect(() => {
    // فقط تحقق من انتهاء اللعبة إذا لم يكن هناك سؤال مفتوح
    if (!currentQuestion) {
      checkGameEnd();
    }
  }, [teamQuestionMap, currentQuestion]);

  // تحميل بيانات لايفات عبسي
  useEffect(() => {
    const absi = sampleTopics.find(topic => topic.id === 'absi');
    if (absi) {
      setAbsiTopic(absi);
      
      // إعداد خريطة الأسئلة إذا لم تكن موجودة
      setTeamQuestionMap(prev => {
        if (!prev['absi']) {
          return {
            ...prev,
            'absi': {
              red: { easy: false, medium: false, hard: false },
              blue: { easy: false, medium: false, hard: false }
            }
          };
        }
        return prev;
      });
    }
  }, []);

  // Timer Effect
  useEffect(() => {
    if (timerActive) {
      const interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
      setTimerInterval(interval);
    } else {
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerActive]);

  // دوال التحكم بالتوقيت
  const toggleTimer = () => setTimerActive(!timerActive);
  const resetTimer = () => {
    setTimer(0);
    setTimerActive(false);
  };

  // تحويل الثواني إلى تنسيق mm:ss
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // اختيار سؤال عشوائي
  const selectRandomQuestion = (team, difficulty) => {
    if (!absiTopic) return;

    // التحقق من أن الدور للفريق الصحيح
    if (team !== currentTurn) {
      alert(`ليس دور الفريق ${team === 'red' ? 'الأحمر' : 'الأزرق'} الآن!`);
      return;
    }

    // التحقق من وجود سؤال مفتوح
    if (currentQuestion) {
      alert(`يجب الانتهاء من السؤال الحالي أولاً!`);
      return;
    }

    // التحقق من أن الفريق لم يجب على هذا المستوى من قبل
    const hasTeamUsedThisLevel = teamQuestionMap['absi']?.[team]?.[difficulty] === true;
    if (hasTeamUsedThisLevel) {
      alert(`الفريق ${team === 'red' ? 'الأحمر' : 'الأزرق'} أجاب على سؤال ${difficulty === 'easy' ? 'سهل' : difficulty === 'medium' ? 'متوسط' : 'صعب'} من قبل!`);
      return;
    }

    // تصفية الأسئلة المتاحة (غير المستخدمة نهائياً)
    const availableQuestions = absiTopic.questions.filter(q => 
      q.difficulty === difficulty && !usedQuestions.has(q.id)
    );

    if (availableQuestions.length === 0) {
      alert(`لا توجد أسئلة ${difficulty === 'easy' ? 'سهلة' : difficulty === 'medium' ? 'متوسطة' : 'صعبة'} متاحة! جميع الأسئلة تم استخدامها من قبل.`);
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selectedQuestion = availableQuestions[randomIndex];
    
    setCurrentQuestion({...selectedQuestion, team, difficulty});
    setShowAnswer(false);
  };

  // عرض الإجابة
  const showQuestionAnswer = () => {
    setShowAnswer(true);
  };

  // إغلاق السؤال بدون تغيير الدور (للاستخدام الداخلي)
  const closeQuestionOnly = () => {
    if (currentQuestion) {
      // إضافة السؤال للأسئلة المستخدمة نهائياً (لا يتكرر أبداً)
      setUsedQuestions(prev => new Set([...prev, currentQuestion.id]));
      
      // تحديث خريطة الأسئلة للجلسة الحالية
      setTeamQuestionMap(prev => {
        const newMap = { ...prev };
        if (!newMap['absi']) {
          newMap['absi'] = {
            red: { easy: false, medium: false, hard: false },
            blue: { easy: false, medium: false, hard: false }
          };
        }
        newMap['absi'][currentQuestion.team][currentQuestion.difficulty] = true;
        return newMap;
      });
    }
    setCurrentQuestion(null);
    setShowAnswer(false);
  };

  // إغلاق السؤال مع تغيير الدور (للإجابة الخاطئة)
  const closeQuestion = () => {
    closeQuestionOnly();
    // تغيير الدور عند الإجابة الخاطئة أو إغلاق السؤال
    setCurrentTurn(currentTurn === 'red' ? 'blue' : 'red');
  };

  // إضافة نقاط
  const addPoints = (points) => {
    const questionTeam = currentQuestion.team;
    setTeams(prevTeams => 
      prevTeams.map(team => 
        team.color === questionTeam 
          ? { ...team, score: team.score + points }
          : team
      )
    );
    closeQuestionOnly(); 
    // تغيير الدور بعد كل سؤال
    setCurrentTurn(currentTurn === 'red' ? 'blue' : 'red');
  };

  // إعادة تعيين اللعبة (بدون مسح الأسئلة المستخدمة نهائياً)
  const resetGame = () => {
    setTeams([
      { name: 'الفريق الأحمر', color: 'red', score: 0 },
      { name: 'الفريق الأزرق', color: 'blue', score: 0 }
    ]);
    // فقط إعادة تعيين خريطة الأسئلة للجلسة الجديدة (لا نمسح usedQuestions)
    setTeamQuestionMap({});
    setCurrentQuestion(null);
    setShowAnswer(false);
    setCurrentTurn('red');
    setGameFinished(false);
    setShowConfirmReset(false);
    resetTimer();
    
    // مسح localStorage للجلسة الحالية فقط (نحتفظ بـ usedQuestions)
    try {
      localStorage.removeItem(STORAGE_KEYS.teamQuestionMap);
      localStorage.removeItem(STORAGE_KEYS.teams);
      localStorage.removeItem(STORAGE_KEYS.currentTurn);
      // 🚫 لا نمسح STORAGE_KEYS.usedQuestions نهائياً
    } catch (error) {}
  };

  // حساب الأسئلة المتاحة (غير المستخدمة نهائياً) 
  const getAvailableCount = (team, difficulty) => {
    if (!absiTopic) return 0;
    
    // إذا لم تكن الخريطة موجودة بعد، كل الأسئلة متاحة
    if (!teamQuestionMap['absi'] || !teamQuestionMap['absi'][team]) {
      // حساب الأسئلة المتاحة لهذا المستوى (غير المستخدمة نهائياً)
      const availableQuestions = absiTopic.questions.filter(q => 
        q.difficulty === difficulty && !usedQuestions.has(q.id)
      );
      return availableQuestions.length > 0 ? 1 : 0;
    }
    
    // إذا كان هناك سؤال مفتوح حالياً لنفس الفريق والمستوى، لا يمكن اختيار سؤال آخر
    if (currentQuestion && currentQuestion.team === team && currentQuestion.difficulty === difficulty) {
      return 0;
    }
    
    // كل فريق له سؤال واحد فقط من كل فئة في الجلسة الحالية
    const hasTeamUsedThisLevel = teamQuestionMap['absi'][team][difficulty] === true;
    if (hasTeamUsedThisLevel) return 0;
    
    // التحقق من وجود أسئلة متاحة لهذا المستوى (غير مستخدمة نهائياً)
    const availableQuestions = absiTopic.questions.filter(q => 
      q.difficulty === difficulty && !usedQuestions.has(q.id)
    );
    return availableQuestions.length > 0 ? 1 : 0;
  };

  // دالة لمسح جميع الأسئلة المستخدمة (للإدارة)
  const clearAllUsedQuestions = () => {
    if (confirm('هل أنت متأكد من مسح جميع الأسئلة المستخدمة؟ هذا سيجعل جميع الأسئلة متاحة مرة أخرى.')) {
      setUsedQuestions(new Set());
      try {
        localStorage.removeItem(STORAGE_KEYS.usedQuestions);
      } catch (error) {}
      alert('تم مسح جميع الأسئلة المستخدمة!');
    }
  };

  // فحص انتهاء اللعبة (6 أسئلة إجمالية)
  const checkGameEnd = () => {
    if (!teamQuestionMap['absi']) return;
    
    // التأكد من أن كل فريق أجاب على سؤال واحد من كل فئة
    const redEasy = teamQuestionMap['absi']['red']['easy'] === true;
    const redMedium = teamQuestionMap['absi']['red']['medium'] === true;
    const redHard = teamQuestionMap['absi']['red']['hard'] === true;
    
    const blueEasy = teamQuestionMap['absi']['blue']['easy'] === true;
    const blueMedium = teamQuestionMap['absi']['blue']['medium'] === true;
    const blueHard = teamQuestionMap['absi']['blue']['hard'] === true;
    
    const redTeamCompleted = redEasy && redMedium && redHard;
    const blueTeamCompleted = blueEasy && blueMedium && blueHard;
    
    // اللعبة تنتهي فقط عندما يكمل كلا الفريقين جميع أسئلتهم (6 أسئلة)
    if (redTeamCompleted && blueTeamCompleted) {
      setGameFinished(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      <ToastNotification />
      
      {/* شاشة النتيجة النهائية */}
      {gameFinished && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full p-8 text-center">
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4"> انتهت اللعبة!</h1>
            </div>

            {/* النتيجة النهائية */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className={`p-6 rounded-2xl text-center ${
                teams[0].score > teams[1].score 
                  ? 'bg-gradient-to-br from-green-500 to-emerald-500 ring-4 ring-green-400/50' 
                  : teams[0].score < teams[1].score
                    ? 'bg-gradient-to-br from-red-500/70 to-pink-500/70'
                    : 'bg-gradient-to-br from-yellow-500 to-orange-500'
              }`}>
                <h2 className="text-xl font-bold text-white mb-2">{teams[0].name}</h2>
                <p className="text-4xl font-bold text-white">{teams[0].score}</p>
                {teams[0].score > teams[1].score && (
                  <div className="text-sm text-green-100 mt-2">🏆 الفائز!</div>
                )}
              </div>
              
              <div className={`p-6 rounded-2xl text-center ${
                teams[1].score > teams[0].score 
                  ? 'bg-gradient-to-br from-green-500 to-emerald-500 ring-4 ring-green-400/50' 
                  : teams[1].score < teams[0].score
                    ? 'bg-gradient-to-br from-blue-500/70 to-indigo-500/70'
                    : 'bg-gradient-to-br from-yellow-500 to-orange-500'
              }`}>
                <h2 className="text-xl font-bold text-white mb-2">{teams[1].name}</h2>
                <p className="text-4xl font-bold text-white">{teams[1].score}</p>
                {teams[1].score > teams[0].score && (
                  <div className="text-sm text-green-100 mt-2">🏆 الفائز!</div>
                )}
              </div>
            </div>

            {/* إعلان النتيجة */}
            <div className="mb-8">
              {teams[0].score === teams[1].score ? (
                <div className="text-2xl font-bold text-yellow-400">🤝 تعادل!</div>
              ) : (
                <div className="text-2xl font-bold text-green-400">
                  🎉 {teams[0].score > teams[1].score ? teams[0].name : teams[1].name} يفوز!
                </div>
              )}
            </div>

            {/* أزرار العمل */}
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button
                onClick={resetGame}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
              >
                🎮 لعبة جديدة
              </button>
              <Link 
                href="/"
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 text-center"
              >
                🏠 العودة للرئيسية
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* باقي المحتوى */}
      {/* خلفية متحركة */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 p-4 md:p-8">
        {/* Header */}
        {/* <div className="flex justify-between items-center mb-8">
          <div className="text-2xl md:text-3xl font-black text-white tracking-wider">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
               لايفات عبسي
            </span>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/full-match"
              className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 font-semibold hover:bg-green-500/30 transition-all duration-300"
            >
              المباراة الكاملة
            </Link>
            <Link 
              href="/" 
              className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              ← العودة للرئيسية
            </Link>
          </div>
        </div> */}

        {/* شريط التحكم */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-b border-slate-700 p-3">

                <div className="text-center">
            <div className={`inline-flex items-center px-4 md:px-8 py-2 md:py-4 rounded-2xl font-bold text-lg md:text-2xl shadow-lg transition-all duration-500 ${
              currentTurn === 'red' 
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-red-500/25' 
                : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-blue-500/25'
            }`}>
              
              <div className="flex flex-col items-center">
                <span className="text-sm md:text-base opacity-90">دور</span>
                <span>{currentTurn === 'red' ? 'الفريق الأحمر' : 'الفريق الأزرق'}</span>
              </div>

              <div className="mx-4 md:mx-8 flex flex-col items-center">
                <div className="text-2xl md:text-3xl font-mono font-bold px-3 py-1 rounded-lg bg-black/30 text-white">
                  {formatTime(timer)}
                </div>
                
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={toggleTimer}
                    className={`px-2 md:px-3 py-1 rounded-md text-xs md:text-sm font-bold transition-all duration-300 ${
                      timerActive 
                        ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {timerActive ? '⏸️ إيقاف' : '▶️ تشغيل'}
                  </button>
                  <button
                    onClick={resetTimer}
                    className="px-2 md:px-3 py-1 rounded-md text-xs md:text-sm font-bold bg-slate-600 hover:bg-slate-700 text-white transition-all duration-300"
                  >
                    🔄 إعادة
                  </button>
                </div>
              </div>

            </div>
          </div>
          
        </div>

        {/* نقاط الفرق */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6 mb-8 mt-32">
          <div className={`p-4 md:p-6 rounded-2xl text-center transition-all duration-500 ${
            currentTurn === 'red'
              ? 'bg-gradient-to-br from-red-500 to-pink-500 shadow-2xl shadow-red-500/25 ring-4 ring-red-400/50 scale-105'
              : 'bg-gradient-to-br from-red-500/70 to-pink-500/70 shadow-lg opacity-75'
          }`}>
            <h2 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2">{teams[0].name}</h2>
            <p className="text-3xl md:text-5xl font-bold text-white">{teams[0].score}</p>
            {currentTurn === 'red' && (
              <div className="text-sm text-red-100 mt-2 animate-pulse">الدور الآن ←</div>
            )}
          </div>
          <div className={`p-4 md:p-6 rounded-2xl text-center transition-all duration-500 ${
            currentTurn === 'blue'
              ? 'bg-gradient-to-br from-blue-500 to-indigo-500 shadow-2xl shadow-blue-500/25 ring-4 ring-blue-400/50 scale-105'
              : 'bg-gradient-to-br from-blue-500/70 to-indigo-500/70 shadow-lg opacity-75'
          }`}>
            <h2 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2">{teams[1].name}</h2>
            <p className="text-3xl md:text-5xl font-bold text-white">{teams[1].score}</p>
            {currentTurn === 'blue' && (
              <div className="text-sm text-blue-100 mt-2 animate-pulse">الدور الآن ←</div>
            )}
          </div>
        </div>

        {/* شبكة الأسئلة - مقسمة بين الفريقين */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-8">
            
            {/* عنوان فقرة لايفات عبسي */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white"> لايفات عبسي</h2>
            </div>

            {/* شبكة الأسئلة */}
            <div className="grid grid-cols-2 gap-8">
              
              {/* الفريق الأحمر - اليسار */}
              <div className="space-y-4">
                <div className={`flex items-center justify-center mb-4 transition-all duration-300 ${
                  currentTurn === 'red' ? 'scale-110' : 'opacity-60'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 transition-all duration-300 ${
                    currentTurn === 'red' ? 'bg-red-500 animate-pulse' : 'bg-red-500/50'
                  }`}>
                    <span className="text-white text-sm">●</span>
                  </div>
                  <span className={`font-bold text-lg transition-all duration-300 ${
                    currentTurn === 'red' ? 'text-red-400' : 'text-red-400/50'
                  }`}>أحمر</span>
                  {currentTurn === 'red' && (
                    <span className="ml-2 text-red-400 text-sm animate-bounce">← الدور الآن</span>
                  )}
                </div>
                
                {/* أسئلة الفريق الأحمر */}
                <button
                  onClick={() => selectRandomQuestion('red', 'easy')}
                  disabled={getAvailableCount('red', 'easy') === 0 || currentTurn !== 'red'}
                  className={`w-full p-4 rounded-2xl text-center transition-all duration-300 ${
                    getAvailableCount('red', 'easy') > 0 && currentTurn === 'red'
                      ? 'bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 shadow-lg hover:scale-105 border border-white/20'
                      : 'bg-gray-600/30 cursor-not-allowed opacity-50'
                  }`}>
                  <div className="text-white">
                    <div className="text-2xl font-bold mb-1">200</div>
                    <div className="text-sm font-semibold">سهل</div>
                    <div className="text-xs opacity-75 mt-1">
                      {getAvailableCount('red', 'easy') > 0 ? 'متاح' : 
                       teamQuestionMap['absi']?.['red']?.['easy'] ? 'مُجاب عليه' : 'لا توجد أسئلة'}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => selectRandomQuestion('red', 'medium')}
                  disabled={getAvailableCount('red', 'medium') === 0 || currentTurn !== 'red'}
                  className={`w-full p-4 rounded-2xl text-center transition-all duration-300 ${
                    getAvailableCount('red', 'medium') > 0 && currentTurn === 'red'
                      ? 'bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 shadow-lg hover:scale-105 border border-white/20'
                      : 'bg-gray-600/30 cursor-not-allowed opacity-50'
                  }`}>
                  <div className="text-white">
                    <div className="text-2xl font-bold mb-1">400</div>
                    <div className="text-sm font-semibold">متوسط</div>
                    <div className="text-xs opacity-75 mt-1">
                      {getAvailableCount('red', 'medium') > 0 ? 'متاح' : 
                       teamQuestionMap['absi']?.['red']?.['medium'] ? 'مُجاب عليه' : 'لا توجد أسئلة'}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => selectRandomQuestion('red', 'hard')}
                  disabled={getAvailableCount('red', 'hard') === 0 || currentTurn !== 'red'}
                  className={`w-full p-4 rounded-2xl text-center transition-all duration-300 ${
                    getAvailableCount('red', 'hard') > 0 && currentTurn === 'red'
                      ? 'bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 shadow-lg hover:scale-105 border border-white/20'
                      : 'bg-gray-600/30 cursor-not-allowed opacity-50'
                  }`}>
                  <div className="text-white">
                    <div className="text-2xl font-bold mb-1">600</div>
                    <div className="text-sm font-semibold">صعب</div>
                    <div className="text-xs opacity-75 mt-1">
                      {getAvailableCount('red', 'hard') > 0 ? 'متاح' : 
                       teamQuestionMap['absi']?.['red']?.['hard'] ? 'مُجاب عليه' : 'لا توجد أسئلة'}
                    </div>
                  </div>
                </button>
              </div>

              {/* الفريق الأزرق - اليمين */}
              <div className="space-y-4">
                <div className={`flex items-center justify-center mb-4 transition-all duration-300 ${
                  currentTurn === 'blue' ? 'scale-110' : 'opacity-60'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 transition-all duration-300 ${
                    currentTurn === 'blue' ? 'bg-blue-500 animate-pulse' : 'bg-blue-500/50'
                  }`}>
                    <span className="text-white text-sm">●</span>
                  </div>
                  <span className={`font-bold text-lg transition-all duration-300 ${
                    currentTurn === 'blue' ? 'text-blue-400' : 'text-blue-400/50'
                  }`}>أزرق</span>
                  {currentTurn === 'blue' && (
                    <span className="ml-2 text-blue-400 text-sm animate-bounce">← الدور الآن</span>
                  )}
                </div>
                
                {/* أسئلة الفريق الأزرق */}
                <button
                  onClick={() => selectRandomQuestion('blue', 'easy')}
                  disabled={getAvailableCount('blue', 'easy') === 0 || currentTurn !== 'blue'}
                  className={`w-full p-4 rounded-2xl text-center transition-all duration-300 ${
                    getAvailableCount('blue', 'easy') > 0 && currentTurn === 'blue'
                      ? 'bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 shadow-lg hover:scale-105 border border-white/20'
                      : 'bg-gray-600/30 cursor-not-allowed opacity-50'
                  }`}>
                  <div className="text-white">
                    <div className="text-2xl font-bold mb-1">200</div>
                    <div className="text-sm font-semibold">سهل</div>
                    <div className="text-xs opacity-75 mt-1">
                      {getAvailableCount('blue', 'easy') > 0 ? 'متاح' : 
                       teamQuestionMap['absi']?.['blue']?.['easy'] ? 'مُجاب عليه' : 'لا توجد أسئلة'}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => selectRandomQuestion('blue', 'medium')}
                  disabled={getAvailableCount('blue', 'medium') === 0 || currentTurn !== 'blue'}
                  className={`w-full p-4 rounded-2xl text-center transition-all duration-300 ${
                    getAvailableCount('blue', 'medium') > 0 && currentTurn === 'blue'
                      ? 'bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 shadow-lg hover:scale-105 border border-white/20'
                      : 'bg-gray-600/30 cursor-not-allowed opacity-50'
                  }`}>
                  <div className="text-white">
                    <div className="text-2xl font-bold mb-1">400</div>
                    <div className="text-sm font-semibold">متوسط</div>
                    <div className="text-xs opacity-75 mt-1">
                      {getAvailableCount('blue', 'medium') > 0 ? 'متاح' : 
                       teamQuestionMap['absi']?.['blue']?.['medium'] ? 'مُجاب عليه' : 'لا توجد أسئلة'}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => selectRandomQuestion('blue', 'hard')}
                  disabled={getAvailableCount('blue', 'hard') === 0 || currentTurn !== 'blue'}
                  className={`w-full p-4 rounded-2xl text-center transition-all duration-300 ${
                    getAvailableCount('blue', 'hard') > 0 && currentTurn === 'blue'
                      ? 'bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 shadow-lg hover:scale-105 border border-white/20'
                      : 'bg-gray-600/30 cursor-not-allowed opacity-50'
                  }`}>
                  <div className="text-white">
                    <div className="text-2xl font-bold mb-1">600</div>
                    <div className="text-sm font-semibold">صعب</div>
                    <div className="text-xs opacity-75 mt-1">
                      {getAvailableCount('blue', 'hard') > 0 ? 'متاح' : 
                       teamQuestionMap['absi']?.['blue']?.['hard'] ? 'مُجاب عليه' : 'لا توجد أسئلة'}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* زر إعادة التعيين وتغيير الدور */}
          {/* <div className="text-center space-y-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-4">
              <h3 className="text-lg font-bold text-blue-400 mb-2">📊 إحصائيات الأسئلة</h3>
              <div className="text-sm text-gray-300">
                <div>أسئلة مستخدمة نهائياً: <span className="text-red-400 font-bold">{usedQuestions.size}</span></div>
                <div>أسئلة متاحة: <span className="text-green-400 font-bold">{absiTopic ? absiTopic.questions.length - usedQuestions.size : 0}</span></div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setCurrentTurn(currentTurn === 'red' ? 'blue' : 'red')}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-bold text-sm shadow-lg transition-all duration-300 hover:scale-105"
              >
                🔄 تغيير الدور
              </button>
              
              <button
                onClick={() => setShowConfirmReset(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl font-bold text-md shadow-lg transition-all duration-300 hover:scale-105"
              >
                🔄 لعبة جديدة
              </button>
              
              <button
                onClick={clearAllUsedQuestions}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl font-bold text-sm shadow-lg transition-all duration-300 hover:scale-105"
              >
                🗑️ مسح الأسئلة المحفوظة
              </button>
            </div>
          </div> */}
        </div>

        {/* نافذة السؤال */}
        {currentQuestion && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 md:p-8">
                
                {/* عنوان السؤال */}
                <div className="text-center mb-6">
                  <div className="inline-block px-6 py-3 rounded-2xl font-bold text-xl bg-slate-600 text-white">
                    {currentQuestion.points} نقطة - {currentQuestion.difficulty === 'easy' ? 'سهل' : currentQuestion.difficulty === 'medium' ? 'متوسط' : 'صعب'}
                  </div>
                  <div className={`inline-block px-4 py-2 rounded-xl font-semibold text-sm mt-2 ${
                    currentQuestion.team === 'red' ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    الفريق {currentQuestion.team === 'red' ? 'الأحمر' : 'الأزرق'}
                  </div>
                </div>

                {/* السؤال */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-4xl font-bold text-white mb-6">
                    {currentQuestion.question}
                  </h2>
                  
                  {/* محتوى السؤال مع الوسائط */}
                  {currentQuestion.hasImage && currentQuestion.imageUrl && (
                    <div className="mb-6">
                      <img 
                        src={currentQuestion.imageUrl} 
                        alt="صورة السؤال"
                        className="max-w-full max-h-96 mx-auto rounded-2xl shadow-lg cursor-pointer hover:scale-105 transition-transform duration-300"
                        onClick={() => setZoomedImage(currentQuestion.imageUrl)}
                      />
                    </div>
                  )}

                  {/* فيديو السؤال */}
                  {currentQuestion.hasVideo && currentQuestion.videoUrl && (
                    <div className="mb-6">
                      <video 
                        controls 
                        className="max-w-full max-h-96 mx-auto rounded-2xl shadow-lg"
                        preload="metadata"
                      >
                        <source src={currentQuestion.videoUrl} type="video/mp4" />
                        المتصفح لا يدعم تشغيل الفيديو.
                      </video>
                    </div>
                  )}

                  {/* صوت السؤال */}
                  {currentQuestion.hasAudio && currentQuestion.audioUrl && (
                    <div className="mb-6">
                      <div className="bg-slate-700 rounded-2xl p-4">
                        <div className="flex items-center justify-center mb-3">
                          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.82L6.02 14.68H4a1 1 0 01-1-1V6.32a1 1 0 011-1h2.02l2.383-2.12z" clipRule="evenodd"/>
                              <path d="M14.657 2.343a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.983 5.983 0 01-1.757 4.243 1 1 0 01-1.415-1.414A3.984 3.984 0 0013 10a3.984 3.984 0 00-1.172-2.828 1 1 0 010-1.415z"/>
                            </svg>
                          </div>
                        </div>
                        <audio 
                          controls 
                          className="w-full"
                          preload="metadata"
                        >
                          <source src={currentQuestion.audioUrl} type="audio/mpeg" />
                          <source src={currentQuestion.audioUrl} type="audio/wav" />
                          المتصفح لا يدعم تشغيل الصوت.
                        </audio>
                      </div>
                    </div>
                  )}
                </div>

                {/* الإجابة */}
                {showAnswer && (
                  <div className="text-center mb-8">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 shadow-lg">
                      <h3 className="text-xl md:text-3xl font-bold text-white">
                        {currentQuestion.answer}
                      </h3>
                    </div>
                  </div>
                )}

                {/* أزرار التحكم */}
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                  {!showAnswer ? (
                    <button
                      onClick={showQuestionAnswer}
                      className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
                    >
                      👁️ عرض الإجابة
                    </button>
                  ) : (
                    <div className="flex flex-col md:flex-row gap-4">
                      <button
                        onClick={() => addPoints(currentQuestion.points)}
                        className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
                      >
                        ✅ إجابة صحيحة (+{currentQuestion.points})
                      </button>
                      <button
                        onClick={closeQuestion}
                        className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
                      >
                        ❌ إجابة خاطئة
                      </button>
                    </div>
                  )}
                </div>

                {/* زر الإغلاق */}
                <div className="text-center mt-6">
                  <button
                    onClick={closeQuestion}
                    className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all duration-300"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* نافذة تكبير الصورة */}
        <ImageModal 
          image={zoomedImage} 
          onClose={() => setZoomedImage(null)} 
        />

        {/* نافذة تأكيد إعادة التعيين */}
        <ConfirmModal
          isOpen={showConfirmReset}
          title="إعادة تعيين اللعبة"
          message="هل أنت متأكد من إعادة تعيين جميع النقاط والأسئلة؟"
          onConfirm={resetGame}
          onCancel={() => setShowConfirmReset(false)}
        />
      </div>
    </div>
  );
}