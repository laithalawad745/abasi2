// components/DiceGame.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { diceGameData } from '../app/data/diceGameData';
import DiceComponent from './DiceComponent';

export default function DiceGame() {
  // حالة اللعبة
  const [gamePhase, setGamePhase] = useState('setup'); // 'setup', 'waiting', 'rolling', 'questioning', 'finished'
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
  const [isClient, setIsClient] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // 🆕 نظام إدارة الأسئلة المستخدمة
  const [usedQuestions, setUsedQuestions] = useState(new Set());

  // Client-side mounting وتحميل الأسئلة المستخدمة
  useEffect(() => {
    setIsClient(true);
    
    // 🔄 تحميل الأسئلة المستخدمة من localStorage
    try {
      const savedUsedQuestions = localStorage.getItem('dice-game-used-questions');
      if (savedUsedQuestions) {
        const parsedQuestions = JSON.parse(savedUsedQuestions);
        setUsedQuestions(new Set(parsedQuestions));
        console.log('📊 تم تحميل', parsedQuestions.length, 'سؤال مستخدم');
      }
    } catch (error) {
      console.log('فشل في تحميل الأسئلة المستخدمة:', error);
    }
  }, []);

  // 💾 حفظ الأسئلة المستخدمة عند تغييرها
  useEffect(() => {
    if (isClient && usedQuestions.size > 0) {
      try {
        const questionsArray = Array.from(usedQuestions);
        localStorage.setItem('dice-game-used-questions', JSON.stringify(questionsArray));
        console.log('💾 تم حفظ الأسئلة المستخدمة:', questionsArray.length);
      } catch (error) {
        console.log('فشل في حفظ الأسئلة المستخدمة:', error);
      }
    }
  }, [usedQuestions, isClient]);

  // 🗑️ إعادة تعيين الأسئلة المستخدمة فقط
  const resetUsedQuestions = () => {
    setUsedQuestions(new Set());
    try {
      localStorage.removeItem('dice-game-used-questions');
      console.log('🗑️ تم مسح جميع الأسئلة المستخدمة');
    } catch (error) {
      console.log('فشل في حذف الأسئلة المستخدمة:', error);
    }
  };

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
      
      // إذا لم تعد هناك أي أسئلة متاحة، استخدم أي سؤال
      console.warn('⚠️ لا توجد أسئلة جديدة، سيتم استخدام سؤال مكرر...');
      if (questionType.questions.length > 0) {
        const randomIndex = Math.floor(Math.random() * questionType.questions.length);
        return {
          question: questionType.questions[randomIndex],
          category: questionType
        };
      }
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

  // 🆕 حساب إحصائيات الأسئلة
  const getQuestionStats = () => {
    const totalQuestions = diceGameData.questionTypes.reduce((sum, type) => 
      sum + type.questions.length, 0
    );
    const usedCount = usedQuestions.size;
    const remainingCount = totalQuestions - usedCount;
    
    const categoryStats = diceGameData.questionTypes.map(type => ({
      ...type,
      total: type.questions.length,
      used: Array.from(usedQuestions).filter(id => id.startsWith(`${type.id}-`)).length,
      remaining: type.questions.length - Array.from(usedQuestions).filter(id => id.startsWith(`${type.id}-`)).length
    }));
    
    return { totalQuestions, usedCount, remainingCount, categories: categoryStats };
  };

  // إعادة تعيين حالة النرد
  const resetDiceState = () => {
    setDiceRollComplete({ question: false, points: false });
    setIsRolling(false);
    setShowAnswer(false);
    setCurrentQuestion(null);
    setIsProcessing(false);
  };

  // بدء اللعبة
  const startGame = () => {
    if (!isClient) return;
    setGamePhase('waiting');
    console.log('🎮 بدء لعبة النرد مع', usedQuestions.size, 'سؤال مستخدم مسبقاً');
  };

  // رمي النردين
  const rollDice = () => {
    if (isRolling || isProcessing) return;
    
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
          console.error('❌ لا توجد أسئلة متاحة');
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
    if (currentQuestion && !isProcessing) {
      setIsProcessing(true);
      const newTeams = [...teams];
      newTeams[teamIndex].score += currentQuestion.points;
      setTeams(newTeams);
      
      setTimeout(() => nextTurn(), 1500);
    }
  };

  // عدم وجود إجابة صحيحة
  const noCorrectAnswer = () => {
    if (!isProcessing) {
      setIsProcessing(true);
      setTimeout(() => nextTurn(), 1500);
    }
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
    setGamePhase('setup');
    setTeams([
      { name: 'الفريق الأحمر', color: 'red', score: 0 },
      { name: 'الفريق الأزرق', color: 'blue', score: 0 }
    ]);
    setCurrentTurn('red');
    setRoundNumber(1);
    setUsedQuestions(new Set());
    localStorage.removeItem('dice-game-used-questions');
    resetDiceState();
    console.log('🔄 تم إعادة تعيين لعبة النرد');
  };

  const stats = getQuestionStats();

  // شاشة الإعداد
  if (gamePhase === 'setup') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        {/* المحتوى الرئيسي */}
        <div className="relative z-10 p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <div className="text-4xl md:text-5xl font-black text-white tracking-wider">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-violet-500">
                النرد
              </span>
            </div>
            <Link 
              href="/" 
              className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              ← العودة للرئيسية
            </Link>
          </div>

          {/* العنوان الرئيسي */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-7xl font-black text-white mb-6 tracking-tight">
              لعبة
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-violet-500 to-indigo-600">
                النرد 
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 font-light max-w-2xl mx-auto">
              ارمِ النردين واختبر معلوماتك في مختلف المجالات
            </p>
          </div>

          {/* قواعد اللعبة */}
          <div className="max-w-6xl mx-auto mb-12">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400 mb-8">
                🎲 قواعد اللعبة
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-white/5 rounded-2xl border border-purple-500/30">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-violet-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2 1 1 0 100-2zm0 5a1 1 0 100 2 1 1 0 000-2zm4-5a1 1 0 100 2 1 1 0 000-2zm0 5a1 1 0 100 2 1 1 0 000-2zm-2 5a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-purple-400 mb-2">رمي النردين</h3>
                  <p className="text-gray-300">نرد لنوع السؤال ونرد للنقاط</p>
                </div>
                
                <div className="text-center p-6 bg-white/5 rounded-2xl border border-green-500/30">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-green-400 mb-2">إجابة صحيحة</h3>
                  <p className="text-gray-300">احصل على النقاط المحددة بالنرد</p>
                </div>
                
                <div className="text-center p-6 bg-white/5 rounded-2xl border border-blue-500/30">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-blue-400 mb-2">نظام التناوب</h3>
                  <p className="text-gray-300">الفرق تتناوب في الرمي والإجابة</p>
                </div>
              </div>

              {/* فئات الأسئلة */}
              <div className="bg-white/5 rounded-2xl p-6 border border-indigo-500/30 mb-6">
                <h3 className="text-indigo-400 font-bold text-lg mb-4 text-center">📚 فئات الأسئلة (6 فئات)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center text-sm">
                  {stats.categories.map((category) => (
                    <div key={category.id} className={`bg-gradient-to-br ${category.color}/15 rounded-xl p-3 border ${category.color.replace('from-', 'border-').replace('-500', '-500/25').split(' ')[0]}`}>
                      <div className="text-2xl mb-2">{category.icon}</div>
                      <div className="font-bold text-white text-sm">{category.name}</div>
           
                    </div>
                  ))}
                </div>
              </div>

              {/* إحصائيات الأسئلة */}
   
            </div>
          </div>

          {/* أزرار التحكم */}
          <div className="text-center space-y-6">
            {/* زر البدء */}
            <button
              onClick={startGame}
              disabled={!isClient}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-violet-500 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className={`relative px-12 py-6 rounded-3xl font-bold text-2xl transition-all duration-300 hover:scale-105 border-2 border-purple-400/50 ${
                isClient 
                  ? 'bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white'
                  : 'bg-gray-500 cursor-not-allowed opacity-50 text-gray-300'
              }`}>
                <div className="flex items-center gap-3">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2 1 1 0 100-2zm0 5a1 1 0 100 2 1 1 0 000-2zm4-5a1 1 0 100 2 1 1 0 000-2zm0 5a1 1 0 100 2 1 1 0 000-2zm-2 5a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"/>
                  </svg>
                  ابدأ  
                </div>
              </div>
            </button>

            {/* زر إعادة تعيين الأسئلة المستخدمة */}
      
          </div>

          {/* معلومات إضافية */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center justify-center space-x-8 space-x-reverse bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-8 py-4">
              <div className="flex items-center space-x-2 space-x-reverse text-gray-300">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span>10 جولات</span>
              </div>
              <div className="w-px h-6 bg-white/20"></div>
              <div className="flex items-center space-x-2 space-x-reverse text-gray-300">
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
                <span>6 فئات</span>
              </div>
              <div className="w-px h-6 bg-white/20"></div>
              <div className="flex items-center space-x-2 space-x-reverse text-gray-300">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                <span>نردين </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // شاشة الانتظار (اللعب)
  if (gamePhase === 'waiting' || gamePhase === 'rolling' || gamePhase === 'questioning') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-violet-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="text-2xl md:text-3xl font-black text-white tracking-wider">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-violet-500">
                النرد 
              </span>
            </div>
            <Link 
              href="/" 
              className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              ← العودة للرئيسية
            </Link>
          </div>

          {/* معلومات الجولة */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-6 px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
              <div className="text-center">
                <div className="text-purple-400 font-bold text-lg">الجولة {roundNumber}</div>
                <div className="text-gray-400 text-sm">من {maxRounds}</div>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div className="text-center">
                <div className={`font-bold text-lg ${currentTurn === 'red' ? 'text-red-400' : 'text-blue-400'}`}>
                  دور {currentTurn === 'red' ? teams[0].name : teams[1].name}
                </div>
                <div className="text-gray-400 text-sm">اللاعب الحالي</div>
              </div>
            </div>
          </div>

          {/* نقاط الفرق */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {teams.map((team, index) => (
              <div 
                key={team.color}
                className={`p-6 bg-white/5 backdrop-blur-xl border rounded-3xl transition-all duration-300 ${
                  team.color === currentTurn
                    ? 'border-purple-500/50 shadow-lg shadow-purple-500/25 ring-2 ring-purple-400/50'
                    : 'border-white/10'
                }`}
              >
                <div className="text-center">
                  <h3 className={`text-2xl font-bold mb-2 ${
                    team.color === 'red' ? 'text-red-400' : 'text-blue-400'
                  }`}>
                    {team.name}
                  </h3>
                  <p className="text-4xl font-bold text-white mb-2">{team.score}</p>
                  <p className="text-gray-400">
                    {team.color === currentTurn ? '🎯 دوره الآن' : '⏳ ينتظر'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* منطقة النرد */}
          {gamePhase !== 'questioning' && (
            <div className="max-w-6xl mx-auto mb-8">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                <h3 className="text-2xl font-bold text-center mb-8 text-white">
                  {gamePhase === 'waiting' && 'اضغط لرمي النردين! 🎲'}
                  {gamePhase === 'rolling' && 'جاري رمي النردين... 🎯'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8">
                  {/* نرد نوع السؤال */}
                  <div className="text-center">
                    <h4 className="text-lg font-bold text-emerald-400 mb-4">🎯 نوع السؤال</h4>
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
                    <h4 className="text-lg font-bold text-yellow-400 mb-4">⭐ عدد النقاط</h4>
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
                      disabled={stats.remainingCount === 0 || isProcessing}
                      className="group relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className={`relative px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 ${
                        stats.remainingCount === 0 || isProcessing
                          ? 'bg-gray-500 cursor-not-allowed opacity-50 text-gray-300' 
                          : 'bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white'
                      }`}>
                        {stats.remainingCount === 0 ? '❌ لا توجد أسئلة' : '🎲 ارمِ النردين!'}
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* منطقة السؤال */}
          {gamePhase === 'questioning' && currentQuestion && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                {/* معلومات السؤال */}
                <div className="text-center mb-6">
                  <div className={`inline-block px-6 py-3 rounded-2xl mb-4 bg-gradient-to-r ${currentQuestion.categoryColor}`}>
                    <span className="text-2xl mr-2">{currentQuestion.categoryIcon}</span>
                    <span className="text-white font-bold text-lg">{currentQuestion.category}</span>
                    <span className="text-white font-bold ml-4 bg-white/20 px-3 py-1 rounded-full">
                      {currentQuestion.points} نقطة
                    </span>
                  </div>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-center mb-8 text-white">
                  {currentQuestion.question}
                </h3>

                {!showAnswer ? (
                  <div className="text-center">
                    <button
                      onClick={finishAnswering}
                      className="group relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105">
                        ✅ انتهيت من الإجابة
                      </div>
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* عرض الإجابة */}
                    <div className="bg-white/10 border border-emerald-500/30 rounded-2xl p-6 mb-8 text-center">
                      <h4 className="text-emerald-400 font-bold text-xl mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        الإجابة الصحيحة
                      </h4>
                      <p className="text-2xl text-white font-bold">{currentQuestion.answer}</p>
                    </div>

                    {/* أزرار التقييم */}
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-lg text-gray-300 mb-4">من أجاب إجابة صحيحة؟</p>
                      </div>
                      
                      <div className="flex flex-wrap justify-center gap-6">
                        <button
                          onClick={() => awardPoints(0)}
                          disabled={isProcessing}
                          className="group relative"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className={`relative px-6 py-3 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 ${
                            isProcessing 
                              ? 'bg-gray-500 cursor-not-allowed opacity-50 text-gray-300' 
                              : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white'
                          }`}>
                            🔴 {teams[0].name}
                          </div>
                        </button>
                        
                        <button
                          onClick={() => awardPoints(1)}
                          disabled={isProcessing}
                          className="group relative"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className={`relative px-6 py-3 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 ${
                            isProcessing 
                              ? 'bg-gray-500 cursor-not-allowed opacity-50 text-gray-300' 
                              : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white'
                          }`}>
                            🔵 {teams[1].name}
                          </div>
                        </button>
                        
                        <button
                          onClick={noCorrectAnswer}
                          disabled={isProcessing}
                          className="group relative"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-gray-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className={`relative px-6 py-3 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 ${
                            isProcessing 
                              ? 'bg-gray-500 cursor-not-allowed opacity-50 text-gray-300' 
                              : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white'
                          }`}>
                            ❌ لا أحد
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // شاشة انتهاء اللعبة
  if (gamePhase === 'finished') {
    const winner = teams.reduce((prev, current) => (prev.score > current.score) ? prev : current);
    const loser = teams.find(team => team !== winner);
    const isTie = teams[0].score === teams[1].score;

    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-violet-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 p-6 md:p-8 flex items-center justify-center min-h-screen">
          <div className="max-w-4xl mx-auto text-center">
            {/* Header */}
            <div className="flex justify-between items-center mb-12 w-full">
              <div className="text-2xl md:text-3xl font-black text-white tracking-wider">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-violet-500">
                  النرد
                </span>
              </div>
              <Link 
                href="/" 
                className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105"
              >
                ← العودة للرئيسية
              </Link>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12">
              {/* تاج النصر */}
              <div className="mb-8">
                <div className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center shadow-2xl ${
                  isTie 
                    ? 'bg-gradient-to-br from-gray-400 to-gray-600 shadow-gray-500/50'
                    : 'bg-gradient-to-br from-purple-400 to-violet-500 shadow-purple-500/50'
                }`}>
                  <span className="text-6xl">
                    {isTie ? '🤝' : '🏆'}
                  </span>
                </div>
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-500 mb-8">
                🎲 انتهت اللعبة!
              </h1>

              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
                {isTie ? 'تعادل!' : `الفائز: ${winner.name}! 🎊`}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className={`rounded-2xl p-6 border ${
                  isTie 
                    ? 'bg-white/5 border-gray-500/30'
                    : winner.color === 'red'
                      ? 'bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-500/30'
                      : 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-blue-500/30'
                }`}>
                  <h3 className={`text-2xl font-bold mb-4 ${
                    isTie ? 'text-gray-400' : teams[0].color === 'red' ? 'text-red-400' : 'text-blue-400'
                  }`}>
                    {isTie ? '🏆' : teams[0] === winner ? '🥇' : '🥈'} {teams[0].name}
                  </h3>
                  <p className="text-3xl font-bold text-white mb-2">{teams[0].score}</p>
                  <p className="text-xl text-gray-300">نقطة</p>
                </div>
                
                <div className={`rounded-2xl p-6 border ${
                  isTie 
                    ? 'bg-white/5 border-gray-500/30'
                    : teams[1] === winner
                      ? 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-blue-500/30'
                      : 'bg-white/5 border-gray-500/30'
                }`}>
                  <h3 className={`text-2xl font-bold mb-4 ${
                    isTie ? 'text-gray-400' : teams[1] === winner ? 'text-blue-400' : 'text-gray-400'
                  }`}>
                    {isTie ? '🏆' : teams[1] === winner ? '🥇' : '🥈'} {teams[1].name}
                  </h3>
                  <p className="text-3xl font-bold text-white mb-2">{teams[1].score}</p>
                  <p className="text-xl text-gray-300">نقطة</p>
                </div>
              </div>

              <button
                onClick={resetGame}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl font-bold text-xl transition-all duration-300 hover:scale-105">
                  🔄 لعبة جديدة
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}