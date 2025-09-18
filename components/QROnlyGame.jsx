// components/QROnlyGame.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { sampleTopics } from '../app/data/gameData';
import { ImageModal, ConfirmModal } from './Modals';
import ToastNotification, { showSuccessToast, showErrorToast, showWarningToast, showInfoToast } from './ToastNotification';

export default function QROnlyGame() {
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
  const [qrTopic, setQrTopic] = useState(null);
  const [usedQuestions, setUsedQuestions] = useState(new Set()); // Set بسيط لجميع الأسئلة المستخدمة
  const [teamQuestionMap, setTeamQuestionMap] = useState({});

  // Local Storage Keys
  const STORAGE_KEYS = {
    usedQuestions: 'qr-game-used-questions-global',
    teamQuestionMap: 'qr-game-team-question-map',
    teams: 'qr-game-teams',
    currentTurn: 'qr-game-current-turn'
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

  // تحميل بيانات QR
  useEffect(() => {
    const qr = sampleTopics.find(topic => topic.id === 'qr_game');
    if (qr) {
      setQrTopic(qr);
      console.log(' تم تحميل بيانات QR:', qr.questions.length, 'سؤال');
    }
  }, []);

  // إعداد خريطة الأسئلة عند تحميل البيانات
  useEffect(() => {
    if (qrTopic && Object.keys(teamQuestionMap).length === 0) {
      const questionMap = {};
      questionMap['qr_game'] = {
        red: { easy: false, medium: false, hard: false },
        blue: { easy: false, medium: false, hard: false }
      };
      setTeamQuestionMap(questionMap);
    }
  }, [qrTopic, teamQuestionMap]);

  // فحص انتهاء اللعبة عند تغيير خريطة الأسئلة
  useEffect(() => {
    // فقط تحقق من انتهاء اللعبة إذا لم يكن هناك سؤال مفتوح
    if (!currentQuestion) {
      checkGameEnd();
    }
  }, [teamQuestionMap, currentQuestion]);

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
  const startTimer = () => setTimerActive(true);
  const stopTimer = () => setTimerActive(false);

  // تحويل الثواني إلى تنسيق mm:ss
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // اختيار سؤال لفريق ومستوى محدد
  const selectQuestionForTeam = (team, difficulty) => {
    if (!qrTopic) return;
    
    // التأكد من أن الدور للفريق الصحيح
    if (team !== currentTurn) {
      showWarningToast(`الدور الآن للفريق ${currentTurn === 'red' ? 'الأحمر' : 'الأزرق'}!`);
      return;
    }

    // التحقق من عدم وجود سؤال مفتوح حالياً
    if (currentQuestion) {
      showWarningToast('يوجد سؤال مفتوح حالياً! يرجى إنهاؤه أولاً.');
      return;
    }

    // التحقق من عدم استخدام هذا المستوى من قبل هذا الفريق
    const hasTeamUsedThisLevel = teamQuestionMap['qr_game']?.[team]?.[difficulty] === true;
    if (hasTeamUsedThisLevel) {
      showErrorToast(`الفريق ${team === 'red' ? 'الأحمر' : 'الأزرق'} أجاب على سؤال ${difficulty === 'easy' ? 'سهل' : difficulty === 'medium' ? 'متوسط' : 'صعب'} من قبل!`);
      return;
    }

    // تصفية الأسئلة المتاحة (غير المستخدمة نهائياً)
    const availableQuestions = qrTopic.questions.filter(q => 
      q.difficulty === difficulty && !usedQuestions.has(q.id)
    );

    if (availableQuestions.length === 0) {
      showErrorToast(`لا توجد أسئلة ${difficulty === 'easy' ? 'سهلة' : difficulty === 'medium' ? 'متوسطة' : 'صعبة'} متاحة! جميع الأسئلة تم استخدامها من قبل.`);
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selectedQuestion = availableQuestions[randomIndex];
    
    setCurrentQuestion({...selectedQuestion, team, difficulty});
    setShowAnswer(false);
    
    const teamName = team === 'red' ? 'الأحمر' : 'الأزرق';
    showInfoToast(` سؤال ${difficulty === 'easy' ? 'سهل' : difficulty === 'medium' ? 'متوسط' : 'صعب'} للفريق ${teamName}`);
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
        if (!newMap['qr_game']) {
          newMap['qr_game'] = {
            red: { easy: false, medium: false, hard: false },
            blue: { easy: false, medium: false, hard: false }
          };
        }
        newMap['qr_game'][currentQuestion.team][currentQuestion.difficulty] = true;
        return newMap;
      });
    }
    setCurrentQuestion(null);
    setShowAnswer(false);
  };

  // إغلاق السؤال مع تغيير الدور (للإجابة الخاطئة)
  const closeQuestion = () => {
    const teamName = currentQuestion.team === 'red' ? 'الأحمر' : 'الأزرق';
    showErrorToast(` إجابة خاطئة للفريق ${teamName}`);
    
    closeQuestionOnly();
    // تغيير الدور عند الإجابة الخاطئة أو إغلاق السؤال
    setCurrentTurn(currentTurn === 'red' ? 'blue' : 'red');
  };

  // إضافة نقاط
  const addPoints = (points) => {
    const questionTeam = currentQuestion.team;
    const teamName = questionTeam === 'red' ? 'الأحمر' : 'الأزرق';
    
    setTeams(prevTeams => 
      prevTeams.map(team => 
        team.color === questionTeam 
          ? { ...team, score: team.score + points }
          : team
      )
    );
    
    showSuccessToast(` إجابة صحيحة! الفريق ${teamName} حصل على ${points} نقطة`);
    
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
    
    showInfoToast('🔄 تم بدء لعبة جديدة!');
  };

  // حساب الأسئلة المتاحة (غير المستخدمة نهائياً) 
  const getAvailableCount = (team, difficulty) => {
    if (!qrTopic) return 0;
    
    // إذا لم تكن الخريطة موجودة بعد، كل الأسئلة متاحة
    if (!teamQuestionMap['qr_game'] || !teamQuestionMap['qr_game'][team]) {
      // حساب الأسئلة المتاحة لهذا المستوى (غير المستخدمة نهائياً)
      const availableQuestions = qrTopic.questions.filter(q => 
        q.difficulty === difficulty && !usedQuestions.has(q.id)
      );
      return availableQuestions.length > 0 ? 1 : 0;
    }
    
    // إذا كان هناك سؤال مفتوح حالياً لنفس الفريق والمستوى، لا يمكن اختيار سؤال آخر
    if (currentQuestion && currentQuestion.team === team && currentQuestion.difficulty === difficulty) {
      return 0;
    }
    
    // كل فريق له سؤال واحد فقط من كل فئة في الجلسة الحالية
    const hasTeamUsedThisLevel = teamQuestionMap['qr_game'][team][difficulty] === true;
    if (hasTeamUsedThisLevel) return 0;
    
    // التحقق من وجود أسئلة متاحة لهذا المستوى (غير مستخدمة نهائياً)
    const availableQuestions = qrTopic.questions.filter(q => 
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
      showSuccessToast('تم مسح جميع الأسئلة المستخدمة!');
    }
  };

  // فحص انتهاء اللعبة (6 أسئلة إجمالية)
  const checkGameEnd = () => {
    if (!teamQuestionMap['qr_game']) return;
    
    // التأكد من أن كل فريق أجاب على سؤال واحد من كل فئة
    const redEasy = teamQuestionMap['qr_game']['red']['easy'] === true;
    const redMedium = teamQuestionMap['qr_game']['red']['medium'] === true;
    const redHard = teamQuestionMap['qr_game']['red']['hard'] === true;
    
    const blueEasy = teamQuestionMap['qr_game']['blue']['easy'] === true;
    const blueMedium = teamQuestionMap['qr_game']['blue']['medium'] === true;
    const blueHard = teamQuestionMap['qr_game']['blue']['hard'] === true;
    
    const redTeamCompleted = redEasy && redMedium && redHard;
    const blueTeamCompleted = blueEasy && blueMedium && blueHard;
    
    // اللعبة تنتهي فقط عندما يكمل كلا الفريقين جميع أسئلتهم (6 أسئلة)
    if (redTeamCompleted && blueTeamCompleted) {
      setGameFinished(true);
      showSuccessToast('🏁 انتهت اللعبة! تم الانتهاء من جميع الأسئلة');
    }
  };

  // دالة تكبير الصورة
  const zoomImage = (imageUrl) => {
    setZoomedImage(imageUrl);
  };

  const closeZoomedImage = () => {
    setZoomedImage(null);
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

            {/* أزرار العمل */}
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105"
              >
                🔄 لعبة جديدة
              </button>
              
              <Link href="/">
                <button className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105">
                  🏠 العودة للرئيسية
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* خلفية متحركة */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="relative z-10 p-4 md:p-6">
        {/* الشريط العلوي */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <Link href="/">
            <button className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105">
              ← العودة للرئيسية
            </button>
          </Link>

          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">🔍 ولا كلمة</h1>
            <p className="text-gray-400">امسح QR  </p>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-2">
            <div className="px-4 py-2 bg-slate-800 rounded-xl border border-slate-600">
              <span className="text-white font-mono text-lg">{formatTime(timer)}</span>
            </div>
            <button
              onClick={toggleTimer}
              className={`px-3 py-2 rounded-xl font-bold text-sm shadow-lg transition-all duration-300 hover:scale-105 ${
                timerActive 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {timerActive ? '⏸️' : '▶️'}
            </button>
          </div>
        </div>

        {/* نتائج الفرق */}
        <div className="grid grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
          <div className={`p-6 rounded-2xl text-center transition-all duration-500 ${
            currentTurn === 'red'
              ? 'bg-gradient-to-br from-red-500 to-pink-500 shadow-2xl shadow-red-500/25 ring-4 ring-red-400/50'
              : 'bg-gradient-to-br from-red-500/70 to-pink-500/70 shadow-lg'
          }`}>
            <h2 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2">{teams[0].name}</h2>
            <p className="text-3xl md:text-5xl font-bold text-white">{teams[0].score}</p>
          </div>
          <div className={`p-6 rounded-2xl text-center transition-all duration-500 ${
            currentTurn === 'blue'
              ? 'bg-gradient-to-br from-blue-500 to-indigo-500 shadow-2xl shadow-blue-500/25 ring-4 ring-blue-400/50'
              : 'bg-gradient-to-br from-blue-500/70 to-indigo-500/70 shadow-lg'
          }`}>
            <h2 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2">{teams[1].name}</h2>
            <p className="text-3xl md:text-5xl font-bold text-white">{teams[1].score}</p>
          </div>
        </div>

        {/* شبكة الأسئلة */}
        <div className="max-w-6xl mx-auto mb-8">
          {/* الفريق الأحمر */}
          <div className="mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
              <h2 className="text-xl font-bold text-red-400">
                الفريق الأحمر {currentTurn === 'red' && '← الدور الآن'}
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-4 md:gap-6">
              {/* سهل أحمر */}
              <button
                onClick={() => selectQuestionForTeam('red', 'easy')}
                disabled={getAvailableCount('red', 'easy') === 0}
                className={`p-6 md:p-8 rounded-2xl text-center transition-all duration-300 ${
                  getAvailableCount('red', 'easy') > 0 && currentTurn === 'red'
                    ? 'bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 shadow-lg hover:shadow-slate-500/30 hover:scale-105'
                    : 'bg-gray-500/50 cursor-not-allowed opacity-50'
                }`}>
                <div className="text-white">
                  <div className="text-2xl md:text-4xl font-bold mb-2">200</div>
                  <div className="text-lg font-semibold">سهل</div>
                  <div className="text-sm opacity-75 mt-1">
                    {getAvailableCount('red', 'easy') > 0 ? 
                     teamQuestionMap['qr_game']?.['red']?.['easy'] ? 'مُجاب عليه' : 'متاح' : 
                     teamQuestionMap['qr_game']?.['red']?.['easy'] ? 'مُجاب عليه' : 'لا توجد أسئلة'}
                  </div>
                </div>
              </button>

              {/* متوسط أحمر */}
              <button
                onClick={() => selectQuestionForTeam('red', 'medium')}
                disabled={getAvailableCount('red', 'medium') === 0}
                className={`p-6 md:p-8 rounded-2xl text-center transition-all duration-300 ${
                  getAvailableCount('red', 'medium') > 0 && currentTurn === 'red'
                    ? 'bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 shadow-lg hover:shadow-slate-500/30 hover:scale-105'
                    : 'bg-gray-500/50 cursor-not-allowed opacity-50'
                }`}>
                <div className="text-white">
                  <div className="text-2xl md:text-4xl font-bold mb-2">400</div>
                  <div className="text-lg font-semibold">متوسط</div>
                  <div className="text-sm opacity-75 mt-1">
                    {getAvailableCount('red', 'medium') > 0 ? 
                     teamQuestionMap['qr_game']?.['red']?.['medium'] ? 'مُجاب عليه' : 'متاح' : 
                     teamQuestionMap['qr_game']?.['red']?.['medium'] ? 'مُجاب عليه' : 'لا توجد أسئلة'}
                  </div>
                </div>
              </button>

              {/* صعب أحمر */}
              <button
                onClick={() => selectQuestionForTeam('red', 'hard')}
                disabled={getAvailableCount('red', 'hard') === 0}
                className={`p-6 md:p-8 rounded-2xl text-center transition-all duration-300 ${
                  getAvailableCount('red', 'hard') > 0 && currentTurn === 'red'
                    ? 'bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 shadow-lg hover:shadow-slate-500/30 hover:scale-105'
                    : 'bg-gray-500/50 cursor-not-allowed opacity-50'
                }`}>
                <div className="text-white">
                  <div className="text-2xl md:text-4xl font-bold mb-2">600</div>
                  <div className="text-lg font-semibold">صعب</div>
                  <div className="text-sm opacity-75 mt-1">
                    {getAvailableCount('red', 'hard') > 0 ? 
                     teamQuestionMap['qr_game']?.['red']?.['hard'] ? 'مُجاب عليه' : 'متاح' : 
                     teamQuestionMap['qr_game']?.['red']?.['hard'] ? 'مُجاب عليه' : 'لا توجد أسئلة'}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* الفريق الأزرق */}
          <div>
            <div className="flex items-center justify-center mb-4">
              <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
              <h2 className="text-xl font-bold text-blue-400">
                الفريق الأزرق {currentTurn === 'blue' && '← الدور الآن'}
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-4 md:gap-6">
              {/* سهل أزرق */}
              <button
                onClick={() => selectQuestionForTeam('blue', 'easy')}
                disabled={getAvailableCount('blue', 'easy') === 0}
                className={`p-6 md:p-8 rounded-2xl text-center transition-all duration-300 ${
                  getAvailableCount('blue', 'easy') > 0 && currentTurn === 'blue'
                    ? 'bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 shadow-lg hover:shadow-slate-500/30 hover:scale-105'
                    : 'bg-gray-500/50 cursor-not-allowed opacity-50'
                }`}>
                <div className="text-white">
                  <div className="text-2xl md:text-4xl font-bold mb-2">200</div>
                  <div className="text-lg font-semibold">سهل</div>
                  <div className="text-sm opacity-75 mt-1">
                    {getAvailableCount('blue', 'easy') > 0 ? 
                     teamQuestionMap['qr_game']?.['blue']?.['easy'] ? 'مُجاب عليه' : 'متاح' : 
                     teamQuestionMap['qr_game']?.['blue']?.['easy'] ? 'مُجاب عليه' : 'لا توجد أسئلة'}
                  </div>
                </div>
              </button>

              {/* متوسط أزرق */}
              <button
                onClick={() => selectQuestionForTeam('blue', 'medium')}
                disabled={getAvailableCount('blue', 'medium') === 0}
                className={`p-6 md:p-8 rounded-2xl text-center transition-all duration-300 ${
                  getAvailableCount('blue', 'medium') > 0 && currentTurn === 'blue'
                    ? 'bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 shadow-lg hover:shadow-slate-500/30 hover:scale-105'
                    : 'bg-gray-500/50 cursor-not-allowed opacity-50'
                }`}>
                <div className="text-white">
                  <div className="text-2xl md:text-4xl font-bold mb-2">400</div>
                  <div className="text-lg font-semibold">متوسط</div>
                  <div className="text-sm opacity-75 mt-1">
                    {getAvailableCount('blue', 'medium') > 0 ? 
                     teamQuestionMap['qr_game']?.['blue']?.['medium'] ? 'مُجاب عليه' : 'متاح' : 
                     teamQuestionMap['qr_game']?.['blue']?.['medium'] ? 'مُجاب عليه' : 'لا توجد أسئلة'}
                  </div>
                </div>
              </button>

              {/* صعب أزرق */}
              <button
                onClick={() => selectQuestionForTeam('blue', 'hard')}
                disabled={getAvailableCount('blue', 'hard') === 0}
                className={`p-6 md:p-8 rounded-2xl text-center transition-all duration-300 ${
                  getAvailableCount('blue', 'hard') > 0 && currentTurn === 'blue'
                    ? 'bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 shadow-lg hover:shadow-slate-500/30 hover:scale-105'
                    : 'bg-gray-500/50 cursor-not-allowed opacity-50'
                }`}>
                <div className="text-white">
                  <div className="text-2xl md:text-4xl font-bold mb-2">600</div>
                  <div className="text-lg font-semibold">صعب</div>
                  <div className="text-sm opacity-75 mt-1">
                    {getAvailableCount('blue', 'hard') > 0 ? 
                     teamQuestionMap['qr_game']?.['blue']?.['hard'] ? 'مُجاب عليه' : 'متاح' : 
                     teamQuestionMap['qr_game']?.['blue']?.['hard'] ? 'مُجاب عليه' : 'لا توجد أسئلة'}
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
              <div>أسئلة متاحة: <span className="text-green-400 font-bold">{qrTopic ? qrTopic.questions.length - usedQuestions.size : 0}</span></div>
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
                <p className="text-gray-400 mt-2">للفريق {currentQuestion.team === 'red' ? 'الأحمر' : 'الأزرق'}</p>
              </div>
              
              {/* QR Code */}
              {currentQuestion.hasQR && (
                <div className="flex justify-center mb-8">
                  <div className="relative group">
                    <div className="p-6 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border-4 border-blue-400/50 hover:border-blue-400 transition-all duration-300">
                      <img 
                        src={currentQuestion.qrImageUrl} 
                        alt="QR Code" 
                        className="max-w-full max-h-64 md:max-h-80 lg:max-h-96 object-contain cursor-pointer hover:scale-105 transition-transform duration-300"
                        onClick={() => zoomImage(currentQuestion.qrImageUrl)}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x300/000000/FFFFFF?text=QR+CODE';
                        }}
                      />
                      <p className="text-center mt-4 text-gray-800 font-bold">امسح الكود لرؤية السؤال</p>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300 -z-10"></div>
                  </div>
                </div>
              )}

              {/* أزرار التحكم */}
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                <button
                  onClick={showQuestionAnswer}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105"
                >
                  🔍 عرض الإجابة
                </button>
              </div>

              {/* عرض الإجابة */}
              {showAnswer && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl mb-4">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <h4 className="text-2xl font-bold text-white">الإجابة الصحيحة</h4>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-6">
                      <p className="text-2xl md:text-3xl text-white font-bold">{currentQuestion.answer}</p>
                    </div>
                    
                    {/* صورة الجواب للـ QR Code */}
                    {currentQuestion.hasQR && currentQuestion.answerImageUrl && (
                      <div className="flex justify-center">
                        <div className="relative group">
                          <img 
                            src={currentQuestion.answerImageUrl} 
                            alt="صورة الجواب" 
                            className="max-w-full max-h-48 md:max-h-64 object-contain rounded-2xl shadow-lg border-2 border-emerald-400/50 cursor-pointer hover:scale-105 transition-transform duration-300"
                            onClick={() => zoomImage(currentQuestion.answerImageUrl)}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=صورة+الجواب';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-2xl blur group-hover:blur-md transition-all duration-300 -z-10"></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* أزرار النقاط */}
                  <div className="flex flex-wrap justify-center gap-4">
                    <button
                      onClick={() => addPoints(currentQuestion.points)}
                      className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      ✅ إجابة صحيحة (+{currentQuestion.points})
                    </button>
                    
                    <button
                      onClick={closeQuestion}
                      className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      ❌ إجابة خاطئة
                    </button>
                  </div>
                </div>
              )}

              {/* زر الإغلاق */}
              {/* <div className="text-center mt-6">
                <button
                  onClick={closeQuestion}
                  className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105"
                >
                  إغلاق السؤال
                </button>
              </div> */}
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      <ImageModal zoomedImage={zoomedImage} closeZoomedImage={closeZoomedImage} />
      
      {/* Confirm Modal */}
      <ConfirmModal 
        showConfirmReset={showConfirmReset}
        setShowConfirmReset={setShowConfirmReset}
        resetGame={resetGame}
      />
    </div>
  );
}