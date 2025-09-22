// components/BettingGame.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { bettingGameData, getRandomBettingQuestion, BETTING_GAME_CONFIG } from '../app/data/bettingGameData';
import { ImageModal, ConfirmModal } from './Modals';
import ToastNotification, { showSuccessToast, showErrorToast, showWarningToast, showInfoToast } from './ToastNotification';

export default function BettingGame() {
  // حالة اللعبة
  const [gamePhase, setGamePhase] = useState('betting'); // betting, question, finished
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [currentTurn, setCurrentTurn] = useState('red');
  
  // حالة الفرق
  const [teams, setTeams] = useState([
    { name: 'الفريق الأحمر', color: 'red', score: BETTING_GAME_CONFIG.INITIAL_POINTS },
    { name: 'الفريق الأزرق', color: 'blue', score: BETTING_GAME_CONFIG.INITIAL_POINTS }
  ]);

  // حالة الرهان
  const [currentBets, setCurrentBets] = useState({
    red: null,
    blue: null
  });
  const [resultsEvaluated, setResultsEvaluated] = useState({
    red: null, // null = لم يتم التقييم، true = صحيح، false = خطأ
    blue: null
  });
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [evaluationMethod, setEvaluationMethod] = useState(null); // 'individual' أو 'both' لمنع الخلط
  
  // حالة الأسئلة
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [usedQuestions, setUsedQuestions] = useState(new Set());
  const [roundNumber, setRoundNumber] = useState(1);
  const [maxRounds] = useState(BETTING_GAME_CONFIG.MAX_ROUNDS); // 20 جولة

  // حالة أخرى
  const [zoomedImage, setZoomedImage] = useState(null);

  // Timer State
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerInterval, setTimerInterval] = useState(null);

  // Local Storage Keys
  const STORAGE_KEYS = {
    teams: 'betting-game-teams',
    currentTurn: 'betting-game-current-turn',
    roundNumber: 'betting-game-round',
    usedQuestions: 'betting-game-used-questions',
    resultsEvaluated: 'betting-game-results-evaluated',
    roundCompleted: 'betting-game-round-completed',
    evaluationMethod: 'betting-game-evaluation-method'
  };

  // تحميل البيانات من localStorage
  useEffect(() => {
    try {
      const savedTeams = localStorage.getItem(STORAGE_KEYS.teams);
      const savedTurn = localStorage.getItem(STORAGE_KEYS.currentTurn);
      const savedRound = localStorage.getItem(STORAGE_KEYS.roundNumber);
      const savedUsedQuestions = localStorage.getItem(STORAGE_KEYS.usedQuestions);
      const savedResultsEvaluated = localStorage.getItem(STORAGE_KEYS.resultsEvaluated);
      const savedRoundCompleted = localStorage.getItem(STORAGE_KEYS.roundCompleted);
      const savedEvaluationMethod = localStorage.getItem(STORAGE_KEYS.evaluationMethod);

      if (savedTeams) setTeams(JSON.parse(savedTeams));
      if (savedTurn) setCurrentTurn(savedTurn);
      if (savedRound) setRoundNumber(parseInt(savedRound));
      if (savedUsedQuestions) setUsedQuestions(new Set(JSON.parse(savedUsedQuestions)));
      if (savedResultsEvaluated) setResultsEvaluated(JSON.parse(savedResultsEvaluated));
      if (savedRoundCompleted) setRoundCompleted(JSON.parse(savedRoundCompleted));
      if (savedEvaluationMethod) setEvaluationMethod(savedEvaluationMethod);
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }, []);

  // مراقبة النقاط لإنهاء اللعبة
  useEffect(() => {
    if (roundCompleted && (teams[0].score === 0 || teams[1].score === 0 || roundNumber >= maxRounds)) {
      setTimeout(() => {
        setGamePhase('finished');
        stopTimer();
      }, 1000); // انتظار ثانية لإظهار النتيجة النهائية
    }
  }, [teams, roundCompleted, roundNumber]);

  // تحديد المواضيع المتاحة
  useEffect(() => {
    // تحويل بيانات لعبة الرهان إلى تنسيق مناسب
    const bettingTopics = Object.values(bettingGameData);
    setSelectedTopics(bettingTopics);
  }, []);

  // حفظ البيانات في localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.teams, JSON.stringify(teams));
      localStorage.setItem(STORAGE_KEYS.currentTurn, currentTurn);
      localStorage.setItem(STORAGE_KEYS.roundNumber, roundNumber.toString());
      localStorage.setItem(STORAGE_KEYS.usedQuestions, JSON.stringify(Array.from(usedQuestions)));
      localStorage.setItem(STORAGE_KEYS.resultsEvaluated, JSON.stringify(resultsEvaluated));
      localStorage.setItem(STORAGE_KEYS.roundCompleted, JSON.stringify(roundCompleted));
      localStorage.setItem(STORAGE_KEYS.evaluationMethod, evaluationMethod || '');
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, [teams, currentTurn, roundNumber, usedQuestions, resultsEvaluated, roundCompleted, evaluationMethod]);

  // Timer functions
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
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setTimerActive(false);
  };

  const resetTimer = () => {
    stopTimer();
    setTimer(0);
  };

  const toggleTimer = () => {
    if (timerActive) {
      stopTimer();
    } else {
      startTimer();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // دالة اختيار سؤال عشوائي
  const getRandomQuestion = () => {
    const usedQuestionIds = Array.from(usedQuestions);
    const randomQuestion = getRandomBettingQuestion(usedQuestionIds);
    
    if (!randomQuestion) {
      showWarningToast('انتهت جميع الأسئلة المتاحة!');
      setGamePhase('finished');
      return null;
    }

    return randomQuestion;
  };

  // دالة اختيار قيمة الرهان
  const placeBet = (team, amount) => {
    if (teams.find(t => t.color === team).score < amount) {
      showErrorToast(`${team === 'red' ? 'الفريق الأحمر' : 'الفريق الأزرق'} لا يملك نقاط كافية للرهان!`);
      return;
    }

    setCurrentBets(prev => ({
      ...prev,
      [team]: amount
    }));

    showSuccessToast(`${team === 'red' ? 'الفريق الأحمر' : 'الفريق الأزرق'} راهن بـ ${amount} نقطة!`);

    // إذا راهن كلا الفريقين، ابدأ السؤال
    const newBets = { ...currentBets, [team]: amount };
    if (newBets.red && newBets.blue) {
      const question = getRandomQuestion();
      if (question) {
        setCurrentQuestion(question);
        setGamePhase('question');
        // showInfoToast('🎯 السؤال جاهز! حظاً موفقاً للفريقين');
      }
    }
  };

  // دالة معالجة نتيجة الفريقين معًا
  const handleBothTeamsResult = (isCorrect) => {
    // منع التقييم إذا تم التقييم من قبل
    if (evaluationMethod !== null) {
      showErrorToast('تم تقييم النتائج بالفعل!');
      return;
    }

    const newTeams = [...teams];
    
    // الفريق الأحمر
    if (isCorrect) {
      newTeams[0].score += currentBets.red;
    } else {
      newTeams[0].score -= currentBets.red;
      if (newTeams[0].score < 0) newTeams[0].score = 0;
    }
    
    // الفريق الأزرق  
    if (isCorrect) {
      newTeams[1].score += currentBets.blue;
    } else {
      newTeams[1].score -= currentBets.blue;
      if (newTeams[1].score < 0) newTeams[1].score = 0;
    }

    setTeams(newTeams);
    setResultsEvaluated({ red: isCorrect, blue: isCorrect });
    setEvaluationMethod('both');
    
    if (isCorrect) {
      showSuccessToast(` الفريقين ربحا! الأحمر +${currentBets.red}، الأزرق +${currentBets.blue}`);
    } else {
      showErrorToast(` الفريقين خسرا! الأحمر -${currentBets.red}، الأزرق -${currentBets.blue}`);
    }
    
    completeRound();
  };

  // دالة معالجة نتيجة فريق واحد
  const handleIndividualResult = (team, isCorrect) => {
    // منع التقييم إذا تم استخدام طريقة "الفريقين معًا"
    if (evaluationMethod === 'both') {
      showErrorToast('تم تقييم الفريقين معًا بالفعل!');
      return;
    }

    // منع إعادة تقييم نفس الفريق
    if (resultsEvaluated[team] !== null) {
      showErrorToast(`تم تقييم ${team === 'red' ? 'الفريق الأحمر' : 'الفريق الأزرق'} بالفعل!`);
      return;
    }

    const newResultsEvaluated = { ...resultsEvaluated };
    newResultsEvaluated[team] = isCorrect;
    setResultsEvaluated(newResultsEvaluated);
    setEvaluationMethod('individual');
    
    const newTeams = [...teams];
    const teamIndex = team === 'red' ? 0 : 1;
    const betAmount = currentBets[team];

    if (isCorrect) {
      newTeams[teamIndex].score += betAmount;
      showSuccessToast(` ${team === 'red' ? 'الفريق الأحمر' : 'الفريق الأزرق'} ربح ${betAmount} نقطة!`);
    } else {
      newTeams[teamIndex].score -= betAmount;
      if (newTeams[teamIndex].score < 0) newTeams[teamIndex].score = 0;
      showErrorToast(` ${team === 'red' ? 'الفريق الأحمر' : 'الفريق الأزرق'} خسر ${betAmount} نقطة!`);
    }

    setTeams(newTeams);
    
    // إذا تم تقييم كلا الفريقين، أكمل الجولة
    if (newResultsEvaluated.red !== null && newResultsEvaluated.blue !== null) {
      completeRound();
    }
  };

  // دالة إكمال الجولة
  const completeRound = () => {
    setRoundCompleted(true);
    
    // إضافة السؤال للمستخدمة
    setUsedQuestions(prev => new Set([...prev, currentQuestion.id]));

    // استخدام setTimeout للتأكد من تحديث النقاط أولاً
    setTimeout(() => {
      const currentTeams = teams;
      if (currentTeams[0].score === 0 || currentTeams[1].score === 0 || roundNumber >= maxRounds) {
        setGamePhase('finished');
        stopTimer();
      } else {
        // إظهار زر "الجولة التالية"
        showInfoToast('تم تقييم النتائج! اضغط على "الجولة التالية" للمتابعة');
      }
    }, 100);
  };

  // دالة بدء الجولة التالية
  const startNextRound = () => {
    setRoundNumber(prev => prev + 1);
    setGamePhase('betting');
    setCurrentBets({ red: null, blue: null });
    setResultsEvaluated({ red: null, blue: null });
    setEvaluationMethod(null);
    setCurrentQuestion(null);
    setShowAnswer(false);
    setRoundCompleted(false);
    showInfoToast(`🎮 الجولة ${roundNumber + 1} - اختاروا رهاناتكم!`);
  };

  // دالة إعادة تعيين اللعبة
  const resetGame = () => {
    setTeams([
      { name: 'الفريق الأحمر', color: 'red', score: BETTING_GAME_CONFIG.INITIAL_POINTS },
      { name: 'الفريق الأزرق', color: 'blue', score: BETTING_GAME_CONFIG.INITIAL_POINTS }
    ]);
    setCurrentTurn('red');
    setGamePhase('betting');
    setCurrentQuestion(null);
    setCurrentBets({ red: null, blue: null });
    setResultsEvaluated({ red: null, blue: null });
    setEvaluationMethod(null);
    setRoundCompleted(false);
    setShowAnswer(false);
    setRoundNumber(1);
    setUsedQuestions(new Set());
    
    // مسح localStorage
    Object.values(STORAGE_KEYS).forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {}
    });
    
    resetTimer();
    showSuccessToast(' تم إعادة تعيين اللعبة!');
  };

  // دالة تكبير الصورة
  const zoomImage = (imageUrl) => {
    setZoomedImage(imageUrl);
  };

  const closeZoomedImage = () => {
    setZoomedImage(null);
  };

  // شاشة انتهاء اللعبة
  if (gamePhase === 'finished') {
    const winner = teams[0].score > teams[1].score ? teams[0] : 
                   teams[1].score > teams[0].score ? teams[1] : null;

    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-2xl w-full text-center">
            <div className="text-6xl mb-6">
              {winner ? '🏆' : '🤝'}
            </div>
            
            <h2 className="text-4xl font-bold text-white mb-6">
              {winner ? `فوز ${winner.name}!` : 'تعادل!'}
            </h2>

            {/* النتائج النهائية */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className={`p-6 rounded-2xl ${teams[0].score > teams[1].score ? 'bg-green-500/20 border border-green-400/50' : 'bg-red-500/20 border border-red-400/50'}`}>
                <h3 className="text-xl font-bold text-white mb-2">{teams[0].name}</h3>
                <p className="text-3xl font-bold text-white">{teams[0].score}</p>
                {/* <p className="text-gray-400 text-sm">من {BETTING_GAME_CONFIG.INITIAL_POINTS}</p> */}
              </div>
              <div className={`p-6 rounded-2xl ${teams[1].score > teams[0].score ? 'bg-green-500/20 border border-green-400/50' : 'bg-red-500/20 border border-red-400/50'}`}>
                <h3 className="text-xl font-bold text-white mb-2">{teams[1].name}</h3>
                <p className="text-3xl font-bold text-white">{teams[1].score}</p>
                {/* <p className="text-gray-400 text-sm">من {BETTING_GAME_CONFIG.INITIAL_POINTS}</p> */}
              </div>
            </div>

            {/* <div className="text-gray-400 mb-8">
              <p>عدد الجولات: {roundNumber} من {maxRounds}</p>
              <p>الوقت المستغرق: {formatTime(timer)}</p>
              <p>الأسئلة المجابة: {usedQuestions.size}</p>
            </div> */}

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={resetGame}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
              >
                لعبة جديدة
              </button>
              <Link 
                href="/"
                className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 text-center"
              >
                العودة للرئيسية
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 p-6 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link 
            href="/"
            className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0L3.586 10l4.707-4.707a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd"/>
            </svg>
            العودة
          </Link>

          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                الرهان
            </h1>
            <p className="text-gray-400">الجولة {roundNumber} من {maxRounds}</p>
          </div>

          {/* <div className="flex items-center gap-4">
            <button
              onClick={toggleTimer}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                timerActive 
                  ? 'bg-red-500/20 text-red-400 border border-red-400/50' 
                  : 'bg-green-500/20 text-green-400 border border-green-400/50'
              }`}
            >
              {formatTime(timer)}
            </button>
            <button
              onClick={() => setShowConfirmReset(true)}
              className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-400/50 rounded-xl font-semibold hover:bg-red-500/30 transition-all duration-300"
            >
              إعادة تعيين
            </button>
          </div> */}
        </div>

        {/* نتائج الفرق */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {teams.map((team, index) => (
            <div key={team.color} className={`relative group transition-all duration-500`}>
              <div className={`p-8 bg-white/5 backdrop-blur-xl border rounded-3xl text-center transition-all duration-500 ${
                team.color === 'red'
                  ? 'border-red-400/50 bg-gradient-to-br from-red-500/20 to-pink-500/20'
                  : 'border-blue-400/50 bg-gradient-to-br from-blue-500/20 to-indigo-500/20'
              }`}>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-3">{team.name}</h2>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 mb-4">
                  <p className="text-4xl md:text-6xl font-black text-white mb-1">{team.score}</p>
                  <p className="text-gray-400 font-medium">نقطة</p>
                </div>
                {currentBets[team.color] && (
                  <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-xl p-3">
                    <p className="text-yellow-400 font-bold">رهان: {currentBets[team.color]} نقطة</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* مرحلة الرهان */}
        {gamePhase === 'betting' && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-white text-center mb-6">
               اختر رهانك - الجولة {roundNumber}
            </h3>
            
            <div className="text-center mb-6">
              {/* <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/50 rounded-xl">
                <span className="text-yellow-400 font-bold">
                  كل فريق يبدأ بـ {BETTING_GAME_CONFIG.INITIAL_POINTS} نقطة | {maxRounds} جولة
                </span>
              </div> */}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {teams.map((team) => (
                <div key={team.color} className="space-y-4">
                  <h4 className={`text-xl font-bold text-center ${
                    team.color === 'red' ? 'text-red-400' : 'text-blue-400'
                  }`}>
                    {team.name}
                    {currentBets[team.color] && (
                      <span className="block text-yellow-400 text-sm mt-1">
                         راهن بـ {currentBets[team.color]} نقطة
                      </span>
                    )}
                  </h4>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {BETTING_GAME_CONFIG.BETTING_VALUES.map((value) => (
                      <button
                        key={value}
                        onClick={() => placeBet(team.color, value)}
                        disabled={team.score < value || currentBets[team.color]}
                        className={`p-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                          team.score < value || currentBets[team.color]
                            ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                            : currentBets[team.color] === value
                              ? 'bg-yellow-500/30 text-yellow-400 border-2 border-yellow-400/50'
                              : team.color === 'red'
                                ? 'bg-red-500/20 text-red-400 border border-red-400/50 hover:bg-red-500/30 hover:scale-105'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-400/50 hover:bg-blue-500/30 hover:scale-105'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {(currentBets.red || currentBets.blue) && (
              <div className="mt-6 text-center">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-yellow-500/20 border border-yellow-400/50 rounded-xl">
                  <div className="animate-spin w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full"></div>
                  <span className="text-yellow-400 font-bold">
                    في انتظار {!currentBets.red ? 'الفريق الأحمر' : !currentBets.blue ? 'الفريق الأزرق' : 'بدء السؤال'}...
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* مرحلة السؤال */}
        {gamePhase === 'question' && currentQuestion && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 mb-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/50 rounded-xl mb-4">
                <span className="text-cyan-400 font-bold text-lg">
                  صعوبة: {currentQuestion.difficulty === 'easy' ? 'سهل' : currentQuestion.difficulty === 'medium' ? 'متوسط' : 'صعب'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
                <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-3">
                  <p className="text-red-400 font-bold">الأحمر: {currentBets.red} نقطة</p>
                </div>
                <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-3">
                  <p className="text-blue-400 font-bold">الأزرق: {currentBets.blue} نقطة</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-6">
              <h3 className="text-2xl md:text-3xl font-bold text-white leading-relaxed text-center">
                {currentQuestion.question}
              </h3>
            </div>

            {/* عرض الوسائط */}
            {currentQuestion.hasQR && (
              <div className="flex justify-center mb-6">
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
                </div>
              </div>
            )}

            {currentQuestion.hasImage && !currentQuestion.hasQR && (
              <div className="flex justify-center mb-6">
                <div className="relative group">
                  <img 
                    src={currentQuestion.imageUrl} 
                    alt="صورة السؤال" 
                    className="max-w-full max-h-64 md:max-h-80 lg:max-h-96 object-contain rounded-3xl shadow-2xl border-4 border-purple-400/50 cursor-pointer hover:border-purple-400 hover:scale-105 transition-all duration-300"
                    onClick={() => zoomImage(currentQuestion.imageUrl)}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x250/6366F1/FFFFFF?text=صورة+السؤال';
                    }}
                  />
                </div>
              </div>
            )}

            {/* عرض الإجابة أولاً */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowAnswer(!showAnswer)}
                className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-400/50 px-8 py-3 rounded-xl font-bold hover:bg-purple-500/30 transition-all duration-300"
              >
                {showAnswer ? 'إخفاء الإجابة' : 'عرض الإجابة'}
              </button>
              
              {showAnswer && (
                <div className="mt-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/50 rounded-xl p-4">
                  <p className="text-green-400 font-bold text-lg">
                    الإجابة: {currentQuestion.answer}
                  </p>
                </div>
              )}
            </div>

            {/* أزرار النتائج - تظهر فقط بعد عرض الإجابة */}
            {showAnswer && !roundCompleted && (
              <div className="mt-8 space-y-6">
                {/* أزرار منفصلة لكل فريق - في الأعلى */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {teams.map((team) => (
                    <div key={team.color} className="space-y-4">
                      <h4 className={`text-xl font-bold text-center ${
                        team.color === 'red' ? 'text-red-400' : 'text-blue-400'
                      }`}>
                        {team.name}
                        {resultsEvaluated[team.color] !== null && (
                          <span className={`block text-sm mt-1 ${
                            resultsEvaluated[team.color] ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {resultsEvaluated[team.color] ? '✅ تم التقييم: صحيح' : '❌ تم التقييم: خطأ'}
                          </span>
                        )}
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleIndividualResult(team.color, true)}
                          disabled={resultsEvaluated[team.color] !== null || evaluationMethod === 'both'}
                          className={`px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                            resultsEvaluated[team.color] !== null || evaluationMethod === 'both'
                              ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                              : 'bg-green-500/20 text-green-400 border border-green-400/50 hover:bg-green-500/30 hover:scale-105'
                          }`}
                        >
                           صحيح
                          <div className="text-sm opacity-75">+{currentBets[team.color]}</div>
                        </button>
                        
                        <button
                          onClick={() => handleIndividualResult(team.color, false)}
                          disabled={resultsEvaluated[team.color] !== null || evaluationMethod === 'both'}
                          className={`px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                            resultsEvaluated[team.color] !== null || evaluationMethod === 'both'
                              ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                              : 'bg-red-500/20 text-red-400 border border-red-400/50 hover:bg-red-500/30 hover:scale-105'
                          }`}
                        >
                           خطأ
                          <div className="text-sm opacity-75">-{currentBets[team.color]}</div>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* فاصل */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-white/20"></div>
                  <span className="text-gray-400 text-sm">   معًا</span>
                  <div className="flex-1 h-px bg-white/20"></div>
                </div>

                {/* أزرار الفريقين معًا - في الأسفل */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleBothTeamsResult(true)}
                    disabled={evaluationMethod !== null}
                    className={`px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                      evaluationMethod !== null
                        ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                        : 'bg-green-500/20 text-green-400 border border-green-400/50 hover:bg-green-500/30 hover:scale-105'
                    }`}
                  >
                     الفريقين صحيحين
                    <div className="text-sm opacity-75">
                      الأحمر: +{currentBets.red} | الأزرق: +{currentBets.blue}
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleBothTeamsResult(false)}
                    disabled={evaluationMethod !== null}
                    className={`px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                      evaluationMethod !== null
                        ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                        : 'bg-red-500/20 text-red-400 border border-red-400/50 hover:bg-red-500/30 hover:scale-105'
                    }`}
                  >
                     الفريقين خطأ
                    <div className="text-sm opacity-75">
                      الأحمر: -{currentBets.red} | الأزرق: -{currentBets.blue}
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* زر الجولة التالية - يظهر بعد تقييم النتائج */}
            {showAnswer && roundCompleted && gamePhase !== 'finished' && (
              <div className="mt-6 text-center">
                <button
                  onClick={startNextRound}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
                >
                  🎮 الجولة التالية
                </button>
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        <ImageModal zoomedImage={zoomedImage} closeZoomedImage={closeZoomedImage} />
        
        <ConfirmModal 
          showConfirmReset={showConfirmReset}
          setShowConfirmReset={setShowConfirmReset}
          resetGame={resetGame}
        />

        <ToastNotification />
      </div>
    </div>
  );
}