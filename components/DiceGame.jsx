// components/DiceGame.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { diceGameData } from '../app/data/diceGameData';
import DiceComponent from './DiceComponent';
import DiceInstructions from './DiceInstructions';

export default function DiceGame() {
  // حالة اللعبة
  const [gamePhase, setGamePhase] = useState('waiting'); // 'waiting', 'rolling', 'questioning', 'finished'
  const [teams, setTeams] = useState([
    { name: 'الفريق الأحمر', color: 'red', score: 0 },
    { name: 'الفريق الأزرق', color: 'blue', score: 0 }
  ]);
  const [currentTurn, setCurrentTurn] = useState('red');
  const [rollResults, setRollResults] = useState({ questionType: 1, points: 1 });
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [diceRollComplete, setDiceRollComplete] = useState({ question: false, points: false });
  const [roundNumber, setRoundNumber] = useState(1);
  const [maxRounds] = useState(10);

  // 🆕 حالة الأسئلة المستخدمة
  const [usedQuestions, setUsedQuestions] = useState(new Set());

  // 🆕 تحميل الأسئلة المستخدمة من localStorage عند البداية
  useEffect(() => {
    try {
      const savedUsedQuestions = localStorage.getItem('dice-game-used-questions');
      if (savedUsedQuestions) {
        const parsedQuestions = JSON.parse(savedUsedQuestions);
        setUsedQuestions(new Set(parsedQuestions));
      }
    } catch (error) {
      console.log('فشل في تحميل الأسئلة المستخدمة:', error);
    }
  }, []);

  // 🆕 حفظ الأسئلة المستخدمة في localStorage عند التحديث
  useEffect(() => {
    try {
      const questionsArray = Array.from(usedQuestions);
      localStorage.setItem('dice-game-used-questions', JSON.stringify(questionsArray));
    } catch (error) {
      console.log('فشل في حفظ الأسئلة المستخدمة:', error);
    }
  }, [usedQuestions]);

  // 🆕 دالة للحصول على سؤال غير مستخدم
  const getUnusedQuestion = (questionTypeIndex) => {
    const questionType = diceGameData.questionTypes[questionTypeIndex - 1];
    if (!questionType) return null;

    // العثور على الأسئلة غير المستخدمة
    const availableQuestions = questionType.questions.filter(q => 
      !usedQuestions.has(`${questionType.id}-${q.id}`)
    );

    // إذا لم تعد هناك أسئلة متاحة في هذا النوع
    if (availableQuestions.length === 0) {
      // البحث في أنواع أخرى
      for (let i = 0; i < diceGameData.questionTypes.length; i++) {
        const altQuestionType = diceGameData.questionTypes[i];
        const altAvailableQuestions = altQuestionType.questions.filter(q => 
          !usedQuestions.has(`${altQuestionType.id}-${q.id}`)
        );
        
        if (altAvailableQuestions.length > 0) {
          const randomIndex = Math.floor(Math.random() * altAvailableQuestions.length);
          const selectedQuestion = altAvailableQuestions[randomIndex];
          return {
            question: selectedQuestion,
            category: altQuestionType
          };
        }
      }
      
      // إذا لم تعد هناك أي أسئلة متاحة على الإطلاق
      return null;
    }

    // اختيار سؤال عشوائي من الأسئلة المتاحة
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selectedQuestion = availableQuestions[randomIndex];
    
    return {
      question: selectedQuestion,
      category: questionType
    };
  };

  // 🆕 دالة لإضافة سؤال للمستخدمة
  const markQuestionAsUsed = (categoryId, questionId) => {
    setUsedQuestions(prev => new Set([...prev, `${categoryId}-${questionId}`]));
  };

  // 🆕 دالة لإعادة تعيين الأسئلة المستخدمة
  const resetUsedQuestions = () => {
    setUsedQuestions(new Set());
    try {
      localStorage.removeItem('dice-game-used-questions');
    } catch (error) {
      console.log('فشل في حذف الأسئلة المستخدمة:', error);
    }
  };

  // إعادة تعيين حالة النرد
  const resetDiceState = () => {
    setDiceRollComplete({ question: false, points: false });
    setIsRolling(false);
    setShowAnswer(false);
    setCurrentQuestion(null);
  };

  // رمي النردين
  const rollDice = () => {
    if (isRolling) return;
    
    resetDiceState();
    setGamePhase('rolling');
    setIsRolling(true);
    
    // إنشاء نتائج عشوائية
    const questionTypeResult = Math.floor(Math.random() * 6) + 1;
    const pointsResult = Math.floor(Math.random() * 6) + 1;
    
    setRollResults({
      questionType: questionTypeResult,
      points: pointsResult
    });
  };

  // عند انتهاء رمي نرد واحد
  const handleDiceComplete = (diceType) => {
    setDiceRollComplete(prev => ({
      ...prev,
      [diceType]: true
    }));
  };

  // عند انتهاء رمي النردين
  useEffect(() => {
    if (diceRollComplete.question && diceRollComplete.points && isRolling) {
      setIsRolling(false);
      
      // 🆕 اختيار سؤال غير مستخدم
      setTimeout(() => {
        const questionData = getUnusedQuestion(rollResults.questionType);
        
        if (!questionData) {
          // لا توجد أسئلة متاحة - عرض رسالة
          setGamePhase('no-questions');
          return;
        }

        const pointValue = diceGameData.pointValues[rollResults.points - 1];
        
        setCurrentQuestion({
          ...questionData.question,
          points: pointValue,
          category: questionData.category.name,
          categoryIcon: questionData.category.icon,
          categoryColor: questionData.category.color,
          categoryId: questionData.category.id
        });
        
        // 🆕 وضع علامة على السؤال كمستخدم
        markQuestionAsUsed(questionData.category.id, questionData.question.id);
        
        setGamePhase('questioning');
      }, 1000);
    }
  }, [diceRollComplete, isRolling, rollResults]);

  // إنهاء الإجابة
  const finishAnswering = () => {
    setShowAnswer(true);
  };

  // منح النقاط
  const awardPoints = (teamIndex) => {
    if (currentQuestion) {
      const newTeams = [...teams];
      newTeams[teamIndex].score += currentQuestion.points;
      setTeams(newTeams);
      
      nextTurn();
    }
  };

  // عدم وجود إجابة صحيحة
  const noCorrectAnswer = () => {
    nextTurn();
  };

  // الدور التالي
  const nextTurn = () => {
    setCurrentTurn(currentTurn === 'red' ? 'blue' : 'red');
    setGamePhase('waiting');
    resetDiceState();
    
    // زيادة رقم الجولة عند انتهاء دور الفريق الأزرق
    if (currentTurn === 'blue') {
      const newRound = roundNumber + 1;
      setRoundNumber(newRound);
      
      // التحقق من انتهاء اللعبة
      if (newRound > maxRounds) {
        setGamePhase('finished');
      }
    }
  };

  // إعادة تشغيل اللعبة
  const resetGame = () => {
    setGamePhase('waiting');
    setTeams([
      { name: 'الفريق الأحمر', color: 'red', score: 0 },
      { name: 'الفريق الأزرق', color: 'blue', score: 0 }
    ]);
    setCurrentTurn('red');
    setRoundNumber(1);
    resetDiceState();
  };

  // 🆕 حساب إحصائيات الأسئلة
  const getQuestionStats = () => {
    const totalQuestions = diceGameData.questionTypes.reduce((sum, type) => 
      sum + type.questions.length, 0
    );
    const usedCount = usedQuestions.size;
    const remainingCount = totalQuestions - usedCount;
    
    return { totalQuestions, usedCount, remainingCount };
  };

  const stats = getQuestionStats();

  // 🆕 عرض حالة عدم وجود أسئلة
  if (gamePhase === 'no-questions') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Link 
              href="/"
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold text-sm md:text-base shadow-lg transition-all duration-300"
            >
              ← العودة للرئيسية
            </Link>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 text-center shadow-2xl border border-slate-700">
            <h1 className="text-3xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
              نفدت الأسئلة! 
            </h1>
            
            <p className="text-lg md:text-xl text-slate-300 mb-8">
              لقد استخدمتم جميع الأسئلة المتاحة في اللعبة!
            </p>
            
            <div className="space-y-4">
              {/* <button
                onClick={resetUsedQuestions}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 hover:scale-105 block mx-auto"
              >
                🔄 إعادة تعيين الأسئلة والمتابعة
              </button> */}
              
              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 hover:scale-105 block mx-auto"
              >
                🎮 لعبة جديدة
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // عرض نتائج اللعبة
  if (gamePhase === 'finished') {
    const winner = teams[0].score > teams[1].score ? teams[0] : 
                   teams[1].score > teams[0].score ? teams[1] : null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <Link 
              href="/"
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold text-sm md:text-base shadow-lg transition-all duration-300"
            >
              ← العودة للرئيسية
            </Link>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 text-center shadow-2xl border border-slate-700">
            <h1 className="text-3xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              انتهت لعبة النرد! 
            </h1>

            {winner ? (
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-slate-100">
                  🏆 الفائز: {winner.name}
                </h2>
                <p className="text-lg text-slate-300">
                  النتيجة النهائية: {winner.score} نقطة
                </p>
              </div>
            ) : (
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-slate-100">
                  🤝 تعادل!
                </h2>
                <p className="text-lg text-slate-300">
                  كلا الفريقين حصل على {teams[0].score} نقطة
                </p>
              </div>
            )}

            {/* النتائج النهائية */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                <h3 className="text-xl font-bold text-red-400 mb-2">{teams[0].name}</h3>
                <p className="text-3xl font-bold text-white">{teams[0].score}</p>
              </div>
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
                <h3 className="text-xl font-bold text-blue-400 mb-2">{teams[1].name}</h3>
                <p className="text-3xl font-bold text-white">{teams[1].score}</p>
              </div>
            </div>

            {/* 🆕 إحصائيات الأسئلة */}
            {/* <div className="bg-slate-700/50 rounded-xl p-4 mb-8">
              <h3 className="text-lg font-bold text-slate-200 mb-2">📊 إحصائيات الأسئلة</h3>
              <p className="text-slate-300">
                تم استخدام {stats.usedCount} من أصل {stats.totalQuestions} سؤال
              </p>
              <p className="text-slate-400 text-sm">
                متبقي {stats.remainingCount} سؤال
              </p>
            </div> */}

            <div className="space-y-4">
              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 hover:scale-105 block mx-auto"
              >
                🎮 لعبة جديدة
              </button>
              
              {/* {stats.remainingCount === 0 && (
                <button
                  onClick={resetUsedQuestions}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg transition-all duration-300 hover:scale-105 block mx-auto"
                >
                  🔄 إعادة تعيين جميع الأسئلة
                </button>
              )} */}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8 select-none">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">
            لعبة النرد 
          </h1>
          <Link 
            href="/"
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold text-sm md:text-base shadow-lg transition-all duration-300"
          >
            ← العودة للرئيسية
          </Link>
        </div>

        {/* Game Info */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-4 md:p-6 mb-8 shadow-2xl border border-slate-700">
             <div className="flex flex-col items-center text-center md:text-right">
              <h2 className="text-lg md:text-xl font-bold text-slate-200">
                الجولة {roundNumber} من {maxRounds}
              </h2>
              <p className="text-sm text-slate-400">
                دور: {currentTurn === 'red' ? teams[0].name : teams[1].name}
              </p>
            </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
       
            
            {/* 🆕 إحصائيات الأسئلة المباشرة */}
            {/* <div className="text-center">
              <p className="text-sm text-slate-300">
                📋 الأسئلة: {stats.usedCount}/{stats.totalQuestions}
              </p>
              <p className="text-xs text-slate-400">
                متبقي: {stats.remainingCount}
              </p>
            </div> */}

            {/* <div className="flex gap-2">
              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-3 py-2 rounded-lg font-bold text-sm shadow-lg transition-all duration-300"
              >
                🔄 إعادة تشغيل
              </button>
              
              {stats.usedCount > 0 && (
                <button
                  onClick={resetUsedQuestions}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-3 py-2 rounded-lg font-bold text-sm shadow-lg transition-all duration-300"
                  title="إعادة تعيين الأسئلة المستخدمة"
                >
                  📝 إعادة الأسئلة
                </button>
              )}
            </div> */}
          </div>
        </div>

        {/* نقاط الفرق */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className={`p-6 rounded-2xl text-center transition-all duration-500 ${
            currentTurn === 'red'
              ? 'bg-gradient-to-br from-red-500 to-pink-500 shadow-2xl shadow-red-500/25 ring-4 ring-red-400/50'
              : 'bg-gradient-to-br from-red-500/70 to-pink-500/70 shadow-lg'
          }`}>
            <h2 className="text-lg md:text-2xl font-bold text-white mb-2">{teams[0].name}</h2>
            <p className="text-3xl md:text-4xl font-bold text-white">{teams[0].score}</p>
          </div>
          
          <div className={`p-6 rounded-2xl text-center transition-all duration-500 ${
            currentTurn === 'blue'
              ? 'bg-gradient-to-br from-blue-500 to-indigo-500 shadow-2xl shadow-blue-500/25 ring-4 ring-blue-400/50'
              : 'bg-gradient-to-br from-blue-500/70 to-indigo-500/70 shadow-lg'
          }`}>
            <h2 className="text-lg md:text-2xl font-bold text-white mb-2">{teams[1].name}</h2>
            <p className="text-3xl md:text-4xl font-bold text-white">{teams[1].score}</p>
          </div>
        </div>

        {/* منطقة النرد */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 mb-8 shadow-2xl border border-slate-700">
          <h3 className="text-xl md:text-2xl font-bold text-center mb-8 text-slate-100">
            {gamePhase === 'waiting' && 'اضغط لرمي النردين!'}
            {gamePhase === 'rolling' && 'جاري رمي النردين...'}
            {gamePhase === 'questioning' && 'وقت الإجابة!'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 mb-8">
            {/* نرد نوع السؤال */}
            <div className="text-center">
              <h4 className="text-lg font-bold text-emerald-400 mb-4">نوع السؤال</h4>
              <DiceComponent
                isRolling={isRolling}
                finalValue={rollResults.questionType}
                onRollComplete={() => handleDiceComplete('question')}
                type="question"
                size="large"
              />
            </div>
            
            {/* نرد النقاط */}
            <div className="text-center">
              <h4 className="text-lg font-bold text-yellow-400 mb-4">عدد النقاط</h4>
              <DiceComponent
                isRolling={isRolling}
                finalValue={rollResults.points}
                onRollComplete={() => handleDiceComplete('points')}
                type="points"
                size="large"
              />
            </div>
          </div>
          
          {/* زر الرمي */}
          {gamePhase === 'waiting' && (
            <div className="text-center">
              <button
                onClick={rollDice}
                disabled={stats.remainingCount === 0}
                className={`px-8 py-4 rounded-xl font-bold text-xl shadow-lg transition-all duration-300 hover:scale-105 ${
                  stats.remainingCount === 0 
                    ? 'bg-gray-600 cursor-not-allowed opacity-50 text-gray-300' 
                    : 'bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white'
                }`}
              >
                {stats.remainingCount === 0 ? '❌ لا توجد أسئلة' : ' ارمِ النردين!'}
              </button>
            </div>
          )}
        </div>

        {/* منطقة السؤال */}
        {gamePhase === 'questioning' && currentQuestion && (
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 mb-8 shadow-2xl border border-slate-700">
            <div className="text-center mb-6">
              <div className={`inline-block px-4 py-2 rounded-full mb-4 bg-gradient-to-r ${currentQuestion.categoryColor}`}>
                <span className="text-2xl mr-2">{currentQuestion.categoryIcon}</span>
                <span className="text-white font-bold">{currentQuestion.category}</span>
                <span className="text-white font-bold ml-4">{currentQuestion.points} نقطة</span>
              </div>
            </div>

            <h3 className="text-xl md:text-2xl font-bold text-center mb-8 text-slate-100">
              {currentQuestion.question}
            </h3>

            {!showAnswer ? (
              <div className="text-center">
                <button
                  onClick={finishAnswering}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 hover:scale-105"
                >
                  🔍 إظهار الإجابة
                </button>
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
                  <h4 className="text-lg font-bold text-green-400 mb-2">الإجابة الصحيحة:</h4>
                  <p className="text-xl text-slate-100">{currentQuestion.answer}</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 justify-center">
                  <button
                    onClick={() => awardPoints(0)}
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300"
                  >
                    ✅ {teams[0].name} أجاب صحيح
                  </button>
                  <button
                    onClick={() => awardPoints(1)}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300"
                  >
                    ✅ {teams[1].name} أجاب صحيح
                  </button>
                  <button
                    onClick={noCorrectAnswer}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300"
                  >
                    ❌ لا إجابة صحيحة
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* تعليمات اللعبة */}
        <DiceInstructions />
      </div>
    </div>
  );
}