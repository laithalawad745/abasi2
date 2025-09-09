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
  const [maxRounds] = useState(10); // عدد الجولات الإجمالي

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
      
      // اختيار سؤال عشوائي من النوع المحدد
      setTimeout(() => {
        const questionType = diceGameData.questionTypes[rollResults.questionType - 1];
        const randomQuestion = questionType.questions[Math.floor(Math.random() * questionType.questions.length)];
        const pointValue = diceGameData.pointValues[rollResults.points - 1];
        
        setCurrentQuestion({
          ...randomQuestion,
          points: pointValue,
          category: questionType.name,
          categoryIcon: questionType.icon,
          categoryColor: questionType.color
        });
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
              انتهت لعبة النرد! 🎲
            </h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className={`p-6 rounded-xl transition-all duration-500 ${
                teams[0].score > teams[1].score 
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500 ring-4 ring-yellow-400/50 shadow-2xl' 
                  : 'bg-gradient-to-br from-red-500 to-pink-500 shadow-lg'
              }`}>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">{teams[0].name}</h2>
                <p className="text-3xl md:text-4xl font-bold text-white">{teams[0].score}</p>
                {teams[0].score > teams[1].score && <p className="text-yellow-200 font-bold mt-2">الفائز 🏆</p>}
              </div>
              
              <div className={`p-6 rounded-xl transition-all duration-500 ${
                teams[1].score > teams[0].score 
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500 ring-4 ring-yellow-400/50 shadow-2xl' 
                  : 'bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg'
              }`}>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">{teams[1].name}</h2>
                <p className="text-3xl md:text-4xl font-bold text-white">{teams[1].score}</p>
                {teams[1].score > teams[0].score && <p className="text-yellow-200 font-bold mt-2">الفائز 🏆</p>}
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400">
                {winner ? `${winner.name} هو الفائز!` : 'تعادل بين الفريقين!'}
              </h2>
              <p className="text-lg text-slate-300">
                تم لعب {maxRounds} جولات • الفارق: {Math.abs(teams[0].score - teams[1].score)} نقطة
              </p>
            </div>
            
            <div className="flex justify-center gap-4">
              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-300"
              >
                لعبة جديدة 🎲
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">
            لعبة النرد 🎲
          </h1>
          <Link 
            href="/"
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold text-sm md:text-base shadow-lg transition-all duration-300"
          >
            ← العودة للرئيسية
          </Link>
        </div>

        {/* معلومات الجولة والدور */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-600 shadow-xl">
            <div className="text-yellow-400 font-bold">
              الجولة {roundNumber} / {maxRounds}
            </div>
            <div className="w-px h-6 bg-slate-600"></div>
            <div className={`font-bold ${currentTurn === 'red' ? 'text-red-400' : 'text-blue-400'}`}>
              دور {currentTurn === 'red' ? 'الفريق الأحمر' : 'الفريق الأزرق'}
            </div>
          </div>
        </div>

        {/* نتائج الفرق */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
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
                className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white px-8 py-4 rounded-xl font-bold text-xl shadow-lg transition-all duration-300 hover:scale-105"
              >
                🎲 ارمِ النردين!
              </button>
            </div>
          )}
        </div>

        {/* منطقة السؤال */}
        {currentQuestion && gamePhase === 'questioning' && (
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl border border-slate-700">
            <div className="text-center mb-6">
              <div className={`inline-block px-6 py-3 rounded-full text-white font-bold text-lg bg-gradient-to-r ${currentQuestion.categoryColor}`}>
                {currentQuestion.categoryIcon} {currentQuestion.category} - {currentQuestion.points} نقطة
              </div>
            </div>
            
            <h3 className="text-xl md:text-2xl font-bold text-center mb-8 text-slate-100">
              {currentQuestion.question}
            </h3>
            
            {!showAnswer ? (
              <div className="text-center">
                <button
                  onClick={finishAnswering}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-300"
                >
                  انتهينا من الإجابة
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-emerald-500/20 border border-emerald-400/50 rounded-xl p-6 mb-8 backdrop-blur-sm">
                  <h4 className="text-lg font-bold text-emerald-400 mb-3">الإجابة الصحيحة:</h4>
                  <p className="text-xl md:text-2xl text-white font-semibold">{currentQuestion.answer}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    onClick={() => awardPoints(0)}
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300"
                  >
                    الفريق الأحمر أجاب صح
                  </button>
                  <button
                    onClick={noCorrectAnswer}
                    className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300"
                  >
                    لا أحد أجاب صح
                  </button>
                  <button
                    onClick={() => awardPoints(1)}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300"
                  >
                    الفريق الأزرق أجاب صح
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* تعليمات اللعبة */}
      <DiceInstructions />
    </div>
  );
}