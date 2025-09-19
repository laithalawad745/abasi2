// components/AuctionGame.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { auctionGameData, getAllCategories, getCategoryStats } from '../app/data/auctionGameData';

export default function AuctionGame() {
  // حالة اللعبة
  const [gamePhase, setGamePhase] = useState('setup'); // 'setup', 'bidding', 'questioning', 'finished'
  const [currentRound, setCurrentRound] = useState(1);
  const [maxRounds] = useState(10);
  const [isClient, setIsClient] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // حالة الفرق
  const [teams, setTeams] = useState([
    { name: 'الفريق الأحمر', color: 'red', score: 0 },
    { name: 'الفريق الأزرق', color: 'blue', score: 0 }
  ]);
  
  // حالة المزايدة
  const [currentOwner, setCurrentOwner] = useState('blue'); // من يملك السؤال حالياً
  const [currentBidder, setCurrentBidder] = useState('red'); // من دوره في المزايدة
  const [currentBid, setCurrentBid] = useState(50);
  const [bidIncrement, setBidIncrement] = useState(50);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [questionCategory, setQuestionCategory] = useState(null);
  
  // 🆕 نظام إدارة الأسئلة المستخدمة
  const [usedQuestions, setUsedQuestions] = useState([]);

  // Client-side mounting وتحميل الأسئلة المستخدمة
  useEffect(() => {
    setIsClient(true);
    
    // 🔄 تحميل الأسئلة المستخدمة من localStorage
    const savedUsedQuestions = localStorage.getItem('auction-used-questions');
    if (savedUsedQuestions) {
      setUsedQuestions(JSON.parse(savedUsedQuestions));
      console.log('📊 تم تحميل', JSON.parse(savedUsedQuestions).length, 'سؤال مستخدم');
    }
  }, []);

  // 💾 حفظ الأسئلة المستخدمة عند تغييرها
  useEffect(() => {
    if (isClient && usedQuestions.length > 0) {
      localStorage.setItem('auction-used-questions', JSON.stringify(usedQuestions));
      console.log('💾 تم حفظ الأسئلة المستخدمة:', usedQuestions.length);
    }
  }, [usedQuestions, isClient]);

  // 🗑️ إعادة تعيين الأسئلة المستخدمة فقط
  const resetUsedQuestions = () => {
    setUsedQuestions([]);
    localStorage.removeItem('auction-used-questions');
    console.log('🗑️ تم مسح جميع الأسئلة المستخدمة');
  };

  // بدء اللعبة
  const startGame = () => {
    if (!isClient) return;
    setGamePhase('bidding');
    setIsProcessing(false);
    startNewRound();
    console.log('🎮 بدء لعبة المزاد مع', usedQuestions.length, 'سؤال مستخدم مسبقاً');
  };

  // بدء جولة جديدة
  const startNewRound = () => {
    const questionData = getRandomQuestion();
    if (!questionData) {
      console.warn('⚠️ لا توجد أسئلة جديدة، سيتم استخدام سؤال مكرر...');
      // استخدم سؤال مكرر إذا لم تجد أسئلة جديدة
      const newQuestionData = getRandomQuestionIgnoreUsed();
      if (newQuestionData) {
        setCurrentQuestion(newQuestionData.question);
        setQuestionCategory(newQuestionData.category);
        setUsedQuestions(prev => [...prev, newQuestionData.question.id]);
      }
    } else {
      setCurrentQuestion(questionData.question);
      setQuestionCategory(questionData.category);
      setUsedQuestions(prev => [...prev, questionData.question.id]);
    }
    
    setCurrentBid(50);
    setBidIncrement(50);
    setCurrentOwner('blue');
    setCurrentBidder('red');
    setShowAnswer(false);
    setIsProcessing(false);
  };

  // 🆕 الحصول على سؤال عشوائي (مع تجنب الأسئلة المستخدمة)
  const getRandomQuestion = () => {
    const categories = getAllCategories();
    let availableQuestions = [];
    
    categories.forEach(category => {
      const categoryQuestions = auctionGameData[category].filter(
        question => !usedQuestions.includes(question.id)
      );
      categoryQuestions.forEach(question => {
        availableQuestions.push({
          question,
          category
        });
      });
    });
    
    if (availableQuestions.length === 0) {
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    return availableQuestions[randomIndex];
  };

  // 🔄 الحصول على سؤال عشوائي (تجاهل المستخدمة)
  const getRandomQuestionIgnoreUsed = () => {
    const categories = getAllCategories();
    let allQuestions = [];
    
    categories.forEach(category => {
      auctionGameData[category].forEach(question => {
        allQuestions.push({
          question,
          category
        });
      });
    });
    
    if (allQuestions.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * allQuestions.length);
    return allQuestions[randomIndex];
  };

  // زيادة المزايدة
  const increaseBid = () => {
    if (isProcessing) return;
    setCurrentBid(prev => prev + bidIncrement);
    setCurrentOwner(currentBidder);
    setCurrentBidder(currentBidder === 'red' ? 'blue' : 'red');
  };

  // رفض المزايدة (باس)
  const passBid = () => {
    if (isProcessing) return;
    setGamePhase('questioning');
  };

  // إجابة صحيحة
  const correctAnswer = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    setTeams(prev => prev.map(team => 
      team.color === currentOwner 
        ? { ...team, score: team.score + currentBid }
        : team
    ));
    
    setTimeout(() => nextRound(), 1500);
  };

  // إجابة خاطئة
  const wrongAnswer = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    setTeams(prev => prev.map(team => 
      team.color === currentOwner 
        ? { ...team, score: team.score - currentBid }
        : team
    ));
    
    setTimeout(() => nextRound(), 1500);
  };

  // الجولة التالية
  const nextRound = () => {
    if (currentRound >= maxRounds) {
      setGamePhase('finished');
      return;
    }
    
    setCurrentRound(prev => prev + 1);
    setGamePhase('bidding');
    setTimeout(() => {
      startNewRound();
    }, 1000);
  };

  // إعادة تعيين اللعبة
  const resetGame = () => {
    setGamePhase('setup');
    setCurrentRound(1);
    setIsProcessing(false);
    setTeams([
      { name: 'الفريق الأحمر', color: 'red', score: 0 },
      { name: 'الفريق الأزرق', color: 'blue', score: 0 }
    ]);
    setUsedQuestions([]);
    localStorage.removeItem('auction-used-questions');
    console.log('🔄 تم إعادة تعيين لعبة المزاد');
  };

  // زيادة/تقليل قيمة الزيادة
  const adjustIncrement = (change) => {
    setBidIncrement(prev => Math.max(50, prev + change));
  };

  // 📊 حساب إحصائيات الأسئلة
  const getUsageStats = () => {
    const stats = getCategoryStats();
    const totalQuestions = Object.values(stats).reduce((sum, count) => sum + count, 0);
    
    return {
      total: totalQuestions,
      used: usedQuestions.length,
      remaining: totalQuestions - usedQuestions.length,
      categories: stats
    };
  };

  // شاشة الإعداد
  if (gamePhase === 'setup') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-yellow-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        {/* المحتوى الرئيسي */}
        <div className="relative z-10 p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <div className="text-4xl md:text-5xl font-black text-white tracking-wider">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-500">
                المزاد
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
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-600">
                المزاد
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 font-light max-w-2xl mx-auto">
              زايد على الأسئلة واربح أعلى النقاط
            </p>
          </div>

          {/* قواعد اللعبة */}
          <div className="max-w-6xl mx-auto mb-12">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400 mb-8">
                 قواعد المزاد
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-white/5 rounded-2xl border border-amber-500/30">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-amber-400 mb-2">نظام المزايدة</h3>
                  <p className="text-gray-300">زايد على الأسئلة بقيم متزايدة</p>
                </div>
                
                <div className="text-center p-6 bg-white/5 rounded-2xl border border-green-500/30">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-green-400 mb-2">إجابة صحيحة</h3>
                  <p className="text-gray-300">اكسب النقاط حسب قيمة المزايدة</p>
                </div>
                
                <div className="text-center p-6 bg-white/5 rounded-2xl border border-red-500/30">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-red-400 mb-2">إجابة خاطئة</h3>
                  <p className="text-gray-300">اخسر النقاط حسب قيمة المزايدة</p>
                </div>
              </div>

              {/* فئات الأسئلة */}
              <div className="bg-white/5 rounded-2xl p-6 border border-purple-500/30 mb-6">
                <h3 className="text-purple-400 font-bold text-lg mb-4 text-center">📚 فئات الأسئلة</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center text-sm">
                  {Object.entries(getUsageStats().categories).map(([category, count]) => (
                    <div key={category} className="bg-gradient-to-br from-purple-500/15 to-purple-600/15 rounded-xl p-3 border border-purple-500/25">
                      <div className="font-bold text-purple-400 text-sm">{category}</div>
                   
                    </div>
                  ))}
                </div>
              </div>

              {/* 🆕 إحصائيات الأسئلة */}
          
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
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className={`relative px-12 py-6 rounded-3xl font-bold text-2xl transition-all duration-300 hover:scale-105 border-2 border-amber-400/50 ${
                isClient 
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white'
                  : 'bg-gray-500 cursor-not-allowed opacity-50 text-gray-300'
              }`}>
                <div className="flex items-center gap-3">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                  </svg>
                  ابدأ المزاد!
                </div>
              </div>
            </button>

            {/* 🆕 زر إعادة تعيين الأسئلة المستخدمة */}
      
          </div>

          {/* معلومات إضافية */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center justify-center space-x-8 space-x-reverse bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-8 py-4">
              <div className="flex items-center space-x-2 space-x-reverse text-gray-300">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                <span>10 جولات</span>
              </div>
              <div className="w-px h-6 bg-white/20"></div>
              <div className="flex items-center space-x-2 space-x-reverse text-gray-300">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span>مزايدة </span>
              </div>
              <div className="w-px h-6 bg-white/20"></div>
              <div className="flex items-center space-x-2 space-x-reverse text-gray-300">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                <span>فئات متنوعة</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // شاشة المزايدة
  if (gamePhase === 'bidding') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-yellow-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="text-2xl md:text-3xl font-black text-white tracking-wider">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-500">
                المزاد
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
                <div className="text-amber-400 font-bold text-lg">الجولة {currentRound}</div>
                <div className="text-gray-400 text-sm">من {maxRounds}</div>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div className="text-center">
                <div className="text-white font-bold text-lg">{questionCategory}</div>
                <div className="text-gray-400 text-sm">فئة السؤال</div>
              </div>
            </div>
          </div>

          {/* نقاط الفرق */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {teams.map((team, index) => (
              <div 
                key={team.color}
                className={`p-6 bg-white/5 backdrop-blur-xl border rounded-3xl transition-all duration-300 ${
                  team.color === currentOwner
                    ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/25'
                    : 'border-white/10'
                }`}
              >
                <div className="text-center">
                  <h3 className={`text-2xl font-bold mb-2 ${
                    team.color === 'red' ? 'text-red-400' : 'text-blue-400'
                  }`}>
                    {team.name}
                  </h3>
                  <p className="text-3xl font-bold text-white mb-2">{team.score}</p>
                  <p className="text-gray-400 text-sm">
                    {team.color === currentOwner ? ' يملك السؤال' : '⏳ ينتظر'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* منطقة المزايدة */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              {/* معلومات المزايدة الحالية */}
              <div className="text-center mb-8">
                <div className="bg-white/10 border border-amber-500/30 rounded-2xl p-6 mb-6">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    المزايدة الحالية: {currentBid} نقطة
                  </h3>
                  <p className="text-lg text-gray-300 mb-4">
                    <span className={`font-bold ${currentOwner === 'red' ? 'text-red-400' : 'text-blue-400'}`}>
                      {currentOwner === 'red' ? 'الفريق الأحمر' : 'الفريق الأزرق'}
                    </span> يملك السؤال حالياً
                  </p>
                  <p className="text-lg text-gray-300">
                    هل <span className={`font-bold ${currentBidder === 'red' ? 'text-red-400' : 'text-blue-400'}`}>
                      {currentBidder === 'red' ? 'الفريق الأحمر' : 'الفريق الأزرق'}
                    </span> يريد المزايدة؟
                  </p>
                </div>
              </div>

              {/* أزرار التحكم في قيمة الزيادة */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-4 bg-white/5 rounded-2xl p-4 border border-white/10">
                  <button
                    onClick={() => adjustIncrement(-50)}
                    disabled={bidIncrement <= 50}
                    className={`w-12 h-12 rounded-full font-bold transition-all duration-300 ${
                      bidIncrement <= 50 
                        ? 'bg-gray-500 cursor-not-allowed opacity-50 text-gray-300'
                        : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover:scale-105'
                    }`}
                  >
                    -
                  </button>
                  <div className="text-center px-4">
                    <div className="text-white font-bold text-xl">الزيادة</div>
                    <div className="text-amber-400 font-bold text-2xl">{bidIncrement}</div>
                  </div>
                  <button
                    onClick={() => adjustIncrement(50)}
                    className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full font-bold transition-all duration-300 hover:scale-105"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* أزرار المزايدة */}
              <div className="flex flex-col md:flex-row gap-6 justify-center">
                <button
                  onClick={increaseBid}
                  disabled={isProcessing}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className={`relative px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 ${
                    isProcessing 
                      ? 'bg-gray-500 cursor-not-allowed opacity-50 text-gray-300' 
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                  }`}>
                     زايد بـ {currentBid + bidIncrement} نقطة
                  </div>
                </button>
                
                <button
                  onClick={passBid}
                  disabled={isProcessing}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className={`relative px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 ${
                    isProcessing 
                      ? 'bg-gray-500 cursor-not-allowed opacity-50 text-gray-300' 
                      : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                  }`}>
                     رفض المزايدة
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // شاشة الأسئلة
  if (gamePhase === 'questioning') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-yellow-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="text-2xl md:text-3xl font-black text-white tracking-wider">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-500">
                المزاد  
              </span>
            </div>
            <div className="text-center">
              <div className="text-amber-400 font-bold">الجولة {currentRound}</div>
              <div className="text-gray-400 text-sm">من {maxRounds}</div>
            </div>
          </div>

          {/* معلومات الفائز بالمزاد */}
          <div className="text-center mb-8">
            <div className={`inline-block px-8 py-4 rounded-2xl border-2 ${
              currentOwner === 'red' 
                ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-500/50'
                : 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-blue-500/50'
            }`}>
              <h2 className={`text-2xl font-bold ${currentOwner === 'red' ? 'text-red-400' : 'text-blue-400'}`}>
                {currentOwner === 'red' ? 'الفريق الأحمر' : 'الفريق الأزرق'}
              </h2>
              <p className="text-white">فاز بالسؤال بـ {currentBid} نقطة</p>
              <p className="text-gray-300 text-sm">فئة: {questionCategory}</p>
            </div>
          </div>

          {/* السؤال */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-center text-white mb-8">
                {currentQuestion?.question}
              </h3>

              {!showAnswer ? (
                <div className="text-center">
                  <button
                    onClick={() => setShowAnswer(true)}
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
                    <p className="text-2xl text-white font-bold">{currentQuestion?.answer}</p>
                  </div>

                  {/* أزرار التقييم */}
                  <div className="flex flex-wrap justify-center gap-6">
                    <button
                      onClick={correctAnswer}
                      disabled={isProcessing}
                      className="group relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className={`relative px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 ${
                        isProcessing 
                          ? 'bg-gray-500 cursor-not-allowed opacity-50 text-gray-300' 
                          : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                      }`}>
                        ✅ إجابة صحيحة (+{currentBid})
                      </div>
                    </button>
                    
                    <button
                      onClick={wrongAnswer}
                      disabled={isProcessing}
                      className="group relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className={`relative px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 ${
                        isProcessing 
                          ? 'bg-gray-500 cursor-not-allowed opacity-50 text-gray-300' 
                          : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                      }`}>
                        ❌ إجابة خاطئة (-{currentBid})
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
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
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-yellow-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 p-6 md:p-8 flex items-center justify-center min-h-screen">
          <div className="max-w-4xl mx-auto text-center">
            {/* Header */}
            <div className="flex justify-between items-center mb-12 w-full">
              <div className="text-2xl md:text-3xl font-black text-white tracking-wider">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-500">
                  المزاد
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
                    : 'bg-gradient-to-br from-amber-400 to-yellow-500 shadow-amber-500/50'
                }`}>
                  <span className="text-6xl">
                    {isTie ? '🤝' : '🏆'}
                  </span>
                </div>
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500 mb-8">
                🏆 انتهى المزاد!
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
                    isTie ? 'text-gray-400' : winner.color === 'red' ? 'text-red-400' : 'text-blue-400'
                  }`}>
                    {isTie ? '🏆' : '🥇'} {teams[0].name}
                  </h3>
                  <p className="text-3xl font-bold text-white mb-2">{teams[0].score}</p>
                  <p className="text-xl text-gray-300">نقطة</p>
                </div>
                
                <div className={`rounded-2xl p-6 border ${
                  isTie 
                    ? 'bg-white/5 border-gray-500/30'
                    : loser.color === 'red'
                      ? 'bg-white/5 border-gray-500/30'
                      : 'bg-white/5 border-gray-500/30'
                }`}>
                  <h3 className={`text-2xl font-bold mb-4 ${
                    isTie ? 'text-gray-400' : 'text-gray-400'
                  }`}>
                    {isTie ? '🏆' : '🥈'} {teams[1].name}
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
                  🔄 مزاد جديد
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